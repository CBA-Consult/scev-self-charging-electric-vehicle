/**
 * Type definitions for Energy Management Control System
 */

export interface EnergyManagementConfig {
  /** Control system update frequency (Hz) */
  updateFrequency: number;
  /** Energy management strategy */
  strategy: 'efficiency_first' | 'power_first' | 'balanced' | 'adaptive';
  /** Prediction horizon for energy forecasting (seconds) */
  predictionHorizon: number;
  /** Integration with vehicle systems */
  vehicleIntegration: {
    enabled: boolean;
    communicationProtocol: 'CAN' | 'LIN' | 'FlexRay' | 'Ethernet';
    updateRate: number; // Hz
  };
  /** Safety and protection settings */
  safetyLimits: {
    maxPowerTransfer: number; // W
    maxTemperature: number; // °C
    minBatterySOC: number; // %
    maxBatterySOC: number; // %
  };
  /** Optimization parameters */
  optimization: {
    enabled: boolean;
    algorithm: 'genetic' | 'particle_swarm' | 'neural_network' | 'reinforcement_learning';
    updateInterval: number; // seconds
    convergenceThreshold: number;
  };
}

export interface EnergyDistributionConfig {
  /** Distribution strategy */
  strategy: DistributionStrategy;
  /** Priority levels for different loads */
  loadPriorities: Map<string, number>;
  /** Source preferences */
  sourcePreferences: Map<string, number>;
  /** Storage management settings */
  storageManagement: {
    chargingStrategy: 'constant_current' | 'constant_voltage' | 'adaptive';
    dischargingStrategy: 'load_following' | 'peak_shaving' | 'grid_support';
    balancingEnabled: boolean;
  };
  /** Power flow constraints */
  constraints: {
    maxSourcePower: Map<string, number>; // W
    maxLoadPower: Map<string, number>; // W
    maxStoragePower: Map<string, number>; // W
  };
}

export interface VehicleIntegrationConfig {
  /** Vehicle system interfaces */
  interfaces: {
    powertrainControl: boolean;
    batteryManagement: boolean;
    thermalManagement: boolean;
    chargingSystem: boolean;
    regenerativeBraking: boolean;
  };
  /** Communication settings */
  communication: {
    protocol: 'CAN' | 'LIN' | 'FlexRay' | 'Ethernet';
    baudRate: number;
    nodeId: number;
    messageIds: Map<string, number>;
  };
  /** Integration parameters */
  integration: {
    energySharing: boolean;
    loadBalancing: boolean;
    gridTieCapability: boolean;
    v2gEnabled: boolean; // Vehicle-to-Grid
  };
}

export interface ControlStrategyConfig {
  /** Base control strategy */
  baseStrategy: 'pid' | 'fuzzy' | 'model_predictive' | 'adaptive';
  /** Strategy parameters */
  parameters: {
    pid?: {
      kp: number;
      ki: number;
      kd: number;
      setpoint: number;
    };
    fuzzy?: {
      inputVariables: string[];
      outputVariables: string[];
      ruleBase: string[];
    };
    mpc?: {
      horizonLength: number;
      controlHorizon: number;
      weightMatrix: number[][];
    };
    adaptive?: {
      learningRate: number;
      adaptationThreshold: number;
      memoryLength: number;
    };
  };
  /** Adaptation settings */
  adaptation: {
    enabled: boolean;
    triggers: ('load_change' | 'efficiency_drop' | 'temperature_change' | 'driving_pattern')[];
    adaptationRate: number;
  };
}

export interface OptimizationConfig {
  /** Optimization objectives */
  objectives: OptimizationObjective[];
  /** Constraints */
  constraints: {
    efficiency: { min: number; max: number };
    power: { min: number; max: number };
    temperature: { min: number; max: number };
    cost: { max: number };
  };
  /** Algorithm settings */
  algorithm: {
    type: 'genetic' | 'particle_swarm' | 'simulated_annealing' | 'neural_network';
    populationSize?: number;
    generations?: number;
    learningRate?: number;
    convergenceThreshold: number;
  };
  /** Real-time optimization */
  realTime: {
    enabled: boolean;
    updateInterval: number; // ms
    maxExecutionTime: number; // ms
  };
}

