# GUIDE PERSONNALISATION SOUS-DOMAINES POUR AGENCES

## 🎯 **OBJECTIF**
Permettre à chaque agence de personnaliser son sous-domaine pour avoir une URL unique comme `konaket.immoo.pro`

## 👤 **CÔTÉ AGENCE : Comment configurer son sous-domaine**

### **1. Accès aux paramètres**
1. **Connexion** : L'agence se connecte à son compte IMMOO
2. **Navigation** : Va dans son dashboard d'agence
3. **Paramètres** : Clique sur "Paramètres" ou "Settings"
4. **Section domaine** : Trouve la section "Nom de domaine personnalisé"

### **2. Configuration du sous-domaine**
```
┌─────────────────────────────────────────────────────────┐
│ Nom de domaine personnalisé                             │
├─────────────────────────────────────────────────────────┤
│ Votre nom de domaine :                                  │
│ ┌─────────────────┐                                     │
│ │ konaket         │ .immoo.pro                          │
│ └─────────────────┘                                     │
│                                                         │
│ ✅ Disponible                                           │
│                                                         │
│ Aperçu : https://konaket.immoo.pro                      │
│                                                         │
│ [Sauvegarder]  [Copier URL]  [Ouvrir]                  │
└─────────────────────────────────────────────────────────┘
```

### **3. Règles de nommage**
- **Longueur** : 3 à 50 caractères
- **Caractères autorisés** : lettres (a-z), chiffres (0-9), tirets (-)
- **Format** : Doit commencer et finir par une lettre ou un chiffre
- **Exemples valides** : `konaket`, `ali-toure`, `agency123`
- **Exemples invalides** : `-konaket`, `konaket-`, `ko`, `très-long-nom-qui-dépasse-cinquante-caractères`

### **4. Slugs réservés (non disponibles)**
Ces noms sont réservés et ne peuvent pas être utilisés :
- `www`, `api`, `admin`, `app`
- `mail`, `ftp`, `blog`, `shop`
- `support`, `help`, `docs`, `cdn`
- `static`, `assets`, `media`
- `test`, `staging`, `dev`, `demo`, `beta`, `alpha`

## 🔧 **CÔTÉ TECHNIQUE : Comment ça fonctionne**

### **1. Sauvegarde en base de données**
Quand l'agence configure son slug :
```sql
UPDATE agencies 
SET domain_slug = 'konaket' 
WHERE id = 'agency-id';
```

### **2. Vérification de disponibilité**
Le système vérifie en temps réel :
```typescript
// Vérifier si le slug est déjà pris
const isAvailable = await SubdomainService.isDomainSlugAvailable('konaket');
```

### **3. Redirection automatique**
Quand quelqu'un visite `konaket.immoo.pro` :
```typescript
// 1. Extraire le sous-domaine
const subdomain = SubdomainService.extractSubdomain('konaket.immoo.pro'); // 'konaket'

// 2. Trouver l'agence correspondante
const agency = await SubdomainService.getAgencyBySlug('konaket');

// 3. Rediriger vers la page publique
navigate(`/public-agency/${agency.id}`);
```

## 🎨 **INTERFACE UTILISATEUR**

### **A. Dans les paramètres d'agence**
Le composant `AgencyDomainSettings.tsx` affiche :
- **Input** pour saisir le nom désiré
- **Validation temps réel** (disponible/indisponible)
- **Aperçu de l'URL** finale
- **Boutons d'action** (sauvegarder, copier, ouvrir)

### **B. Feedback visuel**
- ✅ **Badge vert** : "Disponible"
- ❌ **Badge rouge** : "Indisponible"
- ⏳ **Spinner** : Vérification en cours
- 📋 **Bouton copier** : Copie l'URL dans le presse-papier

## 🌐 **EXEMPLES CONCRETS**

### **Agence "Konaket Real Estate"**
1. **Configuration** : Saisit "konaket" dans les paramètres
2. **URL générée** : `https://konaket.immoo.pro`
3. **Utilisation** : Partage cette URL avec ses clients
4. **Résultat** : Les clients arrivent directement sur la page publique de Konaket

### **Agence "Ali Touré Immobilier"**
1. **Configuration** : Saisit "ali-toure" dans les paramètres
2. **URL générée** : `https://ali-toure.immoo.pro`
3. **Marketing** : Utilise cette URL sur ses cartes de visite
4. **Résultat** : URL professionnelle et mémorable

## 📈 **AVANTAGES POUR LES AGENCES**

### **Marketing amélioré**
- ✅ **URL mémorable** : Plus facile à retenir que `/agency/12345`
- ✅ **Branding professionnel** : Chaque agence a son identité
- ✅ **Partage simplifié** : URL courte pour réseaux sociaux

### **SEO optimisé**
- ✅ **Sous-domaine indexable** par Google
- ✅ **Mots-clés dans l'URL** : Le nom de l'agence est dans l'URL
- ✅ **Autorité de domaine** : Bénéficie de l'autorité d'immoo.pro

### **Expérience client**
- ✅ **Accès direct** : Pas besoin de naviguer dans le site
- ✅ **Confiance renforcée** : URL professionnelle
- ✅ **Mémorisation facile** : Les clients retiennent l'URL

## 🔄 **PROCESSUS COMPLET**

### **1. Configuration par l'agence**
```
Agence → Paramètres → Domaine → Saisit "konaket" → Sauvegarde
```

### **2. Utilisation par les clients**
```
Client → Tape "konaket.immoo.pro" → Redirection automatique → Page publique agence
```

### **3. Gestion des changements**
- **Modification** : L'agence peut changer son slug à tout moment
- **Vérification** : Le nouveau slug doit être disponible
- **Mise à jour** : L'ancienne URL ne fonctionne plus, la nouvelle est active

## 🎉 **RÉSULTAT FINAL**

Chaque agence IMMOO peut avoir :
- ✅ **Son propre sous-domaine** : `agence.immoo.pro`
- ✅ **Configuration simple** : Interface intuitive
- ✅ **Validation automatique** : Pas d'erreurs possibles
- ✅ **Redirection transparente** : Fonctionne automatiquement
- ✅ **URL professionnelle** : Pour marketing et communication

**Le système est prêt et fonctionnel !** 🚀
