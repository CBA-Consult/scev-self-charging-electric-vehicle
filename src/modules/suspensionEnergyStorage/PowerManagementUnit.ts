/**
 * Power Management Unit
 * 
 * Manages power flow between energy harvesting sources, storage components,
 * and loads. Implements advanced algorithms for power spike mitigation,
 * energy balancing, and efficiency optimization.
 */

import {
  SuspensionEnergyInputs,
  CapacitorBankConfig,
  BatteryPackConfig,
  PowerManagementConfig,
  OperatingMode,
  PowerFlowDirection
} from './types';

export interface PowerFlowCommand {
  /** Target power for capacitor charging (W) */
  capacitorChargePower: number;
  /** Target power for capacitor discharging (W) */
  capacitorDischargePower: number;
  /** Target power for battery charging (W) */
  batteryChargePower: number;
  /** Target power for battery discharging (W) */
  batteryDischargePower: number;
  /** Command timestamp */
  timestamp: number;
  /** Command priority */
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PowerQualityMetrics {
  /** Input power variation coefficient */
  powerVariationCoefficient: number;
  /** Power spike frequency (spikes/minute) */
  spikeFrequency: number;
  /** Average spike magnitude (W) */
  averageSpikeMagnitude: number;
  /** Power smoothing effectiveness (0-1) */
  smoothingEffectiveness: number;
  /** Harmonic distortion factor */
  harmonicDistortion: number;
}

export class PowerManagementUnit {
  private capacitorConfig: CapacitorBankConfig;
  private batteryConfig: BatteryPackConfig;
  private powerConfig: PowerManagementConfig;
  
  // Power analysis
  private powerHistory: number[] = [];
  private spikeHistory: Array<{ timestamp: number; magnitude: number }> = [];
  private powerQualityMetrics: PowerQualityMetrics;
  
  // Control algorithms
  private pidController: PIDController;
  private powerPredictor: PowerPredictor;
  private loadBalancer: LoadBalancer;
  
  constructor(
    capacitorConfig: CapacitorBankConfig,
    batteryConfig: BatteryPackConfig,
    powerConfig: PowerManagementConfig
  ) {
    this.capacitorConfig = capacitorConfig;
    this.batteryConfig = batteryConfig;
    this.powerConfig = powerConfig;
    
    this.initializePowerQualityMetrics();
    this.initializeControlAlgorithms();
  }

  /**
   * Calculate optimal power flow commands
   */
  public calculatePowerFlow(
    inputs: SuspensionEnergyInputs,
    capacitorSOC: number,
    batterySOC: number,
    operatingMode: OperatingMode
  ): PowerFlowCommand {
    
    // Analyze input power characteristics
    this.analyzePowerQuality(inputs.inputPower);
    
    // Predict future power requirements
    const powerPrediction = this.powerPredictor.predictPower(inputs);
    
    // Calculate base power distribution
    const basePowerFlow = this.calculateBasePowerDistribution(
      inputs, capacitorSOC, batterySOC, operatingMode
    );
    
    // Apply power spike mitigation
    const mitigatedPowerFlow = this.applySpikeMitigation(basePowerFlow, inputs.inputPower);
    
    // Optimize for efficiency
    const optimizedPowerFlow = this.optimizeForEfficiency(
      mitigatedPowerFlow, capacitorSOC, batterySOC
    );
    
    // Apply safety constraints
    const constrainedPowerFlow = this.applySafetyConstraints(optimizedPowerFlow);
    
    return {
      ...constrainedPowerFlow,
      timestamp: Date.now(),
      priority: this.determinePriority(inputs, operatingMode)
    };
  }

  /**
   * Initialize power quality metrics
   */
  private initializePowerQualityMetrics(): void {
    this.powerQualityMetrics = {
      powerVariationCoefficient: 0,
      spikeFrequency: 0,
      averageSpikeMagnitude: 0,
      smoothingEffectiveness: 0.95,
      harmonicDistortion: 0.05
    };
  }

