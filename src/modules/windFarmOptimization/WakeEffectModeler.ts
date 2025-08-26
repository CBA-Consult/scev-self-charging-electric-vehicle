/**
 * Wake Effect Modeler
 * 
 * Models wake effects between turbines using various wake models
 * to optimize turbine placement and minimize energy losses.
 */

import {
  WindFarmSite,
  WindFarmLayout,
  TurbinePosition,
  WindResourceData
} from './types/WindFarmTypes';

export interface WakeAnalysisResult {
  totalWakeLoss: number; // percentage
  turbineWakeLosses: TurbineWakeLoss[];
  wakeMap: number[][]; // velocity deficit map
  energyLossMap: number[][]; // energy loss map
  wakeInteractions: WakeInteraction[];
  optimizationRecommendations: WakeOptimizationRecommendation[];
}

export interface TurbineWakeLoss {
  turbineId: string;
  wakeLoss: number; // percentage
  affectingTurbines: string[];
  windSpeedDeficit: number; // m/s
  turbulenceIncrease: number; // percentage
}

export interface WakeInteraction {
  upstreamTurbine: string;
  downstreamTurbine: string;
  distance: number; // meters
  wakeOverlap: number; // percentage
  velocityDeficit: number; // percentage
  energyLoss: number; // percentage
}

export interface WakeOptimizationRecommendation {
  type: 'spacing' | 'positioning' | 'orientation' | 'height';
  turbineId: string;
  currentValue: number;
  recommendedValue: number;
  expectedImprovement: number; // percentage energy gain
  implementationCost: number; // USD
}

export class WakeEffectModeler {
  
  /**
   * Comprehensive wake analysis for wind farm layout
   */
  public async analyzeWakeEffects(
    layout: WindFarmLayout,
    site: WindFarmSite
  ): Promise<WakeAnalysisResult> {
    console.log('Analyzing wake effects for wind farm layout...');
    
    // Calculate wake losses for each turbine
    const turbineWakeLosses = await this.calculateTurbineWakeLosses(layout, site);
    
    // Generate wake maps
    const wakeMap = await this.generateWakeMap(layout, site);
    const energyLossMap = await this.generateEnergyLossMap(layout, site);
    
    // Analyze wake interactions
    const wakeInteractions = await this.analyzeWakeInteractions(layout, site);
    
    // Calculate total wake loss
    const totalWakeLoss = this.calculateTotalWakeLoss(turbineWakeLosses);
    
    // Generate optimization recommendations
    const optimizationRecommendations = await this.generateOptimizationRecommendations(
      layout, site, turbineWakeLosses, wakeInteractions
    );
    
    return {
      totalWakeLoss,
      turbineWakeLosses,
      wakeMap,
      energyLossMap,
      wakeInteractions,
      optimizationRecommendations
    };
  }

  /**
   * Compare wake effects between different layouts
   */
  public async compareWakeEffects(
    layouts: WindFarmLayout[],
    site: WindFarmSite
  ): Promise<{
    layoutComparison: LayoutWakeComparison[];
    bestLayout: WindFarmLayout;
    worstLayout: WindFarmLayout;
  }> {
    console.log('Comparing wake effects between layouts...');
    
    const layoutComparison: LayoutWakeComparison[] = [];
    
    for (const layout of layouts) {
      const wakeAnalysis = await this.analyzeWakeEffects(layout, site);
      layoutComparison.push({
        layout,
        totalWakeLoss: wakeAnalysis.totalWakeLoss,
        averageTurbineWakeLoss: wakeAnalysis.turbineWakeLosses.reduce((sum, t) => sum + t.wakeLoss, 0) / wakeAnalysis.turbineWakeLosses.length,
        maxTurbineWakeLoss: Math.max(...wakeAnalysis.turbineWakeLosses.map(t => t.wakeLoss)),
        wakeInteractionCount: wakeAnalysis.wakeInteractions.length
      });
    }
    
    // Sort by total wake loss (ascending)
    layoutComparison.sort((a, b) => a.totalWakeLoss - b.totalWakeLoss);
    
    return {
      layoutComparison,
      bestLayout: layoutComparison[0].layout,
      worstLayout: layoutComparison[layoutComparison.length - 1].layout
    };
  }

