# Piezoelectric Harvester Module

This module implements a comprehensive system for designing and optimizing piezoelectric harvester structures for mechanical vibration energy conversion in the Self-Charging Electric Vehicle (SCEV) project.

## Overview

The Piezoelectric Harvester Module provides advanced capabilities for:
- **Structural Design Optimization**: Multi-objective optimization of harvester geometries
- **Material Selection**: Comprehensive database of piezoelectric materials with properties
- **Flexural Analysis**: Detailed stress, strain, and deformation analysis
- **Energy Conversion**: Efficient conversion of mechanical vibrations to electrical energy
- **Reliability Assessment**: Fatigue life and mechanical reliability evaluation

## Key Features

### Structural Optimization
- **Multiple Algorithms**: Genetic Algorithm, Particle Swarm Optimization, Simulated Annealing, Gradient Descent
- **Multi-Objective Optimization**: Simultaneous optimization of power output, efficiency, stress minimization, and reliability
- **Constraint Handling**: Comprehensive constraint management for practical design limitations
- **Design Evaluation**: Comparative analysis of multiple design candidates

### Material Properties Database
- **Comprehensive Materials**: PZT-5H, PZT-5A, PVDF, BaTiO3, Quartz, PMN-PT, AlN, ZnO
- **Temperature Compensation**: Automatic adjustment of material properties for operating temperature
- **Material Recommendations**: Intelligent material selection based on application requirements
- **Cost Analysis**: Material cost estimation and availability assessment

### Flexural Analysis
- **Stress Distribution**: Detailed 2D stress field analysis with tensile, compressive, shear, and von Mises stresses
- **Deformation Analysis**: Complete deflection profiles and strain distributions
- **Dynamic Analysis**: Modal analysis with resonant frequencies and mode shapes
- **Reliability Metrics**: Safety factors, fatigue life estimation, and failure probability assessment

### Energy Harvesting Control
- **Real-time Processing**: Continuous monitoring and optimization of energy conversion
- **Adaptive Control**: Dynamic adjustment based on vibration characteristics
- **Performance Tracking**: Historical performance analysis and trend monitoring
- **Fault Detection**: Automatic detection of structural health issues

## Usage

### Basic Usage

```typescript
import { 
  createPiezoelectricHarvester,
  defaultCantileverDesign,
  createTestVibrationInputs 
} from './modules/piezoelectricHarvester';

// Create a piezoelectric harvester system
const harvester = createPiezoelectricHarvester(
  'pzt-5h',                    // Material type
  defaultCantileverDesign,     // Structural design
  {                            // Optional constraints
    maxStress: 40e6,           // 40 MPa maximum stress
    maxDimensions: {
      length: 0.1,             // 100mm maximum length
      width: 0.02,             // 20mm maximum width
      thickness: 0.002         // 2mm maximum thickness
    }
  }
);

// Create vibration input data
const vibrationData = createTestVibrationInputs({
  acceleration: { x: 1.5, y: 2.0, z: 10.0 }, // m/s²
  frequency: { dominant: 25, harmonics: [50, 75] }, // Hz
  amplitude: 0.002,          // 2mm amplitude
  temperatureAmbient: 30     // °C
});

// Process harvesting cycle
const harvestingInputs = {
  vibrationData,
  loadResistance: 1000,      // Ω
  operatingMode: 'continuous' as const,
  environmentalConditions: {
    temperature: 30,         // °C
    pressure: 101325,        // Pa
    corrosiveEnvironment: false
  }
};

const results = harvester.processHarvestingCycle(harvestingInputs);

console.log(`Power Output: ${results.electricalOutput.power * 1000} mW`);
console.log(`Efficiency: ${results.electricalOutput.efficiency}%`);
console.log(`Max Stress: ${results.mechanicalResponse.stress / 1e6} MPa`);
console.log(`Reliability Score: ${results.structuralHealth.reliabilityScore}`);
```

