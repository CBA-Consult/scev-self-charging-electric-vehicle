/**
 * Type definitions for Suspension Energy Storage System
 */

export interface SuspensionEnergyInputs {
  /** Generated power from suspension system (W) */
  inputPower: number;
  /** Input voltage from energy harvester (V) */
  inputVoltage: number;
  /** Input current from energy harvester (A) */
  inputCurrent: number;
  /** Suspension velocity for power prediction (m/s) */
  suspensionVelocity: number;
  /** Vehicle speed for energy management (km/h) */
  vehicleSpeed: number;
  /** Ambient temperature (°C) */
  ambientTemperature: number;
  /** System load demand (W) */
  loadDemand: number;
}

export interface EnergyStorageOutputs {
  /** Power delivered to load (W) */
  outputPower: number;
  /** Output voltage (V) */
  outputVoltage: number;
  /** Output current (A) */
  outputCurrent: number;
  /** System efficiency (0-1) */
  efficiency: number;
  /** Total stored energy (Wh) */
  totalStoredEnergy: number;
  /** Available power capacity (W) */
  availablePowerCapacity: number;
  /** Energy storage status */
  storageStatus: StorageSystemStatus;
}

export interface StorageSystemStatus {
  /** Overall system operational status */
  operational: boolean;
  /** Supercapacitor state of charge (0-1) */
  capacitorSOC: number;
  /** Battery state of charge (0-1) */
  batterySOC: number;
  /** System temperature (°C) */
  systemTemperature: number;
  /** Active alarms */
  alarms: string[];
  /** Active warnings */
  warnings: string[];
  /** Current operating mode */
  operatingMode: OperatingMode;
  /** Power flow direction */
  powerFlow: PowerFlowDirection;
}

export interface CapacitorBankConfig {
  /** Total capacitance (F) */
  totalCapacitance: number;
  /** Maximum voltage (V) */
  maxVoltage: number;
  /** Maximum current (A) */
  maxCurrent: number;
  /** Energy density (Wh/kg) */
  energyDensity: number;
  /** Power density (W/kg) */
  powerDensity: number;
  /** Internal resistance (Ω) */
  internalResistance: number;
  /** Operating temperature range [min, max] (°C) */
  temperatureRange: [number, number];
  /** Cycle life */
  cycleLife: number;
  /** Self-discharge rate (%/hour) */
  selfDischargeRate: number;
}

export interface BatteryPackConfig {
  /** Total capacity (Wh) */
  totalCapacity: number;
  /** Nominal voltage (V) */
  nominalVoltage: number;
  /** Maximum charge current (A) */
  maxChargeCurrent: number;
  /** Maximum discharge current (A) */
  maxDischargeCurrent: number;
  /** Energy density (Wh/kg) */
  energyDensity: number;
  /** Charge efficiency (0-1) */
  chargeEfficiency: number;
  /** Discharge efficiency (0-1) */
  dischargeEfficiency: number;
  /** Operating temperature range [min, max] (°C) */
  temperatureRange: [number, number];
  /** SOC operating limits [min, max] (0-1) */
  socLimits: [number, number];
  /** Cycle life */
  cycleLife: number;
  /** Calendar life (years) */
  calendarLife: number;
}

export interface PowerManagementConfig {
  /** Maximum power transfer rate between capacitor and battery (W) */
  maxPowerTransferRate: number;
  /** Capacitor SOC thresholds for battery charging [start, stop] */
  capacitorChargingThresholds: [number, number];
  /** Battery SOC thresholds for load supply [min, max] */
  batterySupplyThresholds: [number, number];
  /** Power smoothing time constant (seconds) */
  powerSmoothingTimeConstant: number;
  /** Energy efficiency target (0-1) */
  efficiencyTarget: number;
  /** Thermal management thresholds [warning, critical] (°C) */
  thermalThresholds: [number, number];
}

export interface EnergyStorageSystemConfig {
  /** Supercapacitor bank configuration */
  capacitorBank: CapacitorBankConfig;
  /** Battery pack configuration */
  batteryPack: BatteryPackConfig;
  /** Power management configuration */
  powerManagement: PowerManagementConfig;
  /** System identification */
  systemId: string;
  /** Installation location */
  location: 'front_left' | 'front_right' | 'rear_left' | 'rear_right' | 'central';
}

