import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import { getActiveAnnouncements } from "../../backend/promosApi";
import "../styles/promos.css";

import {
  FaArrowLeft,
  FaArrowRight,
  FaCompress,
  FaExpand,
  FaTimes,
} from "react-icons/fa";

const NextArrow = ({ onClick }) => (
  <button
    className="slider-arrow next"
    onClick={onClick}
    aria-label="Next slide"
    type="button"
  >
    <FaArrowRight />
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button
    className="slider-arrow prev"
    onClick={onClick}
    aria-label="Previous slide"
    type="button"
  >
    <FaArrowLeft />
  </button>
);

const Promos = () => {
  const {
    data: announcements = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["announcements"],
    queryFn: getActiveAnnouncements,
    staleTime: 1000 * 60 * 5, // 5 mins
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  // Modal state
  const [modalImages, setModalImages] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sliderRef = useRef(null);

  const openModal = (images, title, startIndex = 0) => {
    if (!images?.length) return;
    setModalImages(images);
    setModalTitle(title);
    setCurrentSlide(startIndex);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsFullscreen(false);
    setModalImages([]);
    setModalTitle("");
    setCurrentSlide(0);
  };

  // Lock body scroll when modal open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = isModalOpen ? "hidden" : originalOverflow;
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isModalOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeModal();
      if (modalImages.length > 1 && sliderRef.current) {
        if (event.key === "ArrowRight") sliderRef.current.slickNext();
        if (event.key === "ArrowLeft") sliderRef.current.slickPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, modalImages.length]);

  const sliderSettings = {
    dots: modalImages.length > 1,
    infinite: modalImages.length > 1,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: modalImages.length > 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    afterChange: (index) => setCurrentSlide(index),
    adaptiveHeight: false,
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      sliderRef.current?.slickGoTo(currentSlide);
    }, 50);
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
                          onClick={() =>
                            openModal(item.images, item.title, idx)
                          }
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

      {/* Lightbox Modal - same style as portfolio slider */}
      {isModalOpen && (
        <div
          className={`slider-modal ${isFullscreen ? "fullscreen" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label={modalTitle || "Announcement image viewer"}
        >
          <div className="slider-backdrop" onClick={closeModal} />

          <div className="slider-shell">
            <button
              className="slider-icon-btn slider-fullscreen"
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
              type="button"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>

            <button
              className="slider-icon-btn slider-close"
              onClick={closeModal}
              aria-label="Close viewer"
              type="button"
            >
              <FaTimes />
            </button>

            <div className="slider-content">
              <div className="slider-stage">
                <Slider ref={sliderRef} {...sliderSettings}>
                  {modalImages.map((img, index) => (
                    <div key={index} className="slider-image-wrapper">
                      <img
                        src={img}
                        alt={`${modalTitle || "Announcement image"} ${index + 1}`}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </Slider>
              </div>

              <div className="slider-meta">
                <div className="slider-meta-inner">
                  <span className="slider-meta-chip">Promo Visual</span>
                  <h3>{modalTitle}</h3>
                  {modalImages.length > 1 && (
                    <div className="slider-count">
                      {currentSlide + 1} / {modalImages.length}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Promos;
