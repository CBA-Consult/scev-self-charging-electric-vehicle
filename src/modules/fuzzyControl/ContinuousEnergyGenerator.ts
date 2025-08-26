/**
 * Continuous Electromagnetic Induction Energy Generator
 * 
 * This module implements a comprehensive electromagnetic induction system for continuous
 * energy generation from wheel rotational forces, extending beyond traditional regenerative
 * braking to provide constant power production during all driving conditions.
 */

export interface GenerationParameters {
  targetPower: number;              // Target power output (W)
  magneticFieldStrength: number;    // Magnetic flux density (Tesla)
  coilConfiguration: string;        // Active coil configuration
  thermalManagement: ThermalConfig; // Thermal management settings
}

export interface ThermalConfig {
  coolingMode: 'passive' | 'active' | 'liquid';
  targetTemperature: number;        // Target operating temperature (°C)
  maxTemperature: number;          // Maximum safe temperature (°C)
  thermalThrottling: boolean;      // Enable thermal throttling
}

export interface WheelRotationData {
  angularVelocity: number;         // rad/s
  wheelRadius: number;             // meters
  vehicleSpeed: number;            // km/h
  rotationalAcceleration: number;  // rad/s²
  loadForce: number;              // Newtons (wheel load)
}

export interface ElectromagneticConfig {
  permanentMagnetStrength: number; // Tesla
  coilTurns: number;              // Number of conductor turns
  coilResistance: number;         // Ohms
  airGapDistance: number;         // meters
  magneticPermeability: number;   // H/m
}

export interface PowerOutput {
  instantaneousPower: number;     // Watts
  averagePower: number;          // Watts (over last measurement period)
  peakPower: number;             // Watts (maximum recorded)
  energyGenerated: number;       // Wh (cumulative)
  efficiency: number;            // Percentage
  parasiteLoad: number;          // Percentage of propulsion power
}

export interface SystemStatus {
  operationalMode: 'continuous' | 'regenerative' | 'standby' | 'fault';
  generationEfficiency: number;
  thermalStatus: 'normal' | 'warm' | 'hot' | 'critical';
  magneticFieldStatus: 'optimal' | 'degraded' | 'fault';
  powerElectronicsStatus: 'normal' | 'degraded' | 'fault';
  maintenanceRequired: boolean;
}

export class ContinuousEnergyGenerator {
  private electromagneticConfig: ElectromagneticConfig;
  private generationHistory: Array<{ timestamp: number; power: number; efficiency: number }>;
  private currentThermalConfig: ThermalConfig;
  private systemFaults: Set<string>;
  private totalEnergyGenerated: number;
  private operationalHours: number;
  private lastMaintenanceTime: number;

  constructor(config: ElectromagneticConfig) {
    this.electromagneticConfig = config;
    this.generationHistory = [];
    this.systemFaults = new Set();
    this.totalEnergyGenerated = 0;
    this.operationalHours = 0;
    this.lastMaintenanceTime = Date.now();
    
    this.currentThermalConfig = {
      coolingMode: 'active',
      targetTemperature: 65,
      maxTemperature: 150,
      thermalThrottling: true
    };
  }

  /**
   * Calculate continuous power generation from wheel rotation
   */
  public calculateContinuousGeneration(
    rotationData: WheelRotationData,
    batterySOC: number,
    ambientTemperature: number
  ): PowerOutput {
    try {
      // Calculate base electromagnetic induction power
      const basePower = this.calculateElectromagneticInduction(rotationData);
      
      // Apply efficiency corrections
      const efficiencyFactor = this.calculateSystemEfficiency(rotationData, ambientTemperature);
      const adjustedPower = basePower * efficiencyFactor;
      
      // Apply battery SOC limitations
      const socLimitedPower = this.applyBatterySOCLimits(adjustedPower, batterySOC);
      
      // Apply thermal limitations
      const thermalLimitedPower = this.applyThermalLimits(socLimitedPower, ambientTemperature);
      
      // Calculate parasitic load impact
      const parasiteLoad = this.calculateParasiticLoad(thermalLimitedPower, rotationData);
      
      // Update generation history
      this.updateGenerationHistory(thermalLimitedPower, efficiencyFactor);
      
      // Calculate cumulative energy
      this.updateEnergyAccumulation(thermalLimitedPower);
      
      return {
        instantaneousPower: thermalLimitedPower,
        averagePower: this.calculateAveragePower(),
        peakPower: this.calculatePeakPower(),
        energyGenerated: this.totalEnergyGenerated,
        efficiency: efficiencyFactor * 100,
        parasiteLoad: parasiteLoad * 100
      };
      
    } catch (error) {
      console.error('Continuous generation calculation error:', error);
      this.systemFaults.add('calculation_error');
      return this.getFailsafePowerOutput();
    }
  }

