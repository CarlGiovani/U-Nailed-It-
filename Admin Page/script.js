// Back button (kept)
function goBack() {
  window.history.back();
}

/**
 * IMPORTANT FIXES:
 * 1) Settings are now normalized (merged with defaults) so missing keys won't crash.
 * 2) applySettingsToUI/persistFromUI guard null elements safely.
 * 3) init runs after DOM is ready (extra safety).
 */

const STORAGE_KEYS = {
  session: "unailedit_session",
  settings: "unailedit_settings",
};

function safeParse(json, fallback) {
  try { return JSON.parse(json); } catch { return fallback; }
}

function defaultSettings() {
  return {
    profile: { displayName: "", emailUser: "", phone: "" },
    appearance: { darkMode: false, compact: false },
    notifications: { newBooking: true, reminders: true, dailySummary: true },
    security: { requirePin: false, lastPasswordChange: null },
    prefs: { defaultSection: "section-dashboard" },
  };
}

// Deep-ish merge for our known structure
function normalizeSettings(raw) {
  const d = defaultSettings();
  const r = raw && typeof raw === "object" ? raw : {};

  return {
    profile: { ...d.profile, ...(r.profile || {}) },
    appearance: { ...d.appearance, ...(r.appearance || {}) },
    notifications: { ...d.notifications, ...(r.notifications || {}) },
    security: { ...d.security, ...(r.security || {}) },
    prefs: { ...d.prefs, ...(r.prefs || {}) },
  };
}

function loadSettings() {
  const raw = safeParse(localStorage.getItem(STORAGE_KEYS.settings), null);
  return normalizeSettings(raw);
}

function saveSettings(next) {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next));
}

function setMsg(el, msg) {
  if (!el) return;
  el.textContent = msg;
  if (msg) {
    setTimeout(() => {
      if (el.textContent === msg) el.textContent = "";
    }, 2500);
  }
}

function $(id) {
  return document.getElementById(id);
}

const elements = {
  body: document.body,
  main: null,

  loginView: null,
  dashboardView: null,

  loginForm: null,
  loginUser: null,
  loginPass: null,
  loginError: null,
  forgotBtn: null,

  // Settings
  setDisplayName: null,
  setEmailUser: null,
  setPhone: null,
  saveProfileBtn: null,
  resetProfileBtn: null,
  profileMsg: null,

  toggleDarkMode: null,
  toggleCompact: null,
  toggleNewBooking: null,
  toggleReminders: null,
  toggleDailySummary: null,
  togglePin: null,

  newPass: null,
  confirmPass: null,
  changePassBtn: null,
  securityMsg: null,

  defaultSection: null,
  savePrefsBtn: null,
  prefsMsg: null,

  logoutSettingsBtn: null,
  clearSettingsBtn: null,
  sessionMsg: null,
};

// ---------- View handling ----------
function setView(view, { replaceHistory = false } = {}) {
  elements.body.dataset.view = view;

  const isLogin = view === "login";
  elements.loginView?.classList.toggle("view-active", isLogin);
  elements.dashboardView?.classList.toggle("view-active", !isLogin);

  elements.main?.scrollTo({ top: 0, behavior: "auto" });

  const hash = isLogin ? "#login" : "#dashboard";
  const state = { view };
  if (replaceHistory) history.replaceState(state, "", hash);
  else history.pushState(state, "", hash);

  if (!isLogin) {
    updateStatusPanel();
    maybePinGate();
    scrollToDefaultSection();
  }
}

function hydrateInitialView() {
  const session = safeParse(localStorage.getItem(STORAGE_KEYS.session), null);
  const hash = (location.hash || "").toLowerCase();
  const shouldDash = (session && session.loggedIn) || hash === "#dashboard";

  if (shouldDash) {
    elements.body.dataset.view = "dashboard";
    elements.loginView?.classList.remove("view-active");
    elements.dashboardView?.classList.add("view-active");
    history.replaceState({ view: "dashboard" }, "", "#dashboard");
    updateStatusPanel();
    maybePinGate();
    scrollToDefaultSection(true);
  } else {
    elements.body.dataset.view = "login";
    elements.loginView?.classList.add("view-active");
    elements.dashboardView?.classList.remove("view-active");
    history.replaceState({ view: "login" }, "", "#login");
  }
}

