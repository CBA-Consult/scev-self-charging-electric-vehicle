/**
 * Basic Usage Example for Suspension Data Analytics
 * 
 * This example demonstrates the basic functionality of the suspension data analytics system,
 * including data processing, pattern recognition, performance optimization, and predictive maintenance.
 */

import { SuspensionDataAnalytics } from '../SuspensionDataAnalytics';
import { AnalyticsConfiguration } from '../types';

// Example configuration
const analyticsConfig: AnalyticsConfiguration = {
  dataRetentionPeriod: 7, // 7 days
  samplingRate: 1, // 1 Hz for this example
  anomalyDetectionSensitivity: 0.8,
  predictionHorizon: 30, // 30 days
  enableRealTimeAnalysis: true,
  enablePredictiveMaintenance: true,
  alertThresholds: {
    temperatureHigh: 85,
    temperatureCritical: 105,
    efficiencyLow: 0.65,
    efficiencyCritical: 0.45,
    powerLow: 30,
    vibrationHigh: 8,
    pressureHigh: 35000000 // 35 MPa
  }
};

export class BasicUsageExample {
  private analytics: SuspensionDataAnalytics;

  constructor() {
    this.analytics = new SuspensionDataAnalytics(analyticsConfig);
  }

  /**
   * Demonstrate basic data processing
   */
  public demonstrateDataProcessing(): void {
    console.log('=== Basic Data Processing Example ===\n');

    // Simulate suspension system data
    for (let i = 0; i < 150; i++) {
      const timestamp = Date.now() - (150 - i) * 1000; // 1 second intervals
      
      // Generate realistic test data
      const shockAbsorberData = this.generateShockAbsorberData(i);
      const damperData = this.generateDamperData(i);
      const integrationData = this.generateIntegrationData(i);
      const environmentalData = this.generateEnvironmentalData(i);

      // Process the data
      const dataPoint = this.analytics.processSystemData(
        shockAbsorberData,
        damperData,
        integrationData,
        environmentalData
      );

      if (i % 50 === 0) {
        console.log(`Processed data point ${i + 1}:`);
        console.log(`  Power: ${(dataPoint.shockAbsorberData.generatedPower + dataPoint.damperData.generatedPower).toFixed(1)}W`);
        console.log(`  Efficiency: ${(dataPoint.shockAbsorberData.efficiency * 100).toFixed(1)}%`);
        console.log(`  Temperature: ${dataPoint.shockAbsorberData.operatingTemperature.toFixed(1)}°C`);
        console.log('');
      }
    }

    // Get system status
    const status = this.analytics.getSystemStatus();
    console.log('Current System Status:');
    console.log(`  Operational: ${status.isOperational}`);
    console.log(`  Recent Performance: ${status.recentPerformance.toFixed(1)}%`);
    console.log(`  Data Quality: ${(status.dataQuality.completeness * 100).toFixed(1)}%`);
    console.log('');
  }

  /**
   * Demonstrate analytics report generation
   */
  public demonstrateAnalyticsReport(): void {
    console.log('=== Analytics Report Generation Example ===\n');

    try {
      // Generate comprehensive analytics report
      const report = this.analytics.generateAnalyticsReport();

      console.log(`Report ID: ${report.reportId}`);
      console.log(`Generated at: ${new Date(report.generatedAt).toISOString()}`);
      console.log(`Data points analyzed: ${report.summary.totalDataPoints}`);
      console.log(`Average system performance: ${report.summary.averageSystemPerformance.toFixed(1)}%`);
      console.log('');

      // Performance metrics
      console.log('Performance Metrics:');
      console.log(`  Average Power Generation: ${report.performanceMetrics.averagePowerGeneration.toFixed(1)}W`);
      console.log(`  Peak Power Generation: ${report.performanceMetrics.peakPowerGeneration.toFixed(1)}W`);
      console.log(`  Total Energy Harvested: ${report.performanceMetrics.totalEnergyHarvested.toFixed(1)}J`);
      console.log(`  Average Efficiency: ${(report.performanceMetrics.averageEfficiency * 100).toFixed(1)}%`);
      console.log(`  System Uptime: ${(report.performanceMetrics.systemUptime * 100).toFixed(1)}%`);
      console.log('');

      // Pattern analysis
      console.log('Pattern Analysis:');
      console.log(`  Trend Direction: ${report.patternAnalysis.trendDirection}`);
      console.log(`  Seasonality Detected: ${report.patternAnalysis.seasonality}`);
      console.log(`  Anomalies Found: ${report.patternAnalysis.anomalies.length}`);
      console.log(`  Correlations Found: ${report.patternAnalysis.correlations.length}`);
      console.log('');

      // Key findings
      if (report.summary.keyFindings.length > 0) {
        console.log('Key Findings:');
        report.summary.keyFindings.forEach((finding, index) => {
          console.log(`  ${index + 1}. ${finding}`);
        });
        console.log('');
      }

      // Critical issues
      if (report.summary.criticalIssues.length > 0) {
        console.log('Critical Issues:');
        report.summary.criticalIssues.forEach((issue, index) => {
          console.log(`  ${index + 1}. ${issue}`);
        });
        console.log('');
      }

    } catch (error) {
      console.error('Error generating analytics report:', error);
    }
  }

