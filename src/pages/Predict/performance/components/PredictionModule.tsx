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
    // Calculate logic will be implemented later
    console.log('Calculating with:', { selectedSystem, additive });
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
          className="calculate-btn"
          onClick={handleCalculate}
        >
          Calculate
        </button>
      </div>
    </div>
  );
};

export default PredictionModule;