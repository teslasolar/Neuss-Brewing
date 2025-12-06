// Generic API Template - Brewery SCADA
// Usage: import and extend for specific endpoints
export const API={
  base:'/api',
  // Standard response wrapper
  res:(ok,data,err=null)=>({ok,data,err,ts:Date.now()}),
  // CRUD operations template
  crud:(name,store={})=>({
    list:()=>API.res(true,Object.values(store)),
    get:(id)=>store[id]?API.res(true,store[id]):API.res(false,null,'Not found'),
    create:(data)=>{const id=data.id||Date.now().toString(36);store[id]={...data,id};return API.res(true,store[id])},
    update:(id,data)=>store[id]?(store[id]={...store[id],...data},API.res(true,store[id])):API.res(false,null,'Not found'),
    delete:(id)=>store[id]?(delete store[id],API.res(true,{id})):API.res(false,null,'Not found')
  }),
  // Mock fetch wrapper
  fetch:async(endpoint,opts={})=>{
    const url=API.base+endpoint;
    const method=opts.method||'GET';
    const body=opts.body?JSON.stringify(opts.body):null;
    console.log(`[API] ${method} ${url}`,body?JSON.parse(body):'');
    // Simulate network delay
    await new Promise(r=>setTimeout(r,50+Math.random()*100));
    return{ok:true,json:async()=>({ok:true,data:{}})};
  },
  // WebSocket template
  ws:(url,handlers={})=>{
    const ws={
      url,ready:false,q:[],
      send:(msg)=>ws.ready?ws.socket?.send(JSON.stringify(msg)):ws.q.push(msg),
      on:(evt,fn)=>handlers[evt]=fn,
      connect:()=>{
        try{
          ws.socket=new WebSocket(url);
          ws.socket.onopen=()=>{ws.ready=true;ws.q.forEach(m=>ws.send(m));ws.q=[];handlers.open?.()};
          ws.socket.onmessage=(e)=>handlers.message?.(JSON.parse(e.data));
          ws.socket.onclose=()=>{ws.ready=false;handlers.close?.()};
          ws.socket.onerror=(e)=>handlers.error?.(e);
        }catch(e){handlers.error?.(e)}
      }
    };
    return ws;
  }
};
export default API;
