import Joi from "joi";

/* =========================
   ADMIN LOGIN
========================= */
export const adminLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.empty": "Email cannot be empty",
    "string.email": "Email must be valid",
  }),
  password: Joi.string().min(6).required().messages({
    "any.required": "Password is required",
    "string.empty": "Password cannot be empty",
    "string.min": "Password must be at least 6 characters",
  }),
});

/* =========================
   CREATE ADMIN ACCOUNT
========================= */
export const adminCreateAccountSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.empty": "Email cannot be empty",
    "string.email": "Email must be valid",
  }),

  password: Joi.string().min(6).required().messages({
    "any.required": "Password is required",
    "string.empty": "Password cannot be empty",
    "string.min": "Password must be at least 6 characters",
  }),

  username: Joi.string().trim().allow("").optional().messages({
    "string.base": "Username must be a string",
  }),

  full_name: Joi.string().trim().allow("").optional().messages({
    "string.base": "Full name must be a string",
  }),
});

/* =========================
   FORGOT PASSWORD
========================= */
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.empty": "Email cannot be empty",
    "string.email": "Email must be valid",
  }),
});

/* =========================
   CHANGE PASSWORD
========================= */
export const changePasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).required().messages({
    "any.required": "New password is required",
    "string.empty": "New password cannot be empty",
    "string.min": "Password must be at least 6 characters",
  }),

  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref("newPassword"))
    .messages({
      "any.required": "Confirm password is required",
      "string.empty": "Confirm password cannot be empty",
      "any.only": "Passwords do not match",
    }),
});

/* =========================
   VALIDATION HELPER
========================= */
export const validate = (schema, data) => {
  const { error } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) return error.details.map((d) => d.message);
  return null;
};
