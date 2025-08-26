/**
 * Basic Usage Example for Piezoelectric Energy Harvesting System
 * 
 * This example demonstrates the fundamental usage of the piezoelectric energy
 * harvesting system, including basic configuration, power calculation, and
 * integration with vehicle systems.
 */

import {
  PiezoelectricEnergyHarvester,
  PiezoelectricIntegration,
  defaultPiezoelectricMaterials,
  defaultHarvesterConfigurations,
  defaultOptimizationParameters,
  piezoelectricUtils,
  type HarvesterConfiguration,
  type EnvironmentalConditions,
  type MultiSourceInputs,
  type IntegratedSystemInputs
} from '../index';

/**
 * Example 1: Basic Piezoelectric Power Calculation
 */
export function basicPowerCalculationExample(): void {
  console.log('=== Basic Piezoelectric Power Calculation Example ===\n');

  // Create a piezoelectric energy harvester
  const harvester = new PiezoelectricEnergyHarvester();

  // Configure a road vibration harvester using PZT-5H material
  const roadHarvesterConfig: HarvesterConfiguration = {
    type: 'cantilever',
    dimensions: { length: 50, width: 20, thickness: 0.5 }, // mm
    material: defaultPiezoelectricMaterials.PZT_5H,
    resonantFrequency: 25, // Hz - typical road vibration frequency
    dampingRatio: 0.02,
    loadResistance: 100000, // Ω
    capacitance: 47 // nF
  };

  // Define environmental conditions for highway driving
  const highwayConditions: EnvironmentalConditions = {
    temperature: 25, // °C
    humidity: 50, // %
    vibrationFrequency: 25, // Hz
    accelerationAmplitude: 5, // m/s²
    stressAmplitude: 10, // MPa
    roadSurfaceType: 'highway',
    vehicleSpeed: 80 // km/h
  };

  // Calculate power output
  const performance = harvester.calculatePiezoelectricPower(roadHarvesterConfig, highwayConditions);

  console.log('Road Vibration Harvester Performance:');
  console.log(`- Instantaneous Power: ${performance.instantaneousPower.toFixed(3)} W`);
  console.log(`- Average Power: ${performance.averagePower.toFixed(3)} W`);
  console.log(`- Peak Power: ${performance.peakPower.toFixed(3)} W`);
  console.log(`- Efficiency: ${performance.efficiency.toFixed(1)}%`);
  console.log(`- Power Density: ${performance.powerDensity.toFixed(3)} W/cm³`);
  console.log(`- Reliability: ${performance.reliability.toFixed(1)}%`);
  console.log(`- Estimated Lifespan: ${(performance.lifespan / 8760).toFixed(1)} years\n`);
}

/**
 * Example 2: Multi-Source Energy Harvesting Optimization
 */
export function multiSourceOptimizationExample(): void {
  console.log('=== Multi-Source Energy Harvesting Optimization Example ===\n');

  const harvester = new PiezoelectricEnergyHarvester();

  // Define inputs from multiple energy sources
  const multiSourceInputs: MultiSourceInputs = {
    roadVibrations: {
      frequency: 25, // Hz
      amplitude: 5, // m/s²
      powerSpectralDensity: [0.5, 1.0, 2.0, 1.5, 0.8] // (m/s²)²/Hz
    },
    suspensionMovement: {
      displacement: 15, // mm
      velocity: 75, // mm/s
      force: 1200 // N
    },
    tireDeformation: {
      contactPressure: 2.5, // MPa
      deformationRate: 120, // Hz
      rollingResistance: 250 // N
    },
    engineVibrations: {
      frequency: 45, // Hz
      amplitude: 3 // m/s²
    }
  };

  // Set optimization constraints for balanced performance
  const optimizationConstraints = defaultOptimizationParameters.efficiencyOptimization;

  // Perform multi-source optimization
  const optimizationResult = harvester.optimizeMultiSourceHarvesting(
    multiSourceInputs,
    optimizationConstraints
  );

  console.log('Multi-Source Optimization Results:');
  console.log(`- Total Power Output: ${optimizationResult.totalPowerOutput.toFixed(2)} W`);
  console.log(`- System Efficiency: ${optimizationResult.systemEfficiency.toFixed(1)}%`);
  console.log(`- Reliability Score: ${optimizationResult.reliabilityScore.toFixed(1)}%`);
  console.log(`- Number of Optimized Harvesters: ${optimizationResult.optimalConfiguration.size}`);

  // Display individual harvester configurations
  for (const [source, config] of optimizationResult.optimalConfiguration) {
    console.log(`\n${source.toUpperCase()} Harvester Configuration:`);
    console.log(`  - Type: ${config.type}`);
    console.log(`  - Dimensions: ${config.dimensions.length}×${config.dimensions.width}×${config.dimensions.thickness} mm`);
    console.log(`  - Material: ${config.material.name}`);
    console.log(`  - Resonant Frequency: ${config.resonantFrequency} Hz`);
  }
  console.log();
}

