/**
 * CinetPay Module - Exemple d'utilisation complète
 * 
 * Ce fichier montre comment utiliser le module CinetPay
 * dans différents scénarios
 */

import { CinetPayClient, createConfigFromEnv } from './index';
import type { PaymentRequest, PaymentStatus } from './types';

// =====================================================
// 1. Configuration et initialisation
// =====================================================

// Option 1: Configuration manuelle
const manualConfig = {
  apiKey: 'your-api-key-here',
  siteId: 'your-site-id-here',
  notifyUrl: 'https://yourapp.com/webhook/cinetpay',
  environment: 'production' as const
};

// Option 2: Configuration depuis les variables d'environnement
const envConfig = createConfigFromEnv();

// Initialiser le client
const cinetpay = new CinetPayClient(envConfig);

// =====================================================
// 2. Créer un paiement simple
// =====================================================

export async function createSimplePayment() {
  const paymentRequest: PaymentRequest = {
    transactionId: cinetpay.generateTransactionId('PAY'),
    amount: 5000,
    currency: 'XOF',
    description: 'Abonnement Premium mensuel',
    customer: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+22500000000',
      address: 'Cocody, Abidjan',
      city: 'Abidjan',
      country: 'CI'
    },
    returnUrl: 'https://yourapp.com/payment-success',
    cancelUrl: 'https://yourapp.com/payment-cancel',
    channels: 'ALL',
    metadata: {
      userId: '12345',
      planType: 'premium',
      duration: '1-month'
    }
  };

  try {
    const response = await cinetpay.createPayment(paymentRequest);
    
    if (response.success) {
      console.log('Payment URL créée:', response.paymentUrl);
      console.log('Transaction ID:', response.transactionId);
      
      // Rediriger l'utilisateur (si dans un navigateur)
      if (typeof window !== 'undefined') {
        window.location.href = response.paymentUrl!;
      }
      
      return response;
    } else {
      console.error('Erreur lors de la création du paiement:', response.error);
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}

// =====================================================
// 3. Vérifier le statut d'une transaction
// =====================================================

export async function checkTransactionStatus(transactionId: string) {
  try {
    const status = await cinetpay.getPaymentStatus(transactionId);
    
    if (status) {
      console.log('Statut de la transaction:', {
        id: status.transactionId,
        status: status.status,
        amount: status.amount,
        currency: status.currency,
        paymentMethod: status.paymentMethod,
        paymentDate: status.paymentDate
      });
      
      switch (status.status) {
        case 'completed':
          console.log('✅ Paiement confirmé !');
          await handleSuccessfulPayment(status);
          break;
        case 'pending':
          console.log('⏳ Paiement en attente...');
          break;
        case 'failed':
          console.log('❌ Paiement échoué');
          await handleFailedPayment(status);
          break;
        case 'cancelled':
          console.log('🚫 Paiement annulé');
          break;
      }
      
      return status;
    } else {
      console.log('Transaction non trouvée');
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    throw error;
  }
}

// =====================================================
// 4. Gérer les webhooks
// =====================================================

export async function handleWebhookNotification(webhookPayload: any) {
  try {
    console.log('Webhook reçu:', webhookPayload);
    
    const paymentStatus = await cinetpay.handleWebhook(webhookPayload);
    
    if (paymentStatus) {
      console.log('Notification de paiement validée:', paymentStatus);
      
      // Traiter selon le statut
      switch (paymentStatus.status) {
        case 'completed':
          await handleSuccessfulPayment(paymentStatus);
          break;
        case 'failed':
          await handleFailedPayment(paymentStatus);
          break;
        case 'cancelled':
          await handleCancelledPayment(paymentStatus);
          break;
      }
      
      return { success: true, message: 'Webhook traité avec succès' };
    } else {
      console.error('Webhook invalide ou signature incorrecte');
      return { success: false, message: 'Webhook invalide' };
    }
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    return { success: false, message: 'Erreur serveur' };
  }
}

// =====================================================
// 5. Gestionnaires de statuts de paiement
// =====================================================

async function handleSuccessfulPayment(payment: PaymentStatus) {
  console.log('🎉 Traitement du paiement réussi:', payment.transactionId);
  
  try {
    // Récupérer les métadonnées du paiement
    const metadata = payment.metadata;
    
    if (metadata) {
      const { userId, planType, duration } = metadata;
      
      // Activer l'abonnement de l'utilisateur
      await activateUserSubscription(userId, planType, duration);
      
      // Envoyer un email de confirmation
      await sendPaymentConfirmationEmail(userId, payment);
      
      // Enregistrer dans les logs
      await logPaymentSuccess(payment);
    }
    
    console.log('✅ Paiement traité avec succès');
  } catch (error) {
    console.error('Erreur lors du traitement du paiement réussi:', error);
  }
}

async function handleFailedPayment(payment: PaymentStatus) {
  console.log('❌ Traitement du paiement échoué:', payment.transactionId);
  
  try {
    const metadata = payment.metadata;
    
    if (metadata) {
      const { userId } = metadata;
      
      // Notifier l'utilisateur de l'échec
      await sendPaymentFailureEmail(userId, payment);
      
      // Enregistrer dans les logs
      await logPaymentFailure(payment);
    }
  } catch (error) {
    console.error('Erreur lors du traitement du paiement échoué:', error);
  }
}

async function handleCancelledPayment(payment: PaymentStatus) {
  console.log('🚫 Traitement du paiement annulé:', payment.transactionId);
  
  try {
    // Enregistrer l'annulation
    await logPaymentCancellation(payment);
  } catch (error) {
    console.error('Erreur lors du traitement du paiement annulé:', error);
  }
}

// =====================================================
// 6. Fonctions utilitaires (à implémenter selon votre logique)
// =====================================================

async function activateUserSubscription(userId: string, planType: string, duration: string) {
  // Votre logique d'activation d'abonnement
  console.log(`Activation de l'abonnement ${planType} pour l'utilisateur ${userId}`);
  
  // Exemple : mise à jour en base de données
  // await database.users.update(userId, {
  //   subscription: {
  //     type: planType,
  //     status: 'active',
  //     startDate: new Date(),
  //     endDate: calculateEndDate(duration)
  //   }
  // });
}

async function sendPaymentConfirmationEmail(userId: string, payment: PaymentStatus) {
  // Votre logique d'envoi d'email
  console.log(`Envoi de l'email de confirmation à l'utilisateur ${userId}`);
  
  // Exemple avec un service d'email
  // await emailService.send({
  //   to: userEmail,
  //   template: 'payment-confirmation',
  //   data: {
  //     transactionId: payment.transactionId,
  //     amount: payment.amount,
  //     currency: payment.currency
  //   }
  // });
}

async function sendPaymentFailureEmail(userId: string, payment: PaymentStatus) {
  // Votre logique d'envoi d'email d'échec
  console.log(`Envoi de l'email d'échec à l'utilisateur ${userId}`);
}

async function logPaymentSuccess(payment: PaymentStatus) {
  // Votre logique de logging
  console.log('Log: Paiement réussi enregistré');
}

async function logPaymentFailure(payment: PaymentStatus) {
  // Votre logique de logging
  console.log('Log: Paiement échoué enregistré');
}

async function logPaymentCancellation(payment: PaymentStatus) {
  // Votre logique de logging
  console.log('Log: Paiement annulé enregistré');
}

// =====================================================
// 7. Exemple d'utilisation complète
// =====================================================

export async function completePaymentFlow() {
  try {
    console.log('🚀 Démarrage du flux de paiement...');
    
    // 1. Créer le paiement
    const paymentResponse = await createSimplePayment();
    const transactionId = paymentResponse.transactionId!;
    
    // 2. Simuler l'attente du paiement (en réalité, ceci sera fait via webhook)
    console.log('⏳ En attente du paiement...');
    
    // Dans un vrai scénario, vous recevrez une notification webhook
    // Ici, on simule en vérifiant périodiquement
    const checkInterval = setInterval(async () => {
      const status = await checkTransactionStatus(transactionId);
      
      if (status && status.status !== 'pending') {
        clearInterval(checkInterval);
        console.log('🏁 Flux de paiement terminé');
      }
    }, 10000); // Vérifier toutes les 10 secondes
    
  } catch (error) {
    console.error('Erreur dans le flux de paiement:', error);
  }
}

// =====================================================
// 8. Exemple avec React Hook
// =====================================================

// Si vous utilisez React, voici un exemple avec les hooks :
/*
import { useCinetPay, useSimplePayment } from './react-hooks';

function PaymentExample() {
  const { createPayment, verifyTransaction, isLoading, error } = useCinetPay({
    apiKey: 'your-api-key',
    siteId: 'your-site-id',
    environment: 'production'
  });

  const handlePayment = async () => {
    const result = await createPayment({
      transactionId: Date.now().toString(),
      amount: 1000,
      currency: 'XOF',
      description: 'Test payment',
      customer: {
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '+22500000000'
      },
      returnUrl: window.location.origin + '/success'
    });

    if (result.success) {
      window.location.href = result.paymentUrl;
    }
  };

  return (
    <button onClick={handlePayment} disabled={isLoading}>
      {isLoading ? 'Traitement...' : 'Payer'}
    </button>
  );
}
*/

// Export des fonctions principales pour utilisation
export {
  createSimplePayment,
  checkTransactionStatus,
  handleWebhookNotification,
  completePaymentFlow
}; 