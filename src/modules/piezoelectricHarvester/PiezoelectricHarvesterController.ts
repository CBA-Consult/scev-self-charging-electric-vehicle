/**
 * Piezoelectric Harvester Controller
 * 
 * Main controller for managing piezoelectric energy harvesting operations,
 * including structural optimization, vibration analysis, and power generation.
 */

import { StructuralOptimizer, StructuralDesign, DesignConstraints, OptimizationResult } from './StructuralOptimizer';
import { MaterialProperties, PiezoelectricMaterial } from './MaterialProperties';
import { FlexuralAnalysis, DeformationAnalysis, ReliabilityMetrics } from './FlexuralAnalysis';

export interface VibrationData {
  acceleration: {
    x: number;  // m/s² - lateral
    y: number;  // m/s² - longitudinal
    z: number;  // m/s² - vertical
  };
  frequency: {
    dominant: number;      // Hz - dominant frequency
    harmonics: number[];   // Hz - harmonic frequencies
  };
  amplitude: number;       // m - vibration amplitude
  duration: number;        // s - measurement duration
  samplingRate: number;    // Hz - data sampling rate
  temperatureAmbient: number; // °C
  humidity: number;        // % relative humidity
}

export interface HarvesterInputs {
  vibrationData: VibrationData;
  loadResistance: number;     // Ω - electrical load resistance
  operatingMode: 'continuous' | 'intermittent' | 'resonant';
  environmentalConditions: {
    temperature: number;      // °C
    pressure: number;         // Pa
    corrosiveEnvironment: boolean;
  };
}

export interface ElectricalOutput {
  voltage: number;            // V - output voltage
  current: number;            // A - output current
  power: number;              // W - instantaneous power
  energy: number;             // J - accumulated energy
  efficiency: number;         // % - conversion efficiency
  powerDensity: number;       // W/m³ - power per unit volume
}

export interface HarvesterOutputs {
  electricalOutput: ElectricalOutput;
  mechanicalResponse: {
    deflection: number;       // m - maximum deflection
    stress: number;           // Pa - maximum stress
    strain: number;           // - maximum strain
    resonantFrequency: number; // Hz - actual resonant frequency
  };
  structuralHealth: {
    fatigueIndex: number;     // 0-1 (1 = no fatigue)
    reliabilityScore: number; // 0-1 (1 = fully reliable)
    remainingLifeCycles: number; // cycles until failure
    maintenanceRequired: boolean;
  };
  optimizationStatus: {
    isOptimal: boolean;
    improvementPotential: number; // % potential improvement
    recommendedAdjustments: string[];
  };
}

export class PiezoelectricHarvesterController {
  private structuralOptimizer: StructuralOptimizer;
  private materialProperties: MaterialProperties;
  private flexuralAnalysis: FlexuralAnalysis;
  private currentDesign: StructuralDesign;
  private material: PiezoelectricMaterial;
  private operationHistory: HarvesterOutputs[] = [];
  private totalEnergyHarvested: number = 0;
  private totalOperatingTime: number = 0;

  constructor(
    materialType: string,
    initialDesign: StructuralDesign,
    constraints?: Partial<DesignConstraints>
  ) {
    this.materialProperties = new MaterialProperties();
    this.material = this.materialProperties.getMaterial(materialType);
    this.currentDesign = initialDesign;
    
    this.structuralOptimizer = new StructuralOptimizer(this.material, constraints);
    this.flexuralAnalysis = new FlexuralAnalysis(this.material);
    
    // Validate initial design
    this.validateDesign(this.currentDesign);
  }

  /**
   * Main processing cycle for energy harvesting
   */
  public processHarvestingCycle(inputs: HarvesterInputs): HarvesterOutputs {
    try {
      // Validate inputs
      this.validateInputs(inputs);

      // Analyze vibration characteristics
      const vibrationAnalysis = this.analyzeVibrationSpectrum(inputs.vibrationData);

      // Perform flexural analysis for current design
      const deformationAnalysis = this.flexuralAnalysis.analyzeDeformation(
        this.currentDesign,
        inputs.vibrationData
      );

      // Calculate electrical output
      const electricalOutput = this.calculateElectricalOutput(
        deformationAnalysis,
        inputs.loadResistance,
        inputs.vibrationData
      );

      // Assess structural health and reliability
      const structuralHealth = this.assessStructuralHealth(
        deformationAnalysis,
        inputs.vibrationData
      );

      // Check optimization status
      const optimizationStatus = this.evaluateOptimizationStatus(
        electricalOutput,
        deformationAnalysis
      );

      // Update operation history
      const outputs: HarvesterOutputs = {
        electricalOutput,
        mechanicalResponse: {
          deflection: deformationAnalysis.maxDeflection,
          stress: deformationAnalysis.maxStress,
          strain: deformationAnalysis.maxStrain,
          resonantFrequency: deformationAnalysis.resonantFrequency,
        },
        structuralHealth,
        optimizationStatus,
      };

      this.updateOperationHistory(outputs, inputs.vibrationData.duration);
      
      return outputs;

    } catch (error) {
      console.error('Error in harvesting cycle:', error);
      return this.generateFailsafeOutputs();
    }
  }

