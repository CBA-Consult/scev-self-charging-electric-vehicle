/**
 * Enhanced Energy System Integration
 * 
 * This module integrates the existing fuzzy control regenerative braking system
 * with the new continuous electromagnetic induction energy generation system,
 * providing a comprehensive energy management solution for electric vehicles and trains.
 */

import { FuzzyControlIntegration, SystemInputs, SystemOutputs } from './FuzzyControlIntegration';
import { ContinuousEnergyGenerator, WheelRotationData, PowerOutput, ElectromagneticConfig } from './ContinuousEnergyGenerator';
import { VehicleParameters } from './RegenerativeBrakingTorqueModel';
import {
  OptimalEnergyConverter,
  ConversionOptimizationConfig
} from '../optimalEnergyAlgorithms/OptimalEnergyConverter';
import {
  EnergyConversionParameters,
  EnergySystemState,
  OptimizationObjectives
} from '../optimalEnergyAlgorithms/types';

export interface EnhancedSystemInputs extends SystemInputs {
  wheelRotationData: {
    frontLeft: WheelRotationData;
    frontRight: WheelRotationData;
    rearLeft?: WheelRotationData;
    rearRight?: WheelRotationData;
  };
  powerDemand: number;              // Current power demand from vehicle systems (W)
  gridConnectionStatus: 'connected' | 'disconnected';
  energyExportEnabled: boolean;     // Allow energy export to grid
}

export interface EnhancedSystemOutputs extends SystemOutputs {
  continuousGeneration: {
    frontLeft: PowerOutput;
    frontRight: PowerOutput;
    rearLeft?: PowerOutput;
    rearRight?: PowerOutput;
  };
  totalGeneratedPower: number;      // Total power from all sources (W)
  netEnergyBalance: number;         // Net energy (positive = surplus, negative = deficit) (W)
  gridExportPower: number;          // Power available for grid export (W)
  systemEfficiency: number;         // Overall system efficiency (%)
  energyIndependenceRatio: number;  // Ratio of generated to consumed energy
}

export interface TrainSpecificInputs {
  trainConfiguration: 'passenger' | 'freight' | 'high_speed';
  carCount: number;
  totalWeight: number;              // Total train weight (kg)
  gradientAngle: number;            // Track gradient (degrees)
  trackCondition: 'dry' | 'wet' | 'icy';
  operationalMode: 'acceleration' | 'cruising' | 'braking' | 'coasting';
}

export interface TrainSystemOutputs extends EnhancedSystemOutputs {
  trainSpecificMetrics: {
    powerPerCar: number;            // Average power generation per car (W)
    totalTrainPower: number;        // Total train power generation (W)
    energyRecoveryFromGradient: number; // Energy recovered from downhill operation (W)
    gridTieCapability: number;      // Power available for grid tie at stations (W)
  };
}

export class EnhancedEnergySystem {
  private fuzzyControlSystem: FuzzyControlIntegration;
  private continuousGenerators: Map<string, ContinuousEnergyGenerator>;
  private vehicleParameters: VehicleParameters;
  private systemStartTime: number;
  private totalEnergyBalance: number;
  private performanceHistory: Array<{
    timestamp: number;
    totalGeneration: number;
    totalConsumption: number;
    efficiency: number;
  }>;
  private optimalEnergyConverter: OptimalEnergyConverter;

  constructor(
    vehicleParams: VehicleParameters,
    electromagneticConfigs: Map<string, ElectromagneticConfig>
  ) {
    this.fuzzyControlSystem = new FuzzyControlIntegration(vehicleParams);
    this.continuousGenerators = new Map();
    this.vehicleParameters = vehicleParams;
    this.systemStartTime = Date.now();
    this.totalEnergyBalance = 0;
    this.performanceHistory = [];

    // Initialize continuous generators for each wheel
    electromagneticConfigs.forEach((config, wheelPosition) => {
      this.continuousGenerators.set(wheelPosition, new ContinuousEnergyGenerator(config));
    });

    // Initialize optimal energy converter
    this.initializeOptimalEnergyConverter();
  }

