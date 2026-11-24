/* =========================================================
   SalesHub Nepal — homepage orchestration (sample)
   ========================================================= */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger, SplitText);

  var hero = $('.hero');
  var video = $('#hero-video');
  var canvas = $('#hero-glass');
  var nav = $('#nav');

  /* ---------------- Smooth scroll ---------------- */
  var lenis = null;
  if (hasGsap && !reduceMotion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function lockScroll(on) {
    document.body.classList.toggle('is-locked', on);
    if (lenis) { on ? lenis.stop() : lenis.start(); }
  }
  function scrollToY(y) {
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = $(id);
      if (!el) return;
      e.preventDefault();
      scrollToY(id === '#top' ? 0 : el.getBoundingClientRect().top + window.scrollY);
    });
  });

  /* ---------------- Pour playlist ---------------- */
  var clips = [
    { src: 'assets/media/pour-gurkhas.mp4', poster: 'assets/media/pour-gurkhas.jpg', name: 'Gurkhas & Guns', house: 'from Prime International' },
    { src: 'assets/media/pour-bandipur.mp4', poster: 'assets/media/pour-bandipur.jpg', name: 'Bandipur', house: 'from Prime International' },
    { src: 'assets/media/pour-carlsberg.mp4', poster: 'assets/media/pour-carlsberg.jpg', name: 'Carlsberg', house: 'from Gorkha Brewery' }
  ];
  var clipIndex = 0;
  var clipButtons = $$('.pouring__clips button');
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

  if (!reduceMotion) {
    try {
      frost = window.SHFrost(canvas, video, {
        onFirstFrame: function () { hero.classList.add('gl-ready'); },
        onFirstWipe: hideHint,
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
    if (!frost || !hasGsap) return gsap.timeline();
    var portrait = window.innerWidth < window.innerHeight;
    var path = portrait
      ? [[0.9, 0.18], [0.15, 0.26], [0.85, 0.36], [0.12, 0.46], [0.8, 0.55], [0.3, 0.62]]
      : [[0.98, 0.12], [0.38, 0.2], [0.92, 0.33], [0.34, 0.45], [0.9, 0.58], [0.46, 0.7], [0.78, 0.78]];
    var o = { t: 0 };
    var seg = path.length - 1;
    frost.endStroke();
    return gsap.to(o, {
      t: 1, duration: duration, ease: 'power2.inOut',
      onUpdate: function () {
        var f = o.t * seg, i = Math.min(seg - 1, Math.floor(f)), k = f - i;
        // smooth the corners a little
        k = k * k * (3 - 2 * k);
        var a = path[i], b = path[i + 1];
        if (frost) frost.wipeAt(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, 'auto', portrait ? 1.9 : 1.75, 0.7);
      },
      onComplete: function () { if (frost) frost.endStroke(); }
    });
  }

  /* ---------------- Intro + gate ---------------- */
  var title = $('#hero-title');
  var split = null;
  var introTargets = ['.hero__lede', '.hero__ctas', '.pouring', '.nav'];

  function prepareIntro() {
    if (!hasGsap || reduceMotion) return;
    split = new SplitText(title, { type: 'lines', mask: 'lines', linesClass: 'tline' });
    gsap.set(split.lines, { yPercent: 105 });
    gsap.set(introTargets, { autoAlpha: 0, y: 14 });
  }

  function playIntro(fromGate) {
    if (!hasGsap || reduceMotion) return;
    var tl = gsap.timeline({ delay: fromGate ? 0.05 : 0.35 });
    tl.add(autoWipe(fromGate ? 1.7 : 1.4), 0)
      .to(split.lines, { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.09 }, fromGate ? 0.55 : 0.4)
      .to(introTargets, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07 }, '-=0.75')
      .add(function () {
        if (!frost) return;
        hintTimer = setTimeout(function () { hint.classList.add('is-on'); }, 900);
        setTimeout(hideHint, 7000);
      });
  }

  var gate = $('#gate');
  var AGE_KEY = 'saleshub-age-ok';
  var agePassed = false;
  try { agePassed = window.localStorage.getItem(AGE_KEY) === '1'; } catch (e) { agePassed = false; }

  var fontsReady = (document.fonts && document.fonts.ready) ? Promise.race([
    document.fonts.ready,
    new Promise(function (r) { setTimeout(r, 1500); })
  ]) : Promise.resolve();
  var introReady = fontsReady.then(function () {
    prepareIntro();
    document.documentElement.classList.add('intro-ready');
  });

  if (agePassed) {
    introReady.then(function () { playIntro(false); });
  } else {
    gate.hidden = false;
    lockScroll(true);
    var deg = $('#gate-deg');
    var status = $('#gate-status');
    var yes = $('#gate-yes');
    var no = $('#gate-no');
    if (hasGsap && !reduceMotion) {
      gsap.set(nav, { autoAlpha: 0 });
      var tmp = { v: 24 };
      gsap.from('.gate__inner > *', { autoAlpha: 0, y: 18, duration: 0.9, ease: 'power3.out', stagger: 0.07, delay: 0.15 });
      gsap.to(tmp, {
        v: 4, duration: 2.6, ease: 'power3.out', delay: 0.3,
        onUpdate: function () { deg.textContent = Math.round(tmp.v); },
        onComplete: function () { status.textContent = 'Holding at 4°C, ready to pour'; }
      });
    } else {
      deg.textContent = '4';
      status.textContent = 'Holding at 4°C, ready to pour';
    }
    setTimeout(function () { yes.focus({ preventScroll: true }); }, 50);

    yes.addEventListener('click', function () {
      try { window.localStorage.setItem(AGE_KEY, '1'); } catch (e) { /* private mode: ask again next time */ }
      var finish = function () { gate.hidden = true; lockScroll(false); };
      if (hasGsap && !reduceMotion) {
        gsap.timeline()
          .to('.gate__inner > *', { autoAlpha: 0, y: -14, filter: 'blur(6px)', duration: 0.45, ease: 'power2.in', stagger: 0.04 })
          .to(gate, { autoAlpha: 0, duration: 0.35, ease: 'power1.out' }, '-=0.15')
          .add(finish)
          .add(function () { introReady.then(function () { playIntro(true); }); }, '-=0.3');
      } else {
        finish();
      }
    });
    no.addEventListener('click', function () {
      $('.gate__inner').hidden = true;
      $('#gate-denied').hidden = false;
    });
  }

  if (!hasGsap) return;

  /* ---------------- Hero scroll-out ---------------- */
  if (!reduceMotion) {
    gsap.to('.hero__copy', {
      yPercent: -18, autoAlpha: 0.15, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero__media', {
      yPercent: 22, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
  }
  var lastY = window.scrollY;
  function onNavScroll() {
    var y = window.scrollY;
    var past = y > hero.offsetHeight - 72;
    nav.classList.toggle('is-solid', past);
    if (Math.abs(y - lastY) > 4) {
      nav.classList.toggle('is-hidden', past && y > lastY && !document.activeElement.closest('.nav'));
      lastY = y;
    }
  }
  if (lenis) lenis.on('scroll', onNavScroll); else window.addEventListener('scroll', onNavScroll, { passive: true });

  /* ---------------- Loading bay ---------------- */
  var bay = $('.bay');
  var pin = $('#bay-pin');
  var track = $('#bay-track');
  var houses = $$('.house');


  function fanLayout(cards) {
    var n = cards.length, w = cards[0].offsetWidth || 200;
    var spread = (n === 2 ? 0.7 : 0.58) * (window.innerWidth < 600 ? 0.78 : 1);
    return cards.map(function (c, i) {
      var k = i - (n - 1) / 2;
      return { x: k * w * spread, y: Math.abs(k) * w * 0.09, rotation: k * (n === 2 ? 10 : 8) };
    });
  }
  function fanTween(house, scrollTrigger) {
    var cards = $$('.house__fan li', house);
    if (!cards.length) return;
    var to = fanLayout(cards);
    return gsap.fromTo(cards,
      { xPercent: -50, yPercent: -50, x: 0, y: 60, rotation: function (i) { return (i - (cards.length - 1) / 2) * 1.5; } },
      {
        x: function (i) { return to[i].x; }, y: function (i) { return to[i].y; }, rotation: function (i) { return to[i].rotation; },
        ease: 'none', scrollTrigger: scrollTrigger
      });
  }

  // Title: the two lines slide in from opposite sides as it comes up
  if (!reduceMotion) fontsReady.then(function () {
    var bt = new SplitText('.bay__title', { type: 'lines', linesClass: 'bline' });
    gsap.fromTo(bt.lines, { xPercent: function (i) { return i % 2 ? 18 : -18; }, autoAlpha: 0.2 }, {
      xPercent: 0, autoAlpha: 1, ease: 'none',
      scrollTrigger: { trigger: '.bay__intro', start: 'top 85%', end: 'top 30%', scrub: true }
    });
    ScrollTrigger.refresh();
  });

  var mm = gsap.matchMedia();

  mm.add('(min-width: 821px) and (prefers-reduced-motion: no-preference)', function () {
    bay.classList.add('bay--pinned');
    var meter = $('#bay-meter');
    var loadButtons = $$('.bay__load button');
    var applyProgress = function (p) {
      var active = Math.round(p * (houses.length - 1));
      loadButtons.forEach(function (btn, k) { btn.classList.toggle('is-active', k === active); });
      meter.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    };
    var dist = function () { return track.scrollWidth - window.innerWidth; };

    var scrollTween = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: pin, pin: true, scrub: 0.8, start: 'top top',
        end: function () { return '+=' + dist(); },
        invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function (self) { applyProgress(self.progress); }
      }
    });
    applyProgress(0);

    houses.forEach(function (h, i) {
      var name = $('.house__name', h);
      var text = $('.house__text', h);
      if (i === 0) {
        fanTween(h, { trigger: pin, start: 'top 75%', end: 'top top', scrub: true });
        gsap.fromTo(name, { xPercent: 0 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: h, containerAnimation: scrollTween, start: 'left left', end: 'right left', scrub: true } });
      } else {
        fanTween(h, { trigger: h, containerAnimation: scrollTween, start: 'left 80%', end: 'left 10%', scrub: true });
        gsap.fromTo(name, { xPercent: 8 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: h, containerAnimation: scrollTween, start: 'left right', end: 'right left', scrub: true } });
        gsap.fromTo(text, { autoAlpha: 0.25 }, { autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: h, containerAnimation: scrollTween, start: 'left 70%', end: 'left 25%', scrub: true } });
      }
    });

    loadButtons.forEach(function (btn, k) {
      btn.addEventListener('click', function () {
        var st = scrollTween.scrollTrigger;
        scrollToY(st.start + (st.end - st.start) * (k / (houses.length - 1)));
      });
    });

    return function () {
      bay.classList.remove('bay--pinned');
    };
  });

  mm.add('(max-width: 820px) and (prefers-reduced-motion: no-preference)', function () {
    houses.forEach(function (h) {
      fanTween(h, { trigger: $('.house__fan', h), start: 'top 90%', end: 'center 55%', scrub: true });
    });
  });

  mm.add('(prefers-reduced-motion: reduce)', function () {
    houses.forEach(function (h) {
      var cards = $$('.house__fan li', h);
      if (!cards.length) return;
      var to = fanLayout(cards);
      gsap.set(cards, { xPercent: -50, yPercent: -50, x: function (i) { return to[i].x; }, y: function (i) { return to[i].y; }, rotation: function (i) { return to[i].rotation; } });
    });
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