  /**
   * Optimize turbine positions to minimize wake effects
   */
  public async optimizeForWakeReduction(
    layout: WindFarmLayout,
    site: WindFarmSite,
    maxIterations: number = 50
  ): Promise<{
    optimizedLayout: WindFarmLayout;
    wakeLossReduction: number;
    energyGain: number;
    iterations: number;
  }> {
    console.log('Optimizing layout for wake reduction...');
    
    let currentLayout = { ...layout };
    let bestLayout = currentLayout;
    let bestWakeLoss = Infinity;
    let iteration = 0;
    
    const initialWakeAnalysis = await this.analyzeWakeEffects(currentLayout, site);
    const initialWakeLoss = initialWakeAnalysis.totalWakeLoss;
    
    for (iteration = 0; iteration < maxIterations; iteration++) {
      // Get optimization recommendations
      const wakeAnalysis = await this.analyzeWakeEffects(currentLayout, site);
      const recommendations = wakeAnalysis.optimizationRecommendations;
      
      if (recommendations.length === 0) break;
      
      // Apply best recommendation
      const bestRecommendation = recommendations.reduce((best, current) => 
        current.expectedImprovement > best.expectedImprovement ? current : best
      );
      
      currentLayout = this.applyRecommendation(currentLayout, bestRecommendation);
      
      // Evaluate new layout
      const newWakeAnalysis = await this.analyzeWakeEffects(currentLayout, site);
      
      if (newWakeAnalysis.totalWakeLoss < bestWakeLoss) {
        bestWakeLoss = newWakeAnalysis.totalWakeLoss;
        bestLayout = { ...currentLayout };
      }
      
      // Check convergence
      if (bestRecommendation.expectedImprovement < 0.1) break;
    }
    
    const wakeLossReduction = initialWakeLoss - bestWakeLoss;
    const energyGain = (wakeLossReduction / 100) * bestLayout.energyProduction.annualEnergyProduction;
    
    return {
      optimizedLayout: bestLayout,
      wakeLossReduction,
      energyGain,
      iterations: iteration
    };
  }

  /**
   * Model wake effects using Jensen wake model
   */
  public calculateJensenWakeDeficit(
    upstreamTurbine: TurbinePosition,
    downstreamPosition: { x: number; y: number },
    windDirection: number,
    windSpeed: number,
    thrustCoefficient: number = 0.8
  ): number {
    // Calculate distance and wake parameters
    const dx = downstreamPosition.x - upstreamTurbine.x;
    const dy = downstreamPosition.y - upstreamTurbine.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if downstream position is in wake
    const windDirectionRad = windDirection * Math.PI / 180;
    const wakeDirection = Math.atan2(dy, dx);
    const angleDiff = Math.abs(wakeDirection - windDirectionRad);
    
    if (angleDiff > Math.PI / 6) return 0; // Outside wake cone (±30°)
    
    // Jensen wake model parameters
    const rotorDiameter = upstreamTurbine.turbineSpec.rotorDiameter;
    const wakeDecayConstant = 0.075; // Typical value for onshore
    const axialInduction = 0.5 * (1 - Math.sqrt(1 - thrustCoefficient));
    
    // Calculate wake radius and velocity deficit
    const wakeRadius = rotorDiameter / 2 + wakeDecayConstant * distance;
    const lateralDistance = Math.abs(distance * Math.sin(angleDiff));
    
    if (lateralDistance > wakeRadius) return 0;
    
    // Velocity deficit at center of wake
    const velocityDeficit = 2 * axialInduction / Math.pow(1 + 2 * wakeDecayConstant * distance / rotorDiameter, 2);
    
    // Apply radial distribution (top-hat model)
    return velocityDeficit;
  }

  /**
   * Model wake effects using Gaussian wake model
   */
  public calculateGaussianWakeDeficit(
    upstreamTurbine: TurbinePosition,
    downstreamPosition: { x: number; y: number },
    windDirection: number,
    windSpeed: number,
    turbulenceIntensity: number = 0.1
  ): number {
    const dx = downstreamPosition.x - upstreamTurbine.x;
    const dy = downstreamPosition.y - upstreamTurbine.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Transform to wake coordinate system
    const windDirectionRad = windDirection * Math.PI / 180;
    const xWake = dx * Math.cos(windDirectionRad) + dy * Math.sin(windDirectionRad);
    const yWake = -dx * Math.sin(windDirectionRad) + dy * Math.cos(windDirectionRad);
    
    if (xWake <= 0) return 0; // Upstream
    
    const rotorDiameter = upstreamTurbine.turbineSpec.rotorDiameter;
    const rotorRadius = rotorDiameter / 2;
    
    // Gaussian wake model parameters
    const k = 0.3837 * turbulenceIntensity + 0.003678;
    const sigma = k * xWake + rotorDiameter / Math.sqrt(8);
    
    // Velocity deficit
    const C = 1 - Math.sqrt(1 - 0.8); // Thrust coefficient approximation
    const velocityDeficit = C * Math.pow(rotorDiameter / (rotorDiameter + 2 * k * xWake), 2) * 
                           Math.exp(-0.5 * Math.pow(yWake / sigma, 2));
    
    return velocityDeficit;
  }

