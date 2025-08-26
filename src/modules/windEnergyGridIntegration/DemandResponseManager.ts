/**
 * Demand Response Manager for Wind Energy Integration
 * 
 * Manages demand response programs and load flexibility to support
 * wind energy integration and grid stability.
 */

export interface DemandResponseConfig {
  maxDemandReduction: number; // Maximum demand reduction capability (0-1)
  responseTime: number; // Response time in seconds
  participationRate: number; // Percentage of loads participating (0-1)
  programTypes: Array<'emergency' | 'economic' | 'ancillary_services' | 'wind_integration'>;
  incentiveStructure: {
    emergencyRate: number; // $/MWh for emergency response
    economicRate: number; // $/MWh for economic response
    capacityPayment: number; // $/MW/month for capacity availability
  };
}

export interface LoadForecastData {
  hourlyForecast: Array<{
    hour: number;
    baseLoad: number; // MW
    flexibleLoad: number; // MW
    confidence: number; // 0-1
  }>;
  dailyForecast: Array<{
    day: number;
    peakLoad: number; // MW
    valleyLoad: number; // MW
    flexibilityPotential: number; // MW
  }>;
}

export interface CurtailmentStrategy {
  priorityLevels: Array<{
    level: number;
    loadTypes: string[];
    maxCurtailment: number; // MW
    duration: number; // seconds
    compensation: number; // $/MWh
  }>;
  automaticTriggers: {
    frequencyThreshold: number; // Hz
    voltageThreshold: number; // %
    windPenetrationThreshold: number; // %
  };
}

export interface FlexibilityServices {
  loadShifting: {
    capacity: number; // MW
    duration: number; // hours
    efficiency: number; // %
  };
  loadShedding: {
    capacity: number; // MW
    responseTime: number; // seconds
    maxDuration: number; // hours
  };
  loadIncreasing: {
    capacity: number; // MW
    responseTime: number; // seconds
    maxDuration: number; // hours
  };
}

export class DemandResponseManager {
  private config: DemandResponseConfig;
  private curtailmentStrategy: CurtailmentStrategy;
  private flexibilityServices: FlexibilityServices;
  
  private activeProgramsHistory: Array<{
    timestamp: number;
    programType: string;
    demandReduction: number; // MW
    duration: number; // seconds
    compensation: number; // $
    effectiveness: number; // %
  }> = [];
  
  private participantDatabase: Map<string, {
    id: string;
    loadType: string;
    maxReduction: number; // MW
    responseTime: number; // seconds
    reliability: number; // %
    lastParticipation: number; // timestamp
  }> = new Map();

  constructor(config: DemandResponseConfig) {
    this.config = config;
    this.curtailmentStrategy = this.createDefaultCurtailmentStrategy();
    this.flexibilityServices = this.createDefaultFlexibilityServices();
    this.initializeParticipantDatabase();
  }

  /**
   * Activate demand response for wind energy integration
   */
  public activateDemandResponse(
    windGeneration: number,
    gridLoad: number,
    windForecast: Array<{ hour: number; expectedPower: number }>,
    gridStabilityStatus: 'stable' | 'marginal' | 'unstable',
    electricityPrice: number
  ): {
    demandResponseSignal: {
      type: 'curtail' | 'increase' | 'shift' | 'maintain';
      magnitude: number; // MW
      duration: number; // seconds
      priority: 'low' | 'medium' | 'high' | 'critical';
      targetParticipants: string[];
    };
    expectedResponse: {
      demandReduction: number; // MW
      responseTime: number; // seconds
      participationRate: number; // %
      reliability: number; // %
    };
    economicImpact: {
      compensationCost: number; // $
      gridServiceValue: number; // $
      netBenefit: number; // $
    };
    gridStabilityImpact: {
      frequencySupport: number; // Hz
      voltageSupport: number; // %
      rampRateReduction: number; // MW/min
    };
  } {
    try {
      // Assess need for demand response
      const responseNeed = this.assessDemandResponseNeed(
        windGeneration,
        gridLoad,
        windForecast,
        gridStabilityStatus,
        electricityPrice
      );
      
      // Determine optimal demand response signal
      const demandResponseSignal = this.determineDemandResponseSignal(responseNeed);
      
      // Select target participants
      const targetParticipants = this.selectTargetParticipants(
        demandResponseSignal.type,
        demandResponseSignal.magnitude,
        demandResponseSignal.priority
      );
      
      // Calculate expected response
      const expectedResponse = this.calculateExpectedResponse(
        demandResponseSignal,
        targetParticipants
      );
      
      // Calculate economic impact
      const economicImpact = this.calculateEconomicImpact(
        demandResponseSignal,
        expectedResponse
      );
      
      // Calculate grid stability impact
      const gridStabilityImpact = this.calculateGridStabilityImpact(
        demandResponseSignal,
        expectedResponse
      );
      
      // Log the demand response activation
      this.logDemandResponseActivation(demandResponseSignal, expectedResponse, economicImpact);
      
      return {
        demandResponseSignal: {
          ...demandResponseSignal,
          targetParticipants
        },
        expectedResponse,
        economicImpact,
        gridStabilityImpact
      };
      
    } catch (error) {
      console.error('Error in demand response activation:', error);
      return this.generateFailsafeDemandResponse();
    }
  }

