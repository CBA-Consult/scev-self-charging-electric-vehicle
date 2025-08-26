/**
 * Environmental impact assessment type definitions
 */

export interface EnvironmentalAssessmentParameters {
  // Noise assessment
  noise: {
    backgroundNoise: number; // dB(A)
    receptorLocations: NoiseReceptor[];
    noiseStandards: NoiseStandard[];
    meteorologicalConditions: MeteorologicalCondition[];
  };
  
  // Visual impact assessment
  visual: {
    viewpoints: Viewpoint[];
    landscapeCharacter: LandscapeCharacter;
    visualSensitivity: VisualSensitivityMap;
    seasonalVariations: SeasonalVisualFactor[];
  };
  
  // Wildlife assessment
  wildlife: {
    species: WildlifeSpecies[];
    migrationRoutes: MigrationRoute[];
    breedingAreas: BreedingArea[];
    criticalHabitats: CriticalHabitat[];
    seasonalBehavior: SeasonalWildlifeBehavior[];
  };
  
  // Ecological assessment
  ecology: {
    ecosystems: EcosystemType[];
    biodiversityIndices: BiodiversityIndex[];
    connectivityCorridors: ConnectivityCorridor[];
    protectedAreas: ProtectedArea[];
  };
  
  // Soil and hydrology
  soilHydrology: {
    soilTypes: SoilType[];
    drainagePatterns: DrainagePattern[];
    waterBodies: WaterBody[];
    floodZones: FloodZone[];
    erosionSusceptibility: ErosionSusceptibilityMap;
  };
}

export interface NoiseReceptor {
  id: string;
  type: 'residential' | 'commercial' | 'recreational' | 'institutional';
  location: GeographicCoordinate;
  sensitivity: 'low' | 'medium' | 'high';
  occupancyPattern: OccupancyPattern;
}

export interface GeographicCoordinate {
  latitude: number;
  longitude: number;
  elevation: number;
}

export interface OccupancyPattern {
  dayTime: boolean; // 7am-7pm
  eveningTime: boolean; // 7pm-10pm
  nightTime: boolean; // 10pm-7am
  weekends: boolean;
}

export interface NoiseStandard {
  jurisdiction: string;
  receptorType: string;
  dayTimeLimit: number; // dB(A)
  eveningLimit: number; // dB(A)
  nightTimeLimit: number; // dB(A)
  measurementMethod: string;
}

export interface MeteorologicalCondition {
  windSpeed: number; // m/s
  windDirection: number; // degrees
  temperature: number; // Celsius
  humidity: number; // percentage
  atmosphericStability: 'stable' | 'neutral' | 'unstable';
  frequency: number; // percentage of time
}

export interface Viewpoint {
  id: string;
  name: string;
  location: GeographicCoordinate;
  type: 'residential' | 'recreational' | 'transportation' | 'cultural' | 'scenic';
  importance: 'low' | 'medium' | 'high' | 'critical';
  viewingDistance: number; // meters
  viewingAngle: number; // degrees
  seasonalUsage: SeasonalUsage[];
}

export interface SeasonalUsage {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  usageLevel: 'low' | 'medium' | 'high';
  primaryActivities: string[];
}

export interface LandscapeCharacter {
  type: 'agricultural' | 'forested' | 'coastal' | 'mountainous' | 'urban' | 'industrial';
  scale: 'intimate' | 'small' | 'medium' | 'large' | 'vast';
  complexity: 'simple' | 'moderate' | 'complex';
  naturalness: 'artificial' | 'modified' | 'semi_natural' | 'natural';
  rarity: 'common' | 'uncommon' | 'rare' | 'unique';
}

export interface VisualSensitivityMap {
  gridResolution: number; // meters
  sensitivityGrid: number[][]; // 0-1 scale
  factors: VisualSensitivityFactor[];
}

export interface VisualSensitivityFactor {
  type: 'slope' | 'elevation' | 'land_use' | 'proximity_to_settlements' | 'scenic_quality';
  weight: number;
  influence: 'positive' | 'negative';
}

export interface SeasonalVisualFactor {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  vegetationScreening: number; // 0-1 scale
  atmosphericClarity: number; // 0-1 scale
  lightingConditions: LightingCondition[];
}

export interface LightingCondition {
  timeOfDay: 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'night';
  visibility: number; // 0-1 scale
  contrast: number; // 0-1 scale
}

export interface WildlifeSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  type: 'bird' | 'bat' | 'mammal' | 'reptile' | 'amphibian';
  conservationStatus: 'least_concern' | 'near_threatened' | 'vulnerable' | 'endangered' | 'critically_endangered';
  flightBehavior?: FlightBehavior;
  collisionRisk: CollisionRiskProfile;
  habitatRequirements: HabitatRequirement[];
  seasonalPresence: SeasonalPresence[];
}

export interface FlightBehavior {
  typicalFlightHeight: number; // meters
  flightHeightRange: [number, number]; // meters
  flightSpeed: number; // m/s
  maneuverability: 'low' | 'medium' | 'high';
  flockingBehavior: boolean;
  nocturnal: boolean;
}

export interface CollisionRiskProfile {
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  factors: CollisionRiskFactor[];
  avoidanceBehavior: AvoidanceBehavior;
}

export interface CollisionRiskFactor {
  factor: 'flight_height' | 'maneuverability' | 'vision' | 'weather_sensitivity' | 'habitat_proximity';
  influence: number; // 0-1 scale
}

export interface AvoidanceBehavior {
  avoidanceDistance: number; // meters
  avoidanceRate: number; // 0-1 scale
  weatherDependency: boolean;
  timeOfDayDependency: boolean;
}

