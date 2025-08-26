/**
 * Piezoelectric Materials Module
 * 
 * This module implements comprehensive modeling of both classical and non-classical
 * piezoelectric materials for energy harvesting optimization. It includes material
 * properties, constitutive equations, and performance characteristics.
 */

export interface MaterialProperties {
  // Elastic properties
  elasticModulus: number;           // Pa (Young's modulus)
  poissonRatio: number;             // dimensionless
  density: number;                  // kg/m³
  
  // Piezoelectric properties
  piezoelectricConstants: {
    d31: number;                    // m/V (transverse)
    d33: number;                    // m/V (longitudinal)
    d15: number;                    // m/V (shear)
  };
  
  // Dielectric properties
  dielectricConstants: {
    epsilon11: number;              // F/m (relative permittivity)
    epsilon33: number;              // F/m (relative permittivity)
  };
  
  // Coupling factors
  electromechanicalCoupling: {
    k31: number;                    // dimensionless (transverse)
    k33: number;                    // dimensionless (longitudinal)
    k15: number;                    // dimensionless (shear)
  };
  
  // Quality factors
  mechanicalQuality: number;        // dimensionless
  electricalQuality: number;        // dimensionless
  
  // Operating limits
  maxStrain: number;                // dimensionless
  maxElectricField: number;         // V/m
  operatingTemperatureRange: {
    min: number;                    // °C
    max: number;                    // °C
  };
}

export interface NonClassicalProperties extends MaterialProperties {
  // Advanced material properties
  nonlinearCoefficients: {
    alpha: number;                  // Higher-order piezoelectric coefficient
    beta: number;                   // Electrostriction coefficient
    gamma: number;                  // Flexoelectric coefficient
  };
  
  // Frequency-dependent properties
  frequencyResponse: {
    resonantFrequency: number;      // Hz
    antiresonantFrequency: number;  // Hz
    bandwidthFactor: number;        // dimensionless
  };
  
  // Microstructural properties
  grainSize: number;                // μm
  porosity: number;                 // dimensionless (0-1)
  textureCoefficient: number;       // dimensionless
  
  // Smart material features
  selfSensingCapability: boolean;
  adaptiveStiffness: boolean;
  temperatureCompensation: boolean;
}

/**
 * Classical Piezoelectric Materials
 * 
 * Implements traditional piezoelectric materials like PZT, BaTiO3, etc.
 */
export class ClassicalPiezoelectricMaterial {
  private properties: MaterialProperties;
  private materialType: string;
  private temperatureCoefficients: Map<string, number>;

  constructor(materialType: string, properties: MaterialProperties) {
    this.materialType = materialType;
    this.properties = properties;
    this.temperatureCoefficients = new Map();
    this.initializeTemperatureCoefficients();
  }

  /**
   * Initialize temperature coefficients for material properties
   */
  private initializeTemperatureCoefficients(): void {
    // Temperature coefficients for common properties (per °C)
    this.temperatureCoefficients.set('d33', -0.0003);  // Typical for PZT
    this.temperatureCoefficients.set('k33', -0.0002);
    this.temperatureCoefficients.set('epsilon33', 0.002);
    this.temperatureCoefficients.set('elasticModulus', -0.0001);
  }

  /**
   * Calculate temperature-compensated material properties
   */
  public getTemperatureCompensatedProperties(temperature: number): MaterialProperties {
    const referenceTemp = 25; // °C
    const deltaT = temperature - referenceTemp;
    
    const compensatedProperties: MaterialProperties = JSON.parse(JSON.stringify(this.properties));
    
    // Apply temperature compensation
    compensatedProperties.piezoelectricConstants.d33 *= 
      (1 + this.temperatureCoefficients.get('d33')! * deltaT);
    
    compensatedProperties.electromechanicalCoupling.k33 *= 
      (1 + this.temperatureCoefficients.get('k33')! * deltaT);
    
    compensatedProperties.dielectricConstants.epsilon33 *= 
      (1 + this.temperatureCoefficients.get('epsilon33')! * deltaT);
    
    compensatedProperties.elasticModulus *= 
      (1 + this.temperatureCoefficients.get('elasticModulus')! * deltaT);
    
    return compensatedProperties;
  }

  /**
   * Calculate piezoelectric constitutive equations
   */
  public calculateConstitutiveResponse(
    stress: number[], 
    electricField: number[], 
    temperature: number = 25
  ): { strain: number[]; electricDisplacement: number[] } {
    const props = this.getTemperatureCompensatedProperties(temperature);
    
    // Simplified 1D constitutive equations for demonstration
    // S = sE * T + d * E (strain equation)
    // D = d * T + εT * E (electric displacement equation)
    
    const compliance = 1 / props.elasticModulus;
    const strain = [
      compliance * stress[0] + props.piezoelectricConstants.d33 * electricField[0]
    ];
    
    const electricDisplacement = [
      props.piezoelectricConstants.d33 * stress[0] + 
      props.dielectricConstants.epsilon33 * 8.854e-12 * electricField[0]
    ];
    
    return { strain, electricDisplacement };
  }

