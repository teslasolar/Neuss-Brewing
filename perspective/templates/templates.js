// Atomic Design Templates - Templates (page-level layouts)
import P from '../core.js';
import './organisms.js';

// App header template
P.reg('app-header', (p) => `
  <header class="p-app-header">
    ${P.render({type:'heading',props:{value:p.title||'SCADA',level:1}})}
    <div class="p-header-info">
      ${p.batch?`<span class="p-batch-tag">${p.batch}</span>`:''}
      ${p.recipe?P.render({type:'text',props:{value:p.recipe}}):''}
      ${p.state?P.render({type:'indicator',props:{status:p.state==='active'?'on':'off'}}):''}
    </div>
    ${p.children||''}
  </header>
`);

// App nav template
P.reg('app-nav', (p) => `
  <nav class="p-app-nav">
    ${(p.links||[]).map(l => `<a href="${l.href}" class="p-nav-link ${l.active?'active':''}">${l.label}</a>`).join('')}
  </nav>
`);

// App footer template
P.reg('app-footer', (p) => `
  <footer class="p-app-footer">
    ${P.render({type:'text',props:{value:p.text||''}})}
    ${P.render({type:'status-bar',props:{items:p.leds||[]}})}
  </footer>
`);

// Sidebar layout template
P.reg('sidebar-template', (p, ch) => `
  <div class="p-sidebar-template">
    <div class="p-main-content">${ch}</div>
    <aside class="p-sidebar" style="width:${p.sidebarWidth||'220px'}">
      ${typeof p.sidebar==='object'?P.render(p.sidebar):p.sidebar||''}
    </aside>
  </div>
`);

// Split layout template
P.reg('split-template', (p, ch) => `
  <div class="p-split-template" style="grid-template-columns:${p.split||'1fr 1fr'}">
    <div class="p-split-left">${p.left?P.render(p.left):''}</div>
    <div class="p-split-right">${p.right?P.render(p.right):''}</div>
  </div>
`);

// Dashboard template (header + nav + content + footer)
P.reg('dashboard-template', (p, ch) => `
  <div class="p-dashboard">
    ${P.render({type:'app-header',props:{title:p.title,batch:p.batch,recipe:p.recipe,state:p.state}})}
    ${P.render({type:'app-nav',props:{links:p.nav}})}
    <main class="p-dashboard-main">${ch}</main>
    ${P.render({type:'app-footer',props:{text:p.footer,leds:p.leds}})}
  </div>
`);

// Brewhouse template (specific layout for brewhouse screen)
P.reg('brewhouse-template', (p) => `
  ${P.render({type:'dashboard-template',props:{...p}},`
    ${P.render({type:'sidebar-template',props:{sidebarWidth:'200px',sidebar:{type:'phase-timeline',props:{title:'Brew Phases',phases:p.phases}}}},[
      P.render({type:'vessel-group',props:{title:'Vessels',vessels:p.vessels,mode:p.mode||'3d'}}),
      P.render({type:'card',props:{title:'Pumps & Valves'}},p.equipment||'')
    ].join(''))}
  `)}
`);

// Fermentation template
P.reg('fermentation-template', (p) => `
  ${P.render({type:'dashboard-template',props:{...p}},`
    <div class="p-fermenters-grid">
      ${(p.fermenters||[]).map(f => P.render({type:'fermenter-card',props:f})).join('')}
    </div>
  `)}
`);

// Overview template (main dashboard)
P.reg('overview-template', (p) => `
  ${P.render({type:'dashboard-template',props:{...p}},`
    ${P.render({type:'sidebar-template',props:{sidebarWidth:'220px',sidebar:{type:'metrics-section',props:{title:'Live Metrics',metrics:p.metrics}}}},[
      P.render({type:'vessel-group',props:{title:'Brewhouse',vessels:p.vessels,mode:p.mode||'3d'}}),
      P.render({type:'card',props:{title:'Active Fermenters'}},
        `<div class="p-mini-fermenters">${(p.fermenters||[]).slice(0,3).map(f =>
          P.render({type:'fermenter-card',props:f})
        ).join('')}</div>`
      )
    ].join(''))}
  `)}
`);

export default P;
