/**
 * Continuous Energy Harvesting System for In-Wheel Motors
 * 
 * This module implements frictionless electromagnetic induction for continuous
 * energy harvesting from wheel rotational forces during normal driving conditions.
 * Designed to convert wheel rotation to energy without reducing propulsion efficiency.
 */

export interface WheelRotationInputs {
  wheelSpeed: number;           // RPM - wheel rotation speed
  vehicleSpeed: number;         // km/h - vehicle speed
  wheelTorque: number;          // Nm - current wheel torque
  motorLoad: number;            // % - current motor load (0-1)
  batterySOC: number;           // % - battery state of charge (0-1)
  motorTemperature: number;     // °C - motor temperature
  roadGradient: number;         // % - road gradient
  ambientTemperature: number;   // °C - ambient temperature
}

export interface EnergyHarvestingOutputs {
  harvestedPower: number;           // W - power harvested from rotation
  harvestingEfficiency: number;    // % - energy harvesting efficiency (0-1)
  propulsionEfficiencyImpact: number; // % - impact on propulsion efficiency (0-1)
  inductionTorque: number;          // Nm - electromagnetic induction torque
  thermalGeneration: number;        // W - thermal energy generated
  netEnergyGain: number;           // W - net energy gain after losses
}

export interface InductionCoilParameters {
  coilCount: number;               // Number of induction coils
  coilResistance: number;          // Ohms - coil resistance
  magneticFluxDensity: number;     // Tesla - magnetic flux density
  coilTurns: number;              // Number of turns per coil
  coilDiameter: number;           // m - coil diameter
  airGapDistance: number;         // m - air gap between rotor and stator
}

export interface HarvestingStrategy {
  minHarvestingSpeed: number;      // km/h - minimum speed for harvesting
  maxHarvestingRatio: number;      // % - maximum energy harvesting ratio
  adaptiveControl: boolean;        // Enable adaptive harvesting control
  thermalProtection: boolean;      // Enable thermal protection
  efficiencyThreshold: number;     // Minimum efficiency threshold
}

export class ContinuousEnergyHarvester {
  private inductionParams: InductionCoilParameters;
  private harvestingStrategy: HarvestingStrategy;
  private performanceHistory: Array<{ timestamp: number; efficiency: number; power: number }> = [];
  private thermalModel: Map<string, number> = new Map(); // Motor thermal states

  constructor(
    inductionParams?: Partial<InductionCoilParameters>,
    strategy?: Partial<HarvestingStrategy>
  ) {
    this.inductionParams = {
      coilCount: 12,
      coilResistance: 0.05,
      magneticFluxDensity: 0.8,
      coilTurns: 100,
      coilDiameter: 0.15,
      airGapDistance: 0.002,
      ...inductionParams
    };

    this.harvestingStrategy = {
      minHarvestingSpeed: 20,        // Start harvesting at 20 km/h
      maxHarvestingRatio: 0.15,      // Maximum 15% of rotational energy
      adaptiveControl: true,
      thermalProtection: true,
      efficiencyThreshold: 0.85,     // 85% minimum efficiency
      ...strategy
    };

    this.initializeThermalModel();
  }

  private initializeThermalModel(): void {
    // Initialize thermal states for each motor
    const motorIds = ['frontLeft', 'frontRight', 'rearLeft', 'rearRight'];
    motorIds.forEach(id => {
      this.thermalModel.set(id, 25); // Start at ambient temperature
    });
  }

