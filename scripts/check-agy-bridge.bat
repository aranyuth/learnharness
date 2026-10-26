@echo off
title Check Antigravity Bridge Status
echo ========================================================
echo   Checking Antigravity Bridge (Port 8000)
echo ========================================================
powershell -NoProfile -Command "try { $res = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/v1/models' -Headers @{ Authorization = 'Bearer agy-bridge' } -TimeoutSec 3; Write-Host '>>> Antigravity Bridge is RUNNING on RAM (Port 8000)!' -ForegroundColor Green; Write-Host ('Available Models Count: ' + $res.data.Count); Write-Host 'Sample Models:'; $res.data | Select-Object -First 8 | ForEach-Object { Write-Host ('  - ' + $_.id) } } catch { Write-Host '>>> Antigravity Bridge is NOT running on Port 8000!' -ForegroundColor Red }"
echo ========================================================
pause
