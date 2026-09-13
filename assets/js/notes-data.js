// Shared loader for notes/notes.json, used by index.html and note.html.
(function () {
  let cache = null;

  function load() {
    if (cache) return cache;
    cache = fetch("notes/notes.json")
      .then((res) => res.json())
      .then((list) => list.slice().sort((a, b) => a.lecture - b.lecture));
    return cache;
  }

  window.EngexNotes = { load };
})();
