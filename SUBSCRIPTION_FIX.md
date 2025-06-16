# Correction du problème de clignotement /agencies

## Problème identifié
L'utilisateur `izoflores45@gmail.com` avec le rôle "agency" provoque un clignotement sur la page `/agencies` car il manque les tables de subscription dans la base de données.

## Solution
Deux nouvelles migrations ont été créées pour résoudre ce problème :

### 1. Migration 20250616011100-create-subscription-tables.sql
Cette migration crée :
- Table `subscription_plans` : pour gérer les plans d'abonnement
- Table `user_subscriptions` : pour lier les utilisateurs aux plans
- Plan gratuit par défaut avec ID `free-plan`
- Politiques RLS appropriées
- Index pour les performances

### 2. Migration 20250616011200-add-default-subscriptions.sql
Cette migration :
- Ajoute un abonnement gratuit pour tous les utilisateurs existants
- Résout spécifiquement le problème pour `izoflores45@gmail.com`
- Assure qu'il n'y a qu'un abonnement actif par utilisateur

## Comment appliquer la correction

### Option 1 : Via Supabase CLI (si configuré)
```bash
cd /path/to/project
supabase db push
npm run update-types  # ou exécuter scripts/update-db-types.ps1
```

### Option 2 : Via l'interface Supabase
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans "SQL Editor"
4. Exécuter le contenu de `20250616011100-create-subscription-tables.sql`
5. Puis exécuter le contenu de `20250616011200-add-default-subscriptions.sql`
6. Générer les nouveaux types avec : `supabase gen types typescript --project-id YOUR_PROJECT_REF > src/integrations/supabase/types.ts`

### Option 3 : Via un client de base de données
1. Se connecter à votre base de données Postgres
2. Exécuter les scripts SQL dans l'ordre

## Vérification
Après application, vous devriez voir :
- Les tables `subscription_plans` et `user_subscriptions` dans votre base de données
- Un plan gratuit avec ID `free-plan`
- Tous les utilisateurs existants avec un abonnement gratuit actif
- Plus de clignotement sur `/agencies` pour `izoflores45@gmail.com`

## Notes importantes
- Les données des plans sont maintenant gérées via l'admin panel, pas en dur dans le code
- Le plan gratuit par défaut a des limites basiques (1 agence, 1 propriété, etc.)
- Les limites peuvent être ajustées via l'admin panel après l'application des migrations
