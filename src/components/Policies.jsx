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
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
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
      { threshold: 0.15 },
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
        <div
          className="policies-header reveal"
          ref={(el) => (itemsRef.current[0] = el)}
        >
          <span className="policies-kicker">Policies</span>
          <h2>Our Policies</h2>
          <p>
            Important information to help make your appointment smooth, clear,
            and stress-free.
          </p>
        </div>

        {isLoading ? (
          <div className="policies-state">
            <p className="loading-text">Loading policies...</p>
          </div>
        ) : isError ? (
          <div className="policies-state">
            <p className="loading-text">Failed to load policies.</p>
          </div>
        ) : policies.length === 0 ? (
          <div className="policies-state">
            <p className="loading-text">No policies available.</p>
          </div>
        ) : (
          <div className="policies-list">
            {policies.map((policy, index) => (
              <article
                key={policy.id}
                ref={(el) => (itemsRef.current[index + 1] = el)}
                className="policy-item reveal"
              >
                <div className="policy-item-top">
                  <span className="policy-badge">
                    Policy {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="policy-card">
                  <h3 className="policy-title">{policy.title}</h3>
                  <p className="policy-content">{policy.content}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Policies;
