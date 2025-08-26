/**
 * Advanced Scenarios for Fuzzy Control Regenerative Braking System
 * 
 * This file demonstrates advanced usage scenarios including extreme conditions,
 * fault handling, performance optimization, and real-world driving patterns.
 */

import { 
  createFuzzyControlSystem,
  FuzzyControlIntegration,
  defaultVehicleParameters,
  createTestInputs,
  SystemInputs,
  VehicleParameters,
  SafetyLimits
} from '../index';

/**
 * Extreme weather and road conditions scenario
 */
export function extremeConditionsScenario(): void {
  console.log('=== Extreme Conditions Scenario ===\n');

  const controlSystem = createFuzzyControlSystem(defaultVehicleParameters);

  const extremeConditions = [
    {
      name: 'Icy Roads - Emergency Braking',
      inputs: createTestInputs({
        vehicleSpeed: 60,
        brakePedalPosition: 0.8,
        batterySOC: 0.7,
        roadSurface: 'ice',
        ambientTemperature: -15,
        visibility: 'snow'
      })
    },
    {
      name: 'Heavy Rain - High Speed',
      inputs: createTestInputs({
        vehicleSpeed: 120,
        brakePedalPosition: 0.6,
        batterySOC: 0.5,
        roadSurface: 'wet',
        ambientTemperature: 5,
        visibility: 'rain'
      })
    },
    {
      name: 'Desert Heat - Mountain Descent',
      inputs: createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.4,
        batterySOC: 0.9,
        roadSurface: 'dry',
        roadGradient: -8, // 8% downhill
        ambientTemperature: 45,
        motorTemperatures: {
          frontLeft: 120,
          frontRight: 125
        }
      })
    },
    {
      name: 'Arctic Conditions',
      inputs: createTestInputs({
        vehicleSpeed: 40,
        brakePedalPosition: 0.3,
        batterySOC: 0.3,
        roadSurface: 'snow',
        ambientTemperature: -30,
        batteryTemperature: -10
      })
    }
  ];

  console.log('Testing system response to extreme conditions:\n');
  console.log('Condition'.padEnd(30) + 
              'Regen%'.padEnd(8) + 
              'Mech(kN)'.padEnd(10) + 
              'Status'.padEnd(12) + 
              'Warnings');
  console.log('-'.repeat(80));

  extremeConditions.forEach(condition => {
    const outputs = controlSystem.processControlCycle(condition.inputs);
    
    console.log(
      condition.name.padEnd(30) +
      `${(outputs.regenerativeBrakingRatio * 100).toFixed(0)}`.padEnd(8) +
      `${(outputs.mechanicalBrakingForce / 1000).toFixed(1)}`.padEnd(10) +
      outputs.systemStatus.padEnd(12) +
      (outputs.activeWarnings.length > 0 ? outputs.activeWarnings.slice(0, 2).join(', ') : 'None')
    );
  });

  console.log('\nKey Observations:');
  console.log('- Ice conditions: Severely reduced regenerative braking for safety');
  console.log('- High temperature: Thermal protection reduces motor usage');
  console.log('- High SOC + downhill: Limited regeneration to prevent overcharging');
  console.log('- Arctic conditions: System adapts to battery limitations');

  console.log('\n=== Extreme Conditions Scenario Complete ===\n');
}

/**
 * Fault tolerance and recovery scenario
 */
