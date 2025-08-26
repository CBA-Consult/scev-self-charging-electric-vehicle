/**
 * Performance Analyzer
 * 
 * Analyzes energy harvesting system performance and provides detailed metrics
 * for optimization and evaluation purposes.
 */

export interface PerformanceMetrics {
  powerDensity: number;           // W/kg
  energyDensity: number;          // Wh/kg
  costEffectiveness: number;      // W/USD
  reliability: number;            // 0-1
  efficiency: number;             // 0-1
  responseTime: number;           // ms
  adaptability: number;           // 0-1
}

export interface EfficiencyAnalysis {
  overall: number;                // 0-1
  byOperatingCondition: {
    [condition: string]: number;
  };
  byComponent: {
    [component: string]: number;
  };
  temperatureDependency: {
    optimal: number;              // °C
    degradationRate: number;      // %/°C
  };
  loadDependency: {
    optimalLoad: number;          // %
    efficiencyAtOptimal: number;  // 0-1
  };
}

export interface PowerGenerationAnalysis {
  peak: number;                   // W
  average: number;                // W
  minimum: number;                // W
  variability: number;            // coefficient of variation
  frequency: {
    dominant: number;             // Hz
    harmonics: number[];          // Hz
  };
  bySource: {
    [source: string]: {
      contribution: number;       // %
      reliability: number;        // 0-1
      efficiency: number;         // 0-1
    };
  };
}

export interface PerformanceAnalysisInputs {
  powerGeneration: any;
  efficiency: any;
  vehicleConfig: any;
  operatingConditions: any;
  timeHistory?: any[];
}

export class PerformanceAnalyzer {
  private performanceHistory: PerformanceMetrics[] = [];
  private benchmarkData: Map<string, number> = new Map();
  
  constructor() {
    this.initializeBenchmarks();
  }
  
  private initializeBenchmarks(): void {
    // Industry benchmark values for comparison
    this.benchmarkData.set('powerDensity_excellent', 100);      // W/kg
    this.benchmarkData.set('powerDensity_good', 50);            // W/kg
    this.benchmarkData.set('powerDensity_acceptable', 25);      // W/kg
    
    this.benchmarkData.set('efficiency_excellent', 0.9);        // 90%
    this.benchmarkData.set('efficiency_good', 0.75);            // 75%
    this.benchmarkData.set('efficiency_acceptable', 0.6);       // 60%
    
    this.benchmarkData.set('reliability_excellent', 0.99);      // 99%
    this.benchmarkData.set('reliability_good', 0.95);           // 95%
    this.benchmarkData.set('reliability_acceptable', 0.9);      // 90%
    
    this.benchmarkData.set('costEffectiveness_excellent', 2.0); // W/USD
    this.benchmarkData.set('costEffectiveness_good', 1.0);      // W/USD
    this.benchmarkData.set('costEffectiveness_acceptable', 0.5); // W/USD
  }
  
  /**
   * Analyze overall system performance
   */
  public analyzePerformance(inputs: PerformanceAnalysisInputs): PerformanceMetrics {
    try {
      const powerDensity = this.calculatePowerDensity(inputs);
      const energyDensity = this.calculateEnergyDensity(inputs);
      const costEffectiveness = this.calculateCostEffectiveness(inputs);
      const reliability = this.calculateReliability(inputs);
      const efficiency = inputs.efficiency.overall;
      const responseTime = this.calculateResponseTime(inputs);
      const adaptability = this.calculateAdaptability(inputs);
      
      const metrics: PerformanceMetrics = {
        powerDensity,
        energyDensity,
        costEffectiveness,
        reliability,
        efficiency,
        responseTime,
        adaptability
      };
      
      this.performanceHistory.push(metrics);
      return metrics;
      
    } catch (error) {
      console.error('Performance analysis failed:', error);
      return this.getDefaultPerformanceMetrics();
    }
  }
  
  /**
   * Analyze efficiency across different conditions
   */
  public analyzeEfficiency(inputs: PerformanceAnalysisInputs): EfficiencyAnalysis {
    const overall = inputs.efficiency.overall;
    
    const byOperatingCondition = this.analyzeEfficiencyByCondition(inputs);
    const byComponent = inputs.efficiency.byComponent;
    const temperatureDependency = this.analyzeTemperatureDependency(inputs);
    const loadDependency = this.analyzeLoadDependency(inputs);
    
    return {
      overall,
      byOperatingCondition,
      byComponent,
      temperatureDependency,
      loadDependency
    };
  }
  
