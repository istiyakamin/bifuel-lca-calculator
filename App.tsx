
import React, { useState, useEffect, useCallback } from 'react';
import { LcaInputs, LcaResults, FunctionalUnit, LcaStage, FeedstockCollectionInputs, WcoTransportationInputs, BiodieselProductionInputs, BiodieselDistributionInputs, UsePhaseInputs } from './types';
import { DEFAULT_LCA_INPUTS, BIODIESEL_DENSITY_KG_L, BIODIESEL_ENERGY_DENSITY_MJ_KG } from './constants';
import { calculateLca } from './services/lcaCalculator';

import FeedstockForm from './components/FeedstockForm';
import WcoTransportationForm from './components/WcoTransportationForm';
import ProductionForm from './components/ProductionForm';
import DistributionForm from './components/DistributionForm';
import UsePhaseForm from './components/UsePhaseForm';
import ResultsDisplay from './components/ResultsDisplay';
// ImpactChart and ContributionChart are now rendered inside ResultsDisplay
import FunctionalUnitSelector from './components/FunctionalUnitSelector';
// ScenarioManager import removed

const App: React.FC = () => {
  const [lcaInputs, setLcaInputs] = useState<LcaInputs>(() => {
    return JSON.parse(JSON.stringify(DEFAULT_LCA_INPUTS)); // Deep copy
  });
  const [lcaResults, setLcaResults] = useState<LcaResults | null>(null);
  const [currentStage, setCurrentStage] = useState<LcaStage>(LcaStage.FEEDSTOCK);
  const [functionalUnit, setFunctionalUnit] = useState<FunctionalUnit>(FunctionalUnit.MJ_ENERGY);

  // Scenario Management State & Handlers Removed

  const handleInputChange = useCallback(<K extends keyof LcaInputs>(stageKey: K, data: LcaInputs[K]) => {
    setLcaInputs(prev => ({ ...prev, [stageKey]: JSON.parse(JSON.stringify(data)) })); // Deep copy data
  }, []);

  const runCalculation = useCallback(() => {
    try {
        const results = calculateLca(lcaInputs, functionalUnit);
        setLcaResults(results);
    } catch (error) {
        console.error("Error during LCA calculation:", error);
        setLcaResults(null); 
    }
  }, [lcaInputs, functionalUnit]);

  useEffect(() => {
    runCalculation();
  }, [runCalculation]);

  const stagesOrder = [
    LcaStage.FEEDSTOCK,
    LcaStage.WCO_TRANSPORT,
    LcaStage.PRODUCTION,
    LcaStage.DISTRIBUTION,
    LcaStage.USE_PHASE,
    LcaStage.RESULTS
  ];

  const getCurrentStageIndex = () => stagesOrder.indexOf(currentStage);

  const goToNextStage = () => {
    const currentIndex = getCurrentStageIndex();
    if (currentIndex < stagesOrder.length - 1) {
      setCurrentStage(stagesOrder[currentIndex + 1]);
    }
  };

  const goToPrevStage = () => {
    const currentIndex = getCurrentStageIndex();
    if (currentIndex > 0) {
      setCurrentStage(stagesOrder[currentIndex - 1]);
    }
  };

  const { 
    feedstockCollection = DEFAULT_LCA_INPUTS.feedstockCollection, 
    biodieselProduction = DEFAULT_LCA_INPUTS.biodieselProduction 
  } = lcaInputs || {}; 

  const wcoInputKg = feedstockCollection.wcoCollectedKg;
  const biodieselYieldPercent = biodieselProduction.biodieselYieldPercentWCO;
  const biodieselProducedKg = wcoInputKg * (biodieselYieldPercent / 100);
  const totalBiodieselLiters = biodieselProducedKg > 0 ? biodieselProducedKg / BIODIESEL_DENSITY_KG_L : 0;
  const totalBiodieselMJ = biodieselProducedKg > 0 ? biodieselProducedKg * BIODIESEL_ENERGY_DENSITY_MJ_KG : 0;


  const renderStageContent = () => {
    switch (currentStage) {
      case LcaStage.FEEDSTOCK:
        return <FeedstockForm data={feedstockCollection} onChange={data => handleInputChange('feedstockCollection', data as FeedstockCollectionInputs)} />;
      case LcaStage.WCO_TRANSPORT:
        return <WcoTransportationForm data={lcaInputs.wcoTransportation} wcoAmountKg={feedstockCollection.wcoCollectedKg} onChange={data => handleInputChange('wcoTransportation', data as WcoTransportationInputs)} />;
      case LcaStage.PRODUCTION:
        return <ProductionForm data={biodieselProduction} wcoAmountKg={feedstockCollection.wcoCollectedKg} onChange={data => handleInputChange('biodieselProduction', data as BiodieselProductionInputs)} />;
      case LcaStage.DISTRIBUTION:
        return <DistributionForm data={lcaInputs.biodieselDistribution} onChange={data => handleInputChange('biodieselDistribution', data as BiodieselDistributionInputs)} />;
      case LcaStage.USE_PHASE:
        return <UsePhaseForm 
                  data={lcaInputs.usePhase} 
                  totalBiodieselMJ={totalBiodieselMJ}
                  totalBiodieselL={totalBiodieselLiters}
                  onChange={data => handleInputChange('usePhase', data as UsePhaseInputs)} 
                />;
      case LcaStage.RESULTS:
        return lcaResults ? (
          <ResultsDisplay 
              results={lcaResults} 
              lcaInputs={lcaInputs}
          />
        ) : <div className="text-center py-10 text-gray-500">Calculating results or waiting for inputs... If this persists, check console for errors.</div>;
      default:
        return <p className="text-center py-10 text-gray-500">Select a stage to view or edit inputs.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-emerald-100 text-gray-800 p-2 sm:p-6 flex flex-col items-center selection:bg-lime-300 selection:text-lime-900">
      <header className="w-full max-w-6xl mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-700 tracking-tight">
          WCO Biodiesel LCA Calculator
        </h1>
        <p className="text-base sm:text-lg text-green-600 mt-2">
          Assess environmental impacts of Waste Cooking Oil biodiesel.
        </p>
      </header>

      <main className="w-full max-w-6xl bg-white shadow-2xl rounded-xl p-4 sm:p-6 lg:p-8">
        <nav className="mb-6 sm:mb-8 border-b border-gray-300">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center overflow-x-auto">
            {stagesOrder.map(stageName => (
              <li key={stageName} className="mr-1 sm:mr-2 flex-shrink-0">
                <button
                  onClick={() => setCurrentStage(stageName)}
                  className={`inline-block p-3 sm:p-4 border-b-2 rounded-t-lg transition-colors duration-150 whitespace-nowrap
                    ${currentStage === stageName
                      ? 'text-green-600 border-green-600 active font-semibold'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {stageName}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        {currentStage !== LcaStage.RESULTS && (
            <FunctionalUnitSelector selectedUnit={functionalUnit} onChange={setFunctionalUnit} />
        )}
        
        <div className="transition-opacity duration-300 ease-in-out min-h-[300px]">
          {renderStageContent()}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-300 flex justify-between items-center">
            <button
                onClick={goToPrevStage}
                disabled={getCurrentStageIndex() === 0}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 font-medium"
            >
                Previous
            </button>
            <div className="text-sm text-gray-500 hidden sm:block">
                Stage {getCurrentStageIndex() + 1} of {stagesOrder.length}: {currentStage}
            </div>
            {currentStage !== LcaStage.RESULTS ? (
                 <button
                    onClick={goToNextStage}
                    disabled={getCurrentStageIndex() === stagesOrder.length - 1}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 font-medium shadow-md hover:shadow-lg"
                >
                    Next
                </button>
            ) : (
                 <button
                    onClick={() => setCurrentStage(LcaStage.FEEDSTOCK)} 
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 font-medium shadow-md hover:shadow-lg"
                >
                    Start Over / New Scenario
                </button>
            )}
        </div>
         {/* Scenario Manager UI Removed */}
      </main>
      <footer className="w-full max-w-6xl mt-10 text-center text-xs sm:text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} LCA Calculator. For illustrative and educational purposes only.</p>
        <p>Impact factors are examples. Always verify with scientific literature and LCA databases for accurate assessments.</p>
      </footer>
    </div>
  );
};

export default App;
