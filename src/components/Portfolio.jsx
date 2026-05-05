import { useQuery } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  memo,
  useDeferredValue,
} from "react";
import { createPortal } from "react-dom";
import { getAllPortfolio } from "../../backend/portfolioApi";

import "../styles/portfolio.css";
import { FaArrowLeft, FaArrowRight, FaTimes } from "react-icons/fa";

/* -------------------------------------------------------------------------- */
/*  Progressive image component (huge perf gain)                              */
/* -------------------------------------------------------------------------- */
const ProgressiveImage = memo(({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={`portfolio-img ${loaded ? "loaded" : ""}`}
    />
  );
});

/* -------------------------------------------------------------------------- */
/*  MODAL — fixed keyboard navigation (no errors on single image)             */
/* -------------------------------------------------------------------------- */
const PortfolioPreviewModal = memo(
  ({ images, title, description, currentIndex, onClose, onPrev, onNext }) => {
    const hasMultiple = images.length > 1;

    useEffect(() => {
      const handler = (e) => {
        if (e.key === "Escape") onClose();
        if (hasMultiple && e.key === "ArrowRight") onNext();
        if (hasMultiple && e.key === "ArrowLeft") onPrev();
      };
      window.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", handler);
        document.body.style.overflow = "";
      };
    }, [hasMultiple, onClose, onNext, onPrev]);

    return createPortal(
      <div className="portfolio-preview-overlay" onClick={onClose}>
        <div className="portfolio-preview-box" onClick={(e) => e.stopPropagation()}>
          <button className="portfolio-preview-close" onClick={onClose}>
            <FaTimes />
          </button>

          {hasMultiple && (
            <>
              <button className="portfolio-preview-prev" onClick={onPrev}>
                <FaArrowLeft />
              </button>
              <button className="portfolio-preview-next" onClick={onNext}>
                <FaArrowRight />
              </button>
            </>
          )}

          <img
            src={images[currentIndex]}
            alt={title}
            className="portfolio-preview-img"
            loading="eager"
            decoding="async"
          />

          <div className="portfolio-preview-info">
            <h3>{title}</h3>
            <p>{description}</p>
            {hasMultiple && <span>{currentIndex + 1} / {images.length}</span>}
          </div>
        </div>
      </div>,
      document.body
    );
  }
);

/* -------------------------------------------------------------------------- */
/*  PORTFOLIO ITEM — memoized                                                 */
/* -------------------------------------------------------------------------- */
const PortfolioItem = memo(({ item, openPreview }) => {
  const handleOpen = useCallback(() => openPreview(item), [item, openPreview]);

  return (
    <article className="portfolio-item" onClick={handleOpen}>
      <div className="portfolio-image-wrap">
        <ProgressiveImage src={item.images?.[0]} alt={item.title} />
      </div>
      <div className="portfolio-overlay">
        <span className="portfolio-chip">View Set</span>
        <h3>{item.title}</h3>
        <p>{item.description || "Tap to view photos."}</p>
      </div>
    </article>
  );
});

/* -------------------------------------------------------------------------- */
/*  Skeleton loader component (replaces plain text)                           */
/* -------------------------------------------------------------------------- */
const PortfolioSkeleton = () => (
  <div className="portfolio-skeleton">
    {Array(6).fill().map((_, i) => (
      <div key={i} className="skeleton-card" />
    ))}
  </div>
);

/* -------------------------------------------------------------------------- */
/*  MAIN COMPONENT                                                            */
/* -------------------------------------------------------------------------- */
export default function Portfolio() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn: getAllPortfolio,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const deferredData = useDeferredValue(data);
  const [modal, setModal] = useState(null);

  const openPreview = useCallback((item) => {
    if (!item.images?.length) return;
    setModal({
      images: item.images,
      title: item.title,
      description: item.description,
      currentIndex: 0,
    });
  }, []);

  const closePreview = useCallback(() => setModal(null), []);
  const nextPreview = useCallback(() => {
    setModal((prev) => ({
      ...prev,
      currentIndex: prev.currentIndex === prev.images.length - 1 ? 0 : prev.currentIndex + 1,
    }));
  }, []);
  const prevPreview = useCallback(() => {
    setModal((prev) => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1,
    }));
  }, []);

  const portfolioItems = useMemo(() => deferredData.slice(0, 12), [deferredData]);

  return (
    <section className="portfolio">
      <div className="container">
        <div className="portfolio-header">
          <span className="portfolio-kicker">Portfolio</span>
          <h2>Our Work</h2>
          <p>Our nail art collections.</p>
        </div>

        {isLoading ? (
          <PortfolioSkeleton />
        ) : (
          <div className="portfolio-grid">
            {portfolioItems.map((item) => (
              <PortfolioItem key={item.id} item={item} openPreview={openPreview} />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <PortfolioPreviewModal
          {...modal}
          onClose={closePreview}
          onNext={nextPreview}
          onPrev={prevPreview}
        />
      )}
    </section>
  );
}