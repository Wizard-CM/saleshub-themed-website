// ─── Now Pouring rotator (4 houses)
  (function(){
    const houses = [
      { name:'Gorkha Brewery', dot:'.',
        year:'Beer', count:'10', origin:'Nepal',
        tagText:'HOUSE 01 / KTM · GORKHA BREWERY', link:'brewery-gorkha.html',
        img:'assets/Product%20Images/Gorkha%20Craft.jpeg' },
      { name:'Prime International', dot:'.',
        year:'Spirits', count:'06', origin:'Nepal',
        tagText:'HOUSE 02 / KTM · PRIME INTERNATIONAL', link:'brewery-prime.html',
        img:'assets/Product%20Images/Bandipur.jpeg' },
      { name:'Big Master', dot:'.',
        year:'Wine', count:'03', origin:'Nepal',
        tagText:'HOUSE 03 / KTM · BIG MASTER', link:'brewery-bigmaster.html',
        img:'assets/Product%20Images/Red%20Wine.jpeg' },
      { name:'Saras Beverages', dot:'.',
        year:'Energy', count:'02', origin:'Nepal',
        tagText:'HOUSE 04 / KTM · SARAS BEVERAGES', link:'brewery-saras.html',
        img:'assets/Product%20Images/redbull%20carbonated.jpeg' },
    ];
    const els = {
      idx: document.getElementById('pourIdx'),
      name: document.getElementById('pourName'),
      year: document.getElementById('pourYear'),
      count: document.getElementById('pourCount'),
      origin: document.getElementById('pourOrigin'),
      tagText: document.getElementById('pourTagText'),
      img: document.getElementById('brewImg'),
      link: document.getElementById('pourHouseLink'),
      bar: document.getElementById('pourBar'),
    };
    const queue = document.querySelectorAll('#pourQueue .queue-item');

    let i = 0;
    function show(n, isManual){
      const L = houses[n]; if (!L) return;
      els.img.classList.add('swap');
      [els.name, els.year, els.count, els.origin].forEach(el => el.style.opacity =0);
      setTimeout(() => {
        els.img.style.setProperty('--brew-img', `url('${L.img}')`);
        els.idx.textContent = String(n+1).padStart(2,'0');
        els.name.innerHTML = L.name + '<span class="serif" style="color:var(--coral);padding:0 .02em;font-size:1.06em">' + L.dot + '</span>';
        // Long distillery names (e.g. "Prime International", "Saras Beverages")
        // would otherwise starve the centre image of space — shrink just those.
        const longestWord = Math.max(...L.name.split(' ').map(w => w.length));
        if (longestWord > 8){
          els.name.style.fontSize = 'clamp(38px, 4.8vw, 66px)';
          els.name.style.lineHeight = '.92';
        } else {
          els.name.style.fontSize = 'clamp(56px,9vw,144px)';
          els.name.style.lineHeight = '.86';
        }
        els.year.textContent = L.year;
        els.count.textContent = L.count;
        els.origin.innerHTML = L.origin;
        els.tagText.textContent = L.tagText;
        els.link.href = L.link;
        queue.forEach((q, qi) => q.classList.toggle('active', qi === n));
        els.img.classList.remove('swap');
        [els.name, els.year, els.count, els.origin].forEach(el => el.style.opacity =1);
      }, 320);
      i = n;
      if (isManual) restartProgress();
    }
    queue.forEach(q => q.addEventListener('click', () => show(+q.dataset.i, true)));

    // progress + auto-advance
    const stage = document.getElementById('pourStage');
    const DUR = 6500;
    let t0 = performance.now();
    let paused = false;
    stage.addEventListener('pointerenter', () => paused = true);
    stage.addEventListener('pointerleave', () => { paused = false; t0 = performance.now() - (parseFloat(els.bar.dataset.elapsed)||0) * DUR; });
    function restartProgress(){ t0 = performance.now() }
    function tick(now){
      if (!paused){
        const elapsed = (now - t0) / DUR;
        els.bar.dataset.elapsed = Math.min(1, elapsed);
        els.bar.style.width = Math.min(100, elapsed*100) + '%';
        if (elapsed >= 1){
          show((i + 1) % houses.length, false);
          t0 = now;
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
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
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => obs.observe(el));
  })();

  // ─── 3D tilt on house cards ────────────────────────────────
  (function(){
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.house-card').forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - .5;
        const y = (e.clientY - rect.top) / rect.height - .5;
        card.style.transform = `translateY(-8px) perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg)`;
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
        `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,.15), transparent 40%),
         linear-gradient(135deg, #D9A26B, #FF8A6E 50%, #FF5C3A)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.background = '';
    });
  })();