  /**
   * Initialize control algorithms
   */
  private initializeControlAlgorithms(): void {
    this.pidController = new PIDController(1.0, 0.1, 0.05); // Kp, Ki, Kd
    this.powerPredictor = new PowerPredictor();
    this.loadBalancer = new LoadBalancer(this.capacitorConfig, this.batteryConfig);
  }

  /**
   * Analyze power quality and detect spikes
   */
  private analyzePowerQuality(inputPower: number): void {
    // Add to power history
    this.powerHistory.push(inputPower);
    
    // Maintain history size (last 100 samples)
    if (this.powerHistory.length > 100) {
      this.powerHistory.shift();
    }
    
    if (this.powerHistory.length < 10) return; // Need minimum samples
    
    // Calculate power variation coefficient
    const mean = this.powerHistory.reduce((sum, p) => sum + p, 0) / this.powerHistory.length;
    const variance = this.powerHistory.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / this.powerHistory.length;
    const stdDev = Math.sqrt(variance);
    this.powerQualityMetrics.powerVariationCoefficient = mean > 0 ? stdDev / mean : 0;
    
    // Detect power spikes
    const spikeThreshold = mean + 2 * stdDev; // 2-sigma threshold
    if (inputPower > spikeThreshold && inputPower > mean * 1.5) {
      this.spikeHistory.push({
        timestamp: Date.now(),
        magnitude: inputPower - mean
      });
      
      // Clean old spike history (last 60 seconds)
      const cutoffTime = Date.now() - 60000;
      this.spikeHistory = this.spikeHistory.filter(spike => spike.timestamp > cutoffTime);
      
      // Update spike metrics
      this.powerQualityMetrics.spikeFrequency = this.spikeHistory.length; // spikes per minute
      this.powerQualityMetrics.averageSpikeMagnitude = 
        this.spikeHistory.reduce((sum, spike) => sum + spike.magnitude, 0) / this.spikeHistory.length;
    }
  }

  /**
   * Calculate base power distribution
   */
  private calculateBasePowerDistribution(
    inputs: SuspensionEnergyInputs,
    capacitorSOC: number,
    batterySOC: number,
    operatingMode: OperatingMode
  ): Omit<PowerFlowCommand, 'timestamp' | 'priority'> {
    
    let capacitorChargePower = 0;
    let capacitorDischargePower = 0;
    let batteryChargePower = 0;
    let batteryDischargePower = 0;

    switch (operatingMode) {
      case 'charging':
        // Prioritize capacitor charging for fast response
        if (capacitorSOC < 0.9) {
          capacitorChargePower = Math.min(
            inputs.inputPower,
            this.calculateMaxCapacitorChargePower(capacitorSOC)
          );
        } else if (batterySOC < this.batteryConfig.socLimits[1]) {
          // Overflow to battery when capacitors are full
          batteryChargePower = Math.min(
            inputs.inputPower,
            this.calculateMaxBatteryChargePower(batterySOC)
          );
        }
        break;

      case 'discharging':
        // Prioritize capacitor discharge for high power demands
        if (inputs.loadDemand > 0) {
          if (capacitorSOC > 0.2 && inputs.loadDemand > 100) {
            // Use capacitors for high power demands
            capacitorDischargePower = Math.min(
              inputs.loadDemand,
              this.calculateMaxCapacitorDischargePower(capacitorSOC)
            );
          } else if (batterySOC > this.batteryConfig.socLimits[0]) {
            // Use battery for steady loads
            batteryDischargePower = Math.min(
              inputs.loadDemand,
              this.calculateMaxBatteryDischargePower(batterySOC)
            );
          }
        }
        break;

      case 'balancing':
        // Transfer energy from capacitors to battery
        if (capacitorSOC > 0.6 && batterySOC < 0.8) {
          const transferPower = Math.min(
            this.powerConfig.maxPowerTransferRate,
            this.calculateMaxCapacitorDischargePower(capacitorSOC),
            this.calculateMaxBatteryChargePower(batterySOC)
          );
          capacitorDischargePower = transferPower;
          batteryChargePower = transferPower * 0.92; // 92% transfer efficiency
        }
        break;

      case 'standby':
        // Minimal power for maintenance
        break;

      case 'protection':
        // No power transfer in protection mode
        break;
    }

    return {
      capacitorChargePower,
      capacitorDischargePower,
      batteryChargePower,
      batteryDischargePower
    };
  }

