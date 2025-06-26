# Guide : Gestion des Limites Illimitées

## 📋 Vue d'ensemble

Le système d'abonnements permet de définir des **limites illimitées** pour les ressources (agences, propriétés, baux, utilisateurs). Cette fonctionnalité est essentielle pour les plans premium.

## 🔧 Implémentation technique

### Valeur représentant "illimité" : `-1`

```sql
-- Plan avec propriétés illimitées
max_properties = -1

-- Plan avec tout illimité  
max_agencies = -1, max_properties = -1, max_users = -1, max_leases = -1
```

## 🎨 Interface utilisateur

### 1. Formulaire de création de plans

Dans `SubscriptionPlanForm.tsx` :
- ✅ **Checkbox "Illimité"** avec icône ∞
- ✅ **Masquage du champ numérique** quand illimité est coché
- ✅ **Conversion automatique** : coché = -1, décoché = valeur numérique

```tsx
<Checkbox 
  checked={isUnlimited(formData.maxProperties)}
  onCheckedChange={(checked) => handleUnlimitedChange('maxProperties', checked)}
/>
```

### 2. Affichage dans les tableaux

Dans `SubscriptionPlansTable.tsx` :
```tsx
{plan.maxProperties === -1 ? 'Illimité' : plan.maxProperties}
```

### 3. Vérification des limites

Dans `subscription/limit.ts` :
```typescript
const isUnlimited = maxAllowed === -1;
const allowed = isUnlimited || currentCount < maxAllowed;
```

## 📊 Exemples de plans

### Plan Standard
```sql
max_agencies: 3
max_properties: 50
max_users: 10
max_leases: 100
```

### Plan Premium (propriétés illimitées)
```sql
max_agencies: 5
max_properties: -1      # Illimité
max_users: 20
max_leases: 500
```

### Plan Enterprise (tout illimité)
```sql
max_agencies: -1        # Illimité
max_properties: -1      # Illimité  
max_users: -1           # Illimité
max_leases: -1          # Illimité
```

## 🔄 Logique de vérification

### 1. Création de ressources
```typescript
// Si limite illimitée (-1), toujours autorisé
if (maxAllowed === -1) return { allowed: true };

// Sinon, vérifier la limite normale
return { allowed: currentCount < maxAllowed };
```

### 2. Calcul de pourcentage d'utilisation
```typescript
// Illimité = 0% d'utilisation (toujours vert)
const percentageUsed = isUnlimited ? 0 : Math.round((current / max) * 100);
```

### 3. Affichage des statuts
```typescript
// "15 (illimité)" au lieu de "15 / -1"
const statusText = max === -1 ? `${current} (illimité)` : `${current} / ${max}`;
```

## 🛠️ Utilisation pratique

### Créer un plan avec limites illimitées

1. **Aller dans Admin > Plans d'abonnement**
2. **Cliquer sur "Créer un plan"**
3. **Cocher "Illimité"** pour les ressources souhaitées
4. **Sauvegarder**

### Vérifier les limites utilisateur

```typescript
import { checkUserResourceLimit } from '@/services/subscription/limit';

const result = await checkUserResourceLimit(userId, 'properties');
// result.isUnlimited = true si plan illimité
// result.allowed = true si peut créer plus
```

## 📝 Avantages du système

### ✅ Simplicité
- **Une seule valeur** (`-1`) pour représenter illimité
- **Gestion unifiée** dans tout le code

### ✅ Flexibilité  
- **Limites mixtes** : certaines illimitées, d'autres limitées
- **Évolutivité** : facile d'ajouter de nouvelles ressources

### ✅ Interface intuitive
- **Checkbox claire** avec icône ∞
- **Affichage cohérent** : "Illimité" partout

### ✅ Performance
- **Pas de calculs complexes** pour les limites illimitées
- **Vérifications rapides** avec simple comparaison à -1

## 🎯 Script d'exemples

Utilisez le script `add-unlimited-plans-examples.sql` pour ajouter des plans d'exemple avec différentes configurations de limites illimitées.

## 🔍 Debugging

### Vérifier les plans en base
```sql
SELECT 
  name,
  CASE WHEN max_properties = -1 THEN 'Illimité' ELSE max_properties::text END as proprietes
FROM subscription_plans;
```

### Tester les limites
```typescript
console.log('Limite:', maxAllowed === -1 ? 'Illimité' : maxAllowed);
console.log('Autorisé:', allowed);
``` 