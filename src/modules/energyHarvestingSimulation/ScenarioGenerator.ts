/**
 * Scenario Generator
 * 
 * Generates realistic driving scenarios for testing energy harvesting system
 * performance under various conditions.
 */

import { DrivingConditions, WeatherConditions, SimulationInputs } from './EnergyHarvestingSimulator';

export interface DrivingScenario {
  name: string;
  description: string;
  duration: number;                 // seconds
  timeSteps: DrivingConditions[];
  weatherConditions: WeatherConditions;
  expectedChallenges: string[];
  energyHarvestingOpportunities: string[];
}

export interface ScenarioParameters {
  scenarioType: 'city' | 'highway' | 'mountain' | 'sport' | 'mixed' | 'custom';
  duration: number;                 // seconds
  weatherType: 'clear' | 'rain' | 'snow' | 'hot' | 'cold' | 'variable';
  trafficDensity: 'light' | 'medium' | 'heavy' | 'variable';
  roadConditions: 'excellent' | 'good' | 'poor' | 'variable';
  customParameters?: {
    averageSpeed: number;           // km/h
    speedVariation: number;         // 0-1
    stopFrequency: number;          // stops per km
    accelerationProfile: 'gentle' | 'moderate' | 'aggressive';
    brakingProfile: 'gentle' | 'moderate' | 'aggressive' | 'regenerative_heavy';
    elevationChanges: boolean;
    maxGradient: number;            // %
  };
}

export interface ScenarioResults {
  scenario: DrivingScenario;
  simulationResults: any[];
  performanceSummary: {
    averagePowerGeneration: number;
    totalEnergyHarvested: number;
    peakPowerOutput: number;
    averageEfficiency: number;
    energyRecoveryRatio: number;
  };
  insights: string[];
  recommendations: string[];
}

export class ScenarioGenerator {
  private predefinedScenarios: Map<string, DrivingScenario> = new Map();
  private weatherProfiles: Map<string, WeatherConditions> = new Map();
  
  constructor() {
    this.initializePredefinedScenarios();
    this.initializeWeatherProfiles();
  }
  
  private initializePredefinedScenarios(): void {
    // City driving scenario
    this.predefinedScenarios.set('city', {
      name: 'Urban City Driving',
      description: 'Stop-and-go traffic with frequent acceleration and braking',
      duration: 3600, // 1 hour
      timeSteps: [],
      weatherConditions: this.weatherProfiles.get('clear')!,
      expectedChallenges: [
        'Frequent stops and starts',
        'Variable traffic conditions',
        'Limited high-speed regenerative opportunities'
      ],
      energyHarvestingOpportunities: [
        'High regenerative braking potential',
        'Suspension energy from road irregularities',
        'Piezoelectric harvesting from vibrations'
      ]
    });
    
    // Highway driving scenario
    this.predefinedScenarios.set('highway', {
      name: 'Highway Cruising',
      description: 'Steady high-speed driving with minimal stops',
      duration: 7200, // 2 hours
      timeSteps: [],
      weatherConditions: this.weatherProfiles.get('clear')!,
      expectedChallenges: [
        'Limited regenerative braking opportunities',
        'Steady-state operation',
        'Wind resistance effects'
      ],
      energyHarvestingOpportunities: [
        'Aerodynamic energy harvesting',
        'Continuous electromagnetic generation',
        'Thermal energy recovery'
      ]
    });
    
    // Mountain driving scenario
    this.predefinedScenarios.set('mountain', {
      name: 'Mountain Terrain',
      description: 'Hilly terrain with significant elevation changes',
      duration: 5400, // 1.5 hours
      timeSteps: [],
      weatherConditions: this.weatherProfiles.get('clear')!,
      expectedChallenges: [
        'Steep gradients',
        'Variable power demands',
        'Temperature variations'
      ],
      energyHarvestingOpportunities: [
        'Gravitational energy recovery on descents',
        'Enhanced regenerative braking',
        'Increased suspension activity'
      ]
    });
    
    // Sport driving scenario
    this.predefinedScenarios.set('sport', {
      name: 'Performance Driving',
      description: 'Aggressive driving with rapid acceleration and braking',
      duration: 1800, // 30 minutes
      timeSteps: [],
      weatherConditions: this.weatherProfiles.get('clear')!,
      expectedChallenges: [
        'High power demands',
        'Thermal management',
        'System stress'
      ],
      energyHarvestingOpportunities: [
        'Maximum regenerative braking',
        'High-frequency vibration harvesting',
        'Dynamic suspension energy'
      ]
    });
  }
  
