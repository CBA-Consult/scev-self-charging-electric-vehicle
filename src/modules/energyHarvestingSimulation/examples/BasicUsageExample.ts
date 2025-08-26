/**
 * Basic Usage Example for Energy Harvesting Simulation
 * 
 * This example demonstrates how to use the energy harvesting simulation system
 * to model performance under various driving conditions and optimize efficiency.
 */

import {
  EnergyHarvestingSimulator,
  createEnergyHarvestingSimulator,
  defaultVehicleConfiguration,
  defaultOptimizationParameters,
  createTestSimulationInputs,
  weatherConditions,
  standardDrivingScenarios
} from '../index';

import { ScenarioGenerator } from '../ScenarioGenerator';
import { PerformanceAnalyzer } from '../PerformanceAnalyzer';
import { OptimizationEngine } from '../OptimizationEngine';

/**
 * Basic simulation example
 */
export async function basicSimulationExample(): Promise<void> {
  console.log('=== Energy Harvesting Simulation - Basic Example ===\n');
  
  // Create simulator with default configuration
  const simulator = createEnergyHarvestingSimulator(
    defaultVehicleConfiguration,
    defaultOptimizationParameters
  );
  
  // Create test inputs for city driving in clear weather
  const simulationInputs = createTestSimulationInputs({
    drivingConditions: {
      speed: 45,                    // km/h - typical city speed
      acceleration: 0,              // m/s² - steady state
      brakingIntensity: 0,          // no braking
      steeringAngle: 0,             // straight ahead
      roadGradient: 0,              // flat road
      roadSurface: 'asphalt',
      trafficDensity: 'medium'
    },
    weatherConditions: weatherConditions.clear,
    simulationParameters: {
      duration: 300,                // 5 minutes
      timeStep: 1.0,                // 1 second steps
      realTimeMode: false,
      dataLogging: true,
      optimizationEnabled: true
    }
  });
  
  console.log('Running basic simulation...');
  
  // Run single simulation step
  const stepResult = simulator.simulateStep(simulationInputs);
  
  console.log('\n--- Single Step Results ---');
  console.log(`Total Power Generation: ${stepResult.powerGeneration.total.toFixed(2)} W`);
  console.log(`- Regenerative Braking: ${stepResult.powerGeneration.regenerativeBraking.toFixed(2)} W`);
  console.log(`- Electromagnetic Dampers: ${stepResult.powerGeneration.electromagneticShockAbsorbers.toFixed(2)} W`);
  console.log(`- Piezoelectric Harvesters: ${stepResult.powerGeneration.piezoelectricHarvesters.toFixed(2)} W`);
  console.log(`- MR Fluid Dampers: ${stepResult.powerGeneration.mrFluidDampers.toFixed(2)} W`);
  
  console.log(`\nOverall Efficiency: ${(stepResult.efficiency.overall * 100).toFixed(1)}%`);
  console.log(`System Health: ${(stepResult.diagnostics.systemHealth * 100).toFixed(1)}%`);
  
  if (stepResult.optimization.suggestedImprovements.length > 0) {
    console.log('\nOptimization Suggestions:');
    stepResult.optimization.suggestedImprovements.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion}`);
    });
  }
}

/**
 * Comprehensive scenario testing example
 */
export async function scenarioTestingExample(): Promise<void> {
  console.log('\n=== Scenario Testing Example ===\n');
  
  const simulator = createEnergyHarvestingSimulator(defaultVehicleConfiguration);
  const scenarioGenerator = new ScenarioGenerator();
  
  // Generate different driving scenarios
  const scenarios = [
    scenarioGenerator.generateScenario({
      scenarioType: 'city',
      duration: 1800, // 30 minutes
      weatherType: 'clear',
      trafficDensity: 'heavy',
      roadConditions: 'good'
    }),
    scenarioGenerator.generateScenario({
      scenarioType: 'highway',
      duration: 3600, // 1 hour
      weatherType: 'clear',
      trafficDensity: 'light',
      roadConditions: 'excellent'
    }),
    scenarioGenerator.generateScenario({
      scenarioType: 'mountain',
      duration: 2700, // 45 minutes
      weatherType: 'clear',
      trafficDensity: 'light',
      roadConditions: 'good'
    })
  ];
  
  console.log('Testing multiple driving scenarios...\n');
  
  for (const scenario of scenarios) {
    console.log(`--- ${scenario.name} ---`);
    
    // Analyze energy potential
    const energyPotential = scenarioGenerator.analyzeScenarioEnergyPotential(scenario);
    console.log(`Energy Potential: ${energyPotential.totalEnergyPotential.toFixed(1)}%`);
    console.log(`- Regenerative Braking: ${energyPotential.regenerativeBrakingPotential.toFixed(1)}%`);
    console.log(`- Suspension Energy: ${energyPotential.suspensionEnergyPotential.toFixed(1)}%`);
    console.log(`- Piezoelectric: ${energyPotential.piezoelectricPotential.toFixed(1)}%`);
    
    // Run simulation for first 60 seconds of scenario
    const testInputs = createTestSimulationInputs({
      drivingConditions: scenario.timeSteps[0],
      weatherConditions: scenario.weatherConditions,
      simulationParameters: {
        duration: 60,
        timeStep: 1.0,
        realTimeMode: false,
        dataLogging: true,
        optimizationEnabled: true
      }
    });
    
    const results = await simulator.runSimulation(testInputs);
    const summary = simulator.getSimulationSummary();
    
    console.log(`Average Power: ${summary.averagePowerGeneration.toFixed(2)} W`);
    console.log(`Peak Power: ${summary.peakPowerOutput.toFixed(2)} W`);
    console.log(`Average Efficiency: ${(summary.averageEfficiency * 100).toFixed(1)}%`);
    console.log('');
  }
}

/**
 * Performance optimization example
 */
export async function optimizationExample(): Promise<void> {
  console.log('\n=== Performance Optimization Example ===\n');
  
  const simulator = createEnergyHarvestingSimulator(
    defaultVehicleConfiguration,
    defaultOptimizationParameters
  );
  
  const optimizationEngine = new OptimizationEngine(defaultOptimizationParameters);
  const performanceAnalyzer = new PerformanceAnalyzer();
  
  // Test different driving conditions
  const testConditions = [
    { speed: 30, acceleration: 0, description: 'City cruising' },
    { speed: 50, acceleration: -2, description: 'City braking' },
    { speed: 100, acceleration: 0, description: 'Highway cruising' },
    { speed: 80, acceleration: -3, description: 'Highway braking' },
    { speed: 60, acceleration: 1, description: 'Mountain climbing' }
  ];
  
  console.log('Optimizing performance for different conditions...\n');
  
  for (const condition of testConditions) {
    console.log(`--- ${condition.description} ---`);
    
    const inputs = createTestSimulationInputs({
      drivingConditions: {
        speed: condition.speed,
        acceleration: condition.acceleration,
        brakingIntensity: Math.max(0, -condition.acceleration / 5),
        steeringAngle: 0,
        roadGradient: 0,
        roadSurface: 'asphalt',
        trafficDensity: 'medium'
      }
    });
    
    // Run simulation
    const result = simulator.simulateStep(inputs);
    
    // Analyze performance
    const performanceMetrics = performanceAnalyzer.analyzePerformance({
      powerGeneration: result.powerGeneration,
      efficiency: result.efficiency,
      vehicleConfig: inputs.vehicleConfiguration,
      operatingConditions: inputs.drivingConditions
    });
    
    // Get optimization recommendations
    const optimization = optimizationEngine.optimize({
      currentPerformance: performanceMetrics,
      operatingConditions: inputs.drivingConditions,
      vehicleConfiguration: inputs.vehicleConfiguration
    });
    
    console.log(`Power Generation: ${result.powerGeneration.total.toFixed(2)} W`);
    console.log(`Efficiency: ${(result.efficiency.overall * 100).toFixed(1)}%`);
    console.log(`Power Density: ${performanceMetrics.powerDensity.toFixed(1)} W/kg`);
    console.log(`Optimization Confidence: ${(optimization.confidence * 100).toFixed(1)}%`);
    
    if (optimization.potentialGains.power > 5) {
      console.log(`Potential Power Improvement: ${optimization.potentialGains.power.toFixed(1)}%`);
    }
    
    if (optimization.potentialGains.efficiency > 3) {
      console.log(`Potential Efficiency Improvement: ${optimization.potentialGains.efficiency.toFixed(1)}%`);
    }
    
    console.log('');
  }
}

/**
 * Weather impact analysis example
 */
export async function weatherImpactExample(): Promise<void> {
  console.log('\n=== Weather Impact Analysis ===\n');
  
  const simulator = createEnergyHarvestingSimulator(defaultVehicleConfiguration);
  
  const weatherTypes = [
    { name: 'Clear', conditions: weatherConditions.clear },
    { name: 'Rain', conditions: weatherConditions.rain },
    { name: 'Snow', conditions: weatherConditions.snow },
    { name: 'Hot', conditions: weatherConditions.hot },
    { name: 'Cold', conditions: weatherConditions.cold }
  ];
  
  console.log('Analyzing weather impact on energy harvesting...\n');
  
  for (const weather of weatherTypes) {
    console.log(`--- ${weather.name} Weather ---`);
    
    const inputs = createTestSimulationInputs({
      drivingConditions: {
        speed: 60,
        acceleration: -1, // Light braking
        brakingIntensity: 0.2,
        steeringAngle: 5,
        roadGradient: 0,
        roadSurface: weather.conditions.roadCondition === 'dry' ? 'asphalt' : weather.conditions.roadCondition as any,
        trafficDensity: 'medium'
      },
      weatherConditions: weather.conditions
    });
    
    const result = simulator.simulateStep(inputs);
    
    console.log(`Temperature: ${weather.conditions.temperature}°C`);
    console.log(`Road Condition: ${weather.conditions.roadCondition}`);
    console.log(`Total Power: ${result.powerGeneration.total.toFixed(2)} W`);
    console.log(`Efficiency: ${(result.efficiency.overall * 100).toFixed(1)}%`);
    console.log(`System Health: ${(result.diagnostics.systemHealth * 100).toFixed(1)}%`);
    
    // Check for weather-specific alerts
    if (result.diagnostics.maintenanceAlerts.length > 0) {
      console.log('Alerts:');
      result.diagnostics.maintenanceAlerts.forEach(alert => {
        console.log(`- ${alert}`);
      });
    }
    
    console.log('');
  }
}

/**
 * Real-time optimization example
 */
export async function realTimeOptimizationExample(): Promise<void> {
  console.log('\n=== Real-Time Optimization Example ===\n');
  
  const simulator = createEnergyHarvestingSimulator(
    defaultVehicleConfiguration,
    defaultOptimizationParameters
  );
  
  const optimizationEngine = new OptimizationEngine(defaultOptimizationParameters);
  
  console.log('Demonstrating real-time parameter adjustment...\n');
  
  // Simulate changing driving conditions
  const drivingSequence = [
    { speed: 0, acceleration: 2, description: 'Starting from stop' },
    { speed: 30, acceleration: 0, description: 'City cruising' },
    { speed: 30, acceleration: -3, description: 'Emergency braking' },
    { speed: 5, acceleration: 1, description: 'Accelerating after stop' },
    { speed: 60, acceleration: 0, description: 'Highway entrance' },
    { speed: 100, acceleration: 0, description: 'Highway cruising' },
    { speed: 100, acceleration: -2, description: 'Highway exit braking' }
  ];
  
  for (const [index, condition] of drivingSequence.entries()) {
    console.log(`Step ${index + 1}: ${condition.description}`);
    
    const inputs = createTestSimulationInputs({
      drivingConditions: {
        speed: condition.speed,
        acceleration: condition.acceleration,
        brakingIntensity: Math.max(0, -condition.acceleration / 5),
        steeringAngle: 0,
        roadGradient: 0,
        roadSurface: 'asphalt',
        trafficDensity: 'medium'
      }
    });
    
    // Get current performance
    const result = simulator.simulateStep(inputs);
    
    // Get real-time parameter adjustments
    const adjustments = optimizationEngine.adjustParameters({
      currentPerformance: {
        powerGeneration: result.powerGeneration,
        efficiency: result.efficiency.overall
      },
      operatingConditions: inputs.drivingConditions,
      vehicleConfiguration: inputs.vehicleConfiguration
    });
    
    console.log(`  Power: ${result.powerGeneration.total.toFixed(2)} W`);
    console.log(`  Efficiency: ${(result.efficiency.overall * 100).toFixed(1)}%`);
    
    if (Object.keys(adjustments).length > 0) {
      console.log('  Parameter Adjustments:');
      Object.entries(adjustments).forEach(([param, value]) => {
        console.log(`    ${param}: ${value.toFixed(3)}`);
      });
    }
    
    console.log('');
  }
}

/**
 * Performance benchmarking example
 */
export async function benchmarkingExample(): Promise<void> {
  console.log('\n=== Performance Benchmarking Example ===\n');
  
  const simulator = createEnergyHarvestingSimulator(defaultVehicleConfiguration);
  const performanceAnalyzer = new PerformanceAnalyzer();
  
  // Test standard driving cycle
  const inputs = createTestSimulationInputs({
    drivingConditions: {
      speed: 50,
      acceleration: -1.5, // Moderate braking
      brakingIntensity: 0.3,
      steeringAngle: 10,
      roadGradient: 2,
      roadSurface: 'asphalt',
      trafficDensity: 'medium'
    }
  });
  
  const result = simulator.simulateStep(inputs);
  
  const performanceMetrics = performanceAnalyzer.analyzePerformance({
    powerGeneration: result.powerGeneration,
    efficiency: result.efficiency,
    vehicleConfig: inputs.vehicleConfiguration,
    operatingConditions: inputs.drivingConditions
  });
  
  const benchmarks = performanceAnalyzer.benchmarkPerformance(performanceMetrics);
  const optimizationOpportunities = performanceAnalyzer.identifyOptimizationOpportunities({
    powerGeneration: result.powerGeneration,
    efficiency: result.efficiency,
    vehicleConfig: inputs.vehicleConfiguration,
    operatingConditions: inputs.drivingConditions
  });
  
  console.log('Performance Benchmarking Results:\n');
  
  Object.entries(benchmarks).forEach(([metric, data]) => {
    console.log(`${metric}:`);
    console.log(`  Value: ${data.value.toFixed(3)}`);
    console.log(`  Rating: ${data.rating}`);
    console.log(`  Percentile: ${data.percentile}th`);
    console.log('');
  });
  
  if (optimizationOpportunities.opportunities.length > 0) {
    console.log('Optimization Opportunities:');
    optimizationOpportunities.opportunities.forEach((opp, index) => {
      console.log(`${index + 1}. ${opp.component} (${opp.impact} impact)`);
      console.log(`   Issue: ${opp.issue}`);
      console.log(`   Recommendation: ${opp.recommendation}`);
      console.log(`   Expected Improvement: ${opp.expectedImprovement.toFixed(1)}%`);
      console.log('');
    });
  }
  
  if (optimizationOpportunities.priorityActions.length > 0) {
    console.log('Priority Actions:');
    optimizationOpportunities.priorityActions.forEach((action, index) => {
      console.log(`${index + 1}. ${action}`);
    });
  }
}

/**
 * Generate comprehensive performance report
 */
export async function generatePerformanceReport(): Promise<void> {
  console.log('\n=== Comprehensive Performance Report ===\n');
  
  const simulator = createEnergyHarvestingSimulator(defaultVehicleConfiguration);
  const performanceAnalyzer = new PerformanceAnalyzer();
  
  // Run simulation with typical mixed driving conditions
  const inputs = createTestSimulationInputs({
    simulationParameters: {
      duration: 300, // 5 minutes
      timeStep: 1.0,
      realTimeMode: false,
      dataLogging: true,
      optimizationEnabled: true
    }
  });
  
  console.log('Generating comprehensive performance report...\n');
  
  const results = await simulator.runSimulation(inputs);
  const summary = simulator.getSimulationSummary();
  
  // Analyze overall performance
  const lastResult = results[results.length - 1];
  const report = performanceAnalyzer.generatePerformanceReport({
    powerGeneration: lastResult.powerGeneration,
    efficiency: lastResult.efficiency,
    vehicleConfig: inputs.vehicleConfiguration,
    operatingConditions: inputs.drivingConditions,
    timeHistory: results
  });
  
  console.log(report);
  
  console.log('\n--- Simulation Summary ---');
  console.log(`Total Simulation Time: ${inputs.simulationParameters.duration} seconds`);
  console.log(`Average Power Generation: ${summary.averagePowerGeneration.toFixed(2)} W`);
  console.log(`Total Energy Generated: ${summary.totalEnergyGenerated.toFixed(3)} Wh`);
  console.log(`Peak Power Output: ${summary.peakPowerOutput.toFixed(2)} W`);
  console.log(`Average Efficiency: ${(summary.averageEfficiency * 100).toFixed(1)}%`);
}

/**
 * Run all examples
 */
export async function runAllExamples(): Promise<void> {
  try {
    await basicSimulationExample();
    await scenarioTestingExample();
    await optimizationExample();
    await weatherImpactExample();
    await realTimeOptimizationExample();
    await benchmarkingExample();
    await generatePerformanceReport();
    
    console.log('\n=== All Examples Completed Successfully ===');
    
  } catch (error) {
    console.error('Example execution failed:', error);
  }
}

// Export individual examples for selective testing
export {
  basicSimulationExample,
  scenarioTestingExample,
  optimizationExample,
  weatherImpactExample,
  realTimeOptimizationExample,
  benchmarkingExample,
  generatePerformanceReport
};