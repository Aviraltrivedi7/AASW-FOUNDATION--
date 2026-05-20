/* ================================================================
   AASW FOUNDATION — SODES.IN STYLE JAVASCRIPT
   Features: Slider · Navbar · Scroll Reveal · Counters ·
             Language Toggle · Newsletter · Back to Top
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  initNavbar();
  initMobileNav();
  initDropdownTouch();
  initScrollReveal();
  initCounters();
  initLanguage();
  initBackToTop();
  initContactForm();
  initSmoothAnchors();
  initScrollProgress();
  initDynamicYear();
  initTheme();
});

/* ═══ HERO SLIDER ═══ */
function initSlider() {
  const track = document.getElementById('sliderTrack');
  const slides = track?.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  if (!track || !slides?.length) return;

  let current = 0;
  const total = slides.length;
  let autoSlideTimer;

  function goToSlide(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function nextSlide() { goToSlide(current + 1); }
  function prevSlide() { goToSlide(current - 1); }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideTimer = setInterval(nextSlide, 5000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlideTimer);
  }

  prevBtn?.addEventListener('click', () => { prevSlide(); startAutoSlide(); });
  nextBtn?.addEventListener('click', () => { nextSlide(); startAutoSlide(); });
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goToSlide(i); startAutoSlide(); });
  });

  // Touch/swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stopAutoSlide(); }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
    startAutoSlide();
  }, { passive: true });

  startAutoSlide();
}

/* ═══ NAVBAR SCROLL BEHAVIOR ═══ */
function initNavbar() {
  const nav = document.getElementById('mainNav');
  const brandBar = document.querySelector('.top-brand-bar');
  if (!nav) return;

  let lastScroll = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        // Add scrolled class for visual shrink/shadow
        nav.classList.toggle('scrolled', scrollY > 60);
        // Optionally hide brand bar on scroll down, show on scroll up
        if (brandBar) {
          brandBar.style.boxShadow = scrollY > 10 ? '0 2px 12px rgba(0,0,0,0.08)' : 'none';
        }
        lastScroll = scrollY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ═══ MOBILE NAV ═══ */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('mobileOverlay');
  if (!hamburger || !overlay) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    overlay.classList.toggle('open');
    document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
  });

  overlay.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => closeMobileNav());
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMobileNav();
  });
}

window.closeMobileNav = function () {
  document.getElementById('mobileOverlay')?.classList.remove('open');
  document.getElementById('hamburger')?.classList.remove('open');
  document.body.style.overflow = '';
};

