// SalesHubNepal — age gate: "the cooler door" (design from claude/lucid-planck-llxojq)
// Pair with css/entry-gate.css. Self-contained, loaded synchronously in <head> on every page.
//
// Behaviour:
//  - First visit: the room cools from 24°C to 4°C, then asks for 18+.
//  - "Yes": remembered in localStorage, the gate lifts and the page plays its intro.
//  - "No": a "come back when you're 18" screen.
//  - While the gate is up, <html data-gating="1"> is set; page intros (hero.js,
//    brewery-page.css) wait for it to be removed.
//  - On the home page (<html data-gate="glass">) the gate sits over the fogged hero.

// ── Motion policy (kept from the previous gate) ───────────────────────────────
// Phones in Battery Saver / Low Power Mode quietly turn on "Reduce Motion", which
// switched every animation off. The site's animations are gentle and part of the
// design, so JS that asks for prefers-reduced-motion is told "no preference".
(function () {
  if (!window.matchMedia) return;
  var realMatchMedia = window.matchMedia.bind(window);
  window.matchMedia = function (query) {
    if (typeof query === 'string' && /prefers-reduced-motion/i.test(query)) {
      return {
        media: query, matches: false, onchange: null,
        addEventListener: function () {}, removeEventListener: function () {},
        addListener: function () {}, removeListener: function () {},
        dispatchEvent: function () { return false; }
      };
    }
    return realMatchMedia(query);
  };
})();

(function () {
  'use strict';
  var KEY = 'saleshub-age-ok';
  var html = document.documentElement;
  var passed = false;
  try { passed = window.localStorage.getItem(KEY) === '1'; } catch (e) { passed = false; }
  if (passed) return;

  html.setAttribute('data-gating', '1');

  // the gate's typefaces (the home page loads them already; other pages don't)
  if (!document.querySelector('link[href*="Big+Shoulders"]')) {
    var font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Big+Shoulders:opsz,wght@10..72,500..900&family=Hanken+Grotesk:wght@400;500;600&display=swap';
    document.head.appendChild(font);
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var gate = document.createElement('div');
    gate.className = 'gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'gate-q');
    gate.innerHTML =
      '<div class="gate__inner">' +
        '<p class="gate__temp" aria-hidden="true"><span class="gate__deg">24</span><sup>°C</sup></p>' +
        '<p class="gate__status">Cooling to serving temperature</p>' +
        '<h2 class="gate__q" id="gate-q">Before we open the cooler, are you 18 or older?</h2>' +
        '<div class="gate__actions">' +
          '<button class="gate__btn gate__btn--yes" type="button">Yes, I\'m 18 or older</button>' +
          '<button class="gate__btn gate__btn--no" type="button">No, I\'m under 18</button>' +
        '</div>' +
        '<p class="gate__note">We distribute alcohol, so this site is for adults of legal drinking age.</p>' +
      '</div>' +
      '<div class="gate__denied" hidden>' +
        '<p class="gate__denied-title">Come back when you\'re 18.</p>' +
        '<p>We\'ll keep it cold for you.</p>' +
      '</div>';
    document.body.insertBefore(gate, document.body.firstChild);

    var inner = gate.querySelector('.gate__inner');
    Array.prototype.forEach.call(inner.children, function (el, i) { el.style.setProperty('--i', i); });
    var deg = gate.querySelector('.gate__deg');
    var status = gate.querySelector('.gate__status');
    var yes = gate.querySelector('.gate__btn--yes');
    var no = gate.querySelector('.gate__btn--no');

    // entrance
    requestAnimationFrame(function () { requestAnimationFrame(function () { gate.classList.add('is-in'); }); });

    // 24°C → 4°C over 2.6s (power3.out), starting after 0.3s
    var cooled = false;
    function done() {
      if (cooled) return;
      cooled = true;
      deg.textContent = '4';
      status.textContent = 'Holding at 4°C, ready to pour';
    }
    var t0 = 0;
    function tick(now) {
      if (cooled) return;
      if (!t0) t0 = now + 300;
      var p = Math.max(0, Math.min(1, (now - t0) / 2600));
      var e = 1 - Math.pow(1 - p, 3);
      deg.textContent = String(Math.round(24 - 20 * e));
      if (p >= 1) done(); else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    setTimeout(function () { try { yes.focus({ preventScroll: true }); } catch (e) { yes.focus(); } }, 50);

    yes.addEventListener('click', function () {
      try { window.localStorage.setItem(KEY, '1'); } catch (e) { /* private mode: ask again next time */ }
      cooled = true;
      gate.classList.add('is-leaving');
      setTimeout(function () { gate.classList.add('is-gone'); }, 460);
      setTimeout(function () {
        gate.remove();
        html.removeAttribute('data-gating');
      }, 820);
    });
    no.addEventListener('click', function () {
      inner.hidden = true;
      gate.querySelector('.gate__denied').hidden = false;
    });
  });
})();
