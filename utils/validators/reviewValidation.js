import Joi from "joi";


export const createReviewSchema = Joi.object({
booking_id: Joi.number().integer().required(),
rating: Joi.number().integer().min(1).max(5).required(),
comment: Joi.string().allow("",null).max(1000),
image_url: Joi.string().allow("", null)
});


export const validate = (schema, payload) => {
  const { error } = schema.validate(payload, { abortEarly: false });
  if (!error) return null;

  return error.details.map((d) => ({
    field: d.path.join("."),
    message: d.message,
  }));
};