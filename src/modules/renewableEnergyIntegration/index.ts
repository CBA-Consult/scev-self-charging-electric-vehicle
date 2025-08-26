/**
 * Renewable Energy Integration Module
 * 
 * This module provides comprehensive integration capabilities for connecting
 * SCEV energy harvesting systems with external renewable energy sources
 * including solar, wind, hydro, and geothermal systems.
 */

// Core integration exports
export {
  RenewableEnergyIntegrator,
  type IntegrationConfiguration,
  type EnergySourceStatus,
  type IntegratedSystemOutputs,
  type GridIntegrationConfig
} from './RenewableEnergyIntegrator';

// External energy source interfaces
export {
  SolarEnergyInterface,
  type SolarSystemConfig,
  type SolarGenerationData,
  type SolarForecastData
} from './SolarEnergyInterface';

export {
  WindEnergyInterface,
  type WindSystemConfig,
  type WindGenerationData,
  type WindForecastData
} from './WindEnergyInterface';

export {
  HydroEnergyInterface,
  type HydroSystemConfig,
  type HydroGenerationData,
  type HydroOperationalData
} from './HydroEnergyInterface';

export {
  GeothermalEnergyInterface,
  type GeothermalSystemConfig,
  type GeothermalGenerationData,
  type ThermalManagementData
} from './GeothermalEnergyInterface';

// Energy management and optimization
export {
  MultiSourceEnergyManager,
  type EnergyManagementStrategy,
  type LoadBalancingConfig,
  type OptimizationObjectives
} from './MultiSourceEnergyManager';

// Grid integration and services
export {
  GridIntegrationController,
  type GridServiceCapabilities,
  type AncillaryServiceConfig,
  type VehicleToGridConfig
} from './GridIntegrationController';

// Monitoring and analytics
export {
  RenewableEnergyMonitor,
  type PerformanceMetrics,
  type SystemHealthData,
  type EnergyFlowAnalysis
} from './RenewableEnergyMonitor';

// Predictive analytics and forecasting
export {
  EnergyForecastingEngine,
  type ForecastingConfig,
  type WeatherData,
  type DemandForecast,
  type GenerationForecast
} from './EnergyForecastingEngine';

/**
 * Factory function to create a complete renewable energy integration system
 */
export function createRenewableEnergySystem(config: IntegrationConfiguration) {
  return new RenewableEnergyIntegrator(config);
}

/**
 * Default configuration for renewable energy integration
 */
export const defaultIntegrationConfiguration: IntegrationConfiguration = {
  scevSystems: {
    electromagnetic: {
      enabled: true,
      maxPower: 25000, // 25kW
      efficiency: 0.92,
      priority: 1
    },
    piezoelectric: {
      enabled: true,
      maxPower: 78, // 78W
      efficiency: 0.85,
      priority: 3
    },
    thermal: {
      enabled: true,
      maxPower: 3200, // 3.2kW
      efficiency: 0.75,
      priority: 2
    }
  },
  externalSources: {
    solar: {
      enabled: true,
      maxPower: 10000, // 10kW
      efficiency: 0.22,
      priority: 1,
      forecastingEnabled: true
    },
    wind: {
      enabled: true,
      maxPower: 15000, // 15kW
      efficiency: 0.45,
      priority: 2,
      forecastingEnabled: true
    },
    hydro: {
      enabled: false,
      maxPower: 5000, // 5kW
      efficiency: 0.90,
      priority: 1,
      forecastingEnabled: false
    },
    geothermal: {
      enabled: false,
      maxPower: 8000, // 8kW
      efficiency: 0.85,
      priority: 1,
      forecastingEnabled: false
    }
  },
  energyStorage: {
    primaryBattery: {
      capacity: 85000, // 85kWh
      maxChargePower: 150000, // 150kW
      maxDischargePower: 200000, // 200kW
      efficiency: 0.95
    },
    supercapacitor: {
      capacity: 1500, // 1.5kWh
      maxChargePower: 50000, // 50kW
      maxDischargePower: 100000, // 100kW
      efficiency: 0.98
    }
  },
  gridIntegration: {
    enabled: true,
    maxExportPower: 50000, // 50kW
    maxImportPower: 150000, // 150kW
    gridServicesEnabled: true,
    v2gEnabled: true
  },
  optimization: {
    strategy: 'cost_optimization',
    updateInterval: 1000, // 1 second
    forecastHorizon: 24, // 24 hours
    objectives: {
      minimizeCost: { weight: 0.4 },
      maximizeEfficiency: { weight: 0.3 },
      maximizeReliability: { weight: 0.2 },
      minimizeEmissions: { weight: 0.1 }
    }
  }
};

/**
 * Utility functions for renewable energy integration
 */
