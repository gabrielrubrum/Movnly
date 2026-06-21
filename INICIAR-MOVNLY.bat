@echo off
title MOVNLY - Iniciar Tudo
cd /d "%~dp0"

echo === MOVNLY ===
docker start movnly-db 2>nul
if errorlevel 1 docker run -d --name movnly-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=movnly -p 5433:5432 postgres:15

timeout /t 3 /nobreak >nul

start "MOVNLY BACKEND" cmd /k "cd /d %~dp0backend && npm run start:dev"
timeout /t 5 /nobreak >nul
start "MOVNLY FRONTEND" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 2 /nobreak >nul
start "MOVNLY MOBILE" cmd /k "cd /d %~dp0mobile && npm start"

echo.
echo PRONTO! Abre no browser:
echo   http://localhost:3000
echo   http://localhost:3000/parceiros/login
echo.
echo Login: parceiro@movnly.com / Partner2026_Elite!
pause
