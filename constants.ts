
import { LcaInputs, ImpactCategoryValues, VehicleType, FeedstockSourceType, TransportFuelType, FunctionalUnit, CatalystType, EnergySourceType, HeatSourceType, MarineEngineType, HotspotStage, FossilDieselStage } from './types';

// Energy Densities & Conversion
export const BIODIESEL_DENSITY_KG_L = 0.88; // kg/L
export const FOSSIL_DIESEL_DENSITY_KG_L = 0.85; // kg/L
export const METHANOL_DENSITY_KG_L = 0.792; // kg/L

export const BIODIESEL_ENERGY_DENSITY_MJ_KG = 37.2; // MJ/kg (approx, LHV)
export const FOSSIL_DIESEL_ENERGY_DENSITY_MJ_KG = 42.8; // MJ/kg (approx, LHV)

export const BIODIESEL_ENERGY_DENSITY_MJ_L = BIODIESEL_ENERGY_DENSITY_MJ_KG * BIODIESEL_DENSITY_KG_L; // Approx 32.7 MJ/L
export const FOSSIL_DIESEL_ENERGY_DENSITY_MJ_L = FOSSIL_DIESEL_ENERGY_DENSITY_MJ_KG * FOSSIL_DIESEL_DENSITY_KG_L; // Approx 36.38 MJ/L

// Impact Factors (Illustrative - placeholder values, replace with actual database values)
// GWP: kg CO2-eq, Acidification: kg SO2-eq, Eutrophication: kg PO4^3--eq
// New: humanToxicity: CTUh, particulateMatter: kg PM2.5-eq, landUse: m2*a, waterUse: m3
export const IMPACTS_ZERO: ImpactCategoryValues = { 
  gwp: 0, acidification: 0, eutrophication: 0, 
  humanToxicity: 0, particulateMatter: 0, landUse: 0, waterUse: 0 
};

export const VEHICLE_EMISSION_FACTORS: {
  [key in VehicleType | TransportFuelType]: { perKm: ImpactCategoryValues }
} = {
  [VehicleType.DIESEL_TRUCK_EURO_V]: {
    perKm: { gwp: 0.65, acidification: 0.0003, eutrophication: 0.00015, humanToxicity: 0.00002, particulateMatter: 0.00005, landUse: 0, waterUse: 0 }
  },
  [VehicleType.ELECTRIC_TRUCK_MEDIUM]: { // Assuming a relatively clean grid
    perKm: { gwp: 0.15, acidification: 0.0001, eutrophication: 0.00005, humanToxicity: 0.00001, particulateMatter: 0.00002, landUse: 0, waterUse: 0 } 
  },
  [TransportFuelType.DIESEL]: { // Generic for non-collection/distribution if needed
    perKm: { gwp: 0.70, acidification: 0.00035, eutrophication: 0.00018, humanToxicity: 0.000022, particulateMatter: 0.000055, landUse: 0, waterUse: 0 } 
  },
  [TransportFuelType.BIODIESEL_B100]: { // Using lower direct emissions for B100.
    perKm: { gwp: 0.05, acidification: 0.00025, eutrophication: 0.00012, humanToxicity: 0.000015, particulateMatter: 0.00004, landUse: 0, waterUse: 0 } 
  },
  [TransportFuelType.ELECTRICITY]: { // Same as electric truck for now, for consistency
    perKm: { gwp: 0.15, acidification: 0.0001, eutrophication: 0.00005, humanToxicity: 0.00001, particulateMatter: 0.00002, landUse: 0, waterUse: 0 }
  }
};

// Chemical Production Impacts
export const METHANOL_PRODUCTION_IMPACTS_PER_KG: ImpactCategoryValues = { // From natural gas (conventional)
  gwp: 1.5, acidification: 0.002, eutrophication: 0.0005, humanToxicity: 0.1, particulateMatter: 0.001, landUse: 0.2, waterUse: 0.5 
};
export const NAOH_PRODUCTION_IMPACTS_PER_KG: ImpactCategoryValues = { // Sodium Hydroxide
  gwp: 1.2, acidification: 0.003, eutrophication: 0.0004, humanToxicity: 0.08, particulateMatter: 0.0008, landUse: 0.1, waterUse: 0.3
};
export const KOH_PRODUCTION_IMPACTS_PER_KG: ImpactCategoryValues = { // Potassium Hydroxide (placeholder)
  gwp: 1.4, acidification: 0.0035, eutrophication: 0.00045, humanToxicity: 0.09, particulateMatter: 0.0009, landUse: 0.15, waterUse: 0.4
};

