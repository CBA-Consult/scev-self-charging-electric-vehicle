/**
 * Regenerative Braking Torque Model
 * 
 * This module implements the torque model for regenerative braking systems
 * in electric vehicles with in-wheel motors. It calculates optimal torque
 * distribution and manages the transition between regenerative and mechanical braking.
 */

export interface VehicleParameters {
  mass: number;                    // kg - vehicle mass
  frontAxleWeightRatio: number;    // 0-1 - front axle weight distribution
  wheelRadius: number;             // m - wheel radius
  motorCount: number;              // number of in-wheel motors
  maxMotorTorque: number;          // Nm - maximum torque per motor
  motorEfficiency: number;         // 0-1 - motor efficiency
  transmissionRatio: number;       // gear ratio (if applicable)
}

export interface BrakingDemand {
  totalBrakingForce: number;       // N - total required braking force
  brakingIntensity: number;        // 0-1 - normalized braking intensity
  vehicleSpeed: number;            // km/h - current vehicle speed
  roadGradient: number;            // % - road gradient (positive for uphill)
}

export interface TorqueDistribution {
  frontLeftMotor: number;          // Nm - torque for front left motor
  frontRightMotor: number;         // Nm - torque for front right motor
  rearLeftMotor?: number;          // Nm - torque for rear left motor (if equipped)
  rearRightMotor?: number;         // Nm - torque for rear right motor (if equipped)
  mechanicalBrakingForce: number;  // N - remaining force for mechanical brakes
  regeneratedPower: number;        // W - total regenerated power
  energyRecoveryEfficiency: number; // 0-1 - actual energy recovery efficiency
}

export interface MotorConstraints {
  maxTorque: number;               // Nm - maximum allowable torque
  maxPower: number;                // W - maximum power
  maxSpeed: number;                // rpm - maximum motor speed
  thermalLimit: number;            // °C - thermal protection limit
  currentTemperature: number;      // °C - current motor temperature
}

/**
 * Regenerative Braking Torque Model
 * 
 * Calculates optimal torque distribution for regenerative braking systems
 * considering vehicle dynamics, motor constraints, and energy recovery efficiency.
 */
export class RegenerativeBrakingTorqueModel {
  private vehicleParams: VehicleParameters;
  private motorConstraints: Map<string, MotorConstraints>;

  constructor(vehicleParams: VehicleParameters) {
    this.vehicleParams = vehicleParams;
    this.motorConstraints = new Map();
    this.initializeMotorConstraints();
  }

  /**
   * Initialize motor constraints for each motor
   */
  private initializeMotorConstraints(): void {
    const defaultConstraints: MotorConstraints = {
      maxTorque: this.vehicleParams.maxMotorTorque,
      maxPower: 150000, // 150 kW per motor
      maxSpeed: 3000,   // 3000 rpm
      thermalLimit: 150, // 150°C
      currentTemperature: 25 // 25°C ambient
    };

    this.motorConstraints.set('frontLeft', { ...defaultConstraints });
    this.motorConstraints.set('frontRight', { ...defaultConstraints });
    
    if (this.vehicleParams.motorCount === 4) {
      this.motorConstraints.set('rearLeft', { ...defaultConstraints });
      this.motorConstraints.set('rearRight', { ...defaultConstraints });
    }
  }

