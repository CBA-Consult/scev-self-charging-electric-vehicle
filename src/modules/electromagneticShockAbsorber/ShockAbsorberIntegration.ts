/**
 * Shock Absorber Integration System
 * 
 * This module integrates the rotary electromagnetic shock absorber with the
 * existing fuzzy control system and vehicle energy management.
 */

import { 
  RotaryElectromagneticShockAbsorber, 
  SuspensionInputs, 
  ShockAbsorberOutputs,
  DampingMode 
} from './RotaryElectromagneticShockAbsorber';

import { 
  FuzzyControlIntegration,
  SystemInputs,
  SystemOutputs 
} from '../fuzzyControl/FuzzyControlIntegration';

export interface VehicleSuspensionInputs {
  /** Front left suspension inputs */
  frontLeft: SuspensionInputs;
  /** Front right suspension inputs */
  frontRight: SuspensionInputs;
  /** Rear left suspension inputs */
  rearLeft: SuspensionInputs;
  /** Rear right suspension inputs */
  rearRight: SuspensionInputs;
}

export interface VehicleSuspensionOutputs {
  /** Front left shock absorber outputs */
  frontLeft: ShockAbsorberOutputs;
  /** Front right shock absorber outputs */
  frontRight: ShockAbsorberOutputs;
  /** Rear left shock absorber outputs */
  rearLeft: ShockAbsorberOutputs;
  /** Rear right shock absorber outputs */
  rearRight: ShockAbsorberOutputs;
  /** Total power generated (W) */
  totalGeneratedPower: number;
  /** Average system efficiency */
  averageEfficiency: number;
  /** Total energy harvested (Wh) */
  totalEnergyHarvested: number;
}

export interface EnergyManagementInputs {
  /** Battery state of charge (0-1) */
  batterySOC: number;
  /** Current power demand (W) */
  powerDemand: number;
  /** Energy storage capacity available (Wh) */
  availableStorageCapacity: number;
  /** Grid connection status */
  gridConnected: boolean;
}

export interface IntegratedSystemOutputs extends VehicleSuspensionOutputs {
  /** Recommended energy distribution */
  energyDistribution: {
    toBattery: number;
    toGrid: number;
    toVehicleSystems: number;
  };
  /** System optimization recommendations */
  optimizationRecommendations: string[];
  /** Performance metrics */
  performanceMetrics: {
    energyEfficiency: number;
    rideComfort: number;
    systemReliability: number;
  };
}

export class ShockAbsorberIntegration {
  private frontLeftShockAbsorber: RotaryElectromagneticShockAbsorber;
  private frontRightShockAbsorber: RotaryElectromagneticShockAbsorber;
  private rearLeftShockAbsorber: RotaryElectromagneticShockAbsorber;
  private rearRightShockAbsorber: RotaryElectromagneticShockAbsorber;
  private fuzzyControlSystem?: FuzzyControlIntegration;
  private totalEnergyHarvested: number;
  private operationStartTime: number;

  constructor(fuzzyControlSystem?: FuzzyControlIntegration) {
    // Initialize shock absorbers for each wheel
    this.frontLeftShockAbsorber = new RotaryElectromagneticShockAbsorber();
    this.frontRightShockAbsorber = new RotaryElectromagneticShockAbsorber();
    this.rearLeftShockAbsorber = new RotaryElectromagneticShockAbsorber();
    this.rearRightShockAbsorber = new RotaryElectromagneticShockAbsorber();
    
    this.fuzzyControlSystem = fuzzyControlSystem;
    this.totalEnergyHarvested = 0;
    this.operationStartTime = Date.now();
  }

  /**
   * Process all suspension inputs and generate integrated outputs
   */
  public processVehicleSuspension(
    suspensionInputs: VehicleSuspensionInputs,
    energyInputs: EnergyManagementInputs
  ): IntegratedSystemOutputs {
    // Process each shock absorber
    const frontLeft = this.frontLeftShockAbsorber.processMotion(suspensionInputs.frontLeft);
    const frontRight = this.frontRightShockAbsorber.processMotion(suspensionInputs.frontRight);
    const rearLeft = this.rearLeftShockAbsorber.processMotion(suspensionInputs.rearLeft);
    const rearRight = this.rearRightShockAbsorber.processMotion(suspensionInputs.rearRight);

    // Calculate total power and efficiency
    const totalGeneratedPower = frontLeft.generatedPower + frontRight.generatedPower + 
                                rearLeft.generatedPower + rearRight.generatedPower;
    
    const averageEfficiency = (frontLeft.efficiency + frontRight.efficiency + 
                              rearLeft.efficiency + rearRight.efficiency) / 4;

    // Update total energy harvested
    const dt = 0.001; // 1ms time step
    this.totalEnergyHarvested += (totalGeneratedPower * dt) / 3600; // Convert to Wh

    // Optimize damping modes based on conditions
    this.optimizeDampingModes(suspensionInputs, energyInputs);

    // Calculate energy distribution
    const energyDistribution = this.calculateEnergyDistribution(totalGeneratedPower, energyInputs);

    // Generate optimization recommendations
    const optimizationRecommendations = this.generateOptimizationRecommendations(
      { frontLeft, frontRight, rearLeft, rearRight },
      energyInputs
    );

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(
      { frontLeft, frontRight, rearLeft, rearRight },
      suspensionInputs
    );

    return {
      frontLeft,
      frontRight,
      rearLeft,
      rearRight,
      totalGeneratedPower,
      averageEfficiency,
      totalEnergyHarvested: this.totalEnergyHarvested,
      energyDistribution,
      optimizationRecommendations,
      performanceMetrics
    };
  }

