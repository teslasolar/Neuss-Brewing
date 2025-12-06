// 🎲 3D CSS Graphics Library - Brewery Equipment
const G3D={
  // 3D vessel with CSS transforms
  vsl:(id,fill=0.5,tmp=20)=>`
    <div class="vsl3d" id="${id}">
      <div class="vsl-body">
        <div class="vsl-fill" style="height:${fill*100}%"></div>
        <div class="vsl-glass"></div>
      </div>
      <div class="vsl-top"></div>
      <div class="vsl-label">${id}<br>${tmp}°C</div>
    </div>`,
  // 3D pipe connector
  pipe:(dir='h')=>`<div class="pipe3d ${dir}"><div class="flow"></div></div>`,
  // 3D pump
  pmp:(id,run=0)=>`
    <div class="pmp3d ${run?'running':''}" id="${id}">
      <div class="pmp-body"></div>
      <div class="pmp-blade"></div>
    </div>`,
  // 3D gauge
  gauge:(id,val,max,eu)=>`
    <div class="gauge3d" id="${id}">
      <div class="gauge-ring">
        <div class="gauge-fill" style="--pct:${val/max}"></div>
      </div>
      <span class="gauge-val">${val}${eu}</span>
    </div>`,
  // Cube display (8 vertices + center)
  cube:(id,data)=>`
    <div class="brew-cube" id="${id}">
      <div class="cube-face front">${data.TMP||'-'}°C</div>
      <div class="cube-face back">${data.PRS||'-'}psi</div>
      <div class="cube-face left">pH ${data.PH||'-'}</div>
      <div class="cube-face right">${data.LVL||'-'}L</div>
      <div class="cube-face top">${data.SG||'-'}</div>
      <div class="cube-face bottom">${id}</div>
    </div>`,
  // CSS for 3D
  css:`<style>
.vsl3d{perspective:500px;width:80px;text-align:center}
.vsl-body{width:60px;height:100px;background:linear-gradient(90deg,#2a2a2a,#4a4a4a,#2a2a2a);border-radius:8px;position:relative;overflow:hidden;transform:rotateY(-15deg);margin:0 auto}
.vsl-fill{position:absolute;bottom:0;width:100%;background:linear-gradient(180deg,#4a90e2,#2d5a8a);transition:height .5s}
.vsl-glass{position:absolute;inset:0;background:linear-gradient(90deg,transparent 30%,rgba(255,255,255,.1) 50%,transparent 70%)}
.vsl-top{width:50px;height:15px;background:#3a3a3a;border-radius:50%;margin:-5px auto 0;transform:rotateX(60deg)}
.vsl-label{font-size:11px;margin-top:5px;color:#ffa500}
.pipe3d{background:linear-gradient(180deg,#555,#333,#555);border-radius:4px}.pipe3d.h{width:40px;height:12px}.pipe3d.v{width:12px;height:40px}
.flow{height:100%;width:30%;background:#0ff;animation:flow 1s linear infinite;border-radius:4px}@keyframes flow{to{transform:translateX(200%)}}
.pmp3d{width:40px;height:40px;position:relative}.pmp-body{width:100%;height:100%;background:radial-gradient(#4a4a4a,#2a2a2a);border-radius:50%;border:2px solid #666}.pmp-blade{position:absolute;inset:5px;border:3px solid #888;border-radius:50%;border-top-color:transparent}.running .pmp-blade{animation:spin 1s linear infinite}
.gauge3d{width:60px;height:60px;position:relative}.gauge-ring{width:100%;height:100%;border-radius:50%;background:conic-gradient(#0f0 calc(var(--pct)*100%),#333 0)}.gauge-val{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px}
.brew-cube{width:80px;height:80px;position:relative;transform-style:preserve-3d;animation:rotate3d 10s linear infinite}
.cube-face{position:absolute;width:80px;height:80px;background:rgba(0,0,0,.8);border:1px solid #ff6b35;display:flex;align-items:center;justify-content:center;font-size:11px}
.front{transform:translateZ(40px)}.back{transform:translateZ(-40px) rotateY(180deg)}.left{transform:translateX(-40px) rotateY(-90deg)}.right{transform:translateX(40px) rotateY(90deg)}.top{transform:translateY(-40px) rotateX(90deg)}.bottom{transform:translateY(40px) rotateX(-90deg)}
@keyframes rotate3d{to{transform:rotateY(360deg)}}
</style>`
};
export default G3D;
