import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/layout/adminLayout";
import {
  approveReview,
  getAllReviewsAdmin,
  rejectReview,
} from "../../services/BACKEND/adminReviewsApi";
import "../../styles/reviews.css";

// ADMIN REV
const AdminReviews = () => {
  const [selectedReview, setSelectedReview] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [actionLoading, setActionLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const limit = 10;
  const queryClient = useQueryClient();

  // TIME NORMALIZATION HELPER
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "-";

    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  /* ================= CACHED + BACKEND FILTERED INFINITE REVIEWS ================= */
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["admin-reviews", limit, search, statusFilter],
      queryFn: async ({ pageParam = 1 }) => {
        const result = await getAllReviewsAdmin(
          pageParam,
          limit,
          search,
          statusFilter,
        );

        return {
          data: result.data || [],
          totalPages: result.totalPages || 1,
          currentPage: pageParam,
        };
      },
      getNextPageParam: (lastPage) => {
        return lastPage.currentPage < lastPage.totalPages
          ? lastPage.currentPage + 1
          : undefined;
      },
      staleTime: 1000 * 60 * 3,
      gcTime: 1000 * 60 * 10,
      initialPageParam: 1,
    });

  const reviews = useMemo(() => {
    return data?.pages?.flatMap((page) => page.data) ?? [];
  }, [data]);

  /* ================= INFINITE SCROLL ================= */
  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 200;

      if (
        bottom &&
        hasNextPage &&
        !isLoading &&
        !isFetchingNextPage &&
        !actionLoading
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    actionLoading,
    fetchNextPage,
  ]);

  /* ================= ACTIONS ================= */
  const approveMutation = useMutation({
    mutationFn: approveReview,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectReview,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });

  const executeAction = async () => {
    if (!confirmAction) return;

    setActionLoading(true);

    try {
      const { type, review } = confirmAction;

      if (type === "approve") {
        await approveMutation.mutateAsync(review.id);
      }

      if (type === "reject") {
        await rejectMutation.mutateAsync(review.id);
      }

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
    return "⭐".repeat(Number(rating) || 0);
  };

  return (
    <AdminLayout>
      <h1>Reviews Management</h1>

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

      {isLoading ? (
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
              {reviews.length > 0 ? (
                reviews.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>

                    <td
                      className="clickable"
                      onClick={() => setSelectedReview(r)}
                    >
                      {r.booking?.customer_name || "Unknown Customer"}
                    </td>

                    <td>{r.booking?.service?.name || "Unknown Service"}</td>

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

      {hasNextPage && !isLoading && (
        <div className="lazy-loading">
          <span className="spinner"></span>
          {isFetchingNextPage
            ? "Loading more reviews..."
            : "Scroll for more reviews..."}
        </div>
      )}

      {!hasNextPage && !isLoading && (
        <div className="lazy-end">No more reviews</div>
      )}

      {selectedReview && (
        <div className="modal-overlay" onClick={() => setSelectedReview(null)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>
                  {selectedReview.booking?.customer_name || "Unknown Customer"}
                </h2>
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
                  {selectedReview.booking?.service?.name || "Unknown Service"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {formatDate(selectedReview.booking?.booking_date) || "N/A"}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {formatTime(selectedReview.booking?.booking_time) || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  {selectedReview.booking?.customer_email || "N/A"}
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
