#!/bin/bash

# Local Development Start Script
# This script helps you start both frontend and backend locally

echo "🚀 Starting Shree Venkatesh Admin Panel locally..."

# Check if .env files exist
if [ ! -f ".env" ]; then
    echo "⚠️  Frontend .env not found. Creating from .env.example..."
    cp .env.example .env
fi

if [ ! -f "server/.env" ]; then
    echo "⚠️  Server .env not found. Creating from .env.example..."
    cp server/.env.example server/.env
    echo "❗ Please update server/.env with your DATABASE_URL and JWT_SECRET"
fi

# Start backend
echo "📦 Starting backend server..."
cd server
npm install
npm run db:generate
npm run dev &
BACKEND_PID=$!
cd ..

# Start frontend
echo "🎨 Starting frontend..."
npm install
npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "📍 Frontend: http://localhost:5173"
echo "📍 Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait