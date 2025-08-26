/**
 * Innovative Layout Designer
 * 
 * Creates innovative wind farm layout designs including biomimetic,
 * fractal, and other advanced layout patterns for enhanced efficiency.
 */

import {
  WindFarmSite,
  WindFarmLayout,
  TurbinePosition,
  WindTurbineSpecification,
  LayoutType
} from './types/WindFarmTypes';

import {
  WindFarmOptimizationParameters
} from './types/OptimizationTypes';

export interface LayoutDesignResult {
  layout: WindFarmLayout;
  designPrinciples: string[];
  expectedBenefits: string[];
  implementationChallenges: string[];
  performanceMetrics: LayoutPerformanceMetrics;
}

export interface LayoutPerformanceMetrics {
  energyDensity: number; // MWh/km²
  wakeEfficiency: number; // percentage
  landUseEfficiency: number; // percentage
  constructionComplexity: number; // 1-10 scale
  maintenanceAccessibility: number; // 1-10 scale
  visualImpactScore: number; // 1-10 scale
}

export class InnovativeLayoutDesigner {
  
  /**
   * Generate innovative layout based on specified type
   */
  public async generateLayout(
    site: WindFarmSite,
    turbineSpecs: WindTurbineSpecification[],
    parameters: WindFarmOptimizationParameters,
    layoutType: LayoutType
  ): Promise<WindFarmLayout> {
    console.log(`Generating ${layoutType} layout...`);
    
    switch (layoutType) {
      case 'grid_regular':
        return this.generateRegularGridLayout(site, turbineSpecs, parameters);
      case 'grid_irregular':
        return this.generateIrregularGridLayout(site, turbineSpecs, parameters);
      case 'cluster_based':
        return this.generateClusterBasedLayout(site, turbineSpecs, parameters);
      case 'wind_aligned':
        return this.generateWindAlignedLayout(site, turbineSpecs, parameters);
      case 'terrain_following':
        return this.generateTerrainFollowingLayout(site, turbineSpecs, parameters);
      case 'biomimetic':
        return this.generateBiomimeticLayout(site, turbineSpecs, parameters);
      case 'fractal':
        return this.generateFractalLayout(site, turbineSpecs, parameters);
      case 'genetic_optimized':
        return this.generateGeneticOptimizedLayout(site, turbineSpecs, parameters);
      case 'swarm_optimized':
        return this.generateSwarmOptimizedLayout(site, turbineSpecs, parameters);
      case 'hybrid_innovative':
        return this.generateHybridInnovativeLayout(site, turbineSpecs, parameters);
      default:
        return this.generateRegularGridLayout(site, turbineSpecs, parameters);
    }
  }

  /**
   * Compare multiple layout designs
   */
  public async compareLayoutDesigns(
    site: WindFarmSite,
    turbineSpecs: WindTurbineSpecification[],
    parameters: WindFarmOptimizationParameters,
    layoutTypes: LayoutType[]
  ): Promise<LayoutDesignResult[]> {
    console.log('Comparing multiple layout designs...');
    
    const results: LayoutDesignResult[] = [];
    
    for (const layoutType of layoutTypes) {
      const layout = await this.generateLayout(site, turbineSpecs, parameters, layoutType);
      const designResult = await this.analyzeLayoutDesign(layout, layoutType, site);
      results.push(designResult);
    }
    
    // Sort by overall performance
    results.sort((a, b) => this.calculateOverallScore(b) - this.calculateOverallScore(a));
    
    return results;
  }

  /**
   * Generate biomimetic layout inspired by natural patterns
   */
  public async generateBiomimeticLayout(
    site: WindFarmSite,
    turbineSpecs: WindTurbineSpecification[],
    parameters: WindFarmOptimizationParameters
  ): Promise<WindFarmLayout> {
    console.log('Generating biomimetic layout inspired by natural patterns...');
    
    const turbines: TurbinePosition[] = [];
    const turbineSpec = turbineSpecs[0];
    const spacing = parameters.site.turbineSpacing.current * turbineSpec.rotorDiameter;
    
    // Fibonacci spiral pattern (inspired by sunflower seed arrangement)
    const goldenAngle = 137.5 * Math.PI / 180; // Golden angle in radians
    const maxTurbines = parameters.turbine.turbineCount.current;
    const centerX = 2500; // Center of 5km x 5km area
    const centerY = 2500;
    
    for (let i = 0; i < maxTurbines; i++) {
      const radius = spacing * Math.sqrt(i);
      const angle = i * goldenAngle;
      
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // Check if position is within site boundaries
      if (x >= 0 && x <= 5000 && y >= 0 && y <= 5000) {
        turbines.push({
          id: `turbine-${i + 1}`,
          x,
          y,
          elevation: 100, // Simplified
          turbineSpec
        });
      }
    }
    
    return this.createWindFarmLayout(site, turbines, 'biomimetic');
  }

