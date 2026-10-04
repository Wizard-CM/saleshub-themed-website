// — form submission → relayed to sales.hub.nepal@gmail.com via Web3Forms
  const WEB3FORMS_URL = 'https://api.web3forms.com/submit';
  const WEB3FORMS_ACCESS_KEY = 'a2ac5705-14ed-4a71-820c-3e79a6e5d2f1';
  const form = document.getElementById('contactForm');
  const formView = document.getElementById('formView');
  const successView = document.getElementById('successView');
  const errorEl = document.getElementById('formError');
  const submitBtn = form.querySelector('.btn-submit');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function flagField(sel){
    const el = form.querySelector(sel);
    el.style.borderColor = 'var(--coral)';
    el.focus();
    setTimeout(() => { el.style.borderColor = '' }, 1800);
  }
  function showError(text){
    errorEl.textContent = text;
    errorEl.style.display = 'block';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    const email = form.querySelector('#f-from').value.trim();
    const msg = form.querySelector('#f-msg').value.trim();

    if (!EMAIL_RE.test(email)){
      showError('Please enter a valid email address.');
      flagField('#f-from');
      return;
    }
    if (msg.length < 10){
      showError('Your message needs at least 10 characters.');
      flagField('#f-msg');
      return;
    }

    const btnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    try {
      const res = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          email: email,
          message: msg,
          subject: 'New enquiry — saleshubnepal.com contact form'
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) === 'false') throw new Error(data.message || 'send failed');
      formView.style.display = 'none';
      successView.classList.add('show');
      successView.scrollIntoView({ behavior:'smooth', block:'center' });
    } catch (err){
      showError("Couldn't send right now — please try again in a minute, or email us directly at sales.hub.nepal@gmail.com.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = btnHTML;
    }
  });
  document.getElementById('resetForm').addEventListener('click', (e) => {
    e.preventDefault();
    form.reset();
    successView.classList.remove('show');
    formView.style.display = 'block';
    formView.scrollIntoView({ behavior:'smooth', block:'center' });
  });

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

  // ─── form field focus micro-interaction ────────────────────
  (function(){
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.field input, .field textarea').forEach(el => {
      el.addEventListener('focus', () => {
        el.style.transform = 'scale(1.01)';
      });
      el.addEventListener('blur', () => {
        el.style.transform = '';
      });
    });
  })();
