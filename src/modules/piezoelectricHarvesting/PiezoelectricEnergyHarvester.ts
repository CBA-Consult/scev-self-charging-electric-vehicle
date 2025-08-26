/**
 * Piezoelectric Energy Harvesting System
 * 
 * This module implements comprehensive modeling and performance optimization
 * of piezoelectric energy harvesting systems for electric vehicles.
 * 
 * Features:
 * - Analytical modeling of piezoelectric energy conversion
 * - Numerical optimization algorithms
 * - Multi-source energy harvesting (road, suspension, tire deformation)
 * - Performance optimization and reliability enhancement
 */

/**
 * Piezoelectric material properties and characteristics
 */
export interface PiezoelectricMaterial {
  name: string;
  piezoelectricConstant: number;    // d33 coefficient (pC/N)
  dielectricConstant: number;       // εr relative permittivity
  elasticModulus: number;           // Young's modulus (GPa)
  density: number;                  // kg/m³
  couplingCoefficient: number;      // k33 electromechanical coupling
  qualityFactor: number;            // Q mechanical quality factor
  curiTemperature: number;          // °C - Curie temperature
  maxStress: number;                // MPa - maximum allowable stress
}

/**
 * Piezoelectric harvester configuration
 */
export interface HarvesterConfiguration {
  type: 'cantilever' | 'stack' | 'cymbal' | 'bimorph';
  dimensions: {
    length: number;     // mm
    width: number;      // mm
    thickness: number;  // mm
  };
  material: PiezoelectricMaterial;
  resonantFrequency: number;        // Hz - natural frequency
  dampingRatio: number;             // ζ damping ratio
  loadResistance: number;           // Ω optimal load resistance
  capacitance: number;              // nF internal capacitance
}

/**
 * Environmental conditions affecting harvester performance
 */
export interface EnvironmentalConditions {
  temperature: number;              // °C ambient temperature
  humidity: number;                 // % relative humidity
  vibrationFrequency: number;       // Hz dominant frequency
  accelerationAmplitude: number;    // m/s² RMS acceleration
  stressAmplitude: number;          // MPa applied stress
  roadSurfaceType: 'smooth' | 'rough' | 'highway' | 'city';
  vehicleSpeed: number;             // km/h
}

/**
 * Harvester performance metrics
 */
export interface HarvesterPerformance {
  instantaneousPower: number;       // W current power output
  averagePower: number;             // W average power over time
  peakPower: number;                // W maximum power capability
  efficiency: number;               // % energy conversion efficiency
  powerDensity: number;             // W/cm³ power per unit volume
  energyDensity: number;            // J/cm³ energy storage capability
  reliability: number;              // % system reliability factor
  lifespan: number;                 // hours estimated operational life
}

/**
 * Multi-source harvesting system inputs
 */
export interface MultiSourceInputs {
  roadVibrations: {
    frequency: number;              // Hz
    amplitude: number;              // m/s²
    powerSpectralDensity: number[]; // (m/s²)²/Hz
  };
  suspensionMovement: {
    displacement: number;           // mm
    velocity: number;               // mm/s
    force: number;                  // N
  };
  tireDeformation: {
    contactPressure: number;        // MPa
    deformationRate: number;        // Hz
    rollingResistance: number;      // N
  };
  engineVibrations: {
    frequency: number;              // Hz
    amplitude: number;              // m/s²
  };
}

/**
 * System optimization parameters
 */
export interface OptimizationParameters {
  targetPowerOutput: number;        // W desired power output
  maxWeight: number;                // kg weight constraint
  maxVolume: number;                // cm³ volume constraint
  minReliability: number;           // % minimum reliability
  operatingTemperatureRange: {
    min: number;                    // °C
    max: number;                    // °C
  };
  costConstraint: number;           // $ maximum cost
}

/**
 * Advanced piezoelectric energy harvesting system
 */
export class PiezoelectricEnergyHarvester {
  private harvesters: Map<string, HarvesterConfiguration>;
  private materials: Map<string, PiezoelectricMaterial>;
  private performanceHistory: HarvesterPerformance[];
  private optimizationAlgorithm: 'genetic' | 'particle_swarm' | 'simulated_annealing';
  private systemReliability: number;

  constructor() {
    this.harvesters = new Map();
    this.materials = new Map();
    this.performanceHistory = [];
    this.optimizationAlgorithm = 'genetic';
    this.systemReliability = 0.95;
    
    this.initializePiezoelectricMaterials();
    this.initializeHarvesterConfigurations();
  }

