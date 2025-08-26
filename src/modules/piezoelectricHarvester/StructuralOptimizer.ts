/**
 * Structural Optimizer for Piezoelectric Harvesters
 * 
 * This module implements optimization algorithms for designing optimal
 * piezoelectric harvester structures that maximize energy conversion efficiency
 * while maintaining mechanical reliability.
 */

import { PiezoelectricMaterial } from './MaterialProperties';
import { VibrationData } from './PiezoelectricHarvesterController';

export interface StructuralDesign {
  type: 'cantilever' | 'fixed-fixed' | 'spiral' | 'cymbal' | 'stack';
  dimensions: {
    length: number;      // m
    width: number;       // m  
    thickness: number;   // m
  };
  layerConfiguration: {
    piezoelectricLayers: number;
    substrateThickness: number;    // m
    electrodeThickness: number;    // m
  };
  mountingConfiguration: {
    fixedEnd: 'base' | 'center' | 'both';
    freeEnd: 'tip' | 'none';
    proofMass: number;             // kg
  };
  resonantFrequency: number;       // Hz
}

export interface OptimizationParameters {
  objectives: {
    maximizePowerOutput: number;     // Weight 0-1
    maximizeEfficiency: number;      // Weight 0-1
    minimizeStress: number;          // Weight 0-1
    maximizeReliability: number;     // Weight 0-1
  };
  algorithm: 'genetic' | 'particle_swarm' | 'simulated_annealing' | 'gradient_descent';
  populationSize: number;
  generations: number;
  mutationRate: number;
  crossoverRate: number;
  convergenceTolerance: number;
}

export interface DesignConstraints {
  maxStress: number;               // Pa
  maxDeflection: number;           // m
  minResonantFreq: number;         // Hz
  maxResonantFreq: number;         // Hz
  maxDimensions: {
    length: number;                // m
    width: number;                 // m
    thickness: number;             // m
  };
  minEfficiency: number;           // 0-1
  operatingTemperatureRange: {
    min: number;                   // °C
    max: number;                   // °C
  };
  fatigueLifeCycles: number;       // cycles
}

export interface OptimizationResult {
  success: boolean;
  optimizedDesign?: StructuralDesign;
  improvementPercentage: number;
  convergenceHistory: number[];
  finalObjectiveValue: number;
  constraintViolations: string[];
  computationTime: number;         // ms
  iterations: number;
}

interface Individual {
  design: StructuralDesign;
  fitness: number;
  objectives: {
    powerOutput: number;
    efficiency: number;
    stress: number;
    reliability: number;
  };
  constraintViolations: number;
}

export class StructuralOptimizer {
  private material: PiezoelectricMaterial;
  private constraints: DesignConstraints;
  private optimizationParams: OptimizationParameters;

  constructor(
    material: PiezoelectricMaterial,
    constraints?: Partial<DesignConstraints>
  ) {
    this.material = material;
    this.constraints = this.mergeWithDefaultConstraints(constraints);
    this.optimizationParams = this.getDefaultOptimizationParams();
  }

  /**
   * Main optimization method
   */
  public optimize(
    initialDesign: StructuralDesign,
    targetVibrationProfile: VibrationData,
    objectives?: Partial<OptimizationParameters['objectives']>
  ): OptimizationResult {
    const startTime = Date.now();
    
    // Update objectives if provided
    if (objectives) {
      this.optimizationParams.objectives = { ...this.optimizationParams.objectives, ...objectives };
    }

    try {
      let result: OptimizationResult;

      switch (this.optimizationParams.algorithm) {
        case 'genetic':
          result = this.geneticAlgorithmOptimization(initialDesign, targetVibrationProfile);
          break;
        case 'particle_swarm':
          result = this.particleSwarmOptimization(initialDesign, targetVibrationProfile);
          break;
        case 'simulated_annealing':
          result = this.simulatedAnnealingOptimization(initialDesign, targetVibrationProfile);
          break;
        case 'gradient_descent':
          result = this.gradientDescentOptimization(initialDesign, targetVibrationProfile);
          break;
        default:
          throw new Error(`Unknown optimization algorithm: ${this.optimizationParams.algorithm}`);
      }

      result.computationTime = Date.now() - startTime;
      return result;

    } catch (error) {
      console.error('Optimization failed:', error);
      return {
        success: false,
        improvementPercentage: 0,
        convergenceHistory: [],
        finalObjectiveValue: 0,
        constraintViolations: [error instanceof Error ? error.message : 'Unknown error'],
        computationTime: Date.now() - startTime,
        iterations: 0,
      };
    }
  }

