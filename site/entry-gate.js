// SalesHub.Nepal — Entry gate (age verification + preloader)
// Pair with entry-gate.css. Self-contained.
//
// Behavior:
//  - First load OR full refresh: show age gate.
//  - Internal navigation (same tab, same session, no reload): skip.
//  - "Yes, 18+" → preloader → site.
//  - "No" → restricted screen (stays until reconsider).

// ── Motion policy ────────────────────────────────────────────────────────────
// This site's animations (preloader, hero, scroll reveals) are gentle and are a
// core part of the design. Many phones silently turn on "Reduce Motion" via
// Battery Saver / Low Power Mode, which used to switch EVERY animation off and
// even mis-positioned the hero glass. We want the animations to play on all
// devices, so we report `prefers-reduced-motion: reduce` as false to all the
// JS that gates on it. (CSS is handled separately: its reduced-motion blocks are
// scoped to `and (scripting: none)`, i.e. they only apply when JS is disabled.)
// This loads before every page's animation scripts, so the override is global.
(function(){
  if (!window.matchMedia) return;
  var realMatchMedia = window.matchMedia.bind(window);
  window.matchMedia = function(query){
    if (typeof query === 'string' && /prefers-reduced-motion/i.test(query)){
      return {
        media: query,
        matches: false,
        onchange: null,
        addEventListener: function(){},
        removeEventListener: function(){},
        addListener: function(){},    // legacy Safari
        removeListener: function(){}, // legacy Safari
        dispatchEvent: function(){ return false; }
      };
    }
    return realMatchMedia(query);
  };
})();

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
        <div class="entry-card entry-split">
          <div class="entry-brandside">
            <div class="bs-top">
              <div class="entry-brand"><img src="assets/logo.jpg" alt="SalesHubNepal" class="brand-logo"></div>
              <div class="bs-seal" aria-hidden="true"><span>SH</span></div>
            </div>
            <div class="bs-mid">
              <div class="bs-name">SalesHub<span class="serif">Nepal.</span></div>
              <p class="bs-tag">Nepal's premier beverage distribution network — connecting world-class brands with local markets since 2014.</p>
            </div>
            <div class="bs-foot">
              <span>Kathmandu</span><span class="sep">·</span><span>Est. 2014</span><span class="sep">·</span><span>Wholesale</span>
            </div>
          </div>
          <div class="entry-panel">
            <div class="entry-badgerow">
              <span class="entry-agechip" aria-hidden="true">18+</span>
            </div>
            <p class="entry-eyebrow"><span class="dot"></span>Quick question</p>
            <h1 class="entry-title" id="entryTitle">Are you <span class="serif">eighteen</span> or older?</h1>
            <br></br>
            <div class="entry-actions">
              <button class="entry-btn entry-yes" type="button">
                <span>Yes, I'm 18+ — Enter</span>
                <span class="arr">→</span>
              </button>
              <button class="entry-btn ghost entry-no" type="button">No, take me back</button>
            </div>
            <p class="entry-foot">By continuing you agree to our <a href="#">terms</a> &amp; <a href="#">privacy</a>. Always drink responsibly.</p>
          </div>
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
          <div class="pre-brandmark"><img src="assets/logo.jpg" alt="SalesHubNepal" class="brand-logo"></div>
          <p class="pre-kicker"><span class="ping" aria-hidden="true"></span>Pouring your welcome · Kathmandu · Est. 2014 · Drink responsibly</p>

          <div class="flute-stage" aria-hidden="true">
            <svg class="flute-svg" viewBox="0 0 240 420" width="200" height="350" preserveAspectRatio="xMidYMid meet" role="img" aria-hidden="true">
              <defs>
                <linearGradient id="fluteLiq" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%"  stop-color="#E8431F"/>
                  <stop offset="55%" stop-color="#FF5C3A"/>
                  <stop offset="100%" stop-color="#FF8A5C"/>
                </linearGradient>
                <linearGradient id="fluteWall" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stop-color="rgba(107,70,50,.12)"/>
                  <stop offset="12%"  stop-color="rgba(107,70,50,.30)"/>
                  <stop offset="50%"  stop-color="rgba(107,70,50,.03)"/>
                  <stop offset="88%"  stop-color="rgba(255,138,92,.18)"/>
                  <stop offset="100%" stop-color="rgba(107,70,50,.08)"/>
                </linearGradient>
                <linearGradient id="fluteWallDark" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stop-color="rgba(244,239,227,.16)"/>
                  <stop offset="12%"  stop-color="rgba(244,239,227,.42)"/>
                  <stop offset="50%"  stop-color="rgba(244,239,227,.04)"/>
                  <stop offset="88%"  stop-color="rgba(255,138,92,.20)"/>
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
                  <stop offset="0%"   stop-color="rgba(255,255,255,0)"/>
                  <stop offset="50%"  stop-color="rgba(255,255,255,.65)"/>
                  <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
                </linearGradient>
                <clipPath id="fluteBowl">
                  <path d="M55,118 C56,210 58,322 61,346 Q106,352 151,346 C154,322 156,210 157,118 Z"/>
                </clipPath>
              </defs>

              <!-- GLASS body: fill + double hairline crystal walls (beer mug + handle) -->
              <g class="flute-glass">
                <path class="glass-fill" d="M52,112 C53,210 55,330 56,356 Q106,368 156,356 C157,330 159,210 160,112 A54,9 0 0,1 52,112 Z" fill="url(#fluteWall)"/>
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
                <!-- handle (drawn first so the body wall overlaps its joints) -->
                <path d="M160,152 C194,150 204,196 204,226 C204,260 192,300 157,304" fill="none" stroke="#6B4632" stroke-opacity=".55" stroke-width="1.4"/>
                <path d="M160,170 C184,169 188,202 188,226 C188,252 180,284 156,288" fill="none" stroke="#6B4632" stroke-opacity=".55" stroke-width="1.4"/>
                <!-- body walls -->
                <path d="M52,112 C53,210 55,330 56,356 Q106,368 156,356 C157,330 159,210 160,112" fill="none" stroke="#6B4632" stroke-opacity=".55" stroke-width="1.4" stroke-linejoin="round"/>
                <path d="M56,116 C57,210 59,326 60,350 M156,116 C155,210 153,326 152,350" fill="none" stroke="#6B4632" stroke-opacity=".25" stroke-width="1"/>
                <path d="M60,348 Q106,356 152,348" fill="none" stroke="#6B4632" stroke-opacity=".25" stroke-width="1"/>
                <ellipse cx="106" cy="112" rx="54" ry="9" fill="none" stroke="#6B4632" stroke-opacity=".55" stroke-width="1.4"/>
                <!-- left cream specular column + slow glint sweep (clipped to the bowl) -->
                <g clip-path="url(#fluteBowl)"><rect class="flute-glint" x="62" y="134" width="5" height="170" rx="2.5" fill="url(#fluteGlint)"/></g>
              </g>

              <!-- CROWN spark + ping ring at the rim -->
              <g class="flute-crown" transform="translate(106 108)">
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
    const Y_RIM  = 126;
    const Y_BASE = 350;
    const SPAN   = Y_BASE - Y_RIM;        // 224
    const X_L = 55, X_R = 157, X_MID = 106;

    const prefersReduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Champagne beads: 3 nucleation columns, <=20 circles total ──
    const BEAD_COLS = [80, 106, 132];
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
          <div class="entry-brand"><img src="assets/logo.jpg" alt="SalesHubNepal" class="brand-logo"></div>
          <div class="restricted-emoji" aria-hidden="true">✦</div>
          <h1 class="entry-title"><span class="serif">Come back</span><br>when you're 18.</h1>
          <p class="entry-copy">SalesHubNepal is a wholesale beverage distributor — and Nepal asks us to keep this side of the door for adults only. We'll keep the kettle on for you.</p>
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
