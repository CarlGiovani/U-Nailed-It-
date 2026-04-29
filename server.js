import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import dns from "dns"; 

// ROUTES
import notificationRoutes from "./routes/Admin_Notification_Feature/notificationRoutes.js";
import announcementRoutes from "./routes/Announcement_Feature/announcementRoutes.js";
import auditRoutes from "./routes/Audit_Feature/auditRoutes.js";
import authRoutes from "./routes/Authentication_Feature/authRoutes.js";
import bookingRouter from "./routes/Booking_Feature/bookingRoutes.js";
import bookingRemindersRoutes from "./routes/Booking_Reminders_Feature/bookingRemindersRoutes.js";
import calendarRoutes from "./routes/Calendar_Feature/calendarRoutes.js";
import jobRoutes from "./routes/Cron_Jobs_Feature/jobRoutes.js";
import customerRouter from "./routes/Customer_Feature/customerRoutes.js";
import dashboardRoutes from "./routes/Dashboard_Feature/dashboardRoutes.js";
import emailSettingsRoutes from "./routes/Email_Settings_Feature/emailSettingsRoutes.js";
import paymentRouter from "./routes/Payment_Feature/paymentRoutes.js";
import policiesRoutes from "./routes/Policies_Feature/policiesRoutes.js";
import portfolioRoutes from "./routes/portfolio_Feature/portfolioRoutes.js";
import reviewsRoutes from "./routes/Review_Feature/reviewsRoutes.js";
import servicesRouter from "./routes/Services_Feature/serviceRoutes.js";
import testEmailRoutes from "./routes/testEmail.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

dns.setDefaultResultOrder("ipv4first");

/* ======================================================
   SECURITY MIDDLEWARE
====================================================== */
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP
});

app.use(limiter);

/* ======================================================
   CORS CONFIG (PRODUCTION SAFE)
====================================================== */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

/* ======================================================
   BODY PARSERS
====================================================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ======================================================
   HEALTH CHECK
====================================================== */
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Server is running!",
    status: "OK",
  });
});

/* ======================================================
   ROUTES
====================================================== */
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRouter);
app.use("/api/services", servicesRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/calendar", calendarRoutes);
app.use("/api/payments", paymentRouter);
app.use("/api/test-email", testEmailRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/policies", policiesRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", bookingRemindersRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/email-settings", emailSettingsRoutes);

/* ======================================================
   ERROR HANDLERS
====================================================== */
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Rejection:", err);
});

/* ======================================================
   START SERVER
====================================================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
