# Guide de Configuration CinetPay - Étape par Étape

Ce guide vous accompagne dans la mise en place complète du module CinetPay dans votre projet.

## 📋 Prérequis

- [ ] Compte CinetPay créé
- [ ] Node.js installé (version 16+)
- [ ] TypeScript configuré dans votre projet
- [ ] Accès aux variables d'environnement

## 🚀 Étape 1 : Création du compte CinetPay

### 1.1 Inscription
1. Rendez-vous sur [https://cinetpay.com](https://cinetpay.com)
2. Cliquez sur "S'inscrire" ou "Créer un compte"
3. Remplissez le formulaire d'inscription
4. Validez votre email

### 1.2 Vérification du compte
1. Connectez-vous à votre dashboard
2. Complétez les informations de votre entreprise
3. Uploadez les documents requis (selon votre pays)
4. Attendez la validation (généralement 24-48h)

### 1.3 Récupération des clés API
1. Une fois validé, allez dans **Paramètres** > **API & Intégrations**
2. Copiez votre `API Key` et `Site ID`
3. **IMPORTANT** : Gardez ces clés secrètes !

## 🔧 Étape 2 : Installation du module

### 2.1 Copier le module
```bash
# Depuis votre projet source
cp -r src/lib/cinetpay /path/to/your/new/project/src/lib/

# Ou créer le dossier et copier les fichiers individuellement
mkdir -p src/lib/cinetpay
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

### 3.2 Ajouter les variables CinetPay
```env
# Configuration CinetPay
CINETPAY_API_KEY=your-api-key-here
CINETPAY_SITE_ID=your-site-id-here
CINETPAY_NOTIFY_URL=https://yourapp.com/webhook/cinetpay
CINETPAY_ENVIRONMENT=production

# Pour les projets Vite/React (préfixe VITE_)
VITE_CINETPAY_API_KEY=your-api-key-here
VITE_CINETPAY_SITE_ID=your-site-id-here
VITE_CINETPAY_NOTIFY_URL=https://yourapp.com/webhook/cinetpay
VITE_CINETPAY_ENVIRONMENT=production

# Pour les projets Next.js (préfixe NEXT_PUBLIC_ pour le client)
NEXT_PUBLIC_CINETPAY_API_KEY=your-api-key-here
NEXT_PUBLIC_CINETPAY_SITE_ID=your-site-id-here
CINETPAY_NOTIFY_URL=https://yourapp.com/webhook/cinetpay
CINETPAY_ENVIRONMENT=production
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
// test-cinetpay.ts
import { CinetPayClient, createConfigFromEnv } from './src/lib/cinetpay';

async function testConfig() {
  try {
    const config = createConfigFromEnv();
    const client = new CinetPayClient(config);
    
    console.log('✅ Configuration CinetPay OK');
    console.log('API Key:', config.apiKey.substring(0, 10) + '...');
    console.log('Site ID:', config.siteId);
    console.log('Environment:', config.environment);
    
    // Test de génération d'ID de transaction
    const transactionId = client.generateTransactionId();
    console.log('Transaction ID généré:', transactionId);
    
  } catch (error) {
    console.error('❌ Erreur de configuration:', error);
  }
}

testConfig();
```

### 4.2 Exécuter le test
```bash
npx ts-node test-cinetpay.ts
```

## 🌐 Étape 5 : Configuration du webhook

### 5.1 Créer l'endpoint webhook

**Pour Express.js :**
```typescript
// webhook.ts
import express from 'express';
import { CinetPayClient, createConfigFromEnv } from './src/lib/cinetpay';

const app = express();
app.use(express.json());

const cinetpay = new CinetPayClient(createConfigFromEnv());

app.post('/webhook/cinetpay', async (req, res) => {
  try {
    console.log('Webhook reçu:', req.body);
    
    const paymentStatus = await cinetpay.handleWebhook(req.body);
    
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
  // Votre logique de traitement
  console.log('Traitement du paiement réussi:', payment.transactionId);
}

async function handlePaymentFailure(payment: any) {
  // Votre logique d'échec
  console.log('Traitement de l'échec:', payment.transactionId);
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

**Pour Next.js :**
```typescript
// pages/api/webhook/cinetpay.ts ou app/api/webhook/cinetpay/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { CinetPayClient, createConfigFromEnv } from '@/lib/cinetpay';

const cinetpay = new CinetPayClient(createConfigFromEnv());

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const paymentStatus = await cinetpay.handleWebhook(req.body);
    
    if (paymentStatus) {
      // Traiter le paiement
      console.log('Paiement:', paymentStatus);
      
      res.status(200).json({ message: 'OK' });
    } else {
      res.status(400).json({ error: 'Invalid webhook' });
    }
  } catch (error) {
    console.error('Erreur webhook:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
```

### 5.2 Configurer l'URL dans CinetPay
1. Connectez-vous à votre dashboard CinetPay
2. Allez dans **Paramètres** > **Webhooks**
3. Ajoutez l'URL : `https://yourapp.com/webhook/cinetpay`
4. Testez la connexion

## 💳 Étape 6 : Créer votre premier paiement

### 6.1 Implémentation basique
```typescript
// payment.ts
import { CinetPayClient, createConfigFromEnv } from './src/lib/cinetpay';

const cinetpay = new CinetPayClient(createConfigFromEnv());

export async function createPayment() {
  const paymentRequest = {
    transactionId: cinetpay.generateTransactionId(),
    amount: 1000, // 1000 FCFA
    currency: 'XOF',
    description: 'Test de paiement',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phoneNumber: '+22500000000'
    },
    returnUrl: 'https://yourapp.com/payment-success',
    cancelUrl: 'https://yourapp.com/payment-cancel'
  };

  try {
    const response = await cinetpay.createPayment(paymentRequest);
    
    if (response.success) {
      console.log('Paiement créé:', response.paymentUrl);
      return response.paymentUrl;
    } else {
      console.error('Erreur:', response.error);
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error);
    throw error;
  }
}
```

### 6.2 Test du paiement
```typescript
// test-payment.ts
import { createPayment } from './payment';

async function testPayment() {
  try {
    const paymentUrl = await createPayment();
    console.log('✅ Paiement créé avec succès !');
    console.log('URL de paiement:', paymentUrl);
    
    // En développement, vous pouvez ouvrir cette URL
    if (process.env.NODE_ENV === 'development') {
      console.log('Ouvrez cette URL dans votre navigateur pour tester le paiement');
    }
  } catch (error) {
    console.error('❌ Erreur lors du test de paiement:', error);
  }
}

testPayment();
```

## 🎨 Étape 7 : Intégration avec React (optionnel)

### 7.1 Composant de paiement simple
```tsx
// components/PaymentButton.tsx
import React from 'react';
import { useCinetPay } from '@/lib/cinetpay/react-hooks';

interface PaymentButtonProps {
  amount: number;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export function PaymentButton({ 
  amount, 
  description, 
  customerName, 
  customerEmail, 
  customerPhone 
}: PaymentButtonProps) {
  const { createPayment, isLoading, error } = useCinetPay({
    apiKey: process.env.NEXT_PUBLIC_CINETPAY_API_KEY!,
    siteId: process.env.NEXT_PUBLIC_CINETPAY_SITE_ID!,
    environment: 'production'
  });

  const handlePayment = async () => {
    try {
      const response = await createPayment({
        transactionId: `TXN_${Date.now()}`,
        amount,
        currency: 'XOF',
        description,
        customer: {
          name: customerName,
          email: customerEmail,
          phoneNumber: customerPhone
        },
        returnUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-cancel`
      });

      if (response.success && response.paymentUrl) {
        window.location.href = response.paymentUrl;
      }
    } catch (error) {
      console.error('Erreur de paiement:', error);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {isLoading ? 'Traitement...' : `Payer ${amount} FCFA`}
      </button>
      {error && (
        <p className="text-red-500 mt-2">Erreur: {error}</p>
      )}
    </div>
  );
}
```

### 7.2 Page de succès
```tsx
// pages/payment-success.tsx
import React, { useEffect } from 'react';
import { usePaymentReturn } from '@/lib/cinetpay/react-hooks';

export default function PaymentSuccess() {
  const paymentResult = usePaymentReturn();

  useEffect(() => {
    if (paymentResult.transactionId && paymentResult.status === 'success') {
      // Optionnel : vérifier le paiement côté serveur
      console.log('Paiement réussi:', paymentResult.transactionId);
    }
  }, [paymentResult]);

  if (!paymentResult.transactionId) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-green-100 rounded-lg">
      {paymentResult.status === 'success' && (
        <>
          <h1 className="text-2xl font-bold text-green-800 mb-4">
            ✅ Paiement Réussi !
          </h1>
          <p className="text-green-700">
            Votre paiement a été traité avec succès.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Transaction ID: {paymentResult.transactionId}
          </p>
        </>
      )}
      {paymentResult.status === 'cancelled' && (
        <h1 className="text-2xl font-bold text-yellow-800">
          🚫 Paiement Annulé
        </h1>
      )}
      {paymentResult.status === 'error' && (
        <h1 className="text-2xl font-bold text-red-800">
          ❌ Erreur de Paiement
        </h1>
      )}
    </div>
  );
}
```

## 🔍 Étape 8 : Tests et débogage

### 8.1 Activer les logs
```typescript
// Dans votre configuration
const cinetpay = new CinetPayClient({
  apiKey: 'your-api-key',
  siteId: 'your-site-id',
  environment: 'sandbox' // Utiliser sandbox pour les tests
});

