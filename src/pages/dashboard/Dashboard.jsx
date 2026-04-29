import { useQuery, useQueryClient } from "@tanstack/react-query";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import supabase from "../../../config/supabaseClient.js";
import AdminLayout from "../../components/layout/adminLayout";
import { getAuditLogs } from "../../services/BACKEND/adminAudtiApi";
import {
  blockCustomer,
  getBookingSnapshot,
  getDashboardData,
  getSystemExportData,
  unblockCustomer,
} from "../../services/BACKEND/adminDashboardApi";
import "../../styles/dashboard.css";

const ITEMS_PER_PAGE = 5;
const MOST_CANCELLED_PER_PAGE = 5;
const DASHBOARD_QUERY_KEY = ["admin-dashboard"];
const REALTIME_DEBOUNCE_MS = 500;

const fetchDashboardData = async () => {
  const [dashboardData, logs, exportData] = await Promise.all([
    getDashboardData(),
    getAuditLogs(),
    getSystemExportData(),
  ]);

  return {
    stats: {
      totalBookings: dashboardData?.stats?.totalBookings || 0,
      totalRevenue: dashboardData?.stats?.totalRevenue || 0,
      pendingReviews: dashboardData?.stats?.pendingReviews || 0,
      activeServices: dashboardData?.stats?.activeServices || 0,
      pendingApprovalBookings:
        dashboardData?.stats?.pendingApprovalBookings || 0,
    },
    analytics: {
      bookingsPerMonth: dashboardData?.analytics?.bookingsPerMonth || {},
      revenuePerMonth: dashboardData?.analytics?.revenuePerMonth || {},
    },
    recentBookings: Array.isArray(dashboardData?.recentBookings)
      ? dashboardData.recentBookings
      : [],
    activities: Array.isArray(logs) ? logs : [],
    exportData: exportData || {},
  };
};

