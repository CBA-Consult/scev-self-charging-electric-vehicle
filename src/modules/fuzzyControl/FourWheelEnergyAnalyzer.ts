/**
 * Four-Wheel Energy Flow Analyzer
 * 
 * This module provides comprehensive analysis of energy flow and efficiency
 * for complete 4-wheel electromagnetic induction energy generation systems.
 */

export interface OperatingCondition {
  name: string;
  vehicleSpeed: number;           // km/h
  propulsionPower: number;        // kW (total vehicle)
  perWheelHarvest: {
    frontLeft: number;            // kW
    frontRight: number;           // kW
    rearLeft: number;             // kW
    rearRight: number;            // kW
  };
  drivingTimePercentage: number;  // % of total driving time
}

export interface EnergyFlowResult {
  condition: string;
  totalPropulsionPower: number;   // kW
  totalHarvestPower: number;      // kW
  netEnergyBalance: number;       // kW (positive = surplus, negative = deficit)
  efficiencyGain: number;         // % energy recovery
  energyIndependenceRatio: number; // ratio of harvest to consumption
}

export interface SystemEfficiencyAnalysis {
  individualConditions: EnergyFlowResult[];
  weightedAverageEfficiency: number;
  overallEnergyIndependence: number;
  annualEnergyBalance: number;    // kWh
  economicBenefit: number;        // $ annually
}

export class FourWheelEnergyAnalyzer {
  private standardConditions: OperatingCondition[];
  private energyCostPerKWh: number;
  private vehicleEfficiency: number; // kWh/100km

  constructor(energyCostPerKWh: number = 0.15, vehicleEfficiency: number = 18) {
    this.energyCostPerKWh = energyCostPerKWh;
    this.vehicleEfficiency = vehicleEfficiency;
    this.initializeStandardConditions();
  }

  /**
   * Initialize standard driving conditions for analysis
   */
  private initializeStandardConditions(): void {
    this.standardConditions = [
      {
        name: 'City Driving',
        vehicleSpeed: 30,
        propulsionPower: 15,
        perWheelHarvest: {
          frontLeft: 3.5,
          frontRight: 3.5,
          rearLeft: 2.5,
          rearRight: 2.5
        },
        drivingTimePercentage: 40
      },
      {
        name: 'Highway Cruising',
        vehicleSpeed: 100,
        propulsionPower: 25,
        perWheelHarvest: {
          frontLeft: 6.5,
          frontRight: 6.5,
          rearLeft: 5.5,
          rearRight: 5.5
        },
        drivingTimePercentage: 35
      },
      {
        name: 'Acceleration',
        vehicleSpeed: 60, // Average during acceleration
        propulsionPower: 150,
        perWheelHarvest: {
          frontLeft: 2.5,
          frontRight: 2.5,
          rearLeft: 1.5,
          rearRight: 1.5
        },
        drivingTimePercentage: 15
      },
      {
        name: 'Deceleration',
        vehicleSpeed: 40, // Average during deceleration
        propulsionPower: -50, // Negative indicates regenerative braking
        perWheelHarvest: {
          frontLeft: 9.0,
          frontRight: 9.0,
          rearLeft: 7.0,
          rearRight: 7.0
        },
        drivingTimePercentage: 10
      }
    ];
  }

  /**
   * Analyze energy flow for a specific operating condition
   */
  public analyzeCondition(condition: OperatingCondition): EnergyFlowResult {
    // Calculate total harvest power
    const totalHarvestPower = 
      condition.perWheelHarvest.frontLeft +
      condition.perWheelHarvest.frontRight +
      condition.perWheelHarvest.rearLeft +
      condition.perWheelHarvest.rearRight;

    // Calculate net energy balance
    const netEnergyBalance = totalHarvestPower - Math.abs(condition.propulsionPower);

    // Calculate efficiency gain
    let efficiencyGain: number;
    if (condition.propulsionPower > 0) {
      efficiencyGain = (totalHarvestPower / condition.propulsionPower) * 100;
    } else {
      // For deceleration, calculate energy recovery efficiency
      efficiencyGain = (totalHarvestPower / Math.abs(condition.propulsionPower)) * 100;
    }

    // Calculate energy independence ratio
    const energyIndependenceRatio = condition.propulsionPower > 0 ? 
      totalHarvestPower / condition.propulsionPower : 
      totalHarvestPower / Math.abs(condition.propulsionPower);

    return {
      condition: condition.name,
      totalPropulsionPower: condition.propulsionPower,
      totalHarvestPower,
      netEnergyBalance,
      efficiencyGain,
      energyIndependenceRatio
    };
  }