/**
 * Example 3: Integrated System with Fuzzy Control
 */
export function integratedSystemExample(): void {
  console.log('=== Integrated Piezoelectric System Example ===\n');

  // Vehicle parameters for a typical electric vehicle
  const vehicleParams = {
    mass: 1800, // kg
    frontAxleWeightRatio: 0.6,
    wheelRadius: 0.35, // m
    motorCount: 2,
    maxMotorTorque: 400, // Nm
    motorEfficiency: 0.92,
    transmissionRatio: 1.0
  };

  // Create integrated system
  const integratedSystem = new PiezoelectricIntegration(vehicleParams);

  // Define comprehensive system inputs
  const systemInputs: IntegratedSystemInputs = {
    // Vehicle dynamics
    vehicleSpeed: 80, // km/h
    brakePedalPosition: 0.3, // 30% braking
    acceleratorPedalPosition: 0,
    steeringAngle: 0,
    lateralAcceleration: 0,
    longitudinalAcceleration: -2, // m/s² (braking)
    yawRate: 0,
    roadGradient: 0,

    // Battery and electrical system
    batterySOC: 0.65, // 65% charge
    batteryVoltage: 400, // V
    batteryCurrent: 50, // A
    batteryTemperature: 30, // °C
    motorTemperatures: {
      frontLeft: 65, // °C
      frontRight: 68 // °C
    },

    // Environmental conditions
    ambientTemperature: 22, // °C
    roadSurface: 'dry',
    visibility: 'clear',

    // Piezoelectric sources
    piezoelectricSources: {
      roadVibrations: {
        frequency: 28,
        amplitude: 6,
        powerSpectralDensity: [0.8, 1.2, 2.5, 1.8, 1.0]
      },
      suspensionMovement: {
        displacement: 12,
        velocity: 60,
        force: 1100
      },
      tireDeformation: {
        contactPressure: 2.2,
        deformationRate: 110,
        rollingResistance: 220
      },
      engineVibrations: {
        frequency: 42,
        amplitude: 2.5
      }
    },

    // System configuration
    harvestingEnabled: true,
    optimizationMode: 'balanced',
    environmentalFactors: {
      roadCondition: 'good',
      weatherCondition: 'clear',
      trafficDensity: 'moderate'
    }
  };

  // Process the integrated system
  const systemOutputs = integratedSystem.processIntegratedSystem(systemInputs);

  console.log('Integrated System Performance:');
  console.log('\nPiezoelectric Power Generation:');
  console.log(`- Road Harvesting: ${systemOutputs.piezoelectricPower.roadHarvesting.toFixed(2)} W`);
  console.log(`- Suspension Harvesting: ${systemOutputs.piezoelectricPower.suspensionHarvesting.toFixed(2)} W`);
  console.log(`- Tire Harvesting: ${systemOutputs.piezoelectricPower.tireHarvesting.toFixed(2)} W`);
  console.log(`- Total Piezoelectric Power: ${systemOutputs.piezoelectricPower.totalPiezoelectricPower.toFixed(2)} W`);

  console.log('\nEnergy Management:');
  console.log(`- Total Energy Generated: ${systemOutputs.energyManagement.totalEnergyGenerated.toFixed(2)} W`);
  console.log(`- Battery Charging: ${systemOutputs.energyManagement.energyDistribution.batteryCharging.toFixed(2)} W`);
  console.log(`- System Load: ${systemOutputs.energyManagement.energyDistribution.systemLoad.toFixed(2)} W`);
  console.log(`- Auxiliary Load: ${systemOutputs.energyManagement.energyDistribution.auxiliaryLoad.toFixed(2)} W`);

  console.log('\nEfficiency Metrics:');
  console.log(`- Overall Efficiency: ${systemOutputs.energyManagement.efficiencyMetrics.overallEfficiency.toFixed(1)}%`);
  console.log(`- Regenerative Efficiency: ${systemOutputs.energyManagement.efficiencyMetrics.regenerativeEfficiency.toFixed(1)}%`);
  console.log(`- Piezoelectric Efficiency: ${systemOutputs.energyManagement.efficiencyMetrics.piezoelectricEfficiency.toFixed(1)}%`);

  console.log('\nSystem Health:');
  console.log(`- Harvesting System Status: ${systemOutputs.systemHealth.harvestingSystemStatus}`);
  console.log(`- Predicted Maintenance: ${(systemOutputs.systemHealth.predictedMaintenance / 24).toFixed(0)} days`);
  console.log(`- Reliability Score: ${systemOutputs.systemHealth.reliabilityScore.toFixed(1)}%`);

  console.log('\nOptimization:');
  console.log(`- Current Strategy: ${systemOutputs.optimization.currentStrategy}`);
  console.log(`- Performance Gain: ${systemOutputs.optimization.performanceGain.toFixed(1)}%`);
  console.log(`- Active Adjustments: ${systemOutputs.optimization.adaptiveAdjustments.join(', ')}`);
  console.log();
}

