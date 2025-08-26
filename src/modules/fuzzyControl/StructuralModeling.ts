/**
 * Structural Modeling Module for Piezoelectric Energy Harvesters
 * 
 * This module implements comprehensive structural models for piezoelectric
 * energy harvesting devices, including beam models, plate models, and
 * complex geometries with finite element analysis capabilities.
 */

import { MaterialProperties, NonClassicalProperties } from './PiezoelectricMaterials';

export interface GeometryParameters {
  // Basic dimensions
  length: number;                   // m
  width: number;                    // m
  thickness: number;                // m
  
  // Shape parameters
  shape: 'rectangular' | 'circular' | 'trapezoidal' | 'custom';
  aspectRatio: number;              // length/width
  
  // Structural features
  supportConditions: 'cantilever' | 'simply_supported' | 'clamped' | 'free';
  massLocation: 'tip' | 'distributed' | 'center';
  tipMass?: number;                 // kg (optional)
  
  // Multi-layer configuration
  layers: LayerConfiguration[];
}

export interface LayerConfiguration {
  materialType: string;
  thickness: number;               // m
  position: 'top' | 'middle' | 'bottom';
  orientation: number;             // degrees (fiber/polarization direction)
}

export interface ModalProperties {
  naturalFrequencies: number[];    // Hz
  modeShapes: number[][];          // Normalized mode shapes
  dampingRatios: number[];         // Modal damping ratios
  modalMasses: number[];           // kg
  modalStiffnesses: number[];      // N/m
}

export interface LoadConditions {
  // Base excitation
  baseAcceleration: {
    amplitude: number;             // m/s²
    frequency: number;             // Hz
    phase: number;                 // radians
  };
  
  // Direct force excitation
  appliedForce?: {
    magnitude: number;             // N
    location: { x: number; y: number; z: number };
    direction: { x: number; y: number; z: number };
  };
  
  // Environmental conditions
  temperature: number;             // °C
  humidity: number;                // %
  pressure: number;                // Pa
}

export interface StructuralResponse {
  displacement: {
    maximum: number;               // m
    rms: number;                   // m
    distribution: number[];        // Along structure
  };
  
  strain: {
    maximum: number;               // dimensionless
    rms: number;                   // dimensionless
    distribution: number[];        // Along structure
  };
  
  stress: {
    maximum: number;               // Pa
    rms: number;                   // Pa
    distribution: number[];        // Along structure
  };
  
  naturalFrequency: number;        // Hz
  dampingRatio: number;            // dimensionless
  resonanceAmplification: number;  // dimensionless
}

/**
 * Beam Model for Cantilever Piezoelectric Energy Harvesters
 */
export class PiezoelectricBeamModel {
  private geometry: GeometryParameters;
  private material: MaterialProperties;
  private modalProperties: ModalProperties;
  private elementCount: number;

  constructor(
    geometry: GeometryParameters,
    material: MaterialProperties,
    elementCount: number = 50
  ) {
    this.geometry = geometry;
    this.material = material;
    this.elementCount = elementCount;
    this.modalProperties = this.calculateModalProperties();
  }

  /**
   * Calculate modal properties using Euler-Bernoulli beam theory
   */
  private calculateModalProperties(): ModalProperties {
    const L = this.geometry.length;
    const E = this.material.elasticModulus;
    const rho = this.material.density;
    const A = this.geometry.width * this.geometry.thickness;
    const I = this.geometry.width * Math.pow(this.geometry.thickness, 3) / 12;
    
    // Calculate first 5 natural frequencies for cantilever beam
    const eigenvalues = [1.875, 4.694, 7.855, 10.996, 14.137]; // First 5 eigenvalues
    const naturalFrequencies: number[] = [];
    const modalMasses: number[] = [];
    const modalStiffnesses: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      const lambda = eigenvalues[i];
      const omega = Math.pow(lambda, 2) * Math.sqrt(E * I / (rho * A)) / Math.pow(L, 2);
      naturalFrequencies.push(omega / (2 * Math.PI));
      
      // Modal mass (normalized)
      modalMasses.push(rho * A * L / 4);
      
      // Modal stiffness
      modalStiffnesses.push(Math.pow(omega, 2) * modalMasses[i]);
    }
    
