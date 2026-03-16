'use strict';

const COLORS = ['#10b981','#3b82f6','#c084fc','#fb923c','#f472b6','#94a3b8'];

(async () => {
  const user = await initApp('dashboard');
  if (!user) return;

  // Load dashboard data
  const res = await apiFetch('/dashboard');
  if (!res.ok) { showToast('Failed to load dashboard data.', 'error'); return; }
  const data = await res.json();

  renderStats(data);
  renderRecentExpenses(data.recentExpenses || []);
  renderChart(data.recentExpenses || []);
})();

function renderStats(d) {
  const grid = document.getElementById('statsGrid');
  const rate = Math.max(0, d.savingsRate || 0);
  const rateColor = rate >= 20 ? 'positive' : rate >= 10 ? '' : 'negative';

  grid.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(59,130,246,.12);color:#60a5fa">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="1" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      </div>
      <div class="stat-label">Monthly Income</div>
      <div class="stat-value">${fmt$(d.salary)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(239,68,68,.12);color:#f87171">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/></svg>
      </div>
      <div class="stat-label">Total Expenses</div>
      <div class="stat-value negative">${fmt$(d.totalExpenses)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(16,185,129,.12);color:#10b981">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      </div>
      <div class="stat-label">Net Savings</div>
      <div class="stat-value ${d.netSavings >= 0 ? 'positive' : 'negative'}">${fmt$(d.netSavings)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(168,85,247,.12);color:#c084fc">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
      </div>
      <div class="stat-label">Savings Rate</div>
      <div class="stat-value ${rateColor}">${rate.toFixed(1)}%</div>
      <div class="stat-sub">${rate >= 20 ? 'Excellent — keep it up!' : rate >= 10 ? 'Room for improvement' : 'Below target (20%)'}</div>
    </div>
  `;
}

function renderRecentExpenses(expenses) {
  const el = document.getElementById('recentTable');
  if (!expenses.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/></svg>
        </div>
        <h3>No expenses yet</h3>
        <p>Add expenses on the <a href="/expenses" style="color:var(--primary)">Expenses page</a>.</p>
      </div>`;
    return;
  }
  el.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Description</th><th>Category</th><th>Amount</th><th>Date</th></tr></thead>
        <tbody>
          ${expenses.map(e => `
            <tr>
              <td style="font-weight:500">${esc(e.description)}</td>
              <td>${categoryBadge(e.category)}</td>
              <td style="font-weight:600">${fmt$(e.amount)}</td>
              <td style="color:var(--muted)">${fmtDate(e.date)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderChart(expenses) {
  const canvas = document.getElementById('spendingChart');
  const empty  = document.getElementById('chartEmpty');
  if (!expenses.length) { canvas.style.display = 'none'; empty.style.display = 'block'; return; }

  const totals = {};
  expenses.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
  const labels = Object.keys(totals);
  const values = Object.values(totals);

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: COLORS, borderWidth: 0, hoverOffset: 4 }],
    },
    options: {
      cutout: '68%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 }, padding: 12 } },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${fmt$(ctx.raw)}`,
          },
        },
      },
    },
  });
}
