import { useEffect, useRef } from "react";
import img1 from "../assets/images/img1.jpg";
import img2 from "../assets/images/img2.jpg";
import img3 from "../assets/images/img3.jpg";
import img4 from "../assets/images/img4.jpg";
import profile from "../assets/images/profile.jpg";

const AboutUs = () => {
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.2 }
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="about-us" id="about-us">
      <div className="container">
        <div className="section-title">
          <h2>About Us</h2>
          <p>The artist, the journey, and the craft behind every set</p>
        </div>

        <div className="about-board">
          {/* FOUNDER CARD */}
          <div
            className="board-card founder-card reveal"
            ref={(el) => (cardsRef.current[0] = el)}
          >
            <span className="pin pink"></span>

            <div className="owner-photo">
              <img
                src={profile}
                alt="Founder"
                loading="lazy"
              />
            </div>

            <h3>Liana Santos</h3>
            <span className="owner-role">Founder & Lead Nail Artist</span>

            <p className="owner-bio">
              Hi, I’m Alliyah — your nail artist! I’m 21 years old and
              passionate about creating high quality, detailed and clean nails...
            </p>

            <div className="social-links">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
            </div>
          </div>

          {/* JOURNEY CARD */}
          <div
            className="board-card journey-card reveal"
            ref={(el) => (cardsRef.current[1] = el)}
          >
            <span className="pin gold"></span>
            <h3>Our Journey</h3>
            <ul className="timeline">
              <li><strong>2018</strong> Studio founded</li>
              <li><strong>2019</strong> PNTA certified</li>
              <li><strong>2021</strong> Media features & collabs</li>
              <li><strong>2024</strong> Premium nail services expanded</li>
            </ul>
          </div>

          {/* STUDIO CARD */}
          <div
            className="board-card studio-card reveal"
            ref={(el) => (cardsRef.current[2] = el)}
          >
            <span className="pin pink"></span>
            <h3>Our Studio</h3>
            <p>
              A premium nail studio based in Makati City, built around hygiene,
              artistry, and personalized service.
            </p>
          </div>

          {/* GALLERY CARD */}
          <div
            className="board-card gallery-card reveal"
            ref={(el) => (cardsRef.current[3] = el)}
          >
            <span className="tape"></span>
            <h3>Our Work</h3>
            <div className="mini-gallery">
              <img src={img1} alt="" />
              <img src={img2} alt="" />
              <img src={img3} alt="" />
              <img src={img4} alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