  /**
   * Calculate continuous energy harvesting from wheel rotation
   */
  public calculateContinuousHarvesting(inputs: WheelRotationInputs): EnergyHarvestingOutputs {
    // Validate inputs
    this.validateInputs(inputs);

    // Check if harvesting should be active
    if (!this.shouldHarvestEnergy(inputs)) {
      return this.generateZeroHarvestingOutput();
    }

    // Calculate electromagnetic induction parameters
    const inductionData = this.calculateElectromagneticInduction(inputs);

    // Calculate optimal harvesting ratio based on current conditions
    const harvestingRatio = this.calculateOptimalHarvestingRatio(inputs);

    // Calculate harvested power
    const harvestedPower = this.calculateHarvestedPower(inputs, harvestingRatio, inductionData);

    // Calculate efficiency metrics
    const efficiency = this.calculateHarvestingEfficiency(inputs, harvestedPower);

    // Calculate propulsion impact
    const propulsionImpact = this.calculatePropulsionImpact(inputs, harvestingRatio);

    // Calculate thermal effects
    const thermalGeneration = this.calculateThermalGeneration(harvestedPower, efficiency);

    // Calculate net energy gain
    const netEnergyGain = harvestedPower - thermalGeneration - (inputs.wheelTorque * propulsionImpact * 0.01);

    // Update performance history
    this.updatePerformanceHistory(efficiency, harvestedPower);

    return {
      harvestedPower,
      harvestingEfficiency: efficiency,
      propulsionEfficiencyImpact: propulsionImpact,
      inductionTorque: inductionData.inductionTorque,
      thermalGeneration,
      netEnergyGain: Math.max(0, netEnergyGain) // Ensure non-negative
    };
  }

  private shouldHarvestEnergy(inputs: WheelRotationInputs): boolean {
    // Don't harvest if speed is too low
    if (inputs.vehicleSpeed < this.harvestingStrategy.minHarvestingSpeed) {
      return false;
    }

    // Don't harvest if battery is full
    if (inputs.batterySOC > 0.95) {
      return false;
    }

    // Don't harvest if motor is overheating
    if (inputs.motorTemperature > 120) {
      return false;
    }

    // Don't harvest if motor is under high load (preserve propulsion efficiency)
    if (inputs.motorLoad > 0.8) {
      return false;
    }

    return true;
  }

  private calculateElectromagneticInduction(inputs: WheelRotationInputs): {
    inducedVoltage: number;
    inducedCurrent: number;
    inductionTorque: number;
  } {
    // Convert wheel speed from RPM to rad/s
    const angularVelocity = (inputs.wheelSpeed * 2 * Math.PI) / 60;

    // Calculate induced EMF using Faraday's law
    // EMF = B * L * v (where B = flux density, L = conductor length, v = velocity)
    const conductorLength = this.inductionParams.coilDiameter * Math.PI * this.inductionParams.coilTurns;
    const linearVelocity = angularVelocity * (this.inductionParams.coilDiameter / 2);
    
    const inducedVoltage = this.inductionParams.magneticFluxDensity * 
                          conductorLength * 
                          linearVelocity * 
                          this.inductionParams.coilCount;

    // Calculate induced current (considering coil resistance and load)
    const totalResistance = this.inductionParams.coilResistance * this.inductionParams.coilCount;
    const inducedCurrent = inducedVoltage / totalResistance;

    // Calculate electromagnetic torque opposing rotation
    const inductionTorque = this.inductionParams.magneticFluxDensity * 
                           inducedCurrent * 
                           conductorLength * 
                           (this.inductionParams.coilDiameter / 2);

    return {
      inducedVoltage,
      inducedCurrent,
      inductionTorque
    };
  }

  private calculateOptimalHarvestingRatio(inputs: WheelRotationInputs): number {
    let baseRatio = this.harvestingStrategy.maxHarvestingRatio;

    // Adjust based on battery SOC (harvest more when battery is low)
    const socFactor = 1 - inputs.batterySOC;
    baseRatio *= (0.5 + 0.5 * socFactor);

    // Adjust based on motor load (harvest less when motor is loaded)
    const loadFactor = 1 - inputs.motorLoad;
    baseRatio *= loadFactor;

    // Adjust based on speed (optimal harvesting at medium speeds)
    const speedFactor = this.calculateSpeedOptimizationFactor(inputs.vehicleSpeed);
    baseRatio *= speedFactor;

    // Adjust based on road gradient (harvest less on uphill)
    const gradientFactor = Math.max(0.3, 1 - Math.max(0, inputs.roadGradient) * 0.01);
    baseRatio *= gradientFactor;

    // Apply thermal protection
    if (this.harvestingStrategy.thermalProtection) {
      const thermalFactor = this.calculateThermalProtectionFactor(inputs.motorTemperature);
      baseRatio *= thermalFactor;
    }

    return Math.max(0, Math.min(baseRatio, this.harvestingStrategy.maxHarvestingRatio));
  }

