import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import "../styles/header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);

  const go = (path) => {
    closeMenu();
    navigate(path);
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
          <div className="logo" onClick={() => go("/")}>
            <img src={logo} alt="Logo" />
          </div>

          {/* DESKTOP */}
          <nav className="desktop-nav">
            <a onClick={() => go("/")}>Home</a>
            <a onClick={() => go("/about")}>About</a>
            <a onClick={() => go("/portfolio")}>Portfolio</a>
            <a onClick={() => go("/promos")}>Promos</a>
            <a onClick={() => go("/booking")}>Book Now</a>
            <a onClick={() => go("/reviews")}>Reviews</a>
          </nav>

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* MOBILE */}
      <nav className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
        <a onClick={() => go("/")}>Home</a>
        <a onClick={() => go("/about")}>About</a>
        <a onClick={() => go("/portfolio")}>Portfolio</a>
        <a onClick={() => go("/promos")}>Promos</a>
        <a onClick={() => go("/booking")}>Book Now</a>
        <a onClick={() => go("/reviews")}>Reviews</a>
      </nav>

      {isMenuOpen && (
        <div className="nav-overlay" onClick={closeMenu} />
      )}
    </>
  );
};

export default Header;