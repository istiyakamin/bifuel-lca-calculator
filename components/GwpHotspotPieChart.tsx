
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LcaResults, HotspotStage } from '../types';
import { STAGE_COLORS } from '../constants';

interface GwpHotspotPieChartProps {
  results: LcaResults;
}

const GwpHotspotPieChart: React.FC<GwpHotspotPieChartProps> = ({ results }) => {
  if (!results || !results.hotspotAnalysis) {
    return <p className="text-center text-gray-500 py-4">GWP Hotspot data not available.</p>;
  }

  const { hotspotAnalysis } = results;

  const gwpData = Object.entries(hotspotAnalysis)
    .map(([stageName, impacts]) => ({
      name: stageName as HotspotStage,
      value: impacts.gwp,
    }))
    .filter(item => item.value > 0); // Only show stages with GWP > 0

  if (gwpData.length === 0) {
    return <p className="text-center text-gray-500 py-4">No GWP contributions to display in Pie Chart.</p>;
  }
  
  const totalGwp = gwpData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-xl h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
        GWP Contribution by Stage
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={gwpData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name.substring(0,15)}...: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {gwpData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STAGE_COLORS[entry.name] || '#000000'} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number, name: string) => [`${value.toExponential(3)} kg CO₂-eq (${(value/totalGwp * 100).toFixed(1)}%)`, name]}/>
          <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GwpHotspotPieChart;
