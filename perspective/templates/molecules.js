// Atomic Design Templates - Molecules (combinations of atoms)
import P from '../core.js';
import './atoms.js';

// Status LED with label
P.reg('led-status', (p) => `
  <div class="p-led-status">
    ${P.render({type:'indicator',props:{status:p.status,color:p.color}})}
    ${P.render({type:'text',props:{value:p.label}})}
  </div>
`);

// Metric card (styled container with label/value)
P.reg('metric-card', (p) => `
  <div class="p-metric-card">
    ${P.render({type:'metric-atom',props:{label:p.label,value:p.value,unit:p.unit,color:p.color,bind:p.bind}})}
  </div>
`);

// Bar with label and value
P.reg('labeled-bar', (p) => {
  const pct = Math.min(100, Math.max(0, ((p.value-p.min)/(p.max-p.min))*100));
  return `
  <div class="p-labeled-bar">
    <div class="p-bar-header">
      ${P.render({type:'text',props:{value:p.label,class:'label'}})}
      ${P.render({type:'value',props:{value:p.value,unit:p.unit}})}
    </div>
    <div class="p-bar-track"><div class="p-bar-fill" style="width:${pct}%;background:${p.color||'#0f0'}"></div></div>
  </div>`;
});

// Vessel mini (compact vessel display)
P.reg('vessel-mini', (p) => `
  <div class="p-vessel-mini">
    <div class="p-vessel-mini-body" style="--fill:${p.level||0}%;--color:${p.color||'#4a90e2'}"></div>
    ${P.render({type:'text',props:{value:p.name,class:'name'}})}
    ${P.render({type:'value',props:{value:p.temp,unit:'°'}})}
  </div>
`);

// Phase step
P.reg('phase-step', (p) => `
  <div class="p-phase-step ${p.status||'pending'}">
    ${P.render({type:'dot',props:{color:p.status==='active'?'#0f0':p.status==='done'?'#666':'#333'}})}
    ${P.render({type:'text',props:{value:p.name,class:'name'}})}
    ${p.detail?P.render({type:'text',props:{value:p.detail,class:'detail'}}):''}
  </div>
`);

// Button with icon
P.reg('icon-button', (p) => `
  <button class="p-icon-btn ${p.class||''}" onclick="${p.onClick||''}">
    ${p.icon?P.render({type:'icon',props:{name:p.icon}}):''}
    ${P.render({type:'text',props:{value:p.text}})}
  </button>
`);

export default P;
