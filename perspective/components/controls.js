// Controls & Automation Components
import P from '../core.js';

// PID Loop faceplate
P.reg('pid-loop', (p) => `
  <div class="p-pid-loop ${p.mode||'auto'}">
    <div class="p-pid-header">
      <span class="p-pid-name">${p.name||''}</span>
      <span class="p-pid-tag">${p.tag||''}</span>
      <span class="p-pid-mode ${p.mode}">${(p.mode||'auto').toUpperCase()}</span>
    </div>
    <div class="p-pid-display">
      <div class="p-pid-pv"><span class="lbl">PV</span><span class="val">${p.pv||'--'}</span></div>
      <div class="p-pid-sp"><span class="lbl">SP</span><span class="val">${p.sp||'--'}</span></div>
      <div class="p-pid-out"><span class="lbl">OUT</span><span class="val">${p.out||'--'}%</span></div>
    </div>
    <div class="p-pid-bar"><div class="p-pid-fill" style="width:${p.out||0}%"></div></div>
    <div class="p-pid-params">
      <span>Kp:${p.kp||0}</span><span>Ki:${p.ki||0}</span><span>Kd:${p.kd||0}</span>
    </div>
  </div>
`);

// I/O Table
P.reg('io-table', (p) => {
  const ch = p.channels || [];
  return `
  <table class="p-io-table">
    <thead><tr><th>Addr</th><th>Tag</th><th>Desc</th><th>Raw</th><th>Eng</th><th></th></tr></thead>
    <tbody>${ch.map(c => `
      <tr class="${c.status||'ok'}">
        <td>${c.addr}</td><td class="tag">${c.tag}</td><td>${c.desc}</td>
        <td class="raw">${c.raw}</td><td class="eng">${c.eng}</td>
        <td><span class="p-io-status ${c.status}"></span></td>
      </tr>
    `).join('')}</tbody>
  </table>`;
});

// Digital I/O grid
P.reg('dio-grid', (p) => `
  <div class="p-dio-grid">
    <div class="p-dio-section"><div class="p-dio-lbl">DI</div>
      ${(p.inputs||[]).map(i => `<span class="p-dio ${i.state?'on':'off'}" title="${i.tag}">${i.tag}</span>`).join('')}
    </div>
    <div class="p-dio-section"><div class="p-dio-lbl">DO</div>
      ${(p.outputs||[]).map(o => `<span class="p-dio ${o.state?'on':'off'}" title="${o.tag}">${o.tag}</span>`).join('')}
    </div>
  </div>
`);

// Comms status
P.reg('comms-status', (p) => `
  <div class="p-comms-status ${p.status||'ok'}">
    <span class="p-comms-dot"></span>
    <span class="p-comms-name">${p.name}</span>
    <span class="p-comms-proto">${p.protocol}</span>
    <span class="p-comms-latency">${p.latency}</span>
  </div>
`);

// Alarm stat box
P.reg('alarm-stat', (p) => `
  <div class="p-alarm-stat" style="border-color:${p.color}">
    <div class="p-alarm-count" style="color:${p.color}">${p.count||0}</div>
    <div class="p-alarm-label">${p.title}</div>
  </div>
`);

// Alarm list
P.reg('alarm-list', (p) => {
  const alms = p.alarms || [];
  return `
  <div class="p-alarm-list">
    ${alms.map(a => `
      <div class="p-alarm-row pri-${a.priority} ${a.state}">
        <span class="p-alarm-time">${a.time}</span>
        <span class="p-alarm-tag">${a.tag}</span>
        <span class="p-alarm-desc">${a.desc}</span>
        <span class="p-alarm-val">${a.value} (${a.limit})</span>
        <button class="p-alarm-ack">${a.state==='ack'?'ACKD':'ACK'}</button>
      </div>
    `).join('')}
  </div>`;
});

// Historian trend placeholder
P.reg('historian-trend', (p) => `
  <div class="p-historian-trend">
    <div class="p-trend-legend">
      ${(p.pens||[]).map(pen => `<span class="p-pen" style="color:${pen.color}">${pen.tag}</span>`).join('')}
    </div>
    <div class="p-trend-chart" style="height:200px;background:#0d0704;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#666">
      <span>Trend: ${p.timeRange||'24h'}</span>
    </div>
  </div>
`);

// Batch timeline
P.reg('batch-timeline', (p) => `
  <div class="p-batch-timeline">
    ${(p.phases||[]).map(ph => `
      <div class="p-timeline-phase ${ph.status}">
        <span class="p-phase-name">${ph.name}</span>
        <span class="p-phase-time">${ph.start}-${ph.end}</span>
      </div>
    `).join('')}
  </div>
`);

// Tag tree
P.reg('tag-tree', (p) => `
  <div class="p-tag-tree">
    ${(p.nodes||[]).map(n => `
      <div class="p-tree-node">
        <span class="p-tree-folder">${n.name}</span>
        <div class="p-tree-children">${(n.children||[]).map(c => `<span class="p-tree-tag">${c}</span>`).join('')}</div>
      </div>
    `).join('')}
  </div>
`);

// Calc row (label: value)
P.reg('calc-row', (p) => `
  <div class="p-calc-row">
    <span class="p-calc-lbl">${p.label}</span>
    <span class="p-calc-val">${p.value}</span>
  </div>
`);

export default P;
