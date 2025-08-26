/**
 * Energy Monitoring Dashboard
 * 
 * Main dashboard component that orchestrates all energy monitoring UI components
 * and provides a comprehensive interface for monitoring energy harvested from
 * the suspension system.
 */

import { EnergyDataAggregator, AggregatorInputs } from './EnergyDataAggregator';
import { RealTimeDataDisplay } from './RealTimeDataDisplay';
import { StorageLevelMonitor } from './StorageLevelMonitor';
import { UsageStatisticsTracker } from './UsageStatisticsTracker';
import { OptimizationRecommendations } from './OptimizationRecommendations';
import { 
  EnergyMonitoringData, 
  DashboardConfiguration, 
  MonitoringAlert,
  OptimizationSuggestion,
  PerformanceMetrics
} from './types';

export interface DashboardState {
  /** Whether the dashboard is currently active */
  isActive: boolean;
  /** Current refresh rate */
  refreshRate: number;
  /** Last update timestamp */
  lastUpdate: number;
  /** Number of active alerts */
  activeAlerts: number;
  /** System status */
  systemStatus: 'optimal' | 'good' | 'warning' | 'error' | 'offline';
}

export interface DashboardLayout {
  /** Layout identifier */
  id: string;
  /** Layout name */
  name: string;
  /** Widget configuration */
  widgets: Array<{
    id: string;
    type: 'realtime' | 'storage' | 'statistics' | 'optimization' | 'alerts';
    position: { x: number; y: number; width: number; height: number };
    visible: boolean;
    config: any;
  }>;
}

export interface DashboardMetrics {
  /** Total energy harvested today */
  todayEnergyHarvested: number;
  /** Current power generation */
  currentPowerGeneration: number;
  /** System efficiency */
  systemEfficiency: number;
  /** Battery level */
  batteryLevel: number;
  /** Active alerts count */
  activeAlertsCount: number;
  /** System uptime */
  systemUptime: number;
}

export class EnergyMonitoringDashboard {
  private dataAggregator: EnergyDataAggregator;
  private realTimeDisplay: RealTimeDataDisplay;
  private storageMonitor: StorageLevelMonitor;
  private statisticsTracker: UsageStatisticsTracker;
  private optimizationEngine: OptimizationRecommendations;
  
  private config: DashboardConfiguration;
  private state: DashboardState;
  private currentLayout: DashboardLayout;
  private updateInterval: NodeJS.Timeout | null = null;
  
  private subscribers: Map<string, Array<(data: any) => void>> = new Map();
  private alertHistory: MonitoringAlert[] = [];
  private maxAlertHistory: number = 100;

  constructor(config?: Partial<DashboardConfiguration>) {
    // Initialize with default configuration
    this.config = {
      refreshRate: 1000, // 1 second
      energyUnits: 'Wh',
      powerUnits: 'W',
      temperatureUnits: 'C',
      theme: {
        darkMode: false,
        primaryColor: '#2196F3',
        accentColor: '#FF9800'
      },
      display: {
        showDetailedMetrics: true,
        showOptimizationSuggestions: true,
        showAlerts: true,
        compactMode: false
      },
      alerts: {
        enableSoundAlerts: true,
        enablePushNotifications: true,
        minimumSeverity: 'warning'
      },
      ...config
    };

    // Initialize state
    this.state = {
      isActive: false,
      refreshRate: this.config.refreshRate,
      lastUpdate: 0,
      activeAlerts: 0,
      systemStatus: 'offline'
    };

    // Initialize components
    this.dataAggregator = new EnergyDataAggregator();
    this.realTimeDisplay = new RealTimeDataDisplay(this.config);
    this.storageMonitor = new StorageLevelMonitor(this.config);
    this.statisticsTracker = new UsageStatisticsTracker(this.config);
    this.optimizationEngine = new OptimizationRecommendations();

    // Initialize default layout
    this.currentLayout = this.createDefaultLayout();

    // Set up alert subscriptions
    this.setupAlertSubscriptions();
  }

  /**
   * Start the dashboard monitoring
   */
  public start(): void {
    if (this.state.isActive) {
      return;
    }

    this.state.isActive = true;
    this.state.systemStatus = 'good';
    
    // Start periodic updates
    this.updateInterval = setInterval(() => {
      this.performUpdate();
    }, this.config.refreshRate);

    this.notifySubscribers('dashboard-state', this.state);
  }

