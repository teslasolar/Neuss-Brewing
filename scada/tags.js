// 📡 Tag Database - Sensor/Actuator Registry
const Tags={
  db:{},
  // Register tag
  reg(id,cfg){this.db[id]={...cfg,t:Date.now()}},
  // Get tag value
  get(id){return this.db[id]?.val},
  // Set tag value with timestamp
  set(id,val){if(this.db[id]){this.db[id].val=val;this.db[id].t=Date.now()}},
  // Check alarm
  chk(id){
    const t=this.db[id];if(!t)return 0;
    if(t.val>t.hi)return 2;// HI alarm
    if(t.val<t.lo)return 1;// LO alarm
    return 0;
  },
  // Get all tags in group
  grp(pfx){return Object.entries(this.db).filter(([k])=>k.startsWith(pfx))},
  // Subscribe to changes
  subs:{},
  on(id,fn){this.subs[id]=this.subs[id]||[];this.subs[id].push(fn)},
  emit(id){(this.subs[id]||[]).forEach(fn=>fn(this.db[id]))}
};
// Initialize brewery tags
const init=()=>{
  // HLT
  Tags.reg('HLT_TMP',{val:75,eu:'°C',hi:82,lo:60});
  Tags.reg('HLT_LVL',{val:450,eu:'L',hi:500,lo:50});
  // Mash
  Tags.reg('MSH_TMP',{val:67,eu:'°C',hi:72,lo:62});
  Tags.reg('MSH_PH',{val:5.4,eu:'pH',hi:5.6,lo:5.2});
  // Boil
  Tags.reg('BK_TMP',{val:100,eu:'°C',hi:102,lo:95});
  Tags.reg('BK_LVL',{val:380,eu:'L',hi:450,lo:50});
  // Fermenters
  for(let i=1;i<=4;i++){
    Tags.reg(`FV${i}_TMP`,{val:18,eu:'°C',hi:22,lo:10});
    Tags.reg(`FV${i}_PRS`,{val:12,eu:'PSI',hi:15,lo:8});
    Tags.reg(`FV${i}_SG`,{val:1.012,eu:'SG',hi:1.1,lo:0.99});
  }
};
init();
export default Tags;
