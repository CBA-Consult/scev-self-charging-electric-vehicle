/**
 * Turbine Placement Optimizer
 * 
 * Optimizes turbine placement using advanced algorithms including
 * genetic algorithms, particle swarm optimization, and hybrid approaches.
 */

import { GeneticAlgorithmOptimizer, ParticleSwarmOptimizer } from '../fuzzyControl/OptimizationAlgorithms';
import {
  WindFarmSite,
  WindFarmLayout,
  TurbinePosition,
  WindTurbineSpecification
} from './types/WindFarmTypes';

import {
  WindFarmOptimizationParameters,
  WindFarmOptimizationObjectives,
  OptimizationSettings,
  OptimizationIndividual
} from './types/OptimizationTypes';

export class TurbinePlacementOptimizer {
  
  /**
   * Optimize turbine placement using genetic algorithm
   */
  public async optimizeWithGeneticAlgorithm(
    initialLayouts: WindFarmLayout[],
    site: WindFarmSite,
    parameters: WindFarmOptimizationParameters,
    objectives: WindFarmOptimizationObjectives,
    settings: OptimizationSettings
  ): Promise<WindFarmLayout> {
    console.log('Optimizing turbine placement with genetic algorithm...');
    
    // Initialize population from initial layouts
    let population = this.initializePopulation(initialLayouts, settings.populationSize);
    
    const convergenceHistory: number[] = [];
    let bestIndividual = this.getBestIndividual(population);
    
    for (let generation = 0; generation < settings.maxGenerations; generation++) {
      console.log(`Generation ${generation + 1}/${settings.maxGenerations}`);
      
      // Evaluate population
      population = await this.evaluatePopulation(population, site, objectives);
      
      // Selection
      const parents = this.tournamentSelection(population, settings.populationSize);
      
      // Crossover
      let offspring = this.crossover(parents, settings.crossoverRate);
      
      // Mutation
      offspring = this.mutate(offspring, settings.mutationRate, parameters);
      
      // Evaluate offspring
      offspring = await this.evaluatePopulation(offspring, site, objectives);
      
      // Replacement (elitist strategy)
      population = this.replacement(population, offspring, settings.elitismRate);
      
      // Update best individual
      const currentBest = this.getBestIndividual(population);
      if (currentBest.fitness > bestIndividual.fitness) {
        bestIndividual = currentBest;
      }
      
      convergenceHistory.push(bestIndividual.fitness);
      
      // Check convergence
      if (this.checkConvergence(convergenceHistory, settings.convergenceThreshold)) {
        console.log(`Converged at generation ${generation + 1}`);
        break;
      }
    }
    
    return bestIndividual.layout;
  }

  /**
   * Optimize turbine placement using particle swarm optimization
   */
  public async optimizeWithParticleSwarm(
    initialLayouts: WindFarmLayout[],
    site: WindFarmSite,
    parameters: WindFarmOptimizationParameters,
    objectives: WindFarmOptimizationObjectives,
    settings: OptimizationSettings
  ): Promise<WindFarmLayout> {
    console.log('Optimizing turbine placement with particle swarm optimization...');
    
    // Initialize swarm
    const swarm = this.initializeSwarm(initialLayouts, settings.populationSize);
    let globalBest = await this.evaluateLayout(swarm[0].layout, site, objectives);
    
    const convergenceHistory: number[] = [];
    
    for (let iteration = 0; iteration < settings.maxGenerations; iteration++) {
      console.log(`Iteration ${iteration + 1}/${settings.maxGenerations}`);
      
      for (const particle of swarm) {
        // Evaluate particle
        const fitness = await this.evaluateLayout(particle.layout, site, objectives);
        
        // Update personal best
        if (fitness > particle.personalBestFitness) {
          particle.personalBest = this.layoutToPosition(particle.layout);
          particle.personalBestFitness = fitness;
        }
        
        // Update global best
        if (fitness > globalBest.fitness) {
          globalBest = {
            layout: particle.layout,
            fitness: fitness
          };
        }
      }
      
      // Update particle velocities and positions
      this.updateSwarm(swarm, this.layoutToPosition(globalBest.layout));
      
      convergenceHistory.push(globalBest.fitness);
      
      // Check convergence
      if (this.checkConvergence(convergenceHistory, settings.convergenceThreshold)) {
        console.log(`Converged at iteration ${iteration + 1}`);
        break;
      }
    }
    
    return globalBest.layout;
  }

