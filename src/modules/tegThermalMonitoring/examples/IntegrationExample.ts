/**
 * Integration Example - TEG Thermal Monitoring with Fuzzy Control System
 * 
 * This example demonstrates how the TEG thermal monitoring system integrates
 * with the existing fuzzy control and energy harvesting systems.
 */

import { createTEGThermalSystem, TEGEnergyIntegration, createTestTEGData } from '../index';
import { createFuzzyControlSystem, createTestInputs } from '../../fuzzyControl/index';
import type { SystemInputs } from '../../fuzzyControl/FuzzyControlIntegration';

/**
 * Complete system integration example
 */
export function completeSystemIntegration(): void {
  console.log('=== TEG Thermal Monitoring + Fuzzy Control Integration ===\n');

  // Create TEG thermal monitoring system
  const tegSystem = createTEGThermalSystem();
  
  // Create fuzzy control system
  const fuzzySystem = createFuzzyControlSystem({
    mass: 1800,
    wheelbase: 2.8,
    trackWidth: 1.6,
    centerOfGravityHeight: 0.5,
    frontAxleWeightRatio: 0.6
  });

  // Create TEG energy integration
  const tegIntegration = new TEGEnergyIntegration();

  // Set up alert handling
  tegSystem.onAlert((alert) => {
    console.log(`🚨 TEG Alert: ${alert.message} (${alert.severity})`);
    
    if (alert.severity === 'critical' || alert.severity === 'emergency') {
      console.log('   → Triggering emergency thermal management protocols');
    }
  });

  // Start TEG monitoring
  tegSystem.startMonitoring();

  // Simulate integrated operation
  simulateIntegratedOperation(tegSystem, fuzzySystem, tegIntegration);

  // Stop systems after demo
  setTimeout(() => {
    tegSystem.stopMonitoring();
    console.log('\n✅ Integration demo completed');
  }, 20000);
}

/**
 * Simulate integrated operation with both systems
 */
function simulateIntegratedOperation(
  tegSystem: any,
  fuzzySystem: any,
  tegIntegration: TEGEnergyIntegration
): void {
  console.log('🔄 Starting integrated system simulation...\n');

  let simulationStep = 0;
  const maxSteps = 30;

  const simulationInterval = setInterval(() => {
    simulationStep++;
    
    // Create base vehicle inputs
    const baseInputs = createTestInputs({
      vehicleSpeed: 60 + Math.sin(simulationStep * 0.1) * 20, // Varying speed
      brakingDemand: Math.max(0, Math.sin(simulationStep * 0.2) * 0.5), // Periodic braking
      batterySOC: 0.8 - (simulationStep * 0.01), // Gradually decreasing SOC
      motorTemperatures: {
        frontLeft: 70 + simulationStep * 2, // Gradually increasing temperature
        frontRight: 68 + simulationStep * 1.8,
        rearLeft: 65 + simulationStep * 1.5,
        rearRight: 67 + simulationStep * 1.6
      },
      ambientTemperature: 25 + Math.sin(simulationStep * 0.05) * 10
    });

    // Process fuzzy control system
    const fuzzyOutputs = fuzzySystem.processControlCycle(baseInputs);

    // Generate TEG sensor data based on motor temperatures
    const tegSensorData = [
      createTestTEGData({
        sensorId: 'motor_fl_teg',
        current: calculateTEGCurrent(baseInputs.motorTemperatures.frontLeft),
        temperature: baseInputs.motorTemperatures.frontLeft,
        location: { zone: 'frontLeftMotor', position: { x: 1.2, y: 0.8, z: 0.3 }, priority: 'critical' }
      }),
      createTestTEGData({
        sensorId: 'motor_fr_teg',
        current: calculateTEGCurrent(baseInputs.motorTemperatures.frontRight),
        temperature: baseInputs.motorTemperatures.frontRight,
        location: { zone: 'frontRightMotor', position: { x: 1.2, y: -0.8, z: 0.3 }, priority: 'critical' }
      }),
      createTestTEGData({
        sensorId: 'battery_teg',
        current: calculateTEGCurrent(35 + simulationStep * 0.5), // Battery temperature
        temperature: 35 + simulationStep * 0.5,
        location: { zone: 'batteryPack', position: { x: 0, y: 0, z: -0.2 }, priority: 'critical' }
      })
    ];

    // Update TEG system with sensor data
    tegSensorData.forEach(sensorData => {
      tegSystem.updateSensorData(sensorData);
    });

    // Get thermal zone status
    const systemStatus = tegSystem.getSystemStatus();
    const thermalZoneStatus = systemStatus.zones;

    // Create integrated inputs
    const integrationInputs = {
      ...baseInputs,
      tegSensorData,
      thermalZoneStatus,
      ambientTemperature: baseInputs.ambientTemperature,
      vehicleOperatingMode: 'normal' as const,
      thermalManagementActive: true
    };

    // Process integrated system
    const integrationOutputs = tegIntegration.processIntegratedSystem(integrationInputs);

    // Display results every 5 steps
    if (simulationStep % 5 === 0) {
      console.log(`📊 Step ${simulationStep}:`);
      console.log(`   Vehicle Speed: ${baseInputs.vehicleSpeed.toFixed(1)} km/h`);
      console.log(`   Max Motor Temp: ${Math.max(...Object.values(baseInputs.motorTemperatures)).toFixed(1)}°C`);
      console.log(`   Thermal Health: ${(integrationOutputs.thermalStatus.overallThermalHealth * 100).toFixed(1)}%`);
      console.log(`   TEG Power: ${integrationOutputs.tegEnergyContribution.totalTEGPower.toFixed(3)}W`);
      console.log(`   Regenerated Power: ${fuzzyOutputs.regeneratedPower.toFixed(1)}W`);
      
      if (integrationOutputs.thermalStatus.criticalZones.length > 0) {
        console.log(`   ⚠️  Critical Zones: ${integrationOutputs.thermalStatus.criticalZones.join(', ')}`);
      }
      
      if (integrationOutputs.thermalStatus.shutdownZones.length > 0) {
        console.log(`   🛑 Shutdown Zones: ${integrationOutputs.thermalStatus.shutdownZones.join(', ')}`);
      }
      
      if (integrationOutputs.systemRecommendations.operatingModeChange) {
        console.log(`   💡 Recommended Mode: ${integrationOutputs.systemRecommendations.operatingModeChange}`);
      }
      
      console.log('');
    }

    // Check for thermal emergencies
    if (integrationOutputs.thermalStatus.overallThermalHealth < 0.5) {
      console.log('🚨 THERMAL EMERGENCY DETECTED - Initiating emergency protocols');
      clearInterval(simulationInterval);
      return;
    }

    // End simulation
    if (simulationStep >= maxSteps) {
      clearInterval(simulationInterval);
      console.log('📈 Simulation completed successfully\n');
      
      // Display final statistics
      displayFinalStatistics(integrationOutputs, systemStatus);
    }
  }, 500);
}

