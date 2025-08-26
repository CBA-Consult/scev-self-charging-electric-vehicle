/**
 * Road Condition Analyzer for HRS System
 * 
 * This module analyzes road conditions in real-time to provide input
 * for the Hydraulic Regenerative Suspension control algorithms.
 * It processes sensor data to classify road surface conditions and roughness.
 */

export interface RoadSensorData {
  // Accelerometer data
  verticalAcceleration: number[];    // m/s² - array of recent measurements
  lateralAcceleration: number[];     // m/s² - array of recent measurements
  longitudinalAcceleration: number[]; // m/s² - array of recent measurements
  
  // Suspension sensors
  suspensionDisplacement: number[];  // m - displacement for each wheel
  suspensionVelocity: number[];      // m/s - velocity for each wheel
  suspensionForce: number[];         // N - force measurements
  
  // Vehicle dynamics
  vehicleSpeed: number;              // km/h
  wheelSpeed: number[];              // km/h - individual wheel speeds
  steeringAngle: number;             // degrees
  
  // Environmental
  gpsCoordinates: { lat: number; lon: number };
  timestamp: number;                 // Unix timestamp
}

export interface RoadConditionOutput {
  // Primary classifications
  roughnessIndex: number;            // 0-1 scale (0=smooth, 1=very rough)
  surfaceType: 'asphalt' | 'concrete' | 'gravel' | 'dirt' | 'wet' | 'snow' | 'ice';
  roadGrade: number;                 // % grade (-20 to +20)
  
  // Detailed analysis
  textureVariability: number;        // 0-1 scale of surface texture variation
  impactFrequency: number;           // impacts per km
  vibrationIntensity: number;        // 0-1 scale of overall vibration
  
  // Predictive information
  upcomingConditions: {
    distance: number;                // meters ahead
    expectedRoughness: number;       // predicted roughness
    confidence: number;              // 0-1 confidence in prediction
  };
  
  // Quality metrics
  analysisConfidence: number;        // 0-1 confidence in current analysis
  sensorReliability: number;         // 0-1 sensor data quality
}

/**
 * Analyzes road conditions using multiple sensor inputs and machine learning techniques
 */
export class RoadConditionAnalyzer {
  private sensorHistory: RoadSensorData[] = [];
  private conditionHistory: RoadConditionOutput[] = [];
  private calibrationData: Map<string, number> = new Map();
  private surfaceClassifier: SurfaceClassifier;
  private roughnessEstimator: RoughnessEstimator;

  constructor() {
    this.surfaceClassifier = new SurfaceClassifier();
    this.roughnessEstimator = new RoughnessEstimator();
    this.initializeCalibration();
  }

  /**
   * Initialize calibration parameters for different vehicle configurations
   */
  private initializeCalibration(): void {
    // Default calibration values - would be tuned for specific vehicle
    this.calibrationData.set('accelerometer_sensitivity', 1.0);
    this.calibrationData.set('suspension_sensitivity', 1.0);
    this.calibrationData.set('speed_compensation', 0.8);
    this.calibrationData.set('roughness_threshold_low', 0.3);
    this.calibrationData.set('roughness_threshold_high', 0.7);
  }

  /**
   * Main analysis function - processes sensor data and returns road conditions
   */
  public analyzeRoadConditions(sensorData: RoadSensorData): RoadConditionOutput {
    try {
      // Store sensor data for history
      this.updateSensorHistory(sensorData);

      // Preprocess sensor data
      const processedData = this.preprocessSensorData(sensorData);

      // Analyze roughness
      const roughnessIndex = this.roughnessEstimator.estimateRoughness(processedData);

      // Classify surface type
      const surfaceType = this.surfaceClassifier.classifySurface(processedData);

      // Calculate road grade
      const roadGrade = this.calculateRoadGrade(processedData);

      // Perform detailed analysis
      const detailedAnalysis = this.performDetailedAnalysis(processedData);

      // Predict upcoming conditions
      const upcomingConditions = this.predictUpcomingConditions();

      // Calculate quality metrics
      const qualityMetrics = this.calculateQualityMetrics(sensorData);

      const output: RoadConditionOutput = {
        roughnessIndex,
        surfaceType,
        roadGrade,
        textureVariability: detailedAnalysis.textureVariability,
        impactFrequency: detailedAnalysis.impactFrequency,
        vibrationIntensity: detailedAnalysis.vibrationIntensity,
        upcomingConditions,
        analysisConfidence: qualityMetrics.analysisConfidence,
        sensorReliability: qualityMetrics.sensorReliability
      };

      // Store result for history
      this.updateConditionHistory(output);

      return output;

    } catch (error) {
      console.error('Error in road condition analysis:', error);
      return this.generateFallbackOutput();
    }
  }

