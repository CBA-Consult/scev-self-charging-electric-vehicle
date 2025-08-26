/**
 * Comprehensive Wind Farm Layout Optimization Example
 * 
 * This example demonstrates the complete wind farm optimization process
 * including wind analysis, terrain assessment, layout optimization,
 * environmental impact assessment, and economic analysis.
 */

import { WindFarmOptimizer } from '../WindFarmOptimizer';
import {
  WindFarmSite,
  WindTurbineSpecification,
  WindResourceData,
  TerrainData,
  LandUseType,
  LayoutType
} from '../types/WindFarmTypes';

import {
  WindFarmOptimizationParameters,
  WindFarmOptimizationObjectives,
  OptimizationSettings
} from '../types/OptimizationTypes';

export class ComprehensiveWindFarmOptimizationExample {
  
  public async runOptimizationStudy(): Promise<void> {
    console.log('='.repeat(80));
    console.log('COMPREHENSIVE WIND FARM LAYOUT OPTIMIZATION STUDY');
    console.log('='.repeat(80));
    
    try {
      // Step 1: Define site characteristics
      console.log('\n1. Defining site characteristics...');
      const site = this.createExampleSite();
      
      // Step 2: Define turbine specifications
      console.log('2. Defining turbine specifications...');
      const turbineSpecs = this.createTurbineSpecifications();
      
      // Step 3: Set optimization parameters
      console.log('3. Setting optimization parameters...');
      const parameters = this.createOptimizationParameters();
      const objectives = this.createOptimizationObjectives();
      const settings = this.createOptimizationSettings();
      
      // Step 4: Initialize optimizer
      console.log('4. Initializing wind farm optimizer...');
      const optimizer = new WindFarmOptimizer();
      
      // Step 5: Run comprehensive optimization
      console.log('5. Running comprehensive optimization...');
      const optimizationResult = await optimizer.optimizeWindFarmLayout(
        site,
        turbineSpecs,
        parameters,
        objectives,
        settings
      );
      
      // Step 6: Display results
      console.log('6. Displaying optimization results...');
      this.displayOptimizationResults(optimizationResult);
      
      // Step 7: Generate innovative layouts for comparison
      console.log('7. Generating innovative layout designs...');
      const innovativeLayouts = await optimizer.generateInnovativeLayouts(
        site,
        turbineSpecs,
        parameters,
        ['biomimetic', 'fractal', 'wind_aligned', 'terrain_following', 'cluster_based']
      );
      
      this.displayInnovativeLayoutComparison(innovativeLayouts);
      
      // Step 8: Perform multi-objective optimization
      console.log('8. Performing multi-objective optimization...');
      const multiObjectiveResult = await optimizer.multiObjectiveOptimization(
        site,
        turbineSpecs,
        parameters,
        objectives,
        settings
      );
      
      this.displayMultiObjectiveResults(multiObjectiveResult);
      
      // Step 9: Sensitivity analysis
      console.log('9. Performing sensitivity analysis...');
      const sensitivityResults = await optimizer.sensitivityAnalysis(
        optimizationResult.optimalLayout,
        site,
        parameters,
        objectives,
        10 // 10% variation
      );
      
      this.displaySensitivityResults(sensitivityResults);
      
      // Step 10: Uncertainty analysis
      console.log('10. Performing uncertainty analysis...');
      const uncertaintyRanges = {
        'site.turbineSpacing': 0.15,
        'turbine.hubHeight': 0.1,
        'environmental.noiseLimit': 0.05,
        'economic.electricityPrice': 0.2
      };
      
      const uncertaintyResult = await optimizer.uncertaintyAnalysis(
        optimizationResult.optimalLayout,
        site,
        parameters,
        objectives,
        uncertaintyRanges,
        500 // 500 Monte Carlo simulations
      );
      
      this.displayUncertaintyResults(uncertaintyResult);
      
      console.log('\n' + '='.repeat(80));
      console.log('WIND FARM OPTIMIZATION STUDY COMPLETED SUCCESSFULLY');
      console.log('='.repeat(80));
      
    } catch (error) {
      console.error('Error in wind farm optimization study:', error);
      throw error;
    }
  }
  
