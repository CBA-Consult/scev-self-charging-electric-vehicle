/**
 * Thermal Zone Controller - Manages thermal zones and shutdown procedures
 * 
 * This class handles the management of thermal zones within the vehicle,
 * coordinating shutdown procedures and thermal protection strategies.
 */

export interface ThermalZone {
  id: string;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  systems: SystemComponent[];
  sensors: string[];              // TEG sensor IDs in this zone
  boundaries: ZoneBoundaries;
  thermalLimits: ThermalLimits;
  shutdownProcedures: ShutdownProcedure[];
  status: ZoneStatus;
  lastUpdate: number;
}

export interface SystemComponent {
  id: string;
  name: string;
  type: 'motor' | 'battery' | 'inverter' | 'charger' | 'brake' | 'hvac' | 'auxiliary';
  powerRating: number;            // W - nominal power rating
  thermalCapacity: number;        // J/K - thermal capacity
  shutdownPriority: number;       // 1-10, 1 = highest priority for shutdown
  shutdownTime: number;           // ms - time required for safe shutdown
  cooldownTime: number;           // ms - minimum cooldown time
  dependencies: string[];         // IDs of dependent components
  canOperateReduced: boolean;     // Can operate at reduced capacity
}

export interface ZoneBoundaries {
  center: { x: number; y: number; z: number };
  dimensions: { length: number; width: number; height: number };
  shape: 'rectangular' | 'cylindrical' | 'spherical' | 'irregular';
  thermalIsolation: number;       // 0-1, 1 = perfect isolation
}

export interface ThermalLimits {
  normalOperating: number;        // °C - normal operating temperature
  warningThreshold: number;       // °C - warning temperature
  criticalThreshold: number;      // °C - critical temperature
  emergencyThreshold: number;     // °C - emergency shutdown temperature
  maxThermalGradient: number;     // °C/s - maximum temperature rise rate
  thermalMass: number;            // J/K - thermal mass of the zone
}

export interface ShutdownProcedure {
  id: string;
  name: string;
  triggerConditions: TriggerCondition[];
  steps: ShutdownStep[];
  estimatedDuration: number;      // ms - estimated completion time
  rollbackPossible: boolean;      // Can the shutdown be reversed
  safetyLevel: 'warning' | 'critical' | 'emergency';
}

export interface TriggerCondition {
  type: 'temperature' | 'current' | 'gradient' | 'time' | 'external';
  threshold: number;
  operator: '>' | '<' | '==' | '>=' | '<=';
  duration: number;               // ms - condition must persist for this duration
}

export interface ShutdownStep {
  stepNumber: number;
  description: string;
  componentIds: string[];         // Components affected by this step
  action: 'reduce_power' | 'graceful_shutdown' | 'immediate_shutdown' | 'isolate' | 'cool';
  parameters: { [key: string]: any };
  timeout: number;                // ms - maximum time for this step
  rollbackAction?: string;        // Action to reverse this step
}

export interface ZoneStatus {
  operational: boolean;
  shutdownActive: boolean;
  currentProcedure?: string;      // ID of active shutdown procedure
  currentStep?: number;           // Current step in shutdown procedure
  temperature: number;            // °C - current zone temperature
  thermalGradient: number;        // °C/s - current temperature change rate
  powerConsumption: number;       // W - current power consumption
  cooldownRemaining: number;      // ms - remaining cooldown time
  lastShutdown?: number;          // timestamp of last shutdown
  faultConditions: string[];      // Active fault conditions
}

export interface ZoneConfiguration {
  thermalMonitoringEnabled: boolean;
  automaticShutdownEnabled: boolean;
  shutdownDelayMs: number;        // Delay before executing shutdown
  cooldownRequiredMs: number;     // Required cooldown time
  thermalHysteresis: number;      // °C - temperature hysteresis for reactivation
  maxShutdownsPerHour: number;    // Limit on shutdown frequency
  alertsEnabled: boolean;
  loggingEnabled: boolean;
}

