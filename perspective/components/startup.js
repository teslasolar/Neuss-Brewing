// Startup Planning Components
import P from '../core.js';

// Executive summary
P.reg('exec-summary', (p) => `
  <div class="p-exec-summary">
    <div class="p-exec-name">${p.name||'Brewery'}</div>
    <div class="p-exec-concept">${p.concept||''}</div>
    <div class="p-exec-details">
      <span>Market: ${p.targetMarket||'--'}</span>
      <span>Funding: ${p.fundingNeeded||'--'}</span>
      <span>ROI: ${p.projectedROI||'--'}</span>
    </div>
    <div class="p-exec-status">${p.status||'Planning'}</div>
  </div>
`);

// Checklist
P.reg('checklist', (p) => `
  <div class="p-checklist">
    ${(p.items||[]).map(i => `
      <div class="p-check-item ${i.status||'pending'}">
        <span class="p-check-box"></span>
        <span class="p-check-text">${i.task||''}</span>
      </div>
    `).join('')}
  </div>
`);

// Decision card
P.reg('decision-card', (p) => `
  <div class="p-decision-card ${p.status||'pending'}">
    <span class="p-dec-title">${p.title||''}</span>
    <div class="p-dec-options">
      ${(p.options||[]).map(o => `<span class="p-dec-opt ${o===p.selected?'selected':''}">${o}</span>`).join('')}
    </div>
  </div>
`);

// Roadmap
P.reg('roadmap', (p) => `
  <div class="p-roadmap">
    ${(p.phases||[]).map(ph => `
      <div class="p-roadmap-phase ${ph.status||'pending'}">
        <div class="p-rm-header">
          <span class="p-rm-name">${ph.name||''}</span>
          <span class="p-rm-months">${ph.months||''}</span>
        </div>
        <div class="p-rm-items">${(ph.items||[]).map(i => `<span>${i}</span>`).join('')}</div>
      </div>
    `).join('')}
  </div>
`);

