/**
 * Fuzzy Control Integration Module
 * 
 * This module integrates the fuzzy control strategy with the regenerative braking
 * torque model and provides a unified interface for the vehicle's braking system.
 * It handles real-time control, safety monitoring, and system coordination.
 */

import { 
  FuzzyRegenerativeBrakingController, 
  BrakingInputs, 
  BrakingOutputs 
} from './FuzzyRegenerativeBrakingController';
import { 
  RegenerativeBrakingTorqueModel, 
  VehicleParameters, 
  BrakingDemand, 
  TorqueDistribution 
} from './RegenerativeBrakingTorqueModel';
import { 
  PiezoelectricEnergyHarvester,
  PiezoelectricSystemConfiguration,
  PiezoelectricPerformanceMetrics
} from './PiezoelectricEnergyHarvester';

export interface SystemInputs {
  // Vehicle state
  vehicleSpeed: number;            // km/h
  brakePedalPosition: number;      // 0-1 (normalized)
  acceleratorPedalPosition: number; // 0-1 (normalized)
  steeringAngle: number;           // degrees
  
  // Vehicle dynamics
  lateralAcceleration: number;     // m/s²
  longitudinalAcceleration: number; // m/s²
  yawRate: number;                 // rad/s
  roadGradient: number;            // % grade
  
  // Battery and motor state
  batterySOC: number;              // 0-1
  batteryVoltage: number;          // V
  batteryCurrent: number;          // A
  batteryTemperature: number;      // °C
  motorTemperatures: {             // °C
    frontLeft: number;
    frontRight: number;
    rearLeft?: number;
    rearRight?: number;
  };
  
  // Environmental conditions
  ambientTemperature: number;      // °C
  roadSurface: 'dry' | 'wet' | 'snow' | 'ice';
  visibility: 'clear' | 'rain' | 'fog' | 'snow';
}

export interface SystemOutputs {
  // Motor commands
  motorTorques: {
    frontLeft: number;             // Nm
    frontRight: number;            // Nm
    rearLeft?: number;             // Nm
    rearRight?: number;            // Nm
  };
  
  // Braking system commands
  mechanicalBrakingForce: number;  // N
  regenerativeBrakingRatio: number; // 0-1
  
  // Energy recovery
  regeneratedPower: number;        // W
  energyRecoveryEfficiency: number; // 0-1
  
  // Piezoelectric energy harvesting
  piezoelectricPower: number;      // W
  piezoelectricEfficiency: number; // 0-1
  totalEnergyHarvested: number;    // W (regenerative + piezoelectric)
  
  // System status
  systemStatus: 'normal' | 'degraded' | 'fault';
  activeWarnings: string[];
  performanceMetrics: {
    totalBrakingForce: number;     // N
    brakingEfficiency: number;     // 0-1
    thermalStatus: 'normal' | 'warm' | 'hot';
    piezoelectricMetrics?: PiezoelectricPerformanceMetrics;
  };
}

export interface SafetyLimits {
  maxRegenerativeBrakingRatio: number;  // 0-1
  maxMotorTorque: number;               // Nm
  maxMotorTemperature: number;          // °C
  maxBatteryChargeCurrent: number;      // A
  minMechanicalBrakingRatio: number;    // 0-1 (for emergency situations)
}

/**
 * Fuzzy Control Integration System
 * 
 * Coordinates fuzzy control strategy with torque model and vehicle systems
 */
export class FuzzyControlIntegration {
  private fuzzyController: FuzzyRegenerativeBrakingController;
  private torqueModel: RegenerativeBrakingTorqueModel;
  private piezoelectricHarvester?: PiezoelectricEnergyHarvester;
  private safetyLimits: SafetyLimits;
  private lastUpdateTime: number;
  private systemFaults: Set<string>;
  private performanceHistory: Array<{ timestamp: number; efficiency: number; piezoelectricPower: number }>;

