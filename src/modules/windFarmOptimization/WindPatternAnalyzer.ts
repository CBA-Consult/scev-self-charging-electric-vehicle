/**
 * Wind Pattern Analyzer
 * 
 * Analyzes wind patterns, resource assessment, and atmospheric conditions
 * to optimize wind farm layouts for maximum energy capture.
 */

import {
  WindResourceData,
  WindRoseData,
  SeasonalWindData,
  ExtremeWindEvent
} from './types/WindFarmTypes';

export interface WindAnalysisResult {
  meanWindSpeed: number;
  dominantDirection: number;
  turbulenceIntensity: number;
  windShear: number;
  seasonalVariation: number;
  extremeWindRisk: number;
  energyDensity: number;
  weibullParameters: { A: number; k: number };
  windRoseAnalysis: WindRoseAnalysis;
  verticalProfile: VerticalWindProfile;
  spatialVariability: SpatialWindVariability;
  temporalPatterns: TemporalWindPatterns;
}

export interface WindRoseAnalysis {
  sectors: WindSectorData[];
  dominantSector: number;
  energyContribution: number[];
  directionalVariability: number;
  calmsPercentage: number;
}

export interface WindSectorData {
  direction: number;
  frequency: number;
  meanSpeed: number;
  energyDensity: number;
  turbulenceLevel: number;
  gustFactor: number;
}

export interface VerticalWindProfile {
  heights: number[];
  windSpeeds: number[];
  shearExponent: number;
  boundaryLayerHeight: number;
  stabilityClass: string;
  temperatureGradient: number;
}

export interface SpatialWindVariability {
  variabilityIndex: number;
  correlationLength: number;
  topographicEffects: TopographicEffect[];
  roughnessImpact: RoughnessImpact;
  thermalEffects: ThermalEffect[];
}

export interface TopographicEffect {
  type: 'speed_up' | 'slow_down' | 'turbulence' | 'flow_separation';
  location: { x: number; y: number };
  magnitude: number;
  affectedArea: number;
}

export interface RoughnessImpact {
  roughnessLength: number;
  displacementHeight: number;
  speedReduction: number;
  turbulenceIncrease: number;
}

export interface ThermalEffect {
  type: 'sea_breeze' | 'land_breeze' | 'valley_wind' | 'mountain_wind';
  strength: number;
  frequency: number;
  timeOfDay: string;
  seasonality: string;
}

export interface TemporalWindPatterns {
  diurnalCycle: DiurnalPattern;
  seasonalCycle: SeasonalPattern;
  interannualVariability: number;
  longTermTrends: LongTermTrend[];
  extremeEvents: ExtremeEventAnalysis;
}

export interface DiurnalPattern {
  hourlyMeans: number[];
  peakHour: number;
  minimumHour: number;
  variabilityRange: number;
}

export interface SeasonalPattern {
  monthlyMeans: number[];
  peakMonth: number;
  minimumMonth: number;
  seasonalAmplitude: number;
}

export interface LongTermTrend {
  parameter: string;
  trendValue: number; // per year
  significance: number;
  confidence: number;
}

export interface ExtremeEventAnalysis {
  returnPeriods: ReturnPeriodAnalysis[];
  extremeValueDistribution: ExtremeValueDistribution;
  clusteringTendency: number;
  seasonalExtremeRisk: SeasonalExtremeRisk[];
}

export interface ReturnPeriodAnalysis {
  returnPeriod: number; // years
  windSpeed: number; // m/s
  confidence: [number, number]; // confidence interval
}

export interface ExtremeValueDistribution {
  type: 'gumbel' | 'weibull' | 'generalized_extreme_value';
  parameters: number[];
  goodnessOfFit: number;
}

export interface SeasonalExtremeRisk {
  season: string;
  probability: number;
  typicalMagnitude: number;
  duration: number;
}

export class WindPatternAnalyzer {
  
  /**
   * Comprehensive wind resource analysis
   */
  public async analyzeWindResource(windData: WindResourceData): Promise<WindAnalysisResult> {
    console.log('Analyzing wind resource data...');
    
    // Basic wind statistics
    const meanWindSpeed = this.calculateMeanWindSpeed(windData);
    const dominantDirection = this.findDominantDirection(windData.windRose);
    const turbulenceIntensity = windData.turbulenceIntensity;
    const windShear = this.calculateWindShear(windData);
    
    // Advanced analyses
    const windRoseAnalysis = this.analyzeWindRose(windData.windRose);
    const verticalProfile = this.analyzeVerticalProfile(windData);
    const spatialVariability = this.analyzeSpatialVariability(windData);
    const temporalPatterns = this.analyzeTemporalPatterns(windData);
    
    // Energy and variability metrics
    const energyDensity = this.calculateEnergyDensity(windData);
    const seasonalVariation = this.calculateSeasonalVariation(windData.seasonalVariation);
    const extremeWindRisk = this.assessExtremeWindRisk(windData.extremeWindEvents);
    
    // Weibull distribution fitting
    const weibullParameters = this.fitWeibullDistribution(windData.windRose);
    
    return {
      meanWindSpeed,
      dominantDirection,
      turbulenceIntensity,
      windShear,
      seasonalVariation,
      extremeWindRisk,
      energyDensity,
      weibullParameters,
      windRoseAnalysis,
      verticalProfile,
      spatialVariability,
      temporalPatterns
    };
  }

