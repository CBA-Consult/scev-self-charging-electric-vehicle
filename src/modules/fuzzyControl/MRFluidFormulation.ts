/**
 * Magnetorheological (MR) Fluid Formulation System for Optimal Energy Recovery
 * 
 * This module implements various MR fluid formulations and evaluates their
 * effectiveness for energy recovery in regenerative braking and suspension systems.
 */

export interface MRFluidComposition {
  id: string;
  name: string;
  description: string;
  
  // Base fluid properties
  baseFluid: {
    type: 'silicone' | 'mineral_oil' | 'synthetic_oil' | 'water_glycol';
    viscosity: number;        // Pa·s at 25°C
    density: number;          // kg/m³
    thermalConductivity: number; // W/m·K
  };
  
  // Magnetic particles
  magneticParticles: {
    material: 'iron_carbonyl' | 'iron_oxide' | 'cobalt_ferrite' | 'nickel_zinc_ferrite';
    concentration: number;    // volume fraction (0-1)
    averageSize: number;      // μm
    saturationMagnetization: number; // A/m
  };
  
  // Additives
  additives: {
    surfactant: {
      type: string;
      concentration: number;  // weight %
    };
    antioxidant: {
      type: string;
      concentration: number;  // weight %
    };
    stabilizer: {
      type: string;
      concentration: number;  // weight %
    };
  };
  
  // Performance characteristics
  performance: {
    yieldStress: number;      // Pa (at saturation)
    dynamicRange: number;     // ratio of on-state to off-state viscosity
    responseTime: number;     // ms
    temperatureStability: number; // °C range
    sedimentationStability: number; // hours
  };
}

export interface EnergyRecoveryMetrics {
  formulation: string;
  testConditions: {
    magneticFieldStrength: number; // A/m
    temperature: number;           // °C
    shearRate: number;            // s⁻¹
    frequency: number;            // Hz (for oscillatory tests)
  };
  
  results: {
    energyRecoveryEfficiency: number;    // %
    powerDensity: number;               // W/kg
    dampingCoefficient: number;         // N·s/m
    viscosityRatio: number;             // on-state/off-state
    thermalStability: number;           // % efficiency retention at high temp
    durabilityIndex: number;            // cycles to 90% performance
  };
}

export interface OptimizationParameters {
  targetApplication: 'regenerative_braking' | 'suspension_damping' | 'hybrid_system';
  operatingConditions: {
    temperatureRange: [number, number];  // [min, max] °C
    magneticFieldRange: [number, number]; // [min, max] A/m
    shearRateRange: [number, number];    // [min, max] s⁻¹
    frequencyRange: [number, number];    // [min, max] Hz
  };
  
  performanceWeights: {
    energyRecovery: number;      // 0-1
    responseTime: number;        // 0-1
    durability: number;          // 0-1
    temperatureStability: number; // 0-1
    cost: number;                // 0-1
  };
}

export class MRFluidFormulation {
  private formulations: Map<string, MRFluidComposition>;
  private testResults: Map<string, EnergyRecoveryMetrics[]>;
  private optimizationHistory: Array<{
    timestamp: Date;
    parameters: OptimizationParameters;
    bestFormulation: string;
    score: number;
  }>;

  constructor() {
    this.formulations = new Map();
    this.testResults = new Map();
    this.optimizationHistory = [];
    this.initializeStandardFormulations();
  }