### Advanced Optimization

```typescript
import { StructuralOptimizer, MaterialProperties } from './modules/piezoelectricHarvester';

// Initialize material properties and optimizer
const materialProps = new MaterialProperties();
const pztMaterial = materialProps.getMaterial('pzt-5h');
const optimizer = new StructuralOptimizer(pztMaterial);

// Define optimization objectives
const optimizationObjectives = {
  maximizePowerOutput: 1.0,    // Highest priority
  maximizeEfficiency: 0.8,     // High priority
  minimizeStress: 0.6,         // Medium priority
  maximizeReliability: 0.9     // High priority
};

// Perform optimization
const optimizationResult = harvester.optimizeStructuralDesign(
  vibrationData,
  optimizationObjectives
);

if (optimizationResult.success) {
  console.log(`Optimization successful!`);
  console.log(`Power improvement: ${optimizationResult.improvementPercentage}%`);
  console.log(`Iterations: ${optimizationResult.iterations}`);
  console.log(`Computation time: ${optimizationResult.computationTime}ms`);
} else {
  console.log('Optimization failed:', optimizationResult.constraintViolations);
}
```

### Material Selection and Comparison

```typescript
import { MaterialProperties } from './modules/piezoelectricHarvester';

const materialProps = new MaterialProperties();

// Get material recommendations
const recommendations = materialProps.getRecommendations({
  application: 'energy harvesting',
  temperatureRange: { min: -20, max: 80 },
  leadFree: true,
  costConstraint: 'medium',
  powerDensityPriority: true
});

console.log('Recommended materials:', recommendations.map(m => m.name));

// Compare materials
const comparison = materialProps.compareMaterials(
  ['pzt-5h', 'pvdf', 'batio3'],
  ['d31', 'couplingFactor', 'density']
);

comparison.forEach(result => {
  console.log(`${result.material}: Score ${result.score.toFixed(2)}`);
  console.log(`  d31: ${result.properties.d31}`);
  console.log(`  Coupling Factor: ${result.properties.couplingFactor}`);
  console.log(`  Density: ${result.properties.density} kg/m³`);
});
```

### Flexural Analysis and Design Evaluation

```typescript
import { FlexuralAnalysis } from './modules/piezoelectricHarvester';

const flexuralAnalysis = new FlexuralAnalysis(pztMaterial);

// Perform detailed deformation analysis
const deformationAnalysis = flexuralAnalysis.analyzeDeformation(
  defaultCantileverDesign,
  vibrationData
);

console.log(`Max Deflection: ${deformationAnalysis.maxDeflection * 1000} mm`);
console.log(`Resonant Frequency: ${deformationAnalysis.resonantFrequency} Hz`);
console.log(`Max Stress: ${deformationAnalysis.maxStress / 1e6} MPa`);

// Calculate detailed stress distribution
const stressDistribution = flexuralAnalysis.calculateStressDistribution(
  defaultCantileverDesign,
  deformationAnalysis
);

console.log(`Max von Mises Stress: ${stressDistribution.vonMises.maximum / 1e6} MPa`);
console.log(`Location: x=${stressDistribution.vonMises.location.x}m, y=${stressDistribution.vonMises.location.y}m`);

// Assess reliability
const reliability = flexuralAnalysis.assessReliability(
  defaultCantileverDesign,
  deformationAnalysis,
  vibrationData
);

console.log(`Safety Factor: ${reliability.safetyFactor.toFixed(2)}`);
console.log(`Fatigue Life: ${reliability.fatigueLife.toExponential(2)} cycles`);
console.log(`Reliability Index: ${reliability.reliabilityIndex.toFixed(3)}`);
console.log(`Maintenance Interval: ${reliability.maintenanceInterval} hours`);
```

### Design Evaluation and Selection