  private calculateSpeedOptimizationFactor(speed: number): number {
    // Optimal harvesting efficiency curve based on speed
    // Peak efficiency around 60-80 km/h
    if (speed < 30) return 0.6;
    if (speed < 60) return 0.6 + (speed - 30) * 0.4 / 30; // Linear increase to 1.0
    if (speed <= 80) return 1.0; // Peak efficiency
    if (speed <= 120) return 1.0 - (speed - 80) * 0.3 / 40; // Gradual decrease
    return 0.7; // Maintain reasonable efficiency at high speeds
  }

  private calculateThermalProtectionFactor(temperature: number): number {
    if (temperature < 80) return 1.0;
    if (temperature < 100) return 1.0 - (temperature - 80) * 0.5 / 20;
    if (temperature < 120) return 0.5 - (temperature - 100) * 0.5 / 20;
    return 0.0; // No harvesting above 120°C
  }

  private calculateHarvestedPower(
    inputs: WheelRotationInputs,
    harvestingRatio: number,
    inductionData: { inducedVoltage: number; inducedCurrent: number }
  ): number {
    // Calculate available rotational power
    const angularVelocity = (inputs.wheelSpeed * 2 * Math.PI) / 60;
    const availableRotationalPower = inputs.wheelTorque * angularVelocity;

    // Calculate electromagnetic power from induction
    const electromagneticPower = inductionData.inducedVoltage * inductionData.inducedCurrent;

    // Apply harvesting ratio to limit power extraction
    const targetHarvestedPower = availableRotationalPower * harvestingRatio;

    // Use the minimum of electromagnetic capability and target power
    const harvestedPower = Math.min(electromagneticPower, targetHarvestedPower);

    // Apply efficiency losses
    const conversionEfficiency = this.calculateConversionEfficiency(inputs);
    
    return harvestedPower * conversionEfficiency;
  }

  private calculateConversionEfficiency(inputs: WheelRotationInputs): number {
    let baseEfficiency = 0.92; // Base electromagnetic conversion efficiency

    // Temperature effects on efficiency
    const tempEfficiency = this.calculateTemperatureEfficiency(inputs.motorTemperature);
    baseEfficiency *= tempEfficiency;

    // Speed effects on efficiency
    const speedEfficiency = this.calculateSpeedEfficiency(inputs.vehicleSpeed);
    baseEfficiency *= speedEfficiency;

    // Air gap effects (smaller gap = higher efficiency)
    const airGapEfficiency = 1 - (this.inductionParams.airGapDistance * 50); // Penalty for larger gaps
    baseEfficiency *= Math.max(0.8, airGapEfficiency);

    return Math.max(0.7, Math.min(0.95, baseEfficiency));
  }

  private calculateTemperatureEfficiency(temperature: number): number {
    // Efficiency decreases with temperature due to increased resistance
    if (temperature < 25) return 1.0;
    if (temperature < 80) return 1.0 - (temperature - 25) * 0.1 / 55;
    if (temperature < 120) return 0.9 - (temperature - 80) * 0.2 / 40;
    return 0.7;
  }

  private calculateSpeedEfficiency(speed: number): number {
    // Efficiency varies with speed due to eddy currents and other losses
    if (speed < 20) return 0.8;
    if (speed < 60) return 0.8 + (speed - 20) * 0.15 / 40;
    if (speed <= 100) return 0.95;
    return 0.95 - (speed - 100) * 0.1 / 50; // Slight decrease at very high speeds
  }

  private calculateHarvestingEfficiency(inputs: WheelRotationInputs, harvestedPower: number): number {
    if (harvestedPower === 0) return 0;

    const angularVelocity = (inputs.wheelSpeed * 2 * Math.PI) / 60;
    const totalRotationalPower = inputs.wheelTorque * angularVelocity;

    if (totalRotationalPower === 0) return 0;

    return Math.min(1.0, harvestedPower / totalRotationalPower);
  }

