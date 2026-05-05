import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, useCallback, memo } from "react";
import { createPortal } from "react-dom";
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

/* =========================
   STATIC COMPONENTS
========================= */
const NextArrow = memo(({ onClick }) => (
  <button className="reviews-slider-arrow next" onClick={onClick} type="button">
    <FaChevronRight />
  </button>
));

const PrevArrow = memo(({ onClick }) => (
  <button className="reviews-slider-arrow prev" onClick={onClick} type="button">
    <FaChevronLeft />
  </button>
));

/* =========================
   MODAL (MEMOIZED)
========================= */
const ReviewPreviewModal = memo(({ image, alt, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div className="review-preview-overlay" onClick={onClose}>
      <div className="review-preview-box" onClick={(e) => e.stopPropagation()}>
        <button className="review-preview-close" onClick={onClose}>
          <FaTimes />
        </button>
        <img src={image} alt={alt} />
      </div>
    </div>,
    document.body
  );
});

/* =========================
   STAR RENDERER (MEMO)
========================= */
const Stars = memo(({ rating = 0 }) => (
  <>
    {[...Array(5)].map((_, i) => (
      <span key={i} className={`review-star ${i < rating ? "filled" : ""}`}>
        <FaStar />
      </span>
    ))}
  </>
));

/* =========================
   REVIEW CARD (MEMOIZED)
========================= */
const ReviewCard = memo(({ review, onPreview }) => {
  const customerName = review.customer_name?.trim() || "Client";
  const avatarLabel = customerName.charAt(0).toUpperCase();

  const formattedDate = review.created_at
    ? new Date(review.created_at).toLocaleDateString()
    : "Recently";

  return (
    <article className="review-card">
      <div className="review-card-glow" />

      <div className="review-top">
        <div className="review-avatar">{avatarLabel}</div>

        <div className="review-person">
          <h3 className="review-name">{customerName}</h3>
          <p className="review-date">{formattedDate}</p>
        </div>

        <div className="review-quote-badge">
          <FaQuoteLeft />
        </div>
      </div>

      <div className="review-rating">
        <Stars rating={review.rating} />
      </div>

      <p className="review-comment">
        {review.comment || "Lovely service and experience!"}
      </p>

      {review.image_url && (
        <button
          className="review-image"
          onClick={() => onPreview(review.image_url, customerName)}
        >
          <img src={review.image_url} alt={`${customerName} review`} loading="lazy" />
        </button>
      )}
    </article>
  );
});

/* =========================
   MAIN COMPONENT
========================= */
const Reviews = () => {
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState(null);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["approvedReviews", page],
    queryFn: () => getApprovedReviews(page, 6),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });

  const reviews = data?.data || [];
  const totalPages = data?.totalPages || 1;

  /* Stable preview handlers */
  const openPreview = useCallback((image, name) => {
    setPreview({ src: image, alt: `${name}'s review image` });
  }, []);

  const closePreview = useCallback(() => setPreview(null), []);

  /* Memoized slider settings */
  const sliderSettings = useMemo(
    () => ({
      autoplay: reviews.length > 1,
      autoplaySpeed: 4200,
      arrows: reviews.length > 1,
      dots: reviews.length > 1,
      infinite: reviews.length > 1,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      swipeToSlide: true,
      nextArrow: <NextArrow />,
      prevArrow: <PrevArrow />,
    }),
    [reviews.length]
  );

  if (isLoading) {
    return (
      <section className="reviews">
        <div className="container"><p>Loading reviews...</p></div>
      </section>
    );
  }

  return (
    <>
      <section className="reviews" id="reviews">
        <div className="container reviews-shell">
          <div className="reviews-heading">
            <span className="reviews-kicker">Client Reviews</span>
            <h2>What Clients Are Saying</h2>
          </div>

          {isFetching && <p className="loading-text">Loading new page...</p>}

          {isError ? (
            <p className="loading-text">Failed to load reviews.</p>
          ) : (
            <>
              <div className="reviews-grid desktop-only">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} onPreview={openPreview} />
                ))}
              </div>

              <div className="reviews-mobile mobile-only">
                <Slider {...sliderSettings}>
                  {reviews.map((r) => (
                    <div key={r.id}>
                      <ReviewCard review={r} onPreview={openPreview} />
                    </div>
                  ))}
                </Slider>
              </div>

              <div className="reviews-pagination">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <FaChevronLeft /> Prev
                </button>

                <span>{page} / {totalPages}</span>

                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next <FaChevronRight />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {preview && (
        <ReviewPreviewModal image={preview.src} alt={preview.alt} onClose={closePreview} />
      )}
    </>
  );
};

export default Reviews;