  /**
   * Initialize standard MR fluid formulations for comparison
   */
  private initializeStandardFormulations(): void {
    // High-performance iron carbonyl formulation
    const highPerformanceFormulation: MRFluidComposition = {
      id: 'HP-IC-001',
      name: 'High-Performance Iron Carbonyl',
      description: 'Optimized for maximum energy recovery efficiency',
      
      baseFluid: {
        type: 'silicone',
        viscosity: 0.1,
        density: 970,
        thermalConductivity: 0.16
      },
      
      magneticParticles: {
        material: 'iron_carbonyl',
        concentration: 0.35,
        averageSize: 3.5,
        saturationMagnetization: 1.7e6
      },
      
      additives: {
        surfactant: {
          type: 'oleic_acid',
          concentration: 2.0
        },
        antioxidant: {
          type: 'BHT',
          concentration: 0.5
        },
        stabilizer: {
          type: 'fumed_silica',
          concentration: 1.0
        }
      },
      
      performance: {
        yieldStress: 85000,
        dynamicRange: 150,
        responseTime: 8,
        temperatureStability: 120,
        sedimentationStability: 2000
      }
    };

    // Temperature-stable formulation
    const temperatureStableFormulation: MRFluidComposition = {
      id: 'TS-CF-002',
      name: 'Temperature-Stable Cobalt Ferrite',
      description: 'Optimized for high-temperature applications',
      
      baseFluid: {
        type: 'synthetic_oil',
        viscosity: 0.05,
        density: 850,
        thermalConductivity: 0.14
      },
      
      magneticParticles: {
        material: 'cobalt_ferrite',
        concentration: 0.30,
        averageSize: 2.8,
        saturationMagnetization: 8.0e5
      },
      
      additives: {
        surfactant: {
          type: 'stearic_acid',
          concentration: 1.5
        },
        antioxidant: {
          type: 'TBHP',
          concentration: 0.8
        },
        stabilizer: {
          type: 'organoclay',
          concentration: 1.5
        }
      },
      
      performance: {
        yieldStress: 65000,
        dynamicRange: 120,
        responseTime: 12,
        temperatureStability: 180,
        sedimentationStability: 1500
      }
    };

    // Fast-response formulation
    const fastResponseFormulation: MRFluidComposition = {
      id: 'FR-IO-003',
      name: 'Fast-Response Iron Oxide',
      description: 'Optimized for rapid response applications',
      
      baseFluid: {
        type: 'mineral_oil',
        viscosity: 0.02,
        density: 880,
        thermalConductivity: 0.13
      },
      
      magneticParticles: {
        material: 'iron_oxide',
        concentration: 0.25,
        averageSize: 1.5,
        saturationMagnetization: 9.2e5
      },
      
      additives: {
        surfactant: {
          type: 'lecithin',
          concentration: 1.0
        },
        antioxidant: {
          type: 'vitamin_E',
          concentration: 0.3
        },
        stabilizer: {
          type: 'xanthan_gum',
          concentration: 0.5
        }
      },
      
      performance: {
        yieldStress: 45000,
        dynamicRange: 80,
        responseTime: 3,
        temperatureStability: 100,
        sedimentationStability: 1000
      }
    };

    // Eco-friendly water-based formulation
    const ecoFriendlyFormulation: MRFluidComposition = {
      id: 'EF-NZF-004',
      name: 'Eco-Friendly Nickel-Zinc Ferrite',
      description: 'Environmentally friendly water-based formulation',
      
      baseFluid: {
        type: 'water_glycol',
        viscosity: 0.001,
        density: 1050,
        thermalConductivity: 0.5
      },
      
      magneticParticles: {
        material: 'nickel_zinc_ferrite',
        concentration: 0.20,
        averageSize: 2.0,
        saturationMagnetization: 4.5e5
      },
      
      additives: {
        surfactant: {
          type: 'sodium_oleate',
          concentration: 3.0
        },
        antioxidant: {
          type: 'ascorbic_acid',
          concentration: 1.0
        },
        stabilizer: {
          type: 'carrageenan',
          concentration: 2.0
        }
      },
      
      performance: {
        yieldStress: 25000,
        dynamicRange: 50,
        responseTime: 15,
        temperatureStability: 80,
        sedimentationStability: 500
      }
    };

    this.formulations.set(highPerformanceFormulation.id, highPerformanceFormulation);
    this.formulations.set(temperatureStableFormulation.id, temperatureStableFormulation);
    this.formulations.set(fastResponseFormulation.id, fastResponseFormulation);
    this.formulations.set(ecoFriendlyFormulation.id, ecoFriendlyFormulation);
  }

  /**
   * Add a new MR fluid formulation
   */
  public addFormulation(formulation: MRFluidComposition): void {
    this.validateFormulation(formulation);
    this.formulations.set(formulation.id, formulation);
  }

