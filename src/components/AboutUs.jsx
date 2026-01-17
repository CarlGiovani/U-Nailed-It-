const AboutUs = () => {
  return (
    <section className="about-us" id="about-us">
      <div className="container">
        <div className="section-title">
          <h2>About Us</h2>
          <p>Learn more about our founder and what makes our studio special</p>
        </div>

        <div className="about-grid">
          {/* Owner Info */}
          <div className="owner-profile">
            <div className="owner-photo">
              <img src="/images/owner.jpg" alt="Liana - Founder & Nail Artist" />
            </div>
            <div className="owner-info">
              <h3>Liana Santos</h3>
              <p><strong>Founder & Lead Nail Artist</strong></p>
              <p>
                Liana has over 8 years of experience in professional nail artistry, specializing in
                gel manicures, custom nail designs, and nail care education. She is certified by the
                Philippine Nail Technicians Association (PNTA) and has attended multiple international
                nail art workshops in Japan and Korea.
              </p>
              <p>
                <strong>Credentials:</strong>
              </p>
              <ul>
                <li>Certified Nail Technician (PNTA)</li>
                <li>Diploma in Nail Art & Design, Creative Beauty Institute</li>
                <li>Workshops: Advanced Nail Art (Tokyo, Japan), Creative Nail Design (Seoul, Korea)</li>
                <li>Featured in local fashion magazines & TV segments for nail artistry</li>
              </ul>
              <div className="social-links">
                <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
                <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div className="business-info">
            <h3>About Our Studio</h3>
            <p>
              Nail Artistry by Liana is a premium nail design studio located in Makati City, Philippines.
              We focus on providing personalized nail services using the highest hygiene standards, quality
              products, and innovative designs. Our mission is to make every client feel confident and beautiful.
            </p>
            <p>
              <strong>Studio Highlights:</strong>
            </p>
            <ul>
              <li>Established: 2018</li>
              <li>Fully licensed and certified beauty studio</li>
              <li>Professional team trained in modern nail art techniques</li>
              <li>Eco-friendly and high-quality nail products</li>
              <li>Custom nail art designs tailored to client preferences</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;