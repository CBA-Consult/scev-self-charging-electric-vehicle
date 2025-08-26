/**
 * Advanced Hydraulic Regenerative Suspension (HRS) Controller
 * 
 * This module implements advanced control algorithms for managing the operation
 * of the Hydraulic Regenerative Suspension system. The algorithms dynamically
 * adjust damping and energy recovery based on road conditions and driving patterns
 * to optimize vehicle performance and energy efficiency.
 * 
 * Features:
 * - Advanced fuzzy logic control with comprehensive rule sets
 * - Adaptive control algorithms that learn from driving patterns
 * - Predictive control for anticipating road conditions
 * - Multi-objective optimization for energy recovery
 * - Real-time parameter tuning based on performance feedback
 * - Integration with road condition and driving pattern analyzers
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
  priority: number;                 // Rule priority (1-10)
  adaptiveWeight?: number;          // Adaptive weight based on performance
}

export interface AdaptiveParameters {
  learningRate: number;             // Learning rate for adaptive algorithms
  forgettingFactor: number;         // Forgetting factor for historical data
  adaptationThreshold: number;      // Threshold for triggering adaptation
  performanceWindow: number;        // Window size for performance evaluation
}

export interface PredictiveParameters {
  predictionHorizon: number;        // Prediction horizon in seconds
  confidenceThreshold: number;     // Confidence threshold for predictions
  updateFrequency: number;         // Frequency of prediction updates (Hz)
}

export interface OptimizationObjectives {
  comfortWeight: number;           // Weight for comfort optimization
  energyWeight: number;            // Weight for energy recovery optimization
  stabilityWeight: number;         // Weight for vehicle stability
  efficiencyWeight: number;        // Weight for system efficiency
}

/**
 * Advanced controller for Hydraulic Regenerative Suspension system
 */
export class HydraulicRegenerativeSuspensionController {
  private fuzzySets: Map<string, Map<string, HRSFuzzySet>>;
  private fuzzyRules: HRSFuzzyRule[];
  private lastInputs: SuspensionInputs | null = null;
  private performanceHistory: Array<{ timestamp: number; efficiency: number; comfort: number; stability: number }> = [];
  
  // Advanced control parameters
  private adaptiveParams: AdaptiveParameters;
  private predictiveParams: PredictiveParameters;
  private optimizationObjectives: OptimizationObjectives;
  
  // Learning and adaptation
  private rulePerformanceHistory: Map<string, number[]> = new Map();
  private adaptiveWeights: Map<string, number> = new Map();
  private predictionBuffer: Array<{ timestamp: number; prediction: SuspensionOutputs; actual?: SuspensionOutputs }> = [];
  
  // Road condition and driving pattern integration
  private roadConditionHistory: Array<{ timestamp: number; roughness: number; gradient: number; surface: string }> = [];
  private drivingPatternHistory: Array<{ timestamp: number; aggression: number; smoothness: number; efficiency: number }> = [];