  /**
   * Initialize optimal energy converter with advanced algorithms
   */
  private initializeOptimalEnergyConverter(): void {
    const conversionConfig: ConversionOptimizationConfig = {
      algorithm: {
        algorithm: 'neural_network',
        parameters: {
          learningRate: 0.001,
          generations: 50,
          batchSize: 32
        },
        convergenceCriteria: {
          maxIterations: 50,
          toleranceThreshold: 0.001,
          improvementThreshold: 0.01,
          stallGenerations: 10
        }
      },
      objectives: {
        maximizeEfficiency: {
          weight: 0.4,
          target: 0.95,
          priority: 'high'
        },
        minimizeEnergyLoss: {
          weight: 0.3,
          target: 50, // W
          priority: 'medium'
        },
        maximizePowerOutput: {
          weight: 0.2,
          target: 50000, // W
          priority: 'medium'
        },
        minimizeCost: {
          weight: 0.05,
          target: 0.03, // $/kWh
          priority: 'low'
        },
        maximizeLifespan: {
          weight: 0.25,
          target: 87600, // 10 years
          priority: 'high'
        },
        minimizeEmissions: {
          weight: 0.2,
          target: 0.05, // kg CO2
          priority: 'medium'
        }
      },
      constraints: {
        efficiency: { minimum: 0.6, maximum: 0.98 },
        power: { minimum: 0, maximum: 100000 },
        temperature: { minimum: -40, maximum: 80 },
        cost: { maximum: 0.1 },
        emissions: { maximum: 0.5 },
        reliability: { minimum: 0.9 },
        responseTime: { maximum: 1000 }
      },
      updateInterval: 30000, // 30 seconds
      adaptiveLearning: true,
      realTimeOptimization: true
    };

    this.optimalEnergyConverter = new OptimalEnergyConverter(conversionConfig);
  }

  /**
   * Process complete energy system cycle for vehicles
   */
  public async processEnhancedEnergySystem(inputs: EnhancedSystemInputs): Promise<EnhancedSystemOutputs> {
    try {
      // Process traditional fuzzy control regenerative braking
      const fuzzyOutputs = this.fuzzyControlSystem.processControlCycle(inputs);

      // Process continuous energy generation for each wheel with optimization
      const continuousGeneration = await this.processOptimizedContinuousGeneration(inputs);

      // Calculate total system performance
      const totalGeneratedPower = this.calculateTotalGeneratedPower(fuzzyOutputs, continuousGeneration);
      const netEnergyBalance = this.calculateNetEnergyBalance(totalGeneratedPower, inputs.powerDemand);
      const gridExportPower = this.calculateGridExportCapability(netEnergyBalance, inputs);
      const systemEfficiency = this.calculateOverallSystemEfficiency(fuzzyOutputs, continuousGeneration);
      const energyIndependenceRatio = this.calculateEnergyIndependenceRatio(totalGeneratedPower, inputs.powerDemand);

      // Update performance tracking
      this.updatePerformanceHistory(totalGeneratedPower, inputs.powerDemand, systemEfficiency);

      return {
        ...fuzzyOutputs,
        continuousGeneration,
        totalGeneratedPower,
        netEnergyBalance,
        gridExportPower,
        systemEfficiency,
        energyIndependenceRatio
      };

    } catch (error) {
      console.error('Enhanced energy system error:', error);
      return this.generateFailsafeOutputs(inputs);
    }
  }

