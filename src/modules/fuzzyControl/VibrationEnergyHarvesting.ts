/**
 * Vibration Energy Harvesting Integration Module
 * 
 * This module integrates piezoelectric energy harvesting with mechanical vibrations
 * from vehicle operations, combining with the existing fuzzy control system for
 * optimal energy recovery from multiple sources.
 */

import { 
  ClassicalPiezoelectricMaterial, 
  NonClassicalPiezoelectricMaterial,
  PiezoelectricMaterialFactory 
} from './PiezoelectricMaterials';
import { 
  PiezoelectricBeamModel, 
  PiezoelectricPlateModel,
  GeometryParameters, 
  LoadConditions,
  StructuralResponse 
} from './StructuralModeling';
import { 
  GeneticAlgorithmOptimizer,
  ParticleSwarmOptimizer,
  OptimizationParameters,
  OptimizationObjectives,
  OptimizationResult 
} from './OptimizationAlgorithms';
import { SystemInputs, SystemOutputs } from './FuzzyControlIntegration';

export interface VibrationSource {
  type: 'engine' | 'road' | 'wind' | 'braking' | 'suspension' | 'wheel_rotation';
  frequency: number;              // Hz
  amplitude: number;              // m/s² or N
  direction: 'vertical' | 'horizontal' | 'lateral';
  location: { x: number; y: number; z: number }; // Position on vehicle
  active: boolean;
}

export interface PiezoelectricHarvester {
  id: string;
  material: ClassicalPiezoelectricMaterial | NonClassicalPiezoelectricMaterial;
  geometry: GeometryParameters;
  structuralModel: PiezoelectricBeamModel | PiezoelectricPlateModel;
  location: { x: number; y: number; z: number };
  orientation: { pitch: number; roll: number; yaw: number };
  electricalCircuit: {
    loadResistance: number;       // Ω
    capacitance: number;          // F
    inductance?: number;          // H
    rectifierEfficiency: number;  // 0-1
  };
  performance: {
    currentPower: number;         // W
    averagePower: number;         // W
    peakPower: number;            // W
    efficiency: number;           // 0-1
    energyHarvested: number;      // J (cumulative)
  };
}

export interface VibrationEnergySystem {
  harvesters: PiezoelectricHarvester[];
  vibrationSources: VibrationSource[];
  powerManagement: {
    totalPower: number;           // W
    powerDistribution: { [harvesterId: string]: number };
    storageCapacity: number;      // J
    currentStorage: number;       // J
    conversionEfficiency: number; // 0-1
  };
  optimization: {
    enabled: boolean;
    algorithm: 'genetic' | 'pso' | 'gradient';
    updateInterval: number;       // ms
    lastOptimization: number;     // timestamp
  };
}

/**
 * Piezoelectric Energy Harvesting Controller
 * 
 * Manages multiple piezoelectric harvesters for optimal energy recovery
 * from vehicle vibrations
 */
export class PiezoelectricEnergyHarvestingController {
  private energySystem: VibrationEnergySystem;
  private optimizer: GeneticAlgorithmOptimizer | ParticleSwarmOptimizer;
  private updateInterval: number;
  private lastUpdate: number;
  private performanceHistory: Array<{ timestamp: number; totalPower: number; efficiency: number }>;

  constructor(
    harvesters: PiezoelectricHarvester[] = [],
    optimizationConfig: { algorithm: 'genetic' | 'pso'; updateInterval: number } = 
      { algorithm: 'genetic', updateInterval: 5000 }
  ) {
    this.energySystem = {
      harvesters,
      vibrationSources: [],
      powerManagement: {
        totalPower: 0,
        powerDistribution: {},
        storageCapacity: 1000, // 1kJ default
        currentStorage: 0,
        conversionEfficiency: 0.85
      },
      optimization: {
        enabled: true,
        algorithm: optimizationConfig.algorithm,
        updateInterval: optimizationConfig.updateInterval,
        lastOptimization: 0
      }
    };

    this.optimizer = optimizationConfig.algorithm === 'genetic' ? 
      new GeneticAlgorithmOptimizer() : new ParticleSwarmOptimizer();
    
    this.updateInterval = 100; // 100ms update rate
    this.lastUpdate = Date.now();
    this.performanceHistory = [];
    
    this.initializeDefaultHarvesters();
  }

