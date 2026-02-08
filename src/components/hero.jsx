const Hero = () => {
  const scrollToBooking = () => {
    const element = document.getElementById("booking");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero" id="home">
      {/* Decorative nail-art elements */}
      <div className="gold-sun" />
      <div className="nail-accent nail-1" />
      <div className="nail-accent nail-2" />
      <div className="nail-accent nail-3" />
      <div className="glitter glitter-1" />
      <div className="glitter glitter-2" />
      <div className="glitter glitter-3" />

      <div className="container hero-inner">
        <div className="hero-text">
          <h1>
            Transform your nails
            <span className="brush-underline"> into art</span>
          </h1>

          <p>
            Experience premium nail design artistry with personalized attention
            to detail. Our studio combines creativity with hygiene standards to
            give you stunning nails that reflect your unique style.
          </p>

          <button className="hero-btn" onClick={scrollToBooking}>
            Book appointment →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
