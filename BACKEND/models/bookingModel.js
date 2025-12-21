import { supabase } from "../config/db.js";


export async function createBooking({
  customer_id,
  service_id,
  appointment_time,
  payment_screenshot_url,
}){
  const {data ,  error} = await supabase
  .from(appointments)
   .insert([
      {
        customer_id,
        service_id,
        appointment_time,
        payment_screenshot_url,
        status: "pending",
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;

}


export async function getAppointmentsByDate(date) {
  const { data, error } = await supabase
    .from("appointments")
    .select("appointment_time, service_id")
    .gte("appointment_time", `${date}T00:00:00`)
    .lt("appointment_time", `${date}T23:59:59`);
  if (error) throw error;
  return data;
}