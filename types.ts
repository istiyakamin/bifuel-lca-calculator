
export enum VehicleType {
  DIESEL_TRUCK_EURO_V = 'Diesel Truck (Euro V, 7.5-12t)',
  ELECTRIC_TRUCK_MEDIUM = 'Electric Truck (Medium Duty)',
}

export enum FeedstockSourceType {
  HOUSEHOLD = 'Household WCO',
  RESTAURANT_CATERING = 'Restaurant & Catering WCO',
}

export enum TransportFuelType {
  DIESEL = 'Diesel',
  BIODIESEL_B100 = 'Biodiesel (B100)',
  ELECTRICITY = 'Electricity (Grid Mix)',
}

export interface FeedstockCollectionInputs {
  sourceType: FeedstockSourceType;
  collectionDistanceKm: number;
  vehicleType: VehicleType;
  wcoCollectedKg: number;
  wcoQualityFFA: number; // Percentage, e.g., 5 for 5%
}

export interface WcoTransportationInputs {
  distanceKm: number; // Distance from collection hub/intermediate storage to biodiesel plant
  fuelType: TransportFuelType;
  // wcoAmountKg is implicitly from FeedstockCollectionInputs.wcoCollectedKg
}

export enum CatalystType {
  NAOH = "Sodium Hydroxide (NaOH)",
  KOH = "Potassium Hydroxide (KOH)"
}

export enum EnergySourceType {
  GRID_MIX = "Grid Mix Electricity",
  RENEWABLE = "Renewable Electricity (e.g., Solar/Wind)"
}

export enum HeatSourceType {
  NATURAL_GAS = "Natural Gas",
  RENEWABLE_BIOMASS = "Renewable Biomass",
  ELECTRIC_HEAT_GRID = "Electric Heating (from Grid Mix)",
  ELECTRIC_HEAT_RENEWABLE = "Electric Heating (from Renewable Electricity)"
}

export interface BiodieselProductionInputs {
  methanolToOilRatioKey: string; 
  customMethanolPerKgWcoGR: number; 
  catalystType: CatalystType;
  catalystPercentageWCO: number; 
  chemicalTransportDistanceKm: number; 
  reactionTemperatureC: number;
  reactionTimeHours: number;
  biodieselYieldPercentWCO: number; 
  electricityKwhPerKgBiodiesel: number; 
  electricitySourceType: EnergySourceType;
  processHeatKwhPerKgBiodiesel: number; 
  heatSourceType: HeatSourceType;
}

export interface BiodieselDistributionInputs {
  distanceKm: number;
  fuelType: TransportFuelType;
}

export enum MarineEngineType {
  GENERIC_MARINE_DIESEL = 'Generic Marine Diesel Engine Profile (Tier II/III equivalent)',
}

export interface UsePhaseInputs {
  engineType: MarineEngineType;
}

export interface LcaInputs {
  feedstockCollection: FeedstockCollectionInputs;
  wcoTransportation: WcoTransportationInputs;
  biodieselProduction: BiodieselProductionInputs;
  biodieselDistribution: BiodieselDistributionInputs;
  usePhase: UsePhaseInputs;
}

export interface ImpactCategoryValues {
  gwp: number; // kg CO2-eq
  acidification: number; // kg SO2-eq
  eutrophication: number; // kg PO4^3--eq
  humanToxicity: number; // CTUh (Comparative Toxic Units for humans)
  particulateMatter: number; // kg PM2.5-eq
  landUse: number; // m2*a (square meter years)
  waterUse: number; // m3 (cubic meters)
}

export enum FunctionalUnit {
  MJ_ENERGY = 'Per MJ Energy Delivered',
  L_BIODIESEL = 'Per Liter Biodiesel',
}

// Stages for WCO biodiesel hotspot analysis/contribution breakdown
export enum HotspotStage {
  FEEDSTOCK_SUPPLY_CHAIN = "Feedstock & Chemical Supply Chain",
  BIODIESEL_PRODUCTION_PLANT = "Biodiesel Production Plant Operations",
  BIODIESEL_DISTRIBUTION = "Biodiesel Distribution",
  BIODIESEL_USE_PHASE = "Biodiesel Use Phase (Combustion)",
  // Consider adding 'WASTE_TREATMENT' if it becomes distinct
}

// Illustrative stages for Fossil Diesel hotspot analysis
export enum FossilDieselStage {
  UPSTREAM_EXTRACTION_TRANSPORT = "FD: Crude Extraction & Transport",
  REFINING = "FD: Refining",
  DISTRIBUTION = "FD: Distribution",
  COMBUSTION = "FD: Combustion (Use Phase)",
}


export type HotspotAnalysisData = {
  // Allows keys to be from HotspotStage enum, FossilDieselStage, or any string for flexibility
  [stageName: string]: ImpactCategoryValues;
};

export interface LcaResults {
  biodieselImpactsPerFu: ImpactCategoryValues;
  dieselImpactsPerFu: ImpactCategoryValues; // These are total WTW for fossil diesel per FU
  functionalUnit: FunctionalUnit;
  totalBiodieselProducedL: number;
  totalEnergyFromBiodieselMJ: number;
  notes?: string[];
  hotspotAnalysis?: HotspotAnalysisData; // WCO Biodiesel hotspot breakdown (absolute for batch)
  fossilDieselHotspotAnalysis?: HotspotAnalysisData; // Illustrative Fossil Diesel hotspot breakdown (absolute per FU)
  totalBiodieselImpactsBatch: ImpactCategoryValues; // Absolute impacts for the WCO biodiesel batch
  dieselImpactsForEquivalentVolume: ImpactCategoryValues; // Absolute impacts for equivalent volume of FD
}

export enum LcaStage {
  FEEDSTOCK = "Feedstock Collection",
  WCO_TRANSPORT = "WCO Transportation",
  PRODUCTION = "Biodiesel Production",
  DISTRIBUTION = "Biodiesel Distribution",
  USE_PHASE = "Use Phase (Marine Engine)",
  RESULTS = "Results & Comparison"
}