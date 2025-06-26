# =============================================================================
# 🧪 SCRIPT DE TESTS AUTOMATIQUES - PLANS D'ABONNEMENT
# =============================================================================

Write-Host "🚀 DÉBUT DES TESTS DES PLANS D'ABONNEMENT" -ForegroundColor Green
Write-Host "=" * 60

# Configuration
$ErrorActionPreference = "Continue"
$testResults = @()
$startTime = Get-Date

# =============================================================================
# 📋 FONCTIONS UTILITAIRES
# =============================================================================

function Write-TestResult {
    param(
        [string]$TestName,
        [string]$Status,
        [string]$Message = ""
    )
    
    $result = @{
        Test = $TestName
        Status = $Status
        Message = $Message
        Timestamp = Get-Date
    }
    
    $script:testResults += $result
    
    switch ($Status) {
        "PASS" { Write-Host "✅ $TestName" -ForegroundColor Green }
        "FAIL" { Write-Host "❌ $TestName - $Message" -ForegroundColor Red }
        "WARN" { Write-Host "⚠️ $TestName - $Message" -ForegroundColor Yellow }
        "INFO" { Write-Host "🔍 $TestName" -ForegroundColor Cyan }
    }
}

function Test-FileExists {
    param([string]$FilePath, [string]$Description)
    
    if (Test-Path $FilePath) {
        Write-TestResult "Fichier $Description" "PASS"
        return $true
    } else {
        Write-TestResult "Fichier $Description" "FAIL" "Fichier non trouvé: $FilePath"
        return $false
    }
}

function Test-DatabaseConnection {
    Write-Host "`n🔌 Test de connexion à la base de données..." -ForegroundColor Yellow
    
    # Vérifier si les variables d'environnement sont définies
    $supabaseUrl = $env:VITE_SUPABASE_URL
    $supabaseKey = $env:VITE_SUPABASE_ANON_KEY
    
    if (-not $supabaseUrl) {
        Write-TestResult "Variables d'environnement" "FAIL" "VITE_SUPABASE_URL non définie"
        return $false
    }
    
    if (-not $supabaseKey) {
        Write-TestResult "Variables d'environnement" "FAIL" "VITE_SUPABASE_ANON_KEY non définie"
        return $false
    }
    
    Write-TestResult "Variables d'environnement" "PASS"
    
    # Test de ping vers Supabase
    try {
        $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/" -Headers @{
            "apikey" = $supabaseKey
            "Authorization" = "Bearer $supabaseKey"
        } -Method GET -TimeoutSec 10
        
        Write-TestResult "Connexion Supabase" "PASS"
        return $true
    } catch {
        Write-TestResult "Connexion Supabase" "FAIL" $_.Exception.Message
        return $false
    }
}

# =============================================================================
# 🧪 1. TESTS DES FICHIERS DE STRUCTURE
# =============================================================================

Write-Host "`n📁 Test 1: Vérification des fichiers..." -ForegroundColor Yellow

# Fichiers de service
Test-FileExists "src/services/subscription/limit.ts" "Service des limites"
Test-FileExists "src/services/subscription/index.ts" "Service principal abonnements"
Test-FileExists "src/services/subscription/mutations.ts" "Mutations abonnements"

# Hooks
Test-FileExists "src/hooks/subscription/useResourceGuard.ts" "Hook Resource Guard"
Test-FileExists "src/hooks/subscription/useSubscriptionLimits.ts" "Hook Limites"

# Composants UI
Test-FileExists "src/components/subscription/SubscriptionLimits.tsx" "Composant Limites"
Test-FileExists "src/components/subscription/LimitWarning.tsx" "Composant Alerte"

# Utilitaires
Test-FileExists "src/utils/subscriptionLimitUtils.ts" "Utilitaires limites"

# =============================================================================
# 🧪 2. TESTS DU CODE SOURCE
# =============================================================================

Write-Host "`n🔍 Test 2: Analyse du code source..." -ForegroundColor Yellow

