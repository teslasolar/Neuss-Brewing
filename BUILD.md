# 🍺 BREWERY SCADA + KONOMI 3D BUILD SPEC

## 📦 LEGEND
```
🍺=Vessel 🧪=Batch 📋=Recipe ⚡=eVGPU 🧊=BlockArray
🎲=Cube 🌡️=Sensor 🔧=Valve 💨=Pump 📡=WebSocket
```

## 🏗️ ARCHITECTURE

### ⚡ eVGPU [CPU-based ML]
```js
// Brewing prediction without GPU
const eVGPU={c:4,tensor:(a,b)=>a.map((r,i)=>r.map((_,j)=>a[i].reduce((s,v,k)=>s+v*b[k][j],0)))}
```

### 🧊 BlockArray [3D Brewery Grid]
```js
// 10x10x10 vessel/sensor grid
const BA={d:[10,10,10],g:{},set:(x,y,z,v)=>BA.g[`${x},${y},${z}`]=v,get:(x,y,z)=>BA.g[`${x},${y},${z}`]}
```

### 🎲 BrewCube [9-node vessel control]
```js
// 8 sensors + 1 controller per vessel
const Cube={V:['TMP','PRS','PH','LVL','FLO','SG','O2','CO2'],C:'CTL',state:'IDLE'}
```

## 📊 UDTs (User Defined Types)
```js
VSL:{id:'',vol:0,tmp:0,prs:0,ph:0,sg:0,st:0}     // Vessel
BCH:{id:'',rcp:'',stg:0,t0:0,vol:0,abv:0,ibu:0}  // Batch
PHS:{nm:'',tmp:0,dur:0,flo:0,pct:0}              // Phase
SEN:{id:'',val:0,eu:'',hi:0,lo:0,alm:0}          // Sensor
```

## 🎯 ISA-88 STATES
```
0=IDLE 1=CHARGE 2=HEAT 3=MASH 4=SPARGE 5=BOIL 6=COOL 7=FERM 8=DONE
```

## 📁 STRUCTURE
```
scada/core/   → evgpu.js,femto.js,blocks.js,cube.js
scada/        → udts.js,tags.js,gfx2d.js,gfx3d.js
scada/screens/→ overview,brewhouse,ferment,recipes
config/       → vessels.json,sensors.json,alarms.json
recipes/      → library/*.json,active/*.json
```

## 🚀 BUILD ORDER
evgpu→femto→blocks→cube→udts→tags→gfx2d→gfx3d→screens→deploy

## 📊 TARGETS
- Files: <250 tokens each
- Load: <2s dashboard
- Scan: <100ms sensors
- RAM: <50MB browser
- 2D/3D: Toggle modes
