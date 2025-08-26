/**
 * Wind Energy Grid Integration Module
 * 
 * This module provides comprehensive strategies and tools for integrating wind energy
 * into the national grid, addressing challenges related to grid stability, energy storage,
 * demand management, and regulatory compliance.
 */

// Main integration system exports
export {
  WindEnergyGridIntegration,
  type GridIntegrationInputs,
  type GridIntegrationOutputs,
  type GridStabilityMetrics,
  type WindForecastData
} from './WindEnergyGridIntegration';

// Grid stability management exports
export {
  GridStabilityManager,
  type StabilityParameters,
  type FrequencyRegulationConfig,
  type VoltageControlConfig,
  type InertialResponseConfig
} from './GridStabilityManager';

// Energy storage coordination exports
export {
  WindEnergyStorageCoordinator,
  type StorageSystemConfig,
  type StorageOptimizationStrategy,
  type BatteryManagementConfig,
  type HybridStorageConfig
} from './WindEnergyStorageCoordinator';

// Demand response management exports
export {
  DemandResponseManager,
  type DemandResponseConfig,
  type LoadForecastData,
  type CurtailmentStrategy,
  type FlexibilityServices
} from './DemandResponseManager';

// Policy and regulatory framework exports
export {
  RegulatoryComplianceManager,
  type PolicyFramework,
  type GridCodeRequirements,
  type EnvironmentalCompliance,
  type MarketMechanisms
} from './RegulatoryComplianceManager';

// Wind farm management exports
export {
  WindFarmController,
  type WindFarmConfiguration,
  type TurbineControlParameters,
  type WindResourceData,
  type PowerOutputOptimization
} from './WindFarmController';

/**
 * Factory function to create a complete wind energy grid integration system
 */
export function createWindEnergyGridIntegration(
  gridConfig: GridIntegrationConfig,
  storageConfig?: StorageSystemConfig,
  policyFramework?: PolicyFramework
) {
  return new WindEnergyGridIntegration(gridConfig, storageConfig, policyFramework);
}

/**
 * Default grid integration configuration
 */
export const defaultGridIntegrationConfig: GridIntegrationConfig = {
  gridCapacity: 1000000000, // 1 GW grid capacity
  windPenetrationTarget: 0.35, // 35% wind energy target
  maxWindPenetration: 0.6, // 60% maximum instantaneous wind penetration
  gridFrequency: 50, // 50 Hz grid frequency
  voltageLevel: 400000, // 400 kV transmission voltage
  stabilityMargins: {
    frequencyDeviationLimit: 0.5, // ±0.5 Hz
    voltageDeviationLimit: 0.05, // ±5%
    rampRateLimit: 0.1, // 10% per minute
    inertiaRequirement: 5.0 // 5 seconds
  },
  storageRequirements: {
    minimumCapacity: 100000000, // 100 MWh minimum storage
    powerRating: 50000000, // 50 MW power rating
    responseTime: 1, // 1 second response time
    efficiency: 0.85 // 85% round-trip efficiency
  }
};

/**
 * Default wind farm configuration
 */
export const defaultWindFarmConfig: WindFarmConfiguration = {
  totalCapacity: 200000000, // 200 MW wind farm
  turbineCount: 80, // 80 turbines
  turbineRating: 2500000, // 2.5 MW per turbine
  hubHeight: 120, // 120m hub height
  rotorDiameter: 120, // 120m rotor diameter
  cutInSpeed: 3, // 3 m/s cut-in wind speed
  ratedSpeed: 12, // 12 m/s rated wind speed
  cutOutSpeed: 25, // 25 m/s cut-out wind speed
  powerCurveOptimization: true,
  wakeEffectMitigation: true,
  gridConnectionVoltage: 33000 // 33 kV collection voltage
};

/**
 * Grid integration configuration interface
 */
export interface GridIntegrationConfig {
  gridCapacity: number;
  windPenetrationTarget: number;
  maxWindPenetration: number;
  gridFrequency: number;
  voltageLevel: number;
  stabilityMargins: {
    frequencyDeviationLimit: number;
    voltageDeviationLimit: number;
    rampRateLimit: number;
    inertiaRequirement: number;
  };
  storageRequirements: {
    minimumCapacity: number;
    powerRating: number;
    responseTime: number;
    efficiency: number;
  };
}

/**
 * Utility functions for grid integration calculations
 */
