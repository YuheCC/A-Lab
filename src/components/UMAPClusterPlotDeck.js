import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, IconLayer, TextLayer } from '@deck.gl/layers';
import MolViewer2D from './MolViewer2D';
import { CompositeLayer, LinearInterpolator } from 'deck.gl';
import { House, ZoomIn, ZoomOut } from 'lucide-react';
import { Tooltip } from '@mui/material';
import { MolCard } from './MolCard';

// Define a color mapping for clusters (23 distinct colors) as RGB arrays
const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}

const fitToData = (data, containerDimensions) => {
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
    const xValues = data.map(d => d.x).filter(x => x !== null && x !== undefined);
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

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    // Calculate center
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Calculate zoom level based on data spread
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const maxRange = Math.max(rangeX, rangeY);

    // Use actual container dimensions for better fitting
    const minContainerDimension = Math.min(containerDimensions.width, containerDimensions.height);
    const targetFillRatio = 0.6; // Use 80% of container space

    const zoom = Math.max(0, Math.min(20, Math.log2((minContainerDimension * targetFillRatio) / (maxRange || 1))));

    return {
        longitude: centerX,
        latitude: centerY,
        zoom: zoom,
        pitch: 0,
        bearing: 0
    };
}

const clusterColorMap = {
    1: hexToRgb('#1f77b4'), // blue
    2: hexToRgb('#ff7f0e'), // orange
    3: hexToRgb('#2ca02c'), // green
    4: hexToRgb('#d62728'), // red
    5: hexToRgb('#9467bd'), // purple
    6: hexToRgb('#8c564b'), // brown
    7: hexToRgb('#e377c2'), // pink
    8: hexToRgb('#7f7f7f'), // gray
    9: hexToRgb('#bcbd22'), // olive
    10: hexToRgb('#17becf'), // cyan
    11: hexToRgb('#aec7e8'), // light blue
    12: hexToRgb('#ffbb78'), // light orange
    13: hexToRgb('#98df8a'), // light green
    14: hexToRgb('#ff9896'), // light red
    15: hexToRgb('#c5b0d5'), // light purple
    16: hexToRgb('#c49c94'), // light brown
    17: hexToRgb('#f7b6d2'), // light pink
    18: hexToRgb('#c7c7c7'), // light gray
    19: hexToRgb('#dbdb8d'), // light olive
    20: hexToRgb('#9edae5'), // light cyan
    21: hexToRgb('#393b79'), // dark blue
    22: hexToRgb('#637939'), // dark green
    23: hexToRgb('#8c6d31')  // dark orange
};

// Default color for clusters not in the map
const defaultColor = '#000000'; // black

// Create a composite layer for markers with labels
class MarkerWithLabelLayer extends CompositeLayer {

    static get componentName() {
        return 'MarkerWithLabelLayer';
    }

    renderLayers() {
        const { data, iconName = 'marker', iconSize = 30, xKey = 'x', yKey = 'y' } = this.props;
        const layers = [];

        data.forEach((point, index) => {
            layers.push(new ScatterplotLayer({
                id: `${this.id}-scatter-${index}`,
                data: [point],
                getPosition: d => [d[xKey], d[yKey]],
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
                getPosition: d => [d[xKey], d[yKey]],
                getIcon: d => iconName,
                getSize: iconSize,
                iconAtlas: process.env.PUBLIC_URL + '/atlas.png',
                iconMapping: process.env.PUBLIC_URL + '/atlas_map.json',
                opacity: 0.6
            }));

            layers.push(new TextLayer({
                id: `${this.id}-label-${index}`,
                data: [point],
                sizeMinPixels: 10,
                getPosition: d => [d[xKey], d[yKey]],
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


const UMAPClusterPlotDeck = ({
    data,
    highlightedData = [],
    highlightedSimilarData = [],
    userPermissions,
    onClick,
}) => {

    const [viewState, setViewState] = useState({
        longitude: 3.7,
        latitude: 6.4,
        zoom: 3.3,
        pitch: 0,
        bearing: 0
    });
    const hoverRef = useRef(null);
    const containerRef = useRef(null);
    const [containerReady, setContainerReady] = useState(false);
    const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 600 });
    const [hoveredObject, setHoveredObject] = useState(null);

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

        return () => {
            window.removeEventListener('resize', updateDimensions);
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
            setViewState(fitToData(data, containerDimensions));
        }
    }, [containerDimensions, data, containerReady]);

    const layers = [
        useMemo(() =>
            new ScatterplotLayer({
                id: 'scatterplot-layer',
                data,
                getPosition: d => [d.x, d.y],
                getRadius: d => 100,
                getFillColor: d => {
                    return clusterColorMap[d.properties.CLUSTER % 23] || defaultColor
                },
                radiusMinPixels: 2,
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
                yKey: 'UMAP_1'
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
    };

    const handleZoomIn = () => {
        setViewState(prev => ({
            ...prev,
            zoom: Math.min(20, prev.zoom + 0.5)
        }));
    }
    const handleZoomOut = () => {
        setViewState(prev => ({
            ...prev,
            zoom: Math.max(2, prev.zoom - 0.5)
        }));
    }

    return <div style={{ width: '100%', height: '100%' }} ref={containerRef}>
        <div className='deck-controls'>
            <Tooltip title="Reset Viewport" placement="bottom">
                <House className='control-icon' size={15} onClick={handleReturnToHome} />
            </Tooltip>
            <Tooltip title="Zoom In" placement="bottom">
                <ZoomIn className='control-icon' size={15} onClick={handleZoomIn} />
            </Tooltip>
            <Tooltip title="Zoom Out" placement="bottom">
                <ZoomOut className='control-icon' size={15} onClick={handleZoomOut} />
            </Tooltip>
        </div>
        <DeckGL
            useDevicePixels={true}
            controller={true}
            viewState={viewState}
            onViewStateChange={({ viewState }) => {
                setViewState({
                    ...viewState,
                    longitude: Math.max(-20, Math.min(20, viewState.longitude)), // Clamp longitude
                    latitude: Math.max(-20, Math.min(20, viewState.latitude)), // Clamp latitude
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
                    [{ label: 'SMILES', value: hoveredObject.object.smiles }],
                    [
                        { label: 'Cluster', value: hoveredObject.object.properties.CLUSTER },
                        { label: 'Mol Weight', value: hoveredObject.object.properties.molwt, suffix: ' g/mol' },
                    ],
                    [
                        { label: 'Esp Max', value: hoveredObject.object.properties.esp_max_eV, suffix: ' eV' },
                        { label: 'Esp Min', value: hoveredObject.object.properties.esp_min_eV, suffix: ' eV' },
                    ],
                    [
                        { label: 'HOMO', value: hoveredObject.object.properties.homo_eV, suffix: ' eV' },
                        { label: 'LUMO', value: hoveredObject.object.properties.lumo_eV, suffix: ' eV' },
                    ],
                    [
                        {
                            label: 'Predicted MP', value: hoveredObject.object.properties.predicted_mp,
                            suffix: ' °C',
                            show: (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint')
                        },
                        {
                            label: 'Predicted BP', value: hoveredObject.object.properties.predicted_bp,
                            suffix: ' °C',
                            show: (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint')
                        }
                    ]
                ]}
            />
        ) : null}
    </div>
}

export default UMAPClusterPlotDeck;