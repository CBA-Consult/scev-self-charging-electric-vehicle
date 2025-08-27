/**
 * Advanced Hydraulic Regenerative Suspension (HRS) Control Example
 * 
 * This example demonstrates the advanced control algorithms for the HRS system,
 * including adaptive control, predictive control, and multi-objective optimization.
 */

import {
  HydraulicRegenerativeSuspensionController,
  RoadConditionAnalyzer,
  DrivingPatternAnalyzer,
  createAdvancedHRSController,
  createRoadConditionAnalyzer,
  createDrivingPatternAnalyzer,
  type SuspensionInputs,
  type SuspensionOutputs,
  type AdaptiveParameters,
  type PredictiveParameters,
  type OptimizationObjectives,
  type RoadSensorData,
  type DrivingBehaviorData
} from '../index';

/**
 * Example demonstrating advanced HRS control algorithms
 */
export class AdvancedHRSControlExample {
  private hrsController: HydraulicRegenerativeSuspensionController;
  private roadAnalyzer: RoadConditionAnalyzer;
  private drivingAnalyzer: DrivingPatternAnalyzer;

  constructor() {
    // Configure adaptive parameters for learning-based control
    const adaptiveParams: Partial<AdaptiveParameters> = {
      learningRate: 0.15,
      forgettingFactor: 0.92,
      adaptationThreshold: 0.03,
      performanceWindow: 75
    };

    // Configure predictive parameters for anticipatory control
    const predictiveParams: Partial<PredictiveParameters> = {
      predictionHorizon: 3.0,
      confidenceThreshold: 0.75,
      updateFrequency: 15
    };

    // Configure optimization objectives for multi-objective control
    const optimizationObjectives: Partial<OptimizationObjectives> = {
      comfortWeight: 0.35,
      energyWeight: 0.35,
      stabilityWeight: 0.20,
      efficiencyWeight: 0.10
    };

    // Create advanced HRS controller with enhanced algorithms
    this.hrsController = createAdvancedHRSController(
      adaptiveParams,
      predictiveParams,
      optimizationObjectives
    );

    // Create road condition and driving pattern analyzers
    this.roadAnalyzer = createRoadConditionAnalyzer();
    this.drivingAnalyzer = createDrivingPatternAnalyzer();
  }

  /**
   * Demonstrate basic advanced control functionality
   */
  public demonstrateBasicAdvancedControl(): void {
    console.log('=== Advanced HRS Control Demonstration ===\n');

    // Simulate various driving scenarios
    const scenarios = [
      {
        name: 'City Driving - Smooth Road',
        inputs: this.createCityDrivingInputs()
      },
      {
        name: 'Highway Driving - Moderate Roughness',
        inputs: this.createHighwayDrivingInputs()
      },
      {
        name: 'Off-Road Driving - Rough Terrain',
        inputs: this.createOffRoadDrivingInputs()
      },
      {
        name: 'Sport Driving - Aggressive Patterns',
        inputs: this.createSportDrivingInputs()
      },
      {
        name: 'Eco Driving - Energy Optimization',
        inputs: this.createEcoDrivingInputs()
      }
    ];

    scenarios.forEach(scenario => {
      console.log(`--- ${scenario.name} ---`);
      
      // Calculate control outputs using advanced algorithms
      const outputs = this.hrsController.calculateAdvancedOptimalControl(scenario.inputs);
      
      this.displayControlResults(scenario.inputs, outputs);
      console.log();
    });
  }

