/**
 * Suspension Energy Storage System
 * 
 * Main controller for the suspension energy storage system that manages
 * energy flow between supercapacitors and battery pack to efficiently
 * store harvested energy from vehicle suspension systems.
 */

import {
  SuspensionEnergyInputs,
  EnergyStorageOutputs,
  EnergyStorageSystemConfig,
  StorageSystemStatus,
  OperatingMode,
  PowerFlowDirection,
  EnergyFlowMetrics,
  PerformanceMetrics,
  SafetyLimits,
  DiagnosticData,
  ComponentHealth,
  FaultRecord
} from './types';

export class SuspensionEnergyStorageSystem {
  private config: EnergyStorageSystemConfig;
  private systemStatus: StorageSystemStatus;
  private safetyLimits: SafetyLimits;
  
  // Energy storage states
  private capacitorSOC: number = 0.5;
  private batterySOC: number = 0.5;
  private systemTemperature: number = 25;
  
  // Performance tracking
  private energyFlowMetrics: EnergyFlowMetrics;
  private performanceHistory: Array<{
    timestamp: number;
    power: number;
    efficiency: number;
    temperature: number;
  }> = [];
  
  // Safety and diagnostics
  private faultHistory: FaultRecord[] = [];
  private operationCycles: number = 0;
  private totalEnergyProcessed: number = 0;
  
  // Power smoothing
  private powerBuffer: number[] = [];
  private smoothedPower: number = 0;
  
  constructor(config: EnergyStorageSystemConfig) {
    this.config = config;
    this.initializeSystem();
    this.initializeSafetyLimits();
    this.initializeEnergyMetrics();
  }

  /**
   * Main processing function for energy storage operations
   */
  public processEnergyStorage(inputs: SuspensionEnergyInputs): EnergyStorageOutputs {
    this.validateInputs(inputs);
    this.operationCycles++;
    
    // Update system temperature
    this.updateSystemTemperature(inputs.ambientTemperature, inputs.inputPower);
    
    // Apply power smoothing to handle spikes
    const smoothedInputPower = this.applypowerSmoothing(inputs.inputPower);
    
    // Determine optimal operating mode
    this.updateOperatingMode(inputs, smoothedInputPower);
    
    // Process energy flow based on operating mode
    const energyFlow = this.processEnergyFlow(inputs, smoothedInputPower);
    
    // Update storage states
    this.updateStorageStates(energyFlow);
    
    // Calculate system outputs
    const outputs = this.calculateSystemOutputs(inputs, energyFlow);
    
    // Update performance metrics
    this.updatePerformanceMetrics(inputs, outputs);
    
    // Check safety conditions
    this.checkSafetyConditions(inputs, outputs);
    
    // Update diagnostics
    this.updateDiagnostics();
    
    return outputs;
  }

  /**
   * Initialize system with default values
   */
  private initializeSystem(): void {
    this.systemStatus = {
      operational: true,
      capacitorSOC: this.capacitorSOC,
      batterySOC: this.batterySOC,
      systemTemperature: this.systemTemperature,
      alarms: [],
      warnings: [],
      operatingMode: 'standby',
      powerFlow: 'none'
    };
  }

  /**
   * Initialize safety limits based on configuration
   */
  private initializeSafetyLimits(): void {
    this.safetyLimits = {
      maxSystemVoltage: Math.max(this.config.capacitorBank.maxVoltage, this.config.batteryPack.nominalVoltage) * 1.1,
      maxSystemCurrent: Math.max(this.config.capacitorBank.maxCurrent, this.config.batteryPack.maxChargeCurrent) * 1.1,
      maxSystemPower: this.config.powerManagement.maxPowerTransferRate * 2,
      maxOperatingTemperature: Math.min(this.config.capacitorBank.temperatureRange[1], this.config.batteryPack.temperatureRange[1]),
      minOperatingTemperature: Math.max(this.config.capacitorBank.temperatureRange[0], this.config.batteryPack.temperatureRange[0]),
      maxChargeRate: 3.0, // 3C maximum charge rate
      maxDischargeRate: 5.0, // 5C maximum discharge rate
      insulationResistanceThreshold: 100 // 100 MΩ minimum
    };
  }

