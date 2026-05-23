/* ============================================
   FRIDGELO — Landing Page Script
   ============================================ */

(() => {
  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------- Hero load sequence --------
     Timeline (ms after window load):
       0      fridge floats up (CSS keyframe)
       600    phone screen fades in
       800    ELO counter counts up to 1,847
       2200   doors swing open (1.0s) + phone fades after rotation
       2900   hero text emerges inside the fridge
       3400   nav fades in
  */
  const fridge = document.getElementById('fridge');
  const nav = document.querySelector('.nav');
  const phoneNumber = document.querySelector('.phone-number');

  const timers = [];
  const at = (ms, fn) => timers.push(window.setTimeout(fn, ms));

  function countUp(el, target, duration = 1400) {
    if (!el) return;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * ease(t)).toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function snapToFinalState() {
    timers.forEach(clearTimeout);
    fridge?.classList.add('opened');
    nav?.classList.add('ready');
    if (phoneNumber) phoneNumber.textContent = '1,847';
  }

  function runIntro() {
    // 0.8s — counter starts ticking up to 1,847
    at(800, () => {
      const target = Number(phoneNumber?.dataset.target) || 1847;
      countUp(phoneNumber, target);
    });

    // 2.2s — doors swing open (gives a beat to read the ELO screen first)
    at(2200, () => fridge?.classList.add('opened'));

    // 3.4s — nav fades in (matches hero text fade-in)
    at(3400, () => nav?.classList.add('ready'));
  }

  window.addEventListener('load', () => {
    if (prefersReducedMotion) {
      snapToFinalState();
      return;
    }
    runIntro();
  });

  /* -------- Click anywhere during intro to skip -------- */
  function setupSkip() {
    const handler = () => {
      if (fridge?.classList.contains('opened')) return;
      snapToFinalState();
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
    };
    document.addEventListener('click', handler);
    document.addEventListener('keydown', handler);
  }
  setupSkip();

  /* -------- Scroll-triggered reveal -------- */
  const revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.dataset.delay) || 0;
          window.setTimeout(() => el.classList.add('in-view'), delay);
          io.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealItems.forEach((el) => io.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('in-view'));
  }

  /* -------- Waitlist form -------- */
  const form = document.getElementById('waitlistForm');
  const note = document.getElementById('formNote');
  const defaultNote = note?.textContent || '';

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const value = (input?.value || '').trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (!valid) {
      note.textContent = 'Please enter a valid email address.';
      note.className = 'form-note error';
      input?.focus();
      return;
    }

    note.textContent = "You're on the list. We'll be in touch.";
    note.className = 'form-note success';
    form.reset();

    window.setTimeout(() => {
      note.textContent = defaultNote;
      note.className = 'form-note';
    }, 5000);
  });

  /* -------- Subtle parallax on background blobs -------- */
  const hero = document.querySelector('.hero');
  const blobs = document.querySelectorAll('.bg-blob');

  if (hero && blobs.length && !prefersReducedMotion) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      blobs.forEach((blob, i) => {
        const mult = (i + 1) * 14;
        const dir = i % 2 === 0 ? 1 : -1;
        blob.style.translate = `${x * mult * dir}px ${y * mult * dir}px`;
      });
    });
  }
})();