  /**
   * Genetic Algorithm optimization implementation
   */
  private geneticAlgorithmOptimization(
    initialDesign: StructuralDesign,
    targetVibrationProfile: VibrationData
  ): OptimizationResult {
    const { populationSize, generations, mutationRate, crossoverRate, convergenceTolerance } = this.optimizationParams;
    
    // Initialize population
    let population = this.initializePopulation(initialDesign, populationSize);
    
    // Evaluate initial population
    population = population.map(individual => 
      this.evaluateIndividual(individual, targetVibrationProfile)
    );

    const convergenceHistory: number[] = [];
    let bestIndividual = this.getBestIndividual(population);
    const initialFitness = bestIndividual.fitness;

    for (let generation = 0; generation < generations; generation++) {
      // Selection
      const parents = this.tournamentSelection(population, populationSize);
      
      // Crossover and Mutation
      const offspring = this.createOffspring(parents, crossoverRate, mutationRate);
      
      // Evaluate offspring
      const evaluatedOffspring = offspring.map(individual => 
        this.evaluateIndividual(individual, targetVibrationProfile)
      );
      
      // Replacement (elitist strategy)
      population = this.elitistReplacement(population, evaluatedOffspring);
      
      // Track convergence
      const currentBest = this.getBestIndividual(population);
      convergenceHistory.push(currentBest.fitness);
      
      // Check convergence
      if (Math.abs(currentBest.fitness - bestIndividual.fitness) < convergenceTolerance) {
        console.log(`Converged at generation ${generation}`);
        break;
      }
      
      bestIndividual = currentBest;
    }

    const finalBest = this.getBestIndividual(population);
    const improvementPercentage = ((finalBest.fitness - initialFitness) / initialFitness) * 100;

    return {
      success: finalBest.constraintViolations === 0,
      optimizedDesign: finalBest.design,
      improvementPercentage,
      convergenceHistory,
      finalObjectiveValue: finalBest.fitness,
      constraintViolations: this.getConstraintViolationMessages(finalBest.design),
      computationTime: 0, // Will be set by caller
      iterations: convergenceHistory.length,
    };
  }

  /**
   * Particle Swarm Optimization implementation
   */
  private particleSwarmOptimization(
    initialDesign: StructuralDesign,
    targetVibrationProfile: VibrationData
  ): OptimizationResult {
    // Simplified PSO implementation
    const particles = this.initializeParticles(initialDesign, this.optimizationParams.populationSize);
    const convergenceHistory: number[] = [];
    
    let globalBest = particles[0];
    let globalBestFitness = -Infinity;

    for (let iteration = 0; iteration < this.optimizationParams.generations; iteration++) {
      for (const particle of particles) {
        const individual = this.evaluateIndividual(particle, targetVibrationProfile);
        
        if (individual.fitness > globalBestFitness && individual.constraintViolations === 0) {
          globalBest = individual;
          globalBestFitness = individual.fitness;
        }
      }
      
      convergenceHistory.push(globalBestFitness);
      
      // Update particle velocities and positions (simplified)
      this.updateParticles(particles, globalBest);
    }

    return {
      success: globalBest.constraintViolations === 0,
      optimizedDesign: globalBest.design,
      improvementPercentage: 0, // Calculate based on initial vs final
      convergenceHistory,
      finalObjectiveValue: globalBestFitness,
      constraintViolations: this.getConstraintViolationMessages(globalBest.design),
      computationTime: 0,
      iterations: convergenceHistory.length,
    };
  }

  /**
   * Simulated Annealing optimization implementation
   */
  private simulatedAnnealingOptimization(
    initialDesign: StructuralDesign,
    targetVibrationProfile: VibrationData
  ): OptimizationResult {
    let currentDesign = { ...initialDesign };
    let currentIndividual = this.evaluateIndividual({ design: currentDesign, fitness: 0, objectives: {} as any, constraintViolations: 0 }, targetVibrationProfile);
    
    let bestDesign = { ...currentDesign };
    let bestFitness = currentIndividual.fitness;
    
    const convergenceHistory: number[] = [];
    const maxIterations = this.optimizationParams.generations * this.optimizationParams.populationSize;
    
    let temperature = 1000; // Initial temperature
    const coolingRate = 0.95;

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Generate neighbor solution
      const neighborDesign = this.generateNeighborDesign(currentDesign);
      const neighborIndividual = this.evaluateIndividual({ design: neighborDesign, fitness: 0, objectives: {} as any, constraintViolations: 0 }, targetVibrationProfile);
      
      // Accept or reject based on Metropolis criterion
      const deltaFitness = neighborIndividual.fitness - currentIndividual.fitness;
      const acceptanceProbability = deltaFitness > 0 ? 1 : Math.exp(deltaFitness / temperature);
      
      if (Math.random() < acceptanceProbability) {
        currentDesign = neighborDesign;
        currentIndividual = neighborIndividual;
        
        if (currentIndividual.fitness > bestFitness && currentIndividual.constraintViolations === 0) {
          bestDesign = { ...currentDesign };
          bestFitness = currentIndividual.fitness;
        }
      }
      
      convergenceHistory.push(bestFitness);
      temperature *= coolingRate;
    }

