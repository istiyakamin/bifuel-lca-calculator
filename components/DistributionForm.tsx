
import React from 'react';
import InputNumber from './InputNumber';
import SelectInput from './SelectInput';
import { BiodieselDistributionInputs, TransportFuelType } from '../types';

interface DistributionFormProps {
  data: BiodieselDistributionInputs;
  // biodieselAmountL: number; // For context
  onChange: (newData: BiodieselDistributionInputs) => void;
}

const DistributionForm: React.FC<DistributionFormProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof BiodieselDistributionInputs, value: any) => {
    onChange({ ...data, [field]: value });
  };
  
  const fuelTypeOptions = Object.values(TransportFuelType).map(v => ({ value: v, label: v }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h3 className="col-span-1 md:col-span-2 text-lg font-semibold text-green-700 mb-3 border-b pb-2">
        4. Biodiesel Distribution
      </h3>
      {/* 
      <div className="col-span-1 md:col-span-2 p-2 mb-2 bg-purple-50 text-purple-700 text-sm rounded-md">
        Distributing approximately {biodieselAmountL.toFixed(2)} L of biodiesel.
      </div> 
      This biodieselAmountL would need to be passed down if desired here. 
      For now, the calculator service handles using the produced amount.
      */}
      <InputNumber
        label="Average Distribution Distance"
        id="distributionDistanceKm"
        value={data.distanceKm}
        onChange={(val) => handleChange('distanceKm', val)}
        unit="km"
        min={0}
        tooltip="Average distance the produced biodiesel is transported to reach the end-user or fueling station."
      />
      <SelectInput
        label="Distribution Fuel Type"
        id="distributionFuelType"
        value={data.fuelType}
        onChange={(val) => handleChange('fuelType', val)}
        options={fuelTypeOptions}
        tooltip="Fuel used by the vehicle distributing the final biodiesel product."
      />
    </div>
  );
};

export default DistributionForm;
