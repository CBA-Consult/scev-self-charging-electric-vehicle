/**
 * Usage Statistics Tracker Component
 * 
 * Tracks and analyzes energy usage patterns, efficiency trends, and performance metrics.
 */

import { UsageStatistics, HistoricalDataPoint, PerformanceMetrics, DashboardConfiguration } from './types';

export interface StatisticsTimeframe {
  /** Timeframe identifier */
  id: string;
  /** Display name */
  name: string;
  /** Duration in milliseconds */
  duration: number;
  /** Data points for this timeframe */
  dataPoints: HistoricalDataPoint[];
}

export interface EnergyUsagePattern {
  /** Pattern identifier */
  patternId: string;
  /** Pattern name */
  name: string;
  /** Time of day when pattern occurs */
  timeOfDay: { start: number; end: number };
  /** Average energy generation during this pattern */
  averageGeneration: number;
  /** Average efficiency during this pattern */
  averageEfficiency: number;
  /** Frequency of occurrence */
  frequency: number;
  /** Pattern type */
  type: 'commuting' | 'highway' | 'city' | 'parking' | 'mixed';
}

export interface EfficiencyAnalysis {
  /** Current efficiency rating */
  currentRating: 'excellent' | 'good' | 'average' | 'poor';
  /** Efficiency trend over time */
  trend: {
    direction: 'improving' | 'stable' | 'declining';
    rate: number; // percentage change per week
    confidence: number; // 0-1
  };
  /** Factors affecting efficiency */
  factors: Array<{
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    magnitude: number; // 0-1
    description: string;
  }>;
  /** Optimization opportunities */
  opportunities: Array<{
    area: string;
    potentialImprovement: number; // percentage
    difficulty: 'easy' | 'medium' | 'hard';
    description: string;
  }>;
}

export interface ComparisonMetrics {
  /** Comparison with previous period */
  periodComparison: {
    energyGeneration: { current: number; previous: number; change: number };
    efficiency: { current: number; previous: number; change: number };
    systemUptime: { current: number; previous: number; change: number };
  };
  /** Comparison with optimal performance */
  optimalComparison: {
    energyGeneration: { actual: number; optimal: number; efficiency: number };
    systemUtilization: { actual: number; optimal: number; efficiency: number };
  };
  /** Benchmarking data */
  benchmarks: {
    industryAverage: number;
    topPerformers: number;
    userRanking: number; // percentile
  };
}

export class UsageStatisticsTracker {
  private config: DashboardConfiguration;
  private historicalData: HistoricalDataPoint[] = [];
  private usagePatterns: EnergyUsagePattern[] = [];
  private maxDataPoints: number = 10080; // 1 week at 1-minute intervals
  private analysisCache: Map<string, any> = new Map();
  private cacheTimeout: number = 300000; // 5 minutes

  constructor(config: DashboardConfiguration) {
    this.config = config;
    this.initializeUsagePatterns();
  }

  /**
   * Add new data point for tracking
   */
  public addDataPoint(dataPoint: HistoricalDataPoint): void {
    this.historicalData.push(dataPoint);
    
    // Maintain maximum data points
    if (this.historicalData.length > this.maxDataPoints) {
      this.historicalData.shift();
    }

    // Clear cache when new data is added
    this.analysisCache.clear();

    // Update usage patterns
    this.updateUsagePatterns(dataPoint);
  }

  /**
   * Calculate comprehensive usage statistics
   */
  public calculateUsageStatistics(): UsageStatistics {
    const cacheKey = 'usage-statistics';
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    const now = Date.now();
    const timeframes = this.getTimeframes(now);

    // Calculate energy totals for different periods
    const dailyData = this.getDataForTimeframe(timeframes.day);
    const weeklyData = this.getDataForTimeframe(timeframes.week);
    const monthlyData = this.getDataForTimeframe(timeframes.month);

    const statistics: UsageStatistics = {
      dailyEnergyHarvested: this.calculateTotalEnergy(dailyData),
      weeklyEnergyHarvested: this.calculateTotalEnergy(weeklyData),
      monthlyEnergyHarvested: this.calculateTotalEnergy(monthlyData),
      lifetimeEnergyHarvested: this.calculateTotalEnergy(this.historicalData) / 1000, // Convert to kWh
      averageDailyGeneration: this.calculateAverageDaily(weeklyData),
      peakPowerToday: this.calculatePeakPower(dailyData),
      consumption: this.calculateConsumptionStats(dailyData, weeklyData, monthlyData),
      efficiencyTrends: this.calculateEfficiencyTrends(dailyData, weeklyData, monthlyData),
      operatingTime: this.calculateOperatingTime()
    };

    this.setCachedResult(cacheKey, statistics);
    return statistics;
  }

