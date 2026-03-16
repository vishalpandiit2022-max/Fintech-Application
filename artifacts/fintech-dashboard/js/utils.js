'use strict';

const API = '/api';

/* ---- Sidebar HTML ---- */
const SIDEBAR_HTML = `
<aside class="sidebar" id="sidebar">
  <div class="sidebar-brand">
    <div class="sidebar-logo">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
    </div>
    <span class="sidebar-title">FinTech</span>
  </div>
  <div class="sidebar-user" id="sidebarUser">
    <div class="sidebar-user-card">
      <div class="skeleton" style="width:34px;height:34px;border-radius:50%;flex-shrink:0"></div>
      <div style="flex:1">
        <div class="skeleton" style="width:80%;height:11px;margin-bottom:6px;border-radius:4px"></div>
        <div class="skeleton" style="width:55%;height:10px;border-radius:4px"></div>
      </div>
    </div>
  </div>
  <nav class="sidebar-nav">
    <a href="/dashboard" class="nav-item" data-page="dashboard">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
      <span>Dashboard</span>
    </a>
    <a href="/expenses" class="nav-item" data-page="expenses">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>
      <span>Expenses</span>
    </a>
    <a href="/savings" class="nav-item" data-page="savings">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
      <span>Savings Goals</span>
    </a>
    <a href="/advisory" class="nav-item" data-page="advisory">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
      <span>AI Advisory</span>
    </a>
    <a href="/profile" class="nav-item" data-page="profile">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
      <span>Profile</span>
    </a>
  </nav>
  <div class="sidebar-footer">
    <button class="nav-item logout-btn" id="logoutBtn">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
      <span>Logout</span>
    </button>
  </div>
</aside>
<div class="sidebar-overlay" id="sidebarOverlay"></div>
`;

/* ---- Utilities ---- */
function fmt$(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);
}
function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s);
  return isNaN(d) ? s : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function esc(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}
function categoryBadge(cat) {
  const cls = { Food:'food', Transport:'transport', Shopping:'shopping', Bills:'bills', Entertainment:'entertainment', Other:'other' };
  return `<span class="badge badge-${cls[cat]||'other'}">${esc(cat)}</span>`;
}

function showToast(msg, type = 'success') {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('toast-show'));
  setTimeout(() => { t.classList.remove('toast-show'); setTimeout(() => t.remove(), 300); }, 3200);
}

async function apiFetch(path, opts = {}) {
  const o = { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...opts };
  if (o.body && typeof o.body === 'object') o.body = JSON.stringify(o.body);
  return fetch(API + path, o);
}

async function logout() {
  const btn = document.getElementById('logoutBtn');
  if (btn) btn.style.opacity = '.5';
  await apiFetch('/auth/logout', { method: 'POST' });
  window.location.href = '/login';
}

/* ---- Sidebar / Auth ---- */
function initSidebar(pageId) {
  const root = document.getElementById('sidebar-root');
  if (!root) return;
  root.innerHTML = SIDEBAR_HTML;

  const active = root.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (active) active.classList.add('active');

  document.getElementById('logoutBtn').addEventListener('click', logout);

  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebarOverlay');
  const toggle   = document.getElementById('mobileToggle');

  if (toggle) toggle.addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('show'); });
  if (overlay) overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); });
}

async function loadUser() {
  try {
    const res = await apiFetch('/auth/me');
    if (!res.ok) { window.location.href = '/login'; return null; }
    return await res.json();
  } catch { window.location.href = '/login'; return null; }
}

async function initApp(pageId) {
  initSidebar(pageId);
  const user = await loadUser();
  if (!user) return null;

  const el = document.getElementById('sidebarUser');
  if (el) {
    el.innerHTML = `
      <div class="sidebar-user-card">
        <div class="avatar">${esc(user.name[0].toUpperCase())}</div>
        <div>
          <div class="sidebar-user-name">${esc(user.name)}</div>
          <div class="sidebar-user-salary">${fmt$(user.salary)}/mo</div>
        </div>
      </div>`;
  }
  return user;
}
