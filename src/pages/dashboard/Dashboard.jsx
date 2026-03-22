import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useMemo, useState } from "react";
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
import AdminLayout from "../../components/layout/adminLayout";
import { getAuditLogs } from "../../services/BACKEND/adminAudtiApi";
import {
  getDashboardData,
  getSystemExportData,
} from "../../services/BACKEND/adminDashboardApi";
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
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

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

        setBookings(
          Array.isArray(data?.recentBookings) ? data.recentBookings : [],
        );

        const logs = await getAuditLogs();
        setActivities(Array.isArray(logs) ? logs : []);
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

  const paginatedBookings = useMemo(() => {
    return bookings.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );
  }, [bookings, currentPage]);

  /* ===============================
     CHART DATA
  =============================== */
  const bookingChart = useMemo(() => {
    return Object.keys(analytics.bookingsPerMonth || {}).map((month) => ({
      month,
      bookings: analytics.bookingsPerMonth[month],
    }));
  }, [analytics.bookingsPerMonth]);

  const revenueChart = useMemo(() => {
    return Object.keys(analytics.revenuePerMonth || {}).map((month) => ({
      month,
      revenue: analytics.revenuePerMonth[month],
    }));
  }, [analytics.revenuePerMonth]);

  /* ===============================
     TOP SERVICES
  =============================== */
  const topServices = useMemo(() => {
    const serviceCount = {};

    bookings.forEach((booking) => {
      const name = booking?.services?.name || "Unknown";
      serviceCount[name] = (serviceCount[name] || 0) + 1;
    });

    return Object.keys(serviceCount).map((service) => ({
      name: service,
      value: serviceCount[service],
    }));
  }, [bookings]);

  const COLORS = ["#d4af37", "#ff69b4", "#8884d8", "#82ca9d", "#60a5fa"];

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

  const formatMoneyPdf = (value) => {
    return `PHP ${Number(value || 0).toLocaleString()}`;
  };

  const safeText = (value) => {
    if (value === null || value === undefined || value === "") return "N/A";
    return String(value);
  };

  const getVariantLabel = (variant) => {
    if (!variant) return "N/A";

    return (
      [variant.body_part, variant.size].filter(Boolean).join(" - ") || "N/A"
    );
  };

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return String(value);
    }
  };

  /* ===============================
     EXPORT EXCEL
  =============================== */
  const exportExcel = async () => {
    try {
      setExportingExcel(true);

      const data = await getSystemExportData();

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "UNAILEDIT";
      workbook.created = new Date();

      const styleHeader = (sheet) => {
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.alignment = { vertical: "middle", horizontal: "center" };

        headerRow.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF4E7B2" },
          };
        });
      };

      const autoFitColumns = (sheet) => {
        sheet.columns.forEach((column) => {
          let maxLength = 12;

          column.eachCell?.({ includeEmpty: true }, (cell) => {
            const cellValue = cell.value ? String(cell.value) : "";
            maxLength = Math.max(maxLength, cellValue.length + 2);
          });

          column.width = Math.min(maxLength, 40);
        });
      };

      /* ===============================
         BOOKINGS
      =============================== */
      const bookingsSheet = workbook.addWorksheet("Bookings");

      bookingsSheet.columns = [
        { header: "Booking ID", key: "id" },
        { header: "Customer ID", key: "customer_id" },
        { header: "Service ID", key: "service_id" },
        { header: "Variant ID", key: "service_variant_id" },
        { header: "Customer Name", key: "customer_name" },
        { header: "Customer Email", key: "customer_email" },
        { header: "Customer Phone", key: "customer_phone" },
        { header: "Facebook Link", key: "customer_facebook_link" },
        { header: "Service Name", key: "service_name" },
        { header: "Variant", key: "variant" },
        { header: "Booking Date", key: "booking_date" },
        { header: "Booking Time", key: "booking_time" },
        { header: "Total Price", key: "total_price" },
        { header: "Downpayment", key: "downpayment" },
        { header: "Notes", key: "notes" },
        { header: "Proof Payment Path", key: "proof_payment_path" },
        { header: "Status", key: "status" },
        { header: "Approved At", key: "approved_at" },
        { header: "Cancelled At", key: "cancelled_at" },
        { header: "Completed At", key: "completed_at" },
        { header: "Expires At", key: "expires_at" },
        { header: "Review Token", key: "review_token" },
        { header: "Cancel Token", key: "cancel_token" },
        { header: "Cancellation Reason", key: "cancellation_reason" },
        { header: "Created At", key: "created_at" },
        { header: "Updated At", key: "updated_at" },
      ];

      (data?.bookings || []).forEach((booking) => {
        bookingsSheet.addRow({
          id: booking.id,
          customer_id: booking.customer_id,
          service_id: booking.service_id,
          service_variant_id: booking.service_variant_id,
          customer_name:
            booking.customers?.full_name || booking.customer_name || "N/A",
          customer_email:
            booking.customers?.email || booking.customer_email || "N/A",
          customer_phone:
            booking.customers?.phone || booking.customer_phone || "N/A",
          customer_facebook_link:
            booking.customers?.facebook_link ||
            booking.customer_facebook_link ||
            "",
          service_name: booking.services?.name || "N/A",
          variant: getVariantLabel(booking.service_variants),
          booking_date: booking.booking_date || "",
          booking_time: booking.booking_time || "",
          total_price: booking.total_price || 0,
          downpayment: booking.downpayment || 0,
          notes: booking.notes || "",
          proof_payment_path: booking.proof_payment_path || "",
          status: booking.status || "",
          approved_at: booking.approved_at || "",
          cancelled_at: booking.cancelled_at || "",
          completed_at: booking.completed_at || "",
          expires_at: booking.expires_at || "",
          review_token: booking.review_token || "",
          cancel_token: booking.cancel_token || "",
          cancellation_reason: booking.cancellation_reason || "",
          created_at: booking.created_at || "",
          updated_at: booking.updated_at || "",
        });
      });

      styleHeader(bookingsSheet);
      autoFitColumns(bookingsSheet);

      /* ===============================
         CUSTOMERS
      =============================== */
      const customersSheet = workbook.addWorksheet("Customers");

      customersSheet.columns = [
        { header: "ID", key: "id" },
        { header: "Full Name", key: "full_name" },
        { header: "Email", key: "email" },
        { header: "Phone", key: "phone" },
        { header: "Facebook Link", key: "facebook_link" },
        { header: "Created At", key: "created_at" },
      ];

      (data?.customers || []).forEach((item) => {
        customersSheet.addRow({
          id: item.id,
          full_name: item.full_name || "",
          email: item.email || "",
          phone: item.phone || "",
          facebook_link: item.facebook_link || "",
          created_at: item.created_at || "",
        });
      });

      styleHeader(customersSheet);
      autoFitColumns(customersSheet);

      /* ===============================
         SERVICES
      =============================== */
      const servicesSheet = workbook.addWorksheet("Services");

      servicesSheet.columns = [
        { header: "ID", key: "id" },
        { header: "Name", key: "name" },
        { header: "Description", key: "description" },
        { header: "Duration", key: "duration" },
        { header: "Image URL", key: "image_url" },
        { header: "Is Active", key: "is_active" },
        { header: "Created At", key: "created_at" },
        { header: "Updated At", key: "updated_at" },
      ];

      (data?.services || []).forEach((item) => {
        servicesSheet.addRow({
          id: item.id,
          name: item.name || "",
          description: item.description || "",
          duration: item.duration || "",
          image_url: item.image_url || "",
          is_active: item.is_active ? "Yes" : "No",
          created_at: item.created_at || "",
          updated_at: item.updated_at || "",
        });
      });

      styleHeader(servicesSheet);
      autoFitColumns(servicesSheet);

      /* ===============================
         SERVICE CATEGORIES
      =============================== */
      const categoriesSheet = workbook.addWorksheet("Service Categories");

      categoriesSheet.columns = [
        { header: "ID", key: "id" },
        { header: "Service ID", key: "service_id" },
        { header: "Name", key: "name" },
        { header: "Is Active", key: "is_active" },
        { header: "Created At", key: "created_at" },
        { header: "Updated At", key: "updated_at" },
      ];

      (data?.serviceCategories || []).forEach((item) => {
        categoriesSheet.addRow({
          id: item.id,
          service_id: item.service_id,
          name: item.name || "",
          is_active: item.is_active ? "Yes" : "No",
          created_at: item.created_at || "",
          updated_at: item.updated_at || "",
        });
      });

      styleHeader(categoriesSheet);
      autoFitColumns(categoriesSheet);

      /* ===============================
         SERVICE VARIANTS
      =============================== */
      const variantsSheet = workbook.addWorksheet("Service Variants");

      variantsSheet.columns = [
        { header: "ID", key: "id" },
        { header: "Category ID", key: "category_id" },
        { header: "Body Part", key: "body_part" },
        { header: "Size", key: "size" },
        { header: "Price", key: "price" },
        { header: "Downpayment", key: "downpayment" },
        { header: "Is Active", key: "is_active" },
        { header: "Created At", key: "created_at" },
        { header: "Updated At", key: "updated_at" },
      ];

      (data?.serviceVariants || []).forEach((item) => {
        variantsSheet.addRow({
          id: item.id,
          category_id: item.category_id,
          body_part: item.body_part || "",
          size: item.size || "",
          price: item.price || 0,
          downpayment: item.downpayment || 0,
          is_active: item.is_active ? "Yes" : "No",
          created_at: item.created_at || "",
          updated_at: item.updated_at || "",
        });
      });

      styleHeader(variantsSheet);
      autoFitColumns(variantsSheet);

      /* ===============================
         REVIEWS
      =============================== */
      const reviewsSheet = workbook.addWorksheet("Reviews");

      reviewsSheet.columns = [
        { header: "ID", key: "id" },
        { header: "Booking ID", key: "booking_id" },
        { header: "Rating", key: "rating" },
        { header: "Comment", key: "comment" },
        { header: "Image URL", key: "image_url" },
        { header: "Is Approved", key: "is_approved" },
        { header: "Booking Date", key: "booking_date" },
        { header: "Booking Status", key: "booking_status" },
        { header: "Created At", key: "created_at" },
      ];

      (data?.reviews || []).forEach((item) => {
        reviewsSheet.addRow({
          id: item.id,
          booking_id: item.booking_id,
          rating: item.rating || "",
          comment: item.comment || "",
          image_url: item.image_url || "",
          is_approved: item.is_approved ? "Yes" : "No",
          booking_date: item.bookings?.booking_date || "",
          booking_status: item.bookings?.status || "",
          created_at: item.created_at || "",
        });
      });

      styleHeader(reviewsSheet);
      autoFitColumns(reviewsSheet);

      /* ===============================
         NOTIFICATIONS
      =============================== */
      const notificationsSheet = workbook.addWorksheet("Notifications");

      notificationsSheet.columns = [
        { header: "ID", key: "id" },
        { header: "Type", key: "type" },
        { header: "Title", key: "title" },
        { header: "Message", key: "message" },
        { header: "Link", key: "link" },
        { header: "Related Entity", key: "related_entity" },
        { header: "Related ID", key: "related_id" },
        { header: "Is Read", key: "is_read" },
        { header: "Created At", key: "created_at" },
      ];

      (data?.notifications || []).forEach((item) => {
        notificationsSheet.addRow({
          id: item.id,
          type: item.type || "",
          title: item.title || "",
          message: item.message || "",
          link: item.link || "",
          related_entity: item.related_entity || "",
          related_id: item.related_id || "",
          is_read: item.is_read ? "Yes" : "No",
          created_at: item.created_at || "",
        });
      });

      styleHeader(notificationsSheet);
      autoFitColumns(notificationsSheet);

      /* ===============================
         REVENUE LOGS
      =============================== */
      const revenueLogsSheet = workbook.addWorksheet("Revenue Logs");

      revenueLogsSheet.columns = [
        { header: "ID", key: "id" },
        { header: "Booking ID", key: "booking_id" },
        { header: "Amount", key: "amount" },
        { header: "Note", key: "note" },
        { header: "Booking Date", key: "booking_date" },
        { header: "Booking Status", key: "booking_status" },
        { header: "Created At", key: "created_at" },
      ];

      (data?.revenueLogs || []).forEach((item) => {
        revenueLogsSheet.addRow({
          id: item.id,
          booking_id: item.booking_id,
          amount: item.amount || 0,
          note: item.note || "",
          booking_date: item.bookings?.booking_date || "",
          booking_status: item.bookings?.status || "",
          created_at: item.created_at || "",
        });
      });

      styleHeader(revenueLogsSheet);
      autoFitColumns(revenueLogsSheet);

      /* ===============================
         ANNOUNCEMENTS
      =============================== */
      const announcementsSheet = workbook.addWorksheet("Announcements");

      announcementsSheet.columns = [
        { header: "ID", key: "id" },
        { header: "Title", key: "title" },
        { header: "Content", key: "content" },
        { header: "Image URL", key: "image_url" },
        { header: "Images", key: "images" },
        { header: "Start Date", key: "start_date" },
        { header: "End Date", key: "end_date" },
        { header: "Is Active", key: "is_active" },
        { header: "Created At", key: "created_at" },
        { header: "Updated At", key: "updated_at" },
      ];

      (data?.announcements || []).forEach((item) => {
        announcementsSheet.addRow({
          id: item.id,
          title: item.title || "",
          content: item.content || "",
          image_url: item.image_url || "",
          images: Array.isArray(item.images) ? item.images.join(", ") : "",
          start_date: item.start_date || "",
          end_date: item.end_date || "",
          is_active: item.is_active ? "Yes" : "No",
          created_at: item.created_at || "",
          updated_at: item.updated_at || "",
        });
      });

      styleHeader(announcementsSheet);
      autoFitColumns(announcementsSheet);

      /* ===============================
         POLICIES
      =============================== */
      const policiesSheet = workbook.addWorksheet("Policies");

      policiesSheet.columns = [
        { header: "ID", key: "id" },
        { header: "Title", key: "title" },
        { header: "Content", key: "content" },
        { header: "Is Active", key: "is_active" },
        { header: "Created At", key: "created_at" },
        { header: "Updated At", key: "updated_at" },
      ];

      (data?.policies || []).forEach((item) => {
        policiesSheet.addRow({
          id: item.id,
          title: item.title || "",
          content: item.content || "",
          is_active: item.is_active ? "Yes" : "No",
          created_at: item.created_at || "",
          updated_at: item.updated_at || "",
        });
      });

      styleHeader(policiesSheet);
      autoFitColumns(policiesSheet);

      /* ===============================
         CALENDAR SLOTS
      =============================== */
      const calendarSlotsSheet = workbook.addWorksheet("Calendar Slots");

      calendarSlotsSheet.columns = [
        { header: "ID", key: "id" },
        { header: "Service ID", key: "service_id" },
        { header: "Date", key: "date" },
        { header: "Time", key: "time" },
        { header: "Is Available", key: "is_available" },
        { header: "Created At", key: "created_at" },
        { header: "Updated At", key: "updated_at" },
      ];

      (data?.calendarSlots || []).forEach((item) => {
        calendarSlotsSheet.addRow({
          id: item.id,
          service_id: item.service_id,
          date: item.date || "",
          time: item.time || "",
          is_available: item.is_available ? "Yes" : "No",
          created_at: item.created_at || "",
          updated_at: item.updated_at || "",
        });
      });

      styleHeader(calendarSlotsSheet);
      autoFitColumns(calendarSlotsSheet);

      const buffer = await workbook.xlsx.writeBuffer();

      const file = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(
        file,
        `unailedit_system_export_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } catch (error) {
      console.error("Excel export failed:", error);
    } finally {
      setExportingExcel(false);
    }
  };

  /* ===============================
     EXPORT PDF
     - Uses getSystemExportData for accuracy
  =============================== */
  const exportPDF = async () => {
    try {
      setExportingPDF(true);

      const data = await getSystemExportData();

      const allBookings = Array.isArray(data?.bookings) ? data.bookings : [];
      const completedBookings = allBookings.filter(
        (booking) => booking?.status === "completed",
      );

      const allCustomers = Array.isArray(data?.customers) ? data.customers : [];
      const allServices = Array.isArray(data?.services) ? data.services : [];
      const allReviews = Array.isArray(data?.reviews) ? data.reviews : [];
      const allRevenueLogs = Array.isArray(data?.revenueLogs)
        ? data.revenueLogs
        : [];
      const allNotifications = Array.isArray(data?.notifications)
        ? data.notifications
        : [];
      const allAnnouncements = Array.isArray(data?.announcements)
        ? data.announcements
        : [];
      const allPolicies = Array.isArray(data?.policies) ? data.policies : [];
      const allCalendarSlots = Array.isArray(data?.calendarSlots)
        ? data.calendarSlots
        : [];

      const pdfServiceCount = {};
      allBookings.forEach((booking) => {
        const serviceName = booking?.services?.name || "Unknown";
        pdfServiceCount[serviceName] = (pdfServiceCount[serviceName] || 0) + 1;
      });

      const pdfTopServices = Object.keys(pdfServiceCount)
        .map((name) => ({
          name,
          value: pdfServiceCount[name],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      const pdfBookingsPerMonth = {};
      allBookings.forEach((booking) => {
        if (!booking?.booking_date) return;

        const rawDate = new Date(booking.booking_date);
        if (Number.isNaN(rawDate.getTime())) return;

        const monthKey = rawDate.toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        });

        pdfBookingsPerMonth[monthKey] =
          (pdfBookingsPerMonth[monthKey] || 0) + 1;
      });

      const pdfRevenuePerMonth = {};
      allRevenueLogs.forEach((log) => {
        const sourceDate = log?.created_at || log?.bookings?.booking_date;
        if (!sourceDate) return;

        const rawDate = new Date(sourceDate);
        if (Number.isNaN(rawDate.getTime())) return;

        const monthKey = rawDate.toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        });

        pdfRevenuePerMonth[monthKey] =
          (pdfRevenuePerMonth[monthKey] || 0) + Number(log?.amount || 0);
      });

      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 14;
      const generatedAt = new Date().toLocaleString();

      const addHeader = () => {
        doc.setFillColor(212, 175, 55);
        doc.rect(0, 0, pageWidth, 22, "F");

        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text("UNAILEDIT System Report", pageWidth / 2, 14, {
          align: "center",
        });

        doc.setTextColor(40, 40, 40);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Generated: ${generatedAt}`, marginX, 30);
      };

      const addFooter = () => {
        const pageCount = doc.getNumberOfPages();

        for (let i = 1; i <= pageCount; i += 1) {
          doc.setPage(i);
          doc.setDrawColor(220, 220, 220);
          doc.line(
            marginX,
            pageHeight - 12,
            pageWidth - marginX,
            pageHeight - 12,
          );

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(120, 120, 120);
          doc.text(
            `UNAILEDIT Report • Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 6,
            { align: "center" },
          );
        }
      };

      addHeader();

      /* SUMMARY */
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(33, 33, 33);
      doc.text("Executive Summary", marginX, 42);

      autoTable(doc, {
        startY: 46,
        head: [["Metric", "Value"]],
        body: [
          ["Total Bookings", safeText(allBookings.length)],
          ["Completed Bookings", safeText(completedBookings.length)],
          [
            "Completion Rate",
            `${
              allBookings.length > 0
                ? (
                    (completedBookings.length / allBookings.length) *
                    100
                  ).toFixed(1)
                : 0
            }%`,
          ],
          ["Total Revenue", formatMoneyPdf(stats.totalRevenue)],
          [
            "Pending Approval Bookings",
            safeText(stats.pendingApprovalBookings),
          ],
          [
            "Pending Reviews",
            safeText(allReviews.filter((r) => !r?.is_approved).length),
          ],
          [
            "Active Services",
            safeText(
              allServices.filter((service) => service?.is_active).length,
            ),
          ],
          ["Total Customers", safeText(allCustomers.length)],
          ["Total Notifications", safeText(allNotifications.length)],
          ["Total Announcements", safeText(allAnnouncements.length)],
          ["Total Policies", safeText(allPolicies.length)],
          ["Total Calendar Slots", safeText(allCalendarSlots.length)],
        ],
        theme: "grid",
        headStyles: {
          fillColor: [212, 175, 55],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
          lineColor: [220, 220, 220],
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 90, fontStyle: "bold" },
          1: { cellWidth: 80 },
        },
        margin: { left: marginX, right: marginX },
      });

      /* MONTHLY BOOKINGS */
      const monthlyBookingRows =
        Object.keys(pdfBookingsPerMonth).length > 0
          ? Object.entries(pdfBookingsPerMonth).map(([month, count]) => [
              month,
              safeText(count),
            ])
          : [["No data", "0"]];

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(
        "Monthly Booking Summary",
        marginX,
        doc.lastAutoTable.finalY + 12,
      );

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [["Month", "Bookings"]],
        body: monthlyBookingRows,
        theme: "striped",
        headStyles: {
          fillColor: [255, 182, 193],
          textColor: [0, 0, 0],
        },
        styles: {
          fontSize: 9.5,
          cellPadding: 2.8,
        },
        margin: { left: marginX, right: marginX },
      });

      /* MONTHLY REVENUE */
      const monthlyRevenueRows =
        Object.keys(pdfRevenuePerMonth).length > 0
          ? Object.entries(pdfRevenuePerMonth).map(([month, revenue]) => [
              month,
              formatMoneyPdf(revenue),
            ])
          : [["No data", "PHP 0"]];

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(
        "Monthly Revenue Summary",
        marginX,
        doc.lastAutoTable.finalY + 12,
      );

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [["Month", "Revenue"]],
        body: monthlyRevenueRows,
        theme: "striped",
        headStyles: {
          fillColor: [212, 175, 55],
          textColor: [0, 0, 0],
        },
        styles: {
          fontSize: 9.5,
          cellPadding: 2.8,
        },
        margin: { left: marginX, right: marginX },
      });

      /* TOP SERVICES */
      const topServiceRows =
        pdfTopServices.length > 0
          ? pdfTopServices.map((item, index) => [
              safeText(index + 1),
              safeText(item.name),
              safeText(item.value),
            ])
          : [["-", "No data", "0"]];

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Top Services", marginX, doc.lastAutoTable.finalY + 12);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [["Rank", "Service", "Bookings"]],
        body: topServiceRows,
        theme: "grid",
        headStyles: {
          fillColor: [255, 105, 180],
        },
        styles: {
          fontSize: 9.5,
          cellPadding: 2.8,
        },
        margin: { left: marginX, right: marginX },
      });

      /* BOOKINGS TABLE */
      const bookingRows =
        allBookings.length > 0
          ? allBookings
              .slice(0, 20)
              .map((booking) => [
                safeText(booking.id),
                safeText(
                  booking.customers?.full_name ||
                    booking.customer_name ||
                    "N/A",
                ),
                safeText(booking.services?.name || "N/A"),
                safeText(getVariantLabel(booking.service_variants)),
                safeText(booking.status),
                safeText(booking.booking_date),
                formatMoneyPdf(booking.total_price),
              ])
          : [["-", "No bookings", "-", "-", "-", "-", "PHP 0"]];

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Bookings Snapshot", marginX, doc.lastAutoTable.finalY + 12);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [
          ["ID", "Customer", "Service", "Variant", "Status", "Date", "Amount"],
        ],
        body: bookingRows,
        theme: "striped",
        headStyles: {
          fillColor: [212, 175, 55],
          textColor: [0, 0, 0],
        },
        styles: {
          fontSize: 8.5,
          cellPadding: 2.2,
          overflow: "linebreak",
        },
        columnStyles: {
          0: { cellWidth: 14 },
          1: { cellWidth: 34 },
          2: { cellWidth: 28 },
          3: { cellWidth: 28 },
          4: { cellWidth: 22 },
          5: { cellWidth: 24 },
          6: { cellWidth: 26, halign: "right" },
        },
        margin: { left: marginX, right: marginX },
      });

      /* REVIEWS */
      const reviewRows =
        allReviews.length > 0
          ? allReviews
              .slice(0, 15)
              .map((review) => [
                safeText(review.id),
                safeText(review.booking_id),
                safeText(review.rating),
                safeText(review.comment),
                review.is_approved ? "Yes" : "No",
                safeText(review.bookings?.booking_date),
              ])
          : [["-", "-", "-", "No reviews", "-", "-"]];

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Reviews Snapshot", marginX, doc.lastAutoTable.finalY + 12);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [
          ["ID", "Booking ID", "Rating", "Comment", "Approved", "Booking Date"],
        ],
        body: reviewRows,
        theme: "striped",
        headStyles: {
          fillColor: [255, 182, 193],
          textColor: [0, 0, 0],
        },
        styles: {
          fontSize: 8.5,
          cellPadding: 2.2,
          overflow: "linebreak",
        },
        margin: { left: marginX, right: marginX },
      });

      /* AUDIT LOGS */
      const auditRows =
        activities.length > 0
          ? activities
              .slice(0, 15)
              .map((log) => [
                safeText(log.action?.replaceAll("_", " ")),
                safeText(log.description),
                formatDateTime(log.created_at),
              ])
          : [["No logs", "No audit logs found.", "N/A"]];

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Recent Audit Logs", marginX, doc.lastAutoTable.finalY + 12);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [["Action", "Description", "Date / Time"]],
        body: auditRows,
        theme: "striped",
        headStyles: {
          fillColor: [212, 175, 55],
          textColor: [0, 0, 0],
        },
        styles: {
          fontSize: 8.8,
          cellPadding: 2.5,
          overflow: "linebreak",
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 95 },
          2: { cellWidth: 40 },
        },
        margin: { left: marginX, right: marginX },
      });

      addFooter();

      doc.save(
        `unailedit_system_report_${new Date().toISOString().slice(0, 10)}.pdf`,
      );
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <AdminLayout>
      <div className="dashboard-container">
        <h1 className="dashboard-title">Dashboard Overview</h1>

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
                    <Cell
                      key={entry.name || index}
                      fill={COLORS[index % COLORS.length]}
                    />
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
                      {safeText(log.action).replaceAll("_", " ")}
                    </div>

                    <div className="activity-desc">
                      {safeText(log.description)}
                    </div>

                    <div className="activity-time">
                      {formatDateTime(log.created_at)}
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
          <button
            onClick={exportExcel}
            className="admin-btn"
            disabled={exportingExcel}
          >
            {exportingExcel ? "Exporting Excel..." : "Export Excel"}
          </button>

          <button
            onClick={exportPDF}
            className="admin-btn"
            disabled={exportingPDF}
          >
            {exportingPDF ? "Exporting PDF..." : "Export PDF Report"}
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
