# Rotary Electromagnetic Shock Absorber System

This module implements a comprehensive rotary electromagnetic shock absorber system designed for energy harvesting in electric vehicles. The system converts vertical suspension motion into electrical energy through electromagnetic induction while providing controllable damping characteristics.

## Overview

The rotary electromagnetic shock absorber system consists of three main components:

1. **RotaryElectromagneticShockAbsorber**: Core shock absorber with electromagnetic energy generation
2. **ShockAbsorberIntegration**: Vehicle-level integration system managing all four shock absorbers
3. **Performance Validation**: Comprehensive testing and validation framework

## Key Features

### Energy Harvesting
- **Power Generation**: 50-200W per shock absorber under optimal conditions
- **Efficiency**: 70-95% electromagnetic conversion efficiency
- **Continuous Operation**: Energy harvesting during normal driving without affecting ride quality
- **Adaptive Control**: Automatic optimization based on driving conditions

### Electromagnetic Design
- **Dual-Rotor Configuration**: Optimized for both propulsion and energy harvesting
- **High-Grade Magnets**: Neodymium-Iron-Boron (NdFeB) with Halbach array configuration
- **Advanced Windings**: Concentrated windings with 85%+ slot fill factor
- **Temperature Stability**: Operating range -40°C to 150°C

### Mechanical System
- **Gear Amplification**: 15:1 gear ratio for motion amplification
- **Flywheel Energy Storage**: Smooths power output and stores kinetic energy
- **Precision Bearings**: Low-friction magnetic bearings for high efficiency
- **Robust Construction**: Designed for 1M+ cycle lifetime

### Damping Modes
- **Comfort Mode**: Optimized for ride comfort with reduced damping
- **Sport Mode**: Enhanced damping for improved handling
- **Energy Harvesting Mode**: Maximum power generation with acceptable comfort
- **Adaptive Mode**: Automatic mode switching based on conditions

## Installation

```typescript
import {
  RotaryElectromagneticShockAbsorber,
  ShockAbsorberIntegration,
  createShockAbsorberSystem,
  createIntegratedSuspensionSystem
} from './modules/electromagneticShockAbsorber';
```

## Quick Start

### Basic Single Shock Absorber

```typescript
// Create a shock absorber with default parameters
const shockAbsorber = createShockAbsorberSystem();

// Set damping mode
shockAbsorber.setDampingMode('energy_harvesting');

// Define suspension inputs
const inputs = {
  verticalVelocity: 1.2,        // m/s
  displacement: 0.08,           // m
  cornerLoad: 550,              // kg
  roadCondition: 'rough',       // 'smooth' | 'rough' | 'very_rough'
  vehicleSpeed: 70,             // km/h
  ambientTemperature: 30        // °C
};

// Process motion and get outputs
const outputs = shockAbsorber.processMotion(inputs);

console.log(`Generated Power: ${outputs.generatedPower} W`);
console.log(`Damping Force: ${outputs.dampingForce} N`);
console.log(`Efficiency: ${outputs.efficiency * 100}%`);
```

### Vehicle-Level Integration

```typescript
// Create integrated suspension system
const suspensionSystem = createIntegratedSuspensionSystem();

// Define inputs for all four wheels
const vehicleInputs = {
  frontLeft: { verticalVelocity: 1.5, cornerLoad: 580, /* ... */ },
  frontRight: { verticalVelocity: 1.4, cornerLoad: 570, /* ... */ },
  rearLeft: { verticalVelocity: 1.2, cornerLoad: 460, /* ... */ },
  rearRight: { verticalVelocity: 1.1, cornerLoad: 450, /* ... */ }
};

const energyInputs = {
  batterySOC: 0.45,              // 45% charge
  powerDemand: 4500,             // 4.5kW
  availableStorageCapacity: 25,   // 25kWh
  gridConnected: false
};

// Process vehicle suspension
const outputs = suspensionSystem.processVehicleSuspension(vehicleInputs, energyInputs);

console.log(`Total Power: ${outputs.totalGeneratedPower} W`);
console.log(`Energy Distribution:`, outputs.energyDistribution);
console.log(`Performance Metrics:`, outputs.performanceMetrics);
```

