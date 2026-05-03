# TaskForge - Full-Stack Project Management

A complete project management application with drag-and-drop Kanban boards, analytics, and team collaboration features.

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- MongoDB (running locally on port 27017)

### One Command Setup & Run

**Windows:**
```bash
./start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh && ./start.sh
```

This will start both servers:
- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:5001

### Manual Setup

```bash
# Install dependencies (already done)
npm install
cd backend && npm install

# Start both servers
npm run dev
```

### Mock Mode (No Backend Required)

Run the frontend with mock data (no backend/MongoDB needed):
```bash
./start-simple.bat
```

## 📦 Deployment

### Deploy to Railway (Recommended)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/taskforge)

#### Manual Railway Deployment

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Initialize Project**
   ```bash
   cd breeze-project-hub-main
   railway init
   ```
   - Select "Deploy a monorepo"
   - Choose "Empty Project"
   - Name: `taskforge`

3. **Add MongoDB**
   ```bash
   railway add mongodb
   ```
   Railway will automatically connect it to the backend service.

4. **Configure Backend Variables**
   In Railway dashboard → backend service → Variables:
   ```
   JWT_SECRET = <generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
   NODE_ENV = production
   FRONTEND_URL = https://your-frontend-service.up.railway.app
   ```

5. **Configure Frontend Variables**
   In Railway dashboard → frontend service → Variables:
   ```
   VITE_API_URL = https://your-backend-service.up.railway.app/api
   VITE_USE_MOCK = false
   ```

6. **Deploy**
   ```bash
   git add railway.toml
   git commit -m "Add Railway config"
   git push origin main
   ```

7. **Seed Database** (optional)
   ```bash
   railway run --service backend npm run seed
   ```

See [DEPLOY.md](./DEPLOY.md) for complete deployment guide.

### Docker Deployment (Alternative)

```bash
# Using Docker Compose (local)
docker-compose up

# Build and run backend
docker build -f Dockerfile.backend -t taskforge-backend .
docker run -p 5000:5000 taskforge-backend

# Build and run frontend
docker build -f Dockerfile.frontend -t taskforge-frontend .
docker run -p 3000:3000 taskforge-frontend
```

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Shadcn/ui + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB + JWT Authentication
- **Features**: Kanban boards, drag-and-drop, analytics, team management

## 🔧 Development

### Frontend (http://localhost:8080)
- React with TypeScript
- Shadcn/ui component library
- Tailwind CSS styling
- React Query for API state management

### Backend (http://localhost:5001)
- Express.js API server
- MongoDB database
- JWT authentication
- RESTful API design

## 📊 Features

- ✅ User authentication (login/signup)
- ✅ Project management
- ✅ Kanban board with drag-and-drop
- ✅ Task assignment and status tracking
- ✅ Analytics dashboard with charts
- ✅ Team member management
- ✅ Search and filtering

## 🔐 Demo Credentials

**With Mock Data (start-simple.bat):**
- **Email**: alex@taskforge.dev
- **Password**: Any password (demo mode)

**With MongoDB Backend (VITE_USE_MOCK=false):**
1. Seed the database with test users:
   ```bash
   cd backend
   npm run seed
   ```
2. Login with:
   - **Email**: alex@taskforge.dev
   - **Password**: password123

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- React Router (routing)
- React Query (API state)
- Shadcn/ui (components)
- Tailwind CSS (styling)
- Recharts (charts)
- @dnd-kit (drag-and-drop)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcryptjs (password hashing)
- Express Validator (input validation)