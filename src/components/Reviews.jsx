import { useEffect, useState } from "react";
import { getApprovedReviews } from "../../backend/reviewApi";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getApprovedReviews();
        setReviews(data);
      } catch (err) {
        console.error("Failed to load reviews", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) return <p>Loading reviews...</p>;

  return (
    <section className="reviews" id="reviews">
      <div className="container">
        <div className="section-title">
          <h2>Customer Reviews</h2>
          <p>See what our clients say about our nail art services</p>
        </div>

        <div className="reviews-slider">
          {reviews.map((review) => {
            const name =
              review.bookings?.customers?.full_name || "Customer";
            const avatar = name.charAt(0).toUpperCase();

            return (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-avatar">
                    {review.image_url ? (
                      <img src={review.image_url} alt={name} />
                    ) : (
                      avatar
                    )}
                  </div>

                  <div>
                    <div className="review-name">{name}</div>
                    <div className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="review-stars">
                  {"★".repeat(review.rating)}
                </div>

                <p className="review-comment">
                  “{review.comment}”
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
