#!/bin/bash

# TaskForge Railway Deployment Script
# This script automates the Railway deployment process

set -e

echo "🚀 TaskForge Railway Deployment"
echo "================================"
echo ""

# Check prerequisites
command -v railway >/dev/null 2>&1 || {
    echo "❌ Railway CLI not found. Install it first:"
    echo "   npm i -g @railway/cli"
    exit 1
}

if ! railway whoami >/dev/null 2>&1; then
    echo "❌ Not logged in to Railway. Run: railway login"
    exit 1
fi

# Initialize Railway project
echo "📦 Initializing Railway project..."
if [ ! -f "railway.toml" ]; then
    railway init << EOF
taskforge
yes
EOF
    echo "✅ Railway project initialized"
else
    echo "✅ railway.toml already exists"
fi

# Add MongoDB addon
echo "🗄️  Adding MongoDB..."
if railway plugins | grep -q "mongodb"; then
    railway add mongodb << EOF
taskforge-mongodb
EOF
    echo "✅ MongoDB addon added"
else
    echo "⚠️  MongoDB plugin not available. Add manually in Railway dashboard."
fi

# Configure environment variables
echo ""
echo "⚙️  Configuring environment variables..."
echo "Please set these in Railway dashboard manually if not auto-detected:"
echo ""
echo "Backend service:"
echo "  - MONGODB_URI (auto from MongoDB addon)"
echo "  - JWT_SECRET (generate: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\")"
echo "  - NODE_ENV=production"
echo "  - FRONTEND_URL=https://your-frontend-service.up.railway.app"
echo ""
echo "Frontend service:"
echo "  - VITE_API_URL=https://your-backend-service.up.railway.app/api"
echo "  - VITE_USE_MOCK=false"
echo ""

# Deploy
read -p "Deploy now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying to Railway..."
    git add railway.toml
    git commit -m "Add Railway deployment configuration" || echo "No changes to commit"
    git push origin main
    echo "✅ Deployment triggered!"
    echo ""
    echo "Monitor deployment: railway log -f"
    echo "View project: https://railway.app/dashboard"
fi

echo ""
echo "📚 Next steps:"
echo "1. Check Railway dashboard for service URLs"
echo "2. Configure environment variables"
echo "3. Run database seed: railway run --service backend npm run seed"
echo "4. Test your deployed app!"
echo ""
