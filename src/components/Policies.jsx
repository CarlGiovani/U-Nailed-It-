import { useEffect, useRef, useState } from "react";
import { getActivePolicies } from "../../backend/policiesApi";
import "../styles/policies.css";

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsRef = useRef([]);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const data = await getActivePolicies();
        setPolicies(data);
      } catch (error) {
        console.error("Failed to fetch policies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  // 🔥 Scroll Reveal Animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.2 }
    );

    itemsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [policies]);

  return (
    <section className="policies" id="policies">
      <div className="container">
        <div className="section-title">
          <h2>Our Policies</h2>
          <p>Important information for your appointment</p>
        </div>

        {loading ? (
          <p className="loading-text">Loading policies...</p>
        ) : policies.length === 0 ? (
          <p className="loading-text">No policies available.</p>
        ) : (
          <div className="policies-timeline">
            {policies.map((policy, index) => (
              <div
                key={policy.id}
                ref={(el) => (itemsRef.current[index] = el)}
                className={`timeline-item ${
                  index % 2 === 0 ? "left" : "right"
                } reveal`}
              >
                <div className="timeline-dot"></div>

                <div className="policy-card">
                  <h3 className="policy-title">{policy.title}</h3>
                  <p className="policy-content">{policy.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Policies;
