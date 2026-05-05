import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const studioAddress = "68 San Guillermo Ave, Pasig, 1600 Metro Manila, Philippines";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(studioAddress)}`;

  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-overlay" />

      <div className="container hero-grid">
        {/* LEFT CONTENT – aligned to the left, no centering */}
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

          {/* BUTTON + LOCATION LINK – side by side, left aligned */}
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate("/booking")}>
              Book Now
            </button>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="location-link"
            >
              <span className="pin-icon">📍</span> View Location
            </a>
          </div>

          <div className="hero-trust">
            <span>⭐ 5.0 (200+ Reviews)</span>
            <span>💅 Certified Artist</span>
            <span>⚡ Fast Service</span>
          </div>

          <div className="hero-urgency">Limited slots available daily</div>
        </div>
      </div>
    </section>
  );
};

export default Hero;