/**
 * Integrated TEG-Braking System Example
 * 
 * This example demonstrates the integration of TEG systems with
 * regenerative braking for maximum energy recovery during braking events.
 */

import {
  TEGBrakingIntegration,
  createIntegratedBrakingSystem,
  IntegratedBrakingInputs,
  EnergyRecoveryStrategy
} from '../TEGBrakingIntegration';

import {
  TEGConfiguration,
  defaultTEGConfigurations
} from '../types';

/**
 * Basic integrated braking example
 */
export function basicIntegratedBraking(): void {
  console.log('=== Basic Integrated TEG-Braking Example ===\n');

  // Create integrated braking system
  const integratedSystem = createIntegratedBrakingSystem();

  // Define braking scenario inputs
  const brakingInputs: IntegratedBrakingInputs = {
    drivingSpeed: 80,               // km/h
    brakingIntensity: 0.6,          // 60% braking intensity
    batterySOC: 0.7,                // 70% battery state of charge
    motorTemperature: 85,           // °C
    brakeTemperature: 220,          // °C - Hot brakes from previous braking
    ambientTemperature: 25,         // °C
    airflow: 22,                    // m/s - Airflow at 80 km/h
    tegSystemEnabled: true,
    thermalManagementMode: 'adaptive'
  };

  try {
    // Calculate integrated braking performance
    const results = integratedSystem.calculateIntegratedBraking(brakingInputs);

    console.log('Integrated Braking Results:');
    console.log(`  Regenerative Power: ${results.regenerativePower.toFixed(2)} W`);
    console.log(`  TEG Power: ${results.tegPower.toFixed(2)} W`);
    console.log(`  Total Recovered Power: ${results.totalRecoveredPower.toFixed(2)} W`);
    console.log(`  Mechanical Braking Power: ${results.mechanicalBrakingPower.toFixed(2)} W`);
    console.log(`  System Efficiency: ${results.systemEfficiency.toFixed(2)}%`);
    console.log(`  Thermal Efficiency: ${results.thermalEfficiency.toFixed(2)}%`);
    console.log(`  Final Brake Temperature: ${results.brakeTemperature.toFixed(1)}°C`);
    console.log(`  TEG Hot Side Temperature: ${results.tegTemperature.hotSide.toFixed(1)}°C`);
    console.log(`  TEG Cold Side Temperature: ${results.tegTemperature.coldSide.toFixed(1)}°C`);

    console.log('\nPower Distribution:');
    console.log(`  To Battery: ${results.powerDistribution.battery.toFixed(2)} W`);
    console.log(`  To Supercapacitor: ${results.powerDistribution.supercapacitor.toFixed(2)} W`);
    console.log(`  Direct Use: ${results.powerDistribution.directUse.toFixed(2)} W`);

    // Get system diagnostics
    const diagnostics = integratedSystem.getSystemDiagnostics();
    console.log('\nSystem Status:');
    console.log(`  Regenerative Braking: ${diagnostics.regenerativeBraking.status}`);
    console.log(`  TEG System: ${diagnostics.tegSystem.status}`);
    console.log(`  Thermal Management: ${diagnostics.thermalManagement.status}`);
    console.log(`  Overall Efficiency: ${diagnostics.overall.systemEfficiency.toFixed(2)}%`);
    console.log(`  Energy Savings: ${diagnostics.overall.energySavings.toFixed(2)}%\n`);

  } catch (error) {
    console.error('Error in integrated braking calculation:', error);
  }
}

/**
 * Custom energy recovery strategy example
 */
