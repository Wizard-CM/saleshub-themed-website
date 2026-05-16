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
          <div class="entry-brand">SalesHub<span class="dot">.</span>Nepal</div>
          <p class="entry-eyebrow"><span class="dot"></span>Quick question</p>
          <h1 class="entry-title" id="entryTitle">Are you<br><span class="serif">eighteen</span> or older?</h1>
          <p class="entry-copy">SalesHub.Nepal is a wholesale beverage distributor. Please confirm you're of legal drinking age in your jurisdiction before you come in.</p>
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
      <div class="entry-overlay entry-pre" data-stage="pre" aria-hidden="true">
        <div class="entry-bg" aria-hidden="true">
          <div class="entry-orb o1"></div>
          <div class="entry-orb o2"></div>
          <div class="entry-grid"></div>
        </div>
        <div class="pre-content">
          <div class="pre-glass" aria-hidden="true">
            <div class="pre-glass-body">
              <div class="pre-liquid"></div>
              <div class="pre-foam"></div>
            </div>
          </div>
          <div class="pre-brand">SalesHub<span class="dot">.</span>Nepal</div>
          <p class="pre-tag"><span class="cycle">Pouring trust.</span></p>
          <div class="pre-progress"><div class="pre-bar"></div></div>
          <div class="pre-stats">
            <span><i class="d"></i>Cold chain · 2°C</span>
            <span class="pre-count">00</span>
            <span>04 houses · 15 labels</span>
          </div>
        </div>
      </div>
    `);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    const cycleEl = overlay.querySelector('.cycle');
    const countEl = overlay.querySelector('.pre-count');
    const barEl   = overlay.querySelector('.pre-bar');
    const cycles  = ['Pouring trust.', 'Loading 04 houses.', 'Calibrating 2°C.', 'Almost there.'];

    const DUR = 2200;
    const start = performance.now();
    let idx = 0;
    const cycleI = setInterval(() => {
      idx = (idx + 1) % cycles.length;
      cycleEl.style.opacity = 0;
      setTimeout(() => {
        cycleEl.textContent = cycles[idx];
        cycleEl.style.opacity = 1;
      }, 200);
    }, 550);

    function tick(now){
      const t = Math.min(1, (now - start) / DUR);
      barEl.style.width = (t * 100).toFixed(1) + '%';
      countEl.textContent = String(Math.floor(t * 99)).padStart(2, '0');
      if (t < 1) requestAnimationFrame(tick);
      else finish();
    }
    function finish(){
      clearInterval(cycleI);
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
          <div class="entry-brand">SalesHub<span class="dot">.</span>Nepal</div>
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
