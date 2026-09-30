/* Stride Glass — shell for the existing dashboard.
   Loads after dashboard.js. Drives the 4-group nav and sub-toggles by calling
   the existing switchTab(), and fills the Today card from /api/fuel/plan.
   It never modifies elements dashboard.js owns. */
(function () {
  "use strict";

  var GROUPS = {
    overview: { label: "Overview", tabs: [["overview", "Overview"]] },
    train:    { label: "Train",    tabs: [["train", "Train"]] },
    fuel:     { label: "Fuel",     tabs: [["fuel", "Fuel plan"], ["meals", "Meals"]] },
    stats:    { label: "Stats",    tabs: [["performance", "Performance"], ["analytics", "Analytics"]] }
  };
  var TAB_LABEL = { info: "Guide" };
  var TAB_GROUP = {};
  Object.keys(GROUPS).forEach(function (g) {
    GROUPS[g].tabs.forEach(function (t) { TAB_GROUP[t[0]] = g; TAB_LABEL[t[0]] = t[1]; });
  });
  var lastInGroup = { overview: "overview", train: "train", fuel: "fuel", stats: "performance" };

  function $(sel) { return document.querySelector(sel); }

  function currentTab() {
    var page = $(".tab-page.active");
    return page ? page.id.replace(/^tab-/, "") : "overview";
  }

  function go(tab) {
    if (typeof switchTab === "function") switchTab(tab); // eslint-disable-line no-undef
    sync();
    window.scrollTo({ top: 0 });
  }

  function sync() {
    var tab = currentTab();
    var group = TAB_GROUP[tab] || null;
    if (group) lastInGroup[group] = tab;

    document.querySelectorAll(".sg-nav .sg-tab").forEach(function (el) {
      if (el.dataset.group === group) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });

    var title = $("#sgTitle");
    if (title) title.textContent = group ? GROUPS[group].label : (TAB_LABEL[tab] || "Stride");

    var sub = $("#sgSubnav"), seg = $("#sgSeg");
    if (sub && seg) {
      var tabs = group ? GROUPS[group].tabs : [];
      if (tabs.length > 1) {
        seg.innerHTML = "";
        tabs.forEach(function (t) {
          var b = document.createElement("button");
          b.type = "button"; b.dataset.value = t[0]; b.textContent = t[1];
          b.setAttribute("aria-pressed", String(t[0] === tab));
          seg.appendChild(b);
        });
        sub.hidden = false;
      } else {
        sub.hidden = true;
      }
    }
  }

  // ---------- Today card ----------
  function accentFamily(dayType) {
    var t = String(dayType || "").toLowerCase();
    if (t.indexOf("long") !== -1) return "long";
    if (t === "rest" || t === "off") return "rest";
    if (/easy|recovery|cross|bike|ride|peloton|walk/.test(t)) return "easy";
    return "quality";
  }
  function humanize(dayType) {
    var t = String(dayType || "rest").replace(/_/g, " ").trim();
    t = t.replace(/\bmod\b/, "(moderate)").replace(/\bpeak\b/, "(peak)");
    return t.charAt(0).toUpperCase() + t.slice(1) + " day";
  }
  function pick(obj, keys) {
    var pools = [obj, obj && obj.macros, obj && obj.targets, obj && obj.totals];
    for (var p = 0; p < pools.length; p++) {
      var pool = pools[p];
      if (!pool || typeof pool !== "object") continue;
      for (var k = 0; k < keys.length; k++) {
        var v = pool[keys[k]];
        if (v !== undefined && v !== null && v !== "") return v;
      }
    }
    return null;
  }
  function fmt(n) {
    if (typeof n !== "number") return n == null ? "—" : String(n);
    return Math.round(n).toLocaleString();
  }
  function setText(id, value) { var el = document.getElementById(id); if (el) el.textContent = value; }

  function loadToday() {
    if (!$("#sgToday")) return;
    fetch("/api/fuel/plan", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (data) {
        var days = (data && data.days) || [];
        var today = days.filter(function (d) { return d.is_today; })[0];
        if (!today) throw new Error("no today");

        var family = accentFamily(today.day_type);
        if (window.StrideGlass) window.StrideGlass.setDay(family);

        setText("sgTodayType", humanize(today.day_type));

        var title, detail;
        if (today.source === "strava") {
          title = today.run_name || "Activity";
          detail = "Completed" + (today.run_miles ? " · " + today.run_miles + " mi" : "") + " · Strava";
        } else if (today.source === "runna") {
          title = today.run_name || "Planned run";
          detail = "Planned in Runna";
        } else {
          title = "Rest";
          var p = today.peloton;
          detail = p && (p.title || p.name) ? "Suggested Peloton: " + (p.title || p.name) : "No run scheduled.";
        }
        setText("sgTodayTitle", title);
        setText("sgTodayDetail", detail);

        setText("sgTodayCal", fmt(pick(today, ["calories", "kcal", "cal", "calories_target"])));
        setText("sgTodayCarbs", fmt(pick(today, ["carbs", "carbs_g", "carb_g", "carbohydrates"])));
        setText("sgTodayProtein", fmt(pick(today, ["protein", "protein_g"])));
        setText("sgTodayFat", fmt(pick(today, ["fat", "fat_g"])));
      })
      .catch(function () {
        setText("sgTodayType", "Today");
        setText("sgTodayTitle", "Plan unavailable");
        setText("sgTodayDetail", "Connect Google Calendar in Fuel to pull today's Runna workout.");
      });
  }

  // ---------- Charts: follow the theme where dashboard.js doesn't set colors ----------
  function themeCharts() {
    if (!window.Chart || !Chart.defaults) return;
    var cs = getComputedStyle(document.documentElement);
    Chart.defaults.font.family = cs.getPropertyValue("--font").trim() || "sans-serif";
    Chart.defaults.color = cs.getPropertyValue("--sub").trim();
    Chart.defaults.borderColor = cs.getPropertyValue("--hairline").trim();
  }

  function init() {
    themeCharts();

    document.addEventListener("click", function (e) {
      var tab = e.target.closest(".sg-nav .sg-tab");
      if (tab) { e.preventDefault(); go(lastInGroup[tab.dataset.group] || tab.dataset.group); return; }
      var segBtn = e.target.closest("#sgSeg button");
      if (segBtn) { go(segBtn.dataset.value); return; }
      var link = e.target.closest("[data-sg-go]");
      if (link) {
        e.preventDefault();
        var sheet = link.closest("dialog"); if (sheet) sheet.close();
        go(link.getAttribute("data-sg-go"));
      }
    });

    // Keep the shell in sync when dashboard.js switches tabs itself
    var host = document.getElementById("dash-tab");
    if (host && window.MutationObserver) {
      new MutationObserver(sync).observe(host, { subtree: true, attributes: true, attributeFilter: ["class"] });
    }

    // Mirror the version number into Settings
    var v = document.getElementById("topbarVersion"), sv = document.getElementById("sgVersion");
    if (v && sv) {
      var copy = function () { sv.textContent = v.textContent; };
      copy();
      if (window.MutationObserver) new MutationObserver(copy).observe(v, { childList: true, characterData: true, subtree: true });
    }

    var dateEl = document.getElementById("sgDate");
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

    sync();
    loadToday();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.StrideShell = { go: go, sync: sync, reloadToday: loadToday };
})();
