/**
 * Wind Energy Grid Integration System
 * 
 * Main controller for integrating wind energy into the national grid,
 * managing grid stability, energy storage, and demand response.
 */

import { GridStabilityManager, type StabilityParameters } from './GridStabilityManager';
import { WindEnergyStorageCoordinator, type StorageSystemConfig } from './WindEnergyStorageCoordinator';
import { DemandResponseManager, type DemandResponseConfig } from './DemandResponseManager';
import { RegulatoryComplianceManager, type PolicyFramework } from './RegulatoryComplianceManager';
import { WindFarmController, type WindFarmConfiguration } from './WindFarmController';

export interface GridIntegrationInputs {
  currentGridLoad: number; // Current grid load in watts
  windGeneration: number; // Current wind generation in watts
  windForecast: WindForecastData;
  gridFrequency: number; // Grid frequency in Hz
  gridVoltage: number; // Grid voltage in volts
  storageSOC: number; // Storage state of charge (0-1)
  demandForecast: {
    peak: number;
    valley: number;
    rampRate: number;
  };
  weatherConditions: {
    temperature: number;
    humidity: number;
    pressure: number;
    visibility: number;
  };
  marketConditions: {
    electricityPrice: number;
    carbonPrice: number;
    renewableIncentive: number;
  };
}

export interface GridIntegrationOutputs {
  windPowerDispatch: number; // Dispatched wind power in watts
  storageCommand: {
    mode: 'charge' | 'discharge' | 'standby';
    power: number; // Storage power command in watts
    duration: number; // Command duration in seconds
  };
  demandResponseSignal: {
    type: 'curtail' | 'increase' | 'maintain';
    magnitude: number; // Percentage change in demand
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  gridStabilityMetrics: GridStabilityMetrics;
  economicMetrics: {
    revenueGenerated: number; // Revenue in currency units
    carbonReduction: number; // CO2 reduction in kg
    gridServiceValue: number; // Value of grid services provided
  };
  systemStatus: {
    overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    windIntegrationLevel: number; // Current wind penetration (0-1)
    gridStabilityStatus: 'stable' | 'marginal' | 'unstable';
    storageUtilization: number; // Storage utilization (0-1)
  };
  recommendations: {
    shortTerm: string[]; // Immediate actions (next hour)
    mediumTerm: string[]; // Actions for next 24 hours
    longTerm: string[]; // Strategic recommendations
  };
}

export interface GridStabilityMetrics {
  frequencyDeviation: number; // Frequency deviation from nominal in Hz
  voltageDeviation: number; // Voltage deviation from nominal (percentage)
  rampRate: number; // Current power ramp rate in MW/min
  inertiaLevel: number; // System inertia in seconds
  stabilityMargin: number; // Overall stability margin (0-1)
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface WindForecastData {
  hourly: Array<{
    hour: number;
    windSpeed: number;
    expectedPower: number;
    confidence: number;
  }>;
  daily: Array<{
    day: number;
    averageWindSpeed: number;
    expectedEnergy: number;
    confidence: number;
  }>;
}

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

export class WindEnergyGridIntegration {
  private gridStabilityManager: GridStabilityManager;
  private storageCoordinator: WindEnergyStorageCoordinator;
  private demandResponseManager: DemandResponseManager;
  private complianceManager: RegulatoryComplianceManager;
  private windFarmController: WindFarmController;
  
  private config: GridIntegrationConfig;
  private performanceHistory: Array<{
    timestamp: number;
    windPenetration: number;
    gridStability: number;
    economicValue: number;
  }> = [];

  constructor(
    config: GridIntegrationConfig,
    storageConfig?: StorageSystemConfig,
    policyFramework?: PolicyFramework
  ) {
    this.config = config;
    
    // Initialize subsystem managers
    this.gridStabilityManager = new GridStabilityManager({
      nominalFrequency: config.gridFrequency,
      nominalVoltage: config.voltageLevel,
      stabilityMargins: config.stabilityMargins
    });
    
    this.storageCoordinator = new WindEnergyStorageCoordinator(
      storageConfig || this.createDefaultStorageConfig()
    );
    
    this.demandResponseManager = new DemandResponseManager({
      maxDemandReduction: 0.15, // 15% maximum demand reduction
      responseTime: 300, // 5 minutes response time
      participationRate: 0.3 // 30% of loads participate
    });
    
    this.complianceManager = new RegulatoryComplianceManager(
      policyFramework || this.createDefaultPolicyFramework()
    );
    
    this.windFarmController = new WindFarmController({
      totalCapacity: config.gridCapacity * config.windPenetrationTarget,
      turbineCount: 100,
      turbineRating: (config.gridCapacity * config.windPenetrationTarget) / 100,
      hubHeight: 120,
      rotorDiameter: 120,
      cutInSpeed: 3,
      ratedSpeed: 12,
      cutOutSpeed: 25,
      powerCurveOptimization: true,
      wakeEffectMitigation: true,
      gridConnectionVoltage: 33000
    });
  }

