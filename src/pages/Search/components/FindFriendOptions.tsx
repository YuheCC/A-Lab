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

  return (
    <>
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
              {
                ShowFindFriendsAdvancedOptions && (
                  <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowAdvanced(!showAdvanced)}>
                    <span>{t('search.advancedOptions')}</span>
                    {showAdvanced ? <ChevronUp size={14} style={{ marginLeft: '4px' }} /> : <ChevronDown size={14} style={{ marginLeft: '4px' }} />}
                  </div>
                )
              }
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
              <FindFriendAdvancedOptions
                extraRequests={extraRequests}
                setExtraRequests={setExtraRequests}
                selectedMolType={selectedMolType}
                setSelectedMolType={setSelectedMolType}
                additiveSubtype={additiveSubtype}
                setAdditiveSubtype={setAdditiveSubtype}
                computeLevel={computeLevel}
                setComputeLevel={setComputeLevel}
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
