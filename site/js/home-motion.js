/* One entrance per group. Base styles keep content visible without scripting. */
(function () {
  'use strict';

  if (!('IntersectionObserver' in window)) return;

  var reveal = new IntersectionObserver(function (entries) {
    var stagger = 0;

    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var target = entry.target;
      target.style.setProperty('--reveal-delay', Math.min(stagger++, 3) * 55 + 'ms');
      target.classList.add('is-revealed');
      reveal.unobserve(target);
    });
  });

  document.querySelectorAll('[data-section-reveal]').forEach(function (target) {
    reveal.observe(target);
  });
})();
