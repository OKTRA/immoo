# 🔄 RESTAURATION DE LA BASE DE DONNÉES IMMOO

Ce guide vous explique comment restaurer complètement votre base de données IMMOO après une réinitialisation.

## 📋 PRÉREQUIS

- **PostgreSQL** installé et configuré
- **Client psql** disponible dans le PATH
- **Accès administrateur** à la base de données
- **Projet IMMOO** dans le répertoire de travail

## 🚀 RESTAURATION AUTOMATIQUE (RECOMMANDÉE)

### Sur Windows (PowerShell)
```powershell
# Ouvrir PowerShell en tant qu'administrateur
# Naviguer vers le répertoire du projet
cd C:\Users\Ousma\Desktop\DEV\immoo

# Exécuter le script de restauration
.\restore-complete-database.ps1
```

### Sur Linux/Mac (Bash)
```bash
# Ouvrir un terminal
# Naviguer vers le répertoire du projet
cd /path/to/immoo

# Rendre le script exécutable
chmod +x restore-complete-database.sh

# Exécuter le script de restauration
./restore-complete-database.sh
```

## 🔧 RESTAURATION MANUELLE

Si vous préférez exécuter les scripts manuellement :

### Étape 1: Restauration de base
```bash
psql -d postgres -f restore-database.sql
```

### Étape 2: Migrations avancées
```bash
psql -d postgres -f apply-advanced-migrations.sql
```

### Étape 3: Vérification
```bash
psql -d postgres -f verify-restoration.sql
```

## 📊 CE QUI SERA RESTAURÉ

### 🗃️ Tables principales
- **profiles** - Profils utilisateurs et rôles
- **agencies** - Agences immobilières
- **properties** - Propriétés immobilières
- **tenants** - Locataires
- **apartments** - Appartements
- **apartment_leases** - Baux d'appartements
- **apartment_lease_payments** - Paiements de loyers
- **expenses** - Dépenses
- **contracts** - Contrats
- **subscription_plans** - Plans d'abonnement
- **subscription_payment_methods** - Méthodes de paiement
- **admin_roles** - Rôles administrateurs
- **billing_cycles** - Cycles de facturation

### 👁️ Vues
- **apartment_tenants_with_rent** - Locataires avec informations de loyer
- **payment_history_with_tenant** - Historique des paiements

### ⚙️ Fonctions
- **calculate_late_fees** - Calcul des frais de retard
- **check_renewal_eligibility** - Vérification d'éligibilité au renouvellement
- **update_updated_at_column** - Mise à jour automatique des timestamps

### 🔒 Sécurité
- **Row Level Security (RLS)** activé sur toutes les tables
- **Politiques de sécurité** configurées
- **Contraintes d'intégrité** et clés étrangères

### 📈 Performance
- **Index optimisés** pour les requêtes fréquentes
- **Triggers** pour la maintenance automatique

## 🎯 DONNÉES DE BASE INCLUSES

### Plans d'abonnement
- **Gratuit** - 3 propriétés, 1 utilisateur
- **Starter** - 10 propriétés, 3 utilisateurs (5 000 FCFA/mois)
- **Professional** - Illimité (15 000 FCFA/mois)
- **Enterprise** - Illimité + support dédié (50 000 FCFA/mois)

### Méthodes de paiement (Mobile Money Mali)
- **Orange Money Mali** - +223 76 00 00 00
- **Moov Money Mali** - +223 65 00 00 00
- **Wave Mali** - +223 90 00 00 00

### Cycles de facturation
- Mensuel (30 jours)
- Trimestriel (90 jours)
- Semestriel (180 jours)
- Annuel (365 jours)

## ⚠️ TROUBLESHOOTING

### Erreur: "psql command not found"
**Solution:** Installer PostgreSQL ou ajouter psql au PATH
```bash
# Windows: Télécharger depuis https://www.postgresql.org/download/
# Linux: sudo apt-get install postgresql-client
# Mac: brew install postgresql
```

### Erreur: "Permission denied"
**Solution:** Exécuter en tant qu'administrateur
```bash
# Windows: PowerShell en tant qu'administrateur
# Linux/Mac: sudo ./restore-complete-database.sh
```

### Erreur: "Database connection failed"
**Solution:** Vérifier la configuration PostgreSQL
```bash
# Vérifier que PostgreSQL est démarré
# Vérifier les paramètres de connexion
# Tester la connexion: psql -d postgres -c "SELECT 1;"
```

### Erreur: "Table already exists"
**Solution:** Normal, les scripts utilisent `CREATE TABLE IF NOT EXISTS`
- Cette erreur peut être ignorée
- Les tables existantes ne seront pas écrasées

## 🔍 VÉRIFICATION POST-RESTAURATION

Après la restauration, vérifiez que :

1. ✅ **L'application web se lance** sans erreurs de base de données
2. ✅ **L'authentification fonctionne** (inscription/connexion)
3. ✅ **Vous pouvez créer** une agence de test
4. ✅ **Vous pouvez créer** une propriété de test
5. ✅ **Les plans d'abonnement** s'affichent correctement

## 📞 SUPPORT

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** d'erreur dans la console
2. **Consultez la documentation** PostgreSQL
3. **Vérifiez la configuration** de votre base de données
4. **Testez la connexion** manuellement avec psql

## 🔄 RÉINITIALISATION COMPLÈTE

Si vous devez tout recommencer :

```bash
# Supprimer toutes les tables (ATTENTION: données perdues!)
psql -d postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Puis relancer la restauration
./restore-complete-database.sh
```

---

**Note:** Cette restauration respecte le principe de non-interférence avec les fonctionnalités existantes, comme demandé dans vos règles de projet.
