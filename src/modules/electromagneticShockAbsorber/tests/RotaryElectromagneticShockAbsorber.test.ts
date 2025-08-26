/**
 * Test suite for Rotary Electromagnetic Shock Absorber
 */

import { 
  RotaryElectromagneticShockAbsorber,
  SuspensionInputs,
  ShockAbsorberOutputs,
  DampingMode,
  createTestSuspensionInputs,
  validateElectromagneticParameters,
  validateMechanicalParameters,
  defaultElectromagneticParameters,
  defaultMechanicalParameters,
  defaultDampingCharacteristics
} from '../index';

describe('RotaryElectromagneticShockAbsorber', () => {
  let shockAbsorber: RotaryElectromagneticShockAbsorber;

  beforeEach(() => {
    shockAbsorber = new RotaryElectromagneticShockAbsorber();
  });

  describe('Initialization', () => {
    test('should initialize with default parameters', () => {
      const status = shockAbsorber.getSystemStatus();
      expect(status.isOperational).toBe(true);
      expect(status.mode).toBe('adaptive');
      expect(status.flywheelRPM).toBe(0);
      expect(status.operatingTemperature).toBe(25);
    });

    test('should initialize with custom parameters', () => {
      const customElectromagnetic = { ...defaultElectromagneticParameters, poleCount: 16 };
      const customMechanical = { ...defaultMechanicalParameters, gearRatio: 20 };
      
      const customShockAbsorber = new RotaryElectromagneticShockAbsorber(
        customElectromagnetic,
        customMechanical
      );
      
      expect(customShockAbsorber.getSystemStatus().isOperational).toBe(true);
    });
  });

  describe('Parameter Validation', () => {
    test('should validate electromagnetic parameters correctly', () => {
      expect(validateElectromagneticParameters(defaultElectromagneticParameters)).toBe(true);
      
      // Invalid parameters
      expect(validateElectromagneticParameters({
        ...defaultElectromagneticParameters,
        poleCount: 11 // Odd number
      })).toBe(false);
      
      expect(validateElectromagneticParameters({
        ...defaultElectromagneticParameters,
        fluxDensity: 3.0 // Too high
      })).toBe(false);
    });

    test('should validate mechanical parameters correctly', () => {
      expect(validateMechanicalParameters(defaultMechanicalParameters)).toBe(true);
      
      // Invalid parameters
      expect(validateMechanicalParameters({
        ...defaultMechanicalParameters,
        gearRatio: 0.5 // Too low
      })).toBe(false);
      
      expect(validateMechanicalParameters({
        ...defaultMechanicalParameters,
        mechanicalEfficiency: 1.5 // Greater than 1
      })).toBe(false);
    });
  });

  describe('Motion Processing', () => {
    test('should process basic suspension motion', () => {
      const inputs = createTestSuspensionInputs({
        verticalVelocity: 1.0,
        displacement: 0.1,
        cornerLoad: 500,
        vehicleSpeed: 60
      });

      const outputs = shockAbsorber.processMotion(inputs);

      expect(outputs.generatedPower).toBeGreaterThan(0);
      expect(outputs.dampingForce).not.toBe(0);
      expect(outputs.efficiency).toBeGreaterThan(0);
      expect(outputs.efficiency).toBeLessThanOrEqual(1);
      expect(outputs.outputVoltage).toBeGreaterThan(0);
      expect(outputs.outputCurrent).toBeGreaterThan(0);
    });

    test('should handle zero velocity input', () => {
      const inputs = createTestSuspensionInputs({
        verticalVelocity: 0,
        displacement: 0,
        cornerLoad: 500
      });

      const outputs = shockAbsorber.processMotion(inputs);

      expect(outputs.generatedPower).toBe(0);
      expect(outputs.dampingForce).toBe(0);
      expect(outputs.generatorRPM).toBe(0);
    });

    test('should generate more power with higher velocity', () => {
      const lowVelocityInputs = createTestSuspensionInputs({ verticalVelocity: 0.5 });
      const highVelocityInputs = createTestSuspensionInputs({ verticalVelocity: 2.0 });

      const lowVelocityOutputs = shockAbsorber.processMotion(lowVelocityInputs);
      
      // Reset for fair comparison
      shockAbsorber.resetSystem();
      const highVelocityOutputs = shockAbsorber.processMotion(highVelocityInputs);

      expect(highVelocityOutputs.generatedPower).toBeGreaterThan(lowVelocityOutputs.generatedPower);
    });

    test('should respect safety limits', () => {
      const extremeInputs = createTestSuspensionInputs({
        verticalVelocity: 10.0, // Extreme velocity
        displacement: 0.5,      // Extreme displacement
        cornerLoad: 3000        // Extreme load
      });

      expect(() => {
        shockAbsorber.processMotion(extremeInputs);
      }).toThrow();
    });
  });

  describe('Damping Modes', () => {
    test('should switch damping modes correctly', () => {
      const modes: DampingMode[] = ['comfort', 'sport', 'energy_harvesting', 'adaptive'];
      
      modes.forEach(mode => {
        shockAbsorber.setDampingMode(mode);
        expect(shockAbsorber.getSystemStatus().mode).toBe(mode);
      });
    });

    test('should produce different damping forces in different modes', () => {
      const inputs = createTestSuspensionInputs({ verticalVelocity: 1.0 });
      
      shockAbsorber.setDampingMode('comfort');
      const comfortOutputs = shockAbsorber.processMotion(inputs);
      
      shockAbsorber.resetSystem();
      shockAbsorber.setDampingMode('sport');
      const sportOutputs = shockAbsorber.processMotion(inputs);

      expect(Math.abs(sportOutputs.dampingForce)).toBeGreaterThan(Math.abs(comfortOutputs.dampingForce));
    });

    test('should optimize for energy harvesting in energy_harvesting mode', () => {
      const inputs = createTestSuspensionInputs({ verticalVelocity: 1.0 });
      
      shockAbsorber.setDampingMode('comfort');
      const comfortOutputs = shockAbsorber.processMotion(inputs);
      
      shockAbsorber.resetSystem();
      shockAbsorber.setDampingMode('energy_harvesting');
      const energyOutputs = shockAbsorber.processMotion(inputs);

      expect(energyOutputs.generatedPower).toBeGreaterThanOrEqual(comfortOutputs.generatedPower);
    });
  });

  describe('Efficiency Calculations', () => {
    test('should calculate realistic efficiency values', () => {
      const inputs = createTestSuspensionInputs({
        verticalVelocity: 1.0,
        cornerLoad: 500,
        ambientTemperature: 25
      });

      const outputs = shockAbsorber.processMotion(inputs);

      expect(outputs.efficiency).toBeGreaterThan(0.3);
      expect(outputs.efficiency).toBeLessThanOrEqual(0.98);
    });

    test('should reduce efficiency at high temperatures', () => {
      const normalTempInputs = createTestSuspensionInputs({ 
        verticalVelocity: 1.0,
        ambientTemperature: 25 
      });
      
      const highTempInputs = createTestSuspensionInputs({ 
        verticalVelocity: 1.0,
        ambientTemperature: 60 
      });

      const normalOutputs = shockAbsorber.processMotion(normalTempInputs);
      
      shockAbsorber.resetSystem();
      
      // Simulate high temperature operation
      for (let i = 0; i < 100; i++) {
        shockAbsorber.processMotion(highTempInputs);
      }
      
      const highTempOutputs = shockAbsorber.processMotion(highTempInputs);

      expect(highTempOutputs.efficiency).toBeLessThan(normalOutputs.efficiency);
    });
  });

  describe('Road Condition Adaptation', () => {
    test('should adapt to different road conditions', () => {
      const smoothRoadInputs = createTestSuspensionInputs({ 
        roadCondition: 'smooth',
        verticalVelocity: 0.5 
      });
      
      const roughRoadInputs = createTestSuspensionInputs({ 
        roadCondition: 'very_rough',
        verticalVelocity: 0.5 
      });

      const smoothOutputs = shockAbsorber.processMotion(smoothRoadInputs);
      
      shockAbsorber.resetSystem();
      const roughOutputs = shockAbsorber.processMotion(roughRoadInputs);

      // Rough roads should generate more power due to higher energy input
      expect(roughOutputs.generatedPower).toBeGreaterThan(smoothOutputs.generatedPower);
    });
  });

  describe('System Status and Diagnostics', () => {
    test('should provide accurate system status', () => {
      const status = shockAbsorber.getSystemStatus();

      expect(status).toHaveProperty('mode');
      expect(status).toHaveProperty('flywheelRPM');
      expect(status).toHaveProperty('operatingTemperature');
      expect(status).toHaveProperty('accumulatedEnergy');
      expect(status).toHaveProperty('isOperational');
    });

    test('should detect system faults', () => {
      // Simulate extreme conditions that should trigger fault detection
      const extremeInputs = createTestSuspensionInputs({
        verticalVelocity: 2.0,
        ambientTemperature: 80
      });

      // Run for extended period to heat up system
      for (let i = 0; i < 1000; i++) {
        shockAbsorber.processMotion(extremeInputs);
      }

      const status = shockAbsorber.getSystemStatus();
      
      // System should still be operational but may have reduced performance
      expect(typeof status.isOperational).toBe('boolean');
      expect(status.operatingTemperature).toBeGreaterThan(25);
    });
  });

  describe('Reset Functionality', () => {
    test('should reset system state correctly', () => {
      // Run system to change state
      const inputs = createTestSuspensionInputs({ verticalVelocity: 2.0 });
      for (let i = 0; i < 10; i++) {
        shockAbsorber.processMotion(inputs);
      }

      const statusBeforeReset = shockAbsorber.getSystemStatus();
      
      shockAbsorber.resetSystem();
      
      const statusAfterReset = shockAbsorber.getSystemStatus();

      expect(statusAfterReset.flywheelRPM).toBe(0);
      expect(statusAfterReset.accumulatedEnergy).toBe(0);
      expect(statusAfterReset.operatingTemperature).toBe(25);
      expect(statusAfterReset.mode).toBe('adaptive');
    });
  });

  describe('Performance Benchmarks', () => {
    test('should meet minimum power generation requirements', () => {
      const inputs = createTestSuspensionInputs({
        verticalVelocity: 2.0,
        cornerLoad: 500,
        roadCondition: 'rough',
        vehicleSpeed: 60
      });

      shockAbsorber.setDampingMode('energy_harvesting');
      const outputs = shockAbsorber.processMotion(inputs);

      // Should generate at least 50W under optimal conditions
      expect(outputs.generatedPower).toBeGreaterThan(50);
    });

    test('should maintain efficiency above 70% under normal conditions', () => {
      const inputs = createTestSuspensionInputs({
        verticalVelocity: 1.0,
        cornerLoad: 500,
        ambientTemperature: 25,
        roadCondition: 'rough'
      });

      const outputs = shockAbsorber.processMotion(inputs);

      expect(outputs.efficiency).toBeGreaterThan(0.7);
    });

    test('should respond quickly to input changes', () => {
      const lowVelocityInputs = createTestSuspensionInputs({ verticalVelocity: 0.1 });
      const highVelocityInputs = createTestSuspensionInputs({ verticalVelocity: 2.0 });

      const lowOutputs = shockAbsorber.processMotion(lowVelocityInputs);
      const highOutputs = shockAbsorber.processMotion(highVelocityInputs);

      // System should respond immediately to velocity changes
      expect(highOutputs.generatedPower).toBeGreaterThan(lowOutputs.generatedPower * 5);
    });
  });

  describe('Energy Accumulation', () => {
    test('should accumulate energy over time', () => {
      const inputs = createTestSuspensionInputs({ verticalVelocity: 1.0 });

      const initialStatus = shockAbsorber.getSystemStatus();
      
      // Run for multiple cycles
      for (let i = 0; i < 100; i++) {
        shockAbsorber.processMotion(inputs);
      }

      const finalStatus = shockAbsorber.getSystemStatus();

      expect(finalStatus.accumulatedEnergy).toBeGreaterThan(initialStatus.accumulatedEnergy);
    });
  });
});