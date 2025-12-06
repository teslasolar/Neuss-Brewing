// Perspective Core - Component Registry & Renderer
// Like Ignition Perspective but lighter
export const P={
  // Component registry
  components:{},
  // Screen cache
  screens:{},
  // Global props/params
  props:{},
  // Bindings
  bindings:{},

  // Register component
  reg(type,render,defaults={}){
    this.components[type]={render,defaults};
  },

  // Get component
  get(type){return this.components[type]},

  // Render component from JSON definition
  render(def,parent=null){
    const c=this.components[def.type];
    if(!c)return`<div class="p-err">Unknown: ${def.type}</div>`;
    // Merge defaults with props
    const props={...c.defaults,...def.props};
    // Resolve bindings
    Object.keys(props).forEach(k=>{
      if(typeof props[k]==='string'&&props[k].startsWith('{')&&props[k].endsWith('}')){
        const path=props[k].slice(1,-1);
        props[k]=this.resolve(path);
      }
    });
    // Render children
    let children='';
    if(def.children){
      children=def.children.map(ch=>this.render(ch,def)).join('');
    }
    return c.render(props,children,def);
  },

  // Resolve binding path (e.g., "props.temp" or "api.vessels.HLT.tmp")
  resolve(path){
    const parts=path.split('.');
    let val=this;
    for(const p of parts){
      val=val?.[p];
      if(val===undefined)return`[${path}]`;
    }
    return val;
  },

  // Set prop and trigger update
  set(path,val){
    const parts=path.split('.');
    let obj=this;
    for(let i=0;i<parts.length-1;i++){
      obj=obj[parts[i]]=obj[parts[i]]||{};
    }
    obj[parts[parts.length-1]]=val;
    this.update();
  },

  // Load screen from JSON
  async load(name){
    if(this.screens[name])return this.screens[name];
    const res=await fetch(`/perspective/screens/${name}.json`);
    const screen=await res.json();
    this.screens[name]=screen;
    return screen;
  },

  // Render screen to element
  async show(name,el){
    const screen=await this.load(name);
    // Set screen params as props
    if(screen.params)Object.assign(this.props,screen.params);
    el.innerHTML=this.render(screen.root);
    // Run scripts
    if(screen.scripts){
      screen.scripts.forEach(s=>eval(s));
    }
  },

  // Update all bound elements
  update(){
    document.querySelectorAll('[data-bind]').forEach(el=>{
      const path=el.dataset.bind;
      el.textContent=this.resolve(path);
    });
  },

  // Subscribe to binding changes
  watch(path,fn){
    this.bindings[path]=this.bindings[path]||[];
    this.bindings[path].push(fn);
  }
};

// Export for global use
window.P=P;
export default P;
