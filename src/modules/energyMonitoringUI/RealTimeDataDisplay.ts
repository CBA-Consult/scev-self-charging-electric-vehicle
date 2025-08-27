/**
 * Real-Time Data Display Component
 * 
 * Provides real-time visualization of energy generation data from the suspension system.
 */

import { RealTimeEnergyData, EnergySourceStatus, DashboardConfiguration } from './types';

export interface DisplayMetrics {
  /** Current power generation (W) */
  currentPower: number;
  /** Power trend over last minute */
  powerTrend: 'increasing' | 'decreasing' | 'stable';
  /** Efficiency percentage */
  efficiencyPercentage: number;
  /** Energy harvesting rate (J/s) */
  harvestingRate: number;
  /** System status indicator */
  systemStatus: 'optimal' | 'good' | 'warning' | 'error';
}

export interface PowerDistributionData {
  /** Power by source with percentages */
  sources: Array<{
    name: string;
    power: number;
    percentage: number;
    color: string;
    isActive: boolean;
  }>;
  /** Total power */
  totalPower: number;
}

export interface OperatingConditionsDisplay {
  /** Vehicle speed with units */
  vehicleSpeed: { value: number; unit: string; status: 'normal' | 'high' | 'low' };
  /** Road condition with color coding */
  roadCondition: { condition: string; color: string; description: string };
  /** Temperature readings */
  temperatures: {
    ambient: { value: number; unit: string; status: 'normal' | 'high' | 'low' };
    system: { value: number; unit: string; status: 'normal' | 'high' | 'low' };
  };
}

export class RealTimeDataDisplay {
  private config: DashboardConfiguration;
  private updateCallbacks: Array<(data: DisplayMetrics) => void> = [];
  private powerHistory: number[] = [];
  private maxHistoryLength: number = 60; // 1 minute of data at 1Hz

  constructor(config: DashboardConfiguration) {
    this.config = config;
  }

  /**
   * Process real-time energy data for display
   */
  public processRealTimeData(data: RealTimeEnergyData): DisplayMetrics {
    // Update power history for trend analysis
    this.powerHistory.push(data.totalPowerGeneration);
    if (this.powerHistory.length > this.maxHistoryLength) {
      this.powerHistory.shift();
    }

    const displayMetrics: DisplayMetrics = {
      currentPower: this.formatPowerValue(data.totalPowerGeneration),
      powerTrend: this.calculatePowerTrend(),
      efficiencyPercentage: Math.round(data.overallEfficiency * 100),
      harvestingRate: data.energyHarvestingRate,
      systemStatus: this.determineSystemStatus(data)
    };

    // Notify subscribers
    this.updateCallbacks.forEach(callback => callback(displayMetrics));

    return displayMetrics;
  }

  /**
   * Get power distribution data for visualization
   */
  public getPowerDistributionData(data: RealTimeEnergyData): PowerDistributionData {
    const sources = [
      {
        name: 'Electromagnetic Shock Absorber',
        power: data.powerBySource.electromagneticShockAbsorber,
        color: '#FF6B6B',
        isActive: data.powerBySource.electromagneticShockAbsorber > 0
      },
      {
        name: 'Hydraulic Regenerative Damper',
        power: data.powerBySource.hydraulicRegenerativeDamper,
        color: '#4ECDC4',
        isActive: data.powerBySource.hydraulicRegenerativeDamper > 0
      },
      {
        name: 'Piezoelectric Harvester',
        power: data.powerBySource.piezoelectricHarvester,
        color: '#45B7D1',
        isActive: data.powerBySource.piezoelectricHarvester > 0
      },
      {
        name: 'Vibration Harvesting',
        power: data.powerBySource.vibrationHarvesting,
        color: '#96CEB4',
        isActive: data.powerBySource.vibrationHarvesting > 0
      }
    ];

    const totalPower = data.totalPowerGeneration;

    return {
      sources: sources.map(source => ({
        ...source,
        percentage: totalPower > 0 ? (source.power / totalPower) * 100 : 0
      })),
      totalPower: this.formatPowerValue(totalPower)
    };
  }