  /**
   * Optimize the structural design for given operating conditions
   */
  public optimizeStructuralDesign(
    targetVibrationProfile: VibrationData,
    optimizationObjectives?: Partial<{
      maximizePowerOutput: number;
      maximizeEfficiency: number;
      minimizeStress: number;
      maximizeReliability: number;
    }>
  ): OptimizationResult {
    const result = this.structuralOptimizer.optimize(
      this.currentDesign,
      targetVibrationProfile,
      optimizationObjectives
    );

    if (result.success && result.optimizedDesign) {
      this.currentDesign = result.optimizedDesign;
      console.log(`Design optimization completed. Power improvement: ${result.improvementPercentage}%`);
    }

    return result;
  }

  /**
   * Evaluate different structural designs and recommend the best one
   */
  public evaluateStructuralDesigns(
    designCandidates: StructuralDesign[],
    operatingConditions: VibrationData
  ): {
    rankings: Array<{
      design: StructuralDesign;
      score: number;
      powerOutput: number;
      efficiency: number;
      reliability: number;
    }>;
    recommendedDesign: StructuralDesign;
  } {
    const evaluations = designCandidates.map(design => {
      const deformationAnalysis = this.flexuralAnalysis.analyzeDeformation(design, operatingConditions);
      const electricalOutput = this.calculateElectricalOutput(deformationAnalysis, 1000, operatingConditions);
      const reliability = this.calculateReliabilityScore(deformationAnalysis);
      
      const score = this.calculateDesignScore(electricalOutput, reliability, deformationAnalysis);
      
      return {
        design,
        score,
        powerOutput: electricalOutput.power,
        efficiency: electricalOutput.efficiency,
        reliability,
      };
    });

    // Sort by score (highest first)
    evaluations.sort((a, b) => b.score - a.score);

    return {
      rankings: evaluations,
      recommendedDesign: evaluations[0].design,
    };
  }

  /**
   * Analyze vibration spectrum to identify optimal harvesting frequencies
   */
  private analyzeVibrationSpectrum(vibrationData: VibrationData): {
    dominantFrequency: number;
    powerSpectralDensity: number[];
    optimalHarvestingFrequencies: number[];
  } {
    const { frequency, acceleration } = vibrationData;
    
    // Calculate total acceleration magnitude
    const totalAcceleration = Math.sqrt(
      acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2
    );

    // Identify optimal harvesting frequencies (near resonance)
    const optimalFrequencies = [frequency.dominant, ...frequency.harmonics]
      .filter(freq => Math.abs(freq - this.currentDesign.resonantFrequency) < 10);

    return {
      dominantFrequency: frequency.dominant,
      powerSpectralDensity: this.calculatePowerSpectralDensity(vibrationData),
      optimalHarvestingFrequencies: optimalFrequencies,
    };
  }

  /**
   * Calculate electrical output based on mechanical deformation
   */
  private calculateElectricalOutput(
    deformationAnalysis: DeformationAnalysis,
    loadResistance: number,
    vibrationData: VibrationData
  ): ElectricalOutput {
    const { maxStrain, maxStress, resonantFrequency } = deformationAnalysis;
    
    // Piezoelectric voltage generation (using d31 coefficient)
    const piezoVoltage = this.material.constants.d31 * maxStress * this.currentDesign.dimensions.thickness;
    
    // Account for frequency response
    const frequencyResponse = this.calculateFrequencyResponse(
      vibrationData.frequency.dominant,
      resonantFrequency
    );
    
    const effectiveVoltage = piezoVoltage * frequencyResponse;
    
    // Calculate current and power
    const internalResistance = this.calculateInternalResistance();
    const current = effectiveVoltage / (loadResistance + internalResistance);
    const power = effectiveVoltage * current * Math.cos(0); // Assuming resistive load
    
    // Calculate efficiency
    const mechanicalPower = this.calculateMechanicalInputPower(vibrationData);
    const efficiency = mechanicalPower > 0 ? (power / mechanicalPower) * 100 : 0;
    
    // Calculate power density
    const volume = this.currentDesign.dimensions.length * 
                   this.currentDesign.dimensions.width * 
                   this.currentDesign.dimensions.thickness;
    const powerDensity = power / volume;

    return {
      voltage: effectiveVoltage,
      current,
      power,
      energy: power * vibrationData.duration,
      efficiency,
      powerDensity,
    };
  }

