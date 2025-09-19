import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import React from 'react';
import FindFriendAdvancedOptions from '@/components/FindFriendAdvancedOptions';

interface FindFriendOptionsProps {
  findClosestFriends: boolean;
  setFindClosestFriends: (v: boolean) => void;
  extraRequests: string;
  setExtraRequests: (v: string) => void;
  showAdvanced: boolean;
  setShowAdvanced: (v: boolean) => void;
  selectedMolType: string;
  setSelectedMolType: (v: string) => void;
  additiveSubtype: string;
  setAdditiveSubtype: (v: string) => void;
  computeLevel: string;
  setComputeLevel: (v: string) => void;
  structureWeight: number;
  setStructureWeight: (v: number) => void;
  showHypothetical: boolean;
  setShowHypothetical: (v: boolean) => void;
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
}

const FindFriendOptions: React.FC<FindFriendOptionsProps> = ({
  findClosestFriends,
  setFindClosestFriends,
  extraRequests,
  setExtraRequests,
  showAdvanced,
  setShowAdvanced,
  selectedMolType,
  setSelectedMolType,
  additiveSubtype,
  setAdditiveSubtype,
  computeLevel,
  setComputeLevel,
  structureWeight,
  setStructureWeight,
  showHypothetical,
  setShowHypothetical,
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
}) => {
  const { t } = useTranslation();
  const toggleAdvanced = () => setShowAdvanced(!showAdvanced);
  const handleAdvancedToggleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleAdvanced();
    }
  };

  return (
    <>
      <div className="search-options">
        <div className="search-option">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                width: '100%',
                flex: '1 1 auto',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '1 1 auto', minWidth: 0 }}>
                <div style={{ paddingTop: '2px' }}>
                  <input
                    id="find-friends-checkbox"
                    type="checkbox"
                    checked={findClosestFriends}
                    onChange={(e) => setFindClosestFriends(e.target.checked)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 auto', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <label
                      htmlFor="find-friends-checkbox"
                      style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      <span>{t('search.findFriendsLabel')}</span>
                      <Tooltip title={t('search.findFriendsDescription')} placement="top">
                        <Info size={16} style={{ marginLeft: '4px', cursor: 'help' }} />
                      </Tooltip>
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <select
                        value={selectedMolType}
                        onChange={(e) => setSelectedMolType(e.target.value)}
                        style={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }}
                      >
                        <option value="solvent">{t('search.moleculeTypes.solvent')}</option>
                        <option value="cosolvent">{t('search.moleculeTypes.cosolvent')}</option>
                        <option value="diluent">{t('search.moleculeTypes.diluent')}</option>
                        <option value="additive">{t('search.moleculeTypes.additive')}</option>
                      </select>
                      {selectedMolType === 'additive' && (
                        <select
                          value={additiveSubtype}
                          onChange={(e) => setAdditiveSubtype(e.target.value)}
                          style={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }}
                          aria-label={t('search.moleculeTypes.additiveSubtype')}
                        >
                          <option value="A">{t('search.moleculeTypes.additiveOptions.seiPromoter')}</option>
                          <option value="C">{t('search.moleculeTypes.additiveOptions.sideReactionSuppressor')}</option>
                          <option value="F">{t('search.moleculeTypes.additiveOptions.dendriteSuppressor')}</option>
                          <option value="H">{t('search.moleculeTypes.additiveOptions.interfacialStabilityImprover')}</option>
                        </select>
                      )}
                    </div>
                  </div>
                  {findClosestFriends && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ whiteSpace: 'nowrap' }}>{t('search.intelligentFindFriendsLabel')}</span>
                      <Tooltip title={t('search.intelligentFindFriendsTooltip')} placement="top">
                        <Info size={16} style={{ cursor: 'help' }} />
                      </Tooltip>
                      <select
                        value={computeLevel}
                        onChange={(e) => setComputeLevel(e.target.value)}
                        style={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }}
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
                  )}
                </div>
              </div>
              {ShowFindFriendsAdvancedOptions && (
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={showAdvanced}
                  onClick={toggleAdvanced}
                  onKeyDown={handleAdvancedToggleKeyDown}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    border: '1px solid #2563eb',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    color: '#2563eb',
                    fontWeight: 500,
                    fontSize: '13px',
                    transition: 'background-color 0.2s',
                    backgroundColor: showAdvanced ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    marginLeft: 'auto',
                  }}
                >
                  <span>{t('search.advancedOptions')}</span>
                  {showAdvanced ? (
                    <ChevronUp size={14} style={{ marginLeft: '6px' }} />
                  ) : (
                    <ChevronDown size={14} style={{ marginLeft: '6px' }} />
                  )}
                </div>
              )}
            </div>
            {showAdvanced && (
              <FindFriendAdvancedOptions
                extraRequests={extraRequests}
                setExtraRequests={setExtraRequests}
                selectedMolType={selectedMolType}
                setSelectedMolType={setSelectedMolType}
                additiveSubtype={additiveSubtype}
                setAdditiveSubtype={setAdditiveSubtype}
                computeLevel={computeLevel}
                structureWeight={structureWeight}
                setStructureWeight={setStructureWeight}
                showHypothetical={showHypothetical}
                setShowHypothetical={setShowHypothetical}
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
                showBatteryFields
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FindFriendOptions;
