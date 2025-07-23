# Éditeur WYSIWYG de Contrats - Documentation

## 🎯 Vue d'ensemble

L'éditeur WYSIWYG de contrats est un outil moderne et professionnel permettant de créer, modifier et gérer des contrats immobiliers avec une interface intuitive et des fonctionnalités avancées.

## ✨ Fonctionnalités principales

### 📝 Édition riche
- **Formatage de texte** : Gras, italique, souligné, barré
- **Alignement** : Gauche, centre, droite, justifié
- **Listes** : À puces et numérotées
- **Titres** : H1, H2, H3
- **Citations** : Blocs de citation stylisés
- **Code** : Blocs de code et code en ligne
- **Tableaux** : Création et édition de tableaux
- **Liens** : Insertion et gestion de liens
- **Images** : Insertion d'images
- **Historique** : Annuler/Rétablir

### 🏢 Gestion des contrats
- **Création** : Nouveaux contrats avec métadonnées
- **Édition** : Modification du contenu et des propriétés
- **Validation** : Workflow de validation des contrats
- **Signature** : Marquage des contrats comme signés
- **Archivage** : Conservation des contrats signés
- **Attribution** : Liaison avec les baux existants

### 📊 Métadonnées
- **Titre** : Nom du contrat
- **Type** : Bail, vente, mandat, prestation, autre
- **Juridiction** : Pays/région applicable
- **Statut** : Brouillon, validé, signé, archivé
- **Parties** : Informations JSON des parties impliquées
- **Détails** : Données spécifiques au contrat

### 🔗 Intégration avec les baux
- **Attribution** : Lier un contrat à un bail existant
- **Informations** : Affichage des détails du bail associé
- **Gestion** : Modification des associations

## 🚀 Utilisation

### Accès à l'éditeur

1. **Via la navigation principale** :
   ```
   /contracts → Liste des contrats
   /contracts/new → Nouveau contrat
   /contracts/:id → Éditer un contrat
   ```

2. **Via l'espace agence** :
   ```
   /agencies/:agencyId/contracts → Contrats de l'agence
   /agencies/:agencyId/contracts/create → Nouveau contrat
   /agencies/:agencyId/contracts/:id → Éditer un contrat
   ```

### Création d'un nouveau contrat

1. Cliquer sur "Nouveau contrat"
2. Remplir les métadonnées :
   - Titre du contrat
   - Type de contrat
   - Juridiction applicable
   - Parties impliquées (JSON)
   - Détails spécifiques (JSON)
3. Utiliser l'éditeur WYSIWYG pour rédiger le contenu
4. Sauvegarder le contrat

### Édition d'un contrat existant

1. Sélectionner le contrat dans la liste
2. Cliquer sur "Modifier"
3. Utiliser l'éditeur pour modifier le contenu
4. Mettre à jour les métadonnées si nécessaire
5. Sauvegarder les modifications

### Workflow de validation

1. **Brouillon** : Contrat en cours de rédaction
2. **Validation** : Contrat vérifié et approuvé
3. **Signature** : Contrat signé par les parties
4. **Archivage** : Contrat conservé pour référence

### Attribution à un bail

1. Dans l'éditeur, cliquer sur "Attribuer à un bail"
2. Sélectionner le bail dans la liste
3. Confirmer l'attribution
4. Le contrat est maintenant lié au bail

## 🛠️ Composants techniques

### ContractWysiwygEditor
Composant principal de l'éditeur WYSIWYG basé sur TipTap.

