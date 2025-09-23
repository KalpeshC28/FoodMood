
# Backend (Django)

This is the backend for FoodMood, built with Django and Django REST Framework. It provides a secure REST API for recipe management, user authentication, and media storage using AWS S3.


## Features

- User authentication (login, logout, register)
- Full CRUD for recipes, ingredients, categories, cuisines, diets, ratings, favorites
- Media/image upload and serving via AWS S3
- Advanced filtering and search endpoints
- CORS enabled for frontend access


## Quick Start

1. Navigate to this folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run migrations:
   ```bash
   python manage.py migrate
   ```
4. Start the server:
   ```bash
   python manage.py runserver
   ```