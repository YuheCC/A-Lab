import { useCallback, useMemo, useRef, useState, useEffect, Fragment } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, IconLayer, TextLayer } from '@deck.gl/layers';
import { CompositeLayer } from 'deck.gl';
import { House, ZoomIn, ZoomOut } from 'lucide-react';
import { Tooltip } from '@mui/material';
import MolCard from '@/components/MolCard';
import { useTranslation } from 'react-i18next';
import { AUTO_HOVER_MOLECULE_THRESHOLD } from '@/constants/map';
import { WebMercatorViewport } from '@deck.gl/core';

// Define a color mapping for clusters (23 distinct colors) as RGB arrays
const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}


const X_STRETCH = 1.3;

const fitToData = (data, containerDimensions, prevViewState = null, zoomOffset = 0.3) => {
    if (!data || data.length === 0) {
        return {
            longitude: 3.7,
            latitude: 6,
            zoom: 3.5,
            pitch: 0,
            bearing: 0
        };
    }

    // Calculate bounds
    const xValues = data.map(d => d.x * X_STRETCH).filter(x => x !== null && x !== undefined);
    const yValues = data.map(d => d.y).filter(y => y !== null && y !== undefined);

    if (xValues.length === 0 || yValues.length === 0) {
        return {
            longitude: 0,
            latitude: 0,
            zoom: 4,
            pitch: 0,
            bearing: 0
        };
    }

    let minX = xValues[0];
    let maxX = xValues[0];
    let minY = yValues[0];
    let maxY = yValues[0];
    for (let i = 0; i < xValues.length; i++) {
        if (xValues[i] < minX) {
            minX = xValues[i];
        }
        if (xValues[i] > maxX) {
            maxX = xValues[i];
        }
        if (yValues[i] < minY) {
            minY = yValues[i];
        }
        if (yValues[i] > maxY) {
            maxY = yValues[i];
        }
    }

    // Calculate center
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Calculate zoom level based on data spread
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const maxRange = Math.max(rangeX, rangeY);

    // Use actual container dimensions for better fitting
    const minContainerDimension = Math.min(containerDimensions.width, containerDimensions.height);
    const targetFillRatio = 0.7; // Use 70% of container space
    
    // Calculate base zoom level
    const baseZoom = Math.log2((minContainerDimension * targetFillRatio) / (maxRange || 1));
    
    // Add zoom offset for more detailed view (increase this value for more zoom)
    const zoom = Math.max(0, Math.min(20, baseZoom + zoomOffset));

    if (prevViewState) {
        // Fractional position in previous bounds
        const fracX = (prevViewState.longitude - minX) / (maxX - minX);
        const fracY = (prevViewState.latitude - minY) / (maxY - minY);

        // Map to new bounds
        const newLongitude = minX + fracX * (maxX - minX);
        const newLatitude = minY + fracY * (maxY - minY);

        // Adjust zoom: difference in data range
        const prevRange = Math.max(maxX - minX, maxY - minY);
        const zoomDelta = Math.log2(prevRange / maxRange);
        const newZoom = Math.max(0, Math.min(20, prevViewState.zoom + zoomDelta));

        return {
            longitude: newLongitude,
            latitude: newLatitude,
            zoom: newZoom,
            pitch: 0,
            bearing: 0
        };
    }

    return {
        longitude: centerX,
        latitude: centerY,
        zoom: zoom,
        pitch: 0,
        bearing: 0
    };
}

const clusterColorMap = {
    1: hexToRgb('#e6194b'),
    2: hexToRgb('#3cb44b'),
    3: hexToRgb('#ffe119'),
    4: hexToRgb('#0082c8'),
    5: hexToRgb('#f58231'),
    6: hexToRgb('#911eb4'),
    7: hexToRgb('#46f0f0'),
    8: hexToRgb('#f032e6'),
    9: hexToRgb('#d2f53c'),
    10: hexToRgb('#fabebe'),
    11: hexToRgb('#008080'),
    12: hexToRgb('#e6beff'),
    13: hexToRgb('#aa6e28'),
    14: hexToRgb('#fffac8'),
    15: hexToRgb('#800000'),
    16: hexToRgb('#aaffc3'),
    17: hexToRgb('#808000'),
    18: hexToRgb('#ffd8b1'),
    19: hexToRgb('#000080'),
    20: hexToRgb('#808080'),
    21: hexToRgb('#c0c0c0'),
    22: hexToRgb('#bcf60c'),
    23: hexToRgb('#ff1493'),
    24: hexToRgb('#a52a2a'),
    25: hexToRgb('#20b2aa'),
    [-1]: hexToRgb('#ececec')
};

