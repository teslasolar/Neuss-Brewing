// Business Components for Brewery Operations
import P from '../core.js';

// Stat card with trend indicator
P.reg('stat-card', (p) => `
  <div class="p-stat-card">
    <div class="p-stat-title">${p.title||''}</div>
    <div class="p-stat-value" style="color:${p.color||'#0ff'}">${p.unit==='$'?'$':''}${p.value||'--'}${p.unit&&p.unit!=='$'?p.unit:''}</div>
    ${p.trend?`<div class="p-stat-trend ${p.trend.startsWith('+')?'up':'down'}">${p.trend}</div>`:''}
  </div>
`);

// Alert item with severity
P.reg('alert-item', (p) => `
  <div class="p-alert-item ${p.level||'info'}">
    <span class="p-alert-dot"></span>
    <span class="p-alert-text">${p.text||''}</span>
  </div>
`);

// Resource availability bar
P.reg('resource-bar', (p) => `
  <div class="p-resource-bar ${p.status||'available'}">
    <span class="p-resource-name">${p.name||''}</span>
    <span class="p-resource-status">${p.status==='in-use'?(p.batch||`${p.days}d`):p.status}</span>
  </div>
`);

// Queue item
P.reg('queue-item', (p) => `
  <div class="p-queue-item">
    <span class="p-queue-pri">${p.priority||'-'}</span>
    <span class="p-queue-recipe">${p.recipe||''}</span>
    <span class="p-queue-need">${p.need||''}</span>
  </div>
`);

// Account row for customers
P.reg('account-row', (p) => `
  <div class="p-account-row">
    <span class="p-account-name">${p.name||''}</span>
    <span class="p-account-ytd">${p.ytd||''}</span>
  </div>
`);

// Simple Gantt placeholder
P.reg('gantt', (p) => `
  <div class="p-gantt" style="height:80px;background:#1a0e08;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#666">
    <span>Gantt: ${p.weeks||4} week forecast</span>
  </div>
`);

export default P;
