import { useEffect, useState } from "react";
import Sidebar from "../../components/layout/sidebar";
import {
  changePassword,
  createAdminAccount,
  getAdminProfileById,
} from "../../services/BACKEND/adminAuthApi";
import "../../styles/settings.css";

const Settings = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [createAdminForm, setCreateAdminForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
  });

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [createAdminLoading, setCreateAdminLoading] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [createMessage, setCreateMessage] = useState("");
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setProfileLoading(true);
        const res = await getAdminProfileById(); // Assuming you have the admin ID available
        setAdminProfile(res.profile || null);
      } catch (err) {
        console.error("Failed to load admin profile:", err);
        setAdminProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateAdminChange = (e) => {
    const { name, value } = e.target;
    setCreateAdminForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    try {
      setPasswordLoading(true);

      const res = await changePassword({
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordMessage(res.message || "Password updated successfully.");
      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(
        err.response?.data?.error || "Failed to change password.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreateMessage("");
    setCreateError("");

    try {
      setCreateAdminLoading(true);

      const res = await createAdminAccount({
        full_name: createAdminForm.full_name,
        username: createAdminForm.username,
        email: createAdminForm.email,
        password: createAdminForm.password,
      });

      setCreateMessage(res.message || "Admin account created successfully.");
      setCreateAdminForm({
        full_name: "",
        username: "",
        email: "",
        password: "",
      });
    } catch (err) {
      setCreateError(
        err.response?.data?.error || "Failed to create admin account.",
      );
    } finally {
      setCreateAdminLoading(false);
    }
  };

  return (
    <div className="settings-layout">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="settings-main">
        <div className="settings-topbar">
          <button
            className="settings-mobile-menu"
            onClick={() => setMobileOpen(true)}
          >
            ☰
          </button>
          <div>
            <h1>Settings</h1>
            <p>Manage your admin account and security settings.</p>
          </div>
        </div>

        <div className="settings-grid">
          <section className="settings-card">
            <div className="card-header">
              <h2>Admin Information</h2>
              <span className="card-badge">Account</span>
            </div>

            <div className="info-list">
              <div className="info-row">
                <span>Full Name</span>
                <strong>
                  {profileLoading
                    ? "Loading..."
                    : adminProfile?.full_name || "N/A"}
                </strong>
              </div>

              <div className="info-row">
                <span>Username</span>
                <strong>
                  {profileLoading
                    ? "Loading..."
                    : adminProfile?.username || "N/A"}
                </strong>
              </div>

              <div className="info-row">
                <span>Email</span>
                <strong>
                  {profileLoading ? "Loading..." : adminProfile?.email || "N/A"}
                </strong>
              </div>

              <div className="info-row">
                <span>Role</span>
                <strong>
                  {profileLoading
                    ? "Loading..."
                    : adminProfile?.role || "Admin"}
                </strong>
              </div>
            </div>
          </section>

          <section className="settings-card">
            <div className="card-header">
              <h2>Change Password</h2>
              <span className="card-badge">Security</span>
            </div>

            {passwordError && (
              <div className="settings-alert error">{passwordError}</div>
            )}
            {passwordMessage && (
              <div className="settings-alert success">{passwordMessage}</div>
            )}

            <form onSubmit={handleChangePassword} className="settings-form">
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button
                type="submit"
                className="settings-btn primary"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </section>

          <section className="settings-card settings-card-full">
            <div className="card-header">
              <h2>Create Another Admin</h2>
              <span className="card-badge">Admin Access</span>
            </div>

            <p className="card-note">
              Only create another admin account for someone you fully trust.
              Admin accounts have full access to the system.
            </p>

            {createError && (
              <div className="settings-alert error">{createError}</div>
            )}
            {createMessage && (
              <div className="settings-alert success">{createMessage}</div>
            )}

            <form
              onSubmit={handleCreateAdmin}
              className="settings-form admin-form-grid"
            >
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={createAdminForm.full_name}
                  onChange={handleCreateAdminChange}
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={createAdminForm.username}
                  onChange={handleCreateAdminChange}
                  placeholder="Enter username"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={createAdminForm.email}
                  onChange={handleCreateAdminChange}
                  placeholder="Enter admin email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Temporary Password</label>
                <input
                  type="password"
                  name="password"
                  value={createAdminForm.password}
                  onChange={handleCreateAdminChange}
                  placeholder="Enter temporary password"
                  required
                />
              </div>

              <div className="form-actions full-width">
                <button
                  type="submit"
                  className="settings-btn gold"
                  disabled={createAdminLoading}
                >
                  {createAdminLoading ? "Creating..." : "Create Admin Account"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
