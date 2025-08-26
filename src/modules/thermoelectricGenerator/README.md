# Thermoelectric Generator (TEG) Module for EV Braking Systems

This module implements Thermoelectric Generator (TEG) technology for electric vehicle braking systems, enabling the capture and conversion of waste heat generated during braking into electrical energy. The system integrates with regenerative braking to maximize energy recovery and improve overall vehicle efficiency.

## Features

### Core Functionality
- **Heat-to-Electricity Conversion**: Advanced thermoelectric energy conversion using the Seebeck effect
- **Multiple TEG Materials**: Support for various thermoelectric materials (Bi2Te3, PbTe, SiGe, CoSb3)
- **Configurable TEG Designs**: Single-stage, multi-stage, cascaded, and segmented configurations
- **Performance Optimization**: Genetic algorithm, particle swarm, and simulated annealing optimization
- **Real-time Monitoring**: Comprehensive system diagnostics and performance tracking

### Integration Capabilities
- **Regenerative Braking Integration**: Seamless integration with existing regenerative braking systems
- **Thermal Management**: Advanced thermal control and protection systems
- **Energy Recovery Strategy**: Configurable energy recovery strategies and power management
- **Safety Systems**: Thermal protection, emergency shutdown, and fault detection

### Advanced Features
- **Adaptive Cooling**: Intelligent thermal management with passive, active, and adaptive modes
- **Multi-source Energy Harvesting**: Optimization for multiple heat sources in the vehicle
- **Performance Prediction**: Lifespan estimation and reliability analysis
- **Cost Optimization**: Material and manufacturing cost analysis

## Quick Start

### Basic TEG System Usage

```typescript
import { createTEGSystem, ThermalConditions, TEGSystemInputs } from './thermoelectricGenerator';

// Create TEG system
const tegSystem = createTEGSystem();

// Define thermal conditions during braking
const thermalConditions: ThermalConditions = {
  hotSideTemperature: 200,        // °C - Brake temperature
  coldSideTemperature: 50,        // °C - Cold side temperature
  ambientTemperature: 25,         // °C - Ambient temperature
  heatFlux: 5000,                 // W/m² - Heat flux from braking
  convectionCoefficient: {
    hotSide: 50,                  // W/(m²·K)
    coldSide: 25                  // W/(m²·K)
  },
  airflow: {
    velocity: 15,                 // m/s
    temperature: 25               // °C
  },
  brakingDuration: 5,             // seconds
  brakingIntensity: 0.7           // 70% braking intensity
};

// Calculate TEG performance
const performance = tegSystem.calculateTEGPower('brake_disc_teg', {
  thermalConditions,
  operatingMode: 'maximum_power',
  coolingSystemActive: true,
  thermalProtectionEnabled: true
});

console.log(`TEG Power Output: ${performance.electricalPower.toFixed(2)} W`);
console.log(`Efficiency: ${performance.efficiency.toFixed(2)}%`);
```

### Integrated Braking System

```typescript
import { createIntegratedBrakingSystem, IntegratedBrakingInputs } from './thermoelectricGenerator';

// Create integrated braking system
const integratedSystem = createIntegratedBrakingSystem();

// Define braking scenario
const brakingInputs: IntegratedBrakingInputs = {
  drivingSpeed: 80,               // km/h
  brakingIntensity: 0.6,          // 60% braking intensity
  batterySOC: 0.7,                // 70% battery state of charge
  motorTemperature: 85,           // °C
  brakeTemperature: 220,          // °C
  ambientTemperature: 25,         // °C
  airflow: 22,                    // m/s
  tegSystemEnabled: true,
  thermalManagementMode: 'adaptive'
};

// Calculate integrated performance
const results = integratedSystem.calculateIntegratedBraking(brakingInputs);

console.log(`Total Recovered Power: ${results.totalRecoveredPower.toFixed(2)} W`);
console.log(`TEG Contribution: ${results.tegPower.toFixed(2)} W`);
console.log(`System Efficiency: ${results.systemEfficiency.toFixed(2)}%`);
```

## Architecture

### Module Structure