  /**
   * Validate formulation parameters
   */
  private validateFormulation(formulation: MRFluidComposition): void {
    if (formulation.magneticParticles.concentration < 0 || formulation.magneticParticles.concentration > 0.6) {
      throw new Error('Magnetic particle concentration must be between 0 and 0.6');
    }
    
    if (formulation.baseFluid.viscosity <= 0) {
      throw new Error('Base fluid viscosity must be positive');
    }
    
    if (formulation.performance.yieldStress < 0) {
      throw new Error('Yield stress must be non-negative');
    }
  }

  /**
   * Calculate energy recovery efficiency for a given formulation
   */
  public calculateEnergyRecoveryEfficiency(
    formulationId: string,
    magneticField: number,
    temperature: number,
    shearRate: number,
    frequency: number
  ): EnergyRecoveryMetrics {
    const formulation = this.formulations.get(formulationId);
    if (!formulation) {
      throw new Error(`Formulation ${formulationId} not found`);
    }

    // Calculate temperature effect on performance
    const tempFactor = this.calculateTemperatureFactor(temperature, formulation);
    
    // Calculate magnetic field effect
    const fieldFactor = this.calculateMagneticFieldFactor(magneticField, formulation);
    
    // Calculate shear rate effect
    const shearFactor = this.calculateShearRateFactor(shearRate, formulation);
    
    // Calculate frequency effect for oscillatory motion
    const frequencyFactor = this.calculateFrequencyFactor(frequency, formulation);
    
    // Base energy recovery efficiency
    const baseEfficiency = this.calculateBaseEfficiency(formulation);
    
    // Combined efficiency
    const energyRecoveryEfficiency = baseEfficiency * tempFactor * fieldFactor * shearFactor * frequencyFactor;
    
    // Calculate power density
    const powerDensity = this.calculatePowerDensity(formulation, magneticField, shearRate);
    
    // Calculate damping coefficient
    const dampingCoefficient = this.calculateDampingCoefficient(formulation, magneticField, temperature);
    
    // Calculate viscosity ratio
    const viscosityRatio = formulation.performance.dynamicRange * fieldFactor;
    
    // Calculate thermal stability
    const thermalStability = this.calculateThermalStability(formulation, temperature);
    
    // Calculate durability index
    const durabilityIndex = this.calculateDurabilityIndex(formulation, magneticField, temperature);

    const metrics: EnergyRecoveryMetrics = {
      formulation: formulationId,
      testConditions: {
        magneticFieldStrength: magneticField,
        temperature,
        shearRate,
        frequency
      },
      results: {
        energyRecoveryEfficiency: Math.min(100, Math.max(0, energyRecoveryEfficiency)),
        powerDensity,
        dampingCoefficient,
        viscosityRatio,
        thermalStability,
        durabilityIndex
      }
    };

    // Store test results
    if (!this.testResults.has(formulationId)) {
      this.testResults.set(formulationId, []);
    }
    this.testResults.get(formulationId)!.push(metrics);

    return metrics;
  }

  /**
   * Calculate temperature factor for performance adjustment
   */
  private calculateTemperatureFactor(temperature: number, formulation: MRFluidComposition): number {
    const optimalTemp = 25; // °C
    const maxTemp = formulation.performance.temperatureStability;
    
    if (temperature <= optimalTemp) {
      return 1.0;
    } else if (temperature <= maxTemp) {
      // Linear degradation from optimal to maximum temperature
      return 1.0 - (temperature - optimalTemp) / (maxTemp - optimalTemp) * 0.3;
    } else {
      // Severe degradation beyond maximum temperature
      return 0.7 * Math.exp(-(temperature - maxTemp) / 50);
    }
  }

  /**
   * Calculate magnetic field factor for performance adjustment
   */
  private calculateMagneticFieldFactor(magneticField: number, formulation: MRFluidComposition): number {
    const saturationField = formulation.magneticParticles.saturationMagnetization * 0.001; // Convert to kA/m
    
    if (magneticField <= 0) {
      return 0.1; // Minimum performance without field
    } else if (magneticField >= saturationField) {
      return 1.0; // Maximum performance at saturation
    } else {
      // Sigmoid curve for field response
      return 0.1 + 0.9 * (1 - Math.exp(-magneticField / (saturationField * 0.3)));
    }
  }

