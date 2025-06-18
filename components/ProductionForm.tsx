
import React, { useMemo } from 'react';
import InputNumber from './InputNumber';
import SelectInput from './SelectInput';
import { BiodieselProductionInputs, CatalystType, EnergySourceType, HeatSourceType } from '../types';
import { METHANOL_RATIO_OPTIONS, METHANOL_DENSITY_KG_L } from '../constants';

interface ProductionFormProps {
  data: BiodieselProductionInputs;
  wcoAmountKg: number; // For context and calculating yield/methanol
  onChange: (newData: BiodieselProductionInputs) => void;
}

const ProductionForm: React.FC<ProductionFormProps> = ({ data, wcoAmountKg, onChange }) => {

  const effectiveMethanolPerKgWcoGR = useMemo(() => {
    if (data.methanolToOilRatioKey === 'custom_g_per_kg') {
      return data.customMethanolPerKgWcoGR;
    }
    const selectedOption = METHANOL_RATIO_OPTIONS.find(opt => opt.key === data.methanolToOilRatioKey);
    return selectedOption?.valueGramsPerKgWCO ?? 0;
  }, [data.methanolToOilRatioKey, data.customMethanolPerKgWcoGR]);

  const handleChange = (field: keyof BiodieselProductionInputs, value: any) => {
    const newData = { ...data, [field]: value };
    // If ratio key changes, and it's not custom, update customMethanolPerKgWcoGR to reflect the selected ratio's value
    if (field === 'methanolToOilRatioKey' && value !== 'custom_g_per_kg') {
      const selectedOption = METHANOL_RATIO_OPTIONS.find(opt => opt.key === value);
      if (selectedOption && selectedOption.valueGramsPerKgWCO !== null) {
        newData.customMethanolPerKgWcoGR = selectedOption.valueGramsPerKgWCO;
      }
    }
    onChange(newData);
  };
  

  const biodieselProducedKg = wcoAmountKg * (data.biodieselYieldPercentWCO / 100);
  const totalMethanolKg = (effectiveMethanolPerKgWcoGR / 1000) * wcoAmountKg;
  const totalMethanolLiters = totalMethanolKg / METHANOL_DENSITY_KG_L;

  const catalystTypeOptions = Object.values(CatalystType).map(v => ({ value: v, label: v }));
  const energySourceOptions = Object.values(EnergySourceType).map(v => ({ value: v, label: v }));
  const heatSourceOptions = Object.values(HeatSourceType).map(v => ({ value: v, label: v }));
  const methanolRatioUiOptions = METHANOL_RATIO_OPTIONS.map(opt => ({ value: opt.key, label: opt.label }));


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h3 className="col-span-1 md:col-span-2 lg:col-span-3 text-lg font-semibold text-green-700 mb-3 border-b pb-2">
        3. Biodiesel Production Process
      </h3>
       <div className="col-span-1 md:col-span-2 lg:col-span-3 p-3 mb-3 bg-yellow-50 text-yellow-800 text-sm rounded-md shadow">
        Processing {wcoAmountKg.toFixed(0)} kg of WCO. Expected biodiesel output: {biodieselProducedKg.toFixed(2)} kg. <br />
        Estimated total methanol required: {totalMethanolLiters.toFixed(2)} Liters ({totalMethanolKg.toFixed(2)} kg).
      </div>

      {/* Methanol Inputs */}
      <SelectInput
        label="Methanol-to-Oil Ratio"
        id="methanolToOilRatioKey"
        value={data.methanolToOilRatioKey}
        onChange={(val) => handleChange('methanolToOilRatioKey', val)}
        options={methanolRatioUiOptions}
        tooltip="Select a predefined methanol to oil ratio (molar or mass) or choose custom to input grams of methanol per kg of WCO."
      />
      <InputNumber
        label="Custom Methanol Usage"
        id="customMethanolPerKgWcoGR"
        value={data.customMethanolPerKgWcoGR}
        onChange={(val) => handleChange('customMethanolPerKgWcoGR', val)}
        unit="grams / kg WCO"
        min={0}
        disabled={data.methanolToOilRatioKey !== 'custom_g_per_kg'}
        tooltip="Enter grams of methanol per kg of WCO. Active only if 'Custom' ratio is selected."
      />

      {/* Catalyst Inputs */}
      <SelectInput
        label="Catalyst Type"
        id="catalystType"
        value={data.catalystType}
        onChange={(val) => handleChange('catalystType', val)}
        options={catalystTypeOptions}
        tooltip="Type of catalyst used (e.g., NaOH, KOH)."
      />
      <InputNumber
        label="Catalyst Percentage of WCO"
        id="catalystPercentageWCO"
        value={data.catalystPercentageWCO}
        onChange={(val) => handleChange('catalystPercentageWCO', val)}
        unit="% of WCO mass"
        min={0} max={10} step={0.1}
        tooltip="Amount of catalyst as a percentage of the initial WCO mass (e.g., 1.0 for 1.0%)."
      />

      {/* Other Process Inputs */}
      <InputNumber
        label="Chemicals Transport Distance"
        id="chemicalTransportDistanceKm"
        value={data.chemicalTransportDistanceKm}
        onChange={(val) => handleChange('chemicalTransportDistanceKm', val)}
        unit="km"
        min={0}
        tooltip="Average one-way distance for transporting methanol and catalyst to the production plant."
      />
      <InputNumber
        label="Reaction Temperature"
        id="reactionTemperatureC"
        value={data.reactionTemperatureC}
        onChange={(val) => handleChange('reactionTemperatureC', val)}
        unit="°C"
        min={0} max={100}
        tooltip="Typical temperature for the transesterification reaction."
      />
      <InputNumber
        label="Reaction Time"
        id="reactionTimeHours"
        value={data.reactionTimeHours}
        onChange={(val) => handleChange('reactionTimeHours', val)}
        unit="hours"
        min={0.1} max={24} step={0.1}
        tooltip="Duration of the transesterification reaction."
      />
      <InputNumber
        label="Biodiesel Yield from WCO"
        id="biodieselYieldPercentWCO"
        value={data.biodieselYieldPercentWCO}
        onChange={(val) => handleChange('biodieselYieldPercentWCO', val)}
        unit="% (mass basis)"
        min={70} max={100} step={1}
        tooltip="Percentage of WCO mass converted into biodiesel mass (e.g., 95% means 95kg biodiesel from 100kg WCO)."
      />

      {/* Energy Inputs */}
      <InputNumber
        label="Electricity Consumption"
        id="electricityKwhPerKgBiodiesel"
        value={data.electricityKwhPerKgBiodiesel}
        onChange={(val) => handleChange('electricityKwhPerKgBiodiesel', val)}
        unit="kWh / kg Biodiesel"
        min={0} step={0.01}
        tooltip="Electricity consumed by the plant (mixers, pumps, etc.) per kilogram of biodiesel produced."
      />
      <SelectInput
        label="Electricity Source Type"
        id="electricitySourceType"
        value={data.electricitySourceType}
        onChange={(val) => handleChange('electricitySourceType', val)}
        options={energySourceOptions}
        tooltip="Source of electricity used in the plant."
      />
      <InputNumber
        label="Process Heat Energy"
        id="processHeatKwhPerKgBiodiesel"
        value={data.processHeatKwhPerKgBiodiesel}
        onChange={(val) => handleChange('processHeatKwhPerKgBiodiesel', val)}
        unit="kWh / kg Biodiesel"
        min={0} step={0.01}
        tooltip="Process heat energy required per kilogram of biodiesel produced."
      />
      <SelectInput
        label="Process Heat Source Type"
        id="heatSourceType"
        value={data.heatSourceType}
        onChange={(val) => handleChange('heatSourceType', val)}
        options={heatSourceOptions}
        tooltip="Source of energy for process heat."
      />
    </div>
  );
};

export default ProductionForm;