```
src/modules/thermoelectricGenerator/
├── index.ts                     # Main module exports
├── types.ts                     # Type definitions and interfaces
├── utils.ts                     # Utility functions and calculations
├── ThermoelectricGenerator.ts   # Core TEG system implementation
├── TEGBrakingIntegration.ts     # Integration with braking systems
├── ThermalManagement.ts         # Thermal management system
├── examples/                    # Usage examples
│   ├── BasicUsageExample.ts
│   ├── IntegratedBrakingExample.ts
│   └── ComprehensiveExample.ts
├── tests/                       # Test suites
│   ├── ThermoelectricGenerator.test.ts
│   └── TEGBrakingIntegration.test.ts
└── README.md                    # This file
```

### Key Components

#### ThermoelectricGenerator
The core class that handles thermoelectric energy conversion:
- Material property calculations
- Temperature-dependent performance modeling
- Power output optimization
- Thermal protection and safety

#### TEGBrakingIntegration
Integrates TEG systems with regenerative braking:
- Coordinated energy recovery
- Power management and distribution
- Thermal condition monitoring
- System diagnostics

#### ThermalManagement
Manages thermal conditions for optimal performance:
- Active and passive cooling strategies
- Temperature control and protection
- Heat exchanger modeling
- Thermal efficiency optimization

## Configuration Options

### TEG Materials

The module supports various thermoelectric materials:

- **Bismuth Telluride (Bi2Te3)**: Best for low-temperature applications (< 200°C)
- **Lead Telluride (PbTe)**: Optimal for medium-temperature applications (200-600°C)
- **Silicon Germanium (SiGe)**: Suitable for high-temperature applications (> 600°C)
- **Cobalt Antimonide (CoSb3)**: Good balance for automotive applications (300-700°C)

### TEG Configurations

Multiple TEG configurations are available:

- **Single-stage**: Simple, cost-effective design
- **Multi-stage**: Improved efficiency with multiple TE stages
- **Cascaded**: Optimized for wide temperature ranges
- **Segmented**: Advanced design for maximum performance

### Placement Options

TEG systems can be placed at various locations:

- **Brake Disc**: Direct heat capture from brake disc
- **Brake Caliper**: Heat capture from brake caliper
- **Motor Housing**: Heat recovery from motor losses
- **Exhaust Manifold**: High-temperature heat recovery

## Performance Characteristics

### Typical Performance Metrics

- **Power Output**: 50-500 W depending on configuration and conditions
- **Efficiency**: 3-12% thermal conversion efficiency
- **Power Density**: 0.5-2.0 W/kg
- **Operating Temperature**: -40°C to 700°C (material dependent)
- **Lifespan**: 5-15 years depending on operating conditions

### Energy Recovery Benefits

- **Additional Energy Recovery**: 5-15% increase in total energy recovery
- **Brake Temperature Reduction**: 10-30°C reduction in peak brake temperatures
- **System Efficiency**: 2-8% improvement in overall braking system efficiency
- **Range Extension**: 1-3% increase in vehicle range

## Testing and Validation

### Test Coverage

The module includes comprehensive test suites covering:

- TEG power calculation accuracy
- Thermal condition validation
- Integration with braking systems
- Error handling and edge cases
- Performance optimization algorithms

### Running Tests

```bash
# Run all TEG tests
npm test -- --testPathPattern=thermoelectricGenerator

# Run specific test suites
npm test ThermoelectricGenerator.test.ts
npm test TEGBrakingIntegration.test.ts
```

### Examples

Run the provided examples to see the system in action:

```bash
# Basic usage examples
npx ts-node src/modules/thermoelectricGenerator/examples/BasicUsageExample.ts

# Integrated braking examples
npx ts-node src/modules/thermoelectricGenerator/examples/IntegratedBrakingExample.ts

# Comprehensive system demonstration
npx ts-node src/modules/thermoelectricGenerator/examples/ComprehensiveExample.ts
```

## Advanced Usage

### Custom TEG Configuration