// Default color for clusters not in the map
const defaultColor = '#ececec'; // light gray

// Create a composite layer for markers with labels
class MarkerWithLabelLayer extends CompositeLayer {

    static get componentName() {
        return 'MarkerWithLabelLayer';
    }

    renderLayers() {
        const { data, iconName = 'marker', iconSize = 30, xKey = 'x', yKey = 'y', opacity = 1 } = this.props;
        const layers = [];
        if(data.length === 0) {
            return layers;
        }
        // Only render points with valid x and y umap coordinates
        data.filter(d => d[xKey] !== null && d[yKey] !== null)
            .forEach((point, index) => {
            layers.push(new ScatterplotLayer({
                id: `${this.id}-scatter-${index}`,
                data: [point],
                getPosition: d => [X_STRETCH * d[xKey], d[yKey]],
                getRadius: 5,
                getFillColor: d => [255, 0, 0],
                radiusMinPixels: 2,
                radiusMaxPixels: 50,
                radiusScale: 2,
                pickable: false
            }));
            console.log(`${this.id}-icon-${index}`)
            layers.push(new IconLayer({
                id: `${this.id}-icon-${index}`,
                data: [point],
                getPosition: d => [X_STRETCH * d[xKey], d[yKey]],
                getIcon: d => iconName,
                getSize: iconSize,
                iconAtlas: window.location.origin + '/atlas.png',
                iconMapping: window.location.origin + '/atlas_map.json',
                opacity
            }));

            layers.push(new TextLayer({
                id: `${this.id}-label-${index}`,
                data: [point],
                sizeMinPixels: 10,
                getPosition: d => [X_STRETCH * d[xKey], d[yKey]],
                getPixelOffset: [0, -16],
                getText: () => (index + 1).toString(),
                fontSettings: {
                    fontSize: 64,
                    buffer: 8,
                    sdf: true,
                },
                fontFamily: 'Consolas, monospace',
                getColor: iconName === 'marker-search' ? [0, 0, 0] : [255, 255, 255],
                getTextAnchor: 'middle',
                fontWeight: 'normal',
                pickable: false,
                getSize: 12
            }))

        });

        return layers;
    }
}

/**
 * Dynamically calculate bounds for the map based on data points.
 * @param {*} data array of data points, each with x and y properties
 * @param {*} padding extra padding around the bounds
 * @returns 
 */
const calculateClampBounds = (data, padding = 10) => {
    const defaultBounds = {
        minLongitude: -25,
        maxLongitude: 35,
        minLatitude: -20,
        maxLatitude: 30
    }
    if (!data || data.length === 0) {
        return defaultBounds
    }
    const xValues = data.map(d => d.x * X_STRETCH).filter(x => x !== null && x !== undefined);
    const yValues = data.map(d => d.y).filter(y => y !== null && y !== undefined);

    if (xValues.length === 0 || yValues.length === 0) {
        return defaultBounds
    }

    let minX = xValues[0];
    let maxX = xValues[0];
    let minY = yValues[0];
    let maxY = yValues[0];
    for (let i = 0; i < xValues.length; i++) {
        if (xValues[i] < minX) {
            minX = xValues[i];
        }
        if (xValues[i] > maxX) {
            maxX = xValues[i];
        }
        if (yValues[i] < minY) {
            minY = yValues[i];
        }
        if (yValues[i] > maxY) {
            maxY = yValues[i];
        }
    }

    return {
        minLongitude: Math.max(-25, minX - padding * X_STRETCH),
        maxLongitude: Math.min(35, maxX + padding * X_STRETCH),
        minLatitude: Math.max(-20, minY - padding),
        maxLatitude: Math.min(30, maxY + padding)
    };
}


