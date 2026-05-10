@echo off
echo ========================================
echo CipherVault Backend Health Check
echo ========================================
echo.

echo [1/3] Checking if backend is running...
curl -s http://localhost:5000/api/generate-key >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Backend is NOT running!
    echo.
    echo Please start backend first:
    echo   1. Open new terminal
    echo   2. cd backend
    echo   3. python app.py
    echo.
) else (
    echo [OK] Backend is running on port 5000
)

echo.
echo [2/3] Checking Python installation...
python --version 2>nul
if errorlevel 1 (
    echo [FAIL] Python not found!
) else (
    echo [OK] Python is installed
)

echo.
echo [3/3] Checking Flask installation...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Flask not installed!
    echo Run: pip install flask flask-cors
) else (
    echo [OK] Flask is installed
)

echo.
echo ========================================
echo Health Check Complete
echo ========================================
echo.

pause
