import AdminLayout from "../../components/layout/adminLayout";

const Dashboard = () => {
  return (
    <AdminLayout>
      <div>
        <h1>Dashboard Overview</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p>0</p>
          </div>

          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p>₱0</p>
          </div>

          <div className="stat-card">
            <h3>Pending Reviews</h3>
            <p>0</p>
          </div>

          <div className="stat-card">
            <h3>Active Services</h3>
            <p>0</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
