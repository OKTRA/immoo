// @ts-nocheck
/* eslint-disable */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MuanaPayload {
	transaction_id?: string;
	amount?: number;
	currency?: string;
	status?: string;
	provider?: string;
	metadata?: any;
	timestamp?: string;
}

interface OrangeMoneySMSPayload {
	sender: string;
	message: string;
	timestamp?: string;
}

type PayloadType = MuanaPayload | OrangeMoneySMSPayload;

Deno.serve(async (req) => {
	// Handle CORS preflight requests
	if (req.method === 'OPTIONS') {
		return new Response(null, { headers: corsHeaders });
	}

	try {
		// Initialize Supabase client with service role for bypassing RLS
		const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
		const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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

		const payload: PayloadType = await req.json();

		console.log('Received payload:', payload);

		// Detect payload type and process accordingly
		if (isOrangeMoneySMS(payload)) {
			return await processOrangeMoneySMS(payload as OrangeMoneySMSPayload, supabase);
		} else if (isMuanaTransaction(payload)) {
			return await processMuanaTransaction(payload as MuanaPayload, supabase);
		} else {
			return new Response(
				JSON.stringify({ error: 'Invalid payload format. Expected Muana transaction or Orange Money SMS' }),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				}
			);
		}

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

// Detect if payload is Orange Money SMS
function isOrangeMoneySMS(payload: PayloadType): payload is OrangeMoneySMSPayload {
	return 'sender' in payload && 'message' in payload && 
		   (payload as any).sender === 'OrangeMoney';
}

// Detect if payload is Muana transaction
function isMuanaTransaction(payload: PayloadType): payload is MuanaPayload {
	return 'transaction_id' in payload && 'amount' in payload && 'status' in payload;
}

// Process Orange Money SMS
async function processOrangeMoneySMS(smsPayload: OrangeMoneySMSPayload, supabase: any) {
	try {
		const { sender, message, timestamp } = smsPayload;

		console.log('Processing Orange Money SMS:', { sender, message, timestamp });

		// Parse SMS message to extract transaction details
		const parsedData = parseOrangeMoneySMS(message);
		
		if (!parsedData) {
			return new Response(
				JSON.stringify({ 
					success: false, 
					message: 'Failed to parse Orange Money SMS',
					error: 'Unsupported SMS format'
				}),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				}
			);
		}

		// Create fingerprint for deduplication
		const fingerprint = await crypto.subtle
			.digest('SHA-256', new TextEncoder().encode(`${parsedData.reference}|${timestamp}`))
			.then((buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join(''));

		// Save to database using muana_sms table
		const { data, error } = await supabase
			.from('muana_sms')
			.upsert(
				[
					{
						sender: sender,
						message: message,
						timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
						fingerprint: fingerprint,
						payment_reference: parsedData.reference,
						amount_cents: parsedData.amount || null, // Use amount as is
						currency: parsedData.currency,
						counterparty_number: parsedData.senderNumber,
						parsed_confidence: 0.8, // High confidence for Orange Money parsing
						payment_status: 'sms_received',
						metadata: {
							transaction_type: parsedData.transactionType,
							original_amount: parsedData.amount,
							parsed_at: new Date().toISOString()
						}
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

		console.log('Orange Money SMS saved successfully:', data);

		return new Response(
			JSON.stringify({
				success: true,
				message: 'Orange Money SMS processed successfully',
				data: {
					reference: parsedData.reference,
					amount: parsedData.amount,
					currency: parsedData.currency,
					sender_number: parsedData.senderNumber,
					transaction_type: parsedData.transactionType,
				}
			}),
			{
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			}
		);

	} catch (error: any) {
		console.error('Error processing Orange Money SMS:', error);
		return new Response(
			JSON.stringify({
				error: 'Failed to process Orange Money SMS',
				details: error?.message
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			}
		);
	}
}

// Parse Orange Money SMS message
function parseOrangeMoneySMS(message: string) {
	try {
		// Pattern for "Vous avez recu un transfert de X FCFA du Y. ID: Z"
		const transferPattern = /Vous avez recu un transfert de (\d+)\s*(FCFA|XOF|USD)\s*du\s*(\+?\d+).*?ID:\s*([A-Z0-9.\-]+)/i;
		
		const match = message.match(transferPattern);
		
		if (match) {
			return {
				amount: parseInt(match[1]),
				currency: match[2],
				senderNumber: match[3],
				reference: match[4],
				transactionType: 'transfer_received'
			};
		}

		// Pattern for other transaction types (can be extended)
		const otherPatterns = [
			// Add more patterns as needed
		];

		return null;
	} catch (error) {
		console.error('Error parsing SMS:', error);
		return null;
	}
}

// Process Muana transaction (existing logic)
async function processMuanaTransaction(transactionPayload: MuanaPayload, supabase: any) {
	try {
		// Validate required fields
		if (!transactionPayload.transaction_id || !transactionPayload.amount || !transactionPayload.status) {
			return new Response(
				JSON.stringify({ error: 'Missing required fields: transaction_id, amount, or status' }),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				}
			);
		}

		// Normalize data
		const normalizedData = {
			transaction_id: transactionPayload.transaction_id.trim(),
			amount: Number(transactionPayload.amount),
			currency: transactionPayload.currency || 'FCFA',
			status: transactionPayload.status.toLowerCase(),
			provider: transactionPayload.provider || 'muana',
			metadata: transactionPayload.metadata || {},
			timestamp: transactionPayload.timestamp ? new Date(transactionPayload.timestamp).toISOString() : new Date().toISOString(),
		};

		// Validate amount
		if (!Number.isFinite(normalizedData.amount) || normalizedData.amount <= 0) {
			return new Response(
				JSON.stringify({ error: 'Invalid amount value' }),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				}
			);
		}

		// Validate status
		const validStatuses = ['pending', 'completed', 'failed', 'cancelled', 'processing'];
		if (!validStatuses.includes(normalizedData.status)) {
			return new Response(
				JSON.stringify({ error: 'Invalid status value' }),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				}
			);
		}

		// Create a unique fingerprint for deduplication
		const fingerprint = await crypto.subtle
			.digest('SHA-256', new TextEncoder().encode(`${normalizedData.transaction_id}|${normalizedData.timestamp}`))
			.then((buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join(''));

		// Filter and process the transaction based on business rules
		const filteredResult = await filterTransaction(normalizedData, supabase);

		// Save to database if it passes filters using muana_sms table
		if (filteredResult.shouldProcess) {
			const { data, error } = await supabase
				.from('muana_sms')
				.upsert(
					[
						{
							sender: normalizedData.provider,
							message: `Muana transaction: ${normalizedData.transaction_id}`,
							timestamp: normalizedData.timestamp,
							fingerprint,
							payment_reference: normalizedData.transaction_id,
							amount_cents: normalizedData.amount, // Use amount as is
							currency: normalizedData.currency,
							payment_status: normalizedData.status,
							parsed_confidence: 1.0, // Full confidence for direct Muana data
							metadata: {
								...normalizedData.metadata,
								filtered_at: new Date().toISOString(),
								processing_notes: filteredResult.notes,
								transaction_type: 'muana_direct'
							}
						}
					],
					{ onConflict: 'fingerprint', ignoreDuplicates: false }
				)
				.select();

			if (error) {
				console.error('Database error:', error);
				return new Response(
					JSON.stringify({ error: 'Failed to save transaction', details: error.message }),
					{
						status: 500,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					}
				);
			}

			console.log('Transaction saved successfully:', data);
		}

		return new Response(
			JSON.stringify({
				success: true,
				message: 'Transaction processed successfully',
				filtered: filteredResult.shouldProcess,
				notes: filteredResult.notes,
				data: filteredResult.shouldProcess ? normalizedData : null
			}),
			{
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			}
		);

	} catch (error: any) {
		console.error('Error processing Muana transaction:', error);
		return new Response(
			JSON.stringify({
				error: 'Failed to process Muana transaction',
				details: error?.message
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			}
		);
	}
}

// Filter transaction based on business rules
async function filterTransaction(transaction: any, supabase: any) {
	const notes: string[] = [];
	let shouldProcess = true;

	// Rule 1: Check if transaction already exists
	const { data: existingTransaction } = await supabase
		.from('muana_sms')
		.select('id, payment_status')
		.eq('payment_reference', transaction.transaction_id)
		.single();

	if (existingTransaction) {
		notes.push(`Transaction ${transaction.transaction_id} already exists with status: ${existingTransaction.payment_status}`);
		// Only process if status has changed
		if (existingTransaction.payment_status === transaction.status) {
			shouldProcess = false;
			notes.push('Status unchanged, skipping processing');
		} else {
			notes.push('Status changed, updating transaction');
		}
	}

	// Rule 2: Amount validation
	if (transaction.amount < 100) {
		notes.push('Amount below minimum threshold (100 FCFA)');
		shouldProcess = false;
	}

	if (transaction.amount > 1000000) {
		notes.push('Amount above maximum threshold (1,000,000 FCFA)');
		shouldProcess = false;
	}

	// Rule 3: Status-based filtering
	if (transaction.status === 'failed' || transaction.status === 'cancelled') {
		notes.push(`Transaction status is ${transaction.status}, may require manual review`);
		// Still process failed transactions for audit purposes
	}

	// Rule 4: Provider validation
	if (transaction.provider !== 'muana') {
		notes.push(`Unexpected provider: ${transaction.provider}`);
		// Still process but flag for review
	}

	// Rule 5: Currency validation
	if (transaction.currency !== 'FCFA' && transaction.currency !== 'XOF' && transaction.currency !== 'USD') {
		notes.push(`Unsupported currency: ${transaction.currency}`);
		shouldProcess = false;
	}

	// Rule 6: Timestamp validation (reject transactions older than 24 hours)
	const transactionDate = new Date(transaction.timestamp);
	const now = new Date();
	const hoursDiff = (now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60);
	
	if (hoursDiff > 24) {
		notes.push(`Transaction timestamp is ${Math.round(hoursDiff)} hours old, may be stale`);
		// Still process but flag for review
	}

	return {
		shouldProcess,
		notes: notes.join('; ')
	};
}
