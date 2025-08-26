/**
 * Energy Storage Controller
 * 
 * High-level controller that coordinates between suspension energy harvesting
 * systems and the energy storage system. Implements intelligent energy
 * management strategies and system optimization.
 */

import { SuspensionEnergyStorageSystem } from './SuspensionEnergyStorageSystem';
import { PowerManagementUnit } from './PowerManagementUnit';
import {
  SuspensionEnergyInputs,
  EnergyStorageOutputs,
  EnergyStorageSystemConfig,
  PerformanceMetrics,
  EnergyFlowMetrics,
  StorageSystemStatus
} from './types';

export interface ControllerConfig {
  /** Update frequency (Hz) */
  updateFrequency: number;
  /** Energy management strategy */
  energyStrategy: 'conservative' | 'balanced' | 'aggressive';
  /** Load prediction horizon (seconds) */
  predictionHorizon: number;
  /** Performance optimization weights */
  optimizationWeights: {
    efficiency: number;
    longevity: number;
    responsiveness: number;
    safety: number;
  };
}

export interface SystemIntegrationInputs extends SuspensionEnergyInputs {
  /** Predicted future load (W) */
  predictedLoad: number;
  /** Road condition forecast */
  roadConditionForecast: 'smooth' | 'rough' | 'very_rough';
  /** Trip duration estimate (minutes) */
  tripDurationEstimate: number;
  /** Energy priority level */
  energyPriority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ControllerOutputs extends EnergyStorageOutputs {
  /** Recommended harvesting mode */
  recommendedHarvestingMode: 'comfort' | 'balanced' | 'maximum_energy';
  /** System health score (0-1) */
  systemHealthScore: number;
  /** Energy management recommendations */
  recommendations: string[];
  /** Predicted energy availability (Wh) */
  predictedEnergyAvailability: number;
}

export class EnergyStorageController {
  private storageSystem: SuspensionEnergyStorageSystem;
  private powerManagement: PowerManagementUnit;
  private config: ControllerConfig;
  
  // Control state
  private lastUpdateTime: number = 0;
  private energyStrategy: EnergyManagementStrategy;
  private performanceOptimizer: PerformanceOptimizer;
  private predictiveController: PredictiveController;
  
  // System monitoring
  private systemHealth: SystemHealthMonitor;
  private energyForecaster: EnergyForecaster;
  
  constructor(
    storageSystemConfig: EnergyStorageSystemConfig,
    controllerConfig?: Partial<ControllerConfig>
  ) {
    this.config = {
      updateFrequency: 10, // 10 Hz
      energyStrategy: 'balanced',
      predictionHorizon: 300, // 5 minutes
      optimizationWeights: {
        efficiency: 0.3,
        longevity: 0.25,
        responsiveness: 0.25,
        safety: 0.2
      },
      ...controllerConfig
    };
    
    // Initialize subsystems
    this.storageSystem = new SuspensionEnergyStorageSystem(storageSystemConfig);
    this.powerManagement = new PowerManagementUnit(
      storageSystemConfig.capacitorBank,
      storageSystemConfig.batteryPack,
      storageSystemConfig.powerManagement
    );
    
    this.initializeControlSystems();
  }

  /**
   * Main control loop - processes inputs and generates outputs
   */
  public processControl(inputs: SystemIntegrationInputs): ControllerOutputs {
    const currentTime = Date.now();
    const deltaTime = this.lastUpdateTime > 0 ? (currentTime - this.lastUpdateTime) / 1000 : 0.1;
    this.lastUpdateTime = currentTime;
    
    // Update energy management strategy
    this.energyStrategy.updateStrategy(inputs, this.config.energyStrategy);
    
    // Process energy storage
    const storageOutputs = this.storageSystem.processEnergyStorage(inputs);
    
    // Get system status
    const systemStatus = this.storageSystem.getSystemStatus();
    
    // Update system health monitoring
    this.systemHealth.updateHealth(storageOutputs, systemStatus);
    
    // Generate energy forecast
    const energyForecast = this.energyForecaster.generateForecast(inputs, systemStatus);
    
    // Optimize performance
    const optimizationRecommendations = this.performanceOptimizer.optimize(
      storageOutputs,
      systemStatus,
      this.config.optimizationWeights
    );
    
    // Generate harvesting mode recommendation
    const harvestingMode = this.recommendHarvestingMode(inputs, systemStatus);
    
    // Calculate system health score
    const healthScore = this.systemHealth.getHealthScore();
    
    return {
      ...storageOutputs,
      recommendedHarvestingMode: harvestingMode,
      systemHealthScore: healthScore,
      recommendations: optimizationRecommendations,
      predictedEnergyAvailability: energyForecast.availableEnergy
    };
  }

