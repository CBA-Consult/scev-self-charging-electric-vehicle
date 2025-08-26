/**
 * Optimal Energy Algorithms Module
 * 
 * This module provides advanced algorithms for optimal energy conversion and storage.
 * It includes machine learning-based optimization, multi-objective optimization,
 * and real-time adaptive algorithms for maximum efficiency.
 */

export { OptimalEnergyConverter } from './OptimalEnergyConverter';
export { OptimalStorageManager } from './OptimalStorageManager';
export { MultiObjectiveOptimizer } from './MultiObjectiveOptimizer';
export { AdaptiveEnergyController } from './AdaptiveEnergyController';
export { EnergyFlowOptimizer } from './EnergyFlowOptimizer';
export { PredictiveEnergyManager } from './PredictiveEnergyManager';

// Type exports
export type {
  EnergyConversionParameters,
  StorageOptimizationParameters,
  OptimizationObjectives,
  EnergyFlowConfiguration,
  PredictiveModelParameters,
  OptimizationResult,
  PerformanceMetrics
} from './types';

// Utility exports
export {
  calculateConversionEfficiency,
  optimizeEnergyFlow,
  predictEnergyDemand,
  validateOptimizationParameters
} from './utils';

// Algorithm exports
export {
  geneticAlgorithmOptimization,
  particleSwarmOptimization,
  simulatedAnnealingOptimization,
  reinforcementLearningOptimization,
  neuralNetworkOptimization
} from './algorithms';