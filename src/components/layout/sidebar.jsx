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
import "./Layout.css";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_user");
    navigate("/");
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItem = (to, icon, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? "nav-link active-link" : "nav-link"
      }
      onClick={() => setMobileOpen(false)}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <div
        className={`sidebar ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "open" : ""
        }`}
      >
        <div className="sidebar-header">
          <h2 className="logo">{collapsed ? "U" : "UNAILEDIT"}</h2>

          <div className="sidebar-controls">
            <FaBars
              className="collapse-btn"
              onClick={() => {
                if (window.innerWidth <= 768) {
                  setMobileOpen(!mobileOpen);
                } else {
                  setCollapsed(!collapsed);
                }
              }}
            />
          </div>
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
          {!collapsed && <span>Logout</span>}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
