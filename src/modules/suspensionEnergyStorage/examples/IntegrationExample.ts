/**
 * Integration Example - Suspension Energy Storage with Electromagnetic Shock Absorber
 * 
 * This example demonstrates how to integrate the suspension energy storage system
 * with the existing electromagnetic shock absorber for complete energy harvesting.
 */

import { RotaryElectromagneticShockAbsorber, SuspensionInputs } from '../../electromagneticShockAbsorber/RotaryElectromagneticShockAbsorber';
import { EnergyStorageController } from '../EnergyStorageController';
import { EnergyStorageSystemConfig, SystemIntegrationInputs } from '../types';

/**
 * Complete suspension energy harvesting and storage system
 */
export class CompleteSuspensionEnergySystem {
  private shockAbsorber: RotaryElectromagneticShockAbsorber;
  private energyStorage: EnergyStorageController;
  
  constructor() {
    // Initialize electromagnetic shock absorber
    this.shockAbsorber = new RotaryElectromagneticShockAbsorber(
      {
        poleCount: 12,
        fluxDensity: 1.2,
        coilTurns: 200,
        coilResistance: 0.5,
        coreMaterialPermeability: 5000,
        airGapLength: 1.5
      },
      {
        gearRatio: 15.0,
        flywheelInertia: 0.05,
        mechanicalEfficiency: 0.92,
        maxRotationalSpeed: 3000,
        bearingFriction: 0.002
      }
    );

    // Initialize energy storage system
    const storageConfig: EnergyStorageSystemConfig = {
      capacitorBank: {
        totalCapacitance: 150,
        maxVoltage: 48,
        maxCurrent: 250,
        energyDensity: 5,
        powerDensity: 12000,
        internalResistance: 0.0008,
        temperatureRange: [-40, 75],
        cycleLife: 1200000,
        selfDischargeRate: 0.08
      },
      batteryPack: {
        totalCapacity: 8000, // 8 kWh
        nominalVoltage: 48,
        maxChargeCurrent: 60,
        maxDischargeCurrent: 120,
        energyDensity: 260,
        chargeEfficiency: 0.96,
        dischargeEfficiency: 0.95,
        temperatureRange: [-25, 65],
        socLimits: [0.08, 0.92],
        cycleLife: 6000,
        calendarLife: 12
      },
      powerManagement: {
        maxPowerTransferRate: 3000,
        capacitorChargingThresholds: [0.65, 0.85],
        batterySupplyThresholds: [0.15, 0.92],
        powerSmoothingTimeConstant: 4,
        efficiencyTarget: 0.92,
        thermalThresholds: [65, 85]
      },
      systemId: 'COMPLETE-SESS-001',
      location: 'front_left'
    };

    this.energyStorage = new EnergyStorageController(storageConfig, {
      updateFrequency: 15,
      energyStrategy: 'balanced',
      predictionHorizon: 450,
      optimizationWeights: {
        efficiency: 0.35,
        longevity: 0.25,
        responsiveness: 0.25,
        safety: 0.15
      }
    });
  }

  /**
   * Process complete suspension energy harvesting and storage
   */
  public processCompleteSuspensionSystem(
    suspensionInputs: SuspensionInputs,
    systemInputs: Omit<SystemIntegrationInputs, 'inputPower' | 'inputVoltage' | 'inputCurrent'>
  ) {
    // Process electromagnetic shock absorber
    const shockAbsorberOutputs = this.shockAbsorber.processMotion(suspensionInputs);
    
    // Create energy storage inputs from shock absorber outputs
    const energyStorageInputs: SystemIntegrationInputs = {
      inputPower: shockAbsorberOutputs.generatedPower,
      inputVoltage: shockAbsorberOutputs.outputVoltage,
      inputCurrent: shockAbsorberOutputs.outputCurrent,
      suspensionVelocity: suspensionInputs.verticalVelocity,
      ...systemInputs
    };

    // Process energy storage
    const storageOutputs = this.energyStorage.processControl(energyStorageInputs);

    return {
      shockAbsorber: {
        generatedPower: shockAbsorberOutputs.generatedPower,
        dampingForce: shockAbsorberOutputs.dampingForce,
        generatorRPM: shockAbsorberOutputs.generatorRPM,
        efficiency: shockAbsorberOutputs.efficiency,
        outputVoltage: shockAbsorberOutputs.outputVoltage,
        outputCurrent: shockAbsorberOutputs.outputCurrent
      },
      energyStorage: {
        outputPower: storageOutputs.outputPower,
        outputVoltage: storageOutputs.outputVoltage,
        outputCurrent: storageOutputs.outputCurrent,
        efficiency: storageOutputs.efficiency,
        totalStoredEnergy: storageOutputs.totalStoredEnergy,
        availablePowerCapacity: storageOutputs.availablePowerCapacity,
        recommendedHarvestingMode: storageOutputs.recommendedHarvestingMode,
        systemHealthScore: storageOutputs.systemHealthScore,
        predictedEnergyAvailability: storageOutputs.predictedEnergyAvailability
      },
      combined: {
        totalSystemEfficiency: shockAbsorberOutputs.efficiency * storageOutputs.efficiency,
        energyHarvestingRate: shockAbsorberOutputs.generatedPower,
        energyStorageRate: storageOutputs.outputPower,
        systemStatus: storageOutputs.storageStatus
      }
    };
  }

