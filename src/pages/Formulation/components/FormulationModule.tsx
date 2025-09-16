import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

  // Results state
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Available options
  const cationOptions = [
    { value: 'Li+', label: 'Li+', subLabel: 'Lithium', available: true },
    { value: 'Na+', label: 'Na+', subLabel: 'Sodium', available: false },
    { value: 'Mg2+', label: 'Mg2+', subLabel: 'Magnesium', available: false },
    { value: 'Zn2+', label: 'Zn2+', subLabel: 'Zinc', available: false }
  ];

  const anionOptions = [
    { value: 'BF4-', label: 'BF4-', subLabel: 'Tetrafluoroborate', available: true },
    { value: 'PF6-', label: 'PF6-', subLabel: 'Hexafluorophosphate', available: false },
    { value: 'FSI-', label: 'FSI-', subLabel: 'Bis(fluorosulfonyl)imide', available: false },
    { value: 'TFSI-', label: 'TFSI-', subLabel: 'Bis(trifluoromethylsulfonyl)imide', available: false }
  ];

  const handleCalculate = async () => {
    setIsCalculating(true);

    // Simulate calculation delay
    setTimeout(() => {
      setIsCalculating(false);
      setShowResults(true);
    }, 2000);
  };

  // Reset function
  const resetFormulationState = useCallback(() => {
    setSelectedCation('Li+');
    setSelectedAnion('BF4-');
    setTotalSaltConcentration('1.00');
    setAnionFraction('0.50');
    setFractionType('mole');
    setShowResults(false);
    setIsCalculating(false);
  }, []);

  // Expose reset function to parent component
  useEffect(() => {
    if (onResetRef) {
      onResetRef(resetFormulationState);
    }
  }, [onResetRef, resetFormulationState]);

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
            <label>{t('formulation.anionFraction.label', 'BF4- Fraction')}</label>
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
              <p>{t('formulation.saltSummary.selected', 'Selected')}: {selectedCation} + {selectedAnion}-</p>
              <p>{t('formulation.saltSummary.totalConcentration', 'Total salt concentration')}: {totalSaltConcentration} mol/kg</p>
              <p>{t('formulation.saltSummary.fractions', 'Fractions')}: {selectedAnion}- ({anionFraction})</p>
            </div>
          </div>

          <button
            className={`calculate-btn ${showResults ? 'calculated' : ''} ${isCalculating ? 'calculating' : ''}`}
            onClick={handleCalculate}
            disabled={isCalculating || showResults}
          >
            {isCalculating ? t('formulation.ui.calculating', 'Calculating...') : t('formulation.calculate.button', 'Calculate')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormulationModule;