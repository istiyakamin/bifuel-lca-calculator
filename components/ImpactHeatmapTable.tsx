
import React from 'react';
import { LcaResults, HotspotStage, ImpactCategoryValues } from '../types';
import { IMPACT_CATEGORIES_META, STAGE_COLORS } from '../constants'; // Assuming STAGE_COLORS is not directly used for heatmap cell color but for potential legend.

interface ImpactHeatmapTableProps {
  results: LcaResults;
}

const ImpactHeatmapTable: React.FC<ImpactHeatmapTableProps> = ({ results }) => {
  if (!results || !results.hotspotAnalysis) {
    return <p className="text-center text-gray-500 py-4">Hotspot data for Heatmap not available.</p>;
  }

  const { hotspotAnalysis } = results;
  const stages = Object.keys(hotspotAnalysis) as HotspotStage[];

  // Calculate total impact for each category (sum of all stages for that category)
  const totalsPerCategory: Partial<ImpactCategoryValues> = {};
  IMPACT_CATEGORIES_META.forEach(catMeta => {
    totalsPerCategory[catMeta.key] = stages.reduce((sum, stage) => sum + (hotspotAnalysis[stage]?.[catMeta.key] || 0), 0);
  });

  const getCellColor = (percentage: number) => {
    if (percentage <= 0) return 'bg-green-50';
    if (percentage < 10) return 'bg-yellow-100';
    if (percentage < 25) return 'bg-yellow-300';
    if (percentage < 50) return 'bg-orange-400';
    if (percentage < 75) return 'bg-red-500 text-white';
    return 'bg-red-700 text-white';
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-xl overflow-x-auto">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
        Impact Contribution Heatmap (%)
      </h3>
      <table className="min-w-full table-fixed text-xs sm:text-sm border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-1 sm:px-2 border border-gray-300 w-1/4 font-semibold text-gray-600">Impact Category</th>
            {stages.map(stage => (
              <th key={stage} className="py-2 px-1 sm:px-2 border border-gray-300 font-semibold text-gray-600 truncate" title={stage}>
                {stage.replace('Biodiesel ', '').replace(' Operations','').replace('Supply Chain', 'Supply').substring(0,10)}...
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {IMPACT_CATEGORIES_META.map(catMeta => {
            const totalForThisCategory = totalsPerCategory[catMeta.key] || 0;
            return (
              <tr key={catMeta.key} className="hover:bg-gray-50">
                <td className="py-2 px-1 sm:px-2 border border-gray-300 font-medium text-gray-700" title={catMeta.label}>{catMeta.shortLabel}</td>
                {stages.map(stage => {
                  const stageImpactValue = hotspotAnalysis[stage]?.[catMeta.key] || 0;
                  const percentage = totalForThisCategory > 0 ? (stageImpactValue / totalForThisCategory) * 100 : 0;
                  return (
                    <td 
                      key={`${catMeta.key}-${stage}`} 
                      className={`py-2 px-1 sm:px-2 border border-gray-300 text-center font-medium ${getCellColor(percentage)}`}
                      title={`${stageImpactValue.toExponential(2)} ${catMeta.unit} (${percentage.toFixed(1)}%)`}
                    >
                      {percentage.toFixed(1)}%
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-center text-gray-500">
        Cell color indicates the percentage contribution of each life cycle stage (column) to the total impact for that category (row) for WCO biodiesel.
      </p>
    </div>
  );
};

export default ImpactHeatmapTable;
