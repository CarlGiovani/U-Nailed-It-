import { useEffect, useRef } from "react";

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME = 14 * 60 * 1000; // 14 minutes

export default function useAdminAutoLogout() {
  const logoutTimer = useRef(null);
  const warningTimer = useRef(null);

  const logout = () => {
    console.warn("⚠️ Auto logout due to inactivity");

    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_user");

    window.location.href = "/";
  };

  const showWarning = () => {
    console.warn("⚠️ Session about to expire");

    alert("⚠️ Your session will expire in 1 minute due to inactivity.");
  };

  const resetTimers = () => {
    clearTimeout(logoutTimer.current);
    clearTimeout(warningTimer.current);

    warningTimer.current = setTimeout(showWarning, WARNING_TIME);
    logoutTimer.current = setTimeout(logout, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];

    events.forEach((event) => window.addEventListener(event, resetTimers));

    resetTimers(); // start timers on mount

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimers));

      clearTimeout(logoutTimer.current);
      clearTimeout(warningTimer.current);
    };
  }, []);
}
