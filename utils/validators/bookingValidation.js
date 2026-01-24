
import Joi from "joi";

// ------------------ BOOKING VALIDATION ------------------

// PUBLIC: create booking
export const createBookingSchema = Joi.object({
  customer_name: Joi.string().required().messages({
    "any.required": "Customer full name is required",
    "string.empty": "Customer name cannot be empty",
  }),
  customer_email: Joi.string().email().required().messages({
    "any.required": "Customer email is required",
    "string.email": "Customer email must be valid",
  }),
  service_id: Joi.number().required().messages({
    "any.required": "service_id is required",
    "number.base": "service_id must be a number",
  }),
  date: Joi.string().required().messages({
    "any.required": "Booking date is required",
    "string.empty": "Booking date cannot be empty",
  }),
  time: Joi.string().required().messages({
    "any.required": "Booking time is required",
    "string.empty": "Booking time cannot be empty",
  }),
  notes: Joi.string().allow("").optional(),
});

// ADMIN: update booking status
export const updateBookingStatusSchema = Joi.object({
  status: Joi.string()
    .valid("approved", "rejected", "completed")
    .required()
    .messages({
      "any.required": "Booking status is required",
      "any.only": "Status must be one of 'approved', 'rejected', or 'completed'",
    }),
});

// ------------------ VALIDATION HELPER ------------------
export const validate = (schema, data) => {
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) return error.details.map((d) => d.message);
  return null;
};
