import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {
    closeMenu();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header>
      <div className="container header-container">
        <div className="logo">
          <div className="logo-icon">
            <i className="fas fa-spa"></i>
          </div>
          <div className="logo-text">UNailedIt</div>
        </div>

        <div className="mobile-menu-btn" onClick={toggleMenu}>
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </div>

        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a>
          <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Services</a>
          <a href="#portfolio" onClick={(e) => { e.preventDefault(); scrollToSection('portfolio'); }}>Portfolio</a>
          <a href="#promos" onClick={(e) => { e.preventDefault(); scrollToSection('promos'); }}>Promos</a>
          <a href="#policies" onClick={(e) => { e.preventDefault(); scrollToSection('policies'); }}>Policies</a>
          <a href="#booking" onClick={(e) => { e.preventDefault(); scrollToSection('booking'); }}>Book Now</a>
          <a href="#reviews" onClick={(e) => { e.preventDefault(); scrollToSection('reviews'); }}>Reviews</a>
          <a href="#check-booking" onClick={(e) => { e.preventDefault(); scrollToSection('check-booking'); }}>Check Booking</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;