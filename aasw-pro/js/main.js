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
  initBackToTop();
  initContactForm();
  initSmoothAnchors();
  initScrollProgress();
  initDynamicYear();
  initNewsletterForm();
  initHonorRoll();
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
  const nums = document.querySelectorAll('.counter-num, .counter');
  if (!nums.length) return;

  const animateElement = (el) => {
    const target = parseInt(el.dataset.count || el.dataset.target);
    if (isNaN(target)) return;
    const suffix = el.dataset.suffix !== undefined ? el.dataset.suffix : '+';
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(target * ease);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString() + suffix;
      }
    }
    requestAnimationFrame(update);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateElement(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px 50px 0px' });

    nums.forEach(el => observer.observe(el));
  } else {
    nums.forEach(el => animateElement(el));
  }
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
  const year = 2025;
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
      showToast(lang === 'hi' ? 'कृपया अपना नाम दर्ज करें (कम से कम 2 अक्षर)' : 'Please enter your name (at least 2 characters)', 'error');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast(lang === 'hi' ? 'कृपया एक मान्य ईमेल दर्ज करें' : 'Please enter a valid email address', 'error');
      return;
    }
    if (!subject || subject.length < 3) {
      showToast(lang === 'hi' ? 'कृपया विषय दर्ज करें (कम से कम 3 अक्षर)' : 'Please enter a subject (at least 3 characters)', 'error');
      return;
    }
    if (!message || message.length < 10) {
      showToast(lang === 'hi' ? 'कृपया संदेश दर्ज करें (कम से कम 10 अक्षर)' : 'Please enter a message (at least 10 characters)', 'error');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = lang === 'hi' ? '<i class="fas fa-spinner fa-spin"></i> भेज रहे हैं...' : '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          website: document.getElementById('contactWebsite')?.value || ''
        })
      });

      const data = await res.json();

      if (res.ok || res.status === 201 || res.status === 200) {
        form.reset();
        showToast(lang === 'hi' ? 'आपका संदेश सफलतापूर्वक भेजा गया!' : 'Your message has been sent successfully!', 'success');
      } else {
        const errMsg = data.message || (lang === 'hi' ? 'कुछ गलत हो गया' : 'Something went wrong');
        showToast(errMsg, 'error');
      }
    } catch (err) {
      console.warn('Contact form submission failed:', err);
      showToast(lang === 'hi' ? 'नेटवर्क त्रुटि, कृपया पुनः प्रयास करें' : 'Network error, please try again', 'error');
    }

    btn.disabled = false;
    btn.innerHTML = lang === 'hi' ? '<i class="fas fa-paper-plane"></i> संदेश भेजें' : '<i class="fas fa-paper-plane"></i> Send Message';
  });
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

