/**
 * Quick Material Evaluation Demonstration
 * 
 * A concise example showing the key capabilities of the material evaluation system
 */

import { 
  createAutomotiveMaterialEvaluator,
  createHighPerformanceMaterialEvaluator,
  createCostOptimizedMaterialEvaluator
} from '../MaterialEvaluator';

/**
 * Quick demonstration of material evaluation capabilities
 */
export function quickMaterialEvaluationDemo(): void {
  console.log('🔬 Quick Thermoelectric Material Evaluation Demo\n');

  // 1. Automotive Material Evaluation
  console.log('1️⃣ Automotive Application Evaluation:');
  const automotiveEvaluator = createAutomotiveMaterialEvaluator();
  const automotiveComparison = automotiveEvaluator.compareMaterials();
  
  const topAutomotive = automotiveComparison.recommendations.bestOverall;
  console.log(`   Best Overall: ${topAutomotive.material.name}`);
  console.log(`   Score: ${topAutomotive.scores.overall.toFixed(1)}/100`);
  console.log(`   ZT Value: ${topAutomotive.material.ztValue}`);
  console.log(`   Cost: $${topAutomotive.material.cost}/kg`);
  console.log(`   Temperature Range: ${topAutomotive.material.operatingTempRange.min}°C to ${topAutomotive.material.operatingTempRange.max}°C\n`);

  // 2. High-Performance Evaluation
  console.log('2️⃣ High-Performance Application Evaluation:');
  const highPerfEvaluator = createHighPerformanceMaterialEvaluator();
  const highPerfComparison = highPerfEvaluator.compareMaterials();
  
  const topHighPerf = highPerfComparison.rankings.byEfficiency[0];
  console.log(`   Most Efficient: ${topHighPerf.material.name}`);
  console.log(`   Efficiency Score: ${topHighPerf.scores.efficiency.toFixed(1)}/100`);
  console.log(`   ZT Value: ${topHighPerf.material.ztValue}`);
  console.log(`   Seebeck Coefficient: ${topHighPerf.material.seebeckCoefficient} μV/K\n`);

  // 3. Cost-Optimized Evaluation
  console.log('3️⃣ Cost-Optimized Application Evaluation:');
  const costOptEvaluator = createCostOptimizedMaterialEvaluator();
  const costOptComparison = costOptEvaluator.compareMaterials();
  
  const topCostOpt = costOptComparison.recommendations.mostCostEffective;
  console.log(`   Most Cost-Effective: ${topCostOpt.material.name}`);
  console.log(`   Cost-Effectiveness Score: ${topCostOpt.scores.costEffectiveness.toFixed(1)}/100`);
  console.log(`   Cost: $${topCostOpt.material.cost}/kg`);
  console.log(`   Performance/Cost Ratio: ${(topCostOpt.scores.overall / topCostOpt.material.cost).toFixed(3)}\n`);

  // 4. Application-Specific Recommendations
  console.log('4️⃣ Application-Specific Recommendations:');
  
  // Brake system application
  const brakeRecommendations = automotiveEvaluator.recommendMaterialsForApplication({
    temperatureRange: { min: -20, max: 400 },
    powerRequirement: 75,
    costBudget: 300,
    durabilityRequirement: 'high',
    environmentalConditions: 'harsh'
  });

  console.log('   Brake System TEG:');
  if (brakeRecommendations.length > 0) {
    const brakeTop = brakeRecommendations[0];
    console.log(`     Recommended: ${brakeTop.material.name}`);
    console.log(`     Overall Score: ${brakeTop.scores.overall.toFixed(1)}/100`);
    console.log(`     Automotive Suitability: ${brakeTop.scores.automotiveSuitability.toFixed(1)}/100`);
  } else {
    console.log('     No materials meet the strict requirements');
  }

  // Exhaust system application
  const exhaustRecommendations = automotiveEvaluator.recommendMaterialsForApplication({
    temperatureRange: { min: 100, max: 700 },
    powerRequirement: 300,
    costBudget: 500,
    durabilityRequirement: 'extreme',
    environmentalConditions: 'harsh'
  });

  console.log('   Exhaust System TEG:');
  if (exhaustRecommendations.length > 0) {
    const exhaustTop = exhaustRecommendations[0];
    console.log(`     Recommended: ${exhaustTop.material.name}`);
    console.log(`     Overall Score: ${exhaustTop.scores.overall.toFixed(1)}/100`);
    console.log(`     Durability Score: ${exhaustTop.scores.durability.toFixed(1)}/100`);
  } else {
    console.log('     No materials meet the strict requirements');
  }

  console.log('\n✅ Material evaluation system successfully demonstrated!');
  console.log('The system provides comprehensive analysis for:');
  console.log('• Multiple evaluation criteria (efficiency, cost, durability, automotive suitability)');
  console.log('• Various application scenarios (automotive, high-performance, cost-optimized)');
  console.log('• Application-specific material recommendations');
  console.log('• Trade-off analysis and comparative rankings');
}

/**
 * Demonstrate material property analysis
 */
export function demonstrateMaterialProperties(): void {
  console.log('\n📊 Material Property Analysis:\n');

  const evaluator = createAutomotiveMaterialEvaluator();
  const materials = evaluator.getAvailableMaterials();

  // Show range of ZT values
  const ztValues = materials.map(m => m.ztValue).sort((a, b) => b - a);
  console.log(`ZT Value Range: ${ztValues[ztValues.length - 1].toFixed(1)} to ${ztValues[0].toFixed(1)}`);

  // Show cost range
  const costs = materials.map(m => m.cost).sort((a, b) => a - b);
  console.log(`Cost Range: $${costs[0]}/kg to $${costs[costs.length - 1]}/kg`);

  // Show temperature ranges
  const maxTemps = materials.map(m => m.operatingTempRange.max).sort((a, b) => b - a);
  const minTemps = materials.map(m => m.operatingTempRange.min).sort((a, b) => a - b);
  console.log(`Temperature Range: ${minTemps[0]}°C to ${maxTemps[0]}°C`);

  // Show material types
  const materialTypes = [...new Set(materials.map(m => {
    if (m.name.includes('Bismuth')) return 'Bismuth Telluride';
    if (m.name.includes('Lead')) return 'Lead Telluride';
    if (m.name.includes('Silicon')) return 'Silicon Germanium';
    if (m.name.includes('Skutterudite')) return 'Skutterudite';
    if (m.name.includes('Half-Heusler')) return 'Half-Heusler';
    if (m.name.includes('Oxide')) return 'Oxide';
    if (m.name.includes('Nanostructured')) return 'Nanostructured';
    return 'Other';
  }))];
  
  console.log(`Material Categories: ${materialTypes.join(', ')}`);
  console.log(`Total Materials in Database: ${materials.length}`);
}

// Run the demo if this file is executed directly
if (require.main === module) {
  quickMaterialEvaluationDemo();
  demonstrateMaterialProperties();
}