  /**
   * Optimize turbine placement using gradient-based optimization
   */
  public async optimizeWithGradientDescent(
    initialLayout: WindFarmLayout,
    site: WindFarmSite,
    parameters: WindFarmOptimizationParameters,
    objectives: WindFarmOptimizationObjectives,
    settings: OptimizationSettings
  ): Promise<WindFarmLayout> {
    console.log('Optimizing turbine placement with gradient descent...');
    
    let currentLayout = { ...initialLayout };
    const convergenceHistory: number[] = [];
    const learningRate = 0.01;
    
    for (let iteration = 0; iteration < settings.maxGenerations; iteration++) {
      console.log(`Iteration ${iteration + 1}/${settings.maxGenerations}`);
      
      // Calculate numerical gradient
      const gradient = await this.calculateNumericalGradient(currentLayout, site, objectives);
      
      // Update turbine positions
      currentLayout = this.updateLayoutWithGradient(currentLayout, gradient, learningRate);
      
      // Evaluate current layout
      const fitness = await this.evaluateLayout(currentLayout, site, objectives);
      convergenceHistory.push(fitness);
      
      // Check convergence
      if (iteration > 0 && 
          Math.abs(convergenceHistory[iteration] - convergenceHistory[iteration - 1]) < settings.convergenceThreshold) {
        console.log(`Converged at iteration ${iteration + 1}`);
        break;
      }
    }
    
    return currentLayout;
  }

  /**
   * Optimize using hybrid approach combining multiple algorithms
   */
  public async optimizeWithHybridApproach(
    initialLayouts: WindFarmLayout[],
    site: WindFarmSite,
    parameters: WindFarmOptimizationParameters,
    objectives: WindFarmOptimizationObjectives,
    settings: OptimizationSettings
  ): Promise<WindFarmLayout> {
    console.log('Optimizing turbine placement with hybrid approach...');
    
    // Phase 1: Global exploration with genetic algorithm
    console.log('Phase 1: Global exploration with GA...');
    const gaSettings = { ...settings, maxGenerations: Math.floor(settings.maxGenerations * 0.6) };
    const gaResult = await this.optimizeWithGeneticAlgorithm(
      initialLayouts, site, parameters, objectives, gaSettings
    );
    
    // Phase 2: Local refinement with gradient descent
    console.log('Phase 2: Local refinement with gradient descent...');
    const gdSettings = { ...settings, maxGenerations: Math.floor(settings.maxGenerations * 0.4) };
    const finalResult = await this.optimizeWithGradientDescent(
      gaResult, site, parameters, objectives, gdSettings
    );
    
    return finalResult;
  }

  // Private helper methods

  private initializePopulation(
    initialLayouts: WindFarmLayout[],
    populationSize: number
  ): OptimizationIndividual[] {
    const population: OptimizationIndividual[] = [];
    
    // Use initial layouts as starting points
    for (let i = 0; i < populationSize; i++) {
      const baseLayout = initialLayouts[i % initialLayouts.length];
      const individual: OptimizationIndividual = {
        layout: this.perturbLayout(baseLayout, 0.1), // Add small random perturbations
        fitness: 0,
        objectives: {},
        constraints: {},
        feasible: true,
        generation: 0
      };
      population.push(individual);
    }
    
    return population;
  }

  private initializeSwarm(
    initialLayouts: WindFarmLayout[],
    swarmSize: number
  ): any[] {
    const swarm = [];
    
    for (let i = 0; i < swarmSize; i++) {
      const baseLayout = initialLayouts[i % initialLayouts.length];
      const particle = {
        layout: this.perturbLayout(baseLayout, 0.1),
        velocity: this.generateRandomVelocity(baseLayout.turbines.length),
        personalBest: this.layoutToPosition(baseLayout),
        personalBestFitness: -Infinity
      };
      swarm.push(particle);
    }
    
    return swarm;
  }

  private async evaluatePopulation(
    population: OptimizationIndividual[],
    site: WindFarmSite,
    objectives: WindFarmOptimizationObjectives
  ): Promise<OptimizationIndividual[]> {
    for (const individual of population) {
      individual.fitness = await this.evaluateLayout(individual.layout, site, objectives);
      individual.feasible = this.checkLayoutFeasibility(individual.layout, site);
      
      if (!individual.feasible) {
        individual.fitness *= 0.1; // Heavy penalty for infeasible solutions
      }
    }
    
    return population;
  }

