/**
 * Real-Time Energy Controller
 * 
 * Provides real-time corrections and fine-tuning of energy management
 * decisions to handle rapid changes and disturbances.
 */

import {
  EnergyManagementConfig,
  EnergyManagementInputs,
  EnergyManagementOutputs
} from './types';

export interface RealTimeCorrection {
  correctionId: string;
  timestamp: number;
  type: 'power_adjustment' | 'load_shedding' | 'emergency_response' | 'efficiency_boost';
  targetComponent: string;
  originalValue: number;
  correctedValue: number;
  reason: string;
  priority: number;
  duration: number; // ms
}

export interface DisturbanceDetection {
  disturbanceId: string;
  timestamp: number;
  type: 'power_spike' | 'load_surge' | 'efficiency_drop' | 'temperature_rise' | 'voltage_fluctuation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedComponents: string[];
  detectionConfidence: number; // 0-1
  estimatedDuration: number; // ms
}

export class RealTimeEnergyController {
  private config: EnergyManagementConfig;
  private activeCorrections: Map<string, RealTimeCorrection> = new Map();
  private detectedDisturbances: Map<string, DisturbanceDetection> = new Map();
  
  // Real-time monitoring
  private monitoringData: Array<{
    timestamp: number;
    powerFlow: Map<string, number>;
    efficiency: Map<string, number>;
    temperature: Map<string, number>;
    voltage: Map<string, number>;
  }> = [];
  
  // Disturbance detection parameters
  private detectionThresholds = {
    powerSpike: 0.2, // 20% sudden increase
    loadSurge: 0.3, // 30% sudden increase
    efficiencyDrop: 0.1, // 10% sudden decrease
    temperatureRise: 5, // 5°C sudden increase
    voltageFluctuation: 0.05 // 5% voltage change
  };
  
  // Control parameters
  private controlParameters = {
    responseTime: 10, // 10ms target response time
    correctionFactor: 0.1, // 10% maximum correction per cycle
    stabilityMargin: 0.05, // 5% stability margin
    emergencyThreshold: 0.5 // 50% threshold for emergency response
  };

  constructor(config: EnergyManagementConfig) {
    this.config = config;
    this.initializeRealTimeMonitoring();
  }

  /**
   * Initialize real-time monitoring
   */
  private initializeRealTimeMonitoring(): void {
    // Start high-frequency monitoring loop
    setInterval(() => {
      this.updateMonitoringData();
      this.detectDisturbances();
      this.cleanupExpiredCorrections();
    }, 10); // 10ms monitoring cycle
  }

  /**
   * Apply real-time corrections
   */
  public async applyCorrections(
    outputs: EnergyManagementOutputs,
    inputs: EnergyManagementInputs
  ): Promise<EnergyManagementOutputs> {
    const correctedOutputs = { ...outputs };
    
    // Detect immediate disturbances
    const immediateDisturbances = await this.detectImmediateDisturbances(inputs);
    
    // Generate corrections for detected disturbances
    const newCorrections = await this.generateCorrections(immediateDisturbances, inputs, outputs);
    
    // Apply all active corrections
    const allCorrections = [...this.activeCorrections.values(), ...newCorrections];
    const finalOutputs = this.applyAllCorrections(correctedOutputs, allCorrections);
    
    // Store new corrections
    for (const correction of newCorrections) {
      this.activeCorrections.set(correction.correctionId, correction);
    }
    
    // Update monitoring data
    this.updateMonitoringData(inputs, finalOutputs);
    
    return finalOutputs;
  }

