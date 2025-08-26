/**
 * Hydraulic Electromagnetic Regenerative Damper System
 * 
 * This module implements a hydraulic regenerative electromagnetic shock absorber
 * that generates energy while the vehicle is in transit through suspension movement.
 * The system combines hydraulic damping with electromagnetic energy harvesting.
 */

export interface DamperInputs {
  /** Suspension compression velocity (m/s) - positive for compression, negative for extension */
  compressionVelocity: number;
  /** Suspension displacement from neutral position (m) - positive for compression */
  displacement: number;
  /** Vehicle speed (km/h) */
  vehicleSpeed: number;
  /** Road surface roughness coefficient (0-1, where 1 is very rough) */
  roadRoughness: number;
  /** Damper temperature (°C) */
  damperTemperature: number;
  /** Battery state of charge (0-1) */
  batterySOC: number;
  /** Vehicle load factor (0-1, where 1 is maximum load) */
  loadFactor: number;
}

export interface DamperOutputs {
  /** Generated electrical power (W) */
  generatedPower: number;
  /** Damping force (N) */
  dampingForce: number;
  /** Energy recovery efficiency (0-1) */
  energyEfficiency: number;
  /** Electromagnetic force (N) */
  electromagneticForce: number;
  /** Hydraulic pressure (Pa) */
  hydraulicPressure: number;
  /** System temperature (°C) */
  systemTemperature: number;
  /** Energy harvested in current cycle (J) */
  harvestedEnergy: number;
}

export interface DamperConfiguration {
  /** Maximum damping force (N) */
  maxDampingForce: number;
  /** Maximum electromagnetic force (N) */
  maxElectromagneticForce: number;
  /** Coil resistance (Ω) */
  coilResistance: number;
  /** Magnetic flux density (T) */
  magneticFluxDensity: number;
  /** Coil length (m) */
  coilLength: number;
  /** Hydraulic cylinder diameter (m) */
  cylinderDiameter: number;
  /** Maximum operating temperature (°C) */
  maxOperatingTemperature: number;
  /** Energy conversion efficiency factor */
  conversionEfficiency: number;
}

export interface DamperConstraints {
  /** Maximum compression velocity (m/s) */
  maxCompressionVelocity: number;
  /** Maximum extension velocity (m/s) */
  maxExtensionVelocity: number;
  /** Maximum displacement (m) */
  maxDisplacement: number;
  /** Minimum displacement (m) */
  minDisplacement: number;
  /** Maximum power output (W) */
  maxPowerOutput: number;
  /** Temperature derating threshold (°C) */
  temperatureDeratingThreshold: number;
}

export class HydraulicElectromagneticRegenerativeDamper {
  private config: DamperConfiguration;
  private constraints: DamperConstraints;
  private totalEnergyHarvested: number = 0;
  private operationCycles: number = 0;
  private lastCalculationTime: number = 0;

  constructor(
    config?: Partial<DamperConfiguration>,
    constraints?: Partial<DamperConstraints>
  ) {
    this.config = {
      maxDampingForce: 8000,           // N - typical for passenger vehicle
      maxElectromagneticForce: 2000,   // N - electromagnetic contribution
      coilResistance: 0.5,             // Ω - low resistance for efficiency
      magneticFluxDensity: 1.2,        // T - strong permanent magnets
      coilLength: 0.15,                // m - effective coil length
      cylinderDiameter: 0.05,          // m - 50mm diameter
      maxOperatingTemperature: 120,    // °C - thermal limit
      conversionEfficiency: 0.85,      // 85% electromagnetic conversion efficiency
      ...config
    };

    this.constraints = {
      maxCompressionVelocity: 2.0,     // m/s - maximum compression speed
      maxExtensionVelocity: 2.0,       // m/s - maximum extension speed
      maxDisplacement: 0.15,           // m - maximum compression
      minDisplacement: -0.15,          // m - maximum extension
      maxPowerOutput: 1500,            // W - maximum power per damper
      temperatureDeratingThreshold: 100, // °C - start reducing performance
      ...constraints
    };
  }