  /**
   * Preprocess raw sensor data for analysis
   */
  private preprocessSensorData(sensorData: RoadSensorData): ProcessedSensorData {
    return {
      filteredVerticalAccel: this.applyLowPassFilter(sensorData.verticalAcceleration),
      normalizedSuspensionData: this.normalizeSuspensionData(sensorData),
      speedCompensatedData: this.applySpeedCompensation(sensorData),
      timestamp: sensorData.timestamp
    };
  }

  /**
   * Apply low-pass filter to remove high-frequency noise
   */
  private applyLowPassFilter(data: number[], cutoffFreq: number = 10): number[] {
    // Simple moving average filter (in practice, would use proper digital filter)
    const windowSize = Math.min(5, data.length);
    const filtered: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = data.slice(start, i + 1);
      const average = window.reduce((sum, val) => sum + val, 0) / window.length;
      filtered.push(average);
    }
    
    return filtered;
  }

  /**
   * Normalize suspension data based on vehicle speed and load
   */
  private normalizeSuspensionData(sensorData: RoadSensorData): number[] {
    const speedFactor = Math.max(0.1, sensorData.vehicleSpeed / 60); // Normalize to 60 km/h
    return sensorData.suspensionDisplacement.map(disp => disp / speedFactor);
  }

  /**
   * Apply speed compensation to account for velocity effects
   */
  private applySpeedCompensation(sensorData: RoadSensorData): RoadSensorData {
    const compensation = this.calibrationData.get('speed_compensation') || 0.8;
    const speedFactor = 1 + (sensorData.vehicleSpeed / 100) * compensation;
    
    return {
      ...sensorData,
      verticalAcceleration: sensorData.verticalAcceleration.map(acc => acc / speedFactor),
      suspensionVelocity: sensorData.suspensionVelocity.map(vel => vel / speedFactor)
    };
  }

  /**
   * Calculate road grade from longitudinal acceleration and GPS data
   */
  private calculateRoadGrade(processedData: ProcessedSensorData): number {
    // Simplified grade calculation - in practice would use GPS elevation data
    const avgLongAccel = processedData.speedCompensatedData.longitudinalAcceleration
      .reduce((sum, acc) => sum + acc, 0) / processedData.speedCompensatedData.longitudinalAcceleration.length;
    
    // Convert acceleration to grade percentage (simplified)
    const grade = Math.atan(avgLongAccel / 9.81) * (180 / Math.PI) * 1.8;
    return Math.max(-20, Math.min(20, grade));
  }

  /**
   * Perform detailed road surface analysis
   */
  private performDetailedAnalysis(processedData: ProcessedSensorData): {
    textureVariability: number;
    impactFrequency: number;
    vibrationIntensity: number;
  } {
    const verticalData = processedData.filteredVerticalAccel;
    
    // Calculate texture variability (standard deviation of accelerations)
    const mean = verticalData.reduce((sum, val) => sum + val, 0) / verticalData.length;
    const variance = verticalData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / verticalData.length;
    const textureVariability = Math.min(1, Math.sqrt(variance) / 5); // Normalize to 0-1

    // Count significant impacts (accelerations above threshold)
    const impactThreshold = 2.0; // m/s²
    const impacts = verticalData.filter(acc => Math.abs(acc) > impactThreshold).length;
    const impactFrequency = (impacts / verticalData.length) * 1000; // impacts per 1000 samples

    // Calculate overall vibration intensity
    const rmsAcceleration = Math.sqrt(
      verticalData.reduce((sum, acc) => sum + acc * acc, 0) / verticalData.length
    );
    const vibrationIntensity = Math.min(1, rmsAcceleration / 10); // Normalize to 0-1

    return {
      textureVariability,
      impactFrequency,
      vibrationIntensity
    };
  }

  /**
   * Predict upcoming road conditions based on historical data and patterns
   */
  private predictUpcomingConditions(): {
    distance: number;
    expectedRoughness: number;
    confidence: number;
  } {
    // Simplified prediction - in practice would use machine learning models
    const recentConditions = this.conditionHistory.slice(-10);
    
    if (recentConditions.length < 3) {
      return {
        distance: 100,
        expectedRoughness: 0.5,
        confidence: 0.3
      };
    }

    const avgRoughness = recentConditions.reduce((sum, cond) => sum + cond.roughnessIndex, 0) / recentConditions.length;
    const trend = this.calculateRoughnessTrend(recentConditions);
    
    return {
      distance: 100, // 100 meters ahead
      expectedRoughness: Math.max(0, Math.min(1, avgRoughness + trend)),
      confidence: Math.min(0.8, recentConditions.length / 10)
    };
  }

  /**
   * Calculate trend in roughness over recent history
   */
  private calculateRoughnessTrend(conditions: RoadConditionOutput[]): number {
    if (conditions.length < 2) return 0;
    
    const recent = conditions.slice(-3);
    const older = conditions.slice(-6, -3);
    
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, c) => sum + c.roughnessIndex, 0) / recent.length;
    const olderAvg = older.reduce((sum, c) => sum + c.roughnessIndex, 0) / older.length;
    
    return (recentAvg - olderAvg) * 0.5; // Damped trend
  }

  /**
   * Calculate quality metrics for the analysis
   */
  private calculateQualityMetrics(sensorData: RoadSensorData): {
    analysisConfidence: number;
    sensorReliability: number;
  } {
    // Check sensor data completeness and consistency
    let sensorReliability = 1.0;
    
    // Check for missing or invalid data
    if (sensorData.verticalAcceleration.length < 5) sensorReliability -= 0.3;
    if (sensorData.suspensionDisplacement.length < 4) sensorReliability -= 0.2;
    if (sensorData.vehicleSpeed <= 0) sensorReliability -= 0.2;
    
    // Check for sensor consistency
    const accelVariance = this.calculateVariance(sensorData.verticalAcceleration);
    if (accelVariance > 50) sensorReliability -= 0.2; // Very high variance indicates sensor issues
    
    // Analysis confidence based on data history and consistency
    let analysisConfidence = 0.7; // Base confidence
    
    if (this.sensorHistory.length > 10) analysisConfidence += 0.2;
    if (sensorReliability > 0.8) analysisConfidence += 0.1;
    
    return {
      analysisConfidence: Math.max(0, Math.min(1, analysisConfidence)),
      sensorReliability: Math.max(0, Math.min(1, sensorReliability))
    };
  }

  /**
   * Calculate variance of a data array
   */
  private calculateVariance(data: number[]): number {
    if (data.length === 0) return 0;
    
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return variance;
  }

  /**
   * Update sensor data history
   */
  private updateSensorHistory(sensorData: RoadSensorData): void {
    this.sensorHistory.push(sensorData);
    
    // Keep only last 100 entries
    if (this.sensorHistory.length > 100) {
      this.sensorHistory.shift();
    }
  }

  /**
   * Update condition analysis history
   */
  private updateConditionHistory(output: RoadConditionOutput): void {
    this.conditionHistory.push(output);
    
    // Keep only last 100 entries
    if (this.conditionHistory.length > 100) {
      this.conditionHistory.shift();
    }
  }

  /**
   * Generate fallback output in case of analysis failure
   */
  private generateFallbackOutput(): RoadConditionOutput {
    return {
      roughnessIndex: 0.5,
      surfaceType: 'asphalt',
      roadGrade: 0,
      textureVariability: 0.5,
      impactFrequency: 0,
      vibrationIntensity: 0.5,
      upcomingConditions: {
        distance: 100,
        expectedRoughness: 0.5,
        confidence: 0.1
      },
      analysisConfidence: 0.1,
      sensorReliability: 0.1
    };
  }

  /**
   * Get analysis statistics and diagnostics
   */
  public getAnalysisStatistics(): {
    totalAnalyses: number;
    averageConfidence: number;
    surfaceTypeDistribution: Map<string, number>;
    roughnessDistribution: { smooth: number; moderate: number; rough: number };
  } {
    const surfaceDistribution = new Map<string, number>();
    let totalConfidence = 0;
    let smoothCount = 0, moderateCount = 0, roughCount = 0;

    this.conditionHistory.forEach(condition => {
      // Surface type distribution
      const surface = condition.surfaceType;
      surfaceDistribution.set(surface, (surfaceDistribution.get(surface) || 0) + 1);
      
      // Confidence accumulation
      totalConfidence += condition.analysisConfidence;
      
      // Roughness distribution
      if (condition.roughnessIndex < 0.3) smoothCount++;
      else if (condition.roughnessIndex < 0.7) moderateCount++;
      else roughCount++;
    });

    return {
      totalAnalyses: this.conditionHistory.length,
      averageConfidence: this.conditionHistory.length > 0 ? totalConfidence / this.conditionHistory.length : 0,
      surfaceTypeDistribution: surfaceDistribution,
      roughnessDistribution: {
        smooth: smoothCount,
        moderate: moderateCount,
        rough: roughCount
      }
    };
  }
}

