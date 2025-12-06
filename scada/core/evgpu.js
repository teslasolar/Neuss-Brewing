// ⚡ eVGPU - Electronic Virtual GPU for Brewing ML
// CPU-based tensor ops, no GPU needed
const eVGPU={
  c:navigator.hardwareConcurrency||4,
  // Matrix multiply
  mm:(a,b)=>{
    const r=a.length,c=b[0].length,n=b.length;
    return Array(r).fill().map((_,i)=>Array(c).fill().map((_,j)=>
      Array(n).fill().reduce((s,_,k)=>s+a[i][k]*b[k][j],0)));
  },
  // Element-wise ops
  add:(a,b)=>a.map((v,i)=>v+b[i]),
  mul:(a,b)=>a.map((v,i)=>v*b[i]),
  // Activations
  sig:x=>1/(1+Math.exp(-x)),
  relu:x=>Math.max(0,x),
  // Vectorize
  vec:(a,fn)=>a.map(fn),
  // Brew predictions
  pred:{
    fg:(og,att)=>og-(og-1)*att,
    abv:(og,fg)=>(og-fg)*131.25,
    ibu:(aa,oz,sg,t)=>aa*oz*7489/(sg*(1+Math.exp(-0.04*(t-31.32))))
  }
};
export default eVGPU;
