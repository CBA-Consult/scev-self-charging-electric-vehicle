/**
 * Thermal Management System for TEG Integration
 * 
 * This module manages thermal conditions for optimal TEG performance,
 * including temperature control, heat rejection, and thermal protection.
 */

import {
  ThermalManagementConfig,
  BrakingThermalInputs,
  defaultThermalManagementConfig
} from './types';

export interface ThermalManagementInputs {
  heatGeneration: number;            // W - Heat generated from braking
  ambientTemperature: number;        // °C - Ambient temperature
  airflow: number;                   // m/s - Air velocity
  vehicleSpeed: number;              // km/h - Vehicle speed
  coolingSystemCapacity: number;     // W - Available cooling capacity
  tegHotSideTemp: number;            // °C - Current TEG hot side temperature
  tegColdSideTemp: number;           // °C - Current TEG cold side temperature
}

export interface ThermalManagementOutputs {
  finalBrakeTemperature: number;     // °C - Final brake temperature after cooling
  tegTemperatures: {
    hotSide: number;                 // °C - TEG hot side temperature
    coldSide: number;                // °C - TEG cold side temperature
  };
  coolingPower: number;              // W - Power consumed by cooling system
  heatRejection: number;             // W - Heat rejected to environment
  thermalEfficiency: number;         // % - Thermal management efficiency
  coolingSystemStatus: 'off' | 'passive' | 'active' | 'emergency';
  temperatureGradient: number;       // K/m - Temperature gradient across TEG
}

export interface CoolingSystemConfig {
  type: 'air' | 'liquid' | 'hybrid';
  capacity: number;                  // W - Maximum cooling capacity
  powerConsumption: number;          // W - Power consumption at full capacity
  responseTime: number;              // s - Time to reach full capacity
  minOperatingTemp: number;          // °C - Minimum operating temperature
  maxOperatingTemp: number;          // °C - Maximum operating temperature
}

export interface HeatExchangerModel {
  effectiveness: number;             // Heat exchanger effectiveness (0-1)
  thermalMass: number;               // J/K - Thermal mass
  surfaceArea: number;               // m² - Heat transfer surface area
  overallHeatTransferCoeff: number;  // W/(m²·K) - Overall heat transfer coefficient
  pressureDrop: number;              // Pa - Pressure drop across heat exchanger
}

export class ThermalManagement {
  private config: ThermalManagementConfig;
  private coolingSystemConfig: CoolingSystemConfig;
  private heatExchangerModel: HeatExchangerModel;
  private thermalHistory: ThermalManagementOutputs[];
  private emergencyShutdownActive: boolean;
  private adaptiveCoolingEnabled: boolean;

  constructor(config?: Partial<ThermalManagementConfig>) {
    this.config = { ...defaultThermalManagementConfig, ...config };
    this.thermalHistory = [];
    this.emergencyShutdownActive = false;
    this.adaptiveCoolingEnabled = true;

    this.initializeCoolingSystem();
    this.initializeHeatExchangerModel();
  }

  /**
   * Initialize cooling system configuration
   */
  private initializeCoolingSystem(): void {
    this.coolingSystemConfig = {
      type: this.config.coolingSystem.type === 'passive' ? 'air' : 
            this.config.coolingSystem.type === 'active' ? 'liquid' : 'hybrid',
      capacity: 2000, // W - Typical automotive cooling capacity
      powerConsumption: this.config.coolingSystem.pumpPower,
      responseTime: 5, // seconds
      minOperatingTemp: -20, // °C
      maxOperatingTemp: 120  // °C
    };
  }

  /**
   * Initialize heat exchanger model
   */
  private initializeHeatExchangerModel(): void {
    this.heatExchangerModel = {
      effectiveness: 0.8, // Typical heat exchanger effectiveness
      thermalMass: 5000,  // J/K - Thermal mass of heat exchanger
      surfaceArea: this.config.heatSink.surfaceArea / 10000, // Convert cm² to m²
      overallHeatTransferCoeff: 100, // W/(m²·K) - Typical value for air cooling
      pressureDrop: 500 // Pa - Typical pressure drop
    };
  }

