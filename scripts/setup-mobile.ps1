# MOVNLY — Setup do app mobile
# Requer espaço em disco livre (~500MB)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$mobile = Join-Path $root "mobile"

Write-Host "=== MOVNLY Mobile Setup ===" -ForegroundColor Cyan

# 1. Backend migrations
Write-Host "`n[1/4] PostgreSQL (Docker porta 5433)..." -ForegroundColor Yellow
docker rm -f movnly-db 2>$null
docker run -d --name movnly-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=movnly -p 5433:5432 postgres:15
Start-Sleep -Seconds 4

Write-Host "`n[2/4] Prisma migrations..." -ForegroundColor Yellow
Push-Location (Join-Path $root "backend")
$env:DATABASE_URL = "postgresql://postgres:password@localhost:5433/movnly?schema=public"
npx prisma migrate deploy
npx prisma generate
Pop-Location

# 2. Mobile deps
Write-Host "`n[3/4] npm install (mobile)..." -ForegroundColor Yellow
Push-Location $mobile
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Criado mobile/.env — edite EXPO_PUBLIC_API_URL com o IP da sua máquina" -ForegroundColor Green
}
npm install
Pop-Location

# 3. Seed partner account
Write-Host "`n[4/4] Seed database..." -ForegroundColor Yellow
Push-Location (Join-Path $root "backend")
$env:DATABASE_URL = "postgresql://postgres:password@localhost:5433/movnly?schema=public"
npx ts-node prisma/seed.ts
Pop-Location

Write-Host "`nPronto!" -ForegroundColor Green
Write-Host "  cd mobile && npm start" -ForegroundColor White
Write-Host "  Contas demo:" -ForegroundColor White
Write-Host "    Parceiro: parceiro@movnly.com / Partner2026_Elite!" -ForegroundColor Gray
Write-Host "    Motorista: chauffeur.prime@movnly.com / Driver2026_Elite!" -ForegroundColor Gray
