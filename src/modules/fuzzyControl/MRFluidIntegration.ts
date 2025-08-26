/**
 * MR Fluid Integration with Regenerative Braking System
 * 
 * This module integrates MR fluid formulations with the existing fuzzy control
 * regenerative braking system to optimize energy recovery performance.
 */

import { 
  FuzzyRegenerativeBrakingController,
  BrakingInputs,
  BrakingOutputs 
} from './FuzzyRegenerativeBrakingController';

import { 
  RegenerativeBrakingTorqueModel,
  VehicleParameters,
  BrakingDemand,
  TorqueDistribution 
} from './RegenerativeBrakingTorqueModel';

import { 
  MRFluidFormulation,
  MRFluidComposition,
  EnergyRecoveryMetrics,
  OptimizationParameters 
} from './MRFluidFormulation';

export interface MRFluidSystemInputs extends BrakingInputs {
  // Additional MR fluid specific inputs
  magneticFieldStrength: number;    // A/m - applied magnetic field
  suspensionVelocity: number;       // m/s - suspension compression/extension velocity
  dampingForce: number;             // N - required damping force
  ambientTemperature: number;       // °C - ambient temperature
  operatingFrequency: number;       // Hz - oscillation frequency
}

export interface MRFluidSystemOutputs extends BrakingOutputs {
  // Additional MR fluid specific outputs
  mrFluidViscosity: number;         // Pa·s - current fluid viscosity
  dampingCoefficient: number;       // N·s/m - damping coefficient
  energyRecoveryRate: number;       // W - instantaneous energy recovery rate
  fluidTemperature: number;         // °C - MR fluid operating temperature
  magneticFieldRequired: number;    // A/m - required magnetic field strength
  suspensionEnergyRecovery: number; // W - energy recovered from suspension
  totalEnergyRecovery: number;      // W - total system energy recovery
}

export interface MRFluidSystemConfiguration {
  selectedFormulation: string;
  brakingSystemConfig: {
    enableMRFluidBraking: boolean;
    mrFluidBrakingRatio: number;     // 0-1 - ratio of MR fluid to conventional braking
    adaptiveFieldControl: boolean;   // Enable adaptive magnetic field control
  };
  suspensionSystemConfig: {
    enableMRFluidSuspension: boolean;
    suspensionEnergyRecovery: boolean;
    dampingAdaptation: boolean;      // Enable adaptive damping
  };
  thermalManagement: {
    enableCooling: boolean;
    maxOperatingTemperature: number; // °C
    thermalDerating: boolean;        // Enable thermal derating
  };
}

export class MRFluidIntegration {
  private fuzzyController: FuzzyRegenerativeBrakingController;
  private torqueModel: RegenerativeBrakingTorqueModel;
  private mrFluidSystem: MRFluidFormulation;
  private configuration: MRFluidSystemConfiguration;
  private currentFormulation: MRFluidComposition | null;
  private performanceHistory: Array<{
    timestamp: Date;
    inputs: MRFluidSystemInputs;
    outputs: MRFluidSystemOutputs;
    efficiency: number;
  }>;

  constructor(
    vehicleParams: VehicleParameters,
    configuration: MRFluidSystemConfiguration
  ) {
    this.fuzzyController = new FuzzyRegenerativeBrakingController();
    this.torqueModel = new RegenerativeBrakingTorqueModel(vehicleParams);
    this.mrFluidSystem = new MRFluidFormulation();
    this.configuration = configuration;
    this.currentFormulation = null;
    this.performanceHistory = [];
    
    this.initializeSystem();
  }

  /**
   * Initialize the MR fluid integrated system
   */
  private initializeSystem(): void {
    // Load the selected MR fluid formulation
    const formulations = this.mrFluidSystem.getFormulations();
    this.currentFormulation = formulations.get(this.configuration.selectedFormulation) || null;
    
    if (!this.currentFormulation) {
      throw new Error(`MR fluid formulation ${this.configuration.selectedFormulation} not found`);
    }
  }