  /**
   * Initialize default piezoelectric harvesters for common vehicle locations
   */
  private initializeDefaultHarvesters(): void {
    // Suspension-mounted harvesters
    const suspensionHarvester = this.createHarvester(
      'suspension_front_left',
      'PZT-5H',
      {
        length: 0.05,
        width: 0.02,
        thickness: 0.001,
        shape: 'rectangular',
        aspectRatio: 2.5,
        supportConditions: 'cantilever',
        massLocation: 'tip',
        tipMass: 0.01,
        layers: [{
          materialType: 'PZT-5H',
          thickness: 0.001,
          position: 'middle',
          orientation: 0
        }]
      },
      { x: 1.2, y: 0.8, z: 0.3 }
    );

    // Engine-mounted harvesters
    const engineHarvester = this.createHarvester(
      'engine_mount',
      'PMN-PT',
      {
        length: 0.08,
        width: 0.03,
        thickness: 0.002,
        shape: 'rectangular',
        aspectRatio: 2.67,
        supportConditions: 'clamped',
        massLocation: 'center',
        layers: [{
          materialType: 'PMN-PT',
          thickness: 0.002,
          position: 'middle',
          orientation: 0
        }]
      },
      { x: 0.5, y: 0, z: 0.5 }
    );

    // Wheel-mounted harvesters for rotation energy
    const wheelHarvester = this.createHarvester(
      'wheel_rotation',
      'PMN-PT',
      {
        length: 0.03,
        width: 0.015,
        thickness: 0.0005,
        shape: 'rectangular',
        aspectRatio: 2.0,
        supportConditions: 'cantilever',
        massLocation: 'tip',
        tipMass: 0.005,
        layers: [{
          materialType: 'PMN-PT',
          thickness: 0.0005,
          position: 'middle',
          orientation: 0
        }]
      },
      { x: 1.5, y: 0.8, z: 0.1 }
    );

    this.energySystem.harvesters.push(suspensionHarvester, engineHarvester, wheelHarvester);
  }

  /**
   * Create a piezoelectric harvester
   */
  private createHarvester(
    id: string,
    materialType: string,
    geometry: GeometryParameters,
    location: { x: number; y: number; z: number }
  ): PiezoelectricHarvester {
    const material = materialType.includes('PMN') ? 
      PiezoelectricMaterialFactory.createNonClassicalMaterial(materialType) :
      PiezoelectricMaterialFactory.createClassicalMaterial(materialType);

    const structuralModel = new PiezoelectricBeamModel(
      geometry,
      material.getProperties()
    );

    return {
      id,
      material,
      geometry,
      structuralModel,
      location,
      orientation: { pitch: 0, roll: 0, yaw: 0 },
      electricalCircuit: {
        loadResistance: 10000, // 10kΩ default
        capacitance: 100e-9,   // 100nF default
        rectifierEfficiency: 0.9
      },
      performance: {
        currentPower: 0,
        averagePower: 0,
        peakPower: 0,
        efficiency: 0,
        energyHarvested: 0
      }
    };
  }

  /**
   * Update vibration sources based on vehicle state
   */
  public updateVibrationSources(vehicleInputs: SystemInputs): void {
    this.energySystem.vibrationSources = [];

    // Engine vibrations (if vehicle has engine - for hybrid)
    if (vehicleInputs.vehicleSpeed > 0) {
      this.energySystem.vibrationSources.push({
        type: 'engine',
        frequency: 30 + vehicleInputs.vehicleSpeed * 0.5, // RPM-based frequency
        amplitude: 2.0 + vehicleInputs.acceleratorPedalPosition * 3.0,
        direction: 'vertical',
        location: { x: 0.5, y: 0, z: 0.5 },
        active: true
      });
    }

    // Road vibrations
    const roadAmplitude = this.calculateRoadVibrationAmplitude(
      vehicleInputs.vehicleSpeed,
      vehicleInputs.roadSurface
    );
    this.energySystem.vibrationSources.push({
      type: 'road',
      frequency: 5 + vehicleInputs.vehicleSpeed * 0.1,
      amplitude: roadAmplitude,
      direction: 'vertical',
      location: { x: 1.2, y: 0, z: 0.3 },
      active: vehicleInputs.vehicleSpeed > 5
    });

    // Braking vibrations
    if (vehicleInputs.brakePedalPosition > 0.1) {
      this.energySystem.vibrationSources.push({
        type: 'braking',
        frequency: 15 + vehicleInputs.brakePedalPosition * 10,
        amplitude: vehicleInputs.brakePedalPosition * 5.0,
        direction: 'horizontal',
        location: { x: 1.5, y: 0.8, z: 0.2 },
        active: true
      });
    }

    // Wheel rotation vibrations
    if (vehicleInputs.vehicleSpeed > 0) {
      const wheelFrequency = vehicleInputs.vehicleSpeed / (2 * Math.PI * 0.35); // Assume 0.35m wheel radius
      this.energySystem.vibrationSources.push({
        type: 'wheel_rotation',
        frequency: wheelFrequency,
        amplitude: 1.0 + Math.abs(vehicleInputs.lateralAcceleration) * 0.5,
        direction: 'vertical',
        location: { x: 1.5, y: 0.8, z: 0.1 },
        active: true
      });
    }

    // Wind vibrations (at higher speeds)
    if (vehicleInputs.vehicleSpeed > 50) {
      this.energySystem.vibrationSources.push({
        type: 'wind',
        frequency: 2 + vehicleInputs.vehicleSpeed * 0.05,
        amplitude: Math.pow(vehicleInputs.vehicleSpeed / 100, 2) * 1.5,
        direction: 'horizontal',
        location: { x: 0, y: 0, z: 1.5 },
        active: true
      });
    }
  }