  /**
   * Detect immediate disturbances
   */
  private async detectImmediateDisturbances(inputs: EnergyManagementInputs): Promise<DisturbanceDetection[]> {
    const disturbances: DisturbanceDetection[] = [];
    const currentTime = Date.now();
    
    // Check for power spikes
    for (const [sourceId, source] of inputs.sources) {
      const recentData = this.getRecentMonitoringData(sourceId, 'power', 100); // Last 100ms
      if (recentData.length > 1) {
        const powerChange = (source.power - recentData[0]) / Math.max(recentData[0], 1);
        
        if (Math.abs(powerChange) > this.detectionThresholds.powerSpike) {
          disturbances.push({
            disturbanceId: `power_spike_${sourceId}_${currentTime}`,
            timestamp: currentTime,
            type: 'power_spike',
            severity: this.calculateSeverity(Math.abs(powerChange), this.detectionThresholds.powerSpike),
            affectedComponents: [sourceId],
            detectionConfidence: Math.min(Math.abs(powerChange) / this.detectionThresholds.powerSpike, 1),
            estimatedDuration: 500 // 500ms estimated duration
          });
        }
      }
    }
    
    // Check for load surges
    for (const [loadId, load] of inputs.loads) {
      const recentData = this.getRecentMonitoringData(loadId, 'power', 100);
      if (recentData.length > 1) {
        const loadChange = (load.power - recentData[0]) / Math.max(recentData[0], 1);
        
        if (loadChange > this.detectionThresholds.loadSurge) {
          disturbances.push({
            disturbanceId: `load_surge_${loadId}_${currentTime}`,
            timestamp: currentTime,
            type: 'load_surge',
            severity: this.calculateSeverity(loadChange, this.detectionThresholds.loadSurge),
            affectedComponents: [loadId],
            detectionConfidence: Math.min(loadChange / this.detectionThresholds.loadSurge, 1),
            estimatedDuration: 1000 // 1s estimated duration
          });
        }
      }
    }
    
    // Check for efficiency drops
    for (const [sourceId, source] of inputs.sources) {
      const recentData = this.getRecentMonitoringData(sourceId, 'efficiency', 200);
      if (recentData.length > 1) {
        const efficiencyChange = (recentData[0] - source.efficiency) / Math.max(recentData[0], 1);
        
        if (efficiencyChange > this.detectionThresholds.efficiencyDrop) {
          disturbances.push({
            disturbanceId: `efficiency_drop_${sourceId}_${currentTime}`,
            timestamp: currentTime,
            type: 'efficiency_drop',
            severity: this.calculateSeverity(efficiencyChange, this.detectionThresholds.efficiencyDrop),
            affectedComponents: [sourceId],
            detectionConfidence: Math.min(efficiencyChange / this.detectionThresholds.efficiencyDrop, 1),
            estimatedDuration: 2000 // 2s estimated duration
          });
        }
      }
    }
    
    // Check for temperature rises
    for (const [sourceId, source] of inputs.sources) {
      const recentData = this.getRecentMonitoringData(sourceId, 'temperature', 1000); // Last 1s
      if (recentData.length > 1) {
        const tempChange = source.temperature - recentData[0];
        
        if (tempChange > this.detectionThresholds.temperatureRise) {
          disturbances.push({
            disturbanceId: `temperature_rise_${sourceId}_${currentTime}`,
            timestamp: currentTime,
            type: 'temperature_rise',
            severity: this.calculateSeverity(tempChange, this.detectionThresholds.temperatureRise),
            affectedComponents: [sourceId],
            detectionConfidence: Math.min(tempChange / this.detectionThresholds.temperatureRise, 1),
            estimatedDuration: 5000 // 5s estimated duration
          });
        }
      }
    }
    
    return disturbances;
  }

  /**
   * Calculate disturbance severity
   */
  private calculateSeverity(value: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = value / threshold;
    
    if (ratio < 1.5) return 'low';
    if (ratio < 2.5) return 'medium';
    if (ratio < 4.0) return 'high';
    return 'critical';
  }

  /**
   * Generate corrections for disturbances
   */
  private async generateCorrections(
    disturbances: DisturbanceDetection[],
    inputs: EnergyManagementInputs,
    outputs: EnergyManagementOutputs
  ): Promise<RealTimeCorrection[]> {
    const corrections: RealTimeCorrection[] = [];
    const currentTime = Date.now();
    
    for (const disturbance of disturbances) {
      switch (disturbance.type) {
        case 'power_spike':
          corrections.push(...this.generatePowerSpikeCorrections(disturbance, inputs, outputs, currentTime));
          break;
        case 'load_surge':
          corrections.push(...this.generateLoadSurgeCorrections(disturbance, inputs, outputs, currentTime));
          break;
        case 'efficiency_drop':
          corrections.push(...this.generateEfficiencyDropCorrections(disturbance, inputs, outputs, currentTime));
          break;
        case 'temperature_rise':
          corrections.push(...this.generateTemperatureRiseCorrections(disturbance, inputs, outputs, currentTime));
          break;
        case 'voltage_fluctuation':
          corrections.push(...this.generateVoltageFluctuationCorrections(disturbance, inputs, outputs, currentTime));
          break;
      }
    }
    
    return corrections;
  }

