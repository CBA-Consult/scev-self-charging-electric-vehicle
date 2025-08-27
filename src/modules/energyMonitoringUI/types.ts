/**
 * Type definitions for Energy Monitoring UI
 */

export interface EnergyMonitoringData {
  /** Timestamp of the data collection */
  timestamp: number;
  /** Real-time energy generation data */
  realTimeData: RealTimeEnergyData;
  /** Energy storage information */
  storageData: StorageData;
  /** Usage statistics */
  usageStats: UsageStatistics;
  /** System alerts and warnings */
  alerts: MonitoringAlert[];
}

export interface RealTimeEnergyData {
  /** Total power generation from all sources (W) */
  totalPowerGeneration: number;
  /** Power generation by source */
  powerBySource: {
    electromagneticShockAbsorber: number;
    hydraulicRegenerativeDamper: number;
    piezoelectricHarvester: number;
    vibrationHarvesting: number;
  };
  /** System efficiency (0-1) */
  overallEfficiency: number;
  /** Current energy harvesting rate (J/s) */
  energyHarvestingRate: number;
  /** Instantaneous voltage and current */
  electricalData: {
    voltage: number;
    current: number;
    frequency: number;
  };
  /** Operating conditions */
  operatingConditions: {
    vehicleSpeed: number;
    roadCondition: string;
    ambientTemperature: number;
    systemTemperature: number;
  };
}

export interface StorageData {
  /** Battery state of charge (0-1) */
  batterySOC: number;
  /** Battery capacity (Wh) */
  batteryCapacity: number;
  /** Current stored energy (Wh) */
  currentStoredEnergy: number;
  /** Battery voltage (V) */
  batteryVoltage: number;
  /** Charging rate (W) */
  chargingRate: number;
  /** Estimated time to full charge (minutes) */
  timeToFullCharge: number;
  /** Battery health (0-1) */
  batteryHealth: number;
  /** Battery temperature (°C) */
  batteryTemperature: number;
}

export interface UsageStatistics {
  /** Total energy harvested today (Wh) */
  dailyEnergyHarvested: number;
  /** Total energy harvested this week (Wh) */
  weeklyEnergyHarvested: number;
  /** Total energy harvested this month (Wh) */
  monthlyEnergyHarvested: number;
  /** Total lifetime energy harvested (kWh) */
  lifetimeEnergyHarvested: number;
  /** Average daily energy generation (Wh) */
  averageDailyGeneration: number;
  /** Peak power generation today (W) */
  peakPowerToday: number;
  /** Energy consumption statistics */
  consumption: {
    dailyConsumption: number;
    weeklyConsumption: number;
    monthlyConsumption: number;
    averageConsumption: number;
  };
  /** Efficiency trends */
  efficiencyTrends: {
    current: number;
    daily: number;
    weekly: number;
    monthly: number;
  };
  /** Operating time statistics */
  operatingTime: {
    totalOperatingHours: number;
    energyHarvestingHours: number;
    systemUptime: number;
  };
}

export interface OptimizationSuggestion {
  /** Unique identifier for the suggestion */
  id: string;
  /** Priority level (1-5, where 5 is highest) */
  priority: number;
  /** Category of optimization */
  category: 'efficiency' | 'maintenance' | 'driving' | 'system';
  /** Title of the suggestion */
  title: string;
  /** Detailed description */
  description: string;
  /** Potential energy savings (Wh/day) */
  potentialSavings: number;
  /** Implementation difficulty (1-5) */
  difficulty: number;
  /** Estimated implementation time (hours) */
  implementationTime: number;
  /** Whether the suggestion is actionable by the user */
  userActionable: boolean;
}

export interface MonitoringAlert {
  /** Unique identifier for the alert */
  id: string;
  /** Alert severity */
  severity: 'info' | 'warning' | 'error' | 'critical';
  /** Alert category */
  category: 'performance' | 'temperature' | 'battery' | 'system' | 'maintenance';
  /** Alert title */
  title: string;
  /** Alert message */
  message: string;
  /** Timestamp when alert was generated */
  timestamp: number;
  /** Whether the alert has been acknowledged */
  acknowledged: boolean;
  /** Recommended actions */
  recommendedActions: string[];
}

export interface DashboardConfiguration {
  /** Refresh rate for real-time data (ms) */
  refreshRate: number;
  /** Units for energy display */
  energyUnits: 'Wh' | 'kWh' | 'J' | 'kJ';
  /** Units for power display */
  powerUnits: 'W' | 'kW';
  /** Temperature units */
  temperatureUnits: 'C' | 'F';
  /** Theme configuration */
  theme: {
    darkMode: boolean;
    primaryColor: string;
    accentColor: string;
  };
  /** Display preferences */
  display: {
    showDetailedMetrics: boolean;
    showOptimizationSuggestions: boolean;
    showAlerts: boolean;
    compactMode: boolean;
  };
  /** Alert preferences */
  alerts: {
    enableSoundAlerts: boolean;
    enablePushNotifications: boolean;
    minimumSeverity: 'info' | 'warning' | 'error' | 'critical';
  };
}

export interface EnergySourceStatus {
  /** Source identifier */
  sourceId: string;
  /** Source name */
  name: string;
  /** Whether the source is currently active */
  isActive: boolean;
  /** Current power output (W) */
  currentPower: number;
  /** Efficiency rating (0-1) */
  efficiency: number;
  /** Operating temperature (°C) */
  temperature: number;
  /** Total energy generated by this source (Wh) */
  totalEnergyGenerated: number;
  /** Last update timestamp */
  lastUpdate: number;
}

export interface HistoricalDataPoint {
  /** Timestamp */
  timestamp: number;
  /** Power generation (W) */
  power: number;
  /** Energy harvested (Wh) */
  energy: number;
  /** System efficiency (0-1) */
  efficiency: number;
  /** Battery SOC (0-1) */
  batterySOC: number;
}

export interface PerformanceMetrics {
  /** Energy generation efficiency over time */
  generationEfficiency: {
    current: number;
    average: number;
    peak: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  /** System reliability metrics */
  reliability: {
    uptime: number;
    errorRate: number;
    maintenanceAlerts: number;
  };
  /** Environmental impact */
  environmentalImpact: {
    co2Saved: number; // kg CO2
    fuelSaved: number; // liters
    costSavings: number; // currency units
  };
}