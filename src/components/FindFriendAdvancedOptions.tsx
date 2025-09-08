import { useTranslation } from 'react-i18next';
import React from 'react';
import { Tooltip } from '@mui/material';
import { Info } from 'lucide-react';

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
  showHypothetical: boolean;
  setShowHypothetical: (v: boolean) => void;
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
  showHypothetical,
  setShowHypothetical,
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
      <div style={{ marginTop: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={showHypothetical}
            onChange={e => setShowHypothetical(e.target.checked)}
          />
          <span style={{ marginLeft: '4px' }}>{t('search.showHypothetical')}</span>
          <Tooltip title={t('search.showHypotheticalTooltip')} placement="top">
            <Info size={16} style={{ marginLeft: '4px', cursor: 'help' }} />
          </Tooltip>
        </label>
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
      {showBatteryFields && userPermissions === 'admin' && (
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
  );
};

export default FindFriendAdvancedOptions;