  private initializeWeatherProfiles(): void {
    this.weatherProfiles.set('clear', {
      temperature: 20,
      humidity: 50,
      windSpeed: 5,
      roadCondition: 'dry',
      visibility: 'excellent'
    });
    
    this.weatherProfiles.set('rain', {
      temperature: 15,
      humidity: 85,
      windSpeed: 12,
      roadCondition: 'wet',
      visibility: 'reduced'
    });
    
    this.weatherProfiles.set('snow', {
      temperature: -5,
      humidity: 90,
      windSpeed: 8,
      roadCondition: 'snow',
      visibility: 'poor'
    });
    
    this.weatherProfiles.set('hot', {
      temperature: 35,
      humidity: 30,
      windSpeed: 3,
      roadCondition: 'dry',
      visibility: 'good'
    });
    
    this.weatherProfiles.set('cold', {
      temperature: -15,
      humidity: 70,
      windSpeed: 15,
      roadCondition: 'ice',
      visibility: 'reduced'
    });
  }
  
  /**
   * Generate a driving scenario based on parameters
   */
  public generateScenario(parameters: ScenarioParameters): DrivingScenario {
    if (parameters.scenarioType !== 'custom' && this.predefinedScenarios.has(parameters.scenarioType)) {
      const baseScenario = this.predefinedScenarios.get(parameters.scenarioType)!;
      const scenario = { ...baseScenario };
      
      // Apply weather conditions
      scenario.weatherConditions = this.getWeatherConditions(parameters.weatherType);
      
      // Generate time steps
      scenario.timeSteps = this.generateTimeSteps(parameters);
      scenario.duration = parameters.duration;
      
      return scenario;
    } else {
      return this.generateCustomScenario(parameters);
    }
  }
  
  /**
   * Generate multiple scenarios for comprehensive testing
   */
  public generateTestSuite(): DrivingScenario[] {
    const scenarios: DrivingScenario[] = [];
    
    // Standard scenarios with different weather conditions
    const scenarioTypes = ['city', 'highway', 'mountain', 'sport'];
    const weatherTypes = ['clear', 'rain', 'snow', 'hot', 'cold'];
    
    scenarioTypes.forEach(scenarioType => {
      weatherTypes.forEach(weatherType => {
        const parameters: ScenarioParameters = {
          scenarioType: scenarioType as any,
          duration: 3600,
          weatherType: weatherType as any,
          trafficDensity: 'medium',
          roadConditions: 'good'
        };
        
        scenarios.push(this.generateScenario(parameters));
      });
    });
    
    // Add some mixed scenarios
    scenarios.push(this.generateMixedScenario());
    scenarios.push(this.generateExtremeWeatherScenario());
    scenarios.push(this.generateEnergyOptimizedScenario());
    
    return scenarios;
  }
  
  /**
   * Generate realistic driving pattern for given scenario type
   */
  private generateTimeSteps(parameters: ScenarioParameters): DrivingConditions[] {
    const timeSteps: DrivingConditions[] = [];
    const timeStep = 1; // 1 second intervals
    const totalSteps = parameters.duration / timeStep;
    
    let currentSpeed = 0;
    let currentAcceleration = 0;
    
    for (let i = 0; i < totalSteps; i++) {
      const time = i * timeStep;
      
      // Generate speed and acceleration based on scenario type
      const { speed, acceleration } = this.generateSpeedProfile(parameters, time, currentSpeed);
      currentSpeed = speed;
      currentAcceleration = acceleration;
      
      // Generate other driving parameters
      const brakingIntensity = Math.max(0, -acceleration / 5);
      const steeringAngle = this.generateSteeringAngle(parameters, time);
      const roadGradient = this.generateRoadGradient(parameters, time);
      const roadSurface = this.getRoadSurface(parameters);
      const trafficDensity = this.getTrafficDensity(parameters, time);
      
      timeSteps.push({
        speed,
        acceleration,
        brakingIntensity,
        steeringAngle,
        roadGradient,
        roadSurface,
        trafficDensity
      });
    }
    
    return timeSteps;
  }
  