  /**
   * Demonstrate adaptive learning capabilities
   */
  public demonstrateAdaptiveLearning(): void {
    console.log('=== Adaptive Learning Demonstration ===\n');

    const baseInputs = this.createCityDrivingInputs();
    
    console.log('Initial Control Response:');
    let outputs = this.hrsController.calculateAdvancedOptimalControl(baseInputs);
    this.displayControlResults(baseInputs, outputs);

    // Simulate repeated driving with performance feedback
    console.log('\nSimulating 50 control cycles with learning...');
    for (let i = 0; i < 50; i++) {
      // Vary inputs slightly to simulate real driving
      const variedInputs = this.addInputVariation(baseInputs, 0.1);
      this.hrsController.calculateAdvancedOptimalControl(variedInputs);
    }

    console.log('\nControl Response After Learning:');
    outputs = this.hrsController.calculateAdvancedOptimalControl(baseInputs);
    this.displayControlResults(baseInputs, outputs);

    // Display adaptive parameters
    const adaptiveParams = this.hrsController.getAdaptiveParameters();
    console.log('\nAdaptive Weights (sample):');
    let count = 0;
    for (const [ruleId, weight] of adaptiveParams.currentAdaptiveWeights) {
      if (count < 5) {
        console.log(`  ${ruleId}: ${weight.toFixed(3)}`);
        count++;
      }
    }
  }

  /**
   * Demonstrate predictive control capabilities
   */
  public demonstratePredictiveControl(): void {
    console.log('=== Predictive Control Demonstration ===\n');

    // Simulate a sequence of road conditions to build prediction history
    const roadSequence = [
      { roughness: 0.2, description: 'Smooth city road' },
      { roughness: 0.3, description: 'Slightly rough road' },
      { roughness: 0.5, description: 'Moderate roughness' },
      { roughness: 0.7, description: 'Rough road ahead' },
      { roughness: 0.8, description: 'Very rough terrain' }
    ];

    console.log('Building road condition history for prediction...');
    roadSequence.forEach((road, index) => {
      const inputs = this.createCityDrivingInputs();
      inputs.roadRoughness = road.roughness;
      
      console.log(`Step ${index + 1}: ${road.description} (roughness: ${road.roughness})`);
      const outputs = this.hrsController.calculateAdvancedOptimalControl(inputs);
      
      if (index === roadSequence.length - 1) {
        console.log('Predictive adjustments applied:');
        console.log(`  Damping Coefficient: ${outputs.dampingCoefficient.toFixed(0)} N⋅s/m`);
        console.log(`  Energy Recovery: ${outputs.energyRecoveryRate.toFixed(0)} W`);
        console.log(`  System Efficiency: ${(outputs.systemEfficiency * 100).toFixed(1)}%`);
      }
    });
  }

  /**
   * Demonstrate multi-objective optimization
   */
  public demonstrateMultiObjectiveOptimization(): void {
    console.log('=== Multi-Objective Optimization Demonstration ===\n');

    const baseInputs = this.createHighwayDrivingInputs();

    // Test different optimization objectives
    const objectiveConfigs = [
      {
        name: 'Comfort Priority',
        objectives: { comfortWeight: 0.6, energyWeight: 0.2, stabilityWeight: 0.15, efficiencyWeight: 0.05 }
      },
      {
        name: 'Energy Priority',
        objectives: { comfortWeight: 0.2, energyWeight: 0.6, stabilityWeight: 0.15, efficiencyWeight: 0.05 }
      },
      {
        name: 'Stability Priority',
        objectives: { comfortWeight: 0.2, energyWeight: 0.2, stabilityWeight: 0.5, efficiencyWeight: 0.1 }
      },
      {
        name: 'Balanced',
        objectives: { comfortWeight: 0.25, energyWeight: 0.25, stabilityWeight: 0.25, efficiencyWeight: 0.25 }
      }
    ];

    objectiveConfigs.forEach(config => {
      console.log(`--- ${config.name} Configuration ---`);
      
      // Update optimization objectives
      this.hrsController.updateOptimizationObjectives(config.objectives);
      
      // Calculate optimized control
      const outputs = this.hrsController.calculateAdvancedOptimalControl(baseInputs);
      
      console.log(`Comfort Index: ${(outputs.comfortIndex * 100).toFixed(1)}%`);
      console.log(`Energy Efficiency: ${(outputs.energyEfficiency * 100).toFixed(1)}%`);
      console.log(`System Efficiency: ${(outputs.systemEfficiency * 100).toFixed(1)}%`);
      console.log(`Damping Mode: ${outputs.dampingMode}`);
      console.log();
    });
  }