export interface HabitatRequirement {
  habitatType: string;
  importance: 'critical' | 'important' | 'suitable' | 'marginal';
  minimumArea: number; // hectares
  connectivityRequirement: boolean;
}

export interface SeasonalPresence {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  presence: 'absent' | 'rare' | 'common' | 'abundant';
  activity: 'breeding' | 'feeding' | 'roosting' | 'migrating' | 'overwintering';
}

export interface MigrationRoute {
  id: string;
  species: string[];
  routeGeometry: GeographicCoordinate[];
  width: number; // meters
  peakMigrationPeriods: MigrationPeriod[];
  altitude: [number, number]; // meters
  importance: 'local' | 'regional' | 'national' | 'international';
}

export interface MigrationPeriod {
  startDate: string; // MM-DD format
  endDate: string; // MM-DD format
  peakDate: string; // MM-DD format
  intensity: 'low' | 'medium' | 'high' | 'very_high';
}

export interface BreedingArea {
  id: string;
  species: string[];
  geometry: GeographicCoordinate[];
  breedingSeason: [string, string]; // start and end dates
  sensitivity: 'low' | 'medium' | 'high' | 'critical';
  bufferDistance: number; // meters
}

export interface CriticalHabitat {
  id: string;
  habitatType: string;
  species: string[];
  geometry: GeographicCoordinate[];
  conservationValue: 'low' | 'medium' | 'high' | 'critical';
  threats: string[];
  managementRequirements: string[];
}

export interface SeasonalWildlifeBehavior {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  species: string;
  behavior: 'breeding' | 'feeding' | 'roosting' | 'migrating' | 'hibernating';
  activityLevel: 'low' | 'medium' | 'high';
  spatialDistribution: SpatialDistribution;
}

export interface SpatialDistribution {
  concentrationAreas: GeographicCoordinate[][];
  dispersalPattern: 'clustered' | 'random' | 'uniform';
  movementCorridors: GeographicCoordinate[][];
}

export interface EcosystemType {
  id: string;
  name: string;
  geometry: GeographicCoordinate[];
  classification: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'unique';
  condition: 'poor' | 'fair' | 'good' | 'excellent';
  threats: string[];
  keySpecies: string[];
  ecosystemServices: EcosystemService[];
}

export interface EcosystemService {
  type: 'provisioning' | 'regulating' | 'cultural' | 'supporting';
  service: string;
  value: 'low' | 'medium' | 'high' | 'critical';
  quantification?: number; // monetary value if available
}

export interface BiodiversityIndex {
  indexType: 'species_richness' | 'shannon_diversity' | 'simpson_diversity' | 'evenness';
  value: number;
  location: GeographicCoordinate;
  samplingArea: number; // hectares
  samplingDate: string;
}

export interface ConnectivityCorridor {
  id: string;
  name: string;
  geometry: GeographicCoordinate[];
  width: number; // meters
  species: string[];
  importance: 'low' | 'medium' | 'high' | 'critical';
  threats: string[];
  managementNeeds: string[];
}

export interface ProtectedArea {
  id: string;
  name: string;
  designation: string;
  geometry: GeographicCoordinate[];
  protectionLevel: 'strict' | 'moderate' | 'multiple_use';
  managementObjectives: string[];
  bufferZone?: number; // meters
}

export interface SoilType {
  id: string;
  classification: string;
  geometry: GeographicCoordinate[];
  properties: SoilProperties;
  suitability: SoilSuitability;
  limitations: string[];
}

export interface SoilProperties {
  texture: string;
  drainage: 'very_poor' | 'poor' | 'moderate' | 'good' | 'excessive';
  depth: number; // cm
  organicMatter: number; // percentage
  pH: number;
  erosionSusceptibility: 'low' | 'medium' | 'high' | 'very_high';
  compactionRisk: 'low' | 'medium' | 'high';
}

export interface SoilSuitability {
  construction: 'unsuitable' | 'marginal' | 'suitable' | 'highly_suitable';
  agriculture: 'unsuitable' | 'marginal' | 'suitable' | 'highly_suitable';
  limitations: string[];
  mitigationMeasures: string[];
}

export interface DrainagePattern {
  id: string;
  type: 'surface' | 'subsurface' | 'artificial';
  geometry: GeographicCoordinate[];
  flowDirection: number; // degrees
  capacity: number; // m³/s
  seasonalVariation: boolean;
}

export interface WaterBody {
  id: string;
  name: string;
  type: 'river' | 'stream' | 'lake' | 'pond' | 'wetland' | 'spring';
  geometry: GeographicCoordinate[];
  waterQuality: WaterQuality;
  ecologicalValue: 'low' | 'medium' | 'high' | 'critical';
  bufferRequirement: number; // meters
}

export interface WaterQuality {
  classification: string;
  pollutionLevel: 'clean' | 'slightly_polluted' | 'moderately_polluted' | 'heavily_polluted';
  keyParameters: WaterQualityParameter[];
}

export interface WaterQualityParameter {
  parameter: string;
  value: number;
  unit: string;
  standard: number;
  compliance: boolean;
}

export interface FloodZone {
  id: string;
  returnPeriod: number; // years
  geometry: GeographicCoordinate[];
  floodDepth: number; // meters
  velocity: number; // m/s
  duration: number; // hours
}

export interface ErosionSusceptibilityMap {
  gridResolution: number; // meters
  susceptibilityGrid: number[][]; // 0-1 scale
  factors: ErosionFactor[];
}

export interface ErosionFactor {
  type: 'slope' | 'soil_type' | 'vegetation_cover' | 'rainfall' | 'land_use';
  weight: number;
  influence: 'positive' | 'negative';
}