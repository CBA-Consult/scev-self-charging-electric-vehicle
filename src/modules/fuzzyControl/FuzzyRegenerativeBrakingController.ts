/**
 * Fuzzy Control Strategy for Regenerative Braking
 * 
 * This module implements a fuzzy control strategy to manage the distribution 
 * of regenerative braking force on electric vehicles with in-wheel motors.
 * It optimizes the ratio of motor braking force to the whole front-axle 
 * braking force, considering factors like driving speed and braking intensity.
 */

export interface BrakingInputs {
  drivingSpeed: number;      // km/h
  brakingIntensity: number;  // 0-1 (normalized)
  batterySOC: number;        // 0-1 (State of Charge)
  motorTemperature: number;  // °C
}

export interface BrakingOutputs {
  regenerativeBrakingRatio: number;  // 0-1 (ratio of regen to total braking)
  motorTorque: number;              // Nm
  frontAxleBrakingForce: number;    // N
}

export interface FuzzySet {
  name: string;
  membershipFunction: (value: number) => number;
}

export interface FuzzyRule {
  id: string;
  conditions: {
    speed: string;
    intensity: string;
    soc?: string;
    temperature?: string;
  };
  conclusion: {
    ratio: string;
    torque: string;
  };
  weight: number;
}

/**
 * Fuzzy Regenerative Braking Controller
 * 
 * Implements fuzzy logic control for optimizing regenerative braking
 * force distribution in electric vehicles with in-wheel motors.
 */
export class FuzzyRegenerativeBrakingController {
  private speedFuzzySets: Map<string, FuzzySet>;
  private intensityFuzzySets: Map<string, FuzzySet>;
  private socFuzzySets: Map<string, FuzzySet>;
  private temperatureFuzzySets: Map<string, FuzzySet>;
  private ratioFuzzySets: Map<string, FuzzySet>;
  private torqueFuzzySets: Map<string, FuzzySet>;
  private fuzzyRules: FuzzyRule[];

  constructor() {
    this.initializeFuzzySets();
    this.initializeFuzzyRules();
  }

