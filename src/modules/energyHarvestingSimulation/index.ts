/**
 * Energy Harvesting Simulation Module
 * 
 * This module provides a comprehensive simulation model for energy harvesting systems
 * that can evaluate performance under various driving conditions and optimize
 * efficiency and power output.
 */

// Main simulation controller exports
export {
  EnergyHarvestingSimulator,
  type SimulationInputs,
  type SimulationOutputs,
  type DrivingConditions,
  type WeatherConditions,
  type VehicleConfiguration,
  type OptimizationResults
} from './EnergyHarvestingSimulator';

// Performance analyzer exports
export {
  PerformanceAnalyzer,
  type PerformanceMetrics,
  type EfficiencyAnalysis,
  type PowerGenerationAnalysis
} from './PerformanceAnalyzer';

// Optimization engine exports
export {
  OptimizationEngine,
  type OptimizationParameters,
  type OptimizationObjectives,
  type OptimizationConstraints,
  type OptimizationStrategy
} from './OptimizationEngine';

// Scenario generator exports
export {
  ScenarioGenerator,
  type DrivingScenario,
  type ScenarioParameters,
  type ScenarioResults
} from './ScenarioGenerator';

/**
 * Factory function to create a complete energy harvesting simulation system
 */
export function createEnergyHarvestingSimulator(
  vehicleConfig: VehicleConfiguration,
  optimizationParams?: OptimizationParameters
) {
  return new EnergyHarvestingSimulator(vehicleConfig, optimizationParams);
}

/**
 * Default vehicle configuration for simulation
 */
export const defaultVehicleConfiguration: VehicleConfiguration = {
  mass: 1800,                    // kg
  wheelbase: 2.7,               // m
  trackWidth: 1.6,              // m
  frontAxleWeightRatio: 0.6,    // 60% front weight distribution
  wheelRadius: 0.35,            // m
  motorCount: 4,                // all-wheel drive
  maxMotorTorque: 400,          // Nm per motor
  motorEfficiency: 0.92,        // 92% efficiency
  transmissionRatio: 1.0,       // direct drive
  
  // Energy harvesting components
  electromagneticShockAbsorbers: {
    enabled: true,
    count: 4,
    maxPowerPerUnit: 1500,      // W
    efficiency: 0.85
  },
  
  piezoelectricHarvesters: {
    enabled: true,
    count: 8,                   // distributed throughout vehicle
    maxPowerPerUnit: 50,        // W
    efficiency: 0.75
  },
  
  regenerativeBraking: {
    enabled: true,
    maxRecoveryRatio: 0.8,      // 80% max regenerative braking
    efficiency: 0.88
  },
  
  mrFluidDampers: {
    enabled: true,
    count: 4,
    maxPowerPerUnit: 800,       // W
    efficiency: 0.82
  }
};

/**
 * Default optimization parameters
 */
export const defaultOptimizationParameters: OptimizationParameters = {
  objectives: {
    maximizePowerOutput: { weight: 0.4, priority: 'high' },
    maximizeEfficiency: { weight: 0.3, priority: 'high' },
    minimizeSystemComplexity: { weight: 0.1, priority: 'medium' },
    minimizeCost: { weight: 0.1, priority: 'medium' },
    maximizeReliability: { weight: 0.1, priority: 'high' }
  },
  
  constraints: {
    maxTotalSystemPower: 15000,     // W
    maxSystemWeight: 200,           // kg
    maxSystemVolume: 0.5,           // m³
    minSystemEfficiency: 0.7,       // 70%
    maxSystemCost: 50000,           // USD
    minReliabilityScore: 0.9        // 90%
  },
  
  algorithm: {
    type: 'multi_objective_genetic',
    populationSize: 100,
    generations: 200,
    mutationRate: 0.1,
    crossoverRate: 0.8,
    convergenceTolerance: 1e-6
  },
  
  updateInterval: 1000,             // ms
  realTimeOptimization: true
};

/**
 * Standard driving scenarios for testing
 */
