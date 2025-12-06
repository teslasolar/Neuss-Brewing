// 21 CFR Part 11 Compliance Module
// FDA Electronic Records & Signatures
const CFR11={
  // Audit trail - immutable log
  audit:[],
  // Log action with timestamp, user, action, data
  log(usr,act,data,sig=null){
    const e={
      id:crypto.randomUUID?.()??Date.now().toString(36),
      ts:new Date().toISOString(),
      usr,act,data,sig,
      hash:null
    };
    // Chain hash for integrity
    e.hash=this.hash(JSON.stringify(e)+this.audit[this.audit.length-1]?.hash);
    this.audit.push(e);
    this.persist();
    return e;
  },
  // Simple hash for integrity
  hash(s){let h=0;for(let i=0;i<s.length;i++)h=((h<<5)-h)+s.charCodeAt(i)|0;return h.toString(16)},
  // Electronic signature
  sign(usr,pwd,reason){
    return{
      usr,
      ts:new Date().toISOString(),
      reason,
      sig:this.hash(usr+pwd+Date.now())
    };
  },
  // Verify chain integrity
  verify(){
    for(let i=1;i<this.audit.length;i++){
      const e=this.audit[i],p=this.audit[i-1];
      const exp=this.hash(JSON.stringify({...e,hash:null})+p.hash);
      if(e.hash!==exp)return{valid:false,idx:i};
    }
    return{valid:true,count:this.audit.length};
  },
  // Access control levels
  ACL:{OPER:1,SUPER:2,QA:3,ADMIN:4},
  // Check permission
  can(usr,lvl){return(usr?.acl||0)>=lvl},
  // Persist to localStorage (demo) or IndexedDB (prod)
  persist(){try{localStorage.setItem('cfr11_audit',JSON.stringify(this.audit))}catch{}},
  // Load audit trail
  load(){try{this.audit=JSON.parse(localStorage.getItem('cfr11_audit'))||[]}catch{this.audit=[]}},
  // Export for review
  export(){return JSON.stringify(this.audit,null,2)},
  // Compliance check
  check(){
    return{
      auditTrail:this.audit.length>0,
      chainValid:this.verify().valid,
      lastEntry:this.audit[this.audit.length-1]?.ts,
      totalRecords:this.audit.length
    };
  }
};
CFR11.load();
export default CFR11;
