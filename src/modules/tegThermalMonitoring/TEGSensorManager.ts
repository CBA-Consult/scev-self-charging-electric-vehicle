/**
 * TEG Sensor Manager - Manages individual TEG sensors and their calibration
 * 
 * This class handles the low-level management of TEG sensors, including
 * calibration, data acquisition, and sensor health monitoring.
 */

export interface TEGSensor {
  id: string;
  location: SensorLocation;
  calibration: SensorCalibration;
  specifications: TEGSpecifications;
  status: SensorStatus;
  lastReading: TEGReading | null;
  installationDate: Date;
  lastCalibrationDate: Date;
  operatingHours: number;
}

export interface SensorLocation {
  zone: string;
  position: { x: number; y: number; z: number };
  priority: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  mountingType?: 'surface' | 'embedded' | 'clamp' | 'threaded';
  orientation?: 'horizontal' | 'vertical' | 'angled';
}

export interface SensorCalibration {
  currentMultiplier: number;      // Calibration factor for current readings
  voltageMultiplier: number;      // Calibration factor for voltage readings
  temperatureOffset: number;      // Temperature offset in °C
  temperatureMultiplier: number;  // Temperature scaling factor
  resistanceOffset: number;       // Resistance offset in Ω
  lastCalibrationTemp: number;    // Temperature during last calibration
  calibrationCertificate?: string; // Calibration certificate reference
}

export interface TEGSpecifications {
  manufacturer: string;
  model: string;
  seebeckCoefficient: number;     // V/K - Seebeck coefficient
  thermalConductivity: number;    // W/m·K - thermal conductivity
  electricalResistance: number;   // Ω - internal resistance
  maxTemperature: number;         // °C - maximum operating temperature
  maxCurrent: number;             // A - maximum current output
  maxVoltage: number;             // V - maximum voltage output
  dimensions: {
    length: number;               // mm
    width: number;                // mm
    thickness: number;            // mm
  };
  operatingRange: {
    minTemp: number;              // °C
    maxTemp: number;              // °C
  };
}

export interface SensorStatus {
  operational: boolean;
  lastCommunication: number;      // timestamp
  errorCount: number;
  warningCount: number;
  healthScore: number;            // 0-1, 1 = perfect health
  faultCodes: string[];
  maintenanceRequired: boolean;
  calibrationDue: boolean;
}

export interface TEGReading {
  timestamp: number;
  current: number;                // A
  voltage: number;                // V
  temperature: number;            // °C
  resistance: number;             // Ω
  powerOutput: number;            // W
  thermalGradient: number;        // °C
  signalQuality: number;          // 0-1, 1 = perfect signal
}

export class TEGSensorManager {
  private sensors: Map<string, TEGSensor> = new Map();
  private sensorReadings: Map<string, TEGReading[]> = new Map();
  private calibrationHistory: Map<string, SensorCalibration[]> = new Map();
  private communicationErrors: Map<string, number> = new Map();
  private maxReadingHistory: number = 1000; // Keep last 1000 readings per sensor

  constructor() {
    this.initializeDefaultSensors();
  }

  /**
   * Initialize default TEG sensors for electric vehicle
   */
  private initializeDefaultSensors(): void {
    const defaultSensors: Partial<TEGSensor>[] = [
      {
        id: 'motor_fl_teg',
        location: {
          zone: 'frontLeftMotor',
          position: { x: 1.2, y: 0.8, z: 0.3 },
          priority: 'critical',
          description: 'Front left motor housing',
          mountingType: 'surface'
        }
      },
      {
        id: 'motor_fr_teg',
        location: {
          zone: 'frontRightMotor',
          position: { x: 1.2, y: -0.8, z: 0.3 },
          priority: 'critical',
          description: 'Front right motor housing',
          mountingType: 'surface'
        }
      },
      {
        id: 'battery_main_teg',
        location: {
          zone: 'batteryPack',
          position: { x: 0, y: 0, z: -0.2 },
          priority: 'critical',
          description: 'Main battery pack center',
          mountingType: 'embedded'
        }
      },
      {
        id: 'inverter_main_teg',
        location: {
          zone: 'powerElectronics',
          position: { x: 0.8, y: 0, z: 0.5 },
          priority: 'high',
          description: 'Main inverter unit',
          mountingType: 'surface'
        }
      }
    ];

    defaultSensors.forEach(sensorData => {
      if (sensorData.id && sensorData.location) {
        this.addSensor(sensorData.id, sensorData.location);
      }
    });
  }