export function customEnergyRecoveryStrategy(): void {
  console.log('=== Custom Energy Recovery Strategy Example ===\n');

  // Define custom energy recovery strategy
  const customStrategy: Partial<EnergyRecoveryStrategy> = {
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

  // Create system with custom strategy
  const integratedSystem = createIntegratedBrakingSystem(undefined, customStrategy);

  // Test different braking scenarios
  const scenarios = [
    {
      name: 'Light City Braking',
      inputs: {
        drivingSpeed: 40,
        brakingIntensity: 0.3,
        batterySOC: 0.9,
        motorTemperature: 60,
        brakeTemperature: 80,
        ambientTemperature: 20,
        airflow: 11,
        tegSystemEnabled: true,
        thermalManagementMode: 'passive' as const
      }
    },
    {
      name: 'Highway Emergency Braking',
      inputs: {
        drivingSpeed: 120,
        brakingIntensity: 0.9,
        batterySOC: 0.5,
        motorTemperature: 95,
        brakeTemperature: 350,
        ambientTemperature: 30,
        airflow: 33,
        tegSystemEnabled: true,
        thermalManagementMode: 'active' as const
      }
    },
    {
      name: 'Mountain Descent',
      inputs: {
        drivingSpeed: 60,
        brakingIntensity: 0.5,
        batterySOC: 0.95,
        motorTemperature: 110,
        brakeTemperature: 280,
        ambientTemperature: 15,
        airflow: 17,
        tegSystemEnabled: true,
        thermalManagementMode: 'adaptive' as const
      }
    }
  ];

  console.log('Testing Custom Energy Recovery Strategy:\n');

  scenarios.forEach((scenario, index) => {
    console.log(`Scenario ${index + 1}: ${scenario.name}`);
    
    try {
      const results = integratedSystem.calculateIntegratedBraking(scenario.inputs);
      
      console.log(`  Total Power Recovery: ${results.totalRecoveredPower.toFixed(2)} W`);
      console.log(`  TEG Contribution: ${(results.tegPower / results.totalRecoveredPower * 100).toFixed(1)}%`);
      console.log(`  System Efficiency: ${results.systemEfficiency.toFixed(2)}%`);
      console.log(`  Brake Temp Change: ${(results.brakeTemperature - scenario.inputs.brakeTemperature).toFixed(1)}°C`);
      
    } catch (error) {
      console.log(`  Error: ${error}`);
    }
    
    console.log();
  });
}

/**
 * Performance comparison example
 */
export function performanceComparison(): void {
  console.log('=== Performance Comparison Example ===\n');

  // Create systems with different configurations
  const standardSystem = createIntegratedBrakingSystem();
  
  const highPerformanceTEGs = new Map<string, TEGConfiguration>();
  highPerformanceTEGs.set('high_performance_brake_teg', defaultTEGConfigurations['high_performance_brake_teg']);
  const highPerfSystem = createIntegratedBrakingSystem(highPerformanceTEGs);

  // Test scenario
  const testInputs: IntegratedBrakingInputs = {
    drivingSpeed: 100,
    brakingIntensity: 0.7,
    batterySOC: 0.6,
    motorTemperature: 90,
    brakeTemperature: 250,
    ambientTemperature: 25,
    airflow: 28,
    tegSystemEnabled: true,
    thermalManagementMode: 'adaptive'
  };

  console.log('Comparing Standard vs High-Performance TEG Systems:\n');

  try {
    // Standard system results
    const standardResults = standardSystem.calculateIntegratedBraking(testInputs);
    console.log('Standard TEG System:');
    console.log(`  Total Power: ${standardResults.totalRecoveredPower.toFixed(2)} W`);
    console.log(`  TEG Power: ${standardResults.tegPower.toFixed(2)} W`);
    console.log(`  Efficiency: ${standardResults.systemEfficiency.toFixed(2)}%`);
    console.log(`  Thermal Efficiency: ${standardResults.thermalEfficiency.toFixed(2)}%`);

    // High-performance system results
    const highPerfResults = highPerfSystem.calculateIntegratedBraking(testInputs);
    console.log('\nHigh-Performance TEG System:');
    console.log(`  Total Power: ${highPerfResults.totalRecoveredPower.toFixed(2)} W`);
    console.log(`  TEG Power: ${highPerfResults.tegPower.toFixed(2)} W`);
    console.log(`  Efficiency: ${highPerfResults.systemEfficiency.toFixed(2)}%`);
    console.log(`  Thermal Efficiency: ${highPerfResults.thermalEfficiency.toFixed(2)}%`);

    // Calculate improvements
    const powerImprovement = ((highPerfResults.totalRecoveredPower - standardResults.totalRecoveredPower) / standardResults.totalRecoveredPower) * 100;
    const tegPowerImprovement = ((highPerfResults.tegPower - standardResults.tegPower) / standardResults.tegPower) * 100;
    const efficiencyImprovement = highPerfResults.systemEfficiency - standardResults.systemEfficiency;

    console.log('\nPerformance Improvements:');
    console.log(`  Total Power: +${powerImprovement.toFixed(1)}%`);
    console.log(`  TEG Power: +${tegPowerImprovement.toFixed(1)}%`);
    console.log(`  System Efficiency: +${efficiencyImprovement.toFixed(2)} percentage points\n`);

  } catch (error) {
    console.error('Error in performance comparison:', error);
  }
}

/**
 * Real-time monitoring simulation
 */
export function realTimeMonitoringSimulation(): void {
  console.log('=== Real-Time Monitoring Simulation ===\n');

  const integratedSystem = createIntegratedBrakingSystem();
  
  // Simulate a braking event over time
  const timeSteps = 10; // 10 time steps
  const duration = 0.5; // 0.5 seconds per step
  
  console.log('Simulating 5-second braking event:\n');
  console.log('Time\tSpeed\tBrake°C\tTEG(W)\tRegen(W)\tTotal(W)\tEfficiency');
  console.log('─'.repeat(70));

  for (let step = 0; step < timeSteps; step++) {
    const time = step * duration;
    
    // Simulate changing conditions during braking
    const speed = Math.max(20, 100 - (step * 8)); // Decreasing speed
    const brakeTemp = 150 + (step * 15); // Increasing brake temperature
    const brakingIntensity = 0.8 - (step * 0.05); // Slightly decreasing intensity
    
    const inputs: IntegratedBrakingInputs = {
      drivingSpeed: speed,
      brakingIntensity: Math.max(0.3, brakingIntensity),
      batterySOC: 0.7,
      motorTemperature: 80 + (step * 2),
      brakeTemperature: brakeTemp,
      ambientTemperature: 25,
      airflow: speed / 3.6, // Convert km/h to m/s
      tegSystemEnabled: true,
      thermalManagementMode: 'adaptive'
    };

    try {
      const results = integratedSystem.calculateIntegratedBraking(inputs);
      
      console.log(
        `${time.toFixed(1)}s\t${speed.toFixed(0)}\t${brakeTemp.toFixed(0)}\t${results.tegPower.toFixed(1)}\t${results.regenerativePower.toFixed(1)}\t${results.totalRecoveredPower.toFixed(1)}\t${results.systemEfficiency.toFixed(1)}%`
      );
      
    } catch (error) {
      console.log(`${time.toFixed(1)}s\tError: ${error}`);
    }
  }

  // Get final system status
  const status = integratedSystem.getSystemStatus();
  console.log('\nFinal System Status:');
  console.log(`  Operational: ${status.isOperational ? 'Yes' : 'No'}`);
  console.log(`  Active Subsystems: ${status.activeSubsystems.join(', ')}`);
  
  if (status.warnings.length > 0) {
    console.log(`  Warnings: ${status.warnings.join(', ')}`);
  }
  
  if (status.errors.length > 0) {
    console.log(`  Errors: ${status.errors.join(', ')}`);
  }
  
  console.log();
}

/**
 * Energy savings analysis
 */
export function energySavingsAnalysis(): void {
  console.log('=== Energy Savings Analysis ===\n');

  const integratedSystem = createIntegratedBrakingSystem();
  
  // Test different driving patterns
  const drivingPatterns = [
    { name: 'City Driving', avgSpeed: 35, brakingFrequency: 0.8, avgBrakeTemp: 120 },
    { name: 'Highway Driving', avgSpeed: 90, brakingFrequency: 0.3, avgBrakeTemp: 100 },
    { name: 'Mountain Driving', avgSpeed: 50, brakingFrequency: 0.6, avgBrakeTemp: 200 },
    { name: 'Stop-and-Go Traffic', avgSpeed: 20, brakingFrequency: 1.0, avgBrakeTemp: 150 }
  ];

  console.log('Energy Savings Analysis by Driving Pattern:\n');
  console.log('Pattern\t\t\tTEG Power\tTotal Recovery\tEnergy Savings');
  console.log('─'.repeat(65));

  drivingPatterns.forEach(pattern => {
    const inputs: IntegratedBrakingInputs = {
      drivingSpeed: pattern.avgSpeed,
      brakingIntensity: 0.5 * pattern.brakingFrequency,
      batterySOC: 0.6,
      motorTemperature: 75,
      brakeTemperature: pattern.avgBrakeTemp,
      ambientTemperature: 25,
      airflow: pattern.avgSpeed / 3.6,
      tegSystemEnabled: true,
      thermalManagementMode: 'adaptive'
    };

    try {
      const results = integratedSystem.calculateIntegratedBraking(inputs);
      const diagnostics = integratedSystem.getSystemDiagnostics();
      
      console.log(
        `${pattern.name.padEnd(20)}\t${results.tegPower.toFixed(1)}W\t\t${results.totalRecoveredPower.toFixed(1)}W\t\t${diagnostics.overall.energySavings.toFixed(1)}%`
      );
      
    } catch (error) {
      console.log(`${pattern.name.padEnd(20)}\tError: ${error}`);
    }
  });

  console.log('\nKey Insights:');
  console.log('- TEG systems are most effective in high-temperature braking scenarios');
  console.log('- Mountain driving shows highest TEG power due to sustained braking');
  console.log('- City driving benefits from frequent TEG activation opportunities');
  console.log('- Highway driving has lower TEG contribution but better overall efficiency\n');
}

/**
 * Run all integrated braking examples
 */
export function runIntegratedBrakingExamples(): void {
  console.log('🚗 Integrated TEG-Braking System Examples\n');
  
  try {
    basicIntegratedBraking();
    customEnergyRecoveryStrategy();
    performanceComparison();
    realTimeMonitoringSimulation();
    energySavingsAnalysis();
    
    console.log('✅ All integrated braking examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running integrated braking examples:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runIntegratedBrakingExamples();
}