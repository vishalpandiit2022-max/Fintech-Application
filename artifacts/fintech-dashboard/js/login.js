'use strict';

(async () => {
  // If already logged in, go to dashboard
  try {
    const r = await fetch('/api/auth/me', { credentials: 'include' });
    if (r.ok) { window.location.href = '/dashboard'; return; }
  } catch {}

  const form    = document.getElementById('loginForm');
  const alertBox = document.getElementById('alertBox');
  const btn     = document.getElementById('loginBtn');

  function showError(msg) {
    alertBox.innerHTML = `<div class="alert alert-error">${msg}</div>`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.innerHTML = '';
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Signing in…';

    const body = {
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
    };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { showError(data.error || 'Login failed.'); }
      else { window.location.href = '/dashboard'; }
    } catch {
      showError('Network error. Please try again.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Sign In';
    }
  });
})();
