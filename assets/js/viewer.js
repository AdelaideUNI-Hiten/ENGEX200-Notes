// note.html logic: loads the right note into the iframe, wires prev/next,
// print, dark-mode invert filter, and progress tracking.
(function () {
  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function el(id) {
    return document.getElementById(id);
  }

  window.EngexNotes.load().then((notes) => {
    const id = qs("id");
    const idx = notes.findIndex((n) => n.id === id);
    const note = idx === -1 ? notes[0] : notes[idx];
    if (!note) {
      el("viewerTitle").textContent = "Note not found";
      return;
    }

    const frame = el("noteFrame");
    const frameWrap = el("frameWrap");
    const anchor = window.location.hash;
    frame.src = note.file + anchor;

    el("viewerTitle").innerHTML = `Lecture ${note.lecture} &middot; <strong>${note.title}</strong>`;
    document.title = `${note.title} — ENGEX200 Notes`;

    const prevNote = notes[idx - 1] || null;
    const nextNote = notes[idx + 1] || null;

    const prevBtn = el("prevBtn");
    const nextBtn = el("nextBtn");
    if (prevNote) {
      prevBtn.disabled = false;
      prevBtn.onclick = () => { window.location.href = `note.html?id=${encodeURIComponent(prevNote.id)}`; };
      prevBtn.title = `Previous: ${prevNote.title}`;
    } else {
      prevBtn.disabled = true;
    }
    if (nextNote) {
      nextBtn.disabled = false;
      nextBtn.onclick = () => { window.location.href = `note.html?id=${encodeURIComponent(nextNote.id)}`; };
      nextBtn.title = `Next: ${nextNote.title}`;
    } else {
      nextBtn.disabled = true;
    }

    // ---- progress tracking ----
    const doneCheckbox = el("markDoneCheckbox");
    const applyStatusUI = () => {
      doneCheckbox.checked = window.EngexProgress.get(note.id) === "done";
    };
    applyStatusUI();

    if (window.EngexProgress.get(note.id) === "idle") {
      window.EngexProgress.set(note.id, "progress");
    }

    doneCheckbox.addEventListener("change", () => {
      window.EngexProgress.set(note.id, doneCheckbox.checked ? "done" : "progress");
    });

    frame.addEventListener("load", () => {
      try {
        const win = frame.contentWindow;
        const doc = frame.contentDocument;
        if (!win || !doc) return;
        win.addEventListener("scroll", () => {
          const scrollTop = win.scrollY;
          const height = doc.documentElement.scrollHeight - win.innerHeight;
          const depth = height > 0 ? scrollTop / height : 0;
          if (depth > 0.9 && window.EngexProgress.get(note.id) !== "done") {
            window.EngexProgress.set(note.id, "done");
            applyStatusUI();
          }
        });
      } catch (e) {
        /* cross-origin fallback: skip auto scroll-tracking */
      }
    });

    // ---- print ----
    el("printBtn").addEventListener("click", () => {
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      } catch (e) {
        window.print();
      }
    });

    // ---- dark-mode invert filter on the iframe ----
    function syncInvert(theme) {
      frameWrap.classList.toggle("inverted", theme === "dark");
    }
    syncInvert(window.EngexTheme.current());
    window.addEventListener("engex200:themechange", (e) => syncInvert(e.detail.theme));
  });
})();
