/**
 * Economic Optimizer
 * 
 * Performs comprehensive economic analysis and optimization for wind farm projects
 * including LCOE, NPV, IRR, and financial risk assessment.
 */

import {
  WindFarmSite,
  WindFarmLayout,
  EconomicMetrics
} from './types/WindFarmTypes';

export interface EconomicAnalysisResult {
  baseCase: EconomicMetrics;
  sensitivityAnalysis: SensitivityAnalysisResult[];
  riskAnalysis: RiskAnalysisResult;
  financingOptions: FinancingOption[];
  optimizationRecommendations: EconomicOptimizationRecommendation[];
  competitiveAnalysis: CompetitiveAnalysis;
}

export interface SensitivityAnalysisResult {
  parameter: string;
  baseValue: number;
  variations: ParameterVariation[];
  sensitivity: number; // Change in NPV per unit change in parameter
  elasticity: number; // Percentage change in NPV per percentage change in parameter
}

export interface ParameterVariation {
  parameterValue: number;
  npv: number;
  irr: number;
  lcoe: number;
  paybackPeriod: number;
}

export interface RiskAnalysisResult {
  probabilityDistributions: ProbabilityDistribution[];
  valueAtRisk: ValueAtRisk;
  scenarioAnalysis: ScenarioAnalysis;
  riskMitigation: RiskMitigationStrategy[];
}

export interface ProbabilityDistribution {
  metric: string;
  mean: number;
  standardDeviation: number;
  percentiles: { [percentile: number]: number };
  distribution: 'normal' | 'lognormal' | 'triangular' | 'uniform';
}

export interface ValueAtRisk {
  confidence: number; // e.g., 95%
  npvAtRisk: number; // NPV at the confidence level
  probabilityOfLoss: number; // Probability of negative NPV
  expectedShortfall: number; // Expected loss given loss occurs
}

export interface ScenarioAnalysis {
  baseCase: EconomicMetrics;
  optimisticCase: EconomicMetrics;
  pessimisticCase: EconomicMetrics;
  scenarios: CustomScenario[];
}

export interface CustomScenario {
  name: string;
  description: string;
  assumptions: { [parameter: string]: number };
  results: EconomicMetrics;
  probability: number;
}

export interface RiskMitigationStrategy {
  risk: string;
  strategy: string;
  cost: number; // USD
  effectiveness: number; // 0-1 scale
  implementation: string;
}

export interface FinancingOption {
  type: 'debt' | 'equity' | 'hybrid' | 'ppa' | 'lease';
  description: string;
  debtEquityRatio: number;
  interestRate: number;
  term: number; // years
  impact: FinancingImpact;
}

export interface FinancingImpact {
  npv: number;
  irr: number;
  lcoe: number;
  cashFlowProfile: number[]; // Annual cash flows
  taxBenefits: number;
}

export interface EconomicOptimizationRecommendation {
  category: 'design' | 'financing' | 'operations' | 'timing';
  recommendation: string;
  currentValue: number;
  recommendedValue: number;
  npvImprovement: number; // USD
  implementationCost: number; // USD
  paybackPeriod: number; // years
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface CompetitiveAnalysis {
  benchmarkProjects: BenchmarkProject[];
  marketPosition: 'below_average' | 'average' | 'above_average' | 'best_in_class';
  competitiveAdvantages: string[];
  competitiveDisadvantages: string[];
  marketTrends: MarketTrend[];
}

export interface BenchmarkProject {
  name: string;
  capacity: number; // MW
  lcoe: number; // USD/MWh
  capacityFactor: number; // percentage
  location: string;
  technology: string;
  year: number;
}

export interface MarketTrend {
  trend: string;
  impact: 'positive' | 'negative' | 'neutral';
  magnitude: 'low' | 'medium' | 'high';
  timeframe: string;
  description: string;
}

export class EconomicOptimizer {
  
