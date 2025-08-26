# Suspension Data Analytics Module

This module provides comprehensive data analytics tools for analyzing performance data of the suspension energy harvesting system. It processes and interprets data to identify patterns, optimize performance, and predict maintenance needs.

## Overview

The Suspension Data Analytics module consists of five main components:

1. **SuspensionDataAnalytics**: Main orchestrator class that coordinates all analytics operations
2. **DataProcessor**: Handles data collection, preprocessing, and storage
3. **PatternRecognitionEngine**: Implements advanced pattern recognition algorithms
4. **PerformanceOptimizer**: Analyzes performance and generates optimization recommendations
5. **PredictiveMaintenanceAnalyzer**: Predicts maintenance needs and system health

## Key Features

### Data Processing
- **Real-time Data Processing**: Continuous processing of suspension system data
- **Data Validation**: Comprehensive validation and cleaning of input data
- **Quality Metrics**: Monitoring of data completeness, accuracy, consistency, timeliness, and validity
- **Data Storage**: Efficient buffering and storage with configurable retention periods

### Pattern Recognition
- **Trend Analysis**: Identification of performance trends using statistical methods
- **Anomaly Detection**: Real-time detection of system anomalies with configurable sensitivity
- **Correlation Analysis**: Analysis of relationships between different system parameters
- **Seasonality Detection**: Identification of periodic patterns in system behavior

### Performance Optimization
- **Optimization Recommendations**: AI-driven recommendations for system improvements
- **Performance Baseline**: Establishment and tracking of performance baselines
- **Category-based Analysis**: Separate analysis for damping, energy harvesting, thermal, and maintenance optimization
- **ROI Estimation**: Cost-benefit analysis for optimization recommendations

### Predictive Maintenance
- **Health Scoring**: Comprehensive health assessment for all system components
- **Failure Prediction**: Machine learning-based prediction of component failures
- **Maintenance Scheduling**: Intelligent scheduling of maintenance activities
- **Cost Impact Analysis**: Estimation of maintenance costs and business impact

## Installation

```typescript
import { SuspensionDataAnalytics } from './modules/suspensionDataAnalytics';
```

## Configuration

```typescript
const config: AnalyticsConfiguration = {
  dataRetentionPeriod: 30, // days
  samplingRate: 10, // Hz
  anomalyDetectionSensitivity: 0.8, // 0-1
  predictionHorizon: 90, // days
  enableRealTimeAnalysis: true,
  enablePredictiveMaintenance: true,
  alertThresholds: {
    temperatureHigh: 90, // °C
    temperatureCritical: 110, // °C
    efficiencyLow: 0.6, // 60%
    efficiencyCritical: 0.4, // 40%
    powerLow: 50, // W
    vibrationHigh: 10, // m/s²
    pressureHigh: 40000000 // Pa (40 MPa)
  }
};
```

## Basic Usage

### Initialize Analytics System

```typescript
const analytics = new SuspensionDataAnalytics(config);
```

### Process System Data

```typescript
// Process data from suspension components
const dataPoint = analytics.processSystemData(
  shockAbsorberData,
  damperData,
  integrationData,
  environmentalData
);
```

### Generate Analytics Report

```typescript
// Generate comprehensive analytics report
const report = analytics.generateAnalyticsReport();

console.log('Performance Metrics:', report.performanceMetrics);
console.log('Optimization Recommendations:', report.optimizationRecommendations);
console.log('Maintenance Predictions:', report.maintenancePredictions);
console.log('System Health Score:', report.healthScore);
```

### Perform Comprehensive Analysis

```typescript
// Perform full system analysis
const analysis = analytics.performComprehensiveAnalysis();

console.log('System Recommendations:', analysis.systemRecommendations);
console.log('Pattern Analysis:', analysis.patternAnalysis);
```

## Advanced Usage

### Real-time Monitoring

```typescript
// Enable real-time analysis
analytics.updateConfiguration({ enableRealTimeAnalysis: true });

// Process continuous data stream
setInterval(() => {
  const dataPoint = analytics.processSystemData(
    getCurrentShockAbsorberData(),
    getCurrentDamperData(),
    getCurrentIntegrationData(),
    getCurrentEnvironmentalData()
  );
}, 100); // 10 Hz sampling rate
```

### Custom Pattern Analysis

```typescript
// Get recent data for custom analysis
const recentData = analytics.dataProcessor.getRecentData(1000);

// Perform pattern analysis
const patterns = analytics.patternEngine.analyzePatterns(recentData);

// Check for specific anomalies
const temperatureAnomalies = patterns.anomalies.filter(a => a.type === 'temperature');
```

### Performance Optimization

```typescript
// Generate optimization recommendations
const metrics = analytics.calculatePerformanceMetrics(data);
const recommendations = analytics.performanceOptimizer.generateOptimizationRecommendations(data, metrics);

// Filter high-priority recommendations
const criticalRecommendations = recommendations.filter(r => r.priority === 'critical');
```

### Predictive Maintenance

