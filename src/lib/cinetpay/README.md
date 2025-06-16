# CinetPay Payment Module

Module de paiement CinetPay portable et réutilisable pour tous vos projets TypeScript/JavaScript.

## 🚀 Installation

Copiez simplement le dossier `cinetpay` dans votre projet et configurez vos clés API.

```bash
# Copier le module dans votre projet
cp -r src/lib/cinetpay /path/to/your/project/src/lib/
```

## ⚙️ Configuration

### Option 1: Configuration manuelle

```typescript
import { CinetPayClient } from './lib/cinetpay';

const config = {
  apiKey: 'your-api-key',
  siteId: 'your-site-id',
  notifyUrl: 'https://yourapp.com/webhook/cinetpay',
  environment: 'production' // ou 'sandbox'
};

const cinetpay = new CinetPayClient(config);
```

### Option 2: Configuration depuis les variables d'environnement

```typescript
import { CinetPayClient, createConfigFromEnv } from './lib/cinetpay';

const config = createConfigFromEnv();
const cinetpay = new CinetPayClient(config);
```

### Variables d'environnement requises

Créez un fichier `.env` avec les variables suivantes :

```env
# CinetPay Configuration
CINETPAY_API_KEY=your-api-key-here
CINETPAY_SITE_ID=your-site-id-here
CINETPAY_NOTIFY_URL=https://yourapp.com/webhook/cinetpay
CINETPAY_ENVIRONMENT=production

# Pour Vite/React (préfixe VITE_)
VITE_CINETPAY_API_KEY=your-api-key-here
VITE_CINETPAY_SITE_ID=your-site-id-here
VITE_CINETPAY_NOTIFY_URL=https://yourapp.com/webhook/cinetpay
VITE_CINETPAY_ENVIRONMENT=production
```

## 🔧 Obtenir vos clés CinetPay

