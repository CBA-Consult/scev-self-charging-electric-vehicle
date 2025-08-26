/**
 * Utility functions for optimal energy algorithms
 */

import {
  EnergyConversionParameters,
  StorageOptimizationParameters,
  EnergyFlowConfiguration,
  OptimizationConstraints,
  PerformanceMetrics
} from './types';

/**
 * Calculate conversion efficiency with multiple factors
 */
export function calculateConversionEfficiency(
  parameters: EnergyConversionParameters,
  environmentalFactors?: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
  }
): number {
  const baseEfficiency = parameters.efficiency;
  
  // Temperature derating
  const tempFactor = environmentalFactors?.temperature 
    ? calculateTemperatureDerating(environmentalFactors.temperature, parameters.sourceType)
    : 1.0;
  
  // Power factor correction
  const powerFactorCorrection = Math.pow(parameters.powerFactor, 0.5);
  
  // Harmonic distortion penalty
  const harmonicPenalty = Math.max(0.8, 1 - parameters.harmonicDistortion * 0.01);
  
  // Load matching efficiency
  const loadMatching = calculateLoadMatchingEfficiency(parameters);
  
  return baseEfficiency * tempFactor * powerFactorCorrection * harmonicPenalty * loadMatching;
}

/**
 * Calculate temperature derating factor
 */
function calculateTemperatureDerating(
  temperature: number,
  sourceType: string
): number {
  const optimalRanges: Record<string, [number, number]> = {
    electromagnetic: [15, 45],
    piezoelectric: [10, 40],
    thermal: [20, 60],
    mechanical: [0, 50],
    solar: [15, 35],
    wind: [-20, 40],
    hydro: [0, 30]
  };
  
  const [minTemp, maxTemp] = optimalRanges[sourceType] || [15, 35];
  
  if (temperature >= minTemp && temperature <= maxTemp) {
    return 1.0;
  } else if (temperature < minTemp) {
    return Math.max(0.6, 1.0 - (minTemp - temperature) * 0.02);
  } else {
    return Math.max(0.6, 1.0 - (temperature - maxTemp) * 0.015);
  }
}

/**
 * Calculate load matching efficiency
 */
function calculateLoadMatchingEfficiency(parameters: EnergyConversionParameters): number {
  const sourceResistance = parameters.inputVoltage / parameters.inputCurrent;
  const loadRatio = parameters.loadResistance / sourceResistance;
  
  // Maximum power transfer theorem
  return (4 * loadRatio) / Math.pow(1 + loadRatio, 2);
}

/**
 * Optimize energy flow across multiple sources and storage
 */
export function optimizeEnergyFlow(
  configuration: EnergyFlowConfiguration,
  objectives: {
    maximizeEfficiency: number;
    minimizeCost: number;
    maximizeReliability: number;
  }
): {
  optimalFlow: Map<string, number>;
  totalEfficiency: number;
  totalCost: number;
  reliabilityScore: number;
} {
  const optimalFlow = new Map<string, number>();
  
  // Sort sources by efficiency and cost
  const sortedSources = configuration.sources.sort((a, b) => {
    const efficiencyWeight = objectives.maximizeEfficiency;
    const costWeight = objectives.minimizeCost;
    const reliabilityWeight = objectives.maximizeReliability;
    
    const scoreA = (a.efficiency * efficiencyWeight) - 
                   (a.cost * costWeight) + 
                   (a.availability * reliabilityWeight);
    const scoreB = (b.efficiency * efficiencyWeight) - 
                   (b.cost * costWeight) + 
                   (b.availability * reliabilityWeight);
    
    return scoreB - scoreA;
  });
  
  // Calculate total load demand
  const totalDemand = configuration.loads.reduce((sum, load) => sum + load.power, 0);
  
  // Allocate power from sources
  let remainingDemand = totalDemand;
  let totalEfficiency = 0;
  let totalCost = 0;
  let reliabilityScore = 1;
  
  for (const source of sortedSources) {
    if (remainingDemand <= 0) break;
    
    const allocatedPower = Math.min(source.currentPower, remainingDemand);
    optimalFlow.set(source.id, allocatedPower);
    
    totalEfficiency += allocatedPower * source.efficiency;
    totalCost += allocatedPower * source.cost / 1000; // Convert to kWh
    reliabilityScore *= source.availability;
    
    remainingDemand -= allocatedPower;
  }
  
  // Use storage if demand not met
  if (remainingDemand > 0) {
    const availableStorage = configuration.storage.filter(s => s.currentSOC > 0.1);
    const sortedStorage = availableStorage.sort((a, b) => b.efficiency - a.efficiency);
    
    for (const storage of sortedStorage) {
      if (remainingDemand <= 0) break;
      
      const maxDischarge = Math.min(
        storage.maxDischargePower,
        storage.capacity * storage.currentSOC * 0.8 // Don't fully discharge
      );
      const allocatedPower = Math.min(maxDischarge, remainingDemand);
      
      optimalFlow.set(storage.id, allocatedPower);
      totalEfficiency += allocatedPower * storage.efficiency;
      
      remainingDemand -= allocatedPower;
    }
  }
  
  // Normalize efficiency
  totalEfficiency = totalDemand > 0 ? totalEfficiency / totalDemand : 0;
  
  return {
    optimalFlow,
    totalEfficiency,
    totalCost,
    reliabilityScore
  };
}

