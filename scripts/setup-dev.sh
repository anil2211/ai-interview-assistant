#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
ENV_FILE="$BACKEND_DIR/.env"
ENV_EXAMPLE="$BACKEND_DIR/.env.example"

echo "========================================"
echo "  AI Interview Assistant - Dev Setup"
echo "========================================"
echo ""

# Check Node.js
if command -v node &> /dev/null; then
  echo "[OK] Node.js $(node --version)"
  echo "[OK] npm $(npm --version)"
else
  echo "[ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
  exit 1
fi

# Check Docker
if command -v docker &> /dev/null; then
  echo "[OK] $(docker --version)"
else
  echo "[WARN] Docker is not installed. MongoDB will need to be running separately."
fi

# Create .env if not exists
if [ ! -f "$ENV_FILE" ]; then
  if [ -f "$ENV_EXAMPLE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "[OK] Created .env from .env.example"
  else
    echo "[WARN] .env.example not found. Skipping .env creation."
  fi
else
  echo "[OK] .env already exists"
fi

# Install backend dependencies
echo ""
echo "Installing backend dependencies..."
cd "$BACKEND_DIR"
npm install
echo "[OK] Backend dependencies installed"

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install
echo "[OK] Frontend dependencies installed"

# Start MongoDB via Docker
MONGO_CONTAINER_NAME="ai-interview-mongodb-dev"
MONGO_RUNNING=$(docker ps --filter "name=$MONGO_CONTAINER_NAME" --filter "status=running" --format "{{.Names}}" 2>/dev/null || true)

if [ -z "$MONGO_RUNNING" ]; then
  echo ""
  echo "Starting MongoDB via Docker..."
  docker run -d \
    --name "$MONGO_CONTAINER_NAME" \
    -p 27017:27017 \
    -e MONGO_INITDB_ROOT_USERNAME=admin \
    -e MONGO_INITDB_ROOT_PASSWORD=mongoadmin123 \
    -e MONGO_INITDB_DATABASE=interview_assistant \
    mongo:7
  echo "[OK] MongoDB started on port 27017"
else
  echo "[OK] MongoDB is already running"
fi

cd "$ROOT_DIR"

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "Starting development servers:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "Default ports:"
echo "  MongoDB:       localhost:27017"
echo "  Backend API:   http://localhost:3000"
echo "  Frontend:      http://localhost:5173"
echo ""
echo "Admin credentials (seed data):"
echo "  Email:    admin@interviewassistant.com"
echo "  Password: Admin123!"
echo ""