  /**
   * Optimize demand response programs for wind integration
   */
  public optimizeDemandResponsePrograms(
    windCapacity: number,
    windVariabilityProfile: Array<{ hour: number; variability: number }>,
    loadProfile: LoadForecastData,
    economicParameters: {
      electricityPrice: number;
      windCurtailmentCost: number;
      gridStabilityValue: number;
    }
  ): {
    optimalProgramMix: Array<{
      programType: string;
      capacity: number; // MW
      utilization: number; // %
      costEffectiveness: number; // $/MW
    }>;
    flexibilityRequirements: {
      upwardFlexibility: number; // MW
      downwardFlexibility: number; // MW
      responseTime: number; // seconds
      duration: number; // hours
    };
    participantIncentives: {
      capacityPayment: number; // $/MW/month
      energyPayment: number; // $/MWh
      performanceBonus: number; // $/MW for reliability
    };
    implementationPlan: {
      phase1: string[]; // Immediate actions
      phase2: string[]; // 6-month actions
      phase3: string[]; // Long-term actions
    };
  } {
    // Calculate wind integration flexibility needs
    const flexibilityRequirements = this.calculateFlexibilityRequirements(
      windCapacity,
      windVariabilityProfile,
      loadProfile
    );
    
    // Optimize program mix
    const optimalProgramMix = this.optimizeProgramMix(
      flexibilityRequirements,
      economicParameters
    );
    
    // Calculate optimal incentives
    const participantIncentives = this.calculateOptimalIncentives(
      optimalProgramMix,
      economicParameters
    );
    
    // Generate implementation plan
    const implementationPlan = this.generateImplementationPlan(
      optimalProgramMix,
      flexibilityRequirements
    );
    
    return {
      optimalProgramMix,
      flexibilityRequirements,
      participantIncentives,
      implementationPlan
    };
  }

  /**
   * Manage load flexibility for wind integration
   */
  public manageLoadFlexibility(
    currentLoad: number,
    windGeneration: number,
    targetLoad: number,
    timeHorizon: number, // hours
    flexibilityType: 'shift' | 'shed' | 'increase'
  ): {
    flexibilityPlan: Array<{
      hour: number;
      loadAdjustment: number; // MW
      participatingLoads: string[];
      compensationRequired: number; // $
    }>;
    aggregatedImpact: {
      totalFlexibility: number; // MW
      averageResponseTime: number; // seconds
      reliabilityScore: number; // %
      costEffectiveness: number; // $/MW
    };
    riskAssessment: {
      participantFatigue: number; // %
      systemReliability: number; // %
      economicViability: number; // %
    };
  } {
    const flexibilityPlan: Array<{
      hour: number;
      loadAdjustment: number;
      participatingLoads: string[];
      compensationRequired: number;
    }> = [];
    
    const loadDifference = targetLoad - currentLoad;
    const hourlyAdjustment = loadDifference / timeHorizon;
    
    // Generate hourly flexibility plan
    for (let hour = 0; hour < timeHorizon; hour++) {
      const participants = this.selectFlexibilityParticipants(
        Math.abs(hourlyAdjustment),
        flexibilityType
      );
      
      const compensation = this.calculateFlexibilityCompensation(
        Math.abs(hourlyAdjustment),
        flexibilityType,
        participants.length
      );
      
      flexibilityPlan.push({
        hour,
        loadAdjustment: hourlyAdjustment,
        participatingLoads: participants,
        compensationRequired: compensation
      });
    }
    
    // Calculate aggregated impact
    const aggregatedImpact = this.calculateAggregatedFlexibilityImpact(flexibilityPlan);
    
    // Assess risks
    const riskAssessment = this.assessFlexibilityRisks(flexibilityPlan, flexibilityType);
    
    return {
      flexibilityPlan,
      aggregatedImpact,
      riskAssessment
    };
  }