export class ThermalZoneController {
  private zones: Map<string, ThermalZone> = new Map();
  private activeShutdowns: Map<string, ShutdownExecution> = new Map();
  private shutdownHistory: ShutdownEvent[] = [];
  private configuration: ZoneConfiguration;
  private alertCallbacks: Array<(alert: ZoneAlert) => void> = [];
  private shutdownCallbacks: Array<(event: ShutdownEvent) => void> = [];

  constructor(config?: Partial<ZoneConfiguration>) {
    this.configuration = {
      thermalMonitoringEnabled: true,
      automaticShutdownEnabled: true,
      shutdownDelayMs: 1000,
      cooldownRequiredMs: 30000,
      thermalHysteresis: 5.0,
      maxShutdownsPerHour: 10,
      alertsEnabled: true,
      loggingEnabled: true,
      ...config
    };

    this.initializeDefaultZones();
  }

  /**
   * Initialize default thermal zones for electric vehicle
   */
  private initializeDefaultZones(): void {
    const defaultZones: Partial<ThermalZone>[] = [
      {
        id: 'motor_zone_front',
        name: 'Front Motor Zone',
        description: 'Front left and right motor assemblies',
        priority: 'critical',
        boundaries: {
          center: { x: 1.2, y: 0, z: 0.3 },
          dimensions: { length: 0.8, width: 1.8, height: 0.6 },
          shape: 'rectangular',
          thermalIsolation: 0.7
        },
        thermalLimits: {
          normalOperating: 80,
          warningThreshold: 100,
          criticalThreshold: 120,
          emergencyThreshold: 140,
          maxThermalGradient: 5.0,
          thermalMass: 50000
        }
      },
      {
        id: 'motor_zone_rear',
        name: 'Rear Motor Zone',
        description: 'Rear left and right motor assemblies',
        priority: 'critical',
        boundaries: {
          center: { x: -1.2, y: 0, z: 0.3 },
          dimensions: { length: 0.8, width: 1.8, height: 0.6 },
          shape: 'rectangular',
          thermalIsolation: 0.7
        },
        thermalLimits: {
          normalOperating: 80,
          warningThreshold: 100,
          criticalThreshold: 120,
          emergencyThreshold: 140,
          maxThermalGradient: 5.0,
          thermalMass: 50000
        }
      },
      {
        id: 'battery_zone',
        name: 'Battery Pack Zone',
        description: 'Main battery pack and cooling system',
        priority: 'critical',
        boundaries: {
          center: { x: 0, y: 0, z: -0.2 },
          dimensions: { length: 2.0, width: 1.5, height: 0.3 },
          shape: 'rectangular',
          thermalIsolation: 0.9
        },
        thermalLimits: {
          normalOperating: 35,
          warningThreshold: 45,
          criticalThreshold: 55,
          emergencyThreshold: 65,
          maxThermalGradient: 2.0,
          thermalMass: 100000
        }
      },
      {
        id: 'power_electronics_zone',
        name: 'Power Electronics Zone',
        description: 'Inverters, converters, and power management',
        priority: 'high',
        boundaries: {
          center: { x: 0.5, y: 0, z: 0.5 },
          dimensions: { length: 1.0, width: 0.8, height: 0.4 },
          shape: 'rectangular',
          thermalIsolation: 0.6
        },
        thermalLimits: {
          normalOperating: 70,
          warningThreshold: 85,
          criticalThreshold: 100,
          emergencyThreshold: 115,
          maxThermalGradient: 3.0,
          thermalMass: 25000
        }
      }
    ];

    defaultZones.forEach(zoneData => {
      if (zoneData.id) {
        this.createZone(zoneData.id, zoneData);
      }
    });
  }

