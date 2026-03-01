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

  /* ================= LOAD SERVICES ================= */
  useEffect(() => {
    const fetchServices = async () => {
      const data = await getAllServicesAdmin();
      setServices(data);
      if (data.length) setSelectedService(data[0].id);
    };
    fetchServices();
  }, []);

  /* ================= LOAD BOOKINGS ================= */
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const result = await getAllBookings();

        // handle different possible return structures
        if (Array.isArray(result)) {
          setBookings(result);
        } else if (Array.isArray(result?.data)) {
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
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const availability = await getMonthlyAvailability(
        selectedService,
        year,
        month,
      );

      const mapped = availability.map((d) => ({
        title: d.available ? "Available" : "Blocked",
        start: new Date(d.date),
        end: new Date(d.date),
        allDay: true,
      }));

      setEvents(mapped);
    };

    fetchMonth();
  }, [currentDate, selectedService]);

  /* ================= LOAD SLOTS ================= */
  const loadSlots = async (dateStr) => {
    if (!selectedService) return;

    const data = await getAvailableSlots(selectedService, dateStr);
    const slotData = data || [];

    setSlots([...slotData].sort((a, b) => a.time.localeCompare(b.time)));

    if (slotData.length === 0) {
      setIsBlocked(false);
      return;
    }

    const hasAvailable = slotData.some((s) => s.is_available);
    setIsBlocked(!hasAvailable);
  };

  /* ================= SELECT DAY ================= */
  const handleSelectSlot = ({ start, end }) => {
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

    loadSlots(startDate);
  };

  /* ================= VALIDATIONS ================= */
  const isSlotBooked = (slot) => {
    if (!Array.isArray(bookings)) return false;

    return bookings.some(
      (b) =>
        b.date === selectedDate &&
        b.time === slot.time &&
        b.service_id === selectedService &&
        b.status !== "rejected",
    );
  };

  const isPastTime = (slot) => {
    if (!selectedDate) return false;

    const now = new Date();
    const slotDateTime = new Date(`${selectedDate}T${slot.time}:00`);

    return slotDateTime < now;
  };

  const isDuplicateTime = (time) => {
    return slots.some((s) => s.time === time && s.id !== selectedSlot?.id);
  };

  /* ================= TOGGLE SLOT ================= */
  const toggleSlot = async (slot) => {
    if (isSlotBooked(slot))
      return toast.error("Cannot modify. Slot has booking.");

    if (isPastTime(slot)) return toast.error("Cannot modify past time.");

    setLoading(true);

    await updateSlot(slot.id, {
      is_available: !slot.is_available,
    });

    await loadSlots(selectedDate);
    setShowSlotModal(false);
    setLoading(false);
  };

  /* ================= DELETE SLOT ================= */
  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;

    if (isSlotBooked(selectedSlot))
      return toast.error("Cannot delete. Slot has booking.");

    if (isPastTime(selectedSlot))
      return toast.error("Cannot delete past slot.");

    if (!window.confirm("Delete this slot?")) return;

    setLoading(true);

    await deleteSlot(selectedSlot.id);
    await loadSlots(selectedDate);

    setShowSlotModal(false);
    setLoading(false);
  };

  /* ================= BLOCK DAY ================= */
  const handleBlockDay = async () => {
    if (!selectedDate) return;
    if (!window.confirm("Block this entire day?")) return;

    setLoading(true);
    await blockDayGlobally(selectedDate);
    await loadSlots(selectedDate);
    toast.success("Day blocked.");
    setLoading(false);
  };

  const handleUnblockDay = async () => {
    if (!selectedDate) return;
    if (!window.confirm("Unblock this day?")) return;

    setLoading(true);
    await unblockDayGlobally(selectedDate);
    await loadSlots(selectedDate);
    toast.success("Day unblocked.");
    setLoading(false);
  };

  /* ================= AUTO GENERATE ================= */
  const autoGenerateTimes = () => {
    const generated = [];
    for (let h = 9; h < 18; h++) {
      generated.push(`${String(h).padStart(2, "0")}:00`);
      generated.push(`${String(h).padStart(2, "0")}:30`);
    }
    setTimesInput(generated.join(", "));
  };

  /* ================= BULK GENERATE ================= */
  const handleGenerate = async () => {
    if (isBlocked) return toast.error("Cannot generate. Day is blocked.");

    const times = timesInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (!times.length) return toast.error("Enter times.");

    setLoading(true);

    let finalEnd;

    if (weeklyRecurring) {
      finalEnd = format(addWeeks(new Date(rangeStart), 4), "yyyy-MM-dd");
    } else {
      // If user dragged multiple days → use rangeEnd
      // If single click → rangeEnd === rangeStart
      finalEnd = rangeEnd || rangeStart;
    }
    // Check if slots already exist for selected date
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
    setLoading(false);
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />

      <div className="calendar-container">
        {/* HEADER */}
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

        {/* CALENDAR */}
        <div className="card calendar-card">
          <Calendar
            localizer={localizer}
            events={events}
            views={[Views.MONTH, Views.WEEK]}
            selectable
            style={{ height: 650 }}
            onSelectSlot={handleSelectSlot}
            onNavigate={(date) => setCurrentDate(date)}
          />
        </div>

        {/* SLOT PANEL */}
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
                    className={`slot-card
                    ${slot.is_available ? "slot-available" : "slot-blocked"}
                    ${booked ? "slot-booked" : ""}
                    ${past ? "slot-past" : ""}
                  `}
                    onClick={() => {
                      if (booked || past) return;
                      setEditMode(false);
                      setEditedTime("");
                      setEditError("");
                      setSelectedSlot(slot);
                      setShowSlotModal(true);
                    }}
                  >
                    <span>{slot.time}</span>

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

        {/* SLOT MODAL */}
        {showSlotModal && selectedSlot && (
          <div className="modal-overlay">
            <div className="slot-modal">
              <h3>{editMode ? "Edit Slot" : selectedSlot.time}</h3>

              {isSlotBooked(selectedSlot) && (
                <div className="warning-text">This slot has a booking.</div>
              )}

              {isPastTime(selectedSlot) && (
                <div className="warning-text">
                  This time has already passed.
                </div>
              )}

              {/* EDIT INPUT */}
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

              {/* EDIT BUTTON */}
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

              {/* SAVE BUTTON */}
              {editMode && (
                <button
                  className="btn-primary"
                  disabled={!editedTime || editError}
                  onClick={async () => {
                    if (!editedTime) return toast.error("Enter valid time.");

                    if (isDuplicateTime(editedTime))
                      return toast.error("Time already exists.");

                    if (isPastTime({ time: editedTime }))
                      return toast.error("Cannot move to past time.");

                    try {
                      await updateSlot(selectedSlot.id, { time: editedTime });
                      toast.success("Slot updated!");
                    } catch {
                      toast.error("Something went wrong.");
                    }

                    await loadSlots(selectedDate);
                    setEditMode(false);
                    setShowSlotModal(false);
                    toast.success("Slot updated!");
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

        {/* GENERATOR MODAL */}
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
