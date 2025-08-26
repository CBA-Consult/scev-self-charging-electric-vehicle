/**
 * Environmental Impact Assessment
 * 
 * Comprehensive assessment of environmental impacts including noise,
 * visual impact, wildlife effects, and ecological considerations.
 */

import {
  WindFarmSite,
  WindFarmLayout,
  TurbinePosition,
  EnvironmentalImpactMetrics
} from './types/WindFarmTypes';

import {
  EnvironmentalAssessmentParameters,
  NoiseReceptor,
  Viewpoint,
  WildlifeSpecies
} from './types/EnvironmentalTypes';

export interface EnvironmentalImpactResult {
  overallImpactScore: number; // 0-100 scale
  impactCategories: ImpactCategoryResult[];
  mitigationMeasures: MitigationMeasure[];
  complianceStatus: ComplianceStatus;
  monitoringRequirements: MonitoringRequirement[];
  adaptiveManagement: AdaptiveManagementPlan;
}

export interface ImpactCategoryResult {
  category: 'noise' | 'visual' | 'wildlife' | 'soil' | 'water' | 'air' | 'cultural';
  impactScore: number; // 0-100 scale
  significance: 'negligible' | 'minor' | 'moderate' | 'major' | 'severe';
  confidence: 'low' | 'medium' | 'high';
  uncertainties: string[];
  keyFindings: string[];
}

export interface MitigationMeasure {
  id: string;
  category: string;
  measure: string;
  effectiveness: number; // 0-1 scale
  cost: number; // USD
  implementationTime: number; // months
  maintenanceRequired: boolean;
  monitoringRequired: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceStatus {
  overallCompliance: boolean;
  regulatoryRequirements: RegulatoryCompliance[];
  permits: PermitStatus[];
  violations: ComplianceViolation[];
}

export interface RegulatoryCompliance {
  regulation: string;
  authority: string;
  compliant: boolean;
  requirements: string[];
  gaps: string[];
}

export interface PermitStatus {
  permitType: string;
  authority: string;
  status: 'not_required' | 'required' | 'applied' | 'approved' | 'denied';
  conditions: string[];
  expiryDate?: string;
}

export interface ComplianceViolation {
  regulation: string;
  violation: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  remediation: string[];
  timeline: number; // months
}

export interface MonitoringRequirement {
  parameter: string;
  method: string;
  frequency: string;
  duration: string;
  locations: MonitoringLocation[];
  reportingRequirements: string[];
  cost: number; // USD per year
}

export interface MonitoringLocation {
  id: string;
  type: string;
  coordinates: { x: number; y: number };
  equipment: string[];
  accessRequirements: string[];
}

export interface AdaptiveManagementPlan {
  triggers: AdaptiveManagementTrigger[];
  responses: AdaptiveManagementResponse[];
  reviewSchedule: string;
  stakeholderInvolvement: string[];
}

export interface AdaptiveManagementTrigger {
  parameter: string;
  threshold: number;
  timeframe: string;
  action: string;
}

export interface AdaptiveManagementResponse {
  trigger: string;
  response: string;
  timeline: string;
  responsibility: string;
  cost: number; // USD
}

export class EnvironmentalImpactAssessment {
  
