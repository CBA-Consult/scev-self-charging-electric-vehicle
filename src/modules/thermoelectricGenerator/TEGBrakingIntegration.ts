/**
 * TEG-Braking System Integration
 * 
 * This module integrates Thermoelectric Generators (TEG) with regenerative
 * braking systems to maximize energy recovery from both kinetic energy
 * and waste heat during braking events.
 */

import { ThermoelectricGenerator, TEGSystemInputs } from './ThermoelectricGenerator';
import { ThermalManagement } from './ThermalManagement';
import {
  BrakingThermalInputs,
  IntegratedBrakingOutputs,
  TEGConfiguration,
  ThermalConditions,
  TEGPerformance
} from './types';

// Import existing braking system types
import {
  BrakingInputs,
  BrakingOutputs,
  FuzzyRegenerativeBrakingController
} from '../fuzzyControl/FuzzyRegenerativeBrakingController';

export interface IntegratedBrakingInputs extends BrakingInputs {
  brakeTemperature: number;          // °C - Current brake temperature
  ambientTemperature: number;        // °C - Ambient air temperature
  airflow: number;                   // m/s - Air velocity around brakes
  tegSystemEnabled: boolean;         // Enable/disable TEG system
  thermalManagementMode: 'passive' | 'active' | 'adaptive';
}

export interface EnergyRecoveryStrategy {
  prioritizeRegeneration: boolean;   // Prioritize regenerative braking over TEG
  tegActivationThreshold: {
    temperature: number;             // °C - Minimum brake temp for TEG activation
    brakingIntensity: number;        // Minimum braking intensity for TEG
    duration: number;                // s - Minimum braking duration for TEG
  };
  powerManagement: {
    maxTegPower: number;             // W - Maximum TEG power output
    batteryChargingPriority: boolean; // Prioritize battery charging
    supercapacitorBuffering: boolean; // Use supercapacitor for power buffering
  };
  thermalLimits: {
    maxBrakeTemp: number;            // °C - Maximum safe brake temperature
    tegShutdownTemp: number;         // °C - TEG emergency shutdown temperature
    coolingActivationTemp: number;   // °C - Temperature to activate cooling
  };
}

export interface SystemDiagnostics {
  regenerativeBraking: {
    power: number;                   // W - Current regenerative power
    efficiency: number;              // % - Regenerative braking efficiency
    temperature: number;             // °C - Motor temperature
    status: 'active' | 'inactive' | 'limited' | 'fault';
  };
  tegSystem: {
    power: number;                   // W - Current TEG power
    efficiency: number;              // % - TEG conversion efficiency
    hotSideTemp: number;             // °C - TEG hot side temperature
    coldSideTemp: number;            // °C - TEG cold side temperature
    status: 'active' | 'inactive' | 'thermal_limit' | 'fault';
  };
  thermalManagement: {
    coolingPower: number;            // W - Cooling system power consumption
    heatRejection: number;           // W - Heat rejected to environment
    thermalEfficiency: number;       // % - Overall thermal management efficiency
    status: 'optimal' | 'active_cooling' | 'thermal_stress' | 'emergency';
  };
  overall: {
    totalRecoveredPower: number;     // W - Total energy recovery
    systemEfficiency: number;        // % - Overall system efficiency
    energySavings: number;           // % - Energy savings vs conventional braking
    reliability: number;             // % - System reliability score
  };
}

export class TEGBrakingIntegration {
  private regenerativeBrakingController: FuzzyRegenerativeBrakingController;
  private tegSystem: ThermoelectricGenerator;
  private thermalManagement: ThermalManagement;
  private energyRecoveryStrategy: EnergyRecoveryStrategy;
  private systemDiagnostics: SystemDiagnostics;
  private performanceHistory: IntegratedBrakingOutputs[];