/* ═══ NEWSLETTER FORM ═══ */
function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  const btn = document.getElementById('newsletterSubmitBtn');
  const emailInput = document.getElementById('newsletterEmail');
  if (!form || !btn || !emailInput) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const lang = document.body.classList.contains('lang-hi') ? 'hi' : 'en';
    const email = emailInput.value?.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast(lang === 'hi' ? 'कृपया एक मान्य ईमेल दर्ज करें।' : 'Please enter a valid email address.', 'error');
      return;
    }

    btn.disabled = true;
    const originalText = btn.textContent;
    btn.innerHTML = lang === 'hi' ? '<i class="fas fa-spinner fa-spin"></i> सदस्यता ले रहे हैं...' : '<i class="fas fa-spinner fa-spin"></i> Subscribing...';

    try {
      const res = await fetch('/api/v1/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.status === 201 || res.status === 200) {
        form.reset();
        showToast(lang === 'hi' ? 'सदस्यता सफलतापूर्वक पूरी हुई!' : 'Successfully subscribed to our newsletter!', 'success');
      } else {
        const errMsg = data.message || (lang === 'hi' ? 'कुछ गलत हो गया, फिर प्रयास करें।' : 'Something went wrong, please try again.');
        showToast(errMsg, 'error');
      }
    } catch (err) {
      console.warn('Newsletter subscription failed:', err);
      showToast(lang === 'hi' ? 'नेटवर्क त्रुटि, कृपया पुनः प्रयास करें।' : 'Network error, please try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

/* ═══ SLEEK TOAST NOTIFICATION SYSTEM ═══ */
function showToast(message, type = 'success') {
  let container = document.getElementById('aasw-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'aasw-toast-container';
    container.className = 'fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'p-4 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center gap-3 transform translate-y-4 opacity-0 transition-all duration-500 will-change-transform';
  
  if (type === 'success') {
    toast.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
    toast.style.borderColor = 'rgba(16, 185, 129, 0.2)';
    toast.style.color = '#10b981';
  } else {
    toast.style.backgroundColor = 'rgba(244, 63, 94, 0.1)';
    toast.style.borderColor = 'rgba(244, 63, 94, 0.2)';
    toast.style.color = '#f43f5e';
  }

  const icon = document.createElement('span');
  icon.className = 'material-symbols-outlined shrink-0';
  icon.textContent = type === 'success' ? 'check_circle' : 'error';
  
  const text = document.createElement('span');
  text.className = 'font-label text-xs sm:text-sm font-semibold tracking-wide';
  text.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(text);
  container.appendChild(toast);

  // Trigger entrance animation next frame
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });

  // Remove toast after 4s
  setTimeout(() => {
    toast.style.transform = 'translateY(4px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    }, 500);
  }, 4000);
}

/* ═══ HONOR ROLL / ACTIVE MEMBERS (ROBUST — never wipes names) ═══ */
let _honorRollRendered = false; // track if we already rendered members

async function _fetchMembersWithTimeout(timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch('/api/v1/membership/featured', { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : (json.data?.members || []);
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

function _renderHonorGrid(grid, allMembers) {
  _honorRollRendered = true;

  // Save to sessionStorage so instant on page reload
  try { sessionStorage.setItem('_honorMembers', JSON.stringify(allMembers)); } catch(e) {}

  if (!allMembers || allMembers.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12 px-6 bg-surface-container/40 rounded-2xl border border-white/5">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <span class="material-symbols-outlined text-3xl">verified_user</span>
        </div>
        <h3 class="text-xl font-headline font-bold text-white mb-2">Be the First Member!</h3>
        <p class="text-on-surface-variant text-sm max-w-md mx-auto">Join AASW Foundation today and have your name featured on our official Honor Roll.</p>
      </div>
    `;
    return;
  }

  // Add filter buttons
  let filterContainer = document.getElementById('honor-roll-filters');
  if (!filterContainer && grid.parentElement) {
    filterContainer = document.createElement('div');
    filterContainer.id = 'honor-roll-filters';
    filterContainer.className = 'flex flex-wrap justify-center gap-3 mb-10';
    grid.parentElement.insertBefore(filterContainer, grid);
  }

  const renderGrid = (filterType = 'all') => {
    let filtered = allMembers;
    if (filterType === 'annual') filtered = allMembers.filter(m => m.planId !== 'lifetime');
    if (filterType === 'lifetime') filtered = allMembers.filter(m => m.planId === 'lifetime');

    const annualCount = allMembers.filter(m => m.planId !== 'lifetime').length;
    const lifetimeCount = allMembers.filter(m => m.planId === 'lifetime').length;

    if (filterContainer) {
      filterContainer.innerHTML = `
        <button data-filter="all" class="honor-filter-btn px-6 py-2.5 rounded-full font-label text-xs font-bold uppercase tracking-wider leading-normal transition-all border ${filterType === 'all' ? 'bg-primary text-on-primary border-primary shadow-[0_0_20px_rgba(148,170,255,0.4)]' : 'bg-surface-container text-on-surface-variant border-white/10 hover:border-white/20'}">
          All Members (${allMembers.length})
        </button>
        <button data-filter="annual" class="honor-filter-btn px-6 py-2.5 rounded-full font-label text-xs font-bold uppercase tracking-wider leading-normal transition-all border ${filterType === 'annual' ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-surface-container text-on-surface-variant border-white/10 hover:border-white/20'}">
          1 Year Subscriptions (${annualCount})
        </button>
        <button data-filter="lifetime" class="honor-filter-btn px-6 py-2.5 rounded-full font-label text-xs font-bold uppercase tracking-wider leading-normal transition-all border ${filterType === 'lifetime' ? 'bg-amber-600 text-white border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-surface-container text-on-surface-variant border-white/10 hover:border-white/20'}">
          Lifetime Membership (${lifetimeCount})
        </button>
      `;
      filterContainer.querySelectorAll('button').forEach(btn => {
        btn.onclick = () => renderGrid(btn.getAttribute('data-filter'));
      });
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-12 text-on-surface-variant text-sm bg-surface-container/30 rounded-2xl border border-white/5">
          No ${filterType === 'lifetime' ? 'Lifetime' : '1-Year'} members found yet.
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(m => {
      const isLifetime = m.planId === 'lifetime' || (m.planName && m.planName.toLowerCase().includes('lifetime')) || m.amount >= 10000;
      const badgeLabel = isLifetime ? 'Lifetime Member' : '1 Year Member';
      const badgeClass = isLifetime
        ? 'honor-badge-lifetime bg-gradient-to-r from-amber-500/25 via-yellow-500/25 to-amber-600/25 text-amber-300 border-amber-500/50 shadow-[0_0_18px_rgba(245,158,11,0.3)]'
        : 'honor-badge-annual bg-gradient-to-r from-blue-500/25 via-indigo-500/25 to-cyan-500/25 text-blue-300 border-blue-500/50 shadow-[0_0_18px_rgba(59,130,246,0.3)]';
      const cardBorder = isLifetime ? 'border-amber-500/40 hover:border-amber-400 hover:shadow-[0_10px_30px_rgba(245,158,11,0.2)]' : 'border-blue-500/40 hover:border-blue-400 hover:shadow-[0_10px_30px_rgba(59,130,246,0.2)]';
      const memberDate = m.created_at ? new Date(m.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'August 2026';

      return `
        <div class="bg-surface-container/80 backdrop-blur-2xl p-6 rounded-2xl border ${cardBorder} transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div class="absolute -top-12 -right-12 w-32 h-32 ${isLifetime ? 'bg-amber-500/15' : 'bg-blue-500/15'} rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
          
          <div class="mb-4 relative z-10">
            <h4 class="font-headline font-extrabold text-white text-base sm:text-lg leading-snug tracking-tight break-words group-hover:text-primary transition-colors" title="${m.name || 'Member'}">
              ${m.name || 'Member'}
            </h4>
            <span class="text-[11px] text-primary-light font-label uppercase font-bold tracking-wider block mt-1">
              Member Since: ${memberDate}
            </span>
          </div>

          <div class="space-y-3 pt-4 border-t border-white/10 relative z-10">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-label font-extrabold uppercase tracking-wider leading-normal border ${badgeClass}">
                ${badgeLabel}
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-headline font-bold uppercase tracking-wider leading-normal shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <span class="material-symbols-outlined text-[15px]">verified</span> Verified Member
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  renderGrid('all');
}

async function initHonorRoll() {
  const grid = document.getElementById('lifetime-members-grid');
  if (!grid) return;

  // STEP 1: Instantly show cached members from sessionStorage (no loading flash)
  if (!_honorRollRendered) {
    try {
      const cached = sessionStorage.getItem('_honorMembers');
      if (cached) {
        const cachedMembers = JSON.parse(cached);
        if (cachedMembers && cachedMembers.length > 0) {
          _renderHonorGrid(grid, cachedMembers);
        }
      }
    } catch(e) {}
  }

  // STEP 2: Fetch fresh data from server (with timeout + retry)
  try {
    const members = await _fetchMembersWithTimeout(12000);
    // Only render if we got valid data - NEVER wipe with empty on a re-fetch
    if (members && members.length > 0) {
      _renderHonorGrid(grid, members);
    } else if (!_honorRollRendered) {
      // First load and truly no members exist
      _renderHonorGrid(grid, []);
    }
  } catch (err) {
    console.warn('[HonorRoll] Fetch failed, trying retry...', err.message);
    // RETRY once after 3 seconds
    try {
      await new Promise(r => setTimeout(r, 3000));
      const members = await _fetchMembersWithTimeout(15000);
      if (members && members.length > 0) {
        _renderHonorGrid(grid, members);
      } else if (!_honorRollRendered) {
        _renderHonorGrid(grid, []);
      }
    } catch (retryErr) {
      console.error('[HonorRoll] Retry also failed:', retryErr.message);
      // If we never rendered anything, show empty state
      if (!_honorRollRendered) {
        _renderHonorGrid(grid, []);
      }
      // If we already have cached content showing, leave it as-is (DON'T WIPE!)
    }
  }
}
window.initHonorRoll = initHonorRoll;

function initAll() {
  if (typeof initSlider === 'function') initSlider();
  if (typeof initNavbar === 'function') initNavbar();
  if (typeof initMobileNav === 'function') initMobileNav();
  if (typeof initDropdownTouch === 'function') initDropdownTouch();
  if (typeof initScrollReveal === 'function') initScrollReveal();
  if (typeof initCounters === 'function') initCounters();
  if (typeof initBackToTop === 'function') initBackToTop();
  if (typeof initContactForm === 'function') initContactForm();
  if (typeof initSmoothAnchors === 'function') initSmoothAnchors();
  if (typeof initScrollProgress === 'function') initScrollProgress();
  if (typeof initDynamicYear === 'function') initDynamicYear();
  if (typeof initLanguage === 'function') initLanguage();
  if (typeof initNewsletterForm === 'function') initNewsletterForm();
  if (typeof initHonorRoll === 'function') initHonorRoll();
}
window.initAll = initAll;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

window.closeMobileNav = function() {
  document.getElementById('mobileOverlay')?.classList.remove('open');
  document.getElementById('hamburger')?.classList.remove('open');
  document.body.style.overflow = '';
};

/* ═══ POST-PAYMENT AUTO-REFRESH ═══ 
 * After a successful Razorpay payment, the membership page dispatches
 * a 'membershipPaymentSuccess' event. This listener auto-refreshes the
 * Wall of Honor grid so the new member appears immediately.
 */
window.addEventListener('membershipPaymentSuccess', () => {
  console.log('[Honor Roll] Payment detected — refreshing member list in 2s...');
  setTimeout(() => {
    if (typeof initHonorRoll === 'function') {
      initHonorRoll();
      console.log('[Honor Roll]  Member list refreshed after payment.');
    }
  }, 2000); // 2s delay to allow DB sync to complete
});

// Also expose a direct refreshHonorRoll function for inline scripts
window.refreshHonorRoll = function() {
  if (typeof initHonorRoll === 'function') {
    setTimeout(() => initHonorRoll(), 2000);
  }
};

