@echo off
echo ========================================
echo Starting CipherVault Backend Server
echo ========================================
echo.

cd backend

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python not found!
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo.
echo Checking dependencies...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo Installing Flask...
    pip install flask flask-cors
)

echo.
echo ========================================
echo Backend server starting on port 5000
echo Press Ctrl+C to stop
echo ========================================
echo.

python app.py

pause
