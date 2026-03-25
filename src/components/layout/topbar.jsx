import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaBars,
  FaBell,
  FaBullhorn,
  FaCalendarAlt,
  FaStar,
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

  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [page, setPage] = useState(1);
  const [scrolled, setScrolled] = useState(false);

  const NOTIF_PER_PAGE = 6;

  const navigate = useNavigate();
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const intervalRef = useRef(null);
  const loadingNotifRef = useRef(false);

  const user = JSON.parse(localStorage.getItem("admin_user"));

  /* ================= LOAD NOTIFICATIONS ================= */
  const loadNotifications = useCallback(async () => {
    if (loadingNotifRef.current) return;

    try {
      loadingNotifRef.current = true;

      const notifRes = await getNotifications();
      const notifData = Array.isArray(notifRes?.data) ? notifRes.data : [];

      const filtered = notifData.filter((n) => {
        const created = new Date(n.created_at);
        const diffDays = (new Date() - created) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      });

      setNotifications(filtered);

      const countRes = await getUnreadNotificationCount();
      setNotifCount(Number(countRes?.count || 0));
    } catch (err) {
      console.error("Notification fetch error:", err);
    } finally {
      loadingNotifRef.current = false;
    }
  }, []);

  /* ================= AUTO REFRESH ================= */
  useEffect(() => {
    loadNotifications();

    intervalRef.current = setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadNotifications]);

  /* ================= SCROLL EFFECT ================= */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  useEffect(() => {
    const total = Math.max(1, Math.ceil(notifications.length / NOTIF_PER_PAGE));
    if (page > total) {
      setPage(1);
    }
  }, [notifications, page]);

  const totalPages = Math.max(
    1,
    Math.ceil(notifications.length / NOTIF_PER_PAGE),
  );
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
  const normalizeNotificationLink = (link, relatedEntity) => {
    if (link === "/admin/bookings") return "/bookings";
    if (link === "/admin/reviews") return "/reviews";
    if (link === "/admin/announcements") return "/announcements";

    if (link) return link;

    if (relatedEntity === "bookings") return "/bookings";
    if (relatedEntity === "reviews") return "/reviews";
    if (relatedEntity === "announcements") return "/announcements";

    return "/dashboard";
  };

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

      const targetPath = normalizeNotificationLink(
        notif.link,
        notif.related_entity,
      );

      navigate(targetPath);
      setNotifOpen(false);
    } catch (err) {
      console.error("Notification click error:", err);
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    setNotifications([]);
    setNotifCount(0);
    setNotifOpen(false);
    setProfileOpen(false);

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
                    className={`notif-item ${notif.is_read ? "read" : "unread"}`}
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
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    Prev
                  </button>

                  <span>
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

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
