// Perspective App - Screen loader and data binding
import P from './components/index.js';
import './templates/index.js'; // Atomic templates (atoms->molecules->organisms->templates)

// Sample data store
const Store = {
  batch: { id: 'B-2024-042', recipe: 'Hefeweizen', state: 'mash', phase: 'Mash Rest', duration: 45, targetTemp: 152, efficiency: 78 },
  vessels: {
    hlt: { temp: 168, level: 75, sp: 170 },
    mlt: { temp: 152, level: 85 },
    bk: { temp: 68, level: 0, sp: 212 }
  },
  fv1: { status: 'ferm', beer: 'Hefeweizen', temp: 64, sg: 1.018, level: 85, progress: 45, days: '5/14' },
  fv2: { status: 'cond', beer: 'IPA', temp: 38, sg: 1.012, level: 90, progress: 85, days: '12/14' },
  fv3: { status: 'idle', beer: '--', temp: '--', sg: '--', level: 0, progress: 0, days: '--' },
  bbt1: { status: 'cond', beer: 'Pilsner', temp: 34, sg: 1.008 },
  phases: { strike: 'done', mash: 'active', sparge: 'pending', boil: 'pending', cool: 'pending' },
  pumps: { any: true },
  p1: { run: true }, p2: { run: false }, p3: { run: false },
  v1: { state: 'open' }, v2: { state: 'closed' }, v3: { state: 'closed' },
  alarms: { active: false },
  recipes: { list: [
    { name: 'Hefeweizen', style: 'German Wheat', og: 1.052, ibu: 15 },
    { name: 'IPA', style: 'American IPA', og: 1.065, ibu: 65 },
    { name: 'Pilsner', style: 'Czech Pils', og: 1.048, ibu: 35 }
  ]},
  history: {
    batches: [
      { id: 'B-041', recipe: 'Stout', date: '2024-01-15', og: 1.058, fg: 1.014, abv: '5.8%', status: 'Kegged' },
      { id: 'B-040', recipe: 'Pale Ale', date: '2024-01-08', og: 1.052, fg: 1.010, abv: '5.5%', status: 'Kegged' }
    ],
    tempTrend: [64, 65, 64, 63, 64, 64, 63, 62, 61, 60, 58, 55, 52, 48, 45, 42, 40, 38, 36, 34]
  },
  // Business data
  biz: {
    revenue: '18,450', batchesMtd: 6, kegsSold: 42, margin: 62,
    revenueTrend: [12, 14, 11, 16, 15, 18, 17, 19, 16, 18, 20, 18],
    topSellers: [
      { beer: 'IPA', kegs: 18, rev: '$4,500' },
      { beer: 'Pilsner', kegs: 12, rev: '$2,880' },
      { beer: 'Hefeweizen', kegs: 8, rev: '$1,920' }
    ]
  },
  inv: {
    grains: [
      { item: '2-Row Pale', qty: 250, status: 'OK' },
      { item: 'Pilsner Malt', qty: 45, status: 'Low' },
      { item: 'Munich', qty: 80, status: 'OK' },
      { item: 'Crystal 40L', qty: 30, status: 'OK' }
    ],
    hops: [
      { item: 'Cascade', qty: 12, aa: '5.5%' },
      { item: 'Centennial', qty: 24, aa: '10%' },
      { item: 'Saaz', qty: 16, aa: '3.5%' }
    ],
    yeast: [
      { strain: 'WLP001', gen: 3, date: '2024-01-10' },
      { strain: 'WLP300', gen: 2, date: '2024-01-15' },
      { strain: 'WLP830', gen: 1, date: '2024-01-18' }
    ]
  },
  prod: {
    schedule: [
      { date: '01/22', recipe: 'Pilsner', batch: 'B-043', vessel: 'FV3', status: 'Scheduled' },
      { date: '01/25', recipe: 'Stout', batch: 'B-044', vessel: 'FV1', status: 'Pending' },
      { date: '01/29', recipe: 'IPA', batch: 'B-045', vessel: 'FV2', status: 'Pending' }
    ]
  },
  sales: {
    kegsStock: 24, openOrders: 5, pending: 3,
    kegInv: [
      { beer: 'IPA', half: 4, sixth: 8, case: 12 },
      { beer: 'Pilsner', half: 2, sixth: 6, case: 24 },
      { beer: 'Hefeweizen', half: 1, sixth: 4, case: 6 }
    ],
    orders: [
      { id: 'ORD-112', customer: 'Local Taproom', items: '2x IPA', status: 'Ready' },
      { id: 'ORD-113', customer: 'Downtown Bar', items: '1x Pils', status: 'Pending' }
    ]
  },
  costs: {
    perBbl: 85, grain: 42, hops: 18, margin: 62,
    byRecipe: [
      { recipe: 'IPA', grain: '$32', hops: '$28', yeast: '$8', other: '$12', total: '$80' },
      { recipe: 'Pilsner', grain: '$28', hops: '$12', yeast: '$8', other: '$10', total: '$58' },
      { recipe: 'Stout', grain: '$35', hops: '$15', yeast: '$8', other: '$12', total: '$70' }
    ],
    expenses: [
      { category: 'Ingredients', budget: '$2,500', actual: '$2,340', var: '-$160' },
      { category: 'Utilities', budget: '$800', actual: '$785', var: '-$15' },
      { category: 'Labor', budget: '$3,000', actual: '$3,100', var: '+$100' }
    ],
    trend: [82, 84, 81, 85, 83, 86, 84, 85, 83, 85, 84, 85]
  },
  maint: {
    equipment: [
      { equip: 'Pump P1', status: 'OK', hours: 1240, nextPM: '02/01' },
      { equip: 'Pump P2', status: 'OK', hours: 980, nextPM: '02/15' },
      { equip: 'Glycol', status: 'OK', hours: 2100, nextPM: '01/25' },
      { equip: 'Mill', status: 'Due', hours: 520, nextPM: '01/20' }
    ],
    schedule: [
      { date: '01/20', equip: 'Mill', task: 'Roller gap adjustment', assigned: 'Mike' },
      { date: '01/25', equip: 'Glycol', task: 'Filter change', assigned: 'Joe' }
    ],
    workOrders: [
      { id: 'WO-45', equip: 'FV2', issue: 'Temp probe drift', priority: 2, status: 'Open' },
      { id: 'WO-44', equip: 'P1', issue: 'Seal leak', priority: 1, status: 'Parts ordered' }
    ]
  },
  // Controls data
  pid: {
    hlt: { pv: 168.2, sp: 170, out: 72, trend: [165,167,168,169,170,169,168,168,169,168] },
    mlt: { pv: 152.1, sp: 152, out: 0, trend: [150,151,152,152,152,152,152,152,152,152] },
    bk: { pv: 212.0, sp: 212, out: 85, trend: [180,195,205,210,212,212,212,212,212,212] },
    fv1: { pv: 64.2, sp: 64, out: 25, trend: [64,64,65,65,64,64,64,64,64,64] },
    fv2: { pv: 38.1, sp: 38, out: 15, trend: [40,39,38,38,38,38,38,38,38,38] }
  },
  lab: {
    results: [
      { batch: 'B-042', test: 'OG', result: '1.052', spec: '1.050-1.054', status: 'Pass' },
      { batch: 'B-042', test: 'pH', result: '5.38', spec: '5.2-5.6', status: 'Pass' },
      { batch: 'B-041', test: 'ABV', result: '5.8%', spec: '5.5-6.0%', status: 'Pass' },
      { batch: 'B-041', test: 'DO', result: '12ppb', spec: '<50ppb', status: 'Pass' }
    ],
    sensory: [
      { batch: 'B-041', date: '01/18', aroma: '4.2', flavor: '4.0', overall: '4.1' },
      { batch: 'B-040', date: '01/12', aroma: '4.5', flavor: '4.3', overall: '4.4' }
    ],
    ogTrend: [1.051,1.053,1.052,1.050,1.052,1.053,1.052,1.051],
    phTrend: [5.35,5.42,5.38,5.40,5.36,5.39,5.41,5.38],
    abvTrend: [5.1,5.3,5.2,5.4,5.2,5.3,5.2,5.3]
  },
  alarms: {
    history: [
      { time: '06:22:15', tag: 'HLT_TT01', desc: 'HLT Temp High', action: 'Reduced heat' },
      { time: '05:45:30', tag: 'P1_VIB', desc: 'Pump vibration', action: 'Inspected - OK' },
      { time: '04:12:08', tag: 'GLY_TT01', desc: 'Glycol temp warn', action: 'Auto-cleared' }
    ],
    hourly: [1,0,0,1,2,1,0,0,1,0,1,2,0,1,0,0,0,1,0,0,0,1,1,0]
  },
  hist: {
    trendData: []
  }
};

