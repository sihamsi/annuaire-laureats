# Autorise le port 8080 (backend) dans le pare-feu Windows pour les connexions mobile.
# À exécuter en PowerShell **en tant qu'administrateur**.

$ruleName = "Backend Laureat 8080"

# Vérifier droits Admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERREUR: Exécutez ce script en tant qu'administrateur (clic droit PowerShell -> Exécuter en tant qu'administrateur)." -ForegroundColor Red
    exit 1
}

$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "La règle '$ruleName' existe déjà." -ForegroundColor Yellow
    exit 0
}

New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -Profile Private,Public
Write-Host "Règle pare-feu créée : $ruleName (TCP 8080, Profils Private + Public)." -ForegroundColor Green
Write-Host "Redémarrez l'app mobile puis testez 'Tester la connexion' sur le téléphone." -ForegroundColor Cyan
