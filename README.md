
# Civic Resolve AI - Agentic Public Works System

An MVP for hyperlocal complaint resolution using AI Orchestration.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Gemini SDK
- **Backend (Reference)**: FastAPI, Redis, Firebase Admin
- **Database**: Google Cloud Firestore
- **Storage**: Firebase Cloud Storage

## Project Structure
- `/` (Root): React Frontend and Types
- `services/`: Gemini API Agent Logic
- `components/`: Role-based Dashboards (Citizen, Department, Authority)
- `backend_main.py`: Reference FastAPI server code

## Setup
1. **Frontend**:
   - `npm install`
   - Set your `API_KEY` (Gemini API) in environment.
   - `npm run dev`

2. **Backend (Local Execution)**:
   - Install Redis: `brew install redis` (macOS)
   - `pip install fastapi uvicorn firebase-admin redis`
   - Start Redis: `redis-server`
   - Start Backend: `python backend_main.py`

3. **Firebase**:
   - Create a project at `console.firebase.google.com`.
   - Enable Firestore and Authentication.
   - Download `serviceAccountKey.json` for backend integration.

## Agent Workflows
1. **Classifier Agent**: Categorizes complaints into departments (Water, Roads, etc.) using Gemini 3 Flash.
2. **Coordination Agent**: Generates parallel tasks and calculates SLAs based on complexity.
3. **Monitoring Agent**: Background process that tracks `slaDeadline` timestamps and flags escalations to the Authority.
