import { useState } from "react";
// import "../../styles/adminLayout.css";
import Sidebar from "../layout/sidebar";
import Topbar from "../layout/topbar";
import "./layout.css";

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* MAIN CONTENT */}
      <div className="main-content">
        <Topbar setMobileOpen={setMobileOpen} />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