  /**
   * Optimize damping modes based on current conditions
   */
  private optimizeDampingModes(
    suspensionInputs: VehicleSuspensionInputs,
    energyInputs: EnergyManagementInputs
  ): void {
    // Determine optimal mode based on energy needs and driving conditions
    let optimalMode: DampingMode = 'adaptive';

    // Energy harvesting priority when battery is low
    if (energyInputs.batterySOC < 0.3) {
      optimalMode = 'energy_harvesting';
    }
    // Comfort mode when battery is full and smooth roads
    else if (energyInputs.batterySOC > 0.9 && this.isRoadSmooth(suspensionInputs)) {
      optimalMode = 'comfort';
    }
    // Sport mode for high-speed driving
    else if (this.isHighSpeedDriving(suspensionInputs)) {
      optimalMode = 'sport';
    }

    // Apply mode to all shock absorbers
    this.frontLeftShockAbsorber.setDampingMode(optimalMode);
    this.frontRightShockAbsorber.setDampingMode(optimalMode);
    this.rearLeftShockAbsorber.setDampingMode(optimalMode);
    this.rearRightShockAbsorber.setDampingMode(optimalMode);
  }

  /**
   * Check if road conditions are smooth
   */
  private isRoadSmooth(suspensionInputs: VehicleSuspensionInputs): boolean {
    const conditions = [
      suspensionInputs.frontLeft.roadCondition,
      suspensionInputs.frontRight.roadCondition,
      suspensionInputs.rearLeft.roadCondition,
      suspensionInputs.rearRight.roadCondition
    ];
    
    return conditions.every(condition => condition === 'smooth');
  }

  /**
   * Check if vehicle is in high-speed driving mode
   */
  private isHighSpeedDriving(suspensionInputs: VehicleSuspensionInputs): boolean {
    const speeds = [
      suspensionInputs.frontLeft.vehicleSpeed,
      suspensionInputs.frontRight.vehicleSpeed,
      suspensionInputs.rearLeft.vehicleSpeed,
      suspensionInputs.rearRight.vehicleSpeed
    ];
    
    const averageSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
    return averageSpeed > 80; // km/h
  }

