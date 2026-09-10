@echo off
setlocal enabledelayedexpansion
title XyronGroup Proposal Platform - Installer Setup
color 0B

echo =====================================================================
echo           XyronGroup - Proposal & Quotation Manager
echo                     One-Click Installer Setup
echo =====================================================================
echo.

:: Get directory where installer is running
set "INSTALL_DIR=%~dp0"
:: Remove trailing backslash if present
if "%INSTALL_DIR:~-1%"=="\" set "INSTALL_DIR=%INSTALL_DIR:~0,-1%"

echo [1/3] Checking environment requirements...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js was not detected on your computer.
    echo Please download and install Node.js (LTS version) from:
    echo https://nodejs.org
    echo.
    echo After installing Node.js, run this installer again.
    echo.
    pause
    exit /b
)
echo      - Node.js is installed.

echo.
echo [2/3] Installing application dependencies...
echo      Please wait while packages are configured...
cd /d "%INSTALL_DIR%"
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] npm install encountered an error. Please check your internet connection.
    pause
    exit /b
)
echo      - Dependencies successfully installed!

echo.
echo [3/3] Creating Windows Desktop Shortcut...
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\Xyron Proposals.lnk"
set "TARGET_BAT=%INSTALL_DIR%\Start-App.bat"

:: Use PowerShell to create the desktop shortcut
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$s = $ws.CreateShortcut('%SHORTCUT_PATH%'); " ^
  "$s.TargetPath = '%TARGET_BAT%'; " ^
  "$s.WorkingDirectory = '%INSTALL_DIR%'; " ^
  "$s.Description = 'XyronGroup Proposal and Quotation Management Platform'; " ^
  "$s.Save();"

if exist "%SHORTCUT_PATH%" (
    echo      - Desktop shortcut 'Xyron Proposals' created successfully!
) else (
    echo      - Notice: Could not automatically place shortcut on Desktop, but Start-App.bat is ready.
)

echo.
echo =====================================================================
echo                   INSTALLATION COMPLETE!
echo =====================================================================
echo.
echo You can now close this window.
echo An icon named "Xyron Proposals" has been placed on your Desktop.
echo Double-click that icon anytime to open the app directly!
echo.
set /p LAUNCH="Would you like to start Xyron Proposals right now? (Y/N): "
if /i "%LAUNCH%"=="Y" (
    start "" "%TARGET_BAT%"
)

exit /b
