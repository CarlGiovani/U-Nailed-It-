const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-about">
            <div className="footer-logo">UNailedIt</div>
            <p>
              Premium nail design studio specializing in custom nail art, gel
              manicures, nail extensions, and nail care services. We transform
              your nails into beautiful works of art.
            </p>
            <div className="social-icons">
              <a href="#" className="social-icon" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="social-icon" aria-label="TikTok">
                <i className="fab fa-tiktok"></i>
              </a>
              <a href="#" className="social-icon" aria-label="Pinterest">
                <i className="fab fa-pinterest-p"></i>
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#booking">Book Appointment</a></li>
              <li><a href="#reviews">Reviews</a></li>
              <li><a href="#check-booking">Check My Booking</a></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h3>Contact Us</h3>
            <p>
              <i className="fas fa-map-marker-alt"></i> 123 Beauty Street, Makati
              City, Philippines
            </p>
            <p><i className="fas fa-phone"></i> (02) 8123-4567</p>
            <p><i className="fas fa-envelope"></i> hello@unailedit.com</p>
            <p><i className="fas fa-clock"></i> Open Tue-Sun: 10:00 AM - 7:00 PM</p>
          </div>
        </div>

        <div className="copyright">
          <p>
            &copy; {new Date().getFullYear()} UNailedIt. All rights reserved. |
            <a href="#"> Privacy Policy</a> |
            <a href="#"> Terms & Conditions</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;