  /**
   * Generate demand response performance report
   */
  public generatePerformanceReport(): {
    programPerformance: {
      totalActivations: number;
      averageResponse: number; // MW
      responseReliability: number; // %
      participantSatisfaction: number; // %
    };
    economicMetrics: {
      totalCompensation: number; // $
      gridServiceValue: number; // $
      costEffectiveness: number; // $/MW
      roi: number; // %
    };
    gridImpactMetrics: {
      windIntegrationSupport: number; // MWh
      gridStabilityEvents: number;
      peakReductionAchieved: number; // MW
      carbonReduction: number; // kg CO2
    };
    recommendations: string[];
  } {
    const recentHistory = this.activeProgramsHistory.slice(-30); // Last 30 activations
    
    // Calculate program performance
    const programPerformance = this.calculateProgramPerformance(recentHistory);
    
    // Calculate economic metrics
    const economicMetrics = this.calculateDemandResponseEconomics(recentHistory);
    
    // Calculate grid impact metrics
    const gridImpactMetrics = this.calculateGridImpactMetrics(recentHistory);
    
    // Generate recommendations
    const recommendations = this.generateDemandResponseRecommendations(
      programPerformance,
      economicMetrics,
      gridImpactMetrics
    );
    
    return {
      programPerformance,
      economicMetrics,
      gridImpactMetrics,
      recommendations
    };
  }

  // Private helper methods
  private createDefaultCurtailmentStrategy(): CurtailmentStrategy {
    return {
      priorityLevels: [
        {
          level: 1,
          loadTypes: ['industrial_interruptible', 'data_centers'],
          maxCurtailment: 100, // MW
          duration: 7200, // 2 hours
          compensation: 150 // $/MWh
        },
        {
          level: 2,
          loadTypes: ['commercial_hvac', 'water_heating'],
          maxCurtailment: 200, // MW
          duration: 3600, // 1 hour
          compensation: 100 // $/MWh
        },
        {
          level: 3,
          loadTypes: ['residential_appliances', 'ev_charging'],
          maxCurtailment: 300, // MW
          duration: 1800, // 30 minutes
          compensation: 75 // $/MWh
        }
      ],
      automaticTriggers: {
        frequencyThreshold: 49.8, // Hz
        voltageThreshold: 0.05, // 5%
        windPenetrationThreshold: 0.7 // 70%
      }
    };
  }

  private createDefaultFlexibilityServices(): FlexibilityServices {
    return {
      loadShifting: {
        capacity: 500, // MW
        duration: 4, // hours
        efficiency: 0.95 // 95%
      },
      loadShedding: {
        capacity: 800, // MW
        responseTime: 300, // 5 minutes
        maxDuration: 2 // hours
      },
      loadIncreasing: {
        capacity: 400, // MW
        responseTime: 600, // 10 minutes
        maxDuration: 6 // hours
      }
    };
  }

  private initializeParticipantDatabase(): void {
    // Initialize with sample participants
    const sampleParticipants = [
      { id: 'IND001', loadType: 'industrial', maxReduction: 50, responseTime: 300, reliability: 0.95 },
      { id: 'COM001', loadType: 'commercial', maxReduction: 25, responseTime: 600, reliability: 0.90 },
      { id: 'RES001', loadType: 'residential', maxReduction: 10, responseTime: 900, reliability: 0.85 },
      { id: 'DC001', loadType: 'data_center', maxReduction: 30, responseTime: 180, reliability: 0.98 }
    ];
    
    sampleParticipants.forEach(participant => {
      this.participantDatabase.set(participant.id, {
        ...participant,
        lastParticipation: 0
      });
    });
  }

