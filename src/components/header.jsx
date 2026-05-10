import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import "../styles/header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);

  const go = useCallback((path) => {
    closeMenu();
    navigate(path);
  }, [closeMenu, navigate]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "pan-y pinch-zoom";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="site-header">
        <div className="container header-container">
          <div className="logo" onClick={() => go("/")} role="button" tabIndex={0}>
            <img src={logo} alt="Company Logo" />
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav className="desktop-nav" aria-label="Main navigation">
            <a onClick={() => go("/")} onKeyDown={(e) => e.key === "Enter" && go("/")} role="button" tabIndex={0}>Home</a>
            <a onClick={() => go("/about")} onKeyDown={(e) => e.key === "Enter" && go("/about")} role="button" tabIndex={0}>About</a>
            <a onClick={() => go("/portfolio")} onKeyDown={(e) => e.key === "Enter" && go("/portfolio")} role="button" tabIndex={0}>Portfolio</a>
            <a onClick={() => go("/promos")} onKeyDown={(e) => e.key === "Enter" && go("/promos")} role="button" tabIndex={0}>Promos</a>
            <a onClick={() => go("/booking")} onKeyDown={(e) => e.key === "Enter" && go("/booking")} role="button" tabIndex={0}>Book Now</a>
            <a onClick={() => go("/reviews")} onKeyDown={(e) => e.key === "Enter" && go("/reviews")} role="button" tabIndex={0}>Reviews</a>
          </nav>

          <button
            className="mobile-menu-btn"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER */}
      <nav className={`nav-menu ${isMenuOpen ? "active" : ""}`} aria-label="Mobile navigation">
        <a onClick={() => go("/")} onKeyDown={(e) => e.key === "Enter" && go("/")} role="button" tabIndex={0}>Home</a>
        <a onClick={() => go("/about")} onKeyDown={(e) => e.key === "Enter" && go("/about")} role="button" tabIndex={0}>About</a>
        <a onClick={() => go("/portfolio")} onKeyDown={(e) => e.key === "Enter" && go("/portfolio")} role="button" tabIndex={0}>Portfolio</a>
        <a onClick={() => go("/promos")} onKeyDown={(e) => e.key === "Enter" && go("/promos")} role="button" tabIndex={0}>Promos</a>
        <a onClick={() => go("/booking")} onKeyDown={(e) => e.key === "Enter" && go("/booking")} role="button" tabIndex={0}>Book Now</a>
        <a onClick={() => go("/reviews")} onKeyDown={(e) => e.key === "Enter" && go("/reviews")} role="button" tabIndex={0}>Reviews</a>
      </nav>

      {isMenuOpen && (
        <div className="nav-overlay" onClick={closeMenu} aria-hidden="true" />
      )}
    </>
  );
};

export default Header;