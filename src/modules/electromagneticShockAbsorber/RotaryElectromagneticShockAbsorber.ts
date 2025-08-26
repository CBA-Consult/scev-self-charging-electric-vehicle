/**
 * Rotary Electromagnetic Shock Absorber System
 * 
 * This module implements a rotary electromagnetic shock absorber that converts
 * vertical suspension motion into electrical energy through electromagnetic induction.
 * The system provides both energy harvesting and controllable damping characteristics.
 */

export interface SuspensionInputs {
  /** Vertical displacement velocity (m/s) */
  verticalVelocity: number;
  /** Vertical displacement (m) */
  displacement: number;
  /** Vehicle load on this corner (kg) */
  cornerLoad: number;
  /** Road surface condition */
  roadCondition: 'smooth' | 'rough' | 'very_rough';
  /** Vehicle speed (km/h) */
  vehicleSpeed: number;
  /** Ambient temperature (°C) */
  ambientTemperature: number;
}

export interface ShockAbsorberOutputs {
  /** Generated electrical power (W) */
  generatedPower: number;
  /** Damping force (N) */
  dampingForce: number;
  /** Rotational speed of generator (RPM) */
  generatorRPM: number;
  /** System efficiency (0-1) */
  efficiency: number;
  /** Generated voltage (V) */
  outputVoltage: number;
  /** Generated current (A) */
  outputCurrent: number;
}

export interface ElectromagneticParameters {
  /** Number of magnetic poles */
  poleCount: number;
  /** Magnetic flux density (Tesla) */
  fluxDensity: number;
  /** Coil turns per phase */
  coilTurns: number;
  /** Coil resistance (Ohms) */
  coilResistance: number;
  /** Core material permeability */
  coreMaterialPermeability: number;
  /** Air gap length (mm) */
  airGapLength: number;
}

export interface MechanicalParameters {
  /** Gear ratio for motion conversion */
  gearRatio: number;
  /** Flywheel moment of inertia (kg⋅m²) */
  flywheelInertia: number;
  /** Mechanical efficiency */
  mechanicalEfficiency: number;
  /** Maximum rotational speed (RPM) */
  maxRotationalSpeed: number;
  /** Bearing friction coefficient */
  bearingFriction: number;
}

export interface DampingCharacteristics {
  /** Base damping coefficient (N⋅s/m) */
  baseDampingCoefficient: number;
  /** Variable damping range (0-1) */
  variableDampingRange: number;
  /** Comfort mode damping multiplier */
  comfortModeMultiplier: number;
  /** Sport mode damping multiplier */
  sportModeMultiplier: number;
  /** Energy harvesting mode multiplier */
  energyHarvestingMultiplier: number;
}

export type DampingMode = 'comfort' | 'sport' | 'energy_harvesting' | 'adaptive';

export class RotaryElectromagneticShockAbsorber {
  private electromagneticParams: ElectromagneticParameters;
  private mechanicalParams: MechanicalParameters;
  private dampingParams: DampingCharacteristics;
  private currentMode: DampingMode;
  private flywheelAngularVelocity: number;
  private accumulatedEnergy: number;
  private operatingTemperature: number;

  constructor(
    electromagneticParams?: Partial<ElectromagneticParameters>,
    mechanicalParams?: Partial<MechanicalParameters>,
    dampingParams?: Partial<DampingCharacteristics>
  ) {
    this.electromagneticParams = {
      poleCount: 12,
      fluxDensity: 1.2, // Tesla
      coilTurns: 200,
      coilResistance: 0.5, // Ohms
      coreMaterialPermeability: 5000,
      airGapLength: 1.5, // mm
      ...electromagneticParams
    };

    this.mechanicalParams = {
      gearRatio: 15.0, // 15:1 gear ratio for motion amplification
      flywheelInertia: 0.05, // kg⋅m²
      mechanicalEfficiency: 0.92,
      maxRotationalSpeed: 3000, // RPM
      bearingFriction: 0.002,
      ...mechanicalParams
    };

    this.dampingParams = {
      baseDampingCoefficient: 2500, // N⋅s/m
      variableDampingRange: 0.6,
      comfortModeMultiplier: 0.8,
      sportModeMultiplier: 1.4,
      energyHarvestingMultiplier: 1.2,
      ...dampingParams
    };

    this.currentMode = 'adaptive';
    this.flywheelAngularVelocity = 0;
    this.accumulatedEnergy = 0;
    this.operatingTemperature = 25; // °C
  }