  /**
   * Main processing function for wind energy grid integration
   */
  public processGridIntegration(inputs: GridIntegrationInputs): GridIntegrationOutputs {
    try {
      // Assess current grid conditions
      const gridStabilityMetrics = this.assessGridStability(inputs);
      
      // Optimize wind power dispatch
      const windDispatch = this.optimizeWindDispatch(inputs, gridStabilityMetrics);
      
      // Coordinate energy storage
      const storageCommand = this.coordinateEnergyStorage(inputs, windDispatch, gridStabilityMetrics);
      
      // Manage demand response
      const demandResponseSignal = this.manageDemandResponse(inputs, gridStabilityMetrics);
      
      // Calculate economic metrics
      const economicMetrics = this.calculateEconomicMetrics(inputs, windDispatch, storageCommand);
      
      // Assess system status
      const systemStatus = this.assessSystemStatus(inputs, gridStabilityMetrics);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(inputs, gridStabilityMetrics, systemStatus);
      
      // Update performance history
      this.updatePerformanceHistory(inputs, gridStabilityMetrics, economicMetrics);
      
      return {
        windPowerDispatch: windDispatch,
        storageCommand,
        demandResponseSignal,
        gridStabilityMetrics,
        economicMetrics,
        systemStatus,
        recommendations
      };
      
    } catch (error) {
      console.error('Error in wind energy grid integration:', error);
      return this.generateFailsafeOutputs(inputs);
    }
  }

  /**
   * Assess grid stability with current wind integration
   */
  private assessGridStability(inputs: GridIntegrationInputs): GridStabilityMetrics {
    const windPenetration = inputs.windGeneration / inputs.currentGridLoad;
    
    // Calculate frequency deviation
    const frequencyDeviation = Math.abs(inputs.gridFrequency - this.config.gridFrequency);
    
    // Calculate voltage deviation
    const voltageDeviation = Math.abs(inputs.gridVoltage - this.config.voltageLevel) / this.config.voltageLevel;
    
    // Estimate ramp rate based on wind forecast
    const currentHour = new Date().getHours();
    const nextHourForecast = inputs.windForecast.hourly.find(h => h.hour === (currentHour + 1) % 24);
    const rampRate = nextHourForecast ? 
      Math.abs(nextHourForecast.expectedPower - inputs.windGeneration) / 60000000 : 0; // MW/min
    
    // Calculate inertia level (simplified model)
    const conventionalGeneration = inputs.currentGridLoad - inputs.windGeneration;
    const inertiaLevel = Math.max(2, 8 * (conventionalGeneration / inputs.currentGridLoad));
    
    // Calculate overall stability margin
    const frequencyMargin = 1 - (frequencyDeviation / this.config.stabilityMargins.frequencyDeviationLimit);
    const voltageMargin = 1 - (voltageDeviation / this.config.stabilityMargins.voltageDeviationLimit);
    const rampMargin = 1 - (rampRate / (this.config.stabilityMargins.rampRateLimit * inputs.currentGridLoad / 1000000));
    const inertiaMargin = Math.min(1, inertiaLevel / this.config.stabilityMargins.inertiaRequirement);
    
    const stabilityMargin = Math.min(frequencyMargin, voltageMargin, rampMargin, inertiaMargin);
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (stabilityMargin > 0.8) riskLevel = 'low';
    else if (stabilityMargin > 0.6) riskLevel = 'medium';
    else if (stabilityMargin > 0.3) riskLevel = 'high';
    else riskLevel = 'critical';
    
    return {
      frequencyDeviation,
      voltageDeviation,
      rampRate,
      inertiaLevel,
      stabilityMargin,
      riskLevel
    };
  }

