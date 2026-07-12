# Script PowerShell pour migrer tous les mots de passe des comptes validés
# Usage: .\migrate_all_passwords.ps1

$uri = "http://localhost:8080/api/laureats/migrate-passwords"

Write-Host "🔄 Migration des mots de passe pour tous les comptes validés..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -ContentType "application/json" -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "`n✅ $($result.message)" -ForegroundColor Green
        Write-Host "`n💡 Les mots de passe ont été générés. Format: PrenomNom123!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Réponse: $responseBody" -ForegroundColor Red
    }
    Write-Host "`n💡 Assurez-vous que le backend est démarré sur http://localhost:8080" -ForegroundColor Yellow
}