  /**
   * Analyze power generation characteristics
   */
  public analyzePowerGeneration(inputs: PerformanceAnalysisInputs): PowerGenerationAnalysis {
    const powerData = inputs.timeHistory?.map(h => h.powerGeneration?.total) || [inputs.powerGeneration.total];
    
    const peak = Math.max(...powerData);
    const average = powerData.reduce((a, b) => a + b, 0) / powerData.length;
    const minimum = Math.min(...powerData);
    const variability = this.calculateVariability(powerData);
    
    const frequency = this.analyzeFrequencyContent(powerData);
    const bySource = this.analyzePowerBySource(inputs);
    
    return {
      peak,
      average,
      minimum,
      variability,
      frequency,
      bySource
    };
  }
  
  /**
   * Compare performance against benchmarks
   */
  public benchmarkPerformance(metrics: PerformanceMetrics): {
    [metric: string]: {
      value: number;
      rating: 'excellent' | 'good' | 'acceptable' | 'poor';
      percentile: number;
    };
  } {
    const results: any = {};
    
    // Power density benchmark
    results.powerDensity = {
      value: metrics.powerDensity,
      rating: this.ratePowerDensity(metrics.powerDensity),
      percentile: this.calculatePercentile('powerDensity', metrics.powerDensity)
    };
    
    // Efficiency benchmark
    results.efficiency = {
      value: metrics.efficiency,
      rating: this.rateEfficiency(metrics.efficiency),
      percentile: this.calculatePercentile('efficiency', metrics.efficiency)
    };
    
    // Reliability benchmark
    results.reliability = {
      value: metrics.reliability,
      rating: this.rateReliability(metrics.reliability),
      percentile: this.calculatePercentile('reliability', metrics.reliability)
    };
    
    // Cost effectiveness benchmark
    results.costEffectiveness = {
      value: metrics.costEffectiveness,
      rating: this.rateCostEffectiveness(metrics.costEffectiveness),
      percentile: this.calculatePercentile('costEffectiveness', metrics.costEffectiveness)
    };
    
    return results;
  }
  
  /**
   * Identify optimization opportunities
   */
  public identifyOptimizationOpportunities(inputs: PerformanceAnalysisInputs): {
    opportunities: Array<{
      component: string;
      issue: string;
      impact: 'high' | 'medium' | 'low';
      recommendation: string;
      expectedImprovement: number; // %
    }>;
    priorityActions: string[];
  } {
    const opportunities: any[] = [];
    
    // Analyze each component for optimization potential
    const componentEfficiencies = inputs.efficiency.byComponent;
    
    Object.entries(componentEfficiencies).forEach(([component, efficiency]) => {
      if (efficiency < 0.7) {
        opportunities.push({
          component,
          issue: 'Low efficiency',
          impact: efficiency < 0.5 ? 'high' : 'medium',
          recommendation: `Optimize ${component} design and control parameters`,
          expectedImprovement: (0.8 - efficiency) * 100
        });
      }
    });
    
    // Check power generation balance
    const powerSources = inputs.powerGeneration;
    const totalPower = powerSources.total;
    
    if (powerSources.regenerativeBraking / totalPower < 0.4) {
      opportunities.push({
        component: 'regenerativeBraking',
        issue: 'Underutilized regenerative braking',
        impact: 'high',
        recommendation: 'Increase regenerative braking aggressiveness and optimize control strategy',
        expectedImprovement: 25
      });
    }
    
    if (powerSources.electromagneticShockAbsorbers / totalPower < 0.2) {
      opportunities.push({
        component: 'electromagneticShockAbsorbers',
        issue: 'Low shock absorber energy recovery',
        impact: 'medium',
        recommendation: 'Optimize electromagnetic damper design and increase sensitivity',
        expectedImprovement: 15
      });
    }
    
    // Prioritize opportunities by impact and expected improvement
    const priorityActions = opportunities
      .filter(opp => opp.impact === 'high')
      .sort((a, b) => b.expectedImprovement - a.expectedImprovement)
      .map(opp => opp.recommendation);
    
    return { opportunities, priorityActions };
  }
  