  /**
   * Comprehensive economic analysis of wind farm project
   */
  public async analyzeEconomics(
    layout: WindFarmLayout,
    site: WindFarmSite,
    economicParameters?: EconomicParameters
  ): Promise<EconomicAnalysisResult> {
    console.log('Performing comprehensive economic analysis...');
    
    const params = economicParameters || this.getDefaultEconomicParameters();
    
    // Base case analysis
    const baseCase = await this.calculateBaseCase(layout, site, params);
    
    // Sensitivity analysis
    const sensitivityAnalysis = await this.performSensitivityAnalysis(layout, site, params);
    
    // Risk analysis
    const riskAnalysis = await this.performRiskAnalysis(layout, site, params);
    
    // Financing options analysis
    const financingOptions = await this.analyzeFinancingOptions(layout, site, params);
    
    // Optimization recommendations
    const optimizationRecommendations = await this.generateOptimizationRecommendations(
      layout, site, params, baseCase
    );
    
    // Competitive analysis
    const competitiveAnalysis = await this.performCompetitiveAnalysis(layout, site, baseCase);
    
    return {
      baseCase,
      sensitivityAnalysis,
      riskAnalysis,
      financingOptions,
      optimizationRecommendations,
      competitiveAnalysis
    };
  }

  /**
   * Optimize layout for maximum economic value
   */
  public async optimizeForEconomicValue(
    layout: WindFarmLayout,
    site: WindFarmSite,
    constraints: EconomicConstraints
  ): Promise<{
    optimizedLayout: WindFarmLayout;
    economicImprovement: number; // USD NPV improvement
    optimizationSteps: OptimizationStep[];
  }> {
    console.log('Optimizing layout for maximum economic value...');
    
    let currentLayout = { ...layout };
    let bestLayout = currentLayout;
    let bestNPV = -Infinity;
    const optimizationSteps: OptimizationStep[] = [];
    
    const params = this.getDefaultEconomicParameters();
    const initialEconomics = await this.calculateBaseCase(currentLayout, site, params);
    const initialNPV = initialEconomics.netPresentValue;
    
    // Iterative optimization
    for (let iteration = 0; iteration < 20; iteration++) {
      const recommendations = await this.generateOptimizationRecommendations(
        currentLayout, site, params, await this.calculateBaseCase(currentLayout, site, params)
      );
      
      if (recommendations.length === 0) break;
      
      // Apply best recommendation
      const bestRecommendation = recommendations.reduce((best, current) => 
        current.npvImprovement > best.npvImprovement ? current : best
      );
      
      if (bestRecommendation.npvImprovement < 100000) break; // Minimum improvement threshold
      
      currentLayout = this.applyEconomicRecommendation(currentLayout, bestRecommendation);
      const newEconomics = await this.calculateBaseCase(currentLayout, site, params);
      
      optimizationSteps.push({
        iteration: iteration + 1,
        recommendation: bestRecommendation.recommendation,
        npvBefore: bestNPV === -Infinity ? initialNPV : bestNPV,
        npvAfter: newEconomics.netPresentValue,
        improvement: newEconomics.netPresentValue - (bestNPV === -Infinity ? initialNPV : bestNPV)
      });
      
      if (newEconomics.netPresentValue > bestNPV) {
        bestNPV = newEconomics.netPresentValue;
        bestLayout = { ...currentLayout };
      }
    }
    
    const economicImprovement = bestNPV - initialNPV;
    
    return {
      optimizedLayout: bestLayout,
      economicImprovement,
      optimizationSteps
    };
  }

  /**
   * Calculate Levelized Cost of Energy (LCOE)
   */
  public calculateLCOE(
    capitalCost: number,
    operationalCost: number,
    annualEnergyProduction: number,
    discountRate: number,
    projectLife: number = 25
  ): number {
    // Calculate present value of costs
    let pvCosts = capitalCost;
    for (let year = 1; year <= projectLife; year++) {
      pvCosts += operationalCost / Math.pow(1 + discountRate, year);
    }
    
    // Calculate present value of energy production
    let pvEnergy = 0;
    for (let year = 1; year <= projectLife; year++) {
      // Assume 0.5% annual degradation
      const annualProduction = annualEnergyProduction * Math.pow(0.995, year - 1);
      pvEnergy += annualProduction / Math.pow(1 + discountRate, year);
    }
    
    return pvCosts / pvEnergy;
  }

