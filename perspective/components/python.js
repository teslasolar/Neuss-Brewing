// Python Component - Run Python in browser via Pyodide
import P from '../core.js';

// Python execution state
const Py={
  ready:false,
  pyodide:null,
  output:[],
  // Initialize Pyodide
  async init(){
    if(this.ready)return;
    try{
      // Load Pyodide from CDN
      if(!window.loadPyodide){
        const script=document.createElement('script');
        script.src='https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        document.head.appendChild(script);
        await new Promise(r=>script.onload=r);
      }
      this.pyodide=await loadPyodide();
      this.ready=true;
      console.log('🐍 Pyodide ready');
    }catch(e){
      console.error('Pyodide failed:',e);
    }
  },
  // Run Python code
  async run(code){
    if(!this.ready)await this.init();
    if(!this.pyodide)return{ok:false,error:'Pyodide not loaded'};
    try{
      const result=await this.pyodide.runPythonAsync(code);
      return{ok:true,result};
    }catch(e){
      return{ok:false,error:e.message};
    }
  },
  // Run with namespace
  async exec(code,globals={}){
    if(!this.ready)await this.init();
    const ns=this.pyodide.globals.get('dict')();
    Object.entries(globals).forEach(([k,v])=>ns.set(k,v));
    return this.pyodide.runPythonAsync(code,{globals:ns});
  }
};
window.Py=Py;

// Python code display
P.reg('python',(p)=>`
  <div class="p-python">
    <div class="p-python-header">
      <span>🐍 Python</span>
      <button class="p-python-run" onclick="Py.run(document.getElementById('${p.id||'py'}').textContent).then(r=>alert(r.ok?r.result:r.error))">Run</button>
    </div>
    <pre class="p-python-code" id="${p.id||'py'}">${p.code||'# Python code here'}</pre>
    <div class="p-python-output" id="${p.id||'py'}_out"></div>
  </div>
`,{code:'',id:'py'});

// Python expression (inline)
P.reg('pyexpr',(p)=>`
  <span class="p-pyexpr" data-expr="${p.expr}" id="${p.id||'pyx'+Date.now()}">${p.default||'...'}</span>
`,{expr:'',default:'...'});

// Python chart (matplotlib-like)
P.reg('pychart',(p)=>`
  <div class="p-pychart" id="${p.id||'pychart'}">
    <canvas width="${p.width||300}" height="${p.height||200}"></canvas>
  </div>
`,{width:300,height:200});

// Brewing calculations component
P.reg('brewcalc',(p)=>{
  const calcs={
    abv:`ABV = (OG - FG) × 131.25 = (${p.og||1.050} - ${p.fg||1.010}) × 131.25 = ${((p.og||1.050)-(p.fg||1.010))*131.25}%`,
    ibu:`IBU ≈ ${p.ibu||'--'}`,
    srm:`SRM ≈ ${p.srm||'--'}`,
    efficiency:`Efficiency = ${p.efficiency||'--'}%`
  };
  return`
  <div class="p-brewcalc">
    <div class="p-brewcalc-title">${p.title||'Brew Calculations'}</div>
    ${Object.entries(calcs).map(([k,v])=>`<div class="p-brewcalc-row"><span>${k.toUpperCase()}</span><span>${v}</span></div>`).join('')}
  </div>`;
},{og:1.050,fg:1.010});

// Export Py for external use
export {Py};
export default P;