  private generateSpeedProfile(parameters: ScenarioParameters, time: number, currentSpeed: number): { speed: number; acceleration: number } {
    let targetSpeed = 0;
    let maxAcceleration = 3; // m/s²
    let maxDeceleration = -5; // m/s²
    
    switch (parameters.scenarioType) {
      case 'city':
        targetSpeed = this.generateCitySpeedProfile(time);
        maxAcceleration = 2;
        maxDeceleration = -4;
        break;
        
      case 'highway':
        targetSpeed = this.generateHighwaySpeedProfile(time);
        maxAcceleration = 1.5;
        maxDeceleration = -2;
        break;
        
      case 'mountain':
        targetSpeed = this.generateMountainSpeedProfile(time);
        maxAcceleration = 2.5;
        maxDeceleration = -6;
        break;
        
      case 'sport':
        targetSpeed = this.generateSportSpeedProfile(time);
        maxAcceleration = 4;
        maxDeceleration = -8;
        break;
        
      case 'custom':
        targetSpeed = this.generateCustomSpeedProfile(parameters, time);
        break;
    }
    
    // Calculate required acceleration to reach target speed
    const speedDifference = targetSpeed - currentSpeed;
    let acceleration = Math.sign(speedDifference) * Math.min(Math.abs(speedDifference), 2);
    
    // Apply acceleration limits
    acceleration = Math.max(maxDeceleration, Math.min(maxAcceleration, acceleration));
    
    // Calculate new speed
    const newSpeed = Math.max(0, currentSpeed + acceleration);
    
    return { speed: newSpeed, acceleration };
  }
  
  private generateCitySpeedProfile(time: number): number {
    // City driving: 0-60 km/h with frequent stops
    const cycleTime = 120; // 2-minute cycles
    const phase = (time % cycleTime) / cycleTime;
    
    if (phase < 0.2) {
      return 0; // Stopped at traffic light
    } else if (phase < 0.4) {
      return 30 * (phase - 0.2) / 0.2; // Accelerating
    } else if (phase < 0.7) {
      return 30 + 20 * Math.sin((phase - 0.4) / 0.3 * Math.PI); // Variable speed
    } else {
      return 50 * (1 - (phase - 0.7) / 0.3); // Decelerating
    }
  }
  
  private generateHighwaySpeedProfile(time: number): number {
    // Highway driving: steady 100-120 km/h
    const baseSpeed = 110;
    const variation = 10 * Math.sin(time / 300); // Gentle speed variations
    return Math.max(90, Math.min(130, baseSpeed + variation));
  }
  
  private generateMountainSpeedProfile(time: number): number {
    // Mountain driving: variable speed based on terrain
    const baseSpeed = 60;
    const hillCycle = 600; // 10-minute hill cycles
    const phase = (time % hillCycle) / hillCycle;
    
    if (phase < 0.3) {
      return baseSpeed * (1 - 0.3 * phase / 0.3); // Climbing (slower)
    } else if (phase < 0.7) {
      return baseSpeed * 0.7; // Steady climb
    } else {
      return baseSpeed * (0.7 + 0.5 * (phase - 0.7) / 0.3); // Descending (faster)
    }
  }
  
  private generateSportSpeedProfile(time: number): number {
    // Sport driving: aggressive acceleration and braking
    const cycleTime = 60; // 1-minute cycles
    const phase = (time % cycleTime) / cycleTime;
    
    if (phase < 0.3) {
      return 120 * phase / 0.3; // Rapid acceleration
    } else if (phase < 0.6) {
      return 120; // High speed
    } else {
      return 120 * (1 - (phase - 0.6) / 0.4); // Rapid deceleration
    }
  }
  
  private generateCustomSpeedProfile(parameters: ScenarioParameters, time: number): number {
    const custom = parameters.customParameters;
    if (!custom) return 50;
    
    const baseSpeed = custom.averageSpeed;
    const variation = baseSpeed * custom.speedVariation * Math.sin(time / 60);
    
    return Math.max(0, baseSpeed + variation);
  }
  
  private generateSteeringAngle(parameters: ScenarioParameters, time: number): number {
    // Generate realistic steering patterns
    switch (parameters.scenarioType) {
      case 'city':
        return 15 * Math.sin(time / 30); // Frequent turns
      case 'highway':
        return 5 * Math.sin(time / 120); // Gentle lane changes
      case 'mountain':
        return 25 * Math.sin(time / 45); // Winding roads
      case 'sport':
        return 30 * Math.sin(time / 20); // Aggressive cornering
      default:
        return 10 * Math.sin(time / 60);
    }
  }
  