1. **Créer un compte CinetPay**
   - Rendez-vous sur [https://cinetpay.com](https://cinetpay.com)
   - Créez votre compte marchand

2. **Récupérer vos clés**
   - Connectez-vous à votre dashboard CinetPay
   - Allez dans **Paramètres** > **API & Webhooks**
   - Copiez votre `API Key` et `Site ID`

3. **Configurer l'URL de notification (Webhook)**
   - Dans le dashboard, configurez l'URL de webhook : `https://yourapp.com/webhook/cinetpay`
   - Cette URL recevra les notifications de paiement

## 📖 Utilisation de base

### Créer un paiement

```typescript
import { CinetPayClient } from './lib/cinetpay';

const cinetpay = new CinetPayClient({
  apiKey: 'your-api-key',
  siteId: 'your-site-id',
  environment: 'production'
});

const paymentRequest = {
  transactionId: cinetpay.generateTransactionId(),
  amount: 1000, // Montant en FCFA
  currency: 'XOF',
  description: 'Abonnement Premium',
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+22500000000'
  },
  returnUrl: 'https://yourapp.com/payment-success',
  cancelUrl: 'https://yourapp.com/payment-cancel'
};

const response = await cinetpay.createPayment(paymentRequest);

if (response.success) {
  // Rediriger l'utilisateur vers l'URL de paiement
  window.location.href = response.paymentUrl;
} else {
  console.error('Erreur:', response.error);
}
```

### Vérifier un paiement

```typescript
const status = await cinetpay.getPaymentStatus('TRANSACTION_ID');

if (status) {
  console.log('Status:', status.status);
  console.log('Amount:', status.amount);
  console.log('Currency:', status.currency);
  
  if (status.status === 'completed') {
    // Paiement réussi - activer le service
    console.log('Paiement confirmé !');
  }
}
```

### Gérer les webhooks

```typescript
// Dans votre endpoint webhook (Express.js exemple)
app.post('/webhook/cinetpay', async (req, res) => {
  const payload = req.body;
  const paymentStatus = await cinetpay.handleWebhook(payload);
  
  if (paymentStatus) {
    console.log('Paiement reçu:', paymentStatus);
    
    switch (paymentStatus.status) {
      case 'completed':
        // Activer le service/produit
        await activateUserService(paymentStatus.transactionId);
        break;
      case 'failed':
        // Gérer l'échec du paiement
        await handlePaymentFailure(paymentStatus.transactionId);
        break;
    }
  }
  
  res.status(200).send('OK');
});
```

## ⚛️ Utilisation avec React

### Hook basique

```typescript
import { useCinetPay } from './lib/cinetpay/react-hooks';

function PaymentComponent() {
  const { createPayment, isLoading, error } = useCinetPay({
    apiKey: 'your-api-key',
    siteId: 'your-site-id',
    environment: 'production'
  });

  const handlePayment = async () => {
    const response = await createPayment({
      transactionId: generateTransactionId(),
      amount: 1000,
      currency: 'XOF',
      description: 'Test payment',
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+22500000000'
      },
      returnUrl: window.location.origin + '/payment-success'
    });

    if (response.success) {
      window.location.href = response.paymentUrl;
    }
  };

  return (
    <div>
      <button onClick={handlePayment} disabled={isLoading}>
        {isLoading ? 'Traitement...' : 'Payer maintenant'}
      </button>
      {error && <p>Erreur: {error}</p>}
    </div>
  );
}
```

### Hook simplifié

```typescript
import { useSimplePayment } from './lib/cinetpay/react-hooks';

function QuickPayment() {
  const { pay, isLoading, error } = useSimplePayment({
    apiKey: 'your-api-key',
    siteId: 'your-site-id'
  });

  const handleQuickPay = () => {
    pay(
      5000, // Montant
      'XOF', // Devise
      'Abonnement mensuel', // Description
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phoneNumber: '+22600000000'
      }
    );
  };

  return (
    <button onClick={handleQuickPay} disabled={isLoading}>
      Payer 5000 FCFA
    </button>
  );
}
```

### Gérer les retours de paiement

```typescript
import { usePaymentReturn } from './lib/cinetpay/react-hooks';

function PaymentSuccess() {
  const paymentResult = usePaymentReturn();

  if (paymentResult.transactionId) {
    return (
      <div>
        {paymentResult.status === 'success' && (
          <h2>Paiement réussi ! Transaction: {paymentResult.transactionId}</h2>
        )}
        {paymentResult.status === 'cancelled' && (
          <h2>Paiement annulé</h2>
        )}
        {paymentResult.status === 'error' && (
          <h2>Erreur lors du paiement</h2>
        )}
      </div>
    );
  }

  return <div>Aucun résultat de paiement</div>;
}
```

## 🌍 Fonctionnalités supportées

### ✅ Types de paiement
- **Mobile Money** : Orange Money, MTN Money, Moov Money, Wave, etc.
- **Cartes bancaires** : Visa, Mastercard
- **Virements bancaires**
- **Tous les canaux CinetPay**

### ✅ Devises supportées
- `XOF` - Franc CFA (BCEAO)
- `XAF` - Franc CFA (CEMAC)
- `EUR` - Euro
- `USD` - Dollar américain
- `GHS` - Cedi ghanéen
- `CDF` - Franc congolais
- `GNF` - Franc guinéen
- `SLL` - Leone sierra-léonais

### ✅ Pays supportés
- 🇨🇮 Côte d'Ivoire
- 🇸🇳 Sénégal
- 🇲🇱 Mali
- 🇧🇫 Burkina Faso
- 🇹🇬 Togo
- 🇧🇯 Bénin
- 🇳🇪 Niger
- 🇬🇭 Ghana
- 🇨🇲 Cameroun
- 🇨🇩 RD Congo
- 🇬🇳 Guinée
- 🇸🇱 Sierra Leone

## 🔒 Sécurité

- ✅ **Validation des signatures webhook**
- ✅ **Vérification des montants**
- ✅ **Gestion sécurisée des clés API**
- ✅ **Protection contre les attaques replay**
- ✅ **Validation des données client**

## 🐛 Gestion d'erreurs

```typescript
const response = await cinetpay.createPayment(paymentRequest);

if (!response.success) {
  switch (response.error) {
    case 'Invalid API key':
      console.error('Clé API invalide');
      break;
    case 'Insufficient funds':
      console.error('Fonds insuffisants');
      break;
    default:
      console.error('Erreur:', response.error);
  }
}
```

## 🧪 Tests

### Environnement de test (Sandbox)

```typescript
const testConfig = {
  apiKey: 'your-sandbox-api-key',
  siteId: 'your-sandbox-site-id',
  environment: 'sandbox'
};

const cinetpay = new CinetPayClient(testConfig);
```

### Numéros de test

Pour tester les paiements en mode sandbox :

```typescript
const testPayment = {
  // ... autres paramètres
  customer: {
    name: 'Test User',
    email: 'test@cinetpay.com',
    phoneNumber: '+22500000000' // Numéro de test
  }
};
```

## 📦 API Reference

### CinetPayClient

#### `createPayment(request: PaymentRequest): Promise<PaymentResponse>`
Crée une demande de paiement et retourne l'URL de redirection.

#### `verifyTransaction(transactionId: string): Promise<TransactionVerificationResponse>`
Vérifie le statut d'une transaction.

#### `getPaymentStatus(transactionId: string): Promise<PaymentStatus | null>`
Récupère le statut détaillé d'un paiement.

#### `handleWebhook(payload: WebhookPayload): Promise<PaymentStatus | null>`
Traite les notifications webhook de CinetPay.

#### `generateTransactionId(prefix?: string): string`
Génère un ID de transaction unique.

### Utilitaires

#### `formatCurrency(amount: number, currency: string): string`
Formate un montant avec la devise appropriée.

#### `validatePhoneNumber(phoneNumber: string): boolean`
Valide un numéro de téléphone africain.

#### `validateEmail(email: string): boolean`
Valide une adresse email.

## 🚀 Déploiement

1. **Variables d'environnement**
   ```bash
   # Production
   CINETPAY_API_KEY=your-production-api-key
   CINETPAY_SITE_ID=your-production-site-id
   CINETPAY_ENVIRONMENT=production
   ```

2. **Webhook URL**
   - Configurez votre URL de webhook dans le dashboard CinetPay
   - Format : `https://yourapp.com/webhook/cinetpay`

3. **URLs de retour**
   - Success : `https://yourapp.com/payment-success`
   - Annulation : `https://yourapp.com/payment-cancel`

## 📝 Licence

MIT - Libre d'utilisation dans tous vos projets

## 🤝 Support

- 📧 Email : support@yourapp.com
- 📖 Documentation CinetPay : [https://docs.cinetpay.com](https://docs.cinetpay.com)
- 🐛 Issues : Créez une issue dans votre repository

## 🔄 Changelog

### v1.0.0
- ✨ Premier release
- ✅ Support complet de l'API CinetPay
- ✅ Hooks React
- ✅ TypeScript
- ✅ Gestion des webhooks
- ✅ Validation de sécurité 