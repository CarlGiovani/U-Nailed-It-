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
      { threshold: 0.15 },
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="about-us" id="about-us">
      <div className="container">
        <div
          className="about-header reveal"
          ref={(el) => (cardsRef.current[0] = el)}
        >
          <span className="about-kicker">About Us</span>
          <h2>The artist, the story, and the care behind every set</h2>
          <p>
            Get to know the heart of UNAiledIt — from the founder’s passion to
            the premium experience behind every appointment.
          </p>
        </div>

        <div className="about-grid">
          <article
            className="about-card about-card-founder reveal"
            ref={(el) => (cardsRef.current[1] = el)}
          >
            <div className="about-founder-top">
              <div className="owner-photo">
                <img src={profile} alt="Alliyah Bangayan" loading="lazy" />
              </div>

              <div className="founder-meta">
                <span className="about-label">Founder</span>
                <h3>Alliyah Bangayan</h3>
                <p className="owner-role">Founder & Lead Nail Artist</p>
              </div>
            </div>

            <p className="owner-bio">
              Hi, I’m Alliyah — your nail artist! I’m 21 years old and
              passionate about creating high quality, detailed and clean nails.
              Aside from nail artistry, I also love the arts from portrait
              drawing to canvas painting using oil or acrylic. During my senior
              high school years, I took the Visual Arts and Multimedia Arts
              track, which helped me strengthen my creativity and attention to
              detail. Before entering the nail industry, I used to do hair and
              makeup services as a sideline. I graduated from the University of
              Makati with a course in Customer Service in Communication, and I
              was also a student artist and former member of the University of
              Makati Chorale. Today, I’ve turned my creative passion into a
              full-time business, helping clients express their individuality
              and confidence through beautiful, high-quality nails. I’ve taken
              three professional nail enhancement courses such as Nail Art,
              Soft-Gel Extensions, and Hard/Builder Gel which helped me grow my
              passion and skills in the nail industry. These experiences shaped
              me into the professional nail artist I am today, and I’m proud to
              be a member of Nail Artists Philippines!
            </p>

            <p className="owner-bio">
              UNAiledIt was built with a focus on artistry, hygiene, comfort,
              and personalized service — so every appointment feels premium from
              start to finish.
            </p>

            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </article>

          <article
            className="about-card reveal"
            ref={(el) => (cardsRef.current[2] = el)}
          >
            <div className="card-head">
              <span className="about-label">Journey</span>
              <h3>Our Journey</h3>
            </div>

            <ul className="timeline">
              <li>
                <strong>2018</strong>
                <span>
                  Studio founded with a passion for detailed nail artistry
                </span>
              </li>
              <li>
                <strong>2019</strong>
                <span>
                  Earned PNTA certification and strengthened service quality
                </span>
              </li>
              <li>
                <strong>2021</strong>
                <span>
                  Gained features, collaborations, and growing recognition
                </span>
              </li>
              <li>
                <strong>2024</strong>
                <span>
                  Expanded premium nail services and refined the client
                  experience
                </span>
              </li>
            </ul>
          </article>

          <article
            className="about-card reveal"
            ref={(el) => (cardsRef.current[3] = el)}
          >
            <div className="card-head">
              <span className="about-label">Studio</span>
              <h3>Our Studio</h3>
            </div>

            <p className="studio-text">
              A premium nail studio based in Makati City, built around hygiene,
              artistry, comfort, and personalized service.
            </p>

            <ul className="studio-points">
              <li>Clean and careful nail care</li>
              <li>Elegant designs tailored to your style</li>
              <li>Relaxing appointments with premium attention</li>
              <li>Consistent quality in every set</li>
            </ul>
          </article>

          <article
            className="about-card about-card-gallery reveal"
            ref={(el) => (cardsRef.current[4] = el)}
          >
            <div className="card-head">
              <span className="about-label">Portfolio</span>
              <h3>Our Work</h3>
            </div>

            <div className="mini-gallery">
              <img src={img1} alt="Nail art sample 1" loading="lazy" />
              <img src={img2} alt="Nail art sample 2" loading="lazy" />
              <img src={img3} alt="Nail art sample 3" loading="lazy" />
              <img src={img4} alt="Nail art sample 4" loading="lazy" />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