  private calculatePropulsionImpact(inputs: WheelRotationInputs, harvestingRatio: number): number {
    // Calculate the impact on propulsion efficiency
    // Well-designed system should have minimal impact
    
    let baseImpact = harvestingRatio * 0.02; // 2% impact per 100% harvesting ratio

    // Reduce impact at optimal operating conditions
    const speedFactor = this.calculateSpeedOptimizationFactor(inputs.vehicleSpeed);
    baseImpact *= (2 - speedFactor); // Lower impact at optimal speeds

    // Increase impact under high load conditions
    const loadFactor = 1 + inputs.motorLoad * 0.5;
    baseImpact *= loadFactor;

    // Ensure impact never exceeds 5% for safety
    return Math.min(0.05, baseImpact);
  }

  private calculateThermalGeneration(harvestedPower: number, efficiency: number): number {
    // Calculate thermal energy generated due to losses
    const losses = harvestedPower * (1 - efficiency);
    
    // Additional thermal generation from electromagnetic effects
    const electromagneticThermal = harvestedPower * 0.03; // 3% additional thermal
    
    return losses + electromagneticThermal;
  }

  private updatePerformanceHistory(efficiency: number, power: number): void {
    const currentTime = Date.now();
    
    this.performanceHistory.push({
      timestamp: currentTime,
      efficiency,
      power
    });

    // Keep only last 200 entries (about 20 seconds at 10Hz)
    if (this.performanceHistory.length > 200) {
      this.performanceHistory.shift();
    }
  }

  private generateZeroHarvestingOutput(): EnergyHarvestingOutputs {
    return {
      harvestedPower: 0,
      harvestingEfficiency: 0,
      propulsionEfficiencyImpact: 0,
      inductionTorque: 0,
      thermalGeneration: 0,
      netEnergyGain: 0
    };
  }

  private validateInputs(inputs: WheelRotationInputs): void {
    if (inputs.wheelSpeed < 0 || inputs.wheelSpeed > 10000) {
      throw new Error('Invalid wheel speed: must be between 0 and 10000 RPM');
    }
    if (inputs.vehicleSpeed < 0 || inputs.vehicleSpeed > 300) {
      throw new Error('Invalid vehicle speed: must be between 0 and 300 km/h');
    }
    if (inputs.batterySOC < 0 || inputs.batterySOC > 1) {
      throw new Error('Invalid battery SOC: must be between 0 and 1');
    }
    if (inputs.motorLoad < 0 || inputs.motorLoad > 1) {
      throw new Error('Invalid motor load: must be between 0 and 1');
    }
  }

  /**
   * Get system diagnostics and performance metrics
   */
  public getDiagnostics(): {
    averageEfficiency: number;
    averagePower: number;
    totalEnergyHarvested: number;
    thermalState: Map<string, number>;
    inductionParameters: InductionCoilParameters;
    harvestingStrategy: HarvestingStrategy;
  } {
    const recentHistory = this.performanceHistory.slice(-50); // Last 5 seconds
    
    const averageEfficiency = recentHistory.length > 0 
      ? recentHistory.reduce((sum, entry) => sum + entry.efficiency, 0) / recentHistory.length
      : 0;

    const averagePower = recentHistory.length > 0
      ? recentHistory.reduce((sum, entry) => sum + entry.power, 0) / recentHistory.length
      : 0;

    const totalEnergyHarvested = this.performanceHistory.reduce((sum, entry) => sum + entry.power, 0) * 0.1; // Assuming 10Hz sampling

    return {
      averageEfficiency,
      averagePower,
      totalEnergyHarvested,
      thermalState: new Map(this.thermalModel),
      inductionParameters: { ...this.inductionParams },
      harvestingStrategy: { ...this.harvestingStrategy }
    };
  }

  /**
   * Update induction coil parameters for optimization
   */
  public updateInductionParameters(newParams: Partial<InductionCoilParameters>): void {
    this.inductionParams = { ...this.inductionParams, ...newParams };
  }

  /**
   * Update harvesting strategy
   */
  public updateHarvestingStrategy(newStrategy: Partial<HarvestingStrategy>): void {
    this.harvestingStrategy = { ...this.harvestingStrategy, ...newStrategy };
  }

  /**
   * Reset performance history and thermal states
   */
  public resetSystem(): void {
    this.performanceHistory = [];
    this.initializeThermalModel();
  }
}