import supabase from "../../utils/supabaseClient.js";

/* ==========================================
   PUBLIC: Create Review
   - only if booking is completed
   - only if no existing review for that booking
========================================== */
export const createReview = async ({ token, rating, comment, image_url }) => {
  if (!token) throw new Error("Review token is required");

  // 1️⃣ Find booking by token
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id, status")
    .eq("review_token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!booking) throw new Error("Invalid or expired review link");
  if (booking.status !== "completed")
    throw new Error("You can only review a completed booking");

  // 2️⃣ Prevent duplicate review
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", booking.id)
    .maybeSingle();

  if (existing) throw new Error("This booking already has a review");

  // 3️⃣ Insert review
  const { data: created, error: createErr } = await supabase
    .from("reviews")
    .insert([
      {
        booking_id: booking.id,
        rating,
        comment,
        image_url: image_url || null,
        is_approved: false,
      },
    ])
    .select()
    .single();

  if (createErr) throw new Error(createErr.message);
  return created;
};

/* ==========================================
   PUBLIC: Get approved reviews (website)
========================================== */
export const getApprovedReviews = async (params) => {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      rating,
      comment,
      image_url,
      created_at,
      bookings(
        id,
        booking_date,
        booking_time,
        services(id,name),
        customers(full_name)
      )
    `,
    )
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

/* ==========================================
    ADMIN: Get all reviews (pending + approved)
========================================== */
export const getAllReviewsAdmin = async () => {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      bookings(
        id,
        status,
        booking_date,
        booking_time,
        services(id,name),
        customers(id,full_name,email)
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

/* ==========================================
   ADMIN: Approve review
========================================== */
export const approveReview = async (id) => {
  const reviewId = Number(id);
  if (!reviewId) throw new Error("Invalid review id");

  const { data, error } = await supabase
    .from("reviews")
    .update({ is_approved: true })
    .eq("id", reviewId)
    .select(
      `
      *,
      bookings(
        id,
        booking_date,
        booking_time,
        services(id,name),
        customers(id,full_name,email)
      )
    `,
    )
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Review not found");
  return data;
};

/* ==========================================
   ADMIN: Reject review (Option A: delete)
   - If you prefer "mark rejected", tell me
========================================== */
export const rejectReview = async (id) => {
  const reviewId = Number(id);
  if (!reviewId) throw new Error("Invalid review id");

  const { data, error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Review not found");
  return data;
};

/* ==========================================
   FOR REVIEW VERIFY TOKEN
========================================== */
export const verifyReviewToken = async (token) => {
  if (!token) throw new Error("Review token is required");

  // hanapin booking by token
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      status,
      booking_date,
      booking_time,
      review_token,
      services(id, name),
      customers(full_name)
      `,
    )
    .eq("review_token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!booking) throw new Error("Invalid or expired review link");

  // must be completed
  if (booking.status !== "completed") {
    throw new Error("This booking is not completed");
  }

  // check kung may existing review na
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", booking.id)
    .maybeSingle();

  if (existing) {
    throw new Error("This booking has already been reviewed");
  }

  // return SAFE data lang
  return {
    booking_id: booking.id,
    service: booking.services?.name,
    date: booking.booking_date,
    time: booking.booking_time,
    customer_name: booking.customers?.full_name,
  };
};
