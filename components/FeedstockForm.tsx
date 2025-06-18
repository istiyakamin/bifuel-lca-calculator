
import React from 'react';
import InputNumber from './InputNumber';
import SelectInput from './SelectInput';
import { FeedstockCollectionInputs, FeedstockSourceType, VehicleType } from '../types';

interface FeedstockFormProps {
  data: FeedstockCollectionInputs;
  onChange: (newData: FeedstockCollectionInputs) => void;
}

const FeedstockForm: React.FC<FeedstockFormProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof FeedstockCollectionInputs, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const sourceTypeOptions = Object.values(FeedstockSourceType).map(v => ({ value: v, label: v }));
  const vehicleTypeOptions = Object.values(VehicleType).map(v => ({ value: v, label: v }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h3 className="col-span-1 md:col-span-2 text-lg font-semibold text-green-700 mb-3 border-b pb-2">
        1. Feedstock Collection Details
      </h3>
      <SelectInput
        label="Source Type of WCO"
        id="sourceType"
        value={data.sourceType}
        onChange={(val) => handleChange('sourceType', val)}
        options={sourceTypeOptions}
        tooltip="Origin of the Waste Cooking Oil (e.g., households, restaurants)."
      />
      <InputNumber
        label="Total WCO Collected"
        id="wcoCollectedKg"
        value={data.wcoCollectedKg}
        onChange={(val) => handleChange('wcoCollectedKg', val)}
        unit="kg"
        min={0}
        step={10}
        tooltip="Total mass of Waste Cooking Oil collected for this assessment batch."
      />
      <InputNumber
        label="Average Collection Distance (Round Trip)"
        id="collectionDistanceKm"
        value={data.collectionDistanceKm}
        onChange={(val) => handleChange('collectionDistanceKm', val)}
        unit="km"
        min={0}
        tooltip="Average round trip distance covered by the collection vehicle per typical collection run or per unit of WCO collected."
      />
      <SelectInput
        label="Collection Vehicle Type"
        id="collectionVehicleType"
        value={data.vehicleType}
        onChange={(val) => handleChange('vehicleType', val)}
        options={vehicleTypeOptions}
        tooltip="Type of vehicle used for collecting WCO."
      />
      <InputNumber
        label="WCO Quality (FFA Content)"
        id="wcoQualityFFA"
        value={data.wcoQualityFFA}
        onChange={(val) => handleChange('wcoQualityFFA', val)}
        unit="%"
        min={0}
        max={100} // FFA can theoretically be up to 100%
        step={0.1}
        tooltip="Free Fatty Acid (FFA) content of the WCO. Higher FFA may require pre-treatment or affect yield."
      />
    </div>
  );
};

export default FeedstockForm;