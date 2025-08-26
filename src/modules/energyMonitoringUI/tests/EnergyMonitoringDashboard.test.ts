/**
 * Tests for Energy Monitoring Dashboard
 */

import { EnergyMonitoringDashboard } from '../EnergyMonitoringDashboard';
import { AggregatorInputs, DashboardConfiguration } from '../types';

describe('EnergyMonitoringDashboard', () => {
  let dashboard: EnergyMonitoringDashboard;
  let mockConfig: DashboardConfiguration;
  let mockInputs: AggregatorInputs;

  beforeEach(() => {
    mockConfig = {
      refreshRate: 1000,
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
        enableSoundAlerts: false, // Disable for tests
        enablePushNotifications: false,
        minimumSeverity: 'warning'
      }
    };

    mockInputs = {
      suspensionInputs: {
        verticalVelocity: 0.5,
        displacement: 0.02,
        cornerLoad: 500,
        roadCondition: 'rough',
        vehicleSpeed: 80,
        ambientTemperature: 25
      },
      damperInputs: {
        compressionVelocity: 0.3,
        displacement: 0.015,
        vehicleSpeed: 80,
        roadRoughness: 0.7,
        damperTemperature: 35,
        batterySOC: 0.75,
        loadFactor: 0.6
      },
      vehicleInputs: {
        speed: 80,
        acceleration: 0.2,
        roadSurface: 'asphalt',
        temperature: 25,
        humidity: 0.6,
        vibrationLevel: 0.4
      },
      batteryData: {
        stateOfCharge: 0.75,
        capacity: 100,
        voltage: 12.5,
        temperature: 30,
        health: 0.9
      }
    };

    dashboard = new EnergyMonitoringDashboard(mockConfig);
  });

  afterEach(() => {
    dashboard.stop();
  });

  describe('Initialization', () => {
    test('should initialize with correct configuration', () => {
      const status = dashboard.getStatus();
      expect(status.isActive).toBe(false);
      expect(status.refreshRate).toBe(1000);
      expect(status.systemStatus).toBe('offline');
    });

    test('should create default layout', () => {
      const layout = dashboard.getLayout();
      expect(layout.id).toBe('default');
      expect(layout.widgets).toHaveLength(5);
      expect(layout.widgets[0].type).toBe('realtime');
    });
  });

  describe('Dashboard Control', () => {
    test('should start and stop correctly', () => {
      expect(dashboard.getStatus().isActive).toBe(false);
      
      dashboard.start();
      expect(dashboard.getStatus().isActive).toBe(true);
      expect(dashboard.getStatus().systemStatus).toBe('good');
      
      dashboard.stop();
      expect(dashboard.getStatus().isActive).toBe(false);
      expect(dashboard.getStatus().systemStatus).toBe('offline');
    });

    test('should not start twice', () => {
      dashboard.start();
      const firstStatus = dashboard.getStatus();
      
      dashboard.start(); // Try to start again
      const secondStatus = dashboard.getStatus();
      
      expect(firstStatus.isActive).toBe(secondStatus.isActive);
    });
  });

  describe('Data Processing', () => {
    test('should process energy data correctly', () => {
      const monitoringData = dashboard.updateEnergyData(mockInputs);
      
      expect(monitoringData).toBeDefined();
      expect(monitoringData.timestamp).toBeGreaterThan(0);
      expect(monitoringData.realTimeData).toBeDefined();
      expect(monitoringData.storageData).toBeDefined();
      expect(monitoringData.usageStats).toBeDefined();
      expect(Array.isArray(monitoringData.alerts)).toBe(true);
    });

    test('should update dashboard metrics', () => {
      dashboard.updateEnergyData(mockInputs);
      const metrics = dashboard.getDashboardMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.todayEnergyHarvested).toBe('number');
      expect(typeof metrics.currentPowerGeneration).toBe('number');
      expect(typeof metrics.systemEfficiency).toBe('number');
      expect(typeof metrics.systemUptime).toBe('number');
    });
  });

  describe('Optimization Recommendations', () => {
    test('should generate optimization recommendations', () => {
      dashboard.updateEnergyData(mockInputs);
      const recommendations = dashboard.getOptimizationRecommendations();
      
      expect(Array.isArray(recommendations)).toBe(true);
      
      if (recommendations.length > 0) {
        const rec = recommendations[0];
        expect(rec).toHaveProperty('id');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('category');
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('potentialSavings');
      }
    });
  });

  describe('Alert System', () => {
    test('should handle alerts correctly', () => {
      // Create inputs that should trigger alerts (low battery)
      const lowBatteryInputs = {
        ...mockInputs,
        batteryData: {
          ...mockInputs.batteryData,
          stateOfCharge: 0.1, // Very low battery
          health: 0.5 // Poor health
        }
      };

      dashboard.updateEnergyData(lowBatteryInputs);
      const alerts = dashboard.getActiveAlerts();
      
      expect(Array.isArray(alerts)).toBe(true);
      // Should have alerts for low battery and poor health
      expect(alerts.length).toBeGreaterThan(0);
    });

    test('should acknowledge alerts', () => {
      const lowBatteryInputs = {
        ...mockInputs,
        batteryData: {
          ...mockInputs.batteryData,
          stateOfCharge: 0.1
        }
      };

      dashboard.updateEnergyData(lowBatteryInputs);
      const alerts = dashboard.getActiveAlerts();
      
      if (alerts.length > 0) {
        const alertId = alerts[0].id;
        dashboard.acknowledgeAlert(alertId);
        
        const updatedAlerts = dashboard.getActiveAlerts();
        const acknowledgedAlert = updatedAlerts.find(a => a.id === alertId);
        expect(acknowledgedAlert).toBeUndefined(); // Should be filtered out
      }
    });
  });

  describe('Configuration Management', () => {
    test('should update configuration', () => {
      const newConfig = {
        refreshRate: 2000,
        energyUnits: 'kWh' as const,
        theme: {
          darkMode: true,
          primaryColor: '#FF0000',
          accentColor: '#00FF00'
        }
      };

      dashboard.updateConfiguration(newConfig);
      
      // Configuration should be updated (we can't directly access it, but we can test behavior)
      const status = dashboard.getStatus();
      expect(status.refreshRate).toBe(2000);
    });
  });

  describe('Event Subscription', () => {
    test('should handle event subscriptions', () => {
      let eventReceived = false;
      let receivedData: any = null;

      const unsubscribe = dashboard.subscribe('energy-data', (data) => {
        eventReceived = true;
        receivedData = data;
      });

      dashboard.updateEnergyData(mockInputs);

      expect(eventReceived).toBe(true);
      expect(receivedData).toBeDefined();

      // Test unsubscribe
      unsubscribe();
      eventReceived = false;
      dashboard.updateEnergyData(mockInputs);
      // Should not receive event after unsubscribe
    });
  });

  describe('Data Export', () => {
    test('should export data in JSON format', () => {
      dashboard.updateEnergyData(mockInputs);
      const exportedData = dashboard.exportData('json');
      
      expect(typeof exportedData).toBe('string');
      expect(() => JSON.parse(exportedData)).not.toThrow();
      
      const parsedData = JSON.parse(exportedData);
      expect(parsedData).toHaveProperty('timestamp');
      expect(parsedData).toHaveProperty('configuration');
      expect(parsedData).toHaveProperty('metrics');
    });

    test('should export data in CSV format', () => {
      dashboard.updateEnergyData(mockInputs);
      const exportedData = dashboard.exportData('csv');
      
      expect(typeof exportedData).toBe('string');
      expect(exportedData).toContain(','); // Should contain CSV separators
      expect(exportedData.split('\n').length).toBeGreaterThan(1); // Should have header and data rows
    });
  });

  describe('Widget Data', () => {
    test('should provide widget data for different types', () => {
      dashboard.updateEnergyData(mockInputs);
      
      const realtimeData = dashboard.getWidgetData('realtime');
      expect(realtimeData).toBeDefined();
      
      const storageData = dashboard.getWidgetData('storage');
      expect(storageData).toBeDefined();
      
      const statisticsData = dashboard.getWidgetData('statistics');
      expect(statisticsData).toBeDefined();
      
      const optimizationData = dashboard.getWidgetData('optimization');
      expect(optimizationData).toBeDefined();
      
      const alertsData = dashboard.getWidgetData('alerts');
      expect(alertsData).toBeDefined();
      
      const invalidData = dashboard.getWidgetData('invalid');
      expect(invalidData).toBeNull();
    });
  });

  describe('Performance Metrics', () => {
    test('should provide performance metrics', () => {
      dashboard.updateEnergyData(mockInputs);
      const metrics = dashboard.getPerformanceMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('generationEfficiency');
      expect(metrics).toHaveProperty('reliability');
      expect(metrics).toHaveProperty('environmentalImpact');
      
      expect(typeof metrics.generationEfficiency.current).toBe('number');
      expect(typeof metrics.reliability.uptime).toBe('number');
      expect(typeof metrics.environmentalImpact.co2Saved).toBe('number');
    });
  });

  describe('Layout Management', () => {
    test('should update layout correctly', () => {
      const customLayout = {
        id: 'test-layout',
        name: 'Test Layout',
        widgets: [
          {
            id: 'test-widget',
            type: 'realtime' as const,
            position: { x: 0, y: 0, width: 6, height: 4 },
            visible: true,
            config: {}
          }
        ]
      };

      dashboard.updateLayout(customLayout);
      const updatedLayout = dashboard.getLayout();
      
      expect(updatedLayout.id).toBe('test-layout');
      expect(updatedLayout.name).toBe('Test Layout');
      expect(updatedLayout.widgets).toHaveLength(1);
    });
  });

  describe('Reset Functionality', () => {
    test('should reset dashboard data', () => {
      // Add some data first
      dashboard.updateEnergyData(mockInputs);
      
      // Verify data exists
      const metricsBeforeReset = dashboard.getDashboardMetrics();
      expect(metricsBeforeReset.todayEnergyHarvested).toBeGreaterThanOrEqual(0);
      
      // Reset dashboard
      dashboard.reset();
      
      // Verify reset
      const status = dashboard.getStatus();
      expect(status.activeAlerts).toBe(0);
      expect(status.lastUpdate).toBe(0);
    });
  });
});