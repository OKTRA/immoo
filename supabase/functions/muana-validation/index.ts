// @ts-nocheck
/* eslint-disable */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MuanaValidationPayload {
	transaction_id: string;
	amount: number;
	currency: string;
	status: string;
	provider?: string;
	metadata?: any;
	timestamp?: string;
	validation_type?: 'pre_validation' | 'post_validation' | 'webhook_validation';
}

interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
	recommendations: string[];
	risk_score: number; // 0-100, 0 = no risk, 100 = high risk
}

Deno.serve(async (req) => {
	// Handle CORS preflight requests
	if (req.method === 'OPTIONS') {
		return new Response(null, { headers: corsHeaders });
	}

	try {
		// Initialize Supabase client
		const supabaseUrl = Deno.env.get('SUPABASE_URL');
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
		
		if (!supabaseUrl || !supabaseServiceKey) {
			throw new Error('Missing Supabase environment variables');
		}
		
		const supabase = createClient(supabaseUrl, supabaseServiceKey);
		
		// Parse request body
		const body = await req.json();
		console.log('Received request body:', body);

		// If sender_number is provided, use phone-based verification flow
		if (body?.sender_number) {
			const result = await verifyBySenderNumber({
				supabase,
				senderNumber: String(body.sender_number),
				userId: body.user_id || body.metadata?.user_id,
				planId: body.plan_id || body.metadata?.plan_id,
				amountCents: body.amount_cents || body.amount || null,
			});
			return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
		}


		// If transaction_id is provided without sender_number, use transaction-id flow
		if (body?.transaction_id && !body?.sender_number) {
			const result = await verifyByTransactionId({
				supabase,
				transactionId: String(body.transaction_id),
				userId: body.user_id || body.metadata?.user_id,
				planId: body.plan_id || body.metadata?.plan_id,
				amountCents: body.amount_cents || body.amount || null,
			});
			return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
		}

		// Validate required fields (legacy validation endpoint)
		if (!body.transaction_id || !body.amount || !body.currency) {
			return new Response(
				JSON.stringify({
					success: false,
					message: 'Missing required fields: transaction_id, amount, currency'
				}),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				}
			);
		}

		// Normalize and validate input data
		const normalizedData: MuanaValidationPayload = {
			transaction_id: body.transaction_id,
			amount: Number(body.amount),
			currency: body.currency.toUpperCase(),
			status: body.status || 'pending',
			provider: body.provider || 'muana',
			metadata: body.metadata || {},
			timestamp: body.timestamp || new Date().toISOString(),
			validation_type: body.validation_type || 'pre_validation'
		};
		
		console.log('Normalized data:', normalizedData);
		
		// Perform basic validation (simplified for speed)
		const validationResult = performBasicValidation(normalizedData);
		
		console.log('Validation result:', validationResult);
		
		// Try to save validation record to muana_sms table (but don't fail if it doesn't work)
		try {
			const { data: validationRecord, error: dbError } = await supabase
				.from('muana_sms')
				.insert([
					{
						sender: normalizedData.provider || 'muana',
						message: `Validation: ${normalizedData.transaction_id}`,
						timestamp: normalizedData.timestamp || new Date().toISOString(),
						fingerprint: `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
						payment_reference: normalizedData.transaction_id,
						amount_cents: normalizedData.amount,
						currency: normalizedData.currency,
						payment_status: normalizedData.status,
						parsed_confidence: validationResult.isValid ? 1.0 : 0.0,
						metadata: {
							...normalizedData.metadata,
							validation_type: normalizedData.validation_type,
							validation_result: validationResult,
							validated_at: new Date().toISOString(),
						},
						verified_at: new Date().toISOString(),
						verification_attempts: 1,
						user_id: normalizedData.metadata?.user_id,
						plan_id: normalizedData.metadata?.plan_id,
					}
				])
				.select()
				.single();

			if (dbError) {
				console.error('Database error saving validation:', dbError);
				// Continue even if we can't save the validation record
			}
		} catch (dbError) {
			console.error('Database error:', dbError);
			// Continue even if database operations fail
		}

		// Return validation result
		return new Response(
			JSON.stringify({
				success: true,
				transaction_id: normalizedData.transaction_id,
				validation: validationResult,
				timestamp: new Date().toISOString(),
			}),
			{
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			}
		);

	} catch (error: any) {
		console.error('Function error:', error);
		return new Response(
			JSON.stringify({
				error: 'Internal server error',
				details: error?.message
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			}
		);
	}
});

// Simplified validation function for speed
function performBasicValidation(transaction: any): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];
	const recommendations: string[] = [];
	let riskScore = 0;

	// 1. Basic field validation
	if (!transaction.transaction_id || transaction.transaction_id.length < 3) {
		errors.push('Transaction ID is too short or missing');
		riskScore += 30;
	}

	if (!Number.isFinite(transaction.amount) || transaction.amount <= 0) {
		errors.push('Invalid amount value');
		riskScore += 40;
	}

	if (!transaction.currency || !['FCFA', 'XOF', 'USD'].includes(transaction.currency)) {
		errors.push('Unsupported currency');
		riskScore += 20;
	}

	// 2. Amount-based validation
	if (transaction.amount < 100) {
		warnings.push('Amount below typical minimum threshold');
		riskScore += 15;
	}

	if (transaction.amount > 1000000) {
		warnings.push('Amount above typical maximum threshold');
		riskScore += 25;
	}

	// 3. Provider-specific validation
	if (transaction.provider === 'muana') {
		if (transaction.currency !== 'FCFA') {
			warnings.push('Muana typically uses FCFA currency');
			riskScore += 10;
		}
	}

	// 4. Metadata validation
	if (transaction.metadata) {
		if (transaction.metadata.verification_mode === 'realtime_listening') {
			recommendations.push('Real-time listening mode activated');
		}
	}

	// 5. Risk score calculation
	const finalRiskScore = Math.min(100, Math.max(0, riskScore));
	
	// 6. Determine if transaction is valid
	const isValid = errors.length === 0 && finalRiskScore < 50;
	
	// 7. Generate recommendations
	if (finalRiskScore >= 30) {
		recommendations.push('Consider manual review for high-risk transactions');
	}
	
	if (transaction.amount > 500000) {
		recommendations.push('Large amount - consider additional verification');
	}

	return {
		isValid,
		errors,
		warnings,
		recommendations,
		risk_score: finalRiskScore
	};
}

// Utilities
function normalizePhoneNumber(input: string): string {
	// Keep last 8-9 digits commonly used locally, strip non-digits
	const digits = (input || '').replace(/\D/g, '');
	// Return last 8 or 9 digits if available
	return digits.length > 9 ? digits.slice(-9) : digits.length > 8 ? digits.slice(-8) : digits;
}

async function verifyBySenderNumber(params: { supabase: any; senderNumber: string; userId?: string; planId?: string; amountCents?: number | null; }) {
	const { supabase, senderNumber, userId, planId, amountCents } = params;
	const normalized = normalizePhoneNumber(senderNumber);
	console.log('🔎 Verifying by sender number:', { senderNumber, normalized, userId, planId, amountCents });

	// 1) Look for most recent SMS for this number, including already verified
	const { data: candidates, error: searchError } = await supabase
		.from('muana_sms')
		.select('*')
		.or(`counterparty_number.ilike.%${normalized}%,message.ilike.%${normalized}%`)
		.in('payment_status', ['pending', 'unverified', 'sms_received', 'verified'])
		.order('timestamp', { ascending: false })
		.limit(1);

	if (searchError) {
		console.error('Search error muana_sms:', searchError);
		return { success: false, found: false, message: 'Database search error', error: searchError.message };
	}

	if (!candidates || candidates.length === 0) {
		return {
			success: true,
			found: false,
			not_ready: true,
			reason: 'awaiting_sms_ingest',
			poll_after_seconds: 10,
			max_wait_seconds: 300,
			message: 'Aucun SMS reçu par Muana pour ce numéro pour le moment. Veuillez patienter, la synchronisation peut prendre jusqu\'à 1-3 minutes.'
		};
	}

	const match = candidates[0];
	console.log('✅ Candidate transaction found:', { id: match.id, payment_reference: match.payment_reference, amount_cents: match.amount_cents, status: match.payment_status });

	// 1b) If already verified, enforce account binding
	if (match.payment_status === 'verified') {
		// Bound to a different user? Prevent reuse
		if (match.user_id && userId && match.user_id !== userId) {
			return {
				success: true,
				found: true,
				already_verified: true,
				verified: false,
				used_by_other: true,
				owner_user_id: match.user_id,
				transaction_id: match.payment_reference || match.id,
				message: 'Transaction déjà confirmée par un autre compte. Utilisez votre propre paiement.'
			};
		}

		// Same user: idempotent success and ensure subscription is active
		let subscription: any = null;
		if (userId && planId) {
			try { subscription = await activateUserPlan({ supabase, userId, planId }); } catch (_) {}
		}
		return {
			success: true,
			found: true,
			already_verified: true,
			verified: true,
			subscription,
			transaction_id: match.payment_reference || match.id,
			message: 'Transaction déjà confirmée. Abonnement vérifié.'
		};
	}

	// 2) If the pending match is already linked to another user, block
	if (match.user_id && userId && match.user_id !== userId) {
		return {
			success: true,
			found: true,
			verified: false,
			conflict: true,
			used_by_other: true,
			owner_user_id: match.user_id,
			transaction_id: match.payment_reference || match.id,
			message: 'Cette transaction est liée à un autre compte et ne peut pas être utilisée.'
		};
	}

	// 3) Mark as verified and attach user/plan
	const { data: updated, error: updateError } = await supabase
		.from('muana_sms')
		.update({
			payment_status: 'verified',
			verified_at: new Date().toISOString(),
			verification_attempts: (match.verification_attempts || 0) + 1,
			user_id: userId || match.user_id || null,
			plan_id: planId || match.plan_id || null,
			requested_amount_cents: amountCents ?? match.requested_amount_cents ?? null,
			metadata: {
				...(match.metadata || {}),
				verification_source: 'muana-validation',
				verification_method: 'sender_number',
				sender_number_raw: senderNumber,
				sender_number_normalized: normalized,
			},
		})
		.eq('id', match.id)
		.select()
		.single();

	if (updateError) {
		console.error('Update error muana_sms:', updateError);
		return { success: false, found: true, message: 'Failed to mark transaction verified', error: updateError.message };
	}

	// 3) Activate user subscription if possible
	let subscription: any = null;
	if (userId && planId) {
		try {
			subscription = await activateUserPlan({ supabase, userId, planId });
		} catch (e: any) {
			console.error('Activation error:', e);
		}
	}

	return {
		success: true,
		found: true,
		transaction_id: updated.payment_reference || updated.id,
		verified: true,
		subscription,
		message: 'Transaction verified and plan updated'
	};
}

async function verifyByTransactionId(params: { supabase: any; transactionId: string; userId?: string; planId?: string; amountCents?: number | null; }) {
    const { supabase, transactionId, userId, planId, amountCents } = params;
    console.log('🔎 Verifying by transaction_id:', { transactionId, userId, planId, amountCents });

    // 1) Find by exact payment_reference
    const { data: rows, error } = await supabase
        .from('muana_sms')
        .select('*')
        .eq('payment_reference', transactionId)
        .order('timestamp', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Search error by transaction_id:', error);
        return { success: false, found: false, message: 'Database search error', error: error.message };
    }

    if (!rows || rows.length === 0) {
        // Not yet ingested — reassure the user (manual tab case)
        return {
            success: true,
            found: false,
            not_ready: true,
            reason: 'awaiting_sms_ingest',
            poll_after_seconds: 10,
            max_wait_seconds: 300,
            message: 'Nous avons bien reçu votre ID. Muana n\'a pas encore synchronisé le SMS. Patientez 1–3 min ou réessayez.'
        };
    }

    const match = rows[0];

    // If verified and bound to another user, block
    if (match.payment_status === 'verified' && match.user_id && userId && match.user_id !== userId) {
        return {
            success: true,
            found: true,
            already_verified: true,
            verified: false,
            used_by_other: true,
            owner_user_id: match.user_id,
            transaction_id: match.payment_reference || match.id,
            message: 'Transaction déjà confirmée par un autre compte.'
        };
    }

    // If already verified for same user, idempotent success
    if (match.payment_status === 'verified') {
        let subscription: any = null;
        if (userId && planId) {
            try { subscription = await activateUserPlan({ supabase, userId, planId }); } catch (_) {}
        }
        return {
            success: true,
            found: true,
            already_verified: true,
            verified: true,
            subscription,
            transaction_id: match.payment_reference || match.id,
            message: 'Transaction déjà confirmée. Abonnement vérifié.'
        };
    }

    // If pending and bound to other user, block
    if (match.user_id && userId && match.user_id !== userId) {
        return {
            success: true,
            found: true,
            verified: false,
            conflict: true,
            used_by_other: true,
            owner_user_id: match.user_id,
            transaction_id: match.payment_reference || match.id,
            message: 'Cette transaction est liée à un autre compte et ne peut pas être utilisée.'
        };
    }

    // Mark verified and attach user/plan
    const { data: updated, error: updateError } = await supabase
        .from('muana_sms')
        .update({
            payment_status: 'verified',
            verified_at: new Date().toISOString(),
            verification_attempts: (match.verification_attempts || 0) + 1,
            user_id: userId || match.user_id || null,
            plan_id: planId || match.plan_id || null,
            requested_amount_cents: amountCents ?? match.requested_amount_cents ?? null,
            metadata: {
                ...(match.metadata || {}),
                verification_source: 'muana-validation',
                verification_method: 'transaction_id',
            },
        })
        .eq('id', match.id)
        .select()
        .single();

    if (updateError) {
        console.error('Update error muana_sms (by id):', updateError);
        return { success: false, found: true, message: 'Failed to mark transaction verified', error: updateError.message };
    }

    // Activate subscription
    let subscription: any = null;
    if (userId && planId) {
        try { subscription = await activateUserPlan({ supabase, userId, planId }); } catch (e: any) { console.error('Activation error:', e); }
    }

    return {
        success: true,
        found: true,
        verified: true,
        transaction_id: updated.payment_reference || updated.id,
        subscription,
        message: 'Transaction vérifiée via ID et plan activé'
    };
}

async function activateUserPlan({ supabase, userId, planId }: { supabase: any; userId: string; planId: string; }) {
	// Fetch agency for user and plan billing cycle
	const [profileRes, planRes] = await Promise.all([
		supabase.from('profiles').select('agency_id').eq('id', userId).maybeSingle(),
		supabase.from('subscription_plans').select('id, billing_cycle, name').eq('id', planId).maybeSingle(),
	]);
	if (profileRes.error) throw profileRes.error;
	if (planRes.error) throw planRes.error;
	const agencyId = profileRes.data?.agency_id || null;
	const cycle = (planRes.data?.billing_cycle || 'monthly').toString().toLowerCase();

	// Compute start/end as DATE (YYYY-MM-DD)
	const now = new Date();
	const start = new Date(now);
	const end = new Date(start);
	if (cycle.includes('year')) end.setFullYear(end.getFullYear() + 1);
	else if (cycle.includes('quarter')) end.setMonth(end.getMonth() + 3);
	else if (cycle.includes('semestr')) end.setMonth(end.getMonth() + 6);
	else if (cycle.includes('week')) end.setDate(end.getDate() + 7);
	else end.setMonth(end.getMonth() + 1);
	const startDate = start.toISOString().slice(0, 10);
	const endDate = end.toISOString().slice(0, 10);

	// Try update existing active subscription
	const { data: current, error: curErr } = await supabase
		.from('user_subscriptions')
		.select('id, status')
		.eq('user_id', userId)
		.eq('status', 'active')
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	if (!curErr && current) {
		const { data: up, error: upErr } = await supabase
			.from('user_subscriptions')
			.update({
				plan_id: planId,
				payment_method: 'muana_sms',
				start_date: startDate,
				end_date: endDate,
				last_payment_date: startDate,
				next_payment_date: endDate,
				updated_at: now.toISOString(),
			})
			.eq('id', current.id)
			.select()
			.single();
		if (upErr) throw upErr;
		return up;
	}

	// Else insert new active subscription
	const { data: inserted, error: insErr } = await supabase
		.from('user_subscriptions')
		.insert({
			user_id: userId,
			agency_id: agencyId,
			plan_id: planId,
			status: 'active',
			payment_method: 'muana_sms',
			start_date: startDate,
			end_date: endDate,
			last_payment_date: startDate,
			next_payment_date: endDate,
			created_at: now.toISOString(),
			updated_at: now.toISOString(),
		})
		.select()
		.single();
	if (insErr) throw insErr;
	return inserted;
}