  private createExampleSite(): WindFarmSite {
    // Create wind resource data
    const windResource: WindResourceData = {
      meanWindSpeed: 8.5, // m/s at 80m height
      referenceHeight: 80,
      windShearExponent: 0.14,
      turbulenceIntensity: 0.12,
      airDensity: 1.225,
      windRose: [
        { direction: 0, frequency: 8, meanSpeed: 7.2, weibullA: 8.1, weibullK: 2.1 },
        { direction: 30, frequency: 12, meanSpeed: 8.1, weibullA: 9.1, weibullK: 2.2 },
        { direction: 60, frequency: 15, meanSpeed: 9.2, weibullA: 10.3, weibullK: 2.3 },
        { direction: 90, frequency: 18, meanSpeed: 8.8, weibullA: 9.9, weibullK: 2.1 },
        { direction: 120, frequency: 14, meanSpeed: 7.9, weibullA: 8.9, weibullK: 2.0 },
        { direction: 150, frequency: 10, meanSpeed: 7.1, weibullA: 8.0, weibullK: 1.9 },
        { direction: 180, frequency: 8, meanSpeed: 6.8, weibullA: 7.6, weibullK: 1.8 },
        { direction: 210, frequency: 6, meanSpeed: 6.5, weibullA: 7.3, weibullK: 1.8 },
        { direction: 240, frequency: 4, meanSpeed: 6.2, weibullA: 7.0, weibullK: 1.7 },
        { direction: 270, frequency: 3, meanSpeed: 6.0, weibullA: 6.8, weibullK: 1.7 },
        { direction: 300, frequency: 2, meanSpeed: 6.1, weibullA: 6.9, weibullK: 1.8 }
      ],
      seasonalVariation: [
        { season: 'spring', meanWindSpeed: 8.8, dominantDirection: 60, turbulenceIntensity: 0.11 },
        { season: 'summer', meanWindSpeed: 7.9, dominantDirection: 90, turbulenceIntensity: 0.10 },
        { season: 'autumn', meanWindSpeed: 9.1, dominantDirection: 45, turbulenceIntensity: 0.13 },
        { season: 'winter', meanWindSpeed: 8.7, dominantDirection: 30, turbulenceIntensity: 0.14 }
      ],
      extremeWindEvents: [
        { type: 'thunderstorm', probability: 0.05, maxWindSpeed: 35, duration: 2 },
        { type: 'ice_storm', probability: 0.02, maxWindSpeed: 25, duration: 8 }
      ]
    };
    
    // Create terrain data
    const gridSize = 50;
    const elevationGrid: number[][] = [];
    const roughnessMap: number[][] = [];
    const slopeMap: number[][] = [];
    const aspectMap: number[][] = [];
    const landUseMap: LandUseType[][] = [];
    
    for (let i = 0; i < gridSize; i++) {
      elevationGrid[i] = [];
      roughnessMap[i] = [];
      slopeMap[i] = [];
      aspectMap[i] = [];
      landUseMap[i] = [];
      
      for (let j = 0; j < gridSize; j++) {
        // Generate realistic terrain with some hills
        const x = (j / gridSize) * 5000;
        const y = (i / gridSize) * 5000;
        const elevation = 100 + 50 * Math.sin(x / 1000) * Math.cos(y / 1000) + 
                         20 * Math.sin(x / 500) + 15 * Math.cos(y / 300);
        
        elevationGrid[i][j] = Math.max(50, elevation);
        roughnessMap[i][j] = 0.1 + Math.random() * 0.05; // Agricultural/grassland
        slopeMap[i][j] = Math.random() * 15; // 0-15 degree slopes
        aspectMap[i][j] = Math.random() * 360;
        
        // Mostly agricultural land with some restrictions
        const landUse: LandUseType = {
          type: Math.random() > 0.8 ? 'forest' : 'agricultural',
          restrictionLevel: Math.random() > 0.9 ? 'restricted' : 'allowed',
          environmentalSensitivity: Math.random() * 0.3
        };
        landUseMap[i][j] = landUse;
      }
    }
    
    const terrain: TerrainData = {
      elevationGrid,
      gridResolution: 100, // 100m per grid cell
      roughnessMap,
      slopeMap,
      aspectMap,
      landUseMap
    };
    
    return {
      id: 'example-site-001',
      name: 'Example Wind Farm Site',
      boundaries: [
        { latitude: 40.0, longitude: -100.0 },
        { latitude: 40.05, longitude: -100.0 },
        { latitude: 40.05, longitude: -99.95 },
        { latitude: 40.0, longitude: -99.95 }
      ],
      terrain,
      windResource,
      environmentalConstraints: [
        {
          type: 'bird_migration',
          geometry: { type: 'circle', coordinates: [[2500, 2500]], radius: 500 },
          severity: 'medium',
          seasonalRestrictions: [
            { startMonth: 3, endMonth: 5, restrictionType: 'reduced_operation' },
            { startMonth: 9, endMonth: 11, restrictionType: 'reduced_operation' }
          ]
        }
      ],
      gridConnection: {
        latitude: 40.025,
        longitude: -99.975,
        voltage: 138,
        capacity: 200,
        connectionCost: 500,
        transmissionDistance: 15
      },
      accessRoads: [
        {
          waypoints: [
            { latitude: 40.0, longitude: -100.0 },
            { latitude: 40.025, longitude: -99.975 }
          ],
          width: 6,
          constructionCost: 100000,
          maintenanceCost: 5000
        }
      ]
    };
  }
  
