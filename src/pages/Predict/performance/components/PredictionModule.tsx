import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { moleculeService, type MoleculeDetails } from '@/services/chat/moleculeService';
import { getBatterySystemList } from '@/services/prediction/performance';
import MolViewer2D from '@/components/NodePopup/MolViewer2D.js';
import './PredictionModule.css';

interface SystemSpec {
  cathode: string;
  anode: string;
  electrolyte: string;
  cellDesign: string;
}

interface BatterySystem {
  id: string;
  name: string;
  cathode: string;
  anode: string;
  benchmark_electrolyte: string;
  cell_design: string;
  created_at: string;
  updated_at: string;
}

const PredictionModule: React.FC = () => {
  const { t } = useTranslation();
  const [selectedSystem, setSelectedSystem] = useState('');
  const [additive, setAdditive] = useState('');
  const [showSpecs, setShowSpecs] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'25c' | '45c'>('25c');
  const [showLLMAnalysis, setShowLLMAnalysis] = useState(false);
  
  // 新增状态：分子详情相关
  const [moleculeDetails, setMoleculeDetails] = useState<MoleculeDetails | null>(null);
  const [moleculeError, setMoleculeError] = useState<string | null>(null);
  const [isMoleculeLoading, setIsMoleculeLoading] = useState(false);
  const [lastQueriedSmiles, setLastQueriedSmiles] = useState<string | null>(null);
  
  // 新增状态：电池系统相关
  const [batterySystemOptions, setBatterySystemOptions] = useState<BatterySystem[]>([]);
  const [isBatterySystemLoading, setIsBatterySystemLoading] = useState(true);

  // 从选中的电池系统中获取规格信息
  const getCurrentSpec = (): SystemSpec | null => {
    if (!selectedSystem) return null;
    const system = batterySystemOptions.find(s => s.name === selectedSystem);
    if (!system) return null;
    
    return {
      cathode: system.cathode,
      anode: system.anode,
      electrolyte: system.benchmark_electrolyte,
      cellDesign: system.cell_design
    };
  };

  const currentSpec = getCurrentSpec();

  // 获取电池系统选项
  useEffect(() => {
    const fetchBatterySystemOptions = async () => {
      try {
        setIsBatterySystemLoading(true);
        const response = await getBatterySystemList();
        if (response?.data) {
          setBatterySystemOptions(response.data);
          // 如果有选项，默认选择第一个
          if (response.data.length > 0) {
            setSelectedSystem(response.data[0].name);
          }
        }
      } catch (error) {
        console.error('获取电池系统选项失败:', error);
      } finally {
        setIsBatterySystemLoading(false);
      }
    };

    fetchBatterySystemOptions();
  }, []);

  // 处理 SMILES 输入框失焦事件
  const handleSmilesBlur = async () => {
    const trimmedAdditive = additive.trim();
    
    // 如果输入为空，清除所有状态
    if (!trimmedAdditive) {
      setMoleculeDetails(null);
      setMoleculeError(null);
      setLastQueriedSmiles(null);
      return;
    }

    // 如果分子式没有变化，且已经有查询结果（无论成功或失败），则不重新查询
    if (trimmedAdditive === lastQueriedSmiles && (moleculeDetails || moleculeError)) {
      return;
    }

    setIsMoleculeLoading(true);
    setMoleculeError(null);
    setMoleculeDetails(null);

    try {
      const details = await moleculeService.getMoleculeDetails(trimmedAdditive);
      
      // 检查是否是实际的分子数据还是mock数据
      if (details && details.properties.smiles && 
          details.properties.smiles === 'F[P-](F)(F)(F)(F)F.[Li+]') {
        // 这是默认的mock数据，表示没有找到
        setMoleculeError(t('performance.smilesNotFound.description'));
      } else {
        // 有效的分子数据
        setMoleculeDetails(details);
      }
      
      // 记录已查询的分子式
      setLastQueriedSmiles(trimmedAdditive);
    } catch (error) {
      console.error('获取分子详情失败:', error);
      setMoleculeError(t('performance.smilesNotFound.description'));
      // 即使查询失败，也记录已查询的分子式
      setLastQueriedSmiles(trimmedAdditive);
    } finally {
      setIsMoleculeLoading(false);
    }
  };

  const handleCalculate = () => {
    if (!additive.trim()) {
      alert(t('performance.additive.placeholder'));
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
        <h2>{t('performance.batterySystemSelection.title')}</h2>
        
        <div className="form-group">
          <label>{t('performance.batterySystemSelection.label')}</label>
          <select 
            value={selectedSystem} 
            onChange={(e) => setSelectedSystem(e.target.value)}
            className="system-select"
            disabled={isBatterySystemLoading}
          >
            {isBatterySystemLoading ? (
              <option value="">{t('performance.batterySystemSelection.loading')}</option>
            ) : (
              batterySystemOptions.map((system) => (
                <option key={system.id} value={system.name}>
                  {system.name}
                </option>
              ))
            )}
          </select>
        </div>

        {showSpecs && currentSpec && (
          <div className="system-specs">
            <div className="specs-header">
              <span>{t('performance.batterySystemSelection.systemSpecs.title')}</span>
              <button 
                className="close-specs"
                onClick={() => setShowSpecs(false)}
              >
                ×
              </button>
            </div>
            
            <div className="specs-grid">
              <div className="spec-item">
                <label>{t('performance.batterySystemSelection.systemSpecs.cathode')}</label>
                <span>{currentSpec.cathode}</span>
              </div>
              
              <div className="spec-item">
                <label>{t('performance.batterySystemSelection.systemSpecs.anode')}</label>
                <span>{currentSpec.anode}</span>
              </div>
              
              <div className="spec-item">
                <label>{t('performance.batterySystemSelection.systemSpecs.benchmarkElectrolyte')}</label>
                <span>{currentSpec.electrolyte}</span>
              </div>
              
              <div className="spec-item">
                <label>{t('performance.batterySystemSelection.systemSpecs.cellDesign')}</label>
                <span>{currentSpec.cellDesign}</span>
              </div>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>
            {t('performance.additive.label')} <span className="required">{t('performance.additive.required')}</span>
          </label>
          <input
            type="text"
            value={additive}
            onChange={(e) => {
              const newValue = e.target.value;
              setAdditive(newValue);
              
              // 如果用户清除了输入或者输入与上次查询的不同，清除分子信息
              const trimmedValue = newValue.trim();
              if (!trimmedValue || (lastQueriedSmiles && trimmedValue !== lastQueriedSmiles)) {
                setMoleculeDetails(null);
                setMoleculeError(null);
                if (!trimmedValue) {
                  setLastQueriedSmiles(null);
                }
              }
            }}
            onBlur={handleSmilesBlur}
            placeholder={t('performance.additive.placeholder')}
            className="additive-input"
          />
        </div>

        {/* 分子详情显示区域 */}
        <div className="molecule-details-section" style={{ marginBottom: '20px' }}>
          {isMoleculeLoading && (
            <div className="molecule-loading">
              <p>{t('performance.moleculeInfo.loading')}</p>
            </div>
          )}

          {moleculeDetails && (
            <div className="molecule-information">
              <div className="molecule-header">
                <h3>{t('performance.moleculeInfo.title')}</h3>
                <button 
                  className="molecule-close-btn"
                  onClick={() => setMoleculeDetails(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="molecule-content">
                <div className="molecule-structure">
                  {moleculeDetails.properties.smiles ? (
                    <MolViewer2D 
                      smile={moleculeDetails.properties.smiles} 
                      theme="light"
                    />
                  ) : (
                    <div className="structure-placeholder">
                      <div className="structure-circle">
                        <span>{t('performance.moleculeInfo.structurePlaceholder.line1')}</span>
                        <span>{t('performance.moleculeInfo.structurePlaceholder.line2')}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="molecule-properties">
                  <div className="properties-grid">
                    <div className="property-row">
                      <div className="property-item">
                        <label>{t('performance.moleculeInfo.properties.smiles')}</label>
                        <span>{moleculeDetails.properties.smiles || '-'}</span>
                      </div>
                      <div className="property-item">
                        <label>{t('performance.moleculeInfo.properties.espMin')}</label>
                        <span>{typeof moleculeDetails.properties.espMin === 'number' ? moleculeDetails.properties.espMin.toFixed(2) + ' eV' : moleculeDetails.properties.espMin || '-'}</span>
                      </div>
                    </div>
                    
                    <div className="property-row">
                      <div className="property-item">
                        <label>{t('performance.moleculeInfo.properties.molecularWeight')}</label>
                        <span>{typeof moleculeDetails.properties.molecularWeight === 'number' ? moleculeDetails.properties.molecularWeight.toFixed(2) : moleculeDetails.properties.molecularWeight || '-'}</span>
                      </div>
                      <div className="property-item">
                        <label>{t('performance.moleculeInfo.properties.predictedMp')}</label>
                        <span>{moleculeDetails.properties.meltingPoint || '-'}</span>
                      </div>
                    </div>
                    
                    <div className="property-row">
                      <div className="property-item">
                        <label>{t('performance.moleculeInfo.properties.umapX')}</label>
                        <span>{moleculeDetails.properties.umapX !== undefined ? moleculeDetails.properties.umapX.toFixed(4) : '-'}</span>
                      </div>
                      <div className="property-item">
                        <label>{t('performance.moleculeInfo.properties.predictedBp')}</label>
                        <span>{moleculeDetails.properties.boilingPoint || '-'}</span>
                      </div>
                    </div>
                    
                    <div className="property-row">
                      <div className="property-item">
                        <label>{t('performance.moleculeInfo.properties.umapY')}</label>
                        <span>{moleculeDetails.properties.umapY !== undefined ? moleculeDetails.properties.umapY.toFixed(4) : '-'}</span>
                      </div>
                      <div className="property-item">
                        <label>{t('performance.moleculeInfo.properties.predictedFp')}</label>
                        <span>{moleculeDetails.properties.flashPoint || '-'}</span>
                      </div>
                    </div>
                    
                    <div className="property-row">
                      <div className="property-item">
                        <label>{t('performance.moleculeInfo.properties.homo')}</label>
                        <span>{typeof moleculeDetails.properties.homo === 'number' ? moleculeDetails.properties.homo.toFixed(4) + ' eV' : moleculeDetails.properties.homo || '-'}</span>
                      </div>
                      <div className="property-item">
                        <label>{t('performance.moleculeInfo.properties.combustionEnthalpy')}</label>
                        <span>{moleculeDetails.properties.combustionEnthalpy || '-'}</span>
                      </div>
                    </div>
                    
                    <div className="property-row">
                      <div className="property-item">
                        <label>{t('performance.moleculeInfo.properties.lumo')}</label>
                        <span>{typeof moleculeDetails.properties.lumo === 'number' ? moleculeDetails.properties.lumo.toFixed(4) + ' eV' : moleculeDetails.properties.lumo || '-'}</span>
                      </div>
                      <div className="property-item">
                        <label>{t('performance.moleculeInfo.properties.commercialViability')}</label>
                        <span>{moleculeDetails.properties.commercialViability || '-'}</span>
                      </div>
                    </div>
                    
                    <div className="property-row">
                      <div className="property-item">
                        <label>{t('performance.moleculeInfo.properties.espMax')}</label>
                        <span>{typeof moleculeDetails.properties.espMax === 'number' ? moleculeDetails.properties.espMax.toFixed(3) + ' eV' : moleculeDetails.properties.espMax || '-'}</span>
                      </div>
                      <div className="property-item">
                        <label>{t('performance.moleculeInfo.properties.functionalGroups')}</label>
                        <span>{moleculeDetails.properties.functionalGroups ? (() => {
                          try {
                            const groups = JSON.parse(moleculeDetails.properties.functionalGroups);
                            return Array.isArray(groups) ? groups.join(', ') : moleculeDetails.properties.functionalGroups;
                          } catch {
                            return moleculeDetails.properties.functionalGroups;
                          }
                        })() : '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {moleculeError && (
            <div className="smiles-not-found">
              <div className="error-header">
                <h3>{t('performance.smilesNotFound.title')}</h3>
                <button 
                  className="molecule-close-btn"
                  onClick={() => setMoleculeError(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="error-content">
                <p>{t('performance.smilesNotFound.description')}</p>
                <p>{t('performance.smilesNotFound.suggestion')}</p>
                
                <div className="example-smiles">
                  <div className="example-item">
                    <strong>O=c1occo1</strong> - {t('performance.smilesNotFound.examples.ec')}
                  </div>
                  <div className="example-item">
                    <strong>H2O</strong> - {t('performance.smilesNotFound.examples.water')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <button 
          className={`calculate-btn ${showResults ? 'calculated' : ''}`}
          onClick={handleCalculate}
        >
          {showResults ? t('performance.calculate.calculated') : t('performance.calculate.button')}
        </button>

        {showResults && (
          <div className="results-section">
            <h2>{t('performance.results.title')}</h2>
            
            <div className="results-card">
              <div className="temperature-tabs" data-active={activeTab}>
              <button 
                className={`temp-tab ${activeTab === '25c' ? 'active' : ''}`}
                onClick={() => setActiveTab('25c')}
              >
                {t('performance.results.temperatureTabs.temp25')}
              </button>
              <button 
                className={`temp-tab ${activeTab === '45c' ? 'active' : ''}`}
                onClick={() => setActiveTab('45c')}
              >
                {t('performance.results.temperatureTabs.temp45')}
              </button>
            </div>

            <div className="results-content">
              {activeTab === '25c' && (
                <div className="performance-results">
                  <div className="result-item">
                    <div className="result-label">{t('performance.results.performance.cycleLife25')}</div>
                    <div className={`result-badge ${mockResults['25c'].cycleLife.status.toLowerCase()}`}>
                      <span className="result-icon">
                        {mockResults['25c'].cycleLife.status === 'POSITIVE' ? '✓' : '✕'}
                      </span>
                      {mockResults['25c'].cycleLife.status}
                    </div>
                    <div className="result-confidence">
                      <span className="confidence-label">{t('performance.results.confidence')}</span>
                      <span className="confidence-value">{mockResults['25c'].cycleLife.confidence}</span>
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">{t('performance.results.performance.ce25')}</div>
                    <div className={`result-badge ${mockResults['25c'].ce.status.toLowerCase()}`}>
                      <span className="result-icon">
                        {mockResults['25c'].ce.status === 'POSITIVE' ? '✓' : '✕'}
                      </span>
                      {mockResults['25c'].ce.status}
                    </div>
                    <div className="result-confidence">
                      <span className="confidence-label">{t('performance.results.confidence')}</span>
                      <span className="confidence-value">{mockResults['25c'].ce.confidence}</span>
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">{t('performance.results.performance.ratePerformance25')}</div>
                    <div className={`result-badge ${mockResults['25c'].ratePerformance.status.toLowerCase()}`}>
                      <span className="result-icon">
                        {mockResults['25c'].ratePerformance.status === 'POSITIVE' ? '✓' : '✕'}
                      </span>
                      {mockResults['25c'].ratePerformance.status}
                    </div>
                    <div className="result-confidence">
                      <span className="confidence-label">{t('performance.results.confidence')}</span>
                      <span className="confidence-value">{mockResults['25c'].ratePerformance.confidence}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === '45c' && (
                <div className="performance-results">
                  <div className="result-item">
                    <div className="result-label">{t('performance.results.performance.cycleLife45')}</div>
                    <div className={`result-badge ${mockResults['45c'].cycleLife.status.toLowerCase()}`}>
                      <span className="result-icon">
                        {mockResults['45c'].cycleLife.status === 'POSITIVE' ? '✓' : '✕'}
                      </span>
                      {mockResults['45c'].cycleLife.status}
                    </div>
                    <div className="result-confidence">
                      <span className="confidence-label">{t('performance.results.confidence')}</span>
                      <span className="confidence-value">{mockResults['45c'].cycleLife.confidence}</span>
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-label">{t('performance.results.performance.ce45')}</div>
                    <div className={`result-badge ${mockResults['45c'].ce.status.toLowerCase()}`}>
                      <span className="result-icon">
                        {mockResults['45c'].ce.status === 'POSITIVE' ? '✓' : '✕'}
                      </span>
                      {mockResults['45c'].ce.status}
                    </div>
                    <div className="result-confidence">
                      <span className="confidence-label">{t('performance.results.confidence')}</span>
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
                  {t('performance.llmAnalysis.button')}
                </button>
              </div>
            </div>
          </div>
        )}

        {showLLMAnalysis && (
          <div className="llm-analysis-section">
            <h2>{t('performance.llmAnalysis.title')}</h2>
            
            <div className="llm-analysis-card">
              <div className="llm-content">
              <div className="llm-analysis-item">
                <h3>{t('performance.llmAnalysis.sections.nickelOptimization')}</h3>
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
                <h3>{t('performance.llmAnalysis.sections.cyclingOptimization')}</h3>
                <p>
                  The rolling disc approach involves enhanced material comparison and LiFe distribution optimization 
                  for secondary reactions. This biochemical nickel enhancement process addresses charge-
                  discharge cycles under nickel conditions, improving efficiency through systematic laboratory 
                  validation at 4°C conditions with simplified testing protocols.
                </p>
              </div>

              <div className="llm-analysis-item">
                <h3>{t('performance.llmAnalysis.sections.recommendations')}</h3>
                <ul>
                  <li>
                    Optimal reduction positioning at 2% to 4°C conditions is essential for effective CE and cycling 
                    performance. Multiple verification cycles using EC/EMC/DEC/LiFe with UC/LiPF6 low-grade 
                    electrolyte systems are recommended for material state optimization.
                  </li>
                </ul>
              </div>

              <div className="llm-references">
                <p><strong>{t('performance.llmAnalysis.references')}</strong> [1] Ling-Fei Zhao et al. Hard Carbon Anodes: Fundamental Understanding and Commercial Perspectives for Na-ion Batteries beyond Li-ion and K-ion Counterparts, Advanced Energy Materials, 2002[04, 2020.</p>
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