  /**
   * Generate performance report
   */
  public generatePerformanceReport(inputs: PerformanceAnalysisInputs): string {
    const metrics = this.analyzePerformance(inputs);
    const efficiency = this.analyzeEfficiency(inputs);
    const powerAnalysis = this.analyzePowerGeneration(inputs);
    const benchmarks = this.benchmarkPerformance(metrics);
    const optimization = this.identifyOptimizationOpportunities(inputs);
    
    let report = '# Energy Harvesting System Performance Report\n\n';
    
    // Executive Summary
    report += '## Executive Summary\n';
    report += `- Overall Efficiency: ${(efficiency.overall * 100).toFixed(1)}%\n`;
    report += `- Average Power Generation: ${powerAnalysis.average.toFixed(0)} W\n`;
    report += `- Peak Power Output: ${powerAnalysis.peak.toFixed(0)} W\n`;
    report += `- System Reliability: ${(metrics.reliability * 100).toFixed(1)}%\n`;
    report += `- Power Density: ${metrics.powerDensity.toFixed(1)} W/kg\n\n`;
    
    // Performance Metrics
    report += '## Performance Metrics\n';
    Object.entries(benchmarks).forEach(([metric, data]) => {
      report += `- ${metric}: ${data.value.toFixed(2)} (${data.rating}, ${data.percentile}th percentile)\n`;
    });
    report += '\n';
    
    // Component Analysis
    report += '## Component Performance\n';
    Object.entries(efficiency.byComponent).forEach(([component, eff]) => {
      const contribution = powerAnalysis.bySource[component]?.contribution || 0;
      report += `- ${component}: ${(eff * 100).toFixed(1)}% efficiency, ${contribution.toFixed(1)}% power contribution\n`;
    });
    report += '\n';
    
    // Optimization Opportunities
    report += '## Optimization Opportunities\n';
    optimization.opportunities.forEach((opp, index) => {
      report += `${index + 1}. **${opp.component}** (${opp.impact} impact)\n`;
      report += `   - Issue: ${opp.issue}\n`;
      report += `   - Recommendation: ${opp.recommendation}\n`;
      report += `   - Expected Improvement: ${opp.expectedImprovement.toFixed(1)}%\n\n`;
    });
    
    // Priority Actions
    report += '## Priority Actions\n';
    optimization.priorityActions.forEach((action, index) => {
      report += `${index + 1}. ${action}\n`;
    });
    
    return report;
  }
  
  private calculatePowerDensity(inputs: PerformanceAnalysisInputs): number {
    const totalPower = inputs.powerGeneration.total;
    const systemWeight = this.estimateSystemWeight(inputs.vehicleConfig);
    return totalPower / systemWeight;
  }
  
  private calculateEnergyDensity(inputs: PerformanceAnalysisInputs): number {
    const totalPower = inputs.powerGeneration.total;
    const systemWeight = this.estimateSystemWeight(inputs.vehicleConfig);
    // Assume 1 hour operation for energy density calculation
    return (totalPower * 1) / systemWeight; // Wh/kg
  }
  
  private calculateCostEffectiveness(inputs: PerformanceAnalysisInputs): number {
    const totalPower = inputs.powerGeneration.total;
    const systemCost = this.estimateSystemCost(inputs.vehicleConfig);
    return totalPower / systemCost;
  }
  
  private calculateReliability(inputs: PerformanceAnalysisInputs): number {
    // Simplified reliability calculation based on component status
    let reliability = 1.0;
    
    // Reduce reliability based on operating conditions
    const temp = inputs.operatingConditions.temperature || 20;
    if (temp < -20 || temp > 60) {
      reliability *= 0.95;
    }
    
    const speed = inputs.operatingConditions.speed || 0;
    if (speed > 120) {
      reliability *= 0.98;
    }
    
    return Math.max(0.8, reliability);
  }
  
  private calculateResponseTime(inputs: PerformanceAnalysisInputs): number {
    // Estimate system response time based on component characteristics
    return 50; // ms - typical for energy harvesting systems
  }
  
  private calculateAdaptability(inputs: PerformanceAnalysisInputs): number {
    // Measure how well the system adapts to changing conditions
    return 0.85; // Simplified - would analyze performance variation
  }
  
  private analyzeEfficiencyByCondition(inputs: PerformanceAnalysisInputs): { [condition: string]: number } {
    // Analyze efficiency under different operating conditions
    return {
      'city_driving': 0.75,
      'highway_driving': 0.82,
      'mountain_driving': 0.88,
      'stop_and_go': 0.65
    };
  }
  
  private analyzeTemperatureDependency(inputs: PerformanceAnalysisInputs): any {
    return {
      optimal: 25, // °C
      degradationRate: 0.5 // %/°C
    };
  }
  
  private analyzeLoadDependency(inputs: PerformanceAnalysisInputs): any {
    return {
      optimalLoad: 75, // %
      efficiencyAtOptimal: 0.9
    };
  }
  
  private calculateVariability(data: number[]): number {
    if (data.length < 2) return 0;
    
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev / mean; // Coefficient of variation
  }
  
  private analyzeFrequencyContent(data: number[]): any {
    // Simplified frequency analysis
    return {
      dominant: 25, // Hz
      harmonics: [50, 75, 100]
    };
  }
  
