/**
 * Type definitions for optimal energy algorithms
 */

export interface EnergyConversionParameters {
  sourceType: 'electromagnetic' | 'piezoelectric' | 'thermal' | 'mechanical' | 'solar' | 'wind' | 'hydro';
  inputPower: number;                    // W - input power
  inputVoltage: number;                  // V - input voltage
  inputCurrent: number;                  // A - input current
  inputFrequency: number;                // Hz - input frequency
  temperature: number;                   // °C - operating temperature
  efficiency: number;                    // % - current efficiency
  loadResistance: number;                // Ω - load resistance
  conversionRatio: number;               // ratio of output to input
  harmonicDistortion: number;            // % - total harmonic distortion
  powerFactor: number;                   // power factor
}

export interface StorageOptimizationParameters {
  storageType: 'battery' | 'supercapacitor' | 'flywheel' | 'caes' | 'gravity' | 'thermal';
  capacity: number;                      // Wh - storage capacity
  currentSOC: number;                    // % - state of charge
  maxChargePower: number;                // W - maximum charging power
  maxDischargePower: number;             // W - maximum discharging power
  chargingEfficiency: number;            // % - charging efficiency
  dischargingEfficiency: number;         // % - discharging efficiency
  selfDischargeRate: number;             // %/hour - self-discharge rate
  cycleLife: number;                     // number of cycles
  currentCycles: number;                 // current cycle count
  temperature: number;                   // °C - operating temperature
  degradationFactor: number;             // % - capacity degradation
  costPerCycle: number;                  // $ - cost per cycle
}