// Les logs sont automatiquement activés en mode développement
```

### 8.2 Tester avec des données factices
```typescript
const testData = {
  customer: {
    name: 'Test User',
    email: 'test@cinetpay.com',
    phoneNumber: '+22500000000' // Numéro de test CinetPay
  },
  amount: 100, // Petit montant pour les tests
  currency: 'XOF'
};
```

### 8.3 Vérifier les webhooks
```bash
# Utiliser ngrok pour exposer votre serveur local
npm install -g ngrok
ngrok http 3000

# Utiliser l'URL générée comme webhook dans CinetPay
# https://abc123.ngrok.io/webhook/cinetpay
```

## ✅ Checklist finale

- [ ] Compte CinetPay validé
- [ ] Clés API récupérées et sécurisées  
- [ ] Module CinetPay installé
- [ ] Variables d'environnement configurées
- [ ] Webhook endpoint créé et testé
- [ ] Premier paiement test réussi
- [ ] Gestion des retours de paiement implémentée
- [ ] Logs et monitoring en place

## 🆘 Résolution des problèmes courants

### Erreur : "Invalid API key"
- Vérifiez que votre clé API est correcte
- Assurez-vous d'être en mode production avec une vraie clé

### Webhook non reçu
- Vérifiez l'URL du webhook dans le dashboard CinetPay
- Testez avec ngrok en développement
- Vérifiez les logs de votre serveur

### Paiement non confirmé
- Vérifiez les logs du webhook
- Testez la validation de signature
- Vérifiez que le montant correspond

### Erreur de CORS
- Configurez CORS sur votre serveur
- Vérifiez les headers de votre API

## 📞 Support

- Documentation CinetPay : [https://docs.cinetpay.com](https://docs.cinetpay.com)
- Support CinetPay : support@cinetpay.com
- Issues GitHub : [Créer une issue](https://github.com/yourrepo/issues)

Félicitations ! 🎉 Votre intégration CinetPay est maintenant prête ! 