  /**
   * Initialize energy flow metrics
   */
  private initializeEnergyMetrics(): void {
    this.energyFlowMetrics = {
      energyInput: 0,
      capacitorEnergy: this.capacitorSOC * this.config.capacitorBank.totalCapacitance * Math.pow(this.config.capacitorBank.maxVoltage, 2) / 2 / 3600,
      batteryEnergy: this.batterySOC * this.config.batteryPack.totalCapacity,
      energyOutput: 0,
      energyLosses: 0,
      roundTripEfficiency: 0.9
    };
  }

  /**
   * Apply power smoothing to handle energy spikes
   */
  private applypowerSmoothing(inputPower: number): number {
    // Add current power to buffer
    this.powerBuffer.push(inputPower);
    
    // Maintain buffer size based on smoothing time constant
    const bufferSize = Math.max(10, Math.floor(this.config.powerManagement.powerSmoothingTimeConstant * 10));
    if (this.powerBuffer.length > bufferSize) {
      this.powerBuffer.shift();
    }
    
    // Calculate smoothed power using exponential moving average
    const alpha = 2 / (bufferSize + 1);
    this.smoothedPower = alpha * inputPower + (1 - alpha) * this.smoothedPower;
    
    // Handle power spikes by allowing direct capacitor charging
    const powerSpike = inputPower - this.smoothedPower;
    const spikeThreshold = this.smoothedPower * 2; // 200% of smoothed power
    
    if (powerSpike > spikeThreshold && this.capacitorSOC < 0.9) {
      // Allow spike to charge capacitors directly
      return inputPower;
    }
    
    return this.smoothedPower;
  }

  /**
   * Update operating mode based on system conditions
   */
  private updateOperatingMode(inputs: SuspensionEnergyInputs, smoothedPower: number): void {
    const prevMode = this.systemStatus.operatingMode;
    
    // Check for protection mode conditions
    if (this.systemTemperature > this.safetyLimits.maxOperatingTemperature ||
        this.systemStatus.alarms.length > 0) {
      this.systemStatus.operatingMode = 'protection';
      return;
    }
    
    // Determine mode based on power flow and SOC levels
    if (smoothedPower > 10) { // Significant input power
      if (this.capacitorSOC < 0.9) {
        this.systemStatus.operatingMode = 'charging';
        this.systemStatus.powerFlow = 'input_to_capacitor';
      } else if (this.batterySOC < this.config.batteryPack.socLimits[1]) {
        this.systemStatus.operatingMode = 'balancing';
        this.systemStatus.powerFlow = 'capacitor_to_battery';
      } else {
        this.systemStatus.operatingMode = 'standby';
        this.systemStatus.powerFlow = 'none';
      }
    } else if (inputs.loadDemand > 5) { // Load demand present
      if (this.capacitorSOC > 0.2) {
        this.systemStatus.operatingMode = 'discharging';
        this.systemStatus.powerFlow = 'capacitor_to_load';
      } else if (this.batterySOC > this.config.powerManagement.batterySupplyThresholds[0]) {
        this.systemStatus.operatingMode = 'discharging';
        this.systemStatus.powerFlow = 'battery_to_load';
      } else {
        this.systemStatus.operatingMode = 'standby';
        this.systemStatus.powerFlow = 'none';
      }
    } else if (this.capacitorSOC > this.config.powerManagement.capacitorChargingThresholds[0] &&
               this.batterySOC < this.config.powerManagement.capacitorChargingThresholds[1]) {
      this.systemStatus.operatingMode = 'balancing';
      this.systemStatus.powerFlow = 'capacitor_to_battery';
    } else {
      this.systemStatus.operatingMode = 'standby';
      this.systemStatus.powerFlow = 'none';
    }
    
    // Log mode changes
    if (prevMode !== this.systemStatus.operatingMode) {
      console.log(`Operating mode changed from ${prevMode} to ${this.systemStatus.operatingMode}`);
    }
  }

