/**
 * Basic Usage Example for TEG Performance Testing
 * 
 * This example demonstrates the fundamental usage of the TEG Performance Testing module,
 * including basic electrical characterization, thermal testing, and performance validation.
 */

import {
  TEGPerformanceTester,
  createTestTEGInputs,
  TEGTestType,
  TestStatus,
  DataQuality,
  defaultTEGBenchmarks
} from '../index';

async function basicTEGTesting() {
  console.log('=== TEG Performance Testing - Basic Usage Example ===\n');

  // Initialize the TEG performance tester
  const tester = new TEGPerformanceTester();
  
  console.log('1. ELECTRICAL CHARACTERIZATION TEST');
  console.log('=====================================');
  
  // Create basic test inputs for electrical characterization
  const electricalInputs = createTestTEGInputs({
    hotSideTemperature: 150,    // °C - Typical automotive waste heat temperature
    coldSideTemperature: 25,    // °C - Ambient temperature
    heatFlux: 10,              // W/cm² - Moderate heat flux
    loadResistance: 2.0,       // Ω - Matched load resistance
    testDuration: 3600,        // 1 hour test
    samplingRate: 1,           // 1 Hz sampling
    testType: TEGTestType.ELECTRICAL_CHARACTERIZATION
  });

  try {
    // Execute electrical characterization test
    const electricalResults = await tester.executeElectricalTest(electricalInputs);
    
    console.log('Test Results:');
    console.log(`  Power Output: ${electricalResults.power.toFixed(2)} W`);
    console.log(`  Voltage: ${electricalResults.voltage.toFixed(2)} V`);
    console.log(`  Current: ${electricalResults.current.toFixed(2)} A`);
    console.log(`  Efficiency: ${electricalResults.efficiency.toFixed(2)} %`);
    console.log(`  Internal Resistance: ${electricalResults.resistance.toFixed(2)} Ω`);
    console.log(`  Power Density: ${electricalResults.powerDensity.toFixed(2)} W/cm²`);
    console.log(`  Response Time: ${electricalResults.responseTime.toFixed(2)} s`);
    console.log(`  Test Status: ${electricalResults.testStatus}`);
    console.log(`  Data Quality: ${electricalResults.dataQuality}\n`);

    // Validate performance against benchmarks
    const validation = tester.validatePerformance(electricalResults);
    
    console.log('Performance Validation:');
    console.log(`  Overall Result: ${validation.passed ? 'PASS' : 'FAIL'}`);
    
    if (validation.failures.length > 0) {
      console.log('  Failures:');
      validation.failures.forEach(failure => console.log(`    - ${failure}`));
    }
    
    if (validation.warnings.length > 0) {
      console.log('  Warnings:');
      validation.warnings.forEach(warning => console.log(`    - ${warning}`));
    }
    
  } catch (error) {
    console.error(`Test failed: ${error.message}`);
  }

  console.log('\n2. THERMAL PERFORMANCE TEST');
  console.log('============================');
  
  // Create thermal test inputs
  const thermalInputs = createTestTEGInputs({
    hotSideTemperature: 180,    // Higher temperature for thermal testing
    coldSideTemperature: 30,
    heatFlux: 15,              // Higher heat flux
    testDuration: 7200,        // 2 hours for thermal stabilization
    testType: TEGTestType.THERMAL_PERFORMANCE
  });

  try {
    // Execute thermal performance test
    const thermalResults = await tester.executeThermalTest(thermalInputs);
    
    console.log('Thermal Test Results:');
    console.log(`  Temperature Differential: ${thermalResults.temperatureDifferential.toFixed(1)} °C`);
    console.log(`  Thermal Resistance: ${thermalResults.thermalResistance.toFixed(3)} K/W`);
    console.log(`  Heat Transfer Coefficient: ${thermalResults.heatTransferCoefficient.toFixed(1)} W/m²K`);
    console.log(`  Power Output: ${thermalResults.power.toFixed(2)} W`);
    console.log(`  Thermal Response Time: ${thermalResults.responseTime.toFixed(2)} s`);
    console.log(`  Test Status: ${thermalResults.testStatus}\n`);
    
  } catch (error) {
    console.error(`Thermal test failed: ${error.message}`);
  }

  console.log('3. DYNAMIC RESPONSE TEST');
  console.log('========================');
  
  // Create dynamic test inputs
  const dynamicInputs = createTestTEGInputs({
    hotSideTemperature: 200,
    coldSideTemperature: 25,
    heatFlux: 12,
    testType: TEGTestType.DYNAMIC_RESPONSE
  });

  try {
    // Execute dynamic response test (temperature sweep)
    const dynamicResults = await tester.executeDynamicTest(dynamicInputs);
    
    console.log('Dynamic Response Results:');
    console.log('  Temperature vs Power Output:');
    
    dynamicResults.forEach((result, index) => {
      const tempDiff = result.temperatureDifferential;
      const power = result.power;
      console.log(`    ΔT = ${tempDiff.toFixed(1)} °C → P = ${power.toFixed(2)} W`);
    });
    
    // Calculate power gradient
    const powerRange = dynamicResults[dynamicResults.length - 1].power - dynamicResults[0].power;
    const tempRange = dynamicResults[dynamicResults.length - 1].temperatureDifferential - 
                     dynamicResults[0].temperatureDifferential;
    const powerGradient = powerRange / tempRange;
    
    console.log(`  Power Gradient: ${powerGradient.toFixed(3)} W/°C\n`);
    
  } catch (error) {
    console.error(`Dynamic test failed: ${error.message}`);
  }

  console.log('4. ENVIRONMENTAL STRESS TEST');
  console.log('=============================');
  
  // Create environmental stress test inputs
  const envInputs = createTestTEGInputs({
    hotSideTemperature: 150,
    coldSideTemperature: 25,
    humidity: 85,              // High humidity
    vibrationLevel: 10,        // Moderate vibration
    pressure: 101.325,         // Standard atmospheric pressure
    testDuration: 24 * 3600,   // 24 hours
    testType: TEGTestType.ENVIRONMENTAL_STRESS
  });

  try {
    // Execute environmental stress test
    const envResults = await tester.executeEnvironmentalTest(envInputs);
    
    console.log('Environmental Stress Results:');
    console.log(`  Temperature Cycles: ${envResults.temperatureCycles}`);
    console.log(`  Humidity Exposure: ${envResults.humidityExposure.toFixed(1)} hours`);
    console.log(`  Vibration Exposure: ${envResults.vibrationExposure.toFixed(1)} hours`);
    console.log(`  Corrosion Level: ${envResults.corrosionLevel.toFixed(1)}/10`);
    console.log(`  Sealing Integrity: ${envResults.sealingIntegrity ? 'PASS' : 'FAIL'}\n`);
    
  } catch (error) {
    console.error(`Environmental test failed: ${error.message}`);
  }

  console.log('5. ACCELERATED LIFE TEST');
  console.log('========================');
  
  // Create accelerated life test inputs
  const lifeInputs = createTestTEGInputs({
    hotSideTemperature: 200,   // Elevated temperature for acceleration
    coldSideTemperature: 25,
    heatFlux: 20,             // High stress conditions
    testDuration: 8760,       // 1 year equivalent
    testType: TEGTestType.ACCELERATED_LIFE
  });

  try {
    // Execute accelerated life test
    const reliabilityData = await tester.executeAcceleratedLifeTest(lifeInputs);
    
    console.log('Reliability Analysis Results:');
    console.log(`  MTBF (Mean Time Between Failures): ${reliabilityData.mtbf.toFixed(0)} hours`);
    console.log(`  Failure Rate: ${(reliabilityData.failureRate * 1000).toFixed(4)} failures/1000h`);
    console.log(`  Confidence Level: ${reliabilityData.confidenceLevel} %`);
    console.log(`  Wear-out Time: ${reliabilityData.wearoutTime.toFixed(0)} hours`);
    console.log(`  Degradation Rate: ${reliabilityData.degradationRate.toFixed(3)} %/1000h\n`);
    
    // Convert to automotive metrics
    const kmPerHour = 60; // Average 60 km/h
    const lifetimeKm = reliabilityData.mtbf * kmPerHour;
    console.log(`  Equivalent Lifetime: ${(lifetimeKm / 1000).toFixed(0)}k km`);
    
  } catch (error) {
    console.error(`Life test failed: ${error.message}`);
  }

  console.log('6. COMPREHENSIVE TEST REPORT');
  console.log('=============================');
  
  // Generate comprehensive test report
  const report = tester.generateTestReport();
  
  if (report.summary) {
    console.log('Test Summary:');
    console.log(`  Total Tests Executed: ${report.summary.totalTests}`);
    console.log(`  Average Power Output: ${report.summary.averagePower.toFixed(2)} W`);
    console.log(`  Maximum Power Output: ${report.summary.maxPower.toFixed(2)} W`);
    console.log(`  Average Efficiency: ${report.summary.averageEfficiency.toFixed(2)} %`);
    console.log(`  Average Thermal Resistance: ${report.summary.averageThermalResistance.toFixed(3)} K/W`);
    console.log(`  Overall Pass Rate: ${report.summary.passRate.toFixed(1)} %\n`);
    
    if (report.benchmarkComparison) {
      console.log('Benchmark Comparison:');
      console.log(`  Power Performance Ratio: ${report.benchmarkComparison.powerPerformance.ratio.toFixed(2)}`);
      console.log(`  Efficiency Performance Ratio: ${report.benchmarkComparison.efficiencyPerformance.ratio.toFixed(2)}`);
      console.log(`  Thermal Performance Ratio: ${report.benchmarkComparison.thermalPerformance.ratio.toFixed(2)}\n`);
    }
    
    if (report.recommendations.length > 0) {
      console.log('Optimization Recommendations:');
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
  } else {
    console.log('No test data available for comprehensive report.');
  }

  console.log('\n7. BENCHMARK CONFIGURATION');
  console.log('===========================');
  
  // Display current benchmarks
  const benchmarks = tester.getBenchmarks();
  
  console.log('Current Performance Benchmarks:');
  console.log('  Electrical:');
  console.log(`    Min Power Output: ${benchmarks.electrical.minPowerOutput} W`);
  console.log(`    Target Power Output: ${benchmarks.electrical.targetPowerOutput} W`);
  console.log(`    Min Efficiency: ${benchmarks.electrical.minEfficiency} %`);
  console.log(`    Target Efficiency: ${benchmarks.electrical.targetEfficiency} %`);
  console.log(`    Max Response Time: ${benchmarks.electrical.maxResponseTime} s`);
  
  console.log('  Thermal:');
  console.log(`    Max Thermal Resistance: ${benchmarks.thermal.maxThermalResistance} K/W`);
  console.log(`    Operating Temperature Range: ${benchmarks.thermal.minOperatingTemp}°C to ${benchmarks.thermal.maxOperatingTemp}°C`);
  console.log(`    Max Temperature Differential: ${benchmarks.thermal.maxTempDifferential} °C`);
  
  console.log('  Environmental:');
  console.log(`    Max Humidity: ${benchmarks.environmental.maxHumidity} % RH`);
  console.log(`    Min IP Rating: ${benchmarks.environmental.minIPRating}`);
  console.log(`    Max Corrosion Rate: ${benchmarks.environmental.maxCorrosionRate} μm/year`);

  console.log('\n=== TEG Performance Testing Complete ===');
}

// Execute the example
if (require.main === module) {
  basicTEGTesting().catch(console.error);
}

export { basicTEGTesting };