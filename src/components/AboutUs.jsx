import img1 from "../assets/images/img1.jpg";
import img2 from "../assets/images/img2.jpg";
import img3 from "../assets/images/img3.jpg";
import img4 from "../assets/images/img4.jpg";
import profile from "../assets/images/profile.jpg"

const AboutUs = () => {
  return (
    <section className="about-us" id="about-us">
      <div className="container">
        <div className="section-title">
          <h2>About Us</h2>
          <p>The artist, the journey, and the craft behind every set</p>
        </div>

        <div className="about-board">
          {/* FOUNDER CARD */}
          <div className="board-card founder-card">
            <span className="pin pink"></span>

            <div className="owner-photo">
              <img
                src={profile}
                alt="Liana Santos - Founder & Lead Nail Artist"
                loading="lazy"
              />
            </div>

            <h3>Liana Santos</h3>
            <span className="owner-role">Founder & Lead Nail Artist</span>

            <p className="owner-bio">
              With over 8 years of professional experience, Liana blends
              creativity, precision, and global trends to create modern,
              personalized nail art that empowers confidence.
            </p>

            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* JOURNEY CARD */}
          <div className="board-card journey-card">
            <span className="pin gold"></span>
            <h3>Our Journey</h3>

            <ul className="timeline">
              <li>
                <strong>2018</strong> Studio founded
              </li>
              <li>
                <strong>2019</strong> PNTA certified
              </li>
              <li>
                <strong>2021</strong> Media features & collabs
              </li>
              <li>
                <strong>2024</strong> Premium nail services expanded
              </li>
            </ul>

            <div className="badges">
              <span className="badge">PNTA Certified</span>
              <span className="badge">Licensed Studio</span>
              <span className="badge">Eco Products</span>
              <span className="badge">Intl Training</span>
            </div>
          </div>

          {/* STUDIO CARD */}
          <div className="board-card studio-card">
            <span className="pin pink"></span>
            <h3>Our Studio</h3>

            <p>
              A premium nail studio based in Makati City, built around hygiene,
              artistry, and personalized service. Every detail is intentional —
              from tools to techniques.
            </p>

            <ul className="studio-points">
              <li>Custom nail designs</li>
              <li>Strict hygiene standards</li>
              <li>High-quality & eco-friendly products</li>
            </ul>
          </div>

          {/* MINI GALLERY */}
          <div className="board-card gallery-card">
            <span className="tape"></span>
            <h3>Our Work</h3>

            <div className="mini-gallery">
              <img src={img1} alt="Nail art 1" />
              <img src={img2} alt="Nail art 2" />
              <img src={img3} alt="Nail art 3" />
              <img src={img4} alt="Nail art 4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
