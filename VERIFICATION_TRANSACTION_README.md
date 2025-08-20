# 🔄 Vérification de Transaction en Temps Réel - IMMOO

## 📋 Vue d'ensemble

Cette fonctionnalité implémente une vérification de transaction Mobile Money en temps réel avec un timeout de 5 minutes maximum, utilisant l'edge function Supabase `verify-transaction`.

## 🚀 Fonctionnalités

### ✅ Vérification en Temps Réel
- **Écoute continue** de la base de données pendant 5 minutes maximum
- **Polling automatique** toutes les 2 secondes
- **Timeout intelligent** avec gestion des retry
- **Fallback automatique** vers la méthode Muana Pay standard

### 🔧 Modes de Vérification
1. **`realtime_listening`** : Vérification en temps réel avec écoute de la DB
2. **`standard`** : Vérification classique (fallback)

### 📱 Interface Utilisateur
- **Indicateur visuel** du statut de vérification
- **Barre de progression** pour le timeout
- **Messages d'état** clairs et informatifs
- **Bouton de réessai** en cas de timeout

## 🏗️ Architecture

### Edge Function (`verify-transaction`)
```typescript
// Endpoint principal
POST /functions/v1/verify-transaction

// Paramètres
{
  user_id: string,
  plan_id: string,
  plan_name: string,
  amount_cents: number,
  payment_reference: string,
  sender_number: string,
  verification_mode: 'realtime_listening' | 'standard'
}
```

### Processus de Vérification
1. **Création** d'une transaction en attente
2. **Écoute** de la base de données pendant 5 minutes
3. **Détection** automatique des transactions correspondantes
4. **Mise à jour** du plan utilisateur en cas de succès
5. **Gestion** des timeouts et erreurs

## 📊 Configuration

### Timeouts
```typescript
const VERIFICATION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const POLLING_INTERVAL_MS = 2000; // 2 secondes
```

### Base de Données
- **Table `transactions`** : Stockage des transactions en attente
- **Table `profiles`** : Mise à jour des plans utilisateur
- **Table `subscription_plans`** : Récupération des informations de plan

## 🎯 Utilisation

### 1. Dans la Page de Pricing
```typescript
// Démarrage de la vérification en temps réel
const { data, error } = await supabase.functions.invoke('verify-transaction', {
  body: {
    user_id: userId,
    plan_id: selectedPlan.id,
    plan_name: selectedPlan.name,
    amount_cents: selectedPlan.price,
    payment_reference: paymentRef.trim(),
    sender_number: senderNumber.trim(),
    verification_mode: 'realtime_listening'
  }
});
```

### 2. Gestion des Réponses
```typescript
if (data.success) {
  // ✅ Succès - transaction vérifiée
  toast.success('Paiement vérifié et abonnement activé !');
} else if (data.timeout_reached) {
  // ⏰ Timeout - proposer de réessayer
  toast.warning('Vérification expirée - veuillez réessayer');
} else {
  // ❌ Erreur - fallback vers Muana Pay
  // ... logique de fallback
}
```

## 🔄 Flux de Vérification

```
1. Utilisateur saisit numéro d'envoi + référence
   ↓
2. Démarrage vérification en temps réel
   ↓
3. Création transaction en attente (status: 'pending')
   ↓
4. Boucle d'écoute (5 min max, polling 2s)
   ↓
5. Détection transaction correspondante ?
   ├─ OUI → Mise à jour plan + Succès ✅
   └─ NON → Timeout + Options de retry ⏰
```

## 🧪 Tests

### Fichier de Test
- **`test-verification.html`** : Interface de test complète
- **Test des deux modes** : temps réel et standard
- **Validation des réponses** : succès, timeout, erreur

### Test Manuel
1. Ouvrir `test-verification.html` dans un navigateur
2. Remplir les champs avec des valeurs de test
3. Sélectionner le mode `realtime_listening`
4. Cliquer sur "Tester la vérification"
5. Observer la réponse et le comportement

## 🚨 Gestion des Erreurs

### Types d'Erreurs
- **Timeout** : Vérification expirée après 5 minutes
- **Erreur de base** : Problème de création/requête
- **Erreur de plan** : Plan introuvable ou inactif
- **Erreur d'utilisateur** : Profil utilisateur invalide

### Stratégies de Récupération
1. **Fallback automatique** vers Muana Pay standard
2. **Bouton de réessai** en cas de timeout
3. **Messages d'aide** pour guider l'utilisateur
4. **Logs détaillés** pour le débogage

## 🔧 Déploiement

### Edge Function
```bash
cd supabase
npx supabase functions deploy verify-transaction
```

### Variables d'Environnement
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📈 Monitoring

### Logs
- **Console** : Logs détaillés des opérations
- **Supabase Dashboard** : Logs des edge functions
- **Erreurs** : Capture et reporting des erreurs

### Métriques
- **Temps de vérification** : Durée moyenne des vérifications
- **Taux de succès** : Pourcentage de vérifications réussies
- **Timeouts** : Nombre de vérifications expirées

## 🔮 Améliorations Futures

### Fonctionnalités
- [ ] **WebSocket** pour notifications en temps réel
- [ ] **Retry intelligent** avec backoff exponentiel
- [ ] **Cache Redis** pour améliorer les performances
- [ ] **Analytics** détaillés des vérifications

### Optimisations
- [ ] **Pooling de connexions** à la base de données
- [ ] **Compression** des réponses
- [ ] **Rate limiting** pour éviter les abus
- [ ] **Monitoring** en temps réel

## 📚 Références

- **Supabase Edge Functions** : [Documentation officielle](https://supabase.com/docs/guides/functions)
- **Muana Pay SDK** : [Documentation du SDK](https://docs.muana.com)
- **Mobile Money** : [Standards de paiement](https://www.gsma.com/mobilemoney)

## 🤝 Support

Pour toute question ou problème :
1. Vérifier les logs de l'edge function
2. Consulter la documentation Supabase
3. Tester avec `test-verification.html`
4. Contacter l'équipe de développement

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Auteur** : Équipe IMMOO
