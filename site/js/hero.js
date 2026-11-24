/* =========================================================
   SalesHubNepal — "Cold Chain" home hero
   - Three pour clips play in turn under a fogged cooler-door pane (frost.js)
   - Pointer / touch wipes the glass clear; the fog creeps back
   - Intro (scripted wipe + headline rise) waits for the age gate to lift
   Needs: vendor/gsap, ScrollTrigger, SplitText, js/frost.js (all optional:
   without them the plain video plays and the copy is shown as-is).
   ========================================================= */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var hero = $('.cc-hero');
  if (!hero) return;

  var html = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger, SplitText);

  var video = $('#hero-video');
  var canvas = $('#hero-glass');

  /* ---------------- Pour playlist ---------------- */
  var clips = [
    { src: 'assets/media/pour-gurkhas.mp4', poster: 'assets/media/pour-gurkhas.jpg', name: 'Gurkhas & Guns', house: 'from Prime International' },
    { src: 'assets/media/pour-bandipur.mp4', poster: 'assets/media/pour-bandipur.jpg', name: 'Bandipur', house: 'from Prime International' },
    { src: 'assets/media/pour-carlsberg.mp4', poster: 'assets/media/pour-carlsberg.jpg', name: 'Carlsberg', house: 'from Gorkha Brewery' }
  ];
  var clipIndex = 0;
  var clipButtons = $$('.cc-pouring__clips button');
  var pourName = $('#pouring-name');
  var pourHouse = $('#pouring-house');
  var frost = null;
  var heroVisible = true;

  function setCaption(i, animate) {
    var c = clips[i];
    if (!animate || !hasGsap || reduceMotion) {
      pourName.textContent = c.name; pourHouse.textContent = c.house; return;
    }
    gsap.timeline()
      .to([pourName, pourHouse], { opacity: 0, y: -8, filter: 'blur(4px)', duration: 0.25, ease: 'power2.in', stagger: 0.04 })
      .add(function () { pourName.textContent = c.name; pourHouse.textContent = c.house; })
      .fromTo([pourName, pourHouse], { opacity: 0, y: 10, filter: 'blur(4px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out', stagger: 0.05 });
  }

  function loadClip(i) {
    clipIndex = i;
    video.src = clips[i].src;
    video.poster = clips[i].poster;
    if (heroVisible && !reduceMotion) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
    clipButtons.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === i)); });
  }

  function switchClip(i) {
    if (i === clipIndex) return;
    setCaption(i, true);
    if (frost && hasGsap) {
      // the glass fogs over between pours
      var o = { v: 0 };
      gsap.timeline()
        .to(o, { v: 1, duration: 0.45, ease: 'power2.in', onUpdate: function () { if (frost) frost.setRefog(o.v); } })
        .add(function () { loadClip(i); })
        .to(o, { v: 0, duration: 0.9, ease: 'power2.out', delay: 0.15, onUpdate: function () { if (frost) frost.setRefog(o.v); } });
    } else {
      loadClip(i);
    }
  }

  video.addEventListener('ended', function () { switchClip((clipIndex + 1) % clips.length); });
  clipButtons.forEach(function (b) {
    b.addEventListener('click', function () { switchClip(+b.dataset.clip); });
  });

  function tickClipProgress() {
    var p = video.duration ? video.currentTime / video.duration : 0;
    clipButtons.forEach(function (b, k) {
      b.querySelector('i').style.setProperty('--p', k === clipIndex ? p.toFixed(3) : (k < clipIndex ? '1' : '0'));
    });
    requestAnimationFrame(tickClipProgress);
  }

  /* ---------------- Frosted glass ---------------- */
  var hint = $('#hero-hint');
  if (window.matchMedia('(pointer: coarse)').matches) $('.hint-text', hint).textContent = 'Drag to wipe the glass';
  var hintTimer = 0;
  function hideHint() { hint.classList.remove('is-on'); clearTimeout(hintTimer); }

  if (!reduceMotion && typeof window.SHFrost === 'function') {
    try {
      frost = window.SHFrost(canvas, video, {
        onFirstFrame: function () { hero.classList.add('gl-ready'); },
        onFirstWipe: hideHint,
        onTooSlow: function () {
          // this device can't keep the glass smooth: show the plain video instead
          frost = null;
          hero.classList.remove('gl-ready'); hero.classList.add('no-gl');
          video.play().catch(function () {});
        },
        onError: function () {
          // e.g. opened from file:// — fall back to the plain video
          frost.stop(); frost = null;
          hero.classList.remove('gl-ready'); hero.classList.add('no-gl');
          video.play().catch(function () {});
        }
      });
    } catch (err) {
      frost = null;
    }
  }
  if (!frost) hero.classList.add('no-gl');

  loadClip(0);
  if (!reduceMotion) requestAnimationFrame(tickClipProgress);

  if (frost) {
    frost.start();
    var rectCache = null;
    var refreshRect = function () { rectCache = canvas.getBoundingClientRect(); };
    refreshRect();
    window.addEventListener('resize', function () { if (frost) frost.resize(); refreshRect(); });
    window.addEventListener('scroll', refreshRect, { passive: true });

    var wipeFromEvent = function (x, y, kind) {
      if (!frost) return;
      if (!rectCache) refreshRect();
      var nx = (x - rectCache.left) / rectCache.width;
      var ny = (y - rectCache.top) / rectCache.height;
      if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return;
      frost.wipeAt(nx, ny, kind);
    };
    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') wipeFromEvent(e.clientX, e.clientY, 'mouse');
    });
    hero.addEventListener('pointerleave', function () { if (frost) frost.endStroke(); });
    hero.addEventListener('touchstart', function (e) { if (frost) frost.endStroke(); var t = e.touches[0]; wipeFromEvent(t.clientX, t.clientY, 'touch'); }, { passive: true });
    hero.addEventListener('touchmove', function (e) { var t = e.touches[0]; wipeFromEvent(t.clientX, t.clientY, 'touch'); }, { passive: true });
    hero.addEventListener('touchend', function () { if (frost) frost.endStroke(); }, { passive: true });

    // pause everything when the hero is off screen
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      if (heroVisible) { if (frost) frost.start(); video.play().catch(function () {}); }
      else { if (frost) frost.stop(); video.pause(); }
    }, { threshold: 0.01 }).observe(hero);
  } else if (!reduceMotion) {
    video.play().catch(function () {});
  }

  // A hand-drawn wipe across the pane: the "door opens" moment
  function autoWipe(duration) {
    var portrait = window.innerWidth < window.innerHeight;
    var path = portrait
      ? [[0.9, 0.18], [0.15, 0.26], [0.85, 0.36], [0.12, 0.46], [0.8, 0.55], [0.3, 0.62]]
      : [[0.98, 0.12], [0.38, 0.2], [0.92, 0.33], [0.34, 0.45], [0.9, 0.58], [0.46, 0.7], [0.78, 0.78]];
    var o = { t: 0 };
    var seg = path.length - 1;
    if (!frost) return gsap.timeline();
    frost.endStroke();
    return gsap.to(o, {
      t: 1, duration: duration, ease: 'power2.inOut',
      onUpdate: function () {
        var f = o.t * seg, i = Math.min(seg - 1, Math.floor(f)), k = f - i;
        k = k * k * (3 - 2 * k); // smooth the corners a little
        var a = path[i], b = path[i + 1];
        if (frost) frost.wipeAt(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, 'auto', portrait ? 1.9 : 1.75, 0.7);
      },
      onComplete: function () { if (frost) frost.endStroke(); }
    });
  }

  /* ---------------- Intro ---------------- */
  var title = $('#hero-title');
  var split = null;
  var introTargets = ['.cc-hero__lede', '.cc-hero__ctas', '.cc-pouring'];

  function prepareIntro() {
    if (!hasGsap || reduceMotion) return;
    split = new SplitText(title, { type: 'lines', mask: 'lines', linesClass: 'tline' });
    gsap.set(split.lines, { yPercent: 105 });
    gsap.set(introTargets, { autoAlpha: 0, y: 14 });
  }

  function playIntro() {
    if (!hasGsap || reduceMotion || !split) return;
    gsap.timeline({ delay: 0.1 })
      .add(autoWipe(1.6), 0)
      .to(split.lines, { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.09 }, 0.5)
      .to(introTargets, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07 }, '-=0.75')
      .add(function () {
        if (!frost) return;
        hintTimer = setTimeout(function () { hint.classList.add('is-on'); }, 900);
        setTimeout(hideHint, 7000);
      });
  }

  var fontsReady = (document.fonts && document.fonts.ready) ? Promise.race([
    document.fonts.ready,
    new Promise(function (r) { setTimeout(r, 1500); })
  ]) : Promise.resolve();

  // The site-wide age gate (entry-gate.js) sets html[data-gating] while it is up
  // and removes it when the visitor is through. Play the intro after that.
  function gateLifted() {
    return new Promise(function (resolve) {
      if (!html.hasAttribute('data-gating')) return resolve();
      var mo = new MutationObserver(function () {
        if (html.hasAttribute('data-gating')) return;
        mo.disconnect(); resolve();
      });
      mo.observe(html, { attributes: true, attributeFilter: ['data-gating'] });
    });
  }

  fontsReady.then(function () {
    prepareIntro();
    html.classList.add('intro-ready');
    return gateLifted();
  }).then(function () {
    // the gate locks scrolling while it is up, so re-measure the scroll-out triggers
    if (hasGsap) ScrollTrigger.refresh();
    playIntro();
  });
  window.addEventListener('load', function () { if (hasGsap) ScrollTrigger.refresh(); });

})();