  private createTurbineSpecifications(): WindTurbineSpecification[] {
    return [
      {
        id: 'turbine-spec-001',
        model: 'Advanced Wind Turbine 2.5MW',
        ratedPower: 2.5,
        rotorDiameter: 120,
        hubHeight: 90,
        cutInSpeed: 3.0,
        cutOutSpeed: 25.0,
        ratedWindSpeed: 12.0,
        powerCurve: [
          { windSpeed: 3, power: 0.05 },
          { windSpeed: 4, power: 0.15 },
          { windSpeed: 5, power: 0.35 },
          { windSpeed: 6, power: 0.65 },
          { windSpeed: 7, power: 1.05 },
          { windSpeed: 8, power: 1.55 },
          { windSpeed: 9, power: 2.05 },
          { windSpeed: 10, power: 2.35 },
          { windSpeed: 11, power: 2.45 },
          { windSpeed: 12, power: 2.5 },
          { windSpeed: 13, power: 2.5 },
          { windSpeed: 14, power: 2.5 },
          { windSpeed: 15, power: 2.5 }
        ],
        thrustCurve: [
          { windSpeed: 3, thrustCoefficient: 0.8 },
          { windSpeed: 6, thrustCoefficient: 0.85 },
          { windSpeed: 9, thrustCoefficient: 0.75 },
          { windSpeed: 12, thrustCoefficient: 0.45 },
          { windSpeed: 15, thrustCoefficient: 0.25 }
        ],
        cost: 3000000,
        maintenanceCost: 75000,
        lifespan: 25
      }
    ];
  }
  
  private createOptimizationParameters(): WindFarmOptimizationParameters {
    return {
      site: {
        area: { min: 1000, max: 2500, current: 2000 },
        turbineSpacing: { min: 3, max: 8, current: 5 },
        rowSpacing: { min: 5, max: 12, current: 8 }
      },
      turbine: {
        hubHeight: { min: 80, max: 120, current: 90 },
        rotorDiameter: { min: 100, max: 140, current: 120 },
        ratedPower: { min: 2.0, max: 3.5, current: 2.5 },
        turbineCount: { min: 30, max: 80, current: 50 }
      },
      layout: {
        gridAngle: { min: 0, max: 90, current: 45 },
        clusterSize: { min: 5, max: 15, current: 8 },
        asymmetryFactor: { min: 0, max: 1, current: 0.2 }
      },
      environmental: {
        noiseLimit: { min: 35, max: 50, current: 45 },
        setbackDistance: { min: 300, max: 1000, current: 500 },
        wildlifeBuffer: { min: 200, max: 800, current: 400 }
      },
      economic: {
        discountRate: { min: 0.06, max: 0.12, current: 0.08 },
        electricityPrice: { min: 40, max: 80, current: 55 },
        carbonPrice: { min: 0, max: 50, current: 25 }
      }
    };
  }
  