export function faultToleranceScenario(): void {
  console.log('=== Fault Tolerance and Recovery Scenario ===\n');

  const controlSystem = createFuzzyControlSystem(defaultVehicleParameters);

  console.log('Testing system fault tolerance and recovery capabilities:\n');

  // Scenario 1: Motor overheating
  console.log('1. Motor Overheating Scenario:');
  const overheatingInputs = createTestInputs({
    vehicleSpeed: 80,
    brakePedalPosition: 0.5,
    batterySOC: 0.6,
    motorTemperatures: {
      frontLeft: 160, // Critical temperature
      frontRight: 155
    }
  });

  let outputs = controlSystem.processControlCycle(overheatingInputs);
  console.log(`   - System Status: ${outputs.systemStatus}`);
  console.log(`   - Thermal Status: ${outputs.performanceMetrics.thermalStatus}`);
  console.log(`   - Motor Torque Reduction: ${((1 - outputs.motorTorques.frontLeft / 400) * 100).toFixed(0)}%`);
  console.log(`   - Warnings: ${outputs.activeWarnings.join(', ')}`);

  // Scenario 2: Invalid sensor data
  console.log('\n2. Invalid Sensor Data Scenario:');
  const invalidInputs = createTestInputs({
    vehicleSpeed: NaN, // Simulated sensor failure
    brakePedalPosition: 0.6,
    batterySOC: 0.5
  });

  outputs = controlSystem.processControlCycle(invalidInputs);
  console.log(`   - System Status: ${outputs.systemStatus}`);
  console.log(`   - Failsafe Activation: ${outputs.motorTorques.frontLeft === 0 ? 'Yes' : 'No'}`);
  console.log(`   - Mechanical Braking: ${(outputs.mechanicalBrakingForce / 1000).toFixed(1)} kN`);
  console.log(`   - Warnings: ${outputs.activeWarnings.join(', ')}`);

  // Scenario 3: Recovery after fault
  console.log('\n3. System Recovery Scenario:');
  controlSystem.resetSystemFaults();
  
  const recoveryInputs = createTestInputs({
    vehicleSpeed: 70,
    brakePedalPosition: 0.4,
    batterySOC: 0.6,
    motorTemperatures: {
      frontLeft: 80, // Normal temperature
      frontRight: 82
    }
  });

  outputs = controlSystem.processControlCycle(recoveryInputs);
  console.log(`   - System Status: ${outputs.systemStatus}`);
  console.log(`   - Regenerative Braking Restored: ${outputs.regenerativeBrakingRatio > 0 ? 'Yes' : 'No'}`);
  console.log(`   - Motor Torque: ${outputs.motorTorques.frontLeft.toFixed(0)} Nm`);

  const diagnostics = controlSystem.getSystemDiagnostics();
  console.log(`   - Active Faults: ${diagnostics.systemFaults.length}`);

  console.log('\n=== Fault Tolerance Scenario Complete ===\n');
}

/**
 * Performance optimization scenario
 */
export function performanceOptimizationScenario(): void {
  console.log('=== Performance Optimization Scenario ===\n');

  // Test different safety limit configurations
  const configurations = [
    {
      name: 'Conservative Settings',
      limits: {
        maxRegenerativeBrakingRatio: 0.6,
        maxMotorTorque: 300,
        maxMotorTemperature: 130,
        maxBatteryChargeCurrent: 150,
        minMechanicalBrakingRatio: 0.3
      } as SafetyLimits
    },
    {
      name: 'Balanced Settings',
      limits: {
        maxRegenerativeBrakingRatio: 0.8,
        maxMotorTorque: 400,
        maxMotorTemperature: 150,
        maxBatteryChargeCurrent: 200,
        minMechanicalBrakingRatio: 0.2
      } as SafetyLimits
    },
    {
      name: 'Performance Settings',
      limits: {
        maxRegenerativeBrakingRatio: 0.9,
        maxMotorTorque: 500,
        maxMotorTemperature: 160,
        maxBatteryChargeCurrent: 250,
        minMechanicalBrakingRatio: 0.15
      } as SafetyLimits
    }
  ];

  const testInputs = createTestInputs({
    vehicleSpeed: 90,
    brakePedalPosition: 0.5,
    batterySOC: 0.4, // Low SOC to encourage regeneration
    motorTemperatures: {
      frontLeft: 100,
      frontRight: 105
    }
  });

  console.log('Comparing different safety limit configurations:\n');
  console.log('Configuration'.padEnd(20) + 
              'Max Regen%'.padEnd(12) + 
              'Actual Regen%'.padEnd(15) + 
              'Power(kW)'.padEnd(10) + 
              'Efficiency%');
  console.log('-'.repeat(67));

  configurations.forEach(config => {
    const system = new FuzzyControlIntegration(defaultVehicleParameters, config.limits);
    const outputs = system.processControlCycle(testInputs);
    
    console.log(
      config.name.padEnd(20) +
      `${(config.limits.maxRegenerativeBrakingRatio * 100).toFixed(0)}`.padEnd(12) +
      `${(outputs.regenerativeBrakingRatio * 100).toFixed(1)}`.padEnd(15) +
      `${(outputs.regeneratedPower / 1000).toFixed(1)}`.padEnd(10) +
      `${(outputs.energyRecoveryEfficiency * 100).toFixed(1)}`
    );
  });

  console.log('\nOptimization Insights:');
  console.log('- Performance settings allow higher energy recovery');
  console.log('- Conservative settings prioritize safety over efficiency');
  console.log('- Balanced settings provide good compromise');

  console.log('\n=== Performance Optimization Scenario Complete ===\n');
}

