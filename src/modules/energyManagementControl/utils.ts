/**
 * Utility functions for Energy Management Control System
 */

import {
  EnergyManagementConfig,
  EnergyDistributionConfig,
  VehicleIntegrationConfig,
  ControlStrategyConfig,
  OptimizationConfig,
  EnergyManagementInputs
} from './types';
import { EnergyManagementController } from './EnergyManagementController';
import { EnergyDistributionManager } from './EnergyDistributionManager';
import { VehicleEnergyIntegration } from './VehicleEnergyIntegration';
import { AdaptiveControlStrategy } from './AdaptiveControlStrategy';
import { EnergyOptimizationEngine } from './EnergyOptimizationEngine';

/**
 * Create a complete energy management system with default configuration
 */
export function createEnergyManagementSystem(
  customConfig?: Partial<EnergyManagementConfig>
): EnergyManagementController {
  const defaultConfig: EnergyManagementConfig = {
    updateFrequency: 10, // 10 Hz
    strategy: 'adaptive',
    predictionHorizon: 300, // 5 minutes
    vehicleIntegration: {
      enabled: true,
      communicationProtocol: 'CAN',
      updateRate: 10
    },
    safetyLimits: {
      maxPowerTransfer: 5000, // 5kW
      maxTemperature: 80, // 80°C
      minBatterySOC: 10, // 10%
      maxBatterySOC: 95 // 95%
    },
    optimization: {
      enabled: true,
      algorithm: 'genetic',
      updateInterval: 60, // 60 seconds
      convergenceThreshold: 0.001
    }
  };

  const config = { ...defaultConfig, ...customConfig };
  return new EnergyManagementController(config);
}

/**
 * Create a distribution manager with default configuration
 */
export function createDistributionManager(
  config: EnergyManagementConfig,
  customDistributionConfig?: Partial<EnergyDistributionConfig>
): EnergyDistributionManager {
  return new EnergyDistributionManager(config);
}

/**
 * Create vehicle integration with default configuration
 */
export function createVehicleIntegration(
  config: EnergyManagementConfig,
  customIntegrationConfig?: Partial<VehicleIntegrationConfig>
): VehicleEnergyIntegration {
  return new VehicleEnergyIntegration(config);
}

/**
 * Create adaptive strategy with default configuration
 */
export function createAdaptiveStrategy(
  config: EnergyManagementConfig,
  customStrategyConfig?: Partial<ControlStrategyConfig>
): AdaptiveControlStrategy {
  return new AdaptiveControlStrategy(config);
}

/**
 * Create optimization engine with default configuration
 */
export function createOptimizationEngine(
  config: EnergyManagementConfig,
  customOptimizationConfig?: Partial<OptimizationConfig>
): EnergyOptimizationEngine {
  return new EnergyOptimizationEngine(config);
}

/**
 * Validate energy management configuration
 */
