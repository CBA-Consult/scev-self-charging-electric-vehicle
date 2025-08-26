/**
 * MR Fluid Energy Recovery Example
 * 
 * This example demonstrates how to use the MR fluid formulation system
 * for optimal energy recovery in electric vehicle applications.
 */

import {
  MRFluidFormulation,
  MRFluidIntegration,
  MRFluidSystemInputs,
  MRFluidSystemConfiguration,
  OptimizationParameters,
  defaultVehicleParameters
} from '../index';

/**
 * Example 1: Basic MR Fluid Formulation Testing
 */
export function basicMRFluidTesting(): void {
  console.log('=== Basic MR Fluid Formulation Testing ===\n');

  // Create MR fluid formulation system
  const mrFluidSystem = new MRFluidFormulation();

  // Get available formulations
  const formulations = mrFluidSystem.getFormulations();
  console.log(`Available formulations: ${Array.from(formulations.keys()).join(', ')}\n`);

  // Test each formulation under standard conditions
  const testConditions = {
    magneticField: 500000,  // 500 kA/m
    temperature: 25,        // 25°C
    shearRate: 100,         // 100 s⁻¹
    frequency: 10           // 10 Hz
  };

  console.log('Testing all formulations under standard conditions:');
  console.log(`Magnetic Field: ${testConditions.magneticField} A/m`);
  console.log(`Temperature: ${testConditions.temperature}°C`);
  console.log(`Shear Rate: ${testConditions.shearRate} s⁻¹`);
  console.log(`Frequency: ${testConditions.frequency} Hz\n`);

  for (const [id, formulation] of formulations) {
    const metrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
      id,
      testConditions.magneticField,
      testConditions.temperature,
      testConditions.shearRate,
      testConditions.frequency
    );

    console.log(`${formulation.name} (${id}):`);
    console.log(`  Energy Recovery Efficiency: ${metrics.results.energyRecoveryEfficiency.toFixed(1)}%`);
    console.log(`  Power Density: ${metrics.results.powerDensity.toFixed(0)} W/kg`);
    console.log(`  Damping Coefficient: ${metrics.results.dampingCoefficient.toFixed(2)} N·s/m`);
    console.log(`  Viscosity Ratio: ${metrics.results.viscosityRatio.toFixed(1)}:1`);
    console.log(`  Thermal Stability: ${metrics.results.thermalStability.toFixed(1)}%\n`);
  }
}

/**
 * Example 2: Temperature Effect Analysis
 */
export function temperatureEffectAnalysis(): void {
  console.log('=== Temperature Effect Analysis ===\n');

  const mrFluidSystem = new MRFluidFormulation();
  const temperatures = [0, 25, 50, 75, 100, 125, 150];
  const formulations = ['HP-IC-001', 'TS-CF-002', 'FR-IO-003', 'EF-NZF-004'];

  console.log('Energy Recovery Efficiency vs Temperature:');
  console.log('Temp(°C)\tHP-IC-001\tTS-CF-002\tFR-IO-003\tEF-NZF-004');

  for (const temp of temperatures) {
    const efficiencies: number[] = [];
    
    for (const formId of formulations) {
      const metrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
        formId, 500000, temp, 100, 10
      );
      efficiencies.push(metrics.results.energyRecoveryEfficiency);
    }

    console.log(`${temp}\t\t${efficiencies.map(e => e.toFixed(1)).join('\t\t')}`);
  }
  console.log();
}

/**
 * Example 3: Formulation Optimization
 */
