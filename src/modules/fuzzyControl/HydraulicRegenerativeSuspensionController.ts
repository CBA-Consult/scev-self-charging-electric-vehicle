/**
 * Hydraulic Regenerative Suspension (HRS) Controller
 * 
 * This module implements advanced control algorithms for managing the operation
 * of the Hydraulic Regenerative Suspension system. The algorithms dynamically
 * adjust damping and energy recovery based on road conditions and driving patterns.
 */

export interface SuspensionInputs {
  // Vehicle dynamics
  vehicleSpeed: number;              // km/h
  verticalAcceleration: number;      // m/s² - vertical acceleration at each wheel
  suspensionVelocity: number;        // m/s - suspension compression/extension velocity
  suspensionDisplacement: number;    // m - current suspension displacement
  
  // Road conditions
  roadRoughness: number;             // 0-1 scale (0=smooth, 1=very rough)
  roadGradient: number;              // % grade
  surfaceType: 'asphalt' | 'concrete' | 'gravel' | 'dirt' | 'wet' | 'snow' | 'ice';
  
  // Driving patterns
  accelerationPattern: number;       // 0-1 scale (0=gentle, 1=aggressive)
  brakingPattern: number;           // 0-1 scale (0=gentle, 1=aggressive)
  corneringPattern: number;         // 0-1 scale (0=gentle, 1=aggressive)
  drivingMode: 'eco' | 'comfort' | 'sport' | 'off-road';
  
  // System state
  hydraulicPressure: number;        // bar
  accumulatorPressure: number;      // bar
  fluidTemperature: number;         // °C
  energyStorageLevel: number;       // 0-1 scale (0=empty, 1=full)
  
  // Environmental
  ambientTemperature: number;       // °C
  vehicleLoad: number;              // kg - current vehicle load
}

export interface SuspensionOutputs {
  // Damping control
  dampingCoefficient: number;       // N⋅s/m - target damping coefficient
  dampingMode: 'soft' | 'medium' | 'firm' | 'adaptive';
  
  // Energy recovery
  energyRecoveryRate: number;       // W - power being recovered
  hydraulicFlowRate: number;        // L/min - hydraulic fluid flow rate
  generatorTorque: number;          // Nm - torque applied to energy recovery generator
  
  // System control
  accumulatorChargeRate: number;    // bar/s - rate of accumulator charging
  valvePosition: number;            // 0-1 - hydraulic valve position
  pumpSpeed: number;                // RPM - hydraulic pump speed
  
  // Performance metrics
  comfortIndex: number;             // 0-1 scale (0=uncomfortable, 1=very comfortable)
  energyEfficiency: number;         // 0-1 scale (0=no recovery, 1=maximum recovery)
  systemEfficiency: number;         // 0-1 scale overall system efficiency
}

export interface HRSFuzzySet {
  name: string;
  points: number[];                 // Membership function points
  type: 'triangular' | 'trapezoidal' | 'gaussian';
}

export interface HRSFuzzyRule {
  id: string;
  conditions: {
    variable: string;
    fuzzySet: string;
  }[];
  conclusion: {
    variable: string;
    fuzzySet: string;
  };
  weight: number;                   // Rule weight (0-1)
}

/**
 * Main controller for Hydraulic Regenerative Suspension system
 */
export class HydraulicRegenerativeSuspensionController {
  private fuzzySets: Map<string, Map<string, HRSFuzzySet>>;
  private fuzzyRules: HRSFuzzyRule[];
  private lastInputs: SuspensionInputs | null = null;
  private performanceHistory: Array<{ timestamp: number; efficiency: number; comfort: number }> = [];

  constructor() {
    this.fuzzySets = new Map();
    this.fuzzyRules = [];
    this.initializeFuzzySets();
    this.initializeFuzzyRules();
  }

  /**
   * Initialize fuzzy sets for all input and output variables
   */
  private initializeFuzzySets(): void {
    // Vehicle speed fuzzy sets
    this.fuzzySets.set('vehicleSpeed', new Map([
      ['low', { name: 'low', points: [0, 0, 30, 50], type: 'trapezoidal' }],
      ['medium', { name: 'medium', points: [30, 50, 80, 100], type: 'trapezoidal' }],
      ['high', { name: 'high', points: [80, 100, 150, 150], type: 'trapezoidal' }]
    ]));

    // Road roughness fuzzy sets
    this.fuzzySets.set('roadRoughness', new Map([
      ['smooth', { name: 'smooth', points: [0, 0, 0.2, 0.3], type: 'trapezoidal' }],
      ['moderate', { name: 'moderate', points: [0.2, 0.3, 0.6, 0.7], type: 'trapezoidal' }],
      ['rough', { name: 'rough', points: [0.6, 0.7, 1.0, 1.0], type: 'trapezoidal' }]
    ]));

    // Suspension velocity fuzzy sets
    this.fuzzySets.set('suspensionVelocity', new Map([
      ['slow', { name: 'slow', points: [-0.5, -0.5, -0.1, 0.1], type: 'trapezoidal' }],
      ['medium', { name: 'medium', points: [-0.3, -0.1, 0.1, 0.3], type: 'trapezoidal' }],
      ['fast', { name: 'fast', points: [-0.1, 0.1, 0.5, 0.5], type: 'trapezoidal' }]
    ]));

    // Driving pattern fuzzy sets
    this.fuzzySets.set('accelerationPattern', new Map([
      ['gentle', { name: 'gentle', points: [0, 0, 0.3, 0.4], type: 'trapezoidal' }],
      ['moderate', { name: 'moderate', points: [0.3, 0.4, 0.6, 0.7], type: 'trapezoidal' }],
      ['aggressive', { name: 'aggressive', points: [0.6, 0.7, 1.0, 1.0], type: 'trapezoidal' }]
    ]));

    // Energy storage level fuzzy sets
    this.fuzzySets.set('energyStorageLevel', new Map([
      ['low', { name: 'low', points: [0, 0, 0.2, 0.3], type: 'trapezoidal' }],
      ['medium', { name: 'medium', points: [0.2, 0.3, 0.7, 0.8], type: 'trapezoidal' }],
      ['high', { name: 'high', points: [0.7, 0.8, 1.0, 1.0], type: 'trapezoidal' }]
    ]));

    // Output fuzzy sets - Damping coefficient
    this.fuzzySets.set('dampingCoefficient', new Map([
      ['soft', { name: 'soft', points: [500, 500, 1500, 2000], type: 'trapezoidal' }],
      ['medium', { name: 'medium', points: [1500, 2000, 3000, 3500], type: 'trapezoidal' }],
      ['firm', { name: 'firm', points: [3000, 3500, 5000, 5000], type: 'trapezoidal' }]
    ]));

    // Output fuzzy sets - Energy recovery rate
    this.fuzzySets.set('energyRecoveryRate', new Map([
      ['low', { name: 'low', points: [0, 0, 200, 400], type: 'trapezoidal' }],
      ['medium', { name: 'medium', points: [200, 400, 800, 1000], type: 'trapezoidal' }],
      ['high', { name: 'high', points: [800, 1000, 1500, 1500], type: 'trapezoidal' }]
    ]));

    // Output fuzzy sets - Valve position
    this.fuzzySets.set('valvePosition', new Map([
      ['closed', { name: 'closed', points: [0, 0, 0.2, 0.3], type: 'trapezoidal' }],
      ['partial', { name: 'partial', points: [0.2, 0.3, 0.7, 0.8], type: 'trapezoidal' }],
      ['open', { name: 'open', points: [0.7, 0.8, 1.0, 1.0], type: 'trapezoidal' }]
    ]));
  }