  /**
   * Generate fractal layout with self-similar patterns
   */
  public async generateFractalLayout(
    site: WindFarmSite,
    turbineSpecs: WindTurbineSpecification[],
    parameters: WindFarmOptimizationParameters
  ): Promise<WindFarmLayout> {
    console.log('Generating fractal layout with self-similar patterns...');
    
    const turbines: TurbinePosition[] = [];
    const turbineSpec = turbineSpecs[0];
    const spacing = parameters.site.turbineSpacing.current * turbineSpec.rotorDiameter;
    
    // Sierpinski triangle fractal pattern
    const iterations = 4;
    const baseSize = 2000;
    
    const fractalPoints = this.generateSierpinskiTriangle(
      { x: 2500, y: 1000 },
      { x: 1500, y: 3500 },
      { x: 3500, y: 3500 },
      iterations
    );
    
    // Convert fractal points to turbine positions
    for (let i = 0; i < Math.min(fractalPoints.length, parameters.turbine.turbineCount.current); i++) {
      const point = fractalPoints[i];
      
      // Ensure minimum spacing
      const tooClose = turbines.some(turbine => {
        const distance = Math.sqrt(
          Math.pow(turbine.x - point.x, 2) + Math.pow(turbine.y - point.y, 2)
        );
        return distance < spacing;
      });
      
      if (!tooClose && point.x >= 0 && point.x <= 5000 && point.y >= 0 && point.y <= 5000) {
        turbines.push({
          id: `turbine-${turbines.length + 1}`,
          x: point.x,
          y: point.y,
          elevation: 100,
          turbineSpec
        });
      }
    }
    
    return this.createWindFarmLayout(site, turbines, 'fractal');
  }

  /**
   * Generate wind-aligned layout optimized for dominant wind direction
   */
  public async generateWindAlignedLayout(
    site: WindFarmSite,
    turbineSpecs: WindTurbineSpecification[],
    parameters: WindFarmOptimizationParameters
  ): Promise<WindFarmLayout> {
    console.log('Generating wind-aligned layout...');
    
    const turbines: TurbinePosition[] = [];
    const turbineSpec = turbineSpecs[0];
    const spacing = parameters.site.turbineSpacing.current * turbineSpec.rotorDiameter;
    const rowSpacing = parameters.site.rowSpacing.current * turbineSpec.rotorDiameter;
    
    // Get dominant wind direction
    const dominantDirection = site.windResource.windRose[0]?.direction || 0;
    const alignmentAngle = (dominantDirection + 90) * Math.PI / 180; // Perpendicular to wind
    
    // Calculate number of rows and turbines per row
    const siteWidth = 5000;
    const siteHeight = 5000;
    const turbinesPerRow = Math.floor(siteWidth / spacing);
    const numRows = Math.floor(siteHeight / rowSpacing);
    
    let turbineCount = 0;
    const maxTurbines = parameters.turbine.turbineCount.current;
    
    for (let row = 0; row < numRows && turbineCount < maxTurbines; row++) {
      for (let col = 0; col < turbinesPerRow && turbineCount < maxTurbines; col++) {
        // Calculate position in aligned coordinate system
        const localX = col * spacing;
        const localY = row * rowSpacing;
        
        // Rotate to align with wind direction
        const x = localX * Math.cos(alignmentAngle) - localY * Math.sin(alignmentAngle) + 1000;
        const y = localX * Math.sin(alignmentAngle) + localY * Math.cos(alignmentAngle) + 1000;
        
        // Check if position is within site boundaries
        if (x >= 0 && x <= 5000 && y >= 0 && y <= 5000) {
          turbines.push({
            id: `turbine-${turbineCount + 1}`,
            x,
            y,
            elevation: 100,
            turbineSpec
          });
          turbineCount++;
        }
      }
    }
    
    return this.createWindFarmLayout(site, turbines, 'wind_aligned');
  }