  /**
   * Calculate power output for given mechanical input
   */
  public calculatePowerOutput(
    force: number,
    frequency: number,
    area: number,
    thickness: number,
    loadResistance: number,
    temperature: number = 25
  ): { power: number; voltage: number; current: number; efficiency: number } {
    const props = this.getTemperatureCompensatedProperties(temperature);
    
    // Calculate stress and electric field
    const stress = force / area;
    const capacitance = props.dielectricConstants.epsilon33 * 8.854e-12 * area / thickness;
    
    // Simplified power calculation
    const openCircuitVoltage = props.piezoelectricConstants.d33 * stress * thickness;
    const internalResistance = 1 / (2 * Math.PI * frequency * capacitance);
    
    const current = openCircuitVoltage / (loadResistance + internalResistance);
    const voltage = current * loadResistance;
    const power = voltage * current;
    
    // Calculate efficiency (simplified)
    const mechanicalPower = force * force / (2 * props.elasticModulus * area);
    const efficiency = Math.min(power / mechanicalPower, 1.0);
    
    return { power, voltage, current, efficiency };
  }

  /**
   * Get material properties
   */
  public getProperties(): MaterialProperties {
    return { ...this.properties };
  }

  /**
   * Get material type
   */
  public getMaterialType(): string {
    return this.materialType;
  }
}

/**
 * Non-Classical Piezoelectric Materials
 * 
 * Implements advanced piezoelectric materials with enhanced properties
 */
export class NonClassicalPiezoelectricMaterial extends ClassicalPiezoelectricMaterial {
  private nonClassicalProps: NonClassicalProperties;
  private adaptiveParameters: Map<string, number>;

  constructor(materialType: string, properties: NonClassicalProperties) {
    super(materialType, properties);
    this.nonClassicalProps = properties;
    this.adaptiveParameters = new Map();
    this.initializeAdaptiveParameters();
  }

  /**
   * Initialize adaptive parameters for smart material behavior
   */
  private initializeAdaptiveParameters(): void {
    this.adaptiveParameters.set('stiffnessAdaptationRate', 0.1);
    this.adaptiveParameters.set('dampingAdaptationRate', 0.05);
    this.adaptiveParameters.set('frequencyTrackingGain', 0.2);
  }

  /**
   * Calculate nonlinear piezoelectric response
   */
  public calculateNonlinearResponse(
    stress: number[],
    electricField: number[],
    strainRate: number[],
    temperature: number = 25
  ): { strain: number[]; electricDisplacement: number[]; nonlinearEffects: any } {
    const linearResponse = this.calculateConstitutiveResponse(stress, electricField, temperature);
    
    // Add nonlinear effects
    const nonlinearStrain = this.nonClassicalProps.nonlinearCoefficients.alpha * 
      Math.pow(electricField[0], 2) + 
      this.nonClassicalProps.nonlinearCoefficients.beta * 
      Math.pow(stress[0], 2);
    
    const flexoelectricEffect = this.nonClassicalProps.nonlinearCoefficients.gamma * 
      strainRate[0];
    
    const totalStrain = [linearResponse.strain[0] + nonlinearStrain];
    const totalElectricDisplacement = [
      linearResponse.electricDisplacement[0] + flexoelectricEffect
    ];
    
    return {
      strain: totalStrain,
      electricDisplacement: totalElectricDisplacement,
      nonlinearEffects: {
        electrostriction: nonlinearStrain,
        flexoelectric: flexoelectricEffect,
        nonlinearityFactor: Math.abs(nonlinearStrain / linearResponse.strain[0])
      }
    };
  }

  /**
   * Calculate frequency-dependent response
   */
  public calculateFrequencyResponse(
    frequency: number,
    amplitude: number,
    temperature: number = 25
  ): { 
    impedance: { real: number; imaginary: number };
    powerFactor: number;
    resonanceAmplification: number;
  } {
    const fr = this.nonClassicalProps.frequencyResponse.resonantFrequency;
    const fa = this.nonClassicalProps.frequencyResponse.antiresonantFrequency;
    const Q = this.nonClassicalProps.mechanicalQuality;
    
    // Calculate impedance near resonance
    const frequencyRatio = frequency / fr;
    const dampingFactor = 1 / Q;
    
    const real = 1 / (1 + Math.pow(Q * (frequencyRatio - 1/frequencyRatio), 2));
    const imaginary = Q * (frequencyRatio - 1/frequencyRatio) * real;
    
    const powerFactor = real / Math.sqrt(real * real + imaginary * imaginary);
    
    // Resonance amplification
    const resonanceAmplification = frequency === fr ? Q : 
      Q / Math.sqrt(1 + Math.pow(Q * (frequencyRatio - 1/frequencyRatio), 2));
    
    return {
      impedance: { real, imaginary },
      powerFactor,
      resonanceAmplification
    };
  }

