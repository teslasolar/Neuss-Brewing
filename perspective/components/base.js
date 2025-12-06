// Base Components - Layout & Structure
import P from '../core.js';

// View - Root container
P.reg('view',(p,ch)=>`
  <div class="p-view ${p.class||''}" style="${p.style||''}">
    ${ch}
  </div>
`,{class:'',style:''});

// Flex container
P.reg('flex',(p,ch)=>`
  <div class="p-flex" style="display:flex;flex-direction:${p.dir||'row'};gap:${p.gap||'10px'};${p.style||''}">
    ${ch}
  </div>
`,{dir:'row',gap:'10px'});

// Grid container
P.reg('grid',(p,ch)=>`
  <div class="p-grid" style="display:grid;grid-template-columns:${p.cols||'1fr'};gap:${p.gap||'10px'};${p.style||''}">
    ${ch}
  </div>
`,{cols:'1fr',gap:'10px'});

// Card component
P.reg('card',(p,ch)=>`
  <div class="p-card ${p.class||''}" style="${p.style||''}">
    ${p.title?`<div class="p-card-title">${p.title}</div>`:''}
    <div class="p-card-body">${ch}</div>
  </div>
`,{title:'',class:''});

// Label
P.reg('label',(p)=>`
  <span class="p-label ${p.class||''}" style="color:${p.color||'inherit'};font-size:${p.size||'12px'};${p.style||''}">${p.text}</span>
`,{text:'',color:'inherit',size:'12px'});

// Value display with binding
P.reg('value',(p)=>`
  <span class="p-value ${p.class||''}" data-bind="${p.bind||''}" style="color:${p.color||'#0ff'};font-size:${p.size||'18px'};${p.style||''}">${p.value}${p.unit||''}</span>
`,{value:'--',unit:'',color:'#0ff',size:'18px'});

// Button
P.reg('button',(p)=>`
  <button class="p-btn ${p.variant||''}" onclick="${p.onClick||''}" style="${p.style||''}">${p.text}</button>
`,{text:'Button',variant:'',onClick:''});

// Icon
P.reg('icon',(p)=>`
  <span class="p-icon ${p.name}" style="color:${p.color||'inherit'};${p.style||''}"></span>
`,{name:'',color:'inherit'});

// Spacer
P.reg('spacer',(p)=>`
  <div style="flex:${p.flex||1};min-height:${p.h||'0'};min-width:${p.w||'0'}"></div>
`,{flex:1});

// Divider
P.reg('divider',(p)=>`
  <hr class="p-divider" style="border-color:${p.color||'#3d2418'};margin:${p.margin||'10px 0'}"/>
`,{color:'#3d2418'});

export default P;