  /**
   * Generate terrain-following layout adapted to topography
   */
  public async generateTerrainFollowingLayout(
    site: WindFarmSite,
    turbineSpecs: WindTurbineSpecification[],
    parameters: WindFarmOptimizationParameters
  ): Promise<WindFarmLayout> {
    console.log('Generating terrain-following layout...');
    
    const turbines: TurbinePosition[] = [];
    const turbineSpec = turbineSpecs[0];
    const spacing = parameters.site.turbineSpacing.current * turbineSpec.rotorDiameter;
    
    // Follow ridgelines and high elevation areas
    const elevationGrid = site.terrain.elevationGrid;
    const gridResolution = site.terrain.gridResolution;
    
    // Find high elevation points
    const highElevationPoints: { x: number; y: number; elevation: number }[] = [];
    
    for (let i = 0; i < elevationGrid.length; i++) {
      for (let j = 0; j < elevationGrid[i].length; j++) {
        const elevation = elevationGrid[i][j];
        const x = j * gridResolution;
        const y = i * gridResolution;
        
        // Check if this is a local maximum
        const isLocalMax = this.isLocalElevationMaximum(elevationGrid, i, j);
        
        if (isLocalMax && elevation > 50) { // Above minimum elevation threshold
          highElevationPoints.push({ x, y, elevation });
        }
      }
    }
    
    // Sort by elevation (highest first)
    highElevationPoints.sort((a, b) => b.elevation - a.elevation);
    
    // Place turbines on high elevation points with spacing constraints
    for (const point of highElevationPoints) {
      if (turbines.length >= parameters.turbine.turbineCount.current) break;
      
      // Check spacing constraints
      const tooClose = turbines.some(turbine => {
        const distance = Math.sqrt(
          Math.pow(turbine.x - point.x, 2) + Math.pow(turbine.y - point.y, 2)
        );
        return distance < spacing;
      });
      
      if (!tooClose) {
        turbines.push({
          id: `turbine-${turbines.length + 1}`,
          x: point.x,
          y: point.y,
          elevation: point.elevation,
          turbineSpec
        });
      }
    }
    
    return this.createWindFarmLayout(site, turbines, 'terrain_following');
  }

  /**
   * Generate cluster-based layout with turbine groupings
   */
  public async generateClusterBasedLayout(
    site: WindFarmSite,
    turbineSpecs: WindTurbineSpecification[],
    parameters: WindFarmOptimizationParameters
  ): Promise<WindFarmLayout> {
    console.log('Generating cluster-based layout...');
    
    const turbines: TurbinePosition[] = [];
    const turbineSpec = turbineSpecs[0];
    const clusterSize = parameters.layout.clusterSize.current;
    const spacing = parameters.site.turbineSpacing.current * turbineSpec.rotorDiameter;
    
    // Define cluster centers
    const numClusters = Math.ceil(parameters.turbine.turbineCount.current / clusterSize);
    const clusterCenters = this.generateClusterCenters(numClusters, 5000, 5000);
    
    let turbineCount = 0;
    
    for (const center of clusterCenters) {
      // Generate turbines in circular cluster around center
      const turbinesInCluster = Math.min(clusterSize, parameters.turbine.turbineCount.current - turbineCount);
      
      for (let i = 0; i < turbinesInCluster; i++) {
        const angle = (i / turbinesInCluster) * 2 * Math.PI;
        const radius = (i === 0) ? 0 : spacing * Math.ceil(i / 6); // Hexagonal packing
        
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        
        // Check if position is within site boundaries
        if (x >= 0 && x <= 5000 && y >= 0 && y <= 5000) {
          turbines.push({
            id: `turbine-${turbineCount + 1}`,
            x,
            y,
            elevation: 100,
            turbineSpec
          });
          turbineCount++;
        }
      }
    }
    
    return this.createWindFarmLayout(site, turbines, 'cluster_based');
  }

