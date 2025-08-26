/**
 * Basic Usage Example for Suspension Energy Storage System
 * 
 * This example demonstrates how to set up and use the suspension energy
 * storage system for managing harvested energy from vehicle suspension.
 */

import { EnergyStorageController } from '../EnergyStorageController';
import { SuspensionEnergyStorageSystem } from '../SuspensionEnergyStorageSystem';
import {
  EnergyStorageSystemConfig,
  SystemIntegrationInputs,
  SuspensionEnergyInputs
} from '../types';

/**
 * Example: Basic suspension energy storage system setup
 */
export function basicSuspensionEnergyStorageExample(): void {
  console.log('=== Basic Suspension Energy Storage Example ===\n');

  // Configure the energy storage system
  const storageConfig: EnergyStorageSystemConfig = {
    // Supercapacitor bank configuration
    capacitorBank: {
      totalCapacitance: 100, // 100F total capacitance
      maxVoltage: 48, // 48V maximum voltage
      maxCurrent: 200, // 200A maximum current
      energyDensity: 5, // 5 Wh/kg
      powerDensity: 10000, // 10 kW/kg
      internalResistance: 0.001, // 1 mΩ
      temperatureRange: [-40, 70], // Operating temperature range
      cycleLife: 1000000, // 1 million cycles
      selfDischargeRate: 0.1 // 0.1% per hour
    },

    // Battery pack configuration
    batteryPack: {
      totalCapacity: 5000, // 5 kWh total capacity
      nominalVoltage: 48, // 48V nominal voltage
      maxChargeCurrent: 50, // 50A maximum charge current
      maxDischargeCurrent: 100, // 100A maximum discharge current
      energyDensity: 250, // 250 Wh/kg
      chargeEfficiency: 0.95, // 95% charge efficiency
      dischargeEfficiency: 0.95, // 95% discharge efficiency
      temperatureRange: [-20, 60], // Operating temperature range
      socLimits: [0.1, 0.9], // 10% to 90% SOC limits
      cycleLife: 5000, // 5000 cycles
      calendarLife: 10 // 10 years
    },

    // Power management configuration
    powerManagement: {
      maxPowerTransferRate: 2000, // 2kW maximum transfer rate
      capacitorChargingThresholds: [0.6, 0.8], // Start/stop thresholds
      batterySupplyThresholds: [0.2, 0.9], // Min/max supply thresholds
      powerSmoothingTimeConstant: 5, // 5 second smoothing
      efficiencyTarget: 0.9, // 90% efficiency target
      thermalThresholds: [60, 80] // Warning/critical temperatures
    },

    systemId: 'SESS-001',
    location: 'front_left'
  };

  // Create the energy storage system
  const storageSystem = new SuspensionEnergyStorageSystem(storageConfig);
  console.log('✓ Energy storage system initialized');

  // Create the controller
  const controller = new EnergyStorageController(storageConfig, {
    updateFrequency: 10, // 10 Hz
    energyStrategy: 'balanced',
    predictionHorizon: 300, // 5 minutes
    optimizationWeights: {
      efficiency: 0.3,
      longevity: 0.25,
      responsiveness: 0.25,
      safety: 0.2
    }
  });
  console.log('✓ Energy storage controller initialized\n');

  // Simulate various driving scenarios
  simulateDrivingScenarios(controller);
}

/**
 * Simulate different driving scenarios
 */