    // Generate mode shapes
    const modeShapes: number[][] = [];
    const x = Array.from({ length: this.elementCount + 1 }, (_, i) => i * L / this.elementCount);
    
    for (let mode = 0; mode < 5; mode++) {
      const lambda = eigenvalues[mode];
      const modeShape: number[] = [];
      
      for (const xi of x) {
        const xi_norm = xi / L;
        const shape = Math.cosh(lambda * xi_norm) - Math.cos(lambda * xi_norm) -
          (Math.cosh(lambda) + Math.cos(lambda)) / (Math.sinh(lambda) + Math.sin(lambda)) *
          (Math.sinh(lambda * xi_norm) - Math.sin(lambda * xi_norm));
        modeShape.push(shape);
      }
      
      // Normalize mode shape
      const maxValue = Math.max(...modeShape.map(Math.abs));
      modeShapes.push(modeShape.map(val => val / maxValue));
    }
    
    // Estimate damping ratios (typical values for piezoelectric materials)
    const dampingRatios = [0.02, 0.025, 0.03, 0.035, 0.04];
    
    return {
      naturalFrequencies,
      modeShapes,
      dampingRatios,
      modalMasses,
      modalStiffnesses
    };
  }

  /**
   * Calculate structural response under given load conditions
   */
  public calculateStructuralResponse(loadConditions: LoadConditions): StructuralResponse {
    const excitationFreq = loadConditions.baseAcceleration.frequency;
    const excitationAmplitude = loadConditions.baseAcceleration.amplitude;
    
    // Find dominant mode (closest to excitation frequency)
    let dominantMode = 0;
    let minFreqDiff = Math.abs(this.modalProperties.naturalFrequencies[0] - excitationFreq);
    
    for (let i = 1; i < this.modalProperties.naturalFrequencies.length; i++) {
      const freqDiff = Math.abs(this.modalProperties.naturalFrequencies[i] - excitationFreq);
      if (freqDiff < minFreqDiff) {
        minFreqDiff = freqDiff;
        dominantMode = i;
      }
    }
    
    const naturalFreq = this.modalProperties.naturalFrequencies[dominantMode];
    const dampingRatio = this.modalProperties.dampingRatios[dominantMode];
    const modalMass = this.modalProperties.modalMasses[dominantMode];
    const modalStiffness = this.modalProperties.modalStiffnesses[dominantMode];
    
    // Calculate frequency response
    const frequencyRatio = excitationFreq / naturalFreq;
    const dampedFreqRatio = Math.sqrt(1 - Math.pow(dampingRatio, 2));
    
    const magnificationFactor = 1 / Math.sqrt(
      Math.pow(1 - Math.pow(frequencyRatio, 2), 2) + 
      Math.pow(2 * dampingRatio * frequencyRatio, 2)
    );
    
    // Calculate tip displacement
    const staticDeflection = excitationAmplitude / Math.pow(2 * Math.PI * naturalFreq, 2);
    const maxDisplacement = staticDeflection * magnificationFactor;
    const rmsDisplacement = maxDisplacement / Math.sqrt(2);
    
    // Calculate strain distribution
    const L = this.geometry.length;
    const thickness = this.geometry.thickness;
    const modeShape = this.modalProperties.modeShapes[dominantMode];
    
    // Maximum strain occurs at the root (x = 0) for cantilever
    const maxStrain = maxDisplacement * thickness / (2 * Math.pow(L, 2)) * 
      this.calculateModeShapeDerivative(0, dominantMode);
    const rmsStrain = maxStrain / Math.sqrt(2);
    
    // Calculate stress
    const maxStress = maxStrain * this.material.elasticModulus;
    const rmsStress = maxStress / Math.sqrt(2);
    
    // Generate distribution arrays
    const displacementDistribution = modeShape.map(shape => shape * maxDisplacement);
    const strainDistribution = this.calculateStrainDistribution(dominantMode, maxDisplacement);
    const stressDistribution = strainDistribution.map(strain => strain * this.material.elasticModulus);
    
    return {
      displacement: {
        maximum: maxDisplacement,
        rms: rmsDisplacement,
        distribution: displacementDistribution
      },
      strain: {
        maximum: maxStrain,
        rms: rmsStrain,
        distribution: strainDistribution
      },
      stress: {
        maximum: maxStress,
        rms: rmsStress,
        distribution: stressDistribution
      },
      naturalFrequency: naturalFreq,
      dampingRatio: dampingRatio,
      resonanceAmplification: magnificationFactor
    };
  }

  /**
   * Calculate mode shape derivative for strain calculation
   */
  private calculateModeShapeDerivative(position: number, modeIndex: number): number {
    const L = this.geometry.length;
    const lambda = [1.875, 4.694, 7.855, 10.996, 14.137][modeIndex];
    const xi = position / L;
    
    // Second derivative of mode shape (curvature)
    const curvature = Math.pow(lambda / L, 2) * (
      Math.sinh(lambda * xi) + Math.sin(lambda * xi) -
      (Math.cosh(lambda) + Math.cos(lambda)) / (Math.sinh(lambda) + Math.sin(lambda)) *
      (Math.cosh(lambda * xi) + Math.cos(lambda * xi))
    );
    
    return curvature;
  }

  /**
   * Calculate strain distribution along the beam
   */
  private calculateStrainDistribution(modeIndex: number, amplitude: number): number[] {
    const L = this.geometry.length;
    const thickness = this.geometry.thickness;
    const strainDistribution: number[] = [];
    
    for (let i = 0; i <= this.elementCount; i++) {
      const x = i * L / this.elementCount;
      const curvature = this.calculateModeShapeDerivative(x, modeIndex);
      const strain = amplitude * thickness / 2 * curvature;
      strainDistribution.push(strain);
    }
    
    return strainDistribution;
  }

  /**
   * Get modal properties
   */
  public getModalProperties(): ModalProperties {
    return { ...this.modalProperties };
  }

  /**
   * Update geometry parameters
   */
  public updateGeometry(newGeometry: Partial<GeometryParameters>): void {
    this.geometry = { ...this.geometry, ...newGeometry };
    this.modalProperties = this.calculateModalProperties();
  }
}

