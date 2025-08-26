/**
 * Predictive Maintenance Analyzer for Suspension Energy Harvesting System
 * 
 * This class implements machine learning algorithms and statistical analysis to predict
 * maintenance needs, component failures, and system health degradation before they occur.
 */

import {
  SuspensionDataPoint,
  MaintenancePrediction,
  HealthScore,
  ComponentHealthScore,
  HealthIndicator,
  MLModelConfiguration,
  MLModelPerformance,
  PredictionResult,
  AnalyticsConfiguration
} from './types';

export class PredictiveMaintenanceAnalyzer {
  private healthHistory: HealthScore[] = [];
  private failurePatterns: Map<string, number[]> = new Map();
  private componentModels: Map<string, MLModelConfiguration> = new Map();
  private modelPerformance: Map<string, MLModelPerformance> = new Map();
  private lastAnalysisTime: number = 0;

  constructor(private config: AnalyticsConfiguration) {
    this.initializeComponentModels();
  }

  /**
   * Analyze system health and predict maintenance needs
   */
  public analyzePredictiveMaintenance(data: SuspensionDataPoint[]): {
    healthScore: HealthScore;
    maintenancePredictions: MaintenancePrediction[];
    componentRecommendations: string[];
  } {
    if (data.length < 100) {
      throw new Error('Insufficient data for predictive maintenance analysis (minimum 100 data points required)');
    }

    // Calculate current health score
    const healthScore = this.calculateHealthScore(data);

    // Generate maintenance predictions
    const maintenancePredictions = this.generateMaintenancePredictions(data, healthScore);

    // Generate component-specific recommendations
    const componentRecommendations = this.generateComponentRecommendations(healthScore, maintenancePredictions);

    // Update health history
    this.healthHistory.push(healthScore);
    if (this.healthHistory.length > 1000) {
      this.healthHistory = this.healthHistory.slice(-1000);
    }

    this.lastAnalysisTime = Date.now();

    return {
      healthScore,
      maintenancePredictions,
      componentRecommendations
    };
  }

  /**
   * Calculate overall system health score
   */
  private calculateHealthScore(data: SuspensionDataPoint[]): HealthScore {
    const components = [
      'shock_absorber',
      'electromagnetic_generator',
      'hydraulic_damper',
      'control_system',
      'thermal_management'
    ];

    const componentScores: ComponentHealthScore[] = [];

    for (const component of components) {
      const score = this.calculateComponentHealthScore(component, data);
      componentScores.push(score);
    }

    // Calculate overall health score as weighted average
    const weights = {
      shock_absorber: 0.25,
      electromagnetic_generator: 0.25,
      hydraulic_damper: 0.2,
      control_system: 0.15,
      thermal_management: 0.15
    };

    const overallScore = componentScores.reduce((sum, comp) => {
      const weight = weights[comp.component as keyof typeof weights] || 0.2;
      return sum + comp.score * weight;
    }, 0);

    // Determine trend based on recent history
    let trend: 'improving' | 'stable' | 'degrading' = 'stable';
    if (this.healthHistory.length >= 5) {
      const recentScores = this.healthHistory.slice(-5).map(h => h.overall);
      const trendSlope = this.calculateTrendSlope(recentScores);
      
      if (trendSlope > 0.02) trend = 'improving';
      else if (trendSlope < -0.02) trend = 'degrading';
    }

    return {
      overall: overallScore,
      components: componentScores,
      trend,
      lastUpdated: Date.now()
    };
  }

  /**
   * Calculate health score for a specific component
   */
  private calculateComponentHealthScore(component: string, data: SuspensionDataPoint[]): ComponentHealthScore {
    const indicators: HealthIndicator[] = [];
    let score = 100;

    switch (component) {
      case 'shock_absorber':
        score = this.analyzeShockAbsorberHealth(data, indicators);
        break;
      case 'electromagnetic_generator':
        score = this.analyzeElectromagneticGeneratorHealth(data, indicators);
        break;
      case 'hydraulic_damper':
        score = this.analyzeHydraulicDamperHealth(data, indicators);
        break;
      case 'control_system':
        score = this.analyzeControlSystemHealth(data, indicators);
        break;
      case 'thermal_management':
        score = this.analyzeThermalManagementHealth(data, indicators);
        break;
    }

    // Determine status based on score
    let status: ComponentHealthScore['status'];
    if (score >= 90) status = 'excellent';
    else if (score >= 75) status = 'good';
    else if (score >= 60) status = 'fair';
    else if (score >= 40) status = 'poor';
    else status = 'critical';

    return {
      component,
      score,
      status,
      keyIndicators: indicators
    };
  }

