import { useCallback, useMemo, useRef, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, IconLayer, TextLayer } from '@deck.gl/layers';
import { hover } from '@testing-library/user-event/dist/hover';
import MolViewer2D from './MolViewer2D';
import { CompositeLayer } from 'deck.gl';

// Define a color mapping for clusters (23 distinct colors) as RGB arrays
const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
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
    renderLayers() {
        const { data, iconName = 'marker', iconSize = 30 } = this.props;
        
        return [
            new ScatterplotLayer({
                id: `${this.id}-scatter`,
                data,
                getPosition: d => [d.UMAP_0, d.UMAP_1],
                getRadius: 100,
                getFillColor: d => [255, 0, 0],
                radiusMinPixels: 5,
                radiusMaxPixels: 50,
                radiusScale: 6,
                pickable: false
            }),
            new IconLayer({
                id: `${this.id}-icon`,
                data,
                getPosition: d => [d.UMAP_0, d.UMAP_1],
                getIcon: d => iconName,
                getSize: iconSize,
                iconAtlas: process.env.PUBLIC_URL + '/atlas.png',
                iconMapping: process.env.PUBLIC_URL + '/atlas_map.json',
            }),
            new TextLayer({
                id: `${this.id}-label`,
                data,
                sizeMinPixels: 10,
                getPosition: d => [d.UMAP_0, d.UMAP_1],
                getPixelOffset: [0, -16],
                getText: (object, objectInfo) => {
                    return (objectInfo.index + 1).toString();
                },
                getColor: [255, 255, 255],
                getTextAnchor: 'middle',
                pickable: false,
                getSize: 12
            })
        ];
    }
}


const UMAPClusterPlotDeck = ({
    data,
    highlightedData = [],
    highlightedSimilarData = [],
    userPermissions,
    onClick,
}) => {


    const containerRef = useRef(null);
    const [hoveredObject, setHoveredObject] = useState(null);

    const onHover = useCallback((info) => {
        if (info && info.object) {
            setHoveredObject(info.object);
        } else {
            setHoveredObject(null);
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
    const viewState = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                longitude: 0,
                latitude: 0,
                zoom: 4,
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

        const minX = Math.min(...xValues) - 2;
        const maxX = Math.max(...xValues) + 2;
        const minY = Math.min(...yValues) - 2;
        const maxY = Math.max(...yValues) + 2;

        // Calculate center
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        // Calculate zoom level based on data spread
        const rangeX = maxX - minX;
        const rangeY = maxY - minY;
        const maxRange = Math.max(rangeX, rangeY);

        // Adjust zoom based on your data range (you may need to tune this)
        const zoom = Math.max(0, Math.log2(400 / (maxRange || 1)));

        return {
            longitude: centerX,
            latitude: centerY,
            zoom: zoom,
            pitch: 0,
            bearing: 0
        };
    }, [data]);

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
                radiusScale: 6,
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
                id: 'selected-markers',
                data: highlightedData,
                iconName: 'marker',
                iconSize: 30
            })
        , [highlightedData]),
        
        useMemo(() =>
            new MarkerWithLabelLayer({
                id: 'similar-markers',
                data: highlightedSimilarData,
                iconName: 'marker-search',
                iconSize: 30
            })
        , [highlightedSimilarData]),
    ];

    return <div style={{ width: '100%', height: '100%' }} ref={containerRef}>
        <DeckGL
            initialViewState={viewState}
            controller={true}
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
                height: '100%',
            }}
            getCursor={() => 'crosshair'}
            layers={layers}
        />
        {hoveredObject && containerRef.current ? <div className='deck-hover-info' style={{
            top: Math.min(hoveredObject.y, containerRef.current.offsetHeight - 200),
            left: Math.min(hoveredObject.x, containerRef.current.offsetWidth)
        }}>
            <div className='deck-hover-vis'>
                {hoveredObject ? <MolViewer2D smile={hoveredObject.object.smiles} width={200} height={200} /> : <div>Loading...</div>}
            </div>
            <div className='deck-info-panel'>
                <div className='deck-info-title'>Molecule Information</div>
                <table>
                    <tbody>
                        <tr>
                            <td colSpan={2}>
                                <div className='deck-info-group'>
                                    <label>SMILES</label>
                                    <code>{hoveredObject.object.smiles}</code>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className='deck-info-group'>
                                    <label>Cluster</label>
                                    <code>{hoveredObject.object.properties.CLUSTER}</code>
                                </div>
                            </td>
                            <td>
                                <div className='deck-info-group'>
                                    <label>Mol Weight</label>
                                    <code>{hoveredObject.object.properties.molwt}</code>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className='deck-info-group'>
                                    <label>Esp Max EV</label>
                                    <code>{hoveredObject.object.properties.esp_max_eV}</code>
                                </div>
                            </td>
                            <td>
                                <div className='deck-info-group'>
                                    <label>Esp Min EV</label>
                                    <code>{hoveredObject.object.properties.esp_min_eV}</code>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className='deck-info-group'>
                                    <label>Homo EV</label>
                                    <code>{hoveredObject.object.properties.homo_eV}</code>
                                </div>
                            </td>
                            <td>
                                <div className='deck-info-group'>
                                    <label>Lumo EV</label>
                                    <code>{hoveredObject.object.properties.lumo_eV}</code>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className='deck-info-group'>
                                    <label>Predicted MP</label>
                                    <code>{hoveredObject.object.properties.predicted_mp ?? "N/A"}</code>
                                </div>
                            </td>
                            <td>
                                <div className='deck-info-group'>
                                    <label>Predicted BP</label>
                                    <code>{hoveredObject.object.properties.predicted_bp ?? "N/A"}</code>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div> : null}
    </div>
}

export default UMAPClusterPlotDeck;