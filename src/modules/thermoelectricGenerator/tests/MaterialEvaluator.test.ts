/**
 * Comprehensive Test Suite for Material Evaluator
 * 
 * Tests all aspects of the thermoelectric material evaluation system including
 * efficiency calculations, cost analysis, durability assessment, and automotive suitability.
 */

import { 
  MaterialEvaluator, 
  createAutomotiveMaterialEvaluator,
  createHighPerformanceMaterialEvaluator,
  createCostOptimizedMaterialEvaluator,
  MaterialEvaluationCriteria,
  MaterialEvaluationResult,
  MaterialComparison
} from '../MaterialEvaluator';
import { ThermoelectricMaterial } from '../types';

describe('MaterialEvaluator', () => {
  let evaluator: MaterialEvaluator;
  let testMaterial: ThermoelectricMaterial;

  beforeEach(() => {
    evaluator = new MaterialEvaluator();
    testMaterial = {
      name: 'Test Bismuth Telluride',
      type: 'n-type',
      seebeckCoefficient: -200,
      electricalConductivity: 100000,
      thermalConductivity: 1.5,
      ztValue: 1.0,
      operatingTempRange: { min: -40, max: 200 },
      density: 7700,
      specificHeat: 154,
      thermalExpansion: 16e-6,
      cost: 150
    };
  });

  describe('Material Database Initialization', () => {
    test('should initialize with comprehensive material database', () => {
      const materials = evaluator.getAvailableMaterials();
      expect(materials.length).toBeGreaterThan(5);
      
      // Check for key material types
      const materialNames = materials.map(m => m.name);
      expect(materialNames.some(name => name.includes('Bismuth Telluride'))).toBe(true);
      expect(materialNames.some(name => name.includes('Lead Telluride'))).toBe(true);
      expect(materialNames.some(name => name.includes('Silicon Germanium'))).toBe(true);
      expect(materialNames.some(name => name.includes('Skutterudite'))).toBe(true);
    });

    test('should have materials with valid properties', () => {
      const materials = evaluator.getAvailableMaterials();
      
      materials.forEach(material => {
        expect(material.name).toBeDefined();
        expect(material.type).toMatch(/^(n-type|p-type)$/);
        expect(material.seebeckCoefficient).not.toBe(0);
        expect(material.electricalConductivity).toBeGreaterThan(0);
        expect(material.thermalConductivity).toBeGreaterThan(0);
        expect(material.ztValue).toBeGreaterThan(0);
        expect(material.operatingTempRange.max).toBeGreaterThan(material.operatingTempRange.min);
        expect(material.density).toBeGreaterThan(0);
        expect(material.specificHeat).toBeGreaterThan(0);
        expect(material.cost).toBeGreaterThan(0);
      });
    });
  });

  describe('Material Addition and Management', () => {
    test('should add new material to database', () => {
      const initialCount = evaluator.getAvailableMaterials().length;
      evaluator.addMaterial(testMaterial);
      
      const newCount = evaluator.getAvailableMaterials().length;
      expect(newCount).toBe(initialCount + 1);
      
      const addedMaterial = evaluator.getAvailableMaterials().find(m => m.name === testMaterial.name);
      expect(addedMaterial).toEqual(testMaterial);
    });

    test('should update criteria successfully', () => {
      const newCriteria: Partial<MaterialEvaluationCriteria> = {
        targetZT: 1.5,
        maxCost: 300,
        weightFactors: {
          efficiency: 0.5,
          cost: 0.2,
          durability: 0.2,
          automotive: 0.1
        }
      };

      evaluator.updateCriteria(newCriteria);
      
      // Test that criteria update affects evaluation
      const result1 = evaluator.evaluateMaterial(testMaterial);
      
      evaluator.updateCriteria({ weightFactors: { efficiency: 0.1, cost: 0.5, durability: 0.2, automotive: 0.2 } });
      const result2 = evaluator.evaluateMaterial(testMaterial);
      
      // Scores should be different due to different weight factors
      expect(result1.scores.overall).not.toBe(result2.scores.overall);
    });
  });

  describe('Individual Material Evaluation', () => {
    test('should evaluate material with all score components', () => {
      const result = evaluator.evaluateMaterial(testMaterial);
      
      expect(result.material).toEqual(testMaterial);
      expect(result.scores.efficiency).toBeGreaterThanOrEqual(0);
      expect(result.scores.efficiency).toBeLessThanOrEqual(100);
      expect(result.scores.costEffectiveness).toBeGreaterThanOrEqual(0);
      expect(result.scores.costEffectiveness).toBeLessThanOrEqual(100);
      expect(result.scores.durability).toBeGreaterThanOrEqual(0);
      expect(result.scores.durability).toBeLessThanOrEqual(100);
      expect(result.scores.automotiveSuitability).toBeGreaterThanOrEqual(0);
      expect(result.scores.automotiveSuitability).toBeLessThanOrEqual(100);
      expect(result.scores.overall).toBeGreaterThanOrEqual(0);
      expect(result.scores.overall).toBeLessThanOrEqual(100);
    });

    test('should generate comprehensive analysis', () => {
      const result = evaluator.evaluateMaterial(testMaterial);
      
      expect(result.analysis.strengths).toBeInstanceOf(Array);
      expect(result.analysis.weaknesses).toBeInstanceOf(Array);
      expect(result.analysis.recommendations).toBeInstanceOf(Array);
      
      // Should have at least some analysis content
      const totalAnalysisItems = result.analysis.strengths.length + 
                                result.analysis.weaknesses.length + 
                                result.analysis.recommendations.length;
      expect(totalAnalysisItems).toBeGreaterThan(0);
    });

    test('should calculate performance metrics', () => {
      const result = evaluator.evaluateMaterial(testMaterial);
      
      expect(result.performanceMetrics.powerDensity).toBeGreaterThan(0);
      expect(result.performanceMetrics.efficiencyAtOperatingTemp).toBeGreaterThan(0);
      expect(result.performanceMetrics.costPerWatt).toBeGreaterThan(0);
      expect(result.performanceMetrics.expectedLifespan).toBeGreaterThan(0);
      expect(result.performanceMetrics.thermalCycleRating).toBeGreaterThan(0);
    });

    test('should assess automotive compatibility', () => {
      const result = evaluator.evaluateMaterial(testMaterial);
      
      expect(typeof result.automotiveCompatibility.temperatureCompatibility).toBe('boolean');
      expect(['excellent', 'good', 'fair', 'poor']).toContain(result.automotiveCompatibility.vibrationTolerance);
      expect(['excellent', 'good', 'fair', 'poor']).toContain(result.automotiveCompatibility.corrosionResistance);
      expect(['excellent', 'good', 'fair', 'poor']).toContain(result.automotiveCompatibility.manufacturability);
    });
  });

  describe('Material Comparison and Ranking', () => {
    test('should compare all materials and provide rankings', () => {
      const comparison = evaluator.compareMaterials();
      
      expect(comparison.materials.length).toBeGreaterThan(0);
      expect(comparison.rankings.byEfficiency.length).toBe(comparison.materials.length);
      expect(comparison.rankings.byCost.length).toBe(comparison.materials.length);
      expect(comparison.rankings.byDurability.length).toBe(comparison.materials.length);
      expect(comparison.rankings.byOverall.length).toBe(comparison.materials.length);
      
      // Check that rankings are properly sorted
      for (let i = 0; i < comparison.rankings.byEfficiency.length - 1; i++) {
        expect(comparison.rankings.byEfficiency[i].scores.efficiency)
          .toBeGreaterThanOrEqual(comparison.rankings.byEfficiency[i + 1].scores.efficiency);
      }
      
      for (let i = 0; i < comparison.rankings.byOverall.length - 1; i++) {
        expect(comparison.rankings.byOverall[i].scores.overall)
          .toBeGreaterThanOrEqual(comparison.rankings.byOverall[i + 1].scores.overall);
      }
    });

    test('should provide specific recommendations', () => {
      const comparison = evaluator.compareMaterials();
      
      expect(comparison.recommendations.bestOverall).toBeDefined();
      expect(comparison.recommendations.mostCostEffective).toBeDefined();
      expect(comparison.recommendations.mostDurable).toBeDefined();
      expect(comparison.recommendations.bestForHighTemp).toBeDefined();
      expect(comparison.recommendations.bestForLowTemp).toBeDefined();
      
      // Verify recommendations make sense
      expect(comparison.recommendations.bestOverall.scores.overall)
        .toBe(Math.max(...comparison.rankings.byOverall.map(r => r.scores.overall)));
    });

    test('should generate trade-off analysis', () => {
      const comparison = evaluator.compareMaterials();
      
      expect(comparison.tradeoffAnalysis.efficiencyVsCost.length).toBeGreaterThan(0);
      expect(comparison.tradeoffAnalysis.durabilityVsCost.length).toBeGreaterThan(0);
      expect(comparison.tradeoffAnalysis.performanceVsTemperature.length).toBeGreaterThan(0);
      
      // Check data structure
      comparison.tradeoffAnalysis.efficiencyVsCost.forEach(item => {
        expect(item.material).toBeDefined();
        expect(typeof item.efficiency).toBe('number');
        expect(typeof item.cost).toBe('number');
      });
    });

    test('should compare subset of materials when specified', () => {
      const allMaterials = evaluator.getAvailableMaterials();
      const selectedMaterials = allMaterials.slice(0, 3).map(m => m.name);
      
      const comparison = evaluator.compareMaterials(selectedMaterials);
      
      expect(comparison.materials.length).toBe(3);
      expect(comparison.rankings.byOverall.length).toBe(3);
    });
  });

  describe('Application-Specific Recommendations', () => {
    test('should recommend materials for brake system application', () => {
      const recommendations = evaluator.recommendMaterialsForApplication({
        temperatureRange: { min: -20, max: 400 },
        powerRequirement: 50,
        costBudget: 300,
        durabilityRequirement: 'high',
        environmentalConditions: 'harsh'
      });
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.length).toBeLessThanOrEqual(5);
      
      // All recommendations should meet the criteria
      recommendations.forEach(result => {
        expect(result.material.operatingTempRange.min).toBeLessThanOrEqual(-20);
        expect(result.material.operatingTempRange.max).toBeGreaterThanOrEqual(400);
        expect(result.material.cost).toBeLessThanOrEqual(300);
        expect(result.scores.durability).toBeGreaterThanOrEqual(65); // High durability requirement
        expect(result.scores.automotiveSuitability).toBeGreaterThanOrEqual(75); // Harsh conditions
      });
    });

    test('should recommend materials for low-temperature application', () => {
      const recommendations = evaluator.recommendMaterialsForApplication({
        temperatureRange: { min: -40, max: 150 },
        powerRequirement: 25,
        costBudget: 200,
        durabilityRequirement: 'standard',
        environmentalConditions: 'moderate'
      });
      
      expect(recommendations.length).toBeGreaterThan(0);
      
      recommendations.forEach(result => {
        expect(result.material.operatingTempRange.min).toBeLessThanOrEqual(-40);
        expect(result.material.operatingTempRange.max).toBeGreaterThanOrEqual(150);
        expect(result.material.cost).toBeLessThanOrEqual(200);
        expect(result.scores.durability).toBeGreaterThanOrEqual(50); // Standard durability
        expect(result.scores.automotiveSuitability).toBeGreaterThanOrEqual(60); // Moderate conditions
      });
    });

    test('should handle extreme requirements gracefully', () => {
      const recommendations = evaluator.recommendMaterialsForApplication({
        temperatureRange: { min: 0, max: 1200 }, // Very high temperature
        powerRequirement: 1000,
        costBudget: 50, // Very low budget
        durabilityRequirement: 'extreme',
        environmentalConditions: 'harsh'
      });
      
      // Should return empty array or very few materials for impossible requirements
      expect(recommendations.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Factory Functions', () => {
    test('should create automotive-optimized evaluator', () => {
      const automotiveEvaluator = createAutomotiveMaterialEvaluator();
      expect(automotiveEvaluator).toBeInstanceOf(MaterialEvaluator);
      
      const materials = automotiveEvaluator.getAvailableMaterials();
      expect(materials.length).toBeGreaterThan(0);
    });

    test('should create high-performance evaluator', () => {
      const highPerfEvaluator = createHighPerformanceMaterialEvaluator();
      expect(highPerfEvaluator).toBeInstanceOf(MaterialEvaluator);
      
      // Should prioritize efficiency over cost
      const comparison = highPerfEvaluator.compareMaterials();
      const topMaterial = comparison.rankings.byOverall[0];
      
      // High-performance evaluator should favor high ZT materials
      expect(topMaterial.material.ztValue).toBeGreaterThan(0.8);
    });

    test('should create cost-optimized evaluator', () => {
      const costOptimizedEvaluator = createCostOptimizedMaterialEvaluator();
      expect(costOptimizedEvaluator).toBeInstanceOf(MaterialEvaluator);
      
      // Should prioritize cost over performance
      const comparison = costOptimizedEvaluator.compareMaterials();
      const topMaterial = comparison.rankings.byOverall[0];
      
      // Cost-optimized evaluator should favor lower cost materials
      expect(topMaterial.material.cost).toBeLessThan(400);
    });
  });

  describe('Score Calculation Validation', () => {
    test('should calculate efficiency scores correctly', () => {
      const highZTMaterial: ThermoelectricMaterial = {
        ...testMaterial,
        ztValue: 2.0,
        seebeckCoefficient: -300,
        electricalConductivity: 150000
      };
      
      const lowZTMaterial: ThermoelectricMaterial = {
        ...testMaterial,
        ztValue: 0.5,
        seebeckCoefficient: -100,
        electricalConductivity: 50000
      };
      
      const highResult = evaluator.evaluateMaterial(highZTMaterial);
      const lowResult = evaluator.evaluateMaterial(lowZTMaterial);
      
      expect(highResult.scores.efficiency).toBeGreaterThan(lowResult.scores.efficiency);
    });

    test('should calculate cost scores correctly', () => {
      const expensiveMaterial: ThermoelectricMaterial = {
        ...testMaterial,
        cost: 800
      };
      
      const cheapMaterial: ThermoelectricMaterial = {
        ...testMaterial,
        cost: 100
      };
      
      const expensiveResult = evaluator.evaluateMaterial(expensiveMaterial);
      const cheapResult = evaluator.evaluateMaterial(cheapMaterial);
      
      expect(cheapResult.scores.costEffectiveness).toBeGreaterThan(expensiveResult.scores.costEffectiveness);
    });

    test('should calculate durability scores correctly', () => {
      const durableMaterial: ThermoelectricMaterial = {
        ...testMaterial,
        operatingTempRange: { min: -50, max: 800 },
        thermalExpansion: 5e-6,
        density: 8500
      };
      
      const fragileResult = evaluator.evaluateMaterial(testMaterial);
      const durableResult = evaluator.evaluateMaterial(durableMaterial);
      
      expect(durableResult.scores.durability).toBeGreaterThan(fragileResult.scores.durability);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle materials with extreme properties', () => {
      const extremeMaterial: ThermoelectricMaterial = {
        name: 'Extreme Material',
        type: 'n-type',
        seebeckCoefficient: -1000,
        electricalConductivity: 1000000,
        thermalConductivity: 0.1,
        ztValue: 5.0,
        operatingTempRange: { min: -100, max: 2000 },
        density: 20000,
        specificHeat: 1000,
        thermalExpansion: 1e-6,
        cost: 10000
      };
      
      expect(() => {
        const result = evaluator.evaluateMaterial(extremeMaterial);
        expect(result.scores.overall).toBeGreaterThanOrEqual(0);
        expect(result.scores.overall).toBeLessThanOrEqual(100);
      }).not.toThrow();
    });

    test('should handle empty material list gracefully', () => {
      const emptyEvaluator = new MaterialEvaluator();
      // Clear all materials
      const materials = emptyEvaluator.getAvailableMaterials();
      
      // Create evaluator with no pre-loaded materials
      const customEvaluator = new MaterialEvaluator();
      
      expect(() => {
        const comparison = customEvaluator.compareMaterials([]);
        expect(comparison.materials.length).toBe(0);
      }).not.toThrow();
    });

    test('should validate material properties', () => {
      const invalidMaterial: ThermoelectricMaterial = {
        name: 'Invalid Material',
        type: 'n-type',
        seebeckCoefficient: 0, // Invalid
        electricalConductivity: -100, // Invalid
        thermalConductivity: 0, // Invalid
        ztValue: -1, // Invalid
        operatingTempRange: { min: 100, max: 50 }, // Invalid range
        density: 0, // Invalid
        specificHeat: -50, // Invalid
        thermalExpansion: 0,
        cost: -100 // Invalid
      };
      
      // Should still evaluate without throwing, but with poor scores
      expect(() => {
        const result = evaluator.evaluateMaterial(invalidMaterial);
        expect(result.scores.overall).toBeLessThan(50); // Should score poorly
      }).not.toThrow();
    });
  });

  describe('Performance and Optimization', () => {
    test('should handle large number of materials efficiently', () => {
      // Add many test materials
      for (let i = 0; i < 100; i++) {
        evaluator.addMaterial({
          ...testMaterial,
          name: `Test Material ${i}`,
          ztValue: 0.5 + Math.random() * 2,
          cost: 100 + Math.random() * 400,
          seebeckCoefficient: -100 - Math.random() * 200
        });
      }
      
      const startTime = Date.now();
      const comparison = evaluator.compareMaterials();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(comparison.materials.length).toBeGreaterThan(100);
    });

    test('should maintain consistent rankings across multiple evaluations', () => {
      const comparison1 = evaluator.compareMaterials();
      const comparison2 = evaluator.compareMaterials();
      
      expect(comparison1.rankings.byOverall[0].material.name)
        .toBe(comparison2.rankings.byOverall[0].material.name);
      expect(comparison1.rankings.byEfficiency[0].material.name)
        .toBe(comparison2.rankings.byEfficiency[0].material.name);
    });
  });
});

describe('Integration Tests', () => {
  test('should integrate with existing TEG system', () => {
    const evaluator = createAutomotiveMaterialEvaluator();
    const comparison = evaluator.compareMaterials();
    
    // Should be able to use recommended materials in TEG configuration
    const recommendedMaterial = comparison.recommendations.bestOverall.material;
    
    expect(recommendedMaterial.name).toBeDefined();
    expect(recommendedMaterial.ztValue).toBeGreaterThan(0);
    expect(recommendedMaterial.operatingTempRange.max).toBeGreaterThan(recommendedMaterial.operatingTempRange.min);
  });

  test('should provide materials suitable for different TEG applications', () => {
    const evaluator = createAutomotiveMaterialEvaluator();
    
    // Test different application scenarios
    const applications = [
      { name: 'Brake System', tempRange: { min: -20, max: 400 }, budget: 300 },
      { name: 'Exhaust System', tempRange: { min: 100, max: 800 }, budget: 500 },
      { name: 'Electronics Cooling', tempRange: { min: 0, max: 150 }, budget: 200 }
    ];
    
    applications.forEach(app => {
      const recommendations = evaluator.recommendMaterialsForApplication({
        temperatureRange: app.tempRange,
        powerRequirement: 50,
        costBudget: app.budget,
        durabilityRequirement: 'standard',
        environmentalConditions: 'moderate'
      });
      
      expect(recommendations.length).toBeGreaterThan(0);
      recommendations.forEach(rec => {
        expect(rec.material.operatingTempRange.min).toBeLessThanOrEqual(app.tempRange.min);
        expect(rec.material.operatingTempRange.max).toBeGreaterThanOrEqual(app.tempRange.max);
        expect(rec.material.cost).toBeLessThanOrEqual(app.budget);
      });
    });
  });
});