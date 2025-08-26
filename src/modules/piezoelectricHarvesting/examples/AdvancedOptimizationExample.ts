/**
 * Advanced Optimization and Experimental Methodologies Example
 * 
 * This example demonstrates advanced features including numerical analysis,
 * optimization algorithms, experimental validation, and reliability analysis
 * for piezoelectric energy harvesting systems.
 */

import {
  PiezoelectricEnergyHarvester,
  NumericalAnalysis,
  PiezoelectricIntegration,
  defaultPiezoelectricMaterials,
  piezoelectricUtils,
  type HarvesterConfiguration,
  type EnvironmentalConditions,
  type OptimizationParameters,
  type FEAParameters,
  type NonlinearParameters
} from '../index';

/**
 * Example 1: Advanced Numerical Analysis and FEA
 */
export function advancedNumericalAnalysisExample(): void {
  console.log('=== Advanced Numerical Analysis and FEA Example ===\n');

  const numericalAnalysis = new NumericalAnalysis();

  // Configure a complex harvester for analysis
  const complexConfig: HarvesterConfiguration = {
    type: 'bimorph',
    dimensions: { length: 80, width: 30, thickness: 1.0 },
    material: defaultPiezoelectricMaterials.PMN_PT, // Single crystal material
    resonantFrequency: 15,
    dampingRatio: 0.015,
    loadResistance: 150000,
    capacitance: 120
  };

  // Perform modal analysis
  console.log('1. Modal Analysis Results:');
  const modalResults = numericalAnalysis.performModalAnalysis(complexConfig);
  
  console.log(`- Number of modes analyzed: ${modalResults.naturalFrequencies.length}`);
  if (modalResults.naturalFrequencies.length > 0) {
    console.log(`- First natural frequency: ${modalResults.naturalFrequencies[0]?.toFixed(2) || 'N/A'} Hz`);
    console.log(`- Second natural frequency: ${modalResults.naturalFrequencies[1]?.toFixed(2) || 'N/A'} Hz`);
    console.log(`- Third natural frequency: ${modalResults.naturalFrequencies[2]?.toFixed(2) || 'N/A'} Hz`);
  }

  // Perform frequency response analysis
  console.log('\n2. Frequency Response Analysis:');
  const frequencyRange = { min: 1, max: 100, points: 100 };
  const frequencyResponse = numericalAnalysis.performFrequencyResponse(complexConfig, frequencyRange);
  
  // Find resonance peaks
  const powerResponse = frequencyResponse.power;
  const maxPowerIndex = powerResponse.indexOf(Math.max(...powerResponse));
  const resonantFreq = frequencyResponse.frequencies[maxPowerIndex];
  const maxPower = powerResponse[maxPowerIndex];
  
  console.log(`- Frequency range: ${frequencyRange.min}-${frequencyRange.max} Hz`);
  console.log(`- Peak power frequency: ${resonantFreq?.toFixed(2) || 'N/A'} Hz`);
  console.log(`- Maximum power output: ${maxPower?.toFixed(4) || 'N/A'} W`);

  // Calculate bandwidth (frequencies at -3dB from peak)
  const halfMaxPower = maxPower * 0.707; // -3dB point
  let lowerFreq = 0, upperFreq = 0;
  
  for (let i = 0; i < powerResponse.length; i++) {
    if (powerResponse[i] >= halfMaxPower && lowerFreq === 0) {
      lowerFreq = frequencyResponse.frequencies[i];
    }
    if (powerResponse[i] >= halfMaxPower) {
      upperFreq = frequencyResponse.frequencies[i];
    }
  }
  
  const bandwidth = upperFreq - lowerFreq;
  const qualityFactor = resonantFreq / bandwidth;
  
  console.log(`- -3dB Bandwidth: ${bandwidth.toFixed(2)} Hz`);
  console.log(`- Quality Factor: ${qualityFactor.toFixed(1)}`);

  // Perform sensitivity analysis
  console.log('\n3. Sensitivity Analysis:');
  const designVariables = ['length', 'width', 'thickness', 'resonantFrequency'];
  const sensitivity = numericalAnalysis.performSensitivityAnalysis(complexConfig, designVariables);
  
  console.log('Design Variable Sensitivities:');
  for (let i = 0; i < designVariables.length; i++) {
    const variable = designVariables[i];
    const gradient = sensitivity.gradients[i];
    console.log(`- ${variable}: ${gradient?.toFixed(6) || 'N/A'}`);
  }

  console.log();
}

