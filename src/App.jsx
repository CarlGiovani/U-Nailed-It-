import { BrowserRouter, Route, Routes } from "react-router-dom";
import Announcements from "./pages/announcement/announcement.jsx";
import AdminLogin from "./pages/auth/AdminLogin";
import ForgotPassword from "./pages/Forgot_Password/forgotPassword.jsx";
import ResetPassword from "./pages/Reset_Password/resetPassword.jsx";
import Bookings from "./pages/bookings/bookings.jsx";
import AdminCalendar from "./pages/calendar/calendar.jsx";
import Dashboard from "./pages/dashboard/Dashboard";
import Policies from "./pages/policies/policies.jsx";
import Portfolio from "./pages/portfolio/portfolio.jsx";
import AdminReviews from "./pages/reviews/reviews.jsx";
import Services from "./pages/services/Services.jsx";
import Settings from "./pages/settings/settings.jsx";
import AdminProtectedRoute from "./routes/adminProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <AdminProtectedRoute>
              <Dashboard />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <AdminProtectedRoute>
              <Bookings />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/reviews"
          element={
            <AdminProtectedRoute>
              <AdminReviews />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/services"
          element={
            <AdminProtectedRoute>
              <Services />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/policies"
          element={
            <AdminProtectedRoute>
              <Policies />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/portfolio"
          element={
            <AdminProtectedRoute>
              <Portfolio />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/announcements"
          element={
            <AdminProtectedRoute>
              <Announcements />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <AdminProtectedRoute>
              <AdminCalendar />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <AdminProtectedRoute>
              <Settings />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
