import "./Layout.css";
import Sidebar from "../layout/sidebar";
import Topbar from "../layout/topbar";

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-container">
      <Sidebar />

      <div className="main-content">
        <Topbar />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