```typescript
// Define multiple design candidates
const designCandidates = [
  {
    ...defaultCantileverDesign,
    dimensions: { length: 0.04, width: 0.008, thickness: 0.0003 }
  },
  {
    ...defaultCantileverDesign,
    dimensions: { length: 0.06, width: 0.012, thickness: 0.0005 }
  },
  {
    ...defaultCantileverDesign,
    dimensions: { length: 0.05, width: 0.010, thickness: 0.0004 }
  }
];

// Evaluate all designs
const evaluation = harvester.evaluateStructuralDesigns(
  designCandidates,
  vibrationData
);

console.log('Design Rankings:');
evaluation.rankings.forEach((ranking, index) => {
  console.log(`${index + 1}. Score: ${ranking.score.toFixed(3)}`);
  console.log(`   Power: ${ranking.powerOutput * 1000} mW`);
  console.log(`   Efficiency: ${ranking.efficiency}%`);
  console.log(`   Reliability: ${ranking.reliability.toFixed(3)}`);
  console.log(`   Dimensions: ${ranking.design.dimensions.length}×${ranking.design.dimensions.width}×${ranking.design.dimensions.thickness}m`);
});

console.log(`\nRecommended Design: ${evaluation.recommendedDesign.dimensions.length}m length`);
```

## System Architecture

### Core Components

1. **PiezoelectricHarvesterController**: Main system controller managing energy harvesting operations
2. **StructuralOptimizer**: Multi-objective optimization engine for structural design
3. **MaterialProperties**: Comprehensive material database and property management
4. **FlexuralAnalysis**: Advanced structural analysis and reliability assessment

### Data Flow

```
Vibration Input → Structural Analysis → Material Response → Electrical Output
      ↓                    ↓                   ↓              ↓
Environmental → Flexural Analysis → Optimization → Performance Metrics
Conditions           ↓                   ↓              ↓
                Stress/Strain → Design Updates → Reliability Assessment
```

### Integration with SCEV System

The piezoelectric harvester integrates seamlessly with the existing SCEV energy management system:

- **Energy Output**: Contributes to the overall energy harvesting portfolio alongside solar panels and regenerative braking
- **Control Integration**: Interfaces with the Power Management Unit (PMU) for optimal energy distribution
- **Monitoring**: Provides real-time performance data to the vehicle's energy management system
- **Adaptive Operation**: Adjusts harvesting parameters based on driving conditions and energy demands

## Configuration Parameters

### Structural Design Parameters

```typescript
interface StructuralDesign {
  type: 'cantilever' | 'fixed-fixed' | 'spiral' | 'cymbal' | 'stack';
  dimensions: {
    length: number;      // m - beam length
    width: number;       // m - beam width
    thickness: number;   // m - beam thickness
  };
  layerConfiguration: {
    piezoelectricLayers: number;     // Number of active layers
    substrateThickness: number;      // m - substrate thickness
    electrodeThickness: number;      // m - electrode thickness
  };
  mountingConfiguration: {
    fixedEnd: 'base' | 'center' | 'both';
    freeEnd: 'tip' | 'none';
    proofMass: number;               // kg - tip mass
  };
  resonantFrequency: number;         // Hz - target frequency
}
```

### Optimization Parameters

```typescript
interface OptimizationParameters {
  objectives: {
    maximizePowerOutput: number;     // Weight 0-1
    maximizeEfficiency: number;      // Weight 0-1
    minimizeStress: number;          // Weight 0-1
    maximizeReliability: number;     // Weight 0-1
  };
  algorithm: 'genetic' | 'particle_swarm' | 'simulated_annealing' | 'gradient_descent';
  populationSize: number;            // Population size for evolutionary algorithms
  generations: number;               // Number of generations/iterations
  mutationRate: number;              // Mutation rate (0-1)
  crossoverRate: number;             // Crossover rate (0-1)
  convergenceTolerance: number;      // Convergence tolerance
}
```

### Design Constraints

