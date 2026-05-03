## Railway Deployment Guide for TaskForge

This guide walks through deploying TaskForge to Railway as a monorepo with separate services for frontend and backend.

### Prerequisites

1. Railway account (sign up at railway.app)
2. Railway CLI installed (`npm i -g @railway/cli`)
3. Railway CLI authenticated (`railway login`)

### One-Click Deploy (Recommended)

Click the button below to deploy both services automatically:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/taskforge?referralCode=YOUR_CODE)

### Manual Deployment Steps

#### 1. Initialize Railway in the Project Root

```bash
cd breeze-project-hub-main
railway init
```

When prompted:
- Select "Deploy a monorepo"
- Choose "Empty Project" template
- Name your project (e.g., "taskforge")

#### 2. Add Backend Service

```bash
# From project root
railway link   # Link to your Railway project
railway run --service backend npm run setup
```

The backend will be automatically detected as a service because:
- It has its own `package.json` in `backend/`
- Contains a `start` script

#### 3. Configure Backend Environment Variables

In the Railway dashboard → your project → backend service → Variables:

```
MONGODB_URI = <from MongoDB addon>
JWT_SECRET = <generate a secure random string>
NODE_ENV = production
PORT = ${PORT}  # Railway provides this automatically
FRONTEND_URL = https://your-frontend-service.up.railway.app
```

**Add MongoDB:**
- In Railway dashboard → your project → New → Add Plugin → MongoDB
- Copy the `MONGODB_URI` connection string
- Railway will auto-inject `MONGODB_URI` into your backend service

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 4. Add Frontend Service

In Railway dashboard → your project → New Service:
- Select "Deploy from Git repo"
- Choose "Frontend" as service type
- Root directory: `.` (project root)
- Build command: `npm ci && npm run build`
- Start command: `npx serve dist -p $PORT`

**Configure Frontend Environment Variables:**

```
VITE_API_URL = https://your-backend-service.up.railway.app/api
VITE_USE_MOCK = false
```

**Important:** Replace `your-backend-service` with your actual backend service URL from Railway.

#### 5. Deploy

```bash
# Commit the railway.toml if not already committed
git add railway.toml
git commit -m "Add Railway deployment config"

# Push to trigger deployment
git push origin main
```

Railway will automatically:
- Detect both services (backend and frontend)
- Install dependencies
- Build frontend
- Run migrations/seed if configured
- Deploy with HTTPS URLs

#### 6. Run Database Seed (Optional)

After backend deployment completes, seed the database with sample data:

```bash
railway run --service backend npm run seed
```

Or add a post-deploy hook in `railway.toml`:

```toml
[hooks]
[hooks.deploy]
command = "npm run seed"
```

#### 7. Verify Deployment

1. Check backend health: `https://your-backend-service.up.railway.app/api/health`
2. Open frontend URL from Railway dashboard
3. Test login with seeded credentials (check `backend/src/seed.js` for user credentials)

### Troubleshooting

**Frontend can't connect to backend:**
- Ensure `VITE_API_URL` is correctly set to backend URL
- Check CORS configuration in backend (`server.js` line 19-22)
- Verify both services are running

**Database connection fails:**
- MongoDB addon must be attached to backend service
- `MONGODB_URI` should be automatically injected
- Check backend logs: `railway logs --service backend`

**Build fails:**
- Ensure Node.js version is >= 18 in Railway settings
- Frontend requires Node.js 18+ for Vite 5
- Backend requires Node.js 18+ for ES modules

**Environment not loading:**
- Railway automatically sets `NODE_ENV=production`
- Frontend uses Vite's built-in env loading
- Use `import.meta.env.VITE_*` for frontend variables

### Service Architecture

```
Railway Project: taskforge
├── Service: backend (Express API)
│   ├── Port: $PORT (auto)
│   ├── URL: https://taskforge-backend.up.railway.app
│   ├── MongoDB addon attached
│   └── Start: node src/server.js
│
└── Service: frontend (Vite static build)
    ├── Port: $PORT (auto)
    ├── URL: https://taskforge-frontend.up.railway.app
    ├── Build: npm run build
    └── Start: npx serve dist -p $PORT
```

### Cost Optimization

Railway offers $5 free credit monthly. TaskForge typically costs:
- Backend: ~$0.50/month (always-on instance ~512MB RAM)
- Frontend: ~$0.00/month (static hosting included in free tier)
- MongoDB: Free tier (512MB storage)

**To minimize costs:**
- Use backend's free tier (500 hours/month)
- Frontend is always free
- MongoDB free tier is sufficient for small teams

### Custom Domain (Optional)

1. In Railway dashboard → service → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `FRONTEND_URL` in backend env vars

### Monitoring & Logs

- View logs: `railway logs`
- Live logs: `railway logs -f`
- Service metrics in Railway dashboard
- MongoDB monitoring via addon dashboard

### Scaling

To handle more traffic:
1. Upgrade backend to professional tier ($5/month)
2. Increase backend instance size (1GB+ RAM)
3. Enable MongoDB cluster for better performance

### Support

For Railway-specific issues: help@railway.app
For TaskForge issues: https://github.com/Kilo-Org/kilocode/issues
