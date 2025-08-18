export class MuanaPayClient {
	constructor(cfg) {
		if (!cfg || !cfg.supabaseUrl || !cfg.anonKey) {
			throw new Error('supabaseUrl and anonKey are required');
		}
		this.supabaseUrl = cfg.supabaseUrl.replace(/\/+$/, '');
		this.anonKey = cfg.anonKey;
	}

	async sendSms({ sender, message, timestamp }) {
		if (!sender || !message) throw new Error('sender and message are required');
		let isoTs;
		if (timestamp instanceof Date) isoTs = timestamp.toISOString();
		else if (typeof timestamp === 'string' || typeof timestamp === 'number') isoTs = new Date(timestamp).toISOString();

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

	async verifyTransaction({ userId, paymentReference, planId, planName, amountCents }) {
		const res = await fetch(`${this.supabaseUrl}/functions/v1/verify-transaction`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.anonKey}`,
			},
			body: JSON.stringify({
				user_id: userId,
				payment_reference: paymentReference,
				plan_id: planId,
				plan_name: planName,
				amount_cents: amountCents,
			}),
		});
		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(`verify-transaction failed: ${res.status} ${text}`);
		}
		return res.json();
	}
}


