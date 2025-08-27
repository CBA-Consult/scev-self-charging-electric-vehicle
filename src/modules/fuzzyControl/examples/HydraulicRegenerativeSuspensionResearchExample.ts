/**
 * Hydraulic Regenerative Suspension Research Example
 * 
 * This example demonstrates comprehensive research and analysis capabilities for HRS systems,
 * including parameter optimization, performance comparison, and detailed analysis.
 * 
 * Features demonstrated:
 * - Multi-objective optimization for comfort, energy harvesting, and stability
 * - Performance comparison between HRS and traditional suspension systems
 * - Parameter sweep analysis for system optimization
 * - Comprehensive research report generation
 * 
 * @author HRS Research Team
 * @version 2.0.0
 */

import {
  HydraulicRegenerativeSuspensionResearch,
  createResearchConfiguration,
  createDefaultHydraulicParameters,
  createDefaultTraditionalParameters,
  HydraulicSystemParameters,
  TraditionalSuspensionParameters,
  ResearchConfiguration
} from '../HydraulicRegenerativeSuspensionResearch';

/**
 * Comprehensive HRS Research Example
 * 
 * This function demonstrates the full research capabilities of the HRS system,
 * including optimization, comparison, and analysis.
 */
export function comprehensiveHRSResearchExample(): void {
  console.log('🔬 Starting Comprehensive HRS Research Analysis');
  console.log('=' .repeat(60));

  // Create research configuration
  const researchConfig = createResearchConfiguration({
    simulationDuration: 120,        // 2 minutes of simulation
    timeStep: 0.01,                // 10ms time step
    roadProfileType: 'moderate',
    comfortWeight: 0.4,            // 40% weight on comfort
    energyWeight: 0.35,            // 35% weight on energy harvesting
    stabilityWeight: 0.25,         // 25% weight on stability
    enableParameterSweep: true,
    enableOptimization: true,
    enableComparison: true
  });

  // Initialize research system
  const research = new HydraulicRegenerativeSuspensionResearch(researchConfig);

  // Create default parameters
  const hydraulicParams = createDefaultHydraulicParameters();
  const traditionalParams = createDefaultTraditionalParameters();

  // Generate test road profile
  const testConditions = research.generateRoadProfile('moderate', 60); // 1 minute test

  console.log(`📊 Generated ${testConditions.length} test data points`);
  console.log(`🛣️  Road profile: ${researchConfig.roadProfileType}`);
  console.log();

  // 1. Basic Performance Analysis
  console.log('1️⃣  BASIC PERFORMANCE ANALYSIS');
  console.log('-'.repeat(40));
  
  const hrsMetrics = research.analyzeHRSPerformance(hydraulicParams, testConditions);
  const traditionalMetrics = research.analyzeTraditionalSuspension(traditionalParams, testConditions);

  console.log('HRS System Performance:');
  console.log(`  • Comfort Index: ${(hrsMetrics.comfortIndex * 100).toFixed(1)}%`);
  console.log(`  • Energy Efficiency: ${(hrsMetrics.energyEfficiency * 100).toFixed(1)}%`);
  console.log(`  • Average Power: ${hrsMetrics.averagePowerGeneration.toFixed(0)}W`);
  console.log(`  • Total Energy: ${hrsMetrics.totalEnergyHarvested.toFixed(0)}J`);
  console.log(`  • System Efficiency: ${(hrsMetrics.systemEfficiency * 100).toFixed(1)}%`);

  console.log('\nTraditional Suspension Performance:');
  console.log(`  • Comfort Index: ${(traditionalMetrics.comfortIndex * 100).toFixed(1)}%`);
  console.log(`  • Energy Harvesting: ${traditionalMetrics.averagePowerGeneration}W (none)`);
  console.log(`  • System Efficiency: ${(traditionalMetrics.systemEfficiency * 100).toFixed(1)}%`);
  console.log();

  // 2. Performance Comparison
  console.log('2️⃣  PERFORMANCE COMPARISON');
  console.log('-'.repeat(40));
  
  const comparison = research.comparePerformance(hydraulicParams, traditionalParams, testConditions);
  
  console.log('Improvement Factors:');
  console.log(`  • Comfort: ${comparison.improvementFactors.comfortImprovement.toFixed(1)}% improvement`);
  console.log(`  • Energy Benefit: ${comparison.improvementFactors.energyBenefit.toFixed(0)}W additional power`);
  console.log(`  • Stability: ${comparison.improvementFactors.stabilityImprovement.toFixed(1)}% improvement`);
  console.log();

  // 3. Parameter Optimization
  console.log('3️⃣  PARAMETER OPTIMIZATION');
  console.log('-'.repeat(40));
  
  console.log('🔄 Running multi-objective optimization...');
  const optimizationResult = research.optimizeHRSParameters(hydraulicParams, testConditions, 50);
  
  console.log('Optimization Results:');
  console.log(`  • Optimization Score: ${optimizationResult.optimizationScore.toFixed(3)}`);
  console.log(`  • Convergence: ${optimizationResult.convergenceHistory.length} iterations`);
  
  console.log('\nOptimal Parameters:');
  const optimal = optimizationResult.optimalParameters;
  console.log(`  • Cylinder Diameter: ${optimal.cylinderDiameter.toFixed(1)}mm`);
  console.log(`  • Motor Displacement: ${optimal.motorDisplacement.toFixed(1)}cm³/rev`);
  console.log(`  • Accumulator Volume: ${optimal.accumulatorVolume.toFixed(1)}L`);
  console.log(`  • Precharge Pressure: ${optimal.prechargeePressure.toFixed(0)}bar`);
  console.log(`  • Max Working Pressure: ${optimal.maxWorkingPressure.toFixed(0)}bar`);
  
  console.log('\nOptimized Performance:');
  const optimizedMetrics = optimizationResult.achievedMetrics;
  console.log(`  • Comfort Index: ${(optimizedMetrics.comfortIndex * 100).toFixed(1)}%`);
  console.log(`  • Energy Efficiency: ${(optimizedMetrics.energyEfficiency * 100).toFixed(1)}%`);
  console.log(`  • Average Power: ${optimizedMetrics.averagePowerGeneration.toFixed(0)}W`);
  console.log(`  • System Efficiency: ${(optimizedMetrics.systemEfficiency * 100).toFixed(1)}%`);
  console.log();

  // 4. Parameter Sweep Analysis
  console.log('4️⃣  PARAMETER SWEEP ANALYSIS');
  console.log('-'.repeat(40));
  
  console.log('🔍 Analyzing cylinder diameter impact...');
  const cylinderSweep = research.performParameterSweep(
    hydraulicParams,
    'cylinderDiameter',
    [30, 80],
    10,
    testConditions.slice(0, 1000) // Use subset for faster analysis
  );
  
  console.log('Cylinder Diameter Analysis:');
  cylinderSweep.forEach((result, index) => {
    if (index % 3 === 0) { // Show every 3rd result
      console.log(`  • ${result.parameterValue.toFixed(0)}mm: ` +
                 `Comfort=${(result.metrics.comfortIndex * 100).toFixed(0)}%, ` +
                 `Energy=${result.metrics.averagePowerGeneration.toFixed(0)}W`);
    }
  });
  
  console.log('\n🔍 Analyzing motor displacement impact...');
  const motorSweep = research.performParameterSweep(
    hydraulicParams,
    'motorDisplacement',
    [15, 60],
    8,
    testConditions.slice(0, 1000)
  );
  
  console.log('Motor Displacement Analysis:');
  motorSweep.forEach((result, index) => {
    if (index % 2 === 0) { // Show every 2nd result
      console.log(`  • ${result.parameterValue.toFixed(0)}cm³/rev: ` +
                 `Efficiency=${(result.metrics.energyEfficiency * 100).toFixed(0)}%, ` +
                 `Power=${result.metrics.averagePowerGeneration.toFixed(0)}W`);
    }
  });
  console.log();

  // 5. Comprehensive Research Report
  console.log('5️⃣  COMPREHENSIVE RESEARCH REPORT');
  console.log('-'.repeat(40));
  
  const report = research.generateResearchReport(hydraulicParams, traditionalParams, testConditions);
  
  console.log(report.executiveSummary);
  console.log('\n📋 Key Recommendations:');
  report.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
  console.log();

  // 6. Export Research Data
  console.log('6️⃣  DATA EXPORT');
  console.log('-'.repeat(40));
  
  const exportData = research.exportResearchData();
  console.log(`📤 Research data exported:`);
  console.log(`  • Configuration: ${Object.keys(exportData.configuration).length} parameters`);
  console.log(`  • Simulation Data: ${exportData.simulationData.length} data points`);
  console.log(`  • Timestamp: ${new Date(exportData.timestamp).toISOString()}`);
  console.log();

  console.log('✅ Comprehensive HRS Research Analysis Complete!');
  console.log('=' .repeat(60));
}