  /**
   * Apply power spike mitigation
   */
  private applySpikeMitigation(
    basePowerFlow: Omit<PowerFlowCommand, 'timestamp' | 'priority'>,
    inputPower: number
  ): Omit<PowerFlowCommand, 'timestamp' | 'priority'> {
    
    const powerFlow = { ...basePowerFlow };
    
    // Detect if current input is a spike
    const recentAverage = this.powerHistory.slice(-10).reduce((sum, p) => sum + p, 0) / 10;
    const isSpike = inputPower > recentAverage * 2 && inputPower > 200; // Spike threshold
    
    if (isSpike) {
      // Redirect spike energy to capacitors for fast absorption
      const spikeEnergy = inputPower - recentAverage;
      const additionalCapacitorCharge = Math.min(
        spikeEnergy,
        this.calculateMaxCapacitorChargePower(0.5) - powerFlow.capacitorChargePower
      );
      
      powerFlow.capacitorChargePower += additionalCapacitorCharge;
      
      // Update smoothing effectiveness
      this.powerQualityMetrics.smoothingEffectiveness = 
        Math.min(0.98, this.powerQualityMetrics.smoothingEffectiveness + 0.01);
    }
    
    return powerFlow;
  }

  /**
   * Optimize power flow for efficiency
   */
  private optimizeForEfficiency(
    powerFlow: Omit<PowerFlowCommand, 'timestamp' | 'priority'>,
    capacitorSOC: number,
    batterySOC: number
  ): Omit<PowerFlowCommand, 'timestamp' | 'priority'> {
    
    const optimizedFlow = { ...powerFlow };
    
    // Optimize capacitor usage based on SOC
    if (capacitorSOC > 0.8) {
      // Reduce capacitor charging when nearly full
      optimizedFlow.capacitorChargePower *= 0.5;
      // Increase battery charging
      optimizedFlow.batteryChargePower = Math.min(
        optimizedFlow.batteryChargePower + optimizedFlow.capacitorChargePower * 0.5,
        this.calculateMaxBatteryChargePower(batterySOC)
      );
    }
    
    // Optimize battery usage based on SOC
    if (batterySOC < 0.2) {
      // Reduce battery discharge when low
      optimizedFlow.batteryDischargePower *= 0.7;
      // Increase capacitor discharge if available
      if (capacitorSOC > 0.3) {
        optimizedFlow.capacitorDischargePower = Math.min(
          optimizedFlow.capacitorDischargePower + optimizedFlow.batteryDischargePower * 0.3,
          this.calculateMaxCapacitorDischargePower(capacitorSOC)
        );
      }
    }
    
    return optimizedFlow;
  }

  /**
   * Apply safety constraints to power flow
   */
  private applySafetyConstraints(
    powerFlow: Omit<PowerFlowCommand, 'timestamp' | 'priority'>
  ): Omit<PowerFlowCommand, 'timestamp' | 'priority'> {
    
    const constrainedFlow = { ...powerFlow };
    
    // Limit capacitor power
    constrainedFlow.capacitorChargePower = Math.min(
      constrainedFlow.capacitorChargePower,
      this.capacitorConfig.maxCurrent * this.capacitorConfig.maxVoltage
    );
    constrainedFlow.capacitorDischargePower = Math.min(
      constrainedFlow.capacitorDischargePower,
      this.capacitorConfig.maxCurrent * this.capacitorConfig.maxVoltage
    );
    
    // Limit battery power
    constrainedFlow.batteryChargePower = Math.min(
      constrainedFlow.batteryChargePower,
      this.batteryConfig.maxChargeCurrent * this.batteryConfig.nominalVoltage
    );
    constrainedFlow.batteryDischargePower = Math.min(
      constrainedFlow.batteryDischargePower,
      this.batteryConfig.maxDischargeCurrent * this.batteryConfig.nominalVoltage
    );
    
    // Ensure non-negative values
    constrainedFlow.capacitorChargePower = Math.max(0, constrainedFlow.capacitorChargePower);
    constrainedFlow.capacitorDischargePower = Math.max(0, constrainedFlow.capacitorDischargePower);
    constrainedFlow.batteryChargePower = Math.max(0, constrainedFlow.batteryChargePower);
    constrainedFlow.batteryDischargePower = Math.max(0, constrainedFlow.batteryDischargePower);
    
    return constrainedFlow;
  }

