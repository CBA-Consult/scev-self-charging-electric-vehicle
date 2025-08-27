/**
 * Adaptive Control Strategy
 * 
 * Implements adaptive control algorithms that adjust to changing driving conditions,
 * energy demands, and system performance to optimize energy management.
 */

import {
  EnergyManagementConfig,
  EnergyManagementInputs,
  EnergyManagementOutputs,
  EnergyFlowControl,
  ControlStrategyConfig
} from './types';

export interface ControlState {
  currentStrategy: 'pid' | 'fuzzy' | 'model_predictive' | 'adaptive';
  adaptationLevel: number; // 0-1
  performanceScore: number; // 0-1
  stabilityIndex: number; // 0-1
  responseTime: number; // ms
  lastAdaptation: number; // timestamp
}

export interface AdaptationTrigger {
  type: 'load_change' | 'efficiency_drop' | 'temperature_change' | 'driving_pattern';
  threshold: number;
  currentValue: number;
  triggered: boolean;
  timestamp: number;
}

export class AdaptiveControlStrategy {
  private config: EnergyManagementConfig;
  private strategyConfig: ControlStrategyConfig;
  private controlState: ControlState;
  private adaptationTriggers: Map<string, AdaptationTrigger> = new Map();
  
  // Control algorithms
  private pidController: PIDController;
  private fuzzyController: FuzzyController;
  private mpcController: ModelPredictiveController;
  private adaptiveController: AdaptiveController;
  
  // Performance tracking
  private performanceHistory: Array<{
    timestamp: number;
    strategy: string;
    performance: number;
    efficiency: number;
    responseTime: number;
  }> = [];

  constructor(config: EnergyManagementConfig) {
    this.config = config;
    this.initializeStrategyConfig();
    this.initializeControlState();
    this.initializeControllers();
    this.initializeAdaptationTriggers();
  }

  /**
   * Initialize strategy configuration
   */
  private initializeStrategyConfig(): void {
    this.strategyConfig = {
      baseStrategy: 'adaptive',
      parameters: {
        pid: {
          kp: 1.0,
          ki: 0.1,
          kd: 0.01,
          setpoint: 0
        },
        fuzzy: {
          inputVariables: ['power_demand', 'energy_balance', 'efficiency'],
          outputVariables: ['power_allocation', 'charging_rate'],
          ruleBase: [
            'IF power_demand is HIGH AND energy_balance is LOW THEN power_allocation is MAXIMUM',
            'IF efficiency is LOW THEN charging_rate is REDUCED',
            'IF energy_balance is HIGH THEN power_allocation is BALANCED'
          ]
        },
        mpc: {
          horizonLength: 10,
          controlHorizon: 5,
          weightMatrix: [[1, 0], [0, 1]]
        },
        adaptive: {
          learningRate: 0.1,
          adaptationThreshold: 0.05,
          memoryLength: 100
        }
      },
      adaptation: {
        enabled: true,
        triggers: ['load_change', 'efficiency_drop', 'temperature_change', 'driving_pattern'],
        adaptationRate: 0.1
      }
    };
  }

  /**
   * Initialize control state
   */
  private initializeControlState(): void {
    this.controlState = {
      currentStrategy: this.strategyConfig.baseStrategy,
      adaptationLevel: 0.5,
      performanceScore: 1.0,
      stabilityIndex: 1.0,
      responseTime: 0,
      lastAdaptation: Date.now()
    };
  }

  /**
   * Initialize control algorithms
   */
  private initializeControllers(): void {
    this.pidController = new PIDController(this.strategyConfig.parameters.pid!);
    this.fuzzyController = new FuzzyController(this.strategyConfig.parameters.fuzzy!);
    this.mpcController = new ModelPredictiveController(this.strategyConfig.parameters.mpc!);
    this.adaptiveController = new AdaptiveController(this.strategyConfig.parameters.adaptive!);
  }

