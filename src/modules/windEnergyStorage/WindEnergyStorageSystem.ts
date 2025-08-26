/**
 * Wind Energy Storage System
 * 
 * Main controller for integrated wind energy storage systems.
 * Manages multiple storage technologies and optimizes their operation
 * for maximum efficiency and grid stability.
 */

import {
  WindStorageInputs,
  StorageSystemOutputs,
  HybridConfiguration,
  StoragePerformanceMetrics,
  StorageControlCommand,
  StorageSystemStatus,
  StorageTechnology
} from './types';

export interface WindStorageSystemConfig {
  windFarmCapacity: number;       // MW - wind farm capacity
  storageConfiguration: HybridConfiguration;
  gridSpecs: {
    nominalFrequency: number;     // Hz - nominal grid frequency
    nominalVoltage: number;       // kV - nominal grid voltage
    maxRampRate: number;          // MW/min - maximum ramp rate
  };
  controlParameters: {
    socTargets: [number, number]; // [min, max] SOC targets
    efficiencyThreshold: number;  // Minimum efficiency threshold
    responseTimeTarget: number;   // Target response time (seconds)
  };
}

export class WindEnergyStorageSystem {
  private config: WindStorageSystemConfig;
  private systemStatus: StorageSystemStatus;
  private performanceHistory: Array<{
    timestamp: number;
    efficiency: number;
    power: number;
    soc: number;
  }> = [];
  
  private storageComponents: Map<string, StorageTechnology> = new Map();
  private controlQueue: StorageControlCommand[] = [];
  
  constructor(config: WindStorageSystemConfig) {
    this.config = config;
    this.initializeStorageComponents();
    this.initializeSystemStatus();
  }

  private initializeStorageComponents(): void {
    // Initialize battery storage
    if (this.config.storageConfiguration.batteryCapacity > 0) {
      this.storageComponents.set('battery', {
        name: 'Lithium-Ion Battery',
        type: 'electrochemical',
        energyDensity: 200, // Wh/kg
        powerDensity: 400,  // W/kg
        efficiency: 0.92,   // 92% round-trip efficiency
        responseTime: 1,    // 1 second
        cycleLife: 5000,
        lifetime: 15,
        operatingTemperature: [-20, 50],
        socLimits: [0.1, 0.9],
        depthOfDischarge: 0.8,
        capitalCost: 200,   // $/kWh
        operatingCost: 5,   // $/MWh
        maintenanceCost: 15, // $/kW/year
        co2Footprint: 75,   // kg CO2/kWh
        materialIntensity: 8, // kg/kWh
        recyclability: 0.85
      });
    }

    // Initialize flywheel storage
    if (this.config.storageConfiguration.flywheelCapacity > 0) {
      this.storageComponents.set('flywheel', {
        name: 'Carbon Fiber Flywheel',
        type: 'mechanical',
        energyDensity: 75,  // Wh/kg
        powerDensity: 8000, // W/kg
        efficiency: 0.93,   // 93% round-trip efficiency
        responseTime: 0.1,  // 100 milliseconds
        cycleLife: 100000,
        lifetime: 20,
        operatingTemperature: [-40, 60],
        socLimits: [0.05, 0.95],
        depthOfDischarge: 0.9,
        capitalCost: 3000,  // $/kWh
        operatingCost: 2,   // $/MWh
        maintenanceCost: 25, // $/kW/year
        co2Footprint: 25,   // kg CO2/kWh
        materialIntensity: 15, // kg/kWh
        recyclability: 0.95
      });
    }

    // Initialize CAES storage
    if (this.config.storageConfiguration.caesCapacity > 0) {
      this.storageComponents.set('caes', {
        name: 'Advanced CAES',
        type: 'mechanical',
        energyDensity: 3,   // Wh/kg
        powerDensity: 50,   // W/kg
        efficiency: 0.78,   // 78% round-trip efficiency
        responseTime: 300,  // 5 minutes
        cycleLife: 20000,
        lifetime: 30,
        operatingTemperature: [-20, 80],
        socLimits: [0.1, 0.9],
        depthOfDischarge: 0.8,
        capitalCost: 150,   // $/kWh
        operatingCost: 3,   // $/MWh
        maintenanceCost: 10, // $/kW/year
        co2Footprint: 15,   // kg CO2/kWh
        materialIntensity: 50, // kg/kWh
        recyclability: 0.9
      });
    }

    // Initialize gravity storage
    if (this.config.storageConfiguration.gravityCapacity > 0) {
      this.storageComponents.set('gravity', {
        name: 'Gravity Storage',
        type: 'mechanical',
        energyDensity: 2,   // Wh/kg
        powerDensity: 100,  // W/kg
        efficiency: 0.85,   // 85% round-trip efficiency
        responseTime: 5,    // 5 seconds
        cycleLife: 50000,
        lifetime: 40,
        operatingTemperature: [-40, 60],
        socLimits: [0.05, 0.95],
        depthOfDischarge: 0.9,
        capitalCost: 100,   // $/kWh
        operatingCost: 1,   // $/MWh
        maintenanceCost: 5,  // $/kW/year
        co2Footprint: 10,   // kg CO2/kWh
        materialIntensity: 100, // kg/kWh
        recyclability: 0.98
      });
    }
  }

