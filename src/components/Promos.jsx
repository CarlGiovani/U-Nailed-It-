import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { getActiveAnnouncements } from "../../backend/promosApi";
import "../styles/promos.css";
import { FaTimes } from "react-icons/fa";

/* ===============================
   MODAL (MEMOIZED)
================================= */
const PromoPreviewModal = memo(({ image, alt, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      className="promo-preview-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Promo image preview"
    >
      <div className="promo-preview-box" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="promo-preview-close"
          onClick={onClose}
          aria-label="Close image preview"
        >
          <FaTimes />
        </button>

        <img src={image} alt={alt} />
      </div>
    </div>,
    document.body
  );
});

/* ===============================
   IMAGE GRID (MEMOIZED)
================================= */
const ImageGrid = memo(({ images, title, onPreview }) => {
  return (
    <div className="note-image-grid">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`${title} preview ${idx + 1}`}
          loading="lazy"
          onClick={() => onPreview(img, title, idx)}
        />
      ))}
    </div>
  );
});

/* ===============================
   ANNOUNCEMENT CARD (MEMOIZED)
   Prevents list re-renders when modal opens
================================= */
const AnnouncementCard = memo(({ item, onPreview }) => {
  return (
    <article className="note-card">
      <div className="pin"></div>

      {item.images?.length > 0 && (
        <ImageGrid
          images={item.images}
          title={item.title}
          onPreview={onPreview}
        />
      )}

      <h3>{item.title}</h3>
      <p>{item.content}</p>

      <div className="note-footer">
        {item.end_date ? (
          <span>📅 Until {item.end_date}</span>
        ) : (
          <span>✨ Ongoing</span>
        )}
      </div>
    </article>
  );
});

/* ===============================
   MAIN PAGE
================================= */
const Promos = () => {
  const {
    data: announcements = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["announcements"],
    queryFn: getActiveAnnouncements,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  /* ===============================
     PREVIEW STATE
  ================================= */
  const [preview, setPreview] = useState(null);

  const openPreview = useCallback((image, title, index = 0) => {
    setPreview({
      src: image,
      alt: `${title} image ${index + 1}`,
    });
  }, []);

  const closePreview = useCallback(() => {
    setPreview(null);
  }, []);

  /* ===============================
     RENDER
  ================================= */
  return (
    <>
      <section className="bulletin" id="promos">
        <div className="container">
          <div className="portfolio-header">
            <span className="portfolio-kicker">Announcements</span>
            <h2>Promos & Updates</h2>
            <p>
              Latest offers, news, and special announcements from our studio
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="portfolio-state">
              <p className="loading-text">Loading announcements...</p>
            </div>
          )}

          {/* Error UI */}
          {isError && (
            <div className="portfolio-state">
              <p className="error-text">
                Failed to load announcements. Please try again later.
              </p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && announcements.length === 0 && (
            <div className="portfolio-state">
              <p className="loading-text">
                No announcements available at the moment.
              </p>
            </div>
          )}

          {/* List */}
          {!isLoading && !isError && announcements.length > 0 && (
            <div className="bulletin-board">
              {announcements.map((item) => (
                <AnnouncementCard
                  key={item.id}
                  item={item}
                  onPreview={openPreview}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {preview && (
        <PromoPreviewModal
          image={preview.src}
          alt={preview.alt}
          onClose={closePreview}
        />
      )}
    </>
  );
};

export default Promos;