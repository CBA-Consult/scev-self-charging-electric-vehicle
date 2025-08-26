/**
 * Main Piezoelectric Energy Harvester Controller
 * 
 * This is the primary controller that integrates all piezoelectric energy harvesting
 * components including materials modeling, structural analysis, optimization algorithms,
 * and vibration energy harvesting for comprehensive energy recovery optimization.
 */

import { 
  ClassicalPiezoelectricMaterial, 
  NonClassicalPiezoelectricMaterial,
  PiezoelectricMaterialFactory,
  MaterialProperties,
  NonClassicalProperties 
} from './PiezoelectricMaterials';
import { 
  PiezoelectricBeamModel, 
  PiezoelectricPlateModel,
  MultiPhysicsStructuralModel,
  GeometryParameters, 
  LoadConditions,
  StructuralResponse 
} from './StructuralModeling';
import { 
  GeneticAlgorithmOptimizer,
  ParticleSwarmOptimizer,
  GradientBasedOptimizer,
  OptimizationParameters,
  OptimizationObjectives,
  OptimizationResult 
} from './OptimizationAlgorithms';
import { 
  PiezoelectricEnergyHarvestingController,
  VibrationEnergySystem,
  PiezoelectricHarvester,
  VibrationSource 
} from './VibrationEnergyHarvesting';
import { SystemInputs, SystemOutputs } from './FuzzyControlIntegration';

export interface PiezoelectricSystemConfiguration {
  // Material selection
  materials: {
    classical: string[];           // List of classical materials to use
    nonClassical: string[];        // List of non-classical materials to use
    customMaterials?: { [name: string]: MaterialProperties | NonClassicalProperties };
  };
  
  // Harvester configurations
  harvesters: {
    beamHarvesters: Array<{
      id: string;
      material: string;
      geometry: GeometryParameters;
      location: { x: number; y: number; z: number };
    }>;
    plateHarvesters: Array<{
      id: string;
      material: string;
      geometry: GeometryParameters;
      location: { x: number; y: number; z: number };
    }>;
  };
  
  // Optimization settings
  optimization: {
    enabled: boolean;
    algorithms: ('genetic' | 'pso' | 'gradient')[];
    objectives: OptimizationObjectives;
    updateInterval: number;        // ms
    convergenceCriteria: {
      maxIterations: number;
      tolerance: number;
      improvementThreshold: number;
    };
  };
  
  // Performance targets
  targets: {
    minPowerOutput: number;        // W
    minEfficiency: number;         // 0-1
    maxStress: number;             // Pa
    operatingFrequencyRange: { min: number; max: number }; // Hz
  };
}

export interface PiezoelectricSystemStatus {
  // Overall system performance
  totalPowerOutput: number;        // W
  totalEnergyHarvested: number;    // J
  overallEfficiency: number;       // 0-1
  
  // Individual harvester status
  harvesters: Array<{
    id: string;
    type: 'beam' | 'plate';
    material: string;
    power: number;                 // W
    efficiency: number;            // 0-1
    status: 'active' | 'inactive' | 'fault' | 'optimizing';
    lastOptimization: number;      // timestamp
  }>;
  
  // Vibration analysis
  vibrationSources: Array<{
    type: string;
    frequency: number;             // Hz
    amplitude: number;             // m/s²
    utilization: number;           // 0-1 (how well it's being harvested)
  }>;
  
  // Optimization status
  optimization: {
    active: boolean;
    algorithm: string;
    progress: number;              // 0-1
    lastImprovement: number;       // timestamp
    convergenceStatus: 'converging' | 'converged' | 'diverging';
  };
  
  // System health
  health: {
    overallHealth: number;         // 0-1
    warnings: string[];
    faults: string[];
    maintenanceRequired: boolean;
  };
}

export interface PiezoelectricPerformanceMetrics {
  // Power metrics
  instantaneousPower: number;      // W
  averagePower: number;            // W (over time window)
  peakPower: number;               // W
  powerDensity: number;            // W/kg
  
  // Efficiency metrics
  electricalEfficiency: number;    // 0-1
  mechanicalEfficiency: number;    // 0-1
  overallEfficiency: number;       // 0-1
  
