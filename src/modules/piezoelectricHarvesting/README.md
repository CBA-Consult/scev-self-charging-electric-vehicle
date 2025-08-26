# Piezoelectric Energy Harvesting System

A comprehensive modeling and performance optimization system for piezoelectric energy harvesting in electric vehicles. This module provides analytical, numerical, and experimental methodologies to enhance the efficiency and reliability of piezoelectric energy harvesting systems.

## 🎯 Overview

This system implements advanced piezoelectric energy harvesting capabilities that integrate seamlessly with existing regenerative braking systems. It provides:

- **Analytical Modeling**: Comprehensive mathematical models for piezoelectric energy conversion
- **Numerical Optimization**: Advanced algorithms for system optimization (Genetic Algorithm, Particle Swarm, Simulated Annealing)
- **Multi-Source Harvesting**: Energy collection from road vibrations, suspension movement, and tire deformation
- **Performance Optimization**: Real-time efficiency and reliability enhancement
- **Experimental Validation**: Model calibration and validation capabilities
- **Predictive Maintenance**: Health monitoring and lifespan prediction

## 🏗️ Architecture

### Core Components

1. **PiezoelectricEnergyHarvester**: Main harvesting system with material database and optimization algorithms
2. **NumericalAnalysis**: Advanced finite element analysis and modal analysis capabilities
3. **PiezoelectricIntegration**: Integration with fuzzy control systems and energy management

### Key Features

- **Material Database**: Comprehensive database of piezoelectric materials (PZT-5H, PZT-4, PVDF, PMN-PT)
- **Harvester Configurations**: Multiple harvester types (cantilever, stack, cymbal, bimorph)
- **Environmental Adaptation**: Real-time adaptation to road conditions and temperature
- **Multi-Objective Optimization**: Simultaneous optimization of power, efficiency, and reliability
- **Predictive Analytics**: Machine learning-based performance prediction and maintenance scheduling

## 🚀 Quick Start

### Basic Usage

```typescript
import { 
  PiezoelectricEnergyHarvester,
  defaultPiezoelectricMaterials,
  type HarvesterConfiguration,
  type EnvironmentalConditions
} from './piezoelectricHarvesting';

// Create harvester system
const harvester = new PiezoelectricEnergyHarvester();

// Configure a road vibration harvester
const config: HarvesterConfiguration = {
  type: 'cantilever',
  dimensions: { length: 50, width: 20, thickness: 0.5 },
  material: defaultPiezoelectricMaterials.PZT_5H,
  resonantFrequency: 25,
  dampingRatio: 0.02,
  loadResistance: 100000,
  capacitance: 47
};

// Define environmental conditions
const conditions: EnvironmentalConditions = {
  temperature: 25,
  humidity: 50,
  vibrationFrequency: 25,
  accelerationAmplitude: 5,
  stressAmplitude: 10,
  roadSurfaceType: 'highway',
  vehicleSpeed: 80
};

// Calculate power output
const performance = harvester.calculatePiezoelectricPower(config, conditions);
console.log(`Power Output: ${performance.instantaneousPower.toFixed(3)} W`);
console.log(`Efficiency: ${performance.efficiency.toFixed(1)}%`);
```

### Integrated System Usage

```typescript
import { 
  PiezoelectricIntegration,
  type IntegratedSystemInputs
} from './piezoelectricHarvesting';

// Vehicle parameters
const vehicleParams = {
  mass: 1800,
  frontAxleWeightRatio: 0.6,
  wheelRadius: 0.35,
  motorCount: 2,
  maxMotorTorque: 400,
  motorEfficiency: 0.92,
  transmissionRatio: 1.0
};

// Create integrated system
const integratedSystem = new PiezoelectricIntegration(vehicleParams);

// Define system inputs
const inputs: IntegratedSystemInputs = {
  vehicleSpeed: 80,
  brakePedalPosition: 0.3,
  batterySOC: 0.7,
  piezoelectricSources: {
    roadVibrations: { frequency: 25, amplitude: 5, powerSpectralDensity: [1, 2, 3] },
    suspensionMovement: { displacement: 10, velocity: 50, force: 1000 },
    tireDeformation: { contactPressure: 2, deformationRate: 100, rollingResistance: 200 },
    engineVibrations: { frequency: 40, amplitude: 3 }
  },
  harvestingEnabled: true,
  optimizationMode: 'balanced',
  environmentalFactors: {
    roadCondition: 'good',
    weatherCondition: 'clear',
    trafficDensity: 'moderate'
  },
  // ... other required inputs
};

// Process integrated system
const outputs = integratedSystem.processIntegratedSystem(inputs);
console.log(`Total Energy Generated: ${outputs.energyManagement.totalEnergyGenerated.toFixed(2)} W`);
```

