
import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LcaResults, ImpactCategoryValues, FunctionalUnit, LcaInputs, HotspotStage, FossilDieselStage } from '../types';
import { METHANOL_RATIO_OPTIONS, IMPACT_CATEGORIES_META } from '../constants'; // Import centralized meta
import BiodieselBlendsTable from './BiodieselBlendsTable';
import SummaryCard from './SummaryCard';
// Import all chart components
import ImpactChart from './ImpactChart';
import ContributionChart from './ContributionChart';
import GwpHotspotPieChart from './GwpHotspotPieChart';
import ImpactRadarChart from './ImpactRadarChart';
import ImpactHeatmapTable from './ImpactHeatmapTable';
import OverallImpactStagesChart from './OverallImpactStagesChart';


interface ResultsDisplayProps {
  results: LcaResults;
  lcaInputs: LcaInputs;
}

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean, className?: string }> = 
  ({ title, children, defaultOpen = false, className = "" }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`mb-4 border border-gray-200 rounded-lg shadow-sm bg-white ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 focus:outline-none rounded-t-lg"
        aria-expanded={isOpen}
      >
        <h3 className="text-md font-semibold text-gray-700">{title}</h3>
        <span className="text-xl text-gray-500 transform transition-transform duration-200">
          {isOpen ? '-' : '+'}
        </span>
      </button>
      {isOpen && <div className="p-4 border-t border-gray-200 text-sm bg-white rounded-b-lg">{children}</div>}
    </div>
  );
};

const ImpactRow: React.FC<{
  label: string;
  categoryKey: keyof ImpactCategoryValues; 
  biodieselImpacts: ImpactCategoryValues;
  dieselImpacts: ImpactCategoryValues;
  unit: string;
  fuLabel?: string; // Made optional
}> = ({ label, categoryKey, biodieselImpacts, dieselImpacts, unit, fuLabel }) => {
  const biodieselValueValid = biodieselImpacts && typeof biodieselImpacts[categoryKey] === 'number';
  const dieselValueValid = dieselImpacts && typeof dieselImpacts[categoryKey] === 'number';

  const biodieselValue = biodieselValueValid ? biodieselImpacts[categoryKey] : 0;
  const dieselValue = dieselValueValid ? dieselImpacts[categoryKey] : 0;
  
  const improvement = dieselValue !== 0 ? ((dieselValue - biodieselValue) / Math.abs(dieselValue)) * 100 : (biodieselValue === 0 ? 0 : -Infinity) ;
  
  const isBetter = biodieselValue < dieselValue;
  let improvementText;
  if (dieselValue === 0 && biodieselValue === 0) {
    improvementText = "0.0% (N/A)";
  } else if (dieselValue === 0 && biodieselValue !== 0) { // Diesel is zero, biodiesel is not
    improvementText = "- (Worse)";
  } else if (!isFinite(improvement)) { // Covers cases like biodiesel is 0 and diesel is not
    improvementText = biodieselValue === 0 ? "100.0% (Better)" : "N/A (vs Zero)";
  } else if (Math.abs(improvement) > 10000) { 
    improvementText = improvement > 0 ? ">10000% (Better)" : "<-10000% (Worse)";
  } else {
     improvementText = `${improvement.toFixed(1)}% ${improvement !== 0 ? (isBetter ? ' (Better)' : ' (Worse)') : ''}`;
  }

  const displayUnit = fuLabel ? `${unit}/${fuLabel}` : unit;

  return (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-lime-50 transition-colors duration-150">
      <td className="py-3 px-2 sm:px-4 font-medium text-gray-700">{label} ({displayUnit})</td>
      <td className="py-3 px-2 sm:px-4 text-right">{biodieselValue.toExponential(3)}</td>
      <td className="py-3 px-2 sm:px-4 text-right">{dieselValue.toExponential(3)}</td>
      <td className={`py-3 px-2 sm:px-4 text-right font-semibold ${improvement > 0 ? 'text-green-600' : improvement < 0 ? 'text-red-600' : 'text-gray-600'}`}>
        {improvementText}
      </td>
    </tr>
  );
};


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
    results, 
    lcaInputs
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);


  if (!results || !lcaInputs) return <p className="text-center text-gray-600 py-10">No results to display. Please complete inputs and ensure calculation is run.</p>;

  const { 
    biodieselImpactsPerFu, 
    dieselImpactsPerFu, 
    functionalUnit, 
    totalBiodieselProducedL, 
    totalEnergyFromBiodieselMJ, 
    notes, 
    hotspotAnalysis, 
    fossilDieselHotspotAnalysis,
    totalBiodieselImpactsBatch,
    dieselImpactsForEquivalentVolume 
  } = results;

  const fuLabel = functionalUnit === FunctionalUnit.MJ_ENERGY ? 'MJ' : 'L';

  const handleJsonExport = () => {
    const dataToExport = {
      lcaInputs,
      lcaResults: results,
      exportedAt: new Date().toISOString(),
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WCO_LCA_Results_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePdfExport = async () => {
    if (!pdfContentRef.current) {
      alert("Error: Content area for PDF not found.");
      return;
    }
    setIsGeneratingPdf(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      let yPos = 20; 

      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("WCO Biodiesel Life Cycle Assessment Report", pdfWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Date Generated: ${new Date().toLocaleDateString()}`, pdfWidth / 2, yPos, { align: 'center' });
      yPos += 12;

      pdf.setFontSize(11);
      pdf.text("Prepared By: LCA Calculator User", 20, yPos);
      yPos += 7;
      pdf.text("Organization: [Placeholder Organization Name]", 20, yPos);
      yPos += 7;
      pdf.text("Contact: [Placeholder Contact Info]", 20, yPos);
      yPos += 15;
      
      pdf.setDrawColor(180, 180, 180);
      pdf.line(20, yPos, pdfWidth - 20, yPos); 
      yPos += 10;

      pdf.setFontSize(10);
      pdf.text("This report summarizes the Life Cycle Assessment (LCA) results for biodiesel produced from Waste Cooking Oil (WCO), based on the inputs provided to the LCA Calculator.", 20, yPos, { maxWidth: pdfWidth - 40 });
      yPos += 15;
      pdf.text("All impact factors and comparison data are illustrative unless specified otherwise.", 20, yPos, { maxWidth: pdfWidth - 40 });

      pdf.addPage(); 
      
      const canvas = await html2canvas(pdfContentRef.current, { 
        scale: 2, 
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const { width: canvasImgWidth, height: canvasImgHeight } = canvas;

      const pageContentWidth = pdfWidth - 20; 
      const pageContentHeight = pdfHeight - 20; 

      const aspectRatio = canvasImgWidth / canvasImgHeight;
      let pdfImgFinalWidth = pageContentWidth;
      let pdfImgFinalHeight = pdfImgFinalWidth / aspectRatio;

      let currentImgPositionYInPdfUnits = 0; 

      if (pdfImgFinalHeight <= pageContentHeight) { 
        pdf.addImage(imgData, 'PNG', 10, 10, pdfImgFinalWidth, pdfImgFinalHeight);
      } else { 
        let remainingCanvasDisplayHeightInPdfUnits = pdfImgFinalHeight;
        let pageCountForCanvas = 0;

        while (remainingCanvasDisplayHeightInPdfUnits > 0) {
          if (pageCountForCanvas > 0) {
            pdf.addPage();
          }
          pdf.addImage(imgData, 'PNG', 10, currentImgPositionYInPdfUnits + 10, pdfImgFinalWidth, pdfImgFinalHeight);
          
          remainingCanvasDisplayHeightInPdfUnits -= pageContentHeight;
          currentImgPositionYInPdfUnits -= pageContentHeight; 
          pageCountForCanvas++;
        }
      }
      
      const totalPages = pdf.internal.pages.length;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "italic");
        pdf.text(`Page ${i} of ${totalPages}`, pdfWidth - 25, pdfHeight - 7);
      }
      
      pdf.save(`WCO_LCA_Report_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };


  const getMethanolUsageSummary = () => {
    const prodInputs = lcaInputs.biodieselProduction;
    let actualMethanolPerKgWcoGR = 0;
    if (prodInputs.methanolToOilRatioKey === 'custom_g_per_kg') {
      actualMethanolPerKgWcoGR = prodInputs.customMethanolPerKgWcoGR;
    } else {
      const selectedRatio = METHANOL_RATIO_OPTIONS.find(opt => opt.key === prodInputs.methanolToOilRatioKey);
      actualMethanolPerKgWcoGR = selectedRatio?.valueGramsPerKgWCO || 0;
    }
    const totalMethanolKg = (actualMethanolPerKgWcoGR / 1000) * lcaInputs.feedstockCollection.wcoCollectedKg;
    const divisor = functionalUnit === FunctionalUnit.MJ_ENERGY ? totalEnergyFromBiodieselMJ : totalBiodieselProducedL;
    if (divisor > 0) {
      const methanolPerFu = totalMethanolKg / divisor;
      return `${methanolPerFu.toFixed(3)} kg/${fuLabel}`;
    }
    return `${totalMethanolKg.toFixed(2)} kg total (FU undefined)`;
  };
  
  const gwpImprovement = dieselImpactsPerFu.gwp !== 0 ? ((dieselImpactsPerFu.gwp - biodieselImpactsPerFu.gwp) / Math.abs(dieselImpactsPerFu.gwp)) * 100 : (biodieselImpactsPerFu.gwp === 0 ? 0 : -Infinity);
  let gwpTrend: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (gwpImprovement > 0) gwpTrend = 'positive';
  else if (gwpImprovement < 0) gwpTrend = 'negative';


  return (
    <div className="mt-6 p-2 sm:p-4 bg-gray-50 shadow-inner rounded-lg space-y-6 sm:space-y-8">
      <div ref={pdfContentRef} className="bg-gray-50">
        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">LCA Results Dashboard</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <SummaryCard 
              title={`WCO Biodiesel GWP / ${fuLabel}`}
              value={biodieselImpactsPerFu.gwp.toExponential(3)}
              unit={`kg CO₂-eq/${fuLabel}`}
              description="Global Warming Potential"
          />
          <SummaryCard 
              title="GWP Reduction vs Diesel"
              value={isFinite(gwpImprovement) ? gwpImprovement.toFixed(1) : "N/A"}
              unit="%"
              description={gwpTrend === 'positive' ? 'Lower GWP is better' : gwpTrend === 'negative' ? 'Higher GWP is worse' : 'Compared to Fossil Diesel'}
              trend={gwpTrend}
          />
          <SummaryCard 
              title="Total Biodiesel Produced"
              value={totalBiodieselProducedL.toFixed(2)}
              unit="Liters"
              description={`From ${lcaInputs.feedstockCollection.wcoCollectedKg} kg WCO`}
          />
          <SummaryCard 
              title="Total Energy Content"
              value={totalEnergyFromBiodieselMJ.toFixed(2)}
              unit="MJ"
              description={`${(totalEnergyFromBiodieselMJ / (totalBiodieselProducedL || 1)).toFixed(2)} MJ/L`}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6">
          <div className="lg:col-span-2"> 
            <div className="p-4 sm:p-6 bg-white shadow-xl rounded-lg h-full">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center sm:text-left">Environmental Impact Comparison (per {fuLabel})</h3>
              <div className="overflow-x-auto rounded-md shadow-sm border border-gray-200">
                <table className="min-w-full table-auto text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="py-3 px-2 sm:px-4 text-left font-semibold text-gray-600">Impact Category</th>
                      <th className="py-3 px-2 sm:px-4 text-right font-semibold text-gray-600">WCO Biodiesel</th>
                      <th className="py-3 px-2 sm:px-4 text-right font-semibold text-gray-600">Fossil Diesel</th>
                      <th className="py-3 px-2 sm:px-4 text-right font-semibold text-gray-600">% Improvement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {IMPACT_CATEGORIES_META.map(cat => (
                      <ImpactRow 
                        key={cat.key} 
                        label={cat.label} 
                        categoryKey={cat.key}
                        biodieselImpacts={biodieselImpactsPerFu} 
                        dieselImpacts={dieselImpactsPerFu} 
                        unit={cat.unit} 
                        fuLabel={fuLabel} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1"> 
            <GwpHotspotPieChart results={results} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6">
          <ImpactChart results={results} />
          <ImpactRadarChart results={results} />
        </div>
        
        <div className="w-full mt-6">
            <OverallImpactStagesChart results={results} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6">
          <ContributionChart results={results} />
          <ImpactHeatmapTable results={results} />
        </div>
      </div> 

      <CollapsibleSection 
        title={`Impact Comparison (Total for Batch - ${totalBiodieselProducedL.toFixed(2)} Liters)`} 
        defaultOpen={false} 
        className="bg-white shadow-lg mt-6"
      >
        <div className="overflow-x-auto rounded-md shadow-sm border border-gray-200">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="py-3 px-2 sm:px-4 text-left font-semibold text-gray-600">Impact Category</th>
                <th className="py-3 px-2 sm:px-4 text-right font-semibold text-gray-600">WCO Biodiesel (Total Batch)</th>
                <th className="py-3 px-2 sm:px-4 text-right font-semibold text-gray-600">Fossil Diesel (Equiv. Volume)</th>
                <th className="py-3 px-2 sm:px-4 text-right font-semibold text-gray-600">% Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {totalBiodieselImpactsBatch && dieselImpactsForEquivalentVolume && IMPACT_CATEGORIES_META.map(cat => (
                <ImpactRow 
                  key={`total-${cat.key}`} 
                  label={cat.label} 
                  categoryKey={cat.key}
                  biodieselImpacts={totalBiodieselImpactsBatch} 
                  dieselImpacts={dieselImpactsForEquivalentVolume} 
                  unit={cat.unit} 
                  // fuLabel is omitted here as it's total batch
                />
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Compares total impacts for the entire batch of {totalBiodieselProducedL.toFixed(2)} L WCO biodiesel produced against an equivalent volume of fossil diesel.
        </p>
      </CollapsibleSection>

       {(hotspotAnalysis || fossilDieselHotspotAnalysis) && (
        <CollapsibleSection title="Hotspot Analysis Details (Stage Contributions)" defaultOpen={false} className="bg-white shadow-lg mt-6">
          <div className="overflow-x-auto">
            <h4 className="text-md font-semibold text-gray-700 mb-2">WCO Biodiesel (Absolute contributions for the batch)</h4>
            {hotspotAnalysis ? (
              <table className="min-w-full table-auto text-xs mb-4">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-2 text-left font-semibold text-gray-600">WCO Stage</th>
                    {IMPACT_CATEGORIES_META.map(cat => (
                       <th key={cat.key} className="py-2 px-2 text-right font-semibold text-gray-600" title={cat.unit}>
                         {cat.shortLabel} ({cat.unit})
                       </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(hotspotAnalysis).map(([stage, stageImpacts]) => (
                    <tr key={stage} className="hover:bg-lime-50">
                      <td className="py-2 px-2 font-medium text-gray-700">{stage}</td>
                      {IMPACT_CATEGORIES_META.map(cat => (
                        <td key={cat.key} className="py-2 px-2 text-right">
                          {(stageImpacts[cat.key] || 0).toExponential(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-xs text-gray-500">No WCO biodiesel hotspot data.</p>}

            <h4 className="text-md font-semibold text-gray-700 mb-2 mt-4">Fossil Diesel (Illustrative contributions per {fuLabel})</h4>
            {fossilDieselHotspotAnalysis ? (
              <table className="min-w-full table-auto text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-2 text-left font-semibold text-gray-600">FD Stage (Illustrative)</th>
                    {IMPACT_CATEGORIES_META.map(cat => (
                       <th key={cat.key} className="py-2 px-2 text-right font-semibold text-gray-600" title={cat.unit}>
                         {cat.shortLabel} ({cat.unit}/{fuLabel})
                       </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(fossilDieselHotspotAnalysis).map(([stage, stageImpacts]) => (
                    <tr key={stage} className="hover:bg-orange-50">
                      <td className="py-2 px-2 font-medium text-gray-700">{stage}</td>
                      {IMPACT_CATEGORIES_META.map(cat => (
                        <td key={cat.key} className="py-2 px-2 text-right">
                          {(stageImpacts[cat.key] || 0).toExponential(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-xs text-gray-500">No fossil diesel hotspot data.</p>}
          </div>
          <p className="mt-2 text-xs text-gray-500">WCO Biodiesel values are absolute for the batch. Fossil Diesel values are illustrative contributions per functional unit, derived from total WTW impacts and predefined percentages.</p>
        </CollapsibleSection>
      )}


      <CollapsibleSection title="Biodiesel Blend GWP Comparison (per MJ Energy)" defaultOpen={false} className="bg-white shadow-lg">
        <BiodieselBlendsTable results={results} />
      </CollapsibleSection>

      <CollapsibleSection title="Input Scenario Summary" className="bg-white shadow-lg">
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>WCO Source: {lcaInputs.feedstockCollection.sourceType}</li>
          <li>WCO Collected: {lcaInputs.feedstockCollection.wcoCollectedKg} kg (FFA: {lcaInputs.feedstockCollection.wcoQualityFFA}%)</li>
          <li>Collection Transport: {lcaInputs.feedstockCollection.collectionDistanceKm} km, {lcaInputs.feedstockCollection.vehicleType}</li>
          <li>WCO Transport to Plant: {lcaInputs.wcoTransportation.distanceKm} km, {lcaInputs.wcoTransportation.fuelType}</li>
          <li>Biodiesel Yield: {lcaInputs.biodieselProduction.biodieselYieldPercentWCO}% of WCO mass</li>
          <li>Methanol Usage: {getMethanolUsageSummary()} (Ratio: {METHANOL_RATIO_OPTIONS.find(o=>o.key === lcaInputs.biodieselProduction.methanolToOilRatioKey)?.label || 'Custom'})</li>
          <li>Catalyst: {lcaInputs.biodieselProduction.catalystPercentageWCO}% {lcaInputs.biodieselProduction.catalystType}</li>
          <li>Production Energy: 
              Electricity: {lcaInputs.biodieselProduction.electricityKwhPerKgBiodiesel} kWh/kg BD ({lcaInputs.biodieselProduction.electricitySourceType}), 
              Heat: {lcaInputs.biodieselProduction.processHeatKwhPerKgBiodiesel} kWh/kg BD ({lcaInputs.biodieselProduction.heatSourceType})
          </li>
          <li>Distribution: {lcaInputs.biodieselDistribution.distanceKm} km, {lcaInputs.biodieselDistribution.fuelType}</li>
          <li>Use Phase Engine: {lcaInputs.usePhase.engineType}</li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="Key Findings & Recommendations (Template)" className="bg-white shadow-lg">
        <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><strong>Overall Performance:</strong> WCO biodiesel shows a significant reduction in Global Warming Potential by approximately {isFinite(gwpImprovement) ? gwpImprovement.toFixed(0) : "N/A"}% compared to fossil diesel per {fuLabel}. Other impact categories should be reviewed individually.</li>
            <li><strong>Hotspots:</strong> Based on the contribution analysis (if available):
                <ul className="list-['-_'] list-inside ml-4">
                    <li>The <strong>{HotspotStage.FEEDSTOCK_SUPPLY_CHAIN}</strong> (WCO collection, transport, and production of chemicals like methanol) is a key contributor to several impacts. Optimizing transport logistics, using cleaner vehicles, and sourcing greener chemicals (e.g., bio-methanol) can reduce this.</li>
                    <li><strong>{HotspotStage.BIODIESEL_PRODUCTION_PLANT}</strong> operations, particularly energy consumption (electricity and heat), contribute significantly. Switching to renewable energy sources for the plant can greatly improve its environmental profile.</li>
                    <li>The <strong>{HotspotStage.BIODIESEL_USE_PHASE}</strong> contributes mainly to categories like Acidification and Eutrophication due to NOx emissions, and Particulate Matter. While biogenic CO2 is neutral, other combustion emissions are important.</li>
                </ul>
            </li>
            <li><strong>Sensitivity:</strong> Consider factors like biodiesel yield, transport distances, and energy sources. Small changes in these can have notable effects on the overall results. (Full sensitivity analysis not yet implemented).</li>
            <li><strong>Recommendations:</strong>
                <ul className="list-['-_'] list-inside ml-4">
                    <li>Prioritize renewable energy for biodiesel production.</li>
                    <li>Optimize transportation routes and vehicle efficiency for WCO collection and biodiesel distribution.</li>
                    <li>Investigate sources of "green" methanol and catalysts if their impact is high.</li>
                    <li>Ensure high biodiesel yield to maximize resource efficiency.</li>
                </ul>
            </li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="Export & Data" className="bg-white shadow-lg">
        <div className="flex flex-wrap gap-2">
            <button 
                onClick={handleJsonExport}
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Download Results (JSON)
            </button>
            <button 
                onClick={handlePdfExport}
                disabled={isGeneratingPdf}
                className={`px-4 py-2 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                            ${isGeneratingPdf 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-red-500 hover:bg-red-600 focus:ring-red-500'}`}
            >
                {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}
            </button>
            <button className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md cursor-not-allowed" title="Excel Export Not Implemented">
                Download Excel (.xlsx) (N/A)
            </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Methodology & Assumptions" className="bg-white shadow-lg">
        <ul className="list-disc list-inside space-y-1 text-gray-600 text-xs">
            <li><strong>Functional Unit:</strong> {functionalUnit}. All results are normalized to this unit.</li>
            <li><strong>LCIA Method Principles:</strong> Calculations are based on common LCA principles, drawing conceptual category examples from methods like ReCiPe Midpoint+ and IPCC GWP100. All impact factors used are illustrative placeholders and should be replaced with specific, verified data from scientific literature or commercial LCA databases (e.g., Ecoinvent, GaBi, USLCI) for accurate assessment.</li>
            <li><strong>Allocation:</strong> 
                System expansion is conceptually applied for WCO (it's a waste, avoiding other disposal). 
                For co-products from biodiesel production (e.g., glycerol), no allocation of burdens away from biodiesel has been performed in this model (conservative approach for biodiesel impacts). This means biodiesel carries the full burden of shared processes.
            </li>
            <li><strong>Data Sources:</strong> User-defined inputs for process parameters. Environmental impact factors (for transport, energy, chemicals) are illustrative placeholders defined within the application. <strong>The fossil diesel comparison values are also predefined illustrative benchmarks (Well-to-Wheel) from the application's constants and are for comparative demonstration only. Its stage breakdown is also illustrative.</strong></li>
            <li><strong>Scope:</strong> "Well-to-Wake" (or "Well-to-Wheel" equivalent) for biodiesel, including feedstock acquisition, transport, production, distribution, and final use (combustion). Fossil diesel comparison is also on a "Well-to-Wheel" basis using the aforementioned benchmarks.</li>
            <li><strong>Limitations:</strong> This calculator provides indicative results. It does not include all possible impact categories (e.g., ozone depletion, resource depletion specifics beyond land/water placeholders). Capital goods (machinery, buildings) impacts are typically excluded in simplified LCAs like this one. Uncertainty analysis is not performed.</li>
        </ul>
      </CollapsibleSection>

       {notes && notes.length > 0 && (
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-xs shadow">
          <h4 className="font-semibold mb-1">Calculation Notes & Warnings:</h4>
          <ul className="list-disc list-inside">
            {notes.map((note, index) => <li key={index}>{note}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;