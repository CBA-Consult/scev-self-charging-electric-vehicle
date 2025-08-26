/**
 * Comprehensive Example: Piezoelectric Energy Harvesting Optimization
 * 
 * This example demonstrates the complete piezoelectric energy harvesting system
 * including classical and non-classical materials, structural modeling, optimization
 * algorithms, and integration with vehicle vibration sources.
 */

import {
  // Main system components
  PiezoelectricEnergyHarvester,
  PiezoelectricSystemConfiguration,
  FuzzyControlIntegration,
  
  // Materials
  PiezoelectricMaterialFactory,
  ClassicalPiezoelectricMaterial,
  NonClassicalPiezoelectricMaterial,
  MaterialProperties,
  NonClassicalProperties,
  
  // Structural modeling
  PiezoelectricBeamModel,
  PiezoelectricPlateModel,
  MultiPhysicsStructuralModel,
  GeometryParameters,
  LoadConditions,
  
  // Optimization
  GeneticAlgorithmOptimizer,
  ParticleSwarmOptimizer,
  OptimizationParameters,
  OptimizationObjectives,
  
  // Vibration harvesting
  PiezoelectricEnergyHarvestingController,
  
  // Utilities
  createFuzzyControlSystem,
  createPiezoelectricEnergyHarvester,
  defaultPiezoelectricConfiguration,
  defaultVehicleParameters,
  createTestInputs
} from '../index';

/**
 * Example 1: Basic Piezoelectric Material Comparison
 * 
 * Demonstrates the differences between classical and non-classical
 * piezoelectric materials for energy harvesting applications.
 */
export function demonstrateMaterialComparison(): void {
  console.log('\n=== Piezoelectric Material Comparison ===\n');
  
  // Create classical material (PZT-5H)
  const classicalMaterial = PiezoelectricMaterialFactory.createClassicalMaterial('PZT-5H');
  console.log('Classical Material (PZT-5H):');
  console.log('- Type:', classicalMaterial.getMaterialType());
  console.log('- Properties:', JSON.stringify(classicalMaterial.getProperties(), null, 2));
  
  // Calculate power output for classical material
  const force = 10; // N
  const frequency = 50; // Hz
  const area = 0.001; // m²
  const thickness = 0.001; // m
  const loadResistance = 10000; // Ω
  const temperature = 25; // °C
  
  const classicalOutput = classicalMaterial.calculatePowerOutput(
    force, frequency, area, thickness, loadResistance, temperature
  );
  console.log('- Power Output:', classicalOutput);
  
  // Create non-classical material (PMN-PT)
  const nonClassicalMaterial = PiezoelectricMaterialFactory.createNonClassicalMaterial('PMN-PT');
  console.log('\nNon-Classical Material (PMN-PT):');
  console.log('- Type:', nonClassicalMaterial.getMaterialType());
  console.log('- Enhanced Properties:', JSON.stringify(nonClassicalMaterial.getNonClassicalProperties(), null, 2));
  
  // Calculate power output for non-classical material
  const nonClassicalOutput = nonClassicalMaterial.calculatePowerOutput(
    force, frequency, area, thickness, loadResistance, temperature
  );
  console.log('- Power Output:', nonClassicalOutput);
  
  // Calculate nonlinear response
  const stress = [force / area];
  const electricField = [1000]; // V/m
  const strainRate = [0.001]; // 1/s
  
  const nonlinearResponse = nonClassicalMaterial.calculateNonlinearResponse(
    stress, electricField, strainRate, temperature
  );
  console.log('- Nonlinear Response:', nonlinearResponse);
  
  // Compare performance
  const powerImprovement = (nonClassicalOutput.power / classicalOutput.power - 1) * 100;
  const efficiencyImprovement = (nonClassicalOutput.efficiency / classicalOutput.efficiency - 1) * 100;
  
  console.log('\nPerformance Comparison:');
  console.log(`- Power improvement: ${powerImprovement.toFixed(1)}%`);
  console.log(`- Efficiency improvement: ${efficiencyImprovement.toFixed(1)}%`);
}

/**
 * Example 2: Structural Modeling and Analysis
 * 
 * Demonstrates structural modeling of piezoelectric energy harvesters
 * using beam and plate models with modal analysis.
 */
