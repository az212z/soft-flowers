/* ============================================================
   الأزهار الناعمة · Soft Flowers — main.js (vanilla, guarded)
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile full-screen menu ---------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobileMenu");
  var mmClose = document.getElementById("mmClose");

  function openMenu() {
    if (!menu) return;
    menu.classList.add("open");
    if (burger) burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("open");
    if (burger) burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (burger) burger.addEventListener("click", openMenu);
  if (mmClose) mmClose.addEventListener("click", closeMenu);
  if (menu) {
    menu.querySelectorAll(".mm-links a, .mm-foot a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeMenu(); closeLightbox(); }
  });

  /* ---------- Drifting petals ---------- */
  var petalBox = document.getElementById("petals");
  if (petalBox && !reduce) {
    var COUNT = 9;
    var svgPetal = '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z" fill="%FILL%" opacity="0.9"/></svg>';
    var fills = ["#F2C6BB", "#F6D8CE", "#CFE6D4", "#EFD0C2", "#A7CFB4"];
    for (var i = 0; i < COUNT; i++) {
      var p = document.createElement("span");
      p.className = "petal";
      var size = 10 + Math.random() * 16;
      p.style.left = (Math.random() * 100) + "%";
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.animationDuration = (11 + Math.random() * 12) + "s";
      p.style.animationDelay = (Math.random() * 10) + "s";
      p.innerHTML = svgPetal.replace("%FILL%", fills[i % fills.length]);
      petalBox.appendChild(p);
    }
  }

  /* ---------- Scroll reveal (IntersectionObserver + fallback) ---------- */
  var revealEls = document.querySelectorAll(".reveal, .bloom");
  function showAll() { revealEls.forEach(function (el) { el.classList.add("in"); }); }

  if (reduce) {
    showAll();
  } else if ("IntersectionObserver" in window) {
    var groups = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // 40ms stagger among siblings of the same parent
          var parent = el.parentElement;
          var key = parent ? (parent.id || parent.className) : "x";
          if (!(key in groups)) groups[key] = 0;
          var idx = groups[key]++;
          el.style.transitionDelay = Math.min(idx * 40, 240) + "ms";
          el.classList.add("in");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    // Safety fallback: ensure nothing stays hidden
    setTimeout(showAll, 2500);
  } else {
    showAll();
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbClose = document.getElementById("lbClose");
  var lastFocus = null;

  function openLightbox(src, alt) {
    if (!lightbox || !lbImg) return;
    lbImg.src = src;
    lbImg.alt = alt || "معاينة بالحجم الكامل";
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    if (lbClose) lbClose.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus) { try { lastFocus.focus(); } catch (e) {} }
  }
  document.querySelectorAll(".gal-card").forEach(function (card) {
    card.addEventListener("click", function () {
      lastFocus = card;
      var full = card.getAttribute("data-full");
      var img = card.querySelector("img");
      openLightbox(full, img ? img.alt : "");
    });
  });
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lightbox) lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  /* ---------- Order form → wa.me + localStorage + toast ---------- */
  var form = document.getElementById("orderForm");
  var toast = document.getElementById("toast");
  var toastMsg = document.getElementById("toastMsg");
  var WA = "966555398789";

  function showToast(msg) {
    if (!toast) return;
    if (msg && toastMsg) toastMsg.textContent = msg;
    toast.classList.add("show");
    setTimeout(function () { toast.classList.remove("show"); }, 4000);
  }
  function setErr(name, msg) {
    var span = form.querySelector('.err[data-for="' + name + '"]');
    var field = form.querySelector('[name="' + name + '"]');
    if (span) span.textContent = msg || "";
    if (field && field.closest(".field")) field.closest(".field").classList.toggle("invalid", !!msg);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var service = form.service.value;
      var date = form.date.value;
      var notes = form.notes.value.trim();
      var ok = true;

      setErr("name", ""); setErr("phone", ""); setErr("service", "");
      if (!name) { setErr("name", "الرجاء كتابة الاسم"); ok = false; }
      if (!phone || !/^0?5\d{8}$/.test(phone.replace(/\s|-/g, ""))) {
        setErr("phone", "أدخل رقم جوال سعودي صحيح (05XXXXXXXX)"); ok = false;
      }
      if (!service) { setErr("service", "اختر نوع الطلب"); ok = false; }
      if (!ok) {
        var firstBad = form.querySelector(".field.invalid input, .field.invalid select");
        if (firstBad) firstBad.focus();
        return;
      }

      var order = { name: name, phone: phone, service: service, date: date, notes: notes, at: new Date().toISOString() };
      try {
        var prev = JSON.parse(localStorage.getItem("sf_orders") || "[]");
        prev.push(order);
        localStorage.setItem("sf_orders", JSON.stringify(prev));
      } catch (e2) {}

      var msg =
        "السلام عليكم، أرغب بطلب من الأزهار الناعمة 🌸%0a" +
        "الاسم: " + encodeURIComponent(name) + "%0a" +
        "الجوال: " + encodeURIComponent(phone) + "%0a" +
        "نوع الطلب: " + encodeURIComponent(service) + "%0a" +
        (date ? "تاريخ الاستلام: " + encodeURIComponent(date) + "%0a" : "") +
        (notes ? "ملاحظات: " + encodeURIComponent(notes) : "");

      showToast("تم تجهيز طلبك، يفتح واتساب الآن…");
      setTimeout(function () {
        window.open("https://wa.me/" + WA + "?text=" + msg, "_blank");
      }, 700);
      form.reset();
    });
  }
})();