  /**
   * Assess structural health and reliability
   */
  private assessStructuralHealth(
    deformationAnalysis: DeformationAnalysis,
    vibrationData: VibrationData
  ): HarvesterOutputs['structuralHealth'] {
    const { maxStress, maxStrain } = deformationAnalysis;
    
    // Calculate fatigue index based on stress cycles
    const stressRatio = maxStress / this.material.constants.yieldStrength;
    const fatigueIndex = Math.max(0, 1 - Math.pow(stressRatio, 2));
    
    // Calculate reliability score
    const reliabilityScore = this.calculateReliabilityScore(deformationAnalysis);
    
    // Estimate remaining life cycles using Palmgren-Miner rule
    const stressCycles = vibrationData.frequency.dominant * vibrationData.duration;
    const remainingLifeCycles = this.estimateRemainingLifeCycles(maxStress, stressCycles);
    
    // Determine maintenance requirements
    const maintenanceRequired = fatigueIndex < 0.7 || reliabilityScore < 0.8;

    return {
      fatigueIndex,
      reliabilityScore,
      remainingLifeCycles,
      maintenanceRequired,
    };
  }

  /**
   * Evaluate current optimization status
   */
  private evaluateOptimizationStatus(
    electricalOutput: ElectricalOutput,
    deformationAnalysis: DeformationAnalysis
  ): HarvesterOutputs['optimizationStatus'] {
    const currentPerformance = this.calculatePerformanceMetric(electricalOutput, deformationAnalysis);
    const theoreticalMaximum = this.calculateTheoreticalMaximum();
    
    const improvementPotential = Math.max(0, 
      ((theoreticalMaximum - currentPerformance) / theoreticalMaximum) * 100
    );
    
    const isOptimal = improvementPotential < 5; // Less than 5% improvement potential
    
    const recommendedAdjustments = this.generateOptimizationRecommendations(
      electricalOutput,
      deformationAnalysis
    );

    return {
      isOptimal,
      improvementPotential,
      recommendedAdjustments,
    };
  }

  // Helper methods
  private validateDesign(design: StructuralDesign): void {
    if (!design || !design.dimensions || !design.layerConfiguration) {
      throw new Error('Invalid structural design configuration');
    }
  }

  private validateInputs(inputs: HarvesterInputs): void {
    if (!inputs.vibrationData || !inputs.vibrationData.acceleration) {
      throw new Error('Invalid vibration data provided');
    }
    if (inputs.loadResistance <= 0) {
      throw new Error('Load resistance must be positive');
    }
  }

  private calculatePowerSpectralDensity(vibrationData: VibrationData): number[] {
    // Simplified PSD calculation - in practice would use FFT
    const frequencies = [vibrationData.frequency.dominant, ...vibrationData.frequency.harmonics];
    return frequencies.map(freq => Math.pow(vibrationData.amplitude, 2) / freq);
  }

  private calculateFrequencyResponse(inputFreq: number, resonantFreq: number): number {
    const frequencyRatio = inputFreq / resonantFreq;
    const dampingRatio = 0.05; // Typical damping ratio for piezoelectric materials
    
    return 1 / Math.sqrt(
      Math.pow(1 - frequencyRatio ** 2, 2) + 
      Math.pow(2 * dampingRatio * frequencyRatio, 2)
    );
  }

  private calculateInternalResistance(): number {
    // Simplified internal resistance calculation
    const volume = this.currentDesign.dimensions.length * 
                   this.currentDesign.dimensions.width * 
                   this.currentDesign.dimensions.thickness;
    return 1000 / volume; // Ω - inversely proportional to volume
  }

  private calculateMechanicalInputPower(vibrationData: VibrationData): number {
    const totalAcceleration = Math.sqrt(
      vibrationData.acceleration.x ** 2 + 
      vibrationData.acceleration.y ** 2 + 
      vibrationData.acceleration.z ** 2
    );
    
    const force = this.currentDesign.mountingConfiguration.proofMass * totalAcceleration;
    const velocity = vibrationData.amplitude * 2 * Math.PI * vibrationData.frequency.dominant;
    
    return force * velocity;
  }