  /**
   * Initialize control systems
   */
  private initializeControlSystems(): void {
    this.energyStrategy = new EnergyManagementStrategy();
    this.performanceOptimizer = new PerformanceOptimizer();
    this.predictiveController = new PredictiveController(this.config.predictionHorizon);
    this.systemHealth = new SystemHealthMonitor();
    this.energyForecaster = new EnergyForecaster();
  }

  /**
   * Recommend optimal harvesting mode
   */
  private recommendHarvestingMode(
    inputs: SystemIntegrationInputs,
    systemStatus: StorageSystemStatus
  ): 'comfort' | 'balanced' | 'maximum_energy' {
    
    // Consider energy priority
    if (inputs.energyPriority === 'critical' || systemStatus.batterySOC < 0.2) {
      return 'maximum_energy';
    }
    
    // Consider road conditions and trip duration
    if (inputs.roadConditionForecast === 'very_rough' && inputs.tripDurationEstimate > 30) {
      return 'maximum_energy';
    }
    
    // Consider current storage levels
    const totalSOC = (systemStatus.capacitorSOC + systemStatus.batterySOC) / 2;
    if (totalSOC < 0.3) {
      return 'maximum_energy';
    } else if (totalSOC > 0.8) {
      return 'comfort';
    }
    
    // Default to balanced mode
    return 'balanced';
  }

  /**
   * Get comprehensive system status
   */
  public getSystemStatus(): {
    storage: StorageSystemStatus;
    performance: PerformanceMetrics;
    energyFlow: EnergyFlowMetrics;
    health: number;
    recommendations: string[];
  } {
    return {
      storage: this.storageSystem.getSystemStatus(),
      performance: this.storageSystem.getPerformanceMetrics(),
      energyFlow: this.storageSystem.getEnergyFlowMetrics(),
      health: this.systemHealth.getHealthScore(),
      recommendations: this.performanceOptimizer.getRecommendations()
    };
  }

  /**
   * Update controller configuration
   */
  public updateConfiguration(newConfig: Partial<ControllerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.energyStrategy.updateConfiguration(this.config);
    this.performanceOptimizer.updateWeights(this.config.optimizationWeights);
  }

  /**
   * Emergency stop - safely shutdown the system
   */
  public emergencyStop(reason: string): void {
    this.storageSystem.emergencyShutdown(reason);
    console.log(`Energy Storage Controller: Emergency stop - ${reason}`);
  }

  /**
   * Restart system after emergency stop
   */
  public restart(): void {
    try {
      this.storageSystem.restartSystem();
      this.systemHealth.reset();
      console.log('Energy Storage Controller: System restarted successfully');
    } catch (error) {
      console.error('Energy Storage Controller: Failed to restart system', error);
      throw error;
    }
  }
}

/**
 * Energy Management Strategy
 */
class EnergyManagementStrategy {
  private currentStrategy: 'conservative' | 'balanced' | 'aggressive' = 'balanced';
  
  public updateStrategy(
    inputs: SystemIntegrationInputs,
    targetStrategy: 'conservative' | 'balanced' | 'aggressive'
  ): void {
    this.currentStrategy = targetStrategy;
    
    // Adjust strategy based on conditions
    if (inputs.energyPriority === 'critical') {
      this.currentStrategy = 'aggressive';
    } else if (inputs.vehicleSpeed < 30) {
      this.currentStrategy = 'conservative';
    }
  }
  
  public updateConfiguration(config: ControllerConfig): void {
    // Update strategy parameters based on configuration
  }
  
  public getCurrentStrategy(): 'conservative' | 'balanced' | 'aggressive' {
    return this.currentStrategy;
  }
}

/**
 * Performance Optimizer
 */
class PerformanceOptimizer {
  private recommendations: string[] = [];
  private optimizationWeights = {
    efficiency: 0.3,
    longevity: 0.25,
    responsiveness: 0.25,
    safety: 0.2
  };
  
  public optimize(
    outputs: EnergyStorageOutputs,
    status: StorageSystemStatus,
    weights: typeof this.optimizationWeights
  ): string[] {
    this.optimizationWeights = weights;
    this.recommendations = [];
    
    // Efficiency optimization
    if (outputs.efficiency < 0.85) {
      this.recommendations.push('Consider reducing power transfer rates to improve efficiency');
    }
    
    // Longevity optimization
    if (status.batterySOC > 0.9 || status.batterySOC < 0.1) {
      this.recommendations.push('Battery SOC outside optimal range - adjust charging strategy');
    }
    
    // Responsiveness optimization
    if (status.capacitorSOC < 0.3) {
      this.recommendations.push('Low capacitor charge may reduce system responsiveness');
    }
    
    // Safety optimization
    if (status.systemTemperature > 60) {
      this.recommendations.push('System temperature elevated - consider reducing power levels');
    }
    
    return [...this.recommendations];
  }
  