  /**
   * Calculate optimal torque distribution for regenerative braking
   */
  public calculateTorqueDistribution(
    brakingDemand: BrakingDemand,
    regenerativeBrakingRatio: number,
    batterySOC: number
  ): TorqueDistribution {
    // Convert speed from km/h to m/s
    const speedMs = brakingDemand.vehicleSpeed / 3.6;
    
    // Calculate maximum regenerative braking force available
    const maxRegenForce = this.calculateMaxRegenerativeForce(speedMs, batterySOC);
    
    // Calculate actual regenerative braking force
    const requestedRegenForce = brakingDemand.totalBrakingForce * regenerativeBrakingRatio;
    const actualRegenForce = Math.min(requestedRegenForce, maxRegenForce);
    
    // Calculate front axle braking force distribution
    const frontAxleForce = actualRegenForce * this.vehicleParams.frontAxleWeightRatio;
    
    // Distribute torque among front motors
    const torquePerFrontMotor = this.calculateMotorTorque(frontAxleForce / 2, speedMs);
    
    // Calculate remaining mechanical braking force
    const mechanicalBrakingForce = brakingDemand.totalBrakingForce - actualRegenForce;
    
    // Calculate regenerated power
    const regeneratedPower = this.calculateRegeneratedPower(actualRegenForce, speedMs);
    
    // Calculate energy recovery efficiency
    const energyRecoveryEfficiency = this.calculateEnergyRecoveryEfficiency(
      actualRegenForce,
      brakingDemand.totalBrakingForce,
      speedMs
    );

    const distribution: TorqueDistribution = {
      frontLeftMotor: torquePerFrontMotor,
      frontRightMotor: torquePerFrontMotor,
      mechanicalBrakingForce,
      regeneratedPower,
      energyRecoveryEfficiency
    };

    // Add rear motor torques if equipped with 4 motors
    if (this.vehicleParams.motorCount === 4) {
      const rearAxleForce = actualRegenForce * (1 - this.vehicleParams.frontAxleWeightRatio);
      const torquePerRearMotor = this.calculateMotorTorque(rearAxleForce / 2, speedMs);
      
      distribution.rearLeftMotor = torquePerRearMotor;
      distribution.rearRightMotor = torquePerRearMotor;
    }

    return this.applyMotorConstraints(distribution, speedMs);
  }

  /**
   * Calculate maximum regenerative braking force based on motor capabilities
   */
  private calculateMaxRegenerativeForce(speedMs: number, batterySOC: number): number {
    const motorSpeedRpm = (speedMs / this.vehicleParams.wheelRadius) * 60 / (2 * Math.PI);
    
    // Calculate maximum torque per motor at current speed
    let maxTorquePerMotor = this.vehicleParams.maxMotorTorque;
    
    // Reduce torque at high speeds (power limitation)
    const maxPowerPerMotor = 150000; // 150 kW
    const powerLimitedTorque = (maxPowerPerMotor * 60) / (2 * Math.PI * motorSpeedRpm);
    maxTorquePerMotor = Math.min(maxTorquePerMotor, powerLimitedTorque);
    
    // Reduce regenerative capability when battery is nearly full
    if (batterySOC > 0.9) {
      const socReduction = 1 - ((batterySOC - 0.9) / 0.1) * 0.8; // Reduce up to 80%
      maxTorquePerMotor *= socReduction;
    }
    
    // Calculate maximum force from all motors
    const totalMaxTorque = maxTorquePerMotor * this.vehicleParams.motorCount;
    const maxForce = totalMaxTorque / this.vehicleParams.wheelRadius;
    
    return maxForce;
  }

  /**
   * Calculate motor torque from braking force
   */
  private calculateMotorTorque(force: number, speedMs: number): number {
    const baseTorque = force * this.vehicleParams.wheelRadius;
    
    // Apply efficiency corrections
    const efficiencyFactor = this.vehicleParams.motorEfficiency;
    const adjustedTorque = baseTorque / efficiencyFactor;
    
    // Apply speed-dependent corrections
    const speedFactor = this.calculateSpeedCorrectionFactor(speedMs);
    
    return adjustedTorque * speedFactor;
  }

  /**
   * Calculate speed-dependent correction factor for torque
   */
  private calculateSpeedCorrectionFactor(speedMs: number): number {
    // Optimal regeneration efficiency typically occurs at medium speeds
    const optimalSpeed = 15; // m/s (54 km/h)
    
    if (speedMs <= optimalSpeed) {
      // Linear increase from 0.5 at 0 speed to 1.0 at optimal speed
      return 0.5 + (speedMs / optimalSpeed) * 0.5;
    } else {
      // Gradual decrease after optimal speed
      const speedRatio = speedMs / optimalSpeed;
      return Math.max(0.3, 1.0 / Math.sqrt(speedRatio));
    }
  }

