@echo off
echo ========================================
echo Starting CipherVault Frontend
echo ========================================
echo.

cd frontend

echo Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo.
echo ========================================
echo Frontend starting on port 3000
echo Press Ctrl+C to stop
echo ========================================
echo.

npm run dev

pause
