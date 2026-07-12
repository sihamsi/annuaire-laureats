# Script PowerShell pour générer un mot de passe pour un compte spécifique
# Usage: .\generate_password.ps1 <email>

param(
    [string]$email = "laureat@example.com"
)

$uri = "http://localhost:8080/api/laureats/generate-password"
$body = @{
    email = $email
} | ConvertTo-Json

Write-Host "🔄 Génération du mot de passe pour $email..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "`n✅ Mot de passe généré avec succès!" -ForegroundColor Green
        Write-Host "📧 Email: $($result.email)" -ForegroundColor Cyan
        Write-Host "🔑 Mot de passe: $($result.password)" -ForegroundColor Cyan
        Write-Host "`n💡 Vous pouvez maintenant vous connecter avec ces identifiants." -ForegroundColor Yellow
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
