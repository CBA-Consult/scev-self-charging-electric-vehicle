/**
 * Test suite for TEGBrakingIntegration class
 */

import {
  TEGBrakingIntegration,
  createIntegratedBrakingSystem,
  IntegratedBrakingInputs,
  EnergyRecoveryStrategy
} from '../TEGBrakingIntegration';

import {
  TEGConfiguration,
  defaultTEGConfigurations
} from '../types';

describe('TEGBrakingIntegration', () => {
  let integratedSystem: TEGBrakingIntegration;

  beforeEach(() => {
    integratedSystem = createIntegratedBrakingSystem();
  });

  describe('Basic Integration', () => {
    test('should create integrated braking system successfully', () => {
      expect(integratedSystem).toBeInstanceOf(TEGBrakingIntegration);
      
      const diagnostics = integratedSystem.getSystemDiagnostics();
      expect(diagnostics.regenerativeBraking).toBeDefined();
      expect(diagnostics.tegSystem).toBeDefined();
      expect(diagnostics.thermalManagement).toBeDefined();
      expect(diagnostics.overall).toBeDefined();
    });

    test('should calculate integrated braking performance', () => {
      const inputs: IntegratedBrakingInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0.6,
        batterySOC: 0.7,
        motorTemperature: 85,
        brakeTemperature: 200,
        ambientTemperature: 25,
        airflow: 22,
        tegSystemEnabled: true,
        thermalManagementMode: 'adaptive'
      };

      const results = integratedSystem.calculateIntegratedBraking(inputs);

      expect(results.regenerativePower).toBeGreaterThanOrEqual(0);
      expect(results.tegPower).toBeGreaterThanOrEqual(0);
      expect(results.totalRecoveredPower).toBeGreaterThanOrEqual(0);
      expect(results.mechanicalBrakingPower).toBeGreaterThanOrEqual(0);
      expect(results.systemEfficiency).toBeGreaterThanOrEqual(0);
      expect(results.systemEfficiency).toBeLessThanOrEqual(100);
      expect(results.brakeTemperature).toBeGreaterThan(inputs.ambientTemperature);
      expect(results.tegTemperature.hotSide).toBeGreaterThanOrEqual(results.tegTemperature.coldSide);
      
      // Power distribution should sum to total
      const distributionSum = results.powerDistribution.battery + 
                             results.powerDistribution.supercapacitor + 
                             results.powerDistribution.directUse;
      expect(distributionSum).toBeCloseTo(results.totalRecoveredPower, 1);
    });

    test('should handle TEG system disabled', () => {
      const inputs: IntegratedBrakingInputs = {
        drivingSpeed: 60,
        brakingIntensity: 0.5,
        batterySOC: 0.8,
        motorTemperature: 75,
        brakeTemperature: 150,
        ambientTemperature: 20,
        airflow: 17,
        tegSystemEnabled: false,
        thermalManagementMode: 'passive'
      };

      const results = integratedSystem.calculateIntegratedBraking(inputs);

      expect(results.tegPower).toBe(0);
      expect(results.thermalEfficiency).toBe(0);
      expect(results.regenerativePower).toBeGreaterThan(0);
      expect(results.totalRecoveredPower).toBe(results.regenerativePower);
    });

    test('should handle low brake temperature scenarios', () => {
      const inputs: IntegratedBrakingInputs = {
        drivingSpeed: 40,
        brakingIntensity: 0.3,
        batterySOC: 0.6,
        motorTemperature: 60,
        brakeTemperature: 70, // Low temperature - below TEG activation threshold
        ambientTemperature: 25,
        airflow: 11,
        tegSystemEnabled: true,
        thermalManagementMode: 'passive'
      };

      const results = integratedSystem.calculateIntegratedBraking(inputs);

      // TEG should not activate at low temperatures
      expect(results.tegPower).toBeLessThan(10); // Minimal or no TEG power
      expect(results.regenerativePower).toBeGreaterThan(0);
    });
  });

  describe('Energy Recovery Strategy', () => {
    test('should apply custom energy recovery strategy', () => {
      const customStrategy: Partial<EnergyRecoveryStrategy> = {
        prioritizeRegeneration: false,
        tegActivationThreshold: {
          temperature: 50, // Lower threshold
          brakingIntensity: 0.1,
          duration: 0.5
        },
        powerManagement: {
          maxTegPower: 1000,
          batteryChargingPriority: false,
          supercapacitorBuffering: true
        }
      };

      const customSystem = createIntegratedBrakingSystem(undefined, customStrategy);

      const inputs: IntegratedBrakingInputs = {
        drivingSpeed: 50,
        brakingIntensity: 0.4,
        batterySOC: 0.5,
        motorTemperature: 70,
        brakeTemperature: 100,
        ambientTemperature: 25,
        airflow: 14,
        tegSystemEnabled: true,
        thermalManagementMode: 'adaptive'
      };

      const results = customSystem.calculateIntegratedBraking(inputs);

      expect(results.tegPower).toBeGreaterThan(0); // Should activate with lower threshold
      expect(results.powerDistribution.supercapacitor).toBeGreaterThan(0); // Should use supercapacitor
    });

    test('should update energy recovery strategy', () => {
      const newStrategy: Partial<EnergyRecoveryStrategy> = {
        thermalLimits: {
          maxBrakeTemp: 400,
          tegShutdownTemp: 350,
          coolingActivationTemp: 180
        }
      };

      expect(() => {
        integratedSystem.updateEnergyRecoveryStrategy(newStrategy);
      }).not.toThrow();
    });
  });

  describe('Thermal Management Modes', () => {
    test('should handle passive thermal management', () => {
      const inputs: IntegratedBrakingInputs = {
        drivingSpeed: 70,
        brakingIntensity: 0.5,
        batterySOC: 0.7,
        motorTemperature: 80,
        brakeTemperature: 180,
        ambientTemperature: 25,
        airflow: 19,
        tegSystemEnabled: true,
        thermalManagementMode: 'passive'
      };

      const results = integratedSystem.calculateIntegratedBraking(inputs);

      expect(results.brakeTemperature).toBeGreaterThan(inputs.ambientTemperature);
      expect(results.tegTemperature.hotSide).toBeGreaterThan(results.tegTemperature.coldSide);
    });

    test('should handle active thermal management', () => {
      const inputs: IntegratedBrakingInputs = {
        drivingSpeed: 90,
        brakingIntensity: 0.8,
        batterySOC: 0.6,
        motorTemperature: 100,
        brakeTemperature: 280,
        ambientTemperature: 30,
        airflow: 25,
        tegSystemEnabled: true,
        thermalManagementMode: 'active'
      };

      const results = integratedSystem.calculateIntegratedBraking(inputs);

      // Active cooling should help manage temperatures
      expect(results.brakeTemperature).toBeLessThan(inputs.brakeTemperature + 50);
      expect(results.tegPower).toBeGreaterThan(0);
    });

    test('should handle adaptive thermal management', () => {
      const inputs: IntegratedBrakingInputs = {
        drivingSpeed: 100,
        brakingIntensity: 0.7,
        batterySOC: 0.8,
        motorTemperature: 90,
        brakeTemperature: 220,
        ambientTemperature: 25,
        airflow: 28,
        tegSystemEnabled: true,
        thermalManagementMode: 'adaptive'
      };

      const results = integratedSystem.calculateIntegratedBraking(inputs);

      expect(results.systemEfficiency).toBeGreaterThan(0);
      expect(results.totalRecoveredPower).toBeGreaterThan(0);
    });
  });

  describe('System Diagnostics', () => {
    test('should provide comprehensive system diagnostics', () => {
      const inputs: IntegratedBrakingInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0.6,
        batterySOC: 0.7,
        motorTemperature: 85,
        brakeTemperature: 200,
        ambientTemperature: 25,
        airflow: 22,
        tegSystemEnabled: true,
        thermalManagementMode: 'adaptive'
      };

      integratedSystem.calculateIntegratedBraking(inputs);
      const diagnostics = integratedSystem.getSystemDiagnostics();

      expect(diagnostics.regenerativeBraking.power).toBeGreaterThanOrEqual(0);
      expect(diagnostics.regenerativeBraking.efficiency).toBeGreaterThanOrEqual(0);
      expect(diagnostics.regenerativeBraking.status).toMatch(/active|inactive|limited|fault/);

      expect(diagnostics.tegSystem.power).toBeGreaterThanOrEqual(0);
      expect(diagnostics.tegSystem.efficiency).toBeGreaterThanOrEqual(0);
      expect(diagnostics.tegSystem.status).toMatch(/active|inactive|thermal_limit|fault/);

      expect(diagnostics.thermalManagement.coolingPower).toBeGreaterThanOrEqual(0);
      expect(diagnostics.thermalManagement.heatRejection).toBeGreaterThanOrEqual(0);
      expect(diagnostics.thermalManagement.status).toMatch(/optimal|active_cooling|thermal_stress|emergency/);

      expect(diagnostics.overall.totalRecoveredPower).toBeGreaterThanOrEqual(0);
      expect(diagnostics.overall.systemEfficiency).toBeGreaterThanOrEqual(0);
      expect(diagnostics.overall.energySavings).toBeGreaterThanOrEqual(0);
      expect(diagnostics.overall.reliability).toBeGreaterThan(0);
    });

    test('should provide system status summary', () => {
      const inputs: IntegratedBrakingInputs = {
        drivingSpeed: 60,
        brakingIntensity: 0.4,
        batterySOC: 0.8,
        motorTemperature: 70,
        brakeTemperature: 150,
        ambientTemperature: 20,
        airflow: 17,
        tegSystemEnabled: true,
        thermalManagementMode: 'passive'
      };

      integratedSystem.calculateIntegratedBraking(inputs);
      const status = integratedSystem.getSystemStatus();

      expect(status.isOperational).toBe(true);
      expect(Array.isArray(status.activeSubsystems)).toBe(true);
      expect(Array.isArray(status.warnings)).toBe(true);
      expect(Array.isArray(status.errors)).toBe(true);
    });

    test('should maintain performance history', () => {
      const inputs: IntegratedBrakingInputs = {
        drivingSpeed: 70,
        brakingIntensity: 0.5,
        batterySOC: 0.7,
        motorTemperature: 80,
        brakeTemperature: 180,
        ambientTemperature: 25,
        airflow: 19,
        tegSystemEnabled: true,
        thermalManagementMode: 'adaptive'
      };

      // Perform multiple calculations
      for (let i = 0; i < 5; i++) {
        integratedSystem.calculateIntegratedBraking(inputs);
      }

      const history = integratedSystem.getPerformanceHistory();
      expect(history.length).toBe(5);
      
      history.forEach(record => {
        expect(record.totalRecoveredPower).toBeGreaterThanOrEqual(0);
        expect(record.systemEfficiency).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid brake temperature', () => {
      const inputs: IntegratedBrakingInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0.6,
        batterySOC: 0.7,
        motorTemperature: 85,
        brakeTemperature: 600, // Invalid high temperature
        ambientTemperature: 25,
        airflow: 22,
        tegSystemEnabled: true,
        thermalManagementMode: 'adaptive'
      };

      expect(() => {
        integratedSystem.calculateIntegratedBraking(inputs);
      }).toThrow(/Brake temperature out of valid range/);
    });

    test('should handle invalid ambient temperature', () => {
      const inputs: IntegratedBrakingInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0.6,
        batterySOC: 0.7,
        motorTemperature: 85,
        brakeTemperature: 200,
        ambientTemperature: -50, // Invalid low temperature
        airflow: 22,
        tegSystemEnabled: true,
        thermalManagementMode: 'adaptive'
      };

      expect(() => {
        integratedSystem.calculateIntegratedBraking(inputs);
      }).toThrow(/Ambient temperature out of valid range/);
    });

    test('should handle invalid airflow velocity', () => {
      const inputs: IntegratedBrakingInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0.6,
        batterySOC: 0.7,
        motorTemperature: 85,
        brakeTemperature: 200,
        ambientTemperature: 25,
        airflow: -5, // Invalid negative airflow
        tegSystemEnabled: true,
        thermalManagementMode: 'adaptive'
      };

      expect(() => {
        integratedSystem.calculateIntegratedBraking(inputs);
      }).toThrow(/Airflow velocity out of valid range/);
    });
  });

  describe('Custom TEG Configurations', () => {
    test('should work with custom TEG configurations', () => {
      const customTEGConfigs = new Map<string, TEGConfiguration>();
      customTEGConfigs.set('custom_high_power_teg', {
        ...defaultTEGConfigurations['brake_disc_teg'],
        id: 'custom_high_power_teg',
        thermoelectricPairs: 200,
        dimensions: { length: 120, width: 100, height: 20 }
      });

      const customSystem = createIntegratedBrakingSystem(customTEGConfigs);

      const inputs: IntegratedBrakingInputs = {
        drivingSpeed: 90,
        brakingIntensity: 0.7,
        batterySOC: 0.6,
        motorTemperature: 90,
        brakeTemperature: 250,
        ambientTemperature: 25,
        airflow: 25,
        tegSystemEnabled: true,
        thermalManagementMode: 'active'
      };

      const results = customSystem.calculateIntegratedBraking(inputs);

      expect(results.tegPower).toBeGreaterThan(0);
      expect(results.totalRecoveredPower).toBeGreaterThan(0);
    });
  });

  describe('Performance Scenarios', () => {
    test('should handle city driving scenario', () => {
      const inputs: IntegratedBrakingInputs = {
        drivingSpeed: 35,
        brakingIntensity: 0.4,
        batterySOC: 0.8,
        motorTemperature: 65,
        brakeTemperature: 120,
        ambientTemperature: 22,
        airflow: 10,
        tegSystemEnabled: true,
        thermalManagementMode: 'passive'
      };

      const results = integratedSystem.calculateIntegratedBraking(inputs);

      expect(results.systemEfficiency).toBeGreaterThan(0);
      expect(results.totalRecoveredPower).toBeGreaterThanOrEqual(results.regenerativePower);
    });

    test('should handle highway driving scenario', () => {
      const inputs: IntegratedBrakingInputs = {
        drivingSpeed: 120,
        brakingIntensity: 0.8,
        batterySOC: 0.5,
        motorTemperature: 95,
        brakeTemperature: 300,
        ambientTemperature: 28,
        airflow: 33,
        tegSystemEnabled: true,
        thermalManagementMode: 'active'
      };

      const results = integratedSystem.calculateIntegratedBraking(inputs);

      expect(results.tegPower).toBeGreaterThan(0); // High temperature should activate TEG
      expect(results.systemEfficiency).toBeGreaterThan(0);
      expect(results.brakeTemperature).toBeLessThan(400); // Active cooling should limit temperature
    });

    test('should handle mountain driving scenario', () => {
      const inputs: IntegratedBrakingInputs = {
        drivingSpeed: 50,
        brakingIntensity: 0.6,
        batterySOC: 0.95, // High SOC limits regenerative braking
        motorTemperature: 105,
        brakeTemperature: 280,
        ambientTemperature: 15,
        airflow: 14,
        tegSystemEnabled: true,
        thermalManagementMode: 'adaptive'
      };

      const results = integratedSystem.calculateIntegratedBraking(inputs);

      // High SOC should reduce regenerative braking, increasing TEG opportunity
      expect(results.tegPower).toBeGreaterThan(0);
      expect(results.mechanicalBrakingPower).toBeGreaterThan(0);
    });
  });
});