  /**
   * Generate power spike corrections
   */
  private generatePowerSpikeCorrections(
    disturbance: DisturbanceDetection,
    inputs: EnergyManagementInputs,
    outputs: EnergyManagementOutputs,
    currentTime: number
  ): RealTimeCorrection[] {
    const corrections: RealTimeCorrection[] = [];
    const sourceId = disturbance.affectedComponents[0];
    const sourceControl = outputs.sourceControls.get(sourceId);
    
    if (sourceControl) {
      // Reduce power setpoint to handle spike
      const reductionFactor = disturbance.severity === 'critical' ? 0.3 : 
                             disturbance.severity === 'high' ? 0.2 : 0.1;
      
      const correctedPower = sourceControl.powerSetpoint * (1 - reductionFactor);
      
      corrections.push({
        correctionId: `power_spike_correction_${sourceId}_${currentTime}`,
        timestamp: currentTime,
        type: 'power_adjustment',
        targetComponent: sourceId,
        originalValue: sourceControl.powerSetpoint,
        correctedValue: correctedPower,
        reason: `Power spike detected - reducing setpoint by ${(reductionFactor * 100).toFixed(1)}%`,
        priority: disturbance.severity === 'critical' ? 10 : 8,
        duration: disturbance.estimatedDuration
      });
    }
    
    return corrections;
  }

  /**
   * Generate load surge corrections
   */
  private generateLoadSurgeCorrections(
    disturbance: DisturbanceDetection,
    inputs: EnergyManagementInputs,
    outputs: EnergyManagementOutputs,
    currentTime: number
  ): RealTimeCorrection[] {
    const corrections: RealTimeCorrection[] = [];
    const loadId = disturbance.affectedComponents[0];
    const loadControl = outputs.loadControls.get(loadId);
    const load = inputs.loads.get(loadId);
    
    if (loadControl && load) {
      // Apply load shedding if surge is severe
      if (disturbance.severity === 'high' || disturbance.severity === 'critical') {
        const sheddingFactor = disturbance.severity === 'critical' ? 0.4 : 0.2;
        const maxReduction = load.power * load.flexibility / 100;
        const actualReduction = Math.min(load.power * sheddingFactor, maxReduction);
        const correctedPower = loadControl.powerAllocation - actualReduction;
        
        corrections.push({
          correctionId: `load_surge_correction_${loadId}_${currentTime}`,
          timestamp: currentTime,
          type: 'load_shedding',
          targetComponent: loadId,
          originalValue: loadControl.powerAllocation,
          correctedValue: Math.max(correctedPower, 0),
          reason: `Load surge detected - applying load shedding (${actualReduction.toFixed(1)}W reduction)`,
          priority: 9,
          duration: disturbance.estimatedDuration
        });
      }
    }
    
    return corrections;
  }

  /**
   * Generate efficiency drop corrections
   */
  private generateEfficiencyDropCorrections(
    disturbance: DisturbanceDetection,
    inputs: EnergyManagementInputs,
    outputs: EnergyManagementOutputs,
    currentTime: number
  ): RealTimeCorrection[] {
    const corrections: RealTimeCorrection[] = [];
    const sourceId = disturbance.affectedComponents[0];
    const sourceControl = outputs.sourceControls.get(sourceId);
    
    if (sourceControl) {
      // Switch to efficiency-optimized mode
      corrections.push({
        correctionId: `efficiency_boost_${sourceId}_${currentTime}`,
        timestamp: currentTime,
        type: 'efficiency_boost',
        targetComponent: sourceId,
        originalValue: sourceControl.powerSetpoint,
        correctedValue: sourceControl.powerSetpoint * 0.9, // Reduce power to improve efficiency
        reason: 'Efficiency drop detected - switching to efficiency-optimized operation',
        priority: 6,
        duration: disturbance.estimatedDuration * 2 // Longer duration for efficiency recovery
      });
    }
    
    return corrections;
  }

