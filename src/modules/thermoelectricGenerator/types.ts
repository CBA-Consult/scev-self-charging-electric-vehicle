/**
 * Type definitions for Thermoelectric Generator (TEG) systems
 */

/**
 * Thermoelectric material properties
 */
export interface ThermoelectricMaterial {
  name: string;
  type: 'n-type' | 'p-type' | 'skutterudite' | 'bismuth_telluride' | 'lead_telluride' | 'silicon_germanium';
  seebeckCoefficient: number;        // μV/K - Seebeck coefficient
  electricalConductivity: number;    // S/m - Electrical conductivity
  thermalConductivity: number;       // W/(m·K) - Thermal conductivity
  ztValue: number;                   // Dimensionless figure of merit
  operatingTempRange: {
    min: number;                     // °C - Minimum operating temperature
    max: number;                     // °C - Maximum operating temperature
  };
  density: number;                   // kg/m³ - Material density
  specificHeat: number;              // J/(kg·K) - Specific heat capacity
  thermalExpansion: number;          // 1/K - Coefficient of thermal expansion
  cost: number;                      // $/kg - Material cost
}

/**
 * TEG module configuration
 */
export interface TEGConfiguration {
  id: string;
  type: 'single_stage' | 'multi_stage' | 'cascaded' | 'segmented';
  dimensions: {
    length: number;                  // mm
    width: number;                   // mm
    height: number;                  // mm
  };
  thermoelectricPairs: number;       // Number of TE couples
  pTypeMaterial: ThermoelectricMaterial;
  nTypeMaterial: ThermoelectricMaterial;
  legDimensions: {
    length: number;                  // mm - TE leg length
    crossSectionalArea: number;      // mm² - Cross-sectional area
  };
  electricalConfiguration: 'series' | 'parallel' | 'series_parallel';
  heatExchanger: {
    hotSideType: 'direct_contact' | 'heat_pipe' | 'finned' | 'liquid_cooled';
    coldSideType: 'air_cooled' | 'liquid_cooled' | 'heat_sink' | 'ambient';
    hotSideArea: number;             // cm² - Hot side heat transfer area
    coldSideArea: number;            // cm² - Cold side heat transfer area
    thermalResistance: {
      hotSide: number;               // K/W - Hot side thermal resistance
      coldSide: number;              // K/W - Cold side thermal resistance
    };
  };
  placement: {
    location: 'brake_disc' | 'brake_caliper' | 'brake_pad' | 'exhaust_manifold' | 'motor_housing';
    mountingType: 'direct' | 'thermal_interface' | 'heat_pipe_coupled';
    thermalInterfaceMaterial: string;
  };
}

/**
 * Thermal conditions during braking
 */
export interface ThermalConditions {
  hotSideTemperature: number;        // °C - Temperature at heat source
  coldSideTemperature: number;       // °C - Temperature at heat sink
  ambientTemperature: number;        // °C - Ambient temperature
  heatFlux: number;                  // W/m² - Heat flux from braking
  convectionCoefficient: {
    hotSide: number;                 // W/(m²·K) - Hot side convection
    coldSide: number;                // W/(m²·K) - Cold side convection
  };
  airflow: {
    velocity: number;                // m/s - Air velocity for cooling
    temperature: number;             // °C - Air temperature
  };
  brakingDuration: number;           // s - Duration of braking event
  brakingIntensity: number;          // 0-1 - Normalized braking intensity
}

/**
 * TEG performance metrics
 */
export interface TEGPerformance {
  electricalPower: number;           // W - Electrical power output
  voltage: number;                   // V - Output voltage
  current: number;                   // A - Output current
  efficiency: number;                // % - Conversion efficiency
  powerDensity: number;              // W/kg - Power per unit mass
  heatInput: number;                 // W - Heat input from braking
  heatRejected: number;              // W - Heat rejected to cold side
  temperatureDifference: number;     // K - Temperature difference across TEG
  internalResistance: number;        // Ω - Internal electrical resistance
  thermalResistance: number;         // K/W - Thermal resistance
  reliability: number;               // % - System reliability
  lifespan: number;                  // hours - Expected operational lifespan
}

/**
 * Braking system thermal inputs
 */