  /**
   * Calculate optimal system response with MR fluid integration
   */
  public calculateOptimalResponse(inputs: MRFluidSystemInputs): MRFluidSystemOutputs {
    if (!this.currentFormulation) {
      throw new Error('No MR fluid formulation selected');
    }

    // Get base regenerative braking response
    const baseBrakingInputs: BrakingInputs = {
      drivingSpeed: inputs.drivingSpeed,
      brakingIntensity: inputs.brakingIntensity,
      batterySOC: inputs.batterySOC,
      motorTemperature: inputs.motorTemperature
    };

    const baseBrakingOutputs = this.fuzzyController.calculateOptimalBraking(baseBrakingInputs);

    // Calculate MR fluid performance metrics
    const mrFluidMetrics = this.mrFluidSystem.calculateEnergyRecoveryEfficiency(
      this.currentFormulation.id,
      inputs.magneticFieldStrength,
      inputs.ambientTemperature,
      this.calculateShearRate(inputs),
      inputs.operatingFrequency
    );

    // Calculate enhanced outputs with MR fluid integration
    const enhancedOutputs = this.calculateEnhancedOutputs(
      baseBrakingOutputs,
      mrFluidMetrics,
      inputs
    );

    // Apply system configuration constraints
    const finalOutputs = this.applySystemConstraints(enhancedOutputs, inputs);

    // Store performance data
    this.performanceHistory.push({
      timestamp: new Date(),
      inputs,
      outputs: finalOutputs,
      efficiency: mrFluidMetrics.results.energyRecoveryEfficiency
    });

    return finalOutputs;
  }

  /**
   * Calculate shear rate from system inputs
   */
  private calculateShearRate(inputs: MRFluidSystemInputs): number {
    // Estimate shear rate from suspension velocity and braking intensity
    const brakingShearRate = inputs.brakingIntensity * inputs.drivingSpeed * 2.78; // Convert km/h to m/s factor
    const suspensionShearRate = Math.abs(inputs.suspensionVelocity) * 100; // Scale factor
    
    return Math.max(brakingShearRate, suspensionShearRate);
  }

  /**
   * Calculate enhanced outputs with MR fluid integration
   */
  private calculateEnhancedOutputs(
    baseOutputs: BrakingOutputs,
    mrFluidMetrics: EnergyRecoveryMetrics,
    inputs: MRFluidSystemInputs
  ): MRFluidSystemOutputs {
    // Calculate MR fluid viscosity
    const baseViscosity = this.currentFormulation!.baseFluid.viscosity;
    const mrFluidViscosity = baseViscosity * mrFluidMetrics.results.viscosityRatio;

    // Calculate damping coefficient
    const dampingCoefficient = mrFluidMetrics.results.dampingCoefficient;

    // Calculate energy recovery from braking system
    const brakingEnergyRecovery = this.calculateBrakingEnergyRecovery(
      baseOutputs,
      mrFluidMetrics,
      inputs
    );

    // Calculate energy recovery from suspension system
    const suspensionEnergyRecovery = this.calculateSuspensionEnergyRecovery(
      inputs,
      mrFluidMetrics
    );

    // Calculate total energy recovery
    const totalEnergyRecovery = brakingEnergyRecovery + suspensionEnergyRecovery;

    // Calculate fluid temperature rise
    const fluidTemperature = this.calculateFluidTemperature(inputs, mrFluidMetrics);

    // Calculate required magnetic field strength
    const magneticFieldRequired = this.calculateRequiredMagneticField(inputs, mrFluidMetrics);

    return {
      // Base braking outputs
      regenerativeBrakingRatio: baseOutputs.regenerativeBrakingRatio,
      motorTorque: baseOutputs.motorTorque,
      frontAxleBrakingForce: baseOutputs.frontAxleBrakingForce,
      
      // MR fluid specific outputs
      mrFluidViscosity,
      dampingCoefficient,
      energyRecoveryRate: totalEnergyRecovery,
      fluidTemperature,
      magneticFieldRequired,
      suspensionEnergyRecovery,
      totalEnergyRecovery
    };
  }

  /**
   * Calculate energy recovery from braking system
   */
  private calculateBrakingEnergyRecovery(
    baseOutputs: BrakingOutputs,
    mrFluidMetrics: EnergyRecoveryMetrics,
    inputs: MRFluidSystemInputs
  ): number {
    if (!this.configuration.brakingSystemConfig.enableMRFluidBraking) {
      return 0;
    }

    const brakingPower = baseOutputs.frontAxleBrakingForce * (inputs.drivingSpeed / 3.6); // Convert km/h to m/s
    const mrFluidEfficiency = mrFluidMetrics.results.energyRecoveryEfficiency / 100;
    const mrFluidRatio = this.configuration.brakingSystemConfig.mrFluidBrakingRatio;

    return brakingPower * mrFluidEfficiency * mrFluidRatio;
  }

