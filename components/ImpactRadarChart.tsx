
import React from 'react';
import { Radar, RadarChart, PolarGrid, Legend, Tooltip, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { LcaResults, ImpactCategoryValues } from '../types';
import { IMPACT_CATEGORIES_META } from '../constants';

interface ImpactRadarChartProps {
  results: LcaResults;
}

const ImpactRadarChart: React.FC<ImpactRadarChartProps> = ({ results }) => {
  if (!results) {
    return <p className="text-center text-gray-500 py-4">Impact data for Radar Chart not available.</p>;
  }

  const { biodieselImpactsPerFu, dieselImpactsPerFu, functionalUnit } = results;

  const categoriesToShow: Array<keyof ImpactCategoryValues> = ['gwp', 'acidification', 'eutrophication', 'particulateMatter', 'humanToxicity'];

  const chartData = categoriesToShow.map(key => {
    const meta = IMPACT_CATEGORIES_META.find(m => m.key === key);
    const dieselValue = dieselImpactsPerFu[key];
    const biodieselValue = biodieselImpactsPerFu[key];

    // Normalize: Diesel = 100%. Biodiesel shown relative.
    // Handle cases where dieselValue is 0 to avoid division by zero or infinite percentages.
    let normalizedBiodiesel = 0;
    if (dieselValue !== 0) {
      normalizedBiodiesel = (biodieselValue / dieselValue) * 100;
    } else if (biodieselValue === 0 && dieselValue === 0) {
      normalizedBiodiesel = 0; // Both zero, so relative is zero impact.
    } else if (biodieselValue !== 0 && dieselValue === 0) {
      normalizedBiodiesel = 200; // Arbitrary high value to show it's worse, if diesel is zero. Cap at 200 for visual.
    }
    
    // Cap normalizedBiodiesel at a max value for better chart readability if it's extremely high
    normalizedBiodiesel = Math.min(normalizedBiodiesel, 200);


    return {
      subject: meta?.shortLabel || key.toUpperCase(),
      A: 100, // Fossil Diesel (normalized to 100)
      B: normalizedBiodiesel, // WCO Biodiesel (normalized)
      fullMark: 200, // Define a max for the axis scale
      biodieselRaw: biodieselValue.toExponential(2),
      dieselRaw: dieselValue.toExponential(2),
      unit: meta?.unit || '',
    };
  });
  
  const fuLabel = functionalUnit.split("Per ")[1].toLowerCase();

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-xl h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
        Relative Impact Profile (vs. Fossil Diesel = 100%)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 20']} tickFormatter={(tick) => `${tick}%`} tickCount={6}/>
          <Radar name="Fossil Diesel" dataKey="A" stroke="#78716C" fill="#78716C" fillOpacity={0.3} />
          <Radar name="WCO Biodiesel" dataKey="B" stroke="#6EE7B7" fill="#6EE7B7" fillOpacity={0.6} />
          <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}}/>
          <Tooltip 
            formatter={(value: number, name: string, props: any) => {
              if (name === "WCO Biodiesel") {
                return [`${value.toFixed(1)}% (Raw: ${props.payload.biodieselRaw} ${props.payload.unit}/${fuLabel})`, name];
              }
              return [`${value.toFixed(1)}% (Raw: ${props.payload.dieselRaw} ${props.payload.unit}/${fuLabel})`, name];
            }}
            labelStyle={{ fontWeight: 'bold' }}
            itemStyle={{ fontSize: '10px'}}
          />
        </RadarChart>
      </ResponsiveContainer>
       <p className="mt-2 text-xs text-center text-gray-500">
        Lower percentages for WCO Biodiesel indicate better relative performance. Impacts normalized per {fuLabel}.
      </p>
    </div>
  );
};

export default ImpactRadarChart;