window.addEventListener("popstate", (e) => {
  const view = (e.state && e.state.view) || ((location.hash || "").replace("#", "") || "login");
  elements.body.dataset.view = view === "dashboard" ? "dashboard" : "login";

  const isLogin = elements.body.dataset.view === "login";
  elements.loginView?.classList.toggle("view-active", isLogin);
  elements.dashboardView?.classList.toggle("view-active", !isLogin);

  elements.main?.scrollTo({ top: 0, behavior: "auto" });
  if (!isLogin) updateStatusPanel();
});

// ---------- Login ----------
function showLoginError(msg) {
  if (elements.loginError) elements.loginError.textContent = msg;
}

function validateLogin(usernameOrEmail, password) {
  if (!usernameOrEmail) return "Please enter your email or username.";
  if (!password) return "Please enter your password.";
  if (password.length < 4) return "Password must be at least 4 characters.";
  return "";
}

// ---------- Smooth scrolling ----------
function scrollToSection(sectionId, behavior = "smooth") {
  if (elements.body.dataset.view !== "dashboard") return;
  const target = document.getElementById(sectionId);
  if (!target || !elements.main) return;

  const mainRect = elements.main.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const currentScroll = elements.main.scrollTop;
  const top = targetRect.top - mainRect.top + currentScroll - 10;

  elements.main.scrollTo({ top, behavior });
}

function scrollToDefaultSection(isInitial = false) {
  const s = loadSettings();
  const target = s.prefs?.defaultSection || "section-dashboard";
  scrollToSection(target, isInitial ? "auto" : "smooth");
}

// ---------- Status panel ----------
function pad2(n) {
  return String(n).padStart(2, "0");
}

function updateStatusPanel() {
  const dateEl = $("statusDate");
  const timeEl = $("statusTime");
  const totalEl = $("statusTotal");
  const leftEl = $("statusLeft");
  const nextEl = $("statusNext");
  if (!dateEl || !timeEl || !totalEl || !leftEl || !nextEl) return;

  const now = new Date();
  const dateStr = `${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}-${now.getFullYear()}`;
  const timeStr = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;

  const appointments = [
    { time: "10:30 AM", client: "K. Rivera" },
    { time: "1:15 PM", client: "S. Nguyen" },
    { time: "4:45 PM", client: "M. Johnson" },
  ];

  const currentHour = now.getHours();
  const left = currentHour < 11 ? 3 : currentHour < 14 ? 2 : currentHour < 17 ? 1 : 0;
  const next = left === 0 ? "No remaining appointments" : `${appointments[3 - left].time} • ${appointments[3 - left].client}`;

  dateEl.textContent = dateStr;
  timeEl.textContent = timeStr;

  const s = loadSettings();
  if (s.notifications?.dailySummary === false) {
    totalEl.textContent = "—";
    leftEl.textContent = "—";
    nextEl.textContent = "Daily summary disabled";
  } else {
    totalEl.textContent = String(appointments.length);
    leftEl.textContent = String(left);
    nextEl.textContent = next;
  }
}

setInterval(() => {
  if (document.body.dataset.view === "dashboard") updateStatusPanel();
}, 1000);

// ---------- Demo actions ----------
document.addEventListener("click", (e) => {
  const actionBtn = e.target && e.target.closest && e.target.closest("[data-action]");
  if (!actionBtn) return;

  const action = actionBtn.getAttribute("data-action");
  const row = actionBtn.closest(".table-row");
  const nameCell = row ? row.querySelector(".td:nth-child(5)") : null;
  const who = nameCell ? nameCell.textContent : "client";

  const s = loadSettings();
  const notify = s.notifications?.newBooking !== false;

  if (!notify) return;

  if (action === "approve") alert(`Approved booking request for ${who}. (demo)`);
  if (action === "decline") alert(`Declined booking request for ${who}. (demo)`);
});

