/**
 * Basic Usage Example for Piezoelectric Harvester Module
 * 
 * This example demonstrates the basic functionality of the piezoelectric
 * harvester module for energy conversion from mechanical vibrations.
 */

import {
  createPiezoelectricHarvester,
  defaultCantileverDesign,
  createTestVibrationInputs,
  MaterialProperties,
  StructuralOptimizer,
  FlexuralAnalysis,
  HarvesterInputs,
  VibrationData
} from '../index';

/**
 * Basic energy harvesting example
 */
export function basicEnergyHarvestingExample(): void {
  console.log('=== Basic Piezoelectric Energy Harvesting Example ===\n');

  // Create a piezoelectric harvester system
  const harvester = createPiezoelectricHarvester(
    'pzt-5h',                    // High-performance PZT material
    defaultCantileverDesign      // Standard cantilever beam design
  );

  // Create vibration input representing road vibrations
  const roadVibrations = createTestVibrationInputs({
    acceleration: { x: 1.5, y: 2.0, z: 12.0 }, // m/s² - typical road vibrations
    frequency: { dominant: 30, harmonics: [60, 90] }, // Hz - road frequency spectrum
    amplitude: 0.002,            // 2mm vibration amplitude
    temperatureAmbient: 25       // °C - ambient temperature
  });

  // Define harvesting inputs
  const harvestingInputs: HarvesterInputs = {
    vibrationData: roadVibrations,
    loadResistance: 1000,        // Ω - optimal load resistance
    operatingMode: 'continuous',
    environmentalConditions: {
      temperature: 25,           // °C
      pressure: 101325,          // Pa - standard atmospheric pressure
      corrosiveEnvironment: false
    }
  };

  // Process energy harvesting cycle
  const results = harvester.processHarvestingCycle(harvestingInputs);

  // Display results
  console.log('Energy Harvesting Results:');
  console.log(`Power Output: ${(results.electricalOutput.power * 1000).toFixed(3)} mW`);
  console.log(`Voltage: ${results.electricalOutput.voltage.toFixed(2)} V`);
  console.log(`Current: ${(results.electricalOutput.current * 1000).toFixed(2)} mA`);
  console.log(`Efficiency: ${results.electricalOutput.efficiency.toFixed(1)}%`);
  console.log(`Power Density: ${(results.electricalOutput.powerDensity / 1000).toFixed(1)} mW/cm³`);

  console.log('\nMechanical Response:');
  console.log(`Max Deflection: ${(results.mechanicalResponse.deflection * 1000).toFixed(2)} mm`);
  console.log(`Max Stress: ${(results.mechanicalResponse.stress / 1e6).toFixed(1)} MPa`);
  console.log(`Resonant Frequency: ${results.mechanicalResponse.resonantFrequency.toFixed(1)} Hz`);

  console.log('\nStructural Health:');
  console.log(`Reliability Score: ${(results.structuralHealth.reliabilityScore * 100).toFixed(1)}%`);
  console.log(`Fatigue Index: ${(results.structuralHealth.fatigueIndex * 100).toFixed(1)}%`);
  console.log(`Maintenance Required: ${results.structuralHealth.maintenanceRequired ? 'Yes' : 'No'}`);

  console.log('\nOptimization Status:');
  console.log(`Is Optimal: ${results.optimizationStatus.isOptimal ? 'Yes' : 'No'}`);
  console.log(`Improvement Potential: ${results.optimizationStatus.improvementPotential.toFixed(1)}%`);
  
  if (results.optimizationStatus.recommendedAdjustments.length > 0) {
    console.log('Recommendations:');
    results.optimizationStatus.recommendedAdjustments.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Material comparison example
 */
export function materialComparisonExample(): void {
  console.log('=== Material Comparison Example ===\n');

  const materialProps = new MaterialProperties();
  
  // Compare different piezoelectric materials
  const materials = ['pzt-5h', 'pzt-5a', 'pvdf', 'batio3'];
  const criteria = ['d31', 'couplingFactor', 'density'];
  
  const comparison = materialProps.compareMaterials(materials, criteria);
  
  console.log('Material Performance Ranking:');
  comparison.forEach((result, index) => {
    console.log(`${index + 1}. ${result.material.toUpperCase()}`);
    console.log(`   Score: ${result.score.toFixed(2)}`);
    console.log(`   d31: ${(result.properties.d31 * 1e12).toFixed(1)} pC/N`);
    console.log(`   Coupling Factor: ${(result.properties.couplingFactor * 100).toFixed(1)}%`);
    console.log(`   Density: ${result.properties.density} kg/m³`);
    console.log('');
  });

  // Get material recommendations for specific requirements
  const recommendations = materialProps.getRecommendations({
    application: 'energy harvesting',
    temperatureRange: { min: -20, max: 80 },
    leadFree: true,
    costConstraint: 'medium',
    powerDensityPriority: true
  });

  console.log('Lead-Free Material Recommendations:');
  recommendations.forEach((material, index) => {
    console.log(`${index + 1}. ${material.name} (${material.type})`);
    console.log(`   Cost: ${material.cost}, Availability: ${material.availability}`);
    console.log(`   Applications: ${material.applications.join(', ')}`);
    console.log('');
  });

  console.log('='.repeat(60) + '\n');
}

/**
 * Structural optimization example
 */
export function structuralOptimizationExample(): void {
  console.log('=== Structural Optimization Example ===\n');

  const materialProps = new MaterialProperties();
  const pztMaterial = materialProps.getMaterial('pzt-5h');
  const optimizer = new StructuralOptimizer(pztMaterial);

  // Define target vibration profile
  const targetVibrations = createTestVibrationInputs({
    frequency: { dominant: 40, harmonics: [80, 120] },
    acceleration: { x: 2.0, y: 2.5, z: 15.0 },
    amplitude: 0.003
  });

  // Set optimization objectives
  const objectives = {
    maximizePowerOutput: 1.0,    // Highest priority
    maximizeEfficiency: 0.8,     // High priority
    minimizeStress: 0.7,         // Medium-high priority
    maximizeReliability: 0.9     // High priority
  };

  console.log('Starting structural optimization...');
  console.log('Objectives:');
  console.log(`  Power Output Priority: ${objectives.maximizePowerOutput}`);
  console.log(`  Efficiency Priority: ${objectives.maximizeEfficiency}`);
  console.log(`  Stress Minimization: ${objectives.minimizeStress}`);
  console.log(`  Reliability Priority: ${objectives.maximizeReliability}`);
  console.log('');

  // Perform optimization
  const optimizationResult = optimizer.optimize(
    defaultCantileverDesign,
    targetVibrations,
    objectives
  );

  console.log('Optimization Results:');
  console.log(`Success: ${optimizationResult.success ? 'Yes' : 'No'}`);
  console.log(`Improvement: ${optimizationResult.improvementPercentage.toFixed(2)}%`);
  console.log(`Iterations: ${optimizationResult.iterations}`);
  console.log(`Computation Time: ${optimizationResult.computationTime} ms`);
  console.log(`Final Objective Value: ${optimizationResult.finalObjectiveValue.toFixed(4)}`);

  if (optimizationResult.optimizedDesign) {
    const original = defaultCantileverDesign;
    const optimized = optimizationResult.optimizedDesign;
    
    console.log('\nDesign Comparison:');
    console.log('Parameter           Original    Optimized   Change');
    console.log('-'.repeat(50));
    console.log(`Length (mm)         ${(original.dimensions.length * 1000).toFixed(1).padEnd(11)} ${(optimized.dimensions.length * 1000).toFixed(1).padEnd(11)} ${(((optimized.dimensions.length - original.dimensions.length) / original.dimensions.length) * 100).toFixed(1)}%`);
    console.log(`Width (mm)          ${(original.dimensions.width * 1000).toFixed(1).padEnd(11)} ${(optimized.dimensions.width * 1000).toFixed(1).padEnd(11)} ${(((optimized.dimensions.width - original.dimensions.width) / original.dimensions.width) * 100).toFixed(1)}%`);
    console.log(`Thickness (μm)      ${(original.dimensions.thickness * 1e6).toFixed(0).padEnd(11)} ${(optimized.dimensions.thickness * 1e6).toFixed(0).padEnd(11)} ${(((optimized.dimensions.thickness - original.dimensions.thickness) / original.dimensions.thickness) * 100).toFixed(1)}%`);
    console.log(`Proof Mass (g)      ${(original.mountingConfiguration.proofMass * 1000).toFixed(1).padEnd(11)} ${(optimized.mountingConfiguration.proofMass * 1000).toFixed(1).padEnd(11)} ${(((optimized.mountingConfiguration.proofMass - original.mountingConfiguration.proofMass) / original.mountingConfiguration.proofMass) * 100).toFixed(1)}%`);
  }

  if (optimizationResult.constraintViolations.length > 0) {
    console.log('\nConstraint Violations:');
    optimizationResult.constraintViolations.forEach((violation, index) => {
      console.log(`  ${index + 1}. ${violation}`);
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Flexural analysis example
 */
export function flexuralAnalysisExample(): void {
  console.log('=== Flexural Analysis Example ===\n');

  const materialProps = new MaterialProperties();
  const pztMaterial = materialProps.getMaterial('pzt-5h');
  const flexuralAnalysis = new FlexuralAnalysis(pztMaterial);

  // Test vibration conditions
  const testVibrations = createTestVibrationInputs({
    acceleration: { x: 3.0, y: 4.0, z: 20.0 },
    frequency: { dominant: 50, harmonics: [100, 150] },
    amplitude: 0.004
  });

  console.log('Performing detailed flexural analysis...');
  
  // Analyze deformation
  const deformationAnalysis = flexuralAnalysis.analyzeDeformation(
    defaultCantileverDesign,
    testVibrations
  );

  console.log('\nDeformation Analysis Results:');
  console.log(`Max Deflection: ${(deformationAnalysis.maxDeflection * 1000).toFixed(3)} mm`);
  console.log(`Max Stress: ${(deformationAnalysis.maxStress / 1e6).toFixed(2)} MPa`);
  console.log(`Max Strain: ${(deformationAnalysis.maxStrain * 100).toFixed(4)}%`);
  console.log(`Resonant Frequency: ${deformationAnalysis.resonantFrequency.toFixed(2)} Hz`);
  console.log(`Damping Ratio: ${(deformationAnalysis.dampingRatio * 100).toFixed(2)}%`);

  // Calculate stress distribution
  const stressDistribution = flexuralAnalysis.calculateStressDistribution(
    defaultCantileverDesign,
    deformationAnalysis
  );

  console.log('\nStress Distribution:');
  console.log(`Max Tensile Stress: ${(stressDistribution.tensile.maximum / 1e6).toFixed(2)} MPa`);
  console.log(`  Location: x=${(stressDistribution.tensile.location.x * 1000).toFixed(1)}mm, y=${(stressDistribution.tensile.location.y * 1e6).toFixed(0)}μm`);
  console.log(`Max Compressive Stress: ${(stressDistribution.compressive.maximum / 1e6).toFixed(2)} MPa`);
  console.log(`  Location: x=${(stressDistribution.compressive.location.x * 1000).toFixed(1)}mm, y=${(stressDistribution.compressive.location.y * 1e6).toFixed(0)}μm`);
  console.log(`Max Shear Stress: ${(stressDistribution.shear.maximum / 1e6).toFixed(2)} MPa`);
  console.log(`Max von Mises Stress: ${(stressDistribution.vonMises.maximum / 1e6).toFixed(2)} MPa`);

  // Assess reliability
  const reliability = flexuralAnalysis.assessReliability(
    defaultCantileverDesign,
    deformationAnalysis,
    testVibrations
  );

  console.log('\nReliability Assessment:');
  console.log(`Safety Factor: ${reliability.safetyFactor.toFixed(2)}`);
  console.log(`Fatigue Life: ${reliability.fatigueLife.toExponential(2)} cycles`);
  console.log(`Reliability Index: ${(reliability.reliabilityIndex * 100).toFixed(1)}%`);
  console.log(`Failure Probability: ${(reliability.failureProbability * 100).toFixed(3)}%`);
  console.log(`Critical Stress Ratio: ${(reliability.criticalStressRatio * 100).toFixed(1)}%`);
  console.log(`Maintenance Interval: ${(reliability.maintenanceInterval / 8760).toFixed(1)} years`);

  // Optimize geometry for target frequency
  const targetFrequency = 45; // Hz
  const geometryOptimization = flexuralAnalysis.optimizeFlexuralGeometry(
    defaultCantileverDesign,
    targetFrequency,
    {
      maxLength: 0.08,
      maxWidth: 0.02,
      maxThickness: 0.001,
      maxStress: 40e6
    }
  );

  console.log('\nGeometry Optimization for Target Frequency:');
  console.log(`Target Frequency: ${targetFrequency} Hz`);
  console.log(`Optimized Frequency: ${geometryOptimization.resonantFrequency.toFixed(2)} Hz`);
  console.log(`Improvement Factor: ${geometryOptimization.improvementFactor.toFixed(2)}`);
  console.log('Optimized Dimensions:');
  console.log(`  Length: ${(geometryOptimization.optimizedDimensions.length * 1000).toFixed(1)} mm`);
  console.log(`  Width: ${(geometryOptimization.optimizedDimensions.width * 1000).toFixed(1)} mm`);
  console.log(`  Thickness: ${(geometryOptimization.optimizedDimensions.thickness * 1e6).toFixed(0)} μm`);

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Run all examples
 */
export function runAllExamples(): void {
  console.log('PIEZOELECTRIC HARVESTER MODULE EXAMPLES\n');
  console.log('This demonstration shows the capabilities of the piezoelectric');
  console.log('harvester module for energy conversion from mechanical vibrations.\n');
  
  basicEnergyHarvestingExample();
  materialComparisonExample();
  structuralOptimizationExample();
  flexuralAnalysisExample();
  
  console.log('All examples completed successfully!');
  console.log('The piezoelectric harvester module provides comprehensive');
  console.log('capabilities for designing and optimizing energy harvesting systems.');
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}