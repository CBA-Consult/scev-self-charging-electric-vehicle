/**
 * Basic Usage Example for TEG Thermal Monitoring System
 * 
 * This example demonstrates how to set up and use the TEG thermal monitoring
 * system for electric vehicle thermal management and automatic shutdown.
 */

import {
  createTEGThermalSystem,
  defaultTEGConfiguration,
  defaultSensorLocations,
  createTestTEGData,
  TEGThermalMonitor,
  TEGSensorManager,
  ThermalZoneController,
  TEGEnergyIntegration
} from '../index';

/**
 * Basic TEG thermal monitoring setup
 */
export function basicTEGSetup(): void {
  console.log('=== Basic TEG Thermal Monitoring Setup ===\n');

  // Create TEG thermal monitoring system
  const tegSystem = createTEGThermalSystem(defaultTEGConfiguration, defaultSensorLocations);

  // Set up alert handlers
  tegSystem.onAlert((alert) => {
    console.log(`🚨 THERMAL ALERT: ${alert.message}`);
    console.log(`   Zone: ${alert.zoneId}, Severity: ${alert.severity}`);
    console.log(`   Time: ${new Date(alert.timestamp).toISOString()}\n`);
  });

  // Start monitoring
  tegSystem.startMonitoring();
  console.log('✅ TEG thermal monitoring started\n');

  // Simulate normal operation
  simulateNormalOperation(tegSystem);

  // Simulate overheating scenario
  setTimeout(() => {
    console.log('🔥 Simulating overheating scenario...\n');
    simulateOverheatingScenario(tegSystem);
  }, 5000);

  // Simulate recovery
  setTimeout(() => {
    console.log('❄️ Simulating thermal recovery...\n');
    simulateThermalRecovery(tegSystem);
  }, 15000);

  // Stop monitoring after demo
  setTimeout(() => {
    tegSystem.stopMonitoring();
    console.log('⏹️ TEG thermal monitoring stopped\n');
    
    // Display final system status
    const status = tegSystem.getSystemStatus();
    console.log('📊 Final System Status:');
    console.log(`   Active Sensors: ${status.activeSensors}/${status.totalSensors}`);
    console.log(`   Active Shutdowns: ${status.activeShutdowns}`);
    console.log(`   Zones: ${status.zones.length}`);
  }, 25000);
}

/**
 * Simulate normal operation with typical sensor readings
 */
function simulateNormalOperation(tegSystem: TEGThermalMonitor): void {
  console.log('🔄 Simulating normal operation...\n');

  // Simulate sensor data for normal operation
  const normalSensorData = [
    createTestTEGData({
      sensorId: 'motor_fl_teg',
      current: 0.12,
      temperature: 75,
      location: { zone: 'frontLeftMotor', position: { x: 1.2, y: 0.8, z: 0.3 }, priority: 'critical' }
    }),
    createTestTEGData({
      sensorId: 'motor_fr_teg',
      current: 0.11,
      temperature: 73,
      location: { zone: 'frontRightMotor', position: { x: 1.2, y: -0.8, z: 0.3 }, priority: 'critical' }
    }),
    createTestTEGData({
      sensorId: 'battery_main_teg',
      current: 0.08,
      temperature: 42,
      location: { zone: 'batteryPack', position: { x: 0, y: 0, z: -0.2 }, priority: 'critical' }
    }),
    createTestTEGData({
      sensorId: 'inverter_main_teg',
      current: 0.15,
      temperature: 68,
      location: { zone: 'powerElectronics', position: { x: 0.8, y: 0, z: 0.5 }, priority: 'high' }
    })
  ];

  // Update sensor data periodically
  let updateCount = 0;
  const normalInterval = setInterval(() => {
    normalSensorData.forEach(sensorData => {
      // Add some variation to simulate real conditions
      const variation = (Math.random() - 0.5) * 0.1;
      const updatedData = {
        ...sensorData,
        current: Math.max(0, sensorData.current + variation * 0.05),
        temperature: sensorData.temperature + variation * 5,
        timestamp: Date.now()
      };
      
      tegSystem.updateSensorData(updatedData);
    });

    updateCount++;
    if (updateCount >= 10) { // Run for 5 seconds (10 updates at 500ms intervals)
      clearInterval(normalInterval);
    }
  }, 500);
}

/**
 * Simulate overheating scenario that triggers shutdown
 */