  /**
   * Calculate regenerated power
   */
  private calculateRegeneratedPower(force: number, speedMs: number): number {
    const mechanicalPower = force * speedMs;
    const electricalPower = mechanicalPower * this.vehicleParams.motorEfficiency;
    
    return electricalPower;
  }

  /**
   * Calculate energy recovery efficiency
   */
  private calculateEnergyRecoveryEfficiency(
    regenForce: number,
    totalForce: number,
    speedMs: number
  ): number {
    if (totalForce === 0) return 0;
    
    const baseEfficiency = regenForce / totalForce;
    const speedEfficiency = this.calculateSpeedCorrectionFactor(speedMs);
    const motorEfficiency = this.vehicleParams.motorEfficiency;
    
    return baseEfficiency * speedEfficiency * motorEfficiency;
  }

  /**
   * Apply motor constraints to torque distribution
   */
  private applyMotorConstraints(
    distribution: TorqueDistribution,
    speedMs: number
  ): TorqueDistribution {
    const constrainedDistribution = { ...distribution };
    
    // Check and limit front motor torques
    const frontLeftConstraints = this.motorConstraints.get('frontLeft')!;
    const frontRightConstraints = this.motorConstraints.get('frontRight')!;
    
    constrainedDistribution.frontLeftMotor = this.applyIndividualMotorConstraints(
      distribution.frontLeftMotor,
      frontLeftConstraints,
      speedMs
    );
    
    constrainedDistribution.frontRightMotor = this.applyIndividualMotorConstraints(
      distribution.frontRightMotor,
      frontRightConstraints,
      speedMs
    );
    
    // Check rear motors if equipped
    if (this.vehicleParams.motorCount === 4 && distribution.rearLeftMotor && distribution.rearRightMotor) {
      const rearLeftConstraints = this.motorConstraints.get('rearLeft')!;
      const rearRightConstraints = this.motorConstraints.get('rearRight')!;
      
      constrainedDistribution.rearLeftMotor = this.applyIndividualMotorConstraints(
        distribution.rearLeftMotor,
        rearLeftConstraints,
        speedMs
      );
      
      constrainedDistribution.rearRightMotor = this.applyIndividualMotorConstraints(
        distribution.rearRightMotor,
        rearRightConstraints,
        speedMs
      );
    }
    
    // Recalculate mechanical braking force if motor torques were limited
    const actualRegenTorque = constrainedDistribution.frontLeftMotor + 
                             constrainedDistribution.frontRightMotor +
                             (constrainedDistribution.rearLeftMotor || 0) +
                             (constrainedDistribution.rearRightMotor || 0);
    
    const actualRegenForce = actualRegenTorque / this.vehicleParams.wheelRadius;
    const originalTotalForce = distribution.mechanicalBrakingForce + 
                              (distribution.frontLeftMotor + distribution.frontRightMotor +
                               (distribution.rearLeftMotor || 0) + (distribution.rearRightMotor || 0)) / 
                              this.vehicleParams.wheelRadius;
    
    constrainedDistribution.mechanicalBrakingForce = originalTotalForce - actualRegenForce;
    
    // Recalculate regenerated power
    constrainedDistribution.regeneratedPower = this.calculateRegeneratedPower(actualRegenForce, speedMs);
    
    return constrainedDistribution;
  }

