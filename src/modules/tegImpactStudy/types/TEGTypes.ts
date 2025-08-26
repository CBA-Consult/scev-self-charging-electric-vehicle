/**
 * Type definitions for TEG Impact Study Module
 */

/**
 * Thermoelectric material properties
 */
export interface ThermoelectricMaterial {
  name: string;
  type: 'n-type' | 'p-type';
  seebeckCoefficient: number; // V/K
  electricalConductivity: number; // S/m
  thermalConductivity: number; // W/m·K
  figureOfMerit: number; // ZT value
  operatingTemperatureRange: {
    min: number; // °C
    max: number; // °C
  };
  density: number; // kg/m³
  specificHeat: number; // J/kg·K
  thermalExpansion: number; // 1/K
  cost: number; // $/kg
}

/**
 * TEG module configuration
 */
export interface TEGModule {
  id: string;
  location: TEGLocation;
  material: ThermoelectricMaterial;
  dimensions: {
    length: number; // m
    width: number; // m
    thickness: number; // m
  };
  moduleCount: number;
  electricalConfiguration: 'series' | 'parallel' | 'series-parallel';
  thermalInterface: {
    hotSide: ThermalInterface;
    coldSide: ThermalInterface;
  };
  powerElectronics: {
    dcDcConverter: boolean;
    mpptController: boolean;
    efficiency: number;
  };
}

/**
 * TEG installation locations in vehicle
 */
export type TEGLocation = 
  | 'exhaust_manifold'
  | 'exhaust_pipe'
  | 'catalytic_converter'
  | 'muffler'
  | 'radiator'
  | 'engine_block'
  | 'turbocharger'
  | 'intercooler'
  | 'transmission'
  | 'brake_system'
  | 'power_electronics'
  | 'battery_pack';

/**
 * Thermal interface materials and configurations
 */
export interface ThermalInterface {
  material: 'thermal_paste' | 'thermal_pad' | 'liquid_metal' | 'phase_change_material';
  thickness: number; // m
  thermalConductivity: number; // W/m·K
  thermalResistance: number; // K·m²/W
}

/**
 * Complete TEG system configuration
 */
export interface TEGConfiguration {
  modules: TEGModule[];
  thermalManagement: {
    coolantIntegration: boolean;
    heatSinkDesign: 'finned_aluminum' | 'liquid_cooled' | 'heat_pipe' | 'phase_change';
    thermalInterface: ThermalInterface;
    temperatureControl: boolean;
  };
  electricalSystem: {
    systemVoltage: number; // V
    powerConditioning: {
      dcDcConverter: boolean;
      mpptController: boolean;
      batteryCharging: boolean;
      gridTie: boolean;
    };
    protectionSystems: {
      overvoltageProtection: boolean;
      overcurrentProtection: boolean;
      thermalProtection: boolean;
      shortCircuitProtection: boolean;
    };
  };
  controlSystem: {
    temperatureMonitoring: boolean;
    powerOptimization: boolean;
    faultDetection: boolean;
    remoteMonitoring: boolean;
  };
  installation: {
    mountingMethod: 'bolted' | 'clamped' | 'welded' | 'adhesive';
    vibrationIsolation: boolean;
    weatherProtection: boolean;
    maintenanceAccess: boolean;
  };
}

/**
 * Vehicle configuration for TEG integration analysis
 */
export interface VehicleConfiguration {
  vehicleType: 'passenger_car' | 'light_truck' | 'heavy_duty' | 'bus' | 'motorcycle';
  engineType: 'internal_combustion' | 'hybrid' | 'electric' | 'fuel_cell';
  engineSpecifications: {
    displacement: number; // liters
    power: number; // watts
    torque: number; // N·m
    fuelType: 'gasoline' | 'diesel' | 'natural_gas' | 'hydrogen';
    compressionRatio: number;
    numberOfCylinders: number;
  };
  vehicleSpecifications: {
    mass: number; // kg
    length: number; // m
    width: number; // m
    height: number; // m
    wheelbase: number; // m
    groundClearance: number; // m
  };
  aerodynamics: {
    dragCoefficient: number;
    frontalArea: number; // m²
    liftCoefficient: number;
  };
  drivetrain: {
    transmission: 'manual' | 'automatic' | 'cvt' | 'dual_clutch';
    driveType: 'fwd' | 'rwd' | 'awd' | '4wd';
    gearRatios: number[];
    finalDriveRatio: number;
  };
  thermalSystems: {
    coolingSystem: {
      coolantCapacity: number; // liters
      radiatorArea: number; // m²
      fanPower: number; // watts
      thermostatTemperature: number; // °C
    };
    exhaustSystem: {
      manifoldMaterial: string;
      pipeLength: number; // m
      pipeDiameter: number; // m
      catalyticConverter: boolean;
      mufflerType: string;
    };
  };
  electricalSystem: {
    batteryCapacity: number; // Ah
    systemVoltage: number; // V
    alternatorPower: number; // watts
    electricalLoad: number; // watts
  };
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceMonitorConfig {
  sensors: {
    temperatureSensors: TemperatureSensorConfig[];
    powerSensors: PowerSensorConfig[];
    fuelFlowSensor: FuelFlowSensorConfig;
    emissionsSensors: EmissionsSensorConfig[];
    vibrationSensors: VibrationSensorConfig[];
  };
  dataLogging: {
    samplingRate: number; // Hz
    dataRetention: number; // days
    realTimeAnalysis: boolean;
    dataCompression: boolean;
    cloudSync: boolean;
  };
  alerts: {
    temperatureThresholds: {
      high: number; // °C
      low: number; // °C
    };
    powerThresholds: {
      high: number; // W
      low: number; // W
    };
    efficiencyThresholds: {
      minimum: number; // %
    };
  };
}

/**
 * Temperature sensor configuration
 */
export interface TemperatureSensorConfig {
  id: string;
  location: string;
  type: 'thermocouple' | 'rtd' | 'thermistor' | 'infrared';
  range: {
    min: number; // °C
    max: number; // °C
  };
  accuracy: number; // °C
  responseTime: number; // seconds
}

/**
 * Power sensor configuration
 */
export interface PowerSensorConfig {
  id: string;
  location: string;
  type: 'current_voltage' | 'hall_effect' | 'rogowski_coil';
  range: {
    voltage: { min: number; max: number }; // V
    current: { min: number; max: number }; // A
    power: { min: number; max: number }; // W
  };
  accuracy: number; // %
}

/**
 * Fuel flow sensor configuration
 */
export interface FuelFlowSensorConfig {
  id: string;
  type: 'ultrasonic' | 'turbine' | 'positive_displacement' | 'coriolis';
  range: {
    min: number; // L/h
    max: number; // L/h
  };
  accuracy: number; // %
  temperature_compensation: boolean;
}

/**
 * Emissions sensor configuration
 */
export interface EmissionsSensorConfig {
  id: string;
  pollutant: 'CO2' | 'NOx' | 'CO' | 'HC' | 'PM' | 'O2';
  type: 'electrochemical' | 'infrared' | 'chemiluminescence' | 'flame_ionization';
  range: {
    min: number; // ppm or mg/m³
    max: number; // ppm or mg/m³
  };
  accuracy: number; // %
  responseTime: number; // seconds
}

/**
 * Vibration sensor configuration
 */
export interface VibrationSensorConfig {
  id: string;
  location: string;
  type: 'accelerometer' | 'piezoelectric' | 'capacitive';
  range: {
    frequency: { min: number; max: number }; // Hz
    acceleration: { min: number; max: number }; // g
  };
  sensitivity: number; // mV/g
}

/**
 * Emissions analysis configuration
 */
export interface EmissionsAnalysisConfig {
  standard: 'Euro_6' | 'EPA_Tier_3' | 'CARB_LEV_III' | 'China_6' | 'Japan_Post_NLT';
  testCycles: DrivingCycle[];
  pollutants: EmissionsPollutant[];
  measurementMethod: 'PEMS' | 'laboratory' | 'remote_sensing';
  ambientConditions: {
    temperature: { min: number; max: number }; // °C
    humidity: { min: number; max: number }; // %
    pressure: { min: number; max: number }; // Pa
  };
}

/**
 * Driving cycle definitions
 */
export type DrivingCycle = 
  | 'NEDC'
  | 'WLTP'
  | 'EPA_FTP75'
  | 'EPA_HWFET'
  | 'EPA_US06'
  | 'EPA_SC03'
  | 'JC08'
  | 'ARTEMIS_Urban'
  | 'ARTEMIS_Road'
  | 'ARTEMIS_Motorway'
  | 'RDE_Urban'
  | 'RDE_Rural'
  | 'RDE_Motorway';

/**
 * Emissions pollutants
 */
export type EmissionsPollutant = 
  | 'CO2'
  | 'NOx'
  | 'CO'
  | 'HC'
  | 'PM'
  | 'PN'
  | 'NH3'
  | 'N2O'
  | 'CH4';

/**
 * Data collection configuration
 */
export interface DataCollectionConfig {
  testDuration: number; // seconds
  testConditions: TestCondition[];
  dataQuality: {
    minimumSampleRate: number; // Hz
    maximumDataLoss: number; // %
    calibrationInterval: number; // hours
    validationChecks: boolean;
  };
  storage: {
    localStorage: boolean;
    cloudStorage: boolean;
    dataFormat: 'csv' | 'json' | 'hdf5' | 'parquet';
    compression: boolean;
    encryption: boolean;
  };
  realTimeProcessing: {
    enabled: boolean;
    processingInterval: number; // seconds
    alertGeneration: boolean;
    dashboardUpdates: boolean;
  };
}

/**
 * Test condition definitions
 */
export interface TestCondition {
  name: string;
  description: string;
  drivingCycle: DrivingCycle;
  ambientTemperature: number; // °C
  humidity: number; // %
  pressure: number; // Pa
  vehicleLoad: number; // kg
  airConditioning: boolean;
  auxiliaryLoads: number; // W
}

/**
 * Report generator configuration
 */
export interface ReportGeneratorConfig {
  reportTypes: ReportType[];
  outputFormats: OutputFormat[];
  updateInterval: number; // seconds
  dataVisualization: {
    charts: ChartType[];
    interactiveGraphs: boolean;
    realTimeUpdates: boolean;
    exportOptions: string[];
  };
  customization: {
    branding: boolean;
    customMetrics: boolean;
    templateSelection: boolean;
    languageSupport: string[];
  };
}

/**
 * Report types
 */
export type ReportType = 
  | 'performance_summary'
  | 'efficiency_analysis'
  | 'emissions_assessment'
  | 'energy_recovery'
  | 'optimization_recommendations'
  | 'comparative_analysis'
  | 'real_time_dashboard'
  | 'maintenance_report'
  | 'cost_benefit_analysis'
  | 'environmental_impact';

/**
 * Output formats
 */
export type OutputFormat = 
  | 'pdf'
  | 'html'
  | 'excel'
  | 'powerpoint'
  | 'json'
  | 'csv'
  | 'xml';

/**
 * Chart types for data visualization
 */
export type ChartType = 
  | 'line_chart'
  | 'bar_chart'
  | 'scatter_plot'
  | 'histogram'
  | 'box_plot'
  | 'heat_map'
  | 'contour_plot'
  | 'pie_chart'
  | 'gauge_chart'
  | 'waterfall_chart';

/**
 * TEG performance metrics
 */
export interface TEGPerformanceMetrics {
  powerGeneration: {
    instantaneous: number; // W
    average: number; // W
    peak: number; // W
    total: number; // Wh
  };
  efficiency: {
    thermoelectric: number; // %
    system: number; // %
    powerElectronics: number; // %
  };
  temperatures: {
    hotSide: number; // °C
    coldSide: number; // °C
    deltaT: number; // °C
  };
  heatFlow: {
    input: number; // W
    recovered: number; // W
    rejected: number; // W
  };
  reliability: {
    uptime: number; // %
    faultCount: number;
    maintenanceHours: number;
  };
}

/**
 * Vehicle efficiency metrics
 */
export interface VehicleEfficiencyMetrics {
  fuelConsumption: {
    baseline: number; // L/100km
    withTEG: number; // L/100km
    improvement: number; // %
    savings: number; // L/h
  };
  emissions: {
    baseline: EmissionsData;
    withTEG: EmissionsData;
    reduction: EmissionsData;
    improvementPercentage: EmissionsData;
  };
  energyBalance: {
    fuelEnergy: number; // kWh
    mechanicalEnergy: number; // kWh
    electricalEnergy: number; // kWh
    wasteHeat: number; // kWh
    recoveredEnergy: number; // kWh
  };
  performance: {
    power: number; // kW
    torque: number; // N·m
    acceleration: number; // m/s²
    topSpeed: number; // km/h
  };
}

/**
 * Emissions data structure
 */
export interface EmissionsData {
  CO2: number; // g/km
  NOx: number; // g/km
  CO: number; // g/km
  HC: number; // g/km
  PM: number; // g/km
  PN: number; // #/km
}

/**
 * Optimization recommendations
 */
export interface OptimizationRecommendations {
  tegConfiguration: {
    materialSelection: MaterialRecommendation[];
    moduleConfiguration: ModuleRecommendation[];
    thermalManagement: ThermalRecommendation[];
    electricalSystem: ElectricalRecommendation[];
  };
  vehicleIntegration: {
    installationLocation: LocationRecommendation[];
    thermalInterface: InterfaceRecommendation[];
    systemIntegration: IntegrationRecommendation[];
  };
  operationalOptimization: {
    controlStrategy: ControlRecommendation[];
    maintenanceSchedule: MaintenanceRecommendation[];
    performanceMonitoring: MonitoringRecommendation[];
  };
  costBenefit: {
    initialInvestment: number; // $
    operationalSavings: number; // $/year
    paybackPeriod: number; // years
    netPresentValue: number; // $
    returnOnInvestment: number; // %
  };
}

/**
 * Recommendation types
 */
export interface MaterialRecommendation {
  material: ThermoelectricMaterial;
  reason: string;
  expectedImprovement: number; // %
  implementationCost: number; // $
  priority: 'high' | 'medium' | 'low';
}

export interface ModuleRecommendation {
  configuration: Partial<TEGModule>;
  reason: string;
  expectedImprovement: number; // %
  implementationCost: number; // $
  priority: 'high' | 'medium' | 'low';
}

export interface ThermalRecommendation {
  recommendation: string;
  expectedImprovement: number; // %
  implementationCost: number; // $
  priority: 'high' | 'medium' | 'low';
}

export interface ElectricalRecommendation {
  recommendation: string;
  expectedImprovement: number; // %
  implementationCost: number; // $
  priority: 'high' | 'medium' | 'low';
}

export interface LocationRecommendation {
  location: TEGLocation;
  reason: string;
  expectedPower: number; // W
  installationComplexity: 'low' | 'medium' | 'high';
  priority: 'high' | 'medium' | 'low';
}

export interface InterfaceRecommendation {
  interface: ThermalInterface;
  reason: string;
  expectedImprovement: number; // %
  implementationCost: number; // $
  priority: 'high' | 'medium' | 'low';
}

export interface IntegrationRecommendation {
  recommendation: string;
  expectedBenefit: string;
  implementationComplexity: 'low' | 'medium' | 'high';
  priority: 'high' | 'medium' | 'low';
}

export interface ControlRecommendation {
  strategy: string;
  expectedImprovement: number; // %
  implementationComplexity: 'low' | 'medium' | 'high';
  priority: 'high' | 'medium' | 'low';
}

export interface MaintenanceRecommendation {
  task: string;
  frequency: string;
  expectedBenefit: string;
  cost: number; // $
  priority: 'high' | 'medium' | 'low';
}

export interface MonitoringRecommendation {
  parameter: string;
  monitoringMethod: string;
  expectedBenefit: string;
  implementationCost: number; // $
  priority: 'high' | 'medium' | 'low';
}