function simulateOverheatingScenario(tegSystem: TEGThermalMonitor): void {
  // Simulate gradual temperature increase leading to shutdown
  const overheatingData = createTestTEGData({
    sensorId: 'motor_fl_teg',
    current: 0.3, // High current indicating overheating
    temperature: 95, // High temperature
    location: { zone: 'frontLeftMotor', position: { x: 1.2, y: 0.8, z: 0.3 }, priority: 'critical' }
  });

  let temperature = 95;
  let current = 0.3;
  
  const overheatingInterval = setInterval(() => {
    // Gradually increase temperature and current
    temperature += 5;
    current += 0.05;

    const criticalData = {
      ...overheatingData,
      current: Math.min(current, 1.0),
      temperature: Math.min(temperature, 130),
      timestamp: Date.now()
    };

    console.log(`🌡️ Motor FL Temperature: ${criticalData.temperature.toFixed(1)}°C, Current: ${criticalData.current.toFixed(3)}A`);
    
    tegSystem.updateSensorData(criticalData);

    // Stop when we reach critical levels
    if (temperature >= 125) {
      clearInterval(overheatingInterval);
      console.log('🛑 Critical temperature reached - shutdown should be triggered\n');
    }
  }, 1000);
}

/**
 * Simulate thermal recovery after shutdown
 */
function simulateThermalRecovery(tegSystem: TEGThermalMonitor): void {
  // Simulate cooling down after shutdown
  const recoveryData = createTestTEGData({
    sensorId: 'motor_fl_teg',
    current: 0.1, // Low current during shutdown
    temperature: 120, // Starting high but cooling
    location: { zone: 'frontLeftMotor', position: { x: 1.2, y: 0.8, z: 0.3 }, priority: 'critical' }
  });

  let temperature = 120;
  let current = 0.1;
  
  const recoveryInterval = setInterval(() => {
    // Gradually decrease temperature
    temperature -= 8;
    current = Math.max(0.05, current - 0.01);

    const coolingData = {
      ...recoveryData,
      current: Math.max(current, 0.05),
      temperature: Math.max(temperature, 25),
      timestamp: Date.now()
    };

    console.log(`❄️ Motor FL Cooling: ${coolingData.temperature.toFixed(1)}°C, Current: ${coolingData.current.toFixed(3)}A`);
    
    tegSystem.updateSensorData(coolingData);

    // Stop when we reach normal levels
    if (temperature <= 60) {
      clearInterval(recoveryInterval);
      console.log('✅ Normal temperature restored - system should reactivate\n');
    }
  }, 1000);
}

/**
 * Advanced TEG system integration example
 */
export function advancedTEGIntegration(): void {
  console.log('=== Advanced TEG System Integration ===\n');

  // Create individual components
  const sensorManager = new TEGSensorManager();
  const zoneController = new ThermalZoneController();
  const energyIntegration = new TEGEnergyIntegration();

  // Add custom sensors
  sensorManager.addSensor('custom_motor_teg', {
    zone: 'frontLeftMotor',
    position: { x: 1.2, y: 0.8, z: 0.3 },
    priority: 'critical',
    description: 'Custom high-precision motor TEG'
  }, {
    manufacturer: 'ThermalTech',
    model: 'TT-500',
    seebeckCoefficient: 250e-6,
    maxTemperature: 180,
    maxCurrent: 3.0
  });

  // Create custom thermal zone
  zoneController.createZone('custom_zone', {
    name: 'Custom High-Power Zone',
    description: 'Custom zone for high-power components',
    priority: 'critical',
    thermalLimits: {
      normalOperating: 70,
      warningThreshold: 90,
      criticalThreshold: 110,
      emergencyThreshold: 130,
      maxThermalGradient: 3.0,
      thermalMass: 75000
    }
  });

  // Set up zone monitoring
  zoneController.onAlert((alert) => {
    console.log(`🏭 ZONE ALERT: ${alert.message}`);
  });

  zoneController.onShutdownEvent((event) => {
    console.log(`⚡ SHUTDOWN EVENT: Zone ${event.zoneId} - ${event.reason}`);
  });

  // Simulate integrated operation
  const integrationData = {
    vehicleSpeed: 80,
    brakingDemand: 0.3,
    batterySOC: 0.75,
    motorTemperatures: {
      frontLeft: 85,
      frontRight: 82,
      rearLeft: 78,
      rearRight: 80
    },
    environmentalFactors: {
      ambientTemperature: 30,
      humidity: 60,
      roadCondition: 'highway' as const
    },
    tegSensorData: [
      createTestTEGData({
        sensorId: 'custom_motor_teg',
        current: 0.2,
        temperature: 85,
        powerOutput: 0.01
      })
    ],
    thermalZoneStatus: [{
      zoneId: 'custom_zone',
      zoneName: 'Custom High-Power Zone',
      sensors: [],
      averageTemperature: 85,
      maxTemperature: 90,
      averageCurrent: 0.2,
      maxCurrent: 0.25,
      status: 'warning' as const,
      lastUpdate: Date.now(),
      shutdownActive: false,
      cooldownRemaining: 0
    }],
    ambientTemperature: 30,
    vehicleOperatingMode: 'normal' as const,
    thermalManagementActive: true
  };

  // Process integrated system
  const outputs = energyIntegration.processIntegratedSystem(integrationData);

  console.log('📈 Integration Results:');
  console.log(`   Thermal Health: ${(outputs.thermalStatus.overallThermalHealth * 100).toFixed(1)}%`);
  console.log(`   TEG Power: ${outputs.tegEnergyContribution.totalTEGPower.toFixed(3)}W`);
  console.log(`   TEG Efficiency: ${outputs.tegEnergyContribution.tegEfficiency.toFixed(1)}%`);
  console.log(`   Power Reduction: ${(outputs.thermalStatus.recommendedPowerReduction * 100).toFixed(1)}%`);
  
  if (outputs.systemRecommendations.operatingModeChange) {
    console.log(`   Recommended Mode: ${outputs.systemRecommendations.operatingModeChange}`);
  }
  
  if (outputs.systemRecommendations.maintenanceAlerts) {
    console.log(`   Maintenance Alerts: ${outputs.systemRecommendations.maintenanceAlerts.length}`);
  }

  console.log('\n✅ Advanced integration example completed\n');
}