  /**
   * Process optimized continuous energy generation using advanced algorithms
   */
  private async processOptimizedContinuousGeneration(inputs: EnhancedSystemInputs): Promise<{
    frontLeft: PowerOutput;
    frontRight: PowerOutput;
    rearLeft?: PowerOutput;
    rearRight?: PowerOutput;
  }> {
    const results: any = {};

    // Process each wheel with optimization
    for (const [position, generator] of this.continuousGenerators) {
      const wheelData = this.getWheelDataForPosition(position, inputs);
      if (wheelData) {
        // Create energy conversion parameters for optimization
        const conversionParams: EnergyConversionParameters = {
          sourceType: 'electromagnetic',
          inputPower: wheelData.rotationalPower,
          inputVoltage: 12, // Typical automotive voltage
          inputCurrent: wheelData.rotationalPower / 12,
          inputFrequency: wheelData.rotationFrequency,
          temperature: inputs.ambientTemperature,
          efficiency: 0.85, // Base efficiency
          loadResistance: 10, // Ohms
          conversionRatio: 1.0,
          harmonicDistortion: 2.0, // %
          powerFactor: 0.95
        };

        // Create system state
        const systemState: EnergySystemState = {
          timestamp: Date.now(),
          sources: new Map([[position, conversionParams]]),
          storage: new Map(),
          loads: new Map([['vehicle_load', { power: inputs.powerDemand / 4, priority: 1 }]]),
          grid: {
            frequency: 50, // Hz
            voltage: 400, // V
            powerFactor: 0.95,
            harmonics: 2.0
          },
          environment: {
            temperature: inputs.ambientTemperature,
            humidity: 50,
            pressure: 101325,
            windSpeed: 0,
            solarIrradiance: 0
          }
        };

        try {
          // Optimize energy conversion
          const optimizationResult = await this.optimalEnergyConverter.optimizeConversion(
            conversionParams,
            systemState
          );

          if (optimizationResult.success) {
            // Apply optimized parameters to generator
            const optimizedParams = optimizationResult.optimalParameters.conversionParameters;
            const optimizedOutput = generator.calculateContinuousGeneration(
              wheelData,
              inputs.batterySOC,
              inputs.ambientTemperature
            );

            // Enhance output with optimization results
            results[position] = {
              ...optimizedOutput,
              instantaneousPower: optimizedOutput.instantaneousPower * (optimizedParams?.efficiency || 1.0),
              efficiency: optimizationResult.performanceMetrics.efficiency.optimal
            };
          } else {
            // Fallback to standard generation
            results[position] = generator.calculateContinuousGeneration(
              wheelData,
              inputs.batterySOC,
              inputs.ambientTemperature
            );
          }
        } catch (error) {
          console.warn(`Optimization failed for ${position}, using standard generation:`, error);
          results[position] = generator.calculateContinuousGeneration(
            wheelData,
            inputs.batterySOC,
            inputs.ambientTemperature
          );
        }
      }
    }

    return results;
  }

  /**
   * Process energy system for train applications
   */
  public processTrainEnergySystem(
    inputs: EnhancedSystemInputs,
    trainInputs: TrainSpecificInputs
  ): TrainSystemOutputs {
    // Process base enhanced energy system
    const baseOutputs = this.processEnhancedEnergySystem(inputs);

    // Calculate train-specific metrics
    const trainSpecificMetrics = this.calculateTrainSpecificMetrics(
      baseOutputs,
      trainInputs,
      inputs
    );

    return {
      ...baseOutputs,
      trainSpecificMetrics
    };
  }

  /**
   * Process continuous energy generation for all wheels
   */
  private processContinuousGeneration(inputs: EnhancedSystemInputs): {
    frontLeft: PowerOutput;
    frontRight: PowerOutput;
    rearLeft?: PowerOutput;
    rearRight?: PowerOutput;
  } {
    const results: any = {};

    // Process front wheels
    const frontLeftGenerator = this.continuousGenerators.get('frontLeft');
    if (frontLeftGenerator) {
      results.frontLeft = frontLeftGenerator.calculateContinuousGeneration(
        inputs.wheelRotationData.frontLeft,
        inputs.batterySOC,
        inputs.ambientTemperature
      );
    }

    const frontRightGenerator = this.continuousGenerators.get('frontRight');
    if (frontRightGenerator) {
      results.frontRight = frontRightGenerator.calculateContinuousGeneration(
        inputs.wheelRotationData.frontRight,
        inputs.batterySOC,
        inputs.ambientTemperature
      );
    }

    // Process rear wheels if equipped
    if (inputs.wheelRotationData.rearLeft) {
      const rearLeftGenerator = this.continuousGenerators.get('rearLeft');
      if (rearLeftGenerator) {
        results.rearLeft = rearLeftGenerator.calculateContinuousGeneration(
          inputs.wheelRotationData.rearLeft,
          inputs.batterySOC,
          inputs.ambientTemperature
        );
      }
    }

    if (inputs.wheelRotationData.rearRight) {
      const rearRightGenerator = this.continuousGenerators.get('rearRight');
      if (rearRightGenerator) {
        results.rearRight = rearRightGenerator.calculateContinuousGeneration(
          inputs.wheelRotationData.rearRight,
          inputs.batterySOC,
          inputs.ambientTemperature
        );
      }
    }

    return results;
  }

  /**
   * Calculate total generated power from all sources
   */
  private calculateTotalGeneratedPower(
    fuzzyOutputs: SystemOutputs,
    continuousGeneration: any
  ): number {
    // Power from regenerative braking
    const regenerativePower = fuzzyOutputs.regeneratedPower;

    // Power from continuous generation
    let continuousPower = 0;
    continuousPower += continuousGeneration.frontLeft?.instantaneousPower || 0;
    continuousPower += continuousGeneration.frontRight?.instantaneousPower || 0;
    continuousPower += continuousGeneration.rearLeft?.instantaneousPower || 0;
    continuousPower += continuousGeneration.rearRight?.instantaneousPower || 0;

    return regenerativePower + continuousPower;
  }

