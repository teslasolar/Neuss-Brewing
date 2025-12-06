// 🎲 BrewCube - 9-node vessel control system
// 8 sensor vertices + 1 central controller
const Cube={
  // Vertex IDs (8 sensors)
  V:['TMP','PRS','PH','LVL','FLO','SG','O2','CO2'],
  // Create vessel cube
  create(id){
    return{
      id,
      verts:Object.fromEntries(this.V.map(v=>[v,{val:0,hi:0,lo:0,alm:0}])),
      ctl:{st:0,mode:'AUTO',batch:null},
      edges:[],// Connections to other cubes
      // ISA-88 states
      states:['IDLE','CHARGE','HEAT','MASH','SPARGE','BOIL','COOL','FERM','DONE'],
      // Get state name
      stName(){return this.states[this.ctl.st]||'UNK'},
      // Set sensor
      setSen(v,val){if(this.verts[v])this.verts[v].val=val},
      // Check alarms
      chkAlm(){
        return this.V.filter(v=>{
          const s=this.verts[v];
          return s.val>s.hi||s.val<s.lo;
        });
      },
      // Connect to another cube
      link(target){this.edges.push(target)}
    };
  },
  // Cube constellation (brewery = array of cubes)
  constellation:{}
};
export default Cube;
