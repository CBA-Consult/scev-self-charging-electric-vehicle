/**
 * Flexural Analysis for Piezoelectric Harvesters
 * 
 * This module performs detailed flexural analysis of piezoelectric harvester
 * structures to evaluate deformation, stress distribution, and mechanical reliability.
 */

import { PiezoelectricMaterial } from './MaterialProperties';
import { StructuralDesign } from './StructuralOptimizer';
import { VibrationData } from './PiezoelectricHarvesterController';

export interface FlexuralProperties {
  momentOfInertia: number;        // m⁴ - second moment of area
  sectionModulus: number;         // m³ - section modulus
  neutralAxis: number;            // m - distance to neutral axis
  effectiveLength: number;        // m - effective beam length
  boundaryConditions: 'cantilever' | 'simply_supported' | 'fixed_fixed' | 'free_free';
}

export interface DeformationAnalysis {
  maxDeflection: number;          // m - maximum deflection
  deflectionProfile: number[];    // m - deflection along beam length
  maxStress: number;              // Pa - maximum stress
  stressDistribution: StressDistribution;
  maxStrain: number;              // - maximum strain
  strainDistribution: number[];   // - strain along beam length
  resonantFrequency: number;      // Hz - fundamental resonant frequency
  modeShapes: number[][];         // - normalized mode shapes
  dampingRatio: number;           // - structural damping ratio
}

export interface StressDistribution {
  tensile: {
    maximum: number;              // Pa - maximum tensile stress
    location: { x: number; y: number; z: number }; // m - location of max stress
    distribution: number[][];     // Pa - stress field
  };
  compressive: {
    maximum: number;              // Pa - maximum compressive stress
    location: { x: number; y: number; z: number }; // m - location of max stress
    distribution: number[][];     // Pa - stress field
  };
  shear: {
    maximum: number;              // Pa - maximum shear stress
    location: { x: number; y: number; z: number }; // m - location of max stress
    distribution: number[][];     // Pa - stress field
  };
  vonMises: {
    maximum: number;              // Pa - maximum von Mises stress
    location: { x: number; y: number; z: number }; // m - location of max stress
    distribution: number[][];     // Pa - stress field
  };
}

export interface ReliabilityMetrics {
  safetyFactor: number;           // - factor of safety
  fatigueLife: number;            // cycles - estimated fatigue life
  reliabilityIndex: number;       // - reliability index (0-1)
  failureProbability: number;     // - probability of failure
  criticalStressRatio: number;    // - ratio of max stress to yield strength
  maintenanceInterval: number;    // hours - recommended maintenance interval
}

export class FlexuralAnalysis {
  private material: PiezoelectricMaterial;
  private analysisResolution: number = 100; // Number of points for analysis

  constructor(material: PiezoelectricMaterial) {
    this.material = material;
  }

  /**
   * Perform comprehensive deformation analysis
   */
  public analyzeDeformation(
    design: StructuralDesign,
    vibrationData: VibrationData
  ): DeformationAnalysis {
    // Calculate flexural properties
    const flexuralProps = this.calculateFlexuralProperties(design);
    
    // Calculate applied loads
    const appliedLoads = this.calculateAppliedLoads(design, vibrationData);
    
    // Perform static analysis
    const staticAnalysis = this.performStaticAnalysis(design, flexuralProps, appliedLoads);
    
    // Perform dynamic analysis
    const dynamicAnalysis = this.performDynamicAnalysis(design, flexuralProps, vibrationData);
    
    // Combine static and dynamic responses
    const combinedAnalysis = this.combineStaticDynamicResponse(staticAnalysis, dynamicAnalysis);
    
    return combinedAnalysis;
  }