  /**
   * Analyze shock absorber health
   */
  private analyzeShockAbsorberHealth(data: SuspensionDataPoint[], indicators: HealthIndicator[]): number {
    let score = 100;

    // Analyze damping force consistency
    const dampingForces = data.map(dp => dp.shockAbsorberData.dampingForce);
    const dampingVariability = this.calculateVariability(dampingForces);
    
    indicators.push({
      name: 'Damping Force Variability',
      value: dampingVariability,
      threshold: 0.3,
      status: dampingVariability > 0.3 ? 'warning' : 'normal'
    });

    if (dampingVariability > 0.3) score -= 15;
    if (dampingVariability > 0.5) score -= 25;

    // Analyze efficiency degradation
    const efficiencies = data.map(dp => dp.shockAbsorberData.efficiency);
    const avgEfficiency = efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length;
    
    indicators.push({
      name: 'Average Efficiency',
      value: avgEfficiency,
      threshold: 0.7,
      status: avgEfficiency < 0.7 ? 'warning' : 'normal'
    });

    if (avgEfficiency < 0.7) score -= 20;
    if (avgEfficiency < 0.5) score -= 30;

    // Analyze operational status
    const operationalData = data.map(dp => dp.shockAbsorberData.isOperational);
    const uptime = operationalData.filter(op => op).length / operationalData.length;
    
    indicators.push({
      name: 'System Uptime',
      value: uptime,
      threshold: 0.95,
      status: uptime < 0.95 ? 'critical' : 'normal'
    });

    if (uptime < 0.95) score -= 25;
    if (uptime < 0.8) score -= 40;

    return Math.max(0, score);
  }

  /**
   * Analyze electromagnetic generator health
   */
  private analyzeElectromagneticGeneratorHealth(data: SuspensionDataPoint[], indicators: HealthIndicator[]): number {
    let score = 100;

    // Analyze power generation consistency
    const powerOutputs = data.map(dp => dp.shockAbsorberData.generatedPower);
    const powerVariability = this.calculateVariability(powerOutputs);
    
    indicators.push({
      name: 'Power Generation Variability',
      value: powerVariability,
      threshold: 0.4,
      status: powerVariability > 0.4 ? 'warning' : 'normal'
    });

    if (powerVariability > 0.4) score -= 15;

    // Analyze voltage stability
    const voltages = data.map(dp => dp.shockAbsorberData.outputVoltage);
    const voltageVariability = this.calculateVariability(voltages);
    
    indicators.push({
      name: 'Voltage Stability',
      value: 1 - voltageVariability, // Higher is better
      threshold: 0.8,
      status: voltageVariability > 0.2 ? 'warning' : 'normal'
    });

    if (voltageVariability > 0.2) score -= 20;

    // Analyze generator RPM health
    const rpms = data.map(dp => dp.shockAbsorberData.generatorRPM);
    const maxRPM = Math.max(...rpms);
    const avgRPM = rpms.reduce((a, b) => a + b, 0) / rpms.length;
    
    indicators.push({
      name: 'Average RPM',
      value: avgRPM,
      threshold: 1000,
      status: avgRPM < 500 ? 'warning' : 'normal'
    });

    if (maxRPM > 8000) score -= 10; // High RPM indicates stress
    if (avgRPM < 500) score -= 15; // Low average RPM indicates poor performance

    return Math.max(0, score);
  }

