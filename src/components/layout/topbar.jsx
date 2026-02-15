import { useEffect, useRef, useState } from "react";
import { FaBars, FaBell, FaMoon, FaSun, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Topbar = ({ setMobileOpen }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("admin_dark") === "true",
  );

  const navigate = useNavigate();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("admin_user"));

  /* =========================
     DARK MODE TOGGLE
  ========================== */
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("admin_dark", "true");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("admin_dark", "false");
    }
  }, [darkMode]);

  /* =========================
     CLOSE DROPDOWN ON OUTSIDE CLICK
  ========================== */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================
     LOGOUT
  ========================== */
  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_user");
    navigate("/");
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        {/* MOBILE HAMBURGER */}
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
          <FaBars />
        </button>

        <h3>Admin Panel</h3>
      </div>

      <div className="topbar-right">
        {/* DARK MODE TOGGLE */}
        <div className="icon-wrapper">
          {darkMode ? (
            <FaSun onClick={() => setDarkMode(false)} />
          ) : (
            <FaMoon onClick={() => setDarkMode(true)} />
          )}
        </div>

        {/* NOTIFICATION */}
        <div className="icon-wrapper" ref={notifRef}>
          <FaBell onClick={() => setNotifOpen(!notifOpen)} />

          {notifOpen && (
            <div className="dropdown">
              <p style={{ margin: 0 }}>No new notifications</p>
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div className="icon-wrapper" ref={profileRef}>
          <FaUserCircle onClick={() => setProfileOpen(!profileOpen)} />

          {profileOpen && (
            <div className="dropdown">
              <p className="profile-email">{user?.email}</p>
              <hr />
              <p className="logout-text" onClick={handleLogout}>
                Logout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
