/* ================================================================
   AUTH-NAV — Dynamic Login / Logout Navigation
   Checks /api/v1/auth/me on page load and swaps LOGIN/SIGNUP
   buttons for the user's name + LOGOUT when authenticated.
================================================================ */
(function () {
  'use strict';

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthNav);
  } else {
    initAuthNav();
  }

  function initAuthNav() {
    fetch('/api/v1/auth/me', { credentials: 'include' })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.statusCode === 200 && data.data) {
          showLoggedInState(data.data);
        }
        // If not authenticated, do nothing — the default LOGIN/SIGNUP links stay
      })
      .catch(function () {
        // Network error — leave default nav
      });
  }

  function showLoggedInState(user) {
    var userName = user.name || 'User';
    var initials = userName.split(' ').map(function (w) { return w[0]; }).join('').toUpperCase().slice(0, 2);

    // ─── Desktop Nav ───
    updateDesktopNav(userName, initials);

    // ─── Mobile Nav ───
    updateMobileNav(userName, initials);
  }

  function updateDesktopNav(userName, initials) {
    var navMenu = document.getElementById('navMenu');
    if (!navMenu) return;

    // Find LOGIN and SIGNUP nav items by data-t attribute
    var loginItem = navMenu.querySelector('[data-t="nav-login"]');
    var signupItem = navMenu.querySelector('[data-t="nav-signup"]');

    // Get parent <li> elements
    var loginLi = loginItem ? loginItem.closest('li') : null;
    var signupLi = signupItem ? signupItem.closest('li') : null;

    // Hide LOGIN and SIGNUP
    if (loginLi) loginLi.style.display = 'none';
    if (signupLi) signupLi.style.display = 'none';

    // Create user greeting item
    var userLi = document.createElement('li');
    userLi.className = 'nav-item auth-user-item';
    userLi.style.marginLeft = '8px';
    userLi.innerHTML =
      '<span class="nav-link auth-user-greeting" style="display:inline-flex;align-items:center;gap:6px;cursor:default;font-weight:600;color:#1a73e8;">' +
        '<span class="auth-avatar" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:#1a73e8;color:#fff;font-size:12px;font-weight:700;">' + initials + '</span>' +
        '<span class="auth-name">' + escapeHtml(userName.split(' ')[0]) + '</span>' +
      '</span>';

    // Create Logout button item
    var logoutLi = document.createElement('li');
    logoutLi.className = 'nav-item auth-logout-item';
    logoutLi.style.marginLeft = '8px';
    logoutLi.innerHTML =
      '<a href="#" class="nav-link auth-logout-btn" id="desktopLogoutBtn" style="background:#d93025;color:#fff;padding:8px 16px;border-radius:20px;font-weight:600;font-size:0.85rem;text-decoration:none;display:inline-flex;align-items:center;gap:5px;">' +
        '<i class="fas fa-sign-out-alt"></i> LOGOUT' +
      '</a>';

    // Insert into nav
    navMenu.appendChild(userLi);
    navMenu.appendChild(logoutLi);

    // Attach logout handler
    document.getElementById('desktopLogoutBtn').addEventListener('click', handleLogout);
  }

  function updateMobileNav(userName, initials) {
    var mobilePanel = document.querySelector('.mobile-panel');
    if (!mobilePanel) return;

    // Find LOGIN and SIGNUP mobile links
    var mobileLogin = mobilePanel.querySelector('[data-t="nav-login"]');
    var mobileSignup = mobilePanel.querySelector('[data-t="nav-signup"]');

    // Hide them
    if (mobileLogin) mobileLogin.style.display = 'none';
    if (mobileSignup) mobileSignup.style.display = 'none';

    // Create user greeting link
    var userLink = document.createElement('div');
    userLink.className = 'mobile-link auth-mobile-greeting';
    userLink.style.cssText = 'display:flex;align-items:center;gap:10px;padding:12px 16px;font-weight:600;color:#1a73e8;cursor:default;';
    userLink.innerHTML =
      '<span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:#1a73e8;color:#fff;font-size:13px;font-weight:700;">' + initials + '</span>' +
      '<span>Hi, ' + escapeHtml(userName.split(' ')[0]) + '!</span>';

    // Create logout link
    var logoutLink = document.createElement('a');
    logoutLink.className = 'mobile-link auth-mobile-logout';
    logoutLink.href = '#';
    logoutLink.id = 'mobileLogoutBtn';
    logoutLink.style.cssText = 'background:#d93025;color:#fff;padding:10px 16px;border-radius:20px;font-weight:600;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px;margin:8px 16px;';
    logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> LOGOUT';

    // Insert into mobile panel
    mobilePanel.appendChild(userLink);
    mobilePanel.appendChild(logoutLink);

    // Attach logout handler
    logoutLink.addEventListener('click', handleLogout);
  }

  function handleLogout(e) {
    e.preventDefault();
    var btn = e.currentTarget;
    btn.style.opacity = '0.6';
    btn.style.pointerEvents = 'none';

    fetch('/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(function () {
        window.location.href = '/';
      })
      .catch(function () {
        window.location.href = '/';
      });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
})();