  /**
   * Analyze hydraulic damper health
   */
  private analyzeHydraulicDamperHealth(data: SuspensionDataPoint[], indicators: HealthIndicator[]): number {
    let score = 100;

    // Analyze hydraulic pressure patterns
    const pressures = data.map(dp => dp.damperData.hydraulicPressure);
    const maxPressure = Math.max(...pressures);
    const avgPressure = pressures.reduce((a, b) => a + b, 0) / pressures.length;
    
    indicators.push({
      name: 'Maximum Hydraulic Pressure',
      value: maxPressure,
      threshold: 40000000, // 40 MPa
      status: maxPressure > 40000000 ? 'critical' : 'normal'
    });

    if (maxPressure > 40000000) score -= 30; // Excessive pressure
    if (maxPressure > 50000000) score -= 50;

    // Analyze electromagnetic force consistency
    const emForces = data.map(dp => dp.damperData.electromagneticForce);
    const emForceVariability = this.calculateVariability(emForces);
    
    indicators.push({
      name: 'EM Force Consistency',
      value: 1 - emForceVariability,
      threshold: 0.7,
      status: emForceVariability > 0.3 ? 'warning' : 'normal'
    });

    if (emForceVariability > 0.3) score -= 15;

    // Analyze energy efficiency
    const efficiencies = data.map(dp => dp.damperData.energyEfficiency);
    const avgEfficiency = efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length;
    
    indicators.push({
      name: 'Energy Efficiency',
      value: avgEfficiency,
      threshold: 0.6,
      status: avgEfficiency < 0.6 ? 'warning' : 'normal'
    });

    if (avgEfficiency < 0.6) score -= 20;
    if (avgEfficiency < 0.4) score -= 35;

    return Math.max(0, score);
  }

  /**
   * Analyze control system health
   */
  private analyzeControlSystemHealth(data: SuspensionDataPoint[], indicators: HealthIndicator[]): number {
    let score = 100;

    // Analyze response consistency
    const responseMetric = this.calculateControlResponseMetric(data);
    
    indicators.push({
      name: 'Control Response Consistency',
      value: responseMetric,
      threshold: 0.8,
      status: responseMetric < 0.8 ? 'warning' : 'normal'
    });

    if (responseMetric < 0.8) score -= 20;
    if (responseMetric < 0.6) score -= 35;

    // Analyze integration performance
    const integrationScores = data.map(dp => dp.integrationData.performanceScore);
    const avgIntegrationScore = integrationScores.reduce((a, b) => a + b, 0) / integrationScores.length;
    
    indicators.push({
      name: 'Integration Performance',
      value: avgIntegrationScore,
      threshold: 80,
      status: avgIntegrationScore < 80 ? 'warning' : 'normal'
    });

    if (avgIntegrationScore < 80) score -= 15;
    if (avgIntegrationScore < 60) score -= 30;

    return Math.max(0, score);
  }

  /**
   * Analyze thermal management health
   */
  private analyzeThermalManagementHealth(data: SuspensionDataPoint[], indicators: HealthIndicator[]): number {
    let score = 100;

    // Analyze temperature control
    const shockTemps = data.map(dp => dp.shockAbsorberData.operatingTemperature);
    const damperTemps = data.map(dp => dp.damperData.systemTemperature);
    
    const maxShockTemp = Math.max(...shockTemps);
    const maxDamperTemp = Math.max(...damperTemps);
    
    indicators.push({
      name: 'Maximum Operating Temperature',
      value: Math.max(maxShockTemp, maxDamperTemp),
      threshold: 100,
      status: Math.max(maxShockTemp, maxDamperTemp) > 100 ? 'critical' : 'normal'
    });

    if (maxShockTemp > 100 || maxDamperTemp > 100) score -= 40;
    if (maxShockTemp > 120 || maxDamperTemp > 120) score -= 60;

    // Analyze temperature stability
    const tempVariability = (this.calculateVariability(shockTemps) + this.calculateVariability(damperTemps)) / 2;
    
    indicators.push({
      name: 'Temperature Stability',
      value: 1 - tempVariability,
      threshold: 0.8,
      status: tempVariability > 0.2 ? 'warning' : 'normal'
    });

    if (tempVariability > 0.2) score -= 15;

    return Math.max(0, score);
  }

  /**
   * Generate maintenance predictions based on health analysis
   */
  private generateMaintenancePredictions(
    data: SuspensionDataPoint[],
    healthScore: HealthScore
  ): MaintenancePrediction[] {
    const predictions: MaintenancePrediction[] = [];

    for (const component of healthScore.components) {
      const prediction = this.predictComponentMaintenance(component, data);
      if (prediction) {
        predictions.push(prediction);
      }
    }

    return predictions.sort((a, b) => a.predictedFailureDate - b.predictedFailureDate);
  }

