# Guide : Système de Gestion des Dépenses

## Vue d'ensemble

Le système de gestion des dépenses permet aux agences immobilières de :
- **Enregistrer et suivre** toutes les dépenses liées à leurs propriétés
- **Catégoriser** les dépenses (maintenance, rénovation, services publics, etc.)
- **Gérer les statuts** (en attente, approuvée, payée, rejetée)
- **Calculer le revenu net** en déduisant les dépenses des gains
- **Générer des rapports** détaillés et des analyses

## Fonctionnalités principales

### 1. Gestion des Dépenses
- **Création** : Formulaire complet avec tous les champs nécessaires
- **Modification** : Édition des dépenses existantes
- **Suppression** : Suppression sécurisée avec confirmation
- **Statuts** : Workflow de validation (en attente → approuvée → payée)
- **Priorités** : Faible, normale, élevée, urgente

### 2. Catégorisation
- **13 catégories** prédéfinies avec couleurs et icônes
- **Maintenance** : Réparations et entretien général
- **Rénovation** : Travaux d'amélioration
- **Services publics** : Électricité, eau, gaz, internet
- **Assurance** : Couvertures propriété et responsabilité
- **Taxes** : Taxes foncières et impôts
- **Nettoyage** : Services d'entretien
- **Sécurité** : Systèmes de surveillance
- **Jardinage** : Entretien des espaces verts
- **Administration** : Frais administratifs
- **Marketing** : Publicité et promotion
- **Légal** : Frais juridiques
- **Inspection** : Inspections et certifications
- **Autres** : Dépenses diverses

### 3. Dépenses Récurrentes
- **Configuration** : Fréquence mensuelle, trimestrielle, annuelle
- **Génération automatique** : Création automatique des échéances
- **Suivi** : Historique des dépenses récurrentes

### 4. Pièces Jointes
- **Upload** : Téléchargement de factures et reçus
- **Stockage** : Fichiers sécurisés dans Supabase Storage
- **Visualisation** : Consultation des documents

### 5. Actions en Lot
- **Sélection multiple** : Choix de plusieurs dépenses
- **Actions groupées** : Approuver, rejeter, marquer comme payées
- **Suppression en masse** : Suppression sécurisée

## Interface Utilisateur

### Page Principale (`/agencies/:agencyId/expenses`)

#### 1. Vue d'ensemble
- **Cartes de résumé** : Statistiques clés en temps réel
- **Graphiques** : Évolution mensuelle et répartition par catégorie
- **Dépenses récentes** : Liste des dernières dépenses

#### 2. Liste des Dépenses
- **Tableau interactif** : Tri, filtrage, pagination
- **Actions rapides** : Modifier, supprimer, voir détails
- **Statuts visuels** : Badges colorés pour chaque statut

#### 3. Filtres Avancés
- **Propriété** : Filtrer par propriété spécifique
- **Catégorie** : Filtrer par type de dépense
- **Statut** : En attente, approuvée, payée, rejetée
- **Période** : Sélection de dates de début et fin
- **Montant** : Fourchette de montants
- **Fournisseur** : Recherche par nom de fournisseur
- **Récurrentes** : Filtrer les dépenses récurrentes

#### 4. Analyses
- **Graphiques** : Tendances et répartitions
- **Rapports** : Génération de rapports détaillés

## Architecture Technique

### Base de Données

#### Tables Principales
```sql
-- Table des dépenses (étendue)
expenses (
  id, property_id, category, amount, date, description,
  status, priority, vendor_name, vendor_contact,
  payment_method, payment_date, recurring, recurring_frequency,
  next_due_date, tags, notes, created_by, approved_by
)

-- Catégories de dépenses
expense_categories (
  id, name, description, color, icon, is_active
)

-- Pièces jointes
expense_attachments (
  id, expense_id, file_name, file_url, file_type, file_size
)

-- Historique des modifications
expense_history (
  id, expense_id, action, old_values, new_values, changed_by
)
```