export function formulationOptimization(): void {
  console.log('=== Formulation Optimization ===\n');

  const mrFluidSystem = new MRFluidFormulation();

  // Scenario 1: High-performance electric vehicle
  console.log('Scenario 1: High-Performance Electric Vehicle');
  const highPerfParams: OptimizationParameters = {
    targetApplication: 'regenerative_braking',
    operatingConditions: {
      temperatureRange: [0, 80],
      magneticFieldRange: [200000, 1000000],
      shearRateRange: [50, 500],
      frequencyRange: [5, 50]
    },
    performanceWeights: {
      energyRecovery: 0.8,
      responseTime: 0.1,
      durability: 0.05,
      temperatureStability: 0.03,
      cost: 0.02
    }
  };

  const highPerfResult = mrFluidSystem.optimizeFormulation(highPerfParams);
  console.log(`Recommended Formulation: ${highPerfResult.bestFormulation}`);
  console.log(`Optimization Score: ${(highPerfResult.score * 100).toFixed(1)}%`);
  console.log('Recommendations:');
  highPerfResult.recommendations.forEach(rec => console.log(`  - ${rec}`));
  console.log();

  // Scenario 2: High-temperature commercial vehicle
  console.log('Scenario 2: High-Temperature Commercial Vehicle');
  const highTempParams: OptimizationParameters = {
    targetApplication: 'hybrid_system',
    operatingConditions: {
      temperatureRange: [40, 150],
      magneticFieldRange: [300000, 800000],
      shearRateRange: [20, 300],
      frequencyRange: [1, 30]
    },
    performanceWeights: {
      energyRecovery: 0.4,
      responseTime: 0.2,
      durability: 0.2,
      temperatureStability: 0.15,
      cost: 0.05
    }
  };

  const highTempResult = mrFluidSystem.optimizeFormulation(highTempParams);
  console.log(`Recommended Formulation: ${highTempResult.bestFormulation}`);
  console.log(`Optimization Score: ${(highTempResult.score * 100).toFixed(1)}%`);
  console.log('Recommendations:');
  highTempResult.recommendations.forEach(rec => console.log(`  - ${rec}`));
  console.log();

  // Scenario 3: Fast-response suspension system
  console.log('Scenario 3: Fast-Response Suspension System');
  const fastResponseParams: OptimizationParameters = {
    targetApplication: 'suspension_damping',
    operatingConditions: {
      temperatureRange: [10, 70],
      magneticFieldRange: [100000, 600000],
      shearRateRange: [10, 200],
      frequencyRange: [10, 100]
    },
    performanceWeights: {
      energyRecovery: 0.3,
      responseTime: 0.6,
      durability: 0.05,
      temperatureStability: 0.03,
      cost: 0.02
    }
  };

  const fastResponseResult = mrFluidSystem.optimizeFormulation(fastResponseParams);
  console.log(`Recommended Formulation: ${fastResponseResult.bestFormulation}`);
  console.log(`Optimization Score: ${(fastResponseResult.score * 100).toFixed(1)}%`);
  console.log('Recommendations:');
  fastResponseResult.recommendations.forEach(rec => console.log(`  - ${rec}`));
  console.log();
}

/**
 * Example 4: Integrated System Operation
 */
export function integratedSystemOperation(): void {
  console.log('=== Integrated System Operation ===\n');

  // System configuration
  const systemConfig: MRFluidSystemConfiguration = {
    selectedFormulation: 'HP-IC-001',
    brakingSystemConfig: {
      enableMRFluidBraking: true,
      mrFluidBrakingRatio: 0.8,
      adaptiveFieldControl: true
    },
    suspensionSystemConfig: {
      enableMRFluidSuspension: true,
      suspensionEnergyRecovery: true,
      dampingAdaptation: true
    },
    thermalManagement: {
      enableCooling: true,
      maxOperatingTemperature: 120,
      thermalDerating: true
    }
  };

  // Create integrated system
  const mrFluidIntegration = new MRFluidIntegration(defaultVehicleParameters, systemConfig);

  console.log('System Configuration:');
  console.log(`Selected Formulation: ${systemConfig.selectedFormulation}`);
  console.log(`MR Fluid Braking Enabled: ${systemConfig.brakingSystemConfig.enableMRFluidBraking}`);
  console.log(`Suspension Energy Recovery: ${systemConfig.suspensionSystemConfig.suspensionEnergyRecovery}`);
  console.log(`Thermal Management: ${systemConfig.thermalManagement.enableCooling}\n`);

  // Simulate different driving scenarios
  const scenarios = [
    {
      name: 'City Driving',
      inputs: {
        drivingSpeed: 40,
        brakingIntensity: 0.4,
        batterySOC: 0.7,
        motorTemperature: 60,
        magneticFieldStrength: 400000,
        suspensionVelocity: 0.15,
        dampingForce: 1200,
        ambientTemperature: 20,
        operatingFrequency: 8
      }
    },
    {
      name: 'Highway Driving',
      inputs: {
        drivingSpeed: 100,
        brakingIntensity: 0.6,
        batterySOC: 0.5,
        motorTemperature: 75,
        magneticFieldStrength: 600000,
        suspensionVelocity: 0.25,
        dampingForce: 2000,
        ambientTemperature: 30,
        operatingFrequency: 12
      }
    },
    {
      name: 'Mountain Driving',
      inputs: {
        drivingSpeed: 60,
        brakingIntensity: 0.8,
        batterySOC: 0.3,
        motorTemperature: 85,
        magneticFieldStrength: 700000,
        suspensionVelocity: 0.4,
        dampingForce: 3000,
        ambientTemperature: 15,
        operatingFrequency: 20
      }
    }
  ];

  console.log('Scenario Analysis:');
  console.log('Scenario\t\tTotal Energy Recovery (W)\tEfficiency (%)\tFluid Temp (°C)');

  for (const scenario of scenarios) {
    const outputs = mrFluidIntegration.calculateOptimalResponse(scenario.inputs as MRFluidSystemInputs);
    
    // Calculate efficiency based on total energy recovery
    const maxPossibleEnergy = scenario.inputs.drivingSpeed * scenario.inputs.brakingIntensity * 1000; // Simplified
    const efficiency = (outputs.totalEnergyRecovery / maxPossibleEnergy) * 100;

    console.log(`${scenario.name}\t\t${outputs.totalEnergyRecovery.toFixed(0)}\t\t\t${efficiency.toFixed(1)}\t\t${outputs.fluidTemperature.toFixed(1)}`);
  }
  console.log();
}