  private generateRoadGradient(parameters: ScenarioParameters, time: number): number {
    switch (parameters.scenarioType) {
      case 'mountain':
        const hillCycle = 600; // 10-minute cycles
        const phase = (time % hillCycle) / hillCycle;
        if (phase < 0.5) {
          return 8 * Math.sin(phase * Math.PI); // Uphill
        } else {
          return -6 * Math.sin((phase - 0.5) * Math.PI); // Downhill
        }
      case 'city':
        return 2 * Math.sin(time / 200); // Gentle hills
      default:
        return 0; // Flat
    }
  }
  
  private getRoadSurface(parameters: ScenarioParameters): 'asphalt' | 'concrete' | 'gravel' | 'wet' | 'snow' | 'ice' {
    const weather = parameters.weatherType;
    
    if (weather === 'rain') return 'wet';
    if (weather === 'snow') return 'snow';
    if (weather === 'cold') return 'ice';
    
    // Default road surfaces by scenario
    switch (parameters.scenarioType) {
      case 'highway':
        return 'concrete';
      case 'mountain':
        return Math.random() < 0.3 ? 'gravel' : 'asphalt';
      default:
        return 'asphalt';
    }
  }
  
  private getTrafficDensity(parameters: ScenarioParameters, time: number): 'light' | 'medium' | 'heavy' {
    if (parameters.trafficDensity !== 'variable') {
      return parameters.trafficDensity;
    }
    
    // Variable traffic based on time of day (assuming time is in seconds from start)
    const hourOfDay = (time / 3600) % 24;
    
    if (hourOfDay >= 7 && hourOfDay <= 9 || hourOfDay >= 17 && hourOfDay <= 19) {
      return 'heavy'; // Rush hours
    } else if (hourOfDay >= 10 && hourOfDay <= 16) {
      return 'medium'; // Daytime
    } else {
      return 'light'; // Night/early morning
    }
  }
  
