import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, IconLayer, TextLayer } from '@deck.gl/layers';
import { CompositeLayer } from 'deck.gl';
import { House, ZoomIn, ZoomOut } from 'lucide-react';
import { Tooltip } from '@mui/material';
import { MolCard } from './MolCard';
import { useTranslation } from 'react-i18next';

// Define a color mapping for clusters (23 distinct colors) as RGB arrays
const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}


const X_STRETCH = 1.3;

const fitToData = (data, containerDimensions, prevViewState = null) => {
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
    const targetFillRatio = 0.7; // Use 80% of container space

    const zoom = Math.max(0, Math.min(20, Math.log2((minContainerDimension * targetFillRatio) / (maxRange || 1))));

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
    0: hexToRgb('#e6194b'),
    1: hexToRgb('#3cb44b'),
    2: hexToRgb('#ffe119'),
    3: hexToRgb('#0082c8'),
    4: hexToRgb('#f58231'),
    5: hexToRgb('#911eb4'),
    6: hexToRgb('#46f0f0'),
    7: hexToRgb('#f032e6'),
    8: hexToRgb('#d2f53c'),
    9: hexToRgb('#fabebe'),
    10: hexToRgb('#008080'),
    11: hexToRgb('#e6beff'),
    12: hexToRgb('#aa6e28'),
    13: hexToRgb('#fffac8'),
    14: hexToRgb('#800000'),
    15: hexToRgb('#aaffc3'),
    16: hexToRgb('#808000'),
    17: hexToRgb('#ffd8b1'),
    18: hexToRgb('#000080'),
    19: hexToRgb('#808080'),
    20: hexToRgb('#c0c0c0'),
    21: hexToRgb('#bcf60c'),
    22: hexToRgb('#ff1493'),
    23: hexToRgb('#a52a2a'),
    24: hexToRgb('#20b2aa'),
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

            layers.push(new IconLayer({
                id: `${this.id}-icon-${index}`,
                data: [point],
                getPosition: d => [X_STRETCH * d[xKey], d[yKey]],
                getIcon: d => iconName,
                getSize: iconSize,
                iconAtlas: process.env.PUBLIC_URL + '/atlas.png',
                iconMapping: process.env.PUBLIC_URL + '/atlas_map.json',
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
                getColor: [0, 0, 0],
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

    const clampBounds = useMemo(() => calculateClampBounds(data), [data]);

    const onHover = useCallback((info) => {
        if (info && info.object) {
            setHoveredObject(info.object);
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
    const handlePointClick = useCallback(() => {
        if (!hoveredObject || !hoveredObject.object) return;
        setHoveredObject(null);
        // Call the onClick handler with the plotly data in the expected format
        onClick(hoveredObject.object);
    }, [onClick, hoveredObject]);

    // Calculate bounds from data to fit the view
    useEffect(() => {
        if (containerReady) {
            if (isManipulated) {
                setViewState(prevViewState => fitToData(data, containerDimensions, prevViewState));
            } else {
                setViewState(fitToData(data, containerDimensions));
            }
        }
    }, [containerDimensions, data, containerReady]);

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
                onHover: info => {
                    if (info.object) {
                        onHover(info);
                        setHoveredObject(info);
                    } else {
                        onHover(null);
                        setHoveredObject(null);
                    }
                },
                onClick: info => {
                    if (info.object) {
                        handlePointClick(info);
                    } else {
                        onHover(null);
                        setHoveredObject(null);
                    }
                },
            })
            , [data, onHover, handlePointClick]),
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

        const boundingRect = containerRef.current.getBoundingClientRect()
        return {
            top: Math.min(
                hoveredObject.y + boundingRect.top,
                boundingRect.top + containerRef.current.offsetHeight - (hoverRef.current ? hoverRef.current.offsetHeight : 200)),
            left: Math.min(
                hoveredObject.x + boundingRect.left,
                boundingRect.left + containerRef.current.offsetWidth),
            position: 'fixed'
        }
    }, [hoveredObject, containerRef]);


    const handleReturnToHome = () => {
        // Reset view state to initial
        setHoveredObject(null);
        onHover(null);
        setViewState(fitToData(data, containerDimensions));
        setIsManipulated(false);
    };

    const handleZoomIn = () => {
        setIsManipulated(true);
        setViewState(prev => ({
            ...prev,
            zoom: Math.min(20, prev.zoom + 0.5)
        }));
    }
    const handleZoomOut = () => {
        setIsManipulated(true);
        setViewState(prev => ({
            ...prev,
            zoom: Math.max(2, prev.zoom - 0.5)
        }));
    }

    return <div style={{ width: '100%', height: '100%' }} ref={containerRef}>
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
                if (info.layer === null) {
                    onHover(null);
                    setHoveredObject(null);
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
                onMouseEnter={() => {
                    setHoveredObject(null);
                    onHover(null);
                }}
                propGroups={[
                    { label: t('molecular.nodePopup.smiles'), value: hoveredObject.object.smiles, span: 2 },
                    { label: t('molecular.umapPlot.properties.cluster'), value: hoveredObject.object.properties.CLUSTER },
                    { label: t('molecular.umapPlot.properties.molWeight'), value: hoveredObject.object.properties.molwt, suffix: t('molecular.umapPlot.units.gPerMol') },
                    { label: t('molecular.umapPlot.properties.espMax'), value: hoveredObject.object.properties.esp_max_eV, suffix: t('molecular.umapPlot.units.eV') },
                    { label: t('molecular.umapPlot.properties.espMin'), value: hoveredObject.object.properties.esp_min_eV, suffix: t('molecular.umapPlot.units.eV') },
                    { label: t('molecular.umapPlot.properties.homo'), value: hoveredObject.object.properties.homo_eV, suffix: t('molecular.umapPlot.units.eV') },
                    { label: t('molecular.umapPlot.properties.lumo'), value: hoveredObject.object.properties.lumo_eV, suffix: t('molecular.umapPlot.units.eV') },
                    {
                        label: t('molecular.umapPlot.properties.predictedMp'), value: hoveredObject.object.properties.predicted_mp,
                        suffix: t('molecular.umapPlot.units.celsius'),
                        show: (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint')
                    },
                    {
                        label: t('molecular.umapPlot.properties.predictedBp'), value: hoveredObject.object.properties.predicted_bp,
                        suffix: t('molecular.umapPlot.units.celsius'),
                        show: (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint')
                    },
                    {
                        label: 'Predicted FP', value: hoveredObject.object.properties.predicted_fp,
                        suffix: ' °C',
                        show: (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint')
                    },
                    {
                        label: 'Combustion Enthalpy', value: hoveredObject.object.properties.combustion_enthalpy, suffix: ' eV',
                        show: (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint')
                    }
                ]}
            />
        ) : null}
    </div>
}

export default UMAPClusterPlotDeck;