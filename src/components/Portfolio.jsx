const Portfolio = () => {
  const portfolioImages = [
    "https://images.unsplash.com/photo-1607779156197-4c6da2d5c2c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1574098529597-5f2d4c8a7b2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1596703923338-48f1c07e4f2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1612817288484-6f91600674a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  ];

  return (
    <section className="portfolio" id="portfolio">
      <div className="container">
        <div className="section-title">
          <h2>Our Portfolio</h2>
          <p>See our latest nail art creations</p>
        </div>
        <div className="portfolio-grid">
          {portfolioImages.map((image, index) => (
            <div key={index} className="portfolio-item">
              <img src={image} alt={`Nail Art ${index + 1}`} />
              <div className="portfolio-overlay">
                <h3>Custom Design {index + 1}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;