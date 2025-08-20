// @ts-nocheck
/* eslint-disable */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Configuration des timeouts
const VERIFICATION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const POLLING_INTERVAL_MS = 2000; // 2 secondes

Deno.serve(async (req: Request) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	if (req.method !== 'POST') {
		return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
	}

	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
		const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
		const supabase = createClient(supabaseUrl, supabaseKey);

		const { user_id, plan_id, plan_name, amount_cents, payment_reference, sender_number, verification_mode } = await req.json();

		if (verification_mode === 'realtime_listening') {
			return await handleRealtimeVerification(supabase, user_id, plan_id, plan_name, amount_cents, payment_reference, sender_number);
		} else {
			return await handleStandardVerification(supabase, user_id, plan_id, plan_name, amount_cents, payment_reference);
		}
	} catch (e) {
		console.error('Error:', e);
		return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
	}
});

async function handleRealtimeVerification(supabase: any, user_id: string, plan_id: string | null, plan_name: string | null, amount_cents: number | null, payment_reference: string, sender_number: string) {
	try {
		console.log('🔍 Démarrage de la vérification en temps réel...');
		console.log('📱 Numéro:', sender_number);
		console.log('💰 Montant:', amount_cents);
		console.log('📋 Plan:', plan_name);

		// Validation des paramètres
		if (!sender_number || !amount_cents) {
			return new Response(JSON.stringify({ 
				success: false, 
				error: 'Numéro d\'envoi et montant sont requis' 
			}), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
		}

		// 1. Vérifier s'il y a une transaction récente qui correspond
		let existingTransaction = null;
		try {
			const { data: transactions, error: queryError } = await supabase
				.from('transactions')
				.select('*')
				.eq('sender', 'OrangeMoney')
				.eq('amount_cents', amount_cents)
				.in('payment_status', ['sms_received', 'payment_pending', 'unverified']) // Inclure tous les statuts non vérifiés
				.order('created_at', { ascending: false })
				.limit(10);

			if (queryError) {
				console.error('Query error:', queryError);
			} else if (transactions && transactions.length > 0) {
				// Chercher manuellement dans les résultats pour le numéro
				const senderNumberClean = sender_number.replace('+', '').replace(/\s/g, '');
				existingTransaction = transactions.find(t => 
					t.message && t.message.includes(senderNumberClean)
				);
			}
		} catch (searchError) {
			console.error('Search error:', searchError);
		}

		// 2. Si une transaction correspondante est trouvée, vérifier son statut
		if (existingTransaction) {
			console.log('✅ Transaction correspondante trouvée:', existingTransaction.id, 'Statut:', existingTransaction.payment_status);
			
			// Vérifier si la transaction est déjà vérifiée
			if (existingTransaction.payment_status === 'verified') {
				return new Response(JSON.stringify({ 
					success: false, 
					message: `Transaction déjà confirmée ! Vous devriez déjà avoir votre compte (${plan_name || 'plan'}). Si ce n'est pas le cas, contactez le support.`, 
					verification_method: 'already_verified',
					transaction: existingTransaction,
					plan_name: plan_name,
					suggestion: 'Contactez le support si vous n\'avez pas accès à votre compte',
					security_note: 'Cette transaction a déjà été utilisée pour activer un abonnement'
				}), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
			}
			
			// Vérifier si la transaction a déjà un user_id (déjà associée à un utilisateur)
			if (existingTransaction.user_id && existingTransaction.user_id !== user_id) {
				return new Response(JSON.stringify({ 
					success: false, 
					message: 'Cette transaction est déjà associée à un autre utilisateur. Contactez le support.', 
					verification_method: 'transaction_already_used',
					transaction: existingTransaction,
					suggestion: 'Contactez le support pour résoudre ce conflit'
				}), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
			}
			
			// Si la transaction n'est pas encore vérifiée ET pas encore associée à un utilisateur, la marquer comme vérifiée
			const { error: updateError } = await supabase
				.from('transactions')
				.update({ 
					payment_status: 'verified',
					verification_method: 'realtime_listening_success',
					verified_at: new Date().toISOString(),
					user_id: user_id,
					plan_id: plan_id,
					requested_amount_cents: amount_cents,
					requested_plan_name: plan_name
				})
				.eq('id', existingTransaction.id)
				.eq('payment_status', 'sms_received') // Seulement si le statut est encore sms_received
				.is('user_id', null); // Seulement si pas encore d'utilisateur associé

			if (updateError) {
				console.error('Update error:', updateError);
				return new Response(JSON.stringify({ error: 'Error updating transaction' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
			}

			// Vérifier si la mise à jour a réellement eu lieu
			const { data: updatedTransaction, error: checkError } = await supabase
				.from('transactions')
				.select('payment_status, user_id')
				.eq('id', existingTransaction.id)
				.single();

			if (checkError || updatedTransaction.payment_status !== 'verified' || updatedTransaction.user_id !== user_id) {
				return new Response(JSON.stringify({ 
					success: false, 
					message: 'Cette transaction ne peut pas être utilisée. Elle a peut-être déjà été vérifiée par un autre utilisateur.', 
					verification_method: 'transaction_update_failed',
					suggestion: 'Contactez le support pour vérifier le statut de votre transaction'
				}), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
			}

			// Mettre à jour le profil utilisateur si un plan est spécifié
			if (plan_id) {
				const { error: profileError } = await supabase
					.from('profiles')
					.update({ 
						current_plan_id: plan_id, 
						plan_updated_at: new Date().toISOString(), 
						subscription_status: 'active' 
					})
					.eq('id', user_id);

				if (profileError) {
					console.error('Profile update error:', profileError);
				}
			}

			return new Response(JSON.stringify({ 
				success: true, 
				message: 'Transaction vérifiée avec succès ! Votre abonnement a été activé.', 
				transaction: existingTransaction, 
				verification_method: 'realtime_listening_success',
				plan_updated: !!plan_id,
				immediate_match: true,
				plan_name: plan_name
			}), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
		}

		// 3. Si aucune transaction trouvée, répondre immédiatement que nous sommes en écoute
		console.log('👂 Aucune transaction trouvée, nous sommes maintenant en écoute...');
		
		// Retourner immédiatement avec un message d'écoute
		return new Response(JSON.stringify({ 
			success: true, 
			message: 'Nous sommes maintenant en écoute de votre transaction !', 
			verification_method: 'realtime_listening_active',
			status: 'listening',
			instructions: [
				'💳 Effectuez maintenant le paiement Mobile Money',
				'📱 Envoyez l\'argent depuis le numéro saisi',
				'⏱️ Nous vérifions automatiquement pendant 5 minutes',
				'✅ Votre compte sera confirmé dès réception',
				'🔄 Si pas de confirmation en 5 min, utilisez l\'ID de transaction'
			],
			timeout_minutes: 5,
			encouragement: '🚀 Effectuez le paiement maintenant pour une confirmation rapide !'
		}), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

	} catch (error) {
		console.error('Realtime verification error:', error);
		return new Response(JSON.stringify({ error: 'Internal server error during realtime verification' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
	}
}

async function handleStandardVerification(supabase: any, user_id: string, plan_id: string | null, plan_name: string | null, amount_cents: number | null, payment_reference: string) {
	try {
		// Vérifier s'il y a une transaction existante avec cette référence
		const { data: existingTransaction, error: queryError } = await supabase
			.from('transactions')
			.select('*')
			.eq('payment_reference', payment_reference)
			.single();

		if (queryError && queryError.code !== 'PGRST116') {
			console.error('Query error:', queryError);
			return new Response(JSON.stringify({ error: 'Error querying transactions' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
		}

		if (existingTransaction) {
			// Vérifier le statut de la transaction
			if (existingTransaction.payment_status === 'verified') {
				// Transaction déjà vérifiée - vérifier si elle appartient à cet utilisateur
				if (existingTransaction.user_id === user_id) {
					return new Response(JSON.stringify({ 
						success: false, 
						message: 'Transaction déjà vérifiée et activée pour votre compte. Vous devriez déjà avoir accès à votre abonnement.', 
						verification_method: 'manual_verification_already_verified',
						transaction: existingTransaction,
						plan_name: existingTransaction.requested_plan_name,
						suggestion: 'Si vous n\'avez pas accès à votre compte, contactez le support',
						security_note: 'Cette transaction a déjà été utilisée pour activer votre abonnement'
					}), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
				} else {
					// Transaction vérifiée par un autre utilisateur
					return new Response(JSON.stringify({ 
						success: false, 
						message: 'Cette transaction a déjà été utilisée par un autre utilisateur.', 
						verification_method: 'manual_verification_used_by_other',
						suggestion: 'Vérifiez votre référence de paiement ou contactez le support'
					}), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
				}
			} else if (existingTransaction.user_id && existingTransaction.user_id !== user_id) {
				// Transaction non vérifiée mais déjà associée à un autre utilisateur
				return new Response(JSON.stringify({ 
					success: false, 
					message: 'Cette transaction est déjà associée à un autre utilisateur.', 
					verification_method: 'manual_verification_already_associated',
					suggestion: 'Vérifiez votre référence de paiement ou contactez le support'
				}), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
			} else if (existingTransaction.payment_status === 'sms_received') {
				// Transaction trouvée et non vérifiée - la marquer comme vérifiée
				const { error: updateError } = await supabase
					.from('transactions')
					.update({ 
						payment_status: 'verified',
						verification_method: 'manual_verification_success',
						verified_at: new Date().toISOString(),
						user_id: user_id,
						plan_id: plan_id,
						requested_amount_cents: amount_cents,
						requested_plan_name: plan_name
					})
					.eq('id', existingTransaction.id)
					.eq('payment_status', 'sms_received')
					.is('user_id', null);

				if (updateError) {
					console.error('Update error:', updateError);
					return new Response(JSON.stringify({ error: 'Error updating transaction' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
				}

				// Mettre à jour le profil utilisateur
				if (plan_id) {
					const { error: profileError } = await supabase
						.from('profiles')
						.update({ 
							current_plan_id: plan_id, 
							plan_updated_at: new Date().toISOString(), 
							subscription_status: 'active' 
						})
						.eq('id', user_id);

					if (profileError) {
						console.error('Profile update error:', profileError);
					}
				}

				return new Response(JSON.stringify({ 
					success: true, 
					message: 'Transaction vérifiée avec succès ! Votre abonnement a été activé.', 
					transaction: existingTransaction, 
					verification_method: 'manual_verification_success',
					plan_updated: !!plan_id,
					plan_name: plan_name
				}), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
			} else {
				// Autre statut non géré
				return new Response(JSON.stringify({ 
					success: false, 
					message: 'Cette transaction ne peut pas être vérifiée dans son état actuel.', 
					verification_method: 'manual_verification_invalid_status',
					transaction: existingTransaction,
					suggestion: 'Contactez le support pour vérifier le statut de votre transaction'
				}), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
			}
		}

		// Aucune transaction trouvée avec cette référence
		return new Response(JSON.stringify({ 
			success: false, 
			message: 'Aucune transaction trouvée avec cette référence de paiement.', 
			verification_method: 'manual_verification_not_found',
			suggestion: 'Vérifiez la référence ou effectuez d\'abord le paiement.'
		}), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

	} catch (error) {
		console.error('Standard verification error:', error);
		return new Response(JSON.stringify({ error: 'Internal server error during standard verification' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
	}
}



