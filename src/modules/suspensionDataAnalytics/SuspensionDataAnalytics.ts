/**
 * Main Suspension Data Analytics Class
 * 
 * This is the primary interface for the suspension energy harvesting system analytics.
 * It orchestrates data processing, pattern recognition, performance optimization,
 * and predictive maintenance analysis to provide comprehensive insights.
 */

import {
  SuspensionDataPoint,
  PerformanceMetrics,
  PatternAnalysisResult,
  OptimizationRecommendation,
  MaintenancePrediction,
  HealthScore,
  AnalyticsReport,
  AnalyticsConfiguration,
  DataQualityMetrics
} from './types';

import { DataProcessor } from './DataProcessor';
import { PatternRecognitionEngine } from './PatternRecognitionEngine';
import { PerformanceOptimizer } from './PerformanceOptimizer';
import { PredictiveMaintenanceAnalyzer } from './PredictiveMaintenanceAnalyzer';

export class SuspensionDataAnalytics {
  private dataProcessor: DataProcessor;
  private patternEngine: PatternRecognitionEngine;
  private performanceOptimizer: PerformanceOptimizer;
  private maintenanceAnalyzer: PredictiveMaintenanceAnalyzer;
  
  private isRealTimeMode: boolean = false;
  private lastReportGeneration: number = 0;
  private analyticsHistory: AnalyticsReport[] = [];

  constructor(private config: AnalyticsConfiguration) {
    this.dataProcessor = new DataProcessor(config);
    this.patternEngine = new PatternRecognitionEngine(config);
    this.performanceOptimizer = new PerformanceOptimizer(config);
    this.maintenanceAnalyzer = new PredictiveMaintenanceAnalyzer(config);
    
    this.isRealTimeMode = config.enableRealTimeAnalysis;
  }

  /**
   * Process new data from the suspension system components
   */
  public processSystemData(
    shockAbsorberData: any,
    damperData: any,
    integrationData: any,
    environmentalData: any
  ): SuspensionDataPoint {
    // Process and validate the incoming data
    const dataPoint = this.dataProcessor.processDataPoint(
      shockAbsorberData,
      damperData,
      integrationData,
      environmentalData
    );

    // If real-time analysis is enabled, perform immediate analysis
    if (this.isRealTimeMode) {
      this.performRealTimeAnalysis(dataPoint);
    }

    return dataPoint;
  }

  /**
   * Perform real-time analysis on incoming data
   */
  private performRealTimeAnalysis(dataPoint: SuspensionDataPoint): void {
    // Check for immediate alerts based on thresholds
    this.checkAlertThresholds(dataPoint);

    // Update running analytics if enough data is available
    const recentData = this.dataProcessor.getRecentData(100);
    if (recentData.length >= 100) {
      // Perform lightweight pattern analysis
      try {
        const patterns = this.patternEngine.analyzePatterns(recentData);
        
        // Check for critical anomalies
        const criticalAnomalies = patterns.anomalies.filter(a => a.severity === 'critical');
        if (criticalAnomalies.length > 0) {
          console.warn('Critical anomalies detected:', criticalAnomalies);
        }
      } catch (error) {
        console.warn('Real-time pattern analysis failed:', error);
      }
    }
  }

  /**
   * Check data against alert thresholds
   */
  private checkAlertThresholds(dataPoint: SuspensionDataPoint): void {
    const alerts: string[] = [];

    // Temperature alerts
    if (dataPoint.shockAbsorberData.operatingTemperature > this.config.alertThresholds.temperatureHigh) {
      alerts.push(`High shock absorber temperature: ${dataPoint.shockAbsorberData.operatingTemperature}°C`);
    }

    if (dataPoint.damperData.systemTemperature > this.config.alertThresholds.temperatureCritical) {
      alerts.push(`Critical damper temperature: ${dataPoint.damperData.systemTemperature}°C`);
    }

    // Efficiency alerts
    if (dataPoint.shockAbsorberData.efficiency < this.config.alertThresholds.efficiencyLow) {
      alerts.push(`Low shock absorber efficiency: ${(dataPoint.shockAbsorberData.efficiency * 100).toFixed(1)}%`);
    }

    // Power alerts
    const totalPower = dataPoint.shockAbsorberData.generatedPower + dataPoint.damperData.generatedPower;
    if (totalPower < this.config.alertThresholds.powerLow) {
      alerts.push(`Low power generation: ${totalPower.toFixed(1)}W`);
    }

    // Pressure alerts
    if (dataPoint.damperData.hydraulicPressure > this.config.alertThresholds.pressureHigh) {
      alerts.push(`High hydraulic pressure: ${(dataPoint.damperData.hydraulicPressure / 1000000).toFixed(1)} MPa`);
    }

    // Log alerts if any
    if (alerts.length > 0) {
      console.warn('System alerts:', alerts);
    }
  }

