// Client-side search across all notes. Fetches each note's HTML, indexes every
// <section id="..."> by its heading + body text (the same anchors the notes'
// own sidebar TOCs use), and renders live results into #searchResults.
(function () {
  let indexPromise = null;

  function stripTag(doc, selector) {
    doc.querySelectorAll(selector).forEach((el) => el.remove());
  }

  function buildIndexForNote(note) {
    return fetch(note.file)
      .then((res) => res.text())
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        stripTag(doc, "script, style");
        const sections = Array.from(doc.querySelectorAll("section[id]"));
        return sections.map((sec) => {
          const heading = sec.querySelector("h1, h2, h3, h4");
          const title = heading ? heading.textContent.trim() : note.title;
          const text = sec.textContent.replace(/\s+/g, " ").trim();
          return {
            noteId: note.id,
            noteTitle: note.title,
            lecture: note.lecture,
            anchor: sec.id,
            sectionTitle: title,
            text,
          };
        });
      })
      .catch(() => []);
  }

  function buildIndex() {
    if (indexPromise) return indexPromise;
    indexPromise = window.EngexNotes.load().then((notes) =>
      Promise.all(notes.map(buildIndexForNote)).then((groups) => groups.flat())
    );
    return indexPromise;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  function highlight(text, query) {
    const escaped = escapeHtml(text);
    if (!query) return escaped;
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
    return escaped.replace(re, "<mark>$1</mark>");
  }

  function snippetAround(text, query) {
    const lower = text.toLowerCase();
    const idx = lower.indexOf(query.toLowerCase());
    if (idx === -1) return text.slice(0, 140);
    const start = Math.max(0, idx - 50);
    const end = Math.min(text.length, idx + query.length + 90);
    return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
  }

  function search(entries, query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const scored = [];
    for (const e of entries) {
      const titleHit = e.sectionTitle.toLowerCase().includes(q);
      const noteTitleHit = e.noteTitle.toLowerCase().includes(q);
      const bodyIdx = e.text.toLowerCase().includes(q);
      if (!titleHit && !noteTitleHit && !bodyIdx) continue;
      let score = 0;
      if (titleHit) score += 10;
      if (noteTitleHit) score += 4;
      if (bodyIdx) score += 1;
      scored.push({ entry: e, score });
    }
    scored.sort((a, b) => b.score - a.score || a.entry.lecture - b.entry.lecture);
    return scored.slice(0, 8).map((s) => s.entry);
  }

  function render(container, results, query) {
    container.innerHTML = "";
    if (!results.length) {
      container.innerHTML = `<div class="search-empty">No matches for "${escapeHtml(query)}"</div>`;
      return;
    }
    for (const r of results) {
      const a = document.createElement("a");
      a.className = "search-result";
      a.href = `note.html?id=${encodeURIComponent(r.noteId)}#${encodeURIComponent(r.anchor)}`;
      a.innerHTML = `
        <div class="sr-title">${highlight(r.sectionTitle, query)} <span class="sr-lecture">Lecture ${r.lecture} · ${escapeHtml(r.noteTitle)}</span></div>
        <div class="sr-snippet">${highlight(snippetAround(r.text, query), query)}</div>
      `;
      container.appendChild(a);
    }
  }

  function init(inputEl, resultsEl) {
    let entries = [];
    buildIndex().then((e) => { entries = e; });

    let debounceTimer = null;
    inputEl.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      const query = inputEl.value;
      debounceTimer = setTimeout(() => {
        if (!query.trim()) {
          resultsEl.innerHTML = "";
          return;
        }
        render(resultsEl, search(entries, query), query);
      }, 120);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== inputEl && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        inputEl.focus();
      }
      if (e.key === "Escape" && document.activeElement === inputEl) {
        inputEl.value = "";
        resultsEl.innerHTML = "";
        inputEl.blur();
      }
    });
  }

  window.EngexSearch = { init };
})();
