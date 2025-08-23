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

		const payload: MuanaValidationPayload = await req.json();

		console.log('Received Muana validation request:', payload);

		// Validate required fields
		if (!payload.transaction_id || !payload.amount || !payload.status) {
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
			transaction_id: payload.transaction_id.trim(),
			amount: Number(payload.amount),
			currency: payload.currency || 'FCFA',
			status: payload.status.toLowerCase(),
			provider: payload.provider || 'muana',
			metadata: payload.metadata || {},
			timestamp: payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString(),
			validation_type: payload.validation_type || 'pre_validation',
		};

		// Perform comprehensive validation
		const validationResult = await performValidation(normalizedData, supabase);

		// Log validation result
		console.log('Validation result:', validationResult);

		// Save validation record to database
		const { data: validationRecord, error: dbError } = await supabase
			.from('muana_validations')
			.insert([
				{
					transaction_id: normalizedData.transaction_id,
					validation_type: normalizedData.validation_type,
					is_valid: validationResult.isValid,
					errors: validationResult.errors,
					warnings: validationResult.warnings,
					recommendations: validationResult.recommendations,
					risk_score: validationResult.risk_score,
					validated_at: new Date().toISOString(),
					metadata: normalizedData.metadata,
				}
			])
			.select()
			.single();

		if (dbError) {
			console.error('Database error saving validation:', dbError);
			// Continue even if we can't save the validation record
		}

		// Return validation result
		return new Response(
			JSON.stringify({
				success: true,
				transaction_id: normalizedData.transaction_id,
				validation: validationResult,
				validation_record_id: validationRecord?.id,
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

// Perform comprehensive validation of Muana transaction
async function performValidation(transaction: any, supabase: any): Promise<ValidationResult> {
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

	if (transaction.amount > 500000) {
		recommendations.push('Large transaction - consider additional verification');
		riskScore += 20;
	}

	// 3. Status validation
	const validStatuses = ['pending', 'completed', 'failed', 'cancelled', 'processing'];
	if (!validStatuses.includes(transaction.status)) {
		errors.push('Invalid transaction status');
		riskScore += 35;
	}

	if (transaction.status === 'failed' || transaction.status === 'cancelled') {
		warnings.push(`Transaction status indicates ${transaction.status} state`);
		riskScore += 20;
	}

	// 4. Provider validation
	if (transaction.provider !== 'muana') {
		warnings.push(`Unexpected provider: ${transaction.provider}`);
		riskScore += 15;
	}

	// 5. Timestamp validation
	const transactionDate = new Date(transaction.timestamp);
	const now = new Date();
	const hoursDiff = (now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60);
	
	if (hoursDiff > 24) {
		warnings.push(`Transaction timestamp is ${Math.round(hoursDiff)} hours old`);
		riskScore += 25;
	}

	if (hoursDiff < 0) {
		errors.push('Transaction timestamp is in the future');
		riskScore += 50;
	}

	// 6. Historical pattern analysis
	const historicalAnalysis = await analyzeHistoricalPatterns(transaction, supabase);
	
	if (historicalAnalysis.suspiciousPattern) {
		warnings.push('Suspicious transaction pattern detected');
		riskScore += 30;
	}

	if (historicalAnalysis.frequencyAlert) {
		warnings.push('High frequency of transactions detected');
		riskScore += 20;
	}

	// 7. Metadata validation
	if (transaction.metadata) {
		const metadataValidation = validateMetadata(transaction.metadata);
		errors.push(...metadataValidation.errors);
		warnings.push(...metadataValidation.warnings);
		riskScore += metadataValidation.riskScore;
	}

	// 8. Risk score calculation and categorization
	riskScore = Math.min(100, Math.max(0, riskScore));

	// Generate recommendations based on risk score
	if (riskScore > 70) {
		recommendations.push('High risk transaction - manual review recommended');
		recommendations.push('Consider additional verification steps');
	} else if (riskScore > 40) {
		recommendations.push('Medium risk transaction - enhanced monitoring recommended');
	} else if (riskScore > 20) {
		recommendations.push('Low risk transaction - standard processing');
	} else {
		recommendations.push('Very low risk transaction - fast track processing');
	}

	// Final validation result
	const isValid = errors.length === 0 && riskScore < 80;

	return {
		isValid,
		errors,
		warnings,
		recommendations,
		risk_score: riskScore,
	};
}

// Analyze historical transaction patterns
async function analyzeHistoricalPatterns(transaction: any, supabase: any) {
	try {
		const now = new Date();
		const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
		const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

		// Check for high frequency transactions
		const { data: recentTransactions } = await supabase
			.from('muana_transactions')
			.select('id, amount, timestamp')
			.gte('timestamp', oneHourAgo.toISOString())
			.eq('provider', transaction.provider);

		const { data: dailyTransactions } = await supabase
			.from('muana_transactions')
			.select('id, amount, timestamp')
			.gte('timestamp', oneDayAgo.toISOString())
			.eq('provider', transaction.provider);

		const suspiciousPattern = recentTransactions && recentTransactions.length > 10;
		const frequencyAlert = dailyTransactions && dailyTransactions.length > 100;

		return {
			suspiciousPattern,
			frequencyAlert,
			recentCount: recentTransactions?.length || 0,
			dailyCount: dailyTransactions?.length || 0,
		};
	} catch (error) {
		console.error('Error analyzing historical patterns:', error);
		return {
			suspiciousPattern: false,
			frequencyAlert: false,
			recentCount: 0,
			dailyCount: 0,
		};
	}
}

// Validate transaction metadata
function validateMetadata(metadata: any) {
	const errors: string[] = [];
	const warnings: string[] = [];
	let riskScore = 0;

	// Check for suspicious metadata patterns
	if (metadata.user_agent && metadata.user_agent.includes('bot')) {
		warnings.push('Bot user agent detected');
		riskScore += 15;
	}

	if (metadata.ip_address) {
		// Basic IP validation (could be enhanced with geolocation)
		const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		if (!ipPattern.test(metadata.ip_address)) {
			warnings.push('Invalid IP address format');
			riskScore += 10;
		}
	}

	if (metadata.device_id && metadata.device_id.length < 10) {
		warnings.push('Suspicious device ID format');
		riskScore += 15;
	}

	// Check for missing critical metadata
	if (!metadata.ip_address) {
		warnings.push('Missing IP address information');
		riskScore += 10;
	}

	if (!metadata.user_agent) {
		warnings.push('Missing user agent information');
		riskScore += 10;
	}

	return {
		errors,
		warnings,
		riskScore,
	};
}