  /**
   * Perform comprehensive system efficiency analysis
   */
  public analyzeSystemEfficiency(conditions?: OperatingCondition[]): SystemEfficiencyAnalysis {
    const analysisConditions = conditions || this.standardConditions;
    
    // Analyze each condition
    const individualConditions = analysisConditions.map(condition => 
      this.analyzeCondition(condition)
    );

    // Calculate weighted average efficiency
    let weightedEfficiencySum = 0;
    let weightedIndependenceSum = 0;
    let totalWeight = 0;

    for (let i = 0; i < analysisConditions.length; i++) {
      const condition = analysisConditions[i];
      const result = individualConditions[i];
      const weight = condition.drivingTimePercentage / 100;

      weightedEfficiencySum += result.efficiencyGain * weight;
      weightedIndependenceSum += result.energyIndependenceRatio * weight;
      totalWeight += weight;
    }

    const weightedAverageEfficiency = weightedEfficiencySum / totalWeight;
    const overallEnergyIndependence = weightedIndependenceSum / totalWeight;

    // Calculate annual energy balance (assuming 15,000 km/year)
    const annualDistance = 15000; // km
    const annualEnergyConsumption = (annualDistance / 100) * this.vehicleEfficiency; // kWh
    const annualEnergyGeneration = annualEnergyConsumption * (overallEnergyIndependence);
    const annualEnergyBalance = annualEnergyGeneration - annualEnergyConsumption;

    // Calculate economic benefit
    const energySavings = annualEnergyGeneration * this.energyCostPerKWh;
    const gridExportRevenue = Math.max(0, annualEnergyBalance) * this.energyCostPerKWh * 0.8; // 80% of retail price
    const economicBenefit = energySavings + gridExportRevenue;

    return {
      individualConditions,
      weightedAverageEfficiency,
      overallEnergyIndependence,
      annualEnergyBalance,
      economicBenefit
    };
  }

  /**
   * Compare different wheel configurations
   */
  public compareWheelConfigurations(): {
    twoWheelFront: SystemEfficiencyAnalysis;
    fourWheelStandard: SystemEfficiencyAnalysis;
    fourWheelEnhanced: SystemEfficiencyAnalysis;
  } {
    // Two-wheel front configuration
    const twoWheelConditions = this.standardConditions.map(condition => ({
      ...condition,
      perWheelHarvest: {
        frontLeft: condition.perWheelHarvest.frontLeft,
        frontRight: condition.perWheelHarvest.frontRight,
        rearLeft: 0,
        rearRight: 0
      }
    }));

    // Four-wheel enhanced configuration (20% higher harvest)
    const enhancedConditions = this.standardConditions.map(condition => ({
      ...condition,
      perWheelHarvest: {
        frontLeft: condition.perWheelHarvest.frontLeft * 1.2,
        frontRight: condition.perWheelHarvest.frontRight * 1.2,
        rearLeft: condition.perWheelHarvest.rearLeft * 1.2,
        rearRight: condition.perWheelHarvest.rearRight * 1.2
      }
    }));

    return {
      twoWheelFront: this.analyzeSystemEfficiency(twoWheelConditions),
      fourWheelStandard: this.analyzeSystemEfficiency(),
      fourWheelEnhanced: this.analyzeSystemEfficiency(enhancedConditions)
    };
  }

  /**
   * Generate detailed energy flow report
   */
  public generateEnergyFlowReport(): string {
    const analysis = this.analyzeSystemEfficiency();
    const comparison = this.compareWheelConfigurations();

    let report = '# Four-Wheel Energy Flow Analysis Report\n\n';
    
    report += '## Individual Operating Conditions\n\n';
    report += '| Condition | Propulsion (kW) | Harvest (kW) | Net Balance (kW) | Efficiency (%) | Independence (%) |\n';
    report += '|-----------|----------------|--------------|------------------|----------------|------------------|\n';
    
    analysis.individualConditions.forEach(condition => {
      report += `| ${condition.condition} | ${condition.totalPropulsionPower.toFixed(1)} | `;
      report += `${condition.totalHarvestPower.toFixed(1)} | ${condition.netEnergyBalance.toFixed(1)} | `;
      report += `${condition.efficiencyGain.toFixed(1)} | ${(condition.energyIndependenceRatio * 100).toFixed(1)} |\n`;
    });

    report += '\n## System Performance Summary\n\n';
    report += `- **Weighted Average Efficiency:** ${analysis.weightedAverageEfficiency.toFixed(1)}%\n`;
    report += `- **Overall Energy Independence:** ${(analysis.overallEnergyIndependence * 100).toFixed(1)}%\n`;
    report += `- **Annual Energy Balance:** ${analysis.annualEnergyBalance.toFixed(0)} kWh\n`;
    report += `- **Annual Economic Benefit:** $${analysis.economicBenefit.toFixed(0)}\n\n`;

    report += '## Configuration Comparison\n\n';
    report += '| Configuration | Efficiency (%) | Independence (%) | Annual Benefit ($) |\n';
    report += '|---------------|----------------|------------------|-----------------|\n';
    report += `| 2-Wheel Front | ${comparison.twoWheelFront.weightedAverageEfficiency.toFixed(1)} | `;
    report += `${(comparison.twoWheelFront.overallEnergyIndependence * 100).toFixed(1)} | `;
    report += `${comparison.twoWheelFront.economicBenefit.toFixed(0)} |\n`;
    report += `| 4-Wheel Standard | ${comparison.fourWheelStandard.weightedAverageEfficiency.toFixed(1)} | `;
    report += `${(comparison.fourWheelStandard.overallEnergyIndependence * 100).toFixed(1)} | `;
    report += `${comparison.fourWheelStandard.economicBenefit.toFixed(0)} |\n`;
    report += `| 4-Wheel Enhanced | ${comparison.fourWheelEnhanced.weightedAverageEfficiency.toFixed(1)} | `;
    report += `${(comparison.fourWheelEnhanced.overallEnergyIndependence * 100).toFixed(1)} | `;
    report += `${comparison.fourWheelEnhanced.economicBenefit.toFixed(0)} |\n`;

    return report;
  }

