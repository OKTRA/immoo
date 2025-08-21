# 🔄 Synchronisation AUTH USER avec PROFILE TABLE

## 🚨 Problème Identifié

**L'utilisateur AUTH n'est pas synchronisé avec la table PROFILE** - c'est un problème courant dans les applications Supabase qui peut causer :

- ❌ Échecs de contraintes de clé étrangère
- ❌ Erreurs lors de la création de profils
- ❌ Données incohérentes entre `auth.users` et `profiles`
- ❌ Problèmes de sécurité RLS
- ❌ Erreurs dans l'application frontend

## 🔍 Cause Racine

Le problème survient parce que :
1. **Supabase Auth** crée automatiquement des utilisateurs dans `auth.users`
2. **Aucun mécanisme automatique** ne crée les profils correspondants dans `profiles`
3. **Les contraintes de clé étrangère** échouent car `profiles.user_id` doit référencer `auth.users.id`

## ✅ Solution Implémentée

### 1. **Fonctions de Synchronisation Automatique**

```sql
-- Création automatique de profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
-- Mise à jour automatique lors des modifications
CREATE OR REPLACE FUNCTION public.handle_user_update()
-- Suppression automatique lors de la suppression
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
```

### 2. **Déclencheurs Automatiques**

```sql
-- Déclencheur INSERT
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Déclencheur UPDATE
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_update();

-- Déclencheur DELETE
CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_deletion();
```

### 3. **Synchronisation des Données Existantes**

```sql
-- Synchronise tous les utilisateurs existants
INSERT INTO public.profiles (user_id, email, first_name, last_name, role, created_at, updated_at)
SELECT au.id, au.email, ... FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL;
```

## 🚀 Comment Appliquer la Solution

### Option 1: Migration Supabase (Recommandée)

```bash
# Appliquer la migration
supabase db push

# Ou exécuter manuellement
psql -h your-host -U your-user -d your-db -f supabase/migrations/20250121000000_fix_auth_profiles_sync.sql
```

### Option 2: Script Manuel

```bash
# Exécuter le script de correction
psql -h your-host -U your-user -d your-db -f fix-auth-profiles-sync.sql
```

### Option 3: Via l'Interface Supabase

1. Aller dans **SQL Editor** de votre projet Supabase
2. Copier-coller le contenu de `fix-auth-profiles-sync.sql`
3. Exécuter le script

## 🧪 Vérification de la Solution

Après avoir appliqué la correction, exécutez le script de test :

```bash
psql -h your-host -U your-user -d your-db -f test-auth-profiles-sync.sql
```

### Résultats Attendus

✅ **Synchronisation parfaite** : Même nombre d'utilisateurs dans `auth.users` et `profiles`
✅ **Déclencheurs actifs** : 3 déclencheurs sur `auth.users`
✅ **Politiques RLS** : Politiques SELECT, UPDATE, INSERT sur `profiles`
✅ **Index de performance** : Index sur `user_id` et `email`

## 🔒 Sécurité et RLS

### Politiques RLS Configurées

```sql
-- Utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Utilisateurs peuvent créer leur propre profil
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Gestion des Erreurs

- **Erreurs non bloquantes** : Les erreurs de synchronisation n'empêchent pas l'inscription
- **Logs d'erreur** : Toutes les erreurs sont loggées avec `RAISE WARNING`
- **Fallback gracieux** : Le système continue de fonctionner même en cas d'erreur

## 📊 Données Extraites Automatiquement

### Depuis `auth.users.raw_user_meta_data`

```json
{
  "first_name": "John",
  "last_name": "Doe", 
  "role": "agency"
}
```

### Valeurs par Défaut

- `first_name`: `''` (chaîne vide)
- `last_name`: `''` (chaîne vide)
- `role`: `'public'` (rôle par défaut)
- `created_at`: `auth.users.created_at`
- `updated_at`: `auth.users.updated_at`

## 🔄 Flux de Synchronisation

```mermaid
graph TD
    A[Utilisateur s'inscrit] --> B[Supabase Auth crée auth.users]
    B --> C[Déclencheur on_auth_user_created]
    C --> D[Fonction handle_new_user()]
    D --> E[Création automatique du profil]
    E --> F[Profil disponible dans l'application]
    
    G[Modification utilisateur] --> H[Déclencheur on_auth_user_updated]
    H --> I[Fonction handle_user_update()]
    I --> J[Mise à jour automatique du profil]
    
    K[Suppression utilisateur] --> L[Déclencheur on_auth_user_deleted]
    L --> M[Fonction handle_user_deletion()]
    M --> N[Suppression automatique du profil]
```

## 🛠️ Maintenance et Surveillance

### Vérifications Régulières

```sql
-- Vérifier la synchronisation
SELECT 
    (SELECT COUNT(*) FROM auth.users) as auth_users_count,
    (SELECT COUNT(*) FROM profiles) as profiles_count,
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM profiles)
        THEN '✅ Synchronisé'
        ELSE '❌ Désynchronisé'
    END as status;

-- Identifier les utilisateurs orphelins
SELECT au.id, au.email 
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL;
```

### Logs et Monitoring

- **Warnings PostgreSQL** : Surveillez les `RAISE WARNING` dans les logs
- **Métriques de synchronisation** : Comptez les utilisateurs dans chaque table
- **Tests automatisés** : Exécutez `test-auth-profiles-sync.sql` régulièrement

## 🚨 Dépannage

### Problèmes Courants

1. **Erreur de permissions** : Vérifiez que l'utilisateur a les droits sur `auth.users`
2. **Déclencheurs désactivés** : Vérifiez que les triggers sont actifs
3. **Contraintes cassées** : Vérifiez l'intégrité des clés étrangères

### Solutions

```sql
-- Réactiver les déclencheurs
ALTER TABLE auth.users ENABLE TRIGGER ALL;

-- Vérifier les contraintes
SELECT * FROM information_schema.table_constraints 
WHERE table_name = 'profiles' AND constraint_type = 'FOREIGN KEY';

-- Forcer la synchronisation
SELECT public.handle_new_user();
```

## 📝 Notes Importantes

- **Indépendance** : Cette solution n'affecte pas les fonctionnalités existantes
- **Rétrocompatibilité** : Fonctionne avec les utilisateurs existants
- **Performance** : Index créés pour optimiser les requêtes
- **Sécurité** : Politiques RLS strictes pour protéger les données

## 🎯 Avantages de cette Solution

✅ **Automatique** : Aucune intervention manuelle requise
✅ **Robuste** : Gestion d'erreurs et fallbacks
✅ **Sécurisé** : Politiques RLS appropriées
✅ **Performant** : Index et optimisations
✅ **Maintenable** : Code documenté et structuré
✅ **Testable** : Scripts de vérification inclus

---

**Cette solution résout définitivement le problème de synchronisation entre AUTH USER et PROFILE TABLE, garantissant une cohérence des données et une expérience utilisateur fluide.**