  /**
   * Calculate optimal energy distribution
   */
  private calculateEnergyDistribution(
    totalPower: number,
    energyInputs: EnergyManagementInputs
  ): { toBattery: number; toGrid: number; toVehicleSystems: number } {
    let toBattery = 0;
    let toGrid = 0;
    let toVehicleSystems = 0;

    // Priority 1: Meet immediate vehicle power demand
    const vehicleSystemsPower = Math.min(totalPower, energyInputs.powerDemand);
    toVehicleSystems = vehicleSystemsPower;
    let remainingPower = totalPower - vehicleSystemsPower;

    // Priority 2: Charge battery if SOC is low
    if (energyInputs.batterySOC < 0.8 && remainingPower > 0) {
      const maxBatteryPower = energyInputs.availableStorageCapacity * 1000; // Convert Wh to W (assuming 1h charge)
      toBattery = Math.min(remainingPower, maxBatteryPower);
      remainingPower -= toBattery;
    }

    // Priority 3: Export to grid if connected and battery is sufficiently charged
    if (energyInputs.gridConnected && energyInputs.batterySOC > 0.6 && remainingPower > 0) {
      toGrid = remainingPower;
    } else if (remainingPower > 0) {
      // Add remaining power to battery if grid not available
      toBattery += remainingPower;
    }

    return { toBattery, toGrid, toVehicleSystems };
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationRecommendations(
    outputs: {
      frontLeft: ShockAbsorberOutputs;
      frontRight: ShockAbsorberOutputs;
      rearLeft: ShockAbsorberOutputs;
      rearRight: ShockAbsorberOutputs;
    },
    energyInputs: EnergyManagementInputs
  ): string[] {
    const recommendations: string[] = [];

    // Check for efficiency imbalances
    const efficiencies = [
      outputs.frontLeft.efficiency,
      outputs.frontRight.efficiency,
      outputs.rearLeft.efficiency,
      outputs.rearRight.efficiency
    ];
    
    const avgEfficiency = efficiencies.reduce((sum, eff) => sum + eff, 0) / 4;
    const minEfficiency = Math.min(...efficiencies);
    
    if (avgEfficiency - minEfficiency > 0.1) {
      recommendations.push('Efficiency imbalance detected - consider maintenance check');
    }

    // Power generation recommendations
    const totalPower = outputs.frontLeft.generatedPower + outputs.frontRight.generatedPower + 
                      outputs.rearLeft.generatedPower + outputs.rearRight.generatedPower;
    
    if (totalPower < 100 && energyInputs.batterySOC < 0.5) {
      recommendations.push('Low power generation - consider switching to energy harvesting mode');
    }

    // Temperature warnings
    const systems = [
      this.frontLeftShockAbsorber.getSystemStatus(),
      this.frontRightShockAbsorber.getSystemStatus(),
      this.rearLeftShockAbsorber.getSystemStatus(),
      this.rearRightShockAbsorber.getSystemStatus()
    ];

    const maxTemp = Math.max(...systems.map(s => s.operatingTemperature));
    if (maxTemp > 100) {
      recommendations.push('High operating temperature detected - reduce energy harvesting intensity');
    }

    // Energy storage recommendations
    if (energyInputs.batterySOC > 0.95 && !energyInputs.gridConnected) {
      recommendations.push('Battery nearly full - consider grid connection for energy export');
    }

    return recommendations;
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(
    outputs: {
      frontLeft: ShockAbsorberOutputs;
      frontRight: ShockAbsorberOutputs;
      rearLeft: ShockAbsorberOutputs;
      rearRight: ShockAbsorberOutputs;
    },
    suspensionInputs: VehicleSuspensionInputs
  ): { energyEfficiency: number; rideComfort: number; systemReliability: number } {
    // Energy efficiency metric
    const efficiencies = [
      outputs.frontLeft.efficiency,
      outputs.frontRight.efficiency,
      outputs.rearLeft.efficiency,
      outputs.rearRight.efficiency
    ];
    const energyEfficiency = efficiencies.reduce((sum, eff) => sum + eff, 0) / 4;

    // Ride comfort metric (based on damping force consistency)
    const dampingForces = [
      outputs.frontLeft.dampingForce,
      outputs.frontRight.dampingForce,
      outputs.rearLeft.dampingForce,
      outputs.rearRight.dampingForce
    ];
    
    const avgDampingForce = dampingForces.reduce((sum, force) => sum + Math.abs(force), 0) / 4;
    const dampingVariance = dampingForces.reduce((sum, force) => 
      sum + Math.pow(Math.abs(force) - avgDampingForce, 2), 0) / 4;
    
    const rideComfort = Math.max(0, 1 - (Math.sqrt(dampingVariance) / avgDampingForce));

    // System reliability metric
    const systems = [
      this.frontLeftShockAbsorber.getSystemStatus(),
      this.frontRightShockAbsorber.getSystemStatus(),
      this.rearLeftShockAbsorber.getSystemStatus(),
      this.rearRightShockAbsorber.getSystemStatus()
    ];

    const operationalSystems = systems.filter(s => s.isOperational).length;
    const systemReliability = operationalSystems / systems.length;

    return {
      energyEfficiency,
      rideComfort: Math.max(0, Math.min(1, rideComfort)),
      systemReliability
    };
  }

  /**
   * Get comprehensive system status
   */
  public getSystemStatus(): {
    shockAbsorbers: {
      frontLeft: ReturnType<RotaryElectromagneticShockAbsorber['getSystemStatus']>;
      frontRight: ReturnType<RotaryElectromagneticShockAbsorber['getSystemStatus']>;
      rearLeft: ReturnType<RotaryElectromagneticShockAbsorber['getSystemStatus']>;
      rearRight: ReturnType<RotaryElectromagneticShockAbsorber['getSystemStatus']>;
    };
    totalEnergyHarvested: number;
    operationTime: number;
    averagePowerGeneration: number;
  } {
    const operationTime = (Date.now() - this.operationStartTime) / 1000; // seconds
    const averagePowerGeneration = operationTime > 0 ? 
      (this.totalEnergyHarvested * 3600) / operationTime : 0; // Convert Wh to W

    return {
      shockAbsorbers: {
        frontLeft: this.frontLeftShockAbsorber.getSystemStatus(),
        frontRight: this.frontRightShockAbsorber.getSystemStatus(),
        rearLeft: this.rearLeftShockAbsorber.getSystemStatus(),
        rearRight: this.rearRightShockAbsorber.getSystemStatus()
      },
      totalEnergyHarvested: this.totalEnergyHarvested,
      operationTime,
      averagePowerGeneration
    };
  }

  /**
   * Reset all systems
   */
  public resetAllSystems(): void {
    this.frontLeftShockAbsorber.resetSystem();
    this.frontRightShockAbsorber.resetSystem();
    this.rearLeftShockAbsorber.resetSystem();
    this.rearRightShockAbsorber.resetSystem();
    this.totalEnergyHarvested = 0;
    this.operationStartTime = Date.now();
  }

  /**
   * Integrate with fuzzy control system for coordinated energy management
   */
  public integrateWithFuzzyControl(systemInputs: SystemInputs): SystemOutputs | null {
    if (!this.fuzzyControlSystem) {
      return null;
    }

    // Process through fuzzy control system
    const fuzzyOutputs = this.fuzzyControlSystem.processControlCycle(systemInputs);

    // The fuzzy control system can influence shock absorber behavior
    // This creates a coordinated energy management approach
    return fuzzyOutputs;
  }
}