  private async evaluateLayout(
    layout: WindFarmLayout,
    site: WindFarmSite,
    objectives: WindFarmOptimizationObjectives
  ): Promise<number> {
    // Simplified evaluation - in practice would use comprehensive models
    let fitness = 0;
    
    // Energy production objective
    const energyProduction = this.calculateEnergyProduction(layout, site);
    if (objectives.maximizeEnergyProduction.weight > 0) {
      fitness += objectives.maximizeEnergyProduction.weight * energyProduction / 1000000; // Normalize
    }
    
    // Wake loss minimization
    const wakeLoss = this.calculateWakeLoss(layout, site);
    if (objectives.minimizeWakeLoss.weight > 0) {
      fitness += objectives.minimizeWakeLoss.weight * (1 - wakeLoss);
    }
    
    // Economic objective (simplified)
    const economicValue = energyProduction * 50 - layout.turbines.length * 2000000; // Simple NPV
    if (objectives.maximizeNPV.weight > 0) {
      fitness += objectives.maximizeNPV.weight * economicValue / 100000000; // Normalize
    }
    
    // Environmental penalties
    const environmentalPenalty = this.calculateEnvironmentalPenalty(layout, site);
    fitness -= environmentalPenalty;
    
    return fitness;
  }

  private tournamentSelection(
    population: OptimizationIndividual[],
    selectionSize: number
  ): OptimizationIndividual[] {
    const selected: OptimizationIndividual[] = [];
    const tournamentSize = 3;
    
    for (let i = 0; i < selectionSize; i++) {
      const tournament: OptimizationIndividual[] = [];
      
      for (let j = 0; j < tournamentSize; j++) {
        const randomIndex = Math.floor(Math.random() * population.length);
        tournament.push(population[randomIndex]);
      }
      
      // Select best from tournament
      tournament.sort((a, b) => b.fitness - a.fitness);
      selected.push({ ...tournament[0] });
    }
    
    return selected;
  }

  private crossover(
    parents: OptimizationIndividual[],
    crossoverRate: number
  ): OptimizationIndividual[] {
    const offspring: OptimizationIndividual[] = [];
    
    for (let i = 0; i < parents.length; i += 2) {
      const parent1 = parents[i];
      const parent2 = parents[i + 1] || parents[0];
      
      if (Math.random() < crossoverRate) {
        const [child1, child2] = this.uniformCrossover(parent1, parent2);
        offspring.push(child1, child2);
      } else {
        offspring.push({ ...parent1 }, { ...parent2 });
      }
    }
    
    return offspring.slice(0, parents.length);
  }

  private uniformCrossover(
    parent1: OptimizationIndividual,
    parent2: OptimizationIndividual
  ): [OptimizationIndividual, OptimizationIndividual] {
    const child1: OptimizationIndividual = {
      layout: { ...parent1.layout, turbines: [] },
      fitness: 0,
      objectives: {},
      constraints: {},
      feasible: true,
      generation: parent1.generation + 1
    };
    
    const child2: OptimizationIndividual = {
      layout: { ...parent2.layout, turbines: [] },
      fitness: 0,
      objectives: {},
      constraints: {},
      feasible: true,
      generation: parent2.generation + 1
    };
    
    // Crossover turbine positions
    const minTurbines = Math.min(parent1.layout.turbines.length, parent2.layout.turbines.length);
    
    for (let i = 0; i < minTurbines; i++) {
      if (Math.random() < 0.5) {
        child1.layout.turbines.push({ ...parent1.layout.turbines[i] });
        child2.layout.turbines.push({ ...parent2.layout.turbines[i] });
      } else {
        child1.layout.turbines.push({ ...parent2.layout.turbines[i] });
        child2.layout.turbines.push({ ...parent1.layout.turbines[i] });
      }
    }
    
    return [child1, child2];
  }

  private mutate(
    offspring: OptimizationIndividual[],
    mutationRate: number,
    parameters: WindFarmOptimizationParameters
  ): OptimizationIndividual[] {
    for (const individual of offspring) {
      if (Math.random() < mutationRate) {
        this.gaussianMutation(individual, parameters);
      }
    }
    
    return offspring;
  }

