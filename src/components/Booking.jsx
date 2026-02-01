import { useCallback, useEffect, useState } from "react";
import {
  confirmBooking,
  createBooking,
  uploadPaymentProof,
} from "../../backend/bookingApi.js";
import {
  getAvailableSlots,
  getMonthlyAvailability,
} from "../../backend/calendarApi.js";
import { getAllServices } from "../../backend/servicesApi.js";
import "../styles/booking-system.css";

// DATE FORTMATTER FUNCTION HELPER
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Booking = () => {
  // State management
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [fetchingServices, setFetchingServices] = useState(true);
  const [servicesError, setServicesError] = useState(null);
  const [fetchingAvailability, setFetchingAvailability] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [paymentProofUploaded, setPaymentProofUploaded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDates, setCalendarDates] = useState([]);
  const [monthlyAvailability, setMonthlyAvailability] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [confirmationError, setConfirmationError] = useState(null);

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

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch monthly availability when service or month changes
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

  // Generate calendar when monthly availability changes
  // Fix sa generateCalendar function:
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

    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const dateStr = formatLocalDate(date);
      dates.push({
        date: date,
        dateStr: dateStr,
        isCurrentMonth: false,
        isPast: date < today,
        isSelected: selectedDate === dateStr,
        isBlocked: true,
        isAvailable: false,
      });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = formatLocalDate(date);
      const isPast = date < today;
      const isAvailable = monthlyAvailability[dateStr] === true;
      const isBlocked = isPast || !isAvailable;

      dates.push({
        date: date,
        dateStr: dateStr,
        isCurrentMonth: true,
        isPast: isPast,
        isSelected: selectedDate === dateStr,
        isBlocked: isBlocked,
        isAvailable: isAvailable,
      });
    }

    // Add next month's days - FIXED VERSION
    const totalCells = 42; // 6 weeks
    const remainingCells = Math.max(0, totalCells - dates.length); // ← DITO ANG FIX

    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      const dateStr = formatLocalDate(date);
      dates.push({
        date: date,
        dateStr: dateStr,
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
    if (formData.service_id) {
      generateCalendar();
    }
  }, [formData.service_id, generateCalendar]);

  // Fetch available slots when date is selected
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

  // Navigation functions
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

  // Fetch services
  const fetchServices = async () => {
    try {
      setFetchingServices(true);
      setServicesError(null);

      const servicesData = await getAllServices();

      const transformedServices = servicesData.map((service) => {
        return {
          id: service.id,
          name: service.name,
          description: service.description || "No description available",
          duration: service.duration || 0,
          image:
            service.image_url ||
            service.image ||
            `https://via.placeholder.com/300x200?text=${encodeURIComponent(service.name)}`,
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
        };
      });

      setServices(transformedServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServicesError("Failed to load services. Please try again later.");

      const fallbackServices = [
        {
          id: 1,
          name: "Tattoo Service",
          description: "Professional tattoo artistry",
          duration: 2,
          image:
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
          service_categories: [
            {
              id: 1,
              name: "Small Tattoo",
              service_variants: [
                {
                  id: 1,
                  body_part: "Arm",
                  size: "Small",
                  price: 1500,
                  downpayment: 500,
                  is_active: true,
                },
                {
                  id: 2,
                  body_part: "Wrist",
                  size: "Small",
                  price: 1200,
                  downpayment: 400,
                  is_active: true,
                },
              ],
            },
            {
              id: 2,
              name: "Medium Tattoo",
              service_variants: [
                {
                  id: 3,
                  body_part: "Back",
                  size: "Medium",
                  price: 3000,
                  downpayment: 1000,
                  is_active: true,
                },
              ],
            },
          ],
        },
      ];
      setServices(fallbackServices);
    } finally {
      setFetchingServices(false);
    }
  };

  // Handle service selection
  const handleServiceSelect = (service) => {
    setFormData({
      ...formData,
      service_id: service.id,
      service_category_id: "",
      service_variant_id: "",
      total_price: 0,
      downpayment: 0,
      duration: service.duration || 0,
      booking_date: "",
      booking_time: "",
    });
    setSelectedCategory(null);
    setSelectedVariant(null);
    setSelectedDate("");
    setAvailableSlots([]);
    setMonthlyAvailability({});
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedVariant(null);
    setFormData({
      ...formData,
      service_category_id: category.id,
      service_variant_id: "",
      total_price: 0,
      downpayment: 0,
    });
  };

  // Handle variant selection
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setFormData({
      ...formData,
      service_variant_id: variant.id,
      total_price: variant.price,
      downpayment: variant.downpayment,
    });
    setStep(2);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    const dateStr = formatLocalDate(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today || !monthlyAvailability[dateStr]) {
      return;
    }

    setSelectedDate(dateStr);
    setFormData({
      ...formData,
      booking_date: dateStr,
      booking_time: "",
    });
  };

  // Handle time slot selection
  const handleTimeSelect = (time) => {
    setFormData({ ...formData, booking_time: time });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Generate time slots
  const generateTimeSlots = () => {
    if (!availableSlots.length) return [];

    return availableSlots
      .map((slot) => {
        const time = slot.time;
        const hour = parseInt(time.split(":")[0]);
        const minute = time.split(":")[1];

        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayTime =
          minute === "00"
            ? `${displayHour}:${minute} ${ampm}`
            : `${displayHour}:${minute} ${ampm}`;

        return {
          value: time,
          display: displayTime,
          available: slot.is_available,
          isSelected: formData.booking_time === time,
          slotId: slot.id,
        };
      })
      .sort((a, b) => {
        const timeA = a.value.split(":").map(Number);
        const timeB = b.value.split(":").map(Number);
        return timeA[0] - timeB[0] || timeA[1] - timeB[1];
      });
  };

  // STEP 3: Create initial booking
  const handleCreateBooking = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const bookingData = {
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

      const result = await createBooking(bookingData);
      setBookingId(result.id);
      setStep(4);

      alert(
        "Booking created! Please upload payment proof within 30 minutes to secure your slot.",
      );
    } catch (error) {
      console.error("Booking error:", error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // STEP 4: Upload payment proof and create payment intent
  const handlePaymentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !bookingId) return;

    setUploading(true);

    const formDataObj = new FormData();
    formDataObj.append("booking_id", bookingId);
    formDataObj.append("email", formData.email);
    formDataObj.append("service_id", formData.service_id);
    formDataObj.append("service_variant_id", formData.service_variant_id);
    formDataObj.append("booking_date", formData.booking_date);
    formDataObj.append("booking_time", formData.booking_time);
    formDataObj.append("proof", file);

    try {
      const result = await uploadPaymentProof(formDataObj);
      setPaymentIntentId(result.payment_intent_id);
      setPaymentProofUploaded(true);

      // Auto-proceed to step 5
      setTimeout(() => {
        setStep(5);
      }, 1500);

      alert(
        "Payment proof uploaded successfully! Proceeding to confirmation...",
      );
    } catch (error) {
      console.error("Upload error:", error);

      let errorMessage = "Upload failed. ";
      if (error.response?.status === 413) {
        errorMessage += "File too large (max 5MB).";
      } else if (error.response?.status === 400) {
        errorMessage += "Invalid file format. Please upload PNG, JPG, or PDF.";
      } else {
        errorMessage += error.response?.data?.message || error.message;
      }

      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // STEP 5: Final confirmation
  const handleFinalConfirmation = async () => {
    console.log("🔍 Step 5: Starting final confirmation");

    if (!paymentIntentId) {
      console.error("❌ paymentIntentId is null/undefined!");
      alert("Please upload payment proof first.");
      return;
    }

    setConfirmationError(null);

    setLoading(true);
    try {
      console.log("📞 Calling confirmBooking with:", paymentIntentId);
      const result = await confirmBooking(paymentIntentId);
      console.log("✅ Confirm booking result:", result);

      setStep(6);
      alert("🎉 Booking confirmed successfully! Your slot is now secured.");
    } catch (error) {
      console.error("❌ Full error details:", error);
      console.error("Error response:", error.response?.data);

      let errorType = "unknown";
      let errorMessage = "An error occurred. Please try again.";
      let showRetry = true;

      if (error.response?.status === 404) {
        errorType = "payment_not_found";
        errorMessage =
          "Payment record not found. Please upload payment proof again.";
        showRetry = false;
      } else if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes("expired")) {
          errorType = "payment_expired";
          errorMessage =
            "Payment proof expired (30 minutes limit). Please restart booking.";
          showRetry = false;
        } else if (error.response?.data?.message?.includes("slot")) {
          errorType = "slot_taken";
          errorMessage =
            "Slot no longer available. Please choose another date/time.";
          showRetry = false;
        } else {
          errorType = "invalid_payment";
          errorMessage = "Invalid payment. Please contact support.";
        }
      } else if (error.response?.status === 500) {
        errorType = "server_error";
        errorMessage = "Server error. Please try again in a moment.";
      } else if (!navigator.onLine) {
        errorType = "offline";
        errorMessage = "No internet connection. Please check your connection.";
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

  // Retry function for failed confirmation
  const retryConfirmation = () => {
    setConfirmationError(null);
    handleFinalConfirmation();
  };

  // Clear error when going back to payment step
  const handleBackToPayment = () => {
    setConfirmationError(null);
    setStep(4);
  };

  // Validate form data
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
      alert(errors.join("\n"));
      return false;
    }

    return true;
  };

  // Get selected service, category, and variant details
  const selectedService = services.find((s) => s.id === formData.service_id);
  const selectedCategoryObj = selectedService?.service_categories?.find(
    (c) => c.id === formData.service_category_id,
  );
  const selectedVariantObj = selectedCategoryObj?.service_variants?.find(
    (v) => v.id === formData.service_variant_id,
  );

  // Calculate how many available dates this month
  const getAvailableDatesCount = () => {
    return Object.values(monthlyAvailability).filter((v) => v === true).length;
  };

  // Premium Progress Bar Component
  const PremiumProgressBar = () => (
    <div className="premium-progress">
      <div className="progress-steps">
        {[
          { number: 1, label: "Service", icon: "🎨" },
          { number: 2, label: "Schedule", icon: "📅" },
          { number: 3, label: "Details", icon: "👤" },
          { number: 4, label: "Payment", icon: "💳" },
          { number: 5, label: "Review", icon: "📋" },
          { number: 6, label: "Confirm", icon: "✅" },
        ].map((stepItem) => (
          <div
            key={stepItem.number}
            className={`progress-step ${step > stepItem.number ? "completed" : ""} ${step === stepItem.number ? "active" : ""}`}
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

  // Step 1: Service Selection
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
            <button className="btn btn-primary premium" onClick={fetchServices}>
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // Step 1.1: Select Service
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
              <button
                className="btn btn-outline premium"
                onClick={fetchServices}
              >
                Refresh Services
              </button>
            </div>
          ) : (
            <div className="services-grid premium">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`service-card premium ${formData.service_id === service.id ? "selected" : ""}`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="service-image premium">
                    <img
                      src={service.image}
                      alt={service.name}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(service.name)}`;
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
              onClick={() => (window.location.href = "/")}
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

    // Step 1.2: Select Category
    if (!formData.service_category_id) {
      return (
        <div className="premium-step">
          <div className="step-header with-back">
            <button
              className="back-btn premium"
              onClick={() => {
                setFormData({ ...formData, service_id: "" });
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
                className={`category-card premium ${selectedCategory?.id === category.id ? "selected" : ""}`}
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
                setFormData({ ...formData, service_id: "" });
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

    // Step 1.3: Select Variant
    if (!formData.service_variant_id) {
      return (
        <div className="premium-step">
          <div className="step-header with-back">
            <button
              className="back-btn premium"
              onClick={() => {
                setFormData({ ...formData, service_category_id: "" });
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
                className={`variant-card premium ${selectedVariant?.id === variant.id ? "selected" : ""}`}
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
                  Select
                  <span className="select-icon">→</span>
                </button>
              </div>
            ))}
          </div>

          <div className="step-footer premium">
            <button
              className="btn btn-secondary premium"
              onClick={() => {
                setFormData({ ...formData, service_category_id: "" });
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

  // Step 2: Date & Time Selection
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
              setFormData({ ...formData, service_variant_id: "" });
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
          {/* Calendar Section */}
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

          {/* Time Slots Section */}
          <div className="timeslots-section premium">
            <div className="timeslots-header">
              <h3>Available Time Slots</h3>
              {selectedDate ? (
                <div className="selected-date premium">
                  <span className="date-icon">📅</span>
                  <span className="date-text">
                    {new Date(selectedDate).toLocaleDateString("en-PH", {
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
                    <button
                      className="btn btn-outline premium"
                      onClick={() => handleDateSelect(null)}
                    >
                      Choose Another Date
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="timeslots-grid premium">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.slotId || slot.value}
                          className={`timeslot-btn premium ${!slot.available ? "disabled" : ""} ${slot.isSelected ? "selected" : ""}`}
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
              setFormData({ ...formData, service_variant_id: "" });
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

  // Step 3: Customer Information
  const renderCustomerInfo = () => (
    <div className="premium-step">
      <div className="step-header">
        <h1 className="step-title">Your Information</h1>
        <p className="step-subtitle">Please provide your contact details</p>
      </div>

      <div className="booking-summary-card premium">
        <div className="summary-header">
          <h4>Booking Summary</h4>
          <div className="total-amount">
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
              {new Date(formData.booking_date).toLocaleDateString("en-PH", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
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

  // Step 4: Payment Instructions
  const renderPaymentInstructions = () => {
    return (
      <div className="premium-step">
        <div className="step-header with-back">
          <button className="back-btn premium" onClick={() => setStep(3)}>
            <span className="back-icon">←</span> Back to Information
          </button>
          <div>
            <h1 className="step-title">Payment Instructions</h1>
            <p className="step-subtitle">
              Pay the downpayment to secure your appointment
            </p>
          </div>
        </div>

        <div className="status-banner warning premium">
          <div className="status-content">
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span className="status-text">PENDING PAYMENT</span>
            </div>
            <p className="status-message">
              ⏰ Upload payment proof within <strong>30 minutes</strong> to
              secure your slot
            </p>
          </div>
        </div>

        <div className="payment-container premium">
          {/* Payment QR Code Section */}
          <div className="payment-qr-section">
            <div className="qr-card premium">
              <div className="qr-header">
                <h4>Scan to Pay via GCash</h4>
                <div className="payment-amount">
                  ₱{formData.downpayment.toLocaleString()}
                </div>
              </div>
              <div className="qr-container">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GCash%3A09123456789%0AAmount%3A₱${formData.downpayment}%0AReference%3ABOOK-${bookingId}`}
                  alt="Payment QR Code"
                  className="qr-code premium"
                />
                <div className="qr-hint">
                  <span className="hint-icon">📱</span>
                  Scan with GCash app
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
                  <span className="detail-label">Account:</span>
                  <span className="detail-value">Your Business Name</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">GCash Number:</span>
                  <span className="detail-value">0912 345 6789</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Expires in:</span>
                  <span className="detail-value warning">30 minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section */}
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
                onChange={handlePaymentUpload}
                disabled={uploading || paymentProofUploaded}
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
            <span className="warning-text">NOT RESERVED</span> until payment
            proof is uploaded and booking is confirmed.
          </div>
        </div>

        <div className="step-footer premium">
          <button
            className="btn btn-secondary premium"
            onClick={() => setStep(3)}
          >
            Back to Information
          </button>
          {!paymentProofUploaded && (
            <div className="upload-required">
              <span className="required-text">
                Upload payment proof to continue
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Step 5: Booking Preview/Review
  const renderBookingPreview = () => {
    return (
      <div className="premium-step">
        <div className="step-header with-back">
          <button className="back-btn premium" onClick={handleBackToPayment}>
            <span className="back-icon">←</span> Back to Payment
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
                    onClick={() => window.location.reload()}
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
                  {new Date(formData.booking_date).toLocaleDateString("en-PH", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
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
            <li>Booking will be marked as "Pending" until admin approval</li>
            <li>
              Cancellations allowed within{" "}
              <strong>24 hours after approval</strong>
            </li>
          </ul>
        </div>

        <div className="step-footer premium">
          <button
            className="btn btn-secondary premium"
            onClick={handleBackToPayment}
          >
            Back to Payment
          </button>
          <button
            className="btn btn-primary premium"
            onClick={handleFinalConfirmation}
            disabled={loading || !paymentIntentId}
          >
            {loading ? (
              <>
                <span className="spinner small"></span>
                Confirming Booking...
              </>
            ) : (
              "Confirm Booking & Reserve Slot"
            )}
          </button>
        </div>
      </div>
    );
  };

  // Step 6: Confirmation
  const renderConfirmation = () => (
    <div className="premium-step confirmation-step">
      <div className="confirmation-header premium">
        <div className="confirmation-icon">
          <span className="icon-check">✓</span>
        </div>
        <h1 className="confirmation-title">Booking Confirmed!</h1>
        <p className="confirmation-subtitle">
          Your appointment has been successfully booked
        </p>
      </div>

      <div className="confirmation-content premium">
        <div className="confirmation-card success premium">
          <div className="card-header">
            <h4>Booking Details</h4>
            <div className="booking-id">#{bookingId}</div>
          </div>
          <div className="card-content">
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className="detail-value status pending">
                PENDING APPROVAL
              </span>
            </div>
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
              <span className="detail-label">Date & Time:</span>
              <span className="detail-value">
                {new Date(formData.booking_date).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                at {formData.booking_time}
              </span>
            </div>
            <div className="detail-item success">
              <span className="detail-label">Payment:</span>
              <span className="detail-value status success">
                Downpayment Verified ✓
              </span>
            </div>
            <div className="detail-item success">
              <span className="detail-label">Slot Status:</span>
              <span className="detail-value status success">
                Slot Reserved ✓
              </span>
            </div>
          </div>
        </div>

        <div className="next-steps-card premium">
          <h4>📝 What happens next?</h4>
          <ol className="steps-list">
            <li>We'll verify your payment proof within 24 hours</li>
            <li>You'll receive an email confirmation once approved</li>
            <li>Check your booking status anytime using your email</li>
            <li>Contact us if you have any questions</li>
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
          onClick={() => (window.location.href = "/")}
        >
          Back to Home
        </button>
        <button
          className="btn btn-outline premium"
          onClick={() =>
            (window.location.href = `/booking-history?email=${encodeURIComponent(formData.email)}`)
          }
        >
          View My Bookings
        </button>
      </div>
    </div>
  );

  return (
    <div className="booking-system-premium">
      <div className="booking-header premium">
        <h1>Book an Appointment</h1>
        <p>Complete the following steps to secure your appointment</p>
      </div>

      <PremiumProgressBar />

      <div className="booking-content premium">
        {step === 1 && renderServiceSelection()}
        {step === 2 && renderDateTimeSelection()}
        {step === 3 && renderCustomerInfo()}
        {step === 4 && renderPaymentInstructions()}
        {step === 5 && renderBookingPreview()}
        {step === 6 && renderConfirmation()}
      </div>
    </div>
  );
};

export default Booking;