  constructor(
    tegConfigurations?: Map<string, TEGConfiguration>,
    customStrategy?: Partial<EnergyRecoveryStrategy>
  ) {
    this.regenerativeBrakingController = new FuzzyRegenerativeBrakingController();
    this.tegSystem = new ThermoelectricGenerator();
    this.thermalManagement = new ThermalManagement();
    this.performanceHistory = [];

    // Initialize energy recovery strategy
    this.energyRecoveryStrategy = {
      prioritizeRegeneration: true,
      tegActivationThreshold: {
        temperature: 80,      // °C
        brakingIntensity: 0.3, // 30%
        duration: 2           // seconds
      },
      powerManagement: {
        maxTegPower: 500,     // W
        batteryChargingPriority: true,
        supercapacitorBuffering: true
      },
      thermalLimits: {
        maxBrakeTemp: 350,    // °C
        tegShutdownTemp: 300, // °C
        coolingActivationTemp: 200 // °C
      },
      ...customStrategy
    };

    // Initialize system diagnostics
    this.initializeSystemDiagnostics();

    // Add custom TEG configurations if provided
    if (tegConfigurations) {
      tegConfigurations.forEach((config, id) => {
        this.tegSystem.addTEGConfiguration(config);
      });
    }
  }

  /**
   * Main integrated braking control function
   */
  public calculateIntegratedBraking(inputs: IntegratedBrakingInputs): IntegratedBrakingOutputs {
    // Validate inputs
    this.validateInputs(inputs);

    // Calculate regenerative braking performance
    const regenInputs: BrakingInputs = {
      drivingSpeed: inputs.drivingSpeed,
      brakingIntensity: inputs.brakingIntensity,
      batterySOC: inputs.batterySOC,
      motorTemperature: inputs.motorTemperature
    };

    const regenOutputs = this.regenerativeBrakingController.calculateOptimalBraking(regenInputs);

    // Calculate braking thermal conditions
    const thermalInputs: BrakingThermalInputs = {
      vehicleSpeed: inputs.drivingSpeed,
      brakingForce: regenOutputs.frontAxleBrakingForce,
      brakingPower: this.calculateBrakingPower(inputs),
      brakeTemperature: inputs.brakeTemperature,
      motorTemperature: inputs.motorTemperature,
      ambientTemperature: inputs.ambientTemperature,
      airflow: inputs.airflow,
      brakingDuration: this.estimateBrakingDuration(inputs),
      regenerativeBrakingRatio: regenOutputs.regenerativeBrakingRatio
    };

    // Calculate TEG performance if enabled and conditions are met
    let tegPerformance: TEGPerformance | null = null;
    if (inputs.tegSystemEnabled && this.shouldActivateTEG(thermalInputs)) {
      tegPerformance = this.calculateTEGPerformance(thermalInputs, inputs.thermalManagementMode);
    }

    // Apply thermal management
    const thermalManagementResult = this.thermalManagement.manageThermalConditions(
      thermalInputs,
      inputs.thermalManagementMode,
      tegPerformance !== null
    );

    // Optimize power distribution
    const powerDistribution = this.optimizePowerDistribution(
      regenOutputs,
      tegPerformance,
      thermalManagementResult
    );

    // Calculate integrated outputs
    const integratedOutputs: IntegratedBrakingOutputs = {
      regenerativePower: regenOutputs.motorTorque * this.calculateMotorSpeed(inputs.drivingSpeed) / 1000, // Convert to kW
      tegPower: tegPerformance?.electricalPower || 0,
      totalRecoveredPower: powerDistribution.totalRecoveredPower,
      mechanicalBrakingPower: this.calculateMechanicalBrakingPower(inputs, regenOutputs),
      systemEfficiency: this.calculateSystemEfficiency(powerDistribution, thermalInputs),
      thermalEfficiency: tegPerformance?.efficiency || 0,
      brakeTemperature: thermalManagementResult.finalBrakeTemperature,
      tegTemperature: {
        hotSide: tegPerformance ? thermalManagementResult.tegTemperatures.hotSide : inputs.ambientTemperature,
        coldSide: tegPerformance ? thermalManagementResult.tegTemperatures.coldSide : inputs.ambientTemperature
      },
      powerDistribution: {
        battery: powerDistribution.batteryPower,
        supercapacitor: powerDistribution.supercapacitorPower,
        directUse: powerDistribution.directUsePower
      }
    };

    // Update system diagnostics
    this.updateSystemDiagnostics(integratedOutputs, regenOutputs, tegPerformance, thermalManagementResult);

    // Store performance history
    this.performanceHistory.push(integratedOutputs);
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory.shift();
    }

