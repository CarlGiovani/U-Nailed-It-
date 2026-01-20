import { useCallback, useState } from "react";
import { getAvailableSlots } from "../../backend/calendarApi";

const useSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSlots = useCallback(async (serviceId, date) => {
    if (!serviceId || !date) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAvailableSlots(serviceId, date);
      setSlots(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch slots");
    } finally {
      setLoading(false);
    }
  }, []);

  return { slots, loading, error, fetchSlots };
};

export default useSlots;
