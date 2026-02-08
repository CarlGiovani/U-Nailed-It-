import { useEffect, useState } from "react";
import Slider from "react-slick";
import { getApprovedReviews } from "../../backend/reviewApi";
import "../styles/review-section.css";

import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

const sliderSettings = {
  autoplay: true,
  autoplaySpeed: 3500,
  arrows: false,
  dots: true,
  infinite: true,
  slidesToShow: 1,
  slidesToScroll: 1,
};

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await getApprovedReviews(page, 6);
        setReviews(res.data || []);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        console.error("Failed to load reviews", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [page]);

  if (loading) return <p className="loading-text">Loading reviews...</p>;

  const renderCard = (review) => {
    const name = review.bookings?.customers?.full_name || "Happy Customer";

    return (
      <div key={review.id} className="review-card speech">
        {/* PIN */}
        <span className="pin pink" />

        {/* QUOTE */}
        <div className="review-quote">“</div>

        {/* COMMENT */}
        <p className="review-comment">{review.comment}</p>

        {/* STARS */}
        <div className="review-stars">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`star ${i < review.rating ? "filled" : ""}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              ★
            </span>
          ))}
        </div>

        {/* IMAGE */}
        {review.image_url && (
          <div className="review-image">
            <img
              src={review.image_url}
              alt="Review"
              onClick={() => setPreviewImage(review.image_url)}
            />
          </div>
        )}

        {/* FOOTER */}
        <div className="review-footer">
          <span className="review-name">{name}</span>
          <span className="review-date">
            {new Date(review.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="reviews" id="reviews">
      <div className="container">
        <div className="section-title">
          <h2>Why Customers Love Us</h2>
          <p>Real experiences from our happy nail art clients</p>
        </div>

        {/* DESKTOP GRID */}
        <div className="reviews-grid desktop-only">
          {reviews.map(renderCard)}
        </div>

        {/* MOBILE SLIDER */}
        <div className="mobile-only">
          <Slider {...sliderSettings}>
            {reviews.map((r) => (
              <div key={r.id}>{renderCard(r)}</div>
            ))}
          </Slider>
        </div>

        {/* PAGINATION */}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* IMAGE PREVIEW */}
      {previewImage && (
        <div
          className="image-preview-overlay"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="image-preview-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="image-preview-close"
              onClick={() => setPreviewImage(null)}
            >
              ✕
            </button>

            <img src={previewImage} alt="Preview" />
          </div>
        </div>
      )}
    </section>
  );
};

export default Reviews;