  /**
   * Calculate road vibration amplitude based on speed and surface
   */
  private calculateRoadVibrationAmplitude(speed: number, surface: string): number {
    const baseAmplitude = speed * 0.02; // Base amplitude proportional to speed
    
    const surfaceMultipliers = {
      'dry': 1.0,
      'wet': 1.2,
      'snow': 1.5,
      'ice': 0.8
    };
    
    return baseAmplitude * (surfaceMultipliers[surface as keyof typeof surfaceMultipliers] || 1.0);
  }

  /**
   * Calculate energy harvesting from all sources
   */
  public calculateEnergyHarvesting(vehicleInputs: SystemInputs): {
    totalPower: number;
    harvesterOutputs: { [id: string]: { power: number; voltage: number; current: number } };
    efficiency: number;
  } {
    this.updateVibrationSources(vehicleInputs);
    
    const harvesterOutputs: { [id: string]: { power: number; voltage: number; current: number } } = {};
    let totalPower = 0;
    let totalMechanicalPower = 0;

    for (const harvester of this.energySystem.harvesters) {
      // Find the most relevant vibration source for this harvester
      const relevantSource = this.findRelevantVibrationSource(harvester);
      
      if (relevantSource && relevantSource.active) {
        // Create load conditions
        const loadConditions: LoadConditions = {
          baseAcceleration: {
            amplitude: relevantSource.amplitude,
            frequency: relevantSource.frequency,
            phase: 0
          },
          temperature: vehicleInputs.ambientTemperature,
          humidity: 50, // Default
          pressure: 101325 // Standard atmospheric pressure
        };

        // Calculate structural response
        const structuralResponse = harvester.structuralModel.calculateStructuralResponse(loadConditions);
        
        // Calculate electrical output
        const area = harvester.geometry.width * harvester.geometry.length;
        const force = structuralResponse.stress.maximum * area;
        
        const electricalOutput = harvester.material.calculatePowerOutput(
          force,
          relevantSource.frequency,
          area,
          harvester.geometry.thickness,
          harvester.electricalCircuit.loadResistance,
          vehicleInputs.ambientTemperature
        );

        // Apply rectifier efficiency
        const rectifiedPower = electricalOutput.power * harvester.electricalCircuit.rectifierEfficiency;
        
        harvesterOutputs[harvester.id] = {
          power: rectifiedPower,
          voltage: electricalOutput.voltage,
          current: electricalOutput.current
        };

        // Update harvester performance
        harvester.performance.currentPower = rectifiedPower;
        harvester.performance.efficiency = electricalOutput.efficiency;
        harvester.performance.energyHarvested += rectifiedPower * (this.updateInterval / 1000);
        
        if (rectifiedPower > harvester.performance.peakPower) {
          harvester.performance.peakPower = rectifiedPower;
        }

        totalPower += rectifiedPower;
        totalMechanicalPower += force * structuralResponse.displacement.rms * 2 * Math.PI * relevantSource.frequency;
      } else {
        harvesterOutputs[harvester.id] = { power: 0, voltage: 0, current: 0 };
        harvester.performance.currentPower = 0;
      }
    }

    // Update system power management
    this.energySystem.powerManagement.totalPower = totalPower;
    this.energySystem.powerManagement.powerDistribution = 
      Object.fromEntries(Object.entries(harvesterOutputs).map(([id, output]) => [id, output.power]));

    // Calculate overall efficiency
    const overallEfficiency = totalMechanicalPower > 0 ? totalPower / totalMechanicalPower : 0;
    this.energySystem.powerManagement.conversionEfficiency = overallEfficiency;

    // Update performance history
    this.updatePerformanceHistory(totalPower, overallEfficiency);

    return {
      totalPower,
      harvesterOutputs,
      efficiency: overallEfficiency
    };
  }