  /**
   * Calculate net energy balance (generation vs consumption)
   */
  private calculateNetEnergyBalance(totalGeneratedPower: number, powerDemand: number): number {
    return totalGeneratedPower - powerDemand;
  }

  /**
   * Calculate power available for grid export
   */
  private calculateGridExportCapability(
    netEnergyBalance: number,
    inputs: EnhancedSystemInputs
  ): number {
    if (!inputs.energyExportEnabled || inputs.gridConnectionStatus !== 'connected') {
      return 0;
    }

    if (netEnergyBalance > 0 && inputs.batterySOC > 0.8) {
      // Only export when battery is sufficiently charged and there's surplus
      return Math.max(0, netEnergyBalance * 0.8); // Reserve 20% for system stability
    }

    return 0;
  }

  /**
   * Calculate overall system efficiency
   */
  private calculateOverallSystemEfficiency(
    fuzzyOutputs: SystemOutputs,
    continuousGeneration: any
  ): number {
    // Weighted average of regenerative and continuous generation efficiencies
    const regenPower = fuzzyOutputs.regeneratedPower;
    const regenEfficiency = fuzzyOutputs.energyRecoveryEfficiency;

    let totalContinuousPower = 0;
    let weightedContinuousEfficiency = 0;

    Object.values(continuousGeneration).forEach((output: any) => {
      if (output && output.instantaneousPower) {
        totalContinuousPower += output.instantaneousPower;
        weightedContinuousEfficiency += output.efficiency * output.instantaneousPower;
      }
    });

    const avgContinuousEfficiency = totalContinuousPower > 0 ? 
      weightedContinuousEfficiency / totalContinuousPower : 0;

    const totalPower = regenPower + totalContinuousPower;
    if (totalPower === 0) return 0;

    return (regenPower * regenEfficiency + totalContinuousPower * avgContinuousEfficiency) / totalPower;
  }

  /**
   * Calculate energy independence ratio
   */
  private calculateEnergyIndependenceRatio(totalGeneratedPower: number, powerDemand: number): number {
    if (powerDemand === 0) return totalGeneratedPower > 0 ? 1.0 : 0.0;
    return Math.min(1.0, totalGeneratedPower / powerDemand);
  }

  /**
   * Calculate train-specific performance metrics
   */
  private calculateTrainSpecificMetrics(
    baseOutputs: EnhancedSystemOutputs,
    trainInputs: TrainSpecificInputs,
    systemInputs: EnhancedSystemInputs
  ): any {
    const powerPerCar = baseOutputs.totalGeneratedPower / trainInputs.carCount;
    const totalTrainPower = baseOutputs.totalGeneratedPower * trainInputs.carCount;

    // Calculate energy recovery from gradient (downhill operation)
    const gradientEnergyRecovery = this.calculateGradientEnergyRecovery(
      trainInputs,
      systemInputs.vehicleSpeed
    );

    // Calculate grid tie capability at stations
    const gridTieCapability = this.calculateTrainGridTieCapability(
      totalTrainPower,
      trainInputs,
      systemInputs
    );

    return {
      powerPerCar,
      totalTrainPower,
      energyRecoveryFromGradient: gradientEnergyRecovery,
      gridTieCapability
    };
  }

  /**
   * Calculate energy recovery from downhill gradient operation
   */
  private calculateGradientEnergyRecovery(
    trainInputs: TrainSpecificInputs,
    vehicleSpeed: number
  ): number {
    if (trainInputs.gradientAngle <= 0) return 0; // Only downhill generates energy

    const speedMs = vehicleSpeed / 3.6; // Convert to m/s
    const gravitationalForce = trainInputs.totalWeight * 9.81 * Math.sin(trainInputs.gradientAngle * Math.PI / 180);
    const gravitationalPower = gravitationalForce * speedMs;

    // Apply efficiency factor for energy recovery
    const recoveryEfficiency = 0.85; // 85% efficiency for gradient energy recovery
    return gravitationalPower * recoveryEfficiency;
  }

