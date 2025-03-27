# UMAP Molecular Visualization

A React application that visualizes UMAP (Uniform Manifold Approximation and Projection) data of molecular compounds from a CSV file. The visualization displays 71,000 nodes representing molecules and allows for interactive exploration.

## Features

- Interactive 2D visualization of UMAP coordinates
- Color-coded nodes based on position
- Hover and click interactions to view molecular details
- Detailed panel showing molecular properties (SMILES, molecular weight, HOMO/LUMO values)
- Real-time progress and logging

## Getting Started

### Prerequisites

- Node.js (v14 or higher)

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Running the Application

```bash
npm start
```

The application will start a development server and open in your browser at [http://localhost:3000](http://localhost:3000).

## Data Source

The application reads data from `umap_product_demo_1M_set.csv` in the public directory, which contains UMAP coordinates and properties for molecular compounds.

## Implementation Details

- Built with React (without TypeScript)
- Uses react-force-graph for visualization
- Implements D3 scales for color mapping
- Uses PapaParse for CSV processing
- Includes comprehensive logging for troubleshooting
