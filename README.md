# 🏠 Home Buddy

Home Buddy is a platform that helps users find, list, and manage rental properties with an intuitive user experience and powerful backend services.

---

## 📖 Overview

Home Buddy provides:

- Property listings
- Property search and filtering
- User authentication and authorization
- Booking and rental management
- Responsive user interface
- RESTful API backend

---

## 🏗️ Project Structure

```
home-buddy/
│
├── frontend/          # Next.js frontend application
│
├── backend/           # FastAPI backend application
│
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- FastAPI
- MongoDB
- JWT Authentication

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (v18+)
- Python (v3.10+)
- MongoDB
- Git

---

# Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Frontend will be available at:

```text
http://localhost:3000
```

---

# Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate it:

### Linux/Mac

```bash
source venv/bin/activate
```

### Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost/home_buddy
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Run database migrations:

```bash
alembic upgrade head
```

Start the API server:

```bash
uvicorn app.main:app --reload
```

Backend will be available at:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

---

## 🌐 Environment Variables

### Frontend

| Variable | Description |
|-----------|-------------|
| NEXT_PUBLIC_API_URL | Backend API URL |

### Backend

| Variable | Description |
|-----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| SECRET_KEY | JWT signing key |
| ALGORITHM | JWT algorithm |
| ACCESS_TOKEN_EXPIRE_MINUTES | Token expiration time |

---

## 📸 Features

- User registration and login
- Property listing management
- Property search
- Responsive design
- Secure authentication
- API documentation with Swagger

---

## 🧪 Running Tests

### Frontend

```bash
cd frontend
npm test
```

### Backend

```bash
cd backend
pytest
```

---

## 🚢 Deployment

### Frontend

Deploy using:

- Vercel
- Netlify

### Backend

Deploy using:

- Render
- Railway
- AWS
- DigitalOcean

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to GitHub

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Developed by Toluwaloju Kayode

GitHub: https://github.com/Toluwaloju0