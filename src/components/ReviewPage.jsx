import { useEffect, useState } from "react";
import {
  verifyReviewToken,
  createReview,
} from "../../backend/reviewApi";
import { uploadReviewImage } from "../utils/uploadReviewImage";

const ReviewPage = () => {
  // get token from URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  // states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // image states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  // VERIFY TOKEN
  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (!token) {
        if (isMounted) {
          setError("Invalid review link");
          setLoading(false);
        }
        return;
      }

      try {
        const data = await verifyReviewToken(token);
        if (isMounted) {
          setBooking(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Invalid or expired review link");
          setLoading(false);
        }
      }
    };

    verify();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // SUBMIT REVIEW
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

  // UI STATES
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

  // REVIEW FORM
  return (
    <div
      style={{
        maxWidth: 500,
        margin: "40px auto",
        padding: 24,
        borderRadius: 12,
        border: "1px solid #eee",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <h2 style={{ marginBottom: 12 }}>Leave a Review</h2>

      <p style={{ fontSize: 14, color: "#555" }}>
        <b>Service:</b> {booking.service}
        <br />
        <b>Date:</b> {booking.date}
        <br />
        <b>Time:</b> {booking.time}
      </p>

      <form onSubmit={handleSubmit}>
        {/* ⭐ Rating */}
        <label style={{ fontWeight: "bold" }}>Rating</label>
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

        {/* 💬 Comment */}
        <label style={{ fontWeight: "bold" }}>Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share your experience..."
          style={{
            width: "100%",
            padding: 10,
            marginTop: 6,
            resize: "vertical",
          }}
        />

        <br /><br />

        {/* 🖼️ Image Upload */}
        <label style={{ fontWeight: "bold" }}>Photo (optional)</label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
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
            alt="Preview"
            style={{
              width: "100%",
              marginTop: 10,
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
        )}

        <br /><br />

        {/* 🚀 Submit */}
        <button
          type="submit"
          disabled={uploading}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 30,
            border: "none",
            background: uploading ? "#ccc" : "#E8A1B2",
            color: "#111",
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