  /**
   * Initialize standard piezoelectric materials database
   */
  private initializePiezoelectricMaterials(): void {
    // PZT-5H (Lead Zirconate Titanate) - High sensitivity
    this.materials.set('PZT-5H', {
      name: 'PZT-5H',
      piezoelectricConstant: 593,      // pC/N
      dielectricConstant: 3400,
      elasticModulus: 60.6,            // GPa
      density: 7500,                   // kg/m³
      couplingCoefficient: 0.75,
      qualityFactor: 65,
      curiTemperature: 193,            // °C
      maxStress: 110                   // MPa
    });

    // PZT-4 (Lead Zirconate Titanate) - High power
    this.materials.set('PZT-4', {
      name: 'PZT-4',
      piezoelectricConstant: 289,
      dielectricConstant: 1300,
      elasticModulus: 81.3,
      density: 7500,
      couplingCoefficient: 0.70,
      qualityFactor: 500,
      curiTemperature: 328,
      maxStress: 140
    });

    // PVDF (Polyvinylidene Fluoride) - Flexible polymer
    this.materials.set('PVDF', {
      name: 'PVDF',
      piezoelectricConstant: 33,
      dielectricConstant: 12,
      elasticModulus: 2.0,
      density: 1780,
      couplingCoefficient: 0.12,
      qualityFactor: 10,
      curiTemperature: 80,
      maxStress: 50
    });

    // PMN-PT (Lead Magnesium Niobate-Lead Titanate) - Single crystal
    this.materials.set('PMN-PT', {
      name: 'PMN-PT',
      piezoelectricConstant: 1500,
      dielectricConstant: 5000,
      elasticModulus: 90,
      density: 8100,
      couplingCoefficient: 0.92,
      qualityFactor: 100,
      curiTemperature: 130,
      maxStress: 25
    });
  }

  /**
   * Initialize standard harvester configurations
   */
  private initializeHarvesterConfigurations(): void {
    const pztMaterial = this.materials.get('PZT-5H')!;

    // Road vibration cantilever harvester
    this.harvesters.set('road_cantilever', {
      type: 'cantilever',
      dimensions: { length: 50, width: 20, thickness: 0.5 },
      material: pztMaterial,
      resonantFrequency: 25,           // Hz - typical road vibration frequency
      dampingRatio: 0.02,
      loadResistance: 100000,          // Ω
      capacitance: 47                  // nF
    });

    // Suspension stack harvester
    this.harvesters.set('suspension_stack', {
      type: 'stack',
      dimensions: { length: 30, width: 30, thickness: 10 },
      material: pztMaterial,
      resonantFrequency: 2,            // Hz - suspension frequency
      dampingRatio: 0.05,
      loadResistance: 50000,
      capacitance: 220
    });

    // Tire deformation cymbal harvester
    this.harvesters.set('tire_cymbal', {
      type: 'cymbal',
      dimensions: { length: 25, width: 25, thickness: 2 },
      material: pztMaterial,
      resonantFrequency: 100,          // Hz - tire rotation frequency
      dampingRatio: 0.03,
      loadResistance: 75000,
      capacitance: 100
    });
  }

  /**
   * Analytical modeling of piezoelectric energy conversion
   */
  public calculatePiezoelectricPower(
    harvesterConfig: HarvesterConfiguration,
    environmentalConditions: EnvironmentalConditions
  ): HarvesterPerformance {
    // Calculate mechanical-to-electrical energy conversion
    const mechanicalPower = this.calculateMechanicalPower(harvesterConfig, environmentalConditions);
    const electricalPower = this.calculateElectricalPower(harvesterConfig, mechanicalPower);
    
    // Calculate efficiency factors
    const temperatureEffect = this.calculateTemperatureEffect(
      harvesterConfig.material,
      environmentalConditions.temperature
    );
    const frequencyResponse = this.calculateFrequencyResponse(
      harvesterConfig,
      environmentalConditions.vibrationFrequency
    );
    const loadMatching = this.calculateLoadMatching(harvesterConfig);
    
    // Apply efficiency corrections
    const efficiency = temperatureEffect * frequencyResponse * loadMatching;
    const actualPower = electricalPower * efficiency;
    
    // Calculate performance metrics
    const volume = this.calculateHarvesterVolume(harvesterConfig);
    const powerDensity = actualPower / volume;
    
    // Estimate reliability based on stress levels
    const reliability = this.calculateReliability(harvesterConfig, environmentalConditions);
    
    return {
      instantaneousPower: actualPower,
      averagePower: actualPower * 0.7,     // Account for variability
      peakPower: actualPower * 1.5,
      efficiency: efficiency * 100,
      powerDensity,
      energyDensity: powerDensity * 3600,  // Assuming 1-hour storage
      reliability: reliability * 100,
      lifespan: this.estimateLifespan(harvesterConfig, environmentalConditions)
    };
  }