```typescript
// Analyze system health
const maintenanceAnalysis = analytics.maintenanceAnalyzer.analyzePredictiveMaintenance(data);

// Get component health scores
const componentHealth = maintenanceAnalysis.healthScore.components;

// Check for urgent maintenance needs
const urgentMaintenance = maintenanceAnalysis.maintenancePredictions.filter(
  p => p.severity === 'critical' || p.severity === 'high'
);
```

## Data Export

### JSON Export

```typescript
// Export all analytics data as JSON
const jsonData = analytics.exportAnalyticsData('json');
```

### CSV Export

```typescript
// Export raw data as CSV
const csvData = analytics.exportAnalyticsData('csv');
```

## System Status Monitoring

```typescript
// Get current system status
const status = analytics.getSystemStatus();

console.log('System Operational:', status.isOperational);
console.log('Data Quality:', status.dataQuality);
console.log('Recent Performance:', status.recentPerformance);
```

## Analytics Statistics

```typescript
// Get comprehensive analytics statistics
const stats = analytics.getAnalyticsStatistics();

console.log('Total Data Points:', stats.totalDataPoints);
console.log('Total Reports:', stats.totalReports);
console.log('Average Data Quality:', stats.averageDataQuality);
```

## Error Handling

```typescript
try {
  const report = analytics.generateAnalyticsReport();
} catch (error) {
  if (error.message.includes('Insufficient data')) {
    console.log('Not enough data for analysis. Continue collecting data.');
  } else {
    console.error('Analytics error:', error);
  }
}
```

## Performance Considerations

### Memory Management
- The system automatically manages data buffer size based on retention period
- Old data is automatically purged to prevent memory issues
- Consider adjusting `dataRetentionPeriod` based on available memory

### Processing Performance
- Real-time analysis adds computational overhead
- Adjust `samplingRate` based on system capabilities
- Use `enableRealTimeAnalysis: false` for batch processing scenarios

### Data Quality
- Ensure consistent data input for best results
- Monitor data quality metrics regularly
- Implement data validation at the source when possible

## Integration Examples

### With Shock Absorber System

```typescript
import { RotaryElectromagneticShockAbsorber } from '../electromagneticShockAbsorber';

const shockAbsorber = new RotaryElectromagneticShockAbsorber(/* config */);
const analytics = new SuspensionDataAnalytics(analyticsConfig);

// Process shock absorber data
const shockData = shockAbsorber.processMotion(suspensionInputs);
const systemStatus = shockAbsorber.getSystemStatus();

analytics.processSystemData(
  { ...shockData, ...systemStatus },
  damperData,
  integrationData,
  environmentalData
);
```

### With Fuzzy Control System

```typescript
import { FuzzyControlIntegration } from '../fuzzyControl';

const fuzzyControl = new FuzzyControlIntegration(/* config */);
const analytics = new SuspensionDataAnalytics(analyticsConfig);

// Process fuzzy control data
const controlOutputs = fuzzyControl.processControlCycle(systemInputs);
const diagnostics = fuzzyControl.getSystemDiagnostics();

analytics.processSystemData(
  shockAbsorberData,
  { ...controlOutputs, ...diagnostics },
  integrationData,
  environmentalData
);
```

## Troubleshooting

### Common Issues

1. **Insufficient Data Error**
   - Ensure minimum data points are available (10 for basic analysis, 100 for comprehensive)
   - Check data collection frequency and duration

2. **Poor Data Quality**
   - Verify input data validation
   - Check for missing or invalid data fields
   - Monitor data quality metrics

3. **Performance Issues**
   - Reduce sampling rate if processing is slow
   - Disable real-time analysis for batch processing
   - Adjust buffer size and retention period

4. **Inaccurate Predictions**
   - Ensure sufficient historical data for training
   - Verify data consistency and quality
   - Check for system changes that might affect patterns

### Debug Mode

```typescript
// Enable detailed logging for debugging
const analytics = new SuspensionDataAnalytics({
  ...config,
  enableRealTimeAnalysis: true
});

// Monitor data quality
const quality = analytics.dataProcessor.getDataQualityMetrics();
console.log('Data Quality:', quality);

// Check pattern recognition statistics
const patternStats = analytics.patternEngine.getPatternStats();
console.log('Pattern Stats:', patternStats);
```

## API Reference

For detailed API documentation, see the TypeScript interfaces in `types.ts`:

- `SuspensionDataPoint`: Core data structure
- `PerformanceMetrics`: Performance measurement interface
- `PatternAnalysisResult`: Pattern recognition results
- `OptimizationRecommendation`: Optimization suggestions
- `MaintenancePrediction`: Predictive maintenance results
- `HealthScore`: System health assessment
- `AnalyticsReport`: Comprehensive analytics report

## Contributing

When extending the analytics module:

1. Follow the existing TypeScript patterns
2. Add comprehensive error handling
3. Include unit tests for new functionality
4. Update documentation and examples
5. Consider performance implications of new features

## License

This module is part of the suspension energy harvesting system project.