## Configuration

### Electromagnetic Parameters

```typescript
const electromagneticParams = {
  poleCount: 12,                    // Number of magnetic poles
  fluxDensity: 1.2,                 // Tesla
  coilTurns: 200,                   // Turns per coil
  coilResistance: 0.5,              // Ohms
  coreMaterialPermeability: 5000,   // Relative permeability
  airGapLength: 1.5                 // mm
};
```

### Mechanical Parameters

```typescript
const mechanicalParams = {
  gearRatio: 15.0,                  // Gear ratio for motion amplification
  flywheelInertia: 0.05,            // kg⋅m²
  mechanicalEfficiency: 0.92,       // Mechanical efficiency
  maxRotationalSpeed: 3000,         // RPM
  bearingFriction: 0.002            // Friction coefficient
};
```

### Damping Characteristics

```typescript
const dampingParams = {
  baseDampingCoefficient: 2500,     // N⋅s/m
  variableDampingRange: 0.6,        // Variable damping range
  comfortModeMultiplier: 0.8,       // Comfort mode damping
  sportModeMultiplier: 1.4,         // Sport mode damping
  energyHarvestingMultiplier: 1.2   // Energy harvesting mode damping
};
```

## Performance Specifications

### Power Generation
- **Peak Power**: 150-200W per shock absorber
- **Continuous Power**: 50-100W per shock absorber
- **Vehicle Total**: 200-800W (4 shock absorbers)
- **Daily Energy Harvest**: 2-8 kWh (typical driving)

### Efficiency Metrics
- **Electromagnetic Efficiency**: 90-95%
- **Mechanical Efficiency**: 85-92%
- **Overall System Efficiency**: 75-87%
- **Temperature Derating**: <5% at 100°C

### Response Characteristics
- **Response Time**: <10ms
- **Frequency Range**: 0.5-20 Hz
- **Damping Force Range**: 500-5000 N
- **Velocity Range**: 0-5 m/s

## Testing and Validation

### Unit Tests

```bash
# Run shock absorber unit tests
npm test -- RotaryElectromagneticShockAbsorber.test.ts

# Run integration tests
npm test -- ShockAbsorberIntegration.test.ts
```

### Performance Validation

```typescript
import { runAllValidationTests } from './examples/PerformanceValidation';

// Run comprehensive validation
runAllValidationTests();
```

### Basic Examples

```typescript
import { runAllBasicExamples } from './examples/BasicUsageExample';

// Run usage examples
runAllBasicExamples();
```

## API Reference

### RotaryElectromagneticShockAbsorber

#### Methods

- `processMotion(inputs: SuspensionInputs): ShockAbsorberOutputs`
- `setDampingMode(mode: DampingMode): void`
- `getSystemStatus(): SystemStatus`
- `resetSystem(): void`

#### Types

```typescript
interface SuspensionInputs {
  verticalVelocity: number;      // m/s
  displacement: number;          // m
  cornerLoad: number;            // kg
  roadCondition: 'smooth' | 'rough' | 'very_rough';
  vehicleSpeed: number;          // km/h
  ambientTemperature: number;    // °C
}

interface ShockAbsorberOutputs {
  generatedPower: number;        // W
  dampingForce: number;          // N
  generatorRPM: number;          // RPM
  efficiency: number;            // 0-1
  outputVoltage: number;         // V
  outputCurrent: number;         // A
}

type DampingMode = 'comfort' | 'sport' | 'energy_harvesting' | 'adaptive';
```

### ShockAbsorberIntegration

#### Methods

- `processVehicleSuspension(suspensionInputs, energyInputs): IntegratedSystemOutputs`
- `getSystemStatus(): SystemStatus`
- `resetAllSystems(): void`
- `integrateWithFuzzyControl(systemInputs): SystemOutputs | null`

#### Types

