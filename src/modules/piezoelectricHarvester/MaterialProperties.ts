/**
 * Material Properties for Piezoelectric Materials
 * 
 * This module defines the material properties and constants for various
 * piezoelectric materials used in energy harvesting applications.
 */

export interface MaterialConstants {
  // Piezoelectric constants
  d31: number;                    // C/N - piezoelectric charge constant
  d33: number;                    // C/N - piezoelectric charge constant
  g31: number;                    // V⋅m/N - piezoelectric voltage constant
  g33: number;                    // V⋅m/N - piezoelectric voltage constant
  
  // Elastic constants
  elasticModulus: number;         // Pa - Young's modulus
  poissonRatio: number;           // - Poisson's ratio
  shearModulus: number;           // Pa - shear modulus
  
  // Dielectric constants
  permittivity: number;           // F/m - dielectric permittivity
  dielectricConstant: number;     // - relative dielectric constant
  
  // Mechanical properties
  density: number;                // kg/m³ - material density
  yieldStrength: number;          // Pa - yield strength
  ultimateStrength: number;       // Pa - ultimate tensile strength
  fatigueStrength?: number;       // Pa - fatigue strength (optional)
  maxStrain: number;              // - maximum allowable strain
  
  // Coupling factors
  couplingFactor: number;         // - electromechanical coupling factor k31
  mechanicalQuality: number;      // - mechanical quality factor
  
  // Temperature coefficients
  temperatureCoefficients: TemperatureCoefficients;
}

export interface TemperatureCoefficients {
  d31: number;                    // 1/°C - temperature coefficient of d31
  elasticModulus: number;         // 1/°C - temperature coefficient of elastic modulus
  permittivity: number;           // 1/°C - temperature coefficient of permittivity
  curieTemperature: number;       // °C - Curie temperature
  operatingRange: {
    min: number;                  // °C - minimum operating temperature
    max: number;                  // °C - maximum operating temperature
  };
}

export interface PiezoelectricMaterial {
  name: string;
  type: 'ceramic' | 'polymer' | 'crystal' | 'composite';
  constants: MaterialConstants;
  applications: string[];
  advantages: string[];
  limitations: string[];
  cost: 'low' | 'medium' | 'high';
  availability: 'common' | 'specialized' | 'research';
}

export class MaterialProperties {
  private materials: Map<string, PiezoelectricMaterial> = new Map();

  constructor() {
    this.initializeMaterials();
  }

  /**
   * Get material properties by name
   */
  public getMaterial(name: string): PiezoelectricMaterial {
    const material = this.materials.get(name.toLowerCase());
    if (!material) {
      throw new Error(`Material '${name}' not found. Available materials: ${this.getAvailableMaterials().join(', ')}`);
    }
    return { ...material }; // Return copy to prevent modification
  }

  /**
   * Get list of available materials
   */
  public getAvailableMaterials(): string[] {
    return Array.from(this.materials.keys());
  }

  /**
   * Get materials by type
   */
  public getMaterialsByType(type: PiezoelectricMaterial['type']): PiezoelectricMaterial[] {
    return Array.from(this.materials.values()).filter(material => material.type === type);
  }

  /**
   * Get materials suitable for specific applications
   */
  public getMaterialsForApplication(application: string): PiezoelectricMaterial[] {
    return Array.from(this.materials.values()).filter(material => 
      material.applications.some(app => app.toLowerCase().includes(application.toLowerCase()))
    );
  }