  /**
   * Calculate electromagnetic induction power using Faraday's law
   */
  private calculateElectromagneticInduction(rotationData: WheelRotationData): number {
    const { angularVelocity, wheelRadius } = rotationData;
    const { permanentMagnetStrength, coilTurns, airGapDistance, magneticPermeability } = this.electromagneticConfig;
    
    // Calculate effective magnetic flux
    const effectiveArea = Math.PI * Math.pow(wheelRadius * 0.8, 2); // 80% of wheel area
    const magneticFlux = permanentMagnetStrength * effectiveArea * magneticPermeability;
    
    // Calculate induced EMF using Faraday's law: ε = -N × (dΦ/dt)
    const fluxChangeRate = magneticFlux * angularVelocity / (2 * Math.PI);
    const inducedEMF = coilTurns * fluxChangeRate;
    
    // Calculate power considering coil resistance and load matching
    const loadResistance = this.calculateOptimalLoadResistance();
    const totalResistance = this.electromagneticConfig.coilResistance + loadResistance;
    const current = inducedEMF / totalResistance;
    const power = Math.pow(current, 2) * loadResistance;
    
    // Apply air gap correction factor
    const airGapFactor = 1 / (1 + (airGapDistance / 0.003)); // Optimal at 3mm gap
    
    return power * airGapFactor;
  }

  /**
   * Calculate optimal load resistance for maximum power transfer
   */
  private calculateOptimalLoadResistance(): number {
    // Maximum power transfer theorem: R_load = R_source for maximum power
    return this.electromagneticConfig.coilResistance;
  }

  /**
   * Calculate system efficiency based on operating conditions
   */
  private calculateSystemEfficiency(
    rotationData: WheelRotationData,
    ambientTemperature: number
  ): number {
    let baseEfficiency = 0.94; // 94% base electromagnetic conversion efficiency
    
    // Speed-dependent efficiency
    const optimalSpeed = 80; // km/h optimal speed
    const speedRatio = rotationData.vehicleSpeed / optimalSpeed;
    
    if (speedRatio <= 1) {
      // Efficiency increases with speed up to optimal point
      const speedEfficiency = 0.85 + (speedRatio * 0.09); // 85% to 94%
      baseEfficiency = Math.min(baseEfficiency, speedEfficiency);
    } else {
      // Efficiency decreases slightly above optimal speed
      const speedEfficiency = 0.94 - ((speedRatio - 1) * 0.02); // Gradual decrease
      baseEfficiency = Math.min(baseEfficiency, Math.max(0.88, speedEfficiency));
    }
    
    // Temperature-dependent efficiency
    const optimalTemp = 65; // °C optimal operating temperature
    const tempDifference = Math.abs(ambientTemperature - optimalTemp);
    const tempEfficiency = 1 - (tempDifference * 0.001); // 0.1% loss per degree difference
    baseEfficiency *= Math.max(0.85, tempEfficiency);
    
    // Load-dependent efficiency
    const loadFactor = Math.min(rotationData.loadForce / 5000, 1.0); // Normalize to 5kN
    const loadEfficiency = 0.9 + (loadFactor * 0.06); // 90% to 96% based on load
    baseEfficiency *= loadEfficiency;
    
    return Math.max(0.80, Math.min(0.97, baseEfficiency));
  }

  /**
   * Apply battery state of charge limitations
   */
  private applyBatterySOCLimits(power: number, batterySOC: number): number {
    if (batterySOC >= 0.98) {
      // Nearly full battery - minimal generation
      return power * 0.1;
    } else if (batterySOC >= 0.95) {
      // High SOC - reduced generation
      const reductionFactor = 1 - ((batterySOC - 0.95) / 0.03) * 0.9;
      return power * reductionFactor;
    } else if (batterySOC >= 0.90) {
      // Moderate SOC - gradual reduction
      const reductionFactor = 1 - ((batterySOC - 0.90) / 0.05) * 0.3;
      return power * reductionFactor;
    }
    
    // Low to moderate SOC - full generation capability
    return power;
  }

