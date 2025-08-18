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

		// Note: our schema uses subscription_plans, not plans
		if (!planId && plan_name) {
			const { data: plan } = await supabase
				.from('subscription_plans')
				.select('id, name, price')
				.eq('name', plan_name)
				.eq('is_active', true)
				.single();
			if (!plan) return new Response(JSON.stringify({ error: 'Plan not found or inactive' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
			planId = plan.id;
			planPrice = Number(plan.price);
			planName = plan.name;
		}

		// If we got a plan_id directly, fetch its price for validation
		if (planId && planPrice == null) {
			const { data: p } = await supabase
				.from('subscription_plans')
				.select('id, name, price')
				.eq('id', planId)
				.single();
			if (p) {
				planPrice = Number(p.price);
				planName = p.name;
			}
		}

		// payment_transactions table might not exist in our schema.
		// Instead, log in billing_history for traceability and use it for idempotency per reference.
		const { data: existingBilling } = await supabase
			.from('billing_history')
			.select('id, user_id, plan_id, amount, status, transaction_id')
			.eq('user_id', user_id)
			.eq('transaction_id', payment_reference)
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle();

		let billingId: string | null = existingBilling?.id ?? null;
		let amountToCheck: number | null = existingBilling ? Number(existingBilling.amount) : null;
		let finalPlanId: string | null = existingBilling?.plan_id || planId;

		if (!existingBilling) {
			if (!finalPlanId) return new Response(JSON.stringify({ error: 'plan_name is required for new verification' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
			if (amount_cents == null && planPrice == null) return new Response(JSON.stringify({ error: 'amount_cents is required when creating a new transaction' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

			amountToCheck = Number(amount_cents ?? planPrice ?? 0);
			const { data: created } = await supabase
				.from('billing_history')
				.insert({
					user_id,
					plan_id: finalPlanId,
					amount: amountToCheck,
					status: 'pending',
					payment_method: 'mobile_money',
					transaction_id: payment_reference,
					description: `Vérification mobile money pour ${planName || 'plan'}`,
				})
				.select('id')
				.single();
			billingId = created?.id ?? null;
		}

		if (!planPrice && finalPlanId) {
			const { data: plan } = await supabase
				.from('subscription_plans')
				.select('id, name, price')
				.eq('id', finalPlanId)
				.single();
			if (plan) {
				planPrice = Number(plan.price);
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

		if (amountToCheck == null && smsAmount != null && billingId) {
			amountToCheck = smsAmount;
			await supabase
				.from('billing_history')
				.update({ amount: amountToCheck })
				.eq('id', billingId);
		}

		let verified = true;
		if (planPrice != null && !Number.isNaN(planPrice)) {
			verified = Number(amountToCheck) === Number(planPrice);
		}
		if (!matchedSms) verified = false;

		const finalStatus = verified ? 'verified' : 'rejected';
		if (billingId) {
			await supabase
				.from('billing_history')
				.update({ status: verified ? 'paid' : 'failed', payment_date: verified ? new Date().toISOString() : null })
				.eq('id', billingId);
		}

		if (matchedSms?.id) {
			await supabase
				.from('transactions')
				.update({
					matched_payment_transaction_id: billingId,
					matched_status: finalStatus,
					matched_at: new Date().toISOString(),
				})
				.eq('id', matchedSms.id);
		}

		let subscription: any = null;
		if (verified && finalPlanId) {
			const now = new Date();
			// Compute end date from plan billing_cycle
			const { data: planCycle } = await supabase
				.from('subscription_plans')
				.select('billing_cycle')
				.eq('id', finalPlanId)
				.single();

			const end = new Date(now);
			switch (planCycle?.billing_cycle) {
				case 'monthly': end.setMonth(end.getMonth() + 1); break;
				case 'yearly':
				case 'annual': end.setFullYear(end.getFullYear() + 1); break;
				case 'quarterly': end.setMonth(end.getMonth() + 3); break;
				case 'semestriel':
				case 'semestrial': end.setMonth(end.getMonth() + 6); break;
				case 'weekly': end.setDate(end.getDate() + 7); break;
				case 'lifetime': end.setFullYear(end.getFullYear() + 100); break;
				default: end.setMonth(end.getMonth() + 1);
			}

			const { data: sub } = await supabase
				.from('user_subscriptions')
				.upsert(
					{
						user_id,
						agency_id: null,
						plan_id: finalPlanId,
						status: 'active',
						starts_at: now.toISOString(),
						start_date: now.toISOString(),
						end_date: end.toISOString(),
						auto_renew: false,
						payment_method: 'mobile_money',
					},
					{ onConflict: 'user_id' },
				)
				.select('*, subscription_plans(name, price)')
				.single();
			subscription = sub;
		}

		return new Response(
			JSON.stringify({ status: verified ? 'verified' : 'rejected', subscription }),
			{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
		);
	} catch (e) {
		console.error('verify-transaction error', e);
		return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
	}
});



