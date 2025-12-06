// Vessel Components - Tanks, Fermenters, etc.
import P from '../core.js';

// 2D Vessel (SVG)
P.reg('vessel2d',(p)=>{
  const fill=Math.min(100,Math.max(0,p.fill||0));
  const fillH=120*(fill/100);
  const fillY=120-fillH+20;
  const tmpClr=p.temp>p.hihi?'#f00':p.temp>p.hi?'#ffa500':p.temp<p.lo?'#00f':'#0f0';
  return`
  <svg class="p-vessel2d" viewBox="0 0 100 160" width="${p.width||80}" height="${p.height||130}">
    <rect x="10" y="20" width="80" height="120" fill="none" stroke="${p.stroke||'#3d2418'}" stroke-width="2" rx="4"/>
    <rect x="10" y="${fillY}" width="80" height="${fillH}" fill="${p.fillColor||'#4a90e2'}" opacity="0.6" rx="4"/>
    <text x="50" y="12" text-anchor="middle" fill="${p.labelColor||'#ffa500'}" font-size="11">${p.label||''}</text>
    <text x="50" y="85" text-anchor="middle" fill="${tmpClr}" font-size="14" font-weight="bold">${p.temp||'--'}°C</text>
    <text x="50" y="150" text-anchor="middle" fill="#888" font-size="10">${p.volume||'--'}L</text>
  </svg>`;
},{label:'',temp:0,volume:0,fill:0,fillColor:'#4a90e2',hi:80,hihi:90,lo:50});

// 3D Vessel (CSS)
P.reg('vessel3d',(p)=>{
  const fill=Math.min(100,Math.max(0,p.fill||0));
  return`
  <div class="p-vessel3d" style="width:${p.width||100}px">
    <div class="p-vessel3d-body">
      <div class="p-vessel3d-fill" style="height:${fill}%;background:${p.fillColor||'linear-gradient(180deg,#4a90e2,#2d5a8a)'}"></div>
      <div class="p-vessel3d-glass"></div>
    </div>
    <div class="p-vessel3d-label">${p.label||''}</div>
    <div class="p-vessel3d-temp" style="color:${p.temp>p.hi?'#ffa500':'#0f0'}">${p.temp||'--'}°C</div>
  </div>`;
},{label:'',temp:0,fill:0,hi:80});

// Fermenter (conical)
P.reg('fermenter',(p)=>{
  const fill=Math.min(100,Math.max(0,p.fill||0));
  return`
  <div class="p-fermenter ${p.active?'active':''} ${p.empty?'empty':''}">
    <div class="p-fermenter-header">
      <span class="p-fermenter-name">${p.name||'FV'}</span>
      <span class="p-fermenter-status ${p.status||'idle'}">${(p.status||'IDLE').toUpperCase()}</span>
    </div>
    <div class="p-fermenter-tank">
      <div class="p-fermenter-body">
        <div class="p-fermenter-fill" style="height:${fill}%"></div>
      </div>
      <div class="p-fermenter-cone"></div>
    </div>
    <div class="p-fermenter-beer">${p.beer||''}</div>
    <div class="p-fermenter-metrics">
      <div class="p-metric"><span class="p-metric-lbl">TMP</span><span class="p-metric-val">${p.temp||'--'}°C</span></div>
      <div class="p-metric"><span class="p-metric-lbl">SG</span><span class="p-metric-val">${p.sg||'--'}</span></div>
      <div class="p-metric"><span class="p-metric-lbl">PSI</span><span class="p-metric-val">${p.psi||'--'}</span></div>
      <div class="p-metric"><span class="p-metric-lbl">pH</span><span class="p-metric-val">${p.ph||'--'}</span></div>
    </div>
    ${p.progress!==undefined?`<div class="p-fermenter-progress"><div class="p-fermenter-progress-fill" style="width:${p.progress}%"></div></div>`:''}
    ${p.days?`<div class="p-fermenter-days">Day ${p.day||0}/${p.days}</div>`:''}
  </div>`;
},{name:'FV',status:'idle',fill:0,temp:0,sg:0,psi:0,ph:0});

// Pump
P.reg('pump',(p)=>`
  <div class="p-pump ${p.running?'running':''}" style="width:${p.size||40}px;height:${p.size||40}px">
    <div class="p-pump-body"></div>
    <div class="p-pump-blade"></div>
  </div>
`,{running:false,size:40});

// Valve
P.reg('valve',(p)=>`
  <div class="p-valve ${p.open?'open':'closed'}" style="width:${p.size||30}px">
    <svg viewBox="0 0 40 20">
      <polygon points="0,0 20,10 0,20" fill="${p.open?'#0f0':'#f00'}"/>
      <polygon points="40,0 20,10 40,20" fill="${p.open?'#0f0':'#f00'}"/>
    </svg>
  </div>
`,{open:false,size:30});

// Pipe
P.reg('pipe',(p)=>`
  <div class="p-pipe ${p.flow?'flow':''}" style="width:${p.length||50}px;height:${p.thickness||8}px;background:${p.flow?'#0ff':'#666'}"></div>
`,{flow:false,length:50,thickness:8});

export default P;