  /**
   * Calculate energy recovery from suspension system
   */
  private calculateSuspensionEnergyRecovery(
    inputs: MRFluidSystemInputs,
    mrFluidMetrics: EnergyRecoveryMetrics
  ): number {
    if (!this.configuration.suspensionSystemConfig.enableMRFluidSuspension ||
        !this.configuration.suspensionSystemConfig.suspensionEnergyRecovery) {
      return 0;
    }

    // Calculate power from suspension motion
    const suspensionPower = Math.abs(inputs.dampingForce * inputs.suspensionVelocity);
    const mrFluidEfficiency = mrFluidMetrics.results.energyRecoveryEfficiency / 100;

    // Apply frequency-dependent efficiency
    const frequencyFactor = this.calculateFrequencyEfficiencyFactor(inputs.operatingFrequency);

    return suspensionPower * mrFluidEfficiency * frequencyFactor;
  }

  /**
   * Calculate frequency efficiency factor
   */
  private calculateFrequencyEfficiencyFactor(frequency: number): number {
    if (!this.currentFormulation) return 0;

    const responseTime = this.currentFormulation.performance.responseTime / 1000; // Convert to seconds
    const criticalFreq = 1 / (2 * Math.PI * responseTime);

    if (frequency <= criticalFreq) {
      return 1.0;
    } else {
      return Math.max(0.3, criticalFreq / frequency);
    }
  }

  /**
   * Calculate fluid temperature
   */
  private calculateFluidTemperature(
    inputs: MRFluidSystemInputs,
    mrFluidMetrics: EnergyRecoveryMetrics
  ): number {
    const baseTemperature = inputs.ambientTemperature;
    const powerDissipation = mrFluidMetrics.results.powerDensity;
    const thermalConductivity = this.currentFormulation!.baseFluid.thermalConductivity;

    // Simple thermal model - temperature rise proportional to power dissipation
    const temperatureRise = (powerDissipation * 0.001) / thermalConductivity; // Simplified calculation

    return baseTemperature + temperatureRise;
  }

  /**
   * Calculate required magnetic field strength
   */
  private calculateRequiredMagneticField(
    inputs: MRFluidSystemInputs,
    mrFluidMetrics: EnergyRecoveryMetrics
  ): number {
    // Adaptive field control based on performance requirements
    if (!this.configuration.brakingSystemConfig.adaptiveFieldControl) {
      return inputs.magneticFieldStrength;
    }

    const targetEfficiency = 85; // Target 85% efficiency
    const currentEfficiency = mrFluidMetrics.results.energyRecoveryEfficiency;
    const saturationField = this.currentFormulation!.magneticParticles.saturationMagnetization * 0.001;

    if (currentEfficiency < targetEfficiency) {
      // Increase field strength to improve efficiency
      const fieldIncrease = (targetEfficiency - currentEfficiency) / 100 * saturationField * 0.5;
      return Math.min(inputs.magneticFieldStrength + fieldIncrease, saturationField);
    }

    return inputs.magneticFieldStrength;
  }

  /**
   * Apply system configuration constraints
   */
  private applySystemConstraints(
    outputs: MRFluidSystemOutputs,
    inputs: MRFluidSystemInputs
  ): MRFluidSystemOutputs {
    const constrainedOutputs = { ...outputs };

    // Apply thermal constraints
    if (this.configuration.thermalManagement.thermalDerating &&
        outputs.fluidTemperature > this.configuration.thermalManagement.maxOperatingTemperature) {
      
      const deratingFactor = Math.max(0.3, 
        this.configuration.thermalManagement.maxOperatingTemperature / outputs.fluidTemperature
      );
      
      constrainedOutputs.energyRecoveryRate *= deratingFactor;
      constrainedOutputs.suspensionEnergyRecovery *= deratingFactor;
      constrainedOutputs.totalEnergyRecovery *= deratingFactor;
      constrainedOutputs.dampingCoefficient *= deratingFactor;
    }

    // Apply magnetic field limits
    const maxField = this.currentFormulation!.magneticParticles.saturationMagnetization * 0.001;
    constrainedOutputs.magneticFieldRequired = Math.min(
      constrainedOutputs.magneticFieldRequired,
      maxField
    );

    return constrainedOutputs;
  }

