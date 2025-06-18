
import React from 'react';
import InputNumber from './InputNumber';
import SelectInput from './SelectInput';
import { WcoTransportationInputs, TransportFuelType } from '../types';

interface WcoTransportationFormProps {
  data: WcoTransportationInputs;
  wcoAmountKg: number; // For context
  onChange: (newData: WcoTransportationInputs) => void;
}

const WcoTransportationForm: React.FC<WcoTransportationFormProps> = ({ data, wcoAmountKg, onChange }) => {
  const handleChange = (field: keyof WcoTransportationInputs, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const fuelTypeOptions = Object.values(TransportFuelType).map(v => ({ value: v, label: v }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h3 className="col-span-1 md:col-span-2 text-lg font-semibold text-green-700 mb-3 border-b pb-2">
        2. WCO Transportation to Plant
      </h3>
      <div className="col-span-1 md:col-span-2 p-2 mb-2 bg-blue-50 text-blue-700 text-sm rounded-md">
        Transporting {wcoAmountKg.toFixed(0)} kg of WCO.
      </div>
      <InputNumber
        label="Transportation Distance"
        id="transportDistanceKm"
        value={data.distanceKm}
        onChange={(val) => handleChange('distanceKm', val)}
        unit="km"
        min={0}
        tooltip="Distance to transport WCO from collection/aggregation point to the biodiesel production facility."
      />
      <SelectInput
        label="Transport Fuel Type"
        id="transportFuelType"
        value={data.fuelType}
        onChange={(val) => handleChange('fuelType', val)}
        options={fuelTypeOptions}
        tooltip="Fuel used by the vehicle transporting WCO to the plant."
      />
    </div>
  );
};

export default WcoTransportationForm;
