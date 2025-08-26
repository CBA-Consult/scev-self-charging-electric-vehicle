/**
 * TEG Impact Study Module
 * 
 * Comprehensive module for studying the impact of Thermoelectric Generators (TEGs)
 * on overall vehicle efficiency, including fuel consumption, emissions reduction,
 * and energy recovery analysis.
 */

export { TEGImpactStudy } from './TEGImpactStudy';
export { TEGSystemModel } from './TEGSystemModel';
export { VehicleIntegrationAnalyzer } from './VehicleIntegrationAnalyzer';
export { PerformanceMonitor } from './PerformanceMonitor';
export { EfficiencyAnalyzer } from './EfficiencyAnalyzer';
export { EmissionsAnalyzer } from './EmissionsAnalyzer';
export { DataCollector } from './DataCollector';
export { OptimizationEngine } from './OptimizationEngine';
export { ReportGenerator } from './ReportGenerator';

// Type definitions
export * from './types/TEGTypes';
export * from './types/VehicleTypes';
export * from './types/AnalysisTypes';
export * from './types/PerformanceTypes';

// Utility functions
export * from './utils/TEGCalculations';
export * from './utils/VehicleCalculations';
export * from './utils/DataAnalysis';
export * from './utils/ReportUtils';

// Configuration presets
export * from './config/VehiclePresets';
export * from './config/TEGPresets';
export * from './config/TestPresets';

/**
 * Create a new TEG Impact Study instance with default configuration
 */
export function createTEGImpactStudy(
  vehicleConfig?: Partial<VehicleConfiguration>,
  tegConfig?: Partial<TEGConfiguration>
): TEGImpactStudy {
  return new TEGImpactStudy(vehicleConfig, tegConfig);
}

/**
 * Create a TEG system model for analysis
 */
export function createTEGSystemModel(config: TEGConfiguration): TEGSystemModel {
  return new TEGSystemModel(config);
}

/**
 * Create a vehicle integration analyzer
 */
export function createVehicleIntegrationAnalyzer(
  vehicleConfig: VehicleConfiguration,
  tegConfig: TEGConfiguration
): VehicleIntegrationAnalyzer {
  return new VehicleIntegrationAnalyzer(vehicleConfig, tegConfig);
}

/**
 * Create a performance monitor for real-time data collection
 */
export function createPerformanceMonitor(config: PerformanceMonitorConfig): PerformanceMonitor {
  return new PerformanceMonitor(config);
}

/**
 * Create an efficiency analyzer for fuel consumption and energy recovery analysis
 */
export function createEfficiencyAnalyzer(
  vehicleConfig: VehicleConfiguration,
  tegConfig: TEGConfiguration
): EfficiencyAnalyzer {
  return new EfficiencyAnalyzer(vehicleConfig, tegConfig);
}

/**
 * Create an emissions analyzer for environmental impact assessment
 */
export function createEmissionsAnalyzer(
  vehicleConfig: VehicleConfiguration,
  emissionsConfig: EmissionsAnalysisConfig
): EmissionsAnalyzer {
  return new EmissionsAnalyzer(vehicleConfig, emissionsConfig);
}

/**
 * Create a data collector for comprehensive data management
 */
export function createDataCollector(config: DataCollectionConfig): DataCollector {
  return new DataCollector(config);
}

/**
 * Create an optimization engine for performance improvement recommendations
 */
export function createOptimizationEngine(
  vehicleConfig: VehicleConfiguration,
  tegConfig: TEGConfiguration
): OptimizationEngine {
  return new OptimizationEngine(vehicleConfig, tegConfig);
}

/**
 * Create a report generator for analysis visualization and reporting
 */
export function createReportGenerator(config: ReportGeneratorConfig): ReportGenerator {
  return new ReportGenerator(config);
}

// Import types for re-export
import { 
  VehicleConfiguration, 
  TEGConfiguration, 
  PerformanceMonitorConfig,
  EmissionsAnalysisConfig,
  DataCollectionConfig,
  ReportGeneratorConfig
} from './types/TEGTypes';