import Joi from "joi";

// ------------------ SERVICE VALIDATION ------------------
export const serviceSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  duration: Joi.string().allow(null, ""),
  images: Joi.string().optional().allow(""),
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

  price: Joi.number().required().strict(false).messages({
    "any.required": "price is required",
    "number.base": "price must be a number",
  }),

  downpayment: Joi.number().required().strict(false).messages({
    "any.required": "downpayment is required",
    "number.base": "downpayment must be a number",
  }),

  estimate_min: Joi.number().allow(null).optional().strict(false).messages({
    "number.base": "estimate_min must be a number",
  }),

  estimate_max: Joi.number().allow(null).optional().strict(false).messages({
    "number.base": "estimate_max must be a number",
  }),

  is_active: Joi.boolean().optional(),
}).custom((value, helpers) => {
  const { estimate_min, estimate_max } = value;

  if (
    estimate_min !== undefined &&
    estimate_min !== null &&
    estimate_max !== undefined &&
    estimate_max !== null &&
    Number(estimate_min) > Number(estimate_max)
  ) {
    return helpers.error("any.invalid", {
      message: "estimate_min cannot be greater than estimate_max",
    });
  }

  return value;
}, "Estimate range validation");

// ------------------ VALIDATION HELPER ------------------
export const validate = (schema, data) => {
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) return error.details.map((d) => d.context?.message || d.message);
  return null;
};

// ------------------ CATEGORY UPDATE VALIDATION ------------------
export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "any.required": "Category name is required",
    "string.empty": "Category name cannot be empty",
  }),
});