export function demonstrateStructuralModeling(): void {
  console.log('\n=== Structural Modeling and Analysis ===\n');
  
  // Define geometry for cantilever beam harvester
  const beamGeometry: GeometryParameters = {
    length: 0.05,        // 50mm
    width: 0.02,         // 20mm
    thickness: 0.001,    // 1mm
    shape: 'rectangular',
    aspectRatio: 2.5,
    supportConditions: 'cantilever',
    massLocation: 'tip',
    tipMass: 0.01,       // 10g tip mass
    layers: [{
      materialType: 'PZT-5H',
      thickness: 0.001,
      position: 'middle',
      orientation: 0
    }]
  };
  
  // Create material and beam model
  const material = PiezoelectricMaterialFactory.createClassicalMaterial('PZT-5H');
  const beamModel = new PiezoelectricBeamModel(beamGeometry, material.getProperties());
  
  // Get modal properties
  const modalProperties = beamModel.getModalProperties();
  console.log('Beam Modal Properties:');
  console.log('- Natural Frequencies (Hz):', modalProperties.naturalFrequencies.slice(0, 3));
  console.log('- Modal Masses (kg):', modalProperties.modalMasses.slice(0, 3));
  console.log('- Damping Ratios:', modalProperties.dampingRatios.slice(0, 3));
  
  // Define load conditions (base excitation)
  const loadConditions: LoadConditions = {
    baseAcceleration: {
      amplitude: 9.81,     // 1g acceleration
      frequency: modalProperties.naturalFrequencies[0], // Excite at first natural frequency
      phase: 0
    },
    temperature: 25,
    humidity: 50,
    pressure: 101325
  };
  
  // Calculate structural response
  const structuralResponse = beamModel.calculateStructuralResponse(loadConditions);
  console.log('\nStructural Response at Resonance:');
  console.log('- Max Displacement (mm):', (structuralResponse.displacement.maximum * 1000).toFixed(3));
  console.log('- Max Strain:', structuralResponse.strain.maximum.toExponential(3));
  console.log('- Max Stress (MPa):', (structuralResponse.stress.maximum / 1e6).toFixed(1));
  console.log('- Resonance Amplification:', structuralResponse.resonanceAmplification.toFixed(1));
  
  // Compare with off-resonance response
  const offResonanceConditions = { ...loadConditions };
  offResonanceConditions.baseAcceleration.frequency = modalProperties.naturalFrequencies[0] * 1.5;
  
  const offResonanceResponse = beamModel.calculateStructuralResponse(offResonanceConditions);
  console.log('\nOff-Resonance Response (1.5x natural frequency):');
  console.log('- Max Displacement (mm):', (offResonanceResponse.displacement.maximum * 1000).toFixed(3));
  console.log('- Amplification Factor:', offResonanceResponse.resonanceAmplification.toFixed(1));
  
  const resonanceAdvantage = structuralResponse.displacement.maximum / offResonanceResponse.displacement.maximum;
  console.log(`- Resonance Advantage: ${resonanceAdvantage.toFixed(1)}x`);
}

/**
 * Example 3: Optimization Algorithms Comparison
 * 
 * Demonstrates different optimization algorithms for maximizing
 * piezoelectric energy harvesting efficiency.
 */