  // Frequency response
  resonantFrequencies: number[];   // Hz
  bandwidthUtilization: number;    // 0-1
  frequencyMatchingAccuracy: number; // 0-1
  
  // Material utilization
  strainUtilization: number;       // 0-1 (fraction of max allowable strain)
  stressUtilization: number;       // 0-1 (fraction of max allowable stress)
  temperatureEffects: number;      // 0-1 (temperature compensation effectiveness)
  
  // Optimization effectiveness
  optimizationGain: number;        // Improvement factor from optimization
  convergenceRate: number;         // Iterations per significant improvement
  adaptationSpeed: number;         // Response time to changing conditions
}

/**
 * Main Piezoelectric Energy Harvesting System Controller
 * 
 * Coordinates all aspects of piezoelectric energy harvesting including
 * material selection, structural modeling, optimization, and integration
 * with vehicle systems.
 */
export class PiezoelectricEnergyHarvester {
  private configuration: PiezoelectricSystemConfiguration;
  private vibrationController: PiezoelectricEnergyHarvestingController;
  private optimizers: Map<string, GeneticAlgorithmOptimizer | ParticleSwarmOptimizer | GradientBasedOptimizer>;
  private structuralModels: Map<string, PiezoelectricBeamModel | PiezoelectricPlateModel | MultiPhysicsStructuralModel>;
  private materials: Map<string, ClassicalPiezoelectricMaterial | NonClassicalPiezoelectricMaterial>;
  
  private performanceHistory: Array<{ timestamp: number; metrics: PiezoelectricPerformanceMetrics }>;
  private systemStatus: PiezoelectricSystemStatus;
  private lastUpdate: number;
  private updateInterval: number;

  constructor(configuration: PiezoelectricSystemConfiguration) {
    this.configuration = configuration;
    this.optimizers = new Map();
    this.structuralModels = new Map();
    this.materials = new Map();
    this.performanceHistory = [];
    this.lastUpdate = Date.now();
    this.updateInterval = 100; // 100ms default update rate
    
    this.initializeSystem();
  }

  /**
   * Initialize the complete piezoelectric energy harvesting system
   */
  private initializeSystem(): void {
    // Initialize materials
    this.initializeMaterials();
    
    // Initialize structural models
    this.initializeStructuralModels();
    
    // Initialize optimizers
    this.initializeOptimizers();
    
    // Initialize vibration controller
    this.initializeVibrationController();
    
    // Initialize system status
    this.initializeSystemStatus();
    
    console.log('Piezoelectric Energy Harvesting System initialized successfully');
  }

  /**
   * Initialize material library
   */
  private initializeMaterials(): void {
    // Load classical materials
    for (const materialName of this.configuration.materials.classical) {
      try {
        const material = PiezoelectricMaterialFactory.createClassicalMaterial(materialName);
        this.materials.set(materialName, material);
      } catch (error) {
        console.warn(`Failed to load classical material ${materialName}:`, error);
      }
    }
    
    // Load non-classical materials
    for (const materialName of this.configuration.materials.nonClassical) {
      try {
        const material = PiezoelectricMaterialFactory.createNonClassicalMaterial(materialName);
        this.materials.set(materialName, material);
      } catch (error) {
        console.warn(`Failed to load non-classical material ${materialName}:`, error);
      }
    }
    
    // Add custom materials
    if (this.configuration.materials.customMaterials) {
      for (const [name, properties] of Object.entries(this.configuration.materials.customMaterials)) {
        PiezoelectricMaterialFactory.addCustomMaterial(name, properties);
        
        if ('nonlinearCoefficients' in properties) {
          const material = PiezoelectricMaterialFactory.createNonClassicalMaterial(name);
          this.materials.set(name, material);
        } else {
          const material = PiezoelectricMaterialFactory.createClassicalMaterial(name);
          this.materials.set(name, material);
        }
      }
    }
  }

