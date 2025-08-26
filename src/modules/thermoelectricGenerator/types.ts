/**
 * Type definitions for Thermoelectric Generator (TEG) system
 */

export interface TEGMaterial {
  name: string;
  type: 'n-type' | 'p-type';
  seebeckCoefficient: number; // μV/K
  electricalConductivity: number; // S/m
  thermalConductivity: number; // W/m·K
  operatingTempRange: {
    min: number; // °C
    max: number; // °C
  };
  environmentalImpact: {
    carbonFootprint: number; // kg CO2-eq/kg
    recyclability: number; // percentage
    toxicity: 'low' | 'medium' | 'high';
  };
}

export interface TEGModule {
  id: string;
  location: TEGLocation;
  materials: {
    nType: TEGMaterial;
    pType: TEGMaterial;
  };
  dimensions: {
    length: number; // mm
    width: number; // mm
    height: number; // mm
  };
  thermalResistance: number; // K/W
  maxPowerOutput: number; // W
  efficiency: number; // percentage
  operationalStatus: 'active' | 'inactive' | 'maintenance' | 'fault';
}

export interface TEGLocation {
  system: 'power_electronics' | 'motor' | 'battery' | 'hvac' | 'exhaust';
  position: string;
  heatSource: string;
  coolingSink: string;
}

export interface ThermalConditions {
  hotSideTemp: number; // °C
  coldSideTemp: number; // °C
  temperatureDifferential: number; // °C
  heatFlowRate: number; // W
  ambientTemp: number; // °C
  humidity: number; // percentage
}

export interface TEGPerformance {
  powerOutput: number; // W
  voltage: number; // V
  current: number; // A
  efficiency: number; // percentage
  thermalEfficiency: number; // percentage
  heatRecovered: number; // W
  operatingTime: number; // hours
}

export interface EnvironmentalMetrics {
  carbonOffset: number; // kg CO2-eq
  energyRecovered: number; // kWh
  wasteHeatUtilized: number; // kWh
  materialImpact: number; // kg CO2-eq
  recyclabilityScore: number; // percentage
  lifecycleStage: 'manufacturing' | 'operation' | 'end-of-life';
}

export interface TEGSystemConfig {
  modules: TEGModule[];
  thermalManagement: {
    heatExchangerType: string;
    coolantType: string;
    flowRate: number; // L/min
    pumpPower: number; // W
  };
  powerManagement: {
    dcDcConverter: boolean;
    mpptEnabled: boolean;
    batteryIntegration: boolean;
    gridTieCapability: boolean;
  };
  monitoring: {
    temperatureSensors: number;
    powerMeters: number;
    dataLoggingInterval: number; // seconds
    alertThresholds: {
      maxTemp: number; // °C
      minEfficiency: number; // percentage
      maxPowerDeviation: number; // percentage
    };
  };
}

export interface TEGOptimizationParams {
  targetEfficiency: number; // percentage
  maxOperatingTemp: number; // °C
  powerOutputTarget: number; // W
  environmentalPriority: 'performance' | 'sustainability' | 'balanced';
  maintenanceSchedule: 'predictive' | 'scheduled' | 'reactive';
}

export interface TEGDiagnostics {
  moduleHealth: {
    [moduleId: string]: {
      status: 'healthy' | 'degraded' | 'critical' | 'failed';
      performanceRatio: number; // percentage of rated performance
      estimatedRemainingLife: number; // hours
      maintenanceRequired: boolean;
      faultCodes: string[];
    };
  };
  systemHealth: {
    overallEfficiency: number; // percentage
    totalPowerOutput: number; // W
    thermalStability: boolean;
    powerQuality: {
      voltageStability: number; // percentage
      harmonicDistortion: number; // percentage
    };
  };
}

export interface TEGMaintenanceRecord {
  timestamp: Date;
  moduleId: string;
  maintenanceType: 'inspection' | 'cleaning' | 'repair' | 'replacement';
  description: string;
  performanceImpact: number; // percentage improvement
  cost: number; // currency units
  environmentalImpact: number; // kg CO2-eq
}

export interface TEGLifecycleData {
  manufacturingData: {
    productionDate: Date;
    materialSources: string[];
    carbonFootprint: number; // kg CO2-eq
    energyConsumption: number; // kWh
    wasteGenerated: number; // kg
  };
  operationalData: {
    installationDate: Date;
    totalEnergyGenerated: number; // kWh
    totalCarbonOffset: number; // kg CO2-eq
    maintenanceHistory: TEGMaintenanceRecord[];
    performanceDegradation: number; // percentage per year
  };
  endOfLifeData?: {
    decommissionDate: Date;
    materialRecovery: {
      [material: string]: {
        recovered: number; // kg
        recycled: number; // kg
        disposed: number; // kg
      };
    };
    environmentalImpact: number; // kg CO2-eq
  };
}