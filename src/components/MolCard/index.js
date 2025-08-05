import { ChevronDown, ChevronUp } from 'lucide-react';
import MolViewer2D from '@/components/NodePopup/MolViewer2D';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';

import './Molcard.css';
import { Tooltip } from '@mui/material';

export const PropItem = ({ prop }) => {
    const { t } = useTranslation();

    // State used for tooltip visibility
    const codeRef = useRef(null);
    const [showTooltip, setShowTooltip] = useState(false);

    // Create and format the value string based on prop value and suffix
    let valueString;
    if (prop?.value) {
        if (typeof prop.value === 'number') {
            valueString = prop.value.toFixed(2);
        } else {
            valueString = prop.value.toString();
        }
        valueString += (prop?.suffix ? prop.suffix : ""); 
    } else {
        valueString = t('molecular.molCard.notAvailable');
    }

    if (Array.isArray(prop.value)) {
        if (prop.value.length === 0) {
            valueString = t('molecular.molCard.notAvailable');
        } else {
            valueString = prop.value.join(", ");
        }
    }
    
    // Enable tooltip if the value string is too long and gets truncated
    useEffect(() => {
        const el = codeRef.current;
        if (!el) return;
        setShowTooltip(el.scrollWidth > el.clientWidth && !prop.wrap);
    }, [valueString])

    return prop?.show !== false ? (
            <div style={{ gridColumn: `span ${prop.span || 1}` }}>
                <div className='molcard-property-group'>
                    <label>{prop.label}</label>
                    <Tooltip title={
                        <div className='molcard-property-group'>
                            <label>{prop.label}</label>
                            <div className='molcard-property-value'>{valueString}</div>
                        </div>
                    } placement="bottom-start" arrow disableHoverListener={!showTooltip} disableFocusListener={!showTooltip} disableTouchListener={!showTooltip}
                      enterDelay={500} enterNextDelay={500}>
                        <code ref={codeRef} style={(prop.wrap ? { whiteSpace: 'normal', wordBreak: 'break-word', textOverflow: 'initial'} : { whiteSpace: 'nowrap' })}>{prop.hasOwnProperty('value') && valueString}{prop?.action && (
                            prop?.action
                        )}</code>
                    </Tooltip>
                </div>
            </div>
    ) : null;
};

const MolCard = (props) => {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const { showMoreDetails = false, large = false, vertical = false, propGroups = [], foldPropGroups = [], name, children, ...domProps } = props;

    // Validate propGroups structure
    // - Check if propGroups is an array of arrays
    // - Each inner array should contain objects with 'value' and 'label' properties (maybe null/undefined)
    // - Or each inner array should contain objects with 'label' and 'action' properties
    const validFormat = propGroups.every(group => 
        (group.hasOwnProperty('value') && group.hasOwnProperty('label')) ||
        (group.hasOwnProperty('label') && group.hasOwnProperty('action') && group.action !== null && group.action !== undefined)
    );
    if (!validFormat) {
        return <div className='molcard-container' {...domProps}><div className='deck-error'>Invalid molecule data structure.</div></div>;
    }

    const smileString = propGroups.reduce((acc, group) => {
        if (acc) return acc; // Return early if already found
        return group.label.toLowerCase().indexOf('smiles') !== -1 ? group.value : acc;
    }, null);

    if (!smileString) {
        return <div className='molcard-container' {...domProps}><div className='deck-error'>{t('molecular.molCard.noMoleculeData')}</div></div>;
    }

    return (
        <div className={`molcard-container ${large ? 'molcard-large': ''} ${vertical ? 'molcard-vertical': ''}`} {...domProps}>
            <div style={{ display: 'flex', flexFlow: vertical ? 'column' : 'row', width: '100%' }}>
                <div className='molcard-visualization' translate='no'>
                    {smileString ? <MolViewer2D smile={smileString} width={200} height={200} /> : <div style={{
                        width: '150px',
                        height: '150px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>{t('molecular.molCard.loading')}</div>}
                </div>
                <div className='molcard-info-panel'>
                    <div className='deck-info-title'><span></span></div>
                    <div className='molcard-info-content'>
                        {propGroups && propGroups.length > 0 ? (
                                propGroups.map((prop, index) => (
                                    <PropItem
                                        key={index}
                                        prop={prop}
                                    />
                                ))
                        ): null}
                    </div>
                </div>
            </div>
            {showMoreDetails ? <div className='molcard-footer'>
                {t('molecular.molCard.clickForDetails')}
            </div> : null}
            {foldPropGroups && foldPropGroups.length > 0 ? (
                <div className='molcard-footer-expanded'>
                    <div className='molcard-expand-controls' onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ChevronUp className='molcard-control-icon' size={15} /> :  <ChevronDown className='molcard-control-icon' size={15} /> }
                        <span className='deck-info-footer-text'>{expanded ? t('molecular.molCard.clickToCollapse') : t('molecular.molCard.clickToExpand')}</span>
                    </div>
                    {expanded ? (
                        <div className='molcard-expanded-content'>
                            {foldPropGroups.map((prop, index) => (
                                <PropItem
                                    key={index}
                                    prop={prop}
                                />
                            ))}
                        </div>
                    ) : null}
                </div>
            ) : null}
            {children ? <div className='molcard-children'>{children}</div> : null}
        </div>
    )
}

export default MolCard;