export function demonstrateOptimizationAlgorithms(): void {
  console.log('\n=== Optimization Algorithms Comparison ===\n');
  
  // Define optimization parameters
  const optimizationParams: OptimizationParameters = {
    geometry: {
      length: { min: 0.02, max: 0.1, current: 0.05 },
      width: { min: 0.01, max: 0.05, current: 0.02 },
      thickness: { min: 0.0005, max: 0.002, current: 0.001 }
    },
    circuit: {
      loadResistance: { min: 1000, max: 100000, current: 10000 },
      capacitance: { min: 10e-9, max: 1e-6, current: 100e-9 }
    },
    excitation: {
      frequency: { min: 10, max: 200, current: 50 },
      amplitude: { min: 1, max: 20, current: 9.81 }
    }
  };
  
  // Define optimization objectives
  const objectives: OptimizationObjectives = {
    maximizePower: { weight: 0.5 },
    maximizeEfficiency: { weight: 0.3 },
    maximizeBandwidth: { weight: 0.2 },
    minimizeWeight: { weight: 0.0 },
    minimizeVolume: { weight: 0.0 },
    minimizeStress: { weight: 0.0 },
    maxStress: 100e6,
    maxDisplacement: 0.002,
    minNaturalFrequency: 10,
    maxNaturalFrequency: 500
  };
  
  // Evaluation function (simplified for demonstration)
  const evaluationFunction = (params: OptimizationParameters) => {
    const volume = params.geometry.length.current * 
                  params.geometry.width.current * 
                  params.geometry.thickness.current;
    
    // Simplified power calculation based on volume and frequency matching
    const naturalFreq = 160 / Math.sqrt(params.geometry.length.current); // Simplified
    const freqMatch = 1 / (1 + Math.abs(params.excitation.frequency.current - naturalFreq) / naturalFreq);
    const power = volume * freqMatch * params.excitation.amplitude.current * 0.001;
    
    const efficiency = Math.min(power / (volume * 10), 0.5); // Simplified efficiency
    const bandwidth = naturalFreq * 0.02; // 2% damping
    
    return {
      power,
      efficiency,
      bandwidth,
      stress: power * 1e8, // Simplified stress
      displacement: power * 0.1, // Simplified displacement
      naturalFrequency: naturalFreq
    };
  };
  
  // Test Genetic Algorithm
  console.log('Testing Genetic Algorithm...');
  const geneticOptimizer = new GeneticAlgorithmOptimizer(20, 50, 0.8, 0.1, 0.1);
  const geneticResult = geneticOptimizer.optimize(optimizationParams, objectives, evaluationFunction);
  
  console.log('Genetic Algorithm Results:');
  console.log('- Optimal Power (mW):', (geneticResult.performance.power * 1000).toFixed(2));
  console.log('- Optimal Efficiency:', (geneticResult.performance.efficiency * 100).toFixed(1) + '%');
  console.log('- Iterations:', geneticResult.iterations);
  console.log('- Computation Time (ms):', geneticResult.computationTime);
  
  // Test Particle Swarm Optimization
  console.log('\nTesting Particle Swarm Optimization...');
  const psoOptimizer = new ParticleSwarmOptimizer(15, 50, 0.9, 2.0, 2.0);
  const psoResult = psoOptimizer.optimize(optimizationParams, objectives, evaluationFunction);
  
  console.log('PSO Results:');
  console.log('- Optimal Power (mW):', (psoResult.performance.power * 1000).toFixed(2));
  console.log('- Optimal Efficiency:', (psoResult.performance.efficiency * 100).toFixed(1) + '%');
  console.log('- Iterations:', psoResult.iterations);
  console.log('- Computation Time (ms):', psoResult.computationTime);
  
  // Compare results
  const powerImprovement = ((Math.max(geneticResult.performance.power, psoResult.performance.power) / 
                           Math.min(geneticResult.performance.power, psoResult.performance.power)) - 1) * 100;
  
  console.log('\nOptimization Comparison:');
  console.log(`- Power improvement over baseline: ${powerImprovement.toFixed(1)}%`);
  console.log('- Best algorithm:', geneticResult.performance.power > psoResult.performance.power ? 'Genetic' : 'PSO');
}

/**
 * Example 4: Complete Vehicle Integration
 * 
 * Demonstrates integration of piezoelectric energy harvesting
 * with the vehicle's fuzzy control system for comprehensive
 * energy management.
 */
