
import React from 'react';

interface SelectInputProps<T extends string | number> {
  label: string;
  id: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  tooltip?: string;
  disabled?: boolean;
}

const SelectInput = <T extends string | number,>(
  { label, id, value, onChange, options, tooltip, disabled = false }: SelectInputProps<T>
): React.ReactElement => {
  return (
    <div className="mb-4 relative group">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md bg-white shadow-sm ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      >
        {options.map(option => (
          <option key={option.value.toString()} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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

export default SelectInput;
