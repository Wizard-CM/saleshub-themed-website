// SalesHub.Nepal — Entry gate (age verification + preloader)
// Pair with entry-gate.css. Self-contained.
//
// Behavior:
//  - First load OR full refresh: show age gate.
//  - Internal navigation (same tab, same session, no reload): skip.
//  - "Yes, 18+" → preloader → site.
//  - "No" → restricted screen (stays until reconsider).

(function(){
  const PASS_KEY = 'saleshub-entered';
  const DENY_KEY = 'saleshub-restricted';
  let html = document.documentElement;

  function navType(){
    try { return (performance.getEntriesByType('navigation')[0] || {}).type; }
    catch(e){ return undefined; }
  }
  const isReload = navType() === 'reload';
  const denied   = sessionStorage.getItem(DENY_KEY) === '1';
  const passed   = sessionStorage.getItem(PASS_KEY) === '1';

  // If user has passed and this isn't a reload → skip the gate entirely
  if (passed && !isReload && !denied) return;
  // If they passed but reloaded, clear the flag so gate shows again
  if (passed && isReload) sessionStorage.removeItem(PASS_KEY);

  html.setAttribute('data-gating', '1');

  function ready(fn){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function buildEl(html){
    const d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstElementChild;
  }

  function renderAgeGate(){
    const overlay = buildEl(`
      <div class="entry-overlay" data-stage="age" role="dialog" aria-modal="true" aria-labelledby="entryTitle">
        <div class="entry-bg" aria-hidden="true">
          <div class="entry-orb o1"></div>
          <div class="entry-orb o2"></div>
          <div class="entry-grid"></div>
        </div>
        <div class="entry-card">
          <div class="entry-stamp" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs><path id="entryCir" d="M 60,60 m -46,0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0"/></defs>
              <text><textPath href="#entryCir">★ KATHMANDU · 18+ ONLY · DRINK RESPONSIBLY · </textPath></text>
            </svg>
            <div class="core">SH</div>
          </div>
          <div class="entry-badgerow">
            <div class="entry-brand"><img src="assets/logo.jpg" alt="SalesHub Nepal" class="brand-logo"></div>
            <span class="entry-agechip" aria-hidden="true">18+</span>
          </div>
          <p class="entry-eyebrow"><span class="dot"></span>Quick question</p>
          <h1 class="entry-title" id="entryTitle">Are you<br><span class="serif">eighteen</span> or older?</h1>
          <p class="entry-copy">SalesHub.Nepal is a wholesale beverage distributor. Please confirm you're of legal drinking age in your jurisdiction before you come in.</p>
          <p class="entry-meta">18+ Only<span class="sep">·</span>Kathmandu<span class="sep">·</span>Est. 2014</p>
          <div class="entry-actions">
            <button class="entry-btn entry-yes" type="button">
              <span>Yes, I'm 18+</span>
              <span class="arr">→</span>
            </button>
            <button class="entry-btn ghost entry-no" type="button">No, take me back</button>
          </div>
          <p class="entry-foot">By continuing you agree to our <a href="#">terms</a> &amp; <a href="#">privacy</a>. Always drink responsibly.</p>
        </div>
      </div>
    `);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    const yes = overlay.querySelector('.entry-yes');
    const no  = overlay.querySelector('.entry-no');

    yes.addEventListener('click', () => {
      sessionStorage.setItem(PASS_KEY, '1');
      overlay.classList.add('leave');
      setTimeout(() => { overlay.remove(); renderPreloader(); }, 500);
    });

    no.addEventListener('click', () => {
      sessionStorage.setItem(DENY_KEY, '1');
      overlay.classList.add('leave');
      setTimeout(() => { overlay.remove(); renderRestricted(); }, 500);
    });

    // Esc → No
    document.addEventListener('keydown', function escHandler(e){
      if (e.key === 'Escape'){
        document.removeEventListener('keydown', escHandler);
        no.click();
      }
    });
    setTimeout(() => yes.focus(), 600);
  }

  function renderPreloader(){
    const overlay = buildEl(`
      <div class="entry-overlay entry-pre entry-flute" data-stage="pre" aria-hidden="true">
        <div class="entry-bg" aria-hidden="true">
          <div class="entry-orb o1"></div>
          <div class="entry-orb o2"></div>
          <div class="entry-grid"></div>
        </div>
        <div class="pre-content">
          <div class="pre-brandmark"><img src="assets/logo.jpg" alt="SalesHub Nepal" class="brand-logo"></div>
          <p class="pre-kicker"><span class="ping" aria-hidden="true"></span>Pouring your welcome · Kathmandu · Est. 2014 · Drink responsibly</p>

          <div class="flute-stage" aria-hidden="true">
            <svg class="flute-svg" viewBox="0 0 240 420" width="200" height="350" preserveAspectRatio="xMidYMid meet" role="img" aria-hidden="true">
              <defs>
                <linearGradient id="fluteLiq" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%"  stop-color="#C0632F"/>
                  <stop offset="45%" stop-color="#D9A26B"/>
                  <stop offset="100%" stop-color="#FF6B47"/>
                </linearGradient>
                <linearGradient id="fluteWall" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stop-color="rgba(244,239,227,.16)"/>
                  <stop offset="12%"  stop-color="rgba(244,239,227,.42)"/>
                  <stop offset="50%"  stop-color="rgba(244,239,227,.04)"/>
                  <stop offset="88%"  stop-color="rgba(144,213,255,.20)"/>
                  <stop offset="100%" stop-color="rgba(244,239,227,.10)"/>
                </linearGradient>
                <linearGradient id="fluteRim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stop-color="rgba(255,247,235,.95)"/>
                  <stop offset="100%" stop-color="rgba(255,247,235,0)"/>
                </linearGradient>
                <radialGradient id="fluteBead" cx="38%" cy="34%" r="62%">
                  <stop offset="0%"  stop-color="rgba(255,244,226,.95)"/>
                  <stop offset="55%" stop-color="rgba(255,220,190,.45)"/>
                  <stop offset="100%" stop-color="rgba(255,220,190,0)"/>
                </radialGradient>
                <linearGradient id="fluteGlint" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stop-color="rgba(244,239,227,0)"/>
                  <stop offset="50%"  stop-color="rgba(244,239,227,.55)"/>
                  <stop offset="100%" stop-color="rgba(244,239,227,0)"/>
                </linearGradient>
                <clipPath id="fluteBowl">
                  <path d="M98,42 C93,150 109,233 113,249 L127,249 C131,233 147,150 142,42 Z"/>
                </clipPath>
              </defs>

              <!-- GLASS body: fill + double hairline crystal walls -->
              <g class="flute-glass">
                <path class="glass-fill" d="M96,40 C90,150 108,235 112,250 L128,250 C132,235 150,150 144,40 A24,6 0 0,1 96,40 Z" fill="url(#fluteWall)"/>
                <!-- stem + foot -->
                <path class="glass-stem" d="M118,250 L118,380 M122,250 L122,380" fill="none" stroke="#F4EFE3" stroke-opacity=".5" stroke-width="1.4"/>
                <ellipse class="glass-foot" cx="120" cy="384" rx="34" ry="7" fill="url(#fluteWall)" stroke="#F4EFE3" stroke-opacity=".5" stroke-width="1.4"/>
                <ellipse class="glass-foot-hl" cx="112" cy="382" rx="14" ry="2.2" fill="rgba(244,239,227,.32)"/>
              </g>

              <!-- LIQUID + BEADS, clipped to the inner bowl -->
              <g clip-path="url(#fluteBowl)">
                <path class="flute-fluid" d="M96,250 L144,250 L144,249 L96,249 Z" fill="url(#fluteLiq)"/>
                <!-- two offset traveling waves that ride the meniscus -->
                <path class="flute-wave wave-b" d="" fill="url(#fluteLiq)" opacity=".55"/>
                <path class="flute-wave wave-a" d="" fill="url(#fluteLiq)"/>
                <g class="flute-beads"></g>
                <path class="flute-meniscus" d="" fill="none" stroke="url(#fluteRim)" stroke-width="2" stroke-linecap="round"/>
              </g>

              <!-- GLASS crystal walls drawn OVER liquid for depth -->
              <g class="flute-walls">
                <path d="M96,40 C90,150 108,235 112,250 L128,250 C132,235 150,150 144,40" fill="none" stroke="#F4EFE3" stroke-opacity=".5" stroke-width="1.4" stroke-linejoin="round"/>
                <path d="M100,44 C95,150 111,231 115,247 M140,44 C145,150 129,231 125,247" fill="none" stroke="#F4EFE3" stroke-opacity=".22" stroke-width="1"/>
                <ellipse cx="120" cy="40" rx="24" ry="6" fill="none" stroke="#F4EFE3" stroke-opacity=".5" stroke-width="1.4"/>
                <!-- left cream specular column + slow glint sweep -->
                <rect class="flute-glint" x="99" y="46" width="4" height="190" rx="2" fill="url(#fluteGlint)"/>
              </g>

              <!-- CROWN spark + ping ring at the rim -->
              <g class="flute-crown" transform="translate(120 38)">
                <circle class="crown-ring" cx="0" cy="0" r="10" fill="none" stroke="#FF5C3A" stroke-width="1.6"/>
                <path class="crown-star" d="M0,-9 L2.1,-2.1 L9,0 L2.1,2.1 L0,9 L-2.1,2.1 L-9,0 L-2.1,-2.1 Z" fill="#FF6B47"/>
              </g>
            </svg>
          </div>

          <div class="pre-footrow">
            <p class="flute-cheers"><span>cheers.</span></p>
            <div class="pre-counter">
              <span class="pre-count">00</span><span class="count-unit">/99</span>
            </div>
          </div>
        </div>
      </div>
    `);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    const countEl   = overlay.querySelector('.pre-count');
    const fluidEl    = overlay.querySelector('.flute-fluid');
    const waveAEl    = overlay.querySelector('.wave-a');
    const waveBEl    = overlay.querySelector('.wave-b');
    const menEl      = overlay.querySelector('.flute-meniscus');
    const beadsG     = overlay.querySelector('.flute-beads');
    const crownEl    = overlay.querySelector('.flute-crown');

    // Bowl geometry (SVG user units). Liquid top (Ytop) rides progress:
    //   level 0 -> Y_BASE (empty at bowl base), level 1 -> Y_RIM (full at rim).
    const Y_RIM  = 42;
    const Y_BASE = 249;
    const SPAN   = Y_BASE - Y_RIM;        // 207
    const X_L = 96, X_R = 144, X_MID = 120;

    const prefersReduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Champagne beads: 3 nucleation columns, <=20 circles total ──
    const BEAD_COLS = [107, 120, 133];
    const beads = [];
    const NS = 'http://www.w3.org/2000/svg';
    BEAD_COLS.forEach((bx, ci) => {
      const n = 6; // 3 x 6 = 18 total (<=20)
      for (let i = 0; i < n; i++){
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('r', '1');
        c.setAttribute('fill', 'url(#fluteBead)');
        beadsG.appendChild(c);
        beads.push({
          el: c,
          x: bx + (Math.random() * 2 - 1) * 3,
          baseX: bx,
          y: Y_BASE - Math.random() * SPAN,   // scattered up the column
          speed: 28 + Math.random() * 18,      // px/s
          r0: 0.8 + Math.random() * 1.0,
          phase: Math.random() * Math.PI * 2
        });
      }
    });

    // Build the meniscus wave path. yTop is the surface line; two calls with
    // offset phase + direction give the "two offset waves drifting opposite" look.
    function wavePath(yTop, phase, amp, dir){
      // shallow travelling sine sampled across the bowl width, closed to the base
      const steps = 6;
      let d = 'M' + X_L + ',' + Y_BASE.toFixed(1) + ' L' + X_L + ',';
      const pts = [];
      for (let i = 0; i <= steps; i++){
        const fx = i / steps;
        const x = X_L + fx * (X_R - X_L);
        const y = yTop + Math.sin(phase * dir + fx * Math.PI * 2) * amp;
        pts.push([x, y]);
      }
      d += pts[0][1].toFixed(2);
      for (let i = 1; i < pts.length; i++){
        // smooth-ish with quadratic midpoints
        const [x0, y0] = pts[i - 1];
        const [x1, y1] = pts[i];
        const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
        d += ' Q' + x0.toFixed(2) + ',' + y0.toFixed(2) + ' ' + mx.toFixed(2) + ',' + my.toFixed(2);
      }
      const last = pts[pts.length - 1];
      d += ' L' + last[0].toFixed(2) + ',' + last[1].toFixed(2);
      d += ' L' + X_R + ',' + Y_BASE.toFixed(1) + ' Z';
      return d;
    }
    // Just the top curve (for the bright meniscus rim stroke)
    function menPath(yTop, phase, amp, dir){
      const steps = 6;
      const pts = [];
      for (let i = 0; i <= steps; i++){
        const fx = i / steps;
        const x = X_L + fx * (X_R - X_L);
        const y = yTop + Math.sin(phase * dir + fx * Math.PI * 2) * amp;
        pts.push([x, y]);
      }
      let d = 'M' + pts[0][0].toFixed(2) + ',' + pts[0][1].toFixed(2);
      for (let i = 1; i < pts.length; i++){
        const [x0, y0] = pts[i - 1];
        const [x1, y1] = pts[i];
        const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
        d += ' Q' + x0.toFixed(2) + ',' + y0.toFixed(2) + ' ' + mx.toFixed(2) + ',' + my.toFixed(2);
      }
      const last = pts[pts.length - 1];
      d += ' L' + last[0].toFixed(2) + ',' + last[1].toFixed(2);
      return d;
    }
    const easeInOutSine = (x) => -(Math.cos(Math.PI * x) - 1) / 2;

    function renderLevel(level, phase, ampScale){
      const yTop = Y_RIM + (1 - level) * SPAN;
      // solid body below the waves (a plain rect from base up to just below crest)
      fluidEl.setAttribute('d',
        'M' + X_L + ',' + Y_BASE + ' L' + X_R + ',' + Y_BASE +
        ' L' + X_R + ',' + (yTop + 4).toFixed(2) +
        ' L' + X_L + ',' + (yTop + 4).toFixed(2) + ' Z');
      const amp = 2.4 * ampScale;
      waveAEl.setAttribute('d', wavePath(yTop, phase, amp, 1));
      waveBEl.setAttribute('d', wavePath(yTop, phase * 1.3 + 1.7, amp * 0.7, -1));
      menEl.setAttribute('d', menPath(yTop, phase, amp, 1));
      return yTop;
    }

    // ── Reduced motion: calm near-final state, then honour the lifecycle ──
    if (prefersReduced){
      const level = 0.96;
      const yTop = renderLevel(level, 0, 0);       // flat meniscus, no wobble
      countEl.textContent = '99';
      // static scatter of ~6 still beads suspended in the liquid
      beads.forEach((b, i) => {
        if (i < 6){
          const cy = yTop + 8 + Math.random() * (Y_BASE - yTop - 12);
          b.el.setAttribute('cx', b.baseX.toFixed(2));
          b.el.setAttribute('cy', cy.toFixed(2));
          b.el.setAttribute('r', (b.r0).toFixed(2));
          b.el.setAttribute('opacity', '.7');
        } else {
          b.el.setAttribute('opacity', '0');
        }
      });
      crownEl.style.opacity = '.6';
      overlay.classList.add('arrived');
      setTimeout(() => {
        overlay.classList.add('leave');
        setTimeout(() => {
          overlay.remove();
          html.removeAttribute('data-gating');
        }, 550);
      }, 700);
      return;
    }

    // ── Animated path: one rAF loop, single driver t ──
    const DUR = 2600;
    const start = performance.now();
    let last = start;
    let arrived = false;

    function tick(now){
      const t = Math.min(1, (now - start) / DUR);
      const dt = Math.min(0.05, (now - last) / 1000); // seconds, clamped
      last = now;

      overlay.style.setProperty('--t', t);
      countEl.textContent = String(Math.floor(t * 99)).padStart(2, '0');

      // level = eased progress (gentle start, mid-rush, settle into the rim)
      const level = easeInOutSine(t);

      // living surface: wobble tapers as the glass fills (poured glass settling)
      const phase = now / 1000 * 2.2;
      const ampScale = (1 - t) * 0.9 + 0.1;
      const yTop = renderLevel(level, phase, ampScale);

      // beads: rise, grow, fade in near floor + fade out near meniscus, recycle
      const density = 0.35 + level * 0.65; // more beads as more liquid exists
      for (let i = 0; i < beads.length; i++){
        const b = beads[i];
        b.y -= b.speed * dt;
        // recycle when it reaches the surface (or above it)
        if (b.y <= yTop + 2){
          b.y = Y_BASE - Math.random() * 4;
          b.x = b.baseX + (Math.random() * 2 - 1) * 3;
          b.speed = 28 + Math.random() * 18;
          b.r0 = 0.8 + Math.random() * 1.0;
        }
        // if the surface hasn't risen above this bead's floor yet, hide it
        if (b.y > Y_BASE - 1 || yTop >= Y_BASE - 4){
          b.el.setAttribute('opacity', '0');
          continue;
        }
        const climb = (Y_BASE - b.y) / Math.max(6, (Y_BASE - yTop)); // 0 floor -> 1 surface
        const r = b.r0 + climb * 0.7;                 // expands as it rises
        const fadeIn  = Math.min(1, (Y_BASE - b.y) / 14);
        const fadeOut = Math.min(1, (b.y - yTop) / 20);
        const op = Math.max(0, Math.min(1, fadeIn * fadeOut)) * density;
        // subtle lateral drift
        const cx = b.x + Math.sin(now / 700 + b.phase) * 0.8;
        b.el.setAttribute('cx', cx.toFixed(2));
        b.el.setAttribute('cy', b.y.toFixed(2));
        b.el.setAttribute('r', r.toFixed(2));
        b.el.setAttribute('opacity', op.toFixed(3));
      }

      // arrival beat: crown spark + ping ring + serif "cheers." once
      if (!arrived && t >= 0.94){
        arrived = true;
        overlay.classList.add('arrived');
      }

      if (t < 1) requestAnimationFrame(tick);
      else finish();
    }

    function finish(){
      overlay.style.setProperty('--t', 1);
      countEl.textContent = '99';
      // pin liquid at full with a calm flat surface
      renderLevel(easeInOutSine(1), 0, 0.1);
      overlay.classList.add('arrived');
      overlay.classList.add('leave');
      setTimeout(() => {
        overlay.remove();
        html.removeAttribute('data-gating');
      }, 550);
    }

    requestAnimationFrame(tick);
  }

  function renderRestricted(){
    const overlay = buildEl(`
      <div class="entry-overlay entry-restricted" data-stage="restricted" role="dialog" aria-modal="true">
        <div class="entry-bg" aria-hidden="true">
          <div class="entry-orb o1"></div>
          <div class="entry-grid"></div>
        </div>
        <div class="entry-card">
          <div class="entry-brand"><img src="assets/logo.jpg" alt="SalesHub Nepal" class="brand-logo"></div>
          <div class="restricted-emoji" aria-hidden="true">✦</div>
          <h1 class="entry-title"><span class="serif">Come back</span><br>when you're 18.</h1>
          <p class="entry-copy">SalesHub.Nepal is a wholesale beverage distributor — and Nepal asks us to keep this side of the door for adults only. We'll keep the kettle on for you.</p>
          <div class="entry-actions" style="justify-content:center">
            <button class="entry-btn ghost entry-reconsider" type="button">I'd like to reconsider</button>
          </div>
          <p class="entry-foot">Need help with alcohol? <a href="#">Find support</a>.</p>
        </div>
      </div>
    `);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    overlay.querySelector('.entry-reconsider').addEventListener('click', () => {
      sessionStorage.removeItem(DENY_KEY);
      overlay.classList.add('leave');
      setTimeout(() => { overlay.remove(); renderAgeGate(); }, 500);
    });
  }

  ready(() => {
    if (denied) renderRestricted();
    else renderAgeGate();
  });
})();