/**
 * Example 4: Custom Material and Configuration
 */
export function customMaterialExample(): void {
  console.log('=== Custom Material and Configuration Example ===\n');

  const harvester = new PiezoelectricEnergyHarvester();

  // Define a custom high-performance piezoelectric material
  const customMaterial = {
    name: 'Advanced-PMN-PT',
    piezoelectricConstant: 2000, // pC/N - very high
    dielectricConstant: 6000,
    elasticModulus: 85, // GPa
    density: 8200, // kg/m³
    couplingCoefficient: 0.95, // very high coupling
    qualityFactor: 120,
    curiTemperature: 140, // °C
    maxStress: 30 // MPa - lower than ceramics
  };

  // Add the custom material to the system
  harvester.addCustomMaterial(customMaterial);

  // Create a custom harvester configuration optimized for low-frequency, high-displacement applications
  const customConfig: HarvesterConfiguration = {
    type: 'stack',
    dimensions: { length: 40, width: 40, thickness: 15 }, // Larger stack for more power
    material: customMaterial,
    resonantFrequency: 5, // Hz - low frequency for suspension applications
    dampingRatio: 0.03,
    loadResistance: 25000, // Optimized for the material
    capacitance: 180 // nF
  };

  // Calculate optimal load resistance for maximum power transfer
  const optimalResistance = piezoelectricUtils.calculateOptimalLoadResistance(
    customConfig.capacitance,
    customConfig.resonantFrequency
  );

  console.log(`Calculated optimal load resistance: ${optimalResistance.toFixed(0)} Ω`);
  console.log(`Configured load resistance: ${customConfig.loadResistance} Ω`);

  // Update configuration with optimal resistance
  customConfig.loadResistance = optimalResistance;

  // Test the custom configuration under suspension movement conditions
  const suspensionConditions: EnvironmentalConditions = {
    temperature: 35, // °C - warmer due to proximity to vehicle components
    humidity: 40,
    vibrationFrequency: 5, // Hz - suspension frequency
    accelerationAmplitude: 8, // m/s² - higher for suspension
    stressAmplitude: 15, // MPa - higher stress
    roadSurfaceType: 'city',
    vehicleSpeed: 50 // km/h
  };

  const customPerformance = harvester.calculatePiezoelectricPower(customConfig, suspensionConditions);

  console.log('\nCustom High-Performance Harvester Results:');
  console.log(`- Material: ${customMaterial.name}`);
  console.log(`- Configuration: ${customConfig.type} (${customConfig.dimensions.length}×${customConfig.dimensions.width}×${customConfig.dimensions.thickness} mm)`);
  console.log(`- Instantaneous Power: ${customPerformance.instantaneousPower.toFixed(3)} W`);
  console.log(`- Efficiency: ${customPerformance.efficiency.toFixed(1)}%`);
  console.log(`- Power Density: ${customPerformance.powerDensity.toFixed(3)} W/cm³`);
  console.log(`- Reliability: ${customPerformance.reliability.toFixed(1)}%`);

  // Compare with standard PZT-5H material
  const standardConfig: HarvesterConfiguration = {
    ...customConfig,
    material: defaultPiezoelectricMaterials.PZT_5H
  };

  const standardPerformance = harvester.calculatePiezoelectricPower(standardConfig, suspensionConditions);

  console.log('\nComparison with Standard PZT-5H:');
  console.log(`- Power Improvement: ${((customPerformance.instantaneousPower / standardPerformance.instantaneousPower - 1) * 100).toFixed(1)}%`);
  console.log(`- Efficiency Improvement: ${(customPerformance.efficiency - standardPerformance.efficiency).toFixed(1)} percentage points`);
  console.log();
}