  /**
   * Calculate detailed stress distribution
   */
  public calculateStressDistribution(
    design: StructuralDesign,
    deformationAnalysis: DeformationAnalysis
  ): StressDistribution {
    const { length, width, thickness } = design.dimensions;
    const flexuralProps = this.calculateFlexuralProperties(design);
    
    // Create stress distribution grids
    const xPoints = Math.floor(length * 1000); // 1mm resolution
    const yPoints = Math.floor(thickness * 10000); // 0.1mm resolution
    
    const tensileDistribution: number[][] = [];
    const compressiveDistribution: number[][] = [];
    const shearDistribution: number[][] = [];
    const vonMisesDistribution: number[][] = [];
    
    let maxTensile = 0, maxCompressive = 0, maxShear = 0, maxVonMises = 0;
    let tensileLocation = { x: 0, y: 0, z: 0 };
    let compressiveLocation = { x: 0, y: 0, z: 0 };
    let shearLocation = { x: 0, y: 0, z: 0 };
    let vonMisesLocation = { x: 0, y: 0, z: 0 };
    
    for (let i = 0; i < xPoints; i++) {
      const x = (i / xPoints) * length;
      const xRow: number[] = [];
      const compRow: number[] = [];
      const shearRow: number[] = [];
      const vonMisesRow: number[] = [];
      
      for (let j = 0; j < yPoints; j++) {
        const y = (j / yPoints) * thickness - thickness / 2; // Center at neutral axis
        
        // Calculate bending stress (σ = My/I)
        const moment = this.calculateMomentAtPosition(x, design, deformationAnalysis);
        const bendingStress = moment * y / flexuralProps.momentOfInertia;
        
        // Calculate shear stress (τ = VQ/It)
        const shearForce = this.calculateShearForceAtPosition(x, design, deformationAnalysis);
        const firstMoment = this.calculateFirstMoment(y, design);
        const shearStress = shearForce * firstMoment / (flexuralProps.momentOfInertia * width);
        
        // Calculate von Mises stress
        const vonMisesStress = Math.sqrt(bendingStress ** 2 + 3 * shearStress ** 2);
        
        // Store values
        xRow.push(Math.max(0, bendingStress));
        compRow.push(Math.max(0, -bendingStress));
        shearRow.push(Math.abs(shearStress));
        vonMisesRow.push(vonMisesStress);
        
        // Track maximums
        if (bendingStress > maxTensile) {
          maxTensile = bendingStress;
          tensileLocation = { x, y, z: 0 };
        }
        if (-bendingStress > maxCompressive) {
          maxCompressive = -bendingStress;
          compressiveLocation = { x, y, z: 0 };
        }
        if (Math.abs(shearStress) > maxShear) {
          maxShear = Math.abs(shearStress);
          shearLocation = { x, y, z: 0 };
        }
        if (vonMisesStress > maxVonMises) {
          maxVonMises = vonMisesStress;
          vonMisesLocation = { x, y, z: 0 };
        }
      }
      
      tensileDistribution.push(xRow);
      compressiveDistribution.push(compRow);
      shearDistribution.push(shearRow);
      vonMisesDistribution.push(vonMisesRow);
    }
    
    return {
      tensile: {
        maximum: maxTensile,
        location: tensileLocation,
        distribution: tensileDistribution,
      },
      compressive: {
        maximum: maxCompressive,
        location: compressiveLocation,
        distribution: compressiveDistribution,
      },
      shear: {
        maximum: maxShear,
        location: shearLocation,
        distribution: shearDistribution,
      },
      vonMises: {
        maximum: maxVonMises,
        location: vonMisesLocation,
        distribution: vonMisesDistribution,
      },
    };
  }

  /**
   * Assess mechanical reliability
   */
  public assessReliability(
    design: StructuralDesign,
    deformationAnalysis: DeformationAnalysis,
    operatingConditions: VibrationData
  ): ReliabilityMetrics {
    const stressDistribution = this.calculateStressDistribution(design, deformationAnalysis);
    const maxStress = stressDistribution.vonMises.maximum;
    const yieldStrength = this.material.constants.yieldStrength;
    
    // Calculate safety factor
    const safetyFactor = yieldStrength / maxStress;
    
    // Estimate fatigue life using S-N curve
    const fatigueLife = this.estimateFatigueLife(maxStress, operatingConditions);
    
    // Calculate reliability index
    const reliabilityIndex = this.calculateReliabilityIndex(safetyFactor, fatigueLife);
    
    // Calculate failure probability
    const failureProbability = 1 - reliabilityIndex;
    
    // Calculate critical stress ratio
    const criticalStressRatio = maxStress / yieldStrength;
    
    // Estimate maintenance interval
    const maintenanceInterval = this.estimateMaintenanceInterval(fatigueLife, reliabilityIndex);
    
    return {
      safetyFactor,
      fatigueLife,
      reliabilityIndex,
      failureProbability,
      criticalStressRatio,
      maintenanceInterval,
    };
  }