  /**
   * Calculate Net Present Value (NPV)
   */
  public calculateNPV(
    cashFlows: number[],
    discountRate: number,
    initialInvestment: number
  ): number {
    let npv = -initialInvestment;
    
    for (let year = 0; year < cashFlows.length; year++) {
      npv += cashFlows[year] / Math.pow(1 + discountRate, year + 1);
    }
    
    return npv;
  }

  /**
   * Calculate Internal Rate of Return (IRR)
   */
  public calculateIRR(
    cashFlows: number[],
    initialInvestment: number,
    maxIterations: number = 100
  ): number {
    const totalCashFlows = [-initialInvestment, ...cashFlows];
    
    // Use Newton-Raphson method
    let irr = 0.1; // Initial guess
    
    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dnpv = 0;
      
      for (let t = 0; t < totalCashFlows.length; t++) {
        npv += totalCashFlows[t] / Math.pow(1 + irr, t);
        dnpv -= t * totalCashFlows[t] / Math.pow(1 + irr, t + 1);
      }
      
      const newIrr = irr - npv / dnpv;
      
      if (Math.abs(newIrr - irr) < 0.0001) {
        return newIrr;
      }
      
      irr = newIrr;
    }
    
    return irr;
  }

  // Private helper methods

  private async calculateBaseCase(
    layout: WindFarmLayout,
    site: WindFarmSite,
    params: EconomicParameters
  ): Promise<EconomicMetrics> {
    // Calculate capital costs
    const turbineCost = layout.turbines.length * params.turbineCostPerMW * layout.turbines[0].turbineSpec.ratedPower;
    const balanceOfSystemCost = turbineCost * params.balanceOfSystemMultiplier;
    const developmentCost = layout.totalCapacity * params.developmentCostPerMW;
    const capitalCost = turbineCost + balanceOfSystemCost + developmentCost;
    
    // Calculate operational costs
    const annualOperationalCost = layout.totalCapacity * params.operationalCostPerMWPerYear;
    
    // Calculate revenue
    const annualEnergyProduction = layout.energyProduction.annualEnergyProduction;
    const annualRevenue = annualEnergyProduction * params.electricityPrice;
    
    // Generate cash flows
    const projectLife = 25;
    const cashFlows: number[] = [];
    
    for (let year = 1; year <= projectLife; year++) {
      // Apply degradation and inflation
      const energyProduction = annualEnergyProduction * Math.pow(0.995, year - 1);
      const revenue = energyProduction * params.electricityPrice * Math.pow(1 + params.inflationRate, year - 1);
      const opCost = annualOperationalCost * Math.pow(1 + params.inflationRate, year - 1);
      
      // Tax calculations
      const depreciation = capitalCost / projectLife; // Straight-line depreciation
      const ebitda = revenue - opCost;
      const ebit = ebitda - depreciation;
      const tax = Math.max(0, ebit * params.taxRate);
      const netIncome = ebit - tax;
      const cashFlow = netIncome + depreciation; // Add back depreciation
      
      cashFlows.push(cashFlow);
    }
    
    // Calculate financial metrics
    const npv = this.calculateNPV(cashFlows, params.discountRate, capitalCost);
    const irr = this.calculateIRR(cashFlows, capitalCost);
    const lcoe = this.calculateLCOE(capitalCost, annualOperationalCost, annualEnergyProduction, params.discountRate);
    const paybackPeriod = this.calculatePaybackPeriod(cashFlows, capitalCost);
    const profitabilityIndex = (npv + capitalCost) / capitalCost;
    
    return {
      capitalCost,
      operationalCost: annualOperationalCost,
      levelizedCostOfEnergy: lcoe,
      netPresentValue: npv,
      internalRateOfReturn: irr,
      paybackPeriod,
      profitabilityIndex
    };
  }