  private initializeSystemStatus(): void {
    this.systemStatus = {
      timestamp: Date.now(),
      operational: true,
      soc: 0.5, // Start at 50% SOC
      power: 0,
      voltage: this.config.gridSpecs.nominalVoltage * 1000, // Convert to V
      current: 0,
      temperature: 25, // 25°C ambient
      alarms: [],
      warnings: [],
      efficiency: 0.9,
      availability: 1.0,
      nextMaintenance: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
      maintenanceRequired: false
    };
  }

  public processWindStorageOperation(inputs: WindStorageInputs): StorageSystemOutputs {
    // Validate inputs
    this.validateInputs(inputs);

    // Update system status
    this.updateSystemStatus(inputs);

    // Determine optimal storage operation
    const operation = this.optimizeStorageOperation(inputs);

    // Execute storage commands
    const outputs = this.executeStorageOperation(operation, inputs);

    // Update performance history
    this.updatePerformanceHistory(outputs);

    // Check for alarms and warnings
    this.checkSystemHealth(inputs, outputs);

    return outputs;
  }

  private validateInputs(inputs: WindStorageInputs): void {
    if (inputs.windSpeed < 0 || inputs.windSpeed > 50) {
      throw new Error(`Invalid wind speed: ${inputs.windSpeed} m/s`);
    }
    if (inputs.gridFrequency < 45 || inputs.gridFrequency > 65) {
      throw new Error(`Invalid grid frequency: ${inputs.gridFrequency} Hz`);
    }
    if (inputs.storageSOC < 0 || inputs.storageSOC > 1) {
      throw new Error(`Invalid storage SOC: ${inputs.storageSOC}`);
    }
  }

  private updateSystemStatus(inputs: WindStorageInputs): void {
    this.systemStatus.timestamp = Date.now();
    this.systemStatus.soc = inputs.storageSOC;
    this.systemStatus.temperature = inputs.ambientTemperature;
    
    // Update voltage based on grid conditions
    const voltageDeviation = (inputs.gridFrequency - this.config.gridSpecs.nominalFrequency) * 100;
    this.systemStatus.voltage = this.config.gridSpecs.nominalVoltage * 1000 * (1 + voltageDeviation / 10000);
  }

