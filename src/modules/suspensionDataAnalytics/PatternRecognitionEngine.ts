/**
 * Pattern Recognition Engine for Suspension Energy Harvesting System
 * 
 * This class implements advanced pattern recognition algorithms to identify trends,
 * anomalies, correlations, and performance patterns in suspension system data.
 */

import {
  SuspensionDataPoint,
  PatternAnalysisResult,
  AnomalyDetection,
  CorrelationAnalysis,
  PerformancePattern,
  AnalyticsConfiguration
} from './types';

export class PatternRecognitionEngine {
  private anomalyThresholds: Map<string, { mean: number; stdDev: number }> = new Map();
  private correlationCache: Map<string, number> = new Map();
  private patternHistory: PerformancePattern[] = [];

  constructor(private config: AnalyticsConfiguration) {}

  /**
   * Analyze patterns in the suspension data
   */
  public analyzePatterns(data: SuspensionDataPoint[]): PatternAnalysisResult {
    if (data.length < 10) {
      throw new Error('Insufficient data for pattern analysis (minimum 10 data points required)');
    }

    // Analyze trends
    const trendDirection = this.analyzeTrends(data);

    // Detect seasonality
    const seasonality = this.detectSeasonality(data);

    // Detect anomalies
    const anomalies = this.detectAnomalies(data);

    // Analyze correlations
    const correlations = this.analyzeCorrelations(data);

    // Identify performance patterns
    const performancePatterns = this.identifyPerformancePatterns(data);

    return {
      trendDirection,
      seasonality,
      anomalies,
      correlations,
      performancePatterns
    };
  }

  /**
   * Analyze trends in key performance metrics
   */
  private analyzeTrends(data: SuspensionDataPoint[]): 'increasing' | 'decreasing' | 'stable' | 'fluctuating' {
    // Extract power generation trend
    const powerValues = data.map(dp => dp.shockAbsorberData.generatedPower + dp.damperData.generatedPower);
    const powerTrend = this.calculateTrend(powerValues);

    // Extract efficiency trend
    const efficiencyValues = data.map(dp => 
      (dp.shockAbsorberData.efficiency + dp.damperData.energyEfficiency) / 2
    );
    const efficiencyTrend = this.calculateTrend(efficiencyValues);

    // Combine trends to determine overall direction
    const trends = [powerTrend, efficiencyTrend];
    const increasingCount = trends.filter(t => t === 'increasing').length;
    const decreasingCount = trends.filter(t => t === 'decreasing').length;
    const stableCount = trends.filter(t => t === 'stable').length;

    if (increasingCount >= 2) return 'increasing';
    if (decreasingCount >= 2) return 'decreasing';
    if (stableCount >= 1) return 'stable';
    return 'fluctuating';
  }

