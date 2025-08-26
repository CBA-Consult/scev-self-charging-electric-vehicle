/**
 * Test suite for TEG Performance Testing Module
 */

import {
  TEGPerformanceTester,
  createTestTEGInputs,
  validateTEGParameters,
  TEGTestType,
  TestStatus,
  DataQuality,
  defaultTEGBenchmarks,
  TEGTestInputs,
  TEGTestOutputs
} from '../index';

describe('TEGPerformanceTester', () => {
  let tester: TEGPerformanceTester;

  beforeEach(() => {
    tester = new TEGPerformanceTester();
  });

  describe('Initialization', () => {
    test('should initialize with default benchmarks', () => {
      const benchmarks = tester.getBenchmarks();
      expect(benchmarks.electrical.minPowerOutput).toBe(50);
      expect(benchmarks.electrical.targetPowerOutput).toBe(200);
      expect(benchmarks.thermal.maxThermalResistance).toBe(0.5);
      expect(benchmarks.environmental.maxHumidity).toBe(95);
    });

    test('should initialize with custom benchmarks', () => {
      const customBenchmarks = {
        electrical: {
          minPowerOutput: 75,
          targetPowerOutput: 250,
          maxPowerOutput: 500,
          minEfficiency: 4,
          targetEfficiency: 8,
          maxResponseTime: 3
        }
      };

      const customTester = new TEGPerformanceTester(customBenchmarks);
      const benchmarks = customTester.getBenchmarks();
      
      expect(benchmarks.electrical.minPowerOutput).toBe(75);
      expect(benchmarks.electrical.targetPowerOutput).toBe(250);
      expect(benchmarks.electrical.maxResponseTime).toBe(3);
    });

    test('should start with empty test history', () => {
      expect(tester.getTestHistory()).toHaveLength(0);
      expect(tester.isRunning()).toBe(false);
      expect(tester.getCurrentTest()).toBeNull();
    });
  });

  describe('Input Validation', () => {
    test('should validate correct TEG parameters', () => {
      const validInputs = createTestTEGInputs();
      expect(validateTEGParameters(validInputs)).toBe(true);
    });

    test('should reject invalid temperature differential', () => {
      const invalidInputs = createTestTEGInputs({
        hotSideTemperature: 25,
        coldSideTemperature: 150
      });
      expect(validateTEGParameters(invalidInputs)).toBe(false);
    });

    test('should reject negative heat flux', () => {
      const invalidInputs = createTestTEGInputs({
        heatFlux: -5
      });
      expect(validateTEGParameters(invalidInputs)).toBe(false);
    });

    test('should reject zero or negative load resistance', () => {
      const invalidInputs = createTestTEGInputs({
        loadResistance: 0
      });
      expect(validateTEGParameters(invalidInputs)).toBe(false);
    });

    test('should throw error for invalid inputs in executeElectricalTest', async () => {
      const invalidInputs = createTestTEGInputs({
        hotSideTemperature: 25,
        coldSideTemperature: 150
      });

      await expect(tester.executeElectricalTest(invalidInputs))
        .rejects.toThrow('Hot side temperature must be greater than cold side temperature');
    });
  });

  describe('Electrical Performance Testing', () => {
    test('should execute basic electrical characterization', async () => {
      const inputs = createTestTEGInputs({
        hotSideTemperature: 150,
        coldSideTemperature: 25,
        heatFlux: 10,
        loadResistance: 2.0
      });

      const results = await tester.executeElectricalTest(inputs);

      expect(results.voltage).toBeGreaterThan(0);
      expect(results.current).toBeGreaterThan(0);
      expect(results.power).toBeGreaterThan(0);
      expect(results.efficiency).toBeGreaterThan(0);
      expect(results.resistance).toBeGreaterThan(0);
      expect(results.temperatureDifferential).toBe(125);
      expect(results.testStatus).toBeDefined();
      expect(results.dataQuality).toBeDefined();
      expect(results.timestamp).toBeInstanceOf(Date);
    });

    test('should calculate power correctly', async () => {
      const inputs = createTestTEGInputs({
        hotSideTemperature: 100,
        coldSideTemperature: 25,
        heatFlux: 8,
        loadResistance: 2.0
      });

      const results = await tester.executeElectricalTest(inputs);
      const expectedPower = results.voltage * results.current;
      
      expect(results.power).toBeCloseTo(expectedPower, 6);
    });

    test('should show power increase with temperature differential', async () => {
      const lowTempInputs = createTestTEGInputs({
        hotSideTemperature: 75,
        coldSideTemperature: 25,
        heatFlux: 10
      });

      const highTempInputs = createTestTEGInputs({
        hotSideTemperature: 175,
        coldSideTemperature: 25,
        heatFlux: 10
      });

      const lowTempResults = await tester.executeElectricalTest(lowTempInputs);
      const highTempResults = await tester.executeElectricalTest(highTempInputs);

      expect(highTempResults.power).toBeGreaterThan(lowTempResults.power);
      expect(highTempResults.voltage).toBeGreaterThan(lowTempResults.voltage);
    });

    test('should update test history', async () => {
      const inputs = createTestTEGInputs();
      
      expect(tester.getTestHistory()).toHaveLength(0);
      
      await tester.executeElectricalTest(inputs);
      expect(tester.getTestHistory()).toHaveLength(1);
      
      await tester.executeElectricalTest(inputs);
      expect(tester.getTestHistory()).toHaveLength(2);
    });

    test('should set running state during test execution', async () => {
      const inputs = createTestTEGInputs();
      
      expect(tester.isRunning()).toBe(false);
      
      const testPromise = tester.executeElectricalTest(inputs);
      // Note: In a real async scenario, we might check isRunning() here
      
      await testPromise;
      expect(tester.isRunning()).toBe(false);
    });
  });

  describe('Thermal Performance Testing', () => {
    test('should execute thermal performance test', async () => {
      const inputs = createTestTEGInputs({
        hotSideTemperature: 180,
        coldSideTemperature: 30,
        heatFlux: 15,
        testType: TEGTestType.THERMAL_PERFORMANCE
      });

      const results = await tester.executeThermalTest(inputs);

      expect(results.thermalResistance).toBeGreaterThan(0);
      expect(results.heatTransferCoefficient).toBeGreaterThan(0);
      expect(results.temperatureDifferential).toBe(150);
      expect(results.responseTime).toBeGreaterThan(0);
    });

    test('should calculate thermal resistance correctly', async () => {
      const inputs = createTestTEGInputs({
        hotSideTemperature: 200,
        coldSideTemperature: 50,
        heatFlux: 12
      });

      const results = await tester.executeThermalTest(inputs);
      const expectedThermalResistance = 150 / (12 * 4); // ΔT / (heatFlux * area)
      
      expect(results.thermalResistance).toBeCloseTo(expectedThermalResistance, 3);
    });
  });

  describe('Dynamic Response Testing', () => {
    test('should execute dynamic response test', async () => {
      const inputs = createTestTEGInputs({
        hotSideTemperature: 200,
        coldSideTemperature: 25,
        testType: TEGTestType.DYNAMIC_RESPONSE
      });

      const results = await tester.executeDynamicTest(inputs);

      expect(results).toHaveLength(11); // 0 to 10 steps inclusive
      expect(results[0].temperatureDifferential).toBe(0);
      expect(results[10].temperatureDifferential).toBe(175);
      
      // Power should generally increase with temperature differential
      expect(results[10].power).toBeGreaterThan(results[0].power);
    });

    test('should show monotonic power increase in dynamic test', async () => {
      const inputs = createTestTEGInputs({
        hotSideTemperature: 150,
        coldSideTemperature: 25
      });

      const results = await tester.executeDynamicTest(inputs);
      
      for (let i = 1; i < results.length; i++) {
        expect(results[i].power).toBeGreaterThanOrEqual(results[i-1].power);
      }
    });
  });

  describe('Environmental Stress Testing', () => {
    test('should execute environmental stress test', async () => {
      const inputs = createTestTEGInputs({
        humidity: 85,
        vibrationLevel: 10,
        testDuration: 24 * 3600, // 24 hours
        testType: TEGTestType.ENVIRONMENTAL_STRESS
      });

      const envData = await tester.executeEnvironmentalTest(inputs);

      expect(envData.temperatureCycles).toBe(24); // 1 cycle per hour
      expect(envData.humidityExposure).toBe(24);
      expect(envData.vibrationExposure).toBe(24);
      expect(envData.corrosionLevel).toBeGreaterThanOrEqual(0);
      expect(envData.corrosionLevel).toBeLessThanOrEqual(10);
      expect(typeof envData.sealingIntegrity).toBe('boolean');
    });

    test('should assess higher corrosion with high humidity', async () => {
      const lowHumidityInputs = createTestTEGInputs({
        humidity: 50,
        hotSideTemperature: 100
      });

      const highHumidityInputs = createTestTEGInputs({
        humidity: 95,
        hotSideTemperature: 100
      });

      const lowHumidityData = await tester.executeEnvironmentalTest(lowHumidityInputs);
      const highHumidityData = await tester.executeEnvironmentalTest(highHumidityInputs);

      expect(highHumidityData.corrosionLevel).toBeGreaterThan(lowHumidityData.corrosionLevel);
    });

    test('should fail sealing integrity under extreme conditions', async () => {
      const extremeInputs = createTestTEGInputs({
        pressure: 250, // High pressure
        vibrationLevel: 20, // High vibration
        humidity: 95 // High humidity
      });

      const envData = await tester.executeEnvironmentalTest(extremeInputs);
      expect(envData.sealingIntegrity).toBe(false);
    });
  });

  describe('Accelerated Life Testing', () => {
    test('should execute accelerated life test', async () => {
      const inputs = createTestTEGInputs({
        hotSideTemperature: 200,
        heatFlux: 20,
        testType: TEGTestType.ACCELERATED_LIFE
      });

      const reliabilityData = await tester.executeAcceleratedLifeTest(inputs);

      expect(reliabilityData.mtbf).toBeGreaterThan(0);
      expect(reliabilityData.failureRate).toBeGreaterThan(0);
      expect(reliabilityData.confidenceLevel).toBe(95);
      expect(reliabilityData.wearoutTime).toBeGreaterThan(reliabilityData.mtbf);
      expect(reliabilityData.degradationRate).toBeGreaterThan(0);
    });

    test('should show higher acceleration factor at higher temperatures', async () => {
      const normalTempInputs = createTestTEGInputs({
        hotSideTemperature: 150
      });

      const highTempInputs = createTestTEGInputs({
        hotSideTemperature: 250
      });

      const normalTempData = await tester.executeAcceleratedLifeTest(normalTempInputs);
      const highTempData = await tester.executeAcceleratedLifeTest(highTempInputs);

      // Higher temperature should result in lower MTBF (higher acceleration)
      expect(highTempData.mtbf).toBeLessThan(normalTempData.mtbf);
      expect(highTempData.failureRate).toBeGreaterThan(normalTempData.failureRate);
    });
  });

  describe('Performance Validation', () => {
    test('should pass validation for good performance', async () => {
      const inputs = createTestTEGInputs({
        hotSideTemperature: 200,
        coldSideTemperature: 25,
        heatFlux: 15,
        loadResistance: 1.5 // Optimized load
      });

      const results = await tester.executeElectricalTest(inputs);
      const validation = tester.validatePerformance(results);

      expect(validation.passed).toBe(true);
      expect(validation.failures).toHaveLength(0);
    });

    test('should fail validation for poor performance', async () => {
      const inputs = createTestTEGInputs({
        hotSideTemperature: 50, // Very low temperature differential
        coldSideTemperature: 25,
        heatFlux: 2, // Low heat flux
        loadResistance: 10 // Mismatched load
      });

      const results = await tester.executeElectricalTest(inputs);
      const validation = tester.validatePerformance(results);

      expect(validation.passed).toBe(false);
      expect(validation.failures.length).toBeGreaterThan(0);
    });

    test('should identify specific failure modes', async () => {
      // Create conditions that will fail power requirement
      const lowPowerInputs = createTestTEGInputs({
        hotSideTemperature: 40,
        coldSideTemperature: 25,
        heatFlux: 1
      });

      const results = await tester.executeElectricalTest(lowPowerInputs);
      const validation = tester.validatePerformance(results);

      expect(validation.failures.some(f => f.includes('Power output'))).toBe(true);
    });
  });

  describe('Test Reporting', () => {
    test('should generate empty report with no test history', () => {
      const report = tester.generateTestReport();
      
      expect(report.summary).toBeNull();
      expect(report.detailedResults).toHaveLength(0);
      expect(report.benchmarkComparison).toBeNull();
      expect(report.recommendations).toContain('No test data available for recommendations');
    });

    test('should generate comprehensive report with test data', async () => {
      // Execute multiple tests
      const inputs1 = createTestTEGInputs({ hotSideTemperature: 150 });
      const inputs2 = createTestTEGInputs({ hotSideTemperature: 180 });
      const inputs3 = createTestTEGInputs({ hotSideTemperature: 200 });

      await tester.executeElectricalTest(inputs1);
      await tester.executeElectricalTest(inputs2);
      await tester.executeElectricalTest(inputs3);

      const report = tester.generateTestReport();

      expect(report.summary).not.toBeNull();
      expect(report.summary.totalTests).toBe(3);
      expect(report.summary.averagePower).toBeGreaterThan(0);
      expect(report.summary.maxPower).toBeGreaterThan(0);
      expect(report.summary.passRate).toBeGreaterThanOrEqual(0);
      expect(report.summary.passRate).toBeLessThanOrEqual(100);

      expect(report.detailedResults).toHaveLength(3);
      expect(report.benchmarkComparison).not.toBeNull();
      expect(report.recommendations).toBeInstanceOf(Array);
    });

    test('should calculate correct test summary statistics', async () => {
      const inputs = createTestTEGInputs({
        hotSideTemperature: 150,
        coldSideTemperature: 25,
        heatFlux: 10
      });

      // Execute same test multiple times
      const results1 = await tester.executeElectricalTest(inputs);
      const results2 = await tester.executeElectricalTest(inputs);

      const report = tester.generateTestReport();
      
      expect(report.summary.totalTests).toBe(2);
      expect(report.summary.averagePower).toBeCloseTo((results1.power + results2.power) / 2, 6);
      expect(report.summary.maxPower).toBe(Math.max(results1.power, results2.power));
    });
  });

  describe('Data Quality Assessment', () => {
    test('should assess excellent data quality for optimal conditions', async () => {
      const inputs = createTestTEGInputs({
        samplingRate: 10, // High sampling rate
        testDuration: 7200, // Long duration
        vibrationLevel: 0 // No vibration
      });

      const results = await tester.executeElectricalTest(inputs);
      expect(results.dataQuality).toBe(DataQuality.EXCELLENT);
    });

    test('should assess poor data quality for suboptimal conditions', async () => {
      const inputs = createTestTEGInputs({
        samplingRate: 0.1, // Very low sampling rate
        testDuration: 60, // Short duration
        vibrationLevel: 25 // High vibration
      });

      const results = await tester.executeElectricalTest(inputs);
      expect([DataQuality.POOR, DataQuality.INVALID]).toContain(results.dataQuality);
    });
  });

  describe('Test Status Evaluation', () => {
    test('should return PASSED status for good performance', async () => {
      const inputs = createTestTEGInputs({
        hotSideTemperature: 200,
        coldSideTemperature: 25,
        heatFlux: 15
      });

      const results = await tester.executeElectricalTest(inputs);
      expect(results.testStatus).toBe(TestStatus.PASSED);
    });

    test('should return FAILED status for poor performance', async () => {
      const inputs = createTestTEGInputs({
        hotSideTemperature: 35, // Very low temperature differential
        coldSideTemperature: 25,
        heatFlux: 1 // Very low heat flux
      });

      const results = await tester.executeElectricalTest(inputs);
      expect(results.testStatus).toBe(TestStatus.FAILED);
    });
  });

  describe('Utility Functions', () => {
    test('createTestTEGInputs should create valid default inputs', () => {
      const inputs = createTestTEGInputs();
      
      expect(inputs.hotSideTemperature).toBe(150);
      expect(inputs.coldSideTemperature).toBe(25);
      expect(inputs.heatFlux).toBe(10);
      expect(inputs.loadResistance).toBe(2.0);
      expect(inputs.testType).toBe(TEGTestType.ELECTRICAL_CHARACTERIZATION);
      expect(validateTEGParameters(inputs)).toBe(true);
    });

    test('createTestTEGInputs should apply overrides correctly', () => {
      const overrides = {
        hotSideTemperature: 250,
        heatFlux: 20,
        testType: TEGTestType.THERMAL_PERFORMANCE
      };

      const inputs = createTestTEGInputs(overrides);
      
      expect(inputs.hotSideTemperature).toBe(250);
      expect(inputs.heatFlux).toBe(20);
      expect(inputs.testType).toBe(TEGTestType.THERMAL_PERFORMANCE);
      expect(inputs.coldSideTemperature).toBe(25); // Should keep default
    });

    test('defaultTEGBenchmarks should have all required properties', () => {
      expect(defaultTEGBenchmarks.electrical).toBeDefined();
      expect(defaultTEGBenchmarks.thermal).toBeDefined();
      expect(defaultTEGBenchmarks.mechanical).toBeDefined();
      expect(defaultTEGBenchmarks.environmental).toBeDefined();
      
      expect(defaultTEGBenchmarks.electrical.minPowerOutput).toBe(50);
      expect(defaultTEGBenchmarks.thermal.maxThermalResistance).toBe(0.5);
      expect(defaultTEGBenchmarks.mechanical.maxVibrationLevel).toBe(20);
      expect(defaultTEGBenchmarks.environmental.maxHumidity).toBe(95);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle extreme temperature conditions', async () => {
      const extremeInputs = createTestTEGInputs({
        hotSideTemperature: 300,
        coldSideTemperature: -20,
        heatFlux: 50
      });

      const results = await tester.executeElectricalTest(extremeInputs);
      
      expect(results.power).toBeGreaterThan(0);
      expect(results.efficiency).toBeGreaterThan(0);
      expect(results.temperatureDifferential).toBe(320);
    });

    test('should handle very small temperature differentials', async () => {
      const smallDiffInputs = createTestTEGInputs({
        hotSideTemperature: 26,
        coldSideTemperature: 25,
        heatFlux: 1
      });

      const results = await tester.executeElectricalTest(smallDiffInputs);
      
      expect(results.power).toBeGreaterThanOrEqual(0);
      expect(results.temperatureDifferential).toBe(1);
    });

    test('should handle zero vibration level', async () => {
      const inputs = createTestTEGInputs({
        vibrationLevel: 0
      });

      const envData = await tester.executeEnvironmentalTest(inputs);
      expect(envData.vibrationExposure).toBe(0);
    });
  });
});

