import { useState } from "react";

const CheckBooking = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  const mockBookings = [
    {
      id: 1,
      service: "Gel Manicure",
      date: "2024-01-15",
      time: "2:00 PM",
      status: "approved",
      price: 750,
      downpayment: 250,
    },
    {
      id: 2,
      service: "Nail Art Design",
      date: "2024-01-20",
      time: "11:00 AM",
      status: "pending",
      price: 1200,
      downpayment: 400,
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      setBookings(mockBookings);
      setIsLoading(false);
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "status-approved";
      case "pending":
        return "status-pending";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "pending":
        return "Pending";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <section className="check-booking" id="check-booking">
      <div className="container">
        <div className="section-title">
          <h2>Check My Booking</h2>
          <p>View your booking history and status using your email</p>
        </div>

        <div className="check-booking-container">
          {/* Email Input */}
          <div className="email-lookup">
            <div className="form-group">
              <label htmlFor="lookupEmail">Enter Your Email (Gmail)</label>
              <input
                type="email"
                id="lookupEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                required
              />
              <small className="form-note">
                Use the same email you used for booking
              </small>
              {error && <div className="error-message">{error}</div>}
            </div>
            <button
              className="btn btn-primary"
              onClick={handleSearch}
              disabled={isLoading}
            >
              <i className="fas fa-search"></i> Search Bookings
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Searching for bookings...</p>
            </div>
          )}

          {/* Results Container */}
          <div className="booking-results">
            {bookings.length === 0 && !isLoading ? (
              <div className="no-bookings">
                <i className="fas fa-calendar-alt"></i>
                <h3>No Bookings Yet</h3>
                <p>Enter your email to search for existing bookings</p>
                <p className="small-text">
                  Or{" "}
                  <a
                    href="#booking"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById("booking")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    book your first appointment
                  </a>
                </p>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <h3 className="booking-title">{booking.service}</h3>
                      <span
                        className={`booking-status ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    <div className="booking-details">
                      <div className="detail-item">
                        <span className="detail-label">Date</span>
                        <span className="detail-value">
                          {new Date(booking.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Time</span>
                        <span className="detail-value">{booking.time}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Total Price</span>
                        <span className="detail-value">₱{booking.price}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Downpayment</span>
                        <span className="detail-value">
                          ₱{booking.downpayment}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Legend */}
          <div className="status-legend">
            <h4>Booking Status Guide</h4>
            <div className="legend-items">
              <div className="legend-item">
                <span className="status-dot pending"></span>
                <span>Pending - Awaiting payment verification</span>
              </div>
              <div className="legend-item">
                <span className="status-dot approved"></span>
                <span>Approved - Confirmed appointment</span>
              </div>
              <div className="legend-item">
                <span className="status-dot completed"></span>
                <span>Completed - Service done</span>
              </div>
              <div className="legend-item">
                <span className="status-dot cancelled"></span>
                <span>Cancelled - Booking cancelled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckBooking;
