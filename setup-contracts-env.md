# Configuration des Variables d'Environnement pour la Génération de Contrats

## Variables Requises

Pour que la génération de contrats fonctionne, vous devez configurer ces variables d'environnement dans Supabase :

### 1. GROQ_API_KEY
```bash
npx supabase secrets set GROQ_API_KEY=gsk_your_groq_api_key_here
```

**Comment obtenir cette clé :**
1. Allez sur https://console.groq.com/
2. Inscrivez-vous ou connectez-vous
3. Créez une nouvelle API key
4. Copiez la clé qui commence par `gsk_`

### 2. SUPABASE_URL
```bash
npx supabase secrets set SUPABASE_URL=https://hzbogwleoszwtneveuvx.supabase.co
```

### 3. SUPABASE_SERVICE_ROLE_KEY
```bash
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Comment obtenir cette clé :**
1. Allez dans votre dashboard Supabase
2. Settings → API
3. Copiez la clé "service_role" (pas l'anon key)

## Vérification

Après avoir configuré toutes les variables, vérifiez qu'elles sont bien définies :

```bash
npx supabase secrets list
```

## Test

Une fois configuré, testez la génération de contrats en :
1. Allant sur `/agencies/[votre-agency-id]/contracts/create`
2. Créant un nouveau contrat
3. Vérifiant qu'il n'y a plus d'erreur 401

## Dépannage

Si vous continuez à avoir des erreurs :
1. Vérifiez que les clés sont correctes
2. Redéployez les fonctions :
   ```bash
   npx supabase functions deploy contracts-generator --no-verify-jwt
   npx supabase functions deploy contracts-update --no-verify-jwt
   ``` 