/**
 * Helper interface for processed sensor data
 */
interface ProcessedSensorData {
  filteredVerticalAccel: number[];
  normalizedSuspensionData: number[];
  speedCompensatedData: RoadSensorData;
  timestamp: number;
}

/**
 * Surface classifier using pattern recognition
 */
class SurfaceClassifier {
  public classifySurface(data: ProcessedSensorData): 'asphalt' | 'concrete' | 'gravel' | 'dirt' | 'wet' | 'snow' | 'ice' {
    // Simplified classification based on vibration patterns
    const vibrationIntensity = this.calculateVibrationIntensity(data.filteredVerticalAccel);
    const highFreqContent = this.calculateHighFrequencyContent(data.filteredVerticalAccel);
    
    // Classification logic (simplified)
    if (vibrationIntensity > 0.8 && highFreqContent > 0.7) return 'gravel';
    if (vibrationIntensity > 0.6 && highFreqContent > 0.5) return 'dirt';
    if (vibrationIntensity < 0.2 && highFreqContent < 0.3) return 'ice';
    if (vibrationIntensity < 0.3 && highFreqContent < 0.4) return 'snow';
    if (vibrationIntensity > 0.4 && highFreqContent < 0.4) return 'wet';
    if (vibrationIntensity < 0.4 && highFreqContent > 0.4) return 'concrete';
    
    return 'asphalt'; // Default
  }

