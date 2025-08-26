/**
 * Wind Energy Storage Coordinator
 * 
 * Coordinates energy storage systems for optimal wind energy integration,
 * managing battery systems, compressed air storage, and hybrid configurations.
 */

export interface StorageSystemConfig {
  totalCapacity: number; // Wh - total energy storage capacity
  powerRating: number; // W - maximum power rating
  efficiency: number; // Round-trip efficiency (0-1)
  responseTime: number; // seconds - response time for commands
  cycleLife: number; // number of charge/discharge cycles
  degradationRate: number; // annual capacity degradation rate (0-1)
}

export interface StorageOptimizationStrategy {
  chargingStrategy: 'immediate' | 'delayed' | 'optimized';
  dischargingStrategy: 'demand_following' | 'peak_shaving' | 'grid_support';
  socManagement: {
    minSOC: number; // Minimum state of charge (0-1)
    maxSOC: number; // Maximum state of charge (0-1)
    targetSOC: number; // Target state of charge for normal operation
  };
  economicOptimization: boolean;
  gridServicePriority: 'low' | 'medium' | 'high';
}

export interface BatteryManagementConfig {
  cellVoltageRange: { min: number; max: number }; // V
  temperatureRange: { min: number; max: number }; // °C
  chargingCurrent: { max: number; optimal: number }; // A
  dischargingCurrent: { max: number; optimal: number }; // A
  balancingEnabled: boolean;
  thermalManagementEnabled: boolean;
}

export interface HybridStorageConfig {
  batteryCapacity: number; // Wh
  supercapacitorCapacity: number; // Wh
  compressedAirCapacity: number; // Wh
  pumpedHydroCapacity: number; // Wh
  coordinationStrategy: 'power_based' | 'duration_based' | 'cost_optimized';
}

export class WindEnergyStorageCoordinator {
  private config: StorageSystemConfig;
  private optimizationStrategy: StorageOptimizationStrategy;
  private batteryManagement: BatteryManagementConfig;
  private hybridConfig?: HybridStorageConfig;
  
  private currentSOC: number = 0.5; // 50% initial state of charge
  private cycleCount: number = 0;
  private degradationFactor: number = 1.0;
  
  private operationHistory: Array<{
    timestamp: number;
    operation: 'charge' | 'discharge' | 'standby';
    power: number;
    soc: number;
    efficiency: number;
    gridService: string;
  }> = [];

  constructor(
    config: StorageSystemConfig,
    optimizationStrategy?: StorageOptimizationStrategy,
    hybridConfig?: HybridStorageConfig
  ) {
    this.config = config;
    this.optimizationStrategy = optimizationStrategy || this.createDefaultOptimizationStrategy();
    this.batteryManagement = this.createDefaultBatteryManagement();
    this.hybridConfig = hybridConfig;
  }

  /**
   * Coordinate storage operation for wind energy integration
   */
  public coordinateStorageOperation(
    windGeneration: number,
    windForecast: Array<{ hour: number; expectedPower: number }>,
    gridDemand: number,
    electricityPrice: number,
    gridStabilityNeeds: {
      frequencyRegulation: number;
      voltageSupport: number;
      rampSmoothing: number;
    }
  ): {
    storageCommand: {
      operation: 'charge' | 'discharge' | 'standby';
      power: number; // W
      duration: number; // seconds
      priority: 'low' | 'medium' | 'high' | 'critical';
    };
    gridServices: {
      frequencyRegulation: number; // MW
      voltageSupport: number; // MVAr
      energyArbitrage: number; // MWh
      windSmoothing: number; // MW
    };
    economicValue: {
      energyRevenue: number; // Currency units
      gridServiceRevenue: number; // Currency units
      operatingCost: number; // Currency units
      netValue: number; // Currency units
    };
    systemStatus: {
      currentSOC: number;
      availableCapacity: number; // Wh
      healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
      cycleLife: number; // Remaining cycles
    };
  } {
    try {
      // Assess current storage state
      const availableCapacity = this.calculateAvailableCapacity();
      const healthStatus = this.assessSystemHealth();
      
      // Determine optimal operation based on multiple factors
      const storageCommand = this.determineOptimalOperation(
        windGeneration,
        windForecast,
        gridDemand,
        electricityPrice,
        gridStabilityNeeds,
        availableCapacity
      );
      
      // Calculate grid services provision
      const gridServices = this.calculateGridServices(storageCommand, gridStabilityNeeds);
      
      // Calculate economic value
      const economicValue = this.calculateEconomicValue(
        storageCommand,
        gridServices,
        electricityPrice
      );
      
      // Update system state
      this.updateSystemState(storageCommand);
      
      // Log operation
      this.logOperation(storageCommand, gridServices);
      
      return {
        storageCommand,
        gridServices,
        economicValue,
        systemStatus: {
          currentSOC: this.currentSOC,
          availableCapacity,
          healthStatus,
          cycleLife: this.calculateRemainingCycles()
        }
      };
      
    } catch (error) {
      console.error('Error in storage coordination:', error);
      return this.generateFailsafeOperation();
    }
  }