/* ═══ SCROLL REVEAL ═══ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ═══ COUNTER ANIMATION ═══ */
function initCounters() {
  const nums = document.querySelectorAll('.counter-num');
  if (!nums.length) return;
  let animated = false;

  function animateCounters() {
    if (animated) return;
    const first = nums[0].getBoundingClientRect();
    if (first.top > window.innerHeight) return;
    animated = true;

    nums.forEach(el => {
      const target = parseInt(el.dataset.count);
      if (isNaN(target)) return;
      const suffix = el.dataset.suffix || '';
      const duration = 2000;
      const start = performance.now();

      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(target * ease).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }

  window.addEventListener('scroll', animateCounters, { passive: true });
  animateCounters();
}

/* ═══ BILINGUAL LANGUAGE TOGGLE ═══ */
/* i18n is now handled entirely by /js/i18n.js — see that file for
   the TRANSLATIONS dictionary, setLang(), applyTranslations(), etc.
   Removed ~200 lines of duplicate translation data from here. */


/* ═══ BACK TO TOP ═══ */
function initBackToTop() {
  const btn = document.getElementById('btt');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ═══ SMOOTH ANCHORS ═══ */
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 130; // brand bar + nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ═══ SCROLL PROGRESS ═══ */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight * 100) : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

/* ═══ DYNAMIC YEAR ═══ */
function initDynamicYear() {
  const year = new Date().getFullYear();
  const fCopy = document.querySelector('[data-t="f-copy"]');
  if (fCopy) {
    const isHi = document.body.classList.contains('lang-hi');
    fCopy.textContent = isHi
      ? `© ${year} AASW फाउंडेशन। सर्वाधिकार सुरक्षित। | पंजीकृत गैर-लाभकारी · 80G और 12A प्रमाणित`
      : `© ${year} AASW Foundation. All rights reserved. | Registered Non-Profit · 80G & 12A Certified`;
  }
  // Also update any static copyright elements
  document.querySelectorAll('.footer-year, [data-year]').forEach(el => {
    el.textContent = year;
  });
}

/* ═══ CONTACT FORM ═══ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const btn = document.getElementById('contactSubmitBtn');
  const feedback = document.getElementById('contactFeedback');
  if (!form || !btn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const lang = document.body.classList.contains('lang-hi') ? 'hi' : 'en';

    const name = document.getElementById('contactName')?.value?.trim();
    const email = document.getElementById('contactEmail')?.value?.trim();
    const subject = document.getElementById('contactSubject')?.value?.trim();
    const message = document.getElementById('contactMessage')?.value?.trim();

    // Client-side validation
    if (!name || name.length < 2) {
      showFeedback(feedback, lang === 'hi' ? 'कृपया अपना नाम दर्ज करें (कम से कम 2 अक्षर)' : 'Please enter your name (at least 2 characters)', 'error');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFeedback(feedback, lang === 'hi' ? 'कृपया एक मान्य ईमेल दर्ज करें' : 'Please enter a valid email address', 'error');
      return;
    }
    if (!subject || subject.length < 3) {
      showFeedback(feedback, lang === 'hi' ? 'कृपया विषय दर्ज करें (कम से कम 3 अक्षर)' : 'Please enter a subject (at least 3 characters)', 'error');
      return;
    }
    if (!message || message.length < 10) {
      showFeedback(feedback, lang === 'hi' ? 'कृपया संदेश दर्ज करें (कम से कम 10 अक्षर)' : 'Please enter a message (at least 10 characters)', 'error');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = lang === 'hi' ? '<i class="fas fa-spinner fa-spin"></i> भेज रहे हैं...' : '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          website: document.getElementById('contactWebsite')?.value || ''
        })
      });

      const data = await res.json();

      if (res.status === 201) {
        form.reset();
        showFeedback(feedback, lang === 'hi' ? '✓ आपका संदेश सफलतापूर्वक भेजा गया!' : '✓ Your message has been sent successfully!', 'success');
      } else {
        const errMsg = data.message || (lang === 'hi' ? 'कुछ गलत हो गया' : 'Something went wrong');
        showFeedback(feedback, '✗ ' + errMsg, 'error');
      }
    } catch (err) {
      console.warn('Contact form submission failed:', err);
      showFeedback(feedback, lang === 'hi' ? '✗ नेटवर्क त्रुटि, कृपया पुनः प्रयास करें' : '✗ Network error, please try again', 'error');
    }

    btn.disabled = false;
    btn.innerHTML = lang === 'hi' ? '<i class="fas fa-paper-plane"></i> संदेश भेजें' : '<i class="fas fa-paper-plane"></i> Send Message';
  });
}

function showFeedback(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.className = 'contact-feedback ' + type;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 5000);
}

/* ═══ DROPDOWN TOUCH SUPPORT ═══ */
function initDropdownTouch() {
  // On touch devices, toggle dropdown open/close on tap
  const dropdowns = document.querySelectorAll('.has-dropdown');
  if (!dropdowns.length) return;

  dropdowns.forEach(dd => {
    const link = dd.querySelector('.nav-link');
    if (!link) return;

    link.addEventListener('click', (e) => {
      // Only intercept on touch devices / narrow screens
      if (window.innerWidth > 768) return;
      e.preventDefault();
      e.stopPropagation();

      // Close other open dropdowns
      dropdowns.forEach(other => {
        if (other !== dd) other.classList.remove('open');
      });

      dd.classList.toggle('open');
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) {
      dropdowns.forEach(dd => dd.classList.remove('open'));
    }
  });
}

/* ═══ THEME TOGGLE (LIGHT/DARK MODE) ═══ */
function initTheme() {
  const toggleBtn = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  if (!toggleBtn) return;

  // Check saved preference or fallback to system preference
  const savedTheme = localStorage.getItem('aasw-theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  // Set initial theme
  if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
    document.body.classList.add('light-mode');
    document.documentElement.classList.remove('dark');
    if (themeIcon) themeIcon.textContent = 'dark_mode'; // icon to switch to dark
  } else {
    document.body.classList.remove('light-mode');
    document.documentElement.classList.add('dark');
    if (themeIcon) themeIcon.textContent = 'light_mode'; // icon to switch to light
  }

  // Toggle handler
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    
    if (isLight) {
      document.documentElement.classList.remove('dark');
      if (themeIcon) themeIcon.textContent = 'dark_mode';
      localStorage.setItem('aasw-theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      if (themeIcon) themeIcon.textContent = 'light_mode';
      localStorage.setItem('aasw-theme', 'dark');
    }
  });
}
