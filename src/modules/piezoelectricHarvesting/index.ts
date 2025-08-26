/**
 * Piezoelectric Energy Harvesting Module
 * 
 * This module exports all components for piezoelectric energy harvesting systems,
 * including modeling, optimization, numerical analysis, and integration capabilities.
 */

// Main harvester exports
export {
  PiezoelectricEnergyHarvester,
  type PiezoelectricMaterial,
  type HarvesterConfiguration,
  type EnvironmentalConditions,
  type HarvesterPerformance,
  type MultiSourceInputs,
  type OptimizationParameters
} from './PiezoelectricEnergyHarvester';

// Numerical analysis exports
export {
  NumericalAnalysis,
  type FEAParameters,
  type ModalAnalysisResult,
  type FrequencyResponse,
  type NonlinearParameters,
  type SensitivityAnalysis
} from './NumericalAnalysis';

// Integration system exports
export {
  PiezoelectricIntegration,
  type IntegratedSystemInputs,
  type IntegratedSystemOutputs,
  type EnergyManagementStrategy,
  type PredictiveMaintenanceData
} from './PiezoelectricIntegration';

/**
 * Factory function to create a complete piezoelectric energy harvesting system
 */
export function createPiezoelectricSystem(
  vehicleParams: any,
  safetyLimits?: any,
  optimizationParams?: OptimizationParameters
) {
  return new PiezoelectricIntegration(vehicleParams, safetyLimits, optimizationParams);
}

/**
 * Default piezoelectric materials for common applications
 */
export const defaultPiezoelectricMaterials = {
  PZT_5H: {
    name: 'PZT-5H',
    piezoelectricConstant: 593,
    dielectricConstant: 3400,
    elasticModulus: 60.6,
    density: 7500,
    couplingCoefficient: 0.75,
    qualityFactor: 65,
    curiTemperature: 193,
    maxStress: 110
  },
  PZT_4: {
    name: 'PZT-4',
    piezoelectricConstant: 289,
    dielectricConstant: 1300,
    elasticModulus: 81.3,
    density: 7500,
    couplingCoefficient: 0.70,
    qualityFactor: 500,
    curiTemperature: 328,
    maxStress: 140
  },
  PVDF: {
    name: 'PVDF',
    piezoelectricConstant: 33,
    dielectricConstant: 12,
    elasticModulus: 2.0,
    density: 1780,
    couplingCoefficient: 0.12,
    qualityFactor: 10,
    curiTemperature: 80,
    maxStress: 50
  },
  PMN_PT: {
    name: 'PMN-PT',
    piezoelectricConstant: 1500,
    dielectricConstant: 5000,
    elasticModulus: 90,
    density: 8100,
    couplingCoefficient: 0.92,
    qualityFactor: 100,
    curiTemperature: 130,
    maxStress: 25
  }
};

/**
 * Default harvester configurations for different applications
 */
export const defaultHarvesterConfigurations = {
  roadVibration: {
    type: 'cantilever' as const,
    dimensions: { length: 50, width: 20, thickness: 0.5 },
    resonantFrequency: 25,
    dampingRatio: 0.02,
    loadResistance: 100000,
    capacitance: 47
  },
  suspensionMovement: {
    type: 'stack' as const,
    dimensions: { length: 30, width: 30, thickness: 10 },
    resonantFrequency: 2,
    dampingRatio: 0.05,
    loadResistance: 50000,
    capacitance: 220
  },
  tireDeformation: {
    type: 'cymbal' as const,
    dimensions: { length: 25, width: 25, thickness: 2 },
    resonantFrequency: 100,
    dampingRatio: 0.03,
    loadResistance: 75000,
    capacitance: 100
  }
};

/**
 * Default optimization parameters for different objectives
 */
export const defaultOptimizationParameters = {
  powerMaximization: {
    targetPowerOutput: 1000,
    maxWeight: 50,
    maxVolume: 10000,
    minReliability: 0.85,
    operatingTemperatureRange: { min: -20, max: 80 },
    costConstraint: 15000
  },
  efficiencyOptimization: {
    targetPowerOutput: 500,
    maxWeight: 30,
    maxVolume: 5000,
    minReliability: 0.95,
    operatingTemperatureRange: { min: -10, max: 60 },
    costConstraint: 8000
  },
  reliabilityFocus: {
    targetPowerOutput: 300,
    maxWeight: 20,
    maxVolume: 3000,
    minReliability: 0.98,
    operatingTemperatureRange: { min: 0, max: 50 },
    costConstraint: 5000
  }
};

/**
 * Utility functions for piezoelectric system analysis
 */