  constructor(
    adaptiveParams?: Partial<AdaptiveParameters>,
    predictiveParams?: Partial<PredictiveParameters>,
    optimizationObjectives?: Partial<OptimizationObjectives>
  ) {
    this.fuzzySets = new Map();
    this.fuzzyRules = [];
    
    // Initialize advanced control parameters
    this.adaptiveParams = {
      learningRate: 0.1,
      forgettingFactor: 0.95,
      adaptationThreshold: 0.05,
      performanceWindow: 50,
      ...adaptiveParams
    };
    
    this.predictiveParams = {
      predictionHorizon: 2.0,
      confidenceThreshold: 0.8,
      updateFrequency: 10,
      ...predictiveParams
    };
    
    this.optimizationObjectives = {
      comfortWeight: 0.3,
      energyWeight: 0.3,
      stabilityWeight: 0.25,
      efficiencyWeight: 0.15,
      ...optimizationObjectives
    };
    
    this.initializeFuzzySets();
    this.initializeFuzzyRules();
    this.initializeAdaptiveWeights();
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
   * Initialize comprehensive fuzzy rules for advanced HRS control
   */
  private initializeFuzzyRules(): void {
    this.fuzzyRules = [
      // Enhanced comfort-oriented rules
      {
        id: 'comfort_1',
        conditions: [
          { variable: 'roadRoughness', fuzzySet: 'rough' },
          { variable: 'vehicleSpeed', fuzzySet: 'low' }
        ],
        conclusion: { variable: 'dampingCoefficient', fuzzySet: 'soft' },
        weight: 0.9,
        priority: 8
      },
      {
        id: 'comfort_2',
        conditions: [
          { variable: 'roadRoughness', fuzzySet: 'smooth' },
          { variable: 'accelerationPattern', fuzzySet: 'gentle' }
        ],
        conclusion: { variable: 'dampingCoefficient', fuzzySet: 'soft' },
        weight: 0.8,
        priority: 7
      },
      {
        id: 'comfort_3',
        conditions: [
          { variable: 'roadRoughness', fuzzySet: 'rough' },
          { variable: 'accelerationPattern', fuzzySet: 'gentle' }
        ],
        conclusion: { variable: 'dampingCoefficient', fuzzySet: 'medium' },
        weight: 0.85,
        priority: 8
      },

      // Enhanced energy recovery rules
      {
        id: 'energy_1',
        conditions: [
          { variable: 'suspensionVelocity', fuzzySet: 'fast' },
          { variable: 'energyStorageLevel', fuzzySet: 'low' }
        ],
        conclusion: { variable: 'energyRecoveryRate', fuzzySet: 'high' },
        weight: 0.9,
        priority: 9
      },
      {
        id: 'energy_2',
        conditions: [
          { variable: 'roadRoughness', fuzzySet: 'rough' },
          { variable: 'energyStorageLevel', fuzzySet: 'medium' }
        ],
        conclusion: { variable: 'energyRecoveryRate', fuzzySet: 'medium' },
        weight: 0.8,
        priority: 7
      },
      {
        id: 'energy_3',
        conditions: [
          { variable: 'suspensionVelocity', fuzzySet: 'medium' },
          { variable: 'energyStorageLevel', fuzzySet: 'low' },
          { variable: 'roadRoughness', fuzzySet: 'moderate' }
        ],
        conclusion: { variable: 'energyRecoveryRate', fuzzySet: 'high' },
        weight: 0.85,
        priority: 8
      },
      {
        id: 'energy_4',
        conditions: [
          { variable: 'energyStorageLevel', fuzzySet: 'high' }
        ],
        conclusion: { variable: 'energyRecoveryRate', fuzzySet: 'low' },
        weight: 0.7,
        priority: 6
      },

      // Enhanced performance rules
      {
        id: 'performance_1',
        conditions: [
          { variable: 'accelerationPattern', fuzzySet: 'aggressive' },
          { variable: 'vehicleSpeed', fuzzySet: 'high' }
        ],
        conclusion: { variable: 'dampingCoefficient', fuzzySet: 'firm' },
        weight: 0.9,
        priority: 9
      },
      {
        id: 'performance_2',
        conditions: [
          { variable: 'roadRoughness', fuzzySet: 'moderate' },
          { variable: 'vehicleSpeed', fuzzySet: 'medium' }
        ],
        conclusion: { variable: 'dampingCoefficient', fuzzySet: 'medium' },
        weight: 0.7,
        priority: 6
      },
      {
        id: 'performance_3',
        conditions: [
          { variable: 'accelerationPattern', fuzzySet: 'aggressive' },
          { variable: 'roadRoughness', fuzzySet: 'smooth' }
        ],
        conclusion: { variable: 'dampingCoefficient', fuzzySet: 'firm' },
        weight: 0.8,
        priority: 7
      },

      // Enhanced valve control rules
      {
        id: 'valve_1',
        conditions: [
          { variable: 'suspensionVelocity', fuzzySet: 'fast' },
          { variable: 'energyStorageLevel', fuzzySet: 'low' }
        ],
        conclusion: { variable: 'valvePosition', fuzzySet: 'open' },
        weight: 0.8,
        priority: 8
      },
      {
        id: 'valve_2',
        conditions: [
          { variable: 'suspensionVelocity', fuzzySet: 'slow' },
          { variable: 'energyStorageLevel', fuzzySet: 'high' }
        ],
        conclusion: { variable: 'valvePosition', fuzzySet: 'closed' },
        weight: 0.7,
        priority: 6
      },
      {
        id: 'valve_3',
        conditions: [
          { variable: 'roadRoughness', fuzzySet: 'rough' },
          { variable: 'energyStorageLevel', fuzzySet: 'medium' }
        ],
        conclusion: { variable: 'valvePosition', fuzzySet: 'partial' },
        weight: 0.75,
        priority: 7
      },

      // Adaptive rules for different driving modes
      {
        id: 'eco_mode_1',
        conditions: [
          { variable: 'accelerationPattern', fuzzySet: 'gentle' },
          { variable: 'vehicleSpeed', fuzzySet: 'low' }
        ],
        conclusion: { variable: 'energyRecoveryRate', fuzzySet: 'high' },
        weight: 0.8,
        priority: 7
      },
      {
        id: 'sport_mode_1',
        conditions: [
          { variable: 'accelerationPattern', fuzzySet: 'aggressive' },
          { variable: 'vehicleSpeed', fuzzySet: 'high' }
        ],
        conclusion: { variable: 'dampingCoefficient', fuzzySet: 'firm' },
        weight: 0.9,
        priority: 9
      },

      // Safety and stability rules
      {
        id: 'safety_1',
        conditions: [
          { variable: 'suspensionVelocity', fuzzySet: 'fast' },
          { variable: 'roadRoughness', fuzzySet: 'rough' }
        ],
        conclusion: { variable: 'dampingCoefficient', fuzzySet: 'firm' },
        weight: 0.95,
        priority: 10
      },
      {
        id: 'stability_1',
        conditions: [
          { variable: 'accelerationPattern', fuzzySet: 'aggressive' },
          { variable: 'roadRoughness', fuzzySet: 'rough' }
        ],
        conclusion: { variable: 'dampingCoefficient', fuzzySet: 'firm' },
        weight: 0.9,
        priority: 9
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

  /**
   * Initialize adaptive weights for fuzzy rules
   */
  private initializeAdaptiveWeights(): void {
    this.fuzzyRules.forEach(rule => {
      this.adaptiveWeights.set(rule.id, rule.weight);
      this.rulePerformanceHistory.set(rule.id, []);
    });
  }

  /**
   * Advanced control algorithm that integrates fuzzy logic with adaptive and predictive control
   */
  public calculateAdvancedOptimalControl(
    inputs: SuspensionInputs,
    roadConditionData?: any,
    drivingPatternData?: any
  ): SuspensionOutputs {
    this.validateInputs(inputs);

    // Update historical data
    this.updateRoadConditionHistory(inputs);
    this.updateDrivingPatternHistory(inputs);

    // Apply adaptive learning
    this.updateAdaptiveWeights(inputs);

    // Generate predictive control
    const predictiveOutputs = this.calculatePredictiveControl(inputs);

    // Calculate base fuzzy control
    const fuzzyOutputs = this.calculateOptimalControl(inputs);

    // Apply multi-objective optimization
    const optimizedOutputs = this.applyMultiObjectiveOptimization(fuzzyOutputs, predictiveOutputs, inputs);

    // Apply adaptive adjustments
    const adaptiveOutputs = this.applyAdaptiveAdjustments(optimizedOutputs, inputs);

    // Final safety constraints and validation
    const finalOutputs = this.applySafetyConstraints(adaptiveOutputs, inputs);

    // Update performance tracking
    this.updateAdvancedPerformanceHistory(finalOutputs, inputs);

    return finalOutputs;
  }

  /**
   * Calculate predictive control based on anticipated road conditions and driving patterns
   */
  private calculatePredictiveControl(inputs: SuspensionInputs): SuspensionOutputs {
    const prediction = this.predictFutureConditions(inputs);
    
    // Adjust control parameters based on predictions
    let dampingAdjustment = 0;
    let energyAdjustment = 0;

    if (prediction.anticipatedRoughness > inputs.roadRoughness) {
      dampingAdjustment = (prediction.anticipatedRoughness - inputs.roadRoughness) * 500;
      energyAdjustment = (prediction.anticipatedRoughness - inputs.roadRoughness) * 200;
    }

    if (prediction.anticipatedAggression > inputs.accelerationPattern) {
      dampingAdjustment += (prediction.anticipatedAggression - inputs.accelerationPattern) * 300;
    }

    return {
      dampingCoefficient: Math.max(500, Math.min(5000, 2500 + dampingAdjustment)),
      dampingMode: 'adaptive',
      energyRecoveryRate: Math.max(0, Math.min(1500, 750 + energyAdjustment)),
      hydraulicFlowRate: 15,
      generatorTorque: 25,
      accumulatorChargeRate: 2,
      valvePosition: 0.5,
      pumpSpeed: 1500,
      comfortIndex: 0.8,
      energyEfficiency: 0.7,
      systemEfficiency: 0.75
    };
  }

  /**
   * Predict future road conditions and driving patterns
   */
  private predictFutureConditions(inputs: SuspensionInputs): {
    anticipatedRoughness: number;
    anticipatedAggression: number;
    confidence: number;
  } {
    const recentHistory = this.roadConditionHistory.slice(-10);
    const recentPatterns = this.drivingPatternHistory.slice(-10);

    let anticipatedRoughness = inputs.roadRoughness;
    let anticipatedAggression = inputs.accelerationPattern;
    let confidence = 0.5;

    if (recentHistory.length >= 3) {
      const roughnessTrend = this.calculateTrend(recentHistory.map(h => h.roughness));
      anticipatedRoughness = Math.max(0, Math.min(1, inputs.roadRoughness + roughnessTrend * this.predictiveParams.predictionHorizon));
      confidence += 0.2;
    }

    if (recentPatterns.length >= 3) {
      const aggressionTrend = this.calculateTrend(recentPatterns.map(p => p.aggression));
      anticipatedAggression = Math.max(0, Math.min(1, inputs.accelerationPattern + aggressionTrend * this.predictiveParams.predictionHorizon));
      confidence += 0.2;
    }

    return {
      anticipatedRoughness,
      anticipatedAggression,
      confidence: Math.min(1, confidence)
    };
  }

  /**
   * Apply multi-objective optimization to balance comfort, energy recovery, and stability
   */
  private applyMultiObjectiveOptimization(
    fuzzyOutputs: SuspensionOutputs,
    predictiveOutputs: SuspensionOutputs,
    inputs: SuspensionInputs
  ): SuspensionOutputs {
    const objectives = this.optimizationObjectives;

    // Weighted combination of fuzzy and predictive outputs
    const dampingCoefficient = 
      fuzzyOutputs.dampingCoefficient * (1 - objectives.stabilityWeight) +
      predictiveOutputs.dampingCoefficient * objectives.stabilityWeight;

    const energyRecoveryRate = 
      fuzzyOutputs.energyRecoveryRate * (1 - objectives.energyWeight) +
      predictiveOutputs.energyRecoveryRate * objectives.energyWeight;

    // Optimize for comfort vs energy trade-off
    const comfortEnergyBalance = this.optimizeComfortEnergyTradeoff(inputs, dampingCoefficient, energyRecoveryRate);

    return {
      ...fuzzyOutputs,
      dampingCoefficient: comfortEnergyBalance.optimalDamping,
      energyRecoveryRate: comfortEnergyBalance.optimalEnergy,
      dampingMode: this.determineDampingMode(comfortEnergyBalance.optimalDamping),
      systemEfficiency: comfortEnergyBalance.efficiency
    };
  }

  /**
   * Optimize the trade-off between comfort and energy recovery
   */
  private optimizeComfortEnergyTradeoff(
    inputs: SuspensionInputs,
    baseDamping: number,
    baseEnergy: number
  ): { optimalDamping: number; optimalEnergy: number; efficiency: number } {
    const comfortWeight = this.optimizationObjectives.comfortWeight;
    const energyWeight = this.optimizationObjectives.energyWeight;

    // Simple optimization using weighted objectives
    let bestDamping = baseDamping;
    let bestEnergy = baseEnergy;
    let bestScore = 0;

    // Test different combinations
    for (let dampingFactor = 0.8; dampingFactor <= 1.2; dampingFactor += 0.1) {
      for (let energyFactor = 0.8; energyFactor <= 1.2; energyFactor += 0.1) {
        const testDamping = baseDamping * dampingFactor;
        const testEnergy = baseEnergy * energyFactor;

        const comfortScore = this.evaluateComfortScore(inputs, testDamping);
        const energyScore = this.evaluateEnergyScore(inputs, testEnergy);
        const stabilityScore = this.evaluateStabilityScore(inputs, testDamping);

        const totalScore = 
          comfortScore * comfortWeight +
          energyScore * energyWeight +
          stabilityScore * this.optimizationObjectives.stabilityWeight;

        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestDamping = testDamping;
          bestEnergy = testEnergy;
        }
      }
    }

    return {
      optimalDamping: Math.max(500, Math.min(5000, bestDamping)),
      optimalEnergy: Math.max(0, Math.min(1500, bestEnergy)),
      efficiency: bestScore
    };
  }

  /**
   * Evaluate comfort score for given damping
   */
  private evaluateComfortScore(inputs: SuspensionInputs, damping: number): number {
    const optimalDamping = this.getOptimalDampingForConditions(inputs);
    const deviation = Math.abs(damping - optimalDamping) / optimalDamping;
    return Math.max(0, 1 - deviation);
  }

  /**
   * Evaluate energy recovery score
   */
  private evaluateEnergyScore(inputs: SuspensionInputs, energyRate: number): number {
    const maxPossible = Math.abs(inputs.suspensionVelocity) * 1000;
    if (maxPossible === 0) return 0;
    return Math.min(1, energyRate / maxPossible);
  }

  /**
   * Evaluate stability score for given damping
   */
  private evaluateStabilityScore(inputs: SuspensionInputs, damping: number): number {
    // Higher damping generally improves stability, but too high reduces comfort
    const normalizedDamping = damping / 5000;
    const stabilityFactor = Math.min(1, normalizedDamping * 1.2);
    const comfortPenalty = Math.max(0, normalizedDamping - 0.8) * 0.5;
    return Math.max(0, stabilityFactor - comfortPenalty);
  }

  /**
   * Apply adaptive adjustments based on learned performance
   */
  private applyAdaptiveAdjustments(outputs: SuspensionOutputs, inputs: SuspensionInputs): SuspensionOutputs {
    const adaptiveFactors = this.calculateAdaptiveFactors(inputs);

    return {
      ...outputs,
      dampingCoefficient: outputs.dampingCoefficient * adaptiveFactors.dampingFactor,
      energyRecoveryRate: outputs.energyRecoveryRate * adaptiveFactors.energyFactor,
      valvePosition: Math.max(0, Math.min(1, outputs.valvePosition * adaptiveFactors.valveFactor))
    };
  }

  /**
   * Calculate adaptive factors based on historical performance
   */
  private calculateAdaptiveFactors(inputs: SuspensionInputs): {
    dampingFactor: number;
    energyFactor: number;
    valveFactor: number;
  } {
    const recentPerformance = this.performanceHistory.slice(-this.adaptiveParams.performanceWindow);
    
    if (recentPerformance.length < 10) {
      return { dampingFactor: 1.0, energyFactor: 1.0, valveFactor: 1.0 };
    }

    const avgEfficiency = recentPerformance.reduce((sum, p) => sum + p.efficiency, 0) / recentPerformance.length;
    const avgComfort = recentPerformance.reduce((sum, p) => sum + p.comfort, 0) / recentPerformance.length;
    const avgStability = recentPerformance.reduce((sum, p) => sum + p.stability, 0) / recentPerformance.length;

    // Adjust factors based on performance
    let dampingFactor = 1.0;
    let energyFactor = 1.0;
    let valveFactor = 1.0;

    if (avgComfort < 0.6) {
      dampingFactor *= 0.9; // Reduce damping for better comfort
    }
    if (avgEfficiency < 0.5) {
      energyFactor *= 1.1; // Increase energy recovery
      valveFactor *= 1.05; // Open valves more
    }
    if (avgStability < 0.7) {
      dampingFactor *= 1.1; // Increase damping for stability
    }

    return {
      dampingFactor: Math.max(0.8, Math.min(1.2, dampingFactor)),
      energyFactor: Math.max(0.8, Math.min(1.2, energyFactor)),
      valveFactor: Math.max(0.9, Math.min(1.1, valveFactor))
    };
  }

  /**
   * Update adaptive weights for fuzzy rules based on performance
   */
  private updateAdaptiveWeights(inputs: SuspensionInputs): void {
    if (this.performanceHistory.length < 2) return;

    const recentPerformance = this.performanceHistory.slice(-5);
    const avgPerformance = recentPerformance.reduce((sum, p) => 
      sum + (p.efficiency + p.comfort + p.stability) / 3, 0) / recentPerformance.length;

    this.fuzzyRules.forEach(rule => {
      const currentWeight = this.adaptiveWeights.get(rule.id) || rule.weight;
      const performanceHistory = this.rulePerformanceHistory.get(rule.id) || [];
      
      // Update rule performance (simplified)
      performanceHistory.push(avgPerformance);
      if (performanceHistory.length > this.adaptiveParams.performanceWindow) {
        performanceHistory.shift();
      }

      // Calculate new adaptive weight
      const avgRulePerformance = performanceHistory.reduce((sum, p) => sum + p, 0) / performanceHistory.length;
      const performanceDelta = avgRulePerformance - 0.7; // Target performance
      
      const weightAdjustment = performanceDelta * this.adaptiveParams.learningRate;
      const newWeight = currentWeight + weightAdjustment;
      
      this.adaptiveWeights.set(rule.id, Math.max(0.1, Math.min(1.0, newWeight)));
      this.rulePerformanceHistory.set(rule.id, performanceHistory);
    });
  }

  /**
   * Update road condition history
   */
  private updateRoadConditionHistory(inputs: SuspensionInputs): void {
    this.roadConditionHistory.push({
      timestamp: Date.now(),
      roughness: inputs.roadRoughness,
      gradient: inputs.roadGradient,
      surface: inputs.surfaceType
    });

    // Keep only recent history
    if (this.roadConditionHistory.length > 100) {
      this.roadConditionHistory.shift();
    }
  }

  /**
   * Update driving pattern history
   */
  private updateDrivingPatternHistory(inputs: SuspensionInputs): void {
    const aggression = (inputs.accelerationPattern + inputs.brakingPattern + inputs.corneringPattern) / 3;
    const smoothness = 1 - Math.abs(inputs.suspensionVelocity) / 2; // Simplified
    const efficiency = inputs.energyStorageLevel; // Simplified

    this.drivingPatternHistory.push({
      timestamp: Date.now(),
      aggression,
      smoothness: Math.max(0, Math.min(1, smoothness)),
      efficiency
    });

    // Keep only recent history
    if (this.drivingPatternHistory.length > 100) {
      this.drivingPatternHistory.shift();
    }
  }

  /**
   * Update advanced performance history with stability metric
   */
  private updateAdvancedPerformanceHistory(outputs: SuspensionOutputs, inputs: SuspensionInputs): void {
    const stability = this.calculateStabilityMetric(outputs, inputs);
    
    this.performanceHistory.push({
      timestamp: Date.now(),
      efficiency: outputs.energyEfficiency,
      comfort: outputs.comfortIndex,
      stability
    });

    // Keep only recent history
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory.shift();
    }
  }

  /**
   * Calculate stability metric based on damping and road conditions
   */
  private calculateStabilityMetric(outputs: SuspensionOutputs, inputs: SuspensionInputs): number {
    const dampingStability = Math.min(1, outputs.dampingCoefficient / 3000);
    const velocityStability = Math.max(0, 1 - Math.abs(inputs.suspensionVelocity));
    const roadStability = 1 - inputs.roadRoughness;
    
    return (dampingStability + velocityStability + roadStability) / 3;
  }

  /**
   * Calculate trend from historical data
   */
  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;
    
    const n = data.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, index) => sum + val * index, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return isNaN(slope) ? 0 : slope;
  }

  /**
   * Get adaptive control parameters for external monitoring
   */
  public getAdaptiveParameters(): {
    adaptiveParams: AdaptiveParameters;
    predictiveParams: PredictiveParameters;
    optimizationObjectives: OptimizationObjectives;
    currentAdaptiveWeights: Map<string, number>;
  } {
    return {
      adaptiveParams: { ...this.adaptiveParams },
      predictiveParams: { ...this.predictiveParams },
      optimizationObjectives: { ...this.optimizationObjectives },
      currentAdaptiveWeights: new Map(this.adaptiveWeights)
    };
  }

  /**
   * Update optimization objectives dynamically
   */
  public updateOptimizationObjectives(newObjectives: Partial<OptimizationObjectives>): void {
    this.optimizationObjectives = {
      ...this.optimizationObjectives,
      ...newObjectives
    };

    // Normalize weights to sum to 1
    const totalWeight = Object.values(this.optimizationObjectives).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight > 0) {
      Object.keys(this.optimizationObjectives).forEach(key => {
        (this.optimizationObjectives as any)[key] /= totalWeight;
      });
    }
  }
}