  /**
   * Optimize turbine hub heights based on wind profile
   */
  public optimizeHubHeights(
    windProfile: VerticalWindProfile,
    turbineOptions: { height: number; cost: number }[]
  ): { optimalHeight: number; energyGain: number; costBenefit: number } {
    console.log('Optimizing turbine hub heights...');
    
    let bestOption = turbineOptions[0];
    let maxBenefit = -Infinity;
    
    for (const option of turbineOptions) {
      const windSpeedAtHeight = this.interpolateWindSpeed(windProfile, option.height);
      const energyGain = Math.pow(windSpeedAtHeight / windProfile.windSpeeds[0], 3);
      const costBenefit = energyGain / (option.cost / turbineOptions[0].cost);
      
      if (costBenefit > maxBenefit) {
        maxBenefit = costBenefit;
        bestOption = option;
      }
    }
    
    const baseWindSpeed = windProfile.windSpeeds[0];
    const optimalWindSpeed = this.interpolateWindSpeed(windProfile, bestOption.height);
    const energyGain = Math.pow(optimalWindSpeed / baseWindSpeed, 3) - 1;
    
    return {
      optimalHeight: bestOption.height,
      energyGain,
      costBenefit: maxBenefit
    };
  }

  /**
   * Assess wind resource quality for site ranking
   */
  public assessWindResourceQuality(windData: WindResourceData): {
    overallRating: 'poor' | 'fair' | 'good' | 'excellent';
    score: number;
    factors: { [key: string]: number };
  } {
    console.log('Assessing wind resource quality...');
    
    const factors: { [key: string]: number } = {};
    
    // Wind speed factor (0-100)
    factors.windSpeed = Math.min(100, (windData.meanWindSpeed / 10) * 100);
    
    // Consistency factor (based on turbulence and variability)
    factors.consistency = Math.max(0, 100 - windData.turbulenceIntensity * 100);
    
    // Directional stability
    const dominantFreq = Math.max(...windData.windRose.map(wr => wr.frequency));
    factors.directionalStability = Math.min(100, dominantFreq * 2);
    
    // Seasonal stability
    const seasonalCV = this.calculateSeasonalVariation(windData.seasonalVariation);
    factors.seasonalStability = Math.max(0, 100 - seasonalCV);
    
    // Extreme wind risk (lower is better)
    const extremeRisk = this.assessExtremeWindRisk(windData.extremeWindEvents);
    factors.extremeWindRisk = Math.max(0, 100 - extremeRisk);
    
    // Calculate overall score
    const weights = {
      windSpeed: 0.4,
      consistency: 0.2,
      directionalStability: 0.15,
      seasonalStability: 0.15,
      extremeWindRisk: 0.1
    };
    
    const score = Object.keys(factors).reduce((sum, key) => {
      return sum + factors[key] * weights[key];
    }, 0);
    
    let overallRating: 'poor' | 'fair' | 'good' | 'excellent';
    if (score >= 80) overallRating = 'excellent';
    else if (score >= 65) overallRating = 'good';
    else if (score >= 50) overallRating = 'fair';
    else overallRating = 'poor';
    
    return { overallRating, score, factors };
  }

