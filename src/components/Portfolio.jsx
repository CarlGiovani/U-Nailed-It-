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

/* =========================
   CUSTOM ARROWS
========================= */

const NextArrow = ({ onClick }) => (
  <button className="slider-arrow next" onClick={onClick}>
    <FaArrowRight />
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button className="slider-arrow prev" onClick={onClick}>
    <FaArrowLeft />
  </button>
);

const Portfolio = () => {
  /* =========================
     PORTFOLIO QUERY + CACHE
  ========================= */
  const {
    data: portfolioItems = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["portfolioItems"],
    // CACHE KEY
    // dito sine-save ni React Query ang portfolio data

    queryFn: getAllPortfolio,
    // FETCH FUNCTION
    // ito ang tatawag sa API kapag walang cache
    // o stale na ang cache

    staleTime: 1000 * 60 * 10,
    // CACHING
    // 10 minutes fresh ang data
    // within 10 mins, cached data muna ang gagamitin

    gcTime: 1000 * 60 * 15,
    // CACHE LIFETIME
    // itatago ang cache sa memory for 15 minutes

    refetchOnWindowFocus: false,
    // CACHE BEHAVIOR
    // pagbalik sa tab, hindi auto-refetch
  });

  const [sliderImages, setSliderImages] = useState([]);
  const [sliderTitle, setSliderTitle] = useState("");
  const [sliderDescription, setSliderDescription] = useState("");

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const sliderRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  /* =========================
     OPEN SLIDER
  ========================= */

  const openSlider = (item) => {
    setSliderImages(item.images || []);
    setSliderTitle(item.title || "");
    setSliderDescription(item.description || "");
    setCurrentSlide(0);
    setIsSliderOpen(true);
  };

  /* =========================
     CLOSE SLIDER
  ========================= */

  const closeSlider = () => {
    setIsSliderOpen(false);
    setIsFullscreen(false);
    setSliderImages([]);
  };

  /* =========================
     LOCK SCROLL WHEN MODAL OPEN
  ========================= */

  useEffect(() => {
    document.body.style.overflow = isSliderOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSliderOpen]);

  /* =========================
     SLIDER SETTINGS
  ========================= */

  const sliderSettings = {
    dots: true,
    infinite: sliderImages.length > 1,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: sliderImages.length > 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    afterChange: (i) => setCurrentSlide(i),
  };

  /* =========================
     FULLSCREEN
  ========================= */

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);

    setTimeout(() => {
      sliderRef.current?.slickGoTo(currentSlide);
    }, 50);
  };

  /* =========================
     PAGINATION
  ========================= */

  const start = (currentPage - 1) * itemsPerPage;
  const currentItems = portfolioItems.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(portfolioItems.length / itemsPerPage);

  if (isError) {
    console.error("Failed to load portfolio", error);
  }

  /* =========================
     COMPONENT
  ========================= */

  return (
    <>
      <section className="portfolio" id="portfolio">
        <div className="container">
          <div className="section-title">
            <h2>Our Portfolio</h2>
            <p>This is some of the memories and works</p>
          </div>

          {isLoading ? (
            <p className="loading-text">Loading portfolio...</p>
          ) : isError ? (
            <p className="loading-text">Failed to load portfolio.</p>
          ) : portfolioItems.length === 0 ? (
            <p className="loading-text">No portfolio items available.</p>
          ) : (
            <>
              <div className="portfolio-grid">
                {currentItems.map((item) => (
                  <div
                    key={item.id}
                    className="portfolio-item"
                    onClick={() => openSlider(item)}
                  >
                    <img
                      src={item.images?.[0]}
                      alt={item.title}
                      loading="lazy"
                    />

                    <div className="portfolio-overlay">
                      <h3>{item.title}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="portfolio-pagination">
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>

                  <span>
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
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
        <div className={`slider-modal ${isFullscreen ? "fullscreen" : ""}`}>
          <div className="slider-backdrop" onClick={closeSlider} />

          <div className="slider-content">
            <button className="slider-close" onClick={closeSlider}>
              <FaTimes />
            </button>

            <button className="slider-fullscreen" onClick={toggleFullscreen}>
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>

            <h2 className="slider-title">{sliderTitle}</h2>

            <p className="slider-description">{sliderDescription}</p>

            <Slider ref={sliderRef} {...sliderSettings}>
              {sliderImages.map((img, i) => (
                <div key={i} className="slider-image-wrapper">
                  <img src={img} alt={`Slide ${i + 1}`} loading="lazy" />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}
    </>
  );
};

export default Portfolio;