  /**
   * Calculate damper performance and energy generation
   */
  public calculateDamperPerformance(inputs: DamperInputs): DamperOutputs {
    this.validateInputs(inputs);
    this.lastCalculationTime = Date.now();
    this.operationCycles++;

    // Calculate electromagnetic force based on velocity and magnetic field
    const electromagneticForce = this.calculateElectromagneticForce(inputs);
    
    // Calculate hydraulic damping force
    const hydraulicForce = this.calculateHydraulicForce(inputs);
    
    // Total damping force
    const totalDampingForce = hydraulicForce + electromagneticForce;
    
    // Calculate generated power from electromagnetic induction
    const generatedPower = this.calculateGeneratedPower(inputs, electromagneticForce);
    
    // Calculate energy efficiency
    const energyEfficiency = this.calculateEnergyEfficiency(inputs, generatedPower);
    
    // Calculate hydraulic pressure
    const hydraulicPressure = this.calculateHydraulicPressure(inputs, hydraulicForce);
    
    // Calculate system temperature rise
    const systemTemperature = this.calculateSystemTemperature(inputs, generatedPower);
    
    // Calculate energy harvested in this cycle
    const harvestedEnergy = this.calculateHarvestedEnergy(generatedPower);
    
    // Apply safety constraints and thermal derating
    const constrainedOutputs = this.applyConstraints({
      generatedPower,
      dampingForce: totalDampingForce,
      energyEfficiency,
      electromagneticForce,
      hydraulicPressure,
      systemTemperature,
      harvestedEnergy
    }, inputs);

    // Update total energy harvested
    this.totalEnergyHarvested += constrainedOutputs.harvestedEnergy;

    return constrainedOutputs;
  }

  /**
   * Calculate electromagnetic force based on Faraday's law
   * F = B * I * L, where I = (B * L * v) / R
   */
  private calculateElectromagneticForce(inputs: DamperInputs): number {
    const { magneticFluxDensity, coilLength, coilResistance } = this.config;
    const velocity = Math.abs(inputs.compressionVelocity);
    
    // Induced EMF: ε = B * L * v
    const inducedEMF = magneticFluxDensity * coilLength * velocity;
    
    // Induced current: I = ε / R
    const inducedCurrent = inducedEMF / coilResistance;
    
    // Electromagnetic force: F = B * I * L
    const electromagneticForce = magneticFluxDensity * inducedCurrent * coilLength;
    
    // Apply velocity-dependent scaling
    const velocityFactor = this.calculateVelocityScalingFactor(velocity);
    
    return Math.min(electromagneticForce * velocityFactor, this.config.maxElectromagneticForce);
  }

  /**
   * Calculate hydraulic damping force based on velocity and displacement
   */
  private calculateHydraulicForce(inputs: DamperInputs): number {
    const velocity = inputs.compressionVelocity;
    const displacement = inputs.displacement;
    
    // Velocity-dependent damping (quadratic relationship)
    const velocityDamping = Math.sign(velocity) * Math.pow(Math.abs(velocity), 1.8) * 1000;
    
    // Position-dependent spring force
    const springForce = displacement * 25000; // N/m spring rate
    
    // Load-dependent adjustment
    const loadAdjustment = 1 + (inputs.loadFactor * 0.3);
    
    // Road roughness adjustment
    const roughnessAdjustment = 1 + (inputs.roadRoughness * 0.2);
    
    const totalHydraulicForce = (velocityDamping + springForce) * loadAdjustment * roughnessAdjustment;
    
    return Math.min(Math.abs(totalHydraulicForce), this.config.maxDampingForce);
  }

  /**
   * Calculate generated electrical power
   */
  private calculateGeneratedPower(inputs: DamperInputs, electromagneticForce: number): number {
    const velocity = Math.abs(inputs.compressionVelocity);
    
    // Power = Force × Velocity × Efficiency
    const mechanicalPower = electromagneticForce * velocity;
    const electricalPower = mechanicalPower * this.config.conversionEfficiency;
    
    // Apply battery SOC factor (reduce charging when battery is full)
    const socFactor = this.calculateSOCFactor(inputs.batterySOC);
    
    // Apply temperature derating
    const temperatureFactor = this.calculateTemperatureDerating(inputs.damperTemperature);
    
    const adjustedPower = electricalPower * socFactor * temperatureFactor;
    
    return Math.min(adjustedPower, this.constraints.maxPowerOutput);
  }

