/**
 * Unit tests for Piezoelectric Harvester Controller
 */

import {
  PiezoelectricHarvesterController,
  createPiezoelectricHarvester,
  defaultCantileverDesign,
  createTestVibrationInputs,
  validateStructuralDesign,
  VibrationData,
  HarvesterInputs
} from '../PiezoelectricHarvesterController';

describe('PiezoelectricHarvesterController', () => {
  let harvester: PiezoelectricHarvesterController;
  let testVibrationData: VibrationData;
  let testInputs: HarvesterInputs;

  beforeEach(() => {
    harvester = createPiezoelectricHarvester('pzt-5h', defaultCantileverDesign);
    testVibrationData = createTestVibrationInputs();
    testInputs = {
      vibrationData: testVibrationData,
      loadResistance: 1000,
      operatingMode: 'continuous',
      environmentalConditions: {
        temperature: 25,
        pressure: 101325,
        corrosiveEnvironment: false
      }
    };
  });

  describe('Initialization', () => {
    test('should create harvester with valid parameters', () => {
      expect(harvester).toBeDefined();
      expect(harvester.getCurrentDesign()).toEqual(defaultCantileverDesign);
      expect(harvester.getMaterial().name).toBe('PZT-5H');
    });

    test('should throw error for invalid material', () => {
      expect(() => {
        createPiezoelectricHarvester('invalid-material', defaultCantileverDesign);
      }).toThrow();
    });

    test('should validate structural design', () => {
      expect(validateStructuralDesign(defaultCantileverDesign)).toBe(true);
      
      const invalidDesign = {
        ...defaultCantileverDesign,
        dimensions: { length: -1, width: 0.01, thickness: 0.0005 }
      };
      expect(validateStructuralDesign(invalidDesign)).toBe(false);
    });
  });

  describe('Energy Harvesting', () => {
    test('should process harvesting cycle successfully', () => {
      const results = harvester.processHarvestingCycle(testInputs);
      
      expect(results).toBeDefined();
      expect(results.electricalOutput.power).toBeGreaterThanOrEqual(0);
      expect(results.electricalOutput.voltage).toBeGreaterThanOrEqual(0);
      expect(results.electricalOutput.current).toBeGreaterThanOrEqual(0);
      expect(results.electricalOutput.efficiency).toBeGreaterThanOrEqual(0);
      expect(results.electricalOutput.efficiency).toBeLessThanOrEqual(100);
    });

    test('should calculate power output correctly', () => {
      const results = harvester.processHarvestingCycle(testInputs);
      const expectedPower = results.electricalOutput.voltage * results.electricalOutput.current;
      
      expect(Math.abs(results.electricalOutput.power - expectedPower)).toBeLessThan(1e-10);
    });

    test('should handle different vibration frequencies', () => {
      const lowFreqVibration = createTestVibrationInputs({
        frequency: { dominant: 10, harmonics: [20, 30] }
      });
      const highFreqVibration = createTestVibrationInputs({
        frequency: { dominant: 100, harmonics: [200, 300] }
      });

      const lowFreqInputs = { ...testInputs, vibrationData: lowFreqVibration };
      const highFreqInputs = { ...testInputs, vibrationData: highFreqVibration };

      const lowFreqResults = harvester.processHarvestingCycle(lowFreqInputs);
      const highFreqResults = harvester.processHarvestingCycle(highFreqInputs);

      expect(lowFreqResults.electricalOutput.power).toBeGreaterThanOrEqual(0);
      expect(highFreqResults.electricalOutput.power).toBeGreaterThanOrEqual(0);
    });

    test('should handle different load resistances', () => {
      const lowResistanceInputs = { ...testInputs, loadResistance: 100 };
      const highResistanceInputs = { ...testInputs, loadResistance: 10000 };

      const lowResResults = harvester.processHarvestingCycle(lowResistanceInputs);
      const highResResults = harvester.processHarvestingCycle(highResistanceInputs);

      expect(lowResResults.electricalOutput.current).toBeGreaterThan(highResResults.electricalOutput.current);
      expect(lowResResults.electricalOutput.voltage).toBeLessThan(highResResults.electricalOutput.voltage);
    });
  });

  describe('Mechanical Response', () => {
    test('should calculate mechanical response correctly', () => {
      const results = harvester.processHarvestingCycle(testInputs);
      
      expect(results.mechanicalResponse.deflection).toBeGreaterThanOrEqual(0);
      expect(results.mechanicalResponse.stress).toBeGreaterThanOrEqual(0);
      expect(results.mechanicalResponse.strain).toBeGreaterThanOrEqual(0);
      expect(results.mechanicalResponse.resonantFrequency).toBeGreaterThan(0);
    });

    test('should respect stress limits', () => {
      const highAccelerationVibration = createTestVibrationInputs({
        acceleration: { x: 50, y: 50, z: 50 }
      });
      const highAccelInputs = { ...testInputs, vibrationData: highAccelerationVibration };
      
      const results = harvester.processHarvestingCycle(highAccelInputs);
      const material = harvester.getMaterial();
      
      // Stress should not exceed material yield strength by too much
      expect(results.mechanicalResponse.stress).toBeLessThan(material.constants.yieldStrength * 2);
    });
  });

  describe('Structural Health', () => {
    test('should assess structural health correctly', () => {
      const results = harvester.processHarvestingCycle(testInputs);
      
      expect(results.structuralHealth.fatigueIndex).toBeGreaterThanOrEqual(0);
      expect(results.structuralHealth.fatigueIndex).toBeLessThanOrEqual(1);
      expect(results.structuralHealth.reliabilityScore).toBeGreaterThanOrEqual(0);
      expect(results.structuralHealth.reliabilityScore).toBeLessThanOrEqual(1);
      expect(results.structuralHealth.remainingLifeCycles).toBeGreaterThanOrEqual(0);
      expect(typeof results.structuralHealth.maintenanceRequired).toBe('boolean');
    });

    test('should indicate maintenance when stress is high', () => {
      const highStressVibration = createTestVibrationInputs({
        acceleration: { x: 100, y: 100, z: 100 },
        amplitude: 0.01 // 10mm amplitude
      });
      const highStressInputs = { ...testInputs, vibrationData: highStressVibration };
      
      const results = harvester.processHarvestingCycle(highStressInputs);
      
      // High stress should result in lower reliability and potential maintenance requirement
      expect(results.structuralHealth.reliabilityScore).toBeLessThan(0.9);
    });
  });

  describe('Optimization Status', () => {
    test('should evaluate optimization status', () => {
      const results = harvester.processHarvestingCycle(testInputs);
      
      expect(typeof results.optimizationStatus.isOptimal).toBe('boolean');
      expect(results.optimizationStatus.improvementPotential).toBeGreaterThanOrEqual(0);
      expect(results.optimizationStatus.improvementPotential).toBeLessThanOrEqual(100);
      expect(Array.isArray(results.optimizationStatus.recommendedAdjustments)).toBe(true);
    });

    test('should provide recommendations when performance is poor', () => {
      const poorPerformanceVibration = createTestVibrationInputs({
        frequency: { dominant: 1, harmonics: [] }, // Very low frequency
        amplitude: 0.0001 // Very small amplitude
      });
      const poorInputs = { ...testInputs, vibrationData: poorPerformanceVibration };
      
      const results = harvester.processHarvestingCycle(poorInputs);
      
      expect(results.optimizationStatus.improvementPotential).toBeGreaterThan(50);
      expect(results.optimizationStatus.recommendedAdjustments.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Tracking', () => {
    test('should track total energy harvested', () => {
      const initialEnergy = harvester.getTotalEnergyHarvested();
      
      harvester.processHarvestingCycle(testInputs);
      const energyAfterFirstCycle = harvester.getTotalEnergyHarvested();
      
      harvester.processHarvestingCycle(testInputs);
      const energyAfterSecondCycle = harvester.getTotalEnergyHarvested();
      
      expect(energyAfterFirstCycle).toBeGreaterThanOrEqual(initialEnergy);
      expect(energyAfterSecondCycle).toBeGreaterThanOrEqual(energyAfterFirstCycle);
    });

    test('should calculate average efficiency', () => {
      // Process multiple cycles
      for (let i = 0; i < 5; i++) {
        harvester.processHarvestingCycle(testInputs);
      }
      
      const averageEfficiency = harvester.getAverageEfficiency();
      expect(averageEfficiency).toBeGreaterThanOrEqual(0);
      expect(averageEfficiency).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid vibration data gracefully', () => {
      const invalidInputs = {
        ...testInputs,
        vibrationData: {
          ...testVibrationData,
          acceleration: { x: NaN, y: 0, z: 0 }
        }
      };
      
      const results = harvester.processHarvestingCycle(invalidInputs);
      
      // Should return failsafe outputs
      expect(results.electricalOutput.power).toBe(0);
      expect(results.electricalOutput.voltage).toBe(0);
      expect(results.electricalOutput.current).toBe(0);
    });

    test('should handle negative load resistance', () => {
      const invalidInputs = { ...testInputs, loadResistance: -1000 };
      
      const results = harvester.processHarvestingCycle(invalidInputs);
      
      // Should return failsafe outputs
      expect(results.electricalOutput.power).toBe(0);
    });

    test('should handle extreme environmental conditions', () => {
      const extremeInputs = {
        ...testInputs,
        environmentalConditions: {
          temperature: 500, // Extreme temperature
          pressure: 0,      // Vacuum
          corrosiveEnvironment: true
        }
      };
      
      const results = harvester.processHarvestingCycle(extremeInputs);
      
      // Should still provide some output but may indicate maintenance required
      expect(results).toBeDefined();
      expect(results.structuralHealth.maintenanceRequired).toBe(true);
    });
  });

  describe('Design Evaluation', () => {
    test('should evaluate multiple structural designs', () => {
      const designCandidates = [
        {
          ...defaultCantileverDesign,
          dimensions: { length: 0.04, width: 0.008, thickness: 0.0003 }
        },
        {
          ...defaultCantileverDesign,
          dimensions: { length: 0.06, width: 0.012, thickness: 0.0005 }
        },
        {
          ...defaultCantileverDesign,
          dimensions: { length: 0.05, width: 0.010, thickness: 0.0004 }
        }
      ];

      const evaluation = harvester.evaluateStructuralDesigns(designCandidates, testVibrationData);
      
      expect(evaluation.rankings).toHaveLength(3);
      expect(evaluation.recommendedDesign).toBeDefined();
      
      // Rankings should be sorted by score (highest first)
      for (let i = 0; i < evaluation.rankings.length - 1; i++) {
        expect(evaluation.rankings[i].score).toBeGreaterThanOrEqual(evaluation.rankings[i + 1].score);
      }
    });

    test('should recommend best design based on performance metrics', () => {
      const designCandidates = [
        {
          ...defaultCantileverDesign,
          dimensions: { length: 0.03, width: 0.005, thickness: 0.0002 } // Small design
        },
        {
          ...defaultCantileverDesign,
          dimensions: { length: 0.08, width: 0.015, thickness: 0.0008 } // Large design
        }
      ];

      const evaluation = harvester.evaluateStructuralDesigns(designCandidates, testVibrationData);
      
      expect(evaluation.recommendedDesign).toEqual(evaluation.rankings[0].design);
      expect(evaluation.rankings[0].score).toBeGreaterThan(0);
    });
  });

  describe('Optimization Integration', () => {
    test('should perform structural optimization', () => {
      const optimizationResult = harvester.optimizeStructuralDesign(
        testVibrationData,
        {
          maximizePowerOutput: 1.0,
          maximizeEfficiency: 0.8,
          minimizeStress: 0.6,
          maximizeReliability: 0.9
        }
      );
      
      expect(optimizationResult).toBeDefined();
      expect(typeof optimizationResult.success).toBe('boolean');
      expect(optimizationResult.improvementPercentage).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(optimizationResult.convergenceHistory)).toBe(true);
      expect(optimizationResult.iterations).toBeGreaterThan(0);
      expect(optimizationResult.computationTime).toBeGreaterThan(0);
    });

    test('should update design after successful optimization', () => {
      const originalDesign = harvester.getCurrentDesign();
      
      const optimizationResult = harvester.optimizeStructuralDesign(testVibrationData);
      
      if (optimizationResult.success) {
        const newDesign = harvester.getCurrentDesign();
        expect(newDesign).not.toEqual(originalDesign);
      }
    });
  });
});

describe('Utility Functions', () => {
  describe('validateStructuralDesign', () => {
    test('should validate correct design', () => {
      expect(validateStructuralDesign(defaultCantileverDesign)).toBe(true);
    });

    test('should reject design with negative dimensions', () => {
      const invalidDesign = {
        ...defaultCantileverDesign,
        dimensions: { length: -1, width: 0.01, thickness: 0.0005 }
      };
      expect(validateStructuralDesign(invalidDesign)).toBe(false);
    });

    test('should reject design with zero thickness', () => {
      const invalidDesign = {
        ...defaultCantileverDesign,
        dimensions: { length: 0.05, width: 0.01, thickness: 0 }
      };
      expect(validateStructuralDesign(invalidDesign)).toBe(false);
    });

    test('should reject design with zero piezoelectric layers', () => {
      const invalidDesign = {
        ...defaultCantileverDesign,
        layerConfiguration: {
          ...defaultCantileverDesign.layerConfiguration,
          piezoelectricLayers: 0
        }
      };
      expect(validateStructuralDesign(invalidDesign)).toBe(false);
    });
  });

  describe('createTestVibrationInputs', () => {
    test('should create valid test inputs', () => {
      const testInputs = createTestVibrationInputs();
      
      expect(testInputs.acceleration).toBeDefined();
      expect(testInputs.frequency).toBeDefined();
      expect(testInputs.amplitude).toBeGreaterThan(0);
      expect(testInputs.duration).toBeGreaterThan(0);
      expect(testInputs.samplingRate).toBeGreaterThan(0);
    });

    test('should allow overrides', () => {
      const customInputs = createTestVibrationInputs({
        amplitude: 0.005,
        temperatureAmbient: 50
      });
      
      expect(customInputs.amplitude).toBe(0.005);
      expect(customInputs.temperatureAmbient).toBe(50);
    });
  });
});

describe('Integration Tests', () => {
  test('should integrate with different materials', () => {
    const materials = ['pzt-5h', 'pzt-5a', 'pvdf', 'batio3'];
    
    materials.forEach(materialName => {
      const harvester = createPiezoelectricHarvester(materialName, defaultCantileverDesign);
      const testInputs: HarvesterInputs = {
        vibrationData: createTestVibrationInputs(),
        loadResistance: 1000,
        operatingMode: 'continuous',
        environmentalConditions: {
          temperature: 25,
          pressure: 101325,
          corrosiveEnvironment: false
        }
      };
      
      const results = harvester.processHarvestingCycle(testInputs);
      
      expect(results).toBeDefined();
      expect(results.electricalOutput.power).toBeGreaterThanOrEqual(0);
      expect(harvester.getMaterial().name.toLowerCase()).toContain(materialName.split('-')[0].toLowerCase());
    });
  });

  test('should handle temperature variations', () => {
    const harvester = createPiezoelectricHarvester('pzt-5h', defaultCantileverDesign);
    const temperatures = [-20, 0, 25, 50, 80];
    
    temperatures.forEach(temperature => {
      const testInputs: HarvesterInputs = {
        vibrationData: createTestVibrationInputs({ temperatureAmbient: temperature }),
        loadResistance: 1000,
        operatingMode: 'continuous',
        environmentalConditions: {
          temperature,
          pressure: 101325,
          corrosiveEnvironment: false
        }
      };
      
      const results = harvester.processHarvestingCycle(testInputs);
      
      expect(results).toBeDefined();
      expect(results.electricalOutput.power).toBeGreaterThanOrEqual(0);
    });
  });

  test('should maintain performance consistency across multiple cycles', () => {
    const harvester = createPiezoelectricHarvester('pzt-5h', defaultCantileverDesign);
    const testInputs: HarvesterInputs = {
      vibrationData: createTestVibrationInputs(),
      loadResistance: 1000,
      operatingMode: 'continuous',
      environmentalConditions: {
        temperature: 25,
        pressure: 101325,
        corrosiveEnvironment: false
      }
    };
    
    const results: number[] = [];
    
    // Run multiple cycles
    for (let i = 0; i < 10; i++) {
      const result = harvester.processHarvestingCycle(testInputs);
      results.push(result.electricalOutput.power);
    }
    
    // Check consistency (power should be similar across cycles with same inputs)
    const averagePower = results.reduce((sum, power) => sum + power, 0) / results.length;
    const variance = results.reduce((sum, power) => sum + Math.pow(power - averagePower, 2), 0) / results.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Standard deviation should be small relative to average (less than 10%)
    expect(standardDeviation / averagePower).toBeLessThan(0.1);
  });
});