  /**
   * Calculate mechanical power input to harvester
   */
  private calculateMechanicalPower(
    config: HarvesterConfiguration,
    conditions: EnvironmentalConditions
  ): number {
    const { material, dimensions } = config;
    const volume = (dimensions.length * dimensions.width * dimensions.thickness) / 1000; // cm³
    const mass = volume * material.density / 1000; // kg
    
    // Calculate force based on acceleration and harvester type
    let force: number;
    switch (config.type) {
      case 'cantilever':
        force = mass * conditions.accelerationAmplitude;
        break;
      case 'stack':
        force = conditions.stressAmplitude * (dimensions.width * dimensions.length) / 1000; // N
        break;
      case 'cymbal':
        force = conditions.stressAmplitude * Math.PI * Math.pow(dimensions.width / 2, 2) / 1000;
        break;
      case 'bimorph':
        force = mass * conditions.accelerationAmplitude * 2; // Dual layer effect
        break;
      default:
        force = mass * conditions.accelerationAmplitude;
    }
    
    // Calculate velocity amplitude from frequency and displacement
    const omega = 2 * Math.PI * conditions.vibrationFrequency;
    const displacement = conditions.accelerationAmplitude / Math.pow(omega, 2);
    const velocity = omega * displacement;
    
    return force * velocity; // Mechanical power (W)
  }

  /**
   * Calculate electrical power output from mechanical input
   */
  private calculateElectricalPower(
    config: HarvesterConfiguration,
    mechanicalPower: number
  ): number {
    const { material } = config;
    
    // Piezoelectric power conversion using coupling coefficient
    const conversionEfficiency = Math.pow(material.couplingCoefficient, 2);
    const electricalPower = mechanicalPower * conversionEfficiency;
    
    // Account for quality factor (energy losses)
    const qualityEffect = material.qualityFactor / (material.qualityFactor + 1);
    
    return electricalPower * qualityEffect;
  }

  /**
   * Calculate temperature effect on piezoelectric performance
   */
  private calculateTemperatureEffect(
    material: PiezoelectricMaterial,
    temperature: number
  ): number {
    // Piezoelectric coefficient decreases with temperature
    const tempRatio = temperature / material.curiTemperature;
    
    if (temperature >= material.curiTemperature) {
      return 0; // Complete loss of piezoelectric properties
    }
    
    // Linear approximation of temperature dependence
    return Math.max(0.1, 1 - 0.5 * tempRatio);
  }

  /**
   * Calculate frequency response of harvester
   */
  private calculateFrequencyResponse(
    config: HarvesterConfiguration,
    excitationFrequency: number
  ): number {
    const frequencyRatio = excitationFrequency / config.resonantFrequency;
    const dampingRatio = config.dampingRatio;
    
    // Frequency response function for damped harmonic oscillator
    const numerator = Math.pow(frequencyRatio, 2);
    const denominator = Math.pow((1 - Math.pow(frequencyRatio, 2)), 2) + 
                       Math.pow(2 * dampingRatio * frequencyRatio, 2);
    
    return numerator / Math.sqrt(denominator);
  }

  /**
   * Calculate load matching efficiency
   */
  private calculateLoadMatching(config: HarvesterConfiguration): number {
    // Optimal load resistance for maximum power transfer
    const internalResistance = 1 / (2 * Math.PI * config.resonantFrequency * config.capacitance * 1e-9);
    const loadRatio = config.loadResistance / internalResistance;
    
    // Power transfer efficiency
    return (4 * loadRatio) / Math.pow(1 + loadRatio, 2);
  }

  /**
   * Calculate harvester volume
   */
  private calculateHarvesterVolume(config: HarvesterConfiguration): number {
    const { dimensions } = config;
    return (dimensions.length * dimensions.width * dimensions.thickness) / 1000; // cm³
  }