  constructor(
    vehicleParams: VehicleParameters, 
    safetyLimits?: Partial<SafetyLimits>,
    piezoelectricConfig?: PiezoelectricSystemConfiguration
  ) {
    this.fuzzyController = new FuzzyRegenerativeBrakingController();
    this.torqueModel = new RegenerativeBrakingTorqueModel(vehicleParams);
    
    // Initialize piezoelectric energy harvester if configuration provided
    if (piezoelectricConfig) {
      this.piezoelectricHarvester = new PiezoelectricEnergyHarvester(piezoelectricConfig);
    }
    
    this.safetyLimits = {
      maxRegenerativeBrakingRatio: 0.8,
      maxMotorTorque: 800,
      maxMotorTemperature: 150,
      maxBatteryChargeCurrent: 200,
      minMechanicalBrakingRatio: 0.2,
      ...safetyLimits
    };
    this.lastUpdateTime = Date.now();
    this.systemFaults = new Set();
    this.performanceHistory = [];
  }

  /**
   * Main control loop - processes inputs and generates control outputs
   */
  public processControlCycle(inputs: SystemInputs): SystemOutputs {
    try {
      // Update system timing
      const currentTime = Date.now();
      const deltaTime = currentTime - this.lastUpdateTime;
      this.lastUpdateTime = currentTime;

      // Validate inputs
      this.validateInputs(inputs);

      // Update motor temperatures in torque model
      this.updateMotorTemperatures(inputs.motorTemperatures);

      // Calculate braking demand
      const brakingDemand = this.calculateBrakingDemand(inputs);

      // Prepare fuzzy controller inputs
      const fuzzyInputs: BrakingInputs = {
        drivingSpeed: inputs.vehicleSpeed,
        brakingIntensity: inputs.brakePedalPosition,
        batterySOC: inputs.batterySOC,
        motorTemperature: Math.max(
          inputs.motorTemperatures.frontLeft,
          inputs.motorTemperatures.frontRight,
          inputs.motorTemperatures.rearLeft || 0,
          inputs.motorTemperatures.rearRight || 0
        )
      };

      // Calculate optimal braking parameters using fuzzy control
      const fuzzyOutputs = this.fuzzyController.calculateOptimalBraking(fuzzyInputs);

      // Apply environmental and safety adjustments
      const adjustedRatio = this.applyEnvironmentalAdjustments(
        fuzzyOutputs.regenerativeBrakingRatio,
        inputs
      );

      // Calculate torque distribution
      const torqueDistribution = this.calculateTorqueDistribution(
        brakingDemand,
        adjustedRatio,
        inputs
      );

      // Apply safety constraints
      const safeOutputs = this.applySafetyConstraints(torqueDistribution, inputs);

      // Calculate piezoelectric energy harvesting
      let piezoelectricResults = { 
        piezoelectricPower: 0, 
        piezoelectricEfficiency: 0, 
        harvestingMetrics: undefined as PiezoelectricPerformanceMetrics | undefined 
      };
      
      if (this.piezoelectricHarvester) {
        const piezoResults = this.piezoelectricHarvester.update(inputs);
        piezoelectricResults = {
          piezoelectricPower: piezoResults.piezoelectricPower,
          piezoelectricEfficiency: piezoResults.piezoelectricEfficiency,
          harvestingMetrics: piezoResults.harvestingMetrics
        };
      }

      // Update performance metrics
      this.updatePerformanceMetrics(safeOutputs, inputs, piezoelectricResults.piezoelectricPower);

      // Generate system outputs
      return this.generateSystemOutputs(safeOutputs, inputs, piezoelectricResults);

    } catch (error) {
      console.error('Control cycle error:', error);
      return this.generateFailsafeOutputs(inputs);
    }
  }

  /**
   * Validate system inputs
   */
  private validateInputs(inputs: SystemInputs): void {
    const validationErrors: string[] = [];

    if (inputs.vehicleSpeed < 0 || inputs.vehicleSpeed > 300) {
      validationErrors.push('Invalid vehicle speed');
    }
    if (inputs.brakePedalPosition < 0 || inputs.brakePedalPosition > 1) {
      validationErrors.push('Invalid brake pedal position');
    }
    if (inputs.batterySOC < 0 || inputs.batterySOC > 1) {
      validationErrors.push('Invalid battery SOC');
    }

    if (validationErrors.length > 0) {
      this.systemFaults.add('input_validation');
      throw new Error(`Input validation failed: ${validationErrors.join(', ')}`);
    }

    this.systemFaults.delete('input_validation');
  }