export const piezoelectricUtils = {
  /**
   * Calculate theoretical maximum power for a piezoelectric harvester
   */
  calculateTheoreticalMaxPower(
    material: PiezoelectricMaterial,
    dimensions: { length: number; width: number; thickness: number },
    stress: number,
    frequency: number
  ): number {
    const volume = (dimensions.length * dimensions.width * dimensions.thickness) / 1000; // cm³
    const force = stress * (dimensions.width * dimensions.length) / 1000; // N
    const displacement = force / (material.elasticModulus * 1e9); // m
    const velocity = 2 * Math.PI * frequency * displacement; // m/s
    const mechanicalPower = force * velocity; // W
    const electricalPower = mechanicalPower * Math.pow(material.couplingCoefficient, 2);
    
    return electricalPower;
  },

  /**
   * Calculate resonant frequency for a cantilever beam
   */
  calculateCantileverResonantFrequency(
    material: PiezoelectricMaterial,
    dimensions: { length: number; width: number; thickness: number }
  ): number {
    const length = dimensions.length / 1000; // Convert to meters
    const thickness = dimensions.thickness / 1000;
    const elasticModulus = material.elasticModulus * 1e9; // Convert to Pa
    const density = material.density; // kg/m³
    
    // First mode resonant frequency for cantilever beam
    const lambda1 = 1.875; // First mode eigenvalue
    const frequency = (Math.pow(lambda1, 2) / (2 * Math.PI)) * 
                     Math.sqrt((elasticModulus * Math.pow(thickness, 2)) / 
                              (12 * density * Math.pow(length, 4)));
    
    return frequency;
  },

  /**
   * Calculate optimal load resistance for maximum power transfer
   */
  calculateOptimalLoadResistance(
    capacitance: number, // nF
    frequency: number    // Hz
  ): number {
    const capacitanceF = capacitance * 1e-9; // Convert to Farads
    const omega = 2 * Math.PI * frequency;
    const reactance = 1 / (omega * capacitanceF);
    
    return reactance; // Optimal load resistance equals capacitive reactance
  },

  /**
   * Estimate harvester lifespan based on operating conditions
   */
  estimateLifespan(
    material: PiezoelectricMaterial,
    operatingStress: number,    // MPa
    operatingTemperature: number, // °C
    cyclesPerDay: number
  ): number {
    const stressRatio = operatingStress / material.maxStress;
    const temperatureRatio = operatingTemperature / material.curiTemperature;
    
    // Base lifespan in years
    let baseLifespan = 10;
    
    // Stress factor (exponential degradation)
    const stressFactor = Math.exp(-5 * stressRatio);
    
    // Temperature factor (linear degradation)
    const temperatureFactor = Math.max(0.1, 1 - temperatureRatio);
    
    // Fatigue factor based on cycles
    const fatigueExponent = -0.1; // Typical fatigue exponent for ceramics
    const fatigueFactor = Math.pow(cyclesPerDay * 365, fatigueExponent);
    
    return baseLifespan * stressFactor * temperatureFactor * fatigueFactor;
  }
};

/**
 * Validation utilities for piezoelectric system parameters
 */
export const validationUtils = {
  /**
   * Validate piezoelectric material properties
   */
  validateMaterial(material: PiezoelectricMaterial): boolean {
    return (
      material.piezoelectricConstant > 0 &&
      material.dielectricConstant > 1 &&
      material.elasticModulus > 0 &&
      material.density > 0 &&
      material.couplingCoefficient > 0 && material.couplingCoefficient <= 1 &&
      material.qualityFactor > 0 &&
      material.curiTemperature > -273 &&
      material.maxStress > 0
    );
  },

  /**
   * Validate harvester configuration
   */
  validateConfiguration(config: HarvesterConfiguration): boolean {
    return (
      config.dimensions.length > 0 &&
      config.dimensions.width > 0 &&
      config.dimensions.thickness > 0 &&
      config.resonantFrequency > 0 &&
      config.dampingRatio > 0 && config.dampingRatio < 1 &&
      config.loadResistance > 0 &&
      config.capacitance > 0
    );
  },

  /**
   * Validate environmental conditions
   */
  validateEnvironmentalConditions(conditions: EnvironmentalConditions): boolean {
    return (
      conditions.temperature > -273 &&
      conditions.humidity >= 0 && conditions.humidity <= 100 &&
      conditions.vibrationFrequency > 0 &&
      conditions.accelerationAmplitude >= 0 &&
      conditions.stressAmplitude >= 0 &&
      conditions.vehicleSpeed >= 0
    );
  }
};