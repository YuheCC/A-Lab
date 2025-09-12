import { useTranslation } from 'react-i18next';
import React from 'react';
import './FindFriendAdvancedOptions.css';

interface AdvancedProps {
  extraRequests: string;
  setExtraRequests: (v: string) => void;
  selectedMolType: string;
  setSelectedMolType: (v: string) => void;
  additiveSubtype: string;
  setAdditiveSubtype: (v: string) => void;
  computeLevel: string;
  setComputeLevel: (v: string) => void;
  structureWeight: number;
  setStructureWeight: (v: number) => void;
  userPermissions?: string;
  // Admin/battery-specific fields
  cathode?: string; setCathode?: (v: string) => void;
  cathodeCustom?: string; setCathodeCustom?: (v: string) => void;
  anode?: string; setAnode?: (v: string) => void;
  anodeCustom?: string; setAnodeCustom?: (v: string) => void;
  salt?: string; setSalt?: (v: string) => void;
  saltCustom?: string; setSaltCustom?: (v: string) => void;
  solvent?: string; setSolvent?: (v: string) => void;
  solventCustom?: string; setSolventCustom?: (v: string) => void;
  metric?: string; setMetric?: (v: string) => void;
  metricCustom?: string; setMetricCustom?: (v: string) => void;
  cathodeOptions?: string[];
  anodeOptions?: string[];
  saltOptions?: string[];
  solventOptions?: string[];
  performanceOptions?: string[];
  showBatteryFields?: boolean;
}