  /**
   * Generate regular grid layout
   */
  public async generateRegularGridLayout(
    site: WindFarmSite,
    turbineSpecs: WindTurbineSpecification[],
    parameters: WindFarmOptimizationParameters
  ): Promise<WindFarmLayout> {
    console.log('Generating regular grid layout...');
    
    const turbines: TurbinePosition[] = [];
    const turbineSpec = turbineSpecs[0];
    const spacing = parameters.site.turbineSpacing.current * turbineSpec.rotorDiameter;
    
    const turbinesPerRow = Math.floor(5000 / spacing);
    const numRows = Math.ceil(parameters.turbine.turbineCount.current / turbinesPerRow);
    
    let turbineCount = 0;
    
    for (let row = 0; row < numRows && turbineCount < parameters.turbine.turbineCount.current; row++) {
      for (let col = 0; col < turbinesPerRow && turbineCount < parameters.turbine.turbineCount.current; col++) {
        const x = col * spacing + spacing / 2;
        const y = row * spacing + spacing / 2;
        
        if (x <= 5000 && y <= 5000) {
          turbines.push({
            id: `turbine-${turbineCount + 1}`,
            x,
            y,
            elevation: 100,
            turbineSpec
          });
          turbineCount++;
        }
      }
    }
    
    return this.createWindFarmLayout(site, turbines, 'grid_regular');
  }

  /**
   * Generate irregular grid layout with optimized spacing
   */
  public async generateIrregularGridLayout(
    site: WindFarmSite,
    turbineSpecs: WindTurbineSpecification[],
    parameters: WindFarmOptimizationParameters
  ): Promise<WindFarmLayout> {
    console.log('Generating irregular grid layout...');
    
    // Start with regular grid and add perturbations
    const regularLayout = await this.generateRegularGridLayout(site, turbineSpecs, parameters);
    const turbines: TurbinePosition[] = [];
    
    for (const turbine of regularLayout.turbines) {
      // Add random perturbation
      const perturbationX = (Math.random() - 0.5) * 200; // ±100m
      const perturbationY = (Math.random() - 0.5) * 200;
      
      const newX = Math.max(0, Math.min(5000, turbine.x + perturbationX));
      const newY = Math.max(0, Math.min(5000, turbine.y + perturbationY));
      
      turbines.push({
        ...turbine,
        x: newX,
        y: newY
      });
    }
    
    return this.createWindFarmLayout(site, turbines, 'grid_irregular');
  }

  // Placeholder methods for genetic and swarm optimized layouts
  public async generateGeneticOptimizedLayout(
    site: WindFarmSite,
    turbineSpecs: WindTurbineSpecification[],
    parameters: WindFarmOptimizationParameters
  ): Promise<WindFarmLayout> {
    // Would use genetic algorithm optimization
    return this.generateRegularGridLayout(site, turbineSpecs, parameters);
  }

  public async generateSwarmOptimizedLayout(
    site: WindFarmSite,
    turbineSpecs: WindTurbineSpecification[],
    parameters: WindFarmOptimizationParameters
  ): Promise<WindFarmLayout> {
    // Would use particle swarm optimization
    return this.generateRegularGridLayout(site, turbineSpecs, parameters);
  }

  public async generateHybridInnovativeLayout(
    site: WindFarmSite,
    turbineSpecs: WindTurbineSpecification[],
    parameters: WindFarmOptimizationParameters
  ): Promise<WindFarmLayout> {
    // Combine multiple innovative approaches
    return this.generateBiomimeticLayout(site, turbineSpecs, parameters);
  }

  // Helper methods

  private async analyzeLayoutDesign(
    layout: WindFarmLayout,
    layoutType: LayoutType,
    site: WindFarmSite
  ): Promise<LayoutDesignResult> {
    const designPrinciples = this.getDesignPrinciples(layoutType);
    const expectedBenefits = this.getExpectedBenefits(layoutType);
    const implementationChallenges = this.getImplementationChallenges(layoutType);
    const performanceMetrics = this.calculatePerformanceMetrics(layout, site);
    
    return {
      layout,
      designPrinciples,
      expectedBenefits,
      implementationChallenges,
      performanceMetrics
    };
  }