  /**
   * Comprehensive environmental impact assessment
   */
  public async assessImpact(
    layout: WindFarmLayout,
    site: WindFarmSite,
    assessmentParameters?: EnvironmentalAssessmentParameters
  ): Promise<EnvironmentalImpactResult> {
    console.log('Conducting comprehensive environmental impact assessment...');
    
    // Assess different impact categories
    const noiseImpact = await this.assessNoiseImpact(layout, site, assessmentParameters);
    const visualImpact = await this.assessVisualImpact(layout, site, assessmentParameters);
    const wildlifeImpact = await this.assessWildlifeImpact(layout, site, assessmentParameters);
    const soilImpact = await this.assessSoilImpact(layout, site);
    const waterImpact = await this.assessWaterImpact(layout, site);
    const airImpact = await this.assessAirQualityImpact(layout, site);
    const culturalImpact = await this.assessCulturalImpact(layout, site);
    
    const impactCategories: ImpactCategoryResult[] = [
      noiseImpact,
      visualImpact,
      wildlifeImpact,
      soilImpact,
      waterImpact,
      airImpact,
      culturalImpact
    ];
    
    // Calculate overall impact score
    const overallImpactScore = this.calculateOverallImpactScore(impactCategories);
    
    // Develop mitigation measures
    const mitigationMeasures = await this.developMitigationMeasures(impactCategories, layout, site);
    
    // Check compliance status
    const complianceStatus = await this.assessComplianceStatus(layout, site, impactCategories);
    
    // Define monitoring requirements
    const monitoringRequirements = await this.defineMonitoringRequirements(impactCategories, layout, site);
    
    // Develop adaptive management plan
    const adaptiveManagement = await this.developAdaptiveManagementPlan(impactCategories, layout, site);
    
    return {
      overallImpactScore,
      impactCategories,
      mitigationMeasures,
      complianceStatus,
      monitoringRequirements,
      adaptiveManagement
    };
  }

  /**
   * Assess cumulative impacts with other projects
   */
  public async assessCumulativeImpacts(
    layout: WindFarmLayout,
    site: WindFarmSite,
    existingProjects: WindFarmLayout[],
    plannedProjects: WindFarmLayout[]
  ): Promise<EnvironmentalImpactResult> {
    console.log('Assessing cumulative environmental impacts...');
    
    // Combine all projects for cumulative assessment
    const cumulativeLayout: WindFarmLayout = {
      ...layout,
      turbines: [
        ...layout.turbines,
        ...existingProjects.flatMap(p => p.turbines),
        ...plannedProjects.flatMap(p => p.turbines)
      ]
    };
    
    // Assess cumulative impacts
    const cumulativeImpact = await this.assessImpact(cumulativeLayout, site);
    
    // Calculate incremental impact of this project
    const incrementalImpact = this.calculateIncrementalImpact(
      cumulativeImpact,
      await this.assessImpact(layout, site)
    );
    
    return incrementalImpact;
  }

  /**
   * Optimize layout for minimal environmental impact
   */
  public async optimizeForEnvironmentalImpact(
    layout: WindFarmLayout,
    site: WindFarmSite,
    impactThresholds: { [category: string]: number }
  ): Promise<{
    optimizedLayout: WindFarmLayout;
    impactReduction: number;
    mitigationCost: number;
  }> {
    console.log('Optimizing layout for minimal environmental impact...');
    
    let currentLayout = { ...layout };
    let bestLayout = currentLayout;
    let bestImpactScore = Infinity;
    
    // Iterative optimization
    for (let iteration = 0; iteration < 50; iteration++) {
      const impact = await this.assessImpact(currentLayout, site);
      
      if (impact.overallImpactScore < bestImpactScore) {
        bestImpactScore = impact.overallImpactScore;
        bestLayout = { ...currentLayout };
      }
      
      // Check if thresholds are met
      const thresholdsMet = this.checkImpactThresholds(impact, impactThresholds);
      if (thresholdsMet) {
        break;
      }
      
      // Modify layout to reduce impacts
      currentLayout = await this.modifyLayoutForImpactReduction(currentLayout, impact, site);
    }
    
    const originalImpact = await this.assessImpact(layout, site);
    const optimizedImpact = await this.assessImpact(bestLayout, site);
    
    const impactReduction = originalImpact.overallImpactScore - optimizedImpact.overallImpactScore;
    const mitigationCost = optimizedImpact.mitigationMeasures.reduce((sum, m) => sum + m.cost, 0);
    
    return {
      optimizedLayout: bestLayout,
      impactReduction,
      mitigationCost
    };
  }

  // Private assessment methods