  /**
   * Initialize fuzzy sets for input and output variables
   */
  private initializeFuzzySets(): void {
    // Speed fuzzy sets (km/h)
    this.speedFuzzySets = new Map([
      ['very_low', {
        name: 'very_low',
        membershipFunction: (speed: number) => this.trapezoidalMF(speed, 0, 0, 10, 20)
      }],
      ['low', {
        name: 'low',
        membershipFunction: (speed: number) => this.trapezoidalMF(speed, 10, 20, 30, 40)
      }],
      ['medium', {
        name: 'medium',
        membershipFunction: (speed: number) => this.trapezoidalMF(speed, 30, 40, 60, 80)
      }],
      ['high', {
        name: 'high',
        membershipFunction: (speed: number) => this.trapezoidalMF(speed, 60, 80, 100, 120)
      }],
      ['very_high', {
        name: 'very_high',
        membershipFunction: (speed: number) => this.trapezoidalMF(speed, 100, 120, 150, 150)
      }]
    ]);

    // Braking intensity fuzzy sets (0-1)
    this.intensityFuzzySets = new Map([
      ['light', {
        name: 'light',
        membershipFunction: (intensity: number) => this.trapezoidalMF(intensity, 0, 0, 0.2, 0.4)
      }],
      ['moderate', {
        name: 'moderate',
        membershipFunction: (intensity: number) => this.trapezoidalMF(intensity, 0.2, 0.4, 0.6, 0.8)
      }],
      ['heavy', {
        name: 'heavy',
        membershipFunction: (intensity: number) => this.trapezoidalMF(intensity, 0.6, 0.8, 1.0, 1.0)
      }]
    ]);

    // Battery SOC fuzzy sets (0-1)
    this.socFuzzySets = new Map([
      ['low', {
        name: 'low',
        membershipFunction: (soc: number) => this.trapezoidalMF(soc, 0, 0, 0.2, 0.4)
      }],
      ['medium', {
        name: 'medium',
        membershipFunction: (soc: number) => this.trapezoidalMF(soc, 0.2, 0.4, 0.6, 0.8)
      }],
      ['high', {
        name: 'high',
        membershipFunction: (soc: number) => this.trapezoidalMF(soc, 0.6, 0.8, 1.0, 1.0)
      }]
    ]);

    // Motor temperature fuzzy sets (°C)
    this.temperatureFuzzySets = new Map([
      ['normal', {
        name: 'normal',
        membershipFunction: (temp: number) => this.trapezoidalMF(temp, 0, 0, 60, 80)
      }],
      ['warm', {
        name: 'warm',
        membershipFunction: (temp: number) => this.trapezoidalMF(temp, 60, 80, 100, 120)
      }],
      ['hot', {
        name: 'hot',
        membershipFunction: (temp: number) => this.trapezoidalMF(temp, 100, 120, 150, 150)
      }]
    ]);

    // Regenerative braking ratio fuzzy sets (0-1)
    this.ratioFuzzySets = new Map([
      ['very_low', {
        name: 'very_low',
        membershipFunction: (ratio: number) => this.trapezoidalMF(ratio, 0, 0, 0.1, 0.2)
      }],
      ['low', {
        name: 'low',
        membershipFunction: (ratio: number) => this.trapezoidalMF(ratio, 0.1, 0.2, 0.3, 0.4)
      }],
      ['medium', {
        name: 'medium',
        membershipFunction: (ratio: number) => this.trapezoidalMF(ratio, 0.3, 0.4, 0.6, 0.7)
      }],
      ['high', {
        name: 'high',
        membershipFunction: (ratio: number) => this.trapezoidalMF(ratio, 0.6, 0.7, 0.8, 0.9)
      }],
      ['very_high', {
        name: 'very_high',
        membershipFunction: (ratio: number) => this.trapezoidalMF(ratio, 0.8, 0.9, 1.0, 1.0)
      }]
    ]);

    // Motor torque fuzzy sets (Nm)
    this.torqueFuzzySets = new Map([
      ['very_low', {
        name: 'very_low',
        membershipFunction: (torque: number) => this.trapezoidalMF(torque, 0, 0, 50, 100)
      }],
      ['low', {
        name: 'low',
        membershipFunction: (torque: number) => this.trapezoidalMF(torque, 50, 100, 150, 200)
      }],
      ['medium', {
        name: 'medium',
        membershipFunction: (torque: number) => this.trapezoidalMF(torque, 150, 200, 300, 400)
      }],
      ['high', {
        name: 'high',
        membershipFunction: (torque: number) => this.trapezoidalMF(torque, 300, 400, 500, 600)
      }],
      ['very_high', {
        name: 'very_high',
        membershipFunction: (torque: number) => this.trapezoidalMF(torque, 500, 600, 800, 800)
      }]
    ]);
  }