  /**
   * Generate temperature rise corrections
   */
  private generateTemperatureRiseCorrections(
    disturbance: DisturbanceDetection,
    inputs: EnergyManagementInputs,
    outputs: EnergyManagementOutputs,
    currentTime: number
  ): RealTimeCorrection[] {
    const corrections: RealTimeCorrection[] = [];
    const sourceId = disturbance.affectedComponents[0];
    const sourceControl = outputs.sourceControls.get(sourceId);
    
    if (sourceControl) {
      // Reduce power to manage temperature
      const reductionFactor = disturbance.severity === 'critical' ? 0.5 : 
                             disturbance.severity === 'high' ? 0.3 : 0.15;
      
      const correctedPower = sourceControl.powerSetpoint * (1 - reductionFactor);
      
      corrections.push({
        correctionId: `temperature_correction_${sourceId}_${currentTime}`,
        timestamp: currentTime,
        type: 'power_adjustment',
        targetComponent: sourceId,
        originalValue: sourceControl.powerSetpoint,
        correctedValue: correctedPower,
        reason: `Temperature rise detected - reducing power for thermal management`,
        priority: disturbance.severity === 'critical' ? 10 : 7,
        duration: disturbance.estimatedDuration
      });
    }
    
    return corrections;
  }

  /**
   * Generate voltage fluctuation corrections
   */
  private generateVoltageFluctuationCorrections(
    disturbance: DisturbanceDetection,
    inputs: EnergyManagementInputs,
    outputs: EnergyManagementOutputs,
    currentTime: number
  ): RealTimeCorrection[] {
    const corrections: RealTimeCorrection[] = [];
    const componentId = disturbance.affectedComponents[0];
    
    // Apply voltage regulation corrections
    corrections.push({
      correctionId: `voltage_correction_${componentId}_${currentTime}`,
      timestamp: currentTime,
      type: 'power_adjustment',
      targetComponent: componentId,
      originalValue: 0,
      correctedValue: 0,
      reason: 'Voltage fluctuation detected - applying voltage regulation',
      priority: 8,
      duration: disturbance.estimatedDuration
    });
    
    return corrections;
  }

  /**
   * Apply all corrections to outputs
   */
  private applyAllCorrections(
    outputs: EnergyManagementOutputs,
    corrections: RealTimeCorrection[]
  ): EnergyManagementOutputs {
    const correctedOutputs = { ...outputs };
    
    // Sort corrections by priority (highest first)
    const sortedCorrections = corrections.sort((a, b) => b.priority - a.priority);
    
    for (const correction of sortedCorrections) {
      switch (correction.type) {
        case 'power_adjustment':
          this.applyPowerAdjustment(correctedOutputs, correction);
          break;
        case 'load_shedding':
          this.applyLoadShedding(correctedOutputs, correction);
          break;
        case 'efficiency_boost':
          this.applyEfficiencyBoost(correctedOutputs, correction);
          break;
        case 'emergency_response':
          this.applyEmergencyResponse(correctedOutputs, correction);
          break;
      }
    }
    
    // Add correction information to recommendations
    if (corrections.length > 0) {
      correctedOutputs.recommendations.push(
        `Applied ${corrections.length} real-time corrections`,
        ...corrections.map(c => `${c.type}: ${c.reason}`)
      );
    }
    
    return correctedOutputs;
  }

  /**
   * Apply power adjustment correction
   */
  private applyPowerAdjustment(outputs: EnergyManagementOutputs, correction: RealTimeCorrection): void {
    const sourceControl = outputs.sourceControls.get(correction.targetComponent);
    if (sourceControl) {
      sourceControl.powerSetpoint = correction.correctedValue;
    }
    
    const storageControl = outputs.storageControls.get(correction.targetComponent);
    if (storageControl) {
      storageControl.powerSetpoint = correction.correctedValue;
    }
  }

  /**
   * Apply load shedding correction
   */
  private applyLoadShedding(outputs: EnergyManagementOutputs, correction: RealTimeCorrection): void {
    const loadControl = outputs.loadControls.get(correction.targetComponent);
    if (loadControl) {
      loadControl.powerAllocation = correction.correctedValue;
      loadControl.enableLoad = correction.correctedValue > 0;
    }
  }

  /**
   * Apply efficiency boost correction
   */
  private applyEfficiencyBoost(outputs: EnergyManagementOutputs, correction: RealTimeCorrection): void {
    const sourceControl = outputs.sourceControls.get(correction.targetComponent);
    if (sourceControl) {
      sourceControl.operatingMode = 'maximum_efficiency';
      sourceControl.powerSetpoint = correction.correctedValue;
    }
  }

