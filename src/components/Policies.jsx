import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getActivePolicies } from "../../backend/policiesApi";
import "../styles/policies.css";

const Policies = () => {
  const itemsRef = useRef([]);

  const {
    data: policies = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["activePolicies"],
    queryFn: getActivePolicies,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 15, // keep cache for 15 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!policies.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.2 },
    );

    itemsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [policies]);

  if (isError) {
    console.error("Failed to fetch policies:", error);
  }

  return (
    <section className="policies" id="policies">
      <div className="container">
        <div className="section-title">
          <h2>Our Policies</h2>
          <p>Important information for your appointment</p>
        </div>

        {isLoading ? (
          <p className="loading-text">Loading policies...</p>
        ) : isError ? (
          <p className="loading-text">Failed to load policies.</p>
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