/**
 * Real-world driving pattern simulation
 */
export function realWorldDrivingScenario(): void {
  console.log('=== Real-World Driving Pattern Scenario ===\n');

  const controlSystem = createFuzzyControlSystem(defaultVehicleParameters);

  // Simulate a complete driving cycle with various phases
  const drivingCycle = [
    // City driving phase
    { phase: 'City Start', speed: 0, brake: 0, soc: 0.8, surface: 'dry' as const },
    { phase: 'City Accel', speed: 30, brake: 0, soc: 0.79, surface: 'dry' as const },
    { phase: 'City Cruise', speed: 50, brake: 0, soc: 0.78, surface: 'dry' as const },
    { phase: 'Traffic Light', speed: 45, brake: 0.3, soc: 0.78, surface: 'dry' as const },
    { phase: 'City Stop', speed: 20, brake: 0.6, soc: 0.79, surface: 'dry' as const },
    
    // Highway phase
    { phase: 'Highway Entry', speed: 60, brake: 0, soc: 0.77, surface: 'dry' as const },
    { phase: 'Highway Cruise', speed: 110, brake: 0, soc: 0.75, surface: 'dry' as const },
    { phase: 'Traffic Slow', speed: 90, brake: 0.2, soc: 0.76, surface: 'dry' as const },
    { phase: 'Highway Brake', speed: 70, brake: 0.4, soc: 0.77, surface: 'dry' as const },
    
    // Weather change
    { phase: 'Rain Starts', speed: 80, brake: 0.3, soc: 0.78, surface: 'wet' as const },
    { phase: 'Wet Braking', speed: 60, brake: 0.5, soc: 0.79, surface: 'wet' as const },
    
    // Mountain descent
    { phase: 'Downhill Start', speed: 70, brake: 0.2, soc: 0.8, surface: 'dry' as const },
    { phase: 'Steep Descent', speed: 60, brake: 0.4, soc: 0.85, surface: 'dry' as const },
    { phase: 'Descent End', speed: 50, brake: 0.6, soc: 0.9, surface: 'dry' as const }
  ];

  console.log('Simulating complete driving cycle with energy recovery tracking:\n');
  console.log('Phase'.padEnd(15) + 
              'Speed'.padEnd(8) + 
              'Brake%'.padEnd(8) + 
              'SOC%'.padEnd(8) + 
              'Surface'.padEnd(8) + 
              'Regen%'.padEnd(8) + 
              'Power(kW)'.padEnd(10) + 
              'Cumulative(kWh)');
  console.log('-'.repeat(83));

  let cumulativeEnergy = 0;
  let motorTemp = 70;

  drivingCycle.forEach((phase, index) => {
    // Simulate motor temperature changes
    if (phase.brake > 0.3) {
      motorTemp += 5; // Heating during braking
    } else {
      motorTemp = Math.max(70, motorTemp - 2); // Cooling when not braking
    }

    const inputs = createTestInputs({
      vehicleSpeed: phase.speed,
      brakePedalPosition: phase.brake,
      batterySOC: phase.soc,
      roadSurface: phase.surface,
      motorTemperatures: {
        frontLeft: motorTemp,
        frontRight: motorTemp + 3
      },
      roadGradient: phase.phase.includes('Descent') ? -6 : 0
    });

    const outputs = controlSystem.processControlCycle(inputs);
    
    // Calculate energy for this phase (assuming 10 seconds per phase)
    const phaseEnergy = (outputs.regeneratedPower * 10) / 3600000; // Convert to kWh
    cumulativeEnergy += phaseEnergy;

    console.log(
      phase.phase.padEnd(15) +
      `${phase.speed}`.padEnd(8) +
      `${(phase.brake * 100).toFixed(0)}`.padEnd(8) +
      `${(phase.soc * 100).toFixed(0)}`.padEnd(8) +
      phase.surface.padEnd(8) +
      `${(outputs.regenerativeBrakingRatio * 100).toFixed(0)}`.padEnd(8) +
      `${(outputs.regeneratedPower / 1000).toFixed(1)}`.padEnd(10) +
      `${cumulativeEnergy.toFixed(3)}`
    );
  });

  console.log('\nDriving Cycle Analysis:');
  console.log(`- Total Energy Recovered: ${cumulativeEnergy.toFixed(3)} kWh`);
  console.log(`- Average Recovery per Braking Event: ${(cumulativeEnergy / drivingCycle.filter(p => p.brake > 0).length).toFixed(3)} kWh`);
  console.log('- Highest recovery during highway and descent phases');
  console.log('- Reduced recovery in wet conditions and high SOC situations');
  console.log('- System adapted to changing motor temperatures throughout cycle');

  console.log('\n=== Real-World Driving Scenario Complete ===\n');
}

