/**
 * Comprehensive Thermoelectric Material Evaluator for TEGs
 * 
 * This module provides comprehensive evaluation capabilities for thermoelectric materials
 * suitable for automotive TEG applications, focusing on efficiency, cost-effectiveness,
 * and durability in automotive environments.
 */

import { ThermoelectricMaterial, TEGConfiguration, ThermalConditions } from './types';

export interface MaterialEvaluationCriteria {
  temperatureRange: {
    min: number; // °C
    max: number; // °C
  };
  targetZT: number;
  maxCost: number; // $/kg
  automotiveRequirements: {
    vibrationResistance: boolean;
    thermalCycling: boolean;
    corrosionResistance: boolean;
    longTermStability: boolean;
  };
  weightFactors: {
    efficiency: number;
    cost: number;
    durability: number;
    automotive: number;
  };
}

export interface MaterialEvaluationResult {
  material: ThermoelectricMaterial;
  scores: {
    efficiency: number; // 0-100
    costEffectiveness: number; // 0-100
    durability: number; // 0-100
    automotiveSuitability: number; // 0-100
    overall: number; // 0-100
  };
  analysis: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  performanceMetrics: {
    powerDensity: number; // W/kg
    efficiencyAtOperatingTemp: number; // %
    costPerWatt: number; // $/W
    expectedLifespan: number; // years
    thermalCycleRating: number; // cycles
  };
  automotiveCompatibility: {
    temperatureCompatibility: boolean;
    vibrationTolerance: 'excellent' | 'good' | 'fair' | 'poor';
    corrosionResistance: 'excellent' | 'good' | 'fair' | 'poor';
    manufacturability: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

export interface MaterialComparison {
  materials: ThermoelectricMaterial[];
  rankings: {
    byEfficiency: MaterialEvaluationResult[];
    byCost: MaterialEvaluationResult[];
    byDurability: MaterialEvaluationResult[];
    byOverall: MaterialEvaluationResult[];
  };
  recommendations: {
    bestOverall: MaterialEvaluationResult;
    mostCostEffective: MaterialEvaluationResult;
    mostDurable: MaterialEvaluationResult;
    bestForHighTemp: MaterialEvaluationResult;
    bestForLowTemp: MaterialEvaluationResult;
  };
  tradeoffAnalysis: {
    efficiencyVsCost: Array<{material: string; efficiency: number; cost: number}>;
    durabilityVsCost: Array<{material: string; durability: number; cost: number}>;
    performanceVsTemperature: Array<{material: string; performance: number; tempRange: number}>;
  };
}

export class MaterialEvaluator {
  private materials: Map<string, ThermoelectricMaterial>;
  private evaluationCriteria: MaterialEvaluationCriteria;

  constructor(criteria?: Partial<MaterialEvaluationCriteria>) {
    this.materials = new Map();
    this.evaluationCriteria = {
      temperatureRange: { min: -40, max: 600 },
      targetZT: 1.0,
      maxCost: 500,
      automotiveRequirements: {
        vibrationResistance: true,
        thermalCycling: true,
        corrosionResistance: true,
        longTermStability: true
      },
      weightFactors: {
        efficiency: 0.35,
        cost: 0.25,
        durability: 0.25,
        automotive: 0.15
      },
      ...criteria
    };
    
    this.initializeExtendedMaterialDatabase();
  }

  /**
   * Initialize comprehensive material database with automotive-specific properties
   */
  private initializeExtendedMaterialDatabase(): void {
    // Bismuth Telluride variants
    this.addMaterial({
      name: 'Bismuth Telluride (Bi2Te3) - Commercial Grade',
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
    });

    this.addMaterial({
      name: 'Bismuth Telluride (Bi2Te3) - High Performance',
      type: 'p-type',
      seebeckCoefficient: 220,
      electricalConductivity: 120000,
      thermalConductivity: 1.2,
      ztValue: 1.2,
      operatingTempRange: { min: -40, max: 250 },
      density: 7700,
      specificHeat: 154,
      thermalExpansion: 16e-6,
      cost: 280
    });

    // Lead Telluride variants
    this.addMaterial({
      name: 'Lead Telluride (PbTe) - Standard',
      type: 'n-type',
      seebeckCoefficient: -180,
      electricalConductivity: 50000,
      thermalConductivity: 2.2,
      ztValue: 1.4,
      operatingTempRange: { min: 200, max: 600 },
      density: 8200,
      specificHeat: 147,
      thermalExpansion: 19e-6,
      cost: 200
    });

    this.addMaterial({
      name: 'Lead Telluride (PbTe) - Doped',
      type: 'p-type',
      seebeckCoefficient: 190,
      electricalConductivity: 55000,
      thermalConductivity: 2.0,
      ztValue: 1.6,
      operatingTempRange: { min: 200, max: 650 },
      density: 8200,
      specificHeat: 147,
      thermalExpansion: 19e-6,
      cost: 350
    });

    // Silicon Germanium variants
    this.addMaterial({
      name: 'Silicon Germanium (SiGe) - Automotive Grade',
      type: 'n-type',
      seebeckCoefficient: -300,
      electricalConductivity: 20000,
      thermalConductivity: 4.0,
      ztValue: 0.9,
      operatingTempRange: { min: 400, max: 1000 },
      density: 3200,
      specificHeat: 712,
      thermalExpansion: 4.2e-6,
      cost: 300
    });

    // Skutterudites
    this.addMaterial({
      name: 'Cobalt Antimonide (CoSb3) - Filled Skutterudite',
      type: 'n-type',
      seebeckCoefficient: -250,
      electricalConductivity: 80000,
      thermalConductivity: 3.5,
      ztValue: 1.3,
      operatingTempRange: { min: 300, max: 700 },
      density: 7600,
      specificHeat: 230,
      thermalExpansion: 12e-6,
      cost: 400
    });

    this.addMaterial({
      name: 'Ytterbium-filled Skutterudite (YbFe4Sb12)',
      type: 'p-type',
      seebeckCoefficient: 180,
      electricalConductivity: 60000,
      thermalConductivity: 2.8,
      ztValue: 1.4,
      operatingTempRange: { min: 300, max: 750 },
      density: 7800,
      specificHeat: 240,
      thermalExpansion: 11e-6,
      cost: 600
    });

    // Half-Heusler alloys
    this.addMaterial({
      name: 'Half-Heusler (TiNiSn)',
      type: 'n-type',
      seebeckCoefficient: -200,
      electricalConductivity: 40000,
      thermalConductivity: 8.0,
      ztValue: 0.8,
      operatingTempRange: { min: 400, max: 800 },
      density: 6500,
      specificHeat: 350,
      thermalExpansion: 10e-6,
      cost: 250
    });

    // Oxide thermoelectrics
    this.addMaterial({
      name: 'Calcium Cobalt Oxide (Ca3Co4O9)',
      type: 'p-type',
      seebeckCoefficient: 150,
      electricalConductivity: 25000,
      thermalConductivity: 2.5,
      ztValue: 0.6,
      operatingTempRange: { min: 400, max: 900 },
      density: 4600,
      specificHeat: 450,
      thermalExpansion: 8e-6,
      cost: 180
    });

    // Advanced nanostructured materials
    this.addMaterial({
      name: 'Nanostructured Bi2Te3/Sb2Te3 Superlattice',
      type: 'n-type',
      seebeckCoefficient: -240,
      electricalConductivity: 150000,
      thermalConductivity: 0.8,
      ztValue: 2.4,
      operatingTempRange: { min: -40, max: 300 },
      density: 7500,
      specificHeat: 160,
      thermalExpansion: 14e-6,
      cost: 800
    });
  }

  /**
   * Add a material to the evaluation database
   */
  public addMaterial(material: ThermoelectricMaterial): void {
    this.materials.set(material.name, material);
  }

  /**
   * Evaluate a single material against the criteria
   */
  public evaluateMaterial(material: ThermoelectricMaterial): MaterialEvaluationResult {
    const efficiencyScore = this.calculateEfficiencyScore(material);
    const costScore = this.calculateCostEffectivenessScore(material);
    const durabilityScore = this.calculateDurabilityScore(material);
    const automotiveScore = this.calculateAutomotiveSuitabilityScore(material);

    const overallScore = (
      efficiencyScore * this.evaluationCriteria.weightFactors.efficiency +
      costScore * this.evaluationCriteria.weightFactors.cost +
      durabilityScore * this.evaluationCriteria.weightFactors.durability +
      automotiveScore * this.evaluationCriteria.weightFactors.automotive
    );

    return {
      material,
      scores: {
        efficiency: efficiencyScore,
        costEffectiveness: costScore,
        durability: durabilityScore,
        automotiveSuitability: automotiveScore,
        overall: overallScore
      },
      analysis: this.generateAnalysis(material, efficiencyScore, costScore, durabilityScore, automotiveScore),
      performanceMetrics: this.calculatePerformanceMetrics(material),
      automotiveCompatibility: this.assessAutomotiveCompatibility(material)
    };
  }

  /**
   * Compare multiple materials and provide comprehensive analysis
   */
  public compareMaterials(materialNames?: string[]): MaterialComparison {
    const materialsToEvaluate = materialNames 
      ? materialNames.map(name => this.materials.get(name)).filter(Boolean) as ThermoelectricMaterial[]
      : Array.from(this.materials.values());

    const evaluations = materialsToEvaluate.map(material => this.evaluateMaterial(material));

    const rankings = {
      byEfficiency: [...evaluations].sort((a, b) => b.scores.efficiency - a.scores.efficiency),
      byCost: [...evaluations].sort((a, b) => b.scores.costEffectiveness - a.scores.costEffectiveness),
      byDurability: [...evaluations].sort((a, b) => b.scores.durability - a.scores.durability),
      byOverall: [...evaluations].sort((a, b) => b.scores.overall - a.scores.overall)
    };

    return {
      materials: materialsToEvaluate,
      rankings,
      recommendations: {
        bestOverall: rankings.byOverall[0],
        mostCostEffective: rankings.byCost[0],
        mostDurable: rankings.byDurability[0],
        bestForHighTemp: this.findBestForTemperatureRange(evaluations, 400, 1000),
        bestForLowTemp: this.findBestForTemperatureRange(evaluations, -40, 300)
      },
      tradeoffAnalysis: {
        efficiencyVsCost: evaluations.map(e => ({
          material: e.material.name,
          efficiency: e.scores.efficiency,
          cost: 100 - (e.material.cost / this.evaluationCriteria.maxCost) * 100
        })),
        durabilityVsCost: evaluations.map(e => ({
          material: e.material.name,
          durability: e.scores.durability,
          cost: 100 - (e.material.cost / this.evaluationCriteria.maxCost) * 100
        })),
        performanceVsTemperature: evaluations.map(e => ({
          material: e.material.name,
          performance: e.scores.efficiency,
          tempRange: e.material.operatingTempRange.max - e.material.operatingTempRange.min
        }))
      }
    };
  }

  /**
   * Calculate efficiency score based on ZT value and Seebeck coefficient
   */
  private calculateEfficiencyScore(material: ThermoelectricMaterial): number {
    const ztScore = Math.min(material.ztValue / 2.0, 1.0) * 60; // Max 60 points for ZT
    const seebeckScore = Math.min(Math.abs(material.seebeckCoefficient) / 300, 1.0) * 25; // Max 25 points
    const conductivityScore = Math.min(material.electricalConductivity / 150000, 1.0) * 15; // Max 15 points
    
    return Math.min(ztScore + seebeckScore + conductivityScore, 100);
  }

  /**
   * Calculate cost-effectiveness score
   */
  private calculateCostEffectivenessScore(material: ThermoelectricMaterial): number {
    const costScore = Math.max(0, 100 - (material.cost / this.evaluationCriteria.maxCost) * 100);
    const performancePerCost = (material.ztValue * Math.abs(material.seebeckCoefficient)) / material.cost;
    const efficiencyScore = Math.min(performancePerCost * 10, 50);
    
    return Math.min(costScore * 0.6 + efficiencyScore * 0.4, 100);
  }

  /**
   * Calculate durability score based on temperature stability and material properties
   */
  private calculateDurabilityScore(material: ThermoelectricMaterial): number {
    const tempRangeScore = Math.min((material.operatingTempRange.max - material.operatingTempRange.min) / 800, 1.0) * 30;
    const thermalExpansionScore = Math.max(0, 30 - material.thermalExpansion * 1e6 * 2);
    const densityScore = Math.min(material.density / 8000, 1.0) * 20; // Higher density often means better durability
    const thermalConductivityScore = Math.min(material.thermalConductivity / 5.0, 1.0) * 20;
    
    return Math.min(tempRangeScore + thermalExpansionScore + densityScore + thermalConductivityScore, 100);
  }

  /**
   * Calculate automotive suitability score
   */
  private calculateAutomotiveSuitabilityScore(material: ThermoelectricMaterial): number {
    let score = 0;

    // Temperature range compatibility with automotive applications
    if (material.operatingTempRange.min <= -20 && material.operatingTempRange.max >= 150) {
      score += 25;
    } else if (material.operatingTempRange.min <= 0 && material.operatingTempRange.max >= 100) {
      score += 15;
    }

    // Vibration resistance (based on material properties)
    const vibrationResistance = this.assessVibrationResistance(material);
    score += vibrationResistance === 'excellent' ? 25 : vibrationResistance === 'good' ? 20 : 10;

    // Corrosion resistance
    const corrosionResistance = this.assessCorrosionResistance(material);
    score += corrosionResistance === 'excellent' ? 25 : corrosionResistance === 'good' ? 20 : 10;

    // Manufacturing compatibility
    const manufacturability = this.assessManufacturability(material);
    score += manufacturability === 'excellent' ? 25 : manufacturability === 'good' ? 20 : 10;

    return Math.min(score, 100);
  }

  /**
   * Generate detailed analysis for a material
   */
  private generateAnalysis(
    material: ThermoelectricMaterial,
    efficiencyScore: number,
    costScore: number,
    durabilityScore: number,
    automotiveScore: number
  ): { strengths: string[]; weaknesses: string[]; recommendations: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Analyze efficiency
    if (efficiencyScore > 80) {
      strengths.push(`Excellent thermoelectric efficiency (ZT = ${material.ztValue})`);
    } else if (efficiencyScore < 50) {
      weaknesses.push(`Low thermoelectric efficiency may limit power generation`);
      recommendations.push(`Consider material optimization or doping to improve ZT value`);
    }

    // Analyze cost
    if (costScore > 70) {
      strengths.push(`Cost-effective material at $${material.cost}/kg`);
    } else if (costScore < 40) {
      weaknesses.push(`High material cost may impact economic viability`);
      recommendations.push(`Evaluate alternative materials or consider volume pricing`);
    }

    // Analyze durability
    if (durabilityScore > 75) {
      strengths.push(`Excellent durability and temperature stability`);
    } else if (durabilityScore < 50) {
      weaknesses.push(`Limited durability may require frequent replacement`);
      recommendations.push(`Implement protective coatings or thermal management`);
    }

    // Analyze automotive suitability
    if (automotiveScore > 80) {
      strengths.push(`Well-suited for automotive applications`);
    } else if (automotiveScore < 60) {
      weaknesses.push(`May require additional protection for automotive use`);
      recommendations.push(`Consider encapsulation or vibration dampening`);
    }

    return { strengths, weaknesses, recommendations };
  }

  /**
   * Calculate performance metrics for a material
   */
  private calculatePerformanceMetrics(material: ThermoelectricMaterial): {
    powerDensity: number;
    efficiencyAtOperatingTemp: number;
    costPerWatt: number;
    expectedLifespan: number;
    thermalCycleRating: number;
  } {
    const avgTemp = (material.operatingTempRange.min + material.operatingTempRange.max) / 2 + 273.15;
    const powerDensity = (material.ztValue * Math.abs(material.seebeckCoefficient) * material.electricalConductivity) / material.density * 1e-6;
    const efficiency = material.ztValue * 0.1; // Simplified efficiency calculation
    const estimatedPower = powerDensity * 10; // Estimated power per kg
    const costPerWatt = material.cost / estimatedPower;
    
    // Estimate lifespan based on material properties
    const lifespanFactor = Math.min(material.operatingTempRange.max / 1000, 1.0);
    const expectedLifespan = 15 * (1 - lifespanFactor * 0.5); // 15 years baseline, reduced for high temp
    
    // Thermal cycle rating based on thermal expansion
    const thermalCycleRating = Math.max(1000, 50000 - material.thermalExpansion * 1e6 * 1000);

    return {
      powerDensity,
      efficiencyAtOperatingTemp: efficiency * 100,
      costPerWatt,
      expectedLifespan,
      thermalCycleRating
    };
  }

  /**
   * Assess automotive compatibility
   */
  private assessAutomotiveCompatibility(material: ThermoelectricMaterial): {
    temperatureCompatibility: boolean;
    vibrationTolerance: 'excellent' | 'good' | 'fair' | 'poor';
    corrosionResistance: 'excellent' | 'good' | 'fair' | 'poor';
    manufacturability: 'excellent' | 'good' | 'fair' | 'poor';
  } {
    return {
      temperatureCompatibility: material.operatingTempRange.min <= -20 && material.operatingTempRange.max >= 150,
      vibrationTolerance: this.assessVibrationResistance(material),
      corrosionResistance: this.assessCorrosionResistance(material),
      manufacturability: this.assessManufacturability(material)
    };
  }

  /**
   * Assess vibration resistance based on material properties
   */
  private assessVibrationResistance(material: ThermoelectricMaterial): 'excellent' | 'good' | 'fair' | 'poor' {
    // Higher density and lower thermal expansion generally indicate better vibration resistance
    const score = material.density / 1000 + (20e-6 - material.thermalExpansion) * 1e6;
    
    if (score > 15) return 'excellent';
    if (score > 10) return 'good';
    if (score > 5) return 'fair';
    return 'poor';
  }

  /**
   * Assess corrosion resistance
   */
  private assessCorrosionResistance(material: ThermoelectricMaterial): 'excellent' | 'good' | 'fair' | 'poor' {
    // Based on material type and composition
    if (material.name.includes('Oxide') || material.name.includes('SiGe')) {
      return 'excellent';
    } else if (material.name.includes('Skutterudite') || material.name.includes('Half-Heusler')) {
      return 'good';
    } else if (material.name.includes('Bi2Te3')) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  /**
   * Assess manufacturability
   */
  private assessManufacturability(material: ThermoelectricMaterial): 'excellent' | 'good' | 'fair' | 'poor' {
    // Based on material complexity and processing requirements
    if (material.name.includes('Commercial') || material.name.includes('Bi2Te3')) {
      return 'excellent';
    } else if (material.name.includes('PbTe') || material.name.includes('SiGe')) {
      return 'good';
    } else if (material.name.includes('Skutterudite') || material.name.includes('Half-Heusler')) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  /**
   * Find best material for specific temperature range
   */
  private findBestForTemperatureRange(
    evaluations: MaterialEvaluationResult[],
    minTemp: number,
    maxTemp: number
  ): MaterialEvaluationResult {
    const suitableMaterials = evaluations.filter(e => 
      e.material.operatingTempRange.min <= minTemp && 
      e.material.operatingTempRange.max >= maxTemp
    );

    return suitableMaterials.length > 0 
      ? suitableMaterials.reduce((best, current) => 
          current.scores.overall > best.scores.overall ? current : best
        )
      : evaluations[0];
  }

  /**
   * Get all available materials
   */
  public getAvailableMaterials(): ThermoelectricMaterial[] {
    return Array.from(this.materials.values());
  }

  /**
   * Update evaluation criteria
   */
  public updateCriteria(criteria: Partial<MaterialEvaluationCriteria>): void {
    this.evaluationCriteria = { ...this.evaluationCriteria, ...criteria };
  }

  /**
   * Generate material selection recommendations for specific application
   */
  public recommendMaterialsForApplication(application: {
    temperatureRange: { min: number; max: number };
    powerRequirement: number; // W
    costBudget: number; // $
    durabilityRequirement: 'standard' | 'high' | 'extreme';
    environmentalConditions: 'mild' | 'moderate' | 'harsh';
  }): MaterialEvaluationResult[] {
    const comparison = this.compareMaterials();
    
    return comparison.rankings.byOverall.filter(result => {
      const material = result.material;
      
      // Temperature compatibility
      if (material.operatingTempRange.min > application.temperatureRange.min ||
          material.operatingTempRange.max < application.temperatureRange.max) {
        return false;
      }
      
      // Cost constraint
      if (material.cost > application.costBudget) {
        return false;
      }
      
      // Durability requirement
      const minDurabilityScore = application.durabilityRequirement === 'extreme' ? 80 :
                                application.durabilityRequirement === 'high' ? 65 : 50;
      if (result.scores.durability < minDurabilityScore) {
        return false;
      }
      
      // Environmental conditions
      const minAutomotiveScore = application.environmentalConditions === 'harsh' ? 75 :
                                 application.environmentalConditions === 'moderate' ? 60 : 45;
      if (result.scores.automotiveSuitability < minAutomotiveScore) {
        return false;
      }
      
      return true;
    }).slice(0, 5); // Return top 5 recommendations
  }
}

/**
 * Factory function to create a material evaluator with automotive-specific criteria
 */
export function createAutomotiveMaterialEvaluator(): MaterialEvaluator {
  return new MaterialEvaluator({
    temperatureRange: { min: -40, max: 600 },
    targetZT: 1.2,
    maxCost: 400,
    automotiveRequirements: {
      vibrationResistance: true,
      thermalCycling: true,
      corrosionResistance: true,
      longTermStability: true
    },
    weightFactors: {
      efficiency: 0.30,
      cost: 0.30,
      durability: 0.25,
      automotive: 0.15
    }
  });
}

/**
 * Factory function to create a material evaluator optimized for high-performance applications
 */
export function createHighPerformanceMaterialEvaluator(): MaterialEvaluator {
  return new MaterialEvaluator({
    temperatureRange: { min: 0, max: 800 },
    targetZT: 1.8,
    maxCost: 800,
    automotiveRequirements: {
      vibrationResistance: true,
      thermalCycling: true,
      corrosionResistance: false,
      longTermStability: true
    },
    weightFactors: {
      efficiency: 0.50,
      cost: 0.15,
      durability: 0.20,
      automotive: 0.15
    }
  });
}

/**
 * Factory function to create a material evaluator optimized for cost-effectiveness
 */
export function createCostOptimizedMaterialEvaluator(): MaterialEvaluator {
  return new MaterialEvaluator({
    temperatureRange: { min: -20, max: 400 },
    targetZT: 0.8,
    maxCost: 200,
    automotiveRequirements: {
      vibrationResistance: true,
      thermalCycling: false,
      corrosionResistance: true,
      longTermStability: false
    },
    weightFactors: {
      efficiency: 0.20,
      cost: 0.50,
      durability: 0.20,
      automotive: 0.10
    }
  });
}