  /**
   * Optimize storage sizing for wind integration
   */
  public optimizeStorageSizing(
    windCapacity: number,
    windVariabilityProfile: Array<{ hour: number; variability: number }>,
    gridCharacteristics: {
      peakDemand: number;
      minimumDemand: number;
      rampRate: number;
    },
    economicParameters: {
      capitalCost: number; // $/Wh
      operatingCost: number; // $/MWh
      electricityPrice: number; // $/MWh
      gridServiceValue: number; // $/MW
    }
  ): {
    optimalCapacity: number; // Wh
    optimalPowerRating: number; // W
    capacityUtilization: number; // %
    economicViability: {
      npv: number; // Net present value
      paybackPeriod: number; // years
      irr: number; // Internal rate of return
    };
    sizingRecommendations: string[];
  } {
    // Calculate wind energy variability requirements
    const maxVariability = Math.max(...windVariabilityProfile.map(p => p.variability));
    const avgVariability = windVariabilityProfile.reduce((sum, p) => sum + p.variability, 0) / windVariabilityProfile.length;
    
    // Base storage sizing on wind capacity and variability
    const baseCapacity = windCapacity * 0.25; // 25% of wind capacity as base
    const variabilityFactor = 1 + (maxVariability - avgVariability) * 2;
    const optimalCapacity = baseCapacity * variabilityFactor;
    
    // Size power rating based on grid ramp requirements
    const rampRequirement = Math.max(gridCharacteristics.rampRate, windCapacity * 0.1); // 10% of wind capacity per hour
    const optimalPowerRating = rampRequirement * 2; // 2x ramp rate for flexibility
    
    // Calculate capacity utilization
    const dailyEnergyThroughput = this.estimateDailyEnergyThroughput(windVariabilityProfile, optimalCapacity);
    const capacityUtilization = (dailyEnergyThroughput / optimalCapacity) * 100;
    
    // Economic analysis
    const economicViability = this.performEconomicAnalysis(
      optimalCapacity,
      optimalPowerRating,
      capacityUtilization,
      economicParameters
    );
    
    // Generate sizing recommendations
    const sizingRecommendations = this.generateSizingRecommendations(
      optimalCapacity,
      optimalPowerRating,
      capacityUtilization,
      economicViability
    );
    
    return {
      optimalCapacity,
      optimalPowerRating,
      capacityUtilization,
      economicViability,
      sizingRecommendations
    };
  }

