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
    <a href="/membership.html" class="text-2xl font-headline font-bold text-on-surface-variant hover:text-white transition-colors">Membership</a>
    <a href="/#contact" class="text-2xl font-headline font-bold text-on-surface-variant hover:text-white transition-colors">Contact</a>
    <div class="mt-4">
      <a href="/membership.html" class="bg-gradient-to-r from-primary to-secondary text-on-primary px-10 py-3.5 rounded-full font-label text-xs font-black uppercase tracking-[0.15em] shadow-[0_0_30px_rgba(148,170,255,0.3)] hover:scale-105 active:scale-95 transition-all inline-block">Become a Member</a>
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