  /**
   * Adaptive stiffness control
   */
  public adaptStiffness(
    currentFrequency: number,
    targetFrequency: number,
    currentStiffness: number
  ): number {
    if (!this.nonClassicalProps.adaptiveStiffness) {
      return currentStiffness;
    }
    
    const frequencyError = targetFrequency - currentFrequency;
    const adaptationRate = this.adaptiveParameters.get('stiffnessAdaptationRate')!;
    
    // Simple proportional control for stiffness adaptation
    const stiffnessAdjustment = adaptationRate * frequencyError * currentStiffness;
    
    return Math.max(currentStiffness + stiffnessAdjustment, currentStiffness * 0.5);
  }

  /**
   * Self-sensing capability
   */
  public performSelfSensing(
    appliedVoltage: number,
    measuredCurrent: number,
    frequency: number
  ): { strain: number; force: number; displacement: number } {
    if (!this.nonClassicalProps.selfSensingCapability) {
      throw new Error('Material does not support self-sensing');
    }
    
    const impedance = this.calculateFrequencyResponse(frequency, 1.0);
    const estimatedStrain = measuredCurrent * impedance.impedance.real / 
      this.nonClassicalProps.piezoelectricConstants.d33;
    
    const estimatedForce = estimatedStrain * this.nonClassicalProps.elasticModulus;
    const estimatedDisplacement = estimatedStrain * 0.001; // Assuming 1mm thickness
    
    return {
      strain: estimatedStrain,
      force: estimatedForce,
      displacement: estimatedDisplacement
    };
  }

  /**
   * Get enhanced material properties
   */
  public getNonClassicalProperties(): NonClassicalProperties {
    return { ...this.nonClassicalProps };
  }
}

/**
 * Material Factory for creating different types of piezoelectric materials
 */
export class PiezoelectricMaterialFactory {
  private static materialDatabase: Map<string, MaterialProperties | NonClassicalProperties> = new Map();

  static {
    // Initialize material database with common materials
    this.initializeMaterialDatabase();
  }

  private static initializeMaterialDatabase(): void {
    // PZT-5H (Classical)
    this.materialDatabase.set('PZT-5H', {
      elasticModulus: 60e9,
      poissonRatio: 0.31,
      density: 7500,
      piezoelectricConstants: {
        d31: -274e-12,
        d33: 593e-12,
        d15: 741e-12
      },
      dielectricConstants: {
        epsilon11: 3400,
        epsilon33: 3000
      },
      electromechanicalCoupling: {
        k31: 0.39,
        k33: 0.75,
        k15: 0.68
      },
      mechanicalQuality: 65,
      electricalQuality: 500,
      maxStrain: 0.001,
      maxElectricField: 2e6,
      operatingTemperatureRange: { min: -20, max: 150 }
    });

    // PMN-PT (Non-Classical)
    this.materialDatabase.set('PMN-PT', {
      elasticModulus: 80e9,
      poissonRatio: 0.35,
      density: 8100,
      piezoelectricConstants: {
        d31: -1330e-12,
        d33: 2820e-12,
        d15: 146e-12
      },
      dielectricConstants: {
        epsilon11: 5000,
        epsilon33: 4200
      },
      electromechanicalCoupling: {
        k31: 0.61,
        k33: 0.94,
        k15: 0.91
      },
      mechanicalQuality: 100,
      electricalQuality: 800,
      maxStrain: 0.002,
      maxElectricField: 1.5e6,
      operatingTemperatureRange: { min: -40, max: 120 },
      nonlinearCoefficients: {
        alpha: 1.2e-18,
        beta: 2.5e-24,
        gamma: 3.1e-15
      },
      frequencyResponse: {
        resonantFrequency: 1000,
        antiresonantFrequency: 1100,
        bandwidthFactor: 0.1
      },
      grainSize: 5,
      porosity: 0.02,
      textureCoefficient: 0.85,
      selfSensingCapability: true,
      adaptiveStiffness: true,
      temperatureCompensation: true
    } as NonClassicalProperties);
  }

  /**
   * Create a classical piezoelectric material
   */
  public static createClassicalMaterial(materialType: string): ClassicalPiezoelectricMaterial {
    const properties = this.materialDatabase.get(materialType);
    if (!properties) {
      throw new Error(`Unknown material type: ${materialType}`);
    }
    
    return new ClassicalPiezoelectricMaterial(materialType, properties);
  }

  /**
   * Create a non-classical piezoelectric material
   */
  public static createNonClassicalMaterial(materialType: string): NonClassicalPiezoelectricMaterial {
    const properties = this.materialDatabase.get(materialType) as NonClassicalProperties;
    if (!properties || !properties.nonlinearCoefficients) {
      throw new Error(`Material ${materialType} is not a non-classical material`);
    }
    
    return new NonClassicalPiezoelectricMaterial(materialType, properties);
  }

  /**
   * Get available material types
   */
  public static getAvailableMaterials(): string[] {
    return Array.from(this.materialDatabase.keys());
  }

  /**
   * Add custom material to database
   */
  public static addCustomMaterial(
    name: string, 
    properties: MaterialProperties | NonClassicalProperties
  ): void {
    this.materialDatabase.set(name, properties);
  }
}