  /**
   * Calculate real-world driving scenario analysis
   */
  public analyzeRealWorldScenarios(): {
    dailyCommute: { energyBalance: number; costSavings: number };
    weekendTrip: { energyBalance: number; costSavings: number };
    commercialUse: { energyBalance: number; costSavings: number };
  } {
    // Daily commute scenario (50 km mixed driving)
    const commuteDistance = 50; // km
    const commuteEnergyConsumption = (commuteDistance / 100) * this.vehicleEfficiency;
    const commuteEnergyGeneration = commuteEnergyConsumption * 0.83; // 83% recovery
    const commuteEnergyBalance = commuteEnergyGeneration - commuteEnergyConsumption;
    const commuteCostSavings = commuteEnergyGeneration * this.energyCostPerKWh;

    // Weekend trip scenario (200 km highway)
    const tripDistance = 200; // km
    const tripEnergyConsumption = (tripDistance / 100) * this.vehicleEfficiency;
    const tripEnergyGeneration = tripEnergyConsumption * 0.96; // 96% highway recovery
    const tripEnergyBalance = tripEnergyGeneration - tripEnergyConsumption;
    const tripCostSavings = tripEnergyGeneration * this.energyCostPerKWh;

    // Commercial use scenario (150 km city delivery)
    const commercialDistance = 150; // km
    const commercialEnergyConsumption = (commercialDistance / 100) * this.vehicleEfficiency;
    const commercialEnergyGeneration = commercialEnergyConsumption * 0.84; // 84% city recovery
    const commercialEnergyBalance = commercialEnergyGeneration - commercialEnergyConsumption;
    const commercialCostSavings = commercialEnergyGeneration * this.energyCostPerKWh;

    return {
      dailyCommute: {
        energyBalance: commuteEnergyBalance,
        costSavings: commuteCostSavings
      },
      weekendTrip: {
        energyBalance: tripEnergyBalance,
        costSavings: tripCostSavings
      },
      commercialUse: {
        energyBalance: commercialEnergyBalance,
        costSavings: commercialCostSavings
      }
    };
  }

  /**
   * Update energy cost for different regions/markets
   */
  public updateEnergyCost(newCostPerKWh: number): void {
    this.energyCostPerKWh = newCostPerKWh;
  }

  /**
   * Update vehicle efficiency for different vehicle types
   */
  public updateVehicleEfficiency(newEfficiency: number): void {
    this.vehicleEfficiency = newEfficiency;
  }

  /**
   * Get optimized wheel power distribution
   */
  public getOptimizedWheelDistribution(totalTargetPower: number, vehicleSpeed: number): {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  } {
    // Front wheels typically generate more power due to higher load
    const frontRatio = 0.6; // 60% front, 40% rear
    const frontPower = totalTargetPower * frontRatio;
    const rearPower = totalTargetPower * (1 - frontRatio);

    // Speed-based optimization
    let speedFactor = 1.0;
    if (vehicleSpeed > 80) {
      speedFactor = 1.1; // 10% boost at high speed
    } else if (vehicleSpeed < 40) {
      speedFactor = 0.9; // 10% reduction at low speed
    }

    return {
      frontLeft: (frontPower / 2) * speedFactor,
      frontRight: (frontPower / 2) * speedFactor,
      rearLeft: (rearPower / 2) * speedFactor,
      rearRight: (rearPower / 2) * speedFactor
    };
  }
}