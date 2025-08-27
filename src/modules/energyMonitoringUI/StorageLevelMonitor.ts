/**
 * Storage Level Monitor Component
 * 
 * Monitors and displays battery storage levels, charging status, and health metrics.
 */

import { StorageData, MonitoringAlert, DashboardConfiguration } from './types';

export interface BatteryDisplayData {
  /** Battery level percentage */
  levelPercentage: number;
  /** Visual indicator color */
  levelColor: string;
  /** Charging status */
  chargingStatus: 'charging' | 'discharging' | 'idle' | 'full';
  /** Estimated time remaining */
  timeRemaining: {
    value: number;
    unit: 'minutes' | 'hours';
    type: 'charge' | 'discharge';
  };
  /** Health indicator */
  healthIndicator: {
    percentage: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    color: string;
  };
}

export interface EnergyFlowData {
  /** Energy flowing in (charging) */
  energyIn: number;
  /** Energy flowing out (consumption) */
  energyOut: number;
  /** Net energy flow */
  netFlow: number;
  /** Flow direction */
  flowDirection: 'charging' | 'discharging' | 'balanced';
}

export interface StorageCapacityData {
  /** Current capacity */
  current: number;
  /** Maximum capacity */
  maximum: number;
  /** Available capacity */
  available: number;
  /** Used capacity */
  used: number;
  /** Capacity utilization percentage */
  utilizationPercentage: number;
}

export interface BatteryHealthMetrics {
  /** Overall health score (0-100) */
  healthScore: number;
  /** Cycle count */
  cycleCount: number;
  /** Age in months */
  ageMonths: number;
  /** Temperature impact on health */
  temperatureImpact: 'positive' | 'neutral' | 'negative';
  /** Charging pattern impact */
  chargingPatternImpact: 'optimal' | 'good' | 'suboptimal';
  /** Estimated remaining life */
  estimatedRemainingLife: {
    value: number;
    unit: 'months' | 'years';
  };
}

export class StorageLevelMonitor {
  private config: DashboardConfiguration;
  private storageHistory: Array<{ timestamp: number; data: StorageData }> = [];
  private maxHistoryLength: number = 1440; // 24 hours at 1-minute intervals
  private alertCallbacks: Array<(alert: MonitoringAlert) => void> = [];
  private lastAlertTime: number = 0;
  private alertCooldown: number = 300000; // 5 minutes

  constructor(config: DashboardConfiguration) {
    this.config = config;
  }

  /**
   * Process storage data for display
   */
  public processStorageData(data: StorageData): BatteryDisplayData {
    // Update storage history
    this.updateStorageHistory(data);

    // Determine charging status
    const chargingStatus = this.determineChargingStatus(data);

    // Calculate time remaining
    const timeRemaining = this.calculateTimeRemaining(data, chargingStatus);

    // Assess battery health
    const healthIndicator = this.assessBatteryHealth(data);

    // Check for alerts
    this.checkStorageAlerts(data);

    return {
      levelPercentage: Math.round(data.batterySOC * 100),
      levelColor: this.getBatteryLevelColor(data.batterySOC),
      chargingStatus,
      timeRemaining,
      healthIndicator
    };
  }

  /**
   * Get energy flow data
   */
  public getEnergyFlowData(data: StorageData): EnergyFlowData {
    const energyIn = Math.max(0, data.chargingRate);
    const energyOut = this.estimateEnergyConsumption(data);
    const netFlow = energyIn - energyOut;

    let flowDirection: 'charging' | 'discharging' | 'balanced';
    if (netFlow > 5) {
      flowDirection = 'charging';
    } else if (netFlow < -5) {
      flowDirection = 'discharging';
    } else {
      flowDirection = 'balanced';
    }

    return {
      energyIn,
      energyOut,
      netFlow,
      flowDirection
    };
  }

  /**
   * Get storage capacity data
   */
  public getStorageCapacityData(data: StorageData): StorageCapacityData {
    const current = data.currentStoredEnergy;
    const maximum = data.batteryCapacity;
    const used = current;
    const available = maximum - current;
    const utilizationPercentage = (current / maximum) * 100;

    return {
      current: this.formatEnergyValue(current),
      maximum: this.formatEnergyValue(maximum),
      available: this.formatEnergyValue(available),
      used: this.formatEnergyValue(used),
      utilizationPercentage: Math.round(utilizationPercentage)
    };
  }

