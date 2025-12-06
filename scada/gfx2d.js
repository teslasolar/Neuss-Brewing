// 🎨 2D SVG Graphics Library - Brewery Equipment
const G2D={
  // Vessel (tank/kettle/fermenter)
  vsl:(x,y,w=80,h=120,fill=0,clr='#4a90e2')=>`
    <g transform="translate(${x},${y})">
      <rect width="${w}" height="${h}" fill="none" stroke="#3d2418" stroke-width="2" rx="4"/>
      <rect y="${h*(1-fill)}" width="${w}" height="${h*fill}" fill="${clr}" opacity="0.6" rx="4"/>
      <ellipse cx="${w/2}" cy="8" rx="${w/2-2}" ry="6" fill="none" stroke="#3d2418"/>
    </g>`,
  // Valve
  vlv:(x,y,open=0,sz=20)=>`
    <g transform="translate(${x},${y})">
      <polygon points="0,0 ${sz},${sz/2} 0,${sz}" fill="${open?'#0f0':'#f00'}"/>
      <polygon points="${sz},0 ${sz*2},${sz/2} ${sz},${sz}" fill="${open?'#0f0':'#f00'}"/>
    </g>`,
  // Pump
  pmp:(x,y,run=0,sz=30)=>`
    <g transform="translate(${x},${y})">
      <circle r="${sz/2}" fill="${run?'#0f0':'#666'}" stroke="#333" stroke-width="2"/>
      <path d="M-8,-8 L8,8 M-8,8 L8,-8" stroke="#fff" stroke-width="2" ${run?'class="spin"':''}/>
    </g>`,
  // Pipe
  pipe:(x1,y1,x2,y2,flow=0)=>`
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${flow?'#0ff':'#666'}" stroke-width="4"/>`,
  // Gauge
  gauge:(x,y,val,max,eu,r=25)=>`
    <g transform="translate(${x},${y})">
      <circle r="${r}" fill="#1a1a1a" stroke="#3d2418" stroke-width="2"/>
      <path d="M0,0 L${Math.sin(val/max*Math.PI-Math.PI/2)*r*0.7},${-Math.cos(val/max*Math.PI-Math.PI/2)*r*0.7}" stroke="#f00" stroke-width="2"/>
      <text y="${r+12}" text-anchor="middle" fill="#fff" font-size="10">${val}${eu}</text>
    </g>`,
  // Temperature indicator
  temp:(x,y,val,hi,lo)=>{
    const clr=val>hi?'#f00':val<lo?'#00f':'#0f0';
    return`<text x="${x}" y="${y}" fill="${clr}" font-size="18" font-weight="bold">${val}°C</text>`;
  },
  // Alarm indicator
  alm:(x,y,active=0)=>`
    <circle cx="${x}" cy="${y}" r="8" fill="${active?'#f00':'#333'}" ${active?'class="blink"':''}/>`,
  // CSS animations
  css:`<style>.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.blink{animation:blink .5s infinite}@keyframes blink{50%{opacity:.3}}</style>`
};
export default G2D;