  /**
   * Demonstrate integration with road condition and driving pattern analyzers
   */
  public demonstrateIntegratedAnalysis(): void {
    console.log('=== Integrated Analysis Demonstration ===\n');

    // Simulate road sensor data
    const roadSensorData: RoadSensorData = {
      accelerometerData: {
        vertical: [0.2, 0.3, 0.5, 0.4, 0.6, 0.3, 0.2],
        lateral: [0.1, 0.2, 0.1, 0.3, 0.2, 0.1, 0.1],
        longitudinal: [0.3, 0.4, 0.2, 0.5, 0.3, 0.2, 0.3]
      },
      suspensionData: {
        frontLeft: [0.02, 0.03, 0.05, 0.04, 0.06, 0.03, 0.02],
        frontRight: [0.02, 0.03, 0.04, 0.05, 0.05, 0.03, 0.02],
        rearLeft: [0.01, 0.02, 0.04, 0.03, 0.05, 0.02, 0.01],
        rearRight: [0.01, 0.02, 0.03, 0.04, 0.04, 0.02, 0.01]
      },
      vehicleSpeed: 80,
      timestamp: Date.now()
    };

    // Simulate driving behavior data
    const drivingBehaviorData: DrivingBehaviorData = {
      accelerationEvents: [
        { timestamp: Date.now() - 5000, intensity: 0.3, duration: 2.0 },
        { timestamp: Date.now() - 3000, intensity: 0.6, duration: 1.5 },
        { timestamp: Date.now() - 1000, intensity: 0.4, duration: 1.0 }
      ],
      brakingEvents: [
        { timestamp: Date.now() - 4000, intensity: 0.4, duration: 1.5 },
        { timestamp: Date.now() - 2000, intensity: 0.7, duration: 2.0 }
      ],
      corneringEvents: [
        { timestamp: Date.now() - 6000, intensity: 0.3, radius: 150, speed: 75 },
        { timestamp: Date.now() - 2500, intensity: 0.5, radius: 100, speed: 70 }
      ],
      currentSpeed: 80,
      averageSpeed: 75,
      speedVariability: 0.15,
      timestamp: Date.now()
    };

    // Analyze road conditions
    console.log('Road Condition Analysis:');
    const roadConditions = this.roadAnalyzer.analyzeRoadConditions(roadSensorData);
    console.log(`  Surface Type: ${roadConditions.surfaceType}`);
    console.log(`  Roughness: ${(roadConditions.roughnessIndex * 100).toFixed(1)}%`);
    console.log(`  Quality Score: ${(roadConditions.qualityScore * 100).toFixed(1)}%`);

    // Analyze driving patterns
    console.log('\nDriving Pattern Analysis:');
    const drivingPatterns = this.drivingAnalyzer.analyzeDrivingPattern(drivingBehaviorData);
    console.log(`  Driving Style: ${drivingPatterns.drivingStyle}`);
    console.log(`  Aggression Level: ${(drivingPatterns.aggressionLevel * 100).toFixed(1)}%`);
    console.log(`  Smoothness: ${(drivingPatterns.smoothnessIndex * 100).toFixed(1)}%`);

    // Create suspension inputs based on analysis
    const suspensionInputs: SuspensionInputs = {
      vehicleSpeed: roadSensorData.vehicleSpeed,
      verticalAcceleration: roadSensorData.accelerometerData.vertical[roadSensorData.accelerometerData.vertical.length - 1],
      suspensionVelocity: 0.3,
      suspensionDisplacement: 0.02,
      roadRoughness: roadConditions.roughnessIndex,
      roadGradient: roadConditions.gradient,
      surfaceType: roadConditions.surfaceType as any,
      accelerationPattern: drivingPatterns.aggressionLevel,
      brakingPattern: drivingPatterns.aggressionLevel * 0.8,
      corneringPattern: drivingPatterns.aggressionLevel * 0.9,
      drivingMode: drivingPatterns.drivingStyle === 'aggressive' ? 'sport' : 
                   drivingPatterns.drivingStyle === 'gentle' ? 'eco' : 'comfort',
      hydraulicPressure: 150,
      accumulatorPressure: 120,
      fluidTemperature: 65,
      energyStorageLevel: 0.6,
      ambientTemperature: 22,
      vehicleLoad: 1800
    };

    // Apply advanced control with integrated analysis
    console.log('\nAdvanced Control with Integrated Analysis:');
    const outputs = this.hrsController.calculateAdvancedOptimalControl(
      suspensionInputs,
      roadConditions,
      drivingPatterns
    );

    this.displayControlResults(suspensionInputs, outputs);
  }

