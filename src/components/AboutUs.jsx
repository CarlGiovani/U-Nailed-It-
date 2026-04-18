import { useEffect, useRef, useState } from "react";
import img1 from "../assets/images/img1.jpg";
import img2 from "../assets/images/img2.jpg";
import img3 from "../assets/images/img3.jpg";
import img4 from "../assets/images/img4.jpg";
import profile from "../assets/images/profile.jpg";

const GALLERY_IMAGES = [
  {
    src: img1,
    alt: "Studio sample work 1",
    tag: "Soft Gel",
    title: "Elegant soft gel finish",
  },
  {
    src: img2,
    alt: "Studio sample work 2",
    tag: "Nail Art",
    title: "Detailed custom nail art",
  },
  {
    src: img3,
    alt: "Studio sample work 3",
    tag: "Builder Gel",
    title: "Structured and polished sets",
  },
  {
    src: img4,
    alt: "Studio sample work 4",
    tag: "Luxury Set",
    title: "Premium handcrafted design",
  },
];

/*
  PALITAN MO ITO NG ACTUAL GOOGLE MAPS EMBED URL MO.
  Example:
  https://www.google.com/maps/embed?pb=!1m18!...
*/
const MAP_EMBED_URL =
  "https://www.google.com/maps?q=Makati%20City&z=14&output=embed";