  private optimizeStorageOperation(inputs: WindStorageInputs): StorageControlCommand {
    // Calculate wind generation surplus/deficit
    const windSurplus = inputs.windGeneration - inputs.gridDemand;
    
    // Determine storage action based on multiple factors
    let command: 'charge' | 'discharge' | 'standby' | 'regulate';
    let power = 0;
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';

    // Grid frequency regulation (highest priority)
    const frequencyDeviation = inputs.gridFrequency - this.config.gridSpecs.nominalFrequency;
    if (Math.abs(frequencyDeviation) > 0.1) {
      command = 'regulate';
      power = this.calculateFrequencyRegulationPower(frequencyDeviation);
      priority = 'critical';
    }
    // Wind surplus - charge storage
    else if (windSurplus > 0 && inputs.storageSOC < this.config.controlParameters.socTargets[1]) {
      command = 'charge';
      power = Math.min(windSurplus, inputs.storagePower, 
                      this.calculateMaxChargePower(inputs.storageSOC));
      priority = 'medium';
    }
    // Wind deficit - discharge storage
    else if (windSurplus < 0 && inputs.storageSOC > this.config.controlParameters.socTargets[0]) {
      command = 'discharge';
      power = Math.min(Math.abs(windSurplus), inputs.storagePower,
                      this.calculateMaxDischargePower(inputs.storageSOC));
      priority = 'medium';
    }
    // Standby mode
    else {
      command = 'standby';
      power = 0;
      priority = 'low';
    }

    return {
      timestamp: Date.now(),
      command,
      power,
      duration: 60, // 1 hour default
      priority,
      source: 'automatic'
    };
  }

  private calculateFrequencyRegulationPower(frequencyDeviation: number): number {
    // Calculate power needed for frequency regulation
    // Negative deviation (low frequency) -> discharge (positive power)
    // Positive deviation (high frequency) -> charge (negative power)
    const droop = 0.05; // 5% droop setting
    const regulationPower = -(frequencyDeviation / droop) * this.config.windFarmCapacity;
    
    // Limit to storage power rating
    return Math.max(-this.config.storageConfiguration.batteryPower,
                   Math.min(this.config.storageConfiguration.batteryPower, regulationPower));
  }

  private calculateMaxChargePower(soc: number): number {
    // Reduce charging power as SOC approaches maximum
    const socMargin = this.config.controlParameters.socTargets[1] - soc;
    const powerReduction = Math.min(1, socMargin / 0.1); // Reduce power in last 10% SOC
    return this.config.storageConfiguration.batteryPower * powerReduction;
  }

  private calculateMaxDischargePower(soc: number): number {
    // Reduce discharging power as SOC approaches minimum
    const socMargin = soc - this.config.controlParameters.socTargets[0];
    const powerReduction = Math.min(1, socMargin / 0.1); // Reduce power in last 10% SOC
    return this.config.storageConfiguration.batteryPower * powerReduction;
  }

  private executeStorageOperation(command: StorageControlCommand, inputs: WindStorageInputs): StorageSystemOutputs {
    // Calculate actual power based on efficiency and constraints
    let actualPower = 0;
    let efficiency = 0.9; // Default efficiency

    switch (command.command) {
      case 'charge':
        actualPower = -Math.abs(command.power); // Negative for charging
        efficiency = this.calculateChargingEfficiency(inputs);
        break;
      case 'discharge':
        actualPower = Math.abs(command.power); // Positive for discharging
        efficiency = this.calculateDischargingEfficiency(inputs);
        break;
      case 'regulate':
        actualPower = command.power;
        efficiency = command.power > 0 ? 
                    this.calculateDischargingEfficiency(inputs) :
                    this.calculateChargingEfficiency(inputs);
        break;
      case 'standby':
        actualPower = 0;
        efficiency = 0.99; // Standby efficiency
        break;
    }

    // Calculate grid power (wind + storage)
    const gridPower = inputs.windGeneration + actualPower;

    // Calculate grid services capability
    const frequencyRegulation = this.calculateFrequencyRegulationCapability(inputs);
    const voltageSupport = this.calculateVoltageSupport(inputs);
    const ramping = this.calculateRampingCapability(inputs);

    // Calculate economic metrics
    const operatingCost = this.calculateOperatingCost(actualPower);
    const revenue = this.calculateRevenue(actualPower, inputs.electricityPrice);
    const netBenefit = revenue - operatingCost;

    return {
      chargingPower: actualPower < 0 ? Math.abs(actualPower) : 0,
      dischargingPower: actualPower > 0 ? actualPower : 0,
      gridPower,
      efficiency,
      availability: this.systemStatus.availability,
      responseTime: this.calculateResponseTime(command.command),
      frequencyRegulation,
      voltageSupport,
      ramping,
      operatingCost,
      revenue,
      netBenefit
    };
  }