/**
 * Predict energy demand using simple forecasting
 */
export function predictEnergyDemand(
  historicalData: Array<{
    timestamp: number;
    demand: number;
    temperature: number;
    dayOfWeek: number;
    hour: number;
  }>,
  forecastHorizon: number // hours
): Array<{
  timestamp: number;
  predictedDemand: number;
  confidence: number;
}> {
  const predictions: Array<{
    timestamp: number;
    predictedDemand: number;
    confidence: number;
  }> = [];
  
  if (historicalData.length < 24) {
    // Not enough data for meaningful prediction
    return predictions;
  }
  
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  
  for (let h = 1; h <= forecastHorizon; h++) {
    const forecastTime = now + (h * hourMs);
    const forecastDate = new Date(forecastTime);
    const hour = forecastDate.getHours();
    const dayOfWeek = forecastDate.getDay();
    
    // Simple pattern-based prediction
    const similarPeriods = historicalData.filter(d => {
      const dataDate = new Date(d.timestamp);
      return dataDate.getHours() === hour && dataDate.getDay() === dayOfWeek;
    });
    
    if (similarPeriods.length > 0) {
      const avgDemand = similarPeriods.reduce((sum, d) => sum + d.demand, 0) / similarPeriods.length;
      const variance = similarPeriods.reduce((sum, d) => sum + Math.pow(d.demand - avgDemand, 2), 0) / similarPeriods.length;
      const confidence = Math.max(0.5, 1 - (Math.sqrt(variance) / avgDemand));
      
      predictions.push({
        timestamp: forecastTime,
        predictedDemand: avgDemand,
        confidence
      });
    } else {
      // Fallback to overall average
      const overallAvg = historicalData.reduce((sum, d) => sum + d.demand, 0) / historicalData.length;
      predictions.push({
        timestamp: forecastTime,
        predictedDemand: overallAvg,
        confidence: 0.3
      });
    }
  }
  
  return predictions;
}

/**
 * Validate optimization parameters
 */
