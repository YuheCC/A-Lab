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
pnpm install
```

3. Start the development server:
```bash
pnpm start
```

The React application will run on http://localhost:3000

## Build and Hosting

### Building for Production
1. Create a production build:
```bash
pnpm run build
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

## Current Architecture Chart For All Environemnts and Databases

| Backend Server | Backend Server URL | Back-end Repo | Back-end Branch | Frontend Server Name | Frontend Server Link | Frontend Repo | Frontend Branch | Database |
|---|---|---|---|---|---|---|---|---|
| current-production-server | prod-api.ses.ai | Lowry's personal | main | UMAP-APP-SH | https://molecular-universe.ses.ai | https://github.com/FrankWangSes/UMAP-APP/tree/main-sh | main-sh | Production RDS Database |
| current-staging-server | demo-api.ses.ai | https://github.com/codywirthses/UMAP-APP | staging | UMAP-APP-US-STAGING | https://staging.d5wqg9ff3njti.amplifyapp.com/ | https://github.com/codywirthses/UMAP-APP | staging | Production RDS Database |
| staging-sh | ? | Lowry's personal | ? | UMAP-APP-SH-Staging: Overview | https://demo-sh.ses.ai/ | https://github.com/FrankWangSes/UMAP-APP/tree/staging-sh | staging-sh | Production RDS Database |
| llm-team-staging-server | llm-staging.ses.ai | https://github.com/codywirthses/umap-backend | llm-staging | LLM-FRONTEND-STAGING | https://llm-staging.d3k7q9ivq7by5c.amplifyapp.com | https://github.com/codywirthses/UMAP-APP | staging | Production RDS Database |
| molecular-universe-demo | demo-api.ses.ai | https://github.com/codywirthses/umap-backend | main | UMAP-APP-Demo | https://demo.ses.ai | https://github.com/codywirthses/UMAP-APP | main | Production RDS Database |