  /**
   * Stop the dashboard monitoring
   */
  public stop(): void {
    if (!this.state.isActive) {
      return;
    }

    this.state.isActive = false;
    this.state.systemStatus = 'offline';
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.notifySubscribers('dashboard-state', this.state);
  }

  /**
   * Update dashboard with new energy data
   */
  public updateEnergyData(inputs: AggregatorInputs): EnergyMonitoringData {
    const monitoringData = this.dataAggregator.aggregateEnergyData(inputs);
    
    // Process data through components
    const realTimeMetrics = this.realTimeDisplay.processRealTimeData(monitoringData.realTimeData);
    const storageDisplay = this.storageMonitor.processStorageData(monitoringData.storageData);
    
    // Add data point to statistics tracker
    this.statisticsTracker.addDataPoint({
      timestamp: monitoringData.timestamp,
      power: monitoringData.realTimeData.totalPowerGeneration,
      energy: monitoringData.realTimeData.totalPowerGeneration * (this.config.refreshRate / 1000 / 3600), // Convert to Wh
      efficiency: monitoringData.realTimeData.overallEfficiency,
      batterySOC: monitoringData.storageData.batterySOC
    });

    // Process alerts
    this.processAlerts(monitoringData.alerts);
    
    // Update state
    this.state.lastUpdate = monitoringData.timestamp;
    this.state.activeAlerts = this.getActiveAlertsCount();
    this.state.systemStatus = this.determineSystemStatus(monitoringData);

    // Notify subscribers
    this.notifySubscribers('energy-data', monitoringData);
    this.notifySubscribers('real-time-metrics', realTimeMetrics);
    this.notifySubscribers('storage-display', storageDisplay);

    return monitoringData;
  }

  /**
   * Get current dashboard metrics
   */
  public getDashboardMetrics(): DashboardMetrics {
    const usageStats = this.statisticsTracker.calculateUsageStatistics();
    const systemSummary = this.dataAggregator.getSystemSummary();
    
    return {
      todayEnergyHarvested: usageStats.dailyEnergyHarvested,
      currentPowerGeneration: systemSummary.totalPowerGeneration,
      systemEfficiency: systemSummary.averageEfficiency,
      batteryLevel: 0, // Would be updated with real data
      activeAlertsCount: this.state.activeAlerts,
      systemUptime: usageStats.operatingTime.systemUptime
    };
  }

  /**
   * Get optimization recommendations
   */
  public getOptimizationRecommendations(): OptimizationSuggestion[] {
    const usageStats = this.statisticsTracker.calculateUsageStatistics();
    const historicalData = this.dataAggregator.getHistoricalData();
    
    // Create optimization context
    const context = {
      energyData: {
        totalPowerGeneration: 0,
        powerBySource: {
          electromagneticShockAbsorber: 0,
          hydraulicRegenerativeDamper: 0,
          piezoelectricHarvester: 0,
          vibrationHarvesting: 0
        },
        overallEfficiency: 0.8,
        energyHarvestingRate: 0,
        electricalData: { voltage: 12, current: 0, frequency: 50 },
        operatingConditions: {
          vehicleSpeed: 60,
          roadCondition: 'smooth',
          ambientTemperature: 25,
          systemTemperature: 45
        }
      },
      storageData: {
        batterySOC: 0.7,
        batteryCapacity: 100,
        currentStoredEnergy: 70,
        batteryVoltage: 12,
        chargingRate: 0,
        timeToFullCharge: 0,
        batteryHealth: 0.9,
        batteryTemperature: 25
      },
      usageStats,
      historicalData
    };

    return this.optimizationEngine.generateRecommendations(context);
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return this.statisticsTracker.getPerformanceMetrics();
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): MonitoringAlert[] {
    return this.alertHistory.filter(alert => !alert.acknowledged);
  }