const UMAPClusterPlotDeck = ({
    data,
    highlightedData = [],
    highlightedSimilarData = [],
    userPermissions,
    onClick,
    molecularType = 'organic',
    zoomOffset = 0.3,
    enableAutoHover = true
}) => {
    const { t } = useTranslation();

    const [viewState, setViewState] = useState({
        longitude: 3.7,
        latitude: 6.4,
        zoom: 3.3,
        pitch: 0,
        bearing: 0
    });
    const hoverRef = useRef(null);
    const containerRef = useRef(null);
    const [isManipulated, setIsManipulated] = useState(false);
    const [containerReady, setContainerReady] = useState(false);
    const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 600 });
    const [hoveredObject, setHoveredObject] = useState(null);
    const [autoHoverLayouts, setAutoHoverLayouts] = useState([]);

    const clampBounds = useMemo(() => calculateClampBounds(data), [data]);

    const onHover = useCallback((info) => {
        if (info && info.object && info.object.hasFullData) {
            setHoveredObject(info);
        } else {
            setHoveredObject(null);
        }
    }, []);

    // Track container size changes
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setContainerDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
                setContainerReady(true);
            }
        };

        // Update on mount and resize
        const timeout = setTimeout(updateDimensions, 0);
        window.addEventListener('resize', updateDimensions);
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', updateDimensions);
        }

        return () => {
            window.removeEventListener('resize', updateDimensions);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', updateDimensions);
            }
            clearTimeout(timeout);
        }
    }, []);


    // Handle point click
    const handlePointClick = useCallback((info) => {
        if (!info || !info.object || !info.object.hasFullData) {
            return;
        }

        setHoveredObject(null);
        onHover(null);
        // Call the onClick handler with the plotly data in the expected format
        onClick(info.object);
    }, [onClick, onHover]);

    const resolveCation = useCallback((dataNode) => {
        if (!dataNode) {
            return undefined;
        }
        return dataNode.cation ?? dataNode.rawData?.cation ?? dataNode.rawData?.CATION;
    }, []);

    const buildHoverPropGroups = useCallback((dataNode) => {
        if (!dataNode) {
            return [];
        }

        const properties = dataNode.properties || {};

        return [
            { label: t('molecular.nodePopup.smiles'), value: dataNode.smiles, span: 2 },
            { label: t('molecular.umapPlot.properties.cluster'), value: properties.CLUSTER },
            { label: t('molecular.umapPlot.properties.molWeight'), value: properties.molwt, suffix: t('molecular.umapPlot.units.gPerMol') },
            { 
                label: t('molecular.umapPlot.properties.espMax'), 
                value: properties.esp_max_eV, 
                suffix: t('molecular.umapPlot.units.eV'),
                show: molecularType === 'organic'
            },
            { 
                label: t('molecular.umapPlot.properties.espMin'), 
                value: properties.esp_min_eV, 
                suffix: t('molecular.umapPlot.units.eV'),
                show: molecularType === 'organic'
            },
            { label: t('molecular.umapPlot.properties.homo'), value: properties.homo_eV, suffix: t('molecular.umapPlot.units.eV') },
            { label: t('molecular.umapPlot.properties.lumo'), value: properties.lumo_eV, suffix: t('molecular.umapPlot.units.eV') },
            {
                label: t('molecular.umapPlot.properties.predictedMp'), value: properties.predicted_mp,
                suffix: t('molecular.umapPlot.units.celsius'),
                show: molecularType === 'organic' && (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint')
            },
            {
                label: t('molecular.umapPlot.properties.predictedBp'), value: properties.predicted_bp,
                suffix: t('molecular.umapPlot.units.celsius'),
                show: molecularType === 'organic' && (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint')
            },
            {
                label: 'Predicted FP', value: properties.predicted_fp,
                suffix: ' °C',
                show: molecularType === 'organic' && (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint')
            },
            {
                label: 'Combustion Enthalpy', value: properties.combustion_enthalpy, suffix: ' eV',
                show: molecularType === 'organic' && (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint')
            },
            {
                label: "Chemical Formula", 
                value: properties.chemical_formula,
                show: molecularType === "anions"
            },
            {
                label: "Molecular Volume", 
                value: properties.vdw_volume_angstroms3,
                suffix: " Å³",
                show: molecularType === "anions"
            },
            {
                label: "F Dissociation Energy", 
                suffix: " eV",
                value: properties.fluoride_bde_ev,
                show: molecularType === "anions"
            }
        ];
    }, [molecularType, t, userPermissions]);

    // Calculate bounds from data to fit the view
    useEffect(() => {
        if (containerReady) {
            if (isManipulated) {
                setViewState(prevViewState => fitToData(data, containerDimensions, prevViewState, zoomOffset));
            } else {
                setViewState(fitToData(data, containerDimensions, null, zoomOffset));
            }
        }
    }, [containerDimensions, data, containerReady, zoomOffset]);

    const fullDataNodes = useMemo(() => data.filter(node => node?.hasFullData), [data]);
    const shouldAutoShowHover = useMemo(() => {
        if (!enableAutoHover) {
            return false;
        }

        if (fullDataNodes.length === 0) {
            return false;
        }

        if (data.length > 0 && data.length <= AUTO_HOVER_MOLECULE_THRESHOLD) {
            return true;
        }

        return fullDataNodes.length <= AUTO_HOVER_MOLECULE_THRESHOLD;
    }, [enableAutoHover, data.length, fullDataNodes.length]);

    const autoHoverNodes = useMemo(() => (shouldAutoShowHover ? fullDataNodes : []), [fullDataNodes, shouldAutoShowHover]);

    useEffect(() => {
        if (!shouldAutoShowHover || autoHoverNodes.length === 0) {
            setAutoHoverLayouts([]);
            return;
        }

        if (!containerDimensions.width || !containerDimensions.height) {
            return;
        }

        const viewport = new WebMercatorViewport({
            width: containerDimensions.width,
            height: containerDimensions.height,
            longitude: viewState.longitude,
            latitude: viewState.latitude,
            zoom: viewState.zoom,
            pitch: viewState.pitch,
            bearing: viewState.bearing
        });

        const CARD_WIDTH = 460;
        const CARD_HEIGHT = 260;
        const CARD_GAP = 16;
        const MARGIN = 12;

        const layouts = autoHoverNodes.map((node, index) => {
            const [projectedX, projectedY] = viewport.project([X_STRETCH * node.x, node.y]);

            if (!Number.isFinite(projectedX) || !Number.isFinite(projectedY)) {
                return null;
            }

            const anchorLeft = projectedX;
            const anchorTop = projectedY;

            const containerWidth = containerDimensions.width;
            const containerHeight = containerDimensions.height;

            const isVisible = anchorLeft >= -CARD_WIDTH && anchorLeft <= containerWidth + CARD_WIDTH &&
                anchorTop >= -CARD_HEIGHT && anchorTop <= containerHeight + CARD_HEIGHT;

            if (!isVisible) {
                return null;
            }

            const candidateOffsets = [
                { offsetX: CARD_GAP, offsetY: -CARD_GAP - CARD_HEIGHT },
                { offsetX: CARD_GAP, offsetY: CARD_GAP },
                { offsetX: -CARD_GAP - CARD_WIDTH, offsetY: -CARD_GAP - CARD_HEIGHT },
                { offsetX: -CARD_GAP - CARD_WIDTH, offsetY: CARD_GAP }
            ];

            let cardLeft;
            let cardTop;

            for (const candidate of candidateOffsets) {
                const potentialLeft = anchorLeft + candidate.offsetX;
                const potentialTop = anchorTop + candidate.offsetY;

                const fitsHorizontally = potentialLeft >= MARGIN && (potentialLeft + CARD_WIDTH) <= containerWidth - MARGIN;
                const fitsVertically = potentialTop >= MARGIN && (potentialTop + CARD_HEIGHT) <= containerHeight - MARGIN;

                if (fitsHorizontally && fitsVertically) {
                    cardLeft = potentialLeft;
                    cardTop = potentialTop;
                    break;
                }
            }

            if (cardLeft === undefined || cardTop === undefined) {
                const fallback = candidateOffsets[0];
                cardLeft = anchorLeft + fallback.offsetX;
                cardTop = anchorTop + fallback.offsetY;

                cardLeft = Math.min(Math.max(cardLeft, MARGIN), containerWidth - CARD_WIDTH - MARGIN);
                cardTop = Math.min(Math.max(cardTop, MARGIN), containerHeight - CARD_HEIGHT - MARGIN);
            }

            const cardRight = cardLeft + CARD_WIDTH;
            const cardBottom = cardTop + CARD_HEIGHT;

            let targetX;
            if (anchorLeft < cardLeft) {
                targetX = cardLeft;
            } else if (anchorLeft > cardRight) {
                targetX = cardRight;
            } else {
                targetX = anchorLeft;
            }

            let targetY;
            if (anchorTop < cardTop) {
                targetY = cardTop;
            } else if (anchorTop > cardBottom) {
                targetY = cardBottom;
            } else {
                targetY = anchorTop;
            }

            return {
                node,
                index,
                anchor: { left: anchorLeft, top: anchorTop },
                card: { left: cardLeft, top: cardTop, width: CARD_WIDTH, height: CARD_HEIGHT },
                line: {
                    startX: anchorLeft,
                    startY: anchorTop,
                    endX: targetX,
                    endY: targetY
                }
            };
        }).filter(Boolean);

        setAutoHoverLayouts(layouts);
    }, [autoHoverNodes, shouldAutoShowHover, containerDimensions, viewState]);

    const layers = [
        useMemo(() =>
            new ScatterplotLayer({
                id: 'scatterplot-layer',
                data,
                getPosition: d => [X_STRETCH * d.x, d.y],
                getRadius: d => 100,
                getFillColor: d => {
                    return clusterColorMap[d.properties.CLUSTER] || defaultColor
                },
                radiusMinPixels: 1.2,
                radiusMaxPixels: 50,
                radiusScale: 3,
                opacity: 0.3,
                pickable: true,
                autoHighlight: true,
                highlightedObjectIndex: hoveredObject?.index ?? -1,
                onHover: info => {
                    if (info.object && info.object.hasFullData) {
                        onHover(info);
                    } else {
                        onHover(null);
                    }
                },
                onClick: info => {
                    if (info.object && info.object.hasFullData) {
                        handlePointClick(info);
                    } else {
                        onHover(null);
                    }
                },
            })
            , [data, onHover, handlePointClick, hoveredObject]),
        useMemo(() =>
            new MarkerWithLabelLayer({
                id: 'similar-markers',
                data: highlightedSimilarData,
                iconName: 'marker-search',
                iconSize: 30,
                xKey: 'UMAP_0',
                yKey: 'UMAP_1',
                opacity: 0.8
            })
            , [highlightedSimilarData]),
        useMemo(() =>
            new MarkerWithLabelLayer({
                id: 'selected-markers',
                data: highlightedData,
                iconName: 'marker',
                iconSize: 30
            })
            , [highlightedData]),
    ];

    const position = useMemo(() => {
        if (!hoveredObject) return {};
        if (!containerRef.current) return {};

        const boundingRect = containerRef.current.getBoundingClientRect();
        const mouseX = hoveredObject.x + boundingRect.left;
        const mouseY = hoveredObject.y + boundingRect.top;
        
        // MolCard 尺寸（使用实际尺寸或默认值）
        const molCardWidth = hoverRef.current ? hoverRef.current.offsetWidth : 320;
        const molCardHeight = hoverRef.current ? hoverRef.current.offsetHeight : 200;
        
        // 容器边界
        const containerLeft = boundingRect.left;
        const containerRight = boundingRect.left + containerRef.current.offsetWidth;
        const containerTop = boundingRect.top;
        const containerBottom = boundingRect.top + containerRef.current.offsetHeight;
        
        // 2px 偏移量
        const offset = 2;
        
        // 尝试四个方向的位置，确保卡片边缘距离鼠标点精确2px
        const positions = [
            // 右下方：卡片左上角距离鼠标点右下2px
            {
                left: mouseX + offset,
                top: mouseY + offset,
                priority: 1
            },
            // 右上方：卡片左下角距离鼠标点右上2px
            {
                left: mouseX + offset,
                top: mouseY - offset - molCardHeight,
                priority: 2
            },
            // 左下方：卡片右上角距离鼠标点左下2px  
            {
                left: mouseX - offset - molCardWidth,
                top: mouseY + offset,
                priority: 3
            },
            // 左上方：卡片右下角距离鼠标点左上2px
            {
                left: mouseX - offset - molCardWidth,
                top: mouseY - offset - molCardHeight,
                priority: 4
            }
        ];
        
        // 检查位置是否在容器内（添加小的边界缓冲）
        const bufferZone = 5; // 5px缓冲区避免边界闪烁
        const isPositionValid = (pos) => {
            return pos.left >= containerLeft + bufferZone && 
                   pos.left + molCardWidth <= containerRight - bufferZone &&
                   pos.top >= containerTop + bufferZone && 
                   pos.top + molCardHeight <= containerBottom - bufferZone;
        };
        
        // 找到第一个有效位置
        let bestPosition = positions.find(pos => isPositionValid(pos));
        
        // 如果没有完全有效的位置，选择最少溢出的位置
        if (!bestPosition) {
            bestPosition = positions.reduce((best, current) => {
                const currentOverflow = Math.max(0, current.left + molCardWidth - containerRight) +
                                      Math.max(0, containerLeft - current.left) +
                                      Math.max(0, current.top + molCardHeight - containerBottom) +
                                      Math.max(0, containerTop - current.top);
                
                const bestOverflow = Math.max(0, best.left + molCardWidth - containerRight) +
                                   Math.max(0, containerLeft - best.left) +
                                   Math.max(0, best.top + molCardHeight - containerBottom) +
                                   Math.max(0, containerTop - best.top);
                
                return currentOverflow < bestOverflow ? current : best;
            });
            
            // 调整位置以确保在容器内（考虑缓冲区）
            bestPosition = {
                left: Math.max(containerLeft + bufferZone, Math.min(containerRight - molCardWidth - bufferZone, bestPosition.left)),
                top: Math.max(containerTop + bufferZone, Math.min(containerBottom - molCardHeight - bufferZone, bestPosition.top))
            };
        }
        
        return {
            left: bestPosition.left,
            top: bestPosition.top,
            position: 'fixed'
        };
    }, [hoveredObject, containerRef]);


    const handleReturnToHome = () => {
        // Reset view state to initial
        setHoveredObject(null);
        onHover(null);
        setViewState(fitToData(data, containerDimensions, null, zoomOffset));
        setIsManipulated(false);
    };

    const handleZoomIn = () => {
        setIsManipulated(true);
        setViewState(prev => ({
            ...prev,
            zoom: Math.min(20, prev.zoom + 0.3) // 减小步长，让缩放更精细
        }));
    }
    const handleZoomOut = () => {
        setIsManipulated(true);
        setViewState(prev => ({
            ...prev,
            zoom: Math.max(2, prev.zoom - 0.3) // 减小步长，让缩放更精细
        }));
    }

    return <div 
        style={{ 
            width: '100%', 
            height: '100%', 
            position: 'relative',
            overflow: 'hidden'
        }} 
        ref={containerRef}
    >
        <div className='icon-controls-group' style={{
            position: "absolute",
            top: "0px",
            right: "0px",
        }}>
            <Tooltip title={t('molecular.umapPlot.controls.resetViewport')} placement="bottom">
                <House className='control-icon' size={15} onClick={handleReturnToHome} />
            </Tooltip>
            <Tooltip title={t('molecular.umapPlot.controls.zoomIn')} placement="bottom">
                <ZoomIn className='control-icon' size={15} onClick={handleZoomIn} />
            </Tooltip>
            <Tooltip title={t('molecular.umapPlot.controls.zoomOut')} placement="bottom">
                <ZoomOut className='control-icon' size={15} onClick={handleZoomOut} />
            </Tooltip>
        </div>
        <DeckGL
            useDevicePixels={true}
            controller={true}
            viewState={viewState}
            onViewStateChange={({ viewState, interactionState }) => {
                // Set flag if user is interacting
                if (
                    interactionState.isDragging ||
                    interactionState.isZooming ||
                    interactionState.isRotating ||
                    interactionState.isPanning
                ) {
                    setIsManipulated(true);
                }

                setViewState({
                    ...viewState,
                    longitude: Math.max(clampBounds.minLongitude, Math.min(clampBounds.maxLongitude, viewState.longitude)), // Clamp longitude
                    latitude: Math.max(clampBounds.minLatitude, Math.min(clampBounds.maxLatitude, viewState.latitude)), // Clamp latitude
                    zoom: Math.max(2, Math.min(20, viewState.zoom)) // Clamp zoom level
                });
            }}
            onClick={(info) => {
                if (info.layer === null || !info.object || !info.object.hasFullData) {
                    onHover(null);
                } else {
                    handlePointClick(info);
                }
            }}
            style={{
                width: '100%',
                height: '100%'
            }}
            getCursor={() => 'crosshair'}
            layers={layers}
        />
        {hoveredObject && hoveredObject.object ? (
            <MolCard
                ref={hoverRef}
                style={position}
                showMoreDetails={true}
                cation={resolveCation(hoveredObject.object)}
                onMouseEnter={() => {
                    setHoveredObject(null);
                    onHover(null);
                }}
                propGroups={buildHoverPropGroups(hoveredObject.object)}
            />
        ) : null}
        {autoHoverLayouts.map(layout => {
            const { anchor, card, line, index: layoutIndex, node } = layout;

            const badgeStyle = {
                position: 'absolute',
                left: anchor.left,
                top: anchor.top,
                transform: 'translate(-50%, -50%)',
                width: 22,
                height: 22,
                borderRadius: '9999px',
                backgroundColor: '#ffffff',
                border: '2px solid #2563eb',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 600,
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.18)',
                pointerEvents: 'none',
                zIndex: 950
            };

            const lineLeft = Math.min(line.startX, line.endX);
            const lineTop = Math.min(line.startY, line.endY);
            let lineWidth = Math.abs(line.endX - line.startX);
            let lineHeight = Math.abs(line.endY - line.startY);
            let lineStartX = line.startX - lineLeft;
            let lineStartY = line.startY - lineTop;
            let lineEndX = line.endX - lineLeft;
            let lineEndY = line.endY - lineTop;

            if (lineWidth === 0) {
                lineWidth = 2;
                lineStartX = 1;
                lineEndX = 1;
            }

            if (lineHeight === 0) {
                lineHeight = 2;
                lineStartY = 1;
                lineEndY = 1;
            }

            return (
                <Fragment key={`auto-hover-${node.id}`}>
                    <div style={badgeStyle}>{layoutIndex + 1}</div>
                    <svg
                        style={{
                            position: 'absolute',
                            left: lineLeft,
                            top: lineTop,
                            width: lineWidth,
                            height: lineHeight,
                            pointerEvents: 'none',
                            zIndex: 940
                        }}
                        width={lineWidth}
                        height={lineHeight}
                    >
                        <line
                            x1={lineStartX}
                            y1={lineStartY}
                            x2={lineEndX}
                            y2={lineEndY}
                            stroke="#2563eb"
                            strokeWidth={1.5}
                            strokeDasharray="4 2"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div
                        style={{
                            position: 'absolute',
                            left: card.left,
                            top: card.top,
                            width: card.width,
                            pointerEvents: 'none',
                            zIndex: 960
                        }}
                    >
                        <div
                            style={{
                                position: 'relative',
                                pointerEvents: 'auto',
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                boxShadow: '0 18px 42px rgba(15, 23, 42, 0.24)'
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '-11px',
                                    left: '14px',
                                    width: 24,
                                    height: 24,
                                    borderRadius: '9999px',
                                    backgroundColor: '#2563eb',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    boxShadow: '0 6px 14px rgba(37, 99, 235, 0.35)'
                                }}
                            >
                                {layoutIndex + 1}
                            </div>
                            <MolCard
                                showMoreDetails={false}
                                style={{ width: '100%', pointerEvents: 'auto' }}
                                cation={resolveCation(node)}
                                propGroups={buildHoverPropGroups(node)}
                            />
                        </div>
                    </div>
                </Fragment>
            );
        })}
    </div>
}

export default UMAPClusterPlotDeck;
