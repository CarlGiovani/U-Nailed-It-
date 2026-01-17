import { useState } from 'react';

const Reviews = () => {
  const [reviews] = useState([
    {
      id: 1,
      name: "Maria Santos",
      date: "June 5, 2023",
      rating: 5,
      comment: "Liana is incredibly talented! My wedding nails were absolutely stunning and lasted perfectly through my entire honeymoon. Highly recommended!",
      avatar: "M"
    },
    {
      id: 2,
      name: "Andrea Reyes",
      date: "May 20, 2023",
      rating: 5,
      comment: "Best nail salon in Makati! The attention to detail is amazing. My custom nail art design exceeded all expectations.",
      avatar: "A"
    },
    {
      id: 3,
      name: "Catherine Lim",
      date: "April 15, 2023",
      rating: 5,
      comment: "Professional service with excellent hygiene standards. My gel manicure lasted for 3 weeks without chipping. Will definitely be back!",
      avatar: "C"
    }
  ]);

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <i 
        key={index} 
        className={`fas fa-star ${index < rating ? 'filled' : ''}`}
      ></i>
    ));
  };

  return (
    <section className="reviews" id="reviews">
      <div className="container">
        <div className="section-title">
          <h2>Customer Reviews</h2>
          <p>See what our clients say about our nail art services</p>
        </div>

        <div className="reviews-slider">
          {reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="review-avatar">{review.avatar}</div>
                <div>
                  <div className="review-name">{review.name}</div>
                  <div className="review-date">{review.date}</div>
                </div>
              </div>
              <div className="review-stars">
                {renderStars(review.rating)}
              </div>
              <p className="review-comment">"{review.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;