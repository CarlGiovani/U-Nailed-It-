import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import AdminLayout from "../../components/layout/adminLayout";
import {
  approveBooking,
  completeBooking,
  getAllBookings,
  rejectBooking,
} from "../../services/BACKEND/adminBookingApi";
import { getPaymentProofUrl } from "../../services/BACKEND/adminPaymentApi";
import "../../styles/booking.css";

const Bookings = () => {
  const location = useLocation();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const bookingIdFromQuery = queryParams.get("bookingId");
  const statusFromQuery = queryParams.get("status");
  const highlightFromQuery = queryParams.get("highlight");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [proofUrl, setProofUrl] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusFromQuery || "all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  const highlightedRowRef = useRef(null);

  /* ================= SYNC STATUS FILTER FROM QUERY ================= */
  useEffect(() => {
    if (statusFromQuery) {
      setStatusFilter(statusFromQuery);
    }
  }, [statusFromQuery]);

  /* ================= FETCH BOOKINGS ================= */
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getAllBookings({
        search,
        status: statusFilter,
        dateFrom,
        dateTo,
      });

      setBookings(result.data || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* ================= FILTER ================= */
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const fullName =
        b.customer_name?.toLowerCase() ||
        b.customers?.full_name?.toLowerCase() ||
        "";

      const email =
        b.customer_email?.toLowerCase() ||
        b.customers?.email?.toLowerCase() ||
        "";

      const searchValue = search.toLowerCase();

      const matchSearch =
        fullName.includes(searchValue) || email.includes(searchValue);

      const matchStatus =
        statusFilter === "all" ? true : b.status === statusFilter;

      const bookingDate = b.booking_date ? new Date(b.booking_date) : null;
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;

      if (to) {
        to.setHours(23, 59, 59, 999);
      }

      const matchDate =
        (!from || (bookingDate && bookingDate >= from)) &&
        (!to || (bookingDate && bookingDate <= to));

      return matchSearch && matchStatus && matchDate;
    });
  }, [bookings, search, statusFilter, dateFrom, dateTo]);

  /* ================= AUTO OPEN TARGET BOOKING FROM QUERY ================= */
  useEffect(() => {
    if (!bookingIdFromQuery || filteredBookings.length === 0) return;

    const matchedBooking = filteredBookings.find(
      (b) => String(b.id) === String(bookingIdFromQuery),
    );

    if (matchedBooking) {
      setSelectedBooking(matchedBooking);
    }
  }, [bookingIdFromQuery, filteredBookings]);

  /* ================= AUTO SCROLL TO HIGHLIGHTED ROW ================= */
  useEffect(() => {
    if (highlightedRowRef.current) {
      highlightedRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [filteredBookings, bookingIdFromQuery]);

  /* ================= ACTION ================= */
  const executeAction = async () => {
    if (!confirmAction) return;

    setActionLoading(true);

    try {
      const { type, booking } = confirmAction;

      if (type === "approve") await approveBooking(booking.id);
      if (type === "reject") await rejectBooking(booking.id);
      if (type === "complete") await completeBooking(booking.id);

      await fetchBookings();
      setSelectedBooking(null);
    } catch (err) {
      console.error("Failed to execute booking action:", err);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  /* ================= LOAD PROOF ================= */
  const handleLoadProof = async (filePath) => {
    try {
      const url = await getPaymentProofUrl(filePath);
      setProofUrl(url);
    } catch (err) {
      console.error("Failed to load payment proof:", err);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const statusBadge = (status) => {
    if (!status) return <span className="status-badge">Unknown</span>;

    return (
      <span className={`status-badge ${status}`}>
        {status.replaceAll("_", " ")}
      </span>
    );
  };

  const isHighlightedBooking = (booking) => {
    return (
      String(booking.id) === String(bookingIdFromQuery) &&
      highlightFromQuery === "cancelled"
    );
  };

  return (
    <AdminLayout>
      <div className="bookings-page-header">
        <div>
          <h1>Bookings Management</h1>
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

      {/* FILTERS DROPDOWN */}
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
              {filteredBookings.length} booking
              {filteredBookings.length !== 1 ? "s" : ""} found
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

      {/* TABLE */}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
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
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
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
                        ? new Date(b.booking_date).toLocaleDateString()
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
      )}

      {/* BOOKING DETAILS MODAL */}
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
                    {selectedBooking.created_at
                      ? new Date(selectedBooking.created_at).toLocaleString()
                      : "-"}
                  </p>
                  <p>
                    <strong>Approved:</strong>{" "}
                    {selectedBooking.approved_at
                      ? new Date(selectedBooking.approved_at).toLocaleString()
                      : "-"}
                  </p>
                  <p>
                    <strong>Completed:</strong>{" "}
                    {selectedBooking.completed_at
                      ? new Date(selectedBooking.completed_at).toLocaleString()
                      : "-"}
                  </p>
                  <p>
                    <strong>Cancelled:</strong>{" "}
                    {selectedBooking.cancelled_at
                      ? new Date(selectedBooking.cancelled_at).toLocaleString()
                      : "-"}
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
                    onClick={() =>
                      setConfirmAction({
                        type: "approve",
                        booking: selectedBooking,
                      })
                    }
                  >
                    Approve
                  </button>

                  <button
                    className="btn-reject"
                    onClick={() =>
                      setConfirmAction({
                        type: "reject",
                        booking: selectedBooking,
                      })
                    }
                  >
                    Reject
                  </button>
                </>
              )}

              {selectedBooking.status === "approved" && (
                <button
                  className="btn-complete"
                  onClick={() =>
                    setConfirmAction({
                      type: "complete",
                      booking: selectedBooking,
                    })
                  }
                >
                  Complete
                </button>
              )}

              <button
                className="btn-close"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROOF MODAL */}
      {proofUrl && (
        <div className="modal-overlay" onClick={() => setProofUrl(null)}>
          <div className="proof-modal" onClick={(e) => e.stopPropagation()}>
            <div className="proof-image-wrapper">
              <img src={proofUrl} alt="Proof of Payment" />
            </div>
            <button className="btn-close" onClick={() => setProofUrl(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
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
                onClick={() => setConfirmAction(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                className={`confirm-btn ${confirmAction.type}`}
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
