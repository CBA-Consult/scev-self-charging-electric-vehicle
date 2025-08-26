/**
 * Grid Stability Manager for Wind Energy Integration
 * 
 * Manages grid stability aspects including frequency regulation,
 * voltage control, and inertial response for wind energy integration.
 */

export interface StabilityParameters {
  nominalFrequency: number; // Hz
  nominalVoltage: number; // V
  stabilityMargins: {
    frequencyDeviationLimit: number;
    voltageDeviationLimit: number;
    rampRateLimit: number;
    inertiaRequirement: number;
  };
}

export interface FrequencyRegulationConfig {
  primaryReserveCapacity: number; // MW
  secondaryReserveCapacity: number; // MW
  responseTime: number; // seconds
  deadband: number; // Hz
  droop: number; // %
}

export interface VoltageControlConfig {
  reactiveReserveCapacity: number; // MVAr
  voltageSetpoint: number; // V
  voltageDeadband: number; // %
  tapChangerSteps: number;
}

export interface InertialResponseConfig {
  syntheticInertiaEnabled: boolean;
  inertiaConstant: number; // seconds
  rateOfChangeOfFrequencyLimit: number; // Hz/s
  fastFrequencyResponseTime: number; // seconds
}

export class GridStabilityManager {
  private parameters: StabilityParameters;
  private frequencyRegulation: FrequencyRegulationConfig;
  private voltageControl: VoltageControlConfig;
  private inertialResponse: InertialResponseConfig;
  
  private stabilityHistory: Array<{
    timestamp: number;
    frequency: number;
    voltage: number;
    rampRate: number;
    inertia: number;
    stabilityScore: number;
  }> = [];

  constructor(parameters: StabilityParameters) {
    this.parameters = parameters;
    this.initializeDefaultConfigurations();
  }

  /**
   * Assess grid stability with current wind integration
   */
  public assessGridStability(
    currentFrequency: number,
    currentVoltage: number,
    windPenetration: number,
    rampRate: number
  ): {
    frequencyStability: number;
    voltageStability: number;
    rampRateStability: number;
    inertialStability: number;
    overallStability: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
  } {
    // Calculate individual stability metrics
    const frequencyStability = this.assessFrequencyStability(currentFrequency, windPenetration);
    const voltageStability = this.assessVoltageStability(currentVoltage, windPenetration);
    const rampRateStability = this.assessRampRateStability(rampRate, windPenetration);
    const inertialStability = this.assessInertialStability(windPenetration);
    
    // Calculate overall stability score
    const overallStability = Math.min(
      frequencyStability,
      voltageStability,
      rampRateStability,
      inertialStability
    );
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (overallStability > 0.8) riskLevel = 'low';
    else if (overallStability > 0.6) riskLevel = 'medium';
    else if (overallStability > 0.3) riskLevel = 'high';
    else riskLevel = 'critical';
    
    // Generate recommendations
    const recommendations = this.generateStabilityRecommendations(
      frequencyStability,
      voltageStability,
      rampRateStability,
      inertialStability,
      windPenetration
    );
    
    // Update stability history
    this.updateStabilityHistory(currentFrequency, currentVoltage, rampRate, windPenetration, overallStability);
    
    return {
      frequencyStability,
      voltageStability,
      rampRateStability,
      inertialStability,
      overallStability,
      riskLevel,
      recommendations
    };
  }

  /**
   * Provide frequency regulation services for wind integration
   */
  public provideFrequencyRegulation(
    frequencyDeviation: number,
    windGeneration: number,
    availableReserve: number
  ): {
    primaryResponse: number; // MW
    secondaryResponse: number; // MW
    responseTime: number; // seconds
    sustainabilityDuration: number; // seconds
  } {
    let primaryResponse = 0;
    let secondaryResponse = 0;
    
    // Primary frequency response (immediate)
    if (Math.abs(frequencyDeviation) > this.frequencyRegulation.deadband) {
      const primaryCapacity = Math.min(
        this.frequencyRegulation.primaryReserveCapacity,
        availableReserve * 0.5
      );
      primaryResponse = -Math.sign(frequencyDeviation) * 
        Math.min(primaryCapacity, Math.abs(frequencyDeviation) * primaryCapacity / 0.5);
    }
    
    // Secondary frequency response (within 30 seconds)
    if (Math.abs(frequencyDeviation) > this.frequencyRegulation.deadband * 0.5) {
      const secondaryCapacity = Math.min(
        this.frequencyRegulation.secondaryReserveCapacity,
        availableReserve * 0.3
      );
      secondaryResponse = -Math.sign(frequencyDeviation) * 
        Math.min(secondaryCapacity, Math.abs(frequencyDeviation) * secondaryCapacity / 0.2);
    }
    
    return {
      primaryResponse,
      secondaryResponse,
      responseTime: this.frequencyRegulation.responseTime,
      sustainabilityDuration: this.calculateSustainabilityDuration(primaryResponse + secondaryResponse, windGeneration)
    };
  }

