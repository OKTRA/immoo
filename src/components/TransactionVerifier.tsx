import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, CheckCircle, Clock, AlertCircle, CreditCard, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface TransactionVerifierProps {
  userId: string;
  planId: string;
  planName: string;
  amountCents: number;
  onSuccess: () => void;
  onError?: (error: string) => void;
}

interface VerificationStatus {
  type: 'idle' | 'verifying' | 'listening' | 'success' | 'timeout' | 'error';
  message: string;
  details?: any;
}

type VerificationMode = 'payment' | 'verification';

export default function TransactionVerifier({
  userId,
  planId,
  planName,
  amountCents,
  onSuccess,
  onError
}: TransactionVerifierProps) {
  const [paymentRef, setPaymentRef] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState<VerificationStatus>({ type: 'idle', message: '' });
  const [mode, setMode] = useState<VerificationMode>('payment');
  
  const listeningIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

  // Nettoyer l'intervalle quand le composant est démonté
  useEffect(() => {
    return () => {
      if (listeningIntervalRef.current) {
        clearInterval(listeningIntervalRef.current);
      }
    };
  }, []);

  const startPaymentVerification = async () => {
    if (!senderNumber.trim()) {
      toast.error('Veuillez saisir le numéro d\'envoi');
      return;
    }

    setVerifying(true);
    setStatus({ type: 'verifying', message: '🔄 Démarrage de la vérification en temps réel...' });

    try {
      console.log('🚀 Appel de l\'edge function muana-validation avec:', {
        transaction_id: `PAY_${Date.now()}`,
        amount: amountCents,
        currency: 'FCFA',
        status: 'pending',
        provider: 'muana',
        metadata: {
          user_id: userId,
          plan_id: planId,
          plan_name: planName,
          payment_reference: `PAY_${Date.now()}`,
          sender_number: senderNumber.trim(),
          verification_mode: 'realtime_listening'
        },
        validation_type: 'pre_validation'
      });

      const { data, error } = await supabase.functions.invoke('muana-validation', {
        body: {
          // Nouveau flux: vérification par numéro uniquement
          sender_number: senderNumber.trim(),
          user_id: userId,
          plan_id: planId,
          amount_cents: amountCents
        }
      });

      console.log('📡 Réponse de l\'edge function:', { data, error });

      if (error) {
        console.error('❌ Erreur de l\'edge function:', error);
        throw new Error(error.message);
      }

      if (data?.success && data?.found && data?.verified) {
        const already = data?.already_verified === true;
        setStatus({ 
          type: 'success', 
          message: already 
            ? '✅ Transaction déjà confirmée. Abonnement actif.' 
            : '✅ Paiement confirmé ! Abonnement activé.', 
          details: data 
        });
        already ? toast.info('Transaction déjà confirmée') : toast.success('Paiement vérifié et abonnement activé !');
      } else if (data?.success && !data?.found) {
        if (data?.not_ready === true) {
          setStatus({ 
            type: 'listening', 
            message: '⏳ Nous attendons la réception du SMS par Muana (1-3 min). L\'écran va se mettre à jour automatiquement...', 
            details: data 
          });
          startListeningMode();
        } else {
          // Démarre/continue l'écoute jusqu'à 5 minutes
          setStatus({ type: 'listening', message: '👂 Démarrage de la vérification en temps réel...', details: data });
          startListeningMode();
        }
      } else {
        setStatus({ type: 'error', message: data?.message || '❌ Erreur lors de la vérification', details: data });
        toast.error('Vérification échouée');
      }
    } catch (error: any) {
      console.error('💥 Edge function error:', error);
      setStatus({ type: 'error', message: `❌ Erreur de connexion : ${error.message}`, details: error });
      toast.error('Erreur de connexion');
      if (onError) onError(error.message);
    } finally {
      setVerifying(false);
    }
  };

  const startListeningMode = () => {
    startTimeRef.current = Date.now();
    
    // Vérifier toutes les 2 secondes pendant 5 minutes
    listeningIntervalRef.current = setInterval(async () => {
      const elapsed = Date.now() - startTimeRef.current;
      
      if (elapsed >= TIMEOUT_MS) {
        // Timeout atteint
        clearInterval(listeningIntervalRef.current!);
        setStatus({ 
          type: 'timeout', 
          message: '⏰ Vérification expirée (5 minutes). Aucune transaction trouvée.\n\nOptions :\n• Réessayer avec le même numéro\n• Saisir l\'ID de transaction pour vérification manuelle\n• Contacter le support', 
          details: { timeout_reached: true }
        });
        toast.warning('Vérification expirée - veuillez réessayer');
        return;
      }

      // Vérifier s'il y a une nouvelle transaction en appelant la même Edge Function
      try {
        const { data, error } = await supabase.functions.invoke('muana-validation', {
          body: {
            // Écoute par numéro (même flux)
            sender_number: senderNumber.trim(),
            user_id: userId,
            plan_id: planId,
            amount_cents: amountCents
          }
        });

        if (error) throw new Error(error.message);

        if (data?.success && data?.found && data?.verified) {
          const already = data?.already_verified === true;
          clearInterval(listeningIntervalRef.current!);
          setStatus({ 
            type: 'success', 
            message: already 
              ? '✅ Transaction déjà confirmée. Abonnement actif.' 
              : '🎉 Transaction validée avec succès ! Votre abonnement a été activé.', 
            details: data 
          });
          already ? toast.info('Transaction déjà confirmée') : toast.success('Paiement vérifié et abonnement activé !');
          // Pas de redirection automatique - l'utilisateur reste sur la page
        } else {
          // Mettre à jour le statut pour montrer qu'on écoute toujours
          const remainingMinutes = Math.ceil((TIMEOUT_MS - elapsed) / 60000);
          setStatus(prev => ({
            ...prev,
            message: `👂 En écoute... Temps restant : ${remainingMinutes} min\n\n💳 Effectuez le paiement maintenant pour une confirmation rapide !`
          }));
        }
      } catch (error) {
        console.error('Background check error:', error);
      }
    }, 2000);
  };

  const startManualVerification = async () => {
    if (!paymentRef.trim()) {
      toast.error('Veuillez saisir l\'ID de transaction');
      return;
    }

    setVerifying(true);
    setStatus({ type: 'verifying', message: '🔍 Vérification manuelle en cours...' });

    try {
      const { data, error } = await supabase.functions.invoke('muana-validation', {
        body: {
          // Manual path: allow user to paste transaction ID OR still verify by number
          sender_number: senderNumber.trim() || undefined,
          user_id: userId,
          plan_id: planId,
          amount_cents: amountCents,
          transaction_id: paymentRef.trim() || undefined
        }
      });

      if (error) throw new Error(error.message);

      if (data?.success && data?.found && data?.verified) {
        const already = data?.already_verified === true;
        setStatus({ 
          type: 'success', 
          message: already 
            ? '✅ Transaction déjà confirmée. Abonnement actif.' 
            : '✅ Transaction confirmée ! Abonnement activé.', 
          details: data 
        });
        already ? toast.info('Transaction déjà confirmée') : toast.success('Transaction vérifiée et abonnement activé !');
      } else if (data?.success && !data?.found) {
        if (data?.not_ready === true) {
          setStatus({ 
            type: 'listening', 
            message: "⏳ ID reçu. Muana n'a pas encore synchronisé le SMS (1–3 min). Nous vérifions automatiquement...", 
            details: data 
          });
          // Réutilise le listening mode pour re-checker périodiquement
          startListeningMode();
        } else {
          setStatus({ type: 'error', message: 'Aucune transaction trouvée pour cet ID', details: data });
          toast.error('Transaction introuvable');
        }
      } else {
        setStatus({ type: 'error', message: data?.message || '❌ Erreur lors de la vérification', details: data });
        toast.error('Vérification échouée');
      }
    } catch (error: any) {
      console.error('Manual verification error:', error);
      setStatus({ type: 'error', message: `❌ Erreur lors de la vérification : ${error.message}`, details: error });
      toast.error('Erreur de vérification');
      if (onError) onError(error.message);
    } finally {
      setVerifying(false);
    }
  };

  const retryVerification = () => {
    if (listeningIntervalRef.current) {
      clearInterval(listeningIntervalRef.current);
    }
    setStatus({ type: 'idle', message: '' });
    startPaymentVerification();
  };

  const resetForm = () => {
    if (listeningIntervalRef.current) {
      clearInterval(listeningIntervalRef.current);
    }
    setPaymentRef('');
    setSenderNumber('');
    setStatus({ type: 'idle', message: '' });
  };

  const getStatusIcon = () => {
    switch (status.type) {
      case 'verifying': return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />;
      case 'listening': return <Clock className="w-5 h-5 text-orange-600" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'timeout': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = () => {
    switch (status.type) {
      case 'verifying': return 'bg-blue-50 border-blue-200';
      case 'listening': return 'bg-orange-50 border-orange-200';
      case 'success': return 'bg-green-50 border-green-200';
      case 'timeout': return 'bg-red-50 border-red-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Sélecteur de mode */}
      <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
        <button
          onClick={() => setMode('payment')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'payment'
              ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <CreditCard className="w-4 h-4 inline mr-2" />
          Payer
        </button>
        <button
          onClick={() => setMode('verification')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'verification'
              ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Search className="w-4 h-4 inline mr-2" />
          Vérifier par ID
        </button>
      </div>

      {/* Mode Payer */}
      {mode === 'payment' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Numéro d'envoi <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Numéro qui enverra l'argent (ex: +223 70 00 00 00)"
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              disabled={verifying || status.type === 'listening'}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ce numéro sera utilisé pour identifier votre transaction
            </p>
          </div>

          <Button
            onClick={startPaymentVerification}
            disabled={verifying || !senderNumber.trim() || status.type === 'listening'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Démarrage...
              </>
            ) : status.type === 'listening' ? (
              <>
                <Clock className="w-4 h-4 mr-2" />
                En écoute...
              </>
            ) : (
              '🚀 Lancer la vérification et procéder au paiement'
            )}
          </Button>

          {status.type === 'listening' && (
            <div className="text-center text-sm text-gray-600">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-1000" 
                  style={{ 
                    width: `${Math.max(0, 100 - ((Date.now() - startTimeRef.current) / TIMEOUT_MS) * 100)}%` 
                  }}
                ></div>
              </div>
              ⏱️ Vérification en temps réel - Timeout: 5 minutes
            </div>
          )}
        </div>
      )}

      {/* Mode Vérifier par ID */}
      {mode === 'verification' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              ID de transaction <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Collez l'ID de transaction reçu (ex: ABC123)"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              disabled={verifying}
            />
            <p className="text-xs text-gray-500 mt-1">
              Utilisez ce mode après avoir effectué le paiement
            </p>
          </div>

          <Button
            onClick={startManualVerification}
            disabled={verifying || !paymentRef.trim()}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Vérification...
              </>
            ) : (
              '🔍 Vérifier la transaction'
            )}
          </Button>
        </div>
      )}

      {/* Statut de la vérification */}
      {status.message && (
        <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-start gap-3">
            {getStatusIcon()}
            <div className="flex-1">
              <div className="whitespace-pre-line text-sm text-gray-700">
                {status.message.replace(/[🔄✅⏰❌👂🎉💳📱⏱️🔄🚀🔍]/g, '').trim()}
              </div>
              
              {status.type === 'listening' && status.details?.instructions && (
                <div className="mt-3 space-y-2">
                  {status.details.instructions.map((instruction: string, index: number) => (
                    <div key={index} className="text-xs text-gray-600 flex items-center gap-2">
                      <span className="text-orange-500">•</span>
                      {instruction}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      {status.type === 'timeout' && (
        <div className="flex gap-3">
          <Button
            onClick={retryVerification}
            disabled={verifying}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
          <Button
            onClick={resetForm}
            variant="outline"
            className="flex-1"
          >
            Nouvelle vérification
          </Button>
        </div>
      )}

      {status.type === 'success' && (
        <div className="flex gap-3">
          <Button
            onClick={resetForm}
            variant="outline"
            className="flex-1"
          >
            Vérifier une autre transaction
          </Button>
          <Button
            onClick={onSuccess}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Fermer et continuer
          </Button>
        </div>
      )}

      {status.type === 'error' && status.details?.verification_method === 'already_verified' && (
        <div className="flex gap-3">
          <Button
            onClick={resetForm}
            variant="outline"
            className="flex-1"
          >
            Nouvelle vérification
          </Button>
          <Button
            onClick={onSuccess}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Fermer et continuer
          </Button>
        </div>
      )}

      {status.type === 'error' && (
        status.details?.verification_method === 'transaction_already_used' ||
        status.details?.verification_method === 'transaction_update_failed' ||
        status.details?.verification_method === 'manual_verification_used_by_other' ||
        status.details?.verification_method === 'manual_verification_already_associated' ||
        status.details?.verification_method === 'manual_verification_invalid_status'
      ) && (
        <div className="flex gap-3">
          <Button
            onClick={resetForm}
            variant="outline"
            className="flex-1"
          >
            Nouvelle vérification
          </Button>
          <Button
            onClick={onSuccess}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            Fermer et contacter le support
          </Button>
        </div>
      )}

      {/* Informations d'aide */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <div className="font-medium mb-2">💡 Comment ça marche ?</div>
        <ul className="space-y-1">
          <li>• <strong>Mode "Payer"</strong> : Lance la vérification et procédez au paiement</li>
          <li>• <strong>Mode "Vérifier par ID"</strong> : Après paiement, utilisez l'ID de transaction</li>
          <li>• La vérification se fait automatiquement en temps réel</li>
          <li>• Timeout de 5 minutes maximum</li>
          <li>• En cas d'échec, vous pouvez réessayer ou utiliser l'ID</li>
        </ul>
      </div>
    </div>
  );
}
