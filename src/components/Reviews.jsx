import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
  const [page, setPage] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["approvedReviews", page],
    queryFn: () => getApprovedReviews(page, 6),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const reviews = data?.data || [];
  const totalPages = data?.totalPages || 1;

  if (isError) {
    console.error("Failed to load reviews", error);
  }

  if (isLoading) {
    return <p className="loading-text">Loading reviews...</p>;
  }

  const renderCard = (review) => {
    const name = review.bookings?.customers?.full_name || "Happy Customer";

    return (
      <div key={review.id} className="review-card speech">
        <span className="pin pink" />

        <div className="review-quote">“</div>

        <p className="review-comment">{review.comment}</p>

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

        {review.image_url && (
          <div className="review-image">
            <img
              src={review.image_url}
              alt="Review"
              onClick={() => setPreviewImage(review.image_url)}
            />
          </div>
        )}

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

        {isError ? (
          <p className="loading-text">Failed to load reviews.</p>
        ) : reviews.length === 0 ? (
          <p className="loading-text">No reviews available.</p>
        ) : (
          <>
            <div className="reviews-grid desktop-only">
              {reviews.map(renderCard)}
            </div>

            <div className="mobile-only">
              <Slider {...sliderSettings}>
                {reviews.map((r) => (
                  <div key={r.id}>{renderCard(r)}</div>
                ))}
              </Slider>
            </div>

            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
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
          </>
        )}
      </div>

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
