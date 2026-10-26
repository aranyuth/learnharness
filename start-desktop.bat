@echo off
title LearnHarness - Desktop App
cd /d "%~dp0"
echo ===================================================
echo   Starting LearnHarness Desktop Application
echo ===================================================
npm run desktop:dev
pause
