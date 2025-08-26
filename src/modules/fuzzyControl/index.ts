/**
 * Fuzzy Control Module for Regenerative Braking
 * 
 * This module exports the main components of the fuzzy control strategy
 * for regenerative braking in electric vehicles with in-wheel motors.
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

// Continuous energy generation exports
export {
  ContinuousEnergyGenerator,
  type GenerationParameters,
  type ThermalConfig,
  type WheelRotationData,
  type ElectromagneticConfig,
  type PowerOutput,
  type SystemStatus
} from './ContinuousEnergyGenerator';

// Enhanced energy system exports
export {
  EnhancedEnergySystem,
  type EnhancedSystemInputs,
  type EnhancedSystemOutputs,
  type TrainSpecificInputs,
  type TrainSystemOutputs
} from './EnhancedEnergySystem';

// Four-wheel energy analyzer exports
export {
  FourWheelEnergyAnalyzer,
  type OperatingCondition,
  type EnergyFlowResult,
  type SystemEfficiencyAnalysis
} from './FourWheelEnergyAnalyzer';

/**
 * Factory function to create a complete fuzzy control system
 */
export function createFuzzyControlSystem(vehicleParams: VehicleParameters, safetyLimits?: Partial<SafetyLimits>) {
  return new FuzzyControlIntegration(vehicleParams, safetyLimits);
}

/**
 * Factory function to create an enhanced energy system with continuous generation
 */
export function createEnhancedEnergySystem(
  vehicleParams: VehicleParameters,
  electromagneticConfigs: Map<string, ElectromagneticConfig>
) {
  return new EnhancedEnergySystem(vehicleParams, electromagneticConfigs);
}

/**
 * Factory function to create default electromagnetic configurations for vehicles
 */
export function createDefaultElectromagneticConfigs(motorCount: number = 4): Map<string, ElectromagneticConfig> {
  const defaultConfig: ElectromagneticConfig = {
    permanentMagnetStrength: 1.2,
    coilTurns: 120,
    coilResistance: 0.05,
    airGapDistance: 0.003,
    magneticPermeability: 1.256e-6
  };

  const configs = new Map<string, ElectromagneticConfig>();
  configs.set('frontLeft', { ...defaultConfig });
  configs.set('frontRight', { ...defaultConfig });
  
  if (motorCount >= 4) {
    configs.set('rearLeft', { ...defaultConfig, permanentMagnetStrength: 1.0, coilTurns: 100 });
    configs.set('rearRight', { ...defaultConfig, permanentMagnetStrength: 1.0, coilTurns: 100 });
  }
  
  return configs;
}

/**
 * Factory function to create train-optimized electromagnetic configurations
 */
export function createTrainElectromagneticConfigs(): Map<string, ElectromagneticConfig> {
  const trainConfig: ElectromagneticConfig = {
    permanentMagnetStrength: 1.6,
    coilTurns: 200,
    coilResistance: 0.03,
    airGapDistance: 0.004,
    magneticPermeability: 1.256e-6
  };

  const configs = new Map<string, ElectromagneticConfig>();
  configs.set('frontLeft', { ...trainConfig });
  configs.set('frontRight', { ...trainConfig });
  configs.set('rearLeft', { ...trainConfig });
  configs.set('rearRight', { ...trainConfig });
  
  return configs;
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