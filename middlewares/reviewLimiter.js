import rateLimit from "express-rate-limit";

export const reviewSubmitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // 3 review attempts
  message: {
    message: "Too many review attempts. Please try again later.",
  },
});

export const reviewVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: {
    message: "Too many verification attempts. Please slow down.",
  },
});