  private calculateChargingEfficiency(inputs: WindStorageInputs): number {
    // Base efficiency from storage technology
    let baseEfficiency = 0.92; // Li-ion charging efficiency
    
    // Temperature derating
    const tempFactor = this.calculateTemperatureEfficiency(inputs.ambientTemperature);
    
    // SOC derating (lower efficiency at high SOC)
    const socFactor = inputs.storageSOC < 0.8 ? 1.0 : 0.95;
    
    return baseEfficiency * tempFactor * socFactor;
  }

  private calculateDischargingEfficiency(inputs: WindStorageInputs): number {
    // Base efficiency from storage technology
    let baseEfficiency = 0.94; // Li-ion discharging efficiency
    
    // Temperature derating
    const tempFactor = this.calculateTemperatureEfficiency(inputs.ambientTemperature);
    
    // SOC derating (lower efficiency at low SOC)
    const socFactor = inputs.storageSOC > 0.2 ? 1.0 : 0.95;
    
    return baseEfficiency * tempFactor * socFactor;
  }

  private calculateTemperatureEfficiency(temperature: number): number {
    // Optimal temperature range: 15-35°C
    if (temperature >= 15 && temperature <= 35) {
      return 1.0;
    } else if (temperature < 15) {
      return Math.max(0.8, 1.0 - (15 - temperature) * 0.01);
    } else {
      return Math.max(0.8, 1.0 - (temperature - 35) * 0.01);
    }
  }

  private calculateFrequencyRegulationCapability(inputs: WindStorageInputs): number {
    // Available capacity for frequency regulation
    const availableCapacity = Math.min(
      inputs.storagePower * 0.5, // Reserve 50% for frequency regulation
      (this.config.controlParameters.socTargets[1] - inputs.storageSOC) * inputs.storageCapacity, // Charging headroom
      (inputs.storageSOC - this.config.controlParameters.socTargets[0]) * inputs.storageCapacity  // Discharging headroom
    );
    
    return availableCapacity;
  }

  private calculateVoltageSupport(inputs: WindStorageInputs): number {
    // Reactive power capability (typically 0.3-0.5 of active power rating)
    return inputs.storagePower * 0.4;
  }

  private calculateRampingCapability(inputs: WindStorageInputs): number {
    // Ramp rate capability (MW/min)
    return inputs.storagePower; // Can ramp at full power rating per minute
  }

  private calculateResponseTime(command: string): number {
    switch (command) {
      case 'regulate':
        return 0.5; // 500ms for frequency regulation
      case 'charge':
      case 'discharge':
        return 2.0; // 2 seconds for energy management
      case 'standby':
        return 0.1; // 100ms for standby
      default:
        return 1.0;
    }
  }

  private calculateOperatingCost(power: number): number {
    // Operating cost includes efficiency losses and maintenance
    const energyCost = Math.abs(power) * 0.005; // $5/MWh operating cost
    const maintenanceCost = Math.abs(power) * 0.002; // $2/MWh maintenance cost
    return energyCost + maintenanceCost;
  }

  private calculateRevenue(power: number, electricityPrice: number): number {
    // Revenue from energy arbitrage and grid services
    const energyRevenue = power > 0 ? power * electricityPrice : 0; // Only revenue when discharging
    const gridServicesRevenue = Math.abs(power) * 0.01; // $10/MWh for grid services
    return energyRevenue + gridServicesRevenue;
  }

  private updatePerformanceHistory(outputs: StorageSystemOutputs): void {
    this.performanceHistory.push({
      timestamp: Date.now(),
      efficiency: outputs.efficiency,
      power: outputs.dischargingPower - outputs.chargingPower,
      soc: this.systemStatus.soc
    });

    // Keep only last 24 hours of data
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
    this.performanceHistory = this.performanceHistory.filter(
      entry => entry.timestamp > cutoffTime
    );
  }

