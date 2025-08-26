/**
 * Driving Pattern Analyzer for HRS System
 * 
 * This module analyzes driving patterns in real-time to provide input
 * for the Hydraulic Regenerative Suspension control algorithms.
 * It processes vehicle dynamics data to classify driving behavior and patterns.
 */

export interface DrivingBehaviorData {
  // Vehicle dynamics
  vehicleSpeed: number;              // km/h
  acceleration: number;              // m/s²
  deceleration: number;              // m/s²
  lateralAcceleration: number;       // m/s²
  
  // Driver inputs
  acceleratorPedalPosition: number;  // 0-1 (0=released, 1=full throttle)
  brakePedalPosition: number;        // 0-1 (0=released, 1=full brake)
  steeringAngle: number;             // degrees
  steeringRate: number;              // degrees/second
  
  // Operational context
  drivingMode: 'eco' | 'comfort' | 'sport' | 'off-road' | 'manual';
  roadType: 'city' | 'highway' | 'rural' | 'parking' | 'off-road';
  trafficDensity: 'light' | 'moderate' | 'heavy' | 'stop-and-go';
  
  // Time context
  timestamp: number;                 // Unix timestamp
  tripDuration: number;              // seconds since trip start
}

export interface DrivingPatternOutput {
  // Primary pattern classifications
  accelerationPattern: number;       // 0-1 scale (0=gentle, 1=aggressive)
  brakingPattern: number;            // 0-1 scale (0=gentle, 1=aggressive)
  corneringPattern: number;          // 0-1 scale (0=gentle, 1=aggressive)
  
  // Driving style classification
  drivingStyle: 'eco' | 'normal' | 'sporty' | 'aggressive' | 'erratic';
  aggressivenessIndex: number;       // 0-1 overall aggressiveness
  smoothnessIndex: number;           // 0-1 driving smoothness
  
  // Behavioral patterns
  speedVariability: number;          // 0-1 consistency of speed
  anticipationLevel: number;         // 0-1 how well driver anticipates
  adaptabilityIndex: number;         // 0-1 adaptation to conditions
  
  // Predictive information
  predictedBehavior: {
    nextAcceleration: number;        // predicted acceleration in next 5s
    nextBraking: number;             // predicted braking intensity
    nextSteering: number;            // predicted steering activity
    confidence: number;              // 0-1 confidence in predictions
  };
  
  // Quality metrics
  analysisConfidence: number;        // 0-1 confidence in current analysis
  dataQuality: number;               // 0-1 quality of input data
}

/**
 * Analyzes driving patterns using behavioral modeling and pattern recognition
 */
export class DrivingPatternAnalyzer {
  private behaviorHistory: DrivingBehaviorData[] = [];
  private patternHistory: DrivingPatternOutput[] = [];
  private driverProfile: DriverProfile;
  private patternClassifier: PatternClassifier;
  private behaviorPredictor: BehaviorPredictor;

  constructor() {
    this.driverProfile = new DriverProfile();
    this.patternClassifier = new PatternClassifier();
    this.behaviorPredictor = new BehaviorPredictor();
  }

  /**
   * Main analysis function - processes behavior data and returns driving patterns
   */
  public analyzeDrivingPattern(behaviorData: DrivingBehaviorData): DrivingPatternOutput {
    try {
      // Store behavior data for history
      this.updateBehaviorHistory(behaviorData);

      // Analyze acceleration patterns
      const accelerationPattern = this.analyzeAccelerationPattern(behaviorData);

      // Analyze braking patterns
      const brakingPattern = this.analyzeBrakingPattern(behaviorData);

      // Analyze cornering patterns
      const corneringPattern = this.analyzeCorneringPattern(behaviorData);

      // Classify overall driving style
      const drivingStyle = this.patternClassifier.classifyDrivingStyle(behaviorData, this.behaviorHistory);

      // Calculate behavioral indices
      const behavioralIndices = this.calculateBehavioralIndices(behaviorData);

      // Predict future behavior
      const predictedBehavior = this.behaviorPredictor.predictBehavior(behaviorData, this.behaviorHistory);

      // Calculate quality metrics
      const qualityMetrics = this.calculateQualityMetrics(behaviorData);

      const output: DrivingPatternOutput = {
        accelerationPattern,
        brakingPattern,
        corneringPattern,
        drivingStyle,
        aggressivenessIndex: behavioralIndices.aggressivenessIndex,
        smoothnessIndex: behavioralIndices.smoothnessIndex,
        speedVariability: behavioralIndices.speedVariability,
        anticipationLevel: behavioralIndices.anticipationLevel,
        adaptabilityIndex: behavioralIndices.adaptabilityIndex,
        predictedBehavior,
        analysisConfidence: qualityMetrics.analysisConfidence,
        dataQuality: qualityMetrics.dataQuality
      };

      // Update driver profile
      this.driverProfile.updateProfile(output);

      // Store result for history
      this.updatePatternHistory(output);

      return output;

    } catch (error) {
      console.error('Error in driving pattern analysis:', error);
      return this.generateFallbackOutput();
    }
  }

