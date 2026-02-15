import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLogin from "./pages/auth/AdminLogin";
import Bookings from "./pages/bookings/bookings.jsx";
import Dashboard from "./pages/dashboard/Dashboard";
import AdminProtectedRoute from "./routes/adminProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLogin />} />

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
