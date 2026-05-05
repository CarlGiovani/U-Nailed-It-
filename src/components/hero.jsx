import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add("hero-ready");
  }, []);

  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-overlay" />

      <div className="container hero-grid">
        {/* LEFT */}
        <div className="hero-left">
          <div className="hero-badge">✨ Trusted Nail Studio Nearby</div>

          <h1 className="hero-title">
            Book your perfect nails
            <span>in just a few clicks</span>
          </h1>

          <p className="hero-subtext">
            Professional nail artistry designed for long-lasting beauty,
            comfort, and confidence.
          </p>

          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => navigate("/booking")}
            >
              Book Now
            </button>
          </div>

          <div className="hero-trust">
            <span>⭐ 5.0 (200+ Reviews)</span>
            <span>💅 Certified Artist</span>
            <span>⚡ Fast Service</span>
          </div>

          <div className="hero-urgency">Limited slots available daily</div>
        </div>

        {/* RIGHT */}
        <div className="hero-right">
          <div className="hero-card">
            <div className="hero-card-header">
              <h3>Studio Location</h3>
              <p>68 San Guillermo Ave, Pasig City</p>
            </div>

            <div className="hero-map-wrapper">
              <iframe
                className="hero-map"
                title="Studio Location"
                loading="lazy"
                src="https://www.google.com/maps?q=68+San+Guillermo+Ave,+Pasig,+1600+Metro+Manila,+Philippines&output=embed&hl=en&z=18&t=k"
              />
            </div>

            {/* FLOATING MAP ACTIONS (better UX) */}
            <div className="hero-map-actions">
              <a
                href="https://www.google.com/maps/search/?api=1&query=68+San+Guillermo+Ave,+Pasig,+1600+Metro+Manila,+Philippines"
                target="_blank"
                rel="noreferrer"
              >
                View Map
              </a>

              <a
                href="https://www.google.com/maps/dir/?api=1&destination=68+San+Guillermo+Ave,+Pasig,+1600+Metro+Manila,+Philippines"
                target="_blank"
                rel="noreferrer"
              >
                Get Directions
              </a>
            </div>

            <button
              onClick={() => navigate("/booking")}
              className="hero-book-btn"
            >
              Book This Location
            </button>
          </div>
        </div>
      </div>

      <div className="mobile-cta">
        <button onClick={() => navigate("/booking")}>Book Appointment</button>
      </div>
    </section>
  );
};

export default Hero;
