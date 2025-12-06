// 🍺 Brewery SCADA - Main Application
import G2D from './gfx2d.js';
import G3D from './gfx3d.js';
import Tags from './tags.js';
import UDT from './udts.js';

// State
const S={mode:'2d',batch:null,vessels:[],alarms:[],scanMs:100};

// Initialize vessels
const initVessels=()=>{
  S.vessels=[
    {id:'HLT',nm:'Hot Liquor',tmp:75,vol:450,cap:500,fill:.9,st:0},
    {id:'MSH',nm:'Mash Tun',tmp:67,vol:380,cap:450,fill:.84,st:3},
    {id:'BK',nm:'Boil Kettle',tmp:100,vol:360,cap:450,fill:.8,st:5},
    {id:'WP',nm:'Whirlpool',tmp:82,vol:0,cap:400,fill:0,st:0}
  ];
};

// Render 2D view
const render2D=()=>{
  const svg=document.getElementById('svg2d');
  let h=G2D.css;
  S.vessels.forEach((v,i)=>{
    const x=50+i*180,y=80;
    h+=G2D.vsl(x,y,80,120,v.fill,v.st===5?'#ff6b35':'#4a90e2');
    h+=`<text x="${x+40}" y="60" text-anchor="middle" fill="#ffa500" font-size="12">${v.id}</text>`;
    h+=G2D.temp(x+20,y+140,v.tmp,v.st===5?102:80,60);
    h+=`<text x="${x+40}" y="${y+160}" text-anchor="middle" fill="#888" font-size="10">${v.vol}L</text>`;
  });
  // Pipes
  h+=G2D.pipe(130,140,230,140,1);
  h+=G2D.pipe(310,140,410,140,1);
  h+=G2D.pipe(490,140,590,140,0);
  // Pumps
  h+=G2D.pmp(180,140,1);
  h+=G2D.pmp(360,140,1);
  svg.innerHTML=h;
};

// Render 3D view
const render3D=()=>{
  const el=document.getElementById('vessels3d');
  el.innerHTML=S.vessels.map(v=>`
    <div class="vsl3d">
      <div class="vsl-body">
        <div class="vsl-fill" style="height:${v.fill*100}%"></div>
        <div class="vsl-glass"></div>
      </div>
      <div class="vsl-label">${v.id}</div>
      <div class="vsl-temp">${v.tmp}°C</div>
    </div>
  `).join('');
};

// Render metrics
const renderMetrics=()=>{
  const el=document.getElementById('metricsPanel');
  const metrics=[
    {lbl:'Boil Rate',val:'8.5%/hr'},
    {lbl:'pH',val:'5.2'},
    {lbl:'Flow Rate',val:(10+Math.random()*5).toFixed(1)+' L/min'},
    {lbl:'Pressure',val:'1.2 bar'},
    {lbl:'OG Target',val:'1.065'},
    {lbl:'IBU Target',val:'65'}
  ];
  el.innerHTML='<h3 style="color:#ff6b35;margin-bottom:10px">Live Metrics</h3>'+
    metrics.map(m=>`<div class="metric"><div class="metric-lbl">${m.lbl}</div><div class="metric-val">${m.val}</div></div>`).join('');
};

// Render status LEDs
const renderLeds=()=>{
  const el=document.getElementById('statusLeds');
  const leds=[
    {nm:'Brewhouse',st:'grn'},{nm:'Ferment',st:'grn'},{nm:'Glycol',st:'yel'},{nm:'CO2',st:'grn'}
  ];
  el.innerHTML=leds.map(l=>`<span><i class="led ${l.st}"></i>${l.nm}</span>`).join('');
};

// Update progress
const updateProgress=()=>{
  const fill=document.getElementById('progFill');
  const txt=document.getElementById('progText');
  let pct=parseInt(fill.style.width||'65');
  if(pct<100)pct++;
  fill.style.width=pct+'%';
  const min=Math.floor(pct*0.6);
  txt.textContent=`BOILING: ${min}/60 min`;
};

// Toggle 2D/3D mode
window.toggleMode=()=>{
  S.mode=S.mode==='2d'?'3d':'2d';
  document.getElementById('modeBtn').textContent=S.mode.toUpperCase();
  document.getElementById('view2d').classList.toggle('active',S.mode==='2d');
  document.getElementById('view3d').classList.toggle('active',S.mode==='3d');
};

// Scan loop
const scan=()=>{
  renderMetrics();
  setTimeout(scan,S.scanMs*10);
};

// Init
const init=()=>{
  console.log('🍺 Brewery SCADA Initialized');
  initVessels();
  render2D();
  render3D();
  renderMetrics();
  renderLeds();
  setInterval(updateProgress,3000);
  scan();
};

document.addEventListener('DOMContentLoaded',init);
