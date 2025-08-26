/**
 * Fuzzy Control Module for Regenerative Braking and Piezoelectric Energy Harvesting
 * 
 * This module exports the main components of the fuzzy control strategy
 * for regenerative braking in electric vehicles with in-wheel motors,
 * and comprehensive piezoelectric energy harvesting optimization.
 */

// Main controller exports
export { 
  FuzzyRegenerativeBrakingController,
  type BrakingInputs,
  type BrakingOutputs,
  type FuzzySet,
  type FuzzyRule
} from './FuzzyRegenerativeBrakingController';

// Torque model exports
export {
  RegenerativeBrakingTorqueModel,
  type VehicleParameters,
  type BrakingDemand,
  type TorqueDistribution,
  type MotorConstraints
} from './RegenerativeBrakingTorqueModel';

// Integration system exports
export {
  FuzzyControlIntegration,
  type SystemInputs,
  type SystemOutputs,
  type SafetyLimits
} from './FuzzyControlIntegration';

// Piezoelectric Materials exports
export {
  ClassicalPiezoelectricMaterial,
  NonClassicalPiezoelectricMaterial,
  PiezoelectricMaterialFactory,
  type MaterialProperties,
  type NonClassicalProperties
} from './PiezoelectricMaterials';

// Structural Modeling exports
export {
  PiezoelectricBeamModel,
  PiezoelectricPlateModel,
  MultiPhysicsStructuralModel,
  type GeometryParameters,
  type LoadConditions,
  type StructuralResponse,
  type ModalProperties
} from './StructuralModeling';

// Optimization Algorithms exports
export {
  GeneticAlgorithmOptimizer,
  ParticleSwarmOptimizer,
  GradientBasedOptimizer,
  type OptimizationParameters,
  type OptimizationObjectives,
  type OptimizationResult
} from './OptimizationAlgorithms';

// Vibration Energy Harvesting exports
export {
  PiezoelectricEnergyHarvestingController,
  type VibrationEnergySystem,
  type PiezoelectricHarvester,
  type VibrationSource
} from './VibrationEnergyHarvesting';

// Main Piezoelectric Energy Harvester exports
export {
  PiezoelectricEnergyHarvester,
  type PiezoelectricSystemConfiguration,
  type PiezoelectricSystemStatus,
  type PiezoelectricPerformanceMetrics
} from './PiezoelectricEnergyHarvester';

/**
 * Factory function to create a complete fuzzy control system
 */
export function createFuzzyControlSystem(vehicleParams: VehicleParameters, safetyLimits?: Partial<SafetyLimits>) {
  return new FuzzyControlIntegration(vehicleParams, safetyLimits);
}

/**
 * Factory function to create a complete piezoelectric energy harvesting system
 */
export function createPiezoelectricEnergyHarvester(config: PiezoelectricSystemConfiguration) {
  return new PiezoelectricEnergyHarvester(config);
}

/**
 * Default piezoelectric system configuration for testing and development
 */
export const defaultPiezoelectricConfiguration: PiezoelectricSystemConfiguration = {
  materials: {
    classical: ['PZT-5H'],
    nonClassical: ['PMN-PT']
  },
  harvesters: {
    beamHarvesters: [
      {
        id: 'suspension_harvester',
        material: 'PZT-5H',
        geometry: {
          length: 0.05,
          width: 0.02,
          thickness: 0.001,
          shape: 'rectangular',
          aspectRatio: 2.5,
          supportConditions: 'cantilever',
          massLocation: 'tip',
          tipMass: 0.01,
          layers: [{
            materialType: 'PZT-5H',
            thickness: 0.001,
            position: 'middle',
            orientation: 0
          }]
        },
        location: { x: 1.2, y: 0.8, z: 0.3 }
      }
    ],
    plateHarvesters: []
  },
  optimization: {
    enabled: true,
    algorithms: ['genetic', 'pso'],
    objectives: {
      maximizePower: { weight: 0.5 },
      maximizeEfficiency: { weight: 0.3 },
      maximizeBandwidth: { weight: 0.2 },
      minimizeWeight: { weight: 0.0 },
      minimizeVolume: { weight: 0.0 },
      minimizeStress: { weight: 0.0 },
      maxStress: 100e6,
      maxDisplacement: 0.001,
      minNaturalFrequency: 1,
      maxNaturalFrequency: 1000
    },
    updateInterval: 5000,
    convergenceCriteria: {
      maxIterations: 100,
      tolerance: 1e-6,
      improvementThreshold: 0.01
    }
  },
  targets: {
    minPowerOutput: 0.001,
    minEfficiency: 0.1,
    maxStress: 100e6,
    operatingFrequencyRange: { min: 1, max: 100 }
  }
};

/**
 * Default vehicle parameters for testing and development
 */
export const defaultVehicleParameters: VehicleParameters = {
  mass: 1800,                    // kg - typical electric vehicle mass
  frontAxleWeightRatio: 0.6,     // 60% front weight distribution
  wheelRadius: 0.35,             // m - typical wheel radius
  motorCount: 2,                 // front-wheel drive configuration
  maxMotorTorque: 400,           // Nm - per motor
  motorEfficiency: 0.92,         // 92% efficiency
  transmissionRatio: 1.0         // direct drive
};

/**
 * Default safety limits
 */
export const defaultSafetyLimits: SafetyLimits = {
  maxRegenerativeBrakingRatio: 0.8,    // Maximum 80% regenerative braking
  maxMotorTorque: 400,                 // Nm
  maxMotorTemperature: 150,            // °C
  maxBatteryChargeCurrent: 200,        // A
  minMechanicalBrakingRatio: 0.2       // Minimum 20% mechanical braking in emergency
};

/**
 * Utility function to validate vehicle parameters
 */
export function validateVehicleParameters(params: VehicleParameters): boolean {
  return (
    params.mass > 0 &&
    params.frontAxleWeightRatio > 0 && params.frontAxleWeightRatio <= 1 &&
    params.wheelRadius > 0 &&
    params.motorCount > 0 && params.motorCount <= 4 &&
    params.maxMotorTorque > 0 &&
    params.motorEfficiency > 0 && params.motorEfficiency <= 1 &&
    params.transmissionRatio > 0
  );
}

/**
 * Utility function to create test inputs for system validation
 */
export function createTestInputs(overrides?: Partial<SystemInputs>): SystemInputs {
  return {
    vehicleSpeed: 60,              // km/h
    brakePedalPosition: 0.3,       // 30% brake pedal
    acceleratorPedalPosition: 0,   // No acceleration
    steeringAngle: 0,              // Straight ahead
    
    lateralAcceleration: 0,        // m/s²
    longitudinalAcceleration: -2,  // m/s² (braking)
    yawRate: 0,                    // rad/s
    roadGradient: 0,               // % (flat road)
    
    batterySOC: 0.7,               // 70% charge
    batteryVoltage: 400,           // V
    batteryCurrent: 50,            // A
    batteryTemperature: 25,        // °C
    motorTemperatures: {
      frontLeft: 60,               // °C
      frontRight: 62,              // °C
    },
    
    ambientTemperature: 20,        // °C
    roadSurface: 'dry',
    visibility: 'clear',
    
    ...overrides
  };
}