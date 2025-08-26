/**
 * Basic Usage Example for Fuzzy Control Regenerative Braking System
 * 
 * This example demonstrates how to set up and use the fuzzy control system
 * for regenerative braking in a typical electric vehicle scenario.
 */

import { 
  createFuzzyControlSystem,
  defaultVehicleParameters,
  defaultSafetyLimits,
  createTestInputs,
  SystemInputs,
  VehicleParameters
} from '../index';

/**
 * Basic usage example showing system initialization and control cycle
 */
export function basicUsageExample(): void {
  console.log('=== Fuzzy Control Regenerative Braking - Basic Usage Example ===\n');

  // 1. Create the fuzzy control system with default parameters
  console.log('1. Initializing fuzzy control system...');
  const controlSystem = createFuzzyControlSystem(defaultVehicleParameters);
  console.log('✓ System initialized successfully\n');

  // 2. Create typical driving scenario inputs
  console.log('2. Setting up driving scenario...');
  const drivingInputs = createTestInputs({
    vehicleSpeed: 80,              // 80 km/h highway driving
    brakePedalPosition: 0.4,       // Moderate braking (40%)
    acceleratorPedalPosition: 0,   // No acceleration during braking
    batterySOC: 0.65,             // 65% battery charge
    motorTemperatures: {
      frontLeft: 75,              // Normal operating temperature
      frontRight: 78
    },
    roadSurface: 'dry',           // Good road conditions
    visibility: 'clear'           // Clear weather
  });

  console.log('Driving scenario:');
  console.log(`  - Vehicle Speed: ${drivingInputs.vehicleSpeed} km/h`);
  console.log(`  - Brake Pedal: ${(drivingInputs.brakePedalPosition * 100).toFixed(1)}%`);
  console.log(`  - Battery SOC: ${(drivingInputs.batterySOC * 100).toFixed(1)}%`);
  console.log(`  - Road Surface: ${drivingInputs.roadSurface}`);
  console.log('');

  // 3. Process the control cycle
  console.log('3. Processing control cycle...');
  const outputs = controlSystem.processControlCycle(drivingInputs);
  console.log('✓ Control cycle completed\n');

  // 4. Display results
  console.log('4. Control System Results:');
  console.log('Motor Torques:');
  console.log(`  - Front Left Motor: ${outputs.motorTorques.frontLeft.toFixed(1)} Nm`);
  console.log(`  - Front Right Motor: ${outputs.motorTorques.frontRight.toFixed(1)} Nm`);
  
  console.log('\nBraking Distribution:');
  console.log(`  - Regenerative Braking Ratio: ${(outputs.regenerativeBrakingRatio * 100).toFixed(1)}%`);
  console.log(`  - Mechanical Braking Force: ${outputs.mechanicalBrakingForce.toFixed(0)} N`);
  console.log(`  - Total Braking Force: ${outputs.performanceMetrics.totalBrakingForce.toFixed(0)} N`);

  console.log('\nEnergy Recovery:');
  console.log(`  - Regenerated Power: ${(outputs.regeneratedPower / 1000).toFixed(1)} kW`);
  console.log(`  - Energy Recovery Efficiency: ${(outputs.energyRecoveryEfficiency * 100).toFixed(1)}%`);

  console.log('\nSystem Status:');
  console.log(`  - System Status: ${outputs.systemStatus}`);
  console.log(`  - Thermal Status: ${outputs.performanceMetrics.thermalStatus}`);
  console.log(`  - Active Warnings: ${outputs.activeWarnings.length > 0 ? outputs.activeWarnings.join(', ') : 'None'}`);

  console.log('\n=== Example Complete ===\n');
}

/**
 * Example showing different driving scenarios and their impact on regenerative braking
 */
export function scenarioComparisonExample(): void {
  console.log('=== Scenario Comparison Example ===\n');

  const controlSystem = createFuzzyControlSystem(defaultVehicleParameters);

  // Define different scenarios
  const scenarios = [
    {
      name: 'City Driving - Light Braking',
      inputs: createTestInputs({
        vehicleSpeed: 40,
        brakePedalPosition: 0.2,
        batterySOC: 0.7,
        roadSurface: 'dry'
      })
    },
    {
      name: 'Highway - Moderate Braking',
      inputs: createTestInputs({
        vehicleSpeed: 100,
        brakePedalPosition: 0.5,
        batterySOC: 0.5,
        roadSurface: 'dry'
      })
    },
    {
      name: 'Emergency Braking',
      inputs: createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.9,
        batterySOC: 0.6,
        roadSurface: 'dry'
      })
    },
    {
      name: 'Wet Road Conditions',
      inputs: createTestInputs({
        vehicleSpeed: 60,
        brakePedalPosition: 0.4,
        batterySOC: 0.6,
        roadSurface: 'wet'
      })
    },
    {
      name: 'High Battery SOC',
      inputs: createTestInputs({
        vehicleSpeed: 70,
        brakePedalPosition: 0.4,
        batterySOC: 0.95,
        roadSurface: 'dry'
      })
    }
  ];

  console.log('Comparing different driving scenarios:\n');
  console.log('Scenario'.padEnd(25) + 
              'Speed'.padEnd(8) + 
              'Brake%'.padEnd(8) + 
              'Regen%'.padEnd(8) + 
              'Power(kW)'.padEnd(10) + 
              'Efficiency%');
  console.log('-'.repeat(67));

  scenarios.forEach(scenario => {
    const outputs = controlSystem.processControlCycle(scenario.inputs);
    
    console.log(
      scenario.name.padEnd(25) +
      `${scenario.inputs.vehicleSpeed}`.padEnd(8) +
      `${(scenario.inputs.brakePedalPosition * 100).toFixed(0)}`.padEnd(8) +
      `${(outputs.regenerativeBrakingRatio * 100).toFixed(0)}`.padEnd(8) +
      `${(outputs.regeneratedPower / 1000).toFixed(1)}`.padEnd(10) +
      `${(outputs.energyRecoveryEfficiency * 100).toFixed(0)}`
    );
  });

  console.log('\n=== Scenario Comparison Complete ===\n');
}

