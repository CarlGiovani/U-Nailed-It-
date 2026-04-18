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
    const validElements = itemsRef.current.filter(Boolean);
    if (!validElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.12 },
    );

    validElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [policies, isLoading, isError]);

  if (isError) {
    console.error("Failed to fetch policies:", error);
  }

  const featuredPolicy = policies[0];
  const remainingPolicies = policies.slice(1);

  return (
    <section className="policies" id="policies">
      <div className="policies-bg-glow policies-bg-glow-1" />
      <div className="policies-bg-glow policies-bg-glow-2" />
      <div className="policies-bg-glow policies-bg-glow-3" />
      <div className="policies-pattern" />

      <div className="container policies-shell">
        <div
          className="policies-header reveal"
          ref={(el) => (itemsRef.current[0] = el)}
        >
          <span className="policies-kicker">Policies</span>
          <h2>Studio Policies</h2>
          <p>
            Please read these important reminders before booking your
            appointment. These policies help protect your schedule, your
            service, and the overall premium studio experience.
          </p>
        </div>

        {isLoading ? (
          <div
            className="policies-state reveal"
            ref={(el) => (itemsRef.current[1] = el)}
          >
            <div className="policy-state-card">
              <span className="state-pill">Please wait</span>
              <p className="loading-text">Loading policies...</p>
            </div>
          </div>
        ) : isError ? (
          <div
            className="policies-state reveal"
            ref={(el) => (itemsRef.current[1] = el)}
          >
            <div className="policy-state-card">
              <span className="state-pill">Something went wrong</span>
              <p className="loading-text">Failed to load policies.</p>
            </div>
          </div>
        ) : policies.length === 0 ? (
          <div
            className="policies-state reveal"
            ref={(el) => (itemsRef.current[1] = el)}
          >
            <div className="policy-state-card">
              <span className="state-pill">No content yet</span>
              <p className="loading-text">No policies available.</p>
            </div>
          </div>
        ) : (
          <>
            {featuredPolicy && (
              <article
                className="policy-featured reveal"
                ref={(el) => (itemsRef.current[1] = el)}
              >
                <div className="policy-featured-inner">
                  <div className="policy-featured-badge-wrap">
                    <span className="policy-badge policy-badge-featured">
                      Featured Policy
                    </span>
                  </div>

                  <div className="policy-featured-content">
                    <h3 className="policy-featured-title">
                      {featuredPolicy.title}
                    </h3>
                    <p className="policy-featured-text">
                      {featuredPolicy.content}
                    </p>
                  </div>
                </div>
              </article>
            )}

            {remainingPolicies.length > 0 && (
              <div className="policies-list">
                {remainingPolicies.map((policy, index) => (
                  <article
                    key={policy.id}
                    ref={(el) => (itemsRef.current[index + 2] = el)}
                    className="policy-item reveal"
                  >
                    <div className="policy-card">
                      <div className="policy-card-top">
                        <span className="policy-badge">
                          Policy {String(index + 2).padStart(2, "0")}
                        </span>
                      </div>

                      <div className="policy-card-content">
                        <h3 className="policy-title">{policy.title}</h3>
                        <p className="policy-content">{policy.content}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Policies;