  /**
   * Create a new thermal zone
   */
  public createZone(zoneId: string, zoneData: Partial<ThermalZone>): void {
    if (this.zones.has(zoneId)) {
      throw new Error(`Zone ${zoneId} already exists`);
    }

    const zone: ThermalZone = {
      id: zoneId,
      name: zoneData.name || zoneId,
      description: zoneData.description || '',
      priority: zoneData.priority || 'medium',
      systems: zoneData.systems || [],
      sensors: zoneData.sensors || [],
      boundaries: zoneData.boundaries || {
        center: { x: 0, y: 0, z: 0 },
        dimensions: { length: 1, width: 1, height: 1 },
        shape: 'rectangular',
        thermalIsolation: 0.5
      },
      thermalLimits: zoneData.thermalLimits || {
        normalOperating: 60,
        warningThreshold: 80,
        criticalThreshold: 100,
        emergencyThreshold: 120,
        maxThermalGradient: 5.0,
        thermalMass: 10000
      },
      shutdownProcedures: zoneData.shutdownProcedures || this.createDefaultShutdownProcedures(zoneId),
      status: {
        operational: true,
        shutdownActive: false,
        temperature: 25,
        thermalGradient: 0,
        powerConsumption: 0,
        cooldownRemaining: 0,
        faultConditions: []
      },
      lastUpdate: Date.now()
    };

    this.zones.set(zoneId, zone);
    console.log(`Thermal zone ${zoneId} created`);
  }

  /**
   * Create default shutdown procedures for a zone
   */
  private createDefaultShutdownProcedures(zoneId: string): ShutdownProcedure[] {
    return [
      {
        id: `${zoneId}_warning_procedure`,
        name: 'Warning Level Thermal Management',
        triggerConditions: [
          {
            type: 'temperature',
            threshold: 80,
            operator: '>=',
            duration: 5000
          }
        ],
        steps: [
          {
            stepNumber: 1,
            description: 'Reduce power consumption to 80%',
            componentIds: [],
            action: 'reduce_power',
            parameters: { powerReduction: 0.2 },
            timeout: 2000
          },
          {
            stepNumber: 2,
            description: 'Increase cooling if available',
            componentIds: [],
            action: 'cool',
            parameters: { coolingIncrease: 0.3 },
            timeout: 3000
          }
        ],
        estimatedDuration: 5000,
        rollbackPossible: true,
        safetyLevel: 'warning'
      },
      {
        id: `${zoneId}_critical_procedure`,
        name: 'Critical Thermal Shutdown',
        triggerConditions: [
          {
            type: 'temperature',
            threshold: 100,
            operator: '>=',
            duration: 2000
          }
        ],
        steps: [
          {
            stepNumber: 1,
            description: 'Immediate power reduction to 50%',
            componentIds: [],
            action: 'reduce_power',
            parameters: { powerReduction: 0.5 },
            timeout: 1000
          },
          {
            stepNumber: 2,
            description: 'Graceful shutdown of non-essential systems',
            componentIds: [],
            action: 'graceful_shutdown',
            parameters: { shutdownDelay: 2000 },
            timeout: 5000
          },
          {
            stepNumber: 3,
            description: 'Activate emergency cooling',
            componentIds: [],
            action: 'cool',
            parameters: { emergencyCooling: true },
            timeout: 1000
          }
        ],
        estimatedDuration: 7000,
        rollbackPossible: false,
        safetyLevel: 'critical'
      },
      {
        id: `${zoneId}_emergency_procedure`,
        name: 'Emergency Thermal Shutdown',
        triggerConditions: [
          {
            type: 'temperature',
            threshold: 120,
            operator: '>=',
            duration: 500
          }
        ],
        steps: [
          {
            stepNumber: 1,
            description: 'Immediate shutdown of all systems',
            componentIds: [],
            action: 'immediate_shutdown',
            parameters: {},
            timeout: 500
          },
          {
            stepNumber: 2,
            description: 'Isolate zone from power',
            componentIds: [],
            action: 'isolate',
            parameters: {},
            timeout: 1000
          }
        ],
        estimatedDuration: 1500,
        rollbackPossible: false,
        safetyLevel: 'emergency'
      }
    ];
  }

