/* =========================================================
   SalesHubNepal home — shared motion
   - Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync
   - [data-rise] headlines: lines rise out of a mask once, as they enter
   Section-specific motion lives in home-people.js / home-products.js.
   ========================================================= */
(function () {
  'use strict';
  if (typeof window.gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- smooth scroll ---------- */
  if (!reduceMotion && typeof window.Lenis !== 'undefined') {
    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.shLenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    // keep in-page anchor links smooth too
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -20, duration: 1.2 });
    });
  }

  /* ---------- headline rise ---------- */
  if (reduceMotion) return;
  var fontsReady = (document.fonts && document.fonts.ready) ? Promise.race([
    document.fonts.ready, new Promise(function (r) { setTimeout(r, 1500); })
  ]) : Promise.resolve();

  fontsReady.then(function () {
    document.querySelectorAll('[data-rise]').forEach(function (el) {
      var split = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'rline' });
      gsap.from(split.lines, {
        yPercent: 105, duration: 1.05, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });
    ScrollTrigger.refresh();
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