export interface EnergyManagementInputs {
  /** Timestamp */
  timestamp: number;
  /** Energy sources data */
  sources: Map<string, {
    type: 'electromagnetic' | 'piezoelectric' | 'thermal' | 'mechanical';
    power: number; // W
    voltage: number; // V
    current: number; // A
    efficiency: number; // %
    temperature: number; // °C
    status: 'active' | 'standby' | 'fault';
  }>;
  /** Energy storage data */
  storage: Map<string, {
    type: 'battery' | 'supercapacitor' | 'flywheel';
    capacity: number; // Wh
    soc: number; // %
    power: number; // W (positive = charging, negative = discharging)
    voltage: number; // V
    current: number; // A
    temperature: number; // °C
    health: number; // %
    status: 'charging' | 'discharging' | 'idle' | 'fault';
  }>;
  /** Load demands */
  loads: Map<string, {
    type: 'critical' | 'essential' | 'optional';
    power: number; // W
    priority: number; // 1-10
    flexibility: number; // % (0 = inflexible, 100 = fully flexible)
    timeWindow?: [number, number]; // [start, end] timestamps
  }>;
  /** Vehicle state */
  vehicleState: {
    speed: number; // km/h
    acceleration: number; // m/s²
    roadCondition: 'smooth' | 'rough' | 'very_rough';
    drivingMode: 'eco' | 'normal' | 'sport' | 'off_road';
    batterySOC: number; // % (main vehicle battery)
    powerDemand: number; // W (total vehicle power demand)
  };
  /** Environmental conditions */
  environment: {
    temperature: number; // °C
    humidity: number; // %
    pressure: number; // Pa
    vibrationLevel: number; // m/s²
  };
  /** Predictions */
  predictions: {
    loadForecast: Map<string, number[]>; // W for next N time steps
    sourceForecast: Map<string, number[]>; // W for next N time steps
    drivingPattern: string; // 'city' | 'highway' | 'mixed' | 'stop_and_go'
    tripDuration: number; // minutes
  };
}

export interface EnergyManagementOutputs {
  /** Control commands for sources */
  sourceControls: Map<string, {
    powerSetpoint: number; // W
    voltageSetpoint: number; // V
    frequencySetpoint?: number; // Hz
    enableHarvesting: boolean;
    operatingMode: 'maximum_power' | 'maximum_efficiency' | 'constant_power';
  }>;
  /** Control commands for storage */
  storageControls: Map<string, {
    powerSetpoint: number; // W (positive = charge, negative = discharge)
    currentLimit: number; // A
    voltageLimit: number; // V
    operatingMode: 'charge' | 'discharge' | 'standby' | 'balance';
  }>;
  /** Load management commands */
  loadControls: Map<string, {
    powerAllocation: number; // W
    priority: number; // 1-10
    enableLoad: boolean;
    scheduledTime?: number; // timestamp for flexible loads
  }>;
  /** Vehicle integration commands */
  vehicleCommands: {
    energyShareRequest: number; // W (positive = request, negative = provide)
    regenerativeBrakingLevel: number; // %
    thermalManagementRequest: boolean;
    chargingSystemControl?: {
      enable: boolean;
      powerLevel: number; // W
    };
  };
  /** System status */
  systemStatus: {
    totalPowerGenerated: number; // W
    totalPowerConsumed: number; // W
    totalPowerStored: number; // W
    systemEfficiency: number; // %
    energyBalance: number; // W (positive = surplus, negative = deficit)
    operatingMode: 'normal' | 'efficiency' | 'power' | 'emergency';
    healthScore: number; // 0-1
  };
  /** Performance metrics */
  performance: ControlPerformanceMetrics;
  /** Recommendations */
  recommendations: string[];
  /** Warnings and alerts */
  warnings: string[];
  /** Next optimization time */
  nextOptimizationTime: number;
}