  /**
   * Initialize structural models for all harvesters
   */
  private initializeStructuralModels(): void {
    // Initialize beam harvesters
    for (const harvesterConfig of this.configuration.harvesters.beamHarvesters) {
      const material = this.materials.get(harvesterConfig.material);
      if (material) {
        const beamModel = new PiezoelectricBeamModel(
          harvesterConfig.geometry,
          material.getProperties()
        );
        this.structuralModels.set(harvesterConfig.id, beamModel);
      }
    }
    
    // Initialize plate harvesters
    for (const harvesterConfig of this.configuration.harvesters.plateHarvesters) {
      const material = this.materials.get(harvesterConfig.material);
      if (material) {
        const plateModel = new PiezoelectricPlateModel(
          harvesterConfig.geometry,
          material.getProperties()
        );
        this.structuralModels.set(harvesterConfig.id, plateModel);
      }
    }
  }

  /**
   * Initialize optimization algorithms
   */
  private initializeOptimizers(): void {
    for (const algorithm of this.configuration.optimization.algorithms) {
      switch (algorithm) {
        case 'genetic':
          this.optimizers.set('genetic', new GeneticAlgorithmOptimizer(
            50, // population size
            this.configuration.optimization.convergenceCriteria.maxIterations,
            0.8, // crossover rate
            0.1, // mutation rate
            0.1  // elitism rate
          ));
          break;
          
        case 'pso':
          this.optimizers.set('pso', new ParticleSwarmOptimizer(
            30, // swarm size
            this.configuration.optimization.convergenceCriteria.maxIterations,
            0.9, // inertia weight
            2.0, // cognitive weight
            2.0  // social weight
          ));
          break;
          
        case 'gradient':
          this.optimizers.set('gradient', new GradientBasedOptimizer(
            0.01, // learning rate
            this.configuration.optimization.convergenceCriteria.maxIterations,
            this.configuration.optimization.convergenceCriteria.tolerance
          ));
          break;
      }
    }
  }

  /**
   * Initialize vibration energy harvesting controller
   */
  private initializeVibrationController(): void {
    // Create harvesters for vibration controller
    const harvesters: PiezoelectricHarvester[] = [];
    
    // Add beam harvesters
    for (const config of this.configuration.harvesters.beamHarvesters) {
      const material = this.materials.get(config.material);
      if (material) {
        // This would create a harvester - simplified for now
        // In practice, would need to convert our configuration to VibrationEnergyHarvesting format
      }
    }
    
    this.vibrationController = new PiezoelectricEnergyHarvestingController(
      harvesters,
      { 
        algorithm: this.configuration.optimization.algorithms[0] || 'genetic',
        updateInterval: this.configuration.optimization.updateInterval
      }
    );
  }

  /**
   * Initialize system status
   */
  private initializeSystemStatus(): void {
    this.systemStatus = {
      totalPowerOutput: 0,
      totalEnergyHarvested: 0,
      overallEfficiency: 0,
      harvesters: [],
      vibrationSources: [],
      optimization: {
        active: false,
        algorithm: this.configuration.optimization.algorithms[0] || 'genetic',
        progress: 0,
        lastImprovement: Date.now(),
        convergenceStatus: 'converging'
      },
      health: {
        overallHealth: 1.0,
        warnings: [],
        faults: [],
        maintenanceRequired: false
      }
    };
  }

  /**
   * Main update cycle - processes vehicle inputs and optimizes energy harvesting
   */
  public update(vehicleInputs: SystemInputs): {
    piezoelectricPower: number;
    piezoelectricEfficiency: number;
    optimizationStatus: string;
    harvestingMetrics: PiezoelectricPerformanceMetrics;
  } {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastUpdate;
    
    if (deltaTime < this.updateInterval) {
      return this.getLastResults();
    }
    
    this.lastUpdate = currentTime;
    
    try {
      // Update vibration energy harvesting
      const harvestingResults = this.vibrationController.calculateEnergyHarvesting(vehicleInputs);
      
      // Perform optimization if enabled and due
      if (this.configuration.optimization.enabled) {
        this.performOptimization(vehicleInputs);
      }
      
      // Calculate performance metrics
      const metrics = this.calculatePerformanceMetrics(harvestingResults, vehicleInputs);
      
      // Update system status
      this.updateSystemStatus(harvestingResults, metrics);
      
      // Store performance history
      this.performanceHistory.push({
        timestamp: currentTime,
        metrics
      });
      
      // Limit history size
      if (this.performanceHistory.length > 1000) {
        this.performanceHistory.shift();
      }
      
      return {
        piezoelectricPower: harvestingResults.totalPower,
        piezoelectricEfficiency: harvestingResults.efficiency,
        optimizationStatus: this.systemStatus.optimization.convergenceStatus,
        harvestingMetrics: metrics
      };
      
    } catch (error) {
      console.error('Error in piezoelectric energy harvester update:', error);
      this.systemStatus.health.faults.push(`Update error: ${error.message}`);
      return this.getFailsafeResults();
    }
  }