  /**
   * Main thermal management function
   */
  public manageThermalConditions(
    brakingInputs: BrakingThermalInputs,
    managementMode: 'passive' | 'active' | 'adaptive',
    tegActive: boolean
  ): ThermalManagementOutputs {
    // Check for emergency conditions
    this.checkEmergencyConditions(brakingInputs);

    // Calculate heat generation and distribution
    const heatGeneration = this.calculateHeatGeneration(brakingInputs);
    const heatDistribution = this.calculateHeatDistribution(heatGeneration, tegActive);

    // Determine cooling strategy
    const coolingStrategy = this.determineCoolingStrategy(
      brakingInputs,
      managementMode,
      heatGeneration
    );

    // Calculate cooling performance
    const coolingPerformance = this.calculateCoolingPerformance(
      brakingInputs,
      coolingStrategy,
      heatDistribution
    );

    // Calculate final temperatures
    const finalTemperatures = this.calculateFinalTemperatures(
      brakingInputs,
      heatDistribution,
      coolingPerformance
    );

    // Calculate TEG-specific temperatures
    const tegTemperatures = this.calculateTEGTemperatures(
      finalTemperatures,
      brakingInputs,
      tegActive
    );

    // Calculate thermal efficiency
    const thermalEfficiency = this.calculateThermalEfficiency(
      heatGeneration,
      coolingPerformance.heatRejection,
      coolingPerformance.coolingPower
    );

    const outputs: ThermalManagementOutputs = {
      finalBrakeTemperature: finalTemperatures.brakeTemp,
      tegTemperatures,
      coolingPower: coolingPerformance.coolingPower,
      heatRejection: coolingPerformance.heatRejection,
      thermalEfficiency,
      coolingSystemStatus: coolingStrategy.status,
      temperatureGradient: this.calculateTemperatureGradient(tegTemperatures)
    };

    // Store thermal history
    this.thermalHistory.push(outputs);
    if (this.thermalHistory.length > 500) {
      this.thermalHistory.shift();
    }

    return outputs;
  }

  /**
   * Check for emergency thermal conditions
   */
  private checkEmergencyConditions(inputs: BrakingThermalInputs): void {
    if (inputs.brakeTemperature > this.config.temperatureControl.emergencyShutdown) {
      this.emergencyShutdownActive = true;
      throw new Error(`Emergency thermal shutdown: Brake temperature ${inputs.brakeTemperature}°C exceeds limit ${this.config.temperatureControl.emergencyShutdown}°C`);
    }

    if (inputs.motorTemperature > 150) { // Typical motor temperature limit
      console.warn(`Motor temperature ${inputs.motorTemperature}°C approaching critical levels`);
    }
  }

  /**
   * Calculate total heat generation from braking
   */
  private calculateHeatGeneration(inputs: BrakingThermalInputs): number {
    // Heat generation = mechanical braking power (not recovered by regeneration)
    const mechanicalBrakingPower = inputs.brakingPower * (1 - inputs.regenerativeBrakingRatio);
    
    // Add heat from motor losses during regenerative braking
    const motorLosses = inputs.brakingPower * inputs.regenerativeBrakingRatio * 0.1; // Assume 10% motor losses
    
    return mechanicalBrakingPower + motorLosses;
  }

  /**
   * Calculate heat distribution between components
   */
  private calculateHeatDistribution(
    totalHeat: number,
    tegActive: boolean
  ): {
    brakeHeat: number;
    motorHeat: number;
    tegHeat: number;
    ambientLoss: number;
  } {
    // Distribute heat based on component thermal masses and heat paths
    const brakeHeat = totalHeat * 0.7;  // 70% to brake components
    const motorHeat = totalHeat * 0.2;  // 20% to motor
    const tegHeat = tegActive ? totalHeat * 0.05 : 0; // 5% captured by TEG if active
    const ambientLoss = totalHeat * 0.05; // 5% direct ambient loss

    return { brakeHeat, motorHeat, tegHeat, ambientLoss };
  }

