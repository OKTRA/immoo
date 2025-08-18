// @ts-nocheck
/* eslint-disable */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

		const { user_id, plan_id, plan_name, amount_cents, payment_reference } = await req.json();

		if (!user_id || !payment_reference) {
			return new Response(
				JSON.stringify({ error: 'user_id and payment_reference are required' }),
				{ status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
			);
		}

		// Ensure profile row exists for FK
		const { data: existingProfile } = await supabase
			.from('profiles')
			.select('id')
			.eq('id', user_id)
			.maybeSingle();
		if (!existingProfile) {
			await supabase.from('profiles').upsert({ id: user_id, email: `user-${user_id}@local` }, { onConflict: 'id' });
		}

		let planId: string | null = plan_id ?? null;
		let planPrice: number | null = null;
		let planName: string | null = null;

		if (!planId && plan_name) {
			const { data: plan } = await supabase
				.from('plans')
				.select('id, name, price_cents')
				.eq('name', plan_name)
				.eq('is_active', true)
				.single();
			if (!plan) return new Response(JSON.stringify({ error: 'Plan not found or inactive' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
			planId = plan.id;
			planPrice = Number(plan.price_cents);
			planName = plan.name;
		}

		// If we got a plan_id directly, fetch its price for validation
		if (planId && planPrice == null) {
			const { data: p } = await supabase
				.from('plans')
				.select('id, name, price_cents')
				.eq('id', planId)
				.single();
			if (p) {
				planPrice = Number(p.price_cents);
				planName = p.name;
			}
		}

		const { data: existingTxn } = await supabase
			.from('payment_transactions')
			.select('id, user_id, plan_id, amount_cents, status, payment_reference')
			.eq('user_id', user_id)
			.eq('payment_reference', payment_reference)
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle();

		let transactionId: string;
		let amountToCheck: number | null = null;
		let finalPlanId: string | null = existingTxn?.plan_id || planId;

		if (!existingTxn) {
			if (!finalPlanId) return new Response(JSON.stringify({ error: 'plan_name is required for new verification' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
			if (amount_cents == null && planPrice == null) return new Response(JSON.stringify({ error: 'amount_cents is required when creating a new transaction' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

			amountToCheck = Number(amount_cents ?? planPrice ?? 0);
			const { data: created } = await supabase
				.from('payment_transactions')
				.insert({
					user_id,
					plan_id: finalPlanId,
					amount_cents: amountToCheck,
					currency: 'XOF',
					status: 'pending',
					payment_method: 'mobile_money',
					payment_reference,
				})
				.select('id')
				.single();
			transactionId = created!.id;
		} else {
			transactionId = existingTxn.id;
			amountToCheck = Number(existingTxn.amount_cents);
		}

		if (!planPrice && finalPlanId) {
			const { data: plan } = await supabase
				.from('plans')
				.select('id, name, price_cents')
				.eq('id', finalPlanId)
				.single();
			if (plan) {
				planPrice = Number(plan.price_cents);
				planName = plan.name;
			}
		}

		const normalizedRef = String(payment_reference).trim();
		const { data: matchedSms } = await supabase
			.from('transactions')
			.select('id, message, timestamp, sender, payment_reference')
			.eq('payment_reference', normalizedRef)
			.order('timestamp', { ascending: false })
			.limit(1)
			.maybeSingle();

		const parseAmountFromSms = (text: string): number | null => {
			const amountRegex = /transfert\s+de\s+([\d\s.,]+)\s*(?:FCFA|XOF)/i;
			const m = text.match(amountRegex);
			if (!m) return null;
			const raw = m[1].replace(/\s|\./g, '').replace(',', '');
			const val = Number(raw);
			return Number.isFinite(val) ? val : null;
		};

		let smsAmount: number | null = null;
		if (matchedSms?.message) smsAmount = parseAmountFromSms(matchedSms.message);

		if (amountToCheck == null && smsAmount != null) {
			amountToCheck = smsAmount;
			await supabase
				.from('payment_transactions')
				.update({ amount_cents: amountToCheck })
				.eq('id', transactionId);
		}

		let verified = true;
		if (planPrice != null && !Number.isNaN(planPrice)) {
			verified = Number(amountToCheck) === Number(planPrice);
		}
		if (!matchedSms) verified = false;

		const finalStatus = verified ? 'verified' : 'rejected';
		await supabase
			.from('payment_transactions')
			.update({ status: finalStatus, verified_at: verified ? new Date().toISOString() : null })
			.eq('id', transactionId);

		if (matchedSms?.id) {
			await supabase
				.from('transactions')
				.update({
					matched_payment_transaction_id: transactionId,
					matched_status: finalStatus,
					matched_at: new Date().toISOString(),
				})
				.eq('id', matchedSms.id);
		}

		let subscription: any = null;
		if (verified && finalPlanId) {
			const now = new Date();
			const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
			const { data: sub } = await supabase
				.from('user_subscriptions')
				.upsert(
					{
						user_id,
						plan_id: finalPlanId,
						status: 'active',
						starts_at: now.toISOString(),
						expires_at: expiresAt.toISOString(),
						auto_renew: false,
					},
					{ onConflict: 'user_id' },
				)
				.select('*, plans(name, sync_interval_seconds, max_endpoints)')
				.single();
			subscription = sub;
		}

		return new Response(
			JSON.stringify({ status: finalStatus, subscription }),
			{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
		);
	} catch (e) {
		console.error('verify-transaction error', e);
		return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
	}
});


