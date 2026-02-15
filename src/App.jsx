import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLogin from "./pages/auth/AdminLogin";
import Bookings from "./pages/bookings/bookings.jsx";
import Dashboard from "./pages/dashboard/Dashboard";
import Services from "./pages/services/Services.jsx";
import AdminProtectedRoute from "./routes/adminProtectedRoute.jsx";

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
          path="/services"
          element={
            <AdminProtectedRoute>
              <Services />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