  /**
   * Calculate system reliability
   */
  private calculateReliability(
    config: HarvesterConfiguration,
    conditions: EnvironmentalConditions
  ): number {
    const stressRatio = conditions.stressAmplitude / config.material.maxStress;
    const temperatureRatio = conditions.temperature / config.material.curiTemperature;
    
    // Reliability decreases with stress and temperature
    const stressReliability = Math.max(0.5, 1 - stressRatio);
    const temperatureReliability = Math.max(0.7, 1 - temperatureRatio);
    
    return stressReliability * temperatureReliability;
  }

  /**
   * Estimate operational lifespan
   */
  private estimateLifespan(
    config: HarvesterConfiguration,
    conditions: EnvironmentalConditions
  ): number {
    const baseLifespan = 87600; // 10 years in hours
    const stressRatio = conditions.stressAmplitude / config.material.maxStress;
    const temperatureRatio = conditions.temperature / config.material.curiTemperature;
    
    // Lifespan reduction factors
    const stressFactor = Math.pow(1 - stressRatio, 2);
    const temperatureFactor = Math.pow(1 - temperatureRatio, 1.5);
    
    return baseLifespan * stressFactor * temperatureFactor;
  }

  /**
   * Multi-source energy harvesting optimization
   */
  public optimizeMultiSourceHarvesting(
    inputs: MultiSourceInputs,
    constraints: OptimizationParameters
  ): {
    optimalConfiguration: Map<string, HarvesterConfiguration>;
    totalPowerOutput: number;
    systemEfficiency: number;
    reliabilityScore: number;
  } {
    const optimizedHarvesters = new Map<string, HarvesterConfiguration>();
    let totalPower = 0;
    let totalEfficiency = 0;
    let reliabilityProduct = 1;

    // Optimize road vibration harvester
    const roadConfig = this.optimizeForVibrationSource(
      inputs.roadVibrations,
      constraints,
      'road'
    );
    optimizedHarvesters.set('road', roadConfig);

    // Optimize suspension harvester
    const suspensionConfig = this.optimizeForMechanicalSource(
      inputs.suspensionMovement,
      constraints,
      'suspension'
    );
    optimizedHarvesters.set('suspension', suspensionConfig);

    // Optimize tire deformation harvester
    const tireConfig = this.optimizeForPressureSource(
      inputs.tireDeformation,
      constraints,
      'tire'
    );
    optimizedHarvesters.set('tire', tireConfig);

    // Calculate combined performance
    for (const [source, config] of optimizedHarvesters) {
      const conditions = this.createEnvironmentalConditions(inputs, source);
      const performance = this.calculatePiezoelectricPower(config, conditions);
      
      totalPower += performance.instantaneousPower;
      totalEfficiency += performance.efficiency;
      reliabilityProduct *= performance.reliability / 100;
    }

    return {
      optimalConfiguration: optimizedHarvesters,
      totalPowerOutput: totalPower,
      systemEfficiency: totalEfficiency / optimizedHarvesters.size,
      reliabilityScore: reliabilityProduct * 100
    };
  }

  /**
   * Optimize harvester for vibration source
   */
  private optimizeForVibrationSource(
    vibrationInput: MultiSourceInputs['roadVibrations'],
    constraints: OptimizationParameters,
    sourceType: string
  ): HarvesterConfiguration {
    const baseConfig = this.harvesters.get(`${sourceType}_cantilever`)!;
    
    // Genetic algorithm optimization
    return this.geneticAlgorithmOptimization(
      baseConfig,
      vibrationInput.frequency,
      vibrationInput.amplitude,
      constraints
    );
  }

  /**
   * Optimize harvester for mechanical source
   */
  private optimizeForMechanicalSource(
    mechanicalInput: MultiSourceInputs['suspensionMovement'],
    constraints: OptimizationParameters,
    sourceType: string
  ): HarvesterConfiguration {
    const baseConfig = this.harvesters.get(`${sourceType}_stack`)!;
    
    // Particle swarm optimization
    return this.particleSwarmOptimization(
      baseConfig,
      mechanicalInput.force,
      mechanicalInput.velocity,
      constraints
    );
  }

  /**
   * Optimize harvester for pressure source
   */
  private optimizeForPressureSource(
    pressureInput: MultiSourceInputs['tireDeformation'],
    constraints: OptimizationParameters,
    sourceType: string
  ): HarvesterConfiguration {
    const baseConfig = this.harvesters.get(`${sourceType}_cymbal`)!;
    
    // Simulated annealing optimization
    return this.simulatedAnnealingOptimization(
      baseConfig,
      pressureInput.contactPressure,
      pressureInput.deformationRate,
      constraints
    );
  }

