@echo off
title LearnHarness - Web Server
cd /d "%~dp0"
echo ===================================================
echo   Starting LearnHarness (Web Mode: http://localhost:3000)
echo ===================================================
start http://localhost:3000
npm run dev
pause
