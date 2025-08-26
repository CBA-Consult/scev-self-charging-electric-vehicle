/**
 * Wind Energy Storage Solutions Module
 * 
 * This module provides comprehensive modeling, analysis, and optimization
 * capabilities for wind energy storage systems. It includes implementations
 * of various storage technologies and hybrid system architectures.
 */

export { WindEnergyStorageSystem } from './WindEnergyStorageSystem';
export { HybridStorageController } from './HybridStorageController';
export { GravityStorageSystem } from './GravityStorageSystem';
export { AdvancedCAESSystem } from './AdvancedCAESSystem';
export { FlywheelArrayController } from './FlywheelArrayController';
export { ThermalEnergyStorage } from './ThermalEnergyStorage';
export { StorageOptimizer } from './StorageOptimizer';

// Type exports
export type {
  WindStorageInputs,
  StorageSystemOutputs,
  HybridConfiguration,
  StoragePerformanceMetrics,
  OptimizationParameters,
  GridIntegrationSpecs
} from './types';

// Utility exports
export { 
  calculateStorageCapacity,
  optimizeStorageMix,
  assessGridStability,
  evaluateEconomics
} from './utils';