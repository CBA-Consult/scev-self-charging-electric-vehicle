/**
 * Basic Usage Example for Wireless EV Charging
 * 
 * This example demonstrates the fundamental wireless charging capabilities
 * including automated alignment, safety monitoring, and charging optimization.
 */

import { 
  WirelessChargingController,
  AutomatedChargingManager,
  WirelessChargingConfiguration,
  VehicleChargingProfile,
  GridIntegrationConfig
} from '../index';

/**
 * Basic wireless charging demonstration
 */
async function basicWirelessChargingDemo() {
  console.log('🔋 Starting Basic Wireless EV Charging Demo');
  console.log('=' .repeat(50));

  // Step 1: Configure wireless charging system
  const chargingConfig: WirelessChargingConfiguration = {
    chargingStandard: 'SAE J2954',
    powerLevel: 'WPT2', // 7.7kW for home charging
    frequency: 85000, // 85kHz standard frequency
    efficiency: 94, // Target 94% efficiency
    alignment: {
      tolerance: 25, // ±25mm positioning tolerance
      autoAlignment: true,
      guidanceSystem: 'automated'
    },
    safety: {
      foreignObjectDetection: true,
      livingObjectProtection: true,
      emfLimits: 27 // μT - well below safety limits
    }
  };

  // Step 2: Initialize wireless charging controller
  const chargingController = new WirelessChargingController(chargingConfig);
  console.log('✅ Wireless charging controller initialized');

  // Step 3: Define vehicle charging profile
  const vehicleProfile: VehicleChargingProfile = {
    vehicleId: 'SCEV-DEMO-001',
    batteryCapacity: 75, // 75kWh battery
    currentSOC: 30, // Starting at 30% charge
    targetSOC: 85, // Target 85% charge
    chargingCurve: [
      { soc: 0, maxPower: 11, efficiency: 0.94 },
      { soc: 50, maxPower: 11, efficiency: 0.95 },
      { soc: 80, maxPower: 7, efficiency: 0.93 },
      { soc: 100, maxPower: 3, efficiency: 0.90 }
    ],
    preferences: {
      maxPowerLevel: 11,
      scheduledCharging: true,
      costOptimization: true,
      renewableEnergyPreference: true
    }
  };

  console.log(`🚗 Vehicle Profile: ${vehicleProfile.vehicleId}`);
  console.log(`   Battery: ${vehicleProfile.batteryCapacity}kWh`);
  console.log(`   Current SOC: ${vehicleProfile.currentSOC}%`);
  console.log(`   Target SOC: ${vehicleProfile.targetSOC}%`);

  try {
    // Step 4: Start wireless charging session
    console.log('\n🎯 Initiating wireless charging session...');
    const chargingSession = await chargingController.initializeChargingSession(
      vehicleProfile,
      'demo-station-001'
    );

    console.log(`✅ Charging session started: ${chargingSession.sessionId}`);
    console.log(`   Power Level: ${chargingSession.powerLevel}kW`);
    console.log(`   Status: ${chargingSession.status}`);

    // Step 5: Monitor charging progress
    console.log('\n📊 Monitoring charging progress...');
    
    // Simulate charging progress monitoring
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const metrics = await chargingController.optimizeCharging(chargingSession.sessionId);
      
      console.log(`   Cycle ${i + 1}:`);
      console.log(`     Efficiency: ${metrics.powerTransferEfficiency.toFixed(1)}%`);
      console.log(`     Alignment: ±${metrics.alignmentAccuracy.toFixed(1)}mm`);
      console.log(`     EMF Level: ${metrics.emfExposure.toFixed(1)}μT`);
      console.log(`     Temperature: +${metrics.temperatureRise.toFixed(1)}°C`);
    }

    // Step 6: Complete charging session
    console.log('\n🏁 Completing charging session...');
    const completedSession = await chargingController.completeChargingSession(chargingSession.sessionId);
    
    console.log(`✅ Charging completed successfully`);
    console.log(`   Final Efficiency: ${completedSession.efficiency.toFixed(1)}%`);
    console.log(`   Energy Transferred: ${completedSession.energyTransferred.toFixed(2)}kWh`);
    console.log(`   Total Cost: $${completedSession.cost.toFixed(2)}`);

  } catch (error) {
    console.error('❌ Charging session failed:', error.message);
  }
}

/**
 * Automated charging management demonstration
 */
