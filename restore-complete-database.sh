#!/bin/bash

# SCRIPT DE RESTAURATION COMPLÈTE DE LA BASE DE DONNÉES IMMOO
# Ce script restaure automatiquement toute la base de données

echo "=========================================="
echo "RESTAURATION COMPLÈTE DE LA BASE IMMOO"
echo "=========================================="
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "restore-database.sql" ]; then
    print_error "Script restore-database.sql non trouvé!"
    print_error "Assurez-vous d'être dans le répertoire racine du projet IMMOO"
    exit 1
fi

print_status "Début de la restauration de la base de données IMMOO..."

# Étape 1: Restauration de base
print_status "Étape 1/3: Restauration des tables et structures de base..."
if psql -d postgres -f restore-database.sql; then
    print_success "Restauration de base terminée avec succès!"
else
    print_error "Échec de la restauration de base!"
    print_error "Vérifiez les erreurs ci-dessus et réessayez"
    exit 1
fi

echo ""

# Étape 2: Application des migrations avancées
print_status "Étape 2/3: Application des migrations avancées..."
if psql -d postgres -f apply-advanced-migrations.sql; then
    print_success "Migrations avancées appliquées avec succès!"
else
    print_warning "Certaines migrations avancées ont échoué, mais la base de base est fonctionnelle"
fi

echo ""

# Étape 3: Vérification de la restauration
print_status "Étape 3/3: Vérification de la restauration..."
if psql -d postgres -f verify-restoration.sql; then
    print_success "Vérification terminée!"
else
    print_warning "La vérification a rencontré des problèmes, mais la base peut être fonctionnelle"
fi

echo ""
echo "=========================================="
print_success "RESTAURATION TERMINÉE!"
echo "=========================================="
echo ""
print_status "Votre base de données IMMOO a été restaurée!"
echo ""
print_status "Prochaines étapes recommandées:"
echo "1. Tester l'application web"
echo "2. Vérifier que l'authentification fonctionne"
echo "3. Créer un utilisateur de test"
echo "4. Créer une agence de test"
echo "5. Créer une propriété de test"
echo ""
print_status "Si vous rencontrez des problèmes, consultez les logs ci-dessus"
echo "=========================================="
