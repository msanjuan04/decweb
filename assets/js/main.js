/* DEC idiomes — interaccions */
(function () {
  document.documentElement.classList.remove("no-js");

  /* Menú lateral */
  var drawer = document.getElementById("drawer");
  var openBtn = document.querySelector("[data-menu-open]");
  var lastFocus = null;
  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    openBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
    var first = drawer.querySelector(".drawer__close");
    if (first) first.focus();
  }
  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    openBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  }
  if (drawer && openBtn) {
    openBtn.addEventListener("click", openDrawer);
    drawer.querySelectorAll("[data-menu-close]").forEach(function (el) {
      el.addEventListener("click", closeDrawer);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
    });
  }

  /* Carrusels */
  document.querySelectorAll("[data-carousel]").forEach(initCarousel);
  function initCarousel(root) {
    var track = root.querySelector(".carousel__track");
    var prev = root.querySelector("[data-prev]");
    var next = root.querySelector("[data-next]");
    var dots = root.querySelector(".dots");
    if (!track) return;
    function step() {
      var item = track.firstElementChild;
      if (!item) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return item.getBoundingClientRect().width + gap;
    }
    function pages() {
      return Math.max(1, Math.round((track.scrollWidth - track.clientWidth) / step()) + 1);
    }
    function renderDots() {
      if (!dots) return;
      var n = pages();
      if (dots.children.length !== n) {
        dots.innerHTML = "";
        for (var i = 0; i < n; i++) dots.appendChild(document.createElement("span"));
      }
      var idx = Math.round(track.scrollLeft / step());
      Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle("on", i === idx); });
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
      renderDots();
    }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
    track.addEventListener("scroll", function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    root._update = update;
    update();
  }

  /* Pestanyes */
  document.querySelectorAll("[data-tabs]").forEach(function (root) {
    var tabs = root.querySelectorAll('[role="tab"]');
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(i); });
      tab.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { select((i + 1) % tabs.length, true); }
        if (e.key === "ArrowLeft") { select((i - 1 + tabs.length) % tabs.length, true); }
      });
    });
    function select(idx, focus) {
      tabs.forEach(function (t, i) {
        var on = i === idx;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) {
          panel.hidden = !on;
          if (on) {
            var c = panel.querySelector("[data-carousel]");
            if (c && c._update) { c.querySelector(".carousel__track").scrollLeft = 0; c._update(); }
          }
        }
      });
      if (focus) tabs[idx].focus();
    }
  });

  /* Sub-navegació: marca la secció visible */
  var subLinks = document.querySelectorAll(".subnav a[href^='#']");
  if (subLinks.length && "IntersectionObserver" in window) {
    var map = {};
    subLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          subLinks.forEach(function (a) { a.classList.remove("is-active"); });
          var a = map[en.target.id];
          if (a) a.classList.add("is-active");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) so.observe(el); });
  }

  /* Aparició suau */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Formulari de contacte: obre el client de correu amb el missatge preparat */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var subject = d.get("asunto") || "Consulta des del web";
      var body =
        "Nom: " + d.get("nombre") + "\n" +
        "Correu: " + d.get("email") + "\n" +
        (d.get("telefon") ? "Telèfon: " + d.get("telefon") + "\n" : "") +
        "\n" + d.get("mensaje");
      window.location.href =
        "mailto:info@decidiomes.com?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      var note = document.getElementById("form-note");
      if (note) note.hidden = false;
    });
  }

  /* Any actual al peu */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
