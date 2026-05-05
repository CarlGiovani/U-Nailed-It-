import { memo, useMemo } from "react";
import {
  FaClock,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaTiktok,
} from "react-icons/fa";

const Footer = memo(() => {
  const currentYear = new Date().getFullYear();

  /* Memoized static data → prevents re-creation every render */
  const socialLinks = useMemo(
    () => [
      { icon: FaFacebookF, href: "#", label: "Facebook" },
      { icon: FaInstagram, href: "#", label: "Instagram" },
      { icon: FaTiktok, href: "#", label: "TikTok" },
    ],
    []
  );

  const quickLinks = useMemo(
    () => [
      { name: "Home", href: "#home" },
      { name: "Services", href: "#services" },
      { name: "Book Appointment", href: "#booking" },
      { name: "Reviews", href: "#reviews" },
      { name: "Check My Booking", href: "#check-booking" },
    ],
    []
  );

  const contactInfo = useMemo(
    () => [
      { icon: FaMapMarkerAlt, text: "123 Beauty Street, Makati City, Philippines" },
      { icon: FaPhoneAlt, text: "(02) 8123-4567" },
      { icon: FaEnvelope, text: "hello@unailedit.com" },
      { icon: FaClock, text: "Open Tue-Sun: 10:00 AM - 7:00 PM" },
    ],
    []
  );

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">

          {/* ABOUT */}
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
              {socialLinks.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="social-icon"
                    aria-label={item.label}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <IconComponent />
                  </a>
                );
              })}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div className="footer-contact">
            <h3>Contact Us</h3>
            <div className="footer-contact-list">
              {contactInfo.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <p key={idx}>
                    <IconComponent aria-hidden="true" />
                    <span>{item.text}</span>
                  </p>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} UNailedIt. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
export default Footer;