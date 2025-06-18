# Guide de la Logique des Abonnements

## Principe Central ✨

La logique des abonnements est maintenant claire et simple :

### 🔄 Si abonnement ACTIF (non expiré)
→ **UPGRADE sur la période active**
- Modification du plan sans changer les dates
- Conservation de la `start_date` et `end_date` existantes  
- Mise à jour du `plan_id` uniquement
- ❌ **Pas de création d'un nouvel abonnement**

### 🆕 Si abonnement EXPIRÉ ou inexistant
→ **NOUVELLE prise d'abonnement**
- Désactivation de l'ancien abonnement (status = 'cancelled')
- Création d'un nouvel abonnement avec dates fraîches
- Calcul automatique de `end_date` selon le cycle de facturation
- ✅ **Nouveau cycle complet**

## ⚠️ PROBLÈME IDENTIFIÉ ET RÉSOLU

### 🐛 **Problème détecté :**
Malgré la logique correcte d'abonnements uniques, il était possible d'avoir **des doublons dans l'historique de facturation** (`billing_history`) lors d'activations manuelles répétées par l'administrateur.

**Exemple concret :**
```
18/06/2025 - izoflores45@gmail.com - Plan PRO - 25000 FCFA - Manual_activation
18/06/2025 - izoflores45@gmail.com - Plan PRO - 25000 FCFA - Manual_activation
```

**Cause :** L'interface d'administration permettait de cliquer plusieurs fois sur "Activer" sans protection.

### ✅ **Solutions mises en place :**

#### 1. **Protection Frontend** (Interface d'administration)
```typescript
// Vérification avant activation
if (selectedUserData?.current_plan_id === selectedPlan) {
  toast.error(`L'utilisateur a déjà le plan ${selectedPlanData?.name} actif`);
  return;
}

// Vérification d'activations récentes (5 minutes)
const recentActivations = await checkRecentActivations();
if (recentActivations.length > 0) {
  toast.error(`Activation récente détectée. Attendez quelques minutes.`);
  return;
}
```

#### 2. **Protection Backend** (Trigger PostgreSQL)
```sql
-- Trigger qui empêche les insertions multiples dans billing_history
CREATE TRIGGER trigger_prevent_duplicate_manual_activation
  BEFORE INSERT ON billing_history
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_manual_activation();
```

#### 3. **Protection Base de Données** (Contrainte unique)
```sql
-- Index unique pour empêcher les abonnements actifs multiples
CREATE UNIQUE INDEX idx_user_subscriptions_one_active_per_user 
ON user_subscriptions (user_id) 
WHERE status = 'active';
```

#### 4. **Surveillance et Monitoring**
```sql
-- Vue pour surveiller les activations récentes
CREATE VIEW recent_manual_activations AS ...
```

## Implémentation Technique

### 1. Contrainte de Base de Données
```sql
-- Empêche les doublons d'abonnements actifs
CREATE UNIQUE INDEX idx_user_subscriptions_one_active_per_user 
ON user_subscriptions (user_id) 
WHERE status = 'active';
```

### 2. Fonction TypeScript
```typescript
// src/services/subscription/mutations.ts
export const upgradeUserSubscription = async (
  userId: string,
  newPlanId: string,
  agencyId?: string,
  paymentMethod?: string
)
```

### 3. Fonction PostgreSQL
```sql
-- Fonction RPC: activate_subscription_with_promo
-- Gère automatiquement upgrade vs nouvelle prise
```

## Vérifications Automatiques

### Détection d'un abonnement actif
```typescript
const isCurrentSubscriptionActive = currentSubscription && 
  !isSubscriptionExpired(currentSubscription.end_date);
