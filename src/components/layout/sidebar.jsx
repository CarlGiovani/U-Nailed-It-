import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import logo from "../../assets/logo.png";
import { adminLogout } from "../../services/BACKEND/adminAuthApi";
import "../../styles/sidebar.css";

// Debounce utility
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const Sidebar = React.memo(({ mobileOpen, setMobileOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const location = useLocation();

  // Memoize static nav items
  const navItems = useMemo(
    () => [
      { to: "/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
      { to: "/calendar", icon: <FaCalendarAlt />, label: "Calendar" },
      { to: "/bookings", icon: <FaClipboardList />, label: "Bookings" },
      { to: "/services", icon: <FaServicestack />, label: "Services" },
      { to: "/reviews", icon: <FaStar />, label: "Reviews" },
      { to: "/portfolio", icon: <FaImages />, label: "Portfolio" },
      { to: "/announcements", icon: <FaBullhorn />, label: "Announcements" },
      { to: "/policies", icon: <FaFileAlt />, label: "Policies" },
      { to: "/settings", icon: <FaCog />, label: "Settings" },
    ],
    [],
  );

  // Use matchMedia + debounced listener for mobile detection
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleChange = (e) => {
      const mobile = e.matches;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(false);
      } else {
        setMobileOpen(false);
      }
    };

    // Debounced handler to avoid rapid updates
    const debouncedHandler = debounce(handleChange, 100);
    mediaQuery.addEventListener("change", debouncedHandler);
    handleChange(mediaQuery); // initial call

    return () => mediaQuery.removeEventListener("change", debouncedHandler);
  }, [setMobileOpen]);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile, setMobileOpen]);

  const handleLogout = useCallback(async () => {
    try {
      await adminLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("admin_session");
      localStorage.removeItem("admin_user");
      navigate("/");
    }
  }, [navigate]);

  const handleNavClick = useCallback(() => {
    if (isMobile) setMobileOpen(false);
  }, [isMobile, setMobileOpen]);

  const toggleCollapse = useCallback(() => {
    if (!isMobile) {
      setCollapsed((prev) => !prev);
    }
  }, [isMobile]);

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
                <img src={logo} alt="UNAILEDIT Logo" loading="eager" />
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
                onClick={toggleCollapse}
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
                <p className="footer-card-title">Manage your business</p>
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
});

export default Sidebar;
