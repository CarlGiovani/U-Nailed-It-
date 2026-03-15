import { useEffect, useRef, useState } from "react";
import {
  FaBars,
  FaBell,
  FaBullhorn,
  FaCalendarAlt,
  FaMoon,
  FaStar,
  FaSun,
  FaUserCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
} from "../../services/BACKEND/adminNotificationApi";

import "../../styles/topbar.css";

const Topbar = ({ setMobileOpen }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("admin_dark") === "true",
  );
  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [page, setPage] = useState(1);
  const [scrolled, setScrolled] = useState(false);

  const NOTIF_PER_PAGE = 6;

  const navigate = useNavigate();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("admin_user"));

  /* ================= LOAD NOTIFICATIONS ================= */

  const loadNotifications = async () => {
    try {
      const notifRes = await getNotifications();
      const notifData = notifRes?.data || [];

      const filtered = notifData.filter((n) => {
        const created = new Date(n.created_at);
        const diffDays = (new Date() - created) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      });

      setNotifications(filtered);

      const countRes = await getUnreadNotificationCount();
      setNotifCount(countRes?.count || 0);
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  /* ================= AUTO REFRESH ================= */

  useEffect(() => {
    const fetchData = async () => {
      await loadNotifications();
    };

    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  /* ================= SCROLL EFFECT ================= */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= DARK MODE ================= */

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("admin_dark", "true");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("admin_dark", "false");
    }
  }, [darkMode]);

  /* ================= CLOSE DROPDOWN ================= */

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

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(notifications.length / NOTIF_PER_PAGE) || 1;
  const currentPage = page > totalPages ? 1 : page;

  const startIndex = (currentPage - 1) * NOTIF_PER_PAGE;

  const paginatedNotifications = notifications.slice(
    startIndex,
    startIndex + NOTIF_PER_PAGE,
  );

  /* ================= ICON PER TYPE / ENTITY ================= */

  const getNotifIcon = (notif) => {
    if (notif.related_entity === "reviews" || notif.type === "review") {
      return <FaStar className="notif-icon review" />;
    }

    if (
      notif.related_entity === "announcements" ||
      notif.type === "announcement"
    ) {
      return <FaBullhorn className="notif-icon announce" />;
    }

    if (notif.related_entity === "bookings" || notif.type === "booking") {
      return <FaCalendarAlt className="notif-icon booking" />;
    }

    return <FaBell className="notif-icon default" />;
  };

  /* ================= CLICK NOTIFICATION ================= */

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await markNotificationAsRead(notif.id);
        setNotifCount((prev) => Math.max(prev - 1, 0));
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notif.id ? { ...item, is_read: true } : item,
        ),
      );

      if (notif.link === "/admin/bookings") {
        navigate("/bookings");
      } else if (notif.link === "/admin/reviews") {
        navigate("/reviews");
      } else if (notif.link === "/admin/announcements") {
        navigate("/announcements");
      } else if (notif.link) {
        navigate(notif.link);
      } else if (notif.related_entity === "bookings") {
        navigate("/bookings");
      } else if (notif.related_entity === "reviews") {
        navigate("/reviews");
      } else if (notif.related_entity === "announcements") {
        navigate("/announcements");
      } else {
        navigate("/dashboard");
      }

      setNotifOpen(false);
    } catch (err) {
      console.error("Notification click error:", err);
    }
  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_user");
    navigate("/");
  };

  return (
    <div className={`topbar ${scrolled ? "scrolled" : ""}`}>
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
          <FaBars />
        </button>

        <h3>Admin Panel</h3>
      </div>

      <div className="topbar-right">
        {/* DARK MODE */}
        <div className="icon-wrapper">
          {darkMode ? (
            <FaSun onClick={() => setDarkMode(false)} />
          ) : (
            <FaMoon onClick={() => setDarkMode(true)} />
          )}
        </div>

        {/* NOTIFICATIONS */}
        <div className="icon-wrapper" ref={notifRef}>
          <FaBell
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setPage(1);
              loadNotifications();
            }}
          />

          {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}

          {notifOpen && (
            <div className="notifications-dropdown">
              <div className="notif-header">Notifications</div>

              {paginatedNotifications.length === 0 ? (
                <p className="no-notif">No notifications</p>
              ) : (
                paginatedNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notif-item ${!notif.is_read ? "unread" : ""}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notif-left">{getNotifIcon(notif)}</div>

                    <div className="notif-content">
                      <div className="notif-title">{notif.title}</div>
                      <div className="notif-message">{notif.message}</div>
                      <div className="notif-time">
                        {new Date(notif.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {notifications.length > NOTIF_PER_PAGE && (
                <div className="notif-pagination">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Prev
                  </button>

                  <span>
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div className="icon-wrapper" ref={profileRef}>
          <FaUserCircle onClick={() => setProfileOpen((prev) => !prev)} />

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