  /**
   * Initialize fuzzy rules for HRS control
   */
  private initializeFuzzyRules(): void {
    this.fuzzyRules = [
      // Comfort-oriented rules
      {
        id: 'comfort_1',
        conditions: [
          { variable: 'roadRoughness', fuzzySet: 'rough' },
          { variable: 'vehicleSpeed', fuzzySet: 'low' }
        ],
        conclusion: { variable: 'dampingCoefficient', fuzzySet: 'soft' },
        weight: 0.9
      },
      {
        id: 'comfort_2',
        conditions: [
          { variable: 'roadRoughness', fuzzySet: 'smooth' },
          { variable: 'accelerationPattern', fuzzySet: 'gentle' }
        ],
        conclusion: { variable: 'dampingCoefficient', fuzzySet: 'soft' },
        weight: 0.8
      },

      // Energy recovery rules
      {
        id: 'energy_1',
        conditions: [
          { variable: 'suspensionVelocity', fuzzySet: 'fast' },
          { variable: 'energyStorageLevel', fuzzySet: 'low' }
        ],
        conclusion: { variable: 'energyRecoveryRate', fuzzySet: 'high' },
        weight: 0.9
      },
      {
        id: 'energy_2',
        conditions: [
          { variable: 'roadRoughness', fuzzySet: 'rough' },
          { variable: 'energyStorageLevel', fuzzySet: 'medium' }
        ],
        conclusion: { variable: 'energyRecoveryRate', fuzzySet: 'medium' },
        weight: 0.8
      },

      // Performance rules
      {
        id: 'performance_1',
        conditions: [
          { variable: 'accelerationPattern', fuzzySet: 'aggressive' },
          { variable: 'vehicleSpeed', fuzzySet: 'high' }
        ],
        conclusion: { variable: 'dampingCoefficient', fuzzySet: 'firm' },
        weight: 0.9
      },
      {
        id: 'performance_2',
        conditions: [
          { variable: 'roadRoughness', fuzzySet: 'moderate' },
          { variable: 'vehicleSpeed', fuzzySet: 'medium' }
        ],
        conclusion: { variable: 'dampingCoefficient', fuzzySet: 'medium' },
        weight: 0.7
      },

      // Valve control rules
      {
        id: 'valve_1',
        conditions: [
          { variable: 'suspensionVelocity', fuzzySet: 'fast' },
          { variable: 'energyStorageLevel', fuzzySet: 'low' }
        ],
        conclusion: { variable: 'valvePosition', fuzzySet: 'open' },
        weight: 0.8
      },
      {
        id: 'valve_2',
        conditions: [
          { variable: 'suspensionVelocity', fuzzySet: 'slow' },
          { variable: 'energyStorageLevel', fuzzySet: 'high' }
        ],
        conclusion: { variable: 'valvePosition', fuzzySet: 'closed' },
        weight: 0.7
      }
    ];
  }

  /**
   * Calculate membership degree for trapezoidal membership function
   */
  private trapezoidalMF(x: number, a: number, b: number, c: number, d: number): number {
    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;
    if (x > a && x < b) return (x - a) / (b - a);
    if (x > c && x < d) return (d - x) / (d - c);
    return 0;
  }

  /**
   * Get membership degree for a value in a fuzzy set
   */
  private getMembershipDegree(value: number, fuzzySet: HRSFuzzySet): number {
    const [a, b, c, d] = fuzzySet.points;
    
    switch (fuzzySet.type) {
      case 'trapezoidal':
        return this.trapezoidalMF(value, a, b, c, d);
      case 'triangular':
        return this.trapezoidalMF(value, a, b, b, c);
      default:
        return 0;
    }
  }

  /**
   * Evaluate fuzzy rules and calculate output values
   */
  private evaluateRules(inputs: SuspensionInputs): { 
    dampingCoefficient: number; 
    energyRecoveryRate: number; 
    valvePosition: number 
  } {
    const outputAccumulators = {
      dampingCoefficient: { numerator: 0, denominator: 0 },
      energyRecoveryRate: { numerator: 0, denominator: 0 },
      valvePosition: { numerator: 0, denominator: 0 }
    };

    // Evaluate each rule
    for (const rule of this.fuzzyRules) {
      let ruleStrength = 1.0;

      // Calculate rule strength (minimum of all conditions)
      for (const condition of rule.conditions) {
        const variableValue = this.getInputValue(inputs, condition.variable);
        const fuzzySet = this.fuzzySets.get(condition.variable)?.get(condition.fuzzySet);
        
        if (fuzzySet) {
          const membershipDegree = this.getMembershipDegree(variableValue, fuzzySet);
          ruleStrength = Math.min(ruleStrength, membershipDegree);
        }
      }

      // Apply rule weight
      ruleStrength *= rule.weight;

      // Accumulate output
      if (ruleStrength > 0) {
        const outputVariable = rule.conclusion.variable;
        const outputFuzzySet = this.fuzzySets.get(outputVariable)?.get(rule.conclusion.fuzzySet);
        
        if (outputFuzzySet && outputAccumulators[outputVariable as keyof typeof outputAccumulators]) {
          const centroid = this.calculateCentroid(outputFuzzySet);
          const accumulator = outputAccumulators[outputVariable as keyof typeof outputAccumulators];
          accumulator.numerator += ruleStrength * centroid;
          accumulator.denominator += ruleStrength;
        }
      }
    }

    // Defuzzify outputs
    return {
      dampingCoefficient: outputAccumulators.dampingCoefficient.denominator > 0 
        ? outputAccumulators.dampingCoefficient.numerator / outputAccumulators.dampingCoefficient.denominator 
        : 2500, // Default medium damping
      energyRecoveryRate: outputAccumulators.energyRecoveryRate.denominator > 0 
        ? outputAccumulators.energyRecoveryRate.numerator / outputAccumulators.energyRecoveryRate.denominator 
        : 500, // Default medium recovery
      valvePosition: outputAccumulators.valvePosition.denominator > 0 
        ? outputAccumulators.valvePosition.numerator / outputAccumulators.valvePosition.denominator 
        : 0.5 // Default partial open
    };
  }