  /**
   * Calculate grid tie capability for trains at stations
   */
  private calculateTrainGridTieCapability(
    totalTrainPower: number,
    trainInputs: TrainSpecificInputs,
    systemInputs: EnhancedSystemInputs
  ): number {
    // Grid tie is most effective when train is stationary or moving slowly
    if (systemInputs.vehicleSpeed > 10) return 0; // No grid tie at speed

    // Calculate available power for grid export
    let gridTiePower = totalTrainPower;

    // Reduce based on train type and operational requirements
    switch (trainInputs.trainConfiguration) {
      case 'passenger':
        gridTiePower *= 0.7; // Reserve 30% for passenger services
        break;
      case 'freight':
        gridTiePower *= 0.9; // Reserve 10% for freight operations
        break;
      case 'high_speed':
        gridTiePower *= 0.6; // Reserve 40% for high-speed systems
        break;
    }

    return Math.max(0, gridTiePower);
  }

  /**
   * Update performance history tracking
   */
  private updatePerformanceHistory(
    totalGeneration: number,
    totalConsumption: number,
    efficiency: number
  ): void {
    const currentTime = Date.now();

    this.performanceHistory.push({
      timestamp: currentTime,
      totalGeneration,
      totalConsumption,
      efficiency
    });

    // Keep only last 1000 entries
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory.shift();
    }

