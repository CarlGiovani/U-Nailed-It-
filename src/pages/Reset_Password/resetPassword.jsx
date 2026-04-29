import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import supabase from "../../../config/supabaseClient";
import "../../styles/AdminLogin.css";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkRecoverySession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          setError(error.message || "Invalid or expired reset link.");
        } else if (!session) {
          setError("Invalid or expired reset link.");
        }
      } catch {
        if (mounted) {
          setError("Unable to verify reset session.");
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    checkRecoverySession();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (error) setError("");
  };

  const getPasswordStrength = (password) => {
    if (!password) return "";
    if (password.length < 8) return "Weak";
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)) {
      return "Strong";
    }
    return "Medium";
  };

  const passwordStrength = getPasswordStrength(form.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: form.newPassword,
      });

      if (error) throw error;

      setSuccess("Password reset successfully. Redirecting to login...");

      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/");
      }, 1800);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="admin-login-container reset-page">
        <div className="admin-login-card reset-card">
          <div className="logo-wrapper reset-logo-wrapper">
            <img src={logo} alt="UNAILEDIT" className="logo reset-logo" />
          </div>

          <h2 className="reset-title">Reset Password</h2>
          <p className="reset-subtitle">
            Verifying your reset link. Please wait...
          </p>

          <div className="reset-loading-text">Checking reset session...</div>
        </div>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="admin-login-container reset-page">
        <div className="admin-login-card reset-card">
          <div className="logo-wrapper reset-logo-wrapper">
            <img src={logo} alt="UNAILEDIT" className="logo reset-logo" />
          </div>

          <h2 className="reset-title">Reset Link Invalid</h2>
          <p className="reset-subtitle">
            This reset link is invalid, expired, or has already been used.
          </p>

          <div className="error-box reset-alert">{error}</div>

          <button
            type="button"
            className="reset-primary-btn"
            onClick={() => navigate("/forgot-password")}
          >
            Request New Reset Link
          </button>

          <button
            type="button"
            className="reset-secondary-btn"
            onClick={() => navigate("/admin/login")}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-container reset-page">
      <div className="admin-login-card reset-card">
        <div className="logo-wrapper reset-logo-wrapper">
          <img src={logo} alt="UNAILEDIT" className="logo reset-logo" />
        </div>

        <h2 className="reset-title">Reset Password</h2>
        <p className="reset-subtitle">
          Create a new password for your admin account.
        </p>

        {success && <div className="success-box reset-alert">{success}</div>}

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="reset-input-wrap">
            <label className="reset-label">New Password</label>
            <div className="reset-password-row">
              <input
                className="reset-input"
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Enter new password"
                value={form.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="reset-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>

            <div className="reset-helper">
              Use at least 8 characters. Stronger passwords include uppercase,
              lowercase, and numbers.
            </div>

            {form.newPassword && (
              <div
                className={`reset-strength reset-strength-${passwordStrength.toLowerCase()}`}
              >
                Password Strength: {passwordStrength}
              </div>
            )}
          </div>

          <div className="reset-input-wrap">
            <label className="reset-label">Confirm Password</label>
            <div className="reset-password-row">
              <input
                className="reset-input"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="reset-toggle-btn"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {error && <div className="error-box reset-alert">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="reset-primary-btn"
          >
            {loading ? "Updating Password..." : "Reset Password"}
          </button>

          <button
            type="button"
            className="reset-secondary-btn"
            onClick={() => navigate("/admin/login")}
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
