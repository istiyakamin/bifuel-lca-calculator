import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LcaResults, FunctionalUnit, ImpactCategoryValues } from '../types';
import { IMPACT_CATEGORIES_META } from '../constants'; // Import centralized meta

interface ImpactChartProps {
  results: LcaResults;
}

const ImpactChart: React.FC<ImpactChartProps> = ({ results }) => {
  if (!results) return null;
  
  const getFunctionalUnitLabel = () => {
    return results.functionalUnit === FunctionalUnit.MJ_ENERGY ? 'MJ' : 'L';
  }

  const chartData = IMPACT_CATEGORIES_META
    .map(cat => {
      const biodieselVal = results.biodieselImpactsPerFu?.[cat.key];
      const dieselVal = results.dieselImpactsPerFu?.[cat.key];

      return {
        name: cat.shortLabel, 
        Biodiesel: typeof biodieselVal === 'number' ? parseFloat(biodieselVal.toExponential(3)) : 0,
        'Fossil Diesel': typeof dieselVal === 'number' ? parseFloat(dieselVal.toExponential(3)) : 0,
        unit: cat.unit,
        fullLabel: cat.label,
      };
    });

  const fuLabel = getFunctionalUnitLabel();

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-xl h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-700 mb-6 text-center">
        Impact Comparison (per {fuLabel})
      </h3>
      <ResponsiveContainer width="100%" height={300}> 
        <BarChart
          data={chartData}
          margin={{
            top: 5, right: 10, left: 35, bottom: 70, 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="name" 
            angle={-40} 
            textAnchor="end" 
            height={80} 
            interval={0} 
            tick={{fontSize: 10, fill: '#4A5568'}} 
           />
          <YAxis 
            tickFormatter={(tick) => tick.toExponential(1)} 
            label={{ 
                value: `Impact / ${fuLabel}`, 
                angle: -90, 
                position: 'insideLeft', 
                offset: -30, 
                style: {textAnchor: 'middle', fontSize: '12px', fill: '#374151'}
            }}
            tick={{fontSize: 10, fill: '#4A5568'}}
            width={80} 
            />
          <Tooltip 
            formatter={(value: number, name: string, props: any) => [`${value.toExponential(3)} ${props.payload.unit}/${fuLabel}`, name]}
            labelFormatter={(label, payload) => payload?.[0]?.payload?.fullLabel || label} 
            labelStyle={{ fontWeight: 'bold', color: '#1F2937' }} 
            itemStyle={{ color: '#374151', fontSize: '10px' }} 
            contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '8px', 
                boxShadow: '0 3px 15px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb' 
            }}
          />
          <Legend wrapperStyle={{paddingTop: '20px', paddingBottom: '10px', fontSize: "12px"}}/>
          <Bar dataKey="Biodiesel" fill="#6EE7B7" radius={[4, 4, 0, 0]} maxBarSize={20} /> 
          <Bar dataKey="'Fossil Diesel'" fill="#78716C" radius={[4, 4, 0, 0]} maxBarSize={20} /> 
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ImpactChart;