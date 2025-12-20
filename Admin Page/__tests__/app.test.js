/** @jest-environment jsdom */

function mountMinimumDOM() {
  document.body.innerHTML = `
    <main id="mainScroll"></main>

    <section id="loginView"></section>
    <section id="dashboardView"></section>

    <form id="loginForm"></form>
    <input id="loginUser" />
    <input id="loginPass" />
    <p id="loginError"></p>
    <button id="forgotBtn"></button>

    <!-- Dashboard status elements used by updateStatusPanel -->
    <strong id="statusDate"></strong>
    <strong id="statusTime"></strong>
    <strong id="statusTotal"></strong>
    <strong id="statusLeft"></strong>
    <strong id="statusNext"></strong>

    <!-- Settings elements used by wireDomRefs/applySettingsToUI -->
    <input id="setDisplayName" />
    <input id="setEmailUser" />
    <input id="setPhone" />
    <button id="saveProfileBtn"></button>
    <button id="resetProfileBtn"></button>
    <p id="profileMsg"></p>

    <input id="toggleDarkMode" type="checkbox" />
    <input id="toggleCompact" type="checkbox" />
    <input id="toggleNewBooking" type="checkbox" />
    <input id="toggleReminders" type="checkbox" />
    <input id="toggleDailySummary" type="checkbox" />
    <input id="togglePin" type="checkbox" />

    <input id="newPass" type="password" />
    <input id="confirmPass" type="password" />
    <button id="changePassBtn"></button>
    <p id="securityMsg"></p>

    <select id="defaultSection">
      <option value="section-dashboard">Dashboard</option>
      <option value="section-settings">Settings</option>
    </select>
    <button id="savePrefsBtn"></button>
    <p id="prefsMsg"></p>

    <button id="logoutSettingsBtn"></button>
    <button id="clearSettingsBtn"></button>
    <p id="sessionMsg"></p>

    <nav id="bottomNav">
      <button data-target="section-dashboard"></button>
      <button data-target="section-settings"></button>
    </nav>

    <section id="section-dashboard"></section>
    <section id="section-settings"></section>
  `;
}

describe("U NAILed It - unit tests (vanilla JS)", () => {
  beforeEach(() => {
    // Reset runtime between tests
    localStorage.clear();
    mountMinimumDOM();

    // Avoid "already declared" errors by resetting module cache
    jest.resetModules();

    // Stubs (your script uses alert/prompt in some flows)
    global.alert = jest.fn();
    global.prompt = jest.fn(() => "1234");

    // Execute your real script.js in this JSDOM environment
    require("../script.js");

    // If your script exposes wireDomRefs, call it to rebind DOM references
    if (typeof global.wireDomRefs === "function") {
      global.wireDomRefs();
    }
  });

  test("validateLogin returns expected errors", () => {
    expect(typeof global.validateLogin).toBe("function");

    expect(global.validateLogin("", "")).toMatch(/email or username/i);
    expect(global.validateLogin("user", "")).toMatch(/password/i);
    expect(global.validateLogin("user", "123")).toMatch(/at least 4/i);
    expect(global.validateLogin("user", "1234")).toBe("");
  });

  test("normalizeSettings merges defaults safely", () => {
    expect(typeof global.normalizeSettings).toBe("function");

    const merged = global.normalizeSettings({
      appearance: { darkMode: true }
    });

    expect(merged.profile).toBeDefined();
    expect(merged.notifications).toBeDefined();
    expect(merged.security).toBeDefined();
    expect(merged.prefs).toBeDefined();

    expect(merged.appearance.darkMode).toBe(true);
    expect(merged.prefs.defaultSection).toBe("section-dashboard");
  });

  test("applySettingsToUI toggles body classes based on settings", () => {
    expect(typeof global.applySettingsToUI).toBe("function");

    global.applySettingsToUI({
      profile: { displayName: "", emailUser: "", phone: "" },
      appearance: { darkMode: true, compact: true },
      notifications: { newBooking: true, reminders: true, dailySummary: true },
      security: { requirePin: false, lastPasswordChange: null },
      prefs: { defaultSection: "section-dashboard" }
    });

    expect(document.body.classList.contains("dark")).toBe(true);
    expect(document.body.classList.contains("compact")).toBe(true);
  });

  test("updateStatusPanel writes to status elements when present", () => {
    expect(typeof global.updateStatusPanel).toBe("function");

    localStorage.setItem(
      "unailedit_settings",
      JSON.stringify({ notifications: { dailySummary: true } })
    );

    global.updateStatusPanel();

    expect(document.getElementById("statusDate").textContent).not.toBe("");
    expect(document.getElementById("statusTime").textContent).not.toBe("");
  });
});
