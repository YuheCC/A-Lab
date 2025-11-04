
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useMemo } from 'react';
import FindFriendAdvancedOptions from '@/components/FindFriendAdvancedOptions';
import InfoTooltip, { InfoTooltipContent } from '@/components/InfoTooltip';
import type { QueryLimitInfo } from '@/types/queryLimit';
import { formatQueryLimitLabel } from '@/utils/queryLimit';
import type { AdditiveCategoryType, AdditiveOptionsByCategory } from '@/constants/additiveCategories';
import {
  ADDITIVE_CATEGORY_LABEL_KEYS,
  ADDITIVE_OPTIONS_BY_CATEGORY,
  DEFAULT_ADDITIVE_CATEGORY,
  DEFAULT_ADDITIVE_SUBTYPE,
  getDefaultSubtypeForCategory,
  isValidAdditiveSubtype,
} from '@/constants/additiveCategories';

export interface MolTypeOption {
  value: string;
  /** Translation key under `search.moleculeTypes`. */
  labelKey: string;
}

export const DEFAULT_MOL_TYPE_OPTIONS: MolTypeOption[] = [
  { value: 'solvent', labelKey: 'solvent' },
  { value: 'cosolvent', labelKey: 'cosolvent' },
  { value: 'diluent', labelKey: 'diluent' },
  { value: 'additive', labelKey: 'additive' },
];

interface FindFriendOptionsProps {
  extraRequests: string;
  setExtraRequests: (v: string) => void;
  showAdvanced: boolean;
  setShowAdvanced: (v: boolean) => void;
  selectedMolType: string;
  setSelectedMolType: (v: string) => void;
  additiveCategory: AdditiveCategoryType;
  setAdditiveCategory: (v: AdditiveCategoryType) => void;
  additiveSubtype: string;
  setAdditiveSubtype: (v: string) => void;
  computeLevel: string;
  setComputeLevel: (v: string) => void;
  structureWeight: number;
  setStructureWeight: (v: number) => void;
  showHypothetical: boolean;
  setShowHypothetical: (v: boolean) => void;
  numResults: number;
  setNumResults: (v: number) => void;
  cathode: string;
  setCathode: (v: string) => void;
  anode: string;
  setAnode: (v: string) => void;
  salt: string;
  setSalt: (v: string) => void;
  solvent: string;
  setSolvent: (v: string) => void;
  metric: string;
  setMetric: (v: string) => void;
  userPermissions?: string;
  enableMolTypeSelector?: boolean;
  showStructureSlider?: boolean;
  structureSliderTooltip?: React.ReactNode;
  findFriendLimitInfo?: QueryLimitInfo;
  showBatteryFields?: boolean;
  readOnly?: boolean;
  onLockedClick?: () => void;
  additiveOptionsByCategory?: AdditiveOptionsByCategory;
  molTypeOptions?: MolTypeOption[];
  onSubmitSearch?: () => void;
  submitDisabled?: boolean;
}

