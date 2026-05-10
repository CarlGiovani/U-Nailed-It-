import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { getActivePolicies } from "../../backend/policiesApi";
import "../styles/policies.css";

// Helper: map policy title to an emoji/icon
const getPolicyIcon = (title = "") => {
  const lower = title.toLowerCase();
  if (lower.includes("cancel") || lower.includes("reschedule")) return "⏰";
  if (lower.includes("deposit")) return "💰";
  if (lower.includes("late")) return "🕒";
  if (lower.includes("refund")) return "💸";
  if (lower.includes("health") || lower.includes("safety")) return "🧼";
  if (lower.includes("package")) return "🎁";
  if (lower.includes("guest")) return "👥";
  return "✨";
};

// Skeleton loader component
const PolicySkeleton = () => (
  <div className="policy-skeleton">
    <div className="skeleton-badge" />
    <div className="skeleton-title" />
    <div className="skeleton-text" />
    <div className="skeleton-text short" />
  </div>
);

const Policies = () => {
  const itemsRef = useRef([]);
  const observerRef = useRef(null);

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

  // Intersection Observer setup (memoized)
  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observerRef.current.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -20px 0px" }
    );

    const elements = itemsRef.current.filter(Boolean);
    elements.forEach((el) => observerRef.current.observe(el));
  }, []);

  useEffect(() => {
    if (!isLoading && !isError && policies.length) {
      setupObserver();
    }
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [isLoading, isError, policies.length, setupObserver]);

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
          <h2> Our Policies</h2>
          <p>
            Please read these important reminders before booking your
            appointment. These policies help protect your schedule, your
            service, and the overall premium studio experience.
          </p>
        </div>

        {isLoading && (
          <>
            <div className="policy-featured skeleton">
              <PolicySkeleton />
            </div>
            <div className="policies-list">
              {[1, 2, 3].map((_, idx) => (
                <PolicySkeleton key={idx} />
              ))}
            </div>
          </>
        )}

        {isError && (
          <div
            className="policies-state reveal"
            ref={(el) => (itemsRef.current[1] = el)}
          >
            <div className="policy-state-card error">
              <span className="state-pill">⚠️ Something went wrong</span>
              <p className="loading-text">
                {error?.message || "Failed to load policies. Please try again later."}
              </p>
              <button
                className="retry-btn"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}

        {!isLoading && !isError && policies.length === 0 && (
          <div
            className="policies-state reveal"
            ref={(el) => (itemsRef.current[1] = el)}
          >
            <div className="policy-state-card">
              <span className="state-pill">📭 No content yet</span>
              <p className="loading-text">No policies available at the moment.</p>
            </div>
          </div>
        )}

        {!isLoading && !isError && policies.length > 0 && (
          <>
            {featuredPolicy && (
              <article
                className="policy-featured reveal"
                ref={(el) => (itemsRef.current[1] = el)}
              >
                <div className="policy-featured-inner">
                  <div className="policy-featured-badge-wrap">
                    <span className="policy-badge policy-badge-featured">
                      🌟 Featured Policy
                    </span>
                  </div>
                  <div className="policy-featured-content">
                    <h3 className="policy-featured-title">
                      {getPolicyIcon(featuredPolicy.title)} {featuredPolicy.title}
                    </h3>
                    <p className="policy-featured-text">{featuredPolicy.content}</p>
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
                          {getPolicyIcon(policy.title)} Policy{" "}
                          {String(index + 2).padStart(2, "0")}
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