import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ResultsDisplay from './ResultsDisplay';
import './FormulationModule.css';

interface FormulationModuleProps {
  onResetRef?: (resetFn: () => void) => void;
}

const FormulationModule: React.FC<FormulationModuleProps> = ({ onResetRef }) => {
  const { t } = useTranslation();

  // Salt Configuration State
  const [selectedCation, setSelectedCation] = useState('Li+');
  const [selectedAnion, setSelectedAnion] = useState('BF4-');
  const [totalSaltConcentration, setTotalSaltConcentration] = useState('1.00');
  const [anionFraction, setAnionFraction] = useState('0.50');
  const [fractionType, setFractionType] = useState<'mole' | 'weight'>('mole');

  // Solvent Configuration State
  const [solvents, setSolvents] = useState([
    { id: 1, smiles: 'CCO', fraction: '1.00' },
    { id: 2, smiles: '', fraction: '0' },
    { id: 3, smiles: '', fraction: '0' }
  ]);
  const [solventFractionType, setSolventFractionType] = useState<'mole' | 'weight'>('mole');

  // Results state
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentView, setCurrentView] = useState<'configuration' | 'results'>('configuration');

  // Validation logic
  const isValidConfiguration = () => {
    const concentration = parseFloat(totalSaltConcentration);
    const fraction = parseFloat(anionFraction);
    return concentration > 0 && fraction >= 0 && fraction <= 1;
  };

  // Solvent validation logic
  const isValidSolventConfiguration = () => {
    const activeSolvents = solvents.filter(s => s.smiles.trim() !== '');
    const totalFraction = activeSolvents.reduce((sum, s) => sum + parseFloat(s.fraction || '0'), 0);
    return activeSolvents.length > 0 && Math.abs(totalFraction - 1) < 0.001;
  };

  // Solvent management functions
  const updateSolvent = (id: number, field: 'smiles' | 'fraction', value: string) => {
    setSolvents(prev => prev.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const removeSolvent = (id: number) => {
    setSolvents(prev => prev.map(s =>
      s.id === id ? { ...s, smiles: '', fraction: '0' } : s
    ));
  };

  const addSolvent = () => {
    const emptySolvent = solvents.find(s => s.smiles.trim() === '');
    if (emptySolvent) {
      updateSolvent(emptySolvent.id, 'fraction', '0');
    }
  };

  const getActiveSolventsCount = () => solvents.filter(s => s.smiles.trim() !== '').length;

  // Format ion display
  const formatIonDisplay = (ionValue: string) => {
    const ionMap: { [key: string]: string } = {
      'Li+': 'Li⁺',
      'Na+': 'Na⁺',
      'Mg2+': 'Mg²⁺',
      'Zn2+': 'Zn²⁺',
      'BF4-': 'BF₄⁻',
      'PF6-': 'PF₆⁻',
      'FSI-': 'FSI⁻',
      'TFSI-': 'TFSI⁻'
    };
    return ionMap[ionValue] || ionValue;
  };

  // Available options
  const cationOptions = [
    { value: 'Li+', label: 'Li⁺', subLabel: 'Lithium', available: true },
    { value: 'Na+', label: 'Na⁺', subLabel: 'Sodium', available: false },
    { value: 'Mg2+', label: 'Mg²⁺', subLabel: 'Magnesium', available: false },
    { value: 'Zn2+', label: 'Zn²⁺', subLabel: 'Zinc', available: false }
  ];

  const anionOptions = [
    { value: 'BF4-', label: 'BF₄⁻', subLabel: 'Tetrafluoroborate', available: true },
    { value: 'PF6-', label: 'PF₆⁻', subLabel: 'Hexafluorophosphate', available: false },
    { value: 'FSI-', label: 'FSI⁻', subLabel: 'Bis(fluorosulfonyl)imide', available: false },
    { value: 'TFSI-', label: 'TFSI⁻', subLabel: 'Bis(trifluoromethylsulfonyl)imide', available: false }
  ];

  const handleCalculate = async () => {
    setIsCalculating(true);

    // Simulate calculation delay
    setTimeout(() => {
      setIsCalculating(false);
      setShowResults(true);
      setCurrentView('results');
    }, 2000);
  };

  const handleNewAnalysis = () => {
    setCurrentView('configuration');
    setShowResults(false);
    setIsCalculating(false);
  };

  // Reset function
  const resetFormulationState = useCallback(() => {
    setSelectedCation('Li+');
    setSelectedAnion('BF4-');
    setTotalSaltConcentration('1.00');
    setAnionFraction('0.50');
    setFractionType('mole');
    setSolvents([
      { id: 1, smiles: 'CCO', fraction: '1.00' },
      { id: 2, smiles: '', fraction: '0' },
      { id: 3, smiles: '', fraction: '0' }
    ]);
    setSolventFractionType('mole');
    setShowResults(false);
    setIsCalculating(false);
    setCurrentView('configuration');
  }, []);

  // Expose reset function to parent component
  useEffect(() => {
    if (onResetRef) {
      onResetRef(resetFormulationState);
    }
  }, [onResetRef, resetFormulationState]);

  // Show results view if in results mode
  if (currentView === 'results') {
    return <ResultsDisplay onNewAnalysis={handleNewAnalysis} />;
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
                    <div className="coming-soon">{t('formulation.comingSoon', 'Will be available soon')}</div>
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
                  className={`ion-option ${selectedAnion === option.value ? 'selected' : ''} ${!option.available ? 'disabled' : ''}`}
                  onClick={() => option.available && setSelectedAnion(option.value)}
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

          {/* Anion Fraction */}
          <div className="form-group">
            <label>{t('formulation.anionFraction.label', 'BF₄⁻ Fraction')}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={anionFraction}
              onChange={(e) => setAnionFraction(e.target.value)}
              className="fraction-input"
            />
          </div>

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
              <p>{t('formulation.saltSummary.selected', 'Selected')}: {formatIonDisplay(selectedCation)} + {formatIonDisplay(selectedAnion)}</p>
              <p>{t('formulation.saltSummary.totalConcentration', 'Total salt concentration')}: {totalSaltConcentration} mol/kg</p>
              <p>{t('formulation.saltSummary.fractions', 'Fractions')}: {formatIonDisplay(selectedAnion)} ({anionFraction})</p>
              <p>{t('formulation.saltSummary.fractionType', 'Fraction type')}: {fractionType === 'mole' ? t('formulation.fractionType.mole', 'Mole fraction') : t('formulation.fractionType.weight', 'Weight fraction')}</p>
              <p className={`validation-status ${isValidConfiguration() ? 'valid' : 'invalid'}`}>
                {t('formulation.saltSummary.totalFraction', 'Total fraction')}: {anionFraction}
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
                    className="smiles-input"
                  />
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
                      disabled={!solvent.smiles.trim()}
                    />
                  </div>
                </div>
                <div className="remove-button-group">
                  {solvent.smiles.trim() && (
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
              className={`add-smiles-btn ${getActiveSolventsCount() >= 3 ? 'disabled' : ''}`}
              onClick={addSolvent}
              disabled={getActiveSolventsCount() >= 3}
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
                const solventNames = activeSolvents.map(s => s.smiles).join(', ') || t('formulation.solventSummary.emptyPlaceholder', 'Empty (0), Empty (0)');

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

      {/* Submit Configuration Button */}
      <div className="submit-section">
        <button
          className={`submit-btn ${showResults ? 'calculated' : ''} ${isCalculating ? 'calculating' : ''}`}
          onClick={handleCalculate}
          disabled={isCalculating || showResults}
        >
          {isCalculating ? t('formulation.ui.calculating', 'Calculating...') : t('formulation.submit.button', 'Submit Configuration')}
        </button>
      </div>
    </div>
  );
};

export default FormulationModule;