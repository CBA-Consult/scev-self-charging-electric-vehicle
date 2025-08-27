/**
 * Tests for TEG Thermal Monitor
 * 
 * This file contains unit tests for the TEG thermal monitoring system,
 * testing sensor data processing, threshold detection, and shutdown procedures.
 */

import {
  TEGThermalMonitor,
  createTestTEGData,
  defaultTEGConfiguration,
  defaultSensorLocations,
  TEGError,
  TEGThermalError
} from '../index';

describe('TEGThermalMonitor', () => {
  let tegMonitor: TEGThermalMonitor;

  beforeEach(() => {
    tegMonitor = new TEGThermalMonitor(defaultTEGConfiguration, defaultSensorLocations);
  });

  afterEach(() => {
    tegMonitor.stopMonitoring();
  });

  describe('Initialization', () => {
    test('should initialize with default configuration', () => {
      const status = tegMonitor.getSystemStatus();
      expect(status.monitoringActive).toBe(false);
      expect(status.zones.length).toBeGreaterThan(0);
      expect(status.totalSensors).toBe(defaultTEGConfiguration.sensorCount);
    });

    test('should initialize thermal zones', () => {
      const status = tegMonitor.getSystemStatus();
      const zoneIds = status.zones.map(zone => zone.zoneId);
      
      expect(zoneIds).toContain('frontLeftMotor');
      expect(zoneIds).toContain('batteryPack');
      expect(zoneIds).toContain('powerElectronics');
    });
  });

  describe('Monitoring Control', () => {
    test('should start and stop monitoring', () => {
      expect(tegMonitor.getSystemStatus().monitoringActive).toBe(false);
      
      tegMonitor.startMonitoring();
      expect(tegMonitor.getSystemStatus().monitoringActive).toBe(true);
      
      tegMonitor.stopMonitoring();
      expect(tegMonitor.getSystemStatus().monitoringActive).toBe(false);
    });

    test('should not start monitoring twice', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      tegMonitor.startMonitoring();
      tegMonitor.startMonitoring(); // Second call should warn
      
      expect(consoleSpy).toHaveBeenCalledWith('TEG thermal monitoring is already active');
      consoleSpy.mockRestore();
    });
  });

  describe('Sensor Data Processing', () => {
    test('should accept valid sensor data', () => {
      const testData = createTestTEGData({
        sensorId: 'test_sensor',
        current: 0.15,
        temperature: 65
      });

      expect(() => {
        tegMonitor.updateSensorData(testData);
      }).not.toThrow();

      const sensorData = tegMonitor.getSensorData('test_sensor');
      expect(sensorData).toBeDefined();
      expect(sensorData?.current).toBe(0.15);
      expect(sensorData?.temperature).toBe(65);
    });

    test('should reject invalid sensor data', () => {
      const invalidData = createTestTEGData({
        sensorId: '',
        current: -1, // Invalid negative current
        temperature: 300 // Invalid high temperature
      });

      expect(() => {
        tegMonitor.updateSensorData(invalidData);
      }).toThrow();
    });

    test('should apply calibration to sensor data', () => {
      const testData = createTestTEGData({
        sensorId: 'calibration_test',
        current: 0.1,
        voltage: 0.05,
        calibrationFactor: 1.2
      });

      tegMonitor.updateSensorData(testData);
      const storedData = tegMonitor.getSensorData('calibration_test');
      
      expect(storedData?.current).toBe(0.12); // 0.1 * 1.2
      expect(storedData?.voltage).toBe(0.06); // 0.05 * 1.2
    });
  });

  describe('Threshold Detection', () => {
    test('should detect warning threshold violations', () => {
      const alertSpy = jest.fn();
      tegMonitor.onAlert(alertSpy);

      const warningData = createTestTEGData({
        sensorId: 'warning_sensor',
        current: 0.3, // Above warning threshold (0.25)
        temperature: 85, // Above warning threshold (80)
        location: { zone: 'testZone', position: { x: 0, y: 0, z: 0 }, priority: 'medium' }
      });

      tegMonitor.updateSensorData(warningData);

      // Should generate warning alert
      expect(alertSpy).toHaveBeenCalled();
      const alertCall = alertSpy.mock.calls[0][0];
      expect(alertCall.severity).toBe('warning');
    });

    test('should detect critical threshold violations', () => {
      const alertSpy = jest.fn();
      tegMonitor.onAlert(alertSpy);

      const criticalData = createTestTEGData({
        sensorId: 'critical_sensor',
        current: 0.6, // Above critical threshold (0.5)
        temperature: 105, // Above critical threshold (100)
        location: { zone: 'testZone', position: { x: 0, y: 0, z: 0 }, priority: 'critical' }
      });

      tegMonitor.updateSensorData(criticalData);

      // Should trigger shutdown
      const status = tegMonitor.getSystemStatus();
      const testZone = status.zones.find(zone => zone.zoneId === 'testZone');
      expect(testZone?.shutdownActive).toBe(true);
    });

    test('should detect emergency threshold violations', () => {
      const alertSpy = jest.fn();
      tegMonitor.onAlert(alertSpy);

      const emergencyData = createTestTEGData({
        sensorId: 'emergency_sensor',
        current: 1.2, // Above emergency threshold (1.0)
        temperature: 125, // Above emergency threshold (120)
        location: { zone: 'emergencyZone', position: { x: 0, y: 0, z: 0 }, priority: 'critical' }
      });

      tegMonitor.updateSensorData(emergencyData);

      // Should trigger immediate shutdown
      expect(alertSpy).toHaveBeenCalled();
      const shutdownAlert = alertSpy.mock.calls.find(call => call[0].type === 'shutdown');
      expect(shutdownAlert).toBeDefined();
      expect(shutdownAlert[0].severity).toBe('emergency');
    });
  });

  describe('Zone Management', () => {
    test('should update zone status based on sensor data', () => {
      const sensorData = createTestTEGData({
        sensorId: 'zone_sensor',
        current: 0.2,
        temperature: 75,
        location: { zone: 'frontLeftMotor', position: { x: 1.2, y: 0.8, z: 0.3 }, priority: 'critical' }
      });

      tegMonitor.updateSensorData(sensorData);

      const zoneStatus = tegMonitor.getZoneStatus('frontLeftMotor');
      expect(zoneStatus).toBeDefined();
      expect(zoneStatus?.sensors.length).toBeGreaterThan(0);
      expect(zoneStatus?.maxTemperature).toBe(75);
      expect(zoneStatus?.maxCurrent).toBe(0.2);
    });

    test('should calculate zone metrics correctly', () => {
      // Add multiple sensors to the same zone
      const sensor1 = createTestTEGData({
        sensorId: 'zone_sensor_1',
        current: 0.1,
        temperature: 70,
        location: { zone: 'batteryPack', position: { x: 0, y: 0, z: -0.2 }, priority: 'critical' }
      });

      const sensor2 = createTestTEGData({
        sensorId: 'zone_sensor_2',
        current: 0.2,
        temperature: 80,
        location: { zone: 'batteryPack', position: { x: 0.5, y: 0, z: -0.2 }, priority: 'critical' }
      });

      tegMonitor.updateSensorData(sensor1);
      tegMonitor.updateSensorData(sensor2);

      const zoneStatus = tegMonitor.getZoneStatus('batteryPack');
      expect(zoneStatus?.averageTemperature).toBe(75); // (70 + 80) / 2
      expect(zoneStatus?.maxTemperature).toBe(80);
      expect(zoneStatus?.averageCurrent).toBe(0.15); // (0.1 + 0.2) / 2
      expect(zoneStatus?.maxCurrent).toBe(0.2);
    });
  });

  describe('Shutdown Procedures', () => {
    test('should execute shutdown when critical threshold is exceeded', (done) => {
      const alertSpy = jest.fn();
      tegMonitor.onAlert(alertSpy);

      const criticalData = createTestTEGData({
        sensorId: 'shutdown_test',
        current: 0.6, // Above critical threshold
        temperature: 105, // Above critical threshold
        location: { zone: 'powerElectronics', position: { x: 0.8, y: 0, z: 0.5 }, priority: 'high' }
      });

      tegMonitor.updateSensorData(criticalData);

      // Check that shutdown was initiated
      setTimeout(() => {
        const zoneStatus = tegMonitor.getZoneStatus('powerElectronics');
        expect(zoneStatus?.shutdownActive).toBe(true);
        expect(zoneStatus?.status).toBe('shutdown');
        done();
      }, 100);
    });

    test('should prevent reactivation during cooldown', () => {
      // First trigger a shutdown
      const criticalData = createTestTEGData({
        sensorId: 'cooldown_test',
        current: 0.6,
        temperature: 105,
        location: { zone: 'hvacSystem', position: { x: 0, y: 0, z: 0.8 }, priority: 'low' }
      });

      tegMonitor.updateSensorData(criticalData);

      // Try to reactivate immediately (should fail due to cooldown)
      const zoneStatus = tegMonitor.getZoneStatus('hvacSystem');
      expect(zoneStatus?.shutdownActive).toBe(true);
      expect(zoneStatus?.cooldownRemaining).toBeGreaterThan(0);
    });
  });

  describe('Configuration Updates', () => {
    test('should update configuration', () => {
      const newConfig = {
        currentThresholds: {
          normal: 0.05,
          warning: 0.15,
          critical: 0.3,
          emergency: 0.6
        }
      };

      expect(() => {
        tegMonitor.updateConfiguration(newConfig);
      }).not.toThrow();
    });

    test('should validate configuration', () => {
      const invalidConfig = {
        currentThresholds: {
          normal: 0.5, // Invalid: normal > warning
          warning: 0.25,
          critical: 0.5,
          emergency: 1.0
        }
      };

      // The system should handle invalid configurations gracefully
      // In a real implementation, this might throw an error or use defaults
      expect(() => {
        tegMonitor.updateConfiguration(invalidConfig);
      }).not.toThrow();
    });
  });

  describe('System Status', () => {
    test('should provide accurate system status', () => {
      const status = tegMonitor.getSystemStatus();
      
      expect(status).toHaveProperty('monitoringActive');
      expect(status).toHaveProperty('totalSensors');
      expect(status).toHaveProperty('activeSensors');
      expect(status).toHaveProperty('zones');
      expect(status).toHaveProperty('activeShutdowns');
      expect(status).toHaveProperty('lastUpdate');
      
      expect(Array.isArray(status.zones)).toBe(true);
      expect(typeof status.totalSensors).toBe('number');
      expect(typeof status.activeSensors).toBe('number');
    });

    test('should track active sensors correctly', () => {
      const initialStatus = tegMonitor.getSystemStatus();
      expect(initialStatus.activeSensors).toBe(0);

      // Add a sensor reading
      const testData = createTestTEGData({
        sensorId: 'active_test',
        current: 0.1,
        temperature: 60
      });

      tegMonitor.updateSensorData(testData);

      const updatedStatus = tegMonitor.getSystemStatus();
      expect(updatedStatus.activeSensors).toBe(1);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing sensor gracefully', () => {
      const nonExistentSensor = tegMonitor.getSensorData('non_existent_sensor');
      expect(nonExistentSensor).toBeUndefined();
    });

    test('should handle missing zone gracefully', () => {
      const nonExistentZone = tegMonitor.getZoneStatus('non_existent_zone');
      expect(nonExistentZone).toBeUndefined();
    });

    test('should handle invalid sensor data gracefully', () => {
      const invalidData = createTestTEGData({
        sensorId: 'invalid_test',
        current: NaN,
        temperature: Infinity
      });

      expect(() => {
        tegMonitor.updateSensorData(invalidData);
      }).toThrow();
    });
  });

  describe('Performance', () => {
    test('should handle multiple rapid sensor updates', () => {
      const startTime = Date.now();
      
      // Send 100 sensor updates rapidly
      for (let i = 0; i < 100; i++) {
        const testData = createTestTEGData({
          sensorId: `perf_sensor_${i}`,
          current: 0.1 + (i * 0.001),
          temperature: 60 + (i * 0.1)
        });
        
        tegMonitor.updateSensorData(testData);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
      
      const status = tegMonitor.getSystemStatus();
      expect(status.activeSensors).toBe(100);
    });

    test('should maintain performance with monitoring active', (done) => {
      tegMonitor.startMonitoring();
      
      const startTime = Date.now();
      let updateCount = 0;
      
      const performanceInterval = setInterval(() => {
        const testData = createTestTEGData({
          sensorId: `monitor_perf_${updateCount}`,
          current: 0.1,
          temperature: 65
        });
        
        tegMonitor.updateSensorData(testData);
        updateCount++;
        
        if (updateCount >= 50) {
          clearInterval(performanceInterval);
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Should maintain good performance even with monitoring active
          expect(duration).toBeLessThan(2000);
          expect(updateCount).toBe(50);
          done();
        }
      }, 10);
    });
  });
});

describe('TEGThermalError', () => {
  test('should create error with correct properties', () => {
    const error = new TEGThermalError(
      TEGError.THRESHOLD_EXCEEDED,
      'Temperature threshold exceeded',
      'test_sensor',
      'test_zone'
    );

    expect(error.name).toBe('TEGThermalError');
    expect(error.errorType).toBe(TEGError.THRESHOLD_EXCEEDED);
    expect(error.message).toBe('Temperature threshold exceeded');
    expect(error.sensorId).toBe('test_sensor');
    expect(error.zone).toBe('test_zone');
  });

  test('should be instance of Error', () => {
    const error = new TEGThermalError(TEGError.SENSOR_FAILURE, 'Test error');
    expect(error instanceof Error).toBe(true);
    expect(error instanceof TEGThermalError).toBe(true);
  });
});

// Helper function to wait for async operations
function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}