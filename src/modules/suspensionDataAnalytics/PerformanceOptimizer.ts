/**
 * Performance Optimizer for Suspension Energy Harvesting System
 * 
 * This class analyzes system performance data and generates optimization recommendations
 * to improve energy harvesting efficiency, system reliability, and overall performance.
 */

import {
  SuspensionDataPoint,
  OptimizationRecommendation,
  OptimizationAction,
  PerformanceMetrics,
  AnalyticsConfiguration
} from './types';

export class PerformanceOptimizer {
  private optimizationHistory: OptimizationRecommendation[] = [];
  private performanceBaseline: PerformanceMetrics | null = null;
  private lastOptimizationTime: number = 0;

  constructor(private config: AnalyticsConfiguration) {}

  /**
   * Generate optimization recommendations based on performance data
   */
  public generateOptimizationRecommendations(
    data: SuspensionDataPoint[],
    currentMetrics: PerformanceMetrics
  ): OptimizationRecommendation[] {
    if (data.length < 50) {
      throw new Error('Insufficient data for optimization analysis (minimum 50 data points required)');
    }

    const recommendations: OptimizationRecommendation[] = [];

    // Update performance baseline if needed
    this.updatePerformanceBaseline(currentMetrics);

    // Analyze different optimization categories
    recommendations.push(...this.analyzeDampingOptimization(data, currentMetrics));
    recommendations.push(...this.analyzeEnergyHarvestingOptimization(data, currentMetrics));
    recommendations.push(...this.analyzeThermalOptimization(data, currentMetrics));
    recommendations.push(...this.analyzeMaintenanceOptimization(data, currentMetrics));

    // Sort by priority and expected improvement
    recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.expectedImprovement - a.expectedImprovement;
    });

    // Store optimization history
    this.optimizationHistory.push(...recommendations);
    this.lastOptimizationTime = Date.now();

    return recommendations;
  }

  /**
   * Analyze damping system optimization opportunities
   */
  private analyzeDampingOptimization(
    data: SuspensionDataPoint[],
    metrics: PerformanceMetrics
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Analyze damping force efficiency
    const dampingForceData = data.map(dp => dp.shockAbsorberData.dampingForce);
    const avgDampingForce = dampingForceData.reduce((a, b) => a + b, 0) / dampingForceData.length;
    const dampingVariability = this.calculateVariability(dampingForceData);

    // High damping force variability indicates suboptimal control
    if (dampingVariability > 0.3) {
      recommendations.push({
        category: 'damping',
        priority: 'high',
        title: 'Optimize Damping Force Control',
        description: 'High variability in damping force indicates suboptimal control algorithms. Implementing adaptive damping control can improve ride quality and energy harvesting efficiency.',
        expectedImprovement: 15,
        implementationComplexity: 'medium',
        estimatedCost: 5000,
        actions: [
          {
            action: 'Implement adaptive damping algorithm',
            parameter: 'damping_control_algorithm',
            currentValue: 0, // Placeholder
            recommendedValue: 1, // Placeholder
            confidence: 0.85
          },
          {
            action: 'Tune damping coefficients',
            parameter: 'damping_coefficient',
            currentValue: avgDampingForce,
            recommendedValue: avgDampingForce * 0.9,
            confidence: 0.75
          }
        ]
      });
    }

    // Analyze damping mode distribution
    const dampingModes = data.map(dp => dp.shockAbsorberData.dampingMode);
    const modeDistribution = this.calculateModeDistribution(dampingModes);

    // If energy harvesting mode is underutilized
    if (modeDistribution['energy_harvesting'] < 0.3) {
      recommendations.push({
        category: 'damping',
        priority: 'medium',
        title: 'Increase Energy Harvesting Mode Usage',
        description: 'The system is not utilizing energy harvesting mode optimally. Adjusting mode switching thresholds can increase energy recovery.',
        expectedImprovement: 12,
        implementationComplexity: 'low',
        estimatedCost: 1000,
        actions: [
          {
            action: 'Lower energy harvesting mode threshold',
            parameter: 'energy_harvesting_threshold',
            currentValue: 50, // km/h
            recommendedValue: 40, // km/h
            confidence: 0.8
          }
        ]
      });
    }

    return recommendations;
  }

  /**
   * Analyze energy harvesting optimization opportunities
   */
  private analyzeEnergyHarvestingOptimization(
    data: SuspensionDataPoint[],
    metrics: PerformanceMetrics
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Analyze power generation efficiency
    const powerData = data.map(dp => dp.shockAbsorberData.generatedPower + dp.damperData.generatedPower);
    const efficiencyData = data.map(dp => 
      (dp.shockAbsorberData.efficiency + dp.damperData.energyEfficiency) / 2
    );

    const avgPower = powerData.reduce((a, b) => a + b, 0) / powerData.length;
    const avgEfficiency = efficiencyData.reduce((a, b) => a + b, 0) / efficiencyData.length;

    // Low efficiency indicates optimization potential
    if (avgEfficiency < 0.7) {
      recommendations.push({
        category: 'energy_harvesting',
        priority: 'high',
        title: 'Improve Energy Conversion Efficiency',
        description: 'System efficiency is below optimal levels. Optimizing electromagnetic parameters and reducing losses can significantly improve energy harvesting.',
        expectedImprovement: 20,
        implementationComplexity: 'high',
        estimatedCost: 15000,
        actions: [
          {
            action: 'Optimize magnetic field strength',
            parameter: 'magnetic_flux_density',
            currentValue: 0.5, // Tesla
            recommendedValue: 0.65, // Tesla
            confidence: 0.9
          },
          {
            action: 'Reduce coil resistance',
            parameter: 'coil_resistance',
            currentValue: 2.0, // Ohms
            recommendedValue: 1.5, // Ohms
            confidence: 0.85
          }
        ]
      });
    }

    // Analyze power generation patterns
    const powerPeaks = powerData.filter(p => p > avgPower * 1.5).length;
    const powerPeakRatio = powerPeaks / powerData.length;

    if (powerPeakRatio < 0.1) {
      recommendations.push({
        category: 'energy_harvesting',
        priority: 'medium',
        title: 'Optimize Power Generation Timing',
        description: 'Power generation peaks are infrequent. Adjusting harvesting algorithms to capture more energy during favorable conditions can improve overall performance.',
        expectedImprovement: 10,
        implementationComplexity: 'medium',
        estimatedCost: 3000,
        actions: [
          {
            action: 'Implement predictive harvesting algorithm',
            parameter: 'harvesting_algorithm',
            currentValue: 0, // Basic
            recommendedValue: 1, // Predictive
            confidence: 0.75
          }
        ]
      });
    }

    return recommendations;
  }

  /**
   * Analyze thermal optimization opportunities
   */
  private analyzeThermalOptimization(
    data: SuspensionDataPoint[],
    metrics: PerformanceMetrics
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Analyze temperature patterns
    const shockTempData = data.map(dp => dp.shockAbsorberData.operatingTemperature);
    const damperTempData = data.map(dp => dp.damperData.systemTemperature);

    const maxShockTemp = Math.max(...shockTempData);
    const maxDamperTemp = Math.max(...damperTempData);
    const avgShockTemp = shockTempData.reduce((a, b) => a + b, 0) / shockTempData.length;
    const avgDamperTemp = damperTempData.reduce((a, b) => a + b, 0) / damperTempData.length;

    // High temperature operation reduces efficiency
    if (maxShockTemp > 100 || maxDamperTemp > 100) {
      recommendations.push({
        category: 'thermal',
        priority: 'critical',
        title: 'Implement Enhanced Cooling System',
        description: 'System temperatures are reaching critical levels, which can cause performance degradation and component damage. Enhanced cooling is required.',
        expectedImprovement: 25,
        implementationComplexity: 'high',
        estimatedCost: 20000,
        actions: [
          {
            action: 'Install active cooling system',
            parameter: 'cooling_system',
            currentValue: 0, // Passive
            recommendedValue: 1, // Active
            confidence: 0.95
          },
          {
            action: 'Improve heat dissipation',
            parameter: 'heat_dissipation_rate',
            currentValue: avgShockTemp,
            recommendedValue: avgShockTemp * 0.8,
            confidence: 0.9
          }
        ]
      });
    } else if (avgShockTemp > 80 || avgDamperTemp > 80) {
      recommendations.push({
        category: 'thermal',
        priority: 'medium',
        title: 'Optimize Thermal Management',
        description: 'Average operating temperatures are elevated. Improving thermal management can enhance efficiency and component longevity.',
        expectedImprovement: 8,
        implementationComplexity: 'medium',
        estimatedCost: 8000,
        actions: [
          {
            action: 'Improve heat sink design',
            parameter: 'heat_sink_efficiency',
            currentValue: 0.7,
            recommendedValue: 0.85,
            confidence: 0.8
          }
        ]
      });
    }

    return recommendations;
  }

  /**
   * Analyze maintenance optimization opportunities
   */
  private analyzeMaintenanceOptimization(
    data: SuspensionDataPoint[],
    metrics: PerformanceMetrics
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Analyze system uptime
    if (metrics.systemUptime < 0.95) {
      recommendations.push({
        category: 'maintenance',
        priority: 'high',
        title: 'Improve System Reliability',
        description: 'System uptime is below target levels. Implementing predictive maintenance and improving component reliability can reduce downtime.',
        expectedImprovement: 18,
        implementationComplexity: 'medium',
        estimatedCost: 12000,
        actions: [
          {
            action: 'Implement predictive maintenance',
            parameter: 'maintenance_strategy',
            currentValue: 0, // Reactive
            recommendedValue: 1, // Predictive
            confidence: 0.85
          }
        ]
      });
    }

    // Analyze operational cycles vs. expected lifetime
    const cycleRate = metrics.operationalCycles / (data.length / 3600); // Cycles per hour
    if (cycleRate > 1000) { // High cycle rate indicates potential wear
      recommendations.push({
        category: 'maintenance',
        priority: 'medium',
        title: 'Optimize Operating Cycles',
        description: 'High operational cycle rate may lead to accelerated wear. Optimizing control algorithms can reduce unnecessary cycles.',
        expectedImprovement: 5,
        implementationComplexity: 'low',
        estimatedCost: 2000,
        actions: [
          {
            action: 'Implement cycle optimization',
            parameter: 'cycle_optimization',
            currentValue: 0,
            recommendedValue: 1,
            confidence: 0.7
          }
        ]
      });
    }

    return recommendations;
  }

  /**
   * Calculate variability (coefficient of variation) for a dataset
   */
  private calculateVariability(data: number[]): number {
    if (data.length === 0) return 0;

    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    return mean === 0 ? 0 : stdDev / Math.abs(mean);
  }

  /**
   * Calculate distribution of damping modes
   */
  private calculateModeDistribution(modes: string[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    const total = modes.length;

    for (const mode of modes) {
      distribution[mode] = (distribution[mode] || 0) + 1;
    }

    // Convert to percentages
    for (const mode in distribution) {
      distribution[mode] = distribution[mode] / total;
    }

    return distribution;
  }

  /**
   * Update performance baseline for comparison
   */
  private updatePerformanceBaseline(metrics: PerformanceMetrics): void {
    if (!this.performanceBaseline) {
      this.performanceBaseline = { ...metrics };
    } else {
      // Update baseline with exponential moving average
      const alpha = 0.1;
      this.performanceBaseline.averagePowerGeneration = 
        alpha * metrics.averagePowerGeneration + (1 - alpha) * this.performanceBaseline.averagePowerGeneration;
      this.performanceBaseline.averageEfficiency = 
        alpha * metrics.averageEfficiency + (1 - alpha) * this.performanceBaseline.averageEfficiency;
      this.performanceBaseline.systemUptime = 
        alpha * metrics.systemUptime + (1 - alpha) * this.performanceBaseline.systemUptime;
    }
  }

  /**
   * Evaluate the effectiveness of implemented optimizations
   */
  public evaluateOptimizationEffectiveness(
    beforeMetrics: PerformanceMetrics,
    afterMetrics: PerformanceMetrics,
    implementedRecommendations: OptimizationRecommendation[]
  ): {
    overallImprovement: number;
    categoryImprovements: Record<string, number>;
    successfulRecommendations: OptimizationRecommendation[];
    failedRecommendations: OptimizationRecommendation[];
  } {
    const categoryImprovements: Record<string, number> = {};
    const successfulRecommendations: OptimizationRecommendation[] = [];
    const failedRecommendations: OptimizationRecommendation[] = [];

    // Calculate overall improvement
    const powerImprovement = (afterMetrics.averagePowerGeneration - beforeMetrics.averagePowerGeneration) / 
      beforeMetrics.averagePowerGeneration;
    const efficiencyImprovement = (afterMetrics.averageEfficiency - beforeMetrics.averageEfficiency) / 
      beforeMetrics.averageEfficiency;
    const uptimeImprovement = (afterMetrics.systemUptime - beforeMetrics.systemUptime) / 
      beforeMetrics.systemUptime;

    const overallImprovement = (powerImprovement + efficiencyImprovement + uptimeImprovement) / 3;

    // Evaluate each recommendation
    for (const recommendation of implementedRecommendations) {
      let actualImprovement = 0;

      switch (recommendation.category) {
        case 'energy_harvesting':
          actualImprovement = powerImprovement;
          break;
        case 'damping':
          actualImprovement = efficiencyImprovement;
          break;
        case 'thermal':
          actualImprovement = efficiencyImprovement;
          break;
        case 'maintenance':
          actualImprovement = uptimeImprovement;
          break;
      }

      categoryImprovements[recommendation.category] = actualImprovement;

      // Consider successful if actual improvement is at least 50% of expected
      if (actualImprovement >= recommendation.expectedImprovement * 0.005) { // Convert percentage to decimal
        successfulRecommendations.push(recommendation);
      } else {
        failedRecommendations.push(recommendation);
      }
    }

    return {
      overallImprovement,
      categoryImprovements,
      successfulRecommendations,
      failedRecommendations
    };
  }

  /**
   * Get optimization statistics
   */
  public getOptimizationStats(): {
    totalRecommendations: number;
    recommendationsByCategory: Record<string, number>;
    recommendationsByPriority: Record<string, number>;
    lastOptimizationTime: number;
    averageExpectedImprovement: number;
  } {
    const categoryCount: Record<string, number> = {};
    const priorityCount: Record<string, number> = {};
    let totalExpectedImprovement = 0;

    for (const rec of this.optimizationHistory) {
      categoryCount[rec.category] = (categoryCount[rec.category] || 0) + 1;
      priorityCount[rec.priority] = (priorityCount[rec.priority] || 0) + 1;
      totalExpectedImprovement += rec.expectedImprovement;
    }

    return {
      totalRecommendations: this.optimizationHistory.length,
      recommendationsByCategory: categoryCount,
      recommendationsByPriority: priorityCount,
      lastOptimizationTime: this.lastOptimizationTime,
      averageExpectedImprovement: this.optimizationHistory.length > 0 ? 
        totalExpectedImprovement / this.optimizationHistory.length : 0
    };
  }

  /**
   * Clear optimization history
   */
  public clearOptimizationHistory(): void {
    this.optimizationHistory = [];
    this.performanceBaseline = null;
  }

  /**
   * Get performance baseline
   */
  public getPerformanceBaseline(): PerformanceMetrics | null {
    return this.performanceBaseline ? { ...this.performanceBaseline } : null;
  }
}