/**
 * Test Suite for Hydraulic Damper Integration System
 * 
 * Comprehensive tests for the integrated hydraulic electromagnetic regenerative damper
 * and fuzzy control system, focusing on energy management and system coordination.
 */

import { 
  HydraulicDamperIntegration,
  IntegratedSystemInputs,
  IntegratedSystemOutputs,
  HydraulicDamperSystemConfig
} from '../HydraulicDamperIntegration';

import { VehicleParameters } from '../RegenerativeBrakingTorqueModel';
import { DamperInputs } from '../HydraulicElectromagneticRegenerativeDamper';

describe('HydraulicDamperIntegration', () => {
  let integratedSystem: HydraulicDamperIntegration;
  let vehicleParams: VehicleParameters;

  beforeEach(() => {
    vehicleParams = {
      mass: 1800,
      frontAxleWeightRatio: 0.6,
      wheelRadius: 0.35,
      motorCount: 2,
      maxMotorTorque: 400,
      motorEfficiency: 0.92,
      transmissionRatio: 1.0
    };

    integratedSystem = new HydraulicDamperIntegration(vehicleParams);
  });

  describe('System Initialization', () => {
    test('should initialize with default configuration', () => {
      const diagnostics = integratedSystem.getSystemDiagnostics();
      
      expect(diagnostics.configuration).toBeDefined();
      expect(diagnostics.configuration.damperConfigs.front).toBeDefined();
      expect(diagnostics.configuration.damperConfigs.rear).toBeDefined();
      expect(diagnostics.configuration.energyManagement).toBeDefined();
    });

    test('should initialize with custom configuration', () => {
      const customConfig: Partial<HydraulicDamperSystemConfig> = {
        energyManagement: {
          prioritizeBrakingOverDamping: false,
          maxCombinedPower: 10000,
          batteryChargingThreshold: 0.9,
          thermalManagementEnabled: true
        }
      };

      const customSystem = new HydraulicDamperIntegration(vehicleParams, customConfig);
      const diagnostics = customSystem.getSystemDiagnostics();

      expect(diagnostics.configuration.energyManagement.prioritizeBrakingOverDamping).toBe(false);
      expect(diagnostics.configuration.energyManagement.maxCombinedPower).toBe(10000);
    });
  });

  describe('Integrated Performance Calculation', () => {
    test('should calculate integrated system performance', () => {
      const inputs: IntegratedSystemInputs = createTestInputs();
      
      const outputs = integratedSystem.calculateIntegratedPerformance(inputs);

      expect(outputs).toBeDefined();
      expect(outputs.damperOutputs).toBeDefined();
      expect(outputs.totalDamperPower).toBeGreaterThanOrEqual(0);
      expect(outputs.totalDamperEnergy).toBeGreaterThanOrEqual(0);
      expect(outputs.combinedEnergyEfficiency).toBeGreaterThanOrEqual(0);
      expect(outputs.energyBalance).toBeDefined();
    });

    test('should generate power from both braking and damping systems', () => {
      const inputs: IntegratedSystemInputs = createTestInputs({
        brakePedalPosition: 0.4, // Moderate braking
        suspensionInputs: {
          frontLeft: createDamperInputs({ compressionVelocity: 0.6 }),
          frontRight: createDamperInputs({ compressionVelocity: 0.5 }),
          rearLeft: createDamperInputs({ compressionVelocity: 0.4 }),
          rearRight: createDamperInputs({ compressionVelocity: 0.4 })
        }
      });

      const outputs = integratedSystem.calculateIntegratedPerformance(inputs);

      expect(outputs.regeneratedPower).toBeGreaterThan(0); // Braking power
      expect(outputs.totalDamperPower).toBeGreaterThan(0); // Damper power
      expect(outputs.energyBalance.totalGeneratedPower).toBeGreaterThan(0);
    });

    test('should calculate energy balance correctly', () => {
      const inputs: IntegratedSystemInputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.3,
        suspensionInputs: {
          frontLeft: createDamperInputs({ compressionVelocity: 0.5, vehicleSpeed: 80 }),
          frontRight: createDamperInputs({ compressionVelocity: 0.5, vehicleSpeed: 80 }),
          rearLeft: createDamperInputs({ compressionVelocity: 0.4, vehicleSpeed: 80 }),
          rearRight: createDamperInputs({ compressionVelocity: 0.4, vehicleSpeed: 80 })
        }
      });

      const outputs = integratedSystem.calculateIntegratedPerformance(inputs);

      expect(outputs.energyBalance.regenerativeBrakingPower).toBeGreaterThanOrEqual(0);
      expect(outputs.energyBalance.damperPower).toBeGreaterThanOrEqual(0);
      expect(outputs.energyBalance.totalGeneratedPower).toBe(
        outputs.energyBalance.regenerativeBrakingPower + outputs.energyBalance.damperPower
      );
      expect(outputs.energyBalance.powerConsumption).toBeGreaterThan(0);
    });
  });

  describe('Energy Management', () => {
    test('should reduce power generation when battery is full', () => {
      const lowSOCInputs: IntegratedSystemInputs = createTestInputs({
        batterySOC: 0.3, // Low battery
        brakePedalPosition: 0.5,
        suspensionInputs: createUniformSuspensionInputs({ compressionVelocity: 0.6 })
      });

      const highSOCInputs: IntegratedSystemInputs = createTestInputs({
        batterySOC: 0.97, // Nearly full battery
        brakePedalPosition: 0.5,
        suspensionInputs: createUniformSuspensionInputs({ compressionVelocity: 0.6 })
      });

      const lowSOCOutputs = integratedSystem.calculateIntegratedPerformance(lowSOCInputs);
      const highSOCOutputs = integratedSystem.calculateIntegratedPerformance(highSOCInputs);

      expect(highSOCOutputs.totalDamperPower).toBeLessThan(lowSOCOutputs.totalDamperPower);
      expect(highSOCOutputs.regeneratedPower).toBeLessThan(lowSOCOutputs.regeneratedPower);
    });

    test('should enforce maximum combined power limits', () => {
      // Configure system with low power limit
      const lowPowerConfig: Partial<HydraulicDamperSystemConfig> = {
        energyManagement: {
          prioritizeBrakingOverDamping: true,
          maxCombinedPower: 3000, // Low limit
          batteryChargingThreshold: 0.95,
          thermalManagementEnabled: true
        }
      };

      const limitedSystem = new HydraulicDamperIntegration(vehicleParams, lowPowerConfig);

      const highPowerInputs: IntegratedSystemInputs = createTestInputs({
        brakePedalPosition: 0.8, // Heavy braking
        suspensionInputs: createUniformSuspensionInputs({ 
          compressionVelocity: 1.5, // High suspension activity
          roadRoughness: 0.8
        })
      });

      const outputs = limitedSystem.calculateIntegratedPerformance(highPowerInputs);

      expect(outputs.energyBalance.totalGeneratedPower).toBeLessThanOrEqual(3000);
    });

    test('should prioritize braking over damping when configured', () => {
      const brakingPriorityConfig: Partial<HydraulicDamperSystemConfig> = {
        energyManagement: {
          prioritizeBrakingOverDamping: true,
          maxCombinedPower: 4000,
          batteryChargingThreshold: 0.95,
          thermalManagementEnabled: true
        }
      };

      const dampingPriorityConfig: Partial<HydraulicDamperSystemConfig> = {
        energyManagement: {
          prioritizeBrakingOverDamping: false,
          maxCombinedPower: 4000,
          batteryChargingThreshold: 0.95,
          thermalManagementEnabled: true
        }
      };

      const brakingPrioritySystem = new HydraulicDamperIntegration(vehicleParams, brakingPriorityConfig);
      const dampingPrioritySystem = new HydraulicDamperIntegration(vehicleParams, dampingPriorityConfig);

      const highDemandInputs: IntegratedSystemInputs = createTestInputs({
        brakePedalPosition: 0.7,
        suspensionInputs: createUniformSuspensionInputs({ compressionVelocity: 1.2 })
      });

      const brakingPriorityOutputs = brakingPrioritySystem.calculateIntegratedPerformance(highDemandInputs);
      const dampingPriorityOutputs = dampingPrioritySystem.calculateIntegratedPerformance(highDemandInputs);

      // When power is limited, braking priority should maintain higher braking power
      const brakingRatio1 = brakingPriorityOutputs.regeneratedPower / brakingPriorityOutputs.energyBalance.totalGeneratedPower;
      const brakingRatio2 = dampingPriorityOutputs.regeneratedPower / dampingPriorityOutputs.energyBalance.totalGeneratedPower;

      expect(brakingRatio1).toBeGreaterThanOrEqual(brakingRatio2);
    });
  });

  describe('Thermal Management', () => {
    test('should apply thermal derating at high temperatures', () => {
      const normalTempInputs: IntegratedSystemInputs = createTestInputs({
        motorTemperatures: { frontLeft: 60, frontRight: 62 },
        suspensionInputs: createUniformSuspensionInputs({ damperTemperature: 25 })
      });

      const highTempInputs: IntegratedSystemInputs = createTestInputs({
        motorTemperatures: { frontLeft: 130, frontRight: 135 }, // High motor temps
        suspensionInputs: createUniformSuspensionInputs({ damperTemperature: 110 }) // High damper temps
      });

      const normalTempOutputs = integratedSystem.calculateIntegratedPerformance(normalTempInputs);
      const highTempOutputs = integratedSystem.calculateIntegratedPerformance(highTempInputs);

      expect(highTempOutputs.regeneratedPower).toBeLessThan(normalTempOutputs.regeneratedPower);
      expect(highTempOutputs.totalDamperPower).toBeLessThan(normalTempOutputs.totalDamperPower);
    });

    test('should disable thermal management when configured', () => {
      const noThermalConfig: Partial<HydraulicDamperSystemConfig> = {
        energyManagement: {
          prioritizeBrakingOverDamping: true,
          maxCombinedPower: 8000,
          batteryChargingThreshold: 0.95,
          thermalManagementEnabled: false
        }
      };

      const noThermalSystem = new HydraulicDamperIntegration(vehicleParams, noThermalConfig);

      const highTempInputs: IntegratedSystemInputs = createTestInputs({
        motorTemperatures: { frontLeft: 130, frontRight: 135 },
        suspensionInputs: createUniformSuspensionInputs({ damperTemperature: 110 })
      });

      const withThermalOutputs = integratedSystem.calculateIntegratedPerformance(highTempInputs);
      const noThermalOutputs = noThermalSystem.calculateIntegratedPerformance(highTempInputs);

      // Without thermal management, power should be higher (less derating)
      expect(noThermalOutputs.energyBalance.totalGeneratedPower).toBeGreaterThanOrEqual(
        withThermalOutputs.energyBalance.totalGeneratedPower
      );
    });
  });

  describe('Combined Energy Efficiency', () => {
    test('should calculate realistic combined efficiency', () => {
      const inputs: IntegratedSystemInputs = createTestInputs({
        vehicleSpeed: 60,
        brakePedalPosition: 0.4,
        batterySOC: 0.5,
        suspensionInputs: createUniformSuspensionInputs({
          compressionVelocity: 0.5,
          roadRoughness: 0.3
        })
      });

      const outputs = integratedSystem.calculateIntegratedPerformance(inputs);

      expect(outputs.combinedEnergyEfficiency).toBeGreaterThan(0);
      expect(outputs.combinedEnergyEfficiency).toBeLessThanOrEqual(1);
      expect(outputs.combinedEnergyEfficiency).toBeGreaterThan(0.5); // Should be reasonably efficient
    });

    test('should show higher efficiency under optimal conditions', () => {
      const optimalInputs: IntegratedSystemInputs = createTestInputs({
        vehicleSpeed: 60, // Optimal speed
        brakePedalPosition: 0.3, // Moderate braking
        batterySOC: 0.4, // Low battery for maximum charging
        motorTemperatures: { frontLeft: 60, frontRight: 60 }, // Optimal temps
        suspensionInputs: createUniformSuspensionInputs({
          compressionVelocity: 0.5, // Optimal velocity
          roadRoughness: 0.2, // Smooth road
          damperTemperature: 20 // Cool temperature
        })
      });

      const suboptimalInputs: IntegratedSystemInputs = createTestInputs({
        vehicleSpeed: 20, // Low speed
        brakePedalPosition: 0.8, // Heavy braking
        batterySOC: 0.9, // High battery
        motorTemperatures: { frontLeft: 120, frontRight: 125 }, // High temps
        suspensionInputs: createUniformSuspensionInputs({
          compressionVelocity: 0.1, // Low velocity
          roadRoughness: 0.8, // Rough road
          damperTemperature: 100 // High temperature
        })
      });

      const optimalOutputs = integratedSystem.calculateIntegratedPerformance(optimalInputs);
      const suboptimalOutputs = integratedSystem.calculateIntegratedPerformance(suboptimalInputs);

      expect(optimalOutputs.combinedEnergyEfficiency).toBeGreaterThan(suboptimalOutputs.combinedEnergyEfficiency);
    });
  });

  describe('System Diagnostics', () => {
    test('should provide comprehensive diagnostics', () => {
      // Run some calculations to generate data
      const inputs = createTestInputs();
      integratedSystem.calculateIntegratedPerformance(inputs);
      integratedSystem.calculateIntegratedPerformance(inputs);

      const diagnostics = integratedSystem.getSystemDiagnostics();

      expect(diagnostics.fuzzyControlDiagnostics).toBeDefined();
      expect(diagnostics.damperDiagnostics).toBeDefined();
      expect(diagnostics.damperDiagnostics.frontLeft).toBeDefined();
      expect(diagnostics.damperDiagnostics.frontRight).toBeDefined();
      expect(diagnostics.damperDiagnostics.rearLeft).toBeDefined();
      expect(diagnostics.damperDiagnostics.rearRight).toBeDefined();
      expect(diagnostics.systemMetrics).toBeDefined();
      expect(diagnostics.systemMetrics.totalSystemEnergy).toBeGreaterThanOrEqual(0);
      expect(diagnostics.systemMetrics.operationTime).toBeGreaterThan(0);
    });

    test('should track energy accumulation over time', () => {
      const inputs = createTestInputs({
        suspensionInputs: createUniformSuspensionInputs({ compressionVelocity: 0.6 })
      });

      // Perform multiple calculations
      integratedSystem.calculateIntegratedPerformance(inputs);
      const diagnostics1 = integratedSystem.getSystemDiagnostics();

      integratedSystem.calculateIntegratedPerformance(inputs);
      integratedSystem.calculateIntegratedPerformance(inputs);
      const diagnostics2 = integratedSystem.getSystemDiagnostics();

      expect(diagnostics2.systemMetrics.totalSystemEnergy).toBeGreaterThan(
        diagnostics1.systemMetrics.totalSystemEnergy
      );
      expect(diagnostics2.systemMetrics.operationTime).toBeGreaterThan(
        diagnostics1.systemMetrics.operationTime
      );
    });

    test('should reset statistics correctly', () => {
      const inputs = createTestInputs();
      
      // Generate some data
      integratedSystem.calculateIntegratedPerformance(inputs);
      integratedSystem.calculateIntegratedPerformance(inputs);

      // Reset statistics
      integratedSystem.resetSystemStatistics();

      const diagnostics = integratedSystem.getSystemDiagnostics();

      expect(diagnostics.systemMetrics.totalSystemEnergy).toBe(0);
      expect(diagnostics.systemMetrics.operationTime).toBe(0);
    });
  });

  describe('Configuration Management', () => {
    test('should update system configuration', () => {
      const newConfig: Partial<HydraulicDamperSystemConfig> = {
        energyManagement: {
          prioritizeBrakingOverDamping: false,
          maxCombinedPower: 12000,
          batteryChargingThreshold: 0.85,
          thermalManagementEnabled: false
        }
      };

      integratedSystem.updateSystemConfiguration(newConfig);

      const diagnostics = integratedSystem.getSystemDiagnostics();
      expect(diagnostics.configuration.energyManagement.maxCombinedPower).toBe(12000);
      expect(diagnostics.configuration.energyManagement.batteryChargingThreshold).toBe(0.85);
    });
  });

  describe('Real-World Scenarios', () => {
    test('should handle city driving scenario', () => {
      const cityDrivingInputs: IntegratedSystemInputs = createTestInputs({
        vehicleSpeed: 35,
        brakePedalPosition: 0.3,
        batterySOC: 0.6,
        suspensionInputs: createUniformSuspensionInputs({
          compressionVelocity: 0.4,
          roadRoughness: 0.5,
          vehicleSpeed: 35
        })
      });

      const outputs = integratedSystem.calculateIntegratedPerformance(cityDrivingInputs);

      expect(outputs.energyBalance.totalGeneratedPower).toBeGreaterThan(0);
      expect(outputs.combinedEnergyEfficiency).toBeGreaterThan(0.3);
    });

    test('should handle highway driving scenario', () => {
      const highwayDrivingInputs: IntegratedSystemInputs = createTestInputs({
        vehicleSpeed: 110,
        brakePedalPosition: 0.1, // Light braking
        batterySOC: 0.7,
        suspensionInputs: createUniformSuspensionInputs({
          compressionVelocity: 0.2, // Smooth highway
          roadRoughness: 0.1,
          vehicleSpeed: 110
        })
      });

      const outputs = integratedSystem.calculateIntegratedPerformance(highwayDrivingInputs);

      expect(outputs.energyBalance.totalGeneratedPower).toBeGreaterThanOrEqual(0);
      // Highway should have less suspension activity but better cooling
    });

    test('should handle rough road scenario', () => {
      const roughRoadInputs: IntegratedSystemInputs = createTestInputs({
        vehicleSpeed: 50,
        brakePedalPosition: 0.2,
        batterySOC: 0.5,
        suspensionInputs: createUniformSuspensionInputs({
          compressionVelocity: 0.8, // High suspension activity
          roadRoughness: 0.9, // Very rough
          vehicleSpeed: 50
        })
      });

      const outputs = integratedSystem.calculateIntegratedPerformance(roughRoadInputs);

      // Rough roads should generate significant damper power
      expect(outputs.totalDamperPower).toBeGreaterThan(500); // Significant damper power
      expect(outputs.energyBalance.damperPower).toBeGreaterThan(
        outputs.energyBalance.regenerativeBrakingPower
      );
    });
  });

  // Helper functions
  function createTestInputs(overrides?: Partial<IntegratedSystemInputs>): IntegratedSystemInputs {
    return {
      vehicleSpeed: 60,
      brakePedalPosition: 0.3,
      acceleratorPedalPosition: 0,
      steeringAngle: 0,
      lateralAcceleration: 0,
      longitudinalAcceleration: -2,
      yawRate: 0,
      roadGradient: 0,
      batterySOC: 0.7,
      batteryVoltage: 400,
      batteryCurrent: 50,
      batteryTemperature: 25,
      motorTemperatures: {
        frontLeft: 60,
        frontRight: 62,
      },
      ambientTemperature: 20,
      roadSurface: 'dry',
      visibility: 'clear',
      suspensionInputs: {
        frontLeft: createDamperInputs(),
        frontRight: createDamperInputs(),
        rearLeft: createDamperInputs(),
        rearRight: createDamperInputs()
      },
      ...overrides
    };
  }

  function createDamperInputs(overrides?: Partial<DamperInputs>): DamperInputs {
    return {
      compressionVelocity: 0.5,
      displacement: 0.05,
      vehicleSpeed: 60,
      roadRoughness: 0.3,
      damperTemperature: 25,
      batterySOC: 0.7,
      loadFactor: 0.5,
      ...overrides
    };
  }

  function createUniformSuspensionInputs(overrides?: Partial<DamperInputs>) {
    const baseInputs = createDamperInputs(overrides);
    return {
      frontLeft: baseInputs,
      frontRight: baseInputs,
      rearLeft: baseInputs,
      rearRight: baseInputs
    };
  }
});