**Props :**
- `initialContent` : Contenu initial du contrat
- `contractId` : ID du contrat (pour l'édition)
- `onSave` : Callback de sauvegarde
- `onAssignToLease` : Callback d'attribution à un bail
- `availableLeases` : Liste des baux disponibles
- `isReadOnly` : Mode lecture seule
- `showToolbar` : Affichage de la barre d'outils

### ContractEditorPage
Page principale pour l'édition de contrats.

**Fonctionnalités :**
- Gestion des états (nouveau/édition)
- Sauvegarde automatique
- Actions contextuelles (valider, signer, archiver)
- Navigation entre contrats

### ContractsListPage
Page de liste des contrats avec filtres et actions.

**Fonctionnalités :**
- Affichage en tableau
- Filtres par statut et type
- Recherche textuelle
- Actions en lot

### ContractWysiwygService
Service pour la gestion des contrats.

**Méthodes principales :**
- `createContract()` : Créer un nouveau contrat
- `updateContract()` : Mettre à jour un contrat
- `getContractById()` : Récupérer un contrat
- `getContractsByAgency()` : Liste des contrats d'une agence
- `assignContractToLease()` : Attribuer à un bail
- `validateContract()` : Valider un contrat
- `signContract()` : Signer un contrat
- `archiveContract()` : Archiver un contrat

## 📁 Structure des fichiers

```
src/
├── components/
│   └── contracts/
│       ├── ContractWysiwygEditor.tsx    # Éditeur principal
│       ├── ContractNavigation.tsx       # Navigation
│       ├── ContractPreview.tsx          # Aperçu des contrats
│       └── ContractEditor.css           # Styles CSS
├── pages/
│   └── contracts/
│       ├── ContractEditorPage.tsx       # Page d'édition
│       └── ContractsListPage.tsx        # Page de liste
├── services/
│   └── contracts/
│       └── contractWysiwygService.ts    # Service de gestion
└── routes/
    └── App.tsx                          # Routes de l'application
```

## 🎨 Personnalisation

### Styles CSS
Les styles sont définis dans `ContractEditor.css` et peuvent être personnalisés :

- Couleurs et thèmes
- Disposition des éléments
- Responsive design
- Animations et transitions

### Extensions TipTap
L'éditeur utilise TipTap avec les extensions suivantes :

- **StarterKit** : Fonctionnalités de base
- **Placeholder** : Texte d'aide
- **TextAlign** : Alignement du texte
- **Table** : Création de tableaux
- **Link** : Gestion des liens
- **Image** : Insertion d'images
- **Color** : Couleurs de texte
- **Highlight** : Surlignage
- **CodeBlock** : Blocs de code
- **TaskList** : Listes de tâches
- **Typography** : Typographie avancée

### Ajout d'extensions
Pour ajouter de nouvelles fonctionnalités :

1. Installer l'extension TipTap
2. L'importer dans `ContractWysiwygEditor.tsx`
3. L'ajouter à la configuration de l'éditeur
4. Ajouter les boutons correspondants dans la barre d'outils

## 🔒 Sécurité et permissions

### Contrôle d'accès
- **Lecture** : Tous les utilisateurs de l'agence
- **Création** : Membres de l'agence
- **Modification** : Contrats en brouillon ou validés
- **Suppression** : Contrats non signés
- **Archivage** : Contrats signés

### Validation des données
- Vérification des métadonnées JSON
- Validation des types de contrats
- Contrôle des permissions par agence
- Protection contre les injections

## 📱 Responsive design

L'éditeur s'adapte automatiquement aux différentes tailles d'écran :

- **Desktop** : Interface complète avec toutes les fonctionnalités
- **Tablet** : Barre d'outils adaptée
- **Mobile** : Interface simplifiée avec navigation tactile

## 🚀 Performance

### Optimisations
- **Lazy loading** : Chargement à la demande
- **Debouncing** : Sauvegarde automatique optimisée
- **Memoization** : Composants optimisés
- **Virtual scrolling** : Liste de contrats performante

### Monitoring
- Temps de chargement des contrats
- Performance de l'éditeur
- Utilisation mémoire
- Erreurs et exceptions

## 🔧 Configuration

### Variables d'environnement
```env
# URL de l'API Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Configuration de l'éditeur
VITE_EDITOR_AUTO_SAVE=true
VITE_EDITOR_AUTO_SAVE_INTERVAL=30000
```

### Configuration de l'éditeur
```typescript
const editorConfig = {
  autoSave: true,
  autoSaveInterval: 30000,
  placeholder: 'Commencez à rédiger votre contrat...',
  maxContentLength: 100000,
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],
  maxFileSize: 5 * 1024 * 1024 // 5MB
};
```

## 🐛 Dépannage

### Problèmes courants

1. **L'éditeur ne se charge pas**
   - Vérifier les dépendances TipTap
   - Contrôler la console pour les erreurs
   - Vérifier les permissions utilisateur

2. **Sauvegarde échoue**
   - Vérifier la connexion réseau
   - Contrôler les permissions de base de données
   - Vérifier la validité des données

3. **Performance lente**
   - Réduire la taille du contenu
   - Désactiver les extensions inutilisées
   - Optimiser les requêtes de base de données

### Logs et debugging
```typescript
// Activer les logs de debug
localStorage.setItem('contract-editor-debug', 'true');

// Voir les logs dans la console
console.log('Contract Editor Debug:', {
  content: editor.getHTML(),
  metadata: contractMetadata,
  performance: performance.now()
});
```

## 📈 Évolutions futures

### Fonctionnalités prévues
- **Collaboration en temps réel** : Édition simultanée
- **Templates de contrats** : Modèles prédéfinis
- **Signature électronique** : Intégration de signatures
- **Versioning** : Historique des versions
- **Export avancé** : PDF, Word, HTML
- **IA assistée** : Suggestions de contenu

### Améliorations techniques
- **PWA** : Application web progressive
- **Offline** : Édition hors ligne
- **Sync** : Synchronisation automatique
- **API REST** : Interface programmatique
- **Webhooks** : Notifications en temps réel

## 📞 Support

Pour toute question ou problème :

1. **Documentation** : Consulter cette documentation
2. **Issues** : Créer une issue sur GitHub
3. **Support** : Contacter l'équipe technique
4. **Communauté** : Forum de discussion

---

*Dernière mise à jour : 2025-01-23* 