  /**
   * Genetic algorithm optimization for harvester parameters
   */
  private geneticAlgorithmOptimization(
    baseConfig: HarvesterConfiguration,
    frequency: number,
    amplitude: number,
    constraints: OptimizationParameters
  ): HarvesterConfiguration {
    const populationSize = 50;
    const generations = 100;
    const mutationRate = 0.1;
    const crossoverRate = 0.8;

    // Initialize population
    let population = this.initializePopulation(baseConfig, populationSize);
    
    for (let gen = 0; gen < generations; gen++) {
      // Evaluate fitness
      const fitness = population.map(config => 
        this.evaluateFitness(config, frequency, amplitude, constraints)
      );
      
      // Selection
      const parents = this.tournamentSelection(population, fitness, populationSize / 2);
      
      // Crossover and mutation
      const offspring = this.crossoverAndMutation(parents, crossoverRate, mutationRate);
      
      // Combine and select next generation
      population = this.selectNextGeneration([...parents, ...offspring], constraints);
    }

    // Return best configuration
    const finalFitness = population.map(config => 
      this.evaluateFitness(config, frequency, amplitude, constraints)
    );
    const bestIndex = finalFitness.indexOf(Math.max(...finalFitness));
    
    return population[bestIndex];
  }

  /**
   * Particle swarm optimization for harvester parameters
   */
  private particleSwarmOptimization(
    baseConfig: HarvesterConfiguration,
    force: number,
    velocity: number,
    constraints: OptimizationParameters
  ): HarvesterConfiguration {
    const swarmSize = 30;
    const iterations = 100;
    const inertiaWeight = 0.9;
    const cognitiveWeight = 2.0;
    const socialWeight = 2.0;

    // Initialize swarm
    const particles = this.initializeSwarm(baseConfig, swarmSize);
    let globalBest = { ...baseConfig };
    let globalBestFitness = -Infinity;

    for (let iter = 0; iter < iterations; iter++) {
      for (const particle of particles) {
        // Evaluate fitness
        const fitness = this.evaluateFitness(particle.position, force, velocity, constraints);
        
        // Update personal best
        if (fitness > particle.bestFitness) {
          particle.bestPosition = { ...particle.position };
          particle.bestFitness = fitness;
        }
        
        // Update global best
        if (fitness > globalBestFitness) {
          globalBest = { ...particle.position };
          globalBestFitness = fitness;
        }
        
        // Update velocity and position
        this.updateParticleVelocity(particle, globalBest, inertiaWeight, cognitiveWeight, socialWeight);
        this.updateParticlePosition(particle, constraints);
      }
    }

    return globalBest;
  }

  /**
   * Simulated annealing optimization for harvester parameters
   */
  private simulatedAnnealingOptimization(
    baseConfig: HarvesterConfiguration,
    pressure: number,
    deformationRate: number,
    constraints: OptimizationParameters
  ): HarvesterConfiguration {
    const initialTemperature = 1000;
    const finalTemperature = 1;
    const coolingRate = 0.95;
    const maxIterations = 1000;

    let currentConfig = { ...baseConfig };
    let bestConfig = { ...baseConfig };
    let currentFitness = this.evaluateFitness(currentConfig, pressure, deformationRate, constraints);
    let bestFitness = currentFitness;
    let temperature = initialTemperature;

    for (let iter = 0; iter < maxIterations && temperature > finalTemperature; iter++) {
      // Generate neighbor solution
      const neighborConfig = this.generateNeighborSolution(currentConfig, constraints);
      const neighborFitness = this.evaluateFitness(neighborConfig, pressure, deformationRate, constraints);
      
      // Accept or reject neighbor
      const deltaFitness = neighborFitness - currentFitness;
      if (deltaFitness > 0 || Math.random() < Math.exp(deltaFitness / temperature)) {
        currentConfig = neighborConfig;
        currentFitness = neighborFitness;
        
        if (neighborFitness > bestFitness) {
          bestConfig = { ...neighborConfig };
          bestFitness = neighborFitness;
        }
      }
      
      // Cool down
      temperature *= coolingRate;
    }

    return bestConfig;
  }