  /**
   * Analyze acceleration patterns from recent behavior
   */
  private analyzeAccelerationPattern(behaviorData: DrivingBehaviorData): number {
    const recentBehavior = this.behaviorHistory.slice(-20); // Last 20 data points
    recentBehavior.push(behaviorData);

    let aggressivenessScore = 0;
    let totalEvents = 0;

    for (const data of recentBehavior) {
      if (data.acceleratorPedalPosition > 0.1) { // Active acceleration
        totalEvents++;
        
        // Rate of acceleration change
        const accelRate = Math.abs(data.acceleration);
        if (accelRate > 3.0) aggressivenessScore += 1.0;      // Very aggressive
        else if (accelRate > 2.0) aggressivenessScore += 0.7; // Moderate
        else if (accelRate > 1.0) aggressivenessScore += 0.4; // Gentle
        
        // Pedal application rate
        const pedalRate = data.acceleratorPedalPosition;
        if (pedalRate > 0.8) aggressivenessScore += 0.5;      // Heavy throttle
        else if (pedalRate > 0.5) aggressivenessScore += 0.3; // Moderate throttle
      }
    }

    return totalEvents > 0 ? Math.min(1, aggressivenessScore / totalEvents) : 0.3;
  }

  /**
   * Analyze braking patterns from recent behavior
   */
  private analyzeBrakingPattern(behaviorData: DrivingBehaviorData): number {
    const recentBehavior = this.behaviorHistory.slice(-20);
    recentBehavior.push(behaviorData);

    let aggressivenessScore = 0;
    let totalEvents = 0;

    for (const data of recentBehavior) {
      if (data.brakePedalPosition > 0.1) { // Active braking
        totalEvents++;
        
        // Rate of deceleration
        const decelRate = Math.abs(data.deceleration);
        if (decelRate > 4.0) aggressivenessScore += 1.0;      // Emergency braking
        else if (decelRate > 2.5) aggressivenessScore += 0.8; // Hard braking
        else if (decelRate > 1.5) aggressivenessScore += 0.5; // Moderate braking
        else aggressivenessScore += 0.2;                      // Gentle braking
        
        // Brake pedal application
        const pedalRate = data.brakePedalPosition;
        if (pedalRate > 0.7) aggressivenessScore += 0.4;      // Hard brake
        else if (pedalRate > 0.4) aggressivenessScore += 0.2; // Moderate brake
      }
    }

    return totalEvents > 0 ? Math.min(1, aggressivenessScore / totalEvents) : 0.3;
  }