  /**
   * Get input value by variable name
   */
  private getInputValue(inputs: SuspensionInputs, variable: string): number {
    switch (variable) {
      case 'vehicleSpeed': return inputs.vehicleSpeed;
      case 'roadRoughness': return inputs.roadRoughness;
      case 'suspensionVelocity': return inputs.suspensionVelocity;
      case 'accelerationPattern': return inputs.accelerationPattern;
      case 'energyStorageLevel': return inputs.energyStorageLevel;
      default: return 0;
    }
  }

  /**
   * Calculate centroid of a fuzzy set
   */
  private calculateCentroid(fuzzySet: HRSFuzzySet): number {
    const [a, b, c, d] = fuzzySet.points;
    
    if (fuzzySet.type === 'trapezoidal') {
      // For trapezoidal: centroid = (a + b + c + d) / 4 (simplified)
      return (a + b + c + d) / 4;
    } else if (fuzzySet.type === 'triangular') {
      // For triangular: centroid = (a + b + c) / 3
      return (a + b + c) / 3;
    }
    
    return (a + d) / 2; // Fallback
  }

  /**
   * Main control function - calculates optimal suspension control
   */
  public calculateOptimalControl(inputs: SuspensionInputs): SuspensionOutputs {
    try {
      this.validateInputs(inputs);

      // Evaluate fuzzy rules
      const fuzzyOutputs = this.evaluateRules(inputs);

      // Calculate additional outputs based on fuzzy results and inputs
      const outputs: SuspensionOutputs = {
        dampingCoefficient: fuzzyOutputs.dampingCoefficient,
        dampingMode: this.determineDampingMode(fuzzyOutputs.dampingCoefficient),
        energyRecoveryRate: fuzzyOutputs.energyRecoveryRate,
        hydraulicFlowRate: this.calculateHydraulicFlowRate(inputs, fuzzyOutputs),
        generatorTorque: this.calculateGeneratorTorque(fuzzyOutputs.energyRecoveryRate),
        accumulatorChargeRate: this.calculateAccumulatorChargeRate(inputs, fuzzyOutputs),
        valvePosition: fuzzyOutputs.valvePosition,
        pumpSpeed: this.calculatePumpSpeed(inputs, fuzzyOutputs),
        comfortIndex: this.calculateComfortIndex(inputs, fuzzyOutputs),
        energyEfficiency: this.calculateEnergyEfficiency(inputs, fuzzyOutputs),
        systemEfficiency: this.calculateSystemEfficiency(inputs, fuzzyOutputs)
      };

      // Apply safety constraints
      const safeOutputs = this.applySafetyConstraints(outputs, inputs);

      // Update performance history
      this.updatePerformanceHistory(safeOutputs);

      this.lastInputs = inputs;
      return safeOutputs;

    } catch (error) {
      console.error('Error in HRS control calculation:', error);
      return this.generateFailsafeOutputs(inputs);
    }
  }

  /**
   * Determine damping mode based on damping coefficient
   */
  private determineDampingMode(dampingCoefficient: number): 'soft' | 'medium' | 'firm' | 'adaptive' {
    if (dampingCoefficient < 2000) return 'soft';
    if (dampingCoefficient < 3500) return 'medium';
    return 'firm';
  }

