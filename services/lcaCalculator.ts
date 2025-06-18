
import {
  LcaInputs,
  LcaResults,
  ImpactCategoryValues,
  FunctionalUnit,
  VehicleType,
  TransportFuelType,
  CatalystType,
  EnergySourceType,
  HeatSourceType,
  MarineEngineType,
  HotspotStage,
  FossilDieselStage,
  HotspotAnalysisData,
} from '../types';
import {
  BIODIESEL_DENSITY_KG_L,
  BIODIESEL_ENERGY_DENSITY_MJ_KG,
  FOSSIL_DIESEL_IMPACTS,
  VEHICLE_EMISSION_FACTORS,
  METHANOL_PRODUCTION_IMPACTS_PER_KG,
  NAOH_PRODUCTION_IMPACTS_PER_KG,
  KOH_PRODUCTION_IMPACTS_PER_KG,
  GRID_ELECTRICITY_IMPACTS_PER_KWH,
  RENEWABLE_ELECTRICITY_IMPACTS_PER_KWH,
  NATURAL_GAS_COMBUSTION_IMPACTS_PER_KWH_HEAT,
  RENEWABLE_BIOMASS_IMPACTS_PER_KWH_HEAT,
  CHEMICAL_TRANSPORT_IMPACTS_PER_KG_KM,
  METHANOL_RATIO_OPTIONS,
  MARINE_ENGINE_COMBUSTION_IMPACTS_PER_MJ_BIODIESEL,
  IMPACTS_ZERO, 
  FOSSIL_DIESEL_HOTSPOT_PERCENTAGES, // Import new constant
  IMPACT_CATEGORIES_META, // To iterate over impact categories
} from '../constants';

const sumImpacts = (impactsArray: ImpactCategoryValues[]): ImpactCategoryValues => {
  return impactsArray.reduce((acc, curr) => ({
    gwp: acc.gwp + (curr?.gwp || 0),
    acidification: acc.acidification + (curr?.acidification || 0),
    eutrophication: acc.eutrophication + (curr?.eutrophication || 0),
    humanToxicity: acc.humanToxicity + (curr?.humanToxicity || 0),
    particulateMatter: acc.particulateMatter + (curr?.particulateMatter || 0),
    landUse: acc.landUse + (curr?.landUse || 0),
    waterUse: acc.waterUse + (curr?.waterUse || 0),
  }), { ...IMPACTS_ZERO });
};

const scaleImpacts = (impacts: ImpactCategoryValues, factor: number): ImpactCategoryValues => {
  if (!impacts || factor === 0 || isNaN(factor)) return { ...IMPACTS_ZERO };
  return {
    gwp: impacts.gwp * factor,
    acidification: impacts.acidification * factor,
    eutrophication: impacts.eutrophication * factor,
    humanToxicity: impacts.humanToxicity * factor,
    particulateMatter: impacts.particulateMatter * factor,
    landUse: impacts.landUse * factor,
    waterUse: impacts.waterUse * factor,
  };
};

