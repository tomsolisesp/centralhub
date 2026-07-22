/* ============================================================
   Centriconic · interacciones
   Vanilla JS, sin dependencias. Todo degrada con gracia.
   ============================================================ */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ── año ─────────────────────────────────────────────── */
  $('#year').textContent = new Date().getFullYear();

  /* ── nav ─────────────────────────────────────────────── */
  const nav = $('#nav'), links = $('.nav-links'), toggle = $('.nav-toggle');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ── reveal on scroll ────────────────────────────────── */
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const d = +(en.target.dataset.delay || 0);
      setTimeout(() => en.target.classList.add('in'), d);
      obs.unobserve(en.target);
    });
  }, { threshold: .14, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ── contadores del hero ─────────────────────────────── */
  const counters = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, target = +el.dataset.count, suffix = el.dataset.suffix || '';
      if (reduced) { el.textContent = target + suffix; obs.unobserve(el); return; }
      const t0 = performance.now(), dur = 1100;
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(el => counters.observe(el));

  /* ── glow que sigue al cursor en las cards ───────────── */
  $$('.card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ── demo de conversación ────────────────────────────── */
  const chat = $('#chat');
  const script = [
    { who: 'them', text: 'Hola, vi el modelo X en vuestra web. ¿Lo tenéis en azul, talla 42?' },
    { who: 'me',   text: 'Hola Marta 👋 Sí: quedan 3 unidades en azul, talla 42. Te las reservo 30 min.' },
    { who: 'them', text: '¿Cuánto tardaría en llegar a Valencia?' },
    { who: 'me',   text: '24-48 h laborables. Si lo confirmas antes de las 17:00, sale hoy mismo.' },
    { who: 'them', text: 'Vale, me lo llevo.' },
    { who: 'me',   text: 'Perfecto. Aquí tienes tu link de pago seguro 🔗 — y te añado el kit de cuidado con un 15% por ser compra combinada.' },
    { who: 'them', text: '¡Añádelo! 🙌' }
  ];

  const bubble = (who, text) => {
    const el = document.createElement('div');
    el.className = `msg ${who}`;
    el.textContent = text;
    chat.appendChild(el);
    return el;
  };
  const typing = () => {
    const el = document.createElement('div');
    el.className = 'msg them typing';
    el.innerHTML = '<i></i><i></i><i></i>';
    chat.appendChild(el);
    return el;
  };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const trim = () => { while (chat.children.length > 5) chat.firstElementChild.remove(); };

  async function runChat() {
    if (reduced) { script.slice(0, 4).forEach(m => bubble(m.who, m.text)); return; }
    for (;;) {
      chat.innerHTML = '';
      for (const m of script) {
        const t = typing(); trim();
        await wait(m.who === 'me' ? 900 : 650);
        t.remove();
        bubble(m.who, m.text); trim();
        await wait(Math.min(1000 + m.text.length * 26, 2600));
      }
      await wait(2600);
    }
  }
  // Solo anima cuando el teléfono está a la vista.
  const chatIO = new IntersectionObserver(([en], obs) => {
    if (en.isIntersecting) { runChat(); obs.disconnect(); }
  }, { threshold: .3 });
  chatIO.observe(chat);

  /* ── malla animada de fondo ──────────────────────────── */
  const cv = $('#mesh'), ctx = cv.getContext('2d');
  let nodes = [], w = 0, h = 0, raf = 0;
  const pointer = { x: -999, y: -999 };

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = cv.width  = innerWidth  * dpr;
    h = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + 'px';
    cv.style.height = innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(innerWidth * innerHeight / 22000, 90));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - .5) * .28,
      vy: (Math.random() - .5) * .28
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > innerWidth)  n.vx *= -1;
      if (n.y < 0 || n.y > innerHeight) n.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const dpx = a.x - pointer.x, dpy = a.y - pointer.y;
      const near = dpx * dpx + dpy * dpy < 26000;
      ctx.beginPath();
      ctx.arc(a.x, a.y, near ? 2.1 : 1.3, 0, Math.PI * 2);
      ctx.fillStyle = near ? 'rgba(0,229,196,.85)' : 'rgba(120,140,180,.42)';
      ctx.fill();

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 20000) continue;
        const alpha = (1 - d2 / 20000) * .3;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(0,229,196,${alpha})`;
        ctx.lineWidth = .6;
        ctx.stroke();
      }
    }
    raf = requestAnimationFrame(frame);
  }

  if (!reduced) {
    resize();
    addEventListener('resize', resize);
    addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
    // Pausa el canvas cuando la pestaña no está visible.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(frame);
    });
    raf = requestAnimationFrame(frame);
  } else {
    cv.style.display = 'none';
  }

  /* ── formulario ──────────────────────────────────────── */
  const form = $('#form'), msg = $('#formMsg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('input[required], textarea[required]', form).forEach(i => {
      const bad = !i.value.trim() || (i.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value));
      i.closest('.field').classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) {
      msg.textContent = 'Revisa los campos marcados.';
      msg.classList.add('err');
      return;
    }
    msg.classList.remove('err');
    msg.textContent = 'Recibido. Te escribimos en menos de 24 h.';
    form.reset();
    // TODO: conectar a un endpoint real (Formspree, API propia o webhook de WhatsApp).
  });
  $$('input, textarea', form).forEach(i =>
    i.addEventListener('input', () => i.closest('.field').classList.remove('invalid'))
  );
})();
