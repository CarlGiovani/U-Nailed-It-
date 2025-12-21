import {z} from "zod";

export const bookingSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(3),
  phone: z.string().min(5),
  facebook: z.string().optional(),
  service_id: z.string().or(z.number()),
  appointment_time: z.string() // ISO string
});