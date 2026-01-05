# Value Curve Development Environment Launcher
Write-Host "Starting Value Curve Development Environment..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend App: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop servers" -ForegroundColor Yellow
Write-Host ""

# Start Flask backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python app.py projects/testing1/data.json"

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start React frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Both servers starting in separate windows..." -ForegroundColor Green
Write-Host ""
Write-Host "Open http://localhost:5173 in your browser when ready" -ForegroundColor Green