  /**
   * Provide voltage control services for wind integration
   */
  public provideVoltageControl(
    voltageDeviation: number,
    windGeneration: number,
    availableReactivePower: number
  ): {
    reactivePowerCommand: number; // MVAr
    voltageSetpointAdjustment: number; // V
    tapChangerCommand: number; // steps
    responseTime: number; // seconds
  } {
    let reactivePowerCommand = 0;
    let voltageSetpointAdjustment = 0;
    let tapChangerCommand = 0;
    
    // Reactive power response
    if (Math.abs(voltageDeviation) > this.voltageControl.voltageDeadband) {
      const reactiveCapacity = Math.min(
        this.voltageControl.reactiveReserveCapacity,
        availableReactivePower
      );
      reactivePowerCommand = -Math.sign(voltageDeviation) * 
        Math.min(reactiveCapacity, Math.abs(voltageDeviation) * reactiveCapacity / 0.05);
    }
    
    // Voltage setpoint adjustment for wind farms
    if (Math.abs(voltageDeviation) > this.voltageControl.voltageDeadband * 2) {
      voltageSetpointAdjustment = -voltageDeviation * 0.5;
    }
    
    // Tap changer command for severe voltage deviations
    if (Math.abs(voltageDeviation) > this.voltageControl.voltageDeadband * 3) {
      tapChangerCommand = Math.sign(voltageDeviation) * 
        Math.min(this.voltageControl.tapChangerSteps, Math.ceil(Math.abs(voltageDeviation) / 0.01));
    }
    
    return {
      reactivePowerCommand,
      voltageSetpointAdjustment,
      tapChangerCommand,
      responseTime: 5 // 5 seconds for voltage control
    };
  }

  /**
   * Provide synthetic inertia services for wind integration
   */
  public provideSyntheticInertia(
    rateOfChangeOfFrequency: number,
    windGeneration: number,
    kineticEnergyAvailable: number
  ): {
    syntheticInertiaResponse: number; // MW
    inertiaConstantContribution: number; // seconds
    fastFrequencyResponse: number; // MW
    responseTime: number; // seconds
  } {
    let syntheticInertiaResponse = 0;
    let fastFrequencyResponse = 0;
    
    if (this.inertialResponse.syntheticInertiaEnabled) {
      // Synthetic inertia response based on rate of change of frequency
      if (Math.abs(rateOfChangeOfFrequency) > 0.1) { // 0.1 Hz/s threshold
        const maxInertiaResponse = windGeneration * 0.1; // 10% of wind generation
        syntheticInertiaResponse = -Math.sign(rateOfChangeOfFrequency) * 
          Math.min(maxInertiaResponse, Math.abs(rateOfChangeOfFrequency) * maxInertiaResponse / 0.5);
      }
      
      // Fast frequency response for severe events
      if (Math.abs(rateOfChangeOfFrequency) > this.inertialResponse.rateOfChangeOfFrequencyLimit) {
        const maxFastResponse = windGeneration * 0.05; // 5% of wind generation
        fastFrequencyResponse = -Math.sign(rateOfChangeOfFrequency) * maxFastResponse;
      }
    }
    
    const inertiaConstantContribution = this.calculateInertiaContribution(windGeneration, kineticEnergyAvailable);
    
    return {
      syntheticInertiaResponse,
      inertiaConstantContribution,
      fastFrequencyResponse,
      responseTime: this.inertialResponse.fastFrequencyResponseTime
    };
  }