  /**
   * Add a new TEG sensor to the system
   */
  public addSensor(
    sensorId: string, 
    location: SensorLocation,
    specifications?: Partial<TEGSpecifications>,
    calibration?: Partial<SensorCalibration>
  ): void {
    if (this.sensors.has(sensorId)) {
      throw new Error(`Sensor ${sensorId} already exists`);
    }

    const defaultSpecs: TEGSpecifications = {
      manufacturer: 'Generic',
      model: 'TEG-Standard',
      seebeckCoefficient: 200e-6,    // 200 µV/K for Bi2Te3
      thermalConductivity: 1.5,      // W/m·K
      electricalResistance: 0.5,     // Ω
      maxTemperature: 150,           // °C
      maxCurrent: 2.0,               // A
      maxVoltage: 1.0,               // V
      dimensions: {
        length: 40,                  // mm
        width: 40,                   // mm
        thickness: 4                 // mm
      },
      operatingRange: {
        minTemp: -40,                // °C
        maxTemp: 150                 // °C
      }
    };

    const defaultCalibration: SensorCalibration = {
      currentMultiplier: 1.0,
      voltageMultiplier: 1.0,
      temperatureOffset: 0.0,
      temperatureMultiplier: 1.0,
      resistanceOffset: 0.0,
      lastCalibrationTemp: 25.0
    };

    const sensor: TEGSensor = {
      id: sensorId,
      location,
      calibration: { ...defaultCalibration, ...calibration },
      specifications: { ...defaultSpecs, ...specifications },
      status: {
        operational: true,
        lastCommunication: Date.now(),
        errorCount: 0,
        warningCount: 0,
        healthScore: 1.0,
        faultCodes: [],
        maintenanceRequired: false,
        calibrationDue: false
      },
      lastReading: null,
      installationDate: new Date(),
      lastCalibrationDate: new Date(),
      operatingHours: 0
    };

    this.sensors.set(sensorId, sensor);
    this.sensorReadings.set(sensorId, []);
    this.calibrationHistory.set(sensorId, [sensor.calibration]);
    this.communicationErrors.set(sensorId, 0);

    console.log(`TEG sensor ${sensorId} added to zone ${location.zone}`);
  }

  /**
   * Remove a sensor from the system
   */
  public removeSensor(sensorId: string): void {
    if (!this.sensors.has(sensorId)) {
      throw new Error(`Sensor ${sensorId} not found`);
    }

    this.sensors.delete(sensorId);
    this.sensorReadings.delete(sensorId);
    this.calibrationHistory.delete(sensorId);
    this.communicationErrors.delete(sensorId);

    console.log(`TEG sensor ${sensorId} removed`);
  }

  /**
   * Update sensor reading
   */
  public updateSensorReading(sensorId: string, rawReading: Partial<TEGReading>): TEGReading {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) {
      throw new Error(`Sensor ${sensorId} not found`);
    }

    // Create complete reading with defaults
    const reading: TEGReading = {
      timestamp: Date.now(),
      current: 0,
      voltage: 0,
      temperature: 25,
      resistance: sensor.specifications.electricalResistance,
      powerOutput: 0,
      thermalGradient: 0,
      signalQuality: 1.0,
      ...rawReading
    };

    // Apply calibration
    const calibratedReading = this.applyCalibration(reading, sensor.calibration);

    // Validate reading
    this.validateReading(calibratedReading, sensor.specifications);

    // Calculate derived values
    calibratedReading.powerOutput = calibratedReading.current * calibratedReading.voltage;
    calibratedReading.resistance = calibratedReading.voltage / Math.max(calibratedReading.current, 0.001);

    // Store reading
    this.storeReading(sensorId, calibratedReading);

    // Update sensor status
    this.updateSensorStatus(sensorId, calibratedReading);

