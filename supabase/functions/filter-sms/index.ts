// @ts-nocheck
/* eslint-disable */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SMSPayload {
	sender: string;
	message: string;
	timestamp?: string;
}

Deno.serve(async (req) => {
	// Handle CORS preflight requests
	if (req.method === 'OPTIONS') {
		return new Response(null, { headers: corsHeaders });
	}

	try {
		// Initialize Supabase client
		const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
		const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
		const supabase = createClient(supabaseUrl, supabaseKey);

		if (req.method !== 'POST') {
			return new Response(
				JSON.stringify({ error: 'Method not allowed' }),
				{
					status: 405,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				}
			);
		}

		const { sender, message, timestamp }: SMSPayload = await req.json();

		console.log('Received SMS:', { sender, message, timestamp });

		// Validate required fields
		if (!sender || !message) {
			return new Response(
				JSON.stringify({ error: 'Missing sender or message' }),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				}
			);
		}

		// Build a stable fingerprint to deduplicate the same SMS
		const normalizedSender = sender.trim();
		const normalizedMessage = message.trim();
		const isoTimestamp = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();

		// Attempt an UPSERT on fingerprint to avoid duplicates.
		// This expects a unique index on transactions(fingerprint)
		const fingerprint = await crypto.subtle
			.digest('SHA-256', new TextEncoder().encode(`${normalizedSender}|${normalizedMessage}`))
			.then((buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join(''));

		// Attempt to parse reference, amount, counterparty with regex first
		const extract = (text: string) => {
			const refMatch = text.match(/\bID[:\s-]*([A-Z0-9.\-]+)\b/i);
			const amountMatch = text.match(/transfert\s+de\s+([\d\s.,]+)\s*(FCFA|XOF)/i);
			const phoneMatch = text.match(/du\s(\+?\d{6,15})/i) || text.match(/au\s(\+?\d{6,15})/i);
			const amountRaw = amountMatch?.[1]?.replace(/[\s.]/g, '').replace(',', '');
			const amountCents = amountRaw ? Number(amountRaw) : null;
			return {
				payment_reference: refMatch?.[1] || null,
				amount_cents: Number.isFinite(amountCents) ? amountCents : null,
				currency: amountMatch?.[2] || 'FCFA',
				counterparty_number: phoneMatch?.[1] || null,
				parsed_confidence: 0.6,
			};
		};

		let parsed = extract(normalizedMessage);

		// Optional: augment with Groq for intelligent filtering and extraction
		const groqKey = Deno.env.get('GROQ_API_KEY');
		if (groqKey) {
			try {
				const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${groqKey}`,
					},
					body: JSON.stringify({
						model: 'llama-3.1-8b-instant',
						messages: [
							{ 
								role: 'system', 
								content: `Tu analyses les SMS Mobile Money en français et anglais. Détermine si c'est une VRAIE TRANSACTION ou du marketing/info.

VRAIE TRANSACTION = SMS confirmant un transfert d'argent effectué (envoi, réception, paiement, retrait, dépôt)
MARKETING/INFO = publicité, informations générales, promotions, mises à jour de service

Retourne un JSON strict avec:
- is_transaction: true/false (true seulement si c'est une vraie transaction financière)
- payment_reference: ID/référence de transaction (ou null)
- amount_cents: montant en centimes (ou null)
- currency: devise (FCFA, XOF, USD, etc.)
- counterparty_number: numéro expéditeur/destinataire (ou null)
- provider: opérateur (Orange Money, MTN, etc.)
- confidence: 0.0-1.0

Exemples:
- "Orange Money c'est simple ! Transférez..." → is_transaction: false
- "Transfert de 5000 FCFA du 77123456 ID: ABC123" → is_transaction: true` 
							},
							{ role: 'user', content: `SMS: ${normalizedMessage}` }
						],
						temperature: 0,
						response_format: { type: 'json_object' }
					})
				});
				if (res.ok) {
					const out = await res.json();
					const content = out?.choices?.[0]?.message?.content || '{}';
					const ai = JSON.parse(content);
					
					// Si l'IA dit que ce n'est pas une transaction, ignorer le SMS
					if (ai.is_transaction === false) {
						console.log('Groq detected non-transaction SMS, ignoring:', normalizedMessage.substring(0, 100));
						return new Response(
							JSON.stringify({
								success: true,
								message: 'SMS ignored (marketing/info)',
								filtered: true
							}),
							{
								status: 200,
								headers: { ...corsHeaders, 'Content-Type': 'application/json' }
							}
						);
					}
					
					// Si c'est une transaction, utiliser les données extraites par l'IA
					if (ai.is_transaction === true) {
						parsed = {
							payment_reference: ai.payment_reference || parsed.payment_reference || null,
							amount_cents: ai.amount_cents || parsed.amount_cents || null,
							currency: ai.currency || parsed.currency || 'FCFA',
							counterparty_number: ai.counterparty_number || parsed.counterparty_number || null,
							parsed_confidence: Math.max(ai.confidence || 0.85, parsed.parsed_confidence || 0.5),
						};
					}
				}
			} catch (_e) {
				// ignore AI errors; keep regex result
				console.log('Groq AI error, falling back to regex parsing:', _e.message);
			}
		}

		const { data, error } = await supabase
			.from('transactions')
			.upsert(
				[
					{
						sender: normalizedSender,
						message: normalizedMessage,
						timestamp: isoTimestamp,
						fingerprint,
						payment_reference: parsed.payment_reference,
						amount_cents: parsed.amount_cents,
						currency: parsed.currency,
						counterparty_number: parsed.counterparty_number,
						parsed_confidence: parsed.parsed_confidence,
						parsed_at: new Date().toISOString(),
					}
				],
				{ onConflict: 'fingerprint', ignoreDuplicates: true }
			)
			.select();

		if (error) {
			console.error('Database error:', error);
			return new Response(
				JSON.stringify({ error: 'Failed to save SMS', details: error.message }),
				{
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				}
			);
		}

		console.log('SMS saved successfully:', data);

		return new Response(
			JSON.stringify({
				success: true,
				message: 'SMS processed successfully',
				data: data?.[0]
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