/**
 * Example 2: Multi-Objective Optimization
 */
export function multiObjectiveOptimizationExample(): void {
  console.log('=== Multi-Objective Optimization Example ===\n');

  const harvester = new PiezoelectricEnergyHarvester();

  // Define multiple optimization objectives
  const objectives = [
    { name: 'Power Maximization', weight: 0.4 },
    { name: 'Efficiency Optimization', weight: 0.3 },
    { name: 'Reliability Enhancement', weight: 0.2 },
    { name: 'Cost Minimization', weight: 0.1 }
  ];

  console.log('Optimization Objectives:');
  objectives.forEach(obj => {
    console.log(`- ${obj.name}: ${(obj.weight * 100).toFixed(0)}% weight`);
  });

  // Define Pareto-optimal solutions for different scenarios
  const scenarios = [
    {
      name: 'Urban Driving',
      conditions: {
        frequency: 35,
        amplitude: 8,
        temperature: 30,
        stress: 15
      },
      constraints: {
        targetPowerOutput: 800,
        maxWeight: 40,
        maxVolume: 8000,
        minReliability: 0.92,
        operatingTemperatureRange: { min: -10, max: 70 },
        costConstraint: 12000
      }
    },
    {
      name: 'Highway Driving',
      conditions: {
        frequency: 25,
        amplitude: 5,
        temperature: 25,
        stress: 10
      },
      constraints: {
        targetPowerOutput: 600,
        maxWeight: 35,
        maxVolume: 6000,
        minReliability: 0.95,
        operatingTemperatureRange: { min: -20, max: 60 },
        costConstraint: 10000
      }
    },
    {
      name: 'Off-Road Driving',
      conditions: {
        frequency: 45,
        amplitude: 15,
        temperature: 40,
        stress: 25
      },
      constraints: {
        targetPowerOutput: 1200,
        maxWeight: 60,
        maxVolume: 12000,
        minReliability: 0.88,
        operatingTemperatureRange: { min: -30, max: 80 },
        costConstraint: 15000
      }
    }
  ];

  console.log('\nMulti-Objective Optimization Results:\n');
  console.log('Scenario\t\tPower (W)\tEfficiency (%)\tReliability (%)\tCost Score');
  console.log('─'.repeat(80));

  for (const scenario of scenarios) {
    // Simulate multi-objective optimization
    const multiSourceInputs = {
      roadVibrations: {
        frequency: scenario.conditions.frequency,
        amplitude: scenario.conditions.amplitude,
        powerSpectralDensity: [1, 2, 3, 2, 1]
      },
      suspensionMovement: {
        displacement: 10,
        velocity: 50,
        force: 1000
      },
      tireDeformation: {
        contactPressure: scenario.conditions.stress / 10,
        deformationRate: 100,
        rollingResistance: 200
      },
      engineVibrations: {
        frequency: 40,
        amplitude: 3
      }
    };

    const optimizationResult = harvester.optimizeMultiSourceHarvesting(
      multiSourceInputs,
      scenario.constraints
    );

    // Calculate composite scores
    const powerScore = Math.min(100, (optimizationResult.totalPowerOutput / scenario.constraints.targetPowerOutput) * 100);
    const efficiencyScore = optimizationResult.systemEfficiency;
    const reliabilityScore = optimizationResult.reliabilityScore;
    const costScore = Math.max(0, 100 - (scenario.constraints.costConstraint / 200)); // Simplified cost score

    console.log(`${scenario.name.padEnd(20)}\t${optimizationResult.totalPowerOutput.toFixed(1)}\t\t${efficiencyScore.toFixed(1)}\t\t${reliabilityScore.toFixed(1)}\t\t${costScore.toFixed(1)}`);
  }

  console.log();
}