export function demonstrateVehicleIntegration(): void {
  console.log('\n=== Complete Vehicle Integration ===\n');
  
  // Create piezoelectric system configuration
  const piezoConfig: PiezoelectricSystemConfiguration = {
    ...defaultPiezoelectricConfiguration,
    harvesters: {
      beamHarvesters: [
        {
          id: 'suspension_front_left',
          material: 'PZT-5H',
          geometry: {
            length: 0.06,
            width: 0.025,
            thickness: 0.0015,
            shape: 'rectangular',
            aspectRatio: 2.4,
            supportConditions: 'cantilever',
            massLocation: 'tip',
            tipMass: 0.015,
            layers: [{
              materialType: 'PZT-5H',
              thickness: 0.0015,
              position: 'middle',
              orientation: 0
            }]
          },
          location: { x: 1.2, y: 0.8, z: 0.3 }
        },
        {
          id: 'engine_mount',
          material: 'PMN-PT',
          geometry: {
            length: 0.08,
            width: 0.03,
            thickness: 0.002,
            shape: 'rectangular',
            aspectRatio: 2.67,
            supportConditions: 'clamped',
            massLocation: 'center',
            layers: [{
              materialType: 'PMN-PT',
              thickness: 0.002,
              position: 'middle',
              orientation: 0
            }]
          },
          location: { x: 0.5, y: 0, z: 0.5 }
        }
      ],
      plateHarvesters: []
    },
    optimization: {
      enabled: true,
      algorithms: ['genetic'],
      objectives: {
        maximizePower: { weight: 0.6 },
        maximizeEfficiency: { weight: 0.4 },
        maximizeBandwidth: { weight: 0.0 },
        minimizeWeight: { weight: 0.0 },
        minimizeVolume: { weight: 0.0 },
        minimizeStress: { weight: 0.0 },
        maxStress: 80e6,
        maxDisplacement: 0.0015,
        minNaturalFrequency: 5,
        maxNaturalFrequency: 200
      },
      updateInterval: 10000, // 10 seconds
      convergenceCriteria: {
        maxIterations: 50,
        tolerance: 1e-5,
        improvementThreshold: 0.05
      }
    }
  };
  
  // Create integrated fuzzy control system with piezoelectric harvesting
  const integratedSystem = new FuzzyControlIntegration(
    defaultVehicleParameters,
    undefined, // Use default safety limits
    piezoConfig
  );
  
  console.log('Integrated System Created Successfully');
  
  // Simulate different driving scenarios
  const scenarios = [
    {
      name: 'City Driving',
      inputs: createTestInputs({
        vehicleSpeed: 40,
        brakePedalPosition: 0.2,
        ambientTemperature: 20,
        roadSurface: 'dry'
      })
    },
    {
      name: 'Highway Driving',
      inputs: createTestInputs({
        vehicleSpeed: 100,
        brakePedalPosition: 0.1,
        ambientTemperature: 25,
        roadSurface: 'dry'
      })
    },
    {
      name: 'Emergency Braking',
      inputs: createTestInputs({
        vehicleSpeed: 80,
        brakePedalPosition: 0.9,
        ambientTemperature: 30,
        roadSurface: 'wet'
      })
    },
    {
      name: 'Cold Weather',
      inputs: createTestInputs({
        vehicleSpeed: 60,
        brakePedalPosition: 0.3,
        ambientTemperature: -10,
        roadSurface: 'snow'
      })
    }
  ];
  
  console.log('\nSimulating Different Driving Scenarios:\n');
  
  for (const scenario of scenarios) {
    console.log(`--- ${scenario.name} ---`);
    
    const outputs = integratedSystem.processControlCycle(scenario.inputs);
    
    console.log('System Outputs:');
    console.log('- Regenerative Power (W):', outputs.regeneratedPower.toFixed(1));
    console.log('- Piezoelectric Power (W):', outputs.piezoelectricPower.toFixed(3));
    console.log('- Total Energy Harvested (W):', outputs.totalEnergyHarvested.toFixed(1));
    console.log('- Regenerative Efficiency:', (outputs.energyRecoveryEfficiency * 100).toFixed(1) + '%');
    console.log('- Piezoelectric Efficiency:', (outputs.piezoelectricEfficiency * 100).toFixed(1) + '%');
    console.log('- System Status:', outputs.systemStatus);
    
    if (outputs.activeWarnings.length > 0) {
      console.log('- Warnings:', outputs.activeWarnings.join(', '));
    }
    
    if (outputs.performanceMetrics.piezoelectricMetrics) {
      const metrics = outputs.performanceMetrics.piezoelectricMetrics;
      console.log('- Piezoelectric Power Density (W/kg):', metrics.powerDensity.toFixed(2));
      console.log('- Frequency Matching Accuracy:', (metrics.frequencyMatchingAccuracy * 100).toFixed(1) + '%');
      console.log('- Temperature Effects:', (metrics.temperatureEffects * 100).toFixed(1) + '%');
    }
    
    console.log('');
  }
  
  // Get system diagnostics
  const diagnostics = integratedSystem.getSystemDiagnostics();
  console.log('System Diagnostics:');
  console.log('- Average Regenerative Efficiency:', (diagnostics.averageEfficiency * 100).toFixed(1) + '%');
  console.log('- Average Piezoelectric Power (W):', diagnostics.averagePiezoelectricPower.toFixed(3));
  console.log('- System Faults:', diagnostics.systemFaults.length);
  
  if (diagnostics.piezoelectricStatus) {
    console.log('- Piezoelectric System Health:', (diagnostics.piezoelectricStatus.health.overallHealth * 100).toFixed(1) + '%');
    console.log('- Active Harvesters:', diagnostics.piezoelectricStatus.harvesters.filter((h: any) => h.status === 'active').length);
  }
}

/**
 * Example 5: Advanced Optimization Scenarios
 * 
 * Demonstrates advanced optimization scenarios including
 * multi-objective optimization and adaptive parameter tuning.
 */
