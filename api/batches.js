// Batches API - Batch Management
import {API} from './template.js';
const store={
  '2024-042':{id:'2024-042',rcp:'RCP001',nm:'West Coast IPA',vessel:'FV1',st:7,og:1.065,sg:1.012,day:5,total:14,start:'2024-12-01'},
  '2024-041':{id:'2024-041',rcp:'RCP002',nm:'Oatmeal Stout',vessel:'FV2',st:7,og:1.058,sg:1.045,day:12,total:21,start:'2024-11-24'},
  '2024-040':{id:'2024-040',rcp:'RCP003',nm:'Pilsner',vessel:'FV3',st:8,og:1.048,sg:1.008,day:21,total:28,start:'2024-11-08'},
  '2024-039':{id:'2024-039',rcp:'RCP001',nm:'West Coast IPA',vessel:null,st:8,og:1.064,fg:1.009,abv:7.2,start:'2024-11-01',end:'2024-11-20'},
  '2024-038':{id:'2024-038',rcp:'RCP004',nm:'Belgian Wit',vessel:null,st:8,og:1.045,fg:1.008,abv:4.8,start:'2024-10-25',end:'2024-11-15'}
};
export const BatchesAPI={
  ...API.crud('batches',store),
  // Get active batches
  active:()=>API.res(true,Object.values(store).filter(b=>b.st<8)),
  // Get completed
  completed:()=>API.res(true,Object.values(store).filter(b=>b.st>=8)),
  // Get by vessel
  byVessel:(v)=>API.res(true,Object.values(store).find(b=>b.vessel===v)),
  // Update gravity
  setGravity:(id,sg)=>{
    if(!store[id])return API.res(false,null,'Batch not found');
    store[id].sg=sg;
    if(store[id].og&&sg)store[id].abv=((store[id].og-sg)*131.25).toFixed(1);
    return API.res(true,store[id]);
  },
  // Advance day
  advanceDay:(id)=>{
    if(!store[id])return API.res(false,null,'Batch not found');
    store[id].day++;
    return API.res(true,store[id]);
  },
  // Complete batch
  complete:(id,fg)=>{
    if(!store[id])return API.res(false,null,'Batch not found');
    store[id].st=8;
    store[id].fg=fg;
    store[id].sg=fg;
    store[id].abv=((store[id].og-fg)*131.25).toFixed(1);
    store[id].end=new Date().toISOString().split('T')[0];
    store[id].vessel=null;
    return API.res(true,store[id]);
  }
};
export default BatchesAPI;
