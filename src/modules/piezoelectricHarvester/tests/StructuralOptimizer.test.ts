/**
 * Unit tests for Structural Optimizer
 */

import {
  StructuralOptimizer,
  StructuralDesign,
  OptimizationParameters,
  DesignConstraints,
  OptimizationResult
} from '../StructuralOptimizer';
import { MaterialProperties } from '../MaterialProperties';
import { createTestVibrationInputs } from '../PiezoelectricHarvesterController';

describe('StructuralOptimizer', () => {
  let optimizer: StructuralOptimizer;
  let materialProps: MaterialProperties;
  let testMaterial: any;
  let testDesign: StructuralDesign;
  let testVibrationData: any;

  beforeEach(() => {
    materialProps = new MaterialProperties();
    testMaterial = materialProps.getMaterial('pzt-5h');
    optimizer = new StructuralOptimizer(testMaterial);
    
    testDesign = {
      type: 'cantilever',
      dimensions: {
        length: 0.05,
        width: 0.01,
        thickness: 0.0005,
      },
      layerConfiguration: {
        piezoelectricLayers: 2,
        substrateThickness: 0.0002,
        electrodeThickness: 0.00001,
      },
      mountingConfiguration: {
        fixedEnd: 'base',
        freeEnd: 'tip',
        proofMass: 0.001,
      },
      resonantFrequency: 50,
    };
    
    testVibrationData = createTestVibrationInputs();
  });

  describe('Initialization', () => {
    test('should create optimizer with valid material', () => {
      expect(optimizer).toBeDefined();
      expect(optimizer.getConstraints()).toBeDefined();
      expect(optimizer.getOptimizationParameters()).toBeDefined();
    });

    test('should accept custom constraints', () => {
      const customConstraints: Partial<DesignConstraints> = {
        maxStress: 30e6,
        maxDimensions: { length: 0.1, width: 0.02, thickness: 0.001 }
      };
      
      const customOptimizer = new StructuralOptimizer(testMaterial, customConstraints);
      const constraints = customOptimizer.getConstraints();
      
      expect(constraints.maxStress).toBe(30e6);
      expect(constraints.maxDimensions.length).toBe(0.1);
    });
  });

  describe('Genetic Algorithm Optimization', () => {
    test('should perform genetic algorithm optimization', () => {
      optimizer.updateOptimizationParameters({
        algorithm: 'genetic',
        populationSize: 20,
        generations: 10,
        mutationRate: 0.1,
        crossoverRate: 0.8
      });

      const result = optimizer.optimize(testDesign, testVibrationData);
      
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(result.iterations).toBeGreaterThan(0);
      expect(result.computationTime).toBeGreaterThan(0);
      expect(Array.isArray(result.convergenceHistory)).toBe(true);
      expect(result.convergenceHistory.length).toBeGreaterThan(0);
    });

    test('should improve design performance', () => {
      optimizer.updateOptimizationParameters({
        algorithm: 'genetic',
        populationSize: 30,
        generations: 20
      });

      const result = optimizer.optimize(testDesign, testVibrationData, {
        maximizePowerOutput: 1.0,
        maximizeEfficiency: 0.8
      });
      
      if (result.success && result.optimizedDesign) {
        expect(result.improvementPercentage).toBeGreaterThanOrEqual(0);
        expect(result.optimizedDesign).toBeDefined();
        expect(result.optimizedDesign.dimensions).toBeDefined();
      }
    });

    test('should respect design constraints', () => {
      const strictConstraints: Partial<DesignConstraints> = {
        maxDimensions: { length: 0.06, width: 0.015, thickness: 0.0008 },
        maxStress: 40e6
      };
      
      optimizer.updateConstraints(strictConstraints);
      
      const result = optimizer.optimize(testDesign, testVibrationData);
      
      if (result.success && result.optimizedDesign) {
        expect(result.optimizedDesign.dimensions.length).toBeLessThanOrEqual(0.06);
        expect(result.optimizedDesign.dimensions.width).toBeLessThanOrEqual(0.015);
        expect(result.optimizedDesign.dimensions.thickness).toBeLessThanOrEqual(0.0008);
      }
    });

    test('should handle convergence', () => {
      optimizer.updateOptimizationParameters({
        algorithm: 'genetic',
        populationSize: 50,
        generations: 100,
        convergenceTolerance: 1e-4
      });

      const result = optimizer.optimize(testDesign, testVibrationData);
      
      expect(result.convergenceHistory.length).toBeGreaterThan(0);
      
      // Check if convergence was achieved
      if (result.convergenceHistory.length > 10) {
        const lastValues = result.convergenceHistory.slice(-5);
        const convergenceRange = Math.max(...lastValues) - Math.min(...lastValues);
        
        // If optimization converged early, range should be small
        if (result.iterations < 100) {
          expect(convergenceRange).toBeLessThan(0.1);
        }
      }
    });
  });

  describe('Particle Swarm Optimization', () => {
    test('should perform particle swarm optimization', () => {
      optimizer.updateOptimizationParameters({
        algorithm: 'particle_swarm',
        populationSize: 25,
        generations: 15
      });

      const result = optimizer.optimize(testDesign, testVibrationData);
      
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(result.iterations).toBeGreaterThan(0);
      expect(Array.isArray(result.convergenceHistory)).toBe(true);
    });

    test('should find reasonable solutions', () => {
      optimizer.updateOptimizationParameters({
        algorithm: 'particle_swarm',
        populationSize: 30,
        generations: 25
      });

      const result = optimizer.optimize(testDesign, testVibrationData);
      
      expect(result.finalObjectiveValue).toBeGreaterThanOrEqual(0);
      
      if (result.optimizedDesign) {
        expect(result.optimizedDesign.dimensions.length).toBeGreaterThan(0);
        expect(result.optimizedDesign.dimensions.width).toBeGreaterThan(0);
        expect(result.optimizedDesign.dimensions.thickness).toBeGreaterThan(0);
      }
    });
  });

  describe('Simulated Annealing', () => {
    test('should perform simulated annealing optimization', () => {
      optimizer.updateOptimizationParameters({
        algorithm: 'simulated_annealing',
        generations: 20,
        populationSize: 100 // Used as max iterations multiplier
      });

      const result = optimizer.optimize(testDesign, testVibrationData);
      
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(result.iterations).toBeGreaterThan(0);
    });

    test('should explore design space effectively', () => {
      optimizer.updateOptimizationParameters({
        algorithm: 'simulated_annealing',
        generations: 30,
        populationSize: 50
      });

      const result = optimizer.optimize(testDesign, testVibrationData);
      
      // Simulated annealing should explore and find improvements
      expect(result.convergenceHistory.length).toBeGreaterThan(10);
      
      if (result.optimizedDesign) {
        // Design should be different from initial (exploration occurred)
        const designChanged = 
          result.optimizedDesign.dimensions.length !== testDesign.dimensions.length ||
          result.optimizedDesign.dimensions.width !== testDesign.dimensions.width ||
          result.optimizedDesign.dimensions.thickness !== testDesign.dimensions.thickness;
        
        expect(designChanged).toBe(true);
      }
    });
  });

  describe('Gradient Descent', () => {
    test('should perform gradient descent optimization', () => {
      optimizer.updateOptimizationParameters({
        algorithm: 'gradient_descent',
        generations: 50
      });

      const result = optimizer.optimize(testDesign, testVibrationData);
      
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(result.iterations).toBeGreaterThan(0);
    });

    test('should show convergence behavior', () => {
      optimizer.updateOptimizationParameters({
        algorithm: 'gradient_descent',
        generations: 100
      });

      const result = optimizer.optimize(testDesign, testVibrationData);
      
      expect(result.convergenceHistory.length).toBeGreaterThan(0);
      
      // Gradient descent should show monotonic improvement or convergence
      if (result.convergenceHistory.length > 10) {
        const firstHalf = result.convergenceHistory.slice(0, Math.floor(result.convergenceHistory.length / 2));
        const secondHalf = result.convergenceHistory.slice(Math.floor(result.convergenceHistory.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
        
        // Should show improvement or stability
        expect(secondAvg).toBeGreaterThanOrEqual(firstAvg * 0.9);
      }
    });
  });

  describe('Multi-Objective Optimization', () => {
    test('should handle multiple objectives', () => {
      const objectives = {
        maximizePowerOutput: 1.0,
        maximizeEfficiency: 0.8,
        minimizeStress: 0.6,
        maximizeReliability: 0.9
      };

      const result = optimizer.optimize(testDesign, testVibrationData, objectives);
      
      expect(result).toBeDefined();
      expect(result.finalObjectiveValue).toBeGreaterThanOrEqual(0);
    });

    test('should prioritize objectives correctly', () => {
      // Test with power output priority
      const powerPriorityResult = optimizer.optimize(testDesign, testVibrationData, {
        maximizePowerOutput: 1.0,
        maximizeEfficiency: 0.1,
        minimizeStress: 0.1,
        maximizeReliability: 0.1
      });

      // Test with efficiency priority
      const efficiencyPriorityResult = optimizer.optimize(testDesign, testVibrationData, {
        maximizePowerOutput: 0.1,
        maximizeEfficiency: 1.0,
        minimizeStress: 0.1,
        maximizeReliability: 0.1
      });

      expect(powerPriorityResult).toBeDefined();
      expect(efficiencyPriorityResult).toBeDefined();
      
      // Results should be different due to different priorities
      if (powerPriorityResult.optimizedDesign && efficiencyPriorityResult.optimizedDesign) {
        const powerDesign = powerPriorityResult.optimizedDesign;
        const efficiencyDesign = efficiencyPriorityResult.optimizedDesign;
        
        const designsDifferent = 
          Math.abs(powerDesign.dimensions.length - efficiencyDesign.dimensions.length) > 1e-6 ||
          Math.abs(powerDesign.dimensions.width - efficiencyDesign.dimensions.width) > 1e-6 ||
          Math.abs(powerDesign.dimensions.thickness - efficiencyDesign.dimensions.thickness) > 1e-6;
        
        expect(designsDifferent).toBe(true);
      }
    });
  });

  describe('Constraint Handling', () => {
    test('should handle infeasible constraints', () => {
      const impossibleConstraints: Partial<DesignConstraints> = {
        maxDimensions: { length: 0.001, width: 0.001, thickness: 0.00001 }, // Too small
        maxStress: 1e3 // Too low stress limit
      };
      
      optimizer.updateConstraints(impossibleConstraints);
      
      const result = optimizer.optimize(testDesign, testVibrationData);
      
      // Should handle gracefully, either fail or find best possible solution
      expect(result).toBeDefined();
      expect(Array.isArray(result.constraintViolations)).toBe(true);
    });

    test('should report constraint violations', () => {
      const strictConstraints: Partial<DesignConstraints> = {
        maxDimensions: { length: 0.03, width: 0.005, thickness: 0.0002 }
      };
      
      optimizer.updateConstraints(strictConstraints);
      
      const result = optimizer.optimize(testDesign, testVibrationData);
      
      if (!result.success) {
        expect(result.constraintViolations.length).toBeGreaterThan(0);
        expect(result.constraintViolations[0]).toContain('exceeds maximum');
      }
    });

    test('should respect frequency constraints', () => {
      const frequencyConstraints: Partial<DesignConstraints> = {
        minResonantFreq: 40,
        maxResonantFreq: 60
      };
      
      optimizer.updateConstraints(frequencyConstraints);
      
      const result = optimizer.optimize(testDesign, testVibrationData);
      
      if (result.success && result.optimizedDesign) {
        expect(result.optimizedDesign.resonantFrequency).toBeGreaterThanOrEqual(40);
        expect(result.optimizedDesign.resonantFrequency).toBeLessThanOrEqual(60);
      }
    });
  });

  describe('Performance and Scalability', () => {
    test('should complete optimization within reasonable time', () => {
      const startTime = Date.now();
      
      optimizer.updateOptimizationParameters({
        algorithm: 'genetic',
        populationSize: 50,
        generations: 30
      });

      const result = optimizer.optimize(testDesign, testVibrationData);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(result.computationTime).toBeLessThan(executionTime + 100); // Allow some tolerance
      expect(result.computationTime).toBeGreaterThan(0);
      
      // Should complete within reasonable time (less than 30 seconds for this test)
      expect(executionTime).toBeLessThan(30000);
    });

    test('should handle different population sizes', () => {
      const populationSizes = [10, 25, 50];
      
      populationSizes.forEach(popSize => {
        optimizer.updateOptimizationParameters({
          algorithm: 'genetic',
          populationSize: popSize,
          generations: 10
        });

        const result = optimizer.optimize(testDesign, testVibrationData);
        
        expect(result).toBeDefined();
        expect(result.iterations).toBeGreaterThan(0);
      });
    });

    test('should scale with problem complexity', () => {
      // Simple optimization
      optimizer.updateOptimizationParameters({
        algorithm: 'genetic',
        populationSize: 20,
        generations: 10
      });
      
      const simpleResult = optimizer.optimize(testDesign, testVibrationData);
      
      // Complex optimization
      optimizer.updateOptimizationParameters({
        algorithm: 'genetic',
        populationSize: 100,
        generations: 50
      });
      
      const complexResult = optimizer.optimize(testDesign, testVibrationData);
      
      expect(simpleResult.computationTime).toBeLessThan(complexResult.computationTime);
      expect(complexResult.iterations).toBeGreaterThan(simpleResult.iterations);
    });
  });

  describe('Configuration Management', () => {
    test('should update optimization parameters', () => {
      const newParams: Partial<OptimizationParameters> = {
        algorithm: 'particle_swarm',
        populationSize: 75,
        generations: 40,
        mutationRate: 0.15
      };
      
      optimizer.updateOptimizationParameters(newParams);
      const updatedParams = optimizer.getOptimizationParameters();
      
      expect(updatedParams.algorithm).toBe('particle_swarm');
      expect(updatedParams.populationSize).toBe(75);
      expect(updatedParams.generations).toBe(40);
      expect(updatedParams.mutationRate).toBe(0.15);
    });

    test('should update constraints', () => {
      const newConstraints: Partial<DesignConstraints> = {
        maxStress: 35e6,
        maxDeflection: 0.003,
        minEfficiency: 0.15
      };
      
      optimizer.updateConstraints(newConstraints);
      const updatedConstraints = optimizer.getConstraints();
      
      expect(updatedConstraints.maxStress).toBe(35e6);
      expect(updatedConstraints.maxDeflection).toBe(0.003);
      expect(updatedConstraints.minEfficiency).toBe(0.15);
    });

    test('should preserve unmodified parameters', () => {
      const originalParams = optimizer.getOptimizationParameters();
      const originalConstraints = optimizer.getConstraints();
      
      optimizer.updateOptimizationParameters({ populationSize: 60 });
      optimizer.updateConstraints({ maxStress: 45e6 });
      
      const newParams = optimizer.getOptimizationParameters();
      const newConstraints = optimizer.getConstraints();
      
      // Modified parameters should change
      expect(newParams.populationSize).toBe(60);
      expect(newConstraints.maxStress).toBe(45e6);
      
      // Unmodified parameters should remain the same
      expect(newParams.algorithm).toBe(originalParams.algorithm);
      expect(newParams.mutationRate).toBe(originalParams.mutationRate);
      expect(newConstraints.maxDeflection).toBe(originalConstraints.maxDeflection);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid algorithm', () => {
      optimizer.updateOptimizationParameters({
        algorithm: 'invalid_algorithm' as any
      });

      const result = optimizer.optimize(testDesign, testVibrationData);
      
      expect(result.success).toBe(false);
      expect(result.constraintViolations.length).toBeGreaterThan(0);
      expect(result.constraintViolations[0]).toContain('Unknown optimization algorithm');
    });

    test('should handle invalid design parameters', () => {
      const invalidDesign = {
        ...testDesign,
        dimensions: { length: -1, width: 0, thickness: 0 }
      };

      const result = optimizer.optimize(invalidDesign, testVibrationData);
      
      // Should handle gracefully and either fix the design or report errors
      expect(result).toBeDefined();
    });

    test('should handle extreme vibration data', () => {
      const extremeVibration = {
        ...testVibrationData,
        acceleration: { x: 1000, y: 1000, z: 1000 },
        frequency: { dominant: 0.1, harmonics: [] }
      };

      const result = optimizer.optimize(testDesign, extremeVibration);
      
      expect(result).toBeDefined();
      // Should either succeed with appropriate design or fail gracefully
    });
  });

  describe('Algorithm Comparison', () => {
    test('should compare different algorithms', () => {
      const algorithms: Array<OptimizationParameters['algorithm']> = [
        'genetic', 'particle_swarm', 'simulated_annealing', 'gradient_descent'
      ];
      
      const results: OptimizationResult[] = [];
      
      algorithms.forEach(algorithm => {
        optimizer.updateOptimizationParameters({
          algorithm,
          populationSize: 30,
          generations: 20
        });
        
        const result = optimizer.optimize(testDesign, testVibrationData);
        results.push(result);
      });
      
      // All algorithms should produce results
      results.forEach((result, index) => {
        expect(result).toBeDefined();
        expect(result.iterations).toBeGreaterThan(0);
        console.log(`${algorithms[index]}: ${result.success ? 'Success' : 'Failed'}, ` +
                   `Improvement: ${result.improvementPercentage.toFixed(2)}%, ` +
                   `Time: ${result.computationTime}ms`);
      });
      
      // At least one algorithm should succeed
      const successfulResults = results.filter(r => r.success);
      expect(successfulResults.length).toBeGreaterThan(0);
    });
  });
});