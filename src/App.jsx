import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLogin from "./pages/auth/AdminLogin";
import Bookings from "./pages/bookings/bookings.jsx";
import Dashboard from "./pages/dashboard/Dashboard";
import Services from "./pages/services/Services.jsx";
import AdminCalendar from "./pages/calendar/calendar.jsx";
import AdminProtectedRoute from "./routes/adminProtectedRoute.jsx";
import Portfolio from "./pages/portfolio/portfolio.jsx";
import AdminReviews from "./pages/reviews/reviews.jsx";
import Announcements from "./pages/announcement/announcement.jsx";
import Policies from "./pages/policies/policies.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<AdminLogin />} />

        {/* ================= PROTECTED ROUTES ================= */}
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