  private getDesignPrinciples(layoutType: LayoutType): string[] {
    const principles: { [key in LayoutType]: string[] } = {
      grid_regular: ['Uniform spacing', 'Geometric regularity', 'Simplified construction'],
      grid_irregular: ['Optimized spacing', 'Terrain adaptation', 'Wake reduction'],
      cluster_based: ['Grouped turbines', 'Shared infrastructure', 'Modular development'],
      wind_aligned: ['Wind direction optimization', 'Reduced wake interference', 'Directional efficiency'],
      terrain_following: ['Topographic adaptation', 'Elevation optimization', 'Natural integration'],
      biomimetic: ['Natural pattern inspiration', 'Fibonacci spiral', 'Organic distribution'],
      fractal: ['Self-similar patterns', 'Mathematical optimization', 'Recursive design'],
      genetic_optimized: ['Evolutionary optimization', 'Multi-objective fitness', 'Adaptive improvement'],
      swarm_optimized: ['Collective intelligence', 'Particle dynamics', 'Emergent optimization'],
      hybrid_innovative: ['Combined approaches', 'Multi-criteria optimization', 'Adaptive design']
    };
    
    return principles[layoutType] || [];
  }

  private getExpectedBenefits(layoutType: LayoutType): string[] {
    const benefits: { [key in LayoutType]: string[] } = {
      grid_regular: ['Simple construction', 'Predictable performance', 'Easy maintenance'],
      grid_irregular: ['Improved wake performance', 'Better terrain utilization', 'Reduced turbulence'],
      cluster_based: ['Reduced infrastructure costs', 'Modular expansion', 'Simplified grid connection'],
      wind_aligned: ['Maximized energy capture', 'Reduced wake losses', 'Optimal wind utilization'],
      terrain_following: ['Enhanced wind exposure', 'Reduced visual impact', 'Natural integration'],
      biomimetic: ['Optimized spacing efficiency', 'Natural flow patterns', 'Aesthetic appeal'],
      fractal: ['Space-filling efficiency', 'Scalable design', 'Mathematical optimization'],
      genetic_optimized: ['Global optimization', 'Multi-objective balance', 'Adaptive solutions'],
      swarm_optimized: ['Emergent optimization', 'Collective efficiency', 'Dynamic adaptation'],
      hybrid_innovative: ['Combined benefits', 'Comprehensive optimization', 'Flexible design']
    };
    
    return benefits[layoutType] || [];
  }

  private getImplementationChallenges(layoutType: LayoutType): string[] {
    const challenges: { [key in LayoutType]: string[] } = {
      grid_regular: ['Suboptimal wind utilization', 'Wake interference', 'Terrain constraints'],
      grid_irregular: ['Complex construction planning', 'Variable access routes', 'Irregular spacing'],
      cluster_based: ['Concentrated environmental impact', 'Complex wake interactions', 'Uneven land use'],
      wind_aligned: ['Single direction optimization', 'Variable wind conditions', 'Terrain limitations'],
      terrain_following: ['Difficult access', 'Complex construction', 'Variable soil conditions'],
      biomimetic: ['Non-standard spacing', 'Complex optimization', 'Unfamiliar patterns'],
      fractal: ['Mathematical complexity', 'Non-intuitive layout', 'Construction challenges'],
      genetic_optimized: ['Computational complexity', 'Local optima', 'Parameter tuning'],
      swarm_optimized: ['Algorithm complexity', 'Convergence issues', 'Parameter sensitivity'],
      hybrid_innovative: ['Design complexity', 'Integration challenges', 'Validation requirements']
    };
    
    return challenges[layoutType] || [];
  }

  private calculatePerformanceMetrics(layout: WindFarmLayout, site: WindFarmSite): LayoutPerformanceMetrics {
    // Simplified performance metrics calculation
    const siteArea = 25; // 5km x 5km = 25 km²
    const totalCapacity = layout.turbines.length * layout.turbines[0].turbineSpec.ratedPower;
    
    return {
      energyDensity: (totalCapacity * 2500) / siteArea, // Assuming 2500 MWh/MW/year
      wakeEfficiency: 85, // Simplified
      landUseEfficiency: (layout.turbines.length * 0.5) / (siteArea * 100), // Percentage
      constructionComplexity: 5, // 1-10 scale
      maintenanceAccessibility: 7, // 1-10 scale
      visualImpactScore: 6 // 1-10 scale
    };
  }

