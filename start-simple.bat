@echo off
echo 🚀 Starting TaskForge Frontend (Mock Mode)...

set VITE_API_URL=http://localhost:5001/api
set VITE_USE_MOCK=true
npm run dev -- --port 8080