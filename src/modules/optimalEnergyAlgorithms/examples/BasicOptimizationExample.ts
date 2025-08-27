/**
 * Basic Optimization Example
 * 
 * Demonstrates how to use the optimal energy algorithms for both
 * energy conversion and storage optimization.
 */

import { OptimalEnergyConverter } from '../OptimalEnergyConverter';
import { OptimalStorageManager } from '../OptimalStorageManager';
import {
  EnergyConversionParameters,
  StorageOptimizationParameters,
  EnergySystemState,
  OptimizationObjectives
} from '../types';

/**
 * Example: Optimize electromagnetic energy conversion
 */
export async function optimizeElectromagneticConversion(): Promise<void> {
  console.log('=== Electromagnetic Energy Conversion Optimization ===');

  // Create optimal energy converter
  const converter = new OptimalEnergyConverter({
    algorithm: {
      algorithm: 'neural_network',
      parameters: {
        learningRate: 0.001,
        generations: 50
      },
      convergenceCriteria: {
        maxIterations: 50,
        toleranceThreshold: 0.001,
        improvementThreshold: 0.01,
        stallGenerations: 10
      }
    },
    objectives: {
      maximizeEfficiency: { weight: 0.5, target: 0.95, priority: 'high' },
      minimizeEnergyLoss: { weight: 0.3, target: 100, priority: 'medium' },
      maximizePowerOutput: { weight: 0.2, target: 5000, priority: 'medium' },
      minimizeCost: { weight: 0.1, target: 0.05, priority: 'low' },
      maximizeLifespan: { weight: 0.2, target: 87600, priority: 'high' },
      minimizeEmissions: { weight: 0.1, target: 0.1, priority: 'low' }
    },
    constraints: {
      efficiency: { minimum: 0.7, maximum: 0.98 },
      power: { minimum: 0, maximum: 10000 },
      temperature: { minimum: -20, maximum: 60 },
      cost: { maximum: 0.1 },
      emissions: { maximum: 0.5 },
      reliability: { minimum: 0.9 },
      responseTime: { maximum: 1000 }
    },
    updateInterval: 30000,
    adaptiveLearning: true,
    realTimeOptimization: true
  });

  // Define current conversion parameters
  const currentParameters: EnergyConversionParameters = {
    sourceType: 'electromagnetic',
    inputPower: 5000,        // 5kW input
    inputVoltage: 12,        // 12V
    inputCurrent: 416.67,    // ~417A
    inputFrequency: 50,      // 50Hz
    temperature: 25,         // 25°C
    efficiency: 0.85,        // 85% base efficiency
    loadResistance: 10,      // 10Ω
    conversionRatio: 1.0,
    harmonicDistortion: 3.0, // 3% THD
    powerFactor: 0.95
  };

  // Define system state
  const systemState: EnergySystemState = {
    timestamp: Date.now(),
    sources: new Map([['electromagnetic', currentParameters]]),
    storage: new Map(),
    loads: new Map([['vehicle_load', { power: 4000, priority: 1 }]]),
    grid: {
      frequency: 50,
      voltage: 400,
      powerFactor: 0.95,
      harmonics: 2.0
    },
    environment: {
      temperature: 25,
      humidity: 50,
      pressure: 101325,
      windSpeed: 0,
      solarIrradiance: 0
    }
  };

  try {
    // Perform optimization
    const result = await converter.optimizeConversion(currentParameters, systemState);

    console.log('Optimization Result:');
    console.log(`Success: ${result.success}`);
    console.log(`Execution Time: ${result.executionTime}ms`);
    console.log(`Efficiency Improvement: ${result.performanceMetrics.efficiency.improvement.toFixed(2)}%`);
    console.log(`Power Output Improvement: ${result.performanceMetrics.powerOutput.improvement.toFixed(0)}W`);
    console.log(`Energy Loss Reduction: ${result.performanceMetrics.energyLoss.reduction.toFixed(0)}W`);
    console.log('Recommendations:', result.recommendations);

  } catch (error) {
    console.error('Optimization failed:', error);
  }
}

/**
 * Example: Optimize battery storage system
 */