  private calculateOverallScore(result: LayoutDesignResult): number {
    const metrics = result.performanceMetrics;
    return (
      metrics.energyDensity * 0.3 +
      metrics.wakeEfficiency * 0.25 +
      metrics.landUseEfficiency * 0.15 +
      metrics.maintenanceAccessibility * 0.15 +
      (10 - metrics.constructionComplexity) * 0.1 +
      (10 - metrics.visualImpactScore) * 0.05
    );
  }

  private generateSierpinskiTriangle(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    iterations: number
  ): { x: number; y: number }[] {
    if (iterations === 0) {
      return [p1, p2, p3];
    }
    
    const points: { x: number; y: number }[] = [];
    
    // Calculate midpoints
    const m12 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const m23 = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };
    const m31 = { x: (p3.x + p1.x) / 2, y: (p3.y + p1.y) / 2 };
    
    // Recursively generate sub-triangles
    points.push(...this.generateSierpinskiTriangle(p1, m12, m31, iterations - 1));
    points.push(...this.generateSierpinskiTriangle(m12, p2, m23, iterations - 1));
    points.push(...this.generateSierpinskiTriangle(m31, m23, p3, iterations - 1));
    
    return points;
  }

  private generateClusterCenters(numClusters: number, width: number, height: number): { x: number; y: number }[] {
    const centers: { x: number; y: number }[] = [];
    
    // Use k-means-like distribution
    for (let i = 0; i < numClusters; i++) {
      const x = (width / (numClusters + 1)) * (i + 1);
      const y = height / 2 + (Math.random() - 0.5) * height * 0.6;
      centers.push({ x, y });
    }
    
    return centers;
  }

  private isLocalElevationMaximum(elevationGrid: number[][], row: number, col: number): boolean {
    const elevation = elevationGrid[row][col];
    
    // Check 8 neighbors
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (newRow >= 0 && newRow < elevationGrid.length &&
            newCol >= 0 && newCol < elevationGrid[0].length) {
          if (elevationGrid[newRow][newCol] > elevation) {
            return false;
          }
        }
      }
    }
    
    return true;
  }

  private createWindFarmLayout(
    site: WindFarmSite,
    turbines: TurbinePosition[],
    layoutType: LayoutType
  ): WindFarmLayout {
    const totalCapacity = turbines.reduce((sum, turbine) => sum + turbine.turbineSpec.ratedPower, 0);
    
    return {
      id: `layout-${Date.now()}`,
      name: `${layoutType} Layout`,
      site,
      turbines,
      totalCapacity,
      layoutType,
      energyProduction: {
        annualEnergyProduction: totalCapacity * 2500, // Simplified
        capacityFactor: 35,
        wakeEffectLoss: 10,
        availabilityFactor: 95,
        monthlyProduction: Array(12).fill(totalCapacity * 2500 / 12),
        hourlyProfile: Array(24).fill(totalCapacity * 2500 / (24 * 365))
      },
      economicMetrics: {
        capitalCost: turbines.length * 2000000,
        operationalCost: turbines.length * 50000,
        levelizedCostOfEnergy: 60,
        netPresentValue: 0,
        internalRateOfReturn: 8,
        paybackPeriod: 12,
        profitabilityIndex: 1.2
      },
      environmentalImpact: {
        noiseImpact: { maxNoiseLevel: 40, affectedResidences: 0, noiseContourMap: [] },
        visualImpact: { visibilityIndex: 0.3, affectedViewpoints: 5, visualImpactZones: [] },
        wildlifeImpact: { birdCollisionRisk: 2, batCollisionRisk: 1, habitatFragmentation: 10, migrationInterference: 0.1 },
        soilImpact: { erosionRisk: 0.2, compactionArea: 5, drainageImpact: 0.1 },
        carbonFootprint: { constructionEmissions: 1000, operationalEmissions: 10, decommissioningEmissions: 200, carbonPaybackTime: 1.5 },
        overallImpactScore: 25
      }
    };
  }
}