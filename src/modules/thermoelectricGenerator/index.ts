/**
 * Thermoelectric Generator (TEG) Module for EV Braking Systems
 * 
 * This module implements thermoelectric generators that capture waste heat
 * from braking systems and convert it to electrical energy, integrating
 * with regenerative braking systems for enhanced energy recovery.
 * 
 * @author TEG Development Team
 * @version 1.0.0
 */

export * from './ThermoelectricGenerator';
export * from './TEGBrakingIntegration';
export * from './ThermalManagement';
export * from './types';

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