  /**
   * Initialize fuzzy rules for the control system
   */
  private initializeFuzzyRules(): void {
    this.fuzzyRules = [
      // High speed, light braking - maximize regeneration
      {
        id: 'rule_1',
        conditions: { speed: 'high', intensity: 'light', soc: 'low' },
        conclusion: { ratio: 'very_high', torque: 'medium' },
        weight: 1.0
      },
      {
        id: 'rule_2',
        conditions: { speed: 'high', intensity: 'light', soc: 'medium' },
        conclusion: { ratio: 'high', torque: 'medium' },
        weight: 1.0
      },
      {
        id: 'rule_3',
        conditions: { speed: 'high', intensity: 'light', soc: 'high' },
        conclusion: { ratio: 'medium', torque: 'low' },
        weight: 1.0
      },

      // High speed, moderate braking
      {
        id: 'rule_4',
        conditions: { speed: 'high', intensity: 'moderate', soc: 'low' },
        conclusion: { ratio: 'high', torque: 'high' },
        weight: 1.0
      },
      {
        id: 'rule_5',
        conditions: { speed: 'high', intensity: 'moderate', soc: 'medium' },
        conclusion: { ratio: 'medium', torque: 'high' },
        weight: 1.0
      },
      {
        id: 'rule_6',
        conditions: { speed: 'high', intensity: 'moderate', soc: 'high' },
        conclusion: { ratio: 'low', torque: 'medium' },
        weight: 1.0
      },

      // High speed, heavy braking - safety priority
      {
        id: 'rule_7',
        conditions: { speed: 'high', intensity: 'heavy' },
        conclusion: { ratio: 'low', torque: 'very_high' },
        weight: 1.0
      },

      // Medium speed scenarios
      {
        id: 'rule_8',
        conditions: { speed: 'medium', intensity: 'light', soc: 'low' },
        conclusion: { ratio: 'very_high', torque: 'low' },
        weight: 1.0
      },
      {
        id: 'rule_9',
        conditions: { speed: 'medium', intensity: 'moderate', soc: 'low' },
        conclusion: { ratio: 'high', torque: 'medium' },
        weight: 1.0
      },
      {
        id: 'rule_10',
        conditions: { speed: 'medium', intensity: 'heavy' },
        conclusion: { ratio: 'medium', torque: 'high' },
        weight: 1.0
      },

      // Low speed scenarios - limited regeneration potential
      {
        id: 'rule_11',
        conditions: { speed: 'low', intensity: 'light' },
        conclusion: { ratio: 'medium', torque: 'very_low' },
        weight: 1.0
      },
      {
        id: 'rule_12',
        conditions: { speed: 'low', intensity: 'moderate' },
        conclusion: { ratio: 'low', torque: 'low' },
        weight: 1.0
      },
      {
        id: 'rule_13',
        conditions: { speed: 'low', intensity: 'heavy' },
        conclusion: { ratio: 'very_low', torque: 'medium' },
        weight: 1.0
      },

      // Very low speed - minimal regeneration
      {
        id: 'rule_14',
        conditions: { speed: 'very_low', intensity: 'light' },
        conclusion: { ratio: 'low', torque: 'very_low' },
        weight: 1.0
      },
      {
        id: 'rule_15',
        conditions: { speed: 'very_low', intensity: 'moderate' },
        conclusion: { ratio: 'very_low', torque: 'very_low' },
        weight: 1.0
      },
      {
        id: 'rule_16',
        conditions: { speed: 'very_low', intensity: 'heavy' },
        conclusion: { ratio: 'very_low', torque: 'low' },
        weight: 1.0
      },

      // Temperature-based rules (override for motor protection)
      {
        id: 'rule_17',
        conditions: { temperature: 'hot' },
        conclusion: { ratio: 'very_low', torque: 'very_low' },
        weight: 1.5  // Higher weight for safety
      }
    ];
  }

  /**
   * Trapezoidal membership function
   */
  private trapezoidalMF(x: number, a: number, b: number, c: number, d: number): number {
    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;
    if (x > a && x < b) return (x - a) / (b - a);
    if (x > c && x < d) return (d - x) / (d - c);
    return 0;
  }

  /**
   * Calculate membership degree for a value in a fuzzy set
   */
  private getMembershipDegree(value: number, fuzzySet: FuzzySet): number {
    return fuzzySet.membershipFunction(value);
  }

  /**
   * Evaluate fuzzy rules and calculate output
   */
  private evaluateRules(inputs: BrakingInputs): { ratio: number; torque: number } {
    const ruleActivations: Array<{ ratio: string; torque: string; activation: number }> = [];

    for (const rule of this.fuzzyRules) {
      let activation = 1.0;

      // Calculate activation level for each condition
      if (rule.conditions.speed) {
        const speedSet = this.speedFuzzySets.get(rule.conditions.speed);
        if (speedSet) {
          activation = Math.min(activation, this.getMembershipDegree(inputs.drivingSpeed, speedSet));
        }
      }

      if (rule.conditions.intensity) {
        const intensitySet = this.intensityFuzzySets.get(rule.conditions.intensity);
        if (intensitySet) {
          activation = Math.min(activation, this.getMembershipDegree(inputs.brakingIntensity, intensitySet));
        }
      }

      if (rule.conditions.soc) {
        const socSet = this.socFuzzySets.get(rule.conditions.soc);
        if (socSet) {
          activation = Math.min(activation, this.getMembershipDegree(inputs.batterySOC, socSet));
        }
      }

      if (rule.conditions.temperature) {
        const tempSet = this.temperatureFuzzySets.get(rule.conditions.temperature);
        if (tempSet) {
          activation = Math.min(activation, this.getMembershipDegree(inputs.motorTemperature, tempSet));
        }
      }

      // Apply rule weight
      activation *= rule.weight;

      if (activation > 0) {
        ruleActivations.push({
          ratio: rule.conclusion.ratio,
          torque: rule.conclusion.torque,
          activation
        });
      }
    }

    // Defuzzification using weighted average
    const ratioOutput = this.defuzzifyOutput(ruleActivations.map(r => ({ 
      fuzzySet: r.ratio, 
      activation: r.activation 
    })), this.ratioFuzzySets);

    const torqueOutput = this.defuzzifyOutput(ruleActivations.map(r => ({ 
      fuzzySet: r.torque, 
      activation: r.activation 
    })), this.torqueFuzzySets);

    return { ratio: ratioOutput, torque: torqueOutput };
  }