  /**
   * Get operating conditions display data
   */
  public getOperatingConditionsDisplay(data: RealTimeEnergyData): OperatingConditionsDisplay {
    return {
      vehicleSpeed: {
        value: data.operatingConditions.vehicleSpeed,
        unit: 'km/h',
        status: this.getSpeedStatus(data.operatingConditions.vehicleSpeed)
      },
      roadCondition: this.getRoadConditionDisplay(data.operatingConditions.roadCondition),
      temperatures: {
        ambient: {
          value: this.convertTemperature(data.operatingConditions.ambientTemperature),
          unit: this.config.temperatureUnits === 'F' ? '°F' : '°C',
          status: this.getTemperatureStatus(data.operatingConditions.ambientTemperature, 'ambient')
        },
        system: {
          value: this.convertTemperature(data.operatingConditions.systemTemperature),
          unit: this.config.temperatureUnits === 'F' ? '°F' : '°C',
          status: this.getTemperatureStatus(data.operatingConditions.systemTemperature, 'system')
        }
      }
    };
  }

  /**
   * Generate real-time chart data
   */
  public generateChartData(timeRange: number = 300): Array<{
    timestamp: number;
    power: number;
    efficiency: number;
  }> {
    const now = Date.now();
    const startTime = now - (timeRange * 1000);
    
    // Generate sample data points (in real implementation, this would come from historical data)
    const dataPoints = [];
    for (let i = 0; i < timeRange; i += 5) { // Data point every 5 seconds
      const timestamp = startTime + (i * 1000);
      const powerIndex = Math.max(0, this.powerHistory.length - Math.floor((timeRange - i) / 5) - 1);
      const power = this.powerHistory[powerIndex] || 0;
      
      dataPoints.push({
        timestamp,
        power,
        efficiency: this.calculateEfficiencyAtTime(timestamp)
      });
    }
    
    return dataPoints;
  }

  /**
   * Get electrical data display
   */
  public getElectricalDataDisplay(data: RealTimeEnergyData): {
    voltage: { value: number; unit: string; status: 'normal' | 'high' | 'low' };
    current: { value: number; unit: string; status: 'normal' | 'high' | 'low' };
    frequency: { value: number; unit: string; status: 'normal' | 'high' | 'low' };
    powerFactor: { value: number; unit: string; status: 'normal' | 'high' | 'low' };
  } {
    return {
      voltage: {
        value: Math.round(data.electricalData.voltage * 10) / 10,
        unit: 'V',
        status: this.getVoltageStatus(data.electricalData.voltage)
      },
      current: {
        value: Math.round(data.electricalData.current * 100) / 100,
        unit: 'A',
        status: this.getCurrentStatus(data.electricalData.current)
      },
      frequency: {
        value: data.electricalData.frequency,
        unit: 'Hz',
        status: this.getFrequencyStatus(data.electricalData.frequency)
      },
      powerFactor: {
        value: Math.round(this.calculatePowerFactor(data) * 100) / 100,
        unit: '',
        status: 'normal'
      }
    };
  }

