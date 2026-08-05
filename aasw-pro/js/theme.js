/* ═══════════════════════════════════════════
   AASW FOUNDATION — THEME TOGGLE (Light/Dark)
   Standalone script, no dependencies needed.
═══════════════════════════════════════════ */
(function () {
  'use strict';

  // Apply saved theme IMMEDIATELY (Default is LIGHT mode)
  var saved = null;
  try { saved = localStorage.getItem('aasw-theme'); } catch (e) { /* incognito */ }

  var isLightDefault = saved ? (saved === 'light') : true;

  if (isLightDefault) {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    if (document.body) document.body.classList.add('light-mode');
  } else {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    if (document.body) document.body.classList.remove('light-mode');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('themeToggle');
    var icon = document.getElementById('themeIcon');
    if (!btn) return;

    var isLight = saved ? (saved === 'light') : true;

    // Apply state on load
    function applyTheme(light) {
      if (light) {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        if (document.body) document.body.classList.add('light-mode');
        if (icon) icon.textContent = 'dark_mode';
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        if (document.body) document.body.classList.remove('light-mode');
        if (icon) icon.textContent = 'light_mode';
      }
      try { localStorage.setItem('aasw-theme', light ? 'light' : 'dark'); } catch (e) {}
    }

    applyTheme(isLight);

    btn.addEventListener('click', function () {
      isLight = !isLight;
      applyTheme(isLight);
    });

    // Inject Google Analytics dynamically
    var gaId = 'G-XXXXXXXXXX'; // User can replace with actual GA Measurement ID
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', gaId);
  });
})();

