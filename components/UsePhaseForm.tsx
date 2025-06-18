
import React from 'react';
import SelectInput from './SelectInput';
import { UsePhaseInputs, MarineEngineType } from '../types';

interface UsePhaseFormProps {
  data: UsePhaseInputs;
  totalBiodieselMJ: number; // For context
  totalBiodieselL: number; // For context
  onChange: (newData: UsePhaseInputs) => void;
}

const UsePhaseForm: React.FC<UsePhaseFormProps> = ({ data, totalBiodieselMJ, totalBiodieselL, onChange }) => {
  const handleChange = (field: keyof UsePhaseInputs, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const engineTypeOptions = Object.values(MarineEngineType).map(v => ({ value: v, label: v }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h3 className="col-span-1 md:col-span-2 text-lg font-semibold text-green-700 mb-3 border-b pb-2">
        5. Use Phase (Marine Engine Combustion)
      </h3>
      <div className="col-span-1 md:col-span-2 p-3 mb-3 bg-sky-50 text-sky-700 text-sm rounded-md shadow">
        This stage models the combustion of all produced biodiesel ({totalBiodieselL.toFixed(2)} L / {totalBiodieselMJ.toFixed(2)} MJ)
        in a marine engine. Combustion emissions for biodiesel primarily account for non-CO₂ greenhouse gases (e.g., N₂O, CH₄)
        and other air pollutants. Biogenic CO₂ from waste-derived biodiesel is typically treated as carbon neutral.
      </div>
      <SelectInput
        label="Marine Engine Emission Profile"
        id="marineEngineType"
        value={data.engineType}
        onChange={(val) => handleChange('engineType', val)}
        options={engineTypeOptions}
        tooltip="Select the emission profile representing the marine engine where biodiesel is combusted. This affects combustion-only emissions."
      />
       <div className="col-span-1 md:col-span-2 mt-2 text-xs text-gray-500">
        <p>Note: Emission factors for marine engines are illustrative placeholders. For accurate assessment, use specific data for the engine type and operating conditions.</p>
      </div>
    </div>
  );
};

export default UsePhaseForm;
