import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaQuoteLeft,
  FaRegImage,
  FaStar,
  FaTimes,
} from "react-icons/fa";
import Slider from "react-slick";
import { getApprovedReviews } from "../../backend/reviewApi";
import "../styles/review-section.css";

import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

const NextArrow = ({ onClick }) => (
  <button
    className="reviews-slider-arrow next"
    onClick={onClick}
    aria-label="Next reviews"
    type="button"
  >
    <FaChevronRight />
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button
    className="reviews-slider-arrow prev"
    onClick={onClick}
    aria-label="Previous reviews"
    type="button"
  >
    <FaChevronLeft />
  </button>
);

const Reviews = () => {
  const [page, setPage] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewAlt, setPreviewAlt] = useState("Review preview");

  useEffect(() => {
    if (previewImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [previewImage]);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["approvedReviews", page],
    queryFn: () => getApprovedReviews(page, 6),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });

  const reviews = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const sliderSettings = useMemo(
    () => ({
      autoplay: reviews.length > 1,
      autoplaySpeed: 4000,
      arrows: reviews.length > 1,
      dots: reviews.length > 1,
      infinite: reviews.length > 1,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      adaptiveHeight: false,
      swipeToSlide: true,
      nextArrow: <NextArrow />,
      prevArrow: <PrevArrow />,
    }),
    [reviews.length],
  );

  if (isError) {
    console.error("Failed to load reviews", error);
  }

  const openPreview = (image, customerName) => {
    setPreviewImage(image);
    setPreviewAlt(`${customerName}'s review image`);
  };

  const closePreview = () => {
    setPreviewImage(null);
    setPreviewAlt("Review preview");
  };

  const renderStars = (rating = 0) =>
    [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={`review-star ${i < rating ? "filled" : ""}`}
        aria-hidden="true"
      >
        <FaStar />
      </span>
    ));

  const renderCard = (review) => {
    const name = review.bookings?.customers?.full_name || "Happy Customer";
    const formattedDate = review.created_at
      ? new Date(review.created_at).toLocaleDateString()
      : "Recently";

    return (
      <article key={review.id} className="review-card">
        <div className="review-card-glow" />

        <div className="review-top">
          <div className="review-avatar" aria-hidden="true">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="review-person">
            <h3 className="review-name">{name}</h3>
            <p className="review-date">{formattedDate}</p>
          </div>

          <div className="review-quote-badge" aria-hidden="true">
            <FaQuoteLeft />
          </div>
        </div>

        <div
          className="review-rating"
          aria-label={`${review.rating} out of 5 stars`}
        >
          {renderStars(review.rating)}
        </div>

        <p className="review-comment">
          {review.comment || "Lovely service and experience!"}
        </p>

        {review.image_url && (
          <button
            type="button"
            className="review-image"
            onClick={() => openPreview(review.image_url, name)}
            aria-label={`Open review image from ${name}`}
          >
            <img src={review.image_url} alt={`${name} review`} loading="lazy" />
            <span className="review-image-overlay">
              <FaRegImage />
              View Photo
            </span>
          </button>
        )}
      </article>
    );
  };

  if (isLoading) {
    return (
      <section className="reviews" id="reviews">
        <div className="container">
          <div className="reviews-heading">
            <span className="reviews-kicker">Client Love</span>
            <h2>Why Customers Love Us</h2>
            <p>Real experiences from our happy nail art clients.</p>
          </div>

          <div className="reviews-state">
            <p className="loading-text">Loading reviews...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="reviews" id="reviews">
      <div className="reviews-bg reviews-bg-1" />
      <div className="reviews-bg reviews-bg-2" />

      <div className="container">
        <div className="reviews-heading">
          <span className="reviews-kicker">Client Love</span>
          <h2>Why Customers Love Us</h2>
          <p>
            Real stories, real smiles, and beautiful results from our clients.
          </p>
        </div>

        {isFetching && !isLoading && (
          <div className="reviews-fetching">
            <p className="loading-text">Loading new page...</p>
          </div>
        )}

        {isError ? (
          <div className="reviews-state">
            <p className="loading-text">Failed to load reviews.</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="reviews-state">
            <p className="loading-text">No reviews available.</p>
          </div>
        ) : (
          <>
            <div className="reviews-grid desktop-only">
              {reviews.map(renderCard)}
            </div>

            <div className="reviews-mobile mobile-only">
              <Slider {...sliderSettings}>
                {reviews.map((review) => (
                  <div key={review.id} className="reviews-slide">
                    {renderCard(review)}
                  </div>
                ))}
              </Slider>
            </div>

            <div className="reviews-pagination">
              <button
                type="button"
                className="pagination-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <FaChevronLeft />
                <span>Prev</span>
              </button>

              <div className="pagination-status">
                <span className="pagination-current">{page}</span>
                <span className="pagination-divider">/</span>
                <span className="pagination-total">{totalPages}</span>
              </div>

              <button
                type="button"
                className="pagination-btn"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <span>Next</span>
                <FaChevronRight />
              </button>
            </div>
          </>
        )}
      </div>

      {previewImage && (
        <div
          className="review-preview-overlay"
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
          aria-label="Review image preview"
        >
          <div
            className="review-preview-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="review-preview-close"
              onClick={closePreview}
              aria-label="Close image preview"
            >
              <FaTimes />
            </button>

            <img src={previewImage} alt={previewAlt} />
          </div>
        </div>
      )}
    </section>
  );
};

export default Reviews;
