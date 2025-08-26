/**
 * Comprehensive test suite for Piezoelectric Energy Harvesting System
 */

import {
  PiezoelectricEnergyHarvester,
  NumericalAnalysis,
  PiezoelectricIntegration,
  defaultPiezoelectricMaterials,
  defaultHarvesterConfigurations,
  piezoelectricUtils,
  validationUtils,
  type PiezoelectricMaterial,
  type HarvesterConfiguration,
  type EnvironmentalConditions,
  type MultiSourceInputs,
  type OptimizationParameters
} from '../index';

describe('Piezoelectric Energy Harvesting System', () => {
  let harvester: PiezoelectricEnergyHarvester;
  let numericalAnalysis: NumericalAnalysis;
  let integration: PiezoelectricIntegration;

  beforeEach(() => {
    harvester = new PiezoelectricEnergyHarvester();
    numericalAnalysis = new NumericalAnalysis();
    
    // Mock vehicle parameters for integration tests
    const mockVehicleParams = {
      mass: 1800,
      frontAxleWeightRatio: 0.6,
      wheelRadius: 0.35,
      motorCount: 2,
      maxMotorTorque: 400,
      motorEfficiency: 0.92,
      transmissionRatio: 1.0
    };
    
    integration = new PiezoelectricIntegration(mockVehicleParams);
  });

  describe('PiezoelectricEnergyHarvester', () => {
    test('should initialize with default materials and configurations', () => {
      const diagnostics = harvester.getSystemDiagnostics();
      
      expect(diagnostics.materials.size).toBeGreaterThan(0);
      expect(diagnostics.harvesters.size).toBeGreaterThan(0);
      expect(diagnostics.systemReliability).toBeGreaterThan(0.9);
    });

    test('should calculate piezoelectric power correctly', () => {
      const config: HarvesterConfiguration = {
        type: 'cantilever',
        dimensions: { length: 50, width: 20, thickness: 0.5 },
        material: defaultPiezoelectricMaterials.PZT_5H,
        resonantFrequency: 25,
        dampingRatio: 0.02,
        loadResistance: 100000,
        capacitance: 47
      };

      const conditions: EnvironmentalConditions = {
        temperature: 25,
        humidity: 50,
        vibrationFrequency: 25,
        accelerationAmplitude: 5,
        stressAmplitude: 10,
        roadSurfaceType: 'highway',
        vehicleSpeed: 80
      };

      const performance = harvester.calculatePiezoelectricPower(config, conditions);

      expect(performance.instantaneousPower).toBeGreaterThan(0);
      expect(performance.efficiency).toBeGreaterThan(0);
      expect(performance.efficiency).toBeLessThanOrEqual(100);
      expect(performance.reliability).toBeGreaterThan(0);
      expect(performance.reliability).toBeLessThanOrEqual(100);
      expect(performance.lifespan).toBeGreaterThan(0);
    });

    test('should optimize multi-source harvesting', () => {
      const inputs: MultiSourceInputs = {
        roadVibrations: {
          frequency: 25,
          amplitude: 5,
          powerSpectralDensity: [1, 2, 3, 4, 5]
        },
        suspensionMovement: {
          displacement: 10,
          velocity: 50,
          force: 1000
        },
        tireDeformation: {
          contactPressure: 2,
          deformationRate: 100,
          rollingResistance: 200
        },
        engineVibrations: {
          frequency: 50,
          amplitude: 3
        }
      };

      const constraints: OptimizationParameters = {
        targetPowerOutput: 500,
        maxWeight: 30,
        maxVolume: 5000,
        minReliability: 0.9,
        operatingTemperatureRange: { min: -20, max: 80 },
        costConstraint: 10000
      };

      const result = harvester.optimizeMultiSourceHarvesting(inputs, constraints);

      expect(result.optimalConfiguration.size).toBeGreaterThan(0);
      expect(result.totalPowerOutput).toBeGreaterThan(0);
      expect(result.systemEfficiency).toBeGreaterThan(0);
      expect(result.reliabilityScore).toBeGreaterThan(0);
    });

    test('should handle temperature effects correctly', () => {
      const config: HarvesterConfiguration = {
        type: 'cantilever',
        dimensions: { length: 50, width: 20, thickness: 0.5 },
        material: defaultPiezoelectricMaterials.PZT_5H,
        resonantFrequency: 25,
        dampingRatio: 0.02,
        loadResistance: 100000,
        capacitance: 47
      };

      const normalTemp: EnvironmentalConditions = {
        temperature: 25,
        humidity: 50,
        vibrationFrequency: 25,
        accelerationAmplitude: 5,
        stressAmplitude: 10,
        roadSurfaceType: 'highway',
        vehicleSpeed: 80
      };

      const highTemp: EnvironmentalConditions = {
        ...normalTemp,
        temperature: 150 // Near Curie temperature
      };

      const normalPerformance = harvester.calculatePiezoelectricPower(config, normalTemp);
      const highTempPerformance = harvester.calculatePiezoelectricPower(config, highTemp);

      expect(highTempPerformance.instantaneousPower).toBeLessThan(normalPerformance.instantaneousPower);
      expect(highTempPerformance.efficiency).toBeLessThan(normalPerformance.efficiency);
    });

    test('should add custom materials correctly', () => {
      const customMaterial: PiezoelectricMaterial = {
        name: 'Custom-PZT',
        piezoelectricConstant: 400,
        dielectricConstant: 2000,
        elasticModulus: 70,
        density: 7800,
        couplingCoefficient: 0.65,
        qualityFactor: 80,
        curiTemperature: 250,
        maxStress: 120
      };

      harvester.addCustomMaterial(customMaterial);
      const diagnostics = harvester.getSystemDiagnostics();

      expect(diagnostics.materials.has('Custom-PZT')).toBe(true);
      expect(diagnostics.materials.get('Custom-PZT')).toEqual(customMaterial);
    });
  });

  describe('NumericalAnalysis', () => {
    test('should perform modal analysis', () => {
      const config: HarvesterConfiguration = {
        type: 'cantilever',
        dimensions: { length: 50, width: 20, thickness: 0.5 },
        material: defaultPiezoelectricMaterials.PZT_5H,
        resonantFrequency: 25,
        dampingRatio: 0.02,
        loadResistance: 100000,
        capacitance: 47
      };

      const modalResult = numericalAnalysis.performModalAnalysis(config);

      expect(modalResult.naturalFrequencies).toBeDefined();
      expect(modalResult.modeShapes).toBeDefined();
      expect(modalResult.dampingRatios).toBeDefined();
      expect(modalResult.modalMasses).toBeDefined();
      expect(modalResult.modalStiffnesses).toBeDefined();
    });

    test('should perform frequency response analysis', () => {
      const config: HarvesterConfiguration = {
        type: 'cantilever',
        dimensions: { length: 50, width: 20, thickness: 0.5 },
        material: defaultPiezoelectricMaterials.PZT_5H,
        resonantFrequency: 25,
        dampingRatio: 0.02,
        loadResistance: 100000,
        capacitance: 47
      };

      const frequencyRange = { min: 1, max: 100, points: 50 };
      const response = numericalAnalysis.performFrequencyResponse(config, frequencyRange);

      expect(response.frequencies).toHaveLength(50);
      expect(response.displacement).toHaveLength(50);
      expect(response.velocity).toHaveLength(50);
      expect(response.acceleration).toHaveLength(50);
      expect(response.voltage).toHaveLength(50);
      expect(response.power).toHaveLength(50);
    });

    test('should perform sensitivity analysis', () => {
      const config: HarvesterConfiguration = {
        type: 'cantilever',
        dimensions: { length: 50, width: 20, thickness: 0.5 },
        material: defaultPiezoelectricMaterials.PZT_5H,
        resonantFrequency: 25,
        dampingRatio: 0.02,
        loadResistance: 100000,
        capacitance: 47
      };

      const designVariables = ['length', 'width', 'thickness', 'resonantFrequency'];
      const sensitivity = numericalAnalysis.performSensitivityAnalysis(config, designVariables);

      expect(sensitivity.designVariables).toEqual(designVariables);
      expect(sensitivity.gradients).toHaveLength(designVariables.length);
      expect(sensitivity.sensitivityMatrix).toHaveLength(designVariables.length);
    });

    test('should optimize design parameters', () => {
      const initialConfig: HarvesterConfiguration = {
        type: 'cantilever',
        dimensions: { length: 50, width: 20, thickness: 0.5 },
        material: defaultPiezoelectricMaterials.PZT_5H,
        resonantFrequency: 25,
        dampingRatio: 0.02,
        loadResistance: 100000,
        capacitance: 47
      };

      const designVariables = ['length', 'width', 'thickness'];
      const constraints = [
        { type: 'volume', value: 1000 },
        { type: 'weight', value: 10 }
      ];

      const optimizationResult = numericalAnalysis.optimizeDesign(
        initialConfig,
        designVariables,
        constraints,
        10 // max iterations for test
      );

      expect(optimizationResult.optimalConfig).toBeDefined();
      expect(optimizationResult.objectiveValue).toBeGreaterThan(0);
      expect(optimizationResult.convergenceHistory).toHaveLength(optimizationResult.iterations);
    });
  });

  describe('PiezoelectricIntegration', () => {
    test('should process integrated system correctly', () => {
      const inputs = {
        vehicleSpeed: 80,
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
          frontRight: 62
        },
        ambientTemperature: 20,
        roadSurface: 'dry' as const,
        visibility: 'clear' as const,
        piezoelectricSources: {
          roadVibrations: {
            frequency: 25,
            amplitude: 5,
            powerSpectralDensity: [1, 2, 3, 4, 5]
          },
          suspensionMovement: {
            displacement: 10,
            velocity: 50,
            force: 1000
          },
          tireDeformation: {
            contactPressure: 2,
            deformationRate: 100,
            rollingResistance: 200
          },
          engineVibrations: {
            frequency: 50,
            amplitude: 3
          }
        },
        harvestingEnabled: true,
        optimizationMode: 'balanced' as const,
        environmentalFactors: {
          roadCondition: 'good' as const,
          weatherCondition: 'clear' as const,
          trafficDensity: 'moderate' as const
        }
      };

      const outputs = integration.processIntegratedSystem(inputs);

      expect(outputs.piezoelectricPower).toBeDefined();
      expect(outputs.energyManagement).toBeDefined();
      expect(outputs.systemHealth).toBeDefined();
      expect(outputs.optimization).toBeDefined();
      
      expect(outputs.piezoelectricPower.totalPiezoelectricPower).toBeGreaterThanOrEqual(0);
      expect(outputs.energyManagement.totalEnergyGenerated).toBeGreaterThanOrEqual(0);
      expect(outputs.systemHealth.reliabilityScore).toBeGreaterThan(0);
    });

    test('should adapt energy strategy based on conditions', () => {
      const lowBatteryInputs = {
        vehicleSpeed: 80,
        brakePedalPosition: 0.3,
        acceleratorPedalPosition: 0,
        steeringAngle: 0,
        lateralAcceleration: 0,
        longitudinalAcceleration: -2,
        yawRate: 0,
        roadGradient: 0,
        batterySOC: 0.2, // Low battery
        batteryVoltage: 400,
        batteryCurrent: 50,
        batteryTemperature: 25,
        motorTemperatures: {
          frontLeft: 60,
          frontRight: 62
        },
        ambientTemperature: 20,
        roadSurface: 'dry' as const,
        visibility: 'clear' as const,
        piezoelectricSources: {
          roadVibrations: { frequency: 25, amplitude: 5, powerSpectralDensity: [1, 2, 3] },
          suspensionMovement: { displacement: 10, velocity: 50, force: 1000 },
          tireDeformation: { contactPressure: 2, deformationRate: 100, rollingResistance: 200 },
          engineVibrations: { frequency: 50, amplitude: 3 }
        },
        harvestingEnabled: true,
        optimizationMode: 'power' as const,
        environmentalFactors: {
          roadCondition: 'good' as const,
          weatherCondition: 'clear' as const,
          trafficDensity: 'moderate' as const
        }
      };

      const outputs = integration.processIntegratedSystem(lowBatteryInputs);
      
      // Should adapt to power maximization strategy for low battery
      expect(outputs.optimization.adaptiveAdjustments).toContain('Low battery optimization');
    });

    test('should provide system diagnostics', () => {
      const diagnostics = integration.getSystemDiagnostics();

      expect(diagnostics.piezoelectricDiagnostics).toBeDefined();
      expect(diagnostics.fuzzyControlDiagnostics).toBeDefined();
      expect(diagnostics.energyStrategies.size).toBeGreaterThan(0);
      expect(diagnostics.currentStrategy).toBeDefined();
      expect(diagnostics.maintenanceData).toBeDefined();
    });

    test('should handle custom energy strategies', () => {
      const customStrategy = {
        name: 'Custom High Performance',
        priority: 'power_maximization' as const,
        parameters: {
          regenerativeBrakingWeight: 0.9,
          piezoelectricWeight: 0.9,
          batteryChargingPriority: 0.95,
          systemLoadPriority: 0.5
        },
        adaptiveThresholds: {
          batterySOCThreshold: 0.2,
          temperatureThreshold: 70,
          powerDemandThreshold: 60000
        }
      };

      integration.addEnergyStrategy(customStrategy);
      integration.setEnergyStrategy('custom_high_performance');

      const diagnostics = integration.getSystemDiagnostics();
      expect(diagnostics.energyStrategies.has('custom_high_performance')).toBe(true);
      expect(diagnostics.currentStrategy).toBe('custom_high_performance');
    });
  });

  describe('Utility Functions', () => {
    test('should calculate theoretical max power correctly', () => {
      const material = defaultPiezoelectricMaterials.PZT_5H;
      const dimensions = { length: 50, width: 20, thickness: 0.5 };
      const stress = 10; // MPa
      const frequency = 25; // Hz

      const maxPower = piezoelectricUtils.calculateTheoreticalMaxPower(
        material,
        dimensions,
        stress,
        frequency
      );

      expect(maxPower).toBeGreaterThan(0);
      expect(typeof maxPower).toBe('number');
    });

    test('should calculate cantilever resonant frequency correctly', () => {
      const material = defaultPiezoelectricMaterials.PZT_5H;
      const dimensions = { length: 50, width: 20, thickness: 0.5 };

      const frequency = piezoelectricUtils.calculateCantileverResonantFrequency(
        material,
        dimensions
      );

      expect(frequency).toBeGreaterThan(0);
      expect(typeof frequency).toBe('number');
    });

    test('should calculate optimal load resistance correctly', () => {
      const capacitance = 47; // nF
      const frequency = 25; // Hz

      const resistance = piezoelectricUtils.calculateOptimalLoadResistance(
        capacitance,
        frequency
      );

      expect(resistance).toBeGreaterThan(0);
      expect(typeof resistance).toBe('number');
    });

    test('should estimate lifespan correctly', () => {
      const material = defaultPiezoelectricMaterials.PZT_5H;
      const operatingStress = 50; // MPa
      const operatingTemperature = 40; // °C
      const cyclesPerDay = 10000;

      const lifespan = piezoelectricUtils.estimateLifespan(
        material,
        operatingStress,
        operatingTemperature,
        cyclesPerDay
      );

      expect(lifespan).toBeGreaterThan(0);
      expect(typeof lifespan).toBe('number');
    });
  });

  describe('Validation Functions', () => {
    test('should validate material properties correctly', () => {
      const validMaterial = defaultPiezoelectricMaterials.PZT_5H;
      const invalidMaterial = {
        ...validMaterial,
        piezoelectricConstant: -100 // Invalid negative value
      };

      expect(validationUtils.validateMaterial(validMaterial)).toBe(true);
      expect(validationUtils.validateMaterial(invalidMaterial)).toBe(false);
    });

    test('should validate harvester configuration correctly', () => {
      const validConfig = {
        type: 'cantilever' as const,
        dimensions: { length: 50, width: 20, thickness: 0.5 },
        material: defaultPiezoelectricMaterials.PZT_5H,
        resonantFrequency: 25,
        dampingRatio: 0.02,
        loadResistance: 100000,
        capacitance: 47
      };

      const invalidConfig = {
        ...validConfig,
        dimensions: { length: -50, width: 20, thickness: 0.5 } // Invalid negative length
      };

      expect(validationUtils.validateConfiguration(validConfig)).toBe(true);
      expect(validationUtils.validateConfiguration(invalidConfig)).toBe(false);
    });

    test('should validate environmental conditions correctly', () => {
      const validConditions: EnvironmentalConditions = {
        temperature: 25,
        humidity: 50,
        vibrationFrequency: 25,
        accelerationAmplitude: 5,
        stressAmplitude: 10,
        roadSurfaceType: 'highway',
        vehicleSpeed: 80
      };

      const invalidConditions = {
        ...validConditions,
        humidity: 150 // Invalid humidity > 100%
      };

      expect(validationUtils.validateEnvironmentalConditions(validConditions)).toBe(true);
      expect(validationUtils.validateEnvironmentalConditions(invalidConditions)).toBe(false);
    });
  });

  describe('Performance and Reliability', () => {
    test('should maintain performance under varying conditions', () => {
      const config: HarvesterConfiguration = {
        type: 'cantilever',
        dimensions: { length: 50, width: 20, thickness: 0.5 },
        material: defaultPiezoelectricMaterials.PZT_5H,
        resonantFrequency: 25,
        dampingRatio: 0.02,
        loadResistance: 100000,
        capacitance: 47
      };

      const conditions = [
        { temperature: 0, frequency: 20 },
        { temperature: 25, frequency: 25 },
        { temperature: 50, frequency: 30 },
        { temperature: 75, frequency: 35 }
      ];

      const performances = conditions.map(({ temperature, frequency }) => {
        const envConditions: EnvironmentalConditions = {
          temperature,
          humidity: 50,
          vibrationFrequency: frequency,
          accelerationAmplitude: 5,
          stressAmplitude: 10,
          roadSurfaceType: 'highway',
          vehicleSpeed: 80
        };
        return harvester.calculatePiezoelectricPower(config, envConditions);
      });

      // All performances should be valid
      performances.forEach(performance => {
        expect(performance.instantaneousPower).toBeGreaterThanOrEqual(0);
        expect(performance.efficiency).toBeGreaterThanOrEqual(0);
        expect(performance.reliability).toBeGreaterThanOrEqual(0);
      });

      // Performance should generally decrease with temperature
      expect(performances[3].efficiency).toBeLessThan(performances[0].efficiency);
    });

    test('should handle edge cases gracefully', () => {
      const config: HarvesterConfiguration = {
        type: 'cantilever',
        dimensions: { length: 1, width: 1, thickness: 0.1 }, // Very small harvester
        material: defaultPiezoelectricMaterials.PZT_5H,
        resonantFrequency: 1000, // Very high frequency
        dampingRatio: 0.5, // High damping
        loadResistance: 1000000, // Very high resistance
        capacitance: 1 // Very low capacitance
      };

      const extremeConditions: EnvironmentalConditions = {
        temperature: 100, // High temperature
        humidity: 90,
        vibrationFrequency: 1, // Very low frequency
        accelerationAmplitude: 0.1, // Very low acceleration
        stressAmplitude: 1, // Low stress
        roadSurfaceType: 'smooth',
        vehicleSpeed: 5 // Very low speed
      };

      expect(() => {
        const performance = harvester.calculatePiezoelectricPower(config, extremeConditions);
        expect(performance).toBeDefined();
      }).not.toThrow();
    });
  });
});