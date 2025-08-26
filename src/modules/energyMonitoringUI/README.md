# Energy Monitoring UI Module

A comprehensive user interface module for monitoring energy harvested from the suspension system. This module provides real-time data visualization, storage level monitoring, usage statistics, and optimization recommendations.

## Features

### 🔋 Real-Time Energy Monitoring
- Live power generation display from all energy harvesting sources
- System efficiency tracking
- Electrical parameters monitoring (voltage, current, frequency)
- Operating conditions visualization

### 📊 Storage Level Monitoring
- Battery state of charge (SOC) display
- Charging/discharging status
- Battery health metrics
- Energy flow visualization
- Time-to-charge/discharge estimates

### 📈 Usage Statistics
- Daily, weekly, and monthly energy generation
- Efficiency trends analysis
- Peak performance tracking
- Energy consumption patterns
- Historical data visualization

### 🎯 Optimization Recommendations
- Intelligent suggestions for improving energy harvesting
- Driving pattern optimization
- Maintenance recommendations
- System configuration advice
- Performance insights

### 🚨 Alert System
- Real-time monitoring alerts
- Configurable severity levels
- Sound and push notifications
- Alert history tracking

## Components

### EnergyMonitoringDashboard
Main orchestrator component that coordinates all monitoring activities.

```typescript
import { EnergyMonitoringDashboard } from './EnergyMonitoringDashboard';

const dashboard = new EnergyMonitoringDashboard({
  refreshRate: 1000, // 1 second updates
  energyUnits: 'Wh',
  powerUnits: 'W',
  temperatureUnits: 'C'
});

dashboard.start();
```

### EnergyDataAggregator
Collects and processes data from all energy harvesting sources.

```typescript
import { EnergyDataAggregator } from './EnergyDataAggregator';

const aggregator = new EnergyDataAggregator();
const monitoringData = aggregator.aggregateEnergyData(inputs);
```

### RealTimeDataDisplay
Provides real-time visualization of energy generation data.

```typescript
import { RealTimeDataDisplay } from './RealTimeDataDisplay';

const display = new RealTimeDataDisplay(config);
const metrics = display.processRealTimeData(energyData);
```

### StorageLevelMonitor
Monitors battery storage levels and health.

```typescript
import { StorageLevelMonitor } from './StorageLevelMonitor';

const monitor = new StorageLevelMonitor(config);
const batteryDisplay = monitor.processStorageData(storageData);
```

### UsageStatisticsTracker
Tracks and analyzes energy usage patterns.

```typescript
import { UsageStatisticsTracker } from './UsageStatisticsTracker';

const tracker = new UsageStatisticsTracker(config);
const statistics = tracker.calculateUsageStatistics();
```

### OptimizationRecommendations
Generates intelligent optimization suggestions.

```typescript
import { OptimizationRecommendations } from './OptimizationRecommendations';

const optimizer = new OptimizationRecommendations();
const recommendations = optimizer.generateRecommendations(context);
```

## Usage Example

```typescript
import { 
  EnergyMonitoringDashboard,
  DashboardConfiguration 
} from './energyMonitoringUI';

// Configure dashboard
const config: DashboardConfiguration = {
  refreshRate: 1000,
  energyUnits: 'Wh',
  powerUnits: 'W',
  temperatureUnits: 'C',
  theme: {
    darkMode: false,
    primaryColor: '#2196F3',
    accentColor: '#FF9800'
  },
  display: {
    showDetailedMetrics: true,
    showOptimizationSuggestions: true,
    showAlerts: true,
    compactMode: false
  },
  alerts: {
    enableSoundAlerts: true,
    enablePushNotifications: true,
    minimumSeverity: 'warning'
  }
};

// Create dashboard instance
const dashboard = new EnergyMonitoringDashboard(config);

// Subscribe to updates
dashboard.subscribe('energy-data', (data) => {
  console.log('Energy data updated:', data);
});

dashboard.subscribe('alerts', (alerts) => {
  console.log('New alerts:', alerts);
});

// Start monitoring
dashboard.start();

// Update with real sensor data
const sensorInputs = {
  suspensionInputs: {
    verticalVelocity: 0.5,
    displacement: 0.02,
    cornerLoad: 500,
    roadCondition: 'rough',
    vehicleSpeed: 80,
    ambientTemperature: 25
  },
  damperInputs: {
    compressionVelocity: 0.3,
    displacement: 0.015,
    vehicleSpeed: 80,
    roadRoughness: 0.7,
    damperTemperature: 35,
    batterySOC: 0.75,
    loadFactor: 0.6
  },
  vehicleInputs: {
    speed: 80,
    acceleration: 0.2,
    roadSurface: 'asphalt',
    temperature: 25,
    humidity: 0.6,
    vibrationLevel: 0.4
  },
  batteryData: {
    stateOfCharge: 0.75,
    capacity: 100,
    voltage: 12.5,
    temperature: 30,
    health: 0.9
  }
};

dashboard.updateEnergyData(sensorInputs);

// Get current metrics
const metrics = dashboard.getDashboardMetrics();
console.log('Dashboard metrics:', metrics);

// Get optimization recommendations
const recommendations = dashboard.getOptimizationRecommendations();
console.log('Optimization recommendations:', recommendations);
```

## Data Flow

```
Sensor Data → EnergyDataAggregator → Dashboard Components
     ↓
Real-time Processing → Display Updates → User Interface
     ↓
Historical Storage → Statistics Analysis → Optimization
     ↓
Alert Generation → Notifications → User Actions
```

## Configuration Options

### Dashboard Configuration
- **refreshRate**: Update frequency in milliseconds
- **energyUnits**: Display units for energy (Wh, kWh, J, kJ)
- **powerUnits**: Display units for power (W, kW)
- **temperatureUnits**: Temperature display (C, F)

### Theme Configuration
- **darkMode**: Enable dark theme
- **primaryColor**: Primary UI color
- **accentColor**: Accent color for highlights

### Display Options
- **showDetailedMetrics**: Show detailed performance metrics
- **showOptimizationSuggestions**: Display optimization recommendations
- **showAlerts**: Show alert notifications
- **compactMode**: Use compact display layout

### Alert Configuration
- **enableSoundAlerts**: Enable audio notifications
- **enablePushNotifications**: Enable push notifications
- **minimumSeverity**: Minimum alert severity to display

## Performance Metrics

The module tracks various performance metrics:

- **Energy Generation**: Total power output from all sources
- **System Efficiency**: Overall energy conversion efficiency
- **Battery Health**: Battery condition and performance
- **System Uptime**: Operational reliability
- **Environmental Impact**: CO2 savings and cost benefits

## Optimization Features

### Intelligent Recommendations
- Driving pattern optimization
- System maintenance suggestions
- Energy harvesting improvements
- Battery management advice

### Performance Insights
- Efficiency trend analysis
- Peak performance identification
- Opportunity detection
- Warning notifications

### Learning Capabilities
- User behavior analysis
- Recommendation effectiveness tracking
- Personalized suggestions
- Continuous improvement

## Integration

This module integrates with:
- **Electromagnetic Shock Absorber**: Power generation data
- **Hydraulic Regenerative Damper**: Energy recovery metrics
- **Piezoelectric Harvester**: Vibration energy data
- **Battery Management System**: Storage and health data

## Browser Compatibility

- Modern browsers with ES2017+ support
- TypeScript 4.0+
- Node.js 14+ for server-side usage

## License

This module is part of the SCEV (Self-Charging Electric Vehicle) project.