  /**
   * Determine optimal cooling strategy
   */
  private determineCoolingStrategy(
    inputs: BrakingThermalInputs,
    mode: string,
    heatGeneration: number
  ): {
    status: 'off' | 'passive' | 'active' | 'emergency';
    coolingPower: number;
    fanSpeed: number;
    pumpSpeed: number;
  } {
    let status: 'off' | 'passive' | 'active' | 'emergency' = 'off';
    let coolingPower = 0;
    let fanSpeed = 0;
    let pumpSpeed = 0;

    // Determine cooling needs based on temperature
    if (inputs.brakeTemperature > this.config.temperatureControl.emergencyShutdown * 0.9) {
      status = 'emergency';
      coolingPower = this.coolingSystemConfig.capacity;
      fanSpeed = 1.0;
      pumpSpeed = 1.0;
    } else if (inputs.brakeTemperature > this.config.temperatureControl.optimalTempRange.max) {
      status = 'active';
      const tempRatio = (inputs.brakeTemperature - this.config.temperatureControl.optimalTempRange.max) / 
                       (this.config.temperatureControl.maxOperatingTemp - this.config.temperatureControl.optimalTempRange.max);
      coolingPower = this.coolingSystemConfig.capacity * Math.min(1.0, tempRatio);
      fanSpeed = Math.min(1.0, tempRatio);
      pumpSpeed = mode === 'active' ? Math.min(1.0, tempRatio) : 0;
    } else if (inputs.brakeTemperature > this.config.temperatureControl.optimalTempRange.min) {
      status = 'passive';
      // Natural convection and airflow cooling
      fanSpeed = Math.min(0.5, inputs.airflow / 20); // Scale with vehicle airflow
      coolingPower = this.coolingSystemConfig.capacity * 0.1; // Minimal power for passive cooling
    }

    // Adaptive cooling adjustments
    if (this.adaptiveCoolingEnabled && mode === 'adaptive') {
      const heatRatio = heatGeneration / 5000; // Normalize to 5kW reference
      coolingPower *= (1 + heatRatio * 0.5); // Increase cooling with heat generation
      fanSpeed = Math.min(1.0, fanSpeed * (1 + heatRatio * 0.3));
    }

    return { status, coolingPower, fanSpeed, pumpSpeed };
  }

  /**
   * Calculate cooling system performance
   */
  private calculateCoolingPerformance(
    inputs: BrakingThermalInputs,
    strategy: any,
    heatDistribution: any
  ): {
    coolingPower: number;
    heatRejection: number;
    coolingEfficiency: number;
  } {
    const coolingPower = strategy.coolingPower;
    
    // Calculate heat rejection based on cooling method and conditions
    let heatRejection = 0;

    // Natural convection
    const naturalConvection = this.calculateNaturalConvection(
      inputs.brakeTemperature,
      inputs.ambientTemperature,
      this.heatExchangerModel.surfaceArea
    );

    // Forced convection from airflow
    const forcedConvection = this.calculateForcedConvection(
      inputs.brakeTemperature,
      inputs.ambientTemperature,
      inputs.airflow,
      this.heatExchangerModel.surfaceArea
    );

    // Active cooling contribution
    const activeCooling = this.calculateActiveCooling(
      coolingPower,
      strategy.fanSpeed,
      strategy.pumpSpeed,
      inputs.brakeTemperature,
      inputs.ambientTemperature
    );

    heatRejection = naturalConvection + forcedConvection + activeCooling;

    // Calculate cooling efficiency
    const coolingEfficiency = coolingPower > 0 ? (heatRejection / coolingPower) : 0;

    return {
      coolingPower,
      heatRejection,
      coolingEfficiency
    };
  }

  /**
   * Calculate natural convection heat transfer
   */
  private calculateNaturalConvection(
    surfaceTemp: number,
    ambientTemp: number,
    surfaceArea: number
  ): number {
    const tempDiff = surfaceTemp - ambientTemp;
    const naturalConvectionCoeff = 5; // W/(m²·K) - typical for natural convection
    
    return naturalConvectionCoeff * surfaceArea * tempDiff;
  }

  /**
   * Calculate forced convection heat transfer
   */
  private calculateForcedConvection(
    surfaceTemp: number,
    ambientTemp: number,
    airVelocity: number,
    surfaceArea: number
  ): number {
    const tempDiff = surfaceTemp - ambientTemp;
    // Forced convection coefficient: h = a * v^b (empirical correlation)
    const forcedConvectionCoeff = 10 * Math.pow(Math.max(1, airVelocity), 0.8);
    
    return forcedConvectionCoeff * surfaceArea * tempDiff;
  }

