# Suspension Energy Storage System

This module provides a comprehensive energy storage solution specifically designed for harvested energy from vehicle suspension systems. The system efficiently manages energy flow between supercapacitors and battery packs to handle power spikes and provide gradual charging capabilities.

## 🎯 Overview

The Suspension Energy Storage System addresses the unique challenges of suspension energy harvesting:

- **Variable Power Generation**: Suspension motion creates highly variable and intermittent power
- **Power Spikes**: Sudden road impacts generate high power peaks that need immediate absorption
- **Energy Smoothing**: Converting variable input power to steady, controlled charging
- **Efficiency Optimization**: Minimizing losses during energy conversion and storage

## 🏗️ System Architecture

### Core Components

1. **SuspensionEnergyStorageSystem**: Main energy storage controller
2. **PowerManagementUnit**: Advanced power flow management and spike mitigation
3. **EnergyStorageController**: High-level system coordination and optimization

### Key Features

- **Dual Storage Architecture**: Supercapacitors for power spikes + batteries for long-term storage
- **Intelligent Power Management**: Automatic power flow optimization based on system conditions
- **Spike Mitigation**: Advanced algorithms to handle sudden power surges
- **Thermal Management**: Temperature monitoring and protection systems
- **Predictive Control**: Energy forecasting and load prediction
- **Safety Systems**: Comprehensive fault detection and protection

## 🚀 Quick Start

### Basic Setup

```typescript
import { EnergyStorageController } from './EnergyStorageController';
import { EnergyStorageSystemConfig } from './types';

// Configure the energy storage system
const config: EnergyStorageSystemConfig = {
  capacitorBank: {
    totalCapacitance: 100,     // 100F supercapacitor bank
    maxVoltage: 48,            // 48V maximum voltage
    maxCurrent: 200,           // 200A maximum current
    energyDensity: 5,          // 5 Wh/kg
    powerDensity: 10000,       // 10 kW/kg
    internalResistance: 0.001, // 1 mΩ
    temperatureRange: [-40, 70],
    cycleLife: 1000000,
    selfDischargeRate: 0.1     // 0.1% per hour
  },
  batteryPack: {
    totalCapacity: 5000,       // 5 kWh battery pack
    nominalVoltage: 48,        // 48V nominal
    maxChargeCurrent: 50,      // 50A max charge
    maxDischargeCurrent: 100,  // 100A max discharge
    energyDensity: 250,        // 250 Wh/kg
    chargeEfficiency: 0.95,    // 95% charge efficiency
    dischargeEfficiency: 0.95, // 95% discharge efficiency
    temperatureRange: [-20, 60],
    socLimits: [0.1, 0.9],     // 10-90% SOC limits
    cycleLife: 5000,
    calendarLife: 10
  },
  powerManagement: {
    maxPowerTransferRate: 2000,           // 2kW max transfer
    capacitorChargingThresholds: [0.6, 0.8], // Start/stop thresholds
    batterySupplyThresholds: [0.2, 0.9],     // Supply thresholds
    powerSmoothingTimeConstant: 5,           // 5s smoothing
    efficiencyTarget: 0.9,                   // 90% target
    thermalThresholds: [60, 80]              // Warning/critical temps
  },
  systemId: 'SESS-001',
  location: 'front_left'
};

// Create the controller
const controller = new EnergyStorageController(config);
```

### Processing Energy Storage

```typescript
import { SystemIntegrationInputs } from './types';

// Define system inputs
const inputs: SystemIntegrationInputs = {
  inputPower: 500,              // 500W from suspension harvesting
  inputVoltage: 24,             // 24V input voltage
  inputCurrent: 20.83,          // Calculated current
  suspensionVelocity: 0.8,      // 0.8 m/s suspension velocity
  vehicleSpeed: 60,             // 60 km/h vehicle speed
  ambientTemperature: 25,       // 25°C ambient temperature
  loadDemand: 300,              // 300W load demand
  predictedLoad: 280,           // Predicted future load
  roadConditionForecast: 'rough', // Road condition forecast
  tripDurationEstimate: 45,     // 45 minute trip
  energyPriority: 'medium'      // Energy priority level
};

// Process the energy storage
const outputs = controller.processControl(inputs);

console.log(`Output Power: ${outputs.outputPower}W`);
console.log(`System Efficiency: ${outputs.efficiency * 100}%`);
console.log(`Stored Energy: ${outputs.totalStoredEnergy}Wh`);
console.log(`Recommended Mode: ${outputs.recommendedHarvestingMode}`);
```

## 📊 Energy Storage Technologies

### Supercapacitor Bank

**Purpose**: Handle power spikes and provide fast energy absorption/delivery

