/* Stride Glass — runtime helpers (no dependencies)
   - Glass intensity (0–100) persisted per browser
   - Theme override: system | light | dark
   - Day-type accent: <html data-day="rest|easy|quality|long">, set server-side or via StrideGlass.setDay()
   - Top bar condenses on scroll
   - Segmented controls and bottom sheets */
(function () {
  "use strict";
  var root = document.documentElement;
  var KEY_GLASS = "stride.glass";
  var KEY_THEME = "stride.theme";
  var DAYS = ["rest", "easy", "quality", "long"];

  function read(key, fallback) {
    try { var v = localStorage.getItem(key); return v === null ? fallback : v; } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, String(value)); } catch (e) { /* storage unavailable: session-only */ }
  }

  function setGlass(pct) {
    pct = Math.max(0, Math.min(100, Number(pct)));
    if (isNaN(pct)) pct = 70;
    root.style.setProperty("--glass", (pct / 100).toFixed(2));
    write(KEY_GLASS, pct);
    document.querySelectorAll("[data-sg-glass]").forEach(function (el) {
      if (Number(el.value) !== pct) el.value = pct;
      var out = el.id && document.querySelector('output[for="' + el.id + '"]');
      if (out) out.textContent = pct + "%";
    });
  }

  function setTheme(mode) {
    if (mode === "light" || mode === "dark") root.setAttribute("data-theme", mode);
    else { root.removeAttribute("data-theme"); mode = "system"; }
    write(KEY_THEME, mode);
    document.querySelectorAll("[data-sg-theme]").forEach(function (el) { el.value = mode; });
  }

  function setDay(day) {
    if (DAYS.indexOf(day) === -1) return;
    root.setAttribute("data-day", day);
  }

  // Apply saved prefs immediately (script should be in <head> to avoid a flash)
  setGlass(read(KEY_GLASS, 70));
  setTheme(read(KEY_THEME, "system"));

  function initBar() {
    var bar = document.querySelector(".sg-bar");
    if (!bar) return;
    var ticking = false;
    function update() { bar.classList.toggle("is-condensed", window.scrollY > 24); ticking = false; }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  function initSegments() {
    document.querySelectorAll(".sg-seg").forEach(function (seg) {
      seg.addEventListener("click", function (e) {
        var btn = e.target.closest("button");
        if (!btn || !seg.contains(btn)) return;
        seg.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        seg.dispatchEvent(new CustomEvent("sg:change", { detail: { value: btn.dataset.value }, bubbles: true }));
      });
    });
  }

  function initSheets() {
    document.addEventListener("click", function (e) {
      var opener = e.target.closest("[data-sg-open]");
      if (opener) {
        var sheet = document.getElementById(opener.getAttribute("data-sg-open"));
        if (sheet && sheet.showModal) { e.preventDefault(); sheet.showModal(); }
        return;
      }
      // Tap on backdrop closes
      if (e.target.matches && e.target.matches("dialog.sg-sheet")) {
        var r = e.target.getBoundingClientRect();
        var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (!inside) e.target.close();
      }
      var closer = e.target.closest("[data-sg-close]");
      if (closer) { var d = closer.closest("dialog"); if (d) d.close(); }
    });
  }

  function initControls() {
    document.querySelectorAll("[data-sg-glass]").forEach(function (el) {
      el.value = read(KEY_GLASS, 70);
      el.addEventListener("input", function () { setGlass(el.value); });
    });
    document.querySelectorAll("[data-sg-theme]").forEach(function (el) {
      el.value = read(KEY_THEME, "system");
      el.addEventListener("change", function () { setTheme(el.value); });
    });
    setGlass(read(KEY_GLASS, 70)); // sync outputs
  }

  document.addEventListener("DOMContentLoaded", function () {
    initBar(); initSegments(); initSheets(); initControls();
  });

  window.StrideGlass = { setGlass: setGlass, setTheme: setTheme, setDay: setDay };
})();
