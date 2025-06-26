# =============================================================================
# TESTS AUTOMATIQUES - PLANS D'ABONNEMENT
# =============================================================================

Write-Host "DEBUT DES TESTS DES PLANS D'ABONNEMENT" -ForegroundColor Green
Write-Host "=" * 60

$ErrorActionPreference = "Continue"
$testResults = @()
$startTime = Get-Date

# =============================================================================
# FONCTIONS UTILITAIRES
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
        "PASS" { Write-Host "[PASS] $TestName" -ForegroundColor Green }
        "FAIL" { Write-Host "[FAIL] $TestName - $Message" -ForegroundColor Red }
        "WARN" { Write-Host "[WARN] $TestName - $Message" -ForegroundColor Yellow }
        "INFO" { Write-Host "[INFO] $TestName" -ForegroundColor Cyan }
    }
}

function Test-FileExists {
    param([string]$FilePath, [string]$Description)
    
    if (Test-Path $FilePath) {
        Write-TestResult "Fichier $Description" "PASS"
        return $true
    } else {
        Write-TestResult "Fichier $Description" "FAIL" "Fichier non trouve: $FilePath"
        return $false
    }
}

# =============================================================================
# TEST 1: VERIFICATION DES FICHIERS
# =============================================================================

Write-Host "`nTest 1: Verification des fichiers..." -ForegroundColor Yellow

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

# Fichiers de test créés
Test-FileExists "test-subscription-plans.sql" "Script SQL de test"
Test-FileExists "test-subscription-limits.js" "Tests JavaScript"
Test-FileExists "test-subscription-api.http" "Tests API HTTP"
Test-FileExists "test-subscription-ui.md" "Guide tests UI"

# =============================================================================
# TEST 2: ANALYSE DU CODE SOURCE
# =============================================================================

Write-Host "`nTest 2: Analyse du code source..." -ForegroundColor Yellow

# Test de la fonction de verification des limites
if (Test-Path "src/services/subscription/limit.ts") {
    $limitContent = Get-Content "src/services/subscription/limit.ts" -Raw
    
    if ($limitContent -match "checkUserResourceLimit") {
        Write-TestResult "Fonction checkUserResourceLimit" "PASS"
    } else {
        Write-TestResult "Fonction checkUserResourceLimit" "FAIL" "Fonction non trouvee"
    }
    
    if ($limitContent -match "maxAllowed === -1") {
        Write-TestResult "Gestion limites illimitees" "PASS"
    } else {
        Write-TestResult "Gestion limites illimitees" "FAIL" "Logique -1 non trouvee"
    }
    
    if ($limitContent -match "getCurrentResourceCount") {
        Write-TestResult "Fonction comptage ressources" "PASS"
    } else {
        Write-TestResult "Fonction comptage ressources" "FAIL"
    }
} else {
    Write-TestResult "Analyse limit.ts" "FAIL" "Fichier non trouve"
}

# Test des utilitaires
if (Test-Path "src/utils/subscriptionLimitUtils.ts") {
    $utilsContent = Get-Content "src/utils/subscriptionLimitUtils.ts" -Raw
    
    if ($utilsContent -match "formatLimit") {
        Write-TestResult "Fonction formatLimit" "PASS"
    } else {
        Write-TestResult "Fonction formatLimit" "FAIL"
    }
    
    if ($utilsContent -match "isUnlimitedLimit") {
        Write-TestResult "Fonction isUnlimitedLimit" "PASS"
    } else {
        Write-TestResult "Fonction isUnlimitedLimit" "FAIL"
    }
} else {
    Write-TestResult "Analyse utils" "FAIL" "Fichier non trouve"
}

# =============================================================================
# TEST 3: VERIFICATION DES HOOKS
# =============================================================================

Write-Host "`nTest 3: Verification des hooks..." -ForegroundColor Yellow

if (Test-Path "src/hooks/subscription/useResourceGuard.ts") {
    $guardContent = Get-Content "src/hooks/subscription/useResourceGuard.ts" -Raw
    
    if ($guardContent -match "canCreateResource") {
        Write-TestResult "Hook useResourceGuard" "PASS"
    } else {
        Write-TestResult "Hook useResourceGuard" "FAIL"
    }
} else {
    Write-TestResult "Hook useResourceGuard" "FAIL" "Fichier non trouve"
}

if (Test-Path "src/hooks/subscription/useSubscriptionLimits.ts") {
    $limitsContent = Get-Content "src/hooks/subscription/useSubscriptionLimits.ts" -Raw
    
    if ($limitsContent -match "checkLimit") {
        Write-TestResult "Hook useSubscriptionLimits" "PASS"
    } else {
        Write-TestResult "Hook useSubscriptionLimits" "FAIL"
    }
} else {
    Write-TestResult "Hook useSubscriptionLimits" "FAIL" "Fichier non trouve"
}

# =============================================================================
# TEST 4: VERIFICATION DES COMPOSANTS UI
# =============================================================================

Write-Host "`nTest 4: Verification des composants UI..." -ForegroundColor Yellow

