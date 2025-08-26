/**
 * TEG Thermal Monitoring Module for Electric Vehicle Thermal Management
 * 
 * This module implements Thermoelectric Generator (TEG) sensors throughout the vehicle
 * to monitor thermal conditions and automatically shut down heating areas when
 * current thresholds are exceeded, indicating overheating conditions.
 */

// Main TEG controller exports
export { 
  TEGThermalMonitor,
  type TEGSensorData,
  type TEGConfiguration,
  type ThermalZoneStatus,
  type ShutdownCommand
} from './TEGThermalMonitor';

// TEG sensor management exports
export {
  TEGSensorManager,
  type TEGSensor,
  type SensorLocation,
  type SensorCalibration
} from './TEGSensorManager';

// Thermal zone controller exports
export {
  ThermalZoneController,
  type ThermalZone,
  type ZoneConfiguration,
  type ShutdownProcedure
} from './ThermalZoneController';

// Integration with existing energy systems
export {
  TEGEnergyIntegration,
  type TEGIntegrationInputs,
  type TEGIntegrationOutputs
} from './TEGEnergyIntegration';

/**
 * Factory function to create a complete TEG thermal monitoring system
 */
export function createTEGThermalSystem(
  vehicleConfig?: Partial<TEGConfiguration>,
  sensorLocations?: SensorLocation[]
) {
  return new TEGThermalMonitor(vehicleConfig, sensorLocations);
}

/**
 * Default TEG configuration for electric vehicle
 */
export const defaultTEGConfiguration: TEGConfiguration = {
  sensorCount: 16,
  currentThresholds: {
    normal: 0.1,        // A - normal operating current
    warning: 0.25,      // A - warning threshold
    critical: 0.5,      // A - critical threshold requiring shutdown
    emergency: 1.0      // A - emergency shutdown threshold
  },
  temperatureThresholds: {
    normal: 60,         // °C - normal operating temperature
    warning: 80,        // °C - warning temperature
    critical: 100,      // °C - critical temperature
    emergency: 120      // °C - emergency temperature
  },
  responseTimeMs: 100,  // ms - maximum response time for shutdown
  shutdownSequence: {
    gracefulShutdownTime: 5000,   // ms - time for graceful shutdown
    forceShutdownTime: 1000,      // ms - time for forced shutdown
    cooldownTime: 30000           // ms - minimum cooldown time
  },
  monitoringFrequency: 10,        // Hz - sensor monitoring frequency
  dataLogging: true,
  alertSystem: true
};

/**
 * Default sensor locations for comprehensive vehicle coverage
 */
export const defaultSensorLocations: SensorLocation[] = [
  // Motor and drivetrain sensors
  { id: 'motor_fl', zone: 'frontLeftMotor', position: { x: 1.2, y: 0.8, z: 0.3 }, priority: 'critical' },
  { id: 'motor_fr', zone: 'frontRightMotor', position: { x: 1.2, y: -0.8, z: 0.3 }, priority: 'critical' },
  { id: 'motor_rl', zone: 'rearLeftMotor', position: { x: -1.2, y: 0.8, z: 0.3 }, priority: 'critical' },
  { id: 'motor_rr', zone: 'rearRightMotor', position: { x: -1.2, y: -0.8, z: 0.3 }, priority: 'critical' },
  
  // Battery pack sensors
  { id: 'battery_front', zone: 'batteryPack', position: { x: 0.5, y: 0, z: -0.2 }, priority: 'critical' },
  { id: 'battery_center', zone: 'batteryPack', position: { x: 0, y: 0, z: -0.2 }, priority: 'critical' },
  { id: 'battery_rear', zone: 'batteryPack', position: { x: -0.5, y: 0, z: -0.2 }, priority: 'critical' },
  
  // Power electronics sensors
  { id: 'inverter_main', zone: 'powerElectronics', position: { x: 0.8, y: 0, z: 0.5 }, priority: 'high' },
  { id: 'charger_onboard', zone: 'chargingSystem', position: { x: -0.8, y: 0, z: 0.5 }, priority: 'high' },
  { id: 'dc_converter', zone: 'powerElectronics', position: { x: 0.3, y: 0.5, z: 0.4 }, priority: 'high' },
  
  // Brake system sensors
  { id: 'brake_fl', zone: 'brakingSystem', position: { x: 1.2, y: 0.8, z: 0.1 }, priority: 'medium' },
  { id: 'brake_fr', zone: 'brakingSystem', position: { x: 1.2, y: -0.8, z: 0.1 }, priority: 'medium' },
  { id: 'brake_rl', zone: 'brakingSystem', position: { x: -1.2, y: 0.8, z: 0.1 }, priority: 'medium' },
  { id: 'brake_rr', zone: 'brakingSystem', position: { x: -1.2, y: -0.8, z: 0.1 }, priority: 'medium' },
  
  // HVAC and cabin sensors
  { id: 'hvac_main', zone: 'hvacSystem', position: { x: 0, y: 0, z: 0.8 }, priority: 'low' },
  { id: 'cabin_ambient', zone: 'cabinEnvironment', position: { x: 0, y: 0, z: 1.0 }, priority: 'low' }
];