  /**
   * Update motor temperatures in the torque model
   */
  private updateMotorTemperatures(temperatures: SystemInputs['motorTemperatures']): void {
    this.torqueModel.updateMotorTemperature('frontLeft', temperatures.frontLeft);
    this.torqueModel.updateMotorTemperature('frontRight', temperatures.frontRight);
    
    if (temperatures.rearLeft !== undefined) {
      this.torqueModel.updateMotorTemperature('rearLeft', temperatures.rearLeft);
    }
    if (temperatures.rearRight !== undefined) {
      this.torqueModel.updateMotorTemperature('rearRight', temperatures.rearRight);
    }
  }

  /**
   * Calculate total braking demand based on driver input and vehicle state
   */
  private calculateBrakingDemand(inputs: SystemInputs): BrakingDemand {
    // Base braking force calculation
    const maxBrakingForce = 15000; // N - maximum vehicle braking capability
    const baseBrakingForce = inputs.brakePedalPosition * maxBrakingForce;

    // Adjust for road gradient
    const gradientAdjustment = Math.sin(inputs.roadGradient * Math.PI / 180) * 9.81 * 1500; // Assume 1500kg vehicle
    const adjustedBrakingForce = Math.max(0, baseBrakingForce + gradientAdjustment);

    return {
      totalBrakingForce: adjustedBrakingForce,
      brakingIntensity: inputs.brakePedalPosition,
      vehicleSpeed: inputs.vehicleSpeed,
      roadGradient: inputs.roadGradient
    };
  }

  /**
   * Apply environmental adjustments to regenerative braking ratio
   */
  private applyEnvironmentalAdjustments(
    baseRatio: number,
    inputs: SystemInputs
  ): number {
    let adjustedRatio = baseRatio;

    // Reduce regenerative braking on slippery surfaces
    switch (inputs.roadSurface) {
      case 'wet':
        adjustedRatio *= 0.9;
        break;
      case 'snow':
        adjustedRatio *= 0.7;
        break;
      case 'ice':
        adjustedRatio *= 0.5;
        break;
      default:
        // No adjustment for dry surface
        break;
    }

    // Reduce regenerative braking in poor visibility
    if (inputs.visibility !== 'clear') {
      adjustedRatio *= 0.95;
    }

    // Temperature-based adjustments
    if (inputs.ambientTemperature < -10) {
      adjustedRatio *= 0.9; // Reduced efficiency in extreme cold
    } else if (inputs.ambientTemperature > 40) {
      adjustedRatio *= 0.95; // Thermal protection in extreme heat
    }

    return Math.max(0, Math.min(1, adjustedRatio));
  }

  /**
   * Calculate torque distribution considering vehicle dynamics
   */
  private calculateTorqueDistribution(
    brakingDemand: BrakingDemand,
    regenerativeBrakingRatio: number,
    inputs: SystemInputs
  ): TorqueDistribution {
    // Check if vehicle stability control is needed
    const needsStabilityControl = Math.abs(inputs.lateralAcceleration) > 2.0 || 
                                 Math.abs(inputs.yawRate) > 0.5;

    if (needsStabilityControl) {
      return this.torqueModel.calculateStabilityOptimizedDistribution(
        brakingDemand,
        inputs.lateralAcceleration,
        inputs.yawRate
      );
    } else {
      return this.torqueModel.calculateTorqueDistribution(
        brakingDemand,
        regenerativeBrakingRatio,
        inputs.batterySOC
      );
    }
  }

