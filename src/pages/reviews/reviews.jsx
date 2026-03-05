import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/layout/adminLayout";
import {
  approveReview,
  getAllReviewsAdmin,
  rejectReview,
} from "../../services/BACKEND/adminReviewsApi";
import "../../styles/reviews.css";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedReview, setSelectedReview] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [actionLoading, setActionLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  /* ================= FETCH REVIEWS ================= */
  const fetchReviews = useCallback(async (pageToLoad = 1) => {
    try {
      const result = await getAllReviewsAdmin(pageToLoad, limit);

      if (pageToLoad === 1) {
        setReviews(result.data);
      } else {
        setReviews((prev) => [...prev, ...result.data]);
      }

      if (pageToLoad >= result.totalPages) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreReviews = async () => {
    if (!hasMore || loading) return;

    const nextPage = page + 1;
    setPage(nextPage);

    await fetchReviews(nextPage);
  };

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 200;

      if (bottom && hasMore && !loading && !actionLoading) {
        loadMoreReviews();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, loading, actionLoading]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchReviews(1);
  }, [search, statusFilter]);

  /* ================= FILTER ================= */

  const filteredReviews = reviews.filter((r) => {
    const name = r.bookings?.customers?.full_name || "";

    const matchSearch = name.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "approved"
          ? r.is_approved
          : !r.is_approved;

    return matchSearch && matchStatus;
  });

  /* ================= ACTION ================= */

  const executeAction = async () => {
    if (!confirmAction) return;

    setActionLoading(true);

    try {
      const { type, review } = confirmAction;

      if (type === "approve") {
        await approveReview(review.id);
      }

      if (type === "reject") {
        await rejectReview(review.id);
      }

      setPage(1);
      setHasMore(true);
      await fetchReviews(1);

      setSelectedReview(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const statusBadge = (approved) => {
    return (
      <span className={`review-status ${approved ? "approved" : "pending"}`}>
        {approved ? "Approved" : "Pending"}
      </span>
    );
  };

  const renderStars = (rating) => {
    return "⭐".repeat(rating);
  };

  return (
    <AdminLayout>
      <h1>Reviews Management</h1>

      {/* FILTERS */}

      <div className="review-filters">
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
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
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
                <th>Rating</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredReviews.length > 0 ? (
                filteredReviews.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>

                    <td
                      className="clickable"
                      onClick={() => setSelectedReview(r)}
                    >
                      {r.bookings?.customers?.full_name}
                    </td>

                    <td>{r.bookings?.services?.name}</td>

                    <td>{renderStars(r.rating)}</td>

                    <td>{statusBadge(r.is_approved)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No reviews found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {hasMore && !loading && (
        <div className="lazy-loading">
          <span className="spinner"></span>
          Loading more reviews...
        </div>
      )}

      {!hasMore && <div className="lazy-end">No more reviews</div>}

      {/* REVIEW MODAL */}

      {selectedReview && (
        <div className="modal-overlay" onClick={() => setSelectedReview(null)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedReview.bookings?.customers?.full_name}</h2>
                {statusBadge(selectedReview.is_approved)}
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedReview(null)}
              >
                ✕
              </button>
            </div>

            <div className="review-content">
              <div className="info-card">
                <h3>Service Information</h3>
                <p>
                  <strong>Service:</strong>{" "}
                  {selectedReview.bookings?.services?.name}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(
                    selectedReview.bookings?.booking_date,
                  ).toLocaleDateString()}
                </p>
              </div>

              <div className="info-card">
                <h3>Review</h3>

                <p className="review-stars">
                  {renderStars(selectedReview.rating)}
                </p>

                <p className="review-comment">
                  {selectedReview.comment || "No comment"}
                </p>

                {selectedReview.image_url && (
                  <img
                    className="review-image clickable-image"
                    src={selectedReview.image_url}
                    alt="Review"
                    onClick={() => setPreviewImage(selectedReview.image_url)}
                  />
                )}
              </div>
            </div>

            {/* ACTIONS */}

            <div className="modal-actions">
              {!selectedReview.is_approved && (
                <button
                  className="btn-approve"
                  disabled={actionLoading}
                  onClick={() =>
                    setConfirmAction({
                      type: "approve",
                      review: selectedReview,
                    })
                  }
                >
                  {actionLoading ? (
                    <span className="spinner"></span>
                  ) : (
                    "Approve"
                  )}
                </button>
              )}

              <button
                className="btn-reject"
                disabled={actionLoading}
                onClick={() =>
                  setConfirmAction({
                    type: "reject",
                    review: selectedReview,
                  })
                }
              >
                {actionLoading ? <span className="spinner"></span> : "Reject"}
              </button>
              <button
                className="btn-close"
                onClick={() => setSelectedReview(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {confirmAction && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3 className="confirm-title">
              {confirmAction.type === "approve"
                ? "Approve this review?"
                : "Reject this review?"}
            </h3>

            <div className="confirm-actions">
              <button
                className="confirm-btn confirm-btn-yes"
                onClick={executeAction}
                disabled={actionLoading}
              >
                {actionLoading ? <span className="spinner"></span> : "Confirm"}
              </button>

              <button
                className="confirm-btn confirm-btn-cancel"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div
            className="image-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewImage} alt="Review Preview" />
            <button className="btn-close" onClick={() => setPreviewImage(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReviews;