  /**
   * Process energy flow based on operating mode
   */
  private processEnergyFlow(inputs: SuspensionEnergyInputs, smoothedPower: number): {
    capacitorChargePower: number;
    capacitorDischargePower: number;
    batteryChargePower: number;
    batteryDischargePower: number;
    outputPower: number;
    efficiency: number;
  } {
    let capacitorChargePower = 0;
    let capacitorDischargePower = 0;
    let batteryChargePower = 0;
    let batteryDischargePower = 0;
    let outputPower = 0;
    let efficiency = 0.9;

    switch (this.systemStatus.operatingMode) {
      case 'charging':
        // Charge capacitors with input power
        capacitorChargePower = Math.min(
          smoothedPower,
          this.calculateMaxCapacitorChargePower(),
          this.config.capacitorBank.maxCurrent * this.config.capacitorBank.maxVoltage
        );
        efficiency = 0.95; // High efficiency for direct capacitor charging
        break;

      case 'discharging':
        if (this.systemStatus.powerFlow === 'capacitor_to_load') {
          // Discharge capacitors to load
          capacitorDischargePower = Math.min(
            inputs.loadDemand,
            this.calculateMaxCapacitorDischargePower()
          );
          outputPower = capacitorDischargePower * 0.95; // 95% efficiency
          efficiency = 0.95;
        } else if (this.systemStatus.powerFlow === 'battery_to_load') {
          // Discharge battery to load
          batteryDischargePower = Math.min(
            inputs.loadDemand,
            this.calculateMaxBatteryDischargePower()
          );
          outputPower = batteryDischargePower * this.config.batteryPack.dischargeEfficiency;
          efficiency = this.config.batteryPack.dischargeEfficiency;
        }
        break;

      case 'balancing':
        // Transfer energy from capacitors to battery
        const transferPower = Math.min(
          this.config.powerManagement.maxPowerTransferRate,
          this.calculateMaxCapacitorDischargePower(),
          this.calculateMaxBatteryChargePower()
        );
        capacitorDischargePower = transferPower;
        batteryChargePower = transferPower * 0.92; // 92% transfer efficiency
        efficiency = 0.92;
        break;

      case 'standby':
        // Minimal power for self-discharge compensation
        efficiency = 0.99;
        break;

      case 'protection':
        // No power transfer in protection mode
        efficiency = 0;
        break;
    }

    return {
      capacitorChargePower,
      capacitorDischargePower,
      batteryChargePower,
      batteryDischargePower,
      outputPower,
      efficiency
    };
  }

  /**
   * Calculate maximum capacitor charge power
   */
  private calculateMaxCapacitorChargePower(): number {
    const maxCurrent = this.config.capacitorBank.maxCurrent;
    const currentVoltage = this.capacitorSOC * this.config.capacitorBank.maxVoltage;
    const maxPower = maxCurrent * (this.config.capacitorBank.maxVoltage - currentVoltage);
    
    // Reduce charging power as SOC approaches maximum
    const socFactor = Math.max(0, (0.95 - this.capacitorSOC) / 0.95);
    
    return maxPower * socFactor;
  }

  /**
   * Calculate maximum capacitor discharge power
   */
  private calculateMaxCapacitorDischargePower(): number {
    const maxCurrent = this.config.capacitorBank.maxCurrent;
    const currentVoltage = this.capacitorSOC * this.config.capacitorBank.maxVoltage;
    const maxPower = maxCurrent * currentVoltage;
    
    // Reduce discharging power as SOC approaches minimum
    const socFactor = Math.max(0, (this.capacitorSOC - 0.1) / 0.9);
    
    return maxPower * socFactor;
  }

