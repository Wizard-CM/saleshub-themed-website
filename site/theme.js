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