  /**
   * Get comprehensive system status
   */
  public getSystemStatus() {
    const shockAbsorberStatus = this.shockAbsorber.getSystemStatus();
    const storageStatus = this.energyStorage.getSystemStatus();

    return {
      shockAbsorber: shockAbsorberStatus,
      energyStorage: storageStatus,
      overallHealth: Math.min(
        shockAbsorberStatus.isOperational ? 1.0 : 0.5,
        storageStatus.health
      )
    };
  }
}

/**
 * Demonstration of complete suspension energy system
 */
export function demonstrateCompleteSuspensionEnergySystem(): void {
  console.log('=== Complete Suspension Energy System Demonstration ===\n');

  const completeSystem = new CompleteSuspensionEnergySystem();

  // Test scenario 1: City driving with moderate bumps
  console.log('Scenario 1: City Driving with Moderate Bumps');
  const cityDrivingResult = completeSystem.processCompleteSuspensionSystem(
    {
      verticalVelocity: 0.4,
      displacement: 0.02,
      cornerLoad: 600,
      roadCondition: 'rough',
      vehicleSpeed: 50,
      ambientTemperature: 22
    },
    {
      vehicleSpeed: 50,
      ambientTemperature: 22,
      loadDemand: 250,
      predictedLoad: 230,
      roadConditionForecast: 'rough',
      tripDurationEstimate: 25,
      energyPriority: 'medium'
    }
  );

  displayCompleteSystemResults('City Driving', cityDrivingResult);

  // Test scenario 2: Highway driving with occasional bumps
  console.log('\nScenario 2: Highway Driving');
  const highwayResult = completeSystem.processCompleteSuspensionSystem(
    {
      verticalVelocity: 0.15,
      displacement: 0.008,
      cornerLoad: 550,
      roadCondition: 'smooth',
      vehicleSpeed: 110,
      ambientTemperature: 28
    },
    {
      vehicleSpeed: 110,
      ambientTemperature: 28,
      loadDemand: 400,
      predictedLoad: 420,
      roadConditionForecast: 'smooth',
      tripDurationEstimate: 90,
      energyPriority: 'low'
    }
  );

  displayCompleteSystemResults('Highway Driving', highwayResult);

  // Test scenario 3: Off-road driving with large bumps
  console.log('\nScenario 3: Off-Road Driving');
  const offRoadResult = completeSystem.processCompleteSuspensionSystem(
    {
      verticalVelocity: 1.8,
      displacement: 0.12,
      cornerLoad: 750,
      roadCondition: 'very_rough',
      vehicleSpeed: 30,
      ambientTemperature: 35
    },
    {
      vehicleSpeed: 30,
      ambientTemperature: 35,
      loadDemand: 180,
      predictedLoad: 200,
      roadConditionForecast: 'very_rough',
      tripDurationEstimate: 60,
      energyPriority: 'high'
    }
  );

  displayCompleteSystemResults('Off-Road Driving', offRoadResult);

  // Test scenario 4: Power spike from large pothole
  console.log('\nScenario 4: Large Pothole Impact');
  const potholeResult = completeSystem.processCompleteSuspensionSystem(
    {
      verticalVelocity: 3.2,
      displacement: 0.18,
      cornerLoad: 800,
      roadCondition: 'very_rough',
      vehicleSpeed: 60,
      ambientTemperature: 25
    },
    {
      vehicleSpeed: 60,
      ambientTemperature: 25,
      loadDemand: 300,
      predictedLoad: 280,
      roadConditionForecast: 'rough',
      tripDurationEstimate: 5,
      energyPriority: 'critical'
    }
  );

  displayCompleteSystemResults('Pothole Impact', potholeResult);

  // Display final system status
  console.log('\n--- Final System Status ---');
  const finalStatus = completeSystem.getSystemStatus();
  console.log(`Shock Absorber Status: ${finalStatus.shockAbsorber.isOperational ? 'Operational' : 'Fault'}`);
  console.log(`Energy Storage Health: ${(finalStatus.energyStorage.health * 100).toFixed(1)}%`);
  console.log(`Overall System Health: ${(finalStatus.overallHealth * 100).toFixed(1)}%`);
  console.log(`Energy Storage SOC: Capacitor ${(finalStatus.energyStorage.storage.capacitorSOC * 100).toFixed(1)}%, Battery ${(finalStatus.energyStorage.storage.batterySOC * 100).toFixed(1)}%`);
  console.log(`Total Energy Throughput: ${finalStatus.energyStorage.performance.totalEnergyThroughput.toFixed(3)} kWh`);
}

