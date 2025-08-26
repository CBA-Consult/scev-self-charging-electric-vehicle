/**
 * Electromagnetic Shock Absorber Module
 * 
 * This module exports the main components of the rotary electromagnetic shock absorber
 * system for energy harvesting in electric vehicles.
 */

// Main shock absorber exports
export { 
  RotaryElectromagneticShockAbsorber,
  type SuspensionInputs,
  type ShockAbsorberOutputs,
  type ElectromagneticParameters,
  type MechanicalParameters,
  type DampingCharacteristics,
  type DampingMode
} from './RotaryElectromagneticShockAbsorber';

// Integration system exports
export {
  ShockAbsorberIntegration,
  type VehicleSuspensionInputs,
  type VehicleSuspensionOutputs,
  type EnergyManagementInputs,
  type IntegratedSystemOutputs
} from './ShockAbsorberIntegration';

/**
 * Factory function to create a complete shock absorber system
 */
export function createShockAbsorberSystem(
  electromagneticParams?: Partial<ElectromagneticParameters>,
  mechanicalParams?: Partial<MechanicalParameters>,
  dampingParams?: Partial<DampingCharacteristics>
) {
  return new RotaryElectromagneticShockAbsorber(
    electromagneticParams,
    mechanicalParams,
    dampingParams
  );
}

/**
 * Factory function to create an integrated vehicle suspension system
 */
export function createIntegratedSuspensionSystem() {
  return new ShockAbsorberIntegration();
}

/**
 * Default electromagnetic parameters for testing and development
 */
export const defaultElectromagneticParameters: ElectromagneticParameters = {
  poleCount: 12,
  fluxDensity: 1.2, // Tesla
  coilTurns: 200,
  coilResistance: 0.5, // Ohms
  coreMaterialPermeability: 5000,
  airGapLength: 1.5 // mm
};

/**
 * Default mechanical parameters
 */
export const defaultMechanicalParameters: MechanicalParameters = {
  gearRatio: 15.0, // 15:1 gear ratio
  flywheelInertia: 0.05, // kg⋅m²
  mechanicalEfficiency: 0.92,
  maxRotationalSpeed: 3000, // RPM
  bearingFriction: 0.002
};

/**
 * Default damping characteristics
 */
export const defaultDampingCharacteristics: DampingCharacteristics = {
  baseDampingCoefficient: 2500, // N⋅s/m
  variableDampingRange: 0.6,
  comfortModeMultiplier: 0.8,
  sportModeMultiplier: 1.4,
  energyHarvestingMultiplier: 1.2
};

/**
 * Utility function to validate electromagnetic parameters
 */
export function validateElectromagneticParameters(params: ElectromagneticParameters): boolean {
  return (
    params.poleCount > 0 && params.poleCount % 2 === 0 && // Even number of poles
    params.fluxDensity > 0 && params.fluxDensity <= 2.0 && // Realistic flux density
    params.coilTurns > 0 &&
    params.coilResistance > 0 &&
    params.coreMaterialPermeability > 1 &&
    params.airGapLength > 0 && params.airGapLength <= 10 // Reasonable air gap
  );
}

/**
 * Utility function to validate mechanical parameters
 */
export function validateMechanicalParameters(params: MechanicalParameters): boolean {
  return (
    params.gearRatio > 1 && params.gearRatio <= 50 && // Reasonable gear ratio
    params.flywheelInertia > 0 &&
    params.mechanicalEfficiency > 0 && params.mechanicalEfficiency <= 1 &&
    params.maxRotationalSpeed > 0 && params.maxRotationalSpeed <= 10000 && // RPM
    params.bearingFriction >= 0 && params.bearingFriction <= 0.1
  );
}

/**
 * Utility function to create test suspension inputs
 */
export function createTestSuspensionInputs(overrides?: Partial<SuspensionInputs>): SuspensionInputs {
  return {
    verticalVelocity: 0.5,        // m/s - moderate suspension movement
    displacement: 0.05,           // m - 5cm displacement
    cornerLoad: 500,              // kg - typical corner load
    roadCondition: 'rough',       // Rough road for energy harvesting
    vehicleSpeed: 60,             // km/h - moderate speed
    ambientTemperature: 25,       // °C - normal temperature
    ...overrides
  };
}

/**
 * Utility function to create test vehicle suspension inputs
 */
export function createTestVehicleSuspensionInputs(
  overrides?: Partial<VehicleSuspensionInputs>
): VehicleSuspensionInputs {
  const baseInputs = createTestSuspensionInputs();
  
  return {
    frontLeft: { ...baseInputs, cornerLoad: 550 },   // Slightly more load on front
    frontRight: { ...baseInputs, cornerLoad: 550 },
    rearLeft: { ...baseInputs, cornerLoad: 450 },    // Less load on rear
    rearRight: { ...baseInputs, cornerLoad: 450 },
    ...overrides
  };
}

/**
 * Utility function to create test energy management inputs
 */
export function createTestEnergyManagementInputs(
  overrides?: Partial<EnergyManagementInputs>
): EnergyManagementInputs {
  return {
    batterySOC: 0.6,                    // 60% charge
    powerDemand: 5000,                  // 5kW power demand
    availableStorageCapacity: 20,       // 20kWh available capacity
    gridConnected: false,               // Not connected to grid
    ...overrides
  };
}

/**
 * Performance calculation utilities
 */
export class ShockAbsorberPerformanceCalculator {
  /**
   * Calculate theoretical maximum power for given parameters
   */
  static calculateTheoreticalMaxPower(
    electromagneticParams: ElectromagneticParameters,
    mechanicalParams: MechanicalParameters,
    maxVelocity: number
  ): number {
    // Simplified calculation: P = B²L²v²/R
    const effectiveLength = electromagneticParams.coilTurns * 0.1; // Approximate
    const maxAngularVelocity = (maxVelocity / 0.05) * mechanicalParams.gearRatio; // Convert to rad/s
    
    const theoreticalPower = Math.pow(electromagneticParams.fluxDensity, 2) * 
                            Math.pow(effectiveLength, 2) * 
                            Math.pow(maxAngularVelocity, 2) / 
                            electromagneticParams.coilResistance;
    
    return theoreticalPower * mechanicalParams.mechanicalEfficiency;
  }

  /**
   * Calculate energy harvesting potential for a given drive cycle
   */
  static calculateDriveCycleEnergyPotential(
    suspensionProfile: SuspensionInputs[],
    timeStep: number
  ): { totalEnergy: number; averagePower: number; peakPower: number } {
    const shockAbsorber = createShockAbsorberSystem();
    let totalEnergy = 0;
    let peakPower = 0;
    
    for (const inputs of suspensionProfile) {
      const outputs = shockAbsorber.processMotion(inputs);
      totalEnergy += (outputs.generatedPower * timeStep) / 3600; // Convert to Wh
      peakPower = Math.max(peakPower, outputs.generatedPower);
    }
    
    const averagePower = suspensionProfile.length > 0 ? 
      (totalEnergy * 3600) / (suspensionProfile.length * timeStep) : 0;
    
    return { totalEnergy, averagePower, peakPower };
  }
}

// Import types for re-export
import type { 
  ElectromagneticParameters,
  MechanicalParameters,
  DampingCharacteristics,
  SuspensionInputs,
  VehicleSuspensionInputs,
  EnergyManagementInputs
} from './RotaryElectromagneticShockAbsorber';
import type { RotaryElectromagneticShockAbsorber } from './RotaryElectromagneticShockAbsorber';
import type { ShockAbsorberIntegration } from './ShockAbsorberIntegration';