import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import addWeeks from "date-fns/addWeeks";
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const ACTIVE_BOOKING_STATUSES = new Set(["pending_approval", "approved"]);

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

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const buildSlotDateTime = (dateStr, timeStr) => {
  const normalized = normalizeTime(timeStr);
  if (!dateStr || !normalized) return null;
  return new Date(`${dateStr}T${normalized}:00`);
};

const AdminCalendar = () => {
  const queryClient = useQueryClient();
  const realtimeRefreshRef = useRef(null);

  const [selectedService, setSelectedService] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
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

  const servicesQueryKey = useMemo(() => ["admin-calendar-services"], []);
  const bookingsQueryKey = useMemo(() => ["admin-calendar-bookings"], []);
  const monthQueryKey = useMemo(
    () => [
      "admin-calendar-month",
      selectedService,
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
    ],
    [selectedService, currentDate],
  );
  const slotsQueryKey = useMemo(
    () => ["admin-calendar-slots", selectedService, selectedDate],
    [selectedService, selectedDate],
  );

  /* ================= QUERIES ================= */
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: servicesQueryKey,
    queryFn: async () => {
      const data = await getAllServicesAdmin();
      return data?.data || data || [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!selectedService && services.length > 0) {
      setSelectedService(services[0].id);
    }
  }, [services, selectedService]);

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: bookingsQueryKey,
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
    queryKey: monthQueryKey,
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
    queryKey: slotsQueryKey,
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
  const isPageLoading =
    servicesLoading || bookingsLoading || monthLoading || loading;

  const bookingCountByDate = useMemo(() => {
    const map = new Map();

    for (const booking of bookings) {
      if (!ACTIVE_BOOKING_STATUSES.has(booking.status)) continue;

      const bookingDate = normalizeBookingDate(booking.booking_date);
      if (!bookingDate) continue;

      map.set(bookingDate, (map.get(bookingDate) || 0) + 1);
    }

    return map;
  }, [bookings]);

  const bookedDateTimeSet = useMemo(() => {
    const set = new Set();

    for (const booking of bookings) {
      if (!ACTIVE_BOOKING_STATUSES.has(booking.status)) continue;

      const bookingDate = normalizeBookingDate(booking.booking_date);
      const bookingTime = normalizeTime(booking.booking_time);

      if (!bookingDate || !bookingTime) continue;
      set.add(`${bookingDate}__${bookingTime}`);
    }

    return set;
  }, [bookings]);

  const events = useMemo(() => {
    return (monthAvailability || []).map((day) => {
      const count = bookingCountByDate.get(day.date) || 0;

      return {
        title: day.available
          ? `${count} booking${count !== 1 ? "s" : ""}`
          : `🚫 Blocked (${count})`,
        start: new Date(day.date),
        end: new Date(day.date),
        allDay: true,
      };
    });
  }, [monthAvailability, bookingCountByDate]);

  const isBlocked = useMemo(() => {
    if (slots.length === 0) return false;
    const hasAvailable = slots.some((slot) => slot.is_available);
    return !hasAvailable;
  }, [slots]);

  const slotMeta = useMemo(() => {
    const meta = new Map();
    const now = new Date();

    for (const slot of slots) {
      const normalizedTime = normalizeTime(slot.time);
      const booked = selectedDate
        ? bookedDateTimeSet.has(`${selectedDate}__${normalizedTime}`)
        : false;

      const slotDateTime = buildSlotDateTime(selectedDate, normalizedTime);
      const past = slotDateTime ? slotDateTime < now : false;

      meta.set(slot.id, { booked, past });
    }

    return meta;
  }, [slots, selectedDate, bookedDateTimeSet]);

  /* ================= MODAL HELPERS ================= */
  const openConfirmModal = useCallback(
    ({
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
    },
    [],
  );

  const closeConfirmModal = useCallback(() => {
    setConfirmModal({
      open: false,
      title: "",
      message: "",
      confirmText: "Confirm",
      cancelText: "Cancel",
      variant: "primary",
      onConfirm: null,
    });
  }, []);

  /* ================= INPUT HELPERS ================= */
  const handleTimeInputChange = useCallback((index, value) => {
    setTimeInputs((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  const addTimeInput = useCallback(() => {
    setTimeInputs((prev) => [...prev, ""]);
  }, []);

  const removeTimeInput = useCallback((index) => {
    setTimeInputs((prev) => {
      if (prev.length === 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  /* ================= REFRESH HELPERS ================= */
  const refreshBookings = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: bookingsQueryKey,
      exact: true,
    });
  }, [queryClient, bookingsQueryKey]);

  const refreshMonth = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: monthQueryKey,
      exact: true,
    });
  }, [queryClient, monthQueryKey]);

  const refreshSlots = useCallback(
    async (dateStr = selectedDate) => {
      if (!selectedService || !dateStr) return;

      await queryClient.invalidateQueries({
        queryKey: ["admin-calendar-slots", selectedService, dateStr],
        exact: true,
      });
    },
    [queryClient, selectedService, selectedDate],
  );

  const refreshCalendarData = useCallback(
    async (dateStr = selectedDate) => {
      await Promise.all([
        refreshBookings(),
        refreshMonth(),
        refreshSlots(dateStr),
      ]);
    },
    [refreshBookings, refreshMonth, refreshSlots, selectedDate],
  );

  const scheduleRealtimeRefresh = useCallback(
    ({ refreshBookingsData = true, refreshMonthData = true, dateStr } = {}) => {
      if (realtimeRefreshRef.current) {
        clearTimeout(realtimeRefreshRef.current);
      }

      realtimeRefreshRef.current = setTimeout(async () => {
        const tasks = [];

        if (refreshBookingsData) tasks.push(refreshBookings());
        if (refreshMonthData) tasks.push(refreshMonth());
        if (dateStr || selectedDate) {
          tasks.push(refreshSlots(dateStr || selectedDate));
        }

        await Promise.all(tasks);
      }, 120);
    },
    [refreshBookings, refreshMonth, refreshSlots, selectedDate],
  );

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
        (payload) => {
          const row = payload.new || payload.old;
          if (!row) return;

          const rowServiceId = Number(row.service_id);

          if (rowServiceId === Number(selectedService)) {
            scheduleRealtimeRefresh({
              refreshBookingsData: false,
              refreshMonthData: true,
              dateStr: selectedDate,
            });
          }
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
        () => {
          scheduleRealtimeRefresh({
            refreshBookingsData: true,
            refreshMonthData: true,
            dateStr: selectedDate,
          });
        },
      )
      .subscribe();

    return () => {
      if (realtimeRefreshRef.current) {
        clearTimeout(realtimeRefreshRef.current);
      }

      supabase.removeChannel(slotsChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, [selectedService, selectedDate, scheduleRealtimeRefresh]);

  /* ================= CHECKERS ================= */
  const isTimeGloballyBooked = useCallback(
    (dateStr, time) => {
      if (!dateStr || !time) return false;
      return bookedDateTimeSet.has(`${dateStr}__${normalizeTime(time)}`);
    },
    [bookedDateTimeSet],
  );

  const isSlotBooked = useCallback(
    (slot) => {
      return isTimeGloballyBooked(selectedDate, slot.time);
    },
    [isTimeGloballyBooked, selectedDate],
  );

  const isPastTime = useCallback(
    (slot) => {
      if (!selectedDate) return false;

      const slotDateTime = buildSlotDateTime(selectedDate, slot.time);
      if (!slotDateTime) return false;

      return slotDateTime < new Date();
    },
    [selectedDate],
  );

  const isDuplicateTime = useCallback(
    (time, excludeSlotId = null) => {
      const normalizedTarget = normalizeTime(time);

      return slots.some((slot) => {
        const timeMatches = normalizeTime(slot.time) === normalizedTarget;
        const isSameSlot = excludeSlotId !== null && slot.id === excludeSlotId;
        return timeMatches && !isSameSlot;
      });
    },
    [slots],
  );

  /* ================= DAY STYLE ================= */
  const dayPropGetter = useCallback(
    (date) => {
      const today = getStartOfToday();

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
    },
    [selectedRange],
  );

  /* ================= SELECT DAY / RANGE ================= */
  const handleSelectSlot = useCallback(
    async ({ start, end, action }) => {
      const today = getStartOfToday();

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
    },
    [refreshSlots],
  );

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

  /* ================= SLOT ACTIONS ================= */
  const toggleSlot = useCallback(
    async (slot) => {
      if (isSlotBooked(slot)) {
        toast.error("Cannot modify. Slot has active booking.");
        return;
      }

      if (isPastTime(slot)) {
        toast.error("Cannot modify past time.");
        return;
      }

      try {
        setLoading(true);

        await updateSlotMutation.mutateAsync({
          id: slot.id,
          payload: { is_available: !slot.is_available },
        });

        await refreshCalendarData(selectedDate);
        setShowSlotModal(false);
        toast.success(
          `Slot ${slot.is_available ? "blocked" : "unblocked"} successfully.`,
        );
      } catch (err) {
        console.error("Error toggling slot:", err);
        toast.error(err?.response?.data?.error || "Failed to update slot.");
      } finally {
        setLoading(false);
      }
    },
    [
      isSlotBooked,
      isPastTime,
      updateSlotMutation,
      refreshCalendarData,
      selectedDate,
    ],
  );

  const handleDeleteSlot = useCallback(() => {
    if (!selectedSlot) return;

    if (isSlotBooked(selectedSlot)) {
      toast.error("Cannot delete. Slot has active booking.");
      return;
    }

    if (isPastTime(selectedSlot)) {
      toast.error("Cannot delete past slot.");
      return;
    }

    openConfirmModal({
      title: "Delete Slot",
      message: `Are you sure you want to delete the slot at ${formatTime12h(selectedSlot.time)}? This action cannot be undone.`,
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
          toast.success("Slot deleted successfully.");
        } catch (err) {
          console.error("Error deleting slot:", err);
          toast.error(err?.response?.data?.error || "Failed to delete slot.");
        } finally {
          setLoading(false);
        }
      },
    });
  }, [
    selectedSlot,
    isSlotBooked,
    isPastTime,
    openConfirmModal,
    deleteSlotMutation,
    refreshCalendarData,
    selectedDate,
    closeConfirmModal,
  ]);

  /* ================= DAY ACTIONS ================= */
  const handleBlockDay = useCallback(() => {
    if (!selectedDate) return;

    openConfirmModal({
      title: "Block Day",
      message: `Are you sure you want to block all slots for ${selectedDate}? Customers will not be able to book on this day.`,
      confirmText: "Block Day",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        try {
          setLoading(true);
          await blockDayMutation.mutateAsync(selectedDate);
          await refreshCalendarData(selectedDate);
          closeConfirmModal();
          toast.success("Day blocked successfully.");
        } catch (err) {
          console.error("Error blocking day:", err);
          toast.error(err?.response?.data?.error || "Failed to block day.");
        } finally {
          setLoading(false);
        }
      },
    });
  }, [
    selectedDate,
    openConfirmModal,
    blockDayMutation,
    refreshCalendarData,
    closeConfirmModal,
  ]);

  const handleUnblockDay = useCallback(() => {
    if (!selectedDate) return;

    openConfirmModal({
      title: "Unblock Day",
      message: `Are you sure you want to unblock ${selectedDate}? Slots will become available based on existing schedules.`,
      confirmText: "Unblock Day",
      cancelText: "Cancel",
      variant: "success",
      onConfirm: async () => {
        try {
          setLoading(true);
          await unblockDayMutation.mutateAsync(selectedDate);
          await refreshCalendarData(selectedDate);
          closeConfirmModal();
          toast.success("Day unblocked successfully.");
        } catch (err) {
          console.error("Error unblocking day:", err);
          toast.error(err?.response?.data?.error || "Failed to unblock day.");
        } finally {
          setLoading(false);
        }
      },
    });
  }, [
    selectedDate,
    openConfirmModal,
    unblockDayMutation,
    refreshCalendarData,
    closeConfirmModal,
  ]);

  /* ================= GENERATOR ================= */
  const autoGenerateTimes = useCallback(() => {
    const generated = [];

    for (let hour = 9; hour < 18; hour++) {
      generated.push(`${String(hour).padStart(2, "0")}:00`);
      generated.push(`${String(hour).padStart(2, "0")}:30`);
    }

    setTimeInputs(generated);
  }, []);

  const submitGenerateSlots = useCallback(
    async (times, finalEnd) => {
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
        toast.success(
          `Slots generated successfully for ${rangeStart} ${finalEnd !== rangeStart ? `to ${finalEnd}` : ""}!`,
        );
      } catch (err) {
        console.error("Error generating slots:", err);
        toast.error(err?.response?.data?.error || "Failed to generate slots.");
      } finally {
        setLoading(false);
      }
    },
    [
      createSlotsBulkMutation,
      selectedService,
      rangeStart,
      refreshCalendarData,
      closeConfirmModal,
    ],
  );

  const handleGenerate = useCallback(async () => {
    if (isBlocked) {
      toast.error("Cannot generate slots. This day is blocked.");
      return;
    }

    const times = timeInputs.map((time) => normalizeTime(time)).filter(Boolean);

    if (!times.length) {
      toast.error("Please enter at least one time slot.");
      return;
    }

    const uniqueTimes = [...new Set(times)];
    if (uniqueTimes.length !== times.length) {
      toast.error("Duplicate times are not allowed.");
      return;
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
        message: `Slots already exist for ${rangeStart}. Generating new slots will replace existing ones. Do you want to continue?`,
        confirmText: "Yes, Overwrite",
        cancelText: "Cancel",
        variant: "danger",
        onConfirm: async () => {
          await submitGenerateSlots(uniqueTimes, finalEnd);
        },
      });
      return;
    }

    await submitGenerateSlots(uniqueTimes, finalEnd);
  }, [
    isBlocked,
    timeInputs,
    weeklyRecurring,
    rangeStart,
    rangeEnd,
    slots.length,
    openConfirmModal,
    submitGenerateSlots,
  ]);

  /* ================= HELPER FOR SLOT MODAL ================= */
  const handleEditTimeChange = (e) => {
    const newTime = e.target.value;
    setEditedTime(newTime);

    if (!newTime) {
      setEditError("Please select a time.");
      return;
    }

    if (isDuplicateTime(newTime, selectedSlot?.id)) {
      setEditError("A slot with this time already exists for this day.");
      return;
    }

    if (isTimeGloballyBooked(selectedDate, newTime)) {
      setEditError(
        "This time is already booked by a customer and cannot be used.",
      );
      return;
    }

    const isPast = (() => {
      const slotDateTime = buildSlotDateTime(selectedDate, newTime);
      return slotDateTime ? slotDateTime < new Date() : false;
    })();

    if (isPast) {
      setEditError("Cannot set slot to a past time.");
      return;
    }

    setEditError("");
  };

  const handleSaveEditedTime = async () => {
    const normalizedEditedTime = normalizeTime(editedTime);

    if (!normalizedEditedTime) {
      toast.error("Please enter a valid time.");
      return;
    }

    if (isDuplicateTime(normalizedEditedTime, selectedSlot?.id)) {
      toast.error("A slot with this time already exists for this day.");
      return;
    }

    if (isTimeGloballyBooked(selectedDate, normalizedEditedTime)) {
      toast.error("This time is already booked and cannot be used.");
      return;
    }

    const isPast = (() => {
      const slotDateTime = buildSlotDateTime(
        selectedDate,
        normalizedEditedTime,
      );
      return slotDateTime ? slotDateTime < new Date() : false;
    })();

    if (isPast) {
      toast.error("Cannot move slot to a past time.");
      return;
    }

    try {
      setLoading(true);
      await updateSlotMutation.mutateAsync({
        id: selectedSlot.id,
        payload: { time: normalizedEditedTime },
      });
      await refreshCalendarData(selectedDate);
      setEditMode(false);
      setShowSlotModal(false);
      toast.success("Slot time updated successfully!");
    } catch (err) {
      console.error("Error updating slot:", err);
      toast.error(err?.response?.data?.error || "Failed to update slot time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      <div className="calendar-container">
        <div className="calendar-header card">
          <div>
            <h1>📅 Calendar Management</h1>
            <p className="subtitle">
              Manage availability, slots, and recurring schedules
            </p>
          </div>

          <div className="service-select">
            <label>Select Service</label>
            <select
              value={selectedService || ""}
              onChange={(e) => setSelectedService(Number(e.target.value))}
              disabled={loading}
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
            style={{ height: "100%", minHeight: "650px" }}
            onSelectSlot={handleSelectSlot}
            onNavigate={setCurrentDate}
            dayPropGetter={dayPropGetter}
            longPressThreshold={10}
            popup
            messages={{
              next: "▶",
              previous: "◀",
              today: "Today",
              month: "Month",
              week: "Week",
            }}
          />
        </div>

        {selectedDate && (
          <div className="card slot-panel">
            <div className="slot-header">
              <div>
                <h3>
                  📆 Slots for {selectedDate}
                  {isBlocked && (
                    <span className="blocked-badge">Day Blocked</span>
                  )}
                </h3>
              </div>

              <div className="calendar-actions">
                <button
                  className="btn-primary"
                  onClick={() => {
                    setTimeInputs([""]);
                    setShowGenerator(true);
                  }}
                  disabled={loading || isBlocked}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Processing...
                    </>
                  ) : (
                    "✨ Create Slots"
                  )}
                </button>

                <button
                  className="btn-danger"
                  onClick={handleBlockDay}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Processing...
                    </>
                  ) : (
                    "🚫 Block Day"
                  )}
                </button>

                <button
                  className="btn-success"
                  onClick={handleUnblockDay}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Processing...
                    </>
                  ) : (
                    "✅ Unblock Day"
                  )}
                </button>
              </div>
            </div>

            {(loading || slotsLoading || bookingsLoading) && (
              <div className="loading-spinner"></div>
            )}

            {!slotsLoading && slots.length === 0 && !isBlocked && (
              <div className="empty-slots-message">
                <span>🕒 No slots available for this day.</span>
                <button
                  className="btn-outline"
                  onClick={() => {
                    setTimeInputs([""]);
                    setShowGenerator(true);
                  }}
                  style={{ marginLeft: "12px", padding: "6px 12px" }}
                >
                  Create Slots
                </button>
              </div>
            )}

            {isBlocked && slots.length === 0 && (
              <div className="empty-slots-message warning">
                ⚠️ This day is blocked. Unblock it to manage slots.
              </div>
            )}

            <div className="slot-grid">
              {slots.map((slot) => {
                const meta = slotMeta.get(slot.id) || {
                  booked: false,
                  past: false,
                };

                const booked = meta.booked;
                const past = meta.past;
                const isInteractive = !booked && !past && !loading;

                let tooltipText = "";
                if (booked) tooltipText = "🔒 This slot is already booked";
                else if (past) tooltipText = "⏰ This time has already passed";
                else if (!slot.is_available)
                  tooltipText = "🚫 This slot is blocked";
                else tooltipText = "Click to manage this slot";

                return (
                  <div
                    key={slot.id}
                    className={`slot-card ${
                      slot.is_available ? "slot-available" : "slot-blocked"
                    } ${booked ? "slot-booked" : ""} ${
                      past ? "slot-past" : ""
                    } ${!isInteractive ? "slot-non-interactive" : ""}`}
                    onClick={() => {
                      if (booked || past || loading) return;
                      setEditMode(false);
                      setEditedTime("");
                      setEditError("");
                      setSelectedSlot(slot);
                      setShowSlotModal(true);
                    }}
                    title={tooltipText}
                    role="button"
                    aria-disabled={!isInteractive}
                    tabIndex={isInteractive ? 0 : -1}
                  >
                    <span className="slot-time">
                      {formatTime12h(slot.time)}
                      {!slot.is_available && !booked && !past && " 🔒"}
                    </span>

                    {booked && (
                      <div className="slot-badge booked-badge">BOOKED</div>
                    )}
                    {past && !booked && (
                      <div className="slot-badge past-badge">PAST</div>
                    )}
                    {!slot.is_available && !booked && !past && (
                      <div className="slot-badge blocked-badge">BLOCKED</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showSlotModal && selectedSlot && (
          <div className="modal-overlay">
            <div className={`slot-modal ${loading ? "modal-busy" : ""}`}>
              <h3>
                {editMode
                  ? "✏️ Edit Slot"
                  : `🕒 ${formatTime12h(selectedSlot.time)}`}
              </h3>

              {isSlotBooked(selectedSlot) && (
                <div className="warning-text">
                  🔒 This slot has an active booking and cannot be modified.
                </div>
              )}

              {isPastTime(selectedSlot) && !isSlotBooked(selectedSlot) && (
                <div className="warning-text">
                  ⏰ This time has already passed and cannot be modified.
                </div>
              )}

              {editMode && (
                <>
                  <input
                    type="time"
                    value={editedTime}
                    disabled={loading}
                    onChange={handleEditTimeChange}
                    className="time-input-field"
                  />
                  {editError && <div className="error-text">{editError}</div>}
                </>
              )}

              {!editMode && (
                <button
                  className="btn-outline"
                  disabled={
                    isSlotBooked(selectedSlot) ||
                    isPastTime(selectedSlot) ||
                    loading
                  }
                  onClick={() => {
                    setEditedTime(selectedSlot.time);
                    setEditMode(true);
                    setEditError("");
                  }}
                >
                  Edit Time
                </button>
              )}

              {editMode && (
                <button
                  className="btn-primary"
                  disabled={!editedTime || !!editError || loading}
                  onClick={handleSaveEditedTime}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              )}

              <button
                className={`btn-${selectedSlot.is_available ? "danger" : "success"}`}
                disabled={
                  isSlotBooked(selectedSlot) ||
                  isPastTime(selectedSlot) ||
                  loading
                }
                onClick={() => toggleSlot(selectedSlot)}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Processing...
                  </>
                ) : selectedSlot.is_available ? (
                  "Block Slot"
                ) : (
                  "Unblock Slot"
                )}
              </button>

              <button
                className="btn-danger"
                disabled={
                  isSlotBooked(selectedSlot) ||
                  isPastTime(selectedSlot) ||
                  loading
                }
                onClick={handleDeleteSlot}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete Slot"
                )}
              </button>

              <button
                className="btn-outline"
                disabled={loading}
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
            <div className={`generator-modal ${loading ? "modal-busy" : ""}`}>
              <h3>✨ Bulk Slot Generator</h3>

              <div className="range-preview">
                <p>
                  <strong>📅 From:</strong> {rangeStart}
                </p>
                <p>
                  <strong>📅 To:</strong>{" "}
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
                      disabled={loading}
                      onChange={(e) =>
                        handleTimeInputChange(index, e.target.value)
                      }
                      className="time-row-input"
                      placeholder="HH:MM"
                    />
                    {timeInputs.length > 1 && (
                      <button
                        type="button"
                        className="time-row-remove"
                        onClick={() => removeTimeInput(index)}
                        aria-label={`Remove time ${index + 1}`}
                        title="Remove"
                        disabled={loading}
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
                  disabled={loading}
                >
                  + Add Time
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={autoGenerateTimes}
                  disabled={loading}
                >
                  Auto 9AM–6PM (30min)
                </button>
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={weeklyRecurring}
                  disabled={loading}
                  onChange={() => setWeeklyRecurring(!weeklyRecurring)}
                />
                🔁 Weekly Recurring (4 weeks)
              </label>

              <div className="modal-actions">
                <button
                  className="btn-primary"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Generating...
                    </>
                  ) : (
                    "Generate Slots"
                  )}
                </button>
                <button
                  className="btn-outline"
                  disabled={loading}
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
            <div className={`confirm-modal ${loading ? "modal-busy" : ""}`}>
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
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Processing...
                    </>
                  ) : (
                    confirmModal.confirmText
                  )}
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
