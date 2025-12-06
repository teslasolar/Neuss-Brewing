// Alarms API - ISA-101 Alarm Management
import {API} from './template.js';
const active=[];
const history=[];
let seq=1000;
export const AlarmsAPI={
  // Raise alarm
  raise:(tag,pri,msg)=>{
    const alm={
      id:'ALM'+(++seq),
      tag,pri,msg,
      ts:Date.now(),
      ack:false,
      ackBy:null,
      ackTs:null,
      clr:false,
      clrTs:null
    };
    active.push(alm);
    return API.res(true,alm);
  },
  // Get active alarms
  active:()=>API.res(true,active.filter(a=>!a.clr)),
  // Get all (including cleared)
  all:()=>API.res(true,active),
  // Acknowledge alarm
  ack:(id,usr)=>{
    const alm=active.find(a=>a.id===id);
    if(!alm)return API.res(false,null,'Alarm not found');
    alm.ack=true;
    alm.ackBy=usr;
    alm.ackTs=Date.now();
    return API.res(true,alm);
  },
  // Clear alarm
  clear:(id)=>{
    const alm=active.find(a=>a.id===id);
    if(!alm)return API.res(false,null,'Alarm not found');
    alm.clr=true;
    alm.clrTs=Date.now();
    history.push({...alm});
    return API.res(true,alm);
  },
  // Acknowledge all
  ackAll:(usr)=>{
    active.filter(a=>!a.ack).forEach(a=>{a.ack=true;a.ackBy=usr;a.ackTs=Date.now()});
    return API.res(true,{count:active.filter(a=>a.ack).length});
  },
  // Get by priority
  byPri:(pri)=>API.res(true,active.filter(a=>a.pri===pri&&!a.clr)),
  // Get history
  history:(limit=100)=>API.res(true,history.slice(-limit)),
  // Priority labels
  PRI:{1:'CRITICAL',2:'WARNING',3:'INFO',4:'DEBUG'},
  // Priority colors (ISA-101)
  CLR:{1:'#f00',2:'#ffa500',3:'#0ff',4:'#888'}
};
// Demo alarms
AlarmsAPI.raise('GLY_TMP',2,'Glycol temp slightly high');
export default AlarmsAPI;