  /**
   * Calculate shear rate factor for performance adjustment
   */
  private calculateShearRateFactor(shearRate: number, formulation: MRFluidComposition): number {
    const optimalShearRate = 100; // s⁻¹
    
    if (shearRate <= 0) {
      return 0.5;
    } else if (shearRate <= optimalShearRate) {
      return 0.5 + 0.5 * (shearRate / optimalShearRate);
    } else {
      // Shear thinning effect at high rates
      return 1.0 * Math.pow(optimalShearRate / shearRate, 0.2);
    }
  }

  /**
   * Calculate frequency factor for oscillatory motion
   */
  private calculateFrequencyFactor(frequency: number, formulation: MRFluidComposition): number {
    const responseTime = formulation.performance.responseTime / 1000; // Convert to seconds
    const criticalFreq = 1 / (2 * Math.PI * responseTime);
    
    if (frequency <= criticalFreq) {
      return 1.0;
    } else {
      // Performance degradation at high frequencies
      return criticalFreq / frequency;
    }
  }

  /**
   * Calculate base energy recovery efficiency
   */
  private calculateBaseEfficiency(formulation: MRFluidComposition): number {
    const particleConcentration = formulation.magneticParticles.concentration;
    const yieldStress = formulation.performance.yieldStress;
    const dynamicRange = formulation.performance.dynamicRange;
    
    // Empirical formula based on formulation properties
    const concentrationFactor = Math.min(1.0, particleConcentration / 0.4);
    const yieldStressFactor = Math.min(1.0, yieldStress / 100000);
    const dynamicRangeFactor = Math.min(1.0, dynamicRange / 200);
    
    return 60 + 35 * concentrationFactor * yieldStressFactor * dynamicRangeFactor;
  }

  /**
   * Calculate power density
   */
  private calculatePowerDensity(
    formulation: MRFluidComposition,
    magneticField: number,
    shearRate: number
  ): number {
    const yieldStress = formulation.performance.yieldStress;
    const density = formulation.baseFluid.density;
    const fieldFactor = this.calculateMagneticFieldFactor(magneticField, formulation);
    
    // Power density = (yield stress × shear rate) / density
    return (yieldStress * fieldFactor * shearRate) / density;
  }

  /**
   * Calculate damping coefficient
   */
  private calculateDampingCoefficient(
    formulation: MRFluidComposition,
    magneticField: number,
    temperature: number
  ): number {
    const baseViscosity = formulation.baseFluid.viscosity;
    const dynamicRange = formulation.performance.dynamicRange;
    const fieldFactor = this.calculateMagneticFieldFactor(magneticField, formulation);
    const tempFactor = this.calculateTemperatureFactor(temperature, formulation);
    
    return baseViscosity * (1 + (dynamicRange - 1) * fieldFactor) * tempFactor;
  }

  /**
   * Calculate thermal stability
   */
  private calculateThermalStability(formulation: MRFluidComposition, temperature: number): number {
    const maxTemp = formulation.performance.temperatureStability;
    
    if (temperature <= 25) {
      return 100;
    } else if (temperature <= maxTemp) {
      return 100 - (temperature - 25) / (maxTemp - 25) * 20;
    } else {
      return Math.max(0, 80 - (temperature - maxTemp) * 2);
    }
  }

  /**
   * Calculate durability index
   */
  private calculateDurabilityIndex(
    formulation: MRFluidComposition,
    magneticField: number,
    temperature: number
  ): number {
    const baseDurability = formulation.performance.sedimentationStability;
    const tempStress = Math.max(0, temperature - 25) / 100;
    const fieldStress = magneticField / 1000000; // Normalize to MA/m
    
    const stressFactor = 1 - (tempStress + fieldStress) * 0.3;
    
    return baseDurability * Math.max(0.1, stressFactor);
  }

