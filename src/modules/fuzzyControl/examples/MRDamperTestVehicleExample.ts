/**
 * MR Damper Test Vehicle Usage Examples
 * 
 * This file demonstrates how to use the MR Damper Test Vehicle implementation
 * for various testing scenarios and performance evaluation.
 */

import { 
  MRDamperTestVehicle, 
  TestVehicleConfiguration, 
  TestScenario 
} from '../MRDamperTestVehicle';
import { VehicleParameters } from '../FuzzyRegenerativeBrakingController';
import { MRFluidSystemConfiguration } from '../MRFluidIntegration';

/**
 * Basic MR damper test vehicle setup and operation
 */
export async function basicMRDamperTesting(): Promise<void> {
  console.log('\n=== Basic MR Damper Test Vehicle Example ===');

  // Configure test vehicle
  const vehicleConfig: TestVehicleConfiguration = {
    vehicleId: 'MR_TEST_SEDAN_001',
    vehicleType: 'sedan',
    damperCount: 4,
    testEnvironment: {
      enableDataLogging: true,
      logInterval: 100, // 100ms
      enableRealTimeMonitoring: true,
      enablePerformanceAnalytics: true
    },
    operationalLimits: {
      maxTestSpeed: 120, // km/h
      maxAcceleration: 8, // m/s²
      maxDamperForce: 8000, // N
      emergencyStopThreshold: 140 // °C
    }
  };

  // Configure vehicle parameters
  const vehicleParams: VehicleParameters = {
    mass: 1600, // kg - typical sedan
    frontAxleLoad: 0.6,
    rearAxleLoad: 0.4,
    wheelRadius: 0.32, // m
    motorCount: 4,
    maxMotorTorque: 250, // Nm
    maxRegenerativePower: 60000, // W
    batteryCapacity: 75000, // Wh
    aerodynamicDragCoefficient: 0.25,
    frontalArea: 2.4, // m²
    rollingResistanceCoefficient: 0.008
  };

  // Configure MR fluid system
  const mrFluidConfig: MRFluidSystemConfiguration = {
    selectedFormulation: 'high_performance_automotive',
    brakingSystemConfig: {
      enableMRFluidBraking: true,
      mrFluidBrakingRatio: 0.4,
      adaptiveFieldControl: true,
      maxMagneticField: 100000 // A/m
    },
    suspensionSystemConfig: {
      enableMRFluidSuspension: true,
      suspensionEnergyRecovery: true,
      adaptiveDamping: true,
      dampingRange: [800, 6000] // N·s/m
    },
    thermalManagement: {
      thermalDerating: true,
      maxOperatingTemperature: 130, // °C
      coolingSystemEnabled: true,
      temperatureMonitoring: true
    }
  };

  // Create test vehicle
  const testVehicle = new MRDamperTestVehicle(
    vehicleConfig,
    vehicleParams,
    mrFluidConfig
  );

  // Validate system functionality
  const validation = testVehicle.validateFunctionality();
  console.log('System validation:', validation.isValid ? 'PASSED' : 'FAILED');
  if (!validation.isValid) {
    console.log('Issues:', validation.issues);
    console.log('Recommendations:', validation.recommendations);
    return;
  }

  // Define basic test scenario
  const basicScenario: TestScenario = {
    scenarioId: 'BASIC_URBAN_DRIVING',
    name: 'Basic Urban Driving Test',
    description: 'Standard city driving with moderate speeds and typical road conditions',
    duration: 30, // 30 seconds
    roadConditions: {
      surfaceType: 'smooth',
      roughnessLevel: 0.3,
      inclineAngle: 2
    },
    vehicleDynamics: {
      speedProfile: [
        { time: 0, speed: 0 },
        { time: 5, speed: 40 },
        { time: 10, speed: 60 },
        { time: 15, speed: 50 },
        { time: 20, speed: 70 },
        { time: 25, speed: 30 },
        { time: 30, speed: 0 }
      ],
      loadCondition: 0.6, // 60% loaded
      brakingEvents: [
        { time: 12, intensity: 0.5, duration: 2 },
        { time: 22, intensity: 0.7, duration: 3 }
      ]
    },
    environment: {
      temperature: 25, // °C
      humidity: 60, // %
      windSpeed: 8 // m/s
    }
  };

  // Execute test
  console.log(`\nStarting test: ${basicScenario.name}`);
  const testId = await testVehicle.startTest(basicScenario);
  console.log(`Test completed with ID: ${testId}`);

  // Get and display results
  const results = testVehicle.getLatestTestResults();
  if (results) {
    console.log('\n--- Test Results ---');
    console.log(`Duration: ${results.execution.duration.toFixed(1)}s`);
    console.log(`Samples collected: ${results.execution.samplesCollected}`);
    console.log(`Average damping force: ${results.performance.averageDampingForce.toFixed(1)} N`);
    console.log(`Max damping force: ${results.performance.maxDampingForce.toFixed(1)} N`);
    console.log(`Total energy recovered: ${results.performance.totalEnergyRecovered.toFixed(2)} J`);
    console.log(`Damping efficiency: ${results.performance.dampingEfficiency.toFixed(1)}%`);
    console.log(`System reliability: ${results.performance.systemReliability.toFixed(1)}%`);
    console.log(`System health: ${results.diagnostics.systemHealth}`);
    
    if (results.diagnostics.issues.length > 0) {
      console.log('Issues detected:', results.diagnostics.issues);
    }
  }
}