  /**
   * Main processing function - converts suspension motion to electrical energy
   */
  public processMotion(inputs: SuspensionInputs): ShockAbsorberOutputs {
    // Validate inputs
    this.validateInputs(inputs);

    // Update operating temperature
    this.updateOperatingTemperature(inputs.ambientTemperature);

    // Convert vertical motion to rotational motion
    const rotationalVelocity = this.convertVerticalToRotational(inputs.verticalVelocity);

    // Update flywheel dynamics
    this.updateFlywheelDynamics(rotationalVelocity, inputs);

    // Calculate electromagnetic generation
    const electromagneticOutputs = this.calculateElectromagneticGeneration();

    // Calculate damping force
    const dampingForce = this.calculateDampingForce(inputs);

    // Determine optimal damping mode
    this.updateDampingMode(inputs);

    // Apply efficiency corrections
    const efficiency = this.calculateSystemEfficiency(inputs);

    return {
      generatedPower: electromagneticOutputs.power * efficiency,
      dampingForce,
      generatorRPM: this.flywheelAngularVelocity * 9.549, // Convert rad/s to RPM
      efficiency,
      outputVoltage: electromagneticOutputs.voltage,
      outputCurrent: electromagneticOutputs.current
    };
  }

  /**
   * Convert vertical suspension motion to rotational motion
   */
  private convertVerticalToRotational(verticalVelocity: number): number {
    // Convert linear velocity to angular velocity using gear ratio
    // Assuming rack and pinion mechanism with effective radius
    const effectiveRadius = 0.05; // 50mm effective radius
    const angularVelocity = (verticalVelocity / effectiveRadius) * this.mechanicalParams.gearRatio;
    
    // Limit to maximum rotational speed
    const maxAngularVelocity = (this.mechanicalParams.maxRotationalSpeed * 2 * Math.PI) / 60; // Convert RPM to rad/s
    return Math.min(Math.abs(angularVelocity), maxAngularVelocity) * Math.sign(angularVelocity);
  }

  /**
   * Update flywheel dynamics with energy storage
   */
  private updateFlywheelDynamics(inputAngularVelocity: number, inputs: SuspensionInputs): void {
    const dt = 0.001; // 1ms time step
    
    // Calculate torque from input motion
    const inputTorque = this.calculateInputTorque(inputAngularVelocity, inputs);
    
    // Calculate electromagnetic braking torque
    const electromagneticTorque = this.calculateElectromagneticTorque();
    
    // Calculate friction torque
    const frictionTorque = this.mechanicalParams.bearingFriction * this.flywheelAngularVelocity;
    
    // Net torque
    const netTorque = inputTorque - electromagneticTorque - frictionTorque;
    
    // Update angular velocity using Newton's second law for rotation
    const angularAcceleration = netTorque / this.mechanicalParams.flywheelInertia;
    this.flywheelAngularVelocity += angularAcceleration * dt;
    
    // Apply velocity limits
    const maxAngularVelocity = (this.mechanicalParams.maxRotationalSpeed * 2 * Math.PI) / 60;
    this.flywheelAngularVelocity = Math.max(-maxAngularVelocity, 
      Math.min(maxAngularVelocity, this.flywheelAngularVelocity));
  }

  /**
   * Calculate input torque from suspension motion
   */
  private calculateInputTorque(angularVelocity: number, inputs: SuspensionInputs): number {
    // Base torque proportional to input velocity and load
    const loadFactor = Math.min(inputs.cornerLoad / 500, 2.0); // Normalize to 500kg reference
    const velocityTorque = angularVelocity * loadFactor * 10; // Base scaling factor
    
    // Road condition modifier
    const roadMultiplier = this.getRoadConditionMultiplier(inputs.roadCondition);
    
    return velocityTorque * roadMultiplier * this.mechanicalParams.mechanicalEfficiency;
  }