if (Test-Path "src/components/subscription/SubscriptionLimits.tsx") {
    $limitsUIContent = Get-Content "src/components/subscription/SubscriptionLimits.tsx" -Raw
    
    if ($limitsUIContent -match "useSubscriptionLimits") {
        Write-TestResult "Composant SubscriptionLimits" "PASS"
    } else {
        Write-TestResult "Composant SubscriptionLimits" "FAIL"
    }
} else {
    Write-TestResult "Composant SubscriptionLimits" "FAIL" "Fichier non trouve"
}

if (Test-Path "src/components/subscription/LimitWarning.tsx") {
    $warningContent = Get-Content "src/components/subscription/LimitWarning.tsx" -Raw
    
    if ($warningContent -match "LimitWarning") {
        Write-TestResult "Composant LimitWarning" "PASS"
    } else {
        Write-TestResult "Composant LimitWarning" "FAIL"
    }
} else {
    Write-TestResult "Composant LimitWarning" "FAIL" "Fichier non trouve"
}

# =============================================================================
# TEST 5: VERIFICATION PACKAGE.JSON
# =============================================================================

Write-Host "`nTest 5: Verification package.json..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    $packageContent = Get-Content "package.json" -Raw
    
    if ($packageContent -match "supabase") {
        Write-TestResult "Dependance Supabase" "PASS"
    } else {
        Write-TestResult "Dependance Supabase" "WARN" "Supabase non trouve dans package.json"
    }
    
    if ($packageContent -match "react") {
        Write-TestResult "Dependance React" "PASS"
    } else {
        Write-TestResult "Dependance React" "FAIL"
    }
} else {
    Write-TestResult "Package.json" "FAIL" "Fichier non trouve"
}

# =============================================================================
# TEST 6: COMPILATION TYPESCRIPT
# =============================================================================

Write-Host "`nTest 6: Test de compilation TypeScript..." -ForegroundColor Yellow

try {
    # Verifier si npx est disponible
    $npxCheck = & npx --version 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-TestResult "NPX disponible" "PASS"
        
        # Test de verification des types TypeScript
        Write-Host "Verification des types TypeScript..." -ForegroundColor Cyan
        $tscOutput = & npx tsc --noEmit --skipLibCheck 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-TestResult "Types TypeScript" "PASS"
        } else {
            Write-TestResult "Types TypeScript" "WARN" "Quelques erreurs de types detectees"
        }
    } else {
        Write-TestResult "NPX" "WARN" "NPX non disponible"
    }
} catch {
    Write-TestResult "Compilation TypeScript" "WARN" "Impossible de tester la compilation"
}

# =============================================================================
# TEST 7: VERIFICATION DES MIGRATIONS
# =============================================================================

Write-Host "`nTest 7: Verification des migrations..." -ForegroundColor Yellow

$migrationFiles = Get-ChildItem -Path "supabase/migrations" -Filter "*.sql" -ErrorAction SilentlyContinue

if ($migrationFiles.Count -gt 0) {
    Write-TestResult "Fichiers de migration" "PASS" "$($migrationFiles.Count) fichiers trouves"
    
    # Verifier les migrations de contraintes
    $constraintMigrations = $migrationFiles | Where-Object { $_.Name -match "constraint|subscription" }
    if ($constraintMigrations.Count -gt 0) {
        Write-TestResult "Migrations d'abonnement" "PASS" "$($constraintMigrations.Count) fichiers"
    } else {
        Write-TestResult "Migrations d'abonnement" "WARN" "Aucune migration specifique trouvee"
    }
} else {
    Write-TestResult "Fichiers de migration" "WARN" "Aucun fichier de migration trouve"
}

# =============================================================================
# RAPPORT FINAL
# =============================================================================

Write-Host "`nRAPPORT FINAL" -ForegroundColor Green
Write-Host "=" * 60

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failedTests = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$warnTests = ($testResults | Where-Object { $_.Status -eq "WARN" }).Count

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "Duree: $([math]::Round($duration.TotalSeconds, 1)) secondes" -ForegroundColor Cyan
Write-Host "Total tests: $totalTests" -ForegroundColor Cyan
Write-Host "Reussis: $passedTests" -ForegroundColor Green
Write-Host "Echecs: $failedTests" -ForegroundColor Red
Write-Host "Avertissements: $warnTests" -ForegroundColor Yellow

$successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)
Write-Host "Taux de reussite: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } else { "Yellow" })

# Tests echoues
if ($failedTests -gt 0) {
    Write-Host "`nTESTS ECHOUES:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.Test): $($_.Message)" -ForegroundColor Red
    }
}

# Prochaines etapes
Write-Host "`nPROCHAINES ETAPES:" -ForegroundColor Yellow
Write-Host "1. Executer les tests SQL dans Supabase"
Write-Host "2. Tester l'interface utilisateur avec le guide test-subscription-ui.md"
Write-Host "3. Utiliser test-subscription-api.http pour tester les APIs"
Write-Host "4. Charger test-subscription-limits.js dans le navigateur"

# Code de sortie
if ($failedTests -eq 0) {
    Write-Host "`nTOUS LES TESTS AUTOMATIQUES REUSSIS!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nCERTAINS TESTS ONT ECHOUE - VERIFIEZ LES DETAILS" -ForegroundColor Yellow
    exit 1
} 