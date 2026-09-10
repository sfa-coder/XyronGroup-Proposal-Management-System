@echo off
title XyronGroup Proposal & Quotation Manager
color 0B

echo =====================================================================
echo           XyronGroup - Proposal & Quotation Manager
echo                     One-Click Launcher
echo =====================================================================
echo.

:: Switch to the folder where this batch file is located
cd /d "%~dp0"

:: Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b
)

:: Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [INFO] First-time setup detected: Installing required packages...
    echo This only happens once. Please wait...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install encountered an error.
        pause
        exit /b
    )
    echo [SUCCESS] Dependencies installed successfully!
    echo.
)

:: Automatically launch the browser after a brief delay
echo [INFO] Starting local development server...
echo [INFO] Opening your browser to http://localhost:3000 ...
start "" http://localhost:3000

:: Start the dev server
npm run dev

pause