  /**
   * Perform system optimization
   */
  private async performOptimization(vehicleInputs: SystemInputs): Promise<void> {
    if (!this.systemStatus.optimization.active) {
      this.systemStatus.optimization.active = true;
      this.systemStatus.optimization.progress = 0;
      
      try {
        await this.vibrationController.optimizeHarvesters(vehicleInputs);
        this.systemStatus.optimization.lastImprovement = Date.now();
        this.systemStatus.optimization.convergenceStatus = 'converged';
      } catch (error) {
        console.error('Optimization failed:', error);
        this.systemStatus.optimization.convergenceStatus = 'diverging';
        this.systemStatus.health.warnings.push('Optimization failed');
      } finally {
        this.systemStatus.optimization.active = false;
        this.systemStatus.optimization.progress = 1.0;
      }
    }
  }

  /**
   * Calculate comprehensive performance metrics
   */
  private calculatePerformanceMetrics(
    harvestingResults: any,
    vehicleInputs: SystemInputs
  ): PiezoelectricPerformanceMetrics {
    const currentTime = Date.now();
    
    // Calculate average power over recent history
    const recentHistory = this.performanceHistory.filter(
      entry => currentTime - entry.timestamp < 10000 // Last 10 seconds
    );
    
    const averagePower = recentHistory.length > 0 ?
      recentHistory.reduce((sum, entry) => sum + entry.metrics.instantaneousPower, 0) / recentHistory.length :
      harvestingResults.totalPower;
    
    // Calculate peak power
    const peakPower = recentHistory.length > 0 ?
      Math.max(...recentHistory.map(entry => entry.metrics.instantaneousPower)) :
      harvestingResults.totalPower;
    
    // Estimate system mass (simplified)
    const totalMass = this.configuration.harvesters.beamHarvesters.length * 0.05 + 
                     this.configuration.harvesters.plateHarvesters.length * 0.1; // kg
    
    const powerDensity = totalMass > 0 ? harvestingResults.totalPower / totalMass : 0;
    
    // Calculate frequency response metrics
    const resonantFrequencies = this.calculateResonantFrequencies();
    const bandwidthUtilization = this.calculateBandwidthUtilization(vehicleInputs);
    
    // Calculate material utilization
    const strainUtilization = this.calculateStrainUtilization();
    const stressUtilization = this.calculateStressUtilization();
    
    // Calculate optimization effectiveness
    const optimizationGain = this.calculateOptimizationGain();
    
    return {
      instantaneousPower: harvestingResults.totalPower,
      averagePower,
      peakPower,
      powerDensity,
      electricalEfficiency: harvestingResults.efficiency,
      mechanicalEfficiency: harvestingResults.efficiency * 0.9, // Simplified
      overallEfficiency: harvestingResults.efficiency,
      resonantFrequencies,
      bandwidthUtilization,
      frequencyMatchingAccuracy: this.calculateFrequencyMatchingAccuracy(vehicleInputs),
      strainUtilization,
      stressUtilization,
      temperatureEffects: this.calculateTemperatureEffects(vehicleInputs),
      optimizationGain,
      convergenceRate: this.calculateConvergenceRate(),
      adaptationSpeed: this.calculateAdaptationSpeed()
    };
  }