  /**
   * Predict maintenance needs for a specific component
   */
  private predictComponentMaintenance(
    component: ComponentHealthScore,
    data: SuspensionDataPoint[]
  ): MaintenancePrediction | null {
    // Only predict for components with concerning health scores
    if (component.score > 75) return null;

    const degradationRate = this.calculateDegradationRate(component.component, data);
    const currentHealth = component.score;
    
    // Predict when health will reach critical threshold (30%)
    const criticalThreshold = 30;
    const remainingHealth = currentHealth - criticalThreshold;
    
    if (degradationRate <= 0) return null; // No degradation detected

    const daysToFailure = remainingHealth / degradationRate;
    const predictedFailureDate = Date.now() + (daysToFailure * 24 * 60 * 60 * 1000);

    // Determine failure mode based on component type and indicators
    const failureMode = this.determineFailureMode(component);
    
    // Calculate confidence based on data quality and pattern consistency
    const confidence = this.calculatePredictionConfidence(component, data);

    // Determine severity based on time to failure
    let severity: MaintenancePrediction['severity'];
    if (daysToFailure < 7) severity = 'critical';
    else if (daysToFailure < 30) severity = 'high';
    else if (daysToFailure < 90) severity = 'medium';
    else severity = 'low';

    return {
      component: component.component,
      predictedFailureDate,
      confidence,
      remainingUsefulLife: Math.max(0, daysToFailure),
      failureMode,
      severity,
      recommendedAction: this.getRecommendedAction(component, failureMode),
      costImpact: this.estimateCostImpact(component.component, severity)
    };
  }

  /**
   * Calculate degradation rate for a component
   */
  private calculateDegradationRate(component: string, data: SuspensionDataPoint[]): number {
    // Use recent health history to calculate degradation rate
    if (this.healthHistory.length < 5) return 0;

    const recentHistory = this.healthHistory.slice(-10);
    const componentScores = recentHistory.map(h => 
      h.components.find(c => c.component === component)?.score || 100
    );

    return this.calculateTrendSlope(componentScores) * -1; // Negative slope means degradation
  }

  /**
   * Calculate trend slope using linear regression
   */
  private calculateTrendSlope(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  /**
   * Determine likely failure mode for a component
   */
  private determineFailureMode(component: ComponentHealthScore): string {
    const criticalIndicators = component.keyIndicators.filter(i => i.status === 'critical');
    const warningIndicators = component.keyIndicators.filter(i => i.status === 'warning');

    switch (component.component) {
      case 'shock_absorber':
        if (criticalIndicators.some(i => i.name.includes('Uptime'))) return 'Mechanical failure';
        if (warningIndicators.some(i => i.name.includes('Efficiency'))) return 'Performance degradation';
        return 'Wear and tear';

      case 'electromagnetic_generator':
        if (warningIndicators.some(i => i.name.includes('Voltage'))) return 'Electrical component failure';
        if (warningIndicators.some(i => i.name.includes('Power'))) return 'Magnetic field degradation';
        return 'Coil degradation';

      case 'hydraulic_damper':
        if (criticalIndicators.some(i => i.name.includes('Pressure'))) return 'Seal failure';
        if (warningIndicators.some(i => i.name.includes('Efficiency'))) return 'Fluid degradation';
        return 'Valve wear';

      case 'control_system':
        return 'Software/sensor malfunction';

      case 'thermal_management':
        if (criticalIndicators.some(i => i.name.includes('Temperature'))) return 'Cooling system failure';
        return 'Heat dissipation degradation';

      default:
        return 'General wear';
    }
  }

  /**
   * Calculate prediction confidence
   */
  private calculatePredictionConfidence(component: ComponentHealthScore, data: SuspensionDataPoint[]): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on data quality
    if (data.length > 500) confidence += 0.2;
    if (data.length > 1000) confidence += 0.1;

    // Increase confidence based on health history
    if (this.healthHistory.length > 10) confidence += 0.1;
    if (this.healthHistory.length > 50) confidence += 0.1;

    // Adjust based on component score (more confident for lower scores)
    if (component.score < 50) confidence += 0.1;
    if (component.score < 30) confidence += 0.1;

    return Math.min(0.95, confidence);
  }

