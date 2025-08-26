/**
 * Integration Tests for Energy Monitoring UI Module
 * 
 * Tests the complete integration of all components working together
 */

import { 
  EnergyMonitoringDashboard,
  EnergyDataAggregator,
  RealTimeDataDisplay,
  StorageLevelMonitor,
  UsageStatisticsTracker,
  OptimizationRecommendations
} from '../index';
import { AggregatorInputs, DashboardConfiguration } from '../types';

describe('Energy Monitoring UI Integration', () => {
  let dashboard: EnergyMonitoringDashboard;
  let config: DashboardConfiguration;
  let sampleInputs: AggregatorInputs;

  beforeEach(() => {
    config = {
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
        enableSoundAlerts: false,
        enablePushNotifications: false,
        minimumSeverity: 'warning'
      }
    };

    sampleInputs = {
      suspensionInputs: {
        verticalVelocity: 0.8,
        displacement: 0.03,
        cornerLoad: 550,
        roadCondition: 'rough',
        vehicleSpeed: 75,
        ambientTemperature: 22
      },
      damperInputs: {
        compressionVelocity: 0.6,
        displacement: 0.025,
        vehicleSpeed: 75,
        roadRoughness: 0.8,
        damperTemperature: 40,
        batterySOC: 0.65,
        loadFactor: 0.7
      },
      vehicleInputs: {
        speed: 75,
        acceleration: 0.1,
        roadSurface: 'asphalt',
        temperature: 22,
        humidity: 0.55,
        vibrationLevel: 0.6
      },
      batteryData: {
        stateOfCharge: 0.65,
        capacity: 100,
        voltage: 12.8,
        temperature: 28,
        health: 0.88
      }
    };

    dashboard = new EnergyMonitoringDashboard(config);
  });

  afterEach(() => {
    dashboard.stop();
  });

  describe('Complete System Integration', () => {
    test('should integrate all components successfully', () => {
      // Start dashboard
      dashboard.start();
      expect(dashboard.getStatus().isActive).toBe(true);

      // Process energy data
      const monitoringData = dashboard.updateEnergyData(sampleInputs);
      
      // Verify all data components are present
      expect(monitoringData.realTimeData).toBeDefined();
      expect(monitoringData.storageData).toBeDefined();
      expect(monitoringData.usageStats).toBeDefined();
      expect(Array.isArray(monitoringData.alerts)).toBe(true);

      // Verify dashboard metrics
      const metrics = dashboard.getDashboardMetrics();
      expect(metrics.todayEnergyHarvested).toBeGreaterThanOrEqual(0);
      expect(metrics.currentPowerGeneration).toBeGreaterThanOrEqual(0);
      expect(metrics.systemEfficiency).toBeGreaterThanOrEqual(0);
      expect(metrics.systemEfficiency).toBeLessThanOrEqual(1);

      // Verify optimization recommendations
      const recommendations = dashboard.getOptimizationRecommendations();
      expect(Array.isArray(recommendations)).toBe(true);

      // Verify performance metrics
      const performanceMetrics = dashboard.getPerformanceMetrics();
      expect(performanceMetrics.generationEfficiency).toBeDefined();
      expect(performanceMetrics.reliability).toBeDefined();
      expect(performanceMetrics.environmentalImpact).toBeDefined();
    });

    test('should handle real-time data flow correctly', (done) => {
      let updateCount = 0;
      const expectedUpdates = 3;

      // Subscribe to energy data updates
      dashboard.subscribe('energy-data', (data) => {
        updateCount++;
        
        // Verify data structure
        expect(data.realTimeData.totalPowerGeneration).toBeGreaterThanOrEqual(0);
        expect(data.storageData.batterySOC).toBeGreaterThanOrEqual(0);
        expect(data.storageData.batterySOC).toBeLessThanOrEqual(1);
        
        if (updateCount >= expectedUpdates) {
          done();
        }
      });

      dashboard.start();

      // Send multiple updates
      for (let i = 0; i < expectedUpdates; i++) {
        setTimeout(() => {
          const inputs = {
            ...sampleInputs,
            suspensionInputs: {
              ...sampleInputs.suspensionInputs,
              verticalVelocity: 0.5 + i * 0.2 // Vary the input
            }
          };
          dashboard.updateEnergyData(inputs);
        }, i * 100);
      }
    });

    test('should generate and manage alerts across components', () => {
      // Create conditions that should trigger multiple alerts
      const alertTriggeringInputs: AggregatorInputs = {
        ...sampleInputs,
        batteryData: {
          ...sampleInputs.batteryData,
          stateOfCharge: 0.12, // Low battery
          health: 0.55, // Poor health
          temperature: 48 // High temperature
        },
        damperInputs: {
          ...sampleInputs.damperInputs,
          damperTemperature: 95 // High damper temperature
        }
      };

      dashboard.updateEnergyData(alertTriggeringInputs);
      const alerts = dashboard.getActiveAlerts();

      expect(alerts.length).toBeGreaterThan(0);
      
      // Should have alerts from different categories
      const categories = new Set(alerts.map(alert => alert.category));
      expect(categories.has('battery')).toBe(true);
      
      // Test alert acknowledgment
      if (alerts.length > 0) {
        const alertId = alerts[0].id;
        dashboard.acknowledgeAlert(alertId);
        
        const updatedAlerts = dashboard.getActiveAlerts();
        expect(updatedAlerts.length).toBeLessThan(alerts.length);
      }
    });

    test('should provide comprehensive optimization recommendations', () => {
      // Process data to build history
      for (let i = 0; i < 10; i++) {
        const inputs = {
          ...sampleInputs,
          suspensionInputs: {
            ...sampleInputs.suspensionInputs,
            vehicleSpeed: 60 + i * 2,
            roadCondition: i % 2 === 0 ? 'smooth' : 'rough' as const
          }
        };
        dashboard.updateEnergyData(inputs);
      }

      const recommendations = dashboard.getOptimizationRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);

      // Verify recommendation structure
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('id');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('category');
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('potentialSavings');
        expect(rec).toHaveProperty('difficulty');
        expect(rec).toHaveProperty('implementationTime');
        expect(rec).toHaveProperty('userActionable');

        expect(rec.priority).toBeGreaterThanOrEqual(1);
        expect(rec.priority).toBeLessThanOrEqual(5);
        expect(rec.difficulty).toBeGreaterThanOrEqual(1);
        expect(rec.difficulty).toBeLessThanOrEqual(5);
        expect(rec.potentialSavings).toBeGreaterThanOrEqual(0);
        expect(typeof rec.userActionable).toBe('boolean');
      });

      // Should have recommendations from different categories
      const categories = new Set(recommendations.map(rec => rec.category));
      expect(categories.size).toBeGreaterThan(0);
    });

    test('should track usage statistics over time', () => {
      // Simulate data collection over time
      const dataPoints = 20;
      
      for (let i = 0; i < dataPoints; i++) {
        const inputs = {
          ...sampleInputs,
          suspensionInputs: {
            ...sampleInputs.suspensionInputs,
            verticalVelocity: Math.sin(i * 0.1) * 1.0,
            vehicleSpeed: 60 + Math.sin(i * 0.2) * 20
          },
          batteryData: {
            ...sampleInputs.batteryData,
            stateOfCharge: Math.max(0.2, 0.8 - i * 0.02) // Gradual discharge
          }
        };
        dashboard.updateEnergyData(inputs);
      }

      const metrics = dashboard.getDashboardMetrics();
      expect(metrics.todayEnergyHarvested).toBeGreaterThan(0);
      expect(metrics.systemUptime).toBeGreaterThan(0);
      expect(metrics.systemUptime).toBeLessThanOrEqual(1);

      const performanceMetrics = dashboard.getPerformanceMetrics();
      expect(performanceMetrics.generationEfficiency.current).toBeGreaterThanOrEqual(0);
      expect(performanceMetrics.generationEfficiency.current).toBeLessThanOrEqual(1);
      expect(performanceMetrics.reliability.uptime).toBeGreaterThanOrEqual(0);
      expect(performanceMetrics.reliability.uptime).toBeLessThanOrEqual(1);
    });

    test('should handle configuration changes dynamically', () => {
      dashboard.start();
      
      // Initial configuration
      expect(dashboard.getStatus().refreshRate).toBe(1000);

      // Update configuration
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
      expect(dashboard.getStatus().refreshRate).toBe(2000);

      // Verify system still works with new configuration
      const monitoringData = dashboard.updateEnergyData(sampleInputs);
      expect(monitoringData).toBeDefined();
      expect(monitoringData.realTimeData.totalPowerGeneration).toBeGreaterThanOrEqual(0);
    });

    test('should export comprehensive data', () => {
      // Add some data
      for (let i = 0; i < 5; i++) {
        dashboard.updateEnergyData(sampleInputs);
      }

      // Test JSON export
      const jsonExport = dashboard.exportData('json');
      expect(typeof jsonExport).toBe('string');
      
      const parsedData = JSON.parse(jsonExport);
      expect(parsedData).toHaveProperty('timestamp');
      expect(parsedData).toHaveProperty('configuration');
      expect(parsedData).toHaveProperty('metrics');
      expect(parsedData).toHaveProperty('statistics');
      expect(parsedData).toHaveProperty('performanceMetrics');
      expect(parsedData).toHaveProperty('alerts');
      expect(parsedData).toHaveProperty('recommendations');

      // Test CSV export
      const csvExport = dashboard.exportData('csv');
      expect(typeof csvExport).toBe('string');
      expect(csvExport).toContain(',');
      expect(csvExport.split('\n').length).toBeGreaterThan(1);
    });

    test('should handle widget data requests', () => {
      dashboard.updateEnergyData(sampleInputs);

      const widgetTypes = ['realtime', 'storage', 'statistics', 'optimization', 'alerts'];
      
      widgetTypes.forEach(widgetType => {
        const widgetData = dashboard.getWidgetData(widgetType);
        expect(widgetData).toBeDefined();
        expect(widgetData).not.toBeNull();
      });

      // Test invalid widget type
      const invalidData = dashboard.getWidgetData('invalid-type');
      expect(invalidData).toBeNull();
    });

    test('should maintain system health monitoring', () => {
      // Test various system conditions
      const testScenarios = [
        {
          name: 'optimal conditions',
          inputs: {
            ...sampleInputs,
            batteryData: { ...sampleInputs.batteryData, stateOfCharge: 0.8, health: 0.95, temperature: 25 },
            damperInputs: { ...sampleInputs.damperInputs, damperTemperature: 30 }
          },
          expectedStatus: ['optimal', 'good']
        },
        {
          name: 'warning conditions',
          inputs: {
            ...sampleInputs,
            batteryData: { ...sampleInputs.batteryData, stateOfCharge: 0.25, health: 0.75, temperature: 40 },
            damperInputs: { ...sampleInputs.damperInputs, damperTemperature: 75 }
          },
          expectedStatus: ['warning', 'good']
        },
        {
          name: 'error conditions',
          inputs: {
            ...sampleInputs,
            batteryData: { ...sampleInputs.batteryData, stateOfCharge: 0.1, health: 0.5, temperature: 50 },
            damperInputs: { ...sampleInputs.damperInputs, damperTemperature: 95 }
          },
          expectedStatus: ['error', 'warning']
        }
      ];

      testScenarios.forEach(scenario => {
        dashboard.updateEnergyData(scenario.inputs);
        const status = dashboard.getStatus();
        
        expect(scenario.expectedStatus).toContain(status.systemStatus);
      });
    });
  });

  describe('Component Interaction', () => {
    test('should coordinate between all monitoring components', () => {
      const aggregator = new EnergyDataAggregator();
      const realTimeDisplay = new RealTimeDataDisplay(config);
      const storageMonitor = new StorageLevelMonitor(config);
      const statisticsTracker = new UsageStatisticsTracker(config);
      const optimizationEngine = new OptimizationRecommendations();

      // Test data flow through components
      const monitoringData = aggregator.aggregateEnergyData(sampleInputs);
      
      const realTimeMetrics = realTimeDisplay.processRealTimeData(monitoringData.realTimeData);
      expect(realTimeMetrics.currentPower).toBeGreaterThanOrEqual(0);
      expect(realTimeMetrics.efficiencyPercentage).toBeGreaterThanOrEqual(0);
      expect(realTimeMetrics.efficiencyPercentage).toBeLessThanOrEqual(100);

      const storageDisplay = storageMonitor.processStorageData(monitoringData.storageData);
      expect(storageDisplay.levelPercentage).toBeGreaterThanOrEqual(0);
      expect(storageDisplay.levelPercentage).toBeLessThanOrEqual(100);
      expect(['charging', 'discharging', 'idle', 'full']).toContain(storageDisplay.chargingStatus);

      // Add data to statistics tracker
      statisticsTracker.addDataPoint({
        timestamp: Date.now(),
        power: monitoringData.realTimeData.totalPowerGeneration,
        energy: monitoringData.realTimeData.totalPowerGeneration * 0.001,
        efficiency: monitoringData.realTimeData.overallEfficiency,
        batterySOC: monitoringData.storageData.batterySOC
      });

      const statistics = statisticsTracker.calculateUsageStatistics();
      expect(statistics.dailyEnergyHarvested).toBeGreaterThanOrEqual(0);
      expect(statistics.efficiencyTrends.current).toBeGreaterThanOrEqual(0);
      expect(statistics.efficiencyTrends.current).toBeLessThanOrEqual(1);

      // Test optimization recommendations
      const context = {
        energyData: monitoringData.realTimeData,
        storageData: monitoringData.storageData,
        usageStats: statistics,
        historicalData: aggregator.getHistoricalData()
      };

      const recommendations = optimizationEngine.generateRecommendations(context);
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle extreme input values gracefully', () => {
      const extremeInputs: AggregatorInputs = {
        suspensionInputs: {
          verticalVelocity: 4.9, // Near maximum
          displacement: 0.19, // Near maximum
          cornerLoad: 1900, // High load
          roadCondition: 'very_rough',
          vehicleSpeed: 250, // High speed
          ambientTemperature: 45 // High temperature
        },
        damperInputs: {
          compressionVelocity: 1.9,
          displacement: 0.14,
          vehicleSpeed: 250,
          roadRoughness: 1.0, // Maximum roughness
          damperTemperature: 110, // High temperature
          batterySOC: 0.05, // Very low
          loadFactor: 1.0 // Maximum load
        },
        vehicleInputs: {
          speed: 250,
          acceleration: 3.0, // High acceleration
          roadSurface: 'gravel',
          temperature: 45,
          humidity: 0.95, // High humidity
          vibrationLevel: 1.0 // Maximum vibration
        },
        batteryData: {
          stateOfCharge: 0.05,
          capacity: 100,
          voltage: 15.0, // High voltage
          temperature: 50, // High temperature
          health: 0.3 // Poor health
        }
      };

      expect(() => {
        dashboard.updateEnergyData(extremeInputs);
      }).not.toThrow();

      const status = dashboard.getStatus();
      expect(['error', 'warning']).toContain(status.systemStatus);
      
      const alerts = dashboard.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });

    test('should handle zero and negative values appropriately', () => {
      const zeroInputs: AggregatorInputs = {
        ...sampleInputs,
        suspensionInputs: {
          ...sampleInputs.suspensionInputs,
          verticalVelocity: 0,
          displacement: 0,
          vehicleSpeed: 0
        },
        damperInputs: {
          ...sampleInputs.damperInputs,
          compressionVelocity: 0,
          displacement: 0,
          vehicleSpeed: 0
        },
        vehicleInputs: {
          ...sampleInputs.vehicleInputs,
          speed: 0,
          acceleration: 0
        }
      };

      expect(() => {
        dashboard.updateEnergyData(zeroInputs);
      }).not.toThrow();

      const monitoringData = dashboard.updateEnergyData(zeroInputs);
      expect(monitoringData.realTimeData.totalPowerGeneration).toBeGreaterThanOrEqual(0);
      expect(monitoringData.realTimeData.overallEfficiency).toBeGreaterThanOrEqual(0);
    });

    test('should recover from component failures gracefully', () => {
      // Simulate component failure by providing invalid data
      const invalidInputs = {
        ...sampleInputs,
        batteryData: {
          ...sampleInputs.batteryData,
          stateOfCharge: NaN, // Invalid value
          capacity: -100 // Invalid value
        }
      };

      // System should handle invalid data without crashing
      expect(() => {
        dashboard.updateEnergyData(invalidInputs);
      }).not.toThrow();
    });
  });
});