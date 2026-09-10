#!/bin/bash
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