export interface BrakingThermalInputs {
  vehicleSpeed: number;              // km/h - Vehicle speed
  brakingForce: number;              // N - Applied braking force
  brakingPower: number;              // W - Braking power (kinetic energy dissipation)
  brakeTemperature: number;          // °C - Brake component temperature
  motorTemperature: number;          // °C - Motor temperature
  ambientTemperature: number;        // °C - Ambient temperature
  airflow: number;                   // m/s - Air velocity around brakes
  brakingDuration: number;           // s - Duration of braking event
  regenerativeBrakingRatio: number;  // 0-1 - Ratio of regenerative to total braking
}

/**
 * Integrated braking system outputs
 */
export interface IntegratedBrakingOutputs {
  regenerativePower: number;         // W - Power from regenerative braking
  tegPower: number;                  // W - Power from TEG system
  totalRecoveredPower: number;       // W - Total recovered electrical power
  mechanicalBrakingPower: number;    // W - Remaining mechanical braking power
  systemEfficiency: number;          // % - Overall energy recovery efficiency
  thermalEfficiency: number;         // % - TEG thermal conversion efficiency
  brakeTemperature: number;          // °C - Final brake temperature
  tegTemperature: {
    hotSide: number;                 // °C - TEG hot side temperature
    coldSide: number;                // °C - TEG cold side temperature
  };
  powerDistribution: {
    battery: number;                 // W - Power to battery
    supercapacitor: number;          // W - Power to supercapacitor
    directUse: number;               // W - Power for direct vehicle use
  };
}

/**
 * Thermal management configuration
 */
export interface ThermalManagementConfig {
  coolingSystem: {
    type: 'passive' | 'active' | 'hybrid';
    coolant: 'air' | 'water' | 'glycol' | 'oil';
    flowRate: number;                // L/min - Coolant flow rate
    pumpPower: number;               // W - Cooling pump power consumption
  };
  temperatureControl: {
    maxOperatingTemp: number;        // °C - Maximum safe operating temperature
    optimalTempRange: {
      min: number;                   // °C - Optimal minimum temperature
      max: number;                   // °C - Optimal maximum temperature
    };
    thermalProtection: boolean;      // Enable thermal protection
    emergencyShutdown: number;       // °C - Emergency shutdown temperature
  };
  heatSink: {
    material: 'aluminum' | 'copper' | 'graphite' | 'ceramic';
    finDensity: number;              // fins/inch
    surfaceArea: number;             // cm² - Total heat sink surface area
    thermalResistance: number;       // K/W - Heat sink thermal resistance
  };
  thermalInterface: {
    material: 'thermal_paste' | 'thermal_pad' | 'liquid_metal' | 'phase_change';
    thickness: number;               // mm - Interface thickness
    thermalConductivity: number;     // W/(m·K) - Interface thermal conductivity
  };
}

/**
 * Default thermoelectric materials database
 */
export const defaultTEGMaterials: Record<string, ThermoelectricMaterial> = {
  'Bi2Te3_nType': {
    name: 'Bismuth Telluride (n-type)',
    type: 'n-type',
    seebeckCoefficient: -200,
    electricalConductivity: 100000,
    thermalConductivity: 1.5,
    ztValue: 1.0,
    operatingTempRange: { min: -40, max: 200 },
    density: 7700,
    specificHeat: 154,
    thermalExpansion: 16e-6,
    cost: 150
  },
  'Bi2Te3_pType': {
    name: 'Bismuth Telluride (p-type)',
    type: 'p-type',
    seebeckCoefficient: 200,
    electricalConductivity: 80000,
    thermalConductivity: 1.2,
    ztValue: 1.0,
    operatingTempRange: { min: -40, max: 200 },
    density: 7700,
    specificHeat: 154,
    thermalExpansion: 16e-6,
    cost: 150
  },
  'PbTe_nType': {
    name: 'Lead Telluride (n-type)',
    type: 'n-type',
    seebeckCoefficient: -180,
    electricalConductivity: 50000,
    thermalConductivity: 2.2,
    ztValue: 1.4,
    operatingTempRange: { min: 200, max: 600 },
    density: 8200,
    specificHeat: 147,
    thermalExpansion: 19e-6,
    cost: 200
  },
  'PbTe_pType': {
    name: 'Lead Telluride (p-type)',
    type: 'p-type',
    seebeckCoefficient: 180,
    electricalConductivity: 45000,
    thermalConductivity: 2.0,
    ztValue: 1.4,
    operatingTempRange: { min: 200, max: 600 },
    density: 8200,
    specificHeat: 147,
    thermalExpansion: 19e-6,
    cost: 200
  },
  'SiGe_nType': {
    name: 'Silicon Germanium (n-type)',
    type: 'n-type',
    seebeckCoefficient: -300,
    electricalConductivity: 20000,
    thermalConductivity: 4.0,
    ztValue: 0.9,
    operatingTempRange: { min: 600, max: 1000 },
    density: 3200,
    specificHeat: 712,
    thermalExpansion: 4.2e-6,
    cost: 300
  },
  'SiGe_pType': {
    name: 'Silicon Germanium (p-type)',
    type: 'p-type',
    seebeckCoefficient: 300,
    electricalConductivity: 18000,
    thermalConductivity: 3.8,
    ztValue: 0.9,
    operatingTempRange: { min: 600, max: 1000 },
    density: 3200,
    specificHeat: 712,
    thermalExpansion: 4.2e-6,
    cost: 300
  }
};

