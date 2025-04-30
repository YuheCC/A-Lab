# UMAP Application

A molecular visualization and exploration tool with user authentication.

## Project Structure

- `src/` - React frontend application
- `public/` - Static files for the frontend

## Setup and Running

### Frontend (React Application)
1. Node.js version v22.14.0 is recommended for frontend compatibility
2. Install Node.js dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The React application will run on http://localhost:3000

## Build and Hosting

### Building for Production
1. Create a production build:
```bash
npm run build
```

## Features

- User authentication (login/signup)
- UMAP visualization of molecular data
- Property-based filtering
- Molecule search and visualization
- Chatbot interface for molecule exploration

## Authentication

The application uses JWT-based authentication. Only logged-in users can access:

- Filter page
- Search functionality
- Chat interface

## Data Source

The application reads data from snowflake by making requests to the backend.

## Implementation Details

- Built with React (without TypeScript)
- Uses react-force-graph for visualization
- Implements D3 scales for color mapping