  /**
   * Optimize formulation for specific application
   */
  public optimizeFormulation(parameters: OptimizationParameters): {
    bestFormulation: string;
    score: number;
    recommendations: string[];
  } {
    let bestScore = 0;
    let bestFormulation = '';
    const recommendations: string[] = [];

    for (const [id, formulation] of this.formulations) {
      const score = this.calculateOptimizationScore(formulation, parameters);
      
      if (score > bestScore) {
        bestScore = score;
        bestFormulation = id;
      }
    }

    // Generate recommendations
    if (parameters.performanceWeights.energyRecovery > 0.7) {
      recommendations.push('Consider high particle concentration formulations for maximum energy recovery');
    }
    
    if (parameters.performanceWeights.responseTime > 0.7) {
      recommendations.push('Use smaller particle sizes and lower viscosity base fluids for faster response');
    }
    
    if (parameters.operatingConditions.temperatureRange[1] > 100) {
      recommendations.push('Select temperature-stable base fluids and additives for high-temperature operation');
    }

    // Store optimization history
    this.optimizationHistory.push({
      timestamp: new Date(),
      parameters,
      bestFormulation,
      score: bestScore
    });

    return {
      bestFormulation,
      score: bestScore,
      recommendations
    };
  }

  /**
   * Calculate optimization score for a formulation
   */
  private calculateOptimizationScore(
    formulation: MRFluidComposition,
    parameters: OptimizationParameters
  ): number {
    const weights = parameters.performanceWeights;
    
    // Normalize performance metrics (0-1 scale)
    const energyScore = Math.min(1, this.calculateBaseEfficiency(formulation) / 100);
    const responseScore = Math.max(0, 1 - formulation.performance.responseTime / 50);
    const durabilityScore = Math.min(1, formulation.performance.sedimentationStability / 3000);
    const tempScore = Math.min(1, formulation.performance.temperatureStability / 200);
    
    // Simple cost model based on particle concentration and material
    const costScore = 1 - formulation.magneticParticles.concentration * 0.8;
    
    return (
      weights.energyRecovery * energyScore +
      weights.responseTime * responseScore +
      weights.durability * durabilityScore +
      weights.temperatureStability * tempScore +
      weights.cost * costScore
    );
  }

  /**
   * Get all formulations
   */
  public getFormulations(): Map<string, MRFluidComposition> {
    return new Map(this.formulations);
  }

  /**
   * Get test results for a formulation
   */
  public getTestResults(formulationId: string): EnergyRecoveryMetrics[] {
    return this.testResults.get(formulationId) || [];
  }

  /**
   * Get optimization history
   */
  public getOptimizationHistory(): Array<{
    timestamp: Date;
    parameters: OptimizationParameters;
    bestFormulation: string;
    score: number;
  }> {
    return [...this.optimizationHistory];
  }

  /**
   * Generate comprehensive performance report
   */
  public generatePerformanceReport(formulationId: string): {
    formulation: MRFluidComposition;
    testResults: EnergyRecoveryMetrics[];
    averagePerformance: {
      energyRecoveryEfficiency: number;
      powerDensity: number;
      responseTime: number;
      temperatureStability: number;
    };
    recommendations: string[];
  } {
    const formulation = this.formulations.get(formulationId);
    if (!formulation) {
      throw new Error(`Formulation ${formulationId} not found`);
    }

    const testResults = this.getTestResults(formulationId);
    
    // Calculate average performance
    const avgPerformance = testResults.reduce(
      (acc, result) => ({
        energyRecoveryEfficiency: acc.energyRecoveryEfficiency + result.results.energyRecoveryEfficiency,
        powerDensity: acc.powerDensity + result.results.powerDensity,
        responseTime: acc.responseTime + formulation.performance.responseTime,
        temperatureStability: acc.temperatureStability + result.results.thermalStability
      }),
      { energyRecoveryEfficiency: 0, powerDensity: 0, responseTime: 0, temperatureStability: 0 }
    );

    if (testResults.length > 0) {
      avgPerformance.energyRecoveryEfficiency /= testResults.length;
      avgPerformance.powerDensity /= testResults.length;
      avgPerformance.responseTime /= testResults.length;
      avgPerformance.temperatureStability /= testResults.length;
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (avgPerformance.energyRecoveryEfficiency < 70) {
      recommendations.push('Consider increasing particle concentration or using higher saturation magnetization materials');
    }
    
    if (formulation.performance.responseTime > 10) {
      recommendations.push('Reduce particle size or base fluid viscosity to improve response time');
    }
    
    if (avgPerformance.temperatureStability < 80) {
      recommendations.push('Add thermal stabilizers or use more temperature-resistant base fluids');
    }

    return {
      formulation,
      testResults,
      averagePerformance: avgPerformance,
      recommendations
    };
  }
}