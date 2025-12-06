// ISA-95 Level Components
import P from '../core.js';

// Batch status display
P.reg('batch-status', (p) => `
  <div class="p-batch-status ${p.state?.toLowerCase()||'idle'}">
    <div class="p-bs-header">
      <span class="p-bs-id">${p.id||''}</span>
      <span class="p-bs-state">${p.state||'IDLE'}</span>
    </div>
    <div class="p-bs-recipe">${p.recipe||''}</div>
    <div class="p-bs-unit">Unit: ${p.unit||'--'}</div>
    <div class="p-bs-phase">Phase: <b>${p.phase||'--'}</b></div>
    <div class="p-bs-step">Step: ${p.step||'--'}</div>
    <div class="p-bs-time">
      <span>Elapsed: ${p.elapsed||'--'}</span>
      <span>Remain: ${p.remaining||'--'}</span>
    </div>
  </div>
`);

// ISA-88 Procedure tree
P.reg('procedure-tree', (p) => `
  <div class="p-procedure-tree">
    <div class="p-proc-name">${p.procedure||'Procedure'}</div>
    ${(p.unitProcedures||[]).map(up => `
      <div class="p-unit-proc ${up.status||'pending'}">
        <span class="p-up-name">${up.name}</span>
        <div class="p-up-ops">${(up.operations||[]).map(op => `<span class="p-op">${op}</span>`).join('')}</div>
      </div>
    `).join('')}
  </div>
`);

// SFC Viewer
P.reg('sfc-viewer', (p) => `
  <div class="p-sfc-viewer">
    ${(p.steps||[]).map(s => `
      <div class="p-sfc-step ${s.status||'pending'}">
        <span class="p-sfc-num">${s.num}</span>
        <span class="p-sfc-name">${s.name}</span>
        ${s.timer?`<span class="p-sfc-timer">${s.timer}</span>`:''}
      </div>
    `).join('')}
  </div>
`);

// Sequence status
P.reg('sequence-status', (p) => `
  <div class="p-seq-status ${p.state?.toLowerCase()||'idle'}">
    <div class="p-seq-header">
      <span class="p-seq-name">${p.name||''}</span>
      <span class="p-seq-state">${p.state||'IDLE'}</span>
    </div>
    <div class="p-seq-progress">Step ${p.step||0}/${p.total||0}</div>
    <div class="p-seq-bar"><div class="p-seq-fill" style="width:${((p.step||0)/(p.total||1))*100}%"></div></div>
    <div class="p-seq-desc">${p.desc||''}</div>
  </div>
`);

// Condition row
P.reg('condition-row', (p) => `
  <div class="p-cond-row ${p.status?'true':'false'}">
    <span class="p-cond-dot"></span>
    <span class="p-cond-text">${p.cond||''}</span>
  </div>
`);

// Interlock row
P.reg('interlock-row', (p) => `
  <div class="p-ilk-row ${p.status||'ok'}">
    <span class="p-ilk-icon"></span>
    <span class="p-ilk-name">${p.name||''}</span>
  </div>
`);

// PLC card
P.reg('plc-card', (p) => `
  <div class="p-plc-card ${p.status?.toLowerCase()||'stop'}">
    <div class="p-plc-header">
      <span class="p-plc-name">${p.name||''}</span>
      <span class="p-plc-status">${p.status||'STOP'}</span>
    </div>
    <div class="p-plc-model">${p.model||''}</div>
    <div class="p-plc-ip">${p.ip||''}</div>
    <div class="p-plc-metrics">
      <span>CPU: ${p.cpu||0}%</span>
      <span>Mem: ${p.mem||0}%</span>
      <span>Scan: ${p.scanTime||'--'}</span>
    </div>
    <div class="p-plc-faults">Faults: ${p.faults||0}</div>
  </div>
`);