  /**
   * Calculate active cooling heat transfer
   */
  private calculateActiveCooling(
    coolingPower: number,
    fanSpeed: number,
    pumpSpeed: number,
    surfaceTemp: number,
    ambientTemp: number
  ): number {
    if (coolingPower === 0) return 0;

    // Active cooling effectiveness based on fan and pump speeds
    const fanEffectiveness = fanSpeed * 0.8; // Fan contribution
    const pumpEffectiveness = pumpSpeed * 0.9; // Pump contribution
    const totalEffectiveness = Math.min(1.0, fanEffectiveness + pumpEffectiveness);

    // Heat rejection based on cooling power and effectiveness
    const maxHeatRejection = coolingPower * 5; // COP of 5 for cooling system
    const tempRatio = (surfaceTemp - ambientTemp) / 100; // Normalize temperature difference
    
    return maxHeatRejection * totalEffectiveness * Math.min(1.0, tempRatio);
  }

  /**
   * Calculate final component temperatures
   */
  private calculateFinalTemperatures(
    inputs: BrakingThermalInputs,
    heatDistribution: any,
    coolingPerformance: any
  ): {
    brakeTemp: number;
    motorTemp: number;
  } {
    // Simplified thermal model using thermal time constants
    const brakeThermalMass = 10000; // J/K - Brake thermal mass
    const motorThermalMass = 5000;  // J/K - Motor thermal mass
    const timeStep = inputs.brakingDuration;

    // Calculate temperature rise from heat generation
    const brakeHeatRise = (heatDistribution.brakeHeat * timeStep) / brakeThermalMass;
    const motorHeatRise = (heatDistribution.motorHeat * timeStep) / motorThermalMass;

    // Calculate temperature drop from cooling
    const brakeCoolingDrop = (coolingPerformance.heatRejection * 0.8 * timeStep) / brakeThermalMass;
    const motorCoolingDrop = (coolingPerformance.heatRejection * 0.2 * timeStep) / motorThermalMass;

    // Final temperatures
    const brakeTemp = Math.max(
      inputs.ambientTemperature,
      inputs.brakeTemperature + brakeHeatRise - brakeCoolingDrop
    );

    const motorTemp = Math.max(
      inputs.ambientTemperature,
      inputs.motorTemperature + motorHeatRise - motorCoolingDrop
    );

    return { brakeTemp, motorTemp };
  }

  /**
   * Calculate TEG-specific temperatures
   */
  private calculateTEGTemperatures(
    finalTemperatures: any,
    inputs: BrakingThermalInputs,
    tegActive: boolean
  ): {
    hotSide: number;
    coldSide: number;
  } {
    if (!tegActive) {
      return {
        hotSide: inputs.ambientTemperature,
        coldSide: inputs.ambientTemperature
      };
    }

    // TEG hot side temperature (slightly lower than brake temperature due to thermal resistance)
    const thermalResistance = this.config.thermalInterface.thickness / 
                             (this.config.thermalInterface.thermalConductivity * 0.01); // Convert to m²·K/W
    const heatFlow = 100; // W - Estimated heat flow through TEG
    const hotSideTemp = finalTemperatures.brakeTemp - (heatFlow * thermalResistance);

    // TEG cold side temperature (higher than ambient due to heat sink thermal resistance)
    const heatSinkResistance = this.config.heatSink.thermalResistance;
    const coldSideTemp = inputs.ambientTemperature + (heatFlow * heatSinkResistance);

    return {
      hotSide: Math.max(inputs.ambientTemperature, hotSideTemp),
      coldSide: Math.max(inputs.ambientTemperature, coldSideTemp)
    };
  }

  /**
   * Calculate thermal efficiency
   */
  private calculateThermalEfficiency(
    heatGeneration: number,
    heatRejection: number,
    coolingPower: number
  ): number {
    if (heatGeneration === 0) return 0;

    // Thermal efficiency = (Heat rejected - Cooling power) / Heat generation
    const netHeatRejection = heatRejection - coolingPower;
    return Math.max(0, (netHeatRejection / heatGeneration) * 100);
  }

  /**
   * Calculate temperature gradient across TEG
   */
  private calculateTemperatureGradient(tegTemperatures: any): number {
    const tempDiff = tegTemperatures.hotSide - tegTemperatures.coldSide;
    const tegThickness = 0.005; // m - Typical TEG thickness
    
    return tempDiff / tegThickness; // K/m
  }

