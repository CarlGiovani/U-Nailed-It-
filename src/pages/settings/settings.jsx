import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/layout/sidebar";
import Topbar from "../../components/layout/topbar";
import {
  changePassword,
  createAdminAccount,
  deleteCurrentAdminAccount,
  getAdminProfileById,
  getAllAdmins,
  updateCurrentAdminProfile,
} from "../../services/BACKEND/adminAuthApi";
import "../../styles/settings.css";

const ITEMS_PER_PAGE = 6;

const Settings = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [adminProfile, setAdminProfile] = useState(null);
  const [allAdmins, setAllAdmins] = useState([]);

  const [profileLoading, setProfileLoading] = useState(true);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [pageRefreshing, setPageRefreshing] = useState(false);

  const [editForm, setEditForm] = useState({
    full_name: "",
    username: "",
  });

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

  const [editLoading, setEditLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [createAdminLoading, setCreateAdminLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [editMessage, setEditMessage] = useState("");
  const [editError, setEditError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [createMessage, setCreateMessage] = useState("");
  const [createError, setCreateError] = useState("");

  const [pageError, setPageError] = useState("");

  const [adminSearch, setAdminSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  const [sectionOpen, setSectionOpen] = useState({
    profile: true,
    edit: true,
    password: false,
    admins: true,
    createAdmin: false,
    danger: false,
  });

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const [feedbackModal, setFeedbackModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "info", // success | error | info
  });

  const currentAdminId = adminProfile?.id || null;

  const sortedAdmins = useMemo(() => {
    if (!Array.isArray(allAdmins)) return [];

    return [...allAdmins].sort((a, b) => {
      if (a?.id === currentAdminId) return -1;
      if (b?.id === currentAdminId) return 1;
      return (a?.full_name || "").localeCompare(b?.full_name || "");
    });
  }, [allAdmins, currentAdminId]);

  const filteredAdmins = useMemo(() => {
    const keyword = adminSearch.trim().toLowerCase();

    if (!keyword) return sortedAdmins;

    return sortedAdmins.filter((admin) => {
      const fullName = admin?.full_name?.toLowerCase() || "";
      const username = admin?.username?.toLowerCase() || "";
      const email = admin?.email?.toLowerCase() || "";
      const role = admin?.role?.toLowerCase() || "";

      return (
        fullName.includes(keyword) ||
        username.includes(keyword) ||
        email.includes(keyword) ||
        role.includes(keyword)
      );
    });
  }, [sortedAdmins, adminSearch]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAdmins.length / ITEMS_PER_PAGE),
  );

  const paginatedAdmins = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAdmins.slice(startIndex, endIndex);
  }, [filteredAdmins, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [adminSearch]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const fetchSettingsData = async ({ silent = false } = {}) => {
    try {
      setPageError("");

      if (!silent) {
        setProfileLoading(true);
        setAdminsLoading(true);
      } else {
        setPageRefreshing(true);
      }

      const [profileRes, adminsRes] = await Promise.all([
        getAdminProfileById(),
        getAllAdmins(),
      ]);

      const profile = profileRes?.profile || null;
      const admins = adminsRes?.admins || [];

      setAdminProfile(profile);
      setAllAdmins(admins);

      setEditForm({
        full_name: profile?.full_name || "",
        username: profile?.username || "",
      });
    } catch (err) {
      console.error("Failed to load settings data:", err);
      setPageError(
        err?.response?.data?.error || "Failed to load settings data.",
      );
      setAdminProfile(null);
      setAllAdmins([]);
    } finally {
      setProfileLoading(false);
      setAdminsLoading(false);
      setPageRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const toggleSection = (key) => {
    setSectionOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const handleSearchChange = (e) => {
    setAdminSearch(e.target.value);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditMessage("");
    setEditError("");

    try {
      setEditLoading(true);

      const trimmedFullName = editForm.full_name.trim();
      const trimmedUsername = editForm.username.trim();

      const res = await updateCurrentAdminProfile({
        full_name: trimmedFullName,
        username: trimmedUsername,
      });

      setEditMessage(res?.message || "Profile updated successfully.");

      // gamitin ang backend profile kung meron, pero siguraduhin nating
      // updated talaga ang full_name at username gamit ang form values
      const updatedProfile = {
        ...(adminProfile || {}),
        ...(res?.profile || {}),
        full_name: trimmedFullName,
        username: trimmedUsername,
      };

      setAdminProfile(updatedProfile);

      setAllAdmins((prev) =>
        prev.map((admin) =>
          admin.id === updatedProfile.id
            ? { ...admin, ...updatedProfile }
            : admin,
        ),
      );

      const storedUser = JSON.parse(localStorage.getItem("admin_user") || "{}");

      const updatedAdminUser = {
        ...storedUser,
        ...updatedProfile,
        full_name: trimmedFullName,
        username: trimmedUsername,
      };

      localStorage.setItem("admin_user", JSON.stringify(updatedAdminUser));
      window.dispatchEvent(new Event("admin-user-updated"));
    } catch (err) {
      console.error("Failed to update profile:", err);
      setEditError(err?.response?.data?.error || "Failed to update profile.");
    } finally {
      setEditLoading(false);
    }
  };
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      setPasswordLoading(true);

      const res = await changePassword({
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordMessage(res?.message || "Password updated successfully.");
      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Failed to change password:", err);
      setPasswordError(
        err?.response?.data?.error || "Failed to change password.",
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
        full_name: createAdminForm.full_name.trim(),
        username: createAdminForm.username.trim(),
        email: createAdminForm.email.trim(),
        password: createAdminForm.password,
      });

      setCreateMessage(res?.message || "Admin account created successfully.");
      setCreateAdminForm({
        full_name: "",
        username: "",
        email: "",
        password: "",
      });

      setSectionOpen((prev) => ({
        ...prev,
        createAdmin: true,
        admins: true,
      }));

      setCurrentPage(1);
      await fetchSettingsData({ silent: true });
    } catch (err) {
      console.error("Failed to create admin account:", err);
      setCreateError(
        err?.response?.data?.error || "Failed to create admin account.",
      );
    } finally {
      setCreateAdminLoading(false);
    }
  };

  const proceedDeleteMyAccount = async () => {
    try {
      setDeleteLoading(true);

      const res = await deleteCurrentAdminAccount();

      setFeedbackModal({
        open: true,
        title: "Account Deleted",
        message:
          res?.message || "Your admin account has been deleted successfully.",
        type: "success",
      });

      localStorage.removeItem("admin_session");
      localStorage.removeItem("admin_user");
      localStorage.removeItem("admin_profile");

      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } catch (err) {
      console.error("Failed to delete account:", err);

      setFeedbackModal({
        open: true,
        title: "Delete Failed",
        message: err?.response?.data?.error || "Failed to delete your account.",
        type: "error",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteMyAccount = () => {
    setConfirmModal({
      open: true,
      title: "Delete My Account?",
      message:
        "Are you sure you want to permanently delete your admin account? This action cannot be undone.",
      onConfirm: proceedDeleteMyAccount,
    });
  };

  const adminCount = allAdmins.length;
  const currentRole = adminProfile?.role || "Admin";
  const currentDisplayName = adminProfile?.full_name || "Administrator";

  return (
    <div className="settings-layout">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="settings-content-area">
        <Topbar setMobileOpen={setMobileOpen} />

        {confirmModal.open && (
          <div className="custom-modal-overlay">
            <div className="custom-modal">
              <h3>{confirmModal.title}</h3>
              <p>{confirmModal.message}</p>

              <div className="custom-modal-actions">
                <button
                  type="button"
                  className="settings-btn ghost"
                  onClick={() =>
                    setConfirmModal({
                      open: false,
                      title: "",
                      message: "",
                      onConfirm: null,
                    })
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="settings-btn danger"
                  onClick={async () => {
                    const action = confirmModal.onConfirm;
                    setConfirmModal({
                      open: false,
                      title: "",
                      message: "",
                      onConfirm: null,
                    });
                    if (action) await action();
                  }}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {feedbackModal.open && (
          <div className="custom-modal-overlay">
            <div className="custom-modal">
              <h3>{feedbackModal.title}</h3>
              <p>{feedbackModal.message}</p>

              <div className="custom-modal-actions">
                <button
                  type="button"
                  className={`settings-btn ${
                    feedbackModal.type === "error" ? "danger" : "primary"
                  }`}
                  onClick={() =>
                    setFeedbackModal({
                      open: false,
                      title: "",
                      message: "",
                      type: "info",
                    })
                  }
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="settings-main">
          <div className="settings-page-header">
            <div className="settings-topbar-copy">
              <h1>Settings</h1>
              <p>
                Manage your admin profile, security, and administrator access
                with a cleaner, more compact workspace.
              </p>
            </div>
          </div>

          {pageError && <div className="settings-alert error">{pageError}</div>}
          {pageRefreshing && (
            <div className="settings-alert info">Refreshing admin data...</div>
          )}

          <section className="settings-hero-card">
            <div className="settings-hero-main">
              <div className="settings-avatar" aria-hidden="true">
                {currentDisplayName?.charAt(0)?.toUpperCase() || "A"}
              </div>

              <div className="settings-hero-text">
                <h2>
                  {profileLoading ? "Loading profile..." : currentDisplayName}
                </h2>
                <p>
                  {profileLoading
                    ? "Please wait while we load your account details."
                    : `${adminProfile?.email || "No email available"} • ${currentRole}`}
                </p>
              </div>
            </div>

            <div className="settings-hero-stats">
              <div className="mini-stat">
                <span>Total Admins</span>
                <strong>{adminsLoading ? "..." : adminCount}</strong>
              </div>

              <div className="mini-stat">
                <span>Your Username</span>
                <strong>
                  {profileLoading ? "..." : adminProfile?.username || "N/A"}
                </strong>
              </div>

              <div className="mini-stat">
                <span>Access Level</span>
                <strong>{profileLoading ? "..." : currentRole}</strong>
              </div>
            </div>
          </section>

          <div className="settings-shell">
            <div className="settings-left-column">
              <section className="settings-card compact-card">
                <button
                  type="button"
                  className="section-toggle"
                  onClick={() => toggleSection("profile")}
                >
                  <div>
                    <h3>Account Overview</h3>
                    <p>Your current admin information</p>
                  </div>
                  <span>{sectionOpen.profile ? "−" : "+"}</span>
                </button>

                {sectionOpen.profile && (
                  <div className="section-content">
                    <div className="info-grid-compact">
                      <div className="info-chip">
                        <span>Full Name</span>
                        <strong>
                          {profileLoading
                            ? "Loading..."
                            : adminProfile?.full_name || "N/A"}
                        </strong>
                      </div>

                      <div className="info-chip">
                        <span>Username</span>
                        <strong>
                          {profileLoading
                            ? "Loading..."
                            : adminProfile?.username || "N/A"}
                        </strong>
                      </div>

                      <div className="info-chip">
                        <span>Email</span>
                        <strong>
                          {profileLoading
                            ? "Loading..."
                            : adminProfile?.email || "N/A"}
                        </strong>
                      </div>

                      <div className="info-chip">
                        <span>Role</span>
                        <strong>
                          {profileLoading
                            ? "Loading..."
                            : adminProfile?.role || "Admin"}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="settings-card compact-card">
                <button
                  type="button"
                  className="section-toggle"
                  onClick={() => toggleSection("edit")}
                >
                  <div>
                    <h3>Edit Profile</h3>
                    <p>Update your full name and username</p>
                  </div>
                  <span>{sectionOpen.edit ? "−" : "+"}</span>
                </button>

                {sectionOpen.edit && (
                  <div className="section-content">
                    {editError && (
                      <div className="settings-alert error">{editError}</div>
                    )}
                    {editMessage && (
                      <div className="settings-alert success">
                        {editMessage}
                      </div>
                    )}

                    <form
                      onSubmit={handleUpdateProfile}
                      className="settings-form"
                    >
                      <div className="compact-two-grid">
                        <div className="form-group">
                          <label htmlFor="full_name">Full Name</label>
                          <input
                            id="full_name"
                            type="text"
                            name="full_name"
                            value={editForm.full_name}
                            onChange={handleEditFormChange}
                            placeholder="Enter full name"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="username">Username</label>
                          <input
                            id="username"
                            type="text"
                            name="username"
                            value={editForm.username}
                            onChange={handleEditFormChange}
                            placeholder="Enter username"
                          />
                        </div>
                      </div>

                      <div className="form-actions">
                        <button
                          type="submit"
                          className="settings-btn primary"
                          disabled={editLoading || profileLoading}
                        >
                          {editLoading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </section>

              <section className="settings-card compact-card">
                <button
                  type="button"
                  className="section-toggle"
                  onClick={() => toggleSection("password")}
                >
                  <div>
                    <h3>Change Password</h3>
                    <p>Secure your account with a new password</p>
                  </div>
                  <span>{sectionOpen.password ? "−" : "+"}</span>
                </button>

                {sectionOpen.password && (
                  <div className="section-content">
                    {passwordError && (
                      <div className="settings-alert error">
                        {passwordError}
                      </div>
                    )}
                    {passwordMessage && (
                      <div className="settings-alert success">
                        {passwordMessage}
                      </div>
                    )}

                    <form
                      onSubmit={handleChangePassword}
                      className="settings-form"
                    >
                      <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <div className="password-input-wrap">
                          <input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter new password"
                            required
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                          >
                            {showNewPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="confirmPassword">
                          Confirm Password
                        </label>
                        <div className="password-input-wrap">
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="Confirm new password"
                            required
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() =>
                              setShowConfirmPassword((prev) => !prev)
                            }
                          >
                            {showConfirmPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>

                      <div className="form-actions">
                        <button
                          type="submit"
                          className="settings-btn primary"
                          disabled={passwordLoading}
                        >
                          {passwordLoading ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </section>

              <section className="settings-card compact-card danger-card">
                <button
                  type="button"
                  className="section-toggle"
                  onClick={() => toggleSection("danger")}
                >
                  <div>
                    <h3>Danger Zone</h3>
                    <p>Permanent actions for your own account</p>
                  </div>
                  <span>{sectionOpen.danger ? "−" : "+"}</span>
                </button>

                {sectionOpen.danger && (
                  <div className="section-content">
                    <div className="danger-box">
                      <div>
                        <h4>Delete My Account</h4>
                        <p>
                          This permanently removes your own admin account and
                          cannot be undone.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="settings-btn danger"
                        onClick={handleDeleteMyAccount}
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? "Deleting..." : "Delete My Account"}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>

            <div className="settings-right-column">
              <section className="settings-card compact-card">
                <button
                  type="button"
                  className="section-toggle"
                  onClick={() => toggleSection("admins")}
                >
                  <div>
                    <h3>Admin Accounts</h3>
                    <p>View all administrators in a compact list</p>
                  </div>
                  <span>{sectionOpen.admins ? "−" : "+"}</span>
                </button>

                {sectionOpen.admins && (
                  <div className="section-content">
                    <div className="admin-toolbar">
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={handleSearchChange}
                        placeholder="Search by name, username, email, or role"
                      />

                      <div className="admin-toolbar-count">
                        {adminsLoading
                          ? "Loading..."
                          : `${filteredAdmins.length} result(s)`}
                      </div>
                    </div>

                    {adminsLoading ? (
                      <p className="card-note">Loading admin accounts...</p>
                    ) : filteredAdmins.length === 0 ? (
                      <p className="card-note">No admin accounts found.</p>
                    ) : (
                      <>
                        <div className="admin-list compact-admin-list">
                          {paginatedAdmins.map((admin) => {
                            const isCurrentUser = admin.id === currentAdminId;

                            return (
                              <div
                                className="admin-list-card compact-admin-card"
                                key={admin.id}
                              >
                                <div className="admin-card-head">
                                  <div className="admin-avatar">
                                    {(admin.full_name || admin.username || "A")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>

                                  <div className="admin-card-title-block">
                                    <div className="admin-list-title-row">
                                      <h4>{admin.full_name || "No Name"}</h4>
                                      {isCurrentUser && (
                                        <span className="you-badge">You</span>
                                      )}
                                    </div>
                                    <p className="admin-role-line">
                                      {admin.role || "Admin"}
                                    </p>
                                  </div>
                                </div>

                                <div className="admin-meta-grid">
                                  <div>
                                    <span>Username</span>
                                    <strong>{admin.username || "N/A"}</strong>
                                  </div>
                                  <div>
                                    <span>Email</span>
                                    <strong>{admin.email || "N/A"}</strong>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {totalPages > 1 && (
                          <div className="settings-pagination">
                            <button
                              type="button"
                              className="settings-btn ghost"
                              onClick={() => setCurrentPage((prev) => prev - 1)}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </button>

                            <div className="settings-pagination-info">
                              <span>
                                Page <strong>{currentPage}</strong> of{" "}
                                <strong>{totalPages}</strong>
                              </span>
                            </div>

                            <button
                              type="button"
                              className="settings-btn ghost"
                              onClick={() => setCurrentPage((prev) => prev + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </section>

              <section className="settings-card compact-card">
                <button
                  type="button"
                  className="section-toggle"
                  onClick={() => toggleSection("createAdmin")}
                >
                  <div>
                    <h3>Create Another Admin</h3>
                    <p>Add a new trusted administrator account</p>
                  </div>
                  <span>{sectionOpen.createAdmin ? "−" : "+"}</span>
                </button>

                {sectionOpen.createAdmin && (
                  <div className="section-content">
                    <p className="card-note">
                      Only create another admin account for someone you fully
                      trust. Admins have full access to the system.
                    </p>

                    {createError && (
                      <div className="settings-alert error">{createError}</div>
                    )}
                    {createMessage && (
                      <div className="settings-alert success">
                        {createMessage}
                      </div>
                    )}

                    <form
                      onSubmit={handleCreateAdmin}
                      className="settings-form"
                    >
                      <div className="compact-two-grid">
                        <div className="form-group">
                          <label htmlFor="create_full_name">Full Name</label>
                          <input
                            id="create_full_name"
                            type="text"
                            name="full_name"
                            value={createAdminForm.full_name}
                            onChange={handleCreateAdminChange}
                            placeholder="Enter full name"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="create_username">Username</label>
                          <input
                            id="create_username"
                            type="text"
                            name="username"
                            value={createAdminForm.username}
                            onChange={handleCreateAdminChange}
                            placeholder="Enter username"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="create_email">Email</label>
                          <input
                            id="create_email"
                            type="email"
                            name="email"
                            value={createAdminForm.email}
                            onChange={handleCreateAdminChange}
                            placeholder="Enter admin email"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="create_password">
                            Temporary Password
                          </label>
                          <div className="password-input-wrap">
                            <input
                              id="create_password"
                              type={showCreatePassword ? "text" : "password"}
                              name="password"
                              value={createAdminForm.password}
                              onChange={handleCreateAdminChange}
                              placeholder="Enter temporary password"
                              required
                            />
                            <button
                              type="button"
                              className="password-toggle"
                              onClick={() =>
                                setShowCreatePassword((prev) => !prev)
                              }
                            >
                              {showCreatePassword ? "Hide" : "Show"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="form-actions">
                        <button
                          type="submit"
                          className="settings-btn gold"
                          disabled={createAdminLoading}
                        >
                          {createAdminLoading ? "Creating..." : "Create Admin"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