  /**
   * Find the most relevant vibration source for a harvester
   */
  private findRelevantVibrationSource(harvester: PiezoelectricHarvester): VibrationSource | null {
    let bestSource: VibrationSource | null = null;
    let minDistance = Infinity;

    for (const source of this.energySystem.vibrationSources) {
      if (!source.active) continue;

      // Calculate distance between harvester and vibration source
      const distance = Math.sqrt(
        Math.pow(harvester.location.x - source.location.x, 2) +
        Math.pow(harvester.location.y - source.location.y, 2) +
        Math.pow(harvester.location.z - source.location.z, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        bestSource = source;
      }
    }

    return bestSource;
  }

  /**
   * Update performance history
   */
  private updatePerformanceHistory(totalPower: number, efficiency: number): void {
    const currentTime = Date.now();
    
    this.performanceHistory.push({
      timestamp: currentTime,
      totalPower,
      efficiency
    });

    // Keep only last 1000 entries (about 100 seconds at 100ms intervals)
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory.shift();
    }

    // Update average power for each harvester
    if (this.performanceHistory.length > 10) {
      const recentHistory = this.performanceHistory.slice(-10);
      const averagePower = recentHistory.reduce((sum, entry) => sum + entry.totalPower, 0) / recentHistory.length;
      
      for (const harvester of this.energySystem.harvesters) {
        const harvesterPowerRatio = harvester.performance.currentPower / totalPower || 0;
        harvester.performance.averagePower = averagePower * harvesterPowerRatio;
      }
    }
  }

  /**
   * Optimize harvester parameters
   */
  public async optimizeHarvesters(vehicleInputs: SystemInputs): Promise<void> {
    const currentTime = Date.now();
    
    if (!this.energySystem.optimization.enabled || 
        currentTime - this.energySystem.optimization.lastOptimization < this.energySystem.optimization.updateInterval) {
      return;
    }

    this.energySystem.optimization.lastOptimization = currentTime;

    for (const harvester of this.energySystem.harvesters) {
      await this.optimizeIndividualHarvester(harvester, vehicleInputs);
    }
  }

  /**
   * Optimize individual harvester
   */
  private async optimizeIndividualHarvester(
    harvester: PiezoelectricHarvester, 
    vehicleInputs: SystemInputs
  ): Promise<void> {
    // Define optimization parameters
    const optimizationParams: OptimizationParameters = {
      geometry: {
        length: { 
          min: harvester.geometry.length * 0.5, 
          max: harvester.geometry.length * 2.0, 
          current: harvester.geometry.length 
        },
        width: { 
          min: harvester.geometry.width * 0.5, 
          max: harvester.geometry.width * 2.0, 
          current: harvester.geometry.width 
        },
        thickness: { 
          min: harvester.geometry.thickness * 0.5, 
          max: harvester.geometry.thickness * 2.0, 
          current: harvester.geometry.thickness 
        }
      },
      circuit: {
        loadResistance: { 
          min: 1000, 
          max: 100000, 
          current: harvester.electricalCircuit.loadResistance 
        },
        capacitance: { 
          min: 10e-9, 
          max: 1e-6, 
          current: harvester.electricalCircuit.capacitance 
        }
      },
      excitation: {
        frequency: { min: 1, max: 100, current: 10 },
        amplitude: { min: 0.1, max: 10, current: 1 }
      }
    };

    // Define objectives
    const objectives: OptimizationObjectives = {
      maximizePower: { weight: 0.5 },
      maximizeEfficiency: { weight: 0.3 },
      maximizeBandwidth: { weight: 0.2 },
      minimizeWeight: { weight: 0.0 },
      minimizeVolume: { weight: 0.0 },
      minimizeStress: { weight: 0.0 },
      maxStress: 100e6, // 100 MPa
      maxDisplacement: 0.001, // 1mm
      minNaturalFrequency: 1,
      maxNaturalFrequency: 1000
    };

    // Evaluation function
    const evaluationFunction = (params: OptimizationParameters) => {
      // Update harvester geometry temporarily
      const tempGeometry = {
        ...harvester.geometry,
        length: params.geometry.length.current,
        width: params.geometry.width.current,
        thickness: params.geometry.thickness.current
      };

      // Create temporary structural model
      const tempModel = new PiezoelectricBeamModel(tempGeometry, harvester.material.getProperties());
      
      // Find relevant vibration source
      const relevantSource = this.findRelevantVibrationSource(harvester);
      
      if (!relevantSource) {
        return { power: 0, efficiency: 0, bandwidth: 0, stress: 0, displacement: 0, naturalFrequency: 0 };
      }

      const loadConditions: LoadConditions = {
        baseAcceleration: {
          amplitude: relevantSource.amplitude,
          frequency: relevantSource.frequency,
          phase: 0
        },
        temperature: vehicleInputs.ambientTemperature,
        humidity: 50,
        pressure: 101325
      };

      const response = tempModel.calculateStructuralResponse(loadConditions);
      const area = tempGeometry.width * tempGeometry.length;
      const force = response.stress.maximum * area;
      
      const electricalOutput = harvester.material.calculatePowerOutput(
        force,
        relevantSource.frequency,
        area,
        tempGeometry.thickness,
        params.circuit.loadResistance.current,
        vehicleInputs.ambientTemperature
      );

      return {
        power: electricalOutput.power,
        efficiency: electricalOutput.efficiency,
        bandwidth: response.naturalFrequency * response.dampingRatio * 2,
        stress: response.stress.maximum,
        displacement: response.displacement.maximum,
        naturalFrequency: response.naturalFrequency
      };
    };

    // Run optimization
    try {
      const result = this.optimizer.optimize(optimizationParams, objectives, evaluationFunction);
      
      // Apply optimized parameters if improvement is significant
      if (result.performance.power > harvester.performance.averagePower * 1.1) {
        harvester.geometry.length = result.optimalParameters.geometry.length.current;
        harvester.geometry.width = result.optimalParameters.geometry.width.current;
        harvester.geometry.thickness = result.optimalParameters.geometry.thickness.current;
        harvester.electricalCircuit.loadResistance = result.optimalParameters.circuit.loadResistance.current;
        harvester.electricalCircuit.capacitance = result.optimalParameters.circuit.capacitance.current;
        
        // Update structural model
        harvester.structuralModel = new PiezoelectricBeamModel(
          harvester.geometry,
          harvester.material.getProperties()
        );
      }
    } catch (error) {
      console.warn(`Optimization failed for harvester ${harvester.id}:`, error);
    }
  }

