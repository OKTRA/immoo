# Orange Money Mali Payment Module

Module de paiement Orange Money Mali portable et réutilisable pour tous vos projets TypeScript/JavaScript.

## 🚀 Installation

Copiez simplement le dossier `orange-money-mali` dans votre projet et configurez vos clés API.

```bash
# Copier le module dans votre projet
cp -r src/lib/orange-money-mali /path/to/your/project/src/lib/
```

## ⚙️ Configuration

### Option 1: Configuration manuelle

```typescript
import { OrangeMoneyMaliClient } from './lib/orange-money-mali';

const config = {
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  merchantKey: 'your-merchant-key',
  environment: 'production' // ou 'sandbox'
};

const orangeMoney = new OrangeMoneyMaliClient(config);
```

### Option 2: Configuration depuis les variables d'environnement

```typescript
import { OrangeMoneyMaliClient, createConfigFromEnv } from './lib/orange-money-mali';

const config = createConfigFromEnv();
const orangeMoney = new OrangeMoneyMaliClient(config);
```

### Variables d'environnement requises

Créez un fichier `.env` avec les variables suivantes :

```env
# Orange Money Mali Configuration
ORANGE_MONEY_CLIENT_ID=your-client-id-here
ORANGE_MONEY_CLIENT_SECRET=your-client-secret-here
ORANGE_MONEY_MERCHANT_KEY=your-merchant-key-here
ORANGE_MONEY_ENVIRONMENT=production

# Pour Vite/React (préfixe VITE_)
VITE_ORANGE_MONEY_CLIENT_ID=your-client-id-here
VITE_ORANGE_MONEY_CLIENT_SECRET=your-client-secret-here
VITE_ORANGE_MONEY_MERCHANT_KEY=your-merchant-key-here
VITE_ORANGE_MONEY_ENVIRONMENT=production
```

## 🔧 Obtenir vos clés Orange Money