/**
 * Example 3: Experimental Validation and Calibration
 */
export function experimentalValidationExample(): void {
  console.log('=== Experimental Validation and Calibration Example ===\n');

  const harvester = new PiezoelectricEnergyHarvester();

  // Simulate experimental data collection
  const experimentalData = {
    testConditions: [
      { frequency: 20, amplitude: 4, temperature: 20, measuredPower: 0.245 },
      { frequency: 25, amplitude: 5, temperature: 25, measuredPower: 0.387 },
      { frequency: 30, amplitude: 6, temperature: 30, measuredPower: 0.298 },
      { frequency: 35, amplitude: 7, temperature: 35, measuredPower: 0.421 },
      { frequency: 40, amplitude: 8, temperature: 40, measuredPower: 0.356 }
    ],
    materialProperties: {
      measuredPiezoConstant: 580, // Slightly different from datasheet
      measuredCouplingCoeff: 0.73,
      measuredQualityFactor: 68
    }
  };

  // Test configuration based on experimental setup
  const testConfig: HarvesterConfiguration = {
    type: 'cantilever',
    dimensions: { length: 50, width: 20, thickness: 0.5 },
    material: {
      ...defaultPiezoelectricMaterials.PZT_5H,
      // Use measured properties for calibration
      piezoelectricConstant: experimentalData.materialProperties.measuredPiezoConstant,
      couplingCoefficient: experimentalData.materialProperties.measuredCouplingCoeff,
      qualityFactor: experimentalData.materialProperties.measuredQualityFactor
    },
    resonantFrequency: 25,
    dampingRatio: 0.02,
    loadResistance: 100000,
    capacitance: 47
  };

  console.log('Experimental Validation Results:\n');
  console.log('Test\tFreq(Hz)\tAmpl(m/s²)\tTemp(°C)\tMeasured(W)\tPredicted(W)\tError(%)');
  console.log('─'.repeat(80));

  let totalError = 0;
  let validTests = 0;

  for (let i = 0; i < experimentalData.testConditions.length; i++) {
    const test = experimentalData.testConditions[i];
    
    const conditions: EnvironmentalConditions = {
      temperature: test.temperature,
      humidity: 50,
      vibrationFrequency: test.frequency,
      accelerationAmplitude: test.amplitude,
      stressAmplitude: 10,
      roadSurfaceType: 'highway',
      vehicleSpeed: 80
    };

    const predictedPerformance = harvester.calculatePiezoelectricPower(testConfig, conditions);
    const predictedPower = predictedPerformance.instantaneousPower;
    
    const error = Math.abs((predictedPower - test.measuredPower) / test.measuredPower) * 100;
    totalError += error;
    validTests++;

    console.log(`${(i + 1).toString().padEnd(4)}\t${test.frequency}\t\t${test.amplitude}\t\t${test.temperature}\t\t${test.measuredPower.toFixed(3)}\t\t${predictedPower.toFixed(3)}\t\t${error.toFixed(1)}`);
  }

  const averageError = totalError / validTests;
  console.log(`\nAverage Prediction Error: ${averageError.toFixed(1)}%`);

  // Model calibration suggestions
  console.log('\nModel Calibration Recommendations:');
  if (averageError > 15) {
    console.log('- High prediction error detected. Consider:');
    console.log('  * Updating material property database with measured values');
    console.log('  * Refining environmental correction factors');
    console.log('  * Including additional nonlinear effects');
  } else if (averageError > 10) {
    console.log('- Moderate prediction error. Consider:');
    console.log('  * Fine-tuning damping and frequency response models');
    console.log('  * Calibrating temperature dependence coefficients');
  } else {
    console.log('- Good model accuracy achieved');
    console.log('- Model is suitable for design optimization');
  }

  console.log();
}

/**
 * Example 4: Reliability Analysis and Lifetime Prediction
 */