export async function optimizeBatteryStorage(): Promise<void> {
  console.log('\n=== Battery Storage Optimization ===');

  // Create storage system configuration
  const storageUnits = new Map<string, StorageOptimizationParameters>();
  storageUnits.set('main_battery', {
    storageType: 'battery',
    capacity: 100000,        // 100kWh
    currentSOC: 0.6,         // 60% charged
    maxChargePower: 50000,   // 50kW max charge
    maxDischargePower: 50000, // 50kW max discharge
    chargingEfficiency: 0.92,
    dischargingEfficiency: 0.94,
    selfDischargeRate: 0.0001, // 0.01% per hour
    cycleLife: 5000,
    currentCycles: 1000,
    temperature: 25,
    degradationFactor: 0.95,
    costPerCycle: 0.02
  });

  // Create optimal storage manager
  const storageManager = new OptimalStorageManager(
    {
      algorithm: {
        algorithm: 'particle_swarm',
        parameters: {
          swarmSize: 30,
          generations: 100,
          inertiaWeight: 0.9,
          cognitiveWeight: 2.0,
          socialWeight: 2.0
        },
        convergenceCriteria: {
          maxIterations: 100,
          toleranceThreshold: 0.01,
          improvementThreshold: 0.02,
          stallGenerations: 15
        }
      },
      objectives: {
        maximizeEfficiency: { weight: 0.4, target: 0.95, priority: 'high' },
        minimizeEnergyLoss: { weight: 0.3, target: 100, priority: 'medium' },
        maximizePowerOutput: { weight: 0.2, target: 50000, priority: 'medium' },
        minimizeCost: { weight: 0.1, target: 0.05, priority: 'low' },
        maximizeLifespan: { weight: 0.3, target: 87600, priority: 'high' },
        minimizeEmissions: { weight: 0.2, target: 0.1, priority: 'medium' }
      },
      constraints: {
        efficiency: { minimum: 0.7, maximum: 0.98 },
        power: { minimum: 0, maximum: 60000 },
        temperature: { minimum: -20, maximum: 60 },
        cost: { maximum: 0.15 },
        emissions: { maximum: 1.0 },
        reliability: { minimum: 0.95 },
        responseTime: { maximum: 5000 }
      },
      updateInterval: 60000,
      predictiveHorizon: 24,
      degradationModeling: true,
      thermalManagement: true,
      loadForecasting: true
    },
    {
      storageUnits,
      interconnections: [],
      controlStrategy: 'centralized',
      redundancyLevel: 0.1
    }
  );

  // Define system state
  const systemState: EnergySystemState = {
    timestamp: Date.now(),
    sources: new Map(),
    storage: storageUnits,
    loads: new Map([['facility_load', { power: 30000, priority: 1 }]]),
    grid: {
      frequency: 50,
      voltage: 400,
      powerFactor: 0.95,
      harmonics: 2.0
    },
    environment: {
      temperature: 25,
      humidity: 50,
      pressure: 101325,
      windSpeed: 0,
      solarIrradiance: 0
    }
  };

  try {
    // Perform storage optimization
    const result = await storageManager.optimizeStorage(
      storageUnits,
      systemState,
      30000, // 30kW power demand
      40000  // 40kW power generation
    );

    console.log('Storage Optimization Result:');
    console.log(`Success: ${result.success}`);
    console.log(`Execution Time: ${result.executionTime}ms`);
    console.log(`Efficiency Improvement: ${result.performanceMetrics.efficiency.improvement.toFixed(2)}%`);
    console.log(`Cost Savings: $${result.performanceMetrics.cost.savings.toFixed(2)}`);
    console.log(`Reliability Improvement: ${result.performanceMetrics.reliability.improvement.toFixed(2)}%`);
    console.log('Recommendations:', result.recommendations);

  } catch (error) {
    console.error('Storage optimization failed:', error);
  }
}

/**
 * Example: Combined optimization scenario
 */
export async function combinedOptimizationExample(): Promise<void> {
  console.log('\n=== Combined Energy System Optimization ===');

  // This example shows how both conversion and storage optimization
  // can work together in a real-world scenario

  console.log('1. Optimizing energy conversion from multiple sources...');
  await optimizeElectromagneticConversion();

  console.log('\n2. Optimizing energy storage for maximum efficiency...');
  await optimizeBatteryStorage();

  console.log('\n3. System-wide optimization complete!');
  console.log('Benefits achieved:');
  console.log('- Improved energy conversion efficiency');
  console.log('- Optimized storage charging/discharging strategies');
  console.log('- Reduced energy losses');
  console.log('- Extended system lifespan');
  console.log('- Lower operational costs');
  console.log('- Reduced environmental impact');
}

// Run examples if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      await combinedOptimizationExample();
    } catch (error) {
      console.error('Example execution failed:', error);
    }
  })();
}