/**
 * Advanced Parameter Optimization Example
 * 
 * Demonstrates advanced optimization techniques for specific use cases
 */
export function advancedParameterOptimizationExample(): void {
  console.log('🎯 Advanced Parameter Optimization Example');
  console.log('=' .repeat(50));

  // Create specialized configurations for different scenarios
  const scenarios = [
    {
      name: 'Comfort-Focused',
      config: createResearchConfiguration({
        comfortWeight: 0.6,
        energyWeight: 0.2,
        stabilityWeight: 0.2,
        roadProfileType: 'smooth'
      })
    },
    {
      name: 'Energy-Focused',
      config: createResearchConfiguration({
        comfortWeight: 0.2,
        energyWeight: 0.6,
        stabilityWeight: 0.2,
        roadProfileType: 'rough'
      })
    },
    {
      name: 'Stability-Focused',
      config: createResearchConfiguration({
        comfortWeight: 0.2,
        energyWeight: 0.2,
        stabilityWeight: 0.6,
        roadProfileType: 'moderate'
      })
    }
  ];

  scenarios.forEach((scenario, index) => {
    console.log(`\n${index + 1}. ${scenario.name.toUpperCase()} OPTIMIZATION`);
    console.log('-'.repeat(30));

    const research = new HydraulicRegenerativeSuspensionResearch(scenario.config);
    const testConditions = research.generateRoadProfile(scenario.config.roadProfileType, 30);
    const baseParams = createDefaultHydraulicParameters();

    const optimization = research.optimizeHRSParameters(baseParams, testConditions, 30);

    console.log(`Optimization Score: ${optimization.optimizationScore.toFixed(3)}`);
    console.log(`Key Parameters:`);
    console.log(`  • Cylinder: ${optimization.optimalParameters.cylinderDiameter.toFixed(1)}mm`);
    console.log(`  • Motor: ${optimization.optimalParameters.motorDisplacement.toFixed(1)}cm³/rev`);
    console.log(`  • Accumulator: ${optimization.optimalParameters.accumulatorVolume.toFixed(1)}L`);
    
    const metrics = optimization.achievedMetrics;
    console.log(`Performance:`);
    console.log(`  • Comfort: ${(metrics.comfortIndex * 100).toFixed(1)}%`);
    console.log(`  • Energy: ${metrics.averagePowerGeneration.toFixed(0)}W`);
    console.log(`  • Efficiency: ${(metrics.systemEfficiency * 100).toFixed(1)}%`);
  });

  console.log('\n✅ Advanced Optimization Complete!');
}