  /**
   * Optimize grid stability parameters for wind integration
   */
  public optimizeStabilityParameters(
    windPenetrationTarget: number,
    gridCharacteristics: {
      totalCapacity: number;
      conventionalInertia: number;
      loadVariability: number;
    }
  ): {
    recommendedFrequencyReserve: number;
    recommendedVoltageReserve: number;
    recommendedInertiaRequirement: number;
    stabilityMarginImprovement: number;
  } {
    // Calculate recommended frequency reserve based on wind penetration
    const baseFrequencyReserve = gridCharacteristics.totalCapacity * 0.03; // 3% base reserve
    const windVariabilityFactor = 1 + windPenetrationTarget * 0.5;
    const recommendedFrequencyReserve = baseFrequencyReserve * windVariabilityFactor;
    
    // Calculate recommended voltage reserve
    const baseVoltageReserve = gridCharacteristics.totalCapacity * 0.05; // 5% base reactive reserve
    const voltageStabilityFactor = 1 + windPenetrationTarget * 0.3;
    const recommendedVoltageReserve = baseVoltageReserve * voltageStabilityFactor;
    
    // Calculate recommended inertia requirement
    const baseInertiaRequirement = 5; // 5 seconds base inertia
    const inertiaReductionFactor = windPenetrationTarget * 0.6; // Wind reduces system inertia
    const recommendedInertiaRequirement = baseInertiaRequirement / (1 - inertiaReductionFactor);
    
    // Estimate stability margin improvement
    const currentStabilityMargin = this.getCurrentStabilityMargin();
    const stabilityMarginImprovement = Math.min(0.2, (1 - currentStabilityMargin) * 0.5);
    
    return {
      recommendedFrequencyReserve,
      recommendedVoltageReserve,
      recommendedInertiaRequirement,
      stabilityMarginImprovement
    };
  }

  /**
   * Generate grid stability report
   */
  public generateStabilityReport(): {
    currentStatus: string;
    stabilityTrends: Array<{ metric: string; trend: 'improving' | 'stable' | 'degrading'; value: number }>;
    riskAssessment: string;
    recommendations: string[];
    performanceMetrics: {
      averageStability: number;
      stabilityVariability: number;
      worstCaseStability: number;
      uptimePercentage: number;
    };
  } {
    const recentHistory = this.stabilityHistory.slice(-24); // Last 24 hours
    
    // Calculate performance metrics
    const averageStability = recentHistory.length > 0 ? 
      recentHistory.reduce((sum, entry) => sum + entry.stabilityScore, 0) / recentHistory.length : 0;
    
    const stabilityValues = recentHistory.map(entry => entry.stabilityScore);
    const stabilityVariability = stabilityValues.length > 1 ? 
      Math.sqrt(stabilityValues.reduce((sum, val) => sum + Math.pow(val - averageStability, 2), 0) / (stabilityValues.length - 1)) : 0;
    
    const worstCaseStability = stabilityValues.length > 0 ? Math.min(...stabilityValues) : 0;
    const uptimePercentage = recentHistory.filter(entry => entry.stabilityScore > 0.5).length / Math.max(recentHistory.length, 1);
    
    // Assess trends
    const stabilityTrends = this.assessStabilityTrends(recentHistory);
    
    // Generate status and recommendations
    const currentStatus = this.generateCurrentStatusDescription(averageStability, worstCaseStability);
    const riskAssessment = this.generateRiskAssessment(averageStability, stabilityVariability, worstCaseStability);
    const recommendations = this.generateSystemRecommendations(averageStability, stabilityTrends);
    
    return {
      currentStatus,
      stabilityTrends,
      riskAssessment,
      recommendations,
      performanceMetrics: {
        averageStability,
        stabilityVariability,
        worstCaseStability,
        uptimePercentage
      }
    };
  }

  // Private helper methods
  private initializeDefaultConfigurations(): void {
    this.frequencyRegulation = {
      primaryReserveCapacity: 100, // 100 MW
      secondaryReserveCapacity: 200, // 200 MW
      responseTime: 10, // 10 seconds
      deadband: 0.02, // 0.02 Hz
      droop: 5 // 5%
    };
    
    this.voltageControl = {
      reactiveReserveCapacity: 150, // 150 MVAr
      voltageSetpoint: this.parameters.nominalVoltage,
      voltageDeadband: 0.01, // 1%
      tapChangerSteps: 16
    };
    
    this.inertialResponse = {
      syntheticInertiaEnabled: true,
      inertiaConstant: 4, // 4 seconds
      rateOfChangeOfFrequencyLimit: 0.5, // 0.5 Hz/s
      fastFrequencyResponseTime: 0.5 // 0.5 seconds
    };
  }