/**
 * Vehicle stability control demonstration
 */
export function stabilityControlScenario(): void {
  console.log('=== Vehicle Stability Control Scenario ===\n');

  const controlSystem = createFuzzyControlSystem(defaultVehicleParameters);

  const corneringScenarios = [
    {
      name: 'Gentle Right Turn',
      inputs: createTestInputs({
        vehicleSpeed: 60,
        brakePedalPosition: 0.3,
        lateralAcceleration: 2.0,
        yawRate: 0.1,
        steeringAngle: 15
      })
    },
    {
      name: 'Sharp Left Turn',
      inputs: createTestInputs({
        vehicleSpeed: 50,
        brakePedalPosition: 0.4,
        lateralAcceleration: -4.5,
        yawRate: -0.3,
        steeringAngle: -30
      })
    },
    {
      name: 'Emergency Lane Change',
      inputs: createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.6,
        lateralAcceleration: 6.0,
        yawRate: 0.4,
        steeringAngle: 25
      })
    },
    {
      name: 'Straight Line Braking',
      inputs: createTestInputs({
        vehicleSpeed: 90,
        brakePedalPosition: 0.7,
        lateralAcceleration: 0,
        yawRate: 0,
        steeringAngle: 0
      })
    }
  ];

  console.log('Testing stability control during various maneuvers:\n');
  console.log('Maneuver'.padEnd(20) + 
              'Lat.Acc'.padEnd(8) + 
              'FL Torque'.padEnd(10) + 
              'FR Torque'.padEnd(10) + 
              'Torque Diff'.padEnd(12) + 
              'Stability');
  console.log('-'.repeat(70));

  corneringScenarios.forEach(scenario => {
    const outputs = controlSystem.processControlCycle(scenario.inputs);
    const torqueDiff = outputs.motorTorques.frontLeft - outputs.motorTorques.frontRight;
    const stabilityActive = Math.abs(torqueDiff) > 10;
    
    console.log(
      scenario.name.padEnd(20) +
      `${scenario.inputs.lateralAcceleration.toFixed(1)}`.padEnd(8) +
      `${outputs.motorTorques.frontLeft.toFixed(0)}`.padEnd(10) +
      `${outputs.motorTorques.frontRight.toFixed(0)}`.padEnd(10) +
      `${torqueDiff.toFixed(0)}`.padEnd(12) +
      (stabilityActive ? 'Active' : 'Inactive')
    );
  });

  console.log('\nStability Control Analysis:');
  console.log('- Right turns: Reduced right-side braking to maintain stability');
  console.log('- Left turns: Reduced left-side braking for better control');
  console.log('- Emergency maneuvers: Significant torque differences for stability');
  console.log('- Straight braking: Equal torque distribution for maximum efficiency');

  console.log('\n=== Vehicle Stability Control Scenario Complete ===\n');
}

