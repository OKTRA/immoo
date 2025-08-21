# SCRIPT DE RESTAURATION COMPLETE DE LA BASE DE DONNEES IMMOO (Windows)
# Ce script restaure automatiquement toute la base de donnees

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "RESTAURATION COMPLETE DE LA BASE IMMOO" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour afficher les messages colores
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Verifier que nous sommes dans le bon repertoire
if (-not (Test-Path "restore-database.sql")) {
    Write-Error "Script restore-database.sql non trouve!"
    Write-Error "Assurez-vous d'etre dans le repertoire racine du projet IMMOO"
    exit 1
}

Write-Status "Debut de la restauration de la base de donnees IMMOO..."

# Verifier si psql est disponible
try {
    $psqlVersion = psql --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "psql non trouve"
    }
    Write-Status "PostgreSQL client detecte: $psqlVersion"
} catch {
    Write-Error "PostgreSQL client (psql) non trouve!"
    Write-Error "Veuillez installer PostgreSQL ou ajouter psql au PATH"
    Write-Error "Vous pouvez telecharger PostgreSQL depuis: https://www.postgresql.org/download/"
    exit 1
}

# Etape 1: Restauration de base
Write-Status "Etape 1/3: Restauration des tables et structures de base..."
try {
    $result = psql -d postgres -f restore-database.sql 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Restauration de base terminee avec succes!"
    } else {
        Write-Error "Echec de la restauration de base!"
        Write-Error "Sortie: $result"
        exit 1
    }
} catch {
    Write-Error "Erreur lors de la restauration de base: $_"
    exit 1
}

Write-Host ""

# Etape 2: Application des migrations avancees
Write-Status "Etape 2/3: Application des migrations avancees..."
try {
    $result = psql -d postgres -f apply-advanced-migrations.sql 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Migrations avancees appliquees avec succes!"
    } else {
        Write-Warning "Certaines migrations avancees ont echoue, mais la base de base est fonctionnelle"
        Write-Warning "Sortie: $result"
    }
} catch {
    Write-Warning "Erreur lors des migrations avancees: $_"
    Write-Warning "La base de base peut etre fonctionnelle"
}

Write-Host ""

# Etape 3: Verification de la restauration
Write-Status "Etape 3/3: Verification de la restauration..."
try {
    $result = psql -d postgres -f verify-restoration.sql 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Verification terminee!"
    } else {
        Write-Warning "La verification a rencontre des problemes, mais la base peut etre fonctionnelle"
        Write-Warning "Sortie: $result"
    }
} catch {
    Write-Warning "Erreur lors de la verification: $_"
    Write-Warning "La base peut etre fonctionnelle malgre les erreurs de verification"
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Success "RESTAURATION TERMINEE!"
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Status "Votre base de donnees IMMOO a ete restauree!"
Write-Host ""
Write-Status "Prochaines etapes recommandees:"
Write-Host "1. Tester l'application web"
Write-Host "2. Verifier que l'authentification fonctionne"
Write-Host "3. Creer un utilisateur de test"
Write-Host "4. Creer une agence de test"
Write-Host "5. Creer une propriete de test"
Write-Host ""
Write-Status "Si vous rencontrez des problemes, consultez les logs ci-dessus"
Write-Host "==========================================" -ForegroundColor Cyan

# Attendre que l'utilisateur appuie sur une touche
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
