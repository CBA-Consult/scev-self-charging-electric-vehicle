/**
 * Basic Usage Example for Rotary Electromagnetic Shock Absorber
 * 
 * This example demonstrates how to use the shock absorber system
 * for energy harvesting in a typical vehicle application.
 */

import {
  RotaryElectromagneticShockAbsorber,
  ShockAbsorberIntegration,
  createShockAbsorberSystem,
  createIntegratedSuspensionSystem,
  createTestSuspensionInputs,
  createTestVehicleSuspensionInputs,
  createTestEnergyManagementInputs,
  DampingMode
} from '../index';

/**
 * Example 1: Basic single shock absorber usage
 */
export function basicShockAbsorberExample(): void {
  console.log('=== Basic Shock Absorber Example ===\n');

  // Create a shock absorber with default parameters
  const shockAbsorber = createShockAbsorberSystem();

  // Set to energy harvesting mode for maximum power generation
  shockAbsorber.setDampingMode('energy_harvesting');

  // Simulate suspension motion from road irregularities
  const suspensionInputs = createTestSuspensionInputs({
    verticalVelocity: 1.2,        // 1.2 m/s vertical velocity
    displacement: 0.08,           // 8cm displacement
    cornerLoad: 550,              // 550kg corner load (front wheel)
    roadCondition: 'rough',       // Rough road surface
    vehicleSpeed: 70,             // 70 km/h vehicle speed
    ambientTemperature: 30        // 30°C ambient temperature
  });

  // Process the motion and get outputs
  const outputs = shockAbsorber.processMotion(suspensionInputs);

  console.log('Suspension Motion Input:');
  console.log(`  Vertical Velocity: ${suspensionInputs.verticalVelocity} m/s`);
  console.log(`  Displacement: ${suspensionInputs.displacement} m`);
  console.log(`  Corner Load: ${suspensionInputs.cornerLoad} kg`);
  console.log(`  Road Condition: ${suspensionInputs.roadCondition}`);
  console.log(`  Vehicle Speed: ${suspensionInputs.vehicleSpeed} km/h\n`);

  console.log('Shock Absorber Output:');
  console.log(`  Generated Power: ${outputs.generatedPower.toFixed(2)} W`);
  console.log(`  Damping Force: ${outputs.dampingForce.toFixed(1)} N`);
  console.log(`  Generator RPM: ${outputs.generatorRPM.toFixed(0)} RPM`);
  console.log(`  System Efficiency: ${(outputs.efficiency * 100).toFixed(1)}%`);
  console.log(`  Output Voltage: ${outputs.outputVoltage.toFixed(1)} V`);
  console.log(`  Output Current: ${outputs.outputCurrent.toFixed(2)} A\n`);

  // Check system status
  const status = shockAbsorber.getSystemStatus();
  console.log('System Status:');
  console.log(`  Operating Mode: ${status.mode}`);
  console.log(`  Flywheel RPM: ${status.flywheelRPM.toFixed(0)} RPM`);
  console.log(`  Operating Temperature: ${status.operatingTemperature.toFixed(1)}°C`);
  console.log(`  System Operational: ${status.isOperational ? 'YES' : 'NO'}\n`);
}

/**
 * Example 2: Vehicle-level integration with all four shock absorbers
 */
