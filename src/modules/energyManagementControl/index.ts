/**
 * Energy Management Control System
 * 
 * Comprehensive control algorithms for managing energy distribution and storage
 * from the suspension system. Optimizes energy usage and integrates seamlessly
 * with existing vehicle energy management systems.
 */

export { EnergyManagementController } from './EnergyManagementController';
export { EnergyDistributionManager } from './EnergyDistributionManager';
export { VehicleEnergyIntegration } from './VehicleEnergyIntegration';
export { AdaptiveControlStrategy } from './AdaptiveControlStrategy';
export { EnergyOptimizationEngine } from './EnergyOptimizationEngine';
export { RealTimeEnergyController } from './RealTimeEnergyController';

export type {
  EnergyManagementConfig,
  EnergyDistributionConfig,
  VehicleIntegrationConfig,
  ControlStrategyConfig,
  OptimizationConfig,
  EnergyManagementInputs,
  EnergyManagementOutputs,
  EnergyFlowControl,
  SystemIntegrationStatus,
  ControlPerformanceMetrics,
  EnergyManagementState,
  DistributionStrategy,
  OptimizationObjective,
  ControllerDiagnostics
} from './types';

export {
  createEnergyManagementSystem,
  createDistributionManager,
  createVehicleIntegration,
  createAdaptiveStrategy,
  createOptimizationEngine,
  validateEnergyManagementConfig,
  calculateEnergyEfficiency,
  optimizeEnergyDistribution,
  predictEnergyDemand
} from './utils';