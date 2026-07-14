# Intern Management System

Intern Management System is a full-stack web application designed to streamline internship operations for admins, managers, and interns. It provides a centralized workflow for recruiting, onboarding, task assignment, evaluations, and offboarding.

## Features

- Role-based access for Admin, Manager, and Intern users
- Position and application management
- Intern profile and status tracking
- Onboarding and offboarding checklists
- Task assignment and progress tracking
- Performance evaluations and internal notes
- Secure REST API with JWT authentication

## Tech Stack

- Backend: Django, Django REST Framework, JWT authentication
- Frontend: React, Vite, React Router
- Database: SQLite (development)

## Project Structure

- backend/ - Django REST API and business logic
- frontend/ - React frontend application
- tests/ - Verification notes and build/test summaries

## Getting Started

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API will be available at http://127.0.0.1:8000/.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend should be runnig at http://127.0.0.1:5173/.

## Testing and Verification

Running the backend tests:

```bash
cd backend
python manage.py test core.tests
```

Building the frontend for production:

```bash
cd frontend
npm run build
```

## Notes

- This project is intended for internal internship workflow management.
- The current setup uses SQLite for local development.
- For production deployment, you will need to update settings such as secret keys, allowed hosts, and database configuration.
