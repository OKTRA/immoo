# Guide : Codes Promo et Méthodes de Paiement

## Vue d'ensemble

Le système d'activation/upgrade d'abonnements a été enrichi avec :
- **Gestion des codes promo** avec réductions pourcentage ou montant fixe
- **Méthodes de paiement** multiples (CinetPay, Orange Money, virement, espèces, etc.)
- **Validation en temps réel** des codes promo
- **Historique complet** des activations avec détails des réductions

## Fonctionnalités Codes Promo

### Types de Réduction
1. **Pourcentage** : Réduction en % du montant total
2. **Montant fixe** : Réduction d'un montant en FCFA

### Codes Promo Disponibles
- `WELCOME20` : 20% de réduction (max 10,000 FCFA) pour nouveaux clients
- `SAVE5000` : Réduction fixe de 5,000 FCFA (min 10,000 FCFA)
- `VIP30` : 30% de réduction VIP (max 20,000 FCFA)
- `LAUNCH50` : 50% de réduction lancement (max 15,000 FCFA)
- `STUDENT15` : 15% de réduction étudiant (max 5,000 FCFA)

### Contraintes et Limites
- **Limite d'utilisation** : Nombre total et par utilisateur
- **Montant minimum** : Commande minimum requise
- **Dates de validité** : Période d'activation
- **Plans applicables** : Restriction par plan d'abonnement
- **Utilisation unique** : Un code par utilisateur par défaut

## Méthodes de Paiement

### Méthodes Disponibles
1. **Activation Manuelle** : Par l'administrateur
2. **CinetPay** : Cartes bancaires et mobile money
3. **Orange Money Mali** : Paiement mobile Orange
4. **Virement Bancaire** : Transfert direct
5. **Espèces** : Paiement en liquide

### Frais de Traitement
Chaque méthode peut avoir des frais :
- **Pourcentage** : % du montant
- **Montant fixe** : Frais fixes en FCFA

## Utilisation dans l'Interface Admin

### Étapes d'Activation avec Code Promo

1. **Sélectionner l'utilisateur**
   - Recherche par email, nom ou agence
   - Voir le plan actuel

2. **Choisir le nouveau plan**
   - Plans disponibles avec prix
   - Comparaison automatique

3. **Sélectionner la méthode de paiement**
   - Méthodes actives uniquement
   - Frais affichés si applicables

4. **Appliquer un code promo (optionnel)**
   - Saisir le code en majuscules
   - Validation en temps réel
   - Affichage de la réduction

5. **Ajouter une note admin (optionnelle)**
   - Contexte de l'activation
   - Raison du changement

6. **Aperçu final**
   - Prix original
   - Réduction appliquée
   - Prix final
   - Détails complets

### Validation des Codes Promo

La validation vérifie :
- ✅ Code existe et actif
- ✅ Dans la période de validité
- ✅ Limite d'utilisation non atteinte
- ✅ Plan applicable
- ✅ Montant minimum respecté
- ✅ Utilisateur peut utiliser le code

### Messages d'Erreur Courants

- **Code invalide** : Code inexistant ou inactif
- **Code expiré** : Hors période de validité
- **Limite atteinte** : Trop d'utilisations
- **Montant insuffisant** : En dessous du minimum
- **Plan non applicable** : Code non valide pour ce plan
- **Déjà utilisé** : Utilisateur a déjà utilisé ce code

## Architecture Technique

### Tables de Base de Données

#### `promo_codes`
```sql
- id (UUID)
- code (VARCHAR) - Code unique
- name (VARCHAR) - Nom descriptif
- discount_type (percentage|fixed_amount)
- discount_value (NUMERIC)
- max_discount_amount (NUMERIC) - Limite pour %
- min_order_amount (NUMERIC) - Minimum requis
- usage_limit (INTEGER) - Limite totale
- usage_count (INTEGER) - Utilisations actuelles
- user_usage_limit (INTEGER) - Par utilisateur
- valid_from/valid_until (TIMESTAMP)
- is_active (BOOLEAN)
- applicable_plans (UUID[]) - Plans autorisés
```

#### `payment_methods`
```sql
- id (UUID)
- name (VARCHAR) - Nom affiché
- code (VARCHAR) - Code unique
- description (TEXT)
- is_active (BOOLEAN)
- requires_verification (BOOLEAN)
- processing_fee_percentage (NUMERIC)
- processing_fee_fixed (NUMERIC)
```

#### `promo_code_usage`
```sql
- id (UUID)
- promo_code_id (UUID)
- user_id (UUID)
- order_amount (NUMERIC)
- discount_amount (NUMERIC)
- used_at (TIMESTAMP)
- billing_history_id (UUID)
```

### Fonctions RPC

#### `validate_promo_code()`
Valide un code promo pour un utilisateur et commande spécifiques.

**Paramètres :**
- `p_code` : Code promo
- `p_user_id` : ID utilisateur
- `p_plan_id` : ID plan
- `p_amount` : Montant original

**Retour :**
```json
{
  "valid": true,
  "promo_code_id": "uuid",
  "discount_type": "percentage",
  "discount_value": 20,
  "discount_amount": 5000,
  "final_amount": 20000,
  "promo_name": "Bienvenue 20%",
  "description": "Réduction pour nouveaux clients"
}
```

#### `activate_subscription_with_promo()`
Active un abonnement avec support complet des codes promo.

**Fonctionnalités :**
- Transaction atomique
- Validation automatique du code promo
- Mise à jour des compteurs d'utilisation
- Historique complet
- Logs administratifs

## Exemples d'Usage

### Activation avec Code Promo
```typescript
// Validation du code
const validation = await ManualSubscriptionService.validatePromoCode(
  'WELCOME20', 
  userId, 
  planId, 
  25000
);

if (validation.valid) {
  // Activation avec réduction
  await ManualSubscriptionService.activateSubscription({
    userId: 'user-uuid',
    planId: 'plan-uuid',
    paymentMethodId: 'method-uuid',
    promoCode: 'WELCOME20',
    adminNote: 'Activation avec code de bienvenue'
  });
}
```

### Création de Nouveau Code Promo
```typescript
await ManualSubscriptionService.createPromoCode({
  code: 'SPECIAL30',
  name: 'Offre Spéciale 30%',
  description: 'Réduction spéciale limitée',
  discount_type: 'percentage',
  discount_value: 30,
  max_discount_amount: 15000,
  min_order_amount: 20000,
  usage_limit: 100,
  user_usage_limit: 1,
  valid_from: '2024-01-01',
  valid_until: '2024-12-31',
  is_active: true,
  applicable_plans: ['plan-uuid-1', 'plan-uuid-2']
});
```

## Sécurité et Contrôles

### Row Level Security (RLS)
- **Codes promo** : Lecture publique, modification admin uniquement
- **Méthodes de paiement** : Lecture publique, modification admin
- **Historique d'utilisation** : Utilisateurs voient leurs propres données

### Validation Stricte
- Codes promo uniques et case-insensitive
- Vérification des dates et limites
- Contrôle des montants minimum/maximum
- Audit trail complet

### Logs et Traçabilité
- Toutes les activations sont loggées
- Métadonnées complètes (montants, réductions, codes)
- Historique d'utilisation des codes promo
- Actions administratives tracées

## Maintenance et Administration

### Surveillance des Codes Promo
```sql
-- Codes promo populaires
SELECT code, name, usage_count, usage_limit 
FROM promo_codes 
WHERE is_active = true 
ORDER BY usage_count DESC;

-- Utilisations récentes
SELECT pc.code, p.email, pcu.discount_amount, pcu.used_at
FROM promo_code_usage pcu
JOIN promo_codes pc ON pcu.promo_code_id = pc.id
JOIN profiles p ON pcu.user_id = p.id
ORDER BY pcu.used_at DESC
LIMIT 50;
```

### Gestion des Limites
- Surveiller les codes promo approchant leurs limites
- Désactiver les codes expirés automatiquement
- Analyser l'efficacité des campagnes promotionnelles

## Évolutions Futures

### Fonctionnalités Prévues
- **Codes promo dynamiques** : Génération automatique
- **Campagnes promotionnelles** : Gestion par période
- **Codes promo personnalisés** : Par segment utilisateur
- **Analytics avancés** : ROI des campagnes
- **API publique** : Validation côté client

### Intégrations Possibles
- **Email marketing** : Envoi automatique de codes
- **CRM** : Synchronisation des campagnes
- **Analytics** : Tracking des conversions
- **Notifications** : Alertes sur utilisation

---

*Guide mis à jour le : Janvier 2025*
*Version : 2.0 - Codes Promo et Méthodes de Paiement* 