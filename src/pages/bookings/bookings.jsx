import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/layout/adminLayout";
import {
  approveBooking,
  completeBooking,
  getAllBookings,
  rejectBooking,
} from "../../services/BACKEND/adminBookingApi";
import { getPaymentProofUrl } from "../../services/BACKEND/adminPaymentApi";
import "../../styles/booking.css"

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [proofUrl, setProofUrl] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  /* ================= FETCH BOOKINGS ================= */
  const fetchBookings = useCallback(async () => {
    try {
      const result = await getAllBookings({
        search,
        status: statusFilter,
      });
      setBookings(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* ================= FILTER ================= */
  const filteredBookings = bookings.filter((b) => {
    const matchSearch =
      b.customers?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.customers?.email?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" ? true : b.status === statusFilter;

    return matchSearch && matchStatus;
  });

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
      console.error(err);
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
      console.error(err);
    }
  };

  const statusBadge = (status) => {
    return (
      <span className={`status-badge ${status}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <AdminLayout>
      <h1>Bookings Management</h1>

      {/* FILTERS */}
      <div className="booking-filters">
        <input
          placeholder="Search customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
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
                  <tr key={b.id}>
                    <td>{b.id}</td>

                    <td
                      className="clickable"
                      onClick={() => setSelectedBooking(b)}
                    >
                      {b.customers?.full_name}
                    </td>

                    <td>{b.services?.name}</td>
                    <td>{b.booking_date}</td>
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

      {/* ================= ORGANIZED PREMIUM MODAL ================= */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="organized-modal" onClick={(e) => e.stopPropagation()}>
            {/* HEADER */}
            <div className="modal-header">
              <div>
                <h2>{selectedBooking.customers?.full_name}</h2>
                {statusBadge(selectedBooking.status)}
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedBooking(null)}
              >
                ✕
              </button>
            </div>

            {/* GRID BODY */}
            <div className="modal-body-grid">
              {/* LEFT COLUMN */}
              <div className="modal-column">
                <div className="info-card">
                  <h3>Customer Information</h3>
                  <p>
                    <strong>Email:</strong> {selectedBooking.customers?.email}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedBooking.customers?.phone || "-"}
                  </p>
                  <p>
                    <strong>Facebook:</strong>{" "}
                    {selectedBooking.customers?.facebook_link || "-"}
                  </p>
                </div>

                <div className="info-card">
                  <h3>Booking Timeline</h3>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(selectedBooking.created_at).toLocaleString()}
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
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="modal-column">
                <div className="info-card">
                  <h3>Service Information</h3>
                  <p>
                    <strong>Service:</strong> {selectedBooking.services?.name}
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
                    <strong>Total:</strong> ₱{selectedBooking.total_price}
                  </p>
                  <p>
                    <strong>Downpayment:</strong> ₱{selectedBooking.downpayment}
                  </p>
                  <p>
                    <strong>Remaining:</strong> ₱
                    {selectedBooking.total_price - selectedBooking.downpayment}
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

            {/* ACTION BUTTONS */}
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
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>
              Confirm {confirmAction.type} booking ID {confirmAction.booking.id}
              ?
            </h3>
            <div className="modal-actions">
              <button onClick={executeAction}>
                {actionLoading ? "Processing..." : "Yes"}
              </button>
              <button onClick={() => setConfirmAction(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Bookings;