export function vehicleIntegrationExample(): void {
  console.log('=== Vehicle Integration Example ===\n');

  // Create integrated suspension system
  const suspensionSystem = createIntegratedSuspensionSystem();

  // Define suspension inputs for all four wheels
  const vehicleSuspensionInputs = createTestVehicleSuspensionInputs({
    frontLeft: {
      verticalVelocity: 1.5,
      displacement: 0.06,
      cornerLoad: 580,  // Slightly more load on front left
      roadCondition: 'rough',
      vehicleSpeed: 80,
      ambientTemperature: 25
    },
    frontRight: {
      verticalVelocity: 1.4,
      displacement: 0.06,
      cornerLoad: 570,
      roadCondition: 'rough',
      vehicleSpeed: 80,
      ambientTemperature: 25
    },
    rearLeft: {
      verticalVelocity: 1.2,
      displacement: 0.05,
      cornerLoad: 460,  // Less load on rear
      roadCondition: 'rough',
      vehicleSpeed: 80,
      ambientTemperature: 25
    },
    rearRight: {
      verticalVelocity: 1.1,
      displacement: 0.05,
      cornerLoad: 450,
      roadCondition: 'rough',
      vehicleSpeed: 80,
      ambientTemperature: 25
    }
  });

  // Define energy management parameters
  const energyManagementInputs = createTestEnergyManagementInputs({
    batterySOC: 0.45,              // 45% battery charge
    powerDemand: 4500,             // 4.5kW power demand
    availableStorageCapacity: 25,   // 25kWh available storage
    gridConnected: false           // Not connected to grid
  });

  // Process the vehicle suspension system
  const vehicleOutputs = suspensionSystem.processVehicleSuspension(
    vehicleSuspensionInputs,
    energyManagementInputs
  );

  console.log('Vehicle Suspension Outputs:');
  console.log('Individual Shock Absorbers:');
  console.log(`  Front Left:  ${vehicleOutputs.frontLeft.generatedPower.toFixed(1)} W, ${vehicleOutputs.frontLeft.dampingForce.toFixed(0)} N`);
  console.log(`  Front Right: ${vehicleOutputs.frontRight.generatedPower.toFixed(1)} W, ${vehicleOutputs.frontRight.dampingForce.toFixed(0)} N`);
  console.log(`  Rear Left:   ${vehicleOutputs.rearLeft.generatedPower.toFixed(1)} W, ${vehicleOutputs.rearLeft.dampingForce.toFixed(0)} N`);
  console.log(`  Rear Right:  ${vehicleOutputs.rearRight.generatedPower.toFixed(1)} W, ${vehicleOutputs.rearRight.dampingForce.toFixed(0)} N\n`);

  console.log('Total System Performance:');
  console.log(`  Total Generated Power: ${vehicleOutputs.totalGeneratedPower.toFixed(2)} W`);
  console.log(`  Average Efficiency: ${(vehicleOutputs.averageEfficiency * 100).toFixed(1)}%`);
  console.log(`  Total Energy Harvested: ${vehicleOutputs.totalEnergyHarvested.toFixed(4)} Wh\n`);

  console.log('Energy Distribution:');
  console.log(`  To Vehicle Systems: ${vehicleOutputs.energyDistribution.toVehicleSystems.toFixed(1)} W`);
  console.log(`  To Battery: ${vehicleOutputs.energyDistribution.toBattery.toFixed(1)} W`);
  console.log(`  To Grid: ${vehicleOutputs.energyDistribution.toGrid.toFixed(1)} W\n`);

  console.log('Performance Metrics:');
  console.log(`  Energy Efficiency: ${(vehicleOutputs.performanceMetrics.energyEfficiency * 100).toFixed(1)}%`);
  console.log(`  Ride Comfort: ${(vehicleOutputs.performanceMetrics.rideComfort * 100).toFixed(1)}%`);
  console.log(`  System Reliability: ${(vehicleOutputs.performanceMetrics.systemReliability * 100).toFixed(1)}%\n`);

  if (vehicleOutputs.optimizationRecommendations.length > 0) {
    console.log('System Recommendations:');
    vehicleOutputs.optimizationRecommendations.forEach((recommendation, index) => {
      console.log(`  ${index + 1}. ${recommendation}`);
    });
    console.log('');
  }
}

/**
 * Example 3: Damping mode comparison
 */
export function dampingModeComparisonExample(): void {
  console.log('=== Damping Mode Comparison Example ===\n');

  const shockAbsorber = createShockAbsorberSystem();

  // Standard test conditions
  const testInputs = createTestSuspensionInputs({
    verticalVelocity: 1.0,
    displacement: 0.05,
    cornerLoad: 500,
    roadCondition: 'rough',
    vehicleSpeed: 60,
    ambientTemperature: 25
  });

  const modes: DampingMode[] = ['comfort', 'sport', 'energy_harvesting', 'adaptive'];

  console.log('Damping Mode Performance Comparison:');
  console.log('Mode              | Power (W) | Damping (N) | Efficiency (%)');
  console.log('------------------|-----------|-------------|---------------');

  modes.forEach(mode => {
    shockAbsorber.resetSystem();
    shockAbsorber.setDampingMode(mode);

    const outputs = shockAbsorber.processMotion(testInputs);

    console.log(`${mode.padEnd(17)} | ${outputs.generatedPower.toFixed(1).padStart(9)} | ${outputs.dampingForce.toFixed(0).padStart(11)} | ${(outputs.efficiency * 100).toFixed(1).padStart(13)}`);
  });
  console.log('');

  // Demonstrate adaptive mode behavior
  console.log('Adaptive Mode Behavior:');
  shockAbsorber.resetSystem();
  shockAbsorber.setDampingMode('adaptive');

  const scenarios = [
    { name: 'Low Speed City', inputs: { ...testInputs, vehicleSpeed: 30 } },
    { name: 'Highway Cruise', inputs: { ...testInputs, vehicleSpeed: 100 } },
    { name: 'Smooth Road', inputs: { ...testInputs, roadCondition: 'smooth' as const } },
    { name: 'Very Rough Road', inputs: { ...testInputs, roadCondition: 'very_rough' as const } }
  ];

  scenarios.forEach(scenario => {
    shockAbsorber.processMotion(scenario.inputs);
    const status = shockAbsorber.getSystemStatus();
    console.log(`  ${scenario.name}: Switched to ${status.mode} mode`);
  });
  console.log('');
}