export interface OptimizationObjectives {
  maximizeEfficiency: {
    weight: number;                      // 0-1 - objective weight
    target: number;                      // % - target efficiency
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  minimizeEnergyLoss: {
    weight: number;
    target: number;                      // W - target maximum loss
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  maximizePowerOutput: {
    weight: number;
    target: number;                      // W - target power output
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  minimizeCost: {
    weight: number;
    target: number;                      // $ - target cost
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  maximizeLifespan: {
    weight: number;
    target: number;                      // hours - target lifespan
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  minimizeEmissions: {
    weight: number;
    target: number;                      // kg CO2 - target emissions
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface EnergyFlowConfiguration {
  sources: Array<{
    id: string;
    type: string;
    maxPower: number;                    // W - maximum power
    currentPower: number;                // W - current power
    efficiency: number;                  // % - conversion efficiency
    priority: number;                    // 1-10 - source priority
    availability: number;                // % - availability factor
    cost: number;                        // $/kWh - cost of energy
  }>;
  storage: Array<{
    id: string;
    type: string;
    capacity: number;                    // Wh - storage capacity
    currentSOC: number;                  // % - state of charge
    maxChargePower: number;              // W - max charge power
    maxDischargePower: number;           // W - max discharge power
    efficiency: number;                  // % - round-trip efficiency
    priority: number;                    // 1-10 - storage priority
  }>;
  loads: Array<{
    id: string;
    type: string;
    power: number;                       // W - power demand
    priority: number;                    // 1-10 - load priority
    flexibility: number;                 // % - load flexibility
    timeWindow: [number, number];        // [start, end] - time window
  }>;
  constraints: {
    maxTotalPower: number;               // W - maximum total power
    minEfficiency: number;               // % - minimum efficiency
    maxCost: number;                     // $ - maximum cost
    maxEmissions: number;                // kg CO2 - maximum emissions
    reliabilityTarget: number;           // % - reliability target
  };
}

export interface PredictiveModelParameters {
  modelType: 'neural_network' | 'lstm' | 'arima' | 'ensemble' | 'reinforcement_learning';
  trainingData: Array<{
    timestamp: number;
    features: number[];                  // input features
    target: number;                      // target value
  }>;
  predictionHorizon: number;             // hours - prediction horizon
  updateFrequency: number;               // minutes - model update frequency
  confidenceLevel: number;               // % - confidence level
  validationSplit: number;               // % - validation data split
  hyperparameters: {
    learningRate: number;
    epochs: number;
    batchSize: number;
    hiddenLayers: number[];
    dropoutRate: number;
    regularization: number;
  };
}

export interface OptimizationResult {
  success: boolean;
  convergence: boolean;
  iterations: number;
  executionTime: number;                 // ms - execution time
  optimalParameters: {
    conversionParameters?: Partial<EnergyConversionParameters>;
    storageParameters?: Partial<StorageOptimizationParameters>;
    flowConfiguration?: Partial<EnergyFlowConfiguration>;
  };
  performanceMetrics: PerformanceMetrics;
  recommendations: string[];
  warnings: string[];
  nextOptimizationTime: number;          // timestamp
}

export interface PerformanceMetrics {
  efficiency: {
    current: number;                     // % - current efficiency
    optimal: number;                     // % - optimal efficiency
    improvement: number;                 // % - improvement achieved
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  powerOutput: {
    current: number;                     // W - current power output
    optimal: number;                     // W - optimal power output
    improvement: number;                 // W - improvement achieved
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  energyLoss: {
    current: number;                     // W - current energy loss
    optimal: number;                     // W - optimal energy loss
    reduction: number;                   // W - loss reduction achieved
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  cost: {
    current: number;                     // $ - current cost
    optimal: number;                     // $ - optimal cost
    savings: number;                     // $ - cost savings achieved
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  reliability: {
    current: number;                     // % - current reliability
    optimal: number;                     // % - optimal reliability
    improvement: number;                 // % - improvement achieved
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  emissions: {
    current: number;                     // kg CO2 - current emissions
    optimal: number;                     // kg CO2 - optimal emissions
    reduction: number;                   // kg CO2 - reduction achieved
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface AlgorithmConfiguration {
  algorithm: 'genetic' | 'particle_swarm' | 'simulated_annealing' | 'neural_network' | 'reinforcement_learning';
  parameters: {
    populationSize?: number;
    generations?: number;
    mutationRate?: number;
    crossoverRate?: number;
    swarmSize?: number;
    inertiaWeight?: number;
    cognitiveWeight?: number;
    socialWeight?: number;
    initialTemperature?: number;
    coolingRate?: number;
    learningRate?: number;
    discountFactor?: number;
    explorationRate?: number;
  };
  convergenceCriteria: {
    maxIterations: number;
    toleranceThreshold: number;
    improvementThreshold: number;
    stallGenerations: number;
  };
}

export interface EnergySystemState {
  timestamp: number;
  sources: Map<string, EnergyConversionParameters>;
  storage: Map<string, StorageOptimizationParameters>;
  loads: Map<string, { power: number; priority: number }>;
  grid: {
    frequency: number;                   // Hz - grid frequency
    voltage: number;                     // V - grid voltage
    powerFactor: number;                 // power factor
    harmonics: number;                   // % - harmonic distortion
  };
  environment: {
    temperature: number;                 // °C - ambient temperature
    humidity: number;                    // % - relative humidity
    pressure: number;                    // Pa - atmospheric pressure
    windSpeed: number;                   // m/s - wind speed
    solarIrradiance: number;            // W/m² - solar irradiance
  };
}

export interface OptimizationConstraints {
  efficiency: {
    minimum: number;                     // % - minimum efficiency
    maximum: number;                     // % - maximum efficiency
  };
  power: {
    minimum: number;                     // W - minimum power
    maximum: number;                     // W - maximum power
  };
  temperature: {
    minimum: number;                     // °C - minimum temperature
    maximum: number;                     // °C - maximum temperature
  };
  cost: {
    maximum: number;                     // $ - maximum cost
  };
  emissions: {
    maximum: number;                     // kg CO2 - maximum emissions
  };
  reliability: {
    minimum: number;                     // % - minimum reliability
  };
  responseTime: {
    maximum: number;                     // ms - maximum response time
  };
}