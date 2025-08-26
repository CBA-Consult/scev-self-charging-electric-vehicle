/**
 * Optimization-specific type definitions for wind farm layout optimization
 */

export interface WindFarmOptimizationParameters {
  // Site parameters
  site: {
    area: { min: number; max: number; current: number }; // hectares
    turbineSpacing: { min: number; max: number; current: number }; // rotor diameters
    rowSpacing: { min: number; max: number; current: number }; // rotor diameters
  };
  
  // Turbine parameters
  turbine: {
    hubHeight: { min: number; max: number; current: number }; // meters
    rotorDiameter: { min: number; max: number; current: number }; // meters
    ratedPower: { min: number; max: number; current: number }; // MW
    turbineCount: { min: number; max: number; current: number };
  };
  
  // Layout parameters
  layout: {
    gridAngle: { min: number; max: number; current: number }; // degrees
    clusterSize: { min: number; max: number; current: number }; // turbines per cluster
    asymmetryFactor: { min: number; max: number; current: number }; // 0-1 scale
  };
  
  // Environmental parameters
  environmental: {
    noiseLimit: { min: number; max: number; current: number }; // dB(A)
    setbackDistance: { min: number; max: number; current: number }; // meters
    wildlifeBuffer: { min: number; max: number; current: number }; // meters
  };
  
  // Economic parameters
  economic: {
    discountRate: { min: number; max: number; current: number }; // percentage
    electricityPrice: { min: number; max: number; current: number }; // USD/MWh
    carbonPrice: { min: number; max: number; current: number }; // USD/tonne CO2
  };
}

export interface WindFarmOptimizationObjectives {
  // Energy objectives
  maximizeEnergyProduction: {
    weight: number;
    target?: number; // MWh/year
  };
  
  maximizeCapacityFactor: {
    weight: number;
    target?: number; // percentage
  };
  
  minimizeWakeLoss: {
    weight: number;
    target?: number; // percentage
  };
  
  // Economic objectives
  maximizeNPV: {
    weight: number;
    target?: number; // USD
  };
  
  minimizeLCOE: {
    weight: number;
    target?: number; // USD/MWh
  };
  
  maximizeROI: {
    weight: number;
    target?: number; // percentage
  };
  
  // Environmental objectives
  minimizeNoiseImpact: {
    weight: number;
    maxNoiseLevel: number; // dB(A)
  };
  
  minimizeVisualImpact: {
    weight: number;
    maxVisibilityIndex: number; // 0-1 scale
  };
  
  minimizeWildlifeImpact: {
    weight: number;
    maxCollisionRisk: number; // collisions/year
  };
  
  minimizeCarbonFootprint: {
    weight: number;
    maxPaybackTime: number; // years
  };
  
  // Constraint limits
  maxTurbines: number;
  minTurbineSpacing: number; // rotor diameters
  maxNoiseLevel: number; // dB(A)
  maxVisualImpact: number; // 0-1 scale
  minSetbackDistance: number; // meters
}

export interface WindFarmOptimizationResult {
  optimalLayout: WindFarmLayout;
  objectiveValue: number;
  performance: WindFarmPerformanceMetrics;
  convergenceHistory: ConvergenceData[];
  iterations: number;
  computationTime: number;
  optimizationMethod: string;
  constraintViolations: ConstraintViolation[];
}

export interface WindFarmPerformanceMetrics {
  energyProduction: number; // MWh/year
  capacityFactor: number; // percentage
  wakeLoss: number; // percentage
  economicValue: number; // USD NPV
  levelizedCost: number; // USD/MWh
  environmentalScore: number; // 0-100 scale
  feasibilityScore: number; // 0-100 scale
}

export interface ConvergenceData {
  iteration: number;
  objectiveValue: number;
  energyProduction: number;
  economicValue: number;
  environmentalScore: number;
  constraintViolations: number;
}

export interface ConstraintViolation {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  value: number;
  limit: number;
  turbineIds: string[];
}

export interface OptimizationIndividual {
  layout: WindFarmLayout;
  fitness: number;
  objectives: { [key: string]: number };
  constraints: { [key: string]: number };
  feasible: boolean;
  generation: number;
}

export interface OptimizationSettings {
  algorithm: 'genetic' | 'particle_swarm' | 'gradient_based' | 'hybrid' | 'multi_objective';
  populationSize: number;
  maxGenerations: number;
  crossoverRate: number;
  mutationRate: number;
  elitismRate: number;
  convergenceThreshold: number;
  parallelEvaluation: boolean;
  seedLayout?: WindFarmLayout;
}

export interface MultiObjectiveResult {
  paretoFront: WindFarmLayout[];
  hypervolume: number;
  spacing: number;
  convergence: number;
  diversityMetric: number;
}

export interface SensitivityAnalysisResult {
  parameter: string;
  baseValue: number;
  variations: SensitivityPoint[];
  sensitivity: number; // objective change per unit parameter change
  elasticity: number; // percentage change in objective per percentage change in parameter
}

export interface SensitivityPoint {
  parameterValue: number;
  objectiveValue: number;
  energyProduction: number;
  economicValue: number;
  environmentalScore: number;
}

export interface UncertaintyAnalysisResult {
  meanObjective: number;
  standardDeviation: number;
  confidenceInterval: [number, number];
  riskMetrics: RiskMetrics;
  robustLayout: WindFarmLayout;
}

export interface RiskMetrics {
  valueAtRisk: number; // 5th percentile
  conditionalValueAtRisk: number; // expected value below VaR
  probabilityOfLoss: number; // probability of negative NPV
  worstCaseScenario: number;
  bestCaseScenario: number;
}

import { WindFarmLayout } from './WindFarmTypes';