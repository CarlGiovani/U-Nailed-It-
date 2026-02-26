import Joi from "joi";

// ------------------ BOOKING VALIDATION ------------------

// PUBLIC: create booking
export const createBookingSchema = Joi.object({
  full_name: Joi.string().required().messages({
    "any.required": "Customer full name is required",
    "string.empty": "Customer full name cannot be empty",
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Customer email is required",
    "string.email": "Customer email must be valid",
  }),
  phone: Joi.string().allow("").optional(),
  facebook_link: Joi.string().allow("").optional(),
  service_id: Joi.number().required().messages({
    "any.required": "service_id is required",
    "number.base": "service_id must be a number",
  }),
  service_category_id: Joi.number().required().messages({
    "any.required": "service_category_id is required",
    "number.base": "service_category_id must be a number",
  }),
  service_variant_id: Joi.number().optional(),
  booking_date: Joi.string().required().messages({
    "any.required": "Booking date is required",
    "string.empty": "Booking date cannot be empty",
  }),
  booking_time: Joi.string().required().messages({
    "any.required": "Booking time is required",
    "string.empty": "Booking time cannot be empty",
  }),
  total_price: Joi.number().required().messages({
    "any.required": "Total price is required",
    "number.base": "Total price must be a number",
  }),
  downpayment: Joi.number().required().messages({
    "any.required": "Downpayment is required",
    "number.base": "Downpayment must be a number",
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
      "any.only":
        "Status must be one of 'approved', 'rejected', or 'completed'",
    }),
});

// ------------------ VALIDATION HELPER ------------------
export const validate = (schema, data) => {
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) return error.details.map((d) => d.message);
  return null;
};
