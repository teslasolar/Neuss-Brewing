# 🍺 Brewery SCADA System

ISA-88/95/101 compliant brewery monitoring with Konomi 3D visualization.

## Features
- **2D/3D Toggle** - Switch between flat and 3D vessel views
- **ISA-88 Batch Control** - State machine for brewing phases
- **Real-time Monitoring** - 100ms scan rate for critical sensors
- **Recipe Management** - JSON-based recipe library
- **Alarm System** - Priority-based alerts with acknowledgment

## Quick Start
```bash
npx serve .
# Open http://localhost:3000
```

## Structure
```
scada/core/     # eVGPU, FemtoLLM, BlockArray, Cube
scada/          # UDTs, Tags, Graphics (2D/3D)
scada/screens/  # Brewhouse, Fermentation, Recipes, History
config/         # Vessels, Sensors, Alarms
recipes/        # Recipe library (JSON)
```

## ISA Standards
- **ISA-88**: Batch control states and procedures
- **ISA-95**: Level 0-4 integration model
- **ISA-101**: HMI color coding and alarm management

## Konomi Architecture
- **eVGPU**: CPU-based ML for brewing predictions
- **FemtoLLM**: 16-dim nano model for insights
- **BlockArray**: 3D grid for sensor mapping
- **BrewCube**: 9-node vessel control (8 sensors + 1 controller)

## Targets
- Files: <250 tokens each
- Load: <2s dashboard
- Scan: <100ms critical sensors
- RAM: <50MB browser

---
*"In brewing, as in code, clarity and consistency produce the best results."*