  private gaussianMutation(
    individual: OptimizationIndividual,
    parameters: WindFarmOptimizationParameters
  ): void {
    const mutationStrength = 0.1;
    
    for (const turbine of individual.layout.turbines) {
      // Mutate position
      if (Math.random() < 0.3) {
        const deltaX = this.gaussianRandom() * mutationStrength * 500; // 500m standard deviation
        const deltaY = this.gaussianRandom() * mutationStrength * 500;
        
        turbine.x += deltaX;
        turbine.y += deltaY;
        
        // Ensure turbine stays within site boundaries
        turbine.x = Math.max(0, Math.min(5000, turbine.x)); // Simplified bounds
        turbine.y = Math.max(0, Math.min(5000, turbine.y));
      }
    }
  }

  private replacement(
    population: OptimizationIndividual[],
    offspring: OptimizationIndividual[],
    elitismRate: number
  ): OptimizationIndividual[] {
    const eliteCount = Math.floor(population.length * elitismRate);
    
    // Sort population by fitness
    population.sort((a, b) => b.fitness - a.fitness);
    offspring.sort((a, b) => b.fitness - a.fitness);
    
    // Keep elite individuals and best offspring
    const newPopulation = [
      ...population.slice(0, eliteCount),
      ...offspring.slice(0, population.length - eliteCount)
    ];
    
    return newPopulation;
  }