  /**
   * Optimize MR fluid formulation for current operating conditions
   */
  public optimizeFormulationForConditions(
    operatingConditions: {
      temperatureRange: [number, number];
      magneticFieldRange: [number, number];
      frequencyRange: [number, number];
      priorityWeights: {
        energyRecovery: number;
        responseTime: number;
        durability: number;
        temperatureStability: number;
      };
    }
  ): {
    recommendedFormulation: string;
    expectedImprovement: number;
    switchingRecommendation: string;
  } {
    const optimizationParams: OptimizationParameters = {
      targetApplication: 'hybrid_system',
      operatingConditions: {
        temperatureRange: operatingConditions.temperatureRange,
        magneticFieldRange: operatingConditions.magneticFieldRange,
        shearRateRange: [10, 1000],
        frequencyRange: operatingConditions.frequencyRange
      },
      performanceWeights: {
        energyRecovery: operatingConditions.priorityWeights.energyRecovery,
        responseTime: operatingConditions.priorityWeights.responseTime,
        durability: operatingConditions.priorityWeights.durability,
        temperatureStability: operatingConditions.priorityWeights.temperatureStability,
        cost: 0.05
      }
    };

    const optimizationResult = this.mrFluidSystem.optimizeFormulation(optimizationParams);
    
    // Calculate expected improvement
    const currentScore = this.calculateCurrentFormulationScore(optimizationParams);
    const expectedImprovement = ((optimizationResult.score - currentScore) / currentScore) * 100;

    // Generate switching recommendation
    let switchingRecommendation = '';
    if (expectedImprovement > 10) {
      switchingRecommendation = 'Highly recommended - significant performance improvement expected';
    } else if (expectedImprovement > 5) {
      switchingRecommendation = 'Recommended - moderate performance improvement expected';
    } else if (expectedImprovement > 0) {
      switchingRecommendation = 'Optional - minor performance improvement expected';
    } else {
      switchingRecommendation = 'Not recommended - current formulation is optimal';
    }

    return {
      recommendedFormulation: optimizationResult.bestFormulation,
      expectedImprovement,
      switchingRecommendation
    };
  }

  /**
   * Calculate current formulation score
   */
  private calculateCurrentFormulationScore(params: OptimizationParameters): number {
    if (!this.currentFormulation) return 0;

    const weights = params.performanceWeights;
    
    // Normalize performance metrics (0-1 scale)
    const energyScore = Math.min(1, this.calculateBaseEfficiency(this.currentFormulation) / 100);
    const responseScore = Math.max(0, 1 - this.currentFormulation.performance.responseTime / 50);
    const durabilityScore = Math.min(1, this.currentFormulation.performance.sedimentationStability / 3000);
    const tempScore = Math.min(1, this.currentFormulation.performance.temperatureStability / 200);
    const costScore = 1 - this.currentFormulation.magneticParticles.concentration * 0.8;
    
    return (
      weights.energyRecovery * energyScore +
      weights.responseTime * responseScore +
      weights.durability * durabilityScore +
      weights.temperatureStability * tempScore +
      0.05 * costScore
    );
  }

  /**
   * Calculate base efficiency for a formulation
   */
  private calculateBaseEfficiency(formulation: MRFluidComposition): number {
    const particleConcentration = formulation.magneticParticles.concentration;
    const yieldStress = formulation.performance.yieldStress;
    const dynamicRange = formulation.performance.dynamicRange;
    
    const concentrationFactor = Math.min(1.0, particleConcentration / 0.4);
    const yieldStressFactor = Math.min(1.0, yieldStress / 100000);
    const dynamicRangeFactor = Math.min(1.0, dynamicRange / 200);
    
    return 60 + 35 * concentrationFactor * yieldStressFactor * dynamicRangeFactor;
  }

  /**
   * Switch to a different MR fluid formulation
   */
  public switchFormulation(newFormulationId: string): void {
    const formulations = this.mrFluidSystem.getFormulations();
    const newFormulation = formulations.get(newFormulationId);
    
    if (!newFormulation) {
      throw new Error(`MR fluid formulation ${newFormulationId} not found`);
    }

    this.currentFormulation = newFormulation;
    this.configuration.selectedFormulation = newFormulationId;
  }

