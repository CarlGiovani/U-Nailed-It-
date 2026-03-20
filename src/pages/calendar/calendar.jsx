import addWeeks from "date-fns/addWeeks";
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import toast, { Toaster } from "react-hot-toast";

import AdminLayout from "../../components/layout/adminLayout";
import {
  blockDayGlobally,
  createSlotsBulk,
  deleteSlot,
  getAvailableSlots,
  getMonthlyAvailability,
  unblockDayGlobally,
  updateSlot,
} from "../../services/BACKEND/adminCalendarApi";

import { getAllBookings } from "../../services/BACKEND/adminBookingApi";
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

// TIME NORMALIZER HELPER
const normalizeTime = (time) => {
  if (!time) return "";

  const raw = String(time).trim();

  // Handle 12-hour format like "9:00 AM"
  const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hour = Number(ampmMatch[1]);
    const minute = ampmMatch[2];
    const modifier = ampmMatch[3].toUpperCase();

    if (modifier === "AM" && hour === 12) hour = 0;
    if (modifier === "PM" && hour !== 12) hour += 12;

    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  // Handle "HH:mm:ss" or "H:mm:ss"
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

  const [hourStr, minute] = normalizeTime(time).split(":");
  let hour = Number(hourStr);

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;

  return `${hour}:${minute} ${ampm}`;
};

