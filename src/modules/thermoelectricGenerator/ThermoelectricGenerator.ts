/**
 * Thermoelectric Generator (TEG) Core Implementation
 * 
 * This class implements the core functionality for thermoelectric generators
 * in the SCEV system, focusing on waste heat recovery and environmental
 * impact optimization.
 */

import {
  TEGModule,
  TEGMaterial,
  ThermalConditions,
  TEGPerformance,
  EnvironmentalMetrics,
  TEGSystemConfig,
  TEGOptimizationParams,
  TEGDiagnostics,
  TEGLifecycleData
} from './types';

export class ThermoelectricGenerator {
  private modules: Map<string, TEGModule> = new Map();
  private performanceHistory: Map<string, TEGPerformance[]> = new Map();
  private environmentalData: Map<string, EnvironmentalMetrics[]> = new Map();
  private lifecycleData: Map<string, TEGLifecycleData> = new Map();
  private config: TEGSystemConfig;

  constructor(config: TEGSystemConfig) {
    this.config = config;
    this.initializeModules();
  }

  /**
   * Initialize TEG modules based on configuration
   */
  private initializeModules(): void {
    this.config.modules.forEach(module => {
      this.modules.set(module.id, module);
      this.performanceHistory.set(module.id, []);
      this.environmentalData.set(module.id, []);
      
      // Initialize lifecycle data
      this.lifecycleData.set(module.id, {
        manufacturingData: {
          productionDate: new Date(),
          materialSources: [module.materials.nType.name, module.materials.pType.name],
          carbonFootprint: this.calculateManufacturingFootprint(module),
          energyConsumption: this.calculateManufacturingEnergy(module),
          wasteGenerated: this.calculateManufacturingWaste(module)
        },
        operationalData: {
          installationDate: new Date(),
          totalEnergyGenerated: 0,
          totalCarbonOffset: 0,
          maintenanceHistory: [],
          performanceDegradation: 0.5 // 0.5% per year default
        }
      });
    });
  }