  /**
   * Analyze cornering patterns from recent behavior
   */
  private analyzeCorneringPattern(behaviorData: DrivingBehaviorData): number {
    const recentBehavior = this.behaviorHistory.slice(-15);
    recentBehavior.push(behaviorData);

    let aggressivenessScore = 0;
    let totalEvents = 0;

    for (const data of recentBehavior) {
      const steeringActivity = Math.abs(data.steeringAngle);
      const steeringRate = Math.abs(data.steeringRate);
      const lateralG = Math.abs(data.lateralAcceleration);

      if (steeringActivity > 10 || lateralG > 0.5) { // Active cornering
        totalEvents++;
        
        // Lateral acceleration analysis
        if (lateralG > 6.0) aggressivenessScore += 1.0;       // Very aggressive
        else if (lateralG > 4.0) aggressivenessScore += 0.8;  // Aggressive
        else if (lateralG > 2.0) aggressivenessScore += 0.5;  // Moderate
        else aggressivenessScore += 0.2;                      // Gentle
        
        // Steering rate analysis
        if (steeringRate > 100) aggressivenessScore += 0.3;   // Quick steering
        else if (steeringRate > 50) aggressivenessScore += 0.1; // Moderate steering
      }
    }

    return totalEvents > 0 ? Math.min(1, aggressivenessScore / totalEvents) : 0.3;
  }

  /**
   * Calculate various behavioral indices
   */
  private calculateBehavioralIndices(behaviorData: DrivingBehaviorData): {
    aggressivenessIndex: number;
    smoothnessIndex: number;
    speedVariability: number;
    anticipationLevel: number;
    adaptabilityIndex: number;
  } {
    const recentBehavior = this.behaviorHistory.slice(-30);
    recentBehavior.push(behaviorData);

    // Aggressiveness index (combination of all aggressive behaviors)
    const accelAggr = this.analyzeAccelerationPattern(behaviorData);
    const brakeAggr = this.analyzeBrakingPattern(behaviorData);
    const cornerAggr = this.analyzeCorneringPattern(behaviorData);
    const aggressivenessIndex = (accelAggr + brakeAggr + cornerAggr) / 3;

    // Smoothness index (inverse of jerk and sudden changes)
    const smoothnessIndex = this.calculateSmoothness(recentBehavior);

    // Speed variability (consistency of speed maintenance)
    const speedVariability = this.calculateSpeedVariability(recentBehavior);

    // Anticipation level (how well driver anticipates and prepares)
    const anticipationLevel = this.calculateAnticipationLevel(recentBehavior);

    // Adaptability index (how well driver adapts to changing conditions)
    const adaptabilityIndex = this.calculateAdaptabilityIndex(recentBehavior);

    return {
      aggressivenessIndex,
      smoothnessIndex,
      speedVariability,
      anticipationLevel,
      adaptabilityIndex
    };
  }

  /**
   * Calculate driving smoothness based on jerk and sudden changes
   */
  private calculateSmoothness(behaviorHistory: DrivingBehaviorData[]): number {
    if (behaviorHistory.length < 3) return 0.5;

    let totalJerk = 0;
    let suddenChanges = 0;

    for (let i = 2; i < behaviorHistory.length; i++) {
      const current = behaviorHistory[i];
      const previous = behaviorHistory[i-1];
      const beforePrevious = behaviorHistory[i-2];

      // Calculate jerk (rate of change of acceleration)
      const accelChange1 = current.acceleration - previous.acceleration;
      const accelChange2 = previous.acceleration - beforePrevious.acceleration;
      const jerk = Math.abs(accelChange1 - accelChange2);
      totalJerk += jerk;

      // Count sudden changes in inputs
      if (Math.abs(current.acceleratorPedalPosition - previous.acceleratorPedalPosition) > 0.3) {
        suddenChanges++;
      }
      if (Math.abs(current.brakePedalPosition - previous.brakePedalPosition) > 0.3) {
        suddenChanges++;
      }
      if (Math.abs(current.steeringAngle - previous.steeringAngle) > 20) {
        suddenChanges++;
      }
    }

    const avgJerk = totalJerk / (behaviorHistory.length - 2);
    const suddenChangeRate = suddenChanges / behaviorHistory.length;

    // Higher smoothness = lower jerk and fewer sudden changes
    const smoothness = 1 - Math.min(1, (avgJerk / 5 + suddenChangeRate) / 2);
    return Math.max(0, smoothness);
  }

