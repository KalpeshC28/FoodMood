@echo off
start cmd /k "cd frontend && npm start"
start cmd /k "cd backend && backend_venv\Scripts\activate && python manage.py runserver || pause"