/**
 * Road Condition Impact Analysis
 * 
 * Analyzes how different road conditions affect HRS performance
 */
export function roadConditionImpactAnalysis(): void {
  console.log('🛣️  Road Condition Impact Analysis');
  console.log('=' .repeat(40));

  const research = new HydraulicRegenerativeSuspensionResearch(createResearchConfiguration());
  const hydraulicParams = createDefaultHydraulicParameters();
  const traditionalParams = createDefaultTraditionalParameters();

  const roadTypes: Array<'smooth' | 'moderate' | 'rough'> = ['smooth', 'moderate', 'rough'];

  roadTypes.forEach(roadType => {
    console.log(`\n📊 ${roadType.toUpperCase()} ROAD CONDITIONS`);
    console.log('-'.repeat(25));

    const testConditions = research.generateRoadProfile(roadType, 45);
    const comparison = research.comparePerformance(hydraulicParams, traditionalParams, testConditions);

    console.log(`HRS Performance:`);
    console.log(`  • Comfort: ${(comparison.hrsMetrics.comfortIndex * 100).toFixed(1)}%`);
    console.log(`  • Power: ${comparison.hrsMetrics.averagePowerGeneration.toFixed(0)}W`);
    console.log(`  • Energy: ${comparison.hrsMetrics.totalEnergyHarvested.toFixed(0)}J`);
    console.log(`  • RMS Acceleration: ${comparison.hrsMetrics.rmsAcceleration.toFixed(2)}m/s²`);

    console.log(`Improvement vs Traditional:`);
    console.log(`  • Comfort: ${comparison.improvementFactors.comfortImprovement.toFixed(1)}%`);
    console.log(`  • Stability: ${comparison.improvementFactors.stabilityImprovement.toFixed(1)}%`);
    console.log(`  • Energy Benefit: ${comparison.improvementFactors.energyBenefit.toFixed(0)}W`);
  });

  console.log('\n✅ Road Condition Analysis Complete!');
}