/**
 * Example 5: Performance Analytics and Optimization
 */
export function performanceAnalyticsExample(): void {
  console.log('=== Performance Analytics and Optimization ===\n');

  const systemConfig: MRFluidSystemConfiguration = {
    selectedFormulation: 'HP-IC-001',
    brakingSystemConfig: {
      enableMRFluidBraking: true,
      mrFluidBrakingRatio: 0.7,
      adaptiveFieldControl: true
    },
    suspensionSystemConfig: {
      enableMRFluidSuspension: true,
      suspensionEnergyRecovery: true,
      dampingAdaptation: true
    },
    thermalManagement: {
      enableCooling: true,
      maxOperatingTemperature: 120,
      thermalDerating: true
    }
  };

  const mrFluidIntegration = new MRFluidIntegration(defaultVehicleParameters, systemConfig);

  // Simulate extended operation
  console.log('Simulating 1 hour of mixed driving conditions...');
  
  for (let i = 0; i < 60; i++) {
    const inputs: MRFluidSystemInputs = {
      drivingSpeed: 50 + Math.sin(i * 0.1) * 30,
      brakingIntensity: 0.3 + Math.random() * 0.4,
      batterySOC: 0.8 - (i * 0.005),
      motorTemperature: 60 + i * 0.3,
      magneticFieldStrength: 500000 + Math.random() * 200000,
      suspensionVelocity: 0.1 + Math.random() * 0.3,
      dampingForce: 1000 + Math.random() * 1500,
      ambientTemperature: 25 + Math.sin(i * 0.05) * 10,
      operatingFrequency: 8 + Math.random() * 12
    };

    mrFluidIntegration.calculateOptimalResponse(inputs);
  }

  // Get performance analytics
  const analytics = mrFluidIntegration.getPerformanceAnalytics();
  
  console.log('\nPerformance Analytics:');
  console.log(`Average Energy Recovery: ${analytics.averageEnergyRecovery.toFixed(1)} W`);
  console.log(`Average Efficiency: ${analytics.averageEfficiency.toFixed(1)}%`);
  console.log(`Temperature Profile:`);
  console.log(`  Min: ${analytics.temperatureProfile.min.toFixed(1)}°C`);
  console.log(`  Max: ${analytics.temperatureProfile.max.toFixed(1)}°C`);
  console.log(`  Average: ${analytics.temperatureProfile.average.toFixed(1)}°C`);
  console.log(`Operating Hours: ${analytics.operatingHours.toFixed(2)} hours\n`);

  // Generate system diagnostics
  const diagnostics = mrFluidIntegration.generateSystemDiagnostics();
  
  console.log('System Diagnostics:');
  console.log(`System Health: ${diagnostics.systemHealth}`);
  console.log(`Performance Trends:`);
  console.log(`  Energy Recovery: ${diagnostics.performanceTrends.energyRecoveryTrend}`);
  console.log(`  Efficiency: ${diagnostics.performanceTrends.efficiencyTrend}`);
  console.log(`  Temperature: ${diagnostics.performanceTrends.temperatureTrend}`);
  
  if (diagnostics.issues.length > 0) {
    console.log('Issues Detected:');
    diagnostics.issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  if (diagnostics.recommendations.length > 0) {
    console.log('Recommendations:');
    diagnostics.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }
  console.log();

  // Test formulation optimization for current conditions
  const optimizationConditions = {
    temperatureRange: [analytics.temperatureProfile.min, analytics.temperatureProfile.max] as [number, number],
    magneticFieldRange: [300000, 800000] as [number, number],
    frequencyRange: [5, 25] as [number, number],
    priorityWeights: {
      energyRecovery: 0.6,
      responseTime: 0.2,
      durability: 0.1,
      temperatureStability: 0.1
    }
  };

  const optimization = mrFluidIntegration.optimizeFormulationForConditions(optimizationConditions);
  
  console.log('Formulation Optimization Results:');
  console.log(`Current Formulation: ${mrFluidIntegration.getCurrentFormulation()!.id}`);
  console.log(`Recommended Formulation: ${optimization.recommendedFormulation}`);
  console.log(`Expected Improvement: ${optimization.expectedImprovement.toFixed(1)}%`);
  console.log(`Switching Recommendation: ${optimization.switchingRecommendation}\n`);
}

/**
 * Example 6: Custom Formulation Development
 */
export function customFormulationExample(): void {
  console.log('=== Custom Formulation Development ===\n');

  const mrFluidSystem = new MRFluidFormulation();

  // Create a custom formulation optimized for specific requirements
  const customFormulation = {
    id: 'CUSTOM-HE-001',
    name: 'High-Efficiency Custom Formulation',
    description: 'Custom formulation optimized for maximum energy recovery',
    
    baseFluid: {
      type: 'silicone' as const,
      viscosity: 0.08,
      density: 960,
      thermalConductivity: 0.17
    },
    
    magneticParticles: {
      material: 'iron_carbonyl' as const,
      concentration: 0.38,
      averageSize: 3.2,
      saturationMagnetization: 1.8e6
    },
    
    additives: {
      surfactant: {
        type: 'oleic_acid',
        concentration: 2.2
      },
      antioxidant: {
        type: 'BHT',
        concentration: 0.6
      },
      stabilizer: {
        type: 'fumed_silica',
        concentration: 1.2
      }
    },
    
    performance: {
      yieldStress: 90000,
      dynamicRange: 160,
      responseTime: 7,
      temperatureStability: 125,
      sedimentationStability: 2200
    }
  };

  // Add the custom formulation
  mrFluidSystem.addFormulation(customFormulation);
  console.log(`Added custom formulation: ${customFormulation.name}`);

  // Test the custom formulation
  const testMetrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
    customFormulation.id,
    500000, 25, 100, 10
  );

  console.log('\nCustom Formulation Performance:');
  console.log(`Energy Recovery Efficiency: ${testMetrics.results.energyRecoveryEfficiency.toFixed(1)}%`);
  console.log(`Power Density: ${testMetrics.results.powerDensity.toFixed(0)} W/kg`);
  console.log(`Damping Coefficient: ${testMetrics.results.dampingCoefficient.toFixed(2)} N·s/m`);
  console.log(`Viscosity Ratio: ${testMetrics.results.viscosityRatio.toFixed(1)}:1`);

  // Compare with standard formulations
  console.log('\nComparison with Standard Formulations:');
  const standardFormulations = ['HP-IC-001', 'TS-CF-002', 'FR-IO-003', 'EF-NZF-004'];
  
  console.log('Formulation\t\tEfficiency (%)\tPower Density (W/kg)');
  console.log(`${customFormulation.id}\t\t${testMetrics.results.energyRecoveryEfficiency.toFixed(1)}\t\t${testMetrics.results.powerDensity.toFixed(0)}`);

  for (const formId of standardFormulations) {
    const metrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
      formId, 500000, 25, 100, 10
    );
    console.log(`${formId}\t\t${metrics.results.energyRecoveryEfficiency.toFixed(1)}\t\t${metrics.results.powerDensity.toFixed(0)}`);
  }

  // Generate performance report
  const report = mrFluidSystem.generatePerformanceReport(customFormulation.id);
  console.log('\nPerformance Report Summary:');
  console.log(`Average Energy Recovery Efficiency: ${report.averagePerformance.energyRecoveryEfficiency.toFixed(1)}%`);
  console.log(`Average Power Density: ${report.averagePerformance.powerDensity.toFixed(0)} W/kg`);
  console.log(`Response Time: ${report.averagePerformance.responseTime.toFixed(1)} ms`);
  
  if (report.recommendations.length > 0) {
    console.log('Optimization Recommendations:');
    report.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }
  console.log();
}

/**
 * Run all examples
 */
export function runAllExamples(): void {
  console.log('MR Fluid Energy Recovery System Examples\n');
  console.log('========================================\n');

  try {
    basicMRFluidTesting();
    temperatureEffectAnalysis();
    formulationOptimization();
    integratedSystemOperation();
    performanceAnalyticsExample();
    customFormulationExample();

    console.log('All examples completed successfully!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}