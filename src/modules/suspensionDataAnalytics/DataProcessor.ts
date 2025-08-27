/**
 * Data Processor for Suspension Energy Harvesting System
 * 
 * This class handles data collection, preprocessing, and storage for the analytics system.
 * It processes raw data from various suspension components and prepares it for analysis.
 */

import {
  SuspensionDataPoint,
  ShockAbsorberDataPoint,
  DamperDataPoint,
  IntegrationDataPoint,
  EnvironmentalDataPoint,
  DataQualityMetrics,
  AnalyticsConfiguration
} from './types';

export class DataProcessor {
  private dataBuffer: SuspensionDataPoint[] = [];
  private readonly maxBufferSize: number;
  private readonly samplingRate: number;
  private lastProcessingTime: number = 0;
  private dataQualityMetrics: DataQualityMetrics;

  constructor(private config: AnalyticsConfiguration) {
    this.maxBufferSize = config.dataRetentionPeriod * 24 * 3600 * config.samplingRate;
    this.samplingRate = config.samplingRate;
    this.dataQualityMetrics = {
      completeness: 1.0,
      accuracy: 1.0,
      consistency: 1.0,
      timeliness: 1.0,
      validity: 1.0
    };
  }

  /**
   * Process and store a new data point from the suspension system
   */
  public processDataPoint(
    shockAbsorberData: any,
    damperData: any,
    integrationData: any,
    environmentalData: any
  ): SuspensionDataPoint {
    const timestamp = Date.now();
    
    // Validate and clean the input data
    const cleanedData = this.validateAndCleanData({
      shockAbsorberData,
      damperData,
      integrationData,
      environmentalData
    });

    // Create standardized data point
    const dataPoint: SuspensionDataPoint = {
      timestamp,
      shockAbsorberData: this.processShockAbsorberData(cleanedData.shockAbsorberData),
      damperData: this.processDamperData(cleanedData.damperData),
      integrationData: this.processIntegrationData(cleanedData.integrationData),
      environmentalData: this.processEnvironmentalData(cleanedData.environmentalData)
    };

    // Add to buffer
    this.addToBuffer(dataPoint);

    // Update data quality metrics
    this.updateDataQualityMetrics(dataPoint);

    this.lastProcessingTime = timestamp;
    return dataPoint;
  }

  /**
   * Process shock absorber data and extract key metrics
   */
  private processShockAbsorberData(data: any): ShockAbsorberDataPoint {
    return {
      generatedPower: this.sanitizeNumber(data.generatedPower, 0, 1000),
      dampingForce: this.sanitizeNumber(data.dampingForce, -10000, 10000),
      generatorRPM: this.sanitizeNumber(data.generatorRPM, 0, 10000),
      efficiency: this.sanitizeNumber(data.efficiency, 0, 1),
      outputVoltage: this.sanitizeNumber(data.outputVoltage, 0, 100),
      outputCurrent: this.sanitizeNumber(data.outputCurrent, 0, 50),
      operatingTemperature: this.sanitizeNumber(data.operatingTemperature, -40, 200),
      accumulatedEnergy: this.sanitizeNumber(data.accumulatedEnergy, 0, Number.MAX_SAFE_INTEGER),
      dampingMode: this.sanitizeString(data.dampingMode, ['comfort', 'sport', 'energy_harvesting', 'adaptive']),
      isOperational: Boolean(data.isOperational)
    };
  }

  /**
   * Process damper data and extract key metrics
   */
  private processDamperData(data: any): DamperDataPoint {
    return {
      generatedPower: this.sanitizeNumber(data.generatedPower, 0, 1000),
      dampingForce: this.sanitizeNumber(data.dampingForce, 0, 20000),
      energyEfficiency: this.sanitizeNumber(data.energyEfficiency, 0, 1),
      electromagneticForce: this.sanitizeNumber(data.electromagneticForce, 0, 15000),
      hydraulicPressure: this.sanitizeNumber(data.hydraulicPressure, 0, 50000000),
      systemTemperature: this.sanitizeNumber(data.systemTemperature, -40, 200),
      harvestedEnergy: this.sanitizeNumber(data.harvestedEnergy, 0, Number.MAX_SAFE_INTEGER),
      totalEnergyHarvested: this.sanitizeNumber(data.totalEnergyHarvested, 0, Number.MAX_SAFE_INTEGER),
      operationCycles: this.sanitizeNumber(data.operationCycles, 0, Number.MAX_SAFE_INTEGER)
    };
  }

