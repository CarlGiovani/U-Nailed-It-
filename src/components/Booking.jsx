import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  confirmBooking,
  createBooking,
  getBookingById,
  uploadPaymentProof,
} from "../../backend/bookingApi.js";
import {
  getAvailableSlots,
  getMonthlyAvailability,
} from "../../backend/calendarApi.js";
import { getActivePolicies } from "../../backend/policiesApi.js";
import QR from "../assets/images/QR.png";
import supabase from "../config/supabaseClient.js";
import "../styles/booking-system.css";
/* ===============================
   CONSTANTS
=============================== */
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const FINAL_BOOKING_STATES = ["expired", "cancelled", "rejected", "completed"];

/* ===============================
   DATE HELPERS
=============================== */
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(`${dateStr}T00:00:00`);
};

const sameId = (a, b) => Number(a) === Number(b);

const formatDisplayTime = (timeStr) => {
  if (!timeStr) return "N/A";

  try {
    const clean = String(timeStr).trim();
    const [rawHours = "00", rawMinutes = "00"] = clean.split(":");
    const hour24 = Number(rawHours);
    const minute = Number(rawMinutes);

    if (Number.isNaN(hour24) || Number.isNaN(minute)) return clean;

    const ampm = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

    return `${hour12}:${String(minute).padStart(2, "0")} ${ampm}`;
  } catch {
    return timeStr;
  }
};

const formatCurrency = (value) =>
  `₱${Number(value || 0).toLocaleString("en-PH")}`;

const formatEstimateRange = (min, max) => {
  if (min == null || max == null) return "";
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
};

const getReadableDuration = (value) => {
  const num = Number(value || 0);
  if (!num) return "Not specified";

  if (Number.isInteger(num)) {
    return `${num} hour${num !== 1 ? "s" : ""}`;
  }

  return `${num} hours`;
};

/* ===============================
   LOCAL STORAGE RESUME
=============================== */
const LS_KEYS = {
  bookingId: "active_booking_id",
  bookingExpiresAt: "active_booking_expires_at",
  paymentIntentId: "active_payment_intent_id",
  paymentSignedUrl: "active_payment_signed_url",
};

const saveActiveBooking = ({ bookingId, expiresAt }) => {
  if (bookingId) localStorage.setItem(LS_KEYS.bookingId, String(bookingId));

  if (expiresAt) {
    const expiryMs =
      typeof expiresAt === "string" ? Date.parse(expiresAt) : expiresAt;
    localStorage.setItem(LS_KEYS.bookingExpiresAt, String(expiryMs));
  }
};

const saveActivePayment = ({ intentId, signedUrl }) => {
  if (intentId) localStorage.setItem(LS_KEYS.paymentIntentId, String(intentId));
  if (signedUrl) {
    localStorage.setItem(LS_KEYS.paymentSignedUrl, String(signedUrl));
  }
};

const clearActiveFlow = () => {
  Object.values(LS_KEYS).forEach((key) => localStorage.removeItem(key));
};

