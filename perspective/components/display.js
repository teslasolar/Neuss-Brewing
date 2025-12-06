// Display Components - Gauges, Charts, Tables
import P from '../core.js';

// Gauge (radial)
P.reg('gauge',(p)=>{
  const pct=Math.min(100,Math.max(0,((p.value-p.min)/(p.max-p.min))*100));
  const clr=p.value>p.hi?'#f00':p.value<p.lo?'#00f':'#0f0';
  return`
  <div class="p-gauge" style="width:${p.size||80}px;height:${p.size||80}px">
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#333" stroke-width="8"/>
      <circle cx="50" cy="50" r="45" fill="none" stroke="${clr}" stroke-width="8"
        stroke-dasharray="${pct*2.83} 283" stroke-linecap="round" transform="rotate(-90 50 50)"/>
      <text x="50" y="45" text-anchor="middle" fill="#fff" font-size="14">${p.value}</text>
      <text x="50" y="60" text-anchor="middle" fill="#888" font-size="10">${p.unit||''}</text>
    </svg>
    ${p.label?`<div class="p-gauge-label">${p.label}</div>`:''}
  </div>`;
},{value:0,min:0,max:100,hi:80,lo:20,unit:'',size:80});

// Linear gauge (bar)
P.reg('bar',(p)=>{
  const pct=Math.min(100,Math.max(0,((p.value-p.min)/(p.max-p.min))*100));
  const clr=p.value>p.hi?'#f00':p.value<p.lo?'#00f':p.color||'#0f0';
  return`
  <div class="p-bar" style="width:${p.width||150}px">
    ${p.label?`<div class="p-bar-label">${p.label}</div>`:''}
    <div class="p-bar-track">
      <div class="p-bar-fill" style="width:${pct}%;background:${clr}"></div>
    </div>
    <div class="p-bar-value">${p.value}${p.unit||''}</div>
  </div>`;
},{value:0,min:0,max:100,hi:80,lo:20,unit:'',width:150});

// LED indicator
P.reg('led',(p)=>`
  <div class="p-led ${p.state||'off'}" style="background:${p.state==='on'?p.color||'#0f0':'#333'};width:${p.size||12}px;height:${p.size||12}px">
  </div>
`,{state:'off',color:'#0f0',size:12});

// Status badge
P.reg('badge',(p)=>{
  const colors={ok:'#0f0',warn:'#ffa500',error:'#f00',info:'#0ff',idle:'#666'};
  return`<span class="p-badge" style="background:${colors[p.type]||p.color||'#666'}">${p.text||p.type}</span>`;
},{type:'idle',text:''});

// Table
P.reg('table',(p)=>{
  const cols=p.columns||[];
  const rows=p.data||[];
  return`
  <table class="p-table ${p.class||''}">
    <thead><tr>${cols.map(c=>`<th>${c.header||c.field}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td>${r[c.field]||''}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;
},{columns:[],data:[]});

// Trend/Sparkline
P.reg('trend',(p)=>{
  const pts=p.data||[];
  if(!pts.length)return'<div class="p-trend-empty">No data</div>';
  const max=Math.max(...pts),min=Math.min(...pts);
  const h=p.height||40,w=p.width||120;
  const path=pts.map((v,i)=>{
    const x=(i/(pts.length-1))*w;
    const y=h-((v-min)/(max-min||1))*h;
    return`${i===0?'M':'L'}${x},${y}`;
  }).join(' ');
  return`
  <svg class="p-trend" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <path d="${path}" fill="none" stroke="${p.color||'#0ff'}" stroke-width="2"/>
  </svg>`;
},{data:[],width:120,height:40,color:'#0ff'});

// Progress bar
P.reg('progress',(p)=>`
  <div class="p-progress" style="width:${p.width||'100%'}">
    <div class="p-progress-track">
      <div class="p-progress-fill" style="width:${p.value||0}%;background:${p.color||'linear-gradient(90deg,#ff6b35,#ffa500)'}">
        ${p.showText?`<span>${p.text||p.value+'%'}</span>`:''}
      </div>
    </div>
  </div>
`,{value:0,width:'100%',showText:true});

// Alarm banner
P.reg('alarm',(p)=>`
  <div class="p-alarm ${p.active?'active':''} pri-${p.priority||2}">
    <span class="p-alarm-icon">⚠</span>
    <span class="p-alarm-msg">${p.message||'Alarm'}</span>
    <span class="p-alarm-tag">${p.tag||''}</span>
  </div>
`,{active:false,priority:2,message:'',tag:''});

export default P;
