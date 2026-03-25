import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { scheduleBookingExpiry } from "./utils/bookingExpiryCron.js";
import { scheduleSlotCleanup } from "./utils/slotCron.js";

// ENDPOINTS IMPORT
import notificationRoutes from "./routes/Admin_Notification_Feature/notificationRoutes.js";
import announcementRoutes from "./routes/Announcement_Feature/announcementRoutes.js";
import auditRoutes from "./routes/Audit_Feature/auditRoutes.js";
import authRoutes from "./routes/Authentication_Feature/authRoutes.js";
import bookingRouter from "./routes/Booking_Feature/bookingRoutes.js";
import calendarRoutes from "./routes/Calendar_Feature/calendarRoutes.js";
import customerRouter from "./routes/Customer_Feature/customerRoutes.js";
import dashboardRoutes from "./routes/Dashboard_Feature/dashboardRoutes.js";
import paymentRouter from "./routes/Payment_Feature/paymentRoutes.js";
import policiesRoutes from "./routes/Policies_Feature/policiesRoutes.js";
import portfolioRoutes from "./routes/portfolio_Feature/portfolioRoutes.js";
import reviewsRoutes from "./routes/Review_Feature/reviewsRoutes.js";
import servicesRouter from "./routes/Services_Feature/serviceRoutes.js";
import testEmailRoutes from "./routes/testEmail.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(
  cors({
    origin: [
      "http://192.168.100.5:5173",
      "http://192.168.100.5:5174",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("YOUR SERVER IS RUNNING!!!!!!");
});

// ROUTES
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

// START CRON JOBS
scheduleSlotCleanup();
scheduleBookingExpiry();

// START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});