  /**
   * Generate comprehensive analytics report
   */
  public generateAnalyticsReport(
    startTime?: number,
    endTime?: number
  ): AnalyticsReport {
    const currentTime = Date.now();
    const reportStartTime = startTime || (currentTime - 24 * 60 * 60 * 1000); // Default: last 24 hours
    const reportEndTime = endTime || currentTime;

    // Get data for the specified time range
    const data = this.dataProcessor.getDataRange(reportStartTime, reportEndTime);

    if (data.length < 10) {
      throw new Error('Insufficient data for analytics report generation');
    }

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(data);

    // Analyze patterns
    const patternAnalysis = this.patternEngine.analyzePatterns(data);

    // Generate optimization recommendations
    const optimizationRecommendations = this.performanceOptimizer.generateOptimizationRecommendations(
      data,
      performanceMetrics
    );

    // Perform predictive maintenance analysis
    const maintenanceAnalysis = this.maintenanceAnalyzer.analyzePredictiveMaintenance(data);

    // Get data quality metrics
    const dataQuality = this.dataProcessor.getDataQualityMetrics();

    // Generate report summary
    const summary = this.generateReportSummary(
      data,
      performanceMetrics,
      patternAnalysis,
      optimizationRecommendations,
      maintenanceAnalysis.maintenancePredictions
    );

    const report: AnalyticsReport = {
      reportId: `report_${currentTime}_${Math.random().toString(36).substr(2, 9)}`,
      generatedAt: currentTime,
      reportPeriod: { start: reportStartTime, end: reportEndTime },
      summary,
      performanceMetrics,
      patternAnalysis,
      optimizationRecommendations,
      maintenancePredictions: maintenanceAnalysis.maintenancePredictions,
      healthScore: maintenanceAnalysis.healthScore,
      dataQuality
    };

    // Store report in history
    this.analyticsHistory.push(report);
    if (this.analyticsHistory.length > 100) {
      this.analyticsHistory = this.analyticsHistory.slice(-100);
    }

    this.lastReportGeneration = currentTime;
    return report;
  }

  /**
   * Calculate performance metrics from data
   */
  private calculatePerformanceMetrics(data: SuspensionDataPoint[]): PerformanceMetrics {
    if (data.length === 0) {
      throw new Error('No data available for performance metrics calculation');
    }

    // Power generation metrics
    const powerValues = data.map(dp => dp.shockAbsorberData.generatedPower + dp.damperData.generatedPower);
    const averagePowerGeneration = powerValues.reduce((a, b) => a + b, 0) / powerValues.length;
    const peakPowerGeneration = Math.max(...powerValues);

    // Energy harvesting metrics
    const energyValues = data.map(dp => dp.damperData.harvestedEnergy);
    const totalEnergyHarvested = energyValues.reduce((a, b) => a + b, 0);

    // Efficiency metrics
    const efficiencyValues = data.map(dp => 
      (dp.shockAbsorberData.efficiency + dp.damperData.energyEfficiency) / 2
    );
    const averageEfficiency = efficiencyValues.reduce((a, b) => a + b, 0) / efficiencyValues.length;

    // System uptime
    const operationalData = data.map(dp => dp.shockAbsorberData.isOperational);
    const systemUptime = operationalData.filter(op => op).length / operationalData.length;

    // Temperature range
    const shockTemps = data.map(dp => dp.shockAbsorberData.operatingTemperature);
    const damperTemps = data.map(dp => dp.damperData.systemTemperature);
    const allTemps = [...shockTemps, ...damperTemps];
    const temperatureRange = {
      min: Math.min(...allTemps),
      max: Math.max(...allTemps)
    };

    // Operational cycles
    const cycleData = data.map(dp => dp.damperData.operationCycles);
    const operationalCycles = Math.max(...cycleData) - Math.min(...cycleData);

    return {
      averagePowerGeneration,
      peakPowerGeneration,
      totalEnergyHarvested,
      averageEfficiency,
      systemUptime,
      temperatureRange,
      operationalCycles
    };
  }

  /**
   * Generate report summary
   */
  private generateReportSummary(
    data: SuspensionDataPoint[],
    metrics: PerformanceMetrics,
    patterns: PatternAnalysisResult,
    optimizations: OptimizationRecommendation[],
    predictions: MaintenancePrediction[]
  ): any {
    const keyFindings: string[] = [];
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];

    // Analyze performance
    if (metrics.averageEfficiency > 0.8) {
      keyFindings.push('System operating at high efficiency levels');
    } else if (metrics.averageEfficiency < 0.6) {
      criticalIssues.push('System efficiency below acceptable levels');
    }

