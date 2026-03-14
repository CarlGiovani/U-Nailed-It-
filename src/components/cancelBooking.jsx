import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { cancelBookingByToken } from "../../backend/bookingApi";
import "../styles/cancelBooking.css";

const CancelBookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const cancel = async () => {
      if (!token) {
        if (isMounted) {
          setError("Invalid cancellation link.");
          setLoading(false);
        }
        return;
      }

      try {
        const data = await cancelBookingByToken(token);

        if (isMounted) {
          setBooking(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.error ||
              err.message ||
              "Cancellation failed or link expired."
          );
          setLoading(false);
        }
      }
    };

    cancel();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="cancel-page">
      <div className="cancel-card">

        {/* LOADING */}
        {loading && (
          <div className="cancel-loading">
            <h2>Cancelling your booking...</h2>
            <p>Please wait a moment.</p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="cancel-error">
            <h2>Cancellation Failed ❌</h2>
            <div className="cancel-divider"></div>
            <p>{error}</p>

            <button
              className="cancel-btn primary"
              onClick={() => navigate("/")}
            >
              Return to Home
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {!loading && booking && (
          <div className="cancel-success">
            <h2>Booking Cancelled 💔</h2>
            <div className="cancel-divider"></div>

            <p>Your appointment has been successfully cancelled.</p>

            {/* BOOKING DETAILS */}
            <div className="booking-info">
              <h3>Cancelled Appointment</h3>

              <div className="info-row">
                <span>📅 Date:</span>
                <strong>{booking.booking_date}</strong>
              </div>

              <div className="info-row">
                <span>🕒 Time:</span>
                <strong>{booking.booking_time}</strong>
              </div>

              {booking.services?.name && (
                <div className="info-row">
                  <span>💆 Service:</span>
                  <strong>{booking.services.name}</strong>
                </div>
              )}

              {booking.customers?.full_name && (
                <div className="info-row">
                  <span>👤 Name:</span>
                  <strong>{booking.customers.full_name}</strong>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
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