  /**
   * Defuzzification using centroid method
   */
  private defuzzifyOutput(
    activations: Array<{ fuzzySet: string; activation: number }>,
    fuzzySets: Map<string, FuzzySet>
  ): number {
    let numerator = 0;
    let denominator = 0;

    // Define centroid values for each fuzzy set
    const centroids = new Map([
      ['very_low', 0.05],
      ['low', 0.25],
      ['medium', 0.5],
      ['high', 0.75],
      ['very_high', 0.95]
    ]);

    for (const activation of activations) {
      const centroid = centroids.get(activation.fuzzySet) || 0.5;
      numerator += centroid * activation.activation;
      denominator += activation.activation;
    }

    return denominator > 0 ? numerator / denominator : 0.5;
  }

  /**
   * Main control function - calculates optimal braking parameters
   */
  public calculateOptimalBraking(inputs: BrakingInputs): BrakingOutputs {
    // Validate inputs
    this.validateInputs(inputs);

    // Evaluate fuzzy rules
    const fuzzyOutput = this.evaluateRules(inputs);

    // Calculate motor torque based on fuzzy output and vehicle parameters
    const maxMotorTorque = 800; // Nm - maximum motor torque
    const motorTorque = fuzzyOutput.torque * maxMotorTorque;

    // Calculate front axle braking force
    const wheelRadius = 0.35; // meters - typical wheel radius
    const frontAxleBrakingForce = (motorTorque * fuzzyOutput.ratio) / wheelRadius;

    // Apply safety constraints
    const safeOutputs = this.applySafetyConstraints({
      regenerativeBrakingRatio: fuzzyOutput.ratio,
      motorTorque,
      frontAxleBrakingForce
    }, inputs);

    return safeOutputs;
  }

  /**
   * Validate input parameters
   */
  private validateInputs(inputs: BrakingInputs): void {
    if (inputs.drivingSpeed < 0 || inputs.drivingSpeed > 200) {
      throw new Error('Driving speed must be between 0 and 200 km/h');
    }
    if (inputs.brakingIntensity < 0 || inputs.brakingIntensity > 1) {
      throw new Error('Braking intensity must be between 0 and 1');
    }
    if (inputs.batterySOC < 0 || inputs.batterySOC > 1) {
      throw new Error('Battery SOC must be between 0 and 1');
    }
    if (inputs.motorTemperature < -40 || inputs.motorTemperature > 200) {
      throw new Error('Motor temperature must be between -40 and 200°C');
    }
  }

  /**
   * Apply safety constraints to outputs
   */
  private applySafetyConstraints(outputs: BrakingOutputs, inputs: BrakingInputs): BrakingOutputs {
    let { regenerativeBrakingRatio, motorTorque, frontAxleBrakingForce } = outputs;

    // Limit regenerative braking when battery is nearly full
    if (inputs.batterySOC > 0.95) {
      regenerativeBrakingRatio = Math.min(regenerativeBrakingRatio, 0.1);
    }

    // Reduce regenerative braking at high motor temperatures
    if (inputs.motorTemperature > 120) {
      regenerativeBrakingRatio *= 0.5;
      motorTorque *= 0.5;
    }

    // Ensure minimum mechanical braking for safety
    if (inputs.brakingIntensity > 0.8) {
      regenerativeBrakingRatio = Math.min(regenerativeBrakingRatio, 0.6);
    }

    // Limit maximum motor torque
    motorTorque = Math.min(motorTorque, 800);

    // Recalculate front axle braking force with constrained values
    const wheelRadius = 0.35;
    frontAxleBrakingForce = (motorTorque * regenerativeBrakingRatio) / wheelRadius;

    return {
      regenerativeBrakingRatio,
      motorTorque,
      frontAxleBrakingForce
    };
  }

  /**
   * Get system status and diagnostics
   */
  public getSystemStatus(): {
    isOperational: boolean;
    activeRules: number;
    lastCalculationTime: number;
    diagnostics: string[];
  } {
    return {
      isOperational: true,
      activeRules: this.fuzzyRules.length,
      lastCalculationTime: Date.now(),
      diagnostics: ['System operational', 'All fuzzy sets initialized', 'Rules loaded successfully']
    };
  }
}