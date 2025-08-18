export type MuanaConfig = {
	supabaseUrl: string;
	anonKey: string;
};

export type SendSmsInput = {
	sender: string;
	message: string;
	timestamp?: string | number | Date;
};

export type VerifyTxnInput = {
	userId: string;
	paymentReference: string;
	planId?: string;
	planName?: string;
	amountCents?: number;
};

export class MuanaPayClient {
	private supabaseUrl: string;
	private anonKey: string;

	constructor(cfg: MuanaConfig) {
		if (!cfg?.supabaseUrl || !cfg?.anonKey) {
			throw new Error('supabaseUrl and anonKey are required');
		}
		this.supabaseUrl = cfg.supabaseUrl.replace(/\/+$/, '');
		this.anonKey = cfg.anonKey;
	}

	async sendSms(input: SendSmsInput) {
		const { sender, message, timestamp } = input || ({} as SendSmsInput);
		if (!sender || !message) throw new Error('sender and message are required');

		const isoTs =
			timestamp instanceof Date
				? timestamp.toISOString()
			: typeof timestamp === 'string' || typeof timestamp === 'number'
			? new Date(timestamp).toISOString()
			: undefined;

		const res = await fetch(`${this.supabaseUrl}/functions/v1/filter-sms`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.anonKey}`,
			},
			body: JSON.stringify({ sender, message, timestamp: isoTs }),
		});
		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(`filter-sms failed: ${res.status} ${text}`);
		}
		return res.json();
	}

	async verifyTransaction(input: VerifyTxnInput) {
		const res = await fetch(`${this.supabaseUrl}/functions/v1/verify-transaction`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.anonKey}`,
			},
			body: JSON.stringify({
				user_id: input.userId,
				payment_reference: input.paymentReference,
				plan_id: input.planId,
				plan_name: input.planName,
				amount_cents: input.amountCents,
			}),
		});
		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(`verify-transaction failed: ${res.status} ${text}`);
		}
		return res.json() as Promise<{ status: 'verified' | 'rejected'; subscription?: unknown }>; 
	}
}


