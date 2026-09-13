// ─── scroll-triggered reveal system ─────────────────────────
  (function(){
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const els = document.querySelectorAll('.s-reveal, .s-stagger, .s-reveal-parent');
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

    // Pinboard — observe for artifact entrance
    const pinboard = document.querySelector('.pinboard');
    if (pinboard){
      const pObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting){
            e.target.classList.add('visible');
            pObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.2 });
      pObs.observe(pinboard);
    }

    // Map — observe for child element entrance
    const map = document.querySelector('.map');
    if (map){
      const mObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting){
            e.target.classList.add('visible');
            mObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.2 });
      mObs.observe(map);
    }

    // Timeline cards — stagger with IntersectionObserver
    const tlCards = document.querySelectorAll('.tl-card');
    tlCards.forEach((card, i) => {
      card.classList.add('s-reveal');
      card.style.transitionDelay = (i * .08) + 's';
    });
    const tlObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting){
          e.target.classList.add('visible');
          tlObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    tlCards.forEach(c => tlObs.observe(c));
  })();

  // ─── count-up animation for numbers strip ──────────────────
  const countEls = document.querySelectorAll('[data-count]');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const dur = 1100; const start = performance.now();
      const suffix = el.querySelector('.serif')?.outerHTML || '';
      const ease = (t) => 1 - Math.pow(1-t, 3);
      function tick(now){
        const t = Math.min(1, (now - start) / dur);
        const v = Math.round(ease(t) * target);
        el.innerHTML = String(v).padStart(2, '0') + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      cio.unobserve(el);
    });
  }, { threshold: .4 });
  countEls.forEach(el => cio.observe(el));

  // ─── timeline drag-to-scroll ───────────────────────────────
  (function(){
    const t = document.getElementById('tlTrack'); if (!t) return;
    let down = false, sx = 0, sl = 0, moved = false;
    t.addEventListener('pointerdown', (e) => {
      down=true; moved=false; sx=e.clientX; sl=t.scrollLeft;
      t.setPointerCapture(e.pointerId); t.style.cursor='grabbing';
    });
    t.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) moved = true;
      t.scrollLeft = sl - dx;
    });
    const end = () => { down=false; t.style.cursor='grab'; };
    t.addEventListener('pointerup', end);
    t.addEventListener('pointercancel', end);
    t.addEventListener('click', (e) => { if (moved){ e.preventDefault(); e.stopPropagation(); }}, true);
    t.style.cursor='grab';
  })();

  // ─── 3D tilt on value cards ────────────────────────────────
  (function(){
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.v-card').forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - .5;
        const y = (e.clientY - rect.top) / rect.height - .5;
        card.style.transform = `translateY(-4px) perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  })();

  // ─── CTA strip interactive gradient ────────────────────────
  (function(){
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = document.querySelector('.cta-strip');
    if (!card) return;
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
      card.style.background =
        `radial-gradient(circle at ${x}% ${y}%, rgba(217,162,107,.5), transparent 45%),
         linear-gradient(135deg, #16332A, #4A6B47 40%, #D9A26B)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.background = '';
    });
  })();