```typescript
interface DesignConstraints {
  maxStress: number;                 // Pa - maximum allowable stress
  maxDeflection: number;             // m - maximum deflection
  minResonantFreq: number;           // Hz - minimum resonant frequency
  maxResonantFreq: number;           // Hz - maximum resonant frequency
  maxDimensions: {
    length: number;                  // m - maximum length
    width: number;                   // m - maximum width
    thickness: number;               // m - maximum thickness
  };
  minEfficiency: number;             // Minimum energy conversion efficiency
  operatingTemperatureRange: {
    min: number;                     // °C - minimum operating temperature
    max: number;                     // °C - maximum operating temperature
  };
  fatigueLifeCycles: number;         // Minimum fatigue life cycles
}
```

## Performance Characteristics

### Typical Performance Ranges

| Parameter | Range | Units | Notes |
|-----------|-------|-------|-------|
| Power Output | 0.1 - 10 | mW | Depends on vibration amplitude and frequency |
| Efficiency | 5 - 40 | % | Material and frequency dependent |
| Resonant Frequency | 10 - 1000 | Hz | Tunable through design optimization |
| Power Density | 1 - 100 | mW/cm³ | Volume-normalized power output |
| Operating Temperature | -50 to 200 | °C | Material dependent |
| Fatigue Life | 10⁶ - 10⁹ | cycles | Stress level dependent |

### Material Comparison

| Material | d₃₁ (pC/N) | Coupling Factor | Density (kg/m³) | Cost | Lead-Free |
|----------|------------|-----------------|-----------------|------|-----------|
| PZT-5H | -274 | 0.75 | 7500 | Medium | No |
| PZT-5A | -171 | 0.71 | 7750 | Medium | No |
| PVDF | 23 | 0.12 | 1780 | Low | Yes |
| BaTiO₃ | -78 | 0.38 | 6020 | Medium | Yes |
| PMN-PT | -1330 | 0.92 | 8100 | High | No |
| AlN | -2.1 | 0.25 | 3260 | High | Yes |

## Integration Examples

### Vehicle Integration

```typescript
// Integration with SCEV energy management system
import { FuzzyControlIntegration } from '../fuzzyControl';
import { createPiezoelectricHarvester } from '../piezoelectricHarvester';

class SCEVEnergyManager {
  private fuzzyControl: FuzzyControlIntegration;
  private piezoHarvester: PiezoelectricHarvesterController;
  
  constructor() {
    this.fuzzyControl = new FuzzyControlIntegration(vehicleParams);
    this.piezoHarvester = createPiezoelectricHarvester('pzt-5h', defaultCantileverDesign);
  }
  
  public processEnergyHarvesting(vehicleData: VehicleData): EnergyOutput {
    // Process regenerative braking
    const brakingEnergy = this.fuzzyControl.processControlCycle(vehicleData.systemInputs);
    
    // Process piezoelectric harvesting from road vibrations
    const vibrationData = this.extractVibrationData(vehicleData);
    const piezoEnergy = this.piezoHarvester.processHarvestingCycle({
      vibrationData,
      loadResistance: 1000,
      operatingMode: 'continuous',
      environmentalConditions: vehicleData.environmentalConditions
    });
    
    // Combine energy sources
    return this.combineEnergySources(brakingEnergy, piezoEnergy);
  }
}
```

### Real-time Monitoring