  /**
   * Calculate maximum capacitor charge power
   */
  private calculateMaxCapacitorChargePower(soc: number): number {
    const maxPower = this.capacitorConfig.maxCurrent * this.capacitorConfig.maxVoltage;
    const socFactor = Math.max(0, (0.95 - soc) / 0.95);
    return maxPower * socFactor;
  }

  /**
   * Calculate maximum capacitor discharge power
   */
  private calculateMaxCapacitorDischargePower(soc: number): number {
    const maxPower = this.capacitorConfig.maxCurrent * this.capacitorConfig.maxVoltage;
    const socFactor = Math.max(0, (soc - 0.1) / 0.9);
    return maxPower * socFactor;
  }

  /**
   * Calculate maximum battery charge power
   */
  private calculateMaxBatteryChargePower(soc: number): number {
    const maxPower = this.batteryConfig.maxChargeCurrent * this.batteryConfig.nominalVoltage;
    const socFactor = Math.max(0, (this.batteryConfig.socLimits[1] - soc) / 
                              (this.batteryConfig.socLimits[1] - this.batteryConfig.socLimits[0]));
    return maxPower * socFactor;
  }

  /**
   * Calculate maximum battery discharge power
   */
  private calculateMaxBatteryDischargePower(soc: number): number {
    const maxPower = this.batteryConfig.maxDischargeCurrent * this.batteryConfig.nominalVoltage;
    const socFactor = Math.max(0, (soc - this.batteryConfig.socLimits[0]) / 
                              (this.batteryConfig.socLimits[1] - this.batteryConfig.socLimits[0]));
    return maxPower * socFactor;
  }

  /**
   * Determine command priority
   */
  private determinePriority(inputs: SuspensionEnergyInputs, operatingMode: OperatingMode): 'low' | 'medium' | 'high' | 'critical' {
    if (operatingMode === 'protection') return 'critical';
    if (inputs.inputPower > 1000) return 'high'; // High power spike
    if (inputs.loadDemand > 500) return 'high'; // High load demand
    if (operatingMode === 'balancing') return 'medium';
    return 'low';
  }

  /**
   * Get power quality metrics
   */
  public getPowerQualityMetrics(): PowerQualityMetrics {
    return { ...this.powerQualityMetrics };
  }

  /**
   * Update configuration
   */
  public updateConfiguration(
    capacitorConfig?: Partial<CapacitorBankConfig>,
    batteryConfig?: Partial<BatteryPackConfig>,
    powerConfig?: Partial<PowerManagementConfig>
  ): void {
    if (capacitorConfig) {
      this.capacitorConfig = { ...this.capacitorConfig, ...capacitorConfig };
    }
    if (batteryConfig) {
      this.batteryConfig = { ...this.batteryConfig, ...batteryConfig };
    }
    if (powerConfig) {
      this.powerConfig = { ...this.powerConfig, ...powerConfig };
    }
  }

  /**
   * Reset power analysis data
   */
  public resetAnalysis(): void {
    this.powerHistory = [];
    this.spikeHistory = [];
    this.initializePowerQualityMetrics();
  }
}

/**
 * PID Controller for power regulation
 */
class PIDController {
  private kp: number;
  private ki: number;
  private kd: number;
  private previousError: number = 0;
  private integral: number = 0;

  constructor(kp: number, ki: number, kd: number) {
    this.kp = kp;
    this.ki = ki;
    this.kd = kd;
  }

