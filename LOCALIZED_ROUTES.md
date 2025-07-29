# Système de Routes Localisées - IMMOO

## Vue d'ensemble

Le système de routes localisées d'IMMOO permet d'avoir des URLs spécifiques à chaque langue, avec une détection automatique de la langue du navigateur.

## Fonctionnement

### Structure des URLs

- **Français (langue par défaut)** : Pas de préfixe
  - `/` → Page d'accueil
  - `/pricing` → Page de tarification
  - `/browse-agencies` → Page des agences

- **Anglais** : Préfixe `/en`
  - `/en` → Page d'accueil (anglais)
  - `/en/pricing` → Page de tarification (anglais)
  - `/en/browse-agencies` → Page des agences (anglais)

### Détection automatique

1. **Première visite** : Le système détecte la langue du navigateur
2. **Redirection automatique** : L'utilisateur est redirigé vers la version localisée
3. **Préférence sauvegardée** : La langue choisie est sauvegardée dans localStorage

### Changement de langue

- **Via le sélecteur de langue** : Met à jour l'URL automatiquement
- **Navigation directe** : Les URLs `/en/*` changent automatiquement la langue

## Composants principaux

### 1. `LanguageRedirect`
- Gère les redirections automatiques
- Détecte la langue depuis l'URL
- Redirige vers la bonne version localisée

### 2. `useLocalizedNavigation` Hook
```typescript
const {
  navigateToLocalized,
  changeLanguageAndNavigate,
  getPathWithLanguage,
  getPathWithoutLanguage,
  currentPathWithoutLanguage
} = useLocalizedNavigation();
```

### 3. `useTranslation` Hook (mis à jour)
- Inclut maintenant la gestion des URLs
- Met à jour automatiquement l'URL lors du changement de langue

## Utilisation

### Navigation programmatique
```typescript
import { useLocalizedNavigation } from '@/hooks/useLocalizedNavigation';

const { navigateToLocalized } = useLocalizedNavigation();

// Naviguer vers une route localisée
navigateToLocalized('/pricing', 'en'); // → /en/pricing
navigateToLocalized('/pricing', 'fr'); // → /pricing
```

### Changement de langue
```typescript
import { useTranslation } from '@/hooks/useTranslation';

const { changeLanguage } = useTranslation();

// Change la langue et met à jour l'URL
changeLanguage('en'); // Met à jour l'URL automatiquement
```

## Configuration

### Langues supportées
```typescript
export const SUPPORTED_LANGUAGES = {
  fr: {
    name: 'Français',
    flag: '🇫🇷',
    dir: 'ltr'
  },
  en: {
    name: 'English',
    flag: '🇺🇸',
    dir: 'ltr'
  }
};
```

### Détection de la langue du navigateur
```typescript
const getBrowserLanguage = (): SupportedLanguage => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'fr';
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  if (langCode === 'en') {
    return 'en';
  }
  return 'fr'; // Par défaut
};
```

## Routes disponibles

### Routes publiques
- `/` et `/en` → Page d'accueil
- `/browse-agencies` et `/en/browse-agencies` → Parcourir les agences
- `/pricing` et `/en/pricing` → Tarification
- `/search` et `/en/search` → Recherche
- `/auth` et `/en/auth` → Authentification

### Routes d'agence
- `/agencies/:id` et `/en/agencies/:id` → Dashboard d'agence
- `/agencies/:id/properties` et `/en/agencies/:id/properties` → Propriétés
- `/agencies/:id/tenants` et `/en/agencies/:id/tenants` → Locataires
- Et toutes les autres routes d'agence...

## Test

### Page de test
Visitez `/i18n-test` ou `/en/i18n-test` pour tester :
- Changement de langue
- Navigation entre routes localisées
- Détection automatique

### Test manuel
1. Changez la langue de votre navigateur
2. Rechargez la page
3. Vérifiez que vous êtes redirigé vers la bonne version
4. Testez les liens de navigation

## Ajout de nouvelles langues

1. Ajouter la langue dans `SUPPORTED_LANGUAGES`
2. Créer le fichier de traduction `src/i18n/locales/[lang].json`
3. Ajouter les routes dans `App.tsx`
4. Mettre à jour la fonction `getBrowserLanguage`

## Bonnes pratiques

1. **Toujours utiliser les hooks** : `useTranslation` et `useLocalizedNavigation`
2. **Ne pas hardcoder les URLs** : Utiliser `navigateToLocalized`
3. **Tester les deux langues** : Vérifier que tout fonctionne en français et anglais
4. **SEO friendly** : Les URLs localisées sont bonnes pour le SEO 