  /**
   * Apply safety constraints to torque distribution
   */
  private applySafetyConstraints(
    distribution: TorqueDistribution,
    inputs: SystemInputs
  ): TorqueDistribution {
    const constrainedDistribution = { ...distribution };

    // Limit maximum motor torques
    constrainedDistribution.frontLeftMotor = Math.min(
      constrainedDistribution.frontLeftMotor,
      this.safetyLimits.maxMotorTorque
    );
    constrainedDistribution.frontRightMotor = Math.min(
      constrainedDistribution.frontRightMotor,
      this.safetyLimits.maxMotorTorque
    );

    if (constrainedDistribution.rearLeftMotor !== undefined) {
      constrainedDistribution.rearLeftMotor = Math.min(
        constrainedDistribution.rearLeftMotor,
        this.safetyLimits.maxMotorTorque
      );
    }
    if (constrainedDistribution.rearRightMotor !== undefined) {
      constrainedDistribution.rearRightMotor = Math.min(
        constrainedDistribution.rearRightMotor,
        this.safetyLimits.maxMotorTorque
      );
    }

    // Ensure minimum mechanical braking in emergency situations
    if (inputs.brakePedalPosition > 0.9) {
      const totalBrakingForce = constrainedDistribution.mechanicalBrakingForce +
        (constrainedDistribution.frontLeftMotor + constrainedDistribution.frontRightMotor +
         (constrainedDistribution.rearLeftMotor || 0) + (constrainedDistribution.rearRightMotor || 0)) / 0.35;
      
      const minMechanicalForce = totalBrakingForce * this.safetyLimits.minMechanicalBrakingRatio;
      
      if (constrainedDistribution.mechanicalBrakingForce < minMechanicalForce) {
        const reductionFactor = (totalBrakingForce - minMechanicalForce) / 
          (totalBrakingForce - constrainedDistribution.mechanicalBrakingForce);
        
        constrainedDistribution.frontLeftMotor *= reductionFactor;
        constrainedDistribution.frontRightMotor *= reductionFactor;
        if (constrainedDistribution.rearLeftMotor !== undefined) {
          constrainedDistribution.rearLeftMotor *= reductionFactor;
        }
        if (constrainedDistribution.rearRightMotor !== undefined) {
          constrainedDistribution.rearRightMotor *= reductionFactor;
        }
        constrainedDistribution.mechanicalBrakingForce = minMechanicalForce;
      }
    }

    return constrainedDistribution;
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(
    distribution: TorqueDistribution,
    inputs: SystemInputs,
    piezoelectricPower: number = 0
  ): void {
    const currentTime = Date.now();
    
    // Add current efficiency to history
    this.performanceHistory.push({
      timestamp: currentTime,
      efficiency: distribution.energyRecoveryEfficiency,
      piezoelectricPower
    });

    // Keep only last 100 entries
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }
  }

  /**
   * Generate system outputs
   */
  private generateSystemOutputs(
    distribution: TorqueDistribution,
    inputs: SystemInputs,
    piezoelectricResults?: { 
      piezoelectricPower: number; 
      piezoelectricEfficiency: number; 
      harvestingMetrics?: PiezoelectricPerformanceMetrics 
    }
  ): SystemOutputs {
    // Determine system status
    let systemStatus: 'normal' | 'degraded' | 'fault' = 'normal';
    const activeWarnings: string[] = [];

    // Check for system faults
    if (this.systemFaults.size > 0) {
      systemStatus = 'fault';
      activeWarnings.push(...Array.from(this.systemFaults));
    }

    // Check for degraded performance conditions
    const maxMotorTemp = Math.max(
      inputs.motorTemperatures.frontLeft,
      inputs.motorTemperatures.frontRight,
      inputs.motorTemperatures.rearLeft || 0,
      inputs.motorTemperatures.rearRight || 0
    );

    if (maxMotorTemp > this.safetyLimits.maxMotorTemperature * 0.9) {
      systemStatus = systemStatus === 'fault' ? 'fault' : 'degraded';
      activeWarnings.push('High motor temperature');
    }

    if (inputs.batterySOC > 0.95) {
      activeWarnings.push('Battery nearly full - reduced regeneration');
    }

    // Calculate total braking force
    const totalBrakingForce = distribution.mechanicalBrakingForce +
      (distribution.frontLeftMotor + distribution.frontRightMotor +
       (distribution.rearLeftMotor || 0) + (distribution.rearRightMotor || 0)) / 0.35;

    // Calculate braking efficiency
    const brakingEfficiency = distribution.energyRecoveryEfficiency;

    // Determine thermal status
    let thermalStatus: 'normal' | 'warm' | 'hot' = 'normal';
    if (maxMotorTemp > 100) {
      thermalStatus = 'warm';
    }
    if (maxMotorTemp > 130) {
      thermalStatus = 'hot';
    }

    // Calculate total energy harvested
    const piezoelectricPower = piezoelectricResults?.piezoelectricPower || 0;
    const totalEnergyHarvested = distribution.regeneratedPower + piezoelectricPower;

    return {
      motorTorques: {
        frontLeft: distribution.frontLeftMotor,
        frontRight: distribution.frontRightMotor,
        rearLeft: distribution.rearLeftMotor,
        rearRight: distribution.rearRightMotor
      },
      mechanicalBrakingForce: distribution.mechanicalBrakingForce,
      regenerativeBrakingRatio: distribution.energyRecoveryEfficiency > 0 ? 
        (distribution.regeneratedPower / (distribution.regeneratedPower + distribution.mechanicalBrakingForce * inputs.vehicleSpeed / 3.6)) : 0,
      regeneratedPower: distribution.regeneratedPower,
      energyRecoveryEfficiency: distribution.energyRecoveryEfficiency,
      piezoelectricPower,
      piezoelectricEfficiency: piezoelectricResults?.piezoelectricEfficiency || 0,
      totalEnergyHarvested,
      systemStatus,
      activeWarnings,
      performanceMetrics: {
        totalBrakingForce,
        brakingEfficiency,
        thermalStatus,
        piezoelectricMetrics: piezoelectricResults?.harvestingMetrics
      }
    };
  }