async function automatedChargingDemo() {
  console.log('\n🤖 Starting Automated Charging Management Demo');
  console.log('=' .repeat(50));

  // Configure grid integration
  const gridConfig: GridIntegrationConfig = {
    v2gEnabled: true,
    demandResponse: true,
    peakShaving: true,
    renewableEnergyIntegration: true,
    gridStabilization: true,
    timeOfUseOptimization: true
  };

  const chargingManager = new AutomatedChargingManager(gridConfig);
  console.log('✅ Automated charging manager initialized');

  // Define charging preferences
  const chargingPreferences = {
    costOptimization: true,
    latestStartTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
    renewableEnergyPreference: true,
    preferredLocation: { 
      latitude: 40.7128, 
      longitude: -74.0060 
    }
  };

  const vehicleProfile: VehicleChargingProfile = {
    vehicleId: 'SCEV-AUTO-001',
    batteryCapacity: 85,
    currentSOC: 25,
    targetSOC: 90,
    chargingCurve: [
      { soc: 0, maxPower: 11, efficiency: 0.94 },
      { soc: 50, maxPower: 11, efficiency: 0.95 },
      { soc: 80, maxPower: 7, efficiency: 0.93 },
      { soc: 100, maxPower: 3, efficiency: 0.90 }
    ],
    preferences: {
      maxPowerLevel: 11,
      scheduledCharging: true,
      costOptimization: true,
      renewableEnergyPreference: true
    }
  };

  try {
    // Schedule optimal charging
    console.log('📅 Scheduling optimal charging session...');
    const scheduledSession = await chargingManager.scheduleAutomatedCharging(
      vehicleProfile,
      chargingPreferences
    );

    console.log(`✅ Optimal charging scheduled:`);
    console.log(`   Session ID: ${scheduledSession.sessionId}`);
    console.log(`   Start Time: ${scheduledSession.scheduledStartTime.toLocaleString()}`);
    console.log(`   End Time: ${scheduledSession.estimatedEndTime.toLocaleString()}`);
    console.log(`   Estimated Cost: $${scheduledSession.estimatedCost.toFixed(2)}`);
    console.log(`   Renewable Energy: ${scheduledSession.renewableEnergyPercentage}%`);

    // Enable V2G services
    console.log('\n🔄 Enabling Vehicle-to-Grid services...');
    const v2gPreferences = {
      maxDischargeRate: 11, // 11kW max discharge
      reservedEnergy: 20, // Always keep 20kWh reserved
      participationHours: { start: 16, end: 20 } // Peak hours 4-8 PM
    };

    const v2gSession = await chargingManager.enableV2GServices(
      vehicleProfile,
      v2gPreferences
    );

    console.log(`✅ V2G services enabled:`);
    console.log(`   Session ID: ${v2gSession.sessionId}`);
    console.log(`   Max Discharge: ${v2gSession.maxDischargeRate}kW`);
    console.log(`   Available Energy: ${v2gSession.availableEnergy.toFixed(1)}kWh`);
    console.log(`   Revenue Rate: $${v2gSession.revenueRate.toFixed(3)}/kWh`);

    // Demonstrate demand response participation
    console.log('\n⚡ Checking demand response opportunities...');
    const demandResponse = await chargingManager.participateInDemandResponse(vehicleProfile);
    
    console.log(`✅ Demand response analysis:`);
    console.log(`   Recommended Action: ${demandResponse.action}`);
    console.log(`   Incentive: $${demandResponse.incentive.toFixed(2)}`);
    
    if (demandResponse.estimatedDelay) {
      console.log(`   Estimated Delay: ${demandResponse.estimatedDelay} hours`);
    }
    if (demandResponse.powerIncrease) {
      console.log(`   Power Increase: ${demandResponse.powerIncrease}kW`);
    }

    // Demonstrate user convenience features
    console.log('\n🎯 Enhancing user convenience...');
    const convenienceFeatures = await chargingManager.enhanceUserConvenience(vehicleProfile.vehicleId);
    
    console.log(`✅ Convenience features enabled:`);
    console.log(`   Pre-conditioning: ${convenienceFeatures.preConditioning.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   Target Temperature: ${convenienceFeatures.preConditioning.targetTemperature}°C`);
    console.log(`   Auto Payment: ${convenienceFeatures.payment.autoPayEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   Predictive Scheduling: ${convenienceFeatures.predictiveScheduling.enabled ? 'Enabled' : 'Disabled'}`);

    // Demonstrate safety enhancements
    console.log('\n🛡️ Verifying safety enhancements...');
    const safetyFeatures = await chargingManager.enhanceSafety('demo-station-001');
    
    console.log(`✅ Safety systems verified:`);
    console.log(`   Foreign Object Detection: ${safetyFeatures.continuousMonitoring.foreignObjectDetection ? 'Active' : 'Inactive'}`);
    console.log(`   Living Object Protection: ${safetyFeatures.continuousMonitoring.livingObjectProtection ? 'Active' : 'Inactive'}`);
    console.log(`   EMF Monitoring: ${safetyFeatures.continuousMonitoring.emfMonitoring ? 'Active' : 'Inactive'}`);
    console.log(`   Emergency Response: ${safetyFeatures.emergencyResponse.automaticShutdown ? 'Ready' : 'Not Ready'}`);
    console.log(`   Cybersecurity: ${safetyFeatures.cybersecurity.encryptedCommunication ? 'Secured' : 'Unsecured'}`);

  } catch (error) {
    console.error('❌ Automated charging demo failed:', error.message);
  }
}