const AdminCalendar = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [slots, setSlots] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [timesInput, setTimesInput] = useState("");
  const [weeklyRecurring, setWeeklyRecurring] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTime, setEditedTime] = useState("");
  const [editError, setEditError] = useState("");
  const [selectedRange, setSelectedRange] = useState(null);

  /* ================= LOAD SERVICES ================= */
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getAllServicesAdmin();
        setServices(data || []);
        if (data?.length) {
          setSelectedService(data[0].id);
        }
      } catch (err) {
        console.error("Error loading services:", err);
        setServices([]);
      }
    };

    fetchServices();
  }, []);

  /* ================= LOAD BOOKINGS ================= */
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const result = await getAllBookings({
          page: 1,
          limit: 1000,
        });

        if (result?.data) {
          setBookings(result.data);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error("Error loading bookings:", err);
        setBookings([]);
      }
    };

    fetchBookings();
  }, []);

  /* ================= LOAD MONTH ================= */
  useEffect(() => {
    if (!selectedService) return;

    const fetchMonth = async () => {
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        const availability = await getMonthlyAvailability(
          selectedService,
          year,
          month,
        );

        const mapped = (availability || []).map((day) => {
          const count = bookings.filter((booking) => {
            const bookingDate =
              booking.booking_date?.split("T")[0] || booking.booking_date;

            return (
              bookingDate === day.date &&
              Number(booking.service_id) === Number(selectedService) &&
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

        setEvents(mapped);
      } catch (err) {
        console.error("Error loading month availability:", err);
        setEvents([]);
      }
    };

    fetchMonth();
  }, [currentDate, selectedService, bookings]);

  /* ================= LOAD SLOTS ================= */
  const loadSlots = async (dateStr) => {
    if (!selectedService) return;

    try {
      const data = await getAvailableSlots(selectedService, dateStr);
      const slotData = data || [];

      const normalizedSlots = slotData.map((slot) => ({
        ...slot,
        time: normalizeTime(slot.time),
      }));

      setSlots(normalizedSlots.sort((a, b) => a.time.localeCompare(b.time)));

      if (normalizedSlots.length === 0) {
        setIsBlocked(false);
        return;
      }

      const hasAvailable = normalizedSlots.some((slot) => slot.is_available);
      setIsBlocked(!hasAvailable);
    } catch (err) {
      console.error("Error loading slots:", err);
      setSlots([]);
      setIsBlocked(false);
    }
  };
  /* ================= DAY STYLE ================= */
  const dayPropGetter = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
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
      date >= selectedRange.start &&
      date <= selectedRange.end
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
  const handleSelectSlot = ({ start, end, action }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      toast.error("Cannot select past dates.");
      return;
    }

    const startDate = format(start, "yyyy-MM-dd");

    const adjustedEnd = new Date(end);
    adjustedEnd.setDate(adjustedEnd.getDate() - 1);
    const endDate = format(adjustedEnd, "yyyy-MM-dd");

    setSelectedDate(startDate);
    setRangeStart(startDate);
    setRangeEnd(endDate);

    setSelectedRange({
      start,
      end: adjustedEnd,
    });

    loadSlots(startDate);

    if (action === "select" && startDate !== endDate) {
      setShowGenerator(true);
    }
  };

  /* ================= VALIDATIONS ================= */
  const isSlotBooked = (slot) => {
    if (!Array.isArray(bookings)) return false;

    return bookings.some((booking) => {
      const bookingDate =
        booking.booking_date?.split("T")[0] || booking.booking_date;

      return (
        bookingDate === selectedDate &&
        normalizeTime(booking.booking_time) === normalizeTime(slot.time) &&
        Number(booking.service_id) === Number(selectedService) &&
        ACTIVE_BOOKING_STATUSES.includes(booking.status)
      );
    });
  };

  const isPastTime = (slot) => {
    if (!selectedDate) return false;

    const normalizedTime = normalizeTime(slot.time);
    if (!normalizeTime) return false;

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

  /* ================= TOGGLE SLOT ================= */
  const toggleSlot = async (slot) => {
    if (isSlotBooked(slot)) {
      return toast.error("Cannot modify. Slot has booking.");
    }

    if (isPastTime(slot)) {
      return toast.error("Cannot modify past time.");
    }

    try {
      setLoading(true);

      await updateSlot(slot.id, {
        is_available: !slot.is_available,
      });

      await loadSlots(selectedDate);
      setShowSlotModal(false);
      toast.success("Slot updated.");
    } catch (err) {
      console.error("Error toggling slot:", err);
      toast.error("Failed to update slot.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE SLOT ================= */
  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;

    if (isSlotBooked(selectedSlot)) {
      return toast.error("Cannot delete. Slot has booking.");
    }

    if (isPastTime(selectedSlot)) {
      return toast.error("Cannot delete past slot.");
    }

    if (!window.confirm("Delete this slot?")) return;

    try {
      setLoading(true);

      await deleteSlot(selectedSlot.id);
      await loadSlots(selectedDate);

      setShowSlotModal(false);
      toast.success("Slot deleted.");
    } catch (err) {
      console.error("Error deleting slot:", err);
      toast.error("Failed to delete slot.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= BLOCK DAY ================= */
  const handleBlockDay = async () => {
    if (!selectedDate) return;
    if (!window.confirm("Block this entire day?")) return;

    try {
      setLoading(true);
      await blockDayGlobally(selectedDate);
      await loadSlots(selectedDate);
      toast.success("Day blocked.");
    } catch (err) {
      console.error("Error blocking day:", err);
      toast.error("Failed to block day.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockDay = async () => {
    if (!selectedDate) return;
    if (!window.confirm("Unblock this day?")) return;

    try {
      setLoading(true);
      await unblockDayGlobally(selectedDate);
      await loadSlots(selectedDate);
      toast.success("Day unblocked.");
    } catch (err) {
      console.error("Error unblocking day:", err);
      toast.error("Failed to unblock day.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= AUTO GENERATE ================= */
  const autoGenerateTimes = () => {
    const generated = [];

    for (let hour = 9; hour < 18; hour++) {
      generated.push(`${String(hour).padStart(2, "0")}:00`);
      generated.push(`${String(hour).padStart(2, "0")}:30`);
    }

    setTimesInput(generated.join(", "));
  };

  /* ================= BULK GENERATE ================= */
  const handleGenerate = async () => {
    if (isBlocked) {
      return toast.error("Cannot generate. Day is blocked.");
    }

    const times = timesInput
      .split(",")
      .map((time) => normalizeTime(time.trim))
      .filter(Boolean);

    if (!times.length) {
      return toast.error("Enter times.");
    }

    try {
      setLoading(true);

      let finalEnd;

      if (weeklyRecurring) {
        finalEnd = format(addWeeks(new Date(rangeStart), 4), "yyyy-MM-dd");
      } else {
        finalEnd = rangeEnd || rangeStart;
      }

      if (!weeklyRecurring && slots.length > 0) {
        if (!window.confirm("Slots already exist for this date. Continue?")) {
          setLoading(false);
          return;
        }
      }

      await createSlotsBulk({
        service_id: selectedService,
        startDate: rangeStart,
        endDate: finalEnd,
        times,
      });

      await loadSlots(rangeStart);
      setShowGenerator(false);
      toast.success("Slots generated!");
    } catch (err) {
      console.error("Error generating slots:", err);
      toast.error("Failed to generate slots.");
    } finally {
      setLoading(false);
    }
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
            localizer={localizer}
            events={events}
            views={[Views.MONTH, Views.WEEK]}
            selectable
            style={{ height: 650 }}
            onSelectSlot={handleSelectSlot}
            onNavigate={(date) => setCurrentDate(date)}
            dayPropGetter={dayPropGetter}
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
                  onClick={() => setShowGenerator(true)}
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

            {loading && <div className="loading-spinner"></div>}

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
                <div className="warning-text">This slot has a booking.</div>
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
                      await updateSlot(selectedSlot.id, {
                        time: normalizedEditedTime,
                      });
                      await loadSlots(selectedDate);
                      setEditMode(false);
                      setShowSlotModal(false);
                      toast.success("Slot updated!");
                    } catch (err) {
                      console.error("Error updating slot:", err);
                      toast.error("Something went wrong.");
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

              <input
                value={timesInput}
                onChange={(e) => setTimesInput(e.target.value)}
                placeholder="09:00, 10:00"
              />

              <button className="btn-outline" onClick={autoGenerateTimes}>
                Auto 9AM–6PM (30min)
              </button>

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
                  onClick={() => setShowGenerator(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCalendar;
