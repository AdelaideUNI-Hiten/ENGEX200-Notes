// Read-status tracking for each note: "idle" | "progress" | "done".
// Stored per note id in localStorage. Used by index.html (badges) and
// note.html (auto-mark on open/scroll + manual override).
(function () {
  const STORAGE_KEY = "engex200:progress";

  function readAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function writeAll(map) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch (e) {
      /* ignore */
    }
  }

  function get(id) {
    return readAll()[id] || "idle";
  }

  function set(id, status) {
    const map = readAll();
    map[id] = status;
    writeAll(map);
    window.dispatchEvent(new CustomEvent("engex200:progresschange", { detail: { id, status } }));
  }

  const LABELS = { idle: "Not started", progress: "In progress", done: "Done" };

  window.EngexProgress = { get, set, LABELS };
})();