  /**
   * Calculate hydraulic flow rate based on suspension dynamics
   */
  private calculateHydraulicFlowRate(inputs: SuspensionInputs, fuzzyOutputs: any): number {
    const baseFlow = Math.abs(inputs.suspensionVelocity) * 10; // L/min per m/s
    const speedFactor = 1 + (inputs.vehicleSpeed / 100) * 0.3;
    const roughnessFactor = 1 + inputs.roadRoughness * 0.5;
    
    return Math.min(baseFlow * speedFactor * roughnessFactor, 50); // Max 50 L/min
  }

  /**
   * Calculate generator torque for energy recovery
   */
  private calculateGeneratorTorque(energyRecoveryRate: number): number {
    // Convert power to torque (simplified model)
    const baseRPM = 1500; // Typical generator RPM
    const torque = (energyRecoveryRate * 60) / (2 * Math.PI * baseRPM);
    return Math.min(torque, 50); // Max 50 Nm
  }

  /**
   * Calculate accumulator charge rate
   */
  private calculateAccumulatorChargeRate(inputs: SuspensionInputs, fuzzyOutputs: any): number {
    const maxChargeRate = 5; // bar/s
    const energyFactor = fuzzyOutputs.energyRecoveryRate / 1500;
    const storageFactor = 1 - inputs.energyStorageLevel;
    
    return maxChargeRate * energyFactor * storageFactor;
  }

  /**
   * Calculate pump speed
   */
  private calculatePumpSpeed(inputs: SuspensionInputs, fuzzyOutputs: any): number {
    const baseSpeed = 1000; // RPM
    const demandFactor = Math.abs(inputs.suspensionVelocity) * 2;
    const pressureFactor = Math.max(0, (200 - inputs.hydraulicPressure) / 200);
    
    return Math.min(baseSpeed * (1 + demandFactor + pressureFactor), 3000);
  }

  /**
   * Calculate comfort index
   */
  private calculateComfortIndex(inputs: SuspensionInputs, fuzzyOutputs: any): number {
    let comfort = 1.0;
    
    // Reduce comfort for rough roads
    comfort -= inputs.roadRoughness * 0.3;
    
    // Reduce comfort for high suspension velocity
    comfort -= Math.min(Math.abs(inputs.suspensionVelocity) * 0.5, 0.4);
    
    // Adjust for damping appropriateness
    const optimalDamping = this.getOptimalDampingForConditions(inputs);
    const dampingDeviation = Math.abs(fuzzyOutputs.dampingCoefficient - optimalDamping) / optimalDamping;
    comfort -= dampingDeviation * 0.2;
    
    return Math.max(0, Math.min(1, comfort));
  }

  /**
   * Calculate energy efficiency
   */
  private calculateEnergyEfficiency(inputs: SuspensionInputs, fuzzyOutputs: any): number {
    const maxPossibleRecovery = Math.abs(inputs.suspensionVelocity) * 1000; // Theoretical max
    if (maxPossibleRecovery === 0) return 0;
    
    const actualRecovery = fuzzyOutputs.energyRecoveryRate;
    const efficiency = actualRecovery / maxPossibleRecovery;
    
    return Math.min(1, efficiency);
  }

  /**
   * Calculate overall system efficiency
   */
  private calculateSystemEfficiency(inputs: SuspensionInputs, fuzzyOutputs: any): number {
    const energyEff = this.calculateEnergyEfficiency(inputs, fuzzyOutputs);
    const comfortEff = this.calculateComfortIndex(inputs, fuzzyOutputs);
    
    // Weighted combination
    return energyEff * 0.6 + comfortEff * 0.4;
  }

  /**
   * Get optimal damping for current conditions
   */
  private getOptimalDampingForConditions(inputs: SuspensionInputs): number {
    let optimal = 2500; // Base medium damping
    
    // Adjust for road conditions
    optimal += inputs.roadRoughness * 1000;
    
    // Adjust for speed
    optimal += (inputs.vehicleSpeed / 100) * 500;
    
    // Adjust for driving pattern
    optimal += inputs.accelerationPattern * 1000;
    
    return Math.min(5000, Math.max(500, optimal));
  }

  /**
   * Validate input parameters
   */
  private validateInputs(inputs: SuspensionInputs): void {
    if (inputs.vehicleSpeed < 0 || inputs.vehicleSpeed > 300) {
      throw new Error('Invalid vehicle speed');
    }
    if (inputs.roadRoughness < 0 || inputs.roadRoughness > 1) {
      throw new Error('Invalid road roughness');
    }
    if (inputs.energyStorageLevel < 0 || inputs.energyStorageLevel > 1) {
      throw new Error('Invalid energy storage level');
    }
    if (inputs.hydraulicPressure < 0 || inputs.hydraulicPressure > 300) {
      throw new Error('Invalid hydraulic pressure');
    }
  }

  /**
   * Apply safety constraints to outputs
   */
  private applySafetyConstraints(outputs: SuspensionOutputs, inputs: SuspensionInputs): SuspensionOutputs {
    const safeOutputs = { ...outputs };

    // Limit damping coefficient
    safeOutputs.dampingCoefficient = Math.max(500, Math.min(5000, outputs.dampingCoefficient));

    // Limit energy recovery based on system capacity
    const maxRecovery = inputs.energyStorageLevel < 0.9 ? 1500 : 500;
    safeOutputs.energyRecoveryRate = Math.min(outputs.energyRecoveryRate, maxRecovery);

    // Limit valve position
    safeOutputs.valvePosition = Math.max(0, Math.min(1, outputs.valvePosition));

    // Limit pump speed
    safeOutputs.pumpSpeed = Math.max(0, Math.min(3000, outputs.pumpSpeed));

    // Ensure minimum comfort in extreme conditions
    if (inputs.roadRoughness > 0.8) {
      safeOutputs.dampingCoefficient = Math.min(safeOutputs.dampingCoefficient, 3000);
    }

    return safeOutputs;
  }

  /**
   * Generate failsafe outputs in case of errors
   */
  private generateFailsafeOutputs(inputs: SuspensionInputs): SuspensionOutputs {
    return {
      dampingCoefficient: 2500,        // Medium damping
      dampingMode: 'medium',
      energyRecoveryRate: 0,           // No recovery in failsafe
      hydraulicFlowRate: 10,           // Minimal flow
      generatorTorque: 0,
      accumulatorChargeRate: 0,
      valvePosition: 0.3,              // Partially closed
      pumpSpeed: 1000,                 // Low speed
      comfortIndex: 0.5,
      energyEfficiency: 0,
      systemEfficiency: 0.3
    };
  }

  /**
   * Update performance history for analysis
   */
  private updatePerformanceHistory(outputs: SuspensionOutputs): void {
    this.performanceHistory.push({
      timestamp: Date.now(),
      efficiency: outputs.systemEfficiency,
      comfort: outputs.comfortIndex
    });

    // Keep only last 1000 entries
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory.shift();
    }
  }

  /**
   * Get system diagnostics and performance metrics
   */
  public getSystemDiagnostics(): {
    averageEfficiency: number;
    averageComfort: number;
    performanceTrend: 'improving' | 'stable' | 'declining';
    ruleUtilization: Map<string, number>;
  } {
    const recentHistory = this.performanceHistory.slice(-100);
    
    const avgEfficiency = recentHistory.reduce((sum, entry) => sum + entry.efficiency, 0) / recentHistory.length || 0;
    const avgComfort = recentHistory.reduce((sum, entry) => sum + entry.comfort, 0) / recentHistory.length || 0;

    // Calculate trend
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentHistory.length >= 50) {
      const firstHalf = recentHistory.slice(0, 25);
      const secondHalf = recentHistory.slice(-25);
      
      const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.efficiency, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.efficiency, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 0.05) trend = 'improving';
      else if (secondAvg < firstAvg - 0.05) trend = 'declining';
    }

    // Rule utilization (simplified)
    const ruleUtilization = new Map<string, number>();
    this.fuzzyRules.forEach(rule => {
      ruleUtilization.set(rule.id, Math.random() * 0.8 + 0.1); // Placeholder
    });

    return {
      averageEfficiency: avgEfficiency,
      averageComfort: avgComfort,
      performanceTrend: trend,
      ruleUtilization
    };
  }
}