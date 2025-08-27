/**
 * Optimization Recommendations Component
 * 
 * Analyzes energy harvesting data and provides intelligent recommendations
 * for optimizing the energy harvesting process.
 */

import { 
  OptimizationSuggestion, 
  RealTimeEnergyData, 
  StorageData, 
  UsageStatistics,
  EnergyMonitoringData 
} from './types';

export interface OptimizationContext {
  /** Current energy data */
  energyData: RealTimeEnergyData;
  /** Storage information */
  storageData: StorageData;
  /** Usage statistics */
  usageStats: UsageStatistics;
  /** Historical performance data */
  historicalData: Array<{
    timestamp: number;
    power: number;
    efficiency: number;
    conditions: any;
  }>;
}

export interface RecommendationCategory {
  /** Category identifier */
  id: string;
  /** Category name */
  name: string;
  /** Category description */
  description: string;
  /** Number of recommendations in this category */
  count: number;
  /** Priority level of this category */
  priority: number;
  /** Icon or visual identifier */
  icon: string;
}

export interface OptimizationReport {
  /** Overall optimization score (0-100) */
  optimizationScore: number;
  /** Total potential energy savings */
  totalPotentialSavings: number;
  /** Recommendations by category */
  categories: RecommendationCategory[];
  /** Top priority recommendations */
  topRecommendations: OptimizationSuggestion[];
  /** Quick wins (easy to implement) */
  quickWins: OptimizationSuggestion[];
  /** Long-term improvements */
  longTermImprovements: OptimizationSuggestion[];
}

export interface PerformanceInsight {
  /** Insight identifier */
  id: string;
  /** Insight type */
  type: 'opportunity' | 'warning' | 'achievement' | 'trend';
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Data supporting the insight */
  supportingData: any;
  /** Confidence level (0-1) */
  confidence: number;
  /** Actionable recommendations */
  actions: string[];
}

export class OptimizationRecommendations {
  private recommendations: OptimizationSuggestion[] = [];
  private insights: PerformanceInsight[] = [];
  private lastAnalysisTime: number = 0;
  private analysisInterval: number = 300000; // 5 minutes
  private learningData: Map<string, any> = new Map();

  constructor() {
    this.initializeRecommendationTemplates();
  }

