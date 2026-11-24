/* =========================================================
   SalesHubNepal home — shared motion (kept deliberately light)
   Native scrolling (no smooth-scroll library). Headlines marked [data-rise]
   fade up once when they enter; the CSS lives in home-base.css.
   ========================================================= */
(function () {
  'use strict';
  var els = document.querySelectorAll('[data-rise]');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }
  document.documentElement.classList.add('rise-ready');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  els.forEach(function (el) { io.observe(el); });
})();