/**
 * Plate Model for 2D Piezoelectric Energy Harvesters
 */
export class PiezoelectricPlateModel {
  private geometry: GeometryParameters;
  private material: MaterialProperties;
  private meshResolution: { nx: number; ny: number };

  constructor(
    geometry: GeometryParameters,
    material: MaterialProperties,
    meshResolution: { nx: number; ny: number } = { nx: 20, ny: 20 }
  ) {
    this.geometry = geometry;
    this.material = material;
    this.meshResolution = meshResolution;
  }

  /**
   * Calculate 2D modal properties using plate theory
   */
  public calculatePlateModalProperties(): ModalProperties {
    const a = this.geometry.length;
    const b = this.geometry.width;
    const h = this.geometry.thickness;
    const E = this.material.elasticModulus;
    const nu = this.material.poissonRatio;
    const rho = this.material.density;
    
    const D = E * Math.pow(h, 3) / (12 * (1 - Math.pow(nu, 2))); // Flexural rigidity
    const rhoA = rho * h; // Mass per unit area
    
    const naturalFrequencies: number[] = [];
    const modalMasses: number[] = [];
    const modalStiffnesses: number[] = [];
    
    // Calculate first few modes for simply supported rectangular plate
    for (let m = 1; m <= 3; m++) {
      for (let n = 1; n <= 3; n++) {
        const omega = Math.PI * Math.PI * Math.sqrt(D / rhoA) * 
          Math.sqrt(Math.pow(m / a, 2) + Math.pow(n / b, 2));
        
        naturalFrequencies.push(omega / (2 * Math.PI));
        
        // Modal mass for simply supported plate
        const modalMass = rhoA * a * b / 4;
        modalMasses.push(modalMass);
        
        modalStiffnesses.push(Math.pow(omega, 2) * modalMass);
        
        if (naturalFrequencies.length >= 9) break; // Limit to first 9 modes
      }
      if (naturalFrequencies.length >= 9) break;
    }
    
    // Generate simplified mode shapes (would need full FEM for accurate shapes)
    const modeShapes: number[][] = [];
    for (let mode = 0; mode < naturalFrequencies.length; mode++) {
      const modeShape: number[] = [];
      for (let i = 0; i <= this.meshResolution.nx; i++) {
        for (let j = 0; j <= this.meshResolution.ny; j++) {
          const x = i * a / this.meshResolution.nx;
          const y = j * b / this.meshResolution.ny;
          const m = Math.floor(mode / 3) + 1;
          const n = (mode % 3) + 1;
          const shape = Math.sin(m * Math.PI * x / a) * Math.sin(n * Math.PI * y / b);
          modeShape.push(shape);
        }
      }
      modeShapes.push(modeShape);
    }
    
    const dampingRatios = Array(naturalFrequencies.length).fill(0.02);
    
    return {
      naturalFrequencies,
      modeShapes,
      dampingRatios,
      modalMasses,
      modalStiffnesses
    };
  }

