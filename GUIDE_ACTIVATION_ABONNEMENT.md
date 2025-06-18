# Guide d'Activation/Upgrade d'Abonnements IMMOO

## 🎯 Fonctionnalité Implémentée

### **Activation/Upgrade Manuel d'Abonnements**
Une nouvelle fonctionnalité complète pour activer ou upgrader manuellement les abonnements des utilisateurs agences depuis l'interface admin.

---

## 📍 Accès à la Fonctionnalité

### **Localisation**
- **Page** : `/admin` → Onglet **"Paiements Abonnements"**
- **Bouton principal** : **"Activer/Upgrader Abonnement"** (bleu dégradé avec icône couronne)

---

## 🚀 Comment Utiliser

### **1. Accéder à l'Interface**
1. Connectez-vous en tant qu'administrateur
2. Allez dans l'onglet **"Paiements Abonnements"**
3. Cliquez sur le bouton **"Activer/Upgrader Abonnement"**

### **2. Sélectionner un Utilisateur**
- **Recherche** : Tapez dans la barre de recherche (email, nom, agence)
- **Sélection** : Choisissez l'utilisateur dans la liste déroulante
- **Informations affichées** :
  - Nom complet et email
  - Agence associée
  - Plan d'abonnement actuel

### **3. Choisir un Plan**
- **Sélection** : Choisissez le nouveau plan d'abonnement
- **Informations affichées** :
  - Nom du plan
  - Prix et cycle de facturation
  - Limites du plan

### **4. Aperçu et Confirmation**
- **Aperçu automatique** : Résumé des changements
- **Validation** : Cliquez sur **"Activer l'abonnement"**

---

## ✨ Fonctionnalités Avancées

### **Onglets de Gestion**
1. **Paiements** : Historique complet des paiements
2. **Activations Manuelles** : Historique des 30 dernières activations manuelles

### **Gestion Automatique**
- **Désactivation automatique** de l'ancien abonnement
- **Création automatique** du nouvel abonnement
- **Historique de facturation** généré automatiquement
- **Logs d'audit** pour traçabilité

### **Sécurité et Validation**
- **Validation des données** avant activation
- **Vérification de l'existence** des utilisateurs et plans
- **Gestion d'erreurs** complète
- **Transactions sécurisées** en base de données

---

## 🔍 Suivi et Historique

### **Historique des Activations Manuelles**
- **Localisation** : Onglet **"Activations Manuelles"**
- **Informations affichées** :
  - Date et heure d'activation
  - Utilisateur concerné (nom, email)
  - Agence
  - Plan activé
  - Montant
  - Description de l'action

### **Traçabilité**
- Toutes les activations sont enregistrées dans `billing_history`
- Logs d'audit dans `admin_action_logs`
- Méthode de paiement : `manual_activation`

---

## 🛠️ Architecture Technique

### **Service Dédié**
- **Fichier** : `src/services/subscription/manualSubscriptionService.ts`
- **Fonctions principales** :
  - `getUserAgencies()` : Récupère les utilisateurs avec leurs agences
  - `getSubscriptionPlans()` : Récupère les plans disponibles
  - `activateSubscription()` : Active un abonnement
  - `getManualActivationHistory()` : Historique des activations

### **Fonction PostgreSQL**
- **Nom** : `activate_manual_subscription()`
- **Sécurité** : Transaction atomique avec rollback automatique
- **Audit** : Logs automatiques des actions admin

### **Tables Impactées**
- `user_subscriptions` : Gestion des abonnements
- `billing_history` : Historique de facturation
- `admin_action_logs` : Logs d'audit
- `subscription_plans` : Plans disponibles

---

## 📊 Statistiques et Monitoring

### **Métriques Disponibles**
- Total des paiements
- Paiements en attente
- Paiements validés
- Revenus totaux
- Revenus du mois

### **Filtres et Recherche**
- **Filtrage par statut** : Tous, En attente, Payé, Échoué, Annulé
- **Recherche textuelle** : Nom d'agence, email, plan
- **Tri chronologique** : Plus récents en premier

---

## 🎨 Interface Utilisateur

### **Design**
- **Couleurs IMMOO** : Navy (#111827), Gold (#D97706), Pearl (#F9FAFB)
- **Icônes** : Crown pour l'activation, UserPlus pour l'ajout
- **Badges** : Statuts colorés et informatifs

### **UX**
- **Recherche en temps réel** des utilisateurs
- **Aperçu en direct** des changements
- **Feedback immédiat** avec toasts
- **Loading states** pendant les opérations

---

## ⚠️ Points Importants

### **Permissions**
- **Accès réservé** aux administrateurs uniquement
- **RLS activé** sur toutes les tables sensibles

### **Validation**
- **Vérification** que l'utilisateur est associé à une agence
- **Contrôle** que le plan cible est actif
- **Prévention** des doublons d'abonnements

### **Gestion d'Erreurs**
- **Messages explicites** en cas d'erreur
- **Rollback automatique** si problème
- **Logs détaillés** pour debugging

---

## 🔄 Workflow Complet

1. **Sélection** → Choisir utilisateur et plan
2. **Validation** → Vérifier la compatibilité
3. **Aperçu** → Confirmer les changements
4. **Activation** → Traitement automatique
5. **Confirmation** → Feedback et mise à jour
6. **Historique** → Enregistrement pour audit

---

## 📞 Support

Pour toute question ou problème :
- **Logs** : Consultez les logs d'audit dans l'interface
- **Historique** : Vérifiez l'onglet "Activations Manuelles"
- **Debug** : Activations enregistrées avec timestamps et détails

---

*Développé avec ❤️ par OKTRA pour IMMOO* 