  /**
   * Manage hybrid storage systems
   */
  public manageHybridStorage(
    powerDemand: number,
    durationRequirement: number, // seconds
    responseTimeRequirement: number, // seconds
    costOptimization: boolean
  ): {
    batteryAllocation: number; // W
    supercapacitorAllocation: number; // W
    compressedAirAllocation: number; // W
    pumpedHydroAllocation: number; // W
    coordinationStrategy: string;
    efficiencyOptimization: number; // %
  } {
    if (!this.hybridConfig) {
      throw new Error('Hybrid storage configuration not available');
    }
    
    let batteryAllocation = 0;
    let supercapacitorAllocation = 0;
    let compressedAirAllocation = 0;
    let pumpedHydroAllocation = 0;
    
    // Allocate based on response time requirements
    if (responseTimeRequirement < 1) {
      // Ultra-fast response - use supercapacitors
      supercapacitorAllocation = Math.min(powerDemand, this.hybridConfig.supercapacitorCapacity / 3600);
      powerDemand -= supercapacitorAllocation;
    }
    
    if (responseTimeRequirement < 60 && powerDemand > 0) {
      // Fast response - use batteries
      batteryAllocation = Math.min(powerDemand, this.hybridConfig.batteryCapacity / 3600);
      powerDemand -= batteryAllocation;
    }
    
    if (durationRequirement > 3600 && powerDemand > 0) {
      // Long duration - use compressed air or pumped hydro
      if (costOptimization) {
        // Prefer compressed air for cost optimization
        compressedAirAllocation = Math.min(powerDemand * 0.7, this.hybridConfig.compressedAirCapacity / 3600);
        pumpedHydroAllocation = Math.min(powerDemand * 0.3, this.hybridConfig.pumpedHydroCapacity / 3600);
      } else {
        // Prefer pumped hydro for efficiency
        pumpedHydroAllocation = Math.min(powerDemand * 0.6, this.hybridConfig.pumpedHydroCapacity / 3600);
        compressedAirAllocation = Math.min(powerDemand * 0.4, this.hybridConfig.compressedAirCapacity / 3600);
      }
    }
    
    const coordinationStrategy = this.determineCoordinationStrategy(
      batteryAllocation,
      supercapacitorAllocation,
      compressedAirAllocation,
      pumpedHydroAllocation
    );
    
    const efficiencyOptimization = this.calculateHybridEfficiency(
      batteryAllocation,
      supercapacitorAllocation,
      compressedAirAllocation,
      pumpedHydroAllocation
    );
    
    return {
      batteryAllocation,
      supercapacitorAllocation,
      compressedAirAllocation,
      pumpedHydroAllocation,
      coordinationStrategy,
      efficiencyOptimization
    };
  }

  /**
   * Generate storage performance report
   */
  public generatePerformanceReport(): {
    operationalMetrics: {
      averageEfficiency: number;
      cycleCount: number;
      capacityRetention: number;
      availability: number;
    };
    economicMetrics: {
      totalRevenue: number;
      operatingCosts: number;
      netProfit: number;
      roi: number;
    };
    gridServiceMetrics: {
      frequencyRegulationHours: number;
      voltageSupport: number;
      energyArbitrage: number;
      windSmoothing: number;
    };
    recommendations: string[];
  } {
    const recentHistory = this.operationHistory.slice(-168); // Last 7 days
    
    // Calculate operational metrics
    const operationalMetrics = this.calculateOperationalMetrics(recentHistory);
    
    // Calculate economic metrics
    const economicMetrics = this.calculateEconomicMetrics(recentHistory);
    
    // Calculate grid service metrics
    const gridServiceMetrics = this.calculateGridServiceMetrics(recentHistory);
    
    // Generate recommendations
    const recommendations = this.generatePerformanceRecommendations(
      operationalMetrics,
      economicMetrics,
      gridServiceMetrics
    );
    
    return {
      operationalMetrics,
      economicMetrics,
      gridServiceMetrics,
      recommendations
    };
  }

  // Private helper methods
  private createDefaultOptimizationStrategy(): StorageOptimizationStrategy {
    return {
      chargingStrategy: 'optimized',
      dischargingStrategy: 'grid_support',
      socManagement: {
        minSOC: 0.1,
        maxSOC: 0.95,
        targetSOC: 0.6
      },
      economicOptimization: true,
      gridServicePriority: 'high'
    };
  }

  private createDefaultBatteryManagement(): BatteryManagementConfig {
    return {
      cellVoltageRange: { min: 3.0, max: 4.2 },
      temperatureRange: { min: -10, max: 45 },
      chargingCurrent: { max: 100, optimal: 50 },
      dischargingCurrent: { max: 150, optimal: 75 },
      balancingEnabled: true,
      thermalManagementEnabled: true
    };
  }

  private calculateAvailableCapacity(): number {
    return this.config.totalCapacity * this.degradationFactor;
  }

