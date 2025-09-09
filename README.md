# FoodWish - Complete Recipe Management System 🍳

A full-stack recipe management application built with React and Django, featuring a beautiful UI with animations, comprehensive recipe database, user authentication, favorites, ratings, and shopping lists.

## ✨ Features

### Frontend (React)
- **Modern UI Design**: Glassmorphism effects, animated particles background
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **User Authentication**: Registration and login with session management
- **Recipe Discovery**: Search, filter, and browse recipes
- **Recipe Details**: Complete recipe information with ingredients and instructions
- **Favorites System**: Save and manage favorite recipes
- **Ratings & Reviews**: Rate recipes and read other users' reviews
- **Shopping Lists**: Generate shopping lists from recipe ingredients
- **Personal Dashboard**: View your recipes, favorites, and activity

### Backend (Django REST API)
- **Complete Recipe Management**: Full CRUD operations for recipes
- **User Authentication**: Token-based authentication system
- **Advanced Filtering**: Search by name, category, cuisine, diet, difficulty, time
- **Database Models**: Recipe, Ingredient, Instruction, Category, Cuisine, Diet, Rating, Favorite
- **Shopping List API**: Add recipe ingredients to shopping lists
- **User Management**: Registration, login, profile management
- **Admin Interface**: Django admin for easy content management

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **CSS3** - Advanced styling with animations and glassmorphism
- **JavaScript ES6+** - Modern JavaScript features
- **Fetch API** - HTTP client for API communication

### Backend  
- **Django 4.2** - Python web framework
- **Django REST Framework** - API development
- **SQLite** - Database (can be easily switched to PostgreSQL)
- **Django CORS Headers** - Cross-origin resource sharing
- **Pillow** - Image processing
- **Token Authentication** - Secure API access

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ 
- Node.js 14+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Activate virtual environment:**
   ```bash
   # Windows
   .\..\backend_venv\Scripts\Activate.ps1
   
   # Linux/Mac
   source ../backend_venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Create sample data:**
   ```bash
   python manage.py populate_data
   ```

6. **Start Django server:**
   ```bash
   python manage.py runserver
   ```

The Django API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start React development server:**
   ```bash
   npm start
   ```

The React app will be available at `http://localhost:3000`

## 📊 Sample Data

The application comes with pre-loaded sample data including:

### Categories
- Breakfast, Lunch, Dinner, Dessert, Snacks, Beverages

### Cuisines  
- Italian, Mexican, Asian, American, Mediterranean, Indian

### Diet Types
- Vegetarian, Vegan, Gluten-Free, Keto, Paleo, Dairy-Free

### Sample Recipes
- **Classic Spaghetti Carbonara** (Italian, Medium difficulty)
- **Chicken Tacos** (Mexican, Easy difficulty) 
- **Vegetarian Buddha Bowl** (Asian, Medium difficulty)
- **Chocolate Chip Cookies** (American, Easy difficulty)
- **Green Smoothie** (American, Easy difficulty, Vegan & Gluten-Free)

Each recipe includes:
- Complete ingredient lists with quantities
- Step-by-step instructions
- Prep/cook times and servings
- Nutritional information
- Difficulty ratings

## 🎯 Current Status

✅ **Backend Complete**: Django REST API with full functionality
✅ **Database Setup**: SQLite with sample data populated
✅ **Authentication**: Token-based auth system working
✅ **Frontend Updated**: React app connected to Django backend
✅ **Servers Running**: Both Django (port 8000) and React (port 3000) are active

## 👥 User Accounts

### Default Admin Account
- **Username**: admin
- **Password**: admin123
- **Access**: Django Admin Panel at `http://localhost:8000/admin/`

### User Features
- User registration with email validation
- Secure login/logout with token authentication
- Personal recipe collections
- Favorites management
- Recipe ratings and reviews
- Shopping list generation

---

**The FoodWish application is now fully functional with both backend and frontend running! 🚀**

Access the app at: **http://localhost:3000**