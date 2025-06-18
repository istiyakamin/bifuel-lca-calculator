import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  trend?: 'positive' | 'negative' | 'neutral' | 'none'; // 'none' for no specific color styling based on trend
  isLoading?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  unit, 
  description, 
  trend = 'none',
  isLoading = false 
}) => {
  
  let valueColorClass = 'text-gray-800';
  if (trend === 'positive') {
    valueColorClass = 'text-green-600';
  } else if (trend === 'negative') {
    valueColorClass = 'text-red-600';
  }

  return (
    <div className="bg-white p-4 sm:p-5 shadow-lg rounded-xl border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-sm sm:text-md font-semibold text-gray-500 truncate" title={title}>
        {title}
      </h3>
      {isLoading ? (
        <div className="mt-1 h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
      ) : (
        <p className={`text-2xl sm:text-3xl font-bold mt-1 ${valueColorClass}`}>
          {value} {unit && <span className="text-lg sm:text-xl font-medium text-gray-500">{unit}</span>}
        </p>
      )}
      {description && !isLoading && (
        <p className="text-xs text-gray-400 mt-1 truncate" title={description}>
          {description}
        </p>
      )}
    </div>
  );
};

export default SummaryCard;