  /**
   * Get detailed efficiency analysis
   */
  public getEfficiencyAnalysis(): EfficiencyAnalysis {
    const cacheKey = 'efficiency-analysis';
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    const recentData = this.getRecentData(24 * 60 * 60 * 1000); // Last 24 hours
    const currentEfficiency = this.calculateAverageEfficiency(recentData);
    
    const analysis: EfficiencyAnalysis = {
      currentRating: this.getEfficiencyRating(currentEfficiency),
      trend: this.calculateEfficiencyTrend(),
      factors: this.analyzeEfficiencyFactors(),
      opportunities: this.identifyOptimizationOpportunities()
    };

    this.setCachedResult(cacheKey, analysis);
    return analysis;
  }

  /**
   * Get usage patterns analysis
   */
  public getUsagePatterns(): EnergyUsagePattern[] {
    return [...this.usagePatterns];
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    const cacheKey = 'performance-metrics';
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    const recentData = this.getRecentData(7 * 24 * 60 * 60 * 1000); // Last week
    
    const metrics: PerformanceMetrics = {
      generationEfficiency: this.calculateGenerationEfficiency(recentData),
      reliability: this.calculateReliabilityMetrics(),
      environmentalImpact: this.calculateEnvironmentalImpact()
    };

    this.setCachedResult(cacheKey, metrics);
    return metrics;
  }

  /**
   * Get comparison metrics
   */
  public getComparisonMetrics(): ComparisonMetrics {
    const cacheKey = 'comparison-metrics';
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    const now = Date.now();
    const currentWeek = this.getDataForPeriod(now - 7 * 24 * 60 * 60 * 1000, now);
    const previousWeek = this.getDataForPeriod(
      now - 14 * 24 * 60 * 60 * 1000, 
      now - 7 * 24 * 60 * 60 * 1000
    );

    const metrics: ComparisonMetrics = {
      periodComparison: this.calculatePeriodComparison(currentWeek, previousWeek),
      optimalComparison: this.calculateOptimalComparison(currentWeek),
      benchmarks: this.calculateBenchmarks()
    };

    this.setCachedResult(cacheKey, metrics);
    return metrics;
  }

  /**
   * Get energy generation trends
   */
  public getEnergyGenerationTrends(timeframe: 'day' | 'week' | 'month'): Array<{
    timestamp: number;
    energy: number;
    power: number;
    efficiency: number;
    cumulativeEnergy: number;
  }> {
    const now = Date.now();
    let duration: number;
    let interval: number;

    switch (timeframe) {
      case 'day':
        duration = 24 * 60 * 60 * 1000;
        interval = 60 * 60 * 1000; // 1 hour intervals
        break;
      case 'week':
        duration = 7 * 24 * 60 * 60 * 1000;
        interval = 24 * 60 * 60 * 1000; // 1 day intervals
        break;
      case 'month':
        duration = 30 * 24 * 60 * 60 * 1000;
        interval = 24 * 60 * 60 * 1000; // 1 day intervals
        break;
    }

    const startTime = now - duration;
    const data = this.getDataForPeriod(startTime, now);
    
    return this.aggregateDataByInterval(data, interval);
  }

  /**
   * Get efficiency distribution
   */
  public getEfficiencyDistribution(): Array<{
    range: string;
    count: number;
    percentage: number;
  }> {
    const ranges = [
      { min: 0, max: 0.2, label: '0-20%' },
      { min: 0.2, max: 0.4, label: '20-40%' },
      { min: 0.4, max: 0.6, label: '40-60%' },
      { min: 0.6, max: 0.8, label: '60-80%' },
      { min: 0.8, max: 1.0, label: '80-100%' }
    ];

    const total = this.historicalData.length;
    
    return ranges.map(range => {
      const count = this.historicalData.filter(
        point => point.efficiency >= range.min && point.efficiency < range.max
      ).length;
      
      return {
        range: range.label,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      };
    });
  }

