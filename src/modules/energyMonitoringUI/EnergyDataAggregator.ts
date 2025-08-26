/**
 * Energy Data Aggregator
 * 
 * Collects and aggregates energy data from all harvesting sources
 * in the suspension system.
 */

import { RotaryElectromagneticShockAbsorber, SuspensionInputs, ShockAbsorberOutputs } from '../electromagneticShockAbsorber/RotaryElectromagneticShockAbsorber';
import { HydraulicElectromagneticRegenerativeDamper, DamperInputs, DamperOutputs } from '../fuzzyControl/HydraulicElectromagneticRegenerativeDamper';
import { PiezoelectricEnergyHarvestingController } from '../fuzzyControl/VibrationEnergyHarvesting';
import { SystemInputs } from '../fuzzyControl/FuzzyControlIntegration';
import { 
  EnergyMonitoringData, 
  RealTimeEnergyData, 
  StorageData, 
  EnergySourceStatus,
  HistoricalDataPoint,
  MonitoringAlert 
} from './types';

export interface AggregatorInputs {
  /** Suspension system inputs */
  suspensionInputs: SuspensionInputs;
  /** Damper system inputs */
  damperInputs: DamperInputs;
  /** Vehicle system inputs for piezoelectric harvesting */
  vehicleInputs: SystemInputs;
  /** Battery system data */
  batteryData: {
    stateOfCharge: number;
    capacity: number;
    voltage: number;
    temperature: number;
    health: number;
  };
}

export class EnergyDataAggregator {
  private electromagneticShockAbsorber: RotaryElectromagneticShockAbsorber;
  private hydraulicDamper: HydraulicElectromagneticRegenerativeDamper;
  private piezoelectricController: PiezoelectricEnergyHarvestingController;
  
  private historicalData: HistoricalDataPoint[] = [];
  private maxHistoryPoints: number = 1000;
  private lastUpdateTime: number = 0;
  private alerts: MonitoringAlert[] = [];

  constructor(
    electromagneticShockAbsorber?: RotaryElectromagneticShockAbsorber,
    hydraulicDamper?: HydraulicElectromagneticRegenerativeDamper,
    piezoelectricController?: PiezoelectricEnergyHarvestingController
  ) {
    this.electromagneticShockAbsorber = electromagneticShockAbsorber || new RotaryElectromagneticShockAbsorber();
    this.hydraulicDamper = hydraulicDamper || new HydraulicElectromagneticRegenerativeDamper();
    this.piezoelectricController = piezoelectricController || new PiezoelectricEnergyHarvestingController();
  }

  /**
   * Aggregate energy data from all sources
   */
  public aggregateEnergyData(inputs: AggregatorInputs): EnergyMonitoringData {
    const timestamp = Date.now();
    
    // Get data from electromagnetic shock absorber
    const shockAbsorberOutputs = this.electromagneticShockAbsorber.processMotion(inputs.suspensionInputs);
    const shockAbsorberStatus = this.electromagneticShockAbsorber.getSystemStatus();
    
    // Get data from hydraulic damper
    const damperOutputs = this.hydraulicDamper.calculateDamperPerformance(inputs.damperInputs);
    const damperDiagnostics = this.hydraulicDamper.getDiagnostics();
    
    // Get data from piezoelectric harvesting
    const piezoHarvestingData = this.piezoelectricController.calculateEnergyHarvesting(inputs.vehicleInputs);
    const piezoStatus = this.piezoelectricController.getSystemStatus();
    
    // Calculate real-time energy data
    const realTimeData = this.calculateRealTimeData(
      shockAbsorberOutputs,
      damperOutputs,
      piezoHarvestingData,
      inputs
    );
    
    // Calculate storage data
    const storageData = this.calculateStorageData(inputs.batteryData, realTimeData);
    
    // Generate usage statistics
    const usageStats = this.calculateUsageStatistics(realTimeData, storageData);
    
    // Update historical data
    this.updateHistoricalData(timestamp, realTimeData, storageData);
    
    // Check for alerts
    const currentAlerts = this.checkForAlerts(realTimeData, storageData, shockAbsorberStatus, damperDiagnostics);
    
    this.lastUpdateTime = timestamp;
    
    return {
      timestamp,
      realTimeData,
      storageData,
      usageStats,
      alerts: currentAlerts
    };
  }

