import React, { useState, useCallback, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { runMDSimulation, MDRunParams } from '@/services/formulation/md';
import ResultTip from '@/components/ResultTip';
import './FormulationModule.css';
import { useNavigate } from '@umijs/max';
import { formatIonDisplay } from '../utils';
import { PricingContext } from '@/layouts/index';

interface FormulationModuleProps {
  onResetRef?: (resetFn: () => void) => void;
}

const FormulationModule: React.FC<FormulationModuleProps> = ({ onResetRef }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pricingContext = useContext(PricingContext);
  // Salt Configuration State
  const [selectedCation, setSelectedCation] = useState('Li');
  const [selectedAnions, setSelectedAnions] = useState<string[]>(['PF6']);
  const [totalSaltConcentration, setTotalSaltConcentration] = useState('1.00');
  const [anionFractions, setAnionFractions] = useState<{[key: string]: string}>({'PF6': '1.00'});
  const [fractionType, setFractionType] = useState<'mole' | 'weight'>('mole');

  // Solvent Configuration State
  const [solvents, setSolvents] = useState([
    { id: 1, smiles: 'CCO', fraction: '1.00' }
  ]);
  const [solventFractionType, setSolventFractionType] = useState<'mole' | 'weight'>('mole');
  const [nextSolventId, setNextSolventId] = useState(2);

  // Results state
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentView, setCurrentView] = useState<'configuration' | 'results'>('configuration');
  const [error, setError] = useState<string | null>(null);

  // SMILES validation state
  const [smilesErrors, setSmilesErrors] = useState<{[key: number]: string}>({});
  const [showValidation, setShowValidation] = useState(false);

  // Validation logic
  const isValidConfiguration = () => {
    const concentration = parseFloat(totalSaltConcentration);
    const totalFraction = selectedAnions.reduce((sum, anion) => {
      return sum + parseFloat(anionFractions[anion] || '0');
    }, 0);
    return concentration > 0 && selectedAnions.length > 0 && Math.abs(totalFraction - 1) < 0.001;
  };

  // Solvent validation logic
  const isValidSolventConfiguration = () => {
    const activeSolvents = solvents.filter(s => s.smiles.trim() !== '');
    const totalFraction = activeSolvents.reduce((sum, s) => sum + parseFloat(s.fraction || '0'), 0);
    return activeSolvents.length > 0 && Math.abs(totalFraction - 1) < 0.001;
  };

  // SMILES validation logic
  const validateSMILES = (smiles: string): string | null => {
    if (smiles.trim() === '') {
      return null; // Empty is allowed
    }

    // Basic SMILES validation
    // Check for basic structure and allowed characters
    const smilesPattern = /^[A-Za-z0-9@+\-\[\]()=#\/\\%.]+$/;
    if (!smilesPattern.test(smiles)) {
      return '无效的SMILES格式';
    }

    // Check for balanced brackets
    const brackets = smiles.match(/[\[\]]/g) || [];
    const openBrackets = brackets.filter(b => b === '[').length;
    const closeBrackets = brackets.filter(b => b === ']').length;
    if (openBrackets !== closeBrackets) {
      return '括号不匹配';
    }

    // Check for balanced parentheses
    const parentheses = smiles.match(/[()]/g) || [];
    const openParens = parentheses.filter(p => p === '(').length;
    const closeParens = parentheses.filter(p => p === ')').length;
    if (openParens !== closeParens) {
      return '圆括号不匹配';
    }

    return null;
  };

  // Validate all SMILES strings
  const validateAllSMILES = () => {
    const errors: {[key: number]: string} = {};

    solvents.forEach(solvent => {
      if (solvent.smiles.trim() !== '') {
        const error = validateSMILES(solvent.smiles);
        if (error) {
          errors[solvent.id] = error;
        }
      }
    });

    setSmilesErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Solvent management functions
  const updateSolvent = (id: number, field: 'smiles' | 'fraction', value: string) => {
    setSolvents(prev => prev.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));

    // Clear error for this solvent when user types
    if (field === 'smiles' && smilesErrors[id]) {
      setSmilesErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const removeSolvent = (id: number) => {
    setSolvents(prev => {
      // 真正删除这一条溶剂
      const remainingSolvents = prev.filter(s => s.id !== id);

      // 如果删除后没有溶剂了，保留至少一个空的溶剂
      if (remainingSolvents.length === 0) {
        return [{ id: nextSolventId, smiles: '', fraction: '1.00' }];
      }

      // 重新分配剩余溶剂的分数
      const equalFraction = (1 / remainingSolvents.length).toFixed(2);
      return remainingSolvents.map(s => ({
        ...s,
        fraction: equalFraction
      }));
    });
  };

  const addSolvent = () => {
    if (solvents.length >= 3) return; // 限制最多3个溶剂

    setSolvents(prev => {
      const currentCount = prev.length;
      const newFraction = (1 / (currentCount + 1)).toFixed(2);

      // 创建新的溶剂
      const newSolvent = {
        id: nextSolventId,
        smiles: '',
        fraction: newFraction
      };

      // 重新分配所有现有溶剂的分数
      const updatedExisting = prev.map(s => ({
        ...s,
        fraction: newFraction
      }));

      return [...updatedExisting, newSolvent];
    });

    setNextSolventId(prev => prev + 1);
  };


  // Anion management functions
  const toggleAnionSelection = (anionValue: string) => {
    setSelectedAnions(prev => {
      const isSelected = prev.includes(anionValue);
      let newSelectedAnions: string[];

      if (isSelected) {
        // Remove anion if already selected (but keep at least one)
        if (prev.length > 1) {
          newSelectedAnions = prev.filter(a => a !== anionValue);
          // Remove fraction for deselected anion
          setAnionFractions(prevFractions => {
            const newFractions = { ...prevFractions };
            delete newFractions[anionValue];
            return newFractions;
          });
        } else {
          newSelectedAnions = prev; // Keep the last one
        }
      } else {
        // Add anion if not selected (max 2 anions)
        if (prev.length < 2) {
          newSelectedAnions = [...prev, anionValue];
          // Add default fraction for new anion
          setAnionFractions(prevFractions => ({
            ...prevFractions,
            [anionValue]: '0.50'
          }));
          // Adjust existing fractions to maintain total of 1.0
          if (prev.length === 1) {
            setAnionFractions(prevFractions => ({
              ...prevFractions,
              [prev[0]]: '0.50',
              [anionValue]: '0.50'
            }));
          }
        } else {
          newSelectedAnions = prev; // Don't add if already 2 selected
        }
      }

      return newSelectedAnions;
    });
  };

  const updateAnionFraction = (anion: string, value: string) => {
    setAnionFractions(prev => ({
      ...prev,
      [anion]: value
    }));
  };

  // Remove ionic symbols from ion names for API
  const cleanIonName = (ionValue: string) => {
    // 值已经不包含符号，直接返回
    return ionValue;
  };

  // Available options
  const cationOptions = [
    { value: 'Li', label: 'Li⁺', subLabel: 'Lithium', available: true },
    { value: 'Na', label: 'Na⁺', subLabel: 'Sodium', available: false, disabledText: t('formulation.comingSoon', 'To be available in MU2') },
    { value: 'Mg2', label: 'Mg²⁺', subLabel: 'Magnesium', available: false, disabledText: t('formulation.comingSoon2', 'To be available in MU2') },
    { value: 'Zn2', label: 'Zn²⁺', subLabel: 'Zinc', available: false, disabledText: t('formulation.comingSoon2', 'To be available in MU2') }
  ];

  const anionOptions = [
    { value: 'PF6', label: 'PF₆⁻', subLabel: 'Hexafluorophosphate', available: true, disabledText: "" },
    { value: 'BF4', label: 'BF₄⁻', subLabel: 'Tetrafluoroborate', available: true, disabledText: "" },
    { value: 'FSI', label: 'FSI⁻', subLabel: 'Bis(fluorosulfonyl)imide', available: true, disabledText: "" },
    { value: 'TFSI', label: 'TFSI⁻', subLabel: 'Bis(trifluoromethylsulfonyl)imide', available: true, disabledText: "" }
  ];

  const handleCalculate = async () => {
    // Show validation errors
    setShowValidation(true);

    // Validate SMILES
    const smilesValid = validateAllSMILES();

    if (!isValidConfiguration() || !isValidSolventConfiguration() || !smilesValid) {
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // 构建MD运行参数
      const params: MDRunParams = {
        solvent_smiles_list: solvents
          .filter(s => s.smiles.trim() !== '')
          .map(s => s.smiles.trim()),
        solvent_fractions_type: solventFractionType,
        solvent_fractions: solvents
          .filter(s => s.smiles.trim() !== '')
          .map(s => parseFloat(s.fraction)),
        anion_name_list: selectedAnions.map(anion => cleanIonName(anion)),
        anion_fractions: selectedAnions.map(anion => parseFloat(anionFractions[anion] || '0')),
        anion_fractions_type: "mole",
        cation_name: cleanIonName(selectedCation),
        num_cations: 40, // 默认值，可以根据需要调整
        cation_molality: parseFloat(totalSaltConcentration),
        simulation_box_size: 500.0 // 默认值，可以根据需要调整
      };

      const response = await runMDSimulation(params);

      if (response?.status === 402 || response?.data?.status === 402) {
        pricingContext?.setShowUpgradeModal?.(true);
        setIsCalculating(false);
        setError(null);
        return;
      }

      if (response && response.data && response.status < 300) {
        console.log('MD simulation result:', response.data);
        setIsCalculating(false);
        navigate('/formulation/result-tip');
        setCurrentView('results');
      } else {
        throw new Error(response?.data?.message || response?.data?.detail?.message || 'Invalid response from MD simulation');
      }
    } catch (error: any) {
      console.error('MD simulation failed:', error);

      // 检查是否是未登录错误（401）或者token不存在
      const token = localStorage.getItem('token');
      const isUnauthorized = error?.response?.status === 401 || error?.status === 401;
      const isPaymentRequired = error?.response?.status === 402 || error?.status === 402;

      if (isPaymentRequired) {
        pricingContext?.setShowUpgradeModal?.(true);
        setIsCalculating(false);
        setError(null);
        return;
      }

      if (!token || isUnauthorized) {
        // 未登录或401错误时不显示错误信息，只设置计算状态为false
        setIsCalculating(false);
        // 清空错误状态，避免显示之前的错误信息
        setError(null);
      } else {
        // 已登录且非401错误时显示错误信息
        setError(error instanceof Error ? error.message : 'MD模拟运行失败');
        setIsCalculating(false);
      }
    }
  };

  const handleNewAnalysis = () => {
    resetFormulationState();
  };

  // Reset function
  const resetFormulationState = useCallback(() => {
    setSelectedCation('Li');
    setSelectedAnions(['PF6']);
    setTotalSaltConcentration('1.00');
    setAnionFractions({'PF6': '1.00'});
    setFractionType('mole');
    setSolvents([
      { id: 1, smiles: 'CCO', fraction: '1.00' }
    ]);
    setNextSolventId(2);
    setSolventFractionType('mole');
    setIsCalculating(false);
    setCurrentView('configuration');
    setError(null);
    setSmilesErrors({});
    setShowValidation(false);
  }, []);

  // Expose reset function to parent component
  useEffect(() => {
    if (onResetRef) {
      onResetRef(resetFormulationState);
    }
  }, [onResetRef, resetFormulationState]);

  // Show results view if in results mode
  if (currentView === 'results') {
    return (
      <div className="result-tip-page">
        <ResultTip isVisible={true} onClose={handleNewAnalysis} />
      </div>
    );
  }

  return (
    <div className="formulation-module">
      <div className="module-section">
        <h2>{t('formulation.saltConfiguration.title', 'Salt Configuration')}</h2>

        <div className="module-content-card">
          {/* Cation Selection */}
          <div className="form-group">
            <label>{t('formulation.cationSelection.label', 'Cation Selection')}</label>
            <div className="ion-selection-grid">
              {cationOptions.map((option) => (
                <div
                  key={option.value}
                  className={`ion-option ${selectedCation === option.value ? 'selected' : ''} ${!option.available ? 'disabled' : ''}`}
                  onClick={() => option.available && setSelectedCation(option.value)}
                >
                  <div className="ion-symbol">{option.label}</div>
                  <div className="ion-name">{option.subLabel}</div>
                  {!option.available && (
                    <div className="coming-soon">{option.disabledText || t('formulation.comingSoon', 'Will be available soon')}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Anion Selection */}
          <div className="form-group">
            <label>{t('formulation.anionSelection.label', 'Anion Selection (Select 1-2)')}</label>
            <div className="ion-selection-grid">
              {anionOptions.map((option) => (
                <div
                  key={option.value}
                  className={`ion-option ${selectedAnions.includes(option.value) ? 'selected' : ''} ${!option.available ? 'disabled' : ''} ${selectedAnions.length >= 2 && !selectedAnions.includes(option.value) ? 'max-selected' : ''}`}
                  onClick={() => option.available && toggleAnionSelection(option.value)}
                >
                  <div className="ion-symbol">{option.label}</div>
                  <div className="ion-name">{option.subLabel}</div>
                  {!option.available && (
                    <div className="coming-soon">{t('formulation.comingSoon', 'Will be available soon')}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total Salt Concentration */}
          <div className="form-group">
            <label>{t('formulation.totalSaltConcentration.label', 'Total Salt Concentration (mol/kg)')}</label>
            <input
              type="number"
              step="0.01"
              value={totalSaltConcentration}
              onChange={(e) => setTotalSaltConcentration(e.target.value)}
              className="concentration-input"
            />
          </div>

          {/* Anion Fractions */}
          {selectedAnions.map((anion) => (
            <div key={anion} className="form-group">
              <label>{`${formatIonDisplay(anion)} Fraction`}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={anionFractions[anion] || '0'}
                onChange={(e) => updateAnionFraction(anion, e.target.value)}
                className="fraction-input"
              />
            </div>
          ))}

          {/* Fraction Type */}
          <div className="form-group">
            <label>{t('formulation.fractionType.label', 'Fraction Type')}</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  value="mole"
                  checked={fractionType === 'mole'}
                  onChange={(e) => setFractionType(e.target.value as 'mole' | 'weight')}
                />
                <span>{t('formulation.fractionType.mole', 'Mole fraction')}</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  value="weight"
                  checked={fractionType === 'weight'}
                  onChange={(e) => setFractionType(e.target.value as 'mole' | 'weight')}
                />
                <span>{t('formulation.fractionType.weight', 'Weight fraction')}</span>
              </label>
            </div>
          </div>

          {/* Salt Summary */}
          <div className="salt-summary">
            <h3>{t('formulation.saltSummary.title', 'Salt Summary')}</h3>
            <div className="summary-content">
              <p>{t('formulation.saltSummary.selected', 'Selected')}: {formatIonDisplay(selectedCation)} + {selectedAnions.map(anion => formatIonDisplay(anion)).join(' + ')}</p>
              <p>{t('formulation.saltSummary.totalConcentration', 'Total salt concentration')}: {totalSaltConcentration} mol/kg</p>
              <p>{t('formulation.saltSummary.fractions', 'Fractions')}: {selectedAnions.map(anion => `${formatIonDisplay(anion)} (${anionFractions[anion] || '0'})`).join(', ')}</p>
              <p>{t('formulation.saltSummary.fractionType', 'Fraction type')}: {fractionType === 'mole' ? t('formulation.fractionType.mole', 'Mole fraction') : t('formulation.fractionType.weight', 'Weight fraction')}</p>
              <p className={`validation-status ${isValidConfiguration() ? 'valid' : 'invalid'}`}>
                {t('formulation.saltSummary.totalFraction', 'Total fraction')}: {selectedAnions.reduce((sum, anion) => sum + parseFloat(anionFractions[anion] || '0'), 0).toFixed(2)}
                <span className="validation-icon">{isValidConfiguration() ? '✓' : '✗'}</span>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Solvent Configuration */}
      <div className="module-section">
        <h2>{t('formulation.solventConfiguration.title', 'Solvent Configuration')}</h2>

        <div className="module-content-card">
          {/* SMILES String Inputs */}
          {solvents.map((solvent, index) => (
            <div key={solvent.id} className="form-group">
              <div className="smiles-input-row">
                <div className="smiles-input-group">
                  <label>{t('formulation.smilesString.label', 'SMILES String')} {index + 1}</label>
                  <input
                    type="text"
                    placeholder={t('formulation.smilesString.placeholder', 'Enter SMILES string')}
                    value={solvent.smiles}
                    onChange={(e) => updateSolvent(solvent.id, 'smiles', e.target.value)}
                    className={`smiles-input ${smilesErrors[solvent.id] ? 'error' : ''}`}
                  />
                  {smilesErrors[solvent.id] && (
                    <div className="smiles-error-message">
                      {smilesErrors[solvent.id]}
                    </div>
                  )}
                </div>
                <div className="fraction-input-group">
                  <label>{t('formulation.fraction.label', 'Fraction (min: 0.05)')}</label>
                  <div className="fraction-input-with-remove">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={solvent.fraction}
                      onChange={(e) => updateSolvent(solvent.id, 'fraction', e.target.value)}
                      className="fraction-input"
                    />
                  </div>
                </div>
                <div className="remove-button-group">
                  {solvents.length > 1 && (
                    <button
                      type="button"
                      className="remove-solvent-btn"
                      onClick={() => removeSolvent(solvent.id)}
                      title={t('formulation.removeSolvent', 'Remove solvent')}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add SMILES Button */}
          <div className="form-group">
            <button
              type="button"
              className={`add-smiles-btn ${solvents.length >= 3 ? 'disabled' : ''}`}
              onClick={addSolvent}
              disabled={solvents.length >= 3}
            >
              + {t('formulation.addSmiles', 'Add SMILES (Max 3)')}
            </button>
          </div>

          {/* Fraction Type */}
          <div className="form-group">
            <label>{t('formulation.fractionType.label', 'Fraction Type')}</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  value="mole"
                  checked={solventFractionType === 'mole'}
                  onChange={(e) => setSolventFractionType(e.target.value as 'mole' | 'weight')}
                />
                <span>{t('formulation.fractionType.mole', 'Mole fraction')}</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  value="weight"
                  checked={solventFractionType === 'weight'}
                  onChange={(e) => setSolventFractionType(e.target.value as 'mole' | 'weight')}
                />
                <span>{t('formulation.fractionType.weight', 'Weight fraction')}</span>
              </label>
            </div>
          </div>

          {/* Solvent Summary */}
          <div className="solvent-summary">
            <h3>{t('formulation.solventSummary.title', 'Solvent Summary')}</h3>
            <div className="summary-content">
              {(() => {
                const activeSolvents = solvents.filter(s => s.smiles.trim() !== '');
                const totalFraction = activeSolvents.reduce((sum, s) => sum + parseFloat(s.fraction || '0'), 0);
                const solventNames = activeSolvents.map(s => s.smiles).join(', ') || t('formulation.solventSummary.emptyPlaceholder', 'Empty (0)');

                return (
                  <>
                    <p>{t('formulation.solventSummary.solvent', 'Solvent')}: {solventNames}</p>
                    <p>{t('formulation.solventSummary.fractionType', 'Fraction type')}: {solventFractionType === 'mole' ? t('formulation.fractionType.mole', 'Mole fraction') : t('formulation.fractionType.weight', 'Weight fraction')}</p>
                    <p className={`validation-status ${isValidSolventConfiguration() ? 'valid' : 'invalid'}`}>
                      {t('formulation.solventSummary.totalFraction', 'Total fraction')}: {totalFraction.toFixed(2)}
                      <span className="validation-icon">{isValidSolventConfiguration() ? '✓' : '✗'}</span>
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p style={{ color: 'red', padding: '10px', background: '#ffe6e6', borderRadius: '4px' }}>
            {error}
          </p>
        </div>
      )}

      {/* Submit Configuration Button */}
      <div className="submit-section">
        <button
          className={`submit-btn ${isCalculating ? 'calculating' : ''}`}
          onClick={handleCalculate}
          disabled={isCalculating || !isValidConfiguration() || !isValidSolventConfiguration()}
        >
          {isCalculating ? t('formulation.ui.calculating', 'Calculating...') : t('formulation.submit.button', 'Submit Configuration')}
        </button>
      </div>

    </div>
  );
};

export default FormulationModule;