  public updateWeights(weights: typeof this.optimizationWeights): void {
    this.optimizationWeights = weights;
  }
  
  public getRecommendations(): string[] {
    return [...this.recommendations];
  }
}

/**
 * Predictive Controller
 */
class PredictiveController {
  private predictionHorizon: number;
  private powerHistory: Array<{ timestamp: number; power: number }> = [];
  
  constructor(predictionHorizon: number) {
    this.predictionHorizon = predictionHorizon;
  }
  
  public predictFuturePower(inputs: SystemIntegrationInputs): number {
    // Add current power to history
    this.powerHistory.push({
      timestamp: Date.now(),
      power: inputs.inputPower
    });
    
    // Keep only relevant history
    const cutoffTime = Date.now() - this.predictionHorizon * 1000;
    this.powerHistory = this.powerHistory.filter(entry => entry.timestamp > cutoffTime);
    
    if (this.powerHistory.length < 5) {
      return inputs.inputPower;
    }
    
    // Simple moving average prediction
    const recentPowers = this.powerHistory.slice(-10).map(entry => entry.power);
    const averagePower = recentPowers.reduce((sum, power) => sum + power, 0) / recentPowers.length;
    
    // Adjust based on road conditions
    let adjustmentFactor = 1.0;
    switch (inputs.roadConditionForecast) {
      case 'smooth':
        adjustmentFactor = 0.7;
        break;
      case 'rough':
        adjustmentFactor = 1.2;
        break;
      case 'very_rough':
        adjustmentFactor = 1.5;
        break;
    }
    
    return averagePower * adjustmentFactor;
  }
}

/**
 * System Health Monitor
 */
class SystemHealthMonitor {
  private healthScore: number = 1.0;
  private healthHistory: Array<{ timestamp: number; score: number }> = [];
  
  public updateHealth(outputs: EnergyStorageOutputs, status: StorageSystemStatus): void {
    let score = 1.0;
    
    // Reduce score for alarms and warnings
    score -= status.alarms.length * 0.2;
    score -= status.warnings.length * 0.1;
    
    // Reduce score for poor efficiency
    if (outputs.efficiency < 0.8) {
      score -= (0.8 - outputs.efficiency) * 0.5;
    }
    
    // Reduce score for temperature issues
    if (status.systemTemperature > 70) {
      score -= (status.systemTemperature - 70) * 0.01;
    }
    
    // Ensure score is between 0 and 1
    this.healthScore = Math.max(0, Math.min(1, score));
    
    // Add to history
    this.healthHistory.push({
      timestamp: Date.now(),
      score: this.healthScore
    });
    
    // Keep only last 24 hours
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000;
    this.healthHistory = this.healthHistory.filter(entry => entry.timestamp > cutoffTime);
  }
  
  public getHealthScore(): number {
    return this.healthScore;
  }
  
  public getHealthTrend(): 'improving' | 'stable' | 'degrading' {
    if (this.healthHistory.length < 10) return 'stable';
    
    const recent = this.healthHistory.slice(-5).map(entry => entry.score);
    const older = this.healthHistory.slice(-10, -5).map(entry => entry.score);
    
    const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
    const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 0.05) return 'improving';
    if (difference < -0.05) return 'degrading';
    return 'stable';
  }
  
  public reset(): void {
    this.healthScore = 1.0;
    this.healthHistory = [];
  }
}

/**
 * Energy Forecaster
 */
class EnergyForecaster {
  public generateForecast(
    inputs: SystemIntegrationInputs,
    status: StorageSystemStatus
  ): { availableEnergy: number; forecastHorizon: number } {
    
    // Calculate current available energy
    const currentEnergy = status.capacitorSOC * 0.1 + status.batterySOC * 10; // Simplified calculation
    
    // Estimate energy generation potential
    let generationPotential = 0;
    if (inputs.tripDurationEstimate > 0) {
      const avgPowerGeneration = inputs.inputPower * 0.7; // Conservative estimate
      generationPotential = (avgPowerGeneration * inputs.tripDurationEstimate) / 60 / 1000; // Convert to Wh
    }
    
    // Estimate energy consumption
    const avgConsumption = inputs.loadDemand * 0.8; // Conservative estimate
    const consumptionEstimate = (avgConsumption * inputs.tripDurationEstimate) / 60 / 1000; // Convert to Wh
    
    // Net available energy
    const availableEnergy = currentEnergy + generationPotential - consumptionEstimate;
    
    return {
      availableEnergy: Math.max(0, availableEnergy),
      forecastHorizon: inputs.tripDurationEstimate
    };
  }
}