  /**
   * Initialize adaptation triggers
   */
  private initializeAdaptationTriggers(): void {
    const triggers = [
      { type: 'load_change', threshold: 0.2 }, // 20% change in load
      { type: 'efficiency_drop', threshold: 0.1 }, // 10% efficiency drop
      { type: 'temperature_change', threshold: 10 }, // 10°C change
      { type: 'driving_pattern', threshold: 0.3 } // 30% change in pattern
    ];

    for (const trigger of triggers) {
      this.adaptationTriggers.set(trigger.type, {
        type: trigger.type as any,
        threshold: trigger.threshold,
        currentValue: 0,
        triggered: false,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Execute control strategy
   */
  public async executeStrategy(
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl
  ): Promise<EnergyManagementOutputs> {
    const startTime = Date.now();

    // Check for adaptation triggers
    await this.checkAdaptationTriggers(inputs);

    // Select optimal control strategy
    const selectedStrategy = await this.selectOptimalStrategy(inputs, energyFlow);

    // Execute selected strategy
    const outputs = await this.executeSelectedStrategy(selectedStrategy, inputs, energyFlow);

    // Update performance metrics
    this.updatePerformanceMetrics(inputs, outputs, startTime);

    // Adapt if necessary
    if (this.strategyConfig.adaptation.enabled) {
      await this.adaptStrategy(inputs, outputs);
    }

    return outputs;
  }

  /**
   * Check adaptation triggers
   */
  private async checkAdaptationTriggers(inputs: EnergyManagementInputs): Promise<void> {
    // Check load change trigger
    const totalLoad = Array.from(inputs.loads.values()).reduce((sum, load) => sum + load.power, 0);
    const loadChangeTrigger = this.adaptationTriggers.get('load_change')!;
    const loadChange = Math.abs(totalLoad - loadChangeTrigger.currentValue) / Math.max(totalLoad, 1);
    
    if (loadChange > loadChangeTrigger.threshold) {
      loadChangeTrigger.triggered = true;
      loadChangeTrigger.timestamp = Date.now();
    }
    loadChangeTrigger.currentValue = totalLoad;

    // Check efficiency drop trigger
    const avgEfficiency = Array.from(inputs.sources.values())
      .reduce((sum, source) => sum + source.efficiency, 0) / inputs.sources.size;
    const efficiencyTrigger = this.adaptationTriggers.get('efficiency_drop')!;
    const efficiencyDrop = (efficiencyTrigger.currentValue - avgEfficiency) / Math.max(efficiencyTrigger.currentValue, 1);
    
    if (efficiencyDrop > efficiencyTrigger.threshold) {
      efficiencyTrigger.triggered = true;
      efficiencyTrigger.timestamp = Date.now();
    }
    efficiencyTrigger.currentValue = avgEfficiency;

    // Check temperature change trigger
    const avgTemp = Array.from(inputs.sources.values())
      .reduce((sum, source) => sum + source.temperature, 0) / inputs.sources.size;
    const tempTrigger = this.adaptationTriggers.get('temperature_change')!;
    const tempChange = Math.abs(avgTemp - tempTrigger.currentValue);
    
    if (tempChange > tempTrigger.threshold) {
      tempTrigger.triggered = true;
      tempTrigger.timestamp = Date.now();
    }
    tempTrigger.currentValue = avgTemp;

    // Check driving pattern trigger
    const drivingPatternScore = this.calculateDrivingPatternScore(inputs);
    const patternTrigger = this.adaptationTriggers.get('driving_pattern')!;
    const patternChange = Math.abs(drivingPatternScore - patternTrigger.currentValue);
    
    if (patternChange > patternTrigger.threshold) {
      patternTrigger.triggered = true;
      patternTrigger.timestamp = Date.now();
    }
    patternTrigger.currentValue = drivingPatternScore;
  }

  /**
   * Calculate driving pattern score
   */
  private calculateDrivingPatternScore(inputs: EnergyManagementInputs): number {
    let score = 0;

    // Speed factor
    if (inputs.vehicleState.speed < 30) score += 0.2; // City driving
    else if (inputs.vehicleState.speed < 80) score += 0.5; // Mixed driving
    else score += 0.8; // Highway driving

    // Acceleration factor
    if (Math.abs(inputs.vehicleState.acceleration) > 2) score += 0.3; // Aggressive
    else if (Math.abs(inputs.vehicleState.acceleration) > 1) score += 0.2; // Moderate
    else score += 0.1; // Gentle

    // Road condition factor
    switch (inputs.vehicleState.roadCondition) {
      case 'smooth': score += 0.1; break;
      case 'rough': score += 0.2; break;
      case 'very_rough': score += 0.3; break;
    }

    // Driving mode factor
    switch (inputs.vehicleState.drivingMode) {
      case 'eco': score += 0.1; break;
      case 'normal': score += 0.2; break;
      case 'sport': score += 0.4; break;
      case 'off_road': score += 0.5; break;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Select optimal control strategy
   */
  private async selectOptimalStrategy(
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl
  ): Promise<'pid' | 'fuzzy' | 'model_predictive' | 'adaptive'> {
    // Check if any adaptation triggers are active
    const activeTriggersCount = Array.from(this.adaptationTriggers.values())
      .filter(trigger => trigger.triggered).length;

    if (activeTriggersCount > 2) {
      // Multiple triggers active - use adaptive control
      return 'adaptive';
    }

    // Analyze system characteristics to select best strategy
    const systemComplexity = this.calculateSystemComplexity(inputs);
    const dynamicBehavior = this.calculateDynamicBehavior(inputs);
    const uncertaintyLevel = this.calculateUncertaintyLevel(inputs);

    if (uncertaintyLevel > 0.7) {
      return 'adaptive';
    } else if (systemComplexity > 0.8 && dynamicBehavior > 0.6) {
      return 'model_predictive';
    } else if (systemComplexity > 0.5) {
      return 'fuzzy';
    } else {
      return 'pid';
    }
  }

  /**
   * Calculate system complexity
   */
  private calculateSystemComplexity(inputs: EnergyManagementInputs): number {
    const sourceCount = inputs.sources.size;
    const storageCount = inputs.storage.size;
    const loadCount = inputs.loads.size;
    
    // Normalize complexity based on component count
    const complexity = (sourceCount + storageCount + loadCount) / 20; // Assume max 20 components
    
    return Math.min(complexity, 1.0);
  }

  /**
   * Calculate dynamic behavior
   */
  private calculateDynamicBehavior(inputs: EnergyManagementInputs): number {
    let dynamicScore = 0;

    // Speed variation
    if (Math.abs(inputs.vehicleState.acceleration) > 1) {
      dynamicScore += 0.3;
    }

    // Power variation
    const powerVariation = Array.from(inputs.sources.values())
      .reduce((sum, source) => sum + Math.abs(source.power - 500), 0) / inputs.sources.size / 500;
    dynamicScore += Math.min(powerVariation, 0.4);

    // Load variation
    const loadVariation = Array.from(inputs.loads.values())
      .reduce((sum, load) => sum + (load.flexibility / 100), 0) / inputs.loads.size;
    dynamicScore += loadVariation * 0.3;

    return Math.min(dynamicScore, 1.0);
  }

  /**
   * Calculate uncertainty level
   */
  private calculateUncertaintyLevel(inputs: EnergyManagementInputs): number {
    let uncertaintyScore = 0;

    // Environmental uncertainty
    if (inputs.environment.vibrationLevel > 5) {
      uncertaintyScore += 0.2;
    }

    // Prediction uncertainty
    const predictionVariance = inputs.predictions.loadForecast.size > 0 ? 0.1 : 0.3;
    uncertaintyScore += predictionVariance;

    // System health uncertainty
    const avgSourceHealth = Array.from(inputs.sources.values())
      .reduce((sum, source) => sum + (source.status === 'active' ? 1 : 0), 0) / inputs.sources.size;
    uncertaintyScore += (1 - avgSourceHealth) * 0.4;

    return Math.min(uncertaintyScore, 1.0);
  }

  /**
   * Execute selected strategy
   */
  private async executeSelectedStrategy(
    strategy: 'pid' | 'fuzzy' | 'model_predictive' | 'adaptive',
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl
  ): Promise<EnergyManagementOutputs> {
    this.controlState.currentStrategy = strategy;

    switch (strategy) {
      case 'pid':
        return this.pidController.execute(inputs, energyFlow);
      case 'fuzzy':
        return this.fuzzyController.execute(inputs, energyFlow);
      case 'model_predictive':
        return this.mpcController.execute(inputs, energyFlow);
      case 'adaptive':
        return this.adaptiveController.execute(inputs, energyFlow);
      default:
        throw new Error(`Unknown control strategy: ${strategy}`);
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(
    inputs: EnergyManagementInputs,
    outputs: EnergyManagementOutputs,
    startTime: number
  ): void {
    const responseTime = Date.now() - startTime;
    this.controlState.responseTime = responseTime;

    // Calculate performance score
    const efficiency = outputs.systemStatus.systemEfficiency / 100;
    const energyBalance = Math.abs(outputs.systemStatus.energyBalance) / 1000; // Normalize to kW
    const performanceScore = efficiency * (1 - Math.min(energyBalance, 1));

    this.controlState.performanceScore = performanceScore;

    // Update stability index based on response time consistency
    const avgResponseTime = this.performanceHistory.length > 0 
      ? this.performanceHistory.reduce((sum, entry) => sum + entry.responseTime, 0) / this.performanceHistory.length
      : responseTime;
    
    const responseVariation = Math.abs(responseTime - avgResponseTime) / Math.max(avgResponseTime, 1);
    this.controlState.stabilityIndex = Math.max(0, 1 - responseVariation);

    // Add to performance history
    this.performanceHistory.push({
      timestamp: Date.now(),
      strategy: this.controlState.currentStrategy,
      performance: performanceScore,
      efficiency: efficiency,
      responseTime: responseTime
    });

    // Keep only last 100 entries
    if (this.performanceHistory.length > 100) {
      this.performanceHistory = this.performanceHistory.slice(-100);
    }
  }

  /**
   * Adapt strategy based on performance
   */
  private async adaptStrategy(
    inputs: EnergyManagementInputs,
    outputs: EnergyManagementOutputs
  ): Promise<void> {
    const currentTime = Date.now();
    const timeSinceLastAdaptation = currentTime - this.controlState.lastAdaptation;

    // Only adapt if enough time has passed
    if (timeSinceLastAdaptation < 5000) { // 5 seconds minimum
      return;
    }

    // Check if adaptation is needed
    const adaptationNeeded = this.isAdaptationNeeded();

    if (adaptationNeeded) {
      // Increase adaptation level
      this.controlState.adaptationLevel = Math.min(
        this.controlState.adaptationLevel + this.strategyConfig.adaptation.adaptationRate,
        1.0
      );

      // Adapt controller parameters
      await this.adaptControllerParameters(inputs, outputs);

      this.controlState.lastAdaptation = currentTime;

      // Reset adaptation triggers
      for (const trigger of this.adaptationTriggers.values()) {
        trigger.triggered = false;
      }
    } else {
      // Decrease adaptation level gradually
      this.controlState.adaptationLevel = Math.max(
        this.controlState.adaptationLevel - this.strategyConfig.adaptation.adaptationRate * 0.1,
        0.0
      );
    }
  }

  /**
   * Check if adaptation is needed
   */
  private isAdaptationNeeded(): boolean {
    // Check if any triggers are active
    const activeTriggersCount = Array.from(this.adaptationTriggers.values())
      .filter(trigger => trigger.triggered).length;

    if (activeTriggersCount > 0) {
      return true;
    }

    // Check performance degradation
    if (this.controlState.performanceScore < 0.7) {
      return true;
    }

    // Check stability issues
    if (this.controlState.stabilityIndex < 0.8) {
      return true;
    }

    // Check response time issues
    if (this.controlState.responseTime > 100) { // 100ms threshold
      return true;
    }

    return false;
  }

  /**
   * Adapt controller parameters
   */
  private async adaptControllerParameters(
    inputs: EnergyManagementInputs,
    outputs: EnergyManagementOutputs
  ): Promise<void> {
    const adaptationRate = this.strategyConfig.adaptation.adaptationRate;

    // Adapt PID parameters
    if (this.controlState.currentStrategy === 'pid') {
      const pidParams = this.strategyConfig.parameters.pid!;
      
      if (this.controlState.performanceScore < 0.8) {
        pidParams.kp *= (1 + adaptationRate);
        pidParams.ki *= (1 + adaptationRate * 0.5);
      }
      
      if (this.controlState.stabilityIndex < 0.8) {
        pidParams.kd *= (1 + adaptationRate);
      }

      this.pidController.updateParameters(pidParams);
    }

    // Adapt fuzzy parameters
    if (this.controlState.currentStrategy === 'fuzzy') {
      // Adapt fuzzy rule weights based on performance
      this.fuzzyController.adaptRuleWeights(this.controlState.performanceScore);
    }

    // Adapt MPC parameters
    if (this.controlState.currentStrategy === 'model_predictive') {
      const mpcParams = this.strategyConfig.parameters.mpc!;
      
      if (this.controlState.responseTime > 50) {
        mpcParams.horizonLength = Math.max(mpcParams.horizonLength - 1, 5);
      } else if (this.controlState.performanceScore < 0.8) {
        mpcParams.horizonLength = Math.min(mpcParams.horizonLength + 1, 20);
      }

      this.mpcController.updateParameters(mpcParams);
    }

    // Adapt adaptive controller parameters
    if (this.controlState.currentStrategy === 'adaptive') {
      const adaptiveParams = this.strategyConfig.parameters.adaptive!;
      
      if (this.controlState.performanceScore < 0.8) {
        adaptiveParams.learningRate = Math.min(adaptiveParams.learningRate * 1.1, 0.5);
      } else {
        adaptiveParams.learningRate = Math.max(adaptiveParams.learningRate * 0.95, 0.01);
      }

      this.adaptiveController.updateParameters(adaptiveParams);
    }
  }

  /**
   * Get control state
   */
  public getControlState(): ControlState {
    return { ...this.controlState };
  }

  /**
   * Get adaptation triggers
   */
  public getAdaptationTriggers(): Map<string, AdaptationTrigger> {
    return new Map(this.adaptationTriggers);
  }

  /**
   * Get performance history
   */
  public getPerformanceHistory(): typeof this.performanceHistory {
    return [...this.performanceHistory];
  }

  /**
   * Update configuration
   */
  public updateConfiguration(config: EnergyManagementConfig): void {
    this.config = config;
    // Update strategy configuration based on new config
  }

  /**
   * Shutdown
   */
  public shutdown(): void {
    console.log('Adaptive Control Strategy: Shutdown complete');
  }
}

// Controller implementations (simplified for brevity)
class PIDController {
  private parameters: any;
  private integral = 0;
  private previousError = 0;

  constructor(parameters: any) {
    this.parameters = parameters;
  }

  async execute(inputs: EnergyManagementInputs, energyFlow: EnergyFlowControl): Promise<EnergyManagementOutputs> {
    // Simplified PID implementation
    const error = this.calculateError(inputs);
    this.integral += error;
    const derivative = error - this.previousError;
    
    const output = this.parameters.kp * error + this.parameters.ki * this.integral + this.parameters.kd * derivative;
    this.previousError = error;

    return this.generateOutputs(inputs, output);
  }

  private calculateError(inputs: EnergyManagementInputs): number {
    const totalGeneration = Array.from(inputs.sources.values()).reduce((sum, s) => sum + s.power, 0);
    const totalConsumption = Array.from(inputs.loads.values()).reduce((sum, l) => sum + l.power, 0);
    return totalGeneration - totalConsumption;
  }

  private generateOutputs(inputs: EnergyManagementInputs, controlOutput: number): EnergyManagementOutputs {
    // Generate basic outputs based on control signal
    return {
      sourceControls: new Map(),
      storageControls: new Map(),
      loadControls: new Map(),
      vehicleCommands: {
        energyShareRequest: 0,
        regenerativeBrakingLevel: 50,
        thermalManagementRequest: false
      },
      systemStatus: {
        totalPowerGenerated: 0,
        totalPowerConsumed: 0,
        totalPowerStored: 0,
        systemEfficiency: 85,
        energyBalance: controlOutput,
        operatingMode: 'normal',
        healthScore: 0.9
      },
      performance: {} as any,
      recommendations: [],
      warnings: [],
      nextOptimizationTime: Date.now() + 1000
    };
  }

  updateParameters(parameters: any): void {
    this.parameters = parameters;
  }
}

class FuzzyController {
  private parameters: any;

  constructor(parameters: any) {
    this.parameters = parameters;
  }

  async execute(inputs: EnergyManagementInputs, energyFlow: EnergyFlowControl): Promise<EnergyManagementOutputs> {
    // Simplified fuzzy logic implementation
    return this.generateOutputs(inputs);
  }

  private generateOutputs(inputs: EnergyManagementInputs): EnergyManagementOutputs {
    return {
      sourceControls: new Map(),
      storageControls: new Map(),
      loadControls: new Map(),
      vehicleCommands: {
        energyShareRequest: 0,
        regenerativeBrakingLevel: 50,
        thermalManagementRequest: false
      },
      systemStatus: {
        totalPowerGenerated: 0,
        totalPowerConsumed: 0,
        totalPowerStored: 0,
        systemEfficiency: 85,
        energyBalance: 0,
        operatingMode: 'normal',
        healthScore: 0.9
      },
      performance: {} as any,
      recommendations: [],
      warnings: [],
      nextOptimizationTime: Date.now() + 1000
    };
  }

  adaptRuleWeights(performanceScore: number): void {
    // Adapt fuzzy rule weights based on performance
  }
}

class ModelPredictiveController {
  private parameters: any;

  constructor(parameters: any) {
    this.parameters = parameters;
  }

  async execute(inputs: EnergyManagementInputs, energyFlow: EnergyFlowControl): Promise<EnergyManagementOutputs> {
    // Simplified MPC implementation
    return this.generateOutputs(inputs);
  }

  private generateOutputs(inputs: EnergyManagementInputs): EnergyManagementOutputs {
    return {
      sourceControls: new Map(),
      storageControls: new Map(),
      loadControls: new Map(),
      vehicleCommands: {
        energyShareRequest: 0,
        regenerativeBrakingLevel: 50,
        thermalManagementRequest: false
      },
      systemStatus: {
        totalPowerGenerated: 0,
        totalPowerConsumed: 0,
        totalPowerStored: 0,
        systemEfficiency: 85,
        energyBalance: 0,
        operatingMode: 'normal',
        healthScore: 0.9
      },
      performance: {} as any,
      recommendations: [],
      warnings: [],
      nextOptimizationTime: Date.now() + 1000
    };
  }

  updateParameters(parameters: any): void {
    this.parameters = parameters;
  }
}

class AdaptiveController {
  private parameters: any;

  constructor(parameters: any) {
    this.parameters = parameters;
  }

  async execute(inputs: EnergyManagementInputs, energyFlow: EnergyFlowControl): Promise<EnergyManagementOutputs> {
    // Simplified adaptive control implementation
    return this.generateOutputs(inputs);
  }

  private generateOutputs(inputs: EnergyManagementInputs): EnergyManagementOutputs {
    return {
      sourceControls: new Map(),
      storageControls: new Map(),
      loadControls: new Map(),
      vehicleCommands: {
        energyShareRequest: 0,
        regenerativeBrakingLevel: 50,
        thermalManagementRequest: false
      },
      systemStatus: {
        totalPowerGenerated: 0,
        totalPowerConsumed: 0,
        totalPowerStored: 0,
        systemEfficiency: 85,
        energyBalance: 0,
        operatingMode: 'normal',
        healthScore: 0.9
      },
      performance: {} as any,
      recommendations: [],
      warnings: [],
      nextOptimizationTime: Date.now() + 1000
    };
  }

  updateParameters(parameters: any): void {
    this.parameters = parameters;
  }
}