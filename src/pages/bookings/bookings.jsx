import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import AdminLayout from "../../components/layout/adminLayout";
import supabase from "../../../config/supabaseClient.js";
import {
  approveBooking,
  completeBooking,
  getAllBookings,
  rejectBooking,
} from "../../services/BACKEND/adminBookingApi";
import { getPaymentProofUrl } from "../../services/BACKEND/adminPaymentApi";
import "../../styles/booking.css";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const formatDate = (date) => {
  if (!date) return "-";
  return dateFormatter.format(new Date(date));
};

const formatTime = (time) => {
  if (!time) return "-";

  return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDateTime = (date) => {
  if (!date) return "-";
  return dateTimeFormatter.format(new Date(date));
};

const patchBookingInResponse = (response, bookingId, patch) => {
  if (!response?.data?.length) return response;

  const updatedData = response.data.map((item) => {
    if (String(item.id) !== String(bookingId)) return item;
    return {
      ...item,
      ...patch,
    };
  });

  return {
    ...response,
    data: updatedData,
  };
};

const Bookings = () => {
  const location = useLocation();
  const queryClient = useQueryClient();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const bookingIdFromQuery = queryParams.get("bookingId");
  const statusFromQuery = queryParams.get("status");
  const highlightFromQuery = queryParams.get("highlight");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [proofUrl, setProofUrl] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusFromQuery || "all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [showFilters, setShowFilters] = useState(Boolean(statusFromQuery));
  const [realtimeStatus, setRealtimeStatus] = useState("connecting");

  const [page, setPage] = useState(1);
  const limit = PAGE_SIZE;

  const highlightedRowRef = useRef(null);
  const refreshTimeoutRef = useRef(null);

  /* ================= DEBOUNCED SEARCH ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  /* ================= RESET PAGE WHEN FILTERS CHANGE ================= */
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, dateFrom, dateTo]);

  /* ================= FETCH BOOKINGS ================= */
  const {
    data: bookingsResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "admin-bookings",
      page,
      limit,
      debouncedSearch,
      statusFilter,
      dateFrom,
      dateTo,
    ],
    queryFn: async () => {
      return await getAllBookings({
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter,
        dateFrom,
        dateTo,
      });
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const bookings = bookingsResponse?.data ?? [];
  const totalBookings = bookingsResponse?.total ?? 0;
  const totalPages = bookingsResponse?.totalPages ?? 1;

  /* ================= PREFETCH NEXT PAGE ================= */
  useEffect(() => {
    if (page >= totalPages) return;

    queryClient.prefetchQuery({
      queryKey: [
        "admin-bookings",
        page + 1,
        limit,
        debouncedSearch,
        statusFilter,
        dateFrom,
        dateTo,
      ],
      queryFn: () =>
        getAllBookings({
          page: page + 1,
          limit,
          search: debouncedSearch,
          status: statusFilter,
          dateFrom,
          dateTo,
        }),
      staleTime: 1000 * 60 * 2,
    });
  }, [
    page,
    totalPages,
    limit,
    debouncedSearch,
    statusFilter,
    dateFrom,
    dateTo,
    queryClient,
  ]);

  /* ================= AUTO OPEN TARGET BOOKING FROM QUERY ================= */
  useEffect(() => {
    if (!bookingIdFromQuery || bookings.length === 0) return;

    const matchedBooking = bookings.find(
      (b) => String(b.id) === String(bookingIdFromQuery),
    );

    if (matchedBooking) {
      setSelectedBooking(matchedBooking);
    }
  }, [bookingIdFromQuery, bookings]);

  /* ================= KEEP MODAL DATA FRESH ================= */
  useEffect(() => {
    if (!selectedBooking) return;

    const updatedSelectedBooking = bookings.find(
      (b) => String(b.id) === String(selectedBooking.id),
    );

    if (updatedSelectedBooking && updatedSelectedBooking !== selectedBooking) {
      setSelectedBooking(updatedSelectedBooking);
    }
  }, [bookings]);

  /* ================= AUTO SCROLL TO HIGHLIGHTED ROW ================= */
  useEffect(() => {
    if (highlightedRowRef.current) {
      highlightedRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [bookings, bookingIdFromQuery]);

  /* ================= THROTTLED INVALIDATE FOR REALTIME ================= */
  const scheduleRealtimeRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) return;

    refreshTimeoutRef.current = setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: ["admin-bookings"],
      });
      refreshTimeoutRef.current = null;
    }, 600);
  }, [queryClient]);

  /* ================= REALTIME SUBSCRIPTION ================= */
  useEffect(() => {
    const channel = supabase
      .channel("admin-bookings-realtime-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          setRealtimeStatus("live");

          const changedId = payload?.new?.id ?? payload?.old?.id;

          if (changedId) {
            queryClient.setQueriesData(
              { queryKey: ["admin-bookings"] },
              (oldData) => {
                if (!oldData?.data?.length) return oldData;

                const exists = oldData.data.some(
                  (item) => String(item.id) === String(changedId),
                );

                if (!exists) return oldData;

                return patchBookingInResponse(
                  oldData,
                  changedId,
                  payload.new || {},
                );
              },
            );
          }

          // for inserts / deletes / filter-sensitive changes, do a safe refresh
          scheduleRealtimeRefresh();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("live");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setRealtimeStatus("reconnecting");
        } else {
          setRealtimeStatus("connecting");
        }
      });

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      supabase.removeChannel(channel);
    };
  }, [queryClient, scheduleRealtimeRefresh]);

  /* ================= LOAD PROOF ================= */
  const handleLoadProof = useCallback(async (filePath) => {
    try {
      const url = await getPaymentProofUrl(filePath);
      setProofUrl(url);
    } catch (err) {
      console.error("Failed to load payment proof:", err);
    }
  }, []);

  /* ================= RESET FILTERS ================= */
  const handleResetFilters = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }, []);

  /* ================= BADGE ================= */
  const statusBadge = useCallback((status) => {
    if (!status) return <span className="status-badge">Unknown</span>;

    return (
      <span className={`status-badge ${status}`}>
        {status.replaceAll("_", " ")}
      </span>
    );
  }, []);

  /* ================= HIGHLIGHT ================= */
  const isHighlightedBooking = useCallback(
    (booking) => {
      return (
        String(booking.id) === String(bookingIdFromQuery) &&
        highlightFromQuery === "cancelled"
      );
    },
    [bookingIdFromQuery, highlightFromQuery],
  );

  /* ================= OPTIMISTIC PATCH ================= */
  const buildOptimisticPatch = useCallback((type) => {
    const now = new Date().toISOString();

    if (type === "approve") {
      return {
        status: "approved",
        approved_at: now,
      };
    }

    if (type === "reject") {
      return {
        status: "rejected",
      };
    }

    if (type === "complete") {
      return {
        status: "completed",
        completed_at: now,
      };
    }

    return {};
  }, []);

  const executeAction = useCallback(async () => {
    if (!confirmAction) return;

    const { type, booking } = confirmAction;
    const optimisticPatch = buildOptimisticPatch(type);

    const querySnapshots = queryClient
      .getQueryCache()
      .findAll({ queryKey: ["admin-bookings"] })
      .map((query) => ({
        queryKey: query.queryKey,
        data: query.state.data,
      }));

    setActionLoading(true);

    // optimistic update across all cached booking queries
    querySnapshots.forEach(({ queryKey }) => {
      queryClient.setQueryData(queryKey, (oldData) =>
        patchBookingInResponse(oldData, booking.id, optimisticPatch),
      );
    });

    setSelectedBooking((prev) => {
      if (!prev || String(prev.id) !== String(booking.id)) return prev;
      return {
        ...prev,
        ...optimisticPatch,
      };
    });

    setConfirmAction(null);

    try {
      if (type === "approve") await approveBooking(booking.id);
      if (type === "reject") await rejectBooking(booking.id);
      if (type === "complete") await completeBooking(booking.id);

      await queryClient.invalidateQueries({
        queryKey: ["admin-bookings"],
      });

      setSelectedBooking(null);
    } catch (err) {
      console.error("Failed to execute booking action:", err);

      querySnapshots.forEach(({ queryKey, data }) => {
        queryClient.setQueryData(queryKey, data);
      });

      setSelectedBooking(booking);
    } finally {
      setActionLoading(false);
    }
  }, [confirmAction, buildOptimisticPatch, queryClient]);

  const realtimeLabel =
    realtimeStatus === "live"
      ? "Live updates on"
      : realtimeStatus === "reconnecting"
        ? "Reconnecting realtime..."
        : "Connecting realtime...";

  return (
    <AdminLayout>
      <div className="bookings-page-header">
        <div>
          <div className="bookings-title-row">
            <h1>Bookings Management</h1>
            <span className={`realtime-pill ${realtimeStatus}`}>
              <span className="realtime-dot" />
              {realtimeLabel}
            </span>
          </div>

          <p className="bookings-subtitle">
            Manage customer bookings, status updates, and payment proof review.
          </p>
        </div>

        <button
          className="toggle-filters-btn"
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {showFilters && (
        <div className="filters-dropdown-card">
          <div className="booking-filters-grid">
            <div className="filter-group filter-search-wide">
              <label htmlFor="search">Search</label>
              <input
                id="search"
                type="text"
                placeholder="Search customer name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="statusFilter">Status</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="dateFrom">From</label>
              <input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="dateTo">To</label>
              <input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="filters-footer">
            <div className="filters-result-count">
              {totalBookings} booking{totalBookings !== 1 ? "s" : ""} found
            </div>

            <div className="filter-actions">
              <button
                className="btn-reset-filter"
                type="button"
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading-shell">
          <div className="loading-card shimmer-row" />
          <div className="loading-card shimmer-row" />
          <div className="loading-card shimmer-row" />
        </div>
      ) : (
        <>
          {isFetching && (
            <div className="refreshing-banner">Refreshing bookings...</div>
          )}

          <div className="premium-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((b) => (
                    <tr
                      key={b.id}
                      ref={isHighlightedBooking(b) ? highlightedRowRef : null}
                      className={
                        isHighlightedBooking(b)
                          ? "highlighted-cancelled-booking"
                          : ""
                      }
                    >
                      <td>{b.id}</td>

                      <td
                        className="clickable"
                        onClick={() => setSelectedBooking(b)}
                      >
                        {b.customer_name || b.customers?.full_name || "-"}
                      </td>

                      <td>{b.services?.name || "-"}</td>

                      <td>
                        {b.booking_date
                          ? new Date(b.booking_date).toLocaleDateString("en-PH")
                          : "-"}
                      </td>

                      <td>{statusBadge(b.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No bookings found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </button>

              <div className="pagination-info">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </div>

              <button
                type="button"
                className="pagination-btn"
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="organized-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>
                  {selectedBooking.customer_name ||
                    selectedBooking.customers?.full_name ||
                    "-"}
                </h2>
                {statusBadge(selectedBooking.status)}
              </div>

              <button
                className="modal-close"
                type="button"
                onClick={() => setSelectedBooking(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body-grid">
              <div className="modal-column">
                <div className="info-card">
                  <h3>Customer Information</h3>
                  <p>
                    <strong>Email:</strong>{" "}
                    {selectedBooking.customer_email ||
                      selectedBooking.customers?.email ||
                      "-"}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedBooking.customer_phone ||
                      selectedBooking.customers?.phone ||
                      "-"}
                  </p>
                  <p>
                    <strong>Facebook:</strong>{" "}
                    {selectedBooking.customer_facebook_link ||
                      selectedBooking.customers?.facebook_link ||
                      "-"}
                  </p>
                </div>

                <div className="info-card">
                  <h3>Booking Timeline</h3>

                  <p>
                    <strong>Created:</strong>{" "}
                    {formatDateTime(selectedBooking.created_at)}
                  </p>

                  <p>
                    <strong>Approved:</strong>{" "}
                    {formatDateTime(selectedBooking.approved_at)}
                  </p>

                  <p>
                    <strong>Completed:</strong>{" "}
                    {formatDateTime(selectedBooking.completed_at)}
                  </p>

                  <p>
                    <strong>Cancelled:</strong>{" "}
                    {formatDateTime(selectedBooking.cancelled_at)}
                  </p>

                  <p>
                    <strong>Cancellation Reason:</strong>{" "}
                    {selectedBooking.cancellation_reason || "-"}
                  </p>
                </div>
              </div>

              <div className="modal-column">
                <div className="info-card">
                  <h3>Service Information</h3>
                  <p>
                    <strong>Service:</strong>{" "}
                    {selectedBooking.services?.name || "-"}
                  </p>
                  <p>
                    <strong>Category:</strong>{" "}
                    {selectedBooking.service_variants?.service_categories
                      ?.name || "-"}
                  </p>
                  <p>
                    <strong>Body Part:</strong>{" "}
                    {selectedBooking.service_variants?.body_part || "-"}
                  </p>
                  <p>
                    <strong>Size:</strong>{" "}
                    {selectedBooking.service_variants?.size || "-"}
                  </p>
                  <p>
                    <strong>Booking Date:</strong>{" "}
                    {formatDate(selectedBooking.booking_date)}
                  </p>

                  <p>
                    <strong>Appointment Time:</strong>{" "}
                    {formatTime(selectedBooking.booking_time)}
                  </p>
                </div>

                <div className="info-card payment-card">
                  <h3>Payment Information</h3>
                  <p>
                    <strong>Total:</strong> ₱{selectedBooking.total_price ?? 0}
                  </p>
                  <p>
                    <strong>Downpayment:</strong> ₱
                    {selectedBooking.downpayment ?? 0}
                  </p>
                  <p>
                    <strong>Remaining:</strong> ₱
                    {(selectedBooking.total_price ?? 0) -
                      (selectedBooking.downpayment ?? 0)}
                  </p>

                  {selectedBooking.proof_payment_path && (
                    <button
                      className="btn-proof"
                      type="button"
                      onClick={() =>
                        handleLoadProof(selectedBooking.proof_payment_path)
                      }
                    >
                      View Proof of Payment
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              {selectedBooking.status === "pending_approval" && (
                <>
                  <button
                    className="btn-approve"
                    type="button"
                    onClick={() =>
                      setConfirmAction({
                        type: "approve",
                        booking: selectedBooking,
                      })
                    }
                    disabled={actionLoading}
                  >
                    Approve
                  </button>

                  <button
                    className="btn-reject"
                    type="button"
                    onClick={() =>
                      setConfirmAction({
                        type: "reject",
                        booking: selectedBooking,
                      })
                    }
                    disabled={actionLoading}
                  >
                    Reject
                  </button>
                </>
              )}

              {selectedBooking.status === "approved" && (
                <button
                  className="btn-complete"
                  type="button"
                  onClick={() =>
                    setConfirmAction({
                      type: "complete",
                      booking: selectedBooking,
                    })
                  }
                  disabled={actionLoading}
                >
                  Complete
                </button>
              )}

              <button
                className="btn-close"
                type="button"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {proofUrl && (
        <div className="modal-overlay" onClick={() => setProofUrl(null)}>
          <div className="proof-modal" onClick={(e) => e.stopPropagation()}>
            <div className="proof-image-wrapper">
              <img src={proofUrl} alt="Proof of Payment" />
            </div>

            <button
              className="btn-close"
              type="button"
              onClick={() => setProofUrl(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {confirmAction && (
        <div
          className="modal-overlay"
          onClick={() => !actionLoading && setConfirmAction(null)}
        >
          <div
            className="confirm-modal premium-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`confirm-icon ${confirmAction.type}`}>
              {confirmAction.type === "approve" && "✓"}
              {confirmAction.type === "reject" && "!"}
              {confirmAction.type === "complete" && "★"}
            </div>

            <h3 className="confirm-title">
              {confirmAction.type === "approve" && "Approve this booking?"}
              {confirmAction.type === "reject" && "Reject this booking?"}
              {confirmAction.type === "complete" && "Complete this booking?"}
            </h3>

            <p className="confirm-subtitle">
              You are about to <strong>{confirmAction.type}</strong> booking ID{" "}
              <strong>#{confirmAction.booking.id}</strong>.
            </p>

            <p className="confirm-note">
              {confirmAction.type === "approve" &&
                "This will mark the booking as approved and send the approval flow."}
              {confirmAction.type === "reject" &&
                "This will reject the booking and release the reserved slot if applicable."}
              {confirmAction.type === "complete" &&
                "This will mark the booking as completed and trigger the review flow."}
            </p>

            <div className="confirm-actions">
              <button
                className="confirm-btn cancel"
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                className={`confirm-btn ${confirmAction.type}`}
                type="button"
                onClick={executeAction}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : `Yes, ${confirmAction.type}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Bookings;