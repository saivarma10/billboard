# Billboard - Production Billing Application

A comprehensive multi-tenant billing application for shops with web and mobile support.

## Project Structure

```
billboard/
├── backend/                 # Go backend service
├── frontend/               # React web application
├── mobile/                 # React Native mobile app
├── deployment/             # Docker, Kubernetes, and deployment configs
├── docs/                   # Documentation
├── scripts/                # Utility scripts
└── README.md
```

## Technology Stack

### Backend
- **Language**: Go 1.21+
- **Framework**: Gin
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT
- **PDF Generation**: wkhtmltopdf

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI
- **Build Tool**: Vite

### Mobile
- **Framework**: React Native
- **Navigation**: React Navigation
- **State Management**: Redux Toolkit

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Cloud**: AWS/GCP/Azure
- **CI/CD**: GitHub Actions

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### 🐳 Docker Setup (Recommended)

**1. Clone and start all services:**
```bash
git clone <repository-url>
cd billboard
./scripts/setup.sh
```

**2. Access the application:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432
- **Redis**: localhost:6379

### 🛠️ Development Setup

**Option 1: Docker Development**
```bash
# Start services with Docker
cd deployment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Option 2: Local Development**
```bash
# Start backend
cd backend
go mod download
go run main.go

# Start frontend (new terminal)
cd frontend
npm install
npm run dev

# Start mobile app (new terminal)
cd mobile
npm install
npx react-native run-ios  # or run-android
```

### 🐳 Docker Commands

**Build and run all services:**
```bash
cd deployment
docker-compose up --build -d
```

**View service status:**
```bash
docker-compose ps
```

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Restart a service:**
```bash
docker-compose restart backend
docker-compose restart frontend
```

**Stop all services:**
```bash
docker-compose down
```

**Stop and remove volumes:**
```bash
docker-compose down -v
```

**Rebuild specific service:**
```bash
docker-compose up --build -d backend
```

**Execute commands in containers:**
```bash
# Backend shell
docker-compose exec backend sh

# Frontend shell
docker-compose exec frontend sh

# Database shell
docker-compose exec postgres psql -U billboard_user -d billboard_db
```

**Production deployment:**
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build -d

# Scale services
docker-compose up --scale backend=3 --scale frontend=2 -d
```

## API Documentation

The API documentation is available at `/docs` when running the backend server.

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License.