// ---------- Settings UI ----------
function applySettingsToUI(s) {
  // Profile
  if (elements.setDisplayName) elements.setDisplayName.value = s.profile.displayName || "";
  if (elements.setEmailUser) elements.setEmailUser.value = s.profile.emailUser || "";
  if (elements.setPhone) elements.setPhone.value = s.profile.phone || "";

  // Toggles
  if (elements.toggleDarkMode) elements.toggleDarkMode.checked = !!s.appearance.darkMode;
  if (elements.toggleCompact) elements.toggleCompact.checked = !!s.appearance.compact;

  if (elements.toggleNewBooking) elements.toggleNewBooking.checked = !!s.notifications.newBooking;
  if (elements.toggleReminders) elements.toggleReminders.checked = !!s.notifications.reminders;
  if (elements.toggleDailySummary) elements.toggleDailySummary.checked = !!s.notifications.dailySummary;

  if (elements.togglePin) elements.togglePin.checked = !!s.security.requirePin;

  // Prefs
  if (elements.defaultSection) elements.defaultSection.value = s.prefs.defaultSection || "section-dashboard";

  // Apply classes (always safe)
  elements.body.classList.toggle("dark", !!s.appearance.darkMode);
  elements.body.classList.toggle("compact", !!s.appearance.compact);
}

function persistFromUI() {
  const s = loadSettings();

  // If any setting element doesn't exist, just skip it safely.
  if (elements.setDisplayName) s.profile.displayName = (elements.setDisplayName.value || "").trim();
  if (elements.setEmailUser) s.profile.emailUser = (elements.setEmailUser.value || "").trim();
  if (elements.setPhone) s.profile.phone = (elements.setPhone.value || "").trim();

  if (elements.toggleDarkMode) s.appearance.darkMode = !!elements.toggleDarkMode.checked;
  if (elements.toggleCompact) s.appearance.compact = !!elements.toggleCompact.checked;

  if (elements.toggleNewBooking) s.notifications.newBooking = !!elements.toggleNewBooking.checked;
  if (elements.toggleReminders) s.notifications.reminders = !!elements.toggleReminders.checked;
  if (elements.toggleDailySummary) s.notifications.dailySummary = !!elements.toggleDailySummary.checked;

  if (elements.togglePin) s.security.requirePin = !!elements.togglePin.checked;

  if (elements.defaultSection) s.prefs.defaultSection = elements.defaultSection.value || "section-dashboard";

  saveSettings(s);
  applySettingsToUI(s);
  updateStatusPanel();
}

function bindSettingsEvents() {
  const liveEls = [
    elements.toggleDarkMode,
    elements.toggleCompact,
    elements.toggleNewBooking,
    elements.toggleReminders,
    elements.toggleDailySummary,
    elements.togglePin,
    elements.defaultSection,
  ];

  liveEls.forEach((el) => {
    if (!el) return;
    el.addEventListener("change", persistFromUI);
  });

  elements.saveProfileBtn?.addEventListener("click", () => {
    persistFromUI();
    setMsg(elements.profileMsg, "Profile saved.");
  });

  elements.resetProfileBtn?.addEventListener("click", () => {
    const s = loadSettings();
    s.profile = { displayName: "", emailUser: "", phone: "" };
    saveSettings(s);
    applySettingsToUI(s);
    setMsg(elements.profileMsg, "Profile reset.");
  });

  elements.savePrefsBtn?.addEventListener("click", () => {
    persistFromUI();
    setMsg(elements.prefsMsg, "Preferences saved.");
  });

  elements.changePassBtn?.addEventListener("click", () => {
    const np = (elements.newPass?.value || "").trim();
    const cp = (elements.confirmPass?.value || "").trim();

    if (!np || !cp) return setMsg(elements.securityMsg, "Please fill both password fields.");
    if (np.length < 6) return setMsg(elements.securityMsg, "Password must be at least 6 characters.");
    if (np !== cp) return setMsg(elements.securityMsg, "Passwords do not match.");

    const s = loadSettings();
    s.security.lastPasswordChange = Date.now();
    saveSettings(s);

    if (elements.newPass) elements.newPass.value = "";
    if (elements.confirmPass) elements.confirmPass.value = "";
    setMsg(elements.securityMsg, "Password changed (demo).");
  });

  elements.logoutSettingsBtn?.addEventListener("click", () => {
    doLogout();
    setMsg(elements.sessionMsg, "Logged out.");
  });

  elements.clearSettingsBtn?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEYS.settings);
    const s = loadSettings();
    applySettingsToUI(s);
    setMsg(elements.sessionMsg, "Saved settings cleared.");
    updateStatusPanel();
  });
}

