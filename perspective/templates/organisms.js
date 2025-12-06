// Atomic Design Templates - Organisms (complex UI sections)
import P from '../core.js';
import './molecules.js';

// Metrics panel (collection of metric cards)
P.reg('metrics-section', (p) => `
  <div class="p-metrics-section">
    ${p.title?P.render({type:'heading',props:{value:p.title,level:4}}):''}
    ${(p.metrics||[]).map(m => P.render({type:'metric-card',props:m})).join('')}
  </div>
`);

// Vessel group (row of vessels)
P.reg('vessel-group', (p) => `
  <div class="p-vessel-group">
    ${p.title?P.render({type:'heading',props:{value:p.title,level:4}}):''}
    <div class="p-vessel-row">
      ${(p.vessels||[]).map(v => P.render({type:p.mode==='mini'?'vessel-mini':p.mode==='3d'?'vessel3d':'vessel2d',props:v})).join('')}
    </div>
  </div>
`);

// Phase timeline
P.reg('phase-timeline', (p) => `
  <div class="p-phase-timeline">
    ${p.title?P.render({type:'heading',props:{value:p.title,level:4}}):''}
    <div class="p-phase-steps">
      ${(p.phases||[]).map((ph,i) => P.render({type:'phase-step',props:{...ph,num:i+1}})).join('')}
    </div>
  </div>
`);

// Status bar (row of LED statuses)
P.reg('status-bar', (p) => `
  <div class="p-status-bar">
    ${(p.items||[]).map(item => P.render({type:'led-status',props:item})).join('')}
  </div>
`);

// Fermenter card (complete fermenter display)
P.reg('fermenter-card', (p) => `
  <div class="p-fermenter-card ${p.status||'idle'}">
    <div class="p-fermenter-header">
      ${P.render({type:'text',props:{value:p.name,class:'name'}})}
      ${P.render({type:'indicator',props:{status:p.status==='ferm'?'on':p.status==='cond'?'pulse':'off'}})}
    </div>
    <div class="p-fermenter-tank">
      <div class="p-fermenter-body" style="--fill:${p.level||0}%"></div>
    </div>
    ${P.render({type:'text',props:{value:p.beer||'--',class:'beer'}})}
    <div class="p-fermenter-metrics">
      ${P.render({type:'metric-atom',props:{label:'Temp',value:p.temp,unit:'°F'}})}
      ${P.render({type:'metric-atom',props:{label:'SG',value:p.sg}})}
    </div>
    ${P.render({type:'labeled-bar',props:{label:'Progress',value:p.progress||0,min:0,max:100,color:'#0f0'}})}
  </div>
`);

// Data table
P.reg('data-table', (p) => {
  const cols = p.columns || [];
  const rows = p.data || [];
  return `
  <div class="p-data-table-wrap">
    ${p.title?P.render({type:'heading',props:{value:p.title,level:4}}):''}
    <table class="p-data-table">
      <thead><tr>${cols.map(c=>`<th>${c.header||c.field}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td>${r[c.field]||''}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
  </div>`;
});

// Alarm summary
P.reg('alarm-summary', (p) => `
  <div class="p-alarm-summary ${p.active?'active':''}">
    ${P.render({type:'indicator',props:{status:p.active?'on':'off',color:p.priority===1?'#f00':'#ffa500'}})}
    ${P.render({type:'text',props:{value:p.count||0,class:'count'}})}
    ${P.render({type:'text',props:{value:'Active Alarms',class:'label'}})}
  </div>
`);

export default P;