  /**
   * Acknowledge alert
   */
  public acknowledgeAlert(alertId: string): void {
    const alert = this.alertHistory.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.state.activeAlerts = this.getActiveAlertsCount();
      this.notifySubscribers('alerts', this.getActiveAlerts());
    }
  }

  /**
   * Update dashboard configuration
   */
  public updateConfiguration(newConfig: Partial<DashboardConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update component configurations
    this.realTimeDisplay.updateConfiguration(this.config);
    
    // Update refresh rate if changed
    if (newConfig.refreshRate && newConfig.refreshRate !== this.state.refreshRate) {
      this.state.refreshRate = newConfig.refreshRate;
      
      if (this.state.isActive) {
        this.stop();
        this.start();
      }
    }

    this.notifySubscribers('config-updated', this.config);
  }

  /**
   * Get dashboard layout
   */
  public getLayout(): DashboardLayout {
    return { ...this.currentLayout };
  }

  /**
   * Update dashboard layout
   */
  public updateLayout(layout: DashboardLayout): void {
    this.currentLayout = { ...layout };
    this.notifySubscribers('layout-updated', this.currentLayout);
  }

  /**
   * Export dashboard data
   */
  public exportData(format: 'json' | 'csv' = 'json'): string {
    const data = {
      timestamp: Date.now(),
      configuration: this.config,
      state: this.state,
      metrics: this.getDashboardMetrics(),
      statistics: this.statisticsTracker.calculateUsageStatistics(),
      performanceMetrics: this.getPerformanceMetrics(),
      alerts: this.alertHistory,
      recommendations: this.getOptimizationRecommendations()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      return this.convertToCSV(data);
    }
  }

  /**
   * Subscribe to dashboard events
   */
  public subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    
    this.subscribers.get(event)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Get dashboard status
   */
  public getStatus(): DashboardState {
    return { ...this.state };
  }

  /**
   * Reset dashboard data
   */
  public reset(): void {
    this.alertHistory = [];
    this.statisticsTracker.clearHistoricalData();
    this.dataAggregator.clearHistoricalData();
    
    this.state.activeAlerts = 0;
    this.state.lastUpdate = 0;
    
    this.notifySubscribers('dashboard-reset', {});
  }

  /**
   * Get widget data for specific widget type
   */
  public getWidgetData(widgetType: string): any {
    switch (widgetType) {
      case 'realtime':
        return this.realTimeDisplay.getPerformanceIndicators({
          totalPowerGeneration: 0,
          powerBySource: {
            electromagneticShockAbsorber: 0,
            hydraulicRegenerativeDamper: 0,
            piezoelectricHarvester: 0,
            vibrationHarvesting: 0
          },
          overallEfficiency: 0.8,
          energyHarvestingRate: 0,
          electricalData: { voltage: 12, current: 0, frequency: 50 },
          operatingConditions: {
            vehicleSpeed: 60,
            roadCondition: 'smooth',
            ambientTemperature: 25,
            systemTemperature: 45
          }
        });
      
      case 'storage':
        return this.storageMonitor.getBatteryPerformanceSummary({
          batterySOC: 0.7,
          batteryCapacity: 100,
          currentStoredEnergy: 70,
          batteryVoltage: 12,
          chargingRate: 0,
          timeToFullCharge: 0,
          batteryHealth: 0.9,
          batteryTemperature: 25
        });
      
      case 'statistics':
        return this.statisticsTracker.calculateUsageStatistics();
      
      case 'optimization':
        return this.getOptimizationRecommendations();
      
      case 'alerts':
        return this.getActiveAlerts();
      
      default:
        return null;
    }
  }

  /**
   * Perform periodic update
   */
  private performUpdate(): void {
    // This would typically be called with real sensor data
    // For now, we'll generate sample data for demonstration
    const sampleInputs: AggregatorInputs = {
      suspensionInputs: {
        verticalVelocity: Math.random() * 2 - 1,
        displacement: Math.random() * 0.1 - 0.05,
        cornerLoad: 400 + Math.random() * 200,
        roadCondition: ['smooth', 'rough', 'very_rough'][Math.floor(Math.random() * 3)] as any,
        vehicleSpeed: 60 + Math.random() * 40,
        ambientTemperature: 20 + Math.random() * 15
      },
      damperInputs: {
        compressionVelocity: Math.random() * 2 - 1,
        displacement: Math.random() * 0.1 - 0.05,
        vehicleSpeed: 60 + Math.random() * 40,
        roadRoughness: Math.random(),
        damperTemperature: 25 + Math.random() * 20,
        batterySOC: 0.7 + Math.random() * 0.3,
        loadFactor: 0.5 + Math.random() * 0.5
      },
      vehicleInputs: {
        speed: 60 + Math.random() * 40,
        acceleration: Math.random() * 2 - 1,
        roadSurface: 'asphalt',
        temperature: 20 + Math.random() * 15,
        humidity: 0.5 + Math.random() * 0.3,
        vibrationLevel: Math.random()
      },
      batteryData: {
        stateOfCharge: 0.7 + Math.random() * 0.3,
        capacity: 100,
        voltage: 12 + Math.random() * 2,
        temperature: 25 + Math.random() * 10,
        health: 0.85 + Math.random() * 0.15
      }
    };

    this.updateEnergyData(sampleInputs);
  }

  /**
   * Setup alert subscriptions
   */
  private setupAlertSubscriptions(): void {
    this.storageMonitor.subscribeToAlerts((alert) => {
      this.processAlerts([alert]);
    });
  }

  /**
   * Process incoming alerts
   */
  private processAlerts(alerts: MonitoringAlert[]): void {
    alerts.forEach(alert => {
      // Check if alert meets minimum severity threshold
      const severityLevels = ['info', 'warning', 'error', 'critical'];
      const alertLevel = severityLevels.indexOf(alert.severity);
      const minLevel = severityLevels.indexOf(this.config.alerts.minimumSeverity);
      
      if (alertLevel >= minLevel) {
        this.alertHistory.push(alert);
        
        // Maintain alert history size
        if (this.alertHistory.length > this.maxAlertHistory) {
          this.alertHistory.shift();
        }
        
        // Trigger alert notifications
        if (this.config.alerts.enableSoundAlerts) {
          this.triggerSoundAlert(alert);
        }
        
        if (this.config.alerts.enablePushNotifications) {
          this.triggerPushNotification(alert);
        }
      }
    });

    this.notifySubscribers('alerts', this.getActiveAlerts());
  }

  /**
   * Get active alerts count
   */
  private getActiveAlertsCount(): number {
    return this.alertHistory.filter(alert => !alert.acknowledged).length;
  }

  /**
   * Determine system status
   */
  private determineSystemStatus(data: EnergyMonitoringData): 'optimal' | 'good' | 'warning' | 'error' | 'offline' {
    const criticalAlerts = data.alerts.filter(alert => alert.severity === 'critical');
    const errorAlerts = data.alerts.filter(alert => alert.severity === 'error');
    const warningAlerts = data.alerts.filter(alert => alert.severity === 'warning');

    if (criticalAlerts.length > 0) return 'error';
    if (errorAlerts.length > 0) return 'error';
    if (warningAlerts.length > 0) return 'warning';
    if (data.realTimeData.overallEfficiency > 0.85) return 'optimal';
    return 'good';
  }

  /**
   * Create default dashboard layout
   */
  private createDefaultLayout(): DashboardLayout {
    return {
      id: 'default',
      name: 'Default Layout',
      widgets: [
        {
          id: 'realtime-power',
          type: 'realtime',
          position: { x: 0, y: 0, width: 6, height: 4 },
          visible: true,
          config: { showPowerDistribution: true }
        },
        {
          id: 'storage-level',
          type: 'storage',
          position: { x: 6, y: 0, width: 6, height: 4 },
          visible: true,
          config: { showHealthMetrics: true }
        },
        {
          id: 'usage-statistics',
          type: 'statistics',
          position: { x: 0, y: 4, width: 8, height: 4 },
          visible: true,
          config: { timeframe: 'week' }
        },
        {
          id: 'optimization',
          type: 'optimization',
          position: { x: 8, y: 4, width: 4, height: 4 },
          visible: true,
          config: { maxRecommendations: 5 }
        },
        {
          id: 'alerts',
          type: 'alerts',
          position: { x: 0, y: 8, width: 12, height: 2 },
          visible: true,
          config: { showAcknowledged: false }
        }
      ]
    };
  }

  /**
   * Notify subscribers
   */
  private notifySubscribers(event: string, data: any): void {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in dashboard subscriber for event ${event}:`, error);
        }
      });
    }
  }

  /**
   * Trigger sound alert
   */
  private triggerSoundAlert(alert: MonitoringAlert): void {
    // Implementation would depend on the platform
    console.log(`Sound alert: ${alert.title}`);
  }

  /**
   * Trigger push notification
   */
  private triggerPushNotification(alert: MonitoringAlert): void {
    // Implementation would depend on the platform
    console.log(`Push notification: ${alert.title} - ${alert.message}`);
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any): string {
    const headers = ['Timestamp', 'Energy Harvested', 'Power Generation', 'Efficiency', 'Battery Level', 'Alerts'];
    const rows = [headers.join(',')];
    
    const metrics = data.metrics;
    rows.push([
      new Date(data.timestamp).toISOString(),
      metrics.todayEnergyHarvested,
      metrics.currentPowerGeneration,
      metrics.systemEfficiency,
      metrics.batteryLevel,
      metrics.activeAlertsCount
    ].join(','));

    return rows.join('\n');
  }
}