function simulateDrivingScenarios(controller: EnergyStorageController): void {
  console.log('--- Simulating Driving Scenarios ---\n');

  // Scenario 1: City driving with moderate energy harvesting
  console.log('Scenario 1: City Driving');
  const cityDrivingInputs: SystemIntegrationInputs = {
    inputPower: 150, // 150W from suspension
    inputVoltage: 24,
    inputCurrent: 6.25,
    suspensionVelocity: 0.3, // Moderate suspension activity
    vehicleSpeed: 45, // 45 km/h
    ambientTemperature: 25,
    loadDemand: 200, // 200W load demand
    predictedLoad: 180,
    roadConditionForecast: 'smooth',
    tripDurationEstimate: 30, // 30 minutes
    energyPriority: 'medium'
  };

  const cityResults = controller.processControl(cityDrivingInputs);
  displayResults('City Driving', cityResults);

  // Scenario 2: Highway driving with low energy harvesting
  console.log('\nScenario 2: Highway Driving');
  const highwayInputs: SystemIntegrationInputs = {
    inputPower: 80, // Lower power due to smooth road
    inputVoltage: 24,
    inputCurrent: 3.33,
    suspensionVelocity: 0.1, // Low suspension activity
    vehicleSpeed: 120, // 120 km/h
    ambientTemperature: 30,
    loadDemand: 300, // Higher load demand
    predictedLoad: 320,
    roadConditionForecast: 'smooth',
    tripDurationEstimate: 60, // 1 hour
    energyPriority: 'low'
  };

  const highwayResults = controller.processControl(highwayInputs);
  displayResults('Highway Driving', highwayResults);

  // Scenario 3: Off-road driving with high energy harvesting
  console.log('\nScenario 3: Off-Road Driving');
  const offRoadInputs: SystemIntegrationInputs = {
    inputPower: 800, // High power from rough terrain
    inputVoltage: 36,
    inputCurrent: 22.22,
    suspensionVelocity: 1.2, // High suspension activity
    vehicleSpeed: 25, // Low speed off-road
    ambientTemperature: 35,
    loadDemand: 150, // Moderate load
    predictedLoad: 160,
    roadConditionForecast: 'very_rough',
    tripDurationEstimate: 45, // 45 minutes
    energyPriority: 'high'
  };

  const offRoadResults = controller.processControl(offRoadInputs);
  displayResults('Off-Road Driving', offRoadResults);

  // Scenario 4: Power spike handling
  console.log('\nScenario 4: Power Spike Handling');
  const spikeInputs: SystemIntegrationInputs = {
    inputPower: 2000, // Large power spike
    inputVoltage: 48,
    inputCurrent: 41.67,
    suspensionVelocity: 2.5, // Very high suspension activity
    vehicleSpeed: 60,
    ambientTemperature: 25,
    loadDemand: 100,
    predictedLoad: 120,
    roadConditionForecast: 'rough',
    tripDurationEstimate: 15,
    energyPriority: 'critical'
  };

  const spikeResults = controller.processControl(spikeInputs);
  displayResults('Power Spike', spikeResults);

  // Display system status
  console.log('\n--- Final System Status ---');
  const systemStatus = controller.getSystemStatus();
  console.log(`Storage SOC: Capacitor ${(systemStatus.storage.capacitorSOC * 100).toFixed(1)}%, Battery ${(systemStatus.storage.batterySOC * 100).toFixed(1)}%`);
  console.log(`System Health: ${(systemStatus.health * 100).toFixed(1)}%`);
  console.log(`Operating Mode: ${systemStatus.storage.operatingMode}`);
  console.log(`Power Flow: ${systemStatus.storage.powerFlow}`);
  console.log(`Total Energy Throughput: ${systemStatus.performance.totalEnergyThroughput.toFixed(2)} kWh`);
  
  if (systemStatus.recommendations.length > 0) {
    console.log('\nRecommendations:');
    systemStatus.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
}

/**
 * Display scenario results
 */
function displayResults(scenario: string, results: any): void {
  console.log(`  Input Power: ${results.outputPower.toFixed(1)}W`);
  console.log(`  Output Voltage: ${results.outputVoltage.toFixed(1)}V`);
  console.log(`  System Efficiency: ${(results.efficiency * 100).toFixed(1)}%`);
  console.log(`  Total Stored Energy: ${results.totalStoredEnergy.toFixed(1)}Wh`);
  console.log(`  Recommended Mode: ${results.recommendedHarvestingMode}`);
  console.log(`  System Health: ${(results.systemHealthScore * 100).toFixed(1)}%`);
  console.log(`  Predicted Energy: ${results.predictedEnergyAvailability.toFixed(1)}Wh`);
}

/**
 * Example: Advanced energy management strategies
 */
export function advancedEnergyManagementExample(): void {
  console.log('\n=== Advanced Energy Management Example ===\n');

  // Configure system for maximum energy harvesting
  const advancedConfig: EnergyStorageSystemConfig = {
    capacitorBank: {
      totalCapacitance: 200, // Larger capacitor bank
      maxVoltage: 60,
      maxCurrent: 300,
      energyDensity: 6,
      powerDensity: 12000,
      internalResistance: 0.0008,
      temperatureRange: [-40, 80],
      cycleLife: 1500000,
      selfDischargeRate: 0.08
    },
    batteryPack: {
      totalCapacity: 10000, // Larger battery pack
      nominalVoltage: 60,
      maxChargeCurrent: 80,
      maxDischargeCurrent: 150,
      energyDensity: 280,
      chargeEfficiency: 0.96,
      dischargeEfficiency: 0.96,
      temperatureRange: [-30, 65],
      socLimits: [0.05, 0.95],
      cycleLife: 8000,
      calendarLife: 15
    },
    powerManagement: {
      maxPowerTransferRate: 5000, // Higher transfer rate
      capacitorChargingThresholds: [0.7, 0.85],
      batterySupplyThresholds: [0.15, 0.95],
      powerSmoothingTimeConstant: 3, // Faster smoothing
      efficiencyTarget: 0.92,
      thermalThresholds: [65, 85]
    },
    systemId: 'SESS-ADV-001',
    location: 'central'
  };

  const controller = new EnergyStorageController(advancedConfig, {
    updateFrequency: 20, // Higher update frequency
    energyStrategy: 'aggressive',
    predictionHorizon: 600, // 10 minutes
    optimizationWeights: {
      efficiency: 0.4, // Higher efficiency weight
      longevity: 0.2,
      responsiveness: 0.3,
      safety: 0.1
    }
  });

  console.log('✓ Advanced energy storage controller initialized');

  // Test extreme conditions
  testExtremeConditions(controller);
}

/**
 * Test extreme operating conditions
 */
function testExtremeConditions(controller: EnergyStorageController): void {
  console.log('\n--- Testing Extreme Conditions ---\n');

  // Test 1: Maximum power spike
  console.log('Test 1: Maximum Power Spike (3kW)');
  const maxSpikeInputs: SystemIntegrationInputs = {
    inputPower: 3000,
    inputVoltage: 60,
    inputCurrent: 50,
    suspensionVelocity: 3.0,
    vehicleSpeed: 80,
    ambientTemperature: 25,
    loadDemand: 500,
    predictedLoad: 600,
    roadConditionForecast: 'very_rough',
    tripDurationEstimate: 10,
    energyPriority: 'critical'
  };

  const maxSpikeResults = controller.processControl(maxSpikeInputs);
  console.log(`  Handled ${maxSpikeInputs.inputPower}W spike`);
  console.log(`  System efficiency: ${(maxSpikeResults.efficiency * 100).toFixed(1)}%`);
  console.log(`  Recommended mode: ${maxSpikeResults.recommendedHarvestingMode}`);

  // Test 2: High temperature operation
  console.log('\nTest 2: High Temperature Operation (45°C)');
  const highTempInputs: SystemIntegrationInputs = {
    inputPower: 500,
    inputVoltage: 48,
    inputCurrent: 10.42,
    suspensionVelocity: 0.8,
    vehicleSpeed: 100,
    ambientTemperature: 45, // High temperature
    loadDemand: 300,
    predictedLoad: 280,
    roadConditionForecast: 'rough',
    tripDurationEstimate: 90,
    energyPriority: 'medium'
  };

  const highTempResults = controller.processControl(highTempInputs);
  console.log(`  Operating at ${highTempInputs.ambientTemperature}°C`);
  console.log(`  System health: ${(highTempResults.systemHealthScore * 100).toFixed(1)}%`);
  console.log(`  Thermal management active: ${highTempResults.storageStatus.warnings.length > 0 ? 'Yes' : 'No'}`);

  // Test 3: Low temperature operation
  console.log('\nTest 3: Low Temperature Operation (-20°C)');
  const lowTempInputs: SystemIntegrationInputs = {
    inputPower: 300,
    inputVoltage: 36,
    inputCurrent: 8.33,
    suspensionVelocity: 0.5,
    vehicleSpeed: 70,
    ambientTemperature: -20, // Low temperature
    loadDemand: 400,
    predictedLoad: 420,
    roadConditionForecast: 'smooth',
    tripDurationEstimate: 120,
    energyPriority: 'high'
  };

  const lowTempResults = controller.processControl(lowTempInputs);
  console.log(`  Operating at ${lowTempInputs.ambientTemperature}°C`);
  console.log(`  System efficiency: ${(lowTempResults.efficiency * 100).toFixed(1)}%`);
  console.log(`  Cold weather impact: ${lowTempResults.efficiency < 0.85 ? 'Significant' : 'Minimal'}`);

  console.log('\n✓ Extreme condition testing completed');
}

// Run the examples
if (require.main === module) {
  basicSuspensionEnergyStorageExample();
  advancedEnergyManagementExample();
}