'use strict';

let expenses = [];

(async () => {
  const user = await initApp('expenses');
  if (!user) return;

  // Set today as default date
  document.getElementById('date').value = new Date().toISOString().split('T')[0];

  await loadExpenses();
  setupForm();
})();

async function loadExpenses() {
  const res = await apiFetch('/expenses');
  if (!res.ok) { showToast('Failed to load expenses.', 'error'); return; }
  expenses = await res.json();
  renderTable();
}

function renderTable() {
  const el = document.getElementById('expensesTable');
  if (!expenses.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/></svg>
        </div>
        <h3>No expenses recorded</h3>
        <p>Add your first expense using the form above.</p>
      </div>`;
    return;
  }

  // Sort newest first
  const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  el.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Description</th><th>Category</th><th>Amount</th><th>Date</th><th></th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map(e => `
            <tr>
              <td style="font-weight:500">${esc(e.description)}</td>
              <td>${categoryBadge(e.category)}</td>
              <td style="font-weight:600">${fmt$(e.amount)}</td>
              <td style="color:var(--muted)">${fmtDate(e.date)}</td>
              <td style="text-align:right">
                <button class="btn btn-icon btn-danger btn-sm" onclick="deleteExpense(${e.id})" title="Delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function setupForm() {
  const form = document.getElementById('expenseForm');
  const btn  = document.getElementById('addBtn');
  const alertEl = document.getElementById('formAlert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertEl.innerHTML = '';
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';

    const body = {
      description: document.getElementById('desc').value.trim(),
      category: document.getElementById('cat').value,
      amount: parseFloat(document.getElementById('amount').value),
      date: document.getElementById('date').value,
    };

    try {
      const res = await apiFetch('/expenses', { method: 'POST', body });
      if (!res.ok) {
        const d = await res.json();
        alertEl.innerHTML = `<div class="alert alert-error">${d.error || 'Failed to add expense.'}</div>`;
      } else {
        const newExp = await res.json();
        expenses.push(newExp);
        renderTable();
        form.reset();
        document.getElementById('date').value = new Date().toISOString().split('T')[0];
        showToast('Expense added successfully.');
      }
    } catch {
      alertEl.innerHTML = `<div class="alert alert-error">Network error.</div>`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg> Add Expense`;
    }
  });
}

async function deleteExpense(id) {
  if (!confirm('Delete this expense?')) return;
  const res = await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
  if (res.ok) {
    expenses = expenses.filter(e => e.id !== id);
    renderTable();
    showToast('Expense deleted.');
  } else {
    showToast('Failed to delete expense.', 'error');
  }
}