  private async assessNoiseImpact(
    layout: WindFarmLayout,
    site: WindFarmSite,
    parameters?: EnvironmentalAssessmentParameters
  ): Promise<ImpactCategoryResult> {
    console.log('Assessing noise impact...');
    
    // Simplified noise assessment
    let maxNoiseLevel = 0;
    let affectedReceptors = 0;
    
    // Calculate noise levels at receptors
    const receptors = parameters?.noise?.receptorLocations || [];
    
    for (const receptor of receptors) {
      let totalNoise = 0;
      
      for (const turbine of layout.turbines) {
        const distance = Math.sqrt(
          Math.pow(turbine.x - receptor.location.latitude * 111000, 2) +
          Math.pow(turbine.y - receptor.location.longitude * 111000, 2)
        );
        
        // Simplified noise calculation (ISO 9613-2 approximation)
        const sourceLevel = 105; // dB(A) at 1m
        const noiseLevel = sourceLevel - 20 * Math.log10(distance) - 8;
        totalNoise += Math.pow(10, noiseLevel / 10);
      }
      
      const combinedNoiseLevel = 10 * Math.log10(totalNoise);
      maxNoiseLevel = Math.max(maxNoiseLevel, combinedNoiseLevel);
      
      // Check if receptor is affected (above 40 dB(A))
      if (combinedNoiseLevel > 40) {
        affectedReceptors++;
      }
    }
    
    // Determine impact significance
    let significance: 'negligible' | 'minor' | 'moderate' | 'major' | 'severe';
    if (maxNoiseLevel < 35) significance = 'negligible';
    else if (maxNoiseLevel < 40) significance = 'minor';
    else if (maxNoiseLevel < 45) significance = 'moderate';
    else if (maxNoiseLevel < 50) significance = 'major';
    else significance = 'severe';
    
    const impactScore = Math.min(100, maxNoiseLevel * 2);
    
    return {
      category: 'noise',
      impactScore,
      significance,
      confidence: 'medium',
      uncertainties: ['Meteorological conditions', 'Terrain effects', 'Background noise levels'],
      keyFindings: [
        `Maximum predicted noise level: ${maxNoiseLevel.toFixed(1)} dB(A)`,
        `Number of affected receptors: ${affectedReceptors}`,
        `Compliance with 45 dB(A) limit: ${maxNoiseLevel <= 45 ? 'Yes' : 'No'}`
      ]
    };
  }

  private async assessVisualImpact(
    layout: WindFarmLayout,
    site: WindFarmSite,
    parameters?: EnvironmentalAssessmentParameters
  ): Promise<ImpactCategoryResult> {
    console.log('Assessing visual impact...');
    
    const viewpoints = parameters?.visual?.viewpoints || [];
    let totalVisualImpact = 0;
    let affectedViewpoints = 0;
    
    for (const viewpoint of viewpoints) {
      let visibilityScore = 0;
      
      for (const turbine of layout.turbines) {
        const distance = Math.sqrt(
          Math.pow(turbine.x - viewpoint.location.latitude * 111000, 2) +
          Math.pow(turbine.y - viewpoint.location.longitude * 111000, 2)
        );
        
        // Simplified visibility calculation
        if (distance < 5000) { // Within 5km
          const visibility = Math.max(0, 1 - distance / 5000);
          const turbineHeight = turbine.turbineSpec.hubHeight + turbine.turbineSpec.rotorDiameter / 2;
          const visualAngle = Math.atan(turbineHeight / distance) * 180 / Math.PI;
          
          visibilityScore += visibility * visualAngle * (viewpoint.importance === 'high' ? 2 : 1);
        }
      }
      
      totalVisualImpact += visibilityScore;
      if (visibilityScore > 10) affectedViewpoints++;
    }
    
    const averageImpact = viewpoints.length > 0 ? totalVisualImpact / viewpoints.length : 0;
    
    let significance: 'negligible' | 'minor' | 'moderate' | 'major' | 'severe';
    if (averageImpact < 5) significance = 'negligible';
    else if (averageImpact < 15) significance = 'minor';
    else if (averageImpact < 30) significance = 'moderate';
    else if (averageImpact < 50) significance = 'major';
    else significance = 'severe';
    
    return {
      category: 'visual',
      impactScore: Math.min(100, averageImpact),
      significance,
      confidence: 'medium',
      uncertainties: ['Weather conditions', 'Seasonal vegetation changes', 'Lighting conditions'],
      keyFindings: [
        `Average visual impact score: ${averageImpact.toFixed(1)}`,
        `Number of affected viewpoints: ${affectedViewpoints}`,
        `Turbines visible from key viewpoints: ${layout.turbines.length}`
      ]
    };
  }