/**
 * Example 4: Energy harvesting simulation over time
 */
export function energyHarvestingSimulationExample(): void {
  console.log('=== Energy Harvesting Simulation Example ===\n');

  const suspensionSystem = createIntegratedSuspensionSystem();

  // Simulate a 10-minute drive with varying conditions
  const simulationDuration = 600; // 10 minutes in seconds
  const timeStep = 0.1; // 100ms time steps
  const iterations = simulationDuration / timeStep;

  console.log(`Simulating ${simulationDuration / 60} minutes of driving...\n`);

  let totalEnergyHarvested = 0;
  let maxPowerGenerated = 0;
  let averagePowerSum = 0;

  for (let i = 0; i < iterations; i++) {
    const time = i * timeStep;
    
    // Simulate varying road conditions and vehicle dynamics
    const roadRoughness = 0.5 + 0.5 * Math.sin(time * 0.1); // Varying road conditions
    const vehicleSpeed = 50 + 30 * Math.sin(time * 0.05); // Varying speed
    const verticalVelocity = 0.5 + roadRoughness * Math.sin(time * 2); // Road-induced motion

    const suspensionInputs = createTestVehicleSuspensionInputs({
      frontLeft: {
        verticalVelocity: Math.abs(verticalVelocity),
        displacement: 0.03 + roadRoughness * 0.05,
        cornerLoad: 550,
        roadCondition: roadRoughness > 0.7 ? 'very_rough' : roadRoughness > 0.4 ? 'rough' : 'smooth',
        vehicleSpeed: vehicleSpeed,
        ambientTemperature: 25
      }
    });

    const energyInputs = createTestEnergyManagementInputs({
      batterySOC: Math.max(0.2, 0.8 - (time / simulationDuration) * 0.4), // Gradually decreasing battery
      powerDemand: 3000 + vehicleSpeed * 20,
      availableStorageCapacity: 20,
      gridConnected: false
    });

    const outputs = suspensionSystem.processVehicleSuspension(suspensionInputs, energyInputs);

    totalEnergyHarvested += outputs.totalGeneratedPower * timeStep / 3600; // Convert to Wh
    maxPowerGenerated = Math.max(maxPowerGenerated, outputs.totalGeneratedPower);
    averagePowerSum += outputs.totalGeneratedPower;

    // Log progress every minute
    if (i % (60 / timeStep) === 0) {
      const minutes = Math.floor(time / 60);
      console.log(`  ${minutes} min: Power = ${outputs.totalGeneratedPower.toFixed(1)} W, ` +
                 `Energy = ${totalEnergyHarvested.toFixed(3)} Wh, ` +
                 `Efficiency = ${(outputs.averageEfficiency * 100).toFixed(1)}%`);
    }
  }

  const averagePower = averagePowerSum / iterations;
  const systemStatus = suspensionSystem.getSystemStatus();

  console.log('\nSimulation Results:');
  console.log(`  Total Energy Harvested: ${totalEnergyHarvested.toFixed(3)} Wh`);
  console.log(`  Average Power Generation: ${averagePower.toFixed(2)} W`);
  console.log(`  Peak Power Generation: ${maxPowerGenerated.toFixed(2)} W`);
  console.log(`  Energy Harvesting Rate: ${(totalEnergyHarvested / (simulationDuration / 3600)).toFixed(2)} Wh/hour`);
  console.log(`  System Uptime: ${(systemStatus.operationTime / simulationDuration * 100).toFixed(1)}%\n`);

  // Calculate potential daily energy harvest
  const dailyEnergyPotential = (totalEnergyHarvested / (simulationDuration / 3600)) * 24;
  console.log(`Estimated Daily Energy Harvest: ${dailyEnergyPotential.toFixed(2)} Wh`);
  console.log(`Estimated Monthly Energy Harvest: ${(dailyEnergyPotential * 30 / 1000).toFixed(2)} kWh\n`);
}

/**
 * Example 5: Custom parameter configuration
 */
