/**
 * Utility functions for TEG calculations and optimizations
 */

import { ThermoelectricMaterial, TEGConfiguration, ThermalConditions } from './types';

/**
 * Calculate Seebeck coefficient for a thermoelectric couple
 */
export function calculateSeebeckCoefficient(
  pTypeMaterial: ThermoelectricMaterial,
  nTypeMaterial: ThermoelectricMaterial
): number {
  // Total Seebeck coefficient is the sum of p-type and n-type coefficients
  return Math.abs(pTypeMaterial.seebeckCoefficient) + Math.abs(nTypeMaterial.seebeckCoefficient);
}

/**
 * Calculate thermal conductivity of a thermoelectric couple
 */
export function calculateThermalConductivity(
  pTypeMaterial: ThermoelectricMaterial,
  nTypeMaterial: ThermoelectricMaterial,
  legDimensions: { length: number; crossSectionalArea: number }
): number {
  const pTypeConductance = (pTypeMaterial.thermalConductivity * legDimensions.crossSectionalArea) / legDimensions.length;
  const nTypeConductance = (nTypeMaterial.thermalConductivity * legDimensions.crossSectionalArea) / legDimensions.length;
  
  // Parallel thermal conductance
  return pTypeConductance + nTypeConductance;
}

/**
 * Calculate electrical resistivity of a thermoelectric couple
 */
export function calculateElectricalResistivity(
  pTypeMaterial: ThermoelectricMaterial,
  nTypeMaterial: ThermoelectricMaterial,
  legDimensions: { length: number; crossSectionalArea: number }
): number {
  const pTypeResistance = legDimensions.length / (pTypeMaterial.electricalConductivity * legDimensions.crossSectionalArea * 1e-6);
  const nTypeResistance = legDimensions.length / (nTypeMaterial.electricalConductivity * legDimensions.crossSectionalArea * 1e-6);
  
  // Series electrical resistance
  return pTypeResistance + nTypeResistance;
}

/**
 * Calculate figure of merit (ZT) for a thermoelectric couple
 */
export function calculateZTValue(
  pTypeMaterial: ThermoelectricMaterial,
  nTypeMaterial: ThermoelectricMaterial,
  temperature: number
): number {
  const seebeckCoeff = calculateSeebeckCoefficient(pTypeMaterial, nTypeMaterial);
  const electricalConductivity = (pTypeMaterial.electricalConductivity + nTypeMaterial.electricalConductivity) / 2;
  const thermalConductivity = (pTypeMaterial.thermalConductivity + nTypeMaterial.thermalConductivity) / 2;
  
  // ZT = S²σT/κ where S is Seebeck coefficient, σ is electrical conductivity, T is temperature, κ is thermal conductivity
  const zt = Math.pow(seebeckCoeff * 1e-6, 2) * electricalConductivity * (temperature + 273.15) / thermalConductivity;
  
  return zt;
}

/**
 * Validate TEG configuration parameters
 */
export function validateTEGConfiguration(config: TEGConfiguration): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate dimensions
  if (config.dimensions.length <= 0 || config.dimensions.width <= 0 || config.dimensions.height <= 0) {
    errors.push('TEG dimensions must be positive values');
  }

  // Validate thermoelectric pairs
  if (config.thermoelectricPairs <= 0) {
    errors.push('Number of thermoelectric pairs must be positive');
  }

  // Validate leg dimensions
  if (config.legDimensions.length <= 0 || config.legDimensions.crossSectionalArea <= 0) {
    errors.push('TE leg dimensions must be positive values');
  }

  // Validate material compatibility
  if (config.pTypeMaterial.type !== 'p-type') {
    errors.push('P-type material must have type "p-type"');
  }
  if (config.nTypeMaterial.type !== 'n-type') {
    errors.push('N-type material must have type "n-type"');
  }

  // Check operating temperature compatibility
  const pTempRange = config.pTypeMaterial.operatingTempRange;
  const nTempRange = config.nTypeMaterial.operatingTempRange;
  
  if (pTempRange.max < nTempRange.min || nTempRange.max < pTempRange.min) {
    warnings.push('P-type and N-type materials have non-overlapping operating temperature ranges');
  }

  // Validate heat exchanger areas
  if (config.heatExchanger.hotSideArea <= 0 || config.heatExchanger.coldSideArea <= 0) {
    errors.push('Heat exchanger areas must be positive values');
  }

  // Validate thermal resistances
  if (config.heatExchanger.thermalResistance.hotSide <= 0 || config.heatExchanger.thermalResistance.coldSide <= 0) {
    errors.push('Thermal resistances must be positive values');
  }

  // Performance warnings
  if (config.heatExchanger.coldSideArea < config.heatExchanger.hotSideArea) {
    warnings.push('Cold side area is smaller than hot side area - may limit heat rejection');
  }

  const avgZT = (config.pTypeMaterial.ztValue + config.nTypeMaterial.ztValue) / 2;
  if (avgZT < 0.5) {
    warnings.push('Low ZT value materials may result in poor efficiency');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Optimize TEG placement for maximum power output
 */
export function optimizeTEGPlacement(
  availableLocations: Array<{
    location: string;
    maxTemperature: number;
    heatFlux: number;
    availableArea: number;
    coolingCapability: number;
  }>,
  tegConfig: TEGConfiguration
): {
  optimalLocation: string;
  expectedPower: number;
  efficiency: number;
  reasoning: string;
} {
  let bestLocation = availableLocations[0];
  let maxPower = 0;
  let bestEfficiency = 0;

  for (const location of availableLocations) {
    // Check if location is suitable for the TEG materials
    const materialTempRange = {
      min: Math.max(tegConfig.pTypeMaterial.operatingTempRange.min, tegConfig.nTypeMaterial.operatingTempRange.min),
      max: Math.min(tegConfig.pTypeMaterial.operatingTempRange.max, tegConfig.nTypeMaterial.operatingTempRange.max)
    };

    if (location.maxTemperature > materialTempRange.max) {
      continue; // Skip locations that exceed material limits
    }

    // Estimate temperature difference (simplified)
    const hotSideTemp = Math.min(location.maxTemperature, materialTempRange.max);
    const coldSideTemp = Math.max(25, hotSideTemp - location.coolingCapability); // Assume 25°C minimum cold side
    const tempDiff = hotSideTemp - coldSideTemp;

    if (tempDiff < 20) {
      continue; // Skip locations with insufficient temperature difference
    }

    // Calculate approximate power output
    const seebeckCoeff = calculateSeebeckCoefficient(tegConfig.pTypeMaterial, tegConfig.nTypeMaterial);
    const thermalConductance = calculateThermalConductivity(tegConfig.pTypeMaterial, tegConfig.nTypeMaterial, tegConfig.legDimensions);
    const electricalResistance = calculateElectricalResistivity(tegConfig.pTypeMaterial, tegConfig.nTypeMaterial, tegConfig.legDimensions);

    // Simplified power calculation: P = (S*ΔT)²/(4*R) * N where N is number of couples
    const voltage = seebeckCoeff * tempDiff * 1e-6; // Convert μV to V
    const power = Math.pow(voltage, 2) / (4 * electricalResistance) * tegConfig.thermoelectricPairs;
    
    // Calculate efficiency: η = ΔT/Th * √(1+ZT) - 1 / √(1+ZT) + Tc/Th
    const avgTemp = (hotSideTemp + coldSideTemp) / 2 + 273.15; // Convert to Kelvin
    const zt = calculateZTValue(tegConfig.pTypeMaterial, tegConfig.nTypeMaterial, avgTemp);
    const efficiency = (tempDiff / (hotSideTemp + 273.15)) * (Math.sqrt(1 + zt) - 1) / (Math.sqrt(1 + zt) + (coldSideTemp + 273.15) / (hotSideTemp + 273.15));

    if (power > maxPower) {
      maxPower = power;
      bestLocation = location;
      bestEfficiency = efficiency;
    }
  }

  return {
    optimalLocation: bestLocation.location,
    expectedPower: maxPower,
    efficiency: bestEfficiency * 100,
    reasoning: `Selected ${bestLocation.location} due to optimal temperature difference (${bestLocation.maxTemperature - 25}K) and sufficient cooling capability`
  };
}

/**
 * Calculate thermal time constant for TEG system
 */
export function calculateThermalTimeConstant(
  config: TEGConfiguration,
  thermalMass: number // kg
): number {
  const thermalCapacity = thermalMass * config.pTypeMaterial.specificHeat; // J/K
  const thermalConductance = calculateThermalConductivity(config.pTypeMaterial, config.nTypeMaterial, config.legDimensions); // W/K
  
  return thermalCapacity / thermalConductance; // seconds
}

/**
 * Estimate TEG system cost
 */
export function estimateTEGCost(config: TEGConfiguration): {
  materialCost: number;
  manufacturingCost: number;
  totalCost: number;
} {
  // Calculate material volume
  const legVolume = config.legDimensions.length * config.legDimensions.crossSectionalArea * 1e-9; // m³
  const pTypeMass = legVolume * config.pTypeMaterial.density * config.thermoelectricPairs; // kg
  const nTypeMass = legVolume * config.nTypeMaterial.density * config.thermoelectricPairs; // kg

  // Material costs
  const pTypeCost = pTypeMass * config.pTypeMaterial.cost;
  const nTypeCost = nTypeMass * config.nTypeMaterial.cost;
  const materialCost = pTypeCost + nTypeCost;

  // Manufacturing cost (estimated as 2-3x material cost)
  const manufacturingCost = materialCost * 2.5;

  return {
    materialCost,
    manufacturingCost,
    totalCost: materialCost + manufacturingCost
  };
}

/**
 * Calculate optimal load resistance for maximum power transfer
 */
export function calculateOptimalLoadResistance(
  config: TEGConfiguration,
  temperature: number
): number {
  const internalResistance = calculateElectricalResistivity(config.pTypeMaterial, config.nTypeMaterial, config.legDimensions);
  
  // For maximum power transfer, load resistance should equal internal resistance
  return internalResistance;
}

/**
 * Validate thermal conditions for TEG operation
 */
export function validateThermalConditions(
  conditions: ThermalConditions,
  config: TEGConfiguration
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check temperature ranges
  const pTempRange = config.pTypeMaterial.operatingTempRange;
  const nTempRange = config.nTypeMaterial.operatingTempRange;
  const minOpTemp = Math.max(pTempRange.min, nTempRange.min);
  const maxOpTemp = Math.min(pTempRange.max, nTempRange.max);

  if (conditions.hotSideTemperature > maxOpTemp) {
    errors.push(`Hot side temperature (${conditions.hotSideTemperature}°C) exceeds maximum operating temperature (${maxOpTemp}°C)`);
  }

  if (conditions.hotSideTemperature < minOpTemp) {
    errors.push(`Hot side temperature (${conditions.hotSideTemperature}°C) below minimum operating temperature (${minOpTemp}°C)`);
  }

  if (conditions.coldSideTemperature >= conditions.hotSideTemperature) {
    errors.push('Cold side temperature must be lower than hot side temperature');
  }

  // Check temperature difference
  const tempDiff = conditions.hotSideTemperature - conditions.coldSideTemperature;
  if (tempDiff < 10) {
    warnings.push('Low temperature difference may result in poor performance');
  }

  // Check heat flux
  if (conditions.heatFlux <= 0) {
    errors.push('Heat flux must be positive');
  }

  if (conditions.heatFlux < 1000) {
    warnings.push('Low heat flux may result in minimal power generation');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}