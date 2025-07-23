# Fix Génération de Contrats - Erreur 401

Ce document explique comment résoudre l'erreur 401 lors de la génération de contrats et comment configurer correctement le système.

## Problème Identifié

L'erreur 401 était causée par plusieurs problèmes :

1. **Client Supabase mal configuré** : La fonction `contracts-generator` créait un client Supabase sans URL ni clé d'API
2. **Table contracts incomplète** : Il manquait la colonne `agency_id` pour lier les contrats aux agences
3. **Politiques RLS manquantes** : Pas de règles de sécurité appropriées pour les contrats
4. **Gestion CORS insuffisante** : Headers CORS manquants dans `contracts-update`

## Solutions Appliquées

### 1. Correction des Fonctions Supabase

**Fichier :** `supabase/functions/contracts-generator/index.ts`
- ✅ Ajout des variables d'environnement `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Création du client Supabase avec les bonnes credentials
- ✅ Ajout du support pour `agency_id` dans l'insertion

**Fichier :** `supabase/functions/contracts-update/index.ts`
- ✅ Même correction pour l'authentification Supabase
- ✅ Ajout des headers CORS appropriés
- ✅ Gestion des options preflight requests

### 2. Mise à Jour de la Base de Données

**Nouvelle migration :** `20250121001001_add_agency_id_to_contracts.sql`
- ✅ Ajout de la colonne `agency_id` à la table `contracts`
- ✅ Création d'un index pour les performances
- ✅ Mise en place des politiques RLS appropriées

### 3. Politiques de Sécurité (RLS)

```sql
-- Les utilisateurs peuvent voir les contrats de leurs agences
CREATE POLICY "Users can see contracts from their agencies" ON contracts
FOR SELECT TO authenticated
USING (
  agency_id IS NULL OR 
  agency_id IN (
    SELECT a.id FROM agencies a WHERE a.user_id = auth.uid()
  )
);
```

## Configuration Requise

### Variables d'Environnement Supabase

Les fonctions nécessitent ces variables d'environnement :

```bash
# API Groq pour la génération de contrats
npx supabase secrets set GROQ_API_KEY=votre_clé_groq

# Configuration Supabase (disponible dans votre dashboard)
npx supabase secrets set SUPABASE_URL=https://votre-projet.supabase.co
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

### Comment Obtenir les Clés

1. **GROQ_API_KEY** : 
   - Inscrivez-vous sur [Groq Cloud](https://console.groq.com/)
   - Créez une nouvelle API key

2. **SUPABASE_URL** : 
   - Dans votre dashboard Supabase → Settings → API
   - Copiez l'URL du projet

3. **SUPABASE_SERVICE_ROLE_KEY** : 
   - Dans votre dashboard Supabase → Settings → API
   - Copiez la "service_role" key (pas l'anon key)

## Déploiement

### Étape 1 : Exécuter le Script de Correction

```powershell
.\fix-contracts-generation.ps1
```

### Étape 2 : Configuration Manuelle (si nécessaire)

```bash
# Appliquer la migration
npx supabase db push --include-all --local=false

# Redéployer les fonctions
npx supabase functions deploy contracts-generator --no-verify-jwt
npx supabase functions deploy contracts-update --no-verify-jwt

# Configurer les variables d'environnement
npx supabase secrets set GROQ_API_KEY=votre_clé
npx supabase secrets set SUPABASE_URL=votre_url
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=votre_clé
```

## Test du Système

### 1. Vérifier les Variables d'Environnement

```bash
npx supabase secrets list
```

### 2. Tester la Génération de Contrats

1. Connectez-vous à votre application
2. Allez dans une agence : `/agencies/[ID_AGENCE]/contracts/create`
3. Créez un nouveau contrat
4. Vérifiez que la génération fonctionne sans erreur 401

### 3. Vérifications en Base de Données

```sql
-- Vérifier que la colonne agency_id existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contracts' AND column_name = 'agency_id';

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'contracts';
```

## Dépannage

### Erreur 401 Persiste

1. Vérifiez que les variables d'environnement sont bien configurées :
   ```bash
   npx supabase secrets list
   ```

2. Redéployez les fonctions :
   ```bash
   npx supabase functions deploy contracts-generator --no-verify-jwt
   ```

### Erreur de Migration

1. Vérifiez le statut des migrations :
   ```bash
   npx supabase migration list
   ```

2. Appliquez manuellement la migration :
   ```bash
   npx supabase db push --include-all
   ```

### Problème d'Accès aux Contrats

1. Vérifiez que l'utilisateur possède bien l'agence
2. Consultez les logs Supabase pour voir les erreurs RLS

## Structure Finale

Après ces corrections, la génération de contrats :

1. ✅ S'authentifie correctement avec Supabase
2. ✅ Génère le contrat via l'API Groq
3. ✅ Sauvegarde le contrat avec l'ID de l'agence
4. ✅ Respecte les politiques de sécurité RLS
5. ✅ Retourne le contrat généré au frontend

Le système est maintenant opérationnel et sécurisé ! 