  /**
   * Optimize beam geometry for maximum flexural efficiency
   */
  public optimizeFlexuralGeometry(
    baseDesign: StructuralDesign,
    targetFrequency: number,
    constraints: {
      maxLength?: number;
      maxWidth?: number;
      maxThickness?: number;
      maxStress?: number;
    }
  ): {
    optimizedDimensions: StructuralDesign['dimensions'];
    resonantFrequency: number;
    maxStress: number;
    improvementFactor: number;
  } {
    const originalProps = this.calculateFlexuralProperties(baseDesign);
    let bestDesign = { ...baseDesign };
    let bestScore = 0;
    
    // Parameter sweep optimization
    const lengthRange = this.generateParameterRange(
      baseDesign.dimensions.length,
      constraints.maxLength || baseDesign.dimensions.length * 2,
      20
    );
    const widthRange = this.generateParameterRange(
      baseDesign.dimensions.width,
      constraints.maxWidth || baseDesign.dimensions.width * 2,
      10
    );
    const thicknessRange = this.generateParameterRange(
      baseDesign.dimensions.thickness,
      constraints.maxThickness || baseDesign.dimensions.thickness * 2,
      10
    );
    
    for (const length of lengthRange) {
      for (const width of widthRange) {
        for (const thickness of thicknessRange) {
          const testDesign = {
            ...baseDesign,
            dimensions: { length, width, thickness },
          };
          
          const flexuralProps = this.calculateFlexuralProperties(testDesign);
          const resonantFreq = this.calculateResonantFrequency(testDesign, flexuralProps);
          
          // Create dummy vibration data for stress calculation
          const testVibration: VibrationData = {
            acceleration: { x: 0, y: 0, z: 9.81 },
            frequency: { dominant: resonantFreq, harmonics: [] },
            amplitude: 0.001,
            duration: 1,
            samplingRate: 1000,
            temperatureAmbient: 25,
            humidity: 50,
          };
          
          const deformation = this.analyzeDeformation(testDesign, testVibration);
          
          // Check constraints
          if (constraints.maxStress && deformation.maxStress > constraints.maxStress) {
            continue;
          }
          
          // Calculate score based on frequency matching and stress optimization
          const frequencyScore = 1 / (1 + Math.abs(resonantFreq - targetFrequency) / targetFrequency);
          const stressScore = constraints.maxStress ? 
            (constraints.maxStress - deformation.maxStress) / constraints.maxStress : 1;
          const score = frequencyScore * stressScore;
          
          if (score > bestScore) {
            bestScore = score;
            bestDesign = testDesign;
          }
        }
      }
    }
    
    const finalProps = this.calculateFlexuralProperties(bestDesign);
    const finalResonantFreq = this.calculateResonantFrequency(bestDesign, finalProps);
    
    // Calculate improvement factor
    const originalResonantFreq = this.calculateResonantFrequency(baseDesign, originalProps);
    const improvementFactor = Math.abs(targetFrequency - finalResonantFreq) / 
                             Math.abs(targetFrequency - originalResonantFreq);
    
    return {
      optimizedDimensions: bestDesign.dimensions,
      resonantFrequency: finalResonantFreq,
      maxStress: 0, // Would be calculated from final analysis
      improvementFactor,
    };
  }

  // Private helper methods

  private calculateFlexuralProperties(design: StructuralDesign): FlexuralProperties {
    const { length, width, thickness } = design.dimensions;
    
    // Calculate moment of inertia for rectangular cross-section
    const momentOfInertia = width * Math.pow(thickness, 3) / 12;
    
    // Calculate section modulus
    const sectionModulus = momentOfInertia / (thickness / 2);
    
    // Neutral axis is at center for symmetric section
    const neutralAxis = thickness / 2;
    
    // Effective length depends on boundary conditions
    let effectiveLength = length;
    switch (design.type) {
      case 'cantilever':
        effectiveLength = length;
        break;
      case 'fixed-fixed':
        effectiveLength = length / 2;
        break;
      default:
        effectiveLength = length;
    }
    
    return {
      momentOfInertia,
      sectionModulus,
      neutralAxis,
      effectiveLength,
      boundaryConditions: design.type === 'cantilever' ? 'cantilever' : 'simply_supported',
    };
  }