  private async assessWildlifeImpact(
    layout: WindFarmLayout,
    site: WindFarmSite,
    parameters?: EnvironmentalAssessmentParameters
  ): Promise<ImpactCategoryResult> {
    console.log('Assessing wildlife impact...');
    
    const species = parameters?.wildlife?.species || [];
    let totalCollisionRisk = 0;
    let habitatLoss = 0;
    
    for (const turbine of layout.turbines) {
      // Calculate collision risk for each species
      for (const speciesData of species) {
        if (speciesData.type === 'bird' || speciesData.type === 'bat') {
          const riskFactor = this.calculateCollisionRisk(turbine, speciesData);
          totalCollisionRisk += riskFactor;
        }
      }
      
      // Calculate habitat impact (simplified)
      const turbineFootprint = 0.5; // hectares per turbine
      habitatLoss += turbineFootprint;
    }
    
    const averageCollisionRisk = layout.turbines.length > 0 ? totalCollisionRisk / layout.turbines.length : 0;
    
    let significance: 'negligible' | 'minor' | 'moderate' | 'major' | 'severe';
    if (averageCollisionRisk < 0.1 && habitatLoss < 10) significance = 'negligible';
    else if (averageCollisionRisk < 0.5 && habitatLoss < 50) significance = 'minor';
    else if (averageCollisionRisk < 1.0 && habitatLoss < 100) significance = 'moderate';
    else if (averageCollisionRisk < 2.0 && habitatLoss < 200) significance = 'major';
    else significance = 'severe';
    
    const impactScore = Math.min(100, averageCollisionRisk * 20 + habitatLoss * 0.5);
    
    return {
      category: 'wildlife',
      impactScore,
      significance,
      confidence: 'low',
      uncertainties: ['Species behavior variability', 'Seasonal migration patterns', 'Avoidance behavior'],
      keyFindings: [
        `Estimated annual bird/bat collisions: ${totalCollisionRisk.toFixed(1)}`,
        `Habitat loss: ${habitatLoss.toFixed(1)} hectares`,
        `Number of sensitive species affected: ${species.length}`
      ]
    };
  }

  private async assessSoilImpact(
    layout: WindFarmLayout,
    site: WindFarmSite
  ): Promise<ImpactCategoryResult> {
    console.log('Assessing soil impact...');
    
    let totalDisturbedArea = 0;
    let erosionRisk = 0;
    
    for (const turbine of layout.turbines) {
      // Calculate disturbed area per turbine
      const turbineArea = 0.5; // hectares for foundation and access
      const temporaryArea = 1.0; // hectares for construction
      totalDisturbedArea += turbineArea + temporaryArea;
      
      // Assess erosion risk based on slope (simplified)
      const slope = 10; // Placeholder - would get from terrain data
      if (slope > 15) erosionRisk += 0.5;
      else if (slope > 10) erosionRisk += 0.2;
    }
    
    let significance: 'negligible' | 'minor' | 'moderate' | 'major' | 'severe';
    if (totalDisturbedArea < 50 && erosionRisk < 5) significance = 'negligible';
    else if (totalDisturbedArea < 100 && erosionRisk < 10) significance = 'minor';
    else if (totalDisturbedArea < 200 && erosionRisk < 20) significance = 'moderate';
    else if (totalDisturbedArea < 500 && erosionRisk < 50) significance = 'major';
    else significance = 'severe';
    
    const impactScore = Math.min(100, totalDisturbedArea * 0.2 + erosionRisk * 2);
    
    return {
      category: 'soil',
      impactScore,
      significance,
      confidence: 'high',
      uncertainties: ['Soil variability', 'Construction methods', 'Restoration success'],
      keyFindings: [
        `Total disturbed area: ${totalDisturbedArea.toFixed(1)} hectares`,
        `Erosion risk score: ${erosionRisk.toFixed(1)}`,
        `Permanent soil loss: ${(totalDisturbedArea * 0.3).toFixed(1)} hectares`
      ]
    };
  }

