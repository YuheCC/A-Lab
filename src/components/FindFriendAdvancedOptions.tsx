import React from 'react';
import { useTranslation } from 'react-i18next';
import './FindFriendAdvancedOptions.css';
import InfoTooltip, { InfoTooltipContent } from '@/components/InfoTooltip';
import { Info } from 'lucide-react';

interface AdvancedProps {
  extraRequests: string;
  setExtraRequests: (v: string) => void;
  selectedMolType: string;
  setSelectedMolType: (v: string) => void;
  additiveSubtype: string;
  setAdditiveSubtype: (v: string) => void;
  computeLevel: string;
  structureWeight: number;
  setStructureWeight: (v: number) => void;

  // New in your changes
  showHypothetical: boolean;
  setShowHypothetical: (v: boolean) => void;

  userPermissions?: string;

  // Battery fields (text inputs instead of dropdowns)
  cathode?: string; setCathode?: (v: string) => void;
  anode?: string; setAnode?: (v: string) => void;
  salt?: string; setSalt?: (v: string) => void;
  solvent?: string; setSolvent?: (v: string) => void;
  metric?: string; setMetric?: (v: string) => void;

  showBatteryFields?: boolean;

  showStructureSlider?: boolean;
  structureSliderTooltip?: React.ReactNode;
}

const FindFriendAdvancedOptions: React.FC<AdvancedProps> = ({
  extraRequests,
  setExtraRequests,
  selectedMolType,
  setSelectedMolType,
  additiveSubtype,
  setAdditiveSubtype,
  computeLevel,
  structureWeight,
  setStructureWeight,

  showHypothetical,
  setShowHypothetical,

  userPermissions: _userPermissions,

  cathode = '', setCathode = () => {},
  anode = '', setAnode = () => {},
  salt = '', setSalt = () => {},
  solvent = '', setSolvent = () => {},
  metric = '', setMetric = () => {},

  showBatteryFields = true,
  showStructureSlider = true,
  structureSliderTooltip,
}) => {
  const { t } = useTranslation();
  const structureTooltip = structureSliderTooltip ?? (
    <InfoTooltipContent
      title={t('search.searchRange')}
      description={t('search.searchRangeTooltip')}
    />
  );
  const shouldShowBatteryFields = showBatteryFields && computeLevel !== 'Disabled';

  return (
    <div className="find-friend-advanced-options">
      {/* Search range (keep incoming formatting) */}
      {showStructureSlider && (
        <div className="ff-advanced-section">
          <label className="ff-advanced-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{t('search.searchRange')}</span>
            <InfoTooltip title={structureTooltip} placement="top">
              <Info size={16} className="ff-info-icon" />
            </InfoTooltip>
          </label>
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
      )}

      {/* Show hypothetical molecules (your new checkbox + tooltip) */}
      <div className="ff-advanced-section">
        <label className="ff-advanced-label" style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={showHypothetical}
            onChange={(e) => setShowHypothetical(e.target.checked)}
          />
          <span style={{ marginLeft: 4 }}>{t('search.showHypothetical')}</span>
          <InfoTooltip title={t('search.showHypotheticalTooltip')} placement="top">
            <Info size={16} className="ff-info-icon" />
          </InfoTooltip>
        </label>
      </div>

      {/* Extra requests (keep incoming formatting) */}
      <div className="ff-advanced-section">
        <label className="ff-advanced-label">{t('search.extraRequests')}</label>
        <textarea
          value={extraRequests}
          onChange={(e) => setExtraRequests(e.target.value)}
          placeholder={t('search.extraRequestsPlaceholder')}
          className="ff-advanced-textarea"
        />
      </div>

      {/* Optional recommendation text when battery fields are relevant */}
      {shouldShowBatteryFields && (
        <div className="ff-advanced-section">
          <div style={{ fontSize: '12px' }}>{t('search.batteryInfoRecommendation')}</div>
        </div>
      )}

      {/* Battery fields as TEXT INPUTS; only show when IFaF is enabled */}
      {shouldShowBatteryFields && (
        <>
          <div className="ff-advanced-section">
            <div className="ff-field-row">
              <label className="ff-advanced-label">{t('search.cathode')}:</label>
              <input
                type="text"
                value={cathode}
                onChange={(e) => setCathode(e.target.value)}
                className="ff-custom-input"
              />
            </div>
          </div>

          <div className="ff-advanced-section">
            <div className="ff-field-row">
              <label className="ff-advanced-label">{t('search.anode')}:</label>
              <input
                type="text"
                value={anode}
                onChange={(e) => setAnode(e.target.value)}
                className="ff-custom-input"
              />
            </div>
          </div>

          <div className="ff-advanced-section">
            <div className="ff-field-row">
              <label className="ff-advanced-label">{t('search.salt')}:</label>
              <input
                type="text"
                value={salt}
                onChange={(e) => setSalt(e.target.value)}
                className="ff-custom-input"
              />
            </div>
          </div>

          <div className="ff-advanced-section">
            <div className="ff-field-row">
              <label className="ff-advanced-label">{t('search.solvent')}:</label>
              <input
                type="text"
                value={solvent}
                onChange={(e) => setSolvent(e.target.value)}
                className="ff-custom-input"
              />
            </div>
          </div>

          <div className="ff-advanced-section">
            <div className="ff-field-row">
              <label className="ff-advanced-label">{t('search.performanceMetric')}:</label>
              <input
                type="text"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                className="ff-custom-input"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FindFriendAdvancedOptions;
