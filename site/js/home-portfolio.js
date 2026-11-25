/* Reveal the partner cards on entry, then scale the frame with scroll position. */
(function () {
  'use strict';

  const stage = document.querySelector('.portfolio__stage');
  if (!stage || !window.IntersectionObserver || !window.ResizeObserver) return;

  const frame = stage.querySelector('.portfolio__frame');
  const viewport = stage.querySelector('.portfolio__viewport');
  const cards = [...stage.querySelectorAll('.portfolio__tile')];
  const intro = stage.querySelector('.portfolio__intro');
  const digits = stage.querySelector('.portfolio__digits');
  const controls = stage.querySelector('.portfolio__controls');
  const steps = [...controls.querySelectorAll('[data-portfolio-step]')];
  const motion = window.salesHubPortfolioMotion;
  const clamp = value => Math.min(1, Math.max(0, value));
  const easeOut = value => 1 - (1 - value) ** 3;

  const wheels = [100, 10, 1].map(unit => {
    const column = document.createElement('span');
    const wheel = document.createElement('span');
    for (let index = 0; index <= 10; index++) {
      const digit = document.createElement('span');
      digit.textContent = index % 10;
      wheel.append(digit);
    }
    column.append(wheel);
    digits.append(column);
    return { unit, wheel };
  });

  let intersection = 0;
  let played = false;
  let counterFrame = 0;
  let zoomFrame = 0;
  let lastZoom;
  let pointer;
  let dragged = false;

  function finishIntro() {
    cancelAnimationFrame(counterFrame);
    counterFrame = 0;
    intro.hidden = true;
    frame.classList.remove('is-introducing');
  }

  function play() {
    played = true;
    frame.classList.add('is-introducing');
    viewport.scrollLeft = 0;
    intro.hidden = false;

    const start = performance.now();
    function draw(now) {
      const progress = clamp((now - start) / 1050);
      const count = 100 * easeOut(progress);
      wheels.forEach(({ unit, wheel }) => {
        const carry = Math.max(0, count % unit - (unit - 1));
        const digit = Math.floor(count / unit) % 10 + carry;
        wheel.style.transform = `translateY(${-digit}em)`;
      });
      counterFrame = progress < 1 ? requestAnimationFrame(draw) : 0;
    }
    draw(start);
  }

  function queueZoom() {
    if (zoomFrame || !intersection || motion.matches) return;
    zoomFrame = requestAnimationFrame(() => {
      zoomFrame = 0;
      if (!intersection) return;
      const viewportHeight = document.documentElement.clientHeight;
      const { top, height } = stage.getBoundingClientRect();
      const distance = Math.abs(top + height / 2 - viewportHeight / 2);
      const edgeDistance = (viewportHeight + height) / 2;
      const progress = clamp((edgeDistance - distance) / (edgeDistance - viewportHeight * .14));
      const zoom = (.90 + .15 * progress).toFixed(4);
      if (zoom === lastZoom) return;
      frame.style.setProperty('--portfolio-zoom', zoom);
      lastZoom = zoom;
    });
  }

  function syncControls() {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const canBrowse = maxScroll > 2;
    const atStart = viewport.scrollLeft <= 2;
    const atEnd = viewport.scrollLeft >= maxScroll - 2;
    steps.forEach((step, index) => {
      step.hidden = !canBrowse;
      step.setAttribute('aria-disabled', String(index === 0 ? atStart : atEnd));
    });
    controls.hidden = !canBrowse;
    frame.classList.toggle('has-controls', canBrowse);
  }

  steps.forEach(step => {
    step.addEventListener('click', () => {
      if (step.getAttribute('aria-disabled') === 'true') return;
      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      const positions = cards.map(card =>
        Math.max(0, Math.min(maxScroll, card.offsetLeft + (card.offsetWidth - viewport.clientWidth) / 2))
      );
      const forward = Number(step.dataset.portfolioStep) > 0;
      const current = viewport.scrollLeft;
      if (!forward) positions.reverse();
      const destination = positions.find(left => forward ? left > current + 2 : left < current - 2);
      if (destination === undefined) return;
      viewport.scrollTo({ left: destination, behavior: motion.matches ? 'auto' : 'smooth' });
    });
  });

  cards[cards.length - 1].addEventListener('animationend', event => {
    if (event.animationName === 'portfolio-card-rise') finishIntro();
  });
  viewport.addEventListener('focusin', event => {
    if (frame.classList.contains('is-introducing') && event.target.matches(':focus-visible')) finishIntro();
  });
  viewport.addEventListener('scroll', syncControls, { passive: true });

  // Touch devices use the scroll container's native swipe and snap behavior.
  viewport.addEventListener('pointerdown', event => {
    dragged = false;
    if (event.pointerType !== 'mouse' || event.button !== 0 || steps[0].hidden) return;
    pointer = { id: event.pointerId, x: event.clientX, left: viewport.scrollLeft };
  });
  viewport.addEventListener('pointermove', event => {
    if (event.pointerId !== pointer?.id) return;
    const delta = event.clientX - pointer.x;
    if (!dragged) {
      if (Math.abs(delta) < 6) return;
      dragged = true;
      viewport.setPointerCapture(pointer.id);
      viewport.classList.add('is-dragging');
    }
    viewport.scrollLeft = pointer.left - delta;
  });

  function release(event) {
    if (event.pointerId !== pointer?.id) return;
    pointer = undefined;
    viewport.classList.remove('is-dragging');
  }

  viewport.addEventListener('pointerup', release);
  viewport.addEventListener('pointercancel', release);
  viewport.addEventListener('lostpointercapture', release);
  viewport.addEventListener('pointerleave', event => {
    if (!dragged) release(event);
  });
  viewport.addEventListener('click', event => {
    if (dragged && event.detail) event.preventDefault();
    dragged = false;
  }, true);

  function playOnEntry() {
    if (played || motion.matches || intersection < .26) return;
    if (viewport.contains(document.activeElement)) {
      played = true;
      return;
    }
    play();
  }

  new IntersectionObserver(([entry]) => {
    intersection = entry.intersectionRatio;
    if (intersection === 0) {
      played = false;
      finishIntro();
      return;
    }
    queueZoom();
    playOnEntry();
  }, { threshold: [0, .26] }).observe(stage);

  window.addEventListener('scroll', queueZoom, { passive: true });
  window.addEventListener('resize', queueZoom);
  new ResizeObserver(() => {
    syncControls();
    queueZoom();
  }).observe(stage);
  motion.addEventListener('change', () => {
    if (motion.matches) {
      finishIntro();
      cancelAnimationFrame(zoomFrame);
      zoomFrame = 0;
      lastZoom = undefined;
      frame.style.removeProperty('--portfolio-zoom');
    } else {
      queueZoom();
      playOnEntry();
    }
  });
})();
