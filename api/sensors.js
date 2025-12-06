// Sensors API - Real-time Sensor Data
import {API} from './template.js';
const store={
  HLT_TMP:{id:'HLT_TMP',val:75,eu:'°C',hi:82,lo:60,alm:0,ts:Date.now()},
  HLT_LVL:{id:'HLT_LVL',val:450,eu:'L',hi:500,lo:50,alm:0,ts:Date.now()},
  MSH_TMP:{id:'MSH_TMP',val:67,eu:'°C',hi:72,lo:62,alm:0,ts:Date.now()},
  MSH_PH:{id:'MSH_PH',val:5.4,eu:'pH',hi:5.6,lo:5.2,alm:0,ts:Date.now()},
  BK_TMP:{id:'BK_TMP',val:100,eu:'°C',hi:102,lo:95,alm:0,ts:Date.now()},
  BK_LVL:{id:'BK_LVL',val:360,eu:'L',hi:450,lo:50,alm:0,ts:Date.now()},
  FV1_TMP:{id:'FV1_TMP',val:18,eu:'°C',hi:22,lo:10,alm:0,ts:Date.now()},
  FV1_PRS:{id:'FV1_PRS',val:12,eu:'PSI',hi:15,lo:0,alm:0,ts:Date.now()},
  FV1_SG:{id:'FV1_SG',val:1.012,eu:'SG',hi:1.1,lo:0.99,alm:0,ts:Date.now()},
  FV2_TMP:{id:'FV2_TMP',val:20,eu:'°C',hi:22,lo:10,alm:0,ts:Date.now()},
  FV3_TMP:{id:'FV3_TMP',val:2,eu:'°C',hi:5,lo:-2,alm:0,ts:Date.now()},
  GLY_TMP:{id:'GLY_TMP',val:-2,eu:'°C',hi:5,lo:-10,alm:0,ts:Date.now()},
  CO2_PRS:{id:'CO2_PRS',val:650,eu:'PSI',hi:800,lo:100,alm:0,ts:Date.now()}
};
export const SensorsAPI={
  ...API.crud('sensors',store),
  // Get all values
  values:()=>API.res(true,Object.values(store).map(s=>({id:s.id,val:s.val,eu:s.eu,alm:s.alm}))),
  // Set value and check alarm
  set:(id,val)=>{
    if(!store[id])return API.res(false,null,'Sensor not found');
    store[id].val=val;
    store[id].ts=Date.now();
    store[id].alm=val>store[id].hi?2:val<store[id].lo?1:0;
    return API.res(true,store[id]);
  },
  // Get alarms only
  alarms:()=>API.res(true,Object.values(store).filter(s=>s.alm>0)),
  // Simulate readings (for demo)
  simulate:()=>{
    Object.values(store).forEach(s=>{
      const noise=(Math.random()-0.5)*2;
      if(s.eu==='°C')s.val=Math.round((s.val+noise)*10)/10;
      else if(s.eu==='L')s.val=Math.round(s.val+noise*5);
      else if(s.eu==='PSI')s.val=Math.round((s.val+noise)*10)/10;
      s.ts=Date.now();
      s.alm=s.val>s.hi?2:s.val<s.lo?1:0;
    });
    return API.res(true,Object.values(store));
  },
  // Get history (mock)
  history:(id,mins=60)=>{
    const pts=[];
    const now=Date.now();
    for(let i=mins;i>=0;i--){
      pts.push({ts:now-i*60000,val:store[id]?.val||0+(Math.random()-0.5)*5});
    }
    return API.res(true,pts);
  }
};
export default SensorsAPI;