  /**
   * Get peak performance periods
   */
  public getPeakPerformancePeriods(): Array<{
    startTime: number;
    endTime: number;
    averagePower: number;
    averageEfficiency: number;
    totalEnergy: number;
    duration: number;
  }> {
    const threshold = this.calculatePerformanceThreshold();
    const periods: Array<any> = [];
    let currentPeriod: any = null;

    this.historicalData.forEach(point => {
      const isHighPerformance = point.power > threshold.power && point.efficiency > threshold.efficiency;

      if (isHighPerformance) {
        if (!currentPeriod) {
          currentPeriod = {
            startTime: point.timestamp,
            endTime: point.timestamp,
            dataPoints: [point]
          };
        } else {
          currentPeriod.endTime = point.timestamp;
          currentPeriod.dataPoints.push(point);
        }
      } else {
        if (currentPeriod && currentPeriod.dataPoints.length >= 5) { // Minimum 5 data points
          periods.push(this.processPeakPeriod(currentPeriod));
        }
        currentPeriod = null;
      }
    });

    // Handle last period
    if (currentPeriod && currentPeriod.dataPoints.length >= 5) {
      periods.push(this.processPeakPeriod(currentPeriod));
    }

    return periods.sort((a, b) => b.averagePower - a.averagePower).slice(0, 10); // Top 10 periods
  }

