import { useEffect, useRef } from "react";

const Hero = () => {
  const heroRef = useRef(null);

  const scrollToBooking = () => {
    const element = document.getElementById("booking");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const el = heroRef.current;
    if (el) {
      el.classList.add("hero-show");
    }
  }, []);

  return (
    <section className="hero hero-reveal" id="home" ref={heroRef}>
      {/* Decorative nail-art elements */}
      <div className="gold-sun float" />
      <div className="nail-accent nail-1 float-slow" />
      <div className="nail-accent nail-2 float" />
      <div className="nail-accent nail-3 float-slow" />
      <div className="glitter glitter-1 sparkle" />
      <div className="glitter glitter-2 sparkle" />
      <div className="glitter glitter-3 sparkle" />

      <div className="container hero-inner">
        <div className="hero-text">
          <h1 className="fade-up delay-1">
            Transform your nails
            <span className="brush-underline"> into art</span>
          </h1>

          <p className="fade-up delay-2">
            Experience premium nail design artistry with personalized attention
            to detail. Our studio combines creativity with hygiene standards to
            give you stunning nails that reflect your unique style.
          </p>

          <button
            className="hero-btn fade-up delay-3"
            onClick={scrollToBooking}
          >
            Book appointment →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