  private analyzePowerBySource(inputs: PerformanceAnalysisInputs): any {
    const total = inputs.powerGeneration.total;
    
    return {
      regenerativeBraking: {
        contribution: (inputs.powerGeneration.regenerativeBraking / total) * 100,
        reliability: 0.95,
        efficiency: 0.88
      },
      electromagneticShockAbsorbers: {
        contribution: (inputs.powerGeneration.electromagneticShockAbsorbers / total) * 100,
        reliability: 0.92,
        efficiency: 0.85
      },
      piezoelectricHarvesters: {
        contribution: (inputs.powerGeneration.piezoelectricHarvesters / total) * 100,
        reliability: 0.88,
        efficiency: 0.75
      },
      mrFluidDampers: {
        contribution: (inputs.powerGeneration.mrFluidDampers / total) * 100,
        reliability: 0.90,
        efficiency: 0.82
      }
    };
  }
  
  private estimateSystemWeight(vehicleConfig: any): number {
    let weight = 0;
    
    if (vehicleConfig.electromagneticShockAbsorbers?.enabled) {
      weight += vehicleConfig.electromagneticShockAbsorbers.count * 15; // kg per unit
    }
    
    if (vehicleConfig.piezoelectricHarvesters?.enabled) {
      weight += vehicleConfig.piezoelectricHarvesters.count * 0.5; // kg per unit
    }
    
    if (vehicleConfig.mrFluidDampers?.enabled) {
      weight += vehicleConfig.mrFluidDampers.count * 12; // kg per unit
    }
    
    return Math.max(50, weight); // Minimum 50kg for control systems
  }
  
  private estimateSystemCost(vehicleConfig: any): number {
    let cost = 5000; // Base cost for control systems
    
    if (vehicleConfig.electromagneticShockAbsorbers?.enabled) {
      cost += vehicleConfig.electromagneticShockAbsorbers.count * 2000; // USD per unit
    }
    
    if (vehicleConfig.piezoelectricHarvesters?.enabled) {
      cost += vehicleConfig.piezoelectricHarvesters.count * 500; // USD per unit
    }
    
    if (vehicleConfig.mrFluidDampers?.enabled) {
      cost += vehicleConfig.mrFluidDampers.count * 1500; // USD per unit
    }
    
    return cost;
  }
  
  private ratePowerDensity(value: number): 'excellent' | 'good' | 'acceptable' | 'poor' {
    if (value >= this.benchmarkData.get('powerDensity_excellent')!) return 'excellent';
    if (value >= this.benchmarkData.get('powerDensity_good')!) return 'good';
    if (value >= this.benchmarkData.get('powerDensity_acceptable')!) return 'acceptable';
    return 'poor';
  }
  
  private rateEfficiency(value: number): 'excellent' | 'good' | 'acceptable' | 'poor' {
    if (value >= this.benchmarkData.get('efficiency_excellent')!) return 'excellent';
    if (value >= this.benchmarkData.get('efficiency_good')!) return 'good';
    if (value >= this.benchmarkData.get('efficiency_acceptable')!) return 'acceptable';
    return 'poor';
  }
  
  private rateReliability(value: number): 'excellent' | 'good' | 'acceptable' | 'poor' {
    if (value >= this.benchmarkData.get('reliability_excellent')!) return 'excellent';
    if (value >= this.benchmarkData.get('reliability_good')!) return 'good';
    if (value >= this.benchmarkData.get('reliability_acceptable')!) return 'acceptable';
    return 'poor';
  }
  
  private rateCostEffectiveness(value: number): 'excellent' | 'good' | 'acceptable' | 'poor' {
    if (value >= this.benchmarkData.get('costEffectiveness_excellent')!) return 'excellent';
    if (value >= this.benchmarkData.get('costEffectiveness_good')!) return 'good';
    if (value >= this.benchmarkData.get('costEffectiveness_acceptable')!) return 'acceptable';
    return 'poor';
  }
  
  private calculatePercentile(metric: string, value: number): number {
    // Simplified percentile calculation
    const excellent = this.benchmarkData.get(`${metric}_excellent`) || 1;
    const good = this.benchmarkData.get(`${metric}_good`) || 0.8;
    const acceptable = this.benchmarkData.get(`${metric}_acceptable`) || 0.6;
    
    if (value >= excellent) return 95;
    if (value >= good) return 75;
    if (value >= acceptable) return 50;
    return 25;
  }
  
  private getDefaultPerformanceMetrics(): PerformanceMetrics {
    return {
      powerDensity: 0,
      energyDensity: 0,
      costEffectiveness: 0,
      reliability: 0,
      efficiency: 0,
      responseTime: 0,
      adaptability: 0
    };
  }
}