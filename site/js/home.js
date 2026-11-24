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

  // ─── team slider: auto-advances, swipe (touch) or drag (mouse) to move ───
  (function(){
    const track = document.getElementById('teamTrack');
    if (!track) return;
    const slider = track.closest('.team-slider');
    const dots = Array.from(slider.querySelectorAll('.team-dot'));
    const slideCount = track.children.length;
    const AUTO_SLIDE_MS = 4000;
    const SWIPE_THRESHOLD_PX = 50;
    const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let currentIndex = 0;
    let autoSlideTimer;

    function goToSlide(index){
      // wrap around so "next" on the last photo goes back to the first
      const wrappedIndex = (index + slideCount) % slideCount;
      track.scrollTo({ left: wrappedIndex * track.clientWidth, behavior: 'smooth' });
    }

    function startAutoSlide(){
      if (prefersReducedMotion) return;
      clearInterval(autoSlideTimer);
      autoSlideTimer = setInterval(() => goToSlide(currentIndex + 1), AUTO_SLIDE_MS);
    }

    function stopAutoSlide(){
      clearInterval(autoSlideTimer);
    }

    // the scroll position is the source of truth — it covers swipes, drags, arrows and the timer
    track.addEventListener('scroll', () => {
      currentIndex = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === currentIndex));
    }, { passive: true });

    document.getElementById('teamPrev').addEventListener('click', () => goToSlide(currentIndex - 1));
    document.getElementById('teamNext').addEventListener('click', () => goToSlide(currentIndex + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goToSlide(i)));

    // pause while the user is looking at or touching the photos
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);
    track.addEventListener('touchstart', stopAutoSlide, { passive: true });
    track.addEventListener('touchend', startAutoSlide, { passive: true });

    // mouse drag — touch already swipes natively through scroll-snap
    let isDragging = false;
    let dragStartX = 0;
    let dragStartScroll = 0;

    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartScroll = track.scrollLeft;
      track.classList.add('is-dragging');
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      track.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
    });

    function handleDragEnd(e){
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove('is-dragging');
      const dragDistance = e.clientX - dragStartX;
      const startIndex = Math.round(dragStartScroll / track.clientWidth);
      if (dragDistance < -SWIPE_THRESHOLD_PX) goToSlide(startIndex + 1);
      else if (dragDistance > SWIPE_THRESHOLD_PX) goToSlide(startIndex - 1);
      else goToSlide(startIndex);
    }
    track.addEventListener('pointerup', handleDragEnd);
    track.addEventListener('pointercancel', handleDragEnd);

    startAutoSlide();
  })();

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
