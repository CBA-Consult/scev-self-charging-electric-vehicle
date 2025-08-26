/**
 * Energy Harvesting Simulator Tests
 * 
 * Comprehensive tests for the energy harvesting simulation system
 */

import {
  EnergyHarvestingSimulator,
  createEnergyHarvestingSimulator,
  defaultVehicleConfiguration,
  defaultOptimizationParameters,
  createTestSimulationInputs,
  validateSimulationInputs,
  weatherConditions
} from '../index';

import { ScenarioGenerator } from '../ScenarioGenerator';
import { PerformanceAnalyzer } from '../PerformanceAnalyzer';
import { OptimizationEngine } from '../OptimizationEngine';

describe('EnergyHarvestingSimulator', () => {
  let simulator: EnergyHarvestingSimulator;
  
  beforeEach(() => {
    simulator = createEnergyHarvestingSimulator(
      defaultVehicleConfiguration,
      defaultOptimizationParameters
    );
  });
  
  describe('Basic Functionality', () => {
    test('should create simulator with default configuration', () => {
      expect(simulator).toBeDefined();
      expect(simulator).toBeInstanceOf(EnergyHarvestingSimulator);
    });
    
    test('should validate simulation inputs correctly', () => {
      const validInputs = createTestSimulationInputs();
      expect(validateSimulationInputs(validInputs)).toBe(true);
      
      const invalidInputs = createTestSimulationInputs({
        drivingConditions: {
          ...validInputs.drivingConditions,
          speed: -10 // Invalid negative speed
        }
      });
      expect(validateSimulationInputs(invalidInputs)).toBe(false);
    });
    
    test('should run single simulation step successfully', () => {
      const inputs = createTestSimulationInputs();
      const result = simulator.simulateStep(inputs);
      
      expect(result).toBeDefined();
      expect(result.powerGeneration).toBeDefined();
      expect(result.efficiency).toBeDefined();
      expect(result.energyBalance).toBeDefined();
      expect(result.performance).toBeDefined();
      expect(result.optimization).toBeDefined();
      expect(result.diagnostics).toBeDefined();
      
      // Validate power generation values
      expect(result.powerGeneration.total).toBeGreaterThanOrEqual(0);
      expect(result.powerGeneration.regenerativeBraking).toBeGreaterThanOrEqual(0);
      expect(result.powerGeneration.electromagneticShockAbsorbers).toBeGreaterThanOrEqual(0);
      expect(result.powerGeneration.piezoelectricHarvesters).toBeGreaterThanOrEqual(0);
      expect(result.powerGeneration.mrFluidDampers).toBeGreaterThanOrEqual(0);
      
      // Validate efficiency values
      expect(result.efficiency.overall).toBeGreaterThanOrEqual(0);
      expect(result.efficiency.overall).toBeLessThanOrEqual(1);
    });
    
    test('should handle different driving conditions', () => {
      const conditions = [
        { speed: 0, acceleration: 0, description: 'Stationary' },
        { speed: 30, acceleration: 2, description: 'City acceleration' },
        { speed: 60, acceleration: -3, description: 'Braking' },
        { speed: 100, acceleration: 0, description: 'Highway cruising' }
      ];
      
      conditions.forEach(condition => {
        const inputs = createTestSimulationInputs({
          drivingConditions: {
            speed: condition.speed,
            acceleration: condition.acceleration,
            brakingIntensity: Math.max(0, -condition.acceleration / 5),
            steeringAngle: 0,
            roadGradient: 0,
            roadSurface: 'asphalt',
            trafficDensity: 'medium'
          }
        });
        
        const result = simulator.simulateStep(inputs);
        expect(result.powerGeneration.total).toBeGreaterThanOrEqual(0);
        expect(result.efficiency.overall).toBeGreaterThanOrEqual(0);
      });
    });
    
    test('should handle different weather conditions', () => {
      Object.entries(weatherConditions).forEach(([weatherType, conditions]) => {
        const inputs = createTestSimulationInputs({
          weatherConditions: conditions
        });
        
        const result = simulator.simulateStep(inputs);
        expect(result.powerGeneration.total).toBeGreaterThanOrEqual(0);
        expect(result.diagnostics.systemHealth).toBeGreaterThan(0);
      });
    });
  });
  
  describe('Simulation Execution', () => {
    test('should run complete simulation successfully', async () => {
      const inputs = createTestSimulationInputs({
        simulationParameters: {
          duration: 10, // 10 seconds for quick test
          timeStep: 1.0,
          realTimeMode: false,
          dataLogging: true,
          optimizationEnabled: true
        }
      });
      
      const results = await simulator.runSimulation(inputs);
      
      expect(results).toBeDefined();
      expect(results.length).toBe(10); // 10 steps for 10 seconds
      
      results.forEach(result => {
        expect(result.powerGeneration.total).toBeGreaterThanOrEqual(0);
        expect(result.efficiency.overall).toBeGreaterThanOrEqual(0);
      });
    });
    
    test('should generate simulation summary', async () => {
      const inputs = createTestSimulationInputs({
        simulationParameters: {
          duration: 30,
          timeStep: 1.0,
          realTimeMode: false,
          dataLogging: true,
          optimizationEnabled: false
        }
      });
      
      await simulator.runSimulation(inputs);
      const summary = simulator.getSimulationSummary();
      
      expect(summary).toBeDefined();
      expect(summary.averagePowerGeneration).toBeGreaterThanOrEqual(0);
      expect(summary.totalEnergyGenerated).toBeGreaterThanOrEqual(0);
      expect(summary.peakPowerOutput).toBeGreaterThanOrEqual(0);
      expect(summary.averageEfficiency).toBeGreaterThanOrEqual(0);
      expect(summary.optimalOperatingConditions).toBeDefined();
    });
    
    test('should stop simulation when requested', async () => {
      const inputs = createTestSimulationInputs({
        simulationParameters: {
          duration: 100, // Long simulation
          timeStep: 1.0,
          realTimeMode: false,
          dataLogging: true,
          optimizationEnabled: false
        }
      });
      
      // Start simulation
      const simulationPromise = simulator.runSimulation(inputs);
      
      // Stop after short delay
      setTimeout(() => {
        simulator.stopSimulation();
      }, 50);
      
      const results = await simulationPromise;
      
      // Should have stopped before completing all 100 steps
      expect(results.length).toBeLessThan(100);
    });
  });
  
  describe('Energy Harvesting Components', () => {
    test('should generate power from regenerative braking', () => {
      const inputs = createTestSimulationInputs({
        drivingConditions: {
          speed: 60,
          acceleration: -3, // Strong braking
          brakingIntensity: 0.6,
          steeringAngle: 0,
          roadGradient: 0,
          roadSurface: 'asphalt',
          trafficDensity: 'medium'
        }
      });
      
      const result = simulator.simulateStep(inputs);
      
      // Should generate significant regenerative braking power
      expect(result.powerGeneration.regenerativeBraking).toBeGreaterThan(0);
      expect(result.powerGeneration.regenerativeBraking).toBeGreaterThan(
        result.powerGeneration.piezoelectricHarvesters
      );
    });
    
    test('should generate power from electromagnetic shock absorbers', () => {
      const inputs = createTestSimulationInputs({
        drivingConditions: {
          speed: 80,
          acceleration: 0,
          brakingIntensity: 0,
          steeringAngle: 20, // Cornering
          roadGradient: 5, // Hill
          roadSurface: 'gravel', // Rough surface
          trafficDensity: 'medium'
        }
      });
      
      const result = simulator.simulateStep(inputs);
      
      // Should generate power from suspension activity
      expect(result.powerGeneration.electromagneticShockAbsorbers).toBeGreaterThan(0);
    });
    
    test('should generate power from piezoelectric harvesters', () => {
      const inputs = createTestSimulationInputs({
        drivingConditions: {
          speed: 100, // High speed for vibrations
          acceleration: 1,
          brakingIntensity: 0,
          steeringAngle: 0,
          roadGradient: 0,
          roadSurface: 'concrete',
          trafficDensity: 'light'
        }
      });
      
      const result = simulator.simulateStep(inputs);
      
      // Should generate power from vibrations
      expect(result.powerGeneration.piezoelectricHarvesters).toBeGreaterThan(0);
    });
    
    test('should disable components when configured', () => {
      const configWithDisabledComponents = {
        ...defaultVehicleConfiguration,
        electromagneticShockAbsorbers: {
          ...defaultVehicleConfiguration.electromagneticShockAbsorbers,
          enabled: false
        },
        piezoelectricHarvesters: {
          ...defaultVehicleConfiguration.piezoelectricHarvesters,
          enabled: false
        }
      };
      
      const customSimulator = createEnergyHarvestingSimulator(configWithDisabledComponents);
      const inputs = createTestSimulationInputs();
      const result = customSimulator.simulateStep(inputs);
      
      expect(result.powerGeneration.electromagneticShockAbsorbers).toBe(0);
      expect(result.powerGeneration.piezoelectricHarvesters).toBe(0);
      expect(result.powerGeneration.regenerativeBraking).toBeGreaterThan(0); // Should still work
    });
  });
  
  describe('Error Handling', () => {
    test('should handle invalid inputs gracefully', () => {
      const invalidInputs = {
        ...createTestSimulationInputs(),
        drivingConditions: {
          speed: NaN,
          acceleration: Infinity,
          brakingIntensity: -1,
          steeringAngle: 1000,
          roadGradient: 100,
          roadSurface: 'invalid' as any,
          trafficDensity: 'invalid' as any
        }
      };
      
      expect(() => {
        const result = simulator.simulateStep(invalidInputs);
        // Should return failsafe outputs instead of throwing
        expect(result.diagnostics.maintenanceAlerts).toContain('System Error');
      }).not.toThrow();
    });
    
    test('should provide failsafe outputs on component failure', () => {
      // Simulate extreme conditions that might cause component failure
      const extremeInputs = createTestSimulationInputs({
        drivingConditions: {
          speed: 200, // Very high speed
          acceleration: -10, // Extreme braking
          brakingIntensity: 1.0,
          steeringAngle: 90, // Sharp turn
          roadGradient: 30, // Steep hill
          roadSurface: 'ice',
          trafficDensity: 'heavy'
        },
        weatherConditions: {
          temperature: -40, // Extreme cold
          humidity: 100,
          windSpeed: 50,
          roadCondition: 'ice',
          visibility: 'poor'
        }
      });
      
      const result = simulator.simulateStep(extremeInputs);
      
      // Should still provide valid outputs
      expect(result).toBeDefined();
      expect(result.powerGeneration.total).toBeGreaterThanOrEqual(0);
      expect(result.efficiency.overall).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('ScenarioGenerator', () => {
  let scenarioGenerator: ScenarioGenerator;
  
  beforeEach(() => {
    scenarioGenerator = new ScenarioGenerator();
  });
  
  test('should generate predefined scenarios', () => {
    const cityScenario = scenarioGenerator.generateScenario({
      scenarioType: 'city',
      duration: 1800,
      weatherType: 'clear',
      trafficDensity: 'medium',
      roadConditions: 'good'
    });
    
    expect(cityScenario).toBeDefined();
    expect(cityScenario.name).toContain('City');
    expect(cityScenario.duration).toBe(1800);
    expect(cityScenario.timeSteps.length).toBe(1800);
  });
  
  test('should generate test suite', () => {
    const testSuite = scenarioGenerator.generateTestSuite();
    
    expect(testSuite).toBeDefined();
    expect(testSuite.length).toBeGreaterThan(0);
    
    testSuite.forEach(scenario => {
      expect(scenario.name).toBeDefined();
      expect(scenario.duration).toBeGreaterThan(0);
      expect(scenario.timeSteps.length).toBeGreaterThan(0);
    });
  });
  
  test('should analyze energy potential', () => {
    const scenario = scenarioGenerator.generateScenario({
      scenarioType: 'mountain',
      duration: 3600,
      weatherType: 'clear',
      trafficDensity: 'light',
      roadConditions: 'good'
    });
    
    const energyPotential = scenarioGenerator.analyzeScenarioEnergyPotential(scenario);
    
    expect(energyPotential).toBeDefined();
    expect(energyPotential.regenerativeBrakingPotential).toBeGreaterThanOrEqual(0);
    expect(energyPotential.suspensionEnergyPotential).toBeGreaterThanOrEqual(0);
    expect(energyPotential.piezoelectricPotential).toBeGreaterThanOrEqual(0);
    expect(energyPotential.totalEnergyPotential).toBeGreaterThanOrEqual(0);
    expect(energyPotential.recommendations).toBeDefined();
  });
});

describe('PerformanceAnalyzer', () => {
  let performanceAnalyzer: PerformanceAnalyzer;
  
  beforeEach(() => {
    performanceAnalyzer = new PerformanceAnalyzer();
  });
  
  test('should analyze performance metrics', () => {
    const mockInputs = {
      powerGeneration: {
        total: 5000,
        regenerativeBraking: 3000,
        electromagneticShockAbsorbers: 1000,
        piezoelectricHarvesters: 500,
        mrFluidDampers: 500
      },
      efficiency: {
        overall: 0.8,
        byComponent: {
          regenerativeBraking: 0.88,
          electromagneticShockAbsorbers: 0.85,
          piezoelectricHarvesters: 0.75,
          mrFluidDampers: 0.82
        }
      },
      vehicleConfig: defaultVehicleConfiguration,
      operatingConditions: {
        speed: 60,
        acceleration: -1,
        temperature: 20
      }
    };
    
    const metrics = performanceAnalyzer.analyzePerformance(mockInputs);
    
    expect(metrics).toBeDefined();
    expect(metrics.powerDensity).toBeGreaterThan(0);
    expect(metrics.energyDensity).toBeGreaterThan(0);
    expect(metrics.efficiency).toBe(0.8);
    expect(metrics.reliability).toBeGreaterThan(0);
  });
  
  test('should benchmark performance', () => {
    const mockMetrics = {
      powerDensity: 75,
      energyDensity: 50,
      costEffectiveness: 1.5,
      reliability: 0.95,
      efficiency: 0.85,
      responseTime: 50,
      adaptability: 0.8
    };
    
    const benchmarks = performanceAnalyzer.benchmarkPerformance(mockMetrics);
    
    expect(benchmarks).toBeDefined();
    expect(benchmarks.powerDensity).toBeDefined();
    expect(benchmarks.efficiency).toBeDefined();
    expect(benchmarks.reliability).toBeDefined();
    expect(benchmarks.costEffectiveness).toBeDefined();
    
    Object.values(benchmarks).forEach(benchmark => {
      expect(benchmark.value).toBeGreaterThanOrEqual(0);
      expect(['excellent', 'good', 'acceptable', 'poor']).toContain(benchmark.rating);
      expect(benchmark.percentile).toBeGreaterThanOrEqual(0);
      expect(benchmark.percentile).toBeLessThanOrEqual(100);
    });
  });
  
  test('should identify optimization opportunities', () => {
    const mockInputs = {
      powerGeneration: {
        total: 2000,
        regenerativeBraking: 800, // Low regenerative braking
        electromagneticShockAbsorbers: 600,
        piezoelectricHarvesters: 300,
        mrFluidDampers: 300
      },
      efficiency: {
        overall: 0.6, // Low overall efficiency
        byComponent: {
          regenerativeBraking: 0.5, // Very low efficiency
          electromagneticShockAbsorbers: 0.7,
          piezoelectricHarvesters: 0.6,
          mrFluidDampers: 0.8
        }
      },
      vehicleConfig: defaultVehicleConfiguration,
      operatingConditions: {
        speed: 60,
        acceleration: -2
      }
    };
    
    const optimization = performanceAnalyzer.identifyOptimizationOpportunities(mockInputs);
    
    expect(optimization).toBeDefined();
    expect(optimization.opportunities).toBeDefined();
    expect(optimization.priorityActions).toBeDefined();
    
    // Should identify low efficiency components
    const lowEfficiencyOpportunities = optimization.opportunities.filter(
      opp => opp.issue.includes('efficiency')
    );
    expect(lowEfficiencyOpportunities.length).toBeGreaterThan(0);
  });
  
  test('should generate performance report', () => {
    const mockInputs = {
      powerGeneration: {
        total: 4000,
        regenerativeBraking: 2400,
        electromagneticShockAbsorbers: 800,
        piezoelectricHarvesters: 400,
        mrFluidDampers: 400
      },
      efficiency: {
        overall: 0.82,
        byComponent: {
          regenerativeBraking: 0.88,
          electromagneticShockAbsorbers: 0.85,
          piezoelectricHarvesters: 0.75,
          mrFluidDampers: 0.82
        }
      },
      vehicleConfig: defaultVehicleConfiguration,
      operatingConditions: {
        speed: 80,
        acceleration: -1.5,
        temperature: 25
      }
    };
    
    const report = performanceAnalyzer.generatePerformanceReport(mockInputs);
    
    expect(report).toBeDefined();
    expect(typeof report).toBe('string');
    expect(report).toContain('Performance Report');
    expect(report).toContain('Executive Summary');
    expect(report).toContain('Performance Metrics');
    expect(report).toContain('Optimization Opportunities');
  });
});

describe('OptimizationEngine', () => {
  let optimizationEngine: OptimizationEngine;
  
  beforeEach(() => {
    optimizationEngine = new OptimizationEngine(defaultOptimizationParameters);
  });
  
  test('should optimize system parameters', () => {
    const mockInputs = {
      currentPerformance: {
        powerDensity: 50,
        efficiency: 0.75
      },
      operatingConditions: {
        speed: 60,
        acceleration: -1,
        temperature: 20
      },
      vehicleConfiguration: defaultVehicleConfiguration
    };
    
    const result = optimizationEngine.optimize(mockInputs);
    
    expect(result).toBeDefined();
    expect(result.currentParameters).toBeDefined();
    expect(result.suggestedImprovements).toBeDefined();
    expect(result.potentialGains).toBeDefined();
    expect(result.strategies).toBeDefined();
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
  
  test('should adjust parameters in real-time', () => {
    const mockInputs = {
      currentPerformance: {
        powerGeneration: { total: 3000 },
        efficiency: 0.8
      },
      operatingConditions: {
        speed: 80,
        acceleration: -2,
        temperature: 25,
        roadSurface: 'wet'
      },
      vehicleConfiguration: defaultVehicleConfiguration
    };
    
    const adjustments = optimizationEngine.adjustParameters(mockInputs);
    
    expect(adjustments).toBeDefined();
    expect(typeof adjustments).toBe('object');
    
    // Should provide parameter adjustments
    Object.values(adjustments).forEach(value => {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThanOrEqual(0);
    });
  });
  
  test('should predict optimal parameters', () => {
    const operatingConditions = {
      speed: 100,
      acceleration: 0,
      temperature: 30,
      roadSurface: 'asphalt'
    };
    
    const predictions = optimizationEngine.predictOptimalParameters(operatingConditions);
    
    expect(predictions).toBeDefined();
    expect(predictions.regenerativeBrakingRatio).toBeDefined();
    expect(predictions.electromagneticDamperSensitivity).toBeDefined();
    expect(predictions.piezoelectricResonanceFrequency).toBeDefined();
    expect(predictions.mrFluidViscosity).toBeDefined();
    
    Object.values(predictions).forEach(value => {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThan(0);
    });
  });
  
  test('should perform multi-objective optimization', () => {
    const mockInputs = {
      currentPerformance: {
        powerDensity: 60,
        efficiency: 0.78
      },
      operatingConditions: {
        speed: 70,
        acceleration: -1.5,
        temperature: 22
      },
      vehicleConfiguration: defaultVehicleConfiguration
    };
    
    const result = optimizationEngine.multiObjectiveOptimization(mockInputs);
    
    expect(result).toBeDefined();
    expect(result.paretoFront).toBeDefined();
    expect(result.recommendedSolution).toBeDefined();
    
    if (result.paretoFront.length > 0) {
      result.paretoFront.forEach(solution => {
        expect(solution.parameters).toBeDefined();
        expect(solution.objectives).toBeDefined();
      });
    }
  });
});

describe('Integration Tests', () => {
  test('should integrate all components successfully', async () => {
    const simulator = createEnergyHarvestingSimulator(defaultVehicleConfiguration);
    const scenarioGenerator = new ScenarioGenerator();
    
    // Generate a test scenario
    const scenario = scenarioGenerator.generateScenario({
      scenarioType: 'city',
      duration: 60, // 1 minute for quick test
      weatherType: 'clear',
      trafficDensity: 'medium',
      roadConditions: 'good'
    });
    
    // Run simulation with scenario data
    const inputs = createTestSimulationInputs({
      drivingConditions: scenario.timeSteps[0],
      weatherConditions: scenario.weatherConditions,
      simulationParameters: {
        duration: 60,
        timeStep: 1.0,
        realTimeMode: false,
        dataLogging: true,
        optimizationEnabled: true
      }
    });
    
    const results = await simulator.runSimulation(inputs);
    
    expect(results).toBeDefined();
    expect(results.length).toBe(60);
    
    // Verify all results are valid
    results.forEach(result => {
      expect(result.powerGeneration.total).toBeGreaterThanOrEqual(0);
      expect(result.efficiency.overall).toBeGreaterThanOrEqual(0);
      expect(result.efficiency.overall).toBeLessThanOrEqual(1);
      expect(result.diagnostics.systemHealth).toBeGreaterThan(0);
    });
    
    const summary = simulator.getSimulationSummary();
    expect(summary.averagePowerGeneration).toBeGreaterThanOrEqual(0);
    expect(summary.averageEfficiency).toBeGreaterThanOrEqual(0);
  });
  
  test('should handle complete workflow from scenario to optimization', async () => {
    const simulator = createEnergyHarvestingSimulator(defaultVehicleConfiguration);
    const scenarioGenerator = new ScenarioGenerator();
    const performanceAnalyzer = new PerformanceAnalyzer();
    const optimizationEngine = new OptimizationEngine(defaultOptimizationParameters);
    
    // 1. Generate scenario
    const scenario = scenarioGenerator.generateScenario({
      scenarioType: 'highway',
      duration: 30,
      weatherType: 'clear',
      trafficDensity: 'light',
      roadConditions: 'excellent'
    });
    
    // 2. Analyze energy potential
    const energyPotential = scenarioGenerator.analyzeScenarioEnergyPotential(scenario);
    expect(energyPotential.totalEnergyPotential).toBeGreaterThanOrEqual(0);
    
    // 3. Run simulation
    const inputs = createTestSimulationInputs({
      drivingConditions: scenario.timeSteps[0],
      weatherConditions: scenario.weatherConditions,
      simulationParameters: {
        duration: 30,
        timeStep: 1.0,
        realTimeMode: false,
        dataLogging: true,
        optimizationEnabled: true
      }
    });
    
    const results = await simulator.runSimulation(inputs);
    expect(results.length).toBe(30);
    
    // 4. Analyze performance
    const lastResult = results[results.length - 1];
    const performanceMetrics = performanceAnalyzer.analyzePerformance({
      powerGeneration: lastResult.powerGeneration,
      efficiency: lastResult.efficiency,
      vehicleConfig: inputs.vehicleConfiguration,
      operatingConditions: inputs.drivingConditions,
      timeHistory: results
    });
    
    expect(performanceMetrics.powerDensity).toBeGreaterThanOrEqual(0);
    expect(performanceMetrics.efficiency).toBeGreaterThanOrEqual(0);
    
    // 5. Optimize system
    const optimization = optimizationEngine.optimize({
      currentPerformance: performanceMetrics,
      operatingConditions: inputs.drivingConditions,
      vehicleConfiguration: inputs.vehicleConfiguration,
      historicalData: results
    });
    
    expect(optimization.strategies.length).toBeGreaterThan(0);
    expect(optimization.confidence).toBeGreaterThan(0);
    
    // 6. Generate report
    const report = performanceAnalyzer.generatePerformanceReport({
      powerGeneration: lastResult.powerGeneration,
      efficiency: lastResult.efficiency,
      vehicleConfig: inputs.vehicleConfiguration,
      operatingConditions: inputs.drivingConditions,
      timeHistory: results
    });
    
    expect(report).toContain('Performance Report');
    expect(report).toContain('Optimization Opportunities');
  });
});