/**
 * Calculate TEG current based on temperature
 */
function calculateTEGCurrent(temperature: number): number {
  // Simplified model: current increases with temperature
  const baseTemp = 25; // °C
  const tempDiff = Math.max(0, temperature - baseTemp);
  
  // TEG current increases with temperature difference
  const baseCurrent = 0.05; // A
  const currentPerDegree = 0.003; // A/°C
  
  return baseCurrent + (tempDiff * currentPerDegree);
}

/**
 * Display final system statistics
 */
function displayFinalStatistics(
  integrationOutputs: any,
  systemStatus: any
): void {
  console.log('📊 Final System Statistics:');
  console.log('─'.repeat(50));
  
  console.log('🌡️  Thermal Performance:');
  console.log(`   Overall Health: ${(integrationOutputs.thermalStatus.overallThermalHealth * 100).toFixed(1)}%`);
  console.log(`   Thermal Efficiency: ${(integrationOutputs.thermalStatus.thermalEfficiencyFactor * 100).toFixed(1)}%`);
  console.log(`   Power Reduction: ${(integrationOutputs.thermalStatus.recommendedPowerReduction * 100).toFixed(1)}%`);
  
  console.log('\n⚡ Energy Performance:');
  console.log(`   TEG Power: ${integrationOutputs.tegEnergyContribution.totalTEGPower.toFixed(3)}W`);
  console.log(`   TEG Efficiency: ${integrationOutputs.tegEnergyContribution.tegEfficiency.toFixed(1)}%`);
  console.log(`   Waste Heat Utilization: ${integrationOutputs.tegEnergyContribution.wasteHeatUtilization.toFixed(1)}%`);
  
  console.log('\n🏭 Zone Status:');
  systemStatus.zones.forEach((zone: any) => {
    const statusIcon = getZoneStatusIcon(zone.status);
    console.log(`   ${statusIcon} ${zone.zoneName}: ${zone.status} (${zone.maxTemperature.toFixed(1)}°C)`);
  });
  
  console.log('\n🔧 System Health:');
  console.log(`   Active Sensors: ${systemStatus.activeSensors}/${systemStatus.totalSensors}`);
  console.log(`   Active Shutdowns: ${systemStatus.activeShutdowns}`);
  console.log(`   Monitoring Active: ${systemStatus.monitoringActive ? 'Yes' : 'No'}`);
  
  if (integrationOutputs.systemRecommendations.maintenanceAlerts) {
    console.log('\n🔔 Maintenance Alerts:');
    integrationOutputs.systemRecommendations.maintenanceAlerts.forEach((alert: string) => {
      console.log(`   • ${alert}`);
    });
  }
}

/**
 * Get status icon for zone
 */
function getZoneStatusIcon(status: string): string {
  switch (status) {
    case 'normal': return '✅';
    case 'warning': return '⚠️';
    case 'critical': return '🔥';
    case 'shutdown': return '🛑';
    case 'fault': return '❌';
    default: return '❓';
  }
}

