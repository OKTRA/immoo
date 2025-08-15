# IMMOO Splash Screen Component

Un composant React moderne et animé pour créer des écrans de démarrage élégants avec le logo IMMOO.

## 🎯 Fonctionnalités

- **Logo animé** avec yeux interactifs qui suivent le mouvement
- **Barre de progression** temps réel avec pourcentage
- **Particules flottantes** animées pour un effet visuel immersif
- **Transitions fluides** d'entrée et de sortie
- **Thèmes** clair et sombre
- **Responsive** et optimisé pour mobile/desktop
- **Entièrement personnalisable**

## 📦 Installation

Le composant est déjà inclus dans le projet IMMOO. Pour l'utiliser :

```tsx
import ImmooSplashScreen from '@/components/ui/ImmooSplashScreen';
```

## 🚀 Utilisation

### Utilisation basique

```tsx
import { useState } from 'react';
import ImmooSplashScreen from '@/components/ui/ImmooSplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div>
      {showSplash && (
        <ImmooSplashScreen 
          variant="dark"
          duration={3000}
          onComplete={() => setShowSplash(false)}
        />
      )}
      
      {/* Contenu principal de votre app */}
      <main>
        <h1>Bienvenue sur IMMOO!</h1>
      </main>
    </div>
  );
}
```

### Avec React Router

```tsx
import { useNavigate } from 'react-router-dom';
import ImmooSplashScreen from '@/components/ui/ImmooSplashScreen';

function SplashPage() {
  const navigate = useNavigate();

  return (
    <ImmooSplashScreen 
      variant="dark"
      duration={2500}
      onComplete={() => navigate('/dashboard')}
    />
  );
}
```

### Configuration avancée

```tsx
<ImmooSplashScreen 
  variant="light"              // Thème clair ou sombre
  duration={4000}              // Durée en millisecondes
  showProgress={true}          // Afficher la barre de progression
  autoHide={true}              // Masquage automatique
  className="custom-splash"    // Classes CSS personnalisées
  onComplete={() => {
    // Actions à effectuer après le splash
    console.log('Splash terminé!');
    // Navigation, initialisation, etc.
  }}
/>
```

## ⚙️ Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `variant` | `'light' \| 'dark'` | `'dark'` | Thème de couleur du splash screen |
| `duration` | `number` | `3000` | Durée de l'animation en millisecondes |
| `onComplete` | `() => void` | - | Callback appelé à la fin de l'animation |
| `showProgress` | `boolean` | `true` | Afficher la barre de progression |
| `autoHide` | `boolean` | `true` | Masquage automatique après la durée |
| `className` | `string` | `""` | Classes CSS personnalisées |

## 🎨 Thèmes

### Thème Sombre (`variant="dark"`)
- Fond dégradé bleu marine vers noir
- Logo doré sur fond sombre
- Particules dorées
- Texte clair

### Thème Clair (`variant="light"`)
- Fond dégradé blanc vers perle
- Logo bleu marine
- Particules subtiles
- Texte sombre

## 🌟 Cas d'usage

### Applications mobiles
```tsx
// Parfait pour les PWA et applications Capacitor
<ImmooSplashScreen 
  variant="dark"
  duration={2000}
  onComplete={() => initializeApp()}
/>
```

### Sites web
```tsx
// Écran de chargement pour l'initialisation
<ImmooSplashScreen 
  variant="light"
  duration={1500}
  onComplete={() => setAppReady(true)}
/>
```

### Transitions de page
```tsx
// Entre différentes sections de l'app
<ImmooSplashScreen 
  variant="dark"
  duration={1000}
  showProgress={false}
  onComplete={() => navigate('/newSection')}
/>
```

## 🎯 Personnalisation

### CSS personnalisé
```css
/* Modifier l'apparence avec des classes CSS */
.custom-splash {
  /* Vos styles personnalisés */
}

.custom-splash .logo-container {
  transform: scale(1.2);
}
```

### Durées recommandées
- **Très rapide**: 1000-1500ms (transitions de page)
- **Standard**: 2000-3000ms (démarrage d'app)
- **Avec chargement**: 3000-5000ms (initialisation de données)

## 🔧 Intégration avec l'écosystème IMMOO

Le splash screen utilise les couleurs de marque IMMOO définies dans votre configuration Tailwind :

- `immoo-navy`: Bleu marine principal
- `immoo-gold`: Doré pour les accents
- `immoo-pearl`: Perle pour les fonds clairs

## 📱 Responsive

Le composant s'adapte automatiquement :
- **Mobile**: Optimisé pour les écrans tactiles
- **Tablet**: Tailles et espacements ajustés
- **Desktop**: Pleine résolution avec effets enrichis

## 🚀 Performance

- **Optimisé** pour les appareils mobiles
- **CSS Animations** hardware-accelerated
- **Lazy loading** des ressources
- **Minimal bundle impact**

## 🛠️ Dépannage

### Le splash ne s'affiche pas
Vérifiez que le composant a bien un `z-index` élevé et une position `fixed`.

### Les animations sont saccadées
Assurez-vous que `will-change: transform` est appliqué aux éléments animés.

### Le callback onComplete n'est pas appelé
Vérifiez que `autoHide={true}` est défini et que la durée est correcte.

## 📚 Exemples complets

Consultez le fichier `src/pages/SplashScreenDemo.tsx` pour voir des exemples interactifs et testez différentes configurations dans la page showcase à `/logo-showcase`.

---

Créé avec ❤️ pour IMMOO - Trouve ton futur chez toi
