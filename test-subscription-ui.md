# 🧪 Tests Manuel - Interface Utilisateur des Abonnements

## 📋 Checklist des Tests UI

### ✅ Tests à effectuer étape par étape

---

## 🏠 1. PAGE D'ACCUEIL / PRICING

### Test 1.1 : Affichage des plans
- [ ] **Aller sur** `/pricing`
- [ ] **Vérifier** que tous les plans s'affichent correctement
- [ ] **Vérifier** les prix en XOF
- [ ] **Vérifier** l'affichage des limites (Illimité = ∞ ou "Illimité")
- [ ] **Vérifier** les boutons "Choisir ce plan"

**Résultat attendu :** 
```
✅ Plans visibles avec limites claires
✅ Prix en XOF affichés
✅ Limites illimitées marquées "Illimité"
```

### Test 1.2 : Sélection de plan
- [ ] **Cliquer** sur un plan premium
- [ ] **Vérifier** redirection vers paiement ou activation
- [ ] **Vérifier** les informations du plan sélectionné

---

## 👤 2. ESPACE UTILISATEUR CONNECTÉ

### Test 2.1 : Affichage de l'abonnement actuel
- [ ] **Se connecter** avec un compte
- [ ] **Aller sur** `/agencies` ou `/profile`
- [ ] **Vérifier** l'affichage du plan actuel
- [ ] **Vérifier** les limites affichées : "X/Y utilisées"

**Exemple attendu :**
```
Plan Gratuit - 1/1 agences utilisées
Plan Premium - 3/10 propriétés utilisées
Plan Enterprise - 15 (illimité) baux
```

### Test 2.2 : Compteurs en temps réel
- [ ] **Noter** les compteurs actuels
- [ ] **Créer** une nouvelle ressource (agence/propriété)
- [ ] **Vérifier** que les compteurs se mettent à jour
- [ ] **Rafraîchir** la page
- [ ] **Vérifier** persistance des compteurs

---

## 🏢 3. GESTION DES AGENCES

### Test 3.1 : Création dans les limites
- [ ] **Aller sur** `/agencies`
- [ ] **Noter** le compteur : "X/Y agences"
- [ ] **Si X < Y** : cliquer "Créer une agence"
- [ ] **Vérifier** que la création fonctionne
- [ ] **Vérifier** mise à jour du compteur

### Test 3.2 : Limite atteinte
- [ ] **Créer** des agences jusqu'à la limite
- [ ] **Vérifier** que le bouton devient grisé/désactivé
- [ ] **Vérifier** l'affichage de `LimitWarning`
- [ ] **Vérifier** le message d'upgrade

**Alerte attendue :**
```
⚠️ Limite atteinte!
Vous avez utilisé 3/3 agences.
Passez à un plan supérieur pour continuer.
[Passer Premium]
```

### Test 3.3 : Plan illimité
- [ ] **Activer** un plan avec agences illimitées
- [ ] **Créer** plus d'agences que la limite normale
- [ ] **Vérifier** affichage "X (illimité)"
- [ ] **Vérifier** aucune limite bloquante

---

## 🏠 4. GESTION DES PROPRIÉTÉS

### Test 4.1 : Propriétés par agence
- [ ] **Entrer** dans une agence
- [ ] **Aller** sur l'onglet propriétés
- [ ] **Vérifier** le compteur spécifique à l'agence
- [ ] **Créer** une propriété
- [ ] **Vérifier** mise à jour du compteur

### Test 4.2 : Limite globale vs par agence
- [ ] **Créer** des propriétés dans différentes agences
- [ ] **Vérifier** que la limite globale est respectée
- [ ] **Tester** la répartition entre agences

---

## 📄 5. GESTION DES BAUX

### Test 5.1 : Création de baux
- [ ] **Aller** dans une propriété
- [ ] **Créer** des baux jusqu'à la limite
- [ ] **Vérifier** les alertes de limite

### Test 5.2 : Limite par propriété
- [ ] **Vérifier** si la limite s'applique par propriété ou globalement
- [ ] **Tester** avec plusieurs propriétés

---

## 👥 6. GESTION DES UTILISATEURS

### Test 6.1 : Ajout d'utilisateurs
- [ ] **Aller** dans les paramètres d'agence
- [ ] **Inviter** des utilisateurs
- [ ] **Vérifier** la limite d'utilisateurs par agence
- [ ] **Tester** les permissions selon le plan

---

## 🔄 7. UPGRADE DE PLAN

### Test 7.1 : Processus d'upgrade
- [ ] **Cliquer** sur "Passer Premium" depuis une alerte
- [ ] **Vérifier** redirection vers `/pricing`
- [ ] **Sélectionner** un plan supérieur
- [ ] **Compléter** le paiement (mode test)

### Test 7.2 : Après upgrade
- [ ] **Vérifier** le nouveau plan affiché
- [ ] **Vérifier** les nouvelles limites
- [ ] **Tester** création de nouvelles ressources
- [ ] **Vérifier** persistance après reconnexion