  private getBestIndividual(population: OptimizationIndividual[]): OptimizationIndividual {
    return population.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    );
  }

  private checkConvergence(history: number[], threshold: number): boolean {
    if (history.length < 10) return false;
    
    const recent = history.slice(-10);
    const improvement = recent[recent.length - 1] - recent[0];
    
    return Math.abs(improvement) < threshold;
  }

  private perturbLayout(layout: WindFarmLayout, perturbationStrength: number): WindFarmLayout {
    const perturbedLayout = { ...layout, turbines: [] };
    
    for (const turbine of layout.turbines) {
      const perturbedTurbine = { ...turbine };
      perturbedTurbine.x += (Math.random() - 0.5) * perturbationStrength * 1000;
      perturbedTurbine.y += (Math.random() - 0.5) * perturbationStrength * 1000;
      perturbedLayout.turbines.push(perturbedTurbine);
    }
    
    return perturbedLayout;
  }

  private generateRandomVelocity(turbineCount: number): number[] {
    return Array.from({ length: turbineCount * 2 }, () => (Math.random() - 0.5) * 100);
  }

  private layoutToPosition(layout: WindFarmLayout): number[] {
    const position: number[] = [];
    for (const turbine of layout.turbines) {
      position.push(turbine.x, turbine.y);
    }
    return position;
  }

  private updateSwarm(swarm: any[], globalBestPosition: number[]): void {
    const inertiaWeight = 0.9;
    const cognitiveWeight = 2.0;
    const socialWeight = 2.0;
    
    for (const particle of swarm) {
      const position = this.layoutToPosition(particle.layout);
      
      for (let i = 0; i < position.length; i++) {
        const r1 = Math.random();
        const r2 = Math.random();
        
        particle.velocity[i] = inertiaWeight * particle.velocity[i] +
          cognitiveWeight * r1 * (particle.personalBest[i] - position[i]) +
          socialWeight * r2 * (globalBestPosition[i] - position[i]);
        
        position[i] += particle.velocity[i];
      }
      
      // Update particle layout
      this.positionToLayout(position, particle.layout);
    }
  }

  private positionToLayout(position: number[], layout: WindFarmLayout): void {
    for (let i = 0; i < layout.turbines.length; i++) {
      layout.turbines[i].x = position[i * 2];
      layout.turbines[i].y = position[i * 2 + 1];
    }
  }

  private async calculateNumericalGradient(
    layout: WindFarmLayout,
    site: WindFarmSite,
    objectives: WindFarmOptimizationObjectives
  ): Promise<number[]> {
    const epsilon = 10; // 10 meter perturbation
    const gradient: number[] = [];
    
    const baseFitness = await this.evaluateLayout(layout, site, objectives);
    
    for (let i = 0; i < layout.turbines.length; i++) {
      // X gradient
      const layoutX = { ...layout };
      layoutX.turbines[i].x += epsilon;
      const fitnessX = await this.evaluateLayout(layoutX, site, objectives);
      gradient.push((fitnessX - baseFitness) / epsilon);
      
      // Y gradient
      const layoutY = { ...layout };
      layoutY.turbines[i].y += epsilon;
      const fitnessY = await this.evaluateLayout(layoutY, site, objectives);
      gradient.push((fitnessY - baseFitness) / epsilon);
    }
    
    return gradient;
  }

  private updateLayoutWithGradient(
    layout: WindFarmLayout,
    gradient: number[],
    learningRate: number
  ): WindFarmLayout {
    const updatedLayout = { ...layout, turbines: [] };
    
    for (let i = 0; i < layout.turbines.length; i++) {
      const turbine = { ...layout.turbines[i] };
      turbine.x += learningRate * gradient[i * 2];
      turbine.y += learningRate * gradient[i * 2 + 1];
      
      // Ensure turbine stays within bounds
      turbine.x = Math.max(0, Math.min(5000, turbine.x));
      turbine.y = Math.max(0, Math.min(5000, turbine.y));
      
      updatedLayout.turbines.push(turbine);
    }
    
    return updatedLayout;
  }

  private checkLayoutFeasibility(layout: WindFarmLayout, site: WindFarmSite): boolean {
    // Check minimum spacing constraints
    const minSpacing = 300; // 300 meters minimum spacing
    
    for (let i = 0; i < layout.turbines.length; i++) {
      for (let j = i + 1; j < layout.turbines.length; j++) {
        const distance = Math.sqrt(
          Math.pow(layout.turbines[i].x - layout.turbines[j].x, 2) +
          Math.pow(layout.turbines[i].y - layout.turbines[j].y, 2)
        );
        
        if (distance < minSpacing) {
          return false;
        }
      }
    }
    
    return true;
  }

  private calculateEnergyProduction(layout: WindFarmLayout, site: WindFarmSite): number {
    // Simplified energy production calculation
    let totalProduction = 0;
    
    for (const turbine of layout.turbines) {
      // Base production from wind resource
      const baseProduction = site.windResource.meanWindSpeed * 1000 * 8760; // Simplified
      
      // Apply wake losses (simplified)
      const wakeLoss = this.calculateTurbineWakeLoss(turbine, layout.turbines, site);
      const actualProduction = baseProduction * (1 - wakeLoss);
      
      totalProduction += actualProduction;
    }
    
    return totalProduction;
  }

  private calculateWakeLoss(layout: WindFarmLayout, site: WindFarmSite): number {
    let totalWakeLoss = 0;
    
    for (const turbine of layout.turbines) {
      const wakeLoss = this.calculateTurbineWakeLoss(turbine, layout.turbines, site);
      totalWakeLoss += wakeLoss;
    }
    
    return totalWakeLoss / layout.turbines.length;
  }

  private calculateTurbineWakeLoss(
    turbine: TurbinePosition,
    allTurbines: TurbinePosition[],
    site: WindFarmSite
  ): number {
    let wakeLoss = 0;
    const dominantDirection = site.windResource.windRose[0]?.direction || 0;
    
    for (const otherTurbine of allTurbines) {
      if (otherTurbine.id === turbine.id) continue;
      
      // Check if other turbine is upstream
      const angle = Math.atan2(turbine.y - otherTurbine.y, turbine.x - otherTurbine.x) * 180 / Math.PI;
      const angleDiff = Math.abs(angle - dominantDirection);
      
      if (angleDiff < 30) { // Within wake cone
        const distance = Math.sqrt(
          Math.pow(turbine.x - otherTurbine.x, 2) + Math.pow(turbine.y - otherTurbine.y, 2)
        );
        
        // Simplified wake model
        const rotorDiameter = turbine.turbineSpec.rotorDiameter;
        const wakeDeficit = 0.5 * Math.exp(-distance / (5 * rotorDiameter));
        wakeLoss += wakeDeficit;
      }
    }
    
    return Math.min(wakeLoss, 0.8); // Cap at 80% loss
  }

  private calculateEnvironmentalPenalty(layout: WindFarmLayout, site: WindFarmSite): number {
    let penalty = 0;
    
    // Noise penalty (simplified)
    for (const turbine of layout.turbines) {
      // Check distance to sensitive receptors
      // This would be more sophisticated in practice
      penalty += 0.01; // Small penalty per turbine
    }
    
    return penalty;
  }

  private gaussianRandom(): number {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}