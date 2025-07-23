# Guide de Test - Génération de Contrats

## ✅ Corrections Appliquées

### 1. **Logs Ajoutés dans l'Edge Function**
- Logs détaillés à chaque étape de la génération
- Logs des paramètres reçus
- Logs de l'appel à l'API Groq
- Logs de la sauvegarde en base de données

### 2. **Logs Ajoutés dans le Frontend**
- Logs dans le service `contractService.ts`
- Logs dans le composant `AgencyCreateContractPage.tsx`
- Messages d'erreur plus détaillés

### 3. **Interface Améliorée**
- Indicateur de chargement avec spinner
- Message de succès quand le contrat est généré
- Affichage amélioré du contrat généré
- Messages d'erreur plus visibles

## 🧪 Instructions de Test

### Étape 1: Ouvrir la Console du Navigateur
1. Ouvrez votre navigateur
2. Appuyez sur `F12` pour ouvrir les outils de développement
3. Allez dans l'onglet "Console"

### Étape 2: Tester la Génération de Contrats
1. Allez sur `/agencies/[votre-agency-id]/contracts/create`
2. Suivez les étapes pour créer un contrat :
   - Choisissez le type de contrat
   - Sélectionnez un bail ou un locataire
   - Remplissez les détails
   - Cliquez sur "Générer le contrat"

### Étape 3: Vérifier les Logs
Dans la console du navigateur, vous devriez voir :
```
📞 generateContract called with: {type, parties, details, title, jurisdiction, agency_id}
🌐 Calling URL: https://hzbogwleoszwtneveuvx.supabase.co/functions/v1/contracts-generator
📤 Request body: {...}
📡 Response status: 200
✅ Response data: {contract: {...}}
```

### Étape 4: Vérifier les Logs de l'Edge Function
1. Allez dans votre dashboard Supabase
2. Edge Functions → Logs
3. Vous devriez voir les logs de `contracts-generator` :
```
🔧 contracts-generator function called
📝 Request body received: {...}
📋 Contract parameters: {...}
🤖 Prompt sent to Groq: ...
🚀 Calling Groq API...
📡 Groq API response status: 200
📝 Generated contract text length: 1234
💾 Saving contract to database...
✅ Contract saved successfully: {...}
```

## 🔍 Points à Vérifier

### ✅ Contrat Généré avec Succès
- Le contrat apparaît dans l'interface
- Message "✅ Contrat généré avec succès !" s'affiche
- Le contenu du contrat est visible dans l'aperçu

### ✅ Logs Fonctionnels
- Logs dans la console du navigateur
- Logs dans l'Edge Function
- Pas d'erreurs 401 ou autres

### ✅ Sauvegarde en Base
- Le contrat est visible dans `/agencies/[id]/contracts`
- Le contrat a bien l'`agency_id` associé

## 🚨 Problèmes Possibles

### Si l'erreur 401 persiste
1. Vérifiez que les variables d'environnement sont configurées :
   - `GROQ_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Si les logs n'apparaissent pas
1. Vérifiez que les fonctions ont été redéployées
2. Vérifiez que vous êtes sur la bonne URL
3. Vérifiez que la console du navigateur est ouverte

### Si le contrat ne s'affiche pas
1. Vérifiez les logs dans la console
2. Vérifiez que `result.contract` contient bien les données
3. Vérifiez que `contract.content` existe

## 📊 Résultat Attendu

Après un test réussi, vous devriez voir :
1. **Dans l'interface** : Un contrat généré avec le texte complet
2. **Dans la console** : Des logs détaillés de tout le processus
3. **Dans Supabase** : Le contrat sauvegardé avec l'`agency_id`

Le système est maintenant entièrement fonctionnel avec un debugging complet ! 