  /**
   * Process integration data and extract key metrics
   */
  private processIntegrationData(data: any): IntegrationDataPoint {
    return {
      totalGeneratedPower: this.sanitizeNumber(data.totalGeneratedPower, 0, 4000),
      totalDampingForce: this.sanitizeNumber(data.totalDampingForce, 0, 80000),
      averageEfficiency: this.sanitizeNumber(data.averageEfficiency, 0, 1),
      energyDistribution: Array.isArray(data.energyDistribution) ? 
        data.energyDistribution.map((val: any) => this.sanitizeNumber(val, 0, 1000)) : [0, 0, 0, 0],
      systemStatus: this.sanitizeString(data.systemStatus, ['optimal', 'good', 'degraded', 'critical']),
      performanceScore: this.sanitizeNumber(data.performanceScore, 0, 100)
    };
  }

  /**
   * Process environmental data and extract key metrics
   */
  private processEnvironmentalData(data: any): EnvironmentalDataPoint {
    return {
      vehicleSpeed: this.sanitizeNumber(data.vehicleSpeed, 0, 300),
      roadCondition: this.sanitizeString(data.roadCondition, ['smooth', 'rough', 'very_rough']),
      roadRoughness: this.sanitizeNumber(data.roadRoughness, 0, 1),
      ambientTemperature: this.sanitizeNumber(data.ambientTemperature, -50, 60),
      batterySOC: this.sanitizeNumber(data.batterySOC, 0, 1),
      loadFactor: this.sanitizeNumber(data.loadFactor, 0, 1)
    };
  }

  /**
   * Validate and clean input data
   */
  private validateAndCleanData(data: any): any {
    const cleaned = { ...data };

    // Check for missing data and apply interpolation if possible
    if (!cleaned.shockAbsorberData && this.dataBuffer.length > 0) {
      cleaned.shockAbsorberData = this.interpolateShockAbsorberData();
    }

    if (!cleaned.damperData && this.dataBuffer.length > 0) {
      cleaned.damperData = this.interpolateDamperData();
    }

    return cleaned;
  }

  /**
   * Interpolate missing shock absorber data based on recent history
   */
  private interpolateShockAbsorberData(): any {
    if (this.dataBuffer.length < 2) return {};

    const recent = this.dataBuffer.slice(-3);
    const avgPower = recent.reduce((sum, dp) => sum + dp.shockAbsorberData.generatedPower, 0) / recent.length;
    const avgEfficiency = recent.reduce((sum, dp) => sum + dp.shockAbsorberData.efficiency, 0) / recent.length;

    return {
      generatedPower: avgPower,
      efficiency: avgEfficiency,
      isOperational: true
    };
  }

  /**
   * Interpolate missing damper data based on recent history
   */
  private interpolateDamperData(): any {
    if (this.dataBuffer.length < 2) return {};

    const recent = this.dataBuffer.slice(-3);
    const avgPower = recent.reduce((sum, dp) => sum + dp.damperData.generatedPower, 0) / recent.length;
    const avgEfficiency = recent.reduce((sum, dp) => sum + dp.damperData.energyEfficiency, 0) / recent.length;

    return {
      generatedPower: avgPower,
      energyEfficiency: avgEfficiency
    };
  }

