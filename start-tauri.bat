@echo off
title LearnHarness 2.0 - Native Desktop (Tauri v2)
echo ========================================================
echo   Launching LearnHarness 2.0 Native Tauri Desktop App
echo ========================================================

:: Check cargo
where cargo >nul 2>nul
if %errorlevel% neq 0 (
  echo Error: cargo is not found in PATH!
  pause
  exit /b 1
)

echo Building and starting Tauri Desktop Shell (Native Webview2)...
cargo run -p learnharness-desktop
pause