  private assessSystemHealth(): 'excellent' | 'good' | 'fair' | 'poor' {
    if (this.degradationFactor > 0.9 && this.cycleCount < this.config.cycleLife * 0.3) return 'excellent';
    if (this.degradationFactor > 0.8 && this.cycleCount < this.config.cycleLife * 0.6) return 'good';
    if (this.degradationFactor > 0.7 && this.cycleCount < this.config.cycleLife * 0.8) return 'fair';
    return 'poor';
  }

  private determineOptimalOperation(
    windGeneration: number,
    windForecast: Array<{ hour: number; expectedPower: number }>,
    gridDemand: number,
    electricityPrice: number,
    gridStabilityNeeds: any,
    availableCapacity: number
  ): { operation: 'charge' | 'discharge' | 'standby'; power: number; duration: number; priority: 'low' | 'medium' | 'high' | 'critical' } {
    const excessWind = windGeneration - gridDemand;
    const maxPower = this.config.powerRating;
    
    // Priority 1: Grid stability needs
    if (gridStabilityNeeds.frequencyRegulation > 0 || gridStabilityNeeds.voltageSupport > 0) {
      if (this.currentSOC > this.optimizationStrategy.socManagement.minSOC + 0.1) {
        return {
          operation: 'discharge',
          power: Math.min(maxPower, gridStabilityNeeds.frequencyRegulation * 1000000),
          duration: 1800, // 30 minutes
          priority: 'critical'
        };
      }
    }
    
    // Priority 2: Wind smoothing
    if (gridStabilityNeeds.rampSmoothing > 0 && excessWind > 0) {
      if (this.currentSOC < this.optimizationStrategy.socManagement.maxSOC) {
        return {
          operation: 'charge',
          power: Math.min(maxPower, excessWind),
          duration: 3600, // 1 hour
          priority: 'high'
        };
      }
    }
    
    // Priority 3: Economic optimization
    if (this.optimizationStrategy.economicOptimization) {
      const nextHourForecast = windForecast.find(f => f.hour === (new Date().getHours() + 1) % 24);
      if (nextHourForecast && electricityPrice < 0.05) { // Low price threshold
        if (this.currentSOC < this.optimizationStrategy.socManagement.maxSOC) {
          return {
            operation: 'charge',
            power: Math.min(maxPower, excessWind),
            duration: 3600,
            priority: 'medium'
          };
        }
      } else if (electricityPrice > 0.15) { // High price threshold
        if (this.currentSOC > this.optimizationStrategy.socManagement.minSOC + 0.2) {
          return {
            operation: 'discharge',
            power: Math.min(maxPower, gridDemand * 0.2),
            duration: 3600,
            priority: 'medium'
          };
        }
      }
    }
    
    return {
      operation: 'standby',
      power: 0,
      duration: 0,
      priority: 'low'
    };
  }

  private calculateGridServices(storageCommand: any, gridStabilityNeeds: any): any {
    const power = storageCommand.power / 1000000; // Convert to MW
    
    return {
      frequencyRegulation: storageCommand.operation === 'discharge' ? Math.min(power, gridStabilityNeeds.frequencyRegulation) : 0,
      voltageSupport: storageCommand.operation === 'discharge' ? Math.min(power * 0.5, gridStabilityNeeds.voltageSupport) : 0,
      energyArbitrage: storageCommand.operation === 'discharge' ? power * storageCommand.duration / 3600 : 0,
      windSmoothing: storageCommand.operation === 'charge' ? power : 0
    };
  }

  private calculateEconomicValue(storageCommand: any, gridServices: any, electricityPrice: number): any {
    const energyMWh = storageCommand.power * storageCommand.duration / 3600000000; // Convert to MWh
    
    const energyRevenue = storageCommand.operation === 'discharge' ? 
      energyMWh * electricityPrice : -energyMWh * electricityPrice * 0.8; // 80% charging cost
    
    const gridServiceRevenue = 
      gridServices.frequencyRegulation * 50 + // $50/MW for frequency regulation
      gridServices.voltageSupport * 30 + // $30/MVAr for voltage support
      gridServices.windSmoothing * 20; // $20/MW for wind smoothing
    
    const operatingCost = energyMWh * 2; // $2/MWh operating cost
    
    return {
      energyRevenue,
      gridServiceRevenue,
      operatingCost,
      netValue: energyRevenue + gridServiceRevenue - operatingCost
    };
  }

