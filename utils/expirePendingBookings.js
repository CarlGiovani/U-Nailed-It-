import supabase from "./supabaseClient.js";

export const expirePendingBookings = async () => {
  const now = new Date().toISOString();

  // expire bookings
  const { error: bookingErr } = await supabase
    .from("bookings")
    .update({ status: "expired" })
    .eq("status", "pending_payment")
    .lt("expires_at", now);

  if (bookingErr) console.error("Expire bookings error:", bookingErr.message);

  // optional: expire payment intents too (clean)
  const { error: intentErr } = await supabase
    .from("payment_intents")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("expires_at", now);

  if (intentErr) console.error("Expire intents error:", intentErr.message);
};
