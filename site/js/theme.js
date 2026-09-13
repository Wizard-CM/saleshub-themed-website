// SalesHub.Nepal — theme toggle (dark / light)
// Pair with theme.css.
//
// FOUC prevention: inline this snippet in <head> as the very first
// script on every page, BEFORE the page's own stylesheet:
//
// <script>
//   (function(){
//     var k = 'saleshub-theme';
//     var t = localStorage.getItem(k);
//     if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
//     document.documentElement.setAttribute('data-theme', t);
//   })();
// </script>

(function(){
  const KEY = 'saleshub-theme';

  function apply(theme){
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  function toggle(){
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    apply(cur === 'dark' ? 'light' : 'dark');
  }

  // Wire up toggle buttons
  function attach(){
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      if (btn.dataset.themeWired) return;
      btn.dataset.themeWired = '1';
      btn.addEventListener('click', toggle);
    });
    // Sync aria state on load
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    apply(cur);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }

  // Respect OS-level changes if the user hasn't explicitly chosen
  try {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', (e) => {
      if (!localStorage.getItem(KEY)){
        apply(e.matches ? 'dark' : 'light');
      }
    });
  } catch(e){}
})();

// SalesHub.Nepal — mobile nav drawer (site-wide, shared)
(function(){
  function wire(){
    const drawer  = document.getElementById('mobileDrawer');
    const menuBtn = document.querySelector('.nav .menu-btn');
    if (!drawer || !menuBtn || drawer.dataset.navWired) return;
    drawer.dataset.navWired = '1';

    function open(){
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('drawer-open');
    }
    function close(){
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('drawer-open');
    }

    menuBtn.addEventListener('click', () => {
      drawer.classList.contains('open') ? close() : open();
    });
    // backdrop, close button, CTA and every link dismiss the drawer
    drawer.querySelectorAll('[data-close], .drawer-links a').forEach(el => {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) close();
    });
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
