const Promos = () => {
  const promos = [
    {
      title: "Student Discount",
      description: "20% off all services for valid students with ID",
      validUntil: "December 31, 2024"
    },
    {
      title: "Birthday Month Special",
      description: "Free nail art design on your birthday month with any service",
      validUntil: "Ongoing"
    },
    {
      title: "Group Package",
      description: "Book for 3 or more people and get 15% off total bill",
      validUntil: "December 31, 2024"
    }
  ];

  return (
    <section className="promos" id="promos">
      <div className="container">
        <div className="section-title">
          <h2>Promos & Announcements</h2>
          <p>Special offers just for you</p>
        </div>
        <div className="promos-grid">
          {promos.map((promo, index) => (
            <div key={index} className="promo-card">
              <div className="promo-badge">PROMO</div>
              <h3>{promo.title}</h3>
              <p>{promo.description}</p>
              <div className="promo-footer">
                <span>Valid until: {promo.validUntil}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Promos;