const formatSnapshotDate = (dateStr) => {
  if (!dateStr) return dateStr;
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const Dashboard = () => {
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [cancelledPage, setCancelledPage] = useState(1);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [actionLoadingEmail, setActionLoadingEmail] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [unblockModalOpen, setUnblockModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [blockReason, setBlockReason] = useState("Too many cancellations");

  const debounceTimeoutRef = useRef(null);
  const isInvalidatingRef = useRef(false);
  const realtimeChannelRef = useRef(null);

  const {
    data: dashboardData,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const {
    data: snapshotRaw,
    isLoading: snapshotLoading,
    error: snapshotError,
  } = useQuery({
    queryKey: ["booking-snapshot"],
    queryFn: getBookingSnapshot,
    staleTime: 1000 * 60 * 2,
  });

  // 👉 DITO MO ILAGAY
  console.log("📦 snapshotRaw:", snapshotRaw);

  const stats = useMemo(
    () => ({
      totalBookings: dashboardData?.stats?.totalBookings || 0,
      totalRevenue: dashboardData?.stats?.totalRevenue || 0,
      pendingReviews: dashboardData?.stats?.pendingReviews || 0,
      activeServices: dashboardData?.stats?.activeServices || 0,
      pendingApprovalBookings:
        dashboardData?.stats?.pendingApprovalBookings || 0,
    }),
    [dashboardData?.stats],
  );

  const analytics = useMemo(
    () => ({
      bookingsPerMonth: dashboardData?.analytics?.bookingsPerMonth || {},
      revenuePerMonth: dashboardData?.analytics?.revenuePerMonth || {},
    }),
    [dashboardData?.analytics],
  );

  const bookings = useMemo(
    () => dashboardData?.recentBookings || [],
    [dashboardData?.recentBookings],
  );

  const activities = useMemo(
    () => dashboardData?.activities || [],
    [dashboardData?.activities],
  );

  const exportData = useMemo(
    () => dashboardData?.exportData || {},
    [dashboardData?.exportData],
  );

  const customers = useMemo(
    () => (Array.isArray(exportData?.customers) ? exportData.customers : []),
    [exportData?.customers],
  );

  const allBookings = useMemo(
    () => (Array.isArray(exportData?.bookings) ? exportData.bookings : []),
    [exportData?.bookings],
  );

  const allNotifications = useMemo(
    () =>
      Array.isArray(exportData?.notifications) ? exportData.notifications : [],
    [exportData?.notifications],
  );
  const snapshotGroups = useMemo(() => {
    const data = snapshotRaw?.data?.data ?? snapshotRaw?.data ?? [];

    if (!Array.isArray(data)) return [];

    return [...data].sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [snapshotRaw]);

  const customerMap = useMemo(() => {
    const map = new Map();
    customers.forEach((customer) => {
      const email = String(customer?.email || "")
        .trim()
        .toLowerCase();
      if (!email) return;
      map.set(email, customer);
    });
    return map;
  }, [customers]);

  const mostCancelledCustomers = useMemo(() => {
    const grouped = {};

    allBookings.forEach((booking) => {
      if (booking?.status !== "cancelled") return;

      const rawEmail =
        booking?.customer_email || booking?.customers?.email || "";
      const email = String(rawEmail).trim().toLowerCase();
      if (!email) return;

      const linkedCustomer = customerMap.get(email);

      if (!grouped[email]) {
        grouped[email] = {
          id: linkedCustomer?.id || null,
          email,
          full_name:
            booking?.customer_name ||
            booking?.customers?.full_name ||
            linkedCustomer?.full_name ||
            "Unknown Customer",
          phone:
            booking?.customer_phone ||
            booking?.customers?.phone ||
            linkedCustomer?.phone ||
            "N/A",
          facebook_link:
            booking?.customer_facebook_link ||
            booking?.customers?.facebook_link ||
            linkedCustomer?.facebook_link ||
            "",
          cancel_count: 0,
          latest_cancelled_at:
            booking?.cancelled_at ||
            booking?.updated_at ||
            booking?.created_at ||
            "",
          latest_reason: booking?.cancellation_reason || "No reason provided",
          is_blocked: Boolean(linkedCustomer?.is_blocked),
          blocked_reason: linkedCustomer?.blocked_reason || "",
        };
      }

      grouped[email].cancel_count += 1;

      const bookingCancelledAt =
        booking?.cancelled_at ||
        booking?.updated_at ||
        booking?.created_at ||
        "";

      if (
        bookingCancelledAt &&
        (!grouped[email].latest_cancelled_at ||
          new Date(bookingCancelledAt) >
            new Date(grouped[email].latest_cancelled_at))
      ) {
        grouped[email].latest_cancelled_at = bookingCancelledAt;
      }

      if (booking?.cancellation_reason) {
        grouped[email].latest_reason = booking.cancellation_reason;
      }

      if (linkedCustomer) {
        grouped[email].id = linkedCustomer?.id || null;
        grouped[email].is_blocked = Boolean(linkedCustomer?.is_blocked);
        grouped[email].blocked_reason = linkedCustomer?.blocked_reason || "";
        grouped[email].full_name =
          linkedCustomer?.full_name || grouped[email].full_name;
        grouped[email].phone = linkedCustomer?.phone || grouped[email].phone;
        grouped[email].facebook_link =
          linkedCustomer?.facebook_link || grouped[email].facebook_link;
      }
    });

    return Object.values(grouped)
      .sort((a, b) => {
        if (b.cancel_count !== a.cancel_count) {
          return b.cancel_count - a.cancel_count;
        }
        return (
          new Date(b.latest_cancelled_at || 0).getTime() -
          new Date(a.latest_cancelled_at || 0).getTime()
        );
      })
      .slice(0, 20);
  }, [allBookings, customerMap]);

  const invalidateDashboard = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(async () => {
      if (isInvalidatingRef.current) return;
      try {
        isInvalidatingRef.current = true;
        await queryClient.invalidateQueries({
          queryKey: DASHBOARD_QUERY_KEY,
        });
        await queryClient.invalidateQueries({
          queryKey: ["booking-snapshot"],
        });
      } catch (error) {
        console.error("Dashboard invalidate error:", error);
      } finally {
        isInvalidatingRef.current = false;
      }
    }, REALTIME_DEBOUNCE_MS);
  };

  useEffect(() => {
    const channel = supabase
      .channel("admin-dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => invalidateDashboard(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "revenue_logs" },
        () => invalidateDashboard(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reviews" },
        () => invalidateDashboard(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "services" },
        () => invalidateDashboard(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "audit_logs" },
        () => invalidateDashboard(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customers" },
        () => invalidateDashboard(),
      )
      .subscribe((status) => {
        console.log("Dashboard realtime status:", status);
      });

    realtimeChannelRef.current = channel;

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, [queryClient]);

  useEffect(() => {
    const computedTotalPages = Math.max(
      1,
      Math.ceil(bookings.length / ITEMS_PER_PAGE),
    );
    if (currentPage > computedTotalPages) {
      setCurrentPage(computedTotalPages);
    }
  }, [bookings.length, currentPage]);

  useEffect(() => {
    const computedCancelledPages = Math.max(
      1,
      Math.ceil(mostCancelledCustomers.length / MOST_CANCELLED_PER_PAGE),
    );
    if (cancelledPage > computedCancelledPages) {
      setCancelledPage(computedCancelledPages);
    }
  }, [mostCancelledCustomers.length, cancelledPage]);

  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => {
      setActionMessage("");
    }, 2800);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(bookings.length / ITEMS_PER_PAGE)),
    [bookings.length],
  );

  const cancelledTotalPages = useMemo(
    () =>
      Math.max(
        1,
        Math.ceil(mostCancelledCustomers.length / MOST_CANCELLED_PER_PAGE),
      ),
    [mostCancelledCustomers.length],
  );

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return bookings.slice(start, end);
  }, [bookings, currentPage]);

  const paginatedCancelledCustomers = useMemo(() => {
    const start = (cancelledPage - 1) * MOST_CANCELLED_PER_PAGE;
    const end = start + MOST_CANCELLED_PER_PAGE;
    return mostCancelledCustomers.slice(start, end);
  }, [mostCancelledCustomers, cancelledPage]);

  const comboChartData = useMemo(() => {
    const monthMap = new Map();
    Object.entries(analytics.bookingsPerMonth || {}).forEach(
      ([month, value]) => {
        monthMap.set(month, {
          month,
          bookings: Number(value || 0),
          revenue: 0,
        });
      },
    );
    Object.entries(analytics.revenuePerMonth || {}).forEach(
      ([month, value]) => {
        if (monthMap.has(month)) {
          monthMap.set(month, {
            ...monthMap.get(month),
            revenue: Number(value || 0),
          });
        } else {
          monthMap.set(month, {
            month,
            bookings: 0,
            revenue: Number(value || 0),
          });
        }
      },
    );
    return Array.from(monthMap.values());
  }, [analytics.bookingsPerMonth, analytics.revenuePerMonth]);

  const topServices = useMemo(() => {
    const serviceCount = {};
    allBookings.forEach((booking) => {
      const name = booking?.services?.name || "Unknown";
      serviceCount[name] = (serviceCount[name] || 0) + 1;
    });
    return Object.keys(serviceCount)
      .map((service) => ({
        name: service,
        value: serviceCount[service],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [allBookings]);

  const bookingStatusData = useMemo(() => {
    const counts = {
      pending_approval: 0,
      approved: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0,
    };
    allBookings.forEach((booking) => {
      const status = booking?.status;
      if (counts[status] !== undefined) {
        counts[status] += 1;
      }
    });
    return [
      { name: "Pending", value: counts.pending_approval, color: "#f59e0b" },
      { name: "Approved", value: counts.approved, color: "#22c55e" },
      { name: "Completed", value: counts.completed, color: "#3b82f6" },
      { name: "Cancelled", value: counts.cancelled, color: "#ef4444" },
      { name: "Rejected", value: counts.rejected, color: "#8b5cf6" },
    ].filter((item) => item.value > 0);
  }, [allBookings]);

  const bookingStatusTotal = useMemo(() => {
    return bookingStatusData.reduce((sum, item) => sum + item.value, 0);
  }, [bookingStatusData]);

  const latestMonthlyReport = useMemo(() => {
    return [...allNotifications]
      .filter((item) => item?.type === "monthly_report")
      .sort(
        (a, b) =>
          new Date(b?.created_at || 0).getTime() -
          new Date(a?.created_at || 0).getTime(),
      )[0];
  }, [allNotifications]);

  const completionRate = useMemo(() => {
    if (allBookings.length === 0) return 0;
    const completedCount = allBookings.filter(
      (booking) => booking?.status === "completed",
    ).length;
    return ((completedCount / allBookings.length) * 100).toFixed(1);
  }, [allBookings]);

  const totalCancelledBookings = useMemo(() => {
    return allBookings.filter((booking) => booking?.status === "cancelled")
      .length;
  }, [allBookings]);

  const watchlistCustomersCount = useMemo(() => {
    return mostCancelledCustomers.filter(
      (customer) => !customer.is_blocked && customer.cancel_count >= 3,
    ).length;
  }, [mostCancelledCustomers]);

  const blockedCustomersCount = useMemo(() => {
    return mostCancelledCustomers.filter((customer) => customer.is_blocked)
      .length;
  }, [mostCancelledCustomers]);

  const topBookedServiceName = useMemo(() => {
    return topServices[0]?.name || "No data yet";
  }, [topServices]);

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

  const getRiskBadgeClass = (count, isBlocked) => {
    if (isBlocked) return "risk-badge blocked";
    if (count >= 5) return "risk-badge danger";
    if (count >= 3) return "risk-badge warning";
    return "risk-badge normal";
  };

  const getRiskLabel = (count, isBlocked) => {
    if (isBlocked) return "Blocked";
    if (count >= 5) return "High Risk";
    if (count >= 3) return "Watchlist";
    return "Monitored";
  };

  const openBlockModal = (customer) => {
    setSelectedCustomer(customer);
    setBlockReason(customer?.blocked_reason || "Too many cancellations");
    setBlockModalOpen(true);
  };

  const closeBlockModal = () => {
    if (actionLoadingEmail) return;
    setBlockModalOpen(false);
    setSelectedCustomer(null);
    setBlockReason("Too many cancellations");
  };

  const openUnblockModal = (customer) => {
    setSelectedCustomer(customer);
    setUnblockModalOpen(true);
  };

  const closeUnblockModal = () => {
    if (actionLoadingEmail) return;
    setUnblockModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleBlockCustomer = async () => {
    const email = selectedCustomer?.email;
    if (!email) return;
    setActionLoadingEmail(email);
    try {
      await blockCustomer({
        email,
        name: selectedCustomer?.full_name,
        reason: blockReason?.trim() || "Too many cancellations",
        cancelCount: selectedCustomer?.cancel_count || 0,
      });
      setActionMessage(`Blocked ${email} successfully.`);
      closeBlockModal();
      await queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["booking-snapshot"] });
    } catch (error) {
      console.error("Block customer failed:", error);
      setActionMessage(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to block customer.",
      );
    } finally {
      setActionLoadingEmail("");
    }
  };

  const handleUnblockCustomer = async () => {
    const customerId = selectedCustomer?.id;
    const email = selectedCustomer?.email;
    if (!customerId) {
      setActionMessage("Missing customer ID. Please refresh and try again.");
      return;
    }
    setActionLoadingEmail(email);
    try {
      await unblockCustomer({ customer_id: customerId });
      setActionMessage(`Unblocked ${email} successfully.`);
      closeUnblockModal();
      await queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["booking-snapshot"] });
    } catch (error) {
      console.error("Unblock customer failed:", error);
      setActionMessage(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to unblock customer.",
      );
    } finally {
      setActionLoadingEmail("");
    }
  };

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

      const customersSheet = workbook.addWorksheet("Customers");
      customersSheet.columns = [
        { header: "ID", key: "id" },
        { header: "Full Name", key: "full_name" },
        { header: "Email", key: "email" },
        { header: "Phone", key: "phone" },
        { header: "Facebook Link", key: "facebook_link" },
        { header: "Is Blocked", key: "is_blocked" },
        { header: "Blocked Reason", key: "blocked_reason" },
        { header: "Blocked At", key: "blocked_at" },
        { header: "Created At", key: "created_at" },
      ];
      (data?.customers || []).forEach((item) => {
        customersSheet.addRow({
          id: item.id,
          full_name: item.full_name || "",
          email: item.email || "",
          phone: item.phone || "",
          facebook_link: item.facebook_link || "",
          is_blocked: item.is_blocked ? "Yes" : "No",
          blocked_reason: item.blocked_reason || "",
          blocked_at: item.blocked_at || "",
          created_at: item.created_at || "",
        });
      });
      styleHeader(customersSheet);
      autoFitColumns(customersSheet);

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
        .map((name) => ({ name, value: pdfServiceCount[name] }))
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
        headStyles: { fillColor: [255, 182, 193], textColor: [0, 0, 0] },
        styles: { fontSize: 9.5, cellPadding: 2.8 },
        margin: { left: marginX, right: marginX },
      });

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
        headStyles: { fillColor: [212, 175, 55], textColor: [0, 0, 0] },
        styles: { fontSize: 9.5, cellPadding: 2.8 },
        margin: { left: marginX, right: marginX },
      });

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
        headStyles: { fillColor: [255, 105, 180] },
        styles: { fontSize: 9.5, cellPadding: 2.8 },
        margin: { left: marginX, right: marginX },
      });

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
        headStyles: { fillColor: [212, 175, 55], textColor: [0, 0, 0] },
        styles: { fontSize: 8.5, cellPadding: 2.2, overflow: "linebreak" },
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
        headStyles: { fillColor: [255, 182, 193], textColor: [0, 0, 0] },
        styles: { fontSize: 8.5, cellPadding: 2.2, overflow: "linebreak" },
        margin: { left: marginX, right: marginX },
      });

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
        headStyles: { fillColor: [212, 175, 55], textColor: [0, 0, 0] },
        styles: { fontSize: 8.8, cellPadding: 2.5, overflow: "linebreak" },
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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="dashboard-shell">
          <div className="dashboard-container">
            <div className="dashboard-page-header">
              <div>
                <h1 className="dashboard-title">Dashboard Overview</h1>
                <p className="dashboard-subtitle">
                  View your system performance, activity, and booking summary.
                </p>
              </div>
            </div>
            <div className="empty-panel">Loading dashboard...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="dashboard-shell">
          <div className="dashboard-container">
            <div className="dashboard-page-header">
              <div>
                <h1 className="dashboard-title">Dashboard Overview</h1>
                <p className="dashboard-subtitle">
                  View your system performance, activity, and booking summary.
                </p>
              </div>
            </div>
            <div className="empty-panel">Failed to load dashboard.</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="dashboard-shell">
        <div className="dashboard-container">
          <div className="dashboard-page-header">
            <div>
              <h1 className="dashboard-title">Dashboard Overview</h1>
              <p className="dashboard-subtitle">
                View your system performance, activity, and booking summary.
              </p>
            </div>
            <div className="dashboard-actions dashboard-actions-top">
              <button
                onClick={exportExcel}
                className="admin-btn admin-btn-secondary"
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
          </div>

          {isFetching && (
            <div className="dashboard-refresh-banner">
              Refreshing dashboard...
            </div>
          )}
          {actionMessage && (
            <div className="dashboard-action-banner">{actionMessage}</div>
          )}

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Bookings</span>
              <p>{stats.totalBookings}</p>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Revenue</span>
              <p>{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="stat-card stat-card-pending">
              <span className="stat-label">Pending Approval</span>
              <p>{stats.pendingApprovalBookings}</p>
            </div>
            <div className="stat-card">
              <span className="stat-label">Pending Reviews</span>
              <p>{stats.pendingReviews}</p>
            </div>
            <div className="stat-card">
              <span className="stat-label">Active Services</span>
              <p>{stats.activeServices}</p>
            </div>
          </div>

          <div className="charts-grid charts-grid-enhanced">
            <div className="chart-card chart-card-wide">
              <div className="card-heading">
                <div>
                  <h3>Bookings & Revenue Trend</h3>
                  <span>Monthly bookings and revenue in one view</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={comboChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={comboChartData.length > 6 ? -18 : 0}
                    textAnchor={comboChartData.length > 6 ? "end" : "middle"}
                    height={comboChartData.length > 6 ? 56 : 34}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      `₱${Number(value).toLocaleString()}`
                    }
                  />
                  <Tooltip
                    formatter={(value, name) =>
                      name === "Revenue" ? formatCurrency(value) : value
                    }
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="bookings"
                    name="Bookings"
                    fill="#d4af37"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={42}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#ff69b4"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="card-heading">
                <div>
                  <h3>Booking Status</h3>
                  <span>Distribution of current booking outcomes</span>
                </div>
              </div>
              <div className="status-chart-wrap">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={bookingStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {bookingStatusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center-label">
                  <strong>{bookingStatusTotal}</strong>
                  <span>Total</span>
                </div>
              </div>
              <div className="chart-legend-list">
                {bookingStatusData.length > 0 ? (
                  bookingStatusData.map((item) => (
                    <div className="chart-legend-item" key={item.name}>
                      <span
                        className="chart-legend-dot"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="chart-legend-name">{item.name}</span>
                      <strong className="chart-legend-value">
                        {item.value}
                      </strong>
                    </div>
                  ))
                ) : (
                  <div className="chart-empty-note">
                    No booking status data yet.
                  </div>
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="card-heading">
                <div>
                  <h3>Top Services</h3>
                  <span>Most booked services overall</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={[...topServices].reverse()}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card chart-card-wide insights-card">
              <div className="card-heading">
                <div>
                  <h3>Monthly Report & Insights</h3>
                  <span>Quick business summary and report delivery status</span>
                </div>
              </div>
              <div className="insights-card-grid">
                <div className="report-status-panel">
                  <div className="report-status-top">
                    <div className="report-status-icon">📩</div>
                    <div>
                      <h4 className="report-status-title">
                        {latestMonthlyReport?.title || "No monthly report yet"}
                      </h4>
                      <p className="report-status-text">
                        {latestMonthlyReport
                          ? "The latest monthly report has been generated and sent to your configured admin email."
                          : "No generated monthly report has been recorded yet."}
                      </p>
                    </div>
                  </div>
                  <div className="report-status-meta">
                    <div className="report-status-meta-item">
                      <span className="report-meta-label">Status</span>
                      <strong className="report-meta-value success">
                        {latestMonthlyReport ? "Sent to email" : "Waiting"}
                      </strong>
                    </div>
                    <div className="report-status-meta-item">
                      <span className="report-meta-label">Generated</span>
                      <strong className="report-meta-value">
                        {latestMonthlyReport
                          ? formatDateTime(latestMonthlyReport.created_at)
                          : "N/A"}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="insights-list">
                  <div className="insight-item">
                    <span className="insight-label">Most booked service</span>
                    <strong className="insight-value">
                      {topBookedServiceName}
                    </strong>
                  </div>
                  <div className="insight-item">
                    <span className="insight-label">Completion rate</span>
                    <strong className="insight-value">{completionRate}%</strong>
                  </div>
                  <div className="insight-item">
                    <span className="insight-label">Cancelled bookings</span>
                    <strong className="insight-value danger">
                      {totalCancelledBookings}
                    </strong>
                  </div>
                  <div className="insight-item">
                    <span className="insight-label">Watchlist customers</span>
                    <strong className="insight-value warning">
                      {watchlistCustomersCount}
                    </strong>
                  </div>
                  <div className="insight-item">
                    <span className="insight-label">Blocked customers</span>
                    <strong className="insight-value danger">
                      {blockedCustomersCount}
                    </strong>
                  </div>
                  <div className="insight-item">
                    <span className="insight-label">Pending approvals</span>
                    <strong className="insight-value">
                      {stats.pendingApprovalBookings}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NEW: Upcoming Bookings Snapshot Section */}
          <div className="snapshot-section card-surface">
            <div className="section-header">
              <div>
                <h2>📅 Upcoming Bookings Snapshot</h2>
                <p className="section-subtext">
                  Today and future bookings grouped by date
                </p>
              </div>
              {snapshotGroups.length > 0 && (
                <span>
                  {snapshotGroups.reduce((acc, g) => acc + g.totalBookings, 0)}{" "}
                  total
                </span>
              )}
            </div>

            {snapshotLoading ? (
              <div className="empty-panel">Loading snapshot...</div>
            ) : snapshotError ? (
              <div className="empty-panel">Could not load snapshot data.</div>
            ) : snapshotGroups.length === 0 ? (
              <div className="empty-panel">No upcoming bookings found.</div>
            ) : (
              <div className="snapshot-days-wrapper">
                {snapshotGroups.map((dayGroup) => (
                  <div key={dayGroup.date} className="snapshot-day-card">
                    <div className="snapshot-day-header">
                      <div>
                        <h4 className="snapshot-day-title">
                          {formatSnapshotDate(dayGroup.date)}
                        </h4>
                        <p className="snapshot-day-sub">{dayGroup.date}</p>
                      </div>
                      <div className="snapshot-stats-badges">
                        <span className="snapshot-badge total">
                          {dayGroup.totalBookings} booking
                          {dayGroup.totalBookings !== 1 && "s"}
                        </span>
                        {dayGroup.pending > 0 && (
                          <span className="snapshot-badge pending">
                            Pending: {dayGroup.pending}
                          </span>
                        )}
                        {dayGroup.approved > 0 && (
                          <span className="snapshot-badge approved">
                            Approved: {dayGroup.approved}
                          </span>
                        )}
                        {dayGroup.completed > 0 && (
                          <span className="snapshot-badge completed">
                            Completed: {dayGroup.completed}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Desktop table */}
                    <div className="snapshot-table-wrapper">
                      <table className="admin-table snapshot-table">
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>Customer</th>
                            <th>Service / Variant</th>
                            <th>Status</th>
                            <th>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dayGroup.bookings.map((b) => (
                            <tr key={b.id}>
                              <td>{b.formatted_time }</td>
                              <td>
                                {b.customer?.full_name || "—"}
                                <br />
                                <span className="snapshot-customer-contact">
                                  {b.customer?.email || b.customer?.phone || ""}
                                </span>
                              </td>
                              <td>
                                {b.service || "—"}
                                {b.variant && (
                                  <div className="snapshot-variant">
                                    {[b.variant.body_part, b.variant.size]
                                      .filter(Boolean)
                                      .join(" · ")}
                                  </div>
                                )}
                              </td>
                              <td>
                                <span className={`status ${b.status}`}>
                                  {b.status === "pending_approval"
                                    ? "Pending"
                                    : b.status}
                                </span>
                              </td>
                              <td>
                                {b.estimated_price ? (
                                  <>
                                    ₱
                                    {Number(
                                      b.estimated_price.min,
                                    ).toLocaleString()}{" "}
                                    - ₱
                                    {Number(
                                      b.estimated_price.max,
                                    ).toLocaleString()}
                                    <br />
                                    <small style={{ color: "#888" }}>
                                      Estimated Range
                                    </small>
                                  </>
                                ) : (
                                  "—"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="snapshot-mobile-list">
                      {dayGroup.bookings.map((b) => (
                        <div key={b.id} className="snapshot-mobile-card">
                          <div className="snapshot-mobile-row">
                            <span className="snapshot-mobile-label">Time</span>
                            <strong>{b.time}</strong>
                          </div>
                          <div className="snapshot-mobile-row">
                            <span className="snapshot-mobile-label">
                              Customer
                            </span>
                            <div>
                              {b.customer?.full_name || "—"}
                              <br />
                              <small>
                                {b.customer?.email || b.customer?.phone || ""}
                              </small>
                            </div>
                          </div>
                          <div className="snapshot-mobile-row">
                            <span className="snapshot-mobile-label">
                              Service
                            </span>
                            <div>
                              {b.service || "—"}
                              {b.variant && (
                                <div className="snapshot-variant-mobile">
                                  {[b.variant.body_part, b.variant.size]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="snapshot-mobile-row">
                            <span className="snapshot-mobile-label">
                              Status
                            </span>
                            <span className={`status ${b.status}`}>
                              {b.status === "pending_approval"
                                ? "Pending"
                                : b.status}
                            </span>
                          </div>
                          <div className="snapshot-mobile-row">
                            <span className="snapshot-mobile-label">Price</span>
                            {b.estimated_price ? (
                              <>
                                <strong>
                                  ₱
                                  {Number(
                                    b.estimated_price.min,
                                  ).toLocaleString()}{" "}
                                  - ₱
                                  {Number(
                                    b.estimated_price.max,
                                  ).toLocaleString()}
                                </strong>
                                <br />
                                <small style={{ color: "#888" }}>
                                  Estimated Range
                                </small>
                              </>
                            ) : (
                              <strong>—</strong>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-main-grid">
            <div className="activity-card">
              <div className="section-header">
                <div>
                  <h3>Audit Logs</h3>
                  <p className="section-subtext">Latest admin activities</p>
                </div>
                <span>{activities.length} activities</span>
              </div>
              <div className="activity-feed">
                {activities.length > 0 ? (
                  activities.slice(0, 5).map((log) => (
                    <div className="activity-item" key={log.id}>
                      <div className={`activity-icon ${log.action}`} />
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

            <div className="recent-bookings card-surface">
              <div className="section-header">
                <div>
                  <h2>Recent Bookings</h2>
                  <p className="section-subtext">Latest booking records</p>
                </div>
                <span>{bookings.length} bookings</span>
              </div>
              <div className="table-card table-card-elevated recent-bookings-desktop">
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
                            <td>{booking.customer_name|| "N/A"}</td>
                            <td>{booking.services?.name || "N/A"}</td>
                            <td>
                              <span className={getStatusClass(booking.status)}>
                                {booking.status}
                              </span>
                            </td>
                            <td>{booking.booking_date || "N/A"}</td>
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
              <div className="recent-bookings-mobile">
                {paginatedBookings.length > 0 ? (
                  paginatedBookings.map((booking) => (
                    <div className="booking-mobile-card" key={booking.id}>
                      <div className="booking-mobile-top">
                        <div>
                          <p className="booking-mobile-label">Booking ID</p>
                          <h4 className="booking-mobile-id">{booking.id}</h4>
                        </div>
                        <span className={getStatusClass(booking.status)}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="booking-mobile-grid">
                        <div className="booking-mobile-field">
                          <span className="booking-mobile-label">Name</span>
                          <p>{booking.customers?.full_name || "N/A"}</p>
                        </div>
                        <div className="booking-mobile-field">
                          <span className="booking-mobile-label">Service</span>
                          <p>{booking.services?.name || "N/A"}</p>
                        </div>
                        <div className="booking-mobile-field booking-mobile-field-full">
                          <span className="booking-mobile-label">Date</span>
                          <p>{booking.booking_date || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-panel">No recent bookings found.</div>
                )}
              </div>
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Prev
                </button>
                <span className="pagination-indicator">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="most-cancelled card-surface">
            <div className="section-header">
              <div>
                <h2>Most Cancelled Customers</h2>
                <p className="section-subtext">
                  Customers with the highest number of cancelled bookings.
                </p>
              </div>
              <span>{mostCancelledCustomers.length} customers</span>
            </div>
            <div className="table-card table-card-elevated most-cancelled-desktop">
              <div className="table-wrapper most-cancelled-scroll">
                <table className="admin-table admin-table-most-cancelled">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Cancelled</th>
                      <th>Last Cancelled</th>
                      <th>Status</th>
                      <th>Reason</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCancelledCustomers.length > 0 ? (
                      paginatedCancelledCustomers.map((customer) => {
                        const isBusy = actionLoadingEmail === customer.email;
                        const hasLinkedCustomerId = Boolean(customer?.id);
                        return (
                          <tr key={customer.email}>
                            <td>{customer.full_name || "N/A"}</td>
                            <td>{customer.email || "N/A"}</td>
                            <td>{customer.phone || "N/A"}</td>
                            <td>
                              <span className="cancel-count-badge">
                                {customer.cancel_count}
                              </span>
                            </td>
                            <td>
                              {formatDateTime(customer.latest_cancelled_at)}
                            </td>
                            <td>
                              <span
                                className={getRiskBadgeClass(
                                  customer.cancel_count,
                                  customer.is_blocked,
                                )}
                              >
                                {getRiskLabel(
                                  customer.cancel_count,
                                  customer.is_blocked,
                                )}
                              </span>
                            </td>
                            <td className="reason-cell">
                              {customer.is_blocked
                                ? customer.blocked_reason || "Blocked by admin"
                                : customer.latest_reason ||
                                  "No reason provided"}
                            </td>
                            <td>
                              {customer.is_blocked ? (
                                <button
                                  className="admin-btn admin-btn-secondary admin-btn-inline"
                                  onClick={() => openUnblockModal(customer)}
                                  disabled={isBusy || !hasLinkedCustomerId}
                                >
                                  {isBusy ? "Unblocking..." : "Unblock"}
                                </button>
                              ) : (
                                <button
                                  className="admin-btn admin-btn-danger admin-btn-inline"
                                  onClick={() => openBlockModal(customer)}
                                  disabled={isBusy || !hasLinkedCustomerId}
                                >
                                  {isBusy ? "Blocking..." : "Block"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="empty-state">
                          No cancelled booking records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="pagination">
              <button
                disabled={cancelledPage === 1}
                onClick={() => setCancelledPage((prev) => prev - 1)}
              >
                Prev
              </button>
              <span className="pagination-indicator">
                Page {cancelledPage} of {cancelledTotalPages}
              </span>
              <button
                disabled={cancelledPage === cancelledTotalPages}
                onClick={() => setCancelledPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Block Modal */}
      {blockModalOpen && (
        <div className="dashboard-modal-overlay" onClick={closeBlockModal}>
          <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <div>
                <h3>Block Customer</h3>
                <p>
                  This email will no longer be allowed to create new bookings.
                </p>
              </div>
              <button
                className="dashboard-modal-close"
                onClick={closeBlockModal}
                disabled={!!actionLoadingEmail}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="dashboard-modal-body">
              <div className="dashboard-modal-info">
                <span className="dashboard-modal-label">Customer</span>
                <strong>
                  {selectedCustomer?.full_name || "Unknown Customer"}
                </strong>
              </div>
              <div className="dashboard-modal-info">
                <span className="dashboard-modal-label">Email</span>
                <p>{selectedCustomer?.email || "N/A"}</p>
              </div>
              <div className="dashboard-modal-field">
                <label htmlFor="block-reason">Block Reason</label>
                <textarea
                  id="block-reason"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Enter the reason for blocking this customer"
                  rows={4}
                  disabled={!!actionLoadingEmail}
                />
              </div>
            </div>
            <div className="dashboard-modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={closeBlockModal}
                disabled={!!actionLoadingEmail}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={handleBlockCustomer}
                disabled={!!actionLoadingEmail}
              >
                {actionLoadingEmail ? "Blocking..." : "Confirm Block"}
              </button>
            </div>z
          </div>
        </div>
      )}

      {/* Unblock Modal */}
      {unblockModalOpen && (
        <div className="dashboard-modal-overlay" onClick={closeUnblockModal}>
          <div
            className="dashboard-modal dashboard-modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dashboard-modal-header">
              <div>
                <h3>Unblock Customer</h3>
                <p>
                  This customer will be allowed to book again once confirmed.
                </p>
              </div>
              <button
                className="dashboard-modal-close"
                onClick={closeUnblockModal}
                disabled={!!actionLoadingEmail}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="dashboard-modal-body">
              <div className="dashboard-modal-info">
                <span className="dashboard-modal-label">Customer</span>
                <strong>
                  {selectedCustomer?.full_name || "Unknown Customer"}
                </strong>
              </div>
              <div className="dashboard-modal-info">
                <span className="dashboard-modal-label">Email</span>
                <p>{selectedCustomer?.email || "N/A"}</p>
              </div>
              <div className="dashboard-modal-warning">
                Are you sure you want to unblock this customer?
              </div>
            </div>
            <div className="dashboard-modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={closeUnblockModal}
                disabled={!!actionLoadingEmail}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn"
                onClick={handleUnblockCustomer}
                disabled={!!actionLoadingEmail}
              >
                {actionLoadingEmail ? "Unblocking..." : "Confirm Unblock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Dashboard;