/**
 * Display results from complete system test
 */
function displayCompleteSystemResults(scenario: string, results: any): void {
  console.log(`  Shock Absorber Generated: ${results.shockAbsorber.generatedPower.toFixed(1)}W`);
  console.log(`  Damping Force: ${results.shockAbsorber.dampingForce.toFixed(0)}N`);
  console.log(`  Generator RPM: ${results.shockAbsorber.generatorRPM.toFixed(0)}`);
  console.log(`  Storage Output: ${results.energyStorage.outputPower.toFixed(1)}W`);
  console.log(`  Total Stored Energy: ${results.energyStorage.totalStoredEnergy.toFixed(1)}Wh`);
  console.log(`  Combined Efficiency: ${(results.combined.totalSystemEfficiency * 100).toFixed(1)}%`);
  console.log(`  Recommended Mode: ${results.energyStorage.recommendedHarvestingMode}`);
  console.log(`  System Health: ${(results.energyStorage.systemHealthScore * 100).toFixed(1)}%`);
}

/**
 * Performance comparison between different energy storage strategies
 */
export function compareEnergyStorageStrategies(): void {
  console.log('\n=== Energy Storage Strategy Comparison ===\n');

  const testInputs = {
    suspension: {
      verticalVelocity: 0.8,
      displacement: 0.05,
      cornerLoad: 650,
      roadCondition: 'rough' as const,
      vehicleSpeed: 70,
      ambientTemperature: 30
    },
    system: {
      vehicleSpeed: 70,
      ambientTemperature: 30,
      loadDemand: 300,
      predictedLoad: 280,
      roadConditionForecast: 'rough' as const,
      tripDurationEstimate: 40,
      energyPriority: 'medium' as const
    }
  };

  // Test conservative strategy
  console.log('Conservative Strategy:');
  const conservativeSystem = new CompleteSuspensionEnergySystem();
  conservativeSystem['energyStorage'].updateConfiguration({
    energyStrategy: 'conservative',
    optimizationWeights: {
      efficiency: 0.2,
      longevity: 0.4,
      responsiveness: 0.2,
      safety: 0.2
    }
  });
  
  const conservativeResult = conservativeSystem.processCompleteSuspensionSystem(
    testInputs.suspension, testInputs.system
  );
  console.log(`  Efficiency: ${(conservativeResult.combined.totalSystemEfficiency * 100).toFixed(1)}%`);
  console.log(`  Energy Storage: ${conservativeResult.energyStorage.totalStoredEnergy.toFixed(1)}Wh`);

  // Test balanced strategy
  console.log('\nBalanced Strategy:');
  const balancedSystem = new CompleteSuspensionEnergySystem();
  balancedSystem['energyStorage'].updateConfiguration({
    energyStrategy: 'balanced',
    optimizationWeights: {
      efficiency: 0.3,
      longevity: 0.25,
      responsiveness: 0.25,
      safety: 0.2
    }
  });
  
  const balancedResult = balancedSystem.processCompleteSuspensionSystem(
    testInputs.suspension, testInputs.system
  );
  console.log(`  Efficiency: ${(balancedResult.combined.totalSystemEfficiency * 100).toFixed(1)}%`);
  console.log(`  Energy Storage: ${balancedResult.energyStorage.totalStoredEnergy.toFixed(1)}Wh`);

  // Test aggressive strategy
  console.log('\nAggressive Strategy:');
  const aggressiveSystem = new CompleteSuspensionEnergySystem();
  aggressiveSystem['energyStorage'].updateConfiguration({
    energyStrategy: 'aggressive',
    optimizationWeights: {
      efficiency: 0.4,
      longevity: 0.1,
      responsiveness: 0.4,
      safety: 0.1
    }
  });
  
  const aggressiveResult = aggressiveSystem.processCompleteSuspensionSystem(
    testInputs.suspension, testInputs.system
  );
  console.log(`  Efficiency: ${(aggressiveResult.combined.totalSystemEfficiency * 100).toFixed(1)}%`);
  console.log(`  Energy Storage: ${aggressiveResult.energyStorage.totalStoredEnergy.toFixed(1)}Wh`);

  console.log('\n✓ Strategy comparison completed');
}

// Run demonstrations if this file is executed directly
if (require.main === module) {
  demonstrateCompleteSuspensionEnergySystem();
  compareEnergyStorageStrategies();
}