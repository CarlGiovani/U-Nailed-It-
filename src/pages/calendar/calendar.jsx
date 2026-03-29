import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import addWeeks from "date-fns/addWeeks";
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import toast, { Toaster } from "react-hot-toast";

import supabase from "../../../config/supabaseClient.js";
import AdminLayout from "../../components/layout/adminLayout";
import { getAllBookings } from "../../services/BACKEND/adminBookingApi";
import {
  blockDayGlobally,
  createSlotsBulk,
  deleteSlot,
  getAvailableSlots,
  getMonthlyAvailability,
  unblockDayGlobally,
  updateSlot,
} from "../../services/BACKEND/adminCalendarApi";
import { getAllServicesAdmin } from "../../services/BACKEND/adminServiceApi";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/calendar.css";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const ACTIVE_BOOKING_STATUSES = ["pending_approval", "approved"];

/* ================= TIME HELPERS ================= */
const normalizeTime = (time) => {
  if (!time) return "";

  const raw = String(time).trim();

  const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hour = Number(ampmMatch[1]);
    const minute = ampmMatch[2];
    const modifier = ampmMatch[3].toUpperCase();

    if (modifier === "AM" && hour === 12) hour = 0;
    if (modifier === "PM" && hour !== 12) hour += 12;

    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  const parts = raw.split(":");
  if (parts.length >= 2) {
    const hour = String(parts[0]).padStart(2, "0");
    const minute = String(parts[1]).padStart(2, "0");
    return `${hour}:${minute}`;
  }

  return raw;
};

const formatTime12h = (time) => {
  if (!time) return "";

  const normalized = normalizeTime(time);
  if (!normalized) return "";

  const [hourStr, minute] = normalized.split(":");
  let hour = Number(hourStr);

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;

  return `${hour}:${minute} ${ampm}`;
};

const normalizeBookingDate = (value) => {
  return value?.split("T")[0] || value || "";
};