  private assessDemandResponseNeed(
    windGeneration: number,
    gridLoad: number,
    windForecast: any[],
    gridStabilityStatus: string,
    electricityPrice: number
  ): {
    urgency: 'low' | 'medium' | 'high' | 'critical';
    type: 'curtail' | 'increase' | 'shift' | 'maintain';
    magnitude: number;
    duration: number;
  } {
    const windPenetration = windGeneration / gridLoad;
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let type: 'curtail' | 'increase' | 'shift' | 'maintain' = 'maintain';
    let magnitude = 0;
    let duration = 0;
    
    // Assess based on grid stability
    if (gridStabilityStatus === 'unstable') {
      urgency = 'critical';
      type = 'curtail';
      magnitude = gridLoad * 0.1; // 10% load reduction
      duration = 1800; // 30 minutes
    } else if (gridStabilityStatus === 'marginal') {
      urgency = 'high';
      type = 'curtail';
      magnitude = gridLoad * 0.05; // 5% load reduction
      duration = 3600; // 1 hour
    }
    
    // Assess based on wind penetration
    if (windPenetration > 0.8) {
      urgency = Math.max(urgency === 'low' ? 0 : urgency === 'medium' ? 1 : urgency === 'high' ? 2 : 3, 1) === 1 ? 'medium' : urgency === 'high' ? 'high' : 'critical';
      type = 'increase';
      magnitude = Math.max(magnitude, windGeneration - gridLoad);
      duration = Math.max(duration, 7200); // 2 hours
    }
    
    // Assess based on electricity price
    if (electricityPrice > 0.2) { // High price threshold
      urgency = Math.max(urgency === 'low' ? 0 : urgency === 'medium' ? 1 : urgency === 'high' ? 2 : 3, 1) === 1 ? 'medium' : urgency === 'high' ? 'high' : 'critical';
      type = 'curtail';
      magnitude = Math.max(magnitude, gridLoad * 0.03); // 3% load reduction
      duration = Math.max(duration, 3600); // 1 hour
    }
    
    return { urgency, type, magnitude, duration };
  }

  private determineDemandResponseSignal(responseNeed: any): {
    type: 'curtail' | 'increase' | 'shift' | 'maintain';
    magnitude: number;
    duration: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
  } {
    return {
      type: responseNeed.type,
      magnitude: Math.min(responseNeed.magnitude, this.getMaxAvailableFlexibility(responseNeed.type)),
      duration: responseNeed.duration,
      priority: responseNeed.urgency
    };
  }

  private selectTargetParticipants(
    type: string,
    magnitude: number,
    priority: string
  ): string[] {
    const participants: string[] = [];
    let remainingMagnitude = magnitude;
    
    // Sort participants by reliability and response time
    const sortedParticipants = Array.from(this.participantDatabase.values())
      .sort((a, b) => {
        if (priority === 'critical') {
          return a.responseTime - b.responseTime; // Fastest response first
        }
        return b.reliability - a.reliability; // Most reliable first
      });
    
    for (const participant of sortedParticipants) {
      if (remainingMagnitude <= 0) break;
      
      if (this.isParticipantEligible(participant, type, priority)) {
        participants.push(participant.id);
        remainingMagnitude -= participant.maxReduction;
      }
    }
    
    return participants;
  }

  private calculateExpectedResponse(signal: any, participants: string[]): {
    demandReduction: number;
    responseTime: number;
    participationRate: number;
    reliability: number;
  } {
    let totalReduction = 0;
    let weightedResponseTime = 0;
    let weightedReliability = 0;
    
    participants.forEach(participantId => {
      const participant = this.participantDatabase.get(participantId);
      if (participant) {
        totalReduction += participant.maxReduction;
        weightedResponseTime += participant.responseTime * participant.maxReduction;
        weightedReliability += participant.reliability * participant.maxReduction;
      }
    });
    
    const averageResponseTime = totalReduction > 0 ? weightedResponseTime / totalReduction : 0;
    const averageReliability = totalReduction > 0 ? weightedReliability / totalReduction : 0;
    const participationRate = participants.length / this.participantDatabase.size;
    
    return {
      demandReduction: Math.min(totalReduction, signal.magnitude),
      responseTime: averageResponseTime,
      participationRate,
      reliability: averageReliability
    };
  }

