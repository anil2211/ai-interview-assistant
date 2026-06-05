Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Interview Assistant - Dev Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "[OK] Node.js $nodeVersion" -ForegroundColor Green
    Write-Host "[OK] npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "[OK] $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Docker is not installed. MongoDB will need to be running separately." -ForegroundColor Yellow
}

$rootDir = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"
$envFile = Join-Path $backendDir ".env"
$envExample = Join-Path $backendDir ".env.example"

# Create .env if not exists
if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Host "[OK] Created .env from .env.example" -ForegroundColor Green
    } else {
        Write-Host "[WARN] .env.example not found. Skipping .env creation." -ForegroundColor Yellow
    }
} else {
    Write-Host "[OK] .env already exists" -ForegroundColor Green
}

# Install backend dependencies
Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location $backendDir
npm install
if ($?) {
    Write-Host "[OK] Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Install frontend dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location $frontendDir
npm install
if ($?) {
    Write-Host "[OK] Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

# Start MongoDB via Docker
$mongoContainerName = "ai-interview-mongodb-dev"
$mongoRunning = docker ps --filter "name=$mongoContainerName" --filter "status=running" --format "{{.Names}}"

if (-not $mongoRunning) {
    Write-Host ""
    Write-Host "Starting MongoDB via Docker..." -ForegroundColor Yellow
    docker run -d `
        --name $mongoContainerName `
        -p 27017:27017 `
        -e MONGO_INITDB_ROOT_USERNAME=admin `
        -e MONGO_INITDB_ROOT_PASSWORD=mongoadmin123 `
        -e MONGO_INITDB_DATABASE=interview_assistant `
        mongo:7

    if ($?) {
        Write-Host "[OK] MongoDB started on port 27017" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Could not start MongoDB via Docker. Ensure MongoDB is running." -ForegroundColor Yellow
    }
} else {
    Write-Host "[OK] MongoDB is already running" -ForegroundColor Green
}

Set-Location $rootDir

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting development servers:" -ForegroundColor White
Write-Host "  Backend:  npm run dev  (http://localhost:$((Get-Content $envFile | Select-String '^PORT=' | ForEach-Object { $_ -replace '^PORT=', '' }).Trim()))" -ForegroundColor Yellow
Write-Host "  Frontend: npm run dev  (http://localhost:5173)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Default ports:" -ForegroundColor White
Write-Host "  MongoDB:       localhost:27017" -ForegroundColor White
Write-Host "  Backend API:   http://localhost:3000" -ForegroundColor White
Write-Host "  Frontend:      http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Admin credentials (seed data):" -ForegroundColor White
Write-Host "  Email:    admin@interviewassistant.com" -ForegroundColor White
Write-Host "  Password: Admin123!" -ForegroundColor White
Write-Host ""