  /**
   * Generate optimization recommendations based on current data
   */
  public generateRecommendations(context: OptimizationContext): OptimizationSuggestion[] {
    const now = Date.now();
    
    // Only regenerate if enough time has passed
    if (now - this.lastAnalysisTime < this.analysisInterval) {
      return this.recommendations;
    }

    this.recommendations = [];
    
    // Analyze different aspects of the system
    this.analyzeEnergyGeneration(context);
    this.analyzeSystemEfficiency(context);
    this.analyzeDrivingPatterns(context);
    this.analyzeMaintenanceNeeds(context);
    this.analyzeBatteryOptimization(context);
    this.analyzeEnvironmentalFactors(context);

    // Sort recommendations by priority and potential impact
    this.recommendations.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return b.potentialSavings - a.potentialSavings; // Higher savings first
    });

    this.lastAnalysisTime = now;
    return this.recommendations;
  }

  /**
   * Get comprehensive optimization report
   */
  public getOptimizationReport(context: OptimizationContext): OptimizationReport {
    const recommendations = this.generateRecommendations(context);
    
    // Calculate optimization score
    const optimizationScore = this.calculateOptimizationScore(context);
    
    // Calculate total potential savings
    const totalPotentialSavings = recommendations.reduce(
      (total, rec) => total + rec.potentialSavings, 0
    );

    // Group recommendations by category
    const categories = this.groupRecommendationsByCategory(recommendations);
    
    // Identify top recommendations
    const topRecommendations = recommendations.slice(0, 5);
    
    // Identify quick wins
    const quickWins = recommendations.filter(
      rec => rec.difficulty <= 2 && rec.implementationTime <= 2
    ).slice(0, 3);
    
    // Identify long-term improvements
    const longTermImprovements = recommendations.filter(
      rec => rec.difficulty >= 4 || rec.implementationTime >= 8
    ).slice(0, 3);

    return {
      optimizationScore,
      totalPotentialSavings,
      categories,
      topRecommendations,
      quickWins,
      longTermImprovements
    };
  }

  /**
   * Get performance insights
   */
  public getPerformanceInsights(context: OptimizationContext): PerformanceInsight[] {
    this.insights = [];
    
    this.generateEfficiencyInsights(context);
    this.generateTrendInsights(context);
    this.generateOpportunityInsights(context);
    this.generateWarningInsights(context);
    
    return this.insights.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get personalized recommendations based on user behavior
   */
  public getPersonalizedRecommendations(
    context: OptimizationContext,
    userProfile: {
      drivingStyle: 'aggressive' | 'moderate' | 'conservative';
      primaryUse: 'commuting' | 'leisure' | 'commercial';
      techSavviness: 'low' | 'medium' | 'high';
      maintenancePreference: 'minimal' | 'regular' | 'proactive';
    }
  ): OptimizationSuggestion[] {
    const allRecommendations = this.generateRecommendations(context);
    
    return allRecommendations.filter(rec => {
      // Filter based on user profile
      if (userProfile.techSavviness === 'low' && rec.difficulty > 3) {
        return false;
      }
      
      if (userProfile.maintenancePreference === 'minimal' && rec.category === 'maintenance') {
        return false;
      }
      
      return true;
    }).map(rec => {
      // Adjust recommendations based on user profile
      const adjustedRec = { ...rec };
      
      if (userProfile.drivingStyle === 'aggressive' && rec.category === 'driving') {
        adjustedRec.potentialSavings *= 1.2; // Higher potential for aggressive drivers
      }
      
      return adjustedRec;
    });
  }

  /**
   * Learn from user actions and feedback
   */
  public recordUserAction(
    recommendationId: string, 
    action: 'implemented' | 'dismissed' | 'postponed',
    feedback?: {
      effectiveness: number; // 1-5 scale
      difficulty: number; // 1-5 scale
      comments?: string;
    }
  ): void {
    const learningKey = `recommendation_${recommendationId}`;
    const existingData = this.learningData.get(learningKey) || {
      implementations: 0,
      dismissals: 0,
      postponements: 0,
      feedbacks: []
    };

    switch (action) {
      case 'implemented':
        existingData.implementations++;
        break;
      case 'dismissed':
        existingData.dismissals++;
        break;
      case 'postponed':
        existingData.postponements++;
        break;
    }

    if (feedback) {
      existingData.feedbacks.push({
        ...feedback,
        timestamp: Date.now()
      });
    }

    this.learningData.set(learningKey, existingData);
  }

  /**
   * Get recommendation effectiveness metrics
   */
  public getRecommendationMetrics(): {
    totalRecommendations: number;
    implementationRate: number;
    averageEffectiveness: number;
    topPerformingCategories: string[];
  } {
    let totalRecommendations = 0;
    let totalImplementations = 0;
    let totalEffectiveness = 0;
    let effectivenessCount = 0;
    const categoryPerformance = new Map<string, number>();

    this.learningData.forEach((data, key) => {
      totalRecommendations++;
      totalImplementations += data.implementations;
      
      data.feedbacks.forEach((feedback: any) => {
        totalEffectiveness += feedback.effectiveness;
        effectivenessCount++;
      });

      // Extract category from key and track performance
      const category = key.split('_')[1] || 'unknown';
      const performance = data.implementations / (data.implementations + data.dismissals + 1);
      categoryPerformance.set(category, (categoryPerformance.get(category) || 0) + performance);
    });

    const implementationRate = totalRecommendations > 0 ? 
      totalImplementations / totalRecommendations : 0;
    
    const averageEffectiveness = effectivenessCount > 0 ? 
      totalEffectiveness / effectivenessCount : 0;

    const topPerformingCategories = Array.from(categoryPerformance.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    return {
      totalRecommendations,
      implementationRate,
      averageEffectiveness,
      topPerformingCategories
    };
  }

  /**
   * Initialize recommendation templates
   */
  private initializeRecommendationTemplates(): void {
    // This would typically load from a configuration file or database
    // For now, we'll initialize with some basic templates
  }

  /**
   * Analyze energy generation patterns
   */
  private analyzeEnergyGeneration(context: OptimizationContext): void {
    const { energyData, usageStats } = context;
    
    // Check if energy generation is below potential
    if (energyData.overallEfficiency < 0.7) {
      this.recommendations.push({
        id: `energy-gen-${Date.now()}`,
        priority: 4,
        category: 'efficiency',
        title: 'Improve Energy Generation Efficiency',
        description: `Current system efficiency is ${Math.round(energyData.overallEfficiency * 100)}%. Consider optimizing damping settings and checking system components.`,
        potentialSavings: usageStats.dailyEnergyHarvested * 0.2, // 20% improvement potential
        difficulty: 3,
        implementationTime: 4,
        userActionable: true
      });
    }

    // Check power distribution balance
    const powerSources = energyData.powerBySource;
    const totalPower = energyData.totalPowerGeneration;
    
    if (totalPower > 0) {
      const imbalanceThreshold = 0.1; // 10%
      const expectedShare = 1 / Object.keys(powerSources).length;
      
      Object.entries(powerSources).forEach(([source, power]) => {
        const actualShare = power / totalPower;
        if (Math.abs(actualShare - expectedShare) > imbalanceThreshold && power < totalPower * 0.1) {
          this.recommendations.push({
            id: `power-balance-${source}-${Date.now()}`,
            priority: 3,
            category: 'system',
            title: `Optimize ${source.replace(/([A-Z])/g, ' $1').trim()}`,
            description: `This energy source is underperforming. Check connections and calibration.`,
            potentialSavings: totalPower * 0.1,
            difficulty: 3,
            implementationTime: 2,
            userActionable: false
          });
        }
      });
    }
  }

  /**
   * Analyze system efficiency
   */
  private analyzeSystemEfficiency(context: OptimizationContext): void {
    const { energyData, usageStats } = context;
    
    // Temperature optimization
    if (energyData.operatingConditions.systemTemperature > 70) {
      this.recommendations.push({
        id: `temp-opt-${Date.now()}`,
        priority: 4,
        category: 'efficiency',
        title: 'Reduce System Operating Temperature',
        description: `System temperature is ${energyData.operatingConditions.systemTemperature.toFixed(1)}°C. Improved cooling could increase efficiency by 5-10%.`,
        potentialSavings: usageStats.dailyEnergyHarvested * 0.08,
        difficulty: 4,
        implementationTime: 6,
        userActionable: false
      });
    }

    // Efficiency trend analysis
    const efficiencyTrend = usageStats.efficiencyTrends;
    if (efficiencyTrend.weekly < efficiencyTrend.monthly * 0.95) {
      this.recommendations.push({
        id: `efficiency-decline-${Date.now()}`,
        priority: 3,
        category: 'maintenance',
        title: 'Address Efficiency Decline',
        description: 'System efficiency has decreased recently. Schedule maintenance check.',
        potentialSavings: usageStats.dailyEnergyHarvested * 0.1,
        difficulty: 2,
        implementationTime: 3,
        userActionable: true
      });
    }
  }

  /**
   * Analyze driving patterns
   */
  private analyzeDrivingPatterns(context: OptimizationContext): void {
    const { energyData, usageStats } = context;
    
    // Speed optimization
    const vehicleSpeed = energyData.operatingConditions.vehicleSpeed;
    if (vehicleSpeed > 100) {
      this.recommendations.push({
        id: `speed-opt-${Date.now()}`,
        priority: 2,
        category: 'driving',
        title: 'Optimize Driving Speed for Energy Harvesting',
        description: `Current speed (${vehicleSpeed} km/h) is above optimal range. Moderate speeds (60-80 km/h) maximize energy generation.`,
        potentialSavings: usageStats.dailyEnergyHarvested * 0.15,
        difficulty: 1,
        implementationTime: 0,
        userActionable: true
      });
    }

    // Road condition optimization
    const roadCondition = energyData.operatingConditions.roadCondition;
    if (roadCondition === 'smooth') {
      this.recommendations.push({
        id: `road-opt-${Date.now()}`,
        priority: 2,
        category: 'driving',
        title: 'Consider Alternative Routes',
        description: 'Smooth roads provide less energy harvesting opportunity. Routes with moderate roughness can increase generation by 20-30%.',
        potentialSavings: usageStats.dailyEnergyHarvested * 0.25,
        difficulty: 2,
        implementationTime: 1,
        userActionable: true
      });
    }
  }

  /**
   * Analyze maintenance needs
   */
  private analyzeMaintenanceNeeds(context: OptimizationContext): void {
    const { usageStats } = context;
    
    // Operating time analysis
    const operatingHours = usageStats.operatingTime.totalOperatingHours;
    if (operatingHours > 1000) { // After 1000 hours of operation
      this.recommendations.push({
        id: `maintenance-schedule-${Date.now()}`,
        priority: 3,
        category: 'maintenance',
        title: 'Schedule Preventive Maintenance',
        description: `System has operated for ${Math.round(operatingHours)} hours. Preventive maintenance can maintain optimal performance.`,
        potentialSavings: usageStats.dailyEnergyHarvested * 0.05,
        difficulty: 2,
        implementationTime: 4,
        userActionable: true
      });
    }

    // System uptime analysis
    if (usageStats.operatingTime.systemUptime < 0.95) {
      this.recommendations.push({
        id: `uptime-improvement-${Date.now()}`,
        priority: 4,
        category: 'maintenance',
        title: 'Improve System Reliability',
        description: `System uptime is ${Math.round(usageStats.operatingTime.systemUptime * 100)}%. Investigate and resolve reliability issues.`,
        potentialSavings: usageStats.dailyEnergyHarvested * 0.1,
        difficulty: 4,
        implementationTime: 8,
        userActionable: false
      });
    }
  }

  /**
   * Analyze battery optimization opportunities
   */
  private analyzeBatteryOptimization(context: OptimizationContext): void {
    const { storageData, usageStats } = context;
    
    // Battery health optimization
    if (storageData.batteryHealth < 0.8) {
      this.recommendations.push({
        id: `battery-health-${Date.now()}`,
        priority: 4,
        category: 'maintenance',
        title: 'Optimize Battery Health',
        description: `Battery health is ${Math.round(storageData.batteryHealth * 100)}%. Consider battery conditioning or replacement.`,
        potentialSavings: usageStats.dailyEnergyHarvested * 0.15,
        difficulty: 3,
        implementationTime: 6,
        userActionable: true
      });
    }

    // Charging pattern optimization
    if (storageData.batterySOC < 0.3) {
      this.recommendations.push({
        id: `charging-pattern-${Date.now()}`,
        priority: 3,
        category: 'efficiency',
        title: 'Optimize Charging Patterns',
        description: 'Frequent deep discharges reduce battery life. Maintain charge above 30% when possible.',
        potentialSavings: usageStats.dailyEnergyHarvested * 0.05,
        difficulty: 1,
        implementationTime: 0,
        userActionable: true
      });
    }

    // Temperature management
    if (storageData.batteryTemperature > 35) {
      this.recommendations.push({
        id: `battery-temp-${Date.now()}`,
        priority: 3,
        category: 'efficiency',
        title: 'Manage Battery Temperature',
        description: `Battery temperature is ${storageData.batteryTemperature.toFixed(1)}°C. Cooler temperatures improve efficiency and longevity.`,
        potentialSavings: usageStats.dailyEnergyHarvested * 0.08,
        difficulty: 3,
        implementationTime: 4,
        userActionable: false
      });
    }
  }

  /**
   * Analyze environmental factors
   */
  private analyzeEnvironmentalFactors(context: OptimizationContext): void {
    const { energyData } = context;
    
    // Ambient temperature effects
    const ambientTemp = energyData.operatingConditions.ambientTemperature;
    if (ambientTemp > 30) {
      this.recommendations.push({
        id: `ambient-temp-${Date.now()}`,
        priority: 2,
        category: 'efficiency',
        title: 'Consider Environmental Conditions',
        description: `High ambient temperature (${ambientTemp.toFixed(1)}°C) affects system efficiency. Plan trips during cooler periods when possible.`,
        potentialSavings: 0, // Informational recommendation
        difficulty: 1,
        implementationTime: 0,
        userActionable: true
      });
    }
  }

  /**
   * Calculate overall optimization score
   */
  private calculateOptimizationScore(context: OptimizationContext): number {
    const { energyData, storageData, usageStats } = context;
    
    let score = 100;
    
    // Deduct points for low efficiency
    if (energyData.overallEfficiency < 0.8) {
      score -= (0.8 - energyData.overallEfficiency) * 50;
    }
    
    // Deduct points for poor battery health
    if (storageData.batteryHealth < 0.9) {
      score -= (0.9 - storageData.batteryHealth) * 30;
    }
    
    // Deduct points for low system uptime
    if (usageStats.operatingTime.systemUptime < 0.95) {
      score -= (0.95 - usageStats.operatingTime.systemUptime) * 20;
    }
    
    // Deduct points for high temperature
    if (energyData.operatingConditions.systemTemperature > 70) {
      score -= (energyData.operatingConditions.systemTemperature - 70) * 0.5;
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Group recommendations by category
   */
  private groupRecommendationsByCategory(recommendations: OptimizationSuggestion[]): RecommendationCategory[] {
    const categories = new Map<string, RecommendationCategory>();
    
    recommendations.forEach(rec => {
      if (!categories.has(rec.category)) {
        categories.set(rec.category, {
          id: rec.category,
          name: this.getCategoryName(rec.category),
          description: this.getCategoryDescription(rec.category),
          count: 0,
          priority: 0,
          icon: this.getCategoryIcon(rec.category)
        });
      }
      
      const category = categories.get(rec.category)!;
      category.count++;
      category.priority = Math.max(category.priority, rec.priority);
    });
    
    return Array.from(categories.values()).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get category display name
   */
  private getCategoryName(category: string): string {
    const names: { [key: string]: string } = {
      'efficiency': 'System Efficiency',
      'maintenance': 'Maintenance',
      'driving': 'Driving Optimization',
      'system': 'System Configuration'
    };
    return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }

  /**
   * Get category description
   */
  private getCategoryDescription(category: string): string {
    const descriptions: { [key: string]: string } = {
      'efficiency': 'Recommendations to improve energy generation and system efficiency',
      'maintenance': 'Maintenance and service recommendations to keep the system optimal',
      'driving': 'Driving pattern optimizations to maximize energy harvesting',
      'system': 'System configuration and setup optimizations'
    };
    return descriptions[category] || `Recommendations for ${category}`;
  }

  /**
   * Get category icon
   */
  private getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'efficiency': '⚡',
      'maintenance': '🔧',
      'driving': '🚗',
      'system': '⚙️'
    };
    return icons[category] || '📋';
  }

  /**
   * Generate efficiency insights
   */
  private generateEfficiencyInsights(context: OptimizationContext): void {
    const { energyData, usageStats } = context;
    
    if (energyData.overallEfficiency > 0.85) {
      this.insights.push({
        id: `efficiency-excellent-${Date.now()}`,
        type: 'achievement',
        title: 'Excellent System Efficiency',
        description: `Your system is operating at ${Math.round(energyData.overallEfficiency * 100)}% efficiency, which is excellent!`,
        supportingData: { efficiency: energyData.overallEfficiency },
        confidence: 0.9,
        actions: ['Maintain current operating conditions', 'Share best practices']
      });
    }
    
    if (usageStats.efficiencyTrends.weekly > usageStats.efficiencyTrends.monthly) {
      this.insights.push({
        id: `efficiency-improving-${Date.now()}`,
        type: 'trend',
        title: 'Efficiency Improving',
        description: 'Your system efficiency has been improving over the past week.',
        supportingData: { 
          weekly: usageStats.efficiencyTrends.weekly,
          monthly: usageStats.efficiencyTrends.monthly
        },
        confidence: 0.8,
        actions: ['Continue current practices', 'Monitor for sustained improvement']
      });
    }
  }

  /**
   * Generate trend insights
   */
  private generateTrendInsights(context: OptimizationContext): void {
    const { usageStats } = context;
    
    if (usageStats.weeklyEnergyHarvested > usageStats.averageDailyGeneration * 7 * 1.1) {
      this.insights.push({
        id: `energy-trend-up-${Date.now()}`,
        type: 'trend',
        title: 'Energy Generation Trending Up',
        description: 'Your weekly energy generation is 10% above average.',
        supportingData: { 
          weekly: usageStats.weeklyEnergyHarvested,
          average: usageStats.averageDailyGeneration * 7
        },
        confidence: 0.85,
        actions: ['Identify what changed', 'Maintain successful practices']
      });
    }
  }

  /**
   * Generate opportunity insights
   */
  private generateOpportunityInsights(context: OptimizationContext): void {
    const { energyData, usageStats } = context;
    
    if (energyData.operatingConditions.roadCondition === 'rough' && energyData.totalPowerGeneration < usageStats.peakPowerToday * 0.8) {
      this.insights.push({
        id: `opportunity-rough-road-${Date.now()}`,
        type: 'opportunity',
        title: 'Untapped Energy Potential',
        description: 'Current rough road conditions could generate more energy with optimized settings.',
        supportingData: { 
          currentPower: energyData.totalPowerGeneration,
          peakPower: usageStats.peakPowerToday
        },
        confidence: 0.7,
        actions: ['Adjust damping settings', 'Enable energy harvesting mode']
      });
    }
  }

  /**
   * Generate warning insights
   */
  private generateWarningInsights(context: OptimizationContext): void {
    const { energyData, storageData } = context;
    
    if (energyData.operatingConditions.systemTemperature > 80) {
      this.insights.push({
        id: `warning-high-temp-${Date.now()}`,
        type: 'warning',
        title: 'High System Temperature Detected',
        description: `System temperature of ${energyData.operatingConditions.systemTemperature.toFixed(1)}°C may reduce efficiency and component life.`,
        supportingData: { temperature: energyData.operatingConditions.systemTemperature },
        confidence: 0.95,
        actions: ['Reduce system load', 'Check cooling system', 'Monitor temperature']
      });
    }
    
    if (storageData.batteryHealth < 0.7) {
      this.insights.push({
        id: `warning-battery-health-${Date.now()}`,
        type: 'warning',
        title: 'Battery Health Declining',
        description: `Battery health at ${Math.round(storageData.batteryHealth * 100)}% requires attention.`,
        supportingData: { batteryHealth: storageData.batteryHealth },
        confidence: 0.9,
        actions: ['Schedule battery inspection', 'Consider replacement', 'Optimize charging patterns']
      });
    }
  }
}