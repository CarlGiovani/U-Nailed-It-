import {
  FaClock,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaTiktok,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-about">
            <div className="footer-brand">
              <span className="footer-logo">UNailedIt</span>
              <span className="footer-badge">Premium Nail Studio</span>
            </div>

            <p className="footer-description">
              Premium nail design studio specializing in custom nail art, gel
              manicures, nail extensions, and nail care services designed to
              make every visit feel elegant, relaxing, and worth coming back to.
            </p>

            <div className="social-icons">
              <a href="#" className="social-icon" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="social-icon" aria-label="TikTok">
                <FaTiktok />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#services">Services</a>
              </li>
              <li>
                <a href="#booking">Book Appointment</a>
              </li>
              <li>
                <a href="#reviews">Reviews</a>
              </li>
              <li>
                <a href="#check-booking">Check My Booking</a>
              </li>
            </ul>
          </div>

          <div className="footer-contact">
            <h3>Contact Us</h3>

            <div className="footer-contact-list">
              <p>
                <FaMapMarkerAlt />
                <span>123 Beauty Street, Makati City, Philippines</span>
              </p>

              <p>
                <FaPhoneAlt />
                <span>(02) 8123-4567</span>
              </p>

              <p>
                <FaEnvelope />
                <span>hello@unailedit.com</span>
              </p>

              <p>
                <FaClock />
                <span>Open Tue-Sun: 10:00 AM - 7:00 PM</span>
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} UNailedIt. All rights reserved.
          </p>

          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
