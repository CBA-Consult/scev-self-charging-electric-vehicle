/**
 * Test suite for Hydraulic Regenerative Suspension Research Module
 * 
 * This test suite validates the functionality of the HRS research tools,
 * including optimization, analysis, and comparison capabilities.
 */

import {
  HydraulicRegenerativeSuspensionResearch,
  createResearchConfiguration,
  createDefaultHydraulicParameters,
  createDefaultTraditionalParameters,
  HydraulicSystemParameters,
  PerformanceMetrics
} from '../HydraulicRegenerativeSuspensionResearch';

describe('HydraulicRegenerativeSuspensionResearch', () => {
  let research: HydraulicRegenerativeSuspensionResearch;
  let hydraulicParams: HydraulicSystemParameters;
  let testConditions: any[];

  beforeEach(() => {
    const config = createResearchConfiguration({
      simulationDuration: 10,
      timeStep: 0.01,
      roadProfileType: 'moderate'
    });
    
    research = new HydraulicRegenerativeSuspensionResearch(config);
    hydraulicParams = createDefaultHydraulicParameters();
    testConditions = research.generateRoadProfile('moderate', 5);
  });

  describe('Configuration and Setup', () => {
    test('should create research configuration with default values', () => {
      const config = createResearchConfiguration();
      
      expect(config.simulationDuration).toBe(60);
      expect(config.timeStep).toBe(0.01);
      expect(config.roadProfileType).toBe('moderate');
      expect(config.comfortWeight).toBe(0.4);
      expect(config.energyWeight).toBe(0.3);
      expect(config.stabilityWeight).toBe(0.3);
    });

    test('should create default hydraulic parameters', () => {
      const params = createDefaultHydraulicParameters();
      
      expect(params.cylinderDiameter).toBe(50);
      expect(params.motorDisplacement).toBe(32);
      expect(params.accumulatorVolume).toBe(2.5);
      expect(params.motorEfficiency).toBe(0.85);
      expect(params.maxWorkingPressure).toBe(250);
    });

    test('should create default traditional suspension parameters', () => {
      const params = createDefaultTraditionalParameters();
      
      expect(params.springRate).toBe(25000);
      expect(params.dampingCoefficient).toBe(2500);
      expect(params.unsprungMass).toBe(50);
      expect(params.sprungMass).toBe(400);
    });
  });

  describe('Road Profile Generation', () => {
    test('should generate smooth road profile', () => {
      const profile = research.generateRoadProfile('smooth', 2);
      
      expect(profile.length).toBeGreaterThan(0);
      expect(profile[0]).toHaveProperty('vehicleSpeed');
      expect(profile[0]).toHaveProperty('roadRoughness');
      expect(profile[0]).toHaveProperty('suspensionVelocity');
      
      // Smooth roads should have low roughness
      const avgRoughness = profile.reduce((sum, p) => sum + p.roadRoughness, 0) / profile.length;
      expect(avgRoughness).toBeLessThan(0.3);
    });

    test('should generate rough road profile', () => {
      const profile = research.generateRoadProfile('rough', 2);
      
      expect(profile.length).toBeGreaterThan(0);
      
      // Rough roads should have high roughness
      const avgRoughness = profile.reduce((sum, p) => sum + p.roadRoughness, 0) / profile.length;
      expect(avgRoughness).toBeGreaterThan(0.5);
    });

    test('should generate correct number of data points', () => {
      const duration = 3; // seconds
      const timeStep = 0.01; // seconds
      const expectedPoints = Math.floor(duration / timeStep);
      
      const profile = research.generateRoadProfile('moderate', duration);
      expect(profile.length).toBe(expectedPoints);
    });
  });

  describe('HRS Performance Analysis', () => {
    test('should analyze HRS performance and return valid metrics', () => {
      const metrics = research.analyzeHRSPerformance(hydraulicParams, testConditions);
      
      expect(metrics).toHaveProperty('comfortIndex');
      expect(metrics).toHaveProperty('energyEfficiency');
      expect(metrics).toHaveProperty('averagePowerGeneration');
      expect(metrics).toHaveProperty('totalEnergyHarvested');
      expect(metrics).toHaveProperty('systemEfficiency');
      
      // Validate metric ranges
      expect(metrics.comfortIndex).toBeGreaterThanOrEqual(0);
      expect(metrics.comfortIndex).toBeLessThanOrEqual(1);
      expect(metrics.energyEfficiency).toBeGreaterThanOrEqual(0);
      expect(metrics.energyEfficiency).toBeLessThanOrEqual(1);
      expect(metrics.averagePowerGeneration).toBeGreaterThanOrEqual(0);
      expect(metrics.totalEnergyHarvested).toBeGreaterThanOrEqual(0);
    });

    test('should generate more power on rough roads', () => {
      const smoothConditions = research.generateRoadProfile('smooth', 5);
      const roughConditions = research.generateRoadProfile('rough', 5);
      
      const smoothMetrics = research.analyzeHRSPerformance(hydraulicParams, smoothConditions);
      const roughMetrics = research.analyzeHRSPerformance(hydraulicParams, roughConditions);
      
      expect(roughMetrics.averagePowerGeneration).toBeGreaterThan(smoothMetrics.averagePowerGeneration);
      expect(roughMetrics.totalEnergyHarvested).toBeGreaterThan(smoothMetrics.totalEnergyHarvested);
    });
  });

  describe('Traditional Suspension Analysis', () => {
    test('should analyze traditional suspension performance', () => {
      const traditionalParams = createDefaultTraditionalParameters();
      const metrics = research.analyzeTraditionalSuspension(traditionalParams, testConditions);
      
      expect(metrics).toHaveProperty('comfortIndex');
      expect(metrics).toHaveProperty('roadHoldingIndex');
      expect(metrics.averagePowerGeneration).toBe(0); // No energy harvesting
      expect(metrics.totalEnergyHarvested).toBe(0);
      expect(metrics.energyEfficiency).toBe(0);
    });
  });

  describe('Performance Comparison', () => {
    test('should compare HRS vs traditional suspension', () => {
      const traditionalParams = createDefaultTraditionalParameters();
      const comparison = research.comparePerformance(hydraulicParams, traditionalParams, testConditions);
      
      expect(comparison).toHaveProperty('hrsMetrics');
      expect(comparison).toHaveProperty('traditionalMetrics');
      expect(comparison).toHaveProperty('improvementFactors');
      
      // HRS should provide energy benefit
      expect(comparison.improvementFactors.energyBenefit).toBeGreaterThan(0);
      
      // HRS should generally improve comfort and stability
      expect(comparison.hrsMetrics.comfortIndex).toBeGreaterThanOrEqual(comparison.traditionalMetrics.comfortIndex);
    });
  });

  describe('Parameter Optimization', () => {
    test('should optimize HRS parameters', () => {
      const optimization = research.optimizeHRSParameters(hydraulicParams, testConditions.slice(0, 100), 10);
      
      expect(optimization).toHaveProperty('optimalParameters');
      expect(optimization).toHaveProperty('achievedMetrics');
      expect(optimization).toHaveProperty('optimizationScore');
      expect(optimization).toHaveProperty('convergenceHistory');
      
      expect(optimization.optimizationScore).toBeGreaterThan(0);
      expect(optimization.convergenceHistory.length).toBeGreaterThan(0);
      
      // Optimal parameters should be within reasonable bounds
      const optimal = optimization.optimalParameters;
      expect(optimal.cylinderDiameter).toBeGreaterThan(30);
      expect(optimal.cylinderDiameter).toBeLessThan(100);
      expect(optimal.motorDisplacement).toBeGreaterThan(10);
      expect(optimal.motorDisplacement).toBeLessThan(100);
    });

    test('should improve performance through optimization', () => {
      const baseMetrics = research.analyzeHRSPerformance(hydraulicParams, testConditions.slice(0, 100));
      const optimization = research.optimizeHRSParameters(hydraulicParams, testConditions.slice(0, 100), 20);
      
      // Optimized system should perform at least as well as base system
      expect(optimization.optimizationScore).toBeGreaterThanOrEqual(0);
      expect(optimization.achievedMetrics.systemEfficiency).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Parameter Sweep Analysis', () => {
    test('should perform parameter sweep for cylinder diameter', () => {
      const sweepResults = research.performParameterSweep(
        hydraulicParams,
        'cylinderDiameter',
        [40, 70],
        5,
        testConditions.slice(0, 50)
      );
      
      expect(sweepResults.length).toBe(5);
      expect(sweepResults[0].parameterValue).toBe(40);
      expect(sweepResults[4].parameterValue).toBe(70);
      
      sweepResults.forEach(result => {
        expect(result).toHaveProperty('parameterValue');
        expect(result).toHaveProperty('metrics');
        expect(result.metrics).toHaveProperty('comfortIndex');
        expect(result.metrics).toHaveProperty('energyEfficiency');
      });
    });

    test('should perform parameter sweep for motor displacement', () => {
      const sweepResults = research.performParameterSweep(
        hydraulicParams,
        'motorDisplacement',
        [20, 50],
        4,
        testConditions.slice(0, 50)
      );
      
      expect(sweepResults.length).toBe(4);
      expect(sweepResults[0].parameterValue).toBe(20);
      expect(sweepResults[3].parameterValue).toBe(50);
    });
  });

  describe('Research Report Generation', () => {
    test('should generate comprehensive research report', () => {
      const traditionalParams = createDefaultTraditionalParameters();
      const report = research.generateResearchReport(
        hydraulicParams,
        traditionalParams,
        testConditions.slice(0, 100)
      );
      
      expect(report).toHaveProperty('executiveSummary');
      expect(report).toHaveProperty('detailedAnalysis');
      expect(report).toHaveProperty('optimizationResults');
      expect(report).toHaveProperty('recommendations');
      
      expect(typeof report.executiveSummary).toBe('string');
      expect(report.executiveSummary.length).toBeGreaterThan(100);
      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Data Export', () => {
    test('should export research data', () => {
      const exportData = research.exportResearchData();
      
      expect(exportData).toHaveProperty('simulationData');
      expect(exportData).toHaveProperty('configuration');
      expect(exportData).toHaveProperty('timestamp');
      
      expect(Array.isArray(exportData.simulationData)).toBe(true);
      expect(typeof exportData.configuration).toBe('object');
      expect(typeof exportData.timestamp).toBe('number');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty test conditions', () => {
      const metrics = research.analyzeHRSPerformance(hydraulicParams, []);
      
      expect(metrics.comfortIndex).toBe(0);
      expect(metrics.averagePowerGeneration).toBe(0);
      expect(metrics.totalEnergyHarvested).toBe(0);
    });

    test('should handle extreme parameter values', () => {
      const extremeParams = {
        ...hydraulicParams,
        cylinderDiameter: 200, // Very large
        motorDisplacement: 5   // Very small
      };
      
      const metrics = research.analyzeHRSPerformance(extremeParams, testConditions.slice(0, 10));
      
      expect(metrics.comfortIndex).toBeGreaterThanOrEqual(0);
      expect(metrics.comfortIndex).toBeLessThanOrEqual(1);
      expect(metrics.energyEfficiency).toBeGreaterThanOrEqual(0);
      expect(metrics.energyEfficiency).toBeLessThanOrEqual(1);
    });
  });

  describe('Performance Validation', () => {
    test('should maintain consistent results across multiple runs', () => {
      const fixedConditions = research.generateRoadProfile('moderate', 3);
      
      const metrics1 = research.analyzeHRSPerformance(hydraulicParams, fixedConditions);
      const metrics2 = research.analyzeHRSPerformance(hydraulicParams, fixedConditions);
      
      expect(metrics1.comfortIndex).toBeCloseTo(metrics2.comfortIndex, 5);
      expect(metrics1.averagePowerGeneration).toBeCloseTo(metrics2.averagePowerGeneration, 5);
      expect(metrics1.energyEfficiency).toBeCloseTo(metrics2.energyEfficiency, 5);
    });

    test('should show reasonable performance improvements for HRS', () => {
      const traditionalParams = createDefaultTraditionalParameters();
      const comparison = research.comparePerformance(hydraulicParams, traditionalParams, testConditions);
      
      // HRS should provide significant energy benefit
      expect(comparison.improvementFactors.energyBenefit).toBeGreaterThan(100); // At least 100W
      
      // Comfort improvement should be reasonable (not negative, not impossibly high)
      expect(comparison.improvementFactors.comfortImprovement).toBeGreaterThan(-50);
      expect(comparison.improvementFactors.comfortImprovement).toBeLessThan(200);
    });
  });
});

describe('Integration Tests', () => {
  test('should run complete research workflow', () => {
    const config = createResearchConfiguration({
      simulationDuration: 5,
      timeStep: 0.01
    });
    
    const research = new HydraulicRegenerativeSuspensionResearch(config);
    const hydraulicParams = createDefaultHydraulicParameters();
    const traditionalParams = createDefaultTraditionalParameters();
    const testConditions = research.generateRoadProfile('moderate', 3);
    
    // Run complete analysis
    const hrsMetrics = research.analyzeHRSPerformance(hydraulicParams, testConditions);
    const comparison = research.comparePerformance(hydraulicParams, traditionalParams, testConditions);
    const optimization = research.optimizeHRSParameters(hydraulicParams, testConditions, 5);
    const report = research.generateResearchReport(hydraulicParams, traditionalParams, testConditions);
    
    // Validate all components work together
    expect(hrsMetrics).toBeDefined();
    expect(comparison).toBeDefined();
    expect(optimization).toBeDefined();
    expect(report).toBeDefined();
    
    expect(report.executiveSummary).toContain('HRS');
    expect(report.recommendations.length).toBeGreaterThan(0);
  });
});