  /**
   * Update zone temperature and status
   */
  public updateZoneStatus(zoneId: string, temperature: number, powerConsumption?: number): void {
    const zone = this.zones.get(zoneId);
    if (!zone) {
      throw new Error(`Zone ${zoneId} not found`);
    }

    const previousTemp = zone.status.temperature;
    const timeDelta = (Date.now() - zone.lastUpdate) / 1000; // seconds

    // Update temperature and calculate gradient
    zone.status.temperature = temperature;
    zone.status.thermalGradient = timeDelta > 0 ? (temperature - previousTemp) / timeDelta : 0;
    
    if (powerConsumption !== undefined) {
      zone.status.powerConsumption = powerConsumption;
    }

    zone.lastUpdate = Date.now();

    // Check for thermal violations
    this.checkThermalViolations(zone);

    // Update cooldown timer
    if (zone.status.cooldownRemaining > 0) {
      zone.status.cooldownRemaining = Math.max(0, zone.status.cooldownRemaining - (timeDelta * 1000));
    }
  }

  /**
   * Check for thermal violations and trigger appropriate responses
   */
  private checkThermalViolations(zone: ThermalZone): void {
    if (!this.configuration.thermalMonitoringEnabled || zone.status.shutdownActive) {
      return;
    }

    const temp = zone.status.temperature;
    const gradient = zone.status.thermalGradient;
    const limits = zone.thermalLimits;

    // Check for emergency conditions
    if (temp >= limits.emergencyThreshold || gradient >= limits.maxThermalGradient * 2) {
      this.triggerShutdownProcedure(zone.id, 'emergency');
      return;
    }

    // Check for critical conditions
    if (temp >= limits.criticalThreshold || gradient >= limits.maxThermalGradient) {
      this.triggerShutdownProcedure(zone.id, 'critical');
      return;
    }

    // Check for warning conditions
    if (temp >= limits.warningThreshold) {
      this.triggerShutdownProcedure(zone.id, 'warning');
      return;
    }
  }

  /**
   * Trigger shutdown procedure for a zone
   */
  public triggerShutdownProcedure(zoneId: string, level: 'warning' | 'critical' | 'emergency'): void {
    const zone = this.zones.get(zoneId);
    if (!zone) {
      throw new Error(`Zone ${zoneId} not found`);
    }

    if (!this.configuration.automaticShutdownEnabled) {
      console.warn(`Automatic shutdown disabled - manual intervention required for zone ${zoneId}`);
      return;
    }

    // Check shutdown frequency limits
    if (!this.canExecuteShutdown(zoneId)) {
      console.warn(`Shutdown frequency limit exceeded for zone ${zoneId}`);
      return;
    }

    // Find appropriate shutdown procedure
    const procedure = zone.shutdownProcedures.find(p => p.safetyLevel === level);
    if (!procedure) {
      console.error(`No shutdown procedure found for level ${level} in zone ${zoneId}`);
      return;
    }

    // Execute shutdown procedure
    this.executeShutdownProcedure(zone, procedure);
  }

  /**
   * Check if shutdown can be executed based on frequency limits
   */
  private canExecuteShutdown(zoneId: string): boolean {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentShutdowns = this.shutdownHistory.filter(event => 
      event.zoneId === zoneId && 
      event.timestamp > oneHourAgo
    );

    return recentShutdowns.length < this.configuration.maxShutdownsPerHour;
  }

  /**
   * Execute shutdown procedure
   */
  private executeShutdownProcedure(zone: ThermalZone, procedure: ShutdownProcedure): void {
    console.warn(`Executing ${procedure.safetyLevel} shutdown procedure for zone ${zone.id}: ${procedure.name}`);

    // Create shutdown execution context
    const execution: ShutdownExecution = {
      zoneId: zone.id,
      procedureId: procedure.id,
      startTime: Date.now(),
      currentStep: 0,
      status: 'executing',
      steps: procedure.steps.map(step => ({
        ...step,
        status: 'pending',
        startTime: 0,
        endTime: 0
      }))
    };

    // Update zone status
    zone.status.shutdownActive = true;
    zone.status.currentProcedure = procedure.id;
    zone.status.currentStep = 0;

    // Store execution context
    this.activeShutdowns.set(zone.id, execution);

    // Create shutdown event
    const shutdownEvent: ShutdownEvent = {
      zoneId: zone.id,
      procedureId: procedure.id,
      timestamp: Date.now(),
      reason: `Thermal violation - Temperature: ${zone.status.temperature.toFixed(1)}°C, Gradient: ${zone.status.thermalGradient.toFixed(2)}°C/s`,
      level: procedure.safetyLevel,
      estimatedDuration: procedure.estimatedDuration,
      status: 'started'
    };

    // Add to history
    this.shutdownHistory.push(shutdownEvent);

    // Notify callbacks
    this.notifyShutdownCallbacks(shutdownEvent);

    // Start executing steps
    this.executeNextStep(execution);
  }