  /**
   * Apply thermal limitations to protect system components
   */
  private applyThermalLimits(power: number, ambientTemperature: number): number {
    const currentTemp = this.estimateOperatingTemperature(power, ambientTemperature);
    
    if (currentTemp > this.currentThermalConfig.maxTemperature) {
      // Critical temperature - emergency shutdown
      this.systemFaults.add('thermal_critical');
      return 0;
    } else if (currentTemp > this.currentThermalConfig.maxTemperature * 0.9) {
      // High temperature - significant throttling
      const throttleFactor = 1 - ((currentTemp - this.currentThermalConfig.maxTemperature * 0.9) / 
                                 (this.currentThermalConfig.maxTemperature * 0.1));
      return power * Math.max(0.2, throttleFactor);
    } else if (currentTemp > this.currentThermalConfig.targetTemperature * 1.2) {
      // Warm temperature - moderate throttling
      const throttleFactor = 1 - ((currentTemp - this.currentThermalConfig.targetTemperature * 1.2) / 
                                 (this.currentThermalConfig.maxTemperature * 0.9 - this.currentThermalConfig.targetTemperature * 1.2)) * 0.3;
      return power * throttleFactor;
    }
    
    // Normal temperature - no throttling
    return power;
  }

  /**
   * Estimate operating temperature based on power generation and ambient conditions
   */
  private estimateOperatingTemperature(power: number, ambientTemperature: number): number {
    // Thermal model: T_op = T_ambient + (Power_loss / Thermal_resistance)
    const efficiency = 0.94; // Assume 94% efficiency
    const powerLoss = power * (1 - efficiency);
    const thermalResistance = this.calculateThermalResistance();
    
    return ambientTemperature + (powerLoss / thermalResistance);
  }

  /**
   * Calculate thermal resistance based on cooling configuration
   */
  private calculateThermalResistance(): number {
    switch (this.currentThermalConfig.coolingMode) {
      case 'passive':
        return 0.5; // °C/W - natural convection only
      case 'active':
        return 0.2; // °C/W - forced air cooling
      case 'liquid':
        return 0.1; // °C/W - liquid cooling system
      default:
        return 0.5;
    }
  }

  /**
   * Calculate parasitic load impact on vehicle propulsion
   */
  private calculateParasiticLoad(generatedPower: number, rotationData: WheelRotationData): number {
    // Parasitic load is the additional resistance to rotation caused by electromagnetic generation
    const magneticTorque = this.calculateMagneticTorque(generatedPower, rotationData);
    const propulsionPower = this.estimatePropulsionPower(rotationData);
    
    if (propulsionPower === 0) return 0;
    
    const parasiticPower = magneticTorque * rotationData.angularVelocity;
    return Math.min(0.025, parasiticPower / propulsionPower); // Cap at 2.5%
  }

  /**
   * Calculate magnetic torque opposing wheel rotation
   */
  private calculateMagneticTorque(generatedPower: number, rotationData: WheelRotationData): number {
    if (rotationData.angularVelocity === 0) return 0;
    
    // Torque = Power / Angular_velocity
    const efficiency = 0.94;
    const mechanicalPowerExtracted = generatedPower / efficiency;
    
    return mechanicalPowerExtracted / rotationData.angularVelocity;
  }

  /**
   * Estimate vehicle propulsion power requirement
   */
  private estimatePropulsionPower(rotationData: WheelRotationData): number {
    // Simplified propulsion power model
    const vehicleSpeedMs = rotationData.vehicleSpeed / 3.6; // Convert to m/s
    const dragCoefficient = 0.3; // Typical vehicle drag coefficient
    const frontalArea = 2.5; // m² typical frontal area
    const airDensity = 1.225; // kg/m³ at sea level
    const rollingResistance = 0.01; // Typical rolling resistance coefficient
    const vehicleMass = 1500; // kg typical vehicle mass
    
    // Aerodynamic drag power
    const dragForce = 0.5 * airDensity * dragCoefficient * frontalArea * Math.pow(vehicleSpeedMs, 2);
    const dragPower = dragForce * vehicleSpeedMs;
    
    // Rolling resistance power
    const rollingForce = rollingResistance * vehicleMass * 9.81;
    const rollingPower = rollingForce * vehicleSpeedMs;
    
    return dragPower + rollingPower;
  }

