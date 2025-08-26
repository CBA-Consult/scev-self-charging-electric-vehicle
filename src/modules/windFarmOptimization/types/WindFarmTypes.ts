/**
 * Type definitions for wind farm optimization
 */

export interface WindTurbineSpecification {
  id: string;
  model: string;
  ratedPower: number; // MW
  rotorDiameter: number; // meters
  hubHeight: number; // meters
  cutInSpeed: number; // m/s
  cutOutSpeed: number; // m/s
  ratedWindSpeed: number; // m/s
  powerCurve: PowerCurvePoint[];
  thrustCurve: ThrustCurvePoint[];
  cost: number; // USD
  maintenanceCost: number; // USD/year
  lifespan: number; // years
}

export interface PowerCurvePoint {
  windSpeed: number; // m/s
  power: number; // MW
}

export interface ThrustCurvePoint {
  windSpeed: number; // m/s
  thrustCoefficient: number;
}

export interface TurbinePosition {
  id: string;
  x: number; // meters from origin
  y: number; // meters from origin
  elevation: number; // meters above sea level
  turbineSpec: WindTurbineSpecification;
  orientation?: number; // degrees (for VAWT or directional turbines)
}

export interface WindFarmSite {
  id: string;
  name: string;
  boundaries: GeographicBoundary[];
  terrain: TerrainData;
  windResource: WindResourceData;
  environmentalConstraints: EnvironmentalConstraint[];
  gridConnection: GridConnectionPoint;
  accessRoads: AccessRoad[];
}

export interface GeographicBoundary {
  latitude: number;
  longitude: number;
}

export interface TerrainData {
  elevationGrid: number[][]; // elevation in meters
  gridResolution: number; // meters per grid cell
  roughnessMap: number[][]; // surface roughness coefficient
  slopeMap: number[][]; // terrain slope in degrees
  aspectMap: number[][]; // terrain aspect in degrees
  landUseMap: LandUseType[][];
}

export interface LandUseType {
  type: 'forest' | 'agricultural' | 'urban' | 'water' | 'grassland' | 'rocky' | 'wetland';
  restrictionLevel: 'prohibited' | 'restricted' | 'allowed' | 'preferred';
  environmentalSensitivity: number; // 0-1 scale
}

export interface WindResourceData {
  windRose: WindRoseData[];
  meanWindSpeed: number; // m/s at reference height
  referenceHeight: number; // meters
  windShearExponent: number;
  turbulenceIntensity: number;
  airDensity: number; // kg/m³
  seasonalVariation: SeasonalWindData[];
  extremeWindEvents: ExtremeWindEvent[];
}

export interface WindRoseData {
  direction: number; // degrees (0-360)
  frequency: number; // percentage of time
  meanSpeed: number; // m/s
  weibullA: number; // scale parameter
  weibullK: number; // shape parameter
}

export interface SeasonalWindData {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  meanWindSpeed: number;
  dominantDirection: number;
  turbulenceIntensity: number;
}

export interface ExtremeWindEvent {
  type: 'hurricane' | 'tornado' | 'thunderstorm' | 'ice_storm';
  probability: number; // annual probability
  maxWindSpeed: number; // m/s
  duration: number; // hours
}

export interface EnvironmentalConstraint {
  type: 'wildlife_corridor' | 'bird_migration' | 'noise_sensitive' | 'visual_impact' | 'archaeological' | 'wetland';
  geometry: ConstraintGeometry;
  severity: 'low' | 'medium' | 'high' | 'critical';
  seasonalRestrictions?: SeasonalRestriction[];
}

export interface ConstraintGeometry {
  type: 'circle' | 'polygon' | 'buffer';
  coordinates: number[][];
  radius?: number; // for circle type
}

export interface SeasonalRestriction {
  startMonth: number; // 1-12
  endMonth: number; // 1-12
  restrictionType: 'no_construction' | 'no_operation' | 'reduced_operation';
}

export interface GridConnectionPoint {
  latitude: number;
  longitude: number;
  voltage: number; // kV
  capacity: number; // MW
  connectionCost: number; // USD/MW
  transmissionDistance: number; // km
}

export interface AccessRoad {
  waypoints: GeographicBoundary[];
  width: number; // meters
  constructionCost: number; // USD/km
  maintenanceCost: number; // USD/km/year
}

export interface WindFarmLayout {
  id: string;
  name: string;
  site: WindFarmSite;
  turbines: TurbinePosition[];
  totalCapacity: number; // MW
  energyProduction: EnergyProductionData;
  economicMetrics: EconomicMetrics;
  environmentalImpact: EnvironmentalImpactMetrics;
  layoutType: LayoutType;
}

export interface EnergyProductionData {
  annualEnergyProduction: number; // MWh/year
  capacityFactor: number; // percentage
  wakeEffectLoss: number; // percentage
  availabilityFactor: number; // percentage
  monthlyProduction: number[]; // MWh for each month
  hourlyProfile: number[]; // average hourly production profile
}

export interface EconomicMetrics {
  capitalCost: number; // USD
  operationalCost: number; // USD/year
  levelizedCostOfEnergy: number; // USD/MWh
  netPresentValue: number; // USD
  internalRateOfReturn: number; // percentage
  paybackPeriod: number; // years
  profitabilityIndex: number;
}

export interface EnvironmentalImpactMetrics {
  noiseImpact: NoiseImpactData;
  visualImpact: VisualImpactData;
  wildlifeImpact: WildlifeImpactData;
  soilImpact: SoilImpactData;
  carbonFootprint: CarbonFootprintData;
  overallImpactScore: number; // 0-100 scale
}

export interface NoiseImpactData {
  maxNoiseLevel: number; // dB(A)
  affectedResidences: number;
  noiseContourMap: number[][]; // noise levels in dB(A)
}

export interface VisualImpactData {
  visibilityIndex: number; // 0-1 scale
  affectedViewpoints: number;
  visualImpactZones: VisualImpactZone[];
}

export interface VisualImpactZone {
  distance: number; // meters from turbines
  impactLevel: 'low' | 'medium' | 'high';
  affectedArea: number; // square kilometers
}

export interface WildlifeImpactData {
  birdCollisionRisk: number; // collisions/year
  batCollisionRisk: number; // collisions/year
  habitatFragmentation: number; // hectares affected
  migrationInterference: number; // 0-1 scale
}

export interface SoilImpactData {
  erosionRisk: number; // 0-1 scale
  compactionArea: number; // hectares
  drainageImpact: number; // 0-1 scale
}

export interface CarbonFootprintData {
  constructionEmissions: number; // tonnes CO2
  operationalEmissions: number; // tonnes CO2/year
  decommissioningEmissions: number; // tonnes CO2
  carbonPaybackTime: number; // years
}

export type LayoutType = 
  | 'grid_regular'
  | 'grid_irregular'
  | 'cluster_based'
  | 'wind_aligned'
  | 'terrain_following'
  | 'biomimetic'
  | 'fractal'
  | 'genetic_optimized'
  | 'swarm_optimized'
  | 'hybrid_innovative';