  /**
   * Sanitize numeric values with bounds checking
   */
  private sanitizeNumber(value: any, min: number, max: number): number {
    const num = Number(value);
    if (isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
  }

  /**
   * Sanitize string values with allowed values checking
   */
  private sanitizeString(value: any, allowedValues: string[]): string {
    const str = String(value);
    return allowedValues.includes(str) ? str : allowedValues[0];
  }

  /**
   * Add data point to buffer with size management
   */
  private addToBuffer(dataPoint: SuspensionDataPoint): void {
    this.dataBuffer.push(dataPoint);

    // Remove old data if buffer exceeds maximum size
    if (this.dataBuffer.length > this.maxBufferSize) {
      this.dataBuffer = this.dataBuffer.slice(-this.maxBufferSize);
    }
  }

  /**
   * Update data quality metrics based on new data point
   */
  private updateDataQualityMetrics(dataPoint: SuspensionDataPoint): void {
    const currentTime = Date.now();
    
    // Timeliness: Check if data is arriving at expected rate
    const expectedInterval = 1000 / this.samplingRate;
    const actualInterval = currentTime - this.lastProcessingTime;
    const timelinessScore = Math.max(0, 1 - Math.abs(actualInterval - expectedInterval) / expectedInterval);

    // Completeness: Check for missing fields
    const requiredFields = [
      'shockAbsorberData', 'damperData', 'integrationData', 'environmentalData'
    ];
    const completenessScore = requiredFields.filter(field => 
      dataPoint[field as keyof SuspensionDataPoint] !== undefined
    ).length / requiredFields.length;

    // Validity: Check if values are within expected ranges
    const validityChecks = [
      dataPoint.shockAbsorberData.efficiency >= 0 && dataPoint.shockAbsorberData.efficiency <= 1,
      dataPoint.damperData.energyEfficiency >= 0 && dataPoint.damperData.energyEfficiency <= 1,
      dataPoint.environmentalData.vehicleSpeed >= 0 && dataPoint.environmentalData.vehicleSpeed <= 300,
      dataPoint.environmentalData.batterySOC >= 0 && dataPoint.environmentalData.batterySOC <= 1
    ];
    const validityScore = validityChecks.filter(check => check).length / validityChecks.length;

    // Update metrics with exponential moving average
    const alpha = 0.1; // Smoothing factor
    this.dataQualityMetrics.timeliness = alpha * timelinessScore + (1 - alpha) * this.dataQualityMetrics.timeliness;
    this.dataQualityMetrics.completeness = alpha * completenessScore + (1 - alpha) * this.dataQualityMetrics.completeness;
    this.dataQualityMetrics.validity = alpha * validityScore + (1 - alpha) * this.dataQualityMetrics.validity;
    
    // Accuracy and consistency require historical comparison
    if (this.dataBuffer.length > 10) {
      this.updateAccuracyMetrics();
      this.updateConsistencyMetrics();
    }
  }

  /**
   * Update accuracy metrics by comparing with expected values
   */
  private updateAccuracyMetrics(): void {
    const recent = this.dataBuffer.slice(-10);
    let accuracySum = 0;
    let count = 0;

    for (let i = 1; i < recent.length; i++) {
      const current = recent[i];
      const previous = recent[i - 1];

      // Check for reasonable changes in key metrics
      const powerChange = Math.abs(current.shockAbsorberData.generatedPower - previous.shockAbsorberData.generatedPower);
      const maxExpectedChange = previous.shockAbsorberData.generatedPower * 0.5; // 50% max change
      
      if (powerChange <= maxExpectedChange) {
        accuracySum += 1;
      }
      count++;
    }

    if (count > 0) {
      const alpha = 0.1;
      this.dataQualityMetrics.accuracy = alpha * (accuracySum / count) + (1 - alpha) * this.dataQualityMetrics.accuracy;
    }
  }

  /**
   * Update consistency metrics by checking for data coherence
   */
  private updateConsistencyMetrics(): void {
    const recent = this.dataBuffer.slice(-5);
    let consistencySum = 0;
    let count = 0;

    for (const dataPoint of recent) {
      // Check consistency between related metrics
      const powerEfficiencyConsistent = 
        (dataPoint.shockAbsorberData.generatedPower > 0) === (dataPoint.shockAbsorberData.efficiency > 0.1);
      
      const temperatureConsistent = 
        Math.abs(dataPoint.shockAbsorberData.operatingTemperature - dataPoint.damperData.systemTemperature) < 20;

      if (powerEfficiencyConsistent && temperatureConsistent) {
        consistencySum += 1;
      }
      count++;
    }

    if (count > 0) {
      const alpha = 0.1;
      this.dataQualityMetrics.consistency = alpha * (consistencySum / count) + (1 - alpha) * this.dataQualityMetrics.consistency;
    }
  }

  /**
   * Get data for a specific time range
   */
  public getDataRange(startTime: number, endTime: number): SuspensionDataPoint[] {
    return this.dataBuffer.filter(dp => dp.timestamp >= startTime && dp.timestamp <= endTime);
  }

  /**
   * Get recent data points
   */
  public getRecentData(count: number): SuspensionDataPoint[] {
    return this.dataBuffer.slice(-count);
  }

  /**
   * Get all data in buffer
   */
  public getAllData(): SuspensionDataPoint[] {
    return [...this.dataBuffer];
  }

  /**
   * Get current data quality metrics
   */
  public getDataQualityMetrics(): DataQualityMetrics {
    return { ...this.dataQualityMetrics };
  }

  /**
   * Clear all data from buffer
   */
  public clearData(): void {
    this.dataBuffer = [];
  }

  /**
   * Get buffer statistics
   */
  public getBufferStats(): {
    totalDataPoints: number;
    oldestTimestamp: number;
    newestTimestamp: number;
    memoryUsage: number;
  } {
    return {
      totalDataPoints: this.dataBuffer.length,
      oldestTimestamp: this.dataBuffer.length > 0 ? this.dataBuffer[0].timestamp : 0,
      newestTimestamp: this.dataBuffer.length > 0 ? this.dataBuffer[this.dataBuffer.length - 1].timestamp : 0,
      memoryUsage: this.dataBuffer.length * 1024 // Rough estimate in bytes
    };
  }

  /**
   * Export data to JSON format
   */
  public exportData(startTime?: number, endTime?: number): string {
    let dataToExport = this.dataBuffer;
    
    if (startTime !== undefined && endTime !== undefined) {
      dataToExport = this.getDataRange(startTime, endTime);
    }

    return JSON.stringify({
      exportTimestamp: Date.now(),
      dataQuality: this.dataQualityMetrics,
      dataPoints: dataToExport
    }, null, 2);
  }
}