## 📊 Performance Metrics

### Power Output
- **Instantaneous Power**: Real-time power generation
- **Average Power**: Time-averaged power output
- **Peak Power**: Maximum power capability
- **Power Density**: Power per unit volume (W/cm³)

### Efficiency Metrics
- **Energy Conversion Efficiency**: Mechanical to electrical conversion
- **Overall System Efficiency**: End-to-end efficiency including losses
- **Temperature Efficiency**: Performance at various temperatures
- **Frequency Response Efficiency**: Performance across frequency spectrum

### Reliability Metrics
- **System Reliability Score**: Overall system health (0-100%)
- **Component Health**: Individual component status
- **Predicted Lifespan**: Estimated operational life (hours)
- **Maintenance Schedule**: Predictive maintenance timing

## 🔧 Configuration Options

### Piezoelectric Materials

| Material | Piezo Constant (pC/N) | Coupling Coeff | Curie Temp (°C) | Max Stress (MPa) |
|----------|----------------------|----------------|-----------------|------------------|
| PZT-5H   | 593                  | 0.75           | 193             | 110              |
| PZT-4    | 289                  | 0.70           | 328             | 140              |
| PVDF     | 33                   | 0.12           | 80              | 50               |
| PMN-PT   | 1500                 | 0.92           | 130             | 25               |

### Harvester Types

1. **Cantilever**: Best for low-frequency vibrations (1-50 Hz)
2. **Stack**: Optimal for high-force, low-displacement applications
3. **Cymbal**: Excellent for pressure-based energy harvesting
4. **Bimorph**: Enhanced power output with dual-layer design

### Optimization Algorithms

1. **Genetic Algorithm**: Global optimization with population-based search
2. **Particle Swarm Optimization**: Swarm intelligence for parameter tuning
3. **Simulated Annealing**: Probabilistic optimization for complex landscapes

## 🧪 Advanced Features

### Numerical Analysis

```typescript
import { NumericalAnalysis } from './piezoelectricHarvesting';

const analysis = new NumericalAnalysis();

// Perform modal analysis
const modalResults = analysis.performModalAnalysis(config);
console.log(`Natural Frequencies: ${modalResults.naturalFrequencies}`);

// Frequency response analysis
const frequencyResponse = analysis.performFrequencyResponse(
  config, 
  { min: 1, max: 100, points: 100 }
);

// Sensitivity analysis for optimization
const sensitivity = analysis.performSensitivityAnalysis(
  config, 
  ['length', 'width', 'thickness']
);
```

### Multi-Objective Optimization

```typescript
// Define optimization constraints
const constraints = {
  targetPowerOutput: 1000,    // W
  maxWeight: 50,              // kg
  maxVolume: 10000,           // cm³
  minReliability: 0.9,        // 90%
  operatingTemperatureRange: { min: -20, max: 80 },
  costConstraint: 15000       // $
};

// Optimize for multiple sources
const optimizationResult = harvester.optimizeMultiSourceHarvesting(
  multiSourceInputs,
  constraints
);
```

### Experimental Validation

```typescript
// Calibrate model with experimental data
const experimentalData = {
  testConditions: [
    { frequency: 25, amplitude: 5, temperature: 25, measuredPower: 0.387 }
  ],
  materialProperties: {
    measuredPiezoConstant: 580,
    measuredCouplingCoeff: 0.73
  }
};

// Validate predictions against measurements
const validationResults = validateModel(experimentalData);
console.log(`Average Error: ${validationResults.averageError.toFixed(1)}%`);
```

## 📈 Performance Optimization

### Energy Management Strategies

