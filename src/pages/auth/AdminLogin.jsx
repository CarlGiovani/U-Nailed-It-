import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { adminAuthLogin } from "../../services/BACKEND/adminAuthApi";
import "../../styles/AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await adminAuthLogin(form);

      localStorage.setItem("admin_session", JSON.stringify(res.session));
      localStorage.setItem(
        "admin_user",
        JSON.stringify({
          ...res.user,
          ...res.profile,
        }),
      );

      setSuccessModal(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="logo-wrapper">
          <img src={logo} alt="UNAILEDIT" className="logo" />
        </div>

        <h2>Welcome Back</h2>
        <p className="subtitle">Log in to manage your business</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
            <label className={form.email ? "filled" : ""}></label>
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
            <label className={form.password ? "filled" : ""}></label>
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? <span className="spinner"></span> : "Log in"}
          </button>
        </form>

        <button
          type="button"
          className="forgot-link-btn"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot password?
        </button>
      </div>

      {successModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h3>Login Successful</h3>
            <p>Redirecting to dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
