// 🍺 Brewery UDTs - User Defined Types (ISA-88)
const UDT={
  // Vessel type
  VSL:(id,cap=500)=>({id,cap,vol:0,tmp:0,prs:0,ph:7,sg:1,st:0,mode:'A'}),
  // Batch type
  BCH:(id,rcp)=>({id,rcp,stg:0,t0:Date.now(),vol:0,og:0,fg:0,abv:0,ibu:0,notes:[]}),
  // Recipe phase
  PHS:(nm,tmp,dur)=>({nm,tmp,dur,flo:0,pct:0,adds:[]}),
  // Sensor type
  SEN:(id,eu,hi,lo)=>({id,val:0,eu,hi,lo,alm:0,t:0}),
  // Valve type
  VLV:(id)=>({id,pos:0,cmd:0,fb:0,flt:0}),// 0=closed 100=open
  // Pump type
  PMP:(id)=>({id,run:0,spd:0,amp:0,flt:0}),
  // Alarm type
  ALM:(id,pri,msg)=>({id,pri,msg,act:0,ack:0,t:0}),
  // Recipe type
  RCP:(nm,style,vol)=>({nm,style,vol,og:0,fg:0,ibu:0,phases:[],grain:[],hops:[],yeast:''})
};
// ISA-88 State enum
UDT.ST={IDLE:0,CHARGE:1,HEAT:2,MASH:3,SPARGE:4,BOIL:5,COOL:6,FERM:7,DONE:8};
UDT.ST.name=s=>['IDLE','CHARGE','HEAT','MASH','SPARGE','BOIL','COOL','FERM','DONE'][s]||'UNK';
export default UDT;