  /**
   * Update generation history for performance tracking
   */
  private updateGenerationHistory(power: number, efficiency: number): void {
    const currentTime = Date.now();
    
    this.generationHistory.push({
      timestamp: currentTime,
      power: power,
      efficiency: efficiency
    });
    
    // Keep only last 1000 entries (approximately 16 minutes at 1Hz)
    if (this.generationHistory.length > 1000) {
      this.generationHistory.shift();
    }
  }

  /**
   * Update cumulative energy generation
   */
  private updateEnergyAccumulation(power: number): void {
    // Assume 1-second update interval for energy calculation
    const energyIncrement = power / 3600; // Convert W to Wh
    this.totalEnergyGenerated += energyIncrement;
  }

  /**
   * Calculate average power over recent history
   */
  private calculateAveragePower(): number {
    if (this.generationHistory.length === 0) return 0;
    
    const recentHistory = this.generationHistory.slice(-60); // Last 60 seconds
    const totalPower = recentHistory.reduce((sum, entry) => sum + entry.power, 0);
    
    return totalPower / recentHistory.length;
  }

  /**
   * Calculate peak power from history
   */
  private calculatePeakPower(): number {
    if (this.generationHistory.length === 0) return 0;
    
    return Math.max(...this.generationHistory.map(entry => entry.power));
  }

  /**
   * Get failsafe power output in case of system errors
   */
  private getFailsafePowerOutput(): PowerOutput {
    return {
      instantaneousPower: 0,
      averagePower: 0,
      peakPower: 0,
      energyGenerated: this.totalEnergyGenerated,
      efficiency: 0,
      parasiteLoad: 0
    };
  }

  /**
   * Optimize generation parameters based on current conditions
   */
  public optimizeGenerationParameters(
    rotationData: WheelRotationData,
    batterySOC: number,
    powerDemand: number
  ): GenerationParameters {
    // Calculate optimal magnetic field strength
    const optimalFieldStrength = this.calculateOptimalMagneticField(rotationData, powerDemand);
    
    // Determine optimal coil configuration
    const coilConfiguration = this.selectOptimalCoilConfiguration(rotationData, batterySOC);
    
    // Calculate target power based on conditions
    const targetPower = this.calculateTargetPower(rotationData, batterySOC, powerDemand);
    
    // Optimize thermal management
    const thermalConfig = this.optimizeThermalManagement(targetPower);
    
    return {
      targetPower,
      magneticFieldStrength: optimalFieldStrength,
      coilConfiguration,
      thermalManagement: thermalConfig
    };
  }

  /**
   * Calculate optimal magnetic field strength for current conditions
   */
  private calculateOptimalMagneticField(
    rotationData: WheelRotationData,
    powerDemand: number
  ): number {
    const baseFieldStrength = this.electromagneticConfig.permanentMagnetStrength;
    
    // Adjust field strength based on speed (if variable field system)
    const speedFactor = Math.min(rotationData.vehicleSpeed / 100, 1.2); // Up to 20% increase
    
    // Adjust based on power demand
    const demandFactor = Math.min(powerDemand / 10000, 1.1); // Up to 10% increase for high demand
    
    return baseFieldStrength * speedFactor * demandFactor;
  }

  /**
   * Select optimal coil configuration for current conditions
   */
  private selectOptimalCoilConfiguration(
    rotationData: WheelRotationData,
    batterySOC: number
  ): string {
    if (rotationData.vehicleSpeed < 30) {
      return 'low_speed_optimized';
    } else if (rotationData.vehicleSpeed < 80) {
      return 'medium_speed_balanced';
    } else if (rotationData.vehicleSpeed < 120) {
      return 'high_speed_optimized';
    } else {
      return 'maximum_efficiency';
    }
  }

  /**
   * Calculate target power generation for current conditions
   */
  private calculateTargetPower(
    rotationData: WheelRotationData,
    batterySOC: number,
    powerDemand: number
  ): number {
    // Base power calculation
    const maxPossiblePower = this.calculateElectromagneticInduction(rotationData);
    
    // Apply SOC-based scaling
    let socScaling = 1.0;
    if (batterySOC > 0.9) {
      socScaling = 1 - ((batterySOC - 0.9) / 0.1) * 0.8; // Reduce up to 80%
    }
    
    // Apply demand-based scaling
    const demandScaling = Math.min(powerDemand / 5000, 1.0); // Scale based on 5kW reference
    
    return maxPossiblePower * socScaling * demandScaling;
  }