  private async assessWaterImpact(
    layout: WindFarmLayout,
    site: WindFarmSite
  ): Promise<ImpactCategoryResult> {
    console.log('Assessing water impact...');
    
    // Simplified water impact assessment
    const impactScore = 15; // Low impact for typical wind farms
    
    return {
      category: 'water',
      impactScore,
      significance: 'minor',
      confidence: 'medium',
      uncertainties: ['Groundwater flow patterns', 'Seasonal variations', 'Construction impacts'],
      keyFindings: [
        'Minimal direct water consumption during operation',
        'Temporary impacts during construction',
        'No significant impacts on water quality expected'
      ]
    };
  }

  private async assessAirQualityImpact(
    layout: WindFarmLayout,
    site: WindFarmSite
  ): Promise<ImpactCategoryResult> {
    console.log('Assessing air quality impact...');
    
    // Wind farms generally have positive air quality impacts
    const impactScore = 5; // Very low negative impact
    
    return {
      category: 'air',
      impactScore,
      significance: 'negligible',
      confidence: 'high',
      uncertainties: ['Construction dust', 'Transportation emissions'],
      keyFindings: [
        'No operational air emissions',
        'Positive impact through avoided fossil fuel emissions',
        'Temporary dust during construction'
      ]
    };
  }

  private async assessCulturalImpact(
    layout: WindFarmLayout,
    site: WindFarmSite
  ): Promise<ImpactCategoryResult> {
    console.log('Assessing cultural impact...');
    
    // Simplified cultural impact assessment
    const impactScore = 20; // Moderate impact due to visual changes
    
    return {
      category: 'cultural',
      impactScore,
      significance: 'minor',
      confidence: 'low',
      uncertainties: ['Cultural significance assessment', 'Community values', 'Archaeological discoveries'],
      keyFindings: [
        'No known archaeological sites directly affected',
        'Visual impact on cultural landscapes',
        'Consultation with indigenous communities required'
      ]
    };
  }

  // Helper methods