  private calculateAppliedLoads(design: StructuralDesign, vibrationData: VibrationData): {
    distributedLoad: number;      // N/m - distributed load
    pointLoad: number;            // N - point load at tip
    moment: number;               // N⋅m - applied moment
  } {
    const totalAcceleration = Math.sqrt(
      vibrationData.acceleration.x ** 2 +
      vibrationData.acceleration.y ** 2 +
      vibrationData.acceleration.z ** 2
    );
    
    // Calculate inertial loads
    const beamMass = design.dimensions.length * design.dimensions.width * 
                     design.dimensions.thickness * this.material.constants.density;
    const distributedLoad = beamMass * totalAcceleration / design.dimensions.length;
    
    // Point load from proof mass
    const pointLoad = design.mountingConfiguration.proofMass * totalAcceleration;
    
    // No applied moment for typical energy harvester
    const moment = 0;
    
    return { distributedLoad, pointLoad, moment };
  }

  private performStaticAnalysis(
    design: StructuralDesign,
    flexuralProps: FlexuralProperties,
    loads: { distributedLoad: number; pointLoad: number; moment: number }
  ): Partial<DeformationAnalysis> {
    const { length } = design.dimensions;
    const { momentOfInertia } = flexuralProps;
    const E = this.material.constants.elasticModulus;
    
    // For cantilever beam with distributed load and point load at tip
    const w = loads.distributedLoad;
    const P = loads.pointLoad;
    const L = length;
    
    // Maximum deflection at tip (cantilever with distributed + point load)
    const maxDeflection = (w * Math.pow(L, 4)) / (8 * E * momentOfInertia) + 
                         (P * Math.pow(L, 3)) / (3 * E * momentOfInertia);
    
    // Maximum moment (at fixed end)
    const maxMoment = (w * Math.pow(L, 2)) / 2 + P * L;
    
    // Maximum stress
    const maxStress = maxMoment * (design.dimensions.thickness / 2) / momentOfInertia;
    
    // Maximum strain
    const maxStrain = maxStress / E;
    
    // Generate deflection profile
    const deflectionProfile: number[] = [];
    for (let i = 0; i <= this.analysisResolution; i++) {
      const x = (i / this.analysisResolution) * L;
      const deflection = (w * x ** 2) / (24 * E * momentOfInertia) * (6 * L ** 2 - 4 * L * x + x ** 2) +
                        (P * x ** 2) / (6 * E * momentOfInertia) * (3 * L - x);
      deflectionProfile.push(deflection);
    }
    
    return {
      maxDeflection,
      deflectionProfile,
      maxStress,
      maxStrain,
    };
  }

  private performDynamicAnalysis(
    design: StructuralDesign,
    flexuralProps: FlexuralProperties,
    vibrationData: VibrationData
  ): Partial<DeformationAnalysis> {
    // Calculate resonant frequency
    const resonantFrequency = this.calculateResonantFrequency(design, flexuralProps);
    
    // Calculate damping ratio (typical for piezoelectric materials)
    const dampingRatio = 0.02; // 2% damping
    
    // Calculate mode shapes (simplified - first mode only)
    const modeShapes = this.calculateModeShapes(design, 1);
    
    return {
      resonantFrequency,
      dampingRatio,
      modeShapes,
    };
  }

  private calculateResonantFrequency(design: StructuralDesign, flexuralProps: FlexuralProperties): number {
    const { length, width, thickness } = design.dimensions;
    const { momentOfInertia } = flexuralProps;
    const E = this.material.constants.elasticModulus;
    const rho = this.material.constants.density;
    const A = width * thickness;
    
    // For cantilever beam, first mode frequency
    const lambda1 = 1.875; // First eigenvalue for cantilever
    
    const frequency = (lambda1 ** 2) / (2 * Math.PI * length ** 2) * 
                     Math.sqrt((E * momentOfInertia) / (rho * A));
    
    return frequency;
  }

  private calculateModeShapes(design: StructuralDesign, numModes: number): number[][] {
    const modeShapes: number[][] = [];
    const L = design.dimensions.length;
    
    // Eigenvalues for cantilever beam
    const eigenvalues = [1.875, 4.694, 7.855, 10.996, 14.137];
    
    for (let mode = 0; mode < Math.min(numModes, eigenvalues.length); mode++) {
      const lambda = eigenvalues[mode];
      const modeShape: number[] = [];
      
      for (let i = 0; i <= this.analysisResolution; i++) {
        const x = (i / this.analysisResolution) * L;
        const xi = x / L;
        
        // Mode shape function for cantilever beam
        const phi = Math.cosh(lambda * xi) - Math.cos(lambda * xi) -
                   ((Math.cosh(lambda) + Math.cos(lambda)) / (Math.sinh(lambda) + Math.sin(lambda))) *
                   (Math.sinh(lambda * xi) - Math.sin(lambda * xi));
        
        modeShape.push(phi);
      }
      
      modeShapes.push(modeShape);
    }
    
    return modeShapes;
  }

