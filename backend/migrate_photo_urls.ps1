# Script PowerShell pour mettre à jour les photo_url dans PostgreSQL
# Ce script génère les URLs au format photos/Prenom_Nom.png pour les lauréats existants

Write-Host "🔄 Migration des photo_url dans PostgreSQL..." -ForegroundColor Cyan
Write-Host ""

# Configuration PostgreSQL
$DB_HOST = "localhost"
$DB_PORT = "5433"
$DB_NAME = "laureat_db"
$DB_USER = "postgres"
$DB_PASSWORD = "123456789"

# Chemin vers psql (ajustez si nécessaire)
$PSQL_PATH = "psql"

# Script SQL simplifié (sans REGEXP_REPLACE complexe)
$SQL_SCRIPT = @"
-- Mettre à jour les photo_url NULL avec le format photos/Prenom_Nom.png
-- Note: Cette version simplifiée ne gère pas les accents, mais fonctionne pour la plupart des cas

UPDATE laureat
SET photo_url = 'photos/' || 
    INITCAP(LOWER(TRIM(prenom))) || '_' ||
    INITCAP(LOWER(TRIM(nom))) || '.png'
WHERE photo_url IS NULL 
   OR photo_url = ''
   OR photo_url NOT LIKE 'photos/%';

-- Afficher les résultats
SELECT id, prenom, nom, photo_url 
FROM laureat 
WHERE photo_url IS NOT NULL 
ORDER BY id
LIMIT 10;
"@

# Écrire le script SQL dans un fichier temporaire
$TEMP_SQL = "$env:TEMP\migrate_photo_urls_temp.sql"
$SQL_SCRIPT | Out-File -FilePath $TEMP_SQL -Encoding UTF8

Write-Host "📝 Script SQL créé: $TEMP_SQL" -ForegroundColor Yellow
Write-Host ""

# Exécuter le script
Write-Host "🚀 Exécution du script SQL..." -ForegroundColor Green
Write-Host ""

try {
    $env:PGPASSWORD = $DB_PASSWORD
    & $PSQL_PATH -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $TEMP_SQL
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration terminée avec succès!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Vérification:" -ForegroundColor Cyan
        Write-Host "   SELECT COUNT(*) FROM laureat WHERE photo_url IS NOT NULL;" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🔄 Rechargez la page admin web pour voir les photos!" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "❌ Erreur lors de l'exécution du script SQL" -ForegroundColor Red
        Write-Host "   Code de sortie: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Alternative: Exécutez le script manuellement dans pgAdmin:" -ForegroundColor Yellow
    Write-Host "   1. Ouvrez pgAdmin" -ForegroundColor Gray
    Write-Host "   2. Connectez-vous à la base de données 'laureat_db'" -ForegroundColor Gray
    Write-Host "   3. Ouvrez le fichier: backend/migration_update_photo_urls.sql" -ForegroundColor Gray
    Write-Host "   4. Exécutez le script" -ForegroundColor Gray
} finally {
    # Nettoyer
    Remove-Item -Path $TEMP_SQL -ErrorAction SilentlyContinue
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
