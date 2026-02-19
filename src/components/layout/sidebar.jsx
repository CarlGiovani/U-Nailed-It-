import { useEffect, useState } from "react";
import {
  FaBars,
  FaBullhorn,
  FaCalendarAlt,
  FaFileAlt,
  FaImages,
  FaServicestack,
  FaSignOutAlt,
  FaStar,
  FaTachometerAlt,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/sidebar.css";

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  /* =========================
     DETECT SCREEN SIZE
  ========================== */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      if (mobile) {
        setCollapsed(false); // 🚀 disable collapse on mobile
      } else {
        setMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setMobileOpen]);

  /* =========================
     LOGOUT
  ========================== */
  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_user");
    navigate("/");
  };

  /* =========================
     NAV ITEM
  ========================== */
  const navItem = (to, icon, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? "nav-link active-link" : "nav-link"
      }
      onClick={() => setMobileOpen(false)}
    >
      {icon}
      {(!collapsed || isMobile) && <span>{label}</span>}
    </NavLink>
  );

  return (
    <>
      {/* Overlay (Mobile Only) */}
      {mobileOpen && isMobile && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <div
        className={`sidebar ${collapsed && !isMobile ? "collapsed" : ""} ${
          mobileOpen ? "open" : ""
        }`}
      >
        <div className="sidebar-header">
          <h2 className="logo">{collapsed && !isMobile ? "U" : "UNAILEDIT"}</h2>

          {/* Collapse only on desktop */}
          {!isMobile && (
            <FaBars
              className="collapse-btn"
              onClick={() => setCollapsed(!collapsed)}
            />
          )}
        </div>

        <nav>
          {navItem("/dashboard", <FaTachometerAlt />, "Dashboard")}
          {navItem("/bookings", <FaCalendarAlt />, "Bookings")}
          {navItem("/services", <FaServicestack />, "Services")}
          {navItem("/reviews", <FaStar />, "Reviews")}
          {navItem("/portfolio", <FaImages />, "Portfolio")}
          {navItem("/announcements", <FaBullhorn />, "Announcements")}
          {navItem("/policies", <FaFileAlt />, "Policies")}
        </nav>

        <div className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
