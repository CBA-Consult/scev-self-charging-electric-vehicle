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

// Hydraulic electromagnetic regenerative damper exports
export {
  HydraulicElectromagneticRegenerativeDamper,
  type DamperInputs,
  type DamperOutputs,
  type DamperConfiguration,
  type DamperConstraints
} from './HydraulicElectromagneticRegenerativeDamper';

// Hydraulic damper integration exports
export {
  HydraulicDamperIntegration,
  type IntegratedSystemInputs,
  type IntegratedSystemOutputs,
  type HydraulicDamperSystemConfig
} from './HydraulicDamperIntegration';

/**
 * Factory function to create a complete fuzzy control system
 */
export function createFuzzyControlSystem(vehicleParams: VehicleParameters, safetyLimits?: Partial<SafetyLimits>) {
  return new FuzzyControlIntegration(vehicleParams, safetyLimits);
}

/**
 * Factory function to create a hydraulic electromagnetic regenerative damper
 */
export function createHydraulicDamper(config?: Partial<DamperConfiguration>, constraints?: Partial<DamperConstraints>) {
  return new HydraulicElectromagneticRegenerativeDamper(config, constraints);
}

/**
 * Factory function to create an integrated hydraulic damper system
 */
export function createIntegratedDamperSystem(
  vehicleParams: VehicleParameters, 
  systemConfig?: Partial<HydraulicDamperSystemConfig>
) {
  return new HydraulicDamperIntegration(vehicleParams, systemConfig);
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
 * Default hydraulic damper configuration
 */
export const defaultDamperConfiguration: DamperConfiguration = {
  maxDampingForce: 8000,               // N - typical for passenger vehicle
  maxElectromagneticForce: 2000,       // N - electromagnetic contribution
  coilResistance: 0.5,                 // Ω - low resistance for efficiency
  magneticFluxDensity: 1.2,            // T - strong permanent magnets
  coilLength: 0.15,                    // m - effective coil length
  cylinderDiameter: 0.05,              // m - 50mm diameter
  maxOperatingTemperature: 120,        // °C - thermal limit
  conversionEfficiency: 0.85           // 85% electromagnetic conversion efficiency
};

/**
 * Default hydraulic damper constraints
 */
export const defaultDamperConstraints: DamperConstraints = {
  maxCompressionVelocity: 2.0,         // m/s - maximum compression speed
  maxExtensionVelocity: 2.0,           // m/s - maximum extension speed
  maxDisplacement: 0.15,               // m - maximum compression
  minDisplacement: -0.15,              // m - maximum extension
  maxPowerOutput: 1500,                // W - maximum power per damper
  temperatureDeratingThreshold: 100    // °C - start reducing performance
};

/**
 * Default integrated system configuration
 */
export const defaultIntegratedSystemConfig: HydraulicDamperSystemConfig = {
  damperConfigs: {
    front: defaultDamperConfiguration,
    rear: {
      ...defaultDamperConfiguration,
      maxDampingForce: 7000,           // Slightly lower for rear
      maxElectromagneticForce: 1800,
      maxPowerOutput: 1200
    }
  },
  damperConstraints: {
    front: defaultDamperConstraints,
    rear: {
      ...defaultDamperConstraints,
      maxPowerOutput: 1200
    }
  },
  energyManagement: {
    prioritizeBrakingOverDamping: true,
    maxCombinedPower: 8000,            // W - total system power limit
    batteryChargingThreshold: 0.95,    // Reduce charging when battery > 95%
    thermalManagementEnabled: true
  }
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