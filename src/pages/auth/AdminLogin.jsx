import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/AdminLogin.css";
import { adminAuthLogin } from "../../services/BACKEND/adminAuthApi";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      // save session
      localStorage.setItem("admin_session", JSON.stringify(res.session));
      localStorage.setItem("admin_user", JSON.stringify(res.user));

    
      alert("Login successful!");

      // comment muna navigation since wala pa dashboard
      navigate("/dashboard");

      
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>UNAILEDIT Admin</h2>
        <p>Login to manage your business</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Admin Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <span className="forgot-link">Forgot password?</span>
      </div>
    </div>
  );
};

export default AdminLogin;
