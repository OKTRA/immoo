#!/usr/bin/env pwsh

# Script pour corriger le probleme de generation de contrats
# Ce script applique les corrections de base de donnees et redéploie les fonctions

Write-Host "🔧 Correction du systeme de generation de contrats..." -ForegroundColor Yellow

# Etape 1: Appliquer la migration pour ajouter agency_id a la table contracts
Write-Host "📊 Application de la migration pour la table contracts..." -ForegroundColor Cyan
try {
    npx supabase db push --include-all --local=false
    Write-Host "✅ Migration appliquee avec succes" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'application de la migration: $_" -ForegroundColor Red
    exit 1
}

# Etape 2: Redéployer les fonctions Supabase corrigees
Write-Host "⚡ Redeploiement des fonctions Supabase..." -ForegroundColor Cyan
try {
    npx supabase functions deploy contracts-generator --no-verify-jwt
    npx supabase functions deploy contracts-update --no-verify-jwt
    Write-Host "✅ Fonctions redeployees avec succes" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du redeploiement des fonctions: $_" -ForegroundColor Red
    exit 1
}

# Etape 3: Verifier que les variables d'environnement sont configurees
Write-Host "🔍 Verification des variables d'environnement..." -ForegroundColor Cyan
$requiredSecrets = @("GROQ_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY")

foreach ($secret in $requiredSecrets) {
    try {
        npx supabase secrets list --filter=$secret
    } catch {
        Write-Host "⚠️  Variable d'environnement manquante: $secret" -ForegroundColor Yellow
        Write-Host "Pour definir cette variable, utilisez:" -ForegroundColor White
        Write-Host "npx supabase secrets set $secret=votre_valeur" -ForegroundColor White
    }
}

Write-Host "✨ Correction terminée!" -ForegroundColor Green
Write-Host "Les principales corrections apportees:" -ForegroundColor White
Write-Host "• Correction de l'authentification Supabase dans les fonctions" -ForegroundColor White
Write-Host "• Ajout de la colonne agency_id a la table contracts" -ForegroundColor White
Write-Host "• Mise en place des politiques RLS appropriees" -ForegroundColor White
Write-Host "• Amelioration de la gestion CORS" -ForegroundColor White

Write-Host ""
Write-Host "🧪 Pour tester la generation de contrats, visitez:" -ForegroundColor Yellow
Write-Host "/agencies/[ID_AGENCE]/contracts/create" -ForegroundColor White 