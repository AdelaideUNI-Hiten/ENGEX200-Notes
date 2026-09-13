// Dark/light toggle shared by index.html and note.html. Persists in localStorage
// and is read by viewer.js to decide the default iframe invert-filter state.
(function () {
  const STORAGE_KEY = "engex200:theme";

  function getStored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStored(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      /* ignore (private mode etc.) */
    }
  }

  function systemPrefersLight() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  }

  function currentTheme() {
    return getStored() || (systemPrefersLight() ? "light" : "dark");
  }

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.querySelectorAll("[data-theme-icon]").forEach((el) => {
      el.textContent = theme === "light" ? "☀️" : "🌙";
    });
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
      btn.title = theme === "light" ? "Switch to dark mode" : "Switch to light mode";
    });
    window.dispatchEvent(new CustomEvent("engex200:themechange", { detail: { theme } }));
  }

  function toggle() {
    const next = currentTheme() === "light" ? "dark" : "light";
    setStored(next);
    apply(next);
  }

  apply(currentTheme());

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-theme-toggle]");
    if (btn) toggle();
  });

  window.EngexTheme = { current: currentTheme, toggle, apply };
})();