  private calculateReliabilityScore(deformationAnalysis: DeformationAnalysis): number {
    const stressRatio = deformationAnalysis.maxStress / this.material.constants.yieldStrength;
    const strainRatio = deformationAnalysis.maxStrain / this.material.constants.maxStrain;
    
    return Math.max(0, 1 - Math.max(stressRatio, strainRatio));
  }

  private estimateRemainingLifeCycles(maxStress: number, currentCycles: number): number {
    // Simplified S-N curve calculation
    const stressAmplitude = maxStress / 2;
    const fatigueStrength = this.material.constants.fatigueStrength || this.material.constants.yieldStrength * 0.5;
    
    if (stressAmplitude < fatigueStrength) {
      return Infinity; // Infinite life
    }
    
    const fatigueExponent = -0.1; // Typical value for ceramics
    const totalLifeCycles = Math.pow(stressAmplitude / fatigueStrength, 1 / fatigueExponent);
    
    return Math.max(0, totalLifeCycles - currentCycles);
  }

  private calculatePerformanceMetric(
    electricalOutput: ElectricalOutput,
    deformationAnalysis: DeformationAnalysis
  ): number {
    // Weighted performance metric combining power, efficiency, and reliability
    const powerWeight = 0.4;
    const efficiencyWeight = 0.3;
    const reliabilityWeight = 0.3;
    
    const normalizedPower = Math.min(1, electricalOutput.power / 0.001); // Normalize to 1mW
    const normalizedEfficiency = electricalOutput.efficiency / 100;
    const normalizedReliability = this.calculateReliabilityScore(deformationAnalysis);
    
    return powerWeight * normalizedPower + 
           efficiencyWeight * normalizedEfficiency + 
           reliabilityWeight * normalizedReliability;
  }

  private calculateTheoreticalMaximum(): number {
    // Theoretical maximum performance based on material properties
    return 1.0; // Normalized maximum
  }

  private calculateDesignScore(
    electricalOutput: ElectricalOutput,
    reliability: number,
    deformationAnalysis: DeformationAnalysis
  ): number {
    return this.calculatePerformanceMetric(electricalOutput, deformationAnalysis) * reliability;
  }

  private generateOptimizationRecommendations(
    electricalOutput: ElectricalOutput,
    deformationAnalysis: DeformationAnalysis
  ): string[] {
    const recommendations: string[] = [];
    
    if (electricalOutput.efficiency < 20) {
      recommendations.push('Consider adjusting resonant frequency to match dominant vibration frequency');
    }
    
    if (deformationAnalysis.maxStress > this.material.constants.yieldStrength * 0.8) {
      recommendations.push('Reduce stress levels by increasing beam thickness or reducing proof mass');
    }
    
    if (electricalOutput.power < 0.0001) {
      recommendations.push('Increase proof mass or beam length to enhance power output');
    }
    
    return recommendations;
  }

  private updateOperationHistory(outputs: HarvesterOutputs, duration: number): void {
    this.operationHistory.push(outputs);
    this.totalEnergyHarvested += outputs.electricalOutput.energy;
    this.totalOperatingTime += duration;
    
    // Keep only last 1000 records
    if (this.operationHistory.length > 1000) {
      this.operationHistory.shift();
    }
  }

  private generateFailsafeOutputs(): HarvesterOutputs {
    return {
      electricalOutput: {
        voltage: 0,
        current: 0,
        power: 0,
        energy: 0,
        efficiency: 0,
        powerDensity: 0,
      },
      mechanicalResponse: {
        deflection: 0,
        stress: 0,
        strain: 0,
        resonantFrequency: this.currentDesign.resonantFrequency,
      },
      structuralHealth: {
        fatigueIndex: 0,
        reliabilityScore: 0,
        remainingLifeCycles: 0,
        maintenanceRequired: true,
      },
      optimizationStatus: {
        isOptimal: false,
        improvementPotential: 100,
        recommendedAdjustments: ['System error - requires maintenance'],
      },
    };
  }

  // Public getters for system monitoring
  public getCurrentDesign(): StructuralDesign {
    return { ...this.currentDesign };
  }

  public getMaterial(): PiezoelectricMaterial {
    return { ...this.material };
  }

  public getTotalEnergyHarvested(): number {
    return this.totalEnergyHarvested;
  }

  public getAverageEfficiency(): number {
    if (this.operationHistory.length === 0) return 0;
    
    const totalEfficiency = this.operationHistory.reduce(
      (sum, record) => sum + record.electricalOutput.efficiency, 0
    );
    
    return totalEfficiency / this.operationHistory.length;
  }
}