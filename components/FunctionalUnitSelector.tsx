
import React from 'react';
import { FunctionalUnit } from '../types';

interface FunctionalUnitSelectorProps {
  selectedUnit: FunctionalUnit;
  onChange: (unit: FunctionalUnit) => void;
}

const FunctionalUnitSelector: React.FC<FunctionalUnitSelectorProps> = ({ selectedUnit, onChange }) => {
  const units = [
    { value: FunctionalUnit.MJ_ENERGY, label: 'Per MJ Energy Delivered' },
    { value: FunctionalUnit.L_BIODIESEL, label: 'Per Liter Biodiesel' },
  ];

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-lime-50 shadow">
      <label htmlFor="functional-unit" className="block text-md font-semibold text-gray-800 mb-2">
        Functional Unit:
      </label>
      <select
        id="functional-unit"
        value={selectedUnit}
        onChange={(e) => onChange(e.target.value as FunctionalUnit)}
        className="w-full sm:w-auto mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md bg-white shadow-sm"
      >
        {units.map(unit => (
          <option key={unit.value} value={unit.value}>
            {unit.label}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs text-gray-500">
        All impact results will be normalized to this selected unit.
      </p>
    </div>
  );
};

export default FunctionalUnitSelector;