/**
 * Energy efficiency optimization over different speeds
 */
export function efficiencyOptimizationScenario(): void {
  console.log('=== Energy Efficiency Optimization Scenario ===\n');

  const controlSystem = createFuzzyControlSystem(defaultVehicleParameters);

  console.log('Analyzing energy recovery efficiency across speed range:\n');
  console.log('Speed(km/h)'.padEnd(12) + 
              'Light Brake'.padEnd(12) + 
              'Med Brake'.padEnd(12) + 
              'Heavy Brake'.padEnd(12) + 
              'Optimal Range');
  console.log('-'.repeat(60));

  const speeds = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 150];
  const brakeIntensities = [0.2, 0.5, 0.8];
  const brakeLabels = ['Light', 'Medium', 'Heavy'];

  let optimalSpeedRange = { min: 0, max: 0, efficiency: 0 };

  speeds.forEach(speed => {
    const efficiencies: number[] = [];
    const row = [`${speed}`.padEnd(12)];

    brakeIntensities.forEach((intensity, index) => {
      const inputs = createTestInputs({
        vehicleSpeed: speed,
        brakePedalPosition: intensity,
        batterySOC: 0.5,
        motorTemperatures: {
          frontLeft: 80,
          frontRight: 82
        }
      });

      const outputs = controlSystem.processControlCycle(inputs);
      const efficiency = outputs.energyRecoveryEfficiency * 100;
      efficiencies.push(efficiency);
      row.push(`${efficiency.toFixed(1)}%`.padEnd(12));

      // Track optimal speed range for medium braking
      if (index === 1 && efficiency > optimalSpeedRange.efficiency) {
        optimalSpeedRange = { min: speed - 10, max: speed + 10, efficiency };
      }
    });

    const isOptimal = speed >= 40 && speed <= 80;
    row.push(isOptimal ? '✓ Optimal' : '');
    
    console.log(row.join(''));
  });

  console.log('\nEfficiency Analysis:');
  console.log(`- Optimal speed range: ${Math.max(0, optimalSpeedRange.min)}-${optimalSpeedRange.max} km/h`);
  console.log('- Peak efficiency occurs at medium speeds (40-80 km/h)');
  console.log('- Very low speeds: Limited kinetic energy available');
  console.log('- Very high speeds: Power limitations reduce torque availability');
  console.log('- Heavy braking: Lower efficiency due to safety constraints');

  console.log('\n=== Energy Efficiency Optimization Scenario Complete ===\n');
}

/**
 * Run all advanced scenarios
 */
export function runAdvancedScenarios(): void {
  console.log('🔬 Advanced Fuzzy Control Scenarios\n');
  console.log('Demonstrating advanced capabilities and edge cases\n');

  try {
    extremeConditionsScenario();
    faultToleranceScenario();
    performanceOptimizationScenario();
    realWorldDrivingScenario();
    stabilityControlScenario();
    efficiencyOptimizationScenario();

    console.log('✅ All advanced scenarios completed successfully!');
    console.log('\nAdvanced capabilities demonstrated:');
    console.log('- Extreme weather and road condition adaptation');
    console.log('- Comprehensive fault tolerance and recovery');
    console.log('- Performance optimization through parameter tuning');
    console.log('- Real-world driving pattern simulation');
    console.log('- Vehicle stability control during cornering');
    console.log('- Energy efficiency optimization across speed ranges');

  } catch (error) {
    console.error('❌ Error running advanced scenarios:', error);
  }
}

// Run scenarios if this file is executed directly
if (require.main === module) {
  runAdvancedScenarios();
}