#### Vues et Fonctions
```sql
-- Vue des détails complets
expense_details (toutes les informations avec jointures)

-- Vue des statistiques par propriété
property_expense_stats (totaux et moyennes)

-- Fonction de calcul du revenu net
calculate_property_net_income(property_id, start_date, end_date)
```

### Services

#### `expenseService.ts`
- **CRUD complet** : Création, lecture, mise à jour, suppression
- **Filtrage avancé** : Recherche avec multiples critères
- **Statistiques** : Calculs de résumés et analyses
- **Actions en lot** : Opérations sur plusieurs dépenses
- **Gestion des fichiers** : Upload et suppression de pièces jointes

#### `useExpensesManagement.ts`
- **Hook React Query** : Gestion d'état et cache
- **Mutations** : Actions asynchrones avec feedback
- **Filtres** : État local des filtres
- **Pagination** : Navigation dans les résultats

### Composants

#### Composants Principaux
- **`ExpenseSummaryCards`** : Cartes de statistiques
- **`ExpenseList`** : Tableau des dépenses
- **`ExpenseFormDialog`** : Formulaire de création/édition
- **`ExpenseFiltersPanel`** : Panneau de filtres
- **`ExpenseBulkActions`** : Actions en lot
- **`ExpenseCharts`** : Graphiques et visualisations

## Intégration avec le Système Existant

### Liaison avec les Gains
- **Calcul automatique** : Revenu net = Gains - Dépenses
- **Impact sur les rapports** : Prise en compte dans les analyses
- **Workflow intégré** : Dépenses déduites des gains du propriétaire

### Sécurité
- **RLS (Row Level Security)** : Accès restreint par agence
- **Validation** : Contrôles côté client et serveur
- **Audit** : Historique complet des modifications

## Utilisation

### 1. Accès
- Navigation : Sidebar → "Dépenses"
- URL : `/agencies/:agencyId/expenses`
- Permissions : Membres de l'agence uniquement

### 2. Création d'une Dépense
1. Cliquer sur "Nouvelle Dépense"
2. Remplir le formulaire :
   - Sélectionner la propriété
   - Choisir la catégorie
   - Saisir le montant
   - Ajouter la description
   - Renseigner le fournisseur
   - Définir la priorité
3. Optionnel : Configurer comme récurrente
4. Ajouter des pièces jointes
5. Sauvegarder

### 3. Gestion des Statuts
1. **En attente** : Dépense créée, en attente d'approbation
2. **Approuvée** : Dépense validée, prête pour paiement
3. **Payée** : Paiement effectué, impact sur le revenu net
4. **Rejetée** : Dépense refusée

### 4. Actions en Lot
1. Sélectionner plusieurs dépenses
2. Choisir l'action (approuver, rejeter, marquer payées)
3. Ajouter des notes optionnelles
4. Confirmer l'action

## Avantages du Système

### Pour les Agences
- **Transparence** : Suivi complet des dépenses
- **Efficacité** : Gestion centralisée et automatisée
- **Analyse** : Rapports détaillés pour la prise de décision
- **Conformité** : Traçabilité complète

### Pour les Propriétaires
- **Visibilité** : Accès aux dépenses de leurs propriétés
- **Contrôle** : Validation des dépenses importantes
- **Rentabilité** : Calcul précis du revenu net
- **Planification** : Anticipation des coûts récurrents

## Maintenance et Évolutions

### Fonctionnalités Futures
- **Notifications** : Alertes pour dépenses en retard
- **Budgets** : Planification et suivi des budgets
- **Approbations** : Workflow d'approbation multi-niveaux
- **Intégrations** : Connexion avec systèmes comptables
- **Mobile** : Application mobile dédiée

### Maintenance
- **Sauvegardes** : Sauvegarde automatique des données
- **Monitoring** : Surveillance des performances
- **Mises à jour** : Évolutions régulières du système 