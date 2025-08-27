/**
 * Comprehensive Material Evaluation Examples
 * 
 * This file demonstrates various material evaluation scenarios for TEG applications,
 * showcasing efficiency, cost-effectiveness, and durability analysis.
 */

import { 
  MaterialEvaluator, 
  createAutomotiveMaterialEvaluator,
  createHighPerformanceMaterialEvaluator,
  createCostOptimizedMaterialEvaluator,
  MaterialEvaluationCriteria
} from '../MaterialEvaluator';

/**
 * Example 1: Comprehensive Material Comparison for Automotive TEGs
 */
export function demonstrateAutomotiveMaterialEvaluation(): void {
  console.log('=== Automotive TEG Material Evaluation ===\n');

  const evaluator = createAutomotiveMaterialEvaluator();
  const comparison = evaluator.compareMaterials();

  console.log('📊 Material Rankings by Overall Score:');
  comparison.rankings.byOverall.slice(0, 5).forEach((result, index) => {
    console.log(`${index + 1}. ${result.material.name}`);
    console.log(`   Overall Score: ${result.scores.overall.toFixed(1)}/100`);
    console.log(`   Efficiency: ${result.scores.efficiency.toFixed(1)}/100`);
    console.log(`   Cost-Effectiveness: ${result.scores.costEffectiveness.toFixed(1)}/100`);
    console.log(`   Durability: ${result.scores.durability.toFixed(1)}/100`);
    console.log(`   Automotive Suitability: ${result.scores.automotiveSuitability.toFixed(1)}/100`);
    console.log(`   Cost: $${result.material.cost}/kg`);
    console.log(`   ZT Value: ${result.material.ztValue}`);
    console.log(`   Operating Range: ${result.material.operatingTempRange.min}°C to ${result.material.operatingTempRange.max}°C`);
    console.log('');
  });

  console.log('🏆 Recommendations:');
  console.log(`Best Overall: ${comparison.recommendations.bestOverall.material.name}`);
  console.log(`Most Cost-Effective: ${comparison.recommendations.mostCostEffective.material.name}`);
  console.log(`Most Durable: ${comparison.recommendations.mostDurable.material.name}`);
  console.log(`Best for High Temperature: ${comparison.recommendations.bestForHighTemp.material.name}`);
  console.log(`Best for Low Temperature: ${comparison.recommendations.bestForLowTemp.material.name}\n`);

  // Detailed analysis of top material
  const topMaterial = comparison.recommendations.bestOverall;
  console.log(`🔍 Detailed Analysis of ${topMaterial.material.name}:`);
  console.log('Strengths:');
  topMaterial.analysis.strengths.forEach(strength => console.log(`  ✓ ${strength}`));
  console.log('Weaknesses:');
  topMaterial.analysis.weaknesses.forEach(weakness => console.log(`  ⚠ ${weakness}`));
  console.log('Recommendations:');
  topMaterial.analysis.recommendations.forEach(rec => console.log(`  💡 ${rec}`));
  console.log('');

  console.log('📈 Performance Metrics:');
  console.log(`  Power Density: ${topMaterial.performanceMetrics.powerDensity.toFixed(2)} W/kg`);
  console.log(`  Efficiency at Operating Temp: ${topMaterial.performanceMetrics.efficiencyAtOperatingTemp.toFixed(1)}%`);
  console.log(`  Cost per Watt: $${topMaterial.performanceMetrics.costPerWatt.toFixed(2)}/W`);
  console.log(`  Expected Lifespan: ${topMaterial.performanceMetrics.expectedLifespan.toFixed(1)} years`);
  console.log(`  Thermal Cycle Rating: ${topMaterial.performanceMetrics.thermalCycleRating.toFixed(0)} cycles\n`);
}

/**
 * Example 2: High-Performance Material Evaluation for Racing Applications
 */
