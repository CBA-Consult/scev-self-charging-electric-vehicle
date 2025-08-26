/**
 * Basic TEG Impact Study Example
 * 
 * Demonstrates how to use the TEG Impact Study module to analyze the impact
 * of Thermoelectric Generators on vehicle efficiency, fuel consumption,
 * and emissions reduction.
 */

import {
  TEGImpactStudy,
  VehicleConfiguration,
  TEGConfiguration,
  ComprehensiveAnalysisConfig,
  AdvancedAnalysisConfig,
  RealWorldDataCollectionConfig,
  ThermoelectricMaterial,
  TEGModule
} from '../index';

/**
 * Example: Basic TEG Impact Study
 */
export async function basicTEGImpactStudyExample(): Promise<void> {
  console.log('=== Basic TEG Impact Study Example ===\n');

  // Configure vehicle parameters
  const vehicleConfig: VehicleConfiguration = {
    vehicleType: 'passenger_car',
    engineType: 'internal_combustion',
    engineSpecifications: {
      displacement: 2.0, // liters
      power: 150000, // watts (150 kW)
      torque: 300, // N·m
      fuelType: 'gasoline',
      compressionRatio: 10.5,
      numberOfCylinders: 4
    },
    vehicleSpecifications: {
      mass: 1500, // kg
      length: 4.5, // m
      width: 1.8, // m
      height: 1.5, // m
      wheelbase: 2.7, // m
      groundClearance: 0.15 // m
    },
    aerodynamics: {
      dragCoefficient: 0.28,
      frontalArea: 2.3, // m²
      liftCoefficient: 0.1
    },
    drivetrain: {
      transmission: 'automatic',
      driveType: 'fwd',
      gearRatios: [3.5, 2.0, 1.3, 1.0, 0.8],
      finalDriveRatio: 4.1
    },
    thermalSystems: {
      coolingSystem: {
        coolantCapacity: 8, // liters
        radiatorArea: 1.2, // m²
        fanPower: 500, // watts
        thermostatTemperature: 90 // °C
      },
      exhaustSystem: {
        manifoldMaterial: 'cast_iron',
        pipeLength: 3.0, // m
        pipeDiameter: 0.06, // m
        catalyticConverter: true,
        mufflerType: 'chambered'
      }
    },
    electricalSystem: {
      batteryCapacity: 70, // Ah
      systemVoltage: 12, // V
      alternatorPower: 1500, // watts
      electricalLoad: 800 // watts
    }
  };

  // Configure TEG system
  const tegConfig: TEGConfiguration = {
    modules: [
      {
        id: 'exhaust_manifold_teg',
        location: 'exhaust_manifold',
        material: {
          name: 'Bi2Te3',
          type: 'p-type',
          seebeckCoefficient: 200e-6, // V/K
          electricalConductivity: 100000, // S/m
          thermalConductivity: 1.5, // W/m·K
          figureOfMerit: 1.0, // ZT value
          operatingTemperatureRange: { min: -40, max: 200 },
          density: 7700, // kg/m³
          specificHeat: 154, // J/kg·K
          thermalExpansion: 18e-6, // 1/K
          cost: 50 // $/kg
        },
        dimensions: {
          length: 0.1, // m
          width: 0.1, // m
          thickness: 0.003 // m
        },
        moduleCount: 4,
        electricalConfiguration: 'series',
        thermalInterface: {
          hotSide: {
            material: 'thermal_paste',
            thickness: 0.0001, // m
            thermalConductivity: 5.0, // W/m·K
            thermalResistance: 0.00002 // K·m²/W
          },
          coldSide: {
            material: 'thermal_paste',
            thickness: 0.0001, // m
            thermalConductivity: 5.0, // W/m·K
            thermalResistance: 0.00002 // K·m²/W
          }
        },
        powerElectronics: {
          dcDcConverter: true,
          mpptController: true,
          efficiency: 0.95
        }
      },
      {
        id: 'exhaust_pipe_teg',
        location: 'exhaust_pipe',
        material: {
          name: 'PbTe',
          type: 'n-type',
          seebeckCoefficient: -180e-6, // V/K
          electricalConductivity: 80000, // S/m
          thermalConductivity: 2.0, // W/m·K
          figureOfMerit: 0.8, // ZT value
          operatingTemperatureRange: { min: 0, max: 400 },
          density: 8200, // kg/m³
          specificHeat: 147, // J/kg·K
          thermalExpansion: 20e-6, // 1/K
          cost: 75 // $/kg
        },
        dimensions: {
          length: 0.2, // m
          width: 0.05, // m
          thickness: 0.002 // m
        },
        moduleCount: 8,
        electricalConfiguration: 'series-parallel',
        thermalInterface: {
          hotSide: {
            material: 'thermal_paste',
            thickness: 0.0001, // m
            thermalConductivity: 5.0, // W/m·K
            thermalResistance: 0.00002 // K·m²/W
          },
          coldSide: {
            material: 'thermal_paste',
            thickness: 0.0001, // m
            thermalConductivity: 5.0, // W/m·K
            thermalResistance: 0.00002 // K·m²/W
          }
        },
        powerElectronics: {
          dcDcConverter: true,
          mpptController: true,
          efficiency: 0.93
        }
      }
    ],
    thermalManagement: {
      coolantIntegration: true,
      heatSinkDesign: 'finned_aluminum',
      thermalInterface: {
        material: 'thermal_paste',
        thickness: 0.0001, // m
        thermalConductivity: 5.0, // W/m·K
        thermalResistance: 0.00002 // K·m²/W
      },
      temperatureControl: true
    },
    electricalSystem: {
      systemVoltage: 12, // V
      powerConditioning: {
        dcDcConverter: true,
        mpptController: true,
        batteryCharging: true,
        gridTie: false
      },
      protectionSystems: {
        overvoltageProtection: true,
        overcurrentProtection: true,
        thermalProtection: true,
        shortCircuitProtection: true
      }
    },
    controlSystem: {
      temperatureMonitoring: true,
      powerOptimization: true,
      faultDetection: true,
      remoteMonitoring: true
    },
    installation: {
      mountingMethod: 'bolted',
      vibrationIsolation: true,
      weatherProtection: true,
      maintenanceAccess: true
    }
  };

  // Initialize TEG Impact Study
  const tegStudy = new TEGImpactStudy(vehicleConfig, tegConfig);

  // Configure comprehensive analysis
  const analysisConfig: ComprehensiveAnalysisConfig = {
    testDuration: 3600, // 1 hour
    drivingCycles: ['NEDC', 'WLTP', 'EPA_FTP75'],
    ambientConditions: {
      temperature: 25, // °C
      humidity: 50, // %
      pressure: 101325 // Pa
    },
    vehicleLoading: {
      empty: true,
      halfLoad: true,
      fullLoad: true
    },
    auxiliaryLoads: {
      airConditioning: true,
      heating: false,
      lighting: true,
      infotainment: true
    },
    dataCollection: {
      highFrequencyLogging: true,
      realTimeAnalysis: true,
      cloudSync: true
    }
  };

  try {
    console.log('Starting comprehensive TEG impact analysis...');
    
    // Run comprehensive analysis
    const results = await tegStudy.runComprehensiveAnalysis(analysisConfig);

    // Display results
    console.log('\n=== Analysis Results ===');
    console.log(`Test Duration: ${results.summary.testDuration.toFixed(2)} hours`);
    console.log(`Total Distance: ${results.summary.totalDistance.toFixed(1)} km`);
    console.log(`Average Speed: ${results.summary.averageSpeed.toFixed(1)} km/h`);

    console.log('\n=== TEG Performance ===');
    console.log(`Average Power Generation: ${results.tegPerformance.powerGeneration.average.toFixed(1)} W`);
    console.log(`Peak Power Generation: ${results.tegPerformance.powerGeneration.peak.toFixed(1)} W`);
    console.log(`Total Energy Generated: ${results.tegPerformance.powerGeneration.total.toFixed(2)} Wh`);
    console.log(`Thermoelectric Efficiency: ${results.tegPerformance.efficiency.thermoelectric.toFixed(2)}%`);
    console.log(`System Efficiency: ${results.tegPerformance.efficiency.system.toFixed(2)}%`);

    console.log('\n=== Fuel Consumption Analysis ===');
    console.log(`Baseline Consumption: ${results.fuelConsumptionAnalysis.baselineConsumption.toFixed(2)} L/100km`);
    console.log(`TEG Consumption: ${results.fuelConsumptionAnalysis.tegConsumption.toFixed(2)} L/100km`);
    console.log(`Improvement: ${results.fuelConsumptionAnalysis.improvement.toFixed(2)}%`);
    console.log(`Annual Savings: ${results.fuelConsumptionAnalysis.annualSavings.toFixed(1)} L/year`);
    console.log(`Cost Savings: $${results.fuelConsumptionAnalysis.costSavings.toFixed(0)}/year`);

    console.log('\n=== Emissions Analysis ===');
    console.log(`CO2 Reduction: ${results.emissionsAnalysis.reductionPercentage.CO2.toFixed(2)}%`);
    console.log(`NOx Reduction: ${results.emissionsAnalysis.reductionPercentage.NOx.toFixed(2)}%`);
    console.log(`CO Reduction: ${results.emissionsAnalysis.reductionPercentage.CO.toFixed(2)}%`);
    console.log(`HC Reduction: ${results.emissionsAnalysis.reductionPercentage.HC.toFixed(2)}%`);
    console.log(`PM Reduction: ${results.emissionsAnalysis.reductionPercentage.PM.toFixed(2)}%`);
    console.log(`Environmental Benefit: ${results.emissionsAnalysis.environmentalBenefit.toFixed(1)} kg CO2 eq/year`);

    console.log('\n=== Energy Recovery Analysis ===');
    console.log(`Waste Heat Available: ${results.energyRecoveryAnalysis.wasteHeatAvailable.toFixed(1)} kW`);
    console.log(`Heat Recovered: ${results.energyRecoveryAnalysis.heatRecovered.toFixed(1)} kW`);
    console.log(`Electrical Energy Generated: ${results.energyRecoveryAnalysis.electricalEnergyGenerated.toFixed(2)} kWh`);
    console.log(`Recovery Efficiency: ${results.energyRecoveryAnalysis.recoveryEfficiency.toFixed(2)}%`);
    console.log(`Energy Independence Improvement: ${results.energyRecoveryAnalysis.energyIndependenceImprovement.toFixed(2)}%`);

    console.log('\n=== Economic Analysis ===');
    console.log(`Initial Investment: $${results.economicAnalysis.initialInvestment.toFixed(0)}`);
    console.log(`Operational Savings: $${results.economicAnalysis.operationalSavings.toFixed(0)}/year`);
    console.log(`Maintenance Costs: $${results.economicAnalysis.maintenanceCosts.toFixed(0)}/year`);
    console.log(`Payback Period: ${results.economicAnalysis.paybackPeriod.toFixed(1)} years`);
    console.log(`Net Present Value: $${results.economicAnalysis.netPresentValue.toFixed(0)}`);
    console.log(`Return on Investment: ${results.economicAnalysis.returnOnInvestment.toFixed(1)}%`);

    console.log('\n=== Areas for Improvement ===');
    console.log('Material Optimization:');
    results.areasForImprovement.materialOptimization.forEach(item => 
      console.log(`  - ${item}`)
    );
    console.log('System Integration:');
    results.areasForImprovement.systemIntegration.forEach(item => 
      console.log(`  - ${item}`)
    );
    console.log('Control Strategy:');
    results.areasForImprovement.controlStrategy.forEach(item => 
      console.log(`  - ${item}`)
    );
    console.log('Thermal Management:');
    results.areasForImprovement.thermalManagement.forEach(item => 
      console.log(`  - ${item}`)
    );

    // Generate optimization recommendations
    console.log('\n=== Optimization Recommendations ===');
    const optimizationRecommendations = await tegStudy.generateOptimizationRecommendations(results);
    
    console.log('TEG Configuration Recommendations:');
    optimizationRecommendations.tegConfiguration.materialSelection.forEach(rec => 
      console.log(`  - ${rec.material.name}: ${rec.reason} (Expected improvement: ${rec.expectedImprovement}%)`)
    );

    console.log('Vehicle Integration Recommendations:');
    optimizationRecommendations.vehicleIntegration.installationLocation.forEach(rec => 
      console.log(`  - ${rec.location}: ${rec.reason} (Expected power: ${rec.expectedPower}W)`)
    );

    console.log('\n=== Cost-Benefit Analysis ===');
    console.log(`Initial Investment: $${optimizationRecommendations.costBenefit.initialInvestment.toFixed(0)}`);
    console.log(`Operational Savings: $${optimizationRecommendations.costBenefit.operationalSavings.toFixed(0)}/year`);
    console.log(`Payback Period: ${optimizationRecommendations.costBenefit.paybackPeriod.toFixed(1)} years`);
    console.log(`Net Present Value: $${optimizationRecommendations.costBenefit.netPresentValue.toFixed(0)}`);
    console.log(`Return on Investment: ${optimizationRecommendations.costBenefit.returnOnInvestment.toFixed(1)}%`);

  } catch (error) {
    console.error('Error during TEG impact analysis:', error);
  } finally {
    // Stop the study
    await tegStudy.stop();
  }

  console.log('\n=== Basic TEG Impact Study Example Completed ===\n');
}

