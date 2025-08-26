/**
 * Test Suite for Fuzzy Regenerative Braking Controller
 * 
 * Comprehensive tests for the fuzzy logic control system including
 * membership functions, rule evaluation, and output calculations.
 */

import { 
  FuzzyRegenerativeBrakingController, 
  BrakingInputs, 
  BrakingOutputs 
} from '../FuzzyRegenerativeBrakingController';

describe('FuzzyRegenerativeBrakingController', () => {
  let controller: FuzzyRegenerativeBrakingController;

  beforeEach(() => {
    controller = new FuzzyRegenerativeBrakingController();
  });

  describe('Input Validation', () => {
    test('should accept valid inputs', () => {
      const validInputs: BrakingInputs = {
        drivingSpeed: 60,
        brakingIntensity: 0.5,
        batterySOC: 0.7,
        motorTemperature: 80
      };

      expect(() => controller.calculateOptimalBraking(validInputs)).not.toThrow();
    });

    test('should reject invalid driving speed', () => {
      const invalidInputs: BrakingInputs = {
        drivingSpeed: -10,
        brakingIntensity: 0.5,
        batterySOC: 0.7,
        motorTemperature: 80
      };

      expect(() => controller.calculateOptimalBraking(invalidInputs)).toThrow('Driving speed must be between 0 and 200 km/h');
    });

    test('should reject invalid braking intensity', () => {
      const invalidInputs: BrakingInputs = {
        drivingSpeed: 60,
        brakingIntensity: 1.5,
        batterySOC: 0.7,
        motorTemperature: 80
      };

      expect(() => controller.calculateOptimalBraking(invalidInputs)).toThrow('Braking intensity must be between 0 and 1');
    });

    test('should reject invalid battery SOC', () => {
      const invalidInputs: BrakingInputs = {
        drivingSpeed: 60,
        brakingIntensity: 0.5,
        batterySOC: 1.2,
        motorTemperature: 80
      };

      expect(() => controller.calculateOptimalBraking(invalidInputs)).toThrow('Battery SOC must be between 0 and 1');
    });

    test('should reject invalid motor temperature', () => {
      const invalidInputs: BrakingInputs = {
        drivingSpeed: 60,
        brakingIntensity: 0.5,
        batterySOC: 0.7,
        motorTemperature: 250
      };

      expect(() => controller.calculateOptimalBraking(invalidInputs)).toThrow('Motor temperature must be between -40 and 200°C');
    });
  });

  describe('Fuzzy Logic Calculations', () => {
    test('should calculate optimal braking for high speed, light braking', () => {
      const inputs: BrakingInputs = {
        drivingSpeed: 100,
        brakingIntensity: 0.2,
        batterySOC: 0.3,
        motorTemperature: 60
      };

      const outputs = controller.calculateOptimalBraking(inputs);

      expect(outputs.regenerativeBrakingRatio).toBeGreaterThan(0.7);
      expect(outputs.motorTorque).toBeGreaterThan(0);
      expect(outputs.frontAxleBrakingForce).toBeGreaterThan(0);
    });

    test('should calculate optimal braking for low speed, heavy braking', () => {
      const inputs: BrakingInputs = {
        drivingSpeed: 20,
        brakingIntensity: 0.9,
        batterySOC: 0.7,
        motorTemperature: 70
      };

      const outputs = controller.calculateOptimalBraking(inputs);

      expect(outputs.regenerativeBrakingRatio).toBeLessThan(0.4);
      expect(outputs.motorTorque).toBeGreaterThan(0);
      expect(outputs.frontAxleBrakingForce).toBeGreaterThan(0);
    });

    test('should reduce regeneration when battery SOC is high', () => {
      const lowSOCInputs: BrakingInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0.4,
        batterySOC: 0.2,
        motorTemperature: 60
      };

      const highSOCInputs: BrakingInputs = {
        ...lowSOCInputs,
        batterySOC: 0.95
      };

      const lowSOCOutputs = controller.calculateOptimalBraking(lowSOCInputs);
      const highSOCOutputs = controller.calculateOptimalBraking(highSOCInputs);

      expect(highSOCOutputs.regenerativeBrakingRatio).toBeLessThan(lowSOCOutputs.regenerativeBrakingRatio);
    });

    test('should reduce regeneration when motor temperature is high', () => {
      const normalTempInputs: BrakingInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0.4,
        batterySOC: 0.5,
        motorTemperature: 60
      };

      const highTempInputs: BrakingInputs = {
        ...normalTempInputs,
        motorTemperature: 140
      };

      const normalTempOutputs = controller.calculateOptimalBraking(normalTempInputs);
      const highTempOutputs = controller.calculateOptimalBraking(highTempInputs);

      expect(highTempOutputs.regenerativeBrakingRatio).toBeLessThan(normalTempOutputs.regenerativeBrakingRatio);
      expect(highTempOutputs.motorTorque).toBeLessThan(normalTempOutputs.motorTorque);
    });
  });

  describe('Safety Constraints', () => {
    test('should enforce minimum mechanical braking for heavy braking', () => {
      const inputs: BrakingInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0.9,
        batterySOC: 0.3,
        motorTemperature: 60
      };

      const outputs = controller.calculateOptimalBraking(inputs);

      expect(outputs.regenerativeBrakingRatio).toBeLessThanOrEqual(0.6);
    });

    test('should limit maximum motor torque', () => {
      const inputs: BrakingInputs = {
        drivingSpeed: 120,
        brakingIntensity: 1.0,
        batterySOC: 0.1,
        motorTemperature: 50
      };

      const outputs = controller.calculateOptimalBraking(inputs);

      expect(outputs.motorTorque).toBeLessThanOrEqual(800);
    });

    test('should handle extreme temperature conditions', () => {
      const extremeTempInputs: BrakingInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0.5,
        batterySOC: 0.5,
        motorTemperature: 160
      };

      const outputs = controller.calculateOptimalBraking(extremeTempInputs);

      expect(outputs.regenerativeBrakingRatio).toBeLessThan(0.3);
      expect(outputs.motorTorque).toBeLessThan(400);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero speed', () => {
      const inputs: BrakingInputs = {
        drivingSpeed: 0,
        brakingIntensity: 0.5,
        batterySOC: 0.5,
        motorTemperature: 60
      };

      const outputs = controller.calculateOptimalBraking(inputs);

      expect(outputs.regenerativeBrakingRatio).toBeGreaterThanOrEqual(0);
      expect(outputs.motorTorque).toBeGreaterThanOrEqual(0);
      expect(outputs.frontAxleBrakingForce).toBeGreaterThanOrEqual(0);
    });

    test('should handle maximum speed', () => {
      const inputs: BrakingInputs = {
        drivingSpeed: 200,
        brakingIntensity: 0.3,
        batterySOC: 0.5,
        motorTemperature: 60
      };

      const outputs = controller.calculateOptimalBraking(inputs);

      expect(outputs.regenerativeBrakingRatio).toBeGreaterThanOrEqual(0);
      expect(outputs.motorTorque).toBeGreaterThanOrEqual(0);
      expect(outputs.frontAxleBrakingForce).toBeGreaterThanOrEqual(0);
    });

    test('should handle zero braking intensity', () => {
      const inputs: BrakingInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0,
        batterySOC: 0.5,
        motorTemperature: 60
      };

      const outputs = controller.calculateOptimalBraking(inputs);

      expect(outputs.motorTorque).toBe(0);
      expect(outputs.frontAxleBrakingForce).toBe(0);
    });

    test('should handle full battery', () => {
      const inputs: BrakingInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0.5,
        batterySOC: 1.0,
        motorTemperature: 60
      };

      const outputs = controller.calculateOptimalBraking(inputs);

      expect(outputs.regenerativeBrakingRatio).toBeLessThan(0.2);
    });
  });

  describe('System Status', () => {
    test('should return valid system status', () => {
      const status = controller.getSystemStatus();

      expect(status.isOperational).toBe(true);
      expect(status.activeRules).toBeGreaterThan(0);
      expect(status.lastCalculationTime).toBeGreaterThan(0);
      expect(Array.isArray(status.diagnostics)).toBe(true);
    });
  });

  describe('Performance Characteristics', () => {
    test('should show higher regeneration at medium speeds', () => {
      const lowSpeedInputs: BrakingInputs = {
        drivingSpeed: 20,
        brakingIntensity: 0.4,
        batterySOC: 0.5,
        motorTemperature: 60
      };

      const mediumSpeedInputs: BrakingInputs = {
        drivingSpeed: 60,
        brakingIntensity: 0.4,
        batterySOC: 0.5,
        motorTemperature: 60
      };

      const highSpeedInputs: BrakingInputs = {
        drivingSpeed: 120,
        brakingIntensity: 0.4,
        batterySOC: 0.5,
        motorTemperature: 60
      };

      const lowSpeedOutputs = controller.calculateOptimalBraking(lowSpeedInputs);
      const mediumSpeedOutputs = controller.calculateOptimalBraking(mediumSpeedInputs);
      const highSpeedOutputs = controller.calculateOptimalBraking(highSpeedInputs);

      expect(mediumSpeedOutputs.regenerativeBrakingRatio).toBeGreaterThanOrEqual(lowSpeedOutputs.regenerativeBrakingRatio);
      expect(mediumSpeedOutputs.regenerativeBrakingRatio).toBeGreaterThanOrEqual(highSpeedOutputs.regenerativeBrakingRatio);
    });

    test('should increase motor torque with braking intensity', () => {
      const lightBrakingInputs: BrakingInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0.2,
        batterySOC: 0.5,
        motorTemperature: 60
      };

      const heavyBrakingInputs: BrakingInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0.8,
        batterySOC: 0.5,
        motorTemperature: 60
      };

      const lightBrakingOutputs = controller.calculateOptimalBraking(lightBrakingInputs);
      const heavyBrakingOutputs = controller.calculateOptimalBraking(heavyBrakingInputs);

      expect(heavyBrakingOutputs.motorTorque).toBeGreaterThan(lightBrakingOutputs.motorTorque);
    });
  });

  describe('Consistency Tests', () => {
    test('should produce consistent outputs for identical inputs', () => {
      const inputs: BrakingInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0.5,
        batterySOC: 0.6,
        motorTemperature: 70
      };

      const outputs1 = controller.calculateOptimalBraking(inputs);
      const outputs2 = controller.calculateOptimalBraking(inputs);

      expect(outputs1.regenerativeBrakingRatio).toBe(outputs2.regenerativeBrakingRatio);
      expect(outputs1.motorTorque).toBe(outputs2.motorTorque);
      expect(outputs1.frontAxleBrakingForce).toBe(outputs2.frontAxleBrakingForce);
    });

    test('should show smooth transitions between adjacent input values', () => {
      const baseInputs: BrakingInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0.5,
        batterySOC: 0.6,
        motorTemperature: 70
      };

      const slightlyDifferentInputs: BrakingInputs = {
        ...baseInputs,
        drivingSpeed: 82
      };

      const outputs1 = controller.calculateOptimalBraking(baseInputs);
      const outputs2 = controller.calculateOptimalBraking(slightlyDifferentInputs);

      const ratioDifference = Math.abs(outputs1.regenerativeBrakingRatio - outputs2.regenerativeBrakingRatio);
      const torqueDifference = Math.abs(outputs1.motorTorque - outputs2.motorTorque);

      expect(ratioDifference).toBeLessThan(0.1); // Should not change dramatically
      expect(torqueDifference).toBeLessThan(50); // Should not change dramatically
    });
  });
});