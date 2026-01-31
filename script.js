// Só roda no desktop (mouse/trackpad + largura mínima)
const DESKTOP_ONLY = window.matchMedia("(hover:hover) and (pointer:fine) and (min-width: 760px)").matches;

/* =============================
   1) TRACKING DE CLIQUES (SÓ DESKTOP)
============================= */
(function trackClicks(){
  if (!DESKTOP_ONLY) return;

  const selectors = [
    'a.cta-neon-button',
    'a.contact-icon',
    'a.contact-link',
    '.product-card'
  ];

  const els = document.querySelectorAll(selectors.join(','));
  if (!els.length) return;

  const getPageName = () => {
    const path = (location.pathname || '').split('/').pop() || 'index.html';
    return path.replace('.html','');
  };

  const bump = (key) => {
    const k = `site_click_${key}`;
    const n = Number(localStorage.getItem(k) || 0) + 1;
    localStorage.setItem(k, String(n));
    return n;
  };

  const describe = (el) => {
    if (el.classList.contains('product-card')) {
      const service =
        el.classList.contains('nutreiner') ? 'nutreiner' :
        el.classList.contains('consultoria-online') ? 'consultoria-online' :
        el.classList.contains('consultoria-presencial') ? 'consultoria-presencial' :
        el.classList.contains('personal-trainer') ? 'personal-trainer' :
        'card';
      return `card_${service}`;
    }

    if (el.matches('a.cta-neon-button') && (el.href || '').includes('wa.me')) {
      return `whatsapp_${getPageName()}`;
    }

    if ((el.href || '').includes('instagram.com')) return `instagram_${getPageName()}`;
    if ((el.href || '').startsWith('mailto:')) return `email_${getPageName()}`;

    return `click_${getPageName()}`;
  };

  els.forEach(el => {
    el.addEventListener('click', () => {
      const key = describe(el);
      const total = bump(key);
      console.log(`[TRACK] ${key} -> ${total}`);
    });
  });
})();


/* =============================
   2) WHATSAPP FLUTUANTE (SÓ DESKTOP)
   - Mobile fica só com o CTA principal
============================= */
(function floatingWhatsApp(){
  if (!DESKTOP_ONLY) return;

  const mainCta = document.querySelector('a.cta-neon-button[href*="wa.me"]');
  if (!mainCta) return;

  const btn = document.createElement('a');
  btn.className = 'wa-float';
  btn.href = mainCta.href;
  btn.target = '_blank';
  btn.rel = 'noopener';
  btn.setAttribute('aria-label', 'Falar no WhatsApp');

  btn.innerHTML = `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M19.11 17.44c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.13-.41-2.15-1.31-.79-.7-1.33-1.57-1.49-1.84-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.48-.84-2.03-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.34.98 2.64 1.12 2.82.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.82-1.27.22-.62.22-1.15.16-1.27-.06-.12-.25-.2-.52-.34zM16 3C8.83 3 3 8.83 3 16c0 2.31.61 4.48 1.68 6.36L3 29l6.82-1.6A12.93 12.93 0 0 0 16 29c7.17 0 13-5.83 13-13S23.17 3 16 3zm0 23.7c-2.04 0-3.92-.6-5.5-1.63l-.39-.25-4.04.95.99-3.94-.26-.4A10.67 10.67 0 0 1 5.3 16C5.3 10.1 10.1 5.3 16 5.3S26.7 10.1 26.7 16 21.9 26.7 16 26.7z"/>
    </svg>
  `;

  document.body.appendChild(btn);

  const show = () => btn.classList.add('show');
  const hide = () => btn.classList.remove('show');

  // aparece após 30% de scroll ou 6s
  const timer = setTimeout(show, 6000);

  const onScroll = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    if (scrollable <= 0) return;

    const progress = (doc.scrollTop || window.scrollY) / scrollable;
    if (progress >= 0.30) {
      show();
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // some no topo
  window.addEventListener('scroll', () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (y < 80) hide();
  }, { passive: true });
})();


/* =============================
   3) ACCORDION NOS PASSOS (SÓ DESKTOP)
   - Mobile fica aberto normal (sem accordion)
============================= */
(function timelineAccordion(){
  if (!DESKTOP_ONLY) return;

  const steps = document.querySelectorAll('.tech-step');
  if (!steps.length) return;

  steps.forEach((step, idx) => {
    const body = step.querySelector('.step-body');
    if (!body) return;

    const title = body.querySelector('h3');
    if (!title) return;

    if (body.querySelector('.step-details')) return;

    const details = document.createElement('div');
    details.className = 'step-details';

    const nodesToMove = [];
    body.childNodes.forEach(n => {
      if (n.nodeType === 1 && n.tagName.toLowerCase() === 'h3') return;
      if (n.nodeType === 3 && !n.textContent.trim()) return;
      nodesToMove.push(n);
    });
    nodesToMove.forEach(n => details.appendChild(n));
    body.appendChild(details);

    const open = idx === 0;
    step.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  const closeAll = (except) => {
    steps.forEach(s => {
      if (s === except) return;
      s.setAttribute('aria-expanded', 'false');
    });
  };

  steps.forEach(step => {
    step.addEventListener('click', (e) => {
      const isLink = e.target.closest('a');
      if (isLink) return;

      const expanded = step.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        step.setAttribute('aria-expanded', 'false');
      } else {
        closeAll(step);
        step.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();