export function validateEnergyManagementConfig(config: EnergyManagementConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate update frequency
  if (config.updateFrequency <= 0 || config.updateFrequency > 100) {
    errors.push('Update frequency must be between 1 and 100 Hz');
  }

  // Validate prediction horizon
  if (config.predictionHorizon < 60 || config.predictionHorizon > 3600) {
    warnings.push('Prediction horizon should be between 1 minute and 1 hour');
  }

  // Validate safety limits
  if (config.safetyLimits.maxPowerTransfer <= 0) {
    errors.push('Maximum power transfer must be positive');
  }

  if (config.safetyLimits.maxTemperature <= config.safetyLimits.maxTemperature) {
    errors.push('Maximum temperature must be greater than minimum temperature');
  }

  if (config.safetyLimits.minBatterySOC < 0 || config.safetyLimits.minBatterySOC > 100) {
    errors.push('Minimum battery SOC must be between 0 and 100%');
  }

  if (config.safetyLimits.maxBatterySOC < 0 || config.safetyLimits.maxBatterySOC > 100) {
    errors.push('Maximum battery SOC must be between 0 and 100%');
  }

  if (config.safetyLimits.minBatterySOC >= config.safetyLimits.maxBatterySOC) {
    errors.push('Minimum battery SOC must be less than maximum battery SOC');
  }

  // Validate optimization settings
  if (config.optimization.enabled) {
    if (config.optimization.updateInterval <= 0) {
      errors.push('Optimization update interval must be positive');
    }

    if (config.optimization.convergenceThreshold <= 0 || config.optimization.convergenceThreshold >= 1) {
      errors.push('Convergence threshold must be between 0 and 1');
    }
  }

  // Validate vehicle integration
  if (config.vehicleIntegration.enabled) {
    if (config.vehicleIntegration.updateRate <= 0 || config.vehicleIntegration.updateRate > config.updateFrequency) {
      warnings.push('Vehicle integration update rate should not exceed main update frequency');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculate energy efficiency for a given configuration
 */
export function calculateEnergyEfficiency(
  inputs: EnergyManagementInputs,
  sourceAllocations: Map<string, number>,
  storageAllocations: Map<string, number>,
  loadAllocations: Map<string, number>
): number {
  let totalInputPower = 0;
  let totalOutputPower = 0;
  let totalLosses = 0;

  // Calculate input power from sources
  for (const [sourceId, allocation] of sourceAllocations) {
    const source = inputs.sources.get(sourceId);
    if (source) {
      const inputPower = allocation;
      const efficiency = source.efficiency / 100;
      const outputPower = inputPower * efficiency;
      const losses = inputPower - outputPower;

      totalInputPower += inputPower;
      totalOutputPower += outputPower;
      totalLosses += losses;
    }
  }

  // Calculate storage losses
  for (const [storageId, allocation] of storageAllocations) {
    const storage = inputs.storage.get(storageId);
    if (storage) {
      let efficiency: number;
      if (allocation > 0) {
        // Charging
        efficiency = 0.95; // Assume 95% charging efficiency
      } else {
        // Discharging
        efficiency = 0.90; // Assume 90% discharging efficiency
      }

      const losses = Math.abs(allocation) * (1 - efficiency);
      totalLosses += losses;
    }
  }

  // Calculate overall efficiency
  const overallEfficiency = totalInputPower > 0 ? (totalInputPower - totalLosses) / totalInputPower : 0;
  return Math.max(0, Math.min(1, overallEfficiency)) * 100; // Return as percentage
}

/**
 * Optimize energy distribution using a simple algorithm
 */
export function optimizeEnergyDistribution(
  inputs: EnergyManagementInputs,
  objectives: {
    maximizeEfficiency: number; // weight 0-1
    minimizeCost: number; // weight 0-1
    maximizeReliability: number; // weight 0-1
  }
): {
  sourceAllocations: Map<string, number>;
  storageAllocations: Map<string, number>;
  loadAllocations: Map<string, number>;
  efficiency: number;
  cost: number;
  reliability: number;
} {
  const sourceAllocations = new Map<string, number>();
  const storageAllocations = new Map<string, number>();
  const loadAllocations = new Map<string, number>();

  // Simple priority-based allocation
  const totalLoadPower = Array.from(inputs.loads.values())
    .reduce((sum, load) => sum + load.power, 0);

  let remainingPower = totalLoadPower;

  // Allocate loads by priority
  const sortedLoads = Array.from(inputs.loads.entries())
    .sort(([, a], [, b]) => b.priority - a.priority);

  for (const [loadId, load] of sortedLoads) {
    const allocation = Math.min(load.power, remainingPower);
    loadAllocations.set(loadId, allocation);
    remainingPower -= allocation;
  }

  // Allocate sources by efficiency
  const sortedSources = Array.from(inputs.sources.entries())
    .sort(([, a], [, b]) => b.efficiency - a.efficiency);

  let requiredPower = totalLoadPower;
  for (const [sourceId, source] of sortedSources) {
    if (requiredPower <= 0) break;

    const allocation = Math.min(source.power, requiredPower);
    sourceAllocations.set(sourceId, allocation);
    requiredPower -= allocation;
  }

  // Allocate excess power to storage
  const totalSourcePower = Array.from(sourceAllocations.values())
    .reduce((sum, power) => sum + power, 0);
  const excessPower = totalSourcePower - totalLoadPower;

  if (excessPower > 0) {
    // Distribute excess power to storage
    const availableStorage = Array.from(inputs.storage.entries())
      .filter(([, storage]) => storage.soc < 90)
      .sort(([, a], [, b]) => a.soc - b.soc); // Charge lowest SOC first

    let remainingExcess = excessPower;
    for (const [storageId, storage] of availableStorage) {
      if (remainingExcess <= 0) break;

      const maxChargePower = storage.capacity * 0.2; // 0.2C charging rate
      const allocation = Math.min(maxChargePower, remainingExcess);
      storageAllocations.set(storageId, allocation);
      remainingExcess -= allocation;
    }
  } else if (excessPower < 0) {
    // Need to discharge storage
    const availableStorage = Array.from(inputs.storage.entries())
      .filter(([, storage]) => storage.soc > 20)
      .sort(([, a], [, b]) => b.soc - a.soc); // Discharge highest SOC first

    let requiredDischarge = Math.abs(excessPower);
    for (const [storageId, storage] of availableStorage) {
      if (requiredDischarge <= 0) break;

      const maxDischargePower = storage.capacity * 0.3; // 0.3C discharge rate
      const allocation = -Math.min(maxDischargePower, requiredDischarge);
      storageAllocations.set(storageId, allocation);
      requiredDischarge -= Math.abs(allocation);
    }
  }

  // Calculate metrics
  const efficiency = calculateEnergyEfficiency(inputs, sourceAllocations, storageAllocations, loadAllocations);
  const cost = calculateOperatingCost(inputs, sourceAllocations, storageAllocations, loadAllocations);
  const reliability = calculateSystemReliability(inputs, sourceAllocations, storageAllocations, loadAllocations);

  return {
    sourceAllocations,
    storageAllocations,
    loadAllocations,
    efficiency,
    cost,
    reliability
  };
}

/**
 * Predict energy demand based on historical data and current conditions
 */
export function predictEnergyDemand(
  inputs: EnergyManagementInputs,
  predictionHorizon: number // seconds
): {
  predictedLoads: Map<string, number[]>; // power values for each time step
  predictedSources: Map<string, number[]>; // power values for each time step
  confidence: number; // 0-1
  timeSteps: number[];
} {
  const timeSteps: number[] = [];
  const predictedLoads = new Map<string, number[]>();
  const predictedSources = new Map<string, number[]>();

  // Generate time steps (every 10 seconds)
  const stepSize = 10; // seconds
  const numSteps = Math.ceil(predictionHorizon / stepSize);

  for (let i = 0; i < numSteps; i++) {
    timeSteps.push(Date.now() + i * stepSize * 1000);
  }

  // Predict loads based on current values and trends
  for (const [loadId, load] of inputs.loads) {
    const predictions: number[] = [];
    
    for (let i = 0; i < numSteps; i++) {
      // Simple prediction: current value with some variation based on driving pattern
      let prediction = load.power;
      
      // Adjust based on driving mode
      if (inputs.vehicleState.drivingMode === 'eco') {
        prediction *= 0.8; // Reduce load in eco mode
      } else if (inputs.vehicleState.drivingMode === 'sport') {
        prediction *= 1.2; // Increase load in sport mode
      }
      
      // Add time-based variation
      const timeVariation = Math.sin(i * 0.1) * 0.1; // ±10% variation
      prediction *= (1 + timeVariation);
      
      // Add some randomness
      prediction *= (0.9 + Math.random() * 0.2); // ±10% random variation
      
      predictions.push(Math.max(0, prediction));
    }
    
    predictedLoads.set(loadId, predictions);
  }

  // Predict sources based on current values and environmental conditions
  for (const [sourceId, source] of inputs.sources) {
    const predictions: number[] = [];
    
    for (let i = 0; i < numSteps; i++) {
      let prediction = source.power;
      
      // Adjust based on road conditions (affects vibration-based harvesting)
      if (inputs.vehicleState.roadCondition === 'rough') {
        prediction *= 1.3;
      } else if (inputs.vehicleState.roadCondition === 'very_rough') {
        prediction *= 1.5;
      } else if (inputs.vehicleState.roadCondition === 'smooth') {
        prediction *= 0.7;
      }
      
      // Adjust based on speed (affects electromagnetic harvesting)
      const speedFactor = Math.min(inputs.vehicleState.speed / 60, 1.5); // Normalize to 60 km/h
      prediction *= speedFactor;
      
      // Add degradation over time
      const degradationFactor = Math.pow(0.999, i); // 0.1% degradation per step
      prediction *= degradationFactor;
      
      predictions.push(Math.max(0, prediction));
    }
    
    predictedSources.set(sourceId, predictions);
  }

  // Calculate confidence based on data quality and variability
  let confidence = 0.8; // Base confidence
  
  // Reduce confidence for high variability
  const loadVariability = calculateLoadVariability(inputs);
  confidence *= (1 - loadVariability * 0.3);
  
  // Reduce confidence for uncertain driving conditions
  if (inputs.vehicleState.roadCondition === 'very_rough') {
    confidence *= 0.8;
  }
  
  // Reduce confidence for longer prediction horizons
  const horizonFactor = Math.max(0.3, 1 - predictionHorizon / 3600); // Reduce over 1 hour
  confidence *= horizonFactor;

  return {
    predictedLoads,
    predictedSources,
    confidence: Math.max(0.1, Math.min(1, confidence)),
    timeSteps
  };
}

/**
 * Calculate load variability
 */
function calculateLoadVariability(inputs: EnergyManagementInputs): number {
  const flexibilities = Array.from(inputs.loads.values()).map(load => load.flexibility);
  const avgFlexibility = flexibilities.reduce((sum, flex) => sum + flex, 0) / flexibilities.length;
  return avgFlexibility / 100; // Convert to 0-1 scale
}

/**
 * Calculate operating cost
 */
function calculateOperatingCost(
  inputs: EnergyManagementInputs,
  sourceAllocations: Map<string, number>,
  storageAllocations: Map<string, number>,
  loadAllocations: Map<string, number>
): number {
  let totalCost = 0;

  // Source operating costs
  for (const [sourceId, allocation] of sourceAllocations) {
    const source = inputs.sources.get(sourceId);
    if (source) {
      // Assume cost based on power and efficiency
      const costPerKWh = 0.1; // $0.10 per kWh
      const energyLoss = allocation * (1 - source.efficiency / 100);
      const cost = (energyLoss / 1000) * costPerKWh; // Convert W to kW
      totalCost += cost;
    }
  }

  // Storage cycling costs
  for (const [storageId, allocation] of storageAllocations) {
    const storage = inputs.storage.get(storageId);
    if (storage && allocation !== 0) {
      // Assume cost based on cycling
      const costPerCycle = 0.01; // $0.01 per cycle
      const cycleDepth = Math.abs(allocation) / storage.capacity;
      const cost = cycleDepth * costPerCycle;
      totalCost += cost;
    }
  }

  return totalCost;
}

/**
 * Calculate system reliability
 */
function calculateSystemReliability(
  inputs: EnergyManagementInputs,
  sourceAllocations: Map<string, number>,
  storageAllocations: Map<string, number>,
  loadAllocations: Map<string, number>
): number {
  let totalReliability = 1.0;

  // Source reliability
  for (const [sourceId, allocation] of sourceAllocations) {
    const source = inputs.sources.get(sourceId);
    if (source && allocation > 0) {
      let sourceReliability = 0.95; // Base reliability
      
      // Reduce reliability for high temperature
      if (source.temperature > 60) {
        sourceReliability *= Math.max(0.7, 1 - (source.temperature - 60) * 0.01);
      }
      
      // Reduce reliability for low efficiency
      if (source.efficiency < 80) {
        sourceReliability *= Math.max(0.8, source.efficiency / 100);
      }
      
      // Reduce reliability for fault status
      if (source.status === 'fault') {
        sourceReliability = 0.1;
      } else if (source.status === 'standby') {
        sourceReliability *= 0.9;
      }
      
      totalReliability *= sourceReliability;
    }
  }

  // Storage reliability
  for (const [storageId, allocation] of storageAllocations) {
    const storage = inputs.storage.get(storageId);
    if (storage && allocation !== 0) {
      let storageReliability = storage.health / 100;
      
      // Reduce reliability for extreme SOC
      if (storage.soc < 10 || storage.soc > 95) {
        storageReliability *= 0.9;
      }
      
      // Reduce reliability for high temperature
      if (storage.temperature > 50) {
        storageReliability *= Math.max(0.6, 1 - (storage.temperature - 50) * 0.02);
      }
      
      totalReliability *= storageReliability;
    }
  }

  return Math.max(0, Math.min(1, totalReliability)) * 100; // Return as percentage
}