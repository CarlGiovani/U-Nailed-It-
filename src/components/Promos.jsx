import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getActiveAnnouncements } from "../../backend/promosApi";
import "../styles/promos.css";

import { FaTimes } from "react-icons/fa";

const PromoPreviewModal = ({ image, alt, onClose }) => {
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
    document.body,
  );
};

const Promos = () => {
  const {
    data: announcements = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["announcements"],
    queryFn: getActiveAnnouncements,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [previewAlt, setPreviewAlt] = useState("Promo preview");

  const openPreview = (image, title, index = 0) => {
    setPreviewImage(image);
    setPreviewAlt(`${title} image ${index + 1}`);
  };

  const closePreview = () => {
    setPreviewImage(null);
    setPreviewAlt("Promo preview");
  };

  if (isError) {
    console.error("Failed to fetch announcements", error);
  }

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

          {isLoading && (
            <div className="portfolio-state">
              <p className="loading-text">Loading announcements...</p>
            </div>
          )}

          {!isLoading && announcements.length === 0 && (
            <div className="portfolio-state">
              <p className="loading-text">
                No announcements available at the moment.
              </p>
            </div>
          )}

          {!isLoading && !isError && announcements.length > 0 && (
            <div className="bulletin-board">
              {announcements.map((item) => (
                <article key={item.id} className="note-card">
                  <div className="pin"></div>

                  {item.images?.length > 0 && (
                    <div className="note-image-grid">
                      {item.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${item.title} preview ${idx + 1}`}
                          loading="lazy"
                          onClick={() => openPreview(img, item.title, idx)}
                        />
                      ))}
                    </div>
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
              ))}
            </div>
          )}
        </div>
      </section>

      {previewImage && (
        <PromoPreviewModal
          image={previewImage}
          alt={previewAlt}
          onClose={closePreview}
        />
      )}
    </>
  );
};

export default Promos;
