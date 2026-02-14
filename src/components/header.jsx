import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import "../styles/header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  // 🔥 SCROLL FUNCTION
  const scrollToSection = (sectionId) => {
    closeMenu();

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // 🔥 LOGO CLICK
  const handleLogoClick = () => {
    scrollToSection("home");
  };

  // AUTO CLOSE MENU ON RESIZE
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="container header-container">
          {/* LEFT: LOGO */}
          <div className="logo" onClick={handleLogoClick}>
            <img src={logo} alt="UNAiledIt Logo" />
          </div>

          {/* CENTER: NAVIGATION */}
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
              href="#about-us"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("about-us");
              }}
            >
              About Us
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
          </nav>

          {/* RIGHT: HAMBURGER */}
          <button
            className={`mobile-menu-btn ${isMenuOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* OVERLAY */}
      <div
        className={`nav-overlay ${isMenuOpen ? "show" : ""}`}
        onClick={closeMenu}
      />
    </>
  );
};

export default Header;