/**
 * Performance testing under various road conditions
 */
export async function performanceTestingScenarios(): Promise<void> {
  console.log('\n=== Performance Testing Scenarios ===');

  // High-performance vehicle configuration
  const performanceVehicleConfig: TestVehicleConfiguration = {
    vehicleId: 'MR_PERFORMANCE_TEST_001',
    vehicleType: 'sports',
    damperCount: 4,
    testEnvironment: {
      enableDataLogging: true,
      logInterval: 50, // Higher frequency for performance testing
      enableRealTimeMonitoring: true,
      enablePerformanceAnalytics: true
    },
    operationalLimits: {
      maxTestSpeed: 200, // km/h - higher for sports car
      maxAcceleration: 12, // m/s²
      maxDamperForce: 12000, // N
      emergencyStopThreshold: 160 // °C
    }
  };

  const sportsCarParams: VehicleParameters = {
    mass: 1400, // kg - lighter sports car
    frontAxleLoad: 0.55,
    rearAxleLoad: 0.45,
    wheelRadius: 0.34, // m - larger wheels
    motorCount: 4,
    maxMotorTorque: 400, // Nm - high performance
    maxRegenerativePower: 100000, // W
    batteryCapacity: 85000, // Wh
    aerodynamicDragCoefficient: 0.22, // Low drag
    frontalArea: 2.1, // m²
    rollingResistanceCoefficient: 0.006 // Low rolling resistance
  };

  const performanceMRConfig: MRFluidSystemConfiguration = {
    selectedFormulation: 'ultra_high_performance',
    brakingSystemConfig: {
      enableMRFluidBraking: true,
      mrFluidBrakingRatio: 0.5,
      adaptiveFieldControl: true,
      maxMagneticField: 120000 // A/m - higher field strength
    },
    suspensionSystemConfig: {
      enableMRFluidSuspension: true,
      suspensionEnergyRecovery: true,
      adaptiveDamping: true,
      dampingRange: [1000, 8000] // N·s/m - wider range
    },
    thermalManagement: {
      thermalDerating: true,
      maxOperatingTemperature: 150, // °C - higher limit
      coolingSystemEnabled: true,
      temperatureMonitoring: true
    }
  };

  const performanceVehicle = new MRDamperTestVehicle(
    performanceVehicleConfig,
    sportsCarParams,
    performanceMRConfig
  );

  // Test scenarios for different conditions
  const testScenarios: TestScenario[] = [
    {
      scenarioId: 'SMOOTH_HIGHWAY',
      name: 'Smooth Highway Driving',
      description: 'High-speed highway driving on smooth roads',
      duration: 20,
      roadConditions: {
        surfaceType: 'smooth',
        roughnessLevel: 0.1,
        inclineAngle: 1
      },
      vehicleDynamics: {
        speedProfile: [
          { time: 0, speed: 60 },
          { time: 5, speed: 120 },
          { time: 10, speed: 150 },
          { time: 15, speed: 180 },
          { time: 20, speed: 120 }
        ],
        loadCondition: 0.3,
        brakingEvents: [
          { time: 16, intensity: 0.8, duration: 2 }
        ]
      },
      environment: {
        temperature: 30,
        humidity: 40,
        windSpeed: 15
      }
    },
    {
      scenarioId: 'ROUGH_TERRAIN',
      name: 'Rough Terrain Test',
      description: 'Challenging off-road conditions',
      duration: 25,
      roadConditions: {
        surfaceType: 'rough',
        roughnessLevel: 0.9,
        inclineAngle: 8
      },
      vehicleDynamics: {
        speedProfile: [
          { time: 0, speed: 0 },
          { time: 5, speed: 40 },
          { time: 10, speed: 60 },
          { time: 15, speed: 80 },
          { time: 20, speed: 50 },
          { time: 25, speed: 20 }
        ],
        loadCondition: 0.8,
        brakingEvents: [
          { time: 8, intensity: 0.6, duration: 1.5 },
          { time: 18, intensity: 0.9, duration: 2.5 }
        ]
      },
      environment: {
        temperature: 35,
        humidity: 70,
        windSpeed: 20
      }
    },
    {
      scenarioId: 'EXTREME_CONDITIONS',
      name: 'Extreme Environmental Test',
      description: 'Testing under extreme temperature and conditions',
      duration: 15,
      roadConditions: {
        surfaceType: 'mixed',
        roughnessLevel: 0.7,
        inclineAngle: 12
      },
      vehicleDynamics: {
        speedProfile: [
          { time: 0, speed: 0 },
          { time: 3, speed: 80 },
          { time: 8, speed: 140 },
          { time: 12, speed: 100 },
          { time: 15, speed: 40 }
        ],
        loadCondition: 1.0, // Full load
        brakingEvents: [
          { time: 9, intensity: 1.0, duration: 2 }
        ]
      },
      environment: {
        temperature: 45, // High temperature
        humidity: 90,
        windSpeed: 25
      }
    }
  ];

  // Execute all test scenarios
  for (const scenario of testScenarios) {
    console.log(`\nExecuting: ${scenario.name}`);
    
    try {
      const testId = await performanceVehicle.startTest(scenario);
      const results = performanceVehicle.getLatestTestResults();
      
      if (results) {
        console.log(`✓ Test completed successfully`);
        console.log(`  Energy recovered: ${results.performance.totalEnergyRecovered.toFixed(2)} J`);
        console.log(`  Max damping force: ${results.performance.maxDampingForce.toFixed(0)} N`);
        console.log(`  Efficiency: ${results.performance.dampingEfficiency.toFixed(1)}%`);
        console.log(`  Reliability: ${results.performance.systemReliability.toFixed(1)}%`);
        console.log(`  System health: ${results.diagnostics.systemHealth}`);
        
        if (results.diagnostics.issues.length > 0) {
          console.log(`  ⚠ Issues: ${results.diagnostics.issues.join(', ')}`);
        }
      }
    } catch (error) {
      console.log(`✗ Test failed: ${error}`);
    }
  }

  // Display overall performance summary
  const testHistory = performanceVehicle.getTestHistory();
  console.log('\n--- Performance Summary ---');
  console.log(`Total tests completed: ${testHistory.length}`);
  
  if (testHistory.length > 0) {
    const avgEfficiency = testHistory.reduce((sum, test) => 
      sum + test.performance.dampingEfficiency, 0) / testHistory.length;
    const avgReliability = testHistory.reduce((sum, test) => 
      sum + test.performance.systemReliability, 0) / testHistory.length;
    const totalEnergyRecovered = testHistory.reduce((sum, test) => 
      sum + test.performance.totalEnergyRecovered, 0);
    
    console.log(`Average efficiency: ${avgEfficiency.toFixed(1)}%`);
    console.log(`Average reliability: ${avgReliability.toFixed(1)}%`);
    console.log(`Total energy recovered: ${totalEnergyRecovered.toFixed(2)} J`);
  }
}