const AboutUs = () => {
  const cardsRef = useRef([]);
  const galleryTrackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("show");
        });
      },
      { threshold: 0.15 },
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = galleryTrackRef.current;
    if (!track) return;

    const handleScroll = () => {
      const card = track.querySelector(".gallery-slide");
      if (!card) return;

      const cardWidth = card.offsetWidth + 16;
      const nextIndex = Math.round(track.scrollLeft / cardWidth);
      setActiveIndex(nextIndex);
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => track.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollGallery = (direction) => {
    const track = galleryTrackRef.current;
    if (!track) return;

    const card = track.querySelector(".gallery-slide");
    if (!card) return;

    const gap = 16;
    const scrollAmount = card.offsetWidth + gap;

    track.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="about-us" id="about-us">
      <div className="about-blur about-blur-1" />
      <div className="about-blur about-blur-2" />

      <div className="container">
        <div
          className="about-header reveal"
          ref={(el) => (cardsRef.current[0] = el)}
        >
          <span className="about-kicker">About Us</span>
          <h2>Luxury nail artistry with a softer, more personal studio feel</h2>
          <p>
            Discover the artist, the space, and the signature work behind
            UNAiledIt — where every appointment is designed to feel refined,
            relaxing, and beautifully personalized.
          </p>
        </div>

        <div className="about-grid">
          {/* Founder */}
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
              passionate about creating high-quality, detailed, and clean nails.
              Aside from nail artistry, I also love the arts — from portrait
              drawing to canvas painting using oil or acrylic. During my senior
              high school years, I took the Visual Arts and Multimedia Arts
              track, which helped strengthen my creativity and attention to
              detail.
            </p>

            <p className="owner-bio">
              Before entering the nail industry, I also did hair and makeup
              services as a sideline. I graduated from the University of Makati
              in Customer Service in Communication, and I was also a student
              artist and former member of the University of Makati Chorale.
            </p>

            <p className="owner-bio">
              Today, I’ve turned my creative passion into a full-time business,
              helping clients express their individuality and confidence through
              beautiful, high-quality nails. I’ve also completed professional
              nail enhancement courses in Nail Art, Soft-Gel Extensions, and
              Hard/Builder Gel, which shaped me into the nail artist I am today.
            </p>

            <p className="owner-bio owner-bio-last">
              UNAiledIt was built around artistry, hygiene, comfort, and
              personalized care — so every appointment feels premium from start
              to finish.
            </p>

            <div className="about-founder-highlights">
              <div className="mini-stat">
                <strong>3+</strong>
                <span>Professional nail courses</span>
              </div>
              <div className="mini-stat">
                <strong>Premium</strong>
                <span>Studio-level client care</span>
              </div>
              <div className="mini-stat">
                <strong>Custom</strong>
                <span>Designs tailored to your style</span>
              </div>
            </div>

            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </article>

          {/* Journey */}
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
                  Started with a passion for precision, beauty, and thoughtful
                  nail artistry
                </span>
              </li>
              <li>
                <strong>2019</strong>
                <span>
                  Continued skill development and strengthened service quality
                </span>
              </li>
              <li>
                <strong>2021</strong>
                <span>
                  Built more recognition through refined work and growing client
                  trust
                </span>
              </li>
              <li>
                <strong>2024</strong>
                <span>
                  Expanded premium services and elevated the overall studio
                  experience
                </span>
              </li>
            </ul>
          </article>

          {/* Studio */}
          <article
            className="about-card reveal"
            ref={(el) => (cardsRef.current[3] = el)}
          >
            <div className="card-head">
              <span className="about-label">Studio</span>
              <h3>Our Studio Experience</h3>
            </div>

            <p className="studio-text">
              A pink-forward premium nail studio in Makati City designed around
              comfort, cleanliness, artistry, and a more intimate luxury feel.
            </p>

            <ul className="studio-points">
              <li>Relaxing, feminine, and welcoming studio vibe</li>
              <li>Clean and careful nail preparation every appointment</li>
              <li>Custom luxury designs based on your preferred style</li>
              <li>More personalized one-on-one premium service</li>
            </ul>
          </article>

          {/* Gallery */}
          <article
            className="about-card about-card-gallery reveal"
            ref={(el) => (cardsRef.current[4] = el)}
          >
            <div className="card-head card-head-split">
              <div>
                <span className="about-label">Gallery</span>
                <h3>Studio & Sample Works</h3>
              </div>

              <div className="gallery-controls">
                <button
                  type="button"
                  className="gallery-nav"
                  aria-label="Previous gallery item"
                  onClick={() => scrollGallery("prev")}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="gallery-nav"
                  aria-label="Next gallery item"
                  onClick={() => scrollGallery("next")}
                >
                  ›
                </button>
              </div>
            </div>

            <p className="gallery-subtext">
              Swipe left or right to browse your studio photos and featured nail
              sets.
            </p>

            <div className="gallery-track" ref={galleryTrackRef}>
              {GALLERY_IMAGES.map((image, index) => (
                <article className="gallery-slide" key={index}>
                  <div className="gallery-image-wrap">
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="gallery-slide-content">
                    <span className="gallery-tag">{image.tag}</span>
                    <h4>{image.title}</h4>
                  </div>
                </article>
              ))}
            </div>

            <div className="gallery-dots" aria-label="Gallery position">
              {GALLERY_IMAGES.map((_, index) => (
                <span
                  key={index}
                  className={`gallery-dot ${
                    activeIndex === index ? "active" : ""
                  }`}
                />
              ))}
            </div>
          </article>

          {/* Location */}
          <article
            className="about-card about-card-location reveal"
            ref={(el) => (cardsRef.current[5] = el)}
          >
            <div className="card-head">
              <span className="about-label">Location</span>
              <h3>Visit Our Studio</h3>
            </div>

            <p className="studio-text">
              Located in Makati City for clients who want elegant, detailed, and
              premium nail services in a relaxing studio setup.
            </p>

            <div className="location-grid">
              <div className="location-info">
                <div className="location-item">
                  <strong>Studio Address</strong>
                  <span>
                    Put your full studio address here
                    <br />
                    Example: Makati City, Metro Manila
                  </span>
                </div>

                <div className="location-item">
                  <strong>Landmark</strong>
                  <span>Put nearby landmark here for easier client access</span>
                </div>

                <div className="location-item">
                  <strong>Map Setup</strong>
                  <span>
                    You can embed Google Maps here, or replace this with a
                    location photo / studio exterior image.
                  </span>
                </div>
              </div>

              <div className="map-frame-wrap">
                <iframe
                  title="UNAiledIt Studio Location"
                  src={MAP_EMBED_URL}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