**Characteristics**:
- **High Power Density**: 10-15 kW/kg for rapid power handling
- **Fast Response**: Sub-second response time for spike mitigation
- **Long Cycle Life**: 1+ million cycles for durability
- **Wide Temperature Range**: -40°C to +70°C operation
- **Low Internal Resistance**: <1 mΩ for high efficiency

**Applications**:
- Power spike absorption from road impacts
- Fast energy delivery for high-power loads
- Regenerative braking energy capture
- Grid frequency regulation

### Battery Pack

**Purpose**: Long-term energy storage and steady power delivery

**Characteristics**:
- **High Energy Density**: 200-300 Wh/kg for compact storage
- **Stable Voltage**: Consistent power delivery over discharge cycle
- **High Efficiency**: 95%+ round-trip efficiency
- **Long Calendar Life**: 10-15 years operational life
- **Thermal Stability**: Safe operation across temperature range

**Applications**:
- Long-term energy storage
- Steady power supply for vehicle systems
- Energy buffering for load balancing
- Emergency power backup

## 🔧 Operating Modes

### Charging Mode
- **Trigger**: Significant input power from suspension (>10W)
- **Action**: Direct charging of supercapacitors for fast energy absorption
- **Efficiency**: 95% for direct capacitor charging
- **Duration**: Continuous during energy harvesting

### Discharging Mode
- **Trigger**: Load demand present (>5W)
- **Action**: Power delivery from capacitors (high power) or battery (steady power)
- **Priority**: Capacitors for >100W loads, battery for steady loads
- **Efficiency**: 95% from capacitors, 90-95% from battery

### Balancing Mode
- **Trigger**: Capacitor SOC >60% and battery SOC <80%
- **Action**: Energy transfer from capacitors to battery
- **Rate**: Up to 2kW transfer rate with 92% efficiency
- **Purpose**: Optimize storage utilization and prepare for next energy spike

### Standby Mode
- **Trigger**: No significant power flow
- **Action**: Minimal power for system maintenance
- **Efficiency**: 99% standby efficiency
- **Functions**: Self-discharge compensation, system monitoring

### Protection Mode
- **Trigger**: Safety alarm conditions
- **Action**: Halt all power transfers, protect system components
- **Conditions**: Over-temperature, over-voltage, over-current
- **Recovery**: Manual restart after fault resolution

## 📈 Power Spike Management

### Spike Detection Algorithm

```typescript
// Power spike detection
const recentAverage = powerHistory.slice(-10).average();
const isSpike = inputPower > recentAverage * 2 && inputPower > 200;

if (isSpike) {
  // Redirect spike energy to capacitors
  const spikeEnergy = inputPower - recentAverage;
  capacitorChargePower += Math.min(spikeEnergy, maxCapacitorPower);
}
```

### Spike Mitigation Strategies

1. **Fast Capacitor Charging**: Direct spike energy to supercapacitors
2. **Power Smoothing**: Exponential moving average with configurable time constant
3. **Predictive Control**: Anticipate spikes based on suspension velocity
4. **Load Balancing**: Distribute energy across multiple storage components

### Performance Metrics

- **Spike Mitigation Effectiveness**: >95% spike energy absorption
- **Response Time**: <100ms for spike detection and response
- **Power Smoothing**: Reduces power variation by 80-90%
- **System Availability**: >99.5% uptime during normal operation

## 🌡️ Thermal Management

### Temperature Monitoring

- **Continuous Monitoring**: Real-time temperature tracking
- **Multiple Sensors**: Capacitor, battery, and ambient temperature
- **Thermal Modeling**: Predictive temperature rise calculation

### Thermal Protection

```typescript
// Temperature-based derating
const calculateTemperatureDerating = (temperature: number): number => {
  const optimalTemp = 25; // °C
  const tempDiff = Math.abs(temperature - optimalTemp);
  
  if (tempDiff <= 10) return 1.0;
  if (tempDiff <= 30) return 1.0 - (tempDiff - 10) * 0.01;
  return 0.8; // Minimum 80% at extreme temperatures
};
```

### Cooling Strategies

- **Passive Cooling**: Natural convection and vehicle airflow
- **Active Cooling**: Fan-based cooling when temperature exceeds thresholds
- **Thermal Mass**: Strategic component placement for heat dissipation
- **Power Reduction**: Automatic power limiting at high temperatures

## 🔬 Performance Optimization

### Efficiency Optimization

**Target Efficiency**: 90-95% overall system efficiency

**Optimization Strategies**:
- **Power Path Selection**: Choose most efficient power path
- **SOC Management**: Operate storage components in optimal SOC ranges
- **Temperature Control**: Maintain optimal operating temperatures
- **Load Matching**: Match power delivery to load characteristics