/**
 * Example showing system behavior with different vehicle configurations
 */
export function vehicleConfigurationExample(): void {
  console.log('=== Vehicle Configuration Example ===\n');

  // Define different vehicle configurations
  const configurations = [
    {
      name: 'Compact EV (2-motor)',
      params: {
        mass: 1400,
        frontAxleWeightRatio: 0.65,
        wheelRadius: 0.32,
        motorCount: 2,
        maxMotorTorque: 300,
        motorEfficiency: 0.91,
        transmissionRatio: 1.0
      } as VehicleParameters
    },
    {
      name: 'Mid-size EV (2-motor)',
      params: defaultVehicleParameters
    },
    {
      name: 'SUV EV (4-motor)',
      params: {
        mass: 2400,
        frontAxleWeightRatio: 0.55,
        wheelRadius: 0.38,
        motorCount: 4,
        maxMotorTorque: 500,
        motorEfficiency: 0.93,
        transmissionRatio: 1.0
      } as VehicleParameters
    },
    {
      name: 'Performance EV (4-motor)',
      params: {
        mass: 2000,
        frontAxleWeightRatio: 0.5,
        wheelRadius: 0.36,
        motorCount: 4,
        maxMotorTorque: 600,
        motorEfficiency: 0.94,
        transmissionRatio: 1.0
      } as VehicleParameters
    }
  ];

  const testInputs = createTestInputs({
    vehicleSpeed: 80,
    brakePedalPosition: 0.5,
    batterySOC: 0.6
  });

  console.log('Comparing different vehicle configurations:\n');
  console.log('Configuration'.padEnd(20) + 
              'Motors'.padEnd(8) + 
              'Mass(kg)'.padEnd(10) + 
              'Regen%'.padEnd(8) + 
              'Power(kW)'.padEnd(10) + 
              'FL Torque(Nm)');
  console.log('-'.repeat(64));

  configurations.forEach(config => {
    const system = createFuzzyControlSystem(config.params);
    const outputs = system.processControlCycle(testInputs);
    
    console.log(
      config.name.padEnd(20) +
      `${config.params.motorCount}`.padEnd(8) +
      `${config.params.mass}`.padEnd(10) +
      `${(outputs.regenerativeBrakingRatio * 100).toFixed(0)}`.padEnd(8) +
      `${(outputs.regeneratedPower / 1000).toFixed(1)}`.padEnd(10) +
      `${outputs.motorTorques.frontLeft.toFixed(0)}`
    );
  });

  console.log('\n=== Vehicle Configuration Example Complete ===\n');
}

/**
 * Example showing system response to changing conditions over time
 */
export function dynamicConditionsExample(): void {
  console.log('=== Dynamic Conditions Example ===\n');

  const controlSystem = createFuzzyControlSystem(defaultVehicleParameters);

  console.log('Simulating changing conditions during a braking event:\n');
  console.log('Time(s)'.padEnd(8) + 
              'Speed'.padEnd(8) + 
              'Brake%'.padEnd(8) + 
              'SOC%'.padEnd(8) + 
              'Temp°C'.padEnd(8) + 
              'Regen%'.padEnd(8) + 
              'Power(kW)');
  console.log('-'.repeat(56));

  // Simulate a 5-second braking event with changing conditions
  for (let time = 0; time <= 5; time += 0.5) {
    // Simulate decreasing speed during braking
    const speed = Math.max(20, 80 - (time * 12));
    
    // Simulate increasing brake pressure
    const brakePosition = Math.min(0.8, 0.3 + (time * 0.1));
    
    // Simulate increasing battery SOC due to regeneration
    const soc = Math.min(0.95, 0.6 + (time * 0.02));
    
    // Simulate increasing motor temperature
    const motorTemp = 70 + (time * 8);

    const inputs = createTestInputs({
      vehicleSpeed: speed,
      brakePedalPosition: brakePosition,
      batterySOC: soc,
      motorTemperatures: {
        frontLeft: motorTemp,
        frontRight: motorTemp + 2
      }
    });

    const outputs = controlSystem.processControlCycle(inputs);

    console.log(
      `${time.toFixed(1)}`.padEnd(8) +
      `${speed.toFixed(0)}`.padEnd(8) +
      `${(brakePosition * 100).toFixed(0)}`.padEnd(8) +
      `${(soc * 100).toFixed(0)}`.padEnd(8) +
      `${motorTemp.toFixed(0)}`.padEnd(8) +
      `${(outputs.regenerativeBrakingRatio * 100).toFixed(0)}`.padEnd(8) +
      `${(outputs.regeneratedPower / 1000).toFixed(1)}`
    );
  }

  console.log('\nObservations:');
  console.log('- Regenerative braking ratio decreases as speed decreases');
  console.log('- Power output decreases with speed despite higher brake pressure');
  console.log('- System adapts to increasing motor temperature and battery SOC');

  console.log('\n=== Dynamic Conditions Example Complete ===\n');
}