  /**
   * Apply emergency response correction
   */
  private applyEmergencyResponse(outputs: EnergyManagementOutputs, correction: RealTimeCorrection): void {
    // Emergency response - shut down affected component
    const sourceControl = outputs.sourceControls.get(correction.targetComponent);
    if (sourceControl) {
      sourceControl.enableHarvesting = false;
      sourceControl.powerSetpoint = 0;
    }
    
    const loadControl = outputs.loadControls.get(correction.targetComponent);
    if (loadControl) {
      loadControl.enableLoad = false;
      loadControl.powerAllocation = 0;
    }
  }

  /**
   * Update monitoring data
   */
  private updateMonitoringData(inputs?: EnergyManagementInputs, outputs?: EnergyManagementOutputs): void {
    if (!inputs) return;
    
    const currentTime = Date.now();
    const powerFlow = new Map<string, number>();
    const efficiency = new Map<string, number>();
    const temperature = new Map<string, number>();
    const voltage = new Map<string, number>();
    
    // Collect source data
    for (const [sourceId, source] of inputs.sources) {
      powerFlow.set(sourceId, source.power);
      efficiency.set(sourceId, source.efficiency);
      temperature.set(sourceId, source.temperature);
      voltage.set(sourceId, source.voltage);
    }
    
    // Collect storage data
    for (const [storageId, storage] of inputs.storage) {
      powerFlow.set(storageId, storage.power);
      temperature.set(storageId, storage.temperature);
      voltage.set(storageId, storage.voltage);
    }
    
    // Collect load data
    for (const [loadId, load] of inputs.loads) {
      powerFlow.set(loadId, load.power);
    }
    
    this.monitoringData.push({
      timestamp: currentTime,
      powerFlow,
      efficiency,
      temperature,
      voltage
    });
    
    // Keep only last 1000 data points (10 seconds at 10ms intervals)
    if (this.monitoringData.length > 1000) {
      this.monitoringData = this.monitoringData.slice(-1000);
    }
  }

  /**
   * Get recent monitoring data for a component
   */
  private getRecentMonitoringData(componentId: string, dataType: string, timeWindow: number): number[] {
    const cutoffTime = Date.now() - timeWindow;
    const recentData = this.monitoringData.filter(data => data.timestamp > cutoffTime);
    
    const values: number[] = [];
    for (const data of recentData) {
      let value: number | undefined;
      
      switch (dataType) {
        case 'power':
          value = data.powerFlow.get(componentId);
          break;
        case 'efficiency':
          value = data.efficiency.get(componentId);
          break;
        case 'temperature':
          value = data.temperature.get(componentId);
          break;
        case 'voltage':
          value = data.voltage.get(componentId);
          break;
      }
      
      if (value !== undefined) {
        values.push(value);
      }
    }
    
    return values;
  }

  /**
   * Detect disturbances from monitoring data
   */
  private detectDisturbances(): void {
    // This method would analyze monitoring data patterns to detect disturbances
    // Implementation would include statistical analysis, pattern recognition, etc.
  }

  /**
   * Clean up expired corrections
   */
  private cleanupExpiredCorrections(): void {
    const currentTime = Date.now();
    
    for (const [correctionId, correction] of this.activeCorrections) {
      if (currentTime - correction.timestamp > correction.duration) {
        this.activeCorrections.delete(correctionId);
      }
    }
    
    // Clean up old disturbances
    for (const [disturbanceId, disturbance] of this.detectedDisturbances) {
      if (currentTime - disturbance.timestamp > disturbance.estimatedDuration * 2) {
        this.detectedDisturbances.delete(disturbanceId);
      }
    }
  }

  /**
   * Get active corrections
   */
  public getActiveCorrections(): Map<string, RealTimeCorrection> {
    return new Map(this.activeCorrections);
  }

  /**
   * Get detected disturbances
   */
  public getDetectedDisturbances(): Map<string, DisturbanceDetection> {
    return new Map(this.detectedDisturbances);
  }

  /**
   * Get monitoring data
   */
  public getMonitoringData(timeWindow?: number): typeof this.monitoringData {
    if (timeWindow) {
      const cutoffTime = Date.now() - timeWindow;
      return this.monitoringData.filter(data => data.timestamp > cutoffTime);
    }
    return [...this.monitoringData];
  }

  /**
   * Update configuration
   */
  public updateConfiguration(config: EnergyManagementConfig): void {
    this.config = config;
    // Update real-time control parameters based on new config
  }

  /**
   * Shutdown
   */
  public shutdown(): void {
    this.activeCorrections.clear();
    this.detectedDisturbances.clear();
    console.log('Real-Time Energy Controller: Shutdown complete');
  }
}