  /**
   * Calculate resonant frequencies of all harvesters
   */
  private calculateResonantFrequencies(): number[] {
    const frequencies: number[] = [];
    
    for (const [id, model] of this.structuralModels) {
      if (model instanceof PiezoelectricBeamModel) {
        const modalProps = model.getModalProperties();
        frequencies.push(...modalProps.naturalFrequencies.slice(0, 3)); // First 3 modes
      }
    }
    
    return frequencies.sort((a, b) => a - b);
  }

  /**
   * Calculate bandwidth utilization
   */
  private calculateBandwidthUtilization(vehicleInputs: SystemInputs): number {
    // Simplified calculation based on vehicle speed and vibration sources
    const operatingFrequency = 10 + vehicleInputs.vehicleSpeed * 0.1;
    const targetRange = this.configuration.targets.operatingFrequencyRange;
    
    if (operatingFrequency >= targetRange.min && operatingFrequency <= targetRange.max) {
      return 1.0;
    } else {
      const distance = Math.min(
        Math.abs(operatingFrequency - targetRange.min),
        Math.abs(operatingFrequency - targetRange.max)
      );
      return Math.max(0, 1 - distance / targetRange.max);
    }
  }

  /**
   * Calculate strain utilization across all harvesters
   */
  private calculateStrainUtilization(): number {
    // Simplified - would need actual strain calculations from structural models
    return 0.6; // Placeholder
  }

  /**
   * Calculate stress utilization across all harvesters
   */
  private calculateStressUtilization(): number {
    // Simplified - would need actual stress calculations from structural models
    return 0.5; // Placeholder
  }

  /**
   * Calculate temperature compensation effectiveness
   */
  private calculateTemperatureEffects(vehicleInputs: SystemInputs): number {
    const referenceTemp = 25; // °C
    const tempDifference = Math.abs(vehicleInputs.ambientTemperature - referenceTemp);
    
    // Assume 1% efficiency loss per 10°C deviation
    const tempEffect = Math.max(0, 1 - tempDifference / 100);
    
    return tempEffect;
  }

  /**
   * Calculate optimization gain
   */
  private calculateOptimizationGain(): number {
    if (this.performanceHistory.length < 2) return 1.0;
    
    const recent = this.performanceHistory.slice(-10);
    const initial = this.performanceHistory.slice(0, 10);
    
    if (initial.length === 0 || recent.length === 0) return 1.0;
    
    const initialAvg = initial.reduce((sum, entry) => sum + entry.metrics.instantaneousPower, 0) / initial.length;
    const recentAvg = recent.reduce((sum, entry) => sum + entry.metrics.instantaneousPower, 0) / recent.length;
    
    return initialAvg > 0 ? recentAvg / initialAvg : 1.0;
  }

  /**
   * Calculate frequency matching accuracy
   */
  private calculateFrequencyMatchingAccuracy(vehicleInputs: SystemInputs): number {
    // Simplified calculation
    return 0.8; // Placeholder
  }

  /**
   * Calculate convergence rate
   */
  private calculateConvergenceRate(): number {
    // Simplified calculation
    return 0.1; // Placeholder
  }

  /**
   * Calculate adaptation speed
   */
  private calculateAdaptationSpeed(): number {
    // Simplified calculation
    return 0.05; // Placeholder
  }

  /**
   * Update system status
   */
  private updateSystemStatus(harvestingResults: any, metrics: PiezoelectricPerformanceMetrics): void {
    this.systemStatus.totalPowerOutput = harvestingResults.totalPower;
    this.systemStatus.overallEfficiency = harvestingResults.efficiency;
    
    // Update harvester statuses
    const vibrationStatus = this.vibrationController.getSystemStatus();
    this.systemStatus.harvesters = vibrationStatus.harvesters.map(h => ({
      id: h.id,
      type: 'beam' as const, // Simplified
      material: 'PZT-5H', // Simplified
      power: h.power,
      efficiency: h.efficiency,
      status: h.status,
      lastOptimization: Date.now()
    }));
    
    // Update health status
    this.updateHealthStatus(metrics);
  }

