/**
 * Type definitions for the Suspension Data Analytics module
 */

// Data collection interfaces
export interface SuspensionDataPoint {
  timestamp: number;
  shockAbsorberData: ShockAbsorberDataPoint;
  damperData: DamperDataPoint;
  integrationData: IntegrationDataPoint;
  environmentalData: EnvironmentalDataPoint;
}

export interface ShockAbsorberDataPoint {
  generatedPower: number;
  dampingForce: number;
  generatorRPM: number;
  efficiency: number;
  outputVoltage: number;
  outputCurrent: number;
  operatingTemperature: number;
  accumulatedEnergy: number;
  dampingMode: string;
  isOperational: boolean;
}

export interface DamperDataPoint {
  generatedPower: number;
  dampingForce: number;
  energyEfficiency: number;
  electromagneticForce: number;
  hydraulicPressure: number;
  systemTemperature: number;
  harvestedEnergy: number;
  totalEnergyHarvested: number;
  operationCycles: number;
}

export interface IntegrationDataPoint {
  totalGeneratedPower: number;
  totalDampingForce: number;
  averageEfficiency: number;
  energyDistribution: number[];
  systemStatus: string;
  performanceScore: number;
}

export interface EnvironmentalDataPoint {
  vehicleSpeed: number;
  roadCondition: string;
  roadRoughness: number;
  ambientTemperature: number;
  batterySOC: number;
  loadFactor: number;
}

// Analytics interfaces
export interface PerformanceMetrics {
  averagePowerGeneration: number;
  peakPowerGeneration: number;
  totalEnergyHarvested: number;
  averageEfficiency: number;
  systemUptime: number;
  temperatureRange: { min: number; max: number };
  operationalCycles: number;
}

export interface PatternAnalysisResult {
  trendDirection: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
  seasonality: boolean;
  anomalies: AnomalyDetection[];
  correlations: CorrelationAnalysis[];
  performancePatterns: PerformancePattern[];
}

export interface AnomalyDetection {
  timestamp: number;
  type: 'temperature' | 'power' | 'efficiency' | 'force' | 'pressure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  value: number;
  expectedValue: number;
  deviation: number;
  description: string;
}

export interface CorrelationAnalysis {
  variable1: string;
  variable2: string;
  correlationCoefficient: number;
  significance: number;
  relationship: 'positive' | 'negative' | 'none';
}

export interface PerformancePattern {
  pattern: string;
  frequency: number;
  conditions: string[];
  impact: 'positive' | 'negative' | 'neutral';
  recommendation: string;
}

// Optimization interfaces
export interface OptimizationRecommendation {
  category: 'damping' | 'energy_harvesting' | 'thermal' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImprovement: number;
  implementationComplexity: 'low' | 'medium' | 'high';
  estimatedCost: number;
  actions: OptimizationAction[];
}

export interface OptimizationAction {
  action: string;
  parameter: string;
  currentValue: number;
  recommendedValue: number;
  confidence: number;
}

// Predictive maintenance interfaces
export interface MaintenancePrediction {
  component: string;
  predictedFailureDate: number;
  confidence: number;
  remainingUsefulLife: number;
  failureMode: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: string;
  costImpact: number;
}

export interface HealthScore {
  overall: number;
  components: ComponentHealthScore[];
  trend: 'improving' | 'stable' | 'degrading';
  lastUpdated: number;
}

export interface ComponentHealthScore {
  component: string;
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  keyIndicators: HealthIndicator[];
}

export interface HealthIndicator {
  name: string;
  value: number;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
}

// Configuration interfaces
export interface AnalyticsConfiguration {
  dataRetentionPeriod: number; // days
  samplingRate: number; // Hz
  anomalyDetectionSensitivity: number; // 0-1
  predictionHorizon: number; // days
  enableRealTimeAnalysis: boolean;
  enablePredictiveMaintenance: boolean;
  alertThresholds: AlertThresholds;
}

export interface AlertThresholds {
  temperatureHigh: number;
  temperatureCritical: number;
  efficiencyLow: number;
  efficiencyCritical: number;
  powerLow: number;
  vibrationHigh: number;
  pressureHigh: number;
}

// Report interfaces
export interface AnalyticsReport {
  reportId: string;
  generatedAt: number;
  reportPeriod: { start: number; end: number };
  summary: ReportSummary;
  performanceMetrics: PerformanceMetrics;
  patternAnalysis: PatternAnalysisResult;
  optimizationRecommendations: OptimizationRecommendation[];
  maintenancePredictions: MaintenancePrediction[];
  healthScore: HealthScore;
  dataQuality: DataQualityMetrics;
}

export interface ReportSummary {
  totalDataPoints: number;
  averageSystemPerformance: number;
  keyFindings: string[];
  criticalIssues: string[];
  recommendations: string[];
}

export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  validity: number;
}

// Machine learning interfaces
export interface MLModelConfiguration {
  modelType: 'linear_regression' | 'random_forest' | 'neural_network' | 'svm';
  features: string[];
  target: string;
  trainingPeriod: number; // days
  validationSplit: number; // 0-1
  hyperparameters: Record<string, any>;
}

export interface MLModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rmse: number;
  mae: number;
  r2Score: number;
}

export interface PredictionResult {
  prediction: number;
  confidence: number;
  confidenceInterval: { lower: number; upper: number };
  features: Record<string, number>;
  modelUsed: string;
}