  /**
   * Demonstrate optimization recommendations
   */
  public demonstrateOptimizationRecommendations(): void {
    console.log('=== Optimization Recommendations Example ===\n');

    try {
      const analysis = this.analytics.performComprehensiveAnalysis();

      if (analysis.optimizationRecommendations.length > 0) {
        console.log('Optimization Recommendations:');
        
        analysis.optimizationRecommendations.slice(0, 3).forEach((rec, index) => {
          console.log(`\n${index + 1}. ${rec.title} (${rec.priority.toUpperCase()} priority)`);
          console.log(`   Category: ${rec.category}`);
          console.log(`   Description: ${rec.description}`);
          console.log(`   Expected Improvement: ${rec.expectedImprovement}%`);
          console.log(`   Implementation Complexity: ${rec.implementationComplexity}`);
          console.log(`   Estimated Cost: $${rec.estimatedCost.toLocaleString()}`);
          
          if (rec.actions.length > 0) {
            console.log('   Actions:');
            rec.actions.forEach(action => {
              console.log(`     - ${action.action} (confidence: ${(action.confidence * 100).toFixed(1)}%)`);
            });
          }
        });
      } else {
        console.log('No optimization recommendations at this time.');
      }
      console.log('');

    } catch (error) {
      console.error('Error generating optimization recommendations:', error);
    }
  }

  /**
   * Demonstrate predictive maintenance analysis
   */
  public demonstratePredictiveMaintenance(): void {
    console.log('=== Predictive Maintenance Example ===\n');

    try {
      const analysis = this.analytics.performComprehensiveAnalysis();

      // System health score
      console.log('System Health Score:');
      console.log(`  Overall Health: ${analysis.healthScore.overall.toFixed(1)}%`);
      console.log(`  Health Trend: ${analysis.healthScore.trend}`);
      console.log('');

      // Component health
      console.log('Component Health:');
      analysis.healthScore.components.forEach(component => {
        console.log(`  ${component.component}: ${component.score.toFixed(1)}% (${component.status})`);
        
        const criticalIndicators = component.keyIndicators.filter(i => i.status === 'critical');
        const warningIndicators = component.keyIndicators.filter(i => i.status === 'warning');
        
        if (criticalIndicators.length > 0) {
          console.log(`    Critical: ${criticalIndicators.map(i => i.name).join(', ')}`);
        }
        if (warningIndicators.length > 0) {
          console.log(`    Warning: ${warningIndicators.map(i => i.name).join(', ')}`);
        }
      });
      console.log('');

      // Maintenance predictions
      if (analysis.maintenancePredictions.length > 0) {
        console.log('Maintenance Predictions:');
        
        analysis.maintenancePredictions.forEach((prediction, index) => {
          const daysToFailure = Math.ceil(prediction.remainingUsefulLife);
          const failureDate = new Date(prediction.predictedFailureDate);
          
          console.log(`\n${index + 1}. ${prediction.component} (${prediction.severity.toUpperCase()})`);
          console.log(`   Failure Mode: ${prediction.failureMode}`);
          console.log(`   Days to Failure: ${daysToFailure}`);
          console.log(`   Predicted Date: ${failureDate.toDateString()}`);
          console.log(`   Confidence: ${(prediction.confidence * 100).toFixed(1)}%`);
          console.log(`   Cost Impact: $${prediction.costImpact.toLocaleString()}`);
          console.log(`   Recommended Action: ${prediction.recommendedAction}`);
        });
      } else {
        console.log('No immediate maintenance predictions.');
      }
      console.log('');

    } catch (error) {
      console.error('Error performing predictive maintenance analysis:', error);
    }
  }

  /**
   * Demonstrate data export functionality
   */
  public demonstrateDataExport(): void {
    console.log('=== Data Export Example ===\n');

    // Export analytics statistics
    const stats = this.analytics.getAnalyticsStatistics();
    console.log('Analytics Statistics:');
    console.log(`  Total Data Points: ${stats.totalDataPoints}`);
    console.log(`  Total Reports: ${stats.totalReports}`);
    console.log(`  System Uptime: ${(stats.systemUptime * 100).toFixed(1)}%`);
    console.log(`  Average Data Quality: ${(stats.averageDataQuality * 100).toFixed(1)}%`);
    console.log('');

    // Export sample data (first 5 data points as JSON)
    try {
      const exportData = JSON.parse(this.analytics.exportAnalyticsData('json'));
      console.log('Sample Export Data Structure:');
      console.log(`  Export Timestamp: ${new Date(exportData.exportTimestamp).toISOString()}`);
      console.log(`  Configuration: ${Object.keys(exportData.configuration).length} settings`);
      console.log(`  Statistics: ${Object.keys(exportData.statistics).length} categories`);
      console.log(`  Recent Reports: ${exportData.recentReports.length} reports`);
      console.log(`  Raw Data Points: ${exportData.rawData?.length || 0} points`);
      console.log('');

      // Show sample CSV export (first few lines)
      const csvData = this.analytics.exportAnalyticsData('csv');
      const csvLines = csvData.split('\n').slice(0, 3);
      console.log('Sample CSV Export (first 3 lines):');
      csvLines.forEach((line, index) => {
        console.log(`  ${index === 0 ? 'Headers' : `Data ${index}`}: ${line.substring(0, 80)}...`);
      });
      console.log('');

    } catch (error) {
      console.error('Error exporting data:', error);
    }
  }