/**
 * Example 5: Performance Analysis Under Different Conditions
 */
export function performanceAnalysisExample(): void {
  console.log('=== Performance Analysis Under Different Conditions ===\n');

  const harvester = new PiezoelectricEnergyHarvester();

  // Use a standard cantilever configuration
  const testConfig: HarvesterConfiguration = {
    type: 'cantilever',
    dimensions: { length: 60, width: 25, thickness: 0.8 },
    material: defaultPiezoelectricMaterials.PZT_4, // High power material
    resonantFrequency: 20,
    dampingRatio: 0.025,
    loadResistance: 80000,
    capacitance: 56
  };

  // Test different road conditions
  const roadConditions = [
    { name: 'Smooth Highway', frequency: 15, amplitude: 2, stress: 5 },
    { name: 'Regular Highway', frequency: 25, amplitude: 5, stress: 10 },
    { name: 'City Streets', frequency: 35, amplitude: 8, stress: 15 },
    { name: 'Rough Roads', frequency: 45, amplitude: 12, stress: 20 }
  ];

  console.log('Performance Analysis Across Different Road Conditions:\n');
  console.log('Condition\t\tPower (W)\tEfficiency (%)\tReliability (%)');
  console.log('─'.repeat(70));

  for (const condition of roadConditions) {
    const envConditions: EnvironmentalConditions = {
      temperature: 25,
      humidity: 50,
      vibrationFrequency: condition.frequency,
      accelerationAmplitude: condition.amplitude,
      stressAmplitude: condition.stress,
      roadSurfaceType: 'highway',
      vehicleSpeed: 80
    };

    const performance = harvester.calculatePiezoelectricPower(testConfig, envConditions);

    console.log(`${condition.name.padEnd(20)}\t${performance.instantaneousPower.toFixed(3)}\t\t${performance.efficiency.toFixed(1)}\t\t${performance.reliability.toFixed(1)}`);
  }

  // Test temperature effects
  console.log('\n\nTemperature Effects Analysis:\n');
  console.log('Temperature (°C)\tPower (W)\tEfficiency (%)\tReliability (%)');
  console.log('─'.repeat(65));

  const temperatures = [-10, 0, 25, 50, 75, 100];
  const baseConditions: EnvironmentalConditions = {
    temperature: 25,
    humidity: 50,
    vibrationFrequency: 25,
    accelerationAmplitude: 5,
    stressAmplitude: 10,
    roadSurfaceType: 'highway',
    vehicleSpeed: 80
  };

  for (const temp of temperatures) {
    const tempConditions = { ...baseConditions, temperature: temp };
    const performance = harvester.calculatePiezoelectricPower(testConfig, tempConditions);

    console.log(`${temp.toString().padEnd(15)}\t${performance.instantaneousPower.toFixed(3)}\t\t${performance.efficiency.toFixed(1)}\t\t${performance.reliability.toFixed(1)}`);
  }

  console.log();
}

/**
 * Run all examples
 */
export function runAllExamples(): void {
  console.log('🔋 Piezoelectric Energy Harvesting System Examples\n');
  console.log('=' .repeat(60));

  try {
    basicPowerCalculationExample();
    multiSourceOptimizationExample();
    integratedSystemExample();
    customMaterialExample();
    performanceAnalysisExample();

    console.log('✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}