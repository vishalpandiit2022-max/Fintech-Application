'use strict';

const form     = document.getElementById('signupForm');
const alertBox = document.getElementById('alertBox');
const btn      = document.getElementById('signupBtn');

function showError(msg) {
  alertBox.innerHTML = `<div class="alert alert-error">${msg}</div>`;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  alertBox.innerHTML = '';
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Creating account…';

  const body = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value,
    salary: parseFloat(document.getElementById('salary').value) || 0,
  };

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { showError(data.error || 'Signup failed.'); }
    else { window.location.href = '/dashboard'; }
  } catch {
    showError('Network error. Please try again.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Create Account';
  }
});
