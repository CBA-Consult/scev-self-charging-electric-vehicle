/**
 * Test Suite for Suspension Energy Storage System
 */

import { SuspensionEnergyStorageSystem } from '../SuspensionEnergyStorageSystem';
import { EnergyStorageSystemConfig, SuspensionEnergyInputs } from '../types';

describe('SuspensionEnergyStorageSystem', () => {
  let storageSystem: SuspensionEnergyStorageSystem;
  let testConfig: EnergyStorageSystemConfig;

  beforeEach(() => {
    testConfig = {
      capacitorBank: {
        totalCapacitance: 100,
        maxVoltage: 48,
        maxCurrent: 200,
        energyDensity: 5,
        powerDensity: 10000,
        internalResistance: 0.001,
        temperatureRange: [-40, 70],
        cycleLife: 1000000,
        selfDischargeRate: 0.1
      },
      batteryPack: {
        totalCapacity: 5000,
        nominalVoltage: 48,
        maxChargeCurrent: 50,
        maxDischargeCurrent: 100,
        energyDensity: 250,
        chargeEfficiency: 0.95,
        dischargeEfficiency: 0.95,
        temperatureRange: [-20, 60],
        socLimits: [0.1, 0.9],
        cycleLife: 5000,
        calendarLife: 10
      },
      powerManagement: {
        maxPowerTransferRate: 2000,
        capacitorChargingThresholds: [0.6, 0.8],
        batterySupplyThresholds: [0.2, 0.9],
        powerSmoothingTimeConstant: 5,
        efficiencyTarget: 0.9,
        thermalThresholds: [60, 80]
      },
      systemId: 'TEST-SESS-001',
      location: 'front_left'
    };

    storageSystem = new SuspensionEnergyStorageSystem(testConfig);
  });

  describe('System Initialization', () => {
    test('should initialize with correct default values', () => {
      const status = storageSystem.getSystemStatus();
      
      expect(status.operational).toBe(true);
      expect(status.capacitorSOC).toBe(0.5);
      expect(status.batterySOC).toBe(0.5);
      expect(status.operatingMode).toBe('standby');
      expect(status.alarms).toHaveLength(0);
      expect(status.warnings).toHaveLength(0);
    });

    test('should initialize energy metrics correctly', () => {
      const energyMetrics = storageSystem.getEnergyFlowMetrics();
      
      expect(energyMetrics.energyInput).toBe(0);
      expect(energyMetrics.energyOutput).toBe(0);
      expect(energyMetrics.energyLosses).toBe(0);
      expect(energyMetrics.roundTripEfficiency).toBe(0.9);
    });
  });

  describe('Energy Processing', () => {
    test('should process charging mode correctly', () => {
      const inputs: SuspensionEnergyInputs = {
        inputPower: 500,
        inputVoltage: 24,
        inputCurrent: 20.83,
        suspensionVelocity: 0.8,
        vehicleSpeed: 60,
        ambientTemperature: 25,
        loadDemand: 0
      };

      const outputs = storageSystem.processEnergyStorage(inputs);
      
      expect(outputs.efficiency).toBeGreaterThan(0.8);
      expect(outputs.totalStoredEnergy).toBeGreaterThan(0);
      expect(outputs.storageStatus.operatingMode).toBe('charging');
    });

    test('should handle power spikes correctly', () => {
      const spikeInputs: SuspensionEnergyInputs = {
        inputPower: 2000, // Large power spike
        inputVoltage: 48,
        inputCurrent: 41.67,
        suspensionVelocity: 2.5,
        vehicleSpeed: 60,
        ambientTemperature: 25,
        loadDemand: 0
      };

      const outputs = storageSystem.processEnergyStorage(spikeInputs);
      
      expect(outputs.efficiency).toBeGreaterThan(0.7);
      expect(outputs.storageStatus.operatingMode).toBe('charging');
      expect(outputs.storageStatus.powerFlow).toBe('input_to_capacitor');
    });

    test('should process discharging mode correctly', () => {
      const dischargingInputs: SuspensionEnergyInputs = {
        inputPower: 0,
        inputVoltage: 0,
        inputCurrent: 0,
        suspensionVelocity: 0,
        vehicleSpeed: 60,
        ambientTemperature: 25,
        loadDemand: 300
      };

      const outputs = storageSystem.processEnergyStorage(dischargingInputs);
      
      expect(outputs.outputPower).toBeGreaterThan(0);
      expect(outputs.storageStatus.operatingMode).toBe('discharging');
    });
  });

  describe('Safety Features', () => {
    test('should detect over-temperature conditions', () => {
      const highTempInputs: SuspensionEnergyInputs = {
        inputPower: 1000,
        inputVoltage: 48,
        inputCurrent: 20.83,
        suspensionVelocity: 1.0,
        vehicleSpeed: 60,
        ambientTemperature: 90, // High temperature
        loadDemand: 0
      };

      // Process multiple cycles to build up temperature
      for (let i = 0; i < 10; i++) {
        storageSystem.processEnergyStorage(highTempInputs);
      }

      const status = storageSystem.getSystemStatus();
      expect(status.warnings.length).toBeGreaterThan(0);
    });

    test('should validate input parameters', () => {
      const invalidInputs: SuspensionEnergyInputs = {
        inputPower: -100, // Invalid negative power
        inputVoltage: 24,
        inputCurrent: 4.17,
        suspensionVelocity: 0.5,
        vehicleSpeed: 60,
        ambientTemperature: 25,
        loadDemand: 0
      };

      expect(() => {
        storageSystem.processEnergyStorage(invalidInputs);
      }).toThrow();
    });

    test('should handle emergency shutdown', () => {
      storageSystem.emergencyShutdown('Test emergency');
      
      const status = storageSystem.getSystemStatus();
      expect(status.operational).toBe(false);
      expect(status.operatingMode).toBe('protection');
      expect(status.alarms.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Metrics', () => {
    test('should track performance metrics correctly', () => {
      const inputs: SuspensionEnergyInputs = {
        inputPower: 300,
        inputVoltage: 24,
        inputCurrent: 12.5,
        suspensionVelocity: 0.6,
        vehicleSpeed: 50,
        ambientTemperature: 25,
        loadDemand: 100
      };

      // Process multiple cycles
      for (let i = 0; i < 5; i++) {
        storageSystem.processEnergyStorage(inputs);
      }

      const metrics = storageSystem.getPerformanceMetrics();
      
      expect(metrics.averagePowerGeneration).toBeGreaterThan(0);
      expect(metrics.harvestingEfficiency).toBeGreaterThan(0.8);
      expect(metrics.systemAvailability).toBe(1.0);
      expect(metrics.totalEnergyThroughput).toBeGreaterThan(0);
    });

    test('should calculate energy flow metrics', () => {
      const inputs: SuspensionEnergyInputs = {
        inputPower: 400,
        inputVoltage: 24,
        inputCurrent: 16.67,
        suspensionVelocity: 0.7,
        vehicleSpeed: 70,
        ambientTemperature: 25,
        loadDemand: 200
      };

      storageSystem.processEnergyStorage(inputs);
      
      const energyFlow = storageSystem.getEnergyFlowMetrics();
      
      expect(energyFlow.energyInput).toBeGreaterThan(0);
      expect(energyFlow.capacitorEnergy).toBeGreaterThan(0);
      expect(energyFlow.batteryEnergy).toBeGreaterThan(0);
    });
  });

  describe('Configuration Updates', () => {
    test('should update configuration correctly', () => {
      const newConfig = {
        powerManagement: {
          ...testConfig.powerManagement,
          maxPowerTransferRate: 3000
        }
      };

      storageSystem.updateConfiguration(newConfig);
      
      // Verify configuration was updated by testing behavior
      const inputs: SuspensionEnergyInputs = {
        inputPower: 2500,
        inputVoltage: 48,
        inputCurrent: 52.08,
        suspensionVelocity: 2.0,
        vehicleSpeed: 60,
        ambientTemperature: 25,
        loadDemand: 0
      };

      const outputs = storageSystem.processEnergyStorage(inputs);
      expect(outputs.efficiency).toBeGreaterThan(0.7);
    });

    test('should reset statistics correctly', () => {
      // Generate some activity first
      const inputs: SuspensionEnergyInputs = {
        inputPower: 300,
        inputVoltage: 24,
        inputCurrent: 12.5,
        suspensionVelocity: 0.6,
        vehicleSpeed: 50,
        ambientTemperature: 25,
        loadDemand: 100
      };

      storageSystem.processEnergyStorage(inputs);
      
      // Reset statistics
      storageSystem.resetStatistics();
      
      const metrics = storageSystem.getPerformanceMetrics();
      expect(metrics.totalEnergyThroughput).toBe(0);
    });
  });

  describe('System Restart', () => {
    test('should restart system after emergency shutdown', () => {
      // Emergency shutdown
      storageSystem.emergencyShutdown('Test shutdown');
      expect(storageSystem.getSystemStatus().operational).toBe(false);
      
      // Clear alarms (simulate fault resolution)
      const status = storageSystem.getSystemStatus();
      status.alarms = [];
      
      // Restart system
      storageSystem.restartSystem();
      expect(storageSystem.getSystemStatus().operational).toBe(true);
    });

    test('should not restart with active alarms', () => {
      storageSystem.emergencyShutdown('Test shutdown');
      
      expect(() => {
        storageSystem.restartSystem();
      }).toThrow();
    });
  });
});