## Muana Pay SDK (drop-in)

This folder provides a minimal, dependency-free SDK to integrate Muana Pay with any project. It assumes you deploy the two Edge Functions and the `public.transactions` table.

### What you get
- `index.ts`: TypeScript SDK with `sendSms` and `verifyTransaction` methods
- `index.js`: Plain JS version for quick copy-paste
- `sql/setup_transactions.sql`: Table, RLS, and indexes required by the Edge Functions
- `edge/filter-sms/index.ts`: Edge Function source to deploy
- `edge/verify-transaction/index.ts`: Edge Function source to deploy

### Prerequisites
- Edge Function `filter-sms` deployed with env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- Edge Function `verify-transaction` deployed with env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Run the SQL in `sql/setup_transactions.sql` on your Supabase project
 - (Optional) AI-assisted parsing: set `GROQ_API_KEY` to improve extraction when regex fails
### Deploy Edge Functions (copy these files into your Supabase functions)

Copy the files:
- `edge/filter-sms/index.ts` → `supabase/functions/filter-sms/index.ts`
- `edge/verify-transaction/index.ts` → `supabase/functions/verify-transaction/index.ts`

Then deploy (from your project root):
```bash
supabase functions deploy filter-sms
supabase functions deploy verify-transaction
```

Set env vars in Supabase dashboard or via CLI:
```bash
supabase functions set filter-sms SUPABASE_URL=... SUPABASE_ANON_KEY=...
supabase functions set verify-transaction SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
```

### Optional: AI-assisted parsing with Groq
The `filter-sms` function first tries regex to extract `payment_reference`, `amount_cents`, etc. If missing, it can optionally call Groq to improve parsing.

Enable by adding `GROQ_API_KEY` to the `filter-sms` function env. If not set, the function simply skips AI and keeps regex output.

```bash
# Add to filter-sms environment (recommended)
supabase functions set filter-sms GROQ_API_KEY=your_groq_api_key

# Or remove if you want to disable
supabase functions unset filter-sms GROQ_API_KEY
```

Notes:
- Without `GROQ_API_KEY`, everything works (regex only). AI is a best-effort fallback.
- The SQL already includes columns like `parsed_confidence` and `parsed_at` used by this feature.


Notes:
- Muana Android App will POST incoming SMS to `filter-sms` using your Supabase URL + anon key (no Android native code needed).
- Your web/app server should call `verify-transaction` when a user pastes their payment reference on the Pricing page.

### Usage (TypeScript / ESM, Vite + React)
```ts
import { MuanaPayClient } from './index'; // adjust path to where you copy the SDK

const muana = new MuanaPayClient({
  // In Vite, use import.meta.env with VITE_*
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
});

// 1) (optional) If you need to post SMS from a web/other source
await muana.sendSms({
  sender: '+22890000000',
  message: 'Transfert de 1500 FCFA ID: ABC123',
  timestamp: Date.now(),
});

// 2) Pricing verification (user pastes payment reference from SMS)
const result = await muana.verifyTransaction({
  userId: 'USER_UUID',
  paymentReference: 'ABC123',
  // Pass either planId (recommended) or planName. If none, include amountCents.
  planId: 'your-plan-uuid',
  // planName: 'Starter',
  // amountCents: 1500,
});

if (result.status === 'verified') {
  // activate plan in your UI
}
```

### Usage (Plain JS, Vite + React)
```js
import { MuanaPayClient } from './index.js';

const muana = new MuanaPayClient({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
});
const out = await muana.verifyTransaction({ userId, paymentReference, planName });
```

### API
- `new MuanaPayClient({ supabaseUrl: string, anonKey: string })`
- `sendSms({ sender: string, message: string, timestamp?: string|number|Date })` → POST to `/functions/v1/filter-sms`
- `verifyTransaction({ userId: string, paymentReference: string, planId?: string, planName?: string, amountCents?: number })` → POST to `/functions/v1/verify-transaction`

Recommended:
- Use `planId` from your own `plans` table for exact match.
- If you can’t pass a plan, provide `amountCents` so the function can create a pending transaction and validate amount vs plan later.

### SQL Setup
Run `sql/setup_transactions.sql` on your Supabase database. It creates `public.transactions` with the columns used by the Edge Functions and permissive RLS policies for insert/select.

### Security
- `filter-sms` is called with the anon key from Muana Android. The RLS policy on `transactions` is permissive to allow inserts.
- `verify-transaction` must use the service role key in Edge env (not exposed to clients).
- In your Vite app, define `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` files.

Example `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```


