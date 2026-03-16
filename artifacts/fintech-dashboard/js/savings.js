'use strict';

let goals = [];

(async () => {
  const user = await initApp('savings');
  if (!user) return;
  await loadGoals();
  setupForm();
})();

async function loadGoals() {
  const res = await apiFetch('/savings');
  if (!res.ok) { showToast('Failed to load savings goals.', 'error'); return; }
  goals = await res.json();
  renderGoals();
}

function renderGoals() {
  const el = document.getElementById('goalsContainer');
  if (!goals.length) {
    el.innerHTML = `
      <div class="card">
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <h3>No active goals</h3>
          <p>Setting financial goals is the first step to achieving them.<br>Create your first target to start tracking.</p>
        </div>
      </div>`;
    return;
  }

  el.innerHTML = `
    <div class="goals-grid">
      ${goals.map(g => `
        <div class="goal-card">
          <div class="goal-card-header">
            <div class="goal-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <button class="btn btn-icon btn-danger btn-sm" onclick="deleteGoal(${g.id})" title="Delete goal">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
          <div class="goal-name">${esc(g.goalName)}</div>
          <div class="goal-amount">${fmt$(g.targetAmount)}</div>
          <div class="goal-meta">
            <div class="goal-row">
              <span class="goal-row-label">Timeline</span>
              <span class="goal-row-value">${g.months} month${g.months !== 1 ? 's' : ''}</span>
            </div>
            <div class="goal-monthly">
              <span>Monthly required</span>
              <span>${fmt$(g.monthlySaving)}</span>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
}

function setupForm() {
  const formCard   = document.getElementById('goalFormCard');
  const toggleBtn  = document.getElementById('toggleFormBtn');
  const cancelBtn  = document.getElementById('cancelFormBtn');
  const form       = document.getElementById('goalForm');
  const btn        = document.getElementById('createGoalBtn');
  const alertEl    = document.getElementById('goalAlert');

  toggleBtn.addEventListener('click', () => {
    const open = formCard.style.display !== 'none';
    formCard.style.display = open ? 'none' : 'block';
    toggleBtn.innerHTML = open
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg> New Goal`
      : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" x2="19" y1="12" y2="12"/></svg> Cancel`;
  });

  cancelBtn.addEventListener('click', () => {
    formCard.style.display = 'none';
    toggleBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg> New Goal`;
    form.reset();
    alertEl.innerHTML = '';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertEl.innerHTML = '';
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Creating…';

    const body = {
      goalName: document.getElementById('goalName').value.trim(),
      targetAmount: parseFloat(document.getElementById('targetAmount').value),
      months: parseInt(document.getElementById('months').value, 10),
    };

    try {
      const res = await apiFetch('/savings', { method: 'POST', body });
      if (!res.ok) {
        const d = await res.json();
        alertEl.innerHTML = `<div class="alert alert-error">${d.error || 'Failed to create goal.'}</div>`;
      } else {
        const g = await res.json();
        goals.push(g);
        renderGoals();
        form.reset();
        formCard.style.display = 'none';
        toggleBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg> New Goal`;
        showToast('Savings goal created!');
      }
    } catch {
      alertEl.innerHTML = `<div class="alert alert-error">Network error.</div>`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Create Goal';
    }
  });
}

async function deleteGoal(id) {
  if (!confirm('Delete this savings goal?')) return;
  const res = await apiFetch(`/savings/${id}`, { method: 'DELETE' });
  if (res.ok) {
    goals = goals.filter(g => g.id !== id);
    renderGoals();
    showToast('Goal deleted.');
  } else {
    showToast('Failed to delete goal.', 'error');
  }
}