1. **Power Maximization**: Optimize for maximum power output
2. **Efficiency Optimization**: Focus on energy conversion efficiency
3. **Reliability Focus**: Prioritize system longevity and reliability
4. **Balanced Strategy**: Optimize across multiple objectives

### Adaptive Learning

The system includes adaptive learning capabilities that automatically adjust parameters based on:
- Driving patterns and habits
- Environmental conditions
- Component performance degradation
- Energy demand patterns

### Predictive Maintenance

```typescript
// Get maintenance predictions
const diagnostics = integratedSystem.getSystemDiagnostics();
console.log(`Next Maintenance: ${diagnostics.maintenanceData.maintenanceSchedule.nextInspection}`);

// Component health monitoring
for (const [component, health] of diagnostics.maintenanceData.componentHealth) {
  console.log(`${component}: ${(health * 100).toFixed(1)}% health`);
}
```

## 🧪 Testing and Validation

### Unit Tests

```bash
npm test -- piezoelectricHarvesting
```

### Example Usage

```typescript
// Run basic examples
import { runAllExamples } from './examples/BasicUsageExample';
runAllExamples();

// Run advanced examples
import { runAllAdvancedExamples } from './examples/AdvancedOptimizationExample';
runAllAdvancedExamples();
```

## 📚 API Reference

### Core Classes

#### PiezoelectricEnergyHarvester
- `calculatePiezoelectricPower(config, conditions)`: Calculate power output
- `optimizeMultiSourceHarvesting(inputs, constraints)`: Multi-source optimization
- `addCustomMaterial(material)`: Add custom piezoelectric material
- `getSystemDiagnostics()`: Get system status and diagnostics

#### NumericalAnalysis
- `performFEA(config, conditions)`: Finite element analysis
- `performModalAnalysis(config)`: Modal analysis for natural frequencies
- `performFrequencyResponse(config, range)`: Frequency response analysis
- `performSensitivityAnalysis(config, variables)`: Sensitivity analysis
- `optimizeDesign(config, variables, constraints)`: Design optimization

#### PiezoelectricIntegration
- `processIntegratedSystem(inputs)`: Main processing function
- `setEnergyStrategy(strategy)`: Set energy management strategy
- `addEnergyStrategy(strategy)`: Add custom energy strategy
- `performAdvancedAnalysis(config, type)`: Advanced numerical analysis

### Utility Functions

#### piezoelectricUtils
- `calculateTheoreticalMaxPower()`: Theoretical maximum power calculation
- `calculateCantileverResonantFrequency()`: Resonant frequency calculation
- `calculateOptimalLoadResistance()`: Optimal load resistance
- `estimateLifespan()`: Lifespan estimation

#### validationUtils
- `validateMaterial()`: Validate material properties
- `validateConfiguration()`: Validate harvester configuration
- `validateEnvironmentalConditions()`: Validate environmental inputs

## 🔬 Research Applications

This system is designed for research and development in:

- **Automotive Energy Harvesting**: Vehicle-integrated energy recovery systems
- **Smart Transportation**: Intelligent energy management for electric vehicles
- **Sustainable Mobility**: Renewable energy integration in transportation
- **Materials Research**: Piezoelectric material characterization and optimization
- **System Integration**: Multi-physics system modeling and optimization

## 🤝 Contributing

Contributions are welcome! Please see the main project contributing guidelines.

### Development Setup

1. Install dependencies: `npm install`
2. Run tests: `npm test`
3. Build: `npm run build`
4. Run examples: `npm run examples`

### Adding New Features

1. **New Materials**: Add to the materials database in `PiezoelectricEnergyHarvester`
2. **New Harvester Types**: Extend the `HarvesterConfiguration` interface
3. **New Optimization Algorithms**: Implement in the optimization methods
4. **New Analysis Methods**: Add to the `NumericalAnalysis` class

## 📄 License

This project is licensed under the same terms as the main project.

## 📞 Support

For questions, issues, or contributions, please refer to the main project documentation and issue tracker.

---

*This piezoelectric energy harvesting system represents a comprehensive solution for modeling, optimizing, and implementing piezoelectric energy recovery in electric vehicles, contributing to enhanced efficiency and sustainability in transportation systems.*