# Railway Deployment Complete — Ready to Deploy

## ✅ Changes Made

1. **Added `serve` package** to frontend dependencies (for static hosting)
2. **Fixed SPA routing** — start script now uses `serve -s` flag
3. **Added Node.js engines** (>=18) to both package.json files
4. **Configured static hosting** in railway.toml (publishDirectory = dist, no startCommand)
5. **Added `_redirects`** file for client-side routing fallback
6. **Cleaned up** root package.json scripts

---

## 🚀 Deploy to Railway (Manual Steps)

### Prerequisites
- GitHub repo: https://github.com/Ritikgautam23/taskforge
- Railway account: https://railway.app
- MongoDB plugin available

### Step 1: Delete Old Project (Free Up Resources)

If you hit resource limits:

1. Go to https://railway.app/dashboard
2. Find old/failed `taskforge` project
3. Click → Settings (⚙️) → **Delete Project**
4. Confirm deletion

This frees up your project slot.

### Step 2: Create New Railway Project

1. Click **"New Project"** in Railway dashboard
2. Choose **"Deploy from GitHub"**
3. Select repository: `Ritikgautam23/taskforge`
4. Railway will auto-detect two services from `railway.toml`

If auto-detect fails, manually create:

#### Backend Service
- **Name**: `backend`
- **Root directory**: `backend`
- **Branch**: `main`
- **Build command**: `npm ci --only=production`
- **Start command**: `node src/server.js`
- **Port**: `5000`

#### Frontend Service
- **Name**: `frontend`
- **Root directory**: `.`
- **Branch**: `main`
- **Build command**: `npm ci && npm run build`
- **Publish directory**: `dist`
- **Port**: `3000`
- **Start command**: *(leave empty — static hosting)*

**Important**: Frontend should be **static hosting** (publishDirectory only, NO startCommand). Railway serves files from `dist/` via CDN.

### Step 3: Add MongoDB Plugin

1. Click **"New"** → **"Add Plugin"**
2. Search **MongoDB**
3. Click **"Add"**
4. Wait ~30 seconds for provisioning

### Step 4: Configure Environment Variables

#### Backend Service → Settings → Variables:

```
NODE_ENV      = production
JWT_SECRET    = b1fa290c7203398fdc568ebc13f93e8639ae7746f4b3c6eb0533be59c4429ab0199d505748b8c8d806f0636959756486a60d46f2094a6a7eb04f7250d13eafcb
MONGODB_URI   = <copy from MongoDB plugin>
FRONTEND_URL  = https://taskforge-frontend.up.railway.app
```

#### Frontend Service → Settings → Variables:

```
VITE_API_URL  = https://taskforge-backend.up.railway.app/api
VITE_USE_MOCK = false
```

### Step 5: Deploy

1. Both services should show **" New commit detected"**
2. Click **"Deploy"** on each (or wait for auto-deploy)
3. Watch logs for errors

### Step 6: Seed Database (After Backend is Live)

1. Go to backend service → **Console**
2. Run:
```bash
npm run seed
```
This creates demo user:
- Email: `alex@taskforge.dev`
- Password: `password123`

---

## 🧪 Testing

After deployment:

1. **Frontend URL**: `https://taskforge-frontend.up.railway.app`
2. **Backend URL**: `https://taskforge-backend.up.railway.app`
3. Login with seeded credentials
4. Test Kanban board, projects, tasks

---

## 🔧 If Deployment Fails

### Common Issues:

**1. "Module not found: serve"**
- Ensure frontend `publishDirectory` is set (not `startCommand`)
- Remove any `startCommand` from frontend service
- Frontend should be **static hosting**, not a service

**2. MongoDB connection fails**
- Confirm MongoDB plugin is added and `MONGODB_URI` is set in backend vars
- Check MongoDB plugin status is "Provisioned"

**3. CORS errors**
- Ensure `FRONTEND_URL` matches your actual frontend domain
- It must be exact (including https://)

**4. 404 on routes (e.g., /projects)**
- `_redirects` file should be in `public/` (already added)
- Ensure `publishDirectory = "dist"` is set

**5. Build fails (Node version)**
- `engines.node: ">=18"` is set — Railway should use Node 18+
- If not, manually set Node version in service settings

---

## 📁 Project Structure (Post-Fix)

```
taskforge/
├── backend/
│   ├── src/
│   ├── package.json (with engines.node >=18)
│   └── railway.toml (optional per-service)
├── frontend/
│   ├── src/
│   ├── public/_redirects (SPA fallback)
│   ├── package.json (with engines.node >=18, serve dependency)
│   └── dist/ (built output)
├── railway.toml (monorepo config — both services defined)
└── ...other config files
```

---

## Need Help?

If any step fails, share:
- Screenshot of Railway service configuration
- Error messages from logs
- Which step you're stuck on

I'll help troubleshoot!