  private assessFrequencyStability(frequency: number, windPenetration: number): number {
    const frequencyDeviation = Math.abs(frequency - this.parameters.nominalFrequency);
    const maxDeviation = this.parameters.stabilityMargins.frequencyDeviationLimit;
    const baseStability = Math.max(0, 1 - frequencyDeviation / maxDeviation);
    
    // Reduce stability score for high wind penetration
    const windPenalty = windPenetration > 0.5 ? (windPenetration - 0.5) * 0.2 : 0;
    return Math.max(0, baseStability - windPenalty);
  }

  private assessVoltageStability(voltage: number, windPenetration: number): number {
    const voltageDeviation = Math.abs(voltage - this.parameters.nominalVoltage) / this.parameters.nominalVoltage;
    const maxDeviation = this.parameters.stabilityMargins.voltageDeviationLimit;
    const baseStability = Math.max(0, 1 - voltageDeviation / maxDeviation);
    
    // Reduce stability score for high wind penetration (voltage variability)
    const windPenalty = windPenetration > 0.4 ? (windPenetration - 0.4) * 0.15 : 0;
    return Math.max(0, baseStability - windPenalty);
  }

  private assessRampRateStability(rampRate: number, windPenetration: number): number {
    const maxRampRate = this.parameters.stabilityMargins.rampRateLimit * 1000; // Convert to MW
    const baseStability = Math.max(0, 1 - Math.abs(rampRate) / maxRampRate);
    
    // Increase penalty for high wind penetration (higher ramp rates)
    const windPenalty = windPenetration > 0.3 ? (windPenetration - 0.3) * 0.3 : 0;
    return Math.max(0, baseStability - windPenalty);
  }

  private assessInertialStability(windPenetration: number): number {
    // Wind reduces system inertia, so stability decreases with penetration
    const inertiaReduction = windPenetration * 0.7; // 70% inertia reduction at 100% wind
    const effectiveInertia = Math.max(0.3, 1 - inertiaReduction); // Minimum 30% inertia
    
    const requiredInertia = this.parameters.stabilityMargins.inertiaRequirement / 10; // Normalize to 0-1
    return Math.min(1, effectiveInertia / requiredInertia);
  }

  private generateStabilityRecommendations(
    freqStability: number,
    voltStability: number,
    rampStability: number,
    inertiaStability: number,
    windPenetration: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (freqStability < 0.7) {
      recommendations.push('Increase frequency regulation reserves');
      if (windPenetration > 0.4) {
        recommendations.push('Implement wind farm frequency response capabilities');
      }
    }
    
    if (voltStability < 0.7) {
      recommendations.push('Enhance reactive power support');
      recommendations.push('Consider dynamic voltage support devices');
    }
    
    if (rampStability < 0.7) {
      recommendations.push('Implement ramp rate limiting for wind farms');
      recommendations.push('Increase energy storage capacity for ramp smoothing');
    }
    
    if (inertiaStability < 0.7) {
      recommendations.push('Deploy synthetic inertia systems');
      recommendations.push('Maintain minimum conventional generation for inertia');
    }
    
    if (windPenetration > 0.6) {
      recommendations.push('Enhance wind forecasting accuracy');
      recommendations.push('Implement advanced grid flexibility measures');
    }
    
    return recommendations;
  }

  private updateStabilityHistory(
    frequency: number,
    voltage: number,
    rampRate: number,
    windPenetration: number,
    stabilityScore: number
  ): void {
    this.stabilityHistory.push({
      timestamp: Date.now(),
      frequency,
      voltage,
      rampRate,
      inertia: Math.max(2, 8 * (1 - windPenetration)), // Simplified inertia calculation
      stabilityScore
    });
    
    // Keep only last 7 days of data
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    this.stabilityHistory = this.stabilityHistory.filter(entry => entry.timestamp > sevenDaysAgo);
  }

  private calculateSustainabilityDuration(responseAmount: number, windGeneration: number): number {
    // Simplified calculation - in practice, this would consider energy storage, ramping capabilities, etc.
    const sustainabilityFactor = Math.min(1, windGeneration / Math.abs(responseAmount));
    return sustainabilityFactor * 3600; // Up to 1 hour sustainability
  }