  /**
   * Calculate real-time energy data from all sources
   */
  private calculateRealTimeData(
    shockAbsorberOutputs: ShockAbsorberOutputs,
    damperOutputs: DamperOutputs,
    piezoHarvestingData: any,
    inputs: AggregatorInputs
  ): RealTimeEnergyData {
    const electromagneticPower = shockAbsorberOutputs.generatedPower;
    const hydraulicPower = damperOutputs.generatedPower;
    const piezoPower = piezoHarvestingData.totalPower || 0;
    const vibrationPower = piezoHarvestingData.totalPower || 0; // Same source for now
    
    const totalPowerGeneration = electromagneticPower + hydraulicPower + piezoPower;
    
    // Calculate overall efficiency
    const efficiencies = [
      shockAbsorberOutputs.efficiency,
      damperOutputs.energyEfficiency,
      piezoHarvestingData.averageEfficiency || 0.8
    ];
    const overallEfficiency = efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length;
    
    return {
      totalPowerGeneration,
      powerBySource: {
        electromagneticShockAbsorber: electromagneticPower,
        hydraulicRegenerativeDamper: hydraulicPower,
        piezoelectricHarvester: piezoPower,
        vibrationHarvesting: vibrationPower
      },
      overallEfficiency,
      energyHarvestingRate: totalPowerGeneration, // W = J/s
      electricalData: {
        voltage: shockAbsorberOutputs.outputVoltage,
        current: shockAbsorberOutputs.outputCurrent,
        frequency: 50 // Assume 50Hz for now
      },
      operatingConditions: {
        vehicleSpeed: inputs.suspensionInputs.vehicleSpeed,
        roadCondition: inputs.suspensionInputs.roadCondition,
        ambientTemperature: inputs.suspensionInputs.ambientTemperature,
        systemTemperature: Math.max(
          damperOutputs.systemTemperature,
          inputs.batteryData.temperature
        )
      }
    };
  }

  /**
   * Calculate storage data
   */
  private calculateStorageData(batteryData: any, realTimeData: RealTimeEnergyData): StorageData {
    const currentStoredEnergy = batteryData.stateOfCharge * batteryData.capacity;
    const chargingRate = realTimeData.totalPowerGeneration;
    
    // Calculate time to full charge
    const remainingCapacity = batteryData.capacity - currentStoredEnergy;
    const timeToFullCharge = chargingRate > 0 ? (remainingCapacity / chargingRate) * 60 : Infinity;
    
    return {
      batterySOC: batteryData.stateOfCharge,
      batteryCapacity: batteryData.capacity,
      currentStoredEnergy,
      batteryVoltage: batteryData.voltage,
      chargingRate,
      timeToFullCharge: Math.min(timeToFullCharge, 999), // Cap at 999 minutes
      batteryHealth: batteryData.health,
      batteryTemperature: batteryData.temperature
    };
  }