export function validateOptimizationParameters(
  conversionParams?: Partial<EnergyConversionParameters>,
  storageParams?: Partial<StorageOptimizationParameters>,
  constraints?: OptimizationConstraints
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate conversion parameters
  if (conversionParams) {
    if (conversionParams.efficiency !== undefined) {
      if (conversionParams.efficiency < 0 || conversionParams.efficiency > 1) {
        errors.push('Conversion efficiency must be between 0 and 1');
      } else if (conversionParams.efficiency < 0.5) {
        warnings.push('Conversion efficiency is very low (<50%)');
      }
    }
    
    if (conversionParams.powerFactor !== undefined) {
      if (conversionParams.powerFactor < 0 || conversionParams.powerFactor > 1) {
        errors.push('Power factor must be between 0 and 1');
      } else if (conversionParams.powerFactor < 0.8) {
        warnings.push('Power factor is low (<0.8)');
      }
    }
    
    if (conversionParams.harmonicDistortion !== undefined) {
      if (conversionParams.harmonicDistortion < 0) {
        errors.push('Harmonic distortion cannot be negative');
      } else if (conversionParams.harmonicDistortion > 10) {
        warnings.push('Harmonic distortion is high (>10%)');
      }
    }
    
    if (conversionParams.temperature !== undefined) {
      if (conversionParams.temperature < -50 || conversionParams.temperature > 150) {
        errors.push('Temperature is outside reasonable operating range');
      }
    }
  }
  
  // Validate storage parameters
  if (storageParams) {
    if (storageParams.currentSOC !== undefined) {
      if (storageParams.currentSOC < 0 || storageParams.currentSOC > 1) {
        errors.push('State of charge must be between 0 and 1');
      } else if (storageParams.currentSOC < 0.1) {
        warnings.push('State of charge is very low (<10%)');
      } else if (storageParams.currentSOC > 0.95) {
        warnings.push('State of charge is very high (>95%)');
      }
    }
    
    if (storageParams.chargingEfficiency !== undefined) {
      if (storageParams.chargingEfficiency < 0 || storageParams.chargingEfficiency > 1) {
        errors.push('Charging efficiency must be between 0 and 1');
      } else if (storageParams.chargingEfficiency < 0.7) {
        warnings.push('Charging efficiency is low (<70%)');
      }
    }
    
    if (storageParams.dischargingEfficiency !== undefined) {
      if (storageParams.dischargingEfficiency < 0 || storageParams.dischargingEfficiency > 1) {
        errors.push('Discharging efficiency must be between 0 and 1');
      } else if (storageParams.dischargingEfficiency < 0.7) {
        warnings.push('Discharging efficiency is low (<70%)');
      }
    }
    
    if (storageParams.selfDischargeRate !== undefined) {
      if (storageParams.selfDischargeRate < 0) {
        errors.push('Self-discharge rate cannot be negative');
      } else if (storageParams.selfDischargeRate > 0.1) {
        warnings.push('Self-discharge rate is high (>10%/hour)');
      }
    }
    
    if (storageParams.cycleLife !== undefined && storageParams.currentCycles !== undefined) {
      if (storageParams.currentCycles > storageParams.cycleLife) {
        warnings.push('Storage has exceeded rated cycle life');
      } else if (storageParams.currentCycles > storageParams.cycleLife * 0.8) {
        warnings.push('Storage is approaching end of cycle life');
      }
    }
  }
  
  // Validate against constraints
  if (constraints) {
    if (conversionParams?.efficiency !== undefined && constraints.efficiency) {
      if (conversionParams.efficiency < constraints.efficiency.minimum) {
        errors.push(`Efficiency ${conversionParams.efficiency} below minimum ${constraints.efficiency.minimum}`);
      }
      if (conversionParams.efficiency > constraints.efficiency.maximum) {
        errors.push(`Efficiency ${conversionParams.efficiency} above maximum ${constraints.efficiency.maximum}`);
      }
    }
    
    if (conversionParams?.inputPower !== undefined && constraints.power) {
      if (conversionParams.inputPower < constraints.power.minimum) {
        errors.push(`Power ${conversionParams.inputPower}W below minimum ${constraints.power.minimum}W`);
      }
      if (conversionParams.inputPower > constraints.power.maximum) {
        errors.push(`Power ${conversionParams.inputPower}W above maximum ${constraints.power.maximum}W`);
      }
    }
    
    if (conversionParams?.temperature !== undefined && constraints.temperature) {
      if (conversionParams.temperature < constraints.temperature.minimum) {
        errors.push(`Temperature ${conversionParams.temperature}°C below minimum ${constraints.temperature.minimum}°C`);
      }
      if (conversionParams.temperature > constraints.temperature.maximum) {
        errors.push(`Temperature ${conversionParams.temperature}°C above maximum ${constraints.temperature.maximum}°C`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculate performance improvement between two metrics
 */
export function calculatePerformanceImprovement(
  baseline: PerformanceMetrics,
  optimized: PerformanceMetrics
): PerformanceMetrics {
  return {
    efficiency: {
      current: optimized.efficiency.current,
      optimal: optimized.efficiency.optimal,
      improvement: optimized.efficiency.current - baseline.efficiency.current,
      trend: optimized.efficiency.current > baseline.efficiency.current ? 'increasing' : 
             optimized.efficiency.current < baseline.efficiency.current ? 'decreasing' : 'stable'
    },
    powerOutput: {
      current: optimized.powerOutput.current,
      optimal: optimized.powerOutput.optimal,
      improvement: optimized.powerOutput.current - baseline.powerOutput.current,
      trend: optimized.powerOutput.current > baseline.powerOutput.current ? 'increasing' : 
             optimized.powerOutput.current < baseline.powerOutput.current ? 'decreasing' : 'stable'
    },
    energyLoss: {
      current: optimized.energyLoss.current,
      optimal: optimized.energyLoss.optimal,
      reduction: baseline.energyLoss.current - optimized.energyLoss.current,
      trend: optimized.energyLoss.current < baseline.energyLoss.current ? 'decreasing' : 
             optimized.energyLoss.current > baseline.energyLoss.current ? 'increasing' : 'stable'
    },
    cost: {
      current: optimized.cost.current,
      optimal: optimized.cost.optimal,
      savings: baseline.cost.current - optimized.cost.current,
      trend: optimized.cost.current < baseline.cost.current ? 'decreasing' : 
             optimized.cost.current > baseline.cost.current ? 'increasing' : 'stable'
    },
    reliability: {
      current: optimized.reliability.current,
      optimal: optimized.reliability.optimal,
      improvement: optimized.reliability.current - baseline.reliability.current,
      trend: optimized.reliability.current > baseline.reliability.current ? 'increasing' : 
             optimized.reliability.current < baseline.reliability.current ? 'decreasing' : 'stable'
    },
    emissions: {
      current: optimized.emissions.current,
      optimal: optimized.emissions.optimal,
      reduction: baseline.emissions.current - optimized.emissions.current,
      trend: optimized.emissions.current < baseline.emissions.current ? 'decreasing' : 
             optimized.emissions.current > baseline.emissions.current ? 'increasing' : 'stable'
    }
  };
}

/**
 * Calculate energy storage round-trip efficiency
 */
export function calculateStorageRoundTripEfficiency(
  chargingEfficiency: number,
  dischargingEfficiency: number,
  selfDischargeRate: number,
  storageDuration: number // hours
): number {
  const selfDischargeLoss = Math.pow(1 - selfDischargeRate, storageDuration);
  return chargingEfficiency * dischargingEfficiency * selfDischargeLoss;
}

/**
 * Calculate optimal storage sizing
 */
export function calculateOptimalStorageSize(
  powerProfile: number[], // hourly power data
  maxPower: number,
  targetAutonomy: number, // hours
  efficiency: number
): {
  optimalCapacity: number; // Wh
  optimalPower: number;    // W
  utilizationFactor: number;
  costEffectiveness: number;
} {
  // Calculate energy requirements
  const maxEnergy = Math.max(...powerProfile) * targetAutonomy;
  const avgEnergy = (powerProfile.reduce((sum, p) => sum + p, 0) / powerProfile.length) * targetAutonomy;
  
  // Account for efficiency losses
  const optimalCapacity = maxEnergy / efficiency;
  const optimalPower = Math.max(...powerProfile);
  
  // Calculate utilization factor
  const utilizationFactor = avgEnergy / maxEnergy;
  
  // Simple cost-effectiveness metric (higher is better)
  const costEffectiveness = utilizationFactor * efficiency;
  
  return {
    optimalCapacity,
    optimalPower,
    utilizationFactor,
    costEffectiveness
  };
}

/**
 * Calculate system reliability
 */
export function calculateSystemReliability(
  componentReliabilities: number[],
  redundancyConfiguration: 'series' | 'parallel' | 'mixed'
): number {
  switch (redundancyConfiguration) {
    case 'series':
      // All components must work
      return componentReliabilities.reduce((product, r) => product * r, 1);
    
    case 'parallel':
      // At least one component must work
      const failureProbability = componentReliabilities.reduce((product, r) => product * (1 - r), 1);
      return 1 - failureProbability;
    
    case 'mixed':
      // Complex calculation for mixed configurations
      // Simplified: assume half series, half parallel
      const seriesReliability = Math.pow(componentReliabilities.reduce((sum, r) => sum + r, 0) / componentReliabilities.length, componentReliabilities.length / 2);
      const parallelReliability = 1 - Math.pow(1 - (componentReliabilities.reduce((sum, r) => sum + r, 0) / componentReliabilities.length), componentReliabilities.length / 2);
      return seriesReliability * parallelReliability;
    
    default:
      return componentReliabilities.reduce((sum, r) => sum + r, 0) / componentReliabilities.length;
  }
}