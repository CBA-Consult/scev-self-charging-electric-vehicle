/**
 * Type definitions for Wind Energy Storage Systems
 */

export interface WindStorageInputs {
  // Wind conditions
  windSpeed: number;              // m/s - current wind speed
  windForecast: number[];         // m/s - 24-hour wind speed forecast
  windCapacity: number;           // MW - wind farm capacity
  windGeneration: number;         // MW - current wind generation
  
  // Grid conditions
  gridDemand: number;             // MW - current grid demand
  gridFrequency: number;          // Hz - grid frequency
  gridVoltage: number;            // kV - grid voltage
  electricityPrice: number;       // $/MWh - current electricity price
  
  // Storage system state
  storageSOC: number;             // % - storage state of charge (0-1)
  storageCapacity: number;        // MWh - total storage capacity
  storagePower: number;           // MW - storage power rating
  storageEfficiency: number;      // % - round-trip efficiency (0-1)
  
  // Environmental conditions
  ambientTemperature: number;     // °C - ambient temperature
  humidity: number;               // % - relative humidity (0-1)
  pressure: number;               // kPa - atmospheric pressure
}

export interface StorageSystemOutputs {
  // Power flows
  chargingPower: number;          // MW - power charging storage
  dischargingPower: number;       // MW - power discharging from storage
  gridPower: number;              // MW - net power to/from grid
  
  // System performance
  efficiency: number;             // % - current operating efficiency
  availability: number;           // % - system availability
  responseTime: number;           // seconds - response time to commands
  
  // Grid services
  frequencyRegulation: number;    // MW - frequency regulation capacity
  voltageSupport: number;         // MVAr - reactive power support
  ramping: number;                // MW/min - ramp rate capability
  
  // Economic metrics
  operatingCost: number;          // $/hour - current operating cost
  revenue: number;                // $/hour - current revenue
  netBenefit: number;             // $/hour - net economic benefit
}

export interface HybridConfiguration {
  // Technology mix
  batteryCapacity: number;        // MWh - battery storage capacity
  flywheelCapacity: number;       // MWh - flywheel storage capacity
  caesCapacity: number;           // MWh - CAES storage capacity
  gravityCapacity: number;        // MWh - gravity storage capacity
  thermalCapacity: number;        // MWh - thermal storage capacity
  
  // Power ratings
  batteryPower: number;           // MW - battery power rating
  flywheelPower: number;          // MW - flywheel power rating
  caesPower: number;              // MW - CAES power rating
  gravityPower: number;           // MW - gravity power rating
  thermalPower: number;           // MW - thermal power rating
  
  // Control parameters
  batterySOCLimits: [number, number];    // [min, max] SOC limits
  flywheelSpeedLimits: [number, number]; // [min, max] speed limits
  caesPressureLimits: [number, number];  // [min, max] pressure limits
  
  // Optimization weights
  costWeight: number;             // Weight for cost optimization
  efficiencyWeight: number;       // Weight for efficiency optimization
  reliabilityWeight: number;      // Weight for reliability optimization
}

export interface StoragePerformanceMetrics {
  // Efficiency metrics
  roundTripEfficiency: number;    // % - overall round-trip efficiency
  chargingEfficiency: number;     // % - charging efficiency
  dischargingEfficiency: number;  // % - discharging efficiency
  standbyLosses: number;          // %/hour - standby energy losses
  
  // Reliability metrics
  availability: number;           // % - system availability
  mtbf: number;                   // hours - mean time between failures
  mttr: number;                   // hours - mean time to repair
  
  // Performance metrics
  capacityFactor: number;         // % - capacity utilization factor
  cycleLife: number;              // cycles - expected cycle life
  degradationRate: number;        // %/year - annual degradation rate
  
  // Economic metrics
  lcoe: number;                   // $/MWh - levelized cost of energy
  capex: number;                  // $/kW - capital expenditure
  opex: number;                   // $/kW/year - operational expenditure
  
  // Environmental metrics
  co2Avoided: number;             // tons CO2/year - emissions avoided
  materialFootprint: number;      // kg/MWh - material intensity
  recyclingRate: number;          // % - end-of-life recycling rate
}

export interface OptimizationParameters {
  // Objective function weights
  costMinimization: number;       // Weight for cost minimization
  efficiencyMaximization: number; // Weight for efficiency maximization
  reliabilityMaximization: number; // Weight for reliability maximization
  
  // Constraints
  maxInvestment: number;          // $ - maximum investment budget
  minEfficiency: number;          // % - minimum efficiency requirement
  minReliability: number;         // % - minimum reliability requirement
  maxPaybackPeriod: number;       // years - maximum payback period
  