---

## ⚠️ 8. TESTS D'ERREUR ET CAS LIMITES

### Test 8.1 : Connexion lente
- [ ] **Simuler** une connexion lente (DevTools)
- [ ] **Vérifier** les états de chargement
- [ ] **Vérifier** que les limites se chargent correctement

### Test 8.2 : Données corrompues
- [ ] **Modifier** directement la base de données
- [ ] **Mettre** des valeurs négatives (sauf -1)
- [ ] **Vérifier** la gestion d'erreur

### Test 8.3 : JavaScript désactivé
- [ ] **Désactiver** JavaScript
- [ ] **Vérifier** les fallbacks
- [ ] **Vérifier** les messages d'erreur appropriés

---

## 📱 9. TESTS RESPONSIVE

### Test 9.1 : Mobile
- [ ] **Passer** en vue mobile (DevTools)
- [ ] **Vérifier** l'affichage des compteurs
- [ ] **Vérifier** les alertes de limite
- [ ] **Tester** la création de ressources

### Test 9.2 : Tablette
- [ ] **Tester** en format tablette
- [ ] **Vérifier** les tableaux de limites
- [ ] **Vérifier** les dialogs d'upgrade

---

## 🎨 10. TESTS VISUELS

### Test 10.1 : Thème sombre/clair
- [ ] **Basculer** entre thèmes
- [ ] **Vérifier** les couleurs des alertes
- [ ] **Vérifier** la lisibilité des compteurs

### Test 10.2 : Couleurs d'état
- [ ] **Vérifier** : Vert = OK (< 80%)
- [ ] **Vérifier** : Orange = Attention (80-99%)
- [ ] **Vérifier** : Rouge = Limite (100%)
- [ ] **Vérifier** : Bleu/Vert = Illimité

---

## 🔧 11. TESTS ADMIN

### Test 11.1 : Interface admin
- [ ] **Se connecter** en tant qu'admin
- [ ] **Aller** sur `/admin`
- [ ] **Modifier** les limites d'un plan
- [ ] **Vérifier** impact sur les utilisateurs

### Test 11.2 : Activation manuelle
- [ ] **Utiliser** l'interface d'activation manuelle
- [ ] **Tester** les codes promo
- [ ] **Vérifier** les doublons prévenus

---

## 📊 12. TESTS DE PERFORMANCE

### Test 12.1 : Chargement des limites
- [ ] **Mesurer** le temps de chargement des limites
- [ ] **Vérifier** < 2 secondes
- [ ] **Tester** avec beaucoup de ressources

### Test 12.2 : Mise à jour en temps réel
- [ ] **Créer** plusieurs ressources rapidement
- [ ] **Vérifier** que les compteurs suivent
- [ ] **Pas** de désynchronisation

---

## ✅ VALIDATION FINALE

### Checklist de validation globale

- [ ] **Tous les plans** s'affichent correctement
- [ ] **Limites numériques** fonctionnent (1, 5, 10, etc.)
- [ ] **Limites illimitées** fonctionnent (-1 → "Illimité")
- [ ] **Compteurs** se mettent à jour en temps réel
- [ ] **Alertes** s'affichent aux bons moments
- [ ] **Boutons** se désactivent quand limite atteinte
- [ ] **Upgrade** fonctionne et met à jour les limites
- [ ] **Mobile** responsive
- [ ] **Thèmes** fonctionnent
- [ ] **Performance** acceptable

---

## 🐛 RAPPORT DE BUGS

### Format de rapport :

```markdown
**Bug #X :** [Titre court]

**Page :** /agencies
**Navigateur :** Chrome 120
**Appareil :** Desktop
**Plan testé :** Premium

**Étapes :**
1. Aller sur /agencies
2. Créer 3 agences
3. Compteur reste à 2/5

**Attendu :** Compteur à 3/5
**Obtenu :** Compteur reste à 2/5
**Impact :** Moyen

**Capture :** [screenshot]
```

---

## 🎯 CRITÈRES DE RÉUSSITE

### ✅ Tests réussis si :

1. **Fonctionnalité** : Toutes les limites sont respectées
2. **UX** : Interface claire et intuitive  
3. **Performance** : Chargement < 2 secondes
4. **Responsive** : Fonctionne sur mobile/tablette
5. **Robustesse** : Gère les erreurs proprement
6. **Accessibilité** : Lisible et utilisable

### ❌ Tests échoués si :

1. Possible de dépasser les limites
2. Compteurs incorrects ou non synchronisés
3. Interface cassée sur mobile
4. Erreurs JavaScript non gérées
5. Plans illimités ne fonctionnent pas
6. Upgrade ne met pas à jour les limites

---

**⏰ Temps estimé pour tous les tests :** 2-3 heures
**👥 Testeurs recommandés :** 2 personnes minimum  
**🔄 Fréquence :** Avant chaque déploiement majeur 