  /**
   * Optimize thermal management configuration
   */
  private optimizeThermalManagement(targetPower: number): ThermalConfig {
    let coolingMode: 'passive' | 'active' | 'liquid' = 'passive';
    
    if (targetPower > 15000) {
      coolingMode = 'liquid';
    } else if (targetPower > 8000) {
      coolingMode = 'active';
    }
    
    return {
      coolingMode,
      targetTemperature: 65,
      maxTemperature: 150,
      thermalThrottling: true
    };
  }

  /**
   * Get comprehensive system status
   */
  public getSystemStatus(): SystemStatus {
    const recentEfficiency = this.generationHistory.length > 0 ? 
      this.generationHistory[this.generationHistory.length - 1].efficiency : 0;
    
    let operationalMode: 'continuous' | 'regenerative' | 'standby' | 'fault' = 'continuous';
    if (this.systemFaults.size > 0) {
      operationalMode = 'fault';
    }
    
    return {
      operationalMode,
      generationEfficiency: recentEfficiency,
      thermalStatus: this.getThermalStatus(),
      magneticFieldStatus: this.getMagneticFieldStatus(),
      powerElectronicsStatus: this.getPowerElectronicsStatus(),
      maintenanceRequired: this.checkMaintenanceRequired()
    };
  }

  /**
   * Get thermal status assessment
   */
  private getThermalStatus(): 'normal' | 'warm' | 'hot' | 'critical' {
    // This would typically read from actual temperature sensors
    // For now, estimate based on recent power generation
    const recentPower = this.calculateAveragePower();
    
    if (recentPower > 20000) return 'hot';
    if (recentPower > 12000) return 'warm';
    return 'normal';
  }

  /**
   * Get magnetic field status assessment
   */
  private getMagneticFieldStatus(): 'optimal' | 'degraded' | 'fault' {
    if (this.systemFaults.has('magnetic_field_fault')) return 'fault';
    
    // Check for magnetic field degradation based on efficiency trends
    const recentEfficiencies = this.generationHistory.slice(-10).map(entry => entry.efficiency);
    if (recentEfficiencies.length > 5) {
      const averageEfficiency = recentEfficiencies.reduce((sum, eff) => sum + eff, 0) / recentEfficiencies.length;
      if (averageEfficiency < 0.85) return 'degraded';
    }
    
    return 'optimal';
  }

  /**
   * Get power electronics status assessment
   */
  private getPowerElectronicsStatus(): 'normal' | 'degraded' | 'fault' {
    if (this.systemFaults.has('power_electronics_fault')) return 'fault';
    if (this.systemFaults.has('calculation_error')) return 'degraded';
    return 'normal';
  }

  /**
   * Check if maintenance is required
   */
  private checkMaintenanceRequired(): boolean {
    const currentTime = Date.now();
    const timeSinceLastMaintenance = currentTime - this.lastMaintenanceTime;
    const maintenanceInterval = 6 * 30 * 24 * 60 * 60 * 1000; // 6 months in milliseconds
    
    return timeSinceLastMaintenance > maintenanceInterval || this.systemFaults.size > 2;
  }

  /**
   * Reset system for maintenance
   */
  public performMaintenance(): void {
    this.systemFaults.clear();
    this.lastMaintenanceTime = Date.now();
    this.generationHistory = [];
    console.log('System maintenance completed');
  }

  /**
   * Get comprehensive system diagnostics
   */
  public getSystemDiagnostics(): {
    totalEnergyGenerated: number;
    operationalHours: number;
    averageEfficiency: number;
    systemFaults: string[];
    maintenanceStatus: string;
    performanceMetrics: any;
  } {
    const averageEfficiency = this.generationHistory.length > 0 ?
      this.generationHistory.reduce((sum, entry) => sum + entry.efficiency, 0) / this.generationHistory.length : 0;
    
    return {
      totalEnergyGenerated: this.totalEnergyGenerated,
      operationalHours: this.operationalHours,
      averageEfficiency,
      systemFaults: Array.from(this.systemFaults),
      maintenanceStatus: this.checkMaintenanceRequired() ? 'Required' : 'Current',
      performanceMetrics: {
        peakPower: this.calculatePeakPower(),
        averagePower: this.calculateAveragePower(),
        generationHistory: this.generationHistory.slice(-100) // Last 100 entries
      }
    };
  }
}