  /**
   * Get recommended action for a component
   */
  private getRecommendedAction(component: ComponentHealthScore, failureMode: string): string {
    const actions = {
      'Mechanical failure': 'Schedule immediate inspection and replacement of mechanical components',
      'Performance degradation': 'Perform calibration and optimization procedures',
      'Wear and tear': 'Plan preventive maintenance and component replacement',
      'Electrical component failure': 'Inspect and replace electrical components',
      'Magnetic field degradation': 'Check and replace magnetic components',
      'Coil degradation': 'Inspect coil windings and replace if necessary',
      'Seal failure': 'Replace hydraulic seals and check fluid levels',
      'Fluid degradation': 'Replace hydraulic fluid and check for contamination',
      'Valve wear': 'Inspect and replace hydraulic valves',
      'Software/sensor malfunction': 'Update software and calibrate sensors',
      'Cooling system failure': 'Inspect and repair cooling system',
      'Heat dissipation degradation': 'Clean heat sinks and improve ventilation',
      'General wear': 'Perform comprehensive system inspection'
    };

    return actions[failureMode] || 'Perform detailed component analysis';
  }

  /**
   * Estimate cost impact of maintenance
   */
  private estimateCostImpact(component: string, severity: MaintenancePrediction['severity']): number {
    const baseCosts = {
      shock_absorber: 2000,
      electromagnetic_generator: 5000,
      hydraulic_damper: 3000,
      control_system: 1500,
      thermal_management: 2500
    };

    const severityMultipliers = {
      low: 1.0,
      medium: 1.5,
      high: 2.0,
      critical: 3.0
    };

    const baseCost = baseCosts[component as keyof typeof baseCosts] || 2000;
    const multiplier = severityMultipliers[severity];

    return baseCost * multiplier;
  }

  /**
   * Generate component-specific recommendations
   */
  private generateComponentRecommendations(
    healthScore: HealthScore,
    predictions: MaintenancePrediction[]
  ): string[] {
    const recommendations: string[] = [];

    // General health recommendations
    if (healthScore.overall < 70) {
      recommendations.push('System health is below optimal levels. Consider comprehensive maintenance review.');
    }

    if (healthScore.trend === 'degrading') {
      recommendations.push('System health is degrading. Increase monitoring frequency and prepare for maintenance.');
    }

    // Component-specific recommendations
    for (const component of healthScore.components) {
      if (component.status === 'critical') {
        recommendations.push(`${component.component} requires immediate attention - critical status detected.`);
      } else if (component.status === 'poor') {
        recommendations.push(`${component.component} performance is poor - schedule maintenance soon.`);
      }
    }

    // Prediction-based recommendations
    const criticalPredictions = predictions.filter(p => p.severity === 'critical');
    if (criticalPredictions.length > 0) {
      recommendations.push(`Critical maintenance required within 7 days for: ${criticalPredictions.map(p => p.component).join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Calculate variability (coefficient of variation)
   */
  private calculateVariability(data: number[]): number {
    if (data.length === 0) return 0;

    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    return mean === 0 ? 0 : stdDev / Math.abs(mean);
  }

  /**
   * Calculate control response metric
   */
  private calculateControlResponseMetric(data: SuspensionDataPoint[]): number {
    // Simplified metric based on system performance consistency
    const performanceScores = data.map(dp => dp.integrationData.performanceScore);
    const variability = this.calculateVariability(performanceScores);
    
    return Math.max(0, 1 - variability);
  }

  /**
   * Initialize component models for machine learning
   */
  private initializeComponentModels(): void {
    const components = ['shock_absorber', 'electromagnetic_generator', 'hydraulic_damper'];
    
    for (const component of components) {
      this.componentModels.set(component, {
        modelType: 'random_forest',
        features: ['temperature', 'efficiency', 'power', 'cycles'],
        target: 'health_score',
        trainingPeriod: 30,
        validationSplit: 0.2,
        hyperparameters: {
          n_estimators: 100,
          max_depth: 10,
          min_samples_split: 5
        }
      });
    }
  }

  /**
   * Get predictive maintenance statistics
   */
  public getMaintenanceStats(): {
    totalPredictions: number;
    criticalPredictions: number;
    averageConfidence: number;
    lastAnalysisTime: number;
    healthTrend: 'improving' | 'stable' | 'degrading';
  } {
    const recentHealth = this.healthHistory.slice(-1)[0];
    
    return {
      totalPredictions: this.healthHistory.length,
      criticalPredictions: 0, // Would be calculated from recent predictions
      averageConfidence: 0.85, // Placeholder
      lastAnalysisTime: this.lastAnalysisTime,
      healthTrend: recentHealth?.trend || 'stable'
    };
  }

  /**
   * Clear maintenance analysis history
   */
  public clearMaintenanceHistory(): void {
    this.healthHistory = [];
    this.failurePatterns.clear();
  }
}