/**
 * Example: Advanced TEG Impact Study
 */
export async function advancedTEGImpactStudyExample(): Promise<void> {
  console.log('=== Advanced TEG Impact Study Example ===\n');

  // Use default configurations for simplicity
  const tegStudy = new TEGImpactStudy();

  // Configure advanced analysis
  const advancedConfig: AdvancedAnalysisConfig = {
    fuelConsumptionAnalysis: {
      baselineTestDuration: 7200, // 2 hours baseline
      tegTestDuration: 7200, // 2 hours with TEG
      drivingPatterns: ['city', 'highway', 'mixed', 'aggressive'],
      loadConditions: ['empty', 'half_load', 'full_load'],
      weatherConditions: ['hot', 'cold', 'humid', 'dry']
    },
    emissionsAnalysis: {
      measurementStandard: 'Euro_6',
      pollutants: ['CO2', 'NOx', 'CO', 'HC', 'PM'],
      testCycles: ['NEDC', 'WLTP', 'RDE_Urban'],
      realWorldTesting: true
    },
    energyRecoveryAnalysis: {
      heatSourceMapping: true,
      temperatureGradientAnalysis: true,
      powerGenerationOptimization: true,
      systemEfficiencyAnalysis: true
    },
    performanceOptimization: {
      materialSelection: true,
      moduleConfiguration: true,
      thermalManagement: true,
      electricalSystem: true,
      controlStrategy: true
    }
  };

  try {
    console.log('Starting advanced TEG impact analysis...');
    
    // Run advanced analysis
    const results = await tegStudy.runAdvancedAnalysis(advancedConfig);

    console.log('\n=== Advanced Analysis Results ===');
    console.log('Analysis completed with enhanced features:');
    console.log('- Heat source mapping');
    console.log('- Temperature gradient analysis');
    console.log('- Power generation optimization');
    console.log('- Material selection optimization');
    console.log('- Real-world testing validation');

    // Display key metrics
    console.log(`\nOverall System Efficiency: ${results.tegPerformance.efficiency.system.toFixed(2)}%`);
    console.log(`Fuel Consumption Improvement: ${results.fuelConsumptionAnalysis.improvement.toFixed(2)}%`);
    console.log(`CO2 Emissions Reduction: ${results.emissionsAnalysis.reductionPercentage.CO2.toFixed(2)}%`);
    console.log(`Energy Recovery Efficiency: ${results.energyRecoveryAnalysis.recoveryEfficiency.toFixed(2)}%`);

  } catch (error) {
    console.error('Error during advanced TEG impact analysis:', error);
  } finally {
    await tegStudy.stop();
  }

  console.log('\n=== Advanced TEG Impact Study Example Completed ===\n');
}

