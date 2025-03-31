# UMAP Application

A molecular visualization and exploration tool with user authentication.

## Project Structure

- `src/` - React frontend application
- `server/` - Python FastAPI backend for authentication and user management
- `public/` - Static files for the frontend
- `.env` files - Environment configuration for both frontend and backend

## Setup and Running

### Backend (Authentication Server)

1. Navigate to the server directory:
```bash
cd server
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables (optional):
   - Modify the `.env` file in the server directory to customize settings
   - Default values will be used if no changes are made

4. Start the backend server:
```bash
python main.py
```

The backend server will run on http://localhost:8001 by default

### Frontend (React Application)

1. Configure environment variables (optional):
   - The frontend uses `.env` file in the src directory
   - By default, it points to the backend API at http://localhost:8001

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The React application will run on http://localhost:3000

## Environment Configuration

### Backend (server/.env)
```
PORT=8001                           # Port to run the server on
FRONTEND_URL=http://localhost:3000  # Frontend URL for CORS
DATABASE_URL=sqlite:///./users.db   # Database connection
SECRET_KEY=your_secret_key          # JWT secret key 
ALGORITHM=HS256                     # JWT algorithm
ACCESS_TOKEN_EXPIRE_MINUTES=30      # Token expiration time
```

### Frontend (src/.env)
```
REACT_APP_API_URL=http://localhost:8001  # Backend API URL
```

## Features

- User authentication (login/signup)
- UMAP visualization of molecular data
- Property-based filtering
- Molecule search and visualization
- Chatbot interface for molecule exploration
- Enterprise search capabilities

## Authentication

The application uses JWT-based authentication. Only logged-in users can access:

- Filter page
- Search functionality
- Chat interface
- Enterprise search

## User Permissions

The system supports different permission levels:

- `basic`: Regular user access (default for new users)
- `premium`: Premium features access
- `admin`: Administrative access

Permissions can be updated in the SQLite database.

## Data Source

The application reads data from `umap_product_demo_1M_set.csv` in the public directory, which contains UMAP coordinates and properties for molecular compounds.

## Implementation Details

- Built with React (without TypeScript)
- Uses react-force-graph for visualization
- Implements D3 scales for color mapping
- Uses PapaParse for CSV processing
- Includes comprehensive logging for troubleshooting
