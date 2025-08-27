/**
 * Energy Distribution Manager
 * 
 * Manages the distribution of energy between sources, storage, and loads
 * with intelligent routing and optimization algorithms.
 */

import {
  EnergyManagementConfig,
  EnergyManagementInputs,
  EnergyFlowControl,
  DistributionStrategy,
  EnergyDistributionConfig
} from './types';

export interface DistributionDecision {
  sourceId: string;
  targetId: string;
  targetType: 'storage' | 'load';
  powerAllocation: number; // W
  priority: number;
  efficiency: number;
  cost: number;
  reason: string;
}

export interface LoadBalancingResult {
  totalPowerRequired: number;
  totalPowerAvailable: number;
  powerDeficit: number;
  loadShedding: Map<string, number>; // loadId -> power reduction
  priorityViolations: string[];
  balancingEfficiency: number;
}

export class EnergyDistributionManager {
  private config: EnergyManagementConfig;
  private distributionConfig: EnergyDistributionConfig;
  private distributionHistory: Array<{
    timestamp: number;
    decisions: DistributionDecision[];
    efficiency: number;
    loadBalancing: LoadBalancingResult;
  }> = [];

  constructor(config: EnergyManagementConfig) {
    this.config = config;
    this.initializeDistributionConfig();
  }

  /**
   * Initialize distribution configuration
   */
  private initializeDistributionConfig(): void {
    this.distributionConfig = {
      strategy: 'priority_based',
      loadPriorities: new Map([
        ['critical_systems', 10],
        ['safety_systems', 9],
        ['powertrain', 8],
        ['comfort_systems', 5],
        ['auxiliary_systems', 3]
      ]),
      sourcePreferences: new Map([
        ['electromagnetic', 8],
        ['piezoelectric', 7],
        ['thermal', 6],
        ['mechanical', 5]
      ]),
      storageManagement: {
        chargingStrategy: 'adaptive',
        dischargingStrategy: 'load_following',
        balancingEnabled: true
      },
      constraints: {
        maxSourcePower: new Map(),
        maxLoadPower: new Map(),
        maxStoragePower: new Map()
      }
    };
  }

  /**
   * Analyze energy flow patterns and requirements
   */
  public async analyzeEnergyFlow(inputs: EnergyManagementInputs): Promise<EnergyFlowControl> {
    const energyFlow: EnergyFlowControl = {
      sourceToStorage: new Map(),
      sourceToLoad: new Map(),
      storageToLoad: new Map(),
      gridFlow: {
        import: 0,
        export: 0,
        frequency: 50, // Hz
        voltage: 400 // V
      },
      constraints: {
        maxFlowRate: new Map(),
        minFlowRate: new Map(),
        flowDirection: new Map()
      }
    };

    // Initialize flow maps
    for (const sourceId of inputs.sources.keys()) {
      energyFlow.sourceToStorage.set(sourceId, new Map());
      energyFlow.sourceToLoad.set(sourceId, new Map());
    }

    for (const storageId of inputs.storage.keys()) {
      energyFlow.storageToLoad.set(storageId, new Map());
    }

    // Analyze current energy flows
    await this.analyzeSourceToStorageFlows(inputs, energyFlow);
    await this.analyzeSourceToLoadFlows(inputs, energyFlow);
    await this.analyzeStorageToLoadFlows(inputs, energyFlow);
    
    // Set flow constraints
    this.setFlowConstraints(inputs, energyFlow);

    return energyFlow;
  }

  /**
   * Analyze source to storage energy flows
   */
  private async analyzeSourceToStorageFlows(
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl
  ): Promise<void> {
    for (const [sourceId, source] of inputs.sources) {
      if (source.status !== 'active') continue;

      const sourceToStorageMap = energyFlow.sourceToStorage.get(sourceId)!;

      for (const [storageId, storage] of inputs.storage) {
        if (storage.status === 'fault') continue;

        // Calculate optimal power flow based on storage needs and source availability
        const optimalFlow = this.calculateOptimalSourceToStorageFlow(
          source,
          storage,
          inputs.vehicleState
        );

        if (optimalFlow > 0) {
          sourceToStorageMap.set(storageId, optimalFlow);
        }
      }
    }
  }

  /**
   * Analyze source to load energy flows
   */
  private async analyzeSourceToLoadFlows(
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl
  ): Promise<void> {
    for (const [sourceId, source] of inputs.sources) {
      if (source.status !== 'active') continue;

      const sourceToLoadMap = energyFlow.sourceToLoad.get(sourceId)!;

      for (const [loadId, load] of inputs.loads) {
        // Calculate direct source to load flow for high-priority loads
        if (load.priority >= 8) {
          const directFlow = this.calculateDirectSourceToLoadFlow(
            source,
            load,
            inputs.vehicleState
          );

          if (directFlow > 0) {
            sourceToLoadMap.set(loadId, directFlow);
          }
        }
      }
    }
  }

  /**
   * Analyze storage to load energy flows
   */
  private async analyzeStorageToLoadFlows(
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl
  ): Promise<void> {
    for (const [storageId, storage] of inputs.storage) {
      if (storage.status === 'fault' || storage.soc < 10) continue;

      const storageToLoadMap = energyFlow.storageToLoad.get(storageId)!;

      for (const [loadId, load] of inputs.loads) {
        // Calculate storage to load flow based on load priority and storage availability
        const storageFlow = this.calculateStorageToLoadFlow(
          storage,
          load,
          inputs.vehicleState
        );

        if (storageFlow > 0) {
          storageToLoadMap.set(loadId, storageFlow);
        }
      }
    }
  }

  /**
   * Calculate optimal source to storage flow
   */
  private calculateOptimalSourceToStorageFlow(
    source: any,
    storage: any,
    vehicleState: any
  ): number {
    // Don't charge if storage is full or in fault
    if (storage.soc >= 95 || storage.status === 'fault') {
      return 0;
    }

    // Calculate charging power based on storage characteristics
    let chargingPower = Math.min(
      source.power * 0.8, // Use 80% of source power for charging
      storage.capacity * 0.1, // Limit to 0.1C charging rate
      storage.voltage * 10 // Voltage-based limit
    );

    // Adjust based on storage SOC
    if (storage.soc > 80) {
      chargingPower *= 0.5; // Reduce charging power when nearly full
    } else if (storage.soc < 20) {
      chargingPower *= 1.2; // Increase charging power when low
    }

    // Adjust based on vehicle state
    if (vehicleState.drivingMode === 'eco') {
      chargingPower *= 1.1; // Prioritize charging in eco mode
    } else if (vehicleState.drivingMode === 'sport') {
      chargingPower *= 0.8; // Reduce charging in sport mode
    }

    // Consider temperature effects
    if (storage.temperature > 40) {
      chargingPower *= Math.max(0.5, 1 - (storage.temperature - 40) * 0.02);
    }

    return Math.max(0, chargingPower);
  }

  /**
   * Calculate direct source to load flow
   */
  private calculateDirectSourceToLoadFlow(
    source: any,
    load: any,
    vehicleState: any
  ): number {
    // Only allow direct flow for critical loads
    if (load.type !== 'critical') {
      return 0;
    }

    // Calculate available power from source
    const availablePower = source.power * source.efficiency / 100;

    // Limit to load requirement
    const directFlow = Math.min(availablePower, load.power);

    // Apply efficiency factor
    return directFlow * 0.95; // 95% transmission efficiency
  }

  /**
   * Calculate storage to load flow
   */
  private calculateStorageToLoadFlow(
    storage: any,
    load: any,
    vehicleState: any
  ): number {
    // Don't discharge if storage is too low
    if (storage.soc < 15) {
      return 0;
    }

    // Calculate available discharge power
    let dischargePower = Math.min(
      storage.capacity * storage.soc / 100 * 0.2, // 20% of stored energy per hour
      storage.voltage * 20, // Voltage-based limit
      load.power // Don't exceed load requirement
    );

    // Adjust based on load priority
    if (load.priority >= 8) {
      dischargePower *= 1.2; // Boost for high-priority loads
    } else if (load.priority <= 3) {
      dischargePower *= 0.6; // Reduce for low-priority loads
    }

    // Adjust based on storage SOC
    if (storage.soc < 30) {
      dischargePower *= 0.7; // Conserve energy when low
    }

    // Consider vehicle state
    if (vehicleState.drivingMode === 'eco' && load.type === 'optional') {
      dischargePower *= 0.5; // Reduce optional loads in eco mode
    }

    return Math.max(0, dischargePower);
  }

  /**
   * Set flow constraints
   */
  private setFlowConstraints(
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl
  ): void {
    // Set maximum flow rates based on component capabilities
    for (const [sourceId, source] of inputs.sources) {
      energyFlow.constraints.maxFlowRate.set(`source_${sourceId}`, source.power);
      energyFlow.constraints.minFlowRate.set(`source_${sourceId}`, 0);
      energyFlow.constraints.flowDirection.set(`source_${sourceId}`, 'unidirectional');
    }

    for (const [storageId, storage] of inputs.storage) {
      const maxPower = Math.max(storage.capacity * 0.5, 1000); // 0.5C or 1kW minimum
      energyFlow.constraints.maxFlowRate.set(`storage_${storageId}`, maxPower);
      energyFlow.constraints.minFlowRate.set(`storage_${storageId}`, 0);
      energyFlow.constraints.flowDirection.set(`storage_${storageId}`, 'bidirectional');
    }

    for (const [loadId, load] of inputs.loads) {
      energyFlow.constraints.maxFlowRate.set(`load_${loadId}`, load.power * 1.2);
      energyFlow.constraints.minFlowRate.set(`load_${loadId}`, 0);
      energyFlow.constraints.flowDirection.set(`load_${loadId}`, 'unidirectional');
    }
  }

  /**
   * Optimize energy distribution using selected strategy
   */
  public async optimizeDistribution(
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl
  ): Promise<DistributionDecision[]> {
    switch (this.distributionConfig.strategy) {
      case 'priority_based':
        return this.optimizePriorityBased(inputs, energyFlow);
      case 'efficiency_optimized':
        return this.optimizeEfficiencyBased(inputs, energyFlow);
      case 'load_balancing':
        return this.optimizeLoadBalancing(inputs, energyFlow);
      case 'cost_minimized':
        return this.optimizeCostBased(inputs, energyFlow);
      case 'reliability_focused':
        return this.optimizeReliabilityBased(inputs, energyFlow);
      case 'adaptive':
        return this.optimizeAdaptive(inputs, energyFlow);
      default:
        return this.optimizePriorityBased(inputs, energyFlow);
    }
  }

  /**
   * Priority-based optimization
   */
  private async optimizePriorityBased(
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl
  ): Promise<DistributionDecision[]> {
    const decisions: DistributionDecision[] = [];

    // Sort loads by priority (highest first)
    const sortedLoads = Array.from(inputs.loads.entries())
      .sort(([, a], [, b]) => b.priority - a.priority);

    // Allocate energy to loads based on priority
    for (const [loadId, load] of sortedLoads) {
      const allocation = await this.allocateEnergyToLoad(loadId, load, inputs, energyFlow);
      decisions.push(...allocation);
    }

    // Allocate remaining energy to storage
    const storageAllocation = await this.allocateEnergyToStorage(inputs, energyFlow, decisions);
    decisions.push(...storageAllocation);

    return decisions;
  }

  /**
   * Efficiency-based optimization
   */
  private async optimizeEfficiencyBased(
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl
  ): Promise<DistributionDecision[]> {
    const decisions: DistributionDecision[] = [];

    // Calculate efficiency for all possible energy paths
    const efficiencyMatrix = this.calculateEfficiencyMatrix(inputs);

    // Sort energy paths by efficiency (highest first)
    const sortedPaths = Array.from(efficiencyMatrix.entries())
      .sort(([, a], [, b]) => b.efficiency - a.efficiency);

    // Allocate energy following the most efficient paths
    for (const [pathId, pathData] of sortedPaths) {
      const decision = this.createDistributionDecision(pathId, pathData, 'efficiency_optimized');
      if (this.validateDecision(decision, inputs)) {
        decisions.push(decision);
      }
    }

    return decisions;
  }

  /**
   * Load balancing optimization
   */
  private async optimizeLoadBalancing(
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl
  ): Promise<DistributionDecision[]> {
    const decisions: DistributionDecision[] = [];

    // Calculate total available power
    const totalAvailablePower = Array.from(inputs.sources.values())
      .filter(source => source.status === 'active')
      .reduce((sum, source) => sum + source.power, 0);

    // Calculate total required power
    const totalRequiredPower = Array.from(inputs.loads.values())
      .reduce((sum, load) => sum + load.power, 0);

    // Perform load balancing
    const balancingResult = this.performLoadBalancing(
      totalAvailablePower,
      totalRequiredPower,
      inputs
    );

    // Create distribution decisions based on balancing result
    for (const [loadId, allocatedPower] of balancingResult.loadShedding) {
      const load = inputs.loads.get(loadId)!;
      const allocation = await this.allocateSpecificPowerToLoad(
        loadId,
        load,
        allocatedPower,
        inputs,
        energyFlow
      );
      decisions.push(...allocation);
    }

    return decisions;
  }

  /**
   * Cost-based optimization
   */
  private async optimizeCostBased(
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl
  ): Promise<DistributionDecision[]> {
    const decisions: DistributionDecision[] = [];

    // Calculate cost for all possible energy paths
    const costMatrix = this.calculateCostMatrix(inputs);

    // Sort energy paths by cost (lowest first)
    const sortedPaths = Array.from(costMatrix.entries())
      .sort(([, a], [, b]) => a.cost - b.cost);

    // Allocate energy following the lowest cost paths
    for (const [pathId, pathData] of sortedPaths) {
      const decision = this.createDistributionDecision(pathId, pathData, 'cost_minimized');
      if (this.validateDecision(decision, inputs)) {
        decisions.push(decision);
      }
    }

    return decisions;
  }

  /**
   * Reliability-based optimization
   */
  private async optimizeReliabilityBased(
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl
  ): Promise<DistributionDecision[]> {
    const decisions: DistributionDecision[] = [];

    // Prioritize critical loads and reliable sources
    const reliableSources = Array.from(inputs.sources.entries())
      .filter(([, source]) => source.status === 'active' && source.efficiency > 80)
      .sort(([, a], [, b]) => b.efficiency - a.efficiency);

    const criticalLoads = Array.from(inputs.loads.entries())
      .filter(([, load]) => load.type === 'critical')
      .sort(([, a], [, b]) => b.priority - a.priority);

    // Allocate reliable sources to critical loads first
    for (const [loadId, load] of criticalLoads) {
      for (const [sourceId, source] of reliableSources) {
        const powerAllocation = Math.min(source.power * 0.8, load.power);
        if (powerAllocation > 0) {
          decisions.push({
            sourceId,
            targetId: loadId,
            targetType: 'load',
            powerAllocation,
            priority: load.priority,
            efficiency: source.efficiency,
            cost: 0,
            reason: 'reliability_focused'
          });
        }
      }
    }

    return decisions;
  }

  /**
   * Adaptive optimization
   */
  private async optimizeAdaptive(
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl
  ): Promise<DistributionDecision[]> {
    // Analyze current conditions and select best strategy
    const currentStrategy = this.selectAdaptiveStrategy(inputs);
    
    // Update distribution strategy
    this.distributionConfig.strategy = currentStrategy;

    // Apply selected strategy
    switch (currentStrategy) {
      case 'priority_based':
        return this.optimizePriorityBased(inputs, energyFlow);
      case 'efficiency_optimized':
        return this.optimizeEfficiencyBased(inputs, energyFlow);
      case 'load_balancing':
        return this.optimizeLoadBalancing(inputs, energyFlow);
      default:
        return this.optimizePriorityBased(inputs, energyFlow);
    }
  }

  /**
   * Select adaptive strategy based on current conditions
   */
  private selectAdaptiveStrategy(inputs: EnergyManagementInputs): DistributionStrategy {
    const totalGeneration = Array.from(inputs.sources.values())
      .reduce((sum, source) => sum + source.power, 0);
    const totalConsumption = Array.from(inputs.loads.values())
      .reduce((sum, load) => sum + load.power, 0);
    
    const energyBalance = totalGeneration - totalConsumption;
    const balanceRatio = totalGeneration / totalConsumption;

    // Select strategy based on energy balance and vehicle state
    if (energyBalance < -200 || balanceRatio < 0.8) {
      return 'priority_based'; // Energy deficit - prioritize critical loads
    } else if (inputs.vehicleState.drivingMode === 'eco') {
      return 'efficiency_optimized'; // Eco mode - maximize efficiency
    } else if (balanceRatio > 1.5) {
      return 'load_balancing'; // Energy surplus - balance loads
    } else {
      return 'priority_based'; // Default to priority-based
    }
  }

  /**
   * Allocate energy to a specific load
   */
  private async allocateEnergyToLoad(
    loadId: string,
    load: any,
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl
  ): Promise<DistributionDecision[]> {
    const decisions: DistributionDecision[] = [];
    let remainingPower = load.power;

    // Try direct source allocation first
    for (const [sourceId, source] of inputs.sources) {
      if (source.status !== 'active' || remainingPower <= 0) continue;

      const sourceToLoadFlow = energyFlow.sourceToLoad.get(sourceId)?.get(loadId) || 0;
      const allocation = Math.min(sourceToLoadFlow, remainingPower);

      if (allocation > 0) {
        decisions.push({
          sourceId,
          targetId: loadId,
          targetType: 'load',
          powerAllocation: allocation,
          priority: load.priority,
          efficiency: source.efficiency,
          cost: this.calculateEnergyCost(sourceId, allocation),
          reason: 'direct_source_allocation'
        });
        remainingPower -= allocation;
      }
    }

    // Use storage if needed
    if (remainingPower > 0) {
      for (const [storageId, storage] of inputs.storage) {
        if (storage.status === 'fault' || storage.soc < 15 || remainingPower <= 0) continue;

        const storageToLoadFlow = energyFlow.storageToLoad.get(storageId)?.get(loadId) || 0;
        const allocation = Math.min(storageToLoadFlow, remainingPower);

        if (allocation > 0) {
          decisions.push({
            sourceId: storageId,
            targetId: loadId,
            targetType: 'load',
            powerAllocation: allocation,
            priority: load.priority,
            efficiency: storage.health,
            cost: this.calculateStorageCost(storageId, allocation),
            reason: 'storage_allocation'
          });
          remainingPower -= allocation;
        }
      }
    }

    return decisions;
  }

  /**
   * Allocate energy to storage systems
   */
  private async allocateEnergyToStorage(
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl,
    existingDecisions: DistributionDecision[]
  ): Promise<DistributionDecision[]> {
    const decisions: DistributionDecision[] = [];

    // Calculate remaining source power after load allocations
    const usedSourcePower = new Map<string, number>();
    for (const decision of existingDecisions) {
      if (decision.targetType === 'load') {
        const used = usedSourcePower.get(decision.sourceId) || 0;
        usedSourcePower.set(decision.sourceId, used + decision.powerAllocation);
      }
    }

    // Allocate remaining power to storage
    for (const [sourceId, source] of inputs.sources) {
      if (source.status !== 'active') continue;

      const usedPower = usedSourcePower.get(sourceId) || 0;
      const remainingPower = source.power - usedPower;

      if (remainingPower > 10) { // Minimum 10W threshold
        // Find best storage for this source
        const bestStorage = this.findBestStorageForSource(sourceId, inputs, energyFlow);
        
        if (bestStorage) {
          const allocation = Math.min(
            remainingPower,
            energyFlow.sourceToStorage.get(sourceId)?.get(bestStorage.id) || 0
          );

          if (allocation > 0) {
            decisions.push({
              sourceId,
              targetId: bestStorage.id,
              targetType: 'storage',
              powerAllocation: allocation,
              priority: 5, // Medium priority for storage
              efficiency: bestStorage.efficiency,
              cost: this.calculateEnergyCost(sourceId, allocation),
              reason: 'excess_power_storage'
            });
          }
        }
      }
    }

    return decisions;
  }

  /**
   * Find best storage for a source
   */
  private findBestStorageForSource(
    sourceId: string,
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl
  ): { id: string; efficiency: number } | null {
    let bestStorage: { id: string; efficiency: number } | null = null;
    let bestScore = 0;

    for (const [storageId, storage] of inputs.storage) {
      if (storage.status === 'fault' || storage.soc >= 95) continue;

      // Calculate storage score based on SOC, health, and capacity
      const socScore = (100 - storage.soc) / 100; // Prefer lower SOC
      const healthScore = storage.health / 100;
      const capacityScore = Math.min(storage.capacity / 1000, 1); // Normalize to 1kWh

      const totalScore = (socScore * 0.4 + healthScore * 0.4 + capacityScore * 0.2);

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestStorage = {
          id: storageId,
          efficiency: storage.health
        };
      }
    }

    return bestStorage;
  }

  // Helper methods for calculations
  private calculateEfficiencyMatrix(inputs: EnergyManagementInputs): Map<string, any> {
    // Implementation would calculate efficiency for all energy paths
    return new Map();
  }

  private calculateCostMatrix(inputs: EnergyManagementInputs): Map<string, any> {
    // Implementation would calculate cost for all energy paths
    return new Map();
  }

  private createDistributionDecision(pathId: string, pathData: any, reason: string): DistributionDecision {
    // Implementation would create decision from path data
    return {
      sourceId: '',
      targetId: '',
      targetType: 'load',
      powerAllocation: 0,
      priority: 0,
      efficiency: 0,
      cost: 0,
      reason
    };
  }

  private validateDecision(decision: DistributionDecision, inputs: EnergyManagementInputs): boolean {
    // Implementation would validate decision against constraints
    return true;
  }

  private performLoadBalancing(
    totalAvailable: number,
    totalRequired: number,
    inputs: EnergyManagementInputs
  ): LoadBalancingResult {
    const loadShedding = new Map<string, number>();
    const priorityViolations: string[] = [];

    if (totalAvailable >= totalRequired) {
      // No load shedding needed
      for (const [loadId, load] of inputs.loads) {
        loadShedding.set(loadId, load.power);
      }
    } else {
      // Load shedding required
      const deficit = totalRequired - totalAvailable;
      const sortedLoads = Array.from(inputs.loads.entries())
        .sort(([, a], [, b]) => a.priority - b.priority); // Lowest priority first

      let remainingDeficit = deficit;
      for (const [loadId, load] of sortedLoads) {
        if (remainingDeficit <= 0) {
          loadShedding.set(loadId, load.power);
        } else {
          const reduction = Math.min(load.power * load.flexibility / 100, remainingDeficit);
          loadShedding.set(loadId, load.power - reduction);
          remainingDeficit -= reduction;

          if (reduction > 0) {
            priorityViolations.push(`Load ${loadId} reduced by ${reduction}W`);
          }
        }
      }
    }

    return {
      totalPowerRequired: totalRequired,
      totalPowerAvailable: totalAvailable,
      powerDeficit: Math.max(0, totalRequired - totalAvailable),
      loadShedding,
      priorityViolations,
      balancingEfficiency: Math.min(1, totalAvailable / totalRequired)
    };
  }

  private async allocateSpecificPowerToLoad(
    loadId: string,
    load: any,
    allocatedPower: number,
    inputs: EnergyManagementInputs,
    energyFlow: EnergyFlowControl
  ): Promise<DistributionDecision[]> {
    // Implementation would allocate specific power amount to load
    return [];
  }

  private calculateEnergyCost(sourceId: string, power: number): number {
    // Implementation would calculate energy cost
    return 0;
  }

  private calculateStorageCost(storageId: string, power: number): number {
    // Implementation would calculate storage cost
    return 0;
  }

  /**
   * Update configuration
   */
  public updateConfiguration(config: EnergyManagementConfig): void {
    this.config = config;
    // Update distribution configuration based on new config
  }

  /**
   * Get distribution history
   */
  public getDistributionHistory(): typeof this.distributionHistory {
    return [...this.distributionHistory];
  }

  /**
   * Get current distribution configuration
   */
  public getDistributionConfig(): EnergyDistributionConfig {
    return { ...this.distributionConfig };
  }

  /**
   * Shutdown
   */
  public shutdown(): void {
    console.log('Energy Distribution Manager: Shutdown complete');
  }
}