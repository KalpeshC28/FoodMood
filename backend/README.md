# Backend (Django)

This is the backend for FoodWish, built with Django and Django REST Framework.

## Features

- User authentication (login, logout, register)
- Endpoints for searching and saving recipes (ready for Spoonacular API integration)
- CORS enabled for frontend access

## Quick Start

1. Navigate to this folder:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run migrations:
   ```
   python manage.py migrate
   ```
4. Start the server:
   ```
   python manage.py runserver
   ```