  /**
   * Create city driving scenario inputs
   */
  private createCityDrivingInputs(): SuspensionInputs {
    return {
      vehicleSpeed: 45,
      verticalAcceleration: 0.2,
      suspensionVelocity: 0.1,
      suspensionDisplacement: 0.01,
      roadRoughness: 0.2,
      roadGradient: 1,
      surfaceType: 'asphalt',
      accelerationPattern: 0.3,
      brakingPattern: 0.4,
      corneringPattern: 0.3,
      drivingMode: 'comfort',
      hydraulicPressure: 140,
      accumulatorPressure: 110,
      fluidTemperature: 60,
      energyStorageLevel: 0.7,
      ambientTemperature: 20,
      vehicleLoad: 1600
    };
  }

  /**
   * Create highway driving scenario inputs
   */
  private createHighwayDrivingInputs(): SuspensionInputs {
    return {
      vehicleSpeed: 110,
      verticalAcceleration: 0.3,
      suspensionVelocity: 0.2,
      suspensionDisplacement: 0.02,
      roadRoughness: 0.4,
      roadGradient: 2,
      surfaceType: 'asphalt',
      accelerationPattern: 0.5,
      brakingPattern: 0.3,
      corneringPattern: 0.4,
      drivingMode: 'comfort',
      hydraulicPressure: 160,
      accumulatorPressure: 130,
      fluidTemperature: 70,
      energyStorageLevel: 0.5,
      ambientTemperature: 25,
      vehicleLoad: 1800
    };
  }

  /**
   * Create off-road driving scenario inputs
   */
  private createOffRoadDrivingInputs(): SuspensionInputs {
    return {
      vehicleSpeed: 30,
      verticalAcceleration: 0.8,
      suspensionVelocity: 0.4,
      suspensionDisplacement: 0.05,
      roadRoughness: 0.8,
      roadGradient: 8,
      surfaceType: 'dirt',
      accelerationPattern: 0.6,
      brakingPattern: 0.7,
      corneringPattern: 0.5,
      drivingMode: 'off-road',
      hydraulicPressure: 180,
      accumulatorPressure: 140,
      fluidTemperature: 75,
      energyStorageLevel: 0.3,
      ambientTemperature: 30,
      vehicleLoad: 2000
    };
  }

  /**
   * Create sport driving scenario inputs
   */
  private createSportDrivingInputs(): SuspensionInputs {
    return {
      vehicleSpeed: 90,
      verticalAcceleration: 0.5,
      suspensionVelocity: 0.3,
      suspensionDisplacement: 0.03,
      roadRoughness: 0.3,
      roadGradient: 3,
      surfaceType: 'asphalt',
      accelerationPattern: 0.8,
      brakingPattern: 0.8,
      corneringPattern: 0.9,
      drivingMode: 'sport',
      hydraulicPressure: 170,
      accumulatorPressure: 135,
      fluidTemperature: 80,
      energyStorageLevel: 0.4,
      ambientTemperature: 28,
      vehicleLoad: 1700
    };
  }