  /**
   * Compare materials based on specific properties
   */
  public compareMaterials(
    materialNames: string[],
    criteria: Array<keyof MaterialConstants>
  ): Array<{
    material: string;
    properties: Record<string, number>;
    score: number;
  }> {
    const comparisons = materialNames.map(name => {
      const material = this.getMaterial(name);
      const properties: Record<string, number> = {};
      let score = 0;

      criteria.forEach(criterion => {
        const value = material.constants[criterion] as number;
        properties[criterion] = value;
        
        // Normalize and weight the score (simplified scoring)
        switch (criterion) {
          case 'd31':
          case 'd33':
            score += Math.abs(value) * 1e12; // Higher is better for piezoelectric constants
            break;
          case 'couplingFactor':
            score += value * 100; // Higher is better
            break;
          case 'density':
            score += (1 / value) * 1000; // Lower is better
            break;
          default:
            score += value / 1e6; // Generic normalization
        }
      });

      return { material: name, properties, score };
    });

    return comparisons.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate temperature-adjusted properties
   */
  public getTemperatureAdjustedProperties(
    materialName: string,
    temperature: number
  ): MaterialConstants {
    const material = this.getMaterial(materialName);
    const baseConstants = material.constants;
    const tempCoeffs = baseConstants.temperatureCoefficients;
    const refTemp = 25; // Reference temperature in °C
    const deltaT = temperature - refTemp;

    // Check if temperature is within operating range
    if (temperature < tempCoeffs.operatingRange.min || temperature > tempCoeffs.operatingRange.max) {
      console.warn(`Temperature ${temperature}°C is outside operating range for ${materialName}`);
    }

    // Check Curie temperature
    if (temperature > tempCoeffs.curieTemperature) {
      console.warn(`Temperature ${temperature}°C exceeds Curie temperature for ${materialName}. Material may lose piezoelectric properties.`);
    }

    // Calculate adjusted properties
    const adjustedConstants: MaterialConstants = {
      ...baseConstants,
      d31: baseConstants.d31 * (1 + tempCoeffs.d31 * deltaT),
      d33: baseConstants.d33 * (1 + tempCoeffs.d31 * deltaT), // Assuming similar coefficient
      elasticModulus: baseConstants.elasticModulus * (1 + tempCoeffs.elasticModulus * deltaT),
      permittivity: baseConstants.permittivity * (1 + tempCoeffs.permittivity * deltaT),
      temperatureCoefficients: tempCoeffs,
    };

    return adjustedConstants;
  }

  /**
   * Estimate material cost per unit volume
   */
  public estimateMaterialCost(materialName: string, volume: number): {
    costCategory: string;
    estimatedCostRange: { min: number; max: number };
    currency: string;
  } {
    const material = this.getMaterial(materialName);
    
    // Cost estimates in USD per cm³
    const costRanges = {
      low: { min: 0.1, max: 1.0 },
      medium: { min: 1.0, max: 10.0 },
      high: { min: 10.0, max: 100.0 },
    };

    const volumeCm3 = volume * 1e6; // Convert m³ to cm³
    const range = costRanges[material.cost];

    return {
      costCategory: material.cost,
      estimatedCostRange: {
        min: range.min * volumeCm3,
        max: range.max * volumeCm3,
      },
      currency: 'USD',
    };
  }

  /**
   * Initialize material database
   */
  private initializeMaterials(): void {
    // PZT-5H (Lead Zirconate Titanate)
    this.materials.set('pzt-5h', {
      name: 'PZT-5H',
      type: 'ceramic',
      constants: {
        d31: -274e-12,              // C/N
        d33: 593e-12,               // C/N
        g31: -9.5e-3,               // V⋅m/N
        g33: 19.7e-3,               // V⋅m/N
        elasticModulus: 60.6e9,     // Pa
        poissonRatio: 0.31,
        shearModulus: 23.2e9,       // Pa
        permittivity: 3400 * 8.854e-12, // F/m
        dielectricConstant: 3400,
        density: 7500,              // kg/m³
        yieldStrength: 75e6,        // Pa
        ultimateStrength: 110e6,    // Pa
        fatigueStrength: 35e6,      // Pa
        maxStrain: 0.001,           // 0.1%
        couplingFactor: 0.75,       // k31
        mechanicalQuality: 65,
        temperatureCoefficients: {
          d31: -0.0004,             // 1/°C
          elasticModulus: -0.0003,  // 1/°C
          permittivity: 0.002,      // 1/°C
          curieTemperature: 193,    // °C
          operatingRange: { min: -50, max: 150 },
        },
      },
      applications: ['energy harvesting', 'sensors', 'actuators', 'ultrasonic transducers'],
      advantages: ['high piezoelectric coefficients', 'good coupling factor', 'mature technology'],
      limitations: ['contains lead', 'brittle', 'temperature sensitive'],
      cost: 'medium',
      availability: 'common',
    });

    // PZT-5A (Lead Zirconate Titanate - soft)
    this.materials.set('pzt-5a', {
      name: 'PZT-5A',
      type: 'ceramic',
      constants: {
        d31: -171e-12,
        d33: 374e-12,
        g31: -11.6e-3,
        g33: 24.8e-3,
        elasticModulus: 66e9,
        poissonRatio: 0.35,
        shearModulus: 24.4e9,
        permittivity: 1700 * 8.854e-12,
        dielectricConstant: 1700,
        density: 7750,
        yieldStrength: 80e6,
        ultimateStrength: 120e6,
        fatigueStrength: 40e6,
        maxStrain: 0.0008,
        couplingFactor: 0.71,
        mechanicalQuality: 75,
        temperatureCoefficients: {
          d31: -0.0003,
          elasticModulus: -0.0002,
          permittivity: 0.0015,
          curieTemperature: 365,
          operatingRange: { min: -50, max: 200 },
        },
      },
      applications: ['energy harvesting', 'low-frequency applications', 'sensors'],
      advantages: ['high Curie temperature', 'good mechanical properties', 'stable'],
      limitations: ['contains lead', 'lower piezoelectric coefficients than PZT-5H'],
      cost: 'medium',
      availability: 'common',
    });

    // PVDF (Polyvinylidene Fluoride)
    this.materials.set('pvdf', {
      name: 'PVDF',
      type: 'polymer',
      constants: {
        d31: 23e-12,
        d33: -33e-12,
        g31: 216e-3,
        g33: -330e-3,
        elasticModulus: 2e9,
        poissonRatio: 0.34,
        shearModulus: 0.75e9,
        permittivity: 12 * 8.854e-12,
        dielectricConstant: 12,
        density: 1780,
        yieldStrength: 50e6,
        ultimateStrength: 80e6,
        maxStrain: 0.05,            // 5% - much higher than ceramics
        couplingFactor: 0.12,
        mechanicalQuality: 10,
        temperatureCoefficients: {
          d31: -0.001,
          elasticModulus: -0.002,
          permittivity: 0.001,
          curieTemperature: 100,    // Melting point
          operatingRange: { min: -40, max: 80 },
        },
      },
      applications: ['flexible energy harvesting', 'wearable devices', 'large area applications'],
      advantages: ['flexible', 'lightweight', 'lead-free', 'high voltage output'],
      limitations: ['low coupling factor', 'low power density', 'temperature sensitive'],
      cost: 'low',
      availability: 'common',
    });

    // BaTiO3 (Barium Titanate)
    this.materials.set('batio3', {
      name: 'BaTiO3',
      type: 'ceramic',
      constants: {
        d31: -78e-12,
        d33: 191e-12,
        g31: -5.1e-3,
        g33: 12.6e-3,
        elasticModulus: 67e9,
        poissonRatio: 0.32,
        shearModulus: 25.4e9,
        permittivity: 1700 * 8.854e-12,
        dielectricConstant: 1700,
        density: 6020,
        yieldStrength: 60e6,
        ultimateStrength: 90e6,
        fatigueStrength: 30e6,
        maxStrain: 0.0006,
        couplingFactor: 0.38,
        mechanicalQuality: 80,
        temperatureCoefficients: {
          d31: -0.0008,
          elasticModulus: -0.0001,
          permittivity: 0.003,
          curieTemperature: 120,
          operatingRange: { min: -50, max: 100 },
        },
      },
      applications: ['lead-free energy harvesting', 'capacitors', 'sensors'],
      advantages: ['lead-free', 'environmentally friendly', 'good mechanical properties'],
      limitations: ['lower piezoelectric coefficients', 'low Curie temperature'],
      cost: 'medium',
      availability: 'common',
    });

    // Quartz (SiO2)
    this.materials.set('quartz', {
      name: 'Quartz',
      type: 'crystal',
      constants: {
        d31: -2.3e-12,
        d33: 0,                     // No d33 for quartz
        g31: -50e-3,
        g33: 0,
        elasticModulus: 72e9,
        poissonRatio: 0.17,
        shearModulus: 31e9,
        permittivity: 4.5 * 8.854e-12,
        dielectricConstant: 4.5,
        density: 2650,
        yieldStrength: 50e6,
        ultimateStrength: 1100e6,   // Very high for crystal
        maxStrain: 0.0001,
        couplingFactor: 0.1,
        mechanicalQuality: 10000,   // Very high Q
        temperatureCoefficients: {
          d31: -0.0001,
          elasticModulus: 0.00005,
          permittivity: 0.0001,
          curieTemperature: 573,    // α-β transition
          operatingRange: { min: -50, max: 300 },
        },
      },
      applications: ['precision frequency control', 'high-Q resonators', 'stable oscillators'],
      advantages: ['very stable', 'high Q factor', 'wide temperature range', 'lead-free'],
      limitations: ['very low piezoelectric coefficients', 'expensive', 'difficult to process'],
      cost: 'high',
      availability: 'specialized',
    });

    // PMN-PT (Lead Magnesium Niobate-Lead Titanate)
    this.materials.set('pmn-pt', {
      name: 'PMN-PT',
      type: 'crystal',
      constants: {
        d31: -1330e-12,
        d33: 2820e-12,
        g31: -40e-3,
        g33: 85e-3,
        elasticModulus: 45e9,
        poissonRatio: 0.33,
        shearModulus: 17e9,
        permittivity: 8200 * 8.854e-12,
        dielectricConstant: 8200,
        density: 8100,
        yieldStrength: 40e6,
        ultimateStrength: 60e6,
        maxStrain: 0.002,
        couplingFactor: 0.92,       // Very high coupling
        mechanicalQuality: 100,
        temperatureCoefficients: {
          d31: -0.0006,
          elasticModulus: -0.0004,
          permittivity: 0.004,
          curieTemperature: 130,
          operatingRange: { min: -20, max: 100 },
        },
      },
      applications: ['high-performance energy harvesting', 'medical ultrasound', 'sonar'],
      advantages: ['highest piezoelectric coefficients', 'excellent coupling factor'],
      limitations: ['contains lead', 'expensive', 'limited temperature range', 'fragile'],
      cost: 'high',
      availability: 'specialized',
    });

    // AlN (Aluminum Nitride)
    this.materials.set('aln', {
      name: 'AlN',
      type: 'ceramic',
      constants: {
        d31: -2.1e-12,
        d33: 5.1e-12,
        g31: -3.7e-3,
        g33: 9.0e-3,
        elasticModulus: 330e9,
        poissonRatio: 0.24,
        shearModulus: 133e9,
        permittivity: 9 * 8.854e-12,
        dielectricConstant: 9,
        density: 3260,
        yieldStrength: 300e6,
        ultimateStrength: 400e6,
        maxStrain: 0.0003,
        couplingFactor: 0.25,
        mechanicalQuality: 3000,
        temperatureCoefficients: {
          d31: -0.0002,
          elasticModulus: -0.00005,
          permittivity: 0.0002,
          curieTemperature: 2200,   // Decomposition temperature
          operatingRange: { min: -200, max: 800 },
        },
      },
      applications: ['high-temperature energy harvesting', 'MEMS devices', 'RF applications'],
      advantages: ['lead-free', 'high temperature stability', 'good thermal conductivity'],
      limitations: ['low piezoelectric coefficients', 'difficult to process'],
      cost: 'high',
      availability: 'specialized',
    });

    // ZnO (Zinc Oxide)
    this.materials.set('zno', {
      name: 'ZnO',
      type: 'ceramic',
      constants: {
        d31: -5.1e-12,
        d33: 12.4e-12,
        g31: -9.9e-3,
        g33: 24.2e-3,
        elasticModulus: 111e9,
        poissonRatio: 0.36,
        shearModulus: 40.8e9,
        permittivity: 8.5 * 8.854e-12,
        dielectricConstant: 8.5,
        density: 5606,
        yieldStrength: 45e6,
        ultimateStrength: 70e6,
        maxStrain: 0.0004,
        couplingFactor: 0.28,
        mechanicalQuality: 500,
        temperatureCoefficients: {
          d31: -0.0003,
          elasticModulus: -0.0001,
          permittivity: 0.0003,
          curieTemperature: 1975,   // Melting point
          operatingRange: { min: -50, max: 300 },
        },
      },
      applications: ['nanogenerators', 'transparent electronics', 'UV sensors'],
      advantages: ['lead-free', 'biocompatible', 'transparent', 'low cost'],
      limitations: ['low piezoelectric coefficients', 'moisture sensitive'],
      cost: 'low',
      availability: 'common',
    });
  }

  /**
   * Add custom material to the database
   */
  public addCustomMaterial(material: PiezoelectricMaterial): void {
    this.materials.set(material.name.toLowerCase(), material);
  }

  /**
   * Get material recommendations based on application requirements
   */
  public getRecommendations(requirements: {
    application: string;
    temperatureRange?: { min: number; max: number };
    flexibilityRequired?: boolean;
    leadFree?: boolean;
    costConstraint?: 'low' | 'medium' | 'high';
    powerDensityPriority?: boolean;
  }): PiezoelectricMaterial[] {
    let candidates = Array.from(this.materials.values());

    // Filter by application
    if (requirements.application) {
      candidates = candidates.filter(material =>
        material.applications.some(app =>
          app.toLowerCase().includes(requirements.application.toLowerCase())
        )
      );
    }

    // Filter by temperature range
    if (requirements.temperatureRange) {
      candidates = candidates.filter(material => {
        const tempRange = material.constants.temperatureCoefficients.operatingRange;
        return tempRange.min <= requirements.temperatureRange!.min &&
               tempRange.max >= requirements.temperatureRange!.max;
      });
    }

    // Filter by flexibility requirement
    if (requirements.flexibilityRequired) {
      candidates = candidates.filter(material => material.type === 'polymer');
    }

    // Filter by lead-free requirement
    if (requirements.leadFree) {
      candidates = candidates.filter(material => !material.name.toLowerCase().includes('pzt') && !material.name.toLowerCase().includes('pmn'));
    }

    // Filter by cost constraint
    if (requirements.costConstraint) {
      const costOrder = { low: 1, medium: 2, high: 3 };
      candidates = candidates.filter(material =>
        costOrder[material.cost] <= costOrder[requirements.costConstraint!]
      );
    }

    // Sort by power density if prioritized
    if (requirements.powerDensityPriority) {
      candidates.sort((a, b) => {
        const powerA = Math.abs(a.constants.d31) * a.constants.couplingFactor;
        const powerB = Math.abs(b.constants.d31) * b.constants.couplingFactor;
        return powerB - powerA;
      });
    }

    return candidates;
  }
}