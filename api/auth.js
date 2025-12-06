// Auth API - 21 CFR Part 11 Authentication
import {API} from './template.js';
const users={
  oper1:{id:'oper1',nm:'Operator 1',acl:1,pwd:'oper123'},
  super1:{id:'super1',nm:'Supervisor 1',acl:2,pwd:'super123'},
  qa1:{id:'qa1',nm:'QA Manager',acl:3,pwd:'qa123'},
  admin:{id:'admin',nm:'Administrator',acl:4,pwd:'admin123'}
};
const sessions={};
const audit=[];
export const AuthAPI={
  // Login
  login:(id,pwd)=>{
    const u=users[id];
    if(!u||u.pwd!==pwd){
      audit.push({ts:Date.now(),usr:id,act:'LOGIN_FAIL',ip:'127.0.0.1'});
      return API.res(false,null,'Invalid credentials');
    }
    const token=Math.random().toString(36).substr(2)+Date.now().toString(36);
    sessions[token]={usr:id,acl:u.acl,nm:u.nm,ts:Date.now(),exp:Date.now()+1800000};
    audit.push({ts:Date.now(),usr:id,act:'LOGIN',token:token.substr(0,8)});
    return API.res(true,{token,usr:u.nm,acl:u.acl});
  },
  // Logout
  logout:(token)=>{
    if(!sessions[token])return API.res(false,null,'Invalid session');
    audit.push({ts:Date.now(),usr:sessions[token].usr,act:'LOGOUT'});
    delete sessions[token];
    return API.res(true,{});
  },
  // Verify session
  verify:(token)=>{
    const s=sessions[token];
    if(!s)return API.res(false,null,'Invalid session');
    if(Date.now()>s.exp){delete sessions[token];return API.res(false,null,'Session expired');}
    return API.res(true,{usr:s.nm,acl:s.acl});
  },
  // Check permission
  can:(token,lvl)=>{
    const s=sessions[token];
    if(!s)return API.res(false,null,'Invalid session');
    return API.res(true,{allowed:s.acl>=lvl});
  },
  // Electronic signature
  sign:(token,pwd,reason)=>{
    const s=sessions[token];
    if(!s)return API.res(false,null,'Invalid session');
    const u=users[s.usr];
    if(!u||u.pwd!==pwd)return API.res(false,null,'Invalid signature password');
    const sig={
      id:Date.now().toString(36),
      usr:s.usr,
      nm:s.nm,
      ts:new Date().toISOString(),
      reason,
      hash:Buffer?.from?.(s.usr+pwd+Date.now()).toString('base64').substr(0,16)||Math.random().toString(36)
    };
    audit.push({ts:Date.now(),usr:s.usr,act:'ESIG',reason,sig:sig.hash});
    return API.res(true,sig);
  },
  // Get audit log
  audit:(limit=100)=>API.res(true,audit.slice(-limit)),
  // ACL levels
  ACL:{OPER:1,SUPER:2,QA:3,ADMIN:4}
};
export default AuthAPI;
