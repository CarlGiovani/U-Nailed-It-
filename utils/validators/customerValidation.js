import Joi from "joi";

// ------------------ CUSTOMER VALIDATION ------------------

// Create or Get Customer
export const createCustomerSchema = Joi.object({
  full_name: Joi.string().required().messages({
    "any.required": "Full name is required",
    "string.empty": "Full name cannot be empty",
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Email must be valid",
  }),
  phone: Joi.string().allow("").optional(),
  address: Joi.string().allow("").optional(),
});

// ------------------ VALIDATION HELPER ------------------
export const validate = (schema, data) => {
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) return error.details.map((d) => d.message);
  return null;
};