// Comparison table
P.reg('comparison-table', (p) => `
  <table class="p-comparison-table">
    <thead><tr>${(p.headers||[]).map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>
      ${(p.rows||[]).map(r => `
        <tr class="winner-${r.winner||'none'}">
          <td>${r.factor||''}</td>
          <td>${r.pa||''}</td>
          <td>${r.ca||''}</td>
          <td><span class="p-winner-badge ${r.winner}">${r.winner==='tie'?'TIE':r.winner?.toUpperCase()||''}</span></td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`);

// Site list
P.reg('site-list', (p) => `
  <div class="p-site-list">
    ${(p.sites||[]).map(s => `
      <div class="p-site-item">
        <div class="p-site-name">${s.name||''}</div>
        <div class="p-site-details">
          <span>${s.sqft||''} sqft</span>
          <span>${s.rent||''}</span>
        </div>
        <div class="p-site-pros">+ ${s.pros||''}</div>
        <div class="p-site-cons">- ${s.cons||''}</div>
      </div>
    `).join('')}
  </div>
`);

// Cost breakdown
P.reg('cost-breakdown', (p) => `
  <div class="p-cost-breakdown">
    <div class="p-cost-title">${p.title||''}</div>
    ${(p.items||[]).map(i => `
      <div class="p-cost-row">
        <span>${i.item||''}</span>
        <span>${i.cost||''}</span>
      </div>
    `).join('')}
    <div class="p-cost-total">
      <span>Total</span>
      <span>${p.total||''}</span>
    </div>
  </div>
`);

// BOM table
P.reg('bom-table', (p) => `
  <div class="p-bom-table">
    <table>
      <thead><tr><th>Item</th><th>Qty</th><th>Vendor</th><th>Cost</th></tr></thead>
      <tbody>
        ${(p.items||[]).map(i => `
          <tr><td>${i.item}</td><td>${i.qty}</td><td>${i.vendor}</td><td>${i.cost}</td></tr>
        `).join('')}
      </tbody>
      <tfoot><tr><td colspan="3">Subtotal</td><td>${p.subtotal||''}</td></tr></tfoot>
    </table>
  </div>
`);

// Layout select
P.reg('layout-select', (p) => `
  <div class="p-layout-select ${p.active?'active':''}">
    <div class="p-layout-name">${p.name||''}</div>
    <div class="p-layout-sqft">${p.sqft||''} sqft</div>
    <div class="p-layout-style">${p.style||''}</div>
  </div>
`);

// Facility map (2D)
P.reg('facility-map', (p) => `
  <div class="p-facility-map" style="aspect-ratio:${p.width||100}/${p.height||50}">
    ${(p.zones||[]).map(z => `
      <div class="p-zone" style="left:${z.x}%;top:${z.y}%;width:${z.w}%;height:${z.h}%;background:${z.color||'#666'}">
        <span>${z.name||''}</span>
      </div>
    `).join('')}
  </div>
`);

// 3D Factory placeholder
P.reg('factory-3d', (p) => `
  <div class="p-factory-3d">
    <div class="p-3d-viewport">
      <div class="p-3d-placeholder">3D Factory View - ${p.layout||'default'}</div>
      <div class="p-3d-equipment">
        ${(p.equipment||[]).map(e => `<div class="p-3d-item" title="${e.label}">${e.label}</div>`).join('')}
      </div>
    </div>
  </div>
`);

// Flow diagram
P.reg('flow-diagram', (p) => `
  <div class="p-flow-diagram">
    ${(p.nodes||[]).map((n,i) => `
      <div class="p-flow-node">
        <span class="p-flow-label">${n.label||''}</span>
        ${i < (p.nodes||[]).length - 1 ? '<span class="p-flow-arrow">→</span>' : ''}
      </div>
    `).join('')}
  </div>
`);

// Assembly line
P.reg('assembly-line', (p) => `
  <div class="p-assembly-line">
    <div class="p-asm-header">
      <span class="p-asm-name">${p.name||''}</span>
      <span class="p-asm-capacity">${p.capacity||''}</span>
    </div>
    <div class="p-asm-stations">
      ${(p.stations||[]).map(s => `
        <div class="p-asm-station ${s.status||'pending'}">
          <span class="p-asm-id">${s.id||''}</span>
          <span class="p-asm-sname">${s.name||''}</span>
          <span class="p-asm-time">${s.time||''}</span>
        </div>
      `).join('')}
    </div>
  </div>
`);

// Project Gantt
P.reg('project-gantt', (p) => `
  <div class="p-project-gantt">
    <div class="p-gantt-header">
      ${Array.from({length: p.months||12}, (_, i) => `<span>M${i+1}</span>`).join('')}
    </div>
    <div class="p-gantt-body">
      ${(p.tasks||[]).map(t => `
        <div class="p-gantt-row">
          <span class="p-gantt-task">${t.name||''}</span>
          <div class="p-gantt-bar ${t.status||'pending'}" style="left:${(t.start||0)/(p.months||12)*100}%;width:${(t.duration||1)/(p.months||12)*100}%"></div>
        </div>
      `).join('')}
    </div>
  </div>
`);

// Task list
P.reg('task-list', (p) => `
  <div class="p-task-list">
    ${(p.tasks||[]).map(t => `
      <div class="p-task-item ${t.status||'pending'}">
        <span class="p-task-check"></span>
        <span class="p-task-name">${t.task||''}</span>
        <span class="p-task-due">${t.due||''}</span>
      </div>
    `).join('')}
  </div>
`);

// Milestone list
P.reg('milestone-list', (p) => `
  <div class="p-milestone-list">
    ${(p.milestones||[]).map(m => `
      <div class="p-milestone ${m.status||'pending'}">
        <span class="p-ms-dot"></span>
        <span class="p-ms-name">${m.name||''}</span>
        <span class="p-ms-date">${m.date||''}</span>
      </div>
    `).join('')}
  </div>
`);

export default P;