    return {
      success: true,
      optimizedDesign: bestDesign,
      improvementPercentage: 0, // Calculate based on initial vs final
      convergenceHistory,
      finalObjectiveValue: bestFitness,
      constraintViolations: this.getConstraintViolationMessages(bestDesign),
      computationTime: 0,
      iterations: convergenceHistory.length,
    };
  }

  /**
   * Gradient Descent optimization implementation
   */
  private gradientDescentOptimization(
    initialDesign: StructuralDesign,
    targetVibrationProfile: VibrationData
  ): OptimizationResult {
    // Simplified gradient descent for continuous variables
    let currentDesign = { ...initialDesign };
    const convergenceHistory: number[] = [];
    const learningRate = 0.01;
    const maxIterations = this.optimizationParams.generations;

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const gradient = this.calculateGradient(currentDesign, targetVibrationProfile);
      
      // Update design parameters
      currentDesign.dimensions.length += learningRate * gradient.length;
      currentDesign.dimensions.width += learningRate * gradient.width;
      currentDesign.dimensions.thickness += learningRate * gradient.thickness;
      currentDesign.mountingConfiguration.proofMass += learningRate * gradient.proofMass;
      
      // Ensure constraints are satisfied
      currentDesign = this.enforceConstraints(currentDesign);
      
      const individual = this.evaluateIndividual({ design: currentDesign, fitness: 0, objectives: {} as any, constraintViolations: 0 }, targetVibrationProfile);
      convergenceHistory.push(individual.fitness);
    }

    return {
      success: true,
      optimizedDesign: currentDesign,
      improvementPercentage: 0,
      convergenceHistory,
      finalObjectiveValue: convergenceHistory[convergenceHistory.length - 1],
      constraintViolations: this.getConstraintViolationMessages(currentDesign),
      computationTime: 0,
      iterations: convergenceHistory.length,
    };
  }

  // Helper methods for optimization algorithms

  private initializePopulation(baseDesign: StructuralDesign, size: number): Individual[] {
    const population: Individual[] = [];
    
    for (let i = 0; i < size; i++) {
      const design = this.generateRandomDesign(baseDesign);
      population.push({
        design,
        fitness: 0,
        objectives: { powerOutput: 0, efficiency: 0, stress: 0, reliability: 0 },
        constraintViolations: 0,
      });
    }
    
    return population;
  }

  private generateRandomDesign(baseDesign: StructuralDesign): StructuralDesign {
    const variationFactor = 0.3; // 30% variation
    
    return {
      ...baseDesign,
      dimensions: {
        length: baseDesign.dimensions.length * (1 + (Math.random() - 0.5) * variationFactor),
        width: baseDesign.dimensions.width * (1 + (Math.random() - 0.5) * variationFactor),
        thickness: baseDesign.dimensions.thickness * (1 + (Math.random() - 0.5) * variationFactor),
      },
      mountingConfiguration: {
        ...baseDesign.mountingConfiguration,
        proofMass: baseDesign.mountingConfiguration.proofMass * (1 + (Math.random() - 0.5) * variationFactor),
      },
    };
  }

  private evaluateIndividual(individual: Individual, vibrationProfile: VibrationData): Individual {
    const design = individual.design;
    
    // Calculate objectives
    const powerOutput = this.calculatePowerOutput(design, vibrationProfile);
    const efficiency = this.calculateEfficiency(design, vibrationProfile);
    const stress = this.calculateMaxStress(design, vibrationProfile);
    const reliability = this.calculateReliability(design, vibrationProfile);
    
    // Calculate weighted fitness
    const objectives = this.optimizationParams.objectives;
    const fitness = 
      objectives.maximizePowerOutput * powerOutput +
      objectives.maximizeEfficiency * efficiency +
      objectives.minimizeStress * (1 - stress) + // Minimize stress, so invert
      objectives.maximizeReliability * reliability;
    
    // Check constraint violations
    const constraintViolations = this.countConstraintViolations(design);
    
    return {
      design,
      fitness: constraintViolations > 0 ? fitness * 0.1 : fitness, // Penalize constraint violations
      objectives: { powerOutput, efficiency, stress, reliability },
      constraintViolations,
    };
  }

  private calculatePowerOutput(design: StructuralDesign, vibrationProfile: VibrationData): number {
    // Simplified power calculation based on piezoelectric equations
    const volume = design.dimensions.length * design.dimensions.width * design.dimensions.thickness;
    const strain = this.calculateStrain(design, vibrationProfile);
    const piezoConstant = this.material.constants.d31;
    
    // Power is proportional to strain squared and volume
    return strain * strain * volume * piezoConstant * 1e6; // Normalized
  }

  private calculateEfficiency(design: StructuralDesign, vibrationProfile: VibrationData): number {
    // Efficiency based on frequency matching and material properties
    const frequencyRatio = vibrationProfile.frequency.dominant / design.resonantFrequency;
    const frequencyResponse = 1 / (1 + Math.pow(frequencyRatio - 1, 2));
    
    return frequencyResponse * this.material.constants.couplingFactor;
  }

  private calculateMaxStress(design: StructuralDesign, vibrationProfile: VibrationData): number {
    // Simplified stress calculation for cantilever beam
    const force = design.mountingConfiguration.proofMass * Math.sqrt(
      vibrationProfile.acceleration.x ** 2 + 
      vibrationProfile.acceleration.y ** 2 + 
      vibrationProfile.acceleration.z ** 2
    );
    
    const momentOfInertia = design.dimensions.width * Math.pow(design.dimensions.thickness, 3) / 12;
    const stress = force * design.dimensions.length * design.dimensions.thickness / (2 * momentOfInertia);
    
    return stress / this.material.constants.yieldStrength; // Normalized
  }

  private calculateReliability(design: StructuralDesign, vibrationProfile: VibrationData): number {
    const stress = this.calculateMaxStress(design, vibrationProfile);
    const safetyFactor = 1 / Math.max(stress, 0.1);
    
    return Math.min(1, safetyFactor / 2); // Normalized reliability score
  }

  private calculateStrain(design: StructuralDesign, vibrationProfile: VibrationData): number {
    // Simplified strain calculation
    const deflection = vibrationProfile.amplitude;
    return deflection / design.dimensions.length;
  }

  private countConstraintViolations(design: StructuralDesign): number {
    let violations = 0;
    
    if (design.dimensions.length > this.constraints.maxDimensions.length) violations++;
    if (design.dimensions.width > this.constraints.maxDimensions.width) violations++;
    if (design.dimensions.thickness > this.constraints.maxDimensions.thickness) violations++;
    if (design.resonantFrequency < this.constraints.minResonantFreq) violations++;
    if (design.resonantFrequency > this.constraints.maxResonantFreq) violations++;
    
    return violations;
  }

  private getConstraintViolationMessages(design: StructuralDesign): string[] {
    const violations: string[] = [];
    
    if (design.dimensions.length > this.constraints.maxDimensions.length) {
      violations.push(`Length exceeds maximum: ${design.dimensions.length}m > ${this.constraints.maxDimensions.length}m`);
    }
    if (design.dimensions.width > this.constraints.maxDimensions.width) {
      violations.push(`Width exceeds maximum: ${design.dimensions.width}m > ${this.constraints.maxDimensions.width}m`);
    }
    if (design.dimensions.thickness > this.constraints.maxDimensions.thickness) {
      violations.push(`Thickness exceeds maximum: ${design.dimensions.thickness}m > ${this.constraints.maxDimensions.thickness}m`);
    }
    
    return violations;
  }

  // Additional helper methods for genetic algorithm
  private tournamentSelection(population: Individual[], size: number): Individual[] {
    const selected: Individual[] = [];
    const tournamentSize = 3;
    
    for (let i = 0; i < size; i++) {
      const tournament: Individual[] = [];
      for (let j = 0; j < tournamentSize; j++) {
        const randomIndex = Math.floor(Math.random() * population.length);
        tournament.push(population[randomIndex]);
      }
      
      tournament.sort((a, b) => b.fitness - a.fitness);
      selected.push(tournament[0]);
    }
    
    return selected;
  }

  private createOffspring(parents: Individual[], crossoverRate: number, mutationRate: number): Individual[] {
    const offspring: Individual[] = [];
    
    for (let i = 0; i < parents.length; i += 2) {
      const parent1 = parents[i];
      const parent2 = parents[i + 1] || parents[0];
      
      let child1 = { ...parent1 };
      let child2 = { ...parent2 };
      
      // Crossover
      if (Math.random() < crossoverRate) {
        [child1, child2] = this.crossover(parent1, parent2);
      }
      
      // Mutation
      if (Math.random() < mutationRate) {
        child1 = this.mutate(child1);
      }
      if (Math.random() < mutationRate) {
        child2 = this.mutate(child2);
      }
      
      offspring.push(child1, child2);
    }
    
    return offspring.slice(0, parents.length);
  }

  private crossover(parent1: Individual, parent2: Individual): [Individual, Individual] {
    const child1: Individual = {
      design: {
        ...parent1.design,
        dimensions: {
          length: (parent1.design.dimensions.length + parent2.design.dimensions.length) / 2,
          width: parent1.design.dimensions.width,
          thickness: parent2.design.dimensions.thickness,
        },
      },
      fitness: 0,
      objectives: { powerOutput: 0, efficiency: 0, stress: 0, reliability: 0 },
      constraintViolations: 0,
    };
    
    const child2: Individual = {
      design: {
        ...parent2.design,
        dimensions: {
          length: (parent1.design.dimensions.length + parent2.design.dimensions.length) / 2,
          width: parent2.design.dimensions.width,
          thickness: parent1.design.dimensions.thickness,
        },
      },
      fitness: 0,
      objectives: { powerOutput: 0, efficiency: 0, stress: 0, reliability: 0 },
      constraintViolations: 0,
    };
    
    return [child1, child2];
  }

  private mutate(individual: Individual): Individual {
    const mutationStrength = 0.1;
    const mutated = { ...individual };
    
    // Mutate dimensions
    if (Math.random() < 0.5) {
      mutated.design.dimensions.length *= (1 + (Math.random() - 0.5) * mutationStrength);
    }
    if (Math.random() < 0.5) {
      mutated.design.dimensions.width *= (1 + (Math.random() - 0.5) * mutationStrength);
    }
    if (Math.random() < 0.5) {
      mutated.design.dimensions.thickness *= (1 + (Math.random() - 0.5) * mutationStrength);
    }
    
    return mutated;
  }

  private elitistReplacement(population: Individual[], offspring: Individual[]): Individual[] {
    const combined = [...population, ...offspring];
    combined.sort((a, b) => b.fitness - a.fitness);
    return combined.slice(0, population.length);
  }

  private getBestIndividual(population: Individual[]): Individual {
    return population.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    );
  }

  // Helper methods for other algorithms
  private initializeParticles(baseDesign: StructuralDesign, count: number): Individual[] {
    return this.initializePopulation(baseDesign, count);
  }

  private updateParticles(particles: Individual[], globalBest: Individual): void {
    // Simplified particle update - in practice would include velocity vectors
    particles.forEach(particle => {
      const alpha = 0.1;
      particle.design.dimensions.length += alpha * (globalBest.design.dimensions.length - particle.design.dimensions.length);
      particle.design.dimensions.width += alpha * (globalBest.design.dimensions.width - particle.design.dimensions.width);
      particle.design.dimensions.thickness += alpha * (globalBest.design.dimensions.thickness - particle.design.dimensions.thickness);
    });
  }

  private generateNeighborDesign(design: StructuralDesign): StructuralDesign {
    const neighbor = { ...design };
    const perturbation = 0.05;
    
    // Randomly perturb one parameter
    const parameter = Math.floor(Math.random() * 4);
    switch (parameter) {
      case 0:
        neighbor.dimensions.length *= (1 + (Math.random() - 0.5) * perturbation);
        break;
      case 1:
        neighbor.dimensions.width *= (1 + (Math.random() - 0.5) * perturbation);
        break;
      case 2:
        neighbor.dimensions.thickness *= (1 + (Math.random() - 0.5) * perturbation);
        break;
      case 3:
        neighbor.mountingConfiguration.proofMass *= (1 + (Math.random() - 0.5) * perturbation);
        break;
    }
    
    return this.enforceConstraints(neighbor);
  }

  private calculateGradient(design: StructuralDesign, vibrationProfile: VibrationData): {
    length: number;
    width: number;
    thickness: number;
    proofMass: number;
  } {
    // Simplified numerical gradient calculation
    const epsilon = 1e-6;
    const baseObjective = this.calculateObjectiveFunction(design, vibrationProfile);
    
    // Length gradient
    const lengthPerturbed = { ...design };
    lengthPerturbed.dimensions.length += epsilon;
    const lengthGradient = (this.calculateObjectiveFunction(lengthPerturbed, vibrationProfile) - baseObjective) / epsilon;
    
    // Width gradient
    const widthPerturbed = { ...design };
    widthPerturbed.dimensions.width += epsilon;
    const widthGradient = (this.calculateObjectiveFunction(widthPerturbed, vibrationProfile) - baseObjective) / epsilon;
    
    // Thickness gradient
    const thicknessPerturbed = { ...design };
    thicknessPerturbed.dimensions.thickness += epsilon;
    const thicknessGradient = (this.calculateObjectiveFunction(thicknessPerturbed, vibrationProfile) - baseObjective) / epsilon;
    
    // Proof mass gradient
    const massPerturbed = { ...design };
    massPerturbed.mountingConfiguration.proofMass += epsilon;
    const massGradient = (this.calculateObjectiveFunction(massPerturbed, vibrationProfile) - baseObjective) / epsilon;
    
    return {
      length: lengthGradient,
      width: widthGradient,
      thickness: thicknessGradient,
      proofMass: massGradient,
    };
  }

  private calculateObjectiveFunction(design: StructuralDesign, vibrationProfile: VibrationData): number {
    const powerOutput = this.calculatePowerOutput(design, vibrationProfile);
    const efficiency = this.calculateEfficiency(design, vibrationProfile);
    const stress = this.calculateMaxStress(design, vibrationProfile);
    const reliability = this.calculateReliability(design, vibrationProfile);
    
    const objectives = this.optimizationParams.objectives;
    return objectives.maximizePowerOutput * powerOutput +
           objectives.maximizeEfficiency * efficiency +
           objectives.minimizeStress * (1 - stress) +
           objectives.maximizeReliability * reliability;
  }

  private enforceConstraints(design: StructuralDesign): StructuralDesign {
    const constrained = { ...design };
    
    // Enforce dimension constraints
    constrained.dimensions.length = Math.min(constrained.dimensions.length, this.constraints.maxDimensions.length);
    constrained.dimensions.width = Math.min(constrained.dimensions.width, this.constraints.maxDimensions.width);
    constrained.dimensions.thickness = Math.min(constrained.dimensions.thickness, this.constraints.maxDimensions.thickness);
    
    // Ensure positive values
    constrained.dimensions.length = Math.max(constrained.dimensions.length, 0.001);
    constrained.dimensions.width = Math.max(constrained.dimensions.width, 0.001);
    constrained.dimensions.thickness = Math.max(constrained.dimensions.thickness, 0.0001);
    constrained.mountingConfiguration.proofMass = Math.max(constrained.mountingConfiguration.proofMass, 0);
    
    return constrained;
  }

  private mergeWithDefaultConstraints(constraints?: Partial<DesignConstraints>): DesignConstraints {
    const defaults: DesignConstraints = {
      maxStress: 50e6,
      maxDeflection: 0.005,
      minResonantFreq: 10,
      maxResonantFreq: 1000,
      maxDimensions: { length: 0.2, width: 0.05, thickness: 0.005 },
      minEfficiency: 0.1,
      operatingTemperatureRange: { min: -40, max: 85 },
      fatigueLifeCycles: 1e8,
    };
    
    return { ...defaults, ...constraints };
  }

  private getDefaultOptimizationParams(): OptimizationParameters {
    return {
      objectives: {
        maximizePowerOutput: 1.0,
        maximizeEfficiency: 0.8,
        minimizeStress: 0.6,
        maximizeReliability: 0.9,
      },
      algorithm: 'genetic',
      populationSize: 100,
      generations: 50,
      mutationRate: 0.1,
      crossoverRate: 0.8,
      convergenceTolerance: 1e-6,
    };
  }

  // Public methods for configuration
  public updateOptimizationParameters(params: Partial<OptimizationParameters>): void {
    this.optimizationParams = { ...this.optimizationParams, ...params };
  }

  public updateConstraints(constraints: Partial<DesignConstraints>): void {
    this.constraints = { ...this.constraints, ...constraints };
  }

  public getConstraints(): DesignConstraints {
    return { ...this.constraints };
  }

  public getOptimizationParameters(): OptimizationParameters {
    return { ...this.optimizationParams };
  }
}