  /**
   * Get system performance analytics
   */
  public getPerformanceAnalytics(): {
    averageEnergyRecovery: number;
    averageEfficiency: number;
    temperatureProfile: { min: number; max: number; average: number };
    operatingHours: number;
    formulationUtilization: Map<string, number>;
  } {
    if (this.performanceHistory.length === 0) {
      return {
        averageEnergyRecovery: 0,
        averageEfficiency: 0,
        temperatureProfile: { min: 0, max: 0, average: 0 },
        operatingHours: 0,
        formulationUtilization: new Map()
      };
    }

    const totalEnergyRecovery = this.performanceHistory.reduce(
      (sum, entry) => sum + entry.outputs.totalEnergyRecovery, 0
    );
    const totalEfficiency = this.performanceHistory.reduce(
      (sum, entry) => sum + entry.efficiency, 0
    );

    const temperatures = this.performanceHistory.map(entry => entry.outputs.fluidTemperature);
    const temperatureProfile = {
      min: Math.min(...temperatures),
      max: Math.max(...temperatures),
      average: temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length
    };

    // Calculate operating hours (assuming 1 entry per minute)
    const operatingHours = this.performanceHistory.length / 60;

    // Calculate formulation utilization
    const formulationUtilization = new Map<string, number>();
    formulationUtilization.set(this.configuration.selectedFormulation, 100);

    return {
      averageEnergyRecovery: totalEnergyRecovery / this.performanceHistory.length,
      averageEfficiency: totalEfficiency / this.performanceHistory.length,
      temperatureProfile,
      operatingHours,
      formulationUtilization
    };
  }

  /**
   * Generate system diagnostics
   */
  public generateSystemDiagnostics(): {
    systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
    issues: string[];
    recommendations: string[];
    performanceTrends: {
      energyRecoveryTrend: 'improving' | 'stable' | 'declining';
      efficiencyTrend: 'improving' | 'stable' | 'declining';
      temperatureTrend: 'improving' | 'stable' | 'declining';
    };
  } {
    const analytics = this.getPerformanceAnalytics();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Assess system health
    let systemHealth: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';

    if (analytics.averageEfficiency < 60) {
      systemHealth = 'poor';
      issues.push('Low energy recovery efficiency');
      recommendations.push('Consider switching to a higher-performance MR fluid formulation');
    } else if (analytics.averageEfficiency < 75) {
      systemHealth = 'fair';
      issues.push('Moderate energy recovery efficiency');
      recommendations.push('Optimize operating conditions or consider formulation upgrade');
    } else if (analytics.averageEfficiency < 85) {
      systemHealth = 'good';
    }

    if (analytics.temperatureProfile.max > this.configuration.thermalManagement.maxOperatingTemperature) {
      if (systemHealth === 'excellent') systemHealth = 'good';
      issues.push('High operating temperatures detected');
      recommendations.push('Improve cooling system or enable thermal derating');
    }

    // Analyze performance trends (simplified - would need more sophisticated analysis in practice)
    const recentPerformance = this.performanceHistory.slice(-10);
    const olderPerformance = this.performanceHistory.slice(-20, -10);

    const performanceTrends = {
      energyRecoveryTrend: this.calculateTrend(
        recentPerformance.map(e => e.outputs.totalEnergyRecovery),
        olderPerformance.map(e => e.outputs.totalEnergyRecovery)
      ),
      efficiencyTrend: this.calculateTrend(
        recentPerformance.map(e => e.efficiency),
        olderPerformance.map(e => e.efficiency)
      ),
      temperatureTrend: this.calculateTrend(
        recentPerformance.map(e => e.outputs.fluidTemperature),
        olderPerformance.map(e => e.outputs.fluidTemperature)
      )
    };

    return {
      systemHealth,
      issues,
      recommendations,
      performanceTrends
    };
  }

  /**
   * Calculate trend direction
   */
  private calculateTrend(recent: number[], older: number[]): 'improving' | 'stable' | 'declining' {
    if (recent.length === 0 || older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    const change = (recentAvg - olderAvg) / olderAvg;

    if (change > 0.05) return 'improving';
    if (change < -0.05) return 'declining';
    return 'stable';
  }

  /**
   * Get current system configuration
   */
  public getConfiguration(): MRFluidSystemConfiguration {
    return { ...this.configuration };
  }

  /**
   * Update system configuration
   */
  public updateConfiguration(newConfig: Partial<MRFluidSystemConfiguration>): void {
    this.configuration = { ...this.configuration, ...newConfig };
    
    if (newConfig.selectedFormulation && 
        newConfig.selectedFormulation !== this.configuration.selectedFormulation) {
      this.switchFormulation(newConfig.selectedFormulation);
    }
  }

  /**
   * Get current formulation details
   */
  public getCurrentFormulation(): MRFluidComposition | null {
    return this.currentFormulation;
  }

  /**
   * Get performance history
   */
  public getPerformanceHistory(): Array<{
    timestamp: Date;
    inputs: MRFluidSystemInputs;
    outputs: MRFluidSystemOutputs;
    efficiency: number;
  }> {
    return [...this.performanceHistory];
  }
}