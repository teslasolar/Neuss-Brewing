// Component Index - Import all components
import P from '../core.js';
import './base.js';
import './vessel.js';
import './display.js';
import './input.js';
import './python.js';
import './business.js';
import './controls.js';
import './science.js';
import './isa95.js';

// Page template components (atomic structure)

// Header - reusable page header
P.reg('header',(p,ch)=>`
  <header class="p-header">
    <h1 class="p-header-title">${p.title||'SCADA'}</h1>
    ${p.batch?`<div class="p-header-batch"><span class="p-batch-id">${p.batch}</span><span class="p-batch-recipe">${p.recipe||''}</span><span class="p-batch-state ${p.state||''}">${(p.state||'').toUpperCase()}</span></div>`:''}
    ${ch}
  </header>
`,{title:'SCADA'});

// Nav - navigation bar
P.reg('nav',(p)=>{
  const links=p.links||[];
  return`
  <nav class="p-nav">
    ${links.map(l=>`<a href="${l.href}" class="p-nav-link ${l.active?'active':''}">${l.label}</a>`).join('')}
  </nav>`;
},{links:[]});

// Footer - page footer with status
P.reg('footer',(p)=>`
  <footer class="p-footer">
    <span class="p-footer-text">${p.text||''}</span>
    <div class="p-footer-leds">
      ${(p.leds||[]).map(l=>`<span class="p-led-wrap"><i class="p-led ${l.state||'off'}"></i>${l.label}</span>`).join('')}
    </div>
  </footer>
`,{text:'',leds:[]});

// Page - full page template
P.reg('page',(p,ch)=>`
  <div class="p-page">
    ${P.render({type:'header',props:{title:p.title,batch:p.batch,recipe:p.recipe,state:p.state}})}
    ${P.render({type:'nav',props:{links:p.nav}})}
    <main class="p-main">${ch}</main>
    ${P.render({type:'footer',props:{text:p.footer,leds:p.leds}})}
  </div>
`,{title:'',nav:[],footer:'',leds:[]});

// Sidebar layout
P.reg('sidebar-layout',(p,ch)=>`
  <div class="p-sidebar-layout">
    <main class="p-sidebar-main">${ch}</main>
    <aside class="p-sidebar" style="width:${p.width||'220px'}">${p.sidebar||''}</aside>
  </div>
`,{width:'220px',sidebar:''});

// Metrics panel
P.reg('metrics-panel',(p)=>{
  const metrics=p.metrics||[];
  return`
  <div class="p-metrics-panel">
    <h3 class="p-metrics-title">${p.title||'Metrics'}</h3>
    ${metrics.map(m=>`
      <div class="p-metric-card">
        <div class="p-metric-lbl">${m.label}</div>
        <div class="p-metric-val" style="color:${m.color||'#0ff'}" data-bind="${m.bind||''}">${m.value}${m.unit||''}</div>
      </div>
    `).join('')}
  </div>`;
},{title:'Metrics',metrics:[]});

// Vessel row
P.reg('vessel-row',(p)=>{
  const vessels=p.vessels||[];
  return`
  <div class="p-vessel-row">
    ${vessels.map(v=>P.render({type:p.mode==='3d'?'vessel3d':'vessel2d',props:v})).join('')}
  </div>`;
},{vessels:[],mode:'2d'});

// Phase list
P.reg('phase-list',(p)=>{
  const phases=p.phases||[];
  return`
  <div class="p-phase-list">
    ${p.title?`<h4 class="p-phase-title">${p.title}</h4>`:''}
    ${phases.map((ph,i)=>`
      <div class="p-phase ${ph.status||'pending'}">
        <span class="p-phase-num">${i+1}</span>
        <span class="p-phase-name">${ph.name}</span>
        <span class="p-phase-detail">${ph.detail||''}</span>
      </div>
    `).join('')}
  </div>`;
},{phases:[],title:''});

// Export
export default P;
