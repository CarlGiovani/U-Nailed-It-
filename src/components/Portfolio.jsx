import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getAllPortfolio } from "../../backend/portfolioApi";

import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "../styles/portfolio.css";

import { FaArrowLeft, FaArrowRight, FaTimes } from "react-icons/fa";

const PortfolioPreviewModal = ({
  images,
  title,
  description,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}) => {
  const hasMultiple = images.length > 1;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (hasMultiple && event.key === "ArrowRight") onNext();
      if (hasMultiple && event.key === "ArrowLeft") onPrev();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [hasMultiple, onClose, onNext, onPrev]);

  return createPortal(
    <div
      className="portfolio-preview-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Portfolio image preview"}
    >
      <div
        className="portfolio-preview-box"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="portfolio-preview-close"
          onClick={onClose}
          aria-label="Close image preview"
        >
          <FaTimes />
        </button>

        {hasMultiple && (
          <>
            <button
              type="button"
              className="portfolio-preview-nav portfolio-preview-prev"
              onClick={onPrev}
              aria-label="Previous image"
            >
              <FaArrowLeft />
            </button>

            <button
              type="button"
              className="portfolio-preview-nav portfolio-preview-next"
              onClick={onNext}
              aria-label="Next image"
            >
              <FaArrowRight />
            </button>
          </>
        )}

        <img
          src={images[currentIndex]}
          alt={`${title || "Portfolio image"} ${currentIndex + 1}`}
        />

        {(title || description || hasMultiple) && (
          <div className="portfolio-preview-info">
            {title && <h3>{title}</h3>}

            {description && <p>{description}</p>}

            {hasMultiple && (
              <div className="portfolio-preview-count">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

const Portfolio = () => {
  const {
    data: portfolioItems = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["portfolioItems"],
    queryFn: getAllPortfolio,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewDescription, setPreviewDescription] = useState("");
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

    const openPreview = (item, startIndex = 0) => {
    setPreviewImages(item.images || []);
    setPreviewTitle(item.title || "");
    setPreviewDescription(item.description || item.content || "");
    setCurrentPreviewIndex(startIndex);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewImages([]);
    setPreviewTitle("");
    setPreviewDescription("");
    setCurrentPreviewIndex(0);
  };
  const prevPreview = () => {
    setCurrentPreviewIndex((prev) =>
      prev === 0 ? previewImages.length - 1 : prev - 1,
    );
  };

  const nextPreview = () => {
    setCurrentPreviewIndex((prev) =>
      prev === previewImages.length - 1 ? 0 : prev + 1,
    );
  };

  const totalPages = Math.ceil(portfolioItems.length / itemsPerPage);
  const safeCurrentPage =
    totalPages === 0 ? 1 : Math.min(currentPage, totalPages);

  const start = (safeCurrentPage - 1) * itemsPerPage;
  const currentItems = portfolioItems.slice(start, start + itemsPerPage);

  if (isError) {
    console.error("Failed to load portfolio", error);
  }

  return (
    <>
      <section className="portfolio" id="portfolio">
        <div className="container">
          <div className="portfolio-header">
            <span className="portfolio-kicker">Portfolio</span>
            <h2>Our Work</h2>
            <p>
              A curated look at some of our nail sets, details, and finished
              designs crafted with care.
            </p>
          </div>

          {isLoading ? (
            <div className="portfolio-state">
              <p className="loading-text">Loading portfolio...</p>
            </div>
          ) : isError ? (
            <div className="portfolio-state">
              <p className="loading-text">Failed to load portfolio.</p>
            </div>
          ) : portfolioItems.length === 0 ? (
            <div className="portfolio-state">
              <p className="loading-text">No portfolio items available.</p>
            </div>
          ) : (
            <>
              <div className="portfolio-grid">
                {currentItems.map((item, index) => (
                  <article
                    key={item.id}
                    className={`portfolio-item ${
                      index === 0 ? "portfolio-item-featured" : ""
                    }`}
                    onClick={() => openPreview(item, 0)}
                  >
                    <div className="portfolio-image-wrap">
                      <img
                        src={item.images?.[0]}
                        alt={item.title}
                        loading="lazy"
                      />
                    </div>

                    <div className="portfolio-overlay">
                      <span className="portfolio-chip">View Set</span>
                      <h3>{item.title}</h3>
                      <p>
                        {item.description ||
                          item.content ||
                          "Tap to view photos."}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="portfolio-pagination">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage === 1}
                    aria-label="Previous page"
                    type="button"
                  >
                    Prev
                  </button>

                  <span>
                    Page {safeCurrentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={safeCurrentPage === totalPages}
                    aria-label="Next page"
                    type="button"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

           {isPreviewOpen && previewImages.length > 0 && (
        <PortfolioPreviewModal
          images={previewImages}
          title={previewTitle}
          description={previewDescription}
          currentIndex={currentPreviewIndex}
          onClose={closePreview}
          onPrev={prevPreview}
          onNext={nextPreview}
        />
      )}
    </>
  );
};

export default Portfolio;
