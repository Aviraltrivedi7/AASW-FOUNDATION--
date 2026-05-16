/* ═══════════════════════════════════════════
   AASW FOUNDATION — THEME TOGGLE (Light/Dark)
   Standalone script, no dependencies needed.
═══════════════════════════════════════════ */
(function () {
  'use strict';

  // Apply saved theme IMMEDIATELY to prevent flash
  var saved = null;
  try { saved = localStorage.getItem('aasw-theme'); } catch (e) { /* incognito */ }

  if (saved === 'light') {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.body && document.body.classList.add('light-mode');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('themeToggle');
    var icon = document.getElementById('themeIcon');
    if (!btn) return;

    var isLight = document.documentElement.classList.contains('light');

    // Apply state on load
    function applyTheme(light) {
      if (light) {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.body.classList.add('light-mode');
        if (icon) icon.textContent = 'dark_mode';
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.body.classList.remove('light-mode');
        if (icon) icon.textContent = 'light_mode';
      }
      try { localStorage.setItem('aasw-theme', light ? 'light' : 'dark'); } catch (e) {}
    }

    applyTheme(isLight);

    btn.addEventListener('click', function () {
      isLight = !isLight;
      applyTheme(isLight);
    });
  });
})();
