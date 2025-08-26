/**
 * Test suite for Continuous Energy Harvesting System
 * 
 * Tests the enhanced wheel rotational force to energy conversion
 * without reducing propulsion efficiency.
 */

import {
  ContinuousEnergyHarvester,
  FuzzyControlIntegration,
  RegenerativeBrakingTorqueModel,
  createTestInputs,
  defaultVehicleParameters,
  defaultSafetyLimits,
  type WheelRotationInputs,
  type SystemInputs
} from '../index';

describe('Continuous Energy Harvesting System', () => {
  let harvester: ContinuousEnergyHarvester;
  let controlSystem: FuzzyControlIntegration;
  let torqueModel: RegenerativeBrakingTorqueModel;

  beforeEach(() => {
    harvester = new ContinuousEnergyHarvester();
    controlSystem = new FuzzyControlIntegration(defaultVehicleParameters, defaultSafetyLimits);
    torqueModel = new RegenerativeBrakingTorqueModel(defaultVehicleParameters);
  });

  describe('ContinuousEnergyHarvester', () => {
    test('should harvest energy from wheel rotation', () => {
      const inputs: WheelRotationInputs = {
        wheelSpeed: 800,        // RPM
        vehicleSpeed: 60,       // km/h
        wheelTorque: 200,       // Nm
        motorLoad: 0.5,         // 50%
        batterySOC: 0.7,        // 70%
        motorTemperature: 80,   // °C
        roadGradient: 0,        // flat
        ambientTemperature: 25  // °C
      };

      const result = harvester.calculateContinuousHarvesting(inputs);

      expect(result.harvestedPower).toBeGreaterThan(0);
      expect(result.harvestingEfficiency).toBeGreaterThan(0);
      expect(result.harvestingEfficiency).toBeLessThanOrEqual(1);
      expect(result.propulsionEfficiencyImpact).toBeLessThanOrEqual(0.05); // Max 5% impact
      expect(result.netEnergyGain).toBeGreaterThanOrEqual(0);
    });

    test('should not harvest when conditions are not suitable', () => {
      const inputs: WheelRotationInputs = {
        wheelSpeed: 100,        // Low RPM
        vehicleSpeed: 10,       // Low speed (below threshold)
        wheelTorque: 50,        // Low torque
        motorLoad: 0.9,         // High load
        batterySOC: 0.98,       // Nearly full battery
        motorTemperature: 130,  // High temperature
        roadGradient: 0,
        ambientTemperature: 25
      };

      const result = harvester.calculateContinuousHarvesting(inputs);

      expect(result.harvestedPower).toBe(0);
      expect(result.harvestingEfficiency).toBe(0);
      expect(result.propulsionEfficiencyImpact).toBe(0);
    });

    test('should optimize harvesting based on speed', () => {
      const baseInputs: WheelRotationInputs = {
        wheelSpeed: 800,
        vehicleSpeed: 60,
        wheelTorque: 200,
        motorLoad: 0.5,
        batterySOC: 0.7,
        motorTemperature: 80,
        roadGradient: 0,
        ambientTemperature: 25
      };

      // Test at optimal speed (60-80 km/h)
      const optimalResult = harvester.calculateContinuousHarvesting(baseInputs);

      // Test at low speed
      const lowSpeedResult = harvester.calculateContinuousHarvesting({
        ...baseInputs,
        vehicleSpeed: 30,
        wheelSpeed: 400
      });

      // Test at high speed
      const highSpeedResult = harvester.calculateContinuousHarvesting({
        ...baseInputs,
        vehicleSpeed: 120,
        wheelSpeed: 1600
      });

      expect(optimalResult.harvestingEfficiency).toBeGreaterThan(lowSpeedResult.harvestingEfficiency);
      expect(optimalResult.harvestingEfficiency).toBeGreaterThan(highSpeedResult.harvestingEfficiency);
    });
  });

  describe('Enhanced Torque Distribution', () => {
    test('should include continuous harvesting in torque distribution', () => {
      const brakingDemand = {
        totalBrakingForce: 5000,  // N
        brakingIntensity: 0.3,    // 30%
        vehicleSpeed: 60,         // km/h
        roadGradient: 0           // flat
      };

      const result = torqueModel.calculateEnhancedTorqueDistribution(
        brakingDemand,
        0.7,    // 70% regenerative braking ratio
        0.7,    // 70% battery SOC
        0.5,    // 50% motor load
        25000   // 25kW propulsion power
      );

      expect(result.continuousHarvestingPower).toBeDefined();
      expect(result.totalEnergyRecovered).toBeDefined();
      expect(result.propulsionEfficiencyImpact).toBeDefined();
      
      if (result.continuousHarvestingPower) {
        expect(result.continuousHarvestingPower).toBeGreaterThan(0);
      }
      
      if (result.totalEnergyRecovered) {
        expect(result.totalEnergyRecovered).toBeGreaterThanOrEqual(result.regeneratedPower);
      }
      
      if (result.propulsionEfficiencyImpact) {
        expect(result.propulsionEfficiencyImpact).toBeLessThanOrEqual(0.05);
      }
    });

    test('should calculate comprehensive energy efficiency', () => {
      const efficiency = torqueModel.calculateComprehensiveEnergyEfficiency(
        3000,   // regen force (N)
        5000,   // total force (N)
        2000,   // continuous harvesting power (W)
        60,     // vehicle speed (km/h)
        25000   // propulsion power (W)
      );

      expect(efficiency).toBeGreaterThan(0);
      expect(efficiency).toBeLessThanOrEqual(1);
    });
  });

  describe('Integrated System', () => {
    test('should process control cycle with continuous harvesting', () => {
      const inputs: SystemInputs = createTestInputs({
        vehicleSpeed: 60,
        brakePedalPosition: 0.2,
        motorLoad: 0.5,
        propulsionPower: 25000,
        wheelTorque: 200,
        batterySOC: 0.7
      });

      const result = controlSystem.processControlCycle(inputs);

      expect(result.systemStatus).toBe('normal');
      expect(result.energyRecoveryEfficiency).toBeGreaterThan(0);
      expect(result.continuousHarvestingPower).toBeDefined();
      expect(result.totalEnergyRecovered).toBeDefined();
      expect(result.propulsionEfficiencyImpact).toBeDefined();
      expect(result.performanceMetrics.harvestingEfficiency).toBeDefined();
    });

    test('should maintain efficiency without reducing propulsion performance', () => {
      const inputs: SystemInputs = createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0,  // No braking - pure harvesting scenario
        motorLoad: 0.6,
        propulsionPower: 35000,
        wheelTorque: 250,
        batterySOC: 0.6
      });

      const result = controlSystem.processControlCycle(inputs);

      // Verify that propulsion efficiency impact is minimal
      expect(result.propulsionEfficiencyImpact || 0).toBeLessThan(0.05);
      
      // Verify that energy is being harvested
      expect(result.continuousHarvestingPower || 0).toBeGreaterThan(0);
      
      // Verify overall system efficiency
      expect(result.energyRecoveryEfficiency).toBeGreaterThan(0);
    });

    test('should adapt harvesting based on battery state', () => {
      const lowBatteryInputs: SystemInputs = createTestInputs({
        vehicleSpeed: 60,
        batterySOC: 0.3,  // Low battery
        motorLoad: 0.5,
        propulsionPower: 25000
      });

      const highBatteryInputs: SystemInputs = createTestInputs({
        vehicleSpeed: 60,
        batterySOC: 0.9,  // High battery
        motorLoad: 0.5,
        propulsionPower: 25000
      });

      const lowBatteryResult = controlSystem.processControlCycle(lowBatteryInputs);
      const highBatteryResult = controlSystem.processControlCycle(highBatteryInputs);

      // Should harvest more when battery is low
      expect(lowBatteryResult.continuousHarvestingPower || 0)
        .toBeGreaterThan(highBatteryResult.continuousHarvestingPower || 0);
    });
  });

  describe('Performance Validation', () => {
    test('should meet performance requirements', () => {
      const inputs: SystemInputs = createTestInputs({
        vehicleSpeed: 70,
        brakePedalPosition: 0.1,
        motorLoad: 0.5,
        propulsionPower: 30000,
        wheelTorque: 220,
        batterySOC: 0.7
      });

      const result = controlSystem.processControlCycle(inputs);

      // Verify energy recovery efficiency meets target (>85%)
      expect(result.energyRecoveryEfficiency).toBeGreaterThan(0.85);
      
      // Verify propulsion efficiency impact is minimal (<5%)
      expect(result.propulsionEfficiencyImpact || 0).toBeLessThan(0.05);
      
      // Verify continuous harvesting is active
      expect(result.continuousHarvestingPower || 0).toBeGreaterThan(0);
      
      // Verify total energy recovery includes both sources
      const totalRecovered = result.totalEnergyRecovered || 0;
      const regenPower = result.regeneratedPower;
      const harvestingPower = result.continuousHarvestingPower || 0;
      
      expect(totalRecovered).toBeGreaterThanOrEqual(regenPower + harvestingPower);
    });

    test('should maintain thermal safety', () => {
      const highTempInputs: SystemInputs = createTestInputs({
        vehicleSpeed: 60,
        motorTemperatures: {
          frontLeft: 140,   // High temperature
          frontRight: 135
        },
        motorLoad: 0.8,
        propulsionPower: 40000
      });

      const result = controlSystem.processControlCycle(highTempInputs);

      // System should reduce harvesting at high temperatures
      expect(result.performanceMetrics.thermalStatus).toBe('hot');
      expect(result.continuousHarvestingPower || 0).toBeLessThan(1000); // Reduced harvesting
    });
  });
});