function doLogout() {
  localStorage.removeItem(STORAGE_KEYS.session);
  if (elements.loginUser) elements.loginUser.value = "";
  if (elements.loginPass) elements.loginPass.value = "";
  showLoginError("");
  setView("login");
}

// ---------- PIN gate (demo) ----------
function maybePinGate() {
  const s = loadSettings();
  if (!s.security.requirePin) return;

  const pin = prompt("Enter PIN to continue (demo PIN: 1234):");
  if (pin !== "1234") {
    alert("Incorrect PIN. Returning to login.");
    doLogout();
  }
}

// ---------- Init ----------
function wireDomRefs() {
  elements.main = $("mainScroll");

  elements.loginView = $("loginView");
  elements.dashboardView = $("dashboardView");

  elements.loginForm = $("loginForm");
  elements.loginUser = $("loginUser");
  elements.loginPass = $("loginPass");
  elements.loginError = $("loginError");
  elements.forgotBtn = $("forgotBtn");

  elements.setDisplayName = $("setDisplayName");
  elements.setEmailUser = $("setEmailUser");
  elements.setPhone = $("setPhone");
  elements.saveProfileBtn = $("saveProfileBtn");
  elements.resetProfileBtn = $("resetProfileBtn");
  elements.profileMsg = $("profileMsg");

  elements.toggleDarkMode = $("toggleDarkMode");
  elements.toggleCompact = $("toggleCompact");
  elements.toggleNewBooking = $("toggleNewBooking");
  elements.toggleReminders = $("toggleReminders");
  elements.toggleDailySummary = $("toggleDailySummary");
  elements.togglePin = $("togglePin");

  elements.newPass = $("newPass");
  elements.confirmPass = $("confirmPass");
  elements.changePassBtn = $("changePassBtn");
  elements.securityMsg = $("securityMsg");

  elements.defaultSection = $("defaultSection");
  elements.savePrefsBtn = $("savePrefsBtn");
  elements.prefsMsg = $("prefsMsg");

  elements.logoutSettingsBtn = $("logoutSettingsBtn");
  elements.clearSettingsBtn = $("clearSettingsBtn");
  elements.sessionMsg = $("sessionMsg");
}

function bindCoreEvents() {
  // Bottom navigation clicks
  document.querySelectorAll("#bottomNav button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sectionId = btn.getAttribute("data-target");
      if (sectionId) scrollToSection(sectionId);
    });
  });

  // Login submit
  elements.loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const user = (elements.loginUser?.value || "").trim();
    const pass = (elements.loginPass?.value || "").trim();
    const error = validateLogin(user, pass);

    if (error) return showLoginError(error);

    showLoginError("");

    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({
      loggedIn: true,
      user: user,
      at: Date.now(),
    }));

    const s = loadSettings();
    if (!s.profile.emailUser) {
      s.profile.emailUser = user;
      if (!s.profile.displayName) s.profile.displayName = "Admin";
      saveSettings(s);
    }

    setView("dashboard");
  });

  elements.forgotBtn?.addEventListener("click", () => {
    alert("Forgot Password (demo): Please contact the salon admin to reset your access.");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireDomRefs();

  const s = loadSettings();
  applySettingsToUI(s);

  bindCoreEvents();
  bindSettingsEvents();
  hydrateInitialView();
});
