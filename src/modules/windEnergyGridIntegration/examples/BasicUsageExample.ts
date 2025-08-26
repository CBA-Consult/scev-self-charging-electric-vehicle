/**
 * Basic Usage Example for Wind Energy Grid Integration
 * 
 * This example demonstrates how to use the wind energy grid integration system
 * for managing wind energy integration into the national grid.
 */

import {
  createWindEnergyGridIntegration,
  defaultGridIntegrationConfig,
  createTestGridInputs,
  gridIntegrationUtils,
  type GridIntegrationInputs,
  type GridIntegrationOutputs
} from '../index';

/**
 * Basic wind energy grid integration example
 */
export function basicWindEnergyGridIntegrationExample(): void {
  console.log('=== Wind Energy Grid Integration Example ===\n');

  // Create wind energy grid integration system
  const windGridSystem = createWindEnergyGridIntegration(
    defaultGridIntegrationConfig
  );

  // Create test inputs representing current grid conditions
  const gridInputs: GridIntegrationInputs = createTestGridInputs({
    currentGridLoad: 1000000000,    // 1 GW current load
    windGeneration: 350000000,      // 350 MW wind generation (35% penetration)
    gridFrequency: 49.9,           // Slightly low frequency
    gridVoltage: 398000,           // Slightly low voltage
    storageSOC: 0.45,              // 45% storage state of charge
    marketConditions: {
      electricityPrice: 0.12,       // $0.12/kWh
      carbonPrice: 30,              // $30/tCO2
      renewableIncentive: 0.025     // $0.025/kWh incentive
    }
  });

  console.log('Input Conditions:');
  console.log(`- Grid Load: ${(gridInputs.currentGridLoad / 1000000).toFixed(0)} MW`);
  console.log(`- Wind Generation: ${(gridInputs.windGeneration / 1000000).toFixed(0)} MW`);
  console.log(`- Wind Penetration: ${((gridInputs.windGeneration / gridInputs.currentGridLoad) * 100).toFixed(1)}%`);
  console.log(`- Grid Frequency: ${gridInputs.gridFrequency} Hz`);
  console.log(`- Storage SOC: ${(gridInputs.storageSOC * 100).toFixed(1)}%`);
  console.log(`- Electricity Price: $${gridInputs.marketConditions.electricityPrice}/kWh\n`);

  // Process grid integration
  const result: GridIntegrationOutputs = windGridSystem.processGridIntegration(gridInputs);

  // Display results
  console.log('Grid Integration Results:');
  console.log(`- Wind Power Dispatch: ${(result.windPowerDispatch / 1000000).toFixed(1)} MW`);
  console.log(`- Storage Command: ${result.storageCommand.mode} at ${(result.storageCommand.power / 1000000).toFixed(1)} MW`);
  console.log(`- Demand Response: ${result.demandResponseSignal.type} by ${(result.demandResponseSignal.magnitude * 100).toFixed(1)}%`);
  console.log(`- Grid Stability Risk: ${result.gridStabilityMetrics.riskLevel}`);
  console.log(`- System Health: ${result.systemStatus.overallHealth}\n`);

  // Display economic metrics
  console.log('Economic Metrics:');
  console.log(`- Revenue Generated: $${result.economicMetrics.revenueGenerated.toFixed(2)}`);
  console.log(`- Grid Service Value: $${result.economicMetrics.gridServiceValue.toFixed(2)}`);
  console.log(`- Carbon Reduction: ${result.economicMetrics.carbonReduction.toFixed(1)} kg CO2\n`);

  // Display recommendations
  console.log('Recommendations:');
  console.log('Short-term:');
  result.recommendations.shortTerm.forEach(rec => console.log(`  - ${rec}`));
  console.log('Medium-term:');
  result.recommendations.mediumTerm.forEach(rec => console.log(`  - ${rec}`));
  console.log('Long-term:');
  result.recommendations.longTerm.forEach(rec => console.log(`  - ${rec}`));

  console.log('\n=== Example Complete ===');
}

/**
 * Grid stability assessment example
 */
export function gridStabilityExample(): void {
  console.log('\n=== Grid Stability Assessment Example ===\n');

  // Test different wind penetration levels
  const penetrationLevels = [0.2, 0.4, 0.6, 0.8];
  const baseLoad = 1000000000; // 1 GW

  console.log('Wind Penetration Impact on Grid Stability:');
  console.log('Penetration | Stability Impact | Required Storage');

  penetrationLevels.forEach(penetration => {
    const windGeneration = baseLoad * penetration;
    
    // Assess grid stability impact
    const stabilityImpact = gridIntegrationUtils.assessGridStabilityImpact(
      penetration,
      true,  // Storage available
      0.15   // 15% demand response capacity
    );
    
    // Calculate required storage
    const requiredStorage = gridIntegrationUtils.calculateRequiredStorageCapacity(
      windGeneration,
      penetration,
      0.3 // 30% grid variability
    );

    console.log(`${(penetration * 100).toFixed(0)}%        | ${stabilityImpact.padEnd(15)} | ${(requiredStorage / 1000000).toFixed(0)} MWh`);
  });

  console.log('\n=== Grid Stability Example Complete ===');
}

/**
 * Storage optimization example
 */
export function storageOptimizationExample(): void {
  console.log('\n=== Storage Optimization Example ===\n');

  const windCapacity = 500000000; // 500 MW wind capacity
  const targetPenetration = 0.4;  // 40% target penetration
  const gridVariability = 0.25;   // 25% grid variability

  // Calculate optimal storage capacity
  const optimalStorage = gridIntegrationUtils.calculateRequiredStorageCapacity(
    windCapacity,
    targetPenetration,
    gridVariability
  );

  console.log('Storage Optimization Results:');
  console.log(`- Wind Capacity: ${(windCapacity / 1000000).toFixed(0)} MW`);
  console.log(`- Target Penetration: ${(targetPenetration * 100).toFixed(0)}%`);
  console.log(`- Grid Variability: ${(gridVariability * 100).toFixed(0)}%`);
  console.log(`- Optimal Storage Capacity: ${(optimalStorage / 1000000).toFixed(0)} MWh`);
  console.log(`- Storage-to-Wind Ratio: ${((optimalStorage / windCapacity) * 100).toFixed(1)}%`);

  // Calculate optimal wind penetration with storage
  const optimalPenetration = gridIntegrationUtils.calculateOptimalWindPenetration(
    1000000000, // 1 GW grid load
    0.8,        // 80% wind availability
    optimalStorage,
    { maxWindPenetration: 0.6 }
  );

  console.log(`- Optimal Wind Penetration: ${(optimalPenetration * 100).toFixed(1)}%`);

  console.log('\n=== Storage Optimization Example Complete ===');
}

/**
 * Run all examples
 */
export function runWindEnergyGridIntegrationExamples(): void {
  try {
    basicWindEnergyGridIntegrationExample();
    gridStabilityExample();
    storageOptimizationExample();
  } catch (error) {
    console.error('Error running wind energy grid integration examples:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runWindEnergyGridIntegrationExamples();
}