  /**
   * Generate wind resource maps for spatial analysis
   */
  public generateWindResourceMaps(
    windData: WindResourceData,
    terrainData: any,
    gridResolution: number = 100
  ): {
    windSpeedMap: number[][];
    energyDensityMap: number[][];
    turbulenceMap: number[][];
    suitabilityMap: number[][];
  } {
    console.log('Generating wind resource maps...');
    
    // This would implement sophisticated wind flow modeling
    // considering terrain effects, roughness, and atmospheric stability
    
    const rows = Math.ceil(terrainData.height / gridResolution);
    const cols = Math.ceil(terrainData.width / gridResolution);
    
    const windSpeedMap: number[][] = [];
    const energyDensityMap: number[][] = [];
    const turbulenceMap: number[][] = [];
    const suitabilityMap: number[][] = [];
    
    for (let i = 0; i < rows; i++) {
      windSpeedMap[i] = [];
      energyDensityMap[i] = [];
      turbulenceMap[i] = [];
      suitabilityMap[i] = [];
      
      for (let j = 0; j < cols; j++) {
        // Apply terrain and roughness corrections
        const terrainFactor = this.calculateTerrainFactor(i, j, terrainData);
        const roughnessFactor = this.calculateRoughnessFactor(i, j, terrainData);
        
        const adjustedWindSpeed = windData.meanWindSpeed * terrainFactor * roughnessFactor;
        const energyDensity = 0.5 * windData.airDensity * Math.pow(adjustedWindSpeed, 3);
        const turbulence = windData.turbulenceIntensity * (1 + roughnessFactor - 1);
        
        windSpeedMap[i][j] = adjustedWindSpeed;
        energyDensityMap[i][j] = energyDensity;
        turbulenceMap[i][j] = turbulence;
        
        // Suitability combines wind resource and turbulence
        suitabilityMap[i][j] = this.calculateSuitabilityScore(
          adjustedWindSpeed,
          energyDensity,
          turbulence
        );
      }
    }
    
    return {
      windSpeedMap,
      energyDensityMap,
      turbulenceMap,
      suitabilityMap
    };
  }

  // Private helper methods

  private calculateMeanWindSpeed(windData: WindResourceData): number {
    if (windData.windRose && windData.windRose.length > 0) {
      return windData.windRose.reduce((sum, wr) => {
        return sum + wr.meanSpeed * (wr.frequency / 100);
      }, 0);
    }
    return windData.meanWindSpeed;
  }

  private findDominantDirection(windRose: WindRoseData[]): number {
    if (!windRose || windRose.length === 0) return 0;
    
    return windRose.reduce((dominant, current) => {
      return current.frequency > dominant.frequency ? current : dominant;
    }).direction;
  }

  private calculateWindShear(windData: WindResourceData): number {
    return windData.windShearExponent || 0.14; // Default value
  }

  private analyzeWindRose(windRose: WindRoseData[]): WindRoseAnalysis {
    const sectors: WindSectorData[] = windRose.map(wr => ({
      direction: wr.direction,
      frequency: wr.frequency,
      meanSpeed: wr.meanSpeed,
      energyDensity: 0.5 * 1.225 * Math.pow(wr.meanSpeed, 3), // Assuming standard air density
      turbulenceLevel: 0.15, // Default value
      gustFactor: 1.3 // Default value
    }));
    
    const dominantSector = windRose.findIndex(wr => 
      wr.frequency === Math.max(...windRose.map(w => w.frequency))
    );
    
    const energyContribution = windRose.map(wr => 
      wr.frequency * Math.pow(wr.meanSpeed, 3)
    );
    
    const directionalVariability = this.calculateDirectionalVariability(windRose);
    const calmsPercentage = 100 - windRose.reduce((sum, wr) => sum + wr.frequency, 0);
    
    return {
      sectors,
      dominantSector,
      energyContribution,
      directionalVariability,
      calmsPercentage
    };
  }

  private analyzeVerticalProfile(windData: WindResourceData): VerticalWindProfile {
    const heights = [10, 30, 50, 80, 100, 120, 150];
    const windSpeeds = heights.map(h => 
      windData.meanWindSpeed * Math.pow(h / windData.referenceHeight, windData.windShearExponent)
    );
    
    return {
      heights,
      windSpeeds,
      shearExponent: windData.windShearExponent,
      boundaryLayerHeight: 1000, // Default value
      stabilityClass: 'neutral', // Default value
      temperatureGradient: -0.0065 // Standard atmosphere
    };
  }

  private analyzeSpatialVariability(windData: WindResourceData): SpatialWindVariability {
    return {
      variabilityIndex: 0.1, // Default value
      correlationLength: 5000, // meters
      topographicEffects: [],
      roughnessImpact: {
        roughnessLength: 0.1,
        displacementHeight: 0,
        speedReduction: 0.05,
        turbulenceIncrease: 0.02
      },
      thermalEffects: []
    };
  }

