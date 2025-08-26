/**
 * Basic TEG System Usage Example
 * 
 * This example demonstrates the basic usage of the Thermoelectric Generator
 * system for converting waste heat from braking into electrical energy.
 */

import {
  ThermoelectricGenerator,
  createTEGSystem,
  TEGSystemInputs
} from '../ThermoelectricGenerator';

import {
  ThermalConditions,
  TEGConfiguration,
  defaultTEGConfigurations,
  defaultTEGMaterials
} from '../types';

import {
  calculateSeebeckCoefficient,
  calculateZTValue,
  optimizeTEGPlacement,
  validateTEGConfiguration
} from '../utils';

/**
 * Basic TEG power calculation example
 */
export function basicTEGPowerCalculation(): void {
  console.log('=== Basic TEG Power Calculation Example ===\n');

  // Create TEG system
  const tegSystem = createTEGSystem();

  // Define thermal conditions during braking
  const thermalConditions: ThermalConditions = {
    hotSideTemperature: 180,        // °C - Brake disc temperature
    coldSideTemperature: 45,        // °C - Cold side temperature
    ambientTemperature: 25,         // °C - Ambient temperature
    heatFlux: 5000,                 // W/m² - Heat flux from braking
    convectionCoefficient: {
      hotSide: 50,                  // W/(m²·K)
      coldSide: 25                  // W/(m²·K)
    },
    airflow: {
      velocity: 15,                 // m/s - Vehicle speed airflow
      temperature: 25               // °C
    },
    brakingDuration: 8,             // seconds
    brakingIntensity: 0.7           // 70% braking intensity
  };

  // Create TEG system inputs
  const tegInputs: TEGSystemInputs = {
    thermalConditions,
    operatingMode: 'maximum_power',
    coolingSystemActive: true,
    thermalProtectionEnabled: true
  };

  try {
    // Calculate TEG performance for brake disc configuration
    const performance = tegSystem.calculateTEGPower('brake_disc_teg', tegInputs);

    console.log('TEG Performance Results:');
    console.log(`  Electrical Power: ${performance.electricalPower.toFixed(2)} W`);
    console.log(`  Voltage: ${performance.voltage.toFixed(2)} V`);
    console.log(`  Current: ${performance.current.toFixed(3)} A`);
    console.log(`  Efficiency: ${performance.efficiency.toFixed(2)}%`);
    console.log(`  Power Density: ${performance.powerDensity.toFixed(2)} W/kg`);
    console.log(`  Temperature Difference: ${performance.temperatureDifference.toFixed(1)} K`);
    console.log(`  Heat Input: ${performance.heatInput.toFixed(2)} W`);
    console.log(`  Heat Rejected: ${performance.heatRejected.toFixed(2)} W`);
    console.log(`  Reliability: ${performance.reliability.toFixed(1)}%`);
    console.log(`  Expected Lifespan: ${(performance.lifespan / 8760).toFixed(1)} years\n`);

  } catch (error) {
    console.error('Error calculating TEG performance:', error);
  }
}

/**
 * TEG material comparison example
 */
export function tegMaterialComparison(): void {
  console.log('=== TEG Material Comparison Example ===\n');

  const materials = Object.entries(defaultTEGMaterials);
  const testTemperature = 150; // °C

  console.log('Material Performance Comparison at 150°C:');
  console.log('Material\t\t\tSeebeck (μV/K)\tZT Value\tTemp Range');
  console.log('─'.repeat(70));

  materials.forEach(([key, material]) => {
    const ztValue = calculateZTValue(material, material, testTemperature);
    const tempRange = `${material.operatingTempRange.min}°C to ${material.operatingTempRange.max}°C`;
    
    console.log(`${material.name.padEnd(25)}\t${Math.abs(material.seebeckCoefficient).toString().padEnd(8)}\t${ztValue.toFixed(2).padEnd(8)}\t${tempRange}`);
  });

  console.log('\nRecommendations:');
  console.log('- Bi2Te3: Best for low-temperature applications (< 200°C)');
  console.log('- PbTe: Optimal for medium-temperature applications (200-600°C)');
  console.log('- SiGe: Suitable for high-temperature applications (> 600°C)');
  console.log('- CoSb3: Good balance for automotive applications (300-700°C)\n');
}

/**
 * TEG configuration validation example
 */
export function tegConfigurationValidation(): void {
  console.log('=== TEG Configuration Validation Example ===\n');

  // Test valid configuration
  const validConfig = defaultTEGConfigurations['brake_disc_teg'];
  const validationResult = validateTEGConfiguration(validConfig);

  console.log('Validating brake disc TEG configuration:');
  console.log(`  Valid: ${validationResult.isValid}`);
  console.log(`  Errors: ${validationResult.errors.length}`);
  console.log(`  Warnings: ${validationResult.warnings.length}`);

  if (validationResult.warnings.length > 0) {
    console.log('  Warning messages:');
    validationResult.warnings.forEach(warning => console.log(`    - ${warning}`));
  }

  // Test invalid configuration
  const invalidConfig: TEGConfiguration = {
    ...validConfig,
    dimensions: { length: -10, width: 50, height: 5 }, // Invalid negative dimension
    thermoelectricPairs: 0, // Invalid zero pairs
    heatExchanger: {
      ...validConfig.heatExchanger,
      thermalResistance: { hotSide: -0.1, coldSide: 0.3 } // Invalid negative resistance
    }
  };

  const invalidValidation = validateTEGConfiguration(invalidConfig);
  console.log('\nValidating invalid configuration:');
  console.log(`  Valid: ${invalidValidation.isValid}`);
  console.log(`  Errors: ${invalidValidation.errors.length}`);
  
  if (invalidValidation.errors.length > 0) {
    console.log('  Error messages:');
    invalidValidation.errors.forEach(error => console.log(`    - ${error}`));
  }
  console.log();
}

/**
 * TEG placement optimization example
 */
export function tegPlacementOptimization(): void {
  console.log('=== TEG Placement Optimization Example ===\n');

  const availableLocations = [
    {
      location: 'brake_disc',
      maxTemperature: 300,
      heatFlux: 8000,
      availableArea: 0.08, // m²
      coolingCapability: 150 // K temperature drop capability
    },
    {
      location: 'brake_caliper',
      maxTemperature: 250,
      heatFlux: 6000,
      availableArea: 0.04,
      coolingCapability: 120
    },
    {
      location: 'motor_housing',
      maxTemperature: 120,
      heatFlux: 3000,
      availableArea: 0.15,
      coolingCapability: 80
    },
    {
      location: 'exhaust_manifold',
      maxTemperature: 400,
      heatFlux: 12000,
      availableArea: 0.06,
      coolingCapability: 200
    }
  ];

  const tegConfig = defaultTEGConfigurations['brake_disc_teg'];
  const optimization = optimizeTEGPlacement(availableLocations, tegConfig);

  console.log('TEG Placement Optimization Results:');
  console.log(`  Optimal Location: ${optimization.optimalLocation}`);
  console.log(`  Expected Power: ${optimization.expectedPower.toFixed(2)} W`);
  console.log(`  Efficiency: ${optimization.efficiency.toFixed(2)}%`);
  console.log(`  Reasoning: ${optimization.reasoning}\n`);
}

/**
 * TEG system diagnostics example
 */
export function tegSystemDiagnostics(): void {
  console.log('=== TEG System Diagnostics Example ===\n');

  const tegSystem = createTEGSystem();
  
  // Add a custom high-temperature material
  tegSystem.addThermoelectricMaterial({
    name: 'Custom High-Temp Material',
    type: 'n-type',
    seebeckCoefficient: -350,
    electricalConductivity: 15000,
    thermalConductivity: 5.0,
    ztValue: 1.8,
    operatingTempRange: { min: 400, max: 800 },
    density: 6500,
    specificHeat: 400,
    thermalExpansion: 8e-6,
    cost: 800
  });

  // Get system diagnostics
  const diagnostics = tegSystem.getSystemDiagnostics();

  console.log('TEG System Diagnostics:');
  console.log(`  Available Configurations: ${diagnostics.configurations.size}`);
  console.log(`  Available Materials: ${diagnostics.materials.size}`);
  console.log(`  System Reliability: ${(diagnostics.systemReliability * 100).toFixed(1)}%`);
  console.log(`  Thermal Protection: ${diagnostics.thermalProtectionActive ? 'Active' : 'Inactive'}`);
  console.log(`  Performance History Records: ${diagnostics.performanceHistory.length}`);

  console.log('\nAvailable TEG Configurations:');
  diagnostics.configurations.forEach((config, id) => {
    console.log(`  - ${id}: ${config.type}, ${config.thermoelectricPairs} pairs`);
  });

  console.log('\nAvailable Materials:');
  diagnostics.materials.forEach((material, name) => {
    console.log(`  - ${name}: ZT=${material.ztValue}, Range=${material.operatingTempRange.min}-${material.operatingTempRange.max}°C`);
  });
  console.log();
}

/**
 * Run all basic examples
 */
export function runBasicTEGExamples(): void {
  console.log('🔥 Thermoelectric Generator (TEG) Basic Examples\n');
  
  try {
    basicTEGPowerCalculation();
    tegMaterialComparison();
    tegConfigurationValidation();
    tegPlacementOptimization();
    tegSystemDiagnostics();
    
    console.log('✅ All basic TEG examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running basic TEG examples:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runBasicTEGExamples();
}