// Atomic Design Template System
// Hierarchy: Atoms -> Molecules -> Organisms -> Templates -> Pages
import P from '../core.js';

// Load all template layers in order
import './atoms.js';      // Basic elements: text, icon, indicator, value
import './molecules.js';  // Combinations: led-status, metric-card, labeled-bar
import './organisms.js';  // Sections: metrics-section, vessel-group, phase-timeline
import './templates.js';  // Layouts: dashboard-template, brewhouse-template

// Re-export P with all templates registered
export default P;