  /**
   * Update system health status
   */
  private updateHealthStatus(metrics: PiezoelectricPerformanceMetrics): void {
    const health = this.systemStatus.health;
    health.warnings = [];
    health.faults = [];
    
    // Check performance thresholds
    if (metrics.instantaneousPower < this.configuration.targets.minPowerOutput) {
      health.warnings.push('Power output below target');
    }
    
    if (metrics.overallEfficiency < this.configuration.targets.minEfficiency) {
      health.warnings.push('Efficiency below target');
    }
    
    if (metrics.stressUtilization > 0.9) {
      health.warnings.push('High stress levels detected');
    }
    
    if (metrics.temperatureEffects < 0.8) {
      health.warnings.push('Temperature affecting performance');
    }
    
    // Calculate overall health
    const warningPenalty = health.warnings.length * 0.1;
    const faultPenalty = health.faults.length * 0.3;
    health.overallHealth = Math.max(0, 1.0 - warningPenalty - faultPenalty);
    
    health.maintenanceRequired = health.overallHealth < 0.7;
  }

  /**
   * Get last results (for high-frequency calls)
   */
  private getLastResults(): any {
    const lastMetrics = this.performanceHistory.length > 0 ?
      this.performanceHistory[this.performanceHistory.length - 1].metrics :
      this.getDefaultMetrics();
    
    return {
      piezoelectricPower: lastMetrics.instantaneousPower,
      piezoelectricEfficiency: lastMetrics.overallEfficiency,
      optimizationStatus: this.systemStatus.optimization.convergenceStatus,
      harvestingMetrics: lastMetrics
    };
  }

  /**
   * Get failsafe results
   */
  private getFailsafeResults(): any {
    return {
      piezoelectricPower: 0,
      piezoelectricEfficiency: 0,
      optimizationStatus: 'fault',
      harvestingMetrics: this.getDefaultMetrics()
    };
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(): PiezoelectricPerformanceMetrics {
    return {
      instantaneousPower: 0,
      averagePower: 0,
      peakPower: 0,
      powerDensity: 0,
      electricalEfficiency: 0,
      mechanicalEfficiency: 0,
      overallEfficiency: 0,
      resonantFrequencies: [],
      bandwidthUtilization: 0,
      frequencyMatchingAccuracy: 0,
      strainUtilization: 0,
      stressUtilization: 0,
      temperatureEffects: 1,
      optimizationGain: 1,
      convergenceRate: 0,
      adaptationSpeed: 0
    };
  }

  /**
   * Get comprehensive system status
   */
  public getSystemStatus(): PiezoelectricSystemStatus {
    return { ...this.systemStatus };
  }

  /**
   * Get performance metrics history
   */
  public getPerformanceHistory(timeWindow?: number): Array<{ timestamp: number; metrics: PiezoelectricPerformanceMetrics }> {
    if (!timeWindow) {
      return [...this.performanceHistory];
    }
    
    const cutoffTime = Date.now() - timeWindow;
    return this.performanceHistory.filter(entry => entry.timestamp >= cutoffTime);
  }

  /**
   * Update configuration
   */
  public updateConfiguration(newConfig: Partial<PiezoelectricSystemConfiguration>): void {
    this.configuration = { ...this.configuration, ...newConfig };
    
    // Reinitialize affected components
    if (newConfig.materials) {
      this.initializeMaterials();
      this.initializeStructuralModels();
    }
    
    if (newConfig.optimization) {
      this.initializeOptimizers();
    }
  }

  /**
   * Add custom material
   */
  public addCustomMaterial(
    name: string, 
    properties: MaterialProperties | NonClassicalProperties
  ): void {
    PiezoelectricMaterialFactory.addCustomMaterial(name, properties);
    
    if ('nonlinearCoefficients' in properties) {
      const material = PiezoelectricMaterialFactory.createNonClassicalMaterial(name);
      this.materials.set(name, material);
    } else {
      const material = PiezoelectricMaterialFactory.createClassicalMaterial(name);
      this.materials.set(name, material);
    }
  }

  /**
   * Get available materials
   */
  public getAvailableMaterials(): string[] {
    return Array.from(this.materials.keys());
  }

  /**
   * Shutdown system
   */
  public shutdown(): void {
    this.systemStatus.optimization.active = false;
    console.log('Piezoelectric Energy Harvesting System shutdown complete');
  }
}