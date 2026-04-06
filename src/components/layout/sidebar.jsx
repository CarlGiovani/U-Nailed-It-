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
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../../../../UNailedIt_Website/src/assets/images/logo.png";
import { adminLogout } from "../../services/BACKEND/adminAuthApi";
import "../../styles/sidebar.css";

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile, setMobileOpen]);

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
    if (isMobile) setMobileOpen(false);
  };

  const navItems = [
    { to: "/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { to: "/calendar", icon: <FaCalendarAlt />, label: "Calendar" },
    { to: "/bookings", icon: <FaClipboardList />, label: "Bookings" },
    { to: "/services", icon: <FaServicestack />, label: "Services" },
    { to: "/reviews", icon: <FaStar />, label: "Reviews" },
    { to: "/portfolio", icon: <FaImages />, label: "Portfolio" },
    { to: "/announcements", icon: <FaBullhorn />, label: "Announcements" },
    { to: "/policies", icon: <FaFileAlt />, label: "Policies" },
    { to: "/settings", icon: <FaCog />, label: "Settings" },
  ];

  return (
    <>
      {mobileOpen && isMobile && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${collapsed && !isMobile ? "collapsed" : ""} ${
          mobileOpen && isMobile ? "open" : ""
        }`}
      >
        <div className="sidebar-shell">
          <div className="sidebar-header">
            <div className="brand">
              <div className="brand-icon">
                <img src={logo} alt="UNAILEDIT Logo" />
              </div>

              {(!collapsed || isMobile) && (
                <div className="brand-copy">
                  <span className="brand-text">UNAILEDIT</span>
                  <span className="brand-subtext">Admin Panel</span>
                </div>
              )}
            </div>

            {!isMobile && (
              <button
                type="button"
                className="collapse-btn"
                onClick={() => setCollapsed((prev) => !prev)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <FaBars />
              </button>
            )}
          </div>

          {(!collapsed || isMobile) && (
            <div className="sidebar-section-label">Navigation</div>
          )}

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                title={collapsed && !isMobile ? item.label : ""}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active-link" : ""}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                {(!collapsed || isMobile) && (
                  <span className="nav-copy">
                    <span className="nav-label">{item.label}</span>
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            {(!collapsed || isMobile) && (
              <div className="sidebar-footer-card">
                <p className="footer-card-title">Manage your salon</p>
                <p className="footer-card-text">
                  Keep bookings, services, and updates organized in one place.
                </p>
              </div>
            )}

            <button type="button" className="logout-btn" onClick={handleLogout}>
              <span className="nav-icon">
                <FaSignOutAlt />
              </span>
              {(!collapsed || isMobile) && (
                <span className="nav-copy">
                  <span className="nav-label">Logout</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
