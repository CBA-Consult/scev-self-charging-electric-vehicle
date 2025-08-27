/**
 * Basic Usage Example for Energy Management Control System
 * 
 * This example demonstrates how to set up and use the comprehensive
 * energy management control system for suspension energy harvesting.
 */

import {
  EnergyManagementController,
  EnergyManagementConfig,
  EnergyManagementInputs,
  createEnergyManagementSystem,
  validateEnergyManagementConfig,
  optimizeEnergyDistribution,
  predictEnergyDemand
} from '../index';

/**
 * Basic usage example
 */
export async function basicUsageExample(): Promise<void> {
  console.log('=== Energy Management Control System - Basic Usage Example ===\n');

  // 1. Create energy management system with default configuration
  console.log('1. Creating energy management system...');
  const energyManager = createEnergyManagementSystem({
    updateFrequency: 10, // 10 Hz
    strategy: 'adaptive',
    predictionHorizon: 300, // 5 minutes
    vehicleIntegration: {
      enabled: true,
      communicationProtocol: 'CAN',
      updateRate: 10
    },
    optimization: {
      enabled: true,
      algorithm: 'genetic',
      updateInterval: 60,
      convergenceThreshold: 0.001
    }
  });

  // 2. Prepare sample input data
  console.log('2. Preparing sample input data...');
  const sampleInputs: EnergyManagementInputs = {
    timestamp: Date.now(),
    
    // Energy sources (suspension harvesting systems)
    sources: new Map([
      ['electromagnetic_front_left', {
        type: 'electromagnetic',
        power: 150, // W
        voltage: 12, // V
        current: 12.5, // A
        efficiency: 85, // %
        temperature: 35, // °C
        status: 'active'
      }],
      ['electromagnetic_front_right', {
        type: 'electromagnetic',
        power: 145, // W
        voltage: 12, // V
        current: 12.1, // A
        efficiency: 83, // %
        temperature: 37, // °C
        status: 'active'
      }],
      ['piezoelectric_rear_left', {
        type: 'piezoelectric',
        power: 75, // W
        voltage: 24, // V
        current: 3.1, // A
        efficiency: 78, // %
        temperature: 28, // °C
        status: 'active'
      }],
      ['piezoelectric_rear_right', {
        type: 'piezoelectric',
        power: 80, // W
        voltage: 24, // V
        current: 3.3, // A
        efficiency: 80, // %
        temperature: 30, // °C
        status: 'active'
      }]
    ]),
    
    // Energy storage systems
    storage: new Map([
      ['supercapacitor_bank', {
        type: 'supercapacitor',
        capacity: 100, // Wh
        soc: 65, // %
        power: 0, // W (currently idle)
        voltage: 48, // V
        current: 0, // A
        temperature: 25, // °C
        health: 95, // %
        status: 'idle'
      }],
      ['lithium_battery', {
        type: 'battery',
        capacity: 500, // Wh
        soc: 45, // %
        power: 0, // W (currently idle)
        voltage: 48, // V
        current: 0, // A
        temperature: 30, // °C
        health: 92, // %
        status: 'idle'
      }]
    ]),
    
    // Energy loads
    loads: new Map([
      ['active_suspension_control', {
        type: 'critical',
        power: 200, // W
        priority: 10,
        flexibility: 5 // % (very low flexibility)
      }],
      ['vehicle_lighting', {
        type: 'essential',
        power: 100, // W
        priority: 8,
        flexibility: 10 // %
      }],
      ['comfort_systems', {
        type: 'optional',
        power: 150, // W
        priority: 5,
        flexibility: 50 // % (high flexibility)
      }]
    ]),
    
    // Vehicle state
    vehicleState: {
      speed: 60, // km/h
      acceleration: 0.5, // m/s²
      roadCondition: 'rough',
      drivingMode: 'normal',
      batterySOC: 70, // %
      powerDemand: 2500 // W
    },
    
    // Environmental conditions
    environment: {
      temperature: 20, // °C
      humidity: 60, // %
      pressure: 101325, // Pa
      vibrationLevel: 3.5 // m/s²
    },
    
    // Predictions (simplified)
    predictions: {
      loadForecast: new Map([
        ['active_suspension_control', [200, 210, 195, 205, 200]],
        ['vehicle_lighting', [100, 100, 100, 100, 100]],
        ['comfort_systems', [150, 120, 180, 160, 140]]
      ]),
      sourceForecast: new Map([
        ['electromagnetic_front_left', [150, 160, 140, 155, 145]],
        ['electromagnetic_front_right', [145, 155, 135, 150, 140]],
        ['piezoelectric_rear_left', [75, 80, 70, 78, 72]],
        ['piezoelectric_rear_right', [80, 85, 75, 82, 78]]
      ]),
      drivingPattern: 'mixed',
      tripDuration: 30 // minutes
    }
  };

  // 3. Process energy management control
  console.log('3. Processing energy management control...');
  const startTime = Date.now();
  
  try {
    const outputs = await energyManager.processControl(sampleInputs);
    const processingTime = Date.now() - startTime;
    
    console.log(`   Processing completed in ${processingTime}ms`);
    console.log(`   System efficiency: ${outputs.systemStatus.systemEfficiency.toFixed(1)}%`);
    console.log(`   Energy balance: ${outputs.systemStatus.energyBalance.toFixed(1)}W`);
    console.log(`   Operating mode: ${outputs.systemStatus.operatingMode}`);
    console.log(`   Health score: ${(outputs.systemStatus.healthScore * 100).toFixed(1)}%`);
    
    // Display source controls
    console.log('\n   Source Controls:');
    for (const [sourceId, control] of outputs.sourceControls) {
      console.log(`     ${sourceId}:`);
      console.log(`       Power setpoint: ${control.powerSetpoint.toFixed(1)}W`);
      console.log(`       Voltage setpoint: ${control.voltageSetpoint.toFixed(1)}V`);
      console.log(`       Harvesting enabled: ${control.enableHarvesting}`);
      console.log(`       Operating mode: ${control.operatingMode}`);
    }
    
    // Display storage controls
    console.log('\n   Storage Controls:');
    for (const [storageId, control] of outputs.storageControls) {
      console.log(`     ${storageId}:`);
      console.log(`       Power setpoint: ${control.powerSetpoint.toFixed(1)}W`);
      console.log(`       Current limit: ${control.currentLimit.toFixed(1)}A`);
      console.log(`       Operating mode: ${control.operatingMode}`);
    }
    
    // Display load controls
    console.log('\n   Load Controls:');
    for (const [loadId, control] of outputs.loadControls) {
      console.log(`     ${loadId}:`);
      console.log(`       Power allocation: ${control.powerAllocation.toFixed(1)}W`);
      console.log(`       Priority: ${control.priority}`);
      console.log(`       Load enabled: ${control.enableLoad}`);
    }
    
    // Display vehicle commands
    console.log('\n   Vehicle Commands:');
    console.log(`     Energy share request: ${outputs.vehicleCommands.energyShareRequest.toFixed(1)}W`);
    console.log(`     Regenerative braking level: ${outputs.vehicleCommands.regenerativeBrakingLevel}%`);
    console.log(`     Thermal management request: ${outputs.vehicleCommands.thermalManagementRequest}`);
    
    // Display recommendations
    if (outputs.recommendations.length > 0) {
      console.log('\n   Recommendations:');
      outputs.recommendations.forEach(rec => console.log(`     - ${rec}`));
    }
    
    // Display warnings
    if (outputs.warnings.length > 0) {
      console.log('\n   Warnings:');
      outputs.warnings.forEach(warning => console.log(`     ⚠️  ${warning}`));
    }
    
  } catch (error) {
    console.error('   Error during processing:', error.message);
  }

  // 4. Demonstrate system diagnostics
  console.log('\n4. System diagnostics...');
  const systemState = energyManager.getSystemState();
  const performanceMetrics = energyManager.getPerformanceMetrics();
  const integrationStatus = energyManager.getIntegrationStatus();
  
  console.log(`   Operating state: ${systemState.operatingState}`);
  console.log(`   Control mode: ${systemState.controlMode}`);
  console.log(`   Energy balance: ${systemState.energyBalance}`);
  console.log(`   Overall health: ${(systemState.systemHealth.overall * 100).toFixed(1)}%`);
  console.log(`   Integration health: ${(integrationStatus.integrationHealth * 100).toFixed(1)}%`);
  console.log(`   Power tracking accuracy: ${performanceMetrics.accuracy.powerTracking.toFixed(1)}%`);
  console.log(`   System efficiency: ${performanceMetrics.efficiency.systemEfficiency.toFixed(1)}%`);

  // 5. Demonstrate optimization
  console.log('\n5. Energy distribution optimization...');
  const optimizationResult = optimizeEnergyDistribution(sampleInputs, {
    maximizeEfficiency: 0.4,
    minimizeCost: 0.3,
    maximizeReliability: 0.3
  });
  
  console.log(`   Optimized efficiency: ${optimizationResult.efficiency.toFixed(1)}%`);
  console.log(`   Optimized cost: $${optimizationResult.cost.toFixed(4)}/hour`);
  console.log(`   Optimized reliability: ${optimizationResult.reliability.toFixed(1)}%`);

  // 6. Demonstrate energy demand prediction
  console.log('\n6. Energy demand prediction...');
  const prediction = predictEnergyDemand(sampleInputs, 300); // 5 minutes
  
  console.log(`   Prediction confidence: ${(prediction.confidence * 100).toFixed(1)}%`);
  console.log(`   Time steps: ${prediction.timeSteps.length}`);
  console.log('   Predicted load trends:');
  
  for (const [loadId, predictions] of prediction.predictedLoads) {
    const avgPrediction = predictions.reduce((sum, p) => sum + p, 0) / predictions.length;
    console.log(`     ${loadId}: ${avgPrediction.toFixed(1)}W average`);
  }

  // 7. Configuration validation
  console.log('\n7. Configuration validation...');
  const currentConfig = {
    updateFrequency: 10,
    strategy: 'adaptive' as const,
    predictionHorizon: 300,
    vehicleIntegration: {
      enabled: true,
      communicationProtocol: 'CAN' as const,
      updateRate: 10
    },
    safetyLimits: {
      maxPowerTransfer: 5000,
      maxTemperature: 80,
      minBatterySOC: 10,
      maxBatterySOC: 95
    },
    optimization: {
      enabled: true,
      algorithm: 'genetic' as const,
      updateInterval: 60,
      convergenceThreshold: 0.001
    }
  };
  
  const validation = validateEnergyManagementConfig(currentConfig);
  console.log(`   Configuration valid: ${validation.isValid}`);
  
  if (validation.errors.length > 0) {
    console.log('   Errors:');
    validation.errors.forEach(error => console.log(`     ❌ ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.log('   Warnings:');
    validation.warnings.forEach(warning => console.log(`     ⚠️  ${warning}`));
  }

  console.log('\n=== Example completed successfully! ===');
}

/**
 * Advanced usage example with real-time monitoring
 */
export async function advancedUsageExample(): Promise<void> {
  console.log('\n=== Advanced Usage Example - Real-time Monitoring ===\n');

  const energyManager = createEnergyManagementSystem({
    updateFrequency: 20, // Higher frequency for real-time
    strategy: 'adaptive',
    optimization: {
      enabled: true,
      algorithm: 'neural_network',
      updateInterval: 30,
      convergenceThreshold: 0.0005
    }
  });

  // Simulate real-time operation for 10 seconds
  const duration = 10000; // 10 seconds
  const interval = 50; // 50ms intervals (20 Hz)
  const iterations = duration / interval;

  console.log(`Simulating real-time operation for ${duration/1000} seconds...`);

  for (let i = 0; i < iterations; i++) {
    // Generate dynamic input data
    const dynamicInputs = generateDynamicInputs(i, interval);
    
    try {
      const outputs = await energyManager.processControl(dynamicInputs);
      
      // Log every 1 second (20 iterations)
      if (i % 20 === 0) {
        const timeElapsed = (i * interval) / 1000;
        console.log(`[${timeElapsed.toFixed(1)}s] Efficiency: ${outputs.systemStatus.systemEfficiency.toFixed(1)}%, ` +
                   `Balance: ${outputs.systemStatus.energyBalance.toFixed(0)}W, ` +
                   `Health: ${(outputs.systemStatus.healthScore * 100).toFixed(1)}%`);
      }
      
    } catch (error) {
      console.error(`Error at iteration ${i}:`, error.message);
    }
    
    // Simulate real-time delay
    await new Promise(resolve => setTimeout(resolve, 1));
  }

  // Get final system diagnostics
  const finalDiagnostics = energyManager.getDiagnostics();
  console.log('\nFinal System Diagnostics:');
  console.log(`  CPU Usage: ${finalDiagnostics.performance.cpuUsage.toFixed(1)}%`);
  console.log(`  Memory Usage: ${finalDiagnostics.performance.memoryUsage.toFixed(1)}%`);
  console.log(`  Average Execution Time: ${finalDiagnostics.performance.executionTime.toFixed(1)}ms`);
  console.log(`  Update Rate: ${finalDiagnostics.performance.updateRate.toFixed(1)} Hz`);
  console.log(`  System Temperature: ${finalDiagnostics.system.temperature.toFixed(1)}°C`);
  console.log(`  Uptime: ${(finalDiagnostics.system.uptime / 3600).toFixed(2)} hours`);

  console.log('\n=== Advanced example completed! ===');
}

/**
 * Generate dynamic input data for simulation
 */
function generateDynamicInputs(iteration: number, intervalMs: number): EnergyManagementInputs {
  const time = iteration * intervalMs / 1000; // seconds
  
  // Simulate varying road conditions and speed
  const speed = 50 + 20 * Math.sin(time * 0.1); // 30-70 km/h
  const vibration = 2 + 3 * Math.sin(time * 0.2) + Math.random(); // 2-6 m/s²
  
  // Simulate varying power generation based on conditions
  const basePower = 100;
  const powerVariation = vibration / 5; // Scale vibration to power
  
  return {
    timestamp: Date.now(),
    sources: new Map([
      ['electromagnetic_front_left', {
        type: 'electromagnetic',
        power: basePower * powerVariation * (0.9 + Math.random() * 0.2),
        voltage: 12,
        current: 10 + Math.random() * 5,
        efficiency: 80 + Math.random() * 10,
        temperature: 25 + time * 0.1 + Math.random() * 5,
        status: 'active'
      }],
      ['electromagnetic_front_right', {
        type: 'electromagnetic',
        power: basePower * powerVariation * (0.9 + Math.random() * 0.2),
        voltage: 12,
        current: 10 + Math.random() * 5,
        efficiency: 80 + Math.random() * 10,
        temperature: 25 + time * 0.1 + Math.random() * 5,
        status: 'active'
      }]
    ]),
    storage: new Map([
      ['supercapacitor_bank', {
        type: 'supercapacitor',
        capacity: 100,
        soc: 50 + 20 * Math.sin(time * 0.05),
        power: 0,
        voltage: 48,
        current: 0,
        temperature: 25 + Math.random() * 10,
        health: 95,
        status: 'idle'
      }]
    ]),
    loads: new Map([
      ['active_suspension_control', {
        type: 'critical',
        power: 150 + 50 * Math.sin(time * 0.3),
        priority: 10,
        flexibility: 5
      }],
      ['comfort_systems', {
        type: 'optional',
        power: 100 + 50 * Math.sin(time * 0.15),
        priority: 5,
        flexibility: 50
      }]
    ]),
    vehicleState: {
      speed,
      acceleration: Math.sin(time * 0.2),
      roadCondition: vibration > 4 ? 'rough' : vibration > 3 ? 'rough' : 'smooth',
      drivingMode: 'normal',
      batterySOC: 70,
      powerDemand: 2000 + 500 * Math.sin(time * 0.1)
    },
    environment: {
      temperature: 20 + 5 * Math.sin(time * 0.01),
      humidity: 60,
      pressure: 101325,
      vibrationLevel: vibration
    },
    predictions: {
      loadForecast: new Map(),
      sourceForecast: new Map(),
      drivingPattern: 'mixed',
      tripDuration: 30
    }
  };
}

// Run examples if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      await basicUsageExample();
      await advancedUsageExample();
    } catch (error) {
      console.error('Example failed:', error);
    }
  })();
}