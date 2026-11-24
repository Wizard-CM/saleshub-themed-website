/* SalesHubNepal home: the portfolio's one-time "defrost" entrance.
   The roster slider is pure CSS and needs no script. */
(function () {
  'use strict';
  var doors = document.querySelector('.portfolio__doors');
  if (!doors || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('defrost-ready');
  var io = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    doors.classList.add('is-in');
    io.disconnect();
  }, { rootMargin: '0px 0px -15% 0px' });
  io.observe(doors);
})();
