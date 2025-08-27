/**
 * Test suite for MR Damper Test Vehicle Implementation
 * 
 * This test suite validates the functionality and performance of the
 * MR damper test vehicle implementation, including:
 * - Vehicle initialization and configuration
 * - Test scenario execution
 * - Performance verification
 * - System diagnostics and validation
 */

import { 
  MRDamperTestVehicle, 
  TestVehicleConfiguration, 
  TestScenario, 
  VehicleState 
} from '../MRDamperTestVehicle';
import { VehicleParameters } from '../FuzzyRegenerativeBrakingController';
import { MRFluidSystemConfiguration } from '../MRFluidIntegration';

describe('MRDamperTestVehicle', () => {
  let testVehicle: MRDamperTestVehicle;
  let vehicleConfig: TestVehicleConfiguration;
  let vehicleParams: VehicleParameters;
  let mrFluidConfig: MRFluidSystemConfiguration;

  beforeEach(() => {
    // Configure test vehicle
    vehicleConfig = {
      vehicleId: 'TEST_VEHICLE_001',
      vehicleType: 'sedan',
      damperCount: 4,
      testEnvironment: {
        enableDataLogging: true,
        logInterval: 100,
        enableRealTimeMonitoring: true,
        enablePerformanceAnalytics: true
      },
      operationalLimits: {
        maxTestSpeed: 120, // km/h
        maxAcceleration: 8, // m/s²
        maxDamperForce: 10000, // N
        emergencyStopThreshold: 150 // °C
      }
    };

    // Configure vehicle parameters
    vehicleParams = {
      mass: 1500, // kg
      frontAxleLoad: 0.6,
      rearAxleLoad: 0.4,
      wheelRadius: 0.32, // m
      motorCount: 4,
      maxMotorTorque: 200, // Nm
      maxRegenerativePower: 50000, // W
      batteryCapacity: 60000, // Wh
      aerodynamicDragCoefficient: 0.28,
      frontalArea: 2.3, // m²
      rollingResistanceCoefficient: 0.01
    };

    // Configure MR fluid system
    mrFluidConfig = {
      selectedFormulation: 'high_performance_automotive',
      brakingSystemConfig: {
        enableMRFluidBraking: true,
        mrFluidBrakingRatio: 0.3,
        adaptiveFieldControl: true,
        maxMagneticField: 80000 // A/m
      },
      suspensionSystemConfig: {
        enableMRFluidSuspension: true,
        suspensionEnergyRecovery: true,
        adaptiveDamping: true,
        dampingRange: [500, 5000] // N·s/m
      },
      thermalManagement: {
        thermalDerating: true,
        maxOperatingTemperature: 120, // °C
        coolingSystemEnabled: true,
        temperatureMonitoring: true
      }
    };

    testVehicle = new MRDamperTestVehicle(
      vehicleConfig,
      vehicleParams,
      mrFluidConfig
    );
  });

  describe('Vehicle Initialization', () => {
    it('should initialize with correct configuration', () => {
      const diagnostics = testVehicle.getSystemDiagnostics();
      
      expect(diagnostics.vehicleStatus).toBe('Ready');
      expect(diagnostics.testingCapability).toBe(true);
      expect(diagnostics.damperStatus.size).toBe(4);
      expect(diagnostics.mrFluidStatus).toBeDefined();
    });

    it('should validate functionality correctly', () => {
      const validation = testVehicle.validateFunctionality();
      
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should initialize vehicle state correctly', () => {
      const state = testVehicle.getCurrentState();
      
      expect(state.motion.speed).toBe(0);
      expect(state.motion.acceleration).toBe(0);
      expect(state.suspension).toHaveLength(4);
      expect(state.systemStatus.batterySOC).toBeGreaterThan(0);
    });
  });

  describe('Test Scenario Execution', () => {
    let basicTestScenario: TestScenario;

    beforeEach(() => {
      basicTestScenario = {
        scenarioId: 'BASIC_CITY_DRIVING',
        name: 'Basic City Driving Test',
        description: 'Simulates typical city driving conditions with moderate speeds and braking',
        duration: 5, // 5 seconds for quick testing
        roadConditions: {
          surfaceType: 'smooth',
          roughnessLevel: 0.2,
          inclineAngle: 0
        },
        vehicleDynamics: {
          speedProfile: [
            { time: 0, speed: 0 },
            { time: 1, speed: 30 },
            { time: 3, speed: 50 },
            { time: 4, speed: 30 },
            { time: 5, speed: 0 }
          ],
          loadCondition: 0.5,
          brakingEvents: [
            { time: 3.5, intensity: 0.6, duration: 1.0 }
          ]
        },
        environment: {
          temperature: 25,
          humidity: 60,
          windSpeed: 5
        }
      };
    });

    it('should execute basic test scenario successfully', async () => {
      const testId = await testVehicle.startTest(basicTestScenario);
      
      expect(testId).toContain('test_BASIC_CITY_DRIVING');
      
      const results = testVehicle.getLatestTestResults();
      expect(results).toBeDefined();
      expect(results!.testId).toBe(testId);
      expect(results!.scenarioId).toBe('BASIC_CITY_DRIVING');
      expect(results!.execution.duration).toBeGreaterThan(4);
      expect(results!.execution.samplesCollected).toBeGreaterThan(0);
    });

    it('should prevent starting multiple tests simultaneously', async () => {
      const testPromise = testVehicle.startTest(basicTestScenario);
      
      await expect(testVehicle.startTest(basicTestScenario))
        .rejects.toThrow('Test is already running');
      
      await testPromise; // Wait for first test to complete
    });

    it('should collect performance data during test', async () => {
      await testVehicle.startTest(basicTestScenario);
      
      const results = testVehicle.getLatestTestResults();
      expect(results!.performance.averageDampingForce).toBeGreaterThan(0);
      expect(results!.performance.totalEnergyRecovered).toBeGreaterThanOrEqual(0);
      expect(results!.performance.dampingEfficiency).toBeGreaterThanOrEqual(0);
      expect(results!.performance.systemReliability).toBeGreaterThan(0);
    });

    it('should track MR fluid performance', async () => {
      await testVehicle.startTest(basicTestScenario);
      
      const results = testVehicle.getLatestTestResults();
      expect(results!.mrFluidPerformance.averageViscosity).toBeGreaterThan(0);
      expect(results!.mrFluidPerformance.temperatureRange.min).toBeDefined();
      expect(results!.mrFluidPerformance.temperatureRange.max).toBeDefined();
      expect(results!.mrFluidPerformance.formulationEfficiency).toBeGreaterThan(0);
    });
  });

  describe('Performance Verification', () => {
    let performanceTestScenario: TestScenario;

    beforeEach(() => {
      performanceTestScenario = {
        scenarioId: 'PERFORMANCE_TEST',
        name: 'High Performance Damping Test',
        description: 'Tests damper performance under demanding conditions',
        duration: 3,
        roadConditions: {
          surfaceType: 'rough',
          roughnessLevel: 0.8,
          inclineAngle: 5
        },
        vehicleDynamics: {
          speedProfile: [
            { time: 0, speed: 0 },
            { time: 1, speed: 80 },
            { time: 2, speed: 100 },
            { time: 3, speed: 60 }
          ],
          loadCondition: 0.8,
          brakingEvents: [
            { time: 1.5, intensity: 0.8, duration: 0.5 },
            { time: 2.5, intensity: 0.9, duration: 0.3 }
          ]
        },
        environment: {
          temperature: 35,
          humidity: 40,
          windSpeed: 10
        }
      };
    });

    it('should handle high-performance scenarios', async () => {
      await testVehicle.startTest(performanceTestScenario);
      
      const results = testVehicle.getLatestTestResults();
      expect(results!.performance.maxDampingForce).toBeGreaterThan(1000);
      expect(results!.performance.totalEnergyRecovered).toBeGreaterThan(0);
      expect(results!.diagnostics.systemHealth).toMatch(/excellent|good|fair/);
    });

    it('should maintain system reliability under stress', async () => {
      await testVehicle.startTest(performanceTestScenario);
      
      const results = testVehicle.getLatestTestResults();
      expect(results!.performance.systemReliability).toBeGreaterThan(80);
    });

    it('should adapt to changing road conditions', async () => {
      const roughRoadScenario = {
        ...performanceTestScenario,
        roadConditions: {
          surfaceType: 'off-road' as const,
          roughnessLevel: 1.0,
          inclineAngle: 10
        }
      };

      await testVehicle.startTest(roughRoadScenario);
      
      const results = testVehicle.getLatestTestResults();
      expect(results!.performance.averageDampingForce).toBeGreaterThan(500);
      expect(results!.mrFluidPerformance.temperatureRange.max).toBeGreaterThan(25);
    });
  });

  describe('Safety and Monitoring', () => {
    it('should monitor safety limits during operation', async () => {
      const extremeScenario: TestScenario = {
        scenarioId: 'EXTREME_TEST',
        name: 'Extreme Conditions Test',
        description: 'Tests safety systems under extreme conditions',
        duration: 2,
        roadConditions: {
          surfaceType: 'rough',
          roughnessLevel: 1.0,
          inclineAngle: 15
        },
        vehicleDynamics: {
          speedProfile: [
            { time: 0, speed: 0 },
            { time: 1, speed: 150 }, // Exceeds max test speed
            { time: 2, speed: 100 }
          ],
          loadCondition: 1.0,
          brakingEvents: []
        },
        environment: {
          temperature: 50, // High temperature
          humidity: 90,
          windSpeed: 20
        }
      };

      // Should complete without crashing, but may trigger warnings
      await testVehicle.startTest(extremeScenario);
      
      const results = testVehicle.getLatestTestResults();
      expect(results).toBeDefined();
    });

    it('should provide comprehensive diagnostics', async () => {
      const diagnostics = testVehicle.getSystemDiagnostics();
      
      expect(diagnostics.vehicleStatus).toBeDefined();
      expect(diagnostics.damperStatus).toBeDefined();
      expect(diagnostics.mrFluidStatus).toBeDefined();
      expect(diagnostics.testingCapability).toBeDefined();
    });

    it('should allow manual test stopping', async () => {
      const longScenario: TestScenario = {
        scenarioId: 'LONG_TEST',
        name: 'Long Duration Test',
        description: 'Long test for manual stopping',
        duration: 10, // 10 seconds
        roadConditions: {
          surfaceType: 'smooth',
          roughnessLevel: 0.1,
          inclineAngle: 0
        },
        vehicleDynamics: {
          speedProfile: [
            { time: 0, speed: 0 },
            { time: 5, speed: 60 },
            { time: 10, speed: 60 }
          ],
          loadCondition: 0.3,
          brakingEvents: []
        },
        environment: {
          temperature: 20,
          humidity: 50,
          windSpeed: 5
        }
      };

      const testPromise = testVehicle.startTest(longScenario);
      
      // Stop test after 1 second
      setTimeout(() => {
        testVehicle.stopTest();
      }, 1000);

      await testPromise;
      
      const results = testVehicle.getLatestTestResults();
      expect(results!.execution.duration).toBeLessThan(5);
    });
  });

  describe('Data Export and Analysis', () => {
    it('should export test data correctly', async () => {
      await testVehicle.startTest({
        scenarioId: 'EXPORT_TEST',
        name: 'Data Export Test',
        description: 'Test for data export functionality',
        duration: 2,
        roadConditions: {
          surfaceType: 'smooth',
          roughnessLevel: 0.1,
          inclineAngle: 0
        },
        vehicleDynamics: {
          speedProfile: [
            { time: 0, speed: 0 },
            { time: 1, speed: 40 },
            { time: 2, speed: 40 }
          ],
          loadCondition: 0.4,
          brakingEvents: []
        },
        environment: {
          temperature: 22,
          humidity: 55,
          windSpeed: 3
        }
      });

      const exportData = testVehicle.exportTestData();
      
      expect(exportData.testHistory).toBeDefined();
      expect(exportData.vehicleConfig).toBeDefined();
      expect(exportData.vehicleParams).toBeDefined();
      expect(exportData.systemDiagnostics).toBeDefined();
    });

    it('should maintain test history', async () => {
      // Run multiple tests
      for (let i = 0; i < 3; i++) {
        await testVehicle.startTest({
          scenarioId: `HISTORY_TEST_${i}`,
          name: `History Test ${i}`,
          description: `Test ${i} for history tracking`,
          duration: 1,
          roadConditions: {
            surfaceType: 'smooth',
            roughnessLevel: 0.1,
            inclineAngle: 0
          },
          vehicleDynamics: {
            speedProfile: [
              { time: 0, speed: 0 },
              { time: 1, speed: 30 }
            ],
            loadCondition: 0.3,
            brakingEvents: []
          },
          environment: {
            temperature: 20,
            humidity: 50,
            windSpeed: 2
          }
        });
      }

      const history = testVehicle.getTestHistory();
      expect(history).toHaveLength(3);
      expect(history[0].scenarioId).toBe('HISTORY_TEST_0');
      expect(history[2].scenarioId).toBe('HISTORY_TEST_2');
    });
  });

  describe('Integration with MR Fluid System', () => {
    it('should integrate with MR fluid formulations', async () => {
      await testVehicle.startTest({
        scenarioId: 'MR_FLUID_INTEGRATION',
        name: 'MR Fluid Integration Test',
        description: 'Tests integration with MR fluid system',
        duration: 3,
        roadConditions: {
          surfaceType: 'mixed',
          roughnessLevel: 0.5,
          inclineAngle: 2
        },
        vehicleDynamics: {
          speedProfile: [
            { time: 0, speed: 0 },
            { time: 1, speed: 60 },
            { time: 2, speed: 80 },
            { time: 3, speed: 40 }
          ],
          loadCondition: 0.6,
          brakingEvents: [
            { time: 2.5, intensity: 0.7, duration: 0.5 }
          ]
        },
        environment: {
          temperature: 30,
          humidity: 65,
          windSpeed: 8
        }
      });

      const results = testVehicle.getLatestTestResults();
      
      // Verify MR fluid performance metrics
      expect(results!.mrFluidPerformance.averageViscosity).toBeGreaterThan(0);
      expect(results!.mrFluidPerformance.magneticFieldUtilization).toBeGreaterThan(0);
      expect(results!.mrFluidPerformance.formulationEfficiency).toBeGreaterThan(0);
      
      // Verify energy recovery
      expect(results!.performance.totalEnergyRecovered).toBeGreaterThan(0);
    });

    it('should adapt MR fluid properties during operation', async () => {
      const variableConditionsScenario: TestScenario = {
        scenarioId: 'VARIABLE_CONDITIONS',
        name: 'Variable Conditions Test',
        description: 'Tests MR fluid adaptation to changing conditions',
        duration: 4,
        roadConditions: {
          surfaceType: 'rough',
          roughnessLevel: 0.7,
          inclineAngle: 8
        },
        vehicleDynamics: {
          speedProfile: [
            { time: 0, speed: 0 },
            { time: 1, speed: 40 },
            { time: 2, speed: 90 },
            { time: 3, speed: 120 },
            { time: 4, speed: 60 }
          ],
          loadCondition: 0.9,
          brakingEvents: [
            { time: 1.5, intensity: 0.5, duration: 0.3 },
            { time: 3.2, intensity: 0.8, duration: 0.6 }
          ]
        },
        environment: {
          temperature: 40, // High temperature
          humidity: 30,
          windSpeed: 15
        }
      };

      await testVehicle.startTest(variableConditionsScenario);
      
      const results = testVehicle.getLatestTestResults();
      
      // Should show temperature adaptation
      expect(results!.mrFluidPerformance.temperatureRange.max).toBeGreaterThan(40);
      
      // Should maintain reasonable performance despite challenging conditions
      expect(results!.performance.dampingEfficiency).toBeGreaterThan(30);
      expect(results!.performance.systemReliability).toBeGreaterThan(70);
    });
  });
});