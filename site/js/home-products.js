/* The portfolio doors + roster filter */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- doors ---------- */
  var doorsEl = document.querySelector('.portfolio__doors');
  if (doorsEl) {
    var cells = Array.prototype.slice.call(doorsEl.querySelectorAll('.portfolio__cell'));
    var doors = cells.map(function (c) { return c.querySelector('.portfolio__door'); });
    var activate = function (i) {
      cells.forEach(function (c, j) {
        c.classList.toggle('is-open', i === j);
        if (doors[j]) doors[j].classList.toggle('is-active', i === j);
      });
    };
    activate(0);
    doors.forEach(function (d, i) {
      if (!d) return;
      d.addEventListener('mouseenter', function () { activate(i); });
      d.addEventListener('focus', function () { activate(i); });
    });

    var show = function () { doorsEl.classList.add('is-in'); };
    if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined' && !reduce) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.set(cells, { opacity: 0, y: 70 });
      doorsEl.classList.add('is-in');
      ScrollTrigger.create({
        trigger: doorsEl, start: 'top 85%', once: true,
        onEnter: function () {
          gsap.to(cells, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.1, clearProps: 'transform' });
        }
      });
    } else { show(); }
  }

  /* ---------- roster filter ---------- */
  var roster = document.querySelector('.roster');
  if (!roster) return;
  var buttons = Array.prototype.slice.call(roster.querySelectorAll('.roster__filter'));
  var items = Array.prototype.slice.call(roster.querySelectorAll('.roster__item'));
  var status = roster.querySelector('.roster__status');
  var words = { beer: 'beers', spirits: 'spirits', wine: 'wines', energy: 'energy drinks' };

  var apply = function (key) {
    var n = 0;
    items.forEach(function (it) {
      var ok = key === 'all' || it.getAttribute('data-category') === key;
      it.hidden = !ok;
      if (ok) n++;
    });
    if (status) status.textContent = key === 'all' ? 'Showing all ' + n + ' products' : 'Showing ' + n + ' ' + (words[key] || 'products');
  };
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var key = b.getAttribute('data-filter');
      if (b.getAttribute('aria-pressed') === 'true') return;
      buttons.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      if (document.startViewTransition && !reduce) document.startViewTransition(function () { apply(key); });
      else apply(key);
    });
  });
})();
