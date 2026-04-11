import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import { getAllPortfolio } from "../../backend/portfolioApi";

import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "../styles/portfolio.css";

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

  const [sliderImages, setSliderImages] = useState([]);
  const [sliderTitle, setSliderTitle] = useState("");
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const sliderRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const openSlider = (item) => {
    setSliderImages(item.images || []);
    setSliderTitle(item.title || "");
    setCurrentSlide(0);
    setIsSliderOpen(true);
  };

  const closeSlider = () => {
    setIsSliderOpen(false);
    setIsFullscreen(false);
    setSliderImages([]);
    setSliderTitle("");
    setCurrentSlide(0);
  };

  useEffect(() => {
    document.body.style.overflow = isSliderOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSliderOpen]);

  useEffect(() => {
    if (!isSliderOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeSlider();

      if (sliderImages.length > 1 && sliderRef.current) {
        if (event.key === "ArrowRight") sliderRef.current.slickNext();
        if (event.key === "ArrowLeft") sliderRef.current.slickPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSliderOpen, sliderImages.length]);

  const sliderSettings = {
    dots: sliderImages.length > 1,
    infinite: sliderImages.length > 1,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: sliderImages.length > 1,
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
                    onClick={() => openSlider(item)}
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
                      <p>Tap to view photos.</p>
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

      {isSliderOpen && (
        <div
          className={`slider-modal ${isFullscreen ? "fullscreen" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label={sliderTitle || "Portfolio image viewer"}
        >
          <div className="slider-backdrop" onClick={closeSlider} />

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
              onClick={closeSlider}
              aria-label="Close viewer"
              type="button"
            >
              <FaTimes />
            </button>

            <div className="slider-content">
              <div className="slider-stage">
                <Slider ref={sliderRef} {...sliderSettings}>
                  {sliderImages.map((img, index) => (
                    <div key={index} className="slider-image-wrapper">
                      <img
                        src={img}
                        alt={`${sliderTitle || "Portfolio image"} ${index + 1}`}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </Slider>
              </div>

              {sliderImages.length > 1 && (
                <div className="slider-count">
                  {currentSlide + 1} / {sliderImages.length}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Portfolio;