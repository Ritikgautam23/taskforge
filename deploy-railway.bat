@echo off
REM TaskForge Railway Deployment Script for Windows

echo ================================
echo TaskForge Railway Deployment
echo ================================
echo.

REM Check if Railway CLI is installed
where railway >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo X Railway CLI not found.
    echo Install it with: npm i -g @railway/cli
    echo.
    pause
    exit /b 1
)

REM Check if logged in
railway whoami >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo X Not logged in to Railway.
    echo Run: railway login
    echo.
    pause
    exit /b 1
)

REM Initialize Railway project
echo Initializing Railway project...
if not exist "railway.toml" (
    call :multiline_input | railway init
    echo + Railway project initialized
) else (
    echo + railway.toml already exists
)

echo.
echo Configuring environment variables...
echo.
echo Backend service:
echo   - MONGODB_URI ^(auto from MongoDB addon^)
echo   - JWT_SECRET ^(generate: node -e "console.log(require('crypto').randomBytes^[64^]^).toString^('hex'^))"
echo   - NODE_ENV=production
echo   - FRONTEND_URL=https://your-frontend-service.up.railway.app
echo.
echo Frontend service:
echo   - VITE_API_URL=https://your-backend-service.up.railway.app/api
echo   - VITE_USE_MOCK=false
echo.

set /p deploy="Deploy now? (y/n): "
if /i "%deploy%"=="y" (
    echo Deploying to Railway...
    git add railway.toml
    git commit -m "Add Railway deployment configuration" 2>nul || echo No changes to commit
    git push origin main
    echo.
    echo + Deployment triggered!
    echo.
    echo Monitor deployment: railway log -f
    echo View project: https://railway.app/dashboard
) else (
    echo Skipping deployment. You can deploy later with: git push origin main
)

echo.
echo Next steps:
echo 1. Check Railway dashboard for service URLs
echo 2. Configure environment variables
echo 3. Run database seed: railway run --service backend npm run seed
echo 4. Test your deployed app!
echo.
pause
exit /b 0

:multiline_input
echo taskforge
echo yes
echo.
exit /b 0