  private analyzeTemporalPatterns(windData: WindResourceData): TemporalWindPatterns {
    // Generate typical diurnal pattern
    const hourlyMeans = Array.from({ length: 24 }, (_, i) => {
      // Simple sinusoidal pattern with peak in afternoon
      return windData.meanWindSpeed * (1 + 0.2 * Math.sin((i - 6) * Math.PI / 12));
    });
    
    const monthlyMeans = windData.seasonalVariation.map(sv => sv.meanWindSpeed);
    
    return {
      diurnalCycle: {
        hourlyMeans,
        peakHour: 14,
        minimumHour: 6,
        variabilityRange: 0.4
      },
      seasonalCycle: {
        monthlyMeans,
        peakMonth: 3, // March
        minimumMonth: 8, // August
        seasonalAmplitude: 0.3
      },
      interannualVariability: 0.1,
      longTermTrends: [],
      extremeEvents: {
        returnPeriods: [
          { returnPeriod: 10, windSpeed: 35, confidence: [32, 38] },
          { returnPeriod: 50, windSpeed: 42, confidence: [38, 46] },
          { returnPeriod: 100, windSpeed: 45, confidence: [40, 50] }
        ],
        extremeValueDistribution: {
          type: 'gumbel',
          parameters: [30, 5],
          goodnessOfFit: 0.95
        },
        clusteringTendency: 0.2,
        seasonalExtremeRisk: [
          { season: 'winter', probability: 0.4, typicalMagnitude: 40, duration: 6 },
          { season: 'spring', probability: 0.3, typicalMagnitude: 35, duration: 4 },
          { season: 'summer', probability: 0.1, typicalMagnitude: 30, duration: 2 },
          { season: 'autumn', probability: 0.2, typicalMagnitude: 38, duration: 5 }
        ]
      }
    };
  }

  private calculateEnergyDensity(windData: WindResourceData): number {
    return 0.5 * windData.airDensity * Math.pow(windData.meanWindSpeed, 3);
  }

  private calculateSeasonalVariation(seasonalData: SeasonalWindData[]): number {
    if (!seasonalData || seasonalData.length === 0) return 0;
    
    const speeds = seasonalData.map(sd => sd.meanWindSpeed);
    const mean = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
    const variance = speeds.reduce((sum, speed) => sum + Math.pow(speed - mean, 2), 0) / speeds.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private assessExtremeWindRisk(extremeEvents: ExtremeWindEvent[]): number {
    if (!extremeEvents || extremeEvents.length === 0) return 0;
    
    return extremeEvents.reduce((risk, event) => {
      const eventRisk = event.probability * (event.maxWindSpeed / 50); // Normalized risk
      return risk + eventRisk;
    }, 0);
  }

  private fitWeibullDistribution(windRose: WindRoseData[]): { A: number; k: number } {
    // Simplified Weibull fitting - in practice would use more sophisticated methods
    const meanSpeed = this.calculateMeanWindSpeed({ windRose } as WindResourceData);
    
    // Typical values for wind
    const k = 2.0; // Shape parameter
    const A = meanSpeed / 0.886; // Scale parameter
    
    return { A, k };
  }

  private interpolateWindSpeed(profile: VerticalWindProfile, height: number): number {
    const { heights, windSpeeds } = profile;
    
    // Find surrounding heights
    let lowerIndex = 0;
    for (let i = 0; i < heights.length - 1; i++) {
      if (heights[i] <= height && heights[i + 1] > height) {
        lowerIndex = i;
        break;
      }
    }
    
    if (lowerIndex === heights.length - 1) {
      // Extrapolate using power law
      const refHeight = heights[lowerIndex];
      const refSpeed = windSpeeds[lowerIndex];
      return refSpeed * Math.pow(height / refHeight, profile.shearExponent);
    }
    
    // Linear interpolation
    const h1 = heights[lowerIndex];
    const h2 = heights[lowerIndex + 1];
    const v1 = windSpeeds[lowerIndex];
    const v2 = windSpeeds[lowerIndex + 1];
    
    return v1 + (v2 - v1) * (height - h1) / (h2 - h1);
  }

  private calculateDirectionalVariability(windRose: WindRoseData[]): number {
    // Calculate directional variability index
    const frequencies = windRose.map(wr => wr.frequency);
    const maxFreq = Math.max(...frequencies);
    const minFreq = Math.min(...frequencies);
    
    return (maxFreq - minFreq) / maxFreq;
  }

  private calculateTerrainFactor(row: number, col: number, terrainData: any): number {
    // Simplified terrain effect calculation
    // In practice, would use CFD or empirical models
    return 1.0; // Placeholder
  }

  private calculateRoughnessFactor(row: number, col: number, terrainData: any): number {
    // Simplified roughness effect calculation
    return 1.0; // Placeholder
  }

  private calculateSuitabilityScore(
    windSpeed: number,
    energyDensity: number,
    turbulence: number
  ): number {
    // Combine factors into suitability score (0-100)
    const speedScore = Math.min(100, (windSpeed / 10) * 100);
    const energyScore = Math.min(100, (energyDensity / 1000) * 100);
    const turbulenceScore = Math.max(0, 100 - turbulence * 500);
    
    return (speedScore * 0.5 + energyScore * 0.3 + turbulenceScore * 0.2);
  }
}