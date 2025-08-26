/**
 * Fuzzy Control Module for Regenerative Braking and Energy Harvesting
 * 
 * This module exports the main components of the fuzzy control strategy
 * for regenerative braking in electric vehicles with in-wheel motors,
 * and provides integration with piezoelectric energy harvesting systems.
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

// Piezoelectric energy harvesting exports
export {
  PiezoelectricEnergyHarvester,
  PiezoelectricIntegration,
  NumericalAnalysis,
  type PiezoelectricMaterial,
  type HarvesterConfiguration,
  type EnvironmentalConditions,
  type HarvesterPerformance,
  type MultiSourceInputs,
  type OptimizationParameters,
  type IntegratedSystemInputs,
  type IntegratedSystemOutputs,
  type EnergyManagementStrategy,
  createPiezoelectricSystem,
  defaultPiezoelectricMaterials,
  defaultHarvesterConfigurations,
  defaultOptimizationParameters,
  piezoelectricUtils,
  validationUtils
} from '../piezoelectricHarvesting';

/**
 * Factory function to create a complete fuzzy control system
 */
export function createFuzzyControlSystem(vehicleParams: VehicleParameters, safetyLimits?: Partial<SafetyLimits>) {
  return new FuzzyControlIntegration(vehicleParams, safetyLimits);
}

/**
 * Factory function to create a complete integrated energy harvesting system
 * with both regenerative braking and piezoelectric harvesting capabilities
 */
export function createIntegratedEnergySystem(
  vehicleParams: VehicleParameters, 
  safetyLimits?: Partial<SafetyLimits>,
  optimizationParams?: OptimizationParameters
) {
  return new PiezoelectricIntegration(vehicleParams, safetyLimits, optimizationParams);
}

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