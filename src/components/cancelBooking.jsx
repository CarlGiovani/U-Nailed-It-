import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cancelBookingPerToken } from "../../backend/bookingApi";
import "../styles/cancelBooking.css";

const CancelBookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const [cancelled, setCancelled] = useState(false);

  const handleCancelBooking = async () => {
    if (!token) {
      setError("Invalid cancellation link.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await cancelBookingPerToken(token);
      setBooking(data);
      setCancelled(true);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Cancellation failed or link expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cancel-page">
      <div className="cancel-card">
        {!token && (
          <div className="cancel-error">
            <h2>Invalid Link ❌</h2>
            <div className="cancel-divider"></div>
            <p>This cancellation link is invalid or missing a token.</p>

            <button
              className="cancel-btn primary"
              onClick={() => navigate("/")}
            >
              Return to Home
            </button>
          </div>
        )}

        {token && !cancelled && (
          <div className="cancel-confirm">
            <h2>Cancel Booking?</h2>
            <div className="cancel-divider"></div>

            <p>Are you sure you want to cancel your booking?</p>
            <p className="cancel-note">
              This will release your reserved appointment slot.
            </p>

            {error && <p className="cancel-error-text">{error}</p>}

            <div className="cancel-actions">
              <button
                className="cancel-btn secondary"
                onClick={() => navigate("/")}
                disabled={loading}
              >
                Keep My Booking
              </button>

              <button
                className="cancel-btn primary"
                onClick={handleCancelBooking}
                disabled={loading}
              >
                {loading ? "Cancelling..." : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        )}

        {cancelled && booking && (
          <div className="cancel-success">
            <h2>Booking Cancelled 💔</h2>
            <div className="cancel-divider"></div>

            <p>Your appointment has been successfully cancelled.</p>

            <div className="booking-info">
              <h3>Cancelled Appointment</h3>

              <div className="info-row">
                <span>📅 Date</span>
                <strong>{booking.booking_date}</strong>
              </div>

              <div className="info-row">
                <span>🕒 Time</span>
                <strong>{booking.booking_time}</strong>
              </div>

              {booking.services?.name && (
                <div className="info-row">
                  <span>💆 Service</span>
                  <strong>{booking.services.name}</strong>
                </div>
              )}

              {booking.customers?.full_name && (
                <div className="info-row">
                  <span>👤 Name</span>
                  <strong>{booking.customers.full_name}</strong>
                </div>
              )}
            </div>

            <div className="cancel-actions">
              <button
                className="cancel-btn primary"
                onClick={() => navigate("/")}
              >
                Return to Home
              </button>

              <button
                className="cancel-btn secondary"
                onClick={() => navigate("/booking")}
              >
                Book Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CancelBookingPage;
