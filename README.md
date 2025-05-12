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
- Favorites tab to store molecules

## Authentication

The application uses JWT-based authentication. Only logged-in users can access the features aside from /map and /about.

## Data Source

The application reads data from snowflake by making requests to the backend.

## Implementation Details

- Built with React (without TypeScript)
- Uses react-force-graph for visualization
- Implements D3 scales for color mapping

## AWS Amplify

This front end react application is hosted on AWS amplify. Currently, it is setup so that the `main` branch automatically built and deploys to molecular-universe.ses.ai automatically. You can access and configure settings for the front end build through our AWS portal, and by going to the amplify home page.
