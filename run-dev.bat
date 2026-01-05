@echo off
echo Starting Value Curve Development Environment...
echo.
echo Starting Flask backend on http://localhost:5000
echo Starting React frontend on http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

start "Flask Backend" cmd /k "python app.py projects/testing1/data.json"
timeout /t 2 /nobreak > nul
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting in separate windows...
echo Frontend will be available at: http://localhost:5173
echo Backend API at: http://localhost:5000/api/data
