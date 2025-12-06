// Vessels API - Brewery Equipment
import {API} from './template.js';
const store={
  HLT:{id:'HLT',nm:'Hot Liquor Tank',cap:500,vol:450,tmp:75,st:0},
  MSH:{id:'MSH',nm:'Mash Tun',cap:450,vol:380,tmp:67,ph:5.4,st:3},
  BK:{id:'BK',nm:'Boil Kettle',cap:450,vol:360,tmp:100,st:5},
  WP:{id:'WP',nm:'Whirlpool',cap:400,vol:0,tmp:20,st:0},
  FV1:{id:'FV1',nm:'Fermenter 1',cap:500,vol:400,tmp:18,prs:12,sg:1.012,st:7},
  FV2:{id:'FV2',nm:'Fermenter 2',cap:500,vol:400,tmp:20,prs:10,sg:1.045,st:7},
  FV3:{id:'FV3',nm:'Fermenter 3',cap:500,vol:380,tmp:2,prs:14,sg:1.008,st:7},
  FV4:{id:'FV4',nm:'Fermenter 4',cap:500,vol:0,tmp:0,prs:0,sg:0,st:0}
};
export const VesselsAPI={
  ...API.crud('vessels',store),
  // Get by type
  byType:(t)=>API.res(true,Object.values(store).filter(v=>v.id.startsWith(t))),
  // Update sensor value
  setSensor:(id,key,val)=>{
    if(!store[id])return API.res(false,null,'Vessel not found');
    store[id][key]=val;
    store[id].ts=Date.now();
    return API.res(true,store[id]);
  },
  // Get all temps
  temps:()=>API.res(true,Object.values(store).map(v=>({id:v.id,tmp:v.tmp}))),
  // Set state
  setState:(id,st)=>store[id]?(store[id].st=st,API.res(true,store[id])):API.res(false,null,'Not found')
};
export default VesselsAPI;