/**
 * Sensor calibration example
 */
export function sensorCalibrationExample(): void {
  console.log('=== TEG Sensor Calibration Example ===\n');

  const sensorManager = new TEGSensorManager();

  // Add a sensor that needs calibration
  sensorManager.addSensor('calibration_test_sensor', {
    zone: 'testZone',
    position: { x: 0, y: 0, z: 0 },
    priority: 'medium'
  });

  // Simulate some readings
  const testReading = sensorManager.updateSensorReading('calibration_test_sensor', {
    current: 0.15,
    voltage: 0.045,
    temperature: 70
  });

  console.log('📊 Initial Reading:');
  console.log(`   Current: ${testReading.current.toFixed(3)}A`);
  console.log(`   Voltage: ${testReading.voltage.toFixed(3)}V`);
  console.log(`   Temperature: ${testReading.temperature.toFixed(1)}°C`);

  // Perform calibration with reference values
  console.log('\n🔧 Performing calibration...');
  sensorManager.calibrateSensor('calibration_test_sensor', 75.0, 0.18, 0.054);

  // Take another reading to see calibration effect
  const calibratedReading = sensorManager.updateSensorReading('calibration_test_sensor', {
    current: 0.15,
    voltage: 0.045,
    temperature: 70
  });

  console.log('\n📊 Calibrated Reading:');
  console.log(`   Current: ${calibratedReading.current.toFixed(3)}A`);
  console.log(`   Voltage: ${calibratedReading.voltage.toFixed(3)}V`);
  console.log(`   Temperature: ${calibratedReading.temperature.toFixed(1)}°C`);

  // Get sensor diagnostics
  const diagnostics = sensorManager.getSensorDiagnostics('calibration_test_sensor');
  if (diagnostics) {
    console.log('\n🔍 Sensor Diagnostics:');
    console.log(`   Health Score: ${(diagnostics.sensor.status.healthScore * 100).toFixed(1)}%`);
    console.log(`   Operating Hours: ${diagnostics.sensor.operatingHours.toFixed(1)}h`);
    console.log(`   Calibration History: ${diagnostics.calibrationHistory.length} entries`);
  }

  console.log('\n✅ Sensor calibration example completed\n');
}

/**
 * Run all examples
 */
export function runAllExamples(): void {
  console.log('🚀 Starting TEG Thermal Monitoring Examples\n');
  
  // Run basic setup
  basicTEGSetup();
  
  // Run advanced integration after basic setup completes
  setTimeout(() => {
    advancedTEGIntegration();
  }, 30000);
  
  // Run calibration example
  setTimeout(() => {
    sensorCalibrationExample();
  }, 35000);
  
  console.log('📝 All examples scheduled to run\n');
}

// Export for use in other modules
export {
  simulateNormalOperation,
  simulateOverheatingScenario,
  simulateThermalRecovery
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}