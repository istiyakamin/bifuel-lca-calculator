
import React from 'react';
import { LcaResults, FunctionalUnit } from '../types';
import { BIODIESEL_BLEND_LEVELS } from '../constants';

interface BiodieselBlendsTableProps {
  results: LcaResults;
}

const BiodieselBlendsTable: React.FC<BiodieselBlendsTableProps> = ({ results }) => {
  if (!results || results.functionalUnit !== FunctionalUnit.MJ_ENERGY) {
    return (
      <div className="mt-4 p-4 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md text-sm">
        Biodiesel blend GWP comparison is available when the functional unit is set to '{FunctionalUnit.MJ_ENERGY}'.
      </div>
    );
  }

  const gwpBiodieselPerMj = results.biodieselImpactsPerFu.gwp;
  const gwpFossilDieselPerMj = results.dieselImpactsPerFu.gwp;

  // For color scaling: min is B100 (or close to it), max is B0
  const minGwp = Math.min(...BIODIESEL_BLEND_LEVELS.map(blend => 
    (blend.biodieselPercent / 100) * gwpBiodieselPerMj + (blend.fossilDieselPercent / 100) * gwpFossilDieselPerMj
  ));
  const maxGwp = Math.max(...BIODIESEL_BLEND_LEVELS.map(blend => 
    (blend.biodieselPercent / 100) * gwpBiodieselPerMj + (blend.fossilDieselPercent / 100) * gwpFossilDieselPerMj
  ));
  
  const getBackgroundColor = (gwpValue: number) => {
    if (maxGwp === minGwp) return 'bg-green-100'; // Avoid division by zero if all values are same

    const percentage = (gwpValue - minGwp) / (maxGwp - minGwp); // Normalized 0 (best) to 1 (worst)
    
    // Interpolate between green (good) and orange/yellow (bad)
    // Using HSL: Green is ~120 hue, Yellow ~60, Orange ~30. We want to go from Green towards Yellow/Orange.
    const hue = 120 - (percentage * 80); // Scale from 120 (green) down to 40 (orange-yellow)
    const saturation = 70; // Keep saturation somewhat vibrant
    const lightness = 65 + (percentage * 10); // Lighter for lower GWP, slightly darker for higher
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };


  return (
    <div className="overflow-x-auto rounded-md shadow-sm border border-gray-200">
      <table className="min-w-full table-auto text-sm">
        <thead className="bg-gray-100 sticky top-0">
          <tr>
            <th className="py-3 px-2 sm:px-4 text-left font-semibold text-gray-600">Blend</th>
            <th className="py-3 px-2 sm:px-4 text-left font-semibold text-gray-600">Portions</th>
            <th className="py-3 px-2 sm:px-4 text-left font-semibold text-gray-600">Calculation (GWP contributions)</th>
            <th className="py-3 px-2 sm:px-4 text-left font-semibold text-gray-600">
              Blended Emissions <span className="font-normal text-xs">(kg CO₂-eq/MJ)</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {BIODIESEL_BLEND_LEVELS.map((blend) => {
            const pBio = blend.biodieselPercent / 100;
            const pFos = blend.fossilDieselPercent / 100;

            const bioContribution = pBio * gwpBiodieselPerMj;
            const fosContribution = pFos * gwpFossilDieselPerMj;
            const blendedGwp = bioContribution + fosContribution;

            const calcString = `=(${pBio.toFixed(2)} × ${gwpBiodieselPerMj.toExponential(3)}) + (${pFos.toFixed(2)} × ${gwpFossilDieselPerMj.toExponential(3)})`;
            const resultString = `=${bioContribution.toExponential(3)} + ${fosContribution.toExponential(3)} = ${blendedGwp.toExponential(3)}`;
            
            return (
              <tr key={blend.name} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="py-3 px-2 sm:px-4 font-medium text-gray-700">{blend.name}</td>
                <td className="py-3 px-2 sm:px-4 text-gray-600">
                  {blend.biodieselPercent}% Biodiesel, {blend.fossilDieselPercent}% Fossil Diesel
                </td>
                <td className="py-3 px-2 sm:px-4 text-gray-600 text-xs">
                  <div>{calcString}</div>
                  <div>{resultString}</div>
                </td>
                <td 
                  className="py-3 px-2 sm:px-4 font-semibold"
                  style={{ backgroundColor: getBackgroundColor(blendedGwp) }}
                >
                  {blendedGwp.toExponential(3)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="p-2 text-xs text-gray-500">
        GWP values for 100% WCO Biodiesel ({gwpBiodieselPerMj.toExponential(3)} kg CO₂-eq/MJ) and 100% Fossil Diesel ({gwpFossilDieselPerMj.toExponential(3)} kg CO₂-eq/MJ) are based on the current scenario and predefined constants.
      </p>
    </div>
  );
};

export default BiodieselBlendsTable;