  public calculate(setpoint: number, processVariable: number, dt: number): number {
    const error = setpoint - processVariable;
    
    this.integral += error * dt;
    const derivative = (error - this.previousError) / dt;
    
    const output = this.kp * error + this.ki * this.integral + this.kd * derivative;
    
    this.previousError = error;
    
    return output;
  }

  public reset(): void {
    this.previousError = 0;
    this.integral = 0;
  }
}

/**
 * Power Predictor for anticipating power requirements
 */
class PowerPredictor {
  private powerHistory: Array<{ timestamp: number; power: number; velocity: number }> = [];

  public predictPower(inputs: SuspensionEnergyInputs): number {
    // Add current data point
    this.powerHistory.push({
      timestamp: Date.now(),
      power: inputs.inputPower,
      velocity: inputs.suspensionVelocity
    });

    // Keep only recent history (last 30 seconds)
    const cutoffTime = Date.now() - 30000;
    this.powerHistory = this.powerHistory.filter(entry => entry.timestamp > cutoffTime);

    if (this.powerHistory.length < 5) {
      return inputs.inputPower; // Not enough data for prediction
    }

    // Simple linear regression based on velocity
    const velocityPowerCorrelation = this.calculateCorrelation();
    const predictedPower = inputs.inputPower + velocityPowerCorrelation * inputs.suspensionVelocity;

    return Math.max(0, predictedPower);
  }

  private calculateCorrelation(): number {
    const n = this.powerHistory.length;
    const sumVelocity = this.powerHistory.reduce((sum, entry) => sum + entry.velocity, 0);
    const sumPower = this.powerHistory.reduce((sum, entry) => sum + entry.power, 0);
    const sumVelocityPower = this.powerHistory.reduce((sum, entry) => sum + entry.velocity * entry.power, 0);
    const sumVelocitySquared = this.powerHistory.reduce((sum, entry) => sum + entry.velocity * entry.velocity, 0);

    const numerator = n * sumVelocityPower - sumVelocity * sumPower;
    const denominator = n * sumVelocitySquared - sumVelocity * sumVelocity;

    return denominator !== 0 ? numerator / denominator : 0;
  }
}

/**
 * Load Balancer for optimal energy distribution
 */
class LoadBalancer {
  private capacitorConfig: CapacitorBankConfig;
  private batteryConfig: BatteryPackConfig;

  constructor(capacitorConfig: CapacitorBankConfig, batteryConfig: BatteryPackConfig) {
    this.capacitorConfig = capacitorConfig;
    this.batteryConfig = batteryConfig;
  }

  public calculateOptimalDistribution(
    totalPower: number,
    capacitorSOC: number,
    batterySOC: number
  ): { capacitorPower: number; batteryPower: number } {
    
    // Calculate available capacity for each storage type
    const capacitorAvailableCapacity = (0.9 - capacitorSOC) * this.capacitorConfig.totalCapacitance;
    const batteryAvailableCapacity = (this.batteryConfig.socLimits[1] - batterySOC) * this.batteryConfig.totalCapacity;
    
    // Calculate power distribution based on capacity and efficiency
    const totalAvailableCapacity = capacitorAvailableCapacity + batteryAvailableCapacity;
    
    if (totalAvailableCapacity === 0) {
      return { capacitorPower: 0, batteryPower: 0 };
    }
    
    const capacitorRatio = capacitorAvailableCapacity / totalAvailableCapacity;
    const batteryRatio = batteryAvailableCapacity / totalAvailableCapacity;
    
    // Adjust for power characteristics (capacitors better for high power)
    const powerAdjustment = totalPower > 500 ? 0.7 : 0.3; // Favor capacitors for high power
    
    const capacitorPower = totalPower * (capacitorRatio * powerAdjustment + (1 - powerAdjustment) * 0.5);
    const batteryPower = totalPower - capacitorPower;
    
    return {
      capacitorPower: Math.max(0, capacitorPower),
      batteryPower: Math.max(0, batteryPower)
    };
  }
}