  private createOptimizationObjectives(): WindFarmOptimizationObjectives {
    return {
      maximizeEnergyProduction: { weight: 0.3, target: 300000 },
      maximizeCapacityFactor: { weight: 0.2, target: 35 },
      minimizeWakeLoss: { weight: 0.15, target: 8 },
      maximizeNPV: { weight: 0.2, target: 50000000 },
      minimizeLCOE: { weight: 0.1, target: 50 },
      maximizeROI: { weight: 0.05, target: 12 },
      minimizeNoiseImpact: { weight: 0.1, maxNoiseLevel: 45 },
      minimizeVisualImpact: { weight: 0.05, maxVisibilityIndex: 0.4 },
      minimizeWildlifeImpact: { weight: 0.08, maxCollisionRisk: 5 },
      minimizeCarbonFootprint: { weight: 0.02, maxPaybackTime: 2 },
      maxTurbines: 80,
      minTurbineSpacing: 3,
      maxNoiseLevel: 45,
      maxVisualImpact: 0.5,
      minSetbackDistance: 300
    };
  }
  
  private createOptimizationSettings(): OptimizationSettings {
    return {
      algorithm: 'hybrid',
      populationSize: 50,
      maxGenerations: 100,
      crossoverRate: 0.8,
      mutationRate: 0.1,
      elitismRate: 0.1,
      convergenceThreshold: 0.001,
      parallelEvaluation: false
    };
  }
  
  private displayOptimizationResults(result: any): void {
    console.log('\n' + '-'.repeat(60));
    console.log('OPTIMIZATION RESULTS');
    console.log('-'.repeat(60));
    
    console.log(`Optimization Method: ${result.optimizationMethod}`);
    console.log(`Computation Time: ${(result.computationTime / 1000).toFixed(2)} seconds`);
    console.log(`Iterations: ${result.iterations}`);
    console.log(`Objective Value: ${result.objectiveValue.toFixed(4)}`);
    
    console.log('\nOptimal Layout Performance:');
    console.log(`- Number of Turbines: ${result.optimalLayout.turbines.length}`);
    console.log(`- Total Capacity: ${result.optimalLayout.totalCapacity.toFixed(1)} MW`);
    console.log(`- Annual Energy Production: ${(result.performance.energyProduction / 1000).toFixed(0)} GWh`);
    console.log(`- Capacity Factor: ${result.performance.capacityFactor.toFixed(1)}%`);
    console.log(`- Wake Loss: ${result.performance.wakeLoss.toFixed(1)}%`);
    console.log(`- Economic Value (NPV): $${(result.performance.economicValue / 1000000).toFixed(1)}M`);
    console.log(`- LCOE: $${result.performance.levelizedCost.toFixed(1)}/MWh`);
    console.log(`- Environmental Score: ${result.performance.environmentalScore.toFixed(1)}/100`);
    console.log(`- Feasibility Score: ${result.performance.feasibilityScore.toFixed(1)}/100`);
    
    if (result.constraintViolations.length > 0) {
      console.log('\nConstraint Violations:');
      result.constraintViolations.forEach((violation: any) => {
        console.log(`- ${violation.type}: ${violation.value.toFixed(2)} (limit: ${violation.limit})`);
      });
    } else {
      console.log('\n✓ All constraints satisfied');
    }
  }
  
  private displayInnovativeLayoutComparison(layouts: any[]): void {
    console.log('\n' + '-'.repeat(60));
    console.log('INNOVATIVE LAYOUT COMPARISON');
    console.log('-'.repeat(60));
    
    layouts.forEach((layout, index) => {
      console.log(`\n${index + 1}. ${layout.name} (${layout.layoutType})`);
      console.log(`   Turbines: ${layout.turbines.length}`);
      console.log(`   Capacity: ${layout.totalCapacity.toFixed(1)} MW`);
      console.log(`   Energy: ${(layout.energyProduction.annualEnergyProduction / 1000).toFixed(0)} GWh/year`);
      console.log(`   Capacity Factor: ${layout.energyProduction.capacityFactor.toFixed(1)}%`);
      console.log(`   Wake Loss: ${layout.energyProduction.wakeEffectLoss.toFixed(1)}%`);
      console.log(`   LCOE: $${layout.economicMetrics.levelizedCostOfEnergy.toFixed(1)}/MWh`);
      console.log(`   Environmental Impact: ${layout.environmentalImpact.overallImpactScore.toFixed(1)}/100`);
    });
  }
  
