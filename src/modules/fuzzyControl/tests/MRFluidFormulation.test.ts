/**
 * Test suite for MR Fluid Formulation System
 * 
 * Tests energy recovery efficiency, formulation optimization,
 * and performance validation for different MR fluid compositions.
 */

import { 
  MRFluidFormulation, 
  MRFluidComposition, 
  EnergyRecoveryMetrics,
  OptimizationParameters 
} from '../MRFluidFormulation';

describe('MRFluidFormulation', () => {
  let mrFluidSystem: MRFluidFormulation;

  beforeEach(() => {
    mrFluidSystem = new MRFluidFormulation();
  });

  describe('Standard Formulations', () => {
    test('should initialize with standard formulations', () => {
      const formulations = mrFluidSystem.getFormulations();
      expect(formulations.size).toBeGreaterThanOrEqual(4);
      
      // Check for expected standard formulations
      expect(formulations.has('HP-IC-001')).toBe(true);
      expect(formulations.has('TS-CF-002')).toBe(true);
      expect(formulations.has('FR-IO-003')).toBe(true);
      expect(formulations.has('EF-NZF-004')).toBe(true);
    });

    test('should have valid formulation properties', () => {
      const formulations = mrFluidSystem.getFormulations();
      
      for (const [id, formulation] of formulations) {
        expect(formulation.id).toBe(id);
        expect(formulation.name).toBeTruthy();
        expect(formulation.description).toBeTruthy();
        
        // Validate base fluid properties
        expect(formulation.baseFluid.viscosity).toBeGreaterThan(0);
        expect(formulation.baseFluid.density).toBeGreaterThan(0);
        expect(formulation.baseFluid.thermalConductivity).toBeGreaterThan(0);
        
        // Validate magnetic particles
        expect(formulation.magneticParticles.concentration).toBeGreaterThan(0);
        expect(formulation.magneticParticles.concentration).toBeLessThanOrEqual(0.6);
        expect(formulation.magneticParticles.averageSize).toBeGreaterThan(0);
        expect(formulation.magneticParticles.saturationMagnetization).toBeGreaterThan(0);
        
        // Validate performance characteristics
        expect(formulation.performance.yieldStress).toBeGreaterThanOrEqual(0);
        expect(formulation.performance.dynamicRange).toBeGreaterThan(1);
        expect(formulation.performance.responseTime).toBeGreaterThan(0);
        expect(formulation.performance.temperatureStability).toBeGreaterThan(0);
        expect(formulation.performance.sedimentationStability).toBeGreaterThan(0);
      }
    });
  });

  describe('Energy Recovery Efficiency Testing', () => {
    test('should calculate energy recovery efficiency for high-performance formulation', () => {
      const metrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
        'HP-IC-001',
        500000, // 500 kA/m magnetic field
        25,     // 25°C temperature
        100,    // 100 s⁻¹ shear rate
        10      // 10 Hz frequency
      );

      expect(metrics.formulation).toBe('HP-IC-001');
      expect(metrics.results.energyRecoveryEfficiency).toBeGreaterThan(70);
      expect(metrics.results.energyRecoveryEfficiency).toBeLessThanOrEqual(100);
      expect(metrics.results.powerDensity).toBeGreaterThan(0);
      expect(metrics.results.dampingCoefficient).toBeGreaterThan(0);
      expect(metrics.results.viscosityRatio).toBeGreaterThan(1);
    });

    test('should show temperature effects on performance', () => {
      const lowTempMetrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
        'HP-IC-001', 500000, 25, 100, 10
      );
      
      const highTempMetrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
        'HP-IC-001', 500000, 100, 100, 10
      );

      expect(lowTempMetrics.results.energyRecoveryEfficiency)
        .toBeGreaterThan(highTempMetrics.results.energyRecoveryEfficiency);
      
      expect(lowTempMetrics.results.thermalStability)
        .toBeGreaterThan(highTempMetrics.results.thermalStability);
    });

    test('should show magnetic field effects on performance', () => {
      const lowFieldMetrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
        'HP-IC-001', 100000, 25, 100, 10
      );
      
      const highFieldMetrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
        'HP-IC-001', 1000000, 25, 100, 10
      );

      expect(highFieldMetrics.results.energyRecoveryEfficiency)
        .toBeGreaterThan(lowFieldMetrics.results.energyRecoveryEfficiency);
      
      expect(highFieldMetrics.results.viscosityRatio)
        .toBeGreaterThan(lowFieldMetrics.results.viscosityRatio);
    });

    test('should show frequency effects on performance', () => {
      const lowFreqMetrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
        'FR-IO-003', 500000, 25, 100, 1
      );
      
      const highFreqMetrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
        'FR-IO-003', 500000, 25, 100, 100
      );

      // Fast-response formulation should handle high frequencies better
      expect(lowFreqMetrics.results.energyRecoveryEfficiency)
        .toBeGreaterThanOrEqual(highFreqMetrics.results.energyRecoveryEfficiency);
    });
  });

  describe('Formulation Comparison', () => {
    test('should compare different formulations under same conditions', () => {
      const testConditions = {
        magneticField: 500000,
        temperature: 25,
        shearRate: 100,
        frequency: 10
      };

      const highPerfMetrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
        'HP-IC-001', 
        testConditions.magneticField,
        testConditions.temperature,
        testConditions.shearRate,
        testConditions.frequency
      );

      const tempStableMetrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
        'TS-CF-002',
        testConditions.magneticField,
        testConditions.temperature,
        testConditions.shearRate,
        testConditions.frequency
      );

      const fastResponseMetrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
        'FR-IO-003',
        testConditions.magneticField,
        testConditions.temperature,
        testConditions.shearRate,
        testConditions.frequency
      );

      const ecoFriendlyMetrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
        'EF-NZF-004',
        testConditions.magneticField,
        testConditions.temperature,
        testConditions.shearRate,
        testConditions.frequency
      );

      // High-performance should have highest energy recovery
      expect(highPerfMetrics.results.energyRecoveryEfficiency)
        .toBeGreaterThanOrEqual(tempStableMetrics.results.energyRecoveryEfficiency);
      
      expect(highPerfMetrics.results.energyRecoveryEfficiency)
        .toBeGreaterThanOrEqual(fastResponseMetrics.results.energyRecoveryEfficiency);
      
      expect(highPerfMetrics.results.energyRecoveryEfficiency)
        .toBeGreaterThanOrEqual(ecoFriendlyMetrics.results.energyRecoveryEfficiency);

      // Store results for analysis
      expect(mrFluidSystem.getTestResults('HP-IC-001').length).toBeGreaterThan(0);
      expect(mrFluidSystem.getTestResults('TS-CF-002').length).toBeGreaterThan(0);
      expect(mrFluidSystem.getTestResults('FR-IO-003').length).toBeGreaterThan(0);
      expect(mrFluidSystem.getTestResults('EF-NZF-004').length).toBeGreaterThan(0);
    });
  });

  describe('Formulation Optimization', () => {
    test('should optimize for energy recovery priority', () => {
      const optimizationParams: OptimizationParameters = {
        targetApplication: 'regenerative_braking',
        operatingConditions: {
          temperatureRange: [0, 80],
          magneticFieldRange: [100000, 1000000],
          shearRateRange: [10, 1000],
          frequencyRange: [1, 50]
        },
        performanceWeights: {
          energyRecovery: 0.8,
          responseTime: 0.1,
          durability: 0.05,
          temperatureStability: 0.03,
          cost: 0.02
        }
      };

      const result = mrFluidSystem.optimizeFormulation(optimizationParams);
      
      expect(result.bestFormulation).toBeTruthy();
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(1);
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);

      // Should prefer high-performance formulation for energy recovery
      expect(result.bestFormulation).toBe('HP-IC-001');
    });

    test('should optimize for response time priority', () => {
      const optimizationParams: OptimizationParameters = {
        targetApplication: 'suspension_damping',
        operatingConditions: {
          temperatureRange: [20, 60],
          magneticFieldRange: [200000, 800000],
          shearRateRange: [50, 500],
          frequencyRange: [5, 100]
        },
        performanceWeights: {
          energyRecovery: 0.2,
          responseTime: 0.7,
          durability: 0.05,
          temperatureStability: 0.03,
          cost: 0.02
        }
      };

      const result = mrFluidSystem.optimizeFormulation(optimizationParams);
      
      expect(result.bestFormulation).toBeTruthy();
      expect(result.score).toBeGreaterThan(0);
      
      // Should prefer fast-response formulation
      expect(result.bestFormulation).toBe('FR-IO-003');
    });

    test('should optimize for high-temperature applications', () => {
      const optimizationParams: OptimizationParameters = {
        targetApplication: 'hybrid_system',
        operatingConditions: {
          temperatureRange: [50, 150],
          magneticFieldRange: [300000, 700000],
          shearRateRange: [20, 200],
          frequencyRange: [1, 20]
        },
        performanceWeights: {
          energyRecovery: 0.3,
          responseTime: 0.2,
          durability: 0.2,
          temperatureStability: 0.25,
          cost: 0.05
        }
      };

      const result = mrFluidSystem.optimizeFormulation(optimizationParams);
      
      expect(result.bestFormulation).toBeTruthy();
      expect(result.score).toBeGreaterThan(0);
      
      // Should prefer temperature-stable formulation
      expect(result.bestFormulation).toBe('TS-CF-002');
    });
  });

  describe('Custom Formulation Addition', () => {
    test('should add and validate custom formulation', () => {
      const customFormulation: MRFluidComposition = {
        id: 'CUSTOM-001',
        name: 'Custom Test Formulation',
        description: 'Test formulation for validation',
        
        baseFluid: {
          type: 'silicone',
          viscosity: 0.08,
          density: 950,
          thermalConductivity: 0.15
        },
        
        magneticParticles: {
          material: 'iron_carbonyl',
          concentration: 0.40,
          averageSize: 3.0,
          saturationMagnetization: 1.5e6
        },
        
        additives: {
          surfactant: {
            type: 'oleic_acid',
            concentration: 1.8
          },
          antioxidant: {
            type: 'BHT',
            concentration: 0.4
          },
          stabilizer: {
            type: 'fumed_silica',
            concentration: 0.8
          }
        },
        
        performance: {
          yieldStress: 75000,
          dynamicRange: 130,
          responseTime: 10,
          temperatureStability: 110,
          sedimentationStability: 1800
        }
      };

      mrFluidSystem.addFormulation(customFormulation);
      
      const formulations = mrFluidSystem.getFormulations();
      expect(formulations.has('CUSTOM-001')).toBe(true);
      
      const retrievedFormulation = formulations.get('CUSTOM-001');
      expect(retrievedFormulation).toEqual(customFormulation);
    });

    test('should reject invalid formulations', () => {
      const invalidFormulation: MRFluidComposition = {
        id: 'INVALID-001',
        name: 'Invalid Formulation',
        description: 'Invalid test formulation',
        
        baseFluid: {
          type: 'silicone',
          viscosity: -0.1, // Invalid negative viscosity
          density: 950,
          thermalConductivity: 0.15
        },
        
        magneticParticles: {
          material: 'iron_carbonyl',
          concentration: 0.8, // Invalid high concentration
          averageSize: 3.0,
          saturationMagnetization: 1.5e6
        },
        
        additives: {
          surfactant: { type: 'oleic_acid', concentration: 1.8 },
          antioxidant: { type: 'BHT', concentration: 0.4 },
          stabilizer: { type: 'fumed_silica', concentration: 0.8 }
        },
        
        performance: {
          yieldStress: -1000, // Invalid negative yield stress
          dynamicRange: 130,
          responseTime: 10,
          temperatureStability: 110,
          sedimentationStability: 1800
        }
      };

      expect(() => {
        mrFluidSystem.addFormulation(invalidFormulation);
      }).toThrow();
    });
  });

  describe('Performance Reporting', () => {
    test('should generate comprehensive performance report', () => {
      // Run multiple tests first
      const testConditions = [
        { field: 300000, temp: 25, shear: 50, freq: 5 },
        { field: 500000, temp: 50, shear: 100, freq: 10 },
        { field: 800000, temp: 75, shear: 200, freq: 20 }
      ];

      for (const condition of testConditions) {
        mrFluidSystem.calculateEnergyRecoveryEfficiency(
          'HP-IC-001',
          condition.field,
          condition.temp,
          condition.shear,
          condition.freq
        );
      }

      const report = mrFluidSystem.generatePerformanceReport('HP-IC-001');
      
      expect(report.formulation.id).toBe('HP-IC-001');
      expect(report.testResults.length).toBe(testConditions.length);
      expect(report.averagePerformance.energyRecoveryEfficiency).toBeGreaterThan(0);
      expect(report.averagePerformance.powerDensity).toBeGreaterThan(0);
      expect(report.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Optimization History', () => {
    test('should track optimization history', () => {
      const optimizationParams: OptimizationParameters = {
        targetApplication: 'regenerative_braking',
        operatingConditions: {
          temperatureRange: [0, 80],
          magneticFieldRange: [100000, 1000000],
          shearRateRange: [10, 1000],
          frequencyRange: [1, 50]
        },
        performanceWeights: {
          energyRecovery: 0.8,
          responseTime: 0.1,
          durability: 0.05,
          temperatureStability: 0.03,
          cost: 0.02
        }
      };

      mrFluidSystem.optimizeFormulation(optimizationParams);
      mrFluidSystem.optimizeFormulation(optimizationParams);
      
      const history = mrFluidSystem.getOptimizationHistory();
      expect(history.length).toBe(2);
      
      for (const entry of history) {
        expect(entry.timestamp).toBeInstanceOf(Date);
        expect(entry.parameters).toBeDefined();
        expect(entry.bestFormulation).toBeTruthy();
        expect(entry.score).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle extreme operating conditions', () => {
      // Test at very low magnetic field
      const lowFieldMetrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
        'HP-IC-001', 0, 25, 100, 10
      );
      expect(lowFieldMetrics.results.energyRecoveryEfficiency).toBeGreaterThan(0);
      
      // Test at very high temperature
      const highTempMetrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
        'HP-IC-001', 500000, 200, 100, 10
      );
      expect(highTempMetrics.results.energyRecoveryEfficiency).toBeGreaterThanOrEqual(0);
      
      // Test at very high frequency
      const highFreqMetrics = mrFluidSystem.calculateEnergyRecoveryEfficiency(
        'HP-IC-001', 500000, 25, 100, 1000
      );
      expect(highFreqMetrics.results.energyRecoveryEfficiency).toBeGreaterThanOrEqual(0);
    });

    test('should throw error for non-existent formulation', () => {
      expect(() => {
        mrFluidSystem.calculateEnergyRecoveryEfficiency(
          'NON-EXISTENT', 500000, 25, 100, 10
        );
      }).toThrow('Formulation NON-EXISTENT not found');
      
      expect(() => {
        mrFluidSystem.generatePerformanceReport('NON-EXISTENT');
      }).toThrow('Formulation NON-EXISTENT not found');
    });
  });
});