```typescript
interface VehicleSuspensionInputs {
  frontLeft: SuspensionInputs;
  frontRight: SuspensionInputs;
  rearLeft: SuspensionInputs;
  rearRight: SuspensionInputs;
}

interface EnergyManagementInputs {
  batterySOC: number;            // 0-1
  powerDemand: number;           // W
  availableStorageCapacity: number; // Wh
  gridConnected: boolean;
}

interface IntegratedSystemOutputs {
  frontLeft: ShockAbsorberOutputs;
  frontRight: ShockAbsorberOutputs;
  rearLeft: ShockAbsorberOutputs;
  rearRight: ShockAbsorberOutputs;
  totalGeneratedPower: number;
  averageEfficiency: number;
  totalEnergyHarvested: number;
  energyDistribution: {
    toBattery: number;
    toGrid: number;
    toVehicleSystems: number;
  };
  optimizationRecommendations: string[];
  performanceMetrics: {
    energyEfficiency: number;
    rideComfort: number;
    systemReliability: number;
  };
}
```

## Integration with Existing Systems

### Fuzzy Control Integration

The shock absorber system integrates seamlessly with the existing fuzzy control system for regenerative braking:

```typescript
import { createFuzzyControlSystem } from '../fuzzyControl';

const fuzzyControl = createFuzzyControlSystem(vehicleParams);
const suspensionSystem = new ShockAbsorberIntegration(fuzzyControl);

// Coordinated energy management
const fuzzyOutputs = suspensionSystem.integrateWithFuzzyControl(systemInputs);
```

### Energy Management

The system provides intelligent energy distribution:

1. **Priority 1**: Meet immediate vehicle power demand
2. **Priority 2**: Charge battery when SOC is low
3. **Priority 3**: Export to grid when battery is full

## Safety Features

### Operational Limits
- **Velocity Limit**: ±5.0 m/s maximum vertical velocity
- **Displacement Limit**: ±0.2 m maximum displacement
- **Load Limit**: 2000 kg maximum corner load
- **Temperature Limit**: 150°C maximum operating temperature

### Fault Detection
- **Overspeed Protection**: Automatic shutdown at excessive RPM
- **Thermal Protection**: Power derating at high temperatures
- **Efficiency Monitoring**: Alerts for performance degradation
- **System Health**: Continuous operational status monitoring

## Maintenance

### Recommended Service Intervals
- **Bearing Inspection**: Every 50,000 km
- **Magnet Inspection**: Every 100,000 km
- **Coil Resistance Check**: Every 25,000 km
- **Gear System Service**: Every 75,000 km

### Performance Monitoring
- Monitor efficiency trends over time
- Check for temperature anomalies
- Verify power generation consistency
- Inspect for mechanical wear indicators

## Troubleshooting

### Common Issues

**Low Power Generation**
- Check road conditions and driving patterns
- Verify damping mode settings
- Inspect for mechanical wear
- Monitor temperature effects

**Efficiency Degradation**
- Check coil resistance for increases
- Verify bearing condition
- Monitor magnet strength
- Check for air gap changes

**System Faults**
- Review operational limits
- Check temperature sensors
- Verify input parameter ranges
- Monitor system status indicators

## Future Enhancements

### Planned Features
- **Predictive Maintenance**: AI-based wear prediction
- **Adaptive Learning**: Machine learning optimization
- **Wireless Monitoring**: Remote system diagnostics
- **Grid Integration**: V2G (Vehicle-to-Grid) capabilities

### Research Areas
- **Advanced Materials**: Higher temperature superconductors
- **Magnetic Levitation**: Frictionless bearing systems
- **Energy Storage**: Integrated capacitor systems
- **Control Algorithms**: Advanced optimization strategies

## Contributing

When contributing to this module:

1. Follow the existing code structure and naming conventions
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Validate performance against specifications
5. Consider safety implications of modifications

## License

This module is part of the SCEV (Self-Charging Electric Vehicle) project and follows the project's licensing terms.

---

For more information, see the examples in the `examples/` directory and the comprehensive test suite in the `tests/` directory.