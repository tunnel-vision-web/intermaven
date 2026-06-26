# Intermaven Workspace Rules & Guidelines

Welcome to the Intermaven workspace. This file defines the specific configuration and rules for Antigravity when working on the Intermaven platform.

## Project Structure
- **Frontend**: Located in `frontend/` (React 18 application built with Create React App).
  - Main configuration / API setup: [App.js](file:///C:/Users/judit/workspace/intermaven/frontend/src/App.js)
  - Run frontend dev server: `npm start` (inside the `frontend` folder)
- **Backend**: Located in `backend/` (FastAPI + MongoDB).
  - Port configuration: Starts on port `8001`
  - Active MongoDB connection details and environment variables are documented in [DOCUMENTATION.md](file:///C:/Users/judit/workspace/intermaven/DOCUMENTATION.md#L854-L907).

## Environment Setup
### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory with the following variables:
```env
MONGO_USER=mongo
MONGO_PASSWORD=IzypDlPIOWEIyNZSoybbZmWzvPYAeuym
MONGO_HOST=centerbeam.proxy.rlwy.net:20600
DB_NAME=intermaven
MONGO_SCHEME=mongodb
MONGO_OPTIONS=authSource=admin

EMERGENT_LLM_KEY=sk-emergent-a3a79EeF44b2f09684
JWT_SECRET=intermaven_jwt_secret_key_2025_secure
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory if you need to point to a custom local or production backend:
```env
REACT_APP_BACKEND_URL=https://intermaven.onrender.com
```
*(By default, it will fall back to `http://localhost:8001` for localhost developers).*

## Guidelines
1. Always prioritize modularization when modifying `server.py` in the backend (extract monolith sections to `routes/`).
2. Ensure mobile responsiveness is tested when changing UI layouts in the frontend.