describe('TEG Testing Integration', () => {
  test('should maintain consistent results across test types', async () => {
    const tester = new TEGPerformanceTester();
    const baseInputs = createTestTEGInputs({
      hotSideTemperature: 150,
      coldSideTemperature: 25,
      heatFlux: 10
    });

    // Execute electrical test
    const electricalResults = await tester.executeElectricalTest(baseInputs);
    
    // Execute thermal test with same conditions
    const thermalResults = await tester.executeThermalTest(baseInputs);

    // Core electrical parameters should be consistent
    expect(thermalResults.power).toBeCloseTo(electricalResults.power, 6);
    expect(thermalResults.voltage).toBeCloseTo(electricalResults.voltage, 6);
    expect(thermalResults.current).toBeCloseTo(electricalResults.current, 6);
    expect(thermalResults.temperatureDifferential).toBe(electricalResults.temperatureDifferential);
  });

  test('should provide realistic automotive performance metrics', async () => {
    const automotiveInputs = createTestTEGInputs({
      hotSideTemperature: 120, // Typical engine coolant temperature
      coldSideTemperature: 25,  // Ambient temperature
      heatFlux: 8,             // Realistic automotive heat flux
      loadResistance: 2.0      // Typical automotive electrical load
    });

    const results = await tester.executeElectricalTest(automotiveInputs);

    // Verify results are within realistic automotive ranges
    expect(results.power).toBeGreaterThan(10); // Minimum useful power
    expect(results.power).toBeLessThan(1000);  // Maximum realistic power
    expect(results.voltage).toBeGreaterThan(5); // Minimum useful voltage
    expect(results.voltage).toBeLessThan(100); // Maximum safe voltage
    expect(results.efficiency).toBeGreaterThan(1); // Minimum realistic efficiency
    expect(results.efficiency).toBeLessThan(15); // Maximum realistic efficiency
  });
});