    return integratedOutputs;
  }

  /**
   * Determine if TEG should be activated based on conditions
   */
  private shouldActivateTEG(thermalInputs: BrakingThermalInputs): boolean {
    const threshold = this.energyRecoveryStrategy.tegActivationThreshold;

    return (
      thermalInputs.brakeTemperature >= threshold.temperature &&
      thermalInputs.regenerativeBrakingRatio <= (1 - threshold.brakingIntensity) &&
      thermalInputs.brakingDuration >= threshold.duration
    );
  }

  /**
   * Calculate TEG performance for current conditions
   */
  private calculateTEGPerformance(
    thermalInputs: BrakingThermalInputs,
    thermalMode: string
  ): TEGPerformance {
    // Select appropriate TEG configuration based on brake temperature
    let configId = 'brake_disc_teg';
    if (thermalInputs.brakeTemperature > 200) {
      configId = 'high_performance_brake_teg';
    } else if (thermalInputs.brakeTemperature > 150) {
      configId = 'brake_caliper_teg';
    }

    // Create thermal conditions for TEG
    const thermalConditions: ThermalConditions = {
      hotSideTemperature: thermalInputs.brakeTemperature,
      coldSideTemperature: thermalInputs.ambientTemperature + 20, // Assume 20°C rise due to cooling limitations
      ambientTemperature: thermalInputs.ambientTemperature,
      heatFlux: this.calculateHeatFlux(thermalInputs),
      convectionCoefficient: {
        hotSide: this.calculateConvectionCoefficient(thermalInputs.airflow, 'hot'),
        coldSide: this.calculateConvectionCoefficient(thermalInputs.airflow, 'cold')
      },
      airflow: {
        velocity: thermalInputs.airflow,
        temperature: thermalInputs.ambientTemperature
      },
      brakingDuration: thermalInputs.brakingDuration,
      brakingIntensity: 1 - thermalInputs.regenerativeBrakingRatio
    };

    // Create TEG system inputs
    const tegInputs: TEGSystemInputs = {
      thermalConditions,
      operatingMode: 'maximum_power',
      coolingSystemActive: thermalMode === 'active',
      thermalProtectionEnabled: true
    };

    return this.tegSystem.calculateTEGPower(configId, tegInputs);
  }

  /**
   * Optimize power distribution between systems
   */
  private optimizePowerDistribution(
    regenOutputs: BrakingOutputs,
    tegPerformance: TEGPerformance | null,
    thermalResult: any
  ): {
    totalRecoveredPower: number;
    batteryPower: number;
    supercapacitorPower: number;
    directUsePower: number;
  } {
    const regenPower = regenOutputs.motorTorque * 0.1; // Simplified conversion
    const tegPower = tegPerformance?.electricalPower || 0;
    const totalPower = regenPower + tegPower;

    // Apply power management strategy
    const strategy = this.energyRecoveryStrategy.powerManagement;
    
    let batteryPower = 0;
    let supercapacitorPower = 0;
    let directUsePower = 0;

    if (strategy.batteryChargingPriority) {
      // Prioritize battery charging
      batteryPower = Math.min(totalPower * 0.7, totalPower);
      const remainingPower = totalPower - batteryPower;

      if (strategy.supercapacitorBuffering) {
        supercapacitorPower = Math.min(remainingPower * 0.8, remainingPower);
        directUsePower = remainingPower - supercapacitorPower;
      } else {
        directUsePower = remainingPower;
      }
    } else {
      // Distribute power evenly
      batteryPower = totalPower * 0.4;
      supercapacitorPower = totalPower * 0.3;
      directUsePower = totalPower * 0.3;
    }

    return {
      totalRecoveredPower: totalPower,
      batteryPower,
      supercapacitorPower,
      directUsePower
    };
  }

  /**
   * Calculate system efficiency
   */
  private calculateSystemEfficiency(
    powerDistribution: any,
    thermalInputs: BrakingThermalInputs
  ): number {
    const totalBrakingPower = thermalInputs.brakingPower;
    const recoveredPower = powerDistribution.totalRecoveredPower;
    
    return totalBrakingPower > 0 ? (recoveredPower / totalBrakingPower) * 100 : 0;
  }

  /**
   * Calculate braking power from vehicle kinetic energy
   */
  private calculateBrakingPower(inputs: IntegratedBrakingInputs): number {
    // Simplified calculation: P = F * v where F is braking force, v is velocity
    const velocity = inputs.drivingSpeed / 3.6; // Convert km/h to m/s
    const estimatedMass = 1500; // kg - typical EV mass
    const brakingForce = inputs.brakingIntensity * estimatedMass * 9.81 * 0.8; // Assume 0.8 friction coefficient
    
    return brakingForce * velocity;
  }

  /**
   * Estimate braking duration based on intensity and speed
   */
  private estimateBrakingDuration(inputs: IntegratedBrakingInputs): number {
    // Simplified estimation based on braking intensity and speed
    const baseTime = 5; // seconds
    const intensityFactor = 1 / Math.max(0.1, inputs.brakingIntensity);
    const speedFactor = inputs.drivingSpeed / 50; // Normalize to 50 km/h
    
    return baseTime * intensityFactor * speedFactor;
  }

  /**
   * Calculate heat flux from braking
   */
  private calculateHeatFlux(thermalInputs: BrakingThermalInputs): number {
    // Heat flux = (1 - regenerative ratio) * braking power / brake surface area
    const mechanicalBrakingPower = thermalInputs.brakingPower * (1 - thermalInputs.regenerativeBrakingRatio);
    const brakeSurfaceArea = 0.1; // m² - typical brake disc area
    
    return mechanicalBrakingPower / brakeSurfaceArea;
  }

  /**
   * Calculate convection coefficient based on airflow
   */
  private calculateConvectionCoefficient(airflow: number, side: 'hot' | 'cold'): number {
    // Simplified correlation: h = a * v^b where v is velocity
    const baseCoeff = side === 'hot' ? 25 : 15; // W/(m²·K)
    const velocityExponent = 0.8;
    
    return baseCoeff * Math.pow(Math.max(1, airflow), velocityExponent);
  }

  /**
   * Calculate motor speed from vehicle speed
   */
  private calculateMotorSpeed(vehicleSpeed: number): number {
    // Simplified conversion: assume gear ratio and wheel radius
    const wheelRadius = 0.35; // m
    const gearRatio = 8.5;
    const vehicleSpeedMs = vehicleSpeed / 3.6; // Convert to m/s
    
    return (vehicleSpeedMs / wheelRadius) * gearRatio * 60 / (2 * Math.PI); // Convert to RPM
  }

  /**
   * Calculate mechanical braking power
   */
  private calculateMechanicalBrakingPower(
    inputs: IntegratedBrakingInputs,
    regenOutputs: BrakingOutputs
  ): number {
    const totalBrakingPower = this.calculateBrakingPower(inputs);
    const regenPower = regenOutputs.motorTorque * this.calculateMotorSpeed(inputs.drivingSpeed) / 1000;
    
    return Math.max(0, totalBrakingPower - regenPower);
  }

  /**
   * Initialize system diagnostics
   */
  private initializeSystemDiagnostics(): void {
    this.systemDiagnostics = {
      regenerativeBraking: {
        power: 0,
        efficiency: 0,
        temperature: 25,
        status: 'inactive'
      },
      tegSystem: {
        power: 0,
        efficiency: 0,
        hotSideTemp: 25,
        coldSideTemp: 25,
        status: 'inactive'
      },
      thermalManagement: {
        coolingPower: 0,
        heatRejection: 0,
        thermalEfficiency: 0,
        status: 'optimal'
      },
      overall: {
        totalRecoveredPower: 0,
        systemEfficiency: 0,
        energySavings: 0,
        reliability: 95
      }
    };
  }

  /**
   * Update system diagnostics
   */
  private updateSystemDiagnostics(
    outputs: IntegratedBrakingOutputs,
    regenOutputs: BrakingOutputs,
    tegPerformance: TEGPerformance | null,
    thermalResult: any
  ): void {
    // Update regenerative braking diagnostics
    this.systemDiagnostics.regenerativeBraking = {
      power: outputs.regenerativePower,
      efficiency: regenOutputs.regenerativeBrakingRatio * 100,
      temperature: regenOutputs.motorTorque > 0 ? 80 : 25, // Simplified
      status: regenOutputs.regenerativeBrakingRatio > 0.1 ? 'active' : 'inactive'
    };

    // Update TEG diagnostics
    this.systemDiagnostics.tegSystem = {
      power: outputs.tegPower,
      efficiency: outputs.thermalEfficiency,
      hotSideTemp: outputs.tegTemperature.hotSide,
      coldSideTemp: outputs.tegTemperature.coldSide,
      status: outputs.tegPower > 10 ? 'active' : 'inactive'
    };

    // Update thermal management diagnostics
    this.systemDiagnostics.thermalManagement = {
      coolingPower: thermalResult?.coolingPower || 0,
      heatRejection: thermalResult?.heatRejection || 0,
      thermalEfficiency: outputs.thermalEfficiency,
      status: outputs.brakeTemperature > 200 ? 'active_cooling' : 'optimal'
    };

    // Update overall diagnostics
    this.systemDiagnostics.overall = {
      totalRecoveredPower: outputs.totalRecoveredPower,
      systemEfficiency: outputs.systemEfficiency,
      energySavings: this.calculateEnergySavings(outputs),
      reliability: Math.min(95, tegPerformance?.reliability || 95)
    };
  }

  /**
   * Calculate energy savings compared to conventional braking
   */
  private calculateEnergySavings(outputs: IntegratedBrakingOutputs): number {
    const totalBrakingPower = outputs.totalRecoveredPower + outputs.mechanicalBrakingPower;
    return totalBrakingPower > 0 ? (outputs.totalRecoveredPower / totalBrakingPower) * 100 : 0;
  }

  /**
   * Validate input parameters
   */
  private validateInputs(inputs: IntegratedBrakingInputs): void {
    if (inputs.brakeTemperature < -40 || inputs.brakeTemperature > 500) {
      throw new Error('Brake temperature out of valid range (-40 to 500°C)');
    }

    if (inputs.ambientTemperature < -40 || inputs.ambientTemperature > 60) {
      throw new Error('Ambient temperature out of valid range (-40 to 60°C)');
    }

    if (inputs.airflow < 0 || inputs.airflow > 100) {
      throw new Error('Airflow velocity out of valid range (0 to 100 m/s)');
    }
  }

  /**
   * Get system diagnostics
   */
  public getSystemDiagnostics(): SystemDiagnostics {
    return { ...this.systemDiagnostics };
  }

  /**
   * Get performance history
   */
  public getPerformanceHistory(): IntegratedBrakingOutputs[] {
    return [...this.performanceHistory];
  }

  /**
   * Update energy recovery strategy
   */
  public updateEnergyRecoveryStrategy(strategy: Partial<EnergyRecoveryStrategy>): void {
    this.energyRecoveryStrategy = { ...this.energyRecoveryStrategy, ...strategy };
  }

  /**
   * Enable/disable TEG system
   */
  public setTEGSystemEnabled(enabled: boolean): void {
    // This would be handled through the inputs in real implementation
    console.log(`TEG system ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get system status summary
   */
  public getSystemStatus(): {
    isOperational: boolean;
    activeSubsystems: string[];
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    const activeSubsystems: string[] = [];

    // Check subsystem status
    if (this.systemDiagnostics.regenerativeBraking.status === 'active') {
      activeSubsystems.push('Regenerative Braking');
    }

    if (this.systemDiagnostics.tegSystem.status === 'active') {
      activeSubsystems.push('TEG System');
    }

    if (this.systemDiagnostics.thermalManagement.status === 'active_cooling') {
      activeSubsystems.push('Active Cooling');
      warnings.push('Active cooling engaged due to high temperatures');
    }

    // Check for warnings
    if (this.systemDiagnostics.overall.reliability < 90) {
      warnings.push('System reliability below 90%');
    }

    if (this.systemDiagnostics.tegSystem.hotSideTemp > 250) {
      warnings.push('TEG hot side temperature approaching limits');
    }

    // Check for errors
    if (this.systemDiagnostics.regenerativeBraking.status === 'fault') {
      errors.push('Regenerative braking system fault');
    }

    if (this.systemDiagnostics.tegSystem.status === 'fault') {
      errors.push('TEG system fault');
    }

    return {
      isOperational: errors.length === 0,
      activeSubsystems,
      warnings,
      errors
    };
  }
}

/**
 * Factory function to create integrated braking system
 */
export function createIntegratedBrakingSystem(
  tegConfigurations?: Map<string, TEGConfiguration>,
  customStrategy?: Partial<EnergyRecoveryStrategy>
): TEGBrakingIntegration {
  return new TEGBrakingIntegration(tegConfigurations, customStrategy);
}