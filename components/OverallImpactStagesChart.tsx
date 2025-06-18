
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LcaResults, HotspotStage, FossilDieselStage, ImpactCategoryValues } from '../types';
import { IMPACT_CATEGORIES_META, STAGE_COLORS, FOSSIL_DIESEL_STAGE_COLORS } from '../constants';

interface OverallImpactStagesChartProps {
  results: LcaResults;
}

const OverallImpactStagesChart: React.FC<OverallImpactStagesChartProps> = ({ results }) => {
  if (!results || (!results.hotspotAnalysis && !results.fossilDieselHotspotAnalysis)) {
    return <p className="text-center text-gray-500 py-4">Hotspot data for Overall Impact Stages Chart not available.</p>;
  }

  const { hotspotAnalysis, fossilDieselHotspotAnalysis, functionalUnit } = results;

  const chartData = IMPACT_CATEGORIES_META.map(catMeta => {
    const dataPoint: { name: string; [key: string]: number | string } = { 
      name: catMeta.shortLabel 
    };

    // WCO Biodiesel contributions (absolute for the batch)
    if (hotspotAnalysis) {
      Object.values(HotspotStage).forEach(stage => {
        dataPoint[`WCO_${stage}`] = (hotspotAnalysis[stage]?.[catMeta.key] || 0);
      });
    }

    // Fossil Diesel illustrative contributions (per functional unit)
    if (fossilDieselHotspotAnalysis) {
      Object.values(FossilDieselStage).forEach(stage => {
        dataPoint[`FD_${stage}`] = (fossilDieselHotspotAnalysis[stage]?.[catMeta.key] || 0);
      });
    }
    return dataPoint;
  });
  
  const hasWCOData = hotspotAnalysis && chartData.some(d => 
    Object.values(HotspotStage).some(stage => (d[`WCO_${stage}`] || 0) !== 0)
  );
  const hasFDData = fossilDieselHotspotAnalysis && chartData.some(d => 
    Object.values(FossilDieselStage).some(stage => (d[`FD_${stage}`] || 0) !== 0)
  );

  if (!hasWCOData && !hasFDData) {
     return <p className="text-center text-gray-500 py-4">No significant impact contributions to display in Overall Stages Chart.</p>;
  }
  
  const fuLabel = functionalUnit.split("Per ")[1]?.toLowerCase() || "unit";

  // Filter legend items based on available data
  const legendPayload = [];
  if (hasWCOData) {
    legendPayload.push(...Object.values(HotspotStage).map(stage => ({ value: `WCO: ${stage.substring(0,15)}...`, type: 'square', id: `WCO_${stage}`, color: STAGE_COLORS[stage] })));
  }
  if (hasFDData) {
    legendPayload.push(...Object.values(FossilDieselStage).map(stage => ({ value: `FD: ${stage.substring(0,15)}...`, type: 'square', id: `FD_${stage}`, color: FOSSIL_DIESEL_STAGE_COLORS[stage] })));
  }


  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-xl h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
        Total Impact Contribution by Stage (WCO vs. Illustrative FD)
      </h3>
      <ResponsiveContainer width="100%" height={450}> 
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 25, bottom: 80 }} 
          barGap={4} // Gap between bars of the same category (WCO vs FD bar groups)
          barCategoryGap="25%" // Gap between different impact category groups
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={90} // Increased height for angled labels
            interval={0}
            tick={{ fontSize: 10, fill: '#4A5568' }}
          />
          <YAxis 
            tickFormatter={(tick) => tick.toExponential(1)}
            label={{ value: `Total Impact (various units)`, angle: -90, position: 'insideLeft', offset: -20, style: {textAnchor: 'middle', fontSize: '12px', fill: '#374151'} }}
            tick={{ fontSize: 10, fill: '#4A5568' }}
            width={80} // Increased width for Y-axis label and ticks
          />
          <Tooltip
            formatter={(value: number, name: string, props: any) => {
                 const impactCat = IMPACT_CATEGORIES_META.find(c => c.shortLabel === props.payload.name);
                 let stageName = name.replace('WCO_', '').replace('FD_', '');
                 if (stageName.length > 20) stageName = stageName.substring(0,18) + "...";
                 const prefix = name.startsWith('WCO_') ? 'WCO ' : 'FD ';
                 return [`${value.toExponential(3)} ${impactCat?.unit || ''}`, `${prefix}${stageName}`];
            }}
            labelStyle={{ fontWeight: 'bold' }}
            itemStyle={{ fontSize: '10px'}}
          />
          <Legend wrapperStyle={{paddingTop: "15px", fontSize: "10px"}} payload={legendPayload}/>
          
          {/* WCO Biodiesel Bars */}
          {hasWCOData && Object.values(HotspotStage).map((stage) => (
            <Bar key={`WCO_${stage}`} dataKey={`WCO_${stage}`} stackId="wco" fill={STAGE_COLORS[stage]} maxBarSize={30} />
          ))}

          {/* Fossil Diesel Bars */}
          {hasFDData && Object.values(FossilDieselStage).map((stage) => (
            <Bar key={`FD_${stage}`} dataKey={`FD_${stage}`} stackId="fd" fill={FOSSIL_DIESEL_STAGE_COLORS[stage]} maxBarSize={30} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-xs text-center text-gray-500">
        Compares WCO Biodiesel total batch impacts (stacked bar on left for each category) vs. illustrative Fossil Diesel impacts per {fuLabel} (stacked bar on right). Units vary by impact category.
      </p>
    </div>
  );
};

export default OverallImpactStagesChart;
