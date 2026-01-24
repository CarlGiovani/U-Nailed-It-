import Joi from "joi";

// ------------------ SERVICE VALIDATION ------------------
export const serviceSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Service name is required",
    "string.empty": "Service name cannot be empty",
  }),
  description: Joi.string().allow("").optional(),
  price: Joi.number().precision(2).optional(),
  downpayment: Joi.number().precision(2).optional(),
  is_active: Joi.boolean().optional(),
});

// ------------------ CATEGORY VALIDATION ------------------
export const categorySchema = Joi.object({
  service_id: Joi.number().required().messages({
    "any.required": "service_id is required",
    "number.base": "service_id must be a number",
  }),
  name: Joi.string().required().messages({
    "any.required": "Category name is required",
    "string.empty": "Category name cannot be empty",
  }),
});

// ------------------ VARIANT VALIDATION ------------------
export const variantSchema = Joi.object({
  category_id: Joi.number().required().messages({
    "any.required": "category_id is required",
    "number.base": "category_id must be a number",
  }),
  body_part: Joi.string().required().messages({
    "any.required": "body_part is required",
    "string.empty": "body_part cannot be empty",
  }),
  size: Joi.string().optional().allow(""),
  price: Joi.number().required().messages({
    "any.required": "price is required",
    "number.base": "price must be a number",
  }),
  downpayment: Joi.number().required().messages({
    "any.required": "downpayment is required",
    "number.base": "downpayment must be a number",
  }),
  is_active: Joi.boolean().optional(),
});

// ------------------ VALIDATION HELPER ------------------
export const validate = (schema, data) => {
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) return error.details.map((d) => d.message);
  return null;
};