/**
 * System Component Analysis
 * 
 * Analyzes the impact of individual system components on overall performance
 */
export function systemComponentAnalysis(): void {
  console.log('🔧 System Component Analysis');
  console.log('=' .repeat(35));

  const research = new HydraulicRegenerativeSuspensionResearch(createResearchConfiguration());
  const baseParams = createDefaultHydraulicParameters();
  const testConditions = research.generateRoadProfile('moderate', 30);

  // Analyze key components
  const components = [
    { name: 'Cylinder Diameter', param: 'cylinderDiameter' as keyof HydraulicSystemParameters, range: [35, 75] as [number, number] },
    { name: 'Motor Displacement', param: 'motorDisplacement' as keyof HydraulicSystemParameters, range: [20, 50] as [number, number] },
    { name: 'Accumulator Volume', param: 'accumulatorVolume' as keyof HydraulicSystemParameters, range: [1.5, 4.0] as [number, number] },
    { name: 'Working Pressure', param: 'maxWorkingPressure' as keyof HydraulicSystemParameters, range: [200, 300] as [number, number] }
  ];

  components.forEach(component => {
    console.log(`\n🔍 ${component.name} Analysis`);
    console.log('-'.repeat(20));

    const sweepResults = research.performParameterSweep(
      baseParams,
      component.param,
      component.range,
      5,
      testConditions
    );

    sweepResults.forEach(result => {
      console.log(`  ${result.parameterValue.toFixed(1)}: ` +
                 `Comfort=${(result.metrics.comfortIndex * 100).toFixed(0)}%, ` +
                 `Power=${result.metrics.averagePowerGeneration.toFixed(0)}W, ` +
                 `Efficiency=${(result.metrics.systemEfficiency * 100).toFixed(0)}%`);
    });

    // Find optimal value
    const optimal = sweepResults.reduce((best, current) => 
      current.metrics.systemEfficiency > best.metrics.systemEfficiency ? current : best
    );
    console.log(`  ⭐ Optimal: ${optimal.parameterValue.toFixed(1)} (${(optimal.metrics.systemEfficiency * 100).toFixed(1)}% efficiency)`);
  });

  console.log('\n✅ Component Analysis Complete!');
}

/**
 * Run all research examples
 */
export function runAllHRSResearchExamples(): void {
  console.log('🚀 Running All HRS Research Examples');
  console.log('=' .repeat(50));

  try {
    comprehensiveHRSResearchExample();
    console.log('\n');
    
    advancedParameterOptimizationExample();
    console.log('\n');
    
    roadConditionImpactAnalysis();
    console.log('\n');
    
    systemComponentAnalysis();
    
    console.log('\n🎉 All HRS Research Examples Completed Successfully!');
  } catch (error) {
    console.error('❌ Error in research examples:', error);
  }
}

// Export for use in other modules
export {
  comprehensiveHRSResearchExample,
  advancedParameterOptimizationExample,
  roadConditionImpactAnalysis,
  systemComponentAnalysis
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllHRSResearchExamples();
}