/**
 * Thermal stress test scenario
 */
export function thermalStressTest(): void {
  console.log('=== TEG Thermal Stress Test ===\n');

  const tegSystem = createTEGThermalSystem();
  const tegIntegration = new TEGEnergyIntegration();

  // Set up alert monitoring
  const alerts: any[] = [];
  tegSystem.onAlert((alert: any) => {
    alerts.push(alert);
    console.log(`🚨 Alert ${alerts.length}: ${alert.message} (${alert.severity})`);
  });

  tegSystem.startMonitoring();

  // Simulate extreme thermal conditions
  console.log('🔥 Simulating extreme thermal conditions...\n');

  let temperature = 80;
  let step = 0;

  const stressInterval = setInterval(() => {
    step++;
    temperature += 5; // Rapid temperature increase

    const stressData = createTestTEGData({
      sensorId: 'stress_test_sensor',
      current: calculateTEGCurrent(temperature),
      temperature: temperature,
      location: { zone: 'frontLeftMotor', position: { x: 1.2, y: 0.8, z: 0.3 }, priority: 'critical' }
    });

    tegSystem.updateSensorData(stressData);

    console.log(`Step ${step}: Temperature ${temperature}°C, Current ${stressData.current.toFixed(3)}A`);

    // Check if shutdown occurred
    const status = tegSystem.getSystemStatus();
    const zone = status.zones.find((z: any) => z.zoneId === 'frontLeftMotor');
    
    if (zone?.shutdownActive) {
      console.log(`\n🛑 SHUTDOWN TRIGGERED at ${temperature}°C`);
      console.log(`   Shutdown reason: Thermal protection activated`);
      console.log(`   Total alerts generated: ${alerts.length}`);
      
      clearInterval(stressInterval);
      
      // Start recovery simulation
      setTimeout(() => {
        simulateRecovery(tegSystem, temperature);
      }, 2000);
      
      return;
    }

    // Safety limit to prevent infinite loop
    if (temperature > 150) {
      console.log('\n❌ Maximum test temperature reached without shutdown - Check system configuration');
      clearInterval(stressInterval);
    }
  }, 1000);
}

/**
 * Simulate thermal recovery after shutdown
 */
function simulateRecovery(tegSystem: any, startTemp: number): void {
  console.log('\n❄️ Simulating thermal recovery...\n');

  let temperature = startTemp;
  let step = 0;

  const recoveryInterval = setInterval(() => {
    step++;
    temperature -= 8; // Cooling down

    const recoveryData = createTestTEGData({
      sensorId: 'stress_test_sensor',
      current: calculateTEGCurrent(Math.max(temperature, 25)),
      temperature: Math.max(temperature, 25),
      location: { zone: 'frontLeftMotor', position: { x: 1.2, y: 0.8, z: 0.3 }, priority: 'critical' }
    });

    tegSystem.updateSensorData(recoveryData);

    console.log(`Recovery ${step}: Temperature ${Math.max(temperature, 25)}°C, Current ${recoveryData.current.toFixed(3)}A`);

    // Check if zone reactivated
    const status = tegSystem.getSystemStatus();
    const zone = status.zones.find((z: any) => z.zoneId === 'frontLeftMotor');
    
    if (!zone?.shutdownActive && zone?.status === 'normal') {
      console.log(`\n✅ SYSTEM REACTIVATED at ${Math.max(temperature, 25)}°C`);
      console.log(`   Recovery completed successfully`);
      console.log(`   System ready for normal operation`);
      
      clearInterval(recoveryInterval);
      tegSystem.stopMonitoring();
      console.log('\n🏁 Thermal stress test completed\n');
      return;
    }

    // Stop when we reach ambient temperature
    if (temperature <= 25) {
      console.log('\n⏰ Cooldown period in progress...');
      console.log('   Waiting for system reactivation...');
      
      // Continue monitoring for reactivation
      setTimeout(() => {
        const finalStatus = tegSystem.getSystemStatus();
        const finalZone = finalStatus.zones.find((z: any) => z.zoneId === 'frontLeftMotor');
        
        if (!finalZone?.shutdownActive) {
          console.log('✅ System reactivated after cooldown period');
        } else {
          console.log('⏳ System still in cooldown - extended recovery time required');
        }
        
        clearInterval(recoveryInterval);
        tegSystem.stopMonitoring();
        console.log('\n🏁 Thermal stress test completed\n');
      }, 5000);
    }
  }, 1000);
}

// Export functions for use in other modules
export {
  calculateTEGCurrent,
  displayFinalStatistics,
  getZoneStatusIcon
};

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('🚀 Starting TEG Integration Examples\n');
  
  // Run complete integration example
  completeSystemIntegration();
  
  // Run stress test after main example
  setTimeout(() => {
    thermalStressTest();
  }, 25000);
}