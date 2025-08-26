/**
 * Test suite for ThermoelectricGenerator class
 */

import {
  ThermoelectricGenerator,
  createTEGSystem,
  TEGSystemInputs
} from '../ThermoelectricGenerator';

import {
  ThermalConditions,
  TEGConfiguration,
  ThermoelectricMaterial,
  defaultTEGMaterials
} from '../types';

import {
  validateTEGConfiguration,
  calculateSeebeckCoefficient,
  calculateZTValue
} from '../utils';

describe('ThermoelectricGenerator', () => {
  let tegSystem: ThermoelectricGenerator;

  beforeEach(() => {
    tegSystem = createTEGSystem();
  });

  describe('Basic Functionality', () => {
    test('should create TEG system successfully', () => {
      expect(tegSystem).toBeInstanceOf(ThermoelectricGenerator);
      
      const diagnostics = tegSystem.getSystemDiagnostics();
      expect(diagnostics.configurations.size).toBeGreaterThan(0);
      expect(diagnostics.materials.size).toBeGreaterThan(0);
      expect(diagnostics.systemReliability).toBeGreaterThan(0.9);
    });

    test('should calculate TEG power for valid inputs', () => {
      const thermalConditions: ThermalConditions = {
        hotSideTemperature: 200,
        coldSideTemperature: 50,
        ambientTemperature: 25,
        heatFlux: 5000,
        convectionCoefficient: { hotSide: 50, coldSide: 25 },
        airflow: { velocity: 15, temperature: 25 },
        brakingDuration: 5,
        brakingIntensity: 0.7
      };

      const tegInputs: TEGSystemInputs = {
        thermalConditions,
        operatingMode: 'maximum_power',
        coolingSystemActive: true,
        thermalProtectionEnabled: true
      };

      const performance = tegSystem.calculateTEGPower('brake_disc_teg', tegInputs);

      expect(performance.electricalPower).toBeGreaterThan(0);
      expect(performance.voltage).toBeGreaterThan(0);
      expect(performance.current).toBeGreaterThan(0);
      expect(performance.efficiency).toBeGreaterThan(0);
      expect(performance.efficiency).toBeLessThan(100);
      expect(performance.temperatureDifference).toBeCloseTo(150, 10);
      expect(performance.reliability).toBeGreaterThan(50);
      expect(performance.lifespan).toBeGreaterThan(0);
    });

    test('should handle different operating modes', () => {
      const thermalConditions: ThermalConditions = {
        hotSideTemperature: 180,
        coldSideTemperature: 40,
        ambientTemperature: 25,
        heatFlux: 4000,
        convectionCoefficient: { hotSide: 45, coldSide: 20 },
        airflow: { velocity: 12, temperature: 25 },
        brakingDuration: 3,
        brakingIntensity: 0.5
      };

      const modes: Array<'maximum_power' | 'maximum_efficiency' | 'constant_voltage'> = [
        'maximum_power',
        'maximum_efficiency',
        'constant_voltage'
      ];

      const results = modes.map(mode => {
        const inputs: TEGSystemInputs = {
          thermalConditions,
          operatingMode: mode,
          coolingSystemActive: true,
          thermalProtectionEnabled: true
        };
        return tegSystem.calculateTEGPower('brake_disc_teg', inputs);
      });

      // Maximum power mode should have highest power
      expect(results[0].electricalPower).toBeGreaterThanOrEqual(results[1].electricalPower);
      
      // Maximum efficiency mode should have highest efficiency
      expect(results[1].efficiency).toBeGreaterThanOrEqual(results[0].efficiency);
      
      // All modes should produce valid results
      results.forEach(result => {
        expect(result.electricalPower).toBeGreaterThan(0);
        expect(result.efficiency).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid configuration ID', () => {
      const thermalConditions: ThermalConditions = {
        hotSideTemperature: 150,
        coldSideTemperature: 30,
        ambientTemperature: 25,
        heatFlux: 3000,
        convectionCoefficient: { hotSide: 40, coldSide: 15 },
        airflow: { velocity: 10, temperature: 25 },
        brakingDuration: 2,
        brakingIntensity: 0.4
      };

      const tegInputs: TEGSystemInputs = {
        thermalConditions,
        operatingMode: 'maximum_power',
        coolingSystemActive: true,
        thermalProtectionEnabled: true
      };

      expect(() => {
        tegSystem.calculateTEGPower('invalid_config', tegInputs);
      }).toThrow('TEG configuration \'invalid_config\' not found');
    });

    test('should handle thermal protection activation', () => {
      const thermalConditions: ThermalConditions = {
        hotSideTemperature: 350, // Very high temperature
        coldSideTemperature: 50,
        ambientTemperature: 25,
        heatFlux: 8000,
        convectionCoefficient: { hotSide: 60, coldSide: 30 },
        airflow: { velocity: 20, temperature: 25 },
        brakingDuration: 10,
        brakingIntensity: 0.9
      };

      const tegInputs: TEGSystemInputs = {
        thermalConditions,
        operatingMode: 'maximum_power',
        coolingSystemActive: true,
        thermalProtectionEnabled: true
      };

      expect(() => {
        tegSystem.calculateTEGPower('brake_disc_teg', tegInputs);
      }).toThrow(/temperature.*exceeds safety limit/);
    });

    test('should handle invalid thermal conditions', () => {
      const invalidThermalConditions: ThermalConditions = {
        hotSideTemperature: 50, // Lower than cold side
        coldSideTemperature: 100,
        ambientTemperature: 25,
        heatFlux: 3000,
        convectionCoefficient: { hotSide: 40, coldSide: 15 },
        airflow: { velocity: 10, temperature: 25 },
        brakingDuration: 2,
        brakingIntensity: 0.4
      };

      const tegInputs: TEGSystemInputs = {
        thermalConditions: invalidThermalConditions,
        operatingMode: 'maximum_power',
        coolingSystemActive: true,
        thermalProtectionEnabled: true
      };

      expect(() => {
        tegSystem.calculateTEGPower('brake_disc_teg', tegInputs);
      }).toThrow(/Invalid thermal conditions/);
    });
  });

  describe('Configuration Management', () => {
    test('should add custom TEG configuration', () => {
      const customConfig: TEGConfiguration = {
        id: 'custom_test_teg',
        type: 'single_stage',
        dimensions: { length: 80, width: 60, height: 10 },
        thermoelectricPairs: 100,
        pTypeMaterial: defaultTEGMaterials['Bi2Te3_pType'],
        nTypeMaterial: defaultTEGMaterials['Bi2Te3_nType'],
        legDimensions: { length: 3, crossSectionalArea: 4 },
        electricalConfiguration: 'series',
        heatExchanger: {
          hotSideType: 'direct_contact',
          coldSideType: 'air_cooled',
          hotSideArea: 48,
          coldSideArea: 72,
          thermalResistance: { hotSide: 0.15, coldSide: 0.4 }
        },
        placement: {
          location: 'brake_disc',
          mountingType: 'thermal_interface',
          thermalInterfaceMaterial: 'thermal_paste'
        }
      };

      expect(() => {
        tegSystem.addTEGConfiguration(customConfig);
      }).not.toThrow();

      const diagnostics = tegSystem.getSystemDiagnostics();
      expect(diagnostics.configurations.has('custom_test_teg')).toBe(true);
    });

    test('should reject invalid TEG configuration', () => {
      const invalidConfig: TEGConfiguration = {
        id: 'invalid_test_teg',
        type: 'single_stage',
        dimensions: { length: -10, width: 60, height: 10 }, // Invalid negative dimension
        thermoelectricPairs: 0, // Invalid zero pairs
        pTypeMaterial: defaultTEGMaterials['Bi2Te3_pType'],
        nTypeMaterial: defaultTEGMaterials['Bi2Te3_nType'],
        legDimensions: { length: 3, crossSectionalArea: 4 },
        electricalConfiguration: 'series',
        heatExchanger: {
          hotSideType: 'direct_contact',
          coldSideType: 'air_cooled',
          hotSideArea: 48,
          coldSideArea: 72,
          thermalResistance: { hotSide: 0.15, coldSide: 0.4 }
        },
        placement: {
          location: 'brake_disc',
          mountingType: 'thermal_interface',
          thermalInterfaceMaterial: 'thermal_paste'
        }
      };

      expect(() => {
        tegSystem.addTEGConfiguration(invalidConfig);
      }).toThrow(/Invalid TEG configuration/);
    });

    test('should add custom thermoelectric material', () => {
      const customMaterial: ThermoelectricMaterial = {
        name: 'Test Material',
        type: 'n-type',
        seebeckCoefficient: -300,
        electricalConductivity: 25000,
        thermalConductivity: 3.0,
        ztValue: 1.5,
        operatingTempRange: { min: 100, max: 500 },
        density: 7000,
        specificHeat: 200,
        thermalExpansion: 10e-6,
        cost: 250
      };

      expect(() => {
        tegSystem.addThermoelectricMaterial(customMaterial);
      }).not.toThrow();

      const diagnostics = tegSystem.getSystemDiagnostics();
      expect(diagnostics.materials.has('Test Material')).toBe(true);
    });
  });

  describe('Performance Optimization', () => {
    test('should optimize TEG configuration', () => {
      const targetConditions: ThermalConditions = {
        hotSideTemperature: 250,
        coldSideTemperature: 60,
        ambientTemperature: 30,
        heatFlux: 6000,
        convectionCoefficient: { hotSide: 55, coldSide: 28 },
        airflow: { velocity: 18, temperature: 30 },
        brakingDuration: 8,
        brakingIntensity: 0.8
      };

      const constraints = {
        maxCost: 5000,
        maxSize: { length: 150, width: 120, height: 30 },
        minPower: 50,
        minEfficiency: 5
      };

      const optimization = tegSystem.optimizeTEGConfiguration(
        'brake_disc_teg',
        targetConditions,
        constraints
      );

      expect(optimization.optimalConfiguration).toBeDefined();
      expect(optimization.expectedPerformance.electricalPower).toBeGreaterThan(0);
      expect(optimization.optimizationScore).toBeGreaterThan(0);
      expect(optimization.convergenceIterations).toBeGreaterThan(0);
    });
  });

  describe('Thermal Protection', () => {
    test('should update thermal protection settings', () => {
      expect(() => {
        tegSystem.updateThermalProtection(false, 400);
      }).not.toThrow();

      const diagnostics = tegSystem.getSystemDiagnostics();
      expect(diagnostics.thermalProtectionActive).toBe(false);
    });

    test('should respect thermal protection limits', () => {
      tegSystem.updateThermalProtection(true, 200);

      const thermalConditions: ThermalConditions = {
        hotSideTemperature: 250, // Above the 200°C limit
        coldSideTemperature: 50,
        ambientTemperature: 25,
        heatFlux: 5000,
        convectionCoefficient: { hotSide: 50, coldSide: 25 },
        airflow: { velocity: 15, temperature: 25 },
        brakingDuration: 5,
        brakingIntensity: 0.7
      };

      const tegInputs: TEGSystemInputs = {
        thermalConditions,
        operatingMode: 'maximum_power',
        coolingSystemActive: true,
        thermalProtectionEnabled: true
      };

      expect(() => {
        tegSystem.calculateTEGPower('brake_disc_teg', tegInputs);
      }).toThrow(/temperature.*exceeds safety limit/);
    });
  });

  describe('Performance History', () => {
    test('should maintain performance history', () => {
      const thermalConditions: ThermalConditions = {
        hotSideTemperature: 180,
        coldSideTemperature: 45,
        ambientTemperature: 25,
        heatFlux: 4500,
        convectionCoefficient: { hotSide: 48, coldSide: 22 },
        airflow: { velocity: 13, temperature: 25 },
        brakingDuration: 4,
        brakingIntensity: 0.6
      };

      const tegInputs: TEGSystemInputs = {
        thermalConditions,
        operatingMode: 'maximum_power',
        coolingSystemActive: true,
        thermalProtectionEnabled: true
      };

      // Perform multiple calculations
      for (let i = 0; i < 5; i++) {
        tegSystem.calculateTEGPower('brake_disc_teg', tegInputs);
      }

      const diagnostics = tegSystem.getSystemDiagnostics();
      expect(diagnostics.performanceHistory.length).toBe(5);
    });

    test('should limit performance history size', () => {
      const thermalConditions: ThermalConditions = {
        hotSideTemperature: 160,
        coldSideTemperature: 40,
        ambientTemperature: 25,
        heatFlux: 4000,
        convectionCoefficient: { hotSide: 45, coldSide: 20 },
        airflow: { velocity: 12, temperature: 25 },
        brakingDuration: 3,
        brakingIntensity: 0.5
      };

      const tegInputs: TEGSystemInputs = {
        thermalConditions,
        operatingMode: 'maximum_power',
        coolingSystemActive: true,
        thermalProtectionEnabled: true
      };

      // Perform many calculations to test history limit
      for (let i = 0; i < 1005; i++) {
        tegSystem.calculateTEGPower('brake_disc_teg', tegInputs);
      }

      const diagnostics = tegSystem.getSystemDiagnostics();
      expect(diagnostics.performanceHistory.length).toBeLessThanOrEqual(1000);
    });
  });
});

describe('TEG Utility Functions', () => {
  describe('Configuration Validation', () => {
    test('should validate correct configuration', () => {
      const validConfig: TEGConfiguration = {
        id: 'test_valid',
        type: 'single_stage',
        dimensions: { length: 100, width: 80, height: 15 },
        thermoelectricPairs: 127,
        pTypeMaterial: defaultTEGMaterials['Bi2Te3_pType'],
        nTypeMaterial: defaultTEGMaterials['Bi2Te3_nType'],
        legDimensions: { length: 3, crossSectionalArea: 4 },
        electricalConfiguration: 'series',
        heatExchanger: {
          hotSideType: 'direct_contact',
          coldSideType: 'air_cooled',
          hotSideArea: 80,
          coldSideArea: 120,
          thermalResistance: { hotSide: 0.1, coldSide: 0.3 }
        },
        placement: {
          location: 'brake_disc',
          mountingType: 'thermal_interface',
          thermalInterfaceMaterial: 'thermal_paste'
        }
      };

      const validation = validateTEGConfiguration(validConfig);
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    test('should detect configuration errors', () => {
      const invalidConfig: TEGConfiguration = {
        id: 'test_invalid',
        type: 'single_stage',
        dimensions: { length: -10, width: 80, height: 15 }, // Invalid negative dimension
        thermoelectricPairs: 0, // Invalid zero pairs
        pTypeMaterial: { ...defaultTEGMaterials['Bi2Te3_nType'], type: 'p-type' }, // Wrong type
        nTypeMaterial: { ...defaultTEGMaterials['Bi2Te3_pType'], type: 'n-type' }, // Wrong type
        legDimensions: { length: -1, crossSectionalArea: 4 }, // Invalid negative length
        electricalConfiguration: 'series',
        heatExchanger: {
          hotSideType: 'direct_contact',
          coldSideType: 'air_cooled',
          hotSideArea: -10, // Invalid negative area
          coldSideArea: 120,
          thermalResistance: { hotSide: -0.1, coldSide: 0.3 } // Invalid negative resistance
        },
        placement: {
          location: 'brake_disc',
          mountingType: 'thermal_interface',
          thermalInterfaceMaterial: 'thermal_paste'
        }
      };

      const validation = validateTEGConfiguration(invalidConfig);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Material Calculations', () => {
    test('should calculate Seebeck coefficient correctly', () => {
      const pMaterial = defaultTEGMaterials['Bi2Te3_pType'];
      const nMaterial = defaultTEGMaterials['Bi2Te3_nType'];
      
      const seebeckCoeff = calculateSeebeckCoefficient(pMaterial, nMaterial);
      expect(seebeckCoeff).toBe(400); // |200| + |-200| = 400
    });

    test('should calculate ZT value correctly', () => {
      const pMaterial = defaultTEGMaterials['Bi2Te3_pType'];
      const nMaterial = defaultTEGMaterials['Bi2Te3_nType'];
      
      const ztValue = calculateZTValue(pMaterial, nMaterial, 100);
      expect(ztValue).toBeGreaterThan(0);
      expect(ztValue).toBeLessThan(10); // Reasonable range for ZT
    });
  });
});