export type OperatingMode = 
  | 'charging'           // Storing energy from suspension
  | 'discharging'        // Supplying power to load
  | 'balancing'          // Transferring energy between storage components
  | 'standby'            // Minimal activity, maintaining charge
  | 'protection'         // Safety mode due to fault condition
  | 'maintenance';       // Maintenance or diagnostic mode

export type PowerFlowDirection = 
  | 'input_to_capacitor'     // Harvested energy charging capacitors
  | 'capacitor_to_battery'   // Capacitors charging battery
  | 'battery_to_load'        // Battery supplying load
  | 'capacitor_to_load'      // Capacitors directly supplying load
  | 'bidirectional'          // Multiple simultaneous flows
  | 'none';                  // No significant power flow

export interface EnergyFlowMetrics {
  /** Energy input from suspension (Wh) */
  energyInput: number;
  /** Energy stored in capacitors (Wh) */
  capacitorEnergy: number;
  /** Energy stored in battery (Wh) */
  batteryEnergy: number;
  /** Energy delivered to load (Wh) */
  energyOutput: number;
  /** Energy lost to inefficiencies (Wh) */
  energyLosses: number;
  /** Round-trip efficiency (0-1) */
  roundTripEfficiency: number;
}

export interface PerformanceMetrics {
  /** Average power generation (W) */
  averagePowerGeneration: number;
  /** Peak power generation (W) */
  peakPowerGeneration: number;
  /** Energy harvesting efficiency (0-1) */
  harvestingEfficiency: number;
  /** Storage utilization factor (0-1) */
  storageUtilization: number;
  /** Power spike mitigation effectiveness (0-1) */
  spikeMitigationEffectiveness: number;
  /** System availability (0-1) */
  systemAvailability: number;
  /** Mean time between failures (hours) */
  mtbf: number;
  /** Total energy throughput (kWh) */
  totalEnergyThroughput: number;
}

export interface SafetyLimits {
  /** Maximum system voltage (V) */
  maxSystemVoltage: number;
  /** Maximum system current (A) */
  maxSystemCurrent: number;
  /** Maximum system power (W) */
  maxSystemPower: number;
  /** Maximum operating temperature (°C) */
  maxOperatingTemperature: number;
  /** Minimum operating temperature (°C) */
  minOperatingTemperature: number;
  /** Maximum charge rate (C-rate) */
  maxChargeRate: number;
  /** Maximum discharge rate (C-rate) */
  maxDischargeRate: number;
  /** Insulation resistance threshold (MΩ) */
  insulationResistanceThreshold: number;
}

export interface DiagnosticData {
  /** Component health status */
  componentHealth: {
    capacitorBank: ComponentHealth;
    batteryPack: ComponentHealth;
    powerElectronics: ComponentHealth;
    thermalManagement: ComponentHealth;
  };
  /** Performance trends */
  performanceTrends: {
    efficiencyTrend: number[];
    capacityTrend: number[];
    temperatureTrend: number[];
    powerTrend: number[];
  };
  /** Fault history */
  faultHistory: FaultRecord[];
  /** Maintenance schedule */
  maintenanceSchedule: MaintenanceItem[];
}

export interface ComponentHealth {
  /** Health score (0-1, where 1 is perfect health) */
  healthScore: number;
  /** Estimated remaining useful life (hours) */
  remainingLife: number;
  /** Degradation rate (%/year) */
  degradationRate: number;
  /** Last maintenance date */
  lastMaintenance: Date;
  /** Next maintenance due date */
  nextMaintenanceDue: Date;
  /** Critical parameters status */
  criticalParameters: { [key: string]: number };
}

export interface FaultRecord {
  /** Fault timestamp */
  timestamp: Date;
  /** Fault code */
  faultCode: string;
  /** Fault description */
  description: string;
  /** Severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Resolution status */
  resolved: boolean;
  /** Resolution timestamp */
  resolvedTimestamp?: Date;
  /** Resolution method */
  resolutionMethod?: string;
}

export interface MaintenanceItem {
  /** Maintenance task ID */
  taskId: string;
  /** Task description */
  description: string;
  /** Scheduled date */
  scheduledDate: Date;
  /** Task priority */
  priority: 'low' | 'medium' | 'high' | 'critical';
  /** Estimated duration (hours) */
  estimatedDuration: number;
  /** Required tools/parts */
  requiredResources: string[];
  /** Completion status */
  completed: boolean;
}