  private getWeatherConditions(weatherType: string): WeatherConditions {
    if (weatherType === 'variable') {
      // Random weather selection
      const types = ['clear', 'rain', 'snow', 'hot', 'cold'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      return this.weatherProfiles.get(randomType)!;
    }
    
    return this.weatherProfiles.get(weatherType) || this.weatherProfiles.get('clear')!;
  }
  
  private generateCustomScenario(parameters: ScenarioParameters): DrivingScenario {
    return {
      name: 'Custom Scenario',
      description: 'User-defined driving scenario',
      duration: parameters.duration,
      timeSteps: this.generateTimeSteps(parameters),
      weatherConditions: this.getWeatherConditions(parameters.weatherType),
      expectedChallenges: ['Custom driving conditions'],
      energyHarvestingOpportunities: ['Scenario-specific opportunities']
    };
  }
  
  private generateMixedScenario(): DrivingScenario {
    return {
      name: 'Mixed Driving Conditions',
      description: 'Combination of city, highway, and mountain driving',
      duration: 7200, // 2 hours
      timeSteps: this.generateMixedTimeSteps(),
      weatherConditions: this.weatherProfiles.get('clear')!,
      expectedChallenges: [
        'Varying driving conditions',
        'Multiple energy harvesting modes',
        'System adaptability requirements'
      ],
      energyHarvestingOpportunities: [
        'Diverse energy sources',
        'Adaptive system optimization',
        'Multi-modal energy recovery'
      ]
    };
  }
  
  private generateExtremeWeatherScenario(): DrivingScenario {
    return {
      name: 'Extreme Weather Conditions',
      description: 'Testing system performance in harsh weather',
      duration: 3600,
      timeSteps: this.generateTimeSteps({
        scenarioType: 'city',
        duration: 3600,
        weatherType: 'snow',
        trafficDensity: 'heavy',
        roadConditions: 'poor'
      }),
      weatherConditions: this.weatherProfiles.get('snow')!,
      expectedChallenges: [
        'Reduced traction',
        'Temperature effects on components',
        'Visibility limitations'
      ],
      energyHarvestingOpportunities: [
        'Enhanced suspension activity',
        'Increased braking events',
        'Temperature differential harvesting'
      ]
    };
  }
  
  private generateEnergyOptimizedScenario(): DrivingScenario {
    return {
      name: 'Energy Harvesting Optimized',
      description: 'Driving pattern optimized for maximum energy recovery',
      duration: 3600,
      timeSteps: this.generateOptimizedTimeSteps(),
      weatherConditions: this.weatherProfiles.get('clear')!,
      expectedChallenges: [
        'Balancing performance and efficiency',
        'Optimal regenerative braking',
        'System coordination'
      ],
      energyHarvestingOpportunities: [
        'Maximum regenerative potential',
        'Optimized suspension energy',
        'Coordinated multi-source harvesting'
      ]
    };
  }
  
  private generateMixedTimeSteps(): DrivingConditions[] {
    const timeSteps: DrivingConditions[] = [];
    const totalDuration = 7200; // 2 hours
    
    // 30 minutes city driving
    const citySteps = this.generateTimeSteps({
      scenarioType: 'city',
      duration: 1800,
      weatherType: 'clear',
      trafficDensity: 'medium',
      roadConditions: 'good'
    });
    
    // 1 hour highway driving
    const highwaySteps = this.generateTimeSteps({
      scenarioType: 'highway',
      duration: 3600,
      weatherType: 'clear',
      trafficDensity: 'light',
      roadConditions: 'excellent'
    });
    
    // 30 minutes mountain driving
    const mountainSteps = this.generateTimeSteps({
      scenarioType: 'mountain',
      duration: 1800,
      weatherType: 'clear',
      trafficDensity: 'light',
      roadConditions: 'good'
    });
    
    timeSteps.push(...citySteps, ...highwaySteps, ...mountainSteps);
    return timeSteps;
  }
  
  private generateOptimizedTimeSteps(): DrivingConditions[] {
    const timeSteps: DrivingConditions[] = [];
    const timeStep = 1;
    const totalSteps = 3600;
    
    for (let i = 0; i < totalSteps; i++) {
      const time = i * timeStep;
      
      // Optimized pattern: moderate acceleration followed by regenerative braking
      const cycleTime = 60; // 1-minute cycles
      const phase = (time % cycleTime) / cycleTime;
      
      let speed, acceleration;
      if (phase < 0.4) {
        // Acceleration phase
        speed = 80 * phase / 0.4;
        acceleration = 2;
      } else if (phase < 0.6) {
        // Cruise phase
        speed = 80;
        acceleration = 0;
      } else {
        // Regenerative braking phase
        speed = 80 * (1 - (phase - 0.6) / 0.4);
        acceleration = -2;
      }
      
      timeSteps.push({
        speed,
        acceleration,
        brakingIntensity: Math.max(0, -acceleration / 5),
        steeringAngle: 5 * Math.sin(time / 30),
        roadGradient: 2 * Math.sin(time / 300),
        roadSurface: 'asphalt',
        trafficDensity: 'medium'
      });
    }
    
    return timeSteps;
  }
  
  /**
   * Analyze scenario for energy harvesting potential
   */
  public analyzeScenarioEnergyPotential(scenario: DrivingScenario): {
    regenerativeBrakingPotential: number;
    suspensionEnergyPotential: number;
    piezoelectricPotential: number;
    totalEnergyPotential: number;
    recommendations: string[];
  } {
    let brakingEvents = 0;
    let suspensionActivity = 0;
    let vibrationLevel = 0;
    
    scenario.timeSteps.forEach(step => {
      if (step.acceleration < -0.5) brakingEvents++;
      if (Math.abs(step.steeringAngle) > 10 || Math.abs(step.roadGradient) > 2) suspensionActivity++;
      if (step.speed > 40) vibrationLevel++;
    });
    
    const regenerativeBrakingPotential = (brakingEvents / scenario.timeSteps.length) * 100;
    const suspensionEnergyPotential = (suspensionActivity / scenario.timeSteps.length) * 100;
    const piezoelectricPotential = (vibrationLevel / scenario.timeSteps.length) * 100;
    const totalEnergyPotential = (regenerativeBrakingPotential + suspensionEnergyPotential + piezoelectricPotential) / 3;
    
    const recommendations: string[] = [];
    
    if (regenerativeBrakingPotential > 50) {
      recommendations.push('High regenerative braking potential - optimize braking control strategy');
    }
    
    if (suspensionEnergyPotential > 40) {
      recommendations.push('Significant suspension energy available - enhance electromagnetic dampers');
    }
    
    if (piezoelectricPotential > 60) {
      recommendations.push('Good vibration energy potential - optimize piezoelectric harvester placement');
    }
    
    return {
      regenerativeBrakingPotential,
      suspensionEnergyPotential,
      piezoelectricPotential,
      totalEnergyPotential,
      recommendations
    };
  }
}