```typescript
import { TEGConfiguration, ThermoelectricMaterial } from './thermoelectricGenerator';

// Define custom thermoelectric material
const customMaterial: ThermoelectricMaterial = {
  name: 'Advanced TE Material',
  type: 'n-type',
  seebeckCoefficient: -350,
  electricalConductivity: 30000,
  thermalConductivity: 2.5,
  ztValue: 2.0,
  operatingTempRange: { min: 100, max: 500 },
  density: 6500,
  specificHeat: 300,
  thermalExpansion: 8e-6,
  cost: 500
};

// Create custom TEG configuration
const customConfig: TEGConfiguration = {
  id: 'custom_high_performance_teg',
  type: 'cascaded',
  dimensions: { length: 120, width: 100, height: 25 },
  thermoelectricPairs: 250,
  pTypeMaterial: customMaterial,
  nTypeMaterial: customMaterial,
  legDimensions: { length: 5, crossSectionalArea: 8 },
  electricalConfiguration: 'series',
  heatExchanger: {
    hotSideType: 'heat_pipe',
    coldSideType: 'liquid_cooled',
    hotSideArea: 120,
    coldSideArea: 200,
    thermalResistance: { hotSide: 0.02, coldSide: 0.06 }
  },
  placement: {
    location: 'brake_disc',
    mountingType: 'heat_pipe_coupled',
    thermalInterfaceMaterial: 'liquid_metal'
  }
};

// Add to TEG system
tegSystem.addTEGConfiguration(customConfig);
tegSystem.addThermoelectricMaterial(customMaterial);
```

### Custom Energy Recovery Strategy

```typescript
import { EnergyRecoveryStrategy } from './thermoelectricGenerator';

const customStrategy: EnergyRecoveryStrategy = {
  prioritizeRegeneration: false,  // Prioritize TEG over regeneration
  tegActivationThreshold: {
    temperature: 60,              // Lower activation temperature
    brakingIntensity: 0.2,        // Lower intensity threshold
    duration: 1                   // Shorter duration threshold
  },
  powerManagement: {
    maxTegPower: 800,             // Higher max TEG power
    batteryChargingPriority: false,
    supercapacitorBuffering: true
  },
  thermalLimits: {
    maxBrakeTemp: 400,            // Higher temperature limit
    tegShutdownTemp: 350,
    coolingActivationTemp: 150
  }
};

const customIntegratedSystem = createIntegratedBrakingSystem(undefined, customStrategy);
```

### Performance Optimization

```typescript
// Optimize TEG configuration for specific conditions
const targetConditions: ThermalConditions = {
  hotSideTemperature: 250,
  coldSideTemperature: 60,
  ambientTemperature: 30,
  heatFlux: 6000,
  convectionCoefficient: { hotSide: 55, coldSide: 28 },
  airflow: { velocity: 18, temperature: 30 },
  brakingDuration: 8,
  brakingIntensity: 0.8
};

const constraints = {
  maxCost: 5000,
  maxSize: { length: 150, width: 120, height: 30 },
  minPower: 100,
  minEfficiency: 8
};

const optimization = tegSystem.optimizeTEGConfiguration(
  'brake_disc_teg',
  targetConditions,
  constraints
);

console.log(`Optimized Power: ${optimization.expectedPerformance.electricalPower.toFixed(2)} W`);
console.log(`Optimization Score: ${optimization.optimizationScore.toFixed(2)}`);
```

## Safety and Protection

### Thermal Protection

The system includes multiple layers of thermal protection:

- **Temperature Monitoring**: Continuous monitoring of all critical temperatures
- **Thermal Limits**: Configurable temperature limits with automatic protection
- **Emergency Shutdown**: Automatic system shutdown at critical temperatures
- **Cooling System Integration**: Active cooling system coordination

### Fault Detection

- **Material Degradation**: Detection of thermoelectric material degradation
- **Thermal Runaway**: Prevention of thermal runaway conditions
- **Electrical Faults**: Detection of electrical faults and short circuits
- **System Diagnostics**: Comprehensive system health monitoring

## Contributing

When contributing to the TEG module:

1. Follow the existing code structure and patterns
2. Add comprehensive tests for new functionality
3. Update documentation and examples
4. Ensure thermal safety considerations are addressed
5. Validate performance claims with appropriate testing

## References

- Thermoelectric Materials and Devices: [DOI: 10.1038/nmat4461](https://doi.org/10.1038/nmat4461)
- Automotive Thermoelectric Generators: [DOI: 10.1016/j.apenergy.2019.113813](https://doi.org/10.1016/j.apenergy.2019.113813)
- TEG Integration in Vehicles: [DOI: 10.1016/j.enconman.2020.113428](https://doi.org/10.1016/j.enconman.2020.113428)

## License

This module is part of the larger energy harvesting project and follows the same licensing terms.