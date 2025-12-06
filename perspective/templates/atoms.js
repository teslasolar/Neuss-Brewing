// Atomic Design Templates - Atoms (smallest building blocks)
import P from '../core.js';

// Typography atoms
P.reg('text', (p) => `<span class="p-text ${p.class||''}" style="color:${p.color||'inherit'};font-size:${p.size||'inherit'}">${p.value||''}</span>`);
P.reg('heading', (p) => `<h${p.level||3} class="p-heading ${p.class||''}">${p.value||''}</h${p.level||3}>`);
P.reg('icon', (p) => `<i class="p-icon ${p.name||''}" style="color:${p.color||'inherit'}"></i>`);

// Status atoms
P.reg('indicator', (p) => `<span class="p-indicator ${p.status||'off'}" style="background:${p.color||''}"></span>`);
P.reg('dot', (p) => `<span class="p-dot" style="background:${p.color||'#666'};width:${p.size||8}px;height:${p.size||8}px"></span>`);

// Value display atoms
P.reg('value', (p) => `<span class="p-value" data-bind="${p.bind||''}" style="color:${p.color||'#0ff'}">${p.value||'--'}${p.unit||''}</span>`);
P.reg('unit', (p) => `<span class="p-unit">${p.value||''}</span>`);

// Metric atom (label + value)
P.reg('metric-atom', (p) => `
  <div class="p-metric-atom">
    <span class="p-metric-lbl">${p.label||''}</span>
    ${P.render({type:'value',props:{value:p.value,unit:p.unit,color:p.color,bind:p.bind}})}
  </div>
`);

export default P;
