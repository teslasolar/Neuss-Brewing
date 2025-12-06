// Brewing Science Components
import P from '../core.js';

// Water profile display
P.reg('water-profile', (p) => `
  <div class="p-water-profile">
    <div class="p-water-name">${p.name||'Profile'}</div>
    <div class="p-water-ions">
      <span class="ion"><b>Ca</b>${p.ca||0}</span>
      <span class="ion"><b>Mg</b>${p.mg||0}</span>
      <span class="ion"><b>Na</b>${p.na||0}</span>
      <span class="ion"><b>Cl</b>${p.cl||0}</span>
      <span class="ion"><b>SO4</b>${p.so4||0}</span>
      <span class="ion"><b>HCO3</b>${p.hco3||0}</span>
    </div>
    <div class="p-water-meta">
      <span>pH: ${p.ph||'--'}</span>
      <span>RA: ${p.residualAlk||'--'}</span>
      ${p.sulfateChloride?`<span>SO4:Cl ${p.sulfateChloride}</span>`:''}
    </div>
  </div>
`);

// Salt calculator display
P.reg('salt-calc', (p) => `
  <div class="p-salt-calc">
    ${(p.salts||[]).map(s => `
      <div class="p-salt-row ${s.amt>0?'active':''}">
        <span class="p-salt-name">${s.name}</span>
        <span class="p-salt-amt">${s.amt} ${s.unit}</span>
      </div>
    `).join('')}
  </div>
`);

// pH calculator
P.reg('ph-calc', (p) => `
  <div class="p-ph-calc">
    <div class="p-ph-grains">
      ${(p.grainBill||[]).map(g => `
        <div class="p-grain-row">
          <span>${g.grain}</span><span>${g.pct}%</span><span>${g.color}°L</span>
        </div>
      `).join('')}
    </div>
    <div class="p-ph-result">
      <div class="p-ph-predicted">Predicted: <b>${p.predictedPh||'--'}</b></div>
      <div class="p-ph-target">Target: ${p.targetPh||'5.4'}</div>
    </div>
  </div>
`);

// Fermentation chart placeholder
P.reg('ferm-chart', (p) => `
  <div class="p-ferm-chart">
    <div class="p-ferm-stats">
      <span>OG: ${p.og}</span><span>SG: ${p.sg}</span><span>FG(est): ${p.fg}</span>
      <span>Atten: ${p.attenuation}%</span><span>ABV: ${p.abvCurrent}%</span>
    </div>
    <div class="p-ferm-graph" style="height:120px;background:#0d0704;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#666">
      <span>Gravity/Temp/pH curves</span>
    </div>
  </div>
`);

// Kinetics model display
P.reg('kinetics-model', (p) => `
  <div class="p-kinetics-model">
    <div class="p-kinetics-header">
      <span class="p-yeast-strain">${p.strain||'Yeast'}</span>
      <span class="p-kinetics-type">${p.model||'monod'} model</span>
    </div>
    <div class="p-kinetics-params">
      <div class="p-kp"><span class="lbl">Pitch Rate</span><span class="val">${p.pitchRate}M/mL/°P</span></div>
      <div class="p-kp"><span class="lbl">Cell Count</span><span class="val">${p.cellCount}</span></div>
      <div class="p-kp"><span class="lbl">Viability</span><span class="val">${p.viability}%</span></div>
      <div class="p-kp"><span class="lbl">Lag Phase</span><span class="val">${p.lag}</span></div>
      <div class="p-kp"><span class="lbl">Peak CO2</span><span class="val">${p.peakCO2}</span></div>
      <div class="p-kp"><span class="lbl">Est Complete</span><span class="val">${p.estCompletion}</span></div>
    </div>
  </div>
`);

export default P;