  /**
   * Optimize wind power dispatch based on grid conditions
   */
  private optimizeWindDispatch(inputs: GridIntegrationInputs, stability: GridStabilityMetrics): number {
    let optimalDispatch = inputs.windGeneration;
    
    // Apply stability constraints
    if (stability.riskLevel === 'critical') {
      optimalDispatch *= 0.7; // Reduce to 70% in critical conditions
    } else if (stability.riskLevel === 'high') {
      optimalDispatch *= 0.85; // Reduce to 85% in high risk conditions
    }
    
    // Apply penetration limits
    const currentPenetration = optimalDispatch / inputs.currentGridLoad;
    if (currentPenetration > this.config.maxWindPenetration) {
      optimalDispatch = inputs.currentGridLoad * this.config.maxWindPenetration;
    }
    
    // Consider ramp rate limits
    const maxRampChange = this.config.stabilityMargins.rampRateLimit * inputs.currentGridLoad / 1000000 * 60000000; // Convert to watts
    const previousDispatch = this.getPreviousWindDispatch();
    const rampLimitedDispatch = Math.max(
      previousDispatch - maxRampChange,
      Math.min(previousDispatch + maxRampChange, optimalDispatch)
    );
    
    return Math.max(0, Math.min(inputs.windGeneration, rampLimitedDispatch));
  }

  /**
   * Coordinate energy storage for wind integration
   */
  private coordinateEnergyStorage(
    inputs: GridIntegrationInputs,
    windDispatch: number,
    stability: GridStabilityMetrics
  ): { mode: 'charge' | 'discharge' | 'standby'; power: number; duration: number } {
    const excessWind = inputs.windGeneration - windDispatch;
    const storageCapacity = this.config.storageRequirements.minimumCapacity;
    const maxPower = this.config.storageRequirements.powerRating;
    
    // Determine storage mode based on conditions
    if (excessWind > 0 && inputs.storageSOC < 0.95) {
      // Charge storage with excess wind
      const chargePower = Math.min(excessWind, maxPower, 
        (0.95 - inputs.storageSOC) * storageCapacity / 3600); // 1-hour charge limit
      return {
        mode: 'charge',
        power: chargePower,
        duration: 3600 // 1 hour
      };
    } else if (stability.riskLevel === 'high' || stability.riskLevel === 'critical') {
      // Discharge storage to support grid stability
      const dischargePower = Math.min(maxPower, inputs.storageSOC * storageCapacity / 1800); // 30-minute discharge
      return {
        mode: 'discharge',
        power: dischargePower,
        duration: 1800 // 30 minutes
      };
    } else if (inputs.currentGridLoad > inputs.demandForecast.peak * 0.9 && inputs.storageSOC > 0.2) {
      // Discharge during peak demand
      const peakSupportPower = Math.min(maxPower * 0.8, inputs.storageSOC * storageCapacity / 7200); // 2-hour discharge
      return {
        mode: 'discharge',
        power: peakSupportPower,
        duration: 7200 // 2 hours
      };
    }
    
    return {
      mode: 'standby',
      power: 0,
      duration: 0
    };
  }

  /**
   * Manage demand response for grid stability
   */
  private manageDemandResponse(
    inputs: GridIntegrationInputs,
    stability: GridStabilityMetrics
  ): { type: 'curtail' | 'increase' | 'maintain'; magnitude: number; priority: 'low' | 'medium' | 'high' | 'critical' } {
    const windPenetration = inputs.windGeneration / inputs.currentGridLoad;
    
    if (stability.riskLevel === 'critical') {
      return {
        type: 'curtail',
        magnitude: 0.1, // 10% demand reduction
        priority: 'critical'
      };
    } else if (stability.riskLevel === 'high') {
      return {
        type: 'curtail',
        magnitude: 0.05, // 5% demand reduction
        priority: 'high'
      };
    } else if (windPenetration > 0.8 && inputs.storageSOC > 0.9) {
      // Increase demand when excess wind and storage is full
      return {
        type: 'increase',
        magnitude: 0.03, // 3% demand increase
        priority: 'medium'
      };
    } else if (inputs.currentGridLoad < inputs.demandForecast.valley * 1.1 && windPenetration > 0.6) {
      // Increase demand during low load, high wind periods
      return {
        type: 'increase',
        magnitude: 0.02, // 2% demand increase
        priority: 'low'
      };
    }
    
    return {
      type: 'maintain',
      magnitude: 0,
      priority: 'low'
    };
  }