export function demonstrateHighPerformanceMaterialEvaluation(): void {
  console.log('=== High-Performance TEG Material Evaluation ===\n');

  const evaluator = createHighPerformanceMaterialEvaluator();
  const comparison = evaluator.compareMaterials();

  console.log('🏎️ Top Materials for High-Performance Applications:');
  comparison.rankings.byEfficiency.slice(0, 3).forEach((result, index) => {
    console.log(`${index + 1}. ${result.material.name}`);
    console.log(`   ZT Value: ${result.material.ztValue}`);
    console.log(`   Seebeck Coefficient: ${result.material.seebeckCoefficient} μV/K`);
    console.log(`   Max Operating Temperature: ${result.material.operatingTempRange.max}°C`);
    console.log(`   Efficiency Score: ${result.scores.efficiency.toFixed(1)}/100`);
    console.log(`   Cost: $${result.material.cost}/kg`);
    console.log('');
  });

  // Trade-off analysis
  console.log('⚖️ Efficiency vs Cost Trade-off Analysis:');
  comparison.tradeoffAnalysis.efficiencyVsCost
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 5)
    .forEach(item => {
      console.log(`  ${item.material}: Efficiency ${item.efficiency.toFixed(1)}, Cost Score ${item.cost.toFixed(1)}`);
    });
  console.log('');
}

/**
 * Example 3: Cost-Optimized Material Selection for Commercial Vehicles
 */
export function demonstrateCostOptimizedMaterialEvaluation(): void {
  console.log('=== Cost-Optimized TEG Material Evaluation ===\n');

  const evaluator = createCostOptimizedMaterialEvaluator();
  const comparison = evaluator.compareMaterials();

  console.log('💰 Most Cost-Effective Materials:');
  comparison.rankings.byCost.slice(0, 5).forEach((result, index) => {
    console.log(`${index + 1}. ${result.material.name}`);
    console.log(`   Cost: $${result.material.cost}/kg`);
    console.log(`   Cost-Effectiveness Score: ${result.scores.costEffectiveness.toFixed(1)}/100`);
    console.log(`   ZT Value: ${result.material.ztValue}`);
    console.log(`   Overall Score: ${result.scores.overall.toFixed(1)}/100`);
    console.log('');
  });

  console.log('📊 Cost vs Performance Analysis:');
  const costPerformanceRatio = comparison.rankings.byOverall.map(result => ({
    material: result.material.name,
    ratio: result.scores.overall / result.material.cost,
    cost: result.material.cost,
    performance: result.scores.overall
  })).sort((a, b) => b.ratio - a.ratio);

  costPerformanceRatio.slice(0, 5).forEach((item, index) => {
    console.log(`${index + 1}. ${item.material}`);
    console.log(`   Performance/Cost Ratio: ${item.ratio.toFixed(3)}`);
    console.log(`   Cost: $${item.cost}/kg, Performance: ${item.performance.toFixed(1)}/100`);
    console.log('');
  });
}

/**
 * Example 4: Application-Specific Material Recommendations
 */