export const gridIntegrationUtils = {
  /**
   * Calculate optimal wind penetration level based on grid conditions
   */
  calculateOptimalWindPenetration(
    gridLoad: number,
    windAvailability: number,
    storageCapacity: number,
    stabilityMargins: any
  ): number {
    const baselinePenetration = Math.min(windAvailability, 0.6);
    const loadFactor = gridLoad / 1000000000; // Normalize to GW
    const storageFactor = Math.min(storageCapacity / 100000000, 1); // Normalize to 100 MWh
    
    return Math.min(
      baselinePenetration * loadFactor * (0.8 + 0.2 * storageFactor),
      stabilityMargins.maxWindPenetration || 0.6
    );
  },

  /**
   * Calculate required storage capacity for wind integration
   */
  calculateRequiredStorageCapacity(
    windCapacity: number,
    penetrationTarget: number,
    gridVariability: number
  ): number {
    const baseStorage = windCapacity * penetrationTarget * 0.25; // 25% of wind capacity
    const variabilityFactor = 1 + gridVariability * 0.5;
    return baseStorage * variabilityFactor;
  },

  /**
   * Assess grid stability impact of wind integration
   */
  assessGridStabilityImpact(
    windPenetration: number,
    storageAvailable: boolean,
    demandResponseCapacity: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    let stabilityScore = 0;
    
    if (windPenetration > 0.5) stabilityScore += 3;
    else if (windPenetration > 0.3) stabilityScore += 2;
    else stabilityScore += 1;
    
    if (!storageAvailable) stabilityScore += 2;
    if (demandResponseCapacity < 0.1) stabilityScore += 1;
    
    if (stabilityScore <= 2) return 'low';
    if (stabilityScore <= 4) return 'medium';
    if (stabilityScore <= 6) return 'high';
    return 'critical';
  }
};

/**
 * Validation functions for grid integration parameters
 */
export function validateGridIntegrationConfig(config: GridIntegrationConfig): boolean {
  return (
    config.gridCapacity > 0 &&
    config.windPenetrationTarget > 0 && config.windPenetrationTarget <= 1 &&
    config.maxWindPenetration > 0 && config.maxWindPenetration <= 1 &&
    config.gridFrequency > 0 &&
    config.voltageLevel > 0 &&
    config.stabilityMargins.frequencyDeviationLimit > 0 &&
    config.stabilityMargins.voltageDeviationLimit > 0 &&
    config.stabilityMargins.rampRateLimit > 0 &&
    config.stabilityMargins.inertiaRequirement > 0 &&
    config.storageRequirements.minimumCapacity > 0 &&
    config.storageRequirements.powerRating > 0 &&
    config.storageRequirements.responseTime > 0 &&
    config.storageRequirements.efficiency > 0 && config.storageRequirements.efficiency <= 1
  );
}

/**
 * Create test inputs for wind energy grid integration validation
 */
export function createTestGridInputs(overrides?: Partial<GridIntegrationInputs>): GridIntegrationInputs {
  return {
    currentGridLoad: 800000000, // 800 MW current load
    windGeneration: 280000000, // 280 MW wind generation
    windForecast: {
      hourly: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        windSpeed: 8 + Math.sin(i * Math.PI / 12) * 3,
        expectedPower: 200000000 + Math.sin(i * Math.PI / 12) * 80000000,
        confidence: 0.85
      })),
      daily: Array.from({ length: 7 }, (_, i) => ({
        day: i,
        averageWindSpeed: 9 + Math.sin(i * Math.PI / 3) * 2,
        expectedEnergy: 4800000000, // 4.8 GWh per day
        confidence: 0.75
      }))
    },
    gridFrequency: 50.0,
    gridVoltage: 400000,
    storageSOC: 0.65, // 65% state of charge
    demandForecast: {
      peak: 950000000, // 950 MW peak demand
      valley: 600000000, // 600 MW valley demand
      rampRate: 50000000 // 50 MW/hour ramp rate
    },
    weatherConditions: {
      temperature: 15, // 15°C
      humidity: 0.6, // 60% humidity
      pressure: 1013, // 1013 hPa
      visibility: 10000 // 10 km visibility
    },
    marketConditions: {
      electricityPrice: 0.08, // $0.08/kWh
      carbonPrice: 25, // $25/tCO2
      renewableIncentive: 0.02 // $0.02/kWh renewable incentive
    },
    ...overrides
  };
}