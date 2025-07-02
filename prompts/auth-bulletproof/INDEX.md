# 🗂️ INDEX DES PROMPTS - AUTHENTIFICATION BULLETPROOF

## 📋 FICHIERS DISPONIBLES

| Fichier | Description | Usage |
|---------|-------------|-------|
| `PROMPT_RAPIDE.md` | 🚀 **Prompt principal** - Instructions complètes | **Utilisez ce fichier en priorité** |
| `EXEMPLES_CODE.md` | 🔧 Code complet prêt à copier-coller | Implémentation détaillée |
| `INDEX.md` | 🗂️ Ce fichier d'index | Navigation |

## 🎯 COMMENT UTILISER CES PROMPTS

### 1. **Pour un nouveau projet :**
1. Copiez le contenu de `PROMPT_RAPIDE.md`
2. Collez-le dans votre IA (Claude, GPT, etc.)
3. Demandez : "Implémente ce système dans mon projet React/TypeScript"
4. Suivez les instructions étape par étape

### 2. **Pour voir le code complet :**
1. Consultez `EXEMPLES_CODE.md`
2. Copiez-collez directement les fichiers dans votre projet
3. Adaptez les chemins et types selon vos besoins

### 3. **Pour migrer un système existant :**
1. Utilisez la section "Migration" de `PROMPT_RAPIDE.md`
2. Remplacez progressivement vos hooks d'auth
3. Testez étape par étape

## 🛡️ SYSTÈME CRÉÉ

Après implémentation, vous aurez :

```
✅ État centralisé avec React Context
✅ Types TypeScript stricts
✅ Gestion des race conditions
✅ Synchronisation cross-tab
✅ Hooks utilitaires
✅ Protection de routes
✅ Migration transparente
```

## 📚 PROMPT PRINCIPAL

```
Implémente un système d'authentification bulletproof pour React/TypeScript + Supabase qui élimine les race conditions, sessions qui flashent, et problèmes cross-tab. Utilise React Context + useReducer avec types stricts et hooks utilitaires.

Structure requise :
- src/types/auth.ts (types stricts)
- src/contexts/auth/authReducer.ts (reducer)
- src/contexts/auth/AuthContext.tsx (contexte principal)
- src/hooks/auth/useAuthStatus.ts (hook de statut)
- src/hooks/auth/useRequireAuth.ts (hook de redirection)
- src/components/auth/AuthGuard.tsx (protection routes)
- src/hooks/useAuth.tsx (hook unifié)

Points critiques :
- initialized: boolean pour éviter race conditions
- isReady && isAuthenticated dans les conditions
- enabled: isReady && isAuthenticated && !!user?.id pour React Query
- Synchronisation cross-tab avec localStorage

Adaptations nécessaires :
- Chemins Supabase et services auth
- Rôles utilisateur selon projet
- Système de notifications
- Wrapper <AuthProvider> dans App.tsx
```

## 🔧 ADAPTATIONS COURANTES

### Chemins à modifier :
- `@/lib/supabase` → votre chemin Supabase
- `@/services/authService` → vos services
- `'profiles'` → votre table utilisateurs

### Rôles à adapter :
```typescript
role: 'admin' | 'agency' | 'visiteur' // Remplacez par vos rôles
```

### Notifications :
```typescript
import { toast } from 'sonner'; // Ou react-hot-toast, etc.
```

## 🚀 VALIDATION

```bash
npx tsc --noEmit --skipLibCheck  # Types OK
npm run build                   # Build OK
npm run dev                     # Test local
```

## 📞 SUPPORT

Si vous rencontrez des problèmes :

1. **"useAuth must be used within an AuthProvider"**
   → Vérifiez que `<AuthProvider>` wrappe votre app

2. **Données qui se chargent trop tôt**
   → Utilisez `enabled: isReady && isAuthenticated`

3. **States qui flashent**
   → Vérifiez `isReady` avant d'afficher du contenu

4. **Cross-tab ne fonctionne pas**
   → Vérifiez l'event listener `storage`

---

*Système testé et validé en production. Élimine tous les problèmes d'authentification classiques !* 🛡️ 