  /**
   * Execute next step in shutdown procedure
   */
  private executeNextStep(execution: ShutdownExecution): void {
    if (execution.currentStep >= execution.steps.length) {
      this.completeShutdownProcedure(execution);
      return;
    }

    const step = execution.steps[execution.currentStep];
    step.status = 'executing';
    step.startTime = Date.now();

    console.log(`Executing step ${step.stepNumber}: ${step.description}`);

    // Simulate step execution
    setTimeout(() => {
      this.completeStep(execution, step);
    }, Math.min(step.timeout, 5000)); // Cap at 5 seconds for simulation
  }

  /**
   * Complete a shutdown step
   */
  private completeStep(execution: ShutdownExecution, step: ShutdownStepExecution): void {
    step.status = 'completed';
    step.endTime = Date.now();

    console.log(`Completed step ${step.stepNumber} in ${step.endTime - step.startTime}ms`);

    // Move to next step
    execution.currentStep++;
    
    // Update zone status
    const zone = this.zones.get(execution.zoneId);
    if (zone) {
      zone.status.currentStep = execution.currentStep;
    }

    // Execute next step
    this.executeNextStep(execution);
  }

  /**
   * Complete shutdown procedure
   */
  private completeShutdownProcedure(execution: ShutdownExecution): void {
    execution.status = 'completed';
    const zone = this.zones.get(execution.zoneId);

    if (zone) {
      zone.status.cooldownRemaining = this.configuration.cooldownRequiredMs;
      zone.status.lastShutdown = Date.now();
      zone.status.currentProcedure = undefined;
      zone.status.currentStep = undefined;

      console.log(`Shutdown procedure completed for zone ${zone.id}. Cooldown period: ${this.configuration.cooldownRequiredMs}ms`);
    }

    // Update shutdown event
    const shutdownEvent = this.shutdownHistory.find(event => 
      event.zoneId === execution.zoneId && 
      event.procedureId === execution.procedureId &&
      event.status === 'started'
    );

    if (shutdownEvent) {
      shutdownEvent.status = 'completed';
      shutdownEvent.actualDuration = Date.now() - shutdownEvent.timestamp;
      this.notifyShutdownCallbacks(shutdownEvent);
    }

    // Remove from active shutdowns
    this.activeShutdowns.delete(execution.zoneId);
  }

