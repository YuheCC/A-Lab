import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import React from 'react';

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
  cathode: string;
  setCathode: (v: string) => void;
  cathodeCustom: string;
  setCathodeCustom: (v: string) => void;
  anode: string;
  setAnode: (v: string) => void;
  anodeCustom: string;
  setAnodeCustom: (v: string) => void;
  salt: string;
  setSalt: (v: string) => void;
  saltCustom: string;
  setSaltCustom: (v: string) => void;
  solvent: string;
  setSolvent: (v: string) => void;
  solventCustom: string;
  setSolventCustom: (v: string) => void;
  metric: string;
  setMetric: (v: string) => void;
  metricCustom: string;
  setMetricCustom: (v: string) => void;
  cathodeOptions: string[];
  anodeOptions: string[];
  saltOptions: string[];
  solventOptions: string[];
  performanceOptions: string[];
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
  cathode,
  setCathode,
  cathodeCustom,
  setCathodeCustom,
  anode,
  setAnode,
  anodeCustom,
  setAnodeCustom,
  salt,
  setSalt,
  saltCustom,
  setSaltCustom,
  solvent,
  setSolvent,
  solventCustom,
  setSolventCustom,
  metric,
  setMetric,
  metricCustom,
  setMetricCustom,
  cathodeOptions,
  anodeOptions,
  saltOptions,
  solventOptions,
  performanceOptions,
  userPermissions,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div style={{ marginTop: '8px' }}>
        <label>{t('search.extraRequests')}</label>
        <textarea
          value={extraRequests}
          onChange={e => setExtraRequests(e.target.value)}
          placeholder={t('search.extraRequestsPlaceholder')}
          style={{
            marginLeft: '8px',
            width: '100%',
            boxSizing: 'border-box',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '4px'
          }}
        />
      </div>
      <div className="search-options">
        <div className="search-option">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  id="find-friends-checkbox"
                  type="checkbox"
                  checked={findClosestFriends}
                  onChange={(e) => setFindClosestFriends(e.target.checked)}
                />
                <label htmlFor="find-friends-checkbox" style={{ display: 'flex', alignItems: 'center', marginLeft: '4px', cursor: 'pointer' }}>
                  <span>{t('search.findFriendsLabel')}</span>
                  <Tooltip title={t('search.findFriendsDescription')} placement="top">
                    <Info size={16} style={{ marginLeft: '4px', cursor: 'help' }} />
                  </Tooltip>
                </label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowAdvanced(!showAdvanced)}>
                <span>{t('search.advancedOptions')}</span>
                {showAdvanced ? <ChevronUp size={14} style={{ marginLeft: '4px' }} /> : <ChevronDown size={14} style={{ marginLeft: '4px' }} />}
              </div>
            </div>
            <div style={{ color: '#555', fontSize: '14px' }}>
              {t('search.findFriendsDescription')}
            </div>
            <div style={{ marginTop: '8px' }}>
              <select
                value={selectedMolType}
                onChange={e => setSelectedMolType(e.target.value)}
                style={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }}
              >
                <option value="solvent">{t('search.moleculeTypes.solvent')}</option>
                <option value="cosolvent">{t('search.moleculeTypes.cosolvent')}</option>
                <option value="diluent">{t('search.moleculeTypes.diluent')}</option>
                <option value="additive">{t('search.moleculeTypes.additive')}</option>
              </select>
              {selectedMolType === 'additive' && (
                <div style={{ marginTop: '8px' }}>
                  <label style={{ marginRight: '4px' }}>{t('search.moleculeTypes.additiveSubtype')}</label>
                  <select
                    value={additiveSubtype}
                    onChange={e => setAdditiveSubtype(e.target.value)}
                    style={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }}
                  >
                    <option value="A">{t('search.moleculeTypes.additiveOptions.seiPromoter')}</option>
                    <option value="C">{t('search.moleculeTypes.additiveOptions.sideReactionSuppressor')}</option>
                    <option value="F">{t('search.moleculeTypes.additiveOptions.dendriteSuppressor')}</option>
                    <option value="H">{t('search.moleculeTypes.additiveOptions.interfacialStabilityImprover')}</option>
                  </select>
                </div>
              )}
            </div>
            {showAdvanced && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '10px' }}>{t('search.searchRange')}</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px' }}>{t('search.distantFriends')}</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={structureWeight}
                      onChange={(e) => setStructureWeight(parseFloat(e.target.value))}
                      style={{ margin: '0 4px' }}
                    />
                    <span style={{ fontSize: '10px' }}>{t('search.nearbyFriends')}</span>
                    <span style={{ fontSize: '10px', marginLeft: '4px' }}>{structureWeight.toFixed(2)}</span>
                  </div>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <label style={{ marginRight: '4px' }}>{t('search.intelligentCompute')}</label>
                  <select
                    value={computeLevel}
                    onChange={e => setComputeLevel(e.target.value)}
                    style={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }}
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
                {userPermissions === 'admin' && (
                  <>
                    <div style={{ marginTop: '8px' }}>
                      <label>{t('search.cathode')}:</label>
                      <select
                        value={cathode}
                        onChange={e => setCathode(e.target.value)}
                        disabled={computeLevel === 'Disabled'}
                        style={{ marginLeft: '8px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }}
                      >
                        <option value=""></option>
                        {cathodeOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="custom">{t('search.custom')}</option>
                      </select>
                      {cathode === 'custom' && (
                        <input type="text" value={cathodeCustom} onChange={e => setCathodeCustom(e.target.value)} disabled={computeLevel === 'Disabled'} style={{ marginLeft: '8px', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }} />
                      )}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <label>{t('search.anode')}:</label>
                      <select
                        value={anode}
                        onChange={e => setAnode(e.target.value)}
                        disabled={computeLevel === 'Disabled'}
                        style={{ marginLeft: '8px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }}
                      >
                        <option value=""></option>
                        {anodeOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="custom">{t('search.custom')}</option>
                      </select>
                      {anode === 'custom' && (
                        <input type="text" value={anodeCustom} onChange={e => setAnodeCustom(e.target.value)} disabled={computeLevel === 'Disabled'} style={{ marginLeft: '8px', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }} />
                      )}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <label>{t('search.salt')}:</label>
                      <select
                        value={salt}
                        onChange={e => setSalt(e.target.value)}
                        disabled={computeLevel === 'Disabled'}
                        style={{ marginLeft: '8px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }}
                      >
                        <option value=""></option>
                        {saltOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="custom">{t('search.custom')}</option>
                      </select>
                      {salt === 'custom' && (
                        <input type="text" value={saltCustom} onChange={e => setSaltCustom(e.target.value)} disabled={computeLevel === 'Disabled'} style={{ marginLeft: '8px', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }} />
                      )}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <label>{t('search.solvent')}:</label>
                      <select
                        value={solvent}
                        onChange={e => setSolvent(e.target.value)}
                        disabled={computeLevel === 'Disabled'}
                        style={{ marginLeft: '8px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }}
                      >
                        <option value=""></option>
                        {solventOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="custom">{t('search.custom')}</option>
                      </select>
                      {solvent === 'custom' && (
                        <input type="text" value={solventCustom} onChange={e => setSolventCustom(e.target.value)} disabled={computeLevel === 'Disabled'} style={{ marginLeft: '8px', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }} />
                      )}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <label>{t('search.performanceMetric')}:</label>
                      <select
                        value={metric}
                        onChange={e => setMetric(e.target.value)}
                        disabled={computeLevel === 'Disabled'}
                        style={{ marginLeft: '8px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }}
                      >
                        <option value=""></option>
                        {performanceOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="custom">{t('search.custom')}</option>
                      </select>
                      {metric === 'custom' && (
                        <input type="text" value={metricCustom} onChange={e => setMetricCustom(e.target.value)} disabled={computeLevel === 'Disabled'} style={{ marginLeft: '8px', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }} />
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FindFriendOptions;
