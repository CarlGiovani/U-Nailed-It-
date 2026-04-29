import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { forgotPassword } from "../../services/BACKEND/adminAuthApi";
import "../../styles/AdminLogin.css";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emailIsValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!emailIsValid) {
      setError("Please enter a valid email address.");
      return;
    }

    if (cooldown > 0) {
      setError(
        `Please wait ${cooldown}s before requesting another reset link.`,
      );
      return;
    }

    setLoading(true);

    try {
      const res = await forgotPassword(email.trim());

      setSuccess(
        res.message || "If that email exists, a reset link has been sent.",
      );

      setCooldown(60);
    } catch (err) {
      const backendError =
        err.response?.data?.error || "Failed to send reset email.";

      if (
        backendError.toLowerCase().includes("rate limit") ||
        backendError.toLowerCase().includes("too many requests")
      ) {
        setError(
          "Too many reset requests were made. Please wait a bit before trying again.",
        );
        setCooldown(60);
      } else {
        setError(backendError);
      }
    } finally {
      setLoading(false);
    }
  };

  const submitDisabled =
    loading || cooldown > 0 || !email.trim() || (touched && !emailIsValid);

  return (
    <div className="admin-login-container forgot-page">
      <div className="admin-login-card forgot-card">
        <div className="logo-wrapper forgot-logo-wrapper">
          <img src={logo} alt="UNAILEDIT" className="logo forgot-logo" />
        </div>

        <div className="forgot-header">
          <h2 className="forgot-title">Forgot Password</h2>
          <p className="subtitle forgot-subtitle">
            Enter your admin email address and we’ll send you a password reset
            link.
          </p>
        </div>

        {error && (
          <div className="error-box forgot-alert" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="success-box forgot-alert" role="status">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="input-group forgot-input-group">
            <input
              type="email"
              name="email"
              placeholder="Admin email address"
              value={email}
              autoFocus
              autoComplete="email"
              onBlur={() => setTouched(true)}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              className={touched && email && !emailIsValid ? "input-error" : ""}
              required
            />
          </div>

          <p className="forgot-helper">
            Use the email linked to your admin account.
          </p>

          {touched && email && !emailIsValid && (
            <div className="field-error">
              Please enter a valid email format.
            </div>
          )}

          <button
            type="submit"
            disabled={submitDisabled}
            className="login-btn forgot-submit-btn"
          >
            {loading ? (
              <span className="spinner"></span>
            ) : cooldown > 0 ? (
              `Try Again in ${cooldown}s`
            ) : success ? (
              "Resend Reset Link"
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="forgot-footer">
          <button
            type="button"
            className="forgot-back-btn"
            onClick={() => navigate("/")}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