    return calibratedReading;
  }

  /**
   * Apply calibration to raw reading
   */
  private applyCalibration(reading: TEGReading, calibration: SensorCalibration): TEGReading {
    return {
      ...reading,
      current: reading.current * calibration.currentMultiplier,
      voltage: reading.voltage * calibration.voltageMultiplier,
      temperature: (reading.temperature * calibration.temperatureMultiplier) + calibration.temperatureOffset,
      resistance: reading.resistance + calibration.resistanceOffset
    };
  }

  /**
   * Validate sensor reading against specifications
   */
  private validateReading(reading: TEGReading, specs: TEGSpecifications): void {
    if (reading.current < 0 || reading.current > specs.maxCurrent * 1.1) {
      throw new Error(`Current reading ${reading.current}A exceeds sensor limits`);
    }

    if (reading.voltage < 0 || reading.voltage > specs.maxVoltage * 1.1) {
      throw new Error(`Voltage reading ${reading.voltage}V exceeds sensor limits`);
    }

    if (reading.temperature < specs.operatingRange.minTemp - 10 || 
        reading.temperature > specs.operatingRange.maxTemp + 10) {
      throw new Error(`Temperature reading ${reading.temperature}°C exceeds sensor operating range`);
    }

    if (reading.signalQuality < 0 || reading.signalQuality > 1) {
      throw new Error(`Invalid signal quality: ${reading.signalQuality}`);
    }
  }

  /**
   * Store reading in history
   */
  private storeReading(sensorId: string, reading: TEGReading): void {
    const readings = this.sensorReadings.get(sensorId)!;
    readings.push(reading);

    // Limit history size
    if (readings.length > this.maxReadingHistory) {
      readings.splice(0, readings.length - this.maxReadingHistory);
    }

    // Update sensor's last reading
    const sensor = this.sensors.get(sensorId)!;
    sensor.lastReading = reading;
  }

  /**
   * Update sensor status based on reading
   */
  private updateSensorStatus(sensorId: string, reading: TEGReading): void {
    const sensor = this.sensors.get(sensorId)!;
    
    // Update communication timestamp
    sensor.status.lastCommunication = reading.timestamp;

    // Reset communication error count on successful reading
    this.communicationErrors.set(sensorId, 0);

    // Update health score based on signal quality and reading consistency
    this.updateHealthScore(sensorId, reading);

    // Check for warnings and faults
    this.checkSensorWarnings(sensorId, reading);

    // Update operating hours (approximate)
    const hoursSinceLastReading = sensor.lastReading ? 
      (reading.timestamp - sensor.lastReading.timestamp) / (1000 * 60 * 60) : 0;
    sensor.operatingHours += hoursSinceLastReading;

    // Check if calibration is due
    const daysSinceCalibration = (Date.now() - sensor.lastCalibrationDate.getTime()) / (1000 * 60 * 60 * 24);
    sensor.status.calibrationDue = daysSinceCalibration > 365; // Annual calibration
  }

  /**
   * Update sensor health score
   */
  private updateHealthScore(sensorId: string, reading: TEGReading): void {
    const sensor = this.sensors.get(sensorId)!;
    const readings = this.sensorReadings.get(sensorId)!;

    let healthScore = 1.0;

    // Reduce health based on signal quality
    healthScore *= reading.signalQuality;

    // Reduce health based on reading consistency
    if (readings.length > 10) {
      const recentReadings = readings.slice(-10);
      const currentVariance = this.calculateVariance(recentReadings.map(r => r.current));
      const tempVariance = this.calculateVariance(recentReadings.map(r => r.temperature));
      
      // High variance indicates potential sensor issues
      if (currentVariance > 0.01) healthScore *= 0.9; // 10% reduction for high current variance
      if (tempVariance > 25) healthScore *= 0.9;      // 10% reduction for high temp variance
    }

    // Reduce health based on error count
    healthScore *= Math.max(0.5, 1 - (sensor.status.errorCount * 0.1));

    // Reduce health based on operating hours
    const maxOperatingHours = 87600; // 10 years
    const ageingFactor = Math.max(0.7, 1 - (sensor.operatingHours / maxOperatingHours) * 0.3);
    healthScore *= ageingFactor;

    sensor.status.healthScore = Math.max(0, Math.min(1, healthScore));
  }

  /**
   * Calculate variance of an array of numbers
   */
  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Check for sensor warnings and faults
   */
  private checkSensorWarnings(sensorId: string, reading: TEGReading): void {
    const sensor = this.sensors.get(sensorId)!;
    const specs = sensor.specifications;

    // Clear previous fault codes
    sensor.status.faultCodes = [];

    // Check for temperature warnings
    if (reading.temperature > specs.maxTemperature * 0.9) {
      sensor.status.faultCodes.push('HIGH_TEMPERATURE');
      sensor.status.warningCount++;
    }

    if (reading.temperature < specs.operatingRange.minTemp) {
      sensor.status.faultCodes.push('LOW_TEMPERATURE');
      sensor.status.warningCount++;
    }

    // Check for current warnings
    if (reading.current > specs.maxCurrent * 0.9) {
      sensor.status.faultCodes.push('HIGH_CURRENT');
      sensor.status.warningCount++;
    }

    // Check for signal quality warnings
    if (reading.signalQuality < 0.8) {
      sensor.status.faultCodes.push('POOR_SIGNAL_QUALITY');
      sensor.status.warningCount++;
    }

    // Check for resistance drift (indicates sensor degradation)
    const expectedResistance = specs.electricalResistance;
    const resistanceDrift = Math.abs(reading.resistance - expectedResistance) / expectedResistance;
    if (resistanceDrift > 0.2) { // 20% drift
      sensor.status.faultCodes.push('RESISTANCE_DRIFT');
      sensor.status.warningCount++;
    }

    // Update maintenance required flag
    sensor.status.maintenanceRequired = 
      sensor.status.healthScore < 0.7 || 
      sensor.status.faultCodes.length > 2 ||
      sensor.status.calibrationDue;

    // Update operational status
    sensor.status.operational = 
      sensor.status.healthScore > 0.3 && 
      reading.signalQuality > 0.5 &&
      !sensor.status.faultCodes.includes('HIGH_TEMPERATURE');
  }

  /**
   * Handle communication error
   */
  public handleCommunicationError(sensorId: string, error: Error): void {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) return;

    const errorCount = this.communicationErrors.get(sensorId) || 0;
    this.communicationErrors.set(sensorId, errorCount + 1);

    sensor.status.errorCount++;
    sensor.status.faultCodes.push('COMMUNICATION_ERROR');

    // Mark sensor as non-operational after multiple communication errors
    if (errorCount > 5) {
      sensor.status.operational = false;
      sensor.status.faultCodes.push('COMMUNICATION_FAILURE');
    }

    console.error(`Communication error with sensor ${sensorId}:`, error.message);
  }

  /**
   * Calibrate sensor
   */
  public calibrateSensor(
    sensorId: string, 
    referenceTemperature: number,
    referenceCurrent: number,
    referenceVoltage: number
  ): void {
    const sensor = this.sensors.get(sensorId);
    if (!sensor || !sensor.lastReading) {
      throw new Error(`Cannot calibrate sensor ${sensorId}: sensor not found or no readings available`);
    }

    const lastReading = sensor.lastReading;
    
    // Calculate calibration factors
    const currentMultiplier = referenceCurrent / lastReading.current;
    const voltageMultiplier = referenceVoltage / lastReading.voltage;
    const temperatureOffset = referenceTemperature - lastReading.temperature;

    // Update calibration
    const newCalibration: SensorCalibration = {
      ...sensor.calibration,
      currentMultiplier: currentMultiplier,
      voltageMultiplier: voltageMultiplier,
      temperatureOffset: temperatureOffset,
      lastCalibrationTemp: referenceTemperature
    };

    sensor.calibration = newCalibration;
    sensor.lastCalibrationDate = new Date();
    sensor.status.calibrationDue = false;

    // Store calibration history
    const history = this.calibrationHistory.get(sensorId)!;
    history.push(newCalibration);

    console.log(`Sensor ${sensorId} calibrated successfully`);
  }

  /**
   * Get sensor information
   */
  public getSensor(sensorId: string): TEGSensor | undefined {
    return this.sensors.get(sensorId);
  }

  /**
   * Get all sensors
   */
  public getAllSensors(): TEGSensor[] {
    return Array.from(this.sensors.values());
  }

  /**
   * Get sensors by zone
   */
  public getSensorsByZone(zone: string): TEGSensor[] {
    return Array.from(this.sensors.values()).filter(sensor => 
      sensor.location.zone === zone
    );
  }

  /**
   * Get sensor readings history
   */
  public getSensorReadings(sensorId: string, count?: number): TEGReading[] {
    const readings = this.sensorReadings.get(sensorId) || [];
    return count ? readings.slice(-count) : readings;
  }

  /**
   * Get sensor diagnostics
   */
  public getSensorDiagnostics(sensorId: string): {
    sensor: TEGSensor;
    recentReadings: TEGReading[];
    averageValues: {
      current: number;
      voltage: number;
      temperature: number;
      powerOutput: number;
    };
    calibrationHistory: SensorCalibration[];
    communicationErrors: number;
  } | undefined {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) return undefined;

    const recentReadings = this.getSensorReadings(sensorId, 100);
    const calibrationHistory = this.calibrationHistory.get(sensorId) || [];
    const communicationErrors = this.communicationErrors.get(sensorId) || 0;

    // Calculate averages
    const averageValues = {
      current: 0,
      voltage: 0,
      temperature: 0,
      powerOutput: 0
    };

    if (recentReadings.length > 0) {
      averageValues.current = recentReadings.reduce((sum, r) => sum + r.current, 0) / recentReadings.length;
      averageValues.voltage = recentReadings.reduce((sum, r) => sum + r.voltage, 0) / recentReadings.length;
      averageValues.temperature = recentReadings.reduce((sum, r) => sum + r.temperature, 0) / recentReadings.length;
      averageValues.powerOutput = recentReadings.reduce((sum, r) => sum + r.powerOutput, 0) / recentReadings.length;
    }

    return {
      sensor,
      recentReadings,
      averageValues,
      calibrationHistory,
      communicationErrors
    };
  }

  /**
   * Get system-wide sensor statistics
   */
  public getSystemStatistics(): {
    totalSensors: number;
    operationalSensors: number;
    sensorsRequiringMaintenance: number;
    sensorsRequiringCalibration: number;
    averageHealthScore: number;
    zoneDistribution: { [zone: string]: number };
  } {
    const sensors = Array.from(this.sensors.values());
    
    const operationalSensors = sensors.filter(s => s.status.operational).length;
    const sensorsRequiringMaintenance = sensors.filter(s => s.status.maintenanceRequired).length;
    const sensorsRequiringCalibration = sensors.filter(s => s.status.calibrationDue).length;
    
    const averageHealthScore = sensors.length > 0 ? 
      sensors.reduce((sum, s) => sum + s.status.healthScore, 0) / sensors.length : 0;

    const zoneDistribution: { [zone: string]: number } = {};
    sensors.forEach(sensor => {
      const zone = sensor.location.zone;
      zoneDistribution[zone] = (zoneDistribution[zone] || 0) + 1;
    });

    return {
      totalSensors: sensors.length,
      operationalSensors,
      sensorsRequiringMaintenance,
      sensorsRequiringCalibration,
      averageHealthScore,
      zoneDistribution
    };
  }

  /**
   * Update sensor configuration
   */
  public updateSensorConfiguration(
    sensorId: string, 
    updates: {
      location?: Partial<SensorLocation>;
      specifications?: Partial<TEGSpecifications>;
      calibration?: Partial<SensorCalibration>;
    }
  ): void {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) {
      throw new Error(`Sensor ${sensorId} not found`);
    }

    if (updates.location) {
      sensor.location = { ...sensor.location, ...updates.location };
    }

    if (updates.specifications) {
      sensor.specifications = { ...sensor.specifications, ...updates.specifications };
    }

    if (updates.calibration) {
      sensor.calibration = { ...sensor.calibration, ...updates.calibration };
      
      // Store in calibration history
      const history = this.calibrationHistory.get(sensorId)!;
      history.push(sensor.calibration);
    }

    console.log(`Sensor ${sensorId} configuration updated`);
  }

  /**
   * Reset sensor status and clear error history
   */
  public resetSensorStatus(sensorId: string): void {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) {
      throw new Error(`Sensor ${sensorId} not found`);
    }

    sensor.status.errorCount = 0;
    sensor.status.warningCount = 0;
    sensor.status.faultCodes = [];
    sensor.status.operational = true;
    sensor.status.healthScore = 1.0;

    this.communicationErrors.set(sensorId, 0);

    console.log(`Sensor ${sensorId} status reset`);
  }
}