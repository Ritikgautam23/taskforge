#!/bin/bash

echo "🚀 Setting up TaskForge full-stack application..."

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "📦 Installing backend dependencies..."
cd ../backend
npm install

echo "✅ All dependencies installed!"

echo "🌟 Starting both servers..."
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5000"
cd ..
npm run dev