export function reliabilityAnalysisExample(): void {
  console.log('=== Reliability Analysis and Lifetime Prediction Example ===\n');

  const harvester = new PiezoelectricEnergyHarvester();

  // Define different operating scenarios for reliability analysis
  const operatingScenarios = [
    {
      name: 'Conservative Operation',
      stressLevel: 0.3, // 30% of max stress
      temperatureLevel: 0.4, // 40% of Curie temperature
      cyclesPerDay: 5000,
      description: 'Low stress, moderate temperature'
    },
    {
      name: 'Normal Operation',
      stressLevel: 0.5, // 50% of max stress
      temperatureLevel: 0.5, // 50% of Curie temperature
      cyclesPerDay: 10000,
      description: 'Typical automotive conditions'
    },
    {
      name: 'Aggressive Operation',
      stressLevel: 0.7, // 70% of max stress
      temperatureLevel: 0.6, // 60% of Curie temperature
      cyclesPerDay: 20000,
      description: 'High performance, demanding conditions'
    },
    {
      name: 'Extreme Operation',
      stressLevel: 0.9, // 90% of max stress
      temperatureLevel: 0.8, // 80% of Curie temperature
      cyclesPerDay: 30000,
      description: 'Maximum performance, high stress'
    }
  ];

  console.log('Reliability Analysis for Different Operating Scenarios:\n');
  console.log('Scenario\t\tStress\tTemp\tCycles/Day\tLifespan(Years)\tReliability(%)');
  console.log('─'.repeat(85));

  for (const scenario of operatingScenarios) {
    const material = defaultPiezoelectricMaterials.PZT_5H;
    const operatingStress = scenario.stressLevel * material.maxStress;
    const operatingTemp = scenario.temperatureLevel * material.curiTemperature;

    // Calculate estimated lifespan
    const lifespan = piezoelectricUtils.estimateLifespan(
      material,
      operatingStress,
      operatingTemp,
      scenario.cyclesPerDay
    );

    // Calculate reliability score based on operating conditions
    const stressReliability = Math.max(0.5, 1 - scenario.stressLevel);
    const tempReliability = Math.max(0.7, 1 - scenario.temperatureLevel);
    const fatigueReliability = Math.max(0.6, 1 - (scenario.cyclesPerDay / 50000));
    const overallReliability = stressReliability * tempReliability * fatigueReliability * 100;

    console.log(`${scenario.name.padEnd(20)}\t${(scenario.stressLevel * 100).toFixed(0)}%\t${(scenario.temperatureLevel * 100).toFixed(0)}%\t${scenario.cyclesPerDay.toLocaleString()}\t\t${lifespan.toFixed(1)}\t\t${overallReliability.toFixed(1)}`);
  }

  // Failure mode analysis
  console.log('\n\nFailure Mode Analysis:');
  console.log('─'.repeat(50));

  const failureModes = [
    {
      mode: 'Fatigue Cracking',
      probability: 0.35,
      causes: ['Cyclic stress', 'Material defects', 'Stress concentration'],
      mitigation: ['Stress reduction', 'Material selection', 'Design optimization']
    },
    {
      mode: 'Thermal Degradation',
      probability: 0.25,
      causes: ['High temperature', 'Thermal cycling', 'Curie point approach'],
      mitigation: ['Temperature control', 'Material selection', 'Thermal management']
    },
    {
      mode: 'Electrical Breakdown',
      probability: 0.20,
      causes: ['High electric field', 'Moisture ingress', 'Insulation failure'],
      mitigation: ['Voltage limiting', 'Sealing', 'Insulation design']
    },
    {
      mode: 'Mechanical Wear',
      probability: 0.15,
      causes: ['Abrasion', 'Impact', 'Mounting failure'],
      mitigation: ['Protective coating', 'Shock absorption', 'Robust mounting']
    },
    {
      mode: 'Depoling',
      probability: 0.05,
      causes: ['High temperature', 'Reverse field', 'Mechanical stress'],
      mitigation: ['Temperature control', 'Circuit protection', 'Stress management']
    }
  ];

  for (const failure of failureModes) {
    console.log(`\n${failure.mode} (${(failure.probability * 100).toFixed(0)}% probability):`);
    console.log(`  Causes: ${failure.causes.join(', ')}`);
    console.log(`  Mitigation: ${failure.mitigation.join(', ')}`);
  }

  console.log();
}