  /**
   * Apply constraints to individual motor
   */
  private applyIndividualMotorConstraints(
    requestedTorque: number,
    constraints: MotorConstraints,
    speedMs: number
  ): number {
    let limitedTorque = requestedTorque;
    
    // Apply maximum torque limit
    limitedTorque = Math.min(limitedTorque, constraints.maxTorque);
    
    // Apply power limit
    const motorSpeedRpm = (speedMs / this.vehicleParams.wheelRadius) * 60 / (2 * Math.PI);
    const powerLimitedTorque = (constraints.maxPower * 60) / (2 * Math.PI * motorSpeedRpm);
    limitedTorque = Math.min(limitedTorque, powerLimitedTorque);
    
    // Apply thermal protection
    if (constraints.currentTemperature > constraints.thermalLimit * 0.9) {
      const thermalReduction = 1 - ((constraints.currentTemperature - constraints.thermalLimit * 0.9) / 
                                   (constraints.thermalLimit * 0.1));
      limitedTorque *= Math.max(0.1, thermalReduction);
    }
    
    return Math.max(0, limitedTorque);
  }

  /**
   * Update motor temperature for thermal management
   */
  public updateMotorTemperature(motorId: string, temperature: number): void {
    const constraints = this.motorConstraints.get(motorId);
    if (constraints) {
      constraints.currentTemperature = temperature;
    }
  }

  /**
   * Get current motor status
   */
  public getMotorStatus(motorId: string): MotorConstraints | null {
    return this.motorConstraints.get(motorId) || null;
  }

  /**
   * Calculate braking force distribution for optimal vehicle stability
   */
  public calculateStabilityOptimizedDistribution(
    brakingDemand: BrakingDemand,
    lateralAcceleration: number,
    yawRate: number
  ): TorqueDistribution {
    // Base distribution calculation
    const baseDistribution = this.calculateTorqueDistribution(brakingDemand, 0.7, 0.5);
    
    // Adjust for vehicle stability
    const stabilityAdjustment = this.calculateStabilityAdjustment(lateralAcceleration, yawRate);
    
    // Apply stability adjustments
    baseDistribution.frontLeftMotor *= stabilityAdjustment.frontLeft;
    baseDistribution.frontRightMotor *= stabilityAdjustment.frontRight;
    
    if (baseDistribution.rearLeftMotor && baseDistribution.rearRightMotor) {
      baseDistribution.rearLeftMotor *= stabilityAdjustment.rearLeft || 1.0;
      baseDistribution.rearRightMotor *= stabilityAdjustment.rearRight || 1.0;
    }
    
    return baseDistribution;
  }

  /**
   * Calculate stability adjustment factors
   */
  private calculateStabilityAdjustment(lateralAcceleration: number, yawRate: number): {
    frontLeft: number;
    frontRight: number;
    rearLeft?: number;
    rearRight?: number;
  } {
    // Simple stability control - reduce outer wheel braking during turns
    const baseAdjustment = 1.0;
    const maxAdjustment = 0.3; // Maximum 30% reduction
    
    // Calculate adjustment based on lateral acceleration
    const lateralFactor = Math.min(Math.abs(lateralAcceleration) / 5.0, 1.0); // Normalize to 5 m/s²
    const adjustment = maxAdjustment * lateralFactor;
    
    if (lateralAcceleration > 0) {
      // Right turn - reduce right side braking
      return {
        frontLeft: baseAdjustment,
        frontRight: baseAdjustment - adjustment,
        rearLeft: baseAdjustment,
        rearRight: baseAdjustment - adjustment
      };
    } else if (lateralAcceleration < 0) {
      // Left turn - reduce left side braking
      return {
        frontLeft: baseAdjustment - adjustment,
        frontRight: baseAdjustment,
        rearLeft: baseAdjustment - adjustment,
        rearRight: baseAdjustment
      };
    }
    
    return {
      frontLeft: baseAdjustment,
      frontRight: baseAdjustment,
      rearLeft: baseAdjustment,
      rearRight: baseAdjustment
    };
  }

  /**
   * Get system diagnostics
   */
  public getDiagnostics(): {
    vehicleParams: VehicleParameters;
    motorStatus: Map<string, MotorConstraints>;
    systemHealth: string;
  } {
    return {
      vehicleParams: this.vehicleParams,
      motorStatus: new Map(this.motorConstraints),
      systemHealth: 'Operational'
    };
  }
}