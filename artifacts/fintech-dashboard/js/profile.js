'use strict';

let currentUser = null;

(async () => {
  currentUser = await initApp('profile');
  if (!currentUser) return;
  renderProfile(currentUser);
  setupSalaryForm();
})();

function renderProfile(user) {
  document.getElementById('avatarCircle').textContent = user.name[0].toUpperCase();
  document.getElementById('profileName').textContent  = user.name;
  document.getElementById('profileEmail').textContent = user.email;
  document.getElementById('infoName').textContent     = user.name;
  document.getElementById('infoEmail').textContent    = user.email;
  document.getElementById('infoSalary').textContent   = fmt$(user.salary) + ' / month';
  document.getElementById('newSalary').value          = user.salary || '';
}

function setupSalaryForm() {
  const form    = document.getElementById('salaryForm');
  const btn     = document.getElementById('salaryBtn');
  const alertEl = document.getElementById('salaryAlert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertEl.innerHTML = '';
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';

    const salary = parseFloat(document.getElementById('newSalary').value);
    if (isNaN(salary) || salary < 0) {
      alertEl.innerHTML = `<div class="alert alert-error">Please enter a valid salary amount.</div>`;
      btn.disabled = false;
      btn.innerHTML = 'Update';
      return;
    }

    try {
      const res = await apiFetch('/profile/salary', { method: 'PUT', body: { salary } });
      if (!res.ok) {
        const d = await res.json();
        alertEl.innerHTML = `<div class="alert alert-error">${d.error || 'Update failed.'}</div>`;
      } else {
        const updated = await res.json();
        currentUser = updated;
        renderProfile(updated);
        // Refresh sidebar salary display
        const salaryEl = document.querySelector('.sidebar-user-salary');
        if (salaryEl) salaryEl.textContent = fmt$(updated.salary) + '/mo';
        showToast('Salary updated successfully.');
      }
    } catch {
      alertEl.innerHTML = `<div class="alert alert-error">Network error.</div>`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Update';
    }
  });
}
