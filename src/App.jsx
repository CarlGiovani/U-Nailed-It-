import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLogin from "./pages/auth/AdminLogin";
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