```

### Calcul automatique des dates de fin
```typescript
const endDate = calculateSubscriptionEndDate(now, planInfo.billing_cycle);
```

## Scénarios d'Usage

### Scénario 1: Upgrade d'un plan actif
```
Utilisateur: Plan Starter actif jusqu'au 31/12/2025
Action: Upgrade vers Plan Pro
Résultat: Plan Pro actif jusqu'au 31/12/2025 (date conservée)
```

### Scénario 2: Renouvellement après expiration
```
Utilisateur: Plan Starter expiré le 15/11/2025
Action: Activation Plan Pro le 20/11/2025
Résultat: Plan Pro actif du 20/11/2025 au 20/12/2025 (nouveau cycle)
```

### Scénario 3: Premier abonnement
```
Utilisateur: Aucun abonnement
Action: Activation Plan Starter
Résultat: Plan Starter avec cycle complet
```

## Protection contre les Doublons

### Au niveau base de données
- ✅ Contrainte unique sur `user_id` WHERE `status = 'active'`
- ✅ Trigger de protection sur `billing_history`
- ✅ Fonction de nettoyage automatique des doublons existants

### Au niveau application
- ✅ Vérification avant chaque opération
- ✅ Protection contre les clics multiples
- ✅ Vérification des activations récentes (fenêtre de 5 minutes)
- ✅ Logique centralisée dans les services
- ✅ Messages explicites selon le type d'opération

## Messages utilisateur

### Upgrade
> "Upgrade vers Plan Pro effectué avec succès. Votre période actuelle est conservée."

### Nouveau/Renouvellement  
> "Abonnement Plan Pro activé avec succès jusqu'au 20/12/2025."

### Protection activée
> "L'utilisateur a déjà le plan Pro actif. Aucune action nécessaire."
> "Activation récente détectée. Veuillez attendre quelques minutes avant de réessayer."

## Avantages de cette approche

1. **✅ Pas de doublons possibles** - Protection multicouche (Frontend + Backend + DB)
2. **✅ Logique claire et prévisible** - Upgrade = même période, Nouveau = nouveau cycle  
3. **✅ Respect des attentes utilisateur** - Pas de perte de temps payé
4. **✅ Protection contre erreurs humaines** - Impossible de double-cliquer et créer des doublons
5. **✅ Flexibilité** - Gestion automatique des différents cycles de facturation
6. **✅ Traçabilité** - Logs détaillés des opérations dans `billing_history`
7. **✅ Monitoring** - Vue temps réel des activations récentes

## Maintenance

Pour vérifier l'état du système :

```sql
-- Vérifier qu'il n'y a pas de doublons dans user_subscriptions
SELECT user_id, COUNT(*) 
FROM user_subscriptions 
WHERE status = 'active' 
GROUP BY user_id 
HAVING COUNT(*) > 1;
-- Doit retourner 0 résultat ✅

-- Vérifier les activations récentes dans billing_history
SELECT * FROM recent_manual_activations 
ORDER BY created_at DESC LIMIT 10;

-- Détecter les potentiels doublons d'activations (même jour)
SELECT 
  p.email,
  sp.name as plan_name,
  COUNT(*) as activation_count,
  DATE(bh.created_at) as activation_date
FROM billing_history bh
JOIN profiles p ON bh.user_id = p.id
LEFT JOIN subscription_plans sp ON bh.plan_id = sp.id
WHERE bh.payment_method = 'manual_activation'
AND bh.status = 'paid'
GROUP BY p.email, sp.name, bh.user_id, bh.plan_id, DATE(bh.created_at)
HAVING COUNT(*) > 1
ORDER BY activation_count DESC;
```

## Résolution du cas izoflores45@gmail.com

Le cas que vous avez identifié (deux activations PRO le même jour) était dû à l'absence de protection contre les activations manuelles multiples. Avec les nouvelles protections :

1. **✅ Frontend** : L'admin ne peut plus activer deux fois le même plan
2. **✅ Backend** : Le trigger empêche les insertions de doublons récents
3. **✅ Database** : Une seule subscription active possible par utilisateur

Le système est maintenant **100% protégé** contre ce type de problème ! 🛡️ 