/**
 * Convenience and safety benefits demonstration
 */
async function convenienceSafetyDemo() {
  console.log('\n🎯 Demonstrating Convenience and Safety Benefits');
  console.log('=' .repeat(50));

  // Traditional vs Wireless Charging Comparison
  console.log('📊 Charging Method Comparison:');
  console.log('\nTraditional Cable Charging:');
  console.log('   ⏱️  Connection Time: 15-30 seconds');
  console.log('   🌧️  Weather Exposure: 30-60 seconds');
  console.log('   💪 Physical Effort: Moderate');
  console.log('   ♿ Accessibility: Limited');
  console.log('   🤖 Automation: Manual operation');
  console.log('   ⚡ Shock Risk: Present (exposed conductors)');
  console.log('   🔌 Wear & Tear: High (physical connections)');

  console.log('\nWireless Charging:');
  console.log('   ⏱️  Connection Time: 0 seconds (100% reduction)');
  console.log('   🌧️  Weather Exposure: 0 seconds (100% elimination)');
  console.log('   💪 Physical Effort: None (100% reduction)');
  console.log('   ♿ Accessibility: Universal (85% improvement)');
  console.log('   🤖 Automation: Fully automated (95% automation)');
  console.log('   ⚡ Shock Risk: Eliminated (no exposed conductors)');
  console.log('   🔌 Wear & Tear: Minimal (no physical connections)');

  // Safety Benefits Demonstration
  console.log('\n🛡️ Safety Benefits:');
  console.log('   ✅ No electrical shock risk');
  console.log('   ✅ No trip hazards from cables');
  console.log('   ✅ Weather-independent operation');
  console.log('   ✅ Automated safety monitoring');
  console.log('   ✅ EMF exposure control (<27μT)');
  console.log('   ✅ Foreign object detection');
  console.log('   ✅ Emergency shutdown capability');
  console.log('   ✅ Cybersecurity protection');

  // User Experience Journey
  console.log('\n🚗 User Experience Journey:');
  console.log('\nTraditional Charging Process:');
  console.log('   1. Locate charging station (2-5 minutes)');
  console.log('   2. Park and position vehicle (1-2 minutes)');
  console.log('   3. Exit vehicle in weather (30 seconds)');
  console.log('   4. Connect charging cable (30 seconds)');
  console.log('   5. Authenticate and start session (1 minute)');
  console.log('   6. Return to disconnect (30 seconds)');
  console.log('   📊 Total User Interaction: 5-9 minutes');

  console.log('\nWireless Charging Process:');
  console.log('   1. Approach designated parking area (1 minute)');
  console.log('   2. Automated guidance and positioning (30 seconds)');
  console.log('   3. Automatic authentication and start (10 seconds)');
  console.log('   4. Automatic completion and notification (0 seconds)');
  console.log('   📊 Total User Interaction: 1.5 minutes (83% reduction)');

  // Quantified Benefits
  console.log('\n📈 Quantified Benefits:');
  console.log('   🕐 Time Savings: 83% reduction in interaction time');
  console.log('   🌦️  Weather Protection: 100% elimination of exposure');
  console.log('   💪 Physical Effort: 100% reduction');
  console.log('   ♿ Accessibility: 85% improvement for mobility-limited users');
  console.log('   🔒 Safety: 99.9% reduction in electrical risks');
  console.log('   🤖 Automation: 95% of process automated');
  console.log('   💰 Cost Optimization: Up to 30% savings with smart scheduling');
  console.log('   🌱 Renewable Integration: Up to 95% renewable energy usage');
}

/**
 * Main demonstration function
 */
async function runWirelessChargingDemo() {
  console.log('🚀 Wireless EV Charging Opportunities Demonstration');
  console.log('🔋 Exploring Automated Charging for Enhanced Convenience and Safety');
  console.log('=' .repeat(70));

  try {
    // Run basic wireless charging demo
    await basicWirelessChargingDemo();
    
    // Run automated charging management demo
    await automatedChargingDemo();
    
    // Demonstrate convenience and safety benefits
    await convenienceSafetyDemo();

    console.log('\n🎉 Demonstration completed successfully!');
    console.log('✨ Wireless and automated charging represents the future of EV charging:');
    console.log('   • Effortless user experience');
    console.log('   • Enhanced safety and reliability');
    console.log('   • Intelligent grid integration');
    console.log('   • Sustainable energy optimization');
    console.log('   • Perfect alignment with SCEV vision');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Run the demonstration
if (require.main === module) {
  runWirelessChargingDemo();
}

export { 
  runWirelessChargingDemo,
  basicWirelessChargingDemo,
  automatedChargingDemo,
  convenienceSafetyDemo
};