// Energy Production Impacts
export const GRID_ELECTRICITY_IMPACTS_PER_KWH: ImpactCategoryValues = { // Average European grid mix (example)
  gwp: 0.25, acidification: 0.0002, eutrophication: 0.00008, humanToxicity: 0.02, particulateMatter: 0.0001, landUse: 0.05, waterUse: 0.1
};
export const RENEWABLE_ELECTRICITY_IMPACTS_PER_KWH: ImpactCategoryValues = { // e.g., Solar PV lifecycle (placeholder)
  gwp: 0.04, acidification: 0.00005, eutrophication: 0.00002, humanToxicity: 0.005, particulateMatter: 0.00002, landUse: 0.1, waterUse: 0.02 // Land use for solar can be significant
};
export const NATURAL_GAS_COMBUSTION_IMPACTS_PER_KWH_HEAT: ImpactCategoryValues = { // For process heat
  gwp: 0.20, acidification: 0.0001, eutrophication: 0.00003, humanToxicity: 0.015, particulateMatter: 0.00008, landUse: 0, waterUse: 0.01
};
export const RENEWABLE_BIOMASS_IMPACTS_PER_KWH_HEAT: ImpactCategoryValues = { // Placeholder, depends on biomass type & sourcing
  gwp: 0.05, acidification: 0.00015, eutrophication: 0.00010, humanToxicity: 0.01, particulateMatter: 0.0005, landUse: 0.5, waterUse: 0.2 // Land use for biomass, PM can be higher
};

// Transport Impacts for Chemicals (placeholder - typically per tonne-km, converted to kg-km)
export const CHEMICAL_TRANSPORT_IMPACTS_PER_KG_KM: ImpactCategoryValues = {
  gwp: 0.00015, acidification: 0.000001, eutrophication: 0.0000005, humanToxicity: 0.0000002, particulateMatter: 0.0000001, landUse: 0, waterUse: 0 
};

// Use Phase: Marine Engine Combustion Impacts (PLACEHOLDERS - requires specific data)
export const MARINE_ENGINE_COMBUSTION_IMPACTS_PER_MJ_BIODIESEL: {
    [key in MarineEngineType]: ImpactCategoryValues
} = {
    [MarineEngineType.GENERIC_MARINE_DIESEL]: {
        gwp: 0.005,      // kg CO2-eq/MJ (N2O, CH4 from combustion - biogenic CO2 itself is 0)
        acidification: 0.00015,  // kg SO2-eq/MJ (mainly NOx, biodiesel has low S)
        eutrophication: 0.00008, // kg PO4^3--eq/MJ (mainly NOx)
        humanToxicity: 0.0001, // CTUh/MJ
        particulateMatter: 0.00005, // kg PM2.5-eq/MJ
        landUse: 0, // Combustion itself typically has no direct land use
        waterUse: 0 // Combustion itself typically has no direct water use
    }
};

// Comparison: Fossil Diesel (Well-to-Wheel impacts, includes combustion)
// These are illustrative benchmark values.
export const FOSSIL_DIESEL_IMPACTS: {
  perMj: ImpactCategoryValues;
  perL: ImpactCategoryValues;
} = {
  perMj: { 
    gwp: 0.085,             // kg CO2-eq/MJ (remains a standard estimate)
    acidification: 0.000041,  // kg SO2-eq/MJ (slightly adjusted)
    eutrophication: 0.000016, // kg PO4^3--eq/MJ (slightly adjusted)
    humanToxicity: 0.00051,   // CTUh/MJ (slightly adjusted)
    particulateMatter: 0.000022, // kg PM2.5-eq/MJ (slightly adjusted)
    landUse: 0.011,           // m2*a/MJ (slightly adjusted)
    waterUse: 0.0052          // m3/MJ (slightly adjusted)
  },
  perL: {
    gwp: (0.085) * FOSSIL_DIESEL_ENERGY_DENSITY_MJ_L,
    acidification: (0.000041) * FOSSIL_DIESEL_ENERGY_DENSITY_MJ_L,
    eutrophication: (0.000016) * FOSSIL_DIESEL_ENERGY_DENSITY_MJ_L,
    humanToxicity: (0.00051) * FOSSIL_DIESEL_ENERGY_DENSITY_MJ_L,
    particulateMatter: (0.000022) * FOSSIL_DIESEL_ENERGY_DENSITY_MJ_L,
    landUse: (0.011) * FOSSIL_DIESEL_ENERGY_DENSITY_MJ_L,
    waterUse: (0.0052) * FOSSIL_DIESEL_ENERGY_DENSITY_MJ_L
  }
};

