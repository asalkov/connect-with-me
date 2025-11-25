# Development Startup Script
# Starts both backend and frontend servers concurrently

Write-Host "Starting Chat Application Development Environment..." -ForegroundColor Green
Write-Host ""

# Kill any processes using ports 3000 and 5173
Write-Host "Checking for processes on ports 3000 and 5173..." -ForegroundColor Cyan

function Kill-ProcessOnPort {
    param([int]$Port)
    
    $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($process) {
        foreach ($processId in $process) {
            try {
                $processName = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
                Write-Host "Killing process $processName (PID: $processId) on port $Port" -ForegroundColor Yellow
                Stop-Process -Id $processId -Force
                Write-Host "[OK] Port $Port is now free" -ForegroundColor Green
            }
            catch {
                Write-Host "[WARNING] Could not kill process on port $Port" -ForegroundColor Yellow
            }
        }
    }
}

Kill-ProcessOnPort -Port 3000
Kill-ProcessOnPort -Port 5173

Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js version: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "[OK] npm version: $npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] npm is not installed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Cyan

# Check and install backend dependencies
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location backend
    npm install
    Pop-Location
    Write-Host "[OK] Backend dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "[OK] Backend dependencies already installed" -ForegroundColor Green
}

# Check and install frontend dependencies
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location frontend
    npm install
    Pop-Location
    Write-Host "[OK] Frontend dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "[OK] Frontend dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Cyan
Write-Host ""

# Function to start backend
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location backend
    npm run start:dev
}

# Function to start frontend
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location frontend
    npm run dev
}

Write-Host "[OK] Backend server starting on http://localhost:3000" -ForegroundColor Green
Write-Host "[OK] Frontend server starting on http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "API Documentation: http://localhost:3000/api/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Monitor jobs and display output
try {
    while ($true) {
        # Get backend output
        $backendOutput = Receive-Job -Job $backendJob
        if ($backendOutput) {
            Write-Host "BACKEND: " -ForegroundColor Blue -NoNewline
            Write-Host $backendOutput
        }

        # Get frontend output
        $frontendOutput = Receive-Job -Job $frontendJob
        if ($frontendOutput) {
            Write-Host "FRONTEND: " -ForegroundColor Magenta -NoNewline
            Write-Host $frontendOutput
        }

        # Check if jobs are still running
        if ($backendJob.State -eq 'Failed' -or $frontendJob.State -eq 'Failed') {
            Write-Host ""
            Write-Host "[ERROR] One or more servers failed to start" -ForegroundColor Red
            break
        }

        Start-Sleep -Milliseconds 100
    }
}
finally {
    # Cleanup jobs on exit
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob, $frontendJob
    Remove-Job -Job $backendJob, $frontendJob
    Write-Host "[OK] All servers stopped" -ForegroundColor Green
}
