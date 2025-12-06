// API Index - Export all APIs
export {default as API} from './template.js';
export {default as VesselsAPI} from './vessels.js';
export {default as BatchesAPI} from './batches.js';
export {default as RecipesAPI} from './recipes.js';
export {default as SensorsAPI} from './sensors.js';
export {default as AuthAPI} from './auth.js';
export {default as AlarmsAPI} from './alarms.js';

// Unified API router
export const Router={
  vessels:()=>import('./vessels.js').then(m=>m.default),
  batches:()=>import('./batches.js').then(m=>m.default),
  recipes:()=>import('./recipes.js').then(m=>m.default),
  sensors:()=>import('./sensors.js').then(m=>m.default),
  auth:()=>import('./auth.js').then(m=>m.default),
  alarms:()=>import('./alarms.js').then(m=>m.default)
};
