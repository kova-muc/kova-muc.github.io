/* =====================================================================
   iOS Liquid Glass — поведение (работает только если <html class="ios">)
   1) касание: стекло «набухает» как капля, блик едет за пальцем
   2) скролл: блик на кромке плавно поворачивается (как свет по стеклу)
   3) бургер превращается в крестик, пока меню открыто
   ===================================================================== */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains("ios")) return;

  var PRESS = ".burger,.lang-current,.lang-option,.menu li,.yt-link a,.modal-close,.track-card";
  var GLOW  = PRESS + ",.bio,.tracks,.menu,.modal-box,.lang-menu,footer p";
  var MIN_PRESS_MS = 160;   /* даже быстрый тап успевает «набухнуть» */

  var pressed = [];
  var downAt = 0;

  function setGlow(el, e) {
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
    var y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
    el.style.setProperty("--mx", x.toFixed(1) + "%");
    el.style.setProperty("--my", y.toFixed(1) + "%");
  }

  function release() {
    var list = pressed;
    pressed = [];
    var wait = Math.max(0, MIN_PRESS_MS - (Date.now() - downAt));
    setTimeout(function () {
      list.forEach(function (el) { el.classList.remove("lg-press"); });
    }, wait);
  }

  document.addEventListener("pointerdown", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    downAt = Date.now();

    var glow = t.closest(GLOW);
    if (glow) setGlow(glow, e);

    var btn = t.closest(PRESS);
    if (btn) {
      btn.classList.add("lg-press");
      pressed.push(btn);
    }
  }, { passive: true });

  document.addEventListener("pointermove", function (e) {
    if (!pressed.length) return;
    pressed.forEach(function (el) { setGlow(el, e); });
  }, { passive: true });

  ["pointerup", "pointercancel"].forEach(function (name) {
    document.addEventListener(name, release, { passive: true });
  });

  /* ----- блик на кромке зависит от прокрутки ----- */
  var ticking = false;
  var lastTilt = null;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var tilt = Math.round(Math.sin(window.pageYOffset / 520) * 16);
      if (tilt !== lastTilt) {
        root.style.setProperty("--tilt", tilt + "deg");
        lastTilt = tilt;
      }
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ----- бургер ↔ крестик ----- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");
  if (burger && menu && window.MutationObserver) {
    var sync = function () {
      burger.textContent = menu.classList.contains("active") ? "\u2715" : "\u2630";
    };
    new MutationObserver(sync).observe(menu, { attributes: true, attributeFilter: ["class"] });
    sync();
  }
})();
