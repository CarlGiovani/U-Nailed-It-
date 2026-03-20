import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import "../styles/booking-system.css";

// DATE FORMATTER (YYYY-MM-DD)
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// SAFE DATE PARSING - FIXES TIMEZONE ISSUES
const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00");
};

// HELPER
const sameId = (a, b) => Number(a) === Number(b);

// ===============================
// RESUME BOOKING (localStorage)
// ===============================
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
  if (signedUrl)
    localStorage.setItem(LS_KEYS.paymentSignedUrl, String(signedUrl));
};

const clearActiveFlow = () => {
  Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k));
};

// ===============================
// TIME HELPERS - BULLETPROOF
// ===============================
const toMs = (isoOrNull) => {
  if (!isoOrNull) return null;

  if (typeof isoOrNull === "number") return isoOrNull;

  if (typeof isoOrNull === "string") {
    const num = Number(isoOrNull);
    if (!isNaN(num) && String(num) === isoOrNull.trim()) return num;

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

const Booking = ({ services: servicesProp = [] }) => {
  const navigate = useNavigate();

  // Step management
  const [step, setStep] = useState(1);

  // transformed services from parent prop
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
              is_active: variant.is_active,
            })) || [],
        })) || [],
    }));
  }, [servicesProp]);

  // Data states
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // Booking flow states
  const [bookingId, setBookingId] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [paymentSignedUrl, setPaymentSignedUrl] = useState(null);

  // Review/Confirmed booking data
  const [bookingPreview, setBookingPreview] = useState(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetchingServices, setFetchingServices] = useState(true);
  const [servicesError, setServicesError] = useState(null);
  const [fetchingAvailability, setFetchingAvailability] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [paymentProofUploaded, setPaymentProofUploaded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDates, setCalendarDates] = useState([]);
  const [monthlyAvailability, setMonthlyAvailability] = useState({});

  // selection objects
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // errors
  const [confirmationError, setConfirmationError] = useState(null);

  // Resume booking modal
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeBookingData, setResumeBookingData] = useState(null);
  const [resuming, setResuming] = useState(false);

  // payment image preview
  const [proofPreviewUrl, setProofPreviewUrl] = useState(null);
  const [selectedProofFile, setSelectedProofFile] = useState(null);

  // cleanup preview url
  useEffect(() => {
    return () => {
      if (proofPreviewUrl) URL.revokeObjectURL(proofPreviewUrl);
    };
  }, [proofPreviewUrl]);

  // service availability state from parent
  useEffect(() => {
    if (servicesProp?.length > 0) {
      setFetchingServices(false);
      setServicesError(null);
    } else {
      setFetchingServices(true);
    }
  }, [servicesProp]);

  // modal state
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    actions: [],
  });

  // lock body scroll when any modal is open
  useEffect(() => {
    const hasOpenModal = modal.open || showResumePrompt;

    if (!hasOpenModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [modal.open, showResumePrompt]);

  // close generic modal on Escape
  // close generic modal on Escape
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
  // countdown
  const [timeLeftMs, setTimeLeftMs] = useState(null);
  const [isExpiredLocal, setIsExpiredLocal] = useState(false);
  const expiryHandledRef = useRef(false);

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

  // ===============================
  // MODAL UTILITIES
  // ===============================
  const showAlert = useCallback((title, message, onConfirm = null) => {
    setModal({
      open: true,
      title,
      message,
      actions: [
        {
          label: "OK",
          variant: "btn-primary",
          onClick: () => {
            setModal((m) => ({ ...m, open: false }));
            if (onConfirm && typeof onConfirm === "function") {
              onConfirm();
            }
          },
        },
      ],
    });
  }, []);

  // ===============================
  // STEP GUARD
  // ===============================
  useEffect(() => {
    if (resuming) return;

    if (step === 4 && !bookingId) {
      console.warn("Invalid step 4: No bookingId, redirecting to step 1");
      setStep(1);
      return;
    }

    if (step === 5 && !bookingId) {
      console.warn("Invalid step 5: No bookingId, redirecting to step 4");
      setStep(4);
      return;
    }

    if (step === 6 && !bookingPreview) {
      console.warn("Invalid step 6: No bookingPreview, redirecting to step 1");
      setStep(1);
      return;
    }
  }, [step, bookingId, bookingPreview, resuming]);

  // ===============================
  // MAIN MODAL COMPONENT
  // ===============================
  const Modal = () => {
    if (!modal.open) return null;

    return (
      <div
        className="modal-overlay"
        onClick={() => {
          if (!modal.actions?.length) setModal((m) => ({ ...m, open: false }));
        }}
      >
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-card-header">
            <div className="modal-card-icon">⚠️</div>

            <div>
              <h3 className="modal-card-title">{modal.title}</h3>
              <div className="modal-card-message">{modal.message}</div>
            </div>
          </div>

          <div className="modal-card-actions">
            {(modal.actions || []).map((a, idx) => (
              <button
                type="button"
                key={idx}
                className={`btn ${a.variant || "btn-primary"} premium`}
                onClick={a.onClick}
              >
                {a.label}
              </button>
            ))}

            {!modal.actions?.length && (
              <button
                type="button"
                className="btn btn-primary premium"
                onClick={() => setModal((m) => ({ ...m, open: false }))}
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ===============================
  // RESUME BOOKING MODAL
  // ===============================
  const ResumeModal = () => {
    if (!showResumePrompt || !resumeBookingData) return null;

    const { booking, serviceInfo } = resumeBookingData;

    const formatDate = (dateStr) => {
      if (!dateStr) return "N/A";

      try {
        const date = parseLocalDate(dateStr);
        return date.toLocaleDateString("en-PH", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } catch {
        return dateStr;
      }
    };

    const formatTime = (timeStr) => {
      if (!timeStr) return "N/A";

      try {
        const [hours, minutes] = timeStr.split(":");
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

        return `${displayHour}:${minutes.padStart(2, "0")} ${ampm}`;
      } catch {
        return timeStr;
      }
    };

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

    return (
      <div
        className="resume-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-booking-title"
      >
        <div className="resume-modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="resume-modal-header">
            <div className="resume-modal-icon">⏳</div>

            <div className="resume-modal-heading">
              <h3 id="resume-booking-title">Resume Booking?</h3>
              <p>You already have a pending booking in progress.</p>
            </div>
          </div>

          <div className="resume-modal-summary">
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
                  {formatDate(booking.booking_date)}
                </span>
              </div>

              <div className="resume-info-item">
                <span className="resume-info-label">Time</span>
                <span className="resume-info-value">
                  {formatTime(booking.booking_time)}
                </span>
              </div>

              <div className="resume-info-item">
                <span className="resume-info-label">Downpayment</span>
                <span className="resume-info-value">
                  ₱{Number(booking.downpayment || 0).toLocaleString()}
                </span>
              </div>

              <div className="resume-info-item resume-info-item-full">
                <span className="resume-info-label">Status</span>
                <span className="resume-status-badge">
                  {booking.status?.replace("_", " ") || "pending payment"}
                </span>
              </div>
            </div>

            <div className="resume-urgency-box">
              <span className="resume-urgency-icon">⏰</span>
              <div>
                <strong>30-minute payment window</strong>
                <p>Upload your payment proof to secure this slot.</p>
              </div>
            </div>
          </div>

          <div className="resume-modal-copy">
            <p className="resume-modal-question">
              Would you like to continue with this booking or start a new one?
            </p>
            <p className="resume-modal-subcopy">
              Your progress has already been saved.
            </p>
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
      </div>
    );
  };
  // ===============================
  // RESET FUNCTIONS
  // ===============================
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

    clearActiveFlow();
  }, []);

  const hardRestart = useCallback(() => {
    resetBookingFlow();
    setStep(1);
    setSelectedDate("");
    setAvailableSlots([]);
    setMonthlyAvailability({});
    setSelectedCategory(null);
    setSelectedVariant(null);
    setResumeBookingData(null);

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

  // ===============================
  // RESUME ON PAGE LOAD
  // ===============================
  const checkAndResumeBooking = useCallback(async () => {
    const savedBookingId = localStorage.getItem(LS_KEYS.bookingId);
    if (!savedBookingId) return;

    setResuming(true);

    try {
      const booking = await getBookingById(savedBookingId);

      const finalStates = ["expired", "cancelled", "rejected", "completed"];
      if (finalStates.includes(booking.status)) {
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
            let category =
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

            let variant =
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
                ? { body_part: variant.body_part, size: variant.size }
                : null,
            };
          }
        }
      } catch (e) {
        console.warn("Could not fetch service details for resume:", e);
      }

      setResumeBookingData({ booking, serviceInfo });
      setBookingId(booking.id);

      const backendPaymentIntentId =
        booking.payment?.payment_intent_id || booking.payment_intent_id;

      const savedIntentId = localStorage.getItem(LS_KEYS.paymentIntentId);
      const savedSigned = localStorage.getItem(LS_KEYS.paymentSignedUrl);

      const hasProofFromStorage = !!savedSigned;

      if (backendPaymentIntentId) {
        setPaymentIntentId(backendPaymentIntentId);

        const hasProofBackend =
          !!booking.payment?.proof_url ||
          !!booking.payment?.payment_proof_url ||
          !!booking.payment?.signed_url ||
          !!booking.payment?.signedUrl;

        setPaymentProofUploaded(hasProofBackend || hasProofFromStorage);
      } else if (savedIntentId) {
        setPaymentIntentId(savedIntentId);
        setPaymentProofUploaded(hasProofFromStorage);
      }

      if (savedSigned) setPaymentSignedUrl(savedSigned);

      setBookingPreview(booking);

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
        setSelectedDate(formatLocalDate(localDate));
      }

      if (booking.status === "pending_payment") {
        setShowResumePrompt(true);
      } else if (
        booking.status === "pending_approval" ||
        booking.status === "approved"
      ) {
        setStep(6);
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

  // ===============================
  // RESUME BOOKING FUNCTION
  // ===============================
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

    if (status === "pending_approval" || status === "approved") {
      setStep(6);
      return;
    }

    setStep(1);
  }, [bookingPreview, paymentSignedUrl]);

  // ===============================
  // AUTO-MAP CATEGORY FROM VARIANT
  // ===============================
  useEffect(() => {
    if (!services.length) return;
    if (!formData.service_id) return;

    const service = services.find((s) => s.id === formData.service_id);
    if (!service) return;

    if (formData.service_category_id) {
      const cat = service.service_categories?.find(
        (c) => c.id === formData.service_category_id,
      );
      if (cat) setSelectedCategory(cat);
    }

    if (formData.service_variant_id && !formData.service_category_id) {
      const variantId = formData.service_variant_id;

      const foundCat = service.service_categories?.find((c) =>
        c.service_variants?.some((v) => v.id === variantId),
      );

      if (foundCat) {
        setSelectedCategory(foundCat);
        setFormData((prev) => ({ ...prev, service_category_id: foundCat.id }));
      }
    }

    if (formData.service_category_id && formData.service_variant_id) {
      const cat = service.service_categories?.find(
        (c) => c.id === formData.service_category_id,
      );
      const v = cat?.service_variants?.find(
        (x) => x.id === formData.service_variant_id,
      );
      if (v) setSelectedVariant(v);
    }
  }, [
    services,
    formData.service_id,
    formData.service_category_id,
    formData.service_variant_id,
  ]);

  // ===============================
  // MONTHLY AVAILABILITY
  // ===============================
  const fetchMonthlyAvailability = useCallback(async () => {
    if (!formData.service_id) return;

    setFetchingAvailability(true);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;

    try {
      const availabilityData = await getMonthlyAvailability(
        formData.service_id,
        year,
        month,
      );

      const availabilityMap = {};
      availabilityData.forEach((item) => {
        availabilityMap[item.date] = item.available;
      });

      setMonthlyAvailability(availabilityMap);
    } catch (error) {
      console.error("Error fetching monthly availability:", error);
      setMonthlyAvailability({});
    } finally {
      setFetchingAvailability(false);
    }
  }, [formData.service_id, currentMonth]);

  useEffect(() => {
    if (formData.service_id) {
      fetchMonthlyAvailability();
    } else {
      setMonthlyAvailability({});
      setCalendarDates([]);
    }
  }, [formData.service_id, currentMonth, fetchMonthlyAvailability]);

  // ===============================
  // GENERATE CALENDAR
  // ===============================
  const generateCalendar = useCallback(() => {
    if (!formData.service_id) return;

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

    setCalendarDates(dates);
  }, [currentMonth, monthlyAvailability, selectedDate, formData.service_id]);

  useEffect(() => {
    if (formData.service_id) generateCalendar();
  }, [formData.service_id, generateCalendar]);

  // ===============================
  // FETCH AVAILABLE SLOTS BY DATE
  // ===============================
  const fetchAvailableSlots = useCallback(async () => {
    if (!formData.service_id || !selectedDate) return;

    setFetchingSlots(true);
    try {
      const slots = await getAvailableSlots(formData.service_id, selectedDate);
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setAvailableSlots([]);
    } finally {
      setFetchingSlots(false);
    }
  }, [formData.service_id, selectedDate]);

  useEffect(() => {
    if (formData.service_id && selectedDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [formData.service_id, selectedDate, fetchAvailableSlots]);

  // ===============================
  // COUNTDOWN
  // ===============================
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

      if (expired && !expiryHandledRef.current && (step === 4 || step === 5)) {
        expiryHandledRef.current = true;

        setModal({
          open: true,
          title: "Booking Expired",
          message:
            "Your 30-minute payment window has ended. Please start a new booking.",
          actions: [
            {
              label: "Start New Booking",
              variant: "btn-primary",
              onClick: () => {
                setModal((m) => ({ ...m, open: false }));
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

  // ===============================
  // NAVIGATION HELPERS
  // ===============================
  const prevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
    setSelectedDate("");
    setAvailableSlots([]);
    setFormData((prev) => ({ ...prev, booking_time: "" }));
  };

  const nextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
    setSelectedDate("");
    setAvailableSlots([]);
    setFormData((prev) => ({ ...prev, booking_time: "" }));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate("");
    setAvailableSlots([]);
    setFormData((prev) => ({ ...prev, booking_time: "" }));
  };

  // ===============================
  // HANDLE SERVICE / CATEGORY / VARIANT
  // ===============================
  const handleServiceSelect = (service) => {
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
    setAvailableSlots([]);
    setMonthlyAvailability({});
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedVariant(null);
    setFormData((prev) => ({
      ...prev,
      service_category_id: category.id,
      service_variant_id: "",
      total_price: 0,
      downpayment: 0,
    }));
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setFormData((prev) => ({
      ...prev,
      service_variant_id: variant.id,
      total_price: variant.price,
      downpayment: variant.downpayment,
    }));
    setStep(2);
  };

  // ===============================
  // DATE & TIME
  // ===============================
  const handleDateSelect = (date) => {
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
  };

  const handleTimeSelect = (time) => {
    setFormData((prev) => ({ ...prev, booking_time: time }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ===============================
  // TIME SLOT DISPLAY
  // ===============================
  const generateTimeSlots = () => {
    if (!availableSlots.length) return [];

    return availableSlots
      .map((slot) => {
        const time = slot.time;
        const hour = parseInt(time.split(":")[0], 10);
        const minute = time.split(":")[1];

        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayTime = `${displayHour}:${minute} ${ampm}`;

        return {
          value: time,
          display: displayTime,
          available: slot.is_available,
          isSelected: formData.booking_time === time,
          slotId: slot.id,
        };
      })
      .sort((a, b) => {
        const [hA, mA] = a.value.split(":").map(Number);
        const [hB, mB] = b.value.split(":").map(Number);
        return hA - hB || mA - mB;
      });
  };

  // ===============================
  // VALIDATION
  // ===============================
  const validateForm = () => {
    const errors = [];

    if (step === 1) {
      if (!formData.service_id) errors.push("Please select a service");
      if (!formData.service_category_id)
        errors.push("Please select a category");
      if (!formData.service_variant_id) errors.push("Please select a variant");
    }

    if (step === 2) {
      if (!formData.booking_date) errors.push("Please select a date");
      if (!formData.booking_time) errors.push("Please select a time slot");
    }

    if (step === 3) {
      if (!formData.full_name.trim()) errors.push("Full name is required");
      if (!formData.email.trim()) errors.push("Email is required");
      if (!formData.phone.trim()) errors.push("Phone number is required");
      if (!formData.email.includes("@"))
        errors.push("Please enter a valid email address");
    }

    if (errors.length > 0) {
      showAlert("Validation Error", errors.join("\n"));
      return false;
    }
    return true;
  };

  // ===============================
  // STEP 3: CREATE BOOKING
  // ===============================
  const handleCreateBooking = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
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

      setBookingId(result.id);
      saveActiveBooking({ bookingId: result.id, expiresAt: result.expires_at });

      setBookingPreview(result);
      setStep(4);

      showAlert(
        "Booking Created",
        "Please review your details before payment.",
      );
    } catch (error) {
      console.error("Booking error:", error);
      showAlert("Error", error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // STEP 4: UPLOAD PAYMENT PROOF
  // ===============================
  const handlePaymentUpload = async (file, { silent = false } = {}) => {
    if (!file || !bookingId) return null;
    if (uploading) return null;

    if (isExpiredLocal) {
      setModal({
        open: true,
        title: "Booking Expired",
        message:
          "This booking is already expired. Please start a new booking to continue.",
        actions: [
          {
            label: "Start New Booking",
            variant: "btn-primary",
            onClick: () => {
              setModal((m) => ({ ...m, open: false }));
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
    formDataObj.append("service_variant_id", bookingPreview.service_variant_id);
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
        result.signedUrl ||
        result.signed_url ||
        result.proof_url ||
        result.signedUrl ||
        null;

      if (!intent) {
        showAlert(
          "Upload Error",
          "Payment intent was not returned. Please try again.",
        );
        return null;
      }

      setPaymentIntentId(intent);
      setPaymentSignedUrl(signed);

      saveActivePayment({
        intentId: intent,
        signedUrl: signed,
      });

      setPaymentProofUploaded(true);

      setSelectedProofFile(null);
      setProofPreviewUrl(null);

      const input = document.getElementById("payment-proof");
      if (input) input.value = "";

      try {
        const preview = await getBookingById(bookingId);
        setBookingPreview(preview);
      } catch (err) {
        console.warn("Preview fetch failed:", err);
      }

      if (!silent) {
        showAlert(
          "Payment Proof Uploaded",
          "Payment proof uploaded successfully! You can now confirm your booking.",
          () => setStep(5),
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

      showAlert("Upload Error", errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmWithUpload = async () => {
    if (!bookingId) {
      showAlert("Error", "Missing booking ID. Please restart booking.");
      return;
    }

    if (isExpiredLocal) {
      setModal({
        open: true,
        title: "Booking Expired",
        message:
          "Your payment window has ended. Please start a new booking to continue.",
        actions: [
          {
            label: "Start New Booking",
            variant: "btn-primary",
            onClick: () => {
              setModal((m) => ({ ...m, open: false }));
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
  };

  // ===============================
  // STEP 5: CONFIRM BOOKING
  // ===============================
  const handleFinalConfirmation = async (intentOverride = null) => {
    if (!bookingId) {
      showAlert("Error", "Missing booking ID. Please restart booking.");
      return;
    }

    const intentToUse = intentOverride || paymentIntentId;

    if (!intentToUse) {
      showAlert("Error", "Please upload payment proof first.");
      return;
    }

    if (isExpiredLocal) {
      setModal({
        open: true,
        title: "Booking Expired",
        message:
          "Your payment window has ended. Please start a new booking to continue.",
        actions: [
          {
            label: "Start New Booking",
            variant: "btn-primary",
            onClick: () => {
              setModal((m) => ({ ...m, open: false }));
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

      setStep(6);
      clearActiveFlow();

      showAlert(
        "Booking Confirmed",
        "🎉 Your booking has been confirmed! Slot is now reserved.",
      );
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
      } else if (error.response?.status === 400) {
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
            actions: [
              {
                label: "Start New Booking",
                variant: "btn-primary",
                onClick: () => {
                  setModal((m) => ({ ...m, open: false }));
                  hardRestart();
                },
              },
            ],
          });
        } else if (String(msg).toLowerCase().includes("slot")) {
          errorType = "slot_taken";
          errorMessage =
            "Slot is no longer available. Please choose another date/time.";
          showRetry = false;

          resetBookingFlow();
          clearActiveFlow();

          setFormData((prev) => ({
            ...prev,
            booking_date: "",
            booking_time: "",
          }));
          setSelectedDate("");
          setAvailableSlots([]);

          setStep(2);

          setModal({
            open: true,
            title: "Slot No Longer Available",
            message:
              "The selected time slot has been taken. Please choose another date and time. Note: You will need to re-upload payment proof after selecting new schedule.",
            actions: [],
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
  };

  const retryConfirmation = () => {
    setConfirmationError(null);
    handleFinalConfirmation();
  };

  // ===============================
  // SELECTED OBJECTS
  // ===============================
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

  const getAvailableDatesCount = () =>
    Object.values(monthlyAvailability).filter((v) => v === true).length;

  // ===============================
  // PREMIUM PROGRESS BAR
  // ===============================
  const PremiumProgressBar = () => (
    <div className="premium-progress">
      <div className="progress-steps">
        {[
          { number: 1, label: "Service", icon: "🎨" },
          { number: 2, label: "Schedule", icon: "📅" },
          { number: 3, label: "Details", icon: "👤" },
          { number: 4, label: "Review", icon: "📋" },
          { number: 5, label: "Payment", icon: "💳" },
          { number: 6, label: "Done", icon: "✅" },
        ].map((stepItem) => (
          <div
            key={stepItem.number}
            className={`progress-step ${
              step > stepItem.number ? "completed" : ""
            } ${step === stepItem.number ? "active" : ""}`}
          >
            <div className="step-indicator">
              {step > stepItem.number ? (
                <span className="step-check">✓</span>
              ) : (
                <span className="step-icon">{stepItem.icon}</span>
              )}
              <span className="step-number">{stepItem.number}</span>
            </div>

            <div className="step-label">{stepItem.label}</div>

            {stepItem.number < 6 && <div className="step-connector"></div>}
          </div>
        ))}
      </div>
    </div>
  );

  // ===============================
  // STEP 1 UI - SERVICE SELECTION
  // ===============================
  const renderServiceSelection = () => {
    if (fetchingServices) {
      return (
        <div className="premium-step">
          <div className="step-header">
            <h1 className="step-title">Select Service</h1>
            <p className="step-subtitle">Choose the service you want to book</p>
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
            <p className="step-subtitle">Choose the service you want to book</p>
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
            <p className="step-subtitle">Choose the service you want to book</p>
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
                <div
                  key={service.id}
                  className={`service-card premium ${
                    formData.service_id === service.id ? "selected" : ""
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="service-image premium">
                    <img
                      src={service.image}
                      alt={service.name}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(
                          service.name,
                        )}`;
                      }}
                    />
                    <div className="service-overlay premium">
                      <span className="select-label">Select Service</span>
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
                        <span>
                          {service.duration} hour
                          {service.duration !== 1 ? "s" : ""}
                        </span>
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
                </div>
              ))}
            </div>
          )}

          <div className="step-footer premium">
            <button
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
                Choose a category for <strong>{selectedService?.name}</strong>
              </p>
            </div>
          </div>

          <div className="categories-container premium">
            {selectedService?.service_categories?.map((category) => (
              <div
                key={category.id}
                className={`category-card premium ${
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
                        ₱
                        {Math.min(
                          ...(category.service_variants?.map(
                            (v) => v.price,
                          ) || [0]),
                        ).toLocaleString()}{" "}
                        - ₱
                        {Math.max(
                          ...(category.service_variants?.map(
                            (v) => v.price,
                          ) || [0]),
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="category-action">
                  <span className="action-icon">→</span>
                </div>
              </div>
            ))}
          </div>

          <div className="step-footer premium">
            <button
              className="btn btn-secondary premium"
              onClick={() => {
                resetBookingFlow();
                setFormData((prev) => ({ ...prev, service_id: "" }));
                setSelectedCategory(null);
              }}
            >
              Back to Services
            </button>
            <div className="step-info">
              <span className="info-text">
                {selectedService?.service_categories?.length || 0} categor
                {selectedService?.service_categories?.length !== 1
                  ? "ies"
                  : "y"}{" "}
                available
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (!formData.service_variant_id) {
      return (
        <div className="premium-step">
          <div className="step-header with-back">
            <button
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
                <strong>{selectedCategory?.name}</strong>
              </p>
            </div>
          </div>

          <div className="variants-container premium">
            {selectedCategory?.service_variants?.map((variant) => (
              <div
                key={variant.id}
                className={`variant-card premium ${
                  selectedVariant?.id === variant.id ? "selected" : ""
                }`}
                onClick={() => handleVariantSelect(variant)}
              >
                <div className="variant-content">
                  <div className="variant-header">
                    <h3>{variant.body_part}</h3>
                    <span className="variant-size">{variant.size}</span>
                  </div>
                  <div className="variant-details premium">
                    <div className="price-section">
                      <div className="price-main">
                        ₱{variant.price.toLocaleString()}
                      </div>
                      <div className="price-sub">
                        Downpayment: ₱{variant.downpayment.toLocaleString()}
                      </div>
                    </div>
                    <div className="duration-badge">
                      <span className="duration-icon">⏱️</span>
                      <span>
                        {selectedService?.duration} hour
                        {selectedService?.duration !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="select-btn premium">
                  Select <span className="select-icon">→</span>
                </button>
              </div>
            ))}
          </div>

          <div className="step-footer premium">
            <button
              className="btn btn-secondary premium"
              onClick={() => {
                resetBookingFlow();
                setFormData((prev) => ({ ...prev, service_category_id: "" }));
                setSelectedCategory(null);
              }}
            >
              Back to Categories
            </button>
            <div className="step-info">
              <span className="info-text">
                {selectedCategory?.service_variants?.length || 0} variant
                {selectedCategory?.service_variants?.length !== 1
                  ? "s"
                  : ""}{" "}
                available
              </span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // ===============================
  // STEP 2 UI - DATE TIME SELECTION
  // ===============================
  const renderDateTimeSelection = () => {
    const timeSlots = generateTimeSlots();
    const monthNames = [
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
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="premium-step">
        <div className="step-header with-back">
          <button
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
            <p className="step-subtitle">Choose your preferred schedule</p>
          </div>
        </div>

        <div className="selected-service-summary premium">
          <div className="summary-header">
            <h4>Selected Service</h4>
            <div className="price-tag">
              ₱{formData.total_price.toLocaleString()}
            </div>
          </div>
          <div className="summary-details">
            <div className="detail-item">
              <span className="detail-label">Service:</span>
              <span className="detail-value">{selectedService?.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{selectedCategoryObj?.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Variant:</span>
              <span className="detail-value">
                {selectedVariantObj?.body_part} ({selectedVariantObj?.size})
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Downpayment:</span>
              <span className="detail-value highlight">
                ₱{formData.downpayment.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="datetime-container premium">
          <div className="calendar-section premium">
            <div className="calendar-header premium">
              <div className="calendar-navigation">
                <button className="nav-btn prev premium" onClick={prevMonth}>
                  <span className="nav-icon">←</span>
                  <span>Previous</span>
                </button>

                <div className="calendar-title">
                  <h3>
                    {monthNames[currentMonth.getMonth()]}{" "}
                    {currentMonth.getFullYear()}
                  </h3>
                  <button className="today-btn premium" onClick={goToToday}>
                    Today
                  </button>
                </div>

                <button className="nav-btn next premium" onClick={nextMonth}>
                  <span>Next</span>
                  <span className="nav-icon">→</span>
                </button>
              </div>

              <div className="weekdays premium">
                {dayNames.map((day) => (
                  <div key={day} className="weekday">
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {fetchingAvailability ? (
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
                        key={index}
                        className={`calendar-day premium ${dateObj.isCurrentMonth ? "" : "other-month"} 
                          ${dateObj.isPast ? "past" : ""} 
                          ${dateObj.isBlocked ? "blocked" : "available"}
                          ${dateObj.isSelected ? "selected" : ""}
                          ${isToday ? "today" : ""}`}
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
                          {dateObj.isSelected && (
                            <div className="selected-indicator"></div>
                          )}
                        </div>
                        {!dateObj.isCurrentMonth && (
                          <div className="month-indicator">
                            {monthNames[dateObj.date.getMonth()].slice(0, 3)}
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
                    {parseLocalDate(selectedDate).toLocaleDateString("en-PH", {
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
                  <p>Select a date from the calendar</p>
                </div>
              )}
            </div>

            {selectedDate ? (
              <>
                {fetchingSlots ? (
                  <div className="timeslots-loading">
                    <div className="spinner small"></div>
                    <p>Loading available slots...</p>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="no-slots premium">
                    <div className="no-slots-icon">📅</div>
                    <h4>No Available Slots</h4>
                    <p>All time slots are booked for this date</p>
                  </div>
                ) : (
                  <>
                    <div className="timeslots-grid premium">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.slotId || slot.value}
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
                        <span className="info-label">Available slots:</span>
                        <span className="info-value">
                          {timeSlots.filter((s) => s.available).length} of{" "}
                          {timeSlots.length}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Duration per slot:</span>
                        <span className="info-value">
                          {selectedService?.duration} hour
                          {selectedService?.duration !== 1 ? "s" : ""}
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
                  <p>Choose an available date to view time slots</p>
                  <div className="tip">
                    <span className="tip-icon">💡</span>
                    <span>Green dots indicate available dates</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="step-footer premium">
          <button
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
            className="btn btn-primary premium"
            onClick={() => setStep(3)}
            disabled={!formData.booking_date || !formData.booking_time}
          >
            Continue to Information
          </button>
        </div>
      </div>
    );
  };

  // ===============================
  // STEP 3 UI - CUSTOMER INFO
  // ===============================
  const renderCustomerInfo = () => (
    <div className="premium-step">
      <div className="step-header">
        <h1 className="step-title">Your Information</h1>
        <p className="step-subtitle">Please provide your contact details</p>
      </div>

      <div className="booking-summary-card premium">
        <div className="summary-header">
          <h4>Booking Summary</h4>
          <div className="price-tag">
            ₱{formData.total_price.toLocaleString()}
          </div>
        </div>
        <div className="summary-grid premium">
          <div className="summary-item">
            <span className="item-label">Service:</span>
            <span className="item-value">{selectedService?.name}</span>
          </div>
          <div className="summary-item">
            <span className="item-label">Category:</span>
            <span className="item-value">{selectedCategoryObj?.name}</span>
          </div>
          <div className="summary-item">
            <span className="item-label">Variant:</span>
            <span className="item-value">
              {selectedVariantObj?.body_part} ({selectedVariantObj?.size})
            </span>
          </div>
          <div className="summary-item">
            <span className="item-label">Date:</span>
            <span className="item-value">
              {parseLocalDate(formData.booking_date)?.toLocaleDateString(
                "en-PH",
                {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                },
              )}
            </span>
          </div>
          <div className="summary-item">
            <span className="item-label">Time:</span>
            <span className="item-value">{formData.booking_time}</span>
          </div>
          <div className="summary-item highlight">
            <span className="item-label">Downpayment:</span>
            <span className="item-value">
              ₱{formData.downpayment.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

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
                Booking confirmation will be sent here
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
              Facebook Profile Link <span className="optional">(Optional)</span>
            </label>
            <input
              type="url"
              name="facebook_link"
              value={formData.facebook_link}
              onChange={handleInputChange}
              className="form-input premium"
              placeholder="https://facebook.com/yourprofile"
            />
            <div className="form-hint premium">Helps us serve you better</div>
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
              rows="3"
            />
          </div>
        </div>
      </div>

      <div className="info-notice premium">
        <div className="notice-header">
          <span className="notice-icon">📋</span>
          <h5>Important Information</h5>
        </div>
        <ul className="notice-list">
          <li>
            Booking will be created with status{" "}
            <strong>"Pending Payment"</strong>
          </li>
          <li>
            Slot is <strong>NOT reserved</strong> until payment proof is
            uploaded
          </li>
          <li>
            Upload payment proof within <strong>30 minutes</strong> to secure
            your slot
          </li>
          <li>Slot availability will be verified after payment upload</li>
        </ul>
      </div>

      <div className="step-footer premium">
        <button
          className="btn btn-secondary premium"
          onClick={() => setStep(2)}
        >
          Back to Schedule
        </button>
        <button
          className="btn btn-primary premium"
          onClick={handleCreateBooking}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner small"></span>
              Creating Booking...
            </>
          ) : (
            "Create Booking & Proceed to Payment"
          )}
        </button>
      </div>
    </div>
  );

  // ===============================
  // STEP 5 UI - PAYMENT UPLOAD
  // ===============================
  const renderPaymentInstructions = () => {
    const countdown = formatCountdown(timeLeftMs);

    const expiryLabel = isExpiredLocal
      ? "Expired"
      : countdown
        ? `${countdown} remaining`
        : "30 minutes";

    return (
      <div className="premium-step">
        <div className="step-header with-back">
          <button className="back-btn premium" onClick={() => setStep(4)}>
            <span className="back-icon">←</span> Back to Review
          </button>

          <div>
            <h1 className="step-title">Payment Instructions</h1>
            <p className="step-subtitle">
              Pay the downpayment to secure your appointment
            </p>
          </div>
        </div>

        <div
          className={`status-banner warning premium ${isExpiredLocal ? "error" : ""}`}
        >
          <div className="status-content">
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span className="status-text">PENDING PAYMENT</span>
            </div>
            <p className="status-message">
              ⏰ Upload payment proof within <strong>{expiryLabel}</strong> to
              secure your slot
            </p>
          </div>
        </div>

        {isExpiredLocal && (
          <div className="error-state" style={{ marginTop: 12 }}>
            <div className="error-icon premium">⛔</div>
            <h3 className="error-title">This booking has expired</h3>
            <p className="error-message">
              Please start a new booking to continue.
            </p>
            <button
              className="btn btn-primary premium"
              onClick={() => {
                setModal({
                  open: true,
                  title: "Booking Expired",
                  message:
                    "Your 30-minute payment window ended. Start a new booking to continue.",
                  actions: [
                    {
                      label: "Start New Booking",
                      variant: "btn-primary",
                      onClick: () => {
                        setModal((m) => ({ ...m, open: false }));
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
                  ₱{formData.downpayment.toLocaleString()}
                </div>
              </div>
              <div className="qr-container">
                <div className="qr-placeholder premium">
                  <div className="qr-mock">
                    <div className="qr-lines">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="qr-line"></div>
                      ))}
                    </div>
                  </div>
                  <div className="qr-hint">
                    <span className="hint-icon">💰</span>
                    Send ₱{formData.downpayment.toLocaleString()} to:
                    <br />
                    <strong>0912 345 6789</strong>
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
                  <span className="detail-label">Booking ID:</span>
                  <span className="detail-value code">#{bookingId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Reference:</span>
                  <span className="detail-value code">BOOK-{bookingId}</span>
                </div>
                <div className="detail-row highlight">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value amount">
                    ₱{formData.downpayment.toLocaleString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">GCash Number:</span>
                  <span className="detail-value">0912 345 6789</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Expires:</span>
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
                <strong>Required:</strong> Upload payment proof to secure your
                slot
              </p>
            </div>

            <div className="upload-area premium">
              <input
                type="file"
                id="payment-proof"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setSelectedProofFile(file);

                  if (file && file.type.startsWith("image/")) {
                    setProofPreviewUrl(URL.createObjectURL(file));
                  } else {
                    setProofPreviewUrl(null);
                  }
                }}
                disabled={uploading || paymentProofUploaded || isExpiredLocal}
                className="upload-input"
              />
              <label
                htmlFor="payment-proof"
                className={`upload-dropzone premium ${paymentProofUploaded ? "uploaded" : ""}`}
              >
                {uploading ? (
                  <div className="upload-state">
                    <div className="spinner"></div>
                    <p>Uploading...</p>
                  </div>
                ) : paymentProofUploaded ? (
                  <div className="upload-state success">
                    <span className="upload-icon">✓</span>
                    <div>
                      <p className="upload-title">Payment Proof Uploaded</p>
                      <p className="upload-sub">
                        Payment intent created successfully
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="upload-state">
                    <span className="upload-icon">📎</span>
                    <div>
                      <p className="upload-title">Click to upload screenshot</p>
                      <p className="upload-sub">PNG, JPG, or PDF (Max 5MB)</p>
                    </div>
                  </div>
                )}
              </label>

              {selectedProofFile &&
                selectedProofFile.type === "application/pdf" && (
                  <div className="form-hint premium" style={{ marginTop: 10 }}>
                    PDF selected — preview not available. You can still upload
                    it.
                  </div>
                )}

              {proofPreviewUrl && (
                <div style={{ marginTop: 12 }}>
                  <p className="form-hint premium">Preview:</p>
                  <img
                    src={proofPreviewUrl}
                    alt="Payment Proof Preview"
                    style={{
                      width: "100%",
                      maxHeight: "250px",
                      objectFit: "contain",
                      borderRadius: "12px",
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
              )}

              {selectedProofFile && !paymentProofUploaded && (
                <div className="form-hint premium" style={{ marginTop: 10 }}>
                  Selected: <strong>{selectedProofFile.name}</strong>
                </div>
              )}

              <button
                className="btn btn-outline premium"
                style={{ marginTop: 12, width: "100%" }}
                onClick={() => {
                  setSelectedProofFile(null);
                  setProofPreviewUrl(null);

                  const input = document.getElementById("payment-proof");
                  if (input) input.value = "";
                }}
                disabled={uploading || isExpiredLocal}
              >
                Clear Selected File
              </button>
            </div>

            <div className="upload-tips premium">
              <h5>📸 Make sure your screenshot shows:</h5>
              <ul className="tips-list">
                <li>Amount paid (₱{formData.downpayment.toLocaleString()})</li>
                <li>Reference number (BOOK-{bookingId})</li>
                <li>Date and time of payment</li>
                <li>Recipient name or number</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="important-note premium">
          <div className="note-icon">⚠️</div>
          <div className="note-content">
            <strong>Important:</strong> Your slot is{" "}
            <span className="warning-text">NOT RESERVED</span> until you confirm
            booking.
          </div>
        </div>

        <div className="step-footer premium">
          <button
            className="btn btn-secondary premium"
            onClick={() => setStep(4)}
          >
            Back to Review
          </button>

          <button
            className="btn btn-primary premium"
            onClick={handleConfirmWithUpload}
            disabled={
              loading ||
              uploading ||
              !bookingId ||
              isExpiredLocal ||
              (!(
                paymentProofUploaded ||
                paymentSignedUrl ||
                bookingPreview?.payment?.proof_url ||
                bookingPreview?.payment?.payment_proof_url ||
                bookingPreview?.payment?.signed_url ||
                bookingPreview?.payment?.signedUrl
              ) &&
                !selectedProofFile)
            }
          >
            {loading || uploading ? (
              <>
                <span className="spinner small"></span>
                Processing...
              </>
            ) : (
              "Confirm Booking & Reserve Slot"
            )}
          </button>
        </div>
      </div>
    );
  };

  // ===============================
  // STEP 4 UI - REVIEW
  // ===============================
  const renderBookingPreview = () => {
    const preview = bookingPreview;

    return (
      <div className="premium-step">
        <div className="step-header with-back">
          <button className="back-btn premium" onClick={() => setStep(3)}>
            <span className="back-icon">←</span> Back to Information
          </button>

          <div>
            <h1 className="step-title">Final Review</h1>
            <p className="step-subtitle">
              Verify all details before confirming your booking
            </p>
          </div>
        </div>

        <div className="status-banner warning premium">
          <div className="status-content">
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span className="status-text">SLOT NOT YET RESERVED</span>
            </div>
            <p className="status-message">
              ⚠️ Slot will be checked and reserved when you click "Confirm
              Booking"
            </p>
          </div>
        </div>

        {isExpiredLocal && (
          <div className="error-alert premium payment_expired">
            <div className="alert-icon">⛔</div>
            <div className="alert-content">
              <h5>Booking Expired</h5>
              <p>Your 30-minute window ended. Please start a new booking.</p>
              <div className="alert-actions">
                <button
                  className="btn btn-small premium"
                  onClick={() => {
                    setModal({
                      open: true,
                      title: "Booking Expired",
                      message: "Start a new booking to continue.",
                      actions: [
                        {
                          label: "Start New Booking",
                          variant: "btn-primary",
                          onClick: () => {
                            setModal((m) => ({ ...m, open: false }));
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
            </div>
          </div>
        )}

        {confirmationError && (
          <div className={`error-alert premium ${confirmationError.type}`}>
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <h5>Confirmation Failed</h5>
              <p>{confirmationError.message}</p>

              {confirmationError.type === "slot_taken" && (
                <div className="alert-actions">
                  <button
                    className="btn btn-small premium"
                    onClick={() => {
                      setStep(2);
                      setConfirmationError(null);
                    }}
                  >
                    Choose Another Slot
                  </button>
                  <button
                    className="btn btn-small btn-outline premium"
                    onClick={hardRestart}
                  >
                    Start New Booking
                  </button>
                </div>
              )}

              {confirmationError.retry && (
                <button
                  className="btn btn-small btn-primary premium"
                  onClick={retryConfirmation}
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}

        <div className="review-container premium">
          <div className="review-section">
            <h4 className="section-title">Service Details</h4>
            <div className="section-content">
              <div className="detail-item">
                <span className="detail-label">Service:</span>
                <span className="detail-value">{selectedService?.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Category:</span>
                <span className="detail-value">
                  {selectedCategoryObj?.name}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Variant:</span>
                <span className="detail-value">
                  {selectedVariantObj?.body_part} ({selectedVariantObj?.size})
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">
                  {selectedService?.duration} hour
                  {selectedService?.duration !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="detail-item highlight">
                <span className="detail-label">Total Price:</span>
                <span className="detail-value price">
                  ₱{formData.total_price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="review-section">
            <h4 className="section-title">Schedule</h4>
            <div className="section-content">
              <div className="detail-item">
                <span className="detail-label">Date:</span>
                <span className="detail-value">
                  {parseLocalDate(formData.booking_date)?.toLocaleDateString(
                    "en-PH",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Time:</span>
                <span className="detail-value">{formData.booking_time}</span>
              </div>
            </div>
          </div>

          <div className="review-section">
            <h4 className="section-title">Your Information</h4>
            <div className="section-content">
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{formData.full_name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{formData.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{formData.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Facebook:</span>
                <span className="detail-value">
                  {formData.facebook_link || "Not provided"}
                </span>
              </div>
            </div>
          </div>

          <div className="review-section">
            <h4 className="section-title">Payment Status</h4>
            <div className="section-content">
              <div className="detail-item">
                <span className="detail-label">Downpayment:</span>
                <span className="detail-value success">Proof Uploaded ✓</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Payment Intent:</span>
                <span className="detail-value code">
                  {paymentIntentId?.substring(0, 12)}...
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Slot Status:</span>
                <span className="detail-value warning">
                  Pending Reservation
                </span>
              </div>

              {preview?.status && (
                <div className="detail-item">
                  <span className="detail-label">Booking Status:</span>
                  <span className="detail-value">{preview.status}</span>
                </div>
              )}
            </div>
          </div>

          {formData.notes && (
            <div className="review-section">
              <h4 className="section-title">Additional Notes</h4>
              <div className="section-content">
                <p className="notes-text">{formData.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="policies-section premium">
          <h4>📋 Important Policies</h4>
          <ul className="policies-list">
            <li>Slot availability will be checked when you confirm booking</li>
            <li>
              If slot is no longer available, you'll be notified immediately
            </li>
            <li>
              Booking will be marked as "Pending Approval" until admin approval
            </li>
            <li>
              Cancellations allowed within{" "}
              <strong>24 hours after approval</strong>
            </li>
          </ul>
        </div>

        <div className="step-footer premium">
          <button
            className="btn btn-secondary premium"
            onClick={() => setStep(3)}
          >
            Back to Information
          </button>

          <button
            className="btn btn-primary premium"
            onClick={() => setStep(5)}
            disabled={isExpiredLocal || !bookingId}
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    );
  };

  // ===============================
  // STEP 6 UI - CONFIRMATION
  // ===============================
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

    const timeText = formData.booking_time || "N/A";

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
                <span className="detail-label">Status:</span>
                <span className={`detail-value status ${statusClass}`}>
                  {statusLabel}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Service:</span>
                <span className="detail-value">
                  {selectedService?.name || "N/A"}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Category:</span>
                <span className="detail-value">
                  {selectedCategoryObj?.name || "N/A"}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Variant:</span>
                <span className="detail-value">
                  {selectedVariantObj?.body_part
                    ? `${selectedVariantObj.body_part} (${selectedVariantObj.size})`
                    : "N/A"}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Date & Time:</span>
                <span className="detail-value">
                  {dateText} at {timeText}
                </span>
              </div>

              <div
                className={`detail-item ${statusClass === "success" ? "success" : ""}`}
              >
                <span className="detail-label">Payment:</span>
                <span className={`detail-value status ${statusClass}`}>
                  {paymentText}
                </span>
              </div>

              <div
                className={`detail-item ${statusClass === "success" ? "success" : ""}`}
              >
                <span className="detail-label">Slot Status:</span>
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
                  <li>Message/call us if may questions</li>
                </>
              ) : (
                <>
                  <li>Veverify namin ang payment proof within 24 hours</li>
                  <li>Makaka-receive ka ng email once approved</li>
                  <li>Pwede mong i-check status anytime gamit email</li>
                  <li>Message/call us if may questions</li>
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
            className="btn btn-primary premium"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
          <button
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

      <div className="booking-header premium">
        <h1>Book an Appointment</h1>
        <p>Complete the following steps to secure your appointment</p>
      </div>

      <PremiumProgressBar />

      <div className="booking-content premium">
        {step === 1 && renderServiceSelection()}
        {step === 2 && renderDateTimeSelection()}
        {step === 3 && renderCustomerInfo()}
        {step === 4 && renderBookingPreview()}
        {step === 5 && renderPaymentInstructions()}
        {step === 6 && renderConfirmation()}
      </div>
    </div>
  );
};

export default Booking;
