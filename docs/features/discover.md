# Discover open liquidity requests

## TL;DR
- The Discover page is the public window into vaults that are currently asking for liquidity.
- By default it streams updates live from Firestore. You can flip an env flag to switch to the REST API if you prefer scheduled polling.
- Sorting and filtering are lightweight on the client so the page stays fast even on slower devices.
- New to lending? Register your wallet with the token first and keep [Track lender positions](./lender-positions.md) open in another tab once you fund an offer.

## What you see
- A card for each pending request: vault name, requested token, amount, interest, collateral, and time remaining.
- Helpful nudges such as “Requires token registration” when a lender needs to prepare their account.
- Quick links to learn more about the vault before funding it.

## How data loads
1. The page reads from the `pending_liquidity_requests` view inside Firestore.
2. When `NEXT_PUBLIC_PENDING_USE_API=false` (default) we subscribe in realtime, so new requests appear immediately.
3. When `NEXT_PUBLIC_PENDING_USE_API=true` we call `GET /api/view_pending_liquidity_requests` on an interval—use this mode if you want to cache responses or throttle reads.

## REST endpoint (optional)
```
GET /api/view_pending_liquidity_requests?factory_id=<factoryId>&limit=<n>
```
- `factory_id` is required and must match an approved factory.
- `limit` is optional (max 500) and lets you trim the list for embeds or dashboards.

## Where to look in the code
- `utils/data/pending.ts` — wrapper that decides between realtime Firestore and REST polling.
- `app/api/view_pending_liquidity_requests/route.ts` — the REST handler with basic guards.
- `utils/db/vaults.ts` — helpers that query Firestore collections by factory.

## Tips for everyday use
- Use Discover to compare offers quickly: we highlight annualised interest so you can skim.
- Ready to lend? Follow [Fund a liquidity request](../guides/fund-liquidity-request.md) from the vault page linked on each card.
- If a request disappears after funding, it either filled or expired; refresh to confirm and check your lender dashboard for the new position.
