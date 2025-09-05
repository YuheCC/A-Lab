import React, { useState } from 'react';
import './PredictionModule.css';

interface SystemSpec {
  cathode: string;
  anode: string;
  electrolyte: string;
  cellDesign: string;
}

const PredictionModule: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState('NCM811 - 12%Si/graphite - Carbonate electrolyte');
  const [additive, setAdditive] = useState('');
  const [showSpecs, setShowSpecs] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'25c' | '45c'>('25c');

  const systemSpecs: Record<string, SystemSpec> = {
    'NCM811 - 12%Si/graphite - Carbonate electrolyte': {
      cathode: 'Polycrystal NCM811, 4 mAh/cm²',
      anode: '12% SiC + Graphite',
      electrolyte: 'Solvent EC/EMC/DEC (2:3:2) + Salt 1M LiPF6/LiFSI + Additive VC/FEC',
      cellDesign: '4/5 layer pouch cell, 1.07 NP ratio, 1 Ah capacity'
    }
  };

  const currentSpec = systemSpecs[selectedSystem];

  const handleCalculate = () => {
    if (!additive.trim()) {
      alert('Please enter SMILES molecular formula');
      return;
    }
    // Show results after calculation
    setShowResults(true);
    console.log('Calculating with:', { selectedSystem, additive });
  };

  const mockResults = {
    '25c': {
      cycleLife: { status: 'POSITIVE', confidence: '98.5%' },
      ce: { status: 'NEGATIVE', confidence: '102.5%' },
      ratePerformance: { status: 'NEGATIVE', confidence: '94.3%' }
    },
    '45c': {
      cycleLife: { status: 'POSITIVE', confidence: '96.8%' },
      ce: { status: 'NEGATIVE', confidence: '92.1%' }
    }
  };

  return (
    <div className="prediction-module">
      <div className="module-section">
        <h2>Battery System Selection</h2>
        
        <div className="form-group">
          <label>Battery System</label>
          <select 
            value={selectedSystem} 
            onChange={(e) => setSelectedSystem(e.target.value)}
            className="system-select"
          >
            <option value="NCM811 - 12%Si/graphite - Carbonate electrolyte">
              NCM811 - 12%Si/graphite - Carbonate electrolyte
            </option>
          </select>
        </div>

        {showSpecs && currentSpec && (
          <div className="system-specs">
            <div className="specs-header">
              <span>System Specifications</span>
              <button 
                className="close-specs"
                onClick={() => setShowSpecs(false)}
              >
                ×
              </button>
            </div>
            
            <div className="specs-grid">
              <div className="spec-item">
                <label>Cathode:</label>
                <span>{currentSpec.cathode}</span>
              </div>
              
              <div className="spec-item">
                <label>Anode:</label>
                <span>{currentSpec.anode}</span>
              </div>
              
              <div className="spec-item">
                <label>Benchmark Electrolyte:</label>
                <span>{currentSpec.electrolyte}</span>
              </div>
              
              <div className="spec-item">
                <label>Cell design:</label>
                <span>{currentSpec.cellDesign}</span>
              </div>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>
            Additive (SMILES) <span className="required">*</span>
          </label>
          <input
            type="text"
            value={additive}
            onChange={(e) => setAdditive(e.target.value)}
            placeholder="Enter SMILES molecular formula"
            className="additive-input"
          />
        </div>

        <button 
          className={`calculate-btn ${showResults ? 'calculated' : ''}`}
          onClick={handleCalculate}
        >
          {showResults ? 'Calculated' : 'Calculate'}
        </button>

        {showResults && (
          <div className="results-section">
            <h2>Cell Performance Prediction</h2>
            
            <div className="temperature-tabs" data-active={activeTab}>
              <button 
                className={`temp-tab ${activeTab === '25c' ? 'active' : ''}`}
                onClick={() => setActiveTab('25c')}
              >
                25°C Performance
              </button>
              <button 
                className={`temp-tab ${activeTab === '45c' ? 'active' : ''}`}
                onClick={() => setActiveTab('45c')}
              >
                45°C Performance
              </button>
            </div>

            <div className="results-content">
              {activeTab === '25c' && (
                <div className="performance-results">
                  <div className="result-item">
                    <div className="result-label">25 °C Cycle life</div>
                    <div className={`result-badge ${mockResults['25c'].cycleLife.status.toLowerCase()}`}>
                      <span className="result-icon">
                        {mockResults['25c'].cycleLife.status === 'POSITIVE' ? '✓' : '✕'}
                      </span>
                      {mockResults['25c'].cycleLife.status}
                    </div>
                    <div className="result-confidence">
                      <span className="confidence-label">CONFIDENCE</span>
                      <span className="confidence-value">{mockResults['25c'].cycleLife.confidence}</span>
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">25 °C CE</div>
                    <div className={`result-badge ${mockResults['25c'].ce.status.toLowerCase()}`}>
                      <span className="result-icon">
                        {mockResults['25c'].ce.status === 'POSITIVE' ? '✓' : '✕'}
                      </span>
                      {mockResults['25c'].ce.status}
                    </div>
                    <div className="result-confidence">
                      <span className="confidence-label">CONFIDENCE</span>
                      <span className="confidence-value">{mockResults['25c'].ce.confidence}</span>
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">25 °C Rate performance</div>
                    <div className={`result-badge ${mockResults['25c'].ratePerformance.status.toLowerCase()}`}>
                      <span className="result-icon">
                        {mockResults['25c'].ratePerformance.status === 'POSITIVE' ? '✓' : '✕'}
                      </span>
                      {mockResults['25c'].ratePerformance.status}
                    </div>
                    <div className="result-confidence">
                      <span className="confidence-label">CONFIDENCE</span>
                      <span className="confidence-value">{mockResults['25c'].ratePerformance.confidence}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === '45c' && (
                <div className="performance-results">
                  <div className="result-item">
                    <div className="result-label">45 °C Cycle Life</div>
                    <div className={`result-badge ${mockResults['45c'].cycleLife.status.toLowerCase()}`}>
                      <span className="result-icon">
                        {mockResults['45c'].cycleLife.status === 'POSITIVE' ? '✓' : '✕'}
                      </span>
                      {mockResults['45c'].cycleLife.status}
                    </div>
                    <div className="result-confidence">
                      <span className="confidence-label">CONFIDENCE</span>
                      <span className="confidence-value">{mockResults['45c'].cycleLife.confidence}</span>
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">45 °C CE</div>
                    <div className={`result-badge ${mockResults['45c'].ce.status.toLowerCase()}`}>
                      <span className="result-icon">
                        {mockResults['45c'].ce.status === 'POSITIVE' ? '✓' : '✕'}
                      </span>
                      {mockResults['45c'].ce.status}
                    </div>
                    <div className="result-confidence">
                      <span className="confidence-label">CONFIDENCE</span>
                      <span className="confidence-value">{mockResults['45c'].ce.confidence}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="llm-analysis-section">
              <button className="llm-analysis-btn">
                LLM Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionModule;