/**
 * Universal Mobile Menu Handler
 * Auto-injects mobile menu panel on all pages and wires up toggle/close
 */
(function () {
  // Check if mobile menu already exists (some pages like privacy/refund have it)
  if (document.getElementById('mobile-menu')) {
    // Just wire up event handlers
    wireUpMenu();
    return;
  }

  // Create the mobile menu panel
  const menu = document.createElement('div');
  menu.id = 'mobile-menu';
  menu.className = 'mobile-menu fixed inset-0 z-[200] bg-[#0e0e0f]/97 backdrop-blur-2xl flex flex-col items-center justify-center gap-8';
  menu.innerHTML = `
    <button id="menu-close" class="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-primary transition-all">
      <span class="material-symbols-outlined text-2xl">close</span>
    </button>
    <a href="/" class="text-2xl font-headline font-bold text-on-surface-variant hover:text-white transition-colors">Home</a>
    <a href="/team.html" class="text-2xl font-headline font-bold text-on-surface-variant hover:text-white transition-colors">Our Team</a>
    <a href="/governance.html" class="text-2xl font-headline font-bold text-on-surface-variant hover:text-white transition-colors">Governance</a>
    <a href="/donate.html" class="text-2xl font-headline font-bold text-on-surface-variant hover:text-white transition-colors">Donate</a>
    <a href="/programs.html" class="text-2xl font-headline font-bold text-on-surface-variant hover:text-white transition-colors">Programs</a>
    <a href="/stories.html" class="text-2xl font-headline font-bold text-on-surface-variant hover:text-white transition-colors">Impact</a>
    <div class="mt-4 flex flex-col gap-3 w-64">
      <a href="/donate.html" class="bg-gradient-to-r from-primary to-secondary text-on-primary text-center py-3.5 rounded-full font-label text-xs font-black uppercase tracking-[0.15em] shadow-[0_0_30px_rgba(148,170,255,0.3)] hover:scale-105 active:scale-95 transition-all">Donate Now</a>
      <a href="/membership.html" class="glass border border-white/20 text-white text-center py-3.5 rounded-full font-label text-xs font-black uppercase tracking-[0.15em] hover:bg-white/10 transition-all">Become a Member</a>
    </div>
  `;
  document.body.appendChild(menu);

  // Add CSS for mobile menu if not already present
  if (!document.querySelector('style[data-mobile-menu]')) {
    const style = document.createElement('style');
    style.setAttribute('data-mobile-menu', 'true');
    style.textContent = `
      .mobile-menu { transform: translateX(100%); transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
      .mobile-menu.open { transform: translateX(0); }
    `;
    document.head.appendChild(style);
  }

  wireUpMenu();

  // Create WhatsApp Floating Button
  var waButton = document.createElement('a');
  waButton.href = 'https://wa.me/919984156418?text=Hello%20AASW%20Foundation,%20I%20want%20to%20know%20more%20about%20your%20initiatives.';
  waButton.target = '_blank';
  waButton.rel = 'noopener noreferrer';
  waButton.className = 'fixed bottom-6 right-6 z-[99] bg-[#25d366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-[0_4px_15px_rgba(37,211,102,0.4)] transition-all hover:scale-110 flex items-center justify-center';
  waButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.248 8.477 3.517 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.733-1.455L0 24zm6.79-4.896c1.675.995 3.325 1.5 5.189 1.501 5.48.001 9.938-4.417 9.94-9.847.002-2.63-1.018-5.101-2.872-6.958-1.854-1.857-4.321-2.88-6.951-2.881-5.485 0-9.944 4.417-9.946 9.848-.001 1.957.513 3.868 1.488 5.56l-.979 3.57 3.682-.958-.551-.345zM17.52 14.333c-.302-.15-1.786-.88-2.062-.98-.276-.101-.477-.15-.677.15-.2.3-.775.98-.95 1.18-.175.2-.35.225-.652.075-.302-.15-1.275-.47-2.428-1.499-.896-.8-1.5-1.788-1.275-2.088.175-.2.35-.425.525-.638.175-.213.238-.363.35-.6.113-.238.056-.45-.028-.6-.084-.15-.677-1.63-.927-2.23-.243-.585-.49-.505-.677-.515-.174-.008-.375-.01-.576-.01-.2.0-.527.075-.802.375-.276.3-.1.525-.1.525s-.375.952-.375 2.316c0 1.365.992 2.686 1.13 2.875.138.188 1.953 2.981 4.731 4.18 1.107.477 1.97.766 2.646.98.679.213 1.298.184 1.788.11.546-.08 1.68-.687 1.914-1.353.236-.666.236-1.237.165-1.354-.07-.116-.275-.2-.577-.35z"/>
    </svg>
  `;
  document.body.appendChild(waButton);

  function wireUpMenu() {
    // Find the toggle button — it's the md:hidden button in the nav
    const toggleBtn = document.getElementById('menu-toggle') ||
      document.querySelector('#main-nav button.md\\:hidden, nav button.md\\:hidden, header button.md\\:hidden, button.lg\\:hidden');

    if (toggleBtn) {
      toggleBtn.id = 'menu-toggle';
      toggleBtn.addEventListener('click', function () {
        const m = document.getElementById('mobile-menu');
        if (m) m.classList.add('open');
      });
    }

    // Wire close button
    const closeBtn = document.getElementById('menu-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        const m = document.getElementById('mobile-menu');
        if (m) m.classList.remove('open');
      });
    }

    // Close on menu link click
    const menuEl = document.getElementById('mobile-menu');
    if (menuEl) {
      menuEl.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          menuEl.classList.remove('open');
        });
      });
    }

    // Highlight active link in mobile menu
    const currentPath = window.location.pathname;
    if (menuEl) {
      menuEl.querySelectorAll('a').forEach(function (link) {
        const href = link.getAttribute('href');
        if (!href) return;
        if ((currentPath === '/' || currentPath === '/index.html') && href === '/') {
          link.classList.add('text-primary');
          link.classList.remove('text-on-surface-variant');
        } else if (href !== '/' && href !== '/#contact' && currentPath.includes(href.replace('.html', ''))) {
          link.classList.add('text-primary');
          link.classList.remove('text-on-surface-variant');
        }
      });
    }
  }
})();