/**
 * Example showing system diagnostics and monitoring
 */
export function diagnosticsExample(): void {
  console.log('=== System Diagnostics Example ===\n');

  const controlSystem = createFuzzyControlSystem(defaultVehicleParameters);

  // Run several control cycles to generate performance history
  console.log('Running multiple control cycles to generate diagnostics data...\n');

  const scenarios = [
    { speed: 60, brake: 0.3, soc: 0.7 },
    { speed: 80, brake: 0.5, soc: 0.65 },
    { speed: 100, brake: 0.4, soc: 0.6 },
    { speed: 40, brake: 0.6, soc: 0.55 },
    { speed: 70, brake: 0.35, soc: 0.5 }
  ];

  scenarios.forEach((scenario, index) => {
    const inputs = createTestInputs({
      vehicleSpeed: scenario.speed,
      brakePedalPosition: scenario.brake,
      batterySOC: scenario.soc
    });

    controlSystem.processControlCycle(inputs);
    console.log(`Cycle ${index + 1}: Speed=${scenario.speed}km/h, Brake=${(scenario.brake * 100).toFixed(0)}%, SOC=${(scenario.soc * 100).toFixed(0)}%`);
  });

  // Get system diagnostics
  const diagnostics = controlSystem.getSystemDiagnostics();

  console.log('\nSystem Diagnostics:');
  console.log('==================');

  console.log('\nFuzzy Controller Status:');
  console.log(`  - Operational: ${diagnostics.fuzzyControllerStatus.isOperational}`);
  console.log(`  - Active Rules: ${diagnostics.fuzzyControllerStatus.activeRules}`);
  console.log(`  - Last Calculation: ${new Date(diagnostics.fuzzyControllerStatus.lastCalculationTime).toLocaleTimeString()}`);

  console.log('\nTorque Model Status:');
  console.log(`  - System Health: ${diagnostics.torqueModelStatus.systemHealth}`);
  console.log(`  - Vehicle Mass: ${diagnostics.torqueModelStatus.vehicleParams.mass} kg`);
  console.log(`  - Motor Count: ${diagnostics.torqueModelStatus.vehicleParams.motorCount}`);

  console.log('\nPerformance Metrics:');
  console.log(`  - Total Cycles: ${diagnostics.performanceHistory.length}`);
  console.log(`  - Average Efficiency: ${(diagnostics.averageEfficiency * 100).toFixed(1)}%`);
  console.log(`  - System Faults: ${diagnostics.systemFaults.length > 0 ? diagnostics.systemFaults.join(', ') : 'None'}`);

  if (diagnostics.performanceHistory.length > 0) {
    const efficiencies = diagnostics.performanceHistory.map(h => h.efficiency);
    const minEfficiency = Math.min(...efficiencies);
    const maxEfficiency = Math.max(...efficiencies);
    
    console.log(`  - Min Efficiency: ${(minEfficiency * 100).toFixed(1)}%`);
    console.log(`  - Max Efficiency: ${(maxEfficiency * 100).toFixed(1)}%`);
  }

  console.log('\n=== Diagnostics Example Complete ===\n');
}

/**
 * Run all examples
 */
export function runAllExamples(): void {
  console.log('🚗 Fuzzy Control Regenerative Braking System Examples\n');
  console.log('This demonstration shows various aspects of the fuzzy control system\n');

  try {
    basicUsageExample();
    scenarioComparisonExample();
    vehicleConfigurationExample();
    dynamicConditionsExample();
    diagnosticsExample();

    console.log('✅ All examples completed successfully!');
    console.log('\nThe fuzzy control system demonstrates:');
    console.log('- Adaptive regenerative braking based on driving conditions');
    console.log('- Safety constraints and thermal protection');
    console.log('- Environmental adaptation (road surface, weather)');
    console.log('- Vehicle stability control during cornering');
    console.log('- Comprehensive system monitoring and diagnostics');

  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}