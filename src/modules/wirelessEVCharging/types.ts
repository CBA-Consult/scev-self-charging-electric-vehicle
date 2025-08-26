/**
 * Type definitions for Wireless EV Charging Module
 */

export interface WirelessChargingConfiguration {
  chargingStandard: 'SAE J2954' | 'ISO 19363' | 'IEC 61980';
  powerLevel: 'WPT1' | 'WPT2' | 'WPT3' | 'WPT4'; // 3.7kW, 7.7kW, 11kW, 22kW
  frequency: number; // Operating frequency in kHz (typically 85kHz)
  efficiency: number; // Target efficiency percentage
  alignment: {
    tolerance: number; // Alignment tolerance in mm
    autoAlignment: boolean;
    guidanceSystem: 'visual' | 'audio' | 'haptic' | 'automated';
  };
  safety: {
    foreignObjectDetection: boolean;
    livingObjectProtection: boolean;
    emfLimits: number; // EMF exposure limits
  };
}

export interface ChargingSession {
  sessionId: string;
  vehicleId: string;
  startTime: Date;
  endTime?: Date;
  energyTransferred: number; // kWh
  efficiency: number;
  powerLevel: number; // kW
  cost: number;
  status: 'initializing' | 'charging' | 'paused' | 'completed' | 'error';
}

export interface VehicleChargingProfile {
  vehicleId: string;
  batteryCapacity: number; // kWh
  currentSOC: number; // State of charge percentage
  targetSOC: number;
  chargingCurve: ChargingCurvePoint[];
  preferences: {
    maxPowerLevel: number;
    scheduledCharging: boolean;
    costOptimization: boolean;
    renewableEnergyPreference: boolean;
  };
}

export interface ChargingCurvePoint {
  soc: number; // State of charge percentage
  maxPower: number; // Maximum power at this SOC
  efficiency: number; // Charging efficiency at this SOC
}

export interface ChargingStationStatus {
  stationId: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  availability: 'available' | 'occupied' | 'reserved' | 'maintenance';
  powerLevel: number; // kW
  efficiency: number;
  cost: number; // per kWh
  renewableEnergyPercentage: number;
  estimatedWaitTime: number; // minutes
}

export interface AutomatedChargingEvent {
  eventType: 'vehicle_detected' | 'alignment_started' | 'charging_started' | 
            'charging_completed' | 'vehicle_departed' | 'error_occurred';
  timestamp: Date;
  vehicleId?: string;
  stationId: string;
  data?: any;
}

export interface WirelessChargingMetrics {
  powerTransferEfficiency: number;
  alignmentAccuracy: number; // mm
  chargingTime: number; // minutes
  energyLoss: number; // kWh
  temperatureRise: number; // °C
  emfExposure: number; // μT
}

export interface GridIntegrationConfig {
  v2gEnabled: boolean;
  demandResponse: boolean;
  peakShaving: boolean;
  renewableEnergyIntegration: boolean;
  gridStabilization: boolean;
  timeOfUseOptimization: boolean;
}