  /**
   * Calculate economic metrics for wind integration
   */
  private calculateEconomicMetrics(
    inputs: GridIntegrationInputs,
    windDispatch: number,
    storageCommand: any
  ): { revenueGenerated: number; carbonReduction: number; gridServiceValue: number } {
    // Calculate revenue from wind generation
    const windEnergyMWh = windDispatch / 1000000; // Convert to MWh
    const revenueGenerated = windEnergyMWh * (inputs.marketConditions.electricityPrice + inputs.marketConditions.renewableIncentive);
    
    // Calculate carbon reduction (assuming 0.5 kg CO2/kWh displaced)
    const carbonReduction = windEnergyMWh * 1000 * 0.5; // kg CO2
    
    // Calculate grid service value
    let gridServiceValue = 0;
    if (storageCommand.mode === 'discharge') {
      gridServiceValue += storageCommand.power / 1000000 * 0.1; // $0.1/MWh for grid support
    }
    gridServiceValue += windDispatch / 1000000 * 0.05; // $0.05/MWh for renewable generation
    
    return {
      revenueGenerated,
      carbonReduction,
      gridServiceValue
    };
  }

  /**
   * Assess overall system status
   */
  private assessSystemStatus(
    inputs: GridIntegrationInputs,
    stability: GridStabilityMetrics
  ): { overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'; windIntegrationLevel: number; gridStabilityStatus: 'stable' | 'marginal' | 'unstable'; storageUtilization: number } {
    const windIntegrationLevel = inputs.windGeneration / inputs.currentGridLoad;
    const storageUtilization = inputs.storageSOC;
    
    let gridStabilityStatus: 'stable' | 'marginal' | 'unstable';
    if (stability.stabilityMargin > 0.7) gridStabilityStatus = 'stable';
    else if (stability.stabilityMargin > 0.4) gridStabilityStatus = 'marginal';
    else gridStabilityStatus = 'unstable';
    
    let overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (stability.riskLevel === 'low' && windIntegrationLevel > 0.3) overallHealth = 'excellent';
    else if (stability.riskLevel === 'medium' && windIntegrationLevel > 0.2) overallHealth = 'good';
    else if (stability.riskLevel === 'high' || windIntegrationLevel < 0.1) overallHealth = 'fair';
    else if (stability.riskLevel === 'critical') overallHealth = 'critical';
    else overallHealth = 'poor';
    
    return {
      overallHealth,
      windIntegrationLevel,
      gridStabilityStatus,
      storageUtilization
    };
  }

  /**
   * Generate operational recommendations
   */
  private generateRecommendations(
    inputs: GridIntegrationInputs,
    stability: GridStabilityMetrics,
    systemStatus: any
  ): { shortTerm: string[]; mediumTerm: string[]; longTerm: string[] } {
    const shortTerm: string[] = [];
    const mediumTerm: string[] = [];
    const longTerm: string[] = [];
    
    // Short-term recommendations (next hour)
    if (stability.riskLevel === 'critical') {
      shortTerm.push('Immediately reduce wind dispatch by 30%');
      shortTerm.push('Activate emergency demand response');
      shortTerm.push('Discharge storage at maximum rate');
    } else if (stability.riskLevel === 'high') {
      shortTerm.push('Reduce wind dispatch by 15%');
      shortTerm.push('Activate demand response programs');
    }
    
    if (inputs.storageSOC < 0.2) {
      shortTerm.push('Prioritize storage charging during next wind peak');
    }
    
    // Medium-term recommendations (next 24 hours)
    const tomorrowWindForecast = inputs.windForecast.daily[1];
    if (tomorrowWindForecast && tomorrowWindForecast.expectedEnergy > inputs.currentGridLoad * 24 * 0.6) {
      mediumTerm.push('Prepare for high wind day - schedule flexible loads');
      mediumTerm.push('Ensure storage systems are ready for cycling');
    }
    
    if (systemStatus.windIntegrationLevel < this.config.windPenetrationTarget * 0.8) {
      mediumTerm.push('Investigate barriers to wind integration');
      mediumTerm.push('Review grid stability constraints');
    }
    
    // Long-term recommendations (strategic)
    if (this.getAverageStabilityMargin() < 0.6) {
      longTerm.push('Consider additional grid flexibility investments');
      longTerm.push('Evaluate need for synthetic inertia systems');
    }
    
    if (this.getAverageWindPenetration() < this.config.windPenetrationTarget) {
      longTerm.push('Develop additional wind capacity');
      longTerm.push('Enhance transmission infrastructure');
    }
    
    longTerm.push('Implement advanced wind forecasting systems');
    longTerm.push('Develop market mechanisms for grid services');
    
    return { shortTerm, mediumTerm, longTerm };
  }

