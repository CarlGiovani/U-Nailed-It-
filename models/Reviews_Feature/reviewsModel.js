import supabase from "../../utils/supabaseClient.js";

/* ==========================================
   PUBLIC: Create Review
   - only if booking is completed
   - only if no existing review for that booking
========================================== */
export const createReview = async ({
  booking_id,
  rating,
  comment,
  image_url,
}) => {
  const bookingId = Number(booking_id);
  if (!bookingId) throw new Error("Invalid Booking Id");

  // dapat exisiting booking
  const { data: booking, error: bookingErr } = await supabase
    .from("bookings")
    .select("id,status,customer_id,service_id,booking_date,booking_time")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingErr) throw new Error(bookingErr.message);
  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "completed") {
    throw new Error("You can only review a completed booking");
  }
  // Prevent duplicate review for same booking
  const { data: existing, error: existErr } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (existErr) throw new Error(existErr.message);
  if (existing) throw new Error("This booking already has a review");

  // Insert review (default: is_approved=false)
  const { data: created, error: createErr } = await supabase
    .from("reviews")
    .insert([
      {
        booking_id: bookingId,
        rating,
        comment,
        image_url: image_url || null,
        is_approved: false,
      },
    ])
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

  if (createErr) throw new Error(createErr.message);
  return created;
};


/* ==========================================
   PUBLIC: Get approved reviews (website)
========================================== */
export const getApprovedReviews = async (params) => {
    const {data , error} = await supabase
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
    .order("created_at" , {ascending: false});

    if (error) throw new Error(error.message);
    return data;
}


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