/**
 * Example: Real-world Data Collection
 */
export async function realWorldDataCollectionExample(): Promise<void> {
  console.log('=== Real-world Data Collection Example ===\n');

  const tegStudy = new TEGImpactStudy();

  // Configure real-world data collection
  const dataCollectionConfig: RealWorldDataCollectionConfig = {
    sensors: {
      temperatureSensors: 12, // Number of temperature measurement points
      powerSensors: 4, // Number of power measurement points
      fuelFlowSensor: true,
      emissionsSensors: ['CO2', 'NOx', 'PM'],
      vibrationSensors: 2,
      gpsTracking: true
    },
    dataLogging: {
      samplingRate: 10, // Hz
      dataRetention: 30, // days
      realTimeAnalysis: true,
      cloudSync: true,
      dataValidation: true
    },
    testConditions: {
      vehicleTypes: ['passenger_car', 'light_truck'],
      operatingConditions: ['urban', 'highway', 'stop_and_go'],
      weatherConditions: ['hot', 'cold', 'humid', 'dry'],
      durationPerCondition: 2 // hours
    },
    qualityAssurance: {
      calibrationInterval: 24, // hours
      dataValidationChecks: true,
      redundantMeasurements: true,
      errorDetection: true
    }
  };

  try {
    console.log('Starting real-world data collection...');
    
    // Start data collection
    const dataCollector = await tegStudy.startRealWorldDataCollection(dataCollectionConfig);

    // Simulate data collection for demonstration
    console.log('Data collection started successfully');
    console.log('Collecting real-world performance data...');

    // Monitor data collection (simplified for example)
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      // Generate performance report
      const report = await tegStudy.generatePerformanceReport();
      console.log(`Report ${i + 1}: TEG Power: ${report.tegPerformance?.powerGeneration?.instantaneous || 0}W, ` +
                 `Efficiency: ${report.vehicleEfficiency?.fuelConsumption?.improvement || 0}%`);
    }

    console.log('\nReal-world data collection completed');
    console.log('Data has been stored and synchronized to cloud storage');

  } catch (error) {
    console.error('Error during real-world data collection:', error);
  } finally {
    await tegStudy.stop();
  }

  console.log('\n=== Real-world Data Collection Example Completed ===\n');
}

/**
 * Run all examples
 */
export async function runAllTEGImpactStudyExamples(): Promise<void> {
  console.log('Running all TEG Impact Study examples...\n');

  try {
    await basicTEGImpactStudyExample();
    await advancedTEGImpactStudyExample();
    await realWorldDataCollectionExample();
    
    console.log('All TEG Impact Study examples completed successfully!');
  } catch (error) {
    console.error('Error running TEG Impact Study examples:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllTEGImpactStudyExamples().catch(console.error);
}