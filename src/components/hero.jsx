import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";

const Hero = () => {
  const heroRef = useRef(null);
  const navigate = useNavigate();

  const goToBookingPage = () => {
    navigate("/booking");
  };

  useEffect(() => {
    const el = heroRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.classList.add("hero-show");
      });
    }
  }, []);

  return (
    <section className="hero hero-reveal" id="home" ref={heroRef}>
      <div className="hero-bg-glow hero-bg-glow-1" />
      <div className="hero-bg-glow hero-bg-glow-2" />
      <div className="hero-overlay" />

      <div className="container hero-inner">
        <div className="hero-content">
          <div className="hero-copy">
            <span className="hero-kicker fade-up delay-1">
              Premium Nail Studio
            </span>

            <h1 className="fade-up delay-2">
              Elegant nails,
              <span> made to match you.</span>
            </h1>

            <p className="fade-up delay-3">
              Clean, stylish, and personalized nail services designed to make
              every appointment feel premium, relaxing, and worth coming back
              for.
            </p>

            <div className="hero-actions fade-up delay-4">
              <button
                className="hero-btn hero-btn-primary"
                onClick={goToBookingPage}
              >
                Book Appointment
              </button>

              <a href="#services" className="hero-btn hero-btn-secondary">
                View Services
              </a>
            </div>

            <div className="hero-proof fade-up delay-5">
              <div className="hero-proof-item">
                <strong>Premium care</strong>
                <span>Clean, safe, and relaxing service</span>
              </div>

              <div className="hero-proof-item">
                <strong>Custom style</strong>
                <span>Looks designed around your preference</span>
              </div>
            </div>
          </div>

          <div className="hero-visual fade-up delay-3">
            <div className="hero-visual-card">
              <div className="hero-visual-ring" />
              <div className="hero-visual-glass" />

              <div className="hero-logo-wrap">
                <img src={logo} alt="UNAiledIt Logo" />
              </div>

              <div className="hero-chip hero-chip-top">Luxury</div>
              <div className="hero-chip hero-chip-bottom">Modern Beauty</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
