'use strict';

let selectedRisk = 'Medium';
let dashboardData = null;

(async () => {
  const user = await initApp('advisory');
  if (!user) return;

  // Load dashboard data for analysis
  try {
    const res = await apiFetch('/dashboard');
    if (res.ok) dashboardData = await res.json();
  } catch {}

  setupRiskButtons();
  setupForm();
})();

function setupRiskButtons() {
  const btns = document.querySelectorAll('.risk-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => { b.className = 'risk-btn'; });
      selectedRisk = btn.dataset.risk;
      btn.classList.add(`active-${selectedRisk.toLowerCase()}`);
    });
  });
}

function setupForm() {
  const form = document.getElementById('advisoryForm');
  const btn  = document.getElementById('generateBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Generating…';

    // Small delay for visual effect
    await new Promise(r => setTimeout(r, 1100));

    const savings = parseFloat(document.getElementById('totalSavings').value) || 0;
    const horizon = document.getElementById('horizon').value;
    const tips = generatePlan(savings, horizon);
    renderPlan(tips);

    btn.disabled = false;
    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg> Regenerate Plan`;
  });
}

function generatePlan(savings, horizon) {
  const tips = [];
  const salary = dashboardData?.salary || 0;
  const savingsRate = dashboardData?.savingsRate || 0;
  const expenses = dashboardData?.recentExpenses || [];

  const totals = {};
  expenses.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });

  // Risk-based strategy
  if (selectedRisk === 'Low') {
    tips.push({ type: 'info', icon: 'shield', title: 'Conservative Strategy Recommended', body: 'Focus on high-yield savings accounts, government bonds, and fixed deposits. Prioritise capital preservation over aggressive growth.' });
  } else if (selectedRisk === 'Medium') {
    tips.push({ type: 'info', icon: 'trending', title: 'Balanced Portfolio Approach', body: 'A blend of index funds (60%), bonds (30%), and cash equivalents (10%) suits your medium risk profile. Review quarterly and rebalance annually.' });
  } else {
    tips.push({ type: 'info', icon: 'star', title: 'Growth-Oriented Strategy', body: 'With high risk tolerance, consider equity-heavy portfolios (80%+ stocks), growth ETFs, and sector funds. Diversify across geographies to manage concentration risk.' });
  }

  // Horizon tip
  if (horizon === 'Less than 1 year') {
    tips.push({ type: 'warning', icon: 'alert', title: 'Short Horizon Alert', body: 'With less than 1 year, avoid volatile assets. Money-market funds and short-term bonds will protect your capital.' });
  } else if (horizon === '10+ years') {
    tips.push({ type: 'success', icon: 'check', title: 'Long Horizon Advantage', body: 'A 10+ year horizon gives you the power of compounding. Maximise contributions to tax-advantaged accounts and stay invested through market cycles.' });
  }

  // Savings rate
  if (salary > 0) {
    if (savingsRate < 20) {
      tips.push({ type: 'danger', icon: 'alert', title: 'Critical: Low Savings Rate', body: `Your savings rate is ${savingsRate.toFixed(1)}%. Before investing heavily, aim to save at least 20% of your income. Build a 3–6 month emergency fund first.` });
    } else {
      tips.push({ type: 'success', icon: 'check', title: 'Strong Savings Foundation', body: `You're saving ${savingsRate.toFixed(1)}% of your income — well above the 20% benchmark. This surplus is ready to be invested.` });
    }
  }

  // Food spending
  const foodPct = salary > 0 ? ((totals['Food'] || 0) / salary) * 100 : 0;
  if (foodPct > 30) {
    tips.push({ type: 'warning', icon: 'alert', title: 'High Food Spending', body: `Food costs represent ${foodPct.toFixed(1)}% of your salary. Reducing this to under 20% would free up significant capital for investment.` });
  }

  // Entertainment
  const entPct = salary > 0 ? ((totals['Entertainment'] || 0) / salary) * 100 : 0;
  if (entPct > 20) {
    tips.push({ type: 'warning', icon: 'alert', title: 'Entertainment Budget Alert', body: `Entertainment is ${entPct.toFixed(1)}% of your budget. Consider a monthly cap to redirect funds toward your stated goals.` });
  }

  // Emergency fund check
  if (savings > 0 && salary > 0 && savings < salary * 3) {
    tips.push({ type: 'info', icon: 'info', title: 'Build Your Emergency Fund First', body: `Your savings of ${fmt$(savings)} may be below 3 months of income (${fmt$(salary * 3)}). Prioritise an emergency buffer before aggressive investing.` });
  }

  return tips;
}

const ICONS = {
  shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  trending: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 7-7.5 7.5-4-4L2 18"/><path d="M16 7h6v6"/></svg>`,
  star: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
  alert: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,
  check: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
};

function renderPlan(tips) {
  const container = document.getElementById('planContainer');
  if (!tips.length) {
    container.innerHTML = `<div class="empty-state"><p style="color:var(--muted)">Add your expenses first to get tailored advice.</p></div>`;
    return;
  }
  container.innerHTML = tips.map(t => `
    <div class="tip-card tip-${t.type}">
      <div class="tip-icon">${ICONS[t.icon] || ICONS.info}</div>
      <div>
        <div class="tip-card-title">${esc(t.title)}</div>
        <div class="tip-card-body">${esc(t.body)}</div>
      </div>
    </div>`).join('');
}