### Longevity Optimization

**Target Lifespan**: 10-15 years operational life

**Longevity Strategies**:
- **SOC Limiting**: Operate batteries within 10-90% SOC range
- **Cycle Depth Management**: Minimize deep discharge cycles
- **Temperature Management**: Avoid extreme temperature operation
- **Balanced Charging**: Ensure uniform cell charging in battery pack

### Responsiveness Optimization

**Target Response Time**: <1 second for power delivery

**Responsiveness Strategies**:
- **Capacitor Precharging**: Maintain minimum capacitor charge
- **Predictive Control**: Anticipate power demands
- **Fast Switching**: Rapid power path switching
- **Parallel Operation**: Simultaneous capacitor and battery operation

## 🧪 Testing and Validation

### Unit Tests

```bash
# Run unit tests
npm test src/modules/suspensionEnergyStorage/tests/
```

**Test Coverage**:
- Power flow calculations
- Safety limit enforcement
- Temperature management
- SOC management
- Efficiency calculations

### Integration Tests

```bash
# Run integration tests
npm test src/modules/suspensionEnergyStorage/tests/integration/
```

**Integration Scenarios**:
- Multi-component power flow
- System-level safety responses
- Performance optimization
- Fault handling and recovery

### Performance Tests

```bash
# Run performance benchmarks
npm run benchmark:suspension-storage
```

**Performance Metrics**:
- Power spike handling capability
- Energy conversion efficiency
- System response times
- Thermal performance
- Long-term stability

## 📚 API Reference

### Core Classes

#### SuspensionEnergyStorageSystem

Main energy storage system controller.

```typescript
class SuspensionEnergyStorageSystem {
  constructor(config: EnergyStorageSystemConfig)
  
  // Main processing function
  processEnergyStorage(inputs: SuspensionEnergyInputs): EnergyStorageOutputs
  
  // System status and metrics
  getSystemStatus(): StorageSystemStatus
  getPerformanceMetrics(): PerformanceMetrics
  getEnergyFlowMetrics(): EnergyFlowMetrics
  
  // Configuration and control
  updateConfiguration(config: Partial<EnergyStorageSystemConfig>): void
  emergencyShutdown(reason: string): void
  restartSystem(): void
}
```

#### PowerManagementUnit

Advanced power flow management and optimization.

```typescript
class PowerManagementUnit {
  constructor(
    capacitorConfig: CapacitorBankConfig,
    batteryConfig: BatteryPackConfig,
    powerConfig: PowerManagementConfig
  )
  
  // Power flow calculation
  calculatePowerFlow(
    inputs: SuspensionEnergyInputs,
    capacitorSOC: number,
    batterySOC: number,
    operatingMode: OperatingMode
  ): PowerFlowCommand
  
  // Power quality analysis
  getPowerQualityMetrics(): PowerQualityMetrics
  
  // Configuration updates
  updateConfiguration(
    capacitorConfig?: Partial<CapacitorBankConfig>,
    batteryConfig?: Partial<BatteryPackConfig>,
    powerConfig?: Partial<PowerManagementConfig>
  ): void
}
```

#### EnergyStorageController

High-level system coordination and optimization.

```typescript
class EnergyStorageController {
  constructor(
    storageSystemConfig: EnergyStorageSystemConfig,
    controllerConfig?: Partial<ControllerConfig>
  )
  
  // Main control loop
  processControl(inputs: SystemIntegrationInputs): ControllerOutputs
  
  // System status
  getSystemStatus(): {
    storage: StorageSystemStatus;
    performance: PerformanceMetrics;
    energyFlow: EnergyFlowMetrics;
    health: number;
    recommendations: string[];
  }
  
  // System control
  updateConfiguration(config: Partial<ControllerConfig>): void
  emergencyStop(reason: string): void
  restart(): void
}
```

## 🔧 Configuration Examples

### High-Performance Configuration

```typescript
const highPerformanceConfig: EnergyStorageSystemConfig = {
  capacitorBank: {
    totalCapacitance: 200,    // Large capacitor bank
    maxVoltage: 60,           // Higher voltage
    maxCurrent: 400,          // High current capability
    powerDensity: 15000,      // 15 kW/kg
    // ... other parameters
  },
  batteryPack: {
    totalCapacity: 10000,     // 10 kWh capacity
    maxChargeCurrent: 100,    // Fast charging
    maxDischargeCurrent: 200, // High discharge rate
    // ... other parameters
  },
  powerManagement: {
    maxPowerTransferRate: 5000, // 5kW transfer rate
    powerSmoothingTimeConstant: 2, // Fast smoothing
    // ... other parameters
  }
};
```

