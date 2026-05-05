import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import facebook from "../assets/images/facebook.png";
import img1 from "../assets/images/img1.jpg";
import img2 from "../assets/images/img2.jpg";
import img3 from "../assets/images/img3.jpg";
import img4 from "../assets/images/img4.jpg";
import profile from "../assets/images/profile.jpg";
import studioImg1 from "../assets/images/STUDIO/studioImg1.jpg";
import studioImg2 from "../assets/images/STUDIO/studioImg2.jpg";
import studioImg3 from "../assets/images/STUDIO/studioImg3.jpg";
import studioImg4 from "../assets/images/STUDIO/studioImg4.jpg";
import studioImg5 from "../assets/images/STUDIO/studioImg5.jpg";
import studioImg6 from "../assets/images/STUDIO/studioImg6.jpg";

import "../styles/about-us.css";

// Static data (memoized by being defined outside)
const GALLERY_IMAGES = [
  { src: img1, alt: "Soft Gel", tag: "Soft Gel", title: "Elegant soft gel finish" },
  { src: img2, alt: "Nail Art", tag: "Art", title: "Detailed custom nail art" },
  { src: img3, alt: "Builder Gel", tag: "Builder", title: "Structured gel sets" },
  { src: img4, alt: "Luxury Set", tag: "Luxury", title: "Premium handcrafted design" },
];

const STUDIO_IMAGES = [
  { src: studioImg1, alt: "Relaxing nail station", title: "Calm & Hygienic" },
  { src: studioImg2, alt: "Premium gel collection", title: "Relaxing" },
  { src: studioImg3, alt: "Cozy studio corner", title: "Cozy Ambience" },
  { src: studioImg4, alt: "Nail art workspace", title: "Creative Space" },
  { src: studioImg5, alt: "Modern studio setup", title: "Contemporary Design" },
  { src: studioImg6, alt: "Relaxing spa-like environment", title: "Well experience" },
];

const CERTIFICATES = [
  { name: "Advanced Soft Gel Certificate", issuer: "NailPro Academy", year: "2020", icon: "🏅" },
  { name: "Builder Gel Masterclass", issuer: "IBD Professional", year: "2021", icon: "📜" },
  { name: "3D Nail Art Specialist", issuer: "ArtNail Institute", year: "2022", icon: "🎨" },
  { name: "Best Nail Art Studio 2024", issuer: "Local Beauty Awards", year: "2024", icon: "🏆" },
];

const CORE_VALUES = [
  { title: "Premium Quality", description: "Only highest-grade gels, glitters, and tools from trusted brands.", icon: "💎" },
  { title: "Hygiene First", description: "Medical-grade sterilization, single-use files, and sanitized stations.", icon: "🧼" },
  { title: "Custom Artistry", description: "Every design is unique — we bring your nail visions to life.", icon: "🎨" },
  { title: "Relaxed Experience", description: "Calm ambiance, ergonomic seating, and a glass of bubbly.", icon: "🕯️" },
];

const FACEBOOK_PAGE = {
  name: "Facebook",
  handle: "unaileditstudio",
  url: "https://web.facebook.com/UNAILEDitbyAlliyah",
  followers: "4.1K",
  likes: "4.1K",
  image: facebook,
};