// OEE Gauge
P.reg('oee-gauge', (p) => {
  const color = p.value >= p.target ? '#0f0' : p.value >= p.target*0.9 ? '#ffa500' : '#f00';
  return `
  <div class="p-oee-gauge">
    <div class="p-oee-circle" style="--pct:${p.value||0};--color:${color}">
      <span class="p-oee-val">${p.value||0}%</span>
    </div>
    <div class="p-oee-label">${p.label||''}</div>
    <div class="p-oee-target">Target: ${p.target||0}%</div>
  </div>`;
});

// Sensor health
P.reg('sensor-health', (p) => `
  <div class="p-sensor-health ${p.fault?'fault':'ok'}">
    <span class="p-sh-tag">${p.tag||''}</span>
    <span class="p-sh-sig">Sig: ${p.signal||0}%</span>
    <span class="p-sh-noise">Noise: ${p.noise||0}%</span>
    <span class="p-sh-drift">Drift: ${p.drift||0}</span>
  </div>
`);

// Device row
P.reg('device-row', (p) => `
  <div class="p-device-row">
    <span class="p-dev-tag">${p.tag||''}</span>
    <span class="p-dev-desc">${p.desc||''}</span>
    <span class="p-dev-status ${(p.status||'').toLowerCase()}">${p.status||''}</span>
    <span class="p-dev-health" style="color:${p.health>=90?'#0f0':p.health>=70?'#ffa500':'#f00'}">${p.health||0}%</span>
  </div>
`);

// Material item
P.reg('material-item', (p) => `
  <div class="p-material-item ${p.status||'pending'}">
    <span class="p-mat-name">${p.name||''}</span>
    <span class="p-mat-qty">${p.qty||''}</span>
    <span class="p-mat-status">${p.status||''}</span>
  </div>
`);

// Event log
P.reg('event-log', (p) => `
  <div class="p-event-log">
    ${(p.events||[]).map(e => `
      <div class="p-event-row">
        <span class="p-evt-time">${e.time||''}</span>
        <span class="p-evt-text">${e.event||''}</span>
      </div>
    `).join('')}
  </div>
`);

// Schedule Gantt placeholder
P.reg('schedule-gantt', (p) => `
  <div class="p-sched-gantt">
    <div class="p-gantt-header">Schedule Gantt - ${(p.units||[]).length} units</div>
    <div class="p-gantt-chart" style="height:150px;background:#0d0704;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#666">
      <span>Week View Gantt</span>
    </div>
  </div>
`);

// Cal wizard placeholder
P.reg('cal-wizard', (p) => `
  <div class="p-cal-wizard">
    <div class="p-cal-sensor">${p.sensor} (${p.type})</div>
    <div class="p-cal-steps">
      ${(p.steps||[]).map((s,i) => `<span class="p-cal-step ${i<p.step?'done':i===p.step?'active':'pending'}">${i+1}. ${s}</span>`).join('')}
    </div>
    <div class="p-cal-current">
      <div>Reference: ${p.currentRef}</div>
      <div>Reading: ${p.currentRead}</div>
      <div>Offset: ${p.offset}</div>
    </div>
  </div>
`);

// Network diagram placeholder
P.reg('network-diagram', (p) => `
  <div class="p-network-diagram" style="height:120px;background:#0d0704;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#666">
    <span>Network Topology (${(p.nodes||[]).length} nodes)</span>
  </div>
`);

// ISA-95 Level navigation card
P.reg('level-card', (p) => `
  <div class="p-level-card" style="border-left:4px solid ${p.color||'#666'}">
    <div class="p-level-header">
      <span class="p-level-num" style="background:${p.color||'#666'}">L${p.level}</span>
      <span class="p-level-name">${p.name||''}</span>
    </div>
    <div class="p-level-desc">${p.desc||''}</div>
    <div class="p-level-links">
      ${(p.links||[]).map(l => `<a href="${l.href}" class="p-level-link">${l.label}</a>`).join('')}
    </div>
  </div>
`);

export default P;