  /**
   * Run all examples
   */
  public runAllExamples(): void {
    console.log('Suspension Data Analytics - Basic Usage Examples');
    console.log('================================================\n');

    this.demonstrateDataProcessing();
    this.demonstrateAnalyticsReport();
    this.demonstrateOptimizationRecommendations();
    this.demonstratePredictiveMaintenance();
    this.demonstrateDataExport();

    console.log('Examples completed successfully!');
  }

  /**
   * Generate realistic shock absorber data
   */
  private generateShockAbsorberData(index: number): any {
    const baseEfficiency = 0.75 + Math.sin(index * 0.1) * 0.15;
    const basePower = 80 + Math.sin(index * 0.05) * 30 + Math.random() * 20;
    const baseTemp = 60 + Math.sin(index * 0.02) * 15 + Math.random() * 10;

    return {
      generatedPower: Math.max(0, basePower),
      dampingForce: 2000 + Math.sin(index * 0.08) * 500 + Math.random() * 200,
      generatorRPM: 1500 + Math.sin(index * 0.06) * 800 + Math.random() * 300,
      efficiency: Math.max(0.3, Math.min(0.95, baseEfficiency)),
      outputVoltage: 24 + Math.sin(index * 0.04) * 4 + Math.random() * 2,
      outputCurrent: basePower / 24,
      operatingTemperature: Math.max(20, Math.min(120, baseTemp)),
      accumulatedEnergy: index * 50 + Math.random() * 100,
      dampingMode: ['comfort', 'sport', 'energy_harvesting', 'adaptive'][index % 4],
      isOperational: Math.random() > 0.05 // 95% uptime
    };
  }

  /**
   * Generate realistic damper data
   */
  private generateDamperData(index: number): any {
    const baseEfficiency = 0.65 + Math.sin(index * 0.12) * 0.2;
    const basePower = 60 + Math.sin(index * 0.07) * 25 + Math.random() * 15;
    const baseTemp = 55 + Math.sin(index * 0.03) * 12 + Math.random() * 8;

    return {
      generatedPower: Math.max(0, basePower),
      dampingForce: 1800 + Math.sin(index * 0.09) * 400 + Math.random() * 150,
      energyEfficiency: Math.max(0.2, Math.min(0.9, baseEfficiency)),
      electromagneticForce: 1200 + Math.sin(index * 0.11) * 300 + Math.random() * 100,
      hydraulicPressure: 25000000 + Math.sin(index * 0.05) * 8000000 + Math.random() * 2000000,
      systemTemperature: Math.max(15, Math.min(110, baseTemp)),
      harvestedEnergy: 30 + Math.random() * 20,
      totalEnergyHarvested: index * 35 + Math.random() * 50,
      operationCycles: index * 2 + Math.floor(Math.random() * 5)
    };
  }

  /**
   * Generate realistic integration data
   */
  private generateIntegrationData(index: number): any {
    return {
      totalGeneratedPower: 140 + Math.sin(index * 0.06) * 50 + Math.random() * 30,
      totalDampingForce: 7500 + Math.sin(index * 0.08) * 1500 + Math.random() * 500,
      averageEfficiency: 0.7 + Math.sin(index * 0.1) * 0.15 + Math.random() * 0.1,
      energyDistribution: [
        25 + Math.random() * 10,
        30 + Math.random() * 10,
        35 + Math.random() * 10,
        40 + Math.random() * 10
      ],
      systemStatus: ['optimal', 'good', 'degraded'][Math.floor(Math.random() * 3)],
      performanceScore: 75 + Math.sin(index * 0.05) * 15 + Math.random() * 10
    };
  }

  /**
   * Generate realistic environmental data
   */
  private generateEnvironmentalData(index: number): any {
    const baseSpeed = 60 + Math.sin(index * 0.02) * 30;
    
    return {
      vehicleSpeed: Math.max(0, Math.min(120, baseSpeed + Math.random() * 20)),
      roadCondition: ['smooth', 'rough', 'very_rough'][Math.floor(Math.random() * 3)],
      roadRoughness: Math.random() * 0.8,
      ambientTemperature: 20 + Math.sin(index * 0.01) * 15 + Math.random() * 5,
      batterySOC: 0.3 + Math.sin(index * 0.005) * 0.3 + Math.random() * 0.2,
      loadFactor: 0.4 + Math.sin(index * 0.03) * 0.3 + Math.random() * 0.2
    };
  }
}

// Example usage
if (require.main === module) {
  const example = new BasicUsageExample();
  example.runAllExamples();
}