  private checkSystemHealth(inputs: WindStorageInputs, outputs: StorageSystemOutputs): void {
    // Clear previous alarms and warnings
    this.systemStatus.alarms = [];
    this.systemStatus.warnings = [];

    // Check SOC limits
    if (inputs.storageSOC < 0.05) {
      this.systemStatus.alarms.push('Storage SOC critically low');
    } else if (inputs.storageSOC < 0.1) {
      this.systemStatus.warnings.push('Storage SOC low');
    }

    if (inputs.storageSOC > 0.95) {
      this.systemStatus.alarms.push('Storage SOC critically high');
    } else if (inputs.storageSOC > 0.9) {
      this.systemStatus.warnings.push('Storage SOC high');
    }

    // Check temperature
    if (inputs.ambientTemperature < -20 || inputs.ambientTemperature > 50) {
      this.systemStatus.alarms.push('Temperature out of operating range');
    } else if (inputs.ambientTemperature < -10 || inputs.ambientTemperature > 40) {
      this.systemStatus.warnings.push('Temperature approaching limits');
    }

    // Check efficiency
    if (outputs.efficiency < 0.7) {
      this.systemStatus.alarms.push('System efficiency critically low');
    } else if (outputs.efficiency < 0.8) {
      this.systemStatus.warnings.push('System efficiency low');
    }

    // Check grid frequency
    const frequencyDeviation = Math.abs(inputs.gridFrequency - this.config.gridSpecs.nominalFrequency);
    if (frequencyDeviation > 0.5) {
      this.systemStatus.alarms.push('Grid frequency deviation critical');
    } else if (frequencyDeviation > 0.2) {
      this.systemStatus.warnings.push('Grid frequency deviation high');
    }

    // Update availability based on alarms
    this.systemStatus.availability = this.systemStatus.alarms.length > 0 ? 0.5 : 1.0;
  }

  public getSystemStatus(): StorageSystemStatus {
    return { ...this.systemStatus };
  }

  public getPerformanceMetrics(): StoragePerformanceMetrics {
    const recentHistory = this.performanceHistory.slice(-24); // Last 24 hours
    
    const avgEfficiency = recentHistory.length > 0 ?
      recentHistory.reduce((sum, entry) => sum + entry.efficiency, 0) / recentHistory.length : 0.9;
    
    const totalEnergy = recentHistory.reduce((sum, entry) => sum + Math.abs(entry.power), 0);
    const capacityFactor = totalEnergy / (this.config.storageConfiguration.batteryCapacity * 24);

    return {
      roundTripEfficiency: avgEfficiency,
      chargingEfficiency: avgEfficiency * 0.98,
      dischargingEfficiency: avgEfficiency * 1.02,
      standbyLosses: 0.001, // 0.1% per hour
      availability: this.systemStatus.availability,
      mtbf: 8760, // 1 year MTBF
      mttr: 24,   // 24 hours MTTR
      capacityFactor,
      cycleLife: 5000,
      degradationRate: 0.02, // 2% per year
      lcoe: 0.08, // $80/MWh
      capex: 200, // $200/kW
      opex: 15,   // $15/kW/year
      co2Avoided: 500, // tons CO2/year
      materialFootprint: 8, // kg/MWh
      recyclingRate: 0.85
    };
  }

  public addControlCommand(command: StorageControlCommand): void {
    this.controlQueue.push(command);
    // Sort by priority and timestamp
    this.controlQueue.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
    });
  }

  public getStorageComponents(): Map<string, StorageTechnology> {
    return new Map(this.storageComponents);
  }

  public updateConfiguration(newConfig: Partial<WindStorageSystemConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.storageConfiguration) {
      this.initializeStorageComponents();
    }
  }

  public resetSystem(): void {
    this.performanceHistory = [];
    this.controlQueue = [];
    this.initializeSystemStatus();
  }
}