// Methanol to Oil Ratio Options
export const METHANOL_RATIO_OPTIONS: Array<{ key: string; label: string; valueGramsPerKgWCO: number | null }> = [
  { key: "6:1_molar", label: "6:1 Molar (Typical)", valueGramsPerKgWCO: 220 },
  { key: "9:1_molar", label: "9:1 Molar (Excess Methanol)", valueGramsPerKgWCO: 330 },
  { key: "custom_g_per_kg", label: "Custom (g Methanol / kg WCO)", valueGramsPerKgWCO: null },
];

// Biodiesel Blend Levels for GWP Comparison Table
export const BIODIESEL_BLEND_LEVELS = [
  { name: 'B0', biodieselPercent: 0, fossilDieselPercent: 100 },
  { name: 'B10', biodieselPercent: 10, fossilDieselPercent: 90 },
  { name: 'B25', biodieselPercent: 25, fossilDieselPercent: 75 },
  { name: 'B50', biodieselPercent: 50, fossilDieselPercent: 50 },
  { name: 'B75', biodieselPercent: 75, fossilDieselPercent: 25 },
  { name: 'B100', biodieselPercent: 100, fossilDieselPercent: 0 },
];

// Centralized Impact Category Metadata
export const IMPACT_CATEGORIES_META: Array<{key: keyof ImpactCategoryValues, label: string, shortLabel: string, unit: string}> = [
  { key: 'gwp', label: 'Global Warming Potential', shortLabel: 'GWP', unit: 'kg CO₂-eq' },
  { key: 'acidification', label: 'Acidification Potential', shortLabel: 'Acidification', unit: 'kg SO₂-eq' },
  { key: 'eutrophication', label: 'Eutrophication Potential', shortLabel: 'Eutrophication', unit: 'kg PO₄³⁻-eq' },
  { key: 'humanToxicity', label: 'Human Toxicity', shortLabel: 'Human Tox.', unit: 'CTUh' },
  { key: 'particulateMatter', label: 'Particulate Matter', shortLabel: 'PM₂.₅', unit: 'kg PM₂.₅-eq' },
  { key: 'landUse', label: 'Land Use', shortLabel: 'Land Use', unit: 'm²·yr' },
  { key: 'waterUse', label: 'Water Use', shortLabel: 'Water Use', unit: 'm³' },
];

// Centralized Stage Colors for WCO Biodiesel
export const STAGE_COLORS: { [key in HotspotStage]: string } = {
  [HotspotStage.FEEDSTOCK_SUPPLY_CHAIN]: '#4CAF50', // Green 500
  [HotspotStage.BIODIESEL_PRODUCTION_PLANT]: '#2196F3', // Blue 500
  [HotspotStage.BIODIESEL_DISTRIBUTION]: '#FFC107', // Amber 500
  [HotspotStage.BIODIESEL_USE_PHASE]: '#F44336', // Red 500
};

// Centralized Stage Colors for Illustrative Fossil Diesel
export const FOSSIL_DIESEL_STAGE_COLORS: { [key in FossilDieselStage]: string } = {
  [FossilDieselStage.UPSTREAM_EXTRACTION_TRANSPORT]: '#A1887F', // Brown 300
  [FossilDieselStage.REFINING]: '#795548', // Brown 500
  [FossilDieselStage.DISTRIBUTION]: '#FF9800', // Orange 500
  [FossilDieselStage.COMBUSTION]: '#E53935', // Red 600
};