# Test de la fonction de vérification des limites
if (Test-Path "src/services/subscription/limit.ts") {
    $limitContent = Get-Content "src/services/subscription/limit.ts" -Raw
    
    if ($limitContent -match "checkUserResourceLimit") {
        Write-TestResult "Fonction checkUserResourceLimit" "PASS"
    } else {
        Write-TestResult "Fonction checkUserResourceLimit" "FAIL" "Fonction non trouvée"
    }
    
    if ($limitContent -match "maxAllowed === -1") {
        Write-TestResult "Gestion limites illimitées" "PASS"
    } else {
        Write-TestResult "Gestion limites illimitées" "FAIL" "Logique -1 non trouvée"
    }
} else {
    Write-TestResult "Analyse limite.ts" "FAIL" "Fichier non trouvé"
}

# Test des utilitaires
if (Test-Path "src/utils/subscriptionLimitUtils.ts") {
    $utilsContent = Get-Content "src/utils/subscriptionLimitUtils.ts" -Raw
    
    if ($utilsContent -match "formatLimit.*-1.*Illimité") {
        Write-TestResult "Fonction formatLimit" "PASS"
    } else {
        Write-TestResult "Fonction formatLimit" "FAIL" "Formatage illimité non trouvé"
    }
} else {
    Write-TestResult "Analyse utils" "FAIL" "Fichier non trouvé"
}

# =============================================================================
# 🧪 3. TESTS DE LA BASE DE DONNÉES
# =============================================================================

Write-Host "`n🗄️ Test 3: Tests de la base de données..." -ForegroundColor Yellow

# Test de connexion
$dbConnected = Test-DatabaseConnection

if ($dbConnected) {
    # Test des tables
    try {
        $supabaseUrl = $env:VITE_SUPABASE_URL
        $supabaseKey = $env:VITE_SUPABASE_ANON_KEY
        
        # Test table subscription_plans
        $plansResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/subscription_plans?select=*&limit=1" -Headers @{
            "apikey" = $supabaseKey
            "Authorization" = "Bearer $supabaseKey"
        } -Method GET
        
        Write-TestResult "Table subscription_plans" "PASS"
        
        # Test table user_subscriptions
        $subscriptionsResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/user_subscriptions?select=*&limit=1" -Headers @{
            "apikey" = $supabaseKey
            "Authorization" = "Bearer $supabaseKey"
        } -Method GET
        
        Write-TestResult "Table user_subscriptions" "PASS"
        
    } catch {
        Write-TestResult "Tables Supabase" "FAIL" $_.Exception.Message
    }
}

# =============================================================================
# 🧪 4. TESTS DES PLANS SQL
# =============================================================================

Write-Host "`n💾 Test 4: Exécution des tests SQL..." -ForegroundColor Yellow

if (Test-Path "test-subscription-plans.sql") {
    Write-TestResult "Script SQL de test trouvé" "PASS"
    
    # Ici, vous pourriez exécuter le script SQL si vous avez psql installé
    # psql -h your-host -U your-user -d your-db -f test-subscription-plans.sql
    
    Write-Host "⚠️ Exécutez manuellement: psql -f test-subscription-plans.sql" -ForegroundColor Yellow
} else {
    Write-TestResult "Script SQL de test" "FAIL" "Fichier test-subscription-plans.sql non trouvé"
}

# =============================================================================
# 🧪 5. TESTS DE BUILD
# =============================================================================

Write-Host "`n🔨 Test 5: Test de build..." -ForegroundColor Yellow

try {
    # Vérifier si npm/yarn est disponible
    $packageManager = "npm"
    if (Get-Command "yarn" -ErrorAction SilentlyContinue) {
        $packageManager = "yarn"
    }
    
    Write-Host "Utilisation de $packageManager..." -ForegroundColor Cyan
    
    # Test de build TypeScript
    Write-Host "Test de compilation TypeScript..." -ForegroundColor Cyan
    $buildOutput = & $packageManager run build 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-TestResult "Build réussi" "PASS"
    } else {
        Write-TestResult "Build" "FAIL" "Erreur de compilation"
        Write-Host $buildOutput -ForegroundColor Red
    }
    
} catch {
    Write-TestResult "Test de build" "FAIL" $_.Exception.Message
}