  private updateSystemState(storageCommand: any): void {
    const energyChange = storageCommand.power * storageCommand.duration / 3600; // Wh
    const efficiency = storageCommand.operation === 'charge' ? this.config.efficiency : 1 / this.config.efficiency;
    
    if (storageCommand.operation === 'charge') {
      this.currentSOC = Math.min(
        this.optimizationStrategy.socManagement.maxSOC,
        this.currentSOC + (energyChange * efficiency) / this.calculateAvailableCapacity()
      );
    } else if (storageCommand.operation === 'discharge') {
      this.currentSOC = Math.max(
        this.optimizationStrategy.socManagement.minSOC,
        this.currentSOC - energyChange / (this.calculateAvailableCapacity() * efficiency)
      );
      this.cycleCount += 0.5; // Half cycle for discharge
    }
    
    // Update degradation
    this.degradationFactor = Math.max(0.5, 1 - (this.cycleCount / this.config.cycleLife) * this.config.degradationRate);
  }

  private logOperation(storageCommand: any, gridServices: any): void {
    this.operationHistory.push({
      timestamp: Date.now(),
      operation: storageCommand.operation,
      power: storageCommand.power,
      soc: this.currentSOC,
      efficiency: this.config.efficiency,
      gridService: Object.keys(gridServices).find(key => gridServices[key] > 0) || 'none'
    });
    
    // Keep only last 30 days of data
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    this.operationHistory = this.operationHistory.filter(entry => entry.timestamp > thirtyDaysAgo);
  }

  private generateFailsafeOperation(): any {
    return {
      storageCommand: {
        operation: 'standby' as const,
        power: 0,
        duration: 0,
        priority: 'low' as const
      },
      gridServices: {
        frequencyRegulation: 0,
        voltageSupport: 0,
        energyArbitrage: 0,
        windSmoothing: 0
      },
      economicValue: {
        energyRevenue: 0,
        gridServiceRevenue: 0,
        operatingCost: 0,
        netValue: 0
      },
      systemStatus: {
        currentSOC: this.currentSOC,
        availableCapacity: this.calculateAvailableCapacity(),
        healthStatus: 'fair' as const,
        cycleLife: this.calculateRemainingCycles()
      }
    };
  }

  private calculateRemainingCycles(): number {
    return Math.max(0, this.config.cycleLife - this.cycleCount);
  }

  private estimateDailyEnergyThroughput(variabilityProfile: any[], capacity: number): number {
    const avgVariability = variabilityProfile.reduce((sum, p) => sum + p.variability, 0) / variabilityProfile.length;
    return capacity * avgVariability * 2; // Simplified estimation
  }

  private performEconomicAnalysis(capacity: number, powerRating: number, utilization: number, economics: any): any {
    const capitalCost = capacity * economics.capitalCost;
    const annualRevenue = (capacity * utilization / 100) * 365 * economics.electricityPrice / 1000000; // Convert to MWh
    const annualOperatingCost = annualRevenue * 0.1; // 10% of revenue
    const annualNetCashFlow = annualRevenue - annualOperatingCost;
    
    const paybackPeriod = capitalCost / annualNetCashFlow;
    const npv = this.calculateNPV(capitalCost, annualNetCashFlow, 20, 0.08); // 20 years, 8% discount rate
    const irr = this.calculateIRR(capitalCost, annualNetCashFlow, 20);
    
    return { npv, paybackPeriod, irr };
  }

  private calculateNPV(initialCost: number, annualCashFlow: number, years: number, discountRate: number): number {
    let npv = -initialCost;
    for (let year = 1; year <= years; year++) {
      npv += annualCashFlow / Math.pow(1 + discountRate, year);
    }
    return npv;
  }