  private calculateVibrationIntensity(data: number[]): number {
    const rms = Math.sqrt(data.reduce((sum, val) => sum + val * val, 0) / data.length);
    return Math.min(1, rms / 5); // Normalize
  }

  private calculateHighFrequencyContent(data: number[]): number {
    // Simplified high-frequency content calculation
    let highFreqEnergy = 0;
    for (let i = 1; i < data.length; i++) {
      highFreqEnergy += Math.abs(data[i] - data[i-1]);
    }
    return Math.min(1, highFreqEnergy / (data.length * 2));
  }
}

/**
 * Roughness estimator using multiple signal processing techniques
 */
class RoughnessEstimator {
  public estimateRoughness(data: ProcessedSensorData): number {
    // Multiple roughness indicators
    const varianceIndicator = this.calculateVarianceIndicator(data.filteredVerticalAccel);
    const peakIndicator = this.calculatePeakIndicator(data.filteredVerticalAccel);
    const suspensionIndicator = this.calculateSuspensionIndicator(data.normalizedSuspensionData);
    
    // Weighted combination
    const roughness = varianceIndicator * 0.4 + peakIndicator * 0.3 + suspensionIndicator * 0.3;
    
    return Math.max(0, Math.min(1, roughness));
  }

  private calculateVarianceIndicator(data: number[]): number {
    const variance = this.calculateVariance(data);
    return Math.min(1, variance / 10); // Normalize based on expected max variance
  }

  private calculatePeakIndicator(data: number[]): number {
    const maxAbs = Math.max(...data.map(Math.abs));
    return Math.min(1, maxAbs / 15); // Normalize based on expected max acceleration
  }

  private calculateSuspensionIndicator(data: number[]): number {
    const avgDisplacement = data.reduce((sum, val) => sum + Math.abs(val), 0) / data.length;
    return Math.min(1, avgDisplacement / 0.1); // Normalize based on max expected displacement
  }

  private calculateVariance(data: number[]): number {
    if (data.length === 0) return 0;
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  }
}