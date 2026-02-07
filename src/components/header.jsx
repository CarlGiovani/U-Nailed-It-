import { useEffect, useState } from "react";
import "../styles/header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const scrollToSection = (sectionId) => {
    closeMenu();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setIsMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="container header-container">
          <div className="logo" onClick={() => scrollToSection("home")}>
            <div className="logo-icon">
              <i className="fas fa-spa"></i>
            </div>
            <div className="logo-text">UNailedIt</div>
          </div>

          {/* HAMBURGER */}
          <button className="mobile-menu-btn" onClick={toggleMenu}>
            <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>
          </button>

          {/* MENU */}
          <nav className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("home");
              }}
            >
              Home
            </a>

            <a
              href="#portfolio"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("portfolio");
              }}
            >
              Portfolio
            </a>

            <a
              href="#promos"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("promos");
              }}
            >
              Promos
            </a>

            <a
              href="#policies"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("policies");
              }}
            >
              Policies
            </a>

            <a
              href="#booking"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("booking");
              }}
            >
              Book Now
            </a>

            <a
              href="#reviews"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("reviews");
              }}
            >
              Reviews
            </a>

            <a
              href="#check-booking"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("check-booking");
              }}
            >
              Check Booking
            </a>
          </nav>
        </div>
      </header>

      {/* OVERLAY */}
      <div
        className={`nav-overlay ${isMenuOpen ? "show" : ""}`}
        onClick={closeMenu}
      ></div>
    </>
  );
};

export default Header;