  /**
   * Calculate 2D structural response
   */
  public calculatePlateResponse(loadConditions: LoadConditions): StructuralResponse {
    const modalProps = this.calculatePlateModalProperties();
    const excitationFreq = loadConditions.baseAcceleration.frequency;
    
    // Find dominant mode
    let dominantMode = 0;
    let minFreqDiff = Math.abs(modalProps.naturalFrequencies[0] - excitationFreq);
    
    for (let i = 1; i < modalProps.naturalFrequencies.length; i++) {
      const freqDiff = Math.abs(modalProps.naturalFrequencies[i] - excitationFreq);
      if (freqDiff < minFreqDiff) {
        minFreqDiff = freqDiff;
        dominantMode = i;
      }
    }
    
    const naturalFreq = modalProps.naturalFrequencies[dominantMode];
    const dampingRatio = modalProps.dampingRatios[dominantMode];
    
    // Calculate response (simplified for plate)
    const frequencyRatio = excitationFreq / naturalFreq;
    const magnificationFactor = 1 / Math.sqrt(
      Math.pow(1 - Math.pow(frequencyRatio, 2), 2) + 
      Math.pow(2 * dampingRatio * frequencyRatio, 2)
    );
    
    const staticDeflection = loadConditions.baseAcceleration.amplitude / 
      Math.pow(2 * Math.PI * naturalFreq, 2);
    const maxDisplacement = staticDeflection * magnificationFactor;
    
    // Simplified strain and stress calculations
    const maxStrain = maxDisplacement * this.geometry.thickness / 
      (2 * Math.pow(Math.min(this.geometry.length, this.geometry.width), 2));
    const maxStress = maxStrain * this.material.elasticModulus;
    
    return {
      displacement: {
        maximum: maxDisplacement,
        rms: maxDisplacement / Math.sqrt(2),
        distribution: modalProps.modeShapes[dominantMode].map(shape => shape * maxDisplacement)
      },
      strain: {
        maximum: maxStrain,
        rms: maxStrain / Math.sqrt(2),
        distribution: modalProps.modeShapes[dominantMode].map(shape => shape * maxStrain)
      },
      stress: {
        maximum: maxStress,
        rms: maxStress / Math.sqrt(2),
        distribution: modalProps.modeShapes[dominantMode].map(shape => shape * maxStress)
      },
      naturalFrequency: naturalFreq,
      dampingRatio: dampingRatio,
      resonanceAmplification: magnificationFactor
    };
  }
}

/**
 * Multi-Physics Structural Model
 * 
 * Combines structural, electrical, and thermal effects
 */
