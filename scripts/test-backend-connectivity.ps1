# Diagnostic connexion backend (mobile)
# 1) Test localhost (backend sur ce PC)
# 2) Rappel firewall + test depuis telephone

$base = "http://localhost:8080"
$api = "$base/api/organismes"

Write-Host "`n=== Diagnostic Backend (port 8080) ===" -ForegroundColor Cyan
Write-Host ""

# Test localhost
Write-Host "1. Test localhost (ce PC)..." -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri $api -UseBasicParsing -TimeoutSec 5
    Write-Host "   OK - Backend repond sur $base" -ForegroundColor Green
} catch {
    Write-Host "   ECHEC - Backend ne repond pas sur localhost:8080" -ForegroundColor Red
    Write-Host "   Verifiez que le serveur tourne (mvn spring-boot:run)." -ForegroundColor Red
    exit 1
}

# Rappel IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch "Loopback|vEthernet" -and $_.IPAddress -match "^\d+\.\d+\.\d+\.\d+$" } | Select-Object -First 1).IPAddress
if (-not $ip) { $ip = "VOTRE_IP" }

Write-Host ""
Write-Host "2. Depuis le telephone / emulateur" -ForegroundColor Yellow
Write-Host "   - Telephone physique (WiFi) : config/network.ts -> NETWORK_IP = $ip" -ForegroundColor White
Write-Host "   - Emulateur Android         : utilise 10.0.2.2 (auto si detecte)" -ForegroundColor White
Write-Host "   - Test navigateur telephone : ouvrez http://${ip}:8080/api/organismes" -ForegroundColor White
Write-Host ""

# Firewall
$rule = Get-NetFirewallRule -DisplayName "Backend Laureat 8080" -ErrorAction SilentlyContinue
if (-not $rule) {
    Write-Host "3. Pare-feu : regle 'Backend Laureat 8080' absente." -ForegroundColor Red
    Write-Host "   Executez en Admin : .\scripts\allow-backend-firewall.ps1" -ForegroundColor Yellow
} else {
    Write-Host "3. Pare-feu : regle OK." -ForegroundColor Green
}

Write-Host ""
