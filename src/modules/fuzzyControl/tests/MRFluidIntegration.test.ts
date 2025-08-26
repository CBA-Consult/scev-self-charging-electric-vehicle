/**
 * Test suite for MR Fluid Integration System
 * 
 * Tests the integration of MR fluid formulations with the regenerative braking system,
 * including energy recovery optimization, system configuration, and performance analytics.
 */

import { 
  MRFluidIntegration,
  MRFluidSystemInputs,
  MRFluidSystemOutputs,
  MRFluidSystemConfiguration 
} from '../MRFluidIntegration';

import { VehicleParameters } from '../RegenerativeBrakingTorqueModel';

describe('MRFluidIntegration', () => {
  let mrFluidIntegration: MRFluidIntegration;
  let vehicleParams: VehicleParameters;
  let systemConfig: MRFluidSystemConfiguration;

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

    systemConfig = {
      selectedFormulation: 'HP-IC-001',
      brakingSystemConfig: {
        enableMRFluidBraking: true,
        mrFluidBrakingRatio: 0.7,
        adaptiveFieldControl: true
      },
      suspensionSystemConfig: {
        enableMRFluidSuspension: true,
        suspensionEnergyRecovery: true,
        dampingAdaptation: true
      },
      thermalManagement: {
        enableCooling: true,
        maxOperatingTemperature: 120,
        thermalDerating: true
      }
    };

    mrFluidIntegration = new MRFluidIntegration(vehicleParams, systemConfig);
  });

  describe('System Initialization', () => {
    test('should initialize with valid configuration', () => {
      expect(mrFluidIntegration).toBeDefined();
      expect(mrFluidIntegration.getCurrentFormulation()).toBeTruthy();
      expect(mrFluidIntegration.getCurrentFormulation()!.id).toBe('HP-IC-001');
    });

    test('should throw error for invalid formulation', () => {
      const invalidConfig = {
        ...systemConfig,
        selectedFormulation: 'INVALID-FORMULATION'
      };

      expect(() => {
        new MRFluidIntegration(vehicleParams, invalidConfig);
      }).toThrow('MR fluid formulation INVALID-FORMULATION not found');
    });

    test('should get current configuration', () => {
      const config = mrFluidIntegration.getConfiguration();
      expect(config).toEqual(systemConfig);
    });
  });

  describe('Energy Recovery Calculation', () => {
    test('should calculate optimal response with MR fluid integration', () => {
      const inputs: MRFluidSystemInputs = {
        drivingSpeed: 60,
        brakingIntensity: 0.5,
        batterySOC: 0.7,
        motorTemperature: 65,
        magneticFieldStrength: 500000,
        suspensionVelocity: 0.2,
        dampingForce: 1500,
        ambientTemperature: 25,
        operatingFrequency: 10
      };

      const outputs = mrFluidIntegration.calculateOptimalResponse(inputs);

      expect(outputs.regenerativeBrakingRatio).toBeGreaterThan(0);
      expect(outputs.regenerativeBrakingRatio).toBeLessThanOrEqual(1);
      expect(outputs.motorTorque).toBeGreaterThan(0);
      expect(outputs.frontAxleBrakingForce).toBeGreaterThan(0);
      
      // MR fluid specific outputs
      expect(outputs.mrFluidViscosity).toBeGreaterThan(0);
      expect(outputs.dampingCoefficient).toBeGreaterThan(0);
      expect(outputs.energyRecoveryRate).toBeGreaterThan(0);
      expect(outputs.fluidTemperature).toBeGreaterThanOrEqual(inputs.ambientTemperature);
      expect(outputs.magneticFieldRequired).toBeGreaterThan(0);
      expect(outputs.suspensionEnergyRecovery).toBeGreaterThanOrEqual(0);
      expect(outputs.totalEnergyRecovery).toBeGreaterThan(0);
    });

    test('should show energy recovery benefits with MR fluid enabled', () => {
      const inputs: MRFluidSystemInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0.6,
        batterySOC: 0.5,
        motorTemperature: 70,
        magneticFieldStrength: 600000,
        suspensionVelocity: 0.3,
        dampingForce: 2000,
        ambientTemperature: 30,
        operatingFrequency: 15
      };

      const outputsWithMR = mrFluidIntegration.calculateOptimalResponse(inputs);

      // Disable MR fluid systems for comparison
      mrFluidIntegration.updateConfiguration({
        brakingSystemConfig: {
          enableMRFluidBraking: false,
          mrFluidBrakingRatio: 0,
          adaptiveFieldControl: false
        },
        suspensionSystemConfig: {
          enableMRFluidSuspension: false,
          suspensionEnergyRecovery: false,
          dampingAdaptation: false
        }
      });

      const outputsWithoutMR = mrFluidIntegration.calculateOptimalResponse(inputs);

      expect(outputsWithMR.totalEnergyRecovery).toBeGreaterThan(outputsWithoutMR.totalEnergyRecovery);
      expect(outputsWithMR.suspensionEnergyRecovery).toBeGreaterThan(outputsWithoutMR.suspensionEnergyRecovery);
    });

    test('should handle different operating conditions', () => {
      const testConditions = [
        { speed: 30, intensity: 0.3, temp: 10, field: 300000 },
        { speed: 60, intensity: 0.5, temp: 25, field: 500000 },
        { speed: 100, intensity: 0.8, temp: 50, field: 800000 }
      ];

      for (const condition of testConditions) {
        const inputs: MRFluidSystemInputs = {
          drivingSpeed: condition.speed,
          brakingIntensity: condition.intensity,
          batterySOC: 0.6,
          motorTemperature: 60,
          magneticFieldStrength: condition.field,
          suspensionVelocity: 0.1,
          dampingForce: 1000,
          ambientTemperature: condition.temp,
          operatingFrequency: 8
        };

        const outputs = mrFluidIntegration.calculateOptimalResponse(inputs);
        
        expect(outputs.totalEnergyRecovery).toBeGreaterThan(0);
        expect(outputs.fluidTemperature).toBeGreaterThanOrEqual(condition.temp);
        expect(outputs.magneticFieldRequired).toBeGreaterThan(0);
      }
    });
  });

  describe('Thermal Management', () => {
    test('should apply thermal derating at high temperatures', () => {
      const highTempInputs: MRFluidSystemInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0.7,
        batterySOC: 0.6,
        motorTemperature: 80,
        magneticFieldStrength: 700000,
        suspensionVelocity: 0.4,
        dampingForce: 2500,
        ambientTemperature: 60, // High ambient temperature
        operatingFrequency: 20
      };

      const normalTempInputs = { ...highTempInputs, ambientTemperature: 25 };

      const highTempOutputs = mrFluidIntegration.calculateOptimalResponse(highTempInputs);
      const normalTempOutputs = mrFluidIntegration.calculateOptimalResponse(normalTempInputs);

      // High temperature should result in lower energy recovery due to thermal derating
      expect(highTempOutputs.totalEnergyRecovery).toBeLessThan(normalTempOutputs.totalEnergyRecovery);
      expect(highTempOutputs.fluidTemperature).toBeGreaterThan(normalTempOutputs.fluidTemperature);
    });

    test('should respect maximum operating temperature', () => {
      const inputs: MRFluidSystemInputs = {
        drivingSpeed: 100,
        brakingIntensity: 0.9,
        batterySOC: 0.4,
        motorTemperature: 90,
        magneticFieldStrength: 800000,
        suspensionVelocity: 0.5,
        dampingForce: 3000,
        ambientTemperature: 80,
        operatingFrequency: 25
      };

      const outputs = mrFluidIntegration.calculateOptimalResponse(inputs);
      
      // System should apply thermal derating if temperature exceeds limits
      if (outputs.fluidTemperature > systemConfig.thermalManagement.maxOperatingTemperature) {
        expect(outputs.totalEnergyRecovery).toBeLessThan(1000); // Reduced due to derating
      }
    });
  });

  describe('Adaptive Magnetic Field Control', () => {
    test('should adjust magnetic field for optimal performance', () => {
      const inputs: MRFluidSystemInputs = {
        drivingSpeed: 70,
        brakingIntensity: 0.6,
        batterySOC: 0.8,
        motorTemperature: 65,
        magneticFieldStrength: 400000, // Lower initial field
        suspensionVelocity: 0.2,
        dampingForce: 1800,
        ambientTemperature: 25,
        operatingFrequency: 12
      };

      const outputs = mrFluidIntegration.calculateOptimalResponse(inputs);
      
      // Adaptive control should potentially increase field strength for better performance
      expect(outputs.magneticFieldRequired).toBeGreaterThanOrEqual(inputs.magneticFieldStrength);
    });

    test('should not exceed saturation field strength', () => {
      const inputs: MRFluidSystemInputs = {
        drivingSpeed: 120,
        brakingIntensity: 1.0,
        batterySOC: 0.3,
        motorTemperature: 75,
        magneticFieldStrength: 2000000, // Very high field
        suspensionVelocity: 0.6,
        dampingForce: 4000,
        ambientTemperature: 35,
        operatingFrequency: 30
      };

      const outputs = mrFluidIntegration.calculateOptimalResponse(inputs);
      
      // Should not exceed saturation field of the current formulation
      const currentFormulation = mrFluidIntegration.getCurrentFormulation()!;
      const maxField = currentFormulation.magneticParticles.saturationMagnetization * 0.001;
      
      expect(outputs.magneticFieldRequired).toBeLessThanOrEqual(maxField);
    });
  });

  describe('Formulation Optimization', () => {
    test('should recommend optimal formulation for given conditions', () => {
      const operatingConditions = {
        temperatureRange: [20, 80] as [number, number],
        magneticFieldRange: [200000, 800000] as [number, number],
        frequencyRange: [5, 50] as [number, number],
        priorityWeights: {
          energyRecovery: 0.7,
          responseTime: 0.2,
          durability: 0.05,
          temperatureStability: 0.05
        }
      };

      const optimization = mrFluidIntegration.optimizeFormulationForConditions(operatingConditions);
      
      expect(optimization.recommendedFormulation).toBeTruthy();
      expect(optimization.expectedImprovement).toBeGreaterThanOrEqual(0);
      expect(optimization.switchingRecommendation).toBeTruthy();
    });

    test('should recommend high-temperature formulation for hot conditions', () => {
      const hotConditions = {
        temperatureRange: [60, 150] as [number, number],
        magneticFieldRange: [300000, 700000] as [number, number],
        frequencyRange: [1, 20] as [number, number],
        priorityWeights: {
          energyRecovery: 0.3,
          responseTime: 0.2,
          durability: 0.2,
          temperatureStability: 0.3
        }
      };

      const optimization = mrFluidIntegration.optimizeFormulationForConditions(hotConditions);
      
      // Should recommend temperature-stable formulation
      expect(optimization.recommendedFormulation).toBe('TS-CF-002');
    });

    test('should recommend fast-response formulation for high-frequency applications', () => {
      const highFreqConditions = {
        temperatureRange: [20, 60] as [number, number],
        magneticFieldRange: [200000, 600000] as [number, number],
        frequencyRange: [20, 200] as [number, number],
        priorityWeights: {
          energyRecovery: 0.2,
          responseTime: 0.7,
          durability: 0.05,
          temperatureStability: 0.05
        }
      };

      const optimization = mrFluidIntegration.optimizeFormulationForConditions(highFreqConditions);
      
      // Should recommend fast-response formulation
      expect(optimization.recommendedFormulation).toBe('FR-IO-003');
    });
  });

  describe('Formulation Switching', () => {
    test('should switch to different formulation', () => {
      const originalFormulation = mrFluidIntegration.getCurrentFormulation()!.id;
      
      mrFluidIntegration.switchFormulation('TS-CF-002');
      
      expect(mrFluidIntegration.getCurrentFormulation()!.id).toBe('TS-CF-002');
      expect(mrFluidIntegration.getConfiguration().selectedFormulation).toBe('TS-CF-002');
    });

    test('should throw error for invalid formulation switch', () => {
      expect(() => {
        mrFluidIntegration.switchFormulation('INVALID-FORMULATION');
      }).toThrow('MR fluid formulation INVALID-FORMULATION not found');
    });

    test('should update configuration when switching formulation', () => {
      mrFluidIntegration.updateConfiguration({
        selectedFormulation: 'FR-IO-003'
      });
      
      expect(mrFluidIntegration.getCurrentFormulation()!.id).toBe('FR-IO-003');
      expect(mrFluidIntegration.getConfiguration().selectedFormulation).toBe('FR-IO-003');
    });
  });

  describe('Performance Analytics', () => {
    test('should track performance history', () => {
      const inputs: MRFluidSystemInputs = {
        drivingSpeed: 60,
        brakingIntensity: 0.5,
        batterySOC: 0.7,
        motorTemperature: 65,
        magneticFieldStrength: 500000,
        suspensionVelocity: 0.2,
        dampingForce: 1500,
        ambientTemperature: 25,
        operatingFrequency: 10
      };

      // Run multiple calculations to build history
      for (let i = 0; i < 5; i++) {
        mrFluidIntegration.calculateOptimalResponse(inputs);
      }

      const history = mrFluidIntegration.getPerformanceHistory();
      expect(history.length).toBe(5);
      
      for (const entry of history) {
        expect(entry.timestamp).toBeInstanceOf(Date);
        expect(entry.inputs).toBeDefined();
        expect(entry.outputs).toBeDefined();
        expect(entry.efficiency).toBeGreaterThan(0);
      }
    });

    test('should generate performance analytics', () => {
      const inputs: MRFluidSystemInputs = {
        drivingSpeed: 70,
        brakingIntensity: 0.6,
        batterySOC: 0.6,
        motorTemperature: 70,
        magneticFieldStrength: 600000,
        suspensionVelocity: 0.3,
        dampingForce: 2000,
        ambientTemperature: 30,
        operatingFrequency: 15
      };

      // Build performance history
      for (let i = 0; i < 10; i++) {
        mrFluidIntegration.calculateOptimalResponse({
          ...inputs,
          ambientTemperature: 30 + i * 2 // Varying temperature
        });
      }

      const analytics = mrFluidIntegration.getPerformanceAnalytics();
      
      expect(analytics.averageEnergyRecovery).toBeGreaterThan(0);
      expect(analytics.averageEfficiency).toBeGreaterThan(0);
      expect(analytics.temperatureProfile.min).toBeGreaterThan(0);
      expect(analytics.temperatureProfile.max).toBeGreaterThan(analytics.temperatureProfile.min);
      expect(analytics.temperatureProfile.average).toBeGreaterThan(0);
      expect(analytics.operatingHours).toBeGreaterThan(0);
      expect(analytics.formulationUtilization.size).toBeGreaterThan(0);
    });
  });

  describe('System Diagnostics', () => {
    test('should generate system diagnostics', () => {
      const inputs: MRFluidSystemInputs = {
        drivingSpeed: 80,
        brakingIntensity: 0.7,
        batterySOC: 0.5,
        motorTemperature: 75,
        magneticFieldStrength: 700000,
        suspensionVelocity: 0.4,
        dampingForce: 2500,
        ambientTemperature: 35,
        operatingFrequency: 20
      };

      // Build performance history
      for (let i = 0; i < 20; i++) {
        mrFluidIntegration.calculateOptimalResponse(inputs);
      }

      const diagnostics = mrFluidIntegration.generateSystemDiagnostics();
      
      expect(['excellent', 'good', 'fair', 'poor']).toContain(diagnostics.systemHealth);
      expect(diagnostics.issues).toBeInstanceOf(Array);
      expect(diagnostics.recommendations).toBeInstanceOf(Array);
      expect(['improving', 'stable', 'declining']).toContain(diagnostics.performanceTrends.energyRecoveryTrend);
      expect(['improving', 'stable', 'declining']).toContain(diagnostics.performanceTrends.efficiencyTrend);
      expect(['improving', 'stable', 'declining']).toContain(diagnostics.performanceTrends.temperatureTrend);
    });

    test('should identify performance issues', () => {
      // Create conditions that should trigger issues
      const problematicInputs: MRFluidSystemInputs = {
        drivingSpeed: 40,
        brakingIntensity: 0.3,
        batterySOC: 0.9, // High SOC reduces regenerative braking
        motorTemperature: 100,
        magneticFieldStrength: 100000, // Low field
        suspensionVelocity: 0.1,
        dampingForce: 500,
        ambientTemperature: 80, // High temperature
        operatingFrequency: 5
      };

      // Build history with problematic conditions
      for (let i = 0; i < 15; i++) {
        mrFluidIntegration.calculateOptimalResponse(problematicInputs);
      }

      const diagnostics = mrFluidIntegration.generateSystemDiagnostics();
      
      // Should detect issues with high temperature or low efficiency
      expect(diagnostics.systemHealth).not.toBe('excellent');
      expect(diagnostics.issues.length).toBeGreaterThan(0);
      expect(diagnostics.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Updates', () => {
    test('should update system configuration', () => {
      const newConfig = {
        brakingSystemConfig: {
          enableMRFluidBraking: false,
          mrFluidBrakingRatio: 0.5,
          adaptiveFieldControl: false
        }
      };

      mrFluidIntegration.updateConfiguration(newConfig);
      
      const updatedConfig = mrFluidIntegration.getConfiguration();
      expect(updatedConfig.brakingSystemConfig.enableMRFluidBraking).toBe(false);
      expect(updatedConfig.brakingSystemConfig.mrFluidBrakingRatio).toBe(0.5);
      expect(updatedConfig.brakingSystemConfig.adaptiveFieldControl).toBe(false);
    });

    test('should maintain other configuration settings when partially updating', () => {
      const originalConfig = mrFluidIntegration.getConfiguration();
      
      mrFluidIntegration.updateConfiguration({
        thermalManagement: {
          enableCooling: false,
          maxOperatingTemperature: 100,
          thermalDerating: false
        }
      });

      const updatedConfig = mrFluidIntegration.getConfiguration();
      
      // Thermal management should be updated
      expect(updatedConfig.thermalManagement.enableCooling).toBe(false);
      expect(updatedConfig.thermalManagement.maxOperatingTemperature).toBe(100);
      
      // Other settings should remain unchanged
      expect(updatedConfig.selectedFormulation).toBe(originalConfig.selectedFormulation);
      expect(updatedConfig.brakingSystemConfig).toEqual(originalConfig.brakingSystemConfig);
      expect(updatedConfig.suspensionSystemConfig).toEqual(originalConfig.suspensionSystemConfig);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle zero suspension velocity', () => {
      const inputs: MRFluidSystemInputs = {
        drivingSpeed: 60,
        brakingIntensity: 0.5,
        batterySOC: 0.7,
        motorTemperature: 65,
        magneticFieldStrength: 500000,
        suspensionVelocity: 0, // Zero velocity
        dampingForce: 1500,
        ambientTemperature: 25,
        operatingFrequency: 10
      };

      const outputs = mrFluidIntegration.calculateOptimalResponse(inputs);
      
      expect(outputs.suspensionEnergyRecovery).toBe(0);
      expect(outputs.totalEnergyRecovery).toBeGreaterThanOrEqual(0);
    });

    test('should handle extreme magnetic field values', () => {
      const inputs: MRFluidSystemInputs = {
        drivingSpeed: 60,
        brakingIntensity: 0.5,
        batterySOC: 0.7,
        motorTemperature: 65,
        magneticFieldStrength: 10000000, // Extremely high field
        suspensionVelocity: 0.2,
        dampingForce: 1500,
        ambientTemperature: 25,
        operatingFrequency: 10
      };

      const outputs = mrFluidIntegration.calculateOptimalResponse(inputs);
      
      // Should not exceed saturation field
      const currentFormulation = mrFluidIntegration.getCurrentFormulation()!;
      const maxField = currentFormulation.magneticParticles.saturationMagnetization * 0.001;
      
      expect(outputs.magneticFieldRequired).toBeLessThanOrEqual(maxField);
    });

    test('should handle very high frequencies', () => {
      const inputs: MRFluidSystemInputs = {
        drivingSpeed: 60,
        brakingIntensity: 0.5,
        batterySOC: 0.7,
        motorTemperature: 65,
        magneticFieldStrength: 500000,
        suspensionVelocity: 0.2,
        dampingForce: 1500,
        ambientTemperature: 25,
        operatingFrequency: 1000 // Very high frequency
      };

      const outputs = mrFluidIntegration.calculateOptimalResponse(inputs);
      
      // Performance should degrade at very high frequencies
      expect(outputs.totalEnergyRecovery).toBeGreaterThanOrEqual(0);
      expect(outputs.suspensionEnergyRecovery).toBeGreaterThanOrEqual(0);
    });
  });
});