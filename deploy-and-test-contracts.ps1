#!/usr/bin/env pwsh

# Script pour déployer et tester la génération de contrats avec logs

Write-Host "🚀 Déploiement des fonctions de génération de contrats avec logs..." -ForegroundColor Yellow

# Étape 1: Redéployer les fonctions avec les logs
Write-Host "📦 Redéploiement des fonctions..." -ForegroundColor Cyan
try {
    Write-Host "Deploying contracts-generator..." -ForegroundColor White
    npx supabase functions deploy contracts-generator --no-verify-jwt
    
    Write-Host "Deploying contracts-update..." -ForegroundColor White
    npx supabase functions deploy contracts-update --no-verify-jwt
    
    Write-Host "✅ Fonctions redéployées avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du redéploiement: $_" -ForegroundColor Red
    exit 1
}

# Étape 2: Vérifier les variables d'environnement
Write-Host "🔍 Vérification des variables d'environnement..." -ForegroundColor Cyan
Write-Host "Assurez-vous que ces variables sont configurées dans votre dashboard Supabase:" -ForegroundColor White
Write-Host "• GROQ_API_KEY" -ForegroundColor Yellow
Write-Host "• SUPABASE_URL" -ForegroundColor Yellow
Write-Host "• SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow

Write-Host ""
Write-Host "📋 Instructions de test:" -ForegroundColor Green
Write-Host "1. Ouvrez la console de votre navigateur (F12)" -ForegroundColor White
Write-Host "2. Allez sur /agencies/[votre-agency-id]/contracts/create" -ForegroundColor White
Write-Host "3. Créez un nouveau contrat" -ForegroundColor White
Write-Host "4. Vérifiez les logs dans la console du navigateur" -ForegroundColor White
Write-Host "5. Vérifiez les logs dans le dashboard Supabase → Edge Functions → Logs" -ForegroundColor White

Write-Host ""
Write-Host "🔧 Logs ajoutés:" -ForegroundColor Green
Write-Host "• Logs détaillés dans l'Edge Function" -ForegroundColor White
Write-Host "• Logs dans le service frontend" -ForegroundColor White
Write-Host "• Amélioration de l'affichage du contrat généré" -ForegroundColor White
Write-Host "• Messages d'erreur plus détaillés" -ForegroundColor White

Write-Host ""
Write-Host "✨ Prêt pour les tests!" -ForegroundColor Green 