export const standardDrivingScenarios = {
  cityDriving: {
    name: 'City Driving',
    duration: 3600,               // 1 hour
    averageSpeed: 35,             // km/h
    speedVariation: 0.6,          // high variation
    stopFrequency: 0.3,           // stops per km
    accelerationProfile: 'moderate',
    brakingProfile: 'frequent'
  },
  
  highwayDriving: {
    name: 'Highway Driving',
    duration: 7200,               // 2 hours
    averageSpeed: 110,            // km/h
    speedVariation: 0.2,          // low variation
    stopFrequency: 0.01,          // rare stops
    accelerationProfile: 'gentle',
    brakingProfile: 'rare'
  },
  
  mountainDriving: {
    name: 'Mountain Driving',
    duration: 5400,               // 1.5 hours
    averageSpeed: 60,             // km/h
    speedVariation: 0.4,          // moderate variation
    stopFrequency: 0.1,           // occasional stops
    accelerationProfile: 'aggressive',
    brakingProfile: 'regenerative_heavy',
    elevation: {
      changes: true,
      maxGradient: 0.15,          // 15% grade
      averageGradient: 0.05       // 5% average
    }
  },
  
  sportDriving: {
    name: 'Sport Driving',
    duration: 1800,               // 30 minutes
    averageSpeed: 80,             // km/h
    speedVariation: 0.8,          // very high variation
    stopFrequency: 0.05,          // few stops
    accelerationProfile: 'aggressive',
    brakingProfile: 'aggressive'
  }
};

/**
 * Weather condition presets
 */
export const weatherConditions = {
  clear: {
    temperature: 20,              // °C
    humidity: 50,                 // %
    windSpeed: 5,                 // m/s
    roadCondition: 'dry',
    visibility: 'excellent'
  },
  
  rain: {
    temperature: 15,              // °C
    humidity: 85,                 // %
    windSpeed: 12,                // m/s
    roadCondition: 'wet',
    visibility: 'reduced'
  },
  
  snow: {
    temperature: -5,              // °C
    humidity: 90,                 // %
    windSpeed: 8,                 // m/s
    roadCondition: 'snow',
    visibility: 'poor'
  },
  
  hot: {
    temperature: 35,              // °C
    humidity: 30,                 // %
    windSpeed: 3,                 // m/s
    roadCondition: 'dry',
    visibility: 'good'
  },
  
  cold: {
    temperature: -15,             // °C
    humidity: 70,                 // %
    windSpeed: 15,                // m/s
    roadCondition: 'ice',
    visibility: 'reduced'
  }
};

/**
 * Utility function to validate simulation inputs
 */
export function validateSimulationInputs(inputs: SimulationInputs): boolean {
  return (
    inputs.drivingConditions.speed >= 0 &&
    inputs.drivingConditions.acceleration >= -10 && inputs.drivingConditions.acceleration <= 5 &&
    inputs.weatherConditions.temperature >= -40 && inputs.weatherConditions.temperature <= 60 &&
    inputs.weatherConditions.humidity >= 0 && inputs.weatherConditions.humidity <= 100 &&
    inputs.vehicleConfiguration.mass > 0 &&
    inputs.vehicleConfiguration.motorCount > 0
  );
}

/**
 * Utility function to create test simulation inputs
 */
export function createTestSimulationInputs(overrides?: Partial<SimulationInputs>): SimulationInputs {
  return {
    drivingConditions: {
      speed: 60,                  // km/h
      acceleration: 0,            // m/s²
      brakingIntensity: 0,        // 0-1
      steeringAngle: 0,           // degrees
      roadGradient: 0,            // %
      roadSurface: 'asphalt',
      trafficDensity: 'medium'
    },
    
    weatherConditions: weatherConditions.clear,
    
    vehicleConfiguration: defaultVehicleConfiguration,
    
    simulationParameters: {
      duration: 3600,             // 1 hour
      timeStep: 0.1,              // 100ms
      realTimeMode: false,
      dataLogging: true,
      optimizationEnabled: true
    },
    
    ...overrides
  };
}