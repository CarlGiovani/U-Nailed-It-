import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const session = localStorage.getItem("admin_session");

  if (!session) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminProtectedRoute;
