# 🧪 Guide de Test des Corrections - Vérification de Transaction

## 📋 Résumé des Corrections Implémentées

Les modifications suivantes ont été apportées au fichier `supabase/functions/verify-transaction/index.ts` :

### ✅ Corrections Principales

1. **Création d'abonnements actifs** : Ajout automatique d'entrées dans `user_subscriptions`
2. **Calcul des dates d'expiration** : Gestion des cycles de facturation (mensuel, trimestriel, semestriel, annuel, lifetime)
3. **Gestion des anciens abonnements** : Désactivation automatique des abonnements précédents
4. **Historique de facturation** : Création d'entrées dans `billing_history`
5. **Gestion d'erreurs** : Logs détaillés pour le débogage

## 🔍 Tests à Effectuer

### Test 1 : Vérification de la Structure des Tables

```bash
# Exécuter le script de vérification
psql -h [HOST] -U [USER] -d [DATABASE] -f verify-tables-structure.sql
```

**Résultats attendus :**
- Tables `user_subscriptions`, `billing_history`, `subscription_plans`, `transactions` existent
- Colonnes nécessaires présentes avec les bons types

### Test 2 : Test de la Fonction via Interface Web

1. Ouvrir `test-verify-transaction.html` dans le navigateur
2. Remplir les champs avec des données de test
3. Tester les deux modes :
   - **Vérification Temps Réel** : Simule l'écoute en temps réel
   - **Vérification Standard** : Simule la vérification manuelle

**Données de test suggérées :**
```
ID Utilisateur: [UUID d'un utilisateur existant]
ID Plan: [ID d'un plan existant]
Nom du Plan: Premium Mensuel
Référence de Paiement: TEST_REF_[timestamp]
Montant: 2500 (25.00 €)
Numéro Expéditeur: +22370123456
```

### Test 3 : Vérification Post-Transaction

Après une transaction réussie, vérifier :

```sql
-- 1. Vérifier la mise à jour du profil
SELECT 
    id,
    current_plan_id,
    subscription_status,
    plan_updated_at
FROM profiles 
WHERE id = '[USER_ID]';

-- 2. Vérifier la création de l'abonnement
SELECT 
    user_id,
    plan_id,
    status,
    payment_method,
    start_date,
    end_date
FROM user_subscriptions 
WHERE user_id = '[USER_ID]' 
    AND status = 'active'
ORDER BY created_at DESC;

-- 3. Vérifier l'entrée dans billing_history
SELECT 
    user_id,
    plan_id,
    amount,
    status,
    payment_method,
    transaction_id,
    description,
    payment_date
FROM billing_history 
WHERE user_id = '[USER_ID]'
ORDER BY created_at DESC;

-- 4. Vérifier la transaction
SELECT 
    id,
    payment_reference,
    payment_status,
    user_id,
    plan_id,
    verification_method,
    verified_at
FROM transactions 
WHERE payment_reference = '[PAYMENT_REFERENCE]';
```

### Test 4 : Test des Cycles de Facturation

Tester avec différents types de plans :

1. **Plan Mensuel** : `end_date` = `start_date` + 1 mois
2. **Plan Trimestriel** : `end_date` = `start_date` + 3 mois
3. **Plan Semestriel** : `end_date` = `start_date` + 6 mois
4. **Plan Annuel** : `end_date` = `start_date` + 1 an
5. **Plan Lifetime** : `end_date` = `start_date` + 100 ans

### Test 5 : Test de Sécurité et Doublons

1. **Test de transaction déjà vérifiée** :
   - Utiliser une référence de paiement déjà vérifiée
   - Vérifier que le système refuse la re-vérification

2. **Test de transaction d'un autre utilisateur** :
   - Utiliser une référence appartenant à un autre utilisateur
   - Vérifier le message d'erreur approprié

3. **Test de désactivation des anciens abonnements** :
   - Vérifier qu'un seul abonnement reste actif par utilisateur

## 🎯 Critères de Réussite

### ✅ Fonctionnalités Essentielles

- [ ] **Profil mis à jour** : `current_plan_id`, `subscription_status`, `plan_updated_at`
- [ ] **Abonnement créé** : Entrée active dans `user_subscriptions`
- [ ] **Historique créé** : Entrée dans `billing_history` avec statut 'paid'
- [ ] **Transaction marquée** : Statut 'verified' avec `user_id` et `plan_id`
- [ ] **Dates correctes** : `end_date` calculée selon le cycle de facturation
- [ ] **Anciens abonnements désactivés** : Statut 'cancelled' pour les précédents

### ✅ Sécurité et Robustesse

- [ ] **Protection contre doublons** : Impossible de vérifier deux fois la même transaction
- [ ] **Isolation utilisateur** : Impossible d'utiliser la transaction d'un autre
- [ ] **Gestion d'erreurs** : Logs détaillés en cas de problème
- [ ] **Cohérence des données** : Toutes les tables mises à jour ou aucune

## 🚨 Points d'Attention

### Erreurs Possibles

1. **Plan inexistant** : Vérifier que `plan_id` existe dans `subscription_plans`
2. **Utilisateur inexistant** : Vérifier que `user_id` existe dans `profiles`
3. **Contraintes de base** : Vérifier les contraintes uniques et foreign keys
4. **Permissions RLS** : Vérifier que les politiques RLS permettent les opérations

### Logs à Surveiller

```
- "Plan info error" : Problème de récupération des infos du plan
- "Deactivate old subscriptions error" : Problème de désactivation
- "Subscription creation error" : Problème de création d'abonnement
- "Billing history creation error" : Problème de création d'historique
```

## 📊 Métriques de Performance

- **Temps de réponse** : < 2 secondes pour une vérification
- **Taux de succès** : > 99% pour les transactions valides
- **Cohérence des données** : 100% (toutes les tables mises à jour)

## 🔄 Processus de Rollback

En cas de problème, restaurer la version précédente :

```bash
# Revenir à la version précédente
git checkout HEAD~1 -- supabase/functions/verify-transaction/index.ts

# Redéployer
npx supabase functions deploy verify-transaction
```

## 📞 Support

En cas de problème :

1. Vérifier les logs de la fonction dans le dashboard Supabase
2. Exécuter les requêtes de vérification SQL
3. Consulter les métriques de performance
4. Contacter l'équipe de développement avec les logs détaillés

---

**Date de création** : 2025-01-21  
**Version** : 1.0  
**Auteur** : Assistant IA  
**Statut** : ✅ Prêt pour les tests
