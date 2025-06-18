
import React from 'react';

interface InputNumberProps {
  label: string;
  id: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
  disabled?: boolean;
}

const InputNumber: React.FC<InputNumberProps> = ({ label, id, value, onChange, unit, min, max, step, tooltip, disabled = false }) => {
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };
  return (
    <div className="mb-4 relative group">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {unit && <span className="text-xs text-gray-500">({unit})</span>}
      </label>
      <input
        type="number"
        id={id}
        name={id}
        value={value}
        onChange={(e) => {
            const val = e.target.value;
            // Allow empty input for easier editing, treat as 0 or handle in validation
            if (val === '') {
                onChange(0); // Or handle as NaN/undefined if preferred, then validate elsewhere
            } else {
                onChange(parseFloat(val));
            }
        }}
        min={min}
        max={max}
        step={step || 'any'}
        disabled={disabled}
        onFocus={handleFocus}
        className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      {tooltip && (
         <div className="absolute left-0 bottom-full mb-2 w-max max-w-xs px-2 py-1 bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 whitespace-normal break-words">
            {tooltip}
            <svg className="absolute text-gray-700 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
            </svg>
        </div>
      )}
    </div>
  );
};
export default InputNumber;
