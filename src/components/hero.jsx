const Hero = () => {
  const scrollToBooking = () => {
    const element = document.getElementById('booking');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero" id="home">
      <div className="container hero-content">
        <h1>Transform Your Nails Into Art</h1>
        <p>
          Experience premium nail design artistry with personalized attention to
          detail. Our studio combines creativity with hygiene standards to give
          you stunning nails that reflect your unique style.
        </p>
        <button className="btn btn-primary" onClick={scrollToBooking}>
          Book Appointment Now
        </button>
      </div>
    </section>
  );
};

export default Hero;