1. **Créer un compte développeur Orange**
   - Rendez-vous sur [Orange Developer Portal](https://developer.orange.com)
   - Créez votre compte développeur

2. **Créer une application**
   - Dans le portail, créez une nouvelle application
   - Sélectionnez l'API "Orange Money Mali"
   - Récupérez vos `Client ID` et `Client Secret`

3. **Obtenir votre Merchant Key**
   - Contactez Orange Mali pour obtenir votre clé marchand
   - Ou utilisez la clé fournie lors de l'inscription marchand

## 📖 Utilisation de base

### Créer un paiement

```typescript
import { OrangeMoneyMaliClient } from './lib/orange-money-mali';

const orangeMoney = new OrangeMoneyMaliClient({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  merchantKey: 'your-merchant-key',
  environment: 'production'
});

const paymentRequest = {
  transactionId: orangeMoney.generateTransactionId(),
  amount: 1000, // Montant en FCFA
  currency: 'XOF',
  description: 'Abonnement Premium',
  customer: {
    phoneNumber: '+22370123456',
    firstName: 'Amadou',
    lastName: 'Diarra',
    email: 'amadou@example.com'
  },
  returnUrl: 'https://yourapp.com/payment-success',
  cancelUrl: 'https://yourapp.com/payment-cancel'
};

const response = await orangeMoney.createPayment(paymentRequest);

if (response.success) {
  console.log('Code USSD:', response.ussdCode);
  console.log('QR Code:', response.qrCode);
  
  // Afficher le code USSD à l'utilisateur
  alert(`Composez ce code: ${response.ussdCode}`);
} else {
  console.error('Erreur:', response.error);
}
```

### Vérifier un paiement

```typescript
const status = await orangeMoney.getPaymentStatus('TRANSACTION_ID');

if (status) {
  console.log('Status:', status.status);
  console.log('Amount:', status.amount);
  console.log('Currency:', status.currency);
  console.log('Fees:', status.fees);
  
  if (status.status === 'completed') {
    console.log('Paiement confirmé !');
  }
}
```

### Vérifier le solde

```typescript
const balance = await orangeMoney.getBalance();

if (balance.success) {
  console.log(`Solde: ${balance.balance} ${balance.currency}`);
  console.log('Statut du compte:', balance.accountStatus);
}
```

### Gérer les webhooks

```typescript
// Dans votre endpoint webhook (Express.js exemple)
app.post('/webhook/orange-money', async (req, res) => {
  const payload = req.body;
  const paymentStatus = await orangeMoney.handleWebhook(payload);
  
  if (paymentStatus) {
    console.log('Paiement reçu:', paymentStatus);
    
    switch (paymentStatus.status) {
      case 'completed':
        await activateUserService(paymentStatus.transactionId);
        break;
      case 'failed':
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
import { useOrangeMoneyMali } from './lib/orange-money-mali/react-hooks';

function PaymentComponent() {
  const { createPayment, isLoading, error } = useOrangeMoneyMali({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    merchantKey: 'your-merchant-key',
    environment: 'production'
  });

  const handlePayment = async () => {
    const response = await createPayment({
      transactionId: Date.now().toString(),
      amount: 1000,
      currency: 'XOF',
      description: 'Test payment',
      customer: {
        phoneNumber: '+22370123456',
        firstName: 'Amadou',
        lastName: 'Diarra'
      }
    });

    if (response.success) {
      alert(`Code USSD: ${response.ussdCode}`);
    }
  };

  return (
    <div>
      <button onClick={handlePayment} disabled={isLoading}>
        {isLoading ? 'Traitement...' : 'Payer avec Orange Money'}
      </button>
      {error && <p>Erreur: {error}</p>}
    </div>
  );
}
```

### Hook simplifié

```typescript
import { useSimpleOrangeMoneyPayment } from './lib/orange-money-mali/react-hooks';

function QuickPayment() {
  const { pay, payWithUSSD, isLoading, error } = useSimpleOrangeMoneyPayment({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    merchantKey: 'your-merchant-key'
  });

  const handleUSSDPayment = async () => {
    const response = await payWithUSSD(
      5000, // Montant
      '+22370123456', // Téléphone
      'Amadou', // Prénom
      'Diarra', // Nom
      'Abonnement mensuel' // Description
    );
    
    if (response?.success) {
      console.log('Code USSD généré:', response.ussdCode);
    }
  };

  return (
    <button onClick={handleUSSDPayment} disabled={isLoading}>
      Payer 5000 FCFA via USSD
    </button>
  );
}
```

### Vérification du solde

```typescript
import { useOrangeMoneyBalance } from './lib/orange-money-mali/react-hooks';

function BalanceDisplay() {
  const { balance, currency, isLoading, error, fetchBalance } = useOrangeMoneyBalance({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    merchantKey: 'your-merchant-key'
  });

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  if (isLoading) return <div>Chargement du solde...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h3>Solde Orange Money</h3>
      <p>{balance?.toLocaleString()} {currency}</p>
      <button onClick={fetchBalance}>Actualiser</button>
    </div>
  );
}
```

## 🌍 Fonctionnalités supportées

### ✅ Types de paiement
- **Orange Money Mali** : Paiements via USSD
- **QR Code** : Paiements par scan
- **Transfer** : Transferts entre comptes
- **Balance Check** : Vérification de solde

### ✅ Devises supportées
- `XOF` - Franc CFA (Mali)

### ✅ Fonctionnalités Mali
- ✅ **Numéros Orange Mali** : Validation +223 6X/7X
- ✅ **Codes USSD** : Génération automatique
- ✅ **QR Codes** : Pour paiements mobiles
- ✅ **Transferts** : Entre comptes Orange Money
- ✅ **Vérification de solde** : Solde marchand

## 🔒 Sécurité

- ✅ **Authentication OAuth2** : Tokens sécurisés
- ✅ **Validation des signatures webhook**
- ✅ **Gestion sécurisée des clés API**
- ✅ **Validation des numéros maliens**
- ✅ **Chiffrement des données sensibles**

## 📱 Codes USSD

Le module génère automatiquement les codes USSD pour Orange Money Mali :

```typescript
// Code généré automatiquement
const ussdCode = "#144*4*4*MERCHANT_CODE*AMOUNT#";

// Exemple pour 1000 FCFA
// #144*4*4*1234*1000#
```

## 🐛 Gestion d'erreurs

```typescript
const response = await orangeMoney.createPayment(paymentRequest);

if (!response.success) {
  switch (response.error) {
    case 'Invalid phone number':
      console.error('Numéro de téléphone invalide');
      break;
    case 'Insufficient balance':
      console.error('Solde insuffisant');
      break;
    case 'Invalid amount':
      console.error('Montant invalide (min: 100 FCFA)');
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
  clientId: 'your-sandbox-client-id',
  clientSecret: 'your-sandbox-secret',
  merchantKey: 'your-sandbox-merchant-key',
  environment: 'sandbox'
};

const orangeMoney = new OrangeMoneyMaliClient(testConfig);
```

### Numéros de test

Pour tester avec Orange Money Mali :

```typescript
const testPayment = {
  customer: {
    phoneNumber: '+22370000000', // Numéro de test
    firstName: 'Test',
    lastName: 'User'
  },
  amount: 100 // Montant minimum
};
```

## 📦 API Reference

### OrangeMoneyMaliClient

#### `createPayment(request: PaymentRequest): Promise<PaymentResponse>`
Crée une demande de paiement et retourne les codes USSD/QR.

#### `verifyTransaction(transactionId: string): Promise<TransactionVerificationResponse>`
Vérifie le statut d'une transaction.

#### `getPaymentStatus(transactionId: string): Promise<PaymentStatus | null>`
Récupère le statut détaillé d'un paiement.

#### `handleWebhook(payload: WebhookPayload): Promise<PaymentStatus | null>`
Traite les notifications webhook d'Orange Money.

#### `getBalance(): Promise<BalanceResponse>`
Vérifie le solde du compte marchand.

#### `transferMoney(request: TransferRequest): Promise<PaymentResponse>`
Effectue un transfert entre comptes.

#### `generateTransactionId(prefix?: string): string`
Génère un ID de transaction unique.

### Utilitaires

#### `validateMaliPhoneNumber(phoneNumber: string): boolean`
Valide un numéro de téléphone malien.

#### `formatMaliPhoneNumber(phoneNumber: string): string`
Formate un numéro au format international.

#### `generateUssdCode(amount: number, merchantCode: string): string`
Génère un code USSD pour le paiement.

#### `generateQRCodeData(merchantCode: string, amount: number, transactionId: string): string`
Génère les données pour un QR code.

## 🚀 Déploiement

1. **Variables d'environnement**
   ```bash
   # Production
   ORANGE_MONEY_CLIENT_ID=your-production-client-id
   ORANGE_MONEY_CLIENT_SECRET=your-production-secret
   ORANGE_MONEY_MERCHANT_KEY=your-production-merchant-key
   ORANGE_MONEY_ENVIRONMENT=production
   ```

2. **Webhook URL**
   - Configurez votre URL de webhook dans le portail Orange Developer
   - Format : `https://yourapp.com/webhook/orange-money`

3. **URLs de retour**
   - Success : `https://yourapp.com/payment-success`
   - Annulation : `https://yourapp.com/payment-cancel`

## 📝 Licence

MIT - Libre d'utilisation dans tous vos projets

## 🤝 Support

- 📧 Email : support@yourapp.com
- 📖 Documentation Orange : [https://developer.orange.com](https://developer.orange.com)
- 🐛 Issues : Créez une issue dans votre repository

## 🔄 Changelog

### v1.0.0
- ✨ Premier release
- ✅ Support complet de l'API Orange Money Mali
- ✅ Hooks React
- ✅ TypeScript
- ✅ Gestion des webhooks
- ✅ Codes USSD automatiques
- ✅ QR Codes
- ✅ Transferts et vérification de solde 