export class MultiPhysicsStructuralModel {
  private beamModel: PiezoelectricBeamModel;
  private plateModel: PiezoelectricPlateModel;
  private couplingFactors: Map<string, number>;

  constructor(
    geometry: GeometryParameters,
    material: MaterialProperties | NonClassicalProperties
  ) {
    this.beamModel = new PiezoelectricBeamModel(geometry, material);
    this.plateModel = new PiezoelectricPlateModel(geometry, material);
    this.couplingFactors = new Map();
    this.initializeCouplingFactors();
  }

  /**
   * Initialize electromechanical coupling factors
   */
  private initializeCouplingFactors(): void {
    this.couplingFactors.set('electromechanical', 0.3);
    this.couplingFactors.set('thermal', 0.1);
    this.couplingFactors.set('frequency', 0.05);
  }

  /**
   * Calculate coupled response considering all physics
   */
  public calculateCoupledResponse(
    loadConditions: LoadConditions,
    electricalLoad: number,
    modelType: 'beam' | 'plate' = 'beam'
  ): {
    structural: StructuralResponse;
    electrical: { voltage: number; current: number; power: number };
    thermal: { temperature: number; thermalStress: number };
    coupling: { efficiency: number; bandwidth: number };
  } {
    // Get base structural response
    const structural = modelType === 'beam' ? 
      this.beamModel.calculateStructuralResponse(loadConditions) :
      this.plateModel.calculatePlateResponse(loadConditions);
    
    // Calculate electrical response
    const electromechanicalCoupling = this.couplingFactors.get('electromechanical')!;
    const voltage = structural.strain.maximum * 1000 * electromechanicalCoupling; // Simplified
    const current = voltage / electricalLoad;
    const power = voltage * current;
    
    // Calculate thermal effects
    const thermalCoupling = this.couplingFactors.get('thermal')!;
    const temperatureRise = power * thermalCoupling;
    const thermalStress = temperatureRise * 2e6; // Simplified thermal stress
    
    // Calculate coupling efficiency
    const mechanicalPower = Math.pow(structural.strain.maximum, 2) * 
      this.beamModel['material'].elasticModulus * 0.001; // Simplified
    const efficiency = Math.min(power / mechanicalPower, 1.0);
    
    // Calculate bandwidth
    const bandwidth = structural.naturalFrequency * structural.dampingRatio * 2;
    
    return {
      structural,
      electrical: { voltage, current, power },
      thermal: { temperature: temperatureRise, thermalStress },
      coupling: { efficiency, bandwidth }
    };
  }

  /**
   * Optimize structure for maximum power output
   */
  public optimizeStructure(
    targetFrequency: number,
    constraints: { maxStress: number; maxDisplacement: number }
  ): { 
    optimalGeometry: Partial<GeometryParameters>;
    expectedPerformance: { power: number; efficiency: number };
  } {
    // Simplified optimization - in practice would use numerical optimization
    const currentModalProps = this.beamModel.getModalProperties();
    const currentFreq = currentModalProps.naturalFrequencies[0];
    
    // Adjust length to match target frequency
    const frequencyRatio = Math.sqrt(targetFrequency / currentFreq);
    const optimalLength = this.beamModel['geometry'].length / frequencyRatio;
    
    // Optimize thickness for stress constraints
    const maxAllowableStrain = constraints.maxStress / this.beamModel['material'].elasticModulus;
    const optimalThickness = Math.sqrt(maxAllowableStrain * 2 * Math.pow(optimalLength, 2) / 
      constraints.maxDisplacement);
    
    const optimalGeometry: Partial<GeometryParameters> = {
      length: optimalLength,
      thickness: optimalThickness
    };
    
    // Estimate performance
    const expectedPower = 0.001; // Simplified - would calculate based on optimized geometry
    const expectedEfficiency = 0.3;
    
    return {
      optimalGeometry,
      expectedPerformance: { power: expectedPower, efficiency: expectedEfficiency }
    };
  }
}