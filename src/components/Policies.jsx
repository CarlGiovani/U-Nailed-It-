const Policies = () => {
  return (
    <section className="policies" id="policies">
      <div className="container">
        <div className="section-title">
          <h2>Our Policies</h2>
          <p>Important information for your appointment</p>
        </div>
        <div className="policies-grid">
          <div className="policy-card">
            <h3><i className="fas fa-calendar-check"></i> Booking Policy</h3>
            <p>
              Downpayment required to secure slot. Book at least 24 hours in
              advance. Cancellations must be made 12 hours before appointment.
            </p>
          </div>
          <div className="policy-card">
            <h3><i className="fas fa-clock"></i> Late Policy</h3>
            <p>
              Arrive 5-10 minutes before your appointment. Being 15+ minutes late
              may result in rescheduling with additional fees.
            </p>
          </div>
          <div className="policy-card">
            <h3><i className="fas fa-money-bill-wave"></i> Payment Policy</h3>
            <p>
              50% downpayment via GCash for all bookings. Balance payable after
              service. No refunds for completed services.
            </p>
          </div>
          <div className="policy-card">
            <h3><i className="fas fa-spa"></i> Hygiene Policy</h3>
            <p>
              All tools are sterilized between clients. Please inform us of any
              allergies or medical conditions before service.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Policies;