/* ===============================
   TIME HELPERS
=============================== */
const toMs = (isoOrNull) => {
  if (!isoOrNull) return null;

  if (typeof isoOrNull === "number") return isoOrNull;

  if (typeof isoOrNull === "string") {
    const num = Number(isoOrNull);
    if (!Number.isNaN(num) && String(num) === isoOrNull.trim()) return num;

    const date = new Date(isoOrNull);
    const ms = date.getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  return null;
};

const formatCountdown = (ms) => {
  if (ms == null) return null;
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

/* ===============================
   MAIN COMPONENT
=============================== */
const Booking = ({ services: servicesProp = [] }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1 = Service, 2 = Schedule, 3 = Details + Review, 4 = Payment, 5 = Done
  const [step, setStep] = useState(1);

  const [selectedDate, setSelectedDate] = useState("");
  const [bookingId, setBookingId] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [paymentSignedUrl, setPaymentSignedUrl] = useState(null);
  const [bookingPreview, setBookingPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [paymentProofUploaded, setPaymentProofUploaded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [confirmationError, setConfirmationError] = useState(null);

  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeBookingData, setResumeBookingData] = useState(null);
  const [resuming, setResuming] = useState(false);

  const [proofPreviewUrl, setProofPreviewUrl] = useState(null);
  const [selectedProofFile, setSelectedProofFile] = useState(null);

  const [imageViewer, setImageViewer] = useState({
    open: false,
    images: [],
    index: 0,
  });

  const [collapsedReview, setCollapsedReview] = useState({
    service: false,
    schedule: false,
    customer: false,
    notes: false,
  });

  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    tone: "default",
    actions: [],
  });

  const [timeLeftMs, setTimeLeftMs] = useState(null);
  const [isExpiredLocal, setIsExpiredLocal] = useState(false);

  const [formData, setFormData] = useState({
    service_id: "",
    service_category_id: "",
    service_variant_id: "",
    booking_date: "",
    booking_time: "",
    full_name: "",
    email: "",
    phone: "",
    facebook_link: "",
    notes: "",
    total_price: 0,
    downpayment: 0,
    duration: 0,
  });

  const [reviewPanelCollapsed, setReviewPanelCollapsed] = useState(true);

  // Terms modal
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasOpenedTerms, setHasOpenedTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [hasScrolledTermsToBottom, setHasScrolledTermsToBottom] =
    useState(false);

  const expiryHandledRef = useRef(false);
  const paymentProofInputRef = useRef(null);

  // Live refs for realtime callbacks
  const bookingIdRef = useRef(bookingId);
  const selectedDateRef = useRef(selectedDate);
  const currentMonthRef = useRef(currentMonth);
  const stepRef = useRef(step);
  const hardRestartRef = useRef(null);

  useEffect(() => {
    if (!imageViewer.open) return;

    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      window.scrollTo(0, scrollY);
    };
  }, [imageViewer.open]);

  useEffect(() => {
    bookingIdRef.current = bookingId;
  }, [bookingId]);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  useEffect(() => {
    currentMonthRef.current = currentMonth;
  }, [currentMonth]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const services = useMemo(() => {
    return (servicesProp || []).map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description || "No description available",
      duration: service.duration || 0,
      image:
        service.image_url ||
        service.image ||
        `https://via.placeholder.com/300x200?text=${encodeURIComponent(
          service.name,
        )}`,
      images: [
        service.image_url || service.image,
        ...(Array.isArray(service.images) ? service.images : []),
      ].filter(Boolean),
      service_categories:
        service.service_categories?.map((category) => ({
          id: category.id,
          name: category.name,
          service_variants:
            category.service_variants?.map((variant) => ({
              id: variant.id,
              body_part: variant.body_part,
              size: variant.size,
              price: variant.price,
              downpayment: variant.downpayment,
              estimate_min: variant.estimate_min ?? null,
              estimate_max: variant.estimate_max ?? null,
              is_active: variant.is_active,
            })) || [],
        })) || [],
    }));
  }, [servicesProp]);

  const fetchingServices = servicesProp?.length === 0;
  const servicesError = null;

  /* ===============================
     CLEANUP
  =============================== */
  useEffect(() => {
    return () => {
      if (proofPreviewUrl) URL.revokeObjectURL(proofPreviewUrl);
    };
  }, [proofPreviewUrl]);

  useEffect(() => {
    const hasOpenModal = modal.open || showResumePrompt || showTermsModal;
    if (!hasOpenModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [modal.open, showResumePrompt, showTermsModal]);

  useEffect(() => {
    if (!modal.open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setModal((prev) => ({ ...prev, open: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modal.open]);

  /* ===============================
     MODAL HELPERS
  =============================== */
  const showAlert = useCallback(
    (title, message, onConfirm = null, tone = "default") => {
      setModal({
        open: true,
        title,
        message,
        tone,
        actions: [
          {
            label: "OK",
            variant: "btn-primary",
            onClick: () => {
              setModal((prev) => ({ ...prev, open: false }));
              if (typeof onConfirm === "function") onConfirm();
            },
          },
        ],
      });
    },
    [],
  );

  const openTermsModal = useCallback(() => {
    setShowTermsModal(true);
    setHasOpenedTerms(true);
  }, []);

  const closeTermsModal = useCallback(() => {
    setShowTermsModal(false);
  }, []);

  const handleTermsScroll = useCallback((e) => {
    const el = e.target;
    const reachedBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - 12;

    if (reachedBottom) {
      setHasScrolledTermsToBottom(true);
    }
  }, []);

  /* ===============================
     RESET FLOW
  =============================== */
  const resetProofSelection = useCallback(() => {
    setSelectedProofFile(null);

    setProofPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    if (paymentProofInputRef.current) {
      paymentProofInputRef.current.value = "";
    }
  }, []);

  const resetBookingFlow = useCallback(() => {
    setBookingId(null);
    setPaymentIntentId(null);
    setPaymentSignedUrl(null);
    setPaymentProofUploaded(false);
    setConfirmationError(null);
    setBookingPreview(null);

    setTimeLeftMs(null);
    setIsExpiredLocal(false);
    expiryHandledRef.current = false;

    setShowTermsModal(false);
    setHasOpenedTerms(false);
    setAcceptedTerms(false);
    setHasScrolledTermsToBottom(false);

    resetProofSelection();
    clearActiveFlow();
  }, [resetProofSelection]);

  const hardRestart = useCallback(() => {
    resetBookingFlow();

    setStep(1);
    setSelectedDate("");
    setSelectedCategory(null);
    setSelectedVariant(null);
    setResumeBookingData(null);

    setCollapsedReview({
      service: false,
      schedule: false,
      customer: false,
      notes: false,
    });

    setReviewPanelCollapsed(true);

    setFormData({
      service_id: "",
      service_category_id: "",
      service_variant_id: "",
      booking_date: "",
      booking_time: "",
      full_name: "",
      email: "",
      phone: "",
      facebook_link: "",
      notes: "",
      total_price: 0,
      downpayment: 0,
      duration: 0,
    });
  }, [resetBookingFlow]);

  useEffect(() => {
    hardRestartRef.current = hardRestart;
  }, [hardRestart]);

  /* ===============================
     STEP GUARD
  =============================== */
  useEffect(() => {
    if (resuming) return;

    if (step === 4 && !bookingId && isExpiredLocal) {
      setStep(1);
      return;
    }

    if (step === 5 && !bookingPreview) {
      setStep(1);
    }
  }, [step, bookingId, bookingPreview, isExpiredLocal, resuming]);

  const isLockedAfterBookingCreated = !!bookingId && step >= 4;

  const goBackToEditableStep = useCallback(
    (targetStep) => {
      if (isLockedAfterBookingCreated) {
        showAlert(
          "Editing Locked",
          "This booking has already been created. Earlier editable steps are locked to avoid mismatch in service, schedule, and payment data.",
          null,
          "warning",
        );
        return;
      }

      setStep(targetStep);
    },
    [isLockedAfterBookingCreated, showAlert],
  );

  /* ===============================
     RESUME BOOKING
  =============================== */
  const checkAndResumeBooking = useCallback(async () => {
    const savedBookingId = localStorage.getItem(LS_KEYS.bookingId);
    if (!savedBookingId) return;

    setResuming(true);

    try {
      const booking = await getBookingById(savedBookingId);

      if (FINAL_BOOKING_STATES.includes(booking.status)) {
        clearActiveFlow();
        return;
      }

      let serviceInfo = null;

      try {
        if (services.length > 0) {
          const serviceId = Number(booking.service_id);
          const catId =
            booking.service_category_id != null
              ? Number(booking.service_category_id)
              : null;
          const varId =
            booking.service_variant_id != null
              ? Number(booking.service_variant_id)
              : null;

          const service = services.find((s) => Number(s.id) === serviceId);

          if (service) {
            const category =
              (varId != null
                ? service.service_categories?.find((c) =>
                    c.service_variants?.some((v) => Number(v.id) === varId),
                  )
                : null) ||
              (catId != null
                ? service.service_categories?.find(
                    (c) => Number(c.id) === catId,
                  )
                : null);

            const variant =
              (category && varId != null
                ? category.service_variants?.find((v) => Number(v.id) === varId)
                : null) ||
              (varId != null
                ? service.service_categories
                    ?.flatMap((c) => c.service_variants || [])
                    ?.find((v) => Number(v.id) === varId)
                : null);

            serviceInfo = {
              name: service.name,
              category: category ? { name: category.name } : null,
              variant: variant
                ? {
                    body_part: variant.body_part,
                    size: variant.size,
                    estimate_min: variant.estimate_min ?? null,
                    estimate_max: variant.estimate_max ?? null,
                  }
                : null,
            };
          }
        }
      } catch (e) {
        console.warn("Could not resolve resume service info:", e);
      }

      setResumeBookingData({ booking, serviceInfo });
      setBookingId(booking.id);
      setBookingPreview(booking);

      const backendPaymentIntentId =
        booking.payment?.payment_intent_id || booking.payment_intent_id;

      const savedIntentId = localStorage.getItem(LS_KEYS.paymentIntentId);
      const savedSigned = localStorage.getItem(LS_KEYS.paymentSignedUrl);

      const hasProofBackend =
        !!booking.payment?.proof_url ||
        !!booking.payment?.payment_proof_url ||
        !!booking.payment?.signed_url ||
        !!booking.payment?.signedUrl;

      const hasProofFromStorage = !!savedSigned;

      if (backendPaymentIntentId) {
        setPaymentIntentId(backendPaymentIntentId);
        setPaymentProofUploaded(hasProofBackend || hasProofFromStorage);
      } else if (savedIntentId) {
        setPaymentIntentId(savedIntentId);
        setPaymentProofUploaded(hasProofFromStorage);
      }

      if (savedSigned) setPaymentSignedUrl(savedSigned);

      setFormData((prev) => ({
        ...prev,
        service_id: booking.service_id ?? prev.service_id,
        service_variant_id:
          booking.service_variant_id ?? prev.service_variant_id,
        service_category_id:
          booking.service_category_id ?? prev.service_category_id,
        booking_date: booking.booking_date ?? prev.booking_date,
        booking_time: booking.booking_time ?? prev.booking_time,
        total_price: booking.total_price ?? prev.total_price,
        downpayment: booking.downpayment ?? prev.downpayment,
        notes: booking.notes ?? prev.notes,
        full_name:
          booking.customer_name ??
          booking.customers?.full_name ??
          prev.full_name,
        email: booking.customer_email ?? booking.customers?.email ?? prev.email,
        phone: booking.customer_phone ?? booking.customers?.phone ?? prev.phone,
        facebook_link:
          booking.customer_facebook_link ??
          booking.customers?.facebook_link ??
          prev.facebook_link,
      }));

      if (booking.booking_date) {
        const localDate = parseLocalDate(booking.booking_date);
        if (localDate) {
          setSelectedDate(formatLocalDate(localDate));
        }
      }

      if (booking.status === "pending_payment") {
        setShowResumePrompt(true);
      } else if (
        booking.status === "pending_approval" ||
        booking.status === "approved" ||
        booking.status === "completed"
      ) {
        setStep(5);
      }
    } catch (error) {
      console.error("Resume booking failed:", error);
      clearActiveFlow();
    } finally {
      setResuming(false);
    }
  }, [services]);

  useEffect(() => {
    if (services.length > 0) {
      checkAndResumeBooking();
    }
  }, [services, checkAndResumeBooking]);

  const handleResumeBooking = useCallback(() => {
    if (!bookingPreview) return;

    const status = bookingPreview.status;

    const hasProof =
      !!paymentSignedUrl ||
      !!bookingPreview?.payment?.proof_url ||
      !!bookingPreview?.payment?.payment_proof_url ||
      !!bookingPreview?.payment?.signed_url ||
      !!bookingPreview?.payment?.signedUrl;

    if (status === "pending_payment") {
      setPaymentProofUploaded(!!hasProof);
      setStep(4);
      return;
    }

    if (
      status === "pending_approval" ||
      status === "approved" ||
      status === "completed"
    ) {
      setStep(5);
      return;
    }

    setStep(1);
  }, [bookingPreview, paymentSignedUrl]);

  /* ===============================
     AUTO MAP CATEGORY / VARIANT
  =============================== */
  useEffect(() => {
    if (!services.length || !formData.service_id) return;

    const service = services.find((s) => sameId(s.id, formData.service_id));
    if (!service) return;

    if (formData.service_category_id) {
      const cat = service.service_categories?.find((c) =>
        sameId(c.id, formData.service_category_id),
      );
      if (cat) setSelectedCategory(cat);
    }

    if (formData.service_variant_id && !formData.service_category_id) {
      const foundCat = service.service_categories?.find((c) =>
        c.service_variants?.some((v) =>
          sameId(v.id, formData.service_variant_id),
        ),
      );

      if (foundCat) {
        setSelectedCategory(foundCat);
        setFormData((prev) => ({
          ...prev,
          service_category_id: foundCat.id,
        }));
      }
    }

    if (formData.service_category_id && formData.service_variant_id) {
      const cat = service.service_categories?.find((c) =>
        sameId(c.id, formData.service_category_id),
      );
      const variant = cat?.service_variants?.find((v) =>
        sameId(v.id, formData.service_variant_id),
      );
      if (variant) setSelectedVariant(variant);
    }
  }, [
    services,
    formData.service_id,
    formData.service_category_id,
    formData.service_variant_id,
  ]);

  /* ===============================
     POLICIES / TERMS
  =============================== */
  const {
    data: policies = [],
    isLoading: policiesLoading,
    isError: policiesError,
  } = useQuery({
    queryKey: ["publicPolicies"],
    queryFn: getActivePolicies,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
  });

  /* ===============================
     AVAILABILITY
  =============================== */
  const availabilityYear = currentMonth.getFullYear();
  const availabilityMonth = currentMonth.getMonth() + 1;

  const {
    data: monthlyAvailabilityData,
    isFetching: monthlyAvailabilityFetching,
  } = useQuery({
    queryKey: [
      "monthlyAvailability",
      formData.service_id,
      availabilityYear,
      availabilityMonth,
    ],
    queryFn: async () => {
      if (!formData.service_id) return {};

      const availabilityData = await getMonthlyAvailability(
        formData.service_id,
        availabilityYear,
        availabilityMonth,
      );

      const map = {};
      availabilityData.forEach((item) => {
        map[item.date] = item.available;
      });

      return map;
    },
    enabled: !!formData.service_id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const monthlyAvailability = useMemo(() => {
    if (!formData.service_id) return {};
    return monthlyAvailabilityData ?? {};
  }, [formData.service_id, monthlyAvailabilityData]);

  const { data: availableSlotsData, isFetching: availableSlotsFetching } =
    useQuery({
      queryKey: ["availableSlots", formData.service_id, selectedDate],
      queryFn: async () => {
        if (!formData.service_id || !selectedDate) return [];
        return await getAvailableSlots(formData.service_id, selectedDate);
      },
      enabled: !!formData.service_id && !!selectedDate,
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    });

  const availableSlots = useMemo(() => {
    if (!formData.service_id || !selectedDate) return [];
    return availableSlotsData ?? [];
  }, [formData.service_id, selectedDate, availableSlotsData]);

  const calendarDates = useMemo(() => {
    if (!formData.service_id) return [];

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prevMonthLastDay = new Date(year, month, 0).getDate();

    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const dateStr = formatLocalDate(date);

      dates.push({
        date,
        dateStr,
        isCurrentMonth: false,
        isPast: date < today,
        isSelected: selectedDate === dateStr,
        isBlocked: true,
        isAvailable: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = formatLocalDate(date);
      const isPast = date < today;
      const isAvailable = monthlyAvailability[dateStr] === true;
      const isBlocked = isPast || !isAvailable;

      dates.push({
        date,
        dateStr,
        isCurrentMonth: true,
        isPast,
        isSelected: selectedDate === dateStr,
        isBlocked,
        isAvailable,
      });
    }

    const totalCells = 42;
    const remainingCells = Math.max(0, totalCells - dates.length);

    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      const dateStr = formatLocalDate(date);

      dates.push({
        date,
        dateStr,
        isCurrentMonth: false,
        isPast: date < today,
        isSelected: false,
        isBlocked: true,
        isAvailable: false,
      });
    }

    return dates;
  }, [formData.service_id, currentMonth, selectedDate, monthlyAvailability]);

  const timeSlots = useMemo(() => {
    if (!availableSlots.length) return [];

    return availableSlots
      .map((slot) => ({
        value: slot.time,
        display: formatDisplayTime(slot.time),
        available: slot.is_available,
        isSelected: formData.booking_time === slot.time,
        slotId: slot.id,
      }))
      .sort((a, b) => {
        const [hA, mA] = a.value.split(":").map(Number);
        const [hB, mB] = b.value.split(":").map(Number);
        return hA - hB || mA - mB;
      });
  }, [availableSlots, formData.booking_time]);

  /* ===============================
     REALTIME
  =============================== */
  useEffect(() => {
    if (!formData.service_id) return;

    const serviceId = Number(formData.service_id);

    const invalidateAvailability = async () => {
      const liveMonth = currentMonthRef.current;
      const liveSelectedDate = selectedDateRef.current;

      await queryClient.invalidateQueries({
        queryKey: [
          "monthlyAvailability",
          serviceId,
          liveMonth.getFullYear(),
          liveMonth.getMonth() + 1,
        ],
      });

      if (liveSelectedDate) {
        await queryClient.invalidateQueries({
          queryKey: ["availableSlots", serviceId, liveSelectedDate],
        });
      }
    };

    const slotsChannel = supabase
      .channel(`public-booking-slots-${serviceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "calendar_slots",
        },
        async (payload) => {
          const row = payload.new || payload.old;
          if (!row) return;
          if (Number(row.service_id) !== serviceId) return;

          await invalidateAvailability();
        },
      )
      .subscribe();

    const bookingsChannel = supabase
      .channel(`public-booking-bookings-${serviceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        async (payload) => {
          const row = payload.new || payload.old;
          if (!row) return;
          if (Number(row.service_id) !== serviceId) return;

          await invalidateAvailability();

          const liveBookingId = bookingIdRef.current;
          if (!liveBookingId) return;
          if (Number(row.id) !== Number(liveBookingId)) return;

          try {
            const latest = await getBookingById(liveBookingId);
            setBookingPreview(latest);

            if (latest.status === "expired" && stepRef.current === 4) {
              setIsExpiredLocal(true);
            }

            if (
              latest.status === "pending_approval" ||
              latest.status === "approved" ||
              latest.status === "completed"
            ) {
              setStep(5);
            }

            if (FINAL_BOOKING_STATES.includes(latest.status)) {
              clearActiveFlow();

              if (latest.status !== "completed" && stepRef.current === 4) {
                setModal({
                  open: true,
                  title: "Booking No Longer Active",
                  message:
                    latest.status === "expired"
                      ? "Your booking has expired. Please start a new booking."
                      : latest.status === "cancelled"
                        ? "This booking was cancelled."
                        : latest.status === "rejected"
                          ? "This booking was rejected."
                          : "This booking is no longer active.",
                  tone: "warning",
                  actions: [
                    {
                      label: "OK",
                      variant: "btn-primary",
                      onClick: () => {
                        setModal((prev) => ({ ...prev, open: false }));
                        hardRestartRef.current?.();
                      },
                    },
                  ],
                });
              }
            }
          } catch (err) {
            console.warn("Realtime booking refresh failed:", err);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(slotsChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, [formData.service_id, queryClient]);

  /* ===============================
     COUNTDOWN
  =============================== */
  useEffect(() => {
    if (showResumePrompt) return;

    const expMs = toMs(bookingPreview?.expires_at);

    if (!expMs) {
      setTimeLeftMs(null);
      setIsExpiredLocal(false);
      return;
    }

    const tick = () => {
      const now = Date.now();
      const left = expMs - now;
      setTimeLeftMs(left);

      const expired = left <= 0;
      setIsExpiredLocal(expired);

      if (expired && !expiryHandledRef.current && step === 4) {
        expiryHandledRef.current = true;

        setModal({
          open: true,
          title: "Booking Expired",
          message:
            "Your 30-minute payment window has ended. Please start a new booking.",
          tone: "danger",
          actions: [
            {
              label: "Start New Booking",
              variant: "btn-primary",
              onClick: () => {
                setModal((prev) => ({ ...prev, open: false }));
                hardRestart();
              },
            },
          ],
        });
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [bookingPreview?.expires_at, step, hardRestart, showResumePrompt]);

  /* ===============================
     NAVIGATION HELPERS
  =============================== */
  const prevMonth = useCallback(() => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
    setSelectedDate("");
    setFormData((prev) => ({ ...prev, booking_time: "", booking_date: "" }));
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
    setSelectedDate("");
    setFormData((prev) => ({ ...prev, booking_time: "", booking_date: "" }));
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate("");
    setFormData((prev) => ({ ...prev, booking_time: "", booking_date: "" }));
  }, []);

  /* ===============================
     SELECT HANDLERS
  =============================== */
  const handleServiceSelect = useCallback(
    (service) => {
      resetBookingFlow();

      setFormData((prev) => ({
        ...prev,
        service_id: service.id,
        service_category_id: "",
        service_variant_id: "",
        total_price: 0,
        downpayment: 0,
        duration: service.duration || 0,
        booking_date: "",
        booking_time: "",
      }));

      setSelectedCategory(null);
      setSelectedVariant(null);
      setSelectedDate("");
    },
    [resetBookingFlow],
  );

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    setSelectedVariant(null);

    setFormData((prev) => ({
      ...prev,
      service_category_id: category.id,
      service_variant_id: "",
      total_price: 0,
      downpayment: 0,
    }));
  }, []);

  const handleVariantSelect = useCallback((variant) => {
    setSelectedVariant(variant);

    setFormData((prev) => ({
      ...prev,
      service_variant_id: variant.id,
      total_price: variant.price,
      downpayment: variant.downpayment,
    }));

    setStep(2);
  }, []);

  const handleDateSelect = useCallback(
    (date) => {
      if (!date) return;
      const dateStr = formatLocalDate(date);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date < today || !monthlyAvailability[dateStr]) return;

      setSelectedDate(dateStr);
      setFormData((prev) => ({
        ...prev,
        booking_date: dateStr,
        booking_time: "",
      }));
    },
    [monthlyAvailability],
  );

  const handleTimeSelect = useCallback((time) => {
    setFormData((prev) => ({ ...prev, booking_time: time }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  /* ===============================
     SELECTED OBJECTS
  =============================== */
  const selectedService = useMemo(
    () => services.find((s) => sameId(s.id, formData.service_id)),
    [services, formData.service_id],
  );

  const selectedCategoryObj = useMemo(() => {
    return selectedService?.service_categories?.find((c) =>
      sameId(c.id, formData.service_category_id),
    );
  }, [selectedService, formData.service_category_id]);

  const selectedVariantObj = useMemo(() => {
    return selectedCategoryObj?.service_variants?.find((v) =>
      sameId(v.id, formData.service_variant_id),
    );
  }, [selectedCategoryObj, formData.service_variant_id]);

  const getAvailableDatesCount = useCallback(
    () => Object.values(monthlyAvailability).filter((v) => v === true).length,
    [monthlyAvailability],
  );

  /* ===============================
     VALIDATION
  =============================== */
  const validateForm = useCallback(
    (targetStep = step) => {
      const errors = [];

      if (targetStep === 1) {
        if (!formData.service_id) errors.push("Please select a service.");
        if (!formData.service_category_id)
          errors.push("Please select a category.");
        if (!formData.service_variant_id)
          errors.push("Please select a variant.");
      }

      if (targetStep === 2) {
        if (!formData.booking_date) errors.push("Please select a date.");
        if (!formData.booking_time) errors.push("Please select a time slot.");
      }

      if (targetStep === 3) {
        if (!formData.full_name.trim()) errors.push("Full name is required.");
        if (!formData.email.trim()) errors.push("Email is required.");
        if (!formData.phone.trim()) errors.push("Phone number is required.");
        if (formData.email && !formData.email.includes("@")) {
          errors.push("Please enter a valid email address.");
        }
      }

      if (errors.length > 0) {
        showAlert("Validation Error", errors.join("\n"), null, "warning");
        return false;
      }

      return true;
    },
    [formData, step, showAlert],
  );

  /* ===============================
     STEP 3 => STEP 4
  =============================== */
  const handleProceedToPayment = useCallback(async () => {
    if (!validateForm(3)) return;

    // =========================
    // TERMS VALIDATION
    // =========================
    if (!hasOpenedTerms) {
      showAlert(
        "Terms & Conditions Required",
        "Please open and review the Terms & Conditions before proceeding.",
        null,
        "warning",
      );
      return;
    }

    if (!hasScrolledTermsToBottom) {
      showAlert(
        "Please Review the Terms",
        "Please scroll through the Terms & Conditions before proceeding.",
        null,
        "warning",
      );
      return;
    }

    if (!acceptedTerms) {
      showAlert(
        "Agreement Required",
        "You must agree to the Terms & Conditions before proceeding.",
        null,
        "warning",
      );
      return;
    }

    // =========================
    // DOUBLE SUBMIT GUARD
    // =========================
    if (loading) return;
    setLoading(true);

    try {
      // =========================
      // CREATE BOOKING (SOURCE OF TRUTH IS BACKEND)
      // =========================
      const payload = {
        service_id: formData.service_id,
        service_category_id: formData.service_category_id,
        service_variant_id: formData.service_variant_id,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        total_price: formData.total_price,
        downpayment: formData.downpayment,
        notes: formData.notes,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        facebook_link: formData.facebook_link,
      };

      const result = await createBooking(payload);

      if (!result?.id) {
        throw new Error("Booking creation failed. No ID returned.");
      }

      // =========================
      // OPTIONAL BACKEND GUARD (ONLY FOR SAFETY MESSAGE, NOT DECISION LOGIC)
      // =========================
      const invalidStatuses = ["rejected", "cancelled", "expired"];
      const allowedStatuses = [
        "pending_payment",
        "pending_approval",
        "approved",
      ];

      const status = result.status;

      if (invalidStatuses.includes(status)) {
        showAlert(
          "Slot Unavailable",
          "This slot was already taken or rejected. Please choose another schedule.",
          null,
          "danger",
        );
        return;
      }

      if (!allowedStatuses.includes(status)) {
        showAlert(
          "Booking Failed",
          "Hindi nag-success ang booking. Pakisubukan ulit.",
          null,
          "danger",
        );
        return;
      }

      // =========================
      // SAFE STATE UPDATE (NO RE-FETCH, ATOMIC RESPONSE TRUST)
      // =========================
      setBookingId(result.id);
      setBookingPreview(result);

      saveActiveBooking({
        bookingId: result.id,
        expiresAt: result.expires_at,
      });

      // =========================
      // STEP NAVIGATION (UI SAFE TRANSITION)
      // =========================
      requestAnimationFrame(() => {
        setStep(4);
      });
    } catch (error) {
      console.error("Booking creation error:", error);

      const backendData = error.response?.data;

      const formattedErrors = Array.isArray(backendData?.errors)
        ? backendData.errors
            .map((err) => {
              if (typeof err === "string") return err;
              return err.msg || err.message || JSON.stringify(err);
            })
            .join("\n")
        : null;

      const rawErrorMessage =
        backendData?.error ||
        formattedErrors ||
        error.message ||
        "Something went wrong while creating your booking.";

      const normalizedErrorMessage = String(rawErrorMessage).toLowerCase();

      const errorMessage =
        normalizedErrorMessage.includes("restricted") ||
        normalizedErrorMessage.includes("blocked")
          ? "This email is currently restricted from making new bookings. Please contact support if you believe this is a mistake."
          : rawErrorMessage;

      showAlert(
        "Unable to Continue",
        errorMessage,
        () => {
          hardRestart();
          setStep(1);
        },
        "danger",
      );
    } finally {
      setLoading(false);
    }
  }, [
    validateForm,
    hasOpenedTerms,
    hasScrolledTermsToBottom,
    acceptedTerms,
    formData,
    showAlert,
    loading,
    hardRestart,
  ]);

  /* ===============================
     PAYMENT
  =============================== */
  const handlePaymentUpload = useCallback(
    async (file, { silent = false } = {}) => {
      if (!file || !bookingId) return null;
      if (uploading) return null;

      if (isExpiredLocal) {
        setModal({
          open: true,
          title: "Booking Expired",
          message:
            "This booking is already expired. Please start a new booking to continue.",
          tone: "danger",
          actions: [
            {
              label: "Start New Booking",
              variant: "btn-primary",
              onClick: () => {
                setModal((prev) => ({ ...prev, open: false }));
                hardRestart();
              },
            },
          ],
        });
        return null;
      }

      if (!bookingPreview) {
        showAlert(
          "Error",
          "Booking data not found. Please restart the booking process.",
          null,
          "danger",
        );
        return null;
      }

      setUploading(true);

      const formDataObj = new FormData();
      formDataObj.append("booking_id", bookingId);
      formDataObj.append(
        "email",
        bookingPreview.customer_email ||
          bookingPreview.customers?.email ||
          bookingPreview.email ||
          formData.email,
      );
      formDataObj.append("service_id", bookingPreview.service_id);
      formDataObj.append(
        "service_variant_id",
        bookingPreview.service_variant_id,
      );
      formDataObj.append("booking_date", bookingPreview.booking_date);
      formDataObj.append("booking_time", bookingPreview.booking_time);
      formDataObj.append("proof", file);

      try {
        const result = await uploadPaymentProof(formDataObj);

        const intent =
          result.payment_intent_id ||
          result.paymentIntentId ||
          result.intentId ||
          result.payment_intent ||
          null;

        const signed =
          result.signedUrl || result.signed_url || result.proof_url || null;

        if (!intent) {
          showAlert(
            "Upload Error",
            "Payment intent was not returned. Please try again.",
            null,
            "danger",
          );
          return null;
        }

        setPaymentIntentId(intent);
        setPaymentSignedUrl(signed);
        setPaymentProofUploaded(true);

        saveActivePayment({
          intentId: intent,
          signedUrl: signed,
        });

        resetProofSelection();

        try {
          const preview = await getBookingById(bookingId);
          setBookingPreview(preview);
        } catch (err) {
          console.warn("Preview refresh failed:", err);
        }

        if (!silent) {
          showAlert(
            "Payment Proof Uploaded",
            "Payment proof uploaded successfully. You can now confirm your booking.",
            null,
            "success",
          );
        }

        return intent;
      } catch (error) {
        console.error("Upload error:", error);

        let errorMessage = "Upload failed. ";
        if (error.response?.status === 413) {
          errorMessage += "File too large (max 5MB).";
        } else if (error.response?.status === 400) {
          errorMessage +=
            error.response?.data?.error ||
            "Invalid file format. Please upload PNG, JPG, or PDF.";
        } else {
          errorMessage += error.response?.data?.error || error.message;
        }

        showAlert("Upload Error", errorMessage, null, "danger");
        return null;
      } finally {
        setUploading(false);
      }
    },
    [
      bookingId,
      uploading,
      isExpiredLocal,
      bookingPreview,
      formData.email,
      showAlert,
      hardRestart,
      resetProofSelection,
    ],
  );

  const handleFinalConfirmation = useCallback(
    async (intentOverride = null) => {
      if (!bookingId) {
        showAlert(
          "Error",
          "Missing booking ID. Please restart booking.",
          null,
          "danger",
        );
        return;
      }

      const intentToUse = intentOverride || paymentIntentId;

      if (!intentToUse) {
        showAlert(
          "Error",
          "Please upload payment proof first.",
          null,
          "warning",
        );
        return;
      }

      if (isExpiredLocal) {
        setModal({
          open: true,
          title: "Booking Expired",
          message:
            "Your payment window has ended. Please start a new booking to continue.",
          tone: "danger",
          actions: [
            {
              label: "Start New Booking",
              variant: "btn-primary",
              onClick: () => {
                setModal((prev) => ({ ...prev, open: false }));
                hardRestart();
              },
            },
          ],
        });
        return;
      }

      setConfirmationError(null);
      setLoading(true);

      try {
        await confirmBooking(bookingId, intentToUse);

        try {
          const latest = await getBookingById(bookingId);
          setBookingPreview(latest);
        } catch (err) {
          console.warn("Fetch latest booking failed:", err);
        }

        setStep(5);
        clearActiveFlow();
      } catch (error) {
        console.error("Confirm error:", error);
        const msg = error.response?.data?.error || error.message;

        let errorType = "unknown";
        let errorMessage = "An error occurred. Please try again.";
        let showRetry = true;

        if (error.response?.status === 404) {
          errorType = "payment_not_found";
          errorMessage = "Payment record not found. Please upload proof again.";
          showRetry = false;
        } else if (
          error.response?.status === 400 ||
          error.response?.status === 409
        ) {
          if (String(msg).toLowerCase().includes("expired")) {
            errorType = "payment_expired";
            errorMessage =
              "Payment proof expired (30 minutes). Please restart booking.";
            showRetry = false;

            setModal({
              open: true,
              title: "Payment Expired",
              message:
                "Your 30-minute payment window has ended. Please start a new booking.",
              tone: "danger",
              actions: [
                {
                  label: "Start New Booking",
                  variant: "btn-primary",
                  onClick: () => {
                    setModal((prev) => ({ ...prev, open: false }));
                    hardRestart();
                  },
                },
              ],
            });
          } else if (String(msg).toLowerCase().includes("slot")) {
            errorType = "slot_taken";
            errorMessage =
              "That slot is no longer available. Please choose another date and time.";
            showRetry = false;

            resetBookingFlow();

            setFormData((prev) => ({
              ...prev,
              booking_date: "",
              booking_time: "",
            }));
            setSelectedDate("");
            setStep(2);

            setModal({
              open: true,
              title: "Slot No Longer Available",
              message:
                "The selected time slot has been taken. Please choose another date and time. You will need to upload payment proof again after selecting a new schedule.",
              tone: "warning",
              actions: [
                {
                  label: "Choose Another Slot",
                  variant: "btn-primary",
                  onClick: () => {
                    setModal((prev) => ({ ...prev, open: false }));
                  },
                },
              ],
            });

            return;
          } else {
            errorType = "invalid_payment";
            errorMessage = msg || "Invalid request.";
          }
        } else if (error.response?.status === 500) {
          errorType = "server_error";
          errorMessage = "Server error. Please try again later.";
        } else if (!navigator.onLine) {
          errorType = "offline";
          errorMessage = "No internet connection. Please check your network.";
        } else {
          errorMessage = msg || errorMessage;
        }

        setConfirmationError({
          type: errorType,
          message: errorMessage,
          retry: showRetry,
        });
      } finally {
        setLoading(false);
      }
    },
    [
      bookingId,
      paymentIntentId,
      isExpiredLocal,
      showAlert,
      hardRestart,
      resetBookingFlow,
    ],
  );

  const handleConfirmWithUpload = useCallback(async () => {
    if (!bookingId) {
      showAlert(
        "Error",
        "Missing booking ID. Please restart booking.",
        null,
        "danger",
      );
      return;
    }

    if (isExpiredLocal) {
      setModal({
        open: true,
        title: "Booking Expired",
        message:
          "Your payment window has ended. Please start a new booking to continue.",
        tone: "danger",
        actions: [
          {
            label: "Start New Booking",
            variant: "btn-primary",
            onClick: () => {
              setModal((prev) => ({ ...prev, open: false }));
              hardRestart();
            },
          },
        ],
      });
      return;
    }

    const alreadyHasProof =
      paymentProofUploaded ||
      !!paymentSignedUrl ||
      !!bookingPreview?.payment?.proof_url ||
      !!bookingPreview?.payment?.payment_proof_url ||
      !!bookingPreview?.payment?.signed_url ||
      !!bookingPreview?.payment?.signedUrl;

    if (!alreadyHasProof && !selectedProofFile) {
      showAlert(
        "Upload Required",
        "Please select a proof of payment file first.",
        null,
        "warning",
      );
      return;
    }

    try {
      if (!alreadyHasProof) {
        const intent = await handlePaymentUpload(selectedProofFile, {
          silent: true,
        });
        if (!intent) return;

        await handleFinalConfirmation(intent);
        return;
      }

      await handleFinalConfirmation();
    } catch (e) {
      console.error(e);
    }
  }, [
    bookingId,
    isExpiredLocal,
    paymentProofUploaded,
    paymentSignedUrl,
    bookingPreview,
    selectedProofFile,
    showAlert,
    hardRestart,
    handlePaymentUpload,
    handleFinalConfirmation,
  ]);

  const retryConfirmation = useCallback(() => {
    setConfirmationError(null);
    handleFinalConfirmation();
  }, [handleFinalConfirmation]);

  /* ===============================
     UI HELPERS
  =============================== */
  const toggleReviewSection = useCallback((key) => {
    setCollapsedReview((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const reviewSections = useMemo(
    () => [
      {
        key: "service",
        title: "Service",
        summary: `${selectedService?.name || "N/A"} • ${
          selectedCategoryObj?.name || "N/A"
        } • ${selectedVariantObj?.body_part || "N/A"}`,
        content: (
          <div className="review-grid-mini">
            <div className="mini-row">
              <span>Service</span>
              <strong>{selectedService?.name || "N/A"}</strong>
            </div>
            <div className="mini-row">
              <span>Category</span>
              <strong>{selectedCategoryObj?.name || "N/A"}</strong>
            </div>
            <div className="mini-row">
              <span>Variant</span>
              <strong>
                {selectedVariantObj?.body_part
                  ? `${selectedVariantObj.body_part}${
                      selectedVariantObj.size
                        ? ` (${selectedVariantObj.size})`
                        : ""
                    }`
                  : "N/A"}
              </strong>
            </div>
            {selectedVariantObj?.estimate_min != null &&
              selectedVariantObj?.estimate_max != null && (
                <div className="mini-row">
                  <span>Estimate</span>
                  <strong>
                    {formatEstimateRange(
                      selectedVariantObj.estimate_min,
                      selectedVariantObj.estimate_max,
                    )}
                  </strong>
                </div>
              )}
            <div className="mini-row">
              <span>Duration</span>
              <strong>{getReadableDuration(selectedService?.duration)}</strong>
            </div>
            <div className="mini-row highlight">
              <span>Total</span>
              <strong>{formatCurrency(formData.total_price)}</strong>
            </div>
            <div className="mini-row highlight">
              <span>Downpayment</span>
              <strong>{formatCurrency(formData.downpayment)}</strong>
            </div>
          </div>
        ),
      },
      {
        key: "schedule",
        title: "Schedule",
        summary: `${formData.booking_date || "No date"} • ${formatDisplayTime(
          formData.booking_time,
        )}`,
        content: (
          <div className="review-grid-mini">
            <div className="mini-row">
              <span>Date</span>
              <strong>
                {formData.booking_date
                  ? parseLocalDate(formData.booking_date)?.toLocaleDateString(
                      "en-PH",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )
                  : "N/A"}
              </strong>
            </div>
            <div className="mini-row">
              <span>Time</span>
              <strong>{formatDisplayTime(formData.booking_time)}</strong>
            </div>
          </div>
        ),
      },
      {
        key: "customer",
        title: "Your Information",
        summary: `${formData.full_name || "No name"} • ${
          formData.email || "No email"
        }`,
        content: (
          <div className="review-grid-mini">
            <div className="mini-row">
              <span>Full Name</span>
              <strong>{formData.full_name || "N/A"}</strong>
            </div>
            <div className="mini-row">
              <span>Email</span>
              <strong>{formData.email || "N/A"}</strong>
            </div>
            <div className="mini-row">
              <span>Phone</span>
              <strong>{formData.phone || "N/A"}</strong>
            </div>
            <div className="mini-row">
              <span>Facebook</span>
              <strong>{formData.facebook_link || "Not provided"}</strong>
            </div>
          </div>
        ),
      },
      {
        key: "notes",
        title: "Additional Notes",
        summary: formData.notes?.trim()
          ? formData.notes
          : "No additional notes provided",
        content: (
          <div className="review-notes-box">
            {formData.notes?.trim() || "No additional notes provided."}
          </div>
        ),
      },
    ],
    [
      selectedService,
      selectedCategoryObj,
      selectedVariantObj,
      formData.total_price,
      formData.downpayment,
      formData.booking_date,
      formData.booking_time,
      formData.full_name,
      formData.email,
      formData.phone,
      formData.facebook_link,
      formData.notes,
    ],
  );

  /* ===============================
     MODALS
  =============================== */
  const Modal = () => {
    if (!modal.open) return null;

    return createPortal(
      <div
        className="modal-overlay"
        onClick={() => setModal((prev) => ({ ...prev, open: false }))}
      >
        <div
          className={`modal-card modal-${modal.tone}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-card-header">
            <div className="modal-card-icon">
              {modal.tone === "danger"
                ? "⛔"
                : modal.tone === "success"
                  ? "✓"
                  : "⚠️"}
            </div>

            <div>
              <h3 className="modal-card-title">{modal.title}</h3>
              <div className="modal-card-message">{modal.message}</div>
            </div>
          </div>

          <div className="modal-card-actions">
            {(modal.actions || []).map((action, index) => (
              <button
                key={index}
                type="button"
                className={`btn ${action.variant || "btn-primary"} premium`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>,
      document.body,
    );
  };

  const ResumeModal = () => {
    if (!showResumePrompt || !resumeBookingData) return null;

    const { booking, serviceInfo } = resumeBookingData;

    const serviceName =
      serviceInfo?.name ||
      booking.service?.name ||
      `Service #${booking.service_id}`;

    const categoryName =
      serviceInfo?.category?.name || `Category #${booking.service_category_id}`;

    const variantName =
      serviceInfo?.variant?.body_part ||
      `Variant #${booking.service_variant_id}`;

    const handleStartNew = () => {
      setShowResumePrompt(false);
      hardRestart();
    };

    const handleResume = () => {
      setShowResumePrompt(false);
      handleResumeBooking();
    };

    return createPortal(
      <div className="resume-modal-overlay" role="dialog" aria-modal="true">
        <div className="resume-modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="resume-modal-header">
            <div className="resume-modal-icon">⏳</div>

            <div className="resume-modal-heading">
              <h3>Resume Booking?</h3>
              <p>You already have a pending booking in progress.</p>
            </div>
          </div>

          <div className="resume-modal-summary compact">
            <div className="resume-modal-grid">
              <div className="resume-info-item">
                <span className="resume-info-label">Service</span>
                <span className="resume-info-value">{serviceName}</span>
              </div>

              <div className="resume-info-item">
                <span className="resume-info-label">Category</span>
                <span className="resume-info-value">{categoryName}</span>
              </div>

              <div className="resume-info-item">
                <span className="resume-info-label">Variant</span>
                <span className="resume-info-value">{variantName}</span>
              </div>

              <div className="resume-info-item">
                <span className="resume-info-label">Date</span>
                <span className="resume-info-value">
                  {booking.booking_date
                    ? parseLocalDate(booking.booking_date)?.toLocaleDateString(
                        "en-PH",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )
                    : "N/A"}
                </span>
              </div>

              <div className="resume-info-item">
                <span className="resume-info-label">Time</span>
                <span className="resume-info-value">
                  {formatDisplayTime(booking.booking_time)}
                </span>
              </div>

              <div className="resume-info-item">
                <span className="resume-info-label">Downpayment</span>
                <span className="resume-info-value">
                  {formatCurrency(booking.downpayment)}
                </span>
              </div>
            </div>
          </div>

          <div className="resume-urgency-box">
            <span className="resume-urgency-icon">⏰</span>
            <div>
              <strong>30-minute payment window</strong>
              <p>Upload your payment proof to secure this slot.</p>
            </div>
          </div>

          <div className="resume-modal-actions">
            <button
              type="button"
              className="btn btn-outline premium resume-btn-secondary"
              onClick={handleStartNew}
            >
              Start New Booking
            </button>

            <button
              type="button"
              className="btn btn-primary premium resume-btn-primary"
              onClick={handleResume}
            >
              Resume Booking
            </button>
          </div>
        </div>
      </div>,
      document.body,
    );
  };

  const TermsModal = () => {
    if (!showTermsModal) return null;

    return createPortal(
      <div
        className="modal-overlay"
        onClick={closeTermsModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
      >
        <div
          className="modal-card terms-modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="terms-modal-header">
            <div>
              <h3 id="terms-modal-title" className="modal-card-title">
                Terms & Conditions
              </h3>
              <p className="terms-modal-subtitle">
                Please review the policies below before proceeding to payment.
              </p>
            </div>
          </div>

          {policiesLoading ? (
            <div className="terms-loading-state">
              <div className="spinner premium"></div>
              <p>Loading policies...</p>
            </div>
          ) : policiesError ? (
            <div className="terms-error-state">
              <p>Unable to load policies right now.</p>
            </div>
          ) : policies.length === 0 ? (
            <div className="terms-empty-state">
              <p>No active policies available.</p>
            </div>
          ) : (
            <>
              <div className="terms-scroll-hint">
                Please scroll to the bottom to enable the agreement checkbox.
              </div>

              <div className="terms-content" onScroll={handleTermsScroll}>
                {policies.map((policy, index) => (
                  <div key={policy.id || index} className="terms-policy-item">
                    <h4 className="terms-policy-title">
                      {policy.title || `Policy ${index + 1}`}
                    </h4>

                    <div className="terms-policy-body">
                      {String(policy.content || policy.description || "")
                        .split("\n")
                        .filter(Boolean)
                        .map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className={`terms-bottom-status ${
                  hasScrolledTermsToBottom ? "done" : ""
                }`}
              >
                {hasScrolledTermsToBottom
                  ? "✓ You have reached the end of the Terms & Conditions."
                  : "Scroll to the bottom to continue."}
              </div>
            </>
          )}

          <div className="modal-card-actions">
            <button
              type="button"
              className="btn btn-primary premium"
              onClick={closeTermsModal}
            >
              Close
            </button>
          </div>
        </div>
      </div>,
      document.body,
    );
  };

  const PremiumProgressBar = () => {
    const steps = [
      { number: 1, label: "Service", icon: "🎨" },
      { number: 2, label: "Schedule", icon: "📅" },
      { number: 3, label: "Details", icon: "📝" },
      { number: 4, label: "Payment", icon: "💳" },
      { number: 5, label: "Done", icon: "✅" },
    ];

    const currentStep = steps.find((s) => s.number === step);

    return (
      <div className="premium-progress">
        <div className="progress-topline">
          <div className="progress-meta">
            <span className="progress-kicker">Booking Progress</span>
            <h3 className="progress-current">
              Step {step} of {steps.length}: {currentStep?.label}
            </h3>
          </div>

          <div className="progress-pill">
            {Math.round((step / steps.length) * 100)}%
          </div>
        </div>

        <div className="progress-track">
          <div
            className="progress-track-fill"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>

        <div className="progress-steps progress-steps-5">
          {steps.map((item) => (
            <div
              key={item.number}
              className={`progress-step ${
                step > item.number ? "completed" : ""
              } ${step === item.number ? "active" : ""}`}
            >
              <div className="step-indicator">
                {step > item.number ? (
                  <span className="step-check">✓</span>
                ) : (
                  <span className="step-icon">{item.icon}</span>
                )}
                <span className="step-number">{item.number}</span>
              </div>

              <div className="step-label">{item.label}</div>

              {item.number < steps.length && (
                <div className="step-connector"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const openImageViewer = useCallback((images = [], index = 0) => {
    setImageViewer({
      open: true,
      images,
      index,
    });
  }, []);

  const closeImageViewer = useCallback(() => {
    setImageViewer({
      open: false,
      images: [],
      index: 0,
    });
  }, []);

  const goToPrevImage = useCallback(() => {
    setImageViewer((prev) => ({
      ...prev,
      index: prev.index === 0 ? prev.images.length - 1 : prev.index - 1,
    }));
  }, []);

  const goToNextImage = useCallback(() => {
    setImageViewer((prev) => ({
      ...prev,
      index: prev.index === prev.images.length - 1 ? 0 : prev.index + 1,
    }));
  }, []);

  /* ===============================
     STEP 1
  =============================== */
  const renderServiceSelection = () => {
    if (fetchingServices) {
      return (
        <div className="premium-step">
          <div className="step-header">
            <h1 className="step-title">Select Service</h1>
            <p className="step-subtitle">
              Choose the service you want to book.
            </p>
          </div>

          <div className="loading-state">
            <div className="spinner premium"></div>
            <p className="loading-text">Loading services...</p>
          </div>
        </div>
      );
    }

    if (servicesError && services.length === 0) {
      return (
        <div className="premium-step">
          <div className="step-header">
            <h1 className="step-title">Select Service</h1>
            <p className="step-subtitle">
              Choose the service you want to book.
            </p>
          </div>

          <div className="error-state">
            <div className="error-icon premium">⚠️</div>
            <h3 className="error-title">Failed to Load Services</h3>
            <p className="error-message">{servicesError}</p>
          </div>
        </div>
      );
    }

    if (!formData.service_id) {
      return (
        <div className="premium-step">
          <div className="step-header">
            <h1 className="step-title">Select Service</h1>
            <p className="step-subtitle">
              Choose the service you want to book.
            </p>
          </div>

          {services.length === 0 ? (
            <div className="empty-state premium">
              <div className="empty-icon">📭</div>
              <h3 className="empty-title">No Services Available</h3>
              <p className="empty-description">
                There are no services available at the moment.
              </p>
            </div>
          ) : (
            <div className="services-grid premium">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  className={`service-card premium service-card-button ${
                    formData.service_id === service.id ? "selected" : ""
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div
                    className="service-image premium"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openImageViewer(service.images, 0);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <img
                      src={service.image}
                      alt={service.name}
                      loading="lazy"
                      className="clickable-preview-image"
                      onError={(e) => {
                        e.currentTarget.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(
                          service.name,
                        )}`;
                      }}
                    />

                    <div className="service-overlay premium">
                      <span className="select-label">Preview Images</span>
                    </div>
                  </div>

                  <div className="service-content premium">
                    <div className="service-header">
                      <h3>{service.name}</h3>
                      <span className="service-badge premium">Available</span>
                    </div>

                    <p className="service-description premium">
                      {service.description}
                    </p>

                    <div className="service-meta premium">
                      <div className="meta-item">
                        <span className="meta-icon">⏱️</span>
                        <span>{getReadableDuration(service.duration)}</span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-icon">🏷️</span>
                        <span>
                          {service.service_categories?.length || 0} categor
                          {service.service_categories?.length !== 1
                            ? "ies"
                            : "y"}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="step-footer premium">
            <button
              type="button"
              className="btn btn-secondary premium"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>

            <div className="step-info">
              <span className="info-text">
                Showing {services.length} service
                {services.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (!formData.service_category_id) {
      return (
        <div className="premium-step">
          <div className="step-header with-back">
            <button
              type="button"
              className="back-btn premium"
              onClick={() => {
                resetBookingFlow();
                setFormData((prev) => ({ ...prev, service_id: "" }));
                setSelectedCategory(null);
              }}
            >
              <span className="back-icon">←</span> Back to Services
            </button>

            <div>
              <h1 className="step-title">Select Category</h1>
              <p className="step-subtitle">
                Choose a category for <strong>{selectedService?.name}</strong>.
              </p>
            </div>
          </div>

          <div className="categories-container premium">
            {selectedService?.service_categories?.map((category) => {
              const prices =
                category.service_variants?.map((v) => Number(v.price || 0)) ||
                [];
              const minPrice = prices.length ? Math.min(...prices) : 0;
              const maxPrice = prices.length ? Math.max(...prices) : 0;

              return (
                <button
                  key={category.id}
                  type="button"
                  className={`category-card premium category-card-button ${
                    selectedCategory?.id === category.id ? "selected" : ""
                  }`}
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="category-content">
                    <h3>{category.name}</h3>

                    <div className="category-meta premium">
                      <div className="meta-item">
                        <span className="meta-icon">📦</span>
                        <span>
                          {category.service_variants?.length || 0} variant
                          {category.service_variants?.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="meta-item price-range">
                        <span className="meta-icon">💰</span>
                        <span>
                          {formatCurrency(minPrice)} -{" "}
                          {formatCurrency(maxPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="category-action">
                    <span className="action-icon">→</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="step-footer premium">
            <button
              type="button"
              className="btn btn-secondary premium"
              onClick={() => {
                resetBookingFlow();
                setFormData((prev) => ({ ...prev, service_id: "" }));
                setSelectedCategory(null);
              }}
            >
              Back to Services
            </button>
          </div>
        </div>
      );
    }

    if (!formData.service_variant_id) {
      return (
        <div className="premium-step">
          <div className="step-header with-back">
            <button
              type="button"
              className="back-btn premium"
              onClick={() => {
                resetBookingFlow();
                setFormData((prev) => ({ ...prev, service_category_id: "" }));
                setSelectedCategory(null);
              }}
            >
              <span className="back-icon">←</span> Back to Categories
            </button>

            <div>
              <h1 className="step-title">Select Variant</h1>
              <p className="step-subtitle">
                Choose a specific variant for{" "}
                <strong>{selectedCategory?.name}</strong>.
              </p>
            </div>
          </div>

          <div className="variants-container premium">
            {selectedCategory?.service_variants?.map((variant) => {
              const hasEstimate =
                variant.estimate_min != null && variant.estimate_max != null;

              return (
                <button
                  key={variant.id}
                  type="button"
                  className={`variant-card premium variant-card-button ${
                    selectedVariant?.id === variant.id ? "selected" : ""
                  }`}
                  onClick={() => handleVariantSelect(variant)}
                >
                  <div className="variant-content">
                    <div className="variant-header">
                      <h3>{variant.body_part}</h3>
                      {variant.size ? (
                        <span className="variant-size">{variant.size}</span>
                      ) : null}
                    </div>

                    <div className="variant-details premium">
                      <div className="price-section">
                        <div className="price-main">
                          {formatCurrency(variant.price)}
                        </div>

                        {hasEstimate && (
                          <div className="price-sub">
                            Estimate:{" "}
                            {formatEstimateRange(
                              variant.estimate_min,
                              variant.estimate_max,
                            )}
                          </div>
                        )}

                        <div className="price-sub">
                          Downpayment: {formatCurrency(variant.downpayment)}
                        </div>
                      </div>

                      <div className="duration-badge">
                        <span className="duration-icon">⏱️</span>
                        <span>
                          {getReadableDuration(selectedService?.duration)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="select-btn premium">
                    Select <span className="select-icon">→</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="step-footer premium">
            <button
              type="button"
              className="btn btn-secondary premium"
              onClick={() => {
                resetBookingFlow();
                setFormData((prev) => ({ ...prev, service_category_id: "" }));
                setSelectedCategory(null);
              }}
            >
              Back to Categories
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  /* ===============================
     STEP 2
  =============================== */
  const renderDateTimeSelection = () => {
    return (
      <div className="premium-step">
        <div className="step-header with-back">
          <button
            type="button"
            className="back-btn premium"
            onClick={() => {
              setStep(1);
              resetBookingFlow();
              setFormData((prev) => ({ ...prev, service_variant_id: "" }));
              setSelectedVariant(null);
            }}
          >
            <span className="back-icon">←</span> Back to Variants
          </button>

          <div>
            <h1 className="step-title">Select Date & Time</h1>
            <p className="step-subtitle">Choose your preferred schedule.</p>
          </div>
        </div>

        <div className="selected-service-summary premium compact-summary">
          <div className="summary-header">
            <h4>Selected Service</h4>
            <div className="price-tag">
              {formatCurrency(formData.total_price)}
            </div>
          </div>

          <div className="summary-details">
            <div className="detail-item">
              <span className="detail-label">Service</span>
              <span className="detail-value">{selectedService?.name}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Variant</span>
              <span className="detail-value">
                {selectedVariantObj?.body_part}
                {selectedVariantObj?.size
                  ? ` (${selectedVariantObj.size})`
                  : ""}
              </span>
            </div>

            {selectedVariantObj?.estimate_min != null &&
              selectedVariantObj?.estimate_max != null && (
                <div className="detail-item">
                  <span className="detail-label">Estimate</span>
                  <span className="detail-value">
                    {formatEstimateRange(
                      selectedVariantObj.estimate_min,
                      selectedVariantObj.estimate_max,
                    )}
                  </span>
                </div>
              )}

            <div className="detail-item">
              <span className="detail-label">Downpayment</span>
              <span className="detail-value highlight">
                {formatCurrency(formData.downpayment)}
              </span>
            </div>
          </div>
        </div>

        <div className="datetime-container premium">
          <div className="calendar-section premium">
            <div className="calendar-header premium">
              <div className="calendar-navigation">
                <button
                  type="button"
                  className="nav-btn premium"
                  onClick={prevMonth}
                >
                  <span className="nav-icon">←</span>
                  <span>Previous</span>
                </button>

                <div className="calendar-title">
                  <h3>
                    {MONTH_NAMES[currentMonth.getMonth()]}{" "}
                    {currentMonth.getFullYear()}
                  </h3>
                  <button
                    type="button"
                    className="today-btn premium"
                    onClick={goToToday}
                  >
                    Today
                  </button>
                </div>

                <button
                  type="button"
                  className="nav-btn premium"
                  onClick={nextMonth}
                >
                  <span>Next</span>
                  <span className="nav-icon">→</span>
                </button>
              </div>

              <div className="weekdays premium">
                {DAY_NAMES.map((day) => (
                  <div key={day} className="weekday">
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {monthlyAvailabilityFetching ? (
              <div className="calendar-loading premium">
                <div className="spinner small"></div>
                <p>Loading available dates...</p>
              </div>
            ) : (
              <>
                <div className="calendar-grid premium">
                  {calendarDates.map((dateObj, index) => {
                    const isToday =
                      new Date().toDateString() === dateObj.date.toDateString();

                    return (
                      <div
                        key={`${dateObj.dateStr}-${index}`}
                        className={`calendar-day premium ${
                          dateObj.isCurrentMonth ? "" : "other-month"
                        } ${dateObj.isPast ? "past" : ""} ${
                          dateObj.isBlocked ? "blocked" : "available"
                        } ${dateObj.isSelected ? "selected" : ""} ${
                          isToday ? "today" : ""
                        }`}
                        onClick={() =>
                          !dateObj.isBlocked && handleDateSelect(dateObj.date)
                        }
                        title={
                          dateObj.isBlocked
                            ? "Not available"
                            : "Click to select"
                        }
                      >
                        <div className="day-content premium">
                          <span className="day-number">
                            {dateObj.date.getDate()}
                          </span>
                          {isToday && (
                            <span className="today-label">Today</span>
                          )}
                        </div>

                        {!dateObj.isCurrentMonth && (
                          <div className="month-indicator">
                            {MONTH_NAMES[dateObj.date.getMonth()].slice(0, 3)}
                          </div>
                        )}

                        {dateObj.isAvailable && !dateObj.isPast && (
                          <div className="availability-dot"></div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="calendar-footer premium">
                  <div className="legend">
                    <div className="legend-item">
                      <div className="legend-dot available"></div>
                      <span>Available</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot selected"></div>
                      <span>Selected</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot blocked"></div>
                      <span>Booked</span>
                    </div>
                  </div>

                  <div className="availability-count">
                    {getAvailableDatesCount()} available date
                    {getAvailableDatesCount() !== 1 ? "s" : ""} this month
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="timeslots-section premium">
            <div className="timeslots-header">
              <h3>Available Time Slots</h3>

              {selectedDate ? (
                <div className="selected-date premium">
                  <span className="date-icon">📅</span>
                  <span className="date-text">
                    {parseLocalDate(selectedDate)?.toLocaleDateString("en-PH", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ) : (
                <div className="select-date-prompt">
                  <div className="prompt-icon">👆</div>
                  <p>Select a date from the calendar.</p>
                </div>
              )}
            </div>

            {selectedDate ? (
              <>
                {availableSlotsFetching ? (
                  <div className="timeslots-loading">
                    <div className="spinner small"></div>
                    <p>Loading available slots...</p>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="no-slots premium">
                    <div className="no-slots-icon">📅</div>
                    <h4>No Available Slots</h4>
                    <p>All time slots are booked for this date.</p>
                  </div>
                ) : (
                  <>
                    <div className="timeslots-grid premium">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.slotId || slot.value}
                          type="button"
                          className={`timeslot-btn premium ${
                            !slot.available ? "disabled" : ""
                          } ${slot.isSelected ? "selected" : ""}`}
                          onClick={() =>
                            slot.available && handleTimeSelect(slot.value)
                          }
                          disabled={!slot.available}
                          title={
                            !slot.available
                              ? "This slot is booked"
                              : "Select time slot"
                          }
                        >
                          <span className="slot-time">{slot.display}</span>
                          <span className="slot-status">
                            {!slot.available ? (
                              <span className="status-booked">Booked</span>
                            ) : slot.isSelected ? (
                              <span className="status-selected">Selected</span>
                            ) : (
                              <span className="status-available">
                                Available
                              </span>
                            )}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="timeslots-info premium">
                      <div className="info-row">
                        <span className="info-label">Available slots</span>
                        <span className="info-value">
                          {timeSlots.filter((s) => s.available).length} of{" "}
                          {timeSlots.length}
                        </span>
                      </div>

                      <div className="info-row">
                        <span className="info-label">Duration</span>
                        <span className="info-value">
                          {getReadableDuration(selectedService?.duration)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="timeslots-empty">
                <div className="empty-state premium">
                  <div className="empty-icon">⏰</div>
                  <h4>Select a Date First</h4>
                  <p>Choose an available date to view time slots.</p>
                  <div className="tip">
                    <span className="tip-icon">💡</span>
                    <span>Green dots indicate available dates.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="step-footer premium">
          <button
            type="button"
            className="btn btn-secondary premium"
            onClick={() => {
              setStep(1);
              resetBookingFlow();
              setFormData((prev) => ({ ...prev, service_variant_id: "" }));
              setSelectedVariant(null);
            }}
          >
            Back to Variants
          </button>

          <button
            type="button"
            className="btn btn-primary premium"
            onClick={() => {
              if (!validateForm(2)) return;
              setStep(3);
            }}
            disabled={!formData.booking_date || !formData.booking_time}
          >
            Continue to Details
          </button>
        </div>
      </div>
    );
  };

  /* ===============================
     STEP 3
  =============================== */
  const renderDetailsAndReview = () => (
    <div className="premium-step">
      <div className="step-header with-back">
        <button
          type="button"
          className="back-btn premium"
          onClick={() => goBackToEditableStep(2)}
        >
          <span className="back-icon">←</span> Back to Schedule
        </button>

        <div>
          <h1 className="step-title">Your Information</h1>
          <p className="step-subtitle">
            Fill in your details and review everything before proceeding to
            payment.
          </p>
        </div>
      </div>

      <div className="step-3-layout">
        <div className="customer-form premium">
          <div className="form-section">
            <h4>Contact Information</h4>

            <div className="form-group premium">
              <label className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="form-input premium"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-row premium">
              <div className="form-group premium">
                <label className="form-label">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input premium"
                  placeholder="your.email@example.com"
                  required
                />
                <div className="form-hint premium">
                  Booking confirmation will be sent here.
                </div>
              </div>

              <div className="form-group premium">
                <label className="form-label">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input premium"
                  placeholder="0912 345 6789"
                  required
                />
              </div>
            </div>

            <div className="form-group premium">
              <label className="form-label">
                Facebook Profile Link{" "}
                <span className="optional">(Optional)</span>
              </label>
              <input
                type="url"
                name="facebook_link"
                value={formData.facebook_link}
                onChange={handleInputChange}
                className="form-input premium"
                placeholder="https://facebook.com/yourprofile"
              />
            </div>

            <div className="form-group premium">
              <label className="form-label">
                Additional Notes <span className="optional">(Optional)</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-textarea premium"
                placeholder="Any special requests, instructions, or questions..."
                rows="4"
              />
            </div>
          </div>
        </div>

        <div
          className={`review-panel compact ${
            reviewPanelCollapsed ? "collapsed" : "expanded"
          }`}
        >
          <button
            type="button"
            className="review-panel-toggle"
            onClick={() => setReviewPanelCollapsed((prev) => !prev)}
          >
            <div className="review-panel-toggle-main">
              <h4>Review Summary</h4>
              <p>
                {selectedService?.name || "No service selected"} •{" "}
                {formData.booking_date || "No date"} •{" "}
                {formatDisplayTime(formData.booking_time)}
              </p>
            </div>

            <div className="review-panel-toggle-side">
              <span className="review-chip">Editable</span>
              <span
                className={`review-panel-arrow ${
                  reviewPanelCollapsed ? "" : "open"
                }`}
              >
                ▾
              </span>
            </div>
          </button>

          {!reviewPanelCollapsed && (
            <>
              <div className="review-accordion">
                {reviewSections.map((section) => (
                  <div key={section.key} className="review-accordion-item">
                    <button
                      type="button"
                      className="review-accordion-trigger"
                      onClick={() => toggleReviewSection(section.key)}
                    >
                      <div className="review-trigger-main">
                        <strong>{section.title}</strong>
                        <span>{section.summary}</span>
                      </div>
                      <span className="review-trigger-icon">
                        {collapsedReview[section.key] ? "+" : "−"}
                      </span>
                    </button>

                    {!collapsedReview[section.key] && (
                      <div className="review-accordion-content">
                        {section.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="info-notice premium compact">
                <div className="notice-header">
                  <span className="notice-icon">📋</span>
                  <h5>Before you proceed</h5>
                </div>

                <ul className="notice-list">
                  <li>This is your last editable step.</li>
                  <li>Proceeding to payment will create your booking.</li>
                  <li>You will have 30 minutes to upload proof of payment.</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="terms-consent-card premium">
        <div className="terms-consent-header">
          <div>
            <h4>Terms & Conditions</h4>
            <p>
              You must open, review, and agree to the Terms & Conditions before
              proceeding to payment.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline premium terms-view-btn"
            onClick={openTermsModal}
          >
            {hasOpenedTerms ? "Review Terms Again" : "View Terms & Conditions"}
          </button>
        </div>

        <div className="terms-consent-check">
          <label className="terms-checkbox-row">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              disabled={!hasOpenedTerms || !hasScrolledTermsToBottom}
            />
            <span>I have read and agree to the Terms & Conditions.</span>
          </label>
        </div>

        <div className="terms-status-list">
          <div className={`terms-status-item ${hasOpenedTerms ? "done" : ""}`}>
            <span className="terms-status-icon">
              {hasOpenedTerms ? "✓" : "•"}
            </span>
            <span>Opened Terms & Conditions</span>
          </div>

          <div
            className={`terms-status-item ${
              hasScrolledTermsToBottom ? "done" : ""
            }`}
          >
            <span className="terms-status-icon">
              {hasScrolledTermsToBottom ? "✓" : "•"}
            </span>
            <span>Scrolled through the terms</span>
          </div>

          <div className={`terms-status-item ${acceptedTerms ? "done" : ""}`}>
            <span className="terms-status-icon">
              {acceptedTerms ? "✓" : "•"}
            </span>
            <span>Agreement checkbox checked</span>
          </div>
        </div>
      </div>

      <div className="step-footer premium">
        <button
          type="button"
          className="btn btn-secondary premium"
          onClick={() => goBackToEditableStep(2)}
        >
          Back to Schedule
        </button>

        <button
          type="button"
          className="btn btn-primary premium"
          onClick={handleProceedToPayment}
          disabled={
            loading ||
            !hasOpenedTerms ||
            !hasScrolledTermsToBottom ||
            !acceptedTerms
          }
        >
          {loading ? (
            <>
              <span className="spinner small"></span>
              Preparing Payment...
            </>
          ) : (
            "Proceed to Payment"
          )}
        </button>
      </div>
    </div>
  );

  /* ===============================
     STEP 4
  =============================== */
  const renderPaymentInstructions = () => {
    const countdown = formatCountdown(timeLeftMs);

    const expiryLabel = isExpiredLocal
      ? "Expired"
      : countdown
        ? `${countdown} remaining`
        : "30 minutes";

    const hasUploadedProof =
      paymentProofUploaded ||
      !!paymentSignedUrl ||
      !!bookingPreview?.payment?.proof_url ||
      !!bookingPreview?.payment?.payment_proof_url ||
      !!bookingPreview?.payment?.signed_url ||
      !!bookingPreview?.payment?.signedUrl;

    return (
      <div className="premium-step">
        <div className="step-header with-back">
          <button
            type="button"
            className="back-btn premium"
            onClick={() => setStep(3)}
            disabled={isLockedAfterBookingCreated}
            title="Details are now locked after booking creation"
          >
            <span className="back-icon">←</span> Back to Details
          </button>

          <div>
            <h1 className="step-title">Payment</h1>
            <p className="step-subtitle">
              Your booking is now created. Upload payment proof to continue.
            </p>
          </div>
        </div>

        <div
          className={`status-banner warning premium ${
            isExpiredLocal ? "error" : ""
          }`}
        >
          <div className="status-content">
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span className="status-text">PENDING PAYMENT</span>
            </div>

            <p className="status-message">
              Upload payment proof within <strong>{expiryLabel}</strong> to
              secure your slot.
            </p>
          </div>
        </div>

        {isLockedAfterBookingCreated && (
          <div className="flow-lock-banner premium">
            <div className="flow-lock-icon">🔒</div>
            <div className="flow-lock-content">
              <strong>Booking details are locked</strong>
              <p>
                Service, schedule, and customer details can no longer be edited
                after booking creation.
              </p>
            </div>
          </div>
        )}

        {isExpiredLocal && (
          <div className="error-state" style={{ marginTop: 12 }}>
            <div className="error-icon premium">⛔</div>
            <h3 className="error-title">This booking has expired</h3>
            <p className="error-message">
              Please start a new booking to continue.
            </p>
            <button
              type="button"
              className="btn btn-primary premium"
              onClick={() => {
                setModal({
                  open: true,
                  title: "Booking Expired",
                  message:
                    "Your 30-minute payment window ended. Start a new booking to continue.",
                  tone: "danger",
                  actions: [
                    {
                      label: "Start New Booking",
                      variant: "btn-primary",
                      onClick: () => {
                        setModal((prev) => ({ ...prev, open: false }));
                        hardRestart();
                      },
                    },
                  ],
                });
              }}
            >
              Start New Booking
            </button>
          </div>
        )}

        <div className="payment-container premium">
          <div className="payment-qr-section">
            <div className="qr-card premium">
              <div className="qr-header">
                <h4>Pay via GCash</h4>
                <div className="payment-amount">
                  {formatCurrency(formData.downpayment)}
                </div>
              </div>

              <div className="qr-container">
                <div className="qr-placeholder premium">
                  <div className="qr-mock">
                    <img src={QR} alt="GCash QR Code" className="qr-image" />
                  </div>

                  <div className="qr-hint">
                    <span className="hint-icon">💰</span>
                    Send {formatCurrency(formData.downpayment)} to:
                    <br />
                    <strong>AL****H B.</strong>
                    <strong>0918 578 **</strong>
                    <br />
                    Reference: <strong>BOOK-{bookingId}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="payment-details-card premium">
              <h4>Payment Details</h4>

              <div className="details-grid premium">
                <div className="detail-row">
                  <span className="detail-label">Booking ID</span>
                  <span className="detail-value code">#{bookingId}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Reference</span>
                  <span className="detail-value code">BOOK-{bookingId}</span>
                </div>

                <div className="detail-row highlight">
                  <span className="detail-label">Amount</span>
                  <span className="detail-value amount">
                    {formatCurrency(formData.downpayment)}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">GCash Number</span>
                  <span className="detail-value">0918 578 **</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Expires</span>
                  <span className="detail-value warning">{expiryLabel}</span>
                </div>
              </div>

              {paymentSignedUrl && (
                <div className="form-hint premium" style={{ marginTop: 10 }}>
                  Proof link generated ✓
                </div>
              )}
            </div>
          </div>

          <div className="upload-section premium">
            <div className="upload-header">
              <h4>Upload Proof of Payment</h4>
              <p className="upload-subtitle">
                Upload your screenshot or PDF receipt.
              </p>
            </div>

            <div className="upload-area premium">
              <input
                ref={paymentProofInputRef}
                type="file"
                id="payment-proof"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setSelectedProofFile(file);

                  setProofPreviewUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);

                    if (file && file.type.startsWith("image/")) {
                      return URL.createObjectURL(file);
                    }

                    return null;
                  });
                }}
                disabled={uploading || hasUploadedProof || isExpiredLocal}
                className="upload-input"
              />

              <label
                htmlFor="payment-proof"
                className={`upload-dropzone premium ${
                  hasUploadedProof ? "uploaded" : ""
                }`}
              >
                {uploading ? (
                  <div className="upload-state">
                    <div className="spinner"></div>
                    <p>Uploading...</p>
                  </div>
                ) : hasUploadedProof ? (
                  <div className="upload-state success">
                    <span className="upload-icon">✓</span>
                    <div>
                      <p className="upload-title">Payment Proof Uploaded</p>
                      <p className="upload-sub">Ready for confirmation</p>
                    </div>
                  </div>
                ) : (
                  <div className="upload-state">
                    <span className="upload-icon">📎</span>
                    <div>
                      <p className="upload-title">Click to upload file</p>
                      <p className="upload-sub">PNG, JPG, or PDF (Max 5MB)</p>
                    </div>
                  </div>
                )}
              </label>

              {selectedProofFile &&
                selectedProofFile.type === "application/pdf" && (
                  <div className="form-hint premium" style={{ marginTop: 10 }}>
                    PDF selected — preview is not available.
                  </div>
                )}

              {proofPreviewUrl && (
                <div className="proof-preview-card">
                  <p className="form-hint premium">Preview:</p>
                  <img
                    src={proofPreviewUrl}
                    alt="Payment Proof Preview"
                    className="proof-preview-image"
                  />
                </div>
              )}

              {selectedProofFile && !hasUploadedProof && (
                <div className="form-hint premium" style={{ marginTop: 10 }}>
                  Selected: <strong>{selectedProofFile.name}</strong>
                </div>
              )}

              <button
                type="button"
                className="btn btn-outline premium upload-clear-btn"
                onClick={resetProofSelection}
                disabled={uploading || isExpiredLocal}
              >
                Clear Selected File
              </button>
            </div>

            <div className="upload-tips premium">
              <h5>📸 Make sure your screenshot shows:</h5>
              <ul className="tips-list">
                <li>Amount paid ({formatCurrency(formData.downpayment)})</li>
                <li>Reference number (BOOK-{bookingId})</li>
                <li>Date and time of payment</li>
                <li>Recipient name or number</li>
              </ul>
            </div>
          </div>
        </div>

        {confirmationError && (
          <div className={`error-alert premium ${confirmationError.type}`}>
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <h5>Confirmation Failed</h5>
              <p>{confirmationError.message}</p>

              {confirmationError.retry && (
                <button
                  type="button"
                  className="btn btn-small btn-primary premium"
                  onClick={retryConfirmation}
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}

        <div className="important-note premium">
          <div className="note-icon">⚠️</div>
          <div className="note-content">
            Your slot is <span className="warning-text">not fully secured</span>{" "}
            until you confirm the booking after uploading proof.
          </div>
        </div>

        <div className="step-footer premium">
          <button
            type="button"
            className="btn btn-secondary premium"
            disabled
            title="Details are locked after booking creation"
          >
            Back Locked
          </button>

          <button
            type="button"
            className="btn btn-primary premium"
            onClick={handleConfirmWithUpload}
            disabled={
              loading ||
              uploading ||
              !bookingId ||
              isExpiredLocal ||
              (!hasUploadedProof && !selectedProofFile)
            }
          >
            {loading || uploading ? (
              <>
                <span className="spinner small"></span>
                Processing...
              </>
            ) : (
              "Confirm Booking"
            )}
          </button>
        </div>
      </div>
    );
  };

  /* ===============================
     STEP 5
  =============================== */
  const renderConfirmation = () => {
    const status = bookingPreview?.status || "pending_approval";

    const isApproved = status === "approved";
    const isCompleted = status === "completed";

    const title = isCompleted
      ? "Booking Completed!"
      : isApproved
        ? "Booking Approved!"
        : "Booking Submitted!";

    const subtitle = isCompleted
      ? "Tapos na ang appointment mo ✅"
      : isApproved
        ? "Approved na ang appointment mo ✅"
        : "Naka-submit na ang booking mo at for approval na 🕒";

    const statusLabel = isCompleted
      ? "COMPLETED"
      : isApproved
        ? "APPROVED"
        : "PENDING APPROVAL";

    const paymentText =
      isApproved || isCompleted
        ? "Payment Verified ✓"
        : "Payment proof submitted (For verification)";

    const slotText =
      isApproved || isCompleted
        ? "Slot Reserved ✓"
        : "Slot reserved (Pending approval)";

    const statusClass = isApproved || isCompleted ? "success" : "pending";

    const dateText = formData.booking_date
      ? parseLocalDate(formData.booking_date)?.toLocaleDateString("en-PH", {
          month: "short",
          day: "numeric",
        })
      : "N/A";

    const timeText = formatDisplayTime(formData.booking_time);

    return (
      <div className="premium-step confirmation-step">
        <div className="confirmation-header premium">
          <div className="confirmation-icon">
            <span className="icon-check">✓</span>
          </div>

          <h1 className="confirmation-title">{title}</h1>
          <p className="confirmation-subtitle">{subtitle}</p>
        </div>

        <div className="confirmation-content premium">
          <div className={`confirmation-card ${statusClass} premium`}>
            <div className="card-header">
              <h4>Booking Details</h4>
              <div className="booking-id">#{bookingId}</div>
            </div>

            <div className="card-content">
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className={`detail-value status ${statusClass}`}>
                  {statusLabel}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Service</span>
                <span className="detail-value">
                  {selectedService?.name || "N/A"}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Category</span>
                <span className="detail-value">
                  {selectedCategoryObj?.name || "N/A"}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Variant</span>
                <span className="detail-value">
                  {selectedVariantObj?.body_part
                    ? `${selectedVariantObj.body_part}${
                        selectedVariantObj.size
                          ? ` (${selectedVariantObj.size})`
                          : ""
                      }`
                    : "N/A"}
                </span>
              </div>

              {selectedVariantObj?.estimate_min != null &&
                selectedVariantObj?.estimate_max != null && (
                  <div className="detail-item">
                    <span className="detail-label">Estimate</span>
                    <span className="detail-value">
                      {formatEstimateRange(
                        selectedVariantObj.estimate_min,
                        selectedVariantObj.estimate_max,
                      )}
                    </span>
                  </div>
                )}

              <div className="detail-item">
                <span className="detail-label">Date & Time</span>
                <span className="detail-value">
                  {dateText} at {timeText}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Payment</span>
                <span className={`detail-value status ${statusClass}`}>
                  {paymentText}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Slot Status</span>
                <span className={`detail-value status ${statusClass}`}>
                  {slotText}
                </span>
              </div>
            </div>
          </div>

          <div className="next-steps-card premium">
            <h4>📝 What happens next?</h4>
            <ol className="steps-list">
              {isApproved || isCompleted ? (
                <>
                  <li>Approved na ang booking mo ✅</li>
                  <li>Makaka-receive ka ng confirmation sa email</li>
                  <li>Pwede mong i-check status anytime gamit email</li>
                  <li>Message or call us if may questions</li>
                </>
              ) : (
                <>
                  <li>Veverify namin ang payment proof within 24 hours</li>
                  <li>Makaka-receive ka ng email once approved</li>
                  <li>Pwede mong i-check status anytime gamit email</li>
                  <li>Message or call us if may questions</li>
                </>
              )}
            </ol>
          </div>

          <div className="contact-card premium">
            <h4>📞 Need Help?</h4>
            <div className="contact-info premium">
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span>booking@yourbusiness.com</span>
              </div>

              <div className="contact-item">
                <span className="contact-icon">📱</span>
                <span>(02) 1234-5678</span>
              </div>

              <div className="contact-item">
                <span className="contact-icon">👥</span>
                <span>@yourbusinesspage</span>
              </div>
            </div>
          </div>
        </div>

        <div className="step-footer premium">
          <button
            type="button"
            className="btn btn-primary premium"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>

          <button
            type="button"
            className="btn btn-outline premium"
            onClick={() =>
              (window.location.href = `/booking-history?email=${encodeURIComponent(
                bookingPreview?.customer_email ||
                  bookingPreview?.customers?.email ||
                  formData.email ||
                  "",
              )}`)
            }
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="booking-system-premium" id="booking">
      <Modal />
      <ResumeModal />
      <TermsModal />

      {imageViewer.open &&
        createPortal(
          <div className="image-viewer-overlay" onClick={closeImageViewer}>
            <div
              className="image-viewer-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="image-viewer-close"
                onClick={closeImageViewer}
              >
                ✕
              </button>

              {imageViewer.images.length > 1 && (
                <button
                  type="button"
                  className="image-viewer-nav image-viewer-prev"
                  onClick={goToPrevImage}
                >
                  ‹
                </button>
              )}

              <img
                src={imageViewer.images[imageViewer.index]}
                alt="Service preview"
              />

              {imageViewer.images.length > 1 && (
                <button
                  type="button"
                  className="image-viewer-nav image-viewer-next"
                  onClick={goToNextImage}
                >
                  ›
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
      <div className="booking-header premium">
        <h1>Book an Appointment</h1>
        <p>Complete the steps below to secure your appointment.</p>
      </div>

      <PremiumProgressBar />

      <div className="booking-content premium">
        {step === 1 && renderServiceSelection()}
        {step === 2 && renderDateTimeSelection()}
        {step === 3 && renderDetailsAndReview()}
        {step === 4 && renderPaymentInstructions()}
        {step === 5 && renderConfirmation()}
      </div>
    </div>
  );
};

export default Booking;
