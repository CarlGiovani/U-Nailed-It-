import { useEffect, useRef, useState } from "react";
import AdminLayout from "../../components/layout/adminLayout";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getAuditLogs } from "../../services/BACKEND/adminAudtiApi";
import { getDashboardData } from "../../services/BACKEND/adminDashboardApi";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useReactToPrint } from "react-to-print";

import "../../styles/dashboard.css";

const ITEMS_PER_PAGE = 5;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    pendingReviews: 0,
    activeServices: 0,
    pendingApprovalBookings: 0,
  });

  const [analytics, setAnalytics] = useState({
    bookingsPerMonth: {},
    revenuePerMonth: {},
  });

  const [bookings, setBookings] = useState([]);
  const [activities, setActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const reportRef = useRef(null);

  /* ===============================
     FETCH DATA
  =============================== */
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getDashboardData();

        setStats({
          totalBookings: data?.stats?.totalBookings || 0,
          totalRevenue: data?.stats?.totalRevenue || 0,
          pendingReviews: data?.stats?.pendingReviews || 0,
          activeServices: data?.stats?.activeServices || 0,
          pendingApprovalBookings: data?.stats?.pendingApprovalBookings || 0,
        });

        setAnalytics({
          bookingsPerMonth: data?.analytics?.bookingsPerMonth || {},
          revenuePerMonth: data?.analytics?.revenuePerMonth || {},
        });

        setBookings(data?.recentBookings || []);

        const logs = await getAuditLogs();
        setActivities(logs || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };

    loadDashboard();
  }, []);

  /* ===============================
     PAGINATION
  =============================== */
  const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);

  const paginatedBookings = bookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  /* ===============================
     CHART DATA
  =============================== */
  const bookingChart = Object.keys(analytics.bookingsPerMonth || {}).map(
    (month) => ({
      month,
      bookings: analytics.bookingsPerMonth[month],
    }),
  );

  const revenueChart = Object.keys(analytics.revenuePerMonth || {}).map(
    (month) => ({
      month,
      revenue: analytics.revenuePerMonth[month],
    }),
  );

  /* ===============================
     TOP SERVICES
  =============================== */
  const serviceCount = {};

  bookings.forEach((booking) => {
    const name = booking.services?.name || "Unknown";
    serviceCount[name] = (serviceCount[name] || 0) + 1;
  });

  const topServices = Object.keys(serviceCount).map((service) => ({
    name: service,
    value: serviceCount[service],
  }));

  const COLORS = ["#d4af37", "#ff69b4", "#8884d8", "#82ca9d", "#60a5fa"];

  /* ===============================
     EXPORT EXCEL
  =============================== */
  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Bookings");

    sheet.columns = [
      { header: "Booking ID", key: "id", width: 10 },
      { header: "Customer Name", key: "customer", width: 25 },
      { header: "Service", key: "service", width: 25 },
      { header: "Status", key: "status", width: 20 },
      { header: "Date", key: "date", width: 20 },
    ];

    bookings.forEach((booking) => {
      sheet.addRow({
        id: booking.id,
        customer: booking.customers?.full_name || "N/A",
        service: booking.services?.name || "N/A",
        status: booking.status,
        date: booking.booking_date,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    const file = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, "dashboard_report.xlsx");
  };

  /* ===============================
     PRINT
  =============================== */
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
  });

  /* ===============================
     HELPERS
  =============================== */
  const getStatusClass = (status) => {
    if (status === "approved") return "status approved";
    if (status === "completed") return "status completed";
    if (status === "pending_approval") return "status pending";
    if (status === "cancelled") return "status cancelled";
    if (status === "rejected") return "status rejected";
    return "status";
  };

  const formatCurrency = (value) => {
    return `₱${Number(value || 0).toLocaleString()}`;
  };

  return (
    <AdminLayout>
      <div className="dashboard-container" ref={reportRef}>
        <h1 className="dashboard-title">Dashboard Overview</h1>

        <div style={{ display: "none" }}>
          <div className="print-report">
            <h1>UNAILEDIT Business Report</h1>

            <p>Date Generated: {new Date().toLocaleDateString()}</p>

            <h2>Statistics</h2>

            <table className="report-table">
              <tbody>
                <tr>
                  <td>Total Bookings</td>
                  <td>{stats.totalBookings}</td>
                </tr>
                <tr>
                  <td>Total Revenue</td>
                  <td>{formatCurrency(stats.totalRevenue)}</td>
                </tr>
                <tr>
                  <td>Pending Approval</td>
                  <td>{stats.pendingApprovalBookings}</td>
                </tr>
                <tr>
                  <td>Pending Reviews</td>
                  <td>{stats.pendingReviews}</td>
                </tr>
                <tr>
                  <td>Active Services</td>
                  <td>{stats.activeServices}</td>
                </tr>
              </tbody>
            </table>

            <h2>Recent Bookings</h2>

            <table className="report-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {bookings.slice(0, 10).map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.customers?.full_name || "N/A"}</td>
                    <td>{booking.services?.name || "N/A"}</td>
                    <td>{booking.status}</td>
                    <td>{booking.booking_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p>{stats.totalBookings}</p>
          </div>

          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p>{formatCurrency(stats.totalRevenue)}</p>
          </div>

          <div className="stat-card stat-card-pending">
            <h3>Pending Approval</h3>
            <p>{stats.pendingApprovalBookings}</p>
          </div>

          <div className="stat-card">
            <h3>Pending Reviews</h3>
            <p>{stats.pendingReviews}</p>
          </div>

          <div className="stat-card">
            <h3>Active Services</h3>
            <p>{stats.activeServices}</p>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>Bookings Per Month</h3>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={bookingChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#d4af37" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Revenue Per Month</h3>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#ff69b4" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Top Services</h3>

            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={topServices}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                >
                  {topServices.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="activity-card">
          <div className="section-header">
            <h3>Audit Logs</h3>
            <span>{activities.length} activities</span>
          </div>

          <div className="activity-feed">
            {activities.length > 0 ? (
              activities.slice(0, 5).map((log) => (
                <div className="activity-item" key={log.id}>
                  <div className={`activity-icon ${log.action}`}>●</div>

                  <div className="activity-content">
                    <div className="activity-title">
                      {log.action.replaceAll("_", " ")}
                    </div>

                    <div className="activity-desc">{log.description}</div>

                    <div className="activity-time">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-panel">No audit logs found.</div>
            )}
          </div>
        </div>

        <div className="dashboard-actions">
          <button onClick={exportExcel} className="admin-btn">
            Export Excel
          </button>

          <button onClick={handlePrint} className="admin-btn">
            Print Report
          </button>
        </div>

        <div className="recent-bookings">
          <div className="section-header">
            <h2>Recent Bookings</h2>
            <span>{bookings.length} bookings</span>
          </div>

          <div className="table-card">
            <div className="table-wrapper recent-bookings-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedBookings.length > 0 ? (
                    paginatedBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.id}</td>
                        <td>{booking.customers?.full_name || "N/A"}</td>
                        <td>{booking.services?.name || "N/A"}</td>
                        <td>
                          <span className={getStatusClass(booking.status)}>
                            {booking.status}
                          </span>
                        </td>
                        <td>{booking.booking_date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        No recent bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Prev
            </button>

            <span>
              Page {totalPages === 0 ? 0 : currentPage} / {totalPages || 1}
            </span>

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