/**
 * Comparative analysis of different MR fluid formulations
 */
export async function mrFluidFormulationComparison(): Promise<void> {
  console.log('\n=== MR Fluid Formulation Comparison ===');

  const baseVehicleConfig: TestVehicleConfiguration = {
    vehicleId: 'MR_COMPARISON_TEST',
    vehicleType: 'sedan',
    damperCount: 4,
    testEnvironment: {
      enableDataLogging: true,
      logInterval: 100,
      enableRealTimeMonitoring: true,
      enablePerformanceAnalytics: true
    },
    operationalLimits: {
      maxTestSpeed: 100,
      maxAcceleration: 6,
      maxDamperForce: 8000,
      emergencyStopThreshold: 130
    }
  };

  const baseVehicleParams: VehicleParameters = {
    mass: 1500,
    frontAxleLoad: 0.6,
    rearAxleLoad: 0.4,
    wheelRadius: 0.32,
    motorCount: 4,
    maxMotorTorque: 200,
    maxRegenerativePower: 50000,
    batteryCapacity: 60000,
    aerodynamicDragCoefficient: 0.28,
    frontalArea: 2.3,
    rollingResistanceCoefficient: 0.01
  };

  // Test different MR fluid formulations
  const formulations = [
    'standard_automotive',
    'high_performance_automotive',
    'ultra_high_performance'
  ];

  const comparisonScenario: TestScenario = {
    scenarioId: 'FORMULATION_COMPARISON',
    name: 'MR Fluid Formulation Comparison',
    description: 'Standardized test for comparing different MR fluid formulations',
    duration: 20,
    roadConditions: {
      surfaceType: 'mixed',
      roughnessLevel: 0.5,
      inclineAngle: 3
    },
    vehicleDynamics: {
      speedProfile: [
        { time: 0, speed: 0 },
        { time: 4, speed: 50 },
        { time: 8, speed: 80 },
        { time: 12, speed: 60 },
        { time: 16, speed: 90 },
        { time: 20, speed: 30 }
      ],
      loadCondition: 0.7,
      brakingEvents: [
        { time: 6, intensity: 0.6, duration: 1.5 },
        { time: 14, intensity: 0.8, duration: 2.0 }
      ]
    },
    environment: {
      temperature: 28,
      humidity: 55,
      windSpeed: 10
    }
  };

  const results: Array<{
    formulation: string;
    efficiency: number;
    energyRecovered: number;
    reliability: number;
    avgViscosity: number;
  }> = [];

  for (const formulation of formulations) {
    console.log(`\nTesting formulation: ${formulation}`);

    const mrFluidConfig: MRFluidSystemConfiguration = {
      selectedFormulation: formulation,
      brakingSystemConfig: {
        enableMRFluidBraking: true,
        mrFluidBrakingRatio: 0.4,
        adaptiveFieldControl: true,
        maxMagneticField: 80000
      },
      suspensionSystemConfig: {
        enableMRFluidSuspension: true,
        suspensionEnergyRecovery: true,
        adaptiveDamping: true,
        dampingRange: [600, 5000]
      },
      thermalManagement: {
        thermalDerating: true,
        maxOperatingTemperature: 120,
        coolingSystemEnabled: true,
        temperatureMonitoring: true
      }
    };

    const testVehicle = new MRDamperTestVehicle(
      baseVehicleConfig,
      baseVehicleParams,
      mrFluidConfig
    );

    try {
      await testVehicle.startTest(comparisonScenario);
      const testResult = testVehicle.getLatestTestResults();
      
      if (testResult) {
        results.push({
          formulation,
          efficiency: testResult.performance.dampingEfficiency,
          energyRecovered: testResult.performance.totalEnergyRecovered,
          reliability: testResult.performance.systemReliability,
          avgViscosity: testResult.mrFluidPerformance.averageViscosity
        });

        console.log(`  Efficiency: ${testResult.performance.dampingEfficiency.toFixed(1)}%`);
        console.log(`  Energy recovered: ${testResult.performance.totalEnergyRecovered.toFixed(2)} J`);
        console.log(`  Reliability: ${testResult.performance.systemReliability.toFixed(1)}%`);
      }
    } catch (error) {
      console.log(`  ✗ Test failed: ${error}`);
    }
  }

  // Display comparison results
  console.log('\n--- Formulation Comparison Results ---');
  console.log('Formulation'.padEnd(25) + 'Efficiency'.padEnd(12) + 'Energy (J)'.padEnd(12) + 'Reliability'.padEnd(12));
  console.log('-'.repeat(65));

  results.forEach(result => {
    console.log(
      result.formulation.padEnd(25) +
      `${result.efficiency.toFixed(1)}%`.padEnd(12) +
      result.energyRecovered.toFixed(1).padEnd(12) +
      `${result.reliability.toFixed(1)}%`.padEnd(12)
    );
  });

  // Find best performing formulation
  if (results.length > 0) {
    const bestEfficiency = results.reduce((best, current) => 
      current.efficiency > best.efficiency ? current : best
    );
    const bestEnergyRecovery = results.reduce((best, current) => 
      current.energyRecovered > best.energyRecovered ? current : best
    );

    console.log(`\nBest efficiency: ${bestEfficiency.formulation} (${bestEfficiency.efficiency.toFixed(1)}%)`);
    console.log(`Best energy recovery: ${bestEnergyRecovery.formulation} (${bestEnergyRecovery.energyRecovered.toFixed(2)} J)`);
  }
}

