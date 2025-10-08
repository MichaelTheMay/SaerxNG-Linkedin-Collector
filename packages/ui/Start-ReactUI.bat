@echo off
REM ===============================================================
REM SearxNG LinkedIn Collector - React UI Launcher
REM ===============================================================
REM Double-click this file to start the React web interface
REM
REM This will:
REM   1. Check if Node.js and npm are installed
REM   2. Install dependencies if needed
REM   3. Start the development server
REM   4. Open your browser to http://localhost:5173

title SearxNG React UI

echo.
echo ===============================================================
echo   SearxNG LinkedIn Collector - React UI
echo ===============================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✓ Node.js and npm are installed
echo.

REM Install dependencies if needed
if not exist "node_modules\" (
    echo Installing dependencies...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to install dependencies!
        echo.
        pause
        exit /b 1
    )
) else (
    echo ✓ Dependencies are already installed
)

echo.
echo ===============================================================
echo   Starting React UI...
echo ===============================================================
echo.
echo The development server will start at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the development server
npm run dev
