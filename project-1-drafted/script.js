(function () {
  "use strict";

  /* ============================================================
     1) MOBILE NAV DRAWER
     ============================================================ */
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");
  const navBackdrop = document.getElementById("navBackdrop");

  function openNav() {
    primaryNav.classList.add("is-open");
    navBackdrop.hidden = false;
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close navigation menu");
  }
  function closeNav() {
    primaryNav.classList.remove("is-open");
    navBackdrop.hidden = true;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
  }
  navToggle.addEventListener("click", () => {
    primaryNav.classList.contains("is-open") ? closeNav() : openNav();
  });
  navBackdrop.addEventListener("click", closeNav);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) closeNav();
  });
  // Close the drawer after choosing a link on mobile
  primaryNav.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 768) closeNav();
    });
  });

  /* ============================================================
     2) NOTIFICATIONS DROPDOWN
     ============================================================ */
  const notifToggle = document.getElementById("notifToggle");
  const notifPanel = document.getElementById("notifPanel");
  const notifDot = document.getElementById("notifDot");
  const markAllRead = document.getElementById("markAllRead");

  function toggleNotifPanel(show) {
    notifPanel.hidden = !show;
    notifToggle.setAttribute("aria-expanded", String(show));
  }
  notifToggle.addEventListener("click", () => toggleNotifPanel(notifPanel.hidden));
  document.addEventListener("click", (e) => {
    if (!notifPanel.hidden && !notifPanel.contains(e.target) && e.target !== notifToggle) {
      toggleNotifPanel(false);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggleNotifPanel(false);
  });
  markAllRead.addEventListener("click", () => {
    notifDot.hidden = true;
    notifToggle.setAttribute("aria-label", "Notifications, no unread");
  });

  /* ============================================================
     3) STUDIO OUTPUT — bar chart with period toggle
     ============================================================ */
  const chartData = {
    week: {
      unit: "h",
      values: [
        ["Mon", 32], ["Tue", 28], ["Wed", 34], ["Thu", 30],
        ["Fri", 26], ["Sat", 8], ["Sun", 4]
      ]
    },
    month: {
      unit: "h",
      values: [["Wk 1", 158], ["Wk 2", 172], ["Wk 3", 165], ["Wk 4", 186]]
    },
    year: {
      unit: "h",
      values: [
        ["Jan", 620], ["Feb", 590], ["Mar", 705], ["Apr", 640],
        ["May", 715], ["Jun", 680], ["Jul", 660]
      ]
    }
  };

  const barChartEl = document.getElementById("barChart");
  const chartSummaryEl = document.getElementById("chartSummary");
  const chartTableBody = document.getElementById("chartTableBody");
  const segmentButtons = document.querySelectorAll(".segmented-btn");

  function renderChart(period) {
    const data = chartData[period];
    const max = Math.max(...data.values.map((v) => v[1]));

    barChartEl.innerHTML = "";
    chartTableBody.innerHTML = "";

    data.values.forEach(([label, value]) => {
      const heightPct = Math.max(6, Math.round((value / max) * 100));

      const col = document.createElement("div");
      col.className = "bar-col";
      col.innerHTML = `
        <div class="bar" style="height:${heightPct}%" title="${label}: ${value}${data.unit}"></div>
        <span class="bar-label">${label}</span>
      `;
      barChartEl.appendChild(col);

      const row = document.createElement("tr");
      row.innerHTML = `<td>${label}</td><td>${value}${data.unit}</td>`;
      chartTableBody.appendChild(row);
    });

    const summary = data.values.map(([l, v]) => `${l} ${v}${data.unit}`).join(", ");
    chartSummaryEl.textContent = `Showing ${period}ly hours: ${summary}.`;
  }

  segmentButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      segmentButtons.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      renderChart(btn.dataset.period);
    });
  });

  renderChart("week");

  /* ============================================================
     4) PROJECT SEARCH / FILTER
     Searches the card's own visible text (title + client/date line)
     rather than a separate data attribute, so there's a single
     source of truth — the text on screen is always what's searched.
     ============================================================ */
  const searchInput = document.getElementById("projectSearch");
  const projectCards = Array.from(document.querySelectorAll(".project-card"));
  const resultCount = document.getElementById("resultCount");
  const emptyState = document.getElementById("emptyState");

  function filterProjects() {
    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;

    projectCards.forEach((card) => {
      const searchableText = card.querySelector(".project-main").textContent.toLowerCase();
      const match = searchableText.includes(query);
      card.hidden = !match;
      if (match) visible += 1;
    });

    resultCount.textContent = `${visible} of ${projectCards.length} projects`;
    emptyState.hidden = visible !== 0;
  }
  searchInput.addEventListener("input", filterProjects);

  /* ============================================================
     5) QUICK TASK ENTRY
     ============================================================ */
  const taskForm = document.getElementById("taskForm");
  const taskInput = document.getElementById("taskInput");
  const taskList = document.getElementById("taskList");
  const taskEmptyState = document.getElementById("taskEmptyState");

  function checkTaskListEmpty() {
    taskEmptyState.hidden = taskList.children.length !== 0;
  }

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = taskInput.value.trim();
    if (!value) return;

    const li = document.createElement("li");
    li.innerHTML = `<label><input type="checkbox"> ${escapeHtml(value)}</label>`;
    taskList.appendChild(li);

    taskInput.value = "";
    taskInput.focus();
    checkTaskListEmpty();
  });

  taskList.addEventListener("change", (e) => {
    if (e.target.matches('input[type="checkbox"]')) {
      // visual strike-through handled purely via CSS :has()
    }
  });

  // Allow removing a task on double-click of its label, for quick cleanup
  taskList.addEventListener("dblclick", (e) => {
    const li = e.target.closest("li");
    if (li) {
      li.remove();
      checkTaskListEmpty();
    }
  });

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  checkTaskListEmpty();

  /* ============================================================
     6) SETTINGS — form validation
     ============================================================ */
  const settingsForm = document.getElementById("settingsForm");
  const studioName = document.getElementById("studioName");
  const contactEmail = document.getElementById("contactEmail");
  const saveConfirmation = document.getElementById("saveConfirmation");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateField(input, errorEl, isValid) {
    errorEl.hidden = isValid;
    input.setAttribute("aria-invalid", String(!isValid));
  }

  settingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveConfirmation.hidden = true;

    const nameValid = studioName.value.trim().length > 0;
    const emailValid = emailPattern.test(contactEmail.value.trim());

    validateField(studioName, document.getElementById("studioNameError"), nameValid);
    validateField(contactEmail, document.getElementById("contactEmailError"), emailValid);

    if (nameValid && emailValid) {
      saveConfirmation.hidden = false;
      setTimeout(() => { saveConfirmation.hidden = true; }, 3000);
    } else {
      (nameValid ? contactEmail : studioName).focus();
    }
  });

  /* ============================================================
     7) APPEARANCE — light / dark toggle
     ============================================================ */
  const themeLight = document.getElementById("themeLight");
  const themeDark = document.getElementById("themeDark");

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const isDark = theme === "dark";
    themeDark.classList.toggle("is-active", isDark);
    themeDark.setAttribute("aria-pressed", String(isDark));
    themeLight.classList.toggle("is-active", !isDark);
    themeLight.setAttribute("aria-pressed", String(!isDark));
  }

  themeLight.addEventListener("click", () => setTheme("light"));
  themeDark.addEventListener("click", () => setTheme("dark"));
})();