  /**
   * Create environmental conditions from multi-source inputs
   */
  private createEnvironmentalConditions(
    inputs: MultiSourceInputs,
    sourceType: string
  ): EnvironmentalConditions {
    switch (sourceType) {
      case 'road':
        return {
          temperature: 25,
          humidity: 50,
          vibrationFrequency: inputs.roadVibrations.frequency,
          accelerationAmplitude: inputs.roadVibrations.amplitude,
          stressAmplitude: 10,
          roadSurfaceType: 'highway',
          vehicleSpeed: 80
        };
      case 'suspension':
        return {
          temperature: 30,
          humidity: 40,
          vibrationFrequency: 2,
          accelerationAmplitude: 5,
          stressAmplitude: inputs.suspensionMovement.force / 1000, // Convert to MPa
          roadSurfaceType: 'city',
          vehicleSpeed: 50
        };
      case 'tire':
        return {
          temperature: 35,
          humidity: 30,
          vibrationFrequency: inputs.tireDeformation.deformationRate,
          accelerationAmplitude: 8,
          stressAmplitude: inputs.tireDeformation.contactPressure,
          roadSurfaceType: 'rough',
          vehicleSpeed: 60
        };
      default:
        throw new Error(`Unknown source type: ${sourceType}`);
    }
  }

  // Helper methods for optimization algorithms would be implemented here
  // (initializePopulation, evaluateFitness, tournamentSelection, etc.)
  // These are simplified for brevity but would contain full implementations

  private initializePopulation(baseConfig: HarvesterConfiguration, size: number): HarvesterConfiguration[] {
    // Implementation would create varied configurations
    return Array(size).fill(null).map(() => ({ ...baseConfig }));
  }

  private evaluateFitness(
    config: HarvesterConfiguration,
    param1: number,
    param2: number,
    constraints: OptimizationParameters
  ): number {
    // Implementation would calculate fitness based on power output, efficiency, and constraints
    return Math.random(); // Placeholder
  }

  private tournamentSelection(
    population: HarvesterConfiguration[],
    fitness: number[],
    count: number
  ): HarvesterConfiguration[] {
    // Implementation would perform tournament selection
    return population.slice(0, count);
  }

  private crossoverAndMutation(
    parents: HarvesterConfiguration[],
    crossoverRate: number,
    mutationRate: number
  ): HarvesterConfiguration[] {
    // Implementation would perform genetic operations
    return parents;
  }

  private selectNextGeneration(
    combined: HarvesterConfiguration[],
    constraints: OptimizationParameters
  ): HarvesterConfiguration[] {
    // Implementation would select best configurations
    return combined.slice(0, 50);
  }

  private initializeSwarm(baseConfig: HarvesterConfiguration, size: number): any[] {
    // Implementation would create particle swarm
    return [];
  }

  private updateParticleVelocity(particle: any, globalBest: any, w: number, c1: number, c2: number): void {
    // Implementation would update particle velocity
  }

  private updateParticlePosition(particle: any, constraints: OptimizationParameters): void {
    // Implementation would update particle position
  }

  private generateNeighborSolution(
    current: HarvesterConfiguration,
    constraints: OptimizationParameters
  ): HarvesterConfiguration {
    // Implementation would generate neighbor solution
    return current;
  }

  /**
   * Get system diagnostics and performance metrics
   */
  public getSystemDiagnostics(): {
    harvesters: Map<string, HarvesterConfiguration>;
    materials: Map<string, PiezoelectricMaterial>;
    systemReliability: number;
    performanceHistory: HarvesterPerformance[];
    optimizationAlgorithm: string;
  } {
    return {
      harvesters: new Map(this.harvesters),
      materials: new Map(this.materials),
      systemReliability: this.systemReliability,
      performanceHistory: [...this.performanceHistory],
      optimizationAlgorithm: this.optimizationAlgorithm
    };
  }

  /**
   * Update system configuration
   */
  public updateSystemConfiguration(
    harvesterId: string,
    newConfig: Partial<HarvesterConfiguration>
  ): void {
    const existingConfig = this.harvesters.get(harvesterId);
    if (existingConfig) {
      this.harvesters.set(harvesterId, { ...existingConfig, ...newConfig });
    }
  }

  /**
   * Add custom piezoelectric material
   */
  public addCustomMaterial(material: PiezoelectricMaterial): void {
    this.materials.set(material.name, material);
  }

  /**
   * Set optimization algorithm
   */
  public setOptimizationAlgorithm(algorithm: 'genetic' | 'particle_swarm' | 'simulated_annealing'): void {
    this.optimizationAlgorithm = algorithm;
  }
}