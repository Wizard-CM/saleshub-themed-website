/* SalesHubNepal home: team photo reveal, HQ status chip, HQ photo parallax */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- open / closed chip (Asia/Kathmandu) ---------- */
  function kathmandu() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kathmandu', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
      }).formatToParts(new Date());
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: days[o.weekday], hour: parseInt(o.hour, 10) % 24 };
    } catch (e) { return null; }
  }
  function updateStatus() {
    var chip = document.querySelector('[data-status]');
    var text = chip && chip.querySelector('[data-status-text]');
    if (!chip || !text) return;
    var t = kathmandu();
    if (!t || isNaN(t.day)) return;
    var open = t.day >= 1 && t.day <= 6 && t.hour >= 9 && t.hour < 18;
    if (open) text.textContent = 'Open now, until 18:00';
    else if (t.day === 0 || (t.day === 6 && t.hour >= 18)) text.textContent = 'Closed now, opens Monday 09:00';
    else text.textContent = 'Closed now, opens 09:00';
    chip.setAttribute('data-state', open ? 'open' : 'closed');
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---------- scroll moments ---------- */
  if (reduce || typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  var small = window.matchMedia('(max-width: 820px)').matches;

  var frame = document.querySelector('[data-team-photo]');
  var img = frame && frame.querySelector('img');
  if (frame && img) {
    var r = small ? 16 : 22;
    var from = small ? 'inset(3% 4% round ' + r + 'px)' : 'inset(6% 9% round ' + r + 'px)';
    var to = 'inset(0% 0% round ' + r + 'px)';
    var tl = gsap.timeline({
      scrollTrigger: { trigger: frame, start: 'top 88%', end: 'top 25%', scrub: 0.6, invalidateOnRefresh: true }
    });
    tl.fromTo(frame, { clipPath: from }, { clipPath: to, ease: 'none' }, 0)
      .fromTo(img, { scale: 1.12 }, { scale: 1, ease: 'none' }, 0);
  }

  var hq = document.querySelector('.visit__photo img');
  if (hq && !small) {
    gsap.fromTo(hq, { yPercent: -5 }, {
      yPercent: 5, ease: 'none',
      scrollTrigger: { trigger: '.visit__photo', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }
})();