  private calculateInertiaContribution(windGeneration: number, kineticEnergy: number): number {
    // Simplified synthetic inertia calculation
    const maxInertiaContribution = 2; // 2 seconds maximum
    const energyFactor = Math.min(1, kineticEnergy / (windGeneration * 10)); // 10 seconds of energy
    return maxInertiaContribution * energyFactor;
  }

  private getCurrentStabilityMargin(): number {
    if (this.stabilityHistory.length === 0) return 0.8;
    const recentEntries = this.stabilityHistory.slice(-6); // Last 6 hours
    return recentEntries.reduce((sum, entry) => sum + entry.stabilityScore, 0) / recentEntries.length;
  }

  private assessStabilityTrends(history: any[]): Array<{ metric: string; trend: 'improving' | 'stable' | 'degrading'; value: number }> {
    if (history.length < 12) return []; // Need at least 12 hours of data
    
    const firstHalf = history.slice(0, Math.floor(history.length / 2));
    const secondHalf = history.slice(Math.floor(history.length / 2));
    
    const trends = [];
    
    // Frequency stability trend
    const freqFirst = firstHalf.reduce((sum, entry) => sum + Math.abs(entry.frequency - this.parameters.nominalFrequency), 0) / firstHalf.length;
    const freqSecond = secondHalf.reduce((sum, entry) => sum + Math.abs(entry.frequency - this.parameters.nominalFrequency), 0) / secondHalf.length;
    trends.push({
      metric: 'Frequency Stability',
      trend: freqSecond < freqFirst ? 'improving' : freqSecond > freqFirst * 1.1 ? 'degrading' : 'stable',
      value: 1 - freqSecond / this.parameters.stabilityMargins.frequencyDeviationLimit
    });
    
    // Overall stability trend
    const stabilityFirst = firstHalf.reduce((sum, entry) => sum + entry.stabilityScore, 0) / firstHalf.length;
    const stabilitySecond = secondHalf.reduce((sum, entry) => sum + entry.stabilityScore, 0) / secondHalf.length;
    trends.push({
      metric: 'Overall Stability',
      trend: stabilitySecond > stabilityFirst ? 'improving' : stabilitySecond < stabilityFirst * 0.9 ? 'degrading' : 'stable',
      value: stabilitySecond
    });
    
    return trends;
  }

  private generateCurrentStatusDescription(averageStability: number, worstCase: number): string {
    if (averageStability > 0.8 && worstCase > 0.6) {
      return 'Grid stability is excellent with strong wind integration performance';
    } else if (averageStability > 0.6 && worstCase > 0.4) {
      return 'Grid stability is good with acceptable wind integration levels';
    } else if (averageStability > 0.4 && worstCase > 0.2) {
      return 'Grid stability is marginal, requiring attention to wind integration practices';
    } else {
      return 'Grid stability is poor, immediate action required for wind integration';
    }
  }

  private generateRiskAssessment(average: number, variability: number, worstCase: number): string {
    let riskLevel = 'Low';
    if (average < 0.6 || variability > 0.2 || worstCase < 0.3) riskLevel = 'Medium';
    if (average < 0.4 || variability > 0.3 || worstCase < 0.2) riskLevel = 'High';
    if (average < 0.3 || worstCase < 0.1) riskLevel = 'Critical';
    
    return `${riskLevel} risk level for grid stability with current wind integration practices. ` +
           `Stability variability is ${variability > 0.2 ? 'high' : 'acceptable'}.`;
  }

  private generateSystemRecommendations(average: number, trends: any[]): string[] {
    const recommendations: string[] = [];
    
    if (average < 0.7) {
      recommendations.push('Enhance grid flexibility resources');
      recommendations.push('Improve wind forecasting and dispatch coordination');
    }
    
    const degradingTrends = trends.filter(t => t.trend === 'degrading');
    if (degradingTrends.length > 0) {
      recommendations.push('Address degrading stability trends through targeted interventions');
    }
    
    recommendations.push('Continue monitoring and optimizing wind integration strategies');
    recommendations.push('Develop contingency plans for high wind penetration scenarios');
    
    return recommendations;
  }
}