# =============================================================================
# 🧪 6. TESTS DE LINTING
# =============================================================================

Write-Host "`n🔍 Test 6: Tests de linting..." -ForegroundColor Yellow

try {
    # Test ESLint
    $lintOutput = & npm run lint 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-TestResult "ESLint" "PASS"
    } else {
        Write-TestResult "ESLint" "WARN" "Problèmes de linting détectés"
    }
    
} catch {
    Write-TestResult "ESLint" "WARN" "ESLint non configuré ou erreur"
}

# =============================================================================
# 🧪 7. TESTS DES TYPES TYPESCRIPT
# =============================================================================

Write-Host "`n📝 Test 7: Vérification des types..." -ForegroundColor Yellow

try {
    # Test de vérification des types
    $typeCheckOutput = & npx tsc --noEmit 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-TestResult "Types TypeScript" "PASS"
    } else {
        Write-TestResult "Types TypeScript" "FAIL" "Erreurs de types détectées"
        Write-Host $typeCheckOutput -ForegroundColor Red
    }
    
} catch {
    Write-TestResult "Types TypeScript" "WARN" "Impossible de vérifier les types"
}

# =============================================================================
# 🧪 8. TESTS DE SÉCURITÉ
# =============================================================================

Write-Host "`n🔒 Test 8: Tests de sécurité..." -ForegroundColor Yellow

# Vérifier les variables d'environnement sensibles
if ($env:VITE_SUPABASE_ANON_KEY -and $env:VITE_SUPABASE_ANON_KEY.Length -gt 100) {
    Write-TestResult "Clé Supabase configurée" "PASS"
} else {
    Write-TestResult "Clé Supabase" "WARN" "Clé courte ou manquante"
}

# Vérifier que les clés secrètes ne sont pas dans le code
$secretPatterns = @("sk_", "secret_", "private_key")
$sourceFiles = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx" | Select-String -Pattern ($secretPatterns -join "|")

if ($sourceFiles.Count -eq 0) {
    Write-TestResult "Pas de secrets dans le code" "PASS"
} else {
    Write-TestResult "Secrets potentiels" "WARN" "Vérifiez les fichiers pour des clés secrètes"
}

# =============================================================================
# 📊 RAPPORT FINAL
# =============================================================================

Write-Host "`n📊 RAPPORT FINAL" -ForegroundColor Green
Write-Host "=" * 60

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failedTests = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$warnTests = ($testResults | Where-Object { $_.Status -eq "WARN" }).Count

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "🕐 Durée: $($duration.TotalSeconds) secondes" -ForegroundColor Cyan
Write-Host "📊 Total tests: $totalTests" -ForegroundColor Cyan
Write-Host "✅ Réussis: $passedTests" -ForegroundColor Green
Write-Host "❌ Échoués: $failedTests" -ForegroundColor Red
Write-Host "⚠️ Avertissements: $warnTests" -ForegroundColor Yellow

$successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)
Write-Host "📈 Taux de réussite: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } else { "Yellow" })

# Sauvegarde du rapport
$reportPath = "test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$testResults | ConvertTo-Json -Depth 3 | Out-File $reportPath
Write-Host "💾 Rapport sauvegardé: $reportPath" -ForegroundColor Cyan

# Tests échoués
if ($failedTests -gt 0) {
    Write-Host "`n❌ TESTS ÉCHOUÉS:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.Test): $($_.Message)" -ForegroundColor Red
    }
}

# Prochaines étapes
Write-Host "`n🎯 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host "1. Exécuter: psql -f test-subscription-plans.sql"
Write-Host "2. Ouvrir test-subscription-ui.md pour tests manuels"
Write-Host "3. Utiliser test-subscription-api.http avec REST Client"
Write-Host "4. Tester dans le navigateur avec test-subscription-limits.js"

# Code de sortie
if ($failedTests -eq 0) {
    Write-Host "`n🎉 TOUS LES TESTS AUTOMATIQUES RÉUSSIS!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️ CERTAINS TESTS ONT ÉCHOUÉ - VÉRIFIEZ LES DÉTAILS" -ForegroundColor Yellow
    exit 1
} 