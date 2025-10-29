import React, { useMemo } from 'react';
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
  numResults: number;
  setNumResults: (v: number) => void;

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
  readOnly?: boolean;
  onLockedClick?: () => void;
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
  numResults,
  setNumResults,

  userPermissions,

  cathode = '', setCathode = () => {},
  anode = '', setAnode = () => {},
  salt = '', setSalt = () => {},
  solvent = '', setSolvent = () => {},
  metric = '', setMetric = () => {},

  showBatteryFields = true,
  showStructureSlider = true,
  structureSliderTooltip,
  readOnly = false,
  onLockedClick,
}) => {
  const { t } = useTranslation();
  const isReadOnly = !!readOnly;
  const handleGuardedInteraction = (event?: React.SyntheticEvent | Event) => {
    if (!isReadOnly) return false;
    if (event && 'preventDefault' in event) {
      event.preventDefault();
      event.stopPropagation?.();
    }
    if (typeof onLockedClick === 'function') {
      onLockedClick();
    }
    return true;
  };
  const structureTooltip = structureSliderTooltip ?? (
    <InfoTooltipContent
      title={t('search.searchRange')}
      description={t('search.searchRangeTooltip')}
    />
  );
  const shouldShowBatteryFields = showBatteryFields && computeLevel !== 'Disabled';
  const readOnlyFieldStyle: React.CSSProperties | undefined = isReadOnly
    ? { backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }
    : undefined;
  const numResultOptions = useMemo(() => {
    const baseOptions = [5, 10, 20, 30];
    const adminExtras = [50, 100, 250, 500];
    const options = userPermissions === 'admin'
      ? [...baseOptions, ...adminExtras]
      : baseOptions;
    return options.includes(numResults)
      ? options
      : [...options, numResults].sort((a, b) => a - b);
  }, [numResults, userPermissions]);

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
              onChange={(e) => {
                if (handleGuardedInteraction(e)) return;
                setStructureWeight(parseFloat(e.target.value));
              }}
              className="ff-advanced-range"
              onMouseDown={(event) => {
                handleGuardedInteraction(event);
              }}
              aria-disabled={isReadOnly}
            />
            <span className="ff-range-label">{t('search.nearbyFriends')}</span>
            <span className="ff-range-value">{structureWeight.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Show hypothetical molecules (your new checkbox + tooltip) */}
      <div className="ff-advanced-section">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <label className="ff-advanced-label" style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={showHypothetical}
              onChange={(e) => {
                if (handleGuardedInteraction(e)) return;
                setShowHypothetical(e.target.checked);
              }}
              aria-disabled={isReadOnly}
            />
            <span style={{ marginLeft: 4 }}>{t('search.showHypothetical')}</span>
            <InfoTooltip title={t('search.showHypotheticalTooltip')} placement="top">
              <Info size={16} className="ff-info-icon" />
            </InfoTooltip>
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="ff-advanced-label">{t('search.resultsToDisplay', 'Results to display')}</span>
            <select
              value={numResults}
              onChange={(e) => {
                if (handleGuardedInteraction(e)) return;
                setNumResults(Number(e.target.value));
              }}
              onMouseDown={(event) => {
                if (handleGuardedInteraction(event)) return;
              }}
              style={{
                padding: '4px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: isReadOnly ? '#f1f5f9' : 'white',
                color: isReadOnly ? '#94a3b8' : undefined,
                cursor: isReadOnly ? 'not-allowed' : 'pointer',
              }}
              aria-label={t('search.resultsToDisplay', 'Results to display')}
              aria-disabled={isReadOnly}
            >
              {numResultOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Extra requests (keep incoming formatting) */}
      <div className="ff-advanced-section">
        <label className="ff-advanced-label">{t('search.extraRequests')}</label>
          <textarea
            value={extraRequests}
            onChange={(e) => {
              if (handleGuardedInteraction(e)) return;
              setExtraRequests(e.target.value);
            }}
            placeholder={t('search.extraRequestsPlaceholder')}
            className="ff-advanced-textarea"
            readOnly={isReadOnly}
            onMouseDown={(event) => {
              handleGuardedInteraction(event);
            }}
            style={readOnlyFieldStyle}
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
                onChange={(e) => {
                  if (handleGuardedInteraction(e)) return;
                  setCathode(e.target.value);
                }}
                className="ff-custom-input"
                readOnly={isReadOnly}
                onMouseDown={(event) => {
                  handleGuardedInteraction(event);
                }}
                style={readOnlyFieldStyle}
              />
            </div>
          </div>

          <div className="ff-advanced-section">
            <div className="ff-field-row">
              <label className="ff-advanced-label">{t('search.anode')}:</label>
              <input
                type="text"
                value={anode}
                onChange={(e) => {
                  if (handleGuardedInteraction(e)) return;
                  setAnode(e.target.value);
                }}
                className="ff-custom-input"
                readOnly={isReadOnly}
                onMouseDown={(event) => {
                  handleGuardedInteraction(event);
                }}
                style={readOnlyFieldStyle}
              />
            </div>
          </div>

          <div className="ff-advanced-section">
            <div className="ff-field-row">
              <label className="ff-advanced-label">{t('search.salt')}:</label>
              <input
                type="text"
                value={salt}
                onChange={(e) => {
                  if (handleGuardedInteraction(e)) return;
                  setSalt(e.target.value);
                }}
                className="ff-custom-input"
                readOnly={isReadOnly}
                onMouseDown={(event) => {
                  handleGuardedInteraction(event);
                }}
                style={readOnlyFieldStyle}
              />
            </div>
          </div>

          <div className="ff-advanced-section">
            <div className="ff-field-row">
              <label className="ff-advanced-label">{t('search.solvent')}:</label>
              <input
                type="text"
                value={solvent}
                onChange={(e) => {
                  if (handleGuardedInteraction(e)) return;
                  setSolvent(e.target.value);
                }}
                className="ff-custom-input"
                readOnly={isReadOnly}
                onMouseDown={(event) => {
                  handleGuardedInteraction(event);
                }}
                style={readOnlyFieldStyle}
              />
            </div>
          </div>

          <div className="ff-advanced-section">
            <div className="ff-field-row">
              <label className="ff-advanced-label">{t('search.performanceMetric')}:</label>
              <input
                type="text"
                value={metric}
                onChange={(e) => {
                  if (handleGuardedInteraction(e)) return;
                  setMetric(e.target.value);
                }}
                className="ff-custom-input"
                readOnly={isReadOnly}
                onMouseDown={(event) => {
                  handleGuardedInteraction(event);
                }}
                style={readOnlyFieldStyle}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FindFriendAdvancedOptions;