  /**
   * Calculate speed variability (consistency of speed)
   */
  private calculateSpeedVariability(behaviorHistory: DrivingBehaviorData[]): number {
    if (behaviorHistory.length < 5) return 0.5;

    const speeds = behaviorHistory.map(data => data.vehicleSpeed);
    const meanSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
    
    if (meanSpeed < 5) return 0; // Very low speed, variability not meaningful

    const variance = speeds.reduce((sum, speed) => sum + Math.pow(speed - meanSpeed, 2), 0) / speeds.length;
    const coefficientOfVariation = Math.sqrt(variance) / meanSpeed;

    // Normalize to 0-1 scale (higher = more variable)
    return Math.min(1, coefficientOfVariation * 2);
  }

  /**
   * Calculate anticipation level based on proactive vs reactive behavior
   */
  private calculateAnticipationLevel(behaviorHistory: DrivingBehaviorData[]): number {
    if (behaviorHistory.length < 10) return 0.5;

    let anticipationScore = 0;
    let totalEvents = 0;

    for (let i = 5; i < behaviorHistory.length; i++) {
      const current = behaviorHistory[i];
      const lookAhead = behaviorHistory.slice(i-5, i);

      // Check for gradual vs sudden changes (anticipation vs reaction)
      const speedTrend = this.calculateTrend(lookAhead.map(d => d.vehicleSpeed));
      
      if (Math.abs(speedTrend) > 0.5) { // Significant speed change
        totalEvents++;
        
        // Check if braking/acceleration was gradual (anticipatory) or sudden (reactive)
        const accelChange = current.acceleration - lookAhead[0].acceleration;
        const gradualness = this.calculateGradualness(lookAhead.map(d => d.acceleration));
        
        if (gradualness > 0.7) anticipationScore += 1.0;      // Very anticipatory
        else if (gradualness > 0.4) anticipationScore += 0.6; // Somewhat anticipatory
        else anticipationScore += 0.2;                        // Reactive
      }
    }

    return totalEvents > 0 ? anticipationScore / totalEvents : 0.5;
  }

  /**
   * Calculate adaptability index based on response to changing conditions
   */
  private calculateAdaptabilityIndex(behaviorHistory: DrivingBehaviorData[]): number {
    if (behaviorHistory.length < 15) return 0.5;

    let adaptabilityScore = 0;
    let conditionChanges = 0;

    for (let i = 10; i < behaviorHistory.length; i++) {
      const current = behaviorHistory[i];
      const previous = behaviorHistory[i-5];

      // Detect condition changes
      const trafficChanged = current.trafficDensity !== previous.trafficDensity;
      const roadChanged = current.roadType !== previous.roadType;
      
      if (trafficChanged || roadChanged) {
        conditionChanges++;
        
        // Evaluate appropriateness of response
        const responseAppropriate = this.evaluateResponseAppropriateness(current, previous);
        adaptabilityScore += responseAppropriate;
      }
    }

    return conditionChanges > 0 ? adaptabilityScore / conditionChanges : 0.5;
  }

  /**
   * Calculate trend in a data series
   */
  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    return secondAvg - firstAvg;
  }

  /**
   * Calculate gradualness of changes in a data series
   */
  private calculateGradualness(data: number[]): number {
    if (data.length < 3) return 0.5;

    let totalChange = Math.abs(data[data.length - 1] - data[0]);
    if (totalChange === 0) return 1.0;

    let stepChanges = 0;
    for (let i = 1; i < data.length; i++) {
      stepChanges += Math.abs(data[i] - data[i-1]);
    }

    // If step changes are much larger than total change, it's not gradual
    const gradualness = totalChange / stepChanges;
    return Math.min(1, gradualness * 2);
  }

  /**
   * Evaluate if driver response is appropriate for condition change
   */
  private evaluateResponseAppropriateness(current: DrivingBehaviorData, previous: DrivingBehaviorData): number {
    let appropriateness = 0.5; // Base score

    // Traffic density changes
    if (current.trafficDensity === 'heavy' && previous.trafficDensity === 'light') {
      // Should reduce speed and increase following distance
      if (current.vehicleSpeed < previous.vehicleSpeed) appropriateness += 0.3;
      if (current.accelerationPattern < 0.5) appropriateness += 0.2;
    }

    // Road type changes
    if (current.roadType === 'city' && previous.roadType === 'highway') {
      // Should reduce speed and be more cautious
      if (current.vehicleSpeed < previous.vehicleSpeed) appropriateness += 0.3;
      if (current.aggressivenessIndex < 0.5) appropriateness += 0.2;
    }

    return Math.min(1, appropriateness);
  }

  /**
   * Calculate quality metrics for the analysis
   */
  private calculateQualityMetrics(behaviorData: DrivingBehaviorData): {
    analysisConfidence: number;
    dataQuality: number;
  } {
    // Check data completeness and validity
    let dataQuality = 1.0;

    // Check for invalid values
    if (behaviorData.vehicleSpeed < 0 || behaviorData.vehicleSpeed > 300) dataQuality -= 0.2;
    if (Math.abs(behaviorData.acceleration) > 10) dataQuality -= 0.1;
    if (Math.abs(behaviorData.lateralAcceleration) > 15) dataQuality -= 0.1;
    if (behaviorData.acceleratorPedalPosition < 0 || behaviorData.acceleratorPedalPosition > 1) dataQuality -= 0.1;
    if (behaviorData.brakePedalPosition < 0 || behaviorData.brakePedalPosition > 1) dataQuality -= 0.1;

    // Analysis confidence based on data history
    let analysisConfidence = 0.6; // Base confidence

    if (this.behaviorHistory.length > 20) analysisConfidence += 0.2;
    if (this.behaviorHistory.length > 50) analysisConfidence += 0.1;
    if (dataQuality > 0.9) analysisConfidence += 0.1;

    return {
      analysisConfidence: Math.max(0, Math.min(1, analysisConfidence)),
      dataQuality: Math.max(0, Math.min(1, dataQuality))
    };
  }

  /**
   * Update behavior data history
   */
  private updateBehaviorHistory(behaviorData: DrivingBehaviorData): void {
    this.behaviorHistory.push(behaviorData);
    
    // Keep only last 100 entries
    if (this.behaviorHistory.length > 100) {
      this.behaviorHistory.shift();
    }
  }

  /**
   * Update pattern analysis history
   */
  private updatePatternHistory(output: DrivingPatternOutput): void {
    this.patternHistory.push(output);
    
    // Keep only last 100 entries
    if (this.patternHistory.length > 100) {
      this.patternHistory.shift();
    }
  }

  /**
   * Generate fallback output in case of analysis failure
   */
  private generateFallbackOutput(): DrivingPatternOutput {
    return {
      accelerationPattern: 0.5,
      brakingPattern: 0.5,
      corneringPattern: 0.5,
      drivingStyle: 'normal',
      aggressivenessIndex: 0.5,
      smoothnessIndex: 0.5,
      speedVariability: 0.5,
      anticipationLevel: 0.5,
      adaptabilityIndex: 0.5,
      predictedBehavior: {
        nextAcceleration: 0,
        nextBraking: 0,
        nextSteering: 0,
        confidence: 0.1
      },
      analysisConfidence: 0.1,
      dataQuality: 0.1
    };
  }

  /**
   * Get analysis statistics and driver profile
   */
  public getAnalysisStatistics(): {
    totalAnalyses: number;
    averageAggressiveness: number;
    averageSmoothness: number;
    drivingStyleDistribution: Map<string, number>;
    driverProfileSummary: any;
  } {
    const styleDistribution = new Map<string, number>();
    let totalAggressiveness = 0;
    let totalSmoothness = 0;

    this.patternHistory.forEach(pattern => {
      // Style distribution
      const style = pattern.drivingStyle;
      styleDistribution.set(style, (styleDistribution.get(style) || 0) + 1);
      
      // Accumulate metrics
      totalAggressiveness += pattern.aggressivenessIndex;
      totalSmoothness += pattern.smoothnessIndex;
    });

    return {
      totalAnalyses: this.patternHistory.length,
      averageAggressiveness: this.patternHistory.length > 0 ? totalAggressiveness / this.patternHistory.length : 0,
      averageSmoothness: this.patternHistory.length > 0 ? totalSmoothness / this.patternHistory.length : 0,
      drivingStyleDistribution: styleDistribution,
      driverProfileSummary: this.driverProfile.getProfileSummary()
    };
  }
}

/**
 * Driver profile management for long-term pattern learning
 */
class DriverProfile {
  private profileData: Map<string, number> = new Map();

  public updateProfile(pattern: DrivingPatternOutput): void {
    // Update running averages
    this.updateRunningAverage('aggressiveness', pattern.aggressivenessIndex);
    this.updateRunningAverage('smoothness', pattern.smoothnessIndex);
    this.updateRunningAverage('anticipation', pattern.anticipationLevel);
    this.updateRunningAverage('adaptability', pattern.adaptabilityIndex);
  }

  private updateRunningAverage(key: string, newValue: number): void {
    const currentAvg = this.profileData.get(key) || 0.5;
    const alpha = 0.1; // Learning rate
    const newAvg = currentAvg * (1 - alpha) + newValue * alpha;
    this.profileData.set(key, newAvg);
  }

  public getProfileSummary(): any {
    return {
      aggressiveness: this.profileData.get('aggressiveness') || 0.5,
      smoothness: this.profileData.get('smoothness') || 0.5,
      anticipation: this.profileData.get('anticipation') || 0.5,
      adaptability: this.profileData.get('adaptability') || 0.5
    };
  }
}

/**
 * Pattern classifier for driving style recognition
 */
class PatternClassifier {
  public classifyDrivingStyle(
    current: DrivingBehaviorData, 
    history: DrivingBehaviorData[]
  ): 'eco' | 'normal' | 'sporty' | 'aggressive' | 'erratic' {
    
    // Calculate recent averages
    const recentData = history.slice(-20);
    recentData.push(current);
    
    const avgAcceleration = recentData.reduce((sum, d) => sum + Math.abs(d.acceleration), 0) / recentData.length;
    const avgLateralG = recentData.reduce((sum, d) => sum + Math.abs(d.lateralAcceleration), 0) / recentData.length;
    const avgSpeed = recentData.reduce((sum, d) => sum + d.vehicleSpeed, 0) / recentData.length;
    
    // Classification logic
    if (avgAcceleration > 3.0 && avgLateralG > 4.0) return 'aggressive';
    if (avgAcceleration > 2.0 && avgLateralG > 2.5 && avgSpeed > 80) return 'sporty';
    if (avgAcceleration < 1.0 && avgSpeed < 60) return 'eco';
    if (this.isErraticBehavior(recentData)) return 'erratic';
    
    return 'normal';
  }

  private isErraticBehavior(data: DrivingBehaviorData[]): boolean {
    // Check for inconsistent patterns
    const speedVariations = data.map((d, i) => 
      i > 0 ? Math.abs(d.vehicleSpeed - data[i-1].vehicleSpeed) : 0
    );
    const avgSpeedVariation = speedVariations.reduce((sum, v) => sum + v, 0) / speedVariations.length;
    
    return avgSpeedVariation > 10; // High speed variation indicates erratic behavior
  }
}

/**
 * Behavior predictor for anticipating future driving actions
 */
class BehaviorPredictor {
  public predictBehavior(
    current: DrivingBehaviorData,
    history: DrivingBehaviorData[]
  ): {
    nextAcceleration: number;
    nextBraking: number;
    nextSteering: number;
    confidence: number;
  } {
    
    if (history.length < 5) {
      return {
        nextAcceleration: 0,
        nextBraking: 0,
        nextSteering: 0,
        confidence: 0.1
      };
    }

    const recent = history.slice(-10);
    
    // Simple trend-based prediction
    const accelTrend = this.calculateTrend(recent.map(d => d.acceleration));
    const brakeTrend = this.calculateTrend(recent.map(d => d.brakePedalPosition));
    const steerTrend = this.calculateTrend(recent.map(d => d.steeringAngle));
    
    return {
      nextAcceleration: Math.max(-5, Math.min(5, current.acceleration + accelTrend)),
      nextBraking: Math.max(0, Math.min(1, current.brakePedalPosition + brakeTrend)),
      nextSteering: Math.max(-180, Math.min(180, current.steeringAngle + steerTrend)),
      confidence: Math.min(0.8, recent.length / 10)
    };
  }

  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;
    
    // Simple linear trend calculation
    const n = data.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, i) => sum + val * i, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope || 0;
  }
}