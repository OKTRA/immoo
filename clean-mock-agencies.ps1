# Script PowerShell pour nettoyer les agences mock
# Usage: .\clean-mock-agencies.ps1

Write-Host "🧹 Nettoyage des agences mock en cours..." -ForegroundColor Yellow

# Vérifier si le fichier SQL existe
if (-not (Test-Path "remove-mock-agencies.sql")) {
    Write-Host "❌ Fichier remove-mock-agencies.sql non trouvé!" -ForegroundColor Red
    exit 1
}

try {
    # Exécuter le script SQL avec Supabase CLI
    Write-Host "🔄 Exécution du script SQL..." -ForegroundColor Blue
    
    # Essayer avec supabase CLI local
    $result = npx supabase db reset --local 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Script SQL exécuté avec succès via supabase CLI" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Supabase CLI non disponible, essai avec psql..." -ForegroundColor Yellow
        
        # Essayer avec psql direct si disponible
        psql -f "remove-mock-agencies.sql" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Script SQL exécuté avec succès via psql" -ForegroundColor Green
        } else {
            Write-Host "❌ Impossible d'exécuter le script SQL" -ForegroundColor Red
            Write-Host "Veuillez exécuter manuellement le contenu de remove-mock-agencies.sql" -ForegroundColor Yellow
        }
    }
    
    Write-Host "🎉 Nettoyage des agences mock terminé!" -ForegroundColor Green
    Write-Host "ℹ️ Rechargez votre page web pour voir les changements" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erreur lors de l'exécution: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 