const FindFriendAdvancedOptions: React.FC<AdvancedProps> = ({
  extraRequests,
  setExtraRequests,
  selectedMolType,
  setSelectedMolType,
  additiveSubtype,
  setAdditiveSubtype,
  computeLevel,
  setComputeLevel,
  structureWeight,
  setStructureWeight,
  userPermissions,
  cathode = '',
  setCathode = () => {},
  cathodeCustom = '',
  setCathodeCustom = () => {},
  anode = '',
  setAnode = () => {},
  anodeCustom = '',
  setAnodeCustom = () => {},
  salt = '',
  setSalt = () => {},
  saltCustom = '',
  setSaltCustom = () => {},
  solvent = '',
  setSolvent = () => {},
  solventCustom = '',
  setSolventCustom = () => {},
  metric = '',
  setMetric = () => {},
  metricCustom = '',
  setMetricCustom = () => {},
  cathodeOptions = [],
  anodeOptions = [],
  saltOptions = [],
  solventOptions = [],
  performanceOptions = [],
  showBatteryFields = true,
}) => {
  const { t } = useTranslation();

  return (
    <div className="find-friend-advanced-options">
      <div className="ff-advanced-section">
        <label className="ff-advanced-label">{t('search.searchRange')}</label>
        <div className="ff-range-container">
          <span className="ff-range-label">{t('search.distantFriends')}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={structureWeight}
            onChange={(e) => setStructureWeight(parseFloat(e.target.value))}
            className="ff-advanced-range"
          />
          <span className="ff-range-label">{t('search.nearbyFriends')}</span>
          <span className="ff-range-value">{structureWeight.toFixed(2)}</span>
        </div>
      </div>
      <div className="ff-advanced-section">
        <label className="ff-advanced-label">{t('search.extraRequests')}</label>
        <textarea
          value={extraRequests}
          onChange={e => setExtraRequests(e.target.value)}
          placeholder={t('search.extraRequestsPlaceholder')}
          className="ff-advanced-textarea"
        />
      </div>
      <div className="ff-advanced-section">
        <label className="ff-advanced-label">{t('search.intelligentCompute')}</label>
        <select
          value={computeLevel}
          onChange={e => setComputeLevel(e.target.value)}
          className="ff-advanced-select"
        >
          <option value="Disabled">{t('search.computeDisabled')}</option>
          <option value="Low">{t('search.computeLow')}</option>
          <option
            value="Medium"
            disabled={userPermissions === 'research'}
            title={userPermissions === 'research' ? t('search.upgradeAccount') : ''}
          >
            {t('search.computeMedium')}{userPermissions === 'research' ? ' 🔒' : ''}
          </option>
          <option
            value="High"
            disabled={["research", "explorer", "team"].includes(userPermissions || '')}
            title={["research", "explorer", "team"].includes(userPermissions || '') ? t('search.upgradeEnterprise') : ''}
          >
            {t('search.computeHigh')}{["research", "explorer", "team"].includes(userPermissions || '') ? ' 🔒' : ''}
          </option>
          {userPermissions === 'admin' && <option value="Extreme">{t('search.computeExtreme')}</option>}
        </select>
      </div>
      {showBatteryFields && userPermissions === 'admin' && (
        <>
          <div className="ff-advanced-section">
            <div className="ff-field-row">
              <label className="ff-advanced-label">{t('search.cathode')}:</label>
              <select
                value={cathode}
                onChange={e => setCathode(e.target.value)}
                disabled={computeLevel === 'Disabled'}
                className="ff-advanced-select"
              >
                <option value=""></option>
                {cathodeOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="custom">{t('search.custom')}</option>
              </select>
              {cathode === 'custom' && (
                <input
                  type="text"
                  value={cathodeCustom}
                  onChange={e => setCathodeCustom(e.target.value)}
                  disabled={computeLevel === 'Disabled'}
                  className="ff-custom-input"
                />
              )}
            </div>
          </div>
          <div className="ff-advanced-section">
            <div className="ff-field-row">
              <label className="ff-advanced-label">{t('search.anode')}:</label>
              <select
                value={anode}
                onChange={e => setAnode(e.target.value)}
                disabled={computeLevel === 'Disabled'}
                className="ff-advanced-select"
              >
                <option value=""></option>
                {anodeOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="custom">{t('search.custom')}</option>
              </select>
              {anode === 'custom' && (
                <input
                  type="text"
                  value={anodeCustom}
                  onChange={e => setAnodeCustom(e.target.value)}
                  disabled={computeLevel === 'Disabled'}
                  className="ff-custom-input"
                />
              )}
            </div>
          </div>
          <div className="ff-advanced-section">
            <div className="ff-field-row">
              <label className="ff-advanced-label">{t('search.salt')}:</label>
              <select
                value={salt}
                onChange={e => setSalt(e.target.value)}
                disabled={computeLevel === 'Disabled'}
                className="ff-advanced-select"
              >
                <option value=""></option>
                {saltOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="custom">{t('search.custom')}</option>
              </select>
              {salt === 'custom' && (
                <input
                  type="text"
                  value={saltCustom}
                  onChange={e => setSaltCustom(e.target.value)}
                  disabled={computeLevel === 'Disabled'}
                  className="ff-custom-input"
                />
              )}
            </div>
          </div>
          <div className="ff-advanced-section">
            <div className="ff-field-row">
              <label className="ff-advanced-label">{t('search.solvent')}:</label>
              <select
                value={solvent}
                onChange={e => setSolvent(e.target.value)}
                disabled={computeLevel === 'Disabled'}
                className="ff-advanced-select"
              >
                <option value=""></option>
                {solventOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="custom">{t('search.custom')}</option>
              </select>
              {solvent === 'custom' && (
                <input
                  type="text"
                  value={solventCustom}
                  onChange={e => setSolventCustom(e.target.value)}
                  disabled={computeLevel === 'Disabled'}
                  className="ff-custom-input"
                />
              )}
            </div>
          </div>
          <div className="ff-advanced-section">
            <div className="ff-field-row">
              <label className="ff-advanced-label">{t('search.performanceMetric')}:</label>
              <select
                value={metric}
                onChange={e => setMetric(e.target.value)}
                disabled={computeLevel === 'Disabled'}
                className="ff-advanced-select"
              >
                <option value=""></option>
                {performanceOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="custom">{t('search.custom')}</option>
              </select>
              {metric === 'custom' && (
                <input
                  type="text"
                  value={metricCustom}
                  onChange={e => setMetricCustom(e.target.value)}
                  disabled={computeLevel === 'Disabled'}
                  className="ff-custom-input"
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FindFriendAdvancedOptions;