```typescript
// Real-time performance monitoring
class PiezoHarvesterMonitor {
  private harvester: PiezoelectricHarvesterController;
  private performanceHistory: PerformanceRecord[] = [];
  
  public startMonitoring(): void {
    setInterval(() => {
      const currentPerformance = {
        timestamp: Date.now(),
        totalEnergyHarvested: this.harvester.getTotalEnergyHarvested(),
        averageEfficiency: this.harvester.getAverageEfficiency(),
        currentDesign: this.harvester.getCurrentDesign(),
        material: this.harvester.getMaterial()
      };
      
      this.performanceHistory.push(currentPerformance);
      this.analyzePerformanceTrends();
    }, 1000); // Monitor every second
  }
  
  private analyzePerformanceTrends(): void {
    // Implement trend analysis and predictive maintenance
    const recentPerformance = this.performanceHistory.slice(-100);
    const efficiencyTrend = this.calculateTrend(recentPerformance.map(r => r.averageEfficiency));
    
    if (efficiencyTrend < -0.1) {
      console.warn('Declining efficiency detected - maintenance may be required');
    }
  }
}
```

## Testing and Validation

### Unit Tests
Each component includes comprehensive unit tests covering:
- Material property calculations and temperature compensation
- Structural optimization algorithms and convergence
- Flexural analysis accuracy and stress calculations
- Energy conversion efficiency and power output validation

### Integration Tests
System-level tests validate:
- End-to-end energy harvesting workflows
- Multi-objective optimization performance
- Real-time processing capabilities
- Integration with vehicle systems

### Performance Tests
Benchmark tests evaluate:
- Optimization algorithm efficiency and convergence rates
- Computational performance for real-time applications
- Memory usage and resource optimization
- Scalability for multiple harvester units

## Troubleshooting

### Common Issues

1. **Low Power Output**
   - Check vibration frequency matching with resonant frequency
   - Verify material properties and temperature compensation
   - Optimize load resistance for maximum power transfer

2. **High Stress Levels**
   - Reduce proof mass or increase beam thickness
   - Consider alternative materials with higher yield strength
   - Implement stress-based optimization constraints

3. **Optimization Convergence Issues**
   - Adjust algorithm parameters (population size, mutation rate)
   - Check constraint feasibility
   - Try alternative optimization algorithms

4. **Material Selection Problems**
   - Review application requirements and constraints
   - Consider temperature range and environmental conditions
   - Evaluate cost vs. performance trade-offs

### Performance Optimization Tips

1. **Frequency Tuning**: Match harvester resonant frequency to dominant vibration frequency
2. **Material Selection**: Choose materials based on specific application requirements
3. **Geometric Optimization**: Use multi-objective optimization for balanced performance
4. **Load Matching**: Optimize electrical load resistance for maximum power transfer
5. **Temperature Compensation**: Account for temperature effects on material properties

## Future Enhancements

### Planned Features
- **Multi-frequency Harvesting**: Broadband energy harvesting from multiple frequency sources
- **Adaptive Tuning**: Real-time resonant frequency adjustment
- **Advanced Materials**: Integration of new piezoelectric materials and composites
- **Machine Learning**: AI-driven optimization and predictive maintenance
- **Wireless Monitoring**: Remote performance monitoring and diagnostics

### Research Areas
- **Nonlinear Dynamics**: Advanced modeling of large-amplitude vibrations
- **Fatigue Modeling**: Improved fatigue life prediction models
- **Multi-physics Coupling**: Coupled electro-mechanical-thermal analysis
- **Nano-scale Effects**: Incorporation of size effects in material properties

## References

1. Roundy, S., Wright, P. K., & Rabaey, J. (2003). A study of low level vibrations as a power source for wireless sensor nodes. Computer communications, 26(11), 1131-1144.

2. Anton, S. R., & Sodano, H. A. (2007). A review of power harvesting using piezoelectric materials (2003–2006). Smart materials and structures, 16(3), R1.

3. Erturk, A., & Inman, D. J. (2011). Piezoelectric energy harvesting. John Wiley & Sons.

4. Beeby, S. P., Tudor, M. J., & White, N. M. (2006). Energy harvesting vibration sources for microsystems applications. Measurement science and technology, 17(12), R175.

5. Sodano, H. A., Inman, D. J., & Park, G. (2004). A review of power harvesting from vibration using piezoelectric materials. Shock and Vibration Digest, 36(3), 197-206.