/**
 * Utility function to validate TEG configuration
 */
export function validateTEGConfiguration(config: TEGConfiguration): boolean {
  return (
    config.sensorCount > 0 &&
    config.currentThresholds.normal < config.currentThresholds.warning &&
    config.currentThresholds.warning < config.currentThresholds.critical &&
    config.currentThresholds.critical < config.currentThresholds.emergency &&
    config.temperatureThresholds.normal < config.temperatureThresholds.warning &&
    config.temperatureThresholds.warning < config.temperatureThresholds.critical &&
    config.temperatureThresholds.critical < config.temperatureThresholds.emergency &&
    config.responseTimeMs > 0 &&
    config.monitoringFrequency > 0
  );
}

/**
 * Utility function to create test TEG sensor data
 */
export function createTestTEGData(overrides?: Partial<TEGSensorData>): TEGSensorData {
  return {
    sensorId: 'test_sensor',
    timestamp: Date.now(),
    current: 0.15,              // A - normal operating current
    voltage: 0.05,              // V - typical TEG voltage
    temperature: 65,            // °C - normal operating temperature
    resistance: 0.33,           // Ω - internal resistance
    powerOutput: 0.0075,        // W - power generated by TEG
    thermalGradient: 25,        // °C - temperature difference across TEG
    location: {
      zone: 'testZone',
      position: { x: 0, y: 0, z: 0 },
      priority: 'medium'
    },
    status: 'normal',
    calibrationFactor: 1.0,
    ...overrides
  };
}

/**
 * TEG thermal monitoring constants
 */
export const TEG_CONSTANTS = {
  // TEG material properties
  SEEBECK_COEFFICIENT: 200e-6,    // V/K - typical for Bi2Te3
  THERMAL_CONDUCTIVITY: 1.5,      // W/m·K
  ELECTRICAL_RESISTIVITY: 1e-5,   // Ω·m
  
  // Physical constants
  STEFAN_BOLTZMANN: 5.67e-8,      // W/m²·K⁴
  AMBIENT_TEMPERATURE: 25,         // °C - standard ambient
  
  // System limits
  MAX_SENSORS_PER_ZONE: 4,
  MIN_MONITORING_FREQUENCY: 1,     // Hz
  MAX_MONITORING_FREQUENCY: 100,   // Hz
  MAX_RESPONSE_TIME: 1000,         // ms
  
  // Safety factors
  THERMAL_SAFETY_MARGIN: 0.8,     // 20% safety margin
  CURRENT_SAFETY_MARGIN: 0.9      // 10% safety margin
};

/**
 * TEG error types
 */
export enum TEGError {
  SENSOR_FAILURE = 'SENSOR_FAILURE',
  COMMUNICATION_ERROR = 'COMMUNICATION_ERROR',
  CALIBRATION_ERROR = 'CALIBRATION_ERROR',
  THRESHOLD_EXCEEDED = 'THRESHOLD_EXCEEDED',
  SHUTDOWN_FAILURE = 'SHUTDOWN_FAILURE',
  SYSTEM_OVERLOAD = 'SYSTEM_OVERLOAD',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

/**
 * Custom error class for TEG thermal monitoring
 */
export class TEGThermalError extends Error {
  constructor(
    public errorType: TEGError,
    message: string,
    public sensorId?: string,
    public zone?: string
  ) {
    super(message);
    this.name = 'TEGThermalError';
  }
}