// Input Components - Forms, Controls
import P from '../core.js';

// Text input
P.reg('input',(p)=>`
  <div class="p-input-wrap">
    ${p.label?`<label class="p-input-label">${p.label}</label>`:''}
    <input type="${p.type||'text'}" class="p-input" placeholder="${p.placeholder||''}"
      value="${p.value||''}" ${p.disabled?'disabled':''} onchange="${p.onChange||''}"/>
  </div>
`,{type:'text',label:'',placeholder:'',value:''});

// Number input with +/- buttons
P.reg('numeric',(p)=>`
  <div class="p-numeric">
    ${p.label?`<label class="p-numeric-label">${p.label}</label>`:''}
    <div class="p-numeric-wrap">
      <button class="p-numeric-btn" onclick="P.set('${p.bind}',Math.max(${p.min||0},P.resolve('${p.bind}')-${p.step||1}))">-</button>
      <span class="p-numeric-val" data-bind="${p.bind}">${p.value||0}</span>
      <button class="p-numeric-btn" onclick="P.set('${p.bind}',Math.min(${p.max||100},P.resolve('${p.bind}')+${p.step||1}))">+</button>
    </div>
    ${p.unit?`<span class="p-numeric-unit">${p.unit}</span>`:''}
  </div>
`,{value:0,min:0,max:100,step:1,unit:''});

// Dropdown/Select
P.reg('select',(p)=>{
  const opts=p.options||[];
  return`
  <div class="p-select-wrap">
    ${p.label?`<label class="p-select-label">${p.label}</label>`:''}
    <select class="p-select" onchange="${p.onChange||''}">
      ${opts.map(o=>`<option value="${o.value||o}" ${o.value===p.value||o===p.value?'selected':''}>${o.label||o}</option>`).join('')}
    </select>
  </div>`;
},{options:[],value:'',label:''});

// Toggle/Switch
P.reg('toggle',(p)=>`
  <div class="p-toggle ${p.value?'on':'off'}" onclick="${p.onClick||''}">
    ${p.label?`<span class="p-toggle-label">${p.label}</span>`:''}
    <div class="p-toggle-track"><div class="p-toggle-thumb"></div></div>
  </div>
`,{value:false,label:''});

// Slider
P.reg('slider',(p)=>`
  <div class="p-slider-wrap">
    ${p.label?`<label class="p-slider-label">${p.label}</label>`:''}
    <input type="range" class="p-slider" min="${p.min||0}" max="${p.max||100}"
      value="${p.value||50}" step="${p.step||1}" oninput="${p.onInput||''}"/>
    <span class="p-slider-val">${p.value||50}${p.unit||''}</span>
  </div>
`,{min:0,max:100,value:50,step:1,unit:''});

// Checkbox
P.reg('checkbox',(p)=>`
  <label class="p-checkbox">
    <input type="checkbox" ${p.checked?'checked':''} onchange="${p.onChange||''}"/>
    <span class="p-checkbox-mark"></span>
    ${p.label||''}
  </label>
`,{checked:false,label:''});

// Radio group
P.reg('radio',(p)=>{
  const opts=p.options||[];
  return`
  <div class="p-radio-group">
    ${p.label?`<div class="p-radio-label">${p.label}</div>`:''}
    ${opts.map(o=>`
      <label class="p-radio">
        <input type="radio" name="${p.name||'radio'}" value="${o.value||o}" ${(o.value||o)===p.value?'checked':''}/>
        <span class="p-radio-mark"></span>
        ${o.label||o}
      </label>
    `).join('')}
  </div>`;
},{options:[],value:'',name:'radio'});

// Date picker
P.reg('datepicker',(p)=>`
  <div class="p-date-wrap">
    ${p.label?`<label class="p-date-label">${p.label}</label>`:''}
    <input type="date" class="p-date" value="${p.value||''}" onchange="${p.onChange||''}"/>
  </div>
`,{value:'',label:''});

export default P;
