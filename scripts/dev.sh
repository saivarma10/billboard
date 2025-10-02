#!/bin/bash

# Billboard Development Script
echo "Starting Billboard in development mode..."

# Start backend
echo "Starting backend server..."
cd backend
go mod download
go run main.go &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend server..."
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

# Function to cleanup processes on exit
cleanup() {
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Trap Ctrl+C
trap cleanup SIGINT

echo "Development servers started!"
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:3005"
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait
