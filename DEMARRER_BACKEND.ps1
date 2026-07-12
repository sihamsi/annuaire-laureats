Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEMARRAGE DU BACKEND SPRING BOOT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demarrage du backend sur le port 8080..." -ForegroundColor Yellow
Write-Host ""

Set-Location backend
mvn spring-boot:run

Write-Host ""
Write-Host "Appuyez sur une touche pour quitter..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