  /**
   * Get system status and diagnostics
   */
  public getSystemStatus(): {
    totalPower: number;
    totalEnergyHarvested: number;
    averageEfficiency: number;
    activeHarvesters: number;
    activeSources: number;
    harvesters: Array<{
      id: string;
      power: number;
      efficiency: number;
      energyHarvested: number;
      status: 'active' | 'inactive' | 'fault';
    }>;
  } {
    const totalEnergyHarvested = this.energySystem.harvesters.reduce(
      (sum, h) => sum + h.performance.energyHarvested, 0
    );
    
    const averageEfficiency = this.performanceHistory.length > 0 ?
      this.performanceHistory.reduce((sum, entry) => sum + entry.efficiency, 0) / this.performanceHistory.length : 0;
    
    const activeHarvesters = this.energySystem.harvesters.filter(h => h.performance.currentPower > 0).length;
    const activeSources = this.energySystem.vibrationSources.filter(s => s.active).length;
    
    const harvesters = this.energySystem.harvesters.map(h => ({
      id: h.id,
      power: h.performance.currentPower,
      efficiency: h.performance.efficiency,
      energyHarvested: h.performance.energyHarvested,
      status: h.performance.currentPower > 0 ? 'active' as const : 'inactive' as const
    }));

    return {
      totalPower: this.energySystem.powerManagement.totalPower,
      totalEnergyHarvested,
      averageEfficiency,
      activeHarvesters,
      activeSources,
      harvesters
    };
  }

  /**
   * Add custom harvester
   */
  public addHarvester(
    id: string,
    materialType: string,
    geometry: GeometryParameters,
    location: { x: number; y: number; z: number },
    electricalCircuit?: Partial<PiezoelectricHarvester['electricalCircuit']>
  ): void {
    const harvester = this.createHarvester(id, materialType, geometry, location);
    
    if (electricalCircuit) {
      harvester.electricalCircuit = { ...harvester.electricalCircuit, ...electricalCircuit };
    }
    
    this.energySystem.harvesters.push(harvester);
  }

  /**
   * Remove harvester
   */
  public removeHarvester(id: string): boolean {
    const index = this.energySystem.harvesters.findIndex(h => h.id === id);
    if (index >= 0) {
      this.energySystem.harvesters.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Update optimization settings
   */
  public updateOptimizationSettings(settings: Partial<VibrationEnergySystem['optimization']>): void {
    this.energySystem.optimization = { ...this.energySystem.optimization, ...settings };
    
    if (settings.algorithm && settings.algorithm !== this.energySystem.optimization.algorithm) {
      this.optimizer = settings.algorithm === 'genetic' ? 
        new GeneticAlgorithmOptimizer() : new ParticleSwarmOptimizer();
    }
  }
}