export interface EnergyFlowControl {
  /** Source to storage flows */
  sourceToStorage: Map<string, Map<string, number>>; // source -> storage -> power (W)
  /** Source to load flows */
  sourceToLoad: Map<string, Map<string, number>>; // source -> load -> power (W)
  /** Storage to load flows */
  storageToLoad: Map<string, Map<string, number>>; // storage -> load -> power (W)
  /** Grid interactions */
  gridFlow: {
    import: number; // W
    export: number; // W
    frequency: number; // Hz
    voltage: number; // V
  };
  /** Flow constraints */
  constraints: {
    maxFlowRate: Map<string, number>; // W
    minFlowRate: Map<string, number>; // W
    flowDirection: Map<string, 'bidirectional' | 'unidirectional'>;
  };
}

export interface SystemIntegrationStatus {
  /** Integration health */
  integrationHealth: number; // 0-1
  /** Communication status */
  communicationStatus: Map<string, {
    connected: boolean;
    latency: number; // ms
    errorRate: number; // %
    lastUpdate: number; // timestamp
  }>;
  /** Synchronization status */
  synchronization: {
    clockSync: boolean;
    dataSync: boolean;
    controlSync: boolean;
    syncError: number; // ms
  };
  /** Compatibility status */
  compatibility: {
    protocolVersion: string;
    firmwareVersion: string;
    configurationVersion: string;
    compatibilityScore: number; // 0-1
  };
}

export interface ControlPerformanceMetrics {
  /** Control accuracy */
  accuracy: {
    powerTracking: number; // % (how well actual follows setpoint)
    voltageRegulation: number; // % (voltage regulation accuracy)
    frequencyStability: number; // % (frequency stability)
  };
  /** Response characteristics */
  response: {
    settlingTime: number; // ms
    overshoot: number; // %
    steadyStateError: number; // %
    responseTime: number; // ms
  };
  /** Stability metrics */
  stability: {
    gainMargin: number; // dB
    phaseMargin: number; // degrees
    stabilityIndex: number; // 0-1
  };
  /** Efficiency metrics */
  efficiency: {
    controlEfficiency: number; // %
    systemEfficiency: number; // %
    energyLoss: number; // W
    lossBreakdown: Map<string, number>; // component -> loss (W)
  };
  /** Robustness metrics */
  robustness: {
    disturbanceRejection: number; // 0-1
    parameterSensitivity: number; // 0-1
    adaptability: number; // 0-1
  };
}

export interface EnergyManagementState {
  /** Current operating state */
  operatingState: 'startup' | 'normal' | 'optimization' | 'fault' | 'shutdown';
  /** Control mode */
  controlMode: 'manual' | 'automatic' | 'semi_automatic';
  /** Energy balance state */
  energyBalance: 'surplus' | 'balanced' | 'deficit' | 'critical';
  /** System health */
  systemHealth: {
    overall: number; // 0-1
    sources: Map<string, number>; // 0-1
    storage: Map<string, number>; // 0-1
    loads: Map<string, number>; // 0-1
    controllers: Map<string, number>; // 0-1
  };
  /** Active strategies */
  activeStrategies: {
    energyManagement: string;
    distribution: string;
    optimization: string;
    control: string;
  };
  /** State history */
  stateHistory: Array<{
    timestamp: number;
    state: string;
    reason: string;
    duration: number; // ms
  }>;
}

export type DistributionStrategy = 
  | 'priority_based'
  | 'efficiency_optimized'
  | 'load_balancing'
  | 'cost_minimized'
  | 'reliability_focused'
  | 'adaptive';

export interface OptimizationObjective {
  name: string;
  type: 'maximize' | 'minimize';
  weight: number; // 0-1
  target?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  constraints?: {
    min?: number;
    max?: number;
  };
}

export interface ControllerDiagnostics {
  /** Performance diagnostics */
  performance: {
    cpuUsage: number; // %
    memoryUsage: number; // %
    executionTime: number; // ms
    updateRate: number; // Hz
  };
  /** Communication diagnostics */
  communication: {
    messagesReceived: number;
    messagesSent: number;
    errorCount: number;
    latency: number; // ms
  };
  /** Algorithm diagnostics */
  algorithms: {
    convergenceRate: number; // %
    optimizationTime: number; // ms
    solutionQuality: number; // 0-1
    iterationCount: number;
  };
  /** System diagnostics */
  system: {
    temperature: number; // °C
    powerConsumption: number; // W
    faultCount: number;
    uptime: number; // hours
  };
}