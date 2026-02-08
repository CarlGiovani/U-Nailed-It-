import { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import { getAllPortfolio } from "../../backend/portfolioApi.js";

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
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [sliderImages, setSliderImages] = useState([]);
  const [sliderTitle, setSliderTitle] = useState("");
  const [sliderDescription, setSliderDescription] = useState("");
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const sliderRef = useRef(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await getAllPortfolio();
        setPortfolioItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPortfolio();
  }, []);

  const openSlider = (item) => {
    setSliderImages(item.images || []);
    setSliderTitle(item.title || "");
    setSliderDescription(item.description || "");
    setCurrentSlide(0);
    setIsSliderOpen(true);
  };

  const closeSlider = () => {
    setIsSliderOpen(false);
    setIsFullscreen(false);
    setSliderImages([]);
  };

  useEffect(() => {
    document.body.style.overflow = isSliderOpen ? "hidden" : "auto";
  }, [isSliderOpen]);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && closeSlider();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: sliderImages.length > 1,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipe: true,
    arrows: sliderImages.length > 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    afterChange: (i) => setCurrentSlide(i),
  };

  const toggleFullscreen = () => {
    setIsFullscreen((p) => !p);
    setTimeout(() => sliderRef.current?.slickGoTo(currentSlide), 50);
  };

  // pagination logic
  const start = (currentPage - 1) * itemsPerPage;
  const currentItems = portfolioItems.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(portfolioItems.length / itemsPerPage);

  return (
    <section className="portfolio" id="portfolio">
      <div className="container">
        <div className="section-title">
          <h2>Our Portfolio</h2>
          <p>This is some of the memories and works</p>
        </div>

        <div className="portfolio-grid">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="portfolio-item"
              onClick={() => openSlider(item)}
            >
              <img src={item.images?.[0]} alt={item.title} loading="lazy" />
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
      </div>

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
                  <img src={img} alt={`Slide ${i + 1}`} />
                </div>
              ))}
            </Slider>

            <div className="slider-counter">
              {currentSlide + 1} / {sliderImages.length}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Portfolio;