    if (metrics.systemUptime < 0.95) {
      criticalIssues.push('System uptime below target (95%)');
    }

    // Analyze patterns
    if (patterns.trendDirection === 'decreasing') {
      criticalIssues.push('Performance trend is decreasing');
    } else if (patterns.trendDirection === 'increasing') {
      keyFindings.push('Performance trend is improving');
    }

    const criticalAnomalies = patterns.anomalies.filter(a => a.severity === 'critical');
    if (criticalAnomalies.length > 0) {
      criticalIssues.push(`${criticalAnomalies.length} critical anomalies detected`);
    }

    // Analyze optimizations
    const highPriorityOptimizations = optimizations.filter(o => o.priority === 'high' || o.priority === 'critical');
    if (highPriorityOptimizations.length > 0) {
      recommendations.push(`${highPriorityOptimizations.length} high-priority optimizations available`);
    }

    // Analyze maintenance predictions
    const criticalPredictions = predictions.filter(p => p.severity === 'critical');
    if (criticalPredictions.length > 0) {
      criticalIssues.push(`${criticalPredictions.length} components require immediate maintenance`);
    }

    // Calculate average system performance score
    const performanceFactors = [
      metrics.averageEfficiency,
      metrics.systemUptime,
      Math.min(metrics.averagePowerGeneration / 200, 1), // Normalize to 200W max
      1 - (criticalAnomalies.length / 10) // Reduce score for anomalies
    ];
    const averageSystemPerformance = performanceFactors.reduce((a, b) => a + b, 0) / performanceFactors.length * 100;