### Efficiency-Optimized Configuration

```typescript
const efficiencyConfig: EnergyStorageSystemConfig = {
  capacitorBank: {
    internalResistance: 0.0005, // Ultra-low resistance
    // ... other parameters
  },
  batteryPack: {
    chargeEfficiency: 0.98,     // High charge efficiency
    dischargeEfficiency: 0.98,  // High discharge efficiency
    // ... other parameters
  },
  powerManagement: {
    efficiencyTarget: 0.95,     // 95% efficiency target
    // ... other parameters
  }
};
```

### Longevity-Focused Configuration

```typescript
const longevityConfig: EnergyStorageSystemConfig = {
  batteryPack: {
    socLimits: [0.2, 0.8],      // Conservative SOC limits
    maxChargeCurrent: 30,       // Gentle charging
    // ... other parameters
  },
  powerManagement: {
    capacitorChargingThresholds: [0.5, 0.7], // Conservative thresholds
    thermalThresholds: [50, 70], // Lower temperature limits
    // ... other parameters
  }
};
```

## 🚨 Safety Features

### Electrical Safety

- **Overvoltage Protection**: Automatic shutdown at voltage limits
- **Overcurrent Protection**: Current limiting and circuit protection
- **Insulation Monitoring**: Continuous insulation resistance monitoring
- **Arc Fault Detection**: Detection and mitigation of electrical arcs

### Thermal Safety

- **Temperature Monitoring**: Multi-point temperature sensing
- **Thermal Runaway Prevention**: Early detection and prevention
- **Emergency Cooling**: Automatic cooling activation
- **Thermal Shutdown**: Safe shutdown at critical temperatures

### Mechanical Safety

- **Vibration Resistance**: Robust mounting and shock absorption
- **Pressure Relief**: Venting systems for gas buildup
- **Containment**: Fire-resistant enclosures
- **Emergency Disconnect**: Manual safety disconnect switches

## 🔧 Maintenance

### Routine Maintenance

**Monthly**:
- Visual inspection of connections and enclosures
- Temperature and voltage monitoring review
- Performance metrics analysis

**Quarterly**:
- Capacitor bank health assessment
- Battery pack capacity testing
- Thermal management system inspection

**Annually**:
- Complete system performance evaluation
- Safety system testing
- Firmware updates and calibration

### Diagnostic Tools

```typescript
// System diagnostics
const diagnostics = controller.getSystemStatus();

// Component health monitoring
const healthScore = diagnostics.health;
const recommendations = diagnostics.recommendations;

// Performance trending
const performance = diagnostics.performance;
const energyFlow = diagnostics.energyFlow;
```

### Troubleshooting

**Common Issues**:

1. **Low Efficiency**
   - Check temperature conditions
   - Verify SOC operating ranges
   - Inspect electrical connections

2. **Reduced Capacity**
   - Battery aging assessment
   - Capacitor degradation check
   - Calibration verification

3. **Temperature Warnings**
   - Cooling system inspection
   - Airflow verification
   - Load reduction consideration

## 🤝 Integration with Vehicle Systems

### CAN Bus Integration

```typescript
// CAN message handling
interface CANMessage {
  id: number;
  data: Buffer;
  timestamp: number;
}

// Energy storage status broadcast
const statusMessage: CANMessage = {
  id: 0x300, // Energy storage status ID
  data: Buffer.from([
    Math.floor(capacitorSOC * 255),  // Capacitor SOC (0-255)
    Math.floor(batterySOC * 255),    // Battery SOC (0-255)
    Math.floor(efficiency * 255),    // Efficiency (0-255)
    operatingMode,                   // Operating mode
    alarmStatus,                     // Alarm status
    warningStatus,                   // Warning status
    Math.floor(temperature),         // Temperature (°C)
    systemHealth                     // Health score (0-255)
  ]),
  timestamp: Date.now()
};
```

### Vehicle Control Integration

- **Energy Management System**: Coordinate with vehicle EMS
- **Thermal Management**: Integrate with vehicle cooling systems
- **Safety Systems**: Interface with vehicle safety controllers
- **User Interface**: Display energy storage status on dashboard

## 📄 License

This module is part of the SCEV project and follows the project's licensing terms.

## 📞 Support

For technical support and questions:
- Create an issue in the project repository
- Contact the SCEV development team
- Refer to the comprehensive documentation and examples

---

**Module Information:**
- **Version**: 1.0.0
- **Author**: SCEV Development Team
- **Last Updated**: 2024
- **Maintainer**: SCEV Development Team

*This suspension energy storage module represents a comprehensive solution for efficiently managing harvested energy from vehicle suspension systems, providing optimal power spike handling, energy smoothing, and long-term storage capabilities.*