    // Update cumulative energy balance
    const energyDelta = (totalGeneration - totalConsumption) / 3600; // Convert to Wh
    this.totalEnergyBalance += energyDelta;
  }

  /**
   * Generate failsafe outputs in case of system errors
   */
  private generateFailsafeOutputs(inputs: EnhancedSystemInputs): EnhancedSystemOutputs {
    const baseFallback = this.fuzzyControlSystem.processControlCycle(inputs);

    return {
      ...baseFallback,
      continuousGeneration: {
        frontLeft: { instantaneousPower: 0, averagePower: 0, peakPower: 0, energyGenerated: 0, efficiency: 0, parasiteLoad: 0 },
        frontRight: { instantaneousPower: 0, averagePower: 0, peakPower: 0, energyGenerated: 0, efficiency: 0, parasiteLoad: 0 }
      },
      totalGeneratedPower: baseFallback.regeneratedPower,
      netEnergyBalance: baseFallback.regeneratedPower - inputs.powerDemand,
      gridExportPower: 0,
      systemEfficiency: baseFallback.energyRecoveryEfficiency,
      energyIndependenceRatio: 0
    };
  }

  /**
   * Optimize system parameters for maximum efficiency
   */
  public optimizeSystemParameters(inputs: EnhancedSystemInputs): {
    recommendedSettings: any;
    expectedImprovement: number;
    optimizationStrategy: string;
  } {
    // Analyze current performance
    const currentEfficiency = this.calculateCurrentSystemEfficiency();
    
    // Optimize continuous generators
    const generatorOptimizations = new Map();
    this.continuousGenerators.forEach((generator, position) => {
      const wheelData = this.getWheelDataForPosition(position, inputs);
      if (wheelData) {
        const optimization = generator.optimizeGenerationParameters(
          wheelData,
          inputs.batterySOC,
          inputs.powerDemand / 4 // Distribute power demand across wheels
        );
        generatorOptimizations.set(position, optimization);
      }
    });

    // Determine optimization strategy
    let strategy = 'balanced';
    if (inputs.batterySOC < 0.3) {
      strategy = 'maximum_generation';
    } else if (inputs.batterySOC > 0.9) {
      strategy = 'efficiency_focused';
    } else if (inputs.powerDemand > 50000) {
      strategy = 'high_demand_response';
    }

    const expectedImprovement = this.calculateExpectedImprovement(currentEfficiency, strategy);

    return {
      recommendedSettings: {
        generatorOptimizations: Object.fromEntries(generatorOptimizations),
        systemStrategy: strategy,
        priorityMode: this.determinePriorityMode(inputs)
      },
      expectedImprovement,
      optimizationStrategy: strategy
    };
  }

  /**
   * Get wheel rotation data for specific position
   */
  private getWheelDataForPosition(position: string, inputs: EnhancedSystemInputs): WheelRotationData | null {
    switch (position) {
      case 'frontLeft':
        return inputs.wheelRotationData.frontLeft;
      case 'frontRight':
        return inputs.wheelRotationData.frontRight;
      case 'rearLeft':
        return inputs.wheelRotationData.rearLeft || null;
      case 'rearRight':
        return inputs.wheelRotationData.rearRight || null;
      default:
        return null;
    }
  }

  /**
   * Calculate current system efficiency
   */
  private calculateCurrentSystemEfficiency(): number {
    if (this.performanceHistory.length === 0) return 0;
    
    const recentHistory = this.performanceHistory.slice(-10);
    const avgEfficiency = recentHistory.reduce((sum, entry) => sum + entry.efficiency, 0) / recentHistory.length;
    
    return avgEfficiency;
  }

  /**
   * Calculate expected improvement from optimization
   */
  private calculateExpectedImprovement(currentEfficiency: number, strategy: string): number {
    const baseImprovement = {
      'balanced': 0.05,           // 5% improvement
      'maximum_generation': 0.08, // 8% improvement
      'efficiency_focused': 0.12, // 12% improvement
      'high_demand_response': 0.06 // 6% improvement
    };

    return (baseImprovement[strategy] || 0.05) * (1 - currentEfficiency);
  }

  /**
   * Determine priority mode based on system conditions
   */
  private determinePriorityMode(inputs: EnhancedSystemInputs): string {
    if (inputs.batterySOC < 0.2) return 'emergency_charging';
    if (inputs.powerDemand > 80000) return 'high_power_demand';
    if (inputs.gridConnectionStatus === 'connected' && inputs.energyExportEnabled) return 'grid_export';
    return 'normal_operation';
  }

  /**
   * Get comprehensive system diagnostics
   */
  public getSystemDiagnostics(): {
    systemUptime: number;
    totalEnergyBalance: number;
    averageSystemEfficiency: number;
    generatorDiagnostics: Map<string, any>;
    fuzzyControlDiagnostics: any;
    performanceMetrics: any;
    maintenanceRecommendations: string[];
  } {
    const systemUptime = Date.now() - this.systemStartTime;
    const averageSystemEfficiency = this.calculateCurrentSystemEfficiency();

    // Collect diagnostics from all generators
    const generatorDiagnostics = new Map();
    this.continuousGenerators.forEach((generator, position) => {
      generatorDiagnostics.set(position, generator.getSystemDiagnostics());
    });

    // Get fuzzy control diagnostics
    const fuzzyControlDiagnostics = this.fuzzyControlSystem.getSystemDiagnostics();

    // Generate maintenance recommendations
    const maintenanceRecommendations = this.generateMaintenanceRecommendations(
      generatorDiagnostics,
      fuzzyControlDiagnostics
    );

    return {
      systemUptime,
      totalEnergyBalance: this.totalEnergyBalance,
      averageSystemEfficiency,
      generatorDiagnostics,
      fuzzyControlDiagnostics,
      performanceMetrics: {
        performanceHistory: this.performanceHistory.slice(-100),
        peakGeneration: Math.max(...this.performanceHistory.map(entry => entry.totalGeneration)),
        averageGeneration: this.performanceHistory.reduce((sum, entry) => sum + entry.totalGeneration, 0) / this.performanceHistory.length
      },
      maintenanceRecommendations
    };
  }

  /**
   * Generate maintenance recommendations based on system diagnostics
   */
  private generateMaintenanceRecommendations(
    generatorDiagnostics: Map<string, any>,
    fuzzyControlDiagnostics: any
  ): string[] {
    const recommendations: string[] = [];

    // Check generator maintenance needs
    generatorDiagnostics.forEach((diagnostics, position) => {
      if (diagnostics.maintenanceStatus === 'Required') {
        recommendations.push(`${position} generator requires maintenance`);
      }
      if (diagnostics.averageEfficiency < 0.85) {
        recommendations.push(`${position} generator efficiency degraded - check magnetic field alignment`);
      }
    });

    // Check fuzzy control system
    if (fuzzyControlDiagnostics.systemFaults.length > 0) {
      recommendations.push('Fuzzy control system has active faults - investigate and resolve');
    }

    // Check overall system performance
    const avgEfficiency = this.calculateCurrentSystemEfficiency();
    if (avgEfficiency < 0.80) {
      recommendations.push('Overall system efficiency below optimal - comprehensive system check recommended');
    }

    return recommendations;
  }

  /**
   * Perform system-wide maintenance reset
   */
  public performSystemMaintenance(): void {
    // Reset all generators
    this.continuousGenerators.forEach(generator => {
      generator.performMaintenance();
    });

    // Reset fuzzy control system
    this.fuzzyControlSystem.resetSystemFaults();

    // Reset performance tracking
    this.performanceHistory = [];
    this.totalEnergyBalance = 0;

    console.log('Enhanced energy system maintenance completed');
  }
}