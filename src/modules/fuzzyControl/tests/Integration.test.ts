/**
 * Test Suite for Fuzzy Control Integration System
 * 
 * Integration tests for the complete fuzzy control system including
 * environmental adaptation, safety constraints, and system coordination.
 */

import { 
  FuzzyControlIntegration,
  SystemInputs,
  SystemOutputs,
  SafetyLimits
} from '../FuzzyControlIntegration';
import { VehicleParameters } from '../RegenerativeBrakingTorqueModel';
import { createTestInputs, defaultVehicleParameters } from '../index';

describe('FuzzyControlIntegration', () => {
  let integrationSystem: FuzzyControlIntegration;
  let vehicleParams: VehicleParameters;
  let safetyLimits: SafetyLimits;

  beforeEach(() => {
    vehicleParams = { ...defaultVehicleParameters };
    safetyLimits = {
      maxRegenerativeBrakingRatio: 0.8,
      maxMotorTorque: 400,
      maxMotorTemperature: 150,
      maxBatteryChargeCurrent: 200,
      minMechanicalBrakingRatio: 0.2
    };
    integrationSystem = new FuzzyControlIntegration(vehicleParams, safetyLimits);
  });

  describe('System Initialization', () => {
    test('should initialize with default parameters', () => {
      const system = new FuzzyControlIntegration(vehicleParams);
      const diagnostics = system.getSystemDiagnostics();
      
      expect(diagnostics.fuzzyControllerStatus.isOperational).toBe(true);
      expect(diagnostics.torqueModelStatus.systemHealth).toBe('Operational');
      expect(diagnostics.systemFaults).toHaveLength(0);
    });

    test('should initialize with custom safety limits', () => {
      const customLimits: SafetyLimits = {
        maxRegenerativeBrakingRatio: 0.6,
        maxMotorTorque: 300,
        maxMotorTemperature: 120,
        maxBatteryChargeCurrent: 150,
        minMechanicalBrakingRatio: 0.3
      };

      const system = new FuzzyControlIntegration(vehicleParams, customLimits);
      expect(system).toBeDefined();
    });
  });

  describe('Control Cycle Processing', () => {
    test('should process normal control cycle', () => {
      const inputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.5,
        batterySOC: 0.6
      });

      const outputs = integrationSystem.processControlCycle(inputs);

      expect(outputs.systemStatus).toBe('normal');
      expect(outputs.motorTorques.frontLeft).toBeGreaterThan(0);
      expect(outputs.motorTorques.frontRight).toBeGreaterThan(0);
      expect(outputs.mechanicalBrakingForce).toBeGreaterThan(0);
      expect(outputs.regeneratedPower).toBeGreaterThan(0);
      expect(outputs.energyRecoveryEfficiency).toBeGreaterThan(0);
    });

    test('should handle emergency braking scenario', () => {
      const inputs = createTestInputs({
        vehicleSpeed: 100,
        brakePedalPosition: 1.0, // Full braking
        batterySOC: 0.5
      });

      const outputs = integrationSystem.processControlCycle(inputs);

      expect(outputs.systemStatus).toBe('normal');
      expect(outputs.mechanicalBrakingForce).toBeGreaterThan(outputs.regeneratedPower / 20); // Significant mechanical braking
      expect(outputs.regenerativeBrakingRatio).toBeLessThan(0.7); // Limited regen in emergency
    });

    test('should handle low speed braking', () => {
      const inputs = createTestInputs({
        vehicleSpeed: 15,
        brakePedalPosition: 0.4,
        batterySOC: 0.5
      });

      const outputs = integrationSystem.processControlCycle(inputs);

      expect(outputs.systemStatus).toBe('normal');
      expect(outputs.regenerativeBrakingRatio).toBeLessThan(0.6); // Lower efficiency at low speeds
    });

    test('should handle high speed braking', () => {
      const inputs = createTestInputs({
        vehicleSpeed: 150,
        brakePedalPosition: 0.6,
        batterySOC: 0.4
      });

      const outputs = integrationSystem.processControlCycle(inputs);

      expect(outputs.systemStatus).toBe('normal');
      expect(outputs.motorTorques.frontLeft).toBeLessThan(safetyLimits.maxMotorTorque);
      expect(outputs.motorTorques.frontRight).toBeLessThan(safetyLimits.maxMotorTorque);
    });
  });

  describe('Environmental Adaptations', () => {
    test('should reduce regeneration on wet roads', () => {
      const dryInputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.5,
        roadSurface: 'dry'
      });

      const wetInputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.5,
        roadSurface: 'wet'
      });

      const dryOutputs = integrationSystem.processControlCycle(dryInputs);
      const wetOutputs = integrationSystem.processControlCycle(wetInputs);

      expect(wetOutputs.regenerativeBrakingRatio).toBeLessThan(dryOutputs.regenerativeBrakingRatio);
    });

    test('should significantly reduce regeneration on ice', () => {
      const dryInputs = createTestInputs({
        vehicleSpeed: 60,
        brakePedalPosition: 0.4,
        roadSurface: 'dry'
      });

      const iceInputs = createTestInputs({
        vehicleSpeed: 60,
        brakePedalPosition: 0.4,
        roadSurface: 'ice'
      });

      const dryOutputs = integrationSystem.processControlCycle(dryInputs);
      const iceOutputs = integrationSystem.processControlCycle(iceInputs);

      expect(iceOutputs.regenerativeBrakingRatio).toBeLessThan(dryOutputs.regenerativeBrakingRatio * 0.6);
    });

    test('should adapt to extreme temperatures', () => {
      const normalTempInputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.5,
        ambientTemperature: 20
      });

      const coldInputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.5,
        ambientTemperature: -20
      });

      const hotInputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.5,
        ambientTemperature: 45
      });

      const normalOutputs = integrationSystem.processControlCycle(normalTempInputs);
      const coldOutputs = integrationSystem.processControlCycle(coldInputs);
      const hotOutputs = integrationSystem.processControlCycle(hotInputs);

      expect(coldOutputs.regenerativeBrakingRatio).toBeLessThan(normalOutputs.regenerativeBrakingRatio);
      expect(hotOutputs.regenerativeBrakingRatio).toBeLessThan(normalOutputs.regenerativeBrakingRatio);
    });

    test('should handle poor visibility conditions', () => {
      const clearInputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.5,
        visibility: 'clear'
      });

      const fogInputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.5,
        visibility: 'fog'
      });

      const clearOutputs = integrationSystem.processControlCycle(clearInputs);
      const fogOutputs = integrationSystem.processControlCycle(fogInputs);

      expect(fogOutputs.regenerativeBrakingRatio).toBeLessThan(clearOutputs.regenerativeBrakingRatio);
    });
  });

  describe('Safety Constraints', () => {
    test('should enforce maximum motor torque limits', () => {
      const inputs = createTestInputs({
        vehicleSpeed: 120,
        brakePedalPosition: 1.0, // Maximum braking
        batterySOC: 0.2 // Low SOC to encourage regeneration
      });

      const outputs = integrationSystem.processControlCycle(inputs);

      expect(outputs.motorTorques.frontLeft).toBeLessThanOrEqual(safetyLimits.maxMotorTorque);
      expect(outputs.motorTorques.frontRight).toBeLessThanOrEqual(safetyLimits.maxMotorTorque);
    });

    test('should enforce minimum mechanical braking in emergency', () => {
      const inputs = createTestInputs({
        vehicleSpeed: 100,
        brakePedalPosition: 0.95, // Near-emergency braking
        batterySOC: 0.3
      });

      const outputs = integrationSystem.processControlCycle(inputs);

      const totalBrakingForce = outputs.performanceMetrics.totalBrakingForce;
      const mechanicalRatio = outputs.mechanicalBrakingForce / totalBrakingForce;

      expect(mechanicalRatio).toBeGreaterThanOrEqual(safetyLimits.minMechanicalBrakingRatio);
    });

    test('should handle high motor temperatures', () => {
      const inputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.6,
        motorTemperatures: {
          frontLeft: 145, // Near thermal limit
          frontRight: 145
        }
      });

      const outputs = integrationSystem.processControlCycle(inputs);

      expect(outputs.systemStatus).toBe('degraded');
      expect(outputs.activeWarnings).toContain('High motor temperature');
      expect(outputs.performanceMetrics.thermalStatus).toBe('hot');
    });

    test('should limit regeneration when battery is nearly full', () => {
      const lowSOCInputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.5,
        batterySOC: 0.3
      });

      const highSOCInputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.5,
        batterySOC: 0.97
      });

      const lowSOCOutputs = integrationSystem.processControlCycle(lowSOCInputs);
      const highSOCOutputs = integrationSystem.processControlCycle(highSOCInputs);

      expect(highSOCOutputs.regenerativeBrakingRatio).toBeLessThan(lowSOCOutputs.regenerativeBrakingRatio);
      expect(highSOCOutputs.activeWarnings).toContain('Battery nearly full - reduced regeneration');
    });
  });

  describe('Vehicle Stability Control', () => {
    test('should adjust torque distribution during cornering', () => {
      const straightInputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.5,
        lateralAcceleration: 0,
        yawRate: 0
      });

      const corneringInputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.5,
        lateralAcceleration: 4.0, // Right turn
        yawRate: 0.3
      });

      const straightOutputs = integrationSystem.processControlCycle(straightInputs);
      const corneringOutputs = integrationSystem.processControlCycle(corneringInputs);

      // During right turn, right side torque should be reduced
      expect(corneringOutputs.motorTorques.frontRight).toBeLessThan(straightOutputs.motorTorques.frontRight);
      expect(corneringOutputs.motorTorques.frontLeft).toBeGreaterThanOrEqual(corneringOutputs.motorTorques.frontRight);
    });

    test('should handle left turn stability', () => {
      const inputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.5,
        lateralAcceleration: -3.5, // Left turn
        yawRate: -0.25
      });

      const outputs = integrationSystem.processControlCycle(inputs);

      // During left turn, left side torque should be reduced
      expect(outputs.motorTorques.frontLeft).toBeLessThan(outputs.motorTorques.frontRight);
    });
  });

  describe('Input Validation', () => {
    test('should handle invalid vehicle speed', () => {
      const inputs = createTestInputs({
        vehicleSpeed: -10 // Invalid negative speed
      });

      const outputs = integrationSystem.processControlCycle(inputs);

      expect(outputs.systemStatus).toBe('fault');
      expect(outputs.activeWarnings).toContain('input_validation');
      expect(outputs.motorTorques.frontLeft).toBe(0);
      expect(outputs.motorTorques.frontRight).toBe(0);
    });

    test('should handle invalid brake pedal position', () => {
      const inputs = createTestInputs({
        brakePedalPosition: 1.5 // Invalid > 1.0
      });

      const outputs = integrationSystem.processControlCycle(inputs);

      expect(outputs.systemStatus).toBe('fault');
      expect(outputs.activeWarnings).toContain('input_validation');
    });

    test('should handle invalid battery SOC', () => {
      const inputs = createTestInputs({
        batterySOC: -0.1 // Invalid negative SOC
      });

      const outputs = integrationSystem.processControlCycle(inputs);

      expect(outputs.systemStatus).toBe('fault');
      expect(outputs.activeWarnings).toContain('input_validation');
    });
  });

  describe('Performance Monitoring', () => {
    test('should track performance metrics', () => {
      const inputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.5,
        batterySOC: 0.6
      });

      // Process multiple cycles
      for (let i = 0; i < 5; i++) {
        integrationSystem.processControlCycle(inputs);
      }

      const diagnostics = integrationSystem.getSystemDiagnostics();

      expect(diagnostics.performanceHistory.length).toBe(5);
      expect(diagnostics.averageEfficiency).toBeGreaterThan(0);
      expect(diagnostics.averageEfficiency).toBeLessThanOrEqual(1);
    });

    test('should limit performance history size', () => {
      const inputs = createTestInputs();

      // Process more than 100 cycles
      for (let i = 0; i < 150; i++) {
        integrationSystem.processControlCycle(inputs);
      }

      const diagnostics = integrationSystem.getSystemDiagnostics();

      expect(diagnostics.performanceHistory.length).toBeLessThanOrEqual(100);
    });
  });

  describe('System Diagnostics', () => {
    test('should provide comprehensive diagnostics', () => {
      const diagnostics = integrationSystem.getSystemDiagnostics();

      expect(diagnostics.fuzzyControllerStatus).toBeDefined();
      expect(diagnostics.torqueModelStatus).toBeDefined();
      expect(Array.isArray(diagnostics.systemFaults)).toBe(true);
      expect(Array.isArray(diagnostics.performanceHistory)).toBe(true);
      expect(typeof diagnostics.averageEfficiency).toBe('number');
    });

    test('should track system faults', () => {
      // Trigger a fault with invalid input
      const invalidInputs = createTestInputs({
        vehicleSpeed: 500 // Invalid speed
      });

      integrationSystem.processControlCycle(invalidInputs);
      const diagnostics = integrationSystem.getSystemDiagnostics();

      expect(diagnostics.systemFaults).toContain('input_validation');
    });

    test('should allow fault reset', () => {
      // Trigger a fault
      const invalidInputs = createTestInputs({
        brakePedalPosition: 2.0
      });

      integrationSystem.processControlCycle(invalidInputs);
      let diagnostics = integrationSystem.getSystemDiagnostics();
      expect(diagnostics.systemFaults.length).toBeGreaterThan(0);

      // Reset faults
      integrationSystem.resetSystemFaults();
      diagnostics = integrationSystem.getSystemDiagnostics();
      expect(diagnostics.systemFaults.length).toBe(0);
    });
  });

  describe('Safety Limits Updates', () => {
    test('should allow safety limits updates', () => {
      const newLimits: Partial<SafetyLimits> = {
        maxMotorTorque: 300,
        maxMotorTemperature: 130
      };

      integrationSystem.updateSafetyLimits(newLimits);

      const inputs = createTestInputs({
        vehicleSpeed: 100,
        brakePedalPosition: 1.0
      });

      const outputs = integrationSystem.processControlCycle(inputs);

      expect(outputs.motorTorques.frontLeft).toBeLessThanOrEqual(300);
      expect(outputs.motorTorques.frontRight).toBeLessThanOrEqual(300);
    });
  });

  describe('Failsafe Operation', () => {
    test('should enter failsafe mode on critical error', () => {
      // Simulate a critical system error by providing extremely invalid inputs
      const criticalErrorInputs = createTestInputs({
        vehicleSpeed: NaN,
        brakePedalPosition: 0.8
      });

      const outputs = integrationSystem.processControlCycle(criticalErrorInputs);

      expect(outputs.systemStatus).toBe('fault');
      expect(outputs.motorTorques.frontLeft).toBe(0);
      expect(outputs.motorTorques.frontRight).toBe(0);
      expect(outputs.mechanicalBrakingForce).toBeGreaterThan(0); // Full mechanical braking
      expect(outputs.regenerativeBrakingRatio).toBe(0);
      expect(outputs.activeWarnings).toContain('System fault - failsafe mode active');
    });
  });

  describe('Four-Motor Configuration', () => {
    test('should handle four-motor vehicle configuration', () => {
      const fourMotorParams = { ...vehicleParams, motorCount: 4 };
      const fourMotorSystem = new FuzzyControlIntegration(fourMotorParams, safetyLimits);

      const inputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.6,
        motorTemperatures: {
          frontLeft: 70,
          frontRight: 72,
          rearLeft: 68,
          rearRight: 71
        }
      });

      const outputs = fourMotorSystem.processControlCycle(inputs);

      expect(outputs.motorTorques.frontLeft).toBeGreaterThan(0);
      expect(outputs.motorTorques.frontRight).toBeGreaterThan(0);
      expect(outputs.motorTorques.rearLeft).toBeGreaterThan(0);
      expect(outputs.motorTorques.rearRight).toBeGreaterThan(0);
    });
  });
});