  // Time horizons
  planningHorizon: number;        // years - planning horizon
  operatingHorizon: number;       // hours - operating optimization horizon
  forecastHorizon: number;        // hours - forecast horizon
  
  // Risk parameters
  riskTolerance: number;          // % - acceptable risk level
  uncertaintyFactor: number;      // % - uncertainty in forecasts
  contingencyReserve: number;     // % - contingency reserve requirement
}

export interface GridIntegrationSpecs {
  // Grid connection
  connectionVoltage: number;      // kV - grid connection voltage
  connectionCapacity: number;     // MVA - connection capacity
  shortCircuitRatio: number;      // - short circuit ratio
  
  // Grid codes
  frequencyRange: [number, number];      // Hz - acceptable frequency range
  voltageRange: [number, number];        // % - acceptable voltage range
  harmonicLimits: Map<number, number>;   // % - harmonic distortion limits
  
  // Grid services
  primaryReserve: number;         // MW - primary frequency reserve
  secondaryReserve: number;       // MW - secondary frequency reserve
  tertiaryReserve: number;        // MW - tertiary frequency reserve
  reactiveCapability: number;     // MVAr - reactive power capability
  
  // Response requirements
  primaryResponseTime: number;    // seconds - primary response time
  secondaryResponseTime: number;  // seconds - secondary response time
  rampRateLimit: number;          // MW/min - maximum ramp rate
  
  // Communication
  communicationProtocol: string;  // Communication protocol (IEC 61850, etc.)
  dataUpdateRate: number;         // Hz - data update frequency
  commandResponseTime: number;    // ms - command response time
}

export interface StorageTechnology {
  name: string;
  type: 'electrochemical' | 'mechanical' | 'thermal' | 'chemical';
  
  // Technical specifications
  energyDensity: number;          // Wh/kg - gravimetric energy density
  powerDensity: number;           // W/kg - gravimetric power density
  efficiency: number;             // % - round-trip efficiency
  responseTime: number;           // seconds - response time
  cycleLife: number;              // cycles - expected cycle life
  lifetime: number;               // years - operational lifetime
  
  // Operating parameters
  operatingTemperature: [number, number]; // °C - operating temperature range
  socLimits: [number, number];    // % - state of charge limits
  depthOfDischarge: number;       // % - maximum depth of discharge
  
  // Economic parameters
  capitalCost: number;            // $/kWh - capital cost
  operatingCost: number;          // $/MWh - operating cost
  maintenanceCost: number;        // $/kW/year - maintenance cost
  
  // Environmental parameters
  co2Footprint: number;           // kg CO2/kWh - carbon footprint
  materialIntensity: number;      // kg/kWh - material intensity
  recyclability: number;          // % - recyclability factor
}

export interface WindStorageOptimizationResult {
  // Optimal configuration
  configuration: HybridConfiguration;
  
  // Performance metrics
  performance: StoragePerformanceMetrics;
  
  // Economic analysis
  npv: number;                    // $ - net present value
  irr: number;                    // % - internal rate of return
  paybackPeriod: number;          // years - payback period
  lcoe: number;                   // $/MWh - levelized cost of energy
  
  // Risk assessment
  riskMetrics: {
    volatility: number;           // % - revenue volatility
    worstCase: number;            // $ - worst case NPV
    bestCase: number;             // $ - best case NPV
    probabilityOfLoss: number;    // % - probability of loss
  };
  
  // Sensitivity analysis
  sensitivity: {
    parameter: string;
    impact: number;               // % change in NPV per % change in parameter
  }[];
}

export interface StorageControlCommand {
  timestamp: number;              // Unix timestamp
  command: 'charge' | 'discharge' | 'standby' | 'regulate';
  power: number;                  // MW - power setpoint
  duration: number;               // minutes - command duration
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: 'manual' | 'automatic' | 'grid' | 'market';
}

export interface StorageSystemStatus {
  timestamp: number;              // Unix timestamp
  operational: boolean;           // System operational status
  
  // Current state
  soc: number;                    // % - state of charge
  power: number;                  // MW - current power (+ discharge, - charge)
  voltage: number;                // V - system voltage
  current: number;                // A - system current
  temperature: number;            // °C - system temperature
  
  // Alarms and warnings
  alarms: string[];               // Active alarms
  warnings: string[];             // Active warnings
  
  // Performance
  efficiency: number;             // % - current efficiency
  availability: number;           // % - current availability
  
  // Maintenance
  nextMaintenance: number;        // Unix timestamp of next maintenance
  maintenanceRequired: boolean;   // Maintenance required flag
}