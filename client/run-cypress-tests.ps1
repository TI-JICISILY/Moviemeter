# PowerShell script to run Cypress tests with recording
Write-Host "Starting MovieMeter development server..." -ForegroundColor Green

# Start the development server in background
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Hidden

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check if server is running
$serverRunning = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $serverRunning = $true
            break
        }
    }
    catch {
        Write-Host "Server not ready yet, waiting..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if ($serverRunning) {
    Write-Host "Server is running! Starting Cypress tests..." -ForegroundColor Green
    
    # Run Cypress tests
    npm run cypress:run
    
    Write-Host "Tests completed! Check cypress/videos/ and cypress/screenshots/ for recordings." -ForegroundColor Green
} else {
    Write-Host "Failed to start server. Please check for errors." -ForegroundColor Red
}

# Stop the development server
Write-Host "Stopping development server..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
