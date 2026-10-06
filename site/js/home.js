// ─── cursor dot ─────────────────────────────────────────────
  (function(){
    const dot = null; if (!dot) return;
    let x = window.innerWidth/2, y = window.innerHeight/2, tx = x, ty = y;
    window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
    function tick(){
      x += (tx - x) * 0.25; y += (ty - y) * 0.25;
      dot.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    // grow on interactive
    document.querySelectorAll('a, button, .pcard, .polaroid').forEach(el => {
      el.addEventListener('pointerenter', () => dot.classList.add('hover'));
      el.addEventListener('pointerleave', () => dot.classList.remove('hover'));
    });
  })();

  // ─── split headings into words (mask rise, see [data-split] CSS) ───
  (function(){
    document.querySelectorAll('[data-split]').forEach(el => {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words
        .map((word, i) => `<span class="word"><span style="--i:${i}">${word}</span></span>`)
        .join(' ');
    });
  })();

  // ─── scroll-triggered reveal system ─────────────────────────
  (function(){
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const els = document.querySelectorAll('.s-reveal, .s-stagger');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting){
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => obs.observe(el));

    // Map gets its own observer since children need the parent class
    const map = document.querySelector('.map.s-reveal');
    if (map){
      const mapObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting){
            e.target.classList.add('visible');
            mapObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.2 });
      mapObs.observe(map);
    }

    // Runway cards now auto-slide as a marquee (see .runway-track CSS); no
    // per-card scroll reveal — the whole strip still fades in via .runway-strip.
  })();

  // ─── 3D tilt on bento cards ───────────────────────────────
  (function(){
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.bento-card').forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - .5;
        const y = (e.clientY - rect.top) / rect.height - .5;
        card.style.transform = `translateY(-6px) perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  })();

  // ─── CTA card interactive gradient ────────────────────────
  (function(){
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = document.querySelector('.cta-card');
    if (!card) return;
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
      card.style.background =
        `radial-gradient(circle at ${x}% ${y}%, rgba(255,180,140,.65), transparent 50%),
         linear-gradient(135deg, var(--coral), #FF8260 60%, var(--coral-soft))`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.background = '';
    });
  })();

  // ─── confetti on the orange CTA ─────────────────────────────
  (function(){
    const btn = document.getElementById('convoBtn');
    if (!btn) return;
    const layer = document.createElement('div');
    layer.className = 'confetti';
    document.body.appendChild(layer);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      const colors = ['', 'b', 'c', 'd'];
      for (let i = 0; i < 14; i++){
        const p = document.createElement('i');
        p.className = colors[i % colors.length];
        const ang = (Math.random() * Math.PI) - Math.PI; // upper hemisphere mostly
        const dist = 60 + Math.random() * 100;
        p.style.left = cx + 'px';
        p.style.top = cy + 'px';
        p.style.setProperty('--tx', Math.cos(ang) * dist + 'px');
        p.style.setProperty('--ty', (Math.sin(ang) * dist - 40) + 'px');
        p.style.setProperty('--r', (Math.random() * 540 - 270) + 'deg');
        layer.appendChild(p);
        setTimeout(() => p.remove(), 800);
      }
      showToast('— talk soon. ✦');
    });
  })();

  // ─── cheers easter egg ──────────────────────────────────────
  let toastTimer;
  function showToast(text){
    const t = document.getElementById('toast');
    if (!t) return;
    if (text) t.querySelector('.em').nextSibling.textContent = ' ' + text;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
  }
  window.addEventListener('keydown', (e) => {
    if (e.key && e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey){
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      showToast(' cheers!');
    }
  });

  // ─── small "watch 90s film" stub: shake the button
  document.getElementById('filmBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast(' the film loads here in production.');
  });

  // ─── runway strip (home Portfolio): now a CSS auto-marquee, no JS needed ──

  /* ═══════ CURRENT "The Reel" HERO JS — commented out per request (kept, not removed) ═══════
  // ─── HERO "The Reel": crossfade + NOW SHOWING + entrance wiring ───────────
  // Entrance plays ONLY on a fresh load / refresh (when the entry gate hands off
  // the `hero-anim` class). On internal navigation the gate is skipped, so the
  // hero renders in its final state and nothing animates. Reduced-motion holds
  // on the first film and skips all non-essential motion.
  (function(){
    const html    = document.documentElement;
    const hero    = document.querySelector('.hero');
    if (!hero) return;
    const rm      = matchMedia('(prefers-reduced-motion: reduce)');
    const videos  = Array.from(hero.querySelectorAll('.hero-bg-video'));
    const nsTitle = document.getElementById('nsTitle');
    const nsDotsEl= document.getElementById('nsDots');
    const nsDots  = nsDotsEl ? Array.from(nsDotsEl.children) : [];
    const TITLES  = ['Gurkhas & Guns · Single Malt', 'Bandipur · Whisky', 'Carlsberg · Danish Pilsner'];
    const safePlay = (v) => { const p = v && v.play(); if (p && p.catch) p.catch(() => {}); };

    // Entrance: wait for the preloader to drop data-gating, then reveal once.
    (function armEntrance(){
      if (rm.matches) return;                          // reduced-motion → final state
      if (!html.hasAttribute('data-gating')) return;   // internal nav → already final
      const go = () => html.classList.add('hero-anim');
      const mo = new MutationObserver(() => {
        if (!html.hasAttribute('data-gating')){ mo.disconnect(); go(); }
      });
      mo.observe(html, { attributes: true, attributeFilter: ['data-gating'] });
    })();
  ═══════ END commented-out current hero JS ═══════ */

  // ─── ACTIVE HERO JS — ported from ref-old-index-hero.html ───
  // ─── hero intro: pour the glass, then the headline ─────────
  (function(){
    const html = document.documentElement;
    const hero = document.querySelector('.hero');
    const glass = document.querySelector('.hero .glass');
    if (!hero || !glass) return;
    const heroInner = hero.querySelector('.hero-inner');
    const headline = hero.querySelector('h1');
    const lede = hero.querySelector('.lede');
    const liquid = glass.querySelector('.liquid');

    // Fill the glass so the foam sits in the gap between the headline and the
    // lede — the foam is cream, so crossing the cream headline makes it unreadable.
    function setFillLevel(){
      const glassBottom = glass.offsetTop + glass.offsetHeight;
      const headlineBottom = heroInner.offsetTop + headline.offsetTop + headline.offsetHeight
        - parseFloat(getComputedStyle(headline).paddingBottom);
      const ledeTop = heroInner.offsetTop + lede.offsetTop;
      const surfaceY = (headlineBottom + ledeTop) / 2;
      const fillLevel = Math.min(Math.max(glassBottom - 8 - surfaceY, glass.offsetHeight * .3), glass.offsetHeight - 24);
      glass.style.setProperty('--fill-level', fillLevel + 'px');
    }
    setFillLevel();
    window.addEventListener('resize', setFillLevel);
    if (document.fonts) document.fonts.ready.then(setFillLevel);

    // carbonation: a handful of bubbles with random size, lane and speed
    for (let i = 0; i < 16; i++){
      const bubble = document.createElement('span');
      bubble.className = 'bubble';
      const duration = 4 + Math.random() * 5;
      bubble.style.setProperty('--x', (4 + Math.random() * 92) + '%');
      bubble.style.setProperty('--size', (3 + Math.random() * 6) + 'px');
      bubble.style.setProperty('--duration', duration + 's');
      bubble.style.setProperty('--delay', (-Math.random() * duration) + 's');
      liquid.appendChild(bubble);
    }

    // Wait for the age gate to lift so the pour isn't wasted behind it.
    const playIntro = () => html.classList.add('hero-in');
    if (!html.hasAttribute('data-gating')){
      requestAnimationFrame(() => requestAnimationFrame(playIntro));
      return;
    }
    const gateWatcher = new MutationObserver(() => {
      if (html.hasAttribute('data-gating')) return;
      gateWatcher.disconnect();
      playIntro();
    });
    gateWatcher.observe(html, { attributes: true, attributeFilter: ['data-gating'] });
  })();

  // ─── hero depth: glass leans to the cursor, drains as you scroll ───
  (function(){
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const hero = document.querySelector('.hero');
    const glass = document.querySelector('.hero .glass');
    if (!hero || !glass) return;

    window.addEventListener('pointermove', (e) => {
      const x = (e.clientX / window.innerWidth - .5) * 16;
      const y = (e.clientY / window.innerHeight - .5) * 8;
      glass.style.setProperty('--glass-x', x + 'px');
      glass.style.setProperty('--glass-y', y + 'px');
    });

    // the drink is "moved" as you leave the hero — drains to 40% by the time it's gone
    let ticking = false;
    function updateLevel(){
      const progress = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
      glass.style.setProperty('--level', (1 - progress * .6).toFixed(3));
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateLevel);
    }, { passive: true });
  })();

  // ─── hero headline — static text (scramble animation removed per request) ───
  // The headline now renders as plain text; no decode/scramble effect.

  /* ═══════ CURRENT "The Reel" HERO JS (cont.) — commented out per request (kept, not removed) ═══════
    // Video crossfade + NOW SHOWING — one counter drives both so they never desync.
    if (videos.length){
      let i = 0;
      safePlay(videos[0]);

      function setNowShowing(idx){
        if (nsTitle){
          if (rm.matches){ nsTitle.textContent = TITLES[idx]; }
          else {
            nsTitle.classList.add('rolling');            // roll the old title up and out
            setTimeout(() => {
              nsTitle.textContent = TITLES[idx];
              nsTitle.classList.remove('rolling');       // new title settles in
            }, 300);
          }
        }
        nsDots.forEach((d, n) => d.classList.toggle('is-on', n === idx));
      }

      // Reduced-motion: hold on the first film — no auto-advance, no crossfade cycling.
      if (!rm.matches && videos.length > 1){
        const advance = () => {
          const next = (i + 1) % videos.length, inV = videos[next], outV = videos[i];
          safePlay(inV);                                 // start incoming before the fade
          inV.classList.add('active');
          outV.classList.remove('active');
          setNowShowing(next);
          setTimeout(() => { if (outV !== inV && !inV.paused) outV.pause(); }, 1000);
          i = next;
        };
        let timer = setInterval(advance, 5500);
        document.addEventListener('visibilitychange', () => {
          if (document.hidden){ clearInterval(timer); videos.forEach(v => v.pause()); }
          else { safePlay(videos[i]); clearInterval(timer); timer = setInterval(advance, 5500); }
        });
      }
    }

    // Warm cursor "polish" glow, clamped to the right/empty half; drifts when idle.
    if (!rm.matches){
      let px = 72, py = 42, tx = 72, ty = 42, idle = 0, raf = 0, t0 = performance.now();
      const set = () => { hero.style.setProperty('--px', px.toFixed(1) + '%'); hero.style.setProperty('--py', py.toFixed(1) + '%'); };
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        tx = Math.max(50, ((e.clientX - r.left) / r.width) * 100);  // clamp so it never touches the headline
        ty = ((e.clientY - r.top) / r.height) * 100;
        idle = 0; hero.classList.add('has-polish');
      });
      function loop(now){
        idle += 16;
        if (idle > 1400){                                // idle → slow lissajous drift
          const s = (now - t0) / 1000;
          tx = 72 + Math.sin(s * 0.5) * 12; ty = 42 + Math.sin(s * 0.37) * 10;
          hero.classList.add('has-polish');
        }
        px += (tx - px) * 0.08; py += (ty - py) * 0.08; set();
        if (!document.hidden) raf = requestAnimationFrame(loop);
      }
      raf = requestAnimationFrame(loop);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden){ cancelAnimationFrame(raf); }
        else { t0 = performance.now(); raf = requestAnimationFrame(loop); }
      });
    }
  })();
  ═══════ END commented-out current hero JS (cont.) ═══════ */

  // ─── count-up numbers ("21 labels", HQ coordinates) ────────
  // The HTML already holds the final value, so without JS it still reads right.
  (function(){
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const COUNT_DURATION_MS = 1400;

    const getDecimals = (el) => (el.dataset.count.split('.')[1] || '').length;

    function countUp(el){
      const target = parseFloat(el.dataset.count);
      const decimals = getDecimals(el);
      const start = performance.now();
      function tick(now){
        const progress = Math.min((now - start) / COUNT_DURATION_MS, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        countUp(e.target);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.6 });

    document.querySelectorAll('[data-count]').forEach(el => {
      el.textContent = (0).toFixed(getDecimals(el));
      obs.observe(el);
    });
  })();

  // ─── nav hides while scrolling down, returns on scroll up ──
  (function(){
    const navWrap = document.querySelector('.nav-wrap');
    if (!navWrap) return;
    const SHOW_NAV_ABOVE_PX = 160;
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (Math.abs(scrollY - lastScrollY) < 6) return;
      navWrap.classList.toggle('is-hidden', scrollY > lastScrollY && scrollY > SHOW_NAV_ABOVE_PX);
      lastScrollY = scrollY;
    }, { passive: true });
  })();
