# Guide de Configuration Orange Money Mali - Étape par Étape

Ce guide vous accompagne dans la mise en place complète du module Orange Money Mali dans votre projet.

## 📋 Prérequis

- [ ] Compte Orange Developer créé
- [ ] Node.js installé (version 16+)
- [ ] TypeScript configuré dans votre projet
- [ ] Accès aux variables d'environnement

## 🚀 Étape 1 : Création du compte Orange Developer

### 1.1 Inscription
1. Rendez-vous sur [https://developer.orange.com](https://developer.orange.com)
2. Cliquez sur "S'inscrire" ou "Sign Up"
3. Remplissez le formulaire d'inscription
4. Validez votre email

### 1.2 Vérification du compte
1. Connectez-vous à votre portail développeur
2. Complétez votre profil développeur
3. Acceptez les conditions d'utilisation

### 1.3 Création d'une application
1. Allez dans **My Apps** > **Create New App**
2. Nommez votre application (ex: "MonApp Orange Money")
3. Sélectionnez **Orange Money API**
4. Choisissez le pays : **Mali**
5. Décrivez votre cas d'usage

### 1.4 Récupération des clés API
1. Une fois l'app créée, allez dans les détails
2. Copiez votre `Client ID` et `Client Secret`
3. **IMPORTANT** : Gardez ces clés secrètes !

### 1.5 Obtention de la Merchant Key
1. Contactez Orange Mali à : [email Orange Mali]
2. Ou via le support technique du portail développeur
3. Fournissez vos informations d'entreprise
4. Attendez l'attribution de votre merchant key

## 🔧 Étape 2 : Installation du module

### 2.1 Copier le module
```bash
# Depuis votre projet source
cp -r src/lib/orange-money-mali /path/to/your/new/project/src/lib/

# Ou créer le dossier et copier les fichiers individuellement
mkdir -p src/lib/orange-money-mali
# Copier tous les fichiers .ts du module
```

### 2.2 Vérifier les dépendances
Assurez-vous que votre `package.json` contient :
```json
{
  "dependencies": {
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

Si vous utilisez React :
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "@types/react": "^18.0.0"
  }
}
```

## ⚙️ Étape 3 : Configuration des variables d'environnement

### 3.1 Créer le fichier .env
```bash
touch .env
```

### 3.2 Ajouter les variables Orange Money
```env
# Configuration Orange Money Mali
ORANGE_MONEY_CLIENT_ID=your-client-id-here
ORANGE_MONEY_CLIENT_SECRET=your-client-secret-here
ORANGE_MONEY_MERCHANT_KEY=your-merchant-key-here
ORANGE_MONEY_ENVIRONMENT=production

# Pour les projets Vite/React (préfixe VITE_)
VITE_ORANGE_MONEY_CLIENT_ID=your-client-id-here
VITE_ORANGE_MONEY_CLIENT_SECRET=your-client-secret-here
VITE_ORANGE_MONEY_MERCHANT_KEY=your-merchant-key-here
VITE_ORANGE_MONEY_ENVIRONMENT=production

# Pour les projets Next.js (préfixe NEXT_PUBLIC_ pour le client)
NEXT_PUBLIC_ORANGE_MONEY_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_ORANGE_MONEY_CLIENT_SECRET=your-client-secret-here
NEXT_PUBLIC_ORANGE_MONEY_MERCHANT_KEY=your-merchant-key-here
ORANGE_MONEY_ENVIRONMENT=production
```

### 3.3 Sécuriser le fichier .env
Ajoutez à votre `.gitignore` :
```gitignore
# Variables d'environnement
.env
.env.local
.env.production
.env.staging
```

## 🧪 Étape 4 : Test de la configuration

### 4.1 Créer un fichier de test
```typescript
// test-orange-money.ts
import { OrangeMoneyMaliClient, createConfigFromEnv } from './src/lib/orange-money-mali';

async function testConfig() {
  try {
    const config = createConfigFromEnv();
    const client = new OrangeMoneyMaliClient(config);
    
    console.log('✅ Configuration Orange Money Mali OK');
    console.log('Client ID:', config.clientId.substring(0, 10) + '...');
    console.log('Merchant Key:', config.merchantKey.substring(0, 5) + '...');
    console.log('Environment:', config.environment);
    
    // Test de génération d'ID de transaction
    const transactionId = client.generateTransactionId();
    console.log('Transaction ID généré:', transactionId);
    
    // Test d'authentification (optionnel)
    console.log('Test d\'authentification...');
    // const balance = await client.getBalance();
    // console.log('Authentification:', balance.success ? 'OK' : 'FAILED');
    
  } catch (error) {
    console.error('❌ Erreur de configuration:', error);
  }
}

testConfig();
```

### 4.2 Exécuter le test
```bash
npx ts-node test-orange-money.ts
```

## 🌐 Étape 5 : Configuration du webhook (optionnel)

### 5.1 Créer l'endpoint webhook

**Pour Express.js :**
```typescript
// webhook.ts
import express from 'express';
import { OrangeMoneyMaliClient, createConfigFromEnv } from './src/lib/orange-money-mali';

const app = express();
app.use(express.json());

const orangeMoney = new OrangeMoneyMaliClient(createConfigFromEnv());

app.post('/webhook/orange-money', async (req, res) => {
  try {
    console.log('Webhook Orange Money reçu:', req.body);
    
    const paymentStatus = await orangeMoney.handleWebhook(req.body);
    
    if (paymentStatus) {
      console.log('Paiement validé:', paymentStatus);
      
      // Traiter le paiement selon votre logique
      switch (paymentStatus.status) {
        case 'completed':
          // Activer le service
          await handlePaymentSuccess(paymentStatus);
          break;
        case 'failed':
          // Gérer l'échec
          await handlePaymentFailure(paymentStatus);
          break;
      }
      
      res.status(200).json({ message: 'OK' });
    } else {
      res.status(400).json({ error: 'Invalid webhook' });
    }
  } catch (error) {
    console.error('Erreur webhook:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

async function handlePaymentSuccess(payment: any) {
  console.log('Traitement du paiement réussi:', payment.transactionId);
}

async function handlePaymentFailure(payment: any) {
  console.log('Traitement de l\'échec:', payment.transactionId);
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### 5.2 Configurer l'URL dans Orange Developer
1. Connectez-vous à votre portail Orange Developer
2. Allez dans votre application
3. Configurez l'URL de notification : `https://yourapp.com/webhook/orange-money`

## 💳 Étape 6 : Créer votre premier paiement

### 6.1 Validation des numéros maliens
```typescript
import { validateMaliPhoneNumber, formatMaliPhoneNumber } from './src/lib/orange-money-mali';

// Tests de validation
console.log(validateMaliPhoneNumber('+22370123456')); // true
console.log(validateMaliPhoneNumber('70123456')); // true
console.log(validateMaliPhoneNumber('60123456')); // true
console.log(validateMaliPhoneNumber('+22550123456')); // false (pas Mali)

// Formatage automatique
console.log(formatMaliPhoneNumber('70123456')); // +22370123456
```

### 6.2 Implémentation du paiement USSD
```typescript
// payment-ussd.ts
import { OrangeMoneyMaliClient, createConfigFromEnv } from './src/lib/orange-money-mali';

const orangeMoney = new OrangeMoneyMaliClient(createConfigFromEnv());

export async function createUSSDPayment() {
  const paymentRequest = {
    transactionId: orangeMoney.generateTransactionId(),
    amount: 1000, // 1000 FCFA
    currency: 'XOF',
    description: 'Test de paiement Orange Money',
    customer: {
      phoneNumber: '+22370123456',
      firstName: 'Amadou',
      lastName: 'Diarra',
      email: 'amadou@example.com'
    }
  };

  try {
    const response = await orangeMoney.createPayment(paymentRequest);
    
    if (response.success) {
      console.log('✅ Paiement créé avec succès !');
      console.log('Code USSD à composer:', response.ussdCode);
      console.log('QR Code data:', response.qrCode);
      
      // Afficher à l'utilisateur
      return {
        ussdCode: response.ussdCode,
        qrCode: response.qrCode,
        transactionId: response.transactionId
      };
    } else {
      console.error('❌ Erreur:', response.error);
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error);
    throw error;
  }
}
```

### 6.3 Test du paiement
```typescript
// test-payment.ts
import { createUSSDPayment } from './payment-ussd';

async function testPayment() {
  try {
    const payment = await createUSSDPayment();
    console.log('💰 Paiement initialisé !');
    console.log('Instructions pour l\'utilisateur:');
    console.log(`📞 Composez: ${payment.ussdCode}`);
    console.log(`📱 Ou scannez le QR code: ${payment.qrCode}`);
    console.log(`🔍 Transaction ID: ${payment.transactionId}`);
  } catch (error) {
    console.error('❌ Erreur lors du test de paiement:', error);
  }
}

testPayment();
```

## 🎨 Étape 7 : Intégration avec React (optionnel)

### 7.1 Composant de paiement USSD
```tsx
// components/OrangeMoneyPayment.tsx
import React, { useState } from 'react';
import { useOrangeMoneyMali } from '@/lib/orange-money-mali/react-hooks';

interface OrangeMoneyPaymentProps {
  amount: number;
  description: string;
  customerPhone: string;
  customerFirstName: string;
  customerLastName: string;
}

export function OrangeMoneyPayment({ 
  amount, 
  description, 
  customerPhone,
  customerFirstName,
  customerLastName
}: OrangeMoneyPaymentProps) {
  const [ussdCode, setUssdCode] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  
  const { createPayment, isLoading, error } = useOrangeMoneyMali({
    clientId: process.env.NEXT_PUBLIC_ORANGE_MONEY_CLIENT_ID!,
    clientSecret: process.env.NEXT_PUBLIC_ORANGE_MONEY_CLIENT_SECRET!,
    merchantKey: process.env.NEXT_PUBLIC_ORANGE_MONEY_MERCHANT_KEY!,
    environment: 'production'
  });

  const handlePayment = async () => {
    try {
      const response = await createPayment({
        transactionId: `OM_${Date.now()}`,
        amount,
        currency: 'XOF',
        description,
        customer: {
          phoneNumber: customerPhone,
          firstName: customerFirstName,
          lastName: customerLastName
        }
      });

      if (response.success) {
        setUssdCode(response.ussdCode || '');
        setQrCode(response.qrCode || '');
      }
    } catch (error) {
      console.error('Erreur de paiement:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-orange-50 rounded-lg">
      <h3 className="text-xl font-bold text-orange-800 mb-4">
        💰 Paiement Orange Money
      </h3>
      
      <div className="mb-4">
        <p><strong>Montant:</strong> {amount.toLocaleString()} FCFA</p>
        <p><strong>Description:</strong> {description}</p>
      </div>

      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded disabled:opacity-50"
      >
        {isLoading ? 'Génération...' : 'Générer le code de paiement'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Erreur: {error}
        </div>
      )}

      {ussdCode && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded">
          <h4 className="font-bold text-green-800 mb-2">📞 Code USSD</h4>
          <div className="text-2xl font-mono bg-white p-3 rounded border text-center">
            {ussdCode}
          </div>
          <p className="text-sm text-green-700 mt-2">
            Composez ce code sur votre téléphone Orange Money
          </p>
        </div>
      )}

      {qrCode && (
        <div className="mt-4 p-4 bg-blue-100 border border-blue-400 rounded">
          <h4 className="font-bold text-blue-800 mb-2">📱 QR Code</h4>
          <div className="text-xs font-mono bg-white p-2 rounded border break-all">
            {qrCode}
          </div>
          <p className="text-sm text-blue-700 mt-2">
            Ou scannez ce QR code avec votre app Orange Money
          </p>
        </div>
      )}
    </div>
  );
}
```

### 7.2 Hook pour vérification de solde
```tsx
// components/BalanceChecker.tsx
import React, { useEffect } from 'react';
import { useOrangeMoneyBalance } from '@/lib/orange-money-mali/react-hooks';

export function BalanceChecker() {
  const { balance, currency, isLoading, error, fetchBalance } = useOrangeMoneyBalance({
    clientId: process.env.NEXT_PUBLIC_ORANGE_MONEY_CLIENT_ID!,
    clientSecret: process.env.NEXT_PUBLIC_ORANGE_MONEY_CLIENT_SECRET!,
    merchantKey: process.env.NEXT_PUBLIC_ORANGE_MONEY_MERCHANT_KEY!
  });

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  if (isLoading) return <div>Vérification du solde...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="p-4 bg-orange-100 rounded-lg">
      <h3 className="font-bold text-orange-800 mb-2">💳 Solde Orange Money</h3>
      <p className="text-2xl font-bold">
        {balance?.toLocaleString()} {currency}
      </p>
      <button 
        onClick={fetchBalance}
        className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
      >
        🔄 Actualiser
      </button>
    </div>
  );
}
```

## 🔍 Étape 8 : Tests et débogage

### 8.1 Activer les logs de debug
```typescript
// Dans votre configuration
const orangeMoney = new OrangeMoneyMaliClient({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  merchantKey: 'your-merchant-key',
  environment: 'sandbox' // Mode sandbox pour les tests
});

// Les logs sont automatiquement activés en mode développement
```

### 8.2 Tester avec des numéros maliens
```typescript
const testNumbers = [
  '+22370123456', // Orange Mali valide
  '+22360123456', // Malitel valide 
  '70123456',     // Format local Orange
  '60123456'      // Format local Malitel
];

testNumbers.forEach(number => {
  console.log(`${number}: ${validateMaliPhoneNumber(number) ? '✅' : '❌'}`);
});
```

### 8.3 Test des codes USSD
```typescript
import { generateUssdCode } from './src/lib/orange-money-mali';

// Générer des codes USSD de test
const merchantKey = 'TEST123';
const amounts = [100, 500, 1000, 5000];

amounts.forEach(amount => {
  const ussdCode = generateUssdCode(amount, merchantKey);
  console.log(`${amount} FCFA: ${ussdCode}`);
});
```

## ✅ Checklist finale

- [ ] Compte Orange Developer créé et validé
- [ ] Application créée avec API Orange Money Mali
- [ ] Client ID et Client Secret récupérés
- [ ] Merchant Key obtenue d'Orange Mali
- [ ] Module Orange Money Mali installé
- [ ] Variables d'environnement configurées
- [ ] Test de configuration réussi
- [ ] Premier paiement USSD généré
- [ ] Validation des numéros maliens testée
- [ ] Hooks React intégrés (si applicable)

## 🆘 Résolution des problèmes courants

### Erreur : "Invalid client credentials"
- Vérifiez vos Client ID et Client Secret
- Assurez-vous d'être en mode production avec de vraies clés

### Numéro de téléphone invalide
- Utilisez le format +223XXXXXXXX
- Numéros Orange Mali : +22370XXXXXX
- Numéros Malitel : +22360XXXXXX

### Merchant Key invalide
- Contactez le support Orange Mali
- Vérifiez que la merchant key correspond à votre application

### Code USSD ne fonctionne pas
- Vérifiez que le numéro est bien Orange Money
- Assurez-vous que le compte a un solde suffisant
- Testez avec un petit montant (100 FCFA)

### Erreur d'authentification
- Les tokens OAuth2 expirent (vérifiez l'heure)
- Rechargez l'application pour obtenir un nouveau token

## 📞 Support

- Portal Orange Developer : [https://developer.orange.com](https://developer.orange.com)
- Support Orange Mali : [support Mali]
- Documentation API : Dans votre portail développeur
- Issues GitHub : [Créer une issue](https://github.com/yourrepo/issues)

Félicitations ! 🎉 Votre intégration Orange Money Mali est maintenant prête ! 