export function demonstrateAdvancedOptimization(): void {
  console.log('\n=== Advanced Optimization Scenarios ===\n');
  
  // Create standalone piezoelectric energy harvester
  const harvester = createPiezoelectricEnergyHarvester(defaultPiezoelectricConfiguration);
  
  console.log('Standalone Piezoelectric Energy Harvester Created');
  
  // Simulate varying operating conditions
  const operatingConditions = [
    { speed: 30, temperature: 15, surface: 'dry' as const },
    { speed: 60, temperature: 25, surface: 'wet' as const },
    { speed: 90, temperature: 35, surface: 'dry' as const },
    { speed: 45, temperature: 5, surface: 'snow' as const }
  ];
  
  console.log('\nAdaptive Optimization Under Varying Conditions:\n');
  
  for (let i = 0; i < operatingConditions.length; i++) {
    const condition = operatingConditions[i];
    console.log(`Condition ${i + 1}: ${condition.speed} km/h, ${condition.temperature}°C, ${condition.surface}`);
    
    const testInputs = createTestInputs({
      vehicleSpeed: condition.speed,
      ambientTemperature: condition.temperature,
      roadSurface: condition.surface,
      brakePedalPosition: 0.2
    });
    
    const results = harvester.update(testInputs);
    
    console.log('- Piezoelectric Power (mW):', (results.piezoelectricPower * 1000).toFixed(1));
    console.log('- Efficiency:', (results.piezoelectricEfficiency * 100).toFixed(1) + '%');
    console.log('- Optimization Status:', results.optimizationStatus);
    
    const metrics = results.harvestingMetrics;
    console.log('- Power Density (W/kg):', metrics.powerDensity.toFixed(2));
    console.log('- Bandwidth Utilization:', (metrics.bandwidthUtilization * 100).toFixed(1) + '%');
    console.log('- Optimization Gain:', metrics.optimizationGain.toFixed(2) + 'x');
    console.log('');
  }
  
  // Get final system status
  const systemStatus = harvester.getSystemStatus();
  console.log('Final System Status:');
  console.log('- Total Power Output (mW):', (systemStatus.totalPowerOutput * 1000).toFixed(1));
  console.log('- Overall Efficiency:', (systemStatus.overallEfficiency * 100).toFixed(1) + '%');
  console.log('- System Health:', (systemStatus.health.overallHealth * 100).toFixed(1) + '%');
  console.log('- Active Harvesters:', systemStatus.harvesters.filter(h => h.status === 'active').length);
  console.log('- Optimization Convergence:', systemStatus.optimization.convergenceStatus);
  
  if (systemStatus.health.warnings.length > 0) {
    console.log('- Warnings:', systemStatus.health.warnings.join(', '));
  }
}

/**
 * Main demonstration function
 * 
 * Runs all examples to showcase the complete piezoelectric
 * energy harvesting optimization system.
 */
export function runPiezoelectricEnergyHarvestingDemo(): void {
  console.log('🔋 PIEZOELECTRIC ENERGY HARVESTING OPTIMIZATION DEMONSTRATION 🔋');
  console.log('================================================================');
  
  try {
    // Run all demonstration examples
    demonstrateMaterialComparison();
    demonstrateStructuralModeling();
    demonstrateOptimizationAlgorithms();
    demonstrateVehicleIntegration();
    demonstrateAdvancedOptimization();
    
    console.log('\n================================================================');
    console.log('✅ DEMONSTRATION COMPLETED SUCCESSFULLY');
    console.log('================================================================');
    
    console.log('\nKey Achievements Demonstrated:');
    console.log('✓ Classical and non-classical piezoelectric materials modeling');
    console.log('✓ Comprehensive structural analysis with modal properties');
    console.log('✓ Multi-objective optimization algorithms (GA, PSO, Gradient)');
    console.log('✓ Vibration energy harvesting from multiple vehicle sources');
    console.log('✓ Integration with existing fuzzy control regenerative braking');
    console.log('✓ Real-time optimization and adaptive parameter tuning');
    console.log('✓ Performance monitoring and system diagnostics');
    console.log('✓ Temperature compensation and environmental adaptation');
    
  } catch (error) {
    console.error('\n❌ DEMONSTRATION FAILED:', error);
    console.log('\nThis may be due to missing dependencies or configuration issues.');
  }
}

// Export the main demo function for easy execution
export default runPiezoelectricEnergyHarvestingDemo;