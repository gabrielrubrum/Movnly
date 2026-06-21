$root = Split-Path -Parent $PSScriptRoot
Write-Host "MOVNLY - A arrancar tudo..." -ForegroundColor Cyan

# PostgreSQL
if (-not (docker ps -q -f name=movnly-db 2>$null)) {
    docker rm -f movnly-db 2>$null
    docker run -d --name movnly-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=movnly -p 5433:5432 postgres:15
    Start-Sleep 4
} else {
    docker start movnly-db 2>$null
}
Write-Host "[OK] PostgreSQL :5433" -ForegroundColor Green

# Backend
Start-Process powershell -ArgumentList "-NoExit","-Command","Write-Host 'MOVNLY BACKEND' -ForegroundColor Yellow; cd '$root\backend'; npm run start:dev"
Write-Host "[..] Backend -> http://localhost:3002" -ForegroundColor Yellow
Start-Sleep 6

# Frontend
Start-Process powershell -ArgumentList "-NoExit","-Command","Write-Host 'MOVNLY FRONTEND' -ForegroundColor Yellow; cd '$root\frontend'; npm run dev"
Write-Host "[..] Frontend -> http://localhost:3000" -ForegroundColor Yellow
Start-Sleep 3

# Mobile
Start-Process powershell -ArgumentList "-NoExit","-Command","Write-Host 'MOVNLY MOBILE' -ForegroundColor Yellow; cd '$root\mobile'; npm start"
Write-Host "[..] Mobile -> Expo QR code" -ForegroundColor Yellow

Write-Host ""
Write-Host "PRONTO!" -ForegroundColor Green
Write-Host "  Site:     http://localhost:3000" -ForegroundColor White
Write-Host "  Parceiros: http://localhost:3000/parceiros/login" -ForegroundColor White
Write-Host "  API:      http://localhost:3002" -ForegroundColor White
Write-Host "  Login:    parceiro@movnly.com / Partner2026_Elite!" -ForegroundColor Gray
Start-Sleep 3