  /**
   * Check if zone can be reactivated
   */
  public canReactivateZone(zoneId: string): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone || !zone.status.shutdownActive) {
      return false;
    }

    // Check cooldown period
    if (zone.status.cooldownRemaining > 0) {
      return false;
    }

    // Check temperature is below reactivation threshold
    const reactivationThreshold = zone.thermalLimits.normalOperating + this.configuration.thermalHysteresis;
    if (zone.status.temperature > reactivationThreshold) {
      return false;
    }

    // Check thermal gradient is stable
    if (Math.abs(zone.status.thermalGradient) > 1.0) {
      return false;
    }

    return true;
  }

  /**
   * Reactivate a zone after shutdown
   */
  public reactivateZone(zoneId: string): void {
    if (!this.canReactivateZone(zoneId)) {
      throw new Error(`Zone ${zoneId} cannot be reactivated at this time`);
    }

    const zone = this.zones.get(zoneId)!;
    zone.status.shutdownActive = false;
    zone.status.operational = true;
    zone.status.cooldownRemaining = 0;
    zone.status.faultConditions = [];

    console.log(`Zone ${zoneId} reactivated`);

    // Generate reactivation alert
    this.generateAlert({
      type: 'reactivation',
      zoneId,
      message: `Zone ${zone.name} reactivated after thermal cooldown`,
      timestamp: Date.now(),
      severity: 'info'
    });
  }

  /**
   * Get zone information
   */
  public getZone(zoneId: string): ThermalZone | undefined {
    return this.zones.get(zoneId);
  }

  /**
   * Get all zones
   */
  public getAllZones(): ThermalZone[] {
    return Array.from(this.zones.values());
  }

  /**
   * Get zones by priority
   */
  public getZonesByPriority(priority: 'low' | 'medium' | 'high' | 'critical'): ThermalZone[] {
    return Array.from(this.zones.values()).filter(zone => zone.priority === priority);
  }

  /**
   * Get active shutdowns
   */
  public getActiveShutdowns(): ShutdownExecution[] {
    return Array.from(this.activeShutdowns.values());
  }

  /**
   * Get shutdown history
   */
  public getShutdownHistory(zoneId?: string, limit?: number): ShutdownEvent[] {
    let history = this.shutdownHistory;
    
    if (zoneId) {
      history = history.filter(event => event.zoneId === zoneId);
    }

    if (limit) {
      history = history.slice(-limit);
    }

    return history;
  }

  /**
   * Generate alert
   */
  private generateAlert(alert: ZoneAlert): void {
    if (!this.configuration.alertsEnabled) {
      return;
    }

    this.notifyAlertCallbacks(alert);
  }

  /**
   * Notify alert callbacks
   */
  private notifyAlertCallbacks(alert: ZoneAlert): void {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in zone alert callback:', error);
      }
    });
  }

  /**
   * Notify shutdown callbacks
   */
  private notifyShutdownCallbacks(event: ShutdownEvent): void {
    this.shutdownCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in shutdown event callback:', error);
      }
    });
  }

  /**
   * Register alert callback
   */
  public onAlert(callback: (alert: ZoneAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Register shutdown event callback
   */
  public onShutdownEvent(callback: (event: ShutdownEvent) => void): void {
    this.shutdownCallbacks.push(callback);
  }

  /**
   * Update zone configuration
   */
  public updateConfiguration(newConfig: Partial<ZoneConfiguration>): void {
    this.configuration = { ...this.configuration, ...newConfig };
    console.log('Thermal zone controller configuration updated');
  }

  /**
   * Get system statistics
   */
  public getSystemStatistics(): {
    totalZones: number;
    operationalZones: number;
    zonesInShutdown: number;
    zonesInCooldown: number;
    totalShutdowns: number;
    shutdownsLastHour: number;
    averageTemperature: number;
  } {
    const zones = Array.from(this.zones.values());
    const operationalZones = zones.filter(z => z.status.operational && !z.status.shutdownActive).length;
    const zonesInShutdown = zones.filter(z => z.status.shutdownActive).length;
    const zonesInCooldown = zones.filter(z => z.status.cooldownRemaining > 0).length;

    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const shutdownsLastHour = this.shutdownHistory.filter(event => event.timestamp > oneHourAgo).length;

    const averageTemperature = zones.length > 0 ? 
      zones.reduce((sum, z) => sum + z.status.temperature, 0) / zones.length : 0;

    return {
      totalZones: zones.length,
      operationalZones,
      zonesInShutdown,
      zonesInCooldown,
      totalShutdowns: this.shutdownHistory.length,
      shutdownsLastHour,
      averageTemperature
    };
  }
}

/**
 * Supporting interfaces
 */
interface ShutdownExecution {
  zoneId: string;
  procedureId: string;
  startTime: number;
  currentStep: number;
  status: 'executing' | 'completed' | 'failed';
  steps: ShutdownStepExecution[];
}

interface ShutdownStepExecution extends ShutdownStep {
  status: 'pending' | 'executing' | 'completed' | 'failed';
  startTime: number;
  endTime: number;
}

interface ShutdownEvent {
  zoneId: string;
  procedureId: string;
  timestamp: number;
  reason: string;
  level: 'warning' | 'critical' | 'emergency';
  estimatedDuration: number;
  actualDuration?: number;
  status: 'started' | 'completed' | 'failed';
}

interface ZoneAlert {
  type: 'warning' | 'critical' | 'shutdown' | 'reactivation' | 'error';
  zoneId: string;
  message: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
}