  /**
   * Calculate maximum battery charge power
   */
  private calculateMaxBatteryChargePower(): number {
    const maxPower = this.config.batteryPack.maxChargeCurrent * this.config.batteryPack.nominalVoltage;
    
    // Reduce charging power as SOC approaches maximum
    const socFactor = Math.max(0, (this.config.batteryPack.socLimits[1] - this.batterySOC) / 
                              (this.config.batteryPack.socLimits[1] - this.config.batteryPack.socLimits[0]));
    
    // Temperature derating
    const tempFactor = this.calculateTemperatureDerating();
    
    return maxPower * socFactor * tempFactor;
  }

  /**
   * Calculate maximum battery discharge power
   */
  private calculateMaxBatteryDischargePower(): number {
    const maxPower = this.config.batteryPack.maxDischargeCurrent * this.config.batteryPack.nominalVoltage;
    
    // Reduce discharging power as SOC approaches minimum
    const socFactor = Math.max(0, (this.batterySOC - this.config.batteryPack.socLimits[0]) / 
                              (this.config.batteryPack.socLimits[1] - this.config.batteryPack.socLimits[0]));
    
    // Temperature derating
    const tempFactor = this.calculateTemperatureDerating();
    
    return maxPower * socFactor * tempFactor;
  }

  /**
   * Calculate temperature derating factor
   */
  private calculateTemperatureDerating(): number {
    const optimalTemp = 25; // °C
    const tempDiff = Math.abs(this.systemTemperature - optimalTemp);
    
    if (tempDiff <= 10) return 1.0;
    if (tempDiff <= 30) return 1.0 - (tempDiff - 10) * 0.01; // 1% per degree above 10°C difference
    return 0.8; // Minimum 80% at extreme temperatures
  }

  /**
   * Update storage states based on energy flow
   */
  private updateStorageStates(energyFlow: any): void {
    const dt = 0.1; // 100ms time step
    
    // Update capacitor SOC
    const capacitorEnergyChange = (energyFlow.capacitorChargePower - energyFlow.capacitorDischargePower) * dt / 3600;
    const capacitorMaxEnergy = this.config.capacitorBank.totalCapacitance * Math.pow(this.config.capacitorBank.maxVoltage, 2) / 2 / 3600;
    this.capacitorSOC = Math.max(0, Math.min(1, this.capacitorSOC + capacitorEnergyChange / capacitorMaxEnergy));
    
    // Update battery SOC
    const batteryEnergyChange = (energyFlow.batteryChargePower - energyFlow.batteryDischargePower) * dt / 3600;
    this.batterySOC = Math.max(
      this.config.batteryPack.socLimits[0],
      Math.min(this.config.batteryPack.socLimits[1], this.batterySOC + batteryEnergyChange / this.config.batteryPack.totalCapacity)
    );
    
    // Apply self-discharge
    this.capacitorSOC *= (1 - this.config.capacitorBank.selfDischargeRate * dt / 3600);
    
    // Update system status
    this.systemStatus.capacitorSOC = this.capacitorSOC;
    this.systemStatus.batterySOC = this.batterySOC;
    this.systemStatus.systemTemperature = this.systemTemperature;
  }

  /**
   * Calculate system outputs
   */
  private calculateSystemOutputs(inputs: SuspensionEnergyInputs, energyFlow: any): EnergyStorageOutputs {
    const totalStoredEnergy = this.energyFlowMetrics.capacitorEnergy + this.energyFlowMetrics.batteryEnergy;
    const availablePowerCapacity = this.calculateMaxCapacitorDischargePower() + this.calculateMaxBatteryDischargePower();
    
    return {
      outputPower: energyFlow.outputPower,
      outputVoltage: this.calculateOutputVoltage(),
      outputCurrent: energyFlow.outputPower / this.calculateOutputVoltage(),
      efficiency: energyFlow.efficiency,
      totalStoredEnergy,
      availablePowerCapacity,
      storageStatus: { ...this.systemStatus }
    };
  }