    return {
      totalDataPoints: data.length,
      averageSystemPerformance,
      keyFindings,
      criticalIssues,
      recommendations
    };
  }

  /**
   * Get system status overview
   */
  public getSystemStatus(): {
    isOperational: boolean;
    dataQuality: DataQualityMetrics;
    recentPerformance: number;
    activeAlerts: number;
    lastAnalysis: number;
  } {
    const recentData = this.dataProcessor.getRecentData(10);
    const dataQuality = this.dataProcessor.getDataQualityMetrics();
    
    let recentPerformance = 0;
    if (recentData.length > 0) {
      const recentEfficiency = recentData.map(dp => 
        (dp.shockAbsorberData.efficiency + dp.damperData.energyEfficiency) / 2
      );
      recentPerformance = recentEfficiency.reduce((a, b) => a + b, 0) / recentEfficiency.length * 100;
    }

    const isOperational = recentData.length > 0 && 
      recentData[recentData.length - 1].shockAbsorberData.isOperational;

    return {
      isOperational,
      dataQuality,
      recentPerformance,
      activeAlerts: 0, // Would be calculated from active alert system
      lastAnalysis: this.lastReportGeneration
    };
  }

  /**
   * Export analytics data
   */
  public exportAnalyticsData(format: 'json' | 'csv' = 'json'): string {
    const allData = this.dataProcessor.getAllData();
    const bufferStats = this.dataProcessor.getBufferStats();
    const patternStats = this.patternEngine.getPatternStats();
    const optimizationStats = this.performanceOptimizer.getOptimizationStats();
    const maintenanceStats = this.maintenanceAnalyzer.getMaintenanceStats();

    const exportData = {
      exportTimestamp: Date.now(),
      configuration: this.config,
      statistics: {
        buffer: bufferStats,
        patterns: patternStats,
        optimization: optimizationStats,
        maintenance: maintenanceStats
      },
      recentReports: this.analyticsHistory.slice(-10),
      rawData: format === 'json' ? allData : null
    };

    if (format === 'csv') {
      return this.convertToCSV(allData);
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: SuspensionDataPoint[]): string {
    if (data.length === 0) return '';

    const headers = [
      'timestamp',
      'shock_power', 'shock_damping_force', 'shock_efficiency', 'shock_temperature',
      'damper_power', 'damper_force', 'damper_efficiency', 'damper_pressure', 'damper_temperature',
      'total_power', 'performance_score', 'vehicle_speed', 'road_condition', 'battery_soc'
    ];

    const csvRows = [headers.join(',')];

    for (const dp of data) {
      const row = [
        dp.timestamp,
        dp.shockAbsorberData.generatedPower,
        dp.shockAbsorberData.dampingForce,
        dp.shockAbsorberData.efficiency,
        dp.shockAbsorberData.operatingTemperature,
        dp.damperData.generatedPower,
        dp.damperData.dampingForce,
        dp.damperData.energyEfficiency,
        dp.damperData.hydraulicPressure,
        dp.damperData.systemTemperature,
        dp.integrationData.totalGeneratedPower,
        dp.integrationData.performanceScore,
        dp.environmentalData.vehicleSpeed,
        dp.environmentalData.roadCondition,
        dp.environmentalData.batterySOC
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Update analytics configuration
   */
  public updateConfiguration(newConfig: Partial<AnalyticsConfiguration>): void {
    Object.assign(this.config, newConfig);
    
    // Update real-time mode if changed
    if (newConfig.enableRealTimeAnalysis !== undefined) {
      this.isRealTimeMode = newConfig.enableRealTimeAnalysis;
    }
  }

  /**
   * Clear all analytics data
   */
  public clearAllData(): void {
    this.dataProcessor.clearData();
    this.patternEngine.clearCache();
    this.performanceOptimizer.clearOptimizationHistory();
    this.maintenanceAnalyzer.clearMaintenanceHistory();
    this.analyticsHistory = [];
  }

  /**
   * Get analytics statistics
   */
  public getAnalyticsStatistics(): {
    totalDataPoints: number;
    totalReports: number;
    systemUptime: number;
    averageDataQuality: number;
    lastReportTime: number;
  } {
    const bufferStats = this.dataProcessor.getBufferStats();
    const dataQuality = this.dataProcessor.getDataQualityMetrics();
    
    const averageDataQuality = (
      dataQuality.completeness +
      dataQuality.accuracy +
      dataQuality.consistency +
      dataQuality.timeliness +
      dataQuality.validity
    ) / 5;

    return {
      totalDataPoints: bufferStats.totalDataPoints,
      totalReports: this.analyticsHistory.length,
      systemUptime: 0.98, // Placeholder - would be calculated from operational data
      averageDataQuality,
      lastReportTime: this.lastReportGeneration
    };
  }

  /**
   * Perform comprehensive system analysis
   */
  public performComprehensiveAnalysis(): {
    performanceMetrics: PerformanceMetrics;
    patternAnalysis: PatternAnalysisResult;
    optimizationRecommendations: OptimizationRecommendation[];
    maintenancePredictions: MaintenancePrediction[];
    healthScore: HealthScore;
    systemRecommendations: string[];
  } {
    const allData = this.dataProcessor.getAllData();
    
    if (allData.length < 100) {
      throw new Error('Insufficient data for comprehensive analysis (minimum 100 data points required)');
    }

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(allData);

    // Analyze patterns
    const patternAnalysis = this.patternEngine.analyzePatterns(allData);

    // Generate optimization recommendations
    const optimizationRecommendations = this.performanceOptimizer.generateOptimizationRecommendations(
      allData,
      performanceMetrics
    );

    // Perform predictive maintenance analysis
    const maintenanceAnalysis = this.maintenanceAnalyzer.analyzePredictiveMaintenance(allData);

    // Generate system-level recommendations
    const systemRecommendations = this.generateSystemRecommendations(
      performanceMetrics,
      patternAnalysis,
      optimizationRecommendations,
      maintenanceAnalysis.maintenancePredictions
    );

    return {
      performanceMetrics,
      patternAnalysis,
      optimizationRecommendations,
      maintenancePredictions: maintenanceAnalysis.maintenancePredictions,
      healthScore: maintenanceAnalysis.healthScore,
      systemRecommendations
    };
  }

  /**
   * Generate system-level recommendations
   */
  private generateSystemRecommendations(
    metrics: PerformanceMetrics,
    patterns: PatternAnalysisResult,
    optimizations: OptimizationRecommendation[],
    predictions: MaintenancePrediction[]
  ): string[] {
    const recommendations: string[] = [];

    // Performance-based recommendations
    if (metrics.averageEfficiency < 0.7) {
      recommendations.push('System efficiency is below optimal. Consider implementing efficiency optimization measures.');
    }

    if (metrics.systemUptime < 0.95) {
      recommendations.push('System uptime is below target. Investigate reliability issues and implement preventive measures.');
    }

    // Pattern-based recommendations
    if (patterns.trendDirection === 'decreasing') {
      recommendations.push('Performance is declining. Immediate investigation and corrective action required.');
    }

    const criticalAnomalies = patterns.anomalies.filter(a => a.severity === 'critical');
    if (criticalAnomalies.length > 0) {
      recommendations.push('Critical anomalies detected. Perform immediate system inspection.');
    }

    // Optimization-based recommendations
    const criticalOptimizations = optimizations.filter(o => o.priority === 'critical');
    if (criticalOptimizations.length > 0) {
      recommendations.push('Critical optimizations available. Implement immediately to prevent system degradation.');
    }

    // Maintenance-based recommendations
    const urgentMaintenance = predictions.filter(p => p.severity === 'critical' || p.severity === 'high');
    if (urgentMaintenance.length > 0) {
      recommendations.push('Urgent maintenance required. Schedule immediate service to prevent failures.');
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('System is operating within normal parameters. Continue regular monitoring.');
    }

    return recommendations;
  }
}