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

// Continuous energy harvesting exports
export {
  ContinuousEnergyHarvester,
  type WheelRotationInputs,
  type EnergyHarvestingOutputs,
  type InductionCoilParameters,
  type HarvestingStrategy
} from './ContinuousEnergyHarvester';

// MR Fluid system exports
export {
  MRFluidFormulation,
  type MRFluidComposition,
  type EnergyRecoveryMetrics,
  type OptimizationParameters
} from './MRFluidFormulation';

export {
  MRFluidIntegration,
  type MRFluidSystemInputs,
  type MRFluidSystemOutputs,
  type MRFluidSystemConfiguration
} from './MRFluidIntegration';

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
 * Factory function to create a complete integrated energy harvesting system
 * with both regenerative braking and piezoelectric harvesting capabilities
 */
export function createIntegratedEnergySystem(
  vehicleParams: VehicleParameters, 
  safetyLimits?: Partial<SafetyLimits>,
  optimizationParams?: OptimizationParameters
) {
  return new PiezoelectricIntegration(vehicleParams, safetyLimits, optimizationParams);

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
    
    // Continuous energy harvesting inputs
    motorLoad: 0.5,                // 50% motor load
    propulsionPower: 25000,        // 25kW propulsion power
    wheelTorque: 200,              // 200Nm wheel torque
    
    ...overrides
  };
}