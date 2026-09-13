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
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => obs.observe(el));
  })();

  // ─── year rail: active state + click-jump ──────────────────
  (function(){
    const links = document.querySelectorAll('#rail a[data-target]');
    const moments = Array.from(links).map(a => document.getElementById(a.dataset.target));
    links.forEach(a => a.addEventListener('click', (e) => {
      e.preventDefault();
      const t = document.getElementById(a.dataset.target);
      t.scrollIntoView({ behavior:'smooth', block:'start' });
    }));
    function update(){
      const y = window.scrollY + 180;
      let active = 0;
      moments.forEach((m, i) => { if (m.offsetTop <= y) active = i; });
      links.forEach((a, i) => a.classList.toggle('active', i === active));
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

  // ─── 3D tilt on artifact cards ─────────────────────────────
  (function(){
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.artifact-card').forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - .5;
        const y = (e.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  })();

  // ─── CTA interactive gradient ──────────────────────────────
  (function(){
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = document.querySelector('.cta-strip');
    if (!card) return;
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
      card.style.background =
        `radial-gradient(circle at ${x}% ${y}%, rgba(255,180,140,.65), transparent 45%),
         linear-gradient(135deg, var(--coral), #FF8260 60%, var(--coral-soft))`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.background = '';
    });
  })();
