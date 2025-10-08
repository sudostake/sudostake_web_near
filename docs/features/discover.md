# Discover open liquidity requests

## TL;DR
- Discover is the marketplace view of every vault that’s currently requesting liquidity.
- Realtime Firestore subscriptions keep the feed live by default; you can fall back to the REST API if you need controlled polling.
- Token chips and search filters let lenders focus on the requests that match their mandate without reloading the page.
- Before funding an offer, make sure your wallet is registered with the token and keep [Track lender positions](./lender-positions.md) open to monitor the loan.

## What you see
- A card for each pending request including vault ID, token, amount, estimated APR, collateral health buffer, and remaining time.
- Status nudges such as “Register storage” or “Funded recently” so lenders know what to do next.
- A link on every card that opens the vault detail view for deeper diligence before funding.

## How data loads
1. The page queries the `pending_liquidity_requests` view in Firestore.
2. When `NEXT_PUBLIC_PENDING_USE_API=false` (default) we subscribe to Firestore in realtime so new requests appear instantly.
3. When `NEXT_PUBLIC_PENDING_USE_API=true` we poll `GET /api/view_pending_liquidity_requests` on an interval—useful when you need deterministic caching or rate limiting.

## REST endpoint (optional)
```
GET /api/view_pending_liquidity_requests?factory_id=<factoryId>&limit=<n>
```
- `factory_id` is required and must match an approved factory.
- `limit` is optional (max 500) and lets you trim the list for embeds or dashboards.

## Where to look in the code
- `utils/data/pending.ts` — chooses between realtime Firestore and REST polling.
- `app/api/view_pending_liquidity_requests/route.ts` — REST handler with basic guards and parameter validation.
- `utils/db/vaults.ts` — Firestore helpers keyed by factory ID.

## Tips for everyday use
- Use the token chips to focus on assets you actively lend; the count badge shows how many requests remain after filtering.
- When you’re ready to lend, open the vault link and follow [Fund a liquidity request](../guides/fund-liquidity-request.md) to complete the transfer safely.
- If a card disappears, it filled or expired—refresh to confirm and check your lender dashboard for the resulting position.

