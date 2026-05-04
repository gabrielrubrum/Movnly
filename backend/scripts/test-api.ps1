# ================================================
# NexRice — Full API Integration Test Script
# Runs against: http://localhost:3002
# Usage: .\test-api.ps1
# ================================================

$BASE = "http://localhost:3002"
$PASS = 0
$FAIL = 0
$ERRORS = [System.Collections.Generic.List[string]]::new()

function Check {
    param($Name, [bool]$Result, $Hint = "")
    if ($Result) {
        Write-Host "  [PASS] $Name" -ForegroundColor Green
        $script:PASS++
    }
    else {
        Write-Host "  [FAIL] $Name $Hint" -ForegroundColor Red
        $script:FAIL++
        $script:ERRORS.Add($Name)
    }
}

function c_code {
    param($Method, $Path, $Body = $null, $Token = $null)
    $curlArgs = @("-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", $Method, "$BASE$Path", "-H", "Content-Type: application/json")
    if ($Token) { $curlArgs += @("-H", "Authorization: Bearer $Token") }
    if ($Body) { $curlArgs += @("-d", ($Body | ConvertTo-Json -Compress)) }
    $code = curl.exe @curlArgs
    return [int]$code
}

function c_json {
    param($Method, $Path, $Body = $null, $Token = $null)
    $curlArgs = @("-s", "-X", $Method, "$BASE$Path", "-H", "Content-Type: application/json")
    if ($Token) { $curlArgs += @("-H", "Authorization: Bearer $Token") }
    if ($Body) { $curlArgs += @("-d", ($Body | ConvertTo-Json -Compress)) }
    $raw = curl.exe @curlArgs
    try { return $raw | ConvertFrom-Json } catch { return $null }
}

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║   NexRice — API Integration Test Suite   ║" -ForegroundColor Cyan
Write-Host "  ╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── [0] Health check ─────────────────────────────────────────
$hc = c_code GET "/"
if ($hc -eq 0) {
    Write-Host "  ❌ Backend not running at $BASE. Run: cd backend && npm run start:dev" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Backend is live (HTTP $hc)" -ForegroundColor Green
Write-Host ""

# ── Unique test credentials ───────────────────────────────────
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$testEmail = "nexrice_test_$ts@test.pt"
$testPass = "Test@12345!"

# ══════════════════════════════════════════════════════════════
Write-Host "📋 AUTH TESTS" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────"

# [1] Register new user → 201
$code = c_code POST "/auth/register" @{ email = $testEmail; name = "NexRice Tester"; password = $testPass }
Check "POST /auth/register — new user → 201" ($code -eq 201) "| Got: $code"

# [2] Register duplicate → 409
$code = c_code POST "/auth/register" @{ email = $testEmail; name = "Dup"; password = $testPass }
Check "POST /auth/register — duplicate email → 409" ($code -eq 409) "| Got: $code"

# [3] Register invalid email → 400
$code = c_code POST "/auth/register" @{ email = "not-an-email"; name = "X"; password = "12345678" }
Check "POST /auth/register — invalid email → 400" ($code -eq 400) "| Got: $code"

# [4] Login valid → 201 (NestJS @Post default) — single call, extract both status and token
$loginRaw = curl.exe -s -w "NEXRICE_STATUS:%{http_code}" -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d ($(@{ email = $testEmail; password = $testPass }) | ConvertTo-Json -Compress)
$loginBody = ($loginRaw -replace 'NEXRICE_STATUS:\d+', '').Trim()
$loginCode = [int]($loginRaw -replace '.*NEXRICE_STATUS:(\d+)', '$1')
$loginJson = $loginBody | ConvertFrom-Json -ErrorAction SilentlyContinue
Check "POST /auth/login — valid credentials → 201" ($loginCode -eq 201) "| Got: $loginCode"
$TOKEN = $loginJson.access_token
if (-not $TOKEN) { Write-Host "  ⚠️  Token missing — auth-protected tests will fail" -ForegroundColor Yellow }

# [5] Login wrong password → 401
$code = c_code POST "/auth/login" @{ email = $testEmail; password = "WrongPass!" }
Check "POST /auth/login — wrong password → 401" ($code -eq 401) "| Got: $code"

# [6] Login nonexistent user → 401
$code = c_code POST "/auth/login" @{ email = "nobody_$ts@x.pt"; password = "any" }
Check "POST /auth/login — nonexistent user → 401" ($code -eq 401) "| Got: $code"

# ══════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "📋 BOOKINGS TESTS" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────"

$bookBody = @{
    from = "Aeroporto de Lisboa"; to = "Hotel Bairro Alto, Lisboa"
    pickupTime = "2025-08-15T10:00:00"; category = "comfort"
}

# [7] Create booking authenticated → 201
# Single call: get both body and status code
$bookRaw = curl.exe -s -w "NEXRICE_STATUS:%{http_code}" -X POST "$BASE/bookings" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d ($bookBody | ConvertTo-Json -Compress)
$bookJsonStr = ($bookRaw -replace 'NEXRICE_STATUS:\d+', '').Trim()
$bookCode = [int]($bookRaw -replace '.*NEXRICE_STATUS:(\d+)', '$1')
$bookResp = $bookJsonStr | ConvertFrom-Json -ErrorAction SilentlyContinue
Check "POST /bookings — authenticated → 201" ($bookCode -eq 201) "| Got: $bookCode"
$BOOKING_ID = $bookResp.id

# [8] Server-side price validation (comfort weekday daytime = €55)
$price = $bookResp.price
Check "Server-side price (comfort) ≈ €55" ([Math]::Abs($price - 55) -lt 1) "| Got: €$price"

# [9] Create booking unauthenticated → 401
$code = c_code POST "/bookings" $bookBody
Check "POST /bookings — no auth → 401" ($code -eq 401) "| Got: $code"

# [10] Get my bookings → 200
$code = c_code GET "/bookings/my" -Token $TOKEN
Check "GET /bookings/my — authenticated → 200" ($code -eq 200) "| Got: $code"

# [11] Get all bookings → 200
$code = c_code GET "/bookings"
Check "GET /bookings — all → 200" ($code -eq 200) "| Got: $code"

# [12] Get drivers → 200
$code = c_code GET "/bookings/drivers"
Check "GET /bookings/drivers → 200" ($code -eq 200) "| Got: $code"

# [13] Get booking by ID → 200
if ($BOOKING_ID) {
    $code = c_code GET "/bookings/$BOOKING_ID"
    Check "GET /bookings/:id → 200" ($code -eq 200) "| Got: $code"
}
else { Write-Host "  [SKIP] GET /bookings/:id" -ForegroundColor DarkYellow }

# [14] Update booking status → 200
if ($BOOKING_ID) {
    $code = c_code PATCH "/bookings/$BOOKING_ID/status" @{ status = "CONFIRMED" }
    Check "PATCH /bookings/:id/status → 200" ($code -eq 200) "| Got: $code"
}

# [15] Get nonexistent booking → 404
$code = c_code GET "/bookings/nonexistent-uuid-1234"
Check "GET /bookings/:id — not found → 404" ($code -eq 404) "| Got: $code"

# [16] Assign driver (may 404 if no drivers) → acceptable 200 or 404
if ($BOOKING_ID) {
    $drivers = c_json GET "/bookings/drivers"
    if ($drivers -and $drivers.Count -gt 0) {
        $driverId = $drivers[0].id
        $code = c_code POST "/bookings/$BOOKING_ID/assign" @{ driverId = $driverId }
        Check "POST /bookings/:id/assign — driver assigned → 200" ($code -eq 200) "| Got: $code"
    }
    else {
        Write-Host "  [SKIP] POST /bookings/:id/assign — no drivers in DB" -ForegroundColor DarkYellow
    }
}

# ══════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "📋 PAYMENTS TESTS" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────"

# [17] Create payment intent (mock mode)
$payRaw = curl.exe -s -X POST "$BASE/payments/create-intent" -H "Content-Type: application/json" -d (@{
        bookingId = "temp-id-for-demo"; email = $testEmail; name = "NexRice Tester"
        from = "Aeroporto Lisboa"; to = "Hotel Chiado"; date = "2025-08-15"; time = "10:00"
        amount = 55.00; category = "comfort"
    } | ConvertTo-Json -Compress)
$payResp = $payRaw | ConvertFrom-Json -ErrorAction SilentlyContinue
Check "POST /payments/create-intent → returns clientSecret" ($null -ne $payResp.clientSecret) "| Got null"
# In mock mode the key starts with pi_mock_, in real mode it starts with pi_
Check "POST /payments/create-intent → clientSecret present (mock or real)" ($payResp.clientSecret -match '^pi_') "| Got: $($payResp.clientSecret)"

# ══════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "════════════════════════════════════════════════"
Write-Host "  ✅ PASSED: $PASS" -ForegroundColor Green
Write-Host "  ❌ FAILED: $FAIL" -ForegroundColor Red
Write-Host "════════════════════════════════════════════════"

if ($ERRORS.Count -gt 0) {
    Write-Host ""
    Write-Host "  Failed tests:" -ForegroundColor Yellow
    $ERRORS | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}
Write-Host ""

if ($FAIL -gt 0) { exit 1 }
