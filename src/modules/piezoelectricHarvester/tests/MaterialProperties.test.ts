/**
 * Unit tests for Material Properties
 */

import {
  MaterialProperties,
  PiezoelectricMaterial,
  MaterialConstants,
  TemperatureCoefficients
} from '../MaterialProperties';

describe('MaterialProperties', () => {
  let materialProps: MaterialProperties;

  beforeEach(() => {
    materialProps = new MaterialProperties();
  });

  describe('Material Database', () => {
    test('should have predefined materials', () => {
      const availableMaterials = materialProps.getAvailableMaterials();
      
      expect(availableMaterials.length).toBeGreaterThan(0);
      expect(availableMaterials).toContain('pzt-5h');
      expect(availableMaterials).toContain('pzt-5a');
      expect(availableMaterials).toContain('pvdf');
      expect(availableMaterials).toContain('batio3');
      expect(availableMaterials).toContain('quartz');
      expect(availableMaterials).toContain('pmn-pt');
      expect(availableMaterials).toContain('aln');
      expect(availableMaterials).toContain('zno');
    });

    test('should retrieve material by name', () => {
      const pztMaterial = materialProps.getMaterial('pzt-5h');
      
      expect(pztMaterial).toBeDefined();
      expect(pztMaterial.name).toBe('PZT-5H');
      expect(pztMaterial.type).toBe('ceramic');
      expect(pztMaterial.constants).toBeDefined();
      expect(pztMaterial.constants.d31).toBeLessThan(0); // d31 is typically negative
      expect(pztMaterial.constants.d33).toBeGreaterThan(0); // d33 is typically positive
    });

    test('should handle case-insensitive material names', () => {
      const material1 = materialProps.getMaterial('PZT-5H');
      const material2 = materialProps.getMaterial('pzt-5h');
      const material3 = materialProps.getMaterial('Pzt-5H');
      
      expect(material1.name).toBe(material2.name);
      expect(material2.name).toBe(material3.name);
    });

    test('should throw error for unknown material', () => {
      expect(() => {
        materialProps.getMaterial('unknown-material');
      }).toThrow('Material \'unknown-material\' not found');
    });

    test('should return copy of material to prevent modification', () => {
      const material1 = materialProps.getMaterial('pzt-5h');
      const material2 = materialProps.getMaterial('pzt-5h');
      
      // Modify one copy
      material1.constants.d31 = 999;
      
      // Other copy should be unchanged
      expect(material2.constants.d31).not.toBe(999);
      expect(material2.constants.d31).toBeLessThan(0);
    });
  });

  describe('Material Properties Validation', () => {
    test('should have valid PZT-5H properties', () => {
      const pzt5h = materialProps.getMaterial('pzt-5h');
      
      expect(pzt5h.constants.d31).toBeLessThan(0);
      expect(pzt5h.constants.d33).toBeGreaterThan(0);
      expect(Math.abs(pzt5h.constants.d33)).toBeGreaterThan(Math.abs(pzt5h.constants.d31));
      expect(pzt5h.constants.elasticModulus).toBeGreaterThan(0);
      expect(pzt5h.constants.density).toBeGreaterThan(0);
      expect(pzt5h.constants.couplingFactor).toBeGreaterThan(0);
      expect(pzt5h.constants.couplingFactor).toBeLessThanOrEqual(1);
      expect(pzt5h.constants.yieldStrength).toBeGreaterThan(0);
    });

    test('should have valid PVDF properties', () => {
      const pvdf = materialProps.getMaterial('pvdf');
      
      expect(pvdf.type).toBe('polymer');
      expect(pvdf.constants.density).toBeLessThan(3000); // Polymers are lighter
      expect(pvdf.constants.maxStrain).toBeGreaterThan(0.01); // Polymers can handle large strains
      expect(pvdf.constants.elasticModulus).toBeLessThan(10e9); // Lower than ceramics
    });

    test('should have valid quartz properties', () => {
      const quartz = materialProps.getMaterial('quartz');
      
      expect(quartz.type).toBe('crystal');
      expect(quartz.constants.mechanicalQuality).toBeGreaterThan(1000); // High Q for crystals
      expect(Math.abs(quartz.constants.d31)).toBeLessThan(10e-12); // Low piezoelectric coefficients
      expect(quartz.constants.ultimateStrength).toBeGreaterThan(100e6); // High strength
    });

    test('should have consistent temperature coefficients', () => {
      const materials = ['pzt-5h', 'pzt-5a', 'pvdf', 'batio3'];
      
      materials.forEach(materialName => {
        const material = materialProps.getMaterial(materialName);
        const tempCoeffs = material.constants.temperatureCoefficients;
        
        expect(tempCoeffs.curieTemperature).toBeGreaterThan(0);
        expect(tempCoeffs.operatingRange.min).toBeLessThan(tempCoeffs.operatingRange.max);
        expect(tempCoeffs.operatingRange.max).toBeLessThan(tempCoeffs.curieTemperature);
      });
    });
  });

  describe('Material Filtering and Search', () => {
    test('should filter materials by type', () => {
      const ceramics = materialProps.getMaterialsByType('ceramic');
      const polymers = materialProps.getMaterialsByType('polymer');
      const crystals = materialProps.getMaterialsByType('crystal');
      
      expect(ceramics.length).toBeGreaterThan(0);
      expect(polymers.length).toBeGreaterThan(0);
      expect(crystals.length).toBeGreaterThan(0);
      
      ceramics.forEach(material => {
        expect(material.type).toBe('ceramic');
      });
      
      polymers.forEach(material => {
        expect(material.type).toBe('polymer');
      });
      
      crystals.forEach(material => {
        expect(material.type).toBe('crystal');
      });
    });

    test('should find materials for specific applications', () => {
      const energyHarvestingMaterials = materialProps.getMaterialsForApplication('energy harvesting');
      const sensorMaterials = materialProps.getMaterialsForApplication('sensors');
      
      expect(energyHarvestingMaterials.length).toBeGreaterThan(0);
      expect(sensorMaterials.length).toBeGreaterThan(0);
      
      energyHarvestingMaterials.forEach(material => {
        expect(material.applications.some(app => 
          app.toLowerCase().includes('energy harvesting')
        )).toBe(true);
      });
    });

    test('should handle case-insensitive application search', () => {
      const results1 = materialProps.getMaterialsForApplication('Energy Harvesting');
      const results2 = materialProps.getMaterialsForApplication('energy harvesting');
      const results3 = materialProps.getMaterialsForApplication('ENERGY HARVESTING');
      
      expect(results1.length).toBe(results2.length);
      expect(results2.length).toBe(results3.length);
    });
  });

  describe('Material Comparison', () => {
    test('should compare materials based on specific criteria', () => {
      const materials = ['pzt-5h', 'pzt-5a', 'pvdf'];
      const criteria = ['d31', 'couplingFactor', 'density'];
      
      const comparison = materialProps.compareMaterials(materials, criteria);
      
      expect(comparison).toHaveLength(3);
      expect(comparison[0].score).toBeGreaterThanOrEqual(comparison[1].score);
      expect(comparison[1].score).toBeGreaterThanOrEqual(comparison[2].score);
      
      comparison.forEach(result => {
        expect(result.material).toBeDefined();
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.properties).toBeDefined();
        expect(result.properties.d31).toBeDefined();
        expect(result.properties.couplingFactor).toBeDefined();
        expect(result.properties.density).toBeDefined();
      });
    });

    test('should rank materials correctly for piezoelectric performance', () => {
      const materials = ['pzt-5h', 'pvdf', 'quartz'];
      const criteria = ['d31', 'couplingFactor'];
      
      const comparison = materialProps.compareMaterials(materials, criteria);
      
      // PZT-5H should typically rank higher than PVDF and Quartz for piezoelectric performance
      const pztIndex = comparison.findIndex(r => r.material === 'pzt-5h');
      const pvdfIndex = comparison.findIndex(r => r.material === 'pvdf');
      const quartzIndex = comparison.findIndex(r => r.material === 'quartz');
      
      expect(pztIndex).toBeLessThan(pvdfIndex);
      expect(pztIndex).toBeLessThan(quartzIndex);
    });

    test('should handle single material comparison', () => {
      const comparison = materialProps.compareMaterials(['pzt-5h'], ['d31']);
      
      expect(comparison).toHaveLength(1);
      expect(comparison[0].material).toBe('pzt-5h');
      expect(comparison[0].properties.d31).toBeDefined();
    });
  });

  describe('Temperature Compensation', () => {
    test('should adjust properties for temperature', () => {
      const material = 'pzt-5h';
      const referenceTemp = 25;
      const testTemp = 50;
      
      const refProps = materialProps.getMaterial(material).constants;
      const adjustedProps = materialProps.getTemperatureAdjustedProperties(material, testTemp);
      
      expect(adjustedProps).toBeDefined();
      expect(adjustedProps.d31).not.toBe(refProps.d31);
      expect(adjustedProps.elasticModulus).not.toBe(refProps.elasticModulus);
      expect(adjustedProps.permittivity).not.toBe(refProps.permittivity);
    });

    test('should return original properties at reference temperature', () => {
      const material = 'pzt-5h';
      const referenceTemp = 25;
      
      const originalProps = materialProps.getMaterial(material).constants;
      const adjustedProps = materialProps.getTemperatureAdjustedProperties(material, referenceTemp);
      
      expect(Math.abs(adjustedProps.d31 - originalProps.d31)).toBeLessThan(1e-15);
      expect(Math.abs(adjustedProps.elasticModulus - originalProps.elasticModulus)).toBeLessThan(1e-3);
      expect(Math.abs(adjustedProps.permittivity - originalProps.permittivity)).toBeLessThan(1e-15);
    });

    test('should warn for temperatures outside operating range', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const material = 'pzt-5h';
      const pztProps = materialProps.getMaterial(material);
      const lowTemp = pztProps.constants.temperatureCoefficients.operatingRange.min - 10;
      const highTemp = pztProps.constants.temperatureCoefficients.operatingRange.max + 10;
      
      materialProps.getTemperatureAdjustedProperties(material, lowTemp);
      materialProps.getTemperatureAdjustedProperties(material, highTemp);
      
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('outside operating range')
      );
      
      consoleSpy.mockRestore();
    });

    test('should warn for temperatures above Curie temperature', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const material = 'pzt-5h';
      const pztProps = materialProps.getMaterial(material);
      const highTemp = pztProps.constants.temperatureCoefficients.curieTemperature + 10;
      
      materialProps.getTemperatureAdjustedProperties(material, highTemp);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('exceeds Curie temperature')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Cost Estimation', () => {
    test('should estimate material cost', () => {
      const volume = 1e-6; // 1 cm³ in m³
      const materials = ['pzt-5h', 'pvdf', 'pmn-pt'];
      
      materials.forEach(materialName => {
        const costEstimate = materialProps.estimateMaterialCost(materialName, volume);
        
        expect(costEstimate).toBeDefined();
        expect(costEstimate.costCategory).toBeDefined();
        expect(costEstimate.estimatedCostRange.min).toBeGreaterThan(0);
        expect(costEstimate.estimatedCostRange.max).toBeGreaterThan(costEstimate.estimatedCostRange.min);
        expect(costEstimate.currency).toBe('USD');
      });
    });

    test('should scale cost with volume', () => {
      const smallVolume = 1e-6; // 1 cm³
      const largeVolume = 10e-6; // 10 cm³
      
      const smallCost = materialProps.estimateMaterialCost('pzt-5h', smallVolume);
      const largeCost = materialProps.estimateMaterialCost('pzt-5h', largeVolume);
      
      expect(largeCost.estimatedCostRange.min).toBeGreaterThan(smallCost.estimatedCostRange.min);
      expect(largeCost.estimatedCostRange.max).toBeGreaterThan(smallCost.estimatedCostRange.max);
    });

    test('should reflect cost categories correctly', () => {
      const lowCostMaterial = materialProps.estimateMaterialCost('pvdf', 1e-6);
      const highCostMaterial = materialProps.estimateMaterialCost('pmn-pt', 1e-6);
      
      expect(lowCostMaterial.costCategory).toBe('low');
      expect(highCostMaterial.costCategory).toBe('high');
      expect(highCostMaterial.estimatedCostRange.min).toBeGreaterThan(lowCostMaterial.estimatedCostRange.max);
    });
  });

  describe('Material Recommendations', () => {
    test('should recommend materials based on requirements', () => {
      const requirements = {
        application: 'energy harvesting',
        temperatureRange: { min: -20, max: 80 },
        leadFree: true,
        costConstraint: 'medium' as const,
        powerDensityPriority: true
      };
      
      const recommendations = materialProps.getRecommendations(requirements);
      
      expect(recommendations.length).toBeGreaterThan(0);
      
      recommendations.forEach(material => {
        // Should be lead-free
        expect(material.name.toLowerCase()).not.toContain('pzt');
        expect(material.name.toLowerCase()).not.toContain('pmn');
        
        // Should be suitable for energy harvesting
        expect(material.applications.some(app => 
          app.toLowerCase().includes('energy harvesting')
        )).toBe(true);
        
        // Should meet temperature requirements
        const tempRange = material.constants.temperatureCoefficients.operatingRange;
        expect(tempRange.min).toBeLessThanOrEqual(-20);
        expect(tempRange.max).toBeGreaterThanOrEqual(80);
        
        // Should meet cost constraint
        expect(['low', 'medium'].includes(material.cost)).toBe(true);
      });
    });

    test('should handle flexibility requirements', () => {
      const flexibleRequirements = {
        application: 'energy harvesting',
        flexibilityRequired: true
      };
      
      const recommendations = materialProps.getRecommendations(flexibleRequirements);
      
      recommendations.forEach(material => {
        expect(material.type).toBe('polymer');
      });
    });

    test('should sort by power density when prioritized', () => {
      const requirements = {
        application: 'energy harvesting',
        powerDensityPriority: true
      };
      
      const recommendations = materialProps.getRecommendations(requirements);
      
      if (recommendations.length > 1) {
        for (let i = 0; i < recommendations.length - 1; i++) {
          const current = recommendations[i];
          const next = recommendations[i + 1];
          
          const currentPower = Math.abs(current.constants.d31) * current.constants.couplingFactor;
          const nextPower = Math.abs(next.constants.d31) * next.constants.couplingFactor;
          
          expect(currentPower).toBeGreaterThanOrEqual(nextPower);
        }
      }
    });

    test('should handle empty requirements', () => {
      const recommendations = materialProps.getRecommendations({
        application: 'nonexistent application'
      });
      
      expect(recommendations).toHaveLength(0);
    });
  });

  describe('Custom Materials', () => {
    test('should add custom material', () => {
      const customMaterial: PiezoelectricMaterial = {
        name: 'Custom-PZT',
        type: 'ceramic',
        constants: {
          d31: -200e-12,
          d33: 400e-12,
          g31: -10e-3,
          g33: 20e-3,
          elasticModulus: 70e9,
          poissonRatio: 0.3,
          shearModulus: 27e9,
          permittivity: 2000 * 8.854e-12,
          dielectricConstant: 2000,
          density: 7000,
          yieldStrength: 80e6,
          ultimateStrength: 120e6,
          maxStrain: 0.001,
          couplingFactor: 0.7,
          mechanicalQuality: 70,
          temperatureCoefficients: {
            d31: -0.0003,
            elasticModulus: -0.0002,
            permittivity: 0.002,
            curieTemperature: 300,
            operatingRange: { min: -40, max: 120 }
          }
        },
        applications: ['custom energy harvesting'],
        advantages: ['custom properties'],
        limitations: ['experimental'],
        cost: 'medium',
        availability: 'research'
      };
      
      materialProps.addCustomMaterial(customMaterial);
      
      const retrievedMaterial = materialProps.getMaterial('custom-pzt');
      expect(retrievedMaterial.name).toBe('Custom-PZT');
      expect(retrievedMaterial.constants.d31).toBe(-200e-12);
      
      const availableMaterials = materialProps.getAvailableMaterials();
      expect(availableMaterials).toContain('custom-pzt');
    });

    test('should overwrite existing material when adding custom', () => {
      const originalPzt = materialProps.getMaterial('pzt-5h');
      
      const customPzt: PiezoelectricMaterial = {
        ...originalPzt,
        name: 'PZT-5H',
        constants: {
          ...originalPzt.constants,
          d31: -999e-12 // Different value
        }
      };
      
      materialProps.addCustomMaterial(customPzt);
      
      const modifiedPzt = materialProps.getMaterial('pzt-5h');
      expect(modifiedPzt.constants.d31).toBe(-999e-12);
    });
  });

  describe('Data Integrity', () => {
    test('should have consistent material data', () => {
      const availableMaterials = materialProps.getAvailableMaterials();
      
      availableMaterials.forEach(materialName => {
        const material = materialProps.getMaterial(materialName);
        
        // Basic property checks
        expect(material.name).toBeDefined();
        expect(material.type).toBeDefined();
        expect(['ceramic', 'polymer', 'crystal', 'composite'].includes(material.type)).toBe(true);
        
        // Constants validation
        expect(material.constants.density).toBeGreaterThan(0);
        expect(material.constants.elasticModulus).toBeGreaterThan(0);
        expect(material.constants.yieldStrength).toBeGreaterThan(0);
        expect(material.constants.couplingFactor).toBeGreaterThan(0);
        expect(material.constants.couplingFactor).toBeLessThanOrEqual(1);
        expect(material.constants.poissonRatio).toBeGreaterThan(0);
        expect(material.constants.poissonRatio).toBeLessThan(0.5);
        
        // Temperature coefficients validation
        expect(material.constants.temperatureCoefficients.curieTemperature).toBeGreaterThan(0);
        expect(material.constants.temperatureCoefficients.operatingRange.min)
          .toBeLessThan(material.constants.temperatureCoefficients.operatingRange.max);
        
        // Arrays should be defined
        expect(Array.isArray(material.applications)).toBe(true);
        expect(Array.isArray(material.advantages)).toBe(true);
        expect(Array.isArray(material.limitations)).toBe(true);
        
        // Cost and availability should be valid
        expect(['low', 'medium', 'high'].includes(material.cost)).toBe(true);
        expect(['common', 'specialized', 'research'].includes(material.availability)).toBe(true);
      });
    });

    test('should have physically reasonable property relationships', () => {
      const availableMaterials = materialProps.getAvailableMaterials();
      
      availableMaterials.forEach(materialName => {
        const material = materialProps.getMaterial(materialName);
        const constants = material.constants;
        
        // Piezoelectric constants should have reasonable magnitudes
        expect(Math.abs(constants.d31)).toBeLessThan(2000e-12);
        expect(Math.abs(constants.d33)).toBeLessThan(3000e-12);
        
        // For most materials, |d33| > |d31|
        if (material.type !== 'polymer') {
          expect(Math.abs(constants.d33)).toBeGreaterThan(Math.abs(constants.d31));
        }
        
        // Elastic modulus should be reasonable for material type
        if (material.type === 'polymer') {
          expect(constants.elasticModulus).toBeLessThan(20e9);
        } else {
          expect(constants.elasticModulus).toBeGreaterThan(20e9);
        }
        
        // Density should be reasonable for material type
        if (material.type === 'polymer') {
          expect(constants.density).toBeLessThan(3000);
        } else {
          expect(constants.density).toBeGreaterThan(2000);
        }
      });
    });
  });
});