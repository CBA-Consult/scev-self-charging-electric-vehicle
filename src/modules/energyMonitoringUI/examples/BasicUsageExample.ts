/**
 * Basic Usage Example for Energy Monitoring UI
 * 
 * This example demonstrates how to set up and use the energy monitoring
 * dashboard to track energy harvested from the suspension system.
 */

import { 
  EnergyMonitoringDashboard,
  DashboardConfiguration,
  AggregatorInputs 
} from '../index';

/**
 * Example: Basic Energy Monitoring Setup
 */
export function basicEnergyMonitoringExample(): void {
  console.log('=== Energy Monitoring UI - Basic Usage Example ===\n');

  // 1. Configure the dashboard
  const dashboardConfig: DashboardConfiguration = {
    refreshRate: 2000, // Update every 2 seconds
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

  // 2. Create dashboard instance
  const dashboard = new EnergyMonitoringDashboard(dashboardConfig);

  // 3. Set up event subscriptions
  setupEventSubscriptions(dashboard);

  // 4. Start monitoring
  dashboard.start();
  console.log('Dashboard started successfully');

  // 5. Simulate real-time data updates
  simulateRealTimeData(dashboard);

  // 6. Demonstrate dashboard features
  setTimeout(() => {
    demonstrateDashboardFeatures(dashboard);
  }, 10000); // After 10 seconds

  // 7. Stop monitoring after demo
  setTimeout(() => {
    dashboard.stop();
    console.log('\nDashboard stopped');
  }, 30000); // After 30 seconds
}

/**
 * Set up event subscriptions to monitor dashboard updates
 */
function setupEventSubscriptions(dashboard: EnergyMonitoringDashboard): void {
  // Subscribe to energy data updates
  dashboard.subscribe('energy-data', (data) => {
    console.log(`Energy Update - Power: ${data.realTimeData.totalPowerGeneration.toFixed(2)}W, ` +
                `Efficiency: ${(data.realTimeData.overallEfficiency * 100).toFixed(1)}%`);
  });

  // Subscribe to alert notifications
  dashboard.subscribe('alerts', (alerts) => {
    if (alerts.length > 0) {
      console.log(`🚨 New Alerts: ${alerts.length}`);
      alerts.forEach((alert: any) => {
        console.log(`  - ${alert.severity.toUpperCase()}: ${alert.title}`);
      });
    }
  });

  // Subscribe to dashboard state changes
  dashboard.subscribe('dashboard-state', (state) => {
    console.log(`Dashboard State: ${state.systemStatus} (${state.isActive ? 'Active' : 'Inactive'})`);
  });
}

/**
 * Simulate real-time sensor data
 */
function simulateRealTimeData(dashboard: EnergyMonitoringDashboard): void {
  let simulationStep = 0;
  
  const dataSimulation = setInterval(() => {
    simulationStep++;
    
    // Generate realistic sensor data
    const inputs: AggregatorInputs = generateSensorData(simulationStep);
    
    // Update dashboard with new data
    dashboard.updateEnergyData(inputs);
    
    // Stop simulation after 25 seconds
    if (simulationStep >= 25) {
      clearInterval(dataSimulation);
    }
  }, 1000);
}

/**
 * Generate realistic sensor data for simulation
 */
function generateSensorData(step: number): AggregatorInputs {
  // Simulate different driving conditions over time
  const time = step * 1000;
  const speedVariation = Math.sin(time / 10000) * 20 + 60; // Speed varies between 40-80 km/h
  const roadRoughness = Math.abs(Math.sin(time / 5000)) * 0.8 + 0.2; // Roughness varies
  
  return {
    suspensionInputs: {
      verticalVelocity: (Math.random() - 0.5) * 2 * roadRoughness,
      displacement: (Math.random() - 0.5) * 0.1 * roadRoughness,
      cornerLoad: 450 + Math.random() * 100,
      roadCondition: roadRoughness > 0.6 ? 'rough' : roadRoughness > 0.4 ? 'rough' : 'smooth',
      vehicleSpeed: speedVariation,
      ambientTemperature: 22 + Math.sin(time / 20000) * 8 // Temperature varies between 14-30°C
    },
    damperInputs: {
      compressionVelocity: (Math.random() - 0.5) * 1.5 * roadRoughness,
      displacement: (Math.random() - 0.5) * 0.08 * roadRoughness,
      vehicleSpeed: speedVariation,
      roadRoughness: roadRoughness,
      damperTemperature: 25 + Math.random() * 15 + (speedVariation - 60) * 0.2,
      batterySOC: Math.max(0.2, 0.8 - step * 0.01), // Battery slowly drains
      loadFactor: 0.5 + Math.random() * 0.3
    },
    vehicleInputs: {
      speed: speedVariation,
      acceleration: (Math.random() - 0.5) * 2,
      roadSurface: 'asphalt',
      temperature: 22 + Math.sin(time / 20000) * 8,
      humidity: 0.4 + Math.random() * 0.4,
      vibrationLevel: roadRoughness * 0.8
    },
    batteryData: {
      stateOfCharge: Math.max(0.2, 0.8 - step * 0.01),
      capacity: 100,
      voltage: 12 + Math.random() * 1.5,
      temperature: 25 + Math.random() * 10,
      health: 0.85 + Math.random() * 0.1
    }
  };
}

/**
 * Demonstrate various dashboard features
 */
function demonstrateDashboardFeatures(dashboard: EnergyMonitoringDashboard): void {
  console.log('\n=== Dashboard Features Demonstration ===');

  // 1. Get current metrics
  const metrics = dashboard.getDashboardMetrics();
  console.log('\n📊 Current Metrics:');
  console.log(`  Energy Harvested Today: ${metrics.todayEnergyHarvested.toFixed(2)} Wh`);
  console.log(`  Current Power Generation: ${metrics.currentPowerGeneration.toFixed(2)} W`);
  console.log(`  System Efficiency: ${(metrics.systemEfficiency * 100).toFixed(1)}%`);
  console.log(`  System Uptime: ${(metrics.systemUptime * 100).toFixed(1)}%`);

  // 2. Get optimization recommendations
  const recommendations = dashboard.getOptimizationRecommendations();
  console.log('\n🎯 Optimization Recommendations:');
  recommendations.slice(0, 3).forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec.title}`);
    console.log(`     Category: ${rec.category}, Priority: ${rec.priority}/5`);
    console.log(`     Potential Savings: ${rec.potentialSavings.toFixed(2)} Wh/day`);
  });

  // 3. Get performance metrics
  const performanceMetrics = dashboard.getPerformanceMetrics();
  console.log('\n📈 Performance Metrics:');
  console.log(`  Generation Efficiency: ${(performanceMetrics.generationEfficiency.current * 100).toFixed(1)}%`);
  console.log(`  System Uptime: ${(performanceMetrics.reliability.uptime * 100).toFixed(1)}%`);
  console.log(`  CO2 Saved: ${performanceMetrics.environmentalImpact.co2Saved.toFixed(2)} kg`);

  // 4. Get active alerts
  const alerts = dashboard.getActiveAlerts();
  console.log(`\n🚨 Active Alerts: ${alerts.length}`);
  alerts.forEach((alert) => {
    console.log(`  - ${alert.severity.toUpperCase()}: ${alert.title}`);
  });

  // 5. Export data
  console.log('\n💾 Data Export:');
  const exportedData = dashboard.exportData('json');
  console.log(`  Exported ${exportedData.length} characters of JSON data`);

  // 6. Demonstrate configuration update
  console.log('\n⚙️ Configuration Update:');
  dashboard.updateConfiguration({
    refreshRate: 3000,
    theme: { darkMode: true }
  });
  console.log('  Updated refresh rate to 3 seconds and enabled dark mode');
}

/**
 * Example: Advanced Dashboard Usage
 */
export function advancedEnergyMonitoringExample(): void {
  console.log('\n=== Advanced Energy Monitoring Example ===\n');

  const dashboard = new EnergyMonitoringDashboard({
    refreshRate: 500, // High frequency updates
    energyUnits: 'kWh',
    powerUnits: 'kW'
  });

  // Custom layout configuration
  const customLayout = {
    id: 'custom-layout',
    name: 'Performance Focused Layout',
    widgets: [
      {
        id: 'power-generation',
        type: 'realtime' as const,
        position: { x: 0, y: 0, width: 8, height: 6 },
        visible: true,
        config: { showPowerDistribution: true, showTrends: true }
      },
      {
        id: 'efficiency-metrics',
        type: 'statistics' as const,
        position: { x: 8, y: 0, width: 4, height: 6 },
        visible: true,
        config: { focusOnEfficiency: true }
      },
      {
        id: 'optimization-panel',
        type: 'optimization' as const,
        position: { x: 0, y: 6, width: 12, height: 4 },
        visible: true,
        config: { maxRecommendations: 10, showInsights: true }
      }
    ]
  };

  dashboard.updateLayout(customLayout);
  dashboard.start();

  console.log('Advanced dashboard started with custom layout');

  // Simulate high-performance scenario
  let step = 0;
  const highPerformanceSimulation = setInterval(() => {
    step++;
    
    // Generate high-performance driving scenario
    const inputs: AggregatorInputs = {
      suspensionInputs: {
        verticalVelocity: Math.sin(step * 0.1) * 1.5, // Smooth sinusoidal motion
        displacement: Math.cos(step * 0.1) * 0.05,
        cornerLoad: 500,
        roadCondition: 'rough', // Optimal for energy harvesting
        vehicleSpeed: 75, // Optimal speed
        ambientTemperature: 20 // Optimal temperature
      },
      damperInputs: {
        compressionVelocity: Math.sin(step * 0.1) * 1.2,
        displacement: Math.cos(step * 0.1) * 0.04,
        vehicleSpeed: 75,
        roadRoughness: 0.7, // High roughness for good energy harvesting
        damperTemperature: 30,
        batterySOC: 0.6,
        loadFactor: 0.7
      },
      vehicleInputs: {
        speed: 75,
        acceleration: 0,
        roadSurface: 'asphalt',
        temperature: 20,
        humidity: 0.5,
        vibrationLevel: 0.7
      },
      batteryData: {
        stateOfCharge: 0.6,
        capacity: 100,
        voltage: 12.5,
        temperature: 25,
        health: 0.95
      }
    };

    dashboard.updateEnergyData(inputs);

    if (step >= 20) {
      clearInterval(highPerformanceSimulation);
      
      // Show final results
      setTimeout(() => {
        const finalMetrics = dashboard.getDashboardMetrics();
        console.log('\n🏆 High-Performance Scenario Results:');
        console.log(`  Peak Energy Generation: ${finalMetrics.currentPowerGeneration.toFixed(2)} W`);
        console.log(`  System Efficiency: ${(finalMetrics.systemEfficiency * 100).toFixed(1)}%`);
        
        dashboard.stop();
      }, 2000);
    }
  }, 500);
}

// Run examples if this file is executed directly
if (require.main === module) {
  basicEnergyMonitoringExample();
  
  setTimeout(() => {
    advancedEnergyMonitoringExample();
  }, 35000);
}