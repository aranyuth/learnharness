@echo off
title LearnHarness 2.0 - Socratic Studio
echo ========================================================
echo   Starting LearnHarness 2.0 (Brilliant.org Socratic Mode)
echo ========================================================

:: Check node
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Error: node.js is not found in PATH!
  pause
  exit /b 1
)

:: Curate static assets into standalone payload
echo Curating static assets...
node "%~dp0scripts\build-server.mjs"

:: Set port
set PORT=3000

echo Starting Next.js Production Server on http://localhost:3000 ...
start "" http://localhost:3000/socratic
node "%~dp0.next\standalone\server.js"
pause