export function demonstrateApplicationSpecificRecommendations(): void {
  console.log('=== Application-Specific Material Recommendations ===\n');

  const evaluator = createAutomotiveMaterialEvaluator();

  // Brake system TEG application
  console.log('🚗 Brake System TEG Application:');
  const brakeRecommendations = evaluator.recommendMaterialsForApplication({
    temperatureRange: { min: -20, max: 400 },
    powerRequirement: 50, // W
    costBudget: 300, // $/kg
    durabilityRequirement: 'high',
    environmentalConditions: 'harsh'
  });

  brakeRecommendations.forEach((result, index) => {
    console.log(`${index + 1}. ${result.material.name}`);
    console.log(`   Overall Score: ${result.scores.overall.toFixed(1)}/100`);
    console.log(`   Automotive Compatibility: ${result.automotiveCompatibility.vibrationTolerance} vibration tolerance`);
    console.log(`   Temperature Range: ${result.material.operatingTempRange.min}°C to ${result.material.operatingTempRange.max}°C`);
    console.log('');
  });

  // Exhaust system TEG application
  console.log('🔥 Exhaust System TEG Application:');
  const exhaustRecommendations = evaluator.recommendMaterialsForApplication({
    temperatureRange: { min: 100, max: 800 },
    powerRequirement: 200, // W
    costBudget: 500, // $/kg
    durabilityRequirement: 'extreme',
    environmentalConditions: 'harsh'
  });

  exhaustRecommendations.forEach((result, index) => {
    console.log(`${index + 1}. ${result.material.name}`);
    console.log(`   Overall Score: ${result.scores.overall.toFixed(1)}/100`);
    console.log(`   Durability Score: ${result.scores.durability.toFixed(1)}/100`);
    console.log(`   Max Operating Temperature: ${result.material.operatingTempRange.max}°C`);
    console.log('');
  });

  // Low-temperature waste heat recovery
  console.log('❄️ Low-Temperature Waste Heat Recovery:');
  const lowTempRecommendations = evaluator.recommendMaterialsForApplication({
    temperatureRange: { min: -40, max: 150 },
    powerRequirement: 25, // W
    costBudget: 200, // $/kg
    durabilityRequirement: 'standard',
    environmentalConditions: 'moderate'
  });

  lowTempRecommendations.forEach((result, index) => {
    console.log(`${index + 1}. ${result.material.name}`);
    console.log(`   Overall Score: ${result.scores.overall.toFixed(1)}/100`);
    console.log(`   Cost: $${result.material.cost}/kg`);
    console.log(`   ZT Value: ${result.material.ztValue}`);
    console.log('');
  });
}

/**
 * Example 5: Custom Evaluation Criteria
 */
export function demonstrateCustomEvaluationCriteria(): void {
  console.log('=== Custom Evaluation Criteria Example ===\n');

  // Create evaluator with custom criteria for electric vehicle applications
  const customCriteria: Partial<MaterialEvaluationCriteria> = {
    temperatureRange: { min: -30, max: 500 },
    targetZT: 1.5,
    maxCost: 350,
    weightFactors: {
      efficiency: 0.40, // Higher weight on efficiency
      cost: 0.35,       // Higher weight on cost
      durability: 0.15, // Lower weight on durability
      automotive: 0.10  // Lower weight on automotive specific features
    }
  };

  const evaluator = new MaterialEvaluator(customCriteria);
  const comparison = evaluator.compareMaterials();

  console.log('🔧 Custom Weighted Evaluation Results:');
  console.log('Weight Factors: Efficiency 40%, Cost 35%, Durability 15%, Automotive 10%\n');

  comparison.rankings.byOverall.slice(0, 5).forEach((result, index) => {
    console.log(`${index + 1}. ${result.material.name}`);
    console.log(`   Overall Score: ${result.scores.overall.toFixed(1)}/100`);
    console.log(`   Weighted Breakdown:`);
    console.log(`     Efficiency (40%): ${(result.scores.efficiency * 0.40).toFixed(1)}`);
    console.log(`     Cost (35%): ${(result.scores.costEffectiveness * 0.35).toFixed(1)}`);
    console.log(`     Durability (15%): ${(result.scores.durability * 0.15).toFixed(1)}`);
    console.log(`     Automotive (10%): ${(result.scores.automotiveSuitability * 0.10).toFixed(1)}`);
    console.log('');
  });
}

/**
 * Example 6: Material Property Sensitivity Analysis
 */