  /**
   * Calculate energy recovery efficiency
   */
  private calculateEnergyEfficiency(inputs: DamperInputs, generatedPower: number): number {
    const velocity = Math.abs(inputs.compressionVelocity);
    
    if (velocity < 0.01) return 0; // No movement, no efficiency
    
    // Theoretical maximum power based on kinetic energy
    const kineticPower = 0.5 * 1000 * Math.pow(velocity, 2); // Assuming 1000kg effective mass
    
    if (kineticPower < 1) return 0; // Avoid division by very small numbers
    
    const efficiency = Math.min(generatedPower / kineticPower, 1.0);
    
    // Apply efficiency curve based on operating conditions
    const operatingEfficiency = this.calculateOperatingEfficiency(inputs);
    
    return efficiency * operatingEfficiency;
  }

  /**
   * Calculate hydraulic pressure in the system
   */
  private calculateHydraulicPressure(inputs: DamperInputs, hydraulicForce: number): number {
    const cylinderArea = Math.PI * Math.pow(this.config.cylinderDiameter / 2, 2);
    const pressure = hydraulicForce / cylinderArea;
    
    // Add dynamic pressure component based on velocity
    const dynamicPressure = Math.pow(Math.abs(inputs.compressionVelocity), 2) * 500;
    
    return pressure + dynamicPressure;
  }

  /**
   * Calculate system temperature including heat generation
   */
  private calculateSystemTemperature(inputs: DamperInputs, generatedPower: number): number {
    const ambientTemp = inputs.damperTemperature;
    
    // Heat generation from electrical losses
    const electricalLosses = generatedPower * (1 - this.config.conversionEfficiency);
    
    // Heat generation from hydraulic friction
    const hydraulicLosses = Math.abs(inputs.compressionVelocity) * 100;
    
    // Total heat generation
    const totalHeat = electricalLosses + hydraulicLosses;
    
    // Temperature rise (simplified thermal model)
    const temperatureRise = totalHeat / 1000; // Assuming 1000 J/K thermal capacity
    
    // Apply cooling factor based on vehicle speed (air cooling)
    const coolingFactor = Math.min(inputs.vehicleSpeed / 100, 1.0);
    const effectiveTemperatureRise = temperatureRise * (1 - coolingFactor * 0.3);
    
    return ambientTemp + effectiveTemperatureRise;
  }

  /**
   * Calculate energy harvested in current calculation cycle
   */
  private calculateHarvestedEnergy(generatedPower: number): number {
    // Assume 10ms calculation interval for energy integration
    const timeInterval = 0.01; // seconds
    return generatedPower * timeInterval;
  }

  /**
   * Calculate velocity scaling factor for electromagnetic force
   */
  private calculateVelocityScalingFactor(velocity: number): number {
    // Optimal velocity range for maximum efficiency
    const optimalVelocity = 0.5; // m/s
    
    if (velocity <= optimalVelocity) {
      return velocity / optimalVelocity;
    } else {
      // Efficiency decreases at very high velocities due to eddy currents
      return Math.max(0.3, 1 - (velocity - optimalVelocity) * 0.2);
    }
  }

  /**
   * Calculate SOC factor for power generation
   */
  private calculateSOCFactor(batterySOC: number): number {
    if (batterySOC >= 0.95) return 0.1; // Minimal charging when nearly full
    if (batterySOC >= 0.85) return 0.5; // Reduced charging when high
    if (batterySOC >= 0.7) return 0.8;  // Normal charging
    return 1.0; // Full charging when low
  }

  /**
   * Calculate temperature derating factor
   */
  private calculateTemperatureDerating(temperature: number): number {
    const threshold = this.constraints.temperatureDeratingThreshold;
    const maxTemp = this.config.maxOperatingTemperature;
    
    if (temperature <= threshold) return 1.0;
    if (temperature >= maxTemp) return 0.1; // Minimal operation at max temp
    
    // Linear derating between threshold and max temperature
    return 1.0 - (temperature - threshold) / (maxTemp - threshold) * 0.9;
  }

  /**
   * Calculate operating efficiency based on conditions
   */
  private calculateOperatingEfficiency(inputs: DamperInputs): number {
    let efficiency = 1.0;
    
    // Reduce efficiency at extreme temperatures
    if (inputs.damperTemperature > 80) {
      efficiency *= 0.95;
    }
    if (inputs.damperTemperature < 0) {
      efficiency *= 0.9; // Cold weather reduces efficiency
    }
    
    // Road roughness affects efficiency
    efficiency *= (1 - inputs.roadRoughness * 0.1);
    
    // Vehicle speed affects aerodynamic cooling and efficiency
    if (inputs.vehicleSpeed > 120) {
      efficiency *= 0.98; // Slight reduction at very high speeds
    }
    
    return Math.max(efficiency, 0.5); // Minimum 50% efficiency
  }

