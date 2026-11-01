(() => {
  const root = document.documentElement;
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  const allNavLinks = [...document.querySelectorAll('.primary-nav a')];
  const navLinks = allNavLinks.filter((link) => link.getAttribute('href')?.startsWith('#'));
  const sections = [...document.querySelectorAll('main section[id]')];
  const progress = document.querySelector('.scroll-progress');
  const progressFill = progress?.querySelector('span');
  const backToTop = document.querySelector('.back-to-top');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile navigation.
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      nav.classList.toggle('open', !isOpen);
    });

    allNavLinks.forEach((link) => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
    }));
  }

  // Keep the copyright year current.
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Stagger items in repeated content groups for a more intentional entrance.
  document.querySelectorAll('.skill-grid, .project-list, .experience-list, .education-timeline, .certificate-grid').forEach((group) => {
    [...group.children].forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${Math.min(index * 85, 340)}ms`);
    });
  });

  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

    document.querySelectorAll('.section-heading, .about-content, .skill-card, .project-card, .experience-item, .edu-item, .certificate-card, .contact-inner').forEach((element) => {
      element.classList.add('reveal');
      revealObserver.observe(element);
    });
  } else {
    document.querySelectorAll('.section-heading, .about-content, .skill-card, .project-card, .experience-item, .edu-item, .certificate-card, .contact-inner').forEach((element) => element.classList.add('is-visible'));
  }

  // Update reading progress and header state in one animation frame.
  let scrollTicking = false;
  const updateScrollUI = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progress) progress.setAttribute('aria-valuenow', String(Math.round(percentage)));
    document.querySelector('.site-header')?.classList.toggle('is-scrolled', window.scrollY > 12);
    backToTop?.classList.toggle('is-visible', window.scrollY > 560);
    scrollTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(updateScrollUI);
      scrollTicking = true;
    }
  }, { passive: true });
  updateScrollUI();

  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

  // Highlight the current section in the navigation.
  if ('IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach((section) => activeObserver.observe(section));
  }

  // Pointer-aware surface highlights. Touch devices are intentionally excluded.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion) {
    document.querySelectorAll('.hero-panel, .skill-card, .project-visual').forEach((surface) => {
      surface.addEventListener('pointermove', (event) => {
        const bounds = surface.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;
        surface.style.setProperty('--pointer-x', `${x}%`);
        surface.style.setProperty('--pointer-y', `${y}%`);
        surface.classList.add('pointer-active');
      });
      surface.addEventListener('pointerleave', () => surface.classList.remove('pointer-active'));
    });
  }

  // Pause the moving ticker while a visitor is reading or keyboard-focusing it.
  const ticker = document.querySelector('.ticker');
  ticker?.addEventListener('focusin', () => ticker.classList.add('is-paused'));
  ticker?.addEventListener('focusout', () => ticker.classList.remove('is-paused'));
})();

// Theme switch: remembers the visitor's choice in local storage.
(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  let stored = null;
  try { stored = localStorage.getItem('vansh-portfolio-theme'); } catch (_) { /* Storage may be disabled. */ }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    const dark = theme === 'dark';
    toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.querySelector('.theme-icon').textContent = dark ? '☀' : '☾';
    toggle.querySelector('.theme-label').textContent = dark ? 'LIGHT' : 'DARK';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#202520' : '#f3f1eb');
  };

  applyTheme(stored || (prefersDark ? 'dark' : 'light'));
  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('vansh-portfolio-theme', next); } catch (_) { /* Theme still changes for this visit. */ }
  });
})();