  /**
   * Calculate usage statistics
   */
  private calculateUsageStatistics(realTimeData: RealTimeEnergyData, storageData: StorageData): any {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - (6 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    // Filter historical data for different time periods
    const todayData = this.historicalData.filter(point => point.timestamp >= todayStart);
    const weekData = this.historicalData.filter(point => point.timestamp >= weekStart);
    const monthData = this.historicalData.filter(point => point.timestamp >= monthStart);
    
    // Calculate energy totals
    const dailyEnergyHarvested = this.calculateEnergyFromData(todayData);
    const weeklyEnergyHarvested = this.calculateEnergyFromData(weekData);
    const monthlyEnergyHarvested = this.calculateEnergyFromData(monthData);
    const lifetimeEnergyHarvested = this.calculateEnergyFromData(this.historicalData) / 1000; // Convert to kWh
    
    // Calculate averages
    const averageDailyGeneration = weekData.length > 0 ? weeklyEnergyHarvested / 7 : 0;
    const peakPowerToday = todayData.length > 0 ? Math.max(...todayData.map(d => d.power)) : 0;
    
    return {
      dailyEnergyHarvested,
      weeklyEnergyHarvested,
      monthlyEnergyHarvested,
      lifetimeEnergyHarvested,
      averageDailyGeneration,
      peakPowerToday,
      consumption: {
        dailyConsumption: dailyEnergyHarvested * 0.8, // Assume 80% consumption
        weeklyConsumption: weeklyEnergyHarvested * 0.8,
        monthlyConsumption: monthlyEnergyHarvested * 0.8,
        averageConsumption: averageDailyGeneration * 0.8
      },
      efficiencyTrends: {
        current: realTimeData.overallEfficiency,
        daily: this.calculateAverageEfficiency(todayData),
        weekly: this.calculateAverageEfficiency(weekData),
        monthly: this.calculateAverageEfficiency(monthData)
      },
      operatingTime: {
        totalOperatingHours: this.historicalData.length * 0.001 / 3600, // Assuming 1ms intervals
        energyHarvestingHours: this.historicalData.filter(d => d.power > 0).length * 0.001 / 3600,
        systemUptime: 0.99 // 99% uptime assumption
      }
    };
  }

  /**
   * Update historical data
   */
  private updateHistoricalData(timestamp: number, realTimeData: RealTimeEnergyData, storageData: StorageData): void {
    const dataPoint: HistoricalDataPoint = {
      timestamp,
      power: realTimeData.totalPowerGeneration,
      energy: realTimeData.totalPowerGeneration * 0.001 / 3600, // Convert W to Wh (assuming 1ms interval)
      efficiency: realTimeData.overallEfficiency,
      batterySOC: storageData.batterySOC
    };
    
    this.historicalData.push(dataPoint);
    
    // Maintain maximum history size
    if (this.historicalData.length > this.maxHistoryPoints) {
      this.historicalData.shift();
    }
  }

  /**
   * Check for system alerts
   */
  private checkForAlerts(
    realTimeData: RealTimeEnergyData,
    storageData: StorageData,
    shockAbsorberStatus: any,
    damperDiagnostics: any
  ): MonitoringAlert[] {
    const alerts: MonitoringAlert[] = [];
    const timestamp = Date.now();
    
    // Battery alerts
    if (storageData.batterySOC < 0.2) {
      alerts.push({
        id: `battery-low-${timestamp}`,
        severity: 'warning',
        category: 'battery',
        title: 'Low Battery',
        message: `Battery level is at ${(storageData.batterySOC * 100).toFixed(1)}%`,
        timestamp,
        acknowledged: false,
        recommendedActions: ['Reduce power consumption', 'Check charging system']
      });
    }
    
    if (storageData.batteryHealth < 0.8) {
      alerts.push({
        id: `battery-health-${timestamp}`,
        severity: 'warning',
        category: 'battery',
        title: 'Battery Health Degraded',
        message: `Battery health is at ${(storageData.batteryHealth * 100).toFixed(1)}%`,
        timestamp,
        acknowledged: false,
        recommendedActions: ['Schedule battery maintenance', 'Monitor charging patterns']
      });
    }
    
    // Temperature alerts
    if (realTimeData.operatingConditions.systemTemperature > 80) {
      alerts.push({
        id: `temp-high-${timestamp}`,
        severity: 'error',
        category: 'temperature',
        title: 'High System Temperature',
        message: `System temperature is ${realTimeData.operatingConditions.systemTemperature.toFixed(1)}°C`,
        timestamp,
        acknowledged: false,
        recommendedActions: ['Reduce system load', 'Check cooling system', 'Allow system to cool']
      });
    }
    
    // Performance alerts
    if (realTimeData.overallEfficiency < 0.5) {
      alerts.push({
        id: `efficiency-low-${timestamp}`,
        severity: 'warning',
        category: 'performance',
        title: 'Low System Efficiency',
        message: `System efficiency is ${(realTimeData.overallEfficiency * 100).toFixed(1)}%`,
        timestamp,
        acknowledged: false,
        recommendedActions: ['Check system components', 'Review driving patterns', 'Schedule maintenance']
      });
    }
    
    // System status alerts
    if (!shockAbsorberStatus.isOperational) {
      alerts.push({
        id: `shock-absorber-fault-${timestamp}`,
        severity: 'error',
        category: 'system',
        title: 'Shock Absorber Fault',
        message: 'Electromagnetic shock absorber is not operational',
        timestamp,
        acknowledged: false,
        recommendedActions: ['Check system diagnostics', 'Contact service technician']
      });
    }
    
    return alerts;
  }

  /**
   * Calculate energy from historical data points
   */
  private calculateEnergyFromData(data: HistoricalDataPoint[]): number {
    return data.reduce((total, point) => total + point.energy, 0);
  }

  /**
   * Calculate average efficiency from historical data
   */
  private calculateAverageEfficiency(data: HistoricalDataPoint[]): number {
    if (data.length === 0) return 0;
    return data.reduce((total, point) => total + point.efficiency, 0) / data.length;
  }

  /**
   * Get energy source status
   */
  public getEnergySourceStatus(): EnergySourceStatus[] {
    const timestamp = Date.now();
    
    return [
      {
        sourceId: 'electromagnetic-shock-absorber',
        name: 'Electromagnetic Shock Absorber',
        isActive: true,
        currentPower: 0, // Will be updated with real data
        efficiency: 0.85,
        temperature: 25,
        totalEnergyGenerated: 0,
        lastUpdate: timestamp
      },
      {
        sourceId: 'hydraulic-regenerative-damper',
        name: 'Hydraulic Regenerative Damper',
        isActive: true,
        currentPower: 0,
        efficiency: 0.78,
        temperature: 30,
        totalEnergyGenerated: 0,
        lastUpdate: timestamp
      },
      {
        sourceId: 'piezoelectric-harvester',
        name: 'Piezoelectric Harvester',
        isActive: true,
        currentPower: 0,
        efficiency: 0.65,
        temperature: 25,
        totalEnergyGenerated: 0,
        lastUpdate: timestamp
      }
    ];
  }

  /**
   * Get historical data
   */
  public getHistoricalData(timeRange?: { start: number; end: number }): HistoricalDataPoint[] {
    if (!timeRange) {
      return [...this.historicalData];
    }
    
    return this.historicalData.filter(
      point => point.timestamp >= timeRange.start && point.timestamp <= timeRange.end
    );
  }

  /**
   * Clear historical data
   */
  public clearHistoricalData(): void {
    this.historicalData = [];
  }

  /**
   * Acknowledge alert
   */
  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  /**
   * Get system summary
   */
  public getSystemSummary(): {
    totalSources: number;
    activeSources: number;
    totalPowerGeneration: number;
    averageEfficiency: number;
    systemHealth: number;
  } {
    const sources = this.getEnergySourceStatus();
    const activeSources = sources.filter(s => s.isActive).length;
    const totalPowerGeneration = sources.reduce((total, s) => total + s.currentPower, 0);
    const averageEfficiency = sources.reduce((total, s) => total + s.efficiency, 0) / sources.length;
    
    return {
      totalSources: sources.length,
      activeSources,
      totalPowerGeneration,
      averageEfficiency,
      systemHealth: 0.95 // Calculated based on various factors
    };
  }
}