  private displayMultiObjectiveResults(result: any): void {
    console.log('\n' + '-'.repeat(60));
    console.log('MULTI-OBJECTIVE OPTIMIZATION RESULTS');
    console.log('-'.repeat(60));
    
    console.log(`Pareto Front Solutions: ${result.paretoFront.length}`);
    console.log(`Hypervolume: ${result.hypervolume.toFixed(4)}`);
    console.log(`Spacing: ${result.spacing.toFixed(4)}`);
    console.log(`Convergence: ${result.convergence.toFixed(4)}`);
    console.log(`Diversity Metric: ${result.diversityMetric.toFixed(4)}`);
    
    console.log('\nTop 3 Pareto Solutions:');
    result.paretoFront.slice(0, 3).forEach((layout: any, index: number) => {
      console.log(`\n${index + 1}. Solution ${layout.id}`);
      console.log(`   Energy: ${(layout.energyProduction.annualEnergyProduction / 1000).toFixed(0)} GWh`);
      console.log(`   NPV: $${(layout.economicMetrics.netPresentValue / 1000000).toFixed(1)}M`);
      console.log(`   Environmental: ${layout.environmentalImpact.overallImpactScore.toFixed(1)}/100`);
    });
  }
  
  private displaySensitivityResults(results: any[]): void {
    console.log('\n' + '-'.repeat(60));
    console.log('SENSITIVITY ANALYSIS RESULTS');
    console.log('-'.repeat(60));
    
    results.forEach(result => {
      console.log(`\n${result.parameter}:`);
      console.log(`  Base Value: ${result.baseValue.toFixed(3)}`);
      console.log(`  Sensitivity: ${result.sensitivity.toFixed(6)}`);
      console.log(`  Elasticity: ${result.elasticity.toFixed(3)}`);
      console.log(`  Impact Range: ${result.variations.length} scenarios tested`);
    });
    
    // Sort by absolute sensitivity
    const sortedResults = results.sort((a, b) => Math.abs(b.sensitivity) - Math.abs(a.sensitivity));
    console.log('\nMost Sensitive Parameters:');
    sortedResults.slice(0, 3).forEach((result, index) => {
      console.log(`${index + 1}. ${result.parameter} (sensitivity: ${Math.abs(result.sensitivity).toFixed(6)})`);
    });
  }
  
  private displayUncertaintyResults(result: any): void {
    console.log('\n' + '-'.repeat(60));
    console.log('UNCERTAINTY ANALYSIS RESULTS');
    console.log('-'.repeat(60));
    
    console.log(`Mean Objective: ${result.meanObjective.toFixed(4)}`);
    console.log(`Standard Deviation: ${result.standardDeviation.toFixed(4)}`);
    console.log(`95% Confidence Interval: [${result.confidenceInterval[0].toFixed(4)}, ${result.confidenceInterval[1].toFixed(4)}]`);
    
    console.log('\nRisk Metrics:');
    console.log(`  Value at Risk (5%): ${result.riskMetrics.valueAtRisk.toFixed(4)}`);
    console.log(`  Conditional VaR: ${result.riskMetrics.conditionalValueAtRisk.toFixed(4)}`);
    console.log(`  Probability of Loss: ${(result.riskMetrics.probabilityOfLoss * 100).toFixed(1)}%`);
    console.log(`  Worst Case: ${result.riskMetrics.worstCaseScenario.toFixed(4)}`);
    console.log(`  Best Case: ${result.riskMetrics.bestCaseScenario.toFixed(4)}`);
    
    console.log('\nRobust Layout:');
    console.log(`  Turbines: ${result.robustLayout.turbines.length}`);
    console.log(`  Capacity: ${result.robustLayout.totalCapacity.toFixed(1)} MW`);
    console.log(`  Expected Performance: Stable across uncertainty scenarios`);
  }
}

// Example usage
export async function runWindFarmOptimizationExample(): Promise<void> {
  const example = new ComprehensiveWindFarmOptimizationExample();
  await example.runOptimizationStudy();
}

// Run the example if this file is executed directly
if (require.main === module) {
  runWindFarmOptimizationExample()
    .then(() => {
      console.log('\nExample completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Example failed:', error);
      process.exit(1);
    });
}