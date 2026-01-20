// backend/calendarApi.js - UPDATE MO ITO
import api from "../config/axios.js";

export const getAvailableSlots = async (serviceId, date) => {
  const parsedServiceId = Number(serviceId);

  if (!parsedServiceId) {
    console.warn("⚠️ Service ID is required to fetch slots");
    return [];
  }

  try {
    console.log(
      `📅 Fetching slots for service ${parsedServiceId}, date ${
        date || "all"
      }...`
    );

    const response = await api.get("/calendar/slots", {
      params: {
        service_id: parsedServiceId,
        date: date || undefined,
      },
    });

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(
      "❌ Error fetching slots:",
      error.response?.data || error.message
    );
    return [];
  }
};

export const getMonthlyAvailability = async (serviceId, year, month) => {
  const parsedServiceId = Number(serviceId);

  if (!parsedServiceId || !year || !month) {
    console.warn("⚠️ Service ID, year, and month are required");
    return [];
  }

  try {
    const response = await api.get("/calendar/availability", {
      params: {
        service_id: parsedServiceId,
        year,
        month: String(month).padStart(2, "0"),
      },
    });

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(
      "❌ Error fetching monthly availability:",
      error.response?.data || error.message
    );
    return [];
  }
};
