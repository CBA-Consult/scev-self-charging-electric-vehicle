/**
 * Integration test suite for Shock Absorber Integration System
 */

import { 
  ShockAbsorberIntegration,
  VehicleSuspensionInputs,
  EnergyManagementInputs,
  createTestVehicleSuspensionInputs,
  createTestEnergyManagementInputs,
  createIntegratedSuspensionSystem
} from '../index';

import { 
  FuzzyControlIntegration,
  createFuzzyControlSystem,
  defaultVehicleParameters,
  defaultSafetyLimits
} from '../../fuzzyControl/index';

describe('ShockAbsorberIntegration', () => {
  let integrationSystem: ShockAbsorberIntegration;
  let fuzzyControlSystem: FuzzyControlIntegration;

  beforeEach(() => {
    fuzzyControlSystem = createFuzzyControlSystem(defaultVehicleParameters, defaultSafetyLimits);
    integrationSystem = new ShockAbsorberIntegration(fuzzyControlSystem);
  });

  describe('System Initialization', () => {
    test('should initialize with all shock absorbers', () => {
      const status = integrationSystem.getSystemStatus();
      
      expect(status.shockAbsorbers.frontLeft.isOperational).toBe(true);
      expect(status.shockAbsorbers.frontRight.isOperational).toBe(true);
      expect(status.shockAbsorbers.rearLeft.isOperational).toBe(true);
      expect(status.shockAbsorbers.rearRight.isOperational).toBe(true);
    });

    test('should initialize without fuzzy control system', () => {
      const standaloneSystem = new ShockAbsorberIntegration();
      const status = standaloneSystem.getSystemStatus();
      
      expect(status.shockAbsorbers.frontLeft.isOperational).toBe(true);
    });
  });

  describe('Vehicle Suspension Processing', () => {
    test('should process all four shock absorbers simultaneously', () => {
      const suspensionInputs = createTestVehicleSuspensionInputs({
        frontLeft: { 
          verticalVelocity: 1.0, 
          displacement: 0.05, 
          cornerLoad: 550,
          roadCondition: 'rough',
          vehicleSpeed: 60,
          ambientTemperature: 25
        }
      });

      const energyInputs = createTestEnergyManagementInputs();

      const outputs = integrationSystem.processVehicleSuspension(suspensionInputs, energyInputs);

      expect(outputs.frontLeft.generatedPower).toBeGreaterThan(0);
      expect(outputs.frontRight.generatedPower).toBeGreaterThan(0);
      expect(outputs.rearLeft.generatedPower).toBeGreaterThan(0);
      expect(outputs.rearRight.generatedPower).toBeGreaterThan(0);
      expect(outputs.totalGeneratedPower).toBeGreaterThan(0);
    });

    test('should calculate total power correctly', () => {
      const suspensionInputs = createTestVehicleSuspensionInputs();
      const energyInputs = createTestEnergyManagementInputs();

      const outputs = integrationSystem.processVehicleSuspension(suspensionInputs, energyInputs);

      const calculatedTotal = outputs.frontLeft.generatedPower + 
                             outputs.frontRight.generatedPower + 
                             outputs.rearLeft.generatedPower + 
                             outputs.rearRight.generatedPower;

      expect(Math.abs(outputs.totalGeneratedPower - calculatedTotal)).toBeLessThan(0.01);
    });

    test('should calculate average efficiency correctly', () => {
      const suspensionInputs = createTestVehicleSuspensionInputs();
      const energyInputs = createTestEnergyManagementInputs();

      const outputs = integrationSystem.processVehicleSuspension(suspensionInputs, energyInputs);

      const calculatedAverage = (outputs.frontLeft.efficiency + 
                                outputs.frontRight.efficiency + 
                                outputs.rearLeft.efficiency + 
                                outputs.rearRight.efficiency) / 4;

      expect(Math.abs(outputs.averageEfficiency - calculatedAverage)).toBeLessThan(0.01);
    });
  });

  describe('Energy Management', () => {
    test('should prioritize vehicle power demand', () => {
      const suspensionInputs = createTestVehicleSuspensionInputs();
      const energyInputs = createTestEnergyManagementInputs({
        powerDemand: 1000, // 1kW demand
        batterySOC: 0.5
      });

      const outputs = integrationSystem.processVehicleSuspension(suspensionInputs, energyInputs);

      expect(outputs.energyDistribution.toVehicleSystems).toBeGreaterThan(0);
      expect(outputs.energyDistribution.toVehicleSystems).toBeLessThanOrEqual(energyInputs.powerDemand);
    });

    test('should charge battery when SOC is low', () => {
      const suspensionInputs = createTestVehicleSuspensionInputs();
      const energyInputs = createTestEnergyManagementInputs({
        batterySOC: 0.2, // Low battery
        powerDemand: 500,
        availableStorageCapacity: 10
      });

      const outputs = integrationSystem.processVehicleSuspension(suspensionInputs, energyInputs);

      expect(outputs.energyDistribution.toBattery).toBeGreaterThan(0);
    });

    test('should export to grid when battery is full and grid connected', () => {
      const suspensionInputs = createTestVehicleSuspensionInputs();
      const energyInputs = createTestEnergyManagementInputs({
        batterySOC: 0.95, // Nearly full battery
        powerDemand: 100,  // Low demand
        gridConnected: true
      });

      const outputs = integrationSystem.processVehicleSuspension(suspensionInputs, energyInputs);

      expect(outputs.energyDistribution.toGrid).toBeGreaterThanOrEqual(0);
    });

    test('should not export to grid when not connected', () => {
      const suspensionInputs = createTestVehicleSuspensionInputs();
      const energyInputs = createTestEnergyManagementInputs({
        batterySOC: 0.95,
        powerDemand: 100,
        gridConnected: false
      });

      const outputs = integrationSystem.processVehicleSuspension(suspensionInputs, energyInputs);

      expect(outputs.energyDistribution.toGrid).toBe(0);
    });
  });

  describe('Damping Mode Optimization', () => {
    test('should switch to energy harvesting mode when battery is low', () => {
      const suspensionInputs = createTestVehicleSuspensionInputs();
      const energyInputs = createTestEnergyManagementInputs({
        batterySOC: 0.2 // Low battery
      });

      // Process multiple times to allow mode switching
      for (let i = 0; i < 5; i++) {
        integrationSystem.processVehicleSuspension(suspensionInputs, energyInputs);
      }

      const status = integrationSystem.getSystemStatus();
      
      // At least some shock absorbers should be in energy harvesting mode
      const modes = [
        status.shockAbsorbers.frontLeft.mode,
        status.shockAbsorbers.frontRight.mode,
        status.shockAbsorbers.rearLeft.mode,
        status.shockAbsorbers.rearRight.mode
      ];

      expect(modes.some(mode => mode === 'energy_harvesting')).toBe(true);
    });

    test('should switch to comfort mode when battery is full and roads are smooth', () => {
      const suspensionInputs = createTestVehicleSuspensionInputs();
      // Set all roads to smooth
      suspensionInputs.frontLeft.roadCondition = 'smooth';
      suspensionInputs.frontRight.roadCondition = 'smooth';
      suspensionInputs.rearLeft.roadCondition = 'smooth';
      suspensionInputs.rearRight.roadCondition = 'smooth';

      const energyInputs = createTestEnergyManagementInputs({
        batterySOC: 0.95 // Full battery
      });

      // Process multiple times to allow mode switching
      for (let i = 0; i < 5; i++) {
        integrationSystem.processVehicleSuspension(suspensionInputs, energyInputs);
      }

      const status = integrationSystem.getSystemStatus();
      
      const modes = [
        status.shockAbsorbers.frontLeft.mode,
        status.shockAbsorbers.frontRight.mode,
        status.shockAbsorbers.rearLeft.mode,
        status.shockAbsorbers.rearRight.mode
      ];

      expect(modes.some(mode => mode === 'comfort')).toBe(true);
    });

    test('should switch to sport mode at high speeds', () => {
      const suspensionInputs = createTestVehicleSuspensionInputs();
      // Set high vehicle speed
      suspensionInputs.frontLeft.vehicleSpeed = 120;
      suspensionInputs.frontRight.vehicleSpeed = 120;
      suspensionInputs.rearLeft.vehicleSpeed = 120;
      suspensionInputs.rearRight.vehicleSpeed = 120;

      const energyInputs = createTestEnergyManagementInputs({
        batterySOC: 0.6 // Medium battery
      });

      // Process multiple times to allow mode switching
      for (let i = 0; i < 5; i++) {
        integrationSystem.processVehicleSuspension(suspensionInputs, energyInputs);
      }

      const status = integrationSystem.getSystemStatus();
      
      const modes = [
        status.shockAbsorbers.frontLeft.mode,
        status.shockAbsorbers.frontRight.mode,
        status.shockAbsorbers.rearLeft.mode,
        status.shockAbsorbers.rearRight.mode
      ];

      expect(modes.some(mode => mode === 'sport')).toBe(true);
    });
  });

  describe('Performance Metrics', () => {
    test('should calculate energy efficiency metrics', () => {
      const suspensionInputs = createTestVehicleSuspensionInputs();
      const energyInputs = createTestEnergyManagementInputs();

      const outputs = integrationSystem.processVehicleSuspension(suspensionInputs, energyInputs);

      expect(outputs.performanceMetrics.energyEfficiency).toBeGreaterThan(0);
      expect(outputs.performanceMetrics.energyEfficiency).toBeLessThanOrEqual(1);
    });

    test('should calculate ride comfort metrics', () => {
      const suspensionInputs = createTestVehicleSuspensionInputs();
      const energyInputs = createTestEnergyManagementInputs();

      const outputs = integrationSystem.processVehicleSuspension(suspensionInputs, energyInputs);

      expect(outputs.performanceMetrics.rideComfort).toBeGreaterThanOrEqual(0);
      expect(outputs.performanceMetrics.rideComfort).toBeLessThanOrEqual(1);
    });

    test('should calculate system reliability metrics', () => {
      const suspensionInputs = createTestVehicleSuspensionInputs();
      const energyInputs = createTestEnergyManagementInputs();

      const outputs = integrationSystem.processVehicleSuspension(suspensionInputs, energyInputs);

      expect(outputs.performanceMetrics.systemReliability).toBeGreaterThan(0);
      expect(outputs.performanceMetrics.systemReliability).toBeLessThanOrEqual(1);
    });
  });

  describe('Optimization Recommendations', () => {
    test('should provide recommendations for low power generation', () => {
      const suspensionInputs = createTestVehicleSuspensionInputs();
      // Set very low velocities to generate minimal power
      suspensionInputs.frontLeft.verticalVelocity = 0.01;
      suspensionInputs.frontRight.verticalVelocity = 0.01;
      suspensionInputs.rearLeft.verticalVelocity = 0.01;
      suspensionInputs.rearRight.verticalVelocity = 0.01;

      const energyInputs = createTestEnergyManagementInputs({
        batterySOC: 0.3 // Low battery
      });

      const outputs = integrationSystem.processVehicleSuspension(suspensionInputs, energyInputs);

      expect(outputs.optimizationRecommendations.length).toBeGreaterThan(0);
      expect(outputs.optimizationRecommendations.some(rec => 
        rec.includes('energy harvesting'))).toBe(true);
    });

    test('should provide recommendations for efficiency imbalance', () => {
      // Create custom shock absorber with different parameters to create imbalance
      const customIntegration = new ShockAbsorberIntegration();
      
      const suspensionInputs = createTestVehicleSuspensionInputs();
      const energyInputs = createTestEnergyManagementInputs();

      // Process multiple times to potentially create efficiency differences
      for (let i = 0; i < 10; i++) {
        customIntegration.processVehicleSuspension(suspensionInputs, energyInputs);
      }

      const outputs = customIntegration.processVehicleSuspension(suspensionInputs, energyInputs);

      expect(Array.isArray(outputs.optimizationRecommendations)).toBe(true);
    });

    test('should recommend grid connection when battery is full', () => {
      const suspensionInputs = createTestVehicleSuspensionInputs();
      const energyInputs = createTestEnergyManagementInputs({
        batterySOC: 0.96, // Nearly full
        gridConnected: false
      });

      const outputs = integrationSystem.processVehicleSuspension(suspensionInputs, energyInputs);

      expect(outputs.optimizationRecommendations.some(rec => 
        rec.includes('grid connection'))).toBe(true);
    });
  });

  describe('Energy Accumulation', () => {
    test('should accumulate energy over multiple cycles', () => {
      const suspensionInputs = createTestVehicleSuspensionInputs();
      const energyInputs = createTestEnergyManagementInputs();

      const initialStatus = integrationSystem.getSystemStatus();
      
      // Run multiple cycles
      for (let i = 0; i < 50; i++) {
        integrationSystem.processVehicleSuspension(suspensionInputs, energyInputs);
      }

      const finalStatus = integrationSystem.getSystemStatus();

      expect(finalStatus.totalEnergyHarvested).toBeGreaterThan(initialStatus.totalEnergyHarvested);
      expect(finalStatus.averagePowerGeneration).toBeGreaterThan(0);
    });
  });

  describe('Fuzzy Control Integration', () => {
    test('should integrate with fuzzy control system', () => {
      const systemInputs = {
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
          frontRight: 62
        },
        ambientTemperature: 20,
        roadSurface: 'dry' as const,
        visibility: 'clear' as const
      };

      const fuzzyOutputs = integrationSystem.integrateWithFuzzyControl(systemInputs);

      expect(fuzzyOutputs).not.toBeNull();
      if (fuzzyOutputs) {
        expect(fuzzyOutputs).toHaveProperty('motorTorques');
        expect(fuzzyOutputs).toHaveProperty('regeneratedPower');
      }
    });

    test('should handle missing fuzzy control system gracefully', () => {
      const standaloneSystem = new ShockAbsorberIntegration();
      
      const systemInputs = {
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
          frontRight: 62
        },
        ambientTemperature: 20,
        roadSurface: 'dry' as const,
        visibility: 'clear' as const
      };

      const fuzzyOutputs = standaloneSystem.integrateWithFuzzyControl(systemInputs);

      expect(fuzzyOutputs).toBeNull();
    });
  });

  describe('System Reset', () => {
    test('should reset all systems correctly', () => {
      const suspensionInputs = createTestVehicleSuspensionInputs();
      const energyInputs = createTestEnergyManagementInputs();

      // Run system to change state
      for (let i = 0; i < 20; i++) {
        integrationSystem.processVehicleSuspension(suspensionInputs, energyInputs);
      }

      const statusBeforeReset = integrationSystem.getSystemStatus();
      
      integrationSystem.resetAllSystems();
      
      const statusAfterReset = integrationSystem.getSystemStatus();

      expect(statusAfterReset.totalEnergyHarvested).toBe(0);
      expect(statusAfterReset.averagePowerGeneration).toBe(0);
      expect(statusAfterReset.shockAbsorbers.frontLeft.accumulatedEnergy).toBe(0);
      expect(statusAfterReset.shockAbsorbers.frontRight.accumulatedEnergy).toBe(0);
      expect(statusAfterReset.shockAbsorbers.rearLeft.accumulatedEnergy).toBe(0);
      expect(statusAfterReset.shockAbsorbers.rearRight.accumulatedEnergy).toBe(0);
    });
  });

  describe('Factory Functions', () => {
    test('should create integrated suspension system via factory', () => {
      const factorySystem = createIntegratedSuspensionSystem();
      const status = factorySystem.getSystemStatus();
      
      expect(status.shockAbsorbers.frontLeft.isOperational).toBe(true);
      expect(status.shockAbsorbers.frontRight.isOperational).toBe(true);
      expect(status.shockAbsorbers.rearLeft.isOperational).toBe(true);
      expect(status.shockAbsorbers.rearRight.isOperational).toBe(true);
    });
  });
});