  private combineStaticDynamicResponse(
    staticAnalysis: Partial<DeformationAnalysis>,
    dynamicAnalysis: Partial<DeformationAnalysis>
  ): DeformationAnalysis {
    return {
      maxDeflection: staticAnalysis.maxDeflection || 0,
      deflectionProfile: staticAnalysis.deflectionProfile || [],
      maxStress: staticAnalysis.maxStress || 0,
      stressDistribution: {
        tensile: { maximum: 0, location: { x: 0, y: 0, z: 0 }, distribution: [] },
        compressive: { maximum: 0, location: { x: 0, y: 0, z: 0 }, distribution: [] },
        shear: { maximum: 0, location: { x: 0, y: 0, z: 0 }, distribution: [] },
        vonMises: { maximum: 0, location: { x: 0, y: 0, z: 0 }, distribution: [] },
      },
      maxStrain: staticAnalysis.maxStrain || 0,
      strainDistribution: [],
      resonantFrequency: dynamicAnalysis.resonantFrequency || 0,
      modeShapes: dynamicAnalysis.modeShapes || [],
      dampingRatio: dynamicAnalysis.dampingRatio || 0.02,
    };
  }

  private calculateMomentAtPosition(x: number, design: StructuralDesign, analysis: DeformationAnalysis): number {
    // Simplified moment calculation - would be more complex in practice
    const L = design.dimensions.length;
    const maxMoment = analysis.maxStress * design.dimensions.thickness / 2;
    
    // Linear variation for cantilever (maximum at fixed end)
    return maxMoment * (1 - x / L);
  }

  private calculateShearForceAtPosition(x: number, design: StructuralDesign, analysis: DeformationAnalysis): number {
    // Simplified shear force calculation
    const L = design.dimensions.length;
    const maxShear = analysis.maxStress * 0.1; // Approximate relationship
    
    return maxShear * (1 - x / L);
  }

  private calculateFirstMoment(y: number, design: StructuralDesign): number {
    const { width, thickness } = design.dimensions;
    const yTop = thickness / 2;
    
    if (y > 0) {
      // Above neutral axis
      const area = width * (yTop - y);
      const centroid = (yTop + y) / 2;
      return area * centroid;
    } else {
      // Below neutral axis
      const area = width * (yTop + Math.abs(y));
      const centroid = (yTop - Math.abs(y)) / 2;
      return area * centroid;
    }
  }

  private estimateFatigueLife(maxStress: number, operatingConditions: VibrationData): number {
    const fatigueStrength = this.material.constants.fatigueStrength || 
                           this.material.constants.yieldStrength * 0.5;
    
    if (maxStress < fatigueStrength) {
      return Infinity; // Infinite life
    }
    
    // S-N curve parameters (simplified)
    const b = -0.1; // Fatigue exponent
    const Sf = fatigueStrength;
    
    const cyclesPerSecond = operatingConditions.frequency.dominant;
    const Nf = Math.pow(maxStress / Sf, 1 / b);
    
    return Nf / cyclesPerSecond; // Convert to seconds
  }

  private calculateReliabilityIndex(safetyFactor: number, fatigueLife: number): number {
    // Simplified reliability calculation
    const safetyReliability = Math.min(1, safetyFactor / 2);
    const fatigueReliability = fatigueLife > 1e8 ? 1 : Math.min(1, fatigueLife / 1e8);
    
    return Math.min(safetyReliability, fatigueReliability);
  }

  private estimateMaintenanceInterval(fatigueLife: number, reliabilityIndex: number): number {
    // Maintenance interval in hours
    const baseMaintenance = 8760; // 1 year in hours
    const fatigueAdjustment = Math.min(10, fatigueLife / 1e6);
    const reliabilityAdjustment = reliabilityIndex;
    
    return baseMaintenance * fatigueAdjustment * reliabilityAdjustment;
  }

  private generateParameterRange(min: number, max: number, steps: number): number[] {
    const range: number[] = [];
    const stepSize = (max - min) / (steps - 1);
    
    for (let i = 0; i < steps; i++) {
      range.push(min + i * stepSize);
    }
    
    return range;
  }

  // Public configuration methods
  public setAnalysisResolution(resolution: number): void {
    this.analysisResolution = Math.max(10, Math.min(1000, resolution));
  }

  public getAnalysisResolution(): number {
    return this.analysisResolution;
  }
}