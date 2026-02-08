import { useEffect, useState } from "react";
import { getApprovedReviews } from "../../backend/reviewApi";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📄 pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 🖼️ image preview
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await getApprovedReviews(page, 6);

        setReviews(res.data);
        setTotalPages(res.totalPages);
      } catch (err) {
        console.error("Failed to load reviews", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [page]);

  if (loading) return <p>Loading reviews...</p>;

  return (
    <section className="reviews" id="reviews">
      <div className="container">
        <div className="section-title">
          <h2>Customer Reviews</h2>
          <p>See what our clients say about our nail art services</p>
        </div>

        <div className="reviews-slider">
          {reviews.map((review) => {
            const name = review.bookings?.customers?.full_name || "Customer";
            const avatar = name.charAt(0).toUpperCase();

            return (
              <div key={review.id} className="review-card">
                {/* HEADER */}
                <div className="review-header">
                  <div className="review-avatar">{avatar}</div>

                  <div>
                    <div className="review-name">{name}</div>
                    <div className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* STARS */}
                <div className="review-stars">{"★".repeat(review.rating)}</div>

                {/* COMMENT */}
                <p className="review-comment">“{review.comment}”</p>

                {/* 🖼️ REVIEW IMAGE (CLICK TO PREVIEW) */}
                {review.image_url && (
                  <div className="review-image">
                    <img
                      src={review.image_url}
                      alt="Customer review"
                      loading="lazy"
                      onClick={() => setPreviewImage(review.image_url)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 📄 PAGINATION */}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* 🖼️ IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div
          className="image-preview-overlay"
          onClick={() => setPreviewImage(null)}
        >
          <img src={previewImage} alt="Preview" />
        </div>
      )}
    </section>
  );
};

export default Reviews;
