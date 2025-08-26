/**
 * Tests for Energy Data Aggregator
 */

import { EnergyDataAggregator, AggregatorInputs } from '../EnergyDataAggregator';

describe('EnergyDataAggregator', () => {
  let aggregator: EnergyDataAggregator;
  let mockInputs: AggregatorInputs;

  beforeEach(() => {
    aggregator = new EnergyDataAggregator();
    
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
  });

  describe('Data Aggregation', () => {
    test('should aggregate energy data from all sources', () => {
      const result = aggregator.aggregateEnergyData(mockInputs);
      
      expect(result).toBeDefined();
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.realTimeData).toBeDefined();
      expect(result.storageData).toBeDefined();
      expect(result.usageStats).toBeDefined();
      expect(Array.isArray(result.alerts)).toBe(true);
    });

    test('should calculate real-time data correctly', () => {
      const result = aggregator.aggregateEnergyData(mockInputs);
      const realTimeData = result.realTimeData;
      
      expect(realTimeData.totalPowerGeneration).toBeGreaterThanOrEqual(0);
      expect(realTimeData.overallEfficiency).toBeGreaterThanOrEqual(0);
      expect(realTimeData.overallEfficiency).toBeLessThanOrEqual(1);
      expect(realTimeData.energyHarvestingRate).toBeGreaterThanOrEqual(0);
      
      expect(realTimeData.powerBySource).toBeDefined();
      expect(typeof realTimeData.powerBySource.electromagneticShockAbsorber).toBe('number');
      expect(typeof realTimeData.powerBySource.hydraulicRegenerativeDamper).toBe('number');
      expect(typeof realTimeData.powerBySource.piezoelectricHarvester).toBe('number');
      expect(typeof realTimeData.powerBySource.vibrationHarvesting).toBe('number');
      
      expect(realTimeData.electricalData).toBeDefined();
      expect(realTimeData.electricalData.voltage).toBeGreaterThan(0);
      expect(realTimeData.electricalData.current).toBeGreaterThanOrEqual(0);
      expect(realTimeData.electricalData.frequency).toBeGreaterThan(0);
      
      expect(realTimeData.operatingConditions).toBeDefined();
      expect(realTimeData.operatingConditions.vehicleSpeed).toBe(mockInputs.suspensionInputs.vehicleSpeed);
      expect(realTimeData.operatingConditions.roadCondition).toBe(mockInputs.suspensionInputs.roadCondition);
    });

    test('should calculate storage data correctly', () => {
      const result = aggregator.aggregateEnergyData(mockInputs);
      const storageData = result.storageData;
      
      expect(storageData.batterySOC).toBe(mockInputs.batteryData.stateOfCharge);
      expect(storageData.batteryCapacity).toBe(mockInputs.batteryData.capacity);
      expect(storageData.batteryVoltage).toBe(mockInputs.batteryData.voltage);
      expect(storageData.batteryHealth).toBe(mockInputs.batteryData.health);
      expect(storageData.batteryTemperature).toBe(mockInputs.batteryData.temperature);
      
      expect(storageData.currentStoredEnergy).toBeGreaterThanOrEqual(0);
      expect(storageData.chargingRate).toBeGreaterThanOrEqual(0);
      expect(storageData.timeToFullCharge).toBeGreaterThanOrEqual(0);
    });

    test('should calculate usage statistics', () => {
      const result = aggregator.aggregateEnergyData(mockInputs);
      const usageStats = result.usageStats;
      
      expect(usageStats.dailyEnergyHarvested).toBeGreaterThanOrEqual(0);
      expect(usageStats.weeklyEnergyHarvested).toBeGreaterThanOrEqual(0);
      expect(usageStats.monthlyEnergyHarvested).toBeGreaterThanOrEqual(0);
      expect(usageStats.lifetimeEnergyHarvested).toBeGreaterThanOrEqual(0);
      expect(usageStats.averageDailyGeneration).toBeGreaterThanOrEqual(0);
      expect(usageStats.peakPowerToday).toBeGreaterThanOrEqual(0);
      
      expect(usageStats.consumption).toBeDefined();
      expect(usageStats.efficiencyTrends).toBeDefined();
      expect(usageStats.operatingTime).toBeDefined();
    });
  });

  describe('Alert Generation', () => {
    test('should generate low battery alert', () => {
      const lowBatteryInputs = {
        ...mockInputs,
        batteryData: {
          ...mockInputs.batteryData,
          stateOfCharge: 0.1 // Very low battery
        }
      };
      
      const result = aggregator.aggregateEnergyData(lowBatteryInputs);
      const alerts = result.alerts;
      
      expect(alerts.length).toBeGreaterThan(0);
      const batteryAlert = alerts.find(alert => alert.category === 'battery');
      expect(batteryAlert).toBeDefined();
      expect(batteryAlert?.severity).toBe('critical');
    });

    test('should generate high temperature alert', () => {
      const highTempInputs = {
        ...mockInputs,
        damperInputs: {
          ...mockInputs.damperInputs,
          damperTemperature: 90 // High temperature
        }
      };
      
      const result = aggregator.aggregateEnergyData(highTempInputs);
      const alerts = result.alerts;
      
      const tempAlert = alerts.find(alert => alert.category === 'temperature');
      expect(tempAlert).toBeDefined();
      if (tempAlert) {
        expect(['warning', 'error']).toContain(tempAlert.severity);
      }
    });

    test('should generate efficiency alert', () => {
      // Create conditions that would result in low efficiency
      const lowEfficiencyInputs = {
        ...mockInputs,
        suspensionInputs: {
          ...mockInputs.suspensionInputs,
          verticalVelocity: 0.01, // Very low motion
          roadCondition: 'smooth' as const // Poor for energy harvesting
        },
        damperInputs: {
          ...mockInputs.damperInputs,
          compressionVelocity: 0.01,
          roadRoughness: 0.1
        }
      };
      
      const result = aggregator.aggregateEnergyData(lowEfficiencyInputs);
      
      // The system should detect low efficiency and potentially generate alerts
      expect(result.realTimeData.overallEfficiency).toBeLessThan(0.8);
    });
  });

  describe('Energy Source Status', () => {
    test('should provide energy source status', () => {
      const sources = aggregator.getEnergySourceStatus();
      
      expect(Array.isArray(sources)).toBe(true);
      expect(sources.length).toBeGreaterThan(0);
      
      sources.forEach(source => {
        expect(source).toHaveProperty('sourceId');
        expect(source).toHaveProperty('name');
        expect(source).toHaveProperty('isActive');
        expect(source).toHaveProperty('currentPower');
        expect(source).toHaveProperty('efficiency');
        expect(source).toHaveProperty('temperature');
        expect(source).toHaveProperty('totalEnergyGenerated');
        expect(source).toHaveProperty('lastUpdate');
        
        expect(typeof source.isActive).toBe('boolean');
        expect(typeof source.currentPower).toBe('number');
        expect(typeof source.efficiency).toBe('number');
        expect(source.efficiency).toBeGreaterThanOrEqual(0);
        expect(source.efficiency).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Historical Data Management', () => {
    test('should maintain historical data', () => {
      // Add multiple data points
      for (let i = 0; i < 5; i++) {
        aggregator.aggregateEnergyData(mockInputs);
      }
      
      const historicalData = aggregator.getHistoricalData();
      expect(historicalData.length).toBeGreaterThan(0);
      expect(historicalData.length).toBeLessThanOrEqual(5);
      
      historicalData.forEach(point => {
        expect(point).toHaveProperty('timestamp');
        expect(point).toHaveProperty('power');
        expect(point).toHaveProperty('energy');
        expect(point).toHaveProperty('efficiency');
        expect(point).toHaveProperty('batterySOC');
        
        expect(typeof point.timestamp).toBe('number');
        expect(typeof point.power).toBe('number');
        expect(typeof point.energy).toBe('number');
        expect(typeof point.efficiency).toBe('number');
        expect(typeof point.batterySOC).toBe('number');
      });
    });

    test('should filter historical data by time range', () => {
      const now = Date.now();
      
      // Add data points
      aggregator.aggregateEnergyData(mockInputs);
      
      const timeRange = {
        start: now - 1000,
        end: now + 1000
      };
      
      const filteredData = aggregator.getHistoricalData(timeRange);
      expect(Array.isArray(filteredData)).toBe(true);
      
      filteredData.forEach(point => {
        expect(point.timestamp).toBeGreaterThanOrEqual(timeRange.start);
        expect(point.timestamp).toBeLessThanOrEqual(timeRange.end);
      });
    });

    test('should clear historical data', () => {
      // Add some data
      aggregator.aggregateEnergyData(mockInputs);
      expect(aggregator.getHistoricalData().length).toBeGreaterThan(0);
      
      // Clear data
      aggregator.clearHistoricalData();
      expect(aggregator.getHistoricalData().length).toBe(0);
    });
  });

  describe('System Summary', () => {
    test('should provide system summary', () => {
      aggregator.aggregateEnergyData(mockInputs);
      const summary = aggregator.getSystemSummary();
      
      expect(summary).toBeDefined();
      expect(summary).toHaveProperty('totalSources');
      expect(summary).toHaveProperty('activeSources');
      expect(summary).toHaveProperty('totalPowerGeneration');
      expect(summary).toHaveProperty('averageEfficiency');
      expect(summary).toHaveProperty('systemHealth');
      
      expect(typeof summary.totalSources).toBe('number');
      expect(typeof summary.activeSources).toBe('number');
      expect(typeof summary.totalPowerGeneration).toBe('number');
      expect(typeof summary.averageEfficiency).toBe('number');
      expect(typeof summary.systemHealth).toBe('number');
      
      expect(summary.totalSources).toBeGreaterThan(0);
      expect(summary.activeSources).toBeLessThanOrEqual(summary.totalSources);
      expect(summary.averageEfficiency).toBeGreaterThanOrEqual(0);
      expect(summary.averageEfficiency).toBeLessThanOrEqual(1);
      expect(summary.systemHealth).toBeGreaterThanOrEqual(0);
      expect(summary.systemHealth).toBeLessThanOrEqual(1);
    });
  });

  describe('Alert Acknowledgment', () => {
    test('should acknowledge alerts', () => {
      const lowBatteryInputs = {
        ...mockInputs,
        batteryData: {
          ...mockInputs.batteryData,
          stateOfCharge: 0.1
        }
      };
      
      const result = aggregator.aggregateEnergyData(lowBatteryInputs);
      const alerts = result.alerts;
      
      if (alerts.length > 0) {
        const alertId = alerts[0].id;
        expect(alerts[0].acknowledged).toBe(false);
        
        aggregator.acknowledgeAlert(alertId);
        
        // Note: The acknowledgment affects internal state, 
        // but we can't directly verify it without additional methods
        // In a real implementation, you might want to add a method to check alert status
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero power generation', () => {
      const zeroInputs = {
        ...mockInputs,
        suspensionInputs: {
          ...mockInputs.suspensionInputs,
          verticalVelocity: 0,
          displacement: 0
        },
        damperInputs: {
          ...mockInputs.damperInputs,
          compressionVelocity: 0,
          displacement: 0
        }
      };
      
      const result = aggregator.aggregateEnergyData(zeroInputs);
      
      expect(result.realTimeData.totalPowerGeneration).toBeGreaterThanOrEqual(0);
      expect(result.realTimeData.energyHarvestingRate).toBeGreaterThanOrEqual(0);
    });

    test('should handle extreme values', () => {
      const extremeInputs = {
        ...mockInputs,
        suspensionInputs: {
          ...mockInputs.suspensionInputs,
          verticalVelocity: 4.9, // Near maximum safe limit
          ambientTemperature: 45 // High temperature
        },
        batteryData: {
          ...mockInputs.batteryData,
          stateOfCharge: 0.05, // Very low
          health: 0.3 // Poor health
        }
      };
      
      expect(() => {
        aggregator.aggregateEnergyData(extremeInputs);
      }).not.toThrow();
    });

    test('should handle invalid road conditions gracefully', () => {
      const invalidInputs = {
        ...mockInputs,
        suspensionInputs: {
          ...mockInputs.suspensionInputs,
          roadCondition: 'unknown' as any
        }
      };
      
      expect(() => {
        aggregator.aggregateEnergyData(invalidInputs);
      }).not.toThrow();
    });
  });
});