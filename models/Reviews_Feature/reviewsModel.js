import supabase from "../../utils/supabaseClient.js";

/* ==========================================
   PUBLIC: Create Review
   - only if booking is completed
   - only if no existing review for that booking
   - uses BOOKING SNAPSHOT fields
========================================== */
export const createReview = async ({ token, rating, comment, image_url }) => {
  if (!token) throw new Error("Review token is required");

  // Find booking by token using SNAPSHOT fields
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      status,
      customer_name,
      customer_email,
      booking_date,
      booking_time,
      services(name)
      `,
    )
    .eq("review_token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!booking) throw new Error("Invalid or expired review link");
  if (booking.status !== "completed") {
    throw new Error("You can only review a completed booking");
  }

  // Prevent duplicate review
  const { data: existing, error: existingErr } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", booking.id)
    .maybeSingle();

  if (existingErr) throw new Error(existingErr.message);
  if (existing) throw new Error("This booking already has a review");

  // Insert review
  const { data: created, error: createErr } = await supabase
    .from("reviews")
    .insert([
      {
        booking_id: booking.id,
        rating,
        comment: comment ?? null,
        image_url: image_url || null,
        is_approved: false,
      },
    ])
    .select()
    .single();

  if (createErr) throw new Error(createErr.message);

  // Return review + booking snapshot info for notifications/UI
  return {
    ...created,
    customer_name: booking.customer_name,
    customer_email: booking.customer_email,
    booking_date: booking.booking_date,
    booking_time: booking.booking_time,
    service_name: booking.services?.name || null,
  };
};

/* ==========================================
   PUBLIC: Get approved reviews (paginated)
   - uses BOOKING SNAPSHOT fields
========================================== */
export const getApprovedReviews = async ({ page = 1, limit = 6 }) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
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
        customer_name,
        booking_date,
        booking_time,
        services(name)
      )
      `,
      { count: "exact" },
    )
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const normalized = (data || []).map((item) => ({
    id: item.id,
    rating: item.rating,
    comment: item.comment,
    image_url: item.image_url,
    created_at: item.created_at,
    booking_id: item.bookings?.id || null,
    customer_name: item.bookings?.customer_name || null,
    booking_date: item.bookings?.booking_date || null,
    booking_time: item.bookings?.booking_time || null,
    service_name: item.bookings?.services?.name || null,
  }));

  return {
    data: normalized,
    page,
    limit,
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

/* ==========================================
   ADMIN: Get all reviews (paginated)
   - uses BOOKING SNAPSHOT fields
========================================== */
export const getAllReviewsAdmin = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "all",
}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("reviews").select(
    `
      id,
      booking_id,
      rating,
      comment,
      image_url,
      is_approved,
      created_at,
      bookings!inner(
        id,
        status,
        booking_date,
        booking_time,
        customer_name,
        customer_email,
        customer_phone,
        customer_facebook_link,
        services(id, name)
      )
    `,
    { count: "exact" },
  );

  if (status === "approved") {
    query = query.eq("is_approved", true);
  } else if (status === "pending") {
    query = query.eq("is_approved", false);
  }

  if (search) {
    query = query.ilike("bookings.customer_name", `%${search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const normalized = (data || []).map((item) => ({
    id: item.id,
    booking_id: item.booking_id,
    rating: item.rating,
    comment: item.comment,
    image_url: item.image_url,
    is_approved: item.is_approved,
    created_at: item.created_at,
    booking: {
      id: item.bookings?.id || null,
      status: item.bookings?.status || null,
      booking_date: item.bookings?.booking_date || null,
      booking_time: item.bookings?.booking_time || null,
      customer_name: item.bookings?.customer_name || null,
      customer_email: item.bookings?.customer_email || null,
      customer_phone: item.bookings?.customer_phone || null,
      customer_facebook_link: item.bookings?.customer_facebook_link || null,
      service: item.bookings?.services
        ? {
            id: item.bookings.services.id,
            name: item.bookings.services.name,
          }
        : null,
    },
  }));

  return {
    data: normalized,
    page,
    limit,
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

/* ==========================================
   ADMIN: Approve review
   - uses BOOKING SNAPSHOT fields
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
      id,
      booking_id,
      rating,
      comment,
      image_url,
      is_approved,
      created_at,
      bookings(
        id,
        booking_date,
        booking_time,
        customer_name,
        customer_email,
        services(id, name)
      )
      `,
    )
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Review not found");

  return {
    id: data.id,
    booking_id: data.booking_id,
    rating: data.rating,
    comment: data.comment,
    image_url: data.image_url,
    is_approved: data.is_approved,
    created_at: data.created_at,
    booking: {
      id: data.bookings?.id || null,
      booking_date: data.bookings?.booking_date || null,
      booking_time: data.bookings?.booking_time || null,
      customer_name: data.bookings?.customer_name || null,
      customer_email: data.bookings?.customer_email || null,
      service: data.bookings?.services
        ? {
            id: data.bookings.services.id,
            name: data.bookings.services.name,
          }
        : null,
    },
  };
};

/* ==========================================
   ADMIN: Reject review (delete)
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
   PUBLIC: Verify review token
   - uses BOOKING SNAPSHOT fields
========================================== */
export const verifyReviewToken = async (token) => {
  if (!token) throw new Error("Review token is required");

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      status,
      booking_date,
      booking_time,
      review_token,
      customer_name,
      customer_email,
      services(id, name)
      `,
    )
    .eq("review_token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!booking) throw new Error("Invalid or expired review link");

  if (booking.status !== "completed") {
    throw new Error("This booking is not completed");
  }

  const { data: existing, error: existingErr } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", booking.id)
    .maybeSingle();

  if (existingErr) throw new Error(existingErr.message);
  if (existing) {
    throw new Error("This booking has already been reviewed");
  }

  return {
    booking_id: booking.id,
    service: booking.services?.name || null,
    date: booking.booking_date,
    time: booking.booking_time,
    customer_name: booking.customer_name,
    customer_email: booking.customer_email,
  };
};