// Illustrative Hotspot Percentages for Fossil Diesel (Well-to-Wheel)
// These are placeholders and should be based on literature averages for a chosen region/technology.
export const FOSSIL_DIESEL_HOTSPOT_PERCENTAGES: {
  [key in keyof ImpactCategoryValues]: { [stage in FossilDieselStage]: number }
} = {
  gwp: {
    [FossilDieselStage.UPSTREAM_EXTRACTION_TRANSPORT]: 0.20, // 20%
    [FossilDieselStage.REFINING]: 0.15,                     // 15%
    [FossilDieselStage.DISTRIBUTION]: 0.05,                   // 5%
    [FossilDieselStage.COMBUSTION]: 0.60,                     // 60%
  },
  acidification: { // Example: Higher contribution from combustion (NOx)
    [FossilDieselStage.UPSTREAM_EXTRACTION_TRANSPORT]: 0.10,
    [FossilDieselStage.REFINING]: 0.15,
    [FossilDieselStage.DISTRIBUTION]: 0.05,
    [FossilDieselStage.COMBUSTION]: 0.70,
  },
  eutrophication: { // Example: Similar to acidification
    [FossilDieselStage.UPSTREAM_EXTRACTION_TRANSPORT]: 0.10,
    [FossilDieselStage.REFINING]: 0.15,
    [FossilDieselStage.DISTRIBUTION]: 0.05,
    [FossilDieselStage.COMBUSTION]: 0.70,
  },
  humanToxicity: { // Example: More distributed
    [FossilDieselStage.UPSTREAM_EXTRACTION_TRANSPORT]: 0.30,
    [FossilDieselStage.REFINING]: 0.30,
    [FossilDieselStage.DISTRIBUTION]: 0.10,
    [FossilDieselStage.COMBUSTION]: 0.30,
  },
  particulateMatter: { // Example: Significant from combustion and refining
    [FossilDieselStage.UPSTREAM_EXTRACTION_TRANSPORT]: 0.15,
    [FossilDieselStage.REFINING]: 0.25,
    [FossilDieselStage.DISTRIBUTION]: 0.05,
    [FossilDieselStage.COMBUSTION]: 0.55,
  },
  landUse: { // Example: Mainly upstream
    [FossilDieselStage.UPSTREAM_EXTRACTION_TRANSPORT]: 0.70,
    [FossilDieselStage.REFINING]: 0.20,
    [FossilDieselStage.DISTRIBUTION]: 0.05,
    [FossilDieselStage.COMBUSTION]: 0.05, // Typically very low direct land use for combustion
  },
  waterUse: { // Example: Mainly upstream and refining
    [FossilDieselStage.UPSTREAM_EXTRACTION_TRANSPORT]: 0.40,
    [FossilDieselStage.REFINING]: 0.50,
    [FossilDieselStage.DISTRIBUTION]: 0.05,
    [FossilDieselStage.COMBUSTION]: 0.05, // Can be for cooling in power plants, but less for vehicle combustion itself
  },
};


// Default inputs for the LCA calculator forms
export const DEFAULT_LCA_INPUTS: LcaInputs = {
  feedstockCollection: {
    sourceType: FeedstockSourceType.RESTAURANT_CATERING,
    collectionDistanceKm: 50,
    vehicleType: VehicleType.DIESEL_TRUCK_EURO_V,
    wcoCollectedKg: 1000,
    wcoQualityFFA: 5,
  },
  wcoTransportation: {
    distanceKm: 100,
    fuelType: TransportFuelType.DIESEL,
  },
  biodieselProduction: {
    methanolToOilRatioKey: METHANOL_RATIO_OPTIONS[0].key,
    customMethanolPerKgWcoGR: METHANOL_RATIO_OPTIONS[0].valueGramsPerKgWCO || 220,
    catalystType: CatalystType.KOH,
    catalystPercentageWCO: 1.0,
    chemicalTransportDistanceKm: 36.8,
    reactionTemperatureC: 60,
    reactionTimeHours: 1,
    biodieselYieldPercentWCO: 90,
    electricityKwhPerKgBiodiesel: 0.15,
    electricitySourceType: EnergySourceType.GRID_MIX,
    processHeatKwhPerKgBiodiesel: 0.5,
    heatSourceType: HeatSourceType.NATURAL_GAS,
  },
  biodieselDistribution: {
    distanceKm: 200,
    fuelType: TransportFuelType.DIESEL,
  },
  usePhase: {
    engineType: MarineEngineType.GENERIC_MARINE_DIESEL,
  }
};