  /**
   * Calculate power generation based on thermal conditions
   */
  public calculatePowerGeneration(
    moduleId: string,
    thermalConditions: ThermalConditions
  ): TEGPerformance {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    // Seebeck effect calculation
    const seebeckVoltage = this.calculateSeebeckVoltage(module, thermalConditions);
    
    // Internal resistance calculation
    const internalResistance = this.calculateInternalResistance(module, thermalConditions);
    
    // Load resistance optimization (maximum power transfer)
    const loadResistance = internalResistance;
    
    // Power calculation
    const current = seebeckVoltage / (internalResistance + loadResistance);
    const voltage = current * loadResistance;
    const powerOutput = voltage * current;
    
    // Efficiency calculation
    const heatInput = thermalConditions.heatFlowRate;
    const efficiency = heatInput > 0 ? (powerOutput / heatInput) * 100 : 0;
    
    // Thermal efficiency (Carnot efficiency as theoretical maximum)
    const carnotEfficiency = (1 - (thermalConditions.coldSideTemp + 273.15) / 
                             (thermalConditions.hotSideTemp + 273.15)) * 100;
    const thermalEfficiency = Math.min(efficiency, carnotEfficiency * 0.3); // Practical limit ~30% of Carnot
    
    const performance: TEGPerformance = {
      powerOutput: Math.max(0, powerOutput),
      voltage: Math.max(0, voltage),
      current: Math.max(0, current),
      efficiency: Math.max(0, efficiency),
      thermalEfficiency: Math.max(0, thermalEfficiency),
      heatRecovered: powerOutput,
      operatingTime: this.getOperatingTime(moduleId)
    };

    // Store performance data
    this.performanceHistory.get(moduleId)?.push(performance);
    
    // Update lifecycle data
    this.updateOperationalData(moduleId, performance);
 * Thermoelectric Generator (TEG) System Implementation
 * 
 * This class implements thermoelectric generators for converting waste heat
 * from braking systems into electrical energy using the Seebeck effect.
 */

import {
  ThermoelectricMaterial,
  TEGConfiguration,
  ThermalConditions,
  TEGPerformance,
  defaultTEGMaterials,
  defaultTEGConfigurations
} from './types';

import {
  calculateSeebeckCoefficient,
  calculateThermalConductivity,
  calculateElectricalResistivity,
  calculateZTValue,
  validateTEGConfiguration,
  calculateOptimalLoadResistance,
  validateThermalConditions
} from './utils';

export interface TEGSystemInputs {
  thermalConditions: ThermalConditions;
  loadResistance?: number;           // Ω - External load resistance
  operatingMode: 'maximum_power' | 'maximum_efficiency' | 'constant_voltage';
  coolingSystemActive: boolean;
  thermalProtectionEnabled: boolean;
}

export interface TEGOptimizationResult {
  optimalConfiguration: TEGConfiguration;
  expectedPerformance: TEGPerformance;
  optimizationScore: number;
  convergenceIterations: number;
}

export class ThermoelectricGenerator {
  private tegConfigurations: Map<string, TEGConfiguration>;
  private materials: Map<string, ThermoelectricMaterial>;
  private performanceHistory: TEGPerformance[];
  private systemReliability: number;
  private thermalProtectionActive: boolean;
  private maxOperatingTemperature: number;

  constructor() {
    this.tegConfigurations = new Map();
    this.materials = new Map();
    this.performanceHistory = [];
    this.systemReliability = 0.98;
    this.thermalProtectionActive = true;
    this.maxOperatingTemperature = 300; // °C

    this.initializeTEGMaterials();
    this.initializeTEGConfigurations();
  }

  /**
   * Initialize thermoelectric materials database
   */
  private initializeTEGMaterials(): void {
    Object.entries(defaultTEGMaterials).forEach(([key, material]) => {
      this.materials.set(key, material);
    });

    // Add advanced materials for high-temperature applications
    this.materials.set('CoSb3_nType', {
      name: 'Cobalt Antimonide (n-type)',
      type: 'n-type',
      seebeckCoefficient: -250,
      electricalConductivity: 30000,
      thermalConductivity: 3.5,
      ztValue: 1.2,
      operatingTempRange: { min: 300, max: 700 },
      density: 7600,
      specificHeat: 230,
      thermalExpansion: 12e-6,
      cost: 400
    });

    this.materials.set('CoSb3_pType', {
      name: 'Cobalt Antimonide (p-type)',
      type: 'p-type',
      seebeckCoefficient: 250,
      electricalConductivity: 25000,
      thermalConductivity: 3.2,
      ztValue: 1.2,
      operatingTempRange: { min: 300, max: 700 },
      density: 7600,
      specificHeat: 230,
      thermalExpansion: 12e-6,
      cost: 400
    });
  }

  /**
   * Initialize standard TEG configurations
   */
  private initializeTEGConfigurations(): void {
    Object.entries(defaultTEGConfigurations).forEach(([key, config]) => {
      this.tegConfigurations.set(key, config);
    });

    // Add high-performance brake disc TEG
    const highPerfMaterial_n = this.materials.get('CoSb3_nType')!;
    const highPerfMaterial_p = this.materials.get('CoSb3_pType')!;

    this.tegConfigurations.set('high_performance_brake_teg', {
      id: 'high_performance_brake_teg',
      type: 'cascaded',
      dimensions: { length: 120, width: 100, height: 20 },
      thermoelectricPairs: 200,
      pTypeMaterial: highPerfMaterial_p,
      nTypeMaterial: highPerfMaterial_n,
      legDimensions: { length: 4, crossSectionalArea: 6 },
      electricalConfiguration: 'series',
      heatExchanger: {
        hotSideType: 'heat_pipe',
        coldSideType: 'liquid_cooled',
        hotSideArea: 120,
        coldSideArea: 180,
        thermalResistance: { hotSide: 0.03, coldSide: 0.08 }
      },
      placement: {
        location: 'brake_disc',
        mountingType: 'heat_pipe_coupled',
        thermalInterfaceMaterial: 'liquid_metal'
      }
    });
  }

  /**
   * Calculate TEG power output based on thermal conditions
   */
  public calculateTEGPower(
    configId: string,
    inputs: TEGSystemInputs
  ): TEGPerformance {
    const config = this.tegConfigurations.get(configId);
    if (!config) {
      throw new Error(`TEG configuration '${configId}' not found`);
    }

    // Validate thermal conditions
    const validation = validateThermalConditions(inputs.thermalConditions, config);
    if (!validation.isValid) {
      throw new Error(`Invalid thermal conditions: ${validation.errors.join(', ')}`);
    }

    // Apply thermal protection if enabled
    if (inputs.thermalProtectionEnabled && this.thermalProtectionActive) {
      this.applyThermalProtection(inputs.thermalConditions, config);
    }

    // Calculate temperature-dependent material properties
    const avgTemperature = (inputs.thermalConditions.hotSideTemperature + inputs.thermalConditions.coldSideTemperature) / 2;
    const temperatureEffects = this.calculateTemperatureEffects(config, avgTemperature);

    // Calculate basic thermoelectric parameters
    const seebeckCoeff = calculateSeebeckCoefficient(config.pTypeMaterial, config.nTypeMaterial) * temperatureEffects.seebeckFactor;
    const thermalConductance = calculateThermalConductivity(config.pTypeMaterial, config.nTypeMaterial, config.legDimensions);
    const internalResistance = calculateElectricalResistivity(config.pTypeMaterial, config.nTypeMaterial, config.legDimensions) * temperatureEffects.resistanceFactor;

    // Calculate temperature difference across TEG
    const temperatureDifference = this.calculateEffectiveTemperatureDifference(inputs.thermalConditions, config);

    // Calculate open-circuit voltage
    const openCircuitVoltage = seebeckCoeff * temperatureDifference * config.thermoelectricPairs * 1e-6; // Convert μV to V

    // Determine load resistance based on operating mode
    const loadResistance = this.determineLoadResistance(inputs, internalResistance);

    // Calculate electrical output
    const current = openCircuitVoltage / (internalResistance + loadResistance);
    const voltage = current * loadResistance;
    const electricalPower = voltage * current;

    // Calculate heat flows
    const heatInput = this.calculateHeatInput(inputs.thermalConditions, config, current, temperatureDifference);
    const heatRejected = heatInput - electricalPower;

    // Calculate efficiency
    const efficiency = (electricalPower / heatInput) * 100;

    // Calculate power density
    const tegMass = this.calculateTEGMass(config);
    const powerDensity = electricalPower / tegMass;

    // Calculate reliability and lifespan
    const reliability = this.calculateReliability(config, inputs.thermalConditions, temperatureEffects);
    const lifespan = this.estimateLifespan(config, inputs.thermalConditions, temperatureEffects);

    const performance: TEGPerformance = {
      electricalPower,
      voltage,
      current,
      efficiency,
      powerDensity,
      heatInput,
      heatRejected,
      temperatureDifference,
      internalResistance,
      thermalResistance: 1 / thermalConductance,
      reliability: reliability * 100,
      lifespan
    };

    // Store performance data
    this.performanceHistory.push(performance);
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory.shift(); // Keep only recent data
    }

    return performance;
  }

  /**
   * Calculate Seebeck voltage based on temperature differential
   */
  private calculateSeebeckVoltage(
    module: TEGModule,
    thermalConditions: ThermalConditions
  ): number {
    const nTypeSeebeck = module.materials.nType.seebeckCoefficient * 1e-6; // Convert μV/K to V/K
    const pTypeSeebeck = module.materials.pType.seebeckCoefficient * 1e-6;
    
    // Total Seebeck coefficient (n-type - p-type for maximum voltage)
    const totalSeebeck = Math.abs(nTypeSeebeck) + Math.abs(pTypeSeebeck);
    
    return totalSeebeck * thermalConditions.temperatureDifferential;
  }

  /**
   * Calculate internal resistance based on material properties and temperature
   */
  private calculateInternalResistance(
    module: TEGModule,
    thermalConditions: ThermalConditions
  ): number {
    const avgTemp = (thermalConditions.hotSideTemp + thermalConditions.coldSideTemp) / 2;
    
    // Temperature coefficient for resistance (typical 0.3%/°C)
    const tempCoeff = 0.003;
    const tempFactor = 1 + tempCoeff * (avgTemp - 25);
    
    // Base resistance calculation (simplified)
    const nTypeConductivity = module.materials.nType.electricalConductivity * tempFactor;
    const pTypeConductivity = module.materials.pType.electricalConductivity * tempFactor;
    
    // Geometric factors
    const length = module.dimensions.height / 1000; // Convert mm to m
    const area = (module.dimensions.length * module.dimensions.width) / 1e6; // Convert mm² to m²
    
    const nTypeResistance = length / (nTypeConductivity * area / 2);
    const pTypeResistance = length / (pTypeConductivity * area / 2);
    
    return nTypeResistance + pTypeResistance;
  }

  /**
   * Calculate environmental impact metrics
   */
  public calculateEnvironmentalImpact(
    moduleId: string,
    performance: TEGPerformance,
    operatingHours: number
  ): EnvironmentalMetrics {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    const energyRecovered = (performance.powerOutput * operatingHours) / 1000; // kWh
    
    // Carbon offset calculation (assuming grid carbon intensity of 0.5 kg CO2/kWh)
    const gridCarbonIntensity = 0.5;
    const carbonOffset = energyRecovered * gridCarbonIntensity;
    
    // Material impact calculation
    const nTypeMaterialImpact = this.calculateMaterialImpact(module.materials.nType);
    const pTypeMaterialImpact = this.calculateMaterialImpact(module.materials.pType);
    const totalMaterialImpact = nTypeMaterialImpact + pTypeMaterialImpact;
    
    // Recyclability score
    const recyclabilityScore = (
      module.materials.nType.environmentalImpact.recyclability +
      module.materials.pType.environmentalImpact.recyclability
    ) / 2;

    const environmentalMetrics: EnvironmentalMetrics = {
      carbonOffset,
      energyRecovered,
      wasteHeatUtilized: energyRecovered / (performance.efficiency / 100),
      materialImpact: totalMaterialImpact,
      recyclabilityScore,
      lifecycleStage: 'operation'
    };

    // Store environmental data
    this.environmentalData.get(moduleId)?.push(environmentalMetrics);

    return environmentalMetrics;
  }

  /**
   * Optimize TEG system performance based on parameters
   */
  public optimizePerformance(params: TEGOptimizationParams): void {
    this.modules.forEach((module, moduleId) => {
      // Performance-based optimization
      if (params.environmentalPriority === 'performance') {
        this.optimizeForPerformance(moduleId, params);
      }
      // Sustainability-based optimization
      else if (params.environmentalPriority === 'sustainability') {
        this.optimizeForSustainability(moduleId, params);
      }
      // Balanced optimization
      else {
        this.optimizeBalanced(moduleId, params);
      }
    });
  }

  /**
   * Perform system diagnostics
   */
  public performDiagnostics(): TEGDiagnostics {
    const moduleHealth: { [moduleId: string]: any } = {};
    let totalPowerOutput = 0;
    let totalEfficiency = 0;
    let moduleCount = 0;

    this.modules.forEach((module, moduleId) => {
      const recentPerformance = this.getRecentPerformance(moduleId);
      const health = this.assessModuleHealth(moduleId, recentPerformance);
      
      moduleHealth[moduleId] = health;
      
      if (recentPerformance) {
        totalPowerOutput += recentPerformance.powerOutput;
        totalEfficiency += recentPerformance.efficiency;
        moduleCount++;
      }
    });

    const overallEfficiency = moduleCount > 0 ? totalEfficiency / moduleCount : 0;

    return {
      moduleHealth,
      systemHealth: {
        overallEfficiency,
        totalPowerOutput,
        thermalStability: this.assessThermalStability(),
        powerQuality: {
          voltageStability: this.assessVoltageStability(),
          harmonicDistortion: this.assessHarmonicDistortion()
        }
      }
    };
  }

  /**
   * Get comprehensive system performance data
   */
  public getSystemPerformance(): {
    totalPowerOutput: number;
    averageEfficiency: number;
    totalEnergyGenerated: number;
    totalCarbonOffset: number;
    systemReliability: number;
  } {
    let totalPowerOutput = 0;
    let totalEfficiency = 0;
    let totalEnergyGenerated = 0;
    let totalCarbonOffset = 0;
    let activeModules = 0;

    this.modules.forEach((module, moduleId) => {
      if (module.operationalStatus === 'active') {
        const recentPerformance = this.getRecentPerformance(moduleId);
        if (recentPerformance) {
          totalPowerOutput += recentPerformance.powerOutput;
          totalEfficiency += recentPerformance.efficiency;
          activeModules++;
        }

        const lifecycleData = this.lifecycleData.get(moduleId);
        if (lifecycleData) {
          totalEnergyGenerated += lifecycleData.operationalData.totalEnergyGenerated;
          totalCarbonOffset += lifecycleData.operationalData.totalCarbonOffset;
        }
      }
    });

    const averageEfficiency = activeModules > 0 ? totalEfficiency / activeModules : 0;
    const systemReliability = (activeModules / this.modules.size) * 100;

    return {
      totalPowerOutput,
      averageEfficiency,
      totalEnergyGenerated,
      totalCarbonOffset,
      systemReliability
    };
  }

  // Private helper methods

  private calculateManufacturingFootprint(module: TEGModule): number {
    const nTypeFootprint = module.materials.nType.environmentalImpact.carbonFootprint;
    const pTypeFootprint = module.materials.pType.environmentalImpact.carbonFootprint;
    
    // Estimate material mass (simplified calculation)
    const volume = (module.dimensions.length * module.dimensions.width * module.dimensions.height) / 1e9; // m³
    const estimatedMass = volume * 5000; // Assume 5000 kg/m³ density
    
    return (nTypeFootprint + pTypeFootprint) * estimatedMass / 2;
  }

  private calculateManufacturingEnergy(module: TEGModule): number {
    // Simplified energy calculation based on module size
    const volume = (module.dimensions.length * module.dimensions.width * module.dimensions.height) / 1e9;
    return volume * 50000; // 50 MJ/m³ estimated manufacturing energy
  }

  private calculateManufacturingWaste(module: TEGModule): number {
    // Estimate 5-8% material waste during manufacturing
    const volume = (module.dimensions.length * module.dimensions.width * module.dimensions.height) / 1e9;
    const estimatedMass = volume * 5000;
    return estimatedMass * 0.065; // 6.5% waste factor
  }

  private calculateMaterialImpact(material: TEGMaterial): number {
    // Simplified material impact calculation
    return material.environmentalImpact.carbonFootprint * 0.1; // Assume 0.1 kg material per module
  }

  private getOperatingTime(moduleId: string): number {
    const lifecycleData = this.lifecycleData.get(moduleId);
    if (!lifecycleData) return 0;
    
    const installDate = lifecycleData.operationalData.installationDate;
    const now = new Date();
    return (now.getTime() - installDate.getTime()) / (1000 * 60 * 60); // Hours
  }

  private updateOperationalData(moduleId: string, performance: TEGPerformance): void {
    const lifecycleData = this.lifecycleData.get(moduleId);
    if (!lifecycleData) return;

    // Update total energy generated (assuming 1-hour interval)
    lifecycleData.operationalData.totalEnergyGenerated += performance.powerOutput / 1000;
    
    // Update carbon offset
    lifecycleData.operationalData.totalCarbonOffset += (performance.powerOutput / 1000) * 0.5;
  }

  private optimizeForPerformance(moduleId: string, params: TEGOptimizationParams): void {
    const module = this.modules.get(moduleId);
    if (!module) return;

    // Implement performance optimization logic
    // This could include adjusting thermal management, load matching, etc.
  }

  private optimizeForSustainability(moduleId: string, params: TEGOptimizationParams): void {
    const module = this.modules.get(moduleId);
    if (!module) return;

    // Implement sustainability optimization logic
    // Focus on minimizing environmental impact while maintaining acceptable performance
  }

  private optimizeBalanced(moduleId: string, params: TEGOptimizationParams): void {
    const module = this.modules.get(moduleId);
    if (!module) return;

    // Implement balanced optimization logic
    // Balance between performance and sustainability
  }

  private getRecentPerformance(moduleId: string): TEGPerformance | null {
    const history = this.performanceHistory.get(moduleId);
    if (!history || history.length === 0) return null;
    
    return history[history.length - 1];
  }

  private assessModuleHealth(moduleId: string, performance: TEGPerformance | null): any {
    const module = this.modules.get(moduleId);
    if (!module || !performance) {
      return {
        status: 'unknown',
        performanceRatio: 0,
        estimatedRemainingLife: 0,
        maintenanceRequired: true,
        faultCodes: ['NO_DATA']
      };
    }

    const performanceRatio = (performance.powerOutput / module.maxPowerOutput) * 100;
    let status: 'healthy' | 'degraded' | 'critical' | 'failed' = 'healthy';
    
    if (performanceRatio < 50) status = 'failed';
    else if (performanceRatio < 70) status = 'critical';
    else if (performanceRatio < 85) status = 'degraded';

    // Estimate remaining life based on degradation rate
    const lifecycleData = this.lifecycleData.get(moduleId);
    const degradationRate = lifecycleData?.operationalData.performanceDegradation || 0.5;
    const currentAge = this.getOperatingTime(moduleId);
    const estimatedTotalLife = 131400; // 15 years * 8760 hours
    const estimatedRemainingLife = Math.max(0, estimatedTotalLife - currentAge);

    return {
      status,
      performanceRatio,
      estimatedRemainingLife,
      maintenanceRequired: status === 'critical' || status === 'failed',
      faultCodes: status === 'healthy' ? [] : [`PERFORMANCE_${status.toUpperCase()}`]
    };
  }

  private assessThermalStability(): boolean {
    // Simplified thermal stability assessment
    // In a real implementation, this would analyze temperature variations
    return true;
  }

  private assessVoltageStability(): number {
    // Simplified voltage stability assessment
    // Return percentage of voltage stability
    return 95;
  }

  private assessHarmonicDistortion(): number {
    // Simplified harmonic distortion assessment
    // Return percentage of harmonic distortion
    return 3;
  }
   * Calculate temperature effects on material properties
   */
  private calculateTemperatureEffects(
    config: TEGConfiguration,
    temperature: number
  ): {
    seebeckFactor: number;
    resistanceFactor: number;
    thermalConductivityFactor: number;
  } {
    // Temperature dependence of Seebeck coefficient (typically increases with temperature)
    const seebeckFactor = 1 + 0.001 * (temperature - 25); // 0.1% increase per °C

    // Temperature dependence of electrical resistance (typically increases with temperature)
    const resistanceFactor = 1 + 0.004 * (temperature - 25); // 0.4% increase per °C

    // Temperature dependence of thermal conductivity (material-dependent)
    const thermalConductivityFactor = 1 + 0.002 * (temperature - 25); // 0.2% increase per °C

    return {
      seebeckFactor: Math.max(0.5, Math.min(2.0, seebeckFactor)),
      resistanceFactor: Math.max(0.8, Math.min(3.0, resistanceFactor)),
      thermalConductivityFactor: Math.max(0.8, Math.min(1.5, thermalConductivityFactor))
    };
  }

  /**
   * Calculate effective temperature difference considering thermal resistances
   */
  private calculateEffectiveTemperatureDifference(
    conditions: ThermalConditions,
    config: TEGConfiguration
  ): number {
    // Account for thermal resistances in heat exchangers
    const hotSideResistance = config.heatExchanger.thermalResistance.hotSide;
    const coldSideResistance = config.heatExchanger.thermalResistance.coldSide;
    
    // Estimate heat flow based on conditions
    const estimatedHeatFlow = conditions.heatFlux * config.heatExchanger.hotSideArea / 10000; // Convert cm² to m²

    // Calculate temperature drops across thermal resistances
    const hotSideDrop = estimatedHeatFlow * hotSideResistance;
    const coldSideRise = estimatedHeatFlow * coldSideResistance;

    // Effective temperatures at TEG surfaces
    const effectiveHotTemp = conditions.hotSideTemperature - hotSideDrop;
    const effectiveColdTemp = conditions.coldSideTemperature + coldSideRise;

    return Math.max(0, effectiveHotTemp - effectiveColdTemp);
  }

  /**
   * Determine load resistance based on operating mode
   */
  private determineLoadResistance(
    inputs: TEGSystemInputs,
    internalResistance: number
  ): number {
    if (inputs.loadResistance !== undefined) {
      return inputs.loadResistance;
    }

    switch (inputs.operatingMode) {
      case 'maximum_power':
        return internalResistance; // Maximum power transfer theorem
      case 'maximum_efficiency':
        return internalResistance * 3; // Approximately optimal for efficiency
      case 'constant_voltage':
        return internalResistance * 10; // High load resistance for stable voltage
      default:
        return internalResistance;
    }
  }

  /**
   * Calculate heat input to TEG
   */
  private calculateHeatInput(
    conditions: ThermalConditions,
    config: TEGConfiguration,
    current: number,
    temperatureDifference: number
  ): number {
    // Heat input consists of:
    // 1. Seebeck heat: S * I * Th
    // 2. Conduction heat: K * ΔT
    // 3. Half of Joule heating: 0.5 * I² * R

    const seebeckCoeff = calculateSeebeckCoefficient(config.pTypeMaterial, config.nTypeMaterial);
    const thermalConductance = calculateThermalConductivity(config.pTypeMaterial, config.nTypeMaterial, config.legDimensions);
    const internalResistance = calculateElectricalResistivity(config.pTypeMaterial, config.nTypeMaterial, config.legDimensions);

    const seebeckHeat = seebeckCoeff * current * (conditions.hotSideTemperature + 273.15) * config.thermoelectricPairs * 1e-6;
    const conductionHeat = thermalConductance * temperatureDifference;
    const jouleHeat = 0.5 * Math.pow(current, 2) * internalResistance;

    return seebeckHeat + conductionHeat + jouleHeat;
  }

  /**
   * Calculate TEG mass
   */
  private calculateTEGMass(config: TEGConfiguration): number {
    const legVolume = config.legDimensions.length * config.legDimensions.crossSectionalArea * 1e-9; // m³
    const pTypeMass = legVolume * config.pTypeMaterial.density * config.thermoelectricPairs;
    const nTypeMass = legVolume * config.nTypeMaterial.density * config.thermoelectricPairs;
    
    // Add estimated mass for substrates, interconnects, and housing (approximately 50% of TE material mass)
    const structuralMass = (pTypeMass + nTypeMass) * 0.5;
    
    return pTypeMass + nTypeMass + structuralMass;
  }

  /**
   * Calculate system reliability
   */
  private calculateReliability(
    config: TEGConfiguration,
    conditions: ThermalConditions,
    temperatureEffects: any
  ): number {
    // Base reliability
    let reliability = this.systemReliability;

    // Temperature stress factor
    const maxOpTemp = Math.min(config.pTypeMaterial.operatingTempRange.max, config.nTypeMaterial.operatingTempRange.max);
    const tempStress = conditions.hotSideTemperature / maxOpTemp;
    reliability *= Math.max(0.7, 1 - 0.3 * Math.pow(tempStress, 2));

    // Thermal cycling stress
    const thermalCyclingFactor = Math.max(0.8, 1 - 0.001 * conditions.brakingDuration);
    reliability *= thermalCyclingFactor;

    // Material degradation factor
    const degradationFactor = Math.max(0.9, 1 - 0.1 * temperatureEffects.resistanceFactor);
    reliability *= degradationFactor;

    return Math.max(0.5, reliability);
  }

  /**
   * Estimate operational lifespan
   */
  private estimateLifespan(
    config: TEGConfiguration,
    conditions: ThermalConditions,
    temperatureEffects: any
  ): number {
    const baseLifespan = 87600; // 10 years in hours

    // Temperature derating
    const maxOpTemp = Math.min(config.pTypeMaterial.operatingTempRange.max, config.nTypeMaterial.operatingTempRange.max);
    const tempFactor = Math.pow(0.9, (conditions.hotSideTemperature - 100) / 50); // Exponential derating above 100°C

    // Thermal cycling derating
    const cyclingFactor = Math.pow(0.95, conditions.brakingDuration / 3600); // Derating for long braking events

    // Material stability factor
    const stabilityFactor = Math.min(config.pTypeMaterial.ztValue, config.nTypeMaterial.ztValue) / 1.5; // Higher ZT materials may be less stable

    return baseLifespan * tempFactor * cyclingFactor * stabilityFactor;
  }

  /**
   * Apply thermal protection measures
   */
  private applyThermalProtection(
    conditions: ThermalConditions,
    config: TEGConfiguration
  ): void {
    const maxOpTemp = Math.min(config.pTypeMaterial.operatingTempRange.max, config.nTypeMaterial.operatingTempRange.max);
    
    if (conditions.hotSideTemperature > maxOpTemp * 0.9) {
      console.warn(`TEG approaching maximum operating temperature: ${conditions.hotSideTemperature}°C (max: ${maxOpTemp}°C)`);
    }

    if (conditions.hotSideTemperature > this.maxOperatingTemperature) {
      throw new Error(`TEG temperature (${conditions.hotSideTemperature}°C) exceeds safety limit (${this.maxOperatingTemperature}°C)`);
    }
  }

  /**
   * Optimize TEG configuration for specific operating conditions
   */
  public optimizeTEGConfiguration(
    baseConfigId: string,
    targetConditions: ThermalConditions,
    constraints: {
      maxCost?: number;
      maxSize?: { length: number; width: number; height: number };
      minPower?: number;
      minEfficiency?: number;
    }
  ): TEGOptimizationResult {
    const baseConfig = this.tegConfigurations.get(baseConfigId);
    if (!baseConfig) {
      throw new Error(`Base configuration '${baseConfigId}' not found`);
    }

    let bestConfig = { ...baseConfig };
    let bestScore = 0;
    let iterations = 0;
    const maxIterations = 100;

    // Optimization parameters
    const parameterRanges = {
      thermoelectricPairs: { min: 50, max: 500, step: 10 },
      legLength: { min: 2, max: 8, step: 0.5 },
      legArea: { min: 2, max: 12, step: 1 }
    };

    for (let pairs = parameterRanges.thermoelectricPairs.min; 
         pairs <= parameterRanges.thermoelectricPairs.max; 
         pairs += parameterRanges.thermoelectricPairs.step) {
      
      for (let legLength = parameterRanges.legLength.min; 
           legLength <= parameterRanges.legLength.max; 
           legLength += parameterRanges.legLength.step) {
        
        for (let legArea = parameterRanges.legArea.min; 
             legArea <= parameterRanges.legArea.max; 
             legArea += parameterRanges.legArea.step) {
          
          iterations++;
          if (iterations > maxIterations) break;

          // Create test configuration
          const testConfig: TEGConfiguration = {
            ...baseConfig,
            thermoelectricPairs: pairs,
            legDimensions: {
              length: legLength,
              crossSectionalArea: legArea
            }
          };

          // Check constraints
          if (!this.meetsConstraints(testConfig, constraints)) {
            continue;
          }

          try {
            // Calculate performance
            const performance = this.calculateTEGPower(baseConfigId, {
              thermalConditions: targetConditions,
              operatingMode: 'maximum_power',
              coolingSystemActive: true,
              thermalProtectionEnabled: true
            });

            // Calculate optimization score
            const score = this.calculateOptimizationScore(performance, constraints);

            if (score > bestScore) {
              bestScore = score;
              bestConfig = { ...testConfig };
            }
          } catch (error) {
            // Skip invalid configurations
            continue;
          }
        }
      }
    }

    // Calculate final performance for best configuration
    const finalPerformance = this.calculateTEGPower(baseConfigId, {
      thermalConditions: targetConditions,
      operatingMode: 'maximum_power',
      coolingSystemActive: true,
      thermalProtectionEnabled: true
    });

    return {
      optimalConfiguration: bestConfig,
      expectedPerformance: finalPerformance,
      optimizationScore: bestScore,
      convergenceIterations: iterations
    };
  }

  /**
   * Check if configuration meets constraints
   */
  private meetsConstraints(
    config: TEGConfiguration,
    constraints: any
  ): boolean {
    // Size constraints
    if (constraints.maxSize) {
      if (config.dimensions.length > constraints.maxSize.length ||
          config.dimensions.width > constraints.maxSize.width ||
          config.dimensions.height > constraints.maxSize.height) {
        return false;
      }
    }

    // Cost constraints (simplified)
    if (constraints.maxCost) {
      const estimatedCost = config.thermoelectricPairs * 10; // Simplified cost model
      if (estimatedCost > constraints.maxCost) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate optimization score
   */
  private calculateOptimizationScore(
    performance: TEGPerformance,
    constraints: any
  ): number {
    let score = 0;

    // Power score (weighted 40%)
    score += performance.electricalPower * 0.4;

    // Efficiency score (weighted 30%)
    score += performance.efficiency * 0.3;

    // Power density score (weighted 20%)
    score += performance.powerDensity * 0.2;

    // Reliability score (weighted 10%)
    score += performance.reliability * 0.1;

    // Apply constraint penalties
    if (constraints.minPower && performance.electricalPower < constraints.minPower) {
      score *= 0.5;
    }

    if (constraints.minEfficiency && performance.efficiency < constraints.minEfficiency) {
      score *= 0.5;
    }

    return score;
  }

  /**
   * Get system diagnostics
   */
  public getSystemDiagnostics(): {
    configurations: Map<string, TEGConfiguration>;
    materials: Map<string, ThermoelectricMaterial>;
    performanceHistory: TEGPerformance[];
    systemReliability: number;
    thermalProtectionActive: boolean;
  } {
    return {
      configurations: new Map(this.tegConfigurations),
      materials: new Map(this.materials),
      performanceHistory: [...this.performanceHistory],
      systemReliability: this.systemReliability,
      thermalProtectionActive: this.thermalProtectionActive
    };
  }

  /**
   * Add custom TEG configuration
   */
  public addTEGConfiguration(config: TEGConfiguration): void {
    const validation = validateTEGConfiguration(config);
    if (!validation.isValid) {
      throw new Error(`Invalid TEG configuration: ${validation.errors.join(', ')}`);
    }

    this.tegConfigurations.set(config.id, config);
  }

  /**
   * Add custom thermoelectric material
   */
  public addThermoelectricMaterial(material: ThermoelectricMaterial): void {
    this.materials.set(material.name, material);
  }

  /**
   * Update thermal protection settings
   */
  public updateThermalProtection(enabled: boolean, maxTemp?: number): void {
    this.thermalProtectionActive = enabled;
    if (maxTemp !== undefined) {
      this.maxOperatingTemperature = maxTemp;
    }
  }
}

/**
 * Factory function to create TEG system
 */
export function createTEGSystem(): ThermoelectricGenerator {
  return new ThermoelectricGenerator();
}