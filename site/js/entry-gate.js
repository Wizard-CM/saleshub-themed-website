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
        <div class="entry-card age-card">
          <img src="assets/logo.jpg" alt="" class="age-logo">
          <p class="age-brand">SalesHubNepal</p>
          <h1 class="age-title" id="entryTitle">Are you 18 or older?</h1>
          <p class="age-copy">SalesHubNepal distributes beer, spirits and wine. You must be of legal drinking age to enter this site.</p>
          <div class="age-actions">
            <button class="entry-btn ghost entry-no" type="button">No, I'm not</button>
            <button class="entry-btn entry-yes" type="button">Yes, I'm 18+</button>
          </div>
          <p class="age-foot">By entering, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>. Please drink responsibly.</p>
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

  }

  function renderPreloader(){
    const overlay = buildEl(`
      <div class="entry-overlay entry-pre" data-stage="pre" aria-hidden="true">
        <div class="pre-layout">
        <div class="pre-brand"><img src="assets/logo.jpg" alt="" class="brand-logo">SalesHubNepal</div>

        <div class="pre-content">
          <div class="pint-stage" aria-hidden="true">
            <svg class="pint-svg" viewBox="0 0 240 420" width="200" height="350" preserveAspectRatio="xMidYMid meet" role="img" aria-hidden="true">
              <defs>
                <linearGradient id="pintBeer" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%"  stop-color="#D93A18"/>
                  <stop offset="55%" stop-color="#FF5C3A"/>
                  <stop offset="100%" stop-color="#FF8A5C"/>
                </linearGradient>
                <!-- darker edges give the liquid a round, filled-glass volume -->
                <linearGradient id="pintBeerShade" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stop-color="rgba(90,20,5,.32)"/>
                  <stop offset="22%"  stop-color="rgba(90,20,5,0)"/>
                  <stop offset="62%"  stop-color="rgba(255,220,180,.10)"/>
                  <stop offset="80%"  stop-color="rgba(90,20,5,0)"/>
                  <stop offset="100%" stop-color="rgba(90,20,5,.28)"/>
                </linearGradient>
                <linearGradient id="pintStream" gradientUnits="userSpaceOnUse" x1="0" y1="14" x2="0" y2="290">
                  <stop offset="0%"  stop-color="#FF8A5C"/>
                  <stop offset="100%" stop-color="#FF6B47"/>
                </linearGradient>
                <!-- amber bottle glass: dark edges, warm centre -->
                <linearGradient id="bottleGlass" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stop-color="#3E1A08"/>
                  <stop offset="35%"  stop-color="#8A4520"/>
                  <stop offset="60%"  stop-color="#6B3214"/>
                  <stop offset="100%" stop-color="#2E1205"/>
                </linearGradient>
                <linearGradient id="pintFoam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stop-color="#FFF8EC"/>
                  <stop offset="70%" stop-color="#FFF3D9"/>
                  <stop offset="100%" stop-color="#E9D9B1"/>
                </linearGradient>
                <linearGradient id="pintWall" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stop-color="rgba(107,70,50,.20)"/>
                  <stop offset="8%"   stop-color="rgba(107,70,50,.07)"/>
                  <stop offset="50%"  stop-color="rgba(107,70,50,.02)"/>
                  <stop offset="92%"  stop-color="rgba(107,70,50,.07)"/>
                  <stop offset="100%" stop-color="rgba(107,70,50,.20)"/>
                </linearGradient>
                <linearGradient id="pintWallDark" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stop-color="rgba(244,239,227,.22)"/>
                  <stop offset="8%"   stop-color="rgba(244,239,227,.08)"/>
                  <stop offset="50%"  stop-color="rgba(244,239,227,.03)"/>
                  <stop offset="92%"  stop-color="rgba(244,239,227,.08)"/>
                  <stop offset="100%" stop-color="rgba(244,239,227,.22)"/>
                </linearGradient>
                <linearGradient id="pintBase" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stop-color="rgba(107,70,50,.10)"/>
                  <stop offset="100%" stop-color="rgba(107,70,50,.26)"/>
                </linearGradient>
                <linearGradient id="pintBaseDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stop-color="rgba(244,239,227,.08)"/>
                  <stop offset="100%" stop-color="rgba(244,239,227,.22)"/>
                </linearGradient>
                <linearGradient id="pintSpecular" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stop-color="rgba(255,255,255,.85)"/>
                  <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
                </linearGradient>
                <radialGradient id="pintBead" cx="38%" cy="34%" r="62%">
                  <stop offset="0%"  stop-color="rgba(255,244,226,.95)"/>
                  <stop offset="55%" stop-color="rgba(255,220,190,.45)"/>
                  <stop offset="100%" stop-color="rgba(255,220,190,0)"/>
                </radialGradient>
                <radialGradient id="pintShadow">
                  <stop offset="0%"  stop-color="rgba(60,25,10,.22)"/>
                  <stop offset="100%" stop-color="rgba(60,25,10,0)"/>
                </radialGradient>
                <linearGradient id="pintGlint" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stop-color="rgba(255,255,255,0)"/>
                  <stop offset="50%"  stop-color="rgba(255,255,255,.7)"/>
                  <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
                </linearGradient>
                <clipPath id="pintBowl">
                  <path d="M66,42 C68,60 74,78 74,95 C74,130 56,160 56,200 C56,246 82,284 108,293 Q120,297 132,293 C158,284 184,246 184,200 C184,160 166,130 166,95 C166,78 172,60 174,42 Z"/>
                </clipPath>
              </defs>

              <!-- soft contact shadow on the table -->
              <ellipse class="pint-shadow" cx="120" cy="378" rx="74" ry="8" fill="url(#pintShadow)"/>

              <!-- GLASS mass: tulip beer glass — flared lip, narrow waist, round
                   belly, solid bowl bottom, short stem, round foot -->
              <path class="pint-body" d="M62,40 C64,60 70,78 70,95 C70,130 52,160 52,200 C52,250 80,290 106,300 Q113,303 113,312 L113,364 L127,364 L127,312 Q127,303 134,300 C160,290 188,250 188,200 C188,160 170,130 170,95 C170,78 176,60 178,40 Z" fill="url(#pintWall)"/>
              <path class="pint-base" d="M108,293 Q120,297 132,293 Q127,303 127,312 L127,364 L113,364 L113,312 Q113,303 108,293 Z" fill="url(#pintBase)"/>
              <ellipse class="pint-base pint-line" cx="120" cy="367" rx="56" ry="8" fill="url(#pintBase)" stroke-opacity=".45" stroke-width="1.2"/>

              <!-- LIQUID + FOAM + BEADS, clipped to the inner bowl -->
              <g clip-path="url(#pintBowl)">
                <path class="pint-liquid" d="" fill="url(#pintBeer)"/>
                <path class="pint-wave wave-b" d="" fill="url(#pintBeer)" opacity=".55"/>
                <path class="pint-wave wave-a" d="" fill="url(#pintBeer)"/>
                <path class="pint-liquid-shade" d="" fill="url(#pintBeerShade)"/>
                <g class="pint-beads"></g>
                <path class="pint-foam" d="" fill="url(#pintFoam)"/>
              </g>

              <!-- the pour: a stream arcing from the bottle mouth into the glass -->
              <path class="pint-stream" d="" fill="none" stroke="url(#pintStream)" stroke-linecap="round"/>

              <!-- BEER BOTTLE: drawn upright with its mouth at 0,0; JS moves and
                   tilts it around the mouth so the stream always starts there -->
              <g class="pour-bottle" opacity="0">
                <path d="M-4.5,3 L-4.5,32 C-4.5,44 -16,50 -16,64 L-16,124 Q-16,130 -10,130 L10,130 Q16,130 16,124 L16,64 C16,50 4.5,44 4.5,32 L4.5,3 Z" fill="url(#bottleGlass)"/>
                <path class="pint-line" d="M-4.5,3 L-4.5,32 C-4.5,44 -16,50 -16,64 L-16,124 Q-16,130 -10,130 L10,130 Q16,130 16,124 L16,64 C16,50 4.5,44 4.5,32 L4.5,3" fill="none" stroke-opacity=".35" stroke-width="1"/>
                <rect x="-5.5" y="-1" width="11" height="5" rx="1.5" fill="#4A200C"/>
                <rect x="-4.5" y="18" width="9" height="10" fill="#FF5C3A"/>
                <rect x="-16" y="78" width="32" height="34" fill="#FFF3D9"/>
                <rect x="-16" y="90" width="32" height="8" fill="#FF5C3A"/>
                <path d="M-11,66 L-11,120" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2.5" stroke-linecap="round"/>
              </g>

              <!-- GLASS edges + highlights drawn OVER the liquid for depth -->
              <g class="pint-walls">
                <path class="pint-line" d="M62,40 C64,60 70,78 70,95 C70,130 52,160 52,200 C52,250 80,290 106,300 Q113,303 113,312 L113,362 M178,40 C176,60 170,78 170,95 C170,130 188,160 188,200 C188,250 160,290 134,300 Q127,303 127,312 L127,362" fill="none" stroke-opacity=".5" stroke-width="1.4" stroke-linejoin="round"/>
                <path class="pint-line" d="M66,42 C68,60 74,78 74,95 C74,130 56,160 56,200 C56,246 82,284 108,293 Q120,297 132,293 C158,284 184,246 184,200 C184,160 166,130 166,95 C166,78 172,60 174,42" fill="none" stroke-opacity=".2" stroke-width="1"/>
                <ellipse class="pint-line" cx="120" cy="40" rx="58" ry="7" fill="none" stroke-opacity=".55" stroke-width="1.4"/>
                <ellipse class="pint-line" cx="120" cy="41.5" rx="54" ry="5.5" fill="none" stroke-opacity=".18" stroke-width="1"/>
                <!-- light caught in the solid stem and on the foot rim -->
                <rect x="117.5" y="306" width="2.5" height="54" rx="1.2" fill="url(#pintSpecular)"/>
                <ellipse cx="120" cy="364" rx="34" ry="2.4" fill="rgba(255,255,255,.55)"/>
                <!-- long curved specular down the left of the belly, short kick on the right -->
                <path d="M72,110 C64,140 58,180 62,220 C64,240 70,256 78,268" fill="none" stroke="url(#pintSpecular)" stroke-width="4.5" stroke-linecap="round"/>
                <path d="M181,160 C184,180 184,200 182,222" fill="none" stroke="url(#pintSpecular)" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>
                <path d="M68,48 C70,60 73,72 74,84" fill="none" stroke="url(#pintSpecular)" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
                <g clip-path="url(#pintBowl)"><rect class="pint-glint" x="62" y="110" width="5" height="170" rx="2.5" fill="url(#pintGlint)"/></g>
              </g>

              <!-- cold-glass condensation, fades in as the glass fills -->
              <g class="pint-drops">
                <ellipse cx="80" cy="140" rx="1.1" ry="1.5"/>
                <ellipse cx="64" cy="190" rx="1.6" ry="2.2"/>
                <ellipse cx="68" cy="236" rx="1.2" ry="1.7"/>
                <ellipse cx="90" cy="270" rx="1.4" ry="1.9"/>
                <ellipse cx="164" cy="120" rx="1.1" ry="1.5"/>
                <ellipse cx="150" cy="150" rx="1" ry="1.4"/>
                <ellipse cx="176" cy="180" rx="1.5" ry="2.1"/>
                <ellipse cx="172" cy="232" rx="1.2" ry="1.7"/>
                <ellipse cx="158" cy="268" rx="1.6" ry="2.2"/>
              </g>
            </svg>
          </div>
        </div>

        <div class="pre-labels">
          <p class="pre-labels-title">Our products</p>
          <ol class="pre-label-list">
            <li class="pre-label"><span class="pre-label-num">01</span><span class="pre-label-name">Gorkha</span><span class="pre-label-type">Beer</span></li>
            <li class="pre-label"><span class="pre-label-num">02</span><span class="pre-label-name">Carlsberg</span><span class="pre-label-type">Beer</span></li>
            <li class="pre-label"><span class="pre-label-num">03</span><span class="pre-label-name">Tuborg</span><span class="pre-label-type">Beer</span></li>
            <li class="pre-label"><span class="pre-label-num">04</span><span class="pre-label-name">Prime International</span><span class="pre-label-type">Spirits</span></li>
            <li class="pre-label"><span class="pre-label-num">05</span><span class="pre-label-name">Big Master</span><span class="pre-label-type">Wine</span></li>
            <li class="pre-label"><span class="pre-label-num">06</span><span class="pre-label-name">Red Bull</span><span class="pre-label-type">Energy</span></li>
          </ol>
        </div>
        </div>
      </div>
    `);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    const liquidEl  = overlay.querySelector('.pint-liquid');
    const shadeEl   = overlay.querySelector('.pint-liquid-shade');
    const waveAEl   = overlay.querySelector('.wave-a');
    const waveBEl   = overlay.querySelector('.wave-b');
    const foamEl    = overlay.querySelector('.pint-foam');
    const streamEl  = overlay.querySelector('.pint-stream');
    const bottleEl  = overlay.querySelector('.pour-bottle');
    const beadsG    = overlay.querySelector('.pint-beads');
    const labelEls  = overlay.querySelectorAll('.pre-label');

    // Labels before activeIndex are "done", the one at activeIndex is coral.
    // Passing labelEls.length marks every label done.
    function highlightLabel(activeIndex){
      labelEls.forEach((labelEl, i) => {
        labelEl.classList.toggle('is-done', i < activeIndex);
        labelEl.classList.toggle('is-active', i === activeIndex);
      });
    }

    // Bowl geometry (SVG user units). The clip path trims everything to the
    // tulip bowl, so shapes only need to span its widest point (the belly).
    //   level 0 -> liquid at Y_BASE (empty), level 1 -> liquid at Y_FULL.
    const Y_FULL = 72;
    const Y_BASE = 296;
    const SPAN   = Y_BASE - Y_FULL;
    const X_L = 50, X_R = 190;
    const FOAM_MAX = 20;              // foam head height when the glass is full
    // The bottle mouth stays fixed here while pouring; the stream bends from
    // it towards the centre of the glass like a real pour.
    const MOUTH_X = 146, MOUTH_Y = 14;
    const BEND_X = 128;
    const STREAM_END_X = 124;
    const BOTTLE_SCALE = 1.35;

    const prefersReduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Carbonation: 3 columns of rising beads, 18 circles total ──
    const BEAD_COLS = [100, 120, 140];
    const beads = [];
    const NS = 'http://www.w3.org/2000/svg';
    BEAD_COLS.forEach((columnX) => {
      for (let i = 0; i < 6; i++){
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('r', '1');
        c.setAttribute('fill', 'url(#pintBead)');
        beadsG.appendChild(c);
        beads.push({
          el: c,
          x: columnX + (Math.random() * 2 - 1) * 4,
          baseX: columnX,
          y: Y_BASE - Math.random() * SPAN,
          speed: 28 + Math.random() * 18,     // units/s
          r0: 0.8 + Math.random() * 1.0,
          phase: Math.random() * Math.PI * 2
        });
      }
    });

    // Points along a gently travelling sine across the bowl width
    function surfacePoints(yTop, phase, amp, dir, steps){
      const pts = [];
      for (let i = 0; i <= steps; i++){
        const fx = i / steps;
        const x = X_L + fx * (X_R - X_L);
        const y = yTop + Math.sin(phase * dir + fx * Math.PI * 2) * amp;
        pts.push([x, y]);
      }
      return pts;
    }
    // Smooth curve through the points (quadratic midpoints), as an open path
    function curveThrough(pts){
      let d = 'M' + pts[0][0].toFixed(2) + ',' + pts[0][1].toFixed(2);
      for (let i = 1; i < pts.length; i++){
        const [x0, y0] = pts[i - 1];
        const [x1, y1] = pts[i];
        d += ' Q' + x0.toFixed(2) + ',' + y0.toFixed(2) + ' ' + ((x0 + x1) / 2).toFixed(2) + ',' + ((y0 + y1) / 2).toFixed(2);
      }
      const last = pts[pts.length - 1];
      return d + ' L' + last[0].toFixed(2) + ',' + last[1].toFixed(2);
    }
    // Wave surface closed down to the bowl base
    function wavePath(yTop, phase, amp, dir){
      return curveThrough(surfacePoints(yTop, phase, amp, dir, 6)) +
        ' L' + X_R + ',' + Y_BASE + ' L' + X_L + ',' + Y_BASE + ' Z';
    }
    // Foam band: a bubbly top edge (two stacked sines) closed just below the beer line
    function foamPath(foamTop, beerTop, phase){
      const top = surfacePoints(foamTop, phase * 0.6, 1.4, 1, 12).map(([x, y], i) =>
        [x, y + Math.sin(i * 2.3 + phase) * 1.1]);
      return curveThrough(top) +
        ' L' + X_R + ',' + (beerTop + 3).toFixed(2) + ' L' + X_L + ',' + (beerTop + 3).toFixed(2) + ' Z';
    }
    // Stream along a curve from the mouth to the surface. fromS/toS (0 → 1)
    // pick which part of the curve is visible, so it can fall in and tail off.
    function streamPath(fromS, toS, endY, phase){
      if (toS <= fromS) return '';
      let d = '';
      for (let i = 0; i <= 8; i++){
        const s = fromS + (toS - fromS) * i / 8;
        const wobble = Math.sin(phase * 3 + s * 6) * 0.6 * s;
        const x = (1 - s) * (1 - s) * MOUTH_X + 2 * s * (1 - s) * BEND_X + s * s * STREAM_END_X + wobble;
        const y = (1 - s) * (1 - s) * MOUTH_Y + 2 * s * (1 - s) * (MOUTH_Y + 4) + s * s * endY;
        d += (i === 0 ? 'M' : ' L') + x.toFixed(2) + ',' + y.toFixed(2);
      }
      return d;
    }
    const easeInOutSine = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
    const easeOutCubic  = (x) => 1 - Math.pow(1 - x, 3);
    const clamp01 = (x) => Math.min(1, Math.max(0, x));

    // Draws liquid + foam for a fill level; returns the y of the beer line and foam top
    function renderLevel(level, phase, ampScale){
      const beerTop = Y_BASE - level * SPAN;
      const foamTop = beerTop - (2 + level * (FOAM_MAX - 2));
      const bodyPath = 'M' + X_L + ',' + Y_BASE + ' L' + X_R + ',' + Y_BASE +
        ' L' + X_R + ',' + (beerTop + 4).toFixed(2) +
        ' L' + X_L + ',' + (beerTop + 4).toFixed(2) + ' Z';
      liquidEl.setAttribute('d', bodyPath);
      shadeEl.setAttribute('d', bodyPath);
      const amp = 2.4 * ampScale;
      waveAEl.setAttribute('d', wavePath(beerTop, phase, amp, 1));
      waveBEl.setAttribute('d', wavePath(beerTop, phase * 1.3 + 1.7, amp * 0.7, -1));
      foamEl.setAttribute('d', level > 0.01 ? foamPath(foamTop, beerTop, phase) : '');
      return { beerTop, foamTop };
    }

    // ── Reduced motion: calm near-final state, then honour the lifecycle ──
    if (prefersReduced){
      const { beerTop } = renderLevel(0.96, 0, 0);
      highlightLabel(labelEls.length);
      overlay.style.setProperty('--t', 1);
      beads.forEach((b, i) => {
        if (i < 6){
          b.el.setAttribute('cx', b.baseX.toFixed(2));
          b.el.setAttribute('cy', (beerTop + 8 + Math.random() * (Y_BASE - beerTop - 12)).toFixed(2));
          b.el.setAttribute('r', b.r0.toFixed(2));
          b.el.setAttribute('opacity', '.7');
        } else {
          b.el.setAttribute('opacity', '0');
        }
      });
      bottleEl.setAttribute('opacity', '0');
      setTimeout(() => {
        overlay.classList.add('leave');
        setTimeout(() => {
          overlay.remove();
          html.removeAttribute('data-gating');
        }, 550);
      }, 700);
      return;
    }

    // ── Animated path: one rAF loop driven by t (0 → 1) ──
    // Timeline: the bottle swings in and tips over (0–12%), the stream falls
    // from its mouth (9–16%), the glass fills under it (13–96%), the stream
    // tails off (84–92%) as the bottle tips back and lifts away (86–96%).
    const DURATION_MS = 3300;
    const FULL_GLASS_HOLD_MS = 500;
    const start = performance.now();
    let last = start;

    function tick(now){
      const t = Math.min(1, (now - start) / DURATION_MS);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      overlay.style.setProperty('--t', t);
      highlightLabel(Math.min(labelEls.length - 1, Math.floor(t * labelEls.length)));

      const level = easeInOutSine(clamp01((t - 0.13) / 0.83));
      const phase = now / 1000 * 2.2;
      const ampScale = (1 - t) * 0.9 + 0.1;   // surface settles as the glass fills
      const { beerTop, foamTop } = renderLevel(level, phase, ampScale);

      // bottle: swings in and tips to pour, tips a little further as it
      // empties, then tips back and lifts away
      const bottleIn  = easeOutCubic(clamp01(t / 0.12));
      const bottleOut = easeInOutSine(clamp01((t - 0.86) / 0.1));
      const bottleAngle = -30 - bottleIn * 88 - clamp01((t - 0.12) / 0.74) * 14 + bottleOut * 92;
      const bottleX = MOUTH_X + (1 - bottleIn) * 60 + bottleOut * 60;
      const bottleY = MOUTH_Y - (1 - bottleIn) * 50 - bottleOut * 60;
      bottleEl.setAttribute('transform', 'translate(' + bottleX.toFixed(2) + ' ' + bottleY.toFixed(2) + ') rotate(' + bottleAngle.toFixed(2) + ') scale(' + BOTTLE_SCALE + ')');
      bottleEl.setAttribute('opacity', (bottleIn * (1 - bottleOut)).toFixed(3));

      // stream: head falls to the surface, tail follows it down at the end
      const streamHead = easeOutCubic(clamp01((t - 0.09) / 0.07));
      const streamTail = easeInOutSine(clamp01((t - 0.84) / 0.08));
      streamEl.setAttribute('d', streamPath(streamTail, streamHead, foamTop + 2, phase));
      streamEl.setAttribute('stroke-width', (3.8 + Math.sin(phase * 3) * 0.4).toFixed(2));

      // beads: rise, grow, fade near floor + beer line, recycle
      const density = 0.35 + level * 0.65;
      for (let i = 0; i < beads.length; i++){
        const b = beads[i];
        b.y -= b.speed * dt;
        if (b.y <= beerTop + 2){
          b.y = Y_BASE - Math.random() * 4;
          b.x = b.baseX + (Math.random() * 2 - 1) * 4;
          b.speed = 28 + Math.random() * 18;
          b.r0 = 0.8 + Math.random() * 1.0;
        }
        if (b.y > Y_BASE - 1 || beerTop >= Y_BASE - 4){
          b.el.setAttribute('opacity', '0');
          continue;
        }
        const climb = (Y_BASE - b.y) / Math.max(6, (Y_BASE - beerTop));
        const fadeIn  = Math.min(1, (Y_BASE - b.y) / 14);
        const fadeOut = Math.min(1, (b.y - beerTop) / 20);
        b.el.setAttribute('cx', (b.x + Math.sin(now / 700 + b.phase) * 0.8).toFixed(2));
        b.el.setAttribute('cy', b.y.toFixed(2));
        b.el.setAttribute('r', (b.r0 + climb * 0.7).toFixed(2));
        b.el.setAttribute('opacity', (clamp01(fadeIn * fadeOut) * density).toFixed(3));
      }

      if (t < 1) requestAnimationFrame(tick);
      else finish();
    }

    function finish(){
      overlay.style.setProperty('--t', 1);
      highlightLabel(labelEls.length);
      renderLevel(1, 0, 0.1);
      streamEl.setAttribute('d', '');
      bottleEl.setAttribute('opacity', '0');
      // hold the full glass a beat before fading out
      setTimeout(() => {
        overlay.classList.add('leave');
        setTimeout(() => {
          overlay.remove();
          html.removeAttribute('data-gating');
        }, 550);
      }, FULL_GLASS_HOLD_MS);
    }

    requestAnimationFrame(tick);
  }

  function renderRestricted(){
    const overlay = buildEl(`
      <div class="entry-overlay entry-restricted" data-stage="restricted" role="dialog" aria-modal="true">
        <div class="entry-bg" aria-hidden="true">
          <div class="entry-grid"></div>
        </div>
        <div class="entry-card">
          <div class="entry-brand"><img src="assets/logo.jpg" alt="SalesHubNepal" class="brand-logo"></div>
          <div class="restricted-emoji" aria-hidden="true">✦</div>
          <h1 class="entry-title"><span class="serif">Come back</span><br>when you're 18</h1>
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
