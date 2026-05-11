import { useEffect, useState } from "react";
import { createReview, verifyReviewToken } from "../../backend/reviewApi";
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
    let isMounted = true;

    ("🚀 useEffect RUNNING");

    const verify = async () => {
      ("🟡 VERIFY START");

      if (!token) {
        ("❌ NO TOKEN FOUND");
        setError("Invalid review link");
        setLoading(false);
        return;
      }

      try {
        ("📡 CALLING verifyReviewToken...");

        const data = await verifyReviewToken(token);

        ("✅ API RESPONSE:", data);

        if (isMounted) {
          setBooking(data);
          setLoading(false);
          ("🟢 BOOKING SET + LOADING FALSE");
        }
      } catch (err) {
        ("❌ VERIFY ERROR:", err);

        if (isMounted) {
          setError(err.message || "Invalid or expired review link");
          setLoading(false);
        }
      }
    };

    verify();

    return () => {
      ("🧹 CLEANUP RUN");
      isMounted = false;
    };
  }, [token]);

  // =========================
  // SUBMIT REVIEW
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    ("📤 SUBMIT CLICKED");

    try {
      setUploading(true);

      let image_url = null;

      if (imageFile) {
        ("🖼️ UPLOADING IMAGE...");
        image_url = await uploadReviewImage(imageFile);
        ("✅ IMAGE URL:", image_url);
      }

      ("📡 CREATING REVIEW...");

      await createReview({
        token,
        rating,
        comment,
        image_url,
      });

      ("✅ REVIEW SUBMITTED");

      setSubmitted(true);
    } catch (err) {
      ("❌ SUBMIT ERROR:", err);
      alert(err.message || "Failed to submit review");
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // STATES
  // =========================
  if (loading) {
    ("⏳ RENDER: LOADING");
    return <div style={{ textAlign: "center", marginTop: 60 }}>Loading...</div>;
  }

  if (error) {
    ("⚠️ RENDER: ERROR", error);
    return (
      <div style={{ textAlign: "center", marginTop: 60, color: "red" }}>
        {error}
      </div>
    );
  }

  if (submitted) {
    ("🎉 RENDER: SUBMITTED");
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
  ("🎨 RENDER: FORM DISPLAY");

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
      <h2>Leave a Review</h2>

      <p style={{ fontSize: 14, color: "#555" }}>
        <b>Service:</b> {booking?.service}
        <br />
        <b>Date:</b> {booking?.date}
        <br />
        <b>Time:</b> {booking?.time}
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          <b>Rating</b>
        </label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          style={{ width: "100%", padding: 10 }}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} ⭐
            </option>
          ))}
        </select>

        <br />
        <br />

        <label>
          <b>Comment</b>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          style={{ width: "100%", padding: 10 }}
        />

        <br />
        <br />

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
            style={{ width: "100%", marginTop: 10 }}
          />
        )}

        <br />
        <br />

        <button
          type="submit"
          disabled={uploading}
          style={{
            width: "100%",
            padding: 12,
            background: uploading ? "#ccc" : "#E8A1B2",
          }}
        >
          {uploading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default ReviewPage;
