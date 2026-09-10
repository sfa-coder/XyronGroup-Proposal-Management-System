import React, { useState, useEffect } from "react";
import {
  X,
  Laptop,
  Download,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Terminal,
  Monitor,
  Rocket,
  ShieldCheck,
  Copy,
  Check,
  Globe,
  ArrowRight,
} from "lucide-react";

interface OneClickLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
}

export const OneClickLauncherModal: React.FC<OneClickLauncherModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA / desktop app)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;
    if (isStandalone) {
      setIsAppInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleTriggerPWAInstall = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const choice = await installPromptEvent.userChoice;
      if (choice.outcome === "accepted") {
        showToast("App Installed", "Xyron Proposals has been added to your desktop/apps!", "success");
        setIsAppInstalled(true);
      }
      setInstallPromptEvent(null);
    } else {
      showToast(
        "Browser Install Ready",
        "In Google Chrome or Edge, click the Install icon in the address bar (or Menu > Save and share > Install app).",
        "info"
      );
    }
  };

  const handleDownloadWindowsInstaller = () => {
    const installContent = `@echo off
setlocal enabledelayedexpansion
title XyronGroup Proposal Platform - Automated Installer
color 0B

echo =====================================================================
echo           XyronGroup - Proposal & Quotation Manager
echo                     One-Click Installer Setup
echo =====================================================================
echo.

set "INSTALL_DIR=%~dp0"
if "%INSTALL_DIR:~-1%"=="\\" set "INSTALL_DIR=%INSTALL_DIR:~0,-1%"

echo [1/3] Checking environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not detected. Please install Node.js from https://nodejs.org
    pause
    exit /b
)
echo      - Node.js verified.

echo [2/3] Installing dependencies...
cd /d "%INSTALL_DIR%"
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install encountered an error.
    pause
    exit /b
)
echo      - Dependencies successfully installed!

echo [3/3] Creating Windows Desktop Shortcut...
set "SHORTCUT_PATH=%USERPROFILE%\\Desktop\\Xyron Proposals.lnk"
set "TARGET_BAT=%INSTALL_DIR%\\Start-App.bat"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$s = $ws.CreateShortcut('%SHORTCUT_PATH%'); " ^
  "$s.TargetPath = '%TARGET_BAT%'; " ^
  "$s.WorkingDirectory = '%INSTALL_DIR%'; " ^
  "$s.Description = 'XyronGroup Proposal & Quotation Manager'; " ^
  "$s.Save();"

echo.
echo =====================================================================
echo                   INSTALLATION SUCCESSFUL!
echo =====================================================================
echo "Xyron Proposals" icon has been created on your Windows Desktop!
echo Double-click it anytime to start working without typing any commands.
echo.
pause
`;
    const blob = new Blob([installContent], { type: "application/x-bat" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Install-Xyron-App.bat";
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      "Installer Downloaded",
      "Run Install-Xyron-App.bat inside your folder to automatically install and create a desktop icon!",
      "success"
    );
  };

  const handleDownloadUrlShortcut = () => {
    const currentUrl = window.location.origin;
    const urlContent = `[InternetShortcut]\r\nURL=${currentUrl}\r\nIconIndex=0\r\n`;
    const blob = new Blob([urlContent], { type: "application/internet-shortcut" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Xyron Proposals.url";
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      "Desktop Shortcut Downloaded",
      "Move Xyron Proposals.url to your Desktop to open with 1 click anytime!",
      "success"
    );
  };

  const handleDownloadWindowsBat = () => {
    const batContent = `@echo off
title XyronGroup - Proposal & Quotation Manager
color 0B

echo =====================================================================
echo           XyronGroup - Proposal & Quotation Manager
echo                     One-Click Launcher
echo =====================================================================
echo.

:: Switch to the folder where this batch file is located
cd /d "%~dp0"

:: Check if Node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b
)

:: Check if node_modules exists, install if missing
if not exist "node_modules\\" (
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

:: Automatically launch the browser to localhost:3000
echo [INFO] Launching your browser to http://localhost:3000 ...
start "" http://localhost:3000

:: Start the dev server
echo [INFO] Starting application server...
npm run dev

pause
`;
    const blob = new Blob([batContent], { type: "application/x-bat" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Start-App.bat";
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      "Start-App.bat Downloaded",
      "Save this file in your project directory. Double-click it anytime to start without typing in CMD!",
      "success"
    );
  };

  const handleDownloadMacCommand = () => {
    const cmdContent = `#!/bin/bash
cd "$(dirname "$0")"

echo "====================================================================="
echo "       XyronGroup - Proposal & Quotation Manager (macOS Launcher)    "
echo "====================================================================="

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed. Please install from https://nodejs.org"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[INFO] First-time setup: Installing dependencies..."
    npm install
fi

echo "[INFO] Opening http://localhost:3000 in your browser..."
sleep 2 && open "http://localhost:3000" &

echo "[INFO] Starting dev server..."
npm run dev
`;
    const blob = new Blob([cmdContent], { type: "application/x-sh" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Start-App.command";
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      "Start-App.command Downloaded",
      "Save inside your project folder. Double-click to run on Mac!",
      "success"
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-900/10 via-slate-900/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                One-Click App Launchers
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Never open CMD or type npm commands again — choose your preferred 1-click method.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* PACKAGE 1: Windows Automated Installer Package */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900/20 via-slate-900/10 to-emerald-950/20 border border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
                  Official Package
                </span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  Windows Automated Setup Installer (<code className="text-emerald-500">Install-Xyron-App.bat</code>)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              We have packaged an automated installer for you. When you run it once:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/20">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Step 1: Check</span>
                <p className="text-[11px] text-slate-500">Verifies your Node.js setup automatically.</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/20">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Step 2: Install</span>
                <p className="text-[11px] text-slate-500">Installs all required dependencies silently.</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/20">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Step 3: Desktop Icon</span>
                <p className="text-[11px] text-slate-500">Creates a permanent "Xyron Proposals" icon on your Desktop!</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleDownloadWindowsInstaller}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/30 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Windows Installer (Install-Xyron-App.bat)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadUrlShortcut}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Instant Desktop Shortcut (.url)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const activeUrl = typeof window !== "undefined" && window.location.origin && !window.location.origin.includes("localhost")
                    ? window.location.origin
                    : "https://ais-dev-u7h7tymh5o3vr4pb4rbnhp-135786567979.asia-east1.run.app";
                  navigator.clipboard.writeText(activeUrl);
                  showToast("Cloud Link Copied!", "Open in a new tab or bookmark on your browser.", "success");
                }}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md cursor-pointer transition-all border border-slate-700"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Workable Cloud Link</span>
              </button>
            </div>
          </div>

          {/* OPTION 1: Native Desktop App (Zero Terminal Required) */}
          <div className="p-5 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-sm">
                  Recommended • Option 1
                </span>
                <span className="text-xs font-extrabold text-indigo-950 dark:text-indigo-200">
                  Direct Desktop App (Zero CMD, Zero Node.js)
                </span>
              </div>
              {isAppInstalled && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Installed
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You do <strong>not</strong> need to run Node.js, terminal, or dev servers on your computer to do daily proposals. Because your application is hosted in the cloud, you can install it directly to your Windows Taskbar & Desktop with 1 click:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 text-[10px] flex items-center justify-center font-black">1</span>
                  Open in Chrome/Edge
                </div>
                <p className="text-[11px] text-slate-500">Open your shared live link in Google Chrome or Microsoft Edge.</p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 text-[10px] flex items-center justify-center font-black">2</span>
                  Click "Install App"
                </div>
                <p className="text-[11px] text-slate-500">Click the install icon in the URL bar (or Menu &gt; Save and share &gt; Install).</p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 text-[10px] flex items-center justify-center font-black">3</span>
                  Daily 1-Click
                </div>
                <p className="text-[11px] text-slate-500">A Xyron icon appears on your desktop. Click it anytime to create proposals!</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleTriggerPWAInstall}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 cursor-pointer transition-all"
              >
                <Monitor className="w-4 h-4" />
                <span>{installPromptEvent ? "Install Desktop App Now" : "Install App from Browser Bar"}</span>
              </button>
              <span className="text-[11px] text-slate-500">
                Works on Windows, Mac, iPad, and Android.
              </span>
            </div>
          </div>

          {/* OPTION 2: One-Click Desktop Launcher (.bat) for Localhost */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-700 text-white shadow-sm">
                  Option 2
                </span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  1-Click Windows Launcher File (<code className="text-indigo-600 dark:text-indigo-400">Start-App.bat</code>)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              If you prefer running locally on your computer at <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-300 font-mono">localhost:3000</code>, you <strong>never</strong> have to open CMD or type <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-300 font-mono">npm install</code> and <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-300 font-mono">npm run dev</code> every time.
            </p>

            <div className="p-3.5 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
                <span>Start-App.bat (Pre-built in project root)</span>
                <span className="text-emerald-400 font-sans font-bold">1 Double-Click = Ready</span>
              </div>
              <p className="text-slate-400 text-[11px]"># Automatically detects missing packages &amp; installs them once</p>
              <p className="text-slate-400 text-[11px]"># Automatically opens Chrome to http://localhost:3000</p>
              <p className="text-emerald-300">start "" http://localhost:3000 &amp;&amp; npm run dev</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleDownloadWindowsBat}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md cursor-pointer transition-all border border-slate-700"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download Start-App.bat (Windows)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadMacCommand}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download for Mac (.command)</span>
              </button>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200">
              💡 <strong>Pro-Tip:</strong> Right-click <code className="font-bold">Start-App.bat</code> in your project folder, choose <strong>Send to &gt; Desktop (create shortcut)</strong>. You can now start the entire application by double-clicking the shortcut directly from your desktop screen!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Enjoy frictionless proposal creation with zero terminal friction.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            Got it, Let's Work!
          </button>
        </div>
      </div>
    </div>
  );
};