  /**
   * Calculate output voltage based on system state
   */
  private calculateOutputVoltage(): number {
    // Use higher voltage source for output
    const capacitorVoltage = this.capacitorSOC * this.config.capacitorBank.maxVoltage;
    const batteryVoltage = this.config.batteryPack.nominalVoltage;
    
    return Math.max(capacitorVoltage, batteryVoltage);
  }

  /**
   * Update system temperature
   */
  private updateSystemTemperature(ambientTemp: number, inputPower: number): void {
    // Heat generation from power losses
    const powerLosses = inputPower * 0.05; // Assume 5% losses
    const heatGeneration = powerLosses + 10; // Base heat generation
    
    // Thermal time constant
    const thermalTimeConstant = 600; // 10 minutes
    const dt = 0.1;
    
    // Target temperature
    const targetTemp = ambientTemp + heatGeneration * 0.1;
    
    // Update temperature with thermal lag
    this.systemTemperature += (targetTemp - this.systemTemperature) * (dt / thermalTimeConstant);
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(inputs: SuspensionEnergyInputs, outputs: EnergyStorageOutputs): void {
    // Add to performance history
    this.performanceHistory.push({
      timestamp: Date.now(),
      power: inputs.inputPower,
      efficiency: outputs.efficiency,
      temperature: this.systemTemperature
    });
    
    // Keep only last 24 hours of data
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
    this.performanceHistory = this.performanceHistory.filter(entry => entry.timestamp > cutoffTime);
    
    // Update energy metrics
    const dt = 0.1 / 3600; // Convert to hours
    this.energyFlowMetrics.energyInput += inputs.inputPower * dt;
    this.energyFlowMetrics.energyOutput += outputs.outputPower * dt;
    this.energyFlowMetrics.energyLosses += inputs.inputPower * (1 - outputs.efficiency) * dt;
    
    this.totalEnergyProcessed += inputs.inputPower * dt;
  }

  /**
   * Check safety conditions and update alarms/warnings
   */
  private checkSafetyConditions(inputs: SuspensionEnergyInputs, outputs: EnergyStorageOutputs): void {
    this.systemStatus.alarms = [];
    this.systemStatus.warnings = [];
    
    // Temperature checks
    if (this.systemTemperature > this.safetyLimits.maxOperatingTemperature) {
      this.systemStatus.alarms.push('System temperature critical');
    } else if (this.systemTemperature > this.config.powerManagement.thermalThresholds[1]) {
      this.systemStatus.warnings.push('System temperature high');
    }
    
    // Voltage checks
    if (outputs.outputVoltage > this.safetyLimits.maxSystemVoltage) {
      this.systemStatus.alarms.push('System voltage too high');
    }
    
    // Current checks
    if (outputs.outputCurrent > this.safetyLimits.maxSystemCurrent) {
      this.systemStatus.alarms.push('System current too high');
    }
    
    // SOC checks
    if (this.capacitorSOC < 0.05) {
      this.systemStatus.warnings.push('Capacitor SOC low');
    }
    if (this.batterySOC < this.config.batteryPack.socLimits[0] + 0.05) {
      this.systemStatus.warnings.push('Battery SOC low');
    }
    
    // Update operational status
    this.systemStatus.operational = this.systemStatus.alarms.length === 0;
  }

  /**
   * Update diagnostic data
   */
  private updateDiagnostics(): void {
    // This would typically update component health metrics,
    // trend analysis, and maintenance schedules
    // Implementation depends on specific diagnostic requirements
  }

  /**
   * Validate input parameters
   */
  private validateInputs(inputs: SuspensionEnergyInputs): void {
    if (inputs.inputPower < 0 || inputs.inputPower > 5000) {
      throw new Error(`Invalid input power: ${inputs.inputPower}W`);
    }
    if (inputs.inputVoltage < 0 || inputs.inputVoltage > 100) {
      throw new Error(`Invalid input voltage: ${inputs.inputVoltage}V`);
    }
    if (inputs.loadDemand < 0 || inputs.loadDemand > 10000) {
      throw new Error(`Invalid load demand: ${inputs.loadDemand}W`);
    }
    if (inputs.ambientTemperature < -40 || inputs.ambientTemperature > 80) {
      throw new Error(`Invalid ambient temperature: ${inputs.ambientTemperature}°C`);
    }
  }

  /**
   * Get current system status
   */
  public getSystemStatus(): StorageSystemStatus {
    return { ...this.systemStatus };
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    const recentHistory = this.performanceHistory.slice(-100); // Last 100 samples
    
    const avgPower = recentHistory.length > 0 ?
      recentHistory.reduce((sum, entry) => sum + entry.power, 0) / recentHistory.length : 0;
    
    const peakPower = recentHistory.length > 0 ?
      Math.max(...recentHistory.map(entry => entry.power)) : 0;
    
    const avgEfficiency = recentHistory.length > 0 ?
      recentHistory.reduce((sum, entry) => sum + entry.efficiency, 0) / recentHistory.length : 0;
    
    return {
      averagePowerGeneration: avgPower,
      peakPowerGeneration: peakPower,
      harvestingEfficiency: avgEfficiency,
      storageUtilization: (this.capacitorSOC + this.batterySOC) / 2,
      spikeMitigationEffectiveness: 0.95, // Based on power smoothing algorithm
      systemAvailability: this.systemStatus.operational ? 1.0 : 0.5,
      mtbf: 8760, // 1 year
      totalEnergyThroughput: this.totalEnergyProcessed
    };
  }

  /**
   * Get energy flow metrics
   */
  public getEnergyFlowMetrics(): EnergyFlowMetrics {
    // Update current energy levels
    this.energyFlowMetrics.capacitorEnergy = this.capacitorSOC * 
      this.config.capacitorBank.totalCapacitance * Math.pow(this.config.capacitorBank.maxVoltage, 2) / 2 / 3600;
    this.energyFlowMetrics.batteryEnergy = this.batterySOC * this.config.batteryPack.totalCapacity;
    
    // Calculate round-trip efficiency
    if (this.energyFlowMetrics.energyInput > 0) {
      this.energyFlowMetrics.roundTripEfficiency = 
        this.energyFlowMetrics.energyOutput / this.energyFlowMetrics.energyInput;
    }
    
    return { ...this.energyFlowMetrics };
  }

  /**
   * Reset system statistics
   */
  public resetStatistics(): void {
    this.performanceHistory = [];
    this.faultHistory = [];
    this.operationCycles = 0;
    this.totalEnergyProcessed = 0;
    this.initializeEnergyMetrics();
  }

  /**
   * Update system configuration
   */
  public updateConfiguration(newConfig: Partial<EnergyStorageSystemConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeSafetyLimits();
  }

  /**
   * Emergency shutdown
   */
  public emergencyShutdown(reason: string): void {
    this.systemStatus.operatingMode = 'protection';
    this.systemStatus.operational = false;
    this.systemStatus.alarms.push(`Emergency shutdown: ${reason}`);
    
    // Log fault
    this.faultHistory.push({
      timestamp: new Date(),
      faultCode: 'EMERGENCY_SHUTDOWN',
      description: reason,
      severity: 'critical',
      resolved: false
    });
  }

  /**
   * System restart after fault resolution
   */
  public restartSystem(): void {
    if (this.systemStatus.alarms.length === 0) {
      this.systemStatus.operatingMode = 'standby';
      this.systemStatus.operational = true;
      console.log('System restarted successfully');
    } else {
      throw new Error('Cannot restart system with active alarms');
    }
  }
}