  /**
   * Apply system constraints and safety limits
   */
  private applyConstraints(outputs: DamperOutputs, inputs: DamperInputs): DamperOutputs {
    const constrainedOutputs = { ...outputs };
    
    // Limit power output
    constrainedOutputs.generatedPower = Math.min(
      constrainedOutputs.generatedPower,
      this.constraints.maxPowerOutput
    );
    
    // Limit damping force
    constrainedOutputs.dampingForce = Math.min(
      constrainedOutputs.dampingForce,
      this.config.maxDampingForce
    );
    
    // Limit electromagnetic force
    constrainedOutputs.electromagneticForce = Math.min(
      constrainedOutputs.electromagneticForce,
      this.config.maxElectromagneticForce
    );
    
    // Apply thermal protection
    if (constrainedOutputs.systemTemperature > this.config.maxOperatingTemperature) {
      const protectionFactor = 0.1; // Reduce to 10% operation
      constrainedOutputs.generatedPower *= protectionFactor;
      constrainedOutputs.electromagneticForce *= protectionFactor;
    }
    
    // Ensure non-negative values
    constrainedOutputs.generatedPower = Math.max(0, constrainedOutputs.generatedPower);
    constrainedOutputs.energyEfficiency = Math.max(0, Math.min(1, constrainedOutputs.energyEfficiency));
    constrainedOutputs.harvestedEnergy = Math.max(0, constrainedOutputs.harvestedEnergy);
    
    return constrainedOutputs;
  }

  /**
   * Validate input parameters
   */
  private validateInputs(inputs: DamperInputs): void {
    if (Math.abs(inputs.compressionVelocity) > Math.max(
      this.constraints.maxCompressionVelocity,
      this.constraints.maxExtensionVelocity
    )) {
      throw new Error(`Compression velocity ${inputs.compressionVelocity} exceeds maximum allowed velocity`);
    }
    
    if (inputs.displacement > this.constraints.maxDisplacement || 
        inputs.displacement < this.constraints.minDisplacement) {
      throw new Error(`Displacement ${inputs.displacement} is outside allowed range`);
    }
    
    if (inputs.vehicleSpeed < 0 || inputs.vehicleSpeed > 300) {
      throw new Error('Vehicle speed must be between 0 and 300 km/h');
    }
    
    if (inputs.roadRoughness < 0 || inputs.roadRoughness > 1) {
      throw new Error('Road roughness must be between 0 and 1');
    }
    
    if (inputs.batterySOC < 0 || inputs.batterySOC > 1) {
      throw new Error('Battery SOC must be between 0 and 1');
    }
    
    if (inputs.loadFactor < 0 || inputs.loadFactor > 1) {
      throw new Error('Load factor must be between 0 and 1');
    }
    
    if (inputs.damperTemperature < -40 || inputs.damperTemperature > 200) {
      throw new Error('Damper temperature must be between -40 and 200°C');
    }
  }

  /**
   * Get system diagnostics and performance metrics
   */
  public getDiagnostics(): {
    totalEnergyHarvested: number;
    operationCycles: number;
    averageEnergyPerCycle: number;
    systemConfiguration: DamperConfiguration;
    systemConstraints: DamperConstraints;
    lastCalculationTime: number;
    isOperational: boolean;
  } {
    return {
      totalEnergyHarvested: this.totalEnergyHarvested,
      operationCycles: this.operationCycles,
      averageEnergyPerCycle: this.operationCycles > 0 ? 
        this.totalEnergyHarvested / this.operationCycles : 0,
      systemConfiguration: { ...this.config },
      systemConstraints: { ...this.constraints },
      lastCalculationTime: this.lastCalculationTime,
      isOperational: true
    };
  }

  /**
   * Reset system statistics
   */
  public resetStatistics(): void {
    this.totalEnergyHarvested = 0;
    this.operationCycles = 0;
    this.lastCalculationTime = 0;
  }

  /**
   * Update system configuration
   */
  public updateConfiguration(newConfig: Partial<DamperConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Update system constraints
   */
  public updateConstraints(newConstraints: Partial<DamperConstraints>): void {
    this.constraints = { ...this.constraints, ...newConstraints };
  }
}