export function customParameterExample(): void {
  console.log('=== Custom Parameter Configuration Example ===\n');

  // Create shock absorber with custom electromagnetic parameters
  const customElectromagneticParams = {
    poleCount: 16,              // More poles for higher power
    fluxDensity: 1.4,           // Higher flux density
    coilTurns: 250,             // More turns for higher voltage
    coilResistance: 0.3,        // Lower resistance for higher current
    coreMaterialPermeability: 6000, // Better core material
    airGapLength: 1.0           // Smaller air gap
  };

  const customMechanicalParams = {
    gearRatio: 20.0,            // Higher gear ratio for more speed
    flywheelInertia: 0.08,      // Larger flywheel for energy storage
    mechanicalEfficiency: 0.95, // Higher efficiency
    maxRotationalSpeed: 4000,   // Higher max speed
    bearingFriction: 0.001      // Lower friction
  };

  const customDampingParams = {
    baseDampingCoefficient: 3000,    // Higher base damping
    variableDampingRange: 0.8,       // Wider damping range
    comfortModeMultiplier: 0.7,      // Softer comfort mode
    sportModeMultiplier: 1.6,        // Stiffer sport mode
    energyHarvestingMultiplier: 1.4  // More aggressive energy harvesting
  };

  const customShockAbsorber = new RotaryElectromagneticShockAbsorber(
    customElectromagneticParams,
    customMechanicalParams,
    customDampingParams
  );

  const standardShockAbsorber = createShockAbsorberSystem();

  // Test both configurations
  const testInputs = createTestSuspensionInputs({
    verticalVelocity: 2.0,
    cornerLoad: 500,
    roadCondition: 'very_rough',
    vehicleSpeed: 80
  });

  customShockAbsorber.setDampingMode('energy_harvesting');
  standardShockAbsorber.setDampingMode('energy_harvesting');

  const customOutputs = customShockAbsorber.processMotion(testInputs);
  const standardOutputs = standardShockAbsorber.processMotion(testInputs);

  console.log('Performance Comparison:');
  console.log('Parameter         | Standard  | Custom    | Improvement');
  console.log('------------------|-----------|-----------|------------');
  console.log(`Generated Power   | ${standardOutputs.generatedPower.toFixed(1).padStart(9)} | ${customOutputs.generatedPower.toFixed(1).padStart(9)} | ${((customOutputs.generatedPower / standardOutputs.generatedPower - 1) * 100).toFixed(1)}%`);
  console.log(`Efficiency        | ${(standardOutputs.efficiency * 100).toFixed(1).padStart(9)} | ${(customOutputs.efficiency * 100).toFixed(1).padStart(9)} | ${((customOutputs.efficiency / standardOutputs.efficiency - 1) * 100).toFixed(1)}%`);
  console.log(`Output Voltage    | ${standardOutputs.outputVoltage.toFixed(1).padStart(9)} | ${customOutputs.outputVoltage.toFixed(1).padStart(9)} | ${((customOutputs.outputVoltage / standardOutputs.outputVoltage - 1) * 100).toFixed(1)}%`);
  console.log(`Generator RPM     | ${standardOutputs.generatorRPM.toFixed(0).padStart(9)} | ${customOutputs.generatorRPM.toFixed(0).padStart(9)} | ${((customOutputs.generatorRPM / standardOutputs.generatorRPM - 1) * 100).toFixed(1)}%`);
  console.log('');

  console.log('Custom Configuration Benefits:');
  console.log(`  ✓ ${((customOutputs.generatedPower / standardOutputs.generatedPower - 1) * 100).toFixed(1)}% increase in power generation`);
  console.log(`  ✓ ${((customOutputs.efficiency / standardOutputs.efficiency - 1) * 100).toFixed(1)}% improvement in efficiency`);
  console.log(`  ✓ ${((customOutputs.outputVoltage / standardOutputs.outputVoltage - 1) * 100).toFixed(1)}% higher output voltage`);
  console.log('');
}

/**
 * Run all basic usage examples
 */
export function runAllBasicExamples(): void {
  console.log('🔧 ROTARY ELECTROMAGNETIC SHOCK ABSORBER - BASIC USAGE EXAMPLES 🔧\n');
  console.log('===================================================================\n');

  try {
    basicShockAbsorberExample();
    vehicleIntegrationExample();
    dampingModeComparisonExample();
    energyHarvestingSimulationExample();
    customParameterExample();

    console.log('✅ ALL BASIC EXAMPLES COMPLETED SUCCESSFULLY');
    
  } catch (error) {
    console.error('❌ EXAMPLE EXECUTION FAILED:', error);
  }
}

// Export individual examples for selective use
export {
  basicShockAbsorberExample,
  vehicleIntegrationExample,
  dampingModeComparisonExample,
  energyHarvestingSimulationExample,
  customParameterExample
};