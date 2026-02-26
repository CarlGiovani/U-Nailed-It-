import format from "date-fns/format";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import addWeeks from "date-fns/addWeeks";
import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";

import AdminLayout from "../../components/layout/adminLayout";
import { getAllServicesAdmin } from "../../services/BACKEND/adminServiceApi";
import {
  blockDayGlobally,
  unblockDayGlobally,
  createSlotsBulk,
  getAvailableSlots,
  getMonthlyAvailability,
  updateSlot,
} from "../../services/BACKEND/adminCalendarApi";

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

  const [showGenerator, setShowGenerator] = useState(false);
  const [timesInput, setTimesInput] = useState("");
  const [weeklyRecurring, setWeeklyRecurring] = useState(false);

  /* ================= LOAD SERVICES ================= */
  useEffect(() => {
    const fetchServices = async () => {
      const data = await getAllServicesAdmin();
      setServices(data);
      if (data.length) setSelectedService(data[0].id);
    };
    fetchServices();
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
        month
      );

      const mapped = availability.map((d) => ({
        title: d.available ? "Available" : "Blocked",
        start: new Date(d.date),
        end: new Date(d.date),
        allDay: true,
        resource: d.available,
      }));

      setEvents(mapped);
    };

    fetchMonth();
  }, [currentDate, selectedService]);

  /* ================= LOAD SLOTS ================= */
  const loadSlots = async (dateStr) => {
    if (!selectedService) return;
    const data = await getAvailableSlots(selectedService, dateStr);
    setSlots(data || []);
  };

  /* ================= SELECT DAY OR RANGE ================= */
  const handleSelectSlot = ({ start, end }) => {
    const startDate = format(start, "yyyy-MM-dd");
    const endDate = format(end, "yyyy-MM-dd");

    setSelectedDate(startDate);
    setRangeStart(startDate);
    setRangeEnd(endDate);

    loadSlots(startDate);
  };

  /* ================= TOGGLE SLOT ================= */
  const toggleSlot = async (slot) => {
    await updateSlot(slot.id, {
      is_available: !slot.is_available,
    });

    await loadSlots(selectedDate);
  };

  /* ================= BLOCK / UNBLOCK DAY ================= */
  const handleBlockDay = async () => {
    if (!selectedDate) return alert("Select a date first.");

    await blockDayGlobally(selectedDate);
    await loadSlots(selectedDate);
    alert("Day blocked successfully.");
  };

  const handleUnblockDay = async () => {
    if (!selectedDate) return alert("Select a date first.");

    await unblockDayGlobally(selectedDate);
    await loadSlots(selectedDate);
    alert("Day unblocked successfully.");
  };

  /* ================= AUTO TIME GENERATOR ================= */
  const autoGenerateTimes = () => {
    const generated = [];
    for (let h = 9; h < 18; h++) {
      generated.push(`${String(h).padStart(2, "0")}:00`);
      generated.push(`${String(h).padStart(2, "0")}:30`);
    }
    setTimesInput(generated.join(","));
  };

  /* ================= BULK CREATE ================= */
  const handleGenerate = async () => {
    if (!selectedService) return alert("Select a service.");
    if (!rangeStart) return alert("Select date or drag range.");

    const times = timesInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (!times.length) return alert("Enter times.");

    const finalEnd = weeklyRecurring
      ? format(addWeeks(new Date(rangeStart), 4), "yyyy-MM-dd")
      : rangeEnd || rangeStart;

    await createSlotsBulk({
      service_id: selectedService,
      startDate: rangeStart,
      endDate: finalEnd,
      times,
    });

    setShowGenerator(false);
    await loadSlots(rangeStart);
    alert("Slots generated successfully.");
  };

  return (
    <AdminLayout>
      <div className="calendar-header">
        <h1>Advanced Calendar Management</h1>

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

      <Calendar
        localizer={localizer}
        events={events}
        views={[Views.MONTH, Views.WEEK]}
        selectable
        style={{ height: 600 }}
        onSelectSlot={handleSelectSlot}
        onNavigate={(date) => setCurrentDate(date)}
        dayPropGetter={(date) => {
          const formatted = format(date, "yyyy-MM-dd");
          if (formatted === selectedDate) {
            return {
              style: {
                backgroundColor: "#fff4d6",
                border: "2px solid #d4af37",
              },
            };
          }
          return {};
        }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.resource ? "#2ecc71" : "#e74c3c",
            borderRadius: "6px",
          },
        })}
      />

      {selectedDate && (
        <div className="slot-panel">
          <h3>Slots for {selectedDate}</h3>

          <div className="slot-grid">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`slot-card ${
                  slot.is_available ? "slot-available" : "slot-blocked"
                }`}
                onClick={() => toggleSlot(slot)}
              >
                {slot.time}
              </div>
            ))}
          </div>

          <div className="calendar-actions">
            <button onClick={() => setShowGenerator(true)}>
              Bulk Generate
            </button>

            <button onClick={handleBlockDay} className="danger-btn">
              Block Entire Day
            </button>

            <button onClick={handleUnblockDay} className="success-btn">
              Unblock Day
            </button>
          </div>
        </div>
      )}

      {showGenerator && (
        <div className="modal-overlay">
          <div className="generator-modal">
            <h3>Bulk Slot Generator</h3>

            <input
              value={timesInput}
              onChange={(e) => setTimesInput(e.target.value)}
              placeholder="09:00,10:00"
            />

            <button onClick={autoGenerateTimes}>
              Auto 9AM–6PM (30min)
            </button>

            <label>
              <input
                type="checkbox"
                checked={weeklyRecurring}
                onChange={() => setWeeklyRecurring(!weeklyRecurring)}
              />
              Weekly Recurring (4 weeks)
            </label>

            <div className="modal-actions">
              <button onClick={handleGenerate}>Generate</button>
              <button onClick={() => setShowGenerator(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCalendar;