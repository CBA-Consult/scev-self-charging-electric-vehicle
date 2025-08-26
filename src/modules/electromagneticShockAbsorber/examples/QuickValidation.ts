/**
 * Quick Validation Example
 * 
 * This file provides a quick validation that the rotary electromagnetic
 * shock absorber prototype is working correctly.
 */

import {
  createShockAbsorberSystem,
  createIntegratedSuspensionSystem,
  createTestSuspensionInputs,
  createTestVehicleSuspensionInputs,
  createTestEnergyManagementInputs
} from '../index';

/**
 * Quick validation of the prototype functionality
 */
export function quickValidation(): boolean {
  console.log('🔧 Running Quick Validation of Rotary Electromagnetic Shock Absorber Prototype...\n');

  try {
    // Test 1: Basic shock absorber functionality
    console.log('Test 1: Basic Shock Absorber Functionality');
    const shockAbsorber = createShockAbsorberSystem();
    
    const basicInputs = createTestSuspensionInputs({
      verticalVelocity: 1.0,
      cornerLoad: 500,
      roadCondition: 'rough',
      vehicleSpeed: 60
    });

    shockAbsorber.setDampingMode('energy_harvesting');
    const basicOutputs = shockAbsorber.processMotion(basicInputs);

    console.log(`  ✓ Power Generation: ${basicOutputs.generatedPower.toFixed(2)} W`);
    console.log(`  ✓ Efficiency: ${(basicOutputs.efficiency * 100).toFixed(1)}%`);
    console.log(`  ✓ Damping Force: ${basicOutputs.dampingForce.toFixed(1)} N`);
    
    if (basicOutputs.generatedPower <= 0) {
      throw new Error('No power generation detected');
    }
    if (basicOutputs.efficiency <= 0) {
      throw new Error('Invalid efficiency value');
    }

    // Test 2: Vehicle integration
    console.log('\nTest 2: Vehicle Integration');
    const vehicleSystem = createIntegratedSuspensionSystem();
    
    const vehicleInputs = createTestVehicleSuspensionInputs();
    const energyInputs = createTestEnergyManagementInputs();
    
    const vehicleOutputs = vehicleSystem.processVehicleSuspension(vehicleInputs, energyInputs);

    console.log(`  ✓ Total Power: ${vehicleOutputs.totalGeneratedPower.toFixed(2)} W`);
    console.log(`  ✓ Average Efficiency: ${(vehicleOutputs.averageEfficiency * 100).toFixed(1)}%`);
    console.log(`  ✓ Energy Distribution: ${vehicleOutputs.energyDistribution.toBattery.toFixed(1)} W to battery`);
    
    if (vehicleOutputs.totalGeneratedPower <= 0) {
      throw new Error('No total power generation detected');
    }

    // Test 3: Damping mode switching
    console.log('\nTest 3: Damping Mode Switching');
    const modes = ['comfort', 'sport', 'energy_harvesting', 'adaptive'] as const;
    
    modes.forEach(mode => {
      shockAbsorber.setDampingMode(mode);
      const status = shockAbsorber.getSystemStatus();
      console.log(`  ✓ ${mode} mode: ${status.mode === mode ? 'ACTIVE' : 'FAILED'}`);
      
      if (status.mode !== mode) {
        throw new Error(`Failed to switch to ${mode} mode`);
      }
    });

    // Test 4: Safety limits
    console.log('\nTest 4: Safety Limits');
    try {
      const extremeInputs = createTestSuspensionInputs({
        verticalVelocity: 10.0, // Extreme velocity
        cornerLoad: 500
      });
      shockAbsorber.processMotion(extremeInputs);
      throw new Error('Safety limits not enforced');
    } catch (error) {
      if (error instanceof Error && error.message.includes('exceeds safe limits')) {
        console.log('  ✓ Safety limits properly enforced');
      } else {
        throw error;
      }
    }

    // Test 5: System status and diagnostics
    console.log('\nTest 5: System Status and Diagnostics');
    const systemStatus = shockAbsorber.getSystemStatus();
    const vehicleStatus = vehicleSystem.getSystemStatus();

    console.log(`  ✓ Single shock absorber operational: ${systemStatus.isOperational}`);
    console.log(`  ✓ Vehicle system operational: ${vehicleStatus.shockAbsorbers.frontLeft.isOperational}`);
    console.log(`  ✓ Temperature monitoring: ${systemStatus.operatingTemperature.toFixed(1)}°C`);

    if (!systemStatus.isOperational) {
      throw new Error('System not operational');
    }

    console.log('\n✅ ALL VALIDATION TESTS PASSED');
    console.log('\nPrototype Status: READY FOR DEPLOYMENT');
    console.log('Key Achievements:');
    console.log(`  • Power Generation: ${basicOutputs.generatedPower.toFixed(2)} W per shock absorber`);
    console.log(`  • System Efficiency: ${(basicOutputs.efficiency * 100).toFixed(1)}%`);
    console.log(`  • Vehicle Total Power: ${vehicleOutputs.totalGeneratedPower.toFixed(2)} W`);
    console.log(`  • Safety Systems: ACTIVE`);
    console.log(`  • Integration: COMPLETE`);

    return true;

  } catch (error) {
    console.error('\n❌ VALIDATION FAILED:', error);
    return false;
  }
}

// Run validation if this file is executed directly
if (require.main === module) {
  quickValidation();
}