/**
 * Example 5: Advanced System Integration and Control
 */
export function advancedSystemIntegrationExample(): void {
  console.log('=== Advanced System Integration and Control Example ===\n');

  // Vehicle parameters for advanced electric vehicle
  const advancedVehicleParams = {
    mass: 2200, // kg - heavier EV with larger battery
    frontAxleWeightRatio: 0.55, // More balanced weight distribution
    wheelRadius: 0.38, // m - larger wheels
    motorCount: 4, // AWD configuration
    maxMotorTorque: 350, // Nm per motor
    motorEfficiency: 0.94, // Higher efficiency motors
    transmissionRatio: 1.0
  };

  const integration = new PiezoelectricIntegration(advancedVehicleParams);

  // Define custom energy management strategy for performance driving
  const performanceStrategy = {
    name: 'Performance Driving Strategy',
    priority: 'power_maximization' as const,
    parameters: {
      regenerativeBrakingWeight: 0.85,
      piezoelectricWeight: 0.9,
      batteryChargingPriority: 0.95,
      systemLoadPriority: 0.7
    },
    adaptiveThresholds: {
      batterySOCThreshold: 0.25,
      temperatureThreshold: 75,
      powerDemandThreshold: 80000
    }
  };

  // Add and activate the custom strategy
  integration.addEnergyStrategy(performanceStrategy);
  integration.setEnergyStrategy('performance_driving_strategy');

  // Simulate dynamic driving scenario
  const drivingScenarios = [
    {
      name: 'Acceleration Phase',
      inputs: {
        vehicleSpeed: 60,
        brakePedalPosition: 0,
        acceleratorPedalPosition: 0.8,
        batterySOC: 0.8,
        piezoSources: {
          roadVibrations: { frequency: 30, amplitude: 6 },
          suspensionMovement: { displacement: 8, velocity: 40, force: 800 },
          tireDeformation: { contactPressure: 2.8, deformationRate: 120, rollingResistance: 300 }
        }
      }
    },
    {
      name: 'Cruising Phase',
      inputs: {
        vehicleSpeed: 120,
        brakePedalPosition: 0,
        acceleratorPedalPosition: 0.3,
        batterySOC: 0.75,
        piezoSources: {
          roadVibrations: { frequency: 25, amplitude: 4 },
          suspensionMovement: { displacement: 5, velocity: 25, force: 600 },
          tireDeformation: { contactPressure: 2.2, deformationRate: 100, rollingResistance: 250 }
        }
      }
    },
    {
      name: 'Braking Phase',
      inputs: {
        vehicleSpeed: 80,
        brakePedalPosition: 0.6,
        acceleratorPedalPosition: 0,
        batterySOC: 0.7,
        piezoSources: {
          roadVibrations: { frequency: 35, amplitude: 10 },
          suspensionMovement: { displacement: 15, velocity: 80, force: 1500 },
          tireDeformation: { contactPressure: 3.5, deformationRate: 150, rollingResistance: 400 }
        }
      }
    }
  ];

  console.log('Advanced System Integration - Dynamic Driving Analysis:\n');
  console.log('Phase\t\tTotal Power(W)\tPiezo Power(W)\tRegen Power(W)\tEfficiency(%)');
  console.log('─'.repeat(80));

  for (const scenario of drivingScenarios) {
    const systemInputs = {
      vehicleSpeed: scenario.inputs.vehicleSpeed,
      brakePedalPosition: scenario.inputs.brakePedalPosition,
      acceleratorPedalPosition: scenario.inputs.acceleratorPedalPosition,
      steeringAngle: 0,
      lateralAcceleration: 0,
      longitudinalAcceleration: scenario.inputs.brakePedalPosition > 0 ? -3 : 
                               scenario.inputs.acceleratorPedalPosition > 0 ? 2 : 0,
      yawRate: 0,
      roadGradient: 0,
      batterySOC: scenario.inputs.batterySOC,
      batteryVoltage: 800, // High voltage system
      batteryCurrent: 100,
      batteryTemperature: 35,
      motorTemperatures: {
        frontLeft: 70,
        frontRight: 72
      },
      ambientTemperature: 25,
      roadSurface: 'dry' as const,
      visibility: 'clear' as const,
      piezoelectricSources: {
        roadVibrations: {
          frequency: scenario.inputs.piezoSources.roadVibrations.frequency,
          amplitude: scenario.inputs.piezoSources.roadVibrations.amplitude,
          powerSpectralDensity: [1, 2, 3, 2, 1]
        },
        suspensionMovement: scenario.inputs.piezoSources.suspensionMovement,
        tireDeformation: scenario.inputs.piezoSources.tireDeformation,
        engineVibrations: { frequency: 0, amplitude: 0 } // Electric vehicle
      },
      harvestingEnabled: true,
      optimizationMode: 'power' as const,
      environmentalFactors: {
        roadCondition: 'excellent' as const,
        weatherCondition: 'clear' as const,
        trafficDensity: 'light' as const
      }
    };

    const outputs = integration.processIntegratedSystem(systemInputs);

    const totalPower = outputs.energyManagement.totalEnergyGenerated;
    const piezoPower = outputs.piezoelectricPower.totalPiezoelectricPower;
    const regenPower = outputs.regeneratedPower || 0;
    const efficiency = outputs.energyManagement.efficiencyMetrics.overallEfficiency;

    console.log(`${scenario.name.padEnd(15)}\t${totalPower.toFixed(1)}\t\t${piezoPower.toFixed(1)}\t\t${regenPower.toFixed(1)}\t\t${efficiency.toFixed(1)}`);
  }

  // Adaptive learning demonstration
  console.log('\n\nAdaptive Learning and Optimization:');
  integration.setAdaptiveLearning(true);

  console.log('- Adaptive learning enabled');
  console.log('- System will automatically adjust parameters based on:');
  console.log('  * Driving patterns and habits');
  console.log('  * Environmental conditions');
  console.log('  * Component performance degradation');
  console.log('  * Energy demand patterns');

  // System diagnostics
  const diagnostics = integration.getSystemDiagnostics();
  console.log('\nSystem Health Monitoring:');
  console.log(`- Active Energy Strategy: ${diagnostics.currentStrategy}`);
  console.log(`- Performance History Records: ${diagnostics.performanceHistory.length}`);
  console.log(`- Component Health Status:`);
  
  for (const [component, health] of diagnostics.maintenanceData.componentHealth) {
    const healthPercent = (health * 100).toFixed(1);
    const status = health > 0.8 ? 'Good' : health > 0.5 ? 'Fair' : 'Poor';
    console.log(`  * ${component}: ${healthPercent}% (${status})`);
  }

  console.log();
}

/**
 * Run all advanced examples
 */
export function runAllAdvancedExamples(): void {
  console.log('🔬 Advanced Piezoelectric Energy Harvesting Examples\n');
  console.log('=' .repeat(70));

  try {
    advancedNumericalAnalysisExample();
    multiObjectiveOptimizationExample();
    experimentalValidationExample();
    reliabilityAnalysisExample();
    advancedSystemIntegrationExample();

    console.log('✅ All advanced examples completed successfully!');
    console.log('\n📊 Summary of Advanced Capabilities Demonstrated:');
    console.log('- Finite Element Analysis and Modal Analysis');
    console.log('- Multi-objective optimization with Pareto solutions');
    console.log('- Experimental validation and model calibration');
    console.log('- Comprehensive reliability and lifetime analysis');
    console.log('- Advanced system integration with adaptive control');
    console.log('- Predictive maintenance and health monitoring');
  } catch (error) {
    console.error('❌ Error running advanced examples:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllAdvancedExamples();
}