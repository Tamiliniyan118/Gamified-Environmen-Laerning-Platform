#!/usr/bin/env powershell
# GaiaQuest - One-Command Setup & Run Script
# Usage: .\setup-and-run.ps1

param(
    [switch]$SkipVenv = $false,
    [switch]$SkipModelDownload = $false
)

# Colors
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Red = [System.ConsoleColor]::Red
$Cyan = [System.ConsoleColor]::Cyan

function Write-Header($text) {
    Write-Host "========================================" -ForegroundColor $Cyan
    Write-Host $text -ForegroundColor $Cyan
    Write-Host "========================================" -ForegroundColor $Cyan
}

function Write-Success($text) {
    Write-Host "✓ $text" -ForegroundColor $Green
}

function Write-Error-Custom($text) {
    Write-Host "✗ $text" -ForegroundColor $Red
}

function Write-Info($text) {
    Write-Host "ℹ $text"
}

# Check for required software
Write-Header "Checking Prerequisites"

# Check Node.js
try {
    $NodeVersion = node --version
    Write-Success "Node.js $NodeVersion found"
} catch {
    Write-Error-Custom "Node.js not found. Please install Node.js 16+ from https://nodejs.org"
    exit 1
}

# Check Python
try {
    $PythonVersion = python --version
    Write-Success "$PythonVersion found"
} catch {
    Write-Error-Custom "Python not found. Please install Python 3.9+ from https://www.python.org"
    exit 1
}

# Setup Backend
Write-Header "Setting Up Backend"

Push-Location backend

Write-Info "Installing Node dependencies..."
npm install --silent

if (-not (Test-Path ".env")) {
    Write-Info ".env file not found. Creating from template..."
    
    $envContent = @"
PORT=3000
NODE_ENV=development
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
LOCAL_XAI_URL=http://127.0.0.1:5001
"@
    
    Set-Content -Path ".env" -Value $envContent
    Write-Success ".env created. Please edit with your Gmail credentials:"
    Write-Info "  1. Go to https://myaccount.google.com/apppasswords"
    Write-Info "  2. Generate app password"
    Write-Info "  3. Add to backend/.env as GMAIL_APP_PASSWORD"
} else {
    Write-Success ".env file exists"
}

Pop-Location

# Setup Python XAI Service
Write-Header "Setting Up Python XAI Service"

Push-Location backend/local_xai

if (-not (Test-Path "venv")) {
    Write-Info "Creating Python virtual environment..."
    python -m venv venv
    Write-Success "Virtual environment created"
}

Write-Info "Activating virtual environment..."
& .\venv\Scripts\Activate.ps1

Write-Info "Installing Python dependencies..."
pip install --quiet -r requirements.txt

Write-Success "Python XAI service ready"

Pop-Location

# Download ImageNet Classes if needed
$ClassesPath = "backend/local_xai/imagenet_classes.txt"
if (-not (Test-Path $ClassesPath)) {
    Write-Info "Downloading ImageNet class labels..."
    try {
        Invoke-WebRequest -Uri "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt" `
            -OutFile $ClassesPath -ErrorAction Stop
        Write-Success "ImageNet classes downloaded"
    } catch {
        Write-Error-Custom "Could not download classes (non-critical, will use fallback labels)"
    }
}

# Test Python Service
Write-Header "Testing Python XAI Service"

Write-Info "Running diagnostic test..."
Push-Location backend/local_xai
& .\venv\Scripts\Activate.ps1
python test_service.py
Pop-Location

# Display setup summary
Write-Header "Setup Complete!"

Write-Success "All components installed and ready"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor $Cyan
Write-Host ""
Write-Host "1. Edit backend/.env with your Gmail credentials"
Write-Host "2. Start the Python XAI service:"
Write-Host "   cd backend/local_xai && .\venv\Scripts\Activate.ps1 && python service.py"
Write-Host ""
Write-Host "3. In another terminal, start the Node backend:"
Write-Host "   cd backend && npm run dev"
Write-Host ""
Write-Host "4. In another terminal, start the frontend:"
Write-Host "   cd frontend && npm run dev"
Write-Host ""
Write-Host "5. Open http://localhost:5173 in your browser"
Write-Host ""
Write-Host "For full documentation, see:" -ForegroundColor $Cyan
Write-Host "  • FEATURE_IMPLEMENTATION_README.md (main docs)"
Write-Host "  • backend/local_xai/README.md (XAI service docs)"
Write-Host "  • python DEMO_WALKTHROUGH.py (interactive demo)"
Write-Host ""