/**
 * Default TEG configurations for different applications
 */
export const defaultTEGConfigurations: Record<string, TEGConfiguration> = {
  'brake_disc_teg': {
    id: 'brake_disc_teg',
    type: 'single_stage',
    dimensions: { length: 100, width: 80, height: 15 },
    thermoelectricPairs: 127,
    pTypeMaterial: defaultTEGMaterials['Bi2Te3_pType'],
    nTypeMaterial: defaultTEGMaterials['Bi2Te3_nType'],
    legDimensions: { length: 3, crossSectionalArea: 4 },
    electricalConfiguration: 'series',
    heatExchanger: {
      hotSideType: 'direct_contact',
      coldSideType: 'air_cooled',
      hotSideArea: 80,
      coldSideArea: 120,
      thermalResistance: { hotSide: 0.1, coldSide: 0.3 }
    },
    placement: {
      location: 'brake_disc',
      mountingType: 'thermal_interface',
      thermalInterfaceMaterial: 'thermal_paste'
    }
  },
  'brake_caliper_teg': {
    id: 'brake_caliper_teg',
    type: 'multi_stage',
    dimensions: { length: 60, width: 40, height: 20 },
    thermoelectricPairs: 64,
    pTypeMaterial: defaultTEGMaterials['PbTe_pType'],
    nTypeMaterial: defaultTEGMaterials['PbTe_nType'],
    legDimensions: { length: 4, crossSectionalArea: 6 },
    electricalConfiguration: 'series_parallel',
    heatExchanger: {
      hotSideType: 'heat_pipe',
      coldSideType: 'liquid_cooled',
      hotSideArea: 24,
      coldSideArea: 48,
      thermalResistance: { hotSide: 0.05, coldSide: 0.15 }
    },
    placement: {
      location: 'brake_caliper',
      mountingType: 'heat_pipe_coupled',
      thermalInterfaceMaterial: 'thermal_pad'
    }
  },
  'motor_housing_teg': {
    id: 'motor_housing_teg',
    type: 'cascaded',
    dimensions: { length: 150, width: 100, height: 25 },
    thermoelectricPairs: 256,
    pTypeMaterial: defaultTEGMaterials['SiGe_pType'],
    nTypeMaterial: defaultTEGMaterials['SiGe_nType'],
    legDimensions: { length: 5, crossSectionalArea: 8 },
    electricalConfiguration: 'series',
    heatExchanger: {
      hotSideType: 'finned',
      coldSideType: 'liquid_cooled',
      hotSideArea: 150,
      coldSideArea: 200,
      thermalResistance: { hotSide: 0.08, coldSide: 0.12 }
    },
    placement: {
      location: 'motor_housing',
      mountingType: 'direct',
      thermalInterfaceMaterial: 'liquid_metal'
    }
  }
};

/**
 * Default thermal management configuration
 */
export const defaultThermalManagementConfig: ThermalManagementConfig = {
  coolingSystem: {
    type: 'hybrid',
    coolant: 'glycol',
    flowRate: 5.0,
    pumpPower: 50
  },
  temperatureControl: {
    maxOperatingTemp: 250,
    optimalTempRange: { min: 50, max: 200 },
    thermalProtection: true,
    emergencyShutdown: 300
  },
  heatSink: {
    material: 'aluminum',
    finDensity: 10,
    surfaceArea: 500,
    thermalResistance: 0.2
  },
  thermalInterface: {
    material: 'thermal_paste',
    thickness: 0.1,
    thermalConductivity: 5.0
  }
};