export const renewableEnergyUtils = {
  /**
   * Calculate total renewable energy potential
   */
  calculateTotalPotential(config: IntegrationConfiguration): number {
    let total = 0;
    
    // SCEV systems
    if (config.scevSystems.electromagnetic.enabled) {
      total += config.scevSystems.electromagnetic.maxPower;
    }
    if (config.scevSystems.piezoelectric.enabled) {
      total += config.scevSystems.piezoelectric.maxPower;
    }
    if (config.scevSystems.thermal.enabled) {
      total += config.scevSystems.thermal.maxPower;
    }
    
    // External sources
    if (config.externalSources.solar.enabled) {
      total += config.externalSources.solar.maxPower;
    }
    if (config.externalSources.wind.enabled) {
      total += config.externalSources.wind.maxPower;
    }
    if (config.externalSources.hydro.enabled) {
      total += config.externalSources.hydro.maxPower;
    }
    if (config.externalSources.geothermal.enabled) {
      total += config.externalSources.geothermal.maxPower;
    }
    
    return total;
  },

  /**
   * Calculate energy independence ratio
   */
  calculateEnergyIndependence(
    generatedPower: number,
    consumedPower: number
  ): number {
    if (consumedPower === 0) return 1.0;
    return Math.min(generatedPower / consumedPower, 1.0);
  },

  /**
   * Calculate system efficiency
   */
  calculateSystemEfficiency(
    outputPower: number,
    inputPower: number
  ): number {
    if (inputPower === 0) return 0;
    return outputPower / inputPower;
  },

  /**
   * Calculate carbon footprint reduction
   */
  calculateCarbonReduction(
    renewablePower: number,
    gridCarbonIntensity: number = 0.5 // kg CO2/kWh
  ): number {
    return renewablePower * gridCarbonIntensity / 1000; // kg CO2/hour
  },

  /**
   * Validate integration configuration
   */
  validateConfiguration(config: IntegrationConfiguration): boolean {
    // Check required fields
    if (!config.scevSystems || !config.externalSources || !config.energyStorage) {
      return false;
    }

    // Check power ratings are positive
    const checkPowerRating = (system: any) => {
      return system.maxPower > 0 && 
             system.efficiency > 0 && 
             system.efficiency <= 1;
    };

    // Validate SCEV systems
    if (!checkPowerRating(config.scevSystems.electromagnetic) ||
        !checkPowerRating(config.scevSystems.piezoelectric) ||
        !checkPowerRating(config.scevSystems.thermal)) {
      return false;
    }

    // Validate external sources
    if (!checkPowerRating(config.externalSources.solar) ||
        !checkPowerRating(config.externalSources.wind) ||
        !checkPowerRating(config.externalSources.hydro) ||
        !checkPowerRating(config.externalSources.geothermal)) {
      return false;
    }

    // Validate energy storage
    if (config.energyStorage.primaryBattery.capacity <= 0 ||
        config.energyStorage.supercapacitor.capacity <= 0) {
      return false;
    }

    return true;
  }
};

/**
 * Constants for renewable energy integration
 */
export const RENEWABLE_ENERGY_CONSTANTS = {
  // Standard efficiency values
  SOLAR_PANEL_EFFICIENCY: 0.22,
  WIND_TURBINE_EFFICIENCY: 0.45,
  HYDRO_TURBINE_EFFICIENCY: 0.90,
  GEOTHERMAL_EFFICIENCY: 0.85,
  
  // Power electronics efficiency
  INVERTER_EFFICIENCY: 0.96,
  DC_DC_CONVERTER_EFFICIENCY: 0.95,
  
  // Battery characteristics
  LITHIUM_ION_EFFICIENCY: 0.95,
  SUPERCAPACITOR_EFFICIENCY: 0.98,
  
  // Grid integration
  GRID_TIE_EFFICIENCY: 0.97,
  TRANSFORMER_EFFICIENCY: 0.98,
  
  // Environmental factors
  STANDARD_SOLAR_IRRADIANCE: 1000, // W/m²
  STANDARD_WIND_SPEED: 12, // m/s
  STANDARD_TEMPERATURE: 25, // °C
  
  // Time constants
  CONTROL_UPDATE_INTERVAL: 100, // ms
  MONITORING_INTERVAL: 1000, // ms
  FORECASTING_INTERVAL: 300000, // 5 minutes
  
  // Safety limits
  MAX_VOLTAGE_DEVIATION: 0.05, // 5%
  MAX_FREQUENCY_DEVIATION: 0.5, // 0.5 Hz
  MAX_TEMPERATURE_RISE: 50, // °C
  
  // Performance thresholds
  MIN_EFFICIENCY_THRESHOLD: 0.70,
  MAX_HARMONIC_DISTORTION: 0.05, // 5%
  MIN_POWER_FACTOR: 0.95
};

/**
 * Error types for renewable energy integration
 */
export enum RenewableEnergyError {
  CONFIGURATION_INVALID = 'CONFIGURATION_INVALID',
  SOURCE_UNAVAILABLE = 'SOURCE_UNAVAILABLE',
  GRID_CONNECTION_FAILED = 'GRID_CONNECTION_FAILED',
  POWER_QUALITY_ISSUE = 'POWER_QUALITY_ISSUE',
  SAFETY_LIMIT_EXCEEDED = 'SAFETY_LIMIT_EXCEEDED',
  COMMUNICATION_TIMEOUT = 'COMMUNICATION_TIMEOUT',
  OPTIMIZATION_FAILED = 'OPTIMIZATION_FAILED',
  FORECASTING_ERROR = 'FORECASTING_ERROR'
}

/**
 * Custom error class for renewable energy integration
 */
export class RenewableEnergyIntegrationError extends Error {
  constructor(
    public errorType: RenewableEnergyError,
    message: string,
    public sourceSystem?: string,
    public errorData?: any
  ) {
    super(message);
    this.name = 'RenewableEnergyIntegrationError';
  }
}