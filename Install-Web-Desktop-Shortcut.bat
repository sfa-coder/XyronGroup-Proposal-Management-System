@echo off
setlocal
title Install Xyron Cloud App Shortcut
color 0A

echo =====================================================================
echo         Installing Xyron Proposals Cloud Desktop Shortcut
echo =====================================================================
echo.

set "APP_URL=https://ais-dev-u7h7tymh5o3vr4pb4rbnhp-135786567979.asia-east1.run.app"
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\Xyron Proposals.lnk"

:: Find Chrome or Edge to launch in standalone window app mode
set "CHROME_PATH="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=%LocalAppData%\Google\Chrome\Application\chrome.exe"

set "EDGE_PATH="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "EDGE_PATH=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "EDGE_PATH=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"

if defined CHROME_PATH (
    echo [INFO] Found Google Chrome. Creating native desktop app shortcut...
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
      "$ws = New-Object -ComObject WScript.Shell; " ^
      "$s = $ws.CreateShortcut('%SHORTCUT_PATH%'); " ^
      "$s.TargetPath = '%CHROME_PATH%'; " ^
      "$s.Arguments = '--app=%APP_URL%'; " ^
      "$s.Description = 'XyronGroup Proposal & Quotation Manager'; " ^
      "$s.Save();"
) else if defined EDGE_PATH (
    echo [INFO] Found Microsoft Edge. Creating native desktop app shortcut...
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
      "$ws = New-Object -ComObject WScript.Shell; " ^
      "$s = $ws.CreateShortcut('%SHORTCUT_PATH%'); " ^
      "$s.TargetPath = '%EDGE_PATH%'; " ^
      "$s.Arguments = '--app=%APP_URL%'; " ^
      "$s.Description = 'XyronGroup Proposal & Quotation Manager'; " ^
      "$s.Save();"
) else (
    echo [INFO] Creating standard web shortcut...
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
      "$ws = New-Object -ComObject WScript.Shell; " ^
      "$s = $ws.CreateShortcut('%SHORTCUT_PATH%'); " ^
      "$s.TargetPath = '%APP_URL%'; " ^
      "$s.Save();"
)

echo.
echo =====================================================================
echo      SUCCESS! "Xyron Proposals" icon has been placed on your Desktop!
echo =====================================================================
echo.
echo You can now double-click the icon on your Desktop anytime to start working.
echo.
pause