  /**
   * Export statistics data
   */
  public exportStatistics(format: 'json' | 'csv'): string {
    const statistics = this.calculateUsageStatistics();
    const performanceMetrics = this.getPerformanceMetrics();
    const efficiencyAnalysis = this.getEfficiencyAnalysis();

    const exportData = {
      timestamp: Date.now(),
      statistics,
      performanceMetrics,
      efficiencyAnalysis,
      usagePatterns: this.usagePatterns,
      historicalDataSummary: {
        totalDataPoints: this.historicalData.length,
        timeRange: {
          start: this.historicalData[0]?.timestamp || 0,
          end: this.historicalData[this.historicalData.length - 1]?.timestamp || 0
        }
      }
    };

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    } else {
      return this.convertToCSV(exportData);
    }
  }

  /**
   * Initialize usage patterns
   */
  private initializeUsagePatterns(): void {
    this.usagePatterns = [
      {
        patternId: 'morning-commute',
        name: 'Morning Commute',
        timeOfDay: { start: 7, end: 9 },
        averageGeneration: 0,
        averageEfficiency: 0,
        frequency: 0,
        type: 'commuting'
      },
      {
        patternId: 'evening-commute',
        name: 'Evening Commute',
        timeOfDay: { start: 17, end: 19 },
        averageGeneration: 0,
        averageEfficiency: 0,
        frequency: 0,
        type: 'commuting'
      },
      {
        patternId: 'highway-driving',
        name: 'Highway Driving',
        timeOfDay: { start: 0, end: 24 },
        averageGeneration: 0,
        averageEfficiency: 0,
        frequency: 0,
        type: 'highway'
      },
      {
        patternId: 'city-driving',
        name: 'City Driving',
        timeOfDay: { start: 0, end: 24 },
        averageGeneration: 0,
        averageEfficiency: 0,
        frequency: 0,
        type: 'city'
      }
    ];
  }

  /**
   * Update usage patterns with new data
   */
  private updateUsagePatterns(dataPoint: HistoricalDataPoint): void {
    const hour = new Date(dataPoint.timestamp).getHours();
    
    this.usagePatterns.forEach(pattern => {
      if (hour >= pattern.timeOfDay.start && hour < pattern.timeOfDay.end) {
        // Update pattern statistics
        const alpha = 0.1; // Exponential moving average factor
        pattern.averageGeneration = pattern.averageGeneration * (1 - alpha) + dataPoint.power * alpha;
        pattern.averageEfficiency = pattern.averageEfficiency * (1 - alpha) + dataPoint.efficiency * alpha;
        pattern.frequency += 1;
      }
    });
  }

  /**
   * Get timeframes for analysis
   */
  private getTimeframes(now: number): { day: number; week: number; month: number } {
    return {
      day: now - 24 * 60 * 60 * 1000,
      week: now - 7 * 24 * 60 * 60 * 1000,
      month: now - 30 * 24 * 60 * 60 * 1000
    };
  }

  /**
   * Get data for specific timeframe
   */
  private getDataForTimeframe(startTime: number): HistoricalDataPoint[] {
    return this.historicalData.filter(point => point.timestamp >= startTime);
  }

  /**
   * Get data for specific period
   */
  private getDataForPeriod(startTime: number, endTime: number): HistoricalDataPoint[] {
    return this.historicalData.filter(
      point => point.timestamp >= startTime && point.timestamp <= endTime
    );
  }

  /**
   * Get recent data
   */
  private getRecentData(duration: number): HistoricalDataPoint[] {
    const now = Date.now();
    return this.getDataForPeriod(now - duration, now);
  }

  /**
   * Calculate total energy from data points
   */
  private calculateTotalEnergy(data: HistoricalDataPoint[]): number {
    return data.reduce((total, point) => total + point.energy, 0);
  }

  /**
   * Calculate average daily generation
   */
  private calculateAverageDaily(weeklyData: HistoricalDataPoint[]): number {
    const totalEnergy = this.calculateTotalEnergy(weeklyData);
    const days = weeklyData.length > 0 ? 
      (weeklyData[weeklyData.length - 1].timestamp - weeklyData[0].timestamp) / (24 * 60 * 60 * 1000) : 1;
    return totalEnergy / Math.max(days, 1);
  }

  /**
   * Calculate peak power
   */
  private calculatePeakPower(data: HistoricalDataPoint[]): number {
    return data.length > 0 ? Math.max(...data.map(point => point.power)) : 0;
  }

  /**
   * Calculate consumption statistics
   */
  private calculateConsumptionStats(
    dailyData: HistoricalDataPoint[], 
    weeklyData: HistoricalDataPoint[], 
    monthlyData: HistoricalDataPoint[]
  ): any {
    // Simplified consumption calculation (assuming 80% of generated energy is consumed)
    const consumptionFactor = 0.8;
    
    return {
      dailyConsumption: this.calculateTotalEnergy(dailyData) * consumptionFactor,
      weeklyConsumption: this.calculateTotalEnergy(weeklyData) * consumptionFactor,
      monthlyConsumption: this.calculateTotalEnergy(monthlyData) * consumptionFactor,
      averageConsumption: this.calculateAverageDaily(weeklyData) * consumptionFactor
    };
  }

  /**
   * Calculate efficiency trends
   */
  private calculateEfficiencyTrends(
    dailyData: HistoricalDataPoint[], 
    weeklyData: HistoricalDataPoint[], 
    monthlyData: HistoricalDataPoint[]
  ): any {
    return {
      current: this.calculateAverageEfficiency(this.getRecentData(60 * 60 * 1000)), // Last hour
      daily: this.calculateAverageEfficiency(dailyData),
      weekly: this.calculateAverageEfficiency(weeklyData),
      monthly: this.calculateAverageEfficiency(monthlyData)
    };
  }

  /**
   * Calculate average efficiency
   */
  private calculateAverageEfficiency(data: HistoricalDataPoint[]): number {
    if (data.length === 0) return 0;
    return data.reduce((total, point) => total + point.efficiency, 0) / data.length;
  }

  /**
   * Calculate operating time
   */
  private calculateOperatingTime(): any {
    const totalHours = this.historicalData.length / 60; // Assuming 1-minute intervals
    const activeHours = this.historicalData.filter(point => point.power > 0).length / 60;
    
    return {
      totalOperatingHours: totalHours,
      energyHarvestingHours: activeHours,
      systemUptime: totalHours > 0 ? activeHours / totalHours : 0
    };
  }

  /**
   * Get efficiency rating
   */
  private getEfficiencyRating(efficiency: number): 'excellent' | 'good' | 'average' | 'poor' {
    if (efficiency > 0.85) return 'excellent';
    if (efficiency > 0.7) return 'good';
    if (efficiency > 0.5) return 'average';
    return 'poor';
  }

  /**
   * Calculate efficiency trend
   */
  private calculateEfficiencyTrend(): { direction: 'improving' | 'stable' | 'declining'; rate: number; confidence: number } {
    if (this.historicalData.length < 100) {
      return { direction: 'stable', rate: 0, confidence: 0 };
    }

    const recent = this.historicalData.slice(-50);
    const older = this.historicalData.slice(-100, -50);

    const recentAvg = this.calculateAverageEfficiency(recent);
    const olderAvg = this.calculateAverageEfficiency(older);

    const rate = ((recentAvg - olderAvg) / olderAvg) * 100; // Percentage change per week
    const confidence = Math.min(this.historicalData.length / 1000, 1); // Higher confidence with more data

    let direction: 'improving' | 'stable' | 'declining';
    if (Math.abs(rate) < 2) {
      direction = 'stable';
    } else if (rate > 0) {
      direction = 'improving';
    } else {
      direction = 'declining';
    }

    return { direction, rate: Math.abs(rate), confidence };
  }

  /**
   * Analyze efficiency factors
   */
  private analyzeEfficiencyFactors(): Array<any> {
    // Simplified factor analysis
    return [
      {
        name: 'Road Conditions',
        impact: 'positive',
        magnitude: 0.7,
        description: 'Rough roads provide better energy harvesting opportunities'
      },
      {
        name: 'Driving Speed',
        impact: 'neutral',
        magnitude: 0.5,
        description: 'Moderate speeds optimize energy generation'
      },
      {
        name: 'System Temperature',
        impact: 'negative',
        magnitude: 0.3,
        description: 'High temperatures reduce system efficiency'
      }
    ];
  }

  /**
   * Identify optimization opportunities
   */
  private identifyOptimizationOpportunities(): Array<any> {
    return [
      {
        area: 'Driving Patterns',
        potentialImprovement: 15,
        difficulty: 'easy',
        description: 'Optimize routes to include more energy-harvesting road conditions'
      },
      {
        area: 'System Maintenance',
        potentialImprovement: 10,
        difficulty: 'medium',
        description: 'Regular maintenance can improve overall system efficiency'
      },
      {
        area: 'Temperature Management',
        potentialImprovement: 8,
        difficulty: 'hard',
        description: 'Improved cooling systems could enhance performance'
      }
    ];
  }

  /**
   * Calculate generation efficiency
   */
  private calculateGenerationEfficiency(data: HistoricalDataPoint[]): any {
    const current = this.calculateAverageEfficiency(data);
    const average = this.calculateAverageEfficiency(this.historicalData);
    const peak = Math.max(...this.historicalData.map(point => point.efficiency));
    
    const trend = this.calculateEfficiencyTrend();

    return {
      current,
      average,
      peak,
      trend: trend.direction
    };
  }

  /**
   * Calculate reliability metrics
   */
  private calculateReliabilityMetrics(): any {
    const totalDataPoints = this.historicalData.length;
    const activeDataPoints = this.historicalData.filter(point => point.power > 0).length;
    const uptime = totalDataPoints > 0 ? activeDataPoints / totalDataPoints : 0;

    return {
      uptime,
      errorRate: 1 - uptime,
      maintenanceAlerts: 0 // Would be calculated from actual maintenance data
    };
  }

  /**
   * Calculate environmental impact
   */
  private calculateEnvironmentalImpact(): any {
    const totalEnergyKWh = this.calculateTotalEnergy(this.historicalData) / 1000;
    
    // Simplified calculations
    const co2Factor = 0.5; // kg CO2 per kWh saved
    const fuelFactor = 0.3; // liters per kWh
    const costFactor = 0.15; // currency units per kWh

    return {
      co2Saved: totalEnergyKWh * co2Factor,
      fuelSaved: totalEnergyKWh * fuelFactor,
      costSavings: totalEnergyKWh * costFactor
    };
  }

  /**
   * Calculate period comparison
   */
  private calculatePeriodComparison(current: HistoricalDataPoint[], previous: HistoricalDataPoint[]): any {
    const currentEnergy = this.calculateTotalEnergy(current);
    const previousEnergy = this.calculateTotalEnergy(previous);
    const currentEfficiency = this.calculateAverageEfficiency(current);
    const previousEfficiency = this.calculateAverageEfficiency(previous);

    return {
      energyGeneration: {
        current: currentEnergy,
        previous: previousEnergy,
        change: previousEnergy > 0 ? ((currentEnergy - previousEnergy) / previousEnergy) * 100 : 0
      },
      efficiency: {
        current: currentEfficiency,
        previous: previousEfficiency,
        change: previousEfficiency > 0 ? ((currentEfficiency - previousEfficiency) / previousEfficiency) * 100 : 0
      },
      systemUptime: {
        current: current.length > 0 ? current.filter(p => p.power > 0).length / current.length : 0,
        previous: previous.length > 0 ? previous.filter(p => p.power > 0).length / previous.length : 0,
        change: 0 // Calculated from the above
      }
    };
  }

  /**
   * Calculate optimal comparison
   */
  private calculateOptimalComparison(data: HistoricalDataPoint[]): any {
    const actualEnergy = this.calculateTotalEnergy(data);
    const optimalEnergy = data.length * 50; // Assuming 50Wh optimal per data point
    const actualUtilization = data.filter(p => p.power > 0).length / data.length;
    const optimalUtilization = 0.8; // 80% optimal utilization

    return {
      energyGeneration: {
        actual: actualEnergy,
        optimal: optimalEnergy,
        efficiency: optimalEnergy > 0 ? (actualEnergy / optimalEnergy) * 100 : 0
      },
      systemUtilization: {
        actual: actualUtilization,
        optimal: optimalUtilization,
        efficiency: (actualUtilization / optimalUtilization) * 100
      }
    };
  }

  /**
   * Calculate benchmarks
   */
  private calculateBenchmarks(): any {
    // Simplified benchmark data
    return {
      industryAverage: 65, // 65% efficiency
      topPerformers: 85, // 85% efficiency
      userRanking: 75 // 75th percentile
    };
  }

  /**
   * Aggregate data by interval
   */
  private aggregateDataByInterval(data: HistoricalDataPoint[], interval: number): Array<any> {
    if (data.length === 0) return [];

    const startTime = data[0].timestamp;
    const endTime = data[data.length - 1].timestamp;
    const intervals: Array<any> = [];
    let cumulativeEnergy = 0;

    for (let time = startTime; time <= endTime; time += interval) {
      const intervalData = data.filter(
        point => point.timestamp >= time && point.timestamp < time + interval
      );

      if (intervalData.length > 0) {
        const energy = this.calculateTotalEnergy(intervalData);
        const power = intervalData.reduce((sum, point) => sum + point.power, 0) / intervalData.length;
        const efficiency = this.calculateAverageEfficiency(intervalData);
        cumulativeEnergy += energy;

        intervals.push({
          timestamp: time,
          energy,
          power,
          efficiency,
          cumulativeEnergy
        });
      }
    }

    return intervals;
  }

  /**
   * Calculate performance threshold
   */
  private calculatePerformanceThreshold(): { power: number; efficiency: number } {
    const avgPower = this.historicalData.reduce((sum, point) => sum + point.power, 0) / this.historicalData.length;
    const avgEfficiency = this.calculateAverageEfficiency(this.historicalData);

    return {
      power: avgPower * 1.5, // 150% of average
      efficiency: avgEfficiency * 1.2 // 120% of average
    };
  }

  /**
   * Process peak period
   */
  private processPeakPeriod(period: any): any {
    const dataPoints = period.dataPoints;
    const averagePower = dataPoints.reduce((sum: number, point: any) => sum + point.power, 0) / dataPoints.length;
    const averageEfficiency = this.calculateAverageEfficiency(dataPoints);
    const totalEnergy = this.calculateTotalEnergy(dataPoints);
    const duration = period.endTime - period.startTime;

    return {
      startTime: period.startTime,
      endTime: period.endTime,
      averagePower,
      averageEfficiency,
      totalEnergy,
      duration
    };
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any): string {
    // Simplified CSV conversion
    const headers = ['Timestamp', 'Daily Energy', 'Weekly Energy', 'Monthly Energy', 'Efficiency'];
    const rows = [headers.join(',')];
    
    // Add summary row
    rows.push([
      new Date().toISOString(),
      data.statistics.dailyEnergyHarvested,
      data.statistics.weeklyEnergyHarvested,
      data.statistics.monthlyEnergyHarvested,
      data.statistics.efficiencyTrends.current
    ].join(','));

    return rows.join('\n');
  }

  /**
   * Cache management
   */
  private getCachedResult(key: string): any {
    const cached = this.analysisCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedResult(key: string, data: any): void {
    this.analysisCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}