const AdminCalendar = () => {
  const queryClient = useQueryClient();

  const [selectedService, setSelectedService] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [timeInputs, setTimeInputs] = useState([""]);
  const [weeklyRecurring, setWeeklyRecurring] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTime, setEditedTime] = useState("");
  const [editError, setEditError] = useState("");
  const [selectedRange, setSelectedRange] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "primary",
    onConfirm: null,
  });

  const SERVICES_QUERY_KEY = useMemo(() => ["admin-calendar-services"], []);

  const BOOKINGS_QUERY_KEY = useMemo(() => ["admin-calendar-bookings"], []);

  const MONTH_QUERY_KEY = useMemo(
    () => [
      "admin-calendar-month",
      selectedService,
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
    ],
    [selectedService, currentDate],
  );

  const SLOTS_QUERY_KEY = useMemo(
    () => ["admin-calendar-slots", selectedService, selectedDate],
    [selectedService, selectedDate],
  );

  /* ================= QUERIES ================= */
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: SERVICES_QUERY_KEY,
    queryFn: async () => {
      const data = await getAllServicesAdmin();
      return data?.data || data || [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (!selectedService && services.length > 0) {
      setSelectedService(services[0].id);
    }
  }, [services, selectedService]);

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: BOOKINGS_QUERY_KEY,
    queryFn: async () => {
      const result = await getAllBookings({
        page: 1,
        limit: 1000,
      });
      return result?.data || [];
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const { data: monthAvailability = [], isLoading: monthLoading } = useQuery({
    queryKey: MONTH_QUERY_KEY,
    queryFn: async () => {
      if (!selectedService) return [];
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const availability = await getMonthlyAvailability(
        selectedService,
        year,
        month,
      );
      return availability || [];
    },
    enabled: !!selectedService,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: SLOTS_QUERY_KEY,
    queryFn: async () => {
      if (!selectedService || !selectedDate) return [];

      const data = await getAvailableSlots(selectedService, selectedDate);
      const slotData = data || [];

      return slotData
        .map((slot) => ({
          ...slot,
          time: normalizeTime(slot.time),
        }))
        .sort((a, b) => a.time.localeCompare(b.time));
    },
    enabled: !!selectedService && !!selectedDate,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  /* ================= DERIVED ================= */
  useEffect(() => {
    if (slots.length === 0) {
      setIsBlocked(false);
      return;
    }

    const hasAvailable = slots.some((slot) => slot.is_available);
    setIsBlocked(!hasAvailable);
  }, [slots]);

  const isPageLoading =
    servicesLoading || bookingsLoading || monthLoading || loading;

  const events = useMemo(() => {
    return (monthAvailability || []).map((day) => {
      const count = bookings.filter((booking) => {
        const bookingDate = normalizeBookingDate(booking.booking_date);

        return (
          bookingDate === day.date &&
          ACTIVE_BOOKING_STATUSES.includes(booking.status)
        );
      }).length;

      return {
        title: day.available
          ? `Available (${count} booked)`
          : `Blocked (${count} booked)`,
        start: new Date(day.date),
        end: new Date(day.date),
        allDay: true,
      };
    });
  }, [monthAvailability, bookings]);

  const openConfirmModal = ({
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "primary",
    onConfirm,
  }) => {
    setConfirmModal({
      open: true,
      title,
      message,
      confirmText,
      cancelText,
      variant,
      onConfirm,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      open: false,
      title: "",
      message: "",
      confirmText: "Confirm",
      cancelText: "Cancel",
      variant: "primary",
      onConfirm: null,
    });
  };

  const handleTimeInputChange = (index, value) => {
    setTimeInputs((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addTimeInput = () => {
    setTimeInputs((prev) => [...prev, ""]);
  };

  const removeTimeInput = (index) => {
    setTimeInputs((prev) => {
      if (prev.length === 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  };

  const refreshBookings = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
  }, [queryClient, BOOKINGS_QUERY_KEY]);

  const refreshMonth = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ["admin-calendar-month"],
    });
  }, [queryClient]);

  const refreshSlots = useCallback(
    async (dateStr = selectedDate) => {
      if (!selectedService || !dateStr) return;

      await queryClient.invalidateQueries({
        queryKey: ["admin-calendar-slots", selectedService, dateStr],
      });
    },
    [queryClient, selectedService, selectedDate],
  );

  const refreshCalendarData = async (dateStr = selectedDate) => {
    await Promise.all([
      refreshBookings(),
      refreshMonth(),
      refreshSlots(dateStr),
    ]);
  };

  /* ================= REALTIME ================= */
  useEffect(() => {
    if (!selectedService) return;

    const slotsChannel = supabase
      .channel(`admin-calendar-slots-${selectedService}`)
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

          const rowServiceId = Number(row.service_id);

          if (rowServiceId === Number(selectedService)) {
            await refreshMonth();

            if (selectedDate) {
              await refreshSlots(selectedDate);
            }
          }

          await refreshBookings();
        },
      )
      .subscribe();

    const bookingsChannel = supabase
      .channel("admin-calendar-bookings")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        async () => {
          await refreshBookings();
          await refreshMonth();

          if (selectedDate) {
            await refreshSlots(selectedDate);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(slotsChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, [
    selectedService,
    selectedDate,
    refreshBookings,
    refreshMonth,
    refreshSlots,
  ]);

  /* ================= GLOBAL BOOKING CHECK ================= */
  const isTimeGloballyBooked = useCallback(
    (dateStr, time) => {
      if (!Array.isArray(bookings) || !dateStr || !time) return false;

      const normalizedTargetTime = normalizeTime(time);

      return bookings.some((booking) => {
        const bookingDate = normalizeBookingDate(booking.booking_date);

        return (
          bookingDate === dateStr &&
          normalizeTime(booking.booking_time) === normalizedTargetTime &&
          ACTIVE_BOOKING_STATUSES.includes(booking.status)
        );
      });
    },
    [bookings],
  );

  /* ================= DAY STYLE ================= */
  const dayPropGetter = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cleanDate = new Date(date);
    cleanDate.setHours(0, 0, 0, 0);

    if (cleanDate < today) {
      return {
        style: {
          backgroundColor: "#f3f4f6",
          pointerEvents: "none",
          opacity: 0.6,
        },
      };
    }

    if (
      selectedRange &&
      cleanDate >= selectedRange.start &&
      cleanDate <= selectedRange.end
    ) {
      return {
        style: {
          backgroundColor: "#c7e3ff",
          border: "2px solid #3b82f6",
        },
      };
    }

    return {};
  };

  /* ================= SELECT DAY ================= */
  const handleSelectSlot = async ({ start, end, action }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cleanStart = new Date(start);
    cleanStart.setHours(0, 0, 0, 0);

    if (cleanStart < today) {
      toast.error("Cannot select past dates.");
      return;
    }

    const startDate = format(start, "yyyy-MM-dd");

    const adjustedEnd = new Date(end);
    adjustedEnd.setDate(adjustedEnd.getDate() - 1);
    adjustedEnd.setHours(0, 0, 0, 0);

    const endDate = format(adjustedEnd, "yyyy-MM-dd");

    setSelectedDate(startDate);
    setRangeStart(startDate);
    setRangeEnd(endDate);

    setSelectedRange({
      start: cleanStart,
      end: adjustedEnd,
    });

    await refreshSlots(startDate);

    if (action === "select" && startDate !== endDate) {
      setTimeInputs([""]);
      setShowGenerator(true);
    }
  };

  /* ================= VALIDATIONS ================= */
  const isSlotBooked = (slot) => {
    return isTimeGloballyBooked(selectedDate, slot.time);
  };

  const isPastTime = (slot) => {
    if (!selectedDate) return false;

    const normalizedTime = normalizeTime(slot.time);
    if (!normalizedTime) return false;

    const now = new Date();
    const slotDateTime = new Date(`${selectedDate}T${normalizedTime}:00`);

    return slotDateTime < now;
  };

  const isDuplicateTime = (time) => {
    const normalizedTarget = normalizeTime(time);

    return slots.some((slot) => {
      return (
        normalizeTime(slot.time) === normalizedTarget &&
        slot.id !== selectedSlot?.id
      );
    });
  };

  /* ================= MUTATIONS ================= */
  const updateSlotMutation = useMutation({
    mutationFn: ({ id, payload }) => updateSlot(id, payload),
  });

  const deleteSlotMutation = useMutation({
    mutationFn: deleteSlot,
  });

  const blockDayMutation = useMutation({
    mutationFn: blockDayGlobally,
  });

  const unblockDayMutation = useMutation({
    mutationFn: unblockDayGlobally,
  });

  const createSlotsBulkMutation = useMutation({
    mutationFn: createSlotsBulk,
  });

  /* ================= TOGGLE SLOT ================= */
  const toggleSlot = async (slot) => {
    if (isSlotBooked(slot)) {
      return toast.error("Cannot modify. Slot has active booking.");
    }

    if (isPastTime(slot)) {
      return toast.error("Cannot modify past time.");
    }

    try {
      setLoading(true);

      await updateSlotMutation.mutateAsync({
        id: slot.id,
        payload: { is_available: !slot.is_available },
      });

      await refreshCalendarData(selectedDate);
      setShowSlotModal(false);
      toast.success("Slot updated.");
    } catch (err) {
      console.error("Error toggling slot:", err);
      toast.error(err?.response?.data?.error || "Failed to update slot.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE SLOT ================= */
  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;

    if (isSlotBooked(selectedSlot)) {
      return toast.error("Cannot delete. Slot has active booking.");
    }

    if (isPastTime(selectedSlot)) {
      return toast.error("Cannot delete past slot.");
    }

    openConfirmModal({
      title: "Delete Slot",
      message: `Are you sure you want to delete the slot at ${formatTime12h(selectedSlot.time)}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        try {
          setLoading(true);
          await deleteSlotMutation.mutateAsync(selectedSlot.id);
          await refreshCalendarData(selectedDate);
          setShowSlotModal(false);
          closeConfirmModal();
          toast.success("Slot deleted.");
        } catch (err) {
          console.error("Error deleting slot:", err);
          toast.error(err?.response?.data?.error || "Failed to delete slot.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  /* ================= BLOCK DAY ================= */
  const handleBlockDay = async () => {
    if (!selectedDate) return;

    openConfirmModal({
      title: "Block Day",
      message: `Are you sure you want to block all slots for ${selectedDate}?`,
      confirmText: "Block Day",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        try {
          setLoading(true);
          await blockDayMutation.mutateAsync(selectedDate);
          await refreshCalendarData(selectedDate);
          closeConfirmModal();
          toast.success("Day blocked.");
        } catch (err) {
          console.error("Error blocking day:", err);
          toast.error(err?.response?.data?.error || "Failed to block day.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleUnblockDay = async () => {
    if (!selectedDate) return;

    openConfirmModal({
      title: "Unblock Day",
      message: `Are you sure you want to unblock ${selectedDate}?`,
      confirmText: "Unblock Day",
      cancelText: "Cancel",
      variant: "success",
      onConfirm: async () => {
        try {
          setLoading(true);
          await unblockDayMutation.mutateAsync(selectedDate);
          await refreshCalendarData(selectedDate);
          closeConfirmModal();
          toast.success("Day unblocked.");
        } catch (err) {
          console.error("Error unblocking day:", err);
          toast.error(err?.response?.data?.error || "Failed to unblock day.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  /* ================= AUTO GENERATE ================= */
  const autoGenerateTimes = () => {
    const generated = [];

    for (let hour = 9; hour < 18; hour++) {
      generated.push(`${String(hour).padStart(2, "0")}:00`);
      generated.push(`${String(hour).padStart(2, "0")}:30`);
    }

    setTimeInputs(generated);
  };

  /* ================= SUBMIT GENERATE ================= */
  const submitGenerateSlots = async (times, finalEnd) => {
    try {
      setLoading(true);

      await createSlotsBulkMutation.mutateAsync({
        service_id: selectedService,
        startDate: rangeStart,
        endDate: finalEnd,
        times,
      });

      await refreshCalendarData(rangeStart);
      setShowGenerator(false);
      setTimeInputs([""]);
      closeConfirmModal();
      toast.success("Slots generated!");
    } catch (err) {
      console.error("Error generating slots:", err);
      toast.error(err?.response?.data?.error || "Failed to generate slots.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= BULK GENERATE ================= */
  const handleGenerate = async () => {
    if (isBlocked) {
      return toast.error("Cannot generate. Day is blocked.");
    }

    const times = timeInputs.map((time) => normalizeTime(time)).filter(Boolean);

    if (!times.length) {
      return toast.error("Enter times.");
    }

    const uniqueTimes = [...new Set(times)];
    if (uniqueTimes.length !== times.length) {
      return toast.error("Duplicate times are not allowed.");
    }

    let finalEnd;

    if (weeklyRecurring) {
      finalEnd = format(addWeeks(new Date(rangeStart), 4), "yyyy-MM-dd");
    } else {
      finalEnd = rangeEnd || rangeStart;
    }

    if (!weeklyRecurring && slots.length > 0) {
      openConfirmModal({
        title: "Overwrite Existing Slots",
        message:
          "Slots already exist for this date. Do you want to continue generating new slots?",
        confirmText: "Continue",
        cancelText: "Cancel",
        variant: "primary",
        onConfirm: async () => {
          await submitGenerateSlots(uniqueTimes, finalEnd);
        },
      });
      return;
    }

    await submitGenerateSlots(uniqueTimes, finalEnd);
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />

      <div className="calendar-container">
        <div className="calendar-header card">
          <div>
            <h1>Calendar Management</h1>
            <p className="subtitle">
              Manage availability, slots and recurring schedules
            </p>
          </div>

          <div className="service-select">
            <label>Service</label>
            <select
              value={selectedService || ""}
              onChange={(e) => setSelectedService(Number(e.target.value))}
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="card calendar-card">
          <Calendar
            className="admin-big-calendar"
            localizer={localizer}
            events={events}
            views={[Views.MONTH, Views.WEEK]}
            selectable
            date={currentDate}
            style={{ height: "100%" }}
            onSelectSlot={handleSelectSlot}
            onNavigate={(date) => setCurrentDate(date)}
            dayPropGetter={dayPropGetter}
            longPressThreshold={10}
          />
        </div>

        {selectedDate && (
          <div className="card slot-panel">
            <div className="slot-header">
              <div>
                <h3>Slots for {selectedDate}</h3>
                {isBlocked && (
                  <span className="blocked-badge">Day Blocked</span>
                )}
              </div>

              <div className="calendar-actions">
                <button
                  className="btn-primary"
                  onClick={() => {
                    setTimeInputs([""]);
                    setShowGenerator(true);
                  }}
                >
                  Create Slots
                </button>
                <button className="btn-danger" onClick={handleBlockDay}>
                  Bulk Block Day
                </button>
                <button className="btn-success" onClick={handleUnblockDay}>
                  Bulk Unblock
                </button>
              </div>
            </div>

            {(loading || slotsLoading || bookingsLoading) && (
              <div className="loading-spinner"></div>
            )}

            <div className="slot-grid">
              {slots.map((slot) => {
                const booked = isSlotBooked(slot);
                const past = isPastTime(slot);

                return (
                  <div
                    key={slot.id}
                    className={`slot-card ${
                      slot.is_available ? "slot-available" : "slot-blocked"
                    } ${booked ? "slot-booked" : ""} ${
                      past ? "slot-past" : ""
                    }`}
                    onClick={() => {
                      if (booked || past) return;

                      setEditMode(false);
                      setEditedTime("");
                      setEditError("");
                      setSelectedSlot(slot);
                      setShowSlotModal(true);
                    }}
                  >
                    <span>{formatTime12h(slot.time)}</span>

                    {booked && <div className="slot-badge">BOOKED</div>}
                    {past && !booked && (
                      <div className="slot-badge past-badge">PAST</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showSlotModal && selectedSlot && (
          <div className="modal-overlay">
            <div className="slot-modal">
              <h3>
                {editMode ? "Edit Slot" : formatTime12h(selectedSlot.time)}
              </h3>

              {isSlotBooked(selectedSlot) && (
                <div className="warning-text">
                  This slot has an active booking.
                </div>
              )}

              {isPastTime(selectedSlot) && (
                <div className="warning-text">
                  This time has already passed.
                </div>
              )}

              {editMode && (
                <>
                  <input
                    type="time"
                    value={editedTime}
                    onChange={(e) => {
                      const newTime = e.target.value;
                      setEditedTime(newTime);

                      if (!newTime) {
                        setEditError("Please select a time.");
                      } else if (isDuplicateTime(newTime)) {
                        setEditError("Time already exists for this day.");
                      } else {
                        setEditError("");
                      }
                    }}
                  />

                  {editError && <div className="warning-text">{editError}</div>}
                </>
              )}

              {!editMode && (
                <button
                  className="btn-outline"
                  disabled={
                    isSlotBooked(selectedSlot) || isPastTime(selectedSlot)
                  }
                  onClick={() => {
                    setEditedTime(selectedSlot.time);
                    setEditMode(true);
                  }}
                >
                  Edit Time
                </button>
              )}

              {editMode && (
                <button
                  className="btn-primary"
                  disabled={!editedTime || !!editError}
                  onClick={async () => {
                    const normalizedEditedTime = normalizeTime(editedTime);

                    if (!normalizedEditedTime) {
                      return toast.error("Enter valid time.");
                    }

                    if (isDuplicateTime(normalizedEditedTime)) {
                      return toast.error("Time already exists.");
                    }

                    if (isPastTime({ time: normalizedEditedTime })) {
                      return toast.error("Cannot move to past time.");
                    }

                    try {
                      setLoading(true);

                      await updateSlotMutation.mutateAsync({
                        id: selectedSlot.id,
                        payload: {
                          time: normalizedEditedTime,
                        },
                      });

                      await refreshCalendarData(selectedDate);
                      setEditMode(false);
                      setShowSlotModal(false);
                      toast.success("Slot updated!");
                    } catch (err) {
                      console.error("Error updating slot:", err);
                      toast.error(
                        err?.response?.data?.error || "Something went wrong.",
                      );
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Save Changes
                </button>
              )}

              <button
                className="btn-primary"
                disabled={
                  isSlotBooked(selectedSlot) || isPastTime(selectedSlot)
                }
                onClick={() => toggleSlot(selectedSlot)}
              >
                {selectedSlot.is_available ? "Block Slot" : "Unblock Slot"}
              </button>

              <button
                className="btn-danger"
                disabled={
                  isSlotBooked(selectedSlot) || isPastTime(selectedSlot)
                }
                onClick={handleDeleteSlot}
              >
                Delete Slot
              </button>

              <button
                className="btn-outline"
                onClick={() => {
                  setEditMode(false);
                  setEditedTime("");
                  setEditError("");
                  setShowSlotModal(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showGenerator && (
          <div className="modal-overlay">
            <div className="generator-modal">
              <h3>Bulk Slot Generator</h3>

              <div className="range-preview">
                <p>
                  <strong>From:</strong> {rangeStart}
                </p>
                <p>
                  <strong>To:</strong>{" "}
                  {weeklyRecurring
                    ? format(addWeeks(new Date(rangeStart), 4), "yyyy-MM-dd")
                    : rangeEnd || rangeStart}
                </p>
              </div>

              <div className="time-picker-stack">
                {timeInputs.map((time, index) => (
                  <div key={index} className="time-row">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) =>
                        handleTimeInputChange(index, e.target.value)
                      }
                      className="time-row-input"
                    />

                    {timeInputs.length > 1 && (
                      <button
                        type="button"
                        className="time-row-remove"
                        onClick={() => removeTimeInput(index)}
                        aria-label={`Remove time ${index + 1}`}
                        title="Remove"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="generator-inline-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={addTimeInput}
                >
                  + Add Time
                </button>

                <button
                  type="button"
                  className="btn-outline"
                  onClick={autoGenerateTimes}
                >
                  Auto 9AM–6PM (30min)
                </button>
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={weeklyRecurring}
                  onChange={() => setWeeklyRecurring(!weeklyRecurring)}
                />
                Weekly Recurring (4 weeks)
              </label>

              <div className="modal-actions">
                <button className="btn-primary" onClick={handleGenerate}>
                  Generate
                </button>
                <button
                  className="btn-outline"
                  onClick={() => {
                    setShowGenerator(false);
                    setTimeInputs([""]);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmModal.open && (
          <div className="modal-overlay">
            <div className="confirm-modal">
              <h3>{confirmModal.title}</h3>
              <p className="confirm-message">{confirmModal.message}</p>

              <div className="modal-actions">
                <button
                  className="btn-outline"
                  onClick={closeConfirmModal}
                  disabled={loading}
                >
                  {confirmModal.cancelText}
                </button>

                <button
                  className={
                    confirmModal.variant === "danger"
                      ? "btn-danger"
                      : confirmModal.variant === "success"
                        ? "btn-success"
                        : "btn-primary"
                  }
                  onClick={async () => {
                    if (confirmModal.onConfirm) {
                      await confirmModal.onConfirm();
                    }
                  }}
                  disabled={loading}
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}

        {isPageLoading && !selectedDate && (
          <div className="calendar-loading">Loading calendar data...</div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCalendar;