  private calculateEconomicImpact(signal: any, response: any): {
    compensationCost: number;
    gridServiceValue: number;
    netBenefit: number;
  } {
    const energyMWh = response.demandReduction * signal.duration / 3600000; // Convert to MWh
    
    let compensationRate = 100; // Default $/MWh
    if (signal.priority === 'critical') compensationRate = 200;
    else if (signal.priority === 'high') compensationRate = 150;
    else if (signal.priority === 'medium') compensationRate = 125;
    
    const compensationCost = energyMWh * compensationRate;
    
    // Grid service value based on avoided costs and stability benefits
    const gridServiceValue = energyMWh * 180 + response.demandReduction * 50; // Energy + capacity value
    
    return {
      compensationCost,
      gridServiceValue,
      netBenefit: gridServiceValue - compensationCost
    };
  }

  private calculateGridStabilityImpact(signal: any, response: any): {
    frequencySupport: number;
    voltageSupport: number;
    rampRateReduction: number;
  } {
    const frequencySupport = signal.type === 'curtail' ? response.demandReduction * 0.01 : 0; // 0.01 Hz per MW
    const voltageSupport = signal.type === 'curtail' ? response.demandReduction * 0.005 : 0; // 0.5% per MW
    const rampRateReduction = response.demandReduction / (signal.duration / 60); // MW/min
    
    return {
      frequencySupport,
      voltageSupport,
      rampRateReduction
    };
  }

  private logDemandResponseActivation(signal: any, response: any, economics: any): void {
    this.activeProgramsHistory.push({
      timestamp: Date.now(),
      programType: `${signal.type}_${signal.priority}`,
      demandReduction: response.demandReduction,
      duration: signal.duration,
      compensation: economics.compensationCost,
      effectiveness: response.reliability
    });
    
    // Keep only last 100 activations
    if (this.activeProgramsHistory.length > 100) {
      this.activeProgramsHistory = this.activeProgramsHistory.slice(-100);
    }
  }

  private generateFailsafeDemandResponse(): any {
    return {
      demandResponseSignal: {
        type: 'maintain' as const,
        magnitude: 0,
        duration: 0,
        priority: 'low' as const,
        targetParticipants: []
      },
      expectedResponse: {
        demandReduction: 0,
        responseTime: 0,
        participationRate: 0,
        reliability: 0
      },
      economicImpact: {
        compensationCost: 0,
        gridServiceValue: 0,
        netBenefit: 0
      },
      gridStabilityImpact: {
        frequencySupport: 0,
        voltageSupport: 0,
        rampRateReduction: 0
      }
    };
  }

  private getMaxAvailableFlexibility(type: string): number {
    switch (type) {
      case 'curtail':
        return this.flexibilityServices.loadShedding.capacity;
      case 'increase':
        return this.flexibilityServices.loadIncreasing.capacity;
      case 'shift':
        return this.flexibilityServices.loadShifting.capacity;
      default:
        return 0;
    }
  }

  private isParticipantEligible(participant: any, type: string, priority: string): boolean {
    // Check if participant hasn't been used recently (avoid fatigue)
    const timeSinceLastUse = Date.now() - participant.lastParticipation;
    const minInterval = priority === 'critical' ? 3600000 : 7200000; // 1-2 hours
    
    return timeSinceLastUse > minInterval && participant.reliability > 0.7;
  }

  private calculateFlexibilityRequirements(windCapacity: number, variabilityProfile: any[], loadProfile: any): any {
    const maxVariability = Math.max(...variabilityProfile.map(p => p.variability));
    const avgLoad = loadProfile.hourlyForecast.reduce((sum: number, h: any) => sum + h.baseLoad, 0) / loadProfile.hourlyForecast.length;
    
    return {
      upwardFlexibility: windCapacity * maxVariability * 0.3, // 30% of max variability
      downwardFlexibility: avgLoad * 0.15, // 15% of average load
      responseTime: 600, // 10 minutes
      duration: 4 // 4 hours
    };
  }

  private optimizeProgramMix(requirements: any, economics: any): any[] {
    return [
      {
        programType: 'emergency_curtailment',
        capacity: requirements.downwardFlexibility * 0.4,
        utilization: 5, // 5% utilization
        costEffectiveness: 150 // $/MW
      },
      {
        programType: 'economic_curtailment',
        capacity: requirements.downwardFlexibility * 0.6,
        utilization: 20, // 20% utilization
        costEffectiveness: 100 // $/MW
      },
      {
        programType: 'load_shifting',
        capacity: requirements.upwardFlexibility * 0.5,
        utilization: 30, // 30% utilization
        costEffectiveness: 75 // $/MW
      }
    ];
  }

