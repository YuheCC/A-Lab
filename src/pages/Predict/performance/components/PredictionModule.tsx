import React, { useState } from 'react';
import { moleculeService, type MoleculeDetails } from '@/services/chat/moleculeService';
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
  const [showLLMAnalysis, setShowLLMAnalysis] = useState(false);
  
  // 新增状态：分子详情相关
  const [moleculeDetails, setMoleculeDetails] = useState<MoleculeDetails | null>(null);
  const [moleculeError, setMoleculeError] = useState<string | null>(null);
  const [isMoleculeLoading, setIsMoleculeLoading] = useState(false);

  const systemSpecs: Record<string, SystemSpec> = {
    'NCM811 - 12%Si/graphite - Carbonate electrolyte': {
      cathode: 'Polycrystal NCM811, 4 mAh/cm²',
      anode: '12% SiC + Graphite',
      electrolyte: 'Solvent EC/EMC/DEC (2:3:2) + Salt 1M LiPF6/LiFSI + Additive VC/FEC',
      cellDesign: '4/5 layer pouch cell, 1.07 NP ratio, 1 Ah capacity'
    }
  };

  const currentSpec = systemSpecs[selectedSystem];

  // 处理 SMILES 输入框失焦事件
  const handleSmilesBlur = async () => {
    const trimmedAdditive = additive.trim();
    if (!trimmedAdditive) {
      setMoleculeDetails(null);
      setMoleculeError(null);
      return;
    }

    setIsMoleculeLoading(true);
    setMoleculeError(null);
    setMoleculeDetails(null);

    try {
      const details = await moleculeService.getMoleculeDetails(trimmedAdditive);
      
      // 检查是否是实际的分子数据还是mock数据
      // 如果 smiles 与输入不匹配，可能是mock数据或错误
      if (details && details.properties.smiles && 
          details.properties.smiles !== trimmedAdditive &&
          details.properties.smiles === 'F[P-](F)(F)(F)(F)F.[Li+]') {
        // 这是默认的mock数据，表示没有找到
        setMoleculeError('查询的 SMILES 字符串在我们的数据库中未找到。');
      } else {
        // 有效的分子数据
        setMoleculeDetails(details);
      }
    } catch (error) {
      console.error('获取分子详情失败:', error);
      setMoleculeError('查询的 SMILES 字符串在我们的数据库中未找到。');
    } finally {
      setIsMoleculeLoading(false);
    }
  };

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
            onBlur={handleSmilesBlur}
            placeholder="Enter SMILES molecular formula"
            className="additive-input"
          />
        </div>

        {/* 分子详情显示区域 */}
        {isMoleculeLoading && (
          <div className="molecule-loading">
            <p>正在查询分子详情...</p>
          </div>
        )}

        {moleculeDetails && (
          <div className="molecule-information">
            <div className="molecule-header">
              <h3>Molecule Information</h3>
              <button 
                className="molecule-close-btn"
                onClick={() => setMoleculeDetails(null)}
              >
                ×
              </button>
            </div>
            
            <div className="molecule-content">
              <div className="molecule-structure">
                <div className="structure-placeholder">
                  <div className="structure-circle">
                    <span>Molecule</span>
                    <span>Structure</span>
                  </div>
                </div>
              </div>
              
              <div className="molecule-properties">
                <div className="properties-grid">
                  <div className="property-row">
                    <div className="property-item">
                      <label>SMILES:</label>
                      <span>{moleculeDetails.properties.smiles || '-'}</span>
                    </div>
                    <div className="property-item">
                      <label>ESP MIN:</label>
                      <span>{moleculeDetails.properties.espMin || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="property-row">
                    <div className="property-item">
                      <label>MOL WEIGHT:</label>
                      <span>{moleculeDetails.properties.molecularWeight || '-'}</span>
                    </div>
                    <div className="property-item">
                      <label>PREDICTED MP:</label>
                      <span>{moleculeDetails.properties.meltingPoint || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="property-row">
                    <div className="property-item">
                      <label>UMAP X:</label>
                      <span>-</span>
                    </div>
                    <div className="property-item">
                      <label>PREDICTED BP:</label>
                      <span>{moleculeDetails.properties.boilingPoint || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="property-row">
                    <div className="property-item">
                      <label>UMAP Y:</label>
                      <span>-</span>
                    </div>
                    <div className="property-item">
                      <label>PREDICTED FP:</label>
                      <span>{moleculeDetails.properties.flashPoint || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="property-row">
                    <div className="property-item">
                      <label>HOMO:</label>
                      <span>{moleculeDetails.properties.homo || '-'}</span>
                    </div>
                    <div className="property-item">
                      <label>COMBUSTION ENTHALPY:</label>
                      <span>{moleculeDetails.properties.combustionEnthalpy || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="property-row">
                    <div className="property-item">
                      <label>LUMO:</label>
                      <span>{moleculeDetails.properties.lumo || '-'}</span>
                    </div>
                    <div className="property-item">
                      <label>COMMERCIAL VIABILITY:</label>
                      <span>{moleculeDetails.properties.commercialViability || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="property-row">
                    <div className="property-item">
                      <label>ESP MAX:</label>
                      <span>{moleculeDetails.properties.espMax || '-'}</span>
                    </div>
                    <div className="property-item"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {moleculeError && (
          <div className="smiles-not-found">
            <div className="error-header">
              <h3>SMILES Not Found</h3>
              <button 
                className="molecule-close-btn"
                onClick={() => setMoleculeError(null)}
              >
                ×
              </button>
            </div>
            
            <div className="error-content">
              <p>The SMILES string you entered is not found in our database.</p>
              <p>Please re-enter a valid SMILES string or try this example:</p>
              
              <div className="example-smiles">
                <div className="example-item">
                  <strong>O=c1occo1</strong> - ethylene carbonate
                </div>
                <div className="example-item">
                  <strong>H2O</strong> - water
                </div>
              </div>
            </div>
          </div>
        )}

        <button 
          className={`calculate-btn ${showResults ? 'calculated' : ''}`}
          onClick={handleCalculate}
        >
          {showResults ? 'Calculated' : 'Calculate'}
        </button>

        {showResults && (
          <div className="results-section">
            <h2>Cell Performance Prediction</h2>
            
            <div className="results-card">
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

              <div className="llm-button-section">
                <button 
                  className="llm-analysis-btn"
                  onClick={() => setShowLLMAnalysis(true)}
                >
                  LLM Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {showLLMAnalysis && (
          <div className="llm-analysis-section">
            <h2>LLM Analysis</h2>
            
            <div className="llm-analysis-card">
              <div className="llm-content">
              <div className="llm-analysis-item">
                <h3>1. Nickel Dehydrogenation Optimization</h3>
                <ul>
                  <li>
                    The dimethyl dicarbonate-based molecule (SMILES: O=C(OC(C)(C)C)O) acts as a conductor in 
                    nickel-catalyzed denitrogenation products. This reaction can improve CE degradation under 
                    voltage. During the CE optimization process, when generating this structure with electrical nickel, it 
                    is essential to maintain good CE settings, cycle reversal CE display enhancement, and optimize 
                    aging CE display improvement patterns.
                  </li>
                </ul>
              </div>

              <div className="llm-analysis-item">
                <h3>2. 4°C Cycling Optimization</h3>
                <p>
                  The rolling disc approach involves enhanced material comparison and LiFe distribution optimization 
                  for secondary reactions. This biochemical nickel enhancement process addresses charge-
                  discharge cycles under nickel conditions, improving efficiency through systematic laboratory 
                  validation at 4°C conditions with simplified testing protocols.
                </p>
              </div>

              <div className="llm-analysis-item">
                <h3>3. Comprehensive Recommendations</h3>
                <ul>
                  <li>
                    Optimal reduction positioning at 2% to 4°C conditions is essential for effective CE and cycling 
                    performance. Multiple verification cycles using EC/EMC/DEC/LiFe with UC/LiPF6 low-grade 
                    electrolyte systems are recommended for material state optimization.
                  </li>
                </ul>
              </div>

              <div className="llm-references">
                <p><strong>References</strong> [1] Ling-Fei Zhao et al. Hard Carbon Anodes: Fundamental Understanding and Commercial Perspectives for Na-ion Batteries beyond Li-ion and K-ion Counterparts, Advanced Energy Materials, 2002[04, 2020.</p>
                <a href="https://doi.org/10.1002/aenm.202002704" target="_blank" rel="noopener noreferrer">
                  https://doi.org/10.1002/aenm.202002704
                </a>
                
                <p>[2] Xiaonan Zhang et al. Lithium dendrite-free and fast-charging for high voltage nickel-rich lithium metal batteries enabled by bifunctional sulfone-containing electrolyte additives, Journal of Power Sources, 452/227833, 2020.</p>
                <a href="https://doi.org/10.1016/j.jpowsour.2020.227833" target="_blank" rel="noopener noreferrer">
                  https://doi.org/10.1016/j.jpowsour.2020.227833
                </a>
                
                <p>[3] Simeng Zhang et al. Low-temperature molten salt as a versatile Electrolyte Additive towards LiNi0.8Co0.1Mn0.1O2/Graphite Batteries Working in a Wide-Temperature Range, ACS Applied Materials & Interfaces, 10 (35):29628-29518, 2018.</p>
                <a href="https://doi.org/10.1021/acsami.8b04743" target="_blank" rel="noopener noreferrer">
                  https://doi.org/10.1021/acsami.8b04743
                </a>
              </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionModule;