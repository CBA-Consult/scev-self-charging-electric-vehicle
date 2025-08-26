/**
 * Advanced Hydraulic Regenerative Suspension Controller Tests
 * 
 * Comprehensive tests for the advanced HRS control algorithms including
 * adaptive control, predictive control, and multi-objective optimization.
 */

import {
  HydraulicRegenerativeSuspensionController,
  createAdvancedHRSController,
  type SuspensionInputs,
  type SuspensionOutputs,
  type AdaptiveParameters,
  type PredictiveParameters,
  type OptimizationObjectives
} from '../index';

describe('Advanced Hydraulic Regenerative Suspension Controller', () => {
  let controller: HydraulicRegenerativeSuspensionController;
  let testInputs: SuspensionInputs;

  beforeEach(() => {
    controller = createAdvancedHRSController();
    testInputs = createTestSuspensionInputs();
  });

  describe('Basic Functionality', () => {
    test('should create controller with default parameters', () => {
      expect(controller).toBeInstanceOf(HydraulicRegenerativeSuspensionController);
    });

    test('should create controller with custom parameters', () => {
      const adaptiveParams: Partial<AdaptiveParameters> = {
        learningRate: 0.2,
        forgettingFactor: 0.9,
        adaptationThreshold: 0.1,
        performanceWindow: 100
      };

      const predictiveParams: Partial<PredictiveParameters> = {
        predictionHorizon: 5.0,
        confidenceThreshold: 0.9,
        updateFrequency: 20
      };

      const optimizationObjectives: Partial<OptimizationObjectives> = {
        comfortWeight: 0.4,
        energyWeight: 0.4,
        stabilityWeight: 0.15,
        efficiencyWeight: 0.05
      };

      const customController = createAdvancedHRSController(
        adaptiveParams,
        predictiveParams,
        optimizationObjectives
      );

      expect(customController).toBeInstanceOf(HydraulicRegenerativeSuspensionController);
      
      const params = customController.getAdaptiveParameters();
      expect(params.adaptiveParams.learningRate).toBe(0.2);
      expect(params.predictiveParams.predictionHorizon).toBe(5.0);
      expect(params.optimizationObjectives.comfortWeight).toBe(0.4);
    });

    test('should validate input parameters', () => {
      const invalidInputs = { ...testInputs, vehicleSpeed: -10 };
      expect(() => controller.calculateAdvancedOptimalControl(invalidInputs)).toThrow('Invalid vehicle speed');
    });
  });

  describe('Advanced Control Algorithm', () => {
    test('should calculate advanced optimal control', () => {
      const outputs = controller.calculateAdvancedOptimalControl(testInputs);
      
      expect(outputs).toBeDefined();
      expect(outputs.dampingCoefficient).toBeGreaterThan(0);
      expect(outputs.energyRecoveryRate).toBeGreaterThanOrEqual(0);
      expect(outputs.comfortIndex).toBeGreaterThanOrEqual(0);
      expect(outputs.comfortIndex).toBeLessThanOrEqual(1);
      expect(outputs.energyEfficiency).toBeGreaterThanOrEqual(0);
      expect(outputs.energyEfficiency).toBeLessThanOrEqual(1);
      expect(outputs.systemEfficiency).toBeGreaterThanOrEqual(0);
      expect(outputs.systemEfficiency).toBeLessThanOrEqual(1);
    });

    test('should adapt to different driving modes', () => {
      const ecoInputs = { ...testInputs, drivingMode: 'eco' as const };
      const sportInputs = { ...testInputs, drivingMode: 'sport' as const };
      
      const ecoOutputs = controller.calculateAdvancedOptimalControl(ecoInputs);
      const sportOutputs = controller.calculateAdvancedOptimalControl(sportInputs);
      
      // Sport mode should generally have firmer damping
      expect(sportOutputs.dampingCoefficient).toBeGreaterThan(ecoOutputs.dampingCoefficient);
    });

    test('should respond to road roughness changes', () => {
      const smoothInputs = { ...testInputs, roadRoughness: 0.1 };
      const roughInputs = { ...testInputs, roadRoughness: 0.9 };
      
      const smoothOutputs = controller.calculateAdvancedOptimalControl(smoothInputs);
      const roughOutputs = controller.calculateAdvancedOptimalControl(roughInputs);
      
      // Rough roads should generally increase energy recovery opportunities
      expect(roughOutputs.energyRecoveryRate).toBeGreaterThan(smoothOutputs.energyRecoveryRate);
    });

    test('should adjust for energy storage level', () => {
      const lowEnergyInputs = { ...testInputs, energyStorageLevel: 0.1 };
      const highEnergyInputs = { ...testInputs, energyStorageLevel: 0.9 };
      
      const lowEnergyOutputs = controller.calculateAdvancedOptimalControl(lowEnergyInputs);
      const highEnergyOutputs = controller.calculateAdvancedOptimalControl(highEnergyInputs);
      
      // Low energy storage should prioritize energy recovery
      expect(lowEnergyOutputs.energyRecoveryRate).toBeGreaterThan(highEnergyOutputs.energyRecoveryRate);
    });
  });

  describe('Adaptive Learning', () => {
    test('should update adaptive weights over time', () => {
      const initialParams = controller.getAdaptiveParameters();
      const initialWeights = new Map(initialParams.currentAdaptiveWeights);
      
      // Simulate multiple control cycles
      for (let i = 0; i < 20; i++) {
        const variedInputs = addInputVariation(testInputs, 0.1);
        controller.calculateAdvancedOptimalControl(variedInputs);
      }
      
      const updatedParams = controller.getAdaptiveParameters();
      const updatedWeights = updatedParams.currentAdaptiveWeights;
      
      // Check that some weights have changed
      let weightsChanged = false;
      for (const [ruleId, initialWeight] of initialWeights) {
        const updatedWeight = updatedWeights.get(ruleId);
        if (updatedWeight && Math.abs(updatedWeight - initialWeight) > 0.001) {
          weightsChanged = true;
          break;
        }
      }
      
      expect(weightsChanged).toBe(true);
    });

    test('should maintain weight bounds', () => {
      // Simulate many control cycles to test weight bounds
      for (let i = 0; i < 100; i++) {
        const variedInputs = addInputVariation(testInputs, 0.2);
        controller.calculateAdvancedOptimalControl(variedInputs);
      }
      
      const params = controller.getAdaptiveParameters();
      
      // All weights should be within bounds [0.1, 1.0]
      for (const weight of params.currentAdaptiveWeights.values()) {
        expect(weight).toBeGreaterThanOrEqual(0.1);
        expect(weight).toBeLessThanOrEqual(1.0);
      }
    });
  });

  describe('Predictive Control', () => {
    test('should build prediction history', () => {
      // Create a sequence of inputs with increasing roughness
      const roughnessSequence = [0.2, 0.3, 0.4, 0.5, 0.6];
      
      roughnessSequence.forEach(roughness => {
        const inputs = { ...testInputs, roadRoughness: roughness };
        controller.calculateAdvancedOptimalControl(inputs);
      });
      
      // The controller should have built internal history for predictions
      // This is tested indirectly through the control outputs
      const finalInputs = { ...testInputs, roadRoughness: 0.7 };
      const outputs = controller.calculateAdvancedOptimalControl(finalInputs);
      
      expect(outputs).toBeDefined();
      expect(outputs.dampingCoefficient).toBeGreaterThan(0);
    });

    test('should anticipate road condition changes', () => {
      // Build a trend of increasing roughness
      for (let i = 0; i < 10; i++) {
        const inputs = { ...testInputs, roadRoughness: 0.1 + (i * 0.05) };
        controller.calculateAdvancedOptimalControl(inputs);
      }
      
      // Test current response with trend consideration
      const currentInputs = { ...testInputs, roadRoughness: 0.6 };
      const outputs = controller.calculateAdvancedOptimalControl(currentInputs);
      
      // Should show anticipatory adjustments
      expect(outputs.dampingCoefficient).toBeGreaterThan(2000); // Should be prepared for rougher conditions
    });
  });

  describe('Multi-Objective Optimization', () => {
    test('should balance multiple objectives', () => {
      const outputs = controller.calculateAdvancedOptimalControl(testInputs);
      
      // All performance metrics should be reasonable
      expect(outputs.comfortIndex).toBeGreaterThan(0.3);
      expect(outputs.energyEfficiency).toBeGreaterThan(0.1);
      expect(outputs.systemEfficiency).toBeGreaterThan(0.3);
    });

    test('should respond to objective weight changes', () => {
      // Test comfort-prioritized configuration
      controller.updateOptimizationObjectives({
        comfortWeight: 0.7,
        energyWeight: 0.1,
        stabilityWeight: 0.1,
        efficiencyWeight: 0.1
      });
      
      const comfortOutputs = controller.calculateAdvancedOptimalControl(testInputs);
      
      // Test energy-prioritized configuration
      controller.updateOptimizationObjectives({
        comfortWeight: 0.1,
        energyWeight: 0.7,
        stabilityWeight: 0.1,
        efficiencyWeight: 0.1
      });
      
      const energyOutputs = controller.calculateAdvancedOptimalControl(testInputs);
      
      // Energy-prioritized should have higher energy recovery
      expect(energyOutputs.energyRecoveryRate).toBeGreaterThan(comfortOutputs.energyRecoveryRate);
    });

    test('should normalize objective weights', () => {
      // Set weights that don't sum to 1
      controller.updateOptimizationObjectives({
        comfortWeight: 2.0,
        energyWeight: 3.0,
        stabilityWeight: 1.0,
        efficiencyWeight: 4.0
      });
      
      const params = controller.getAdaptiveParameters();
      const objectives = params.optimizationObjectives;
      
      // Weights should be normalized to sum to 1
      const totalWeight = objectives.comfortWeight + objectives.energyWeight + 
                         objectives.stabilityWeight + objectives.efficiencyWeight;
      
      expect(totalWeight).toBeCloseTo(1.0, 5);
    });
  });

  describe('Safety and Constraints', () => {
    test('should apply safety constraints', () => {
      const extremeInputs = {
        ...testInputs,
        suspensionVelocity: 2.0, // Very high velocity
        roadRoughness: 1.0,      // Maximum roughness
        accelerationPattern: 1.0  // Maximum aggression
      };
      
      const outputs = controller.calculateAdvancedOptimalControl(extremeInputs);
      
      // Outputs should be within safe bounds
      expect(outputs.dampingCoefficient).toBeLessThanOrEqual(5000);
      expect(outputs.energyRecoveryRate).toBeLessThanOrEqual(1500);
      expect(outputs.valvePosition).toBeGreaterThanOrEqual(0);
      expect(outputs.valvePosition).toBeLessThanOrEqual(1);
    });

    test('should handle edge case inputs', () => {
      const edgeCaseInputs = {
        ...testInputs,
        vehicleSpeed: 0,
        suspensionVelocity: 0,
        roadRoughness: 0,
        energyStorageLevel: 1.0
      };
      
      expect(() => {
        const outputs = controller.calculateAdvancedOptimalControl(edgeCaseInputs);
        expect(outputs).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Performance Tracking', () => {
    test('should track system diagnostics', () => {
      // Generate some control history
      for (let i = 0; i < 10; i++) {
        const variedInputs = addInputVariation(testInputs, 0.1);
        controller.calculateAdvancedOptimalControl(variedInputs);
      }
      
      const diagnostics = controller.getSystemDiagnostics();
      
      expect(diagnostics.averageEfficiency).toBeGreaterThanOrEqual(0);
      expect(diagnostics.averageComfort).toBeGreaterThanOrEqual(0);
      expect(diagnostics.performanceTrend).toMatch(/improving|stable|declining/);
      expect(diagnostics.ruleUtilization.size).toBeGreaterThan(0);
    });

    test('should maintain performance history limits', () => {
      // Generate many control cycles
      for (let i = 0; i < 1200; i++) {
        const variedInputs = addInputVariation(testInputs, 0.1);
        controller.calculateAdvancedOptimalControl(variedInputs);
      }
      
      // History should be limited to prevent memory issues
      const diagnostics = controller.getSystemDiagnostics();
      expect(diagnostics.averageEfficiency).toBeDefined();
      expect(diagnostics.averageComfort).toBeDefined();
    });
  });

  describe('Integration with Analyzers', () => {
    test('should accept road condition and driving pattern data', () => {
      const roadConditionData = {
        surfaceType: 'asphalt',
        roughnessIndex: 0.3,
        qualityScore: 0.8
      };
      
      const drivingPatternData = {
        drivingStyle: 'moderate',
        aggressionLevel: 0.4,
        smoothnessIndex: 0.7
      };
      
      expect(() => {
        const outputs = controller.calculateAdvancedOptimalControl(
          testInputs,
          roadConditionData,
          drivingPatternData
        );
        expect(outputs).toBeDefined();
      }).not.toThrow();
    });
  });
});

/**
 * Helper function to create test suspension inputs
 */
function createTestSuspensionInputs(): SuspensionInputs {
  return {
    vehicleSpeed: 60,
    verticalAcceleration: 0.3,
    suspensionVelocity: 0.2,
    suspensionDisplacement: 0.02,
    roadRoughness: 0.4,
    roadGradient: 2,
    surfaceType: 'asphalt',
    accelerationPattern: 0.4,
    brakingPattern: 0.3,
    corneringPattern: 0.3,
    drivingMode: 'comfort',
    hydraulicPressure: 150,
    accumulatorPressure: 120,
    fluidTemperature: 65,
    energyStorageLevel: 0.6,
    ambientTemperature: 22,
    vehicleLoad: 1800
  };
}

/**
 * Helper function to add random variation to inputs
 */
function addInputVariation(baseInputs: SuspensionInputs, variationFactor: number): SuspensionInputs {
  const variation = () => 1 + (Math.random() - 0.5) * variationFactor;
  
  return {
    ...baseInputs,
    vehicleSpeed: Math.max(0, baseInputs.vehicleSpeed * variation()),
    verticalAcceleration: Math.max(0, baseInputs.verticalAcceleration * variation()),
    suspensionVelocity: baseInputs.suspensionVelocity * variation(),
    roadRoughness: Math.max(0, Math.min(1, baseInputs.roadRoughness * variation())),
    accelerationPattern: Math.max(0, Math.min(1, baseInputs.accelerationPattern * variation())),
    energyStorageLevel: Math.max(0, Math.min(1, baseInputs.energyStorageLevel * variation()))
  };
}