  /**
   * Calculate electromagnetic generation parameters
   */
  private calculateElectromagneticGeneration(): { power: number; voltage: number; current: number } {
    // EMF calculation: E = B * L * v (simplified)
    // Where B = flux density, L = effective conductor length, v = velocity
    const effectiveConductorLength = this.electromagneticParams.coilTurns * 0.1; // Approximate
    const emf = this.electromagneticParams.fluxDensity * effectiveConductorLength * 
                Math.abs(this.flywheelAngularVelocity);
    
    // Account for temperature effects on resistance
    const temperatureCoefficient = 1 + 0.004 * (this.operatingTemperature - 25); // Copper temp coefficient
    const effectiveResistance = this.electromagneticParams.coilResistance * temperatureCoefficient;
    
    // Calculate current and power
    const current = emf / (effectiveResistance + 0.1); // Add load resistance
    const power = emf * current * 0.9; // 90% power factor
    
    return {
      power: Math.max(0, power),
      voltage: emf,
      current: current
    };
  }

  /**
   * Calculate electromagnetic braking torque
   */
  private calculateElectromagneticTorque(): number {
    const electromagneticOutputs = this.calculateElectromagneticGeneration();
    
    // Torque = Power / Angular velocity
    if (Math.abs(this.flywheelAngularVelocity) < 0.1) return 0;
    
    return electromagneticOutputs.power / Math.abs(this.flywheelAngularVelocity);
  }

  /**
   * Calculate damping force based on current mode and conditions
   */
  private calculateDampingForce(inputs: SuspensionInputs): number {
    let dampingCoefficient = this.dampingParams.baseDampingCoefficient;
    
    // Apply mode-specific multiplier
    switch (this.currentMode) {
      case 'comfort':
        dampingCoefficient *= this.dampingParams.comfortModeMultiplier;
        break;
      case 'sport':
        dampingCoefficient *= this.dampingParams.sportModeMultiplier;
        break;
      case 'energy_harvesting':
        dampingCoefficient *= this.dampingParams.energyHarvestingMultiplier;
        break;
      case 'adaptive':
        dampingCoefficient *= this.calculateAdaptiveDampingMultiplier(inputs);
        break;
    }
    
    // Variable damping based on velocity
    const velocityFactor = Math.min(Math.abs(inputs.verticalVelocity) / 2.0, 1.0);
    const variableDamping = 1 + (this.dampingParams.variableDampingRange * velocityFactor);
    
    return dampingCoefficient * variableDamping * inputs.verticalVelocity;
  }

  /**
   * Calculate adaptive damping multiplier based on conditions
   */
  private calculateAdaptiveDampingMultiplier(inputs: SuspensionInputs): number {
    let multiplier = 1.0;
    
    // Adjust based on vehicle speed
    if (inputs.vehicleSpeed > 80) {
      multiplier *= 1.2; // Stiffer at high speeds
    } else if (inputs.vehicleSpeed < 30) {
      multiplier *= 0.9; // Softer at low speeds
    }
    
    // Adjust based on road conditions
    const roadMultiplier = this.getRoadConditionMultiplier(inputs.roadCondition);
    multiplier *= roadMultiplier;
    
    // Adjust based on load
    const loadFactor = inputs.cornerLoad / 500; // Normalize to 500kg
    multiplier *= (0.8 + 0.4 * Math.min(loadFactor, 1.5));
    
    return Math.max(0.5, Math.min(2.0, multiplier));
  }

  /**
   * Get road condition multiplier
   */
  private getRoadConditionMultiplier(roadCondition: string): number {
    switch (roadCondition) {
      case 'smooth': return 0.9;
      case 'rough': return 1.1;
      case 'very_rough': return 1.3;
      default: return 1.0;
    }
  }

  /**
   * Update damping mode based on driving conditions
   */
  private updateDampingMode(inputs: SuspensionInputs): void {
    // Auto-switch to energy harvesting mode when conditions are favorable
    if (inputs.vehicleSpeed > 50 && inputs.roadCondition === 'rough') {
      this.currentMode = 'energy_harvesting';
    } else if (inputs.vehicleSpeed > 100) {
      this.currentMode = 'sport';
    } else if (inputs.vehicleSpeed < 30) {
      this.currentMode = 'comfort';
    } else {
      this.currentMode = 'adaptive';
    }
  }

