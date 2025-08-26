/**
 * Test Suite for Hydraulic Electromagnetic Regenerative Damper
 * 
 * Comprehensive tests for the hydraulic electromagnetic regenerative damper system
 * including energy generation, damping performance, and safety constraints.
 */

import { 
  HydraulicElectromagneticRegenerativeDamper,
  DamperInputs,
  DamperOutputs,
  DamperConfiguration,
  DamperConstraints
} from '../HydraulicElectromagneticRegenerativeDamper';

describe('HydraulicElectromagneticRegenerativeDamper', () => {
  let damper: HydraulicElectromagneticRegenerativeDamper;

  beforeEach(() => {
    damper = new HydraulicElectromagneticRegenerativeDamper();
  });

  describe('Input Validation', () => {
    test('should accept valid inputs', () => {
      const validInputs: DamperInputs = {
        compressionVelocity: 0.5,
        displacement: 0.05,
        vehicleSpeed: 60,
        roadRoughness: 0.3,
        damperTemperature: 25,
        batterySOC: 0.7,
        loadFactor: 0.5
      };

      expect(() => damper.calculateDamperPerformance(validInputs)).not.toThrow();
    });

    test('should reject excessive compression velocity', () => {
      const invalidInputs: DamperInputs = {
        compressionVelocity: 5.0, // Exceeds maximum
        displacement: 0.05,
        vehicleSpeed: 60,
        roadRoughness: 0.3,
        damperTemperature: 25,
        batterySOC: 0.7,
        loadFactor: 0.5
      };

      expect(() => damper.calculateDamperPerformance(invalidInputs))
        .toThrow('Compression velocity 5 exceeds maximum allowed velocity');
    });

    test('should reject excessive displacement', () => {
      const invalidInputs: DamperInputs = {
        compressionVelocity: 0.5,
        displacement: 0.25, // Exceeds maximum
        vehicleSpeed: 60,
        roadRoughness: 0.3,
        damperTemperature: 25,
        batterySOC: 0.7,
        loadFactor: 0.5
      };

      expect(() => damper.calculateDamperPerformance(invalidInputs))
        .toThrow('Displacement 0.25 is outside allowed range');
    });

    test('should reject invalid vehicle speed', () => {
      const invalidInputs: DamperInputs = {
        compressionVelocity: 0.5,
        displacement: 0.05,
        vehicleSpeed: -10, // Negative speed
        roadRoughness: 0.3,
        damperTemperature: 25,
        batterySOC: 0.7,
        loadFactor: 0.5
      };

      expect(() => damper.calculateDamperPerformance(invalidInputs))
        .toThrow('Vehicle speed must be between 0 and 300 km/h');
    });

    test('should reject invalid road roughness', () => {
      const invalidInputs: DamperInputs = {
        compressionVelocity: 0.5,
        displacement: 0.05,
        vehicleSpeed: 60,
        roadRoughness: 1.5, // Exceeds maximum
        damperTemperature: 25,
        batterySOC: 0.7,
        loadFactor: 0.5
      };

      expect(() => damper.calculateDamperPerformance(invalidInputs))
        .toThrow('Road roughness must be between 0 and 1');
    });

    test('should reject invalid battery SOC', () => {
      const invalidInputs: DamperInputs = {
        compressionVelocity: 0.5,
        displacement: 0.05,
        vehicleSpeed: 60,
        roadRoughness: 0.3,
        damperTemperature: 25,
        batterySOC: 1.2, // Exceeds maximum
        loadFactor: 0.5
      };

      expect(() => damper.calculateDamperPerformance(invalidInputs))
        .toThrow('Battery SOC must be between 0 and 1');
    });

    test('should reject extreme temperatures', () => {
      const invalidInputs: DamperInputs = {
        compressionVelocity: 0.5,
        displacement: 0.05,
        vehicleSpeed: 60,
        roadRoughness: 0.3,
        damperTemperature: 250, // Exceeds maximum
        batterySOC: 0.7,
        loadFactor: 0.5
      };

      expect(() => damper.calculateDamperPerformance(invalidInputs))
        .toThrow('Damper temperature must be between -40 and 200°C');
    });
  });

  describe('Energy Generation Capabilities', () => {
    test('should generate power during compression', () => {
      const inputs: DamperInputs = {
        compressionVelocity: 1.0, // High compression velocity
        displacement: 0.08,
        vehicleSpeed: 80,
        roadRoughness: 0.5,
        damperTemperature: 30,
        batterySOC: 0.5,
        loadFactor: 0.7
      };

      const outputs = damper.calculateDamperPerformance(inputs);

      expect(outputs.generatedPower).toBeGreaterThan(0);
      expect(outputs.harvestedEnergy).toBeGreaterThan(0);
      expect(outputs.energyEfficiency).toBeGreaterThan(0);
      expect(outputs.energyEfficiency).toBeLessThanOrEqual(1);
    });

    test('should generate power during extension', () => {
      const inputs: DamperInputs = {
        compressionVelocity: -0.8, // Extension velocity
        displacement: -0.06,
        vehicleSpeed: 60,
        roadRoughness: 0.4,
        damperTemperature: 25,
        batterySOC: 0.6,
        loadFactor: 0.5
      };

      const outputs = damper.calculateDamperPerformance(inputs);

      expect(outputs.generatedPower).toBeGreaterThan(0);
      expect(outputs.electromagneticForce).toBeGreaterThan(0);
    });

    test('should achieve target energy recovery efficiency', () => {
      const inputs: DamperInputs = {
        compressionVelocity: 0.5, // Optimal velocity
        displacement: 0.05,
        vehicleSpeed: 60,
        roadRoughness: 0.2, // Smooth road
        damperTemperature: 20, // Optimal temperature
        batterySOC: 0.3, // Low battery for maximum charging
        loadFactor: 0.5
      };

      const outputs = damper.calculateDamperPerformance(inputs);

      // Should achieve high efficiency under optimal conditions
      expect(outputs.energyEfficiency).toBeGreaterThan(0.7);
      expect(outputs.generatedPower).toBeGreaterThan(100); // Minimum 100W
    });

    test('should scale power with velocity', () => {
      const baseInputs: DamperInputs = {
        compressionVelocity: 0.3,
        displacement: 0.05,
        vehicleSpeed: 60,
        roadRoughness: 0.3,
        damperTemperature: 25,
        batterySOC: 0.5,
        loadFactor: 0.5
      };

      const highVelocityInputs: DamperInputs = {
        ...baseInputs,
        compressionVelocity: 1.0
      };

      const lowVelocityOutputs = damper.calculateDamperPerformance(baseInputs);
      const highVelocityOutputs = damper.calculateDamperPerformance(highVelocityInputs);

      expect(highVelocityOutputs.generatedPower).toBeGreaterThan(lowVelocityOutputs.generatedPower);
      expect(highVelocityOutputs.electromagneticForce).toBeGreaterThan(lowVelocityOutputs.electromagneticForce);
    });
  });

  describe('Damping Performance', () => {
    test('should provide appropriate damping force', () => {
      const inputs: DamperInputs = {
        compressionVelocity: 0.8,
        displacement: 0.1,
        vehicleSpeed: 70,
        roadRoughness: 0.6,
        damperTemperature: 35,
        batterySOC: 0.7,
        loadFactor: 0.8
      };

      const outputs = damper.calculateDamperPerformance(inputs);

      expect(outputs.dampingForce).toBeGreaterThan(0);
      expect(outputs.dampingForce).toBeLessThanOrEqual(8000); // Within maximum limit
      expect(outputs.hydraulicPressure).toBeGreaterThan(0);
    });

    test('should increase damping force with load factor', () => {
      const lightLoadInputs: DamperInputs = {
        compressionVelocity: 0.6,
        displacement: 0.05,
        vehicleSpeed: 60,
        roadRoughness: 0.3,
        damperTemperature: 25,
        batterySOC: 0.5,
        loadFactor: 0.2 // Light load
      };

      const heavyLoadInputs: DamperInputs = {
        ...lightLoadInputs,
        loadFactor: 0.9 // Heavy load
      };

      const lightLoadOutputs = damper.calculateDamperPerformance(lightLoadInputs);
      const heavyLoadOutputs = damper.calculateDamperPerformance(heavyLoadInputs);

      expect(heavyLoadOutputs.dampingForce).toBeGreaterThan(lightLoadOutputs.dampingForce);
    });

    test('should adjust damping for road roughness', () => {
      const smoothRoadInputs: DamperInputs = {
        compressionVelocity: 0.5,
        displacement: 0.05,
        vehicleSpeed: 60,
        roadRoughness: 0.1, // Smooth road
        damperTemperature: 25,
        batterySOC: 0.5,
        loadFactor: 0.5
      };

      const roughRoadInputs: DamperInputs = {
        ...smoothRoadInputs,
        roadRoughness: 0.9 // Very rough road
      };

      const smoothRoadOutputs = damper.calculateDamperPerformance(smoothRoadInputs);
      const roughRoadOutputs = damper.calculateDamperPerformance(roughRoadInputs);

      expect(roughRoadOutputs.dampingForce).toBeGreaterThan(smoothRoadOutputs.dampingForce);
    });
  });

  describe('Battery SOC Impact', () => {
    test('should reduce power generation when battery is full', () => {
      const lowSOCInputs: DamperInputs = {
        compressionVelocity: 0.8,
        displacement: 0.06,
        vehicleSpeed: 60,
        roadRoughness: 0.3,
        damperTemperature: 25,
        batterySOC: 0.2, // Low battery
        loadFactor: 0.5
      };

      const highSOCInputs: DamperInputs = {
        ...lowSOCInputs,
        batterySOC: 0.95 // Nearly full battery
      };

      const lowSOCOutputs = damper.calculateDamperPerformance(lowSOCInputs);
      const highSOCOutputs = damper.calculateDamperPerformance(highSOCInputs);

      expect(highSOCOutputs.generatedPower).toBeLessThan(lowSOCOutputs.generatedPower);
    });

    test('should maintain damping performance regardless of battery SOC', () => {
      const lowSOCInputs: DamperInputs = {
        compressionVelocity: 0.6,
        displacement: 0.05,
        vehicleSpeed: 60,
        roadRoughness: 0.3,
        damperTemperature: 25,
        batterySOC: 0.1,
        loadFactor: 0.5
      };

      const highSOCInputs: DamperInputs = {
        ...lowSOCInputs,
        batterySOC: 0.9
      };

      const lowSOCOutputs = damper.calculateDamperPerformance(lowSOCInputs);
      const highSOCOutputs = damper.calculateDamperPerformance(highSOCInputs);

      // Damping force should be similar regardless of battery SOC
      const forceDifference = Math.abs(highSOCOutputs.dampingForce - lowSOCOutputs.dampingForce);
      expect(forceDifference).toBeLessThan(lowSOCOutputs.dampingForce * 0.1); // Within 10%
    });
  });

  describe('Thermal Management', () => {
    test('should calculate system temperature rise', () => {
      const inputs: DamperInputs = {
        compressionVelocity: 1.2,
        displacement: 0.08,
        vehicleSpeed: 40, // Low speed, less cooling
        roadRoughness: 0.7,
        damperTemperature: 30,
        batterySOC: 0.5,
        loadFactor: 0.8
      };

      const outputs = damper.calculateDamperPerformance(inputs);

      expect(outputs.systemTemperature).toBeGreaterThan(inputs.damperTemperature);
    });

    test('should apply thermal derating at high temperatures', () => {
      const normalTempInputs: DamperInputs = {
        compressionVelocity: 0.8,
        displacement: 0.06,
        vehicleSpeed: 60,
        roadRoughness: 0.3,
        damperTemperature: 25, // Normal temperature
        batterySOC: 0.5,
        loadFactor: 0.5
      };

      const highTempInputs: DamperInputs = {
        ...normalTempInputs,
        damperTemperature: 110 // High temperature
      };

      const normalTempOutputs = damper.calculateDamperPerformance(normalTempInputs);
      const highTempOutputs = damper.calculateDamperPerformance(highTempInputs);

      expect(highTempOutputs.generatedPower).toBeLessThan(normalTempOutputs.generatedPower);
    });

    test('should provide thermal protection at extreme temperatures', () => {
      const extremeTempInputs: DamperInputs = {
        compressionVelocity: 1.0,
        displacement: 0.08,
        vehicleSpeed: 60,
        roadRoughness: 0.3,
        damperTemperature: 130, // Extreme temperature
        batterySOC: 0.5,
        loadFactor: 0.5
      };

      const outputs = damper.calculateDamperPerformance(extremeTempInputs);

      // Should significantly reduce power generation for thermal protection
      expect(outputs.generatedPower).toBeLessThan(200); // Reduced power
    });

    test('should improve cooling at high vehicle speeds', () => {
      const lowSpeedInputs: DamperInputs = {
        compressionVelocity: 0.8,
        displacement: 0.06,
        vehicleSpeed: 20, // Low speed
        roadRoughness: 0.3,
        damperTemperature: 40,
        batterySOC: 0.5,
        loadFactor: 0.5
      };

      const highSpeedInputs: DamperInputs = {
        ...lowSpeedInputs,
        vehicleSpeed: 120 // High speed for better cooling
      };

      const lowSpeedOutputs = damper.calculateDamperPerformance(lowSpeedInputs);
      const highSpeedOutputs = damper.calculateDamperPerformance(highSpeedInputs);

      // High speed should result in better cooling (lower temperature rise)
      const lowSpeedTempRise = lowSpeedOutputs.systemTemperature - lowSpeedInputs.damperTemperature;
      const highSpeedTempRise = highSpeedOutputs.systemTemperature - highSpeedInputs.damperTemperature;

      expect(highSpeedTempRise).toBeLessThan(lowSpeedTempRise);
    });
  });

  describe('Safety Constraints', () => {
    test('should enforce maximum power output limits', () => {
      const highPowerInputs: DamperInputs = {
        compressionVelocity: 2.0, // Maximum velocity
        displacement: 0.1,
        vehicleSpeed: 100,
        roadRoughness: 0.8,
        damperTemperature: 20,
        batterySOC: 0.1, // Low battery for maximum charging
        loadFactor: 1.0
      };

      const outputs = damper.calculateDamperPerformance(highPowerInputs);

      expect(outputs.generatedPower).toBeLessThanOrEqual(1500); // Maximum power limit
    });

    test('should enforce maximum damping force limits', () => {
      const highForceInputs: DamperInputs = {
        compressionVelocity: 1.8,
        displacement: 0.12,
        vehicleSpeed: 60,
        roadRoughness: 1.0,
        damperTemperature: 25,
        batterySOC: 0.5,
        loadFactor: 1.0
      };

      const outputs = damper.calculateDamperPerformance(highForceInputs);

      expect(outputs.dampingForce).toBeLessThanOrEqual(8000); // Maximum damping force
      expect(outputs.electromagneticForce).toBeLessThanOrEqual(2000); // Maximum electromagnetic force
    });

    test('should ensure non-negative outputs', () => {
      const zeroVelocityInputs: DamperInputs = {
        compressionVelocity: 0, // No movement
        displacement: 0,
        vehicleSpeed: 60,
        roadRoughness: 0.3,
        damperTemperature: 25,
        batterySOC: 0.5,
        loadFactor: 0.5
      };

      const outputs = damper.calculateDamperPerformance(zeroVelocityInputs);

      expect(outputs.generatedPower).toBeGreaterThanOrEqual(0);
      expect(outputs.harvestedEnergy).toBeGreaterThanOrEqual(0);
      expect(outputs.energyEfficiency).toBeGreaterThanOrEqual(0);
    });
  });

  describe('System Diagnostics', () => {
    test('should track total energy harvested', () => {
      const inputs: DamperInputs = {
        compressionVelocity: 0.6,
        displacement: 0.05,
        vehicleSpeed: 60,
        roadRoughness: 0.3,
        damperTemperature: 25,
        batterySOC: 0.5,
        loadFactor: 0.5
      };

      // Perform multiple calculations
      damper.calculateDamperPerformance(inputs);
      damper.calculateDamperPerformance(inputs);
      damper.calculateDamperPerformance(inputs);

      const diagnostics = damper.getDiagnostics();

      expect(diagnostics.totalEnergyHarvested).toBeGreaterThan(0);
      expect(diagnostics.operationCycles).toBe(3);
      expect(diagnostics.averageEnergyPerCycle).toBeGreaterThan(0);
      expect(diagnostics.isOperational).toBe(true);
    });

    test('should reset statistics correctly', () => {
      const inputs: DamperInputs = {
        compressionVelocity: 0.5,
        displacement: 0.04,
        vehicleSpeed: 60,
        roadRoughness: 0.3,
        damperTemperature: 25,
        batterySOC: 0.5,
        loadFactor: 0.5
      };

      // Generate some statistics
      damper.calculateDamperPerformance(inputs);
      damper.calculateDamperPerformance(inputs);

      // Reset statistics
      damper.resetStatistics();

      const diagnostics = damper.getDiagnostics();

      expect(diagnostics.totalEnergyHarvested).toBe(0);
      expect(diagnostics.operationCycles).toBe(0);
      expect(diagnostics.averageEnergyPerCycle).toBe(0);
    });
  });

  describe('Configuration Management', () => {
    test('should allow configuration updates', () => {
      const newConfig = {
        maxDampingForce: 10000,
        conversionEfficiency: 0.9
      };

      damper.updateConfiguration(newConfig);

      const diagnostics = damper.getDiagnostics();
      expect(diagnostics.systemConfiguration.maxDampingForce).toBe(10000);
      expect(diagnostics.systemConfiguration.conversionEfficiency).toBe(0.9);
    });

    test('should allow constraint updates', () => {
      const newConstraints = {
        maxPowerOutput: 2000,
        maxCompressionVelocity: 2.5
      };

      damper.updateConstraints(newConstraints);

      const diagnostics = damper.getDiagnostics();
      expect(diagnostics.systemConstraints.maxPowerOutput).toBe(2000);
      expect(diagnostics.systemConstraints.maxCompressionVelocity).toBe(2.5);
    });
  });

  describe('Performance Characteristics', () => {
    test('should demonstrate energy production capabilities during transit', () => {
      // Simulate various driving conditions
      const cityDriving: DamperInputs = {
        compressionVelocity: 0.3,
        displacement: 0.03,
        vehicleSpeed: 40,
        roadRoughness: 0.4,
        damperTemperature: 25,
        batterySOC: 0.6,
        loadFactor: 0.5
      };

      const highwayDriving: DamperInputs = {
        compressionVelocity: 0.6,
        displacement: 0.05,
        vehicleSpeed: 100,
        roadRoughness: 0.2,
        damperTemperature: 30,
        batterySOC: 0.6,
        loadFactor: 0.5
      };

      const roughRoadDriving: DamperInputs = {
        compressionVelocity: 0.8,
        displacement: 0.08,
        vehicleSpeed: 60,
        roadRoughness: 0.8,
        damperTemperature: 35,
        batterySOC: 0.6,
        loadFactor: 0.7
      };

      const cityOutputs = damper.calculateDamperPerformance(cityDriving);
      const highwayOutputs = damper.calculateDamperPerformance(highwayDriving);
      const roughRoadOutputs = damper.calculateDamperPerformance(roughRoadDriving);

      // All scenarios should generate power
      expect(cityOutputs.generatedPower).toBeGreaterThan(0);
      expect(highwayOutputs.generatedPower).toBeGreaterThan(0);
      expect(roughRoadOutputs.generatedPower).toBeGreaterThan(0);

      // Rough road should generate the most power due to higher suspension activity
      expect(roughRoadOutputs.generatedPower).toBeGreaterThan(cityOutputs.generatedPower);
      expect(roughRoadOutputs.generatedPower).toBeGreaterThan(highwayOutputs.generatedPower);
    });

    test('should maintain consistent performance over multiple cycles', () => {
      const inputs: DamperInputs = {
        compressionVelocity: 0.5,
        displacement: 0.05,
        vehicleSpeed: 60,
        roadRoughness: 0.3,
        damperTemperature: 25,
        batterySOC: 0.5,
        loadFactor: 0.5
      };

      const outputs1 = damper.calculateDamperPerformance(inputs);
      const outputs2 = damper.calculateDamperPerformance(inputs);
      const outputs3 = damper.calculateDamperPerformance(inputs);

      // Outputs should be consistent for identical inputs
      expect(Math.abs(outputs1.generatedPower - outputs2.generatedPower)).toBeLessThan(1);
      expect(Math.abs(outputs2.generatedPower - outputs3.generatedPower)).toBeLessThan(1);
      expect(Math.abs(outputs1.dampingForce - outputs2.dampingForce)).toBeLessThan(10);
    });
  });

  describe('Edge Cases', () => {
    test('should handle extreme cold conditions', () => {
      const coldInputs: DamperInputs = {
        compressionVelocity: 0.4,
        displacement: 0.04,
        vehicleSpeed: 60,
        roadRoughness: 0.3,
        damperTemperature: -30, // Very cold
        batterySOC: 0.5,
        loadFactor: 0.5
      };

      const outputs = damper.calculateDamperPerformance(coldInputs);

      expect(outputs.generatedPower).toBeGreaterThan(0);
      expect(outputs.energyEfficiency).toBeGreaterThan(0);
      // Efficiency should be reduced in cold conditions
      expect(outputs.energyEfficiency).toBeLessThan(0.9);
    });

    test('should handle maximum displacement scenarios', () => {
      const maxCompressionInputs: DamperInputs = {
        compressionVelocity: 1.0,
        displacement: 0.15, // Maximum compression
        vehicleSpeed: 60,
        roadRoughness: 0.5,
        damperTemperature: 25,
        batterySOC: 0.5,
        loadFactor: 0.8
      };

      const maxExtensionInputs: DamperInputs = {
        compressionVelocity: -1.0,
        displacement: -0.15, // Maximum extension
        vehicleSpeed: 60,
        roadRoughness: 0.5,
        damperTemperature: 25,
        batterySOC: 0.5,
        loadFactor: 0.8
      };

      const compressionOutputs = damper.calculateDamperPerformance(maxCompressionInputs);
      const extensionOutputs = damper.calculateDamperPerformance(maxExtensionInputs);

      expect(compressionOutputs.generatedPower).toBeGreaterThan(0);
      expect(extensionOutputs.generatedPower).toBeGreaterThan(0);
      expect(compressionOutputs.dampingForce).toBeGreaterThan(0);
      expect(extensionOutputs.dampingForce).toBeGreaterThan(0);
    });
  });
});