export function demonstrateMaterialPropertySensitivityAnalysis(): void {
  console.log('=== Material Property Sensitivity Analysis ===\n');

  const evaluator = createAutomotiveMaterialEvaluator();
  const materials = evaluator.getAvailableMaterials();

  // Analyze how ZT value affects overall score
  console.log('📈 ZT Value Impact on Overall Score:');
  const ztAnalysis = materials.map(material => {
    const result = evaluator.evaluateMaterial(material);
    return {
      name: material.name,
      ztValue: material.ztValue,
      overallScore: result.scores.overall,
      efficiencyScore: result.scores.efficiency
    };
  }).sort((a, b) => b.ztValue - a.ztValue);

  ztAnalysis.slice(0, 5).forEach(item => {
    console.log(`${item.name}:`);
    console.log(`  ZT Value: ${item.ztValue}, Overall Score: ${item.overallScore.toFixed(1)}, Efficiency Score: ${item.efficiencyScore.toFixed(1)}`);
  });
  console.log('');

  // Analyze cost impact
  console.log('💲 Cost Impact on Overall Score:');
  const costAnalysis = materials.map(material => {
    const result = evaluator.evaluateMaterial(material);
    return {
      name: material.name,
      cost: material.cost,
      overallScore: result.scores.overall,
      costScore: result.scores.costEffectiveness
    };
  }).sort((a, b) => a.cost - b.cost);

  costAnalysis.slice(0, 5).forEach(item => {
    console.log(`${item.name}:`);
    console.log(`  Cost: $${item.cost}/kg, Overall Score: ${item.overallScore.toFixed(1)}, Cost Score: ${item.costScore.toFixed(1)}`);
  });
  console.log('');

  // Temperature range analysis
  console.log('🌡️ Operating Temperature Range Analysis:');
  const tempAnalysis = materials.map(material => {
    const result = evaluator.evaluateMaterial(material);
    const tempRange = material.operatingTempRange.max - material.operatingTempRange.min;
    return {
      name: material.name,
      tempRange,
      maxTemp: material.operatingTempRange.max,
      durabilityScore: result.scores.durability,
      automotiveScore: result.scores.automotiveSuitability
    };
  }).sort((a, b) => b.tempRange - a.tempRange);

  tempAnalysis.slice(0, 5).forEach(item => {
    console.log(`${item.name}:`);
    console.log(`  Range: ${item.tempRange}°C, Max: ${item.maxTemp}°C`);
    console.log(`  Durability Score: ${item.durabilityScore.toFixed(1)}, Automotive Score: ${item.automotiveScore.toFixed(1)}`);
  });
  console.log('');
}

/**
 * Run all material evaluation examples
 */
export function runAllMaterialEvaluationExamples(): void {
  console.log('🔬 COMPREHENSIVE THERMOELECTRIC MATERIAL EVALUATION\n');
  console.log('This demonstration showcases various approaches to evaluating thermoelectric materials for TEG applications.\n');

  try {
    demonstrateAutomotiveMaterialEvaluation();
    console.log('\n' + '='.repeat(80) + '\n');
    
    demonstrateHighPerformanceMaterialEvaluation();
    console.log('\n' + '='.repeat(80) + '\n');
    
    demonstrateCostOptimizedMaterialEvaluation();
    console.log('\n' + '='.repeat(80) + '\n');
    
    demonstrateApplicationSpecificRecommendations();
    console.log('\n' + '='.repeat(80) + '\n');
    
    demonstrateCustomEvaluationCriteria();
    console.log('\n' + '='.repeat(80) + '\n');
    
    demonstrateMaterialPropertySensitivityAnalysis();
    
    console.log('\n🎯 EVALUATION COMPLETE');
    console.log('The material evaluation system provides comprehensive analysis capabilities for:');
    console.log('• Efficiency assessment based on ZT values and Seebeck coefficients');
    console.log('• Cost-effectiveness analysis considering performance per dollar');
    console.log('• Durability evaluation for automotive environments');
    console.log('• Application-specific recommendations');
    console.log('• Trade-off analysis between different material properties');
    console.log('• Customizable evaluation criteria for specific requirements');
    
  } catch (error) {
    console.error('Error running material evaluation examples:', error);
  }
}

// Export for use in other modules
export {
  MaterialEvaluator,
  createAutomotiveMaterialEvaluator,
  createHighPerformanceMaterialEvaluator,
  createCostOptimizedMaterialEvaluator
};