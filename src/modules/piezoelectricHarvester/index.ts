/**
 * Piezoelectric Harvester Module for Energy Harvesting
 * 
 * This module exports the main components for designing and optimizing
 * piezoelectric harvester structures for mechanical vibration energy conversion.
 */

// Main controller exports
export { 
  PiezoelectricHarvesterController,
  type HarvesterInputs,
  type HarvesterOutputs,
  type VibrationData,
  type ElectricalOutput
} from './PiezoelectricHarvesterController';

// Structural optimizer exports
export {
  StructuralOptimizer,
  type StructuralDesign,
  type OptimizationParameters,
  type DesignConstraints,
  type OptimizationResult
} from './StructuralOptimizer';

// Material properties exports
export {
  MaterialProperties,
  type PiezoelectricMaterial,
  type MaterialConstants,
  type TemperatureCoefficients
} from './MaterialProperties';

// Flexural analysis exports
export {
  FlexuralAnalysis,
  type FlexuralProperties,
  type DeformationAnalysis,
  type StressDistribution,
  type ReliabilityMetrics
} from './FlexuralAnalysis';

/**
 * Factory function to create a complete piezoelectric harvester system
 */
export function createPiezoelectricHarvester(
  materialType: string, 
  structuralDesign: StructuralDesign,
  constraints?: Partial<DesignConstraints>
) {
  return new PiezoelectricHarvesterController(materialType, structuralDesign, constraints);
}

/**
 * Default structural design parameters for cantilever beam configuration
 */
export const defaultCantileverDesign: StructuralDesign = {
  type: 'cantilever',
  dimensions: {
    length: 0.05,        // m - 50mm length
    width: 0.01,         // m - 10mm width  
    thickness: 0.0005,   // m - 0.5mm thickness
  },
  layerConfiguration: {
    piezoelectricLayers: 2,
    substrateThickness: 0.0002,  // m - 0.2mm substrate
    electrodeThickness: 0.00001, // m - 10μm electrodes
  },
  mountingConfiguration: {
    fixedEnd: 'base',
    freeEnd: 'tip',
    proofMass: 0.001,    // kg - 1g proof mass
  },
  resonantFrequency: 50, // Hz - target resonant frequency
};

/**
 * Default optimization parameters
 */
export const defaultOptimizationParams: OptimizationParameters = {
  objectives: {
    maximizePowerOutput: 1.0,
    maximizeEfficiency: 0.8,
    minimizeStress: 0.6,
    maximizeReliability: 0.9,
  },
  algorithm: 'genetic',
  populationSize: 100,
  generations: 50,
  mutationRate: 0.1,
  crossoverRate: 0.8,
  convergenceTolerance: 1e-6,
};

/**
 * Default design constraints
 */
export const defaultDesignConstraints: DesignConstraints = {
  maxStress: 50e6,           // Pa - 50 MPa maximum stress
  maxDeflection: 0.005,      // m - 5mm maximum deflection
  minResonantFreq: 10,       // Hz - minimum resonant frequency
  maxResonantFreq: 1000,     // Hz - maximum resonant frequency
  maxDimensions: {
    length: 0.2,             // m - 200mm maximum length
    width: 0.05,             // m - 50mm maximum width
    thickness: 0.005,        // m - 5mm maximum thickness
  },
  minEfficiency: 0.1,        // 10% minimum energy conversion efficiency
  operatingTemperatureRange: {
    min: -40,                // °C
    max: 85,                 // °C
  },
  fatigueLifeCycles: 1e8,    // 100 million cycles minimum
};

/**
 * Utility function to validate structural design parameters
 */
export function validateStructuralDesign(design: StructuralDesign): boolean {
  return (
    design.dimensions.length > 0 &&
    design.dimensions.width > 0 &&
    design.dimensions.thickness > 0 &&
    design.layerConfiguration.piezoelectricLayers > 0 &&
    design.layerConfiguration.substrateThickness > 0 &&
    design.layerConfiguration.electrodeThickness > 0 &&
    design.mountingConfiguration.proofMass >= 0 &&
    design.resonantFrequency > 0
  );
}

/**
 * Utility function to create test vibration inputs
 */
export function createTestVibrationInputs(overrides?: Partial<VibrationData>): VibrationData {
  return {
    acceleration: {
      x: 2.0,                // m/s² - lateral acceleration
      y: 1.5,                // m/s² - longitudinal acceleration  
      z: 9.81,               // m/s² - vertical acceleration (gravity + road)
    },
    frequency: {
      dominant: 25,          // Hz - dominant frequency
      harmonics: [50, 75, 100], // Hz - harmonic frequencies
    },
    amplitude: 0.001,        // m - 1mm vibration amplitude
    duration: 1.0,           // s - measurement duration
    samplingRate: 1000,      // Hz - data sampling rate
    temperatureAmbient: 25,  // °C - ambient temperature
    humidity: 50,            // % - relative humidity
    ...overrides
  };
}