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
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

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

### Deploy to Railway (One-Click)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

#### Manual Railway Deployment

1. **Push to GitHub** (already done):
   ```bash
   git push origin main
   ```

2. **Create Railway Project**
   - Go to https://railway.app/dashboard
   - Click **"New Project"** → **"Deploy from GitHub"**
   - Select repository: `Ritikgautam23/taskforge`
   - Railway auto-creates two services from `railway.toml`

3. **Add MongoDB Plugin**
   - Click **"New"** → **"Add Plugin"**
   - Search **MongoDB** → **Add**
   - Wait for provisioning

4. **Configure Backend Environment Variables**
   In backend service → Settings → Variables:
   ```
   NODE_ENV     = production
   JWT_SECRET   = <generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
   FRONTEND_URL = https://taskforge-frontend.up.railway.app
   # MONGODB_URI auto-filled by plugin
   ```

5. **Configure Frontend Environment Variables**
   In frontend service → Settings → Variables:
   ```
   VITE_API_URL  = https://taskforge-backend.up.railway.app/api
   VITE_USE_MOCK = false
   ```

6. **Deploy**
   - Click **"Deploy"** on each service
   - Wait for build (~5-10 min)

7. **Seed Database** (optional)
   In backend console → run:
   ```bash
   npm run seed
   ```
   Demo credentials: `alex@taskforge.dev` / `password123`

See [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) for detailed guide.

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

### Frontend (http://localhost:5173)
- React with TypeScript
- Shadcn/ui component library
- Tailwind CSS styling
- React Query for API state management

### Backend (http://localhost:5000)
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