import { useEffect, useState } from "react";
import { createReview, verifyReviewToken } from "../api/reviewApi";
import { uploadReviewImage } from "../utils/uploadReviewImage";

const ReviewPage = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // =========================
  // VERIFY TOKEN
  // =========================
  useEffect(() => {
    if (!token) {
      setError("Invalid review link");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const data = await verifyReviewToken(token);

        console.log("API RESPONSE:", data);

        setBooking(data || {});
        setLoading(false);
      } catch (err) {
        console.log("ERROR:", err);
        setError(err.message || "Invalid or expired link");
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  // =========================
  // SUBMIT REVIEW
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);

      let image_url = null;

      if (imageFile) {
        image_url = await uploadReviewImage(imageFile);
      }

      await createReview({
        token,
        rating,
        comment,
        image_url,
      });

      setSubmitted(true);
    } catch (err) {
      alert(err.message || "Failed to submit review");
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // STATES
  // =========================
  if (loading) {
    return <div style={{ textAlign: "center", marginTop: 60 }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: 60, color: "red" }}>
        {error}
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <h2>Thank you for your review 💖</h2>
        <p>We truly appreciate your feedback.</p>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div
      style={{
        maxWidth: 500,
        margin: "40px auto",
        padding: 24,
        borderRadius: 12,
        border: "1px solid #eee",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Leave a Review</h2>

      {/* BOOKING INFO */}
      {booking && (
        <p style={{ fontSize: 14, color: "#555" }}>
          <b>Service:</b> {booking.service || "N/A"}
          <br />
          <b>Date:</b> {booking.date || "N/A"}
          <br />
          <b>Time:</b> {booking.time || "N/A"}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {/* RATING */}
        <label><b>Rating</b></label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} ⭐
            </option>
          ))}
        </select>

        <br /><br />

        {/* COMMENT */}
        <label><b>Comment</b></label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share your experience..."
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        />

        <br /><br />

        {/* IMAGE */}
        <label><b>Photo (optional)</b></label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
          }}
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="preview"
            style={{
              width: "100%",
              marginTop: 10,
              borderRadius: 8,
            }}
          />
        )}

        <br /><br />

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={uploading}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 30,
            border: "none",
            background: uploading ? "#ccc" : "#E8A1B2",
            fontWeight: "bold",
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          {uploading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default ReviewPage;