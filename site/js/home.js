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
  // ─── parallax: very subtle bg drift on cursor ──────────────
  (function(){
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const hero = document.querySelector('.hero .glass');
    if (!hero) return;
    window.addEventListener('pointermove', (e) => {
      const x = (e.clientX / window.innerWidth - .5) * 16;
      const y = (e.clientY / window.innerHeight - .5) * 8;
      hero.style.transform = `translateX(calc(-50% + ${x}px)) translateY(${y}px)`;
    });
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