  private calculateIRR(initialCost: number, annualCashFlow: number, years: number): number {
    // Simplified IRR calculation using approximation
    return (annualCashFlow / initialCost) * years > 1 ? 
      Math.pow(annualCashFlow * years / initialCost, 1 / years) - 1 : 0;
  }

  private generateSizingRecommendations(capacity: number, powerRating: number, utilization: number, economics: any): string[] {
    const recommendations: string[] = [];
    
    if (utilization < 30) {
      recommendations.push('Consider reducing storage capacity to improve utilization');
    } else if (utilization > 80) {
      recommendations.push('Consider increasing storage capacity to meet demand');
    }
    
    if (economics.paybackPeriod > 15) {
      recommendations.push('Evaluate cost reduction opportunities or additional revenue streams');
    }
    
    if (economics.npv < 0) {
      recommendations.push('Current sizing may not be economically viable - reassess parameters');
    }
    
    recommendations.push('Consider hybrid storage configuration for optimal performance');
    recommendations.push('Implement advanced control algorithms for efficiency optimization');
    
    return recommendations;
  }

  private determineCoordinationStrategy(battery: number, supercap: number, compressedAir: number, pumpedHydro: number): string {
    if (supercap > 0 && battery > 0) return 'Fast response with battery backup';
    if (battery > 0 && (compressedAir > 0 || pumpedHydro > 0)) return 'Medium-term with long-duration support';
    if (compressedAir > 0 && pumpedHydro > 0) return 'Long-duration hybrid approach';
    return 'Single technology optimization';
  }

  private calculateHybridEfficiency(battery: number, supercap: number, compressedAir: number, pumpedHydro: number): number {
    const totalPower = battery + supercap + compressedAir + pumpedHydro;
    if (totalPower === 0) return 0;
    
    const weightedEfficiency = 
      (battery * 0.9 + supercap * 0.95 + compressedAir * 0.7 + pumpedHydro * 0.8) / totalPower;
    
    return weightedEfficiency * 100;
  }

  private calculateOperationalMetrics(history: any[]): any {
    if (history.length === 0) return { averageEfficiency: 0, cycleCount: 0, capacityRetention: 100, availability: 0 };
    
    const averageEfficiency = history.reduce((sum, entry) => sum + entry.efficiency, 0) / history.length;
    const availability = history.filter(entry => entry.operation !== 'standby').length / history.length;
    
    return {
      averageEfficiency,
      cycleCount: this.cycleCount,
      capacityRetention: this.degradationFactor * 100,
      availability
    };
  }

  private calculateEconomicMetrics(history: any[]): any {
    // Simplified economic calculation based on operation history
    const totalRevenue = history.length * 100; // Simplified
    const operatingCosts = history.length * 20; // Simplified
    const netProfit = totalRevenue - operatingCosts;
    const roi = netProfit / (this.config.totalCapacity * 0.5) * 100; // Simplified ROI
    
    return { totalRevenue, operatingCosts, netProfit, roi };
  }

  private calculateGridServiceMetrics(history: any[]): any {
    const frequencyRegulationHours = history.filter(entry => entry.gridService === 'frequencyRegulation').length;
    const voltageSupport = history.filter(entry => entry.gridService === 'voltageSupport').length;
    const energyArbitrage = history.filter(entry => entry.gridService === 'energyArbitrage').length;
    const windSmoothing = history.filter(entry => entry.gridService === 'windSmoothing').length;
    
    return { frequencyRegulationHours, voltageSupport, energyArbitrage, windSmoothing };
  }

  private generatePerformanceRecommendations(operational: any, economic: any, gridService: any): string[] {
    const recommendations: string[] = [];
    
    if (operational.averageEfficiency < 0.8) {
      recommendations.push('Optimize charging/discharging algorithms to improve efficiency');
    }
    
    if (operational.capacityRetention < 80) {
      recommendations.push('Consider battery replacement or refurbishment');
    }
    
    if (economic.roi < 10) {
      recommendations.push('Explore additional revenue opportunities or cost reduction measures');
    }
    
    if (gridService.frequencyRegulationHours < 100) {
      recommendations.push('Increase participation in frequency regulation markets');
    }
    
    return recommendations;
  }
}