  /**
   * Update performance history for analytics
   */
  private updatePerformanceHistory(
    inputs: GridIntegrationInputs,
    stability: GridStabilityMetrics,
    economics: any
  ): void {
    this.performanceHistory.push({
      timestamp: Date.now(),
      windPenetration: inputs.windGeneration / inputs.currentGridLoad,
      gridStability: stability.stabilityMargin,
      economicValue: economics.revenueGenerated + economics.gridServiceValue
    });
    
    // Keep only last 24 hours of data
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.performanceHistory = this.performanceHistory.filter(entry => entry.timestamp > oneDayAgo);
  }

  /**
   * Generate failsafe outputs in case of system errors
   */
  private generateFailsafeOutputs(inputs: GridIntegrationInputs): GridIntegrationOutputs {
    return {
      windPowerDispatch: inputs.windGeneration * 0.5, // Conservative 50% dispatch
      storageCommand: {
        mode: 'standby',
        power: 0,
        duration: 0
      },
      demandResponseSignal: {
        type: 'maintain',
        magnitude: 0,
        priority: 'low'
      },
      gridStabilityMetrics: {
        frequencyDeviation: 0,
        voltageDeviation: 0,
        rampRate: 0,
        inertiaLevel: 5,
        stabilityMargin: 0.5,
        riskLevel: 'medium'
      },
      economicMetrics: {
        revenueGenerated: 0,
        carbonReduction: 0,
        gridServiceValue: 0
      },
      systemStatus: {
        overallHealth: 'fair',
        windIntegrationLevel: 0.5,
        gridStabilityStatus: 'marginal',
        storageUtilization: inputs.storageSOC
      },
      recommendations: {
        shortTerm: ['System in failsafe mode - check all subsystems'],
        mediumTerm: ['Perform comprehensive system diagnostics'],
        longTerm: ['Review system architecture and redundancy']
      }
    };
  }

  // Helper methods
  private createDefaultStorageConfig(): StorageSystemConfig {
    return {
      totalCapacity: this.config.storageRequirements.minimumCapacity,
      powerRating: this.config.storageRequirements.powerRating,
      efficiency: this.config.storageRequirements.efficiency,
      responseTime: this.config.storageRequirements.responseTime,
      cycleLife: 5000,
      degradationRate: 0.02
    };
  }

  private createDefaultPolicyFramework(): PolicyFramework {
    return {
      renewableTarget: this.config.windPenetrationTarget,
      carbonPrice: 25,
      gridCodeCompliance: true,
      environmentalStandards: 'strict',
      marketMechanisms: ['renewable_certificates', 'capacity_markets']
    };
  }

  private getPreviousWindDispatch(): number {
    // Simplified - in real implementation, this would track actual previous dispatch
    return this.performanceHistory.length > 0 ? 
      this.performanceHistory[this.performanceHistory.length - 1].windPenetration * 1000000000 : 0;
  }

  private getAverageStabilityMargin(): number {
    if (this.performanceHistory.length === 0) return 0.8;
    return this.performanceHistory.reduce((sum, entry) => sum + entry.gridStability, 0) / this.performanceHistory.length;
  }

  private getAverageWindPenetration(): number {
    if (this.performanceHistory.length === 0) return 0.3;
    return this.performanceHistory.reduce((sum, entry) => sum + entry.windPenetration, 0) / this.performanceHistory.length;
  }

  /**
   * Get system performance analytics
   */
  public getPerformanceAnalytics(): {
    averageWindPenetration: number;
    averageStabilityMargin: number;
    totalEconomicValue: number;
    systemUptime: number;
  } {
    return {
      averageWindPenetration: this.getAverageWindPenetration(),
      averageStabilityMargin: this.getAverageStabilityMargin(),
      totalEconomicValue: this.performanceHistory.reduce((sum, entry) => sum + entry.economicValue, 0),
      systemUptime: this.performanceHistory.length > 0 ? 0.99 : 0 // Simplified uptime calculation
    };
  }
}