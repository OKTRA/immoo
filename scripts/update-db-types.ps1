# Script PowerShell pour mettre à jour les types de base de données
# À exécuter après avoir appliqué les migrations de subscription

Write-Host "Mise à jour des types de base de données..." -ForegroundColor Green

# Vérifier si supabase CLI est installé
if (-not (Get-Command "supabase" -ErrorAction SilentlyContinue)) {
    Write-Error "Supabase CLI n'est pas installé. Installez-le avec: npm install -g supabase"
    exit 1
}

# Naviguer vers le répertoire du projet
Set-Location $PSScriptRoot\..\

Write-Host "Génération des types TypeScript..." -ForegroundColor Yellow

# Générer les types TypeScript à partir du schéma Supabase
try {
    npx supabase gen types typescript --local > src/integrations/supabase/types.ts
    Write-Host "Types mis à jour avec succès!" -ForegroundColor Green
} catch {
    Write-Warning "Impossible de générer les types automatiquement. Vous devrez peut-être:"
    Write-Host "1. Lier votre projet Supabase avec: supabase link --project-ref YOUR_PROJECT_REF" -ForegroundColor Cyan
    Write-Host "2. Ou appliquer les migrations manuellement via l'interface Supabase" -ForegroundColor Cyan
    Write-Host "3. Puis générer les types avec: supabase gen types typescript --project-id YOUR_PROJECT_REF > src/integrations/supabase/types.ts" -ForegroundColor Cyan
}

Write-Host "Script terminé." -ForegroundColor Green
