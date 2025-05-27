import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';
import { useMemo } from 'react';

// Define a color mapping for clusters (23 distinct colors)
const clusterColorMap = {
    1: '#1f77b4', // blue
    2: '#ff7f0e', // orange
    3: '#2ca02c', // green
    4: '#d62728', // red
    5: '#9467bd', // purple
    6: '#8c564b', // brown
    7: '#e377c2', // pink
    8: '#7f7f7f', // gray
    9: '#bcbd22', // olive
    10: '#17becf', // cyan
    11: '#aec7e8', // light blue
    12: '#ffbb78', // light orange
    13: '#98df8a', // light green
    14: '#ff9896', // light red
    15: '#c5b0d5', // light purple
    16: '#c49c94', // light brown
    17: '#f7b6d2', // light pink
    18: '#c7c7c7', // light gray
    19: '#dbdb8d', // light olive
    20: '#9edae5', // light cyan
    21: '#393b79', // dark blue
    22: '#637939', // dark green
    23: '#8c6d31'  // dark orange
};

// Default color for clusters not in the map
const defaultColor = '#000000'; // black

const ARROW_OFFSET = -40;

const PLOTLY_LAYOUT_DEFAULTS = {
    autosize: true,
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff',
    margin: { l: 0, r: 0, b: 0, t: 0, pad: 0 },
    font: {
        family: 'Arial, sans-serif',
        size: 12,
        color: '#333'
    },
    xaxis: { showgrid: false, zeroline: false, visible: false },
    yaxis: { showgrid: false, zeroline: false, visible: false },
    showlegend: false,
    hovermode: 'closest',
    hoverlabel: {
        bgcolor: '#000',
        bordercolor: '#333',
        font: {
            family: 'Arial, sans-serif',
            size: 12,
            color: '#fff'
        }
    }
};

const PLOTLY_CONFIG_DEFAULTS = {
    displayModeBar: true,
    responsive: true,
    scrollZoom: true,
    modeBarButtonsToRemove: ['toImage', 'sendDataToCloud', 'select2d', 'lasso2d', 'toggleHover']
};

const PLOTLY_ANNOTATION_DEFAULTS = {
    xref: 'x',
    yref: 'y',
    showarrow: true,
    arrowhead: 2,
    arrowsize: 1.5,
    arrowwidth: 2,
    ax: 0,
    ay: ARROW_OFFSET,
    borderwidth: 2,
    borderpad: 4,
};

const PLOTLY_POINT_DEFAULTS = {
    mode: 'markers',
    type: 'scatter',
    marker: {
        size: 8,
        color: '#FF0000',
        symbol: 'circle'
    },
    hoverinfo: 'none',
    showlegend: false
}

const Plot = createPlotlyComponent(Plotly);

/**
 * Utility function for producing annotation and highlight point data
 * @param {*} data molecular data
 * @param {*} xKey key to index for x values
 * @param {*} yKey key to index for y values
 * @param {*} config plotly config for annotation data
 * @returns 
 */
function useFilterMemo(data, xKey, yKey, config) {
    return useMemo(() => {
        const outputData = {
            annotationData: [],
            highlightData: []
        };
        if (!data || data.length === 0) return outputData;

        // Filters out any invalid data in similar molecules data
        const nonNullMolecules = data.filter(mol =>
            mol[xKey] !== null &&
            mol[xKey] !== undefined &&
            mol[yKey] !== null &&
            mol[yKey] !== undefined
        );

        if (nonNullMolecules.length === 0) return outputData;

        // Creates the red point highlights
        outputData.highlightData = [{
            x: nonNullMolecules.map(molecule => molecule[xKey]),
            y: nonNullMolecules.map(molecule => molecule[yKey]),
            ...PLOTLY_POINT_DEFAULTS
        }];

        // Creates the arrow highlights
        outputData.annotationData = nonNullMolecules.map((mol, idx) => ({
            ...PLOTLY_ANNOTATION_DEFAULTS,
            x: mol[xKey],
            y: mol[yKey],
            text: `#${idx + 1}`,
            ...config
        }));

        return outputData;
    }, [data, xKey, yKey, config])
}

const UMAPClusterPlot = ({
    data,
    highlightedData = [],
    highlightedSimilarData = [],
    userPermissions,
    onInitialized,
    onClick,
}) => {

    /**
     * Memoized tooltip data 
     */
    const textData = useMemo(() => data.map(node =>
        `<b>Molecule Information:</b><br>` +
        `SMILES: ${node.smiles}<br>` +
        `${node.properties?.chemical_formula ? `Formula: ${node.properties.chemical_formula}<br>` : ''}` +
        `MW: ${node.properties?.molwt ? node.properties.molwt.toFixed(2) : 'N/A'}<br>` +
        `HOMO (eV): ${node.properties?.homo_eV ? node.properties.homo_eV.toFixed(2) : 'N/A'}<br>` +
        `LUMO (eV): ${node.properties?.lumo_eV ? node.properties.lumo_eV.toFixed(2) : 'N/A'}<br>` +
        `ESP Min: ${node.properties?.esp_min_eV ? node.properties.esp_min_eV.toFixed(2) : 'N/A'}<br>` +
        `ESP Max: ${node.properties?.esp_max_eV ? node.properties.esp_max_eV.toFixed(2) : 'N/A'}<br>` +
        `${node.properties?.functional_groups ? `Groups: ${node.properties.functional_groups}<br>` : ''}` +
        `${node.properties?.predicted_mp && (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') ? `MP: ${node.properties.predicted_mp.toFixed(2)}°C<br>` : ''}` +
        `${node.properties?.predicted_bp && (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') ? `BP: ${node.properties.predicted_bp.toFixed(2)}°C<br>` : ''}` +
        `${node.properties?.CLUSTER !== undefined ? `Cluster: ${node.properties.CLUSTER}` : ''}`
    ), [data, userPermissions]);

    const xData = useMemo(() => data.map(node => node.x), [data]);
    const yData = useMemo(() => data.map(node => node.y), [data]);

    /**
     * Memoized plot data
     */
    const plotData = useMemo(() => [{
        x: xData,
        y: yData,
        mode: 'markers',
        type: 'scattergl',
        marker: {
            size: 5,
            color: data.map(node => {
                if (highlightedData && highlightedData.some(molecule => molecule.smiles === node.smiles)) {
                    return '#ff0000'; // Red color for highlighted molecule
                }
                // Color by cluster
                const clusterValue = node.properties?.CLUSTER;
                return clusterValue ? (clusterColorMap[clusterValue] || defaultColor) : defaultColor;
            }),
            opacity: data.map(node => {
                if (highlightedData && highlightedData.some(molecule => molecule.smiles === node.smiles)) {
                    return 1; // Full opacity for highlighted molecule
                }
                return 0.7; // Default opacity
            })
        },
        hoverinfo: 'text',
        text: textData
    }], [data, highlightedData, textData, xData, yData]);

    /**
     * Memoized annotation/red point data
     */
    const { 
        annotationData: annotationSimilarGraphData, 
        highlightData: highlightSimilarGraphData 
    } = useFilterMemo(highlightedSimilarData, 'UMAP_0', 'UMAP_1', {
        arrowcolor: '#FFD700',
        bgcolor: 'rgba(255, 255, 0, 0.8)',
        bordercolor: '#FFD700',
        font: {
            color: 'black',
            size: 12
        }
    });

    const { 
        annotationData: annotationGraphData, 
        highlightData: highlightGraphData, 
    } = useFilterMemo(highlightedData, 'x', 'y', {
        arrowcolor: '#FF5722',
        bgcolor: 'rgba(255, 87, 34, 0.8)',
        bordercolor: '#FF5722',
        font: {
            color: 'white',
            size: 12
        }
    });

    /**
     * Memoized layout data and final graph data
     */
    const layout = useMemo(() => ({
        ...PLOTLY_LAYOUT_DEFAULTS,
        autosize: true,
        height: null,
        width: null,
        annotations: annotationSimilarGraphData.concat(annotationGraphData)
    }), [annotationSimilarGraphData, annotationGraphData]);

    const graphData = useMemo(() => {
        return plotData.concat(highlightGraphData, highlightSimilarGraphData)
    }, [plotData, highlightGraphData, highlightSimilarGraphData])

    // Handle point click
    const handlePointClick = (plotlyData) => {
        if (!onClick || !plotlyData || !plotlyData.points || plotlyData.points.length === 0) return;
        if (!data[plotlyData.points[0].pointIndex]) return
        
        // Call the onClick handler with the plotly data in the expected format
        onClick(plotlyData, data[plotlyData.points[0].pointIndex]);
    };

    return <Plot
        data={graphData}
        layout={layout}
        config={PLOTLY_CONFIG_DEFAULTS}
        style={{ width: '100%', height: '100%' }}
        onClick={handlePointClick}
        useResizeHandler={true}
        onInitialized={(figure) => {
            if (onInitialized) onInitialized();
        }}
    />
}

export default UMAPClusterPlot;