  /**
   * Generate failsafe outputs in case of system error
   */
  private generateFailsafeOutputs(inputs: SystemInputs): SystemOutputs {
    return {
      motorTorques: {
        frontLeft: 0,
        frontRight: 0,
        rearLeft: 0,
        rearRight: 0
      },
      mechanicalBrakingForce: inputs.brakePedalPosition * 15000, // Full mechanical braking
      regenerativeBrakingRatio: 0,
      regeneratedPower: 0,
      energyRecoveryEfficiency: 0,
      piezoelectricPower: 0,
      piezoelectricEfficiency: 0,
      totalEnergyHarvested: 0,
      systemStatus: 'fault',
      activeWarnings: ['System fault - failsafe mode active'],
      performanceMetrics: {
        totalBrakingForce: inputs.brakePedalPosition * 15000,
        brakingEfficiency: 0,
        thermalStatus: 'normal'
      }
    };
  }

  /**
   * Get system diagnostics
   */
  public getSystemDiagnostics(): {
    fuzzyControllerStatus: any;
    torqueModelStatus: any;
    piezoelectricStatus?: any;
    systemFaults: string[];
    performanceHistory: Array<{ timestamp: number; efficiency: number; piezoelectricPower: number }>;
    averageEfficiency: number;
    averagePiezoelectricPower: number;
  } {
    const averageEfficiency = this.performanceHistory.length > 0 ?
      this.performanceHistory.reduce((sum, entry) => sum + entry.efficiency, 0) / this.performanceHistory.length : 0;
    
    const averagePiezoelectricPower = this.performanceHistory.length > 0 ?
      this.performanceHistory.reduce((sum, entry) => sum + entry.piezoelectricPower, 0) / this.performanceHistory.length : 0;

    return {
      fuzzyControllerStatus: this.fuzzyController.getSystemStatus(),
      torqueModelStatus: this.torqueModel.getDiagnostics(),
      piezoelectricStatus: this.piezoelectricHarvester?.getSystemStatus(),
      systemFaults: Array.from(this.systemFaults),
      performanceHistory: [...this.performanceHistory],
      averageEfficiency,
      averagePiezoelectricPower
    };
  }

  /**
   * Update safety limits
   */
  public updateSafetyLimits(newLimits: Partial<SafetyLimits>): void {
    this.safetyLimits = { ...this.safetyLimits, ...newLimits };
  }

  /**
   * Reset system faults (for maintenance/calibration)
   */
  public resetSystemFaults(): void {
    this.systemFaults.clear();
  }
}