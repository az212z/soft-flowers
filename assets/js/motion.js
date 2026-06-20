/* Premium motion engine — shared, vanilla, guarded, additive.
   Adds: scroll progress, count-up [data-mo-count], magnetic primary buttons.
   Never hides content; every block fails silently. Respects reduced-motion. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* scroll progress bar */
  try {
    var p = document.createElement("div");
    p.id = "mo-prog";
    document.body.appendChild(p);
    var tick = false;
    function up() {
      var d = document.documentElement;
      var sc = d.scrollTop || document.body.scrollTop || 0;
      var hh = d.scrollHeight - d.clientHeight;
      p.style.transform = "scaleX(" + (hh > 0 ? Math.min(sc / hh, 1) : 0) + ")";
      tick = false;
    }
    window.addEventListener("scroll", function () {
      if (!tick) { tick = true; requestAnimationFrame(up); }
    }, { passive: true });
    up();
  } catch (e) {}

  /* count-up numbers tagged with data-mo-count */
  try {
    var nums = document.querySelectorAll("[data-mo-count]");
    nums.forEach(function (el) {
      var raw = (el.textContent || "").trim();
      var to = parseFloat(raw.replace(/[^\d.]/g, ""));
      var dec = ((raw.split(".")[1] || "").match(/\d+/) || [""])[0].length;
      if (isNaN(to) || reduce) return;
      el.style.fontVariantNumeric = "tabular-nums";
      var done = false;
      function run() {
        if (done) return; done = true;
        var dur = 1300, t0 = null;
        function step(t) {
          if (t0 === null) t0 = t;
          var pr = Math.min((t - t0) / dur, 1);
          var e = 1 - Math.pow(1 - pr, 3);
          el.textContent = (to * e).toFixed(dec);
          if (pr < 1) requestAnimationFrame(step); else el.textContent = to.toFixed(dec);
        }
        requestAnimationFrame(step);
      }
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (en) {
          en.forEach(function (x) { if (x.isIntersecting) { run(); io.disconnect(); } });
        }, { threshold: 0.6 });
        io.observe(el);
      } else { run(); }
      window.setTimeout(run, 2600);
    });
  } catch (e) {}

  if (reduce) return;

  /* magnetic primary buttons (fine pointers only) */
  try {
    if (window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
      document.querySelectorAll(".btn-primary, .btn--primary, .btn-gold").forEach(function (b) {
        b.addEventListener("mousemove", function (ev) {
          var r = b.getBoundingClientRect();
          var mx = ev.clientX - (r.left + r.width / 2);
          var my = ev.clientY - (r.top + r.height / 2);
          b.style.transform = "translate(" + (mx * 0.16).toFixed(1) + "px," + (my * 0.26 - 2).toFixed(1) + "px)";
        });
        b.addEventListener("mouseleave", function () { b.style.transform = ""; });
      });
    }
  } catch (e) {}
})();
