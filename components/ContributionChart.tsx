
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LcaResults, ImpactCategoryValues, HotspotStage, FunctionalUnit } from '../types';
import { IMPACT_CATEGORIES_META, STAGE_COLORS } from '../constants'; // Import centralized constants

interface ContributionChartProps {
  results: LcaResults;
}

const ContributionChart: React.FC<ContributionChartProps> = ({ results }) => {
  const [selectedImpactKey, setSelectedImpactKey] = useState<keyof ImpactCategoryValues>('gwp');

  if (!results || !results.hotspotAnalysis) {
    return <p className="text-center text-gray-500 py-4">Hotspot analysis data not available.</p>;
  }

  const { hotspotAnalysis, functionalUnit } = results;

  const chartData = useMemo(() => {
    if (!hotspotAnalysis) return [];

    const totalImpactForSelectedCategory = Object.values(hotspotAnalysis).reduce(
      (sum, stageImpacts) => sum + (stageImpacts[selectedImpactKey] || 0),
      0
    );

    const selectedCategoryMeta = IMPACT_CATEGORIES_META.find(c => c.key === selectedImpactKey);
    const dataPointName = selectedCategoryMeta?.label || selectedImpactKey.toUpperCase();

    if (totalImpactForSelectedCategory === 0) return [{ name: dataPointName }]; 

    const dataPoint: { name: string; [key: string]: number | string } = {
      name: dataPointName,
    };

    Object.entries(hotspotAnalysis).forEach(([stageName, stageImpacts]) => {
      const stageValue = stageImpacts[selectedImpactKey] || 0;
      const percentage = (stageValue / totalImpactForSelectedCategory) * 100;
      dataPoint[stageName] = parseFloat(percentage.toFixed(1)); 
    });
    
    return [dataPoint];
  }, [hotspotAnalysis, selectedImpactKey]);
  
  const fuLabel = functionalUnit === FunctionalUnit.MJ_ENERGY ? 'MJ' : 'L';
  const selectedCategoryMeta = IMPACT_CATEGORIES_META.find(c => c.key === selectedImpactKey);

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-xl h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2 sm:mb-0 text-center sm:text-left">
          % Contribution by Stage
        </h3>
        <div className="flex items-center">
          <label htmlFor="impact-category-selector-contrib" className="mr-2 text-xs font-medium text-gray-700 whitespace-nowrap">Impact:</label>
          <select
            id="impact-category-selector-contrib"
            value={selectedImpactKey}
            onChange={(e) => setSelectedImpactKey(e.target.value as keyof ImpactCategoryValues)}
            className="block pl-2 pr-7 py-1 text-xs border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 rounded-md bg-white shadow-sm"
          >
            {IMPACT_CATEGORIES_META.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {chartData.length > 0 && Object.keys(chartData[0]).length > 1 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            layout="vertical" 
            data={chartData}
            margin={{ top: 5, right: 20, left: 120, bottom: 5 }} 
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} label={{ value: 'Contribution (%)', position: 'insideBottom', offset: -2, style: {fontSize: '10px', fill: '#374151'} }} tick={{fontSize: 10}}/>
            <YAxis type="category" dataKey="name" width={120} tick={{fontSize: 10, fill: '#4A5568'}}/>
            <Tooltip
              formatter={(value: number, name: string) => [`${value}% of total ${selectedCategoryMeta?.shortLabel || ''}`, name.length > 25 ? name.substring(0,22) + "..." : name]}
              labelStyle={{ fontWeight: 'bold', color: '#1F2937', fontSize: '12px' }}
              itemStyle={{ color: '#374151', fontSize: '10px' }}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', boxShadow: '0 3px 15px rgba(0,0,0,0.1)' }}
            />
            <Legend wrapperStyle={{paddingTop: '15px', fontSize: "10px"}}/>
            {Object.values(HotspotStage).map((stage) => (
              <Bar key={stage} dataKey={stage} stackId="a" fill={STAGE_COLORS[stage] || '#000000'} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-gray-500 py-10 text-xs">
            No contribution data for "{selectedCategoryMeta?.label}". Total impact might be zero.
        </p>
      )}
       <p className="mt-2 text-xs text-center text-gray-500">
        Shows % contribution of each stage to total WCO biodiesel impact for {selectedCategoryMeta?.label} ({selectedCategoryMeta?.unit}/{fuLabel}).
      </p>
    </div>
  );
};

export default ContributionChart;