  /**
   * Optimize cooling system parameters
   */
  public optimizeCoolingSystem(
    targetTemperature: number,
    maxCoolingPower: number,
    ambientConditions: { temperature: number; airflow: number }
  ): {
    optimalFanSpeed: number;
    optimalPumpSpeed: number;
    expectedCoolingPower: number;
    achievableTemperature: number;
  } {
    let bestFanSpeed = 0;
    let bestPumpSpeed = 0;
    let minCoolingPower = Infinity;
    let achievableTemp = targetTemperature;

    // Optimization loop
    for (let fanSpeed = 0; fanSpeed <= 1; fanSpeed += 0.1) {
      for (let pumpSpeed = 0; pumpSpeed <= 1; pumpSpeed += 0.1) {
        const coolingPower = this.estimateCoolingPower(fanSpeed, pumpSpeed);
        
        if (coolingPower > maxCoolingPower) continue;

        const achievedTemp = this.estimateAchievableTemperature(
          coolingPower,
          fanSpeed,
          pumpSpeed,
          ambientConditions
        );

        if (achievedTemp <= targetTemperature && coolingPower < minCoolingPower) {
          bestFanSpeed = fanSpeed;
          bestPumpSpeed = pumpSpeed;
          minCoolingPower = coolingPower;
          achievableTemp = achievedTemp;
        }
      }
    }

    return {
      optimalFanSpeed: bestFanSpeed,
      optimalPumpSpeed: bestPumpSpeed,
      expectedCoolingPower: minCoolingPower,
      achievableTemperature: achievableTemp
    };
  }

  /**
   * Estimate cooling power for given fan and pump speeds
   */
  private estimateCoolingPower(fanSpeed: number, pumpSpeed: number): number {
    const fanPower = fanSpeed * this.coolingSystemConfig.powerConsumption * 0.3; // 30% for fan
    const pumpPower = pumpSpeed * this.coolingSystemConfig.powerConsumption * 0.7; // 70% for pump
    
    return fanPower + pumpPower;
  }

  /**
   * Estimate achievable temperature for given cooling configuration
   */
  private estimateAchievableTemperature(
    coolingPower: number,
    fanSpeed: number,
    pumpSpeed: number,
    ambientConditions: any
  ): number {
    // Simplified model for temperature estimation
    const baseCoolingCapacity = this.coolingSystemConfig.capacity;
    const coolingEffectiveness = (fanSpeed + pumpSpeed) / 2;
    const actualCoolingCapacity = baseCoolingCapacity * coolingEffectiveness;

    // Estimate temperature reduction
    const tempReduction = actualCoolingCapacity / 100; // Simplified: 1°C per 100W
    
    return Math.max(
      ambientConditions.temperature,
      200 - tempReduction // Assume 200°C baseline temperature
    );
  }

  /**
   * Get thermal management diagnostics
   */
  public getThermalDiagnostics(): {
    config: ThermalManagementConfig;
    coolingSystemConfig: CoolingSystemConfig;
    thermalHistory: ThermalManagementOutputs[];
    emergencyShutdownActive: boolean;
    adaptiveCoolingEnabled: boolean;
  } {
    return {
      config: { ...this.config },
      coolingSystemConfig: { ...this.coolingSystemConfig },
      thermalHistory: [...this.thermalHistory],
      emergencyShutdownActive: this.emergencyShutdownActive,
      adaptiveCoolingEnabled: this.adaptiveCoolingEnabled
    };
  }

  /**
   * Update thermal management configuration
   */
  public updateConfiguration(newConfig: Partial<ThermalManagementConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeCoolingSystem();
    this.initializeHeatExchangerModel();
  }

  /**
   * Enable/disable adaptive cooling
   */
  public setAdaptiveCooling(enabled: boolean): void {
    this.adaptiveCoolingEnabled = enabled;
  }

  /**
   * Reset emergency shutdown
   */
  public resetEmergencyShutdown(): void {
    this.emergencyShutdownActive = false;
  }
}

/**
 * Factory function to create thermal management system
 */
export function createThermalManager(config?: Partial<ThermalManagementConfig>): ThermalManagement {
  return new ThermalManagement(config);
}