  // Private helper methods

  private async calculateTurbineWakeLosses(
    layout: WindFarmLayout,
    site: WindFarmSite
  ): Promise<TurbineWakeLoss[]> {
    const turbineWakeLosses: TurbineWakeLoss[] = [];
    
    for (const turbine of layout.turbines) {
      let totalWakeLoss = 0;
      let totalWindSpeedDeficit = 0;
      const affectingTurbines: string[] = [];
      
      // Calculate wake effects from all other turbines
      for (const otherTurbine of layout.turbines) {
        if (otherTurbine.id === turbine.id) continue;
        
        // For each wind direction sector
        for (const windSector of site.windResource.windRose) {
          const wakeDeficit = this.calculateJensenWakeDeficit(
            otherTurbine,
            { x: turbine.x, y: turbine.y },
            windSector.direction,
            windSector.meanSpeed
          );
          
          if (wakeDeficit > 0.01) { // Significant wake effect
            const weightedDeficit = wakeDeficit * (windSector.frequency / 100);
            totalWakeLoss += weightedDeficit;
            totalWindSpeedDeficit += wakeDeficit * windSector.meanSpeed * (windSector.frequency / 100);
            
            if (!affectingTurbines.includes(otherTurbine.id)) {
              affectingTurbines.push(otherTurbine.id);
            }
          }
        }
      }
      
      // Convert to percentage and apply power curve
      const wakeLossPercentage = Math.min(80, totalWakeLoss * 100); // Cap at 80%
      const energyLoss = Math.pow(1 - totalWakeLoss, 3) * 100 - 100; // Cubic relationship
      
      turbineWakeLosses.push({
        turbineId: turbine.id,
        wakeLoss: Math.abs(energyLoss),
        affectingTurbines,
        windSpeedDeficit: totalWindSpeedDeficit,
        turbulenceIncrease: totalWakeLoss * 50 // Simplified turbulence increase
      });
    }
    
    return turbineWakeLosses;
  }

  private async generateWakeMap(
    layout: WindFarmLayout,
    site: WindFarmSite,
    resolution: number = 100
  ): Promise<number[][]> {
    const gridSize = Math.ceil(5000 / resolution);
    const wakeMap: number[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    
    // Calculate wake deficit at each grid point
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = j * resolution;
        const y = i * resolution;
        let totalDeficit = 0;
        
        // Sum wake effects from all turbines
        for (const turbine of layout.turbines) {
          for (const windSector of site.windResource.windRose) {
            const deficit = this.calculateJensenWakeDeficit(
              turbine,
              { x, y },
              windSector.direction,
              windSector.meanSpeed
            );
            totalDeficit += deficit * (windSector.frequency / 100);
          }
        }
        
        wakeMap[i][j] = Math.min(1, totalDeficit);
      }
    }
    
