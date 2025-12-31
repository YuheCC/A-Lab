import { ChevronDown, ChevronUp } from 'lucide-react';
import MolViewer2D from '@/components/NodePopup/MolViewer2D';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { getMoleculeDescription, hasMoleculeDescription } from '@/constants/moleculeDescriptions';

import './Molcard.less';
import { Tooltip } from '@mui/material';

export const PropItem = ({ prop }) => {
    const { t } = useTranslation();

    // State used for tooltip visibility
    const codeRef = useRef(null);
    const [showTooltip, setShowTooltip] = useState(false);

    const {
        valueNode,
        disableAutoTooltip,
        tooltipContent,
    } = prop || {};

    const hasCustomValue = valueNode !== null && valueNode !== undefined;

    // Create and format the value string based on prop value and suffix
    let valueString;
    if (prop?.value) {
        if (typeof prop.value === 'number') {
            valueString = prop.value.toFixed(4);
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
        if (disableAutoTooltip) {
            setShowTooltip(false);
            return;
        }

        const el = codeRef.current;
        if (!el) return;
        setShowTooltip(el.scrollWidth > el.clientWidth && !prop.wrap);
    }, [valueString, disableAutoTooltip, prop?.wrap])

    const baseCodeStyle = prop.wrap
        ? { whiteSpace: 'normal', wordBreak: 'break-word', textOverflow: 'initial' }
        : { whiteSpace: 'nowrap' };
    const codeStyle = {
        ...baseCodeStyle,
        ...(prop?.valueStyle || {}),
        ...(prop?.color ? { color: prop.color } : {}),
    };

    const tooltipNode = tooltipContent ?? (
        <div className='molcard-property-group'>
            <label>{prop.label}</label>
            <div className='molcard-property-value'>{valueString}</div>
        </div>
    );

    const disableTooltip = disableAutoTooltip || !showTooltip;

    const renderedValue = hasCustomValue
        ? valueNode
        : (prop?.hasOwnProperty('value') ? valueString : null);

    return prop?.show !== false ? (
            <div style={{ gridColumn: prop.fullWidth ? '1 / -1' : `span ${prop.span || 1}` }}>
                <div className='molcard-property-group'>
                    <label>{prop.label}</label>
                    <Tooltip
                        title={tooltipNode}
                        placement="bottom-start"
                        arrow
                        disableHoverListener={disableTooltip}
                        disableFocusListener={disableTooltip}
                        disableTouchListener={disableTooltip}
                        enterDelay={500}
                        enterNextDelay={500}
                    >
                        <code ref={codeRef} style={codeStyle}>
                            {renderedValue}
                            {prop?.action && (
                                prop?.action
                            )}
                        </code>
                    </Tooltip>
                </div>
            </div>
    ) : null;
};

const MolCard = (props) => {
    const { t, i18n } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const {
        showMoreDetails = false,
        large = false,
        vertical = false,
        propGroups = [],
        foldPropGroups = [],
        name,
        children,
        cation,
        compact = false,
        publicationStatus,
        ...domProps
    } = props;

    // Validate propGroups structure
    // - Check if propGroups is an array of arrays
    // - Each inner array should contain objects with 'value' and 'label' properties (maybe null/undefined)
    // - Or each inner array should contain objects with 'label' and 'action' properties
    const validFormat = propGroups.every(group => 
        (group.hasOwnProperty('value') && group.hasOwnProperty('label')) ||
        (group.hasOwnProperty('label') && group.hasOwnProperty('action') && group.action !== null && group.action !== undefined)
    );
    if (!validFormat) {
        return <div className='molcard-container' {...domProps}><div className='molcard-error'>Invalid molecule data structure.</div></div>;
    }

    const smileString = propGroups.reduce((acc, group) => {
        if (acc) return acc; // Return early if already found
        return group.label.toLowerCase().indexOf('smiles') !== -1 ? group.value : acc;
    }, null);

    if (!smileString) {
        return <div className='molcard-container' {...domProps}><div className='molcard-error'>{t('molecular.molCard.noMoleculeData')}</div></div>;
    }

    // 获取分子 tips（先尝试用 SMILES 查询，再用分子名称查询）
    const currentLocale = i18n?.language || 'zh';
    const localeKey = currentLocale.split('-')[0];
    let moleculeTips;

    // 先尝试用 SMILES 查询
    if (smileString && hasMoleculeDescription(smileString)) {
        moleculeTips = getMoleculeDescription(smileString, localeKey);
    }
    // 如果没找到，再尝试用分子名称查询
    if (!moleculeTips && name && hasMoleculeDescription(name)) {
        moleculeTips = getMoleculeDescription(name, localeKey);
    }

    const moleculeSize = compact ? 140 : 200;
    const containerClassName = [
        'molcard-container',
        large ? 'molcard-large' : '',
        vertical ? 'molcard-vertical' : '',
        compact ? 'molcard-compact' : '',
        publicationStatus === true ? 'molcard-published' : '',
        publicationStatus === false ? 'molcard-novel' : ''
    ].filter(Boolean).join(' ');

    // 如果有 tips，将其添加到显示的属性列表中
    const displayPropGroups = [...propGroups];
    if (moleculeTips) {
        displayPropGroups.push({
            label: t('molecular.moleculeModal.tips', 'Tips'),
            value: moleculeTips,
            fullWidth: true,
            wrap: true
        });
    }

    return (
        <div className={containerClassName} {...domProps}>
            <div style={{ display: 'flex', flexFlow: vertical ? 'column' : 'row', width: '100%' }}>
                <div className='molcard-visualization' translate='no'>
                    {smileString ? <MolViewer2D smile={smileString} cation={cation} width={moleculeSize} height={moleculeSize} /> : <div style={{
                        width: `${moleculeSize}px`,
                        height: `${moleculeSize}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>{t('molecular.molCard.loading')}</div>}
                </div>
                <div className='molcard-info-panel'>
                    <div className='molcard-info-title'><span></span></div>
                    <div className='molcard-info-content'>
                        {displayPropGroups && displayPropGroups.length > 0 ? (
                                displayPropGroups.map((prop, index) => (
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
                        <span className='molcard-info-footer-text'>{expanded ? t('molecular.molCard.clickToCollapse') : t('molecular.molCard.clickToExpand')}</span>
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
