/* SalesHubNepal home: the visit section's open / closed chip (Kathmandu time).
   No scroll-linked effects here: they were the main cause of scroll jank. */
(function () {
  'use strict';
  function kathmandu() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kathmandu', weekday: 'short', hour: 'numeric', hour12: false
      }).formatToParts(new Date());
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: days[o.weekday], hour: parseInt(o.hour, 10) % 24 };
    } catch (e) { return null; }
  }
  function updateStatus() {
    var chip = document.querySelector('[data-status]');
    var text = chip && chip.querySelector('[data-status-text]');
    if (!chip || !text) return;
    var t = kathmandu();
    if (!t || isNaN(t.day)) return;
    var open = t.day >= 1 && t.day <= 6 && t.hour >= 9 && t.hour < 18;
    if (open) text.textContent = 'Open now, until 18:00';
    else if (t.day === 0 || (t.day === 6 && t.hour >= 18)) text.textContent = 'Closed now, opens Monday 09:00';
    else text.textContent = 'Closed now, opens 09:00';
    chip.setAttribute('data-state', open ? 'open' : 'closed');
  }
  updateStatus();
  setInterval(updateStatus, 60000);
})();