export const calculateLca = (inputs: LcaInputs, functionalUnit: FunctionalUnit): LcaResults => {
  const notes: string[] = [];
  const hotspotContributions: HotspotAnalysisData = {
    [HotspotStage.FEEDSTOCK_SUPPLY_CHAIN]: { ...IMPACTS_ZERO },
    [HotspotStage.BIODIESEL_PRODUCTION_PLANT]: { ...IMPACTS_ZERO },
    [HotspotStage.BIODIESEL_DISTRIBUTION]: { ...IMPACTS_ZERO },
    [HotspotStage.BIODIESEL_USE_PHASE]: { ...IMPACTS_ZERO },
  };
  
  // --- Stage 1: Feedstock Collection ---
  const fc = inputs.feedstockCollection;
  const fcVehicleImpactsPerKm = VEHICLE_EMISSION_FACTORS[fc.vehicleType].perKm;
  const feedstockCollectionImpacts = scaleImpacts(fcVehicleImpactsPerKm, fc.collectionDistanceKm);
  notes.push(`Feedstock collection: ${fc.collectionDistanceKm} km using ${fc.vehicleType}. WCO collected: ${fc.wcoCollectedKg} kg.`);
  notes.push(`WCO FFA: ${fc.wcoQualityFFA}%. (Informational, does not directly adjust current calculations).`);
  hotspotContributions[HotspotStage.FEEDSTOCK_SUPPLY_CHAIN] = sumImpacts([hotspotContributions[HotspotStage.FEEDSTOCK_SUPPLY_CHAIN], feedstockCollectionImpacts]);

  // --- Stage 2: WCO Transportation to Plant ---
  const wt = inputs.wcoTransportation;
  let wtVehicleImpactsPerKmKey: VehicleType | TransportFuelType = wt.fuelType;
  if (wt.fuelType === TransportFuelType.DIESEL) wtVehicleImpactsPerKmKey = VehicleType.DIESEL_TRUCK_EURO_V;
  else if (wt.fuelType === TransportFuelType.ELECTRICITY) wtVehicleImpactsPerKmKey = VehicleType.ELECTRIC_TRUCK_MEDIUM;
  else if (wt.fuelType === TransportFuelType.BIODIESEL_B100) wtVehicleImpactsPerKmKey = TransportFuelType.BIODIESEL_B100;
  
  const wtVehicleImpactsPerKm = VEHICLE_EMISSION_FACTORS[wtVehicleImpactsPerKmKey]?.perKm;
  if (!wtVehicleImpactsPerKm) {
    notes.push(`Warning: Emission factors for WCO transport vehicle (${wtVehicleImpactsPerKmKey}) not found. Transport impacts zeroed.`);
  }
  const wcoTransportationImpacts = wtVehicleImpactsPerKm ? scaleImpacts(wtVehicleImpactsPerKm, wt.distanceKm) : { ...IMPACTS_ZERO };
  notes.push(`WCO transportation to plant: ${wt.distanceKm} km via ${wt.fuelType}.`);
  hotspotContributions[HotspotStage.FEEDSTOCK_SUPPLY_CHAIN] = sumImpacts([hotspotContributions[HotspotStage.FEEDSTOCK_SUPPLY_CHAIN], wcoTransportationImpacts]);

  // --- Stage 3: Biodiesel Production ---
  const prod = inputs.biodieselProduction;
  const wcoInputKg = fc.wcoCollectedKg;

  let actualMethanolPerKgWcoGR = 0;
  if (prod.methanolToOilRatioKey === 'custom_g_per_kg') {
    actualMethanolPerKgWcoGR = prod.customMethanolPerKgWcoGR;
  } else {
    const selectedRatio = METHANOL_RATIO_OPTIONS.find(opt => opt.key === prod.methanolToOilRatioKey);
    actualMethanolPerKgWcoGR = selectedRatio?.valueGramsPerKgWCO || 0;
  }
  const totalMethanolKg = (actualMethanolPerKgWcoGR / 1000) * wcoInputKg;
  const methanolProductionImpacts = scaleImpacts(METHANOL_PRODUCTION_IMPACTS_PER_KG, totalMethanolKg);
  notes.push(`Methanol usage: ${totalMethanolKg.toFixed(2)} kg (based on ${prod.methanolToOilRatioKey === 'custom_g_per_kg' ? `custom ${actualMethanolPerKgWcoGR} g/kg WCO` : prod.methanolToOilRatioKey}).`);
  hotspotContributions[HotspotStage.FEEDSTOCK_SUPPLY_CHAIN] = sumImpacts([hotspotContributions[HotspotStage.FEEDSTOCK_SUPPLY_CHAIN], methanolProductionImpacts]);

  const catalystProductionImpactsPerKg = prod.catalystType === CatalystType.KOH ? KOH_PRODUCTION_IMPACTS_PER_KG : NAOH_PRODUCTION_IMPACTS_PER_KG;
  const totalCatalystKg = (prod.catalystPercentageWCO / 100) * wcoInputKg;
  const catalystProductionImpacts = scaleImpacts(catalystProductionImpactsPerKg, totalCatalystKg);
  notes.push(`Catalyst: ${totalCatalystKg.toFixed(2)} kg of ${prod.catalystType} (${prod.catalystPercentageWCO}% of WCO).`);
  hotspotContributions[HotspotStage.FEEDSTOCK_SUPPLY_CHAIN] = sumImpacts([hotspotContributions[HotspotStage.FEEDSTOCK_SUPPLY_CHAIN], catalystProductionImpacts]);
  
  const totalChemicalsKg = totalMethanolKg + totalCatalystKg;
  const chemicalTransportImpacts = scaleImpacts(CHEMICAL_TRANSPORT_IMPACTS_PER_KG_KM, totalChemicalsKg * prod.chemicalTransportDistanceKm);
  notes.push(`Chemicals transport: ${totalChemicalsKg.toFixed(2)} kg over ${prod.chemicalTransportDistanceKm} km.`);
  hotspotContributions[HotspotStage.FEEDSTOCK_SUPPLY_CHAIN] = sumImpacts([hotspotContributions[HotspotStage.FEEDSTOCK_SUPPLY_CHAIN], chemicalTransportImpacts]);

  const biodieselProducedKg = wcoInputKg * (prod.biodieselYieldPercentWCO / 100);
  if (biodieselProducedKg <= 0) {
     notes.push("Warning: Biodiesel produced is zero or negative. Production, distribution, and use phase impacts related to biodiesel quantity will be zero.");
  }
  notes.push(`Reaction: Temp ${prod.reactionTemperatureC}°C, Time ${prod.reactionTimeHours}h. Yield ${prod.biodieselYieldPercentWCO}%. Biodiesel produced: ${biodieselProducedKg.toFixed(2)} kg. (Temp & Time are informational).`);

  let electricityImpactsPerKwh: ImpactCategoryValues;
  if (prod.electricitySourceType === EnergySourceType.RENEWABLE) {
    electricityImpactsPerKwh = RENEWABLE_ELECTRICITY_IMPACTS_PER_KWH;
  } else {
    electricityImpactsPerKwh = GRID_ELECTRICITY_IMPACTS_PER_KWH;
  }
  const totalElectricityKwh = biodieselProducedKg > 0 ? prod.electricityKwhPerKgBiodiesel * biodieselProducedKg : 0;
  const electricityImpacts = scaleImpacts(electricityImpactsPerKwh, totalElectricityKwh);
  notes.push(`Electricity: ${totalElectricityKwh.toFixed(2)} kWh from ${prod.electricitySourceType}.`);
  hotspotContributions[HotspotStage.BIODIESEL_PRODUCTION_PLANT] = sumImpacts([hotspotContributions[HotspotStage.BIODIESEL_PRODUCTION_PLANT], electricityImpacts]);
  
  let heatImpactsPerKwh: ImpactCategoryValues;
  switch(prod.heatSourceType) {
    case HeatSourceType.RENEWABLE_BIOMASS: heatImpactsPerKwh = RENEWABLE_BIOMASS_IMPACTS_PER_KWH_HEAT; break;
    case HeatSourceType.ELECTRIC_HEAT_GRID: heatImpactsPerKwh = GRID_ELECTRICITY_IMPACTS_PER_KWH; break; // Assumes electric heaters, same efficiency as grid
    case HeatSourceType.ELECTRIC_HEAT_RENEWABLE: heatImpactsPerKwh = RENEWABLE_ELECTRICITY_IMPACTS_PER_KWH; break; // Assumes electric heaters
    case HeatSourceType.NATURAL_GAS: default: heatImpactsPerKwh = NATURAL_GAS_COMBUSTION_IMPACTS_PER_KWH_HEAT; break;
  }
  const totalProcessHeatKwh = biodieselProducedKg > 0 ? prod.processHeatKwhPerKgBiodiesel * biodieselProducedKg : 0;
  const processHeatImpacts = scaleImpacts(heatImpactsPerKwh, totalProcessHeatKwh);
  notes.push(`Process Heat: ${totalProcessHeatKwh.toFixed(2)} kWh from ${prod.heatSourceType}.`);
  hotspotContributions[HotspotStage.BIODIESEL_PRODUCTION_PLANT] = sumImpacts([hotspotContributions[HotspotStage.BIODIESEL_PRODUCTION_PLANT], processHeatImpacts]);

  notes.push("Simplification: Burdens from co-products (e.g., glycerol) are currently not allocated away from biodiesel (conservative approach).");
  
  // --- Stage 4: Biodiesel Distribution ---
  const dist = inputs.biodieselDistribution;
  let distVehicleImpactsPerKmKey: VehicleType | TransportFuelType = dist.fuelType;
  if (dist.fuelType === TransportFuelType.DIESEL) distVehicleImpactsPerKmKey = VehicleType.DIESEL_TRUCK_EURO_V;
  else if (dist.fuelType === TransportFuelType.ELECTRICITY) distVehicleImpactsPerKmKey = VehicleType.ELECTRIC_TRUCK_MEDIUM;
  else if (dist.fuelType === TransportFuelType.BIODIESEL_B100) distVehicleImpactsPerKmKey = TransportFuelType.BIODIESEL_B100;

  const distVehicleImpactsPerKm = VEHICLE_EMISSION_FACTORS[distVehicleImpactsPerKmKey]?.perKm;
  if (!distVehicleImpactsPerKm) {
    notes.push(`Warning: Emission factors for biodiesel distribution vehicle (${distVehicleImpactsPerKmKey}) not found. Distribution impacts zeroed.`);
  }
  const biodieselDistributionImpacts = biodieselProducedKg > 0 && distVehicleImpactsPerKm ? scaleImpacts(distVehicleImpactsPerKm, dist.distanceKm) : { ...IMPACTS_ZERO };
  if (biodieselProducedKg > 0) {
    notes.push(`Biodiesel distribution: ${dist.distanceKm} km using ${dist.fuelType}.`);
  }
  hotspotContributions[HotspotStage.BIODIESEL_DISTRIBUTION] = sumImpacts([hotspotContributions[HotspotStage.BIODIESEL_DISTRIBUTION], biodieselDistributionImpacts]);
  
  // --- Stage 5: Use Phase (Marine Engine Combustion) ---
  const use = inputs.usePhase;
  const totalBiodieselProducedL = biodieselProducedKg > 0 ? biodieselProducedKg / BIODIESEL_DENSITY_KG_L : 0;
  const totalEnergyFromBiodieselMJ = biodieselProducedKg > 0 ? biodieselProducedKg * BIODIESEL_ENERGY_DENSITY_MJ_KG : 0;

  let combustionImpactsPerMjBiodiesel = MARINE_ENGINE_COMBUSTION_IMPACTS_PER_MJ_BIODIESEL[use.engineType];
  if(!combustionImpactsPerMjBiodiesel) {
    notes.push(`Warning: Combustion impacts for marine engine type ${use.engineType} not found. Using generic profile.`);
    combustionImpactsPerMjBiodiesel = MARINE_ENGINE_COMBUSTION_IMPACTS_PER_MJ_BIODIESEL[MarineEngineType.GENERIC_MARINE_DIESEL];
  }
  
  const biodieselCombustionImpacts = biodieselProducedKg > 0 ? scaleImpacts(combustionImpactsPerMjBiodiesel, totalEnergyFromBiodieselMJ) : { ...IMPACTS_ZERO };
  if (biodieselProducedKg > 0) {
    notes.push(`Use Phase: Combustion of ${totalEnergyFromBiodieselMJ.toFixed(2)} MJ biodiesel in ${use.engineType}. Biogenic CO2 GWP impact is considered 0.`);
  } else {
    notes.push(`Use Phase: No biodiesel produced, so no combustion impacts.`);
  }
  hotspotContributions[HotspotStage.BIODIESEL_USE_PHASE] = sumImpacts([hotspotContributions[HotspotStage.BIODIESEL_USE_PHASE], biodieselCombustionImpacts]);

  // --- Total Biodiesel Impacts (Well-to-Wake/Wheel) ---
  const totalBiodieselImpacts_WTW_Batch = sumImpacts(Object.values(hotspotContributions));
  notes.push("Biodiesel GWP impacts are 'Well-to-Wake/Wheel'. Fossil diesel is 'Well-to-Wheel'.");

  // --- Conversions for Functional Unit & Fossil Diesel Data ---
  let biodieselImpactsPerFu: ImpactCategoryValues;
  let dieselImpactsPerFu: ImpactCategoryValues;
  let divisor: number;

  if (functionalUnit === FunctionalUnit.MJ_ENERGY) {
    divisor = totalEnergyFromBiodieselMJ;
    dieselImpactsPerFu = FOSSIL_DIESEL_IMPACTS.perMj;
    notes.push(`Results normalized per MJ energy. Total energy from batch: ${totalEnergyFromBiodieselMJ.toFixed(2)} MJ.`);
  } else { // FunctionalUnit.L_BIODIESEL
    divisor = totalBiodieselProducedL;
    dieselImpactsPerFu = FOSSIL_DIESEL_IMPACTS.perL;
    notes.push(`Results normalized per Liter biodiesel. Total volume from batch: ${totalBiodieselProducedL.toFixed(2)} L.`);
  }

  if (divisor > 0) {
    biodieselImpactsPerFu = scaleImpacts(totalBiodieselImpacts_WTW_Batch, 1 / divisor);
  } else {
    biodieselImpactsPerFu = { ...IMPACTS_ZERO };
    notes.push("Warning: Total biodiesel quantity (MJ or L) is zero. Impacts per functional unit for biodiesel are zeroed.");
  }
  
  if (!dieselImpactsPerFu) { 
    dieselImpactsPerFu = { ...IMPACTS_ZERO };
    notes.push("Error: Fossil diesel impacts for the selected FU could not be determined.");
  }

  // Calculate impacts for an equivalent volume of fossil diesel
  const dieselImpactsForEquivalentVolume = scaleImpacts(FOSSIL_DIESEL_IMPACTS.perL, totalBiodieselProducedL);

  // --- Calculate Illustrative Fossil Diesel Hotspot Analysis (per FU basis) ---
  const fossilDieselHotspotAnalysis: HotspotAnalysisData = {};
  IMPACT_CATEGORIES_META.forEach(catMeta => {
    const categoryKey = catMeta.key;
    const totalDieselImpactForCategoryPerFu = dieselImpactsPerFu[categoryKey]; // This is per FU

    Object.values(FossilDieselStage).forEach(fdStage => {
      if (!fossilDieselHotspotAnalysis[fdStage]) {
        fossilDieselHotspotAnalysis[fdStage] = { ...IMPACTS_ZERO };
      }
      const percentage = FOSSIL_DIESEL_HOTSPOT_PERCENTAGES[categoryKey]?.[fdStage] || 0;
      fossilDieselHotspotAnalysis[fdStage][categoryKey] = totalDieselImpactForCategoryPerFu * percentage;
    });
  });
  
  notes.push("Fossil diesel hotspot analysis is illustrative, based on predefined percentage breakdowns of its total Well-to-Wheel impacts per functional unit.");

  return {
    biodieselImpactsPerFu,
    dieselImpactsPerFu,
    functionalUnit,
    totalBiodieselProducedL,
    totalEnergyFromBiodieselMJ,
    notes,
    hotspotAnalysis: hotspotContributions, // WCO Biodiesel impacts by stage (absolute values for the batch)
    fossilDieselHotspotAnalysis, // Fossil Diesel impacts by illustrative stage (absolute values per functional unit)
    totalBiodieselImpactsBatch: totalBiodieselImpacts_WTW_Batch,
    dieselImpactsForEquivalentVolume,
  };
};