  private async performSensitivityAnalysis(
    layout: WindFarmLayout,
    site: WindFarmSite,
    params: EconomicParameters
  ): Promise<SensitivityAnalysisResult[]> {
    const sensitivityResults: SensitivityAnalysisResult[] = [];
    
    const sensitivityParameters = [
      { name: 'electricityPrice', baseValue: params.electricityPrice, variation: 0.2 },
      { name: 'capitalCost', baseValue: params.turbineCostPerMW, variation: 0.15 },
      { name: 'capacityFactor', baseValue: layout.energyProduction.capacityFactor, variation: 0.1 },
      { name: 'discountRate', baseValue: params.discountRate, variation: 0.02 },
      { name: 'operationalCost', baseValue: params.operationalCostPerMWPerYear, variation: 0.25 }
    ];
    
    for (const param of sensitivityParameters) {
      const variations: ParameterVariation[] = [];
      
      // Test variations from -50% to +50%
      for (let factor = 0.5; factor <= 1.5; factor += 0.1) {
        const modifiedParams = { ...params };
        const paramValue = param.baseValue * factor;
        
        // Apply parameter change
        switch (param.name) {
          case 'electricityPrice':
            modifiedParams.electricityPrice = paramValue;
            break;
          case 'capitalCost':
            modifiedParams.turbineCostPerMW = paramValue;
            break;
          case 'discountRate':
            modifiedParams.discountRate = paramValue;
            break;
          case 'operationalCost':
            modifiedParams.operationalCostPerMWPerYear = paramValue;
            break;
        }
        
        const economics = await this.calculateBaseCase(layout, site, modifiedParams);
        
        variations.push({
          parameterValue: paramValue,
          npv: economics.netPresentValue,
          irr: economics.internalRateOfReturn,
          lcoe: economics.levelizedCostOfEnergy,
          paybackPeriod: economics.paybackPeriod
        });
      }
      
      // Calculate sensitivity metrics
      const baseCase = variations.find(v => Math.abs(v.parameterValue - param.baseValue) < 0.01);
      const sensitivity = this.calculateSensitivity(variations, param.baseValue);
      const elasticity = this.calculateElasticity(variations, param.baseValue, baseCase?.npv || 0);
      
      sensitivityResults.push({
        parameter: param.name,
        baseValue: param.baseValue,
        variations,
        sensitivity,
        elasticity
      });
    }
    
    return sensitivityResults;
  }

  private async performRiskAnalysis(
    layout: WindFarmLayout,
    site: WindFarmSite,
    params: EconomicParameters
  ): Promise<RiskAnalysisResult> {
    // Monte Carlo simulation for risk analysis
    const numSimulations = 1000;
    const npvResults: number[] = [];
    
    for (let i = 0; i < numSimulations; i++) {
      // Generate random parameters
      const randomParams = this.generateRandomParameters(params);
      const economics = await this.calculateBaseCase(layout, site, randomParams);
      npvResults.push(economics.netPresentValue);
    }
    
    // Calculate statistics
    npvResults.sort((a, b) => a - b);
    const mean = npvResults.reduce((sum, val) => sum + val, 0) / npvResults.length;
    const variance = npvResults.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / npvResults.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Calculate percentiles
    const percentiles: { [percentile: number]: number } = {};
    [5, 10, 25, 50, 75, 90, 95].forEach(p => {
      const index = Math.floor((p / 100) * npvResults.length);
      percentiles[p] = npvResults[index];
    });
    
    // Value at Risk
    const var95 = percentiles[5];
    const probabilityOfLoss = npvResults.filter(npv => npv < 0).length / npvResults.length;
    const lossValues = npvResults.filter(npv => npv < var95);
    const expectedShortfall = lossValues.length > 0 ? 
      lossValues.reduce((sum, val) => sum + val, 0) / lossValues.length : 0;
    
    return {
      probabilityDistributions: [{
        metric: 'NPV',
        mean,
        standardDeviation,
        percentiles,
        distribution: 'normal'
      }],
      valueAtRisk: {
        confidence: 95,
        npvAtRisk: var95,
        probabilityOfLoss,
        expectedShortfall
      },
      scenarioAnalysis: await this.performScenarioAnalysis(layout, site, params),
      riskMitigation: this.getRiskMitigationStrategies()
    };
  }

  private async performScenarioAnalysis(
    layout: WindFarmLayout,
    site: WindFarmSite,
    params: EconomicParameters
  ): Promise<ScenarioAnalysis> {
    const baseCase = await this.calculateBaseCase(layout, site, params);
    
    // Optimistic scenario
    const optimisticParams = { ...params };
    optimisticParams.electricityPrice *= 1.2;
    optimisticParams.turbineCostPerMW *= 0.9;
    optimisticParams.operationalCostPerMWPerYear *= 0.8;
    const optimisticCase = await this.calculateBaseCase(layout, site, optimisticParams);
    
    // Pessimistic scenario
    const pessimisticParams = { ...params };
    pessimisticParams.electricityPrice *= 0.8;
    pessimisticParams.turbineCostPerMW *= 1.15;
    pessimisticParams.operationalCostPerMWPerYear *= 1.3;
    const pessimisticCase = await this.calculateBaseCase(layout, site, pessimisticParams);
    
    return {
      baseCase,
      optimisticCase,
      pessimisticCase,
      scenarios: []
    };
  }

  private async analyzeFinancingOptions(
    layout: WindFarmLayout,
    site: WindFarmSite,
    params: EconomicParameters
  ): Promise<FinancingOption[]> {
    // Simplified financing options analysis
    return [
      {
        type: 'debt',
        description: 'Traditional project finance with 70% debt',
        debtEquityRatio: 0.7,
        interestRate: 0.05,
        term: 20,
        impact: {
          npv: 0,
          irr: 0,
          lcoe: 0,
          cashFlowProfile: [],
          taxBenefits: 0
        }
      }
    ];
  }

  private async generateOptimizationRecommendations(
    layout: WindFarmLayout,
    site: WindFarmSite,
    params: EconomicParameters,
    baseCase: EconomicMetrics
  ): Promise<EconomicOptimizationRecommendation[]> {
    const recommendations: EconomicOptimizationRecommendation[] = [];
    
    // Turbine technology upgrade
    if (layout.turbines[0].turbineSpec.ratedPower < 3.0) {
      recommendations.push({
        category: 'design',
        recommendation: 'Upgrade to larger turbines (3+ MW)',
        currentValue: layout.turbines[0].turbineSpec.ratedPower,
        recommendedValue: 3.0,
        npvImprovement: 5000000,
        implementationCost: 2000000,
        paybackPeriod: 3,
        priority: 'high'
      });
    }
    
    // Hub height optimization
    if (layout.turbines[0].turbineSpec.hubHeight < 100) {
      recommendations.push({
        category: 'design',
        recommendation: 'Increase hub height to 100m+',
        currentValue: layout.turbines[0].turbineSpec.hubHeight,
        recommendedValue: 100,
        npvImprovement: 3000000,
        implementationCost: 1000000,
        paybackPeriod: 2.5,
        priority: 'medium'
      });
    }
    
    return recommendations.sort((a, b) => b.npvImprovement - a.npvImprovement);
  }

  private async performCompetitiveAnalysis(
    layout: WindFarmLayout,
    site: WindFarmSite,
    baseCase: EconomicMetrics
  ): Promise<CompetitiveAnalysis> {
    // Simplified competitive analysis
    const benchmarkProjects: BenchmarkProject[] = [
      { name: 'Reference Project 1', capacity: 100, lcoe: 45, capacityFactor: 35, location: 'Texas', technology: 'Onshore', year: 2023 },
      { name: 'Reference Project 2', capacity: 150, lcoe: 50, capacityFactor: 32, location: 'Iowa', technology: 'Onshore', year: 2023 },
      { name: 'Reference Project 3', capacity: 200, lcoe: 42, capacityFactor: 38, location: 'Kansas', technology: 'Onshore', year: 2023 }
    ];
    
    const averageLCOE = benchmarkProjects.reduce((sum, p) => sum + p.lcoe, 0) / benchmarkProjects.length;
    let marketPosition: 'below_average' | 'average' | 'above_average' | 'best_in_class';
    
    if (baseCase.levelizedCostOfEnergy < averageLCOE * 0.9) marketPosition = 'best_in_class';
    else if (baseCase.levelizedCostOfEnergy < averageLCOE) marketPosition = 'above_average';
    else if (baseCase.levelizedCostOfEnergy < averageLCOE * 1.1) marketPosition = 'average';
    else marketPosition = 'below_average';
    
    return {
      benchmarkProjects,
      marketPosition,
      competitiveAdvantages: ['Good wind resource', 'Proximity to transmission'],
      competitiveDisadvantages: ['Higher construction costs', 'Environmental constraints'],
      marketTrends: [
        { trend: 'Declining turbine costs', impact: 'positive', magnitude: 'medium', timeframe: '2024-2026', description: 'Continued cost reductions expected' },
        { trend: 'Grid congestion', impact: 'negative', magnitude: 'low', timeframe: '2024-2025', description: 'Potential curtailment issues' }
      ]
    };
  }