const FindFriendOptions: React.FC<FindFriendOptionsProps> = ({
  extraRequests,
  setExtraRequests,
  showAdvanced,
  setShowAdvanced,
  selectedMolType,
  setSelectedMolType,
  additiveCategory,
  setAdditiveCategory,
  additiveSubtype,
  setAdditiveSubtype,
  computeLevel,
  setComputeLevel,
  structureWeight,
  setStructureWeight,
  showHypothetical,
  setShowHypothetical,
  numResults,
  setNumResults,
  cathode,
  setCathode,
  anode,
  setAnode,
  salt,
  setSalt,
  solvent,
  setSolvent,
  metric,
  setMetric,
  userPermissions,
  enableMolTypeSelector = true,
  showStructureSlider = true,
  structureSliderTooltip,
  findFriendLimitInfo,
  showBatteryFields = true,
  readOnly = false,
  onLockedClick,
  additiveOptionsByCategory,
  molTypeOptions,
  onSubmitSearch,
  submitDisabled,
}) => {
  const { t } = useTranslation();

  const handleGuardedInteraction = (event?: React.SyntheticEvent | Event) => {
    if (!readOnly) return false;
    if (event && 'preventDefault' in event) {
      event.preventDefault();
      event.stopPropagation?.();
    }
    if (typeof onLockedClick === 'function') {
      onLockedClick();
    }
    return true;
  };

  const toggleAdvanced = () => {
    if (handleGuardedInteraction()) return;
    setShowAdvanced(!showAdvanced);
  };

  const handleAdvancedToggleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (handleGuardedInteraction(event)) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleAdvanced();
    }
  };

  const intelligentLimitLabel = formatQueryLimitLabel(
    findFriendLimitInfo,
    t,
    'search.intelligentFindFriendsLimitLabel',
  );

  const additiveOptionsMap = useMemo(
    () => additiveOptionsByCategory ?? ADDITIVE_OPTIONS_BY_CATEGORY,
    [additiveOptionsByCategory],
  );

  const additiveOptionList = useMemo(
    () => additiveOptionsMap[additiveCategory],
    [additiveCategory, additiveOptionsMap],
  );

  const molTypeOptionList = useMemo(
    () => molTypeOptions ?? DEFAULT_MOL_TYPE_OPTIONS,
    [molTypeOptions],
  );

  useEffect(() => {
    if (selectedMolType !== 'additive') {
      return;
    }
    if (!isValidAdditiveSubtype(additiveCategory, additiveSubtype, additiveOptionsMap)) {
      setAdditiveSubtype(getDefaultSubtypeForCategory(additiveCategory));
    }
  }, [additiveCategory, additiveSubtype, additiveOptionsMap, selectedMolType, setAdditiveSubtype]);

  useEffect(() => {
    if (molTypeOptionList.some((option) => option.value === selectedMolType)) {
      return;
    }
    const fallbackType = molTypeOptionList[0]?.value;
    if (!fallbackType) {
      return;
    }
    setSelectedMolType(fallbackType);
    if (fallbackType === 'additive') {
      setAdditiveCategory(DEFAULT_ADDITIVE_CATEGORY);
      setAdditiveSubtype(DEFAULT_ADDITIVE_SUBTYPE[DEFAULT_ADDITIVE_CATEGORY]);
    }
  }, [molTypeOptionList, selectedMolType, setSelectedMolType, setAdditiveCategory, setAdditiveSubtype]);

  const readOnlyFieldStyle: React.CSSProperties | undefined = readOnly
    ? { backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }
    : undefined;

  const labelRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    fontSize: '14px',
    fontWeight: 500,
    color: '#0f172a',
    margin: 0,
  };

  const selectBaseStyle = (disabled: boolean): React.CSSProperties => ({
    backgroundColor: disabled ? '#f1f5f9' : 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '4px 12px',
    color: disabled ? '#94a3b8' : undefined,
    cursor: disabled ? 'not-allowed' : 'pointer',
  });

  return (
    <>
    <div>
      <div
        className="search-option"
        style={{
          flex: '0 0 100%',
          width: '100%',
          minWidth: 0,
          opacity: readOnly ? 0.6 : 1,
          marginBottom: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          <textarea
            value={extraRequests}
            onChange={(e) => {
              if (handleGuardedInteraction(e)) return;
              setExtraRequests(e.target.value);
            }}
            placeholder={t('search.extraRequestsPlaceholder')}
            className="ff-advanced-textarea"
            readOnly={readOnly}
            onMouseDown={(event) => {
              handleGuardedInteraction(event);
            }}
            style={{
              ...readOnlyFieldStyle,
              minHeight: '40px',
              padding: '12px',
              margin: 0,
              width: '100%',
              resize: 'vertical',
            }}
            aria-label={t('search.extraRequestsPlaceholder')}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                width: '100%',
              }}
            >
              <div style={labelRowStyle}>
                <span>{t('search.findFriendsLabel')}</span>
                <InfoTooltip
                  title={(
                    <InfoTooltipContent
                      title={t('search.useCaseTooltipTitle')}
                      description={t('search.useCaseTooltipDescription')}
                    />
                  )}
                  placement="top"
                >
                  <Info size={16} className="ff-info-icon" />
                </InfoTooltip>
              </div>

              {enableMolTypeSelector && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    opacity: readOnly ? 0.6 : 1,
                  }}
                >
                  <select
                    value={selectedMolType}
                    onChange={(e) => {
                      if (handleGuardedInteraction(e)) return;
                      const newType = e.target.value;
                      setSelectedMolType(newType);
                      if (selectedMolType !== 'additive' && newType === 'additive') {
                        setAdditiveCategory(DEFAULT_ADDITIVE_CATEGORY);
                        setAdditiveSubtype(DEFAULT_ADDITIVE_SUBTYPE[DEFAULT_ADDITIVE_CATEGORY]);
                      }
                    }}
                      style={selectBaseStyle(readOnly)}
                      onMouseDown={(event) => {
                        if (handleGuardedInteraction(event)) return;
                      }}
                      aria-disabled={readOnly}
                    >
                      {molTypeOptionList.map(({ value, labelKey }) => (
                        <option key={value} value={value}>
                          {t(`search.moleculeTypes.${labelKey}`, labelKey)}
                        </option>
                      ))}
                    </select>
                    {selectedMolType === 'additive' && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <select
                          value={additiveCategory}
                          onChange={(e) => {
                            if (handleGuardedInteraction(e)) return;
                            const newCategory = e.target.value as AdditiveCategoryType;
                          setAdditiveCategory(newCategory);
                          setAdditiveSubtype(getDefaultSubtypeForCategory(newCategory));
                        }}
                        style={selectBaseStyle(readOnly)}
                        onMouseDown={(event) => {
                          if (handleGuardedInteraction(event)) return;
                        }}
                        aria-disabled={readOnly}
                      >
                        {Object.entries(ADDITIVE_CATEGORY_LABEL_KEYS).map(([key, labelKey]) => (
                          <option key={key} value={key}>
                            {t(`search.moleculeTypes.additiveCategories.${labelKey}`)}
                          </option>
                        ))}
                      </select>
                      <select
                        value={additiveSubtype}
                        onChange={(e) => {
                          if (handleGuardedInteraction(e)) return;
                          setAdditiveSubtype(e.target.value);
                        }}
                        style={selectBaseStyle(readOnly)}
                        onMouseDown={(event) => {
                          if (handleGuardedInteraction(event)) return;
                        }}
                        aria-label={t('search.moleculeTypes.additiveSubtype')}
                        aria-disabled={readOnly}
                      >
                        {additiveOptionList.map((option) => (
                          <option key={option.value} value={option.value}>
                            {t(`search.moleculeTypes.additiveCategories.${option.labelKey}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  opacity: readOnly ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ whiteSpace: 'nowrap' }}>{t('search.intelligentFindFriendsLabel')}</span>
                <InfoTooltip
                  title={(
                    <InfoTooltipContent
                      title={t('search.intelligentFindFriendsLabel')}
                      description={t('search.intelligentFindFriendsTooltip')}
                      remainingLabel={intelligentLimitLabel}
                    />
                  )}
                  placement="top"
                >
                  <Info size={16} className="ff-info-icon" />
                </InfoTooltip>
                <select
                  value={computeLevel}
                  onChange={(e) => {
                    if (handleGuardedInteraction(e)) return;
                    setComputeLevel(e.target.value);
                  }}
                  style={selectBaseStyle(readOnly)}
                  onMouseDown={(event) => {
                    if (handleGuardedInteraction(event)) return;
                  }}
                  aria-disabled={readOnly}
                >
                  <option value="Disabled">{t('search.computeDisabled')}</option>
                  <option value="Low">{t('search.computeLow')}</option>
                  <option
                    value="Medium"
                    disabled={userPermissions === 'research'}
                    title={userPermissions === 'research' ? t('search.upgradeAccount') : ''}
                  >
                    {t('search.computeMedium')}
                    {userPermissions === 'research' ? ' 🔒' : ''}
                  </option>
                  <option
                    value="High"
                    disabled={['research', 'explorer', 'team'].includes(userPermissions || '')}
                    title={['research', 'explorer', 'team'].includes(userPermissions || '') ? t('search.upgradeEnterprise') : ''}
                  >
                    {t('search.computeHigh')}
                    {['research', 'explorer', 'team'].includes(userPermissions || '') ? ' 🔒' : ''}
                  </option>
                  {userPermissions === 'admin' && <option value="Extreme">{t('search.computeExtreme')}</option>}
                </select>
              </div>
              <div
                role="button"
                tabIndex={0}
                aria-expanded={showAdvanced}
                onClick={toggleAdvanced}
                onKeyDown={handleAdvancedToggleKeyDown}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: readOnly ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  border: '1px solid #2563eb',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  color: '#2563eb',
                  fontWeight: 500,
                  fontSize: '13px',
                  transition: 'background-color 0.2s',
                  backgroundColor: showAdvanced ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  opacity: readOnly ? 0.5 : 1,
                }}
              >
                <span>{t('search.advancedOptions')}</span>
                {showAdvanced ? (
                  <ChevronUp size={14} style={{ marginLeft: '6px' }} />
                ) : (
                  <ChevronDown size={14} style={{ marginLeft: '6px' }} />
                )}
                </div>
              </div>

            {showAdvanced && (
              <FindFriendAdvancedOptions
                selectedMolType={selectedMolType}
                setSelectedMolType={setSelectedMolType}
                additiveSubtype={additiveSubtype}
                setAdditiveSubtype={setAdditiveSubtype}
                computeLevel={computeLevel}
                structureWeight={structureWeight}
                setStructureWeight={setStructureWeight}
                showHypothetical={showHypothetical}
                setShowHypothetical={setShowHypothetical}
                numResults={numResults}
                setNumResults={setNumResults}
                userPermissions={userPermissions}
                cathode={cathode}
                setCathode={setCathode}
                anode={anode}
                setAnode={setAnode}
                salt={salt}
                setSalt={setSalt}
                solvent={solvent}
                setSolvent={setSolvent}
                metric={metric}
                setMetric={setMetric}
                showBatteryFields={showBatteryFields}
                showStructureSlider={showStructureSlider}
                structureSliderTooltip={structureSliderTooltip}
                readOnly={readOnly}
                onLockedClick={onLockedClick}
              />
            )}

              {typeof onSubmitSearch === 'function' && (
                <div className="search-submit-container">
                  <button
                    className="search-button"
                    onClick={onSubmitSearch}
                    disabled={submitDisabled}
                  >
                    {t('search.searchButton')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FindFriendOptions;
