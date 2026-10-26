@echo off
title Start Antigravity Bridge
echo ========================================================
echo   Checking / Starting Antigravity Bridge
echo ========================================================

powershell -NoProfile -Command ^
  "$portOpen = Test-NetConnection -ComputerName 127.0.0.1 -Port 8000 -InformationLevel Quiet;" ^
  "if ($portOpen) {" ^
  "  Write-Host '>>> Antigravity Bridge is ALREADY active on Port 8000!' -ForegroundColor Green;" ^
  "} else {" ^
  "  Write-Host '>>> Starting Antigravity Bridge in RAM background...' -ForegroundColor Yellow;" ^
  "  $scriptPath = 'C:\Users\lenovo\antigravity-bridge\antigravity_bridge.py';" ^
  "  if (Test-Path $scriptPath) {" ^
  "    Start-Process -FilePath 'pythonw.exe' -ArgumentList ('\"' + $scriptPath + '\"') -WindowStyle Hidden;" ^
  "    Start-Sleep -Seconds 2;" ^
  "    Write-Host '>>> Antigravity Bridge launched successfully!' -ForegroundColor Green;" ^
  "  } else {" ^
  "    Write-Host ('Error: ' + $scriptPath + ' not found!') -ForegroundColor Red;" ^
  "  }" ^
  "}"

pause