  // Utility methods

  private getDefaultEconomicParameters(): EconomicParameters {
    return {
      turbineCostPerMW: 1200000,
      balanceOfSystemMultiplier: 0.3,
      developmentCostPerMW: 100000,
      operationalCostPerMWPerYear: 40000,
      electricityPrice: 50,
      discountRate: 0.08,
      inflationRate: 0.025,
      taxRate: 0.25
    };
  }

  private generateRandomParameters(baseParams: EconomicParameters): EconomicParameters {
    const randomParams = { ...baseParams };
    
    // Add random variations (normal distribution)
    randomParams.electricityPrice *= (1 + this.normalRandom() * 0.15);
    randomParams.turbineCostPerMW *= (1 + this.normalRandom() * 0.1);
    randomParams.operationalCostPerMWPerYear *= (1 + this.normalRandom() * 0.2);
    
    return randomParams;
  }

  private normalRandom(): number {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  private calculatePaybackPeriod(cashFlows: number[], initialInvestment: number): number {
    let cumulativeCashFlow = -initialInvestment;
    
    for (let year = 0; year < cashFlows.length; year++) {
      cumulativeCashFlow += cashFlows[year];
      if (cumulativeCashFlow >= 0) {
        return year + 1 - (cumulativeCashFlow - cashFlows[year]) / cashFlows[year];
      }
    }
    
    return cashFlows.length; // If payback not achieved within project life
  }

  private calculateSensitivity(variations: ParameterVariation[], baseValue: number): number {
    // Linear regression to calculate sensitivity
    const n = variations.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (const variation of variations) {
      const x = variation.parameterValue;
      const y = variation.npv;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private calculateElasticity(variations: ParameterVariation[], baseValue: number, baseNPV: number): number {
    const sensitivity = this.calculateSensitivity(variations, baseValue);
    return (sensitivity * baseValue) / baseNPV;
  }

  private getRiskMitigationStrategies(): RiskMitigationStrategy[] {
    return [
      {
        risk: 'Electricity price volatility',
        strategy: 'Long-term power purchase agreement',
        cost: 0,
        effectiveness: 0.8,
        implementation: 'Negotiate 15-20 year PPA with creditworthy offtaker'
      },
      {
        risk: 'Construction cost overruns',
        strategy: 'Fixed-price EPC contract',
        cost: 100000,
        effectiveness: 0.7,
        implementation: 'Secure fixed-price contract with performance guarantees'
      }
    ];
  }

  private applyEconomicRecommendation(
    layout: WindFarmLayout,
    recommendation: EconomicOptimizationRecommendation
  ): WindFarmLayout {
    const newLayout = { ...layout };
    
    // Apply recommendation based on category and type
    switch (recommendation.category) {
      case 'design':
        if (recommendation.recommendation.includes('larger turbines')) {
          newLayout.turbines = newLayout.turbines.map(turbine => ({
            ...turbine,
            turbineSpec: {
              ...turbine.turbineSpec,
              ratedPower: recommendation.recommendedValue
            }
          }));
        }
        break;
      // Add other recommendation applications
    }
    
    return newLayout;
  }
}

// Supporting interfaces

interface EconomicParameters {
  turbineCostPerMW: number;
  balanceOfSystemMultiplier: number;
  developmentCostPerMW: number;
  operationalCostPerMWPerYear: number;
  electricityPrice: number;
  discountRate: number;
  inflationRate: number;
  taxRate: number;
}

interface EconomicConstraints {
  maxCapitalCost?: number;
  minIRR?: number;
  maxPaybackPeriod?: number;
  maxLCOE?: number;
}

interface OptimizationStep {
  iteration: number;
  recommendation: string;
  npvBefore: number;
  npvAfter: number;
  improvement: number;
}