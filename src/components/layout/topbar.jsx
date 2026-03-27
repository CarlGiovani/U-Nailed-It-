import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaBars,
  FaBell,
  FaBullhorn,
  FaCalendarAlt,
  FaStar,
  FaTrash,
  FaUserCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/BACKEND/adminNotificationApi";

import supabase from "../../../config/supabaseClient.js";
import "../../styles/topbar.css";

const NOTIF_PER_PAGE = 6;
const NOTIF_MAX_AGE_DAYS = 7;
const NOTIFICATIONS_QUERY_KEY = ["admin-topbar-notifications"];

const Topbar = ({ setMobileOpen }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [manageMode, setManageMode] = useState(false);
  const [selectedNotifIds, setSelectedNotifIds] = useState([]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const realtimeChannelRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("admin_user") || "null");

  /* ================= HELPERS ================= */
  const isRecentNotification = useCallback((notif) => {
    if (!notif?.created_at) return false;

    const created = new Date(notif.created_at);
    if (Number.isNaN(created.getTime())) return false;

    const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= NOTIF_MAX_AGE_DAYS;
  }, []);

  const normalizeNotificationLink = useCallback((link, relatedEntity) => {
    if (link === "/admin/bookings") return "/bookings";
    if (link === "/admin/reviews") return "/reviews";
    if (link === "/admin/announcements") return "/announcements";

    if (link) return link;

    if (relatedEntity === "bookings") return "/bookings";
    if (relatedEntity === "reviews") return "/reviews";
    if (relatedEntity === "announcements") return "/announcements";

    return "/dashboard";
  }, []);

  const getNotifIcon = useCallback((notif) => {
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
  }, []);

  const normalizeNotifications = useCallback(
    (notifRes) => {
      const notifData = Array.isArray(notifRes?.data) ? notifRes.data : [];

      return notifData
        .filter(isRecentNotification)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    [isRecentNotification],
  );

  /* ================= REACT QUERY CACHE ================= */
  const {
    data: notifications = [],
    isLoading: notifLoading,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const notifRes = await getNotifications();
      return normalizeNotifications(notifRes);
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const unreadVisibleCount = useMemo(() => {
    return notifications.filter((item) => !item.is_read).length;
  }, [notifications]);

  const notifCount = unreadVisibleCount;

  const totalPages = Math.max(
    1,
    Math.ceil(notifications.length / NOTIF_PER_PAGE),
  );

  const currentPage = page > totalPages ? 1 : page;
  const startIndex = (currentPage - 1) * NOTIF_PER_PAGE;

  const paginatedNotifications = useMemo(() => {
    return notifications.slice(startIndex, startIndex + NOTIF_PER_PAGE);
  }, [notifications, startIndex]);

  const allVisibleSelected =
    paginatedNotifications.length > 0 &&
    paginatedNotifications.every((notif) =>
      selectedNotifIds.includes(notif.id),
    );

  const setNotificationsCache = useCallback(
    (updater) => {
      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (old = []) => {
        const nextValue =
          typeof updater === "function" ? updater(old || []) : updater;
        return Array.isArray(nextValue) ? nextValue : [];
      });
    },
    [queryClient],
  );

  /* ================= MUTATIONS ================= */
  const markOneReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (_, notifId) => {
      setNotificationsCache((prev) =>
        prev.map((item) =>
          item.id === notifId ? { ...item, is_read: true } : item,
        ),
      );
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      setNotificationsCache((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: true,
        })),
      );
    },
  });

  const deleteOneMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: (_, id) => {
      setNotificationsCache((prev) => prev.filter((item) => item.id !== id));
      setSelectedNotifIds((prev) => prev.filter((item) => item !== id));
    },
  });

  /* ================= REALTIME SUBSCRIPTION ================= */
  useEffect(() => {
    const channel = supabase
      .channel("admin-topbar-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotif = payload.new;

          if (!isRecentNotification(newNotif)) return;

          setNotificationsCache((prev) => {
            const exists = prev.some((item) => item.id === newNotif.id);
            if (exists) return prev;

            return [newNotif, ...prev].sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at),
            );
          });
        },
      )
      .subscribe((status) => {
        console.log("Notifications realtime status:", status);
      });

    realtimeChannelRef.current = channel;

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, [isRecentNotification, setNotificationsCache]);

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
        setManageMode(false);
        setSelectedNotifIds([]);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= PAGINATION GUARD ================= */
  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  /* ================= RESET SELECTION PER PAGE ================= */
  useEffect(() => {
    setSelectedNotifIds([]);
  }, [page]);

  /* ================= OPEN NOTIFICATION DROPDOWN ================= */
  const handleToggleNotifications = async () => {
    const nextOpen = !notifOpen;
    setNotifOpen(nextOpen);

    if (!notifOpen) {
      setPage(1);
      setManageMode(false);
      setSelectedNotifIds([]);
      await refetchNotifications();
    }
  };

  /* ================= MANAGE MODE ================= */
  const handleToggleManageMode = (e) => {
    e.stopPropagation();

    setManageMode((prev) => {
      const next = !prev;
      if (!next) {
        setSelectedNotifIds([]);
      }
      return next;
    });
  };

  const toggleSelectNotification = (e, id) => {
    e.stopPropagation();

    setSelectedNotifIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAllVisible = (e) => {
    e.stopPropagation();

    const visibleIds = paginatedNotifications.map((notif) => notif.id);

    setSelectedNotifIds((prev) => {
      const areAllSelected = visibleIds.every((id) => prev.includes(id));

      if (areAllSelected) {
        return prev.filter((id) => !visibleIds.includes(id));
      }

      return [...new Set([...prev, ...visibleIds])];
    });
  };

  /* ================= CLICK NOTIFICATION ================= */
  const handleNotificationClick = async (notif) => {
    try {
      if (!notif?.id) return;

      if (manageMode) {
        setSelectedNotifIds((prev) =>
          prev.includes(notif.id)
            ? prev.filter((item) => item !== notif.id)
            : [...prev, notif.id],
        );
        return;
      }

      if (!notif.is_read) {
        await markOneReadMutation.mutateAsync(notif.id);
      }

      const targetPath = normalizeNotificationLink(
        notif.link,
        notif.related_entity,
      );

      setNotifOpen(false);
      setManageMode(false);
      setSelectedNotifIds([]);
      navigate(targetPath);
    } catch (err) {
      console.error("Notification click error:", err);
    }
  };

  /* ================= MARK ALL AS READ ================= */
  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();

    if (markAllReadMutation.isPending || unreadVisibleCount === 0) return;

    try {
      await markAllReadMutation.mutateAsync();
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  };

  /* ================= DELETE SINGLE NOTIFICATION ================= */
  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();

    if (!id || deletingId === id) return;

    try {
      setDeletingId(id);
      await deleteOneMutation.mutateAsync(id);
    } catch (err) {
      console.error("Delete notification error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  /* ================= BULK DELETE ================= */
  const handleBulkDelete = async (e) => {
    e.stopPropagation();

    if (selectedNotifIds.length === 0 || deleteOneMutation.isPending) return;

    try {
      const idsToDelete = [...selectedNotifIds];
      await Promise.all(idsToDelete.map((id) => deleteNotification(id)));

      const selectedSet = new Set(idsToDelete);

      setNotificationsCache((prev) =>
        prev.filter((item) => !selectedSet.has(item.id)),
      );

      setSelectedNotifIds([]);
      setManageMode(false);
    } catch (err) {
      console.error("Bulk delete notifications error:", err);
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    queryClient.removeQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

    setNotifOpen(false);
    setProfileOpen(false);
    setManageMode(false);
    setSelectedNotifIds([]);

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
          <FaBell onClick={handleToggleNotifications} />

          {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}

          {notifOpen && (
            <div className="notifications-dropdown">
              <div className="notif-header">
                <span>Notifications</span>

                {!manageMode ? (
                  <div className="notif-header-actions">
                    <button
                      type="button"
                      className="notif-text-btn"
                      onClick={handleMarkAllAsRead}
                      disabled={
                        markAllReadMutation.isPending ||
                        unreadVisibleCount === 0
                      }
                    >
                      Mark all read
                    </button>

                    <button
                      type="button"
                      className="notif-text-btn"
                      onClick={handleToggleManageMode}
                      disabled={paginatedNotifications.length === 0}
                    >
                      Manage
                    </button>
                  </div>
                ) : (
                  <div className="notif-header-actions">
                    <button
                      type="button"
                      className="notif-text-btn"
                      onClick={toggleSelectAllVisible}
                      disabled={paginatedNotifications.length === 0}
                    >
                      {allVisibleSelected ? "Unselect all" : "Select all"}
                    </button>

                    <button
                      type="button"
                      className="notif-text-btn danger"
                      onClick={handleBulkDelete}
                      disabled={
                        deleteOneMutation.isPending ||
                        selectedNotifIds.length === 0
                      }
                    >
                      Delete selected
                    </button>

                    <button
                      type="button"
                      className="notif-text-btn"
                      onClick={handleToggleManageMode}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {notifLoading ? (
                <p className="no-notif">Loading notifications...</p>
              ) : paginatedNotifications.length === 0 ? (
                <p className="no-notif">No notifications</p>
              ) : (
                paginatedNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notif-item ${notif.is_read ? "read" : "unread"} ${manageMode ? "manage-mode" : ""}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    {manageMode && (
                      <div
                        className="notif-checkbox"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedNotifIds.includes(notif.id)}
                          onChange={(e) =>
                            toggleSelectNotification(e, notif.id)
                          }
                        />
                      </div>
                    )}

                    <div className="notif-left">{getNotifIcon(notif)}</div>

                    <div className="notif-content">
                      <div className="notif-top-row">
                        <div className="notif-title">{notif.title}</div>

                        {!manageMode && (
                          <button
                            type="button"
                            className="notif-delete-btn"
                            onClick={(e) =>
                              handleDeleteNotification(e, notif.id)
                            }
                            disabled={deletingId === notif.id}
                            title="Delete notification"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>

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
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    Prev
                  </button>

                  <span>
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
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
              <p className="profile-email">{user?.email || "Admin User"}</p>

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