  /**
   * Calculate trend for a series of values using linear regression
   */
  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 3) return 'stable';

    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    // Calculate linear regression slope
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    // Determine trend based on slope and significance
    const threshold = 0.01; // Minimum slope to consider significant
    if (Math.abs(slope) < threshold) return 'stable';
    return slope > 0 ? 'increasing' : 'decreasing';
  }

  /**
   * Detect seasonality in the data using autocorrelation
   */
  private detectSeasonality(data: SuspensionDataPoint[]): boolean {
    if (data.length < 50) return false;

    // Extract power generation values
    const values = data.map(dp => dp.shockAbsorberData.generatedPower + dp.damperData.generatedPower);
    
    // Calculate autocorrelation for different lags
    const maxLag = Math.min(Math.floor(data.length / 4), 100);
    let maxCorrelation = 0;

    for (let lag = 1; lag <= maxLag; lag++) {
      const correlation = this.calculateAutocorrelation(values, lag);
      maxCorrelation = Math.max(maxCorrelation, Math.abs(correlation));
    }

    // Consider seasonal if autocorrelation exceeds threshold
    return maxCorrelation > 0.3;
  }

  /**
   * Calculate autocorrelation for a given lag
   */
  private calculateAutocorrelation(values: number[], lag: number): number {
    if (lag >= values.length) return 0;

    const n = values.length - lag;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }

    for (let i = 0; i < values.length; i++) {
      denominator += Math.pow(values[i] - mean, 2);
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Detect anomalies using statistical methods
   */
  private detectAnomalies(data: SuspensionDataPoint[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];

    // Update statistical baselines
    this.updateAnomalyBaselines(data);

    // Check each data point for anomalies
    for (const dataPoint of data) {
      anomalies.push(...this.checkDataPointAnomalies(dataPoint));
    }

    return anomalies.sort((a, b) => b.severity.localeCompare(a.severity));
  }

  /**
   * Update statistical baselines for anomaly detection
   */
  private updateAnomalyBaselines(data: SuspensionDataPoint[]): void {
    const metrics = [
      { key: 'shockAbsorberPower', values: data.map(dp => dp.shockAbsorberData.generatedPower) },
      { key: 'damperPower', values: data.map(dp => dp.damperData.generatedPower) },
      { key: 'shockAbsorberTemp', values: data.map(dp => dp.shockAbsorberData.operatingTemperature) },
      { key: 'damperTemp', values: data.map(dp => dp.damperData.systemTemperature) },
      { key: 'efficiency', values: data.map(dp => dp.shockAbsorberData.efficiency) },
      { key: 'hydraulicPressure', values: data.map(dp => dp.damperData.hydraulicPressure) }
    ];

    for (const metric of metrics) {
      const mean = metric.values.reduce((a, b) => a + b, 0) / metric.values.length;
      const variance = metric.values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / metric.values.length;
      const stdDev = Math.sqrt(variance);

      this.anomalyThresholds.set(metric.key, { mean, stdDev });
    }
  }

  /**
   * Check a single data point for anomalies
   */
  private checkDataPointAnomalies(dataPoint: SuspensionDataPoint): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    const sensitivity = this.config.anomalyDetectionSensitivity;

    // Temperature anomalies
    const shockTempBaseline = this.anomalyThresholds.get('shockAbsorberTemp');
    if (shockTempBaseline) {
      const tempAnomaly = this.checkValueAnomaly(
        dataPoint.shockAbsorberData.operatingTemperature,
        shockTempBaseline,
        sensitivity,
        'temperature'
      );
      if (tempAnomaly) {
        anomalies.push({
          ...tempAnomaly,
          timestamp: dataPoint.timestamp,
          description: 'Shock absorber temperature anomaly detected'
        });
      }
    }

    // Power generation anomalies
    const powerBaseline = this.anomalyThresholds.get('shockAbsorberPower');
    if (powerBaseline) {
      const powerAnomaly = this.checkValueAnomaly(
        dataPoint.shockAbsorberData.generatedPower,
        powerBaseline,
        sensitivity,
        'power'
      );
      if (powerAnomaly) {
        anomalies.push({
          ...powerAnomaly,
          timestamp: dataPoint.timestamp,
          description: 'Power generation anomaly detected'
        });
      }
    }

    // Efficiency anomalies
    const efficiencyBaseline = this.anomalyThresholds.get('efficiency');
    if (efficiencyBaseline) {
      const efficiencyAnomaly = this.checkValueAnomaly(
        dataPoint.shockAbsorberData.efficiency,
        efficiencyBaseline,
        sensitivity,
        'efficiency'
      );
      if (efficiencyAnomaly) {
        anomalies.push({
          ...efficiencyAnomaly,
          timestamp: dataPoint.timestamp,
          description: 'System efficiency anomaly detected'
        });
      }
    }

    // Pressure anomalies
    const pressureBaseline = this.anomalyThresholds.get('hydraulicPressure');
    if (pressureBaseline) {
      const pressureAnomaly = this.checkValueAnomaly(
        dataPoint.damperData.hydraulicPressure,
        pressureBaseline,
        sensitivity,
        'pressure'
      );
      if (pressureAnomaly) {
        anomalies.push({
          ...pressureAnomaly,
          timestamp: dataPoint.timestamp,
          description: 'Hydraulic pressure anomaly detected'
        });
      }
    }

    return anomalies;
  }

  /**
   * Check if a value is anomalous compared to baseline
   */
  private checkValueAnomaly(
    value: number,
    baseline: { mean: number; stdDev: number },
    sensitivity: number,
    type: AnomalyDetection['type']
  ): Omit<AnomalyDetection, 'timestamp' | 'description'> | null {
    const deviation = Math.abs(value - baseline.mean);
    const normalizedDeviation = baseline.stdDev > 0 ? deviation / baseline.stdDev : 0;

    // Adjust thresholds based on sensitivity
    const lowThreshold = 2 * (1 - sensitivity);
    const mediumThreshold = 3 * (1 - sensitivity);
    const highThreshold = 4 * (1 - sensitivity);
    const criticalThreshold = 5 * (1 - sensitivity);

    let severity: AnomalyDetection['severity'];
    if (normalizedDeviation > criticalThreshold) {
      severity = 'critical';
    } else if (normalizedDeviation > highThreshold) {
      severity = 'high';
    } else if (normalizedDeviation > mediumThreshold) {
      severity = 'medium';
    } else if (normalizedDeviation > lowThreshold) {
      severity = 'low';
    } else {
      return null; // Not anomalous
    }

    return {
      type,
      severity,
      value,
      expectedValue: baseline.mean,
      deviation: normalizedDeviation
    };
  }

  /**
   * Analyze correlations between different metrics
   */
  private analyzeCorrelations(data: SuspensionDataPoint[]): CorrelationAnalysis[] {
    const correlations: CorrelationAnalysis[] = [];

    // Define metric pairs to analyze
    const metricPairs = [
      {
        name1: 'Vehicle Speed',
        name2: 'Power Generation',
        values1: data.map(dp => dp.environmentalData.vehicleSpeed),
        values2: data.map(dp => dp.shockAbsorberData.generatedPower + dp.damperData.generatedPower)
      },
      {
        name1: 'Road Roughness',
        name2: 'Power Generation',
        values1: data.map(dp => dp.environmentalData.roadRoughness),
        values2: data.map(dp => dp.shockAbsorberData.generatedPower + dp.damperData.generatedPower)
      },
      {
        name1: 'Temperature',
        name2: 'Efficiency',
        values1: data.map(dp => dp.shockAbsorberData.operatingTemperature),
        values2: data.map(dp => dp.shockAbsorberData.efficiency)
      },
      {
        name1: 'Battery SOC',
        name2: 'Energy Harvesting',
        values1: data.map(dp => dp.environmentalData.batterySOC),
        values2: data.map(dp => dp.damperData.harvestedEnergy)
      }
    ];

    for (const pair of metricPairs) {
      const correlation = this.calculatePearsonCorrelation(pair.values1, pair.values2);
      const significance = this.calculateCorrelationSignificance(correlation, data.length);

      correlations.push({
        variable1: pair.name1,
        variable2: pair.name2,
        correlationCoefficient: correlation,
        significance,
        relationship: Math.abs(correlation) < 0.1 ? 'none' : correlation > 0 ? 'positive' : 'negative'
      });
    }

    return correlations.filter(c => Math.abs(c.correlationCoefficient) > 0.1);
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Calculate statistical significance of correlation
   */
  private calculateCorrelationSignificance(correlation: number, sampleSize: number): number {
    if (sampleSize < 3) return 0;

    const t = correlation * Math.sqrt((sampleSize - 2) / (1 - correlation * correlation));
    const df = sampleSize - 2;

    // Simplified p-value calculation (approximation)
    const pValue = 2 * (1 - this.studentTCDF(Math.abs(t), df));
    return 1 - pValue; // Return significance as 1 - p-value
  }

  /**
   * Simplified Student's t-distribution CDF approximation
   */
  private studentTCDF(t: number, df: number): number {
    // Simplified approximation for demonstration
    const x = df / (df + t * t);
    return 0.5 + 0.5 * Math.sign(t) * (1 - Math.pow(x, df / 2));
  }

  /**
   * Identify performance patterns in the data
   */
  private identifyPerformancePatterns(data: SuspensionDataPoint[]): PerformancePattern[] {
    const patterns: PerformancePattern[] = [];

    // Pattern 1: High efficiency during specific conditions
    const highEfficiencyPattern = this.identifyHighEfficiencyPattern(data);
    if (highEfficiencyPattern) patterns.push(highEfficiencyPattern);

    // Pattern 2: Power generation peaks
    const powerPeakPattern = this.identifyPowerPeakPattern(data);
    if (powerPeakPattern) patterns.push(powerPeakPattern);

    // Pattern 3: Temperature-related performance degradation
    const temperaturePattern = this.identifyTemperaturePattern(data);
    if (temperaturePattern) patterns.push(temperaturePattern);

    // Pattern 4: Road condition impact
    const roadConditionPattern = this.identifyRoadConditionPattern(data);
    if (roadConditionPattern) patterns.push(roadConditionPattern);

    return patterns;
  }

  /**
   * Identify high efficiency patterns
   */
  private identifyHighEfficiencyPattern(data: SuspensionDataPoint[]): PerformancePattern | null {
    const highEfficiencyData = data.filter(dp => 
      dp.shockAbsorberData.efficiency > 0.8 && dp.damperData.energyEfficiency > 0.8
    );

    if (highEfficiencyData.length < data.length * 0.1) return null;

    const commonConditions = this.findCommonConditions(highEfficiencyData);
    
    return {
      pattern: 'High Efficiency Operation',
      frequency: highEfficiencyData.length / data.length,
      conditions: commonConditions,
      impact: 'positive',
      recommendation: 'Optimize system to operate more frequently under these conditions'
    };
  }

  /**
   * Identify power generation peak patterns
   */
  private identifyPowerPeakPattern(data: SuspensionDataPoint[]): PerformancePattern | null {
    const avgPower = data.reduce((sum, dp) => 
      sum + dp.shockAbsorberData.generatedPower + dp.damperData.generatedPower, 0
    ) / data.length;

    const powerPeaks = data.filter(dp => 
      (dp.shockAbsorberData.generatedPower + dp.damperData.generatedPower) > avgPower * 1.5
    );

    if (powerPeaks.length < data.length * 0.05) return null;

    const commonConditions = this.findCommonConditions(powerPeaks);

    return {
      pattern: 'Power Generation Peaks',
      frequency: powerPeaks.length / data.length,
      conditions: commonConditions,
      impact: 'positive',
      recommendation: 'Increase exposure to conditions that generate power peaks'
    };
  }

  /**
   * Identify temperature-related patterns
   */
  private identifyTemperaturePattern(data: SuspensionDataPoint[]): PerformancePattern | null {
    const highTempData = data.filter(dp => 
      dp.shockAbsorberData.operatingTemperature > 80 || dp.damperData.systemTemperature > 80
    );

    if (highTempData.length < data.length * 0.1) return null;

    const avgEfficiencyHigh = highTempData.reduce((sum, dp) => 
      sum + dp.shockAbsorberData.efficiency, 0
    ) / highTempData.length;

    const normalTempData = data.filter(dp => 
      dp.shockAbsorberData.operatingTemperature <= 80 && dp.damperData.systemTemperature <= 80
    );

    const avgEfficiencyNormal = normalTempData.reduce((sum, dp) => 
      sum + dp.shockAbsorberData.efficiency, 0
    ) / normalTempData.length;

    if (avgEfficiencyHigh < avgEfficiencyNormal * 0.9) {
      return {
        pattern: 'Temperature-Related Performance Degradation',
        frequency: highTempData.length / data.length,
        conditions: ['High operating temperature (>80°C)'],
        impact: 'negative',
        recommendation: 'Implement better cooling strategies to maintain optimal temperature'
      };
    }

    return null;
  }

  /**
   * Identify road condition patterns
   */
  private identifyRoadConditionPattern(data: SuspensionDataPoint[]): PerformancePattern | null {
    const roughRoadData = data.filter(dp => dp.environmentalData.roadRoughness > 0.7);
    const smoothRoadData = data.filter(dp => dp.environmentalData.roadRoughness < 0.3);

    if (roughRoadData.length === 0 || smoothRoadData.length === 0) return null;

    const avgPowerRough = roughRoadData.reduce((sum, dp) => 
      sum + dp.shockAbsorberData.generatedPower + dp.damperData.generatedPower, 0
    ) / roughRoadData.length;

    const avgPowerSmooth = smoothRoadData.reduce((sum, dp) => 
      sum + dp.shockAbsorberData.generatedPower + dp.damperData.generatedPower, 0
    ) / smoothRoadData.length;

    if (avgPowerRough > avgPowerSmooth * 1.2) {
      return {
        pattern: 'Enhanced Power Generation on Rough Roads',
        frequency: roughRoadData.length / data.length,
        conditions: ['High road roughness (>0.7)'],
        impact: 'positive',
        recommendation: 'Optimize energy harvesting algorithms for rough road conditions'
      };
    }

    return null;
  }

  /**
   * Find common conditions in a dataset
   */
  private findCommonConditions(data: SuspensionDataPoint[]): string[] {
    const conditions: string[] = [];

    // Analyze speed ranges
    const avgSpeed = data.reduce((sum, dp) => sum + dp.environmentalData.vehicleSpeed, 0) / data.length;
    if (avgSpeed > 80) conditions.push('High speed driving (>80 km/h)');
    else if (avgSpeed < 30) conditions.push('Low speed driving (<30 km/h)');

    // Analyze road conditions
    const roughRoadCount = data.filter(dp => dp.environmentalData.roadRoughness > 0.5).length;
    if (roughRoadCount > data.length * 0.7) conditions.push('Rough road conditions');

    // Analyze temperature
    const avgTemp = data.reduce((sum, dp) => sum + dp.environmentalData.ambientTemperature, 0) / data.length;
    if (avgTemp > 30) conditions.push('High ambient temperature (>30°C)');
    else if (avgTemp < 0) conditions.push('Low ambient temperature (<0°C)');

    // Analyze battery state
    const avgSOC = data.reduce((sum, dp) => sum + dp.environmentalData.batterySOC, 0) / data.length;
    if (avgSOC < 0.3) conditions.push('Low battery state of charge (<30%)');

    return conditions;
  }

  /**
   * Get pattern recognition statistics
   */
  public getPatternStats(): {
    totalPatternsIdentified: number;
    anomalyDetectionAccuracy: number;
    correlationAnalysisCount: number;
    lastAnalysisTime: number;
  } {
    return {
      totalPatternsIdentified: this.patternHistory.length,
      anomalyDetectionAccuracy: 0.95, // Placeholder - would be calculated from validation data
      correlationAnalysisCount: this.correlationCache.size,
      lastAnalysisTime: Date.now()
    };
  }

  /**
   * Clear pattern recognition cache
   */
  public clearCache(): void {
    this.anomalyThresholds.clear();
    this.correlationCache.clear();
    this.patternHistory = [];
  }
}