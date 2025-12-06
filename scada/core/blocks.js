// 🧊 BlockArray - 3D Brewery Grid System
// Sparse storage for 1000³ potential cubes
const Blocks={
  dim:[10,10,10],// Start small, scale up
  grid:{},       // Sparse coord→value
  llms:{},       // coord→FemtoLLM
  // Coordinate key
  k:(x,y,z)=>`${x},${y},${z}`,
  // Set/Get
  set(x,y,z,v){this.grid[this.k(x,y,z)]=v},
  get(x,y,z){return this.grid[this.k(x,y,z)]||0},
  // Vessel mapping (x=area, y=vessel, z=sensor)
  // x: 0=brewhouse 1=ferment 2=bright 3=pack
  // y: vessel index
  // z: 0=tmp 1=prs 2=ph 3=lvl 4=flo 5=sg 6=o2 7=co2
  map:{area:['BH','FV','BT','PK'],sen:['TMP','PRS','PH','LVL','FLO','SG','O2','CO2']},
  // Get all in area
  area(x){
    return Object.entries(this.grid).filter(([k])=>k.startsWith(`${x},`)).map(([k,v])=>({k,v}));
  },
  // Adjacent cubes
  adj(x,y,z){
    return[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]
      .map(([dx,dy,dz])=>this.get(x+dx,y+dy,z+dz)).filter(v=>v);
  }
};
export default Blocks;