// Bind store to P
P.props = Store;

// Load and render screen
async function loadScreen(name) {
  try {
    const resp = await fetch(`./screens/${name}.json`);
    const screen = await resp.json();
    P.screens[name] = screen;
    const html = P.render(screen);
    document.getElementById('app').innerHTML = html;
    updateBindings();
  } catch (e) {
    console.error('Screen load failed:', e);
    document.getElementById('app').innerHTML = `<div class="p-card"><h3>Error loading ${name}</h3><p>${e.message}</p></div>`;
  }
}

// Update data bindings
function updateBindings() {
  document.querySelectorAll('[data-bind]').forEach(el => {
    const path = el.dataset.bind;
    if (path) el.textContent = P.resolve(path);
  });
}

// Simulate live updates
setInterval(() => {
  Store.vessels.hlt.temp = 168 + Math.random() * 2 - 1;
  Store.vessels.mlt.temp = 152 + Math.random() * 0.5;
  Store.batch.duration++;
  updateBindings();
}, 3000);

// Init
window.addEventListener('DOMContentLoaded', () => {
  const screen = new URLSearchParams(location.search).get('screen') || 'overview';
  loadScreen(screen);
});

// Expose for debugging
window.P = P;
window.Store = Store;
window.loadScreen = loadScreen;