  /**
   * Get battery health metrics
   */
  public getBatteryHealthMetrics(data: StorageData): BatteryHealthMetrics {
    const healthScore = Math.round(data.batteryHealth * 100);
    const cycleCount = this.estimateCycleCount();
    const ageMonths = this.estimateBatteryAge();
    const temperatureImpact = this.assessTemperatureImpact(data.batteryTemperature);
    const chargingPatternImpact = this.assessChargingPatternImpact();
    const estimatedRemainingLife = this.estimateRemainingLife(data.batteryHealth);

    return {
      healthScore,
      cycleCount,
      ageMonths,
      temperatureImpact,
      chargingPatternImpact,
      estimatedRemainingLife
    };
  }

  /**
   * Get charging efficiency data
   */
  public getChargingEfficiencyData(data: StorageData): {
    currentEfficiency: number;
    averageEfficiency: number;
    optimalChargingRate: number;
    actualChargingRate: number;
    efficiencyTrend: 'improving' | 'stable' | 'declining';
  } {
    const currentEfficiency = this.calculateChargingEfficiency(data);
    const averageEfficiency = this.calculateAverageChargingEfficiency();
    const optimalChargingRate = this.calculateOptimalChargingRate(data);
    const efficiencyTrend = this.calculateEfficiencyTrend();

    return {
      currentEfficiency,
      averageEfficiency,
      optimalChargingRate,
      actualChargingRate: data.chargingRate,
      efficiencyTrend
    };
  }

  /**
   * Get storage level trends
   */
  public getStorageLevelTrends(timeRange: number = 24): Array<{
    timestamp: number;
    batteryLevel: number;
    chargingRate: number;
    temperature: number;
  }> {
    const now = Date.now();
    const startTime = now - (timeRange * 60 * 60 * 1000); // Convert hours to milliseconds

    return this.storageHistory
      .filter(entry => entry.timestamp >= startTime)
      .map(entry => ({
        timestamp: entry.timestamp,
        batteryLevel: entry.data.batterySOC * 100,
        chargingRate: entry.data.chargingRate,
        temperature: entry.data.batteryTemperature
      }));
  }

  /**
   * Get battery performance summary
   */
  public getBatteryPerformanceSummary(data: StorageData): {
    overallRating: 'excellent' | 'good' | 'fair' | 'poor';
    keyMetrics: Array<{
      name: string;
      value: string;
      status: 'good' | 'warning' | 'critical';
    }>;
    recommendations: string[];
  } {
    const healthScore = data.batteryHealth * 100;
    const temperatureStatus = this.getTemperatureStatus(data.batteryTemperature);
    const socStatus = this.getSOCStatus(data.batterySOC);

    const overallRating = this.calculateOverallRating(data);

    const keyMetrics = [
      {
        name: 'Battery Health',
        value: `${Math.round(healthScore)}%`,
        status: healthScore > 80 ? 'good' : healthScore > 60 ? 'warning' : 'critical' as const
      },
      {
        name: 'State of Charge',
        value: `${Math.round(data.batterySOC * 100)}%`,
        status: socStatus
      },
      {
        name: 'Temperature',
        value: `${Math.round(data.batteryTemperature)}°C`,
        status: temperatureStatus
      },
      {
        name: 'Charging Rate',
        value: `${Math.round(data.chargingRate)}W`,
        status: data.chargingRate > 0 ? 'good' : 'warning' as const
      }
    ];

    const recommendations = this.generateRecommendations(data);

    return {
      overallRating,
      keyMetrics,
      recommendations
    };
  }

  /**
   * Subscribe to storage alerts
   */
  public subscribeToAlerts(callback: (alert: MonitoringAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Update storage history
   */
  private updateStorageHistory(data: StorageData): void {
    const timestamp = Date.now();
    this.storageHistory.push({ timestamp, data });

    // Maintain maximum history length
    if (this.storageHistory.length > this.maxHistoryLength) {
      this.storageHistory.shift();
    }
  }

  /**
   * Determine charging status
   */
  private determineChargingStatus(data: StorageData): 'charging' | 'discharging' | 'idle' | 'full' {
    if (data.batterySOC >= 0.99) {
      return 'full';
    } else if (data.chargingRate > 5) {
      return 'charging';
    } else if (data.chargingRate < -5) {
      return 'discharging';
    } else {
      return 'idle';
    }
  }

  /**
   * Calculate time remaining
   */
  private calculateTimeRemaining(data: StorageData, status: string): {
    value: number;
    unit: 'minutes' | 'hours';
    type: 'charge' | 'discharge';
  } {
    let timeMinutes = 0;
    let type: 'charge' | 'discharge' = 'charge';

    if (status === 'charging' && data.chargingRate > 0) {
      const remainingCapacity = data.batteryCapacity - data.currentStoredEnergy;
      timeMinutes = (remainingCapacity / data.chargingRate) * 60;
      type = 'charge';
    } else if (status === 'discharging') {
      const consumptionRate = this.estimateEnergyConsumption(data);
      if (consumptionRate > 0) {
        timeMinutes = (data.currentStoredEnergy / consumptionRate) * 60;
        type = 'discharge';
      }
    }

    // Convert to appropriate unit
    if (timeMinutes > 120) {
      return {
        value: Math.round(timeMinutes / 60),
        unit: 'hours',
        type
      };
    } else {
      return {
        value: Math.round(timeMinutes),
        unit: 'minutes',
        type
      };
    }
  }

  /**
   * Assess battery health
   */
  private assessBatteryHealth(data: StorageData): {
    percentage: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    color: string;
  } {
    const percentage = Math.round(data.batteryHealth * 100);
    let status: 'excellent' | 'good' | 'fair' | 'poor';
    let color: string;

    if (percentage >= 90) {
      status = 'excellent';
      color = '#4CAF50';
    } else if (percentage >= 75) {
      status = 'good';
      color = '#8BC34A';
    } else if (percentage >= 60) {
      status = 'fair';
      color = '#FF9800';
    } else {
      status = 'poor';
      color = '#F44336';
    }

    return { percentage, status, color };
  }

  /**
   * Get battery level color
   */
  private getBatteryLevelColor(soc: number): string {
    if (soc > 0.8) return '#4CAF50';
    if (soc > 0.6) return '#8BC34A';
    if (soc > 0.4) return '#FFC107';
    if (soc > 0.2) return '#FF9800';
    return '#F44336';
  }

  /**
   * Check for storage alerts
   */
  private checkStorageAlerts(data: StorageData): void {
    const now = Date.now();
    
    // Avoid spam alerts
    if (now - this.lastAlertTime < this.alertCooldown) {
      return;
    }

    const alerts: MonitoringAlert[] = [];

    // Low battery alert
    if (data.batterySOC < 0.15) {
      alerts.push({
        id: `battery-critical-${now}`,
        severity: 'critical',
        category: 'battery',
        title: 'Critical Battery Level',
        message: `Battery level is critically low at ${Math.round(data.batterySOC * 100)}%`,
        timestamp: now,
        acknowledged: false,
        recommendedActions: ['Find charging station immediately', 'Reduce power consumption']
      });
    } else if (data.batterySOC < 0.25) {
      alerts.push({
        id: `battery-low-${now}`,
        severity: 'warning',
        category: 'battery',
        title: 'Low Battery Level',
        message: `Battery level is low at ${Math.round(data.batterySOC * 100)}%`,
        timestamp: now,
        acknowledged: false,
        recommendedActions: ['Plan for charging soon', 'Monitor energy consumption']
      });
    }

    // Battery health alert
    if (data.batteryHealth < 0.6) {
      alerts.push({
        id: `battery-health-poor-${now}`,
        severity: 'warning',
        category: 'battery',
        title: 'Poor Battery Health',
        message: `Battery health has degraded to ${Math.round(data.batteryHealth * 100)}%`,
        timestamp: now,
        acknowledged: false,
        recommendedActions: ['Schedule battery inspection', 'Consider battery replacement']
      });
    }

    // Temperature alerts
    if (data.batteryTemperature > 45) {
      alerts.push({
        id: `battery-temp-high-${now}`,
        severity: 'error',
        category: 'temperature',
        title: 'High Battery Temperature',
        message: `Battery temperature is ${Math.round(data.batteryTemperature)}°C`,
        timestamp: now,
        acknowledged: false,
        recommendedActions: ['Reduce charging rate', 'Allow battery to cool', 'Check cooling system']
      });
    } else if (data.batteryTemperature < -10) {
      alerts.push({
        id: `battery-temp-low-${now}`,
        severity: 'warning',
        category: 'temperature',
        title: 'Low Battery Temperature',
        message: `Battery temperature is ${Math.round(data.batteryTemperature)}°C`,
        timestamp: now,
        acknowledged: false,
        recommendedActions: ['Warm up battery before heavy use', 'Reduce power demands']
      });
    }

    // Notify subscribers
    alerts.forEach(alert => {
      this.alertCallbacks.forEach(callback => callback(alert));
    });

    if (alerts.length > 0) {
      this.lastAlertTime = now;
    }
  }

  /**
   * Format energy value according to configuration
   */
  private formatEnergyValue(energy: number): number {
    switch (this.config.energyUnits) {
      case 'kWh':
        return Math.round(energy / 1000 * 100) / 100;
      case 'J':
        return Math.round(energy * 3600);
      case 'kJ':
        return Math.round(energy * 3.6 * 100) / 100;
      default:
        return Math.round(energy * 100) / 100;
    }
  }

  /**
   * Estimate energy consumption
   */
  private estimateEnergyConsumption(data: StorageData): number {
    // Simplified consumption estimation based on historical data
    if (this.storageHistory.length < 2) return 0;

    const recent = this.storageHistory.slice(-10);
    const energyChanges = recent.slice(1).map((entry, index) => {
      const prev = recent[index];
      const timeDiff = (entry.timestamp - prev.timestamp) / 1000 / 3600; // hours
      const energyDiff = prev.data.currentStoredEnergy - entry.data.currentStoredEnergy;
      return energyDiff / timeDiff; // Wh/h
    });

    return energyChanges.length > 0 ? 
      energyChanges.reduce((sum, change) => sum + Math.max(0, change), 0) / energyChanges.length : 0;
  }

  /**
   * Calculate charging efficiency
   */
  private calculateChargingEfficiency(data: StorageData): number {
    // Simplified efficiency calculation
    const theoreticalMaxRate = data.batteryCapacity * 0.1; // 10% of capacity per hour
    return data.chargingRate > 0 ? Math.min(data.chargingRate / theoreticalMaxRate, 1) * 100 : 0;
  }

  /**
   * Calculate average charging efficiency
   */
  private calculateAverageChargingEfficiency(): number {
    const chargingEntries = this.storageHistory.filter(entry => entry.data.chargingRate > 0);
    if (chargingEntries.length === 0) return 0;

    const efficiencies = chargingEntries.map(entry => this.calculateChargingEfficiency(entry.data));
    return efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length;
  }

  /**
   * Calculate optimal charging rate
   */
  private calculateOptimalChargingRate(data: StorageData): number {
    // Optimal rate depends on SOC and temperature
    let optimalRate = data.batteryCapacity * 0.1; // Base 10% of capacity

    // Reduce rate when battery is nearly full
    if (data.batterySOC > 0.8) {
      optimalRate *= (1 - data.batterySOC) * 5; // Taper charging
    }

    // Adjust for temperature
    if (data.batteryTemperature > 35) {
      optimalRate *= 0.8; // Reduce rate in high temperature
    } else if (data.batteryTemperature < 10) {
      optimalRate *= 0.6; // Reduce rate in low temperature
    }

    return Math.round(optimalRate);
  }

  /**
   * Calculate efficiency trend
   */
  private calculateEfficiencyTrend(): 'improving' | 'stable' | 'declining' {
    if (this.storageHistory.length < 20) return 'stable';

    const recent = this.storageHistory.slice(-10);
    const older = this.storageHistory.slice(-20, -10);

    const recentAvgEff = recent.reduce((sum, entry) => 
      sum + this.calculateChargingEfficiency(entry.data), 0) / recent.length;
    const olderAvgEff = older.reduce((sum, entry) => 
      sum + this.calculateChargingEfficiency(entry.data), 0) / older.length;

    const change = (recentAvgEff - olderAvgEff) / olderAvgEff;

    if (change > 0.05) return 'improving';
    if (change < -0.05) return 'declining';
    return 'stable';
  }

  /**
   * Estimate cycle count
   */
  private estimateCycleCount(): number {
    // Simplified cycle count estimation
    return Math.floor(this.storageHistory.length / 100); // Rough estimate
  }

  /**
   * Estimate battery age
   */
  private estimateBatteryAge(): number {
    // Simplified age estimation
    return Math.floor(this.storageHistory.length / 1440 / 30); // Rough estimate in months
  }

  /**
   * Assess temperature impact
   */
  private assessTemperatureImpact(temperature: number): 'positive' | 'neutral' | 'negative' {
    if (temperature >= 15 && temperature <= 25) return 'positive';
    if (temperature >= 10 && temperature <= 35) return 'neutral';
    return 'negative';
  }

  /**
   * Assess charging pattern impact
   */
  private assessChargingPatternImpact(): 'optimal' | 'good' | 'suboptimal' {
    // Simplified assessment based on charging frequency and depth
    const chargingEvents = this.storageHistory.filter(entry => entry.data.chargingRate > 0);
    const deepDischarges = this.storageHistory.filter(entry => entry.data.batterySOC < 0.2);

    if (deepDischarges.length / this.storageHistory.length > 0.1) return 'suboptimal';
    if (chargingEvents.length / this.storageHistory.length > 0.3) return 'optimal';
    return 'good';
  }

  /**
   * Estimate remaining life
   */
  private estimateRemainingLife(health: number): { value: number; unit: 'months' | 'years' } {
    const degradationRate = (1 - health) / this.estimateBatteryAge(); // per month
    const remainingHealth = health - 0.6; // Assume replacement at 60% health
    const remainingMonths = remainingHealth / degradationRate;

    if (remainingMonths > 24) {
      return { value: Math.round(remainingMonths / 12), unit: 'years' };
    } else {
      return { value: Math.round(remainingMonths), unit: 'months' };
    }
  }

  /**
   * Get temperature status
   */
  private getTemperatureStatus(temperature: number): 'good' | 'warning' | 'critical' {
    if (temperature > 45 || temperature < -10) return 'critical';
    if (temperature > 35 || temperature < 5) return 'warning';
    return 'good';
  }

  /**
   * Get SOC status
   */
  private getSOCStatus(soc: number): 'good' | 'warning' | 'critical' {
    if (soc < 0.15) return 'critical';
    if (soc < 0.25) return 'warning';
    return 'good';
  }

  /**
   * Calculate overall rating
   */
  private calculateOverallRating(data: StorageData): 'excellent' | 'good' | 'fair' | 'poor' {
    const healthScore = data.batteryHealth * 100;
    const tempStatus = this.getTemperatureStatus(data.batteryTemperature);
    const socStatus = this.getSOCStatus(data.batterySOC);

    if (healthScore > 85 && tempStatus === 'good' && socStatus === 'good') return 'excellent';
    if (healthScore > 70 && tempStatus !== 'critical' && socStatus !== 'critical') return 'good';
    if (healthScore > 55 && tempStatus !== 'critical') return 'fair';
    return 'poor';
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(data: StorageData): string[] {
    const recommendations: string[] = [];

    if (data.batterySOC < 0.3) {
      recommendations.push('Charge battery soon to avoid deep discharge');
    }

    if (data.batteryTemperature > 35) {
      recommendations.push('Allow battery to cool before heavy charging');
    }

    if (data.batteryHealth < 0.8) {
      recommendations.push('Schedule battery health check with service technician');
    }

    if (data.chargingRate === 0 && data.batterySOC < 0.8) {
      recommendations.push('Consider enabling energy harvesting mode for optimal charging');
    }

    return recommendations;
  }
}