  /**
   * Calculate overall system efficiency
   */
  private calculateSystemEfficiency(inputs: SuspensionInputs): number {
    let efficiency = this.mechanicalParams.mechanicalEfficiency;
    
    // Temperature derating
    if (this.operatingTemperature > 80) {
      efficiency *= (1 - (this.operatingTemperature - 80) * 0.002);
    }
    
    // Speed efficiency curve
    const speedEfficiency = this.calculateSpeedEfficiency();
    efficiency *= speedEfficiency;
    
    // Load efficiency
    const loadEfficiency = this.calculateLoadEfficiency(inputs.cornerLoad);
    efficiency *= loadEfficiency;
    
    return Math.max(0.3, Math.min(0.98, efficiency));
  }

  /**
   * Calculate speed-dependent efficiency
   */
  private calculateSpeedEfficiency(): number {
    const rpm = Math.abs(this.flywheelAngularVelocity) * 9.549;
    const optimalRPM = this.mechanicalParams.maxRotationalSpeed * 0.6;
    
    if (rpm < optimalRPM) {
      return 0.7 + 0.3 * (rpm / optimalRPM);
    } else {
      return 1.0 - 0.2 * ((rpm - optimalRPM) / (this.mechanicalParams.maxRotationalSpeed - optimalRPM));
    }
  }

  /**
   * Calculate load-dependent efficiency
   */
  private calculateLoadEfficiency(cornerLoad: number): number {
    const normalizedLoad = cornerLoad / 500; // 500kg reference
    
    if (normalizedLoad < 0.5) {
      return 0.8 + 0.2 * (normalizedLoad / 0.5);
    } else if (normalizedLoad <= 1.5) {
      return 1.0;
    } else {
      return 1.0 - 0.1 * (normalizedLoad - 1.5);
    }
  }

  /**
   * Update operating temperature
   */
  private updateOperatingTemperature(ambientTemp: number): void {
    // Simple thermal model - temperature rises with power generation
    const electromagneticOutputs = this.calculateElectromagneticGeneration();
    const heatGeneration = electromagneticOutputs.power * 0.1; // 10% heat loss
    
    const thermalTimeConstant = 300; // seconds
    const dt = 0.001;
    
    const targetTemp = ambientTemp + heatGeneration * 0.5;
    this.operatingTemperature += (targetTemp - this.operatingTemperature) * (dt / thermalTimeConstant);
  }

  /**
   * Validate input parameters
   */
  private validateInputs(inputs: SuspensionInputs): void {
    if (Math.abs(inputs.verticalVelocity) > 5.0) {
      throw new Error('Vertical velocity exceeds safe limits (±5.0 m/s)');
    }
    if (Math.abs(inputs.displacement) > 0.2) {
      throw new Error('Displacement exceeds safe limits (±0.2 m)');
    }
    if (inputs.cornerLoad < 0 || inputs.cornerLoad > 2000) {
      throw new Error('Corner load must be between 0 and 2000 kg');
    }
    if (inputs.vehicleSpeed < 0 || inputs.vehicleSpeed > 300) {
      throw new Error('Vehicle speed must be between 0 and 300 km/h');
    }
  }

  /**
   * Set damping mode manually
   */
  public setDampingMode(mode: DampingMode): void {
    this.currentMode = mode;
  }

  /**
   * Get current system status
   */
  public getSystemStatus(): {
    mode: DampingMode;
    flywheelRPM: number;
    operatingTemperature: number;
    accumulatedEnergy: number;
    isOperational: boolean;
  } {
    return {
      mode: this.currentMode,
      flywheelRPM: this.flywheelAngularVelocity * 9.549,
      operatingTemperature: this.operatingTemperature,
      accumulatedEnergy: this.accumulatedEnergy,
      isOperational: this.operatingTemperature < 120 && Math.abs(this.flywheelAngularVelocity) < 
        (this.mechanicalParams.maxRotationalSpeed * 2 * Math.PI / 60)
    };
  }

  /**
   * Reset system state
   */
  public resetSystem(): void {
    this.flywheelAngularVelocity = 0;
    this.accumulatedEnergy = 0;
    this.operatingTemperature = 25;
    this.currentMode = 'adaptive';
  }
}