    return wakeMap;
  }

  private async generateEnergyLossMap(
    layout: WindFarmLayout,
    site: WindFarmSite,
    resolution: number = 100
  ): Promise<number[][]> {
    const wakeMap = await this.generateWakeMap(layout, site, resolution);
    const energyLossMap: number[][] = [];
    
    for (let i = 0; i < wakeMap.length; i++) {
      energyLossMap[i] = [];
      for (let j = 0; j < wakeMap[i].length; j++) {
        // Convert velocity deficit to energy loss (cubic relationship)
        const velocityDeficit = wakeMap[i][j];
        const energyLoss = 1 - Math.pow(1 - velocityDeficit, 3);
        energyLossMap[i][j] = energyLoss;
      }
    }
    
    return energyLossMap;
  }

  private async analyzeWakeInteractions(
    layout: WindFarmLayout,
    site: WindFarmSite
  ): Promise<WakeInteraction[]> {
    const interactions: WakeInteraction[] = [];
    
    for (let i = 0; i < layout.turbines.length; i++) {
      for (let j = 0; j < layout.turbines.length; j++) {
        if (i === j) continue;
        
        const upstream = layout.turbines[i];
        const downstream = layout.turbines[j];
        
        const distance = Math.sqrt(
          Math.pow(downstream.x - upstream.x, 2) + Math.pow(downstream.y - upstream.y, 2)
        );
        
        // Check for significant wake interaction
        let totalWakeOverlap = 0;
        let totalVelocityDeficit = 0;
        
        for (const windSector of site.windResource.windRose) {
          const deficit = this.calculateJensenWakeDeficit(
            upstream,
            { x: downstream.x, y: downstream.y },
            windSector.direction,
            windSector.meanSpeed
          );
          
          if (deficit > 0.01) {
            const weight = windSector.frequency / 100;
            totalWakeOverlap += weight;
            totalVelocityDeficit += deficit * weight;
          }
        }
        
        if (totalWakeOverlap > 0.05) { // Significant interaction
          const energyLoss = 1 - Math.pow(1 - totalVelocityDeficit, 3);
          
          interactions.push({
            upstreamTurbine: upstream.id,
            downstreamTurbine: downstream.id,
            distance,
            wakeOverlap: totalWakeOverlap * 100,
            velocityDeficit: totalVelocityDeficit * 100,
            energyLoss: energyLoss * 100
          });
        }
      }
    }
    
    return interactions;
  }

  private calculateTotalWakeLoss(turbineWakeLosses: TurbineWakeLoss[]): number {
    if (turbineWakeLosses.length === 0) return 0;
    
    return turbineWakeLosses.reduce((sum, turbine) => sum + turbine.wakeLoss, 0) / turbineWakeLosses.length;
  }

  private async generateOptimizationRecommendations(
    layout: WindFarmLayout,
    site: WindFarmSite,
    turbineWakeLosses: TurbineWakeLoss[],
    wakeInteractions: WakeInteraction[]
  ): Promise<WakeOptimizationRecommendation[]> {
    const recommendations: WakeOptimizationRecommendation[] = [];
    
    // Find turbines with high wake losses
    const highWakeLossTurbines = turbineWakeLosses.filter(t => t.wakeLoss > 15);
    
    for (const turbine of highWakeLossTurbines) {
      const turbinePosition = layout.turbines.find(t => t.id === turbine.turbineId);
      if (!turbinePosition) continue;
      
      // Recommend spacing increase
      const currentSpacing = this.calculateMinimumSpacing(turbinePosition, layout.turbines);
      const recommendedSpacing = currentSpacing * 1.5;
      const expectedImprovement = Math.min(turbine.wakeLoss * 0.3, 5); // Up to 5% improvement
      
      recommendations.push({
        type: 'spacing',
        turbineId: turbine.turbineId,
        currentValue: currentSpacing,
        recommendedValue: recommendedSpacing,
        expectedImprovement,
        implementationCost: 50000 // Cost of repositioning
      });
      
      // Recommend height increase if beneficial
      const currentHeight = turbinePosition.turbineSpec.hubHeight;
      const recommendedHeight = currentHeight + 20;
      const heightImprovement = Math.min(turbine.wakeLoss * 0.2, 3);
      
      recommendations.push({
        type: 'height',
        turbineId: turbine.turbineId,
        currentValue: currentHeight,
        recommendedValue: recommendedHeight,
        expectedImprovement: heightImprovement,
        implementationCost: 200000 // Cost of taller tower
      });
    }
    
    // Sort by expected improvement
    recommendations.sort((a, b) => b.expectedImprovement - a.expectedImprovement);
    
    return recommendations.slice(0, 10); // Return top 10 recommendations
  }

  private calculateMinimumSpacing(
    turbine: TurbinePosition,
    allTurbines: TurbinePosition[]
  ): number {
    let minSpacing = Infinity;
    
    for (const otherTurbine of allTurbines) {
      if (otherTurbine.id === turbine.id) continue;
      
      const distance = Math.sqrt(
        Math.pow(turbine.x - otherTurbine.x, 2) + Math.pow(turbine.y - otherTurbine.y, 2)
      );
      
      minSpacing = Math.min(minSpacing, distance);
    }
    
    return minSpacing === Infinity ? 0 : minSpacing;
  }

  private applyRecommendation(
    layout: WindFarmLayout,
    recommendation: WakeOptimizationRecommendation
  ): WindFarmLayout {
    const newLayout = { ...layout, turbines: [...layout.turbines] };
    const turbineIndex = newLayout.turbines.findIndex(t => t.id === recommendation.turbineId);
    
    if (turbineIndex === -1) return newLayout;
    
    const turbine = { ...newLayout.turbines[turbineIndex] };
    
    switch (recommendation.type) {
      case 'spacing':
        // Move turbine to reduce wake effects (simplified)
        turbine.x += 100; // Move 100m in x direction
        break;
      case 'height':
        turbine.turbineSpec = {
          ...turbine.turbineSpec,
          hubHeight: recommendation.recommendedValue
        };
        break;
      // Add other recommendation types as needed
    }
    
    newLayout.turbines[turbineIndex] = turbine;
    return newLayout;
  }
}

interface LayoutWakeComparison {
  layout: WindFarmLayout;
  totalWakeLoss: number;
  averageTurbineWakeLoss: number;
  maxTurbineWakeLoss: number;
  wakeInteractionCount: number;
}