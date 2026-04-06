import { useEffect, useState } from "react";
import {
  FaBars,
  FaBullhorn,
  FaCalendarAlt,
  FaClipboardList,
  FaCog,
  FaFileAlt,
  FaImages,
  FaServicestack,
  FaSignOutAlt,
  FaStar,
  FaTachometerAlt,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../../../UNailedIt_Website/src/assets/images/logo.png";
import { adminLogout } from "../../services/BACKEND/adminAuthApi";
import "../../styles/sidebar.css";

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      if (mobile) {
        setCollapsed(false);
      } else {
        setMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [setMobileOpen]);

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("admin_session");
      localStorage.removeItem("admin_user");
      navigate("/");
    }
  };

  const handleNavClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const navItem = (to, icon, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? "nav-link active-link" : "nav-link"
      }
      onClick={handleNavClick}
    >
      <span className="nav-icon">{icon}</span>
      {(!collapsed || isMobile) && <span className="nav-label">{label}</span>}
    </NavLink>
  );

  return (
    <>
      {mobileOpen && isMobile && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`sidebar ${collapsed && !isMobile ? "collapsed" : ""} ${
          mobileOpen && isMobile ? "open" : ""
        }`}
      >
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <img src={logo} alt="UNAILEDIT Logo" />
            </div>

            {(!collapsed || isMobile) && (
              <span className="brand-text">UNAILEDIT</span>
            )}
          </div>

          {!isMobile && (
            <button
              type="button"
              className="collapse-btn"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <FaBars />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItem("/dashboard", <FaTachometerAlt />, "Dashboard")}
          {navItem("/calendar", <FaCalendarAlt />, "Calendar")}
          {navItem("/bookings", <FaClipboardList />, "Bookings")}
          {navItem("/services", <FaServicestack />, "Services")}
          {navItem("/reviews", <FaStar />, "Reviews")}
          {navItem("/portfolio", <FaImages />, "Portfolio")}
          {navItem("/announcements", <FaBullhorn />, "Announcements")}
          {navItem("/policies", <FaFileAlt />, "Policies")}
          {navItem("/settings", <FaCog />, "Settings")}
        </nav>

        <button type="button" className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon">
            <FaSignOutAlt />
          </span>
          {(!collapsed || isMobile) && (
            <span className="nav-label">Logout</span>
          )}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
