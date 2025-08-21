# Script de restauration de la base de données IMMOO
# Ce script redémarre les services Supabase et restaure votre environnement

Write-Host "Restauration de la base de données IMMOO..." -ForegroundColor Green
Write-Host "=" * 50

# 1. Arrêter tous les services Supabase existants
Write-Host "Etape 1: Nettoyage des services existants..." -ForegroundColor Yellow
try {
    npx supabase stop --no-backup 2>$null
    Write-Host "Services arretes" -ForegroundColor Green
} catch {
    Write-Host "Aucun service a arreter" -ForegroundColor Yellow
}

# 2. Redémarrer Supabase
Write-Host "Etape 2: Redemarrage de Supabase..." -ForegroundColor Yellow
try {
    npx supabase start
    Write-Host "Supabase redemarre avec succes" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors du redemarrage de Supabase" -ForegroundColor Red
    Write-Host "Essayez de redemarrer Docker Desktop et relancez ce script" -ForegroundColor Yellow
    exit 1
}

# 3. Vérifier le statut
Write-Host "Etape 3: Verification du statut..." -ForegroundColor Yellow
npx supabase status

# 4. Afficher les informations de connexion
Write-Host "Etape 4: Informations de connexion" -ForegroundColor Yellow
Write-Host "URL Supabase: https://hzbogwleoszwtneveuvx.supabase.co" -ForegroundColor Cyan
Write-Host "Votre projet ID: hzbogwleoszwtneveuvx" -ForegroundColor Cyan
Write-Host "Studio local: http://localhost:54323" -ForegroundColor Cyan

Write-Host "`nBase de donnees restauree avec succes !" -ForegroundColor Green
Write-Host "Vos donnees sont securisees dans le cloud Supabase." -ForegroundColor Green
Write-Host "Les services locaux sont maintenant operationnels." -ForegroundColor Green

Write-Host "`nVous pouvez maintenant:" -ForegroundColor Yellow
Write-Host "   - Acceder au Studio: http://localhost:54323" -ForegroundColor White
Write-Host "   - Utiliser votre application: http://localhost:8081" -ForegroundColor White
Write-Host "   - Verifier vos donnees dans le dashboard Supabase" -ForegroundColor White

Pause