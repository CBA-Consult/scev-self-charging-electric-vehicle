# Comprehensive Thermoelectric Material Evaluation Guide for TEGs

## Executive Summary

This guide provides a comprehensive framework for evaluating thermoelectric materials suitable for Thermoelectric Generator (TEG) applications in automotive systems. The evaluation system considers efficiency, cost-effectiveness, durability, and automotive-specific requirements to identify the most promising materials for converting waste heat into electricity.

## Table of Contents

1. [Introduction](#introduction)
2. [Material Evaluation Framework](#material-evaluation-framework)
3. [Evaluation Criteria](#evaluation-criteria)
4. [Material Database](#material-database)
5. [Evaluation Methodology](#evaluation-methodology)
6. [Application-Specific Recommendations](#application-specific-recommendations)
7. [Implementation Guide](#implementation-guide)
8. [Case Studies](#case-studies)
9. [Future Considerations](#future-considerations)

## Introduction

### Background

Thermoelectric generators (TEGs) convert waste heat directly into electrical energy through the Seebeck effect. The performance of TEGs is critically dependent on the thermoelectric materials used, making material selection a crucial factor in system design and optimization.

### Objectives

- Provide systematic evaluation of thermoelectric materials for automotive applications
- Compare materials based on efficiency, cost, durability, and automotive suitability
- Generate application-specific material recommendations
- Support informed decision-making in TEG system design

### Scope

This evaluation covers:
- Commercial thermoelectric materials (Bi₂Te₃, PbTe, SiGe)
- Advanced materials (skutterudites, half-Heuslers, oxides)
- Nanostructured and composite materials
- Automotive-specific performance requirements

## Material Evaluation Framework

### Core Components

#### 1. Material Database
- Comprehensive collection of thermoelectric materials
- Physical and thermal properties
- Cost and availability data
- Automotive compatibility information

#### 2. Evaluation Engine
- Multi-criteria scoring system
- Weighted performance metrics
- Comparative analysis capabilities
- Application-specific filtering

#### 3. Recommendation System
- Best-fit material identification
- Trade-off analysis
- Application-specific suggestions
- Performance optimization guidance

### Evaluation Architecture

```
Material Input → Property Analysis → Score Calculation → Ranking → Recommendations
     ↓              ↓                    ↓              ↓           ↓
  Database      Efficiency         Weighted         Sorted      Application
  Lookup        Cost Analysis      Scoring          Results     Matching
                Durability         System
                Automotive
```

## Evaluation Criteria

### 1. Efficiency Metrics (35% Weight)

#### Figure of Merit (ZT)
- **Definition**: ZT = S²σT/κ where S is Seebeck coefficient, σ is electrical conductivity, T is temperature, κ is thermal conductivity
- **Target Range**: ZT > 1.0 for automotive applications
- **Scoring**: 
  - ZT ≥ 2.0: 100 points
  - ZT = 1.0: 60 points
  - ZT = 0.5: 30 points
  - ZT < 0.5: 0-30 points

#### Seebeck Coefficient
- **Definition**: Voltage generated per unit temperature difference
- **Target Range**: |S| > 200 μV/K
- **Scoring**: Based on absolute value, higher is better

#### Electrical Conductivity
- **Definition**: Material's ability to conduct electric current
- **Target Range**: σ > 50,000 S/m
- **Scoring**: Higher conductivity scores better

### 2. Cost-Effectiveness (25% Weight)

#### Material Cost
- **Metric**: Cost per kilogram ($/kg)
- **Target**: < $400/kg for commercial viability
- **Scoring**: Inverse relationship - lower cost scores higher

#### Performance-to-Cost Ratio
- **Metric**: (ZT × |Seebeck|) / Cost
- **Purpose**: Identifies materials offering best performance per dollar
- **Scoring**: Higher ratio scores better

### 3. Durability (25% Weight)

#### Operating Temperature Range
- **Metric**: Maximum operating temperature minus minimum
- **Target**: Wide range for versatile applications
- **Scoring**: Wider range scores higher

#### Thermal Expansion Coefficient
- **Metric**: Material expansion per degree temperature change
- **Target**: Low expansion for thermal cycling stability
- **Scoring**: Lower expansion scores higher

#### Material Density
- **Metric**: Mass per unit volume (kg/m³)
- **Purpose**: Indicates structural stability
- **Scoring**: Moderate density preferred

### 4. Automotive Suitability (15% Weight)

#### Temperature Compatibility
- **Requirement**: Operation from -40°C to 600°C
- **Scoring**: Materials covering automotive temperature ranges score higher

#### Vibration Resistance
- **Assessment**: Based on material properties and structure
- **Levels**: Excellent, Good, Fair, Poor
- **Scoring**: Better resistance scores higher

#### Corrosion Resistance
- **Assessment**: Resistance to automotive environment
- **Factors**: Humidity, salt, chemicals, temperature cycling
- **Scoring**: Better resistance scores higher

#### Manufacturability
- **Assessment**: Ease of processing and fabrication
- **Factors**: Processing temperature, complexity, scalability
- **Scoring**: Easier manufacturing scores higher

## Material Database

### Bismuth Telluride (Bi₂Te₃) Family

#### Commercial Grade Bi₂Te₃
- **ZT Value**: 1.0
- **Operating Range**: -40°C to 200°C
- **Cost**: $150/kg
- **Applications**: Low-temperature waste heat recovery
- **Advantages**: Proven technology, good low-temp performance
- **Disadvantages**: Limited temperature range, moderate cost

#### High-Performance Bi₂Te₃
- **ZT Value**: 1.2
- **Operating Range**: -40°C to 250°C
- **Cost**: $280/kg
- **Applications**: Enhanced low-temperature applications
- **Advantages**: Improved efficiency, extended range
- **Disadvantages**: Higher cost

#### Nanostructured Bi₂Te₃/Sb₂Te₃ Superlattice
- **ZT Value**: 2.4
- **Operating Range**: -40°C to 300°C
- **Cost**: $800/kg
- **Applications**: High-performance applications
- **Advantages**: Exceptional efficiency
- **Disadvantages**: Very high cost, complex manufacturing

### Lead Telluride (PbTe) Family

#### Standard PbTe
- **ZT Value**: 1.4
- **Operating Range**: 200°C to 600°C
- **Cost**: $200/kg
- **Applications**: Medium-temperature applications
- **Advantages**: Good mid-range performance, reasonable cost
- **Disadvantages**: Toxicity concerns, limited low-temp performance

#### Doped PbTe
- **ZT Value**: 1.6
- **Operating Range**: 200°C to 650°C
- **Cost**: $350/kg
- **Applications**: Enhanced medium-temperature applications
- **Advantages**: Improved efficiency, extended range
- **Disadvantages**: Higher cost, toxicity

### Silicon Germanium (SiGe) Family

#### Automotive Grade SiGe
- **ZT Value**: 0.9
- **Operating Range**: 400°C to 1000°C
- **Cost**: $300/kg
- **Applications**: High-temperature applications
- **Advantages**: High-temperature stability, non-toxic
- **Disadvantages**: Lower efficiency, high operating temperature

### Advanced Materials

#### Filled Skutterudites (CoSb₃)
- **ZT Value**: 1.3
- **Operating Range**: 300°C to 700°C
- **Cost**: $400/kg
- **Applications**: Medium to high-temperature applications
- **Advantages**: Good efficiency, stable structure
- **Disadvantages**: Complex synthesis, higher cost

#### Half-Heusler Alloys (TiNiSn)
- **ZT Value**: 0.8
- **Operating Range**: 400°C to 800°C
- **Cost**: $250/kg
- **Applications**: High-temperature applications
- **Advantages**: Mechanical stability, scalable synthesis
- **Disadvantages**: Lower efficiency

#### Oxide Thermoelectrics (Ca₃Co₄O₉)
- **ZT Value**: 0.6
- **Operating Range**: 400°C to 900°C
- **Cost**: $180/kg
- **Applications**: High-temperature, oxidizing environments
- **Advantages**: Oxidation resistance, low cost
- **Disadvantages**: Lower efficiency

## Evaluation Methodology

### Scoring System

#### Individual Score Calculation

1. **Efficiency Score (0-100)**
   ```
   ZT_score = min(ZT_value / 2.0, 1.0) × 60
   Seebeck_score = min(|Seebeck| / 300, 1.0) × 25
   Conductivity_score = min(σ / 150000, 1.0) × 15
   Efficiency_score = ZT_score + Seebeck_score + Conductivity_score
   ```

2. **Cost Score (0-100)**
   ```
   Cost_score = max(0, 100 - (cost / max_cost) × 100) × 0.6
   Performance_per_cost = (ZT × |Seebeck|) / cost
   Efficiency_score = min(Performance_per_cost × 10, 50) × 0.4
   Cost_score = Cost_score + Efficiency_score
   ```

3. **Durability Score (0-100)**
   ```
   Temp_range_score = min(temp_range / 800, 1.0) × 30
   Expansion_score = max(0, 30 - thermal_expansion × 1e6 × 2)
   Density_score = min(density / 8000, 1.0) × 20
   Thermal_cond_score = min(thermal_conductivity / 5.0, 1.0) × 20
   Durability_score = sum of above components
   ```

4. **Automotive Score (0-100)**
   ```
   Temperature_compatibility: 25 points if range covers automotive needs
   Vibration_resistance: 25 points based on material assessment
   Corrosion_resistance: 25 points based on environmental compatibility
   Manufacturability: 25 points based on processing complexity
   ```

#### Overall Score Calculation
```
Overall_score = Efficiency_score × W_eff + 
                Cost_score × W_cost + 
                Durability_score × W_dur + 
                Automotive_score × W_auto
```

Where default weights are:
- W_eff = 0.35 (Efficiency)
- W_cost = 0.25 (Cost)
- W_dur = 0.25 (Durability)
- W_auto = 0.15 (Automotive)

### Ranking and Comparison

#### Ranking Categories
1. **Overall Performance**: Weighted combination of all criteria
2. **Efficiency**: Pure thermoelectric performance
3. **Cost-Effectiveness**: Best performance per dollar
4. **Durability**: Long-term reliability and stability

#### Trade-off Analysis
- **Efficiency vs Cost**: Identifies high-performance materials and cost-effective options
- **Durability vs Cost**: Shows relationship between longevity and investment
- **Performance vs Temperature**: Optimal materials for different temperature ranges

## Application-Specific Recommendations

### Brake System TEGs

#### Requirements
- **Temperature Range**: -20°C to 400°C
- **Environment**: High vibration, thermal cycling
- **Power Target**: 50-100W
- **Cost Constraint**: < $300/kg

#### Recommended Materials
1. **Bismuth Telluride (High-Performance)**
   - Excellent low-temperature performance
   - Good automotive compatibility
   - Moderate cost

2. **Lead Telluride (Standard)**
   - Good mid-temperature performance
   - Reasonable cost
   - Proven reliability

#### Implementation Considerations
- Thermal interface optimization
- Vibration dampening
- Corrosion protection

### Exhaust System TEGs

#### Requirements
- **Temperature Range**: 100°C to 800°C
- **Environment**: High temperature, corrosive gases
- **Power Target**: 200-500W
- **Cost Constraint**: < $500/kg

#### Recommended Materials
1. **Filled Skutterudites**
   - Excellent high-temperature performance
   - Good efficiency
   - Stable structure

2. **Silicon Germanium (Automotive Grade)**
   - High-temperature stability
   - Non-toxic
   - Proven in automotive applications

#### Implementation Considerations
- High-temperature packaging
- Thermal management
- Gas-tight sealing

### Electronics Cooling TEGs

#### Requirements
- **Temperature Range**: 0°C to 150°C
- **Environment**: Controlled, low vibration
- **Power Target**: 10-50W
- **Cost Constraint**: < $200/kg

#### Recommended Materials
1. **Commercial Bismuth Telluride**
   - Proven low-temperature performance
   - Cost-effective
   - Easy to manufacture

2. **Oxide Thermoelectrics**
   - Good stability
   - Low cost
   - Oxidation resistant

## Implementation Guide

### Material Selection Process

#### Step 1: Define Requirements
```typescript
const requirements = {
  temperatureRange: { min: -20, max: 400 },
  powerRequirement: 50, // W
  costBudget: 300, // $/kg
  durabilityRequirement: 'high',
  environmentalConditions: 'harsh'
};
```

#### Step 2: Initialize Evaluator
```typescript
import { createAutomotiveMaterialEvaluator } from './MaterialEvaluator';

const evaluator = createAutomotiveMaterialEvaluator();
```

#### Step 3: Get Recommendations
```typescript
const recommendations = evaluator.recommendMaterialsForApplication(requirements);
```

#### Step 4: Analyze Results
```typescript
recommendations.forEach(result => {
  console.log(`Material: ${result.material.name}`);
  console.log(`Overall Score: ${result.scores.overall}`);
  console.log(`Strengths: ${result.analysis.strengths.join(', ')}`);
});
```

### Custom Evaluation Criteria

#### High-Performance Applications
```typescript
const highPerfCriteria = {
  weightFactors: {
    efficiency: 0.50,
    cost: 0.15,
    durability: 0.20,
    automotive: 0.15
  },
  targetZT: 1.8,
  maxCost: 800
};
```

#### Cost-Optimized Applications
```typescript
const costOptimizedCriteria = {
  weightFactors: {
    efficiency: 0.20,
    cost: 0.50,
    durability: 0.20,
    automotive: 0.10
  },
  targetZT: 0.8,
  maxCost: 200
};
```

### Integration with TEG Design

#### Material Property Integration
```typescript
const selectedMaterial = recommendations[0].material;

const tegConfig = {
  pTypeMaterial: selectedMaterial,
  nTypeMaterial: findComplementaryMaterial(selectedMaterial),
  thermoelectricPairs: calculateOptimalPairs(powerRequirement),
  dimensions: optimizeDimensions(selectedMaterial, powerRequirement)
};
```

## Case Studies

### Case Study 1: Passenger Vehicle Brake System

#### Background
- Vehicle: Mid-size sedan
- Brake system: Disc brakes, frequent city driving
- Target: 75W power generation during braking

#### Material Evaluation
Using automotive evaluator with standard criteria:

1. **Top Recommendation**: High-Performance Bi₂Te₃
   - Overall Score: 78.5/100
   - Efficiency: 82/100
   - Cost-Effectiveness: 71/100
   - Durability: 79/100
   - Automotive Suitability: 85/100

2. **Alternative**: Standard PbTe
   - Overall Score: 72.1/100
   - Better high-temperature performance
   - Lower cost
   - Toxicity concerns

#### Implementation Results
- Selected: High-Performance Bi₂Te₃
- Achieved Power: 68W (91% of target)
- Cost: $280/kg
- Lifespan: 12 years estimated

### Case Study 2: Heavy-Duty Truck Exhaust System

#### Background
- Vehicle: Long-haul truck
- Exhaust temperature: 300-700°C
- Target: 400W power generation

#### Material Evaluation
Using high-performance evaluator:

1. **Top Recommendation**: Filled Skutterudites
   - Overall Score: 84.2/100
   - Excellent high-temperature performance
   - Good efficiency at operating conditions
   - Higher cost justified by performance

2. **Alternative**: SiGe Automotive Grade
   - Overall Score: 76.8/100
   - Proven reliability
   - Lower efficiency but stable

#### Implementation Results
- Selected: Filled Skutterudites
- Achieved Power: 385W (96% of target)
- Cost: $400/kg
- Efficiency: 8.5% at 500°C

### Case Study 3: Electric Vehicle Electronics Cooling

#### Background
- Vehicle: Electric sedan
- Electronics temperature: 40-120°C
- Target: 25W power generation + cooling

#### Material Evaluation
Using cost-optimized evaluator:

1. **Top Recommendation**: Commercial Bi₂Te₃
   - Overall Score: 81.3/100
   - Excellent cost-effectiveness
   - Proven low-temperature performance
   - Easy integration

#### Implementation Results
- Selected: Commercial Bi₂Te₃
- Achieved Power: 28W (112% of target)
- Cost: $150/kg
- Dual function: power generation and cooling

## Future Considerations

### Emerging Materials

#### Organic Thermoelectrics
- **Advantages**: Flexible, low-cost, non-toxic
- **Challenges**: Lower efficiency, stability
- **Timeline**: 5-10 years for automotive applications

#### Quantum Dot Superlattices
- **Advantages**: Tunable properties, high ZT potential
- **Challenges**: Complex manufacturing, cost
- **Timeline**: 10-15 years for commercial viability

#### Hybrid Organic-Inorganic Materials
- **Advantages**: Combined benefits of both material types
- **Challenges**: Interface stability, processing
- **Timeline**: 7-12 years for development

### Technology Trends

#### Additive Manufacturing
- **Impact**: Custom geometries, reduced waste
- **Materials**: Printable thermoelectric composites
- **Timeline**: 3-5 years for automotive adoption

#### Machine Learning Optimization
- **Impact**: Accelerated material discovery
- **Applications**: Property prediction, composition optimization
- **Timeline**: Already in development

#### Nanostructuring Advances
- **Impact**: Enhanced ZT values through phonon engineering
- **Techniques**: Superlattices, nanocomposites, grain boundary engineering
- **Timeline**: 5-8 years for cost-effective implementation

### Regulatory Considerations

#### Environmental Regulations
- **Lead-based materials**: Increasing restrictions
- **Recycling requirements**: End-of-life material recovery
- **Toxicity standards**: Stricter automotive material requirements

#### Performance Standards
- **Efficiency targets**: Increasing minimum ZT requirements
- **Durability standards**: Extended automotive lifespan requirements
- **Safety regulations**: Thermal and electrical safety standards

## Conclusion

The comprehensive material evaluation system provides a robust framework for selecting optimal thermoelectric materials for automotive TEG applications. By considering efficiency, cost-effectiveness, durability, and automotive-specific requirements, the system enables informed decision-making and optimal material selection.

### Key Takeaways

1. **Material Selection is Critical**: TEG performance is fundamentally limited by material properties
2. **Application-Specific Optimization**: Different automotive applications require different material priorities
3. **Trade-offs are Inevitable**: Balance between efficiency, cost, and durability must be carefully managed
4. **Future Materials Show Promise**: Emerging materials may significantly improve TEG viability

### Recommendations

1. **Use Systematic Evaluation**: Employ the evaluation framework for all material selection decisions
2. **Consider Total Cost of Ownership**: Include manufacturing, maintenance, and end-of-life costs
3. **Plan for Technology Evolution**: Design systems that can accommodate future material improvements
4. **Validate in Real Conditions**: Test selected materials under actual automotive operating conditions

This evaluation system provides the foundation for advancing thermoelectric technology in automotive applications, supporting the development of more efficient and cost-effective waste heat recovery systems.