export default function AboutUs() {
  const cardsRef = useRef([]);
  const trackRef = useRef(null);
  const studioTrackRef = useRef(null);
  const firstCardRef = useRef(null);
  const firstStudioCardRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [studioActiveIndex, setStudioActiveIndex] = useState(0);
  const navigate = useNavigate();

  // Reveal animation (IntersectionObserver)
  useEffect(() => {
    const elements = cardsRef.current.filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -20px 0px" }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Nail gallery scroll sync
  const handleGalleryScroll = useCallback(() => {
    const track = trackRef.current;
    const card = firstCardRef.current;
    if (!track || !card) return;
    const cardSize = card.offsetWidth + 16;
    const index = Math.round(track.scrollLeft / cardSize);
    const clamped = Math.min(Math.max(0, index), GALLERY_IMAGES.length - 1);
    if (clamped !== activeIndex) setActiveIndex(clamped);
  }, [activeIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener("scroll", handleGalleryScroll, { passive: true });
    return () => track.removeEventListener("scroll", handleGalleryScroll);
  }, [handleGalleryScroll]);

  // Studio gallery scroll sync
  const handleStudioScroll = useCallback(() => {
    const track = studioTrackRef.current;
    const card = firstStudioCardRef.current;
    if (!track || !card) return;
    const cardSize = card.offsetWidth + 24;
    const index = Math.round(track.scrollLeft / cardSize);
    const clamped = Math.min(Math.max(0, index), STUDIO_IMAGES.length - 1);
    if (clamped !== studioActiveIndex) setStudioActiveIndex(clamped);
  }, [studioActiveIndex]);

  useEffect(() => {
    const track = studioTrackRef.current;
    if (!track) return;
    track.addEventListener("scroll", handleStudioScroll, { passive: true });
    return () => track.removeEventListener("scroll", handleStudioScroll);
  }, [handleStudioScroll]);

  // Resize handlers
  const handleResize = useCallback(() => {
    handleGalleryScroll();
    handleStudioScroll();
  }, [handleGalleryScroll, handleStudioScroll]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Navigation functions
  const scrollGallery = useCallback((dir) => {
    const track = trackRef.current;
    const card = firstCardRef.current;
    if (!track || !card) return;
    const amt = card.offsetWidth + 16;
    track.scrollBy({ left: dir === "next" ? amt : -amt, behavior: "smooth" });
  }, []);

  const scrollStudioGallery = useCallback((dir) => {
    const track = studioTrackRef.current;
    const card = firstStudioCardRef.current;
    if (!track || !card) return;
    const amt = card.offsetWidth + 24;
    track.scrollBy({ left: dir === "next" ? amt : -amt, behavior: "smooth" });
  }, []);

  const scrollToSlide = useCallback((index) => {
    const track = trackRef.current;
    const card = firstCardRef.current;
    if (!track || !card) return;
    const cardSize = card.offsetWidth + 16;
    track.scrollTo({ left: index * cardSize, behavior: "smooth" });
    setActiveIndex(index);
  }, []);

  const scrollToStudioSlide = useCallback((index) => {
    const track = studioTrackRef.current;
    const card = firstStudioCardRef.current;
    if (!track || !card) return;
    const cardSize = card.offsetWidth + 24;
    track.scrollTo({ left: index * cardSize, behavior: "smooth" });
    setStudioActiveIndex(index);
  }, []);

  // Memoized studio images mapping – prevents re-renders
  const studioImagesList = useMemo(() => STUDIO_IMAGES, []);
  const galleryImagesList = useMemo(() => GALLERY_IMAGES, []);
  const certificatesList = useMemo(() => CERTIFICATES, []);
  const coreValuesList = useMemo(() => CORE_VALUES, []);

  return (
    <section className="about-us">
      <div className="about-glow a1" />
      <div className="about-glow a2" />
      <div className="about-glow a3" />

      <div className="container">
        {/* HEADER */}
        <header className="about-header reveal" ref={(el) => (cardsRef.current[0] = el)}>
          <span className="badge">✦ About Us ✦</span>
          <h2>Luxury nail artistry, crafted with passion & precision</h2>
          <p>
            UNAiledIt is a premium nail studio focused on clean aesthetics,
            comfort, and personalized nail art experience. Every set tells a
            story — we're here to make yours unforgettable.
          </p>
        </header>

        {/* MAIN GRID */}
        <div className="about-grid">
          {/* FOUNDER CARD */}
          <article className="card founder-card reveal" ref={(el) => (cardsRef.current[1] = el)}>
            <div className="founder-top">
              <img src={profile} alt="Alliyah Bangayan" className="avatar" />
              <div>
                <span className="label">Founder & Lead Artist</span>
                <h3>Alliyah Bangayan</h3>
                <p>Visual Artist | Certified Nail Specialist</p>
              </div>
            </div>
            <div className="bio">
              <p>
                Hi, I’m Alliyah — your nail artist! I’m 21 years old and
                passionate about creating high quality, detailed and clean
                nails. Aside from nail artistry, I also love the arts from
                portrait drawing to canvas painting using oil or acrylic. During
                my senior high school years, I took the Visual Arts and
                Multimedia Arts track, which helped me strengthen my creativity
                and attention to detail.
              </p>
              <p>
                Before entering the nail industry, I used to do hair and makeup
                services as a sideline. I graduated from the University of
                Makati with a course in Customer Service in Communication, and I
                was also a student artist and former member of the University of
                Makati Chorale.
              </p>
              <p>
                Today, I’ve turned my creative passion into a full-time
                business, helping clients express their individuality and
                confidence through beautiful, high-quality nails.
              </p>
              <p>
                I’ve taken three professional nail enhancement courses such as
                Nail Art, Soft-Gel Extensions, and Hard/Builder Gel which helped
                me grow my passion and skills in the nail industry. These
                experiences shaped me into the professional nail artist I am
                today, and I’m proud to be a member of Nail Artists Philippines!
              </p>
            </div>
            <div className="stats">
              <div><strong>Years of</strong><span>Experience</span></div>
              <div><strong>Have</strong><span>Certifications</span></div>
            </div>
            <div className="studio-credentials social-links">
              <a href="https://web.facebook.com/UNAILEDitbyAlliyah" target="_blank" rel="noopener noreferrer" className="social-pill facebook">
                <div className="social-icon fb">f</div>
                <div className="social-text"><strong>Facebook</strong><span>U NAILed it by Alliyah</span></div>
              </a>
              <a href="https://instagram.com/unaileditstudio" target="_blank" rel="noopener noreferrer" className="social-pill instagram">
                <div className="social-icon ig">⌁</div>
                <div className="social-text"><strong>Instagram</strong><span>@unaileditstudio</span></div>
              </a>
              <a href="mailto:unaileditstudio@gmail.com" className="social-pill email">
                <div className="social-icon mail">@</div>
                <div className="social-text"><strong>Email</strong><span>unaileditstudio@gmail.com</span></div>
              </a>
            </div>
          </article>

          {/* JOURNEY / TIMELINE */}
          <article className="card reveal journey-card" ref={(el) => (cardsRef.current[2] = el)}>
            <span className="label">Milestones</span>
            <h3>Our Growth Journey</h3>
            <div className="journey-timeline">
              <div className="journey-item">
                <div className="journey-dot" />
                <div className="journey-content">
                  <span className="journey-date">January 15, 2025</span>
                  <h4>Victorian Nail Art Certification</h4>
                  <p>Achieved her first professional certification in a Nail Art Workshop with a <b>Victorian theme</b>, led by educator and Nail Artist Philippines co-founder <b>Ms. Karen Hickey (ModnailsPH)</b>.</p>
                </div>
              </div>
              <div className="journey-item">
                <div className="journey-dot" />
                <div className="journey-content">
                  <span className="journey-date">March 6, 2025</span>
                  <h4>Softgel Extension Workshop</h4>
                  <p>Completed a <b>Softgel Extension & Nail Art Workshop</b> at <b>Red Akiko SPMU Training Center – Quezon City</b>, expanding expertise in modern gel systems and nail structure building.</p>
                </div>
              </div>
              <div className="journey-item">
                <div className="journey-dot" />
                <div className="journey-content">
                  <span className="journey-date">July 8, 2025</span>
                  <h4>Builder Gel & Hard Gel Certification</h4>
                  <p>Certified in <b>Builder Gel & Hard Gel technical application</b>, including <b>dual form, nail form, and half-tip techniques</b>, led by <b>Ms. Karen Hickey (ModnailsPH)</b>.</p>
                </div>
              </div>
            </div>
            <div className="journey-footer">✨ Certified Nail Technician • Continuous Skill Growth</div>
          </article>

          {/* GALLERY (Nails Portfolio) */}
          <article className="card reveal" ref={(el) => (cardsRef.current[3] = el)}>
            <div className="gallery-head">
              <div><span className="label">Portfolio</span><h3>Signature Works</h3></div>
              <div className="controls">
                <button onClick={() => scrollGallery("prev")} aria-label="Previous">‹</button>
                <button onClick={() => scrollGallery("next")} aria-label="Next">›</button>
              </div>
            </div>
            <p className="subtext">Swipe or click arrows to explore designs</p>
            <div className="track" ref={trackRef}>
              {galleryImagesList.map((g, i) => (
                <div key={i} className="slide" ref={i === 0 ? firstCardRef : undefined}>
                  <img src={g.src} alt={g.alt} loading="lazy" />
                  <div className="slide-info">
                    <span className="gallery-tag">{g.tag}</span>
                    <h4>{g.title}</h4>
                  </div>
                </div>
              ))}
            </div>
            <div className="dots">
              {galleryImagesList.map((_, i) => (
                <button key={i} className={`dot ${activeIndex === i ? "active" : ""}`} onClick={() => scrollToSlide(i)} aria-label={`Go to slide ${i + 1}`} />
              ))}
            </div>
          </article>
        </div>

        {/* STUDIO AMBIENCE SECTION */}
        <div className="studio-section">
          <div className="section-header reveal" ref={(el) => (cardsRef.current[4] = el)}>
            <span className="badge">Our Space</span>
            <h3>Studio Ambience</h3>
            <p>Step into a calm, creative environment designed for your comfort.</p>
          </div>
          <div className="studio-gallery-container">
            <div className="studio-track" ref={studioTrackRef}>
              {studioImagesList.map((img, i) => (
                <div key={i} className="studio-slide" ref={i === 0 ? firstStudioCardRef : undefined}>
                  <img src={img.src} alt={img.alt} loading="lazy" />
                  <div className="studio-overlay"><h4>{img.title}</h4></div>
                </div>
              ))}
            </div>
            <div className="studio-controls">
              <button onClick={() => scrollStudioGallery("prev")} className="studio-nav" aria-label="Previous studio image">‹</button>
              <button onClick={() => scrollStudioGallery("next")} className="studio-nav" aria-label="Next studio image">›</button>
            </div>
            <div className="studio-dots">
              {studioImagesList.map((_, i) => (
                <button key={i} className={`studio-dot ${studioActiveIndex === i ? "active" : ""}`} onClick={() => scrollToStudioSlide(i)} aria-label={`Studio view ${i + 1}`} />
              ))}
            </div>
          </div>
        </div>

        {/* CERTIFICATIONS SECTION */}
        <div className="certs-section">
          <div className="section-header reveal" ref={(el) => (cardsRef.current[5] = el)}>
            <span className="badge">Credentials</span>
            <h3>Certifications & Awards</h3>
            <p>Recognized excellence in nail artistry and hygiene standards.</p>
          </div>
          <div className="certs-grid">
            {certificatesList.map((cert, idx) => (
              <div key={idx} className="cert-card reveal" ref={(el) => (cardsRef.current[6 + idx] = el)}>
                <div className="cert-icon">{cert.icon}</div>
                <h4>{cert.name}</h4>
                <p>{cert.issuer} • {cert.year}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CORE VALUES */}
        <div className="values-section">
          <div className="section-header reveal" ref={(el) => (cardsRef.current[10] = el)}>
            <span className="badge">Our Ethos</span>
            <h3>What makes us DIFFERENT</h3>
            <p>Four pillars that define every appointment.</p>
          </div>
          <div className="values-grid">
            {coreValuesList.map((value, idx) => (
              <div key={idx} className="value-card reveal" ref={(el) => (cardsRef.current[11 + idx] = el)}>
                <div className="value-icon">{value.icon}</div>
                <h4>{value.title}</h4>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FACEBOOK PAGE SECTION */}
        <div className="social-section">
          <div className="section-header reveal" ref={(el) => (cardsRef.current[15] = el)}>
            <span className="badge">Join Our Community</span>
            <h3>Follow Us on Facebook</h3>
            <p>Get daily inspiration, flash sales, and behind-the-scenes updates.</p>
          </div>
          <a href={FACEBOOK_PAGE.url} target="_blank" rel="noopener noreferrer" className="facebook-card reveal" ref={(el) => (cardsRef.current[16] = el)}>
            <div className="facebook-image">
              <img src={FACEBOOK_PAGE.image} alt="Facebook page preview" loading="lazy" />
              <div className="facebook-overlay"><span className="fb-icon"></span></div>
            </div>
            <div className="facebook-info">
              <h4>{FACEBOOK_PAGE.name}</h4>
              <p className="fb-handle">@{FACEBOOK_PAGE.handle}</p>
              <div className="fb-stats">
                <span>{FACEBOOK_PAGE.likes} likes</span>
                <span className="follow-link">Follow on Facebook →</span>
              </div>
            </div>
          </a>
          <div className="social-note reveal" ref={(el) => (cardsRef.current[17] = el)}>
            <p>👍 Like & follow <strong>@unaileditstudio</strong> and tag us in your nail art!</p>
          </div>
        </div>

        {/* CALL TO ACTION */}
        <div className="cta-section reveal" ref={(el) => (cardsRef.current[18] = el)}>
          <div className="cta-inner">
            <h3>Ready for your dream set?</h3>
            <p>Book a consultation or DM us on Facebook to start your nail journey.</p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => navigate("/booking")}>Book Appointment</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}