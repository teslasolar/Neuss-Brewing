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
