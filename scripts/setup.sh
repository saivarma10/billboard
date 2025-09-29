#!/bin/bash

# Billboard Setup Script
echo "Setting up Billboard application..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "Creating directories..."
mkdir -p logs
mkdir -p data/postgres
mkdir -p data/redis

# Set up environment variables
echo "Setting up environment variables..."
if [ ! -f backend/.env ]; then
    cp backend/env.example backend/.env
    echo "Created backend/.env file. Please update the configuration."
fi

# Build and start services
echo "Building and starting services..."
cd deployment
docker-compose up --build -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Check if services are running
echo "Checking service status..."
docker-compose ps

echo "Setup complete!"
echo "Backend API: http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo "PostgreSQL: localhost:5432"
echo "Redis: localhost:6379"