  /**
   * Subscribe to real-time updates
   */
  public subscribe(callback: (data: DisplayMetrics) => void): () => void {
    this.updateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Update dashboard configuration
   */
  public updateConfiguration(newConfig: Partial<DashboardConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Format power value according to configuration
   */
  private formatPowerValue(power: number): number {
    if (this.config.powerUnits === 'kW') {
      return Math.round(power / 1000 * 100) / 100;
    }
    return Math.round(power * 100) / 100;
  }

  /**
   * Calculate power trend
   */
  private calculatePowerTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.powerHistory.length < 10) return 'stable';
    
    const recent = this.powerHistory.slice(-10);
    const older = this.powerHistory.slice(-20, -10);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    const threshold = 0.05; // 5% change threshold
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > threshold) return 'increasing';
    if (change < -threshold) return 'decreasing';
    return 'stable';
  }

  /**
   * Determine system status
   */
  private determineSystemStatus(data: RealTimeEnergyData): 'optimal' | 'good' | 'warning' | 'error' {
    const efficiency = data.overallEfficiency;
    const temperature = data.operatingConditions.systemTemperature;
    
    if (temperature > 90) return 'error';
    if (temperature > 80 || efficiency < 0.5) return 'warning';
    if (efficiency > 0.8 && temperature < 60) return 'optimal';
    return 'good';
  }

  /**
   * Get speed status
   */
  private getSpeedStatus(speed: number): 'normal' | 'high' | 'low' {
    if (speed > 120) return 'high';
    if (speed < 30) return 'low';
    return 'normal';
  }

  /**
   * Get road condition display
   */
  private getRoadConditionDisplay(condition: string): { condition: string; color: string; description: string } {
    const conditions = {
      'smooth': { color: '#4CAF50', description: 'Optimal for energy harvesting' },
      'rough': { color: '#FF9800', description: 'Good energy harvesting potential' },
      'very_rough': { color: '#F44336', description: 'High energy harvesting, check comfort' }
    };
    
    return {
      condition: condition.replace('_', ' ').toUpperCase(),
      color: conditions[condition as keyof typeof conditions]?.color || '#9E9E9E',
      description: conditions[condition as keyof typeof conditions]?.description || 'Unknown condition'
    };
  }

  /**
   * Convert temperature based on configuration
   */
  private convertTemperature(celsius: number): number {
    if (this.config.temperatureUnits === 'F') {
      return Math.round((celsius * 9/5 + 32) * 10) / 10;
    }
    return Math.round(celsius * 10) / 10;
  }

  /**
   * Get temperature status
   */
  private getTemperatureStatus(temperature: number, type: 'ambient' | 'system'): 'normal' | 'high' | 'low' {
    if (type === 'system') {
      if (temperature > 80) return 'high';
      if (temperature < 10) return 'low';
    } else {
      if (temperature > 35) return 'high';
      if (temperature < 0) return 'low';
    }
    return 'normal';
  }

  /**
   * Get voltage status
   */
  private getVoltageStatus(voltage: number): 'normal' | 'high' | 'low' {
    if (voltage > 15) return 'high';
    if (voltage < 10) return 'low';
    return 'normal';
  }

  /**
   * Get current status
   */
  private getCurrentStatus(current: number): 'normal' | 'high' | 'low' {
    if (current > 10) return 'high';
    if (current < 0.1) return 'low';
    return 'normal';
  }

  /**
   * Get frequency status
   */
  private getFrequencyStatus(frequency: number): 'normal' | 'high' | 'low' {
    if (frequency > 60) return 'high';
    if (frequency < 45) return 'low';
    return 'normal';
  }

  /**
   * Calculate power factor
   */
  private calculatePowerFactor(data: RealTimeEnergyData): number {
    // Simplified power factor calculation
    const apparentPower = data.electricalData.voltage * data.electricalData.current;
    if (apparentPower === 0) return 1;
    return Math.min(data.totalPowerGeneration / apparentPower, 1);
  }

  /**
   * Calculate efficiency at specific time (placeholder)
   */
  private calculateEfficiencyAtTime(timestamp: number): number {
    // In real implementation, this would retrieve historical efficiency data
    return 0.75 + Math.random() * 0.2; // Random efficiency between 75-95%
  }

  /**
   * Get performance indicators
   */
  public getPerformanceIndicators(data: RealTimeEnergyData): {
    powerGeneration: { value: number; trend: string; color: string };
    efficiency: { value: number; trend: string; color: string };
    systemHealth: { value: number; status: string; color: string };
  } {
    const powerTrend = this.calculatePowerTrend();
    const efficiency = data.overallEfficiency;
    const systemStatus = this.determineSystemStatus(data);
    
    return {
      powerGeneration: {
        value: this.formatPowerValue(data.totalPowerGeneration),
        trend: powerTrend,
        color: this.getTrendColor(powerTrend)
      },
      efficiency: {
        value: Math.round(efficiency * 100),
        trend: efficiency > 0.8 ? 'excellent' : efficiency > 0.6 ? 'good' : 'needs improvement',
        color: efficiency > 0.8 ? '#4CAF50' : efficiency > 0.6 ? '#FF9800' : '#F44336'
      },
      systemHealth: {
        value: this.calculateSystemHealthScore(data),
        status: systemStatus,
        color: this.getStatusColor(systemStatus)
      }
    };
  }

  /**
   * Get trend color
   */
  private getTrendColor(trend: string): string {
    switch (trend) {
      case 'increasing': return '#4CAF50';
      case 'decreasing': return '#F44336';
      default: return '#FF9800';
    }
  }

  /**
   * Get status color
   */
  private getStatusColor(status: string): string {
    switch (status) {
      case 'optimal': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  }

  /**
   * Calculate system health score
   */
  private calculateSystemHealthScore(data: RealTimeEnergyData): number {
    let score = 100;
    
    // Deduct points for high temperature
    if (data.operatingConditions.systemTemperature > 80) {
      score -= 20;
    } else if (data.operatingConditions.systemTemperature > 70) {
      score -= 10;
    }
    
    // Deduct points for low efficiency
    if (data.overallEfficiency < 0.5) {
      score -= 30;
    } else if (data.overallEfficiency < 0.7) {
      score -= 15;
    }
    
    // Deduct points for low power generation
    if (data.totalPowerGeneration < 10) {
      score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }
}