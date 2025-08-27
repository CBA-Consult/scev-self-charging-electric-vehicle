/**
 * Thermoelectric Generator (TEG) Module for SCEV
 * 
 * This module implements comprehensive thermoelectric generator functionality
 * for waste heat recovery in electric vehicles, supporting environmental
 * impact optimization and performance monitoring.
 */

export { ThermoelectricGenerator } from './ThermoelectricGenerator';
export { TEGIntegration } from './TEGIntegration';
export { TEGEnvironmentalMonitor } from './TEGEnvironmentalMonitor';
export { TEGThermalManager } from './TEGThermalManager';
export { 
  MaterialEvaluator,
  createAutomotiveMaterialEvaluator,
  createHighPerformanceMaterialEvaluator,
  createCostOptimizedMaterialEvaluator
} from './MaterialEvaluator';

export * from './types';

// Additional exports for braking integration and thermal management
export * from './TEGBrakingIntegration';
export * from './ThermalManagement';

// Re-export commonly used types and interfaces
export type {
  ThermoelectricMaterial,
  TEGConfiguration,
  ThermalConditions,
  TEGPerformance,
  BrakingThermalInputs,
  IntegratedBrakingOutputs,
  ThermalManagementConfig
} from './types';

// Factory functions for creating TEG systems
export { createTEGSystem } from './ThermoelectricGenerator';
export { createIntegratedBrakingSystem } from './TEGBrakingIntegration';
export { createThermalManager } from './ThermalManagement';

// Default configurations
export { 
  defaultTEGMaterials,
  defaultTEGConfigurations,
  defaultThermalManagementConfig 
} from './types';

// Utility functions
export {
  calculateSeebeckCoefficient,
  calculateThermalConductivity,
  calculateElectricalResistivity,
  calculateZTValue,
  validateTEGConfiguration,
  optimizeTEGPlacement,
  calculateThermalTimeConstant,
  estimateTEGCost,
  calculateOptimalLoadResistance,
  validateThermalConditions
} from './utils';