  /**
   * Create eco driving scenario inputs
   */
  private createEcoDrivingInputs(): SuspensionInputs {
    return {
      vehicleSpeed: 60,
      verticalAcceleration: 0.1,
      suspensionVelocity: 0.05,
      suspensionDisplacement: 0.005,
      roadRoughness: 0.25,
      roadGradient: 1,
      surfaceType: 'asphalt',
      accelerationPattern: 0.2,
      brakingPattern: 0.2,
      corneringPattern: 0.2,
      drivingMode: 'eco',
      hydraulicPressure: 130,
      accumulatorPressure: 100,
      fluidTemperature: 55,
      energyStorageLevel: 0.8,
      ambientTemperature: 18,
      vehicleLoad: 1500
    };
  }

  /**
   * Add random variation to inputs for simulation
   */
  private addInputVariation(baseInputs: SuspensionInputs, variationFactor: number): SuspensionInputs {
    const variation = () => 1 + (Math.random() - 0.5) * variationFactor;
    
    return {
      ...baseInputs,
      vehicleSpeed: baseInputs.vehicleSpeed * variation(),
      verticalAcceleration: Math.max(0, baseInputs.verticalAcceleration * variation()),
      suspensionVelocity: baseInputs.suspensionVelocity * variation(),
      roadRoughness: Math.max(0, Math.min(1, baseInputs.roadRoughness * variation())),
      accelerationPattern: Math.max(0, Math.min(1, baseInputs.accelerationPattern * variation())),
      energyStorageLevel: Math.max(0, Math.min(1, baseInputs.energyStorageLevel * variation()))
    };
  }

  /**
   * Display control results in a formatted way
   */
  private displayControlResults(inputs: SuspensionInputs, outputs: SuspensionOutputs): void {
    console.log('Input Conditions:');
    console.log(`  Speed: ${inputs.vehicleSpeed} km/h, Road Roughness: ${(inputs.roadRoughness * 100).toFixed(0)}%`);
    console.log(`  Driving Mode: ${inputs.drivingMode}, Acceleration Pattern: ${(inputs.accelerationPattern * 100).toFixed(0)}%`);
    
    console.log('Control Outputs:');
    console.log(`  Damping: ${outputs.dampingCoefficient.toFixed(0)} N⋅s/m (${outputs.dampingMode})`);
    console.log(`  Energy Recovery: ${outputs.energyRecoveryRate.toFixed(0)} W`);
    console.log(`  Valve Position: ${(outputs.valvePosition * 100).toFixed(0)}%`);
    console.log(`  Pump Speed: ${outputs.pumpSpeed.toFixed(0)} RPM`);
    
    console.log('Performance Metrics:');
    console.log(`  Comfort: ${(outputs.comfortIndex * 100).toFixed(1)}%`);
    console.log(`  Energy Efficiency: ${(outputs.energyEfficiency * 100).toFixed(1)}%`);
    console.log(`  System Efficiency: ${(outputs.systemEfficiency * 100).toFixed(1)}%`);
  }

  /**
   * Run all demonstrations
   */
  public runAllDemonstrations(): void {
    this.demonstrateBasicAdvancedControl();
    console.log('\n' + '='.repeat(60) + '\n');
    
    this.demonstrateAdaptiveLearning();
    console.log('\n' + '='.repeat(60) + '\n');
    
    this.demonstratePredictiveControl();
    console.log('\n' + '='.repeat(60) + '\n');
    
    this.demonstrateMultiObjectiveOptimization();
    console.log('\n' + '='.repeat(60) + '\n');
    
    this.demonstrateIntegratedAnalysis();
    
    console.log('\n=== Advanced HRS Control Demonstration Complete ===');
  }
}

// Example usage
if (require.main === module) {
  const example = new AdvancedHRSControlExample();
  example.runAllDemonstrations();
}