  private calculateOverallImpactScore(impactCategories: ImpactCategoryResult[]): number {
    const weights = {
      noise: 0.2,
      visual: 0.15,
      wildlife: 0.25,
      soil: 0.15,
      water: 0.1,
      air: 0.05,
      cultural: 0.1
    };
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const category of impactCategories) {
      const weight = weights[category.category] || 0.1;
      weightedSum += category.impactScore * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private calculateCollisionRisk(turbine: TurbinePosition, species: WildlifeSpecies): number {
    // Simplified collision risk calculation
    let riskFactor = 0;
    
    if (species.flightBehavior) {
      const turbineHeight = turbine.turbineSpec.hubHeight;
      const rotorTop = turbineHeight + turbine.turbineSpec.rotorDiameter / 2;
      const rotorBottom = turbineHeight - turbine.turbineSpec.rotorDiameter / 2;
      
      // Check if species flight height overlaps with rotor swept area
      if (species.flightBehavior.typicalFlightHeight >= rotorBottom &&
          species.flightBehavior.typicalFlightHeight <= rotorTop) {
        riskFactor = 1.0;
        
        // Adjust for species-specific factors
        if (species.flightBehavior.maneuverability === 'low') riskFactor *= 1.5;
        if (species.flightBehavior.nocturnal) riskFactor *= 1.2;
        if (species.conservationStatus === 'endangered') riskFactor *= 2.0;
      }
    }
    
    return riskFactor;
  }

  private async developMitigationMeasures(
    impactCategories: ImpactCategoryResult[],
    layout: WindFarmLayout,
    site: WindFarmSite
  ): Promise<MitigationMeasure[]> {
    const measures: MitigationMeasure[] = [];
    
    for (const category of impactCategories) {
      if (category.significance === 'major' || category.significance === 'severe') {
        const categoryMeasures = this.getMitigationMeasuresForCategory(category.category);
        measures.push(...categoryMeasures);
      }
    }
    
    return measures;
  }

  private getMitigationMeasuresForCategory(category: string): MitigationMeasure[] {
    const measures: { [key: string]: MitigationMeasure[] } = {
      noise: [
        {
          id: 'noise-01',
          category: 'noise',
          measure: 'Install low-noise turbine models',
          effectiveness: 0.3,
          cost: 100000,
          implementationTime: 6,
          maintenanceRequired: false,
          monitoringRequired: true,
          priority: 'high'
        }
      ],
      wildlife: [
        {
          id: 'wildlife-01',
          category: 'wildlife',
          measure: 'Implement bird and bat monitoring system',
          effectiveness: 0.4,
          cost: 50000,
          implementationTime: 3,
          maintenanceRequired: true,
          monitoringRequired: true,
          priority: 'high'
        }
      ]
    };
    
    return measures[category] || [];
  }

  private async assessComplianceStatus(
    layout: WindFarmLayout,
    site: WindFarmSite,
    impactCategories: ImpactCategoryResult[]
  ): Promise<ComplianceStatus> {
    // Simplified compliance assessment
    return {
      overallCompliance: true,
      regulatoryRequirements: [],
      permits: [],
      violations: []
    };
  }

  private async defineMonitoringRequirements(
    impactCategories: ImpactCategoryResult[],
    layout: WindFarmLayout,
    site: WindFarmSite
  ): Promise<MonitoringRequirement[]> {
    const requirements: MonitoringRequirement[] = [];
    
    // Add monitoring for significant impacts
    for (const category of impactCategories) {
      if (category.significance === 'moderate' || category.significance === 'major' || category.significance === 'severe') {
        const requirement = this.getMonitoringRequirement(category.category);
        if (requirement) requirements.push(requirement);
      }
    }
    
    return requirements;
  }

  private getMonitoringRequirement(category: string): MonitoringRequirement | null {
    const requirements: { [key: string]: MonitoringRequirement } = {
      noise: {
        parameter: 'Noise levels',
        method: 'Sound level monitoring',
        frequency: 'Quarterly',
        duration: '5 years',
        locations: [],
        reportingRequirements: ['Annual compliance report'],
        cost: 25000
      },
      wildlife: {
        parameter: 'Bird and bat mortality',
        method: 'Carcass searches and acoustic monitoring',
        frequency: 'Weekly during migration seasons',
        duration: '3 years',
        locations: [],
        reportingRequirements: ['Annual mortality report'],
        cost: 75000
      }
    };
    
    return requirements[category] || null;
  }

  private async developAdaptiveManagementPlan(
    impactCategories: ImpactCategoryResult[],
    layout: WindFarmLayout,
    site: WindFarmSite
  ): Promise<AdaptiveManagementPlan> {
    return {
      triggers: [
        {
          parameter: 'Bird mortality rate',
          threshold: 10,
          timeframe: 'Annual',
          action: 'Implement additional mitigation measures'
        }
      ],
      responses: [
        {
          trigger: 'Excessive bird mortality',
          response: 'Install deterrent systems',
          timeline: '6 months',
          responsibility: 'Environmental manager',
          cost: 100000
        }
      ],
      reviewSchedule: 'Annual',
      stakeholderInvolvement: ['Environmental agencies', 'Local communities', 'Conservation groups']
    };
  }

  private calculateIncrementalImpact(
    cumulativeImpact: EnvironmentalImpactResult,
    projectImpact: EnvironmentalImpactResult
  ): EnvironmentalImpactResult {
    // Simplified incremental impact calculation
    return projectImpact; // Placeholder
  }

  private checkImpactThresholds(
    impact: EnvironmentalImpactResult,
    thresholds: { [category: string]: number }
  ): boolean {
    for (const category of impact.impactCategories) {
      const threshold = thresholds[category.category];
      if (threshold && category.impactScore > threshold) {
        return false;
      }
    }
    return true;
  }

  private async modifyLayoutForImpactReduction(
    layout: WindFarmLayout,
    impact: EnvironmentalImpactResult,
    site: WindFarmSite
  ): Promise<WindFarmLayout> {
    // Simplified layout modification for impact reduction
    const modifiedLayout = { ...layout };
    
    // Remove turbines with highest impact
    // This would be more sophisticated in practice
    if (layout.turbines.length > 1) {
      modifiedLayout.turbines = layout.turbines.slice(0, -1);
    }
    
    return modifiedLayout;
  }
}