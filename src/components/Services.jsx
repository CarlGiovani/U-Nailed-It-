const Services = ({ services }) => {
  const scrollToBooking = () => {
    const element = document.getElementById("booking");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="services" id="services">
      <div className="container">
        <div className="section-title">
          <h2>Our Services</h2>
          <p>Premium nail art services tailored to your style</p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-img">
                {/* Display image_url and fallback to a placeholder if it fails */}
                <img
                  src={service.image_url}
                  alt={service.name}
                  onError={(e) => {
                    e.target.onerror = null; // prevent infinite loop
                    e.target.src = "/images/placeholder.jpg"; // your placeholder
                  }}
                />
              </div>
              <div className="service-content">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="service-meta">
                  <div className="service-price">₱{service.price}</div>
                  <div className="service-duration">
                    <i className="far fa-clock"></i>
                    <span>{service.duration}</span>
                  </div>
                </div>
                <button
                  className="btn btn-primary select-service"
                  onClick={scrollToBooking}
                >
                  Select Service
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
