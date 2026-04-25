# ================================================
# NexRide - Script de Inicialização com Ngrok + Nginx
# Frontend: Next.js  (ngrok → porta 3000)
# Backend:  NestJS   (nginx → porta 3002)
# ================================================

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║   NexRide Dev — Ngrok + Nginx Mode   ║" -ForegroundColor Cyan
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot

# --- 1. Verificações de dependências ---
Write-Host "🔍 Verificando dependências..." -ForegroundColor Yellow

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker não encontrado. Instale o Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command ngrok -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ngrok não encontrado. Instale em: https://ngrok.com/download" -ForegroundColor Red
    Write-Host "   Ou via Chocolatey: choco install ngrok" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker e ngrok encontrados." -ForegroundColor Green
Write-Host ""

# --- 2. Nginx (Docker) ---
Write-Host "🐳 Iniciando Nginx via Docker..." -ForegroundColor Yellow
Set-Location $rootDir
docker compose -f docker-compose.nginx.yml down
docker compose -f docker-compose.nginx.yml up -d --remove-orphans --force-recreate
$useNginx = $true
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Falha ao iniciar Nginx (Docker fechado/travado)." -ForegroundColor Yellow
    Write-Host "⚠️  Prosseguindo apenas com Ngrok redirecionando para a porta 3000..." -ForegroundColor Yellow
    $useNginx = $false
}
else {
    Write-Host "✅ Nginx rodando em http://localhost/api/" -ForegroundColor Green
}
Write-Host ""

# --- 3. Backend NestJS ---
Write-Host "⚙️  Iniciando Backend NestJS (porta 3002)..." -ForegroundColor Yellow
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\backend'; Write-Host '[BACKEND] NestJS iniciando...' -ForegroundColor Cyan; npm run start:dev" -PassThru
Write-Host "✅ Backend iniciando (PID $($backend.Id))..." -ForegroundColor Green
Write-Host ""

# --- 4. Frontend Next.js ---
Write-Host "🌐 Iniciando Frontend Next.js (porta 3000)..." -ForegroundColor Yellow
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir'; Write-Host '[FRONTEND] Next.js iniciando...' -ForegroundColor Cyan; npm run dev:exposed" -PassThru
Write-Host "✅ Frontend iniciando (PID $($frontend.Id))..." -ForegroundColor Green
Write-Host ""

# --- 5. Aguardar Next.js estar pronto ---
Write-Host "⏳ Aguardando Next.js na porta 3000..." -ForegroundColor Yellow
$maxWait = 60
$waited = 0
do {
    Start-Sleep -Seconds 2
    $waited += 2
    $conn = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue
} while (-not $conn.TcpTestSucceeded -and $waited -lt $maxWait)

if (-not $conn.TcpTestSucceeded) {
    Write-Host "⚠️  Next.js demorou demais, tente acessar http://localhost:3000 manualmente." -ForegroundColor Yellow
}
else {
    Write-Host "✅ Next.js está pronto!" -ForegroundColor Green
}
Write-Host ""

Write-Host "🚇 Iniciando Ngrok..." -ForegroundColor Yellow
if ($useNginx) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '[NGROK] Iniciando túnel na porta 80 (Nginx)...' -ForegroundColor Magenta; ngrok http 127.0.0.1:80 --host-header=rewrite"
}
else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '[NGROK] Iniciando túnel na porta 3000 (Next.js direto)...' -ForegroundColor Magenta; ngrok http 127.0.0.1:3000 --host-header=rewrite"
}

Write-Host ""
Start-Sleep -Seconds 3

# Tenta pegar a URL pública do Ngrok via API local
try {
    $ngrokApi = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -TimeoutSec 5
    $publicUrl = ($ngrokApi.tunnels | Where-Object { $_.proto -eq "https" }).public_url
    if ($publicUrl) {
        Write-Host "  ╔══════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "  ║  ✅ NexRide está ONLINE!                         ║" -ForegroundColor Green
        Write-Host "  ║                                                  ║" -ForegroundColor Green
        Write-Host "  ║  🌍 URL Pública: $publicUrl" -ForegroundColor Green
        Write-Host "  ║  🔧 Backend API: http://localhost/api/           ║" -ForegroundColor Green
        Write-Host "  ║  📊 Ngrok UI:    http://localhost:4040           ║" -ForegroundColor Green
        Write-Host "  ╚══════════════════════════════════════════════════╝" -ForegroundColor Green
    }
}
catch {
    Write-Host "ℹ️  Verifique a URL pública no terminal do Ngrok ou em http://localhost:4040" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Para parar tudo, feche as janelas abertas e execute:" -ForegroundColor White
Write-Host "  docker compose -f docker-compose.nginx.yml down" -ForegroundColor Gray
Write-Host ""