  private calculateOptimalIncentives(programMix: any[], economics: any): any {
    return {
      capacityPayment: 5, // $/MW/month
      energyPayment: 100, // $/MWh
      performanceBonus: 10 // $/MW for reliability
    };
  }

  private generateImplementationPlan(programMix: any[], requirements: any): any {
    return {
      phase1: [
        'Deploy emergency curtailment programs',
        'Establish participant communication systems',
        'Implement automated response systems'
      ],
      phase2: [
        'Expand economic curtailment programs',
        'Develop load shifting capabilities',
        'Enhance forecasting and optimization'
      ],
      phase3: [
        'Integrate with wholesale markets',
        'Develop advanced flexibility services',
        'Implement machine learning optimization'
      ]
    };
  }

  private selectFlexibilityParticipants(magnitude: number, type: string): string[] {
    return Array.from(this.participantDatabase.keys()).slice(0, Math.ceil(magnitude / 25)); // Simplified selection
  }

  private calculateFlexibilityCompensation(magnitude: number, type: string, participantCount: number): number {
    const baseRate = type === 'shed' ? 150 : type === 'shift' ? 75 : 50; // $/MWh
    return magnitude * baseRate * participantCount / 1000; // Convert to $
  }

  private calculateAggregatedFlexibilityImpact(plan: any[]): any {
    const totalFlexibility = plan.reduce((sum, hour) => sum + Math.abs(hour.loadAdjustment), 0);
    const averageResponseTime = 600; // Simplified
    const reliabilityScore = 85; // Simplified
    const costEffectiveness = 100; // Simplified $/MW
    
    return {
      totalFlexibility,
      averageResponseTime,
      reliabilityScore,
      costEffectiveness
    };
  }

  private assessFlexibilityRisks(plan: any[], type: string): any {
    return {
      participantFatigue: plan.length > 12 ? 30 : 15, // % risk
      systemReliability: 95, // % reliability
      economicViability: 85 // % viability
    };
  }

  private calculateProgramPerformance(history: any[]): any {
    if (history.length === 0) {
      return {
        totalActivations: 0,
        averageResponse: 0,
        responseReliability: 0,
        participantSatisfaction: 0
      };
    }
    
    return {
      totalActivations: history.length,
      averageResponse: history.reduce((sum, entry) => sum + entry.demandReduction, 0) / history.length,
      responseReliability: history.reduce((sum, entry) => sum + entry.effectiveness, 0) / history.length,
      participantSatisfaction: 85 // Simplified metric
    };
  }

  private calculateDemandResponseEconomics(history: any[]): any {
    const totalCompensation = history.reduce((sum, entry) => sum + entry.compensation, 0);
    const totalGridValue = totalCompensation * 1.5; // Simplified calculation
    
    return {
      totalCompensation,
      gridServiceValue: totalGridValue,
      costEffectiveness: totalGridValue / Math.max(totalCompensation, 1),
      roi: ((totalGridValue - totalCompensation) / Math.max(totalCompensation, 1)) * 100
    };
  }

  private calculateGridImpactMetrics(history: any[]): any {
    const totalEnergyReduced = history.reduce((sum, entry) => sum + (entry.demandReduction * entry.duration / 3600000), 0);
    
    return {
      windIntegrationSupport: totalEnergyReduced,
      gridStabilityEvents: history.filter(entry => entry.programType.includes('critical')).length,
      peakReductionAchieved: Math.max(...history.map(entry => entry.demandReduction), 0),
      carbonReduction: totalEnergyReduced * 500 // kg CO2 per MWh
    };
  }

  private generateDemandResponseRecommendations(performance: any, economics: any, gridImpact: any): string[] {
    const recommendations: string[] = [];
    
    if (performance.responseReliability < 0.8) {
      recommendations.push('Improve participant training and communication systems');
    }
    
    if (economics.roi < 20) {
      recommendations.push('Optimize incentive structures to improve cost-effectiveness');
    }
    
    if (gridImpact.windIntegrationSupport < 1000) {
      recommendations.push('Expand demand response capacity to better support wind integration');
    }
    
    recommendations.push('Develop advanced forecasting capabilities for proactive demand response');
    recommendations.push('Integrate with energy storage systems for enhanced flexibility');
    
    return recommendations;
  }
}