/**
 * Long-term durability and reliability testing
 */
export async function durabilityTesting(): Promise<void> {
  console.log('\n=== Durability and Reliability Testing ===');

  const durabilityVehicleConfig: TestVehicleConfiguration = {
    vehicleId: 'MR_DURABILITY_TEST',
    vehicleType: 'sedan',
    damperCount: 4,
    testEnvironment: {
      enableDataLogging: true,
      logInterval: 200, // Reduced frequency for long tests
      enableRealTimeMonitoring: true,
      enablePerformanceAnalytics: true
    },
    operationalLimits: {
      maxTestSpeed: 120,
      maxAcceleration: 8,
      maxDamperForce: 8000,
      emergencyStopThreshold: 140
    }
  };

  const vehicleParams: VehicleParameters = {
    mass: 1600,
    frontAxleLoad: 0.6,
    rearAxleLoad: 0.4,
    wheelRadius: 0.32,
    motorCount: 4,
    maxMotorTorque: 250,
    maxRegenerativePower: 60000,
    batteryCapacity: 75000,
    aerodynamicDragCoefficient: 0.26,
    frontalArea: 2.4,
    rollingResistanceCoefficient: 0.009
  };

  const mrFluidConfig: MRFluidSystemConfiguration = {
    selectedFormulation: 'high_performance_automotive',
    brakingSystemConfig: {
      enableMRFluidBraking: true,
      mrFluidBrakingRatio: 0.35,
      adaptiveFieldControl: true,
      maxMagneticField: 90000
    },
    suspensionSystemConfig: {
      enableMRFluidSuspension: true,
      suspensionEnergyRecovery: true,
      adaptiveDamping: true,
      dampingRange: [700, 5500]
    },
    thermalManagement: {
      thermalDerating: true,
      maxOperatingTemperature: 125,
      coolingSystemEnabled: true,
      temperatureMonitoring: true
    }
  };

  const testVehicle = new MRDamperTestVehicle(
    durabilityVehicleConfig,
    vehicleParams,
    mrFluidConfig
  );

  // Simulate multiple driving cycles
  const drivingCycles = [
    {
      name: 'City Cycle',
      scenario: {
        scenarioId: 'CITY_CYCLE',
        name: 'Urban Driving Cycle',
        description: 'Typical city driving with frequent stops',
        duration: 15,
        roadConditions: { surfaceType: 'smooth' as const, roughnessLevel: 0.3, inclineAngle: 1 },
        vehicleDynamics: {
          speedProfile: [
            { time: 0, speed: 0 }, { time: 2, speed: 30 }, { time: 5, speed: 50 },
            { time: 8, speed: 20 }, { time: 10, speed: 60 }, { time: 13, speed: 30 }, { time: 15, speed: 0 }
          ],
          loadCondition: 0.6,
          brakingEvents: [
            { time: 4, intensity: 0.5, duration: 1 },
            { time: 9, intensity: 0.7, duration: 1.5 },
            { time: 14, intensity: 0.6, duration: 1 }
          ]
        },
        environment: { temperature: 25, humidity: 60, windSpeed: 8 }
      }
    },
    {
      name: 'Highway Cycle',
      scenario: {
        scenarioId: 'HIGHWAY_CYCLE',
        name: 'Highway Driving Cycle',
        description: 'Sustained highway speeds',
        duration: 20,
        roadConditions: { surfaceType: 'smooth' as const, roughnessLevel: 0.2, inclineAngle: 2 },
        vehicleDynamics: {
          speedProfile: [
            { time: 0, speed: 60 }, { time: 5, speed: 100 }, { time: 10, speed: 120 },
            { time: 15, speed: 110 }, { time: 20, speed: 80 }
          ],
          loadCondition: 0.4,
          brakingEvents: [
            { time: 12, intensity: 0.4, duration: 2 },
            { time: 18, intensity: 0.6, duration: 1.5 }
          ]
        },
        environment: { temperature: 30, humidity: 45, windSpeed: 12 }
      }
    }
  ];

  console.log('Running durability test cycles...');
  
  const performanceHistory: Array<{
    cycle: string;
    iteration: number;
    efficiency: number;
    reliability: number;
    energyRecovered: number;
  }> = [];

  // Run multiple iterations of each cycle
  for (let iteration = 1; iteration <= 5; iteration++) {
    console.log(`\nIteration ${iteration}:`);
    
    for (const cycle of drivingCycles) {
      console.log(`  Running ${cycle.name}...`);
      
      try {
        await testVehicle.startTest(cycle.scenario);
        const results = testVehicle.getLatestTestResults();
        
        if (results) {
          performanceHistory.push({
            cycle: cycle.name,
            iteration,
            efficiency: results.performance.dampingEfficiency,
            reliability: results.performance.systemReliability,
            energyRecovered: results.performance.totalEnergyRecovered
          });
          
          console.log(`    Efficiency: ${results.performance.dampingEfficiency.toFixed(1)}%`);
          console.log(`    Reliability: ${results.performance.systemReliability.toFixed(1)}%`);
        }
      } catch (error) {
        console.log(`    ✗ Failed: ${error}`);
      }
    }
  }

  // Analyze performance degradation
  console.log('\n--- Durability Analysis ---');
  
  for (const cycleName of ['City Cycle', 'Highway Cycle']) {
    const cycleData = performanceHistory.filter(p => p.cycle === cycleName);
    
    if (cycleData.length > 0) {
      const initialEfficiency = cycleData[0].efficiency;
      const finalEfficiency = cycleData[cycleData.length - 1].efficiency;
      const efficiencyDegradation = ((initialEfficiency - finalEfficiency) / initialEfficiency) * 100;
      
      const avgReliability = cycleData.reduce((sum, p) => sum + p.reliability, 0) / cycleData.length;
      
      console.log(`\n${cycleName}:`);
      console.log(`  Initial efficiency: ${initialEfficiency.toFixed(1)}%`);
      console.log(`  Final efficiency: ${finalEfficiency.toFixed(1)}%`);
      console.log(`  Degradation: ${efficiencyDegradation.toFixed(2)}%`);
      console.log(`  Average reliability: ${avgReliability.toFixed(1)}%`);
    }
  }

  // System diagnostics
  const finalDiagnostics = testVehicle.getSystemDiagnostics();
  console.log('\n--- Final System Status ---');
  console.log(`Vehicle status: ${finalDiagnostics.vehicleStatus}`);
  console.log(`MR fluid system health: ${finalDiagnostics.mrFluidStatus.systemHealth}`);
  
  if (finalDiagnostics.mrFluidStatus.issues.length > 0) {
    console.log('Issues detected:', finalDiagnostics.mrFluidStatus.issues);
    console.log('Recommendations:', finalDiagnostics.mrFluidStatus.recommendations);
  }
}

/**
 * Run all MR damper test vehicle examples
 */
export async function runAllMRDamperExamples(): Promise<void> {
  console.log('🚗 MR Damper Test Vehicle Examples');
  console.log('=====================================');

  try {
    await basicMRDamperTesting();
    await performanceTestingScenarios();
    await mrFluidFormulationComparison();
    await durabilityTesting();
    
    console.log('\n✅ All MR damper test vehicle examples completed successfully!');
  } catch (error) {
    console.error('\n❌ Error running examples:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllMRDamperExamples().catch(console.error);
}