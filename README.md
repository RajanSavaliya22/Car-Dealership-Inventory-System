# Comprehensive Car Dealership Inventory System

A modern, full-stack Auto Dealership platform built with **React** and **Django REST Framework**. Featuring a premium, glassmorphism-inspired dark-mode user interface, precise role-based access control, and a robust PostgreSQL database (configured for Neon DB).

---

## 🚀 Key Features

### 👤 Customer Experience
- **Premium Showroom**: A sleek, dark-themed landing page featuring an automatic horizontal vehicle slider and vivid car photography.
- **User Authentication**: Secure JWT-based registration and login system with inline modal forms, preventing abrupt page redirects.
- **Advanced Filtering**: Quickly find vehicles using multi-parameter search (Make, Model, Year, Category, Max Price).
- **Client-Side Pagination**: Navigate seamlessly through the dealership's large inventory in chunks of 8 to maintain peak performance.
- **Ordering System**: Users can easily "Inquire" or directly order vehicles, which permanently deducts from available stock. 
- **Personal Dashboard**: Customers can track their complete purchase history securely via an "Orders" modal.

### 🛡️ Admin Dashboard & Management
- **Role-Based Access**: Specialized functionality conditionally rendered just for `is_admin` or `is_staff` accounts.
- **Inventory Control**: Add, Update, or Delete vehicles effortlessly directly from the frontend inventory grid.
- **One-Click Restocking**: Quickly punch in a custom quantity and restock vehicles without needing to re-type all vehicle metadata.
- **Platform-wide Ledger**: Admins can view *all* transactions, tracing exactly who bought what (displaying buyers' names and emails), alongside custom RESTOCK transactions.

---

Check it out at: car-rajan-app.vercel.app

## 🛠️ Technology Stack

### Frontend
- **React.js**: Functional components and Hooks (`useState`, `useEffect`, `useContext`)
- **React Router Component**: Seamless single-page application navigation.
- **Vanilla CSS**: Custom CSS tokens, grid systems, and glassmorphism styling ensuring absolute independence from bloated UI libraries.
- **Axios**: Configured with a dedicated JWT interceptor context (`useAuth`) that securely manages access and refresh tokens.

### Backend
- **Django 5 & Django REST Framework**: Core API controllers for blazing fast REST endpoints.
- **djanorestframework-simplejwt**: Managing encrypted user authentication.
- **django-filter**: Built-in backend URL query integrations.
- **PostgreSQL / Neon DB**: Robust relationship structures for Data Integrity. Managed remotely via `dj-database-url`.

---

## 🏗️ Project Structure

```bash
Car_Dealership_Inventory_System/
├── backend/                  # Django REST API 
│   ├── manage.py
│   ├── requirements.txt      # Python dependencies
│   ├── config/               # Settings, WSGI, ASGI, URLs
│   ├── accounts/             # Custom User models & Auth endpoints
│   ├── transactions/         # Purchase / Restock logic & Serializers
│   └── vehicles/             # Inventory models, filters, & endpoints
└── frontend/                 # React Application
    ├── package.json          # Node dependencies
    ├── public/
    └── src/
        ├── api/              # Axios handlers (auth.js, vehicles.js)
        ├── components/       # Reusable UI (Auth forms, Vehicle cards)
        ├── context/          # Global State (AuthContext.js)
        ├── pages/            # View Layouts (LandingPage.js)
        └── index.css         # Global Styles & Theming Variables
```

---

## 💻 Local Setup & Installation

### 1. Database Configuration (Neon or Local Postgres)
1. Create a `.env` file in the `/backend` directory.
2. Provide your backend connection string (or local DB credentials):
```env
DB_URL=postgresql://<user>:<password>@<host>/<dbname>?sslmode=require
SECRET_KEY=your_secure_django_secret_key_here
```

### 2. Backend Initialization
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Create your admin account here!
python manage.py runserver
```
The API is now running on `http://localhost:8000`.

### 3. Frontend Initialization
Open a new terminal window / tab:
```bash
cd frontend
npm install
npm start
```
The application is now running on `http://localhost:3000`.

---

## 🧪 Testing

The backend includes a comprehensive pytest suite covering model integrity, REST API endpoints, and authentication middleware.

To execute tests:
```bash
cd backend
pytest
```

Frontend unit tests verify UI logic and rendering:
```bash
cd frontend
npm test
```

---
*Created in collaboration with deepmind architectural intelligence.*
