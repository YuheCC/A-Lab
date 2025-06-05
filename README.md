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
- Forgot password & password change
- Team voucher redeem for account creation
- An about page that explains our product and our goal with what we are building
- A pricing page that links to our product line on stripe
- Settings ability integrated in the application to manage your subscription
- Terms page
- Newsfeed with updates in regards to product development

## Authentication

The application uses JWT-based authentication. Only logged-in users can access the features aside from /map and /about.

## Data Source

The application reads data from snowflake by making requests to the backend.

## Implementation Details

- Built with React (without TypeScript)
- Uses react-force-graph for visualization
- Implements D3 scales for color mapping
- Implements plotly.js for the UMAP and Spider-graph
- Implements our inhouse LLM
- Implements statistical analysis methods for finding similar molecules
- Implements a molecular search engine for molecule lookups to our database

## AWS Amplify

This front end react application is hosted on AWS amplify. Currently, it is setup so that the `main` branch automatically built and deploys to molecular-universe.ses.ai automatically. You can access and configure settings for the front end build through our AWS portal, and by going to the amplify home page.

- Currently there are two domains we have for the front end applications running on
1) https://demo.ses.ai
2) https://molecular-universe.ses.ai

## Setup

1. Run `npm install`
2. Create .env file to specify API endpoint (REACT_APP_API_URL is the env variable used)
```
# REACT_APP_API_URL=http://0.0.0.0:8000
# REACT_APP_API_URL=https://api.ses.ai

# Create React App expects environment variables to be prefixed with `REACT_APP_`
REACT_APP_API_URL=https://prod-api.ses.ai
```

3. Run `npm run start`