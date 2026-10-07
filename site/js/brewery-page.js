// SalesHub.Nepal — Brewery page modal logic.
// Each .brew-card has data-* attributes that populate the modal on click.

(function(){
  const modal = document.getElementById('productModal');
  if (!modal) return;
  const els = {
    img:   modal.querySelector('.modal-left'),
    tag:   modal.querySelector('.m-tag'),
    stamp: modal.querySelector('.m-stamp'),
    cat:   modal.querySelector('.m-cat .text'),
    name:  modal.querySelector('.m-name'),
    line:  modal.querySelector('.m-line'),
    // spec cells are labelled Category / Format / Origin in the markup
    category: modal.querySelector('[data-spec="abv"]'),
    fmt:      modal.querySelector('[data-spec="format"]'),
    origin:   modal.querySelector('[data-spec="year"]'),
    notes: modal.querySelector('.m-notes'),
    tags:  modal.querySelector('.m-tags'),
    quoteBox: modal.querySelector('.m-quote'),
    quote: modal.querySelector('.m-quote .q-text'),
    author:modal.querySelector('.m-quote .author'),
  };

  function open(card){
    const d = card.dataset;
    if (els.img){
      els.img.style.setProperty('--m-img', `url('${d.image||''}')`);
      els.img.classList.toggle('no-img', !d.image);   // striped placeholder when no image yet
    }
    if (els.tag)   els.tag.textContent = (d.tag || d.cat || 'PRODUCT');
    if (els.stamp){
      els.stamp.innerHTML = (d.stamp || d.category || '★') + (d.stampSmall ? '<span class="small">' + d.stampSmall + '</span>' : '');
    }
    if (els.cat)   els.cat.textContent = d.cat || '';
    if (els.name)  els.name.innerHTML = (d.name || '') + (d.dot ? '<span class="acc">' + d.dot + '</span>' : '');
    if (els.line)  els.line.textContent = d.line || '';
    if (els.category) els.category.textContent = d.category || '—';
    if (els.fmt)      els.fmt.textContent = d.format || '—';
    if (els.origin)   els.origin.textContent = d.origin || '—';
    if (els.notes) els.notes.textContent = d.notes || '';
    if (els.tags){
      els.tags.innerHTML = '';
      (d.tags || '').split(',').filter(Boolean).forEach(t => {
        const s = document.createElement('span');
        s.textContent = t.trim();
        els.tags.appendChild(s);
      });
    }
    // quote block is optional — hide it entirely when a product has no quote
    if (els.quoteBox) els.quoteBox.style.display = d.quote ? '' : 'none';
    if (els.quote) els.quote.textContent = d.quote || '';
    if (els.author)els.author.textContent = d.quoteAuthor || '';
    modal.classList.add('open');
    document.body.classList.add('modal-open');
  }

  function close(){
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  document.querySelectorAll('.brew-card').forEach(card => {
    card.addEventListener('click', () => open(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        open(card);
      }
    });
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
    if (!card.hasAttribute('role')) card.setAttribute('role', 'button');
  });
  modal.addEventListener('click', (e) => { if (e.target === modal) close() });
  modal.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
})();

// ─── split headings into words (mask rise, see [data-split] CSS) ───
(function(){
  document.querySelectorAll('[data-split]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((word, i) => `<span class